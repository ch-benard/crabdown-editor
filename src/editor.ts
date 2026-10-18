import { basicSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { formattingKeymap } from "./keymap";
import { strings } from "./strings";

export interface Editor {
  view: EditorView;
  getDocument(): string;
  /** Replaces the document and clears the undo history. */
  setDocument(doc: string): void;
  setDarkTheme(dark: boolean): void;
}

export function createEditor(
  parent: HTMLElement,
  doc: string,
  onChange: (doc: string) => void,
): Editor {
  const theme = new Compartment();
  let dark = false;
  const extensions = () => [
    formattingKeymap(),
    basicSetup,
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({ "aria-label": strings.editorLabel }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) onChange(update.state.doc.toString());
    }),
    theme.of(dark ? oneDark : []),
  ];
  const view = new EditorView({ parent, state: EditorState.create({ doc, extensions: extensions() }) });

  return {
    view,
    getDocument: () => view.state.doc.toString(),
    setDocument(doc) {
      view.setState(EditorState.create({ doc, extensions: extensions() }));
      view.scrollDOM.scrollTop = 0;
    },
    setDarkTheme(value) {
      dark = value;
      view.dispatch({ effects: theme.reconfigure(dark ? oneDark : []) });
    },
  };
}
