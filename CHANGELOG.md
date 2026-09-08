# Changelog

## 3.0.0 - 2026-09-08

### Breaking changes

- Internal pointer handlers, fullscreen listeners, rendering helpers and
  class-owned DOM references are now JavaScript private members. Use the public
  `Gamepad` methods, controller `init()`/`destroy()`, and `onInput()` callbacks.
- Lifecycle hooks and the shared controller element are marked `@protected`
  for subclasses. See the README's public API and subclass hooks section.
- The package explicitly declares ES modules. Use `import` syntax when consuming
  the library; the production bundle is also an ES module.
- Package exports expose the entry point, `gamepad.js`, `utils.js`,
  `controllers/*.js`, the production bundle and `package.json`.

### Improvements

- Added JSDoc types for options, callbacks, output state, events and utilities,
  with strict JavaScript type checking and regression tests.
- Added a production library bundle and source map in `dist/lib/`. Package
  imports continue to use the JavaScript source modules, with type declarations
  generated from JSDoc in `dist/types/` for installed-package consumers.
- The npm package contains the library, bundle and documentation; development
  tests, tooling and the demo remain in the Git repository.
- Controller destruction removes listeners and clears DOM references, including
  joystick handles and D-pad arms. Reinitialization reuses the controller safely.
- Fullscreen click listeners are scoped to each Gamepad instance.
- D-pads respect the configured `deadZone`, including zero.
- Preserved upstream multitouch isolation and browser-specific text-selection
  fixes in the JavaScript implementation.
