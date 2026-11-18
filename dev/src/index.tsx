import { history, historyKeymap, isolateHistory } from '@codemirror/commands';
import { EditorState, Transaction } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { render } from '@solidjs/web';
import { createSignal, For } from 'solid-js';
import { createCodeMirror, createEditorReadonly, ExternalChange } from 'solid-codemirror';
import './playground.css';

const darkTheme = EditorView.theme(
  {
    '&': { color: '#f2f5ff', backgroundColor: '#1d2335' },
    '.cm-gutters': { color: '#b5c0df', backgroundColor: '#252c40', borderRight: '0' },
  },
  { dark: true },
);

function App() {
  const [active, setActive] = createSignal<'A' | 'B'>('A');
  const [dark, setDark] = createSignal(false);
  const [showLineNumbers, setShowLineNumbers] = createSignal(true);
  const [readOnly, setReadOnly] = createSignal(false);
  const [cursor, setCursor] = createSignal(0);
  const [saveCount, setSaveCount] = createSignal(0);
  const [events, setEvents] = createSignal<readonly string[]>([]);
  const documents = {
    A: EditorState.create({ doc: 'const first = 1;  ' }),
    B: EditorState.create({ doc: 'const second = 2;  ' }),
  };

  function log(message: string) {
    setEvents((events) => [message, ...events].slice(0, 8));
  }

  const { editorView, ref, createExtension, setEditorState } = createCodeMirror({
    value: documents.A.doc.toString(),
    extensions: [
      history(),
      keymap.of(historyKeymap),
      EditorView.contentAttributes.of({ 'aria-label': 'Document editor' }),
    ],
    onModelViewUpdate(update) {
      setCursor(update.state.selection.main.head);
      if (
        update.docChanged &&
        update.transactions.every(
          (transaction) => !transaction.docChanged || transaction.annotation(ExternalChange),
        )
      ) {
        log(`Tab ${active()} · external update`);
      }
    },
    onValueChange() {
      setSaveCount((count) => count + 1);
      log(`Tab ${active()} · save notification`);
    },
  });

  createExtension(() => (dark() ? darkTheme : []));
  createExtension(() => (showLineNumbers() ? lineNumbers() : []));
  createEditorReadonly(editorView, readOnly);

  function switchTab(tab: 'A' | 'B') {
    const previousTab = active();
    if (tab === previousTab) return;
    const previous = setEditorState(documents[tab]);
    if (!previous) return;
    documents[previousTab] = previous;
    setActive(tab);
    setCursor(documents[tab].selection.main.head);
    log(`Opened tab ${tab}`);
  }

  function applyExternalUpdate() {
    const view = editorView();
    if (!view) return;
    view.dispatch({
      changes: { from: view.state.doc.length, insert: '\n// External update' },
      annotations: [ExternalChange.of(true), Transaction.addToHistory.of(false)],
    });
  }

  function format() {
    const view = editorView();
    if (!view || view.state.readOnly) return;
    const text = view.state.doc.toString();
    const formatted = text
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
    if (text === formatted) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: formatted },
      annotations: isolateHistory.of('full'),
    });
  }

  return (
    <main>
      <h1>solid-codemirror playground</h1>
      <div class="toolbar" aria-label="Document controls">
        <button
          type="button"
          aria-pressed={active() === 'A' ? 'true' : 'false'}
          onClick={() => switchTab('A')}
        >
          Tab A
        </button>
        <button
          type="button"
          aria-pressed={active() === 'B' ? 'true' : 'false'}
          onClick={() => switchTab('B')}
        >
          Tab B
        </button>
        <label>
          <input
            type="checkbox"
            checked={dark()}
            onChange={(event) => setDark(event.currentTarget.checked)}
          />
          Dark theme
        </label>
        <label>
          <input
            type="checkbox"
            checked={showLineNumbers()}
            onChange={(event) => setShowLineNumbers(event.currentTarget.checked)}
          />
          Line numbers
        </label>
        <label>
          <input
            type="checkbox"
            checked={readOnly()}
            onChange={(event) => setReadOnly(event.currentTarget.checked)}
          />
          Read only
        </label>
      </div>
      <div class="editor" ref={ref} />
      <div class="toolbar">
        <button type="button" onClick={applyExternalUpdate}>
          Apply external update
        </button>
        <button type="button" disabled={readOnly()} onClick={format}>
          Format
        </button>
        <span>
          Cursor <output aria-label="Cursor position">{cursor()}</output>
        </span>
        <span>
          Saves <output aria-label="Save notifications">{saveCount()}</output>
        </span>
      </div>
      <h2>Editor events</h2>
      <ol class="events" aria-label="Editor events">
        <For each={events()}>{(event) => <li>{event}</li>}</For>
      </ol>
    </main>
  );
}

render(() => <App />, document.getElementById('root')!);
