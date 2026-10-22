use tauri::menu::{
    CheckMenuItemBuilder, Menu, MenuBuilder, MenuEvent, MenuItemBuilder, MenuItemKind,
    SubmenuBuilder,
};
use tauri::{AppHandle, Emitter, Manager, Runtime, State, WebviewWindow};

use crate::files::{self, SharedState};
use crate::strings::{self, Language};
use crate::theme;

/// Event sent to the frontend with the id of the activated menu item.
pub const EVENT: &str = "menu";
const PRINT: &str = "print";
const TOGGLE_TOOLBAR: &str = "toggle_toolbar";
const TOGGLE_PREVIEW: &str = "toggle_preview";

pub fn build<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let label = &strings::current().menu;
    let item = |id: &str, text: &str, accelerator: &str| {
        MenuItemBuilder::with_id(id, text)
            .accelerator(accelerator)
            .build(app)
    };

    let file = SubmenuBuilder::new(app, label.file)
        .item(&item("new", label.new, "CmdOrCtrl+N")?)
        .item(&item("open", label.open, "CmdOrCtrl+O")?)
        .separator()
        .item(&item("save", label.save, "CmdOrCtrl+S")?)
        .item(&item("save_as", label.save_as, "CmdOrCtrl+Shift+S")?)
        .separator()
        .item(&item("export_html", label.export_html, "CmdOrCtrl+Alt+E")?)
        .item(&item(PRINT, label.print, "CmdOrCtrl+P")?)
        .separator()
        .item(&item("quit", label.quit, "CmdOrCtrl+Q")?)
        .build()?;

    // Trailing space: prevents macOS from detecting the standard Edit menu and
    // injecting system items (AutoFill, Writing Tools, Dictation, Emoji & Symbols).
    let edit = SubmenuBuilder::new(app, format!("{} ", label.edit))
        .item(&item("undo", label.undo, "CmdOrCtrl+Z")?)
        .item(&item("redo", label.redo, "CmdOrCtrl+Shift+Z")?)
        .separator()
        .item(&item("find", label.find, "CmdOrCtrl+F")?)
        .separator()
        .item(&MenuItemBuilder::with_id("preferences", label.preferences).build(app)?)
        .build()?;

    let theme_item = |id: &str, text: &str| CheckMenuItemBuilder::with_id(id, text).build(app);
    let themes = SubmenuBuilder::with_id(app, theme::SUBMENU, label.theme)
        .item(&theme_item(theme::SYSTEM, label.theme_system)?)
        .item(&theme_item(theme::LIGHT, label.theme_light)?)
        .item(&theme_item(theme::DARK, label.theme_dark)?)
        .separator()
        .item(&item(theme::CYCLE, label.cycle_theme, "CmdOrCtrl+Shift+T")?)
        .build()?;

    let view = SubmenuBuilder::with_id(app, theme::VIEW_MENU, label.view)
        .item(
            &CheckMenuItemBuilder::with_id(TOGGLE_TOOLBAR, label.show_toolbar)
                .checked(true)
                .build(app)?,
        )
        .item(
            &CheckMenuItemBuilder::with_id(TOGGLE_PREVIEW, label.show_preview)
                .checked(true)
                .accelerator("CmdOrCtrl+Backslash")
                .build(app)?,
        )
        .separator()
        .item(&themes)
        .build()?;

    MenuBuilder::new(app).items(&[&file, &edit, &view]).build()
}

/// Keeps View → Show Toolbar / Show Preview in sync with the frontend.
#[tauri::command]
pub fn set_view_checked(app: AppHandle, id: &str, checked: bool) {
    if id != TOGGLE_TOOLBAR && id != TOGGLE_PREVIEW {
        return;
    }
    let Some(MenuItemKind::Submenu(view)) = app.menu().and_then(|menu| menu.get(theme::VIEW_MENU))
    else {
        return;
    };
    if let Some(MenuItemKind::Check(item)) = view.get(id) {
        let _ = item.set_checked(checked);
    }
}

/// Applies the language chosen in the preferences to the menu, dialogs and window title.
/// The frontend restores the check marks afterwards.
#[tauri::command]
pub fn set_language(
    app: AppHandle,
    window: WebviewWindow,
    state: State<'_, SharedState>,
    language: Language,
) -> Result<(), String> {
    strings::set_language(language);
    let menu = build(&app).map_err(|error| error.to_string())?;
    app.set_menu(menu).map_err(|error| error.to_string())?;
    files::refresh_title(&window, &state);
    Ok(())
}

pub fn handle<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
    let id = event.id().as_ref();
    if id == PRINT {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.print();
        }
    } else {
        let _ = app.emit(EVENT, id);
    }
}
