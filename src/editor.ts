import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { strings } from "./strings";

export function createEditor(
  parent: HTMLElement,
  doc: string,
  onChange: (doc: string) => void,
): EditorView {
  return new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        basicSetup,
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({ "aria-label": strings.editorLabel }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChange(update.state.doc.toString());
        }),
      ],
    }),
  });
}
