<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-codemirror&project=solid-codemirror" alt="solid-codemirror">
</p>

# solid-codemirror

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![NPM Downloads](https://img.shields.io/npm/dw/solid-codemirror?style=for-the-badge)](https://www.npmjs.com/package/solid-codemirror)
[![npm version](https://img.shields.io/npm/v/solid-codemirror?style=for-the-badge)](https://www.npmjs.com/package/solid-codemirror)
[![license](https://img.shields.io/npm/l/solid-codemirror?style=for-the-badge)](https://github.com/riccardoperra/solid-codemirror/blob/main/LICENSE)

**solid-codemirror** provides a set of utilities to make **CodeMirror6** integration easier
for [SolidJS](https://github.com/solidjs/solid).

This library was initially born to be the entry of the SolidJS hackathon, but has become the core editor
of [CodeImage](https://github.com/riccardoperra/codeimage).

## Installation

```bash
pnpm add solid-codemirror solid-js @codemirror/state @codemirror/view
```

Solid and CodeMirror are peer dependencies. Use one copy of each in your app.

### CodeMirror packages error fix

> **Warning** You may encounter this error using Vite

```bash
Error: Unrecognized extension value in extension set ([object Object]). 
This sometimes happens because multipleinstances of @codemirror/state are loaded, 
breaking instanceof checks.
```

If @codemirror/state and @codemirror/view are not working even if their version dont't mismatch, you can try to add the
following to your `vite.config.{js,ts}` file:

```typescript 
export default defineConfig({
  // Your configuration
  optimizeDeps: {
    // Add both @codemirror/state and @codemirror/view to included deps to optimize
    include: ['@codemirror/state', '@codemirror/view'],
  }
})
```

## Versions

| solid-codemirror | @codemirror/state | @codemirror/view | solid-js |
| ---------------- | ----------------- | ---------------- | -------- |
| 3.x              | ^6.6.0            | ^6.40.0          | ^2.0.0   |
| 2.3.x            | ^6.6.0            | ^6.40.0          | ^1.7.0   |

For a Solid 2 app built with Vite, use `@solidjs/web` and `@solidjs/vite-plugin`.
Follow the [migration guide](./MIGRATION.md) to update an existing editor from solid-codemirror 2.x.

## Basic Usage

First, we need to create a new CodeMirror instance through the `createCodeMirror` function. Next, the given `ref`
object must be attached to a DOM Element in order to initialize the `EditorView` instance with his own `EditorState`.

```tsx
import { createCodeMirror } from "solid-codemirror";

export const App = () => {
  const { editorView, ref: editorRef } = createCodeMirror({
    /**
     * The initial value of the editor
     */
    value: "console.log('hello world!')",
    /**
     * Fired whenever the editor code value changes.
     */
    onValueChange: (value) => console.log("value changed", value),
    /**
     * Fired whenever a change occurs to the document, every time the view updates.
     */
    onModelViewUpdate: (modelView) => console.log("modelView updated", modelView),
    /**
     * Fired whenever a transaction has been dispatched to the view.
     * Used to add external behavior to the transaction [dispatch function](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) for this editor view, which is the way updates get routed to the view
     */
    onTransactionDispatched: (tr, view) => console.log("Transaction", tr, view)
  });

  return <div ref={editorRef} />;
};
```

The `createCodeMirror` function is the main function of `solid-codemirror` to start creating your editor. It exposes the
following properties:

| Property          | Description                                                                                                                                                                                      |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ref`             | The HTMLElement object which will be attached to the EditorView instance                                                                                                                         |
| `editorView`      | The current CodeMirror view. Returns `undefined` until a host is assigned and Solid flushes the update.                                                       |
| `createExtension` | A function to create a new extension for CodeMirror using compartments. It's a shortand for the `createCompartmentExtension` helper which automatically attaches the right `EditorView` instance |

Pass `extensions` to `createCodeMirror` for state fields, plugins, and other extensions
that should be in place when `editorView()` first resolves. Use `createExtension`
for configuration that changes after setup.

`value` seeds each new view. Use `createEditorControlledValue` to apply later
external text changes. If the document and extension state need to change together,
dispatch a single CodeMirror transaction with both `changes` and `effects`.

### Switch documents in one editor

Keep an `EditorState` for each document and call `setEditorState(nextState)` when
the active document changes. The method returns the outgoing state so you can
store its document, selection, history, and custom state fields. It applies the
view's current extensions and managed compartments to the incoming state
before displaying it. A state swap does not emit `onValueChange`.

## Modularity

> https://codemirror.net/docs/guide/ \
> CodeMirror is set up as a collection of separate modules that, together, provide a full-featured text and code editor.
> On the bright side, this means that you can pick and choose which features you need, and even replace core
> functionality
> with a custom implementation if you need to. On the less bright side, this means that setting up an editor requires
> you
> to put together a bunch of pieces.

As the official documentation says, CodeMirror6 is modular.

solid-codemirror **will not be a replacement** for all the modules of
CodeMirror6, but will try to provide only the primitives necessary to integrate them in SolidJS.

Each extension which you need to develop your editor **must be** installed individually and integrated individually.

## Extensions

### Control editor focus and observe `focused` state changes

```ts
import { createCodeMirror, createEditorFocus } from 'solid-codemirror';
const { editorView } = createCodeMirror();
const {
  focused,
  setFocused
} = createEditorFocus(editorView, (focused) => console.log('focus changed', focused));

// Focus
setFocused(true);
// Blur
setFocused(false);
```

### Update editor readonly state

Pass a boolean accessor to `createEditorReadonly` to control read-only mode.
The editor stays keyboard focusable. Programmatic transactions can still update it.

```typescript jsx
import { createCodeMirror, createEditorReadonly } from 'solid-codemirror';
import { createSignal } from 'solid-js';

function App() {
  const { ref, editorView } = createCodeMirror();
  const [readOnly, setReadOnly] = createSignal(true);
  createEditorReadonly(editorView, readOnly);

  return <div ref={ref} />
}
```

### Control editor code using signals

After CodeMirror editor is mounted, you can control the code state using the
`createEditorControlledValue`.

```typescript jsx
import { createCodeMirror, createEditorControlledValue } from 'solid-codemirror';
import { createSignal } from 'solid-js';

function App() {
  const [code, setCode] = createSignal("console.log('hello world!')");
  const { ref, editorView } = createCodeMirror({ onValueChange: setCode });
  createEditorControlledValue(editorView, code);

  // Update code after 2.5s
  setTimeout(() => {
    setCode("console.log('updated!')");
  }, 2500);

  return <div ref={ref} />
}
```

Pass `{ notify: false }` as the third argument to apply external values without
echoing them through `onValueChange`. To tag a custom transaction, add
`ExternalChange.of(true)` to its annotations. Transaction and view observers
still receive the update. A batch containing any untagged document change emits
its final document once. Undo history is configured separately through
CodeMirror's `Transaction.addToHistory` annotation.

### Handle custom extensions

After CodeMirror editor is mounted, you can handle custom extensions thanks to the
`createExtension` function. It both accept an `Extension` or `Accessor<Extension | undefined>` then
it will be automatically reconfigured when the extension changes. Otherwise, you can manually reconfigure them using
the returned `reconfigure` function.

Return `undefined` or `[]` to clear the compartment. A manual reconfiguration
applies immediately to a mounted view and persists until the accessor returns a different extension.

For more details, see the official documentation about [compartments](https://codemirror.net/examples/reconfigure).

```typescript jsx
import { createCodeMirror } from 'solid-codemirror';
import { createSignal } from 'solid-js';
import { EditorView, lineNumbers } from '@codemirror/view';

function App() {
  const [code, setCode] = createSignal("console.log('hello world!')");
  const [showLineNumber, setShowLineNumber] = createSignal(true);
  const { ref, createExtension } = createCodeMirror({ onValueChange: setCode });

  const theme = EditorView.theme({
    '&': {
      background: 'red'
    }
  });

  // Add a static custom theme
  createExtension(theme);

  // Toggle extension
  createExtension(() => showLineNumber() ? lineNumbers() : []);

  // Remove line numbers after 2.5s
  setTimeout(() => {
    setShowLineNumber(false);
  }, 2500);

  return <div ref={ref} />
}
```

### Lazy loading extensions

Sometimes you may need to better split your custom extensions in order to reduce the initial bundle size.
This is the case where you need to use dynamic imports in order to resolve the module in lazy loading.

```tsx
// ✅ 1. Remove the static import
// import { largeExtension } from './large-extension';
import { createCodeMirror, createLazyCompartmentExtension } from 'solid-codemirror';
import { createSignal, Show } from 'solid-js';

function App() {
  const [code, setCode] = createSignal("console.log('hello world!')");
  const { ref, editorView } = createCodeMirror({ onValueChange: setCode });

  // ✅ 2. Call the helper providing a Promise<Extension>
  // The extension will be configured only after the Promise resolves
  const largeExt = createLazyCompartmentExtension(
    () => import('./large-extension').then(res => res.largeExtension),
    editorView
  );

  return (
    <div>
      <div ref={ref} />
      {/*✅ 3. You can read the pending state of the Promise*/}
      <Show when={largeExt.loading}>
        Loading...
      </Show>
    </div>
  )
}
```

## Development

Use Node.js 24 and the pnpm version pinned in `package.json`.

```bash
pnpm install
pnpm exec playwright install chromium
pnpm check
pnpm dev
```

The playground consumes the built package. Run `pnpm build` after changing library code.

Type in tab A, move the cursor, then open B and change the theme. Return to A to
see your text and cursor under the new theme. Undo to check that A kept its
history. An external update appears in the event log without incrementing the
save counter. Format trims trailing whitespace as one undoable edit.

## Author

- [Riccardo Perra](https://github.com/riccardoperra/solid-codemirror)

## License

Licensed under the [MIT License](./LICENSE).
