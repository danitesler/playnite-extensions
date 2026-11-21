# Brushlight

Dark Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by Clair Obscur: Expedition 33 (unofficial, no game assets; see `info/NOTICE-Brushlight.txt`). Dark only. Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record the capture measurements and sampled colors; the [Showcase brief](BRIEF.md) maps the source UI to Playnite.

## Sources

`RESEARCH.md` (24 UI captures on interfaceingame.com, colors sampled with a canvas, nothing saved to disk) and `BRIEF.md` (lens: the camp menus, with the combat command stroke as Play).

## Tokens

All values are in `src/tokens.css`; `Constants.template.xaml` maps them.

| Token | Plays |
|-------|-------|
| `--white` / `--muted` | `TextColor` / `TextColorDarker` |
| `--cream` | `GlyphColor`, `HeadingForegroundBrush`, `FocusBrush`, `CheckMarkBrush`, `PrimaryButtonForegroundBrush` (capitals, accents, checks) |
| `--ink` | `TextColorDark` (text on cream and on Lumina) |
| `--void` | page and shell (`WindowBackgourndBrush`, `ShellBackgroundBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `TopPanelBackgroundBrush`, `HeaderBandBrush`) |
| `--plate` / `--plate-lit` / `--plate-deep` | `MainColor`, `ButtonBackgroundBrush`, hover and pressed plates, `InputBackgroundBrush` |
| `--card` | `PopupBackgroundColor`, `TooltipBackgroundBrush`, the metadata card, `GameBannerTintBrush` (the plum-black of the character cards) |
| `--plum` / `--plum-lit` | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `PrimaryButtonBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush` |
| `--rim` / `--rim-dim` | the broken plate rims, `NormalBorderBrush`, `InputBorderBrush`, `GridViewItemHoverBorderBrush` |
| `--bronze` / `--bronze-lit` | `PopupBorderColor`, separators, `MenuSeparatorBrush`, `HeadingRuleBrush`, the lattice |
| `--ochre` | `DataChangeNotifColor` (filter mark, count badge), the Play smear, the mark's brush stroke |
| `--blood` / `--coral` | `DangerBrush` / `NegativeRatingBrush` (Exit label, 7.4:1 on the card; white on blood 5.6:1) |
| `--hp` / `--hp-deep` | `ProgressBar` (the character card HP bar) |
| `--lumina` | `RunningIndicatorBrush` (never used by selection or hover) |

Radii: `ControlCornerRadius` 3, `CornerRadiusSmall` 2, `CornerRadiusLarge` 4 (key prompts and frames only; plates have pointed or cut ends). Type: Cinzel Regular (headings, title, Play, tabs) and Oswald Regular (numerals) bundled in `src/Typography`; body Palatino Linotype (Windows). Sizes 12 / 14 / 16 / 22 / 34.

## ThemeModifier

Edit constants keep the shared catalog (backgrounds, buttons, selection, inputs). Hover, pressed and decorative colors (bronze, ochre, lattice) stay in the theme.

## Component spacing (`src/Common.xaml`)

Buttons 20,5 (trapezoid slant 7px each side); inputs 10,5 (32px); menu panel 6 under a 12px lattice crown; menu and dropdown rows 30px with a 16px gutter for the arrow point; group box 16,12,16,14; tooltip 12,7,12,8; `IconSize` 16; icons are 1.6-unit hairlines, mitred, unfilled (`IconTemplate`).

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | 52px strip on the void closed by the Victory hairline (bronze rule, cream tick, fading right); plate search box; lozenge cells, the toggled one plum; the Chroma lozenge (7x10, ochre) as the filter mark |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px void rail, 1px bronze edge, bronze lattice rising from the foot; the brand mark as main menu (plum lozenge on hover); the current item on a plum lozenge that slides in from the edge |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | 44px title band with the lattice fading right, the mark and the title in Cinzel, the Victory rule at its foot; Close shows a danger skill node on hover |
| `DefaultControls/TreeView.xaml` | Settings list: plum arrow plate reaching 8px further left than hover, bright rim, a cream node at its point |

## Game page

`art/gen-overviews.mjs` writes both overviews (then `scripts/game-page-breakpoints.mjs`). The banner is painted out by horizontal dry-brush streaks (`brush-foot.png` on a page-colour strip); a smoke band fading to the right holds the title (cream Cinzel over the Victory rule) and the actions. Play is the combat command stroke over an ochre smear; More and Edit are key prompt squares; the metadata is one description card (`LocalCardTemplate`) with tick-rule group breaks, skill-node scores (`LocalNodeTemplate` + Oswald) and lozenge chips. Empty page: the mark over a faint lattice with red and white petals drifting (`LocalEmptyCanvasTemplate`). Pane position: `GameDetailsPanePosition` Right / Left / Center / Stretch. Grid side panel close: a 28x28 skill node, danger red on hover.

## Components

| Playnite file | Component |
|---------------|-----------|
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | the menu: description card with a lattice crown, plum arrow plate sliding its point out left, tick-rule breaks, key prompt shortcuts, Chroma lozenge checks, Exit red (row in `docs/themes/menus.md`) |
| `DerivedStyles/PlayButton.xaml` | the combat command: stroke.png-masked charcoal stroke, key prompt with the triangle, ochre smear sweeping in on hover, sinks down the slant on press; running: Lumina stroke, launching scan, lozenge foot band, Lumina hairline frame with end lozenges |
| `DerivedStyles/DetailsViewItemStyle.xaml` | rows: charcoal arrow plate on hover; selected = plum arrow plate whose point slides 12px left, cream node at the point; running: three Lumina lozenges |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | covers: broken white rim and 2% lift on hover; selected = the character card frame (top corners cut) with a cream node dropping onto it; Play / Info are 52px skill nodes that flood plum on hover |
| `DefaultControls/Button.xaml`, `ToggleButton.xaml`, `TabControl.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `TextBox.xaml`, `PasswordBox.xaml`, `ScrollViewer.xaml`, `GroupBox.xaml`, `ToolTip.xaml` | trapezoid buttons (default plum), lozenge tabs, skill-node checks and radios, node slider thumb on a grey segment, the HP bar, square input wells, a hairline scroll rail, description cards |

## Previews

Signature motifs drawn: arrow-pointed plates with chalk rims, plum selection, the Victory tick rule, the description card, the combat command Play with its ochre smear (hover end state), skill nodes, lattice in the rail and settings band. Stand-ins: Palatino Linotype is drawn with Gelasio. Previews use 32px search and 34px toolbar cells like `TopPanel.xaml`.

## Deviations

- The game's UI face is unpublished; Cinzel stands in for the display capitals and Oswald for the numerals.
- The plate rims are a hairline broken by a tiled grain (WPF cannot paint a real dry-brush edge per plate); the stroke and smear are fixed sprites stretched to the button.
- Playnite's user font setting overrides the body face; with it set, rows and descriptions show that font instead of Palatino Linotype.
- The tile icon (`art/mark.svg`) drops the brush stroke the in-app mark carries: the tile rasterizer XORs overlapping filled paths.

## Not verified yet

- Seen live: details view with a game selected. Not seen live: grid view and side panel, Settings window, hover and press states, the empty page, Left / Center / Stretch metadata, window art mode (only the WPF tests and the menu harness).
- `RunningIndicatorRegressionTests` and `RunningLabelOverlapRegressionTests` cannot build the details row (`MainViewModel`, the harness gap Verst, Runeskald and Tatterspire share); the cover, list row and Play overlay checks pass.
