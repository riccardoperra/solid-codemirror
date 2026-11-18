import { Facet, StateEffect } from '@codemirror/state';
import type { Compartment, EditorState, Extension } from '@codemirror/state';

const compartments = Facet.define<Compartment>();

export function viewExtension(compartment: Compartment, extension: Extension): Extension {
  return [compartments.of(compartment), compartment.of(extension)];
}

export function applyViewConfiguration(current: EditorState, incoming: EditorState): EditorState {
  const effects = current.facet(compartments).flatMap((compartment) => {
    const extension = compartment.get(current);
    const installed = compartment.get(incoming);
    if (extension === undefined || extension === installed) return [];

    return installed === undefined
      ? StateEffect.appendConfig.of(viewExtension(compartment, extension))
      : compartment.reconfigure(extension);
  });

  return effects.length ? incoming.update({ effects, filter: false }).state : incoming;
}
