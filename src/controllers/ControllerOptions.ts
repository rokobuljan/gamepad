import { Position, ControllerAxisType } from "./controller";
import { ControllerState } from "./ControllerState";

/**
 * Gamepad - Base Controller
 */

export interface ControllerOptions {
    /**
     * The ID of the html element.
     * Needed in case a controller should get destroyed or to add CSS styles
     * @example "left-controller"
     */
    id: string;
    /**
     * The parent HTML element to which the controller is attached.
     */
    parentElement: HTMLElement;
    /**
     * If true will reset/null value on touch-end,
     * if set to false the button will act as a checkbox, or the joystick will not reset
     * @default true */
    spring?: boolean;
    /**
     * Set to false to change controller position on touch-down
     * @default true
     */
    fixed?: boolean;
    /**
     * Optional text layered on top of the controller.
     */
    text?: string;
    /**
     * Optional size the controller.
     * @default 40
     */
    radius: number;
    /**
     * Optional position of the controller.
     * @default { top: "50%", left: "50%" }
     */
    position?: Position;
    /**
     * Optional css styles applied to the controller.
     */
    style?: Partial<CSSStyleDeclaration>;
    /**
     * The axis on which the controller operates.
     *
     * @default 'all' (other options: x, y)
     */
    axis?: ControllerAxisType;
    /**
     * Callback function invoked on input.
     * @param state The current state of the controller.
     */
    onInput?: (state: ControllerState) => void;
}
