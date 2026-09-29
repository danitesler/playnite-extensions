# Playnite extensions monorepo — agent handoff

## What this repo is

This repository is a reusable **Playnite add-on monorepo** for two kinds of add-ons, both registered in **`src/extensions.json`** and distinguished by **`kind`**:

- **`plugin`** — .NET extensions. Each owns its code, project file, manifests, icon, and release metadata under **`src/<PluginName>/`**.
- **`theme`** — XAML themes. Each is standalone and laid out like a plugin: **`src/<ThemeName>/`** holds its XAML and tokens (`src/`), manifests, icon and licenses (`info/`), and notes (`AGENTS.md`). Each follows its own design system's tokens, shell and components; the only thing themes share is the key vocabulary (Playnite's keys plus **`scripts/data/theme-keys.json`**), so keys mean the same in every theme and ThemeModifier edits reach every control.

## Current extensions

- **Autogrid** (`autogrid`) — GenericPlugin, `net462`, WPF. Extension-specific notes live in **`src/Autogrid/AGENTS.md`**.
- **GameHoverDetails** (`gamehoverdetails`) — GenericPlugin, `net462`, WPF: hover popup with name, short description, and platforms. Notes in **`src/GameHoverDetails/AGENTS.md`**.

## Current themes

- **Shadcn UI Theme** (`shadcnuitheme`) — Desktop theme, theme API 2.9.0 (Playnite 10.45+), shadcn/ui (zinc, dark). Notes in **`src/ShadcnUiTheme/AGENTS.md`**.
- **Chakra UI Theme** (`chakrauitheme`) — Desktop theme, theme API 2.9.0, Chakra UI v3 dark tokens with teal. Notes in **`src/ChakraUiTheme/AGENTS.md`**.
- **Material UI Theme** (`materialuitheme`) — Desktop theme, theme API 2.9.0, MUI's default dark theme. Notes in **`src/MaterialUiTheme/AGENTS.md`**.
- **Primer Theme** (`primertheme`) — Desktop theme, theme API 2.9.0, GitHub Primer dark tokens. Notes in **`src/PrimerTheme/AGENTS.md`**.
- **Fluent 2 Theme** (`fluent2theme`) — Desktop theme, theme API 2.9.0, Microsoft Fluent 2 `webDarkTheme` tokens and a Windows 11 shell. Notes in **`src/Fluent2Theme/AGENTS.md`**.
- **Battle.net Theme** (`battlenettheme`) — Desktop theme, theme API 2.9.0, the Battle.net app's dark look (approximated, not sampled) with a top app bar, game list and game page. Notes in **`src/BattleNetTheme/AGENTS.md`**.

## Repository layout

| Area | Path |
|------|------|
| Extension index | `src/extensions.json` |
| Extension project | `src/<PluginName>/<PluginName>.csproj` |
| Extension source | `src/<PluginName>/src/` |
| Extension manifests | `src/<PluginName>/info/` (incl. `danitesler_<key>.yaml` for PlayniteAddonDatabase PRs) |
| Theme source | `src/<ThemeName>/src/` (XAML at Playnite Default-theme paths, `tokens.css`, `Constants.template.xaml`) |
| Theme manifests | `src/<ThemeName>/info/` (`theme.yaml`, `InstallerManifest.yaml`, `danitesler_<key>.yaml`, `icon.png`, `LICENSE-*.txt`) |
| Playnite theme API snapshot | `scripts/data/playnite-theme-api.json` (loadable file paths + resource keys per Playnite release) |
| Shared theme key vocabulary | `scripts/data/theme-keys.json` (every key a theme may add: type, group, required, role) |
| Build scripts | `scripts/*.ps1` |
| Package artifacts | `artifacts/releases/<key>/` |
| Build artifacts | `artifacts/builds/<key>/` |

## Build and package commands

- Validate one extension: **`.\scripts\validate-extension.ps1 -Extension <key>`**
- Build one extension: **`.\scripts\build-plugin.ps1 -Extension <key>`**
- Package one extension: **`.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller`**
- Scaffold a new extension: **`.\scripts\new-extension.ps1 -Name MyPlugin -Key myplugin -Type GenericPlugin -Author <name>`**
- Build one theme (render + static checks): **`.\scripts\build-theme.ps1 -Extension <key> [-Deploy]`** (`build-plugin.ps1` forwards themes here)
- Scaffold a new theme: **`.\scripts\new-theme.ps1 -Name "My Theme" -Key mytheme [-DesignSystem "My DS"] [-TokensCss <tokens .css>]`**
- Render icons for any add-on: **`.\scripts\render-icons.ps1 -Extension <key>`** (jobs in `src/<Folder>/icons.json`), or ad hoc **`-Pack <pack> -Icons <names> [-Format Png|Geometry|DrawingImage]`**. Packs (Octicons, Lucide, Tabler, Heroicons, Phosphor, Feather, Material Symbols, Fluent) are in `scripts/data/icon-packs.json`; `-UrlTemplate` / `-SvgDir` take any other SVG source. `-ListPacks` shows them.
- Add-on tile icon (`info/icon.png`, the projects-page style): **`.\scripts\render-addon-icon.ps1 -Svg logo.svg -Extension <key>`** (or `python3 scripts/render-addon-icon.py --svg logo.svg --extension <key>`). Flat mark, dark rounded tile, inset outline, bottom glow. Not the menu icons from `render-icons.ps1`.
- Refresh the theme API snapshot for a new Playnite release: **`.\scripts\update-playnite-theme-api.ps1 -PlayniteSource <Playnite checkout> -PlayniteVersion <tag>`**

Validation, packaging, and CI branch on **`kind`**: themes package to **`.pthm`**, have no Directory.Build.props or Module, and are validated by building the theme and checking every XAML file against the API snapshot and the shared key vocabulary.

The package flow is intentionally **package-only**: it creates `.pext` (plugins) or `.pthm` (themes) and `.zip` artifacts and prints the expected GitHub Release tag / `PackageUrl`, but it does not create a GitHub Release.

**GitHub Releases:** ship **each add-on separately**—one GitHub Release per extension (its own tag per **`tagPattern`**, title, notes, and **`.pext`**). Prefer **`{key}-v{version}`** tags (e.g. `autogrid-v1.0.1`, `gamehoverdetails-v1.0.1`); see **`.cursor/rules/playnite-github-release-tags.mdc`**. Do not combine multiple extensions into a single umbrella release. If two extensions would share the same tag (same semver + pattern), use a **distinct** `tagPattern` / version plan so tags stay unique—never attach another extension’s asset to a release meant for a different add-on.

**Version bumps:** change shipped semver (**`extension.yaml`** or **`theme.yaml`**, **`Directory.Build.props`** for plugins, **`InstallerManifest.yaml`** / **`PackageUrl`**) only when explicitly **cutting a release** / **publishing to GitHub**—not for ordinary feature work. Before editing versions: state current version, suggest next semver, ask for the target string. See **`.cursor/rules/playnite-extension-versioning.mdc`** and skill **`playnite-extension-release`**.

## Cursor rules (project)

Under **`.cursor/rules/`** (apply when matching files are in context):

- **`playnite-extensions.mdc`** — Playnite .NET / WPF / `extension.yaml` / settings / threading / reflection cautions.
- **`playnite-settings-ui.mdc`** — Addon settings use Playnite stock controls; Autogrid `SettingsView` is the baseline (always apply).
- **`playnite-ci-packaging.mdc`** — GitHub Actions on Windows, scripts / packaging hints.
- **`playnite-extension-versioning.mdc`** — When to bump extension semver; ask user; release-only policy.
- **`playnite-github-releases-per-extension.mdc`** — One GitHub Release per add-on; no combined umbrella releases; tag collision guidance.
- **`playnite-github-release-tags.mdc`** — Release tag format **`{key}-v{version}`** and **`PackageUrl`** alignment.
- **`playnite-localization.mdc`** — Translate every `Localization/*.xaml` locale when adding or changing UI strings (always apply).
- **`playnite-themes.mdc`** — Theme add-ons: standalone themes on one shared key vocabulary (Playnite keys + `scripts/data/theme-keys.json`), how to pick a key, ThemeModifier compatibility (brushes only, generated `thememodifier.yaml`), overlay XAML rules, template placeholders, `.pthm` packaging.

Copy these rules into other Playnite plugin repos if you want the same agent behavior.

## Skills in this repo

Generic Playnite skills (prefer these for new work):

| Skill | Use when |
|-------|----------|
| **`playnite-extension-build`** | Compile, `artifacts/builds/`, csproj / SDK |
| **`playnite-extension-debug`** | Logs, UI thread, view gates, reflection / “does nothing” |
| **`playnite-extension-release`** | `.pext` / `.pthm`, per-extension installer manifests, release artifacts, PlayniteAddonDatabase YAML |
| **`playnite-theme-dev`** | New standalone theme from a design system's tokens and specs, token swaps, control restyles, `build-theme.ps1`, theme load failures |

## Reusing rules and skills in other projects

- Shared rules and skills are tracked in this repo. Keep them generic and avoid Autogrid-only paths in shared guidance.
- Use **`src/extensions.json`** rather than hardcoded paths when adding automation.

Read the **`SKILL.md`** files under **`.cursor/skills/`** when the user asks to build, debug, release, or extend Playnite extensions.
