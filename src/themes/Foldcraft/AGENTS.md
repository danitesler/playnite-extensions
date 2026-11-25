# Foldcraft — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by **Tearaway** (Media Molecule, PS Vita, 2013): tactile handmade construction paper, accordion-folded ivory cardstock, gridded self-healing cutting mats, torn-charcoal HUD chrome, seafoam-mint bookmark selections, ochre-gold hero CTAs, and confetti-cobalt running indicators. Light theme (`Showcase` ambition), unofficial fan work with no official art, logos, or trademarks.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference captures, measured swatches, typography, controls, and motion cues live in [`RESEARCH.md`](RESEARCH.md). Creative brief (3 candidate lenses, source DNA, game element map, 6 shell/game-page levers, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

| Token | Key | Used for |
|-------|-----|----------|
| `--fc-paper` (`#EFECE4`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `GameBannerTintBrush` | Warm fibrous craft-paper workspace canvas & light-theme banner darkening color |
| `--fc-paper-bright` (`#FAF8F3`) | `PopupBackgroundBrush`, `ButtonBackgroundBrush`, `InputBackgroundBrush`, `WindowArtForegroundBrush`, `LocalPaperWhiteBrush` | Crisp paper-white cutouts, active TopPanel/TabItem plates, inverted white menu ink, window background art foreground |
| `--fc-paper-card` / `--fc-paper-fold` (`#EAE3D2` / `#DFD6C0`) | `NormalBrush`, `ExpanderBackgroundBrush`, `NormalBrushDark`, `ProgressBarTrackBrush` | Accordion-folded ivory cardstock metadata dossier, TreeView rail, recessed folds, scrollbar rail |
| `--fc-paper-shadow` / `--fc-paper-edge` (`#C4BA9F` / `#B5AC96`) | `PanelShadowBrush`, `WindowPanelSeparatorBrush`, `NormalBorderBrush`, `MenuSeparatorBrush` | Flat bottom-right offset studio paper shadow lips and cut cardstock seams |
| `--fc-mat-teal` / `--fc-mat-grid` (`#0B5853` / `#25B5AD`) | `ShellBackgroundBrush`, `WindowTitleBackgroundBrush`, `LocalMatGridBrush` | Self-healing gridded cutting-mat 44px Sidebar rail & 44px Settings/Add-ons dialog title band |
| `--fc-charcoal` / `--fc-deckle-rim` (`#262423` / `#B5B2AD`) | `TopPanelBackgroundBrush`, `TooltipBackgroundBrush`, `LocalDeckleRimBrush`, `TooltipBorderBrush` | Torn-charcoal 50px top bar, HUD tooltips, and monospace shortcut keycaps |
| `--fc-ink` / `--fc-ink-muted` / `--fc-ink-on-mint` (`#221D1A` / `#595149` / `#1B1815`) | `TextBrush`, `TextBrushDarker`, `PrimaryButtonForegroundBrush`, `SelectedForegroundBrush` | High-contrast umber/charcoal ink (`13.8:1` on paper, `8.9:1` on seafoam-mint selection) |
| `--fc-mint-select` / `--fc-mint-wash` (`#95C5B0` / `#DCECE4`) | `SelectedBrush`, `ListItemSelectedBrush`, `HoverBrush`, `ListItemHoverBrush` | Seafoam-mint bookmark selections & calm pale seafoam hovers |
| `--fc-emerald` (`#187A36`) | `GlyphBrush`, `MenuItemHoverBrush`, `PositiveRatingBrush`, `GridViewItemSelectedBorderBrush`, `ToggleButtonCheckedBackgroundBrush` | Emerald menu hover bookmark slides (`5.25:1` w/ white), `[✓]` check states, active grid tile frame |
| `--fc-ochre` / `--fc-ochre-hi` (`#E0A229` / `#EEB53E`) | `PrimaryButtonBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `PropertyItemHoverBackgroundBrush` | Ochre-gold cutout Play CTA (`7.48:1` w/ dark ink), default dialog buttons, grid circular action discs |
| `--fc-cobalt-run` / `--fc-cobalt-scrim` (`#1264B5` / `#0B2239`) | `RunningIndicatorBrush`, `ScrimBrush`, `FocusBrush` | Confetti Electric Cobalt launching/running sweeps (`5.85:1` bare, `>8:1` with scrim), focus rings |
| `--fc-tangerine` / `--fc-magenta` / `--fc-crimson` (`#D96218` / `#E91E78` / `#C62828`) | `ValueAccentBrush`, `DataChangeNotifBrush`, `DangerBrush`, `NegativeRatingBrush` | Tangerine ComboBox steppers & sliders, Hot-Magenta filter pip/rules, Crimson `Alt+Q` Exit & Close discs (`5.5:1` w/ white) |

Fonts: `HeadingFontFamily` = `./Typography/#Oswald, Oswald, Barlow Condensed, Segoe UI` (bundled SIL OFL static `Oswald-Regular.ttf`, `FontWeight="Normal"`); `FontFamily` = `./Typography/#Nunito, Nunito, Segoe UI` (bundled SIL OFL static `Nunito-Regular.ttf` & `Nunito-Bold.ttf`, `Normal` / `Bold`); `MonospaceFontFamily` = `Consolas`. Radii: `CornerRadiusSmall` 3px, `ControlCornerRadius` 5px, `CornerRadiusLarge` 8px, `CornerRadiusFull` 9999 (1:1 discs/badges only).

## ThemeModifier

`thememodifier.yaml` is generated at Windows build time from `scripts/data/theme-keys.json`. `GameBannerTintBrush` uses `#EFECE4` (`--fc-paper`) so banner darkening tones hero art smoothly into the warm fibrous craft paper canvas. `GameBannerHeight` (default 320) and `GameBannerDarken` (default 0) disable cleanly in `DefaultControls/Slider.xaml` when `ShowBackgroundImageOnWindow=True`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Tearaway |
|-----|-------|----------|
| `ControlHeight` | `32` | Standard 32px papercraft inputs, combos, and buttons |
| `IconSize` | `16` | Compact rail & top bar scissor-cut craft icons |
| `GameBannerHeight` | `320` | Diorama hero backdrop height (0..600) |
| `ButtonPadding` | `14,4` | 1.5px seam + 4px vertical pad over offset shadow lip = 32px |
| `InputPadding` | `9,4` | Crisp paper text box inset |
| `MenuPadding` / `ComboBoxDropDownPadding` | `8,8,10,10` | Accordion ivory cardstock inset (clears top-right origami dog-ear) |
| `MenuItemPadding` / `ComboBoxItemPadding` | `10,4` | Compact 30px bookmark rows |
| `GroupBoxPadding` | `12,10,12,12` | Accordion cardstock group box inset |
| `TooltipPadding` | `10,6` | Torn-charcoal HUD callout inset |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` + `CustomControls/SidebarItem.xaml` | 44px Gridded Self-Healing Cutting-Mat teal rail (`cutting-mat-grid.png`), Paper-White Origami Seal `PART_ElemMainMenu` tile (Ochre-Gold hover), 4-strip construction-paper fan at bottom-left, and Seafoam-Mint active bookmark tabs with 3px Emerald spine |
| `Views/TopPanel.xaml` + `CustomControls/TopPanelItem.xaml` | 50px Torn-Charcoal HUD bar with scissor-cut rim; 32px Paper-White search box, Hot-Magenta 9px rotated diamond `PART_ToggleFilter` pip, sorting-first `PART_PanelMainItems` with Paper-White/Cerulean active view switches, and Confetti Sky Ribbon `PART_ProgressGlobal` stacked cleanly under its dark charcoal HUD text strip |
| `Views/Library.xaml` | Warm fibrous paper canvas with 5% paper-fiber texture (`paper-fibers.png`) and full-strength `ShowBackgroundImageOnWindow` layer with bottom paper fade |
| `DerivedStyles/MainWindowStyle.xaml`, `StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Circular 28x28 grey cardstock Close/Caption discs (`CornerRadiusFull`, Crimson X resting / solid Crimson disc hover); 44px Gridded Cutting-Mat dialog title band with Origami Seal medallion & ghost watermark |
| `DefaultControls/TreeView.xaml` | Bare 28px Settings/Add-ons rows in `Nunito` body font, pale seafoam hover, Seafoam-Mint selection + 3px Emerald spine, reserved `Visible` scroll lane for `WindowSettings` (248px) and `WindowExtensions` (280px) |

## Components

| Playnite file | Tearaway component |
|---------------|--------------------|
| `DerivedStyles/PlayButton.xaml` | Ochre-Gold cutout Play pill (`7.48:1` dark ink) with offset shadow lip, Gold Seal corner fold triangle, diagonal sunlight sheen sweep (`paper-sheen.png`), `BackEase` lift, and Confetti Cobalt `RunningActionIndicator` (`IsLaunching`/`IsRunning`) |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Stacked craft bookmark rows: pale seafoam hover + sliding Cerulean bookmark notch + transparent `RowHoverAction` Play/Install buttons (`RowHoverRoom` 38px); Seafoam-Mint selected bookmark + 4px Emerald spine; Confetti Cobalt `RunningIndicator` |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Layered Ivory cardstock photo mounts (`BackEase` lift + Cerulean frame & diagonal corner masking tape on hover; Papercraft Emerald frame + Ochre top-right origami triangle stamp on select); 52x52 circular Ochre-Gold `GridTileButton` discs |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | Accordion Ivory Cardstock (`LocalPaperBoardTemplate`, `paper-fibers.png`, top-right teal/ivory origami dog-ear), 30px rows with Emerald hover bookmark slide + Paper-White notch + inverted Paper-White/Emerald keycaps, Hot-Magenta diamond + dashed scissor rule dividers, Crimson `Alt+Q` Exit, and Tangerine ComboBox steppers |
| `Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml` | Generated by `art/gen-overviews.mjs` + `scripts/game-page-breakpoints.mjs`: Ochre/Cerulean corner-tabbed hero banner, `Oswald` display title with Hot-Magenta accent rule, Paper White Description card, Accordion Ivory Cardstock metadata dossier crowned by a teal/ochre/magenta bookmark tab, circular grey cardstock `SidePanelCloseButton`, `EmptyGameTemplate` blueprint net, `GameDetailsPanePosition` Left/Center/Stretch/Right |
| **Running game levers** (`running-motion.md`) | **Hue:** Confetti Electric Cobalt (`#1264B5`) with `ScrimBrush` (`#0B2239`). **Band profile:** cut-paper confetti diagonal sweep (`confetti-sweep.png`). **Foot:** 2px paper-white/cobalt progress line filling via `ScaleX`. **Mark:** 3 staggered bouncing confetti diamonds inside `RunningMarkPlate` (`36px` row room / `34px` Play room). **Timing:** `1.6s` launch cycle, `3.2s` running breath. |

## Previews

Generated from `art/preview-details.html` and `art/preview-settings.html` via `node scripts/render-theme-preview.mjs` on macOS.
- **Signature motifs drawn:** 44px Gridded Cutting-Mat rail with 4-strip construction-paper fan; 50px Torn-Charcoal HUD bar; Seafoam-Mint bookmark row & Confetti Cobalt running row with 3 confetti diamonds; Hot-Magenta filter diamond pip & section rules; Ochre-Gold Play cutout & circular caption X disc; Accordion Ivory Cardstock metadata card; Tangerine ComboBox stepper & slider; Papercraft Emerald `[✓]` checkbox & radio; bare 28px Settings tree.
- **Stand-in / bundled fonts:** `Oswald` draws from bundled `Oswald-Regular.ttf`, `Nunito` draws from bundled `Nunito-Regular.ttf` / `Nunito-Bold.ttf`, `Consolas` draws cleanly via monospace stack; `theme-fonts.mjs` reports zero warnings.

## Deviations

- `art/sprites.py` generates six deterministic white-mask RGBA sprites in `src/Images/fx/` (`cutting-mat-grid.png`, `paper-fibers.png`, `deckle-edge-h.png`, `blueprint-folds.png`, `paper-sheen.png`, `confetti-sweep.png`).
- `art/gen-overviews.mjs` generates both game overview XAML files and invokes `scripts/game-page-breakpoints.mjs`.
- Built on macOS: XAML syntax, required keys (`theme-keys.json`), Playnite API manifest keys, signature uniqueness, menu/animation/runtime-trap structure, token parity, preview layout, and bundled font metadata were checked with Node scripts and a local Python static validator; PowerShell (`pwsh`) scripts and Windows WPF runtime rendering are deferred to Windows.

## Not verified yet

- Windows `pwsh scripts/validate-extension.ps1 -Extension foldcraft -Mode Package`, `build-theme.ps1 -Extension foldcraft -NoDeploy`, `MenuRender.ps1`, `RunningMotionFrames.ps1`, `dotnet test tests/Tests.csproj` WPF tests, and live Playnite 10 Desktop load on Windows (authoring environment is macOS without `pwsh`/WPF/Playnite).
