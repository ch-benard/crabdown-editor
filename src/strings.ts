import type { ActionId } from "./formatting";

export const strings = {
  appTitle: "Crabdown Editor",
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
  welcomeDocument: `# Welcome to Crabdown Editor

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
`,
};
