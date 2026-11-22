# Subspace — Creative Brief (Showcase)

## 1. Candidate Lenses (3 → Pick 1)

Recent 5 themes in `src/themes/AGENTS.md`: **Dewfield** (light carved wood & honey parchment), **Counterfoil** (dark 35mm film-strip & oil brush), **Testbed** (light aluminum & carbon cleanroom), **Rushdown** (dark ultraviolet graffiti & aqua glass), **Studlock** (dark matte LEGO ABS bricks).

- **(a) Diegetic / Artifact — Backlit Kodalith Bridge Console ("Okudagram" Frame-and-Elbow Architecture) [CHOSEN]:** Playnite's shell becomes a true-black (`#000000`) 24th-century bridge console framed by the unmistakable **sweeping L-shaped LCARS structural elbow** connecting the 44px left sidebar rail into the 50px top bar with a concave inner fillet, segmented by crisp `3px` pure-black channels into classic Tangerine (`#FF9900`), Sunflower Gold (`#FFCC66`), African Violet (`#CC88FF`), Peach (`#FF9966`), and Periwinkle (`#88AAFF`) acrylic blocks, pill-capped command lozenges, and `Pathway Gothic One` uppercase bar titles. Zero visual overlap with any of the last 5 themes (or any of the 70 existing themes).
- **(b) HUD / Telemetry — Tactical Viewscreen Overlay (DROPPED):** Translucent wireframe HUD panes over starfields dilute LCARS's signature flat backlit-block geometry and drift too close to `Uplink` and `Visorline`.
- **(c) Title / Pause Menu — Single-Column Handheld PADD (DROPPED):** Narrow tablet framing wastes desktop width and forfeits the iconic sweeping sidebar-to-topbar L-elbow that makes Playnite's layout feel born for LCARS.

## 2. Source DNA (5 Traits → Playnite Surfaces)

1. **Sweeping L-Elbow with Concave Inner Fillet (`#FF9900` → `#CC88FF` → `#88AAFF`):** Connects the 44px sidebar main-menu cap cleanly into the 50px top bar's bottom tracking rail, and repeats in miniature on the metadata dossier and popup menu board.
2. **3px Pure-Black Structural Gaps on `#000000` Glass:** Segments every rail, top-bar tool group, Play lozenge endcap, metadata divider, and Settings title band into crisp backlit acrylic blocks.
3. **Bi-Color Pill-Capped Lozenge Controls (explicit half-height radii, never `CornerRadiusFull`):** `PlayButton`, active sidebar items, menu highlights, chips, and `SidePanelCloseButton` pair a short contrasting leading stub with a right-rounded pill body and `#000000` ink labels.
4. **Ultra-Compressed Display + Semi-Condensed Technical Body (`Pathway Gothic One` + `Barlow Semi Condensed` + `Consolas`):** Tall uppercase display headers embedded inline in tracking bars, paired with calm, highly legible body copy for lists, descriptions, and Settings trees.
5. **Crisp Backlit State Transitions (`CubicEase`, Press Flash, Segmented Telemetry Sweeps):** Rigid frames with instant-feeling backlit illumination, a pale-gold `#FFE6B3` press flash on Play, and segmented Warp Ops Teal sweeps for launching/running games.

## 3. Game Element Map (11 Elements)

| Source UI Element | Playnite Surface |
| --- | --- |
| Sweeping LCARS Upper-Left Corner Elbow | 44px `Sidebar` top cap (`PART_ElemMainMenu`, `22px` outer curve) + `TopPanel` `6px` segmented bottom rail with concave inner fillet (`Path`) |
| Segmented Left Rail Column Blocks | `Sidebar` vertical rail — dark backlit slots with LCARS color ticks; active item locks solid African Violet (`#CC88FF`) right-rounded lozenge with `#000000` glyph; bottom multi-block foot stack |
| Bi-Color Pill-Capped Command Bar | `PlayButton` — `10px` left rounded stub + `3px` black channel + right-rounded Tangerine (`#FF9900`) lozenge with uppercase `Pathway Gothic One` black label |
| Inline Tracking-Bar Window Header | `StandardWindowStyle` 44px Settings title band — Tangerine emblem elbow + uppercase title + segmented Violet/Peach/Periwinkle bar + block caption buttons |
| Okudagram Framed Telemetry Dossier | `DetailsViewGameOverview` & `GridViewGameOverview` metadata pane — mini top-left Tangerine-to-Violet elbow framing `300px` of calm `#0B0D14` rows |
| Tri-Block Segmented Divider Rule | Metadata group breaks (`MetaProgress`..`MetaLinks`) & `Menu` separators (`Tangerine stub · black gap · Periwinkle line · black gap · Violet cap`) |
| Segmented Warp Transfer Bar | `PART_ProgressGlobal` (`Height="12"`) & `ProgressBar` — pill-capped track with tiled black vertical block dividers |
| Science Station Ice-Cyan Status Pip | `PART_ToggleFilter` active filter indicator (`9×5px` rounded `#66CCFF` lozenge pip at top-right, never text) |
| Compact Numeric Readout Plaque | `TextBlockGameScore` — `4px` color-coded status stub (Emerald/Gold/Red) + `2px` black channel + dark readout well with tall `Pathway Gothic One` numerals |
| Mini-Elbow Popup Console Board | Unified `ContextMenu` / `TopPanelMenu` / `ComboBox` popup (`LocalLcarsMenuBoardTemplate`) with `10px` Tangerine left spine curving into segmented top cap & Sunflower Gold highlight lozenges |
| Tactical Viewscreen Subspace Calibration Screen | `LOCErrorNoGameSelected` empty state in both Details & Grid views — centered Subspace Elbow-Wave mark inside concentric segmented telemetry arcs |

## 4. Shell & Game Page Levers (6 Structural Decisions)

1. **Hero banner transition:** Clean viewscreen framing — a `4px` segmented Tangerine/Gold/Violet top tracking rail with `3px` black gaps and Periwinkle corner ticks above `PART_ImageBackground`, fading smoothly downward via a `BitmapCache` opacity mask and `GameBannerTintBrush` (`#0E0A18`) scrim into `#000000`.
2. **Play button architecture:** Dual-endcap LCARS command lozenge (`10px` left cap `CornerRadius="16,0,0,16"` + `3px` black gap + main body `CornerRadius="0,16,16,0"`). Idle Tangerine (`#FF9900`) with `#000000` ink; hover illuminates body to Sunflower Gold (`#FFCC66`), flips left cap to African Violet (`#CC88FF`), and sweeps a backlit horizontal glint (`play-glint.png`); press flashes `#FFE6B3`.
3. **Metadata container & group break:** Framed `#0B0D14` Okudagram Dossier (`300px` usable content width) crowned by a `12px` top-left Tangerine elbow curving down an `8px` left rail into Peach/Violet/Periwinkle header segments; group breaks are `3px` tri-block segmented LCARS bars (collapsed cleanly when `Center`/`Stretch`).
4. **Chip & score silhouette:** `PropertyItemButton` chips (`Tag="Chip"`) are dark backlit mini-lozenges (`#141824`, `1px` Periwinkle rim, `5px` solid Periwinkle left stub, `CornerRadius="8"`) inverting to solid `#88AAFF` + `#000000` ink on hover. `TextBlockGameScore` is a dark telemetry plaque with a `4px` left color-coded status bar and bold tall `Pathway Gothic One` numerals.
5. **Row & cover selection mark:**
   - *Details row:* Hover washes deep Periwinkle (`#162038`) and slides a `5px` rounded Periwinkle (`#88AAFF`) pill-tab from the left (`110ms` `CubicEase`). Selected locks a deep backlit violet-plum wash (`#26193B`) with a `6px` solid African Violet (`#CC88FF`) left bar + `2px` black gap + `3px` Sunflower Gold (`#FFCC66`) vertical telemetry tick springing on `ScaleY`, label `#FFFFFF`.
   - *Grid cover:* Rounded `10px` clip in `#0B0D14` socket; hover scales smoothly (`1.02`) and lights top/bottom Periwinkle LCARS bars; selected locks bold **Tangerine top-left & African Violet bottom-right L-elbow brackets** hugging the cover with `2px` black gaps. Cover hover buttons (`GridTileButton`) are `48×48` LCARS rounded-lozenge command pads (Tangerine Play + dark Periwinkle-rimmed Info).
6. **28×28 Side-panel close plate:** `28×28` right-rounded LCARS endcap key (`CornerRadius="4,14,14,4"`), `#141824` surface with `4px` Peach (`#FF9966`) leading stub, `1.5px` Peach rim, and `14px` `#F2EFE9` close glyph; hover smoothly fills solid Red Alert (`#C42828`) with Space White glyph.

## 5. Menu & Running Game Signatures

- **Popup Menus (`ContextMenu`, `Menu`, `ComboBox`):** Compact `30px` rows on `LocalLcarsMenuBoardTemplate` (`#0A0C12` panel framed on the left and top by a continuous `10px` Tangerine elbow curving into a `6px` segmented Violet/Gold top bar and Periwinkle foot cap). Highlighted rows illuminate a solid **Sunflower Gold (`#FFCC66`)** right-rounded lozenge led by a `5px` Tangerine stub (`110ms` `CubicEase`), inverting label, icon (`TextElement.Foreground`), arrow, and capsule shortcut to `#000000` ink (`13.7:1`); group breaks are `10px` tri-block Tangerine/Periwinkle/Violet segmented bars; shortcuts sit inside `CornerRadius="8"` outline telemetry capsules (`#FFCC66` text at rest, `#000000` on gold); open submenus hold a backlit African Violet plate (`#26193B`); Exit (`Alt+Q`) uses Red Alert (`#C42828`) lozenge with Space White ink (`5.9:1`); checked rows show a `14×14` Ops Emerald (`#22CC99`) pill badge with `#000000` check.
- **Running / Launching Indicator:** **Warp Ops Teal** (`#0D7F6B`, highlight Ops Mint `#38E8B8`, `#F2EFE9` Space White text ≥ 4.6:1 bare / 6.5–9.0:1 with `RunningBreath` scrim).
  - *Launching (`1.6s` loop):* Segmented telemetry block sweep (`RunningScan` under tiled vertical block mask) + filling `2px` pill-capped foot line (`RunningFill`) + 3 staggered vertical **LCARS telemetry equalizer bars** (`ScaleY` rising sequentially as the sweep lands).
  - *Running (`3.2s` loop):* Quiet breathing Ops Teal frame (`0.72 → 1.0`), full foot bar, calm staggered equalizer wave; hovering `RUNNING` Play button dims with `RunningHoverDim` and reveals `Cancel` while keeping `PlayContent` `Visibility="Hidden"`.

## 6. Moments & Motion Language

- **Hero moment:** `PlayButton` hover — Tangerine body shifts smoothly to Sunflower Gold, left cap flips to African Violet, horizontal backlit glint (`play-glint.png`) sweeps across the lozenge, and press fires a crisp `#FFE6B3` LCARS activation flash.
- **Secondary moments:** Details row hover slide & Violet+Gold selection spring, Grid cover bracket lock & staggered `48×48` `GridTileButton` pads, Sidebar active Violet lozenge snap, TreeView bare-row Periwinkle wash + `2px` Violet rail, TabControl segmented pill-tab activation, CheckBox Ops-Emerald toggle slide, Slider segmented track glow.
- **Durations & Easing:** Fast `110ms` (hovers, flash, menu highlights), Base `180ms` (`CubicEase` Out — clean mechanical telemetry settle, zero bouncy rubber), Slow `320ms` (empty-state & launch/idle breathing); stagger `50ms`. Entrance direction: left-to-right along horizontal tracking bars.

## 7. Brand & Restraint

- **Name:** **Subspace** (unofficial Star Trek LCARS-inspired fan theme; no trademarks, no Starfleet delta, no third-party artwork).
- **Brand Mark:** Original **Subspace Elbow-Wave Emblem** — a sweeping geometric LCARS quarter-elbow cradling three staggered pill-capped carrier bars (`BrandMarkTemplate`, `art/mark.svg`, `info/icon.png` on standard repo `#FF7A1A`).
- **`GameBannerTintBrush`:** Solid deep obsidian-plum (`#0E0A18`, no alpha) so banner darkening blends cleanly into the backlit black console.
- **Restraint:** Library list (`#000000`), cover grid background (`#000000`), and metadata interior (`#0B0D14`) stay dead-calm flat dark glass with high-contrast typography and subtle `3%` backlit scanline texture only on sparse decorative accents, never behind dense text or covers.
