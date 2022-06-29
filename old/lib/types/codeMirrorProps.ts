import { EditorStateConfig, Extension } from '@codemirror/state';
import { ViewUpdate } from '@codemirror/view';
import { JSX } from 'solid-js';

export interface CodeMirrorComponentProps
  extends Omit<EditorStateConfig, 'doc' | 'extensions'>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange' | 'placeholder'> {
  /**
   * value of the auto created model in the editor.
   */
  value?: string;
  /**
   * CodeMirror host container height
   * @default auto
   */
  height?: string;
  /**
   * CodeMirror host container minHeight
   * @default 0px
   */
  minHeight?: string;
  /**
   * CodeMirror host container maxHeight
   * @default auto
   */
  maxHeight?: string;
  /**
   * CodeMirror host container width
   * @default auto
   */
  width?: string;
  /**
   * CodeMirror host Container minWidth
   * @default 0px
   */
  minWidth?: string;
  /**
   * CodeMirror host Container max width
   * @default none
   */
  maxWidth?: string;
  /**
   * focus on the editor.
   */
  autoFocus?: boolean;
  /**
   * Enables a placeholder—a piece of example content to show when the editor is empty.
   */
  placeholder?: string | HTMLElement;
  /**
   * This disables editing of the editor content by the user.
   * @default true
   */
  editable?: boolean;
  /**
   * Whether to optional basicSetup by default
   * @default true
   */
  indentWithTab?: boolean;

  /**
   * Fired whenever a change occurs to the document.
   * */
  onChange?(value: string, viewUpdate: ViewUpdate): void;

  /**
   * Fired whenever a change occurs to the document. There is a certain difference with `onChange`.
   * */
  onUpdate?(viewUpdate: ViewUpdate): void;

  /**
   * Extension values can be [provided](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions) when creating a state to attach various kinds of configuration and behavior information.
   * They can either be built-in extension-providing objects,
   * such as [state fields](https://codemirror.net/6/docs/ref/#state.StateField) or [facet providers](https://codemirror.net/6/docs/ref/#state.Facet.of),
   * or objects with an extension in its `extension` property. Extensions can be nested in arrays arbitrarily deep—they will be flattened when processed.
   */
  extensions?: Extension[];
  /**
   * If the view is going to be mounted in a shadow root or document other than the one held by the global variable document (the default), you should pass it here.
   * Originally from the [config of EditorView](https://codemirror.net/6/docs/ref/#view.EditorView.constructor%5Econfig.root)
   */
  root?: ShadowRoot | Document;
}
