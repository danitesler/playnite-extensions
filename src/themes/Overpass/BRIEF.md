# Overpass — Creative Brief (`Showcase`)

Unofficial Playnite Desktop theme inspired by *Grand Theft Auto IV*'s monochrome Liberty City cartographic map and stark Swiss pause menu.

## 1. Candidate Lenses (3 -> Pick 1)

- **(a) Diegetic / Artifact (Badger Cell Phone / LCPD Cruiser Terminal):** Narrow LCD grid with green/amber phone chrome loses the widescreen monochrome street map and crisp Swiss typography central to GTA IV. *Dropped.*
- **(b) HUD / Telemetry (Street Radar & Pricedown Cash Overlay):** Purely transparent gameplay overlay lacks full-page hierarchy and would drift close to `Joyride` (GTA V). Borrowed only for circular radar, health/armor status rings, and prompt accents. *Dropped as primary shell.*
- **(c) Pause Menu & Cartographic Map Table *(Chosen)*:** Built directly from GTA IV's `Map`, `Stats`, `Display`, and `Brief` pause screens — pure black water and asphalt, crisp `1px` Swiss horizontal rules, alternating zebra metadata rows, flat thumb-less Display sliders, and layered monochrome Liberty street cartography fading organically into pitch black, punctuated sparingly by warm amber-orange (`#E89D10`) GPS/selection highlights. Completely distinct from the last 5 themes (`Umbralune` astral sapphire filigree, `Neonrust` neon magenta/yellow datapad, `Baylight 27` light glass OS, `Greenfield XP` retro glossy OS, and `Joyride` colorful GTA V collage).

## 2. Source DNA (5 Measured Traits)

1. **93% Monochrome / 7% Warm Amber-Orange Budget (`ref1`–`ref4`):** True black `#000000` water and ground, `#151618`/`#1B1C1E` zebra surfaces, `#6E7074`/`#8E9094` Swiss greys, `#EBECEF` crisp white ink, and surgical `#E89D10` amber-orange highlights only on active indicators, GPS arrows, focused sliders, and Play hover.
2. **Organic Layered Monochrome Cartography (`ref1_map`):** Procedural archipelago coastlines (`map-land.png`), multi-tier streets & elevated expressway bridges (`map-roads.png`), and a sparse GPS route line (`map-route.png`) that dissolve softly into `#000000` water behind sparse areas, the rail foot, Settings title band, and empty game page while staying quiet behind dense lists and prose.
3. **Sharp `0px` Swiss Architectural Geometry (`ref1`–`ref4`, `ref7`):** Zero rounded cards, zero drop shadows, zero neon glows; `1px` pause-menu hairlines (`#6E7074`) and `map-edge.png` highway-tick borders; strictly circular geometry reserved solely for the Radar menu mark, `50×50` Radar-disc cover buttons, and radio rings.
4. **Tightly Tracked Swiss Neo-Grotesque (`ref1`–`ref8`):** Bundled SIL OFL **Schibsted Grotesk** (`Regular`, `Medium`, `SemiBold`, `Bold`) carrying both bold tight-tracked headings and crisp tabular UI labels, paired with `Consolas` for `/` slash-prefixed shortcuts and coordinates.
5. **Restrained Urban-Modernist Motion:** Crisp `CubicEase` (`110ms` fast / `180ms` base / `300ms` slow), directional left-to-right GPS route sweeps, zero bouncy overshoots or hologram flickers.

## 3. Focal Hierarchy & Source Translations

### Hero Focal Pieces (2)
1. **Cartographic Hero Transition & Swiss Game Header:** Sharp edge-to-edge hero art fading into `#0A0B0C` ground over the subtle Liberty monochrome map, closed by GTA IV's `1px` pause-menu horizon hairline with a `map-edge.png` highway-tick accent and a hair-thin amber-orange `+` map crosshair above the bold tight-tracked `Schibsted Grotesk` title.
2. **Map-Etched Monochrome-to-Amber Play Slab (`PlayButton.xaml`):** Crisp `0px`-radius Swiss off-white (`#EAECEF`) architectural slab at rest with jet-black ink, faint engraved monochrome street-grid texture (`map-plate.png`), `3px` amber-orange GPS lead rail, and directional GPS chevron — sweeping smoothly on hover into warm GTA IV amber-orange (`#E89D10`) with extending fine amber crosshair ticks.

### Structural UI Translations (6)
1. **Liberty Monochrome Street Map (`ref1_map`) ->** Multi-layer procedural `OpacityMask` backdrops (`map-land.png`, `map-roads.png`, `map-route.png`, `map-rail.png`, `map-band.png`) emerging organically on game pages, rail foot, top bar right edge, Settings header, and the full-canvas empty game state.
2. **Pause Menu Stats Zebra Table (`ref2_stats`) ->** Borderless game-page Metadata Pane crowned by a sharp `LIBERTY`-style dark borough header pill (`#151618`, `1px #4F5355`), alternating subtle monochrome ledger rows, and `1px` hairline group dividers anchored by an amber `+` map crosshair node.
3. **Display Flat Thumb-less Sliders (`ref3_display`, `ref4_audio`) ->** `Slider.xaml` & `ProgressBar.xaml` drawn as sharp `0px`-radius flat `#2B2C2F` bars filled with `#8E9094` grey at rest that ignite solid `#E89D10` amber-orange on hover/drag.
4. **Circular HUD Minimap Radar (`ref5_hud_radar`) ->** Animated `LocalOverpassMenuMarkTemplate` main-menu radar dial (top `N` badge, split sage-green health / steel-blue armor outer ring, inner cross-streets, amber GPS chevron) + `50×50` circular Radar-disc `GridTileButton` hover controls on covers.
5. **Map Borough Tag (`LIBERTY` in `ref1_map`) ->** Sharp `0px`-radius `PropertyItemButton` metadata chips (`#151618` fill, `1px #45474B` rim, lighting amber rim + `2px` orange GPS tick on hover) and `ToolTip` callouts.
6. **Radar Armor Arc & GPS Telemetry (`ref5_hud_radar`) ->** `RunningIndicatorBrush` in Radar Armor Steel-Cyan (`#2B7FA6`), driving angled GPS sweeps, segmented highway foot bars, and calm pulsing radar-blip targets across rows, covers, list view, and Play/RUNNING.

## 4. Material & FX Plan (`art/sprites.py`)

Deterministic Python generator (`seed = 4082008`, Pillow + NumPy) producing pure-white (`255,255,255`) RGBA alpha masks in `src/Images/fx/`:
- `map-land.png` (960×640): multi-island Liberty archipelago coastlines, harbors, piers, and central park cutout with organic radial edge fade.
- `map-roads.png` (960×640): aligned rectilinear grids, angled borough avenues, cloverleaf interchanges, and sweeping suspension bridges over black water.
- `map-route.png` (960×640): single GPS highway/bridge route path following `map-roads.png` for subtle amber-orange geographical tracing.
- `map-rail.png` (88×720): vertical coastal river & bridge map sliver composed for the 44px sidebar rail foot.
- `map-band.png` (800×96): horizontal expressway interchange strip fading left-to-right for the Top Panel and Settings Title Band.
- `map-plate.png` (320×80): miniature engraved street-grid texture for PlayButton, primary/active plates, and dialog surfaces.
- `map-edge.png` (480×32): delicate elevated-highway dual-rail & cross-street tick strip for organic cartographic border accents.
- `asphalt-grain.png` (256×256): seamless subtle monochrome asphalt/film grain (`3.5%` opacity).

## 5. Signature Levers

### Shell, Texture & Game Page Levers
- **Background & side-panel textures:** Organic layered `map-land.png` + `map-roads.png` + faint `map-route.png` fading into `#000000` water on `PageRoot`, `StandardWindowStyle`, calm low-opacity layer behind `Library`, and `map-rail.png` along the 44px rail foot; all collapsed under `ShowBackgroundImageOnWindow=True`.
- **Layout & structural dividers:** Crisp `1px #6E7074` pause-menu hairlines punctuated by a `5px` amber-orange `+` map crosshair node (`DividerTemplate`) and `map-edge.png` highway ticks on hero/header seams.
- **Left-side navigation & Settings tree:** `44px` `#000000` rail with `map-rail.png` foot, crowned by the animated Circular Liberty Radar mark (`LocalOverpassMenuMarkTemplate`); active rail item wears a sharp `#1B1C1E` plate + `3px #E89D10` edge bar + crisp white glyph. Settings `TreeView` uses bare `28px` body-font rows (`ref2_stats` left nav), soft `#1B1C1E` hover wash, `#232528` selected wash + `2px #E89D10` left bar + bright amber/white label.
- **Inputs, search & dropdowns (`LocalOverpassFieldTemplate`):** Sharp `0px`-radius `#121315` wells with `1px #3D3F43` rim, quiet `2px` grey left GPS tick and faint right-side street etch at rest; hover lifts left tick and baseline; focus (`Tag="Active"`) sweeps an amber-orange GPS baseline left-to-right (`160ms`) and lights the left tick + tiny right `+` crosshair. `ComboBox` has a dedicated `30px` separated right chevron cap (`40px` right margin on `ContentSite` / `PART_EditableTextBox`).
- **Buttons & bespoke icons:** Sharp `0px`-radius architectural monochrome plates with subtle `map-plate.png` street texture; custom geometric `Icon<Role>` vectors drawn directly in `Media.xaml` (crisp uniform `1.8px` Swiss technical strokes, flat caps, zero stock packs).
- **Hero banner, metadata, chips/scores, rows/covers, side-panel close:** See Section 3 above; `SidePanelCloseButton` is a sharp `28×28` `#151618` crosshair-ticked plate turning `[B]` Crimson `#B8242A` on hover.

### 7 Popup Menu Levers (`LocalOverpassMenuBoardTemplate`)
1. **Panel:** Sharp `0px`-radius `#0D0E10` board, `1px #4F5355` rim, `4px` monochrome `map-band.png` map crown closed by a `1px #6E7074` hairline centered on a `14px` amber-orange crosshair dash, plus `6%` `map-roads.png` bottom-right corner watermark.
2. **Highlight:** `30px` rows; `#232528` zebra charcoal slab with `1px` top/bottom hairlines and `3px #E89D10` amber left bar wipes in (`ScaleX 0.90->1`, `120ms CubicEase`), amber GPS arrow `▸` slides in on iconless rows, `#EBECEF` label nudges `+2px` right.
3. **Group break:** `10px` break with `5px` amber-orange `+` crosshair opening a `1px #45474B` hairline.
4. **Icons:** Custom bare full-frame monochrome Swiss stencil-duotone PNG set (`art/menu-icons.json`, neutral light-grey + dark charcoal body with warm amber accents, tight `#0A0B0C` contour halo).
5. **Shortcuts:** Right-aligned `Consolas` monospace led by a subtle `/` slash separator (echoing `WED / 12:57 / $5`), muted `#8E9094` brightening to `#E89D10` amber on highlight.
6. **Submenu mark:** Sharp directional GPS chevron `▸`, lighting amber and holding `#1C1D20` steady plate while submenu is open.
7. **Marked rows:** `Alt+Q` Exit uses `[B]` Crimson (`#E0484E` text at rest; solid `#B8242A` slab with white text/icon/shortcut >= 5.5:1 on highlight); checked rows show a crisp `14×14` sharp square waypoint mark with `#E89D10` amber checkmark.

## 6. Motion Language

- **Durations:** Fast `110ms`, Base `180ms`, Slow `300ms`.
- **Easing:** `CubicEase` (`EaseOut`) everywhere — clean Swiss modernist precision, zero cartoon bounce or glitch flicker.
- **Entrance direction:** Left-to-right GPS route sweep (menu rows, focus baseline, Play hover plate, launching radar sweep).
- **Ambient loops (sparse only):** Open main-menu radar sonar ring (`2.4s`), empty-game-page radar crosshair gentle breath (`3.6s`), and active running/launching game indicators (`1.6s` sweep / `3.2s` idle breath).

## 7. Brand & Restraint Commitment

- **Name & Mark:** **Overpass** (key: `overpass`). Original vector emblem (`art/mark.svg`): a circular Liberty Radar bezel intersected by an asymmetric elevated expressway overpass crossing a river channel, centered on a subtle crosshair waypoint node. Unofficial fan theme, no Rockstar assets (`info/NOTICE-Overpass.txt`).
- **What stays quiet:** Dense library game lists, grid cover backdrops, and game description prose sit on calm `#0A0B0C` pitch asphalt (map opacity `<= 5%` behind library lists, `0%` over covers) so reading and scanning are effortless.
- **Forbidden clichés:** No neon glows, no drop shadows, no 45° sci-fi chamfers, no uppercase monospace `// TELEMETRY` labels, no heavy card boxes around every metadata item, no loud solid orange wallpaper or boxy grids.
