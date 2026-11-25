# Henchwork — research & sources

## Sources

| What | Where (URL, version, license) |
|------|--------------------------------|
| Primary visual reference | [Game UI Database — Evil Genius 2: World Domination (`id=710`)](https://www.gameuidatabase.com/gameData.php?id=710) (Rebellion, 2021, PC keyboard/mouse, 100 captures at 1920×1080: title, difficulty and genius select, world map, pause/options, event log, overview stats, objectives, research, loading posters, build mode). Viewed in the browser and sampled with a canvas read-back; no captures are stored in the repo. |
| Typography (display and body) | `Barlow Condensed` Regular / Medium / SemiBold / Bold (SIL OFL 1.1, Jeremy Tribby; bundled from `scripts/fonts/barlowcondensed/` into `src/Typography/`). Stand-in for the game's narrow rounded hand-lettered UI sans (“SELECT GENIUS”, “EVENT LOG”, option rows) and the tall condensed caps of its wordmark. |
| Typography (odometer digits, shortcuts) | `Consolas` (Windows built-in; previews draw it with the bundled Cascadia Mono alias). Monospace keeps the odometer zeros aligned under the score digits. |
| Icons (`Icon<Role>`) | Original vector pictograms drawn for this theme in `src/Media.xaml`, in the source's chunky silhouette style (cream glyph, rounded ends, no outlines). No game icons are traced. |
| FX masks (`src/Images/fx/`) | `art/sprites.py` (Pillow + NumPy, fixed seed `710`): white alpha masks for the blueprint grid, the concentric-ring poster burst and the paper fibre. Tinted with `OpacityMask` in XAML and `-webkit-mask` in previews. |
| Baseline XAML | Playnite Default desktop theme (MIT, `info/LICENSE-Playnite.txt`); structural mechanics follow the repo's shared theme guide. |

## Measured palette

Sampled pixel values from the 1920×1080 captures (screen index on the GUIDB page in brackets).

| Swatch | Hex | Where | Henchwork role |
|--------|-----|-------|----------------|
| Map ocean / HUD ink | `#131D27`, `#0E1319`, `#14202C` | World map ocean corners, bottom HUD tray, letterbox bands [1, 3, 40] | `--hw-blueprint` window and content, `--hw-ink` deepest edge |
| Dark header band | `#1B2733` | “OPTIONS” / “GAMEPLAY OPTIONS” bands, scroll track `#1C2631` [13] | `--hw-hud` top bar, rail, section bands, scroll track |
| Console slate | `#2C4154`, `#2E4152`, `#2F4658` | Pause side panel, options body, event log, objective panel [13, 55, 81] | `--hw-slate` panels, popups, cards, buttons |
| Selected steel tab | `#ACBDC0` | Selected “OVERVIEW” tab plate with slate inset [55] | `--hw-steel` selected tab plate, scroll thumb hover |
| Mustard tile | `#EAC66A`, `#ECCC65`, `#EBC757` | Title tiles (Load Game, Options, Credits), pause buttons, Reset/Back [1, 13] | `--hw-mustard` selection, sidebar tiles, buttons |
| Mustard tape | `#F3CB47`, `#EAC445` | Skewed “SELECT DIFFICULTY” / “EVENT LOG” labels [3, 55] | `--hw-mustard-tape` headings, title band label |
| Gold plate shadow | `#9E803B`, `#B08C3D` | Nameplate bevel, manila tab edge [32] | `--hw-mustard-deep` tile under-edge, pressed |
| Cream pictogram | `#F5E7B8`, `#F6E8B8` | Icon tiles in options, pictograms on tiles [13] | `--hw-cream` glyphs on coloured tiles, selected tile face |
| Dossier paper | `#F3F0DC`, `#F8F6E6`, `#E0DDCE` | Ring-bound difficulty dossier, genius file pages [3, 32] | `--hw-paper` text colour, metadata dossier card |
| Go green | `#6EB22A`, `#66AA20` | “New Game” tile, RESUME, START / NEXT bars [1, 3, 13, 32] | `--hw-green` Play plate |
| Odometer lime | `#67D501` | Lit digits in the resource counters (`0,000,033,990`) [40] | `--hw-lime` score digits |
| Completed row | `#46674A` | Completed objective row wash [81] | `--hw-green-wash` positive wash |
| Quit orange | `#E16E3E`, `#DB6724`, `#D86219` | Quit tile, EXIT TO WINDOWS, GLOBAL OPERATIONS tab, alert triangle [1, 13, 55] | `--hw-orange` danger, Exit row, close plate |
| Badge red | `#D8352A` (approx.; deepened to `#C62E24` so cream digits pass) | “9+” notification circles on HUD tiles and objective tabs [40, 81] | `--hw-badge` filter-active mark |
| Scheme purple | `#674A9E`, lilac `#B399D8`, plum `#45365C` | Dossier header strips, difficulty tiles (selected = lilac), Rogues' Gallery tab [3, 55] | `--hw-purple` running / launching |

## Typography

- Labels and headings: narrow rounded sans in caps, slightly hand-drawn, white on dark or ink on mustard. Rows in mixed case, ~16px at 1080p.
- Wordmark: very tall condensed caps with a separate orange slab. Henchwork does not copy it; display caps use Barlow Condensed Bold.
- Numbers: odometer counters show every digit slot; unused leading zeros are dim slate (`#385068`-ish) and lit digits are lime.

## Shapes

- Square pictogram tiles with a 1–2px radius, flat fill, cream glyph centred, label under the glyph (title menu) [1].
- Skewed tape labels: a mustard strip at about −2°, ink caps, a darker underside edge [3, 32, 55].
- Tabs: flat coloured plates side by side; the selected one turns steel/cream and grows a slate inset frame [55, 81].
- Ring-bound dossier: cream page with spiral rings down the left edge, purple header strips with white caps, orange diamond bullets [3].
- Manila file stack with index tabs (ABILITIES / BIOGRAPHY) and slightly rotated pages behind [32].
- Red circle badges with white numbers on the top-right corner of tiles and tabs [40, 81].
- HUD tray: a trapezoid tab behind the tile row, a pill strip of resource counters below [40].
- Loading posters: tilted cream-bordered card with orange concentric rings around an eye [8].
- Objective rows: steel TV-monitor icon plates (screen + antenna stand); a finished row turns green [81].
- Scrollbars: thin dark track, mustard triangle arrows top and bottom, olive-mustard thumb [13, 55].

## Motion (observed in captures and gameplay footage conventions)

- Tiles pop on hover (scale up with a slight overshoot) and the picked tile stays enlarged and lighter [3, 32].
- Tape labels and panels slide in from the left edge.
- Loading reel spins; alert tiles pulse.

## Contrast

| Pair | Ratio |
|------|-------|
| `--hw-text` on `--hw-slate` | 9.2:1 |
| `--hw-text` on `--hw-slate-hi` (hover) | 7.3:1 |
| `--hw-text-muted` on `--hw-slate` | 5.8:1 |
| `--hw-text-dim` on `--hw-blueprint` | 5.4:1 (3.3:1 on slate, so dim text stays off slate) |
| `--hw-text-ink` on `--hw-mustard` | 9.9:1 |
| `--hw-text-ink` on `--hw-green` | 6.3:1 |
| `--hw-text-ink` on `--hw-orange` | 5.1:1 |
| `--hw-orange-text` on `--hw-slate` (Exit at rest) | 5.3:1 (`--hw-orange` itself is 3.3:1, fills only) |
| `--hw-text` on `--hw-purple` | 6.0:1 (ink on purple is 2.4:1: never) |
| `--hw-text` on `--hw-badge` | 5.0:1 |
| `--hw-lime` on `--hw-hud` | 8.0:1 |
| `--hw-text-ink` on `--hw-paper` | 14.2:1 |
