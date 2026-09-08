import { Controller } from "./controller.js";

/**
 * Gamepad - Joystick Controller 
 * Author: https://github.com/rokobuljan/ 
 */

import { elNew } from "../utils.js";

/** Analog touch joystick, optionally constrained to a single axis. */
class Joystick extends Controller {

    /**
     * Movable handle owned by this joystick.
     * @internal
     * @type {HTMLDivElement | null}
     */
    #elHandle = null;

    /**
     * @param {import("./controller.js").ControllerOptions} [options={}] Joystick configuration.
     */
    constructor(options = {}) {
        options.type = "joystick";
        super(options);
    }

    /**
     * Reset the output on press and notify onInput.
     * @protected
     * @override
     * @returns {void}
     */
    onStart() {
        super.onStart();

        this.value = 0;

        this.onInput();
    }

    /**
     * Update the analog value and handle position, then notify onInput.
     * @protected
     * @override
     * @returns {void}
     */
    onMove() {
        super.onMove();
        if (!this.#elHandle) return;

        if (this.axis === "all") {

            this.value = this.distanceDrag / this.radius;

            const xPos = this.distanceDrag * Math.cos(this.angle) + this.radius;
            const yPos = this.distanceDrag * Math.sin(this.angle) + this.radius;
            this.#elHandle.style.left = `${xPos}px`;
            this.#elHandle.style.top = `${yPos}px`;

        } else if (this.axis === "x") {

            this.value = Math.max(Math.min(this.xDiff / this.radius, 1), -1);

            const xPos = this.value * this.radius + this.radius;
            this.#elHandle.style.left = `${xPos}px`;

        } else if (this.axis === "y") {

            this.value = Math.max(Math.min(-this.yDiff / this.radius, 1), -1);
            
            const yPos = -this.value * this.radius + this.radius;
            this.#elHandle.style.top = `${yPos}px`;

        }

        this.onInput();
    }

    /**
     * Recenter a spring joystick on release and notify onInput.
     * @protected
     * @override
     * @returns {void}
     */
    onEnd() {
        super.onEnd();
        if (!this.spring || !this.#elHandle) return;

        this.value = 0;
        this.#elHandle.style.left = `50%`;
        this.#elHandle.style.top = `50%`;

        this.onInput();
    }

    /**
     * Initialize the controller and create its movable handle.
     * @override
     * @returns {void}
     */
    init() {
        super.init();
        if (!this.el) return;

        // Add Handle to this Controller
        /**
         * Movable handle, available after init().
         * @type {HTMLDivElement}
         */
        this.#elHandle = elNew("div", {
            className: "Gamepad-joystick-handle"
        });

        const styles = {
            position: "absolute",
            top: "50%",
            left: "50%",
            width: `${this.radius * 2 * 0.5}px`,
            height: `${this.radius * 2 * 0.5}px`,
            background: "currentColor",
            color: "inherit",
            transform: "inherit",
            borderRadius: "inherit",
        };

        Object.assign(this.#elHandle.style, styles);
        this.el.append(this.#elHandle);
    }

    /**
     * Remove the controller and release its private handle reference.
     * @override
     * @returns {void}
     */
    destroy() {
        super.destroy();
        this.#elHandle = null;
    }
}

export { Joystick };
