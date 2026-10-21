//! File commands. Paths are chosen in native dialogs and kept on the Rust side:
//! the WebView never sends a path, so it cannot read or write arbitrary files.

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, MutexGuard};

use tauri::{AppHandle, State, WebviewWindow, Wry};
use tauri_plugin_dialog::{
    DialogExt, FileDialogBuilder, FilePath, MessageDialogButtons, MessageDialogKind,
    MessageDialogResult,
};

use crate::{document, markdown, strings};

pub const CLOSE_REQUESTED_EVENT: &str = "close-requested";

#[derive(Default)]
pub struct DocumentState {
    path: Option<PathBuf>,
    modified: bool,
}

pub type SharedState = Mutex<DocumentState>;

pub fn is_modified(state: &SharedState) -> bool {
    lock(state).modified
}

fn lock(state: &SharedState) -> MutexGuard<'_, DocumentState> {
    state
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn update(window: &WebviewWindow, state: &SharedState, change: impl FnOnce(&mut DocumentState)) {
    let title = {
        let mut doc = lock(state);
        change(&mut doc);
        document::window_title(&document::display_name(doc.path.as_deref()), doc.modified)
    };
    let _ = window.set_title(&title);
}

/// Updates the window title, e.g. after a language change.
pub fn refresh_title(window: &WebviewWindow, state: &SharedState) {
    update(window, state, |_| {});
}

fn file_dialog(window: &WebviewWindow, current: Option<&Path>) -> FileDialogBuilder<Wry> {
    let dialog = window.dialog().file().set_parent(window);
    match current.and_then(Path::parent) {
        Some(directory) => dialog.set_directory(directory),
        None => dialog,
    }
}

fn into_path(picked: Option<FilePath>) -> Result<Option<PathBuf>, String> {
    picked
        .map(|path| path.into_path().map_err(|error| error.to_string()))
        .transpose()
}

fn show_error(window: &WebviewWindow, message: String) -> String {
    window
        .dialog()
        .message(message.clone())
        .title(strings::APP_NAME)
        .kind(MessageDialogKind::Error)
        .parent(window)
        .blocking_show();
    message
}

fn write_and_record(
    window: &WebviewWindow,
    state: &SharedState,
    path: PathBuf,
    content: &str,
) -> Result<(), String> {
    fs::write(&path, content)
        .map_err(|error| show_error(window, strings::current().save_failed(&path, &error)))?;
    update(window, state, |doc| {
        doc.path = Some(path);
        doc.modified = false;
    });
    Ok(())
}

fn save_as(window: &WebviewWindow, state: &SharedState, content: &str) -> Result<bool, String> {
    let current = lock(state).path.clone();
    let file_name = current.as_deref().and_then(Path::file_name).map_or_else(
        || document::default_file_name(None, "md"),
        |name| name.to_string_lossy().into_owned(),
    );
    let picked = file_dialog(window, current.as_deref())
        .set_title(strings::current().save_as_title)
        .set_file_name(file_name)
        .add_filter(strings::MARKDOWN_FILTER, document::MARKDOWN_EXTENSIONS)
        .blocking_save_file();
    let Some(path) = into_path(picked)? else {
        return Ok(false);
    };
    write_and_record(
        window,
        state,
        document::resolve_save_path(path, "md"),
        content,
    )?;
    Ok(true)
}

#[tauri::command]
pub fn new_document(window: WebviewWindow, state: State<'_, SharedState>) {
    update(&window, &state, |doc| *doc = DocumentState::default());
}

#[tauri::command]
pub fn set_modified(window: WebviewWindow, state: State<'_, SharedState>, modified: bool) {
    update(&window, &state, |doc| doc.modified = modified);
}

/// Returns the content of the chosen file, or `None` if the dialog was cancelled.
#[tauri::command]
pub async fn open_document(
    window: WebviewWindow,
    state: State<'_, SharedState>,
) -> Result<Option<String>, String> {
    let current = lock(&state).path.clone();
    let picked = file_dialog(&window, current.as_deref())
        .set_title(strings::current().open_title)
        .add_filter(strings::MARKDOWN_FILTER, document::MARKDOWN_EXTENSIONS)
        .add_filter(strings::current().all_files_filter, &["*"])
        .blocking_pick_file();
    let Some(path) = into_path(picked)? else {
        return Ok(None);
    };
    let content = fs::read_to_string(&path)
        .map_err(|error| show_error(&window, strings::current().open_failed(&path, &error)))?;
    update(&window, &state, |doc| {
        doc.path = Some(path);
        doc.modified = false;
    });
    Ok(Some(content))
}

/// Returns `false` if the user cancelled the "Save As" dialog of a new document.
#[tauri::command]
pub async fn save_document(
    window: WebviewWindow,
    state: State<'_, SharedState>,
    content: String,
) -> Result<bool, String> {
    let current = lock(&state).path.clone();
    match current {
        Some(path) => write_and_record(&window, &state, path, &content).map(|()| true),
        None => save_as(&window, &state, &content),
    }
}

#[tauri::command]
pub async fn save_document_as(
    window: WebviewWindow,
    state: State<'_, SharedState>,
    content: String,
) -> Result<bool, String> {
    save_as(&window, &state, &content)
}

#[tauri::command]
pub async fn export_html(
    window: WebviewWindow,
    state: State<'_, SharedState>,
    content: String,
) -> Result<bool, String> {
    let current = lock(&state).path.clone();
    let picked = file_dialog(&window, current.as_deref())
        .set_title(strings::current().export_html_title)
        .set_file_name(document::default_file_name(current.as_deref(), "html"))
        .add_filter(strings::HTML_FILTER, &["html", "htm"])
        .blocking_save_file();
    let Some(path) = into_path(picked)? else {
        return Ok(false);
    };
    let path = document::resolve_save_path(path, "html");
    let html = document::html_document(
        &document::title(current.as_deref()),
        &markdown::render(&content),
    );
    fs::write(&path, html)
        .map_err(|error| show_error(&window, strings::current().export_failed(&path, &error)))?;
    Ok(true)
}

/// Asks what to do with unsaved changes: `"save"`, `"discard"` or `"cancel"`.
#[tauri::command]
pub async fn confirm_discard(
    window: WebviewWindow,
    state: State<'_, SharedState>,
) -> Result<&'static str, String> {
    let name = document::display_name(lock(&state).path.as_deref());
    let result = window
        .dialog()
        .message(strings::current().confirm_discard(&name))
        .title(strings::APP_NAME)
        .kind(MessageDialogKind::Warning)
        .parent(&window)
        .buttons(MessageDialogButtons::YesNoCancelCustom(
            strings::current().save.into(),
            strings::current().dont_save.into(),
            strings::current().cancel.into(),
        ))
        .blocking_show_with_result();
    Ok(match result {
        MessageDialogResult::Yes => "save",
        MessageDialogResult::No => "discard",
        MessageDialogResult::Custom(label) if label == strings::current().save => "save",
        MessageDialogResult::Custom(label) if label == strings::current().dont_save => "discard",
        _ => "cancel",
    })
}

#[tauri::command]
pub fn quit(app: AppHandle) {
    app.exit(0);
}
