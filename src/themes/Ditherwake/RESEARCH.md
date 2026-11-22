# Return of the Obra Dinn — Research Notes

Reference research for **Ditherwake**, an unofficial desktop theme inspired by Lucas Pope's 1-bit maritime mystery ***Return of the Obra Dinn*** (3909 LLC, 2018): its 1807 Honourable East India Company Insurance Assessment Logbook (*"Return of the Obra Dinn — Chief Inspector's Logbook"*), the brass-and-skull ***Memento Mortem* Pocket Watch**, and its vintage monochrome CRT/LCD 1-bit Bayer-dithered display profiles.

## Sources & Reference Material

1. **In-Game Monitor Palettes (Lospec & Lucas Pope Devlogs):**
   - **IBM 8503 (`https://lospec.com/palette-list/obra-dinn-ibm-8503`):** Canonical 2-color paper-white/vellum sepia monochrome (`#2E3037` dark iron-gall slate, `#EBE5CE` warm vellum cream).
   - **LCD (`#333319` / `#EBE5CE`):** High-contrast warm dark ink and vellum cream default display mode.
   - **Zenith ZVM 1240 (`https://lospec.com/palette-list/obra-dinn-zenith-zvm-1240`):** Amber monochrome monitor (`#3F291E` dark umber, `#FDCA55` golden-amber phosphor).
   - **IBM 5151 (`https://lospec.com/palette-list/obra-dinn-ibm-5151`):** Green phosphor monitor (`#25342F` dark phosphor slate, `#01EB5F` vibrant emerald phosphor).
   - **Commodore 1084 (`https://lospec.com/palette-list/obra-dinn-commodore-1084`):** Blue-cyan monitor (`#40318E` indigo, `#88D7DE` maritime cyan).
   - **Macintosh (`https://lospec.com/palette-list/obra-dinn-macintosh`):** Compact Mac 128K/SE phosphor (`#333319` dark ink, `#E5FFFF` pale cyan-white highlight).
2. **Lucas Pope's Development Logs (TIGSource & Medium — Dithering & Book UI):**
   - Ordered Bayer 4×4 and 8×8 stipple matrices combined with 19th-century copperplate and woodcut engraving frames (double-ruled borders, four-corner floral/compass rosettes, cross-hatched chapter banners, and notched swallowtail ribbon bookmarks).
   - **The Three-Fate Confirmation Mechanic:** Every three accurately deduced fates trigger a tactile rhythmic stamp and lock into the ledger in permanent ink (`I · II · III` Roman tally cadence).
   - **1-Bit Monochrome Inversion:** Hovering and selecting entries in the logbook, crew manifest, or options screen inverts the row between dark ink (`#2E3037` / `#18191D`) and solid vellum cream (`#EBE5CE`).
3. **Typography:**
   - The game sets logbook body prose, fate descriptions, and manifest tables in **IM Fell DW Pica** (Igino Marini's digital revival of Bishop John Fell's 17th-century Oxford press types) paired with engraved Roman capitals for chapter plates (`"I. LOOSE CARGO"`, `"II. A BITTER COLD"`, `"VII. THE DOOM"`).
   - **Bundled & System Fonts in Ditherwake:**
     - **Cinzel** (`Cinzel-Regular.ttf`, `Cinzel-Bold.ttf`, SIL OFL 1.1, bundled in `src/Typography/`) — classical 19th-century engraved Roman display capitals for titles, chapter banners, `PlayButton`, score plaques, and the Settings title band.
     - **Georgia / Palatino Linotype** (Windows system book serif; rendered identically in Chromium previews via **Gelasio**, SIL OFL 1.1) — bracketed old-style printing serif for logbook game lists, descriptions, metadata captions, and 28–30px Settings tree rows.
     - **Consolas** (Windows monospace; rendered via **Cascadia Mono** in previews) — tabular manifest numbers (`#01`–`#60`), timestamps, and movable-type keycap shortcuts.

## Canonical Color Palette & WCAG 2.1 AA Contrast Verification

Ditherwake grounds its shell in the **IBM 8503** dark iron-gall slate (`#18191D` / `#212329` / `#2E3037`) and **Vellum Cream** (`#EBE5CE`), using **true 1-bit vellum inversion** (`#EBE5CE` plate with `#18191D` dark ink) for selected rows and highlighted menu items, while assigning the game's other official monitor phosphors to distinct semantic states:

| Token | Hex | Obra Dinn Role | Measured Contrast |
| --- | --- | --- | --- |
| `--od-ink-void` | `#18191D` | Deep iron-gall print ground (`WindowBackgourndBrush`, shell, library list, text on vellum) | Base / **12.8:1** on `#EBE5CE` |
| `--od-slate-ledger` | `#212329` | Recessed IBM 8503 ledger sheet (`PopupBackgroundBrush`, metadata card, inputs) | Base raised |
| `--od-slate-surface` | `#2E3037` | Canonical IBM 8503 dark shade (`NormalBrush`, buttons, inactive chips, tracks) | `#EBE5CE` text = **8.8:1** |
| `--od-slate-hover` | `#393C46` | Stippled slate hover wash (`HoverBrush`, `ListItemHoverBrush`) | `#EBE5CE` text = **7.1:1** |
| `--od-slate-press` | `#454956` | Pressed slate control fill | `#EBE5CE` text = **5.7:1** |
| `--od-banner-tint` | `#141519` | Solid dark iron-gall etching ground for `GameBannerTintBrush` | Solid (no alpha) |
| `--od-vellum` | `#EBE5CE` | Canonical IBM 8503 Vellum Cream: primary text, copperplate rules, 1-bit inverted selection & Play plate | On `#18191D` = **12.8:1**; on `#212329` = **11.2:1** |
| `--od-vellum-bright` | `#F7F3E3` | Sunlit vellum highlight & active text on dark plates | On `#18191D` = **14.5:1** |
| `--od-vellum-muted` | `#B8B19A` | Aged rag-paper secondary text, metadata captions, idle icons | On `#18191D` = **7.5:1**; on `#212329` = **6.5:1** |
| `--od-vellum-dim` | `#87816D` | Stippled copperplate inner rules & subtle dividers | On `#18191D` = **4.1:1** |
| `--od-border` | `#4A4942` | Outer structural iron-gall rule | Structural |
| `--od-border-strong` | `#7A7564` | Burnished copperplate frame rule (`NormalBorderBrush`) | Structural |
| `--od-zenith-amber` | `#FDCA55` | Canonical Zenith ZVM 1240 Amber: *Memento Mortem* watch hands, Play hover, selection spine | `#18191D` ink = **10.7:1**; on `#18191D` = **10.7:1** |
| `--od-zenith-deep` | `#C89628` | Burnished pocket-watch brass bezel & active border | On `#18191D` = **6.3:1** |
| `--od-zenith-wash` | `#362F22` | Held warm brass-umbria wash for selected Settings `TreeViewItem` & open submenus | `#EBE5CE` text = **9.2:1** |
| `--od-mac-flash` | `#E5FFFF` | Canonical Macintosh 1-bit phosphor cyan-white: Play button press flash | `#18191D` ink = **15.8:1** |
| `--od-comm-cyan` | `#88D7DE` | Canonical Commodore 1084 Cyan: active filter compass pip (`DataChangeNotifBrush`), links, focus | On `#18191D` = **9.8:1** |
| `--od-comm-halo` | `#2B4C52` | Focus halo & maritime link underline tint | Structural |
| `--od-ibm-green` | `#12824A` | IBM 5151 Phosphor Emerald plate: `RunningIndicatorBrush` (distinct from Vellum, Amber, Cyan, Crimson) | `#EBE5CE` text = **4.9:1** bare, **7.0–9.6:1** with scrim |
| `--od-ibm-phosphor` | `#01EB5F` | Canonical IBM 5151 bright phosphor green: running tally marks (`I · II · III`) & foot fill | On `#18191D` = **10.1:1** |
| `--od-wax-red` | `#B83228` | E.I.C. Sealing-Wax Crimson: `DangerBrush`, Exit (`Alt+Q`) highlight stamp, Close button hover | `#EBE5CE` text = **5.4:1**; `#F7F3E3` = **6.1:1** |
| `--od-wax-red-hi` | `#E46458` | Bright wax-red rest label for Exit & negative ratings | On `#18191D` = **5.3:1** |

## Geometry, Chrome & Component Anatomy

1. **Double-Ruled Copperplate Engraving Frames (`LocalCopperplateFrameTemplate`):**
   - Chapters, portrait vignettes, metadata ledgers, and popup menus use a classic 1807 double-line engraving border: a `1.5px` vellum/brass outer rule, a `2px` dark ink gutter, a `1px` inner rule, and **four carved corner rosette ticks** (`L`-brackets with an inset `3×3` square/diamond).
2. **1-Bit Ordered Bayer Dither Masks (`src/Images/fx/*.png`):**
   - Generated deterministically by `art/sprites.py` as pure-white (`#FFFFFF`) RGBA alpha masks:
     - `dither-band.png`: Horizontal 4×4 Bayer ordered-dither gradient strip for woodcut chapter headers, menu crowns, and row selection tails.
     - `dither-glint.png`: Radial 1-bit stippled *Memento Mortem* soul-burst sweep across `PlayButton` on hover.
     - `vellum-stipple.png`: Subtle seamlessly tileable 1-bit engraving stipple (3–4% opacity) for sparse header/panel surfaces.
     - `dither-cells.png`: Tiled 1-bit Bayer stepped cell mask for `PART_ProgressGlobal` and launching scan bands.
3. **Swallowtail Book-Ribbon Bookmark Tabs:**
   - Notched ribbon tabs (`M 0,0 L 14,0 L 14,20 L 7,15 L 0,20 Z`) hang from the top bar, active grid covers, metadata manifest header, and popup menu boards.
4. ***Memento Mortem* Pocket-Watch Dial & Hands:**
   - The circular skull-and-compass pocket watch dial crowns the `44px` left rail (`PART_ElemMainMenu`), sits in the `PlayButton` left seal (rotating its hands on hover), and anchors the centered empty game page (`EmptyGameTemplate`).

## Motion & State Behavior

- **Crisp Ink-Stamp & Page-Turn Cadence (`CubicEase` Out):** Fast `110ms` (1-bit vellum row/menu inversion, press stamp), Base `175ms` (row slide, cover frame lock, watch-hand rotation), Slow `320ms` (soul-trail sweep & empty-state watch breathing).
- **Three-Fate Deduction Running Sweep (`I · II · III`):** Launching sweeps a 1-bit Bayer-dithered IBM 5151 phosphor wave (`1.6s` loop) across the surface while filling the copperplate foot rule and striking three Roman fate tally marks (`I`, `II`, `III`) on the right edge; while running, the frame and three locked tallies breathe on a calm `3.2s` cycle.
