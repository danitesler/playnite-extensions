# Biome — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Terraria 1.4.4 main menu** and its menu screens (character and world select, character creation). Dark only: the window is the title screen's night sky. Translucent blue panels with 2px black edges, white text, menu words that go from white at 60% to gold, the gold edge of a hovered menu button, inventory-slot covers and pixel-art icons. Kept minimal: no textures, no parallax, no ornaments.

**Unofficial fan theme.** Not affiliated with or endorsed by Re-Logic. No Re-Logic logos, icons, fonts, textures or game files are included (see `info/NOTICE-Biome.txt`). The tree mark is hand-drawn (`art/icons.py`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Type: 12 / 14 / 16 / 22 / 35. New vocabulary entries added for this theme: `TextOutlineBrush`, `OutlinedTextTemplate` (`scripts/data/theme-keys.json`).

**Bordered text.** The game draws menu words four times in black, 2px off, then once on top (`Utils.DrawBorderString`). `OutlinedTextTemplate` (Common.xaml) does the same for a `ContentControl` (1.5px at Playnite's sizes); the game title repeats `PART_TextDisplayName` as four black copies bound to its `Text`. Used for the Play label, section headings and the game title only (view switches are icons only per repo rule).

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

Pixel icons are drawn aliased (`IconTemplate`) and only at 24px or 12px (whole or half scale) so pixels stay square; menu PNGs are 48px shown at 24.

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | What it draws |
|------|---------------|
| `Views/MainWindow.xaml`, `Views/Library.xaml` | Night sky: window color at the top, `ContentBackgroundBrush` rising from the bottom (masked, cached) hosted on the window behind all content. Background art at 45% with a sky-colored shade under the top bar. The library layer has no fill. |
| `Views/TopPanel.xaml` | The title screen: 64px, no fill. Search bar panel at the left; icon view switches in the middle (idle white 60%, hover/current gold), grouping/sort/random glyphs beside them, Playnite's two separators as plain gaps; filters, notifications (Hardcore red badge), progress on the right; 150px clear for caption buttons. 48px when the sidebar is at the top. |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px compact rail with transparent background (showing the window's night sky gradient) and a 2px black edge; tree mark in a 44x64 cell, 44x40 items; items are 36px hotbar slots (hover: panel + black edge; current: hover blue + gold edge). Top/bottom: a 64px strip, views as outlined words. |
| `CustomControls/TopPanelItem.xaml` | No plate; muted, gold on hover or toggled. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons, 24px pixel glyphs, hover panel with gold edge, red close; black window edge; caption height 64. |

## Game page

Follows the shared skeleton. Differences: the page sits on the list panel blue; the name is outlined (35px heading font, `FontSizeLargest`); Play is the title panel blue with the gold edge and an outlined gold label; Options and edit are 48px square menu buttons; section titles are outlined bold words over a 2px separator rule; the metadata pane is a menu panel (blue at 70%, 2px black edge, 6px corners) with 1px separator rules between groups (12px around rules, 6px around fields, caption column 128px in the details view). The banner fades into the sky color.

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations

- **No textures.** The game's 9-slice panel, slot and scroll bar textures become flat fills with a 2px edge and 6px corners.
- **Menu word scaling.** The game grows a hovered word from 0.8 to 1.0; here words keep their size so the bar does not shift.
- **Fonts.** Andy Bold is not bundled; Segoe UI Black / Segoe UI stand in. Playnite also applies the user's font setting over `FontFamily`.
- **Sky.** The animated parallax sky is a static night gradient.
- **Outline** is drawn with offset copies, so very long names cost five text layouts; used only for short headline text.

## Not verified yet

Nothing has been seen running in Playnite yet (built and statically checked in a cloud session). To check on Windows: everything in the shared first-run list, plus the outline alignment at 100%/150% DPI, Andy fallback, the pixel icons' crispness at non-100% DPI, and the sky gradient behind the details view.

## Preview and screenshots

Screenshots in `art/` (`screenshot-details.png` and `screenshot-settings.png`) are rendered from `art/preview-details.html` and `art/preview-settings.html` via `take-screenshots.ps1`.

## Regenerating art

`python3 src/themes/Biome/art/icons.py [--svg-dir <pixelarticons/svg>]` writes `art/icons.generated.xaml` (paste into `src/Media.xaml`), `art/mark.svg` and `src/Images/Pixel/*.png`. Then `python3 scripts/render-addon-icon.py --svg src/themes/Biome/art/mark.svg --extension biome` for the tile.
