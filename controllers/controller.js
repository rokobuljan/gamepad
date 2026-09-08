/**
 * Gamepad - Base Controller
 * Author: https://github.com/rokobuljan/ 
 */

import { el, elNew, norm, TAU } from "../utils.js";

/**
 * @typedef {"button" | "joystick" | "dpad"} ControllerType
 * @typedef {"all" | "x" | "y"} ControllerAxis
 * @typedef {Partial<CSSStyleDeclaration> & Record<`--${string}`, string>} ControllerStyle
 * @typedef {(this: Controller) => void} ControllerCallback
 *
 * @typedef {object} ControllerOptions
 * @property {string} id Unique controller ID, also used as its DOM ID.
 * @property {ControllerType} [type="joystick"] Kind created by Gamepad; standalone classes set this themselves.
 * @property {string} [parent="body"] CSS selector of the parent HTML element.
 * @property {ControllerAxis} [axis="all"] Movement axis constraint.
 * @property {number} [radius=50] Radius in pixels.
 * @property {string} [text=""] Controller inner HTML.
 * @property {ControllerStyle} [position] Anchor styles; defaults to top and left at 50%.
 * @property {ControllerStyle} [style] Controller styles, overriding the default border.
 * @property {boolean} [fixed=true] Keep the anchor in place; DPad always forces true.
 * @property {boolean} [spring=true] Reset value and active state on release.
 * @property {number} [deadZone] Inactive radius fraction (0–1); defaults to 0, or 0.2 for an all-axis DPad.
 * @property {number} [directionsTot=8] Number of evenly spaced direction regions.
 * @property {boolean} [isPress=false] Initial pressed state.
 * @property {boolean} [isActive=false] Initial active/toggled state.
 * @property {boolean} [isDrag=false] Initial dragging state.
 * @property {number} [value=0] Initial output value.
 * @property {number} [angle=0] Initial angle in radians.
 * @property {number} [angleDirection=0] Initial snapped angle in radians.
 * @property {number} [direction=0] Initial direction index.
 * @property {number} [xStart=0] Initial pointer origin X relative to the parent, in pixels.
 * @property {number} [yStart=0] Initial pointer origin Y relative to the parent, in pixels.
 * @property {number} [xDrag] Latest pointer X relative to the parent, in pixels.
 * @property {number} [yDrag] Latest pointer Y relative to the parent, in pixels.
 * @property {number} [xDiff=0] Initial horizontal displacement in pixels.
 * @property {number} [yDiff=0] Initial vertical displacement in pixels.
 * @property {number} [distanceDrag=0] Initial drag distance in pixels, capped at the radius.
 * @property {ControllerCallback} [onInput] Called when input updates; `this` is the controller.
 * @property {ControllerCallback} [onInit] Override the initialization hook.
 * @property {ControllerCallback} [onStart] Override the press hook, including subclass input handling.
 * @property {ControllerCallback} [onMove] Override the drag hook, including subclass input handling.
 * @property {ControllerCallback} [onEnd] Override the release hook, including subclass input handling.
 */

/** Shared pointer handling and state for touch controllers. Call init() before use. */
class Controller {

    /** @type {HTMLElement | null} */
    #elEventStarter = null;
    /** @type {number | null} */
    #pointerId = null;
    #isInitialized = false;
    #isTouchMovable = false;
    
    /** Parent HTML element, resolved during init(). @type {HTMLElement | null} */
    elParent = null;

    /** @param {ControllerOptions} options Controller configuration and initial state. */
    constructor(options) {

        if (!options.id) {
            console.error("Gamepad: Controller is missing a unique ID");
            return;
        }

        /** Unique controller and DOM ID. @type {string} */
        this.id = options.id;
        /** Controller kind, set by the concrete subclass. @type {ControllerType | undefined} */
        this.type = options.type;
        /** Parent CSS selector. @type {string} */
        this.parent = "body";
        /** Movement axis constraint. @type {ControllerAxis} */
        this.axis = "all";
        /** Radius in pixels. @type {number} */
        this.radius = 50;
        /** Controller inner HTML. @type {string} */
        this.text = "";
        /** Anchor positioning styles. @type {ControllerStyle} */
        this.position = { top: "50%", left: "50%" };
        /** Whether the anchor stays in place on press. @type {boolean} */
        this.fixed = true;
        /** Whether release resets the controller. @type {boolean} */
        this.spring = true;
        /** Whether a pointer is currently pressing the controller. @type {boolean} */
        this.isPress = false;
        /** Active state; remains toggled when spring is false. @type {boolean} */
        this.isActive = false;
        /** Whether the pointer has moved during a press. @type {boolean} */
        this.isDrag = false;
        /** Inactive center as a fraction of the radius. @type {number} */
        this.deadZone = 0;
        /** Output: 0/1 for buttons and D-pads, 0–1 for all-axis joysticks, -1–1 for single-axis joysticks. @type {number} */
        this.value = 0;
        /** Clockwise angle in radians, normalized to [0, TAU), with 0 pointing right. @type {number} */
        this.angle = 0;
        /** Angle snapped to the current direction region, in radians. @type {number} */
        this.angleDirection = 0;
        /** Clockwise direction index, starting at 0 (right). @type {number} */
        this.direction = 0;
        /** Number of direction regions in a full turn. @type {number} */
        this.directionsTot = 8;
        /** Pointer origin X relative to the parent, in pixels. @type {number} */
        this.xStart = 0;
        /** Pointer origin Y relative to the parent, in pixels. @type {number} */
        this.yStart = 0;
        /** Horizontal displacement from the origin, in pixels. @type {number} */
        this.xDiff = 0;
        /** Vertical displacement from the origin, in pixels. @type {number} */
        this.yDiff = 0;
        /** Drag distance in pixels, capped at the radius. @type {number} */
        this.distanceDrag = 0;
        /** Latest pointer X relative to the parent; set on first press. @type {number | undefined} */
        this.xDrag;
        /** Latest pointer Y relative to the parent; set on first press. @type {number | undefined} */
        this.yDrag;
        /** Input callback, invoked with this controller as its receiver. @type {ControllerCallback} */
        this.onInput = function () { };

        Object.assign(this, options);

        /** Custom controller styles, including the default border. @type {ControllerStyle} */
        this.style = {
            border: "2px solid currentColor",
            ...options.style
        };

        this.#isTouchMovable = this.type === "joystick" || this.type === "dpad";

        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
    }

    /** Hook called after the base DOM and listeners are initialized. @returns {void} */
    onInit() { }
    /** Hook called after pointer press state is updated. @returns {void} */
    onStart() { }
    /** Hook called after pointer movement is calculated. @returns {void} */
    onMove() { }
    /** Hook called after pointer release/cancellation state is updated. @returns {void} */
    onEnd() { }

    /**
     * Prevent native context-menu behavior.
     * @param {Event} evt DOM event.
     * @returns {void}
     */
    _noDefault(evt) {
        evt.preventDefault();
    }

    /**
     * Get pointer coordinates relative to an element's bounding box.
     * @param {PointerEvent} evt Pointer event.
     * @param {Element} el Reference element.
     * @returns {{x: number, y: number}} Coordinates in pixels.
     */
    #getPointerXY(evt, el) {
        const { clientX, clientY } = evt;
        const { left, top } = el.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top
        };
    }

    /**
     * Update pointer displacement, distance, angle and direction.
     * @param {PointerEvent} evt Pointer event.
     * @returns {void}
     */
    #calculate(evt) {
        if (!this.elParent) return;
        const { x, y } = this.#getPointerXY(evt, this.elParent);
        this.xDrag = x;
        this.yDrag = y;
        this.xDiff = this.xDrag - this.xStart;
        this.yDiff = this.yDrag - this.yStart;
        // Single-axis D-pads ignore movement perpendicular to their arm.
        if (this.type === "dpad") {
            if (this.axis === "x") this.yDiff = 0;
            if (this.axis === "y") this.xDiff = 0;
        }
        this.distanceDrag = Math.min(this.radius, Math.sqrt(this.xDiff ** 2 + this.yDiff ** 2));

        // Finally set the angle (normalized)
        this.angle = norm(Math.atan2(this.yDiff, this.xDiff));
        this.direction = Math.round(this.angle / (TAU / this.directionsTot)) % this.directionsTot; // Normalize to 0-7
        this.angleDirection = TAU * this.direction / this.directionsTot; // Angle of the direction
    }

    /**
     * Capture a pointer and update the pressed state.
     * @param {PointerEvent} evt Pointer-down event.
     * @returns {void}
     */
    handleStart(evt) {
        if (!this.elParent || !this.#elEventStarter || !this.el || !this.elAnchor) return;
        // Is already assigned? Do nothing
        if (this.#isTouchMovable && this.#pointerId !== null) return;
        this.#pointerId = evt.pointerId;

        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.#isTouchMovable && evt.target instanceof Element && evt.target.closest(".Gamepad-Button")) return;

        evt.preventDefault();
        this.#elEventStarter.setPointerCapture(this.#pointerId);

        const { x, y } = this.#getPointerXY(evt, this.elParent);

        this.isPress = true;
        this.isActive = this.spring ? true : !this.isActive;

        this.xStart = x;
        this.yStart = y;

        // A D-pad measures presses and drags from its fixed visual center.
        if (this.type === "dpad") {
            const rect = this.el.getBoundingClientRect();
            const parentRect = this.elParent.getBoundingClientRect();
            this.xStart = rect.left + rect.width / 2 - parentRect.left;
            this.yStart = rect.top + rect.height / 2 - parentRect.top;
        }

        this.#calculate(evt);

        if (!this.fixed) {
            this.elAnchor.style.left = `${this.xStart}px`;
            this.elAnchor.style.top = `${this.yStart}px`;
        }

        this.el.classList.toggle("is-active", this.#isTouchMovable ? this.isPress : this.isActive);

        this.onStart();
    }

    /**
     * Update the controller from the captured pointer's movement.
     * @param {PointerEvent} evt Pointer-move event.
     * @returns {void}
     */
    handleMove(evt) {
        if (this.#isTouchMovable && evt.pointerId !== this.#pointerId) return;

        evt.preventDefault();
        this.isDrag = true;

        this.#calculate(evt);

        this.onMove();
    }

    /**
     * Release the captured pointer and update the released state.
     * @param {PointerEvent} evt Pointer-up or pointer-cancel event.
     * @returns {void}
     */
    handleEnd(evt) {
        if (!this.#elEventStarter || !this.el) return;

        // If touch was not registered on touch-start - do nothing
        if (evt.pointerId !== this.#pointerId) return;

        // If a Gamepad Button was touched, don't do anything with the Joystick
        if (this.#isTouchMovable && evt.target instanceof Element && evt.target.closest(".Gamepad-Button")) return;

        this.#elEventStarter.releasePointerCapture(this.#pointerId);

        this.#pointerId = null;
        this.isDrag = false;
        this.isPress = false;
        if (this.spring) this.isActive = false;

        this.el.classList.toggle("is-active", this.#isTouchMovable ? this.isPress : this.isActive);

        this.onEnd();
    }

    /** Create the controller DOM and attach pointer listeners. @returns {void} */
    init() {
        if (this.#isInitialized) {
            this.destroy();
        }

        this.#isInitialized = true;
        this.#pointerId = null;

        this.elParent = el(this.parent);
        if (!this.elParent) throw new Error(`Gamepad: Parent not found: ${this.parent}`);
        /** Anchor element, available after init(). @type {HTMLDivElement} */
        this.elAnchor = elNew("div", {
            className: "Gamepad-anchor"
        });
        /** Visible controller element, available after init(). @type {HTMLDivElement} */
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
        this.#elEventStarter = this.fixed ? this.el : this.elParent;

        this.#elEventStarter.addEventListener("pointerdown", this.handleStart, { passive: false });
        if (this.#isTouchMovable) this.#elEventStarter.addEventListener("pointermove", this.handleMove, { passive: false });
        this.#elEventStarter.addEventListener("pointerup", this.handleEnd);
        this.#elEventStarter.addEventListener("pointercancel", this.handleEnd);
        this.#elEventStarter.addEventListener("contextmenu", this._noDefault);

        this.onInit();
    }

    /** Remove pointer listeners and the controller DOM. @returns {void} */
    destroy() {
        this.#isInitialized = false;
        this.#pointerId = null;

        // Events
        this.#elEventStarter?.removeEventListener("pointerdown", this.handleStart);
        if (this.#isTouchMovable) this.#elEventStarter?.removeEventListener("pointermove", this.handleMove);
        this.#elEventStarter?.removeEventListener("pointerup", this.handleEnd);
        this.#elEventStarter?.removeEventListener("pointercancel", this.handleEnd);
        this.#elEventStarter?.removeEventListener("contextmenu", this._noDefault);

        // Remove element from DOM
        this.elAnchor?.remove();
    }
}

export { Controller };
