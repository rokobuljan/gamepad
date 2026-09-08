const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

test("JSDoc protects internals and preserves public options, callbacks and subclass hooks", () => {
    const root = path.resolve(__dirname, "..");
    const fixture = path.join(root, "tests", "consumer.js");
    const source = `
import { Button, Joystick, DPad, Gamepad } from '../gamepad.js';
import { elNew, el } from '../utils.js';

const button = new Button({ id: 'fire', onInput() {
    this.value.toFixed();
    // @ts-expect-error Callback this must not become any.
    this.nonexistent();
    // @ts-expect-error Private DOM references are unavailable even in callbacks.
    this.elParent;
} });
const gp = new Gamepad([{ id: 'move', onInput() {
    this.angle.toFixed();
    // @ts-expect-error Gamepad option callbacks must also be typed.
    this.value.toUpperCase();
} }]);
gp.add(button, { id: 'pad', type: 'dpad', deadZone: 0.2, onInput() {
    this.direction.toFixed();
    // @ts-expect-error Variadic add must contextually type callbacks.
    this.nonexistent();
} }).remove(button, 'pad').vibrate([100, 30, 100]).destroy();
// @ts-expect-error No public pointer handler.
button.handleStart(new PointerEvent('pointerdown'));
// @ts-expect-error No public anchor.
button.elAnchor;
// @ts-expect-error No public parent element.
button.elParent;
// @ts-expect-error Hooks are protected.
button.onStart();
// @ts-expect-error Even hooks without subclass overrides are protected.
button.onInit();
// @ts-expect-error Shared DOM is protected.
button.el;
const stick = new Joystick({ id: 'stick' });
// @ts-expect-error No public handle.
stick.elHandle;
// @ts-expect-error Joystick hooks are protected.
stick.onMove();
const pad = new DPad({ id: 'pad' });
// @ts-expect-error No public D-pad update helper.
pad.update();
// @ts-expect-error No public D-pad highlight helper.
pad.highlight();
// @ts-expect-error No public D-pad arm.
pad.elX;
// @ts-expect-error Fullscreen listener is private.
gp.handleFullscreen();
new Button({}).id.toUpperCase();
new Button().id.toUpperCase();
new Joystick().id.toUpperCase();
new DPad().id.toUpperCase();
new Gamepad([{}, { type: 'button' }, { type: 'dpad', onInput() {
    this.id.toUpperCase();
    this.value.toFixed();
} }]);
// @ts-expect-error An explicit ID must be a string.
new Button({ id: 42 });
// @ts-expect-error Invalid axis.
new Joystick({ id: 'bad', axis: 'z' });
// @ts-expect-error Misspelled option.
new DPad({ id: 'bad', deadzone: 0.2 });
// @ts-expect-error Invalid output assignment.
button.value = 'bad';

class CustomButton extends Button {
    onStart() {
        super.onStart();
        this.el?.classList.add('custom');
    }
}
new CustomButton({ id: 'custom' }).init();
elNew('input', { value: 'hello' }).value.toUpperCase();
// @ts-expect-error Preserve element-specific property checking.
elNew('div', { value: 'bad' });
// @ts-expect-error A selector may not match anything.
el('div').remove();
`;

    const config = ts.readConfigFile(path.join(root, "jsconfig.json"), ts.sys.readFile);
    assert.equal(config.error, undefined);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    const host = ts.createCompilerHost(parsed.options);
    const readFile = host.readFile.bind(host);
    host.readFile = file => path.resolve(file) === fixture ? source : readFile(file);
    const program = ts.createProgram([...parsed.fileNames, fixture], parsed.options, host);
    const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
    assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: file => file,
        getCurrentDirectory: () => root,
        getNewLine: () => "\n",
    }));
});
