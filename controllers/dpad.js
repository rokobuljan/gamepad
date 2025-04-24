import { Controller } from "./controller.js";

/**
 * Gamepad - DPad Controller 
 * Author: https://github.com/rokobuljan/ 
 */

import { elNew } from "../utils.js";

class DPad extends Controller {

    constructor(options) {
        options.type = "dpad";
        options.directionsTot = 4;
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

            const x_pos = this.radius * Math.cos(this.angleDirection) + this.radius;
            const y_pos = this.radius * Math.sin(this.angleDirection) + this.radius;
            this.elHandle.style.left = `${x_pos}px`;
            this.elHandle.style.top = `${y_pos}px`;

        } else if (this.axis === "x") {

            this.value = Math.max(Math.min(this.x_diff / this.radius, 1), -1);

            const x_pos = this.value * this.radius + this.radius;
            this.elHandle.style.left = `${x_pos}px`;

        } else if (this.axis === "y") {

            this.value = Math.max(Math.min(-this.y_diff / this.radius, 1), -1);

            const y_pos = -this.value * this.radius + this.radius;
            this.elHandle.style.top = `${y_pos}px`;
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
            className: "Gamepad-dpad-handle"
        });

        const stylesGP = {
            "--border": "2px",
            "box-sizing": "content-box",
            "transform": "translate(-50%, -50%)",
            "position": "absolute",
            "font-size": "50px",
            "display": "inline-flex",
            "justify-content": "center",
            "align-items": "center",
            "user-select": "none",
            "min-width": "100px",
            "height": "100px",
            "color": "rgba(255, 255, 255, 0.5)",
            border: "none",
        };
        const stylesGPxy = {
            "box-shadow": "inset 0 0 0 var(--border) currentcolor",
            "width": "100px",
            "height": "50px",
            "border-radius": "10px",
            "--shape": "calc(25% + (var(--border) / 2)) 0, calc(75% - (var(--border) / 2)) 0, calc(75% - (var(--border) / 2)) 100%, calc(25% - (var(--border) / 2)) 100%, calc(25% + (var(--border) / 2)) 100%, 25% 0",
            "clip-path": "polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, var(--shape)) content-box",
        };
        const stylesGPy = {
            "rotate": "90deg",
            "position": "absolute",
        };
        const stylesGPHandle = {
            "position": "absolute",
            "top": "50%",
            "left": "50%",
            "width": "50px",
            "height": "50px",
            "background": "currentcolor",
            "color": "inherit",
            "transform": "inherit",
            "borderRadius": "50%",
        };

        const elX = elNew("div", {
            className: "Gamepad-dpad-x",
        });
        const elY = elNew("div", {
            className: "Gamepad-dpad-y",
        });

        Object.assign(this.el.style, stylesGP);
        Object.assign(elX.style, stylesGPxy);
        Object.assign(elY.style, stylesGPxy, stylesGPy);
        Object.assign(this.elHandle.style, stylesGPHandle);
        this.el.style.setProperty("--border", stylesGP["--border"]);
        elX.style.setProperty("--shape", stylesGPxy["--shape"]);
        elY.style.setProperty("--shape", stylesGPxy["--shape"]);

        this.el.append(elX, elY, this.elHandle);
    }
}

export { DPad };
