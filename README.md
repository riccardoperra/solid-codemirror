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

## Basic usage

Create an editor with `createCodeMirror` and attach its `ref` to a host element.

```tsx
import { createCodeMirror } from 'solid-codemirror';

export function App() {
  const { ref } = createCodeMirror({ value: "console.log('hello world!')" });
  return <div ref={ref} />;
}
```

| Return value | Use it to… |
| --- | --- |
| `ref` | Attach the editor to a host element. |
| `editorView` | Read the native CodeMirror view. It returns `undefined` until the host is assigned and Solid flushes the update. |
| `createExtension` | Add a compartment for configuration that can change. |
| `setEditorState` | Switch documents and retrieve the outgoing state. |

Pass `extensions` to `createCodeMirror` for fields and plugins that must be
installed as soon as the view is available. Pass reactive configuration to
[`createExtension`](#handle-custom-extensions). The library tracks the accessor
for you.

`value` seeds each new view. Use `createEditorControlledValue` for later external
text changes. When the document and a state field must change together, dispatch
one CodeMirror transaction with both `changes` and `effects`.

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

`createEditorReadonly` is a shortcut for a read-only editor that stays keyboard
focusable. It sets `EditorState.readOnly` to `true`, sets `EditorView.editable`
to `false`, and adds `tabindex="0"` to the editor content. With the search
keymap installed, the focused editor can still handle `Cmd/Ctrl+F`.
Programmatic transactions can still update the document.

```tsx
import { createCodeMirror, createEditorReadonly } from 'solid-codemirror';

function App(props: { readOnly: boolean }) {
  const { ref, editorView } = createCodeMirror();
  createEditorReadonly(editorView, () => props.readOnly);
  return <div ref={ref} />;
}
```

To control the two settings independently, pass CodeMirror's facets directly
to `createExtension`.

- `EditorState.readOnly` tells CodeMirror's editing commands whether the
  document can be changed by the user. Use it alone to keep the default DOM
  behavior and focus.
- `EditorView.editable` controls the DOM's `contenteditable` setting.
  Use `EditorView.editable.of(false)` to turn off DOM editing. To keep the
  content reachable by keyboard, also add
  `EditorView.contentAttributes.of({ tabindex: '0' })`.

```tsx
import { EditorState } from '@codemirror/state';
import { createCodeMirror } from 'solid-codemirror';

function App(props: { readOnly: boolean }) {
  const { ref, createExtension } = createCodeMirror();
  createExtension(() => EditorState.readOnly.of(props.readOnly));
  return <div ref={ref} />;
}
```

[CodeMirror read-only editor example](https://codemirror.net/examples/readonly/)

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

A compartment is a slot in CodeMirror's configuration. Each `createExtension`
call creates one compartment. Pass an accessor to let Solid track its
dependencies. When the accessor returns a different extension, solid-codemirror
reconfigures that slot. You can call `createExtension` directly during component
setup. The library creates the effect.

```tsx
import { createCodeMirror } from 'solid-codemirror';
import { createSignal } from 'solid-js';
import { EditorView, lineNumbers } from '@codemirror/view';

const darkTheme = EditorView.theme(
  { '&': { color: '#f5f7ff', backgroundColor: '#202635' } },
  { dark: true },
);

export function App() {
  const [showLineNumbers, setShowLineNumbers] = createSignal(true);
  const [dark, setDark] = createSignal(false);
  const { ref, createExtension } = createCodeMirror({ value: 'const answer = 42;' });

  createExtension(() => (showLineNumbers() ? lineNumbers() : []));
  createExtension(() => (dark() ? darkTheme : []));

  return (
    <>
      <button type="button" onClick={() => setShowLineNumbers((show) => !show)}>
        Toggle line numbers
      </button>
      <button type="button" onClick={() => setDark((enabled) => !enabled)}>
        Toggle theme
      </button>
      <div ref={ref} />
    </>
  );
}
```

The two calls above update independently. To replace several extensions
together, return them in an array from one accessor. Return `[]` or `undefined`
to clear the compartment. To replace its contents manually, call the function
returned by `createExtension`. The replacement lasts until the accessor
returns a different extension. [CodeMirror compartments](https://codemirror.net/docs/ref/#state.Compartment)

### Lazy loading extensions

For a language that changes with reactive inputs, create a Solid 2 async memo
and pass its accessor to `createExtension`. Give the memo a `loadingValue` of
`[]` to show an editor before the first language loads.
[Reactive language example](./MIGRATION.md#5-load-extensions-asynchronously)

For a one-time dynamic import, pass the loader and the view accessor to
`createLazyCompartmentExtension`. Read `loading` to show progress.

```tsx
import { createCodeMirror, createLazyCompartmentExtension } from 'solid-codemirror';

function App() {
  const { ref, editorView } = createCodeMirror();
  const language = createLazyCompartmentExtension(
    () => import('@codemirror/lang-javascript').then(({ javascript }) => javascript()),
    editorView,
  );

  return (
    <>
      {language.loading && <p>Loading language…</p>}
      <div ref={ref} />
    </>
  );
}
```

Install `@codemirror/lang-javascript` to run this example.

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
