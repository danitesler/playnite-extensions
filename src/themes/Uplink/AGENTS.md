# Uplink — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) taking inspiration from the **StarCraft II** menus as they have looked since patch 3.0 (the "glue" screens: a navigation bar across the top with a sub navigation strip under it). Dark only: deep space navy, pale blue text, one lit blue accent, plates with cut corners, blue glows and a bright line under whatever is current. Unofficial and standalone: every file it ships lives in this folder, and no Blizzard asset is in it (`info/NOTICE-uplink.txt`). Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`); the theme's own token names stay in `tokens.css`.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

**Intended layout: the sidebar on the left** (Playnite's default, like the other themes here): the game's navigation bar turned into a 56px icon rail, with the top panel as the sub navigation strip. At the top it becomes the game's horizontal tab bar with uppercase titles; right and bottom work too.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Type: body `Segoe UI`; `HeadingFontFamily` is `Eurostile Extended, Microgramma D Extended, Eurostile, Bahnschrift SemiBold, Bahnschrift, Segoe UI` (the game sets navigation and headings in Eurostile Extended caps; nothing is bundled, so most machines get Bahnschrift). Sizes 12 / 14 / 16 / 21 / 28. Corners are square (`ControlCornerRadius` 0); cut corners are drawn by `ChamferTemplate`.

New shared key this theme added to `scripts/data/theme-keys.json`: **`ChamferTemplate`**, a ControlTemplate for a plain `Control` that draws a plate with 6px cut corners from the host's `Background` and a 1px edge from its `BorderBrush`: `<Control Template="{DynamicResource ChamferTemplate}" Background="..." BorderBrush="..." />` behind the content, hit testing off.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | Behavior |
|------|----------|
| `Views/Sidebar.xaml` | **Left/right (intended):** a 44px rail, `ShellBackgroundBrush` with the glow rising toward the 1px line on the library side; the home button (`MainMenuButton`, `PART_ElemMainMenu`, 44px wide plate with a hexagon mark) boxed at the start. **Top:** the game's horizontal navigation bar, 56px, glow toward the bottom line, 146px kept clear for the caption buttons. **Bottom:** a strip. |
| `CustomControls/SidebarItem.xaml` | **Top/bottom:** icon + title in uppercase heading sans (15px, Playnite's `StringToUpperCaseConverter`), 20px either side, short 1px dividers; `TextBrushDarker` at rest; hover and current = white over a blue glow (`FrameInnerBrush`) rising from the bar's bottom edge; current adds a 2px beam (`TabItemIndicatorBrush`) that fades out at both ends. **Rails:** icon only, 56x48, glow from the library-side edge and a 2px beam there; title as tooltip. |
| `Views/TopPanel.xaml` | The sub navigation strip: 48px on `TopPanelBackgroundBrush`, 1px line under it; search (320px) left; view, sort, filter, notification icons right, `TextBrushDarker`, light blue on a glow wash when on. Keeps 146px clear for the caption buttons only when it is the topmost bar (sidebar not at the top). |
| `DerivedStyles/MainWindowStyle.xaml` | Caption buttons 46x40, 8px from the top with the sidebar at the top (centered on the 56px bar), 4px otherwise; red close hover. |
| `Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml`, `SearchView.xaml` | Library layer on `deck`, the game's background art feathered in; side panels on `hull`. |

## Game page

Follows the shared skeleton. Title in the heading sans (28px), Play 180x40, the other actions 150x40. Section headings (`HeadingTextBlock`) are the heading sans in `GlyphBrush` over the lit divider (`DividerTemplate`: a 28x3 bar and a 1px line fading right). The cover in the details header sits in a 1px frame with the lit corner ticks.

## Components

The rest (TextBox, PasswordBox, ScrollViewer, ProgressBar, TabControl, Expander, ListBox, group styles, property chips, window bar buttons) keeps the square-cut structure from the Default files, colored through the keys above.

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations

- **Uppercase:** WPF has no text-transform. Navigation titles and string button labels go through Playnite's `StringToUpperCaseConverter`. Headings from Playnite's `LOC` strings and data-bound text (game title, group names) can't take a converter where they are set from code or through `ObjectToStringConverter`, so they use `Typography.Capitals="AllSmallCaps"`, which shows them as typed with fonts that have no small caps (Bahnschrift, most Eurostile builds).
- **No letter-spacing, no blur**: the game's tracked capitals and blurred glass behind the bar are not possible; glows are radial gradients masked onto `FrameInnerBrush`, never `DropShadowEffect`.
- **Not the game's font**: Eurostile Extended is used only if installed. Bahnschrift is narrower, so tabs are shorter than in the game.
- **No hexagon pattern, no 3D scenes**: the bar's animated hex shimmer and the menu backgrounds are game art; the library shows the game's own background art instead.
- Playnite templates this theme does not replace (DataGrid in List view, DatePicker, TreeView, notification panel, add-on views) take the colors, not the chamfers.

## Not verified yet

Screenshots in `art/` (`details.png` and `settings.png`) are rendered from `art/preview-details.html` and `art/preview-settings.html` via `take-screenshots.ps1`.

First run, most likely to need a fix: the uppercase converter binding on `SidebarItem` titles; the chamfer plates at small sizes (the 6px corner cells need at least 12px of height); the rail glow and beam on the left, the tab glow and beam with the sidebar at the top and at the bottom; the flipped glow on a right-hand rail; caption buttons over the 56px bar and the 48px strip; `Typography.Capitals` with the installed heading font; and every `[eye]` value in `tokens.css`.
