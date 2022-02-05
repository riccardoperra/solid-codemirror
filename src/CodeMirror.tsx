import { Component, createEffect, mergeProps, onCleanup, splitProps } from 'solid-js';
import { Extension } from '@codemirror/state';
import { CodeMirrorComponentProps } from '~/types/codeMirrorProps';
import { createCodeMirror } from '~/createCodeMirror';

export const CodeMirror: Component<CodeMirrorComponentProps> = props => {
  const [pickedProps, others] = splitProps(props, [
    'className',
    'value',
    'selection',
    'onChange',
    'onUpdate',
    'autoFocus',
    'theme',
    'height',
    'minHeight',
    'maxHeight',
    'width',
    'minWidth',
    'maxWidth',
    'basicSetup',
    'placeholder',
    'editable',
    'root'
  ]);

  const computedProps = mergeProps(
    {
      extensions: [] as Extension[],
      theme: 'light',
      height: '',
      minHeight: '',
      maxHeight: '',
      placeHolder: '',
      width: '',
      minWidth: '',
      maxWidth: '',
      editable: true,
      indentWithTab: true,
      basicSetup: true
    },
    pickedProps
  );

  let editor!: HTMLDivElement;

  const { view, setProps, setContainer } = createCodeMirror({
    container: editor,
    ...computedProps
  });

  createEffect(() => setContainer(editor));
  createEffect(() => setProps(computedProps));
  onCleanup(() => view()?.destroy());

  const defaultClassNames = `cm-theme-${pickedProps.theme}`;

  return (
    <div
      ref={editor}
      class={`${defaultClassNames}${
        pickedProps.className ? ` ${pickedProps.className}` : ''
      }`}
      {...others}
    />
  );
};
