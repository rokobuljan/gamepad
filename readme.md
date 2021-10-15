# Gamepad

Creates a virtual multi-touch *gamepad* with virtual **buttons** and **joystick** for your games or IOT!  
*Beta*

## Example:

```js
// Given PL is your Player class:
const GP = new Gamepad({
    controllers: {
        move: {
            type: "joystick",
            parent: "#app",
            axis: "all",
            reposition: true,
            position: {
                left: "15%",
                top: "50%",
            },
            onInput() {
                PL.controller.value = this.value;
                PL.controller.angle = this.angle;
                // If you update your Player position and angle continuosly inside a
                // requestAnimationFrame you're good to go, otherwise use here something like:
                // PL.move(this.value, this.angle);
                // to update your player position when the Controller triggers onInput
            }
        },
        fire: {
            type: "button",
            parent: "#app",
            text: "F",
            position: {
                right: "15%",
                bottom: "50%",
            },
            style: {
                color: "#fff",
                background: "hsla(255, 100%, 100%, 0.2)",
            },
            onInput() {
                if (!this.value) return;
                PL.fire();
                GP.vibrate(100); // Vibrate the Handheld for 100ms
            }
        },
        settings: {
            type: "button",
            parent: "#app",
            text: "☰",
            radius: 20,
            position: {
                right: "35px",
                top: "35px",
            },
            style: {
                color: "#fff",
                background: "rgba(0,0,0,0.2)",
            },
            onInput() {
                if (!this.value) return;
                // Open Settings panel to pause game, restart, options etc...
            }
        }
    }
});
```


## Gamepad

**Options:**

| Property      | Type    | Value  | Description           |
| ------------- | ------- | ------ | --------------------- |
| `fullscreen`  | Boolean | `true` | Invoke FullScreen API |
| `controllers` | Object  | `{}`   | *See:* **Controller** |

## Gamepad Methods:

| Property  | Description                            |
| --------- | -------------------------------------- |
| `destroy` | Destroys all Controllers               |
| `vibrate` | Vibrate *ms* (Number or pattern Array) |

## Controller `Joystick`, `Button`

To create your **controllers** (Joysticks, Buttons), add to Gamepad's `controllers` a desired ID for your controller and this **Options:** Object value like: `fireMissileButton: {...options}`

**Options:**

| Property     | Type     | Value                       | Description                                             |
| ------------ | -------- | --------------------------- | ------------------------------------------------------- |
| `type`       | String   | `"button"` `"joystick"`     | Type of controller                                      |
| `parent`     | String   | `"body"`                    | Selector, where to insert the Controller                |
| `axis`       | String   | `"all"` `"x"` `"y"`         | Joystick movement axis                                  |
| `radius`     | Number   | `50`                        | Controller radius                                       |
| `text`       | String   | `""`                        | Button text                                             |
| `position`   | Object   | `{top: "50%", left: "50%"}` | Controller position inside Gamepad                      |
| `reposition` | Boolean  | `false`                     | If on touch-start the controller should change position |
| `style`      | Object   | `{}`                        | Additional custom CSS styles                            |
| `onInput`    | Function |                             | Triggered on input (move, down, up)                     |

Inside the `onInput()` method you can use the `this.value` and `this.angle` values.

| Controller type | `angle`          | `value`                      |
| --------------- | ---------------- | ---------------------------- |
| `Button`        | Always `0`       | `1` on press, `0` on release |
| `Joystick`      | Angle in radians | Float `0.0` to `1.0`         |

## Controller Methods:

| Property  | Description                      |
| --------- | -------------------------------- |
| `destroy` | Destroys the specific Controller |



To preview all your Controllers instances:

```
const GP = new Gamepad(myGamepadOptions);
console.log(GP.controllers);
```

which will give you your controllers IDs followed by their respective Controller Subclasses.   
Like: i.e:

```
Object {
    move: Joystick{},
    fire_1: Button{},
    fire_2: Button{},
    settings: Button{}
}
```