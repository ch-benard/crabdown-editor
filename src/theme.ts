import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { Editor } from "./editor";

export type ThemePreference = "system" | "light" | "dark";
type Theme = "light" | "dark";

export interface ThemeController {
  set(preference: ThemePreference): void;
  /** Restores the check marks of View → Theme. */
  syncMenu(): void;
  /** System → Light → Dark → System. */
  cycle(): void;
}

const STORAGE_KEY = "theme";
const ORDER: ThemePreference[] = ["system", "light", "dark"];

function loadPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
  return stored && ORDER.includes(stored) ? stored : "system";
}

/**
 * Light/dark theme for the whole window. In "system" mode the theme follows
 * the OS (via Tauri: XDG portal on Linux, native APIs on Windows/macOS).
 */
export function initTheme(editor: Editor): ThemeController {
  let preference = loadPreference();

  const show = (theme: Theme) => {
    document.documentElement.dataset.theme = theme;
    editor.setDarkTheme(theme === "dark");
  };

  const apply = async (next: ThemePreference) => {
    preference = next;
    localStorage.setItem(STORAGE_KEY, next);
    show(await invoke<Theme>("set_theme", { theme: next }));
  };

  // Avoids a light flash before the native theme is known.
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  show(preference === "system" ? (systemDark ? "dark" : "light") : preference);

  // Tauri reports OS theme changes on Windows and macOS, but not on Linux, where only
  // WebKitGTK's prefers-color-scheme follows the portal. Listen to both and ask Rust.
  const onSystemThemeChange = () => {
    if (preference === "system") void invoke<Theme>("current_theme").then(show);
  };
  const appWindow = getCurrentWindow();
  void appWindow.onThemeChanged(onSystemThemeChange);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onSystemThemeChange);
  // On Linux, switching back to System while the OS is dark can leave WebKitGTK unaware of
  // the next change; re-checking on focus covers coming back from the system settings.
  void appWindow.onFocusChanged(({ payload: focused }) => {
    if (focused) onSystemThemeChange();
  });
  void apply(preference);

  return {
    set: (next) => void apply(next),
    syncMenu: () => void apply(preference),
    cycle: () => void apply(ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length]),
  };
}
