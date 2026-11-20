# Cropmark — Reference Research

Source inspiration: **Marvel Tōkon: Fighting Souls** (developed by Arc System Works Co., Ltd.; published by Sony Interactive Entertainment Inc., 2026).

> Unofficial fan-theme research. No official game assets, trademarks, logos, or proprietary fonts are copied or redistributed. Every token, vector, and generated texture is independently authored from visual measurements.

## 1. Sources & Captures Inspected

Primary visual archive: [Game UI Database — Entry #2596](https://www.gameuidatabase.com/gameData.php?id=2596) (84 Overview captures + 13 HUD & Gameplay captures inspected).

| Screen | Reference URL | Key UI Elements Measured |
| --- | --- | --- |
| Title Screen | `uploads/Marvel-Tokon-Fighting-Souls11082026-023900-17001.jpg` | Bristol illustration paper sheet, non-photo blue registration border + crop ticks, sumi-e ink dry-brush splash, condensed bold italic prompt |
| Main Menu | `uploads/Marvel-Tokon-Fighting-Souls11082026-024003-96901.jpg` | Oversized cyan display headline behind 4-panel comic strip, slanted charcoal active bar (`EPISODE`) with oversized orange drop-cap, cream-framed button stack, News charcoal card, orange bookmark ribbon, monochrome circular key prompts |
| Options (Tabbed) | `uploads/Marvel-Tokon-Fighting-Souls11082026-024014-28372.jpg` | Top non-photo blue tab bar with `L1`/`R1` ink badges and `#81B7D5` active tab fill, 90° rotated vertical `OPTIONS` ink heading, asymmetric torn dark-charcoal backing paper behind crisp 1.5px ink table, textured orange marker active row (`#FC7716`) with bold italic ink label, minimalist bottom-edge charcoal slider bar, dashed blue fold spine |
| Pause Menu | `uploads/Marvel-Tokon-Fighting-Souls11082026-023951-16552.jpg` | Cyanotype blueprint wash (`#A3C3D8`) over gameplay, tilted cream tear-off notepad card with perforated vertical left edge, sharp ink `ITEM` table, orange marker selection band, ultra-heavy `PAUSE MENU` ink header |
| Confirmation Modal | `uploads/Marvel-Tokon-Fighting-Souls11082026-023903-32258.jpg` | Perforated tear-off sheet, margin production pencil scribbles, sharp `ITEM` Yes/No ink table, orange marker selected row |
| Character Select / Roster | `uploads/Marvel-Tokon-Fighting-Souls11082026-024438-66643.jpg` | Twin comic page trim/copy-area frames with `=|+|=` registration crosshairs, P1 orange (`#FE6D02`) vs P2 cyan (`#01A6FF`), role badge column, tilted orange-rimmed active portrait card, slanted cream nameplate with heavy ink text |
| Episode Select | `uploads/Marvel-Tokon-Fighting-Souls11082026-024050-98340.jpg` | Vertical comic issue strips with writer/artist production boxes at top, non-photo blue `PROGRESS` bar at foot, issue spine crimson (`#C11A21`), gold (`#FA9900`), emerald (`#049A40`) |
| Action Menu | `uploads/Marvel-Tokon-Fighting-Souls11082026-024549-37119.jpg` | Perforated left tear-off card, crisp `ITEM` header row, full-width marker-orange selection fill |
| Gameplay HUD | `uploads/Marvel-Tokon-Fighting-Souls11082026-024458-9542.jpg` | Skewed P1 orange (`#FF7335`) & P2 cyan (`#34B3FF`) vitals, assist lime (`#5EC64D`) pips, skewed `Punish!` teal callout banner (`#02B7A8`), gold/cyan super gauges |
| Results Screen | `uploads/Marvel-Tokon-Fighting-Souls11082026-024503-27355.jpg` | Cream ledger sheet with dashed blue horizontal dividers, sky-blue uppercase score labels, gold rating stars (`#FEC969`), ultra-heavy charcoal numerals |

## 2. Measured Color Palette & Role Mapping

Direct RGB pixel sampling from 1920x1080 captures, refined for >= 4.5:1 WCAG AA legibility across all Playnite text/surface pairs:

| Role | Sampled Source Hex | Theme Token (`tokens.css`) | Final Hex | Notes & Contrast |
| --- | --- | --- | --- | --- |
| Primary Bristol Paper | `#ECE2D6` / `#E9E1D4` | `--cm-paper` | `#ECE3D6` | Warm comic rag paper; main content, game page, list background |
| Elevated Cream Sheet | `#F1E9DC` | `--cm-paper-hi` | `#F5EFE5` | Popup tear-off cards, inputs, bright highlight surface |
| Recessed Board / Rail | `#E4DACB` | `--cm-paper-well` | `#E1D6C5` | Sidebar rail, recessed input wells, table column headers |
| Deep Paper Shadow | `#D6C9B5` | `--cm-paper-deep` | `#D4C6B1` | Hover washes, pressed neutral plates, metadata panel shadow |
| Warm Sumi-Olive Ink | `#2E3223` / `#393E31` | `--cm-ink` | `#26291F` | Primary text (11.64:1 on paper), 1.5px–2px comic panel borders |
| Deep Ink (On Accent) | `#242426` | `--cm-ink-deep` | `#1D2016` | Text on Marker Orange (6.30:1) and Active Tab Blue (7.61:1) |
| Construction Paper Backing | `#3F4032` | `--cm-charcoal` | `#2D3024` | Primary Play CTA slab (11.77:1 with `--cm-paper-hi`), backing planes |
| Secondary Charcoal Surface | `#474A3F` | `--cm-charcoal-hi` | `#3B3E31` | Play hover slab, backing shadow strip, dark keycap badges |
| Muted Pencil / Slate Ink | `#5C6050` | `--cm-ink-muted` | `#575B4D` | Secondary labels, captions, placeholders (5.49:1 on paper) |
| Comic Marker Orange | `#FC7716` / `#F76C07` | `--cm-orange` | `#FF7916` | Active row highlight, selection bar, P1 drop-cap, bookmark |
| Marker Orange Highlight | `#FF8C2C` | `--cm-orange-hi` | `#FF8F33` | Marker highlight sheen, hover state on selected items |
| Marker Orange Deep | `#E05A00` | `--cm-orange-deep` | `#D45500` | Pressed accent, dark border edge on orange tags |
| Non-Photo Sky Blue (Tab Fill) | `#81B7D5` | `--cm-blue-tab` | `#81B7D5` | Active tab plate, active view switch fill (7.61:1 with `--cm-ink-deep`) |
| Non-Photo Crop Guide Blue | `#8FBBD6` / `#9AC1D5` | `--cm-blue-guide` | `#6BA7CC` | Trim/copy-area registration hairlines, dashed fold rules, crop ticks |
| Faint Drafting Blue | `#B4D3E4` | `--cm-blue-faint` | `#A9CCE0` | Subtle margin blueprint lines, drafting grid |
| Blueprint Ink (Links / P2) | `#009FFF` | `--cm-blue-vivid` | `#008FE0` | P2 accent, hero framing glint, focus ring |
| Blueprint Link Text | — | `--cm-blue-link` | `#005F99` | High-contrast link text on Bristol paper (5.40:1 on `--cm-paper`) |
| Punish! Teal (Running) | `#02B7A8` | `--cm-punish` | `#00756B` | Dedicated `RunningIndicatorBrush` (distinct from charcoal Play, orange selection, blue tabs; 4.86:1 with `--cm-paper-hi`, rising to 6.9:1+ under dark scrim) |
| Punish! Teal Bright | `#02B7A8` | `--cm-punish-hi` | `#02B7A8` | Running scan highlight / bright trim |
| Issue Spine Crimson | `#C11A21` | `--cm-crimson` | `#C11A21` | Danger / Exit / Close button hover (5.34:1 with `--cm-paper-hi`) |
| Assist / Guard Emerald | `#5EC64D` / `#049A40` | `--cm-green` | `#1C8A42` | Positive ratings, check marks |
| Bookmark / Star Gold | `#FA9900` / `#FEC969` | `--cm-gold` | `#D98200` | Mixed ratings, warning, star pips |

## 3. Typography & Bundled Open Fonts

- **Display / Headings (`HeadingFontFamily`)**: `./Typography/#Anton, Anton, Bahnschrift, Segoe UI` — ultra-heavy compressed ALL-CAPS comic board titles (`OPTIONS`, `PAUSE MENU`, `MAIN MENU`, game display titles, Settings window title). Bundled static `Anton-Regular.ttf` (OFL-1.1, Latin + Cyrillic subset).
- **Menu / Section / Condensed UI (`CondensedFontFamily` / `Menu` & `PlayButton` & `List` accents)**: `./Typography/#Barlow Condensed, Barlow Condensed, Bahnschrift, Segoe UI` — matches the game's condensed bold table labels and **Bold Italic** active selection rows (`Button Settings (Battle)`, `Skip Basic Tutorial`). Bundled static `BarlowCondensed-SemiBold.ttf`, `BarlowCondensed-Bold.ttf`, `BarlowCondensed-BoldItalic.ttf` (OFL-1.1).
- **Body / Controls / Settings Tree (`FontFamily`)**: `Segoe UI` (Windows native; drawn via bundled `Selawik` in HTML previews per `scripts/data/fonts.json`) — matches the crisp humanist descriptions on the right of `OPTIONS` and inside `CONFIRMATION` modals.
- **Monospace / Keycodes (`MonospaceFontFamily`)**: `Consolas` (drawn via bundled `Cascadia Mono` in HTML previews).

## 4. Chrome, Plates, Geometry & Texture

- **0px Sharp Ink Panels**: Primary tables, buttons, and cards use `ControlCornerRadius = 0` (`CornerRadiusSmall = 0`, `CornerRadiusLarge = 2`, `CornerRadiusFull = 9999` for 1:1 circular key-prompt badges only).
- **Registration & Crop Architecture**:
  - `=|+|=` horizontal/vertical registration crosshairs along panel edges.
  - Non-photo blue (`#6BA7CC`) dashed fold rules (`StrokeDashArray="3,3"`) and double crop ticks (`||`).
  - Solid `1.5px–2px` warm charcoal ink frames (`#26291F`).
- **Torn Construction-Paper Backing**: In `OPTIONS`, the cream ink table sits on top of a slightly offset dark charcoal sheet (`#2D3024` / `#3B3E31`) with a subtly rough cut top-left/bottom-left edge.
- **Perforated Tear-Off Notepad Edge**: In `PAUSE MENU`, `CONFIRMATION`, and `ACTION MENU`, every floating sheet has a vertical dashed tear perforation line (`10px` from left edge) and crisp `ITEM` mini-header band.
- **Marker-Stroke Fill Texture**: Selected orange rows show subtle diagonal marker/dry-brush tooth texture (`marker-stroke.png` white alpha mask tinted via `OpacityMask` so ThemeModifier recolors it).
- **Paper Rag Grain**: Ultra-subtle Bristol illustration paper tooth (`paper-grain.png` at ~3–4% opacity in sparse chrome: title band, menus, metadata ledger, empty state; library list and cover backgrounds stay calm).
- **Scrollbars**: Styled as a minimalist comic drafting ruler with fine vertical tick marks on the track and a crisp charcoal ink thumb.
- **Sliders**: Modeled directly on `OPTIONS` (`Master Volume` / `System Voice Type`) — a crisp bottom-aligned ink fill bar inside a clean horizontal track with a square notched ink thumb.

## 5. Iconography & Motion Language

- **Icon Style**: Crisp `1.75px–2px` geometric comic ink strokes with sharp mitered corners, occasional bold cut notches, and zero soft blurs. All `Icon<Role>` geometries are bespoke vector paths authored in `Media.xaml`; Playnite's 24 context-menu PNGs are rendered via `icons.json` in `--cm-ink`.
- **Motion Personality**: Punchy, tactile comic-panel animation (ArcSys snap) — fast crisp entrances (`110ms` `CubicEase` out), decisive selection locks (`170ms` with subtle `BackEase` `0.18` on marker/drop-cap/cover-button entrances), and clean `240ms` decays (`FillBehavior="Stop"`). No generic neon glow halos; depth comes from sliding paper planes, hard ink keylines, diagonal marker wipes, and crisp offset backing plates.
