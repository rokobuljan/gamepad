/**
 * Gamepad
 */

import { Button } from "./controllers/Button.js";
import { Joystick } from "./controllers/Joystick.js";

const _controllers = { button: Button, joystick: Joystick }


// const EL_log = EL("#log");
// const lg = (msg) => {
//     console.log(msg);
//     EL_log.innerHTML = `<br>JSK: ${JSON.stringify(msg)} ${EL_log.innerHTML}`;
// }



// // Check if is touchable device
// const touchable = 'createTouch' in document;

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
            const controller = new _controllers[options.type](id, {...options, Gamepad: this});
            this.controllers[id] = controller;
            console.log(this.controllers[id]);
        });
    }
}

export { Gamepad };