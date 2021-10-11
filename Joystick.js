/**
 * Gamepad Joystick Class 
 */

const pointer = {
    down: "touchstart",
    move: "touchmove",
    up: "touchend",
};

const ELNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
const EL = (sel, PAR) => (PAR || document).querySelector(sel);

function getDistance(x1, y1, x2, y2) {
    const y = x2 - x1;
    const x = y2 - y1;
    return Math.sqrt(x * x + y * y);
}

class Joystick {
    constructor(id, options) {

        Object.assign(this, {
            parent: "body",
            position: "full",
            axis: "all",
            radius: 75,
            onInput() {},
        }, options, {
            id: id,
            value: 0,
            angle: 0,
            isDrag: false,
            wasTouched: false,
            x_start: 0,
            y_start: 0,
            identifier: -1, // Touch finger identifier,
        });

        this.el = {
            parent: EL(this.parent),
            joystick: ELNew("div", { className: `Gamepad-Joystick axis-${this.axis}` }),
            joystickHandle: ELNew("div", { className: "Gamepad-Joystick-handle" })
        };

        this.init();
    }

    vibrate(vibrationPattern) {
        navigator.vibrate(vibrationPattern);
    }

    onDragStart(evt) {
        this.isDrag = true;
        this.wasTouched = true;

        if (this.identifier > -1) return;
        evt = evt.changedTouches[0]; // or use evt.targetTouches ??
        this.identifier = evt.identifier;


        const { left, top } = this.el.parent.getBoundingClientRect();
        const { clientX, clientY } = evt;

        this.x_start = clientX - left;
        this.y_start = clientY - top;


        this.el.joystick.style.left = `${this.x_start}px`;
        this.el.joystick.style.top = `${this.y_start}px`;
        this.el.joystickHandle.style.left = `50%`;
        this.el.joystickHandle.style.top = `50%`;

        this.onInput();
    }

    onDrag(evt) {
        evt.preventDefault();
        if (!this.isDrag) return;

        evt = [...evt.changedTouches].filter(ev => ev.identifier === this.identifier)[0];
        if (!evt) return;

        const { left, top } = this.el.parent.getBoundingClientRect();
        const { clientX, clientY } = evt;

        const x_drag = clientX - left;
        const y_drag = clientY - top;
        const x_diff = x_drag - this.x_start;
        const y_diff = y_drag - this.y_start;

        const distance = Math.sqrt(x_diff * x_diff + y_diff * y_diff); // Distance from center
        const distance_min = Math.min(this.radius, distance);
        const angle = Math.atan2(y_diff, x_diff);

        if (this.axis === "all") {

            this.value = distance_min / this.radius;

            const x_pos = distance_min * Math.cos(angle) + this.radius;
            const y_pos = distance_min * Math.sin(angle) + this.radius;
            this.el.joystickHandle.style.left = `${x_pos}px`;
            this.el.joystickHandle.style.top = `${y_pos}px`;

        } else if (this.axis === "x") {

            this.value = Math.max(Math.min(x_diff / this.radius, 1), -1);

            const x_pos = this.value * this.radius + this.radius;
            this.el.joystickHandle.style.left = `${x_pos}px`;

        } else if (this.axis === "y") {

            this.value = Math.max(Math.min(-y_diff / this.radius, 1), -1);

            const y_pos = -this.value * this.radius + this.radius;
            this.el.joystickHandle.style.top = `${y_pos}px`;

        }

        this.angle = angle;

        this.onInput();
    }

    onDragEnd(evt) {

        evt = [...evt.changedTouches].filter(ev => ev.identifier === this.identifier);

        if (!evt) return;
        this.identifier = -1;

        this.isDrag = false;
        this.value = 0;

        this.el.joystickHandle.style.left = `50%`;
        this.el.joystickHandle.style.top = `50%`;

        this.onInput();
    }

    init() {

        // Styles
        const joystickStyles = {
            all: `width: ${this.radius * 2}px; height: ${this.radius * 2}px;`,
            x: `width: ${this.radius * 2}px; height: 10px;`,
            y: `height: ${this.radius * 2}px; width: 10px;`,
        };
        this.el.joystick.style.cssText = joystickStyles[this.axis];
        this.el.joystick.style.borderRadius = `${this.radius * Math.PI}px`;
        this.el.joystickHandle.style.cssText = `width: ${this.radius * 2 * 0.6}px; height: ${this.radius * 2 * 0.6}px;`;


        // Elements
        this.el.joystick.append(this.el.joystickHandle);
        this.el.parent.append(this.el.joystick);

        // Events
        this.el.parent.addEventListener(pointer.down, (evt) => this.onDragStart(evt), { passive: false });
        this.el.parent.addEventListener(pointer.move, (evt) => this.onDrag(evt), { passive: false });
        this.el.parent.addEventListener(pointer.up, (evt) => this.onDragEnd(evt));

        // Avoid contextmenu on long press
        this.el.parent.addEventListener("contextmenu", (evt) => evt.preventDefault());

    }
}

export { Joystick };