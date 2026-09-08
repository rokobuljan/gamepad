import { Controller } from "./controller.js";

/**
 * Gamepad - DPad Controller 
 * Author: https://github.com/rokobuljan/ 
 */

import { elNew } from "../utils.js";

class DPad extends Controller {

    constructor(options) {
        options.type = "dpad";
        options.fixed = true;
        // options.deadZone = this.axis === "all" ? 0.2 : 0; // Inactive center, as a fraction of the radius
        super(options);
        if (options.deadzone === undefined) {
            this.deadZone = this.axis === "all" ? 0.2 : 0;
        }
    }

    onStart() {
        super.onStart();

        this.update();
    }

    onMove() {
        super.onMove();

        this.update();
    }

    onEnd() {
        super.onEnd();
        if (!this.spring) return;

        this.value = 0;
        this.highlight();

        this.onInput();
    }

    update() {
        this.value = this.distanceDrag > this.radius * this.deadZone ? 1 : 0;
        this.highlight();
        this.onInput();
    }

    highlight() {
        const x = this.value ? Math.round(Math.cos(this.angleDirection)) : 0;
        const y = this.value ? Math.round(Math.sin(this.angleDirection)) : 0;
        const gradient = (side) => side
            ? `linear-gradient(to ${side < 0 ? "right" : "left"}, currentColor 0%, currentColor 50%, transparent 50%, transparent 100%)`
            : "none";

        this.elX.style.backgroundImage = gradient(x);
        // The Y arm is rotated 90 degrees: its left side points up.
        this.elY.style.backgroundImage = gradient(y);
    }

    init() {
        super.init();

        const stylesGP = {
            "--border": "2px",
            "box-sizing": "content-box",
            "transform": "translate(-50%, -50%)",
            "position": "absolute",
            "justify-content": "center",
            "align-items": "center",
            "user-select": "none",
            "width": `${this.radius * (this.axis === "y" ? 1 : 2)}px`,
            "min-width": `${this.radius * (this.axis === "y" ? 1 : 2)}px`,
            "height": `${this.radius * (this.axis === "x" ? 1 : 2)}px`,
            "border": "none",
        };
        const stylesGPxy = {
            "box-shadow": "inset 0 0 0 var(--border) currentcolor",
            "width": `${this.radius * 2}px`,
            "height": `${this.radius}px`,
            "border-radius": "10px",
            "--shape": "calc(25% + (var(--border) / 2)) 0, calc(75% - (var(--border) / 2)) 0, calc(75% - (var(--border) / 2)) 100%, calc(25% - (var(--border) / 2)) 100%, calc(25% + (var(--border) / 2)) 100%, 25% 0",
            "clip-path": this.axis === "all"
                ? "polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, var(--shape)) content-box"
                : "none",
        };
        const stylesGPy = {
            "rotate": "90deg",
            "position": "absolute",
        };

        const elX = this.elX = elNew("div", {
            className: "Gamepad-dpad-x",
        });
        const elY = this.elY = elNew("div", {
            className: "Gamepad-dpad-y",
        });

        Object.assign(this.el.style, stylesGP);
        Object.assign(elX.style, stylesGPxy);
        Object.assign(elY.style, stylesGPxy, stylesGPy);
        if (this.axis === "y") elX.style.display = "none";
        if (this.axis === "x") elY.style.display = "none";
        this.el.style.setProperty("--border", stylesGP["--border"]);
        elX.style.setProperty("--shape", stylesGPxy["--shape"]);
        elY.style.setProperty("--shape", stylesGPxy["--shape"]);

        this.el.append(elX, elY);
        this.highlight();
    }
}

export { DPad };
