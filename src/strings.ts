export const strings = {
  appTitle: "Crabdown Editor",
  editorLabel: "Markdown source",
  previewLabel: "Preview",
  splitterLabel: "Resize editor and preview",
  previewError: "Preview unavailable:",
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
