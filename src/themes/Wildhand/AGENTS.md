# Wildhand

Dark Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by the interface of Balatro. Unofficial, no game assets, no logo, no game font (see `info/NOTICE-Wildhand.txt`). Dark only. Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record the palette, the observed interface parts and motion; the [Showcase brief](BRIEF.md) maps the source UI to Playnite.

## Sources

`RESEARCH.md` (45 Game UI Database captures viewed in the browser pane, colors sampled with a canvas, nothing downloaded; the `G.C` palette values recalled from the game and cross-checked against the samples) and `BRIEF.md` (lens: the in-run HUD column, with the settings panel, tabs and SHOP sign folded in for menus, controls and the title band).

## Tokens

All values are in `src/tokens.css`; `Constants.template.xaml` maps them.

| Token | Plays |
|-------|-------|
| `--white` / `--joker-grey` / `--ink` | `TextColor` / `TextColorDarker`, idle glyphs / `TextColorDark`, `SelectedForegroundBrush` (ink on orange, green and gold plates) |
| `--black` | panels: `MainColor`, `PopupBackgroundColor`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `ListItemHoverBrush` (the slate of the HUD column) |
| `--black-deep` / `--inset` | `MainColorDark`, `BackgroundToneColor`, `ExpanderBackgroundBrush`, `HeaderBandBrush` / recessed wells: `InputBackgroundBrush`, `TooltipBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush`, `ProgressBarTrackBrush`, `SliderTrackBrush` |
| `--l-black` / `--grey` | `HoverColor`, `ButtonBackgroundBrush`, `WindowPanelSeparatorColor`, `MenuSeparatorBrush`, `TopPanelItemHoverBackgroundBrush` / `NormalBorderBrush`, `InputBorderBrush`, `ScrollBarThumbBrush`, `ButtonHoverBackgroundBrush` |
| `--ui-outline` | `PopupBorderColor`, `CheckBoxBorderBrush`, `InputHoverBorderBrush`: the pale outline of modal panels and check boxes |
| `--felt` / `--felt-lit` / `--felt-deep` | page and content (`WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`) / spare lift / `GameBannerTintBrush`, `GridItemBackgroundColor`, `ScrimBrush`, the gutter between list and page |
| `--orange` / `--orange-lit` / `--orange-ledge` | `GlyphColor`, `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush` / `SelectedHoverBrush` / the ledge under every orange plate |
| `--play` / `--play-lit` / `--play-ledge` | `PrimaryButtonBackgroundBrush`, the blind-bar title, Play / `PrimaryButtonHoverBackgroundBrush` / ledge (deepened chips blue, white label 5.2:1) |
| `--chips` | `ProgressBarForegroundBrush` (the raw blue, numbers and fills on dark) |
| `--danger` / `--danger-ledge` / `--mult` | `DangerBrush`, red tabs, value boxes, close and More plates (white label 4.65:1) / ledge / `DataChangeNotifColor` (filter pointer, count tag), `NegativeRatingBrush`, the slider fill |
| `--green` / `--green-ledge` | `RunningIndicatorBrush`, `PositiveRatingBrush`: the running game, nothing else |
| `--money` / `--gold` | `LinkBrush`, `ValueAccentBrush`, `MixedRatingBrush`, `WarningBrush`: scores, playtime, links, section headings / the title-band lettering |
| `--ledge-slate` / `--ledge-grey` | the hard ledge under slate plates, rims, `FrameBrush`, `TextOutlineBrush` (label shadows), `PanelSeparatorColor` |
| `--scan` / `--scrim` / `--glass` | the CRT scan lines (banner, rail foot) / banner wash / spare |

Radii: `ControlCornerRadius` 6 (buttons, wells, rows, pills), `CornerRadiusSmall` 3 (tags, bumper pills), `CornerRadiusLarge` 10 (panels, menus), `CornerRadiusXLarge` 14 (spare). Type: Nunito Regular / Bold (every size under 17px) and Pixelify Sans Regular (titles, Play, tabs, price numerals and the band at 17px and up), both bundled in `src/Typography`; the Pixelify copy has `liga` / `dlig` removed. Sizes 13 / 15 / 17 / 22 / 30.

## ThemeModifier

Edit constants keep the shared catalog (backgrounds, buttons, selection, inputs). Ledges, the felt steps, the suit marks and the CRT scan stay in the theme as `Local*` brushes.

## Component spacing (`src/Common.xaml`)

Buttons 16,5 (face 28px over a 4px ledge = `ControlHeight` 32); inputs 10,5 (32px); menu panel 5px inset, rows 30px with a 26px icon column; group box 14,12,14,12; tooltip 10,6,10,7; `IconSize` 16; `GameBannerHeight` 224.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px slate rail with a 3px dark rim; a CRT scan band and the four suits fade up from its foot; the main menu is the card-and-jester-cap mark (orange ledged plate under it on hover); the current item an orange ledged plate popping in from 80%, the red tab pointer on the rail edge |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 50px slate strip closed by a 3px rim; recessed search well; the filter mark a 9px red tab pointer; the toggled view switch an orange ledged plate; notification count a red tag |
| `DerivedStyles/MainWindowStyle.xaml` | bare 46x36 caption cells (lifted slate on hover), close a ledged red square; the sidebar-hidden main menu button as in the rail |
| `Views/LibraryDetailsView.xaml` | game list on the felt, a 6px deep-felt gutter before the game page |
| `Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml`, `MainWindow.xaml` | structure from the skeleton; window art fills the content row below the top bar |

## Game page

`art/gen-overviews.mjs` writes both overviews (then `scripts/game-page-breakpoints.mjs`). The banner is the game's art fading into the felt with a CRT scan band (2px lines every 4px, `LocalScanBrush`) over its lower part. The title is a blind bar: the game name in white Pixelify Sans on a Play-blue ledged bar with a hard shadow, the icon in a 3px outlined frame beside it. Play is the ledged Play Hand plate; More (red) and Edit (orange) are equal 44x44 ledged squares. The metadata is one slate panel (`LocalPanelTemplate`) with a dotted-leader break between groups; text and button values sit in recessed wells beside their captions (the Hands / Discards cells), playtime in gold; scores are price tags (a dark notched tab, poker-chip glyph, Pixelify numerals in the rating colour). Section headings are gold Pixelify Sans over a dotted leader. Empty page: an empty joker slot (`LocalEmptySlotTemplate`: dashed card, the mark rocking, `0 / 5`) over `LOCErrorNoGameSelected`. Grid side panel close: the 28x28 option-arrow square (red on hover with a rock). Pane position: `GameDetailsPanePosition` Right / Left / Center / Stretch.

## Components

| Playnite file | Component |
|---------------|-----------|
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | the unified slate menu: pale-outlined panel on a 4px ledge, orange ledged highlight pill, dotted-leader breaks, bumper-pill shortcuts, red square submenu marks, Exit in danger red (row in `docs/themes/menus.md`); the closed ComboBox is the red Options value box |
| `DerivedStyles/PlayButton.xaml` | the ledged Play Hand plate (see BRIEF.md) |
| `DerivedStyles/DetailsViewItemStyle.xaml` | rows: slate hover plate; selected = orange ledged plate with the red pointer; running = green frame, wash and three stepping dots |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | covers: cards that lift and tilt, white rim over an orange ledge when selected; Play / Info are 50px ledged plates (blue, orange) |
| `DefaultControls/Button.xaml`, `ToggleButton.xaml`, `TabControl.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `TextBox.xaml`, `PasswordBox.xaml`, `ScrollViewer.xaml`, `GroupBox.xaml`, `ToolTip.xaml`, `TreeView.xaml`, `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | ledged buttons, red tab row with the pointer, white-rimmed check boxes, red slider fill, recessed inputs, the Settings tree (red ledged selected tab) and the marquee SHOP-sign title band |
| `DerivedStyles/PropertyItemButton.xaml` | chips are l-black tags on a 2px ledge that turn orange with ink on hover |

## Previews

Signature motifs drawn: the HUD rail with the red pointer, the felt-faded banner with its scan band, the blind-bar title, the hovered Play plate (rocked, scaled, rimmed), red More and orange Edit squares, the slate metadata panel with wells, price-tag scores and dotted leaders, the open main menu (orange highlight pill, bumper shortcuts, red submenu mark, checked row, Exit in red), the SHOP marquee title band, the red tab row and Options-style controls. The preview game list, banner and screenshots are invented placeholders (gradients), not game art. Stand-ins: none; Nunito and Pixelify Sans are the real bundled faces.

## Deviations

- The game's text face (m6x11) is not bundled; Pixelify Sans reads cleanly only from 17px up, so Nunito carries smaller text (a size test is recorded in `RESEARCH.md`).
- White labels on the raw chips blue, mult red and orange miss 4.5:1, so Play and red plates use deepened faces and orange / green / gold plates carry ink (the game sets white text with a pixel shadow on all of them). The Exit label on the slate menu board uses a lifted red (`--mult-lit`, 4.54:1) because `--mult` reads 3.45:1 there.
- WPF has no box-shadow, so every ledge is a second Border; label shadows are a second TextBlock offset by 2px, used only on 17px+ labels.
- The view-switch pair is not drawn inside the game's white frame: Playnite owns the children of `PART_PanelMainItems`, so only the toggled plate is themed.
- Metadata keeps the repo's caption-beside-value layout (the game's cells put the label above the value).
- The felt is flat: the game's paint-swirl shader is not recreated behind lists (calm backgrounds rule); only the scan lines remain, on the banner and rail foot.
- The search chip glyph turns orange (`GlyphBrush`) when focused or filled, not white: `SearchGlyphRegressionTests` pins that brush.
- The Settings title band has square window corners and no window ledge (WPF window chrome cannot round or shadow); the selected tree row is a 25px face on a 3px ledge inside the 28px row so selecting never shifts the list.
- The highlighted menu label is not bold (a bold label could widen the popup and make it jump). The closed ComboBox chevron cell is 32x28 (the ledge counts inside the 32px total). Filter selectors use the `IconDropDown` chevron, not the Expander indicator.
- The row selection pointer is a 14x14 control (the 24px glyph canvas draws about 8x11px of triangle). `HighlightBorder` is a 2px rim, not 1px.
- The Play rim and the running ring sit up to 4px outside the button: a clipping parent in the overview cell would cut them.
- The preview's orange Back button and the slider value pill are preview-only: neither is a base template.

## Not verified yet

- Seen live in Playnite (2026-11-22, 10.65): details view (list with group header and selected row, game page with felt-faded banner and scan band, blind-bar title, Play, More / Edit, metadata wells, price-tag scores, dotted leaders, description heading), list view (orange selected row, slate hover row, column headers), grid view with the side panel (close square, selected cover lifted with a white rim), rail, top bar, filter pointer. Menus only through `tests/wpf/MenuRender.ps1`.
- Not seen live: the Settings window and its title band, menus in the real app, real pointer hover and press (the storyboards run in WPF tests but were not exercised by a mouse), the empty page, Left / Center / Stretch metadata, window art mode, the running indicator on a launched game, ToolTip, the marquee at 125% / 150% scaling, Pixelify Sans button widths (`MinWidth` 150 / 190 assume about 13px per character at 24px).
- `RunningIndicatorRegressionTests` and `RunningLabelOverlapRegressionTests` pass for the details row, list row and Play cell in this harness.
- The 2026-11-22 21:55 `Property can not be null on Trigger` crash in `playnite.log` predates the first Wildhand deploy and is not attributed to it; Wildhand has loaded without a new unhandled exception since.
