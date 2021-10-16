import { Controller } from "./controller.js";

/**
 * Gamepad
 * 
 * Button Controller 
 */

class Button extends Controller {
    constructor(id, options) {
        super(id, options, "Button");
        this.init();
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
