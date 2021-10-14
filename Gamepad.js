/**
 * Gamepad
 */

import { Button } from "./controllers/button.js";
import { Joystick } from "./controllers/joystick.js";

const _controllers = { button: Button, joystick: Joystick }

class Gamepad {
    constructor(controllers) {
        this.controllers = {};
        this.touches = {}; // identifier ID : touch evt
        this.init(controllers);
    }

    vibrate(vibrationPattern) {
        navigator.vibrate(vibrationPattern);
    }

    destroyOne(id) {
        // Destroy one
        if (id && this.controllers.hasOwnProperty(id)) {
            this.controllers[id].destroy();
            delete this.controllers[id];
        }
    }

    destroy(id) {
        if (id) return this.destroyOne(id);
        Object.keys(this.controllers).forEach((id) => 
            this.destroyOne(id)
        );
    }

    init(controllers) {
        Object.entries(controllers).forEach(([id, options]) => {
            const controller = new _controllers[options.type](id, options);
            this.controllers[id] = controller;
        });
    }
}

export { Gamepad };