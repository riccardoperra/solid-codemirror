import { VoidComponent, createEffect, onCleanup } from 'solid-js';
import { createCodeMirror } from './createCodeMirror';
import { extractCodeMirrorProps } from './utils/extractCodeMirrorProps';
import { CodeMirrorComponentProps } from './types/codeMirrorProps';

export const CodeMirror: VoidComponent<CodeMirrorComponentProps> = (props) => {
  let editor!: HTMLDivElement;
  const { options, htmlAttrs } = extractCodeMirrorProps(props);

  const { view, setOptions, setContainer } = createCodeMirror({
    container: editor,
    ...options,
  });

  createEffect(() => setContainer(editor));

  createEffect(() => setOptions(options as unknown));

  onCleanup(() => view()?.destroy());

  return (
    <div
      ref={(ref) => (editor = ref)}
      class={`solid-cm ${options?.class ? ` ${options.class}` : ''}`}
      {...htmlAttrs}
    />
  );
};
