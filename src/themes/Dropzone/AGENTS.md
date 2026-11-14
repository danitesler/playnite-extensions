# Dropzone — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Fortnite lobby and main menus** as of Chapter 6 (2025–2026: the rounded menus Epic introduced with Chapter 5, not the older slanted plates). Dark only; the game has no light mode. Deep navy surfaces, heavy white capitals, a light grey pill for the current tab, blue plates for menus and selection, the yellow PLAY button, cyan labels.

The brief was "follow the game closely, but stay minimal like the other themes": the shapes, colors and layout come from the game; the lobby's busy art, rarity gradients and loud badges are left out.

**Unofficial fan theme.** Not affiliated with or endorsed by Epic Games. No Epic logos, icons, fonts, images or game files are included (see `info/NOTICE-Dropzone.txt`). The parachute mark (`art/mark.svg`) is original.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

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
| `Views/TopPanel.xaml` | 64px row, transparent. At the left the lobby navbar items, bare on the bar (the game's 44px rounded navy strip is not drawn: repo rule, no container around `PART_PanelMainItems`): Playnite's icon items and the icon view switches (`TopPanelSwitch*ViewTemplate`); the current view is the light grey pill with near-black text; Playnite's two `Canvas` separators become 7px yellow dots. At the right: pill search box, filter, notifications (yellow badge), progress, 150px kept clear for the caption buttons. |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px compact rail in the sidebar navy, menu bars on top, 44x40 items with blue glyphs; the current item is a full-width blue plate with slanted ends (a `Path`, `M0,4 L44,0 L44,36 L0,40 Z`) and a white glyph. Top/bottom: capital tabs, current = light pill. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons, muted glyphs, red close hover, 64px caption height. |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). |
**Settings chrome.** `DefaultControls/TreeView.xaml`: 30px rounded plate rows (8px, inset 6px) in the body face; hover is the white 12% plate with the yellow notification dot half-lit, selected is the navbar's light grey pill with near-black label and the full yellow dot; children sit under a rounded 2px guide; Settings width 250. `DerivedStyles/StandardWindowStyle.xaml`: 44px band in the settings tab-strip navy, title as the current-tab grey pill followed by three fading yellow dots, the drop-zone ring (two outlines) ghosted at the right, closed by a 2px blue menu edge; `WindowBarButton` is 40x32 with 8px corners.

## Game page

Follows the shared skeleton, dressed as the island details screen: the banner gets a second, horizontal navy wash from the left (details view), the title is 40px Bold condensed, captions are the label cyan in the heading face Bold, list values are the slanted blue tags, PLAY is 52px tall and 200px wide, More and Edit are 52px round pills. The metadata pane is a 12px-radius card in the rail navy; groups are separated by space only.

## Components

Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`. The interactive layer is as close to the game's behaviour as public sources allow (`RESEARCH.md` -> Motion, no official numbers):

| Playnite file | Game component |
|---------------|----------------|
| `PlayButton` | PLAY: hover pops to 1.04 (0.15s ease-out), lighter plate, yellow halo and a one-shot 0.5s flash; while hovered the halo breathes; pressed is its own deep-yellow layer with a 0.97 squash |
| `GridViewItemStyle` | Discover tile: selected = static 3px focus ring; hover = a pale-cyan ring fading in with an overshoot pop (0.96 to 1); the tile mask and its bitmap cache stay |
| Running game (`RunningIndicatorBrush` = `success` 5dd48a) | the lobby's loading language, chunky and rounded: a diagonal soft slash (`RunningScan`, an angled mask with a small overshoot) sweeps details rows, list rows, covers (rising from the foot) and the slab, in each surface's own corner radius. **Launching:** the slash crosses in 1s (1.6s loop), a pill foot fills behind it and three dots hop in turn as it lands. **Running:** the pill stays full, the frame breathes 0.7 to 1 and the dots hop in a slow wave (2.8s). The slab holds a 0.88 scrim over the plate while launching and breathes 0.55 to 0.68 while running under a bright label; hover on RUNNING (button only, `Self`) swaps the label for Cancel, and the lit plate, flash and halo are off while launching or running. |
| `GridViewItemTemplate` (+ `GridTileButton`) | cover hover controls as the round icon buttons of the Chapter 5 and 6 menus (44px circles, Material Rounded glyphs `IconPlay` / `IconInfo` / `IconDownload` from `Media.xaml`): the cover zooms 1.04 with a one-shot flash, the navy shade fades in, buttons rise 10px and scale 0.86 to 1 with an overshoot, Info 60ms later; hover pops a button to 1.1 and lights the pale-cyan ring; Play yellow, Info the translucent lobby pill |
| Empty game page (`DetailsViewGameOverview`, `GridViewGameOverview`) | content hidden; the parachute mark drifting down (bob and sway) onto a breathing drop-zone ring above `LOCErrorNoGameSelected` in heavy condensed capitals; the loops run only while it shows |

## Deviations

- Motion is built from a fan rebuild of one Fortnite button and the game's look, not from Epic numbers (`RESEARCH.md` -> Motion).
- The banner washes through plain gradients, not an `OpacityMask`: PLAY animates over it (reference.md).
- Burbank Big Condensed is replaced by Bahnschrift Bold Condensed.
- Values in chips and the game title keep their own case: Playnite's `StringToUpperCaseConverter` returns an empty string for non-string content, and `PART_TextDisplayName` is filled from code.
- The lobby's 3D scene is the game's background art under a navy wash; no animated scene, no rarity gradients.
- The game shows player level, V-Bucks and an avatar on the navbar's right; here that spot holds Playnite's search, filter and notifications.
- Icons were converted on Linux (paths shifted by a script, PNGs rasterized in Chromium) because `render-icons.ps1` needs WPF; `icons.json` reproduces them on Windows.

## Not verified yet

- Motion in Playnite: PLAY hover (pop, flash, halo breathing, leave while pressed), the tile ring and zoom, the cover buttons at 125% and 150%, the empty page in both overviews, the rounded tile mask with the new animated content inside its bitmap cache (any dark seams at the corners), the banner foot against the translucent page, ThemeModifier recolour of the halo, ring and plates.
- Bahnschrift's condensed bold instance is picked by WPF from `FontWeight="Bold"` + `FontStretch="Condensed"`; if WPF falls back to the regular width, tabs and titles will be wider than designed.
- The rounded cover mask (VisualBrush bound to the tile size) at large zoom levels and with "Show grid item background" on.
- The slanted rail plate with add-on sidebar items that bring their own icon sizes.
- Real screenshots: `.\scripts\take-screenshots.ps1 -Extension dropzone` on Windows (the cloud session only has the HTML mockup in `art/`).
