use serde::Deserialize;
use tauri::menu::MenuItemKind;
use tauri::{AppHandle, Theme, WebviewWindow};

/// Ids of the View menu and its Theme submenu, which holds one item per preference.
pub const VIEW_MENU: &str = "view";
pub const SUBMENU: &str = "theme";
pub const SYSTEM: &str = "theme_system";
pub const LIGHT: &str = "theme_light";
pub const DARK: &str = "theme_dark";
pub const CYCLE: &str = "cycle_theme";

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Preference {
    System,
    Light,
    Dark,
}

impl Preference {
    fn window_theme(self) -> Option<Theme> {
        match self {
            Self::System => None,
            Self::Light => Some(Theme::Light),
            Self::Dark => Some(Theme::Dark),
        }
    }

    fn menu_id(self) -> &'static str {
        match self {
            Self::System => SYSTEM,
            Self::Light => LIGHT,
            Self::Dark => DARK,
        }
    }
}

fn name(theme: Theme) -> &'static str {
    match theme {
        Theme::Dark => "dark",
        _ => "light",
    }
}

/// Applies the preference to the native window and the menu, and returns the
/// effective theme ("light" or "dark") the frontend should display.
#[tauri::command]
pub fn set_theme(
    app: AppHandle,
    window: WebviewWindow,
    theme: Preference,
) -> Result<&'static str, String> {
    window
        .set_theme(theme.window_theme())
        .map_err(|e| e.to_string())?;
    check_menu_item(&app, theme);
    let effective = window.theme().map_err(|e| e.to_string())?;
    Ok(name(effective))
}

/// The theme currently shown by the window: the explicit choice if any,
/// otherwise the OS theme (read live from the XDG portal on Linux).
#[tauri::command]
pub fn current_theme(window: WebviewWindow) -> Result<&'static str, String> {
    let theme = window.theme().map_err(|e| e.to_string())?;
    Ok(name(theme))
}

fn check_menu_item(app: &AppHandle, theme: Preference) {
    // `Menu::get` only searches direct children: walk down View → Theme.
    let Some(MenuItemKind::Submenu(view)) = app.menu().and_then(|menu| menu.get(VIEW_MENU)) else {
        return;
    };
    let Some(MenuItemKind::Submenu(submenu)) = view.get(SUBMENU) else {
        return;
    };
    for id in [SYSTEM, LIGHT, DARK] {
        if let Some(MenuItemKind::Check(item)) = submenu.get(id) {
            let _ = item.set_checked(id == theme.menu_id());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn preferences_deserialize_from_lowercase() {
        let parse = |s: &str| serde_json::from_str::<Preference>(s).unwrap();
        assert_eq!(parse("\"system\""), Preference::System);
        assert_eq!(parse("\"light\""), Preference::Light);
        assert_eq!(parse("\"dark\""), Preference::Dark);
    }

    #[test]
    fn system_preference_follows_the_os() {
        assert_eq!(Preference::System.window_theme(), None);
        assert_eq!(Preference::Dark.window_theme(), Some(Theme::Dark));
    }
}
