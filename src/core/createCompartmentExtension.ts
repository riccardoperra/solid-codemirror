import { Compartment, Extension, StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { Accessor, createEffect, on } from 'solid-js';

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
	extension: Extension,
	view: Accessor<EditorView | undefined>
): CompartmentReconfigurationCallback {
	const compartment = new Compartment();

	createEffect(
		on(view, (view) => {
			if (view) {
				view.dispatch({
					effects: StateEffect.appendConfig.of(compartment.of(extension)),
				});
			}
		})
	);

	return (extension: Extension) => {
		view()?.dispatch({
			effects: compartment.reconfigure(extension),
		});
	};
}
