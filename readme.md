# Gamepad

Creates a virtual multi-touch *gamepad* with virtual **buttons** and **joystick** for your games or IOT!  

> *Beta*

![JavaScript Virtual Gamepad Controller With Joystick](example/gamepad-js.png)

## Getting Started

**Example:**

```js
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
                // // If you update your Player position and angle continuosly inside a
                // // requestAnimationFrame you're good to go with i.e:
                // Payer.controller.value = this.value;
                // Payer.controller.angle = this.angle;
                //
                // // otherwise use here something like:
                // Player.move(this.value, this.angle);
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
                // // If value is 1 - Player should fire!
                // if (!this.value) return;
                // Player.fire();
                GP.vibrate(100); // Vibrate the Gamepad for 100ms
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
                // if (!this.value) return; // (value is 0, do nothing) 
                //
                // // Open Settings panel to pause game, restart, options etc...
                // Game.settings.open()
            }
        }
    }
});

// // When needed: 
// // Vibrate for 200, 100 and 200 ms with 30ms pauses in between
// GP.vibrate([200, 30, 100, 30, 200]) 
//
// // Destroy Gamepad instance
// GP.destroy(); 
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

| Property     | Type     | Value                       | Description                            |
| ------------ | -------- | --------------------------- | -------------------------------------- |
| `type`       | String   | `"button"` `"joystick"`     | Type of controller                     |
| `parent`     | String   | `"body"`                    | Parent Selector (to insert into)       |
| `axis`       | String   | `"all"` `"x"` `"y"`         | Joystick movement axis                 |
| `radius`     | Number   | `50`                        | Controller radius                      |
| `text`       | String   | `""`                        | Button text                            |
| `position`   | Object   | `{top: "50%", left: "50%"}` | Controller position inside Gamepad     |
| `reposition` | Boolean  | `false`                     | Change position on touchstart          |
| `style`      | Object   | `{}`                        | Additional custom CSS styles           |
| `onInput`    | Function |                             | Triggered on touch\[start\|move\|end\] |

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

## Development and run Example demo

```sh
npm i
npm run dev # and head to http://localhost:3000

# To build the example
npm run build
# To serve the built project from /dist
npm run serve  # http://localhost:5000
```

Since **only touch events are supported**: open Dev tools, inspect, and set preview as *Mobile*  

### Test example demo from handheld

To test from a bobile device: 

- Run `npm run dev`
- Set your Mobile device Settings Developer Mode ON, and turn ON **_USB Debugging_** mode  
- In your computer find your IPv4 Address using `ipconfig` or `ifconfig` from terminal.
- Head to Chrome on your mobile to that address, i.e: http://192.168.8.106:3000/
- On your computer, open chrome://inspect/#devices and wait for your device and chrome tab to appear
- Hit: the button **_inspect fallback_**

