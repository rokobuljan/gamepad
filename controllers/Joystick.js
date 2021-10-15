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

    onDown() {
        super.onDown();

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

            this.value = Math.max(Math.min(x_diff / this.radius, 1), -1);

            const x_pos = this.value * this.radius + this.radius;
            this.el_handle.style.left = `${x_pos}px`;

        } else if (this.axis === "y") {

            this.value = Math.max(Math.min(-y_diff / this.radius, 1), -1);

            const y_pos = -this.value * this.radius + this.radius;
            this.el_handle.style.top = `${y_pos}px`;

        }

        this.onInput();
    }

    onUp() {
        super.onUp();

        this.value = 0;
        this.el_handle.style.left = `50%`;
        this.el_handle.style.top = `50%`;

        this.onInput();
    }

    init() {
        super.init();

        // Add Handle to this Controller
        this.el_handle = ELNew("div", { className: "Gamepad-Joystick-handle" });
        this.el_handle.style.cssText = `width: ${this.radius * 2 * 0.6}px; height: ${this.radius * 2 * 0.6}px;`;
        this.el.append(this.el_handle);
    }

    destroy() {
        super.destroy.call(this);
    }
}

export { Joystick };
