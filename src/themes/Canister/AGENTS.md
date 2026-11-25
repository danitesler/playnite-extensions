# Canister — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) — an unofficial, community-made dark theme inspired by *Teenage Mutant Ninja Turtles: Mutants Unleashed* (2024). It is not affiliated with or endorsed by Nickelodeon, Paramount Global, Outright Games, or any related rights holders, and ships no owner logos or game assets (`info/NOTICE-Canister.txt`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, measured colors, inspected Game UI Database (`id=2358`) screens, and open font licenses live in [`RESEARCH.md`](RESEARCH.md). Creative direction (candidate lenses, Source DNA, 11-row game element map, 6 shell/game-page levers, 7 popup menu levers, running motion, and branding) lives in [`BRIEF.md`](BRIEF.md).

## Tokens

| Token (`src/tokens.css`) | Key | Used for |
| --- | --- | --- |
| `--cn-void` (`#0D0F12`) | `ContentBackgroundBrush` | Library list & cover grid ground |
| `--cn-asphalt` (`#13161A`) | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush` | 44px rail, 50px top bar, 44px dialog title band |
| `--cn-ink-panel` (`#191D22`) | `WindowBackgourndBrush`, `GameOverviewBackgroundBrush`, `PopupBackgroundBrush` | Game page ground, Settings window, popup menus |
| `--cn-ink-raised` (`#22272E`) | `NormalBrush`, `ButtonBackgroundBrush`, `SecondaryButtonBackgroundBrush`, `ListItemHoverBrush` | Buttons, More/Edit plates, hover wash |
| `--cn-ink-sunk` (`#101317`) | `InputBackgroundBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush`, `TooltipBackgroundBrush` | Inputs, search well, vial tracks, shortcut badges |
| `--cn-banner-tint` (`#112316`) | `GameBannerTintBrush` | Deep sewer-green solid banner darkening tint (no alpha) |
| `--cn-ooze` (`#44E61D`) | `GlyphBrush`, `FocusBrush`, `GridViewItemSelectedBorderBrush`, `PositiveRatingBrush` | Mutagen primary accent, right/bottom chromatic fringe, checkmarks |
| `--cn-marker-yellow` (`#F7DC28`) | `PrimaryButtonBackgroundBrush`, `SelectedForegroundBrush`, `HeadingForegroundBrush`, `TabItemIndicatorBrush` | Play CTA, selected text, golden masking-tape accents |
| `--cn-tape-orange` (`#ED4F24`) | `HeaderBandBrush`, `DataChangeNotifBrush`, `WarningBrush` | Vermilion masking-tape headers, filter active comic star |
| `--cn-crimson` (`#EE2836`) | `DangerBrush`, `MenuSeparatorBrush`, `NegativeRatingBrush` | Left/top chromatic fringe, red string breaks, Exit/close hover |
| `--cn-turtle-blue` (`#165DC4`) | `RunningIndicatorBrush` | Launching/running indicator (5.85:1 bare with `#F4F1E8`, 7.4–10.8:1 under scrim) |
| `--cn-turtle-blue-bright` (`#4CA3FF`) | `LaunchingIndicatorBrush` | Launching angled comic-slash sweep & 3 speed stars |
| `--cn-paper` (`#F1EDE2`) | `ParchmentBrush` | Pinned torn spiral-notebook flyer metadata dossier |
| `--cn-paper-rule` (`#C7D4DC`) | `ParchmentEdgeBrush` | Ruled horizontal notebook lines |
| `--cn-paper-ink` (`#17191D`) | `ParchmentTextBrush`, `ParchmentTitleBrush`, `PropertyItemForegroundBrush` | Dark marker ink on notebook flyer |
| `--cn-paper-muted` (`#4C525A`) | `ParchmentLabelBrush` | `Patrick Hand` metadata captions on paper |
| `--cn-paper-link` (`#124C99`) | `ParchmentLinkBrush` | Ballpoint cobalt links on paper |

Radii: `CornerRadiusSmall` `2`, `ControlCornerRadius` `3`, `CornerRadiusLarge` `4`, `CornerRadiusXLarge` `6`, `CornerRadiusFull` `999` (1:1 circular elements only).
Fonts (bundled static SIL OFL TTFs in `src/Typography/`): `FontFamily` = `./Typography/#Barlow`, `HeadingFontFamily` = `./Typography/#Anton`, `NoteFontFamily` = `./Typography/#Patrick Hand`, `MonospaceFontFamily` = `Consolas` (preview alias `Cascadia Mono`).

## Component spacing (`src/Common.xaml`)

| Key | Value | Basis |
| --- | --- | --- |
| `ControlHeight` | `32` | Repo form-height mandate (`28` in `FilterPanelView.xaml`) |
| `ButtonPadding` | `14,4,14,4` | Vertical `4` with `1.5px` comic ink borders |
| `InputPadding` | `8,4,8,4` | Vertical `4` with `1.5px` ink borders; applied once |
| `IconSize` | `16` | Bespoke hand-inked 24×24 `StreamGeometry` icons |
| `GameBannerHeight` | `320` | Default hero band height (`GameBannerDarken` = `0`) |
| `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | `300` | Usable inner width inside the torn spiral-notebook flyer |

## Shell

| File | What it draws |
| --- | --- |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px alley-asphalt rail with chalk grain and Mutagen top edge streak; 44×50 Canister emblem main-menu tile with Vermilion tape foot; white-outlined Mutagen-wash selected rail plates (`3px` bar + Golden Marker glyph); 4 subtle identity beads at rail foot |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml` | 50px asphalt bar closed by a 2px ink seam with 260px Mutagen lead slash; 244px sunken search well with persistent magnifier; 34×34 filter toggle with 9×9 Vermilion 4-point comic star pip; sorting-first `PART_PanelMainItems` with icon-only view switches (active = white-rimmed plate + Mutagen offset); 12px tapered HP swoosh `PART_ProgressGlobal`; Crimson notification badge |
| `Views/Library.xaml` | Full-strength `PART_ImageBackground` spanning TopPanel and reaching under the rail (`-44`/`-56`), fading cleanly into `WindowArtSwatch` |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml`, `DefaultControls/TreeView.xaml` | 44px Settings/dialog title band with Vermilion masking-tape plaque + Cracked Canister mark + `Anton` title (`WindowSettings` sets `LOCSettingsLabel`) + ghosted aerosol mist; bare 28px `Barlow` tree rows with Mutagen wash + `2.5px` bar + reserved scrollbar lane |

## Game page

Generated by `node src/themes/Canister/art/gen-overviews.mjs` (calls `scripts/overview-generator.mjs` + `scripts/game-page-breakpoints.mjs` for `GameDetailsPanePosition` Left / Center / Stretch / Right and 900+ / 560–899 / <560 breakpoints):
- Hero banner (`GameBannerHeight=320`, spacer `x * 204 / 320` floor `18` in details, `x * 196 / 320` floor `14` in grid) with `GameBannerTintBrush` (`#112316`) + 50% floor, subtle aerosol mist, and dual Crimson/Mutagen chromatic bottom seam.
- Chromatic-offset `Anton` game title beside a dual-chromatic framed game icon, Golden Marker Masking-Tape `PlayButton`, Leo Cobalt `RunningActionIndicator`, and equal 40×40 icon-only `SecondaryButton` More & Edit plates.
- Custom 28×28 hand-inked comic sticker square `SidePanelCloseButton` turning Tag Crimson on hover (corner at ≥120px or null game; sticky inline below 120px or when `ShowBackgroundImageOnWindow=True`).
- Pinned Torn Spiral-Notebook Flyer Metadata Dossier (`ParchmentBrush`, `notebook-lines.png`, `spiral-holes.png`, `torn-bottom.png`, dual chromatic backplates, Golden Marker tape crown, Cobalt pushpin + red string, dashed crimson-string + star dividers).

## Components

| Playnite file | Canister component |
| --- | --- |
| `DerivedStyles/PlayButton.xaml` | Golden Marker Masking-Tape CTA with flaring dual Crimson/Mutagen fringes, `ooze-glint.png` sweep, circular Mutagen play disc; Leo Cobalt `RunningActionIndicator` (`PlayRoom` `0,0,34,0`, angled comic-slash `RunningScan`, 3-segment ooze-vial `RunningFill`, 3 staggered comic speed stars, `Cancel` strictly on `IsRunning` + Self hover) |
| `DerivedStyles/DetailsViewItemStyle.xaml` | Calm `#0D0F12` rows, charcoal hover wash + sliding Mutagen `▸`, comic callout selected plate + springing dual Mutagen/Crimson rail + Golden Marker title, transparent `RowHoverAction` + `RowHoverRoom`, Leo Cobalt `RunningIndicator` |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Rounded `4px` cover clip, chromatic corner-bracket hover lock, double white+Mutagen select frame + Vermilion tape tab, `50×50` sketchy circular comic `GridTileButton` badges |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | Shared `LocalCanisterMenuBoardTemplate` (chromatic fringes, Vermilion tape crown + crimson pushpin, 30px comic callout rows, gamepad-prompt shortcut badges, dashed crimson-string breaks, Tag Crimson Exit slab, circular Mutagen check disc); split comic-tag `ComboBox` with 3px Mutagen left bar + raised 28px chevron cap |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `CustomControls/SearchBox.xaml` | Sunken notebook-paper input wells (`LocalNotebookLinesMask` + 3px Mutagen/Vermilion left bar + dashed ink baseline + dual Tag Crimson & Acid Mutagen chromatic focus fringes) |
| `DefaultControls/Button.xaml`, `ToggleButton.xaml` | Sketch-hatched comic plates with 3px Vermilion left accent bar, 2px hard ink drop-offset, and `Width=41` ThemeModifier compact `LayoutTransform` |
| `DefaultControls/ProgressBar.xaml` | Tapered Crimson→Vermilion→Marker Yellow→Acid Mutagen combat HP swoosh bar |
| `DefaultControls/Slider.xaml` | Mutagen Ooze Vial glass tube flanked by `<` `>` inline option chevrons + circular Golden Marker cap thumb; disables banner sliders when `ShowBackgroundImageOnWindow=True` |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | 18×18 hand-inked comic square (Mutagen fill + Crimson offset + ink tick) & 20×20 Skill-Node double-ring radio (Crimson offset + Mutagen ring + 4-point Golden Marker comic star) |
| `DerivedStyles/PropertyItemButton.xaml`, `TextBlockGameScore.xaml` | Cobalt ballpoint paper links, inked kraft-paper sticker chips popping into Golden Marker + Crimson shadow, and `Anton` graffiti rank stamp score plaques |

## Previews

`art/preview-details.html` and `art/preview-settings.html` render via `scripts/take-screenshots.ps1 -Extension canister` using `src/tokens.css` tokens and bundled fonts (`Barlow`, `Anton`, `Patrick Hand`, `Consolas`→`Cascadia Mono`, zero system font warnings).
Signature motifs drawn: dual Tag Crimson & Acid Mutagen chromatic fringes, Golden Marker Play CTA in hovered end state, Vermilion & Golden masking-tape strips (`tape-strip.png`), hand-drawn ink crosshatch (`sketch-hatch.png`), side-panel sketchbook doodles & ragged vertical seams (`sidepanel-sketch.png`, `sketch-edge-v.png`), comic halftone/speed-line corner scribbles (`halftone-doodle.png`), pinned torn spiral-notebook flyer metadata dossier (`notebook-lines.png`, `spiral-holes.png`, `torn-bottom.png`, pushpin + red string), tapered combat HP swoosh progress bar, Mutagen vial slider with `<` `>` chevrons, and Leo Cobalt running row with 3 comic stars.

## Deviations

- Pure XAML offset borders and offset `TextBlock` copies recreate chromatic edge aberration and comic shadows with zero `DropShadowEffect`.
- Static TTFs (`Anton`, `Barlow`, `Patrick Hand`) are bundled directly from `scripts/fonts/` (`fontTools` was not installed in the macOS authoring environment for subsetting; all 6 TTFs are compact OFL-1.1 static files).

## Not verified yet

- Live Windows Playnite desktop load check (`%APPDATA%\Playnite\playnite.log`), WPF regression harnesses (`tests/wpf/*RegressionTests.ps1`, `RunningMotionFrames.ps1`, `MenuRender.ps1`), and ThemeModifier live palette/layout verification (authored on macOS; run on Windows before releasing).
