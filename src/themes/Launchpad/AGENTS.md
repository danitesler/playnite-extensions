# Launchpad — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of a modern game-launcher app, taking inspiration from the **Battle.net** desktop app: near-black blue-grey surfaces, white text, one bright launcher blue for Play, selection and focus, small corner radii, an icon rail, a top bar for the view controls, a game list next to a game page.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Controls read brushes only, so ThemeModifier's palette edits and the shared brushes in the generated `thememodifier.yaml` recolor them. **One exception**: the description text on the game page (`HtmlTextView`) takes Color-typed properties (`HtmlForeground`, `LinkForeground`, default black), so it reads `TextColor` and `GlyphColor`; ThemeModifier brush edits do not reach it. The build check allows exactly those two properties.

Font: Segoe UI at 12 / 14 / 16 / 20 / 34. The client's own typeface is not bundled (and a `Fonts/` folder cannot ship in a Playnite theme).

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell and game page

| File | Behavior |
|------|----------|
| `Views/MainWindow.xaml` | The sidebar docks with Playnite's Sidebar position. Left is the usual rail; the top bar stays the view controls. |
| `Views/Sidebar.xaml` | Icon rail, 44px, frame color, 1px divider toward the library. The logo button (`PART_ElemMainMenu`: orbit mark in launcher blue) opens the main menu. Items are icon only. Left and right are vertical; top and bottom are a strip, with 140px kept clear for the window buttons. |
| `CustomControls/SidebarItem.xaml` | Icon only, 44x40, 18px glyph; the title is the tooltip. Muted at rest, white on a card fill when hovered, 3px blue bar on the edge facing the library when current. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons centered on the top bar (44x36, red close hover); caption height 52. |
| `Views/TopPanel.xaml` | Top bar, 52px, frame color, 140px clear on the right for the window buttons: search (320px), view controls, filter toggle, notifications (blue count badge), plugin items, global progress. Carries the logo button only when the sidebar is hidden. |
| `Views/Library.xaml` | Library on the page color; the library-wide background art (`PART_ImageBackground`) is kept but hidden. |
| `Views/LibraryDetailsView.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml`, `DetailsViewItemTemplate.xaml`, `DetailsViewGroupStyle.xaml` | Game list on the rail color: icon and name rows, card hover, selected row with a 3px blue bar, muted names and dimmed icons for games that are not installed, small muted group headings. |
| `Views/DetailsViewGameOverview.xaml` | Game page: background art is a 340px band at the top (cropped, tinted at the top, a page-colored scrim darkening toward the title, faded into the page; hidden when the game has no art); a 100px strip of it shows above the header so the title sits low. Icon and name at 34px bold over the art, cover at the right, Steam screenshots, description and notes on the left, and **Game details** on the right: every metadata field Playnite can show (its "Game fields to be displayed on details panel" list), each a 12px muted label over its value, in the six shared groups (progress, scores, about, tags as chips, library, links; see `.claude/skills/playnite-theme-dev/reference.md`) split by 1px `NormalBorderBrush` rules. A group whose fields are all hidden collapses with its rule. Then a bottom action bar: 240x52 blue Play, context action, Options (gear + "More"), edit. |
| `Views/GridViewGameOverview.xaml` | The same page in the cover-grid side panel: the same 290px background band behind the header (96px of it above the title, same tint and scrim), rail color, blue Play, gear Options, screenshots, description and notes on the left, Game details on the right (280px): the same pane and groups as the details page. |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | Side panels on the rail color; preset buttons use theme icons. |

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations from the Battle.net app it is inspired by

- **Game list is a vertical rail, not a top row of icons.** The client shows its few games as a row of icons at the top; that does not scale to a Playnite library of hundreds of games, so the details view uses a vertical list (icon and name) beside the game page.
- **The bottom bar is on the game page only** (Details view and the grid side panel), not on the whole window.
- **No Blizzard logo, game logos or icon files** (see Sources). The menu button is the orbit mark on its own, without the tile styling.
- **The rail is icon-only.** Titles are the tooltip. Left and right are a vertical rail; top and bottom stay a horizontal strip so Playnite's Sidebar position still applies.
- **No news tiles.** Playnite has no news feed; the cards under the art are the game's description and details.
- **Font** is Segoe UI, not the client's typeface.
- **Colors are approximations** (see Sources).
- **Notification count badge uses `ControlCornerRadius`, not `CornerRadiusFull`.** The badge is `MinWidth=16` x `Height=16` and grows wider for counts of two digits or more, so a full radius would distort it (AGENTS.md Control Corner Radii); the preview draws the same 3px radius.
- **The game title keeps a soft drop shadow** on the art so it stays legible over bright artwork (Playnite's own page does the same).

## Build notes

Icons are re-rendered with `.\scripts\render-icons.ps1 -Extension launchpad` (Windows; it needs WPF). The committed geometries and PNGs were produced with a stand-in on Linux from the same `icons.json`.

## Not verified yet

Built and statically checked (`build-theme.ps1`); **not compared with a screenshot of the real client**. First run on Windows: the left icon rail (logo opens the main menu; titles are tooltips) and the top bar's view controls (also with the sidebar on the right, top, or bottom), the Details view (game list, game page with art, cards, bottom action bar, blue Play) with a game that has art and one that does not, Grid and List views, game context menu, top panel dropdowns, settings tabs, a game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus. Layout risks to look at: the window buttons against the top bar's right edge, the 340px hero band on the details page and the grid side panel, the cover beside a long game title, the description text color (`HtmlTextView`), the Game details pane with every field switched on and with only a few (rules between groups, chip wrapping, groups collapsing with their rule, the 280px pane in the grid panel), text box padding, the Options button label (`LOCMoreAction`), and the 3px selected bar on rail items.

Known limit: the top bar belongs to the library view, so on other views (Statistics, add-on views) only the icon rail shows.
