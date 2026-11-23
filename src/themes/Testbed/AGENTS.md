# Testbed

Light Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by Portal 2 (unofficial, no game assets; see `info/NOTICE-Testbed.txt`). Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record the 20 capture measurements and sampled colors; the [Showcase brief](BRIEF.md) maps the source UI to Playnite.

## Sources

`RESEARCH.md` (20 Portal 2 4K captures on interfaceingame.com saved briefly to session scratch during sampling) and `BRIEF.md` (lens: cleanroom modular test-chamber wall panels over dark carbon chrome).

## Tokens

All values are in `src/tokens.css`; `Constants.template.xaml` maps them.

| Token | Plays |
|-------|-------|
| `--tb-wall-base` / `--tb-wall-tile` / `--tb-wall-well` | Cleanroom aluminum panel family (`ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `GameBannerTintBrush`, `MainColor`, `PopupBackgroundBrush`, `InputBackgroundBrush`) |
| `--tb-grout` / `--tb-grout-soft` / `--tb-grout-deep` | Panel seams, borders, separators (`NormalBorderBrush`, `PanelSeparatorColor`, `WindowPanelSeparatorColor`, `LocalShadowLipBrush`) |
| `--tb-ink` / `--tb-ink-muted` / `--tb-white` | Primary & secondary prose (`TextColor`, `TextColorDarker`, `WindowArtForegroundBrush`) |
| `--tb-carbon` / `--tb-carbon-top` / `--tb-carbon-tile` / `--tb-carbon-edge` | Dark carbon sidebar rail, 48px top bar, tooltips, settings header band (`ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush`) |
| `--tb-charcoal` | Aperture Charcoal selection inversion bar (`SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `PopupBorderColor`) |
| `--tb-portal-blue` / `--tb-portal-cyan` | Primary CTA & focus polarity (`PrimaryButtonBackgroundBrush`, `GlyphColor`, `LocalPortalCyanBrush`, `FocusBrush`, `TabItemIndicatorBrush`) |
| `--tb-orange` / `--tb-orange-hi` | Dedicated launching & running sweep polarity (`RunningIndicatorBrush`, `LocalRunningHighlightBrush`) paired with `--tb-scrim` (`ScrimBrush`) |
| `--tb-tag-orange` | Store tag amber-orange (`LocalTagOrangeBrush`) for the `Details` title plaque (`LOCGameDetails`, bold black Titlecase ink on orange background) in the metadata dossier |
| `--tb-yellow` | Active filter & update notification pip (`DataChangeNotifColor`) |
| `--tb-crimson` | Exit / danger close hover (`DangerBrush`, `NegativeRatingBrush`) |

Radii: `ControlCornerRadius` 0, `CornerRadiusSmall` 0, `CornerRadiusLarge` 2, `CornerRadiusFull` 9999 (circular antline dots/radios only). Type: Barlow Semi Condensed (`FontFamily`) & Barlow Condensed (`HeadingFontFamily`) bundled in `src/Typography/` with `Bahnschrift SemiCondensed, Segoe UI` fallback; `Consolas` monospace keycaps; sizes 12 / 14 / 15 / 20 / 30.

## Component spacing

`Common.xaml`: `ControlHeight` 32; `ButtonPadding` 14,5; `InputPadding` 9,5; `MenuPadding` 8,12,8,6; `MenuItemPadding` 10,4; `GroupBoxPadding` 12,10,12,12; `TooltipPadding` 10,6; `IconSize` 16; crisp architectural geometries in `Media.xaml`.

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | 48px dark carbon top band closed by a 2px carbon edge and 240px Portal Cyan lead rule; 32px cleanroom search box (`CustomControls/SearchBox.xaml`), 8x8 Caution Yellow filter pip without text label, sorting-first main items, icon-only view toggles, 12px `PART_ProgressGlobal` antline meter, 136px right caption clearance |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px dark carbon rail with subtle `panel-grid.png` seams, crowned by 44x48 `PART_ElemMainMenu` bearing `LocalTestbedMenuMarkTemplate` (Common.xaml, also the top bar's menu button; a blue and an orange portal oval joined by three dashed antline rows; hover sends one test cube from the blue portal across the antlines into the orange one, and while the menu is open both portal rims light and breathe out of step while a cube keeps shuttling through the pair) and a 2px Portal Cyan foot slit; selected rail item fills Portal Blue with a 3px Portal Cyan left slit |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Dark carbon window title band (`WindowTitleBackgroundBrush`), stepped top-left accent, Thermal Crimson close hover |
| `DefaultControls/TreeView.xaml` | Settings category list: cleanroom rows inverting to Aperture Charcoal with 3px Portal Cyan left slit and `WindowArtForegroundBrush` support |

## Game page

`art/gen-overviews.mjs` generates both overviews (`Views/DetailsViewGameOverview.xaml` and `Views/GridViewGameOverview.xaml`) and applies responsive breakpoints via `scripts/game-page-breakpoints.mjs`. Observation-bay `HeroArt` banner (`GameBannerHeight=300`, `DetailsBannerSpacer` `x * 236 / 300` floor 20, `GridBannerSpacer` `x * 220 / 300` floor 14) with `CornerMarksTemplate`, telemetry pips, `GameBannerDarken` + 50% `GameBannerTintBrush` floor, and seamless fade to `PageRoot.Background`. Title stack pairs `PART_ImageIcon`, bold `HeadingFontFamily` display title (flips to `WindowArtForegroundBrush` over window art), `DividerTemplate` 3-dot cyan rule, `PlayButton` + `PART_ButtonContextAction` + `RunningActionIndicator`, and equal 40x40 `SecondaryButton` More/Edit buttons. Two-column body sets SteamScreenshots gate + Description/Notes beside the stepped-tab cleanroom metadata dossier (`GameDetailsPaneWidth`/`GridDetailsPaneWidth=300` usable width, `GameDetailsPanePosition` Right / Left / Center / Stretch). Empty state centers `EmptyGameTemplate` in `ViewportHeight`.

## Components

| Playnite file | Component |
|---------------|-----------|
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | `LocalMenuBoardTemplate` (cleanroom panel + `panel-grid.png` seams + 96x6 charcoal stepped cap), Aperture Charcoal inversion rows (30px, 3px cyan slit), 10px 5-dot antline separators, monospace keycaps, Thermal Crimson `Alt+Q` Exit, 14x14 chamber check square (row in `docs/themes/menus.md`) |
| `DerivedStyles/PlayButton.xaml` | Portal Blue architectural slab (`MinWidth="156"`, `Height="42"`) with 9-slice `GlowFrameTemplate` bloom, diagonal `portal-sheen.png` sweep, and closing `CornerMarksTemplate` brackets on hover; Propulsion Orange `RunningActionIndicator` scan & 3 staggered beacon dots on launch/run with `Cancel` on hover |
| `DerivedStyles/DetailsViewItemStyle.xaml` | Light matte cleanroom rows; hover fade + 2.5px Portal Blue edge; selected Aperture Charcoal wipe + white text; Propulsion Orange running indicator + `RowHoverAction` Play/Install controls |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Cleanroom cover tiles with Portal Cyan hover frame, `CornerMarksTemplate`, 50x50 `GridTileButton` hover actions, Aperture Charcoal selection border, and Propulsion Orange running beacon strip |
| `DerivedStyles/PropertyItemButton.xaml`, `TextBlockGameScore.xaml` | `0px` modular aluminum metadata tag chips with top-left Portal Blue corner pip inverting to Aperture Charcoal on hover; high-contrast Test Chamber Evaluation score plaques |
| `DefaultControls/*` | Crisp modular light-theme buttons, Portal Cyan-focused inputs, square check/radio switches, beveled thumb sliders, segmented-look progress bar, grooved scrollbars, cleanroom tabs (`TabControl.xaml`) flipping headers cleanly in settings |
| Grid side panel close | Custom 28x28 white chamber hatch (`SidePanelCloseButton` + sticky `InlineSidePanelCloseButton` when `GameBannerHeight < 120` or `ShowBackgroundImageOnWindow=True`) |

## Deviations

- Uses crisp 0px rectangular chrome (`ControlCornerRadius=0`) with `panel-grid.png` seams and stepped charcoal tab caps rather than perspective-skewed test-chamber wall geometry or `DropShadowEffect` (unavailable per repo rules).
- Fonts use bundled OFL Barlow Semi Condensed & Barlow Condensed as closest geometric DIN/Univers equivalents to Aperture's proprietary Valve typeface (`RESEARCH.md`), avoiding any shipped proprietary font files.
- Title band uses `WindowPanelSeparatorBrush` hairline / `DividerTemplate` and keeps Description/Notes text directly on `--tb-wall-base` (`#E2E5E8`) with `WindowArtForegroundBrush` switching when window background art is enabled.

## Not verified yet

- Standalone WPF test harnesses (`RunningIndicatorRegressionTests.ps1`, `RunningMotionFrames.ps1`, `RunningLabelOverlapRegressionTests.ps1`) do not resolve Playnite's `{MainViewModel StartGameCommand}` markup extension inside `DetailsViewItemStyle.xaml`'s `RowHoverAction` (the `cover tile`, `list view row`, and `game page action` running states were verified in the WPF harnesses, while `details row` is verified inside live Playnite).
- `MenuRender.ps1` uses `Segoe MDL2 Assets` as a stand-in `FontIcoFont`, so Playnite's `icofont.ttf` glyphs render natively only inside live Playnite.
- Interactive pointer hover/press transitions (`PlayButton`, `GridTileButton`, `SidebarItem`, `TopPanelItem`, `SecondaryButton`) and `ShowBackgroundImageOnWindow=True` art-contrast switching are checked inside live Playnite rather than animated motion capture.
