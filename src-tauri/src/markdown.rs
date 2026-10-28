use std::sync::LazyLock;

use comrak::{Options, markdown_to_html};

static OPTIONS: LazyLock<Options<'static>> = LazyLock::new(|| {
    let mut options = Options::default();
    let ext = &mut options.extension;
    ext.strikethrough = true;
    ext.table = true;
    ext.autolink = true;
    ext.tasklist = true;
    ext.footnotes = true;
    ext.alerts = true;
    ext.shortcodes = true;
    ext.math_dollars = true;
    ext.math_code = true;
    ext.front_matter_delimiter = Some("---".to_owned());
    ext.header_id_prefix = Some("user-content-".to_owned());
    options.render.r#unsafe = true;
    options
});

static SANITIZER: LazyLock<ammonia::Builder<'static>> = LazyLock::new(|| {
    let mut builder = ammonia::Builder::default();
    builder
        .add_tags(["input", "section"])
        .add_generic_attributes(["class", "id", "align", "aria-hidden", "aria-label"])
        .add_generic_attribute_prefixes(["data-"])
        .add_tag_attributes("input", ["checked"])
        .set_tag_attribute_value("input", "type", "checkbox")
        .set_tag_attribute_value("input", "disabled", "");
    builder
});

/// Renders Markdown to HTML that is safe to inject into the preview.
pub fn render(source: &str) -> String {
    let html = markdown_to_html(source, &OPTIONS);
    SANITIZER.clean(&html).to_string()
}

#[cfg(test)]
mod tests {
    use super::render;

    #[test]
    fn renders_commonmark() {
        let html = render("# Title\n\nSome *em* and **strong** and `code`.");
        assert!(html.contains("<h1"));
        assert!(html.contains(r#"id="user-content-title""#));
        assert!(html.contains("<em>em</em>"));
        assert!(html.contains("<strong>strong</strong>"));
        assert!(html.contains("<code>code</code>"));
    }

    #[test]
    fn renders_gfm_extensions() {
        let html = render(
            "| a | b |\n|:--|--:|\n| 1 | 2 |\n\n~~gone~~\n\n- [x] done\n- [ ] todo\n\nhttps://example.com",
        );
        assert!(html.contains("<table>"));
        assert!(html.contains("<del>gone</del>"));
        assert!(html.contains(r#"type="checkbox""#));
        assert!(html.contains("checked"));
        assert!(html.contains(r#"href="https://example.com""#));
    }

    #[test]
    fn renders_footnotes_alerts_emoji_and_math() {
        let html = render("Text[^1]\n\n[^1]: Note.\n\n> [!NOTE]\n> Hi\n\n:rocket: $x^2$");
        assert!(html.contains("footnote"));
        assert!(html.contains("markdown-alert-note"));
        assert!(html.contains('🚀'));
        assert!(html.contains(r#"data-math-style="inline""#));
    }

    #[test]
    fn hides_front_matter() {
        let html = render("---\ntitle: Hello\n---\n\nBody");
        assert!(!html.contains("title: Hello"));
        assert!(html.contains("Body"));
    }

    #[test]
    fn keeps_safe_raw_html_and_strips_scripts() {
        let html = render(
            "<kbd>Ctrl</kbd>\n\n<script>alert(1)</script>\n\n<a href=\"javascript:alert(1)\" onclick=\"x()\">x</a>\n\n<img src=x onerror=alert(1)>",
        );
        assert!(html.contains("<kbd>Ctrl</kbd>"));
        assert!(!html.contains("<script"));
        assert!(!html.contains("javascript:"));
        assert!(!html.contains("onclick"));
        assert!(!html.contains("onerror"));
    }

    #[test]
    fn forces_task_list_inputs_to_be_inert() {
        let html = render(r#"<input type="text" value="x">"#);
        assert!(html.contains(r#"type="checkbox""#));
        assert!(html.contains("disabled"));
        assert!(!html.contains("text"));
    }
}
