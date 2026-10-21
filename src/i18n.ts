import { invoke } from "@tauri-apps/api/core";
import { selectStrings, translations, type Language } from "./strings";

const STORAGE_KEY = "language";
const listeners: (() => void)[] = [];
let current: Language = "en";

export const currentLanguage = (): Language => current;

/** Called once the menu has been rebuilt in the new language. */
export function onLanguageChange(listener: () => void): void {
  listeners.push(listener);
}

function apply(language: Language): void {
  current = language;
  selectStrings(language);
  document.documentElement.lang = language;
  void invoke("set_language", { language }).finally(() => listeners.forEach((listener) => listener()));
}

export function initLanguage(): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  apply(stored !== null && stored in translations ? (stored as Language) : "en");
}

export function setLanguage(language: Language): void {
  if (language === current) return;
  localStorage.setItem(STORAGE_KEY, language);
  apply(language);
}
