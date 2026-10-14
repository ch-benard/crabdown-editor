import { createEditor } from "./editor";
import { createPreview, syncScroll } from "./preview";
import { initSplitter } from "./splitter";
import { strings } from "./strings";

window.addEventListener("DOMContentLoaded", () => {
  const layout = document.querySelector<HTMLElement>(".workspace")!;
  const editorPane = layout.querySelector<HTMLElement>(".editor-pane")!;
  const previewPane = layout.querySelector<HTMLElement>(".preview-pane")!;
  const splitter = layout.querySelector<HTMLElement>(".splitter")!;

  document.title = strings.appTitle;
  editorPane.setAttribute("aria-label", strings.editorLabel);
  previewPane.setAttribute("aria-label", strings.previewLabel);
  splitter.setAttribute("aria-label", strings.splitterLabel);

  const preview = createPreview(previewPane);
  const editor = createEditor(editorPane, strings.welcomeDocument, preview.scheduleRender);
  void preview.render(editor.state.doc.toString());

  syncScroll(editor.scrollDOM, previewPane);
  initSplitter(layout, splitter);
  editor.focus();
});
