# Crabdown Editor

A desktop Markdown editor built with [Tauri v2](https://tauri.app/) (Rust backend) and TypeScript + Vite (frontend).

Specification (in French): [`docs/CAHIER_DES_CHARGES.md`](docs/CAHIER_DES_CHARGES.md).

## Prerequisites

- **Rust ≥ 1.90** via [rustup](https://rustup.rs/) (`rustup update stable`)
- **Node.js 24 LTS** and npm
- Tauri system libraries (see the [official prerequisites](https://tauri.app/start/prerequisites/)):

**Arch / Garuda**

```sh
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module libappindicator-gtk3 librsvg xdotool
```

**Debian / Ubuntu**

```sh
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

## Development

```sh
npm install
npm run tauri dev      # run the app with hot reload
npm run typecheck      # TypeScript type check
npm run tauri build    # release build and bundles
```

Standalone builds and installers for Linux and Windows: see [`docs/BUILDING.md`](docs/BUILDING.md).

Rust checks (from `src-tauri/`):

```sh
cargo fmt --all
cargo clippy --all-targets -- -D warnings
cargo test
```

## Git workflow

- `main`: released versions. `develop`: integration branch.
- Work on a feature branch and open pull requests against **`develop`**.
- CI (GitHub Actions) runs the frontend build, `cargo fmt`, `cargo clippy` and `cargo test` on every pull request.

## Recommended IDE setup

[VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
