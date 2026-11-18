# Migrate from solid-codemirror 2.x to 3.x

Upgrade to solid-codemirror 3.x when your app moves to Solid 2. For a Solid 1
app, keep using solid-codemirror 2.x.

## 1. Upgrade Solid and install the peers

After 3.x is available, install these versions in your app.

```sh
pnpm add solid-codemirror@^3 solid-js@^2 @codemirror/state@^6.6.0 @codemirror/view@^6.40.0
```

If you use Vite, replace `vite-plugin-solid` with `@solidjs/vite-plugin`. Import
`render` from `@solidjs/web` and set `jsxImportSource` to `@solidjs/web` in your
TypeScript configuration. Follow the [Solid 2 migration guide][solid-migration]
for the rest of your app.

Solid and CodeMirror are peer dependencies. Make sure your app and its
extensions resolve the same copies of `@codemirror/state` and
`@codemirror/view`.

## 2. Attach the host and configure the editor

Keep attaching `ref` to the host element. Read `editorView()` after Solid
flushes the update. If you need to run setup when a view becomes available,
observe the accessor with Solid 2's `createEffect(editorView, callback)`.

Move any fields or plugins that must exist at startup into
`createCodeMirror({ extensions })`. Pass an accessor to `createExtension` for
settings that change during editing.

```tsx
import { lineNumbers } from '@codemirror/view';
import { createCodeMirror, createEditorReadonly } from 'solid-codemirror';
import type { Extension } from '@codemirror/state';

function Editor(props: { startup: Extension; showLineNumbers: boolean; readOnly: boolean }) {
  const { ref, editorView, createExtension } = createCodeMirror({
    extensions: props.startup,
  });

  createExtension(() => (props.showLineNumbers ? lineNumbers() : []));
  createEditorReadonly(editorView, () => props.readOnly);

  return <div ref={ref} />;
}
```

An extension accessor that returns `undefined` clears its compartment. If your
app used `undefined` while loading an extension and expected the previous one to
stay active, keep returning that extension until its replacement is ready. A
manual reconfiguration applies immediately to a mounted view and lasts until
the accessor returns a different extension.

`createEditorReadonly` now disables DOM editing and informs CodeMirror's editing
commands that the document is read-only. The editor remains keyboard focusable.
If you added a read-only facet and a tab stop solely for that behavior, remove
those extensions. The `setFocused(false)` callback from `createEditorFocus` now
blurs the editor.

## 3. Separate initial text from external updates

Treat `value` as the initial document. If a signal or prop should replace the
text after mount, connect it through `createEditorControlledValue`.

```tsx
import { createCodeMirror, createEditorControlledValue } from 'solid-codemirror';

function ControlledEditor(props: { text: string; onEdit: (text: string) => void }) {
  const { ref, editorView } = createCodeMirror({
    get value() {
      return props.text;
    },
    onValueChange: (text) => props.onEdit(text),
  });

  createEditorControlledValue(editorView, () => props.text, { notify: false });
  return <div ref={ref} />;
}
```

Omit `{ notify: false }` if the app uses `onValueChange` to observe external
updates too. For a custom dispatch, use `ExternalChange.of(true)` in
`annotations` to skip the save callback. Keep document changes and related
state effects in the same dispatch. Add `Transaction.addToHistory.of(false)`
separately if the external update should stay out of undo history.

`onTransactionDispatched` still runs once per transaction and
`onModelViewUpdate` sees external updates too. If a batch contains any untagged
document change, `onValueChange` emits the final text once. A command such as
Format can dispatch an ordinary transaction with its own undo boundary.

## 4. Switch documents without resetting undo

If you reuse one view for multiple tabs, create an `EditorState` for each tab.
Use `setEditorState` to swap states and save the returned state under the
outgoing tab. The outgoing state contains its text, selection, undo history,
and custom fields. The incoming state receives the view's current
configuration and managed compartments.

```tsx
import { EditorState } from '@codemirror/state';
import { createCodeMirror } from 'solid-codemirror';
import type { Extension } from '@codemirror/state';

function TabbedEditor(props: { startup: Extension }) {
  const { ref, setEditorState } = createCodeMirror({
    value: 'First document',
    extensions: props.startup,
  });
  const states = new Map<string, EditorState>([
    ['second', EditorState.create({ doc: 'Second document' })],
  ]);
  let activeTab = 'first';

  function openTab(id: string) {
    if (id === activeTab) return;
    const next = states.get(id);
    if (!next) return;
    const previous = setEditorState(next);
    if (!previous) return;
    states.set(activeTab, previous);
    activeTab = id;
  }

  return (
    <>
      <button type="button" onClick={() => openTab('first')}>First</button>
      <button type="button" onClick={() => openTab('second')}>Second</button>
      <div ref={ref} />
    </>
  );
}
```

Include CodeMirror's `history()` extension in your startup configuration if
you want per-tab undo. A tab switch does not trigger `onValueChange`. Use normal
transactions for edits within the active tab.

## Verify your migration

Run `pnpm dev` in the solid-codemirror repository to try the playground. Type
in A, move the cursor, switch to B, and change the theme. Return to A and check
the text, cursor, theme, and undo. Apply an external update and check that
the save count stays the same. Then run Format and undo it in one step.

[solid-migration]: https://docs.solidjs.com/migration/from-solid-1/
