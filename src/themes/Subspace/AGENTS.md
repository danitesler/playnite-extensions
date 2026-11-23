# Subspace — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by Michael Okuda's **Star Trek: LCARS** backlit Kodalith bridge-console architecture ("Okudagrams"): true-black (`#000000`) glass framed by a sweeping upper-left Tangerine L-elbow with a concave inner fillet, `3px` pure-black structural channels, African Violet / Peach / Periwinkle / Gold acrylic blocks, pill-capped command lozenges, and Warp Ops Teal segmented running sweeps. Dark theme (`Showcase` ambition), unofficial fan work with no official art, logos, or trademarks.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, canonical Okuda hex measurements, contrast ratios, and motion notes are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (3 candidate lenses, source DNA, 11-row game element map, 6 shell/game-page levers, menu/running signatures, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

| Token | Key | Used for |
|-------|-----|----------|
| `--lcars-void` (`#000000`) | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `ScrimBrush` | True-black backlit LCARS console glass and `3px` structural gaps |
| `--lcars-panel` (`#0B0D14`) | `PopupBackgroundBrush`, `InputBackgroundBrush`, `ExpanderBackgroundBrush`, `NormalBrushDark`, `TooltipBackgroundBrush`, `ScrollBarTrackBrush` | Calm recessed console interior for metadata dossier, popup boards, inputs, and Settings tree |
| `--lcars-surface` (`#141824`) | `NormalBrush`, `ButtonBackgroundBrush`, `SecondaryButtonBackgroundBrush`, `PropertyItemBackgroundBrush`, `ProgressBarTrackBrush`, `SliderTrackBrush` | Secondary dark module fills, chips, and control tracks |
| `--lcars-banner-tint` (`#0E0A18`) | `GameBannerTintBrush` | Solid deep obsidian-plum brand tint for hero banner darkening (no alpha) |
| `--lcars-tangerine` (`#FF9900`) | `PrimaryButtonBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `StripeBrush`, `TabItemIndicatorBrush`, `GridViewItemSelectedBorderBrush`, `TooltipBorderBrush` | Sweeping upper-left LCARS elbow, Play command lozenge, primary buttons, top-left selected cover elbow |
| `--lcars-gold` (`#FFCC66`) | `PrimaryButtonHoverBackgroundBrush`, `PrimaryButtonGlowBrush`, `MenuItemHoverBrush`, `HeadingForegroundBrush`, `WindowTitleForegroundBrush`, `ProgressBarForegroundBrush`, `SliderThumbBackgroundBrush` | Sunflower Gold Play hover illumination, inverted menu highlight lozenge, section headings, segmented progress bars |
| `--lcars-flash` (`#FFE6B3`) | `PrimaryButtonPressedBackgroundBrush`, `LocalFlashBrush` | Sharp pale-gold LCARS activation flash on Play press and hover glint |
| `--lcars-peach` (`#FF9966`) | `StripeAltBrush`, `LocalPeachBrush` | Secondary LCARS rail collars, metadata header segments, side-panel close stub, right-cap Edit button |
| `--lcars-lavender` (`#CC88FF`) | `GlyphBrush`, `SelectedBorderBrush`, `TopPanelItemCheckedBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush` | African Violet active rail/view-switch lozenges, selection spine bar, bottom-right cover elbow, radio dot |
| `--lcars-lavender-wash` (`#26193B`) | `SelectedBrush`, `ListItemSelectedBrush`, `HighlightGlyphBrush` | Deep backlit violet wash behind selected details rows and Settings tree items |
| `--lcars-periwinkle` (`#88AAFF`) | `LinkBrush`, `PropertyItemHoverBackgroundBrush`, `GridViewItemHoverBorderBrush`, `StripeDeepBrush`, `ScrollBarThumbHoverBrush` | Interactive metadata links, hovered chip inversion, cover hover brackets, lower rail blocks |
| `--lcars-periwinkle-wash` (`#162038`) | `HoverBrush`, `ListItemHoverBrush`, `ButtonHoverBackgroundBrush`, `TopPanelItemHoverBackgroundBrush` | Calm slate-blue backlit hover washes across rows, buttons, and Settings tree |
| `--lcars-cyan` (`#66CCFF`) | `DataChangeNotifBrush`, `FocusBrush` | Science-station Ice Cyan `9×5px` active filter lozenge pip and keyboard focus ring |
| `--lcars-ops-teal` / `--lcars-ops-mint` (`#0D7F6B` / `#38E8B8`) | `RunningIndicatorBrush`, `LocalRunningHighlightBrush`, `CheckBoxCheckMarkBkBrush` | Dedicated Warp Ops Teal running/launching indicator (distinct hue from Tangerine, Violet, Periwinkle, Cyan, Red) and checked pill badges |
| `--lcars-alert-red` (`#C42828`) | `DangerBrush` | Red Alert Exit (`Alt+Q`) lozenge and close-button hover (Space White ink = `5.9:1`) |
| `--lcars-text` / `--lcars-text-muted` / `--lcars-text-ink` (`#F2EFE9` / `#B6ADCA` / `#000000`) | `TextBrush`, `TextBrushDarker`, `TextBrushDark`, `PrimaryButtonForegroundBrush`, `SidebarItemSelectedForegroundBrush` | Space White body text (`18.5:1` on void), Lavender-Mist muted captions (`9.3:1`), pure black ink on solid LCARS blocks (`9.1–16.7:1`) |

Fonts: `HeadingFontFamily` = `./Typography/#Pathway Gothic One, Pathway Gothic One, Barlow Semi Condensed, Arial Narrow, Segoe UI` (unmodified SIL OFL 1.1 static `PathwayGothicOne-Regular.ttf`, Reserved Font Name `'Pathway'`); `FontFamily` = `./Typography/#Barlow Semi Condensed, Barlow Semi Condensed, Segoe UI` (SIL OFL 1.1 static Regular/SemiBold/Bold); `MonospaceFontFamily` = `Consolas`. Radii: `CornerRadiusSmall` 4px, `ControlCornerRadius` 6px, `CornerRadiusLarge` 14px, `CornerRadiusXLarge` 20px, `CornerRadiusFull` 9999 (1:1 circles only).

## ThemeModifier

`thememodifier.yaml` is generated at build time from `scripts/data/theme-keys.json`. `GameBannerTintBrush` uses solid `#0E0A18` (`--lcars-banner-tint`) so banner darkening shifts hero art into backlit obsidian-plum glass. `GameBannerHeight` (default `300`) and `GameBannerDarken` (default `0`) disable cleanly in `DefaultControls/Slider.xaml` while `ShowBackgroundImageOnWindow=True`.

## Component spacing (`src/Common.xaml`)

| Key | Value | LCARS rationale |
|-----|-------|-----------------|
| `ControlHeight` | `32` | Standard 32px pill-stubbed inputs, combos, and modular buttons |
| `IconSize` | `16` | Compact rail & top bar bespoke pill-capped LCARS glyphs |
| `GameBannerHeight` | `300` | Framed viewscreen hero banner height (`0..600`) |
| `ButtonPadding` | `14,4` | `1.5px` rim + `4px` vertical padding = `32px` |
| `InputPadding` | `9,4` | Pill-left trough inset (paired with `6px` leading stub on `TextBox`/`PasswordBox`) |
| `MenuPadding` / `ComboBoxDropDownPadding` | `16,12,8,8` | Clears `9px` left Tangerine elbow spine and `6px` segmented top cap |
| `MenuItemPadding` / `ComboBoxItemPadding` | `8,4` | Compact 30px menu & dropdown lozenge rows |
| `GroupBoxPadding` | `12,10,12,12` | Framed LCARS module card inset |
| `TooltipPadding` | `10,6` | Tangerine-stubbed telemetry tooltip inset |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` + `CustomControls/SidebarItem.xaml` | 44px true-black vertical rail crowned by a `44×50` Tangerine upper-left elbow cap (`PART_ElemMainMenu`, `CornerRadius="22,0,0,0"`) bearing `LocalSubspaceMenuMarkTemplate` (Common.xaml, also the top bar's menu button): three LCARS pill buttons of different lengths; hover telescopes them out to the right one after another, and while the menu is open four Okudagram blocks appear beside them and blink at their own paces, flowing seamlessly into a `14px` Tangerine elbow stem, `3px` black channel, `8px` Peach collar, `44×40` dark slots locking solid African Violet (`#CC88FF`) right-rounded lozenges (`CornerRadius="0,14,14,0"`) on select, and a lower-left `47-01` / `09-A` / `LC-4` multi-block foot stack |
| `Views/TopPanel.xaml` + `CustomControls/TopPanelItem.xaml` | 50px top bar closed by a `6px` segmented Tangerine / Gold / Violet / Peach / Periwinkle tracking rail; `244px` Tangerine-stubbed search trough, `9×5px` Ice Cyan active filter lozenge pip (`TextFilter`), sorting-first `PART_PanelMainItems` with icon-only view switches (active = solid African Violet), `12px` segmented Gold `PART_ProgressGlobal`, and right-docked notifications pill |
| `Views/Library.xaml` | True-black `#000000` console workspace with a `14×14` concave Tangerine inner elbow fillet at top-left (collapsing when sidebar is hidden/moved or window art is active) and full-strength `ShowBackgroundImageOnWindow` art layer with soft bottom fade |
| `DerivedStyles/MainWindowStyle.xaml`, `StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Modular LCARS main-window keys (Peach right-pill close turning Red Alert on hover); `44px` Settings inline tracking title band (`52px` Tangerine emblem cap + `Pathway Gothic One` Gold title + sweeping Violet/Peach/Periwinkle header bar + `3px` closing rule + `44×41` block caption keys) |
| `DefaultControls/TreeView.xaml` | Bare `28px` `Barlow Semi Condensed` rows, Periwinkle backlit hover wash, deep-violet selected pill wash + `2.5px` African Violet left bar + Gold label, reserved `Visible` scroll lane for `WindowSettings` (`260px`) and `WindowExtensions` (`280px`) |

## Components

| Playnite file | LCARS component |
|---------------|-----------------|
| `DerivedStyles/PlayButton.xaml` | Dual-endcap Tangerine LCARS command lozenge (`14px` left cap + `3px` black channel + right-rounded body); hover flips left cap to African Violet, illuminates body to Sunflower Gold, lights outer Gold rim, and sweeps `play-glint.png`; press flashes `#FFE6B3`; running/launching fills solid Warp Ops Teal with Space White ink (`RunningBreath` scrim) + `RunningActionIndicator` |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Right-rounded `0,12,12,0` rows: Periwinkle backlit hover + sliding `5px` pill tab + transparent `RowHoverAction` Play/Install buttons (`RowHoverRoom` `38px`); selected deep-violet wash + `6px` African Violet bar + `2px` black gap + `3px` Gold telemetry tick; Warp Ops Teal `RunningIndicator` |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | `10px` rounded cover clip (`VisualBrush` mask); hover scales `1.02` + lights top/bottom Periwinkle LCARS bars; selected locks dual-color Tangerine top-left & African Violet bottom-right L-elbow brackets; `50×50` LCARS pill-capped `GridTileButton` Play & Info hover pads (`50ms` stagger) |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | Unified LCARS Mini-Elbow console board (`LocalLcarsMenuBoardTemplate`: `9px` left Tangerine elbow spine curving into `6px` Tangerine/Violet/Gold top bar + concave inner fillet + Periwinkle foot), `30px` rows, Sunflower Gold right-rounded highlight lozenge with `5px` Tangerine stub inverting label/icon/shortcut to `#000000` ink (`13.7:1`), tri-block LCARS dividers, outline telemetry capsule shortcuts, Red Alert `Alt+Q` Exit (`5.9:1`), and Ops Mint rounded check badges |
| `Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml` | Generated by `art/gen-overviews.mjs` + `scripts/game-page-breakpoints.mjs`: segmented-rail viewscreen hero banner, tri-pip LCARS title eyebrow, Okudagram Framed Telemetry Dossier (`300px` usable width, mini top-left LCARS elbow + `8px` left spine + concave fillet + tri-block dividers), custom `28×28` right-pill Peach-stubbed `SidePanelCloseButton`, `EmptyGameTemplate`, `GameDetailsPanePosition` Left/Center/Stretch/Right |
| **Running game levers** (`running-motion.md`) | **Hue:** Warp Ops Teal (`#0D7F6B`, highlight Ops Mint `#38E8B8`, Space White ink >= `4.6:1` bare / `6.4–9.0:1` with `RunningBreath` scrim). **Band profile:** horizontal sweep segmented by tiled `scan-cells.png` (`LocalScanCellsMaskBrush`). **Foot:** `2px` pill-capped telemetry fill line (`ScaleX`). **Mark:** 3 staggered vertical LCARS equalizer bars (`ScaleY`) inside a `RunningMarkPlate` strip (`38px` row room / `36px` button room). **Timing:** `1.6s` launch sweep cycle, `3.2s` calm harmonic idle pulse. |

## Previews

Generated from `art/preview-details.html` and `art/preview-settings.html` via `.\scripts\take-screenshots.ps1 -Extension subspace`.
- **Signature motifs drawn:** Sweeping upper-left Tangerine LCARS elbow + `14×14` concave inner fillet joining the 44px left rail and 50px top bar; lower-left `47-01` / `09-A` / `LC-4` structural foot blocks; staged hovered dual-endcap Play lozenge (African Violet left cap + Sunflower Gold body + `play-glint.png` sheen); Warp Ops Teal running game row with 3-bar equalizer; `9×5px` Ice Cyan active filter pip; Okudagram mini-elbow framed metadata dossier with tri-block dividers, framed numeric score plaques, and pill-stubbed chips; `44px` inline LCARS Settings title band with Subspace Elbow-Wave mark and bare `28px` Settings tree.
- **Stand-in fonts:** `Pathway Gothic One` and `Barlow Semi Condensed` render directly from bundled OFL TTFs (`scripts/fonts/` matching `src/Typography/`); `Consolas` draws with bundled `Cascadia Mono`. Zero system-font warnings and zero hex drift (`155` & `81` `var(--token)` uses).

## Deviations

- `art/sprites.py` generates four deterministic pure-white RGBA masks in `src/Images/fx/` (`play-glint.png`, `backlit-bloom.png`, `scan-cells.png`, `viewscreen-grid.png`).
- `art/gen-overviews.mjs` generates both game overview XAML files and invokes `scripts/game-page-breakpoints.mjs`.
- `preview-details.html` shows a decorative `SUBSPACE LIBRARY 4712.4` top-bar readout and `SYNC 68%` progress label beside `PART_ProgressGlobal`; runtime `TopPanel.xaml` renders Playnite's native `PART_ProgressGlobal` (`Height="12"`) and `PART_TextProgressText` cleanly so real plugin items and narrow window widths never collide.

## Not verified yet

- Windows WPF live runtime tests (`tests/wpf/*RegressionTests.ps1`, `RunningMotionFrames.ps1`, 32-bit `MenuRender.ps1`) and live Playnite deployment — authored on macOS (non-Windows host; never runs Playnite). All cross-platform checks (`build-theme.ps1 -NoDeploy`, `validate-extension.ps1 -Mode Package`, `preview-layout.mjs`, `take-screenshots.ps1`, `check:readmes`) verified passing.
