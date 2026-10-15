mod document;
mod files;
mod markdown;
mod menu;
mod strings;
mod theme;

use std::sync::Mutex;

use tauri::{Emitter, Manager, WindowEvent};

#[tauri::command]
fn render_markdown(source: &str) -> String {
    markdown::render(source)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(files::DocumentState::default()))
        .menu(menu::build)
        .on_menu_event(menu::handle)
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event
                && files::is_modified(&window.state::<files::SharedState>())
            {
                api.prevent_close();
                let _ = window.emit(files::CLOSE_REQUESTED_EVENT, ());
            }
        })
        .invoke_handler(tauri::generate_handler![
            render_markdown,
            files::new_document,
            files::set_modified,
            files::open_document,
            files::save_document,
            files::save_document_as,
            files::export_html,
            files::confirm_discard,
            files::quit,
            theme::set_theme,
            theme::current_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
