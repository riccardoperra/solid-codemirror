import {Component, createEffect, onCleanup} from 'solid-js';
import {CodeMirrorComponentProps} from './types/codeMirrorProps';
import {createCodeMirror} from './createCodeMirror';
import {extractCodeMirrorProps} from "./utils/extractCodeMirrorProps";

export const CodeMirror: Component<CodeMirrorComponentProps> = props => {
  let editor!: HTMLDivElement;
  const {options, htmlAttrs} = extractCodeMirrorProps(props);

  const {
    view,
    setOptions,
    setContainer
  } = createCodeMirror({
    container: editor,
    ...options
  });

  createEffect(() => setContainer(editor));

  createEffect(() => setOptions(options as unknown))

  onCleanup(() => view()?.destroy());

  return (
    <div
      ref={ref => editor = ref}
      class={`solid-cm ${options?.className ? ` ${options.className}` : ''}`}
      {...htmlAttrs}
    />
  );
};
