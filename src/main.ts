import { invoke } from "@tauri-apps/api/core";
import { createDocumentActions } from "./document";
import { createEditor } from "./editor";
import { initLanguage, onLanguageChange } from "./i18n";
import { initMenu } from "./menu";
import { initPreferences } from "./preferences";
import { createPreview, syncScroll } from "./preview";
import { initSplitter } from "./splitter";
import { appTitle, strings, welcomeDocument } from "./strings";
import { initTheme } from "./theme";
import { initToolbar } from "./toolbar";

window.addEventListener("DOMContentLoaded", () => {
  const layout = document.querySelector<HTMLElement>(".workspace")!;
  const editorPane = layout.querySelector<HTMLElement>(".editor-pane")!;
  const previewPane = layout.querySelector<HTMLElement>(".preview-pane")!;
  const splitter = layout.querySelector<HTMLElement>(".splitter")!;
  const toolbarRoot = document.querySelector<HTMLElement>(".toolbar")!;

  initLanguage();
  document.title = appTitle;
  const applyLabels = () => {
    editorPane.setAttribute("aria-label", strings.editorLabel);
    previewPane.setAttribute("aria-label", strings.previewLabel);
    splitter.setAttribute("aria-label", strings.splitterLabel);
  };
  applyLabels();

  const preview = createPreview(previewPane);
  const editor = createEditor(editorPane, welcomeDocument, (doc) => {
    preview.scheduleRender(doc);
    actions.markModified();
  });
  const actions = createDocumentActions(editor, preview);
  void preview.render(editor.getDocument());
  void invoke("set_modified", { modified: false });

  syncScroll(editor.view.scrollDOM, previewPane);
  initSplitter(layout, splitter);
  onLanguageChange(() => {
    applyLabels();
    editor.refreshLabels();
  });
  initMenu(
    actions,
    editor,
    initTheme(editor),
    initToolbar(toolbarRoot, editor.view),
    initPreferences(() => editor.view.focus()),
    layout,
  );
  editor.view.focus();
});
