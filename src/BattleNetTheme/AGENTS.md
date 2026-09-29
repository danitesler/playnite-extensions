# Battle.net Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Battle.net** desktop app: near-black blue-grey surfaces, white text, one bright Blizzard blue for Play, selection and focus, small corner radii, a top app bar, a game list next to a game page. Standalone: every file it ships lives in this folder. Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`), the same as every theme here; the theme's own token names stay in `tokens.css`.

Playnite loading rules, overlay mechanics and the build checks are in **`.cursor/rules/playnite-themes.mdc`** and skill **`playnite-theme-dev`**.

## Sources — read this first

Blizzard publishes no design system, no tokens and no component specs, so unlike the other themes here there is **no pinned spec to copy values from**. What this theme is built from:

| What | Where |
|------|-------|
| Layout and colors | The author's knowledge of the desktop client's dark UI. **Nothing was sampled from the client**: the Blizzard hosts were blocked from the build environment, so no screenshots were available to measure. Every value in `src/tokens.css` is an approximation chosen by eye. |
| Icons | Phosphor Icons 2.1.1, Regular weight (MIT, `info/LICENSE-phosphor.txt`), npm `@phosphor-icons/core`. Chosen as the closest open outline set to the thin rounded line icons of the client. |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`), every file restyled from its Default copy. |

**Not included, on purpose:** Blizzard's logo, wordmark, game art and its own icon files. Those are Blizzard's copyrighted and trademarked artwork; bundling them in a public add-on is not something this repo does. The logo button shows a Phosphor spiral in Blizzard blue and the text PLAYNITE where the client shows its own logo. The add-on tile (`info/icon.png`) uses the same spiral. To match the client's icons exactly for personal use, replace the geometries in `src/Media.xaml` and the PNGs in `src/Images/Phosphor` on your machine; nothing else depends on them.

To tighten the colors, sample a screenshot of the client and edit the values in `src/tokens.css` (see Tokens). No XAML changes are needed.

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | The theme's own approximated tokens (`bnet-*`): surfaces, lines, text, Blizzard blue, status colors, radii. |
| `src/Constants.template.xaml` | Tokens → Playnite's palette keys and the shared keys; rendered into `Constants.xaml`. |
| `src/Common.xaml` | `PopupBorder`, `FocusVisual`, `CheckBoxFocusVisual`, component spacing. |
| `src/Media.xaml` | Phosphor `Icon<Role>` geometries, `IconTemplate` (256 grid), search/clear templates, menu icon paths. |
| `src/Images/Phosphor/` | Menu icons rendered to PNG (48px, muted text color; red for exit and remove). |
| `src/Views/*`, `src/DerivedStyles/MainWindowStyle.xaml`, `src/CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml`, `SearchBox.xaml` | Shell. |
| `src/Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml`, `LibraryDetailsView.xaml`, `src/DerivedStyles/DetailsView*.xaml`, `PlayButton.xaml`, `GridViewItemStyle.xaml` | Game list and game page. |
| `src/DefaultControls/*`, other `src/CustomControls/*` and `src/DerivedStyles/*` | Controls. |
| `icons.json` | Icon sources for `render-icons.ps1` (Windows). The geometry job writes `icons.generated.xaml` (not committed): paste into `src/Media.xaml`. |
| `info/` | `theme.yaml`, `InstallerManifest.yaml`, `danitesler_battlenettheme.yaml`, `icon.png`, `LICENSE-Playnite.txt`, `LICENSE-phosphor.txt`. |

## Tokens

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `bnet-frame` | `#0a0c10` | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush` | window frame, app bar, toolbar, action bar, input wells |
| `bnet-rail` | `#0e1116` | `NormalBrushDark` (`MainColorDark`) | game list, filter and explorer panels, grid side panel |
| `bnet-page` | `#12151b` | `WindowBackgourndBrush`, `ContentBackgroundBrush` | game page and library |
| `bnet-card` / `-hover` / `-active` | `#181c24` / `#202531` / `#2a3040` | `ExpanderBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush`, `MainColor` / `HoverBrush`, `ListItemHoverBrush`, `MenuItemHoverBrush` / `SelectedBrush`, `ListItemSelectedBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush` | cards, hover, selected rows, rails |
| `bnet-popup` | `#1b1f28` | `PopupBackgroundBrush`, `TooltipBackgroundBrush` | menus, dropdowns, tooltips |
| `bnet-button` / `-hover` / `-pressed` | `#2a3040` / `#353d51` / `#212633` | `ButtonBackgroundBrush` / `ButtonHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` | secondary buttons |
| `bnet-divider` / `bnet-border` / `-strong` | `#1d212a` / `#2a303b` / `#414958` | `PanelSeparatorBrush`, `WindowPanelSeparatorBrush`, `MenuSeparatorBrush` / `NormalBorderBrush`, `InputBorderBrush`, `PopupBorderBrush` / `CheckBoxBorderBrush`, `ScrollBarThumbBrush`, `InputHoverBorderBrush`, `GridViewItemHoverBorderBrush` | dividers, control edges |
| `bnet-text` / `-muted` / `-dim` | `#f5f7fa` / `#a4abb8` / `#6f7786` | `TextBrush` / `TextBrushDarker` / `CheckBoxHoverBorderBrush`, `ScrollBarThumbHoverBrush`, `TabItemHoverIndicatorBrush` | text, secondary text and icons |
| `bnet-blue` / `-hover` / `-pressed` | `#148eff` / `#38a1ff` / `#0c72d4` | `GlyphBrush`, `PrimaryButtonBackgroundBrush`, `FocusBrush`, `TabItemIndicatorBrush` / `PrimaryButtonHoverBackgroundBrush` / `PrimaryButtonPressedBackgroundBrush` | Play, selection, checked controls, focus |
| `bnet-on-blue` | `#ffffff` | `TextBrushDark`, `PrimaryButtonForegroundBrush`, `DangerForegroundBrush` | text on blue and red fills |
| `bnet-red` / `-deep` | `#ff5a52` / `#d13438` | `WarningBrush`, `NegativeRatingBrush` / `DangerBrush` | warnings, close hover |
| `bnet-amber`, `bnet-green` | `#f5b031`, `#3fcf8e` | `DataChangeNotifBrush`, `MixedRatingBrush`, `PositiveRatingBrush` | data-changed text, ratings |
| `bnet-radius-sm` / `-radius` / `-lg` / `-xl` | 2 / 3 / 6 / 10 px | `CornerRadiusSmall` / `ControlCornerRadius` / `CornerRadiusLarge` / `CornerRadiusXLarge` | the client is nearly square-cornered |

Controls read brushes only, so ThemeModifier's palette edits and the shared brushes in the generated `thememodifier.yaml` recolor them. **One exception**: the description text on the game page (`HtmlTextView`) takes Color-typed properties (`HtmlForeground`, `LinkForeground`, default black), so it reads `TextColor` and `GlyphColor`; ThemeModifier brush edits do not reach it. The build check allows exactly those two properties.

Font: Segoe UI at 12 / 14 / 16 / 20 / 34. The client's own typeface is not bundled (and a `Fonts/` folder cannot ship in a Playnite theme).

## Component spacing (`src/Common.xaml`)

| Key | Value | Notes |
|-----|-------|-------|
| `ButtonPadding` | 18,8 | 36px buttons |
| `InputPadding` | 12,7 | 36px inputs; search and select are 34px |
| `MenuPadding`, `ComboBoxDropDownPadding` | 4 | popup surface |
| `MenuItemPadding`, `ComboBoxItemPadding`, `ListBoxItemPadding` | 12,8 | 36px rows |
| `GroupBoxPadding`, `GroupBoxHeaderPadding` | 16 / 16,12 | cards |
| `TooltipPadding` | 10,6 | |
| `IconSize` | 20 | toolbar icons |

## Shell and game page

| File | Behavior |
|------|----------|
| `Views/MainWindow.xaml` | The sidebar is always docked to the top, whatever *Sidebar position* says. |
| `Views/Sidebar.xaml` | App bar, 56px, frame color, 1px divider. Left: the logo button (`PART_ElemMainMenu`: spiral in Blizzard blue + PLAYNITE) that opens the main menu. Then the tabs. 140px kept clear on the right for the window buttons. |
| `CustomControls/SidebarItem.xaml` | Tab: icon and title (`SideItem.Title`), muted, white on hover, 3px blue underline on the current tab. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons flush in the top-right corner (44x36, red close hover); caption height 56. |
| `Views/TopPanel.xaml` | Library toolbar, 52px, frame color: search (320px), view controls, filter toggle, notifications (blue count badge), plugin items, global progress. Carries the logo button only when the sidebar is hidden. |
| `Views/Library.xaml` | Library on the page color; the library-wide background art (`PART_ImageBackground`) is kept but hidden. |
| `Views/LibraryDetailsView.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml`, `DetailsViewItemTemplate.xaml`, `DetailsViewGroupStyle.xaml` | Game list on the rail color: icon and name rows, card hover, selected row with a 3px blue bar, muted names and dimmed icons for games that are not installed, small muted group headings. |
| `Views/DetailsViewGameOverview.xaml` | Game page: background art full width fading into the page (height still follows *Game details indentation*), icon and name at 34px bold over the art, cover at the right, **About** (notes, description) and **Game details** cards, and a bottom action bar: 240x52 blue Play, context action, Options (gear + "More"), edit. |
| `Views/GridViewGameOverview.xaml` | The same page in the cover-grid side panel: rail color, blue Play, gear Options, muted labels. |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | Side panels on the rail color; preset buttons use theme icons. |

## Components

| Playnite file | Battle.net component |
|---------------|----------------------|
| `DefaultControls/Button.xaml`, `RepeatButton.xaml`, `ToggleButton.xaml` | Flat grey-blue secondary button; `IsDefault` is the blue primary; checked toggles get a blue edge and text |
| `DerivedStyles/PlayButton.xaml` | Play: blue, bold 20px white text, lighter hover, deeper pressed |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `CustomControls/SearchBox.xaml` | Dark input well, 1px edge that lightens on hover and turns blue on focus |
| `DefaultControls/ComboBox.xaml` | Dark select with a caret; popup rows with a blue bar on the selected one |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | 18px box / ring; blue fill and white check / blue dot when on |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | 4px rail, blue fill, 16px white round thumb |
| `DefaultControls/ProgressBar.xaml` | 6px blue bar on a dark track |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | 6px rounded thumb, no arrows |
| `DefaultControls/Menu.xaml`, `ContextMenu.xaml`, `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | 36px rows with a hover fill, Phosphor check and caret, divider separators |
| `DefaultControls/TabControl.xaml` | Semibold labels, blue 3px underline on the selected tab |
| `DefaultControls/GroupBox.xaml` | Card with a divider under a semibold title |
| `DefaultControls/ListBox.xaml` | Rows with a card hover and a blue bar on the selected row |
| `DefaultControls/ToolTip.xaml` | Dark tooltip with a 1px edge |
| `DerivedStyles/HighlightBorder.xaml`, `WindowBarButton.xaml`, `GridViewItemStyle.xaml` | Input chrome for unrestyled templates; dialog caption buttons; cover outline (grey hover, blue selected) |

## Deviations from the Battle.net app

- **Game list is a vertical rail, not a top row of icons.** The client shows its few games as a row of icons at the top; that does not scale to a Playnite library of hundreds of games, so the details view uses a vertical list (icon and name) beside the game page.
- **The bottom bar is on the game page only** (Details view and the grid side panel), not on the whole window.
- **No Blizzard logo, game logos or icon files** (see Sources). The wordmark reads PLAYNITE.
- **No news tiles.** Playnite has no news feed; the cards under the art are the game's description and details.
- **Sidebar position is ignored** (always top). Playnite's settings for it have no effect with this theme.
- **Font** is Segoe UI, not the client's typeface.
- **Colors are approximations** (see Sources).
- **The game title keeps a soft drop shadow** on the art so it stays legible over bright artwork (Playnite's own page does the same).

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension battlenettheme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Battle.net Theme
```

Icons are re-rendered with `.\scripts\render-icons.ps1 -Extension battlenettheme` (Windows; it needs WPF). The committed geometries and PNGs were produced with a stand-in on Linux from the same `icons.json`.

## Not verified yet

Built and statically checked on Linux (XML, file allowlist, resource keys, `StaticResource` scope, shared-key types); **not yet loaded in Playnite, and not compared with a screenshot of the real client**. First run on Windows: the top app bar (logo opens the main menu; tab titles show, meaning `SideItem.Title` binds), the toolbar, the Details view (game list, game page with art, cards, bottom action bar, blue Play) with a game that has art and one that does not, Grid and List views, game context menu, top panel dropdowns, settings tabs, a game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus. Layout risks to look at: the window buttons against the app bar's right edge, hero art height vs *Game details indentation*, the cover beside a long game title, the description text color (`HtmlTextView`), text box padding, the Options button label (`LOCMoreAction`), and the 3px selected bar on rail rows. If Playnite falls back to Default after selecting the theme, the XAML error and file are in `playnite.log`.

Known limit: the toolbar belongs to the library view, so on other views (Statistics, add-on views) only the app bar shows.
