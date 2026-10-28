import {
  EditorSelection,
  type EditorState,
  type Line,
  type SelectionRange,
  type StateCommand,
  type Transaction,
  type TransactionSpec,
} from "@codemirror/state";

/** Markdown formatting commands, shared by the toolbar and the keyboard shortcuts. */
export type ActionId =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "underline"
  | "sup"
  | "sub"
  | "clear"
  | "bullet"
  | "ordered"
  | "task"
  | "quote"
  | "codeBlock"
  | "hr"
  | "table"
  | "link"
  | "image"
  | "footnote"
  | "note"
  | "tip"
  | "important"
  | "warning"
  | "caution";

type Target = { state: EditorState; dispatch: (tr: Transaction) => void };

function apply({ state, dispatch }: Target, spec: TransactionSpec): boolean {
  dispatch(state.update(spec, { scrollIntoView: true, userEvent: "input.format" }));
  return true;
}

/** Wraps each selection in `open`…`close`, or unwraps it when already wrapped. */
function toggleInline(open: string, close = open): StateCommand {
  return (target) => {
    const { doc } = target.state;
    return apply(
      target,
      target.state.changeByRange(({ from, to }) => {
        const before = doc.sliceString(Math.max(0, from - open.length), from);
        if (before === open && doc.sliceString(to, to + close.length) === close) {
          return {
            changes: [
              { from: from - open.length, to: from },
              { from: to, to: to + close.length },
            ],
            range: EditorSelection.range(from - open.length, to - open.length),
          };
        }
        const text = doc.sliceString(from, to);
        if (text.length >= open.length + close.length && text.startsWith(open) && text.endsWith(close)) {
          const inner = text.slice(open.length, text.length - close.length);
          return { changes: { from, to, insert: inner }, range: EditorSelection.range(from, from + inner.length) };
        }
        return {
          changes: [
            { from, insert: open },
            { from: to, insert: close },
          ],
          range: EditorSelection.range(from + open.length, to + open.length),
        };
      }),
    );
  };
}

function selectedLines(state: EditorState, range: SelectionRange): Line[] {
  const first = state.doc.lineAt(range.from);
  let last = state.doc.lineAt(range.to);
  if (range.to > range.from && range.to === last.from && last.number > first.number) {
    last = state.doc.line(last.number - 1);
  }
  const lines: Line[] = [];
  for (let n = first.number; n <= last.number; n++) lines.push(state.doc.line(n));
  return lines;
}

/** For each selected line, `edit` returns [length of the prefix to remove, prefix to insert]. */
type PrefixEdit = (texts: string[]) => [number, string][];

function editPrefixes(edit: PrefixEdit): StateCommand {
  return (target) =>
    apply(
      target,
      target.state.changeByRange((range) => {
        const lines = selectedLines(target.state, range);
        const edits = edit(lines.map((line) => line.text));
        const changes = target.state.changes(
          lines.map((line, i) => ({ from: line.from, to: line.from + edits[i][0], insert: edits[i][1] })),
        );
        return {
          changes,
          range: range.empty
            ? range.map(changes, 1)
            : EditorSelection.range(changes.mapPos(range.from, -1), changes.mapPos(range.to, 1)),
        };
      }),
    );
}

const HEADING = /^(#{1,6})(?:[ \t]+|$)/;

function heading(level: number): StateCommand {
  return editPrefixes((texts) => {
    const levels = texts.map((t) => t.match(HEADING)?.[1].length ?? 0);
    const target = level > 0 && levels.every((l) => l === level) ? 0 : level;
    return texts.map((t) => [t.match(HEADING)?.[0].length ?? 0, target ? `${"#".repeat(target)} ` : ""]);
  });
}

const LIST_PREFIX = /^(\s*)(?:[-*+][ \t]+\[[ xX]\][ \t]+|[-*+][ \t]+|\d+[.)][ \t]+)/;
const LIST_KIND = {
  bullet: /^\s*[-*+][ \t]+(?!\[[ xX]\][ \t])/,
  task: /^\s*[-*+][ \t]+\[[ xX]\][ \t]+/,
  ordered: /^\s*\d+[.)][ \t]+/,
};

/** Turns the lines into a list of `kind`, or back into paragraphs if they already are one. */
function list(kind: keyof typeof LIST_KIND): StateCommand {
  return editPrefixes((texts) => {
    const hasContent = texts.some((t) => t.trim());
    const skip = (t: string) => hasContent && !t.trim();
    const isList = texts.filter((t) => !skip(t)).every((t) => LIST_KIND[kind].test(t));
    let n = 0;
    return texts.map((t) => {
      const match = t.match(LIST_PREFIX);
      const indent = match ? match[1] : t.match(/^\s*/)![0];
      const remove = match ? match[0].length : indent.length;
      if (skip(t)) return [0, ""];
      if (isList) return [remove, indent];
      n++;
      const marker = kind === "ordered" ? `${n}. ` : kind === "task" ? "- [ ] " : "- ";
      return [remove, indent + marker];
    });
  });
}

const QUOTE = /^\s*>[ ]?/;

const quote = editPrefixes((texts) => {
  const content = texts.filter((t) => t.trim());
  const quoted = content.length > 0 && content.every((t) => QUOTE.test(t));
  return texts.map((t) => {
    if (quoted) return [t.match(QUOTE)?.[0].length ?? 0, ""];
    return [0, t.trim() || texts.length === 1 ? "> " : ">"];
  });
});

/** Fences the selected lines; the cursor lands after the opening fence to type the language. */
const codeBlock: StateCommand = (target) =>
  apply(
    target,
    target.state.changeByRange((range) => {
      const lines = selectedLines(target.state, range);
      const from = lines[0].from;
      const to = lines[lines.length - 1].to;
      const text = target.state.doc.sliceString(from, to);
      return {
        changes: { from, to, insert: "```\n" + text + "\n```" },
        range: EditorSelection.cursor(from + 3),
      };
    }),
  );

/** Inserts a block surrounded by blank lines (after the current line unless blank) and selects `placeholder`. */
function insertBlock(before: string, placeholder: string, after = ""): StateCommand {
  return (target) => {
    const { doc } = target.state;
    return apply(
      target,
      target.state.changeByRange((range) => {
        const line = doc.lineAt(range.head);
        const blank = !line.text.trim();
        const previous = line.number > 1 ? doc.line(line.number - 1) : null;
        const lead = !blank ? "\n\n" : previous && previous.text.trim() ? "\n" : "";
        const next = line.number < doc.lines ? doc.line(line.number + 1) : null;
        const trail = next && next.text.trim() ? "\n" : "";
        const from = blank ? line.from : line.to;
        const start = from + lead.length + before.length;
        return {
          changes: { from, to: line.to, insert: lead + before + placeholder + after + trail },
          range: EditorSelection.range(start, start + placeholder.length),
        };
      }),
    );
  };
}

const URL_LIKE = /^(https?:\/\/|www\.|mailto:)\S+$/;

/** `[text](url)`: the selection becomes the text (or the URL if it looks like one). */
function linkLike(prefix: string, textPlaceholder: string, urlPlaceholder: string): StateCommand {
  return (target) =>
    apply(
      target,
      target.state.changeByRange(({ from, to }) => {
        const selected = target.state.doc.sliceString(from, to).trim();
        const isUrl = URL_LIKE.test(selected);
        const text = selected && !isUrl ? selected : textPlaceholder;
        const url = isUrl ? selected : urlPlaceholder;
        const insert = `${prefix}[${text}](${url})`;
        const textStart = from + prefix.length + 1;
        const range =
          selected && !isUrl
            ? EditorSelection.range(textStart + text.length + 2, textStart + text.length + 2 + url.length)
            : EditorSelection.range(textStart, textStart + text.length);
        return { changes: { from, to, insert }, range };
      }),
    );
}

/** Adds `[^n]` after the selection and its definition at the end of the document. */
const footnote: StateCommand = (target) => {
  const { doc, selection } = target.state;
  const text = doc.toString();
  const used = [...text.matchAll(/\[\^(\d+)\]/g)].map((m) => Number(m[1]));
  const n = Math.max(0, ...used) + 1;
  const reference = `[^${n}]`;
  const separator = text.endsWith("\n\n") || !text ? "" : text.endsWith("\n") ? "\n" : "\n\n";
  const definition = `${separator}[^${n}]: `;
  const placeholder = "Footnote text";
  const start = doc.length + reference.length + definition.length;
  return apply(target, {
    changes: [
      { from: selection.main.to, insert: reference },
      { from: doc.length, insert: definition + placeholder },
    ],
    selection: EditorSelection.single(start, start + placeholder.length),
  });
};

const FORMATTING: RegExp[] = [
  /\*\*(.+?)\*\*/gs,
  /__(.+?)__/gs,
  /~~(.+?)~~/gs,
  /==(.+?)==/gs,
  /\*(.+?)\*/gs,
  /(?<!\w)_(.+?)_(?!\w)/gs,
  /`([^`]+)`/g,
  /<(?:ins|sup|sub|mark|u)>(.*?)<\/(?:ins|sup|sub|mark|u)>/gs,
];

export function stripFormatting(text: string): string {
  return FORMATTING.reduce((t, pattern) => t.replace(pattern, "$1"), text);
}

/** Removes inline formatting from the selection, or from the current line. */
const clear: StateCommand = (target) =>
  apply(
    target,
    target.state.changeByRange((range) => {
      const line = target.state.doc.lineAt(range.head);
      const [from, to] = range.empty ? [line.from, line.to] : [range.from, range.to];
      const stripped = stripFormatting(target.state.doc.sliceString(from, to));
      return { changes: { from, to, insert: stripped }, range: EditorSelection.range(from, from + stripped.length) };
    }),
  );

const alert = (type: string) => insertBlock(`> [!${type}]\n> `, "Text");

export const commands: Record<ActionId, StateCommand> = {
  paragraph: heading(0),
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(5),
  h6: heading(6),
  bold: toggleInline("**"),
  italic: toggleInline("_"),
  strike: toggleInline("~~"),
  code: toggleInline("`"),
  underline: toggleInline("<ins>", "</ins>"),
  sup: toggleInline("<sup>", "</sup>"),
  sub: toggleInline("<sub>", "</sub>"),
  clear,
  bullet: list("bullet"),
  ordered: list("ordered"),
  task: list("task"),
  quote,
  codeBlock,
  hr: insertBlock("---\n", ""),
  table: insertBlock(
    "| ",
    "Column 1",
    " | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n|          |          |          |",
  ),
  link: linkLike("", "link text", "https://"),
  image: linkLike("!", "alt text", "image.png"),
  footnote,
  note: alert("NOTE"),
  tip: alert("TIP"),
  important: alert("IMPORTANT"),
  warning: alert("WARNING"),
  caution: alert("CAUTION"),
};
