# Gamepad

Creates a virtual multi-touch *gamepad* with virtual **buttons** and **joystick** for your games or IOT!  

> *Beta*

![JavaScript Virtual Gamepad Controller With Joystick](example/gamepad-js.png)

## Getting Started

**Example:**

```js
const GP = new Gamepad({
    controllers: {
        move: { // Any ID you want. Must be unique
            type: "joystick", 
            parent: "#app-left", // Where to append the controller
            fixed: false, // Change position on touch-start
            position: { // Initial position on load
                left: "15%",
                top: "50%",
            },
            onInput() { // Triggered on angle or value change.
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
        fire: {  // Any ID you want. Must be unique
            type: "button",
            parent: "#app-right",
            position: {
                right: "15%",
                bottom: "50%",
            },
            onInput() {
                // // If value is 1 - Player should fire!
                // if (!this.value) return;
                // Player.fire();
                GP.vibrate(100); // Vibrate the Gamepad for 100ms
                // // You can also use a pattern with pauses of 30ms:
                // GP.vibrate([200, 30, 100, 30, 200]) 
            }
        },
        settings: {  // Any ID you want. Must be unique
            type: "button",
            parent: "#app",
            spring: false, // Act as a checkbox
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
                // // Toggle Settings panel to pause game, restart, options etc...
                // Game.settings.toggle(this.isActive)
            }
        }
    }
});


// Retrieve all your Controllers
console.log(GP.controllers);

// // Destroy a specific Gamepad Controller instance
// GP.controllers.fire.destroy(); 

// // Destroy all Gamepad Controllers instances
// GP.destroy(); 
```

## Active state CSS Styles

If you wnt to add *active* state styles use CSS like:

```css
.Gamepad-Controller.is-active {
    box-shadow: 0 0 50px currentColor;
}
```


## Gamepad

**Options:**

| Property      | Type    | Value                                 | Description                          |
| ------------- | ------- | ------------------------------------- | ------------------------------------ |
| `fullscreen`  | Boolean | `false`                               | Invoke FullScreen API on first touch |
| `controllers` | Object  | `{"SOME ID": {...controllerOptions}}` | *See: **Controller - Options***      |

## Gamepad Methods:

| Property    | Description                            |
| ----------- | -------------------------------------- |
| `destroy()` | Destroys all Controllers               |
| `vibrate()` | Vibrate *ms* (Number or pattern Array) |

## Controller (*Joystick, Button*)

To create your **controllers** (Joysticks, Buttons), add to Gamepad's `controllers` Object any desired property ID for your controller (must be unique!) 
like i.e:: `fireMissileButton: {...controllerOptions}`

**Options:**

| Property   | Type    | Value                       | Description                         |
| ---------- | ------- | --------------------------- | ----------------------------------- |
| `axis`     | String  | `"all"` `"x"` `"y"`         | Movement axis constraint (Joystick) |
| `fixed`    | Boolean | `true`                      | Change position on touchstart       |
| `text`     | String  | `""`                        | Button text or inner HTML           |
| `type`     | String  | `"button"` `"joystick"`     | Type of controller                  |
| `parent`   | String  | `"body"`                    | Parent Selector (to insert into)    |
| `position` | Object  | `{top: "50%", left: "50%"}` | Controller position inside Gamepad  |
| `radius`   | Number  | `50`                        | Controller radius in *px*           |
| `style`    | Object  | `{}`                        | Additional custom CSS styles        |

**Methods:**

| Method        | Type     | Description                             |
| ------------- | -------- | --------------------------------------- |
| `onInput()`\* | Function | Callback on touch-start/move/end/cancel |


***Notice:** 
the `onInput()` will not be triggered on touch-end for controllers which property `spring` is set to `false`. 

## Reading Controller output values

Inside the `onInput()` method you can use the `this` to retrieve this various dynamic values.  


Alternatively, you can also use your Gamepad instance controllers like i.e: `const throttleVal = GP.controllers.throttle.value` (where `throttle` is the Controller ID you set when registering your controllers `{throttle: {...controllerOptions}}`)

**Dynamic Controller properties and its values**:

| Property        | Type    | Description                               |
| --------------- | ------- | ----------------------------------------- |
| `value`         | Number  | `0.0..1.0` (Joystick);  `0, 1` (Button)   |
| `angle`         | Number  | Angle in radians (Joystick)               |
| `isPress`       | Boolean | `true` on touch-start                     |
| `isDrag`        | Boolean | `true` on touch-move (Joystick)           |
| `isActive`      | Boolean | `true` if has "is-active" className       |
| `x_start`       | Number  | *px* Relative x touch-start coordinates   |
| `y_start`       | Number  | *px* Relative y touch-start coordinates   |
| `x_drag`        | Number  | *px* Relative x touch-move coordinates    |
| `y_drag`        | Number  | *px* Relative y touch-move coordinates    |
| `x_diff`        | Number  | *px* Difference x from start and move     |
| `y_diff`        | Number  | *px* Difference y from start and move     |
| `distance_drag` | Number  | *px* Drag distance (capped to max radius) |

PS: Inspect your desired Controller ID to get more useful properties and values.



## Controller Methods:

| Method      | Description                      |
| ----------- | -------------------------------- |
| `destroy()` | Destroys the specific Controller |



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

## Development and Example demo

```sh
npm i
npm run dev # and head to http://localhost:3000

# To build the example
npm run build
# To serve the built project from /dist
npm run serve  # http://localhost:5000
```

Since **only touch events are supported**: open Dev tools, inspect, and set preview as *Mobile*  

### Test example demo from handheld device

To test the example demo from a mobile device: 

- Run `npm run dev`
- Set your Mobile device Settings Developer Mode ON, and turn ON **_USB Debugging_** mode  
- In your computer find your IPv4 Address using `ipconfig` or `ifconfig` from terminal.
- Head to Chrome on your mobile to that address, i.e: http://192.168.8.106:3000/
- On your computer, open chrome://inspect/#devices and wait for your device and chrome tab to appear
- Hit: the button **_inspect fallback_**

## Licence

MIT

