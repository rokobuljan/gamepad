export interface ControllerState {
    /**
     * true if has "is-active" state / className
     */
    isActive: boolean;
    /**
     * true on touch-move (Joystick)
     */
    isDrag: boolean;
    /**
     * Joystick: Number ranging from 0.0 - 1.0;
     * Button: Number 0 or 1
     */
    value: number;
    /**
     * Joystick: Normalized Angle in radians
     */
    angle: number;
    /**
     * _px_ Relative x touch-start coordinates
     */
    x_start: number;
    /**
     * _px_ Relative y touch-start coordinates
     */
    y_start: number;
    /**
     * _px_ Relative x touch-move coordinates
     */
    x_drag: number;
    /**
     * _px_ Relative y touch-move coordinates
     */
    y_drag: number;
    /**
     * _px_ Difference x from start and move
     */
    x_diff: number;
    /**
     * _px_ Difference y from start and move
     */
    y_diff: number;
    /**
     * _px_ Drag distance (capped to max radius)
     */
    dragDistance: number;
    /**
     * The touch events Id
     */
    pointerIdentifier: number;
    /**
     * Is currently isInitialized
     */
    isInitialized: boolean;
    /**
     * true if the controller is currently pressed
     */
    isPressed: boolean;
}
