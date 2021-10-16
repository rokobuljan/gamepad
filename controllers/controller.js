/**
 * Gamepad
 * author: https://github.com/rokobuljan/ 
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
    constructor(id, options, type) {
        Object.assign(this, {
            parent: "body",
            axis: "all",
            radius: 50,
            text: "",
            position: { top: "50%", left: "50%" }, // For the anchor point
            fixed: true, // Set to false to change controller position on touch-down
            spring: true, // if true will reset/null value on touch-end, if set to false the button will act as a checkbox, or the joystick will not reset
            style: {
                color: "hsla(360, 100%, 100%, 0.5)",
                border: "2px solid currentColor",
            },
            isPress: false, // true if the controller is currently pressed
            isActive: false, // trie if has "is-active" state / className 
            isDrag: false,
            value: 0,
            angle: 0,
            x_start: 0,
            y_start: 0,
            x_diff: 0,
            y_diff: 0,
            distance_drag: 0,
            onInput() { },
        }, options, {
            type,
            id,
            identifier: -1, // Touch finger identifier
        });
        this.isJoystick = this.type === "Joystick";
    }

    onStart() { }
    onMove() { }
    onEnd() { }

    // Get relative mouse coordinates 
    getMouseXY(evt) {
        const { clientX, clientY } = evt;
        const { left, top } = this.el_parent.getBoundingClientRect();
        return { x: clientX - left, y: clientY - top };
    }

    handleStart(evt) {

        // Is already assigned? Do nothing
        if (this.identifier > -1) return;
        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.isJoystick && evt.target.closest(".Gamepad-Button")) return;
        // Get the first pointer that touched
        const tou = evt.changedTouches[0];
        if (!tou) return;

        const { x, y } = this.getMouseXY(tou);

        this.isPress = true;
        this.isActive = this.spring ? true : !this.isActive;

        this.identifier = tou.identifier;
        this.x_start = x;
        this.y_start = y;

        if (!this.fixed) {
            this.el_anchor.style.left = `${this.x_start}px`;
            this.el_anchor.style.top = `${this.y_start}px`;
        }

        this.el.classList.toggle("is-active", this.isJoystick ? this.isPress : this.isActive);


        this.onStart();
    }

    handleMove(evt) {
        evt.preventDefault();

        if (!this.isPress || this.identifier < 0) return;

        const tou = [...evt.changedTouches].filter(ev => ev.identifier === this.identifier)[0];
        if (!tou) return;

        const { x, y } = this.getMouseXY(tou);

        this.isDrag = true;
        this.x_drag = x;
        this.y_drag = y;
        this.x_diff = this.x_drag - this.x_start;
        this.y_diff = this.y_drag - this.y_start;
        this.distance_drag = Math.min(this.radius, Math.sqrt(this.x_diff * this.x_diff + this.y_diff * this.y_diff));

        // Finally set the angle:
        this.angle = Math.atan2(this.y_diff, this.x_diff);
        this.onMove();
    }

    handleEnd(evt) {

        // If touch was not registered on touch-start - do nothing
        if (this.identifier < 0) return;

        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.isJoystick && evt.target.closest(".Gamepad-Button")) return;

        const tou = [...evt.changedTouches].filter(ev => ev.identifier === this.identifier)[0];
        if (!tou) return;

        this.identifier = -1;
        this.isDrag = false;
        this.isPress = false;
        if (this.spring) this.isActive = false;

        this.el.classList.toggle("is-active", this.isJoystick ? this.isPress : this.isActive);

        this.onEnd();
    }

    init() {

        this.el_parent = EL(this.parent);
        this.el_anchor = ELNew("div", { className: "Gamepad-Anchor" });
        this.el = ELNew("div", {
            id: this.id,
            textContent: this.text,
            className: `Gamepad-Controller Gamepad-${this.type} axis-${this.axis}`,
        });

        // Styles for both Joystick and Button
        const stylesCommon = {
            boxSizing: "content-box",
            transform: "translate(-50%, -50%)",
            position: "absolute",
            fontSize: `${this.radius}px`,
            borderRadius: `${this.radius * 2}px`,
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            userSelect: "none",
        };

        // Styles depending on controller type/axis
        const stylesByAxisType = {
            all: { minWidth: `${this.radius * 2}px`, height: `${this.radius * 2}px` },
            x: { width: `${this.radius * 2}px`, height: `6px` },
            y: { height: `${this.radius * 2}px`, width: `6px` },
        };

        const styles = {
            // Default styles
            ...stylesCommon,
            // Styles by controller Axis type
            ...stylesByAxisType[this.axis],
            // Override with user-defined styles
            ...this.style
        };

        // Add styles - Controller anchor
        Object.assign(this.el_anchor.style, {
            position: "absolute",
            width: "0",
            height: "0",
            userSelect: "none",
            ...this.position
        });

        // Add styles - Controller
        Object.assign(this.el.style, styles);

        // Insert Elements
        this.el_anchor.append(this.el);
        this.el_parent.append(this.el_anchor);

        // Events

        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);

        const el_evt_starter = this.isJoystick || !this.fixed ? this.el_parent : this.el;
        el_evt_starter.addEventListener(pointer.down, this.handleStart, { passive: false });
        this.el_parent.addEventListener(pointer.move, this.handleMove, { passive: false });
        this.el_parent.addEventListener(pointer.up, this.handleEnd);
        this.el_parent.addEventListener(pointer.cancel, this.handleEnd);
        this.el_parent.addEventListener("contextmenu", (evt) => evt.preventDefault());
    }

    destroy() {
        const el_evt_starter = this.isJoystick || !this.fixed ? this.el_parent : this.el;
        el_evt_starter.removeEventListener(pointer.down, this.handleStart, { passive: false });
        this.el_parent.removeEventListener(pointer.move, this.handleMove, { passive: false });
        this.el_parent.removeEventListener(pointer.up, this.handleEnd);
        this.el_parent.removeEventListener(pointer.cancel, this.handleEnd);
        this.el_anchor.remove();
    }
}

export { Controller };
