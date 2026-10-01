# Playnite extensions monorepo — agent handoff

## Overview
Playnite add-on monorepo registered in `src/extensions.json`:
- **Plugins** (`plugin`): .NET WPF extensions under `src/<PluginName>/`.
- **Themes** (`theme`): XAML themes under `src/themes/<ThemeName>/` sharing `scripts/data/theme-keys.json` keys.
Active add-ons catalog is in `src/extensions.json`. Per-extension notes live in `src/<dir>/AGENTS.md`.

## Layout & Data Sources
- **Index**: `src/extensions.json` (key, name, kind, dir, AddonId, API version)
- **Plugins**: `src/<PluginName>/` (`src/`, `info/`) | **Themes**: `src/themes/<ThemeName>/` (`src/`, `info/`)
- **Key Data**: `scripts/data/theme-keys.json`, `scripts/data/playnite-theme-api.json`
- **Artifacts**: `artifacts/releases/` and `artifacts/builds/`

## Key Commands
- Validate: `.\scripts\validate-extension.ps1 -Extension <key>`
- Build plugin: `.\scripts\build-plugin.ps1 -Extension <key>`
- Package: `.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller`
- Scaffold plugin: `.\scripts\new-extension.ps1 -Name MyPlugin -Key myplugin -Type GenericPlugin -Author <name>`
- Build theme: `.\scripts\build-theme.ps1 -Extension <key> [-Deploy] [-Restart]`
- Scaffold theme: `.\scripts\new-theme.ps1 -Name "My Theme" -Key mytheme [-DesignSystem "My DS"] [-TokensCss <css>]`
- Render icons: `.\scripts\render-icons.ps1 -Extension <key>`
- Tile icon: `.\scripts\render-addon-icon.ps1 -Svg logo.svg -Extension <key>`
- Screenshots: `.\scripts\take-screenshots.ps1 -Extension <key> [-Views Grid,Details] [-CloseRunning]`
- Update API snapshot: `.\scripts\update-playnite-theme-api.ps1 -PlayniteSource <path> -PlayniteVersion <tag>`

## Strict Mandates
- **Build after edit**: Plugins: run `.\scripts\build-plugin.ps1 -Extension <key>` (remind user to replace DLL). Themes: run `.\scripts\build-theme.ps1 -Extension <key> -Deploy -Restart` (auto-sets active theme and restarts/launches Playnite on local Windows).
- **No Server Execution**: Never run/install/emulate Playnite on non-Windows/server environments.
- **Releases**: Package-only (`.pext`/`.pthm` + `.zip`). Tag `{key}-v{version}`. Never push, tag, release, or open PR unless asked.
- **Localization**: New strings go to `en_US.xaml` AND all `Localization/*.xaml`.
- **Settings UI**: Stock controls only; Autogrid `SettingsView` is baseline.
- **Theme Shell Layout**: Sidebar on Left (compact rail: 44px wide, 44x40 items, 16px glyphs).
- **Game Page Layout**: SteamScreenshots in left column above description; metadata on right. Game banner spacer scales proportionally with HeroArt via MathConverter (`'x * <DefaultSpacer> / <DefaultBanner>'`), keeping default title/gradient scrim positions intact while moving top elements up/down dynamically when Banner height (0 = off) is modified.
- **Icons & Brushes**: Add-on tile icons (`info/icon.png`) use default orange (`#FF7A1A`). Themes use brushes only (never `Color` keys).
- **New Theme Mockup**: Render HTML replica to `art/preview-grid.png` and send via `SendUserFile` on first build.
- **PRs/Releases**: One GitHub Release & one PlayniteAddonDatabase PR per add-on. Show PR copy to user before pushing.

## Skills (`.claude/skills/`)
- `playnite-plugin-dev`: .NET plugin work, settings UI, localization, debugging.
- `playnite-theme-dev`: Theme creation, token swaps, control restyles, key vocabulary.
- `playnite-release`: Versioning, packaging, PlayniteAddonDatabase PRs.

## Context & Token Efficiency
- **Targeted file reads**: Never view entire large XAML (>200 lines) or JSON files; grep for target symbols first, then inspect only the relevant line slice (`StartLine`/`EndLine`).
- **Subagent delegation**: Delegate multi-theme surveys, wide grep searches, or background investigations to `research` subagents so intermediate tool outputs do not enter the primary conversation context.
