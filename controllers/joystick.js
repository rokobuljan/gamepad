import { Controller } from "./controller.js";

/**
 * Gamepad - Joystick Controller 
 * Author: https://github.com/rokobuljan/ 
 */

import { elNew } from "../utils.js";

class Joystick extends Controller {

    constructor(options) {
        options.type = "joystick";
        super(options);
    }

    onStart() {
        super.onStart();

        this.value = 0;

        this.onInput();
    }

    onMove() {
        super.onMove();

        if (this.axis === "all") {

            this.value = this.distanceDrag / this.radius;

            const xPos = this.distanceDrag * Math.cos(this.angle) + this.radius;
            const yPos = this.distanceDrag * Math.sin(this.angle) + this.radius;
            this.elHandle.style.left = `${xPos}px`;
            this.elHandle.style.top = `${yPos}px`;

        } else if (this.axis === "x") {

            this.value = Math.max(Math.min(this.xDiff / this.radius, 1), -1);

            const xPos = this.value * this.radius + this.radius;
            this.elHandle.style.left = `${xPos}px`;

        } else if (this.axis === "y") {

            this.value = Math.max(Math.min(-this.yDiff / this.radius, 1), -1);
            
            const yPos = -this.value * this.radius + this.radius;
            this.elHandle.style.top = `${yPos}px`;

        }

        this.onInput();
    }

    onEnd() {
        super.onEnd();
        if (!this.spring) return;

        this.value = 0;
        this.elHandle.style.left = `50%`;
        this.elHandle.style.top = `50%`;

        this.onInput();
    }

    init() {
        super.init();

        // Add Handle to this Controller
        this.elHandle = elNew("div", {
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

        Object.assign(this.elHandle.style, styles);
        this.el.append(this.elHandle);
    }
}

export { Joystick };
