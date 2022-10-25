import { Accessor, createEffect, createSignal, on, onCleanup } from 'solid-js';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { createCompartmentExtension as coreCreateCompartmentExtension } from './createCompartmentExtension';

export interface CreateCodeMirrorProps {
  /**
   * The initial value of the editor
   */
  value: string;
  /**
   * Fired whenever the editor code value changes.
   */
  onValueChange: (value: string) => void;
  /**
   * Fired whenever a change occurs to the document. There is a certain difference with `onChange`.
   */
  onModelViewUpdate: (vu: ViewUpdate) => void;
}

/**
 * Creates a CodeMirror editor instance.
 */
export function createCodeMirror(props?: Partial<CreateCodeMirrorProps>) {
  const [ref, setRef] = createSignal<HTMLElement>();
  const [editorView, setEditorView] = createSignal<EditorView>();

  function localCreateCompartmentExtension(
    extension: Extension | Accessor<Extension | undefined>
  ) {
    return coreCreateCompartmentExtension(extension, editorView);
  }

  const updateListener = EditorView.updateListener.of((vu) =>
    props?.onModelViewUpdate?.(vu)
  );

  // eslint-disable-next-line solid/reactivity
  localCreateCompartmentExtension(updateListener);

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

      queueMicrotask(() => setEditorView(currentView));

      onCleanup(() => {
        setEditorView(undefined);
        editorView()?.destroy();
      });
    })
  );

  createEffect(
    on(
      editorView,
      (editorView) => {
        const localValue = editorView?.state.doc.toString();
        if (localValue !== props?.value && !!editorView) {
          editorView.dispatch({
            changes: {
              from: 0,
              to: localValue?.length,
              insert: props?.value ?? '',
            },
          });
        }
      },
      { defer: true }
    )
  );

  return {
    editorView,
    ref: setRef,
    createExtension: localCreateCompartmentExtension,
  } as const;
}
