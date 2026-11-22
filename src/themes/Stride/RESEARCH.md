# Stride — Mirror's Edge (2008 + Catalyst) Reference Research

Unofficial fan theme research for **Stride**, rebuilt around the authentic tempered ice-blue glass surfaces, velvety inner shadows, blazing red vertical pillar, glossy charcoal selection bars, red-thumb/blue-track scrollbars, and oblique glass-etched typography of **Mirror's Edge (2008/2009, Game UI Database `id=815`)** combined with **Mirror's Edge Catalyst (2016, `id=181` & Interface In Game)**.

## 1. Sources & Captures Examined

- **User-supplied Mirror's Edge (2008/2009) captures from Game UI Database (`https://www.gameuidatabase.com/gameData.php?id=815`)**:
  1. `EXTRAS / UNLOCKABLES` (Artwork & Videos tabs) — sunlit glacial sky-mist backdrop (`#EAEFF5`) with white-and-blue skyscraper skyline along the bottom edge; tempered ice-blue glass card (`#F8FCFF` -> `#E8F2FE` -> `#E3EFFF`) with velvety cool-blue 4-edge inner shadow and `1px` steel-blue border; raised bright-white active folder tab (`ARTWORK` / `VIDEOS`) vs recessed ice-blue inactive tabs; glossy vertical charcoal-glass selected row (`#747577` -> `#515254`) with pure white text; chunky blazing red `+` mark beside active items; airy italic uppercase header (`EXTRAS UNLOCKABLES`) with crisp cool-steel etched shadow.
  2. `RACE / TIME TRIAL ONLINE` — recessed ice-blue glass `SELECT COURSE` listbox with alternating snow-white (`#F9FDFF`) and pale ice-blue (`#D4DDEC`) rows, glossy charcoal-glass selected `EDGE` row (`#76767A` -> `#525253`), **blazing Mirror's Edge Red scrollbar thumb (`#FF1F03`) on a translucent steel-blue glass track (`#8598C3`)**, and tabular `00:35:30` / `01:10:00` right-side stats.
  3. `OPTIONS / VIDEO` — frosted ice-blue glass card (`#EDF6FF` -> `#E2EEFE`) with velvety 4-edge inner shadow; active red uppercase label (`BRIGHTNESS`) vs steel-blue inactive label (`CONTRAST`); steel-blue glass slider tracks (`#2F6291` active / `#7597B5` inactive) with **blazing red rectangular thumb (`#FC1F0B`)**.
  4. `STORY` Main Menu — full-height **blazing Mirror's Edge Red vertical pillar (`#EC1A01`)** on the left with the selected item (`NEW GAME`) inverting to a **stark pure white horizontal slab (`#FFFFFF`) with bold italic black ink (`#1C252D`)**, plus thin blazing red vertical architectural struts (`#E82104`) slicing across the sunlit white skyline.
  5. `LOADING` — stark sunlit white horizon with spinning dark architectural ring, italic `LOADING` header, and clean mixed-case Helvetica body copy.
- **Mirror's Edge Catalyst captures (`https://www.gameuidatabase.com/gameData.php?id=181` & `interfaceingame.com`)**:
  - Split-pane crimson-red + frosted cool-white glass architecture, micro-grid curtain-wall texture on red panels, asymmetric bottom-right rounded navigation pills (`0,0,7,0`), and crisp slate/crimson contrast discipline.

## 2. Measured Palette & WCAG Contrast Verification

| Role | Source Reference | Token | Hex | Contrast |
| --- | --- | --- | --- | --- |
| Glacial sky-mist canvas | `id=815` sky backdrop `#EAEFF5` | `--me-sky-bg` | `#EBF2FA` | Base canvas |
| Tempered ice-blue glass gradient | `id=815` UNLOCKABLES / VIDEO card | `--me-glass-top/mid/bot` | `#FAFDFF` -> `#ECF4FE` -> `#DCEBFC` | Glass panels, popups, inputs, dossier |
| Velvety 4-edge glass inner shadow | `id=815` inner edge bevel (`glass-inset.png`) | `--me-glass-inset` | `#6B8EB8` | Recolorable 9-slice `OpacityMask` |
| Steel-blue outer glass rim | `id=815` card rim | `--me-rim` / `--me-rim-strong` | `#7B9ABA` / `#53769C` | Crisp `1px` architectural glass borders |
| Primary & steel-blue ink | `id=815` prose & tab captions | `--me-ink` / `--me-steel-ink` | `#111821` / `#345476` | `15.5:1` / `6.7:1` on `#ECF4FE` |
| Glossy charcoal-glass selection bar | `id=815` `Faith sketches` / `EDGE` bar | `--me-charcoal-top/mid/bot` | `#6D7177` -> `#4B4F55` -> `#31353B` | `#FFFFFF` text `7.8:1` on mid |
| Blazing Mirror's Edge Red pillar & Play | `id=815` `STORY` pillar `#EC1A01` | `--me-crimson-top/bot` | `#E81B08` -> `#DC1406` -> `#BE0F03` | `#FFFFFF` text `5.14:1`–`6.52:1` |
| Red scrollbar / slider thumb & blue track | `id=815` `TIME TRIAL` & `OPTIONS VIDEO` | `--me-crimson-top` / `--me-track-blue` | `#E81B08` on `#859EC4` / `#2F6291` | Unmistakable Mirror's Edge signature |
| Rooftop Sky Cerulean (Running) | Mirror's Edge rooftop sky & division blue | `--me-sky` / `--me-sky-bright` | `#0068A3` / `#00A6ED` | `#FFFFFF` text `5.98:1` (distinct from red) |
| Runner Bag Signal Amber | Mirror's Edge collectible bags | `--me-amber` / `--me-amber-text` | `#D98600` / `#945B00` | Filter `+` pip & mixed score |

## 3. Typography & Open Font Stand-Ins

- **Display Headers (`HeadingFontFamily`)**: `./Typography/#Sora, Sora, Segoe UI` (bundled static SIL OFL `Regular`, `SemiBold`, `Bold`), set in **refined `Italic` uppercase with a subtle cool-steel glass-etched offset** on game titles & dialog mastheads — capturing Mirror's Edge 2008's iconic oblique airy headers (`UNLOCKABLES`, `TIME TRIAL ONLINE`, `STORY`) fused with Catalyst's wide geometric letterforms.
- **Body & UI (`FontFamily`)**: `./Typography/#Barlow, Barlow, Segoe UI` (bundled static SIL OFL `Regular`, `Medium`, `SemiBold`, `Bold`) for crisp Helvetica-lineage prose and list readability.
- **Monospace (`MonospaceFontFamily`)**: `Consolas` (previews render bundled `Cascadia Mono`) for tabular time-trial scores and keyboard shortcuts.
