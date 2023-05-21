import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { createCodeMirror, createLazyCompartmentExtension } from '..';
import { EditorView, lineNumbers } from '@codemirror/view';

function App() {
  const [, setCode] = createSignal("console.log('hello world!')");
  const [showLineNumber, setShowLineNumber] = createSignal(true);
  const { editorView, ref, createExtension } = createCodeMirror({
    onTransactionDispatched: (tr, state) => {
      console.log('Transaction dispatched: ', tr, state);
    },
    onValueChange: (value) => console.log('Value change: ', value),
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

  const stat = createLazyCompartmentExtension(async () => {
    await new Promise((r) => setTimeout(r, 3000));
    return [];
  }, editorView);

  // Remove line numbers after 2.5s
  setTimeout(() => {
    setShowLineNumber(false);
  }, 2500);

  return (
    <>
      {stat.loading && <>Loading...</>}
      <div ref={ref} />
    </>
  );
}

render(() => <App />, document.getElementById('root') as HTMLDivElement);
