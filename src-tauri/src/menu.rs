use tauri::menu::{
    CheckMenuItemBuilder, Menu, MenuBuilder, MenuEvent, MenuItemBuilder, SubmenuBuilder,
};
use tauri::{AppHandle, Emitter, Manager, Runtime};

use crate::strings::menu as label;

/// Event sent to the frontend with the id of the activated menu item.
pub const EVENT: &str = "menu";
const PRINT: &str = "print";

pub fn build<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let item = |id: &str, text: &str, accelerator: &str| {
        MenuItemBuilder::with_id(id, text)
            .accelerator(accelerator)
            .build(app)
    };

    let file = SubmenuBuilder::new(app, label::FILE)
        .item(&item("new", label::NEW, "CmdOrCtrl+N")?)
        .item(&item("open", label::OPEN, "CmdOrCtrl+O")?)
        .separator()
        .item(&item("save", label::SAVE, "CmdOrCtrl+S")?)
        .item(&item("save_as", label::SAVE_AS, "CmdOrCtrl+Shift+S")?)
        .separator()
        .item(&item("export_html", label::EXPORT_HTML, "CmdOrCtrl+Alt+E")?)
        .item(&item(PRINT, label::PRINT, "CmdOrCtrl+P")?)
        .separator()
        .item(&item("quit", label::QUIT, "CmdOrCtrl+Q")?)
        .build()?;

    let edit = SubmenuBuilder::new(app, label::EDIT)
        .item(&item("undo", label::UNDO, "CmdOrCtrl+Z")?)
        .item(&item("redo", label::REDO, "CmdOrCtrl+Shift+Z")?)
        .separator()
        .item(&item("find", label::FIND, "CmdOrCtrl+F")?)
        .build()?;

    let view = SubmenuBuilder::new(app, label::VIEW)
        .item(
            &CheckMenuItemBuilder::with_id("toggle_preview", label::SHOW_PREVIEW)
                .checked(true)
                .accelerator("CmdOrCtrl+Backslash")
                .build(app)?,
        )
        .build()?;

    MenuBuilder::new(app).items(&[&file, &edit, &view]).build()
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
