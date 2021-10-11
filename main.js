import './style.scss'
import { Gamepad } from "./Gamepad.js";

const ELNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
const EL = (sel, PAR) => (PAR || document).querySelector(sel);
const EL_app = EL("#app");

// Prevent contextmenu window on long press
window.addEventListener("contextmenu", (evt) => evt.preventDefault());

/**
 * Example:
 */
class Player {
    constructor(options) {
        Object.assign(this, {
            id: "",
            x: 100,
            y: 100,
            radius: 40,
            angle: 0,
            angVel: 0,
            speed: 0,
            speed_max: 6,
            controller: { angle: 0, value: 0 },
        }, options);

        this.EL = ELNew("div", { className: "player" });
        EL_app.append(this.EL);
    }

    move() {

        // Throttle:
        const maxSpeed = this.speed_max * this.controller.value;

        // Start moving
        if (maxSpeed && !this.speed) this.speed = 0.2;

        // accelerate / decelerate
        this.speed *= (this.speed < maxSpeed) ? 1.1 : 0.95

        // Bring to hault
        if (this.speed && this.speed < 0.1 && !maxSpeed) {
            this.speed = 0;
            // mycontroller.vibrate(100); // vibrate for 200ms
        }

        this.x += Math.cos(this.controller.angle) * this.speed;
        this.y += Math.sin(this.controller.angle) * this.speed;

        // console.log(this.x, this.y);

        const bcr_app = EL_app.getBoundingClientRect();
        // edge collision  
        this.x = Math.max(0, Math.min(bcr_app.width - this.radius, this.x));
        this.y = Math.max(0, Math.min(bcr_app.height - this.radius, this.y));

        // Rotation
        this.angle = this.controller.angle;

        // console.log(this.angle);

        // DRAW
        this.EL.style.cssText = `
            transform: translate(${this.x}px, ${this.y}px) rotate(${this.angle + Math.PI / 2}rad);
        `;
    }
}


const PL = new Player({
    x: 0,
    y: 0,
});

const GP = new Gamepad({
    joystick_1: {
        type: "joystick", // "joystick | button"
        parent: "#app",
        axis: "all",
        onInput() {
            // console.log(this.value, this.angle);
            PL.controller.value = this.value;
            PL.controller.angle = this.angle;
        }
    }
});



const engine = () => {
    PL.move();
    requestAnimationFrame(engine);
};

engine();