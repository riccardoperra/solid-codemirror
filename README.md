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

> **Warning** It is currently under development and many refactors are still to be done.

## Installation

```bash
# pnpm
> pnpm solid-codemirror
# or yarn
> yarn add solid-codemirror
# or npm
> npm i solid-codemirror
```

> **Note** This library depends on [@codemirror/state](https://github.com/codemirror/state)
> and [@codemirror/view](https://github.com/codemirror/state) v6.0.0. These libraries are flagged as peerDependencies.
> It's recommended to manually install both of them to have more flexibility

## Basic Usage

```tsx
import { createCodeMirror } from 'solid-codemirror';
import { createSignal, onMount } from 'solid-js';

export const App = () => {
  let ref: HTMLDivElement | undefined;
  const [value, setValue] = createSignal("console.log('hello world!')");

  // Creates a CodeMirror6 Editor
  const { editorView, setRef: setEditorRef } = createCodeMirror({
    value: value(),
  });

  // Attach the editor to the DOM element.
  onMount(() => setEditorRef(ref));

  return <div ref={ref} />;
};
```

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

Each extension which you need to develop your editor **must be** installed individually.

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
  const { ref } = createCodeMirror();
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
  const { ref } = createCodeMirror({ onValueChange: setCode });
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

## Demo

// WIP

## License

Licensed under the MIT License.
