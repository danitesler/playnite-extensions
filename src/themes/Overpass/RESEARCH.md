# Overpass — Visual Research Notes

Reference research for **Overpass**, an unofficial Playnite Desktop theme inspired by *Grand Theft Auto IV* (Rockstar North, 2008). No proprietary game assets, logos, or commercial typefaces are copied or shipped.

## Reference Captures Inspected

Eight real 16:9 UI captures were saved in the session scratch folder (`scratch/refs/`), visually inspected, and pixel-sampled with Pillow + NumPy:

1. **`ref1_map.jpg` (1024×576, user capture — Pause Menu: Map)**
   - Full-bleed monochrome Liberty City street map sandwiched between pitch-black `#000000` header and footer bands separated by crisp `1px` neutral-grey hairlines (`#737473`–`#7B7B7B`).
   - Bold tightly tracked Swiss neo-grotesque top tabs (`Map`, `Brief`, `Stats`, `Controls`, `Audio`, `Display`, `Graphics`, `Game`): active `Map` in warm amber-orange (`#E59F1B` / `#F0A100`), inactive tabs in flat neutral grey (`#8B8B8B`–`#919191`).
   - Monochrome map hierarchy: pitch-black water (`#000000`, 35.7%), matte charcoal landmass (`#222325`, 32.9%), urban block/park fill (`#46484B`, 10.9%), minor streets (`#6D6E71`, 11.5%), arterial avenues (`#87888B`, 4.1%), elevated highways & bridges (`#D5D6D6`).
   - Subtle hair-thin translucent orange crosshair reticle (`#8C5824`–`#B86F1E`) intersecting at center, warm orange GPS player chevron, sharp-cornered top-right borough tag `LIBERTY` (`#191B1C` fill, `1px #4F5355` rim), bottom-left muted amber `PAUSED` (`#BB9C73`), bottom-right gamepad prompts (`[Y]` gold, `[A]` green `#5C932E`, `[B]` crimson `#98161C`).

2. **`ref2_stats.jpg` (1024×576, user capture — Pause Menu: Stats)**
   - Pure `#000000` ground with identical top tab strip and `1px` horizontal rules.
   - Left vertical sub-navigation (`General`, `Crimes`, `Vehicles`, `Money`, `Player`, `Combat`, `Score`, `Misc`): bare typographic stack, zero boxes/borders, active item (`Vehicles`) in `#E59F1B` amber-orange.
   - Right data table: alternating **zebra-striped** horizontal bands (`#000000` alternating with `#1A1A1A`–`#1C1C1C`), zero vertical rules, zero outer box, left-aligned `#909090`–`#B8B8B8` labels paired with right-aligned values.
   - Bottom-left status stamp `WED / 12:57 / $5` with `/` slash separators in `#E59F1B`.

3. **`ref3_display.jpg` (1024×576, user capture — Pause Menu: Display)**
   - Pure `#000000` ground, two-column settings list on left, sharp `0px`-radius live preview frame on right (zero border, zero shadow, zero rounding).
   - **Flat thumb-less horizontal bar sliders**: sharp `0px`-radius `#292929` dark track with flat `#8C8C8C` monochrome bar fill at rest (`Brightness`, `Saturation`); focused row (`Contrast`) turns both label and slider fill solid `#EE9F04` amber-orange.

4. **`ref4_audio.png` (1024×576, Game UI Database `id=1245` — Pause Menu: Audio)**
   - Same `#000000` pause shell; active row (`Radio Station` / `Ram Jam FM`) highlights both label and value in `#E89D10` amber-orange without any filled box; `1px` top/bottom horizontal dividers carry a subtle muted bronze-amber tint (`#9E6B14`) on Audio/Brief screens.

5. **`ref5_hud_radar.png` (1024×576, Game UI Database `id=1245` — In-Game HUD & Minimap)**
   - Bottom-left **circular radar** framed by `#000000` outer bezel, split semicircular status ring (**left = Health** muted sage-green `#567A57`, **right = Armor** cool steel-cyan `#4C8FB8`), circular black `N` north badge pinned at top perimeter, monochrome streets with crisp `#CAA81C` GPS route polyline, white player chevron.
   - Bottom-right stacked borough/road name (`BROKER — DUKES EXPRESSWAY`) in muted sage-green (`#557756`) condensed display type.

6. **`ref6_title.png` (1024×576, Game UI Database `id=1245` — Title Screen)**
   - Desaturated monochrome Liberty skyline backdrop with sharp `#000000` bottom command strip; horizontal bold sans navigation (`Start  Options  Social Club  Back`) with amber-orange `#E89D10` active text and `#8E8E8E` inactive text.

7. **`ref7_modal.png` (1024×576, Game UI Database `id=1245` — Confirmation Modal)**
   - Stark `#000000` flat ground, centered `#B5B5B5` neutral sans prompt text, bottom-right `[A] YES` / `[B] NO` circular badges. Zero card shadows or rounded windows.

8. **`ref8_brief.png` (1024×576, Game UI Database `id=1245` — Pause Menu: Brief)**
   - Clean left-aligned monochrome text paragraphs (`#C8CACD`) on `#000000`, generous vertical line rhythm, zero decorative chrome.

## Structural Visual Anatomy

- **Value ladder & accent budget:** ~93% stark monochrome (`#000000` -> `#0A0B0C` -> `#151618` -> `#1B1C1E` -> `#232528` -> `#3D3F43` -> `#6E7074` -> `#8E9094` -> `#EBECEF`), ~7% warm amber-orange highlight (`#E89D10` / `#F7B42C`) + muted radar status accents (Armor Steel-Cyan `#2B7FA6`, Health Sage-Green `#56995C`, Prompt Crimson `#B8242A`).
- **Material & edge anatomy:** Razor-sharp `0px` architectural corners across panels, inputs, sliders, preview frames, and buttons (strictly circular only on radar/prompt badge elements); `1px` crisp monochrome hairlines; zero drop shadows; zero neon bloom; organic depth supplied by layered monochrome Liberty street cartography (`map-land.png`, `map-roads.png`, `map-route.png`) emerging subtly from pitch-black water with smooth vignette falloff and faint asphalt tooth (`asphalt-grain.png`).
- **Typography voice:** GTA IV's pause menus and HUD use bold, tightly tracked **Helvetica Neue / Swiss 721** neo-grotesque (commercial). For an authentic, unique, SIL OFL-licensed equivalent, Overpass bundles **Schibsted Grotesk** (`Regular`, `Medium`, `SemiBold`, `Bold`, SIL OFL 1.1, Copyright 2023 The Schibsted-Grotesk Project Authors, https://github.com/schibsted/schibsted-grotesk) for both `HeadingFontFamily` and `FontFamily`, paired with `Consolas` / `Cascadia Mono` for technical keycaps and coordinates.
- **Density & negative space:** Generous Swiss editorial spacing, strong horizontal alignment, clean zebra-banded metadata rhythm, and zero boxed-in clutter around dense text.
- **Observed UI parts & states:**
  - Top tabs (`ref1`–`ref4`, `ref8`): flat `#8E9094` -> amber-orange `#E89D10` when active.
  - Sub-menu & settings rows (`ref2`–`ref4`): bare monochrome rows with sharp zebra striping; selection shifts cleanly to amber-orange accent + crisp white contrast.
  - Sliders (`ref3`–`ref4`): flat `#292929` rectangular track, `#8C8C8C` monochrome fill at rest, solid `#EE9F04` amber fill on hover/active.
  - Map reticle & borough tags (`ref1`): faint amber crosshair `+` lines, directional amber GPS arrow `▸`, sharp `#191B1C` dark pill with `1px #4F5355` border.
  - Radar (`ref5`): circular dark bezel with top `N` badge, split left-green / right-blue status ring, yellow-amber GPS path.

## Sources & Licenses

- Game UI Database — *Grand Theft Auto IV* gallery: https://www.gameuidatabase.com/gameData.php?id=1245 (visual inspection only; no assets copied).
- User-supplied pause menu captures (Map, Stats, Display).
- Typography: **Schibsted Grotesk** (SIL Open Font License 1.1, https://github.com/schibsted/schibsted-grotesk), subset to Latin & Cyrillic in `src/Typography/` with `OFL.txt`.
- Procedural cartography & surface masks: generated deterministically by `art/sprites.py` (fixed seed `4082008`, Pillow + NumPy) as pure-white RGBA masks (`src/Images/fx/`).
