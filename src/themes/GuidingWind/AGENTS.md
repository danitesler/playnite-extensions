# Guiding Wind: theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), light misty-washi workspace with pure sumi-black top chrome and left rail, inspired by the UI of **Ghost of Tsushima** (Sucker Punch Productions / Sony Interactive Entertainment) as seen in public captures. Unofficial: not affiliated with, endorsed by or sponsored by Sucker Punch Productions or Sony Interactive Entertainment (`info/NOTICE-GuidingWind.txt`). Ships no game files, logos, or proprietary fonts; the brand mark is an original *kamon*-style twin swirling wind-eddy crest enclosing a nested diamond seal (`art/mark.svg` and `IconMainMenu`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Captures, pixel samples, contrast verification and UI rules: [`RESEARCH.md`](RESEARCH.md). Creative brief (source DNA, visual-role map, signature moments, motion language, branding, review): [`BRIEF.md`](BRIEF.md). Public UI captures from `interfaceingame.com/games/ghost-of-tsushima/` were inspected locally in scratch storage and never shipped in the repo.

## Tokens

`gt-*` in `src/tokens.css`. Corner radii: `gt-radius` 2px (`ControlCornerRadius`), `gt-radius-small` 1px (`CornerRadiusSmall`), `gt-radius-large` 4px (`CornerRadiusLarge`), `gt-radius-xlarge` 6px (`CornerRadiusXLarge`).

| Token | Key | Used for |
|-------|-----|----------|
| `gt-sumi`, `gt-ink-banner`, `gt-brush-dark` | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush`, `ScrimBrush` / `HeaderBandBrush` / `PrimaryButtonBackgroundBrush` | Top bar, left rail, window title band, sumi-e section banners, idle Play slab |
| `gt-ink-deep`, `gt-ink`, `gt-ink-muted` | `SidebarItemSelectedForegroundBrush`, `HeadingForegroundBrush`, `HeadingRuleBrush`, `SliderThumbBackgroundBrush` / `TextBrush`, `SectionHeaderBrush` / `TextBrushDarker`, `TabItemForegroundBrush` | Active tab glyphs, display titles, slider ink thumb, body text, muted labels |
| `gt-mist`, `gt-mist-hi`, `gt-mist-lo`, `gt-mist-plate` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `GameBannerTintBrush` / `ButtonBackgroundBrush`, `InputBackgroundBrush`, `PopupBackgroundColor` / `MainColor`, `HoverBrush`, `ExpanderBackgroundBrush`, `ListItemHoverBrush`, `MenuItemHoverBrush` / `SidebarItemForegroundBrush` | Misty washi workspace, banner fog veil, keycaps, hover washes, sidebar/top-bar idle ink |
| `gt-mist-edge`, `gt-mist-line`, `gt-scroll-thumb` | `NormalBorderBrush`, `ButtonBorderBrush`, `InputBorderBrush`, `SliderTrackBrush`, `TabItemHoverIndicatorBrush` / `PanelSeparatorBrush`, `WindowPanelSeparatorBrush`, `MenuSeparatorBrush`, `ScrollBarTrackBrush` / `ScrollBarThumbBrush`, `ThumbBrush` | Keycap borders, divider hairlines, scrollbar thumbs & splitters |
| `gt-washi`, `gt-tab-top`, `gt-tab-mid`, `gt-tab-bot` | `WindowArtForegroundBrush`, `TextBrushDark`, `SelectedForegroundBrush`, `HeaderBandForegroundBrush`, `ParchmentTextBrush`, `PropertyItemForegroundBrush`, `ButtonHoverBackgroundBrush` / `BevelShadowBrush` / `TopPanelItemCheckedBackgroundBrush`, `BevelLightBrush` | Warm white text on dark/crimson/jade plates, wallpaper text fallback, vertical washi active tab gradient |
| `gt-sayagata`, `gt-sayagata-fret`, `gt-sayagata-chip`, `gt-sayagata-rim` | `ParchmentBrush`, `TooltipBackgroundBrush`, `SecondaryButtonBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush` / `TopPanelSeparatorBrush`, `FrameInnerBrush` / `PropertyItemBackgroundBrush`, `SecondaryButtonHoverBackgroundBrush`, `ProgressBarTrackBrush` / `PopupBorderBrush`, `ParchmentEdgeBrush`, `FrameBrush`, `PrimaryButtonBorderBrush` | Dark Sayagata lacquer metadata card, tooltips, top search well, chips, secondary buttons |
| `gt-crimson-aa`, `gt-crimson`, `gt-crimson-lit`, `gt-crimson-deep` | `GlyphBrush`, `SelectedBrush`, `ListItemSelectedBrush`, `FocusBrush`, `PrimaryButtonHoverBackgroundBrush`, `PropertyItemHoverBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `NegativeRatingBrush` / `HighlightGlyphBrush` / `SidebarItemSelectedGlowBrush`, `PrimaryButtonGlowBrush` / `DangerBrush`, `PrimaryButtonPressedBackgroundBrush` | Dry-brush selection plates, Play hover flare, red active corner triangle, danger hover, checked toggles |
| `gt-gold`, `gt-gold-bright`, `gt-gold-deep`, `gt-gold-ink`, `gt-gold-mark` | `ParchmentLabelBrush`, `HeadingMarkerBrush`, `FrameHoverBrush` / `SelectedBorderBrush`, `ParchmentTitleBrush`, `ParchmentLinkBrush`, `ProgressBarForegroundBrush`, `GridViewItemSelectedBorderBrush` / `TooltipBorderBrush` / `LinkBrush`, `MixedRatingBrush` / `DataChangeNotifBrush`, `WarningBrush` | Metadata labels, section banner diamonds, links on mist & Sayagata card, active filter diamond pip, progress fill |
| `gt-firefly`, `gt-firefly-lit` | `RunningIndicatorBrush`, `PositiveRatingBrush` | Firefly Jade launching/running indicator sweep, foot progress rule, diamond motes, positive scores |

**Banner darkening color**: `GameBannerTintBrush` = `gt-mist` (`#d4d6d3`) so darkened hero banners veil cleanly into misty washi fog rather than black.

**Fonts**: `HeadingFontFamily` Sora (`Sora-Regular.ttf`, `Sora-SemiBold.ttf`, `Sora-Bold.ttf` bundled under `src/Typography/`, OFL) for display headings, Play button, section banners and tabs; `FontFamily` Segoe UI (`MonospaceFontFamily` Consolas). Preview HTML uses `Segoe UI` and `Sora` via Google/local fonts checked by `scripts/theme-fonts.mjs`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Why |
|-----|-------|-----|
| `ControlHeight` | 32 | Shared repo rule for inputs and controls |
| `IconSize` | 16 | Standard action and glyph size |
| `ButtonPadding` / `InputPadding` | 16,5 / 10,5 | Balanced uppercase buttons and 32px form inputs |
| `ComboBoxItemPadding`, `ListBoxItemPadding` | 12,6 | Breathing room for dry-brush ink plate selections |
| `MenuPadding`, `ComboBoxDropDownPadding` | 4 | Compact popup frame margin |
| `MenuItemPadding` / `TooltipPadding` | 12,6 / 10,6 | Context menu and Sayagata tooltip padding |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 14,12,14,14 / 0,0,0,8 | Compact card spacing (never constrains `Statistics` card widths) |
| `GameBannerHeight` / `GameBannerDarken` | 268 / 0 | Hero banner height and ThemeModifier darken floor |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px `gt-sumi` rail closed by 1px hairline; Guiding Wind *kamon* inside a dark Sayagata keycap seal, animated by `LocalGuidingWindMenuMarkTemplate` (Common.xaml, also the top bar button: two white swirl arms round a gold diamond; hover runs a gold dash streak along each arm like a gust, open dims the arms and stretches the diamond into a compass needle that turns north-east and seeks until the menu closes); active items fill with vertical washi gradient + top-left crimson corner triangle (`gt-crimson-lit`). Transparent background in window-art mode |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px sumi-black top bar with subtle Sayagata lattice, search box, filter toggle with active 9px antique-gold diamond pip (`DataChangeNotifBrush`), 34x34 view/sort switches (active item fills in vertical washi gradient + top-left crimson triangle at uniform 34px plate height), 15px gold notifications badge, and 12px progress bar |
| `CustomControls/SearchBox.xaml` | Dark Sayagata well with warm washi input, clear action and crimson hover/focus rim |
| `DerivedStyles/MainWindowStyle.xaml` | Frameless window chrome, 40x32 caption buttons, full-window wallpaper scrim (`ScrimBrush` 0.65) |
| `Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml` | Misty washi library surfaces switching transparent with `WindowArtForegroundBrush` labels/items under `ShowBackgroundImageOnWindow=True`; 28px FilterPanel controls & presets |

## Game page

Generated via `art/gen-overviews.mjs` (`node src/themes/GuidingWind/art/gen-overviews.mjs`), implementing `applyGamePageBreakpoints`:

- Banner: `GameBannerHeight` (268px) hero art with top/bottom linear fades into `PageRoot.Background.Color` (no `OpacityMask` over hero art) and ThemeModifier darken layers (`GameBannerDarken` + 0.5 floor); collapses when `ShowBackgroundImageOnWindow` is enabled.
- Title & actions: uppercase `Sora` display title (switching to `WindowArtForegroundBrush` on window wallpaper) over diamond-flanked feathered `DividerTemplate`; sumi/crimson `PlayButton` (`184x44`) beside equal `40x40` dark Sayagata keycap `More` and `Edit` buttons (`ToolTip`s preserved).
- Body: `SteamScreenshotsGameScope` eligibility gate (`cb91dfc9-b977-43bf-8e70-55f46e410fab` / Steam source), `PART_ElemDescription` & `PART_ElemNotes` headed by black sumi-e brush-stroke banners (`brush-banner-r.png`), and the 300px (`GameDetailsPaneWidth` / `GridDetailsPaneWidth`) dark Sayagata lacquer metadata card (`ParchmentBrush`, tiled `sayagata.png`, antique gold rule/labels/links, high-contrast `ParchmentTextBrush` values, Sayagata fret chips, `TextBlockGameScore` washi pills, and all 6 `Meta*` groups).
- Grid side panel: includes 28x28 `SidePanelCloseButton` and sticky `InlineSidePanelCloseButton` below `GameBannerHeight < 120` or `ShowBackgroundImageOnWindow=True`, plus `EmptyGameTemplate`.

## Components

| Playnite file | Drawn as |
|---------------|----------|
| `Common.xaml` | White-mask sprites & shared templates: `InkPlateTemplate` (9-slice `brush-plate.png`), `GlowFrameTemplate` (9-slice `bloom.png`), `DividerTemplate` (diamond-flanked feathered hairline), `GrainTemplate` (256x256 mulberry washi fibers), `BrandMarkTemplate`, `CornerMarksTemplate`, `SteamScreenshotsSkeletonTemplate`, `EmptyGameTemplate` (animated drifting wind wisps & double circles while visible) |
| `Button`, `RepeatButton`, `ToggleButton` | Crisp 2px washi keycaps with 1px inner bevel and crimson hover rim (`Button` preserves ThemeModifier's 41px `LayoutTransform` `0.7804878` scale trigger); `ToggleButton` fills checked states with crimson dry-brush `InkPlateTemplate` |
| `TextBox`, `PasswordBox`, `ComboBox` | 32px keycap input wells with 2px bottom crimson focus rule; `ComboBox` reserves 36px right chevron clearance and references `{DynamicResource BareTextBox}` |
| `CheckBox` / `RadioButton` | Crisp keycap checkbox turning vermilion crimson with white checkmark / circular ink ring holding a rotated crimson diamond core (`DiamondCore`) |
| `Slider` / `ProgressBar` | Ink-stroke track with signature `-8deg` rotated ink-dash `SliderThumb`; `ProgressBar` keeps `MinHeight="8"` with animated indeterminate shimmer |
| `ScrollViewer`, `Thumb`, `Expander`, `GroupBox` | Slim ink scrollbars with 0.4 track fill over window wallpaper; `GroupBox` uses content-sized `brush-banner-r.png` headers with antique gold diamonds; `Expander` switches to transparent + `WindowArtForegroundBrush` over window wallpaper |
| `ContextMenu`, `Menu`, `ComboBox`, `CustomControls/ComboBoxList`, `FilterSelectionBox` | Menus (every popup menu, `TopPanelMenu`, ComboBox and multi-select lists): one washi sheet (`LocalWashiSheetTemplate`: misty washi with fibre grain, Sayagata-rim edge, 3px sumi crown and the active tab's crimson corner triangle); 30px rows where a sumi-e dry-brush stroke is pulled in behind the label (icon stays on the washi) and the label turns washi; bracketed `[F4]` key prompts in Sora (muted ink, gold on the stroke); dry-brush dashes as group breaks; Exit's stroke is crimson; checked rows a crimson keycap tick. Recipe `docs/themes/menus.md` |
| `ToolTip`, `ListBox`, `TreeView`, `ListView` | Dark Sayagata tooltips; dry-brush crimson list selections (`SelectedBar` 2px gold left bar); minimal 28px bare Settings `TreeViewItem` rows with reserved vertical scrollbar lane (`WindowSettings` 250 / `WindowExtensions` 280) |
| `TabControl` | `Sora` SemiBold headers with `HeaderText` isolation and crimson `TabItemIndicatorBrush` bottom underline |
| `StandardWindowStyle`, `WindowBarButton` | 44px sumi-black title band with tiled `sayagata.png`, Guiding Wind *kamon* seal, ghosted watermark, uppercase title, 1px bronze-gold bottom rule, and 46x44 caption buttons |
| `PlayButton` | Sumi-black dry-brush `InkPlateTemplate` slab with red corner seal surging crimson on hover + outer bloom + gold corner ticks; switches to Firefly Jade (`RunningActionIndicator`) with wind wisps & floating diamond motes when launching/running, swapping label to `LOCCancelLabel` via `RelativeSource Self` inside `PlayRoom` (`0,0,34,0`) |
| `GridViewItemStyle`, `GridViewItemTemplate` | Crimson hover brackets & bloom; antique gold selection frame + corner seal; 42x42 `GridTileButton` hover actions rising 8px with `BackEase` |
| `DetailsViewItemStyle`, `ListView` | Misty rows switching cleanly to `WindowArtForegroundBrush` over wallpaper before hover/selection; dry-brush crimson selected plate + 2px gold left bar |
| Running game (`RunningIndicatorBrush` = `gt-firefly` `#137a43`) | **Launching & Running**: `RunningIndicator` overlay across `DetailsViewItemStyle`, `ListView`, `GridViewItemStyle`, and `PlayButton` (`RunningActionIndicator`) using clipped `wind-wisps.png` launch sweep, 2px bottom charge line, and 3 animated diamond firefly motes (`RunningMote1..3`) inside a reserved right strip (`RowRoom` `0,0,50,0` / `PlayRoom` `0,0,34,0`) |
| `PropertyItemButton`, `TextBlockGameScore` | Gold metadata links & charcoal Sayagata chips inside metadata card; crisp washi pill game score badges for AA contrast on both dark Sayagata lacquer and light mist |

## Previews

Hand-written HTML in `art/` (`preview-details.html`, `preview-settings.html`) driven strictly by `src/tokens.css` variables (`var(--gt-*)`, 0 hex literals), raster sprites from `art/sprites.py` (fixed seed `1274`), and inline SVGs matching `Media.xaml` and `art/mark.svg`. Rendered screenshots live at `art/screenshot-details.png` and `art/screenshot-settings.png`.

## Deviations

- Native WPF lacks CSS `letter-spacing`, so tracked uppercase headers use `StringToUpperCaseConverter` and `Sora` SemiBold/Bold spacing.
- Playnite settings/dialog controls keep crisp 2px architectural keycaps while reserving feathered sumi-e dry-brush `InkPlateTemplate` (`brush-plate.png`) and `brush-banner-r.png` for active selections, `GroupBox`/overview section banners, and `PlayButton` so dense forms stay aligned.
- Unlicensed Ghost of Tsushima typefaces are replaced cleanly by bundled OFL `Sora` and stock `Segoe UI`.

## Not verified yet

- Built on macOS where Windows `PresentationFramework` / Playnite Desktop (`10.60+`) are unavailable: `scripts/validate-extension.ps1 -Extension guidingwind -Mode Package` (WPF `-STA` checks), `scripts/build-theme.ps1 -Extension guidingwind -Launch`, WPF C# unit/XAML runtime tests (`dotnet test tests/Tests.csproj`), and live Playnite rendering at 100% / 125% / 150% DPI scaling remain to be verified on Windows.
