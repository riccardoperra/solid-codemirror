import {EditorState, SelectionRange, StateEffect} from '@codemirror/state';
import {basicSetup as defaultBasicSetup} from '@codemirror/basic-setup';
import {EditorView, keymap, placeholder as extendPlaceholder} from '@codemirror/view';
import {indentWithTab as defaultIndentWithTab} from '@codemirror/commands';
import {createEffect, createMemo, createSignal, on, onCleanup} from 'solid-js';
import {createStore} from 'solid-js/store';
import {CodeMirrorComponentProps} from './types/codeMirrorProps';
import {updateListenerExtension} from "./extensions/updateListener";

export interface CodeMirrorOptions extends CodeMirrorComponentProps {
  container?: HTMLDivElement | null;
}

export function createCodeMirror(initialOptions: CodeMirrorOptions) {
  const [options, setOptions] = createStore<CodeMirrorOptions>(initialOptions);
  const [container, setContainer] = createSignal<HTMLElement | ShadowRoot>();
  const [view, setView] = createSignal<EditorView>();
  const [state, setState] = createSignal<EditorState>();

  const defaultThemeOption = EditorView.theme({
    '&': {
      height: initialOptions.height,
      minHeight: initialOptions.minHeight,
      maxHeight: initialOptions.maxHeight,
      width: initialOptions.width,
      minWidth: initialOptions.minWidth,
      maxWidth: initialOptions.maxWidth
    }
  });

  const computedExtensions = createMemo(() => {
    const {
      indentWithTab,
      basicSetup,
      placeholder,
      editable,
      onUpdate,
      extensions
    } = options as unknown as CodeMirrorOptions;

    const updateListener = updateListenerExtension(options.onChange);

    return [
      indentWithTab ? keymap.of([defaultIndentWithTab]) : null,
      basicSetup ? defaultBasicSetup : null,
      placeholder && extendPlaceholder ? extendPlaceholder(placeholder) : null,
      !editable ? EditorView.editable.of(false) : null,
      !!onUpdate && typeof onUpdate === 'function' ? EditorView.updateListener.of(onUpdate) : null,
      updateListener,
      defaultThemeOption,
      ...extensions || null
    ].filter(Boolean);
  }, options);

  createEffect(() => {
    const {value, selection, root} = options;
    if (container() && !state()) {
      const stateCurrent = EditorState.create({
        doc: value,
        selection: selection as SelectionRange,
        extensions: computedExtensions()
      });
      setState(stateCurrent);
      if (!view()) {
        const viewCurrent = new EditorView({
          state: stateCurrent,
          parent: container() as HTMLElement,
          root: root as unknown as (Document | ShadowRoot)
        });
        setView(viewCurrent);
      }
    }
  });

  onCleanup(() => view()?.destroy());

  createEffect(() => {
    if (view()) {
      const currentValue = view()?.state.doc.toString();
      if (options.value !== currentValue) {
        view()?.dispatch({
          changes: {
            from: 0,
            to: currentValue?.length,
            insert: options.value || ''
          }
        });
      }
    }
  });

  createEffect(
    on(computedExtensions, () => view()?.dispatch({
        effects: StateEffect.reconfigure.of(computedExtensions())
      })
    )
  );

  createEffect(() => {
    if (options.autoFocus && view()) {
      view()?.focus();
    }
  });

  return {
    options,
    setOptions,
    state,
    setState,
    view,
    setView,
    container,
    setContainer
  };
}
