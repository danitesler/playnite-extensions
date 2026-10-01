# Clutch — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Counter-Strike 2 main menu** (dark only; the game has no light mode): translucent black panels over the game's art, `#cccccc` text, one pale blue (`selectedNavColor` `#82D8FF`) for the selected tab and focus, a green GO button, 64px navbar with uppercase tabs split by thin rules, map-tile covers.

**Unofficial fan theme.** Not affiliated with or endorsed by Valve. No Valve logos, icons, fonts, images or game files are included (see `info/NOTICE-Clutch.txt`). The crosshair mark is hand-drawn.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Tokens and component values | The game's Panorama style sheets, `game/csgo/pak01_dir/panorama/styles/*.css` (`csgostyles.css`, `mainmenu.css`, `mainmenu_play.css`, `popups/*.css`, `settings/*.css`, `tooltips.css`, `context_menu.css`), as tracked by **SteamDatabase/GameTracking-CS2** (fetched 2026-09-30). Values were read and rewritten as plain numbers in `src/tokens.css`, each with the selector it came from; no file was copied. |
| Icons | **Material Symbols Sharp**, filled (Apache-2.0, `info/LICENSE-material-symbols.txt`), the closest open set to the game's solid square-cut menu glyphs. Geometries in `src/Media.xaml` (shifted to a 0..960 grid), menu PNGs in `src/Images/Material/`. Jobs in `icons.json`. |
| Crosshair | Original: five rectangles in `src/Media.xaml` (`IconMainMenu`) and `art/mark.svg` (add-on tile). |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

The game's fonts (Stratum2, Noto Sans) are not bundled. Body text is Segoe UI; headings, tabs and the GO label use **Bahnschrift** (ships with Windows 10+), the nearest condensed DIN-like face to Stratum2.

## Tokens

`src/tokens.css` keeps the game's `@define` names verbatim (`baseText`, `selectedNavColor`, ...) and names the rest after their selector. `Constants.template.xaml` maps them:

Library art: `Views/Library.xaml` lays a black scrim over it with the game's menu vignette (`#DD` at the top fading out by 25%, `#94` over the bottom 15%, `ScrimBrush`).

Type: 12 / 14 / 16 / 20 / 32. `HtmlTextView` reads the Colors of the brushes on its `TextElement.Foreground` and `Tag`, so ThemeModifier brush edits reach the description too.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | The main menu navbar: 64px on black 75%. Search at the left; the view switches as icon buttons in the middle (`TopPanelSwitch*ViewTemplate` -> `IconDetailsView` / `IconGridView` / `IconListView`, no text; the item's Title is the tooltip), selected in `selectedNavColor` on its wash; Playnite's two section separators are `Canvas`es, drawn as 1px white-30% rules by an implicit `Canvas` style. Filter (uppercase label when active), notifications and progress at the right, 150px kept clear for the window buttons. |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px icon rail on the navbar color with the crosshair (main menu) on top; 32px plates, selected = wash + blue glyph. Top/bottom docking: a 64px strip where view items become uppercase tabs. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons (Material window icons), red close hover, 64px caption height. |
| `Views/MainWindow.xaml` | Default layout, notifications slide in from the right. |
| `Views/Library.xaml` | Background art over both rows with the menu vignette; library layer at `rgba(20,20,20,0.4)`. |

## Game page

Follows the shared skeleton. Differences:

- Header: name in Bahnschrift bold 32px (Playnite sets its text, so it keeps its case); actions at the **right** of the title in the details view (GO button, then square Options and edit buttons), under the title in the grid panel.
- Steam screenshots live in the left column above the description (not full width); metadata stays on the right.
- Section titles (Description, Notes, Steam screenshots) are the game's settings section titles: uppercase Bahnschrift, 40% white, 1px rule under them. Uppercasing goes through a `ContentControl` whose inline `DataTemplate` runs `StringToUpperCaseConverter` on the `LOC` string.
- Metadata pane on a black 75% panel with 3px corners; in the details view the cover sits above it. Rhythm: 12px around group rules, 6px around fields, caption column 128px (details), caption above value (grid).
- Banner scrim: the map tile gradient (`.map-selection-btn__gradient`, black to 70% at the bottom) in `ScrimBrush`.
- The two views share every block (banner, section titles, metadata groups); change them in pairs.

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations

- **No box-shadow**: the GO glow is a green rectangle faded through an `OpacityMask`, not a blur.
- **Fonts**: Bahnschrift and Segoe UI stand in for Stratum2 and Noto Sans; Playnite also applies the user's font setting over `FontFamily`.
- **Map tiles** in the game zoom 2% on hover; WPF tiles get a 40% white edge instead (a scale transform on hundreds of covers costs too much).
- **Grid side panel** keeps the shared two-column layout; at Playnite's default 350px panel width the description column gets narrow, as in the other themes here.
- **List view column headers** keep Playnite's Default header style (not restyled).

## Not verified yet

Seen running (Playnite 10.60 under Wine, stand-in fonts): details, grid (with side panel), list, main menu. Not yet checked on Windows: settings tabs and group boxes, game edit dialog, top panel dropdowns, filter panel, notifications, progress dialog, the sidebar at top/bottom/right, ThemeModifier edits.

## Preview and screenshots

`art/preview-grid.html` is an approximate HTML replica of the grid view (this theme's token values and sizes; fonts stand in), rendered to `art/preview-grid.png` with `node scripts/render-theme-preview.mjs src/themes/Clutch/art/preview-grid.html`. It is a mockup, not a Playnite capture. Real screenshots (`info/screenshots/grid.png`, `details.png`) come from `.\scripts\take-screenshots.ps1 -Extension clutch` on a local Windows machine (never in a cloud session) and are still to add before the release and the database PR.
