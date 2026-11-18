import { Compartment, StateEffect } from '@codemirror/state';
import { createEffect } from 'solid-js';
import { viewExtension } from './viewConfiguration';
import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { Accessor } from 'solid-js';

const empty: Extension = [];

export type CompartmentReconfigurationCallback = (extension: Extension) => void;

/**
 * Creates a compartment extension for the given CodeMirror EditorView.
 *
 * Extension compartments can be used to make a configuration dynamic.
 * By wrapping part of your configuration in a compartment, you can later replace that part through a transaction.
 *
 * See {@link https://codemirror.net/examples/reconfigure/} for use cases and examples of `Compartments`.
 * Check out {@link https://codemirror.net/docs/ref/#state.Compartment} for more details about Compartment API.
 *
 * @param extension The extension to wrap in a compartment.
 * @param view The CodeMirror EditorView
 */
export function createCompartmentExtension(
  extension: Accessor<Extension | undefined> | Extension,
  view: Accessor<EditorView | undefined>,
): CompartmentReconfigurationCallback {
  const compartment = new Compartment();
  const readExtension = typeof extension === 'function' ? extension : () => extension;
  let override: Extension | undefined;

  function apply(view: EditorView, extension: Extension) {
    const installed = compartment.get(view.state);
    if (installed === extension) return;

    view.dispatch({
      effects:
        installed === undefined
          ? StateEffect.appendConfig.of(viewExtension(compartment, extension))
          : compartment.reconfigure(extension),
    });
  }

  createEffect(
    () => [view(), readExtension()] as const,
    ([view, extension], previous) => {
      if (previous && previous[1] !== extension) override = undefined;
      if (view) apply(view, override ?? extension ?? empty);
    },
  );

  return (extension) => {
    override = extension;
    const currentView = view();
    if (currentView) apply(currentView, extension);
  };
}
