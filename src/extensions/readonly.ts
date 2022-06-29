import { Accessor, createEffect, on, untrack } from 'solid-js';
import { EditorView } from '@codemirror/view';
import { createCompartmentExtension } from '../core/createCompartmentExtension';

function getReadOnlyExtensions(readOnly: boolean) {
  return readOnly ? EditorView.editable.of(false) : [];
}

export function createEditorReadonly(
  view: Accessor<EditorView>,
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
