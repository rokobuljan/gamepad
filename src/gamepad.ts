/**
 * Gamepad
 */

import { Button } from "./controllers/button";
import { Controller } from "./controllers/controller";
import { Joystick } from "./controllers/joystick";

export { VirtualGamepad, Button, Joystick };
let indexOfGamepads = -1;
class VirtualGamepad {
    controllers = new Map<string, Controller>();
    mockGamepad: Gamepad = {
        id: "",
        index: 0,
        connected: true,
        mapping: "standard",
        // instead of [[x1,y1], [x2,y2]] the official API uses [x1, x2, x2, y2]
        buttons: new Array(17).fill({ pressed: false, value: 0 }),
        axes: new Array(4).fill(0),
        timestamp: Date.now(),
        // @ts-ignore
        // TODO: check for solution
        hapticActuators: null,
        // @ts-ignore
        // TODO: maybe add the this.vibrate function
        vibrationActuator: null,
    };

    constructor(controllersArray: Controller[] = []) {
        indexOfGamepads++;
        controllersArray.forEach((controller) => this.add(controller));
        let mockGamepad = this.mockGamepad;
    }

    getEmulatedState() {
        let buttons: GamepadButton[] = [];
        let axes: number[] = [];
        this.controllers.forEach((e) => {
            if (e instanceof Button) {
                buttons.push({
                    pressed: e.state.isPressed,
                    touched: e.state.isPressed,
                    value: e.state.value,
                });
            }
            if (e instanceof Joystick) {
                axes.push(
                    e.state.apiCompliantAxisXValue,
                    e.state.apiCompliantAxisYValue
                );
            }
        });
        const mockGamepad: Gamepad = {
            id: "Emulated Gamepad " + indexOfGamepads,
            index: 0,
            connected: true,
            mapping: "standard",
            // instead of [[x1,y1], [x2,y2]] the official API uses [x1, x2, x2, y2]
            axes,
            buttons,
            timestamp: Date.now(),

            // @ts-ignore
            hapticActuators: null,
            // @ts-ignore
            // TODO: maybe add the this.vibrate function
            vibrationActuator: null,
        };

        return mockGamepad;
    }
    /**
     * Add Controller to Gamepad
     * @param controllers or a Button or Joystick Controller instance.
     */
    add(...controllers: Controller[]) {
        for (let controller of controllers) {
            this.controllers.set(controller.options.id, controller);

            controller.init();
        }
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
