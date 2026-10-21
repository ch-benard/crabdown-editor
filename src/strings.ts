import type { ActionId } from "./formatting";

export type Language = "en" | "fr" | "es";

/** Each language is listed under its own name. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

const en = {
  editorLabel: "Markdown source",
  previewLabel: "Preview",
  splitterLabel: "Resize editor and preview",
  previewError: "Preview unavailable:",
  toolbarLabel: "Formatting",
  moreLabel: "More formatting",
  actions: {
    paragraph: "Paragraph",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
    bold: "Bold",
    italic: "Italic",
    strike: "Strikethrough",
    code: "Inline code",
    underline: "Underline",
    sup: "Superscript",
    sub: "Subscript",
    clear: "Clear formatting",
    bullet: "Bulleted list",
    ordered: "Numbered list",
    task: "Task list",
    quote: "Quote",
    codeBlock: "Code block",
    hr: "Horizontal rule",
    table: "Table",
    link: "Link",
    image: "Image",
    footnote: "Footnote",
    note: "Note alert",
    tip: "Tip alert",
    important: "Important alert",
    warning: "Warning alert",
    caution: "Caution alert",
  } satisfies Record<ActionId, string>,
  preferencesTitle: "Preferences",
  languageLabel: "Language",
  close: "Close",
};

export type UiStrings = typeof en;

const fr: UiStrings = {
  editorLabel: "Source Markdown",
  previewLabel: "Aperçu",
  splitterLabel: "Redimensionner l'éditeur et l'aperçu",
  previewError: "Aperçu indisponible :",
  toolbarLabel: "Mise en forme",
  moreLabel: "Plus de mise en forme",
  actions: {
    paragraph: "Paragraphe",
    h1: "Titre 1",
    h2: "Titre 2",
    h3: "Titre 3",
    h4: "Titre 4",
    h5: "Titre 5",
    h6: "Titre 6",
    bold: "Gras",
    italic: "Italique",
    strike: "Barré",
    code: "Code en ligne",
    underline: "Souligné",
    sup: "Exposant",
    sub: "Indice",
    clear: "Effacer la mise en forme",
    bullet: "Liste à puces",
    ordered: "Liste numérotée",
    task: "Liste de tâches",
    quote: "Citation",
    codeBlock: "Bloc de code",
    hr: "Ligne de séparation",
    table: "Tableau",
    link: "Lien",
    image: "Image",
    footnote: "Note de bas de page",
    note: "Alerte Note",
    tip: "Alerte Astuce",
    important: "Alerte Important",
    warning: "Alerte Avertissement",
    caution: "Alerte Attention",
  },
  preferencesTitle: "Préférences",
  languageLabel: "Langue",
  close: "Fermer",
};

const es: UiStrings = {
  editorLabel: "Fuente Markdown",
  previewLabel: "Vista previa",
  splitterLabel: "Cambiar el tamaño del editor y la vista previa",
  previewError: "Vista previa no disponible:",
  toolbarLabel: "Formato",
  moreLabel: "Más formato",
  actions: {
    paragraph: "Párrafo",
    h1: "Encabezado 1",
    h2: "Encabezado 2",
    h3: "Encabezado 3",
    h4: "Encabezado 4",
    h5: "Encabezado 5",
    h6: "Encabezado 6",
    bold: "Negrita",
    italic: "Cursiva",
    strike: "Tachado",
    code: "Código en línea",
    underline: "Subrayado",
    sup: "Superíndice",
    sub: "Subíndice",
    clear: "Borrar formato",
    bullet: "Lista con viñetas",
    ordered: "Lista numerada",
    task: "Lista de tareas",
    quote: "Cita",
    codeBlock: "Bloque de código",
    hr: "Línea horizontal",
    table: "Tabla",
    link: "Enlace",
    image: "Imagen",
    footnote: "Nota al pie",
    note: "Alerta de nota",
    tip: "Alerta de consejo",
    important: "Alerta importante",
    warning: "Alerta de advertencia",
    caution: "Alerta de precaución",
  },
  preferencesTitle: "Preferencias",
  languageLabel: "Idioma",
  close: "Cerrar",
};

export const translations: Record<Language, UiStrings> = { en, fr, es };

/** Texts of the current language (see `i18n.ts`). */
export let strings: UiStrings = en;

export function selectStrings(language: Language): void {
  strings = translations[language];
}

export const appTitle = "Crabdown Editor";

export const welcomeDocument = `# Welcome to Crabdown Editor

Type Markdown on the left; the preview on the right updates as you type.

## Formatting

Some *italic*, **bold**, ~~strikethrough~~ and \`inline code\` text.

- [x] Task lists
- [ ] Footnotes[^1]
- Emoji shortcodes :crab:

> [!TIP]
> GitHub-style alerts are supported.

| Left | Center | Right |
|:-----|:------:|------:|
| a    |   b    |     c |

\`\`\`rust
fn main() {
    println!("Hello from Rust!");
}
\`\`\`

[^1]: Footnotes are rendered at the end of the document.
`;
