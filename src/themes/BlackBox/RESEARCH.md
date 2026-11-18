# Black Box — Reference Research

Reference research for **Black Box**, an unofficial Playnite desktop theme inspired by the **YoRHa android operating system UI and HUD** of *NieR:Automata* (PlatinumGames / Square Enix, 2017; UI & Mecha Design by **Hisayoshi Kijima**, directed by **Yoko Taro**). Research date: 2026-11-17.

## 1. Sources & Reference Captures

| Source | Details |
|---|---|
| **Interface In Game Archive** | [Interface In Game — NieR:Automata](https://interfaceingame.com/games/nierautomata/): 1920×1080 captures of Pause / System Menu (`MAP`, `QUESTS`, `ITEMS`, `WEAPONS`, `SKILLS`, `INTEL`, `SYSTEM`), Plug-in Chip Storage HUD, Pod Programs, Shop / Buy screens, Quest Log, Map telemetry overlay, Boss Intros, and Hacking HUD. Viewed for color, proportion, chrome, and motion measurement; zero copyrighted captures or assets are downloaded or shipped. |
| **PlatinumGames UI Design Breakdown** | Hisayoshi Kijima, *"The UI of NieR:Automata"* (PlatinumGames Official Developer Blog): documents Yoko Taro's core directive (*"make it a nice, warm beige"*), the transition from high-contrast monochrome to warm low-contrast khaki/charcoal, the integration of **musical notation** (staff lines, double-bar repeat marks `▊▏`, diamond/dot rests) into a sterile futuristic android OS, and the mechanical track-mounted pointer cursor. |
| **Open-Source YoRHa CSS Reference** | [`metakirby5/yorha`](https://github.com/metakirby5/yorha) (MIT): community CSS specification of the *NieR:Automata* menu system, cross-checked against 1080p game captures for exact surface hex values (`#dad4bb`, `#d1cdb7`, `#cdc8b0`, `#bab5a1`, `#454138`, `#4e4b42`, `#cd664d`), `3px 3px 0` hard offset shadows, top/bottom `1px` hover/selection rail tracks, and `▊` left block bars. |
| **Typography** | Source uses Fontworks **FOT-Rodin Pro** (clean geometric sans-serif with wide tracking on uppercase system headers) paired with monospace numeric readouts. **Theme stand-ins:** bundled **Sora** (`Regular`, `SemiBold`, `Bold` static TTFs, SIL OFL 1.1, in `src/Typography/`) for `HeadingFontFamily`; Windows **Segoe UI** (`Selawik` in previews) for `FontFamily`; **Consolas** (`Cascadia Mono` in previews) for `MonospaceFontFamily`. |
| **Icons** | Custom vector `Geometry` definitions in `src/Media.xaml` drawn in the angular mechanical YoRHa line/diamond style (`IconSearch`, `IconFilter`, `IconSort`, `IconGroup`, `IconDetailsView`, `IconGridView`, `IconListView`, `IconMainMenu`, `IconPlay`, `IconDownload`, `IconInfo`, `IconOptions`, `IconEdit`, `IconWindowMinimize`, `IconWindowMaximize`, `IconWindowRestore`, `IconWindowClose`, `IconCheck`, `IconDropDown`, `IconSubmenu`). |
| **Procedural FX Masks (`art/sprites.py`)** | Deterministic Python (`Pillow` + `NumPy`, fixed seed `20170223`) white-mask RGBA generator outputting `src/Images/fx/`: `grid-scan.png` (32×32 coordinate grid with `+` micro-crosshairs and horizontal CRT scanlines), `diamond-frieze.png` (`───◇─•─◇───` YoRHa diamond-and-dot border ornament), `cursor-glow.png` (9-slice soft warm parchment/amber CRT phosphor bloom), `scan-glitch.png` (horizontal android telemetry scan-beam), and `pod-reticle.png` (concentric Pod targeting ring + diagonal ticks). |

## 2. Measured Color Swatches & Role Calibration

| Visual Role | Measured Hex | Token (`src/tokens.css`) | Observed Source Element |
|---|---|---|---|
| **Telemetry Ground (Deep Khaki)** | `#d1cdb7` | `--bb-canvas` | Base Pause/System menu background behind active sheets (`MAP` / `SYSTEM` backdrop) |
| **Primary Parchment Surface** | `#dad4bb` | `--bb-surface` | Main menu containers, item lists, description cards, and dialog body |
| **Raised Sheet / Input Well** | `#e4dfc9` | `--bb-surface-hi` | Active sub-panels, search/input wells, dropdown sheets, tag chips |
| **Luminous Ivory Highlight** | `#f2efe0` | `--bb-ivory` | High-contrast text on dark charcoal-olive `#454138` and terracotta `#b8523b` slabs; window-art foreground |
| **Muted Khaki Plate / Drop Shadow** | `#c4bfa8` | `--bb-plate` | Compact left rail, unselected secondary plates, `3px` offset shadow block |
| **Grid Hairline / Border Taupe** | `#b4af9a` | `--bb-grid` | 32px coordinate grid rules, card borders, group dividers (`#454138` at 28% / `#b4af9a`) |
| **Muted Olive-Taupe Ink** | `#6e6a5c` | `--bb-ink-muted` | Secondary captions, uninstalled games, metadata field labels (`~4.6:1` on `#dad4bb`) |
| **Charcoal-Olive Primary Ink & Slab** | `#454138` | `--bb-charcoal` | Primary typography (`~8.1:1` on `#dad4bb`), inverted selected rows/tabs, top bar header band, left `4px` block bars |
| **Deep Bunker Charcoal** | `#333029` | `--bb-charcoal-deep` | Pressed charcoal plates, deep keylines, `GameBannerTintBrush`, tooltip panel fill |
| **Warm Olive Hover Slab** | `#575247` | `--bb-charcoal-hi` | Hovered charcoal buttons, subtle row hover wash (`#45413822`) |
| **Terracotta Rust Alert (Primary CTA)** | `#b8523b` | `--bb-terracotta` | Signature YoRHa alert/equipped/combat lock-on red-orange (`#cd664d` darkened slightly to `#b8523b` for `> 4.7:1` contrast under `#f2efe0` ivory text) |
| **Terracotta Hover / Lit** | `#cd664d` | `--bb-terracotta-hi` | Hovered Play CTA & equipped chip highlight |
| **Terracotta Pressed** | `#943e2b` | `--bb-terracotta-deep` | Pressed Play CTA & active alert border |
| **Destructive / Self-Destruct Red** | `#a63228` | `--bb-danger` | Corrupt data / self-destruct warning, window and side-panel Close hover |
| **Pod Amber Telemetry** | `#b88228` | `--bb-amber` | Active filter diamond pip (`DataChangeNotifBrush`), mixed scores, system warnings |
| **Pod-Link Sage Teal (Running)** | `#386e5a` | `--bb-pod-teal` | `RunningIndicatorBrush` & positive ratings — hacking/transmission status green-teal (`> 5.4:1` contrast under `#f2efe0`), completely distinct from `#454138` charcoal selection and `#b8523b` terracotta Play |
| **Pod-Link Cyan Focus** | `#3a6b7c` | `--bb-focus` | Keyboard focus ring and active link highlight |

## 3. Design Rules & Proportions Measured from Captures

- **Warm Beige Monochrome + Sharp Inversion:** Unlike dark sci-fi UIs, *NieR:Automata* places dark charcoal-olive `#454138` text and `1px` `#b4af9a` coordinate grids on warm khaki parchment (`#d1cdb7` / `#dad4bb`). Resting buttons and rows carry a `4px` solid `#454138` vertical bar on their left edge (`▊`). Selecting or hovering an item **inverts** the plate to solid `#454138` charcoal-olive (or `#b8523b` terracotta for Primary CTAs) with `#f2efe0` ivory text, flanked above and below by `1px` horizontal tracking hairlines offset `2px` outside the slab.
- **Musical Staff Double-Bar (`▊▏`) & Wide-Tracked Capitals:** Every top-level category and panel title begins with a musical double-bar mark (`5px` bar + `2px` gap + `2px` bar) and wide-spaced geometric capitals (`S Y S T E M`, `I N T E L`).
- **YoRHa Diamond-and-Dot Frieze (`───◇─•─◇───`):** Horizontal dividers under the top bar, dialog title band, and section headers feature a `1px` rule punctuated by `45°` open diamonds enclosing center pips (`diamond-frieze.png` + vector `Path`).
- **Track-Mounted Mechanical Pointer Cursor (`▶▪`):** Selected rows in the game list and Settings tree display the signature YoRHa mechanical cursor in the left gutter: a sharp right-pointing triangle (`▶`) followed by a rotated square diamond (`▪`) riding on a vertical track.
- **Plug-in Chip Storage Capacity Bars (`Slider` / `ProgressBar`):** Gauges are framed in `1px` `#454138` with diamond end-markers and filled with crisp high-contrast `#454138` / `#b8523b` capacity blocks.
- **Zero Corner Rounding (`0px`–`2px`):** The YoRHa OS is strictly rectilinear (`ControlCornerRadius` = `0`, `CornerRadiusSmall` = `0`, `CornerRadiusLarge` = `2` for subtle cover bevels).

## 4. Measured Sizes (1080p capture -> Playnite Desktop)

| Element | 1080p Capture | Playnite Theme (`Common.xaml`) |
|---|---|---|
| Standard Menu / List Row Height | `42px`–`46px` | `32px` (`ControlHeight` = `32`; Settings `TreeView` rows `28px`; Filter controls `28px`) |
| Left Block Bar (`▊`) Width | `5px`–`6px` | `4px` on resting buttons/rows, `2px` inner gap |
| Offset Drop Shadow | `3px 3px 0 #b4af9a` | `3px` right/bottom offset `Border` (`#b4af9a` / `NormalBorderBrush`) on buttons & cards |
| Top Bar / Header Strip | `56px` | `52px` (`TopPanel`), `44px` (`StandardWindowStyle` title band) |
| Compact Left Sidebar Rail | `48px` | `44px` wide, `44×40` items, `16px` glyphs |
| Primary Play CTA & Secondary Actions | `44px` | `40px` height (`PlayButton`), `40×40` square icon-only `More` and `Edit` |

## 5. Motion Analysis

- **Snap-Slide & Track Extension (`160ms`–`220ms` `CubicEase`):** In *NieR:Automata*, hovering or selecting a menu row rapidly sweeps a dark `#454138` fill across the row while the top and bottom `1px` tracking lines extend outward and the left `▶▪` cursor slides `4px` into lock.
- **Telemetry Scan & CRT Phosphor Settling (`280ms`–`340ms`):** Opening panels or hovering primary actions triggers a brief horizontal scanline sweep (`scan-glitch.png`) that settles into a steady state.
- **Standby Pod Reticle (`3.2s` sine loop):** Sparse empty screens (`EmptyGameTemplate`) rotate/pulse a geometric Pod targeting reticle (`pod-reticle.png` + vector rings) above `LOCErrorNoGameSelected`.
