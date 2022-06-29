import { createEffect, createSignal, on, onCleanup } from 'solid-js';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { createCompartmentExtension as coreCreateCompartmentExtension } from './createCompartmentExtension';

export interface CreateCodeMirrorProps {
  value: string;
  onValueChange: (value: string) => void;
  onModelViewUpdate: (vu: ViewUpdate) => void;
}

export function createCodeMirror(props?: Partial<CreateCodeMirrorProps>) {
  const [ref, setRef] = createSignal<HTMLElement>();
  const [editorView, setEditorView] = createSignal<EditorView>();

  function localCreateCompartmentExtension(extension: Extension) {
    return coreCreateCompartmentExtension(extension, editorView);
  }

  const updateListener = EditorView.updateListener.of((vu) =>
    props?.onModelViewUpdate?.(vu)
  );

  void localCreateCompartmentExtension(updateListener);

  createEffect(
    on(ref, (ref) => {
      const state = EditorState.create({ doc: props?.value ?? '' });
      const currentView = new EditorView({
        state,
        parent: ref,
        // Replace the old `updateListenerExtension`
        dispatch: (transaction) => {
          currentView.update([transaction]);
          if (transaction.docChanged) {
            const document = transaction.state.doc;
            const value = document.toString();
            props?.onValueChange?.(value);
          }
        },
      });

      setEditorView(currentView);

      onCleanup(() => {
        setEditorView(undefined);
        editorView()?.destroy();
      });
    })
  );

  createEffect(
    on(
      () => props?.value,
      (value) => {
        const $view = editorView();
        const localValue = $view?.state.doc.toString();
        if (localValue !== value && !!$view) {
          $view.dispatch({
            changes: {
              from: 0,
              to: localValue?.length,
              insert: value ?? '',
            },
          });
        }
      },
      { defer: true }
    )
  );

  return {
    editorView,
    ref,
    setRef,
    createCompartment: localCreateCompartmentExtension,
  };
}
