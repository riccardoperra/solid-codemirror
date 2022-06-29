import { CodeMirrorComponentProps } from '../types/codeMirrorProps';
import { mergeProps, splitProps } from 'solid-js';
import { Extension } from '@codemirror/state';

export const extractCodeMirrorProps = (props: CodeMirrorComponentProps) => {
  const [options, htmlAttrs] = splitProps(props, [
    'class',
    'value',
    'selection',
    'onChange',
    'onUpdate',
    'autoFocus',
    'height',
    'minHeight',
    'maxHeight',
    'width',
    'minWidth',
    'maxWidth',
    'placeholder',
    'editable',
    'root',
    'extensions',
    'indentWithTab',
  ]);

  const computedOptions = mergeProps(
    {
      class: '',
      extensions: [] as Extension[],
      height: 'auto',
      minHeight: 'none',
      maxHeight: 'none',
      placeHolder: '',
      width: 'auto',
      minWidth: 'none',
      maxWidth: 'none',
      editable: true,
      indentWithTab: true,
      basicSetup: true,
    },
    options
  );

  return { options: computedOptions, htmlAttrs };
};
