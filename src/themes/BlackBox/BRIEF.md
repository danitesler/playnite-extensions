# Black Box — Creative Brief

Mode: **Showcase**. Unofficial **light** Playnite desktop theme inspired by *NieR:Automata*'s YoRHa android operating system UI and HUD (see [`RESEARCH.md`](RESEARCH.md)): warm khaki-parchment telemetry sheets (`#d1cdb7` / `#dad4bb`), inverted charcoal-olive selection slabs (`#454138`) with top/bottom tracking rails, musical-staff double-bar headers (`▊▏`), diamond-and-dot borders (`───◇─•─◇───`), track-mounted `▶▪` cursors, Plug-in Chip capacity gauges, and terracotta rust combat alerts (`#b8523b` / `#cd664d`).

## 1. Source DNA (5 traits -> where each lands)

| Trait | Evidence (`RESEARCH.md`) | Lands on |
|---|---|---|
| **Warm Khaki Parchment + 32px Coordinate Telemetry Grid** | Pause / System menu (`#d1cdb7` ground, `#dad4bb` panel, `#e4dfc9` well) | `WindowBackgourndBrush` (`#d1cdb7`), `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` (`#dad4bb`), `InputBackgroundBrush` (`#e4dfc9`), sparse `grid-scan.png` coordinate + scanline overlay in header/empty states |
| **YoRHa Charcoal-Olive Inversion + Top/Bottom Rail Tracks + `3px` Offset Shadow** | Menu rows, System tabs, modal buttons (`#454138` fill, `#f2efe0` text, `2px` outer top/bottom `1px` rules) | `DetailsViewItemStyle`, `ListViewItem`, `Button`, `TopPanelItem`, `TabItem`, `PlayButton` (`4px` left bar at rest; inverts on hover/selected with top & bottom `1px` tracking rules and `3px` right/bottom `#b4af9a` offset shadow) |
| **Musical Staff Double-Bar (`▊▏`) & Diamond-Dot Frieze (`───◇─•─◇───`)** | Kijima's musical notation motifs on screen headers & panel dividers | `TopPanel` & `StandardWindowStyle` closing `diamond-frieze.png` rule; `GroupBox`, `Metadata` card, and game title preceded by the `▊▏` musical double-bar (`5px` + `2px` vertical bars) |
| **Track-Mounted Mechanical Pointer Cursor (`▶▪`)** | Pause menu & System tree item cursor | `DetailsViewItemStyle` and `TreeView.xaml` (`Settings` section list): `▶▪` triangle-and-diamond pointer in the left gutter on selected rows |
| **Terracotta Rust Lock-On (`#b8523b`), Pod Amber (`#b88228`) & Pod-Link Teal (`#386e5a`)** | Equipped/alert markers, HUD notifications, and Pod transmission states | `PlayButton` & Primary `Save` (`#b8523b` -> `#cd664d` hover); active filter diamond (`#b88228` `DataChangeNotifBrush`); `RunningIndicatorBrush` (`#386e5a` Pod-Link Teal sweep & telemetry diamonds) |

## 2. Game Element Map (10 source UI parts -> Playnite surfaces)

| Source UI Part | Playnite Surface | Translation |
|---|---|---|
| **YoRHa Pause Menu Inverted Row + `▶▪` Cursor** | `DetailsViewItemStyle`, `ListViewItem` | Resting warm khaki row with `4px` left bar; selected inverts to `#454138` charcoal slab with `#f2efe0` text, top/bottom `1px` tracking hairlines, and left `▶▪` pointer cursor |
| **System Menu Category Bar (`MAP / ITEMS / SKILLS / SYSTEM`)** | `TopPanel` & `TopPanelItem` | `52px` charcoal-olive `#454138` command header band closed by `───◇─•─◇───` frieze; search well + icon-only view switches that invert to warm parchment `#ece8d5` with top/bottom tracking rules when active |
| **Pod Fire-Control / Alert Action Slab** | `PlayButton` (+ `PART_ButtonContextAction`) | `40px` rectilinear slab in Terracotta Rust (`#b8523b`) with `▊▏` double-bar left cap, top/bottom tracking rails, `3px` offset shadow, and `scan-glitch.png` + `cursor-glow.png` telemetry sweep on hover |
| **Plug-in Chip Storage Capacity Gauge** | `Slider` & `ProgressBar` | Framed `#454138` capacity channel with diamond end-stops (`◆`), high-contrast fill bar, and rotated square/diamond thumb |
| **System Options Toggle (`[ ▪ ON / OFF ]`)** | `CheckBox` & `RadioButton` | Crisp square `#454138` terminal box with inner diamond (`◆`) check mark and `2px` offset shadow; `45°` rotated diamond radio indicator |
| **Intel / Unit Data Dossier Sheet** | `Metadata` pane (`DetailsView` & `GridView`) | Framed `#e4dfc9` parchment dossier topped by a `#454138` header strip with `▊▏` double-bar and `───◇─•─◇───` divider, `1px` `#b4af9a` group rules, and `#dad4bb` bordered tag chips with `3px` left bar |
| **Bunker Terminal Command Rail** | `Sidebar` & `SidebarItem` | `44px` `#c4bfa8` khaki-taupe rail with `1px` `#454138` spine line, `#454138` `MainMenuButton` holding the Black Box emblem, and `44×40` items that invert to `#454138` with a terracotta left bar when active |
| **System Settings Tree (`TreeView`)** | `DefaultControls/TreeView.xaml` | Minimal `28px` bare rows in body font (`Segoe UI`), soft olive wash on hover, `#454138` inverted slab + `2px` terracotta left bar + `▶▪` cursor on selected, reserved `Visible` scroll lane |
| **System Dialog Header Band (`StandardWindowStyle`)** | `DerivedStyles/StandardWindowStyle.xaml` | `44px` `#454138` charcoal-olive band with `▊▏` double-bar, Sora geometric title, ghosted `pod-reticle.png` + Black Box geometric watermark at right, and `───◇─•─◇───` bottom frieze |
| **Pod Transmission Link / Hacking Sweep** | `RunningIndicator` & `RunningActionIndicator` | Dedicated Pod-Link Teal (`#386e5a`) frame, dark keyline, angled telemetry scan band (`RunningScan`, `1.6s`), `2px` bottom capacity line (`RunningFill`), and twin pulsing `◇` telemetry nodes |

## 3. Moments & Motion Language

- **Hero Moment (`PlayButton` hover & press):** Over `180ms` (`CubicEase` `EaseOut`), the Terracotta Rust slab brightens from `#b8523b` to `#cd664d`, top and bottom `1px` tracking hairlines extend above and below the button, `cursor-glow.png` phosphor halo (`-18px`) warms in, and `scan-glitch.png` sweeps horizontally across the plate. Leaving glides out over `280ms` (`FillBehavior="Stop"`). Pressing snaps (`90ms`) to deep bunker rust (`#943e2b`).
- **Secondary Moments (6):**
  1. **Cover hover (`GridViewItemStyle`):** Static selected state draws a `2px` `#b8523b` terracotta frame + corner diamonds; hover animates (`180ms`) a `#454138` charcoal double-frame with extending top/bottom tracking rules and corner crosshairs.
  2. **Cover hover controls (`GridViewItemTemplate`):** `44×44` rectilinear YoRHa plates (`#b8523b` Play, `#454138` Info with `3px` left bar) rise `10px` and scale `0.88 -> 1.0` with `BackEase` (`200ms`, `60ms` stagger).
  3. **Sidebar item selection:** `160ms` inversion to `#454138` charcoal slab with `#f2efe0` glyph and `3px` `#cd664d` left indicator bar.
  4. **Settings `TreeView` row:** `120ms` `#4541381f` hover wash; `180ms` `#454138` inverted slab + `2px` `#cd664d` bar + `▶▪` cursor on selected.
  5. **Tab switch (`TabControl`):** `160ms` inversion from `#c4bfa8` khaki tab to `#454138` charcoal slab with top `2px` terracotta bar.
  6. **CheckBox / Slider:** `120ms` diamond `◆` check lock-in; `Slider` diamond thumb brightens to `#cd664d` on hover.
- **Ambient Loops (2, sparse areas only):**
  1. **Empty game page (`EmptyGameTemplate` in both overviews):** Centered **Black Box Pod Reticle** (concentric dashed ring + 4 cardinal diamond nodes + `pod-reticle.png`) pulsing gently (`3.2s` sine cycle on `Opacity`) above `LOCErrorNoGameSelected` (`PART_ScrollViewHost` explicitly `Visibility="Visible"`).
  2. **Running game (`RunningIndicator`):** `1.6s` Pod-Link Teal (`#386e5a`) telemetry scan sweep + filling `2px` foot bar while launching; calm `3.2s` breathing frame + alternating `◇◇` telemetry nodes while running (`Cancel` on `PlayButton` `IsMouseOver` via `RelativeSource Self`).
- **Motion Vocabulary:** `fast = 110ms`, `base = 180ms`, `slow = 280ms`; `CubicEase` (`EaseOut`) for mechanical track slides, `BackEase` (`Amplitude="0.3"`) for cover buttons (`10px` rise, `60ms` stagger).

## 4. Brand & Restraint

- **Brand Name & Mark (`Black Box` / `blackbox`):** Unofficial fan theme. Original geometric vector mark (`art/mark.svg` & `BrandMarkTemplate`): an interlocking **45° Black Box Octagram / Concentric Diamond Core** flanked by musical double-bar ticks (`▊▏ ◇ ▏▊`) — inspired by *NieR:Automata*'s geometric HUD nodes with zero proprietary logos or artwork.
- **`GameBannerTintBrush`:** `--bb-charcoal-deep` (`#333029`), solid deep bunker charcoal-olive so darkening a game banner in ThemeModifier casts the artwork into YoRHa's warm charcoal-sepia tone rather than pure black.
- **Light Theme Window Art (`WindowArtForegroundBrush`):** `--bb-ivory` (`#f2efe0`). When Playnite's *"Use game background image as window background"* is enabled, unselected game rows, `Expander` group headers, and game titles flip to `#f2efe0` so text remains crisp over dark background art, while hovered/selected plates keep their high-contrast fills.
- **Restraint:** Dense game lists, cover grid backgrounds, and metadata rows stay on calm, flat `#d1cdb7` / `#dad4bb` / `#e4dfc9` surfaces; `grid-scan.png` and `diamond-frieze.png` appear only on chrome bands, empty states, and card headers.
