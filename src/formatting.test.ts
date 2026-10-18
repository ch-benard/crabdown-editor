import { EditorSelection, EditorState, type StateCommand } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { commands, stripFormatting } from "./formatting";

/** Runs `command` on `doc`, where `[` and `]` mark the selection (or `|` the cursor). */
function run(command: StateCommand, doc: string): string {
  const cursor = doc.indexOf("|");
  const from = cursor >= 0 ? cursor : doc.indexOf("[");
  const to = cursor >= 0 ? cursor : doc.indexOf("]") - 1;
  const text = cursor >= 0 ? doc.replace("|", "") : doc.replace("[", "").replace("]", "");
  let state = EditorState.create({ doc: text, selection: EditorSelection.single(from, to) });
  command({ state, dispatch: (tr) => (state = tr.state) });
  const { from: f, to: t } = state.selection.main;
  const out = state.doc.toString();
  return f === t ? out.slice(0, f) + "|" + out.slice(f) : out.slice(0, f) + "[" + out.slice(f, t) + "]" + out.slice(t);
}

describe("inline formatting", () => {
  it("wraps the selection", () => {
    expect(run(commands.bold, "a [word] b")).toBe("a **[word]** b");
    expect(run(commands.underline, "[x]")).toBe("<ins>[x]</ins>");
  });
  it("unwraps when the markers surround the selection", () => {
    expect(run(commands.bold, "a **[word]** b")).toBe("a [word] b");
  });
  it("unwraps when the selection includes the markers", () => {
    expect(run(commands.code, "a [`x`] b")).toBe("a [x] b");
  });
  it("puts the cursor between the markers", () => {
    expect(run(commands.italic, "a |")).toBe("a _|_");
  });
});

describe("headings", () => {
  it("sets, changes and removes the level", () => {
    expect(run(commands.h2, "ti|tle")).toBe("## ti|tle");
    expect(run(commands.h1, "### ti|tle")).toBe("# ti|tle");
    expect(run(commands.h1, "# ti|tle")).toBe("ti|tle");
    expect(run(commands.paragraph, "#### ti|tle")).toBe("ti|tle");
  });
});

describe("lists and quotes", () => {
  it("numbers the selected lines", () => {
    expect(run(commands.ordered, "[a\nb\n\nc]")).toBe("[1. a\n2. b\n\n3. c]");
  });
  it("converts between list kinds and back", () => {
    expect(run(commands.task, "[- a\n- b]")).toBe("[- [ ] a\n- [ ] b]");
    expect(run(commands.bullet, "  1. a|")).toBe("  - a|");
    expect(run(commands.bullet, "- a|")).toBe("a|");
  });
  it("starts a list on an empty line", () => {
    expect(run(commands.bullet, "|")).toBe("- |");
  });
  it("toggles quotes", () => {
    expect(run(commands.quote, "[a\nb]")).toBe("[> a\n> b]");
    expect(run(commands.quote, "[> a\n> b]")).toBe("[a\nb]");
  });
});

describe("blocks", () => {
  it("fences the lines with the cursor ready for the language", () => {
    expect(run(commands.codeBlock, "[let x]")).toBe("```|\nlet x\n```");
  });
  it("inserts a table after the current line and selects the first header", () => {
    expect(run(commands.table, "text|")).toBe(
      "text\n\n| [Column 1] | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n|          |          |          |",
    );
  });
  it("inserts an alert on a blank line", () => {
    expect(run(commands.note, "a\n|\nb")).toBe("a\n\n> [!NOTE]\n> [Text]\n\nb");
    expect(run(commands.hr, "a\n\n|")).toBe("a\n\n---\n|");
  });
});

describe("links, images and footnotes", () => {
  it("uses the selection as link text and selects the URL", () => {
    expect(run(commands.link, "see [docs]")).toBe("see [docs]([https://])");
  });
  it("uses a selected URL as the target", () => {
    expect(run(commands.link, "[https://a.b]")).toBe("[[link text]](https://a.b)");
  });
  it("inserts an image template", () => {
    expect(run(commands.image, "|")).toBe("![[alt text]](image.png)");
  });
  it("adds the next footnote number and its definition", () => {
    expect(run(commands.footnote, "a[^1] b|\n\n[^1]: one\n")).toBe(
      "a[^1] b[^2]\n\n[^1]: one\n\n[^2]: [Footnote text]",
    );
  });
});

describe("clear formatting", () => {
  it("strips paired markers but keeps snake_case", () => {
    expect(stripFormatting("**b** _i_ ~~s~~ `c` <sup>2</sup> snake_case_name")).toBe("b i s c 2 snake_case_name");
  });
  it("applies to the current line when nothing is selected", () => {
    expect(run(commands.clear, "**a**|\n**b**")).toBe("[a]\n**b**");
  });
});
