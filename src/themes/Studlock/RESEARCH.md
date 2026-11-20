# Studlock — Reference Research

Reference inspiration: **LEGO Party!** (SMG Studio & Friends, 2025, Console & PC).
Primary source gallery: [Game UI Database — LEGO Party! (id=2468)](https://www.gameuidatabase.com/gameData.php?id=2468) — 92 screens across 8 categories (Title and Settings, Modals and Text, Game States, Stats and Resources, Information & Extras, Meta-Game Features, Online Play, HUD and Overlays).

## Captured Reference Screens

| Surface | Game UI Database URL | Key UI Takeaways |
| --- | --- | --- |
| Title Screen (`LET'S PARTY!`) | `https://www.gameuidatabase.com/uploads/LEGO-Party08132026-055328-58736.jpg` | Electric violet stage spotlights, bold canary-yellow pill CTA (`#FFE429`) with vertical brick-joint seams, golden black-outlined triangle pointer (`▶`), heavy bold-italic outlined display caps, bottom-right dark controller-prompt pill (`#292B28`). |
| Settings: Display / Video | `https://www.gameuidatabase.com/uploads/LEGO-Party08132026-055342-35890.jpg` | Matte dark charcoal molded ABS baseplate wall (`#2F2F2F`) with side stud columns; top-center **studded violet trapezoid header** (`#61459A`); horizontal segmented icon tab bar (`#C6CBCE` idle, `#FFE421` active); recessed channel with **cerulean blue segmented brick section headers** (`#3199CC`, `DISPLAY`, `GRAPHICS`); crisp rows turning solid `#FFE421` when selected; **molded circular stud row** separating sections; **Technic axle vertical scrollbar** (rod `#7E8387` + grooved pill thumb `#C2C7CA`); **notched white Technic collar slider** (`Resolution Scaling`); dark charcoal tooltip card (`#373737`) capped by a solid `#FFE421` yellow plate. |
| Settings: Controls / Bindings | `https://www.gameuidatabase.com/uploads/LEGO-Party08132026-055344-23238.jpg` | Confirms consistent Technic axle scrollbar, circular Xbox face-button prompt pills (`A` green, `X` blue, `B` red, `Y` yellow), stud-row dividers, and bright yellow selected control rows. |
| Pause Menu (`P1 • PAUSE`) | `https://www.gameuidatabase.com/uploads/LEGO-Party08132026-062700-94622.jpg` | Studded violet top trapezoid with P1 red dot (`#F53737`), stacked brick-seamed buttons (`CONTINUE`, `QUIT CHALLENGE ZONE`, `SETTINGS`, `HELP`), canary-yellow active focus (`#FFE429`) + floating black-outlined golden `▶` cursor (`#EFAF07`), cool grey idle tiles (`#C6CBCD`), dark prompt footer. |
| Confirmation Modal (`LEAVE PARTY?`) | `https://www.gameuidatabase.com/uploads/LEGO-Party08132026-063335-33632.jpg` | **45° chamfered cerulean brick-built outer frame (`#3196CA`)** with visible interlocking 1×2 brick mortar lines, dark charcoal overhanging title slab (`#373737`), clean white brick-seamed body (`#F6F5F3`), canary-yellow primary button (`LEAVE`) with golden `▶` cursor + cool-grey secondary button (`CANCEL`). |
| Wardrobe (`My Minifigures`) | `https://www.gameuidatabase.com/gameData.php?id=2468` (Change Skin or Accessory) | Rounded cerulean brick outer frame (`#3197C8`) with dark navy-slate header pill (`#374164`), dark charcoal square grid cells (`#212320`), **solid canary-yellow selected frame (`#FAD901`) with white inner keyline & top golden `▼` cursor**, **equipped bright green border + circular white-on-green checkmark badge (`#35D45A`)**, and **bright aqua-cyan `!` notification badge (`#01FBFB`)**. |
| Tutorials & Help Guide | `https://www.gameuidatabase.com/uploads/LEGO-Party08132026-060202-40245.jpg` | Physical instruction-booklet layout: dark top header strip, **vertical purple studded spine (`#62499B`)**, cerulean active topic header (`#3196C8`), bright yellow focused topic with inward triangle cursor, white ruled booklet content sheet with segmented cerulean banner (`#288FBE`), and tan stacked-brick page edge (`#E5D197`). |
| Mode Select (`LET'S PARTY!`) | `https://www.gameuidatabase.com/gameData.php?id=2468` (Mode & Screen Select) | Cerulean brick wall, rounded modular cards with dark charcoal ribbon banners (`LOCAL PLAY`, `HOST GAME`, `JOIN GAME`), active card shifting to solid canary yellow with top golden `▼` cursor, crisp black-outlined vector icons. |
| Standings / Leaderboards | `https://www.gameuidatabase.com/uploads/LEGO-Party08132026-063118-73985.jpg` | 3D beveled plastic rank cubes (`1ST` Red, `2ND` Yellow/Green, `4TH` Blue), dark player name ribbons, Golden 2×2 Brick and Silver 1×1 Stud collectible icons with crisp cartoon black outlines. |
| Gameplay HUD: Player Strip & Timer | `https://www.gameuidatabase.com/uploads/LEGO-Party08132026-063138-81343.jpg` & `.../LEGO-Party08132026-063124-81876.jpg` | 4-player color set (P1 Red `#CE3F3E`, P2 Blue `#2D6BC5`, P3 Yellow `#F2C632`, P4 Green `#27A43F`); **full-width segmented vertical-brick yellow timer bar** (`#E6BD15`) over a grooved dark-grey notched track (`#585959`); Power-Up turquoise-mint frame (`#8FE8E8`) with dark header and yellow selected row. |
| Loading Screen | `https://www.gameuidatabase.com/uploads/LEGO-Party08132026-062924-64185.jpg` | Dark matte interlocking LEGO tile wall (`#221C26`) washed with subtle electric violet (`#492C64`) and cyan (`#1B516A`) rim light, centered tumbling Golden 2×2 Brick (`#BD8033` / `#F5CD5E`). |

## Measured Palette (Median RGB Samples)

| Role in Source | Sampled Hex | Studlock Token & Contrast Notes |
| --- | --- | --- |
| Dark matte ABS baseplate wall | `#2F2F2F` / `#221C26` | `--sl-baseplate: #222427`, `--sl-canvas: #27292D` (calm matte graphite baseplate so cover art pops cleanly) |
| Raised ABS brick panel / tooltip charcoal | `#373737` / `#373538` | `--sl-surface: #2F3237`, `--sl-surface-raised: #383B41`, `--sl-surface-deep: #1B1D20` |
| ABS ink black outlines & shadows | `#17181A` / `#212320` | `--sl-ink: #161719` (13.85:1 on Canary Yellow `#FFE421`) |
| Crisp white molded plastic & body text | `#FFFFFF` / `#F6F5F3` | `--sl-white: #F5F6F8` (13.85:1 on `#25272A`), `--sl-muted: #B2B8C2` (7.4:1 on `#25272A`) |
| Cool ABS light-grey tile / Technic thumb | `#C6CBCE` / `#B6BABD` | `--sl-brick-grey: #C4C9CE`, `--sl-axle: #7C828A` |
| Bright Canary Brick Yellow (focus / CTA / tab) | `#FFE421` / `#FFE429` | `--sl-yellow: #FFE421`, hover `--sl-yellow-lit: #FFF064`, pressed/lip `--sl-yellow-deep: #D9B700`, pointer `--sl-cursor-gold: #F2B600` |
| Studded Stage Violet (header trapezoid & spine) | `#61459A` / `#62499B` | `--sl-violet: #61459A` (7.43:1 with white), deep `--sl-violet-deep: #4A3379`, lit `--sl-violet-lit: #7A5CB8` |
| Chamfered Cerulean Brick Blue (frames & headers) | `#3196CA` / `#3199CC` | `--sl-cerulean: #2B8FC4`, header band `--sl-cerulean-band: #2279A8` (4.9:1 with white), bright trim `--sl-cerulean-lit: #4BB4E6` |
| Wardrobe Equipped Green / P4 Green (Running) | `#35D45A` / `#27A43F` | `--sl-green-run: #198840` (4.53:1 un-scrimmed with white; 6.1–9.2:1 with RunningBreath scrim), bright badge `--sl-green-bright: #2CC856` |
| Wardrobe New `!` Aqua-Cyan (Filter Active / Notif) | `#01FBFB` / `#8FE8E8` | `--sl-aqua: #12DCE0` (8.8:1 on dark baseplate; unmistakably distinct from yellow, green, cerulean, violet, and red) |
| Classic Toybox Brick Red (Danger / Exit / Close) | `#BC000D` / `#CE3F3E` / `#F53737` | `--sl-red: #C9242B` (5.57:1 with white), bright rim `--sl-red-lit: #E63940` |

## Typography Analysis

- **Source faces**: Clean geometric toybox grotesk (LEGO's Cera Pro lineage — circular `o`, wide geometric proportions, clean tabular numerals for `2560x1440` and `084`) for settings labels, descriptions, and metadata; ultra-heavy bold-italic rounded-geometric uppercase (`SETTINGS (VIDEO)`, `CONTINUE`, `LEAVE`, `DISPLAY`) for banners, CTAs, and section headers.
- **Bundled open stand-ins (`src/Typography/`)**:
  - **Body & UI (`FontFamily`)**: **Sora** (`Regular`, `Medium`, `SemiBold`, `Bold`; SIL OFL 1.1) with `Segoe UI` fallback — crisp geometric wide proportions and clean numerals matching the Settings and Help screens.
  - **Headings & CTAs (`HeadingFontFamily`)**: **Nunito** (`Bold`, `ExtraBold`, `Black`; SIL OFL 1.1) with `Segoe UI` fallback — chunky friendly display weight that carries bold-italic arcade punch on banners, Play, and section strips.
  - **Shortcuts & Monospace (`MonospaceFontFamily`)**: `Consolas` (Windows native; drawn via `Cascadia Mono` in previews).

## Interface Parts & Motion

- **Modular brick-joint seams**: Every horizontal plate (buttons, section bars, focus rows, tabs) shows subtle vertical brick-joint lines dividing it into interlocking ABS segments, plus a crisp `1px` lit top bevel and `2–3px` darker bottom plastic lip.
- **Stud grids & stud dividers**: Molded circular studs appear in sparse structural zones (Settings wall borders, violet header trapezoid flanges, purple booklet spine, and the horizontal stud row separating `DISPLAY` and `GRAPHICS`).
- **Golden triangle cursor (`▶` / `▼`)**: Floating black-outlined amber-yellow triangle pointing into the active focus row (left edge) or active card/cover (top edge).
- **Technic axle controls**: Vertical scrollbar modeled as a grooved cylindrical Technic axle with a pill-shaped gripped brick thumb; horizontal slider modeled as a slotted Technic rail with a notched white collar thumb.
- **Motion personality**: Tactile ABS plastic snap — crisp, springy click-in (`BackEase` `Amplitude="0.16–0.22"` on selections, cover lifts, and cover hover buttons; fast `110–160ms` entrances, smooth `220–280ms` `CubicEase` exits with `FillBehavior="Stop"`), segmented brick-tick loading sweeps echoing the Minigame Timer Bar (`1.6s` cycle).
