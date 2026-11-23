# Black Box — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) inspired by the **YoRHa android operating system UI and HUD** of **NieR:Automata** (PlatinumGames / Square Enix, 2017; UI design by Hisayoshi Kijima). A **light** theme: warm khaki-parchment telemetry sheets (`#d1cdb7` / `#dad4bb`), inverted charcoal-olive selection slabs (`#454138`) with top/bottom tracking rules and `▶▪` mechanical pointer cursors, musical-staff double-bar headers (`▊▏`), diamond-and-dot friezes (`───◇─•─◇───`), Plug-in Chip capacity bars, and terracotta rust primary CTAs (`#b8523b` / `#cd664d`).

Unofficial and fan-made: not affiliated with, endorsed by, or sponsored by Square Enix or PlatinumGames. Contains no game art, logos, or proprietary font files (`info/NOTICE-BlackBox.txt`).

Shared anatomy: **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, pixel measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (ambition, source DNA, game element map, signature moments, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

Tokens live in `src/tokens.css` under `--bb-*`; `src/Constants.template.xaml` maps Playnite palette keys and shared keys by role.

| Token | Key | Used for |
|---|---|---|
| `bb-canvas` (`#d1cdb7`) | `WindowBackgourndBrush`, `ContentBackgroundBrush` | Library telemetry ground, game list column, Settings tree column |
| `bb-surface` (`#dad4bb`) | `GameOverviewBackgroundBrush`, `ScrimBrush`, `PropertyItemBackgroundBrush` | Game page surface, dialog body, Plug-in Chip tags |
| `bb-surface-hi` (`#e4dfc9`) | `ExpanderBackgroundBrush`, `PopupBackgroundBrush`, `InputBackgroundBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush` | Metadata dossier, Description/Notes cards, inputs, popups, tracks |
| `bb-plate` (`#c4bfa8`) | `ShellBackgroundBrush`, `ButtonBackgroundBrush`, `NormalBrush`, `BevelShadowBrush`, `TopPanelRuleStartBrush` | 44px left rail, resting buttons, `3px` hard offset shadows, top-bar diamond frieze |
| `bb-grid` (`#b4af9a`) | `PanelSeparatorColor`, `WindowPanelSeparatorColor`, `TopPanelSeparatorBrush`, `FrameInnerBrush` | Dividers, card rims, coordinate grid hairlines |
| `bb-charcoal` (`#454138`) | `TextColor`, `SelectedBrush`, `ListItemSelectedBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush`, `HeaderBandBrush`, `ButtonHoverBackgroundBrush` | Primary ink, inverted selected rows/tabs, 52px top command bar, 44px dialog title band, card header bands, hovered buttons |
| `bb-charcoal-deep` (`#333029`) | `GameBannerTintBrush`, `ArtTintBrush`, `TooltipBackgroundBrush`, `ButtonPressedBackgroundBrush` | Banner darkening cast, running-plate darkening, tooltips, pressed charcoal plates |
| `bb-ivory` (`#f2efe0`) | `TextColorDark`, `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush`, `WindowTitleForegroundBrush`, `WindowArtForegroundBrush`, `TopPanelItemCheckedBackgroundBrush` | High-contrast text on charcoal/terracotta slabs, toggled top-bar plates, text over window background art |
| `bb-terracotta` / `bb-terracotta-hi` (`#b8523b` / `#cd664d`) | `PrimaryButtonBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `GlyphColor`, `HighlightGlyphColor`, `SelectedBorderBrush` | Rectilinear Play/Save CTA, active cursor/left-bar accents, links, checkmarks |
| `bb-pod-teal` (`#386e5a`) | `RunningIndicatorBrush`, `PositiveRatingBrush` | Dedicated Pod-Link Teal running/launching indicator and positive scores |
| `bb-amber` (`#b88228`) | `DataChangeNotifBrush`, `WarningBrush`, `MixedRatingBrush` | Active filter diamond pip, warnings, mixed scores |
| `bb-danger` (`#a63228`) | `DangerBrush`, `NegativeRatingBrush` | Close hover, destructive actions, negative scores |
| `./Typography/#Sora, Sora, Segoe UI` | `HeadingFontFamily` | Game titles, section header bands, Play/Save, dialog title band (Sora Regular/SemiBold/Bold bundled in `src/Typography/`, SIL OFL 1.1) |
| `Segoe UI` | `FontFamily` | Settings rows, game list, metadata, descriptions |
| `Consolas` | `MonospaceFontFamily` | Telemetry counters and score badges |

`GameBannerTintBrush` uses `bb-charcoal-deep` (`#333029`) — the theme's deepest bunker charcoal-olive — so darkening a game banner in ThemeModifier casts bright artwork into YoRHa's warm charcoal-sepia tone rather than neutral black.

`WindowArtForegroundBrush` uses `bb-ivory` (`#f2efe0`): when Playnite's *"Use game background image as window background"* is on, unselected game list rows, `Expander` group headers, cover titles, and game titles flip to light ivory so text never vanishes against dark background art.

## Component spacing (`src/Common.xaml`)

| Key | Value | Purpose |
|---|---|---|
| `ControlHeight` | `32` | Standard form inputs, combos, and buttons (filter sidebar overrides to `28`) |
| `ButtonPadding` | `16,5` | Button inner padding |
| `InputPadding` | `10,5` | TextBox, PasswordBox, ComboBox inner padding |
| `GroupBoxPadding` | `14,12,14,14` | GroupBox body padding |
| `IconSize` | `16` | Toolbar & rail glyph size |
| `GameBannerHeight` | `320` | Default hero banner height (`0` to `600`; spacer `176/320` details, `132/320` grid) |
| `GameBannerDarken` | `0` | Default banner darkening (`0` to `1`) |

## Shell

| File | What it draws |
|---|---|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px `bb-plate` khaki rail closed by a 1px charcoal rule; 34x34 charcoal `PART_ElemMainMenu` with 2px offset shadow holding `LocalBlackBoxMenuMarkTemplate` (Common.xaml, also the top bar button), the Black Box octagram in progress (diamond ring, square, core diamond): hover turns the square 45 degrees so square and diamond lock into the eight-point star, open runs a scan line down the diamond (1.6s loop) while the core blinks off and on in hard steps until the menu closes; 44x40 items that invert to charcoal-olive with a 3px terracotta left bar when active; transparent when `ShowBackgroundImageOnWindow` is True |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px `bb-charcoal` command bar closed by `diamond-frieze.png` (`DividerTemplate`); search -> filter (8px amber diamond pip) -> sorting first -> icon-only view switches that invert to `bb-ivory` with top/bottom tracking rules when toggled -> notifications -> 12px `PART_ProgressGlobal`; 132px right caption clearance |
| `Views/Library.xaml` | Full-strength `PART_ImageBackground` spanning behind top bar and rail with soft bottom gradient fade into `WindowArtSwatch` |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | 1px charcoal window frame, `40x32` main window buttons, `46x44` dialog caption buttons with `DangerBrush` close hover |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Side panels turning transparent on `ShowBackgroundImageOnWindow`; 28px filter controls and 28x28 preset buttons |

## Components

Both game overview files include a designed empty state (`EmptyGameTemplate` + `LOCErrorNoGameSelected`) with `PART_ScrollViewHost` explicitly `Visibility="Visible"` so a null DataContext or cleared selection never collapses the empty state.

`GameDetailsPaneWidth` and `GridDetailsPaneWidth` both default to `300` of usable metadata content inside the framed parchment dossier's `16px` horizontal padding. Both overview files use `scripts/game-page-breakpoints.mjs` for responsive stacking and honour `GameDetailsPanePosition` (`Left`, `Center` / `Stretch`, `Right`).

| Playnite file | Source component |
|---|---|
| `DerivedStyles/PlayButton.xaml` | 40px rectilinear Terracotta Rust CTA slab with 3px charcoal offset shadow, 9-slice `cursor-glow.png` bloom + top/bottom tracking rails, and `scan-glitch.png` horizontal telemetry sweep on hover; `Tag="ContextAction"` shares the exact shape |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | No resting stripe; warm-olive hover wipe with looping scan band and blinking gutter pip; inverted charcoal-olive selection slab with top/bottom tracking rules, 4px terracotta left bar, and `▶▪` pointer cursor |
| `DerivedStyles/GridViewItemStyle.xaml`, `DerivedStyles/GridViewItemTemplate.xaml` | Static 2px terracotta cover frame + offset shadow + corner brackets when selected; animated charcoal-olive hover frame + drawn-in corner brackets with a looping scan band + rising 48x48 YoRHa `Play`/`Info` tiles (`BackEase` 0.22s, 60ms stagger) that run a looping perimeter chase |
| **Running game** (`PlayButton.xaml`, `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `ListView.xaml`) | Pod-Link Teal (`RunningIndicatorBrush` `#386e5a`) frame + dark keyline; Launching sweeps an angled telemetry band (`RunningScan`, 1.6s cycle) + 2px foot fill + twin pulsing diamond telemetry nodes (`RunningNode1..2`); Running breathes calmly (3.2s cycle) with full foot line and `Cancel` on `PlayButton` `IsMouseOver` (`RelativeSource Self`). `PlayButton` darkens with `ArtTintBrush` (`#333029`, since `ScrimBrush` is light parchment). `PlayRoom` reserves 30px right strip and `RowRoom` reserves 34px right strip with `RunningMarkPlate` |
| `DerivedStyles/StandardWindowStyle.xaml`, `DefaultControls/TreeView.xaml` | 44px `bb-charcoal` dialog title band with `▊▏` musical double-bar, Black Box octagram mark, Sora bold title, ghosted `pod-reticle.png` watermark, and `diamond-frieze.png` closing rule; minimal 28px bare TreeView rows in body font with warm-olive hover, inverted charcoal selection slab + 2px terracotta left bar + `▶▪` cursor, and reserved `Visible` scroll lane |
| `DefaultControls/Button.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `ComboBox.xaml`, `TabControl.xaml`, `GroupBox.xaml`, `Expander.xaml` | Rectilinear YoRHa plates with 4px left bars and offset shadows + `Width==41` 32x32 ThemeModifier scale trigger; square terminal `CheckBox` with diamond mark; 45-deg diamond `RadioButton`; Plug-in Chip capacity `Slider` with diamond thumb; inverted charcoal `TabItem` with 2px terracotta top bar; content-sized `GroupBox` cards with `▊▏` charcoal header bands |
| Menus (`ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `ComboBoxList.xaml`, `FilterSelectionBox.xaml`) | YoRHa parchment telemetry sheet (`LocalYorhaPanelTemplate`: 1px charcoal edge, 3px hard offset shadow plate, 5px charcoal top band with `▊▏` tick and terracotta pip), 30px rows inverting to charcoal-olive slabs with top/bottom tracking rules and `▶▪` pointer cursor, `◇ • ◇` diamond-dot frieze breaks, framed monospace shortcut boxes, crimson Exit slab with ivory text, square-diamond checked boxes. |

## Previews

`art/preview-details.html` and `art/preview-settings.html` render via `.\scripts\take-screenshots.ps1 -Extension blackbox` against `src/tokens.css` (`var(--bb-*)` tokens).

- **Signature motifs drawn:** 52px charcoal-olive command bar and 44px dialog title band closed by `diamond-frieze.png` (`───◇─•─◇───`); `▊▏` musical double-bar headers; inverted charcoal-olive selected rows/tabs with top/bottom tracking rules and `▶▪` pointer cursor; Terracotta Rust `PLAY` CTA in hovered end state with `cursor-glow.png` and `scan-glitch.png`; Pod-Link Teal `RUNNING` row; Plug-in Chip tags and capacity slider; `grid-scan.png` and `pod-reticle.png` telemetry overlays.
- **Stand-in fonts:** `Sora` renders natively via bundled `Sora` (`src/Typography/` / `scripts/fonts/sora/`); `"Segoe UI"` renders via bundled `Selawik` (`scripts/fonts/selawik/`); `Consolas` renders via bundled `Cascadia Mono` (`scripts/fonts/cascadiamono/`).

## Deviations

- Game descriptions (`PART_HtmlDescription`) use `Segoe UI` because Playnite's `HtmlTextView` resolves installed system fonts.
- Playnite's built-in menu icon glyphs (`ExitIcon`, `RemoveGameIcon`, `AddFavoritesIcon`) remain icofont glyphs recolored to theme brushes.

## Not verified yet

- Interactive live Playnite check at 125% / 150% DPI scaling.
