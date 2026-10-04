# Dropzone — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Fortnite lobby and main menus** as of Chapter 6 (2025–2026: the rounded menus Epic introduced with Chapter 5, not the older slanted plates). Dark only; the game has no light mode. Deep navy surfaces, heavy white capitals, a light grey pill for the current tab, blue plates for menus and selection, the yellow PLAY button, cyan labels.

The brief was "follow the game closely, but stay minimal like the other themes": the shapes, colors and layout come from the game; the lobby's busy art, rarity gradients and loud badges are left out.

**Unofficial fan theme.** Not affiliated with or endorsed by Epic Games. No Epic logos, icons, fonts, images or game files are included (see `info/NOTICE-Dropzone.txt`). The parachute mark (`art/mark.svg`) is original.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

`src/tokens.css` names each value after the element it was sampled from. `Constants.template.xaml` maps them:

`PanelSeparatorColor` is transparent: the game separates with space, not rules, so the metadata groups and section titles draw no lines.

Type: 12 / 14 / 16 / 22 / 40.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | 64px row, transparent. At the left a 44px rounded navy strip (the lobby navbar) with Playnite's icon items and the icon view switches (`TopPanelSwitch*ViewTemplate`); the current view is the light grey pill with near-black text; Playnite's two `Canvas` separators become 7px yellow dots. At the right: pill search box, filter, notifications (yellow badge), progress, 150px kept clear for the caption buttons. |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px compact rail in the sidebar navy, menu bars on top, 44x40 items with blue glyphs; the current item is a full-width blue plate with slanted ends (a `Path`, `M0,4 L44,0 L44,36 L0,40 Z`) and a white glyph. Top/bottom: capital tabs, current = light pill. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons, muted glyphs, red close hover, 64px caption height. |
| `Views/Library.xaml` | Background art behind everything under a navy wash (`ScrimBrush`: 90% under the navbar, 60% mid, 95% at the bottom). Library layer transparent. |

## Game page

Follows the shared skeleton, dressed as the island details screen: the banner gets a second, horizontal navy wash from the left (details view), the title is 40px Bold condensed, captions are the label cyan in the heading face Bold, list values are the slanted blue tags, PLAY is 52px tall and 200px wide, More and Edit are 52px round pills. The metadata pane is a 12px-radius card in the rail navy; groups are separated by space only.

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations

- Burbank Big Condensed is replaced by Bahnschrift Bold Condensed.
- Values in chips and the game title keep their own case: Playnite's `StringToUpperCaseConverter` returns an empty string for non-string content, and `PART_TextDisplayName` is filled from code.
- The lobby's 3D scene is the game's background art under a navy wash; no animated scene, no rarity gradients.
- The game shows player level, V-Bucks and an avatar on the navbar's right; here that spot holds Playnite's search, filter and notifications.
- Icons were converted on Linux (paths shifted by a script, PNGs rasterized in Chromium) because `render-icons.ps1` needs WPF; `icons.json` reproduces them on Windows.

## Not verified yet

- Bahnschrift's condensed bold instance is picked by WPF from `FontWeight="Bold"` + `FontStretch="Condensed"`; if WPF falls back to the regular width, tabs and titles will be wider than designed.
- The rounded cover mask (VisualBrush bound to the tile size) at large zoom levels and with "Show grid item background" on.
- The slanted rail plate with add-on sidebar items that bring their own icon sizes.
- Real screenshots: `.\scripts\take-screenshots.ps1 -Extension dropzone` on Windows (the cloud session only has the HTML mockup in `art/`).
