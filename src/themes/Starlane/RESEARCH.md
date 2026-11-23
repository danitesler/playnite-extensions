# Starlane — Reference Research

Design research for **Starlane**, an unofficial *Star Wars*-inspired Playnite desktop theme (`Showcase` ambition). No official logos, copyrighted artwork, or proprietary fonts are copied or shipped.

## 1. Visual Sources & Design Lineage

| Source | Era / Medium | Key Visual Takeaways |
| --- | --- | --- |
| **Original Trilogy Opening Sequence** (*Episode IV: A New Hope*, 1977) | Film titles & crawl | Iconic Opening Crawl Yellow (`#FFE81F`), `"A long time ago in a galaxy far, far away...."` Holonet Cyan (`#4BD5EE` / `#43A5CF`), deep starfield void (`#07090D`), tall condensed grotesque display titles (News Gothic / Franklin Gothic condensed lineage). |
| **John Barry Production Design — Death Star & Star Destroyer Interiors** (*A New Hope*, *Empire Strikes Back*) | Set architecture | Modular matte durasteel wall panels (`#12161E` / `#1A202B`), iconic repeating **vertical pill-notched light-wall slits** (waist-cinched vertical light columns), and physical consoles studded with **backlit translucent acrylic push-buttons** (amber/gold, cyan, crimson, stark white) set in dark chamfered housings. |
| **Imperial Officer Rank Insignia Plaques** (*Episodes IV–VI*, *Rogue One*, *Andor*) | Costume / graphic hardware | Brushed gunmetal horizontal plates holding crisp translucent square acrylic tiles in **Holonet Cyan**, **Trench Crimson**, and **Crawl Gold** — immediate visual shorthand for Star Wars hierarchy without text or logos. |
| **Larry Cuba & Dan O'Bannon — X-Wing Trench-Run Targeting Computer** (*A New Hope*, 1977) | Diegetic vector FUI | Amber/gold (`#F5C518` / `#FF9E1B`) and alert-red (`#E03128`) vector wireframes on dark CRT glass: converging trench perspective grid, dual distance countdown wells, inward-snapping rangefinder brackets `| [ ] |`, and horizontal scanlines. |
| **BD-1 Holomap, Jedi Archives & Holonet Projectors** (*Episodes I–VI*, *Jedi: Fallen Order / Survivor*) | Holographic FUI | Translucent **Holonet Cyan** (`#4BD5EE`) projection planes, crisp 45° chamfered octagonal datapad frames, faint horizontal holo-scan bands, and radial emitter rings. |
| **Cassette-Futurism Terminals** (*Andor*, *Rogue One*, *Star Wars Outlaws*) | Tactile retro-industrial UI | Grounded "used future" restraint: matte durasteel charcoal-navy surfaces, crisp 1px metallic seams, segmented Energy Level System (ELS) power bars, knurled mechanical throttle sliders, and clean monospaced telemetry codes. |
| **Lightsaber Emitter & Kyber Plasma Physics** (*Episodes IV–VI*) | Diegetic weapon optics | Brushed metallic emitter shroud housing a white-hot plasma core (`#FFFFFF`) framed by a controlled colored blade aura (Crawl/Sentinel Gold, Holo/Guardian Cyan, Consular Kyber Emerald `#19A858` for running state, Sith Crimson `#E03128` for danger). |

## 2. Measured Color System

All colors are chosen for high legibility on deep durasteel surfaces (`>= 4.5:1` for body and buttons, `>= 7:1` for primary selections) while keeping each functional role hue-distinct:

| Token Role | Hex | Contrast / Notes |
| --- | --- | --- |
| Hyperspace Void (window / library base) | `#080B10` | Deep starfield obsidian-navy (cooler and distinct from Subspace's pure `#000000`). |
| Durasteel Bulkhead (shell rail, top bar) | `#10151E` | Matte Imperial starship hull steel. |
| Console Housing (raised panels, metadata card, popups) | `#151C27` | Subtle elevation above `#080B10` with crisp steel seams. |
| Recessed Well (inputs, search trough, tracks) | `#0B0F17` | Sunken cassette-futurist hardware well. |
| Control Face (buttons, idle acrylic caps) | `#1C2534` | Matte gunmetal key cap with subtle specular top rim. |
| Hover Wash (control / row hover) | `#222E40` | Crisp cool steel lift + Holo-Cyan highlight border. |
| Bulkhead Seam / Control Rim | `#2C394E` | Architectural 1px durasteel panel line. |
| Bright Rim / Chamfer Specular | `#3E506C` | Highlighted bezel edge on hover and cards. |
| Crawl Gold (primary accent, Play, selection, active keys) | `#F5C518` | Tuned from `#FFE81F` so `#080B10` ink reaches **12.5:1** contrast and gold text on `#151C27` reaches **10.7:1**. |
| Crawl Gold Bright (hover / active rim) | `#FFE45C` | High-energy targeting glow on Play hover and active highlights. |
| Crawl Gold Deep (pressed / dim accent) | `#C99A08` | Mechanical press depth and subtle metadata tick accents. |
| Holonet Cyan (secondary accent, focus, holo emitter, filter mark) | `#4BD5EE` | Iconic `"A long time ago..."` & R2-D2/BD-1 hologram cyan (**10.9:1** on `#080B10`). |
| Holonet Cyan Dim (holo scanlines, secondary rim) | `#227991` | Restrained translucent projection accents. |
| Kyber Emerald (running / launching indicator) | `#19A858` | Distinct Jedi Consular green hue — zero confusion with Gold Play/Selection, Cyan Focus/Filter, or Red Danger. |
| Kyber Emerald Bright (plasma core highlight) | `#38E082` | Sweeping saber-core highlight on `RunningScan` and power cells. |
| Trench Alert Crimson (danger, Exit, close hover) | `#CC2925` | Imperial alert & target-lock crimson (**5.1:1** with pure white `#FFFFFF` ink). |
| Primary Text (Starlight White) | `#ECF1F8` | Crisp cool starlight (**16.4:1** on `#080B10`). |
| Secondary Text (Console Slate) | `#9AA8BC` | Calm captions & muted metadata (**7.8:1** on `#080B10`). |
| Ink on Gold / Light Plates (Void Ink) | `#080B10` | Razor-sharp obsidian ink on Crawl Gold slabs and acrylic buttons. |

## 3. Typography & Open SIL OFL Bundled Fonts

Star Wars pairs **News Gothic Extra Condensed** (Episode / Opening Crawl titles) with **News Gothic / Franklin Gothic** (readable crawl & technical text) and **monospaced CRT telemetry** (trench-run distance readouts and bridge consoles). Windows does not ship News Gothic or Barlow, so **Starlane** bundles static OFL `.ttf` weights in `src/Typography/` from `scripts/fonts/`:

| Role | Bundled Family (`src/Typography/`) | License | Fallback Stack |
| --- | --- | --- | --- |
| Display / Headings (`HeadingFontFamily`) | `Barlow Condensed` (`Regular`, `SemiBold`, `Bold`) | SIL OFL 1.1 | `Bahnschrift Condensed, Arial Narrow` |
| Body / UI (`FontFamily`) | `Barlow` (`Regular`, `Medium`, `SemiBold`, `Bold`) | SIL OFL 1.1 | `Segoe UI, Arial` |
| Telemetry / Shortcuts (`MonospaceFontFamily`) | `Cascadia Mono` (`Regular`, `Bold`) | SIL OFL 1.1 | `Consolas` |

## 4. Geometry, Textures & White-Mask FX Sprites

- **Corners & Silhouettes**: Sharp mechanical **45° chamfered corners** (`4px`–`10px` cut corners via XAML `Path` / `Polygon` on Play, cards, menus, active plates, and side-panel close button) paired with `2px` crisp base `ControlCornerRadius` on compact inputs so nothing reads as generic rounded cards or LCARS pills.
- **Deterministic White-Mask Sprites (`art/sprites.py` -> `src/Images/fx/*.png`)**:
  1. `deathstar-slit-v.png` — Repeating vertical Death Star corridor light-wall slit pattern (waist-cinched capsule apertures with soft vertical diffuser halo) for the 44px left rail edge and Settings title band.
  2. `holo-scan.png` — Fine horizontal holographic CRT scanlines with subtle organic intensity modulation for the Holonet metadata card, popup menus, and empty holoprojector state.
  3. `trench-grid.png` — Converging X-Wing trench-run perspective wireframe horizon lines rising gently out of the hero banner scrim.
  4. `saber-core.png` — Crisp white-hot horizontal plasma core beam with tight perpendicular bloom for the Play button hover ignition and Kyber running sweep.

## 5. Motion & Interaction Language

- **Mechanical cassette-futurism meets plasma ignition**: snappy, decisive, zero bouncy cartoon physics (`CubicEase` ease-out for switches and brackets; `PowerEase` Power 3 for saber ignition and trench sweeps).
- **Durations**: Fast `100ms` (acrylic button flash, bracket lock, hover wash), Base `170ms` (Play saber ignition sweep, row selection slide, menu bar wipe), Slow `320ms` (hero/empty holo settle, running foot fill).
- **Restraint**: Library list background, grid background, and metadata description prose remain completely static and calm (`#080B10` / `#151C27`); motion is concentrated on user-triggered states (Play ignition, row hover/select, cover targeting lock, menu highlight, running sweep).
