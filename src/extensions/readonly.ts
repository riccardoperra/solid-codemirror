import { Accessor, createEffect, on, untrack } from 'solid-js';
import { EditorView } from '@codemirror/view';
import { createCompartmentExtension } from '../core/createCompartmentExtension';

function getReadOnlyExtensions(readOnly: boolean) {
  return readOnly ? EditorView.editable.of(false) : [];
}

/**
 * Allows to change the editor readOnly state by the given `readOnly` property value
 * @param view The editor view
 * @param readOnly The editor readOnly state
 */
export function createEditorReadonly(
  view: Accessor<EditorView | undefined>,
  readOnly: Accessor<boolean>
) {
  const localReadOnly = readOnly ? untrack(readOnly) : false;

  const reconfigure = createCompartmentExtension(
    getReadOnlyExtensions(localReadOnly),
    view
  );

  createEffect(
    on(readOnly, (readOnly) => reconfigure(getReadOnlyExtensions(readOnly)))
  );
}
