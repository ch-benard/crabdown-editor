import { invoke } from "@tauri-apps/api/core";
import type { Editor } from "./editor";
import type { Preview } from "./preview";

type DiscardChoice = "save" | "discard" | "cancel";
type SaveCommand = "save_document" | "save_document_as";

export interface DocumentActions {
  markModified(): void;
  newDocument(): void;
  open(): void;
  save(): void;
  saveAs(): void;
  exportHtml(): void;
  quit(): void;
}

/**
 * File operations. Dialogs, paths and disk access live in the Rust commands;
 * this side only sends and receives document content.
 */
export function createDocumentActions(editor: Editor, preview: Preview): DocumentActions {
  let modified = false;
  let busy = false;

  function markModified(): void {
    if (modified) return;
    modified = true;
    void invoke("set_modified", { modified });
  }

  function load(content: string): void {
    editor.setDocument(content);
    void preview.render(content);
    modified = false;
  }

  async function save(command: SaveCommand): Promise<boolean> {
    const content = editor.getDocument();
    const saved = await invoke<boolean>(command, { content });
    if (saved) {
      modified = false;
      if (editor.getDocument() !== content) markModified();
    }
    return saved;
  }

  async function confirmDiscard(): Promise<boolean> {
    if (!modified) return true;
    const choice = await invoke<DiscardChoice>("confirm_discard");
    if (choice === "save") return save("save_document");
    return choice === "discard";
  }

  function exclusive(action: () => Promise<unknown>): () => void {
    return () => {
      if (busy) return;
      busy = true;
      action()
        .catch((error) => console.error(error))
        .finally(() => {
          busy = false;
        });
    };
  }

  return {
    markModified,
    newDocument: exclusive(async () => {
      if (!(await confirmDiscard())) return;
      await invoke("new_document");
      load("");
    }),
    open: exclusive(async () => {
      if (!(await confirmDiscard())) return;
      const content = await invoke<string | null>("open_document");
      if (content !== null) load(content);
    }),
    save: exclusive(() => save("save_document")),
    saveAs: exclusive(() => save("save_document_as")),
    exportHtml: exclusive(() => invoke("export_html", { content: editor.getDocument() })),
    quit: exclusive(async () => {
      if (await confirmDiscard()) await invoke("quit");
    }),
  };
}
