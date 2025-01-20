/**
 * Gamepad
 */

import { Button } from "./controllers/button";
import { Controller, ControllerAxisType } from "./controllers/controller";
import { Joystick } from "./controllers/joystick";

export { Gamepad, Button, Joystick, ControllerAxisType };

class Gamepad {
    controllers = new Map<string, Controller>();

    constructor(controllersArray: Controller[] = []) {
        controllersArray.forEach((controller) =>
            this.addController(controller)
        );
    }

    /**
     * Add Controller to Gamepad
     * @param controller or a Button or Joystick Controller instance.
     */
    addController(controller: Controller) {
        this.controllers.set(controller.options.elementId, controller);

        controller.init();

        return this;
    }

    /**
     * Remove/destroy controller by ID
     * @param id Controller ID to remove
     */
    remove(id: string) {
        this.controllers.get(id)!.destroy();
        this.controllers.delete(id);
    }

    /**
     * Remove/destroy all controllers (or one by ID)
     * @param id (Optional) Controller ID or Controller instance
     */
    destroy(id: string) {
        // Destroy only one controller
        if (id) {
            return this.remove(id);
        }
        // Destroy all controllers
        Object.keys(this.controllers).forEach((id) => this.remove(id));
        // Remove events
        document
            .querySelector("body")!
            .removeEventListener("click", this.handleFullscreen);
        return this;
    }

    handleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        }
    }

    /**
     * Call this function to add a listener to request Fullscreen API
     */
    requestFullScreen() {
        document
            .querySelector("body")!
            .addEventListener("click", this.handleFullscreen);
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
     * @returns True if vibration is supported
     */
    isVibrationSupported() {
        return window.navigator && "vibrate" in window.navigator;
    }

    /**
     * Vibrate Gamepad!
     * Use a milliseconds integer or an array of pattern like: [200,30,100,30,200]
     * where 30 is the pause in ms.
     */
    vibrate(vibrationPatternMsArray: number[]) {
        if (this.isVibrationSupported()) {
            window.navigator.vibrate(vibrationPatternMsArray);
        }
        return this;
    }
}
