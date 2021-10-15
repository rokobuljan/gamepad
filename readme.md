# Gamepad

Creates a virtual *gamepad* with virtual **buttons** and **joystick** for your games!


## Gamepad Instance:

| Property      | Type    | Default value | Description           |
| ------------- | ------- | ------------- | --------------------- |
| `fulscreen`   | Boolean | `true`        | Invoke FullScreen API |
| `controllers` | Object  | `{}`          | See: \<Controller\>   |

## Controller:

To create your controllers (Joysticks, Buttons), add to Gamepad's `controllers` a desired ˙id˙ for your controller and this options:

| Property    | Type     | Value                       | Description                      |
| ----------- | -------- | --------------------------- | -------------------------------- |
| `type`      | String   | `"button"` `"joystick"`     | Type of controller               |
| `parent`    | String   | `"body"`                    | Where to append the Controller   |
| `axis`      | String   | `"all"` `"x"` `"y"`         | Joystick movement axis           |
| `radius`    | Number   | `50`                        | Controller radius                |
| `text`      | String   | `""`                        | Text                             |
| `position`  | Object   | `{top: "50%", left: "50%"}` | Controller position              |
| `style`     | Object   | `{}`                        | Additional custom styles         |
| `fulscreen` | Boolean  | `true`                      | Invoke FullScreen API            |
| `fulscreen` | Boolean  | `true`                      | Invoke FullScreen API            |
| `fulscreen` | Boolean  | `true`                      | Invoke FullScreen API            |
| `fulscreen` | Boolean  | `true`                      | Invoke FullScreen API            |
| `fulscreen` | Boolean  | `true`                      | Invoke FullScreen API            |
| `fulscreen` | Boolean  | `true`                      | Invoke FullScreen API            |
| `fulscreen` | Boolean  | `true`                      | Invoke FullScreen API            |
| `onInput`   | Function | `true`                      | Triggered when the state changes |

Inside the `onInput()` method you can use the `this.value` and `this.angle` values.

| Controller type | `angle`          | `value`                                 |
| --------------- | ---------------- | --------------------------------------- |
| `Button`        | Always `0`       | `1` on pressed and `0` on touch release |
| `Joystick`      | Angle in radians | Float `0.0` to `1.0`                    |