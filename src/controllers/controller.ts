/**
 * Gamepad - Base Controller
 * Author: https://github.com/rokobuljan/
 */

import { createElement, norm } from "./utils";

export interface ControllerOptions {
    spring?: boolean;
    text?: string;
    radius: number;
    position?: Position;
    style?: Partial<CSSStyleDeclaration>;
    // TODO: fix fixed. fow now not available
    fixed?: boolean;
    axis?: ControllerAxisType;
    onInput?: (state: ControllerState) => void;
}

export interface Position {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
}

export interface ControllerState {
    isActive: boolean;
    isDrag: boolean;
    value: number;
    angle: number;
    x_start: number;
    y_start: number;
    x_diff: number;
    y_diff: number;
    x_drag: number;
    y_drag: number;
    dragDistance: number;
    touchFingerIdentifier: number;
    isInitialized: boolean;
    isPressed: boolean;
}

export enum ControllerType {
    "joystick",
    "button",
}
export enum ControllerAxisType {
    "all",
    "x",
    "y",
}

export class Controller {
    id = "GameController" + Math.random().toString();
    controllerContainer!: HTMLElement;
    gamepadController!: HTMLElement;

    isJoystick: boolean;
    options: ControllerOptions;

    protected state: ControllerState = {
        // true if the controller is currently pressed
        isPressed: false,
        // true if has "is-active" state / className
        isActive: false,
        isDrag: false,
        value: 0,
        angle: 0,
        x_start: 0,
        y_start: 0,
        x_diff: 0,
        y_diff: 0,
        x_drag: 0,
        y_drag: 0,
        dragDistance: 0,
        touchFingerIdentifier: -1,
        isInitialized: false,
    };

    constructor(
        options: ControllerOptions,
        private type: ControllerType,
        public gamepadContainer: HTMLElement
    ) {
        this.options = {
            radius: 40,
            spring: true, // If true will reset/null value on touch-end, if set to false the button will act as a checkbox, or the joystick will not reset
            fixed: true, // Set to false to change controller position on touch-down
            position: { top: "50%", left: "50%" }, // For the anchor point
            axis: ControllerAxisType.all,
            text: "",
            style: {
                color: "hsla(0, 90%, 100%, 0.5)",
                border: "2px solid currentColor",
                ...options.style,
            },
        };
        this.options = Object.assign(this.options, options);

        this.isJoystick = this.type === ControllerType.joystick;

        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);

        this.controllerContainer = createElement("div", {
            className: "Gamepad-anchor",
        });

        let axisName = ControllerAxisType[this.type];

        this.gamepadController = createElement("div", {
            innerHTML: this.options.text,
            className: `Gamepad-controller Gamepad-${axisName} axis-${axisName}`,
        });
    }
    onInput() {
        if (this.options.onInput) {
            this.options.onInput(this.state);
        }
    }

    onStart() {}
    onMove() {}
    onEnd() {}

    _noDefault(evt: MouseEvent) {
        evt.preventDefault();
    }

    // Get relative mouse coordinates
    getPointerXY(evt: PointerEvent) {
        const { clientX, clientY } = evt;
        const { left, top } = this.gamepadController.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top,
        };
    }

    handleStart(evt: PointerEvent) {
        // Is already assigned? Do nothing
        if (this.state.touchFingerIdentifier > -1) {
            return;
        }

        // If a Gamepad Button was touched, don't do anything with the Joystick
        const target = evt.target as HTMLElement;
        if (this.isJoystick && target.closest(".Gamepad-Button")) {
            return;
        }

        evt.preventDefault();

        this.gamepadController.setPointerCapture(evt.pointerId);

        const { x, y } = this.getPointerXY(evt);

        this.state.isPressed = true;
        this.state.isActive = this.options.spring ? true : !this.state.isActive;

        this.state.touchFingerIdentifier = evt.pointerId;
        this.state.x_start = x;
        this.state.y_start = y;

        if (!this.options.fixed) {
            this.gamepadController.style.left = `${this.state.x_start}px`;
            this.gamepadController.style.top = `${this.state.y_start}px`;
        }

        this.gamepadController.classList.toggle(
            "is-active",
            this.isJoystick ? this.state.isPressed : this.state.isActive
        );

        this.onStart();
    }

    handleMove(evt: PointerEvent) {
        if (
            !this.gamepadController.hasPointerCapture(evt.pointerId) ||
            !this.state.isPressed ||
            this.state.touchFingerIdentifier < 0
        ) {
            return;
        }

        evt.preventDefault();

        const { x, y } = this.getPointerXY(evt);

        this.state.isDrag = true;
        this.state.x_drag = x;
        this.state.y_drag = y;
        this.state.x_diff = this.state.x_drag - this.state.x_start;
        this.state.y_diff = this.state.y_drag - this.state.y_start;
        this.state.dragDistance = Math.min(
            this.options.radius,
            Math.sqrt(
                this.state.x_diff * this.state.x_diff +
                    this.state.y_diff * this.state.y_diff
            )
        );

        // Finally set the angle (normalized)
        this.state.angle = norm(
            Math.atan2(this.state.y_diff, this.state.x_diff)
        );
        this.onMove();
    }

    handleEnd(evt: PointerEvent) {
        // If touch was not registered on touch-start - do nothing
        if (this.state.touchFingerIdentifier < 0) {
            return;
        }

        // If a Gamepad Button was touched, don't do anything with the Joystick
        const target = evt.target as HTMLElement;
        if (this.isJoystick && target.closest(".Gamepad-Button")) {
            return;
        }

        this.gamepadController.releasePointerCapture(evt.pointerId);

        this.state.touchFingerIdentifier = -1;
        this.state.isDrag = false;
        this.state.isPressed = false;
        if (this.options.spring) {
            this.state.isActive = false;
        }

        this.gamepadController.classList.toggle(
            "is-active",
            this.isJoystick ? this.state.isPressed : this.state.isActive
        );

        this.onEnd();
    }

    init() {
        if (this.state.isInitialized) {
            this.destroy();
        }
        this.state.isInitialized = true;

        // Styles for both Joystick and Button
        const stylesCommon: Partial<CSSStyleDeclaration> = {
            boxSizing: "content-box",
            transform: "translate(-50%, -50%)",
            position: "absolute",
            fontSize: `${this.options.radius}px`,
            borderRadius: `${this.options.radius * 2}px`,
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            userSelect: "none",
        };

        // Styles depending on controller type/axis
        let stylesByAxisType: Partial<CSSStyleDeclaration> = {
            minWidth: `${this.options.radius * 2}px`,
            height: `${this.options.radius * 2}px`,
        };

        if (this.options.axis === ControllerAxisType.x) {
            stylesByAxisType = {
                width: `${this.options.radius * 2}px`,
                height: `6px`,
            };
        }
        if (this.options.axis === ControllerAxisType.y) {
            stylesByAxisType = {
                height: `${this.options.radius * 2}px`,
                width: `6px`,
            };
        }

        const styles = {
            // Default styles
            ...stylesCommon,
            // Styles by controller Axis type
            ...stylesByAxisType,
            // Override with user-defined styles
            ...this.options.style,
        };

        // Add styles - Controller anchor
        Object.assign(this.controllerContainer.style, {
            position: "absolute",
            width: "0",
            height: "0",
            userSelect: "none",
            touchAction: "none",
            ...this.options.position,
        });

        // Add styles - Controller
        Object.assign(this.gamepadController.style, styles);

        // Insert Elements to DOM
        this.controllerContainer.append(this.gamepadController);
        this.gamepadContainer.append(this.controllerContainer);

        // TODO: reactivate for fixed version
        // Events
        // const el_evt_starter =
        //   this.isJoystick || !this.options.fixed
        //     ? this.gamepadContainer
        //     : (this.gamepadController as HTMLElement)
        this.gamepadController.addEventListener(
            "pointerdown",
            this.handleStart,
            {
                passive: false,
            }
        );
        if (this.isJoystick)
            this.gamepadController.addEventListener(
                "pointermove",
                this.handleMove,
                {
                    passive: false,
                }
            );
        this.gamepadController.addEventListener("pointerup", this.handleEnd);
        this.gamepadController.addEventListener(
            "pointercancel",
            this.handleEnd
        );
        this.gamepadController.addEventListener("contextmenu", this._noDefault);
    }

    destroy() {
        // TODO: reactivate for fixed version
        // Events
        // const el_evt_starter =
        //   this.isJoystick || !this.options.fixed
        //     ? this.gamepadContainer
        //     : this.gamepadController
        this.gamepadController.removeEventListener(
            "pointerdown",
            this.handleStart,
            {
                passive: false,
            } as EventListenerOptions
        );
        if (this.isJoystick)
            this.gamepadController.removeEventListener(
                "pointermove",
                this.handleMove,
                {
                    passive: false,
                } as EventListenerOptions
            );
        this.gamepadController.removeEventListener("pointerup", this.handleEnd);
        this.gamepadController.removeEventListener(
            "pointercancel",
            this.handleEnd
        );
        this.gamepadController.removeEventListener(
            "contextmenu",
            this._noDefault
        );

        // Remove element from DOM
        this.gamepadController.remove();
    }
}