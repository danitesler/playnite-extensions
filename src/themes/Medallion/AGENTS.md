# Medallion — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of **The Witcher 3: Wild Hunt main menu** and the menus that share its look (pause, settings, journal), patch 1.32 / next-gen layout, dark only. The main menu is the model: a near-black band on the left with a rough brush edge, the logo on top of it, centered uppercase DIN items in grey (icons here), the current item on the game's selection wash (amber fading left to right, orange bar at its left). The rest stays minimal: tone on black, brown hairlines, one warm family (taupe, amber, orange) for headings and selection.

**Unofficial fan theme.** Not affiliated with or endorsed by CD PROJEKT RED. No game logos, icons, fonts, images or files are included (see `info/NOTICE-Medallion.txt`). The medallion mark (`art/mark.svg`, `IconMainMenu`), the brush edge and the double frame are drawn for this theme.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

`src/tokens.css` names each value after its screen and element. `Constants.template.xaml` maps them:

Radii: 0 everywhere (`ControlCornerRadius`, `CornerRadiusLarge`); 2px pills only for the slider and scroll thumbs (`CornerRadiusSmall`, `CornerRadiusFull`). Type: 12 / 14 / 16 / 20 / 32,  Library art: `Views/Library.xaml` shades it 65% black beside the band easing to 35%, black over the bottom fifth.

Shared keys added to `scripts/data/theme-keys.json` for this theme: `DoubleFrameTemplate`, `FrameHoverBrush`, `SidebarItemForegroundBrush`.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

The double frame (`DoubleFrameTemplate`): two 1px lines 2px apart, the outer a plain rectangle, the inner stepped 4px inward at each corner, as sampled from the selected settings row (2px lines with a 4px gap at 4K).

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | The main menu band as an icon rail: 44px of `#020202`, the medallion (24px, `PART_ElemMainMenu`) at the top with a 24px brown rule under it, then the items. The right edge is two jagged polygons in the band color (outer one at half strength) hanging 20px over the page. Right docking flips the edge; top/bottom: a 56px strip, no edge, 150px clear for the caption buttons. |
| `CustomControls/SidebarItem.xaml` | Main menu items as icons: 44x36 items with a 2px gutter, 16px icon, grey at rest, white with a grey double frame under the pointer; the current item takes the game's list selection, the amber wash fading left to right with the 3px orange bar on its left edge (no frame), white icon; the title is the tooltip. The tighter item keeps the rail from scrolling with many add-on items. |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | Header row on the bare page, 64px: search field (prompt plate, brown line) at the left; icon view switches centered between two small brown arrows (Playnite's separators); grey icons turning white; filter turns tracked orange while active. |
| `DerivedStyles/MainWindowStyle.xaml` | Close is the game's close box (X in the brown double frame, light on hover); minimize and maximize are bare glyphs. Caption height 64. |
| `Views/Library.xaml` | Background art behind the header row, shaded like the game's backdrop; library on black at 55%, 16px in from the band. |

## Game page

Follows the shared skeleton. Differences: the page is black (`GameOverviewBackgroundBrush`), the banner darkens to 80% toward the title; the name is regular DIN in label grey; Play is the selected quest header (gold double frame on dark amber, orange bar at its left), the other actions brown-framed boxes; section titles are the journal's category headers (uppercase taupe, brown rule); the metadata pane is a journal panel (`#070707`, faint brown edge) with brown group rules. The two views share every block; change them in pairs.

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations

- **Font**: Bahnschrift stands in for PF DIN; Playnite also applies the user's font setting over `FontFamily`.
- **The menu band is a 44px icon rail**, not the game's fifth of the screen with text items, so the library keeps its room; the frames and colors of the game's items carry over to the icons.
- **Brush edge** is a jagged polygon, not a painted texture; it stretches with the window height.
- **No scene**: the game's animated 3D backdrop is the selected game's background art.
- **Journal header arrows**: Playnite's two separators get the same style, so both arrows point right; the game's pair points outward.
- **Selection wash** is the amber color faded through an `OpacityMask` (ThemeModifier edits the color).

## Not verified yet

Built and statically checked only (cloud session; Playnite was not started). Not yet seen running: everything. Priority checks on Windows: the brush edge drawing over the content beside the band, the double frame at 125% and 150% DPI (1px lines), the sidebar at top/bottom/right, settings tabs, the game edit dialog, ThemeModifier edits.

## Preview and screenshots

Screenshots in `art/` (`screenshot-details.png` and `screenshot-settings.png`) are rendered from `art/preview-details.html` and `art/preview-settings.html` via `take-screenshots.ps1`.
