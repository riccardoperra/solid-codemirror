import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { createCompartmentExtension } from '../core/createCompartmentExtension';
import type { Accessor } from 'solid-js';

const readOnlyExtensions = [
  EditorState.readOnly.of(true),
  EditorView.editable.of(false),
  EditorView.contentAttributes.of({ tabindex: '0' }),
];
const editableExtensions = [] as const;

/** Disables editing through the DOM and CodeMirror commands while keeping keyboard focus. */
export function createEditorReadonly(
  view: Accessor<EditorView | undefined>,
  readOnly: Accessor<boolean>,
): void {
  createCompartmentExtension(() => (readOnly() ? readOnlyExtensions : editableExtensions), view);
}
