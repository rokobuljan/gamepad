/**
 * Gamepad
 */

import { Button } from "./Button.js";
import { Joystick } from "./Joystick.js";

const _controllers = { button: Button, joystick: Joystick }

class Gamepad {
    constructor(controllers) {
        this.controllers = {};
        this.init(controllers);
    }

    init(controllers) {
        Object.entries(controllers).forEach(([id, options]) => {
            const controller = new _controllers[options.type](id, options);
            this.controllers[id] = controller;
            console.log(this.controllers[id]);
        });
    }

    // Destroy specific or all controllers

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
}

export { Gamepad };