# Ditherwake — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by Lucas Pope's 1-bit maritime mystery ***Return of the Obra Dinn*** (3909 LLC, 2018): its 1807 Honourable East India Company Insurance Assessment Logbook (*"Return of the Obra Dinn — Chief Inspector's Logbook"*), the brass-and-skull ***Memento Mortem* Pocket Watch**, and its vintage monochrome monitor palettes (**IBM 8503** `#18191D` / `#2E3037` iron-gall slate & `#EBE5CE` Vellum Cream 1-bit inversion, **Zenith ZVM 1240 Amber** `#FDCA55`, **IBM 5151 Green** `#12824A` / `#01EB5F`, **Commodore 1084 Cyan** `#88D7DE`, **Macintosh Cyan-White** `#E5FFFF`, and **E.I.C. Sealing-Wax Crimson** `#B83228`). Dark theme (`Showcase` ambition), unofficial fan work with no official art, logos, or trademarks (`info/NOTICE-Ditherwake.txt`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, canonical Lospec monitor palettes, WCAG 2.1 AA contrast ratios, and motion notes are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (3 candidate lenses, source DNA, 11-row game element map, 6 shell/game-page levers, menu/running signatures, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

| Token | Key | Used for |
|-------|-----|----------|
| `--od-ink-void` (`#18191D`) | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `ScrimBrush`, `TextBrushDark`, `PrimaryButtonForegroundBrush`, `SelectedForegroundBrush`, `SidebarItemSelectedForegroundBrush` | Deep iron-gall print ground and dark ink text on 1-bit inverted Vellum Cream plates (`12.8:1` contrast) |
| `--od-slate-ledger` (`#212329`) | `PopupBackgroundBrush`, `InputBackgroundBrush`, `ExpanderBackgroundBrush`, `NormalBrushDark`, `TooltipBackgroundBrush`, `ScrollBarTrackBrush`, `TabControlHeaderBackgroundBrush` | Recessed IBM 8503 ledger sheet for metadata manifest, popup boards, inputs, and Settings tree |
| `--od-slate-surface` (`#2E3037`) | `NormalBrush`, `ButtonBackgroundBrush`, `SecondaryButtonBackgroundBrush`, `PropertyItemBackgroundBrush`, `ProgressBarTrackBrush`, `SliderTrackBrush` | Canonical IBM 8503 dark shade for buttons, chips, and control tracks |
| `--od-slate-hover` (`#393C46`) | `HoverBrush`, `ListItemHoverBrush`, `ButtonHoverBackgroundBrush`, `SecondaryButtonHoverBackgroundBrush`, `TopPanelItemHoverBackgroundBrush` | Bayer-stippled slate hover wash across rows, buttons, and Settings tree |
| `--od-banner-tint` (`#141519`) | `GameBannerTintBrush` | Solid dark iron-gall etching ground for hero banner darkening (no alpha) |
| `--od-vellum` (`#EBE5CE`) | `TextBrush`, `PrimaryButtonBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `TopPanelItemCheckedBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `PropertyItemHoverBackgroundBrush`, `GridViewItemSelectedBorderBrush`, `StripeBrush`, `LocalVellumBrush` | Canonical IBM 8503 Vellum Cream primary text, copperplate outer rules, *Memento Mortem* Play plaque, and true 1-bit monochrome inverted selection & menu highlight bars |
| `--od-vellum-bright` (`#F7F3E3`) | `HeadingForegroundBrush`, `DangerForegroundBrush`, `ButtonHoverForegroundBrush`, `LocalVellumBrightBrush` | Sunlit vellum headings and high-contrast ink on Sealing-Wax Crimson |
| `--od-vellum-muted` (`#B8B19A`) | `TextBrushDarker`, `SidebarItemForegroundBrush`, `TabItemForegroundBrush` | Aged rag-paper secondary captions and resting icons |
| `--od-border` / `--od-border-strong` (`#4A4942` / `#7A7564`) | `PanelSeparatorBrush`, `WindowPanelSeparatorBrush`, `NormalBorderBrush`, `PopupBorderBrush`, `MenuSeparatorBrush`, `InputBorderBrush`, `ButtonBorderBrush` | Outer and inner double-ruled copperplate engraving lines |
| `--od-zenith-amber` (`#FDCA55`) | `GlyphBrush`, `PrimaryButtonHoverBackgroundBrush`, `PrimaryButtonGlowBrush`, `SelectedBorderBrush`, `CheckBoxCheckMarkBkBrush`, `ProgressBarForegroundBrush`, `TabItemIndicatorBrush`, `GridViewItemHoverBorderBrush`, `TooltipBorderBrush`, `WarningBrush`, `StripeAltBrush`, `LocalZenithAmberBrush` | Canonical Zenith ZVM 1240 Amber: *Memento Mortem* pocket-watch hands, Play hover illumination, selection binding spine, swallowtail bookmark ribbons, and progress cells |
| `--od-zenith-wash` (`#362F22`) | `SelectedBrush`, `HighlightGlyphBrush`, `LocalZenithWashBrush` | Held warm brass-umber wash behind selected Settings `TreeViewItem` rows and open submenus |
| `--od-mac-flash` (`#E5FFFF`) | `PrimaryButtonPressedBackgroundBrush`, `LocalMacFlashBrush` | Canonical Macintosh 1-bit phosphor cyan-white activation flash on Play press |
| `--od-comm-cyan` (`#88D7DE`) | `DataChangeNotifBrush`, `FocusBrush`, `LinkBrush`, `StripeAccentBrush`, `LocalCommCyanBrush` | Canonical Commodore 1084 Cyan: `9×9px` 4-point nautical compass-star active filter mark, maritime glossary links, and focus ring |
| `--od-ibm-green` / `--od-ibm-phosphor` (`#12824A` / `#01EB5F`) | `RunningIndicatorBrush`, `LocalRunningHighlightBrush` | Dedicated IBM 5151 Phosphor Emerald running/launching indicator (distinct hue from Vellum, Zenith Amber, Commodore Cyan, and Wax Red) and Three-Fate Roman Tallies (`I · II · III`) |
| `--od-wax-red` / `--od-wax-red-hi` (`#B83228` / `#E46458`) | `DangerBrush`, `LocalDangerBrightBrush`, `NegativeRatingBrush` | E.I.C. Sealing-Wax Crimson Exit (`Alt+Q`) highlight stamp (`6.1:1`) and side-panel close hover |

Fonts: `HeadingFontFamily` = `./Typography/#Cinzel, Cinzel, Georgia, Palatino Linotype` (SIL OFL 1.1 static `Cinzel-Regular.ttf` and `Cinzel-Bold.ttf` in `src/Typography/`); `FontFamily` = `Georgia, Palatino Linotype` (Windows system book serif, drawn identically with bundled `Gelasio` in Chromium previews); `MonospaceFontFamily` = `Consolas` (drawn with `Cascadia Mono` in previews). Radii: `CornerRadiusSmall` 2px, `ControlCornerRadius` 3px, `CornerRadiusLarge` 6px, `CornerRadiusXLarge` 10px, `CornerRadiusFull` 9999 (1:1 circles only).

## ThemeModifier

`thememodifier.yaml` is generated at build time from `scripts/data/theme-keys.json`. `GameBannerTintBrush` uses solid `#141519` (`--od-banner-tint`) so banner darkening shifts hero art into dark iron-gall etching ground. `GameBannerHeight` (default `300`) and `GameBannerDarken` (default `0`) disable cleanly in `DefaultControls/Slider.xaml` while `ShowBackgroundImageOnWindow=True`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Copperplate Ledger rationale |
|-----|-------|------------------------------|
| `ControlHeight` | `32` | Standard 32px double-ruled ledger inputs, combos, and buttons |
| `IconSize` | `16` | Compact rail & top bar bespoke copperplate and maritime instrument glyphs |
| `GameBannerHeight` | `300` | Woodcut Diptych Chapter hero banner height (`0..600`) |
| `ButtonPadding` | `14,5` | `1px` rim + `5px` vertical padding = `32px` |
| `InputPadding` | `9,5` | Ledger input inset (paired with `3px` Zenith Amber left spine on `TextBox`/`PasswordBox`) |
| `MenuPadding` / `ComboBoxDropDownPadding` | `8,12,8,8` | Clears `6px` top Bayer-dithered woodcut frieze and double-ruled copperplate border |
| `MenuItemPadding` / `ComboBoxItemPadding` | `8,4` | Compact 30px 1-bit vellum inversion menu & dropdown rows |
| `GroupBoxPadding` | `12,10,12,12` | Double-ruled copperplate card inset |
| `TooltipPadding` | `10,6` | Amber-spined copperplate tooltip inset |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` + `CustomControls/SidebarItem.xaml` | 44px E.I.C. ledger spine closed on the right by a double-ruled copperplate seam (`1.5px` outer + `2px` gap + `1px` inner), crowned by a `44×50` Vellum Cream pocket-watch crown tile (`PART_ElemMainMenu`) with a `4px` Zenith Amber collar, inset ink keyline, and the **Ditherwake Watch-Compass Emblem** above an `8px` Bayer-dithered woodcut frieze; `44×40` slots locking **1-Bit Inverted Vellum Cream (`#EBE5CE`)** bookmark plates with a `4px` Zenith Amber spine and `#18191D` ink glyph on select; lower-left compass diamond & `"1807 / E.I.C. / LX"` registry stamp |
| `Views/TopPanel.xaml` + `CustomControls/TopPanelItem.xaml` | 50px top bar closed by a `6px` double-ruled copperplate border and `360px` Bayer 4×4 ordered-dither woodcut frieze; `244px` amber-spined double-ruled search well, `9×9px` Commodore 1084 Cyan 4-point compass-star active filter pip (`TextFilter`), sorting-first `PART_PanelMainItems` with icon-only view switches (active = 1-Bit Inverted Vellum Cream + `3px` Zenith Amber top bar), `12px` Bayer-stepped `PART_ProgressGlobal`, and right-docked watch-bell notifications button |
| `Views/Library.xaml` | Calm `#18191D` iron-gall workspace with full-strength `ShowBackgroundImageOnWindow` art layer and soft bottom fade into `WindowArtSwatch` |
| `DerivedStyles/MainWindowStyle.xaml`, `StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Copperplate main-window caption keys (Sealing-Wax Crimson close); `44px` Settings copperplate masthead title band (`50×40` Vellum Cream watch-seal cap with `3px` Zenith Amber spine + `Cinzel` Bold title + double-ruled Bayer-dithered woodcut frieze + `4px` double-ruled closing border + `44×40` caption keys) |
| `DefaultControls/TreeView.xaml` | Bare `28px` `Georgia` book-serif rows, stippled slate hover wash, held brass-umber selected wash + `2.5px` Zenith Amber left bar + Vellum Bright bold label, reserved `Visible` scroll lane for `WindowSettings` (`260px`) and `WindowExtensions` (`280px`) |

## Components

| Playnite file | Obra Dinn component |
|---------------|---------------------|
| `DerivedStyles/PlayButton.xaml` | *Memento Mortem* Engraved Copperplate Plaque (Vellum Cream `#EBE5CE` rest plate with inset ink keyline, left circular *Memento Mortem* pocket-watch dial emblem, `Cinzel` Bold `#18191D` ink label, and `"III"` tally); hover illuminates to Zenith ZVM 1240 Amber (`#FDCA55`), lights outer Vellum rim, sweeps 1-bit Bayer soul-burst (`dither-glint.png`), and rotates watch hands `0° → 30°`; press flashes Macintosh `#E5FFFF`; running/launching fills solid IBM 5151 Phosphor Emerald (`#12824A`) with Vellum ink (`RunningBreath` scrim) + `RunningActionIndicator` |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | `Georgia` book-serif rows: stippled slate hover + sliding hollow copperplate diamond nib (`◇`) + transparent `RowHoverAction` Play/Install buttons (`RowHoverRoom` `38px`); selected **True 1-Bit Inverted Vellum Cream (`#EBE5CE`)** manifest bar (`ScaleX 0.92 → 1.0`) with `4px` Zenith Amber spine, top/bottom ink registration rules, Bayer-dithered right tail, and `#18191D` bold ink; IBM 5151 Phosphor Emerald `RunningIndicator` |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | `6px` rounded portrait clip (`VisualBrush` mask); hover scales `1.02` + lights Zenith Amber copperplate rule & top frieze bar; selected locks a double-ruled **Vellum Cream & Zenith Amber woodcut portrait frame** with four corner rosettes and a hanging top-right swallowtail bookmark ribbon; `50×50` double-ruled copperplate `GridTileButton` Play & Info hover seals (`50ms` stagger) |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | Unified E.I.C. Double-Ruled Copperplate Ledger Board (`LocalLedgerMenuBoardTemplate`: `#212329` board with 3.5% `vellum-stipple.png`, double-ruled Vellum border, four corner rosettes, `6px` top Bayer-dithered woodcut frieze, and top-right Zenith Amber swallowtail bookmark ribbon), `30px` rows, **True 1-Bit Inverted Vellum Cream (`#EBE5CE`)** highlight strip with `4px` Zenith Amber spine inverting label/icon/arrow/shortcut to `#18191D` ink (`12.8:1`), compass-diamond + Bayer-dot group breaks, movable-type printing-block shortcut keycaps, Sealing-Wax Crimson `Alt+Q` Exit stamp (`6.1:1`), and rotated Zenith Amber diamond check seals |
| `Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml` | Generated by `art/gen-overviews.mjs` + `scripts/game-page-breakpoints.mjs`: Woodcut Diptych Chapter hero banner, compass-diamond dither title eyebrow, E.I.C. Double-Ruled Crew Manifest (`300px` usable width, four corner rosettes, hanging swallowtail bookmark ribbon, compass-diamond dividers), custom `28×28` double-ruled E.I.C. wax-seal `SidePanelCloseButton`, `EmptyGameTemplate`, `GameDetailsPanePosition` Left/Center/Stretch/Right |
| **Running game levers** (`running-motion.md`) | **Hue:** IBM 5151 Phosphor Emerald (`#12824A` plate, `#01EB5F` phosphor highlight, Vellum Cream ink >= `4.9:1` bare / `6.8–9.6:1` with `RunningBreath` scrim). **Band profile:** horizontal memory-trace sweep stepped by tiled 1-bit Bayer cells (`dither-cells.png` / `LocalDitherCellsMaskBrush`). **Foot:** `2px` copperplate fill line (`ScaleX`). **Mark:** **Three-Fate Roman Tallies (`I · II · III`)** (`ScaleY` / `Opacity` striking sequentially as the scan lands) inside a `RunningMarkPlate` strip (`46px` details row room / `38px` list row & button room). **Timing:** `1.6s` launch sweep cycle, `3.2s` calm harmonic idle pulse. |

## Previews

Generated from `art/preview-details.html` and `art/preview-settings.html` via `.\scripts\take-screenshots.ps1 -Extension ditherwake`.
- **Signature motifs drawn:** `44×50` Vellum Cream *Memento Mortem* watch-crown main menu tile with `4px` Zenith Amber collar and `1807 / E.I.C. / LX` lower rail registry stamp; `6px` double-ruled copperplate top bar border with 1-bit Bayer-dithered woodcut frieze; staged hovered *Memento Mortem* Play plaque (Zenith ZVM 1240 Amber `#FDCA55` + rotated pocket-watch hands + `dither-glint.png` 1-bit soul-burst wave); True 1-Bit Inverted Vellum Cream (`#EBE5CE` + `#18191D` ink) selected library row, active view switch, and hovered tag chip; IBM 5151 Phosphor Emerald running row with Three-Fate Roman Tallies (`I II III`); `9×9px` Commodore 1084 Cyan 4-point compass-star active filter pip; E.I.C. Double-Ruled Crew Manifest with four corner rosettes, hanging Zenith Amber swallowtail bookmark ribbon, compass-diamond dividers, and wax-sealed score plaques; `44px` copperplate Settings masthead title band with the Ditherwake Watch-Compass mark and bare `28px` Settings tree.
- **Stand-in fonts:** `Cinzel` renders directly from bundled OFL TTFs (`scripts/fonts/` matching `src/Typography/`); `Georgia` draws with bundled metric-compatible `Gelasio`; `Consolas` draws with bundled `Cascadia Mono`. Zero system-font warnings and zero unexplained hex drift.

## Deviations

- `art/sprites.py` generates four deterministic pure-white RGBA 1-bit Bayer dither masks in `src/Images/fx/` (`dither-band.png`, `dither-glint.png`, `vellum-stipple.png`, `dither-cells.png`).
- `art/gen-overviews.mjs` generates both game overview XAML files and invokes `scripts/game-page-breakpoints.mjs`.
- `preview-details.html` shows a decorative `CHIEF INSPECTOR'S LOG MDCCCVII` masthead inscription and `FATES VERIFIED · 42/60` progress label beside `PART_ProgressGlobal`; runtime `TopPanel.xaml` renders Playnite's native `PART_ProgressGlobal` (`Height="12"`) and `PART_TextProgressText` cleanly so plugin items and narrow window widths never collide.

## Not verified yet

- Live manual walkthrough of every third-party plugin dialog in Playnite; all automated validation (`validate-extension.ps1 -Mode Package`), preview layout (`preview-layout.mjs`), WPF regression suites (`tests/wpf/*RegressionTests.ps1`), running motion frame contact sheet (`RunningMotionFrames.ps1`), 32-bit menu render (`MenuRender.ps1`), and live Playnite desktop build/deploy (`build-theme.ps1 -Extension ditherwake -Launch`) are verified on this Windows machine.
