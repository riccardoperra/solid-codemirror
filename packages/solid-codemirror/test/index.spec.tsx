import { fireEvent, render, screen } from 'solid-testing-library';
import { CodeMirror } from '../src/lib/CodeMirror';

it('CodeMirror', async () => {
  const {baseElement} = render(() => <CodeMirror />);
  const cm = baseElement.firstChild.firstChild;
  expect(cm).toBeTruthy();
  expect((cm as Element).classList.contains('solid-cm')).toBeTruthy();
});

it('CodeMirror onChange', async () => {
  const handleChange = jest.fn((value) => {
    expect(value).toEqual('# content');
    return Array.isArray(value) ? value.join() : value;
  });
  render(() => <CodeMirror autoFocus value="console.log('Solid is so powerful!')" onChange={handleChange} />);
  const input = await screen.findByRole('textbox') as HTMLInputElement;
  fireEvent.change(input, { target: { textContent: '# content' } });
  const elm = screen.queryByText('# content');
  expect((elm as any).cmView.dom.innerHTML).toEqual('# content');
});

it('CodeMirror onUpdate', async () => {
  render(
    () => <CodeMirror
      value="console.log('Hello world!')"
      autoFocus
      onUpdate={(viewUpdate) => {
        expect(viewUpdate.state.doc.length).toEqual(27);
      }}
    />
  );
});

it('CodeMirror placeholder', async () => {
  render(() => <CodeMirror placeholder='Solid' />);
  const elm = screen.queryByText('Solid');
  expect(elm!.style['pointerEvents']).toEqual('none');
  expect(elm!.className).toEqual('cm-placeholder');
});

it('CodeMirror editable', async () => {
  await render(() => <CodeMirror editable={false} className='test' />);
  const text = screen.getByRole('textbox');
  expect(text.className).toEqual('cm-content');
  expect(text.tagName).toEqual('DIV');
});
