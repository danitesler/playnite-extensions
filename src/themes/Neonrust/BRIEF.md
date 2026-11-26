# Neonrust — Creative Direction & Brief

**Ambition:** `Showcase`  
**Source:** *RAGE 2* (unofficial fan/community desktop theme; zero owner logos or game assets)

## 1. Candidate Lenses (3 -> Pick 1)

1. **(a) Diegetic / Artifact — Ranger Datapad & Anarchy Overlay (SELECTED)**  
   Translates the in-world Ranger Datapad (`05-inventory.jpg`, `06-skills.jpg`, `07-codex.jpg`)—deep oxidized petrol-teal canvas with faint triangular mesh tooth, gunmetal bumper top strip with blazing yellow+magenta active flare, 45° chamfered list rows snapping to Solar Yellow + black ink, and teal-framed metadata dossiers crowned by scratched plum-magenta header bands—fused with the Main Menu / Settings hot-magenta dry-brush CTA & stepped-tick grammar (`02-mainmenu.jpg`, `03-settings.jpg`).
   - *Contrast with last 5 themes (`Checkpost`, `Starlane`, `Greenfield XP`, `Baylight 27`, `Umbralune`):* Unlike `Greenfield XP` and `Baylight 27` (light OS/editorial shells) and `Umbralune` (ornate sapphire/gold baroque filigree), Neonrust is raw, angular, weathered oxidized-petrol + Solar Yellow + Hot Punk Magenta dry-brush industrial punk.
2. **(b) HUD / Telemetry — Overdrive Combat Visor (`08-hud.jpg`)**  
   *Dropped:* Too transparent and peripheral-heavy for a desktop library; drops RAGE 2's iconic chamfered yellow selection rows, gunmetal top tabs, and magenta dry-brush bars.
3. **(c) Title / Pause Menu — Sun-Bleached Plaster & Graffiti (`02-mainmenu.jpg`, `03-settings.jpg`)**  
   *Dropped as primary shell:* The repo's two most recent light themes (`Greenfield XP`, `Baylight 27`) already occupy bright grounds, and a weathered plaster page would fight dark game banners. Instead, we fuse its signature hot-magenta dry-brush bar (`brush-bar.png`), magenta-rimmed dark boxes, and tapered white sliders directly into the Play CTA, popup highlights, and Settings chrome.

## 2. Source DNA (5 Measured Traits)

1. **Oxidized petrol + tri-neon value ladder:** Deep petrol-teal canvas (`#101C1B`), weathered gunmetal top strip (`#374B47`), crisp Ranger seafoam-teal wireframes (`#4CC7AD`), blazing Solar Yellow selection (`#FFD600` + `#091110` ink), and screaming Hot Punk Magenta (`#FF00AE` / `#C80085`) dry-brush energy.
2. **Asymmetric 45° chamfer + dry-brush tension:** Machine-cut 45° datapad frames (`05-inventory.jpg`, `07-codex.jpg`) collided with raw, frayed spray-paint / dry-brush strokes (`02-mainmenu.jpg`, `03-settings.jpg`).
3. **Weathered screen tooth & ambient corner bleed:** Faint isometric triangle mesh (`datapad-mesh.png`), diagonal scratched header patina (`grunge-header.png`), and subtle bottom-left magenta / bottom-right teal edge glow (`spray-halo.png`).
4. **Chamfered industrial display voice:** Bundled **Chakra Petch** (`Regular`, `SemiBold`, `Bold`) for titles, headers, tabs, Play CTA, and badges paired with clean `Segoe UI` body prose and `Consolas` counters.
5. **Snappy arcade-tactical kineticism:** Fast crisp locks (`110ms` hover), punchy dry-brush/chamfer slaps (`180ms` `CubicEase` / `BackEase` subtle kick on Play & selection), and disciplined calm on dense text.

## 3. Focal Hierarchy & Source Translations

**Hero Focal Pieces (2):**
1. **Hot-Magenta Dry-Brush Play CTA (`DerivedStyles/PlayButton.xaml`)**: Tapered dry-brush magenta command slab (`brush-bar.png`) inspired by `CONTINUE GAME` / `BUY x1`; on hover it erupts with a **Solar Acid Yellow (`#FFD600`) corner flare + angled paint-glint sweep** (`paint-glint.png`), mirroring the iconic active `INVENTORY` / `PROJECTS` yellow+magenta flare (`05-inventory.jpg`, `06-skills.jpg`).
2. **Blazing Solar Yellow Chamfered Selection & Active Top-Bar Flare (`DetailsViewItemStyle.xaml`, `TopPanel.xaml`)**: Selected library rows lock into solid Solar Acid Yellow (`#FFD600`) chamfered plates with pitch-black ink (`#091110`) and a left-edge pip (`05-inventory.jpg` `WINGSTICK`), while active view switches in the oxidized-metal top bumper bar ignite in Solar Yellow framed by a soft Hot Magenta spray halo (`spray-halo.png`).

**Structural UI Translations (6 observed in `RESEARCH.md`):**
1. **Left vertical chamfered tier rail (`06-skills.jpg`, `07-codex.jpg`)** -> `Views/Sidebar.xaml` & `CustomControls/SidebarItem.xaml` (44px petrol rail, Tri-Blade Wingstick main menu mark, Solar Yellow chamfered active tab with left pip).
2. **Oxidized gunmetal bumper tab bar (`05-inventory.jpg`)** -> `Views/TopPanel.xaml` (50px metal-trimmed top bar, Solar Yellow + Magenta spray-halo active view switches, crimson-magenta `!` diamond filter mark, segmented Feltrite/Overdrive global progress bar).
3. **`WINGSTICK` / `CROSS` 1px teal-framed dossier (`05-inventory.jpg`, `07-codex.jpg`)** -> Game page metadata pane (1px Ranger teal wireframe, bruised magenta-plum scratched top header band with `grunge-header.png`, `+` corner registration crosshairs, teal/yellow group dividers).
4. **Main Menu / Video Settings dry-brush row + stepped ticks (`02-mainmenu.jpg`, `03-settings.jpg`)** -> `DefaultControls/ContextMenu.xaml` / `Menu.xaml` (magenta dry-brush highlight) + `DefaultControls/Slider.xaml` (tapered white-over-charcoal bar with stepped tick marks) + `DefaultControls/TextBox.xaml` (`LocalNeonrustFieldTemplate`).
5. **Skill Tree / Inventory chamfered slots (`05-inventory.jpg`, `06-skills.jpg`)** -> `DerivedStyles/GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml` (chamfered teal hover frame with `+` crosshairs, blazing Solar Yellow selected lock + 50×50 chamfered Play/Info overlay plates).
6. **Intel Attained modal band (`09-modal.jpg`)** -> `EmptyGameTemplate` (1px horizontal cyan horizon lines framing the centered Tri-Blade Wingstick mark and amber-yellow status prompt).

## 4. Material & FX Plan (`art/sprites.py` -> `src/Images/fx/*.png`)

All masks generated as pure-white (`#FFFFFF`) RGBA PNGs (fixed seed `2042019`) tinted via `OpacityMask` in XAML and `-webkit-mask-image` in HTML previews:
- `brush-bar.png` (`512x64`): Dry-brush paint stroke with solid contrast core and ragged bristle ends.
- `datapad-mesh.png` (`192x192`, seamless): Fine isometric triangle lattice + subtle datapad glass micro-scratches.
- `spray-halo.png` (`320x96`): Organic aerosol spray bloom with fine overspray speckles.
- `grunge-header.png` (`480x72`): Scratched weathered plaster/metal scuffs for the bruised magenta dossier header & title band.
- `paint-glint.png` (`256x96`): Angled dry-brush sheen sweep for Play hover and Launching scan.

## 5. Signature Levers

### Shell & Game Page Levers
1. **Hero banner transition:** Soft petrol gradient fade down into a crisp 1px Ranger teal datapad horizon line with a centered hot-magenta optical accent streak (`09-modal.jpg` / `05-inventory.jpg`).
2. **Play button architecture:** Dry-brush Hot Punk Magenta slab (`brush-bar.png`) framed by 45° chamfered end-ticks; hover flares with Solar Yellow + `paint-glint.png` sheen; press sinks into deep magenta (`#A1006B`).
3. **Metadata container & group break:** 1px Ranger teal wireframe card (`#2A695E` / `#4CC7AD`) over subtle `datapad-mesh.png`, crowned by a bruised magenta-plum scratched cap band (`grunge-header.png`) with `+` corner crosshairs; group breaks are 1px teal lines anchored by a 6px Solar Yellow chamfered diamond notch (`DividerTemplate`).
4. **Chip & score silhouette:** 45° top-left / bottom-right chamfered petrol tags (`PropertyItemButton`) with 1px teal rim flipping to Solar Yellow + black ink on hover; `TextBlockGameScore` in chamfered bordered score plaques with bold `Chakra Petch` tabular numerals.
5. **Row & cover selection mark:** Details rows wear quiet hover teal-wash + sliding teal rail pip, snapping to solid Solar Yellow (`#FFD600`) chamfered slab with `#091110` black ink on selection; Grid covers lift with teal `+` corner reticles on hover, lock into a crisp 2px Solar Yellow chamfered frame on selection, with 50×50 chamfered `GridTileButton` hover plates.
6. **Custom 28×28 side-panel close plate:** 45° chamfered square plate (`SidePanelCloseButton`) with 1px teal rim and `IconWindowClose`, flashing Authority Crimson (`#C81D3A`) with white glyph on hover.

### Fields Lever (`LocalNeonrustFieldTemplate` in `TextBox.xaml`)
- **Edge:** Deep petrol well (`#0B1313`) with 1px oxidized teal rim + 45° top-left and bottom-right inner corner cut-ticks (`LocalNeonrustFieldTemplate` overlay, zero desired size).
- **Rest mark:** 3×14px vertical Ranger teal stub inside the left edge + faint bottom stepped-tick rail (`03-settings.jpg`).
- **Hover:** Teal stub brightens & extends vertically; inner top-right diagonal glint ticks illuminate in seafoam-teal.
- **Focus (`Tag="Active"`):** One-shot (`160ms`) Hot Punk Magenta (`#FF00AE`) bottom dry-brush trace sweeps across the lower rail while the left stub flips blazing Solar Yellow (`#FFD600`).
- **ComboBox arrow / cap:** 30px oxidized-metal chamfered right cap separated by a 1px teal seam bearing `<` / `▾` chevron; lights Solar Yellow with dark ink while open. `ContentSite` reserves `40px` right margin (`30px` cap + `10px` left inset).
- **Check & radio:** 45° chamfered square (`CheckBox`) filling Solar Yellow with a bold dark-ink cross/check; chamfered diamond-ring (`RadioButton`) igniting a Hot Magenta core pip (`07-codex.jpg`).

### 7 Popup Menu Levers (`ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`)
- **Panel (`LocalNeonrustMenuBoardTemplate`):** Smoked petrol datapad board (`#111E1D`) with faint `datapad-mesh.png` grain, 1px Ranger teal border, 3px Hot Punk Magenta top spray-cap band, and 45° diagonal corner ticks (`+` marks top-right/bottom-left).
- **Highlight:** Hot Punk Magenta dry-brush swipe (`brush-bar.png`) fades & slides in (`115ms`, `FillBehavior="Stop"`) with a 3px blazing Solar Yellow vertical lead stub; label turns stark white and shifts 2px right.
- **Group break:** 10px break carrying a 1px teal hairline led by a 14px hot-magenta brush stub and 4px yellow diamond pip.
- **Icons:** Theme-owned 24 bare full-frame `Neonrust` chamfered stencil-cut PNG icons (`art/menu-icons.json`, `gs: 0.94`, `skewX: -6`, tight dark contour halo so they pop equally on petrol rest plates and magenta brush highlights).
- **Shortcuts:** Bracketed `[F4]` / `Consolas` dark-petrol key chips with 1px teal rim, flipping to Solar Yellow text with dark rim on highlight.
- **Submenu mark:** Sharp `›` chevron turning Solar Yellow on hover and held on an oxidized-teal + yellow-edge plate when `IsSubmenuOpen`.
- **Marked rows:** `Alt+Q` Exit shows Authority Crimson (`#C81D3A`) label + crimson keycap at rest, flipping to a solid Authority Crimson brush slab with stark white label (>5.6:1 contrast) on highlight; checked rows show a Solar Yellow chamfered diamond-check mark.

### Running & Launching Indicator (`RunningIndicatorBrush = #1B72E8` Feltrite Electric Blue)
- **Launching:** Angled dry-brush Feltrite Blue sweep (`paint-glint.png` + `RunningScan`, `1.55s` cycle) crossing the item's shape, segmented 2px foot track (`RunningFill`), and 3 staggered Feltrite chevron-diamonds pulsing as the scan lands.
- **Running:** Quiet `3.0s` idle frame pulse (`0.72 -> 1.0`) + steady full foot bar + gently alternating 3-diamond Feltrite crystal beacon.
- **Running + Hover (button only):** `PlayContent` hides (`Hidden`), `RunningHoverDim` darkens the plate, and `LOCCancelLabel` fades in crisp white.

## 6. Motion Language
- **Durations:** Fast `110ms` (hovers, menu rows, ticks), Base `180ms` (selection locks, field focus sweep, button press), Slow `320ms` (Play flare settle, banner/panel reveals).
- **Easing:** Crisp `CubicEase` (`EaseOut`) for datapad wireframes + punchy `BackEase` (`Amplitude="0.25"`) on hero Play & main menu Wingstick rotor.
- **Restraint:** Zero idle pulsing on static UI; dense list rows (unselected), grid background, and metadata prose remain calm, clean, and >= 4.5:1 legible.

## 7. Branding & Notice
- **Name:** `Neonrust` (key `neonrust`, folder `src/themes/Neonrust`).
- **Mark (`art/mark.svg`):** Original 3-blade chamfered Wingstick rotor inside a broken stenciled circle — reused in `LocalNeonrustMenuMarkTemplate`, Settings title band, empty state, and `info/icon.png`.
- **Disclaimer:** Unofficial fan theme inspired by *RAGE 2*; contains no official logos, trademarks, or game assets (`info/NOTICE-Neonrust.txt`).
