# Dropzone — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Fortnite lobby and main menus** as of Chapter 6 (2025–2026: the rounded menus Epic introduced with Chapter 5, not the older slanted plates). Dark only; the game has no light mode. Deep navy surfaces, heavy white capitals, a light grey pill for the current tab, blue plates for menus and selection, the yellow PLAY button, cyan labels.

The brief was "follow the game closely, but stay minimal like the other themes": the shapes, colors and layout come from the game; the lobby's busy art, rarity gradients and loud badges are left out.

**Unofficial fan theme.** Not affiliated with or endorsed by Epic Games. No Epic logos, icons, fonts, images or game files are included (see `info/NOTICE-Dropzone.txt`). The parachute mark (`art/mark.svg`) is original.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Colors and measurements | Sampled pixel by pixel from Epic's own screenshots in the Fortnite Creative docs on dev.epicgames.com (fetched 2026-10-01): *Exploring Discover* (lobby with navbar, homebar and rows, Discover rows, island details page), *Let's Play* (lobby, navbar strip, play card with PLAY), *Exploring the Sidebar and Game Menu* (sidebar rail and MENU, settings screen, exit dialog). Each token in `src/tokens.css` names the screenshot and element. Epic publishes no tokens; hover and pressed states are derived and marked so. No image is shipped. |
| Layout notes | The Chapter 5 redesign coverage (Dexerto, Sportskeeda): rounded small icons instead of slanted rectangles, navbar centered at the top, lobby options on the left. |
| Icons | **Material Symbols Rounded**, filled (Apache-2.0, `info/LICENSE-material-symbols.txt`), the closest open set to the game's chunky rounded glyphs. Geometries in `src/Media.xaml` (shifted to a 0..960 grid), menu PNGs in `src/Images/Material/`. Jobs in `icons.json`. |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

The game's font (Burbank Big Condensed) is not free and is not bundled. Body text is Segoe UI; headings, tabs, buttons and titles use **Bahnschrift** (ships with Windows 10+) in Bold with `FontStretch="Condensed"`, the nearest condensed heavy face on every Windows machine.

## Tokens

`src/tokens.css` names each value after the element it was sampled from. `Constants.template.xaml` maps them:

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `text` | `#ffffff` | `TextColor` / `TextBrush`, `SelectedForegroundBrush`, `ButtonForegroundBrush`, `HeadingForegroundBrush` | text, titles |
| `text-muted` | `#9ba3aa` | `TextColorDarker` | settings row labels, secondary text |
| `text-on-light` | `#0f0d1c` | `TextColorDark`, `PrimaryButtonForegroundBrush` | PLAY label, text on the light pill |
| `label-cyan` | `#33daff` | `GlyphColor` / `GlyphBrush` | captions, links, checks, slider hover |
| `icon-blue` | `#33aaff` | `SidebarItemForegroundBrush` | rail glyphs (new shared key) |
| `screen-bg` | `#0e162b` | `WindowBackgourndBrush`, `ScrimBrush` | window, art wash |
| `rail` | `#0e1834` | `MainColorDark`, `ShellBackgroundBrush`, `ExpanderBackgroundBrush` | rail, cards, metadata pane |
| `panel` | `#0c2162` | `PopupBackgroundColor`, `GameOverviewBackgroundBrush` (92%) | menus, game page |
| `menu-bg` / `menu-item` | `#0a2b6a` / `#0840a7` | `MainColor` / `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush` | game menu page and rows |
| `navbar` | `rgba(1,11,30,0.62)` | `TopPanelBackgroundBrush` | the navbar strip |
| `tab-selected` | `#e6e5e5` | `TopPanelItemCheckedBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush` | current view, checked toggles, selected tab and list row |
| `tab-hover` | white 12% | `HoverColor`, `HoverBrush`, `ListItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` | hover washes |
| `tab-dot` | `#f7ff1a` | `TopPanelSeparatorBrush` | navbar dots, notification badge |
| `play` (+ hover, pressed) | `#f7ff1a` | `PrimaryButton*Brush`, `ProgressBarForegroundBrush` | PLAY, default buttons, progress |
| `pill` (+ hover, pressed) | white 22% | `ButtonBackgroundBrush`, `ButtonHover/PressedBackgroundBrush` | pill buttons |
| `blue-button` | `#0055fe` | `PropertyItemHoverBackgroundBrush`, `SliderHoverForegroundBrush` | chip hover, slider fill |
| `chip` / `chip-text` | `#0a3fc7` / `#80d4ff` | `PropertyItemBackgroundBrush` / `PropertyItemForegroundBrush` | slanted tags |
| `tile-ring` | `#ceefff` | `GridViewItemSelectedBorderBrush`, `FocusBrush` | cover focus ring, keyboard focus |
| `slider-track` | `#000033` | `SliderTrackBrush`, `ProgressBarTrackBrush`, `CheckBoxCheckMarkBkBrush` | tracks, box fill |
| `segment-off` | `#4d5466` | `CheckBoxBorderBrush` | box edges |
| `screen-deep` | `#080712` | `TooltipBackgroundBrush`, `TabControlHeaderBackgroundBrush` | tooltips, tab strips |
| `danger` / `success` / `warning` | `#ff4757` / `#5dd48a` / `#f7ff1a` | `DangerBrush`, `WarningBrush`, ratings | |
| `radius-small` / `radius` / `radius-large` / `radius-full` | 4 / 8 / 12 / 999 | `CornerRadiusSmall` / `ControlCornerRadius` / `CornerRadiusLarge` / `CornerRadiusFull` | chips, inputs / navbar pill, menus / tiles, PLAY / pill buttons |

`PanelSeparatorColor` is transparent: the game separates with space, not rules, so the metadata groups and section titles draw no lines.

Type: 12 / 14 / 16 / 22 / 40.

## Component spacing (`src/Common.xaml`)

| Key | Value | Game reference |
|-----|-------|----------------|
| `ButtonPadding` | 16,7 | lobby BACK / CHAT pills, x0.6 |
| `InputPadding` | 10,7 | settings value bars, 36px tall |
| `MenuPadding` / `MenuItemPadding` | 6 / 12,8,14,8 | game menu panel / rows |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 6 / 12,7 | frame-rate list |
| `ListBoxItemPadding` | 10,7 | settings rows |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 0,0,0,16 / 0,0,0,12 | settings sections |
| `TooltipPadding` | 12,8 | island page callout |
| `IconSize` | 20 | navbar icons |
| `GameBannerHeight` / `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 360 / 300 / 280 | shared game page keys |

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | 64px row, transparent. At the left a 44px rounded navy strip (the lobby navbar) with Playnite's icon items and the view switches as Bold condensed capitals (`TopPanelSwitch*ViewTemplate`); the current view is the light grey pill with near-black text; Playnite's two `Canvas` separators become 7px yellow dots. At the right: pill search box, filter, notifications (yellow badge), progress, 150px kept clear for the caption buttons. |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px compact rail in the sidebar navy, menu bars on top, 44x40 items with blue glyphs; the current item is a full-width blue plate with slanted ends (a `Path`, `M0,4 L44,0 L44,36 L0,40 Z`) and a white glyph. Top/bottom: capital tabs, current = light pill. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons, muted glyphs, red close hover, 64px caption height. |
| `Views/Library.xaml` | Background art behind everything under a navy wash (`ScrimBrush`: 90% under the navbar, 60% mid, 95% at the bottom). Library layer transparent. |

## Game page

Follows the shared skeleton, dressed as the island details screen: the banner gets a second, horizontal navy wash from the left (details view), the title is 40px Bold condensed, captions are the label cyan in the heading face Bold, list values are the slanted blue tags, PLAY is 52px tall and 200px wide, More and Edit are 52px round pills. The metadata pane is a 12px-radius card in the rail navy; groups are separated by space only.

## Components

| Playnite file | Game element |
|---------------|--------------|
| `DerivedStyles/PlayButton.xaml` | PLAY / SELECT: flat yellow, 12px corners, heavy dark capitals; hover lightens and adds a 2px yellow halo |
| `DefaultControls/Button.xaml` | lobby pills (EMOTE, BACK, CHAT): white 22% full-radius pills, heavy capitals; default button = PLAY yellow |
| `DefaultControls/ToggleButton.xaml`, `TabControl.xaml` | navbar / settings tab strip: checked = light grey pill |
| `DerivedStyles/GridViewItemStyle.xaml` | Discover tiles: 12px rounded (masked, bitmap cached), hover ring 2px, selected 3px `#ceefff` ring 2px off the tile |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `ListBox.xaml`, `Menu.xaml`, `ContextMenu.xaml` | game menu panel and rows: navy panel, blue plate rows |
| `ComboBox.xaml` | settings value well + Frame Rate Limit list (selected row = light plate) |
| `DerivedStyles/PropertyItemButton.xaml` | island page tags: blue plate skewed 10 degrees, bright edge, bold light-blue text |
| `GroupBox.xaml` | settings section title (DISPLAY): heavy white italic capitals, no rule |
| `ToolTip.xaml` | island page callout: near-black box, light edge |
| `Slider.xaml`, `ProgressBar.xaml` | Brightness bar (navy track, blue fill, white thumb); level bar (yellow) |

## Deviations

- Burbank Big Condensed is replaced by Bahnschrift Bold Condensed.
- Values in chips and the game title keep their own case: Playnite's `StringToUpperCaseConverter` returns an empty string for non-string content, and `PART_TextDisplayName` is filled from code.
- The lobby's 3D scene is the game's background art under a navy wash; no animated scene, no rarity gradients.
- The game shows player level, V-Bucks and an avatar on the navbar's right; here that spot holds Playnite's search, filter and notifications.
- Icons were converted on Linux (paths shifted by a script, PNGs rasterized in Chromium) because `render-icons.ps1` needs WPF; `icons.json` reproduces them on Windows.

## Not verified yet

- Bahnschrift's condensed bold instance is picked by WPF from `FontWeight="Bold"` + `FontStretch="Condensed"`; if WPF falls back to the regular width, tabs and titles will be wider than designed.
- The rounded cover mask (VisualBrush bound to the tile size) at large zoom levels and with "Show grid item background" on.
- The slanted rail plate with add-on sidebar items that bring their own icon sizes.
- Real screenshots: `.\scripts\take-screenshots.ps1 -Extension dropzone` on Windows (the cloud session only has the HTML mockup in `art/`).
