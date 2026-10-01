# Overworld — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) after the **Minecraft Java Edition title screen and its menus** (the 1.20.5+ widget set: stone buttons, black text fields, dark tab bar, outlined list selection, the violet item tooltip, the yellow splash text), with **Bedrock's green Play button** for the one primary action. Dark only. Minimal on purpose: no dirt or stone textures, no panorama of its own, no logo; the widget shapes, outlines and colors carry the look, and the library shows each game's own art blurred behind the menus, as the game blurs its panorama. Unofficial and standalone: every file it ships lives in this folder, no Mojang asset is in it (`info/NOTICE-overworld.txt`). Resource keys are the shared vocabulary; the game's own names stay in `tokens.css`.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

**Intended layout: the sidebar on the left** (Playnite's default; repo rule): the title screen's icon buttons stacked into a 64px rail. Right mirrors it; top and bottom lay the same stone buttons out in a row with titles.

## Sources

Mojang publishes no design system. Values were read from the game itself; `tokens.css` tags each one:

| Tag | What | Where |
|-----|------|-------|
| `[px]` | Every widget color, decoded pixel by pixel: `widget/button` (outline `#000`, highlight `#AAAAAA`, fill `#6F6F6F`, shadow `#565656`), `button_highlighted` (outline `#FFF`, fill `#757575`), `button_disabled` (`#2C2C2C`), `slider`, `slider_handle` (8x20), `text_field` (`#000`, edge `#A0A0A0`, focused `#FFF`), `checkbox` (17x17), `tab`, `scroller` (`#C0C0C0`), `menu_background` (black 25%), `menu_list_background` (black 44%), `header_separator` / `footer_separator` (white 20% over black 75%), `popup/background` | `assets/minecraft/textures/gui/sprites/widget/*.png` of 1.21 (InventivetalentDev/minecraft-assets, branch 1.21). Read for values only; nothing is shipped. |
| `[src]` | Text colors (button `#FFF` / `#A0A0A0`, field `#E0E0E0`, hint `#808080`), text shadow (color x 0.25, offset 1,1), list selection (white outline focused, `#808080` unfocused, black fill), tooltip (`0xF0100010`, frame `0x505000FF` to `0x5028007F`), splash (`0xFFFF00`, -20 degrees), title screen layout (200x20 buttons, 24px pitch, 20x20 icon buttons), tab underline | The 1.21.1 client (piston-meta.mojang.com) decompiled with Mojang's published mappings: `TitleScreen`, `EditBox`, `AbstractSelectionList`, `TooltipRenderUtil`, `SplashRenderer`, `TabButton`, `Font`. |
| `[br]` | Play button green `#3C8527`, ramp `#52A535` / `#2A641C` | Bedrock Ore UI palette (Mojang/bedrock-samples `textures/ui` for the legacy buttons, approximate). |
| `[eye]` | Window, rail and library surfaces, list background flattened for popups, row hover veil, XP green | Chosen between sourced values. |
| Icons | Original 16x16 pixel artwork, filled squares only | `art/icons.py` writes the geometries into `src/Media.xaml`. Menu icons stay Playnite's glyphs. MIT with the repo. |
| Tile icon | `art/mark.svg` (original isometric block), default orange | `scripts/render-addon-icon.py` |
| Font | Monocraft (OFL 1.1) suggested, not bundled; Minecraftia is personal-use only, so only named | |
| Playnite | Every file starts from the Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`); game page and side panels follow the shared skeleton | |

Sizes are the game's at **GUI scale 2**: 1 sprite pixel = 2px (outlines, bevel edges), buttons 40px tall.

## Tokens

Type: body `Segoe UI` (readable at length); `HeadingFontFamily` `Monocraft, Minecraftia, Minecraft, Consolas` for buttons, tabs, titles and captions. Sizes 12 / 14 / 16 / 20 / 32. Corners are square (`ControlCornerRadius` 0). Inputs have a 2px edge (`InputBorderThickness`).

Key this theme added to `scripts/data/theme-keys.json`: **`TextShadowBrush`** (the game's label shadow). It reuses Ancient's `BevelLightBrush`, `BevelShadowBrush` and `BevelTemplate` keys with its own drawing.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | Behavior |
|------|----------|
| `Views/Sidebar.xaml` | **Left (intended):** a 44px compact rail on the darkest surface, closed on the library side by a separator pair (light, then dark). Main menu button at the top: a 44x40 stone button with the pixel menu icon. A short separator, then the items. **Right:** mirrored. **Top/bottom (fallback):** the same buttons in a row; 146px clear for the caption buttons at the top. |
| `CustomControls/SidebarItem.xaml` | **Rails:** a 32x32 stone icon button (like the title screen's Language and Accessibility buttons) in a 44x40 cell; hover and current draw the highlighted sprite (white outline, lighter fill); the current one also has a 2px white marker on the outer edge. Title as tooltip. **Top/bottom:** stone buttons with the title in the pixel font, at least 120px wide. |
| `Views/TopPanel.xaml` | The tab strip: 52px of black at 86% over the art, a separator pair underneath; view, group, sort and filter icons at the left in the inactive grey (white on hover; on = white with the selected tab's 2px underline); notifications and a 300px text field at the right. Keeps 146px clear for the caption buttons when it is the topmost bar. |
| `Views/Library.xaml` | The game's background art fills the whole library layer, the strip included, box-blurred (radius 14), faded toward the bottom, dimmed by the menu veil and a vignette: the 1.20.5+ blurred panorama. |
| `DerivedStyles/MainWindowStyle.xaml` | Caption buttons 46x40, pixel icons in the inactive grey, centred on the 52px strip; dark red close hover; 1px black window edge. |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | Playnite's panels on the list background so they read over the art. |

## Game page

Follows the shared skeleton, generated by `art/overview.py` (edit it, then rerun). Details view: 150px of art above the title; title in the pixel font at 38px, white with a 3px text shadow (a second TextBlock bound to `PART_TextDisplayName`); beside it the **splash**: the game's completion status plus "!" in yellow, rotated -20 degrees, hidden when the game has none; a separator pair; Play 220x48 (green stone button) beside More and Edit (stone buttons). The metadata pane is a list panel with a 1px black outline, groups split by separators, captions beside values. Grid panel: title at `FontSizeLargest`, the splash under it, Play 44px tall, captions above values.

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations

- **Not the game's font.** Mojangles is Mojang's. The heading stack asks for Monocraft (OFL), Minecraftia or a font named Minecraft, else Consolas; body text stays Segoe UI so descriptions read well.
- **Text shadow** is a second TextBlock behind string labels (buttons, Play, title, splash, top/bottom sidebar labels). Labels that are not strings (icons, templates) have none.
- **No textures:** the fill noise of the button sprite, dirt backgrounds and the panorama are left out; the library shows the game's own art, blurred.
- **Splash** does not pulse (a forever animation would keep WPF rendering every frame) and shows the completion status instead of a random phrase.
- **No pressed state** in the game; buttons keep the highlighted look while pressed (Play darkens one step).
- **Radio buttons** do not exist in the game; they reuse the checkbox sprite.
- **Tooltip corners:** the game's notched corners (the panel stops one pixel short at the corners) are square here.
- Playnite templates this theme does not replace (DataGrid, DatePicker, TreeView, notification panel, add-on views) take the colors only.

## Not verified yet

**Never loaded in Playnite.** Built on Linux: `build-theme.ps1` and `validate-extension.ps1` pass (static checks), but WPF never parsed it. `art/preview-grid.png` is an HTML replica of the grid view drawn with the same token values and sizes and rendered in Chromium (Pixelify Sans stands in for the pixel font), not a Playnite capture. Take real screenshots (`info/screenshots/`) before a database PR.

First run, most likely to need a fix: the `BlurEffect` on the library art (cost on large windows, and the blur pulling in transparent edges); the text-shadow DataTemplates in Button and PlayButton (access keys, wrapped labels); `BevelTemplate` at small heights (dialog buttons under 24px); the splash binding (`Game.CompletionStatus.Name`) and its rotation clipping inside the header; the ComboBox editable mode on the stone plate; and every `[eye]` value in `tokens.css`.
