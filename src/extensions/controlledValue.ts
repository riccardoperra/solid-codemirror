import { createEffect } from 'solid-js';
import type { Accessor } from 'solid-js';
import type { EditorView } from '@codemirror/view';

/** Synchronizes a view's document with a reactive value. */
export function createEditorControlledValue(
  view: Accessor<EditorView | undefined>,
  code: Accessor<string | undefined | null>,
): void {
  createEffect(
    () => [view(), code() ?? ''] as const,
    ([view, code]) => {
      if (!view || view.state.doc.toString() === code) return;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: code },
      });
    },
  );
}
