# Uplink — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) taking inspiration from the **StarCraft II** menus as they have looked since patch 3.0 (the "glue" screens: a navigation bar across the top with a sub navigation strip under it). Dark only: deep space navy, pale blue text, one lit blue accent, plates with cut corners, blue glows and a bright line under whatever is current. Unofficial and standalone: every file it ships lives in this folder, and no Blizzard asset is in it (`info/NOTICE-Uplink.txt`). Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`); the theme's own token names stay in `tokens.css`.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

**Intended layout: the sidebar on the left** (Playnite's default, like the other themes here): the game's navigation bar turned into a 44px icon rail, with the top panel as the sub navigation strip. At the top it becomes the game's horizontal tab bar with uppercase titles; right and bottom work too.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Type: body `Segoe UI`; `HeadingFontFamily` is `./Typography/#Orbitron`, then `Orbitron, Eurostile Extended, Microgramma D Extended, Eurostile, Bahnschrift SemiBold, Bahnschrift, Segoe UI` (the game sets navigation and headings in Eurostile Extended caps; Orbitron Regular, SemiBold and Bold are bundled in `src/Typography/` as its stand-in). Sizes 12 / 14 / 16 / 21 / 28. Corners are square (`ControlCornerRadius` 0); cut corners are drawn by `ChamferTemplate`.

New shared key this theme added to `scripts/data/theme-keys.json`: **`ChamferTemplate`**, a ControlTemplate for a plain `Control` that draws a plate with 6px cut corners from the host's `Background` and a 1px edge from its `BorderBrush`: `<Control Template="{DynamicResource ChamferTemplate}" Background="..." BorderBrush="..." />` behind the content, hit testing off.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | Behavior |
|------|----------|
| `Views/Sidebar.xaml` | **Left/right (intended):** a 44px rail, `ShellBackgroundBrush` with the glow rising toward the 1px line on the library side; the home button (`MainMenuButton`, `PART_ElemMainMenu`, 44px wide plate with a hexagon mark) boxed at the start. **Top:** the game's horizontal navigation bar, 56px, glow toward the bottom line, 146px kept clear for the caption buttons. **Bottom:** a strip. |
| `CustomControls/SidebarItem.xaml` | **Top/bottom:** icon + title in uppercase heading sans (15px, Playnite's `StringToUpperCaseConverter`), 20px either side, short 1px dividers; `TextBrushDarker` at rest; hover and current = white over a blue glow (`FrameInnerBrush`) rising from the bar's bottom edge; current adds a 2px beam (`TabItemIndicatorBrush`) that fades out at both ends. **Rails:** icon only, 44x40, glow from the library-side edge and a 2px beam there; title as tooltip. |
| `Views/TopPanel.xaml` | The sub navigation strip: 48px on `TopPanelBackgroundBrush`, 1px line under it; search (320px) left; view, sort, filter, notification icons right, `TextBrushDarker`, light blue on a glow wash when on. Keeps 146px clear for the caption buttons only when it is the topmost bar (sidebar not at the top). |
| `DerivedStyles/MainWindowStyle.xaml` | Caption buttons 46x40, 8px from the top with the sidebar at the top (centered on the 56px bar), 4px otherwise; red close hover. |
| `Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml`, `SearchView.xaml` | Library layer on `deck`, game art only while Playnite's window background setting is on, at full strength with Playnite's own darken and blur (repo rule "Window background"); side panels on `hull`. The art layer spans the whole window, under the top bar and the icon rail (its margin reaches 44px past the content on a side rail, 56px at the top or bottom); with the setting on, `TopPanel`, `Sidebar` (and its home plate), `Expander` headers and the game pages turn transparent. Scroll bars are already transparent (1px `veil` rail). |


**Settings chrome** (`DefaultControls/TreeView.xaml`, `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml`): the Settings section list is the glue menus' sub navigation list, 30px rows in the body face, each a `ChamferTemplate` plate (the game's cut corners). Hover is the veil plate on the blue panel edge with a quarter-strength beam; selected is the glow-wash plate on the lit edge with the full 2px beam (`TabItemIndicatorBrush`) lit under it, fading out at both ends, and a white label. Children sit under a 1px blue guide. The title band is 40px: the navigation gradient lifted by a blue glow from its lower edge, the title on a chamfered sub navigation plate with the lit beam under it, a status tick ruler and the ghosted hex mark at the right end, and a blue panel edge closing the band; caption buttons are 44x40.

## Game page

Follows the shared skeleton. Title in the heading sans (31px), Play 180x40, More and Edit icon-only 40x40 squares. Section headings (`HeadingTextBlock`) are the heading sans in `GlyphBrush` over the lit divider (`DividerTemplate`: a 28x3 bar and a 1px line fading right). The cover in the details header sits in a 1px frame with the lit corner ticks.

Empty state (no game selected): both overviews hide the page and show an empty portrait slot (`IconMainMenu` in lit corner ticks, glow breathing on the menus' 2.4s loop), `LOCErrorNoGameSelected` in the heading sans and a rule with the sub navigation's highlight running along it; loops run only while it shows. The page root is opaque (`ContentBackgroundBrush`) so the banner can fade to it with a plain gradient; the library art no longer shows behind the game page.

## Components

| Playnite file | Game component |
|---------------|----------------|
| `PlayButton` | the lit glue button: hover fades a brighter plate in over 0.4s (the nav's hover fade), the bottom glow breathes on the 2.4s selected-tab loop and a streak runs along the beam while hovered; leaving fades back over 0.4s; pressed is its own plate |
| `GridViewItemStyle` | selected = static 2px frame, glow and ticks; hover = animated light blue edge and glow fading in over 0.4s, ticks closing in, glow breathing; no setters on animated parts |
| Running game (`RunningIndicatorBrush` = `green`, ColorTerranLabel) | Terran green with the hexagon pip as the source of a radar ping. **Launching** (1.8s loop, 1.25s travel, ease-out): a soft ring (`RadialGradientBrush` mask whose stops travel) expands from the pip across the row, cover or chamfered Play plate, a segmented foot (tiled 5px cells, SC2 build-bar style) fills in step, the hexagon ring turns one 60 degree step per ping and its core flares as the ping leaves. **Running:** frame, tint, ring and core breathe over 3.2s like a powered pylon; the foot stays full. Slab: chamfered plate in Terran green under a light `RunningBreath` scrim (`ShellBackgroundBrush`, 0.1-0.22; the theme has no `ScrimBrush`) with dark ink label (8.2:1 worst); Cancel only on RUNNING + hover of the button (`Self`), hover plate, streak and glow lift off while launching or running. |
| `GridViewItemTemplate` (+ `GridTileButton`) | cover hover controls as 44x40 chamfered plates (`IconPlay`, `IconInfo`, `IconDownload`, drawn in the theme's angular stroke set, generated in `art/icons.py`); shade fades in, buttons rise 10px and scale 0.86 to 1, Info 60ms after Play; hover lights the plate (0.3s) with the glow and beam |

The rest (TextBox, PasswordBox, ScrollViewer, ProgressBar, TabControl, Expander, ListBox, group styles, property chips, window bar buttons) keeps the square-cut structure from the Default files, colored through the keys above.

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations

- **Uppercase:** WPF has no text-transform. Navigation titles and string button labels go through Playnite's `StringToUpperCaseConverter`. Headings from Playnite's `LOC` strings and data-bound text (game title, group names) can't take a converter where they are set from code or through `ObjectToStringConverter`, so they use `Typography.Capitals="AllSmallCaps"`, which shows them as typed with fonts that have no small caps (the bundled Orbitron, most Eurostile builds).
- **No letter-spacing, no blur**: the game's tracked capitals and blurred glass behind the bar are not possible; glows are radial gradients masked onto `FrameInnerBrush`, never `DropShadowEffect`.
- **Not the game's font**: the bundled Orbitron stands in for Eurostile Extended; it is a little wider, so long tab labels run wider than in the game.
- **No hexagon pattern, no 3D scenes**: the bar's animated hex shimmer and the menu backgrounds are game art; the library shows the game's own background art instead.
- Playnite templates this theme does not replace (DataGrid in List view, DatePicker, TreeView, notification panel, add-on views) take the colors, not the chamfers.

## Motion

Source: [`RESEARCH.md`](RESEARCH.md) -> Motion (hover fades 0.4s, selected glow loop 2.4s, sub navigation line highlight, read from the game's UI data). The cover buttons' rise and scale are the shared recipe, not the game's.

## Previews

`art/preview-details.html` and `art/preview-settings.html` replicate the XAML (`scripts/take-screenshots.ps1 -Extension uplink`): the 44px rail with the boxed home plate (22px hexagon) and 44x40 items with a lit beam on the current one, the 48px sub navigation strip, 1px-ruled game rows with a glow wash and light blue bar on the current game, chamfered plates (Play 180x40 in the call-to-action blue, icon-only 40x40 More and Edit 10px apart), and the unboxed Game Details column (heading over the lit divider, 120px caption column in the heading sans beside the values, 1px group rules). Icons are the `Media.xaml` strokes (1.5px, miter joins, flat caps). The heading face is Orbitron, the font the theme bundles in `src/Typography/`; headings show as typed (Orbitron has no small caps, so AllSmallCaps has no effect), button labels are uppercase (`StringToUpperCaseConverter`). The details preview uses `GameBannerHeight` 200 (default 320) so the page fits; the spacer above the title scales with it (`x * 100 / 320`).

## Not verified yet

Hover and empty state in Playnite at 125% and 150% (leftover boxes around the Play glow and the cover glow, masks on the effect layers themselves), ThemeModifier recolour of the new layers (`FrameInnerBrush`, `FocusBrush`, `PrimaryButton*`), the 0.4s fade feel against the game, and the details page now sitting on an opaque `ContentBackgroundBrush`.

Screenshots in `art/` (`screenshot-details.png` and `screenshot-settings.png`) are rendered from `art/preview-details.html` and `art/preview-settings.html` via `take-screenshots.ps1`.

First run, most likely to need a fix: the uppercase converter binding on `SidebarItem` titles; the chamfer plates at small sizes (the 6px corner cells need at least 12px of height); the rail glow and beam on the left, the tab glow and beam with the sidebar at the top and at the bottom; the flipped glow on a right-hand rail; caption buttons over the 56px bar and the 48px strip; `Typography.Capitals` with the installed heading font; and every `[eye]` value in `tokens.css`.
