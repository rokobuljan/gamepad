import { Controller } from "./controller";
import { ControllerOptions } from "./ControllerOptions";
import { createElement } from "./utils";

/**
 * Gamepad - Joystick Controller
 */

export class Joystick extends Controller {
    elementKnob: HTMLElement;
    constructor(options: ControllerOptions) {
        super({ ...options }, "joystick");

        // Add Handle to this Controller
        this.elementKnob = createElement("div", {
            className: "Gamepad-joystick-knob",
        });
    }

    onStart() {
        super.onStart();
        this.state.value = 0;
        this.state.apiCompliantAxisXValue = 0;
        this.state.apiCompliantAxisYValue = 0;
        this.onInput();
    }

    onMove() {
        super.onMove();

        if (this.options.axis === "all") {
            this.state.value = this.state.dragDistance / this.options.radius;

            const x_pos =
                this.state.dragDistance * Math.cos(this.state.angle) +
                this.options.radius;
            const y_pos =
                this.state.dragDistance * Math.sin(this.state.angle) +
                this.options.radius;

            /**
             * As per official API we need a value between -1.0 to 1.0 per axis
             * Hint: dragging the controller top left will be [-.74, -.74] (_not_ [-1, -1]),
             * because the joystick is contained by the ring.
             */
            this.state.apiCompliantAxisXValue =
                (x_pos - this.options.radius) / this.options.radius;

            this.state.apiCompliantAxisYValue =
                (y_pos - this.options.radius) / this.options.radius;

            this.elementKnob.style.left = `${x_pos}px`;
            this.elementKnob.style.top = `${y_pos}px`;
        }

        if (this.options.axis === "x") {
            this.state.value = Math.max(
                Math.min(this.state.x_diff / this.options.radius, 1),
                -1
            );

            const x_pos =
                this.state.value * this.options.radius + this.options.radius;
            this.elementKnob.style.left = `${x_pos}px`;
        }

        if (this.options.axis === "y") {
            this.state.value = Math.max(
                Math.min(-this.state.y_diff / this.options.radius, 1),
                -1
            );

            const y_pos =
                -this.state.value * this.options.radius + this.options.radius;
            this.elementKnob.style.top = `${y_pos}px`;
        }

        this.onInput();
    }

    onEnd() {
        super.onEnd();

        if (!this.options.spring) {
            return;
        }

        this.state.value = 0;
        this.state.apiCompliantAxisXValue = 0;
        this.state.apiCompliantAxisYValue = 0;
        this.elementKnob.style.left = `50%`;
        this.elementKnob.style.top = `50%`;

        this.onInput();
    }

    init() {
        super.init();

        const styles: Partial<CSSStyleDeclaration> = {
            position: "absolute",
            top: "50%",
            left: "50%",
            width: `${this.options.radius * 2 * 0.5}px`,
            height: `${this.options.radius * 2 * 0.5}px`,
            background: "currentColor",
            color: "inherit",
            transform: "inherit",
            borderRadius: "inherit",
        };

        Object.assign(this.elementKnob.style, styles);
        this.gamepadControllerElement.append(this.elementKnob);
    }
}
