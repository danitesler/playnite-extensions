# Tatterspire

Dark Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by Slay the Spire 2 (unofficial, no game assets; see `info/NOTICE-Tatterspire.txt`). Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record the capture measurements and sampled colors; the [Showcase brief](BRIEF.md) maps the source UI to Playnite.

## Sources

`RESEARCH.md` (26 UI captures on interfaceingame.com, colors sampled with a canvas, nothing saved to disk) and `BRIEF.md` (lens: diegetic torn paper over a slate world).

## Tokens

All values are in `src/tokens.css`; `Constants.template.xaml` maps them.

| Token | Plays |
|-------|-------|
| `--paper` / `--paper-dim` | `TextColor` / `TextColorDarker` (cream and muted blue-grey) |
| `--gold` | `GlyphColor`, `SelectedForegroundBrush`, `HeadingForegroundBrush` (titles, selected rows, checks) |
| `--gold-ink` | `TextColorDark` (text on gold fills) |
| `--slate-deep` / `--night` | `MainColor` / `MainColorDark`, rail and tree (`HeaderBandBrush`), page (`ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `GameBannerTintBrush`) |
| `--slate` | the paper: top bar (`TopPanelBackgroundBrush`), popups (`PopupBackgroundColor`), buttons, `ExpanderBackgroundBrush` |
| `--slate-lit` / `--slate-rim` | `SelectedBrush`, input borders / rims, `NormalBorderBrush` |
| `--ink` | outlines, inputs (`InputBackgroundBrush`), separators |
| `--abyss` | window and shell (`WindowBackgourndBrush`, `ShellBackgroundBrush`) |
| `--cyan` | `FocusBrush`, `GridViewItemHoverBorderBrush`, tab indicator (the card glow) |
| `--proceed*` | `PrimaryButton*` (the Proceed hexagon) |
| `--flag` | `DangerBrush` (the Back ribbon), `--coral` is `NegativeRatingBrush` (Exit label, 5.1:1 on the sheet) |
| `--energy-lit` | `RunningIndicatorBrush` (never used by selection or hover) |

Radii: `ControlCornerRadius` 4, `CornerRadiusSmall` 3, `CornerRadiusLarge` 6. Type: Zilla Slab (Regular and Bold, bundled in `src/Typography`), Segoe UI fallback; 12 / 14 / 15 / 21 / 30.

## Component spacing

`Common.xaml`: buttons 16,5; inputs 10,5 (32px); menu panel 8 inside the sheet; menu and dropdown rows 30px; group box 14; tooltip 12,7,12,8; `IconSize` 18; icons are filled shapes with a 0.9 round stroke (`IconTemplate`).

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | the HUD strip: a 44px slate bar with a torn lower lip (`torn-lip.png`, ink outline then slate), potion-capsule search, cyan-outlined toggles, a gold diamond filter mark |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px deep-slate rail, 2px ink edge, main menu = `LocalTatterspireMenuMarkTemplate` (Common.xaml, also the top bar's menu button), a three-card fan (a gold card with an ink diamond between two torn-paper cards): hover fans the side cards wider and lifts the gold card (draw); while the menu is open the fan squares up, the side cards riffle in alternation (shuffle) and an energy-orb rim lights around the gold card; the current item sits on a red flag tab (`LocalFlagTemplate`) |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | 44px deep-slate title band, mark and gold title, the red flag as Close |
| `DefaultControls/TreeView.xaml` | Settings list: gold swash and lit slate plate on the chosen section |

## Game page

`art/gen-overviews.mjs` writes both overviews. The banner tears into the page (`LocalTornFootTemplate` in `GameOverviewBackgroundBrush`), the title sits on a dark translucent band (the act title) in gold slab serif over an ink copy, Play is the Proceed hexagon, More and Edit are slate plates, the metadata is one torn slate sheet (`LocalTornSheetTemplate`) with swash breaks, hexagonal score orbs (`LocalEnergyOrbTemplate`) and ribbon-tag chips. Empty page: the map sheet (`LocalEmptyMapTemplate`). Pane position: `GameDetailsPanePosition` Right / Left / Center / Stretch through `scripts/game-page-breakpoints.mjs`.

## Components

| Playnite file | Component |
|---------------|-----------|
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | the menu: torn slate sheet, gold swash cursor, swash group break, cyan key hints, Exit in a red flag plate (row in `docs/themes/menus.md`) |
| `DerivedStyles/PlayButton.xaml` | Proceed hexagon, gold rim draws around it on hover, sinks 2px on press; running: energy-green plate, launching scan, hexagonal gem band along the foot |
| `DerivedStyles/DetailsViewItemStyle.xaml` | rows: glass hover; selected = slate plate with gold swashes opening from the middle, bold gold name |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | cards: cyan glow and lift on hover, gold frame and corner brackets on select; hexagon gem buttons; gem bands while running |
| `DefaultControls/Button.xaml`, `TabControl.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `ScrollViewer.xaml`, `GroupBox.xaml`, `ToolTip.xaml` | the settings screen's plates, tabs (cyan outline), teal wells with gold checks, hex-thumb slider, HP bar, gold scroll handle, cards |
| Grid side panel close | the Back flag, 28x28, slate with an ink outline, danger red on hover |

## Deviations

- WPF cannot draw the game's soft torn silhouettes with a drop shadow (no `DropShadowEffect` in this repo), so the sheet is an ink outline plus a lighter rim.
- The title logo is custom lettering and is not reproduced; Zilla Slab stands in for the UI face (Kreon is likely but unconfirmed).
- Real windows are rectangular, so Settings and dialogs use the band and a 1px rim instead of a torn frame.

## Not verified yet

- Hover, press and menu animations are written but only the idle states were rendered in the WPF harness (the running states were rendered).
- The torn sprites' tile repeats on very wide banners (the foot strip is 1024px stretched) have not been looked at beyond 1600px.
