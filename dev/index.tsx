import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { createCodeMirror } from '..';
import { EditorView, lineNumbers } from '@codemirror/view';

function App() {
  const [, setCode] = createSignal("console.log('hello world!')");
  const [showLineNumber, setShowLineNumber] = createSignal(true);
  const { ref, createExtension } = createCodeMirror({
    onValueChange: setCode,
  });

  const theme = EditorView.theme(
    {
      '&': {
        color: 'white',
        backgroundColor: '#034',
      },
    },
    { dark: true }
  );

  createExtension(theme);

  // Toggle extension
  createExtension(() => (showLineNumber() ? lineNumbers() : []));

  // Remove line numbers after 2.5s
  setTimeout(() => {
    setShowLineNumber(false);
  }, 2500);

  return <div ref={ref} />;
}

render(() => <App />, document.getElementById('root') as HTMLDivElement)();
