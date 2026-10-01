# Medallion — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of **The Witcher 3: Wild Hunt main menu** and the menus that share its look (pause, settings, journal), patch 1.32 / next-gen layout, dark only. The main menu is the model: a near-black band on the left with a rough brush edge, the logo on top of it, centered uppercase DIN items in grey (icons here), and a thin double frame with notched corners around the selected item. The rest stays minimal: tone on black, brown hairlines, one warm family (taupe, amber, orange) for headings and selection.

**Unofficial fan theme.** Not affiliated with or endorsed by CD PROJEKT RED. No game logos, icons, fonts, images or files are included (see `info/NOTICE-Medallion.txt`). The medallion mark (`art/mark.svg`, `IconMainMenu`), the brush edge and the double frame are drawn for this theme.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Colors and sizes | Sampled pixel by pixel from 3840x2160 PC captures of patch 1.32 hosted by interfaceingame.com (main menu, pause, graphics, quests, inventory, character), halved to 1080p; JPEG, so within 2 to 3 per channel. Logo red and frame line widths were re-sampled from the same main menu and graphics captures. Each value in `src/tokens.css` names the screen and element it comes from; the few estimates say why. |
| Font | The game's UI font is PF DIN (`tw3pfdin`, `tw3pfdinb`, per Nexus mod pages), one face on every screen. Not bundled. **Bahnschrift** (Windows' DIN 1451) stands in. |
| Icons | **Phosphor Icons, Light** (MIT, `info/LICENSE-phosphor.txt`), the closest open set to the game's thin engraved glyphs. Paths from `phosphor-icons/core` `assets/light`, kept on their 256 grid in `src/Media.xaml`. Playnite's menu icons keep its icofont glyphs. |
| Mark | Original: two rings and a wolf head of straight cuts, `art/mark.svg` (add-on tile) and `IconMainMenu`. |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

Next-gen 4.0 added main menu items but no restyle that we could find. Pre-1.20 (2015) inventory and journal screens looked different and were not used.

## Tokens

`src/tokens.css` names each value after its screen and element. `Constants.template.xaml` maps them:

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `text-label` | `#adadad` | `TextColor` / `TextBrush` | text (settings labels) |
| `text-subtitle` | `#7f7f7f` | `TextColorDarker` | captions, not installed games |
| `text-active` | `#ffffff` | `ButtonForegroundBrush`, `SelectedForegroundBrush` | hovered and current items |
| `menu-item` | `#979797` | `SidebarItemForegroundBrush` | menu band items, header row icons and tabs at rest |
| `accent-bar` | `#d07201` | `GlyphColor`, `PrimaryButtonGlowBrush` | the bar beside a selected row, checks, Play hover frame |
| `amber-wash` | `#593a04` | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `PrimaryButtonHoverBackgroundBrush` | selection wash, always faded left to right through a mask |
| `frame-focus` | `#c6c6c6` | `FocusBrush`, `GridViewItemSelectedBorderBrush` | the light double frame (current item, focus, selected cover) |
| `frame-hover` | `#686868` | `FrameHoverBrush`, `InputHoverBorderBrush`, `GridViewItemHoverBorderBrush` | frame under the pointer |
| `frame-brown` | `#44362d` | `NormalBorderBrush`, `PopupBorderColor`, `ButtonBorderBrush`, `InputBorderBrush`, `FrameBrush`, `WindowPanelSeparatorColor`, `TopPanelSeparatorBrush` | static frames, rules, popup edges |
| `frame-faint` | `#231c16` | `PanelSeparatorColor`, `MenuSeparatorBrush` | panel edges |
| `scene-black` / `menu-band` / `panel` / `prompt-plate` / `settings-row` / `keycap` | `#000` / `#020202` / `#070707` / `#080808` / `#0c0c0c` / `#191919` | `WindowBackgourndBrush`, `GameOverviewBackgroundBrush` / `ShellBackgroundBrush` / `MainColorDark`, `PopupBackgroundColor`, `ExpanderBackgroundBrush` / `ButtonBackgroundBrush`, `InputBackgroundBrush` / `MainColor`, `TooltipBackgroundBrush` / `ButtonPressedBackgroundBrush` | surfaces |
| `row-strip` | `#1e1915` | `SlotBorderBrush` | 5px strip on game list rows |
| `quest-frame` / `quest-fill` / `category-light` | `#9a6020` / `#1b1505` / `#ede0cf` | `PrimaryButtonBorderBrush` / `PrimaryButtonBackgroundBrush` / `PrimaryButtonForegroundBrush` | Play (selected quest header) |
| `category-closed` | `#a18869` | `HeadingForegroundBrush`, scroll thumb hover | section headings |
| `page-dot` | `#a67f3e` | `TabItemIndicatorBrush` | dot under the current view and tab |
| `scroll-thumb`, `slider-thumb`, `slider-track` | `#5e4d43`, `#a9a5a4`, `#080808` | scroll, slider and progress keys | controls |
| `logo-red` | `#c81820` | `DangerBrush`, `NegativeRatingBrush` | close in dialogs, notification count |
| `tracked` | `#fc9700` | `WarningBrush`, `DataChangeNotifColor` | active filter, update icon |

Radii: 0 everywhere (`ControlCornerRadius`, `CornerRadiusLarge`); 2px pills only for the slider and scroll thumbs (`CornerRadiusSmall`, `CornerRadiusFull`). Type: 12 / 14 / 16 / 20 / 32,  Library art: `Views/Library.xaml` shades it 65% black beside the band easing to 35%, black over the bottom fifth.

Shared keys added to `scripts/data/theme-keys.json` for this theme: `DoubleFrameTemplate`, `FrameHoverBrush`, `SidebarItemForegroundBrush`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Game measure (1080p) |
|-----|-------|----------------------|
| `ButtonPadding` | 18,8 | prompt plate, 32px tall at 14px type |
| `InputPadding` | 10,7 | graphics preset field, 34px tall |
| `MenuPadding` / `MenuItemPadding` | 1,6 / 16,8 | journal list rows, label about 20px in, x0.8 |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 1,4 / 14,8 | same panel |
| `ListBoxItemPadding` | 14,7 | settings row label 26px in from the strip, x0.55 |
| `GroupBoxHeaderMargin` | 0,0,0,12 | section name, rule, list |
| `TooltipPadding` | 12,8 | |
| `IconSize` | 20 | inventory filter icons, about 22px |
| `GameBannerHeight` / `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 340 / 300 / 280 | shared game page keys |

The double frame (`DoubleFrameTemplate`): two 1px lines 2px apart, the outer a plain rectangle, the inner stepped 4px inward at each corner, as sampled from the selected settings row (2px lines with a 4px gap at 4K).

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | The main menu band as an icon rail: 72px of `#020202`, the medallion (40px, `PART_ElemMainMenu`) at the top with a 32px brown rule under it, then the items. The right edge is two jagged polygons in the band color (outer one at half strength) hanging 20px over the page. Right docking flips the edge; top/bottom: a 56px strip, no edge, 150px clear for the caption buttons. |
| `CustomControls/SidebarItem.xaml` | Main menu items as icons: 52px squares, 24px icon, grey at rest, white with a grey double frame under the pointer, white in the light double frame when current; the title is the tooltip. |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | Header row on the bare page, 64px: search field (prompt plate, brown line) at the left; view switches centered as uppercase screen names with the gold page dot under the current one, between two small brown arrows (Playnite's separators); grey icons turning white; filter turns tracked orange while active. |
| `DerivedStyles/MainWindowStyle.xaml` | Close is the game's close box (X in the brown double frame, light on hover); minimize and maximize are bare glyphs. Caption height 64. |
| `Views/Library.xaml` | Background art behind the header row, shaded like the game's backdrop; library on black at 55%, 16px in from the band. |

## Game page

Follows the shared skeleton. Differences: the page is black (`GameOverviewBackgroundBrush`), the banner darkens to 80% toward the title; the name is regular DIN in label grey; Play is the selected quest header (gold double frame on dark amber, orange bar at its left), the other actions brown-framed boxes; section titles are the journal's category headers (uppercase taupe, brown rule); the metadata pane is a journal panel (`#070707`, faint brown edge) with brown group rules. The two views share every block; change them in pairs.

## Components

| Playnite file | Game element |
|---------------|--------------|
| `DefaultControls/Button.xaml`, `ToggleButton.xaml` | framed box: prompt plate in the brown double frame, uppercase label; frame light on hover (toggle: grey on hover, light when checked); default buttons as Play |
| `DefaultControls/RepeatButton.xaml` | small plate with one brown line |
| `DerivedStyles/PlayButton.xaml` | selected quest header |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `ComboBox.xaml`, `CustomControls/SearchBox.xaml`, `DerivedStyles/HighlightBorder.xaml` | graphics preset field: 1px brown line, grey on hover, light with focus |
| `DefaultControls/ComboBox.xaml` (list), `ContextMenu.xaml`, `Menu.xaml`, `ListBox.xaml` | journal panel and list rows: amber wash fading right plus the orange bar on hover or selection |
| `DerivedStyles/DetailsViewItemStyle.xaml` | settings rows: `#0c0c0c` strips with a 2px gap and the 5px brown strip; selected = amber wash + orange bar |
| `DerivedStyles/GridViewItemStyle.xaml` | item slot: grey frame on hover, light double frame when selected (6px outside the cover) |
| `DefaultControls/TabControl.xaml` | graphics preset row / journal header: uppercase tabs, current white with the page dot, brown rule under the strip |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | objective box: square, orange check |
| `DefaultControls/Slider.xaml`, `ProgressBar.xaml` | settings slider (dark framed track, light pill) and the XP bar |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | settings scroll thumb, no track |
| `DefaultControls/GroupBox.xaml` | section name with rule |
| `DerivedStyles/PropertyItemButton.xaml` | values in label grey turning white; chips as small key caps |

## Deviations

- **Font**: Bahnschrift stands in for PF DIN; Playnite also applies the user's font setting over `FontFamily`.
- **The menu band is a 72px icon rail**, not the game's fifth of the screen with text items, so the library keeps its room; the frames and colors of the game's items carry over to the icons.
- **Brush edge** is a jagged polygon, not a painted texture; it stretches with the window height.
- **No scene**: the game's animated 3D backdrop is the selected game's background art.
- **Journal header arrows**: Playnite's two separators get the same style, so both arrows point right; the game's pair points outward.
- **Selection wash** is the amber color faded through an `OpacityMask` (ThemeModifier edits the color).

## Not verified yet

Built and statically checked only (cloud session; Playnite was not started). Not yet seen running: everything. Priority checks on Windows: the brush edge drawing over the content beside the band, the double frame at 125% and 150% DPI (1px lines), the view switch dot binding (`IsToggled` through `BooleanToVisibilityConverter`), the sidebar at top/bottom/right, settings tabs, the game edit dialog, ThemeModifier edits.

## Preview and screenshots

`art/preview-grid.html` / `.png`: approximate HTML replica of the grid view (stand-in font, placeholder covers), not a Playnite capture. Real screenshots: `.\scripts\take-screenshots.ps1 -Extension medallion` on Windows.
