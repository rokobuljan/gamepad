import { Controller, ControllerType, ControllerOptions } from "./controller";

/**
 * Gamepad - Button Controller
 * Author: https://github.com/rokobuljan/
 */

export class Button extends Controller {
    constructor(options: ControllerOptions, parentElement: HTMLElement) {
        super(options, ControllerType.button, parentElement);
    }

    onStart() {
        super.onStart();

        this.state.value = this.options.spring
            ? 1
            : this.state.isActive
            ? 1
            : 0;

        this.onInput();
    }

    onEnd() {
        super.onEnd();

        if (!this.options.spring) {
            return;
        }

        this.state.value = 0;

        this.onInput();
    }
}
