import './style.css'
import { Gamepad, Button } from "../gamepad.js";
import { elNew, el, lerpAngles } from "../utils.js";

/**
 * Example:
 */

const elApp = el("#app");
class Player {
    constructor(options) {
        Object.assign(this, {
            x: 100,
            y: 100,
            radius: 40,
            angle: Math.PI + Math.PI / 2,
            speed: 0,
            speedMax: 5,
            vx: 0,
            vy: 0,
            damping: 0.9, // Velocity retained per frame when the controls are released
            canFire: true,
        }, options);

        this.el = elNew("div", { className: "player" });
        elApp.append(this.el);
    }

    move(controllers, frame = 1) {
        let steerX = 0;
        let steerY = 0;
        let localX = 0;
        let localY = 0;

        // Read every movement controller, so releasing one cannot replace another.
        for (const controller of controllers) {
            if (!controller.value) continue;
            if (controller.type === "joystick") {
                if (controller.axis === "x") {
                    // Analog rotation: left/right turns the ship, with strength controlling speed.
                    this.angle += controller.value * 0.04 * frame;
                }
                else if (controller.axis === "y") localY -= controller.value;
                else {
                    steerX += Math.cos(controller.angle) * controller.value;
                    steerY += Math.sin(controller.angle) * controller.value;
                }
            } else if (controller.type === "dpad") {
                if (controller.id === "move") {
                    localX += Math.cos(controller.angleDirection) * controller.value;
                    localY += Math.sin(controller.angleDirection) * controller.value;
                } else if (controller.id === "rotate") {
                    this.angle += controller.value * 0.04 * frame * (controller.xDiff < 0 ? -1 : 1);
                } else if (controller.id === "direction") {
                    // Advance or reverse ship along its current heading, without changing the heading.
                    localY += controller.value * (controller.yDiff < 0 ? -1 : 1);
                }
            }
        }

        const thrust = Math.min(1, Math.hypot(steerX, steerY));
        if (thrust > 0.001) {
            this.angle = lerpAngles(this.angle, Math.atan2(steerY, steerX), 1 - 0.93 ** frame);
            localY -= thrust;
        }

        // Cap combined input, including diagonal and overlapping controls.
        const magnitude = Math.max(1, Math.hypot(localX, localY));
        localX /= magnitude;
        localY /= magnitude;

        // Local up points forward; local right strafes to the ship's right.
        const rotation = this.angle + Math.PI / 2;
        const targetVX = (localX * Math.cos(rotation) - localY * Math.sin(rotation)) * this.speedMax;
        const targetVY = (localX * Math.sin(rotation) + localY * Math.cos(rotation)) * this.speedMax;
        const damping = this.damping ** frame;
        this.vx = targetVX + (this.vx - targetVX) * damping;
        this.vy = targetVY + (this.vy - targetVY) * damping;

        // Velocity persists after release, independently of the ship's heading.
        if (Math.hypot(localX, localY) < 0.001 && Math.hypot(this.vx, this.vy) < 0.01) {
            this.vx = 0;
            this.vy = 0;
        }
        this.x += this.vx * frame;
        this.y += this.vy * frame;

        const bcrApp = elApp.getBoundingClientRect();
        // edge collision  
        const maxX = Math.max(0, bcrApp.width - this.radius);
        const maxY = Math.max(0, bcrApp.height - this.radius);
        if (this.x < 0 || this.x > maxX) this.vx = 0;
        if (this.y < 0 || this.y > maxY) this.vy = 0;
        this.x = Math.max(0, Math.min(maxX, this.x));
        this.y = Math.max(0, Math.min(maxY, this.y));
        this.speed = Math.hypot(this.vx, this.vy);

        // DRAW
        this.el.style.cssText = `
            transform: translate(${this.x}px, ${this.y}px) rotate(${this.angle + Math.PI / 2}rad);
        `;
    }

    fire() {
        if (!this.canFire) return;
        new Weapon({
            x: this.x + (this.radius / 2) + 4,
            y: this.y + (this.radius / 2) - 3,
            angle: this.angle,
            speed: this.speed,
        });
    }
}

const weapons = [];
class Weapon {
    constructor(props) {
        Object.assign(this, {
            x: 0,
            y: 0,
            angle: 0,
            speed: 0,
        }, props, {
            speedMax: 13,
            life: 190,
            fireRate: 10,
            fireCoolDown: 0,
            el: elNew("div", { className: "missile" }),
        });

        const speedMin = 3;
        this.speed += speedMin;

        this.init();
    }

    move(frame = 1) {
        if (this.life < 0) return this.destroy();
        // Accelerate
        this.speed *= 1.1 ** frame;
        // Top speed
        this.speed = Math.min(this.speed, this.speedMax);
        // Position
        this.x += Math.cos(this.angle) * this.speed * frame;
        this.y += Math.sin(this.angle) * this.speed * frame;
        // Life
        this.life -= frame;

        // DRAW
        this.el.style.cssText = `
            transform: translate(${this.x}px, ${this.y}px) rotate(${this.angle + Math.PI / 2}rad);
        `;
    }

    init() {
        this.move(); // Move to ship position
        elApp.append(this.el);
        weapons.push(this);
    }

    destroy() {
        this.el.remove();
        weapons.splice(weapons.indexOf(this), 1);
    }
}

const PL = new Player({
    x: 50,
    y: 50,
});

let lastTime;
const engine = (time) => {
    const frame = lastTime === undefined ? 1 : Math.min((time - lastTime) / (1000 / 60), 3);
    lastTime = time;
    PL.move(Object.values(GP.controllers), frame);
    weapons.forEach(weapon => weapon.move(frame));
    // Loop RAF
    requestAnimationFrame(engine);
};

// GAMEPAD EXAMPLE:

const GP = new Gamepad([
    {
        id: "move",
        type: "dpad",
        parent: "#controls-left",
        axis: "all",
        position: {
            left: "100px",
            bottom: "100px",
        },
    },
    {
        id: "rotate",
        type: "dpad",
        parent: "#controls-left",
        axis: "x",
        deadZone: 0,
        position: {
            left: "100px",
            bottom: "250px",
        },
    },
    {
        id: "direction",
        type: "dpad",
        parent: "#controls-left",
        axis: "y",
        deadZone: 0,
        position: {
            left: "210px",
            bottom: "250px",
        },
    },
    {
        id: "move-joystick",
        type: "joystick",
        parent: "#controls-right",
        axis: "all",
        position: {
            right: "100px",
            bottom: "100px",
        },
    },
    {
        id: "direction-joystick",
        type: "joystick",
        parent: "#controls-right",
        axis: "y",
        position: {
            right: "200px",
            bottom: "100px",
        },
    },
    {
        id: "rotation-joystick",
        type: "joystick",
        parent: "#controls-right",
        axis: "x",
        position: {
            right: "300px",
            bottom: "100px",
        },
    },
    {
        type: "button",
        id: "fire",
        text: "F",
        parent: "#controls-right",
        position: {
            right: "100px",
            bottom: "250px",
        },
        onInput() {
            if (!this.value) return;
            PL.fire();
            GP.vibrate(100);
        },
    }
]);

const ControllerButtonSettings = new Button({
    type: "button",
    id: "settings",
    parent: "#app",
    text: "☰",
    radius: 20,
    spring: false,
    position: {
        right: "35px",
        top: "35px",
    },
    style: {
        border: "0",
        color: "#fff",
        background: "transparent",
    },
    onInput() {
        // Open Settings panel        
        el("#app-menu").classList.toggle("is-active", this.isActive);
    }
});

GP.add(ControllerButtonSettings);
ControllerButtonSettings.init();

// GP.requestFullScreen();

requestAnimationFrame(engine);
