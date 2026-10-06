# Blacklist — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the menus of **Need for Speed: Most Wanted (2005)** (EA Black Box, PC). The game has two UI skins and the theme mixes them:

- the **in-game amber skin** (pause, Options, World Map, SMS, GPS dialogs): amber type and glyphs, amber-brown panels, black and amber hazard stripes on header bands and dialog title bars, amber L brackets in the corners of panels and selections, a solid amber plate for the selected button;
- the **frontend street skin** (main menu, options carousel, controls grid): black, warm off-white type, olive-grey hints, `#242424` cells, lowercase blackletter screen titles.

Square corners everywhere. Dark only (the game has no light UI).

**Unofficial fan theme.** No EA assets: the mark, the stripes and the brackets are drawn for this theme, the icons are Phosphor. The game's fonts are not shipped (see Tokens). Need for Speed and Need for Speed: Most Wanted are trademarks of Electronic Arts. Notice: `info/NOTICE-Blacklist.txt`.

The name is the game's Blacklist, the list of 15 rivals the player climbs.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

[`RESEARCH.md`](RESEARCH.md): the wiki captures and video frames the colors were sampled from, the sampled values, the font identification, the Phosphor icon set and the gaps (frame ids not recorded, fonts identified by forum notes and by eye).

## Tokens (`src/tokens.css`)

| Token | Key | Used for |
|-------|-----|----------|
| `mw-page` 0c0a06 | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `NormalBrushDark`, `ScrimBrush` | The darkened city behind the panels |
| `mw-shell` 050301 | `ShellBackgroundBrush`, `InputBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush` | Stripe black: rail, input cells |
| `mw-bar` 17120a | `TopPanelBackgroundBrush`, `PopupBackgroundBrush`, `TooltipBackgroundBrush`, `WindowTitleBackgroundBrush`, `CheckBoxCheckMarkBkBrush` | Header band, menus, title plates |
| `mw-panel` 271f0f | `NormalBrush`, `ButtonBackgroundBrush`, `ExpanderBackgroundBrush`, hover fills | Amber-brown list panel |
| `mw-panel-raised` 33280f | `HoverBrush`, `ButtonHoverBackgroundBrush` | Raised header panel |
| `mw-select` 34240c | `ListItemSelectedBrush`, `MenuItemHoverBrush`, `ToggleButtonCheckedBackgroundBrush` | Selected row or cell |
| `mw-amber` f9ac43 | `GlyphBrush`, `SelectedBrush`, `FocusBrush`, `TabItemIndicatorBrush`, `HeadingForegroundBrush`, `ButtonForegroundBrush`, `MainMenuButtonBackgroundBrush` | Amber type, glyphs and brackets |
| `mw-amber-strong` / `-press` | `PrimaryButtonBackgroundBrush` / `ButtonPressedBackgroundBrush` | The selected Yes plate |
| `mw-stripe-bright` 6e4f20 | `HazardStripeBrush` | Hazard stripes |
| `mw-edge` 4c3818, `mw-rule` 3a2b12 | `NormalBorderBrush`, `InputBorderBrush`, track keys / separators | Panel edges, rails, rules |
| `mw-text` / `-dim` / `-bright` / `mw-ink` | `TextBrush` / `TextBrushDarker` / `SelectedForegroundBrush` / `TextBrushDark` | Off-white body, olive-grey hints, bright selected text, ink on amber |
| `mw-lime`, `mw-heat`, `mw-red` | `PositiveRatingBrush`, `MixedRatingBrush` + `WarningBrush`, `NegativeRatingBrush` + `DangerBrush` | Rap Sheet lime, heat yellow, redline |

Radii are 0 except `CornerRadiusSmall` (2, the key boxes); `CornerRadiusFull` is 0, so no control can turn into an oval. `FrameThickness` is 3 (the 4px bracket stroke at 1080p, scaled by 2/3).

Fonts: `FontFamily` = Eurostile, Eurostile Extended, Bahnschrift, Segoe UI. `HeadingFontFamily` (the blackletter screen titles, used for the game title only) = Old English Text MT (installed with Office), UnifrakturMaguntia, Pirata One, Bahnschrift. Section headings are bold body type in amber, as the amber panel headers.

New vocabulary entries (in `scripts/data/theme-keys.json`): `HazardStripeBrush` (Frames) and `HazardStripesTemplate` (Styles).

## Component spacing (`src/Common.xaml`)

Rows are 48px at 1080p, 32 here: `ButtonPadding` 16,6.5; `InputPadding` 8,6.5; menu, dropdown and list rows 30 tall (`MenuItemPadding` / `ComboBoxItemPadding` 8,5.5,14,5.5; `ListBoxItemPadding` 8,5.5); `MenuPadding` and `ComboBoxDropDownPadding` 4; group box 12 inside under a header band with 10,6 padding; `TooltipPadding` 10,6; `IconSize` 18; `GameBannerHeight` 340; pane widths 340 (details) and 280 (grid).

`Common.xaml` also holds the two pieces of chrome everything reuses: `CornerMarksTemplate` (four 10px L brackets, 3px stroke, in the host's Foreground) and `HazardStripesTemplate` (10px stripes every 20px at 45 degrees in the host's Foreground over its Background, a fixed path clipped to the host, up to 2600 x 64). `FocusVisual` is the brackets 4px outside the control.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px stripe-black rail with a 1px brown edge; the main menu button is the amber icon block of the amber panel headers (44 x 40, ink glyph), a 6px hazard band under it; items 44 x 40 with 16px olive glyphs (a fixed 14,12 plate padding and no `IconPadding`, so the 16 x 16 content area never collapses), the current one amber inside a 32px bracket box |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 56px header band closed by a 6px hazard band (hidden with "panel separators"); 260 x 32 search cell; glyph buttons, olive at rest, amber in brackets when on |
| `DerivedStyles/MainWindowStyle.xaml` | 44 x 32 window buttons, amber on hover, close hovers redline red |
| `DerivedStyles/StandardWindowStyle.xaml` | Dialogs: a 30px hazard-striped title bar with the title and the caption buttons on dark plates |
| `Views/Library.xaml` | Library art under the page color at 72% and a vignette |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | The World Map's list panel: amber-brown fill, bold amber field labels |

## Game page

Skeleton and metadata pane as in `../AGENTS.md`: Steam screenshots in the left column above the description, banner spacer scaled with `HeroArt` through `MathConverter` (100/340 details, 72/340 grid). Differences: the title is in the blackletter face (33px, no stripe under it); section headings are an 8px amber square bullet and bold amber text; the metadata pane is an amber panel with a 1px brown edge, amber L brackets on its corners and a hazard-striped title band across its top.

## Components

| Playnite file | Most Wanted element |
|---------------|---------------------|
| Button, ToggleButton, PlayButton | GPS dialog Yes / No: panel fill and bold amber type; hover adds the brackets; pressed and default are the amber plate with ink |
| TextBox, PasswordBox, ComboBox, SearchBox | Frontend controls cell: black with a brown edge; amber edge and brackets while focused |
| CheckBox, RadioButton | Square boxes; checked is the amber plate with an ink tick; the radio is a square with an amber square (nothing in the game is round) |
| Slider | Video options: 4px rail, amber fill, an off-white 6 x 18 bar as thumb |
| ProgressBar, ScrollViewer | Amber fill on the brown rail; 6px amber scroll thumb on a 2px rail line |
| Menu, ContextMenu, ComboBox items, ListBox, DetailsViewItemStyle | SMS inbox / list panel: amber labels in menus, the selected row darker with bright text and a 3px amber bar |
| TabControl | Panel header switch: bold olive titles, the current one amber over a 3px amber bar |
| GroupBox | Dialog: hazard-striped title bar with the title on a dark plate, amber-brown body |
| GridViewItemStyle, GridViewItemTemplate | Main menu carousel: amber brackets around the selected cover; Play and Info as 40px plates |
| ToolTip | Prompt-bar plate with a 3px amber tab |

## Previews

`art/preview-details.html` and `art/preview-settings.html` are 1280x720 HTML replicas (colors as `var(--mw-*)` from `src/tokens.css`, the XAML's sizes and chrome), generated by `art/previews.py` (icons are read from `src/Media.xaml`, no network) and rendered to `art/screenshot-details.png` and `art/screenshot-settings.png` by `.\scripts\take-screenshots.ps1 -Extension blacklist`. They are not Playnite captures. The details view draws the top bar in `Views/TopPanel.xaml` order (search, icon-only view switches and list tools, filter, notifications); the settings preview is Playnite's Settings window (title bar, section tree, Appearance / General page, Save then Cancel). The action row is Play (amber plate, text) with More and Edit as equal 40 x 40 icon-only squares (Edit always visible); ComboBox values keep 30px clear for the chevron. Sample game, studio and settings labels are fictional or Playnite's own.

Motifs drawn: black and amber hazard stripes (header band, title bars, group headers, the pane title); amber L brackets (current rail and top-bar item, hovered buttons, focus, the metadata pane); the 3px amber bar and dark fill of the selected row; the blackletter game title (33px); the solid amber plate with dark ink (Play, Save).

Stand-in fonts (bundled, `scripts/data/fonts.json`): Eurostile is drawn with Orbitron (wider than the real face, so long labels run wider than in the game); Old English Text MT with UnifrakturMaguntia (added for this theme, OFL); Bahnschrift and Segoe UI never show because the first names resolve. Pirata One, the third title fallback, is not named in the previews.

## Deviations

- No grunge, ink splatter or graffiti textures, and no olive/sepia color grading of the library art (WPF has no cheap grading).
- The blackletter screen titles are lowercase in the game; WPF cannot lowercase bound text, so game titles keep their case.
- The game's amber panels are translucent over the moving city; here they are flattened onto the near-black page.
- Menus print labels in amber as the amber skin does; Playnite's PNG menu icons stay olive-grey.
- No button prompt bar (Playnite has no such strip); its hazard tail appears on the dialog title bar and under the top bar.

## Not verified yet

- Everything in a real Playnite: the build and validation pass on Linux, but the theme has not been run in the app.
- Hazard stripes on hosts taller than 64px or wider than 2600px (they stop there).
- Bracket placement around covers with small item spacing (the brackets sit 6px outside the tile).
- Sidebar at Top, Bottom and Right.
- Add-on sidebar icons (not just Library and Statistics) are visible at 16 x 16 in the rail.
- The Settings tree (`TreeView`) is Playnite's template recolored through the palette; the preview draws its selected node as the select fill without the amber bar.
