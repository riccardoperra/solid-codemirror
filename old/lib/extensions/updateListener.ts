import { EditorView, ViewUpdate } from '@codemirror/view';

export const updateListenerExtension = (
  onChange?: (value: string, vu: ViewUpdate) => void
) => {
  return EditorView.updateListener.of((vu: ViewUpdate) => {
    if (vu.docChanged && typeof onChange === 'function') {
      const document = vu.state.doc;
      const value = document.toString();
      onChange(value, vu);
    }
  });
};
