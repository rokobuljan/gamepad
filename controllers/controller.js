/**
 * Gamepad - Base Controller
 * Author: https://github.com/rokobuljan/ 
 */

const ELNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
const EL = (sel, PAR) => (PAR || document).querySelector(sel);

const TAU = Math.PI * 2;
const norm = (rad) => rad - TAU * Math.floor(rad / TAU);

class Controller {
    constructor(options) {

        if (!options.id) return console.error("Gamepad: Controller is missing a unique ID");

        Object.assign(this, {
            parent: "body",
            axis: "all",
            radius: 50,
            text: "",
            position: { top: "50%", left: "50%" }, // For the anchor point
            fixed: true, // Set to false to change controller position on touch-down
            spring: true, // If true will reset/null value on touch-end, if set to false the button will act as a checkbox, or the joystick will not reset
            isPress: false, // true if the controller is currently pressed
            isActive: false, // true if has "is-active" state / className 
            isDrag: false,
            value: 0,
            angle: 0,
            angle_norm: 0,
            x_start: 0,
            y_start: 0,
            x_diff: 0,
            y_diff: 0,
            distance_drag: 0,
            onInput() { },
        }, options, {
            identifier: -1, // Touch finger identifier
            isInitialized: false,
        });
        this.style = {
            color: "hsla(0, 90%, 100%, 0.5)",
            border: "2px solid currentColor",
            ...this.style
        };
        this.isJoystick = this.type === "joystick";
    }

    onStart() { }
    onMove() { }
    onEnd() { }

    _noDefault(evt) {
        evt.preventDefault()
    }

    // Get relative mouse coordinates 
    getPointerXY(evt) {
        const { clientX, clientY } = evt;
        const { left, top } = this.el_parent.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top
        };
    }

    handleStart(evt) {

        // Is already assigned? Do nothing
        if (this.identifier > -1) return;
        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.isJoystick && evt.target.closest(".Gamepad-Button")) return;

        evt.preventDefault();

        this.el_parent.setPointerCapture(evt.pointerId);

        const { x, y } = this.getPointerXY(evt);

        this.isPress = true;
        this.isActive = this.spring ? true : !this.isActive;

        this.identifier = evt.pointerId;
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

        if (!this.el_parent.hasPointerCapture(evt.pointerId) || !this.isPress || this.identifier < 0) return;

        evt.preventDefault();

        const { x, y } = this.getPointerXY(evt);

        this.isDrag = true;
        this.x_drag = x;
        this.y_drag = y;
        this.x_diff = this.x_drag - this.x_start;
        this.y_diff = this.y_drag - this.y_start;
        this.distance_drag = Math.min(this.radius, Math.sqrt(this.x_diff * this.x_diff + this.y_diff * this.y_diff));

        // Finally set the angle (normalized)
        this.angle = norm(Math.atan2(this.y_diff, this.x_diff));
        this.angle_norm = norm(this.angle);
        this.onMove();
    }

    handleEnd(evt) {

        // If touch was not registered on touch-start - do nothing
        if (this.identifier < 0) return;

        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.isJoystick && evt.target.closest(".Gamepad-Button")) return;

        this.el_parent.releasePointerCapture(evt.pointerId);

        this.identifier = -1;
        this.isDrag = false;
        this.isPress = false;
        if (this.spring) this.isActive = false;

        this.el.classList.toggle("is-active", this.isJoystick ? this.isPress : this.isActive);

        this.onEnd();
    }

    init() {

        if (this.isInitialized) this.destroy();
        this.isInitialized = true;

        this.el_parent = EL(this.parent);
        this.el_anchor = ELNew("div", { className: "Gamepad-anchor" });
        this.el = ELNew("div", {
            id: this.id,
            innerHTML: this.text,
            className: `Gamepad-controller Gamepad-${this.type} axis-${this.axis}`,
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
        el_evt_starter.addEventListener("pointerdown", this.handleStart, { passive: false });
        if (this.isJoystick) this.el_parent.addEventListener("pointermove", this.handleMove, { passive: false });
        this.el_parent.addEventListener("pointerup", this.handleEnd);
        this.el_parent.addEventListener("pointercancel", this.handleEnd);
        this.el_parent.addEventListener("contextmenu", this._noDefault);
    }

    destroy() {
        const el_evt_starter = this.isJoystick || !this.fixed ? this.el_parent : this.el;
        el_evt_starter.removeEventListener("pointerdown", this.handleStart, { passive: false });
        if (this.isJoystick) this.el_parent.removeEventListener("pointermove", this.handleMove, { passive: false });
        this.el_parent.removeEventListener("pointerup", this.handleEnd);
        this.el_parent.removeEventListener("pointercancel", this.handleEnd);
        this.el_parent.removeEventListener("contextmenu", this._noDefault);
        this.el_anchor.remove();
    }
}

export { Controller };
