/**
 * Gamepad
 */

import { Button } from "./controllers/button.js";
import { Joystick } from "./controllers/joystick.js";

const _controllers = { button: Button, joystick: Joystick }

class Gamepad {
    constructor(options) {
        Object.assign(this, {
            fullscreen: false,
            controllers: {},
        }, options);
        this.init();
    }

    vibrate(vibrationPattern) {
        navigator.vibrate(vibrationPattern);
    }

    destroyOne(id) {
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

    init() {
        Object.entries(this.controllers).forEach(([id, options]) => {
            const controllerType = options.type.toLowerCase();
            this.controllers[id] = new _controllers[controllerType](id, options);
        });

        if (this.fullscreen) {
            const EL_fullScreen = document.querySelector("body");
            EL_fullScreen.addEventListener("click", function (evt) {
                evt.preventDefault();
                document.documentElement.requestFullscreen();
            });
        }

    }
}

export { Gamepad };