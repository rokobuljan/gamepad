import { Controller } from "./controller.js";

/**
 * Gamepad - Button Controller 
 * Author: https://github.com/rokobuljan/ 
 */

/** Touch button with a 0/1 value; spring: false makes it a toggle. */
class Button extends Controller {
    /**
     * @param {import("./controller.js").ControllerOptions} options Button configuration.
     */
    constructor(options) {
        options.type = "button";
        super(options);
    }

    /**
     * Set the pressed/toggled value and notify onInput.
     * @protected
     * @override
     * @returns {void}
     */
    onStart() {
        super.onStart();

        this.value = this.spring ? 1 : this.isActive ? 1 : 0;
        
        this.onInput();
    }
    
    /**
     * Reset a spring button on release and notify onInput.
     * @protected
     * @override
     * @returns {void}
     */
    onEnd() {
        super.onEnd();

        if (!this.spring) return;
        this.value = 0;

        this.onInput();
    }
}

export { Button };
