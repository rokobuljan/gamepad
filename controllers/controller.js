/**
 * Gamepad - Base Controller
 * Author: https://github.com/rokobuljan/ 
 */

import { el, elNew, norm, TAU } from "../utils.js";

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
            angleDirection: 0, // 0=right, like angle but capped by direction
            direction: 0, // int, directions (for joystick and dpad) 0=right, clockwise
            directionsTot: 8, // Subdivide circle to 8 direction regions
            x_start: 0,
            y_start: 0,
            x_diff: 0,
            y_diff: 0,
            distanceDrag: 0,
            onInput() { },
        }, options, {
            pointerId: null, // Touch finger pointerId
            elEventStarter: null,
            isInitialized: false,
        });
        this.style = {
            color: "hsla(0, 90%, 100%, 0.5)",
            border: "2px solid currentColor",
            ...this.style
        };
        this.isTouchMovable = this.type === "joystick" || this.type === "dpad";

        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
    }

    onInit() { }
    onStart() { }
    onMove() { }
    onEnd() { }

    _noDefault(evt) {
        evt.preventDefault();
    }

    // Get relative mouse coordinates 
    getPointerXY(evt) {
        const { clientX, clientY } = evt;
        const { left, top } = this.elParent.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top
        };
    }

    handleStart(evt) {
        // Is already assigned? Do nothing
        if (this.isTouchMovable && this.pointerId) return;
        this.pointerId = evt.pointerId;

        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.isTouchMovable && evt.target.closest(".Gamepad-Button")) return;

        evt.preventDefault();
        this.elEventStarter.setPointerCapture(evt.pointerId);

        const { x, y } = this.getPointerXY(evt);

        this.isPress = true;
        this.isActive = this.spring ? true : !this.isActive;

        this.x_start = x;
        this.y_start = y;

        if (!this.fixed) {
            this.elAnchor.style.left = `${this.x_start}px`;
            this.elAnchor.style.top = `${this.y_start}px`;
        }

        this.el.classList.toggle("is-active", this.isTouchMovable ? this.isPress : this.isActive);

        this.onStart();
    }

    handleMove(evt) {
        if (this.isTouchMovable && evt.pointerId !== this.pointerId) return;

        evt.preventDefault();

        const { x, y } = this.getPointerXY(evt);

        this.isDrag = true;
        this.x_drag = x;
        this.y_drag = y;
        this.x_diff = this.x_drag - this.x_start;
        this.y_diff = this.y_drag - this.y_start;
        this.distanceDrag = Math.min(this.radius, Math.sqrt(this.x_diff * this.x_diff + this.y_diff * this.y_diff));

        // Finally set the angle (normalized)
        this.angle = norm(Math.atan2(this.y_diff, this.x_diff));
        this.direction = Math.round(this.angle / (TAU / this.directionsTot)) % this.directionsTot; // Normalize to 0-7
        this.angleDirection = TAU * this.direction / this.directionsTot; // Angle of the direction

        this.onMove();
    }

    handleEnd(evt) {

        // If touch was not registered on touch-start - do nothing
        if (evt.pointerId !== this.pointerId) return;

        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.isTouchMovable && evt.target.closest(".Gamepad-Button")) return;

        this.elParent.releasePointerCapture(evt.pointerId);

        this.pointerId = null;
        this.isDrag = false;
        this.isPress = false;
        if (this.spring) this.isActive = false;

        this.el.classList.toggle("is-active", this.isTouchMovable ? this.isPress : this.isActive);

        this.onEnd();
    }

    init() {
        if (this.isInitialized) {
            this.destroy();
        }

        this.isInitialized = true;
        this.pointerId = null;

        this.elParent = el(this.parent);
        this.elAnchor = elNew("div", {
            className: "Gamepad-anchor"
        });
        this.el = elNew("div", {
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
        Object.assign(this.elAnchor.style, {
            position: "absolute",
            width: "0",
            height: "0",
            userSelect: "none",
            touchAction: "none",
            ...this.position
        });

        // Add styles - Controller
        Object.assign(this.el.style, styles);

        // Insert Elements to DOM
        this.elAnchor.append(this.el);
        this.elParent.append(this.elAnchor);

        // Events
        this.elEventStarter = this.fixed ? this.el : this.elParent;

        this.elEventStarter.addEventListener("pointerdown", this.handleStart, { passive: false });
        if (this.isTouchMovable) this.elEventStarter.addEventListener("pointermove", this.handleMove, { passive: false });
        this.elEventStarter.addEventListener("pointerup", this.handleEnd);
        this.elEventStarter.addEventListener("pointercancel", this.handleEnd);
        this.elEventStarter.addEventListener("contextmenu", this._noDefault);

        this.onInit();
    }

    destroy() {
        this.isInitialized = false;
        this.pointerId = null;

        // Events
        this.elEventStarter.removeEventListener("pointerdown", this.handleStart, { passive: false });
        if (this.isTouchMovable) this.elEventStarter.removeEventListener("pointermove", this.handleMove, { passive: false });
        this.elEventStarter.removeEventListener("pointerup", this.handleEnd);
        this.elEventStarter.removeEventListener("pointercancel", this.handleEnd);
        this.elEventStarter.removeEventListener("contextmenu", this._noDefault);

        // Remove element from DOM
        this.elAnchor.remove();
    }
}

export { Controller };
