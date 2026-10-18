import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { commands, type ActionId } from "./formatting";

/** Formatting shortcuts (see docs/CAHIER_DES_CHARGES.md §4), in CodeMirror key notation. */
export const shortcuts: Partial<Record<ActionId, string>> = {
  paragraph: "Mod-0",
  h1: "Mod-1",
  h2: "Mod-2",
  h3: "Mod-3",
  h4: "Mod-4",
  h5: "Mod-5",
  h6: "Mod-6",
  bold: "Mod-b",
  italic: "Mod-i",
  underline: "Mod-u",
  strike: "Alt-Shift-5",
  code: "Mod-e",
  link: "Mod-k",
  sup: "Mod-.",
  sub: "Mod-,",
  clear: "Mod-Space",
  ordered: "Mod-Shift-7",
  bullet: "Mod-Shift-8",
  task: "Mod-Shift-9",
  quote: "Mod-Shift-q",
  codeBlock: "Mod-Shift-k",
  table: "Mod-t",
  image: "Mod-Alt-i",
  footnote: "Mod-Alt-f",
  hr: "Mod-Shift--",
};

export function formattingKeymap() {
  return Prec.high(
    keymap.of(
      Object.entries(shortcuts).map(([id, key]) => ({
        key,
        run: commands[id as ActionId],
        preventDefault: true,
      })),
    ),
  );
}

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
const MODIFIERS: Record<string, string> = {
  Mod: isMac ? "⌘" : "Ctrl",
  Alt: isMac ? "⌥" : "Alt",
  Shift: "Shift",
  Space: "Space",
};

/** "Mod-Shift-k" → "Ctrl+Shift+K". */
export function describeShortcut(key: string): string {
  const parts = key.endsWith("--") ? [...key.slice(0, -2).split("-"), "-"] : key.split("-");
  return parts.map((p) => MODIFIERS[p] ?? p.toUpperCase()).join("+");
}
