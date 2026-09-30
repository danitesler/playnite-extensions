# Playnite extensions monorepo — agent handoff

## What this repo is

This repository is a reusable **Playnite add-on monorepo** for two kinds of add-ons, both registered in **`src/extensions.json`** and distinguished by **`kind`**:

- **`plugin`** — .NET extensions. Each owns its code, project file, manifests, icon, and release metadata under **`src/<PluginName>/`**.
- **`theme`** — XAML themes. Each is standalone and laid out like a plugin: **`src/themes/<ThemeName>/`** holds its XAML and tokens (`src/`), manifests, icon and licenses (`info/`), and notes (`AGENTS.md`). Each follows its own design system's tokens, shell and components; the only thing themes share is the key vocabulary (Playnite's keys plus **`scripts/data/theme-keys.json`**), so keys mean the same in every theme and ThemeModifier edits reach every control.

## Current extensions

- **Autogrid** (`autogrid`) — GenericPlugin, `net462`, WPF. Extension-specific notes live in **`src/Autogrid/AGENTS.md`**.
- **GameHoverDetails** (`gamehoverdetails`) — GenericPlugin, `net462`, WPF: hover popup with name, short description, and platforms. Notes in **`src/GameHoverDetails/AGENTS.md`**.
- **AutoStatus** (`autostatus`) — GenericPlugin, `net462`, WPF settings: completion-status rules (stale Playing → On Hold; started game → Playing). Notes in **`src/AutoStatus/AGENTS.md`**.
- **RandomTheme** (`randomtheme`) — GenericPlugin, `net462`, WPF settings: picks a random theme on startup independently for Desktop and Fullscreen modes. Notes in **`src/RandomTheme/AGENTS.md`**.

## Current themes

- **Shadcn UI** (`shadcnui`) — Desktop theme, theme API 2.9.0 (Playnite 10.45+), shadcn/ui (zinc, dark). Notes in **`src/themes/ShadcnUi/AGENTS.md`**.
- **Chakra UI** (`chakraui`) — Desktop theme, theme API 2.9.0, Chakra UI v3 dark tokens with teal. Notes in **`src/themes/ChakraUi/AGENTS.md`**.
- **Material UI** (`materialui`) — Desktop theme, theme API 2.9.0, MUI's default dark theme. Notes in **`src/themes/MaterialUi/AGENTS.md`**.
- **Primer** (`primer`) — Desktop theme, theme API 2.9.0, GitHub Primer dark tokens. Notes in **`src/themes/Primer/AGENTS.md`**.
- **Fluent 2** (`fluent2`) — Desktop theme, theme API 2.9.0, Microsoft Fluent 2 `webDarkTheme` tokens and a Windows 11 shell. Notes in **`src/themes/Fluent2/AGENTS.md`**.
- **Launchpad** (`launchpad`) — Desktop theme, theme API 2.9.0, a dark game-launcher look inspired by the Battle.net app (approximated, not sampled) with a top app bar, game list and game page. Notes in **`src/themes/Launchpad/AGENTS.md`**.
- **Codex** (`codex`) — Desktop theme, theme API 2.9.0, charcoal, ivory and gold inspired by the RPG-era Assassin's Creed menus: a tab strip on top, entry-style game info screens, original hairline icons. Unofficial (no Ubisoft assets). Notes in **`src/themes/Codex/AGENTS.md`**.
- **Questlog** (`questlog`) — Desktop theme, theme API 2.9.0, fantasy RPG look inspired by the World of Warcraft Vanilla interface (gold frames, red leather buttons, tooltip navy, quest log game page); unofficial, original artwork only, no game files. Notes in **`src/themes/Questlog/AGENTS.md`**.
- **Uplink** (`uplink`) — Desktop theme, theme API 2.9.0, sci-fi look inspired by the StarCraft II menus (navigation rail on the left with a lit current item, sub navigation strip on top (uppercase tab bar when the sidebar is at the top), cut-corner plates, blue glows; text colors from the game's UI style data); unofficial, original artwork only, no game files. Notes in **`src/themes/Uplink/AGENTS.md`**.
- **Ancient** (`ancient`) — Desktop theme, theme API 2.9.0, inspired by the Dota 2 main menu (slate navigation rail on the left with a blue glow on the current item, black secondary strip on top, bevelled grey buttons, green Play button; values read from the game's Panorama CSS); unofficial, original artwork only, no game files. Notes in **`src/themes/Ancient/AGENTS.md`**.
- **Hextech** (`hextech`) — Desktop theme, theme API 2.9.0, near-black and gold with hextech blue, inspired by the League of Legends client: left navigation rail, flat gold-edged buttons, blue Play button. Unofficial (no Riot assets), palette approximated from community kits. Notes in **`src/themes/Hextech/AGENTS.md`**.
- **Clutch** (`clutch`) — Desktop theme, theme API 2.9.0, a dark tactical-shooter look inspired by the Counter-Strike 2 main menu (values read from the game's Panorama style sheets): 64px navbar with uppercase view tabs, green GO button, map-tile covers; unofficial, no Valve assets. Notes in **`src/themes/Clutch/AGENTS.md`**.

## Repository layout

| Area | Path |
|------|------|
| Extension index | `src/extensions.json` (one row per add-on: key, name, kind, dir, AddonId, API version; scripts derive every path and URL from `dir`) |
| Extension project | `src/<PluginName>/<PluginName>.csproj` |
| Extension source | `src/<PluginName>/src/` |
| Extension manifests | `src/<PluginName>/info/` (incl. `danitesler_<key>.yaml` for PlayniteAddonDatabase PRs) |
| Theme source | `src/themes/<ThemeName>/src/` (XAML at Playnite Default-theme paths, `tokens.css`, `Constants.template.xaml`) |
| Shared theme anatomy | `src/themes/AGENTS.md` (file map, shell mechanics, game page skeleton and metadata pane, icons, first-run checks) |
| Theme manifests | `src/themes/<ThemeName>/info/` (`theme.yaml`, `InstallerManifest.yaml`, `danitesler_<key>.yaml`, `icon.png`, `LICENSE-*.txt`) |
| Playnite theme API snapshot | `scripts/data/playnite-theme-api.json` (loadable file paths + resource keys per Playnite release) |
| Shared theme key vocabulary | `scripts/data/theme-keys.json` (every key a theme may add: type, group, required, role) |
| Build scripts | `scripts/*.ps1` |
| Package artifacts | `artifacts/releases/<key>/` (themes: `artifacts/releases/themes/<key>/`) |
| Build artifacts | `artifacts/builds/<key>/` (themes: `artifacts/builds/themes/<key>/`) |

## Build and package commands

- Validate one extension: **`.\scripts\validate-extension.ps1 -Extension <key>`**
- Build one extension: **`.\scripts\build-plugin.ps1 -Extension <key>`**
- Package one extension: **`.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller`**
- Scaffold a new extension: **`.\scripts\new-extension.ps1 -Name MyPlugin -Key myplugin -Type GenericPlugin -Author <name>`**
  - `-Type` is `GenericPlugin`, `MetadataPlugin`, or `LibraryPlugin`; each gets a skeleton that compiles. The add-on database `Type` differs (`Generic`, `MetadataProvider`, `GameLibrary`) and `validate-extension.ps1` checks it.
- Build one theme (render + static checks): **`.\scripts\build-theme.ps1 -Extension <key> [-Deploy]`** (`build-plugin.ps1` forwards themes here)
- Scaffold a new theme: **`.\scripts\new-theme.ps1 -Name "My Theme" -Key mytheme [-DesignSystem "My DS"] [-TokensCss <tokens .css>]`**
- Render icons for any add-on: **`.\scripts\render-icons.ps1 -Extension <key>`** (jobs in `src/<Folder>/icons.json`), or ad hoc **`-Pack <pack> -Icons <names> [-Format Png|Geometry|DrawingImage]`**. Packs (Octicons, Lucide, Tabler, Heroicons, Phosphor, Feather, Material Symbols, Fluent) are in `scripts/data/icon-packs.json`; `-UrlTemplate` / `-SvgDir` take any other SVG source. `-ListPacks` shows them.
- Add-on tile icon (`info/icon.png`, the projects-page style): **`.\scripts\render-addon-icon.ps1 -Svg logo.svg -Extension <key>`** (or `python3 scripts/render-addon-icon.py --svg logo.svg --extension <key>`). Flat mark, dark rounded tile, inset outline, bottom glow. Not the menu icons from `render-icons.ps1`.
- Refresh the theme API snapshot for a new Playnite release: **`.\scripts\update-playnite-theme-api.ps1 -PlayniteSource <Playnite checkout> -PlayniteVersion <tag>`**

Validation, packaging, and CI branch on **`kind`**: themes package to **`.pthm`**, have no Directory.Build.props or Module, and are validated by building the theme and checking every XAML file against the API snapshot and the shared key vocabulary.

The package flow is intentionally **package-only**: it creates `.pext` (plugins) or `.pthm` (themes) and `.zip` artifacts and prints the expected GitHub Release tag / `PackageUrl`, but it does not create a GitHub Release.

**Releases and versions:** one GitHub Release per add-on, tagged **`{key}-v{version}`**; bump versions only when explicitly cutting a release, after stating the current version and asking for the new one. **Never push, tag, release, or open a PR unless asked.** Details, and how to add or update an add-on in PlayniteAddonDatabase: skill **`playnite-release`**.

**Index and CI:** `src/extensions.json` holds only what cannot be derived; `scripts/extension-profiles.ps1` (`Get-ExtensionProfile`) derives every path and URL from `dir`, and scripts/workflows read profiles, never hardcoded paths. CI (`ci.yml`, `windows-latest`) runs `validate-extension.ps1 -Mode Ci` then `build-plugin.ps1` per row; `release.yml` (manual) packages one key and does not create the GitHub Release.

## Always (any UI or add-on change)

- **Build after every change** to an add-on's code, XAML or manifest, and report the result in the skill's reply footer. Themes: build **and deploy to Playnite** every time (`.\scripts\build-theme.ps1 -Extension <key> -Deploy`), then tell the user to restart Playnite (themes load at startup only). Plugins have no deploy step: build, and remind the user to replace the DLL and restart Playnite if they want to test it.
- **Localization:** new or changed user-visible strings go into `en_US.xaml` **and** every other `Localization/*.xaml`, translated (skill `playnite-plugin-dev`).
- **Settings UI:** Playnite stock controls only, Autogrid `SettingsView` is the baseline; dependent options nest under their checkbox (skill `playnite-plugin-dev`).
- **Navigation on the left:** every theme is designed for Playnite's default Sidebar position, **Left**: the sidebar (main menu button, Library, Statistics, add-on views) is a vertical rail at the window's left edge, and that is the layout a theme's design, docs, listing and screenshots show. Top, bottom and right keep working as fallbacks, but no theme depends on them or asks users to move the sidebar. The top panel stays the view controls bar.
- **Add-on tile icons are orange:** every `info/icon.png` uses the script's default mark color (`#FF7A1A`, the projects-page orange), whatever the theme's own palette. Never pass `-Color`/`--color`; only the mark (`art/mark.svg`, original artwork) differs between add-ons.
- **Themes:** keys come from Playnite + `scripts/data/theme-keys.json`; brushes only, never `Color` keys (skill `playnite-theme-dev`).

## Skills (`.claude/skills/`, shared by Claude Code and Cursor)

| Skill | Use when |
|-------|----------|
| **`playnite-plugin-dev`** | Any `.NET` plugin work: conventions, settings UI, localization, `build-plugin.ps1`, debugging "does nothing" |
| **`playnite-theme-dev`** | Themes: new theme from a design system, token swaps, control restyles, `build-theme.ps1`, load failures, key vocabulary (`reference.md`) |
| **`playnite-release`** | Version bump, `.pext` / `.pthm` packaging, GitHub Release, adding or updating an add-on in PlayniteAddonDatabase (`addon-database.md`) |

Add-on-specific rules (for example GameHoverDetails preview parity) live in that add-on's `AGENTS.md`. Read the matching `SKILL.md` when the user asks to build, debug, release, or extend an add-on.
