import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { createEffect, createSignal } from 'solid-js';
import {
  createCompartmentExtension,
  type CompartmentReconfigurationCallback,
} from './createCompartmentExtension';
import type { Extension, Transaction } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import type { Accessor, Setter } from 'solid-js';

export interface CreateCodeMirrorProps {
  /** Initial document for each new view. */
  value?: string;
  /** Extensions installed in the initial state, before the view is exposed. */
  extensions?: Extension;
  /** Called with the final document after a dispatch changes it. */
  onValueChange?: (value: string) => void;
  /** Called after each view update. */
  onModelViewUpdate?: (update: ViewUpdate) => void;
  /** Called for each transaction before CodeMirror applies the dispatch. */
  onTransactionDispatched?: (transaction: Transaction, view: EditorView) => void;
}

/** Creates a CodeMirror view when a host element is assigned to `ref`. */
export function createCodeMirror(props?: CreateCodeMirrorProps): {
  readonly editorView: Accessor<EditorView | undefined>;
  readonly ref: Setter<HTMLElement | undefined>;
  readonly createExtension: (
    extension: Extension | Accessor<Extension | undefined>,
  ) => CompartmentReconfigurationCallback;
} {
  const [host, setHost] = createSignal<HTMLElement>();
  const [editorView, setEditorView] = createSignal<EditorView>();

  createEffect(host, (parent) => {
    if (!parent) return;

    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: props?.value,
        extensions: [
          EditorView.updateListener.of((update) => props?.onModelViewUpdate?.(update)),
          props?.extensions ?? [],
        ],
      }),
      dispatchTransactions(transactions, view) {
        for (const transaction of transactions) {
          props?.onTransactionDispatched?.(transaction, view);
        }
        view.update(transactions);
        if (transactions.some((transaction) => transaction.docChanged)) {
          props?.onValueChange?.(view.state.doc.toString());
        }
      },
    });
    setEditorView(view);

    return () => {
      view.destroy();
      setEditorView(undefined);
    };
  });

  function createExtension(extension: Extension | Accessor<Extension | undefined>) {
    return createCompartmentExtension(extension, editorView);
  }

  return { editorView, ref: setHost, createExtension } as const;
}
