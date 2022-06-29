import { Accessor, createEffect, createMemo, on } from 'solid-js';
import { EditorView } from '@codemirror/view';

export function createEditorControlledValue(
  view: Accessor<EditorView>,
  code: Accessor<string>
): void {
  const memoizedCode = createMemo(code);

  createEffect(
    on(view, (view) => {
      if (view) {
        createEffect(
          on(memoizedCode, (code) => {
            const localValue = view?.state.doc.toString();
            if (localValue !== code) {
              view.dispatch({
                changes: {
                  from: 0,
                  to: localValue?.length,
                  insert: code ?? '',
                },
              });
            }
          })
        );
      }
    })
  );
}
