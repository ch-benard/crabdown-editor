# Crabdown Editor — Cahier des charges

Éditeur Markdown de bureau construit avec **Tauri v2** (Rust) et **TypeScript + Vite**.
Plateforme cible prioritaire : Linux (Arch / Garuda, WebKitGTK).

Références utilisées pour l'inventaire de la syntaxe :

- [CommonMark Spec 0.31.2](https://spec.commonmark.org/0.31.2/) — spécification de référence de Markdown ;
- [GitHub Flavored Markdown Spec 0.29-gfm](https://github.github.com/gfm/) — sur-ensemble de CommonMark (tableaux, tâches, barré, autoliens étendus) ;
- [Markdown: Syntax — John Gruber](https://daringfireball.net/projects/markdown/syntax) — syntaxe d'origine ;
- [GitHub Docs — Basic writing and formatting syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) et [Working with advanced formatting](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting) — extensions de fait (notes de bas de page, alertes, maths, diagrammes).

---

## 1. Fonctionnalités

| # | Fonctionnalité | Critères d'acceptation |
|---|---|---|
| F1 | Ouvrir / enregistrer un fichier `.md` | Dialogues natifs (ouvrir, enregistrer, enregistrer sous) filtrés sur `.md`, `.markdown`, `.txt`. Indicateur « modifié » dans le titre de la fenêtre. Confirmation avant de fermer ou d'ouvrir un autre fichier si des modifications ne sont pas enregistrées. Encodage UTF-8, fins de ligne préservées. |
| F2 | Édition avec aperçu en direct côte à côte | Deux panneaux redimensionnables (séparateur déplaçable). Aperçu mis à jour à la frappe (anti-rebond ~150 ms). Défilement synchronisé éditeur → aperçu. Possibilité de masquer l'aperçu ou l'éditeur. Images locales relatives au fichier affichées dans l'aperçu. |
| F3 | Coloration syntaxique du Markdown dans l'éditeur | Titres, emphase, liens, code, citations, listes, tableaux… colorés. Coloration du code dans les blocs clôturés selon le langage déclaré (`rust`, `ts`, …), dans l'éditeur **et** dans l'aperçu. |
| F4 | Export HTML et PDF | HTML : fichier autonome (CSS intégré, thème clair ou sombre au choix). PDF : mise en page dédiée à l'impression (marges, sauts de page avant les titres de niveau 1 en option, pas de coupure dans les blocs de code ni les tableaux si possible). |
| F5 | Arborescence de fichiers | Ouvrir un dossier ; panneau latéral repliable listant récursivement dossiers et fichiers Markdown (filtre activable). Clic = ouverture. Rafraîchissement automatique quand le disque change. Actions : nouveau fichier, nouveau dossier, renommer, supprimer (avec confirmation). |
| F6 | Thème clair / sombre / selon l'OS | Trois modes : *Clair*, *Sombre*, *Système* (suit le thème de l'OS en temps réel). Choix mémorisé entre deux sessions. Le thème s'applique à l'éditeur, à l'aperçu et à la coloration du code. |
| F7 | Barre d'outils | Création des éléments (listes, tableaux, etc.) et formatage (gras, italique, code…), voir §3. Chaque bouton a une infobulle avec son raccourci. |
| F8 | Raccourcis clavier classiques | Voir §4. Les actions de formatage sont des **bascules** : appliquer sur une sélection déjà formatée retire le formatage. Sans sélection, le formatage s'applique au mot sous le curseur, ou insère les marqueurs avec le curseur entre les deux. |

Fonctionnalités implicites retenues : annuler / rétablir, rechercher / remplacer, compteur de mots et de caractères, position du curseur dans la barre d'état, retour à la ligne automatique (activable).

---

## 2. Inventaire exhaustif de la syntaxe Markdown

Légende de la colonne **Support** :
**Base** = CommonMark (obligatoire) · **GFM** = extension GitHub Flavored Markdown spécifiée (obligatoire) ·
**GH** = extension GitHub hors spécification (proposée, activée par défaut) · **Opt.** = extension non standard (proposée, désactivable dans les préférences).

### 2.1 Éléments de bloc

| Élément | Syntaxe | Spéc. | Support |
|---|---|---|---|
| Paragraphe | lignes de texte séparées par une ligne vide | CM §4.8 | Base |
| Titre ATX niveaux 1 à 6 | `# Titre` … `###### Titre` (dièses fermants optionnels) | CM §4.2 | Base |
| Titre Setext niveaux 1 et 2 | ligne soulignée par `===` ou `---` | CM §4.3 | Base (lecture ; la barre d'outils produit de l'ATX) |
| Séparateur horizontal | `---`, `***` ou `___` (3 caractères ou plus) | CM §4.1 | Base |
| Citation | `> texte` (imbriquable : `>> …`) | CM §5.1 | Base |
| Liste à puces | `-`, `*` ou `+` suivi d'un espace | CM §5.2–5.3 | Base |
| Liste numérotée | `1.` ou `1)` ; le premier numéro fixe le départ (`3.` commence à 3) | CM §5.2–5.3 | Base |
| Listes imbriquées, éléments multi-paragraphes | indentation alignée sur le contenu de l'élément parent | CM §5.2 | Base |
| Listes serrées / aérées | sans / avec lignes vides entre éléments | CM §5.3 | Base |
| Liste de tâches | `- [ ] à faire` / `- [x] fait` | GFM §5.3 | GFM — cases cliquables dans l'aperçu (met à jour la source) |
| Bloc de code indenté | 4 espaces ou une tabulation | CM §4.4 | Base |
| Bloc de code clôturé | ```` ``` ```` ou `~~~` + chaîne d'information (langage) | CM §4.5 | Base — coloration selon le langage |
| Tableau | lignes `\| a \| b \|` + ligne de délimitation `\|---\|` | GFM §4.10 | GFM |
| Alignement des colonnes | `:---` gauche, `:---:` centré, `---:` droite | GFM §4.10 | GFM |
| Bloc HTML | balises HTML brutes (`<div>`, `<details>`, commentaires…) | CM §4.6 | Base — assaini dans l'aperçu |
| Définition de référence de lien | `[ref]: https://url "Titre"` | CM §4.7 | Base |
| Lignes vides | séparation des blocs | CM §4.9 | Base |
| Alertes | `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]` | GitHub Docs | GH |
| Définition de note de bas de page | `[^1]: Texte de la note` | GitHub Docs | GH |
| Bloc mathématique | `$$ … $$` ou bloc ```` ```math ```` | GitHub Docs | GH (rendu KaTeX) |
| Diagramme | bloc ```` ```mermaid ```` | GitHub Docs | GH (rendu Mermaid) |
| Section repliable | `<details><summary>Titre</summary> … </details>` | GitHub Docs (HTML) | Base (HTML) — bouton dédié |
| En-tête de métadonnées (front matter) | bloc YAML `---` … `---` en tout début de fichier | — | Opt. (masqué ou affiché en tableau dans l'aperçu) |
| Liste de définitions | `Terme` puis `: Définition` | — (PHP Markdown Extra) | Opt. |
| Table des matières | marqueur `[TOC]` | — | Opt. |

### 2.2 Éléments en ligne

| Élément | Syntaxe | Spéc. | Support |
|---|---|---|---|
| Italique | `*texte*` ou `_texte_` | CM §6.2 | Base |
| Gras | `**texte**` ou `__texte__` | CM §6.2 | Base |
| Gras + italique | `***texte***` ou combinaisons imbriquées | CM §6.2 | Base |
| Barré | `~~texte~~` (ou `~texte~`) | GFM §6.5 | GFM |
| Code en ligne | `` `code` `` ; ``` `` code avec ` `` ``` pour inclure des accents graves | CM §6.1 | Base |
| Lien en ligne | `[texte](https://url "Titre facultatif")` | CM §6.3 | Base |
| Lien par référence (complet, réduit, raccourci) | `[texte][ref]`, `[ref][]`, `[ref]` | CM §6.3 | Base |
| Lien vers une ancre de section | `[texte](#titre-de-section)` | GitHub Docs | GH (identifiants générés sur les titres) |
| Lien relatif vers un autre fichier | `[texte](autre.md)` | GitHub Docs | Base — clic dans l'aperçu = ouverture dans l'éditeur |
| Image en ligne / par référence | `![alt](chemin "Titre")`, `![alt][ref]` | CM §6.4 | Base |
| Autolien | `<https://url>`, `<adresse@mail.fr>` | CM §6.5 | Base |
| Autolien étendu | `www.exemple.fr`, `https://…`, adresse e-mail nue | GFM §6.9 | GFM |
| HTML en ligne | `<span>`, `<kbd>`, `<abbr>`, `<br>`, … | CM §6.6 | Base — assaini |
| HTML interdit | `<script>`, `<iframe>`, `<style>`, `<textarea>`, `<title>`, `<xmp>`, `<noembed>`, `<noframes>`, `<plaintext>` neutralisés | GFM §6.11 | GFM |
| Saut de ligne forcé | deux espaces en fin de ligne, `\` en fin de ligne ou `<br>` | CM §6.7 | Base |
| Saut de ligne souple | simple retour à la ligne (rendu comme un espace) | CM §6.8 | Base |
| Échappement | `\` devant `` \ ` * _ { } [ ] ( ) # + - . ! \| `` et toute ponctuation ASCII | CM §2.4 | Base |
| Entités HTML | `&copy;`, `&#169;`, `&#xA9;` | CM §2.5 | Base |
| Appel de note de bas de page | `texte[^1]` | GitHub Docs | GH |
| Mathématiques en ligne | `$x^2$` ou `` $`x^2`$ `` | GitHub Docs | GH (KaTeX) |
| Indice / exposant | `<sub>2</sub>` / `<sup>2</sup>` | GitHub Docs (HTML) | Base (HTML) |
| Souligné | `<ins>texte</ins>` | GitHub Docs (HTML) | Base (HTML) |
| Touche clavier | `<kbd>Ctrl</kbd>` | HTML | Base (HTML) |
| Commentaire masqué | `<!-- texte -->` | GitHub Docs | Base (HTML) |
| Émoji par code court | `:smile:` | GitHub Docs | GH |
| Surligné | `==texte==` | — | Opt. |
| Indice / exposant abrégés | `H~2~O` / `x^2^` | — | Opt. (conflit possible avec `~barré~` : désactivé par défaut) |

### 2.3 Hors périmètre (spécifique à GitHub, sans objet dans un éditeur local)

Mentions `@utilisateur`, références `#123` et SHA, liens permanents vers du code, envoi de pièces jointes, modèles de couleurs `` `#FF0000` ``, cartes GeoJSON / TopoJSON / STL.

---

## 3. Barre d'outils

Groupes, de gauche à droite (icônes + infobulle « Action (raccourci) ») :

1. **Fichier** : Nouveau · Ouvrir · Ouvrir un dossier · Enregistrer · Exporter (menu : HTML, PDF)
2. **Historique** : Annuler · Rétablir
3. **Titres** : menu déroulant Paragraphe, Titre 1 à 6
4. **Formatage en ligne** : Gras · Italique · Barré · Code en ligne · Souligné · Exposant · Indice · Surligné (si activé) · Effacer le formatage
5. **Listes** : Liste à puces · Liste numérotée · Liste de tâches · Augmenter / diminuer le retrait
6. **Blocs** : Citation · Alerte (menu : Note, Astuce, Important, Avertissement, Attention) · Bloc de code (avec choix du langage) · Séparateur horizontal · Section repliable
7. **Insertion** : Lien · Image (dialogue de fichier natif, chemin relatif au document) · Tableau (sélecteur lignes × colonnes) · Note de bas de page · Formule mathématique (en ligne / bloc) · Diagramme Mermaid · Émoji · Table des matières (si activé)
8. **Tableau** (contextuel, visible quand le curseur est dans un tableau) : insérer / supprimer une ligne ou une colonne · aligner à gauche / au centre / à droite · reformater les colonnes
9. **Affichage** (à droite) : Arborescence · Éditeur seul / Côte à côte / Aperçu seul · Thème (Clair / Sombre / Système)

---

## 4. Raccourcis clavier

Choisis selon les conventions les plus répandues : traitements de texte (Word, Google Docs), GitHub, Typora, VS Code. `Ctrl` sous Linux et Windows, `Cmd` sous macOS.

### Fichier et application

| Action | Raccourci |
|---|---|
| Nouveau | `Ctrl+N` |
| Ouvrir un fichier | `Ctrl+O` |
| Ouvrir un dossier | `Ctrl+Shift+O` |
| Enregistrer | `Ctrl+S` |
| Enregistrer sous | `Ctrl+Shift+S` |
| Fermer le fichier | `Ctrl+W` |
| Exporter en PDF / imprimer | `Ctrl+P` |
| Exporter en HTML | `Ctrl+Alt+E` |
| Quitter | `Ctrl+Q` |

### Édition

| Action | Raccourci |
|---|---|
| Annuler / Rétablir | `Ctrl+Z` / `Ctrl+Shift+Z` ou `Ctrl+Y` |
| Rechercher / Remplacer | `Ctrl+F` / `Ctrl+H` |
| Tout sélectionner | `Ctrl+A` |
| Dupliquer la ligne | `Ctrl+Shift+D` |
| Déplacer la ligne | `Alt+↑` / `Alt+↓` |

### Formatage en ligne

| Action | Raccourci | Origine |
|---|---|---|
| Gras | `Ctrl+B` | universel, GitHub |
| Italique | `Ctrl+I` | universel, GitHub |
| Souligné (`<ins>`) | `Ctrl+U` | traitements de texte |
| Barré | `Alt+Shift+5` | Google Docs, Typora |
| Code en ligne | `Ctrl+E` | GitHub |
| Lien | `Ctrl+K` | universel, GitHub |
| Exposant / indice | `Ctrl+.` / `Ctrl+,` | Google Docs |
| Effacer le formatage | `Ctrl+Espace` | Word |
| Commentaire HTML | `Ctrl+/` | éditeurs de code |

### Blocs et insertion

| Action | Raccourci | Origine |
|---|---|---|
| Titre 1 à 6 | `Ctrl+1` … `Ctrl+6` | Typora |
| Paragraphe (retirer le titre) | `Ctrl+0` | Typora |
| Liste numérotée | `Ctrl+Shift+7` | Google Docs |
| Liste à puces | `Ctrl+Shift+8` | Google Docs |
| Liste de tâches | `Ctrl+Shift+9` | Google Docs |
| Augmenter / diminuer le retrait | `Tab` / `Shift+Tab` dans une liste, `Ctrl+]` / `Ctrl+[` | éditeurs de code |
| Citation | `Ctrl+Shift+Q` | Typora |
| Bloc de code | `Ctrl+Shift+K` | Typora |
| Tableau | `Ctrl+T` | Typora |
| Image | `Ctrl+Alt+I` | — (`Ctrl+Shift+I` est réservé à l'inspecteur web de Tauri) |
| Note de bas de page | `Ctrl+Alt+F` | Word |
| Séparateur horizontal | `Ctrl+Shift+-` | — |

### Affichage

| Action | Raccourci |
|---|---|
| Afficher / masquer l'arborescence | `Ctrl+Shift+E` (VS Code) |
| Afficher / masquer l'aperçu | `Ctrl+\` |
| Changer de thème | `Ctrl+Alt+T` |
| Plein écran | `F11` |
| Zoom + / − / réinitialiser | `Ctrl++` / `Ctrl+-` / `Ctrl+0` dans l'aperçu |

Les raccourcis seront regroupés dans un fichier unique (`keymap.ts`) pour pouvoir les rendre personnalisables plus tard.

---

## 5. Architecture technique proposée

```
┌──────────────────────────── Fenêtre Tauri (WebKitGTK) ─────────────────────────────┐
│  Barre d'outils                                                                    │
│ ┌────────────┐ ┌──────────────────────────┐ ┌───────────────────────────────────┐  │
│ │Arborescence│ │ Éditeur (CodeMirror 6)   │ │ Aperçu (HTML assaini + CSS thème) │  │
│ └────────────┘ └──────────────────────────┘ └───────────────────────────────────┘  │
│  Barre d'état                                                                      │
└───────────────────────────────▲──────────────────────────────▲─────────────────────┘
                  commandes IPC │ (invoke)                      │ événements (fs watch)
┌───────────────────────────────┴──────────────────────────────┴─────────────────────┐
│ Rust : rendu Markdown (comrak) · assainissement (ammonia) · coloration (syntect)   │
│        export HTML · lecture/écriture fichiers · arborescence · surveillance disque │
└────────────────────────────────────────────────────────────────────────────────────┘
```

| Sujet | Choix proposé | Raison / alternative |
|---|---|---|
| Interface | TypeScript sans framework (conservé du modèle) | Interface simple, pas de dépendance lourde. Alternative : Svelte si l'interface se complexifie. |
| Éditeur | **CodeMirror 6** + `@codemirror/lang-markdown` (extensions GFM) + `@codemirror/language-data` | Coloration du Markdown et du code dans les blocs clôturés, raccourcis et thèmes configurables, recherche / remplacement intégrés. |
| Rendu Markdown | **`comrak`** côté Rust (conforme CommonMark + GFM) | Prend en charge nativement tableaux, tâches, barré, autoliens, notes de bas de page, alertes, maths, front matter, listes de définitions, surligné, indice / exposant, émojis. **Un seul moteur** pour l'aperçu et l'export, ce qui garantit un résultat identique. Alternative : `markdown-it` + plugins côté TypeScript (aucun aller-retour IPC, mais deux moteurs différents si l'export se fait en Rust). |
| Sécurité de l'aperçu | `ammonia` (assainissement du HTML) + CSP stricte dans `tauri.conf.json` | Le Markdown autorise le HTML brut ; ouvrir un fichier piégé ne doit pas exécuter de script. |
| Coloration du code dans l'aperçu | `syntect` (Rust, via l'adaptateur comrak), avec un thème clair et un thème sombre | Rendu déterministe, aussi utilisé pour l'export HTML. |
| Maths / diagrammes | KaTeX et Mermaid côté interface, chargés à la demande | Les bibliothèques de référence ; chargées seulement si le document en contient. |
| Fichiers et dialogues | `tauri-plugin-dialog`, `tauri-plugin-fs` (avec la fonction `watch`) | Dialogues natifs ; accès disque limité par les *capabilities* Tauri. |
| Préférences | `tauri-plugin-store` | Mémorise le thème, les dossiers récents, la disposition des panneaux. |
| Thème | Variables CSS + `prefers-color-scheme` + API `getCurrentWindow().theme()` / `onThemeChanged()` | Mode *Système* en temps réel. Point à vérifier : sous Linux, WebKitGTK suit le thème **GTK** ; sous KDE, il faut un thème GTK clair ou sombre cohérent. |
| Export HTML | Rust : rendu comrak + CSS du thème intégré dans un fichier unique | Fichier autonome, partageable. |
| Export PDF | v1 : `window.print()` avec une feuille de style d'impression (dialogue GTK → « Imprimer dans un fichier ») | Aucune dépendance. **Risque à vérifier** : le support de `window.print()` dans WebKitGTK / Tauri sous Linux. Solution de repli : génération en Rust via Chrome sans interface (`headless_chrome`, nécessite Chromium installé) ou via Typst. |
| Images locales | `convertFileSrc` + protocole `asset` limité au dossier ouvert | Affichage des images relatives au document dans l'aperçu. |
| Qualité | `cargo fmt`, `cargo clippy`, `tsc --noEmit`, tests unitaires Rust (rendu, assainissement) et TS (actions de formatage) | Garde-fous pour la suite du projet. |

---

## 6. Dépendances à valider avant installation

Aucune ne sera ajoutée sans validation.

**Rust (`src-tauri/Cargo.toml`)**
- `comrak` (rendu Markdown, avec la fonctionnalité `syntect`)
- `ammonia` (assainissement du HTML)
- `tauri-plugin-dialog`, `tauri-plugin-fs`, `tauri-plugin-store`

**npm (`package.json`)**
- `codemirror`, `@codemirror/lang-markdown`, `@codemirror/language-data`, `@codemirror/theme-one-dark`
- `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`, `@tauri-apps/plugin-store`
- `katex`, `mermaid` (chargés à la demande)
- une bibliothèque d'icônes légère (par ex. `lucide`)

**Système** : rien de plus que les prérequis Tauri déjà installés.

---

## 7. Découpage en lots

| Lot | Contenu | Livrable |
|---|---|---|
| L0 | Socle : projet Tauri poussé sur le dépôt, structure des dossiers, scripts de qualité, CI GitHub Actions (fmt, clippy, tsc, build) | Fenêtre vide qui compile en CI |
| L1 | Éditeur CodeMirror + aperçu côte à côte (comrak + ammonia), séparateur redimensionnable, défilement synchronisé | F2, F3 |
| L2 | Fichiers : nouveau / ouvrir / enregistrer / enregistrer sous, état « modifié », confirmation à la fermeture | F1 |
| L3 | Barre d'outils + raccourcis + actions de formatage en bascule (avec tests) | F7, F8 |
| L4 | Arborescence de fichiers + surveillance du disque | F5 |
| L5 | Thèmes clair / sombre / système, préférences persistantes | F6 |
| L6 | Export HTML et PDF | F4 |
| L7 | Extensions : maths, Mermaid, émojis, alertes, front matter, table des matières, préférences d'activation | §2 « GH » et « Opt. » |

Chaque lot fera l'objet d'une PR séparée.

---

## 8. Questions ouvertes

1. **Moteur de rendu** : `comrak` en Rust (proposé) ou `markdown-it` en TypeScript ?
2. **Extensions « Opt. »** : lesquelles activer par défaut ?
3. **Onglets** : un seul document à la fois (v1 proposée) ou plusieurs onglets ?
4. **Langue de l'interface** : français uniquement, ou français + anglais (i18n) dès le départ ?
5. **Export PDF** : le passage par le dialogue d'impression du système te convient-il pour la v1 ?
