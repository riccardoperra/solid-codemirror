# react-codemirror

[![NPM Downloads](https://img.shields.io/npm/dw/solid-codemirror?style=flat)](https://www.npmjs.com/package/riccardoperra/solid-codemirror)
[![npm version](https://img.shields.io/npm/v/solid-codemirror)](https://www.npmjs.com/package/@riccardoperra/solid-codemirror)

CodeMirror component for [SolidJS](https://github.com/solidjs/solid). Porting from [react-codemirror](https://github.com/uiwjs/react-codemirror)

**Features:**

✅ Quickly and easily configure the API. \
✅ Uses [codemirror 6](https://codemirror.net/6/) \
✅ Written in TypeScript.

## Install

- npm
  ```bash
  npm install solid-codemirror --save
  ```

- pnpm
  ```bash
  pnpm install solid-codemirror --save
  ```

- yarn
  ```bash
  yarn install solid-codemirror --save
  ```

## Usage

```tsx
import {CodeMirror} from 'solid-codemirror';
import {javascript} from '@codemirror/lang-javascript';

export const App = () => {
  return (
    <CodeMirror
      value="console.log('hello world!');"
      height="200px"
      extensions={[javascript({jsx: true})]}
      onChange={(value, viewUpdate) => {
        console.log('value:', value);
      }}
    />
  );
}
```

## With `createCodeMirror`

```tsx
import {createEffect, useRef} from 'solid-js';
import {createCodeMirror} from 'solid-codemirror';
import {javascript} from '@codemirror/lang-javascript';

const code = "console.log('hello world!')";

export const App = () => {
  let editor: HTMLDivElement;

  const {
    options,
    setOptions,
    state,
    setState,
    view,
    setView
  } = useCodeMirror({
    container: editor.current,
    extensions: [javascript()],
    value: code,
  });

  createEffect(() => setContainer(editor))

  return <div ref={editor}/>;
}
```

## Using component / custom theme

```jsx
import {CodeMirror} from "solid-codemirror";
import {oneDark} from '@codemirror/theme-one-dark';
import {javascript} from '@codemirror/lang-javascript';

export const App = () => {
  return (
    <CodeMirror
      value="console.log('hello world!');"
      height="100%"
      extensions={[
        oneDark(),
        javascript({jsx: true})
      ]}
      onChange={(value, viewUpdate) => {
        console.log('value:', value);
      }}
    />
  );
}
```

## License

Licensed under the MIT License.
