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
- Build plugin: `.\scripts\build-plugin.ps1 -Extension <key> [-NoDeploy]`
- Package: `.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller` (Toolbox verifies installer + addon manifests before packing)
- Scaffold plugin: `.\scripts\new-extension.ps1 -Name MyPlugin -Key myplugin -Type GenericPlugin -Author <name>`
- Build theme: `.\scripts\build-theme.ps1 -Extension <key> [-NoDeploy] [-NoRestart] [-Launch]`
- Scaffold theme: `.\scripts\new-theme.ps1 -Name "My Theme" -Key mytheme [-DesignSystem "My DS"] [-TokensCss <css>] [-Ambition Showcase|Hybrid|Faithful]` (or `/new-theme <source>` in Claude Code)
- Render icons: `.\scripts\render-icons.ps1 -Extension <key>`
- Tile icon: `.\scripts\render-addon-icon.ps1 -Svg logo.svg -Extension <key>`
- Screenshots: `.\scripts\take-screenshots.ps1 -Extension <key>` (renders `screenshot-details.png` & `screenshot-settings.png` from HTML)
- Add-on READMEs: `node scripts/generate-readmes.mjs` (`--check` or `npm run check:readmes` to verify; fetch tags first)
- Update API snapshot: `.\scripts\update-playnite-theme-api.ps1 -PlayniteSource <path> -PlayniteVersion <tag>`
- Run unit tests: `dotnet test tests/Tests.csproj`
- All checks: `pwsh scripts/check-all.ps1` or `scripts/check-all.sh`. Use `-Keys hallowtide,emberline` for selected add-ons. `-Quick` skips plugin artifact builds and browser checks. On Windows it still builds the theme drops used by WPF tests. Run the full gate before merging or releasing. There is no hosted CI. Do not add Dependabot.

## Strict Mandates
- **Build after edit (Windows: automatic deploy + restart)**: After every theme/plugin update, finish with `build-theme.ps1 -Extension <key>` or `build-plugin.ps1 -Extension <key>`. On local Windows with Playnite installed, these deploy the complete build automatically, close the targeted Playnite installation before replacing files, and restart the same Desktop/Fullscreen sessions only if they were running. A closed Playnite stays closed; themes accept `-Launch` to start it explicitly. Do not ask the user to copy DLLs or quit/restart manually. Build failures leave Playnite untouched; deployment failures attempt to restore the originally running sessions.
- **Redeploy and show it after every change**: after every theme or plugin edit, build, deploy and restart Playnite, then leave it open as the active, foreground window (restored if minimized), so the user sees the change without asking. Themes: `build-theme.ps1 -Extension <key> -Launch`, which also starts Playnite when it was closed. If the build leaves Playnite minimized or behind other windows, bring its main window to the front. In batches, redeploy each theme with `-NoRestart` and let the active theme's final deploy do the single restart and focus.
- **Always Deploy on Build**: Normal local Windows builds deploy automatically. `-NoDeploy` is the explicit artifact-only opt-out and is used by validation, packaging and batch-build loops; it also suppresses restarts. `-NoRestart` allows theme deploy-only batches; plugin deployment while running requires restart. `build-themes.ps1` builds all themes with `-NoDeploy`, then deploys/activates and restarts only `-DeployKey` when specified. Playnite reads its deployed copy, never repo sources or `artifacts/builds`. After changes spanning themes, redeploy each with `-Deploy -NoRestart`, then deploy/activate the intended active theme normally to restart once. Non-Windows and CI builds never operate Playnite.
- **No Server Execution**: Never run/install/emulate Playnite on non-Windows/server environments.
- **Releases**: Package-only (`.pext`/`.pthm` + `.zip`). Tag `{key}-v{version}`. Never push, tag, release, or open PR unless asked.
- **Add-on READMEs & Release Links**: Every add-on has a `README.md` in its folder (overview, screenshots, install, details), and every add-on row in the root `README.md` shows the name and release status on one title line: `**Name** · [Download <version>](...)` (only when the `{key}-v{version}` tag exists; otherwise `· _not released yet_`). Root rows have no description and no `More` link. Both are produced by `node scripts/generate-readmes.mjs` from `info/danitesler_<key>.yaml`, the manifests and the git tags; never edit a generated README by hand (it starts with a `Generated by` marker). After cutting a release (tag exists), run the script and commit the result. A hand-written README (RandomTheme) is kept as is. The script rewrites each root row's image link (the theme preview or plugin icon opens that add-on's Details page, never the image file) and its title line. `scripts/check-all.ps1` fails when generated files are out of date (`npm run check:readmes`).
- **Theme order in the root README**: when adding a theme, put its row in the Themes table anywhere, then run `python3 scripts/sort-readme-themes.py` (needs Pillow and numpy) after its `art/screenshot-*.png` exist. It orders rows by overall look (colors, layout, brightness, edges) so similar-looking themes sit together, light themes first, then dark. Do not sort by name, date or accent color by hand.
- **Grid tile buttons**: in every theme's grid view (GridTileButton in DerivedStyles/GridViewItemTemplate.xaml), the play and info buttons are at least 48x48 (Width and Height). Bigger is fine; never shrink one below 48.
- **Localization**: New strings go to `en_US.xaml` AND all `Localization/*.xaml`.
- **Settings UI**: Prefer Playnite native components; stock controls only. Autogrid `SettingsView` is baseline. Use native `TabControl`/`TabItem`, `Separator`, `CheckBox`, `Label`, `Slider`, `RadioButton`, `ComboBox`, `TextBox`, `Button`, `TextBlock` with `StackPanel`/`Grid` layout — no custom templates, cards, pills, tab strips, toggles, icon buttons, pickers, or shadows. Theme brushes/sizes via `{DynamicResource ...}` (`TextBrush`, `PopupBackgroundBrush`, `PopupBorderBrush`, `FontSize`); never hardcoded hex, `FontSize`, or `FontWeight`.
- **PRs/Releases**: One GitHub Release & one PlayniteAddonDatabase PR per add-on. Show PR copy to user before pushing. Database PR body must link screenshots (embed each `Screenshots: Image:` URL as a markdown image; if no `Screenshots:`, say so).

## Theme work

- [Theme rules and shared layouts](src/themes/AGENTS.md) cover XAML, Playnite behavior, preview assets and branding.
- [Theme development](.agents/skills/playnite-theme-dev/SKILL.md) covers research, creative direction, the preview checklist and implementation. Start with reference research. Keep source measurements and links in `RESEARCH.md`, linked from the theme’s `AGENTS.md`, and write a short `BRIEF.md`.
- [Multi-theme patches](docs/themes/theme-patch-workflow.md) covers ownership, checks and deployment.
- **Menus (every theme, new ones included):** every popup menu (the hamburger menu behind `PART_ElemMainMenu`, the top bar dropdowns, game, group and tray menus) wears one menu designed per theme, compact (28-32px rows, fixed icon column, group breaks up to 12px; ComboBox lists use the same panel and rows), with its own panel, animated highlight, group break and shortcut style drawn from the source. It lives in the theme's default menu templates: the implicit `ContextMenu` template, the `SubmenuItem` / `SubmenuHeader` row templates and the `SeparatorStyleKey` style in `Menu.xaml`; `TopPanelMenu` is `BasedOn` the `ContextMenu` style with no template of its own. Every `SubmenuItem` and `SubmenuHeader` `IsHighlighted` trigger must set `TextElement.Foreground` on `TargetName="Icon"` so icons invert/contrast with the hover plate (and icofont themes must declare Playnite's menu icon `TextBlock`s in `Media.xaml` without a local `Foreground` so they inherit). `validate-extension.ps1` enforces it (themes still in `MenuPending` get an advisory). Recipe and levers: [Menus](docs/themes/menus.md).
- **Metadata position (every theme, new ones included):** both details and grid views default the metadata pane to Right; the `GameDetailsPanePosition` ThemeModifier dropdown also supports Left and Center / Stretch (stretched full-width above screenshots and description with group dividers hidden so visible metadata items flow sequentially in a 3/2/1-column grid: 3 columns at 900px+, 2 at 560–899px, and 1 below 560px). Narrow pages stack metadata first for Left, Center and Stretch. `node scripts/game-page-breakpoints.mjs` writes it, `validate-extension.ps1` enforces it. Details: [Responsive game pages](docs/themes/reference.md#responsive-game-pages).

## Playnite skills

- [playnite-plugin-dev](.agents/skills/playnite-plugin-dev/SKILL.md) covers .NET plugin work, settings UI, localization and debugging.
- [playnite-theme-dev](.agents/skills/playnite-theme-dev/SKILL.md) covers theme creation, tokens, control restyles and load failures.
- [playnite-release](.agents/skills/playnite-release/SKILL.md) covers versioning, packaging and PlayniteAddonDatabase PRs.

Maintain the shared skills in `.agents/skills/`. Claude Code discovers the thin entries in `.claude/skills/`, which point to the shared instructions.

## Context & Token Efficiency
- **Targeted file reads**: Never view entire large XAML (>200 lines) or JSON files; grep for target symbols first, then inspect only the relevant line slice (`StartLine`/`EndLine`).
- **Subagent delegation**: Delegate substantial multi-theme surveys or independent background investigations. Keep targeted searches with the coordinator. For edits across themes, use the ownership and deployment steps in the [theme patch workflow](docs/themes/theme-patch-workflow.md).
