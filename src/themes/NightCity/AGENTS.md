# Night City — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, in the style of the **Cyberpunk 2077 in-game menus** (red chrome, cyan state on red-violet blacks) with the franchise yellow kept as the brand layer: Cyberpunk yellow (`#FCEE09`) as the main accent, cyan as the secondary accent, red for danger, square and chamfered shapes. Unofficial fan theme: no CD PROJEKT RED assets, logos or fonts are shipped. "Cyberpunk 2077" is a trademark of CD PROJEKT S.A.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

All colors are in `src/tokens.css` (dark block); the template maps them by role. The palette follows the in-game menus (Game UI Database captures, RESEARCH.md) with the franchise yellow kept as the brand layer. Three roles, never mixed:

- **Red = chrome** (the in-game frame): outlines, rules, popup edges, section heads, captions, secondary text, scroll thumb, hover plates.
- **Cyan = state** (the in-game active colour): hover and focus edges and glyphs, links, values, the cover hover outline.
- **Yellow = commit and brand**: Play, every selected or checked thing (current rail item, selected row and cover, active view switch, current Settings section, checkboxes, radios, slider and progress fills), the game title, the dialog title slab, the filter-active mark.

| Token | Key | Used for |
|-------|-----|----------|
| `cp-yellow` | `SelectedBrush`, `PrimaryButton*`, `HeadingForegroundBrush`, `TabItemIndicatorBrush`, `ThumbBrush`, `MixedRatingBrush`, `WarningBrush`, `DataChangeNotifBrush` | Selection, checked, Play, game title, filter mark |
| `cp-cyan` | `GlyphBrush`, `HighlightGlyphBrush`, `FocusBrush`, `PositiveRatingBrush`, `GridViewItemHoverBorderBrush` | Hover, focus, links, scores, cover hover outline |
| `cp-red-ui` | `SectionHeaderBrush`, `FrameBrush`, `ScrollBarThumbBrush` (80%), `PopupBorderBrush` (via `cp-red-edge`) | Section heads (game page, GroupBox, filter panel), cut-corner ticks, card rules, dialog crosshair grid |
| `cp-red-label` | `TextBrushDarker` | Secondary text, captions, idle rail and tree labels |
| `cp-red-dim` | `NormalBorderBrush`, `WindowPanelSeparatorBrush` (70%), `HoverBrush` (30%), `ProgressBarTrackBrush` (35%) | Outlines, dividers, hover plates, tracks |
| `cp-red` | `DangerBrush`, `NegativeRatingBrush` | Destructive actions, close hover |
| `cp-void` | `WindowBackgourndBrush`, `InputBackgroundBrush`, `TooltipBackgroundBrush`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `BackgroundToneColor` | Page, inputs, rail, top bar |
| `cp-panel` | `NormalBrushDark`, `PopupBackgroundBrush`, `ExpanderBackgroundBrush`, `ContentBackgroundBrush` | Cards, popups, library layer |
| `cp-panel-raised` | `NormalBrush`, `ButtonBackgroundBrush` | Control fill |
| `cp-text` | `TextBrush`, `DangerForegroundBrush` | Body text |
| `cp-on-yellow` | `TextBrushDark` | Black text on yellow fills |

Radii: `ControlCornerRadius` 2px, `CornerRadiusSmall` and the rest 0; the look is square. Thin tracks use explicit half-thickness radii (4px slider track = 2, 6px progress bar and scrollbar thumb = 3). Fonts: `FontFamily` = bundled Rajdhani (Regular, SemiBold, Bold), then Bahnschrift, Segoe UI; `HeadingFontFamily` = bundled Orbitron (Regular, Bold), then Bahnschrift SemiBold; both in `src/Typography/`; `MonospaceFontFamily` = Consolas. Sizes are Playnite's scale (12/14/15/20/29).

## Component spacing (`src/Common.xaml`)

| Key | Value | Why |
|-----|-------|-----|
| `ButtonPadding` | 16,6 | Dense game-menu buttons |
| `InputPadding` | 10,6 | Inputs and dropdown |
| `MenuPadding` / `MenuItemPadding` | 0,4 / 14,7 | Context menus |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,2 / 10,6 | Dropdown |
| `ListBoxItemPadding` | 10,6 | List rows |
| `GroupBoxPadding` | 14 | Cards |
| `TooltipPadding` | 10,6 | Tooltips |
| `IconSize` | 16 | Phosphor bold at 16px |
| `GameBannerHeight` | 340 | Default banner; the spacer ratio is `x * 100 / 340` (details) and `x * 72 / 340` (grid) |
| `GameDetailsPaneWidth` | 300 | Details column on the game page (details view). ThemeModifier edits it. |
| `GridDetailsPaneWidth` | 300 | Details column in the grid view side panel. ThemeModifier edits it. |

These are this theme's own values: there is no published spec to quote.

## Shell

| File | What it draws |
|------|---------------|
| `Views/MainWindow.xaml`, `DerivedStyles/MainWindowStyle.xaml` | Frame on `ShellBackgroundBrush`; `MainWindowButton` (close hover = `DangerBrush`) |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px left rail, items 44x40 with 16px glyphs, yellow marker and tinted plate on the current item; `MainMenuButton` |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml` | 52px black strip, icon-only view switches (current = solid yellow plate, black glyph, one 8px cut corner), search box on the right (`TopPanelSearchBox`), 128px kept clear for the window buttons |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). |
**Settings chrome** (`DefaultControls/TreeView.xaml`, `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml`): the Settings section list is the game's menu list as cut-corner slabs, 30px rows in the body face. Hover is a yellow hairline plate with the label in yellow and a half-lit cyan ghost lip; selected is the solid yellow slab with its top-left and bottom-right corners cut (8px triangles in the rail brush), black label, and the cyan lip fully lit 2px off the slab. The title band is 40px: the title sits on a yellow slab with two 12px cut corners (heading face, black), a cyan sliver continues it along the band foot, yellow slashes are ghosted left of the 44x40 caption buttons and a yellow hairline closes the band.

## Game page

Follows the skeleton in `../AGENTS.md`. The banner spacer uses `MathConverter` with the default 340 banner (`x * 100 / 340` details, `x * 72 / 340` grid); with `ActualHeight` 0 it drops to 24 (details) and 48 (grid). Metadata is one card with six collapsing groups separated by 1px yellow rules, with one cut corner. Steam screenshots show a skeleton for Steam games (`SteamScreenshotsSkeletonTemplate`).

Empty state (no game selected): both overviews hide the page and show an empty cut-corner slab (the Play slab's shape) with a scan line running down it and a cyan ghost of the outline that glitches twice every 3.6s, `LOCErrorNoGameSelected` in the heading face and the yellow bar; loops stop when a game is selected. The page root is opaque (`ContentBackgroundBrush`) so the banner fades to it with a plain gradient (no `OpacityMask`, which left dark seams behind the animated Play button); library art no longer shows behind the game page.

## Components

| Playnite file | Night City component |
|---------------|----------------------|
| `Button`, `ToggleButton`, `RepeatButton` | Near-black fill, 1px dim red outline with a red cut-corner tick, red plate and cyan edge on hover, cyan focus box (`FocusVisual`) |
| `TextBox`, `PasswordBox`, `BareTextBox` | `InputBackgroundBrush`, hairline, cyan edge on `IsKeyboardFocusWithin` |
| `CheckBox`, `RadioButton` | 16px square box (yellow fill, black check) and a 14px circle with a 6px dot |
| `ComboBox`, `ListBox`, `TabControl`, `GroupBox` | Square; active tab a yellow plate with a cut corner; cards with a red top rule and red caps header |
| `Slider`, `SliderEx`, `ProgressBar`, `ScrollViewer`, `Thumb` | 4px slider rail, 6px progress and scrollbar thumb, yellow fill |
| `ToolTip`, `ContextMenu`, `Menu`, `GameMenu`, `GameGroupMenu`, `TrayContextMenu` | Black popups with a 1px red edge and a 2px yellow top bar, red-plate hover rows with a cyan marker |
| `DetailsViewItemStyle` | Hairline rows, solid yellow selection with black text |
| `GridViewItemStyle` | Selected = static 3px yellow outline. Hover = the glitch-lock, animated: 2px cyan outline flickers on (0.12s), a red ghost outline jumps 3 to 4px off it in two stepped frames, cyan chamfer triangles pop in at the top-left and bottom-right corners; everything fades out in 0.15s |
| Running game (`RunningIndicatorBrush` = `cp-green`) | The netrunner uplink, in the status green no other role uses. Every surface carries a 0.16 tint, a frame in the item's own shape (rows 2px with a dark keyline, covers 2px on the edge over an 8px inner band, the slab's double-cut plate 1.5px), a foot of marching dashes (a 4/2px tiled mask on the parent, so the fill steps like a bar of dashes) and the black cut-corner chip with three green signal bars as the mark (chip on the far edge of rows, bottom-left of covers, the right end of the slab). **Launching (1.4s loop, 0.9s travel):** `RunningScan` is one hard-edged block on a slant (four mask stops, `EndPoint` leaning 0.14 on rows, 0.7 on covers so it cuts corner to corner, 0.35 on the slab, where it is a copy of the plate's `Path` with the mask on the path itself), moving with a firm ratchet ease; the dashes fill and march behind it (the mask's brush transform travels); as it lands the three bars rise one after another from a flat signal. The plate is solid green under a `ShellBackgroundBrush` layer (this theme has no `ScrimBrush`) held at 0.3. **Running:** dashes full and still, frame breathes 0.7 to 1, the bars dip in turn like a live signal (2.6s); the plate's scrim breathes 0.2 to 0.08 (black label on green: 7.0:1 launching, 8.6:1 running at worst). **Hover on RUNNING:** the label turns to Cancel and a 0.22 scrim fades in; the yellow hover plate, the cyan and red glitch ghosts and the slice are off while launching or running, and the hover binding is `Self`. List view rows take the yellow `SelectedBrush` like the details rows (they were cyan). The running layer sits above the selection layers, so it stays visible on a selected item. |
| `GridViewItemTemplate` (+ `GridTileButton`) | Cover hover controls as 48x40 cut-corner slabs with solid glyphs (`IconPlay` bar and triangle, `IconInfo` cut-corner box with a square-cut i, `IconDownload` block arrow over a cut base, drawn in `Media.xaml`); shade fades in, buttons rise 10px and scale 0.86 to 1, Info 60ms after Play; hover flashes the slab yellow (0.08s, black glyph) with a stepped cyan ghost outline |
| `PlayButton` | Solid yellow CTA with a cut corner. Hover: brighter plate in 0.1s plus a glitch burst (stepped cyan and red ghosts, a 7px yellow slice, label shake) every 3s while hovered; leaving fades in 0.2s; pressed is its own plate |
| `PropertyItemButton`, `WindowBarButton`, `HighlightBorder` | Yellow text links and square chips |
| `FilterPanelView`, `ExplorerPanel` | Red hairline rows, red section headers |

## Deviations

- Yellow is the franchise yellow, not an in-game menu colour (those are red and cyan, RESEARCH.md -> In-game menus). It is kept on purpose for selection and Play only.
- Rajdhani and Orbitron are bundled in `src/Typography/` (packing skips `Fonts/`), so Playnite and the previews draw the same faces.
- Cut corners are a single 8px triangle drawn in the surface brush on a few elements, not a full chamfer on every control.
- No `SliderTrackBrush` or `ProgressBarForegroundBrush` is defined: the slider rail uses `ProgressBarTrackBrush` and the progress fill uses `GlyphBrush`.
- The indeterminate `ProgressBar` scales a fill from the left instead of Default's opaque masks, which would show through a translucent rail.
- `OpacityMask` gradients on the banner use the named colors `Black` and `Transparent`: a mask needs a color and `*Color` keys are not allowed.
- Library art is dimmed, not feathered, for the same reason.
- `TrayContextMenu`, `GameMenu` and `GameGroupMenu` are `BasedOn` the theme's ContextMenu; Default ships them as full templates.
- Menu check mark and submenu arrow are drawn with `IconCheck` and `IconSubmenu` instead of Marlett glyphs.
- Menu icons Playnite copies (`AddGameIcon`, ...) stay Playnite's Default icofont ones.

## Not verified yet

- Interactive layer in Playnite at 125% and 150%: Play glitch burst (ghosts draw outside the button box, check nothing clips them), cover hover (ghost 5px outside the item, clipped when grid spacing is tiny), cover buttons, empty state; ThemeModifier recolour of ghosts and scan line (`HighlightGlyphBrush`, `DangerBrush`, `GlyphBrush`). The in-game timings are not sourced (RESEARCH.md -> Motion).

- **Never loaded in Playnite.** Written and built on Linux: the build and package validation pass and every attribute was checked against Default, but WPF never parsed these files. Check `playnite.log` for `XamlParseException` on first start.
- Whether `{Binding Game.PluginId}` for the Steam skeleton matches Playnite's view model (if not, the skeleton never shows).
- Whether `PART_ElemMainMenu` accepts a `Border` style for `MainMenuButton`.
- Cut-corner triangles against the surface brush behind them on hover and selected states.
- Rajdhani and Orbitron rendering and text fit.
- ThemeModifier: palette edits and Edit constants recoloring the restyled controls.
- Screenshots come from the HTML previews, not Playnite.
