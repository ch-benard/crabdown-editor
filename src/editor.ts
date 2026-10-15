import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { strings } from "./strings";

export interface Editor {
  view: EditorView;
  getDocument(): string;
  /** Replaces the document and clears the undo history. */
  setDocument(doc: string): void;
}

export function createEditor(
  parent: HTMLElement,
  doc: string,
  onChange: (doc: string) => void,
): Editor {
  const extensions = [
    basicSetup,
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({ "aria-label": strings.editorLabel }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) onChange(update.state.doc.toString());
    }),
  ];
  const view = new EditorView({ parent, state: EditorState.create({ doc, extensions }) });

  return {
    view,
    getDocument: () => view.state.doc.toString(),
    setDocument(doc) {
      view.setState(EditorState.create({ doc, extensions }));
      view.scrollDOM.scrollTop = 0;
    },
  };
}
