import "./style.css";
import { Gamepad, Button, Joystick } from "../src/gamepad";

const ELNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
const EL = (sel, PAR) => (PAR || document).querySelector(sel);
const EL_app = EL("#app");

const lerpAngles = (A, B, w) => {
    const CS = (1 - w) * Math.cos(A) + w * Math.cos(B);
    const SN = (1 - w) * Math.sin(A) + w * Math.sin(B);
    return Math.atan2(SN, CS);
};

/**
 * Example:
 */
class Player {
    constructor(options) {
        Object.assign(
            this,
            {
                x: 100,
                y: 100,
                radius: 40,
                angle: 0,
                speed: 0,
                speedMax: 5,
                controller: { angle: 0, value: 0 },
                canFire: true,
            },
            options,
            {
                angleTarget: 0,
            }
        );

        this.EL = ELNew("div", { className: "player" });
        EL_app.append(this.EL);
    }

    move() {
        // Throttle:
        const maxSpeed = this.speedMax * this.controller.value;

        // Start moving
        if (maxSpeed && !this.speed) this.speed = 0.2;

        // accelerate / decelerate
        this.speed *= this.speed < maxSpeed ? 1.1 : 0.95;

        // Bring to hault
        if (this.speed && this.speed < 0.1 && !maxSpeed) {
            this.speed = 0;
            // GP.vibrate(100); // vibrate Gamepad for 200ms
        }

        // Rotation (only if there's thrust)
        if (this.controller.value > 0.15) {
            this.angle = lerpAngles(this.angle, this.controller.angle, 0.07);
        }

        // Position
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        const bcr_app = EL_app.getBoundingClientRect();
        // edge collision
        this.x = Math.max(0, Math.min(bcr_app.width - this.radius, this.x));
        this.y = Math.max(0, Math.min(bcr_app.height - this.radius, this.y));

        // DRAW
        this.EL.style.cssText = `
            transform: translate(${this.x}px, ${this.y}px) rotate(${
            this.angle + Math.PI / 2
        }rad);
        `;
    }

    fire() {
        if (!this.canFire) return;
        new Weapon({
            x: this.x + this.radius / 2 + 4,
            y: this.y + this.radius / 2 - 3,
            angle: this.angle,
            speed: this.speed,
        });
    }
}

const weapons = [];
class Weapon {
    constructor(props) {
        Object.assign(
            this,
            {
                x: 0,
                y: 0,
                angle: 0,
                speed: 6,
            },
            props,
            {
                speedMax: 13,
                life: 190,
                fireRate: 10,
                fireCoolDown: 0,
                EL: ELNew("div", { className: "missile" }),
            }
        );

        const speed_min = 3;
        this.speed += speed_min;

        this.init();
    }

    move() {
        if (this.life < 0) return this.destroy();
        // Accelerate
        this.speed *= 1.1;
        // Top speed
        this.speed = Math.min(this.speed, this.speedMax);
        // Position
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        // Life
        this.life -= 1;

        // DRAW
        this.EL.style.cssText = `
            transform: translate(${this.x}px, ${this.y}px) rotate(${
            this.angle + Math.PI / 2
        }rad);
        `;
    }

    init() {
        this.move(); // Move to ship position
        EL_app.append(this.EL);
        weapons.push(this);
    }

    destroy() {
        this.EL.remove();
        weapons.splice(weapons.indexOf(this), 1);
    }
}

const PL = new Player({
    x: 50,
    y: 50,
});

const engine = () => {
    PL.move();
    weapons.forEach((weapon) => weapon.move());
    // Loop RAF
    requestAnimationFrame(engine);
};

engine();

// GAMEPAD EXAMPLE:
const GP = new Gamepad([
    new Joystick({
        elementId: "left-joystick",
        parentElement: document.querySelector("#app-left"),
        radius: 60,
        axis: "all",
        fixed: false,
        position: {
            left: "25%",
            top: "50%",
        },
        onInput(state) {
            PL.controller.value = state.value;
            PL.controller.angle = state.angle;
        },
    }),
    new Button({
        elementId: "f-button",
        parentElement: document.querySelector("#app-right"),
        radius: 60,
        fixed: false,
        text: "F",
        position: {
            right: "25%",
            bottom: "50%",
        },
        onInput(state) {
            if (!state.value) {
                return;
            }
            PL.fire();
            GP.vibrate([100]);
        },
    }),
]);

const ControllerSettingsButton = new Button(
    {
        type: "button",
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
            console.log("asda");

            // Open some settings panel
            EL("#app-menu").classList.toggle("is-active", this.isActive);
        },
    },
    document.querySelector("#app-right")
);

GP.addController(ControllerSettingsButton);
ControllerSettingsButton.init();

// GP.requestFullScreen();
