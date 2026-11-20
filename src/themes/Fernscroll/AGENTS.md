# Fernscroll - theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by *Snufkin: Melody of Moominvalley* (Showcase ambition, light theme `[Light, Desktop]`). Warm watercolor parchment canvases (`#edebd6` / `#e3e0ca`) paired with Dark Plum woodblock cards & pointed selection plaques (`#3b2c2f` with crisp inset cream rims), Snufkin Pine Green swallowtail Play ribbons (`#336149`), Quest Crimson shields/accents (`#b5453e`), and Twilight Nocturne Indigo (`#2a547e`) running indicators.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference captures, measured palette contrasts, typography, and motion research live in [`RESEARCH.md`](RESEARCH.md). Creative brief (5 Source DNA traits, game element map, hero/secondary signature moments, motion language, branding): [`BRIEF.md`](BRIEF.md). Source CSS tokens: [`src/tokens.css`](src/tokens.css).

## Tokens

| Token | Key | Used for |
|-------|-----|----------|
| `--mv-paper` / `--mv-paper-rail` | `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `WindowBackgourndBrush`, `NormalBrush` | Primary reading parchment (`#edebd6`) and navigation rail (`#e3e0ca`) |
| `--mv-ink-deep` / `--mv-sepia` | `TextBrush`, `TextBrushDarker`, `HeadingForegroundBrush`, `HeadingRuleBrush` | Deep umber body & heading ink (`#2f2629`) and muted metadata/uninstalled taupe (`#6a5f58`) |
| `--mv-plum` / `--mv-plum-border` | `ButtonBackgroundBrush`, `SelectedBrush`, `ListItemSelectedBrush`, `ParchmentBrush`, `TooltipBackgroundBrush` | Dark Plum woodblock plaques (`#3b2c2f`) with warm inset cream print rim (`#e6e2ce`) |
| `--mv-pine` / `--mv-pine-hover` | `PrimaryButtonBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `GlyphBrush`, `ProgressBarForegroundBrush` | Swallowtail Play ribbon & active indicators (`#336149` / `#3e7357`) |
| `--mv-gold` / `--mv-gold-soft` | `PrimaryButtonGlowBrush`, `GridViewItemHoverBorderBrush`, `ParchmentLabelBrush`, `LinkBrush` | Sunbeam Gold hover bloom, curls, and Quest Card labels (`#e2a84b` / `#e9cb87`) |
| `--mv-crimson` | `HeadingMarkerBrush`, `DataChangeNotifBrush`, `DangerBrush`, `FilterActive` pip | Quest Shield (`!`), alert dots, filter toggle pip, danger actions (`#b5453e`) |
| `--mv-indigo` | `RunningIndicatorBrush`, `FocusBrush`, `SliderThumbHoverBorderBrush` | Distinct Twilight Nocturne Indigo (`#2a547e`) for Running/Launching state & focus rules |
| `--mv-cream-text` | `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush`, `ButtonForegroundBrush`, `WindowArtForegroundBrush`, `ParchmentTextBrush` | Warm cream text on Dark Plum plaques, Pine Green ribbons, and darkened window art (`#edebd6`) |
| Display / Body / Note | `HeadingFontFamily`, `FontFamily`, `NoteFontFamily` | Bundled `Pathway Gothic One`, `Barlow Semi Condensed`, and `Patrick Hand` |

## ThemeModifier

Keep ThemeModifier's Edit constants list aligned with `scripts/data/theme-keys.json` (`GameDetailsPanePosition`: Right/Left/Center/Stretch; `GameDetailsPaneWidth` / `GridDetailsPaneWidth`: 300px default; `GameBannerHeight`: 256px default; `GameBannerDarken`: 0 default). `Slider.xaml` disables `GameBannerHeight` / `GameBannerDarken` (`Opacity = 0.4`, `IsEnabled = False`) whenever `ShowBackgroundImageOnWindow` is enabled.

## Component spacing (`src/Common.xaml`)

| Key | Value | Role |
|-----|-------|------|
| `ControlHeight` | `32` | Standard `Button`, `ToggleButton`, `TextBox`, `PasswordBox`, and `ComboBox` min height |
| `IconSize` | `16` | Default glyph size across sidebar, top panel, and dialogs |
| `GameBannerHeight` | `256` | Default hero banner art height (`Details` / `Grid` overview; spacer scales via `MathConverter`) |
| `GameBannerDarken` | `0` | Optional parchment wash over hero banner art with 0.5 floor above 0 |
| `GameDetailsPaneWidth` | `300` | Details overview Metadata Quest Card usable inner width |
| `GridDetailsPaneWidth` | `300` | Grid overview Metadata Quest Card usable inner width |
| `GameDetailsPanePosition` | `Right` | Metadata Quest Card placement (`Right`, `Left`, `Center`, `Stretch`) |
| `ControlCornerRadius` | `4` | Plaque, input well, and popup corner radius |

## Shell

| File | What it draws |
|------|---------------|
| `DerivedStyles/MainWindowStyle.xaml` | Parchment window chrome, background art backdrop + warm fade support (`WindowArtForegroundBrush`) |
| `DerivedStyles/StandardWindowStyle.xaml` | Settings/Add-ons/Dialogs title bar chrome with crisp Dark Plum title bar buttons |
| `DerivedStyles/WindowBarButton.xaml` | Minimize / Maximize / Close caption buttons with Quest Crimson danger close hover |
| `DerivedStyles/HighlightBorder.xaml` | Soft gold/ink highlight border for focus/hover wrappers |
| `Views/MainWindow.xaml` | Root layout hosting background image, top panel, sidebar, library workspace, notification overlay |
| `Views/TopPanel.xaml` | 40px top bar ordering filter button (with Crimson Quest Shield when active), SearchBox, grouping/sorting/view pickers, progress bar, notifications |
| `Views/Sidebar.xaml` | Left navigation rail with Reed-Note `BrandMarkTemplate` badge and vertical item stack |
| `Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml` | Library split panes (`Details`, `Grid`, `List`), filter drawers, close controls, explorer tree |
| `CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml`, `SearchBox.xaml` | Sidebar items with minimum `16x16` icon footprint, persistent search magnifier + full hit-target clear `X`, active filter Crimson Quest Shield indicator |

## Running game

- `RunningIndicatorBrush`: Twilight Nocturne Indigo (`#2a547e`) - distinct from Play Pine Green (`#336149`), Selected Dark Plum (`#3b2c2f`), and Crimson filter markers (`#b5453e`).
- `DetailsViewItemStyle.xaml` & `DefaultControls/ListView.xaml`: `RunningMarkPlate` (`Width="42"` fade right), `RunningScan` revealing `Images/fx/melody-wisps.png` strokes across `1.55s` launch sweep, `2px` `RunningFill` foot bar (`0 -> 1` launch, `1` steady when running), `RunningFrame` (`2px` indigo + inset cream rim), and `RunningNotesHost` floating eighth-note (`LocalNoteGeometry`) + two diamond motes drifting calmly on a `3.2s` loop (`1.55s` faster flutter on launch). `RowRoom` reserves `Padding="0,0,42,0"` whenever `IsLaunching` or `IsRunning` is true.
- `DerivedStyles/PlayButton.xaml`: `PlayButton` turns the swallowtail ribbon indigo during `IsLaunching`/`IsRunning`, reserves `PlayRoom` `Padding="0,0,26,0"` (`CancelLabel` `Margin="0,0,26,0"`), reveals `LOCCancelLabel` via `RelativeSource Self` on hover over `RUNNING`, and layers `RunningActionIndicator` (`2px` gold foot bar + trailing floating eighth note and mote) inside the cell.
- `DerivedStyles/GridViewItemStyle.xaml`: Indigo outer `GlowFrameTemplate`, `2px` frame + inset cream rim, vertical `melody-wisps.png` launch sweep, bottom scrim with `2px` fill line and floating eighth note + diamond motes.

## Components

Both `DetailsViewGameOverview.xaml` and `GridViewGameOverview.xaml` include `EmptyGameTemplate` centered over `PART_ScrollViewHost` (`Visibility="Visible"`), `SteamScreenshotsGameScope`, `GameDetailsPaneWidth` / `GridDetailsPaneWidth` inside the Dark Plum Quest Card crowned by `LocalQuestShieldTemplate`, equal `40x40` Dark Plum `More`/`Edit` icon buttons with `ToolTip`s, and responsive breakpoints generated via `scripts/game-page-breakpoints.mjs`.

| Playnite file | Fernscroll component |
|---------------|----------------------|
| `DefaultControls/Button.xaml`, `ToggleButton.xaml`, `RepeatButton.xaml` | Dark Plum woodblock plaques with inset cream print rim, flecks, and preserved `Width="41"` `0.7804878` scale trigger for ThemeModifier |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `ComboBox.xaml` | Warm cream input wells with indigo `FocusBar`, `BareTextBox`, 36px chevron column clearance; the dropdown list is the menus' parchment sheet and rows |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | Menus (every popup menu, `TopPanelMenu`, ComboBox and multi-select lists): Quest Card parchment sheet (`LocalMenuSheetTemplate`: paper tooth, ink edge, inset hairline broken by a pine twin-scroll foot), 30px rows with the icon on the parchment and a pointed SAVE #1 plum plaque laid down left to right on highlight, handwritten Patrick Hand shortcuts, curl + tapered pen-stroke group breaks, crimson Exit, pine brushed tick on checked rows; recipe `docs/themes/menus.md` |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | Hand-inked square/circle wells with dark umber checks/dotsmatching Settings captures |
| `DefaultControls/Slider.xaml`, `ProgressBar.xaml` | Slender ink track, dark plum circular ink-blot thumb, and `ShowBackgroundImageOnWindow` disables on banner sliders |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | Vertical thumb masked with `Images/fx/scroll-thumb.png` tapered needle; clean horizontal pill; `0.4` TrackFill under wallpaper |
| `DefaultControls/TabControl.xaml`, `GroupBox.xaml` | Bare borderless tabs/groups with Pathway Gothic headings, scroll curls, and star-column tapered rules (`TargetName` `HeaderText` recoloring; content-sized `GroupBox`) |
| `DefaultControls/ListBox.xaml`, `ListView.xaml`, `TreeView.xaml`, `Expander.xaml` | 3-column pointed hexagonal `SAVE #1` selection plaques; 252px/280px Settings/Add-ons rails with reserved scroll lane; transparent window-art `Expander` |
| `DerivedStyles/PlayButton.xaml`, `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Swallowtail pine Play ribbon with gold scroll curls; pointed plum list rows; `42x42` rising cover buttons (`10px` `BackEase`, `60ms` stagger) |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | Crowned Dark Plum Metadata Quest Card (`SAVING SNIFF`), curl-flanked tapered Description & Notes headings (`Patrick Hand` notes), responsive placement & `SidePanelCloseButton` |

## Previews

`art/preview-details.html` and `art/preview-settings.html` render offline previews using bundled `Pathway Gothic One`, `Barlow Semi Condensed`, and `Patrick Hand` WOFF/TTF faces. Signature motifs drawn: Swallowtail Pine Green Play ribbon, Dark Plum Metadata Quest Card crowned with Quest Crimson `!` shield, beveled hexagonal pointed selection plaques, botanical scroll curls + tapered ink rules, tapered needle scrollbar, and Audio circular ink-blot sliders.

## Deviations

- Game Notes on both overviews use Playnite 10.60 Default's read-only `TextBox x:Name="PART_TextNotes"` styled with `BareTextBox` and `NoteFontFamily` (`Patrick Hand`) so handwritten notes echo Snufkin's dialogue/tooltip voice while switching cleanly to `WindowArtForegroundBrush` over window backgrounds.

## Not verified yet

- Initial XAML load, `validate-extension.ps1`, WPF regression tests, `dotnet test`, and live Playnite launch checks run next.
