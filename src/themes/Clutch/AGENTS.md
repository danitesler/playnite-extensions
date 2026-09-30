# Clutch — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Counter-Strike 2 main menu** (dark only; the game has no light mode): translucent black panels over the game's art, `#cccccc` text, one pale blue (`selectedNavColor` `#82D8FF`) for the selected tab and focus, a green GO button, 64px navbar with uppercase tabs split by thin rules, map-tile covers.

**Unofficial fan theme.** Not affiliated with or endorsed by Valve. No Valve logos, icons, fonts, images or game files are included (see `info/NOTICE-Clutch.txt`). The crosshair mark is hand-drawn.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Tokens and component values | The game's Panorama style sheets, `game/csgo/pak01_dir/panorama/styles/*.css` (`csgostyles.css`, `mainmenu.css`, `mainmenu_play.css`, `popups/*.css`, `settings/*.css`, `tooltips.css`, `context_menu.css`), as tracked by **SteamDatabase/GameTracking-CS2** (fetched 2026-09-30). Values were read and rewritten as plain numbers in `src/tokens.css`, each with the selector it came from; no file was copied. |
| Icons | **Material Symbols Sharp**, filled (Apache-2.0, `info/LICENSE-material-symbols.txt`), the closest open set to the game's solid square-cut menu glyphs. Geometries in `src/Media.xaml` (shifted to a 0..960 grid), menu PNGs in `src/Images/Material/`. Jobs in `icons.json`. |
| Crosshair | Original: five rectangles in `src/Media.xaml` (`IconMainMenu`) and `art/mark.svg` (add-on tile). |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

The game's fonts (Stratum2, Noto Sans) are not bundled. Body text is Segoe UI; headings, tabs and the GO label use **Bahnschrift** (ships with Windows 10+), the nearest condensed DIN-like face to Stratum2.

## Tokens

`src/tokens.css` keeps the game's `@define` names verbatim (`baseText`, `selectedNavColor`, ...) and names the rest after their selector. `Constants.template.xaml` maps them:

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `news-text` | `#dddddd` | `TextColor` / `TextBrush` | body text |
| `popup-title-text` | `rgb(151,151,151)` | `TextColorDarker` / `TextBrushDarker` | captions, idle tabs and icons |
| `baseText` | `#cccccc` | `CheckBoxBorderBrush`, `MainMenuButtonForegroundBrush`, `PropertyItemForegroundBrush` | control edges, rail glyphs |
| `selectedNavColor` | `#82D8FF` | `GlyphColor`, `FocusBrush`, `TabItemIndicatorBrush`, `SelectedForegroundBrush` | selected tab text, links, checks, focus |
| `content-tab-selected` | `#82d7ff1a` | `SelectedBrush`, `ListItemSelectedBrush`, `ToggleButtonCheckedBackgroundBrush` | selected tab and row wash |
| `content-container` | black 75% | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `GameOverviewBackgroundBrush` | navbar, rail, game page, side panels |
| `contentPanelBackground` | `rgba(20,20,20,0.4)` | `ContentBackgroundBrush` | library layer over the art |
| `content-tabs` | black 25% | `TabControlHeaderBackgroundBrush`, `ExpanderBackgroundBrush` | tab strips |
| `contextMenuBackground` | `rgb(38,38,38)` | `MainColor`, `PopupBackgroundColor` | menus, dropdowns |
| `popup-panel-dark` | `#1b1b1b` | `MainColorDark`, `WindowBackgourndBrush` | window base, dialogs |
| `popup-border` | `rgb(65,65,65)` | `PopupBorderColor` | 1px popup edge |
| `popupbutton-hover` / `navbar-iconbtn-hover` / `popupbutton-active` | white 5% / white 10% / `#00000030` | `ButtonBackgroundBrush`, `ListItemHoverBrush` / `HoverBrush`, `ButtonHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` | button plates |
| `contextmenu-item-hover` | `#00000080` | `MenuItemHoverBrush` | menu rows (faded right through a mask) |
| `textentry-*` | edge `rgb(75,75,75)`, hover `#828282`, fill black 25% | `Input*Brush`, `NormalBorderBrush` | inputs, lists |
| `go-*` | text `rgb(85,228,20)`, plate `rgba(9,49,9,0.65)`, edge `rgba(9,219,9,0.34)`, glow `rgba(6,141,6,0.77)` | `PrimaryButton*Brush`, `PrimaryButtonBorderBrush`, `PrimaryButtonGlowBrush` | GO / Play |
| `maptile-selected` / `maptile-hover` | white 85% / white 40% | `GridViewItemSelectedBorderBrush` / `GridViewItemHoverBorderBrush` | cover edges |
| `navbar-separator` | white 30% | `TopPanelSeparatorBrush` | rules between the view tabs |
| `tooltip-short` / edge / text | `#1e2d3d` / lighter / `#c8c8c8` | `TooltipBackgroundBrush`, `TooltipBorderBrush`, `TooltipForegroundBrush` | tooltips |
| `settings-section-title` | `rgba(222,222,222,0.4)` | `HeadingForegroundBrush` | uppercase section titles |
| `negativeColor`, `warningColor`, `xpshop-green` | `#DB4437`, `#b1af2d`, `#46C786` | `DangerBrush`, `WarningBrush`, `NegativeRatingBrush` / `MixedRatingBrush`, `DataChangeNotifColor` / `PositiveRatingBrush` | close hover, ratings |
| `btnBorderRadius`, `radius-small`, `radius-large` | 3 / 2 / 5 px | `ControlCornerRadius` / `CornerRadiusSmall` / `CornerRadiusLarge` | buttons / inputs, thumbs / tooltips |

Library art: `Views/Library.xaml` lays a black scrim over it with the game's menu vignette (`#DD` at the top fading out by 25%, `#94` over the bottom 15%, `ScrimBrush`).

Type: 12 / 14 / 16 / 20 / 32. `HtmlTextView` reads the Colors of the brushes on its `TextElement.Foreground` and `Tag`, so ThemeModifier brush edits reach the description too.

## Component spacing (`src/Common.xaml`)

| Key | Value | Game rule |
|-----|-------|-----------|
| `ButtonPadding` | 14,7 | `.PopupButton` Label margin 10px 12px 8px, scaled from 1080p |
| `InputPadding` | 8,6 | `TextEntry` padding, 36px tall |
| `MenuPadding` / `MenuItemPadding` | 0,8 / 14,8 | `.ContextMenuBody` padding 8px 0 / Button padding 8px 14px |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,8 / 16,8 | `DropDownMenu` / its Label |
| `ListBoxItemPadding` | 10,6 | content sidebar buttons, 32px rows |
| `GroupBoxHeaderMargin` | 0,0,0,12 | `.SettingsSectionTitleContianer` margin-bottom 12px |
| `TooltipPadding` | 10,8,10,6 | `.ShortTextTooltip #Contents` |
| `IconSize` | 20 | navbar icons 22px |
| `GameBannerHeight` / `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 320 / 300 / 280 | shared game page keys |

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | The main menu navbar: 64px on black 75%. Search at the left; the view switches as uppercase 20px Bahnschrift tabs in the middle (`TopPanelSwitch*ViewTemplate`, text from the item's Title through `StringToUpperCaseConverter`), selected in `selectedNavColor` on its wash; Playnite's two section separators are `Canvas`es, drawn as 1px white-30% rules by an implicit `Canvas` style. Filter (uppercase label), notifications and progress at the right, 150px kept clear for the window buttons. |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 56px icon rail on the navbar color with the crosshair (main menu) on top; 40px plates, selected = wash + blue glyph. Top/bottom docking: a 64px strip where view items become uppercase tabs. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons (Material window icons), red close hover, 64px caption height. |
| `Views/MainWindow.xaml` | Default layout, notifications slide in from the right. |
| `Views/Library.xaml` | Background art over both rows with the menu vignette; library layer at `rgba(20,20,20,0.4)`. |

## Game page

Follows the shared skeleton. Differences:

- Header: name in Bahnschrift bold 32px (Playnite sets its text, so it keeps its case); actions at the **right** of the title in the details view (GO button, then square Options and edit buttons), under the title in the grid panel.
- Section titles (Description, Notes, Steam screenshots) are the game's settings section titles: uppercase Bahnschrift, 40% white, 1px rule under them. Uppercasing goes through a `ContentControl` whose inline `DataTemplate` runs `StringToUpperCaseConverter` on the `LOC` string.
- Metadata pane on a black 75% panel with 3px corners; in the details view the cover sits above it. Rhythm: 12px around group rules, 6px around fields, caption column 128px (details), caption above value (grid).
- Banner scrim: the map tile gradient (`.map-selection-btn__gradient`, black to 70% at the bottom) in `ScrimBrush`.
- The two views share every block (banner, section titles, metadata groups); change them in pairs.

## Components

| Playnite file | Game component |
|---------------|----------------|
| `DefaultControls/Button.xaml`, `RepeatButton.xaml`, `ToggleButton.xaml` | `.PopupButton`: white 5% plate, 3px corners, uppercase string content; `IsDefault` buttons take the GO colors |
| `DerivedStyles/PlayButton.xaml` | GO button (`.play-menu__playbtn`): green plate and edge, bold uppercase green label, side bars with a green glow (opacity-masked, stronger on hover) |
| `DefaultControls/TabControl.xaml` | content navbar (`.content-navbar__tabs`): black 25% strip, uppercase Bahnschrift tabs, selected wash + blue text |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `CustomControls/SearchBox.xaml` | `TextEntry`: 1px `rgb(75,75,75)` edge, 2px corners, dark fill, blue edge on focus |
| `DefaultControls/ComboBox.xaml` | `DropDown` + `DropDownMenu`, rows shaded black-to-clear on hover |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | `.ContextMenuBody`: `rgb(38,38,38)`, 1px popup edge, 8px/14px rows, hover shade faded right |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | `.TickBox` / `.RadioBox` without the bevel: 16px, 1.5px `#cccccc` edge, blue when checked |
| `DefaultControls/Slider.xaml`, `ProgressBar.xaml` | settings slider (thin track, grey fill, block thumb); XP-style bar with a gradient fill |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | `VerticalScrollBar`: no track or arrows, 6px white-16% thumb on a 12px lane |
| `DefaultControls/ToolTip.xaml` | `.ShortTextTooltip`: navy `#1e2d3d`, 5px corners |
| `DefaultControls/GroupBox.xaml` | settings section: title only, no card |
| `DefaultControls/ListBox.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml` | list rows: hover wash, selected wash + blue text (+ 2px bar in the game list) |
| `DerivedStyles/GridViewItemStyle.xaml` | map tile: square, 2px white-40% edge on hover, 4px white-85% edge when selected |
| `DerivedStyles/PropertyItemButton.xaml` | links in `selectedNavColor`; chips as small popup buttons |

## Deviations

- **No box-shadow**: the GO glow is a green rectangle faded through an `OpacityMask`, not a blur.
- **Fonts**: Bahnschrift and Segoe UI stand in for Stratum2 and Noto Sans; Playnite also applies the user's font setting over `FontFamily`.
- **Map tiles** in the game zoom 2% on hover; WPF tiles get a 40% white edge instead (a scale transform on hundreds of covers costs too much).
- **Grid side panel** keeps the shared two-column layout; at Playnite's default 350px panel width the description column gets narrow, as in the other themes here.
- **List view column headers** keep Playnite's Default header style (not restyled).

## Not verified yet

Seen running (Playnite 10.60 under Wine, stand-in fonts): details, grid (with side panel), list, main menu. Not yet checked on Windows: settings tabs and group boxes, game edit dialog, top panel dropdowns, filter panel, notifications, progress dialog, the sidebar at top/bottom/right, ThemeModifier edits.
