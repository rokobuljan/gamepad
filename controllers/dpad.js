import { Controller } from "./controller.js";

/**
 * Gamepad - DPad Controller 
 * Author: https://github.com/rokobuljan/ 
 */

import { elNew } from "../utils.js";

/** Fixed directional pad with a digital 0/1 value and highlighted direction arms. */
class DPad extends Controller {

    /** @param {import("./controller.js").ControllerOptions} options D-pad configuration; fixed is always true. */
    constructor(options) {
        options.type = "dpad";
        options.fixed = true;
        super(options);
        if (options.deadZone === undefined) {
            this.deadZone = this.axis === "all" ? 0.2 : 0;
        }
    }

    /** Update direction output immediately on press. @returns {void} */
    onStart() {
        super.onStart();

        this.update();
    }

    /** Update direction output while dragging. @returns {void} */
    onMove() {
        super.onMove();

        this.update();
    }

    /** Clear a spring D-pad's value and highlights on release. @returns {void} */
    onEnd() {
        super.onEnd();
        if (!this.spring) return;

        this.value = 0;
        this.highlight();

        this.onInput();
    }

    /** Apply the dead zone, refresh highlights and notify onInput. @returns {void} */
    update() {
        this.value = this.distanceDrag > this.radius * this.deadZone ? 1 : 0;
        this.highlight();
        this.onInput();
    }

    /** Highlight the arms matching the current snapped direction and value. @returns {void} */
    highlight() {
        if (!this.elX || !this.elY) return;
        const x = this.value ? Math.round(Math.cos(this.angleDirection)) : 0;
        const y = this.value ? Math.round(Math.sin(this.angleDirection)) : 0;
        /**
         * @param {number} side Signed arm direction: negative, positive or zero.
         * @returns {string} CSS background-image value.
         */
        const gradient = (side) => side
            ? `linear-gradient(to ${side < 0 ? "right" : "left"}, currentColor 0%, currentColor 50%, transparent 50%, transparent 100%)`
            : "none";

        this.elX.style.backgroundImage = gradient(x);
        // The Y arm is rotated 90 degrees: its left side points up.
        this.elY.style.backgroundImage = gradient(y);
    }

    /** Initialize the controller and create the directional arms. @returns {void} */
    init() {
        super.init();
        if (!this.el) return;

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

        /** Horizontal arm, available after init(). @type {HTMLDivElement} */
        const elX = this.elX = elNew("div", {
            className: "Gamepad-dpad-x",
        });
        /** Vertical arm (rotated 90 degrees), available after init(). @type {HTMLDivElement} */
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
