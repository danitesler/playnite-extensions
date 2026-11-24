# Arcfolio — Creative Brief

- **Ambition Mode:** `Showcase`
- **Source Inspiration:** *Metaphor: ReFantazio* (2024) — unofficial community fan theme (no game assets, trademarks, or copied logos).

## 1. Candidate Lenses (3 -> Pick 1)

1. **(a) Diegetic / Artifact — Illuminated Memorandum Tome**: Full cream-parchment book pages with sepia ink and stacked gilded spines.
   - *Dropped:* Overlaps visually with existing light paper/ledger themes (`Dewfield`, `Cropmark`, `Slipstream`) and misses Metaphor's true screen palette (even `Memorandum` uses a deep painted petrol-teal canvas with stark ivory paper tabs and expressive gouache strokes).
2. **(b) HUD / Telemetry — Overworld Exploration Overlay**: Translucent corner widgets (Mission countdown, Weather/Calendar, bottom-right HP/MP ribbons).
   - *Dropped:* Overworld HUD elements float over 3D scenes with no native surface grammar for dense desktop lists, metadata panes, or Settings windows.
3. **(c) Title, Pause & System Menu Architecture (SELECTED)**: The iconic painterly editorial UI of `Settings`, `Load`, `Equipment`, `Memorandum`, `Quest`, and `System Modal`.
   - *Why chosen & contrast with last 5 themes:* Completely distinct from `Starlane` (OLED black/yellow outlines), `Checkpost` (olive/pink border-booth papers), `Greenfield XP` (Luna Blue glossy chrome), `Silver 98` (Win98 gray bevels), and `Baylight 27` (macOS dark Liquid Glass). Delivers Metaphor's genuine triad — **deep painted verdigris-petrol canvas + stark chalk-ivory paper slips + sweeping carmine/teal gouache brushstrokes + architectural drafting compass arcs** — natively across every Playnite surface.

## 2. Source DNA (5 Measured Traits)

1. **Verdigris-Petrol & Burgundy Painted Canvas (`02_settings`, `11_memorandum`, `12_quest`)**: Deep cool petrol-teal ground (`#102224` / `#152C2F`) over obsidian ink chrome (`#081113` / `#0C191B`) with faint impasto texture (`canvas-wash.png`) and subtle burgundy anchor washes (`#421119`) — never generic charcoal.
2. **Distressed Chalk-White Vertical Spine (`02_settings`, `03_inventory`, `07_load`, `10_equipment`, `11_memorandum`)**: Hand-brushed `3px` chalk seam (`spine-line-v.png`) dividing the 44px sidebar rail, Settings section tree, metadata ledger, and popup menus.
3. **Expressive Gouache Brushstrokes (`01_title`, `02_settings`, `06_modal`, `07_load`, `10_equipment`, `12_quest`)**: Raw-bristle horizontal strokes (`brush-cta.png`, `brush-bar.png`) with crisp chalk baseline rules — **Carmine Rose-Crimson (`#C92446`)** for the Play CTA and Exit danger rows, **Verdigris Cyan-Teal (`#117E86`)** for selected list rows, Settings tree, and popup highlights, and **Royal Quest Gold (`#D6A618`)** for running game sweeps.
4. **Stark Chalk-Ivory Paper Slips (`02_settings`, `03_inventory`, `07_load`, `10_equipment`, `11_memorandum`)**: High-contrast `#F4F1EA` ivory plates with `#11181A` pitch-ink serif text for active view switches, active tabs, metadata chips (`Effect`/`Search`), `NO.01`-style score plaques, primary `OK`/`Save` buttons, and torn-edge tooltips (`paper-torn.png`).
5. **Renaissance Monumental Serif + Astrolabe Drafting Arcs (`01_title`, `04_codex`, `06_modal`, `13_status`)**: Bundled `Cinzel Bold` uppercase headings paired with crisp `Georgia` transitional serif body copy, accented by razor-thin translucent chalk compass circles and tangent diagonals (`drafting-arcs.png`).

## 3. Focal Hierarchy & Observed Source Translations

- **Hero Focal Pieces (2):**
  1. **Game-Page Header & Carmine Gouache Play Command**: Painterly dry-brush banner dissolve (`banner-dissolve.png`) with subtle drafting compass arcs, circular Archetype-bezel game icon, monumental `Cinzel Bold` title on a distressed chalk underline (`hairline-h.png`), and the expressive **Carmine Rose-Crimson brushstroke `PlayButton`** (`brush-cta.png`) that flares vivid carmine with a diagonal chalk slash and luminous baseline sweep on hover.
  2. **Settings Title Band & Teal Brushstroke Navigation**: Deep obsidian header painted with the `SYSTEM` modal teal-to-rose ink splash (`ink-splash.png`) + architectural compass arc + `Arcfolio` Astrolabe-Brush brand mark, over bare serif `TreeView` rows that ignite the `02_settings.png` **Verdigris Cyan-Teal gouache brushstroke** on selection.
- **6 Observed Source UI Translations (all traced to `RESEARCH.md`):**
  1. **`02_settings` Segmented Option Cells (`ON` / `Custom` / `High`)** -> Active top-bar view switches, checked toggles, and `TabItem` headers in stark chalk-ivory (`#F4F1EA`) with pitch ink and tiny carmine corner pip (`11_memorandum` `Nature` tab).
  2. **`03_inventory` / `10_equipment` Torn Paper Tooltip (`Fermis Ointment`)** -> `DefaultControls/ToolTip.xaml` as a stark chalk-ivory slip with `paper-torn.png` jagged bottom edge and dark serif ink.
  3. **`13_status` `PARAMETERS` Horizontal Gauge** -> `DefaultControls/ProgressBar.xaml`, `PART_ProgressGlobal`, and `DefaultControls/Slider.xaml` (dark track, chalk-white-to-cyan-teal bar, rotated ivory diamond thumb).
  4. **`12_quest` Rank Diamonds (`◇ ◆ ◇`) & Golden Brushstroke** -> `RunningIndicator` & `RunningActionIndicator` (Royal Quest Gold `#D6A618` sweeping dry-brush band + 3 stepping hollow/filled Rank diamonds).
  5. **`07_load` & `11_memorandum` Ruler Scrollbar** -> Ultra-slim pure chalk-white `ScrollBarThumb` gliding inside a hairline vertical drafting rule with top/bottom serif cap ticks.
  6. **`06_modal` Teal-to-Rose Ink Splash & Slash** -> `EmptyGameTemplate` (`LOCErrorNoGameSelected`) and `StandardWindowStyle` title band crest.

## 4. Material & FX Plan (`art/sprites.py` -> `src/Images/fx/*.png`)

Flat CSS/XAML rectangles cannot capture Metaphor's dry-brush bristle ends, distressed chalk seams, ink splatters, or torn parchment edges. Author a deterministic Python `Pillow` + `NumPy` generator (`art/sprites.py`, fixed seed `1970`) producing pure-white (`255, 255, 255`) RGBA alpha masks shared by HTML previews (`-webkit-mask`) and WPF (`OpacityMask` via `Local*` brushes):

- `brush-cta.png` (512×96): Expressive raw-bristle gouache brushstroke for `PlayButton` & hero CTAs.
- `brush-bar.png` (512×64): Sweeping dry-brush highlight stroke for selected rows, Settings tree, and popup menus.
- `spine-line-v.png` (16×512): Distressed hand-painted chalk vertical spine seam.
- `hairline-h.png` (512×16): Distressed painted chalk horizontal underline/rule.
- `ink-splash.png` (256×256): Expressive organic gouache splatter bloom with micro-droplets (`SYSTEM` modal).
- `drafting-arcs.png` (512×512): Fine architectural astrolabe compass arcs, tangent diagonal, and drafting crosshair.
- `canvas-wash.png` (512×512): Calm painterly dry-brush canvas tooth for subtle background depth.
- `paper-torn.png` (256×32): Jagged hand-torn paper bottom edge for tooltips and helper strips.
- `banner-dissolve.png` (512×128): Painterly dry-brush bottom-fade mask for the hero banner.

## 5. Six Shell & Game Page Levers

| Lever | Arcfolio Design (from captures) |
|---|---|
| **Hero banner transition** | Dry-brush feathered bottom dissolve (`banner-dissolve.png`) with subtle architectural compass arc watermark (`drafting-arcs.png`) into deep verdigris-petrol `#102224`, tinted with `#0D2225` `GameBannerTintBrush`. |
| **Play button architecture** | Raw-bristle Carmine Rose-Crimson gouache brushstroke (`brush-cta.png`, `#C92446`) sliced by a crisp chalk baseline (`hairline-h.png`) + `▸` pointer; flares `#D92B4E` with diagonal chalk slash on hover; snaps to deep `#9D1A35` ink stamp on press. |
| **Metadata container & group break** | Deep obsidian-petrol ledger (`#0D1B1D`) bounded on the left by the `3px` distressed chalk vertical spine (`spine-line-v.png`); group breaks are ultra-thin chalk hairlines anchored left by a `5px` rotated hollow drafting diamond. |
| **Chip & score silhouette** | Chips (`Tag="Chip"`): sharp rectilinear stark chalk-ivory slips (`#F4F1EA`) with pitch ink (`#11181A`), inverting to verdigris cyan-teal (`#117E86`) + white on hover (`10_equipment` `Effect`, `12_quest` `Search`). Scores: ivory index-plate plaques (`NO.01` style from `07_load`) with teal/gold/crimson score foot ticks. |
| **Row & cover selection mark** | Details rows: whisper chalk hairline dividers at rest; sweeping verdigris cyan-teal brushstroke (`brush-bar.png`, `#117E86`) + `▸` pointer + chalk underline on select (`02_settings`). Covers: sharp `0px` architectural frame with chalk compass corner ticks + teal bottom sweep on hover, double chalk-and-teal lock + top-right carmine pip on select. |
| **Side-panel close plate** | `28×28` sharp obsidian-petrol square plate with crisp `1px` chalk-muted border, subtle diagonal inner drafting hairlines, and `14px` chalk `IconWindowClose`; sweeps vivid Carmine Rose-Crimson (`#C92446`) over `120ms` on hover with pure white glyph. |

## 6. Seven Popup Menu Levers (`docs/themes/menus.md`)

1. **Panel**: `30px` rows; deep obsidian-petrol board (`#0B181A`) with calm impasto grain (`canvas-wash.png`), `3px` distressed chalk vertical left spine (`spine-line-v.png`), `2px` carmine-to-teal top ink seam, subtle top-right drafting compass arc watermark.
2. **Highlight**: Verdigris cyan-teal gouache brushstroke (`brush-bar.png`, `#117E86`) sweeps in from `-8px` (`120ms CubicEase`), sliced by a chalk baseline and led by a crisp chalk `▸` triangle pointer; white serif label glides `2px` right.
3. **Group break**: Crisp `1px` chalk hairline split by a diagonal architectural slash (`/`) and hollow rotated diamond (`10px` total height).
4. **Icons**: Bespoke 24-icon bare Renaissance/architectural gouache-and-chalk PNG set (`art/menu-icons.json`); `TextElement.Foreground` forced to chalk-white on `Icon` in `IsHighlighted` & Exit triggers.
5. **Shortcuts**: Serif labels inside `[ F4 ]` square architectural brackets (`07_load` `[ Afternoon ]`), lighting from verdigris mist to chalk-white on highlight.
6. **Submenu mark**: Sharp chalk `▸` triangle on the right edge; held teal wash + lit triangle when `IsSubmenuOpen="True"`.
7. **Marked rows**: `Alt+Q` Exit rests with carmine text & `[ Alt+Q ]`, highlighting into a Carmine Rose-Crimson gouache brushstroke (`#C92446`) with chalk baseline, `▸` pointer, and pure white ink (`5.49:1`); checked rows show a stark ivory square plate with a pitch-ink diamond tick.

## 7. Motion Language

- **Personality**: Painterly stroke snap + crisp architectural precision (`CubicEase` ease-out on entrances, `QuadraticEase` clean release; zero bouncy cartoon overshoot).
- **Durations**: Fast `110ms` (hovers, pointers, checkbox ticks, close plate), Base `180ms` (brushstroke row/menu/tab entrances, cover lift), Slow `320ms` (Play hero slash & glow bloom, empty state reveal).
- **Direction & Stagger**: Brushstrokes always pull **left-to-right** (`-8px -> 0`) like a horizontal paint slash; cover hover controls stagger `50ms` apart.
- **Ambient Loops**: Strictly limited to `RunningIndicator` (`1.6s` launching golden sweep + stepping Rank diamonds; `3.0s` calm running pulse) and subtle compass breath on the empty page only while visible.

## 8. Brand & Mark

- **Name:** **Arcfolio** (original abstract name combining architectural drafting *arcs* and Renaissance illuminated *folios* — never an official product title).
- **Brand Mark (`art/mark.svg` & `LocalArcfolioMenuMarkTemplate`)**: An original concentric astrolabe drafting ring bisected by a crisp diagonal quill-slash and centered on a 4-point Renaissance compass diamond with two fine horizontal folio ticks. Drawn cleanly in vector geometry, animated on sidebar/top-bar hover (outer compass ring rotates `45°` & diamond illuminates carmine) and menu-open (ring locks `90°` & slash gleams ivory).
- **`GameBannerTintBrush`:** `#0D2225` (Deep Verdigris Ink — solid branded dark teal surface).

## 9. Restraint & Anti-Slop Commitment

- **What stays quiet**: The game list background, grid canvas, description prose, and metadata labels stay calm deep petrol-slate (`#102224` / `#152C2F`) with crisp serif legibility (`>7:1`–`14:1` contrast) and whisper hairlines — no boxes around every field, no busy wallpaper behind text.
- **Forbidden clichés**: Zero generic `#0D0F14` dark charcoal, zero neon glowing outlines, zero 45° sci-fi chamfers or `[ ]` HUD corner brackets on covers, zero uppercase monospace telemetry labels, zero bubbly pill radii, zero flat plastic surfaces where gouache brushwork or chalk hairlines belong.
