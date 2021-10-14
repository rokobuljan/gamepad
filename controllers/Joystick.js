import { Controller } from "./controller.js";

/**
 * Gamepad
 * 
 * Joystick Controller 
 */

const ELNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
const EL = (sel, PAR) => (PAR || document).querySelector(sel);

class Joystick extends Controller {

    constructor(id, options) {
        super("Joystick", id, options);
        this.init();
    }

    onDown(evt) {
        super.onDown(evt);

        this.el.style.left = `${this.x_start}px`;
        this.el.style.top = `${this.y_start}px`;
        this.el_handle.style.left = `50%`;
        this.el_handle.style.top = `50%`;
        this.onInput(evt);
    }

    onDrag(evt) {
        super.onDrag(evt);

        if (this.axis === "all") {

            this.value = this.distance_drag / this.radius;

            const x_pos = this.distance_drag * Math.cos(this.angle) + this.radius;
            const y_pos = this.distance_drag * Math.sin(this.angle) + this.radius;
            this.el_handle.style.left = `${x_pos}px`;
            this.el_handle.style.top = `${y_pos}px`;

        } else if (this.axis === "x") {

            this.value = Math.max(Math.min(x_diff / this.radius, 1), -1);

            const x_pos = this.value * this.radius + this.radius;
            this.el_handle.style.left = `${x_pos}px`;

        } else if (this.axis === "y") {

            this.value = Math.max(Math.min(-y_diff / this.radius, 1), -1);

            const y_pos = -this.value * this.radius + this.radius;
            this.el_handle.style.top = `${y_pos}px`;

        }

        this.onInput(evt);
    }

    onUp(evt) {
        super.onUp(evt);

        this.value = 0;
        this.onInput(evt);

        this.el_handle.style.left = `50%`;
        this.el_handle.style.top = `50%`;
    }

    init() {
        super.init();

        // Add Handle to this Controller
        this.el_handle = ELNew("div", { className: "Gamepad-Joystick-handle" });
        this.el_handle.style.cssText = `width: ${this.radius * 2 * 0.6}px; height: ${this.radius * 2 * 0.6}px;`;
        this.el.append(this.el_handle);
    }

    destroy() {

    }
}

export { Joystick };
