import { createSignal, onSettled } from 'solid-js';
import { createCompartmentExtension } from './createCompartmentExtension';
import type { CompartmentReconfigurationCallback } from './createCompartmentExtension';
import type { Accessor } from 'solid-js';
import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

export type LazyCompartmentReconfigurationCallback = CompartmentReconfigurationCallback & {
  readonly loading: boolean;
};

/** Loads an extension once after setup and keeps it configured across view changes. */
export function createLazyCompartmentExtension(
  load: () => Promise<Extension | null | undefined>,
  view: Accessor<EditorView | undefined>,
): LazyCompartmentReconfigurationCallback {
  const empty: Extension = [];
  const [loading, setLoading] = createSignal(false);
  const reconfigure = createCompartmentExtension(empty, view);

  onSettled(() => {
    let disposed = false;
    setLoading(true);

    async function loadExtension() {
      let extension: Extension | null | undefined;
      try {
        extension = await load();
      } catch {
        extension = empty;
      }
      if (disposed) return;
      reconfigure(extension ?? empty);
      setLoading(false);
    }

    void loadExtension();
    return () => {
      disposed = true;
    };
  });

  return Object.defineProperty(reconfigure, 'loading', {
    get: loading,
  }) as LazyCompartmentReconfigurationCallback;
}
