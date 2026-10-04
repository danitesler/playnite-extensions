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
- Screenshots: `.\scripts\take-screenshots.ps1 -Extension <key>` (renders `details.png` & `settings.png` from HTML)
- Update API snapshot: `.\scripts\update-playnite-theme-api.ps1 -PlayniteSource <path> -PlayniteVersion <tag>`

## Strict Mandates
- **Build after edit**: Plugins: run `.\scripts\build-plugin.ps1 -Extension <key>` (remind user to replace DLL). Themes: run `.\scripts\build-theme.ps1 -Extension <key> -Deploy -Restart` (auto-sets active theme and restarts/launches Playnite on local Windows).
- **No Server Execution**: Never run/install/emulate Playnite on non-Windows/server environments.
- **Releases**: Package-only (`.pext`/`.pthm` + `.zip`). Tag `{key}-v{version}`. Never push, tag, release, or open PR unless asked.
- **README Release Links**: Whenever a new release is cut for an add-on or theme, update its title link in root `README.md` to point to the new release (`https://github.com/danitesler/playnite-extensions/releases/tag/{key}-v{version}`). Unreleased add-ons remain unclickable plain text.
- **Localization**: New strings go to `en_US.xaml` AND all `Localization/*.xaml`.
- **Settings UI**: Stock controls only; Autogrid `SettingsView` is baseline.
- **Theme Shell Layout**: Sidebar on Left (compact rail: 44px wide, 44x40 items, 16px glyphs).
- **Control Corner Radii**: In WPF, `CornerRadiusFull` (9999/10000) clamps X and Y radii independently to `width/2` and `height/2`, distorting any element where `width != height` into a stretched oval/ellipse instead of a true capsule. Therefore, never use `CornerRadiusFull` on base control styles (`Button`, `RepeatButton`, `ToggleButton`, `SearchBox`, `TabControl`, menu items), action buttons (`PlayButton`), or metadata tag chips (`PropertyItemButton`). All of these must use `ControlCornerRadius` (or `CornerRadiusSmall`). Thin tracks and progress fills (`Slider` tracks, `ProgressBar`, tab indicator lines, `ScrollBarThumb`) must also NEVER use `CornerRadiusFull` (which turns the track into an elongated needle/spindle); always specify an explicit numeric radius equal to half the track thickness (e.g. `CornerRadius="2"` for a 4px slider track, `CornerRadius="3"` for a 6px progress bar, `CornerRadius="1.5"` for a 3px tab indicator, `CornerRadius="3"` for a 6px scrollbar thumb). `CornerRadiusFull` is strictly reserved for fixed 1:1 square elements where `Width == Height` (e.g. 16x16 notification badges, circular icon buttons). Never wrap dynamic toolbar collections (`PART_PanelMainItems`) in an outer pill container.
- **Game Page Layout**: SteamScreenshots in left column above description; metadata on right. Game banner spacer scales proportionally with HeroArt via MathConverter (`'x * <DefaultSpacer> / <DefaultBanner>'`), keeping default title/gradient scrim positions intact while moving top elements up/down dynamically when Banner height (0 = off) is modified.
- **Icons & Brushes**: Add-on tile icons (`info/icon.png`) use default orange (`#FF7A1A`). Themes use brushes only (never `Color` keys).
- **New Theme Reference Research**: When modeling a theme after a reference without ready tokens (game, film, OS, design system), **conduct deep research before coding/scaffolding**. Gather data from screenshots/captures, reference codebases/repos, style guides, or specs: measure colors, identify typography/fallbacks, study chrome/selection styles and icons, and log all sources/rules in `AGENTS.md` -> `Sources`.
- **Theme Screenshots & Mockups**: All release screenshots (`details.png` and `settings.png` in `art/`) are generated exclusively from the HTML preview templates (`art/preview-details.html` and `art/preview-settings.html`) via `.\scripts\take-screenshots.ps1 -Extension <key>`. Never capture live Playnite desktop windows. Layout, sample game and sample data of both previews are fixed in `src/themes/AGENTS.md` -> Previews and screenshots (the details view includes the game list panel).
- **PRs/Releases**: One GitHub Release & one PlayniteAddonDatabase PR per add-on. Show PR copy to user before pushing.

## Skills (`.claude/skills/`)
- `playnite-plugin-dev`: .NET plugin work, settings UI, localization, debugging.
- `playnite-theme-dev`: Theme creation, token swaps, control restyles, key vocabulary.
- `playnite-release`: Versioning, packaging, PlayniteAddonDatabase PRs.

## Context & Token Efficiency
- **Targeted file reads**: Never view entire large XAML (>200 lines) or JSON files; grep for target symbols first, then inspect only the relevant line slice (`StartLine`/`EndLine`).
- **Subagent delegation**: Delegate multi-theme surveys, wide grep searches, or background investigations to `research` subagents so intermediate tool outputs do not enter the primary conversation context.
