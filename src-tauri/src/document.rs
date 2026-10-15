use std::path::{Path, PathBuf};

use crate::strings::{APP_NAME, UNTITLED};

pub const MARKDOWN_EXTENSIONS: &[&str] = &["md", "markdown", "mdown", "mkd"];

const MARKDOWN_CSS: &str = include_str!("../../src/markdown.css");
const PAGE_CSS: &str = "body {
  max-width: 980px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: #ffffff;
}
";

/// File name shown in the window title and dialogs.
pub fn display_name(path: Option<&Path>) -> String {
    path.and_then(Path::file_name).map_or_else(
        || UNTITLED.to_owned(),
        |name| name.to_string_lossy().into_owned(),
    )
}

/// File name without extension, used as the title of exported documents.
pub fn title(path: Option<&Path>) -> String {
    path.and_then(Path::file_stem).map_or_else(
        || UNTITLED.to_owned(),
        |stem| stem.to_string_lossy().into_owned(),
    )
}

pub fn default_file_name(path: Option<&Path>, extension: &str) -> String {
    format!("{}.{extension}", title(path))
}

pub fn window_title(name: &str, modified: bool) -> String {
    let marker = if modified { "*" } else { "" };
    format!("{name}{marker} — {APP_NAME}")
}

/// Adds `extension` when the chosen path has none, unless that would silently
/// replace another file (the overwrite confirmation was for the original path).
pub fn resolve_save_path(path: PathBuf, extension: &str) -> PathBuf {
    if path.extension().is_some() {
        return path;
    }
    let with_extension = path.with_extension(extension);
    if with_extension.exists() {
        path
    } else {
        with_extension
    }
}

/// Standalone HTML page embedding the preview stylesheet.
pub fn html_document(title: &str, body: &str) -> String {
    format!(
        "<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\">
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
<title>{}</title>
<style>
{PAGE_CSS}
{MARKDOWN_CSS}</style>
</head>
<body>
<article class=\"markdown-body\">
{body}</article>
</body>
</html>
",
        escape_html(title)
    )
}

fn escape_html(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn names_fall_back_to_untitled() {
        assert_eq!(display_name(None), "Untitled");
        assert_eq!(title(None), "Untitled");
        assert_eq!(default_file_name(None, "md"), "Untitled.md");
    }

    #[test]
    fn names_come_from_the_path() {
        let path = Path::new("/notes/todo.markdown");
        assert_eq!(display_name(Some(path)), "todo.markdown");
        assert_eq!(title(Some(path)), "todo");
        assert_eq!(default_file_name(Some(path), "html"), "todo.html");
    }

    #[test]
    fn window_title_marks_unsaved_changes() {
        assert_eq!(window_title("a.md", false), "a.md — Crabdown Editor");
        assert_eq!(window_title("a.md", true), "a.md* — Crabdown Editor");
    }

    #[test]
    fn save_path_gets_a_default_extension() {
        let dir = std::env::temp_dir().join(format!("crabdown-test-{}", std::process::id()));
        fs::create_dir_all(&dir).unwrap();

        assert_eq!(
            resolve_save_path(dir.join("a.txt"), "md"),
            dir.join("a.txt")
        );
        assert_eq!(resolve_save_path(dir.join("new"), "md"), dir.join("new.md"));

        fs::write(dir.join("taken.md"), "").unwrap();
        assert_eq!(
            resolve_save_path(dir.join("taken"), "md"),
            dir.join("taken")
        );

        fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn html_document_is_standalone() {
        let html = html_document("<Notes> & co", "<p>Hi</p>\n");
        assert!(html.starts_with("<!doctype html>"));
        assert!(html.contains("<title>&lt;Notes&gt; &amp; co</title>"));
        assert!(html.contains(".markdown-body"));
        assert!(html.contains("<p>Hi</p>"));
    }
}
