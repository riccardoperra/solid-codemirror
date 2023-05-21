import { Accessor, createSignal } from 'solid-js';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { createCompartmentExtension } from '../core/createCompartmentExtension';

export function createEditorFocus(
  view: Accessor<EditorView | undefined>,
  onFocusChange?: (focused: boolean) => void
) {
  const [focused, setInternalFocused] = createSignal(view()?.hasFocus ?? false);

  const focusListener = EditorView.focusChangeEffect.of((state, focusing) => {
    setInternalFocused(focusing);
    onFocusChange?.(focusing);
    return null;
  });

  void createCompartmentExtension(focusListener, view);

  const setFocused = (focused: boolean) => {
    setInternalFocused(focused);
    const viewValue = view();
    if (!viewValue) return;
    viewValue.focus();
  };

  return {
    focused,
    setFocused,
  };
}
