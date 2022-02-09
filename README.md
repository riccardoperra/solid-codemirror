# solid-codemirror

[![NPM Downloads](https://img.shields.io/npm/dw/solid-codemirror?style=flat)](https://www.npmjs.com/package/riccardoperra/solid-codemirror)
[![npm version](https://img.shields.io/npm/v/solid-codemirror)](https://www.npmjs.com/package/solid-codemirror)
[![license](https://img.shields.io/npm/l/solid-codemirror)](https://github.com/riccardoperra/solid-codemirror/blob/main/LICENSE)


> CodeMirror component wrapper for [SolidJS](https://github.com/solidjs/solid)

###

**Features:**

✅ Quickly and easily configure the API. \
✅ Uses [codemirror 6](https://codemirror.net/6/) \
✅ Written in TypeScript.

## Table of contents

- [Table of contents](#table-of-contents)
- [Dependencies](#dependencies)
- [Getting started](#getting-started)
- [Usage with hooks](#usage-with-hooks)
- [License](#license)

## Dependencies
`solid-codemirror` depends on [@codemirror/state](https://github.com/codemirror/state) and [@codemirror/view](https://github.com/codemirror/state). 

These libraries are flagged as peerDependencies, they will be bundled automatically in this library if they are not declared in your package.json.


## Getting started

1. Install the dependencies

```sh
# pnpm
> pnpm add @codemirror/state @codemirror/view solid-codemirror
# or yarn
> yarn add @codemirror/state @codemirror/view solid-codemirror
# or npm
> npm i @codemirror/state @codemirror/view solid-codemirror
```

2. Declare `CodeMirror` component in your template.
```tsx
import {CodeMirror} from 'solid-codemirror';
import {createSignal} from 'solid-js';

export const App = () => {
  const [value, setValue] = createSignal("console.log('hello world!')");
  return (
    <CodeMirror
      value={value}
      height="200px"
      basicSetup={true}
      onChange={(value, viewUpdate) => setValue(value)}
    />
  );
}
```

## Usage with hooks
If you need a custom `CodeMirror` component, or you need more control, you can use the `createCodeMirror` hook. 

Note that the built-in `CodeMirror` component uses this hook internally.

```tsx
import {createEffect} from 'solid-js';
import {createCodeMirror} from 'solid-codemirror';

// These extensions are not built-in in solid-codemirror
import {oneDark} from '@codemirror/theme-one-dark';
import {javascript} from '@codemirror/lang-javascript';


export const App = () => {
  const code = "console.log('hello world!')";
  let editor: HTMLDivElement;

  // 1. Provide the default configuration
  const {
    options,
    setOptions,
    state,
    setState,
    view,
    setView
  } = useCodeMirror({
    container: editor.current,
    extensions: [oneDark(), javascript()],
    value: code,
    basicSetup: true,
  });


  // 2. Set the container after rendering completes
  createEffect(() => setContainer(editor))

  return <div ref={editor}/>;
}
```

## License

Licensed under the MIT License.
