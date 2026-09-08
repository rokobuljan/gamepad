/**
 * Gamepad
 * Author: https://github.com/rokobuljan/ 
 */

import { Button } from "./controllers/button.js";
import { Joystick } from "./controllers/joystick.js";
import { DPad } from "./controllers/dpad.js";

/** @typedef {Button | Joystick | DPad} GamepadController */

/** @typedef {import("./controllers/controller.js").ControllerOptions} ControllerOptions */

/** @typedef {ControllerOptions | GamepadController} ControllerInput */

/**
 * Check whether a value is a supported controller instance.
 * @internal
 * @param {unknown} ob Value to inspect.
 * @returns {ob is GamepadController}
 */
const isController = (ob) => ob instanceof Button || ob instanceof Joystick || ob instanceof DPad;
const TYPE = "joystick";

/** Manage a collection of touch controllers, keyed by their unique IDs. */
class Gamepad {
    /**
     * @param {ControllerInput[]} [controllersArray=[]] Controllers to create and initialize.
     */
    constructor(controllersArray = []) {
        /**
         * @type {Record<string, GamepadController>}
         */
        this.controllers = {};
        controllersArray.forEach(options => this.add(options));
    }

    /**
     * Add Controller to Gamepad
     * @param {...ControllerInput} args Options or Button, Joystick or DPad instances.
     * @returns {Gamepad}
     */
    add(...args) {
        args.forEach((options) => {
            let controller;
            if (isController(options)) {
                controller = options;
            } else {
                options.type = /** @type {import("./controllers/controller.js").ControllerType} */ ((options.type || TYPE).trim().toLowerCase());
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
     * @param {...(string | GamepadController)} args Controller IDs or instances to remove.
     * @returns {Gamepad}
     */
    remove(...args) {
        args.forEach((id) => {
            const controllerId = typeof id === "string" ? id : id.id;
            if (this.controllers.hasOwnProperty(controllerId)) {
                this.controllers[controllerId].destroy();
                delete this.controllers[controllerId];
            }
        });
        return this;
    }

    /**
     * Remove/destroy all controllers (or one by ID)
     * @param {string | GamepadController} [id] Controller ID or instance; omit to destroy all.
     * @returns {Gamepad}
     */
    destroy(id) {
        // Destroy only one controller
        if (id) return this.remove(id);
        // Destroy all controllers
        Object.keys(this.controllers).forEach((id) => this.remove(id));
        // Remove events
        removeEventListener("click", this.#handleFullscreen);
        return this;
    }

    /**
     * Request fullscreen on click; each gamepad owns its listener.
     * @internal
     * @returns {void}
     */
    #handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        }
    };

    /**
     * Call this function to add a listener to request Fullscreen API
     * @returns {Gamepad}
     */
    requestFullScreen() {
        addEventListener("click", this.#handleFullscreen);
        return this;
    }

    /**
     * Exit fullScreen
     * @returns {Gamepad}
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
     * @param {number | number[]} vibrationPattern Duration or alternating vibration/pause durations in milliseconds.
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
