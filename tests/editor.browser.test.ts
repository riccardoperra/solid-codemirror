import { history, isolateHistory, undo } from '@codemirror/commands';
import { Facet, StateField, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { createRoot, createSignal, flush } from 'solid-js';
import { afterEach, expect, test, vi } from 'vitest';
import {
  ExternalChange,
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

test('switching documents keeps the current configuration and update listener', () => {
  const parent = host();
  const theme = Facet.define<string>();
  const [dark, setDark] = createSignal(false);
  const updates = vi.fn();
  const changes = vi.fn();
  const editor = setup(() => {
    const editor = createCodeMirror({
      value: 'first',
      onModelViewUpdate: updates,
      onValueChange: changes,
    });
    editor.createExtension(() => theme.of(dark() ? 'dark' : 'light'));
    return editor;
  });
  editor.ref(parent);
  flush();
  const view = editor.editorView()!;
  view.dispatch({ changes: { from: 5, insert: ' edit' }, selection: { anchor: 3 } });
  const first = view.state;

  expect(editor.setEditorState(EditorState.create({ doc: 'second' }))).toBe(first);
  expect(view.state.facet(theme)).toEqual(['light']);
  updates.mockClear();
  view.dispatch({ selection: { anchor: 1 } });
  expect(updates).toHaveBeenCalledTimes(1);
  setDark(true);
  flush();
  editor.setEditorState(first);

  expect(view.state.doc.toString()).toBe('first edit');
  expect(view.state.selection.main.anchor).toBe(3);
  expect(view.state.facet(theme)).toEqual(['dark']);
  expect(changes.mock.calls).toEqual([['first edit']]);
  updates.mockClear();
  view.dispatch({ changes: { from: 0, insert: '?' } });
  expect(updates).toHaveBeenCalledTimes(1);
  expect(changes.mock.calls).toEqual([['first edit'], ['?first edit']]);
});

test('reports external changes to observers without echoing them to onValueChange', () => {
  const parent = host();
  const [code, setCode] = createSignal('initial');
  const before = vi.fn();
  const updates = vi.fn();
  const changes = vi.fn();
  const editor = setup(() => {
    const editor = createCodeMirror({
      value: 'initial',
      onTransactionDispatched: before,
      onModelViewUpdate: updates,
      onValueChange: changes,
    });
    createEditorControlledValue(editor.editorView, code, { notify: false });
    return editor;
  });
  editor.ref(parent);
  flush();

  const view = editor.editorView()!;
  setCode('external');
  flush();
  expect(view.state.doc.toString()).toBe('external');
  expect(before).toHaveBeenCalledTimes(1);
  expect(updates).toHaveBeenCalledTimes(1);
  expect(changes).not.toHaveBeenCalled();

  const incoming = view.state.update({
    changes: { from: 0, to: 8, insert: 'formatted' },
    annotations: ExternalChange.of(true),
  });
  const edit = incoming.state.update({ changes: { from: 9, insert: '!' } });
  view.dispatch([incoming, edit]);
  expect(changes.mock.calls).toEqual([['formatted!']]);
});

test('keeps undo history per document and records formatting as one step', () => {
  const parent = host();
  const changes = vi.fn();
  const editor = setup(() =>
    createCodeMirror({
      value: 'first  ',
      extensions: history(),
      onValueChange: changes,
    }),
  );
  editor.ref(parent);
  flush();
  const view = editor.editorView()!;
  view.dispatch({ changes: { from: 0, insert: 'A ' } });

  const first = editor.setEditorState(EditorState.create({ doc: 'second' }))!;
  expect(undo(view)).toBe(false);
  view.dispatch({ changes: { from: 0, insert: 'B ' } });
  const second = editor.setEditorState(first)!;
  expect(view.state.doc.toString()).toBe('A first  ');

  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: 'A first' },
    annotations: isolateHistory.of('full'),
  });
  expect(undo(view)).toBe(true);
  expect(view.state.doc.toString()).toBe('A first  ');
  expect(undo(view)).toBe(true);
  expect(view.state.doc.toString()).toBe('first  ');

  editor.setEditorState(second);
  expect(undo(view)).toBe(true);
  expect(view.state.doc.toString()).toBe('second');
  expect(changes.mock.calls.flat()).toEqual([
    'A first  ',
    'B second',
    'A first',
    'A first  ',
    'first  ',
    'second',
  ]);
});
