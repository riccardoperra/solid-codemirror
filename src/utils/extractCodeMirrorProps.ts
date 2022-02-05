import {CodeMirrorComponentProps} from "../types/codeMirrorProps";
import {mergeProps, splitProps} from "solid-js";
import {Extension} from "@codemirror/state";


export const extractCodeMirrorProps = (
  props: CodeMirrorComponentProps
) => {
  const [
    options,
    htmlAttrs
  ] = splitProps(props, [
    'className',
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
    'basicSetup',
    'placeholder',
    'editable',
    'root',
    'extensions',
    'indentWithTab',
  ]);

  const computedOptions = mergeProps({
    className: '',
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
    basicSetup: true
  }, options)

  return {options: computedOptions, htmlAttrs};
}
