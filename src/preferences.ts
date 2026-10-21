import { currentLanguage, onLanguageChange, setLanguage } from "./i18n";
import { LANGUAGE_NAMES, strings, type Language } from "./strings";

export interface Preferences {
  open(): void;
}

/** Edit → Preferences: a modal dialog applying each change immediately. */
export function initPreferences(onClose: () => void): Preferences {
  const dialog = document.createElement("dialog");
  dialog.className = "preferences";
  const form = document.createElement("form");
  form.method = "dialog";

  const title = document.createElement("h2");
  title.id = "preferences-title";
  dialog.setAttribute("aria-labelledby", title.id);

  const field = document.createElement("label");
  const caption = document.createElement("span");
  const select = document.createElement("select");
  for (const [code, name] of Object.entries(LANGUAGE_NAMES)) select.add(new Option(name, code));
  select.addEventListener("change", () => setLanguage(select.value as Language));
  field.append(caption, select);

  const buttons = document.createElement("div");
  buttons.className = "preferences-actions";
  const close = document.createElement("button");
  close.className = "tool";
  buttons.append(close);

  form.append(title, field, buttons);
  dialog.append(form);
  document.body.append(dialog);

  const applyLabels = () => {
    title.textContent = strings.preferencesTitle;
    caption.textContent = strings.languageLabel;
    close.textContent = strings.close;
  };
  applyLabels();
  onLanguageChange(applyLabels);
  dialog.addEventListener("close", onClose);

  return {
    open() {
      if (dialog.open) return;
      select.value = currentLanguage();
      dialog.showModal();
      select.focus();
    },
  };
}
