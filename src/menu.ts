import { listen } from "@tauri-apps/api/event";
import { redo, undo } from "@codemirror/commands";
import { openSearchPanel } from "@codemirror/search";
import type { DocumentActions } from "./document";
import type { Editor } from "./editor";

/** Runs the native menu items (built in `src-tauri/src/menu.rs`). */
export function initMenu(actions: DocumentActions, editor: Editor, workspace: HTMLElement): void {
  const handlers: Record<string, () => void> = {
    new: actions.newDocument,
    open: actions.open,
    save: actions.save,
    save_as: actions.saveAs,
    export_html: actions.exportHtml,
    quit: actions.quit,
    undo: () => undo(editor.view),
    redo: () => redo(editor.view),
    find: () => openSearchPanel(editor.view),
    toggle_preview: () => workspace.classList.toggle("preview-hidden"),
  };

  void listen<string>("menu", (event) => handlers[event.payload]?.());
  void listen("close-requested", () => actions.quit());
}
