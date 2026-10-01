# Heist — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **GTA V pause menu** and its frontend (dark only; the game has no light mode). Its look: square plates of translucent black (`PAUSE_BG`) over the blurred world, white text, the selected row or tab as a solid white plate with black text, an 8px freemode blue bar over the current tab, 38px rows 3px apart, no corners anywhere. It keeps the repo's minimal approach: one accent, one plate color, no textures or glows.

**Unofficial fan theme.** Not affiliated with or endorsed by Rockstar Games or Take-Two Interactive. No Rockstar logos, icons, fonts, images or game files are included (see `info/NOTICE-Heist.txt`). The wanted-star mark is drawn from computed points.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Colours | The game's HUD colour table (`hudcolor.dat`), as documented at docs.fivem.net/docs/game-references/hud-colors (fetched 2026-10-01): `HUD_COLOUR_WHITE` 240,240,240, `GREY` 155,155,155, `RED` 224,50,50, `GREEN` 114,204,114, `YELLOW` 240,200,80, `FREEMODE` 45,110,185, `PAUSE_BG` 0,0,0,186, `PANEL_LIGHT` 0,0,0,77, `PAUSEMAP_TINT` 0,0,0,215, `MENU_*` greys. Verified values. |
| Pause menu layout | Measured from screenshots of ScaleformUI (manups4e/ScaleformUI), which drives the game's own pause menu scaleforms: tabs 38px under an 8px accent bar shown over the selected tab only, 4px between tabs, the content panel 3px under the strip, list rows 38px with 3px gaps, selected = white with black text. Cross-checked against RAGENativeUI's pause menu clone (`TabView.cs`). Measured, so approximate to a pixel or two. |
| Menu metrics | NativeUI (`UIMenu.cs`, `UIMenuItem.cs`) and LemonUI (`NativeMenu.cs`, `ColorSet.cs`): rows 38px, text 8px in, hover tint 20/255 white, slider rail 4,32,57 and fill 57,116,200, disabled text 163,159,148. Read from source. |
| Icons | **Material Symbols Rounded**, filled (Apache-2.0, `info/LICENSE-material-symbols.txt`). `art/icons.py` fetches them and writes the geometries in `src/Media.xaml` (moved onto a 0..960 grid). Playnite's own menu icons keep its icofont glyphs. |
| Star mark | Original: ten computed points (`IconMainMenu` in `src/Media.xaml`, `art/mark.svg` for the add-on tile). |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). The XAML wiring started from this repo's Clutch theme files, which follow the Default files; every visual was redone for this theme. |

The game's fonts (Chalet London, Chalet Comprime Cologne, SignPainter HouseScript, Pricedown) are not bundled. Body text is Segoe UI; titles, tabs, buttons and headers use **Bahnschrift SemiCondensed** (ships with Windows 10+), the closest Windows face to Chalet Comprime.

## Tokens

`src/tokens.css` names the HUD colours `--hud-<name>` (lowercased `HUD_COLOUR_*`) and the menu parts `--pause-*`, `--slider-*`. `Constants.template.xaml` maps them:

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `hud-white` | `#F0F0F0` | `TextColor`, `GlyphColor`, `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `ButtonHoverBackgroundBrush`, `PrimaryButtonBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush` | text, the selected plate |
| `hud-black` | `#000000` | `TextColorDark`, `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush` | text on the white plate |
| `hud-grey` | `#9B9B9B` | `TextColorDarker` | captions, placeholders |
| `pause-plate` (= `PAUSE_BG`) | black 73% | `ButtonBackgroundBrush`, `ExpanderBackgroundBrush`, `TabControlHeaderBackgroundBrush`, `GridItemBackgroundColor`, `PropertyItemBackgroundBrush` | every plate: tabs, rows, buttons, panels |
| `hud-panel-light` | black 30% | `ShellBackgroundBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | rail, library layer, game page |
| `pause-plate-hover` | white 8% | `HoverColor`, `ListItemHoverBrush`, `TopPanelItemHoverBackgroundBrush`, `TabItemHoverIndicatorBrush` | hover wash |
| `hud-freemode` / `pause-stripe` | `#2D6EB9` | `TabItemIndicatorBrush`, `PrimaryButtonBorderBrush`, `FocusBrush`, `ProgressBarForegroundBrush`, `MainMenuButtonBackgroundBrush`, `WindowTitleBackgroundBrush` | the 8px bar, focus, bars, star plate |
| `pause-track` | freemode 30% | `ProgressBarTrackBrush` | bar rails |
| `slider-track` / `slider-fill` | `#042039` / `#3974C8` | `SliderTrackBrush` / `SliderHoverForegroundBrush` | slider |
| `pause-popup` / `pause-popup-edge` | `#121212` / `#2E2E2E` | `PopupBackgroundColor`, `MainColor` / `PopupBorderColor` | menus, dropdowns |
| `pause-window` | `#0C0C0C` | `WindowBackgourndBrush`, `MainColorDark` | window base |
| `pause-input*` | black 60%, edge white 30% / 60% | `Input*Brush`, `NormalBorderBrush` | fields |
| `hud-red`, `hud-yellow`, `hud-green` | | `DangerBrush`, `NegativeRatingBrush` / `WarningBrush`, `MixedRatingBrush` / `PositiveRatingBrush` | close hover, ratings |
| `radius*` | 0 | `ControlCornerRadius`, `CornerRadius*` | square everywhere |

Type: 12 / 14 / 16 / 20 / 34. `HtmlTextView` reads the Colors of the brushes on its `TextElement.Foreground` and `Tag`.

## Component spacing (`src/Common.xaml`)

| Key | Value | From |
|-----|-------|------|
| `ButtonPadding` | 18,9,18,8 | 38px menu rows with 16px condensed capitals |
| `InputPadding` | 10,9 | 38px fields, text 10px in |
| `MenuPadding` / `MenuItemPadding` | 0 / 10,9,14,9 | interaction menu: no inner margin, 38px rows, text 8px in |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0 / 10,9,14,9 | same rows |
| `ListBoxItemPadding` | 10,9 | lobby list rows |
| `GroupBoxHeaderMargin` | 0,0,0,3 | 3px between a column header and its rows |
| `TooltipPadding` | 10,8,10,9 | description box, text 8px in |
| `IconSize` | 20 | 20px glyphs in 38px plates |
| `GameBannerHeight` / `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 320 / 300 / 280 | shared game page keys |

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | The pause menu header and tab strip. A 56px header row: the localized "Library" in large condensed capitals at the left (where the game prints its title), a running task and notifications at the right, 150px clear for the caption buttons. Under it the strip: every top bar item is a tab (`CustomControls/TopPanelItem.xaml`): 38px PAUSE_BG plate under an 8px bar; the view switches are 120px text tabs, the rest 38px icon tabs; Playnite's separators are 8px of space; search (260px plate) and the filter tab close it at the right. 3px gap to the library. With the sidebar at the top, only the strip. |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px compact rail on the light panel: the star on a freemode blue 44px plate on top, items as 44x40 PAUSE_BG plates 3px apart, current = white plate with black glyph. Top/bottom: a 56px strip, views as text tabs. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons in white, red close hover, caption height 56 (the header row). |
| `Views/Library.xaml` | Background art over everything, blurred (radius 28) and tinted (84% at the top easing to 55%), library layer at 30% black. |
| `Views/MainWindow.xaml` | Default layout, notifications slide in from the right. |

## Game page

Follows the shared skeleton. Differences:

- Header: name in the condensed face at 34px, regular weight like the game's titles; Play is the current tab (white, black label, 8px blue bar on top); Options and edit are square PAUSE_BG plates.
- Description and notes each sit on a PAUSE_BG plate under an uppercase title with a 2px white rule (the mission tab's divider).
- Metadata pane: no panel; every field is its own stat row, a PAUSE_BG plate 3px under the previous one, caption in grey (beside the value in the details view, above it in the grid panel). Groups are split by 12px of space, no rules.
- The two views share every block; change them in pairs.

## Components

| Playnite file | Game component |
|---------------|----------------|
| `DefaultControls/Button.xaml`, `RepeatButton.xaml` | menu row as a button: PAUSE_BG plate, condensed capitals; white plate with black text under the pointer |
| `DefaultControls/ToggleButton.xaml` | the same plate; checked = white plate |
| `DerivedStyles/PlayButton.xaml` | the current tab: white plate, black label, 8px freemode bar |
| `DefaultControls/TabControl.xaml` | pause menu tab strip: separate 38px plates 4px apart, 8px bar over the selected (white) one |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | interaction menu: near-black body, 38px rows, highlighted row white with black text; Playnite's white menu icons get a black copy masked by the icon (`IconInk`) on the highlighted row |
| `DefaultControls/ComboBox.xaml` | field + menu rows; current value white 8%, highlighted row white |
| `DefaultControls/ListBox.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml` | lobby list rows: PAUSE_BG plates 3px apart (game list), white when selected |
| `DefaultControls/GroupBox.xaml` | lobby column: 38px header plate, body under it |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | menu check box: 18px square, 2px white edge, white tick |
| `DefaultControls/Slider.xaml` | menu slider: 9px navy rail, blue fill, 4x20 white bar as thumb |
| `DefaultControls/ProgressBar.xaml` | stat/rank bar: flat freemode on freemode 30% |
| `DefaultControls/ToolTip.xaml` | description box with a 3px blue bar on top |
| `DerivedStyles/GridViewItemStyle.xaml` | landing page card: 2px white-40% edge on hover, 4px white when selected |
| `DerivedStyles/PropertyItemButton.xaml` | stat values (underline on hover); chips as small plates that turn white |

## Deviations

- **No world blur behind the whole window**: only the library's background art is blurred (WPF `BlurEffect` on one image); the rail and dialogs sit on the window color.
- **Tabs are not equal width**: the game sizes its tabs equally; Playnite's top bar mixes text and icon items, so text tabs have a 120px minimum and icon tabs are square.
- **No header info lines**: the game's name / time / money block has no Playnite equivalent; the header's right side holds the running task and notifications.
- **No instructional button bar** (bottom-right key prompts): a mouse-driven desktop library has nothing to prompt.
- **Fonts**: Bahnschrift SemiCondensed and Segoe UI stand in for Chalet Comprime and Chalet London; Playnite also applies the user's font setting over `FontFamily`.
- **Menu icon ink**: the black copy of a menu icon on a highlighted row relies on a `VisualBrush` opacity mask; if an add-on draws a menu icon larger than 16px the copy may not line up.

## Not verified yet

Built and statically checked only (cloud session, no Playnite run). Everything needs a first look on Windows: the header and strip at small window widths, the `IconInk` menu icons, the blur cost with large background art, settings tabs, dialogs, filter panel, the sidebar at top/bottom/right, ThemeModifier edits.

## Preview and screenshots

`art/preview-grid.html` is an approximate HTML replica of the grid view (this theme's token values and sizes; fonts stand in; covers and background are generated gradients), rendered to `art/preview-grid.png` with `NODE_PATH=$(npm root -g) node scripts/render-theme-preview.mjs src/themes/Heist/art/preview-grid.html`. It is a mockup, not a Playnite capture. Real screenshots (`info/screenshots/`) come from `.\scripts\take-screenshots.ps1 -Extension heist` on a local Windows machine and are still to add before a release.
