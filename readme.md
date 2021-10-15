# Gamepad

Creates a virtual *gamepad* with virtual **buttons** and **joystick** for your games or IOT!  
*Beta*


## Gamepad

**Options:**

| Property      | Type    | Default value | Description           |
| ------------- | ------- | ------------- | --------------------- |
| `fulscreen`   | Boolean | `true`        | Invoke FullScreen API |
| `controllers` | Object  | `{}`          | See: \<Controller\>   |

## Gamepad Methods:

| Property  | Description              |
| --------- | ------------------------ |
| `destroy` | Destroys all Controllers |

## Controller:

To create your controllers (Joysticks, Buttons), add to Gamepad's `controllers` a desired ID for your controller and this **Options:** Object value like: `fireMissileButton: {...options}`

**Options:**

| Property   | Type     | Value                       | Description                              |
| ---------- | -------- | --------------------------- | ---------------------------------------- |
| `type`     | String   | `"button"` `"joystick"`     | Type of controller                       |
| `parent`   | String   | `"body"`                    | Selector, where to insert the Controller |
| `axis`     | String   | `"all"` `"x"` `"y"`         | Joystick movement axis                   |
| `radius`   | Number   | `50`                        | Controller radius                        |
| `text`     | String   | `""`                        | Button text                              |
| `position` | Object   | `{top: "50%", left: "50%"}` | Controller position inside Gamepad       |
| `style`    | Object   | `{}`                        | Additional custom styles                 |
| `onInput`  | Function |                             | Triggered on input (move, down, up)      |

Inside the `onInput()` method you can use the `this.value` and `this.angle` values.

| Controller type | `angle`          | `value`                      |
| --------------- | ---------------- | ---------------------------- |
| `Button`        | Always `0`       | `1` on press, `0` on release |
| `Joystick`      | Angle in radians | Float `0.0` to `1.0`         |

## Controller Methods:

| Property  | Description                      |
| --------- | -------------------------------- |
| `destroy` | Destroys the soecific Controller |



Whenever you desire you can get your Controllers instances like:

```
const GP = new Gamepad({...});
console.log(GP.controllers);
```