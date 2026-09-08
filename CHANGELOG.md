# Changelog

## 3.1.0 - 2026-09-08

- Controller IDs are optional and generated automatically when omitted or empty.
  Standalone constructors also accept no options. Explicit IDs remain supported.
- Added horizontal and vertical joysticks to the demo; the horizontal joystick
  rotates the ship with analog strength and frame-scaled movement.
- Simplified the README, added a theme-aware SVG logo, and published the demo
  on GitHub Pages.

## 3.0.0 - 2026-09-08

### Breaking changes

- Internal pointer handlers, fullscreen listeners, rendering helpers and
  class-owned DOM references are now JavaScript private members. Use the public
  `Gamepad` methods, controller `init()`/`destroy()`, and `onInput()` callbacks.
- Lifecycle hooks and the shared controller element are marked `@protected`
  for subclasses. Their extension points are documented in the library JSDoc.
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
