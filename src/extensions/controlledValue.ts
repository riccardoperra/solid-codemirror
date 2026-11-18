import { createEffect } from 'solid-js';
import { ExternalChange } from '../core/externalChange';
import type { Accessor } from 'solid-js';
import type { EditorView } from '@codemirror/view';

/** Synchronizes a view's document with a reactive value. */
export function createEditorControlledValue(
  view: Accessor<EditorView | undefined>,
  code: Accessor<string | undefined | null>,
  options?: { notify?: boolean },
): void {
  createEffect(
    () => [view(), code() ?? ''] as const,
    ([view, code]) => {
      if (!view || view.state.doc.toString() === code) return;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: code },
        annotations: options?.notify === false ? ExternalChange.of(true) : undefined,
      });
    },
  );
}
