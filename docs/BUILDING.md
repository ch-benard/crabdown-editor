# Building a standalone release

`npm run tauri build` compiles the frontend and the Rust backend in release mode, then creates the installers ("bundles") for the current platform. Cross-compiling is not supported: build Linux packages on Linux and Windows packages on Windows.

The first build takes a few minutes; later builds are incremental.

## Linux (Arch / Garuda)

### Prerequisites

```sh
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module libappindicator-gtk3 librsvg xdotool
rustup update stable        # Rust >= 1.90
node --version              # Node.js 24 LTS
```

### Build

From the repository root:

```sh
npm install
npm run tauri build -- --bundles appimage   # binary + AppImage only
```

Without `--bundles`, Tauri also builds `.deb` and `.rpm` packages, which are of no use on Arch. Use `npm run tauri build -- --no-bundle` to build the binary alone.

On the first AppImage build, the Tauri CLI downloads its own packaging tools (`linuxdeploy`, `AppRun`) into its cache. No system package is installed.

### Output

| File (in `src-tauri/target/release/`) | Description |
|---|---|
| `crabdown-editor` | Standalone executable (~9 MB). Uses the system WebKitGTK, so it runs on any machine with `webkit2gtk-4.1` installed. |
| `bundle/appimage/crabdown-editor_<version>_amd64.AppImage` | Self-contained (~80 MB): embeds WebKitGTK, runs on most distributions without dependencies. |

```sh
./src-tauri/target/release/crabdown-editor
./src-tauri/target/release/bundle/appimage/crabdown-editor_0.1.0_amd64.AppImage
```

### Troubleshooting

- **AppImage step fails with a `strip` error** (`failed to run linuxdeploy`): the `strip` bundled with linuxdeploy can be too old for the libraries of a rolling-release distribution. Rerun with `NO_STRIP=true npm run tauri build -- --bundles appimage`.
- **`failed to bundle project: timeout: global`** while downloading `AppRun` or `linuxdeploy`: the download from github.com timed out, often because IPv6 is advertised but not working. Make the system prefer IPv4 by adding `precedence ::ffff:0:0/96  100` to `/etc/gai.conf`, then rerun the build. The tools are cached in `~/.cache/tauri/`, so this download happens only once. When the bundling fails, any AppImage already in `bundle/appimage/` comes from a previous build.
- **Blank window** (Nvidia GPU and/or Wayland): start the app with `WEBKIT_DISABLE_DMABUF_RENDERER=1`.

## Linux (Debian / Ubuntu)

```sh
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
npm install
npm run tauri build
```

Produces the executable, a `.deb` (`bundle/deb/`), an `.rpm` (`bundle/rpm/`) and an AppImage (`bundle/appimage/`). Install the `.deb` with `sudo apt install ./src-tauri/target/release/bundle/deb/crabdown-editor_0.1.0_amd64.deb`.

## Windows 10 / 11

### Prerequisites

1. **Microsoft C++ Build Tools**: install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and select the **Desktop development with C++** workload.
2. **WebView2**: preinstalled on Windows 10 (version 1803 and later) and Windows 11. Otherwise, install the [Evergreen Bootstrapper](https://developer.microsoft.com/microsoft-edge/webview2/).
3. **Rust** via [rustup-init.exe](https://rustup.rs/), with the MSVC toolchain:
   ```powershell
   rustup default stable-msvc
   rustup update stable
   ```
4. **Node.js 24 LTS**, for example with `winget install OpenJS.NodeJS.LTS`.
5. To build the `.msi` installer on recent Windows 11 versions, the optional **VBSCRIPT** feature must be enabled (*Settings → System → Optional features*).

Open a new terminal after installing, so that `cargo` and `npm` are on the `PATH`.

### Build

In PowerShell, from the repository root:

```powershell
npm install
npm run tauri build
```

On the first build, the Tauri CLI downloads WiX (for `.msi`) and NSIS (for `-setup.exe`) into its cache.

### Output

| File (in `src-tauri\target\release\`) | Description |
|---|---|
| `crabdown-editor.exe` | Standalone executable, no installation needed (requires WebView2). |
| `bundle\msi\crabdown-editor_<version>_x64_en-US.msi` | MSI installer. |
| `bundle\nsis\crabdown-editor_<version>_x64-setup.exe` | NSIS installer. |

The executables are not code-signed: Windows SmartScreen shows a warning on first launch (*More info → Run anyway*).

## macOS

Not documented yet.
