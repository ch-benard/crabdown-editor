mod markdown;

#[tauri::command]
fn render_markdown(source: &str) -> String {
    markdown::render(source)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![render_markdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
