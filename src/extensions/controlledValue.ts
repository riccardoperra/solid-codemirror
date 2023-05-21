import { Accessor, createEffect, createMemo, on } from 'solid-js';
import { EditorView } from '@codemirror/view';

/**
 * Makes the view state value controlled.
 * @param view The editor view.
 * @param code The editor code. Whenever this value change, the editor view state will be updated automatically
 */
export function createEditorControlledValue(
  view: Accessor<EditorView | undefined>,
  code: Accessor<string>
): void {
  const memoizedCode = createMemo(code);

  createEffect(
    on(view, (view) => {
      if (!view) return;
      createEffect(
        on(memoizedCode, (code) => {
          const localValue = view?.state.doc.toString();
          if (localValue === code) return;
          view.dispatch({
            changes: {
              from: 0,
              to: localValue?.length,
              insert: code ?? '',
            },
          });
        })
      );
    })
  );
}
