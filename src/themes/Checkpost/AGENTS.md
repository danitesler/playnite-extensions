# Checkpost

Dark Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by the interface of Papers, Please. Unofficial, no game assets, no logo, no game font (see `info/NOTICE-Checkpost.txt`). Dark only. Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record the palette, the observed interface parts and the user-supplied reference captures; the [Showcase brief](BRIEF.md) maps the source UI to Playnite.

## Sources

`RESEARCH.md` (15 official Steam screenshots viewed in the browser pane and sampled with a canvas, nothing downloaded; five more user-supplied captures read by eye) and `BRIEF.md` (lens: the game's report and title screens, the stamp bar spent on Play, paper only where a document would be).

## Tokens

All values are in `src/tokens.css`; `Constants.template.xaml` maps them.

| Token | Plays |
|-------|-------|
| `--text` / `--dim` / `--ink` | `TextColor` / `TextColorDarker`, `SidebarItemForegroundBrush` / `TextColorDark`, `SelectedForegroundBrush` (ink on lime and amber plates) |
| `--void` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush` (the black report screens) |
| `--desk` / `--desk-lit` / `--desk-edge` | `ShellBackgroundBrush`, `TopPanelBackgroundBrush` (booth metal) / `TopPanelItemHoverBackgroundBrush`, the rail seam / `PanelSeparatorColor` |
| `--olive` / `--olive-deep` / `--olive-lit` | `MainColor`, `ButtonBackgroundBrush`, the DAY tab / `MainColorDark`, `PopupBackgroundColor`, `InputBackgroundBrush`, `ExpanderBackgroundBrush`, `GameBannerTintBrush`, `ListItemHoverBrush` / `HoverColor`, `ButtonHoverBackgroundBrush` |
| `--moss` / `--moss-deep` | `PopupBorderColor`, `CheckBoxBorderBrush`, `ThumbBrush`, the plate lower edges / `NormalBorderBrush`, `InputBorderBrush`, `ScrollBarThumbBrush`, hairlines |
| `--lime` / `--lime-lit` | `GlyphColor`, `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `FocusBrush`, `LinkBrush`, `ToggleButtonCheckedBackgroundBrush` / `SelectedHoverBrush` |
| `--stamp` / `--stamp-lit` / `--stamp-ledge` | `PrimaryButtonBackgroundBrush` (the Play face, cream label 5.2:1) / `PrimaryButtonHoverBackgroundBrush` (4.6:1) / its 3px ledge |
| `--red` / `--seal` / `--red-lit` | `DangerBrush`, `TabItemIndicatorBrush` (cream label 7:1) / `DataChangeNotifColor` (the filter seal pip, the permit seal) / `NegativeRatingBrush`, Exit text on olive |
| `--amber` | `RunningIndicatorBrush`, `MixedRatingBrush`, `WarningBrush`: the running game, nothing else |
| `--ok` | `PositiveRatingBrush` (score numbers on the dark seals) |
| `--paper-pink` / `--paper-edge` / `--paper-ink` / `--paper-soft` | the permit sheet: pink paper, taupe inner border and field underlines, brown ink (7.7:1), captions (4.8:1) |
| `--paper-blue` | `TooltipBackgroundBrush` (the identity-record slip, ink text) |
| `--cream` / `--peach` | `DangerForegroundBrush`, `PrimaryButtonForegroundBrush` / spare |

Radii: `ControlCornerRadius` 2 (pixel corners everywhere), `CornerRadiusSmall` 1, `CornerRadiusLarge` 3, `CornerRadiusXLarge` 4. Type: Zilla Slab Regular / Bold (body), Pixelify Sans Regular (titles, Play, headings, tabs, the Settings band; 17px and up only, feature-stripped copy), Consolas for numerals; both bundled faces live in `src/Typography`. Sizes 13 / 14 / 16 / 24 / 34.

## ThemeModifier

Edit constants keep the shared catalog (backgrounds, buttons, selection, inputs). Stamp, paper, seal and ledge colours stay in the theme as `Local*` brushes.

## Component spacing (`src/Common.xaml`)

Buttons 16,5 (a ghost word on a dotted line; 32px = `ControlHeight`); inputs 10,5 (32px); menu panel 4px inset, rows 30px with a 26px icon column; group box 14,12,14,12; tooltip 10,5,10,6; `IconSize` 16; `GameBannerHeight` 224; metadata width 300 inside the sheet's 30px side padding.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px booth-metal rail with a 2px lifted seam and three bolts at its foot; the main menu is the stamp mark on an olive ledged plate (a lime plate steps in on hover); the current item a lime key-cap plate with a red seal pip on the rail edge |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `SearchBox.xaml` | 50px booth-metal strip closed by a 2px olive-deep rule with a bolt; void search well with a persistent magnifier; the filter mark a 9px red seal octagon; the toggled view switch a lime key-cap plate; notification count a red tag |
| `DerivedStyles/MainWindowStyle.xaml` | bare 46x36 caption cells, close a red plate with a cream X on hover; the sidebar-hidden main menu button as in the rail |
| `Views/LibraryDetailsView.xaml` | game list on the void, an 8px gutter carrying a one-pixel dotted rule before the game page |
| `Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml`, `MainWindow.xaml` | structure from the skeleton; window art fills the layer under the top bar |

## Game page

`art/gen-overviews.mjs` writes both overviews (then `scripts/game-page-breakpoints.mjs`). The banner sits under a 10px black bar and dissolves into the void in six hard bands (an `OpacityMask` with stepped stops). The title is the game's name in Pixelify Sans with the title screen's olive extrusion (a second TextBlock offset 3px), the icon in a cream frame with lime corner ticks. Play is the rubber stamp; More and Edit are equal 44x44 olive squares on a hard ledge. The metadata is the permit: a pink sheet with a scalloped edge (a rectangle with a round-capped dashed stroke) over a lime sheet, a taupe inner border broken at the top by the stamp mark, a red seal on the corner; each field is a caption and a value standing on a 1px underline, chips are outlined boxes, scores round dark seals with the number in the rating colour, groups break on a dotted taupe rule. Section headings are lime Pixelify Sans over a dotted rule. Empty page: the Official Bulletin (`LocalBulletinTemplate`: cream sheet, hatched blocks, a red seal, a blinking caret) over `LOCErrorNoGameSelected`. Grid side panel close: the 28x28 olive plate with a cream X (red on hover). Pane position: `GameDetailsPanePosition` Right / Left / Center / Stretch.

## Components

| Playnite file | Component |
|---------------|-----------|
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | the unified olive board menu: moss rim and a hard 3px shadow, lime paper-slip highlight with punched dots, dotted group breaks, key-cap shortcuts, red pixel submenu marks, Exit in red (row in `docs/themes/menus.md`) |
| `DerivedStyles/PlayButton.xaml` | the rubber stamp: green face on a 3px ledge, black knob, Pixelify label; lifts on hover, slams and flashes an ink imprint on press; amber with typewriter dots while launching / running, a red DENIED face for Cancel |
| `DerivedStyles/DetailsViewItemStyle.xaml` | rows: olive wash and a nudge on hover; selected = a lime paper slip with punched dots; running = amber frame, wash and three stepping dots |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | covers: cream corner ticks appear one corner at a time on hover, a lime frame and a dotted callout when selected; Play / Info are 50px olive and stamp-green plates |
| `DefaultControls/Button.xaml`, `ToggleButton.xaml`, `TabControl.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `TextBox.xaml`, `PasswordBox.xaml`, `ScrollViewer.xaml`, `GroupBox.xaml`, `ToolTip.xaml`, `TreeView.xaml`, `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | ghost-word buttons on a dotted line, bookmark tabs, lime check boxes, OK-disc radios, a lime-thumb slider, olive-deep inputs, DAY-tab group headers, the Settings tree (olive plate with a lime bar) and the title band (stamp mark, hairlines, DAY tab) |
| `DerivedStyles/PropertyItemButton.xaml` | metadata values: ink links with a dotted underline, outlined chip boxes (all on the permit sheet) |

## Previews

Signature motifs drawn: the booth rail with the lime key-cap and red seal pip, the lime paper-slip row, DAY-tab group headers, the stepped-dissolve banner, the Pixelify title with its olive extrusion, the hovered Play stamp, the pale-blue tooltip, the permit sheet (scalloped pink over lime, seal, underlined fields, outlined chips, dark seal scores), the open main menu (slip highlight, key-caps, red Exit) and the Settings band with its DAY tab. The preview game list, banner, screenshots and description are invented placeholders. Stand-ins: none for the bundled faces; Consolas is drawn with Cascadia Mono.

## Deviations

- Pixelify Sans reads cleanly only from 17px up, so Zilla Slab carries every smaller size (captions, field values, menus).
- WPF has no letter-spacing and no CSS text-transform: the Play label and group tabs go through `StringToUpperCaseConverter`, titles keep the game's own case.
- The scalloped edge is a dashed round-capped stroke, so it is anti-aliased circles rather than the game's hard pixels; the pitch (15px) leaves one irregular bump where the dash pattern restarts at a corner.
- The permit's gap labels ("ARSTOTZKA", the ministry line) are not reproduced: a theme cannot ship localized text, so the border gap holds the stamp mark instead.
- The game's stamp knob sits above the body; here it is drawn on the left of the Play plate so nothing sticks out of the overview cell.
- Scores are rows (caption + seal on the underline), not three side-by-side badges, so the metadata groups keep the shared per-field containers.
- The hero's black bar is on top only: the bottom edge belongs to the dissolve.

## Not verified yet

- Startup verified in Playnite 10.65 (2026-11-23): Checkpost deployed, activated, and started with zero unhandled exceptions or XAML errors in `playnite.log`.
- Verified via native WPF harnesses: `MenuRender.ps1`, `RunningMotionFrames.ps1` (7.19:1 launching / 6.32:1 running contrast), `RunningIndicatorRegressionTests.ps1`, `RunningLabelOverlapRegressionTests.ps1`, `DetailsViewLayoutRegressionTests.ps1`, `GridOverviewLayoutRegressionTests.ps1`, `GamePageBreakpointsRegressionTests.ps1`, `GridDetailsPanelWidthRegressionTests.ps1`, `TopPanelLayoutRegressionTests.ps1`, `SearchGlyphRegressionTests.ps1`, `SearchClearRegressionTests.ps1`, `SidePanelCloseButtonRegressionTests.ps1`, and `SteamScreenshotsRegressionTests.ps1`.
- Not seen via interactive mouse walkthrough in the live window: Settings window and title band, live hover/press states, empty page, Left/Center/Stretch metadata switching, window background art mode, and live game launch running indicator.
