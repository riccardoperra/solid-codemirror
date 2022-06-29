import { Compartment, Extension, StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { Accessor, createEffect, on } from 'solid-js';

export function createCompartmentExtension(
  extension: Extension,
  view: Accessor<EditorView | undefined>
) {
  let compartment = new Compartment();

  createEffect(
    on(view, view => {
      if (view) {
        view.dispatch({
          effects: StateEffect.appendConfig.of(compartment.of(extension))
        });
      }
    })
  );

  return (extension: Extension) => {
    view()?.dispatch({
      effects: compartment.reconfigure(extension)
    });
  };
}
