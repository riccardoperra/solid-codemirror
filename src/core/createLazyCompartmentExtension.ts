import { Accessor, createSignal, onMount } from 'solid-js';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { createCompartmentExtension } from './createCompartmentExtension';

export type LazyCompartmentReconfigurationCallback = {
  loading: boolean;
} & ((extension: Extension) => void);

/**
 * Creates a lazy compartment extension for the given CodeMirror EditorView,
 * configured only after the Promise will be resolved.
 **
 * See {@link https://codemirror.net/examples/reconfigure/} for use cases and examples of `Compartments`.
 * Check out {@link https://codemirror.net/docs/ref/#state.Compartment} for more details about Compartment API.
 *
 * @param fn The Promise callback that will return the extension once resolved.
 * @param view The CodeMirror EditorView
 */
export function createLazyCompartmentExtension(
  fn: () => Promise<Extension | null | undefined>,
  view: Accessor<EditorView | undefined>
): LazyCompartmentReconfigurationCallback {
  const [loadedExtension, setLoadedExtension] = createSignal<Extension>([]);
  const [loading, setLoading] = createSignal(false);

  const reconfigure = createCompartmentExtension(() => loadedExtension(), view);

  const setExtension = (extension: Extension | null | undefined) => {
    const resolvedExtension = extension ?? [];
    reconfigure(resolvedExtension);
    setLoadedExtension(resolvedExtension);
  };

  onMount(() => {
    setLoading(true);
    fn()
      .then((extension) => setExtension(extension))
      .catch(() => setExtension(null))
      .finally(() => setLoading(false));
  });

  return Object.defineProperties(reconfigure, {
    loading: {
      get: () => loading(),
    },
  }) as LazyCompartmentReconfigurationCallback;
}
