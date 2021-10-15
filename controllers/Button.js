import { Controller } from "./controller.js";

/**
 * Gamepad
 * 
 * Button Controller 
 */

const ELNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
const EL = (sel, PAR) => (PAR || document).querySelector(sel);

class Button extends Controller {
    constructor(id, options) {
        super("Button", id, options);
        this.init();
    }

    onDown() {
        super.onDown();

        this.value = 1;

        this.onInput();
    }

    onUp() {
        super.onUp();

        this.value = 0;
        
        this.onInput();
    }

    init() {
        super.init();
    }

    destroy() {
        this.el.remove();
    }
}

export { Button };
