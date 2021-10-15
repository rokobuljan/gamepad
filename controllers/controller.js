/**
 * Gamepad
 * 
 * Base Controller
 */

const ELNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
const EL = (sel, PAR) => (PAR || document).querySelector(sel);

const isTouchable = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0);

const pointer = {
    down: "touchstart",
    up: "touchend",
    move: "touchmove",
    cancel: "touchcancel"
};

class Controller {
    constructor(type, id, options) {
        Object.assign(this, {
            parent: "body",
            axis: "all",
            radius: 50,
            text: "",
            position: { top: "50%", left: "50%" }, // For the wrapper .Gamepad-Controller
            reposition: false, // If the controller should reposition at Touch Down coordinates
            style: {}, // Styles
            onInput() { },
        }, options, {
            type,
            id,
            value: 0,
            angle: 0,
            wasTouched: false,
            isDrag: false,
            isDown: false,
            identifier: -1, // Touch finger identifier,
            evtTouch: null,
        });
        this.isJoystick = this.type === "Joystick";
    }

    onDown() { }
    onMove() { }
    onUp() { }

    // Get relative mouse coordinates 
    getMouseXY(evt) {
        const { clientX, clientY } = evt;
        const { left, top } = this.el_parent.getBoundingClientRect();
        return { x: clientX - left, y: clientY - top };
    }

    handleDown(evt) {

        // Is already assigned? Do nothing
        if (this.isDown || this.identifier > -1) return;
        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.isJoystick && evt.target.closest(".Gamepad-Button")) return;

        // Get the first pointer that touched
        const tou = evt.changedTouches[0];
        if (!tou) return;

        const { x, y } = this.getMouseXY(tou);

        this.identifier = tou.identifier;
        this.x_start = x;
        this.y_start = y;
        this.isDown = true;
        this.wasTouched = true;

        if (this.reposition) {
            this.el_controller.style.left = `${this.x_start}px`;
            this.el_controller.style.top = `${this.y_start}px`;
        }

        this.onDown();
    }

    handleMove(evt) {
        evt.preventDefault();

        if (!this.isDown || this.identifier < 0) return;

        const tou = [...evt.changedTouches].filter(ev => ev.identifier === this.identifier)[0];
        if (!tou) return;

        const { x, y } = this.getMouseXY(tou);

        this.isDrag = true;
        this.x_drag = x;
        this.y_drag = y;
        this.x_diff = this.x_drag - this.x_start;
        this.y_diff = this.y_drag - this.y_start;
        this.distance_drag = Math.min(this.radius, Math.sqrt(this.x_diff * this.x_diff + this.y_diff * this.y_diff));
        this.angle = Math.atan2(this.y_diff, this.x_diff);

        this.onMove();
    }

    handleUp(evt) {
        if (this.identifier < 0) return;
        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.isJoystick && evt.target.closest(".Gamepad-Button")) return;

        const tou = [...evt.changedTouches].filter(ev => ev.identifier === this.identifier)[0];
        if (!tou) return;

        this.identifier = -1;
        this.isDrag = false;
        this.isDown = false;

        this.onUp();
    }

    init() {

        this.el_parent = EL(this.parent);
        this.el_controller = ELNew("div", { className: "Gamepad-Controller" });
        this.el = ELNew("div", {
            id: this.id,
            textContent: this.text,
            className: `Gamepad-${this.type} axis-${this.axis}`,
        });

        // Styles depending on controller type/axis
        const stylesByType = {
            all: { width: `${this.radius * 2}px`, height: `${this.radius * 2}px` },
            x: { width: `${this.radius * 2}px`, height: `6px` },
            y: { height: `${this.radius * 2}px`, width: `6px` },
        };
        const styles = {
            // Styles by controller type
            ...stylesByType[this.axis],
            // Default styles
            fontSize: `${this.radius}px`,
            borderRadius: `${this.radius}px`,
            // Override previous with user-defined styles
            ...this.style
        };

        // Add styles
        Object.assign(this.el_controller.style, {
            position: "absolute",
            width: "0",
            height: "0",
            userSelect: "none",
            ...this.position
        });
        Object.assign(this.el.style, styles);

        // Insert Elements
        this.el_controller.append(this.el);
        this.el_parent.append(this.el_controller);

        // Events

        this.handleDown = this.handleDown.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleUp = this.handleUp.bind(this);

        const el_evt_starter = this.isJoystick ? this.el_parent : this.el;
        el_evt_starter.addEventListener(pointer.down, this.handleDown, { passive: false });
        this.el_parent.addEventListener(pointer.move, this.handleMove, { passive: false });
        this.el_parent.addEventListener(pointer.up, this.handleUp);
        this.el_parent.addEventListener(pointer.cancel, this.handleUp);
        this.el_parent.addEventListener("contextmenu", (evt) => evt.preventDefault());
    }

    destroy() {
        const el_evt_starter = this.isJoystick ? this.el_parent : this.el;
        el_evt_starter.removeEventListener(pointer.down, this.handleDown, { passive: false });
        this.el_parent.removeEventListener(pointer.move, this.handleMove, { passive: false });
        this.el_parent.removeEventListener(pointer.up, this.handleUp);
        this.el_parent.removeEventListener(pointer.cancel, this.handleUp);
        this.el_controller.remove();
    }
}

export { Controller };
