import { invoke } from "@tauri-apps/api/core";
import type { EditorView } from "@codemirror/view";
import { commands, type ActionId } from "./formatting";
import { describeShortcut, shortcuts } from "./keymap";
import { onLanguageChange } from "./i18n";
import { strings } from "./strings";

/** Visible buttons as [action, short label], by group. */
const GROUPS: [ActionId, string][][] = [
  [
    ["h1", "H1"],
    ["h2", "H2"],
    ["h3", "H3"],
  ],
  [
    ["bold", "B"],
    ["italic", "I"],
    ["strike", "S"],
    ["code", "</>"],
    ["clear", "Tx"],
    ["codeBlock", "{ }"],
  ],
  [
    ["bullet", "•"],
    ["ordered", "1."],
    ["task", "chk"],
    ["quote", "qt"],
  ],
  [
    ["hr", "—"],
    ["table", "tbl"],
    ["link", "url"],
    ["image", "img"],
    ["footnote", "fn"],
  ],
];

/** Actions of the overflow menu, by section. */
const MORE: ActionId[][] = [
  ["paragraph", "h4", "h5", "h6"],
  ["underline", "sup", "sub"],
  ["note", "tip", "important", "warning", "caution"],
];

const STORAGE_KEY = "toolbar";

export interface Toolbar {
  toggle(): void;
  /** Restores the check mark of View → Show Toolbar. */
  syncMenu(): void;
}

export function initToolbar(root: HTMLElement, view: EditorView): Toolbar {
  const run = (id: ActionId) => {
    commands[id](view);
    view.focus();
  };
  const shortcut = (id: ActionId) => (shortcuts[id] ? describeShortcut(shortcuts[id]) : "");
  const button = (className: string, onClick: () => void) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = className;
    // Keeps the editor focused and its selection intact.
    el.addEventListener("mousedown", (event) => event.preventDefault());
    el.addEventListener("click", onClick);
    return el;
  };

  root.setAttribute("role", "toolbar");
  const tools: [HTMLElement, ActionId][] = [];
  const items: [HTMLElement, ActionId][] = [];

  const groups = document.createElement("div");
  groups.className = "toolbar-groups";
  for (const group of GROUPS) {
    const el = document.createElement("div");
    el.className = "toolbar-group";
    for (const [id, label] of group) {
      const tool = button("tool", () => run(id));
      tool.dataset.action = id;
      tool.textContent = label;
      tools.push([tool, id]);
      el.append(tool);
    }
    groups.append(el);
  }

  const menu = document.createElement("div");
  menu.className = "toolbar-menu";
  menu.setAttribute("role", "menu");
  menu.hidden = true;
  const more = button("tool more", () => setMenuOpen(menu.hidden === true));
  more.textContent = "▾";
  more.setAttribute("aria-haspopup", "menu");

  const setMenuOpen = (open: boolean) => {
    menu.hidden = !open;
    more.setAttribute("aria-expanded", String(open));
  };

  MORE.forEach((section, i) => {
    if (i > 0) {
      const separator = document.createElement("div");
      separator.className = "menu-separator";
      menu.append(separator);
    }
    for (const id of section) {
      const item = button("menu-item", () => {
        setMenuOpen(false);
        run(id);
      });
      item.setAttribute("role", "menuitem");
      const label = document.createElement("span");
      items.push([label, id]);
      const key = document.createElement("kbd");
      key.textContent = shortcut(id);
      item.append(label, key);
      menu.append(item);
    }
  });

  document.addEventListener("mousedown", (event) => {
    if (!menu.hidden && !root.contains(event.target as Node)) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      setMenuOpen(false);
      view.focus();
    }
  });

  root.append(groups, more, menu);

  const applyLabels = () => {
    root.setAttribute("aria-label", strings.toolbarLabel);
    for (const [tool, id] of tools) {
      tool.setAttribute("aria-label", strings.actions[id]);
      tool.title = shortcut(id) ? `${strings.actions[id]} (${shortcut(id)})` : strings.actions[id];
    }
    more.title = strings.moreLabel;
    more.setAttribute("aria-label", strings.moreLabel);
    for (const [label, id] of items) label.textContent = strings.actions[id];
  };
  applyLabels();
  onLanguageChange(applyLabels);

  let visible = localStorage.getItem(STORAGE_KEY) !== "hidden";
  const show = () => {
    root.hidden = !visible;
    if (!visible) setMenuOpen(false);
    localStorage.setItem(STORAGE_KEY, visible ? "visible" : "hidden");
    syncMenu();
  };
  const syncMenu = () => void invoke("set_view_checked", { id: "toggle_toolbar", checked: visible });
  show();

  return {
    toggle() {
      visible = !visible;
      show();
    },
    syncMenu,
  };
}
