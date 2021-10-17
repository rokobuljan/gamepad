import { Controller } from "./controller.js";

/**
 * Gamepad - Button Controller 
 * Author: https://github.com/rokobuljan/ 
 */

class Button extends Controller {
    constructor(options) {
        options.type = "button";
        super(options);
    }

    onStart() {
        super.onStart();

        this.value = this.spring ? 1 : this.isActive ? 1 : 0;
        
        this.onInput();
    }
    
    onEnd() {
        super.onEnd();

        if (!this.spring) return;
        this.value = 0;

        this.onInput();
    }

    init() {
        super.init();
    }

    destroy() {
        super.destroy();
    }
}

export { Button };
