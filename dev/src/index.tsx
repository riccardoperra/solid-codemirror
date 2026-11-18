import { createSignal } from 'solid-js';
import { render } from '@solidjs/web';
import { createCodeMirror, createEditorReadonly } from 'solid-codemirror';
import { EditorView, lineNumbers } from '@codemirror/view';

const theme = EditorView.theme(
  {
    '&': { color: 'white', backgroundColor: '#034' },
  },
  { dark: true },
);

function App() {
  const [showLineNumbers, setShowLineNumbers] = createSignal(true);
  const [readOnly, setReadOnly] = createSignal(false);
  const { editorView, ref, createExtension } = createCodeMirror({
    value: "console.log('hello world!')",
    extensions: theme,
  });

  createExtension(() => (showLineNumbers() ? lineNumbers() : []));
  createEditorReadonly(editorView, readOnly);

  return (
    <>
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
      <div ref={ref} />
    </>
  );
}

render(() => <App />, document.getElementById('root')!);
