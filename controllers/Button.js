/**
 * Gamepad Button Class 
 */

const pointer = {
    down: "touchstart",
    up: "touchend",
};

const ELNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
const EL = (sel, PAR) => (PAR || document).querySelector(sel);

class Button {
    constructor(id, options) {
        Object.assign(this, {
            parent: "body",
            radius: 75,
            text: "",
            style: {},
            onInput() { },
        }, options, {
            id: id,
            value: 0,
            wasTouched: false,
            identifier: -1, // Touch finger identifier,
            Gamepad,
        });

        this.el = {
            parent: EL(this.parent),
            button: ELNew("div", { className: `Gamepad-Button`, textContent: this.text, id: this.id })
        };

        this.init();
    }

    onPress(evt) {
        evt.preventDefault();
        this.wasTouched = true;

        if (this.identifier > -1) return; // Touch is already registered
        const evtTouch = evt.changedTouches[0];
        this.identifier = evtTouch.identifier;

        this.value = 1;
        this.onInput();
    }

    onRelease(evt) {

        const evtTouch = [...evt.changedTouches].filter(ev => ev.identifier === this.identifier)[0];
        if (!evtTouch) return false;
        this.identifier = -1;

        this.value = 0;
        this.onInput();
    }

    init() {

        const styles = {
            // Default stsyles
            borderRadius: `${this.radius}px`,
            height: `${this.radius * 2}px`,
            minWidth: `${this.radius * 2}px`,
            fontSize: `${this.radius}px`,
            // Overrided by user styles
            ...this.style
        };

        Object.assign(this.el.button.style, styles);

        // Append Elements
        this.el.parent.append(this.el.button);

        // Events
        this.el.button.addEventListener(pointer.down, (evt) => this.onPress(evt), { passive: false });
        this.el.parent.addEventListener(pointer.up, (evt) => this.onRelease(evt), { passive: false });

        // Avoid contextmenu on long press
        this.el.button.addEventListener("contextmenu", (evt) => evt.preventDefault());

    }

    destroy() {
        this.el.button.remove();
    }
}

export { Button };