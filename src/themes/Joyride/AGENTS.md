# Joyride

Dark Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by the 3D and HD era of Grand Theft Auto (III, Vice City, San Andreas, IV, V). Unofficial, no game assets, no logos, no Pricedown (see `info/NOTICE-Joyride.txt`). Dark only. Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record the HUD colors and fonts per game; the [Showcase brief](BRIEF.md) maps the source UI to Playnite.

## Sources

`RESEARCH.md` (GTA V `hudcolor.dat` values from the FiveM docs, Vice City / San Andreas / IV HUD colors and the per-game font table from gta.wiki, read in the browser pane; nothing downloaded) and `BRIEF.md` (lens: the box-art collage, with the V pause menu for menus and selection and the HUD for small marks).

## Tokens

All values are in `src/tokens.css`; `Constants.template.xaml` maps them.

| Token | Plays |
|-------|-------|
| `--white` / `--grey-light` / `--grey` | `TextColor` / `TextColorDarker` / captions, idle glyphs (`SidebarItemForegroundBrush`) |
| `--ink` | `TextColorDark`, `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush` (black ink on white and yellow plates) |
| `--gutter-black` | collage gutters, rims and hard offsets; `ShellBackgroundBrush` (rail), `HeaderBandBrush`, `PopupBackgroundColor`, `TooltipBackgroundBrush`, `PanelSeparatorColor` |
| `--asphalt` | page and content (`WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `TopPanelBackgroundBrush`) |
| `--panel` / `--panel-lit` / `--panel-up` / `--panel-hi` | inputs and panels / hover (`ListItemHoverBrush`, V's `MENU_HIGHLIGHT`) / buttons (`MainColor`, `ButtonBackgroundBrush`) / button hover |
| `--edge` / `--dim` | `NormalBorderBrush`, `InputBorderBrush`, `MenuSeparatorBrush` / `PopupBorderColor`, slider track |
| `--white` (as fill) | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush` (the pause menu's white row) |
| `--mission` | `GlyphColor`, `FocusBrush`, `PrimaryButtonBackgroundBrush`, `TabItemIndicatorBrush`, `GridViewItemSelectedBorderBrush`, `LinkBrush`, the selection tab |
| `--gold` | `DataChangeNotifColor` (filter star, count key cap), `CheckMarkBrush` (wanted star) |
| `--cash` / `--health` | `PositiveRatingBrush`, `ValueAccentBrush` / `ProgressBarForegroundBrush` (the V radar health bar) |
| `--wasted` / `--wasted-lit` | `DangerBrush` (white label 5.4:1) / `NegativeRatingBrush` (red text on black) |
| `--siren` | `RunningIndicatorBrush` (never used by selection or hover); `--wasted` is the second lamp color |
| `--asphalt-deep` | `GameBannerTintBrush`: the blue-black of the night-city collage panel, so banner darkening reads as dusk |
| `--michael` / `--franklin` / `--trevor` | the tri-color tick only (`LocalTriTickTemplate`) |
| `--vice-*`, `--liberty*`, `--sa-*`, `--freemode*` | collage paint (`LocalScene*Template`) |

Radii: `ControlCornerRadius` 3, `CornerRadiusSmall` 2 (plates, covers), `CornerRadiusLarge` 6 (the radar close square). Type: Barlow Regular / SemiBold (body) and Barlow Condensed Bold (captions, tabs, headings, key caps) bundled in `src/Typography`; Impact (Windows) for poster titles, Play, scores and the settings band title, outlined with eight offset black copies plus a hard shadow. Sizes 12 / 14 / 16 / 22 / 40.

## ThemeModifier

Edit constants keep the shared catalog (backgrounds, buttons, selection, inputs). Collage paint, the tri-color tick and the HUD accents stay in the theme as `Local*` brushes.

## Component spacing (`src/Common.xaml`)

Buttons 18,4 (2px rim, 3px hard offset); inputs 10,5 (32px); menu panel: 12px collage crown, rows from 14px, 6px foot, 5px offset; menu and dropdown rows 30px with a 26px icon column; group box 14,10,14,12; tooltip 10,6,10,7; `IconSize` 16; `GameBannerHeight` 300.

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | 52px asphalt strip closed by a 4px black gutter with the tri-color tick at its left; charcoal search well; toggled view switch is a white tag with black ink; filter mark a 10px gold star; notification count a mission key cap |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px black rail with three collage panels stacked at its foot (fading up); the main menu `LocalJoyrideMenuMarkTemplate` (Common.xaml, also the top bar's menu button): three tilted paper slips on hard ink offset shadows; hover slaps them down onto their shadows one after another, and while the menu is open a mission-yellow tag with a wanted star drops over the dimmed slips with an overshoot while a red and a blue light flash in alternation; the current item a white 32px plate with a black glyph on a hard offset, a mission foot, punching in from 80% |
| `Views/LibraryDetailsView.xaml` | game list on asphalt; a 6px black gutter between list and game page |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | 44px black band: the mark, the title in outlined Impact, a three-panel collage strip fading in at the right, the tri-color tick at its foot; close turns into the red radar square |
| `DefaultControls/TreeView.xaml` | Settings list: white plate on a hard offset with a mission tab, black ink; grey triangles |

## Game page

`art/gen-overviews.mjs` writes both overviews (then `scripts/game-page-breakpoints.mjs`). The banner is the game's art cut into a box-art collage: 6px black gutters split it into a wide left panel and two stacked right panels, a black scrim rises toward the foot with print halftone at the lower left, and it ends on an 8px black gutter. The title is white Impact in a black outline (eight offset copies bound to `PART_TextDisplayName.Text` plus a hard shadow) next to the icon in a black frame with a white rim, over a gutter rule with the tri-color tick. Play is the mission slab; More and Edit are instructional key caps. The metadata is one sticker panel with gutter group breaks; scores are money counters (outlined Impact in the rating colour) with a five-star wanted meter (a `ProgressBar` on `Game.<Score>` clipping gold stars). Section headings are black tabs with a mission edge. Empty page: a loading-screen collage (three scenes panning slowly) with the mark in a black title box and the caption in outlined Impact. Grid side panel close: the 28x28 radar square, WASTED red on hover. Pane position: `GameDetailsPanePosition` Right / Left / Center / Stretch.

## Components

| Playnite file | Component |
|---------------|-----------|
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | the V interaction menu: black board with a 12px collage crown on a 5px hard offset, white slab wiping in with a mission tab, gutter-rule breaks with the tri-color tick, white instructional key caps for shortcuts, gold wanted-star checks, Exit on the WASTED red slab (row in `docs/themes/menus.md`) |
| `DerivedStyles/PlayButton.xaml` | the mission slab: yellow, 2px black rim, 4px hard offset, play triangle in a black key cap, PLAY in Impact; hover lifts the slab while police car roof lamps blip behind it (a siren-blue lamp at the left end, a red one at the right end, double-flashing in turn, 1.2s) and the key cap cycles triangle, wanted star, pistol, police siren (3.6s loop); launching also sweeps a blue then red light bar behind the slab left to right and spins a tyre in the key cap fast (0.4s a turn), running slow (2.6s); press slams it onto its shadow with a white flash; running: siren blue slab, police light bar overlay (lamps strobing, blue blocks along the foot) |
| `DerivedStyles/DetailsViewItemStyle.xaml` | rows: charcoal plate slides in on hover; selected = white plate wiping in on a hard offset with a mission tab dropping in; running: siren frame, blue-red split bar, three strobing light-bar blocks |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | covers: lift 3px off a hard black offset with a grey rim on hover; selected = black-outlined mission frame punching in from 104% with a gold star tab; Play / Info are 52px white key caps that turn yellow on hover (Play, `Tag="Siren"`, also blips the roof lamps behind it); running: siren frame and light bars |
| `DefaultControls/Button.xaml`, `ToggleButton.xaml`, `TabControl.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `TextBox.xaml`, `PasswordBox.xaml`, `ScrollViewer.xaml`, `GroupBox.xaml`, `ToolTip.xaml` | sticker buttons (default = mission slab), white current tabs with a mission top bar, gold wanted-star checks, round station-dial radios, V segmented slider with a yellow block thumb, the radar health bar, charcoal wells, black gutter scroll lane, sticker panels with brief-tab titles, the V help box |
| `DerivedStyles/PropertyItemButton.xaml` | chips are stickers that turn mission yellow with black ink on hover |

## Previews

Signature motifs drawn: the collage-cut banner with its black gutters and foot, outlined Impact titles, the mission slab Play in its hovered state (the wanted star in the key cap), the pause-menu white selection with a mission tab, the tri-color tick, money-counter scores with wanted-star meters, sticker chips, the black gutter collage strip in the settings band and menu crown, the gold star check and the filter star. Stand-ins: Impact is drawn with Anton in the previews. The preview's banner and screenshots use the theme's own collage scenes in place of a game's art.

## Deviations

- Pricedown (the series' title face) is not bundled or named; Impact stands in, as the user asked. Chalet (GTA V's menu face) is commercial; Barlow and Barlow Condensed stand in.
- WPF has no text stroke, so outlined titles are nine stacked TextBlocks (eight black offsets and a shadow). Only titles, the settings band title, scores and the empty caption use it.
- The banner collage shows one picture through three panels (one `PART_ImageBackground`); the box art's panels are separate paintings, which a single game background cannot supply.
- No script face is used for location names (VC's Rage Italic, V's SignPainter): none ships with Windows and none was bundled.
- Playnite's user font setting overrides the body face; with it set, rows and descriptions show that font instead of Barlow.

## Not verified yet

- Seen live in Playnite (2026-11-21): details view with a game page (collage banner, outlined title, Play, key caps, caps captions, money-counter scores with working star meters), grid view side panel (radar close, selected cover frame), the rail with its collage foot, the top bar and the filter star. Menus only through `tests/wpf/MenuRender.ps1`.
- Not seen live: the Settings window and dialogs (title band, tree), hover and press states, the empty page, Left / Center / Stretch metadata, window art mode, the running indicator on a launched game.
- `RunningIndicatorRegressionTests` and `RunningLabelOverlapRegressionTests` cannot build the details row (`MainViewModel`, the harness gap Brushlight, Verst, Runeskald and Tatterspire share); the cover, list row and Play overlay checks pass.
- Layout trap found live: a `Viewbox Stretch="UniformToFill"` grows to fill any finite width it is offered. The rail's collage foot has a fixed 36px width and the collage strip (menus, settings band) sits in a zero-size `Canvas` host; keep both when editing them, or the rail and menus widen to the window.
