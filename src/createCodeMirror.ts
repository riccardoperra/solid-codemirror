import { EditorState, Extension, SelectionRange, StateEffect } from '@codemirror/state';
import { basicSetup as defaultBasicSetup } from '@codemirror/basic-setup';
import { EditorView, keymap, placeholder as extendPlaceholder, ViewUpdate } from '@codemirror/view';
import { indentWithTab as defaultIndentWithTab } from '@codemirror/commands';
import { createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { CodeMirrorComponentProps } from './types/codeMirrorProps';

export interface UseCodeMirrorOptions extends CodeMirrorComponentProps {
  container?: HTMLDivElement | null;
}

export function createCodeMirror(initialOptions: UseCodeMirrorOptions) {
  const [options, setOptions] = createStore<UseCodeMirrorOptions>(initialOptions);
  const [container, setContainer] = createSignal();
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

  const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
    if (vu.docChanged && typeof options.onChange === 'function') {
      const doc = vu.state.doc;
      const value = doc.toString();
      options.onChange(value, vu);
    }
  });

  const computedExtensions = createMemo(() => {
    let getExtensions: Extension[] = [updateListener, defaultThemeOption];
    if (options.indentWithTab && defaultIndentWithTab) {
      getExtensions.unshift(keymap.of([defaultIndentWithTab]));
    }
    if (options.basicSetup && defaultBasicSetup) {
      getExtensions.unshift(defaultBasicSetup);
    }
    if (options.placeholder && extendPlaceholder) {
      getExtensions.unshift(extendPlaceholder(options.placeholder as string | HTMLElement));
    }
    if (!options.editable) {
      getExtensions.push(EditorView.editable.of(false));
    }
    if (options.onUpdate && typeof options.onUpdate === 'function') {
      getExtensions.push(EditorView.updateListener.of(options.onUpdate));
    }
    getExtensions = getExtensions.concat(((options as unknown as UseCodeMirrorOptions).extensions) || []);
    return getExtensions;
  }, options);

  createEffect(() => {
    if (container() && !state()) {
      const stateCurrent = EditorState.create({
        doc: options.value,
        selection: options.selection as SelectionRange,
        extensions: computedExtensions()
      });
      setState(stateCurrent);
      if (!view()) {
        const viewCurrent = new EditorView({
          state: stateCurrent,
          parent: container() as HTMLElement,
          root: options.root as unknown as Document | ShadowRoot
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
    on(computedExtensions, () => {
      return view()?.dispatch({
        effects: StateEffect.reconfigure.of(computedExtensions())
      });
    })
  );

  createEffect(() => {
    if (options.autoFocus && view()) {
      view()?.focus();
    }
  });

  return {
    props: options,
    setProps: setOptions,
    state,
    setState,
    view,
    setView,
    container,
    setContainer
  };
}
