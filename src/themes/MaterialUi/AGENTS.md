# Material-inspired — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) inspired by **Material Design** as implemented in the **MUI Material UI** library (v9.4, Material Design 2), in MUI's default dark variant (`createTheme({ palette: { mode: 'dark' } })`). Unofficial: it is not affiliated with, endorsed by or sponsored by Google or MUI, and includes none of their logos, fonts or artwork (the tile icon is a neutral glyph, `art/mark.svg`); the menu icons are open-licensed Material Icons (Apache-2.0, `info/LICENSE-material-icons.txt`). Notices: `info/NOTICE-MaterialUi.txt`. The display name is "Material-inspired"; the id, key and folder keep their original names.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Keys are the shared vocabulary; the template names the MUI variable behind each one (paper at elevation N is `mui-overlays-N` over the paper; `alpha(primary.main, selectedOpacity)` is `mui-palette-primary-main/16`).

`TextBrushDarker` is `text.secondary` with its alpha (white 70%), as the controls draw it, so Playnite's own views get the same secondary text on every surface.

Action and text colors keep their alpha, as in MUI; popup surfaces and edges are flattened onto the paper, since WPF popups are layered windows. Font: MUI's Roboto is not bundled (Toolbox drops `Fonts/`), so Segoe UI.

Sibling theme: swap `--mui-palette-primary-main` / `-dark` / `-contrastText` and `--mui-palette-LinearProgress-primaryBg` for another MUI color (dark-mode primaries are the `[200]` shade).

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

`FocusVisual` fills a keyboard-focused control with `action.focus`: Material shows focus as a state layer, not a ring.

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

MUI's app bar + mini drawer layout. The app bar (Paper at elevation 4) is the only raised surface; everything else is `background.default`, with no dividers.

| File | Material behavior |
|------|-------------------|
| `Views/MainWindow.xaml` | Flat: drawer and view on `background.default`. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as IconButtons (40px circles, 20px icons, `MainWindowButton`) on the app bar, 12px from the top and against the right edge; close fills with `error.main`. |
| `Views/Sidebar.xaml` | Permanent mini Drawer, 64px wide, no divider. Its top 64px is painted in the app bar color and holds the menu IconButton (`MainMenuButton`, `PART_ElemMainMenu`), so the bar reads as one full-width app bar. |
| `CustomControls/SidebarItem.xaml` | ListItemButton rows: 64x48, square, 24px icons in `text.secondary`; `action.hover` on hover; selected = `SelectedBrush` (primary @ 16%) with a primary icon. |
| `Views/TopPanel.xaml` | 64px Toolbar with 16px gutters. App bar search on the left (`TopPanelSearchBox`: white 15%, 25% on hover, no border, widening 240 → 360px while focused). IconButtons on the right; Badges instead of text (primary dot while a filter applies, error count for notifications). |
| `CustomControls/TopPanelItem.xaml` | IconButton medium, `color="inherit"`: 40px circle, 24px icon; a toggled item turns primary. |
| `CustomControls/SearchBox.xaml` | FilledInput with a start adornment, for search boxes outside the app bar. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml`, `Views/Library.xaml` | Playnite's panels on the 8px spacing unit without separators; background art under the app bar, feathered on every edge. |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | Material media page (Google Play's layout in MUI parts). Hero: background art 360px under a scrim into `background.default`, hidden without art; the header overlaps it: cover, title as h4, contained Play, text More, round IconButton Edit. Below: Description and Notes Cards and a 380px Details Card that holds every metadata field Playnite can show, as a dense List of label / value rows (120px labels in `text.secondary`) in the six shared groups (progress, scores, about, tags as small filled Chips, library, links; see `.claude/skills/playnite-theme-dev/reference.md`) split by Dividers. A group whose fields are all hidden collapses with its Divider. The grid panel is one Card: CardMedia (art), CardHeader (round avatar, title), CardActions, then two columns like the details page: the description and the notes on the left and, on the right (280px), the same List with the label over the value. Fields left out are parts Playnite skips. |

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Uppercase labels

`text-transform: uppercase` has no WPF equivalent. Button and tab templates carry an implicit `DataTemplate` for `sys:String` that renders `AccessText` through Playnite's `StringToUpperCaseConverter`. Only string content hits it; icon or panel content passes through. Do not bind the converter to `Content` directly: it returns an empty string for anything that is not a string, which blanks icon buttons.

## Deviations from MUI

- No Roboto, no letter-spacing (WPF `TextBlock` has none), no ripple animation (static state layers), no drop shadows (a divider edge on popups instead; elevation shows as the Paper overlay color).
- No floating labels on text fields (Playnite's forms put labels beside or above them), hence the hidden-label FilledInput metrics.
- The Card title is h6 instead of CardHeader's default h5, sized for settings sections.
- The indeterminate LinearProgress slides one segment; MUI runs two bars at different speeds.
- The overview cover is square-cornered (CardMedia inherits the Card radius in MUI); WPF can't clip an Image to a radius without a mask, and the 4px radius isn't worth one.
- Chips (`PropertyItemButton` with `Tag="Chip"`) use `ControlCornerRadius` (4px) instead of MUI's 16px pill: WPF clamps `CornerRadiusFull` per axis, which would stretch a non-square chip into an oval (repo mandate).
- `CornerRadiusFull` (9999) is used only on true 1:1 squares: the 40x40 IconButtons (main menu, top panel toggles, window buttons, More and Edit in the overview) and the 22x22 `WindowBarButton`. Tracks (Slider, scroll thumb) use `ControlCornerRadius`.
- The Details List has no leading icons (there are 25 fields and Material Icons for only a few) and no group subheaders: themes cannot ship localization, so groups are told apart by Dividers and spacing.

## Previews

`art/preview-details.html` and `art/preview-settings.html` render `art/screenshot-details.png` and `art/screenshot-settings.png` (1280x720, colors as `var(--mui-*)` tokens, Segoe UI drawn with the bundled Selawik). Motifs: the 64px mini drawer with its header band in the app bar color, the elevated app bar with the translucent search field, the primary dot and error count Badges, uppercase contained and text buttons, FilledInput with a primary underline, Paper cards with six Divider-split metadata groups. Chips are 4px-radius rectangles, as in the XAML.

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run checklist: follow standard list in `../AGENTS.md`. Also: uppercase labels on dialog buttons (icon-only buttons must still show their icon), access-key underscores in button text, checkbox/radio hover halos near panel edges, slider halos, the Select arrow turning over while open, and the menu icon column alignment.

Layout checks: the app bar color continuing through the drawer's header band, the search widening on focus, Badges on the filter and notification buttons, full-width drawer rows, the FilledInput underline animation in the game edit dialog.

Known limit: the app bar belongs to the library view, so on other views (Statistics, add-on views) only the drawer's header band shows the bar color.

Game overview: the hero overlap with and without background art, the scrim strength, the header next to tall and wide covers, the round avatar clip in grid mode, Chip hover, the Dividers and the collapse of a group whose fields are hidden (the first visible group starts flush at the card padding), the 212px value column with long install paths and wrapped Chips.
