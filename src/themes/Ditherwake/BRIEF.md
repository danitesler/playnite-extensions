# Ditherwake — Creative Brief (Showcase)

## 1. Candidate Lenses (3 → Pick 1)

Last 5 themes in `src/themes/AGENTS.md`: **Subspace** (true-black LCARS backlit bridge console with neon elbows), **Antefelt** (deep green poker baize & slate score box), **Dewfield** (light honey parchment & carved walnut farmstead notice-board), **Counterfoil** (dark 35mm FELD film-strip & oil brush transcript), **Testbed** (light modular aluminum & carbon cleanroom).

- **(a) Diegetic / Artifact — 1807 E.I.C. Chief Inspector's Logbook & *Memento Mortem* Pocket Watch on an IBM 8503 1-Bit Display [CHOSEN]:** Playnite becomes the Honourable East India Company Insurance Assessment Ledger (*"Return of the Obra Dinn — Chief Inspector's Logbook"*) paired with the brass ***Memento Mortem* Pocket Watch**, rendered in the game's canonical **IBM 8503** (`#18191D` / `#2E3037` iron-gall slate & `#EBE5CE` vellum cream) 1-bit dithered palette and accented by its selectable monitor phosphors (**Zenith ZVM 1240 Amber** `#FDCA55`, **IBM 5151 Green** `#12824A` / `#01EB5F`, **Commodore 1084 Cyan** `#88D7DE`, **Macintosh Cyan-White** `#E5FFFF`, and **E.I.C. Sealing-Wax Crimson** `#B83228`). Surfaces wear double-ruled copperplate engraving borders with four-corner woodcut rosettes, 1-bit Bayer 4×4 stipple bands, swallowtail book-ribbon bookmark tabs, and true 1-bit monochrome vellum inversion (`#EBE5CE` plate + `#18191D` ink). Completely distinct from all 5 recent themes and every theme in the catalog.
- **(b) HUD / Telemetry — First-Person 3D Shipboard Deck Reticle (DROPPED):** In 3D exploration *Return of the Obra Dinn* displays only a tiny center reticle dot, leaving desktop views too sparse.
- **(c) Title / Pause Menu — Below-Decks Hammock & Monitor Picker (DROPPED):** The settings drawer alone omits the copperplate chapter plates, crew manifest ledger, three-fate tally stamps, and *Memento Mortem* watch dial that define the game.

## 2. Source DNA (5 Traits → Playnite Surfaces)

1. **1-Bit Ordered Bayer Dithering (`dither-band.png`, `dither-glint.png`, `vellum-stipple.png`, `dither-cells.png`):** Authentic 4×4 Bayer stipple gradients and cross-hatched woodcut headers across the rail, top bar, Play button hover wave, menu crown, and launching scan.
2. **True 1-Bit Monochrome Inversion (`#18191D` Iron-Gall Ink ↔ `#EBE5CE` Vellum Cream):** Selected library rows, active toolbar view switches, hovered metadata chips, and highlighted popup menu rows invert to solid Vellum Cream (`#EBE5CE`) with deep Iron-Gall Ink (`#18191D`, `12.8:1` contrast) and a `4px` Zenith Amber spine.
3. **Double-Ruled Copperplate Engraving Frames & Corner Rosettes:** Outer `1.5px` rule + `2px` ink gutter + `1px` inner rule with four carved corner rosette ticks framing the hero banner, metadata manifest, grid cover portraits, group boxes, and popup menus.
4. ***Memento Mortem* Pocket-Watch Dial & Zenith Amber (`#FDCA55`) Soul Trail:** The 12-tick pocket-watch dial crowns the `44px` rail (`PART_ElemMainMenu`), rotates its hands inside `PlayButton` on hover, and anchors the empty state (`EmptyGameTemplate`).
5. **1807 Maritime Typography (`Cinzel` Engraved Capitals + `Georgia`/`Gelasio` Book Serif + `Consolas` Numerals):** Engraved Roman capitals for titles, chapter ribbons, Play plaque, and score tallies; bracketed old-style book serif for lists, prose, and Settings trees; tabular monospace for manifest indices and movable-type keycaps.

## 3. Game Element Map (11 Elements)

| Source UI Element | Playnite Surface |
| --- | --- |
| *Memento Mortem* Pocket-Watch Crown & Case | `Sidebar` `44×50` main-menu watch-bezel tile (`PART_ElemMainMenu`) bearing the original **Ditherwake Watch-Compass Emblem** above a double-ruled copperplate rail |
| Book-Ribbon Swallowtail Chapter Bookmarks | Active `SidebarItem` tab, `TopPanel` active view switch, selected `GridViewItemStyle` cover ribbon, metadata manifest ribbon, and popup menu top-right bookmark |
| Woodcut Chapter Title Plate (*"VII. THE DOOM"*) | Hero banner (`HeroArt`) upper double-ruled copperplate frieze with corner rosettes & section header plaques (`LOCGameDescriptionTitle`, `LOCNotesLabel`) |
| *Memento Mortem* Soul-Burst Activation | `PlayButton` — double-ruled Vellum Cream copperplate plaque with left watch-dial seal; hover illuminates Zenith Amber (`#FDCA55`), sweeps a 1-bit Bayer dither wave, and rotates the watch hands; press flashes Macintosh `#E5FFFF` |
| Crew Manifest & Fate Deduction Ledger | `DetailsViewGameOverview` & `GridViewGameOverview` metadata pane (`300px` usable width) — double-ruled `#212329` ledger with corner rosettes and compass-diamond dividers |
| 1-Bit Inverted Fate Entry Strip | `DetailsViewItemStyle` selected row & `Menu.xaml` highlighted row — solid `#EBE5CE` Vellum Cream bar with `4px` Zenith Amber spine, Bayer-dithered right tail, and `#18191D` ink text |
| Engraved Crew Portrait Sketch Frame | `GridViewItemStyle` cover tile — `#212329` copperplate mat with corner rosette ticks, locking a bold `#EBE5CE` + `#FDCA55` double frame on selection; `48×48` octagonal brass-seal `GridTileButton` Play & Info pads |
| Three-Fate Confirmation Tally (`I · II · III`) | `RunningIndicator` (IBM 5151 Phosphor Emerald `#12824A` / `#01EB5F`) — Bayer-dithered memory scan + three sequential Roman fate tally bars (`I`, `II`, `III`) on the right edge |
| E.I.C. Insurance Assessment Stamp Plaque | `TextBlockGameScore` — cut-corner double-ruled stamp box with `4px` wax-seal status bar (Green/Amber/Crimson) and bold `Cinzel` numerals |
| E.I.C. Sealing-Wax Octagonal Close Seal | `SidePanelCloseButton` (`28×28`) — cut-corner double-ruled copperplate stamp turning solid Sealing-Wax Crimson (`#B83228`) with vellum cross on hover |
| Falmouth Anchorage Manifest Empty View | `LOCErrorNoGameSelected` empty state in both Details & Grid views — centered *Memento Mortem* watch-compass rose inside a double-ruled copperplate cartouche |

## 4. Shell & Game Page Levers (6 Structural Decisions)

1. **Hero banner transition:** Woodcut Diptych Chapter Frame — top double-ruled copperplate engraving border with corner rosettes over `PART_ImageBackground`, dissolving downward through a Bayer-dithered vignette fade and solid `#141519` `GameBannerTintBrush` scrim into `#18191D`.
2. **Play button architecture:** Double-bevelled cut-corner copperplate command plaque (`ControlCornerRadius="4"`) with an inset `1px` keyline and a left circular *Memento Mortem* watch-dial emblem. Rest: Vellum Cream (`#EBE5CE`) with `#18191D` ink `Cinzel` capitals; Hover: illuminates to Zenith Amber (`#FDCA55`), sweeps `dither-glint.png` across the plaque, and rotates the watch hands `30°`; Press: flashes Macintosh `#E5FFFF`.
3. **Metadata container & group break:** Framed `#212329` E.I.C. Crew Manifest Ledger (`300px` usable content width) enclosed in a double-ruled copperplate border (`1.5px` vellum outer rule + `2px` dark gap + `1px` inner rule) with four corner rosettes and a hanging top-right Zenith Amber swallowtail ribbon. Group breaks (`MetaProgress`..`MetaLinks`, collapsed in `Center`/`Stretch`) are tapered copperplate rules centered on a hollow 4-point compass diamond flanked by Bayer pixel ticks (`DividerTemplate`).
4. **Chip & score silhouette:** `PropertyItemButton` chips (`Tag="Chip"`) are notched book-ribbon slips (`#2E3037` slate, `1px` vellum border, `3px` Zenith Amber left binding stitch) inverting to solid `#EBE5CE` Vellum + `#18191D` ink on hover. `TextBlockGameScore` is a double-ruled assessment stamp plaque with a `4px` left status wax bar and `Cinzel` numerals.
5. **Row & cover selection mark:**
   - *Details row:* Hover fades in a Bayer-stippled slate wash (`#393C46`) and slides a hollow copperplate diamond nib (`◇`) from the left (`110ms` `CubicEase`). Selection wipes in a **1-Bit Inverted Vellum Cream (`#EBE5CE`)** ledger bar (`ScaleX 0.92 → 1.0`, `140ms`) with a `4px` Zenith Amber spine, top/bottom ink registration rules, and a Bayer-dithered right tail, flipping the row label and hover glyph to `#18191D` ink (`12.8:1`).
   - *Grid cover:* `6px` portrait mat in `#212329` with corner ticks; hover scales (`1.02`) and lights a Zenith Amber inner copperplate rule; selection locks a bold `#EBE5CE` Vellum & `#FDCA55` Amber double-ruled woodcut frame crowned by a swallowtail ribbon tab. Cover hover buttons (`GridTileButton`) are `48×48` cut-corner copperplate seals.
6. **28×28 Side-panel close plate:** `28×28` cut-corner double-ruled copperplate stamp (`#2E3037` surface, `#EBE5CE` outer rim, inset corner ticks, `13px` vellum `IconWindowClose`), stamping into solid E.I.C. Sealing-Wax Crimson (`#B83228`) with vellum rim and glyph on hover (`110ms`).

## 5. Menu & Running Game Signatures

- **Popup Menus (`ContextMenu`, `Menu`, `ComboBox`):** Compact `30px` rows on `LocalLedgerMenuBoardTemplate` (`#212329` IBM-8503 ledger board with 4% `vellum-stipple.png`, double-ruled copperplate border, four corner rosettes, `6px` top Bayer-dithered woodcut frieze, and a top-right Zenith Amber swallowtail bookmark ribbon). Highlighted rows wipe a solid **Vellum Cream (`#EBE5CE`)** 1-bit inversion strip (`ScaleX 0.90 → 1.0`, `115ms` `CubicEase`) with a `4px` Zenith Amber left spine and top/bottom ink registration rules while a fountain-pen nib pointer slides in (`-6 → 0`), inverting label, icon (`TextElement.Foreground`), submenu arrow, and movable-type shortcut block to `#18191D` ink (`12.8:1`, `+2px` nudge). Group breaks are `10px` copperplate rules centered on a hollow compass diamond with Bayer pixel dots. Shortcuts sit in notched movable-type blocks (`#18191D` well, `1px` vellum rim, `Consolas` `#FDCA55` digits at rest; inverting to `#18191D` block with `#EBE5CE` digits on highlight). Open submenus hold a steady `#362F22` brass-slate wash. Exit (`Alt+Q`) shows `#E46458` crimson at rest and stamps a solid Sealing-Wax Crimson (`#B83228`) double-ruled plate with `#F7F3E3` vellum text/icon/nib (`6.1:1`) on highlight; checked rows show a `14×14` double-ruled Zenith Amber diamond seal with `#18191D` check.
- **Running / Launching Indicator:** **IBM 5151 Phosphor Emerald** (`#12824A` plate, `#01EB5F` phosphor highlight, `#EBE5CE` vellum text ≥ 4.9:1 bare / 7.0–9.6:1 with `RunningBreath` scrim).
  - *Launching (`1.6s` loop):* 1-bit Bayer-dithered memory-trace sweep (`RunningScan` under tiled `dither-cells.png` mask) + filling `2px` copperplate foot line (`RunningFill`) + **three staggered Roman fate tally marks (`I · II · III`)** striking sequentially as the scan lands.
  - *Running (`3.2s` loop):* Quiet breathing IBM 5151 phosphor frame (`0.72 → 1.0`), full foot rule, and calm staggered pulsing of the three locked Roman fate tallies; hovering `RUNNING` Play dims with `RunningHoverDim` and reveals `Cancel` while keeping `PlayContent` `Visibility="Hidden"`.

## 6. Moments & Motion Language

- **Hero moment:** `PlayButton` hover — Vellum Cream copperplate plaque illuminates to Zenith ZVM 1240 Amber (`#FDCA55`), a 1-bit Bayer dithered soul-wave (`dither-glint.png`) sweeps across the face, and the left *Memento Mortem* watch hands rotate `30°`; pressing flashes Macintosh `#E5FFFF`.
- **Secondary moments:** Details row 1-bit vellum inversion wipe, Grid cover double-ruled portrait frame lock & staggered `48×48` `GridTileButton` seals, Sidebar active vellum-and-amber ribbon tab snap, TreeView bare-row brass wash + `2px` Zenith Amber spine, TabControl swallowtail chapter-ribbon activation, CheckBox wax-seal stamp check, Slider watch-hand dial thumb glide.
- **Durations & Easing:** Fast `110ms` (1-bit inversion snaps, hover washes, press flash), Base `175ms` (`CubicEase` Out — crisp mechanical pocket-watch & printing-press settle), Slow `320ms` (soul-burst sweep & launch/idle breathing); stagger `50ms`.

## 7. Brand & Restraint

- **Name:** **Ditherwake** (unofficial *Return of the Obra Dinn*-inspired community theme; no trademarks, no 3909 LLC logos or ripped game assets).
- **Brand Mark:** Original **Ditherwake Watch-Compass Emblem** — an octagonal pocket-watch case with a top winding crown bow enclosing an 8-point nautical compass star and asymmetrical watch hands (`BrandMarkTemplate`, `art/mark.svg`, `info/icon.png` rendered on standard repo `#FF7A1A`).
- **`GameBannerTintBrush`:** Solid iron-gall midnight slate (`#141519`, no alpha).
- **Restraint:** Library list (`#18191D`), cover grid background (`#18191D`), and metadata ledger interior (`#212329`) stay calm, flat dark iron-gall surfaces so book typography and cover art read effortlessly; 1-bit Bayer dithering is reserved for structural borders, chapter header bands, selection tails, and the Play soul-burst.
