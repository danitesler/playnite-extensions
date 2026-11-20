# Vesperglass — Reference Research

Reference source: **Dragon Age: The Veilguard** (2024, PC & Console, Electronic Arts / BioWare) via The Game UI Database (`https://www.gameuidatabase.com/gameData.php?id=1997`, 135 cataloged captures, contributed by Adam Schwenk; GUDB tags: `Keyboard`, `Mouse`, `Widescreen`, `RPG`, `3D Realistic`, `Third Person`, `Fantasy`, `Flat 2.0`).

No game assets, official logos, copyrighted artwork, or proprietary fonts were downloaded or shipped. All tokens, geometries, and procedural white-mask sprites in this theme are original derivations from visual measurements.

## Inspected Reference Captures

Sixteen `1920x1080` captures were inspected across the `OVERVIEW` and `HUD & GAMEPLAY` tabs on `gameuidatabase.com/gameData.php?id=1997`:

| Screen | Reference URL | Key Visual Observations |
| --- | --- | --- |
| Title Screen | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-120653-9694.jpg` | Left vertical menu (`CONTINUE`, `NEW GAME`, `LOAD GAME`, `SETTINGS`, `CREDITS`, `QUIT GAME`); carved flared white serif title with soft violet glow; glowing 4-point star cursor left of selected item; warm copper inactive items; bottom-right inverted `[Enter] SELECT` keycap. |
| Pause | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-020112-63034.jpg` | Deep plum-violet dim overlay (`#1e0629`–`#280340`), centered carved serif `PAUSED` over a tapered copper-gold horizontal rule bisected by a glowing violet diamond/triangle flare; `[Esc] RESUME`. |
| Settings: Controls | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-120657-30740.jpg` | Top tab bar (`[Q] DISPLAY ... CONTROLS ... [E]`) with glowing purple twin-triangle hourglass behind the active tab; dotted micro-leader lines linking labels to right-aligned controls; pointed-hexagonal carousel (`WARRIOR` inverted solid white pill on active); rotated-diamond slider thumbs (`3.03`, `105%`); chamfered `OFF` toggle pill; floating dark plum right-hand tooltip card. |
| Settings: Interface | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-120658-48054.jpg` | Same settings layout with multi-segment index dashes directly below pointed-hexagonal option pills (`ENGLISH`, `ALWAYS`, `DEFAULT`, `SIZE 1`). |
| Load / Save | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-120701-44180.jpg` | Scrollable list of double-bordered dark translucent plum rows; selected row wears an electric violet-magenta rim glow and a crisp 4-point star flare at its top-left corner; right detail pane with double copper-gold frame, side diamonds, key-value metadata, diamond-centered copper rule, and `[Space] LOAD`. |
| Character Loadout | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-020121-69572.jpg` | Square gear slots framed by rarity hues (crimson, cobalt, emerald) with 4-corner sparkle dots; Level `28` stardust orb + diamond stat badges; 4 rotated-diamond ability slots + cyan Ultimate orb; ornate Lyrium Dagger holding 3 aligned diamond rune sockets. |
| Skill Tree | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-054104-64552.jpg` | Hexagonal constellation grid with luminous lavender-white paths, 3 satellite specialization hexagons, diamond `POINTS AVAILABLE` counter with chamfered corner flourishes. |
| Codex & Journal (`LIBRARY`) | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-054107-65296.jpg` | Illustrated vertical tarot-proportioned cards (`CODEX`, `MISSIVES`) over geometric linework; active card wears a bright electric violet-magenta glowing outer frame and 4-point corner star flare. |
| Area Map | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-020113-39880.jpg` | Concentric astrolabe circular rings over deep violet void, stacked isometric diamond floor selector, circular compass medallion, right-aligned pinned quest header in warm copper. |
| Modal (`RESET TO DEFAULT`) | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-054132-94904.jpg` | Deep plum translucent modal (`#1f062e`–`#280b40`), double hairline border with 45-degree chamfered copper corner accents and a centered top hollow-diamond crest; `[F] RESET ALL` and `[Esc] CANCEL`. |
| Loading Screen | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-020048-26621.jpg` | Carved pale-lavender stone emblem over smoky plum-violet fog; thin horizontal progress bar with copper-gold pointed diamond end-caps and magenta-violet gradient fill. |
| Dialogue Choice | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-020111-2156.jpg` | Warm copper-peach speaker header, diamond-centered tapered copper divider, glowing purple circular wheel with bright ice-blue/white selection arc. |
| Player Vitals & Enemy Bar | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-054140-50616.jpg` | Segmented lime-emerald player health bar (`#5FD678`), rotated-diamond ability cluster, glowing cyan-blue Ultimate meter (`78%`), crimson enemy HP bar with diamond end-caps. |
| Tactical Ability Wheel | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-054137-39977.jpg` | Dark translucent tooltip card (`FINAL RITES`) framed in double copper hairlines over radial purple ability wheel; bottom-right compact white keycap legend. |
| Minimap & Prompts | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-054120-97466.jpg` | Circular minimap framed in a thin burnished copper ring (`#CB856B`) with circular `N` badge; warm copper uppercase objective header (`SIGNS AND PORTENTS`) above crisp white sans body text; nested glowing diamond waypoint reticle with 4 diagonal corner ticks. |
| Objective & Approval Toasts | `gameuidatabase.com/uploads/Dragon-Age-The-Veilguard12262024-054117-33284.jpg` & `37311.jpg` | Dual copper hairlines around a violet astrolabe burst (`QUEST COMPLETE`); circular portrait in luminous electric violet ring with 4-point star bloom (`Davrin approves.`). |

## Measured Color Palette (GUDB 81-Swatch Strip + Visual Mapping)

| Role | Source Hex Measurements | Theme Token (`src/tokens.css`) | Notes |
| --- | --- | --- | --- |
| Deep plum-violet void & backdrops | `#1f062e` (5.56%), `#200729`, `#1d0825`, `#290a3d`, `#1e0824` | `--vg-void: #12041C`, `--vg-page: #190626`, `--vg-well: #100319` | Calmed aubergine base keeping high legibility on desktop monitors. |
| Translucent plum panels & hover | `#290b3c`, `#300145`, `#45186b`, `#501473` | `--vg-panel: #220A33`, `--vg-panel-alt: #2C0F42`, `--vg-amethyst-hover: #2E0F49`, `--vg-amethyst-deep: #3B145C` | Clear elevation steps without muddy greys. |
| Supporting cool slate-indigo | `#1b1c28` (2.78%), `#212232` | `--vg-slate: #1C1B2A` | Quiet recessed inner well for metadata & secondary blocks. |
| Burnished rose-copper (dominant framing) | `#cb856b` (27.31% of strip!), `#bd8b72`, `#a86956`, `#cc9a80` | `--vg-copper: #CB856B`, `--vg-copper-hi: #DF9D85`, `--vg-copper-press: #A86851`, `--vg-copper-dim: #7E4E42`, `--vg-copper-soft: #E5B49E` | Architectural hairlines, diamond dividers, section headers, and primary Play CTA (`6.5:1` with `--vg-ink-dark`). |
| Electric amethyst violet (selection & active magic) | `#9f53db`, `#8537B4` | `--vg-amethyst: #A355E0`, `--vg-amethyst-bright: #C58AFF`, `--vg-amethyst-bloom: #B66BFF` | Active row rim, 4-point star flare, hourglass tab marker, focus glow. |
| Lyrium frost cyan (Ultimate & Dagger runes) | `#b4e9f9`, `#5277F1` + HUD Ultimate cyan | `--vg-lyrium: #147E9E`, `--vg-lyrium-lit: #6CE0FA` | Reserved exclusively for `RunningIndicatorBrush` (`4.67:1` raw / `>5.8:1` breathing with white label). |
| Vitality emerald (HP bar & unread tab star) | Visual HUD green (`~#5FD678`) | `--vg-emerald: #5FD678` | Reserved for `DataChangeNotifBrush` (active filter 4-point star) and `PositiveRatingBrush`. |
| Veilguard crimson (Enemy HP & Unique gear) | `#D62A5B` (2.31%) | `--vg-crimson: #B8214C`, `--vg-crimson-lit: #E63969` | `DangerBrush`, close hover, `Alt+Q` Exit menu highlight (`6.25:1` with white ink). |
| Alabaster ink & muted lavender | `#FFFFFF`, `#F3F1FA`, `#B5B2BD` | `--vg-ink: #F5F1FA`, `--vg-ink-muted: #B6A8C4`, `--vg-ink-dark: #150420`, `--vg-alabaster: #F2ECF9` | Crisp white body/titles, muted lavender captions, inverted alabaster keycaps. |

## Typography & Bundled Fonts

- **Display / Headings (`HeadingFontFamily`)**: High-contrast carved flared fantasy serif modeled on Veilguard's logo, `PAUSED`, and modal headers. Implemented with open **Cinzel** (`Cinzel-Regular.ttf`, `Cinzel-Bold.ttf`, SIL OFL 1.1) bundled in `src/Typography/` (`./Typography/#Cinzel, Georgia, Segoe UI`).
- **UI Body (`FontFamily`)**: Clean Flat 2.0 humanist sans-serif matching Veilguard's menus, quest objectives (`Open the journal...`), and settings rows. Uses **Segoe UI** (built-in Windows font; rendered with OFL **Selawik** in Chromium previews so desktop and preview match).
- **Monospace (`MonospaceFontFamily`)**: **Consolas** (Cascadia Mono stand-in in previews) for technical paths and compact tabular readouts.

## Chrome, Geometry & Motion Rules

- **Double Hairline Framing**: `1px` outer burnished copper border, `2px` inner gap, `1px` dim copper inner hairline, often paired with 45-degree chamfered corner facets and a centered hollow diamond crest on modals, menus, and metadata dossiers.
- **Diamond & Pointed-Hex Vocabulary**: Rotated 45-degree diamonds appear everywhere — slider thumbs, ability/rune sockets, progress bar end-caps, divider centers, and check marks. Pointed-hexagonal / chamfered ends frame primary action plates and carousel selectors.
- **4-Point Star Flares & Hourglass Markers**: Active top tabs display a luminous purple vertical hourglass behind the icon/label; selected rows and cards pin a crisp 4-point star flare to their leading edge/corner; unread/active flags use a tiny glowing emerald 4-point star.
- **Motion Feel**: Mystical crystalline poise rather than arcade bounce — smooth `CubicEase` (`120ms` fast hover, `200ms` base selection/flare, `320ms` slow aura settle), directional left-to-right light glides and `+2px` label shifts, and subtle `BackEase` (`0.22`) only on cover medallion rise and star-flare snap.
