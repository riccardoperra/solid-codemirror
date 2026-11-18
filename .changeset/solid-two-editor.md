---
"solid-codemirror": major
---

Support Solid 2 with the new effect and lifecycle APIs. Use solid-codemirror 2.x in Solid 1 projects.

Set `createCodeMirror({ extensions })` to install state fields, plugins, and other startup extensions before the view is exposed. Use `value` for the initial document and `createEditorControlledValue` to synchronize a reactive document. A dispatch batch calls `onValueChange` once with its final document.

Reactive compartments can be configured before mount and cleared with `undefined`. Read-only editors remain keyboard focusable and report their read-only state to CodeMirror commands.
