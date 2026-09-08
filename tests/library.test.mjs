import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { Button, DPad, Gamepad, Joystick } from "../gamepad.js";

// Minimal DOM/event fixture: interactions go through registered listeners,
// never through the classes' private handlers or rendering fields.
class TestElement extends EventTarget {
    children = [];
    parentElement = null;
    className = "";
    style = { setProperty(name, value) { this[name] = value; } };
    classList = { toggle() {} };
    captures = new Set();

    append(...elements) {
        for (const element of elements) {
            element.parentElement = this;
            this.children.push(element);
        }
    }

    remove() {
        if (this.parentElement) {
            const siblings = this.parentElement.children;
            siblings.splice(siblings.indexOf(this), 1);
            this.parentElement = null;
        }
    }

    closest(selector) {
        return this.className.split(" ").includes(selector.slice(1))
            ? this : this.parentElement?.closest(selector) ?? null;
    }

    getBoundingClientRect() {
        return { left: 0, top: 0, width: 100, height: 100 };
    }

    setPointerCapture(id) { this.captures.add(id); }
    releasePointerCapture(id) { this.captures.delete(id); }
}

let parent;
let windowEvents;
let fullscreenRequests;
let globals;

beforeEach(() => {
    globals = new Map(["Element", "document", "addEventListener", "removeEventListener"]
        .map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
    parent = new TestElement();
    windowEvents = new EventTarget();
    fullscreenRequests = 0;
    globalThis.Element = TestElement;
    globalThis.document = {
        createElement: () => new TestElement(),
        querySelector: selector => selector === "#missing" ? null : parent,
        documentElement: { requestFullscreen() { fullscreenRequests++; } },
    };
    globalThis.addEventListener = windowEvents.addEventListener.bind(windowEvents);
    globalThis.removeEventListener = windowEvents.removeEventListener.bind(windowEvents);
});

afterEach(() => {
    for (const [name, descriptor] of globals) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
    }
});

function pointer(element, type, x = 50, y = 50, id = 1, target = element) {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { pointerId: id, clientX: x, clientY: y });
    Object.defineProperty(event, "target", { value: target });
    element.dispatchEvent(event);
    return event;
}

function controllerElement() {
    return parent.children.at(-1).children[0];
}

test("standalone controllers generate stable IDs and initialize without options", () => {
    const ids = new Set();
    for (const Controller of [Button, Joystick, DPad]) {
        for (const controller of [new Controller(), new Controller({}), new Controller({ id: undefined }), new Controller({ id: "" })]) {
            const id = controller.id;
            assert.equal(typeof id, "string");
            assert.ok(id.length > 0);
            assert.equal(ids.has(id), false);
            ids.add(id);
            controller.init();
            assert.equal(controllerElement().id, id);
            controller.destroy();
            controller.init();
            assert.equal(controller.id, id);
            assert.equal(controllerElement().id, id);
            controller.destroy();
        }
    }
    assert.equal(parent.children.length, 0);
});

test("gamepads manage anonymous and named controllers independently", () => {
    const values = [];
    const button = new Button({ onInput() { values.push([this.id, this.value]); } });
    const gamepad = new Gamepad([{}, { type: "button" }, { type: "dpad" }, { id: "fire", type: "button" }, button]);
    const otherGamepad = new Gamepad([{}, { type: "dpad" }]);
    const controllers = [...Object.values(gamepad.controllers), ...Object.values(otherGamepad.controllers)];
    assert.equal(controllers.length, 7);
    assert.equal(new Set(controllers.map(controller => controller.id)).size, 7);
    assert.equal(gamepad.controllers.fire.id, "fire");
    assert.equal(gamepad.controllers[button.id], button);
    const buttonElement = parent.children.map(anchor => anchor.children[0]).find(element => element.id === button.id);
    pointer(buttonElement, "pointerdown");
    pointer(buttonElement, "pointerup");
    assert.deepEqual(values, [[button.id, 1], [button.id, 0]]);
    const anonymous = Object.values(gamepad.controllers)[0];
    gamepad.remove(anonymous.id, button);
    assert.equal(gamepad.controllers[anonymous.id], undefined);
    assert.equal(gamepad.controllers[button.id], undefined);
    assert.equal(Object.keys(gamepad.controllers).length, 3);
    assert.equal(Object.keys(otherGamepad.controllers).length, 2);
    gamepad.destroy();
    otherGamepad.destroy();
    assert.equal(parent.children.length, 0);
});

test("internal members are absent from the public object and prototype chain", () => {
    const controllers = [new Button({ id: "button" }), new Joystick({ id: "stick" }), new DPad({ id: "pad" })];
    for (const controller of controllers) {
        for (const name of ["handleStart", "handleMove", "handleEnd", "_noDefault", "elParent", "elAnchor", "elHandle", "elX", "elY", "update", "highlight"]) {
            assert.equal(name in controller, false, name);
        }
    }
    assert.equal("handleFullscreen" in new Gamepad(), false);
});

test("button listeners retain their receiver, toggle state and detach on reinitialization/destroy", () => {
    const values = [];
    const button = new Button({ id: "fire", spring: false, onInput() { values.push(this.value); } });
    button.init();
    const oldElement = controllerElement();
    pointer(oldElement, "pointerdown");
    pointer(oldElement, "pointerup");
    assert.equal(button.value, 1);
    pointer(oldElement, "pointerdown");
    pointer(oldElement, "pointerup");
    assert.equal(button.value, 0);
    assert.deepEqual(values, [1, 0]);
    assert.equal(pointer(oldElement, "contextmenu").defaultPrevented, true);

    button.init();
    assert.equal(parent.children.length, 1);
    pointer(oldElement, "pointerdown");
    assert.deepEqual(values, [1, 0]);
    const currentElement = controllerElement();
    pointer(currentElement, "pointerdown");
    assert.deepEqual(values, [1, 0, 1]);
    button.destroy();
    button.destroy();
    assert.equal(parent.children.length, 0);
    pointer(currentElement, "pointerdown");
    assert.deepEqual(values, [1, 0, 1]);
    assert.equal(pointer(currentElement, "contextmenu").defaultPrevented, false);
});

test("joystick private listeners track only the captured pointer and reset on cancellation", () => {
    const stick = new Joystick({ id: "move", axis: "x" });
    stick.init();
    const element = controllerElement();
    pointer(element, "pointerdown");
    pointer(element, "pointermove", 100, 50, 2);
    assert.equal(stick.value, 0);
    pointer(element, "pointermove", 100, 50);
    assert.equal(stick.value, 1);
    pointer(element, "pointerup", 100, 50, 2);
    assert.equal(stick.value, 1);
    assert.equal(stick.isPress, true);
    assert.equal(element.children[0].style.left, "100px");
    pointer(element, "pointercancel");
    assert.equal(stick.value, 0);
    assert.equal(stick.isPress, false);
    assert.equal(element.children[0].style.left, "50%");
    stick.destroy();
    stick.init();
    assert.equal(controllerElement().children.length, 1);
});

test("buttons sharing a parent retain independent captured pointers", () => {
    const first = new Button({ id: "first" });
    const second = new Button({ id: "second" });
    first.init();
    const firstElement = controllerElement();
    second.init();
    const secondElement = controllerElement();
    pointer(firstElement, "pointerdown", 50, 50, 1);
    pointer(secondElement, "pointerdown", 50, 50, 2);
    pointer(firstElement, "pointerdown", 50, 50, 2);
    pointer(firstElement, "pointerup", 50, 50, 2);
    assert.equal(first.value, 1);
    assert.equal(second.value, 1);
    pointer(firstElement, "pointerup", 50, 50, 1);
    assert.equal(first.value, 0);
    assert.equal(second.value, 1);
    pointer(secondElement, "pointerup", 50, 50, 2);
    assert.equal(second.value, 0);
});

test("gamepad destruction removes all controllers sharing a parent", () => {
    const gamepad = new Gamepad([{ id: "first" }, { id: "second", type: "button" }]);
    assert.equal(parent.children.length, 2);
    gamepad.destroy();
    assert.equal(parent.children.length, 0);
    assert.deepEqual(Object.keys(gamepad.controllers), []);
});

test("D-pad private rendering preserves dead zones, directions and release highlights", () => {
    const pad = new DPad({ id: "pad", deadZone: 0.3 });
    pad.init();
    const element = controllerElement();
    pointer(element, "pointerdown", 60, 50);
    assert.equal(pad.value, 0);
    pointer(element, "pointermove", 100, 50);
    assert.equal(pad.value, 1);
    assert.equal(pad.direction, 0);
    assert.match(element.children[0].style.backgroundImage, /^linear-gradient/);
    pointer(element, "pointerup");
    assert.equal(pad.value, 0);
    assert.equal(element.children[0].style.backgroundImage, "none");
    pad.destroy();
    pad.init();
    assert.equal(controllerElement().children.length, 2);
});

test("floating controllers remove listeners from their parent", () => {
    let inputs = 0;
    const stick = new Joystick({ id: "floating", fixed: false, onInput() { inputs++; } });
    stick.init();
    pointer(parent, "pointerdown", 20, 30);
    assert.equal(parent.children[0].style.left, "20px");
    assert.equal(inputs, 1);
    stick.destroy();
    pointer(parent, "pointerdown");
    pointer(parent, "pointermove");
    pointer(parent, "pointerup");
    assert.equal(inputs, 1);
});

test("a floating joystick ignores button presses without reserving their pointer", () => {
    const stick = new Joystick({ id: "move", fixed: false });
    const button = new Button({ id: "fire" });
    stick.init();
    button.init();
    const buttonElement = controllerElement();
    pointer(parent, "pointerdown", 50, 50, 1, buttonElement);
    assert.equal(stick.isPress, false);
    pointer(parent, "pointerdown", 20, 30, 2);
    assert.equal(stick.isPress, true);
    pointer(parent, "pointerup", 20, 30, 2);
    assert.equal(stick.isPress, false);
});

test("protected hooks still dispatch to subclass overrides", () => {
    let starts = 0;
    class CustomButton extends Button {
        onStart() { super.onStart(); starts++; }
    }
    const button = new CustomButton({ id: "custom" });
    button.init();
    pointer(controllerElement(), "pointerdown");
    assert.equal(button.value, 1);
    assert.equal(starts, 1);
});

test("fullscreen listeners belong to individual gamepads", () => {
    const first = new Gamepad().requestFullScreen().requestFullScreen();
    const second = new Gamepad().requestFullScreen();
    windowEvents.dispatchEvent(new Event("click"));
    assert.equal(fullscreenRequests, 2);
    first.destroy();
    windowEvents.dispatchEvent(new Event("click"));
    assert.equal(fullscreenRequests, 3);
    second.destroy();
    windowEvents.dispatchEvent(new Event("click"));
    assert.equal(fullscreenRequests, 3);
});

test("uninitialized controllers can be destroyed and failed initialization can be retried", () => {
    for (const Class of [Button, Joystick, DPad]) {
        const controller = new Class({ id: "retry", parent: "#missing" });
        controller.destroy();
        assert.throws(() => controller.init(), /Parent not found/);
        controller.parent = "body";
        controller.init();
        controller.destroy();
        assert.equal(parent.children.length, 0);
    }
});
