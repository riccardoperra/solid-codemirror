import { createEffect, createSignal } from 'solid-js';
import { EditorView } from '@codemirror/view';
import { createCompartmentExtension } from '../core/createCompartmentExtension';
import type { Accessor } from 'solid-js';

export function createEditorFocus(
  view: Accessor<EditorView | undefined>,
  onFocusChange?: (focused: boolean) => void,
): { focused: Accessor<boolean>; setFocused: (focused: boolean) => void } {
  const [focused, setInternalFocused] = createSignal(false);

  createEffect(view, (view) => {
    setInternalFocused(view?.hasFocus ?? false);
  });

  const focusListener = EditorView.updateListener.of((update) => {
    if (!update.focusChanged) return;
    const focused = update.view.hasFocus;
    setInternalFocused(focused);
    onFocusChange?.(focused);
  });

  createCompartmentExtension(focusListener, view);

  const setFocused = (focused: boolean) => {
    const current = view();
    if (focused) current?.focus();
    else current?.contentDOM.blur();
  };

  return { focused, setFocused };
}
