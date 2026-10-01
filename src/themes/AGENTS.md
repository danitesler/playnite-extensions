# Themes — shared anatomy

Every theme here is **standalone** (it never reads another theme's files) but they are all built the same way: the same folder layout, the same Playnite files, the same key vocabulary, and the same page skeletons. This file describes what they share, so each theme's own `AGENTS.md` only records what is specific to its design system.

Rules that make Playnite load a theme (overlays, `DynamicResource`, brushes only, placeholders, build checks) are in **`.claude/skills/playnite-theme-dev/reference.md`**; the step-by-step for a new theme is skill **`playnite-theme-dev`**.

## Folder layout

| Path | What |
|------|------|
| `AGENTS.md` | The theme's notes (see [Per-theme notes](#per-theme-notes)). |
| `info/theme.yaml`, `InstallerManifest.yaml`, `danitesler_<key>.yaml` | Manifests. Paths and URLs follow from the folder (`src/extensions.json` holds only key, name, dir, AddonId, API version). |
| `info/icon.png` | 512×512 add-on tile, from `art/mark.svg` or the design system's logo via `scripts/render-addon-icon.ps1`, always in the default orange (`#FF7A1A`, no `-Color`) so every tile matches. |
| `info/LICENSE-*.txt`, `info/NOTICE-*.txt` | Shipped in the package: `LICENSE-Playnite.txt` (every theme starts from Playnite's Default files) plus the icon set's license or the fan-theme notice. |
| `src/tokens.css` | The design system's tokens under their own names (`:root`, a `dark` selector wins). The only place those names appear besides template placeholders. |
| `src/Constants.template.xaml` | Tokens → Playnite palette keys and shared keys; rendered into `Constants.xaml`. |
| `src/<Playnite path>.xaml` | Overlays at Playnite's Default-theme paths (list below). |
| `src/Images/` | Optional: PNG menu icons (`Images/<Set>/*.png`), textures. |
| `icons.json`, `icons/` | Optional: `render-icons.ps1` jobs for the PNG menu icons, and hand-drawn SVG sources. |
| `art/` | Optional: sources for original artwork (`mark.svg`, generators). Not shipped. |

## The files every theme ships

All themes restyle the same set; a few add more (Expander, ListView, group styles, `SearchView`, `StandardWindowStyle`, `NotificationMessage`).

| File | Role | Shared keys it defines |
|------|------|------------------------|
| `Common.xaml` | Spacing and focus: `PopupBorder`, `FocusVisual`, one padding key per control, `IconSize`, `GameBannerHeight` | `ButtonPadding`, `InputPadding`, `MenuPadding`, `MenuItemPadding`, `ComboBoxDropDownPadding`, `ComboBoxItemPadding`, `ListBoxItemPadding`, `GroupBoxPadding`, `TooltipPadding` |
| `Media.xaml` | Icons: `Icon<Role>` geometries drawn by `IconTemplate`; Playnite's menu icon keys (`AddGameIcon`, `PlayIcon`, ...) | `IconTemplate`, `IconSearch` ... `IconWindowClose` |
| `Views/MainWindow.xaml`, `Views/Sidebar.xaml`, `Views/TopPanel.xaml`, `Views/Library.xaml`, `DerivedStyles/MainWindowStyle.xaml`, `CustomControls/SidebarItem.xaml`, `CustomControls/TopPanelItem.xaml` | The shell | `MainMenuButton`, `MainWindowButton`, `TopPanelSearchBox` |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Side panels, respaced | |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | The game page (details view) and the grid side panel | |
| `DefaultControls/*` | Button, ToggleButton, RepeatButton, TextBox (+ `BareTextBox`), PasswordBox, ComboBox, CheckBox, RadioButton, Slider, ProgressBar, ScrollViewer, Thumb, ToolTip, ContextMenu, Menu, TabControl, GroupBox, ListBox | `SliderRangeButton`, `SliderThumb`, `ScrollBarThumb` |
| `CustomControls/SliderEx.xaml`, `GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | One-line styles `BasedOn` the theme's Slider / ContextMenu | |
| `CustomControls/SearchBox.xaml` | Search input (keeps all three `PART_` names) | |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml` | Library rows and cover tiles | |
| `DerivedStyles/PlayButton.xaml`, `PropertyItemButton.xaml`, `WindowBarButton.xaml`, `HighlightBorder.xaml` | Play, metadata values and chips, dialog caption buttons, input chrome for Default templates | |

Everything a theme does not restyle (DataGrid, DatePicker, TreeView, the edit dialog, ...) is Playnite's template, recolored through the palette keys.

## Shell

Each theme lays the shell out its own way; the mechanics are the same:

- **Window buttons** are drawn by `MainWindowStyle.xaml` (`MainWindowButton`). The top bar keeps their width clear on its right (plus a gap), and a sidebar docked at the top or bottom does the same. Change one, change the other.
- **Main menu**: `PART_ElemMainMenu` uses `MainMenuButton`, in the sidebar; the top bar shows it only when the sidebar is hidden.
- **Sidebar** is designed for the **left** (Playnite's default; repo rule in `AGENTS.md`): a vertical rail at the window's left edge with the main menu button at its top. Right mirrors it; top and bottom are fallbacks drawn as a strip. No theme asks users to move the sidebar.
- **Library background art** (`Views/Library.xaml`): where a theme feathers it, the `OpacityMask` sits inside a `BitmapCache` wrapper (as for every masked image).
- **Layers**: at most three surfaces, named by shared keys: `ShellBackgroundBrush` (frame, rail), `TopPanelBackgroundBrush` (top bar), `ContentBackgroundBrush` (the library layer), on `WindowBackgourndBrush`.

| Theme | Layout |
|-------|--------|
| Shadcn UI | Views on an inset rounded card in a sidebar-colored frame; icon sidebar; header inside the card |
| Chakra UI | One flat surface; 64px top bar with segmented view controls |
| Material UI | App bar (the only raised surface) + 64px mini drawer whose top continues the bar |
| Primer | Dark header band across the top, navigation rail on the page color |
| Fluent 2 | Windows 11: base layer with a 48px title-bar row and compact nav rail, library on a lighter content layer |
| Launchpad | Frame-colored icon rail and top app bar; game list beside a full-width-art game page |
| Codex | Icon rail, a tab strip along the top, layered charcoal |
| Questlog | Gold window frame, stone sidebar strip, transparent top bar |
| Hextech | Left icon rail (Phosphor icons), League client look |
| Uplink | 56px navigation rail (glow and lit line on the current item), top panel as a 48px sub navigation strip; with the sidebar at the top, an uppercase tab bar |
| Ancient | 64px slate navigation rail on the left (blue glow behind the current item), top panel as a 52px black strip with the view buttons left and search right, library art behind the strip |
| Clutch | 64px black navbar with centered uppercase view tabs between thin rules, icon rail, translucent panels over the library art |
| Libertalia | Black icon rail and a bar-less top row over the darkened library art; view switches as title case menu entries between thin "|" rules, selection as a feathered smudge, framed near-black panels |
| Ayywi | One black surface; 64px icon rail, 56px top bar with pill toggles and a pill search box, cards and hairlines instead of fills |

## Game page

`DetailsViewGameOverview.xaml` (details view, right pane) and `GridViewGameOverview.xaml` (grid side panel) share one skeleton, top to bottom:

1. **Banner** (`HeroArt`): `PART_ImageBackground` as a band of height `GameBannerHeight` (shared key in `Common.xaml`, default 320; ThemeModifier edits it, 0 to 600). Masked to fade out downward, a page-colored scrim darkens it toward the title, all in a `BitmapCache` wrapper. It collapses when the game has no background art or Playnite hides the image; 0 turns it off.
2. **Room above the title**: a spacer whose height drops when `HeroArt` has no height, so the title sits low on the banner or at the top of the page.
3. **Header**: `PART_ImageIcon` and `PART_TextDisplayName`, then the actions (`PART_ButtonPlayAction` and `PART_ButtonContextAction` stacked in one cell, `PART_ButtonMoreActions`, `PART_ButtonEditGame`). Details view: actions beside the title. Grid panel: actions under it, and a close button (`CloseGameSideBarCommand`) over the top-right corner.
4. **Steam screenshots**: the SteamScreenshots add-on's host (`SteamScreenshots_SteamScreenshotsViewControl`), shown while `{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible}` is true, plus a 12 s skeleton for Steam games (the plugin hides its control on every game change and needs about a second). The bindings use `FallbackValue=PluginUnavailable` (not `False`), so with the plugin missing or disabled neither the control nor the skeleton shows.
5. **Two columns**: description (`PART_HtmlDescription`) and notes on the left; the **metadata pane** on the right (details view: fixed width beside the text; grid panel: a narrower column).

### Metadata pane

Every field of Playnite's "Game fields to be displayed on details panel" list lives in **one** pane, never split between a header, stat cards or chips elsewhere. Six groups, in this order, each field a container `x:Name="PART_Elem<Field>"` (Playnite toggles its `Visibility`) holding a label (a Playnite `LOC` key) and the value part:

| Group (`x:Name`) | Fields |
|------------------|--------|
| `MetaProgress` | CompletionStatus, PlayTime, LastPlayed, RecentActivity, Added |
| `MetaScores` | CommunityScore, CriticScore, UserScore (`TextBlockGameScore`) |
| `MetaAbout` | Developers, Publishers, ReleaseDate, Series, AgeRating, Region |
| `MetaTags` | Platform, Genres, Categories, Features, Tags (`Tag="Chip"` `WrapPanel`) |
| `MetaLibrary` | Library, Source, Version, InstallSize, InstallDirectory |
| `MetaLinks` | Links |

- A group is a `Border` that collapses through a `MultiDataTrigger` on `{Binding Visibility, ElementName=PART_Elem<Field>}` = `Collapsed` (a `DataTrigger` for one field), so a game with few fields shows few groups and no stray separator.
- Separator between groups: a 1px top border on each group inside a `ClipToBounds` wrapper whose inner panel has negative top and bottom margins, so the first group draws no rule; or plain space where the design system has no rules.
- Rhythm: 12px above and below each group rule (Primer 16), 8px above and below each field (Material details 6, Questlog 6), 4px between a caption and its value in the grid panel. The wrapper's negative margins are `-(2 x group + 1 + field)` on top and `-field` at the bottom; change them together with the spacing. The grid panel keeps 20-24px side padding and a 24px gap between its two columns.
- No group captions: a theme cannot ship a `Localization` folder, so labels are existing Playnite keys (`LOCTimePlayed`, `LOCDevelopersLabel`, `LOCGenresLabel`, ...).
- Details view: caption column beside the value. Grid panel: caption above the value. Not `GridEx`: `AutoLayoutColumns` would put hidden rows back in the flow.
- Values in lists (`PART_Items*`) are Buttons Playnite styles with `{StaticResource PropertyItemButton}` from code. `PropertyItemButton.xaml` is the only hook: a text link by default, a chip when the owning list has `Tag="Chip"` (a `RelativeSource AncestorType=ItemsControl` DataTrigger).
- `HtmlTextView` takes `Color`s: set `TextElement.Foreground` and `Tag` to brushes and bind `HtmlForeground` / `LinkForeground` to `(TextElement.Foreground).Color` / `Tag.Color`.

## Icons

- **UI icons**: `Icon<Role>` geometries in `Media.xaml`, drawn by `IconTemplate` (stroked sets use a `DrawingImage`). Generated with `scripts/render-icons.ps1 -Format Geometry|DrawingImage`, or hand-drawn (Codex `icons/`, Questlog `art/glyphs.py`, Uplink `art/icons.py`, Ancient `Media.xaml`).
- **Menu icons Playnite copies** (`AddGameIcon`, `PlayIcon`, ...): Playnite rebuilds them from a `TextBlock`'s glyph and font, so a vector is lost. Either keep Playnite's icofont glyphs and only recolor them (Shadcn UI, Chakra UI, Material UI, Fluent 2), or map each key to a theme-relative PNG path as `sys:String`, rendered by `render-icons.ps1 -Extension <key>` from `icons.json` (Primer, Battle.net, Assassin's Creed) or by the theme's own art script (WoW Vanilla).

## Previews and screenshots

Two different pictures, never mixed up. **`art/preview-grid.html` + `preview-grid.png`**: an approximate HTML replica of the grid view, made in the cloud on a theme's first build and sent to the user (`node scripts/render-theme-preview.mjs <html>`); labelled as not a capture. **`info/screenshots/*.png`**: real Playnite captures from `scripts/take-screenshots.ps1`, local Windows only, needed for the release and the listing. Playnite is never started on a server.

## Per-theme notes

A theme's `AGENTS.md` keeps only what is its own, in this order:

1. **What this is**: design system, version, dark variant; for fan themes, the unofficial / no-assets statement.
2. **Sources**: token package, component specs, icon set, each with version and license.
3. **Tokens**: which token plays each key (Playnite palette first, then shared keys), plus radii and fonts.
4. **Component spacing**: the `Common.xaml` values and the spec each comes from.
5. **Shell**: the layout, per shell file.
6. **Game page**: only how it differs from the skeleton above (columns, widths, header).
7. **Components**: Playnite file → design-system component.
8. **Deviations**: where WPF or Playnite cannot follow the spec.
9. **Not verified yet**: theme-specific checks beyond the list below.

## Build and try

```powershell
.\scripts\build-theme.ps1 -Extension <key> -Deploy   # artifacts/builds/themes/<key>, copied to %AppData%\Playnite\Themes\Desktop\<Id>
# restart Playnite -> Settings -> Appearance -> Theme
```

Portable Playnite: add `-DeployPath <Playnite folder>\Themes`. If Playnite rejects a theme it falls back to Default and logs the XAML error in `playnite.log`.

First run of any theme: library (grid, details, list), the game page with a game that has a description, notes, scores and many fields and with one that has few, game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus on buttons and inputs, the sidebar at each position, ThemeModifier (palette edits and Edit constants recolor the restyled controls).
