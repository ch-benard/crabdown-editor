//! User-facing texts of the native menu and dialogs, in English, French and Spanish.

use std::io;
use std::path::Path;
use std::sync::atomic::{AtomicU8, Ordering};

use serde::Deserialize;

pub const APP_NAME: &str = "Crabdown Editor";
pub const MARKDOWN_FILTER: &str = "Markdown";
pub const HTML_FILTER: &str = "HTML";

#[derive(Clone, Copy, Debug, Default, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Language {
    #[default]
    En,
    Fr,
    Es,
}

static CURRENT: AtomicU8 = AtomicU8::new(Language::En as u8);

pub fn set_language(language: Language) {
    CURRENT.store(language as u8, Ordering::Relaxed);
}

/// Texts of the language chosen in the preferences.
pub fn current() -> &'static Texts {
    texts(match CURRENT.load(Ordering::Relaxed) {
        1 => Language::Fr,
        2 => Language::Es,
        _ => Language::En,
    })
}

pub fn texts(language: Language) -> &'static Texts {
    match language {
        Language::En => &EN,
        Language::Fr => &FR,
        Language::Es => &ES,
    }
}

pub struct Texts {
    pub untitled: &'static str,
    pub all_files_filter: &'static str,
    pub open_title: &'static str,
    pub save_as_title: &'static str,
    pub export_html_title: &'static str,
    pub save: &'static str,
    pub dont_save: &'static str,
    pub cancel: &'static str,
    /// Templates with `{name}`, `{path}` and `{error}` placeholders.
    discard_message: &'static str,
    open_error: &'static str,
    save_error: &'static str,
    export_error: &'static str,
    pub menu: MenuTexts,
}

pub struct MenuTexts {
    pub file: &'static str,
    pub new: &'static str,
    pub open: &'static str,
    pub save: &'static str,
    pub save_as: &'static str,
    pub export_html: &'static str,
    pub print: &'static str,
    pub quit: &'static str,
    pub edit: &'static str,
    pub undo: &'static str,
    pub redo: &'static str,
    pub find: &'static str,
    pub preferences: &'static str,
    pub view: &'static str,
    pub show_toolbar: &'static str,
    pub show_editor: &'static str,
    pub show_preview: &'static str,
    pub theme: &'static str,
    pub theme_system: &'static str,
    pub theme_light: &'static str,
    pub theme_dark: &'static str,
    pub cycle_theme: &'static str,
}

impl Texts {
    pub fn confirm_discard(&self, name: &str) -> String {
        self.discard_message.replace("{name}", name)
    }

    pub fn open_failed(&self, path: &Path, error: &io::Error) -> String {
        file_error(self.open_error, path, error)
    }

    pub fn save_failed(&self, path: &Path, error: &io::Error) -> String {
        file_error(self.save_error, path, error)
    }

    pub fn export_failed(&self, path: &Path, error: &io::Error) -> String {
        file_error(self.export_error, path, error)
    }
}

fn file_error(template: &str, path: &Path, error: &io::Error) -> String {
    template
        .replace("{path}", &path.display().to_string())
        .replace("{error}", &error.to_string())
}

static EN: Texts = Texts {
    untitled: "Untitled",
    all_files_filter: "All files",
    open_title: "Open",
    save_as_title: "Save As",
    export_html_title: "Export as HTML",
    save: "Save",
    dont_save: "Don't Save",
    cancel: "Cancel",
    discard_message: "Do you want to save the changes to {name}?\n\nYour changes will be lost if you don't save them.",
    open_error: "Could not open {path}:\n{error}",
    save_error: "Could not save {path}:\n{error}",
    export_error: "Could not export {path}:\n{error}",
    menu: MenuTexts {
        file: "File",
        new: "New",
        open: "Open…",
        save: "Save",
        save_as: "Save As…",
        export_html: "Export as HTML…",
        print: "Print / Export as PDF…",
        quit: "Quit",
        edit: "Edit",
        undo: "Undo",
        redo: "Redo",
        find: "Find…",
        preferences: "Preferences…",
        view: "View",
        show_toolbar: "Show Toolbar",
        show_editor: "Show Editor",
        show_preview: "Show Preview",
        theme: "Theme",
        theme_system: "System",
        theme_light: "Light",
        theme_dark: "Dark",
        cycle_theme: "Cycle Theme",
    },
};

static FR: Texts = Texts {
    untitled: "Sans titre",
    all_files_filter: "Tous les fichiers",
    open_title: "Ouvrir",
    save_as_title: "Enregistrer sous",
    export_html_title: "Exporter en HTML",
    save: "Enregistrer",
    dont_save: "Ne pas enregistrer",
    cancel: "Annuler",
    discard_message: "Voulez-vous enregistrer les modifications apportées à {name} ?\n\nVos modifications seront perdues si vous ne les enregistrez pas.",
    open_error: "Impossible d'ouvrir {path} :\n{error}",
    save_error: "Impossible d'enregistrer {path} :\n{error}",
    export_error: "Impossible d'exporter {path} :\n{error}",
    menu: MenuTexts {
        file: "Fichier",
        new: "Nouveau",
        open: "Ouvrir…",
        save: "Enregistrer",
        save_as: "Enregistrer sous…",
        export_html: "Exporter en HTML…",
        print: "Imprimer / Exporter en PDF…",
        quit: "Quitter",
        edit: "Édition",
        undo: "Annuler",
        redo: "Rétablir",
        find: "Rechercher…",
        preferences: "Préférences…",
        view: "Affichage",
        show_toolbar: "Afficher la barre d'outils",
        show_editor: "Afficher l'éditeur",
        show_preview: "Afficher l'aperçu",
        theme: "Thème",
        theme_system: "Système",
        theme_light: "Clair",
        theme_dark: "Sombre",
        cycle_theme: "Changer de thème",
    },
};

static ES: Texts = Texts {
    untitled: "Sin título",
    all_files_filter: "Todos los archivos",
    open_title: "Abrir",
    save_as_title: "Guardar como",
    export_html_title: "Exportar como HTML",
    save: "Guardar",
    dont_save: "No guardar",
    cancel: "Cancelar",
    discard_message: "¿Desea guardar los cambios en {name}?\n\nSus cambios se perderán si no los guarda.",
    open_error: "No se pudo abrir {path}:\n{error}",
    save_error: "No se pudo guardar {path}:\n{error}",
    export_error: "No se pudo exportar {path}:\n{error}",
    menu: MenuTexts {
        file: "Archivo",
        new: "Nuevo",
        open: "Abrir…",
        save: "Guardar",
        save_as: "Guardar como…",
        export_html: "Exportar como HTML…",
        print: "Imprimir / Exportar como PDF…",
        quit: "Salir",
        edit: "Editar",
        undo: "Deshacer",
        redo: "Rehacer",
        find: "Buscar…",
        preferences: "Preferencias…",
        view: "Ver",
        show_toolbar: "Mostrar barra de herramientas",
        show_editor: "Mostrar editor",
        show_preview: "Mostrar vista previa",
        theme: "Tema",
        theme_system: "Sistema",
        theme_light: "Claro",
        theme_dark: "Oscuro",
        cycle_theme: "Cambiar tema",
    },
};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn languages_parse_from_the_frontend_codes() {
        let parse = |s: &str| serde_json::from_str::<Language>(s).unwrap();
        assert_eq!(parse("\"en\""), Language::En);
        assert_eq!(parse("\"fr\""), Language::Fr);
        assert_eq!(parse("\"es\""), Language::Es);
    }

    #[test]
    fn templates_are_filled_in_every_language() {
        let error = io::Error::other("denied");
        for language in [Language::En, Language::Fr, Language::Es] {
            let t = texts(language);
            assert!(t.confirm_discard("a.md").contains("a.md"));
            let message = t.save_failed(Path::new("/x/a.md"), &error);
            assert!(message.contains("/x/a.md") && message.contains("denied"));
        }
    }
}
