# Stride

Stark light architectural glass Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by *Mirror's Edge* (2008) and *Mirror's Edge Catalyst* (unofficial fan theme, no official game assets, logos, trademarks, or proprietary fonts; see `info/NOTICE-Stride.txt`). Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) document the sampled *Mirror's Edge* (2008 `id=815`) and *Catalyst* (`id=181`) captures and WCAG-verified palette; the [Hybrid brief](BRIEF.md) maps Mirror's Edge's tempered ice-blue frosted glass, velvety 4-edge inner shadows, blazing red vertical pillar, and glossy charcoal selection bars into Playnite.

## Sources

`RESEARCH.md` (8 *Mirror's Edge* 2008 captures — `EXTRAS / UNLOCKABLES`, `RACE / TIME TRIAL ONLINE`, `OPTIONS / VIDEO`, `STORY` Red Pillar, `LOADING`, `LOADING CHAPTER` — plus *Mirror's Edge Catalyst* frosted glass captures) and `BRIEF.md` (lens: sunlit glacial sky-mist canvas, tempered ice-blue frosted glass panes with velvety 4-edge inner shadows and window sheen, blazing Mirror's Edge Red full-height vertical pillar, glossy charcoal-glass selection bars with blazing red `+` markers, and red-thumb steel-blue scrollbars & sliders).

## Tokens

All values live in `src/tokens.css`; `src/Constants.template.xaml` maps them to Playnite palette, shared vocabulary keys, and `Local*` glass/pillar/charcoal gradient brushes.

| Token | Plays |
| --- | --- |
| `--me-sky-bg` / `--me-sky-top` / `--me-skyline` | Sunlit glacial sky-mist canvas (`ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `WindowBackgourndBrush`, `GameBannerTintBrush`, `LocalSkyCanvasBrush`) and geometric skyscraper silhouette tint (`LocalSkylineBrush`) |
| `--me-glass-top` / `--me-glass-mid` / `--me-glass-bot` / `--me-glass-inset` | Tempered ice-blue frosted glass panels (`LocalGlassSurfaceBrush`, `LocalGlassHeaderBrush`, `LocalGlassButtonBrush`, `PopupBackgroundColor`, `InputBackgroundBrush`) and 9-slice velvety 4-edge cool-blue inner shadow (`LocalGlassInsetBrush`) |
| `--me-glass-hover` / `--me-glass-tab-idle` / `--me-glass-zebra` | Glass hover brighten (`HoverBrush`, `ListItemHoverBrush`), recessed inactive folder tabs (`LocalGlassTabIdleGradBrush`), and subtle alternating glass stripe (`LocalGlassZebraBrush`) |
| `--me-rim` / `--me-rim-soft` / `--me-rim-strong` | Crisp steel-blue glass panel rims and architectural hairlines (`PanelSeparatorColor`, `WindowPanelSeparatorColor`, `NormalBorderBrush`, `PopupBorderColor`, `MenuSeparatorBrush`, `LocalRimStrongBrush`) |
| `--me-charcoal-top` / `--me-charcoal-mid` / `--me-charcoal-bot` | Glossy vertical charcoal-glass selection bar (`LocalCharcoalBarBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `TooltipBackgroundBrush`) |
| `--me-ink` / `--me-steel-ink` / `--me-ink-muted` / `--me-white` | Architectural carbon ink (`TextColor`), steel-blue chrome/captions (`LocalSteelInkBrush`, `HeadingForegroundBrush`, `TabItemForegroundBrush`), muted slate (`TextColorDarker`), and pure white / window-art flip (`SelectedForegroundBrush`, `WindowArtForegroundBrush`) |
| `--me-crimson` / `--me-crimson-top` / `--me-crimson-bot` / `--me-crimson-hover` / `--me-crimson-press` | Blazing Mirror's Edge Red (`LocalRedPillarBrush`, `LocalCrimsonGlassBrush`, `PrimaryButtonBackgroundBrush`, `ScrollBarThumbBrush`, `SliderThumbBackgroundBrush`, `GlyphColor`, `FocusBrush`, `TabItemIndicatorBrush`) |
| `--me-track-blue` / `--me-slider-active` / `--me-slider-idle` | Exact *Mirror's Edge* 2008 steel-blue scrollbar & slider tracks (`ScrollBarTrackBrush`, `ProgressBarTrackBrush`, `LocalSliderActiveBrush`, `SliderTrackBrush`) |
| `--me-sky` / `--me-sky-bright` / `--me-sky-wash` | Dedicated Rooftop Sky Cerulean running & launching polarity (`RunningIndicatorBrush`, `LocalSkyBrightBrush`, `LocalSkyWashBrush`), distinct from crimson and filter amber |
| `--me-amber` / `--me-amber-text` / `--me-emerald` | Runner Bag Signal Amber active filter `+` pip (`DataChangeNotifColor`, `WarningBrush`), mixed rating (`MixedRatingBrush`), and positive rating (`PositiveRatingBrush`) |

`GameBannerTintBrush` uses `--me-sky-bg` (`#EBF2FA`, solid glacial sky-mist with no alpha) so dragging "Banner darkening" dissolves banner art smoothly into the daylight canvas.

Radii: `ControlCornerRadius` 0, `CornerRadiusSmall` 0, `CornerRadiusLarge` 6 (asymmetric bottom-right Catalyst facet on active toolbar toggles), `CornerRadiusFull` 9999 (circular radio rings and notification badges only). Type: `Barlow` (`FontFamily`, bundled Regular/Medium/SemiBold/Bold in `src/Typography/` with `Segoe UI` fallback) + `Sora` (`HeadingFontFamily`, italic display & glass headings, bundled Regular/SemiBold/Bold in `src/Typography/` with `Segoe UI` fallback) + `Consolas` (`MonospaceFontFamily`, drawn as `Cascadia Mono` in HTML previews); sizes 12 / 14 / 15 / 20 / 28.

## Component spacing

`Common.xaml`: `ControlHeight` 32; `IconSize` 16; `GameBannerHeight` 260; `GameBannerDarken` 0; `ButtonPadding` 14,5; `InputPadding` 9,5; `MenuPadding` 0,4,0,4; `MenuItemPadding` 10,4; `ComboBoxDropDownPadding` 0,4,0,4; `ComboBoxItemPadding` 10,4; `ListBoxItemPadding` 10,5; `GroupBoxPadding` 12,10,12,12; `TooltipPadding` 10,6.

## Shell

| File | What it draws |
| --- | --- |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | Iconic 44px Blazing Mirror's Edge Red vertical glass pillar (`LocalRedPillarBrush` + `micro-grid.png` + `glass-sheen.png` + right-edge depth shadow), crowned by the main menu `LocalStrideMenuMarkTemplate` (Common.xaml, also the top bar's menu button): three white rooftop slabs stepping down to the right; hover pops them up in turn like platforms, and while the menu is open Runner Vision turns them Mirror red one after another while a white runner dot sprints down the steps on repeat; the rail also carries the white Kinetic Shard Chevron and anchored by a chunky white `+`; active `SidebarItem` cuts an inverted stark snow-white horizontal glass slab with dark icon; turns transparent with `WindowArtForegroundBrush` when `ShowBackgroundImageOnWindow=True` |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml` | 48px Frosted Ice-Blue Glass header bar with white top catchlight, cool-blue bottom inner shadow, and steel-blue rim; 256×32 recessed glass search well with top inner shadow, persistent magnifier, full-hit `PART_ClearTextIcon`, and crimson focus rim; frosted glass filter toggle with chunky Runner Bag Signal Amber `+` pip (zero text label); sorting-first `PART_PanelMainItems`, icon-only frosted glass buttons with crimson glass active toggle (`CornerRadius="0,0,6,0"`), 12px steel-blue/blazing-red `PART_ProgressGlobal`, 136px caption clearance; `TopPanelMenu` plain `BasedOn` `ContextMenu` |
| `DerivedStyles/MainWindowStyle.xaml`, `StandardWindowStyle.xaml`, `WindowBarButton.xaml` | 44×47 main caption buttons and 44px Frosted Ice-Blue Glass dialog masthead (`CaptionHeight=44`) crowned at far-left by a 14px blazing red vertical pillar, Kinetic Shard Chevron, italic `Sora` Bold title (`WindowSettings` -> `LOCSettingsLabel`), subtle `city-skyline.png` silhouette in a zero-desired-size `Canvas`, velvety 4-edge window glass inner shadow, and 46×43 caption buttons with blazing red Close tile |
| `DefaultControls/TreeView.xaml` | Settings & Add-ons frosted ice-blue glass column (`WindowSettings` 252px, `WindowExtensions` 280px, `VerticalScrollBarVisibility="Visible"`, 9-slice inner shadow), bare 28px `Barlow` rows, snow-white hover wash, glossy charcoal-glass selected bar + 3px blazing red left bar + pure white text |
| `Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml` | Sunlit glacial sky-mist canvas (`LocalSkyCanvasBrush`), full-strength `PART_ImageBackground` reaching under the 44px red pillar with soft bottom fade into `WindowArtSwatch`; frosted ice-blue glass 28px filter & explorer sidebars with velvety inner shadows turning transparent with `WindowArtForegroundBrush` when `ShowBackgroundImageOnWindow=True` |

## Game page

`art/gen-overviews.mjs` generates `Views/DetailsViewGameOverview.xaml` and `Views/GridViewGameOverview.xaml` via `scripts/overview-generator.mjs` and applies responsive breakpoints + `GameDetailsPanePosition` (`Right`, `Left`, `Center`, `Stretch`) via `scripts/game-page-breakpoints.mjs`:
- Sunlit glacial sky-mist `HeroArt` dissolve (`GameBannerHeight=260`, `DetailsBannerSpacer` `x * 190 / 260` floor 20, `GridBannerSpacer` `x * 180 / 260` floor 14) with `GameBannerDarken` + 50% `GameBannerTintBrush` floor, plus subtle `city-skyline.png` rising along the bottom edge.
- Header pairs `PART_ImageIcon`, italic glass-etched `Sora` Bold title (flips to `WindowArtForegroundBrush` over window art), Blazing Crimson Glass `PlayButton` + `PART_ButtonContextAction` + `RunningActionIndicator`, equal 42×42 frosted glass `SecondaryButton` More/Edit buttons, and a closing steel-blue rim + 68px blazing red datum bar.
- Two-column body sets `SteamScreenshotsGameScope` + Description/Notes (led by chunky red `+` marks) beside the Tempered Ice-Blue Glass Metadata Dossier (`GameDetailsPaneWidth`/`GridDetailsPaneWidth=300` usable inner width, 9-slice velvety 4-edge inner shadow + `glass-sheen.png`, 26px glass `Details` header bar with 4px red left pillar, steel-blue hairline group breaks).
- Custom 28×28 frosted ice-blue glass `SidePanelCloseButton` wiping blazing red on hover (`InlineSidePanelCloseButton` sticks left of icon below 120px or when `ShowBackgroundImageOnWindow=True`).
- Tempered Glass `EmptyGameTemplate` over sunlit `city-skyline.png` centered in `ViewportHeight` in both views (`PART_ScrollViewHost` explicitly `Visibility="Visible"`).

## Components

| Playnite file | Component |
| --- | --- |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | `LocalStrideMenuBoardTemplate` (tempered ice-blue glass sheet, 9-slice `glass-inset.png` 4-edge inner shadow, `glass-sheen.png`, white top catchlight, 4px blazing red left vertical pillar), 30px glossy charcoal-glass wipe bar (`ScaleX 0.90->1`, `110ms`) with chunky blazing red `+` mark and pure white text/icons, 10px red-`+` steel-blue separators, frosted glass `Consolas` shortcuts, blazing red `Alt+Q` Exit bar with white `+`, solid red 14×14 check badge (row in `docs/themes/menus.md`) |
| `DerivedStyles/PlayButton.xaml` | Hero Blazing Crimson Glass slab (`168×42`) with white top specular catchlight, ambient + hover sweeping `glass-sheen.png` window reflection, italic `Sora` Bold label, and sliding twin chevrons; Rooftop Sky Cerulean running/launching plate with `RunningBreath` scrim, angled diagonal `RunningScan`, `PlayRoom` 36px strip, 3 staggered skewed momentum bars, and `Cancel` on button hover (`RelativeSource Self`) |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Tempered ice-blue glass rows; snow-white glass hover + `RowHoverAction` Play/Install controls (`RowHoverRoom` 38px); glossy charcoal-glass selected bar + pure white text + chunky blazing red `+` mark; Rooftop Sky Cerulean running sweep (`RowRoom` 38px + `RunningMarkPlate`); light-theme `WindowArtForegroundBrush` flip |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Cover tiles with charcoal hover frame, `CornerMarksTemplate` registration ticks & `1.015` lift; `50×50` staggered crimson glass Play / frosted glass Info `GridTileButton` controls; `2.5px` blazing red selection frame + top-left diagonal shard notch; inset Rooftop Sky running indicator + 18px bottom tape |
| `DerivedStyles/PropertyItemButton.xaml`, `TextBlockGameScore.xaml` | Underlined links and frosted ice-blue glass tag chips inverting to glossy charcoal-glass + 2.5px blazing red left rail + pure white text on hover; `Consolas` Bold tabular rating plaques |
| `DefaultControls/*` | 32px frosted ice-blue glass buttons (`IsDefault` blazing crimson glass, `Width == 41` ThemeModifier 32/41 trigger), recessed glass `TextBox` / `PasswordBox` with top inner shadow, crimson-glass `CheckBox` / `RadioButton`, exact 2008 steel-blue/red-thumb `Slider` (disables banner sliders on window art), steel-blue/red diagonal-striped `ProgressBar`, blazing-red-thumb on steel-blue-track `ScrollViewer`, raised snow-white vs recessed ice-blue glass folder `TabControl`, tempered glass `GroupBox`, frosted glass `ListBox`, glossy charcoal crimson-railed `ToolTip`, and frosted glass `Expander` |

## Previews

`art/preview-details.html` and `art/preview-settings.html` render `art/screenshot-details.png` and `art/screenshot-settings.png` at 1280×720 using `src/tokens.css` variables, bundled `Barlow` and `Sora` faces (`Consolas` rendered via bundled `Cascadia Mono`), and white-mask FX sprites (`glass-inset.png`, `glass-sheen.png`, `city-skyline.png`, `micro-grid.png`, `momentum-stripes.png`).

## Running game

`RunningIndicatorBrush` (`--me-sky: #0068A3`, Rooftop Sky Cerulean) with angled `-22°` diagonal velocity scan (`StartPoint="0,0" EndPoint="1,0.35"`), smooth `2px` bottom velocity fill bar (`RunningFill`), and 3 staggered `-22°` skewed parallel momentum bars (`M1`/`M2`/`M3`) cascading sequentially on `IsLaunching` (`1.55s` loop) and breathing quietly in phase on `IsRunning` (`3.0s` loop).

## Deviations

- Uses 9-slice procedural white-mask inner shadow (`glass-inset.png`), compact vector 4-edge inner shadow (`LocalCompactInsetTemplate`), and diagonal window reflection (`glass-sheen.png`) in place of `DropShadowEffect` or live shader blur (disallowed for WPF performance and crisp legibility).
- Uses bundled SIL OFL `Sora` and `Barlow` static TTFs as open geometric/Swiss stand-ins for *Mirror's Edge*'s proprietary neo-grotesque / display typography (`RESEARCH.md`).

## Not verified yet

- Interactive pointer transitions (`PlayButton` hover sheen, `GridTileButton` hover, `RowHoverAction` pointer reveal, `ShowBackgroundImageOnWindow=True` art-contrast flipping) and live Playnite `icofont.ttf` menu glyphs are verified directly inside live Playnite rather than headless harnesses.
