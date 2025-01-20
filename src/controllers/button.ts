import { Controller, ControllerOptions } from "./controller";

/**
 * Gamepad - Button Controller
 */

export class Button extends Controller {
    constructor(options: ControllerOptions) {
        super(options, "button");
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
