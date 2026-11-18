---
"solid-codemirror": major
---

Support Solid 2 with the new effect and lifecycle APIs. Use solid-codemirror 2.x in Solid 1 projects.

Set `createCodeMirror({ extensions })` to install state fields, plugins, and other startup extensions before the view is exposed. Use `value` for the initial document and `createEditorControlledValue` to synchronize a reactive document. A dispatch batch calls `onValueChange` once with its final document.

Pass an accessor to `createExtension` to reconfigure a compartment when its value changes. Solid-codemirror tracks the accessor for you. Return `undefined` to clear the compartment. For an extension that loads as reactive inputs change, pass a Solid 2 async memo. For a one-time load, use `createLazyCompartmentExtension`.

Read-only editors remain keyboard focusable and report their read-only state to CodeMirror commands.

Use `setEditorState` to switch between document states while retaining the view's current configuration. Tag programmatic transactions with `ExternalChange` to skip `onValueChange`, or use `createEditorControlledValue` with `{ notify: false }`.

See the [migration guide](./MIGRATION.md) for upgrade steps and examples.
