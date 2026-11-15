# Rumpus — research & sources

## Sources

| What | Where (package, version, file) |
|------|--------------------------------|
| Tokens | Measured by hand. The game publishes none. `src/tokens.css` holds this theme's own names (`rp-*`) for the values below. |
| Components | 41 menu and HUD captures of Party Animals (2023) on Game UI Database, `gameData.php?id=1890`, read in a browser pane at 1920x1080. Nothing was downloaded, saved or shipped; colors were sampled from the decoded images in the page (most common color per region). Stills only: no video, so motion is designed, not measured. |
| Icons | Lucide 1.49.0 strokes (ISC, `info/LICENSE-lucide.txt`), drawn 2.5px thick with round caps to echo the game's chunky glyphs. The game's own icons (bone, paw, cash) are solid and proprietary; the theme draws its own bone and paw. |
| Fonts | Nunito Regular, Bold, ExtraBold and Black (SIL OFL 1.1, Nunito Project Authors) stand in for the game's proprietary heavy rounded face; Patrick Hand (OFL) stands in for the chalkboard handwriting. Both bundled in `src/Typography/` with `OFL.txt`. |

## What the captures show

Capture numbers are positions on the page (0 = first thumbnail).

| Part | Where | What it is |
|------|-------|------------|
| Page | 0-7, 12, 26-36 | A saturated orange backdrop, lighter at the top (`#F2A543`) than the bottom (`#EA983C`), with soft pale sweeps. Menus float on it as cream and butter panels. |
| Menu panel | 4-7 (Settings), 35 (Custom Game) | Butter body (`#FCE19A`), a yellow header band (`#FBD35E`), 28px outer corners, a burnt orange rim (`#D38C37`), a light butter edge on top. The Custom Game card is tilted about 1.5 degrees. |
| Option row | 4-7 | Cream (`#FBEECE`) pill row, about 20px radius, lit top and a darker lip below. Title in warm grey-brown (`#645B57`) heavy rounded type, a lighter sub caption (`#B8B2A8`), the control at the right. |
| Secondary button | 4-7 (SWITCH, SUBMIT, INSPECT, CANCEL, RESET) | Cream pill with a tan rim, uppercase heavy type in dusty blue (`#6E8DBB`). |
| Primary button | 4-7 (APPLY), 35 (CREATE), 35 (QUICK JOIN) | APPLY is yellow (`#FBE777`) with orange type. QUICK JOIN and START MATCH are lime green (`#B9F65C` to `#A9EB4F`) with dark green type and a chevron. All have a lip. |
| Stepper | 4 (Network Stability) | Cream track, round arrow buttons at both ends, the value in blue. |
| Info bar | 4 (customer service id) | A gold bar (`#EDC971`) with cream type, an inset look. |
| Bottom bar | 0-8, 26-36 | A butter-yellow bar (`#F3D16D`) along the bottom with cream pills on it: shop with an `N` badge, bone currency count, cash count; the player's avatar with a green level bar (`#7AC827`) at the right. |
| Badge | 0 (`N`) | Small coral round badge (`#F2694A`) on the pill's corner. |
| Chalkboard | 3, 37, 38 | Near black board (`#28292B` to `#363739`), chalk drawings and chalk white type (`#EDEAE2`), handwritten notes. |
| Sticky note | 38 | Pale yellow note (`#FFDE95`) with a tape strip on top, handwriting in brown. |
| Victory ribbon | 16 | Slanted yellow plank with cream type and a brown outline. |
| Sunburst | 32 | Rays from the center on a yellow-orange field, confetti falling. |
| Forum card | 27 | Indigo panel (`#3B3F9E`) with cream title type. |
| Ping bars | 35 | Three or four green bars (`#7AC827`) of rising height. |

## Measured values

| Value | Where |
|-------|-------|
| `#EA983C` / `#F2A543` / `#F4BA51` | Page, top to bottom (0) |
| `#FBEECE`, `#FDF1D2` | Option row and its lit top (4, 35) |
| `#FCE19A`, `#F9E1A4`, `#F7DC96` | Panel body (4, 35) |
| `#FBD35E`, `#FBD462` | Panel header, header buttons (35) |
| `#FBE777` | APPLY (4) |
| `#B9F65C` | QUICK JOIN (35) |
| `#7AC827` | Ping bars, level bar (4, 35) |
| `#645B57`, `#B8B2A8` | Title text and sub caption (4) |
| `#6E8DBB`, `#748DB8` | Secondary button type (4) |
| `#EDC971` | Info bar (4) |
| `#F3D16D`, `#FFF2D3` | Bottom bar and its pills (0) |
| `#D38C37` | Orange rim and shadow tone (4) |
| `#28292B`, `#363739`, `#EDEAE2` | Chalkboard and chalk (37) |
| `#FFDE95`, `#FFD477` | Sticky note (38) |

## Where the theme departs from the captures

- The game's title ink `#645B57` is 3.7:1 on the orange page, so body text is `rp-ink` `#45382F` (5.2:1 on orange, 9.8:1 on cream). The game's sub captions (`#B8B2A8` on cream is 1.8:1) are too faint to read at 12px, so `rp-ink-muted` is `#665A50` (5.8:1 on cream).
- Secondary button type `#6E8DBB` on cream is 3.1:1, so text uses `#4A6A9C` (4.75:1); the original stays for decoration.
- The game sets every label in capitals. WPF cannot transform Playnite's strings, so titles keep their case.
- The game's menus are 3D rendered. The theme uses flat fills with a 2-4px lip layer instead; no `DropShadowEffect`.
- The game has no list or metadata screens at all; rows and cards reuse its option row and panel.
