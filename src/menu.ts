import { listen } from "@tauri-apps/api/event";
import { redo, undo } from "@codemirror/commands";
import { openSearchPanel } from "@codemirror/search";
import type { DocumentActions } from "./document";
import type { Editor } from "./editor";
import type { ThemeController } from "./theme";
import type { Toolbar } from "./toolbar";

/** Runs the native menu items (built in `src-tauri/src/menu.rs`). */
export function initMenu(
  actions: DocumentActions,
  editor: Editor,
  theme: ThemeController,
  toolbar: Toolbar,
  workspace: HTMLElement,
): void {
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
    toggle_toolbar: () => toolbar.toggle(),
    toggle_preview: () => workspace.classList.toggle("preview-hidden"),
    theme_system: () => theme.set("system"),
    theme_light: () => theme.set("light"),
    theme_dark: () => theme.set("dark"),
    cycle_theme: () => theme.cycle(),
  };

  void listen<string>("menu", (event) => handlers[event.payload]?.());
  void listen("close-requested", () => actions.quit());
}
