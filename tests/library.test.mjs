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

function pointer(element, type, x = 50, y = 50, id = 1) {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { pointerId: id, clientX: x, clientY: y });
    element.dispatchEvent(event);
    return event;
}

function controllerElement() {
    return parent.children.at(-1).children[0];
}

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
    assert.equal(element.children[0].style.left, "100px");
    pointer(element, "pointercancel");
    assert.equal(stick.value, 0);
    assert.equal(stick.isPress, false);
    assert.equal(element.children[0].style.left, "50%");
    stick.destroy();
    stick.init();
    assert.equal(controllerElement().children.length, 1);
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
