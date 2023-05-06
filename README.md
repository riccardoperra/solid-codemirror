<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-codemirror&project=solid-codemirror" alt="solid-codemirror">
</p>

# solid-codemirror

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![NPM Downloads](https://img.shields.io/npm/dw/solid-codemirror?style=for-the-badge)](https://www.npmjs.com/package/riccardoperra/solid-codemirror)
[![npm version](https://img.shields.io/npm/v/solid-codemirror?style=for-the-badge)](https://www.npmjs.com/package/solid-codemirror)
[![license](https://img.shields.io/npm/l/solid-codemirror?style=for-the-badge)](https://github.com/riccardoperra/solid-codemirror/blob/main/LICENSE)

**solid-codemirror** provides a set of utilities to make **CodeMirror6** integration easier
for [SolidJS](https://github.com/solidjs/solid).

This library was initially born to be the entry of the SolidJS hackathon, but has become the core editor
of [CodeImage](https://github.com/riccardoperra/codeimage).

## Installation

```bash
# pnpm
> pnpm add solid-codemirror
# or yarn
> yarn add solid-codemirror
# or npm
> npm i solid-codemirror
```

> **Note** This library depends on [@codemirror/state](https://github.com/codemirror/state)
> and [@codemirror/view](https://github.com/codemirror/state) v6.0.0. These libraries are flagged as **
> peerDependencies**.
> It's recommended to manually install both of them to have more control and flexibility for implementation

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

## Basic Usage

First, we need to create a new CodeMirror instance through the `createCodeMirror` function. Next, the given `ref`
object must be attached to a DOM Element in order to initialize the `EditorView` instance with his own `EditorState`.

```tsx
import { createCodeMirror } from 'solid-codemirror';
import { createSignal, onMount } from 'solid-js';

export const App = () => {
  const { editorView, ref: editorRef } = createCodeMirror({
    // The initial value of the editor
    value: "console.log('hello world!')",
    // Fired whenever the editor code value changes.
    onValueChange: (value) => console.log('value changed', value),
    // Fired whenever a change occurs to the document. There is a certain difference with `onChange`.
    onModelViewUpdate: (modelView) => console.log('modelView updated', modelView),
  });

  return <div ref={editorRef} />;
};
```

The `createCodeMirror` function is the main function of `solid-codemirror` to start creating your editor. It exposes the
following properties:

| Property     | Description                                                                                                                                                                                      |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ref`        | The HTMLElement object which will be attached to the EditorView instance                                                                                                                         |
| `editorView` | The current EditorView instance of CodeMirror. Will be `null` as default, and it will be valued when the given `ref` is mounted in the DOM                                                       |
| `createExtension` | A function to create a new extension for CodeMirror using compartments. It's a shortand for the `createCompartmentExtension` helper which automatically attaches the right `EditorView` instance |

## Modularity

> https://codemirror.net/docs/guide/ \
> CodeMirror is set up as a collection of separate modules that, together, provide a full-featured text and code editor.
> On the bright side, this means that you can pick and choose which features you need, and even replace core
> functionality
> with a custom implementation if you need to. On the less bright side, this means that setting up an editor requires
> you
> to put together a bunch of pieces.

As the documentation says, CodeMirror6 is modular.

solid-codemirror **will not be a replacement** for all the modules of
CodeMirror6, but will try to provide only the primitives necessary to integrate them in SolidJS.

Each extension which you need to develop your editor **must be** installed individually and integrated individually.

## Extensions

### Control editor focus and observe `focused` state changes

```ts
import { createCodeMirror, createEditorFocus } from 'solid-codemirror';
import { createSignal } from 'solid-js';

const { editorView } = createCodeMirror();
const [readOnly, setReadOnly] = createSignal(true);
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

After the CodeMirror editor is mounted, you can update its readonly state using the
`createReadonlyEditor` function that accept the editor view and the readOnly accessor.
> **Note** Updating the accessor, the editor readOnly state will be updated automatically;

```typescript jsx
import { createCodeMirror, createEditorReadonly } from 'solid-codemirror';
import { createSignal } from 'solid-js';

function App() {
  const { ref, editorView } = createCodeMirror();
  const [readOnly, setReadOnly] = createSignal(true);
  createEditorReadonly(editorView, readonly);

  return <div ref={ref} />
}
```

### Control editor code using signals

After CodeMirror editor is mounted, you can control the code state using the
`createEditorControlledValue`.

> **Note** The value of the editor is already memoized

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

### Handle custom extensions

After CodeMirror editor is mounted, you can handle custom extensions thanks to the
`createExtension` function. It both accept an `Extension` or `Accessor<Extension | undefined>` then
it will be automatically reconfigured when the extension changes. Otherwise, you can manually reconfigure them using
the returned `reconfigure` function.

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
import { createLazyCompartmentExtension } from './createLazyCompartmentExtension';
import { Show } from 'solid-js';

function App() {
  const [code, setCode] = createSignal("console.log('hello world!')");
  const { ref, createExtension } = createCodeMirror({ onValueChange: setCode });

  // ✅ 2. Call the helper providing a Promise<Extension>
  // The extension will be configured only after the Promise resolves
  const largeExt = createLazyCompartmentExtension(
    () => import('./large-extension').then(res => res.largeExtension)
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

## Demo

// WIP

You can also view an advanced implementation of `solid-codemirror`
through [CodeImage](https://github.com/riccardoperra/codeimage/blob/main/apps/codeimage/src/components/CustomEditor/CustomEditor.tsx)
implementation

## Author

- [Riccardo Perra](https://github.com/riccardoperra/solid-codemirror)

## License

Licensed under the [MIT License](./LICENSE).
