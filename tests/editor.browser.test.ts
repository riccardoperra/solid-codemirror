import { Facet, StateField, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { createRoot, createSignal, flush } from 'solid-js';
import { afterEach, expect, test, vi } from 'vitest';
import {
  createCodeMirror,
  createEditorControlledValue,
  createEditorFocus,
  createEditorReadonly,
  createLazyCompartmentExtension,
} from 'solid-codemirror';

const disposers: (() => void)[] = [];

function setup<T>(init: () => T): T {
  return createRoot((dispose) => {
    disposers.push(dispose);
    return init();
  });
}

function host() {
  const parent = document.createElement('div');
  document.body.append(parent);
  disposers.push(() => parent.remove());
  return parent;
}

afterEach(() => {
  for (const dispose of disposers.splice(0)) dispose();
  flush();
});

test('exposes a fully initialized view and destroys it when the ref changes', () => {
  const field = StateField.define({ create: () => 'ready', update: (value) => value });
  const firstHost = host();
  const nextHost = host();
  const { editor, dispose } = createRoot((dispose) => ({
    editor: createCodeMirror({ value: 'initial', extensions: field }),
    dispose,
  }));
  disposers.push(dispose);

  expect(editor.editorView()).toBeUndefined();
  editor.ref(firstHost);
  flush();
  const firstView = editor.editorView()!;
  expect(firstView.state.field(field)).toBe('ready');
  expect(firstView.state.doc.toString()).toBe('initial');
  expect(firstHost.contains(firstView.dom)).toBe(true);

  editor.ref(nextHost);
  flush();
  expect(firstHost.childElementCount).toBe(0);
  expect(nextHost.contains(editor.editorView()!.dom)).toBe(true);

  editor.ref(undefined);
  flush();
  expect(nextHost.childElementCount).toBe(0);
  expect(editor.editorView()).toBeUndefined();

  editor.ref(nextHost);
  flush();
  dispose();
  flush();
  expect(nextHost.childElementCount).toBe(0);
  expect(editor.editorView()).toBeUndefined();
});

test('applies a batch in one view update and emits the final document once', () => {
  const parent = host();
  const events: string[] = [];
  const editor = setup(() =>
    createCodeMirror({
      value: 'a',
      onTransactionDispatched: (_, view) => events.push('before ' + view.state.doc),
      onModelViewUpdate: ({ docChanged, transactions }) => {
        if (docChanged) events.push('update ' + transactions.length);
      },
      onValueChange: (value) => events.push('value ' + value),
    }),
  );
  editor.ref(parent);
  flush();

  const view = editor.editorView()!;
  const first = view.state.update({ changes: { from: 1, insert: 'b' } });
  const second = first.state.update({ changes: { from: 2, insert: 'c' } });
  view.dispatch([first, second]);
  expect(events).toEqual(['before a', 'before a', 'update 2', 'value abc']);

  view.dispatch({ selection: { anchor: 1 } });
  expect(events.at(-1)).toBe('before abc');
});

test('reactively updates a compartment and preserves a manual override across views', () => {
  const firstHost = host();
  const nextHost = host();
  const facet = Facet.define<string>();
  const [extension, setExtension] = createSignal<ReturnType<typeof facet.of> | undefined>(
    facet.of('initial'),
  );
  const { editor, reconfigure } = setup(() => {
    const editor = createCodeMirror();
    return { editor, reconfigure: editor.createExtension(extension) };
  });

  reconfigure(facet.of('before mount'));
  editor.ref(firstHost);
  flush();
  expect(editor.editorView()!.state.facet(facet)).toEqual(['before mount']);

  setExtension(facet.of('reactive'));
  flush();
  expect(editor.editorView()!.state.facet(facet)).toEqual(['reactive']);

  reconfigure(facet.of('manual'));
  expect(editor.editorView()!.state.facet(facet)).toEqual(['manual']);
  editor.ref(nextHost);
  flush();
  expect(editor.editorView()!.state.facet(facet)).toEqual(['manual']);

  setExtension(undefined);
  flush();
  expect(editor.editorView()!.state.facet(facet)).toEqual([]);
});

test('synchronizes controlled text and keeps a read-only editor keyboard focusable', async () => {
  const parent = host();
  const [code, setCode] = createSignal<string | null>('first');
  const [readOnly, setReadOnly] = createSignal(true);
  const onFocusChange = vi.fn();
  const { editor, focus } = setup(() => {
    const editor = createCodeMirror({ value: 'initial' });
    createEditorControlledValue(editor.editorView, code);
    createEditorReadonly(editor.editorView, readOnly);
    const focus = createEditorFocus(editor.editorView, onFocusChange);
    return { editor, focus };
  });

  editor.ref(parent);
  flush();
  const view = editor.editorView()!;
  expect(view.state.doc.toString()).toBe('first');
  expect(view.state.facet(EditorState.readOnly)).toBe(true);
  expect(view.state.facet(EditorView.editable)).toBe(false);
  expect(view.contentDOM.tabIndex).toBe(0);

  focus.setFocused(true);
  await expect.poll(focus.focused).toBe(true);
  focus.setFocused(false);
  await expect.poll(focus.focused).toBe(false);
  expect(onFocusChange.mock.calls).toEqual([[true], [false]]);

  setCode(null);
  setReadOnly(false);
  flush();
  expect(view.state.doc.toString()).toBe('');
  expect(view.state.readOnly).toBe(false);
  expect(view.state.facet(EditorView.editable)).toBe(true);
});

test('installs a lazy extension when its promise settles', async () => {
  const parent = host();
  const facet = Facet.define<string>();
  const extension = Promise.withResolvers<ReturnType<typeof facet.of>>();
  const { editor, lazy } = setup(() => {
    const editor = createCodeMirror();
    const lazy = createLazyCompartmentExtension(() => extension.promise, editor.editorView);
    return { editor, lazy };
  });

  editor.ref(parent);
  flush();
  expect(lazy.loading).toBe(true);
  expect(editor.editorView()!.state.facet(facet)).toEqual([]);

  extension.resolve(facet.of('loaded'));
  await expect.poll(() => lazy.loading).toBe(false);
  expect(editor.editorView()!.state.facet(facet)).toEqual(['loaded']);
});

test('ignores a lazy load that resolves after its owner is disposed', async () => {
  const parent = host();
  const facet = Facet.define<string>();
  const extension = Promise.withResolvers<ReturnType<typeof facet.of>>();
  const editor = setup(() => createCodeMirror());

  const { dispose, lazy } = createRoot((dispose) => ({
    dispose,
    lazy: createLazyCompartmentExtension(() => extension.promise, editor.editorView),
  }));
  editor.ref(parent);
  flush();
  expect(lazy.loading).toBe(true);

  dispose();
  extension.resolve(facet.of('too late'));
  await extension.promise;
  flush();
  expect(editor.editorView()!.state.facet(facet)).toEqual([]);
});
