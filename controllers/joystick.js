import { Controller } from "./controller.js";

/**
 * Gamepad
 * 
 * Joystick Controller 
 */

const ELNew = (tag, prop) => Object.assign(document.createElement(tag), prop);

class Joystick extends Controller {

    constructor(id, options) {
        super(id, options, "Joystick");
        this.init();
    }

    onStart() {
        super.onStart();

        this.value = 0;

        this.onInput();
    }

    onMove() {
        super.onMove();

        if (this.axis === "all") {

            this.value = this.distance_drag / this.radius;

            const x_pos = this.distance_drag * Math.cos(this.angle) + this.radius;
            const y_pos = this.distance_drag * Math.sin(this.angle) + this.radius;
            this.el_handle.style.left = `${x_pos}px`;
            this.el_handle.style.top = `${y_pos}px`;

        } else if (this.axis === "x") {

            this.value = Math.max(Math.min(this.x_diff / this.radius, 1), -1);

            const x_pos = this.value * this.radius + this.radius;
            this.el_handle.style.left = `${x_pos}px`;

        } else if (this.axis === "y") {

            this.value = Math.max(Math.min(-this.y_diff / this.radius, 1), -1);

            const y_pos = -this.value * this.radius + this.radius;
            this.el_handle.style.top = `${y_pos}px`;

        }

        this.onInput();
    }

    onEnd() {
        super.onEnd();
        if (!this.spring) return;

        this.value = 0;
        this.el_handle.style.left = `50%`;
        this.el_handle.style.top = `50%`;

        this.onInput();
    }

    init() {
        super.init();

        // Add Handle to this Controller
        this.el_handle = ELNew("div", { className: "Gamepad-Controller Gamepad-Joystick-handle" });
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
        Object.assign(this.el_handle.style, styles);

        this.el.append(this.el_handle);
    }

    destroy() {
        super.destroy.call(this);
    }
}

export { Joystick };
