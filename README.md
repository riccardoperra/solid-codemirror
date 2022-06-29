<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-codemirror&project=solid-codemirror" alt="solid-codemirror">
</p>

# solid-codemirror

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![NPM Downloads](https://img.shields.io/npm/dw/solid-codemirror?style=for-the-badge)](https://www.npmjs.com/package/riccardoperra/solid-codemirror)
[![npm version](https://img.shields.io/npm/v/solid-codemirror?style=for-the-badge)](https://www.npmjs.com/package/solid-codemirror)
[![license](https://img.shields.io/npm/l/solid-codemirror?style=for-the-badge)](https://github.com/riccardoperra/solid-codemirror/blob/main/LICENSE)

`solid-codemirror` provides a set of utilities to make **CodeMirror6** integration easier
for [SolidJS](https://github.com/solidjs/solid).

## Getting started

1. Install the dependencies

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

2. Declare `CodeMirror` component in your template.

```tsx
import { CodeMirror } from 'solid-codemirror';
import { createSignal } from 'solid-js';

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
import { createEffect } from 'solid-js';
import { createCodeMirror } from 'solid-codemirror';

// These extensions are not built-in in solid-codemirror
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';


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
	} = createCodeMirror({
		container: editor.current,
		extensions: [oneDark(), javascript()],
		value: code,
		basicSetup: true,
	});


	// 2. Set the container after rendering completes
	createEffect(() => setContainer(editor))

	return <div ref={editor} />;
}
```

## License

Licensed under the MIT License.

