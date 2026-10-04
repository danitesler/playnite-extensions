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
| `Common.xaml` | Spacing and focus: `PopupBorder`, `FocusVisual`, one padding key per control, `IconSize`, `GameBannerHeight` | `ButtonPadding`, `InputPadding`, `MenuPadding`, `MenuItemPadding`, `ComboBoxDropDownPadding`, `ComboBoxItemPadding`, `ListBoxItemPadding`, `GroupBoxPadding`, `TooltipPadding`, `IconSize`, `GameBannerHeight` |
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
- **Sidebar** is designed for the **left** (Playnite's default; repo rule in `AGENTS.md`): a compact vertical rail at the window's left edge with the main menu button at its top — 44px wide, items 44x40 with 16px glyphs (32px plates where the design uses plates), main menu button 44 wide. Right mirrors it; top and bottom are fallbacks drawn as a strip. No theme asks users to move the sidebar.
- **Library background art** (`Views/Library.xaml`): where a theme feathers it, the `OpacityMask` sits inside a `BitmapCache` wrapper (as for every masked image).
- **View switches are icons only** (`Views/TopPanel.xaml`): `TopPanelSwitchDetailsViewTemplate`, `TopPanelSwitchGridViewTemplate` and `TopPanelSwitchListViewTemplate` draw `IconDetailsView` / `IconGridView` / `IconListView` through `IconTemplate` at `IconSize`. No text word labels. `TopPanelItem` already exposes the item's `Title` as its tooltip.
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
| Ancient | 44px compact slate navigation rail on the left (blue glow behind the current item), top panel as a 52px black strip with the view buttons left and search right, library art behind the strip |
| Clutch | 64px black navbar with centered icon view buttons between thin rules, 44px compact icon rail, translucent panels over the library art |
| Libertalia | 44px compact black icon rail and a bar-less top row over the darkened library art; icon view switches between thin "|" rules, selection as a feathered smudge, framed near-black panels |
| Ayywi | One black surface; 64px icon rail, 56px top bar with 12px rounded toggles and search box, cards and hairlines instead of fills |
| Dropzone | 44px compact sidebar-navy icon rail with a slanted blue plate for the current item; the top panel is a floating 44px rounded navy strip of icon view buttons (current = light grey pill) with yellow dots as separators; library over the art under a navy wash |
| Attache | 44px compact icon rail with pewter selection plates on near black, transparent 56px top strip over darkened library art |
| Biome | Night-sky window; 44px compact list-panel rail with hotbar-slot items, see-through 64px top bar with icon view switches (gold when current), panels with 2px black edges |
| Medallion | 44px compact near-black icon rail on the left with a brush edge and the medallion on top; header row on the bare black page; double frames with notched corners mark the current item |
| Overworld | 44px compact rail of 32px stone icon buttons (white outline on the current one), top panel as a 52px dark tab strip with underlined toggles, blurred game art behind the library |
| Frontier | 44px compact red painted rail with a ragged edge and black glyphs, 56px top bar ending in a tapered rule, flat near-black page |
| Mann Co | 44px compact brown rail with a tan menu plate and tan paper plates for the current item, 52px top bar ending in a 3px RED and BLU rule, flat dark brown page |

## Game page

`DetailsViewGameOverview.xaml` (details view, right pane) and `GridViewGameOverview.xaml` (grid side panel) share one skeleton, top to bottom:

1. **Banner** (`HeroArt`): `PART_ImageBackground` as a band of height `GameBannerHeight` (shared key in `Common.xaml`, default 320; ThemeModifier edits it, 0 to 600). Masked to fade out downward, a page-colored scrim darkens it toward the title, all in a `BitmapCache` wrapper. It collapses when the game has no background art or Playnite hides the image; 0 turns it off.
2. **Room above the title**: a spacer whose height scales proportionally with `HeroArt` via Playnite's global `{StaticResource MathConverter}` (`HexInnovation.MathConverter`):
   ```xaml
   <Setter Property="Height" Value="{Binding ActualHeight, ElementName=HeroArt, Converter={StaticResource MathConverter}, ConverterParameter='x * <DefaultSpacer> / <DefaultBanner>'}" />
   ```
   accompanied by an `ActualHeight == 0` DataTrigger that drops the height to `0` (or fallback top padding where required, e.g. `24` or `52`).
   This ensures:
   - **Exact default alignment**: At default `GameBannerHeight`, the ratio `x * <DefaultSpacer> / <DefaultBanner>` produces exactly `<DefaultSpacer>`. The title and header sit in their designed position over the darkened gradient scrim of the banner rather than being pushed down into empty solid background.
   - **Dynamic scaling with ThemeModifier**: When the user adjusts "Banner height (0 = off)" in ThemeModifier, decreasing the value shifts top elements closer to the top (and to 0 when banner is turned off), and increasing it shifts them further down proportionally. Never bind spacer height directly to `{DynamicResource GameBannerHeight}`.
3. **Header**: `PART_ImageIcon` and `PART_TextDisplayName`, then the actions (`PART_ButtonPlayAction` and `PART_ButtonContextAction` stacked in one cell, `PART_ButtonMoreActions`, `PART_ButtonEditGame`). Details view: actions beside the title. Grid panel: actions under it, and a close button (`CloseGameSideBarCommand`) over the top-right corner.
4. **Two columns**: **Steam screenshots**, then description (`PART_HtmlDescription`) and notes on the **left**; the **metadata pane** on the **right** (details view: fixed width beside the text; grid panel: a narrower column). Screenshots never span the full page over the metadata pane. They sit in the left column, above the description, in both the details view and the grid side panel. Host is `SteamScreenshots_SteamScreenshotsViewControl`, shown while `{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible}` is true, plus a 12 s skeleton for Steam games (the plugin hides its control on every game change and needs about a second). The bindings use `FallbackValue=PluginUnavailable` (not `False`), so with the plugin missing or disabled neither the control nor the skeleton shows.

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

- **UI icons**: `Icon<Role>` geometries in `Media.xaml`, drawn by `IconTemplate` (stroked sets use a `DrawingImage`). Generated with `scripts/render-icons.ps1 -Format Geometry|DrawingImage`, or hand-drawn (Codex `icons/`, Questlog `art/glyphs.py`, Uplink `art/icons.py`, Ancient `Media.xaml`, Overworld `art/icons.py` pixel bitmaps).
- **Menu icons Playnite copies** (`AddGameIcon`, `PlayIcon`, ...): Playnite rebuilds them from a `TextBlock`'s glyph and font, so a vector is lost. Either keep Playnite's icofont glyphs and only recolor them (Shadcn UI, Chakra UI, Material UI, Fluent 2), or map each key to a theme-relative PNG path as `sys:String`, rendered by `render-icons.ps1 -Extension <key>` from `icons.json` (Primer, Battle.net, Assassin's Creed) or by the theme's own art script (WoW Vanilla).

## Previews and screenshots

All release screenshots and listing previews are generated from HTML replicas using Playwright / Chromium via `scripts/take-screenshots.ps1 -Extension <key>` (never a capture of live Playnite). Two files per theme, both rendered at **1600 x 900**: `art/preview-details.html` -> `art/details.png`, `art/preview-settings.html` -> `art/settings.png`. A survey of the first 20 themes found the generic layout below in most of them; this section turns it into the rule. **The theme supplies colors, shapes, fonts, icons and its own labels; the geometry and the sample data below stay fixed**, so a row of screenshots from different themes compares like with like.

### Both previews

- Full-bleed 1600 x 900 `body`, `box-sizing: border-box`, `overflow: hidden`; fonts are the theme's with a system fallback (`DejaVu Sans` renders in the container). A top comment names the theme and says "approximate HTML replica".
- Colors are CSS variables named after the theme's `tokens.css` entries, never new colors. Icons are the theme's own `Icon<Role>` geometries (inline `svg`), not emoji or Unicode symbols, except the pencil of the Edit button.
- Nothing is drawn that the theme's XAML does not draw: no disclaimers, watermarks, captions or invented chrome in the image (the fan-theme notice lives in `info/NOTICE-*.txt`). Window buttons are drawn wherever the shell reserves them.
- Shapes follow the theme's radius rules (no `CornerRadiusFull` on non-square elements). No `box-shadow` on anything except the settings dialog against its backdrop.

### Details preview (`preview-details.html`)

Layout, left to right, top to bottom:

1. **Rail**: compact navigation rail at the left edge, 44px (the theme's own width if it differs), 1px divider on its inner edge. Main menu button on top, then Library (current) and Statistics.
2. **Top bar**: spans the width right of the rail, 48-56px (the theme's height). Left to right: search box about 280px with the placeholder "Search library", then the icon buttons in the order view settings, filter, sort, details view (current), grid view, list view; window buttons at the far right. View switches are icons only.
3. **Game list (secondary panel)**: required. A column between the rail and the game page, 250-350px wide (Playnite's `DetailsListWitdh`), full height under the top bar, 1px divider on the page side. At least 15 rows visible, one line each: a 24-32px square icon, then the name at the theme's list size. Exactly one row is selected (the theme's selected-row treatment), at most one other row shows the hover treatment, and a few uninstalled games use the muted text color. The selected game is the sample game. Sample names, in this order and cut at the panel height: Aegis Outpost, Barnstorm, Cargo Cult, Dockside Brawl, Engine Room, Foundry Run, Gravel Pit, Eldritch Void, Ironworks, Junction 9, Killzone Courtyard, Lumber Mill, Mercenary Park, Night Watch, Oilfield, Powerhouse, Quarry Siege, Rail Yard, Sawmill, Trainyard.
4. **Game page** (right of the list): hero banner of the theme's default `GameBannerHeight`, gradient only (no art, no cover), fading into the page. Title bottom-left at the page's left padding, 28-44px as the theme draws it, with the sample game's icon square when the theme shows one. Under it the button row, 40-44px high, in the order **Play** (130-150px wide), **More**, **Edit** (pencil, icon-only), each drawn as the theme's XAML draws it.
5. **Two columns** under the banner, top-aligned: left, a **Steam screenshots** row of 3 equal gradient thumbs (about 16:6.5, 8-14px gap, no arrows), then the headings **Description** and **Notes** (Playnite's own labels, `LOCGameDescriptionTitle`, `LOCNotesLabel`) over short paragraphs; right, the **metadata pane** at the theme's width (340-360px), top-aligned with the thumbs.
6. **Metadata pane** uses the six collapsing groups of the game page skeleton, in order, each field a label (Playnite's label text) and a value:

| Group | Rows shown |
|-------|------------|
| Progress | Completion status: Playing; Time played: 36.5 hours; Last played: Yesterday |
| Scores | Critic score: 94, in the positive-rating color |
| About | Developer: Ironclad Interactive; Release date: 4/18/2023 |
| Tags | Platform: PC (Windows) as one chip; Genres: RPG, Action, Atmospheric as three chips |
| Library | Library: Steam; Install size: 18.4 GB |
| Links | Links: Store, Wiki, one per line |

- **Sample game**: **Eldritch Void**. Use a differently named fictional game only when the theme is modeled on a specific game, and then keep the structure, order and data above.
- **Sample text**: Description "Descend into an ancient subterranean citadel lost between cosmic dimensions. Uncover forbidden relics, survive tactical encounters with spectral custodians, and reshape the destiny of a forgotten world." Notes "Finished the first act. The citadel's lower levels are the best part; still need the lantern relic."

### Settings preview (`preview-settings.html`)

1. Near-black backdrop (about `#0a0a0c`, or the theme's darkest tone), with the dialog centered: **1220 x 760**, 1px border in the theme's popup edge color, the one allowed `box-shadow: 0 20px 50px rgba(0,0,0,.6)`.
2. **Title bar**: the theme's caption height, text "<Theme name> Settings" on the left, the theme's close button at the right.
3. **Left navigation**: 240-250px wide, five items **General, Appearance, Layout, Input, Advanced**, the second (Appearance) in the theme's selected-row treatment, one other showing hover. Themes modeled on a game may rename the items; the count and the active position stay.
4. **Content**: heading "Appearance & Theme Options", subtitle "Adjust theme controls, elevation, accents, and visual hierarchy.", then one card (the theme's GroupBox look) holding, in this order:
   1. Text input "Header Display Name" = "Main Game Collection", drawn focused
   2. Combo box "Theme Mode" = "Dark Theme (Default)"
   3. Checked checkbox "Show glowing selection borders", help "Highlights active and focused library items with the theme accent."
   4. Unchecked checkbox "Compact game details pane", help "Minimize extra margins around metadata chips and screenshots."
   5. Slider "Banner Scrim Opacity (65%)", thumb at 65%
   6. Radio pair "Standard animations" (selected) and "Reduced motion"; radios stay round
5. **Footer**: 56-65px bar with a top rule, two right-aligned buttons, **Cancel** then **Save Settings**, drawn with the theme's Button style (no extra primary color: Playnite has no primary button but Play).

### Checking a preview

Open the PNG before committing: the game list is there and its selected row matches the sample game; the metadata pane shows all six groups; the settings card shows all six controls in order; nothing is clipped at the canvas edge; colors come only from tokens.

## Control corner radii and shapes

- **Why `CornerRadiusFull` distorts in WPF**: Unlike CSS (which scales corner radii uniformly), WPF's `Border` clamps horizontal and vertical radii independently: `radiusX = min(radiusX, width/2)` and `radiusY = min(radiusY, height/2)`. When a single huge radius (e.g. 9999 or 10000) is set on an element where `width != height`, WPF draws an ellipse/oval across the entire element rather than flat edges with circular caps.
- **Base control styles must use `ControlCornerRadius`**: Generic `<Style TargetType="{x:Type Button}">`, `<RepeatButton>`, `<ToggleButton>`, `<SearchBox>`, and `<TabControl>` MUST use `{DynamicResource ControlCornerRadius}` (or theme-appropriate small radius, e.g. 4-12px), NEVER `CornerRadiusFull` (pill/stadium 9999+). In WPF, plugins (e.g. SteamScreenshots carousel navigation `<` and `>`, numeric spin buttons) and unconstrained dialogs inherit base styles; large radii on non-standard aspect ratios distort them into vertical ellipses/ovals.
- **Action buttons (`PlayButton`) must use `ControlCornerRadius`**: The primary CTA on the game page must use `{DynamicResource ControlCornerRadius}` so its corner curvature matches adjacent secondary action buttons (e.g. `... More`, `Edit`).
- **Metadata tag chips (`PropertyItemButton`) must use `ControlCornerRadius`**: Genre, feature, category, tag, and platform chips have variable text length. Setting `CornerRadiusFull` causes wide tags (e.g. "Turn-based strategy (TBS)") to become extreme horizontal ovals. Always use `{DynamicResource ControlCornerRadius}` (or `CornerRadiusSmall`).
- **`CornerRadiusFull` is strictly for fixed 1:1 square elements**: Reserve pill/full radius ONLY for elements where `Width == Height` (e.g. 16x16 notification count badges, circular icon buttons).
- **Thin tracks and progress fills must use half-thickness radii**: `Slider` tracks, `ProgressBar` bars, active tab indicator lines, and scrollbar thumbs (`ScrollBarThumb`) must NEVER use `CornerRadiusFull` (which clamps horizontal radius to `width/2`, turning a 4px or 6px line into an elongated needle/spindle). Always specify an explicit numeric radius equal to half the track thickness (e.g. `CornerRadius="2"` for a 4px slider track, `CornerRadius="3"` for a 6px progress bar or thumb, `CornerRadius="1.5"` for a 3px line).
- **Scrollbar thumbs (`ScrollBarThumb`)**: Use half track width (e.g. `CornerRadius="3"` for a 6px thumb) or `CornerRadiusSmall`, never `CornerRadiusFull`. Large numbers scale disproportionately across axes in WPF's Border geometry and distort when rotated horizontally.
- **No pill wrappers on dynamic toolbars**: Never wrap dynamic collections like `PART_PanelMainItems` in an outer pill container.

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
.\scripts\build-theme.ps1 -Extension <key> -Deploy -Restart   # artifacts/builds/themes/<key>, copied to %AppData%\Playnite\Themes\Desktop\<Id>, sets theme in config.json and launches/restarts Playnite
```

Portable Playnite: add `-DeployPath <Playnite folder>\Themes`. If Playnite rejects a theme it falls back to Default and logs the XAML error in `playnite.log`.

First run of any theme: library (grid, details, list), the game page with a game that has a description, notes, scores and many fields and with one that has few, game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus on buttons and inputs, the sidebar at each position, ThemeModifier (palette edits and Edit constants recolor the restyled controls).
