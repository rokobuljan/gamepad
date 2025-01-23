import { ControllerOptions } from "./ControllerOptions";
import { ControllerState } from "./ControllerState";
import {
    createElement,
    normalize,
    userSelectNoneForAllBrowsers,
} from "./utils";

export interface Position {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
}

export type ControllerType = "joystick" | "button";

export type ControllerAxisType = "all" | "x" | "y";

export class Controller {
    /**
     * parentElement -> anchorElement -> gamepadControllerElement
     */
    parentElement: HTMLElement;
    anchorElement!: HTMLElement;
    gamepadControllerElement!: HTMLElement;

    isJoystick: boolean;
    /** contains oll the initial options */
    options: ControllerOptions;

    /**
     * the current and changing state of the controller
     */
    protected state: ControllerState = {
        isPressed: false,
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
        pointerIdentifier: -1,
        isInitialized: false,
    };

    constructor(options: ControllerOptions, private type: ControllerType) {
        this.options = {
            id: "",
            parentElement: document.querySelector("body")!,
            radius: 40,
            spring: true,
            fixed: true,
            position: { top: "50%", left: "50%" },
            axis: "all",
            text: "",
            style: {
                color: "hsla(0, 90%, 100%, 0.5)",
                border: "2px solid currentColor",
                ...options.style,
            },
        };

        this.options = Object.assign(this.options, options);

        this.isJoystick = this.type === "joystick";

        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);

        let axisName: ControllerType = this.type;

        this.parentElement = this.options.parentElement;
        this.anchorElement = createElement("div", {
            className: "Gamepad-anchor",
        });
        this.gamepadControllerElement = createElement("div", {
            id: this.options.id,
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
        const { left, top } = this.parentElement.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top,
        };
    }

    handleStart(evt: PointerEvent) {
        // Is already assigned? Do nothing
        if (this.state.pointerIdentifier > -1) {
            return;
        }

        // If a Gamepad Button was touched, don't do anything with the Joystick
        const target = evt.target as HTMLElement;
        if (this.isJoystick && target.closest(".Gamepad-Button")) {
            return;
        }

        evt.preventDefault();

        this.parentElement.setPointerCapture(evt.pointerId);

        const { x, y } = this.getPointerXY(evt);

        this.state.isPressed = true;
        this.state.isActive = this.options.spring ? true : !this.state.isActive;

        this.state.pointerIdentifier = evt.pointerId;
        this.state.x_start = x;
        this.state.y_start = y;

        if (!this.options.fixed) {
            this.anchorElement.style.left = `${this.state.x_start}px`;
            this.anchorElement.style.top = `${this.state.y_start}px`;
        }

        this.gamepadControllerElement.classList.toggle(
            "is-active",
            this.isJoystick ? this.state.isPressed : this.state.isActive
        );

        this.onStart();
    }

    handleMove(evt: PointerEvent) {
        if (
            !this.parentElement.hasPointerCapture(evt.pointerId) ||
            !this.state.isPressed ||
            this.state.pointerIdentifier < 0
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
        this.state.angle = normalize(
            Math.atan2(this.state.y_diff, this.state.x_diff)
        );
        this.onMove();
    }

    handleEnd(evt: PointerEvent) {
        // If touch was not registered on touch-start - do nothing
        if (this.state.pointerIdentifier < 0) {
            return;
        }

        // If a Gamepad Button was touched, don't do anything with the Joystick
        const target = evt.target as HTMLElement;
        if (this.isJoystick && target.closest(".Gamepad-Button")) {
            return;
        }

        this.parentElement.releasePointerCapture(evt.pointerId);

        this.state.pointerIdentifier = -1;
        this.state.isDrag = false;
        this.state.isPressed = false;
        if (this.options.spring) {
            this.state.isActive = false;
        }

        this.gamepadControllerElement.classList.toggle(
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
            cursor: "default",
            ...userSelectNoneForAllBrowsers,
        };

        // Styles depending on controller type/axis
        let stylesByAxisType: Partial<CSSStyleDeclaration> = {
            minWidth: `${this.options.radius * 2}px`,
            height: `${this.options.radius * 2}px`,
        };

        if (this.options.axis === "x") {
            stylesByAxisType = {
                width: `${this.options.radius * 2}px`,
                height: `6px`,
            };
        }
        if (this.options.axis === "y") {
            stylesByAxisType = {
                height: `${this.options.radius * 2}px`,
                width: `6px`,
            };
        }

        const gamepadControllerStyles = {
            // Default styles
            ...stylesCommon,
            // Styles by controller Axis type
            ...stylesByAxisType,
            // Override with user-defined styles
            ...this.options.style,
        };

        // Add styles - Controller anchor
        Object.assign(this.anchorElement.style, {
            position: "absolute",
            width: "0",
            height: "0",
            touchAction: "none",
            ...userSelectNoneForAllBrowsers,
            ...this.options.position,
        });

        // Add styles - Controller
        Object.assign(
            this.gamepadControllerElement.style,
            gamepadControllerStyles
        );

        // Insert Elements to DOM
        this.anchorElement.append(this.gamepadControllerElement);
        this.options.parentElement.append(this.anchorElement);

        // Events
        const eventStarterElement =
            this.isJoystick || !this.options.fixed
                ? this.parentElement
                : this.gamepadControllerElement;

        eventStarterElement.addEventListener("pointerdown", this.handleStart, {
            passive: false,
        });
        if (this.isJoystick) {
            this.parentElement.addEventListener(
                "pointermove",
                this.handleMove,
                {
                    passive: false,
                }
            );
        }
        this.parentElement.addEventListener("pointerup", this.handleEnd);
        this.parentElement.addEventListener("pointercancel", this.handleEnd);
        this.parentElement.addEventListener("contextmenu", this._noDefault);
    }

    destroy() {
        // Events
        const eventStarterElement =
            this.isJoystick || !this.options.fixed
                ? this.parentElement
                : this.gamepadControllerElement;

        eventStarterElement.removeEventListener(
            "pointerdown",
            this.handleStart,
            {
                passive: false,
            } as EventListenerOptions
        );
        if (this.isJoystick) {
            this.parentElement.removeEventListener(
                "pointermove",
                this.handleMove,
                {
                    passive: false,
                } as EventListenerOptions
            );
        }
        this.parentElement.removeEventListener("pointerup", this.handleEnd);
        this.parentElement.removeEventListener("pointercancel", this.handleEnd);
        this.parentElement.removeEventListener("contextmenu", this._noDefault);

        // Remove element from DOM
        this.anchorElement.remove();
    }
}
