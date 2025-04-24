/**
 * Gamepad
 * Author: https://github.com/rokobuljan/ 
 */

import { Button } from "./controllers/button.js";
import { Joystick } from "./controllers/joystick.js";
import { DPad } from "./controllers/dpad.js";

const isController = (ob) => ob instanceof Button || ob instanceof Joystick;
const TYPE = "joystick";

class Gamepad {
    constructor(controllersArray = []) {
        this.controllers = {};
        controllersArray.forEach(options => this.add(options));
    }

    /**
     * Add Controller to Gamepad
     * @param {object|Controller} options controllerOptions or a Button or Joystick Controller instance.
     * @returns {Gamepad}
     */
    add(...args) {
        args.forEach((options) => {
            let controller;
            if (isController(options)) {
                controller = options;
            } else {
                options.type = (options.type || TYPE).trim().toLowerCase();
                controller = new {
                    button: Button,
                    joystick: Joystick,
                    dpad: DPad,
                }[options.type](options);
            }
            this.controllers[controller.id] = controller;

            // Initialize Controller
            controller.init();
        });

        return this;
    }

    /**
     * Remove/destroy controller by ID
     * @param {string} id Controller ID to remove
     * @returns {Gamepad}
     */
    remove(...args) {
        args.forEach((id) => {
            id = typeof id === "string" ? id : id.id;
            if (this.controllers.hasOwnProperty(id)) {
                this.controllers[id].destroy();
                delete this.controllers[id];
            }
        });
        return this;
    }

    /**
     * Remove/destroy all controllers (or one by ID)
     * @param {string|Controller} id (Optional) Controller ID or Controller instance
     * @returns {Gamepad}
     */
    destroy(id) {
        // Destroy only one controller
        if (id) return this.remove(id);
        // Destroy all controllers
        Object.keys(this.controllers).forEach((id) => this.remove(id));
        // Remove events
        removeEventListener("click", this.handleFullscreen);
        return this;
    }

    handleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        }
    }

    /**
     * Call this function to add a listener to request Fullscreen API
     * @returns {Gamepad}
     */
    requestFullScreen() {
        addEventListener("click", this.handleFullscreen);
        return this;
    }

    /**
     * Exit fullScreen
     */
    exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        return this;
    }

    /**
     * Check if Navigator supports vibration
     * @returns {boolean} True if vibration is supported
     */
    isVibrationSupported() {
        return (window.navigator && "vibrate" in window.navigator);
    }

    /**
     * Vibrate Gamepad!
     * Use a milliseconds integer or an array of pattern like: [200,30,100,30,200]
     * where 30 is the pause in ms.
     * @param {number|array} vibrationPattern 
     * @returns {Gamepad}
     */
    vibrate(vibrationPattern) {
        if (this.isVibrationSupported()) window.navigator.vibrate(vibrationPattern);
        return this;
    }
}

export {
    Gamepad,
    Button,
    Joystick,
    DPad
};