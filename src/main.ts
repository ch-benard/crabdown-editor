import { invoke } from "@tauri-apps/api/core";
import { createDocumentActions } from "./document";
import { createEditor } from "./editor";
import { initMenu } from "./menu";
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
  const editor = createEditor(editorPane, strings.welcomeDocument, (doc) => {
    preview.scheduleRender(doc);
    actions.markModified();
  });
  const actions = createDocumentActions(editor, preview);
  void preview.render(editor.getDocument());
  void invoke("set_modified", { modified: false });

  syncScroll(editor.view.scrollDOM, previewPane);
  initSplitter(layout, splitter);
  initMenu(actions, editor, layout);
  editor.view.focus();
});
