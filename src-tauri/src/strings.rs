//! User-facing texts of the native menu and dialogs (English only in v1).

use std::io;
use std::path::Path;

pub const APP_NAME: &str = "Crabdown Editor";
pub const UNTITLED: &str = "Untitled";

pub const MARKDOWN_FILTER: &str = "Markdown";
pub const HTML_FILTER: &str = "HTML";
pub const ALL_FILES_FILTER: &str = "All files";

pub const OPEN_TITLE: &str = "Open";
pub const SAVE_AS_TITLE: &str = "Save As";
pub const EXPORT_HTML_TITLE: &str = "Export as HTML";

pub const SAVE: &str = "Save";
pub const DONT_SAVE: &str = "Don't Save";
pub const CANCEL: &str = "Cancel";

pub fn confirm_discard(name: &str) -> String {
    format!(
        "Do you want to save the changes to {name}?\n\nYour changes will be lost if you don't save them."
    )
}

pub fn open_failed(path: &Path, error: &io::Error) -> String {
    format!("Could not open {}:\n{error}", path.display())
}

pub fn save_failed(path: &Path, error: &io::Error) -> String {
    format!("Could not save {}:\n{error}", path.display())
}

pub fn export_failed(path: &Path, error: &io::Error) -> String {
    format!("Could not export {}:\n{error}", path.display())
}

pub mod menu {
    pub const FILE: &str = "File";
    pub const NEW: &str = "New";
    pub const OPEN: &str = "Open…";
    pub const SAVE: &str = "Save";
    pub const SAVE_AS: &str = "Save As…";
    pub const EXPORT_HTML: &str = "Export as HTML…";
    pub const PRINT: &str = "Print / Export as PDF…";
    pub const QUIT: &str = "Quit";

    pub const EDIT: &str = "Edit";
    pub const UNDO: &str = "Undo";
    pub const REDO: &str = "Redo";
    pub const FIND: &str = "Find…";

    pub const VIEW: &str = "View";
    pub const SHOW_TOOLBAR: &str = "Show Toolbar";
    pub const SHOW_PREVIEW: &str = "Show Preview";
    pub const THEME: &str = "Theme";
    pub const THEME_SYSTEM: &str = "System";
    pub const THEME_LIGHT: &str = "Light";
    pub const THEME_DARK: &str = "Dark";
    pub const CYCLE_THEME: &str = "Cycle Theme";
}
