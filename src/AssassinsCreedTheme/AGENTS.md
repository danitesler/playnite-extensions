# Assassin's Creed Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) modeled on the menus of the RPG-era **Assassin's Creed** games (Origins, Odyssey, Valhalla, Mirage): near-black charcoal surfaces, warm ivory text, one gold accent, hairline rules, diamonds and corner brackets on whatever is current, a serif for headings, tabs along the top, and a game info screen laid out like an entry screen. Unofficial and standalone: every file it ships lives in this folder, and no Ubisoft asset is in it. Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`), the same as every theme here; the theme's own token names stay in `tokens.css`.

Playnite loading rules, overlay mechanics and the build checks are in **`.cursor/rules/playnite-themes.mdc`** and skill **`playnite-theme-dev`**.

## Sources

| What | Where |
|------|-------|
| Look and layout | The in-game menus, reproduced from memory of how they look and are laid out (tab strip, list on the left and detail on the right, ivory on charcoal with gold, diamond markers, corner brackets). **No screenshots or game files were available while building**, so nothing is measured: every value in `tokens.css` and every size in `Common.xaml` is an estimate to tune against the game. |
| Tokens | None published. `tokens.css` holds this theme's own values under descriptive names (`void`, `night`, `slate`, `ivory`, `gold`, ...). |
| Fonts | Ship with Windows, none bundled: Segoe UI Semilight (body), Palatino Linotype with Book Antiqua and Georgia behind it (headings). |
| Icons | Original artwork, drawn for this theme: 47 thin-line SVGs in `icons/` (24 grid, 1.5 stroke, miter joins, diamonds where other sets use dots). Not copied or traced from any game or icon pack. |
| Playnite | Default theme files at the tag in `scripts/data/playnite-theme-api.json` (MIT, `info/LICENSE-Playnite.txt`) are the starting point of every file. |

What "copying the menus" means here: the layout, hierarchy, states and motifs are reproduced; the games' logos, art, fonts and icon drawings are not, and would not be shipped. `info/NOTICE-assassins-creed.txt` says so in the package.

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | The palette (`.dark`) and the type, size and stroke tokens (`:root`). |
| `src/Constants.template.xaml` | Tokens → Playnite's palette keys and the shared keys; rendered into `Constants.xaml`. |
| `src/Common.xaml` | `FocusVisual`, `HeadingTextBlock`, `CornerMarksTemplate`, `DividerTemplate`, component spacing. |
| `src/Media.xaml` | `Icon<Role>` geometries (strokes), `IconTemplate` / `IconSmallTemplate`, and the menu icon paths. |
| `src/Images/Icons/` | The menu icons as 48px PNGs (24 files). |
| `icons/`, `icons.json` | The SVG sources and the render jobs for `.\scripts\render-icons.ps1 -Extension assassinscreedtheme`. Outside `src/`, so not packaged. |
| `src/Views/*`, `src/DerivedStyles/MainWindowStyle.xaml`, `src/CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml` | Shell and the game info screens. |
| `src/DefaultControls/*`, other `src/CustomControls/*` and `src/DerivedStyles/*` | Controls. |
| `info/` | `theme.yaml`, `InstallerManifest.yaml`, `danitesler_assassinscreedtheme.yaml`, `icon.png`, `LICENSE-Playnite.txt`, `NOTICE-assassins-creed.txt`. |

## Tokens

Keys are the shared vocabulary; the template names the token behind each one. Controls read brushes only, so ThemeModifier's palette edits (Editor tab) and the shared brushes in the generated `thememodifier.yaml` (Edit constants) recolor them. Translucent tokens keep their alpha; the popup edge is flattened onto the popup surface.

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `void` | `#090a0c` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `CheckBoxCheckMarkBkBrush`; at 60% / 85%: `InputBackgroundBrush` / `TopPanelSearchBox*` | window, tab strip, slots inside checkboxes, input fill |
| `night` | `#0f1114` | `ContentBackgroundBrush`, `NormalBrushDark`, `SliderThumbBackgroundBrush` | the library layer, slider thumb |
| `slate` | `#15181c` | `NormalBrush`, `ExpanderBackgroundBrush`, `TopPanelBackgroundBrush`; at 70%: the cover slot | sub-bar, side panels, group boxes |
| `slate-popup` | `#22272e` | `PopupBackgroundBrush`, `TooltipBackgroundBrush` | menus, dropdowns, tooltips |
| `ivory` | `#eee9dc` | `TextBrush`, `DangerForegroundBrush`, `SelectedForegroundBrush` | text |
| `ivory-soft` | `#ada898` | `TextBrushDarker`, `MainMenuButtonForegroundBrush`, `CheckBoxBorderBrush`, `TabItemHoverIndicatorBrush` | secondary text, resting icons |
| `rule` (ivory 14%) | | `PanelSeparatorBrush`, `WindowPanelSeparatorBrush`, `ProgressBarTrackBrush`, `MenuSeparatorBrush` | hairlines |
| `rule-strong` (ivory 30%) | | `NormalBorderBrush`, `PopupBorderBrush` (flattened), `SliderTrackBrush`, `ScrollBarThumbBrush`, `ThumbBrush` | control edges |
| `veil` / `veil-strong` (ivory 6% / 11%) | | `ButtonBackgroundBrush`, `ListItemHoverBrush`, `ScrollBarTrackBrush` / `HoverBrush`, `ButtonHoverBackgroundBrush`, `MenuItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` | glass, hover fills |
| `gold` | `#c9a24d` | `GlyphBrush`, `FocusBrush`, `PrimaryButtonBackgroundBrush`, `TabItemIndicatorBrush`, `ScrollBarThumbHoverBrush`, `ThumbHoverBrush`, `CheckBoxHoverBorderBrush` | accent: selection, checked, focus, links, tab underline, Play |
| `gold-bright` | `#e6c877` | `PrimaryButtonHoverBackgroundBrush`, `GridViewItemHoverBorderBrush`, `SliderHoverForegroundBrush`, `SliderThumbHoverBorderBrush` | accent under the pointer |
| `gold-deep` | `#8a6c2e` | `InputHoverBorderBrush` | input edge on hover |
| `gold-wash` / `gold-haze` (gold 16% / 32%) | | `SelectedBrush`, `ListItemSelectedBrush`, `ButtonPressedBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush` / `HighlightGlyphBrush`, `SelectedHoverBrush` | selected and toggled fills |
| `on-gold` | `#17130a` | `TextBrushDark`, `PrimaryButtonForegroundBrush` | ink on gold |
| `crimson` / `crimson-bright` | `#b8323a` / `#e0505a` | `DangerBrush` / `WarningBrush`, `NegativeRatingBrush` | close hover / errors, update icon |
| `verdant`, `amber` | `#8db070`, `#e0a93f` | `PositiveRatingBrush` / `MixedRatingBrush`, `DataChangeNotifBrush` | ratings, unsaved marker |

Type: `FontFamily` is `Segoe UI Semilight, Segoe UI`; the shared key `HeadingFontFamily` is `Palatino Linotype, Book Antiqua, Georgia`. Sizes follow 12 / 14 / 16 / 22 / 30 (`FontSizeSmall` ... `FontSizeLargest`). WPF has no letter-spacing, so the games' tracked capitals are approximated with `Typography.Capitals` small caps in the heading serif (fonts without small caps show the text as typed) and, for tab titles, real capitals through Playnite's `StringToUpperCaseConverter`.

New shared keys this theme added to `scripts/data/theme-keys.json`: `HeadingFontFamily`, `HeadingTextBlock` (caption above a block), `CornerMarksTemplate` (four brackets in the host's Foreground) and `DividerTemplate` (diamond plus fading hairline). Both templates are ControlTemplates for a plain `Control`: `<Control Template="{DynamicResource CornerMarksTemplate}" Foreground="{DynamicResource GlyphBrush}" IsHitTestVisible="False" />`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Notes |
|-----|-------|-------|
| `ButtonPadding` | 18,8 | 36px buttons |
| `InputPadding` | 10,7 | 34px fields |
| `MenuPadding`, `ComboBoxDropDownPadding` / `MenuItemPadding` | 4 / 14,8 | 34px items |
| `ComboBoxItemPadding`, `ListBoxItemPadding` | 12,7 | |
| `GroupBoxPadding`, `GroupBoxHeaderMargin` | 16, 0,0,0,12 | |
| `TooltipPadding` | 12,7,12,8 | |
| `IconSize` | 20 | top bar icons; the tab icons are 22 |

## Shell

Layers, deepest first: `void` (window and tab strip), `night` (library), `slate` (sub-bar and side panels), `slate-popup` (menus).

| File | Behavior |
|------|----------|
| `Views/MainWindow.xaml` | The sidebar is docked to the **top** whatever Playnite's Sidebar position setting says; nothing in this theme reads that setting. |
| `Views/Sidebar.xaml` | The tab strip: 52px on `void`, hairline under it, the main menu button (`MainMenuButton`, `PART_ElemMainMenu`: menu lines around a diamond) at the left, 146px kept clear on the right for the caption buttons. |
| `CustomControls/SidebarItem.xaml` | A tab: 22px icon and the item's `Title` in the heading serif and capitals; secondary ink at rest, brighter with a 1px line on hover, and for the current tab a gold icon, a 2px gold underline and a diamond on it. Library and Statistics get `IconLibrary` / `IconStatistics`; add-on tabs keep their own icon scaled into the 22px box. `PART_ProgressStatus` is a 2px bar along the bottom. |
| `DerivedStyles/MainWindowStyle.xaml` | Caption buttons (`MainWindowButton`): 46x36, hairline icons, veil on hover, crimson for close. |
| `Views/TopPanel.xaml` | The sub-bar: 48px on `slate`. Search (`TopPanelSearchBox`, 320px inset field) at the left; view buttons, filter, notifications (gold count badge) on the right; a running task's caption and 2px progress bar in between. `PART_ElemMainMenu` is kept for when Playnite shows the menu here. |
| `CustomControls/TopPanelItem.xaml` | 34px icon button; veil on hover; toggled = gold on a gold wash with a 2px gold underline. |
| `CustomControls/SearchBox.xaml` | The inset field with a search icon and a clear icon; `PART_SeachIcon` carries the "Search" placeholder. |
| `Views/Library.xaml` | Everything under the sub-bar is one layer (`night`). The background art fades out toward the left and the bottom and is dimmed by a veil in the layer's brush. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Side panels on `slate` with a hairline on the inner edge; filter captions in small caps; preset buttons use `IconRemove` / `IconEdit` / `IconAdd`. |
| `Views/SearchView.xaml` | Playnite's Ctrl+F window with its three hard-coded colors moved onto the palette. |

## Game info screens

Both panels keep every `PART_` name and the `GridEx` property list of Playnite's Default files.

| File | Layout |
|------|--------|
| `Views/DetailsViewGameOverview.xaml` | Details view, right of the list. Header: the title (`PART_TextDisplayName`) in the heading serif, small caps, 30px, over a gold divider, then Play / context action / More / Edit; the cover on the right in a hairline frame with four gold corner brackets (the frame is hidden while the game has no cover). Below, two columns split by a hairline: "Game details" (property captions in small caps, values in ink, links turning gold and underlined on hover), and "Notes" and "Description" (each with a small-caps heading and a divider). |
| `Views/GridViewGameOverview.xaml` | Grid view side panel on `slate`. The same header on a narrow column, then the property list, notes and description under the same headings and dividers. |

The Edit button shows only while the pointer is over the header, as in Playnite's file, with `IconEdit`. The description is Playnite's `HtmlTextView`, whose `HtmlForeground` and `LinkForeground` are Color-typed, so they read `TextColor` and `GlyphColor`: the one place theme XAML reads Color keys, allowed by name in `Test-ThemeBuild`. ThemeModifier brush edits do not reach the description text for that reason.

## Icons

- **Vector** (`Media.xaml`): one `Icon<Role>` geometry per role Playnite's chrome needs, drawn as a stroke by `IconTemplate` (24 grid, 1.5 stroke; `IconSmallTemplate` uses 2 for 12 to 16px marks). Each geometry is the path data of `icons/<name>.svg`.
- **Menu icons** (`Images/Icons/*.png`): Playnite copies `Media.xaml` menu icons from a TextBlock's glyph and font, so a vector there is lost; each key (`AddGameIcon`, `SettingsIcon`, `PlayIcon`, ...) is instead a theme-relative PNG path. 48px, in `ivory-soft`; `crimson-bright` for exit and remove, `gold` for the filled favorite star. They do not follow a token change: edit the colors in `icons.json` and run `.\scripts\render-icons.ps1 -Extension assassinscreedtheme` (Windows; it needs WPF). The PNGs in the repo were rendered with Chromium from the same SVGs.
- The sidebar's Library and Statistics icons and the top bar's icons are vectors from `Media.xaml`.

## Components

| Playnite file | Design |
|---------------|--------|
| `DefaultControls/Button.xaml` | Glass plate with a hairline edge; gold edge on hover, gold wash pressed, gold corner brackets on keyboard focus; `IsDefault` = solid gold plate |
| `DerivedStyles/PlayButton.xaml` | Solid gold plate, dark ink; brightens on hover and closes in four ivory corner brackets |
| `DefaultControls/ToggleButton.xaml`, `RepeatButton.xaml` | The Button plate; toggled = gold wash and gold edge |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | Inset field (dark fill, hairline edge, square); edge dull gold on hover, gold with keyboard focus; gold selection (+ `BareTextBox`) |
| `DefaultControls/ComboBox.xaml` | The inset field with a hairline chevron; popup surface with 1px edge; hover veil, a gold diamond before the selected item |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | 16px square slot with a gold diamond when checked (a bar when mixed); the radio is a diamond outline with a gold diamond inside |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | 2px hairline rail, gold range, 14px diamond thumb; hover brightens; keyboard focus draws a larger diamond |
| `DefaultControls/ProgressBar.xaml` | Faint rail, gold bar, square ends, 33% sliding segment when indeterminate |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | Hairline rail with a 3px thumb that widens to 5px and turns gold on hover or drag (`ScrollBarThumb`); flat thumbs gold on hover |
| `DefaultControls/ToolTip.xaml` | Popup surface, 1px edge, a 2px gold rule along the top edge |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | Popup surface; items 34px with a veil and a 2px gold bar on the left edge while highlighted, gold check, hairline chevron for submenus, 1px separators |
| `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | One-line styles `BasedOn` the ContextMenu |
| `DefaultControls/TabControl.xaml` | Tabs like the strip: 1px line on hover, 2px gold line and main ink when selected, on a hairline (strip placement keeps Playnite's template) |
| `DefaultControls/GroupBox.xaml` | Card on `slate` with a hairline edge; header in small caps over a gold divider |
| `DefaultControls/ListBox.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml` | Rows: veil on hover, gold wash plus a gold bar for the current item; the details list has a hairline under every row |
| `DerivedStyles/GridViewItemStyle.xaml` | Cover slot: bright gold hairline and four brackets on hover; 2px gold frame and brackets when current |
| `DefaultControls/Expander.xaml`, `DerivedStyles/*GroupStyle.xaml` | Hairline gold chevrons; group headers in small caps with the count and a hairline out to the edge |
| `DerivedStyles/PropertyItemButton.xaml` | Values that filter: ink at rest, gold and underlined on hover |
| `DerivedStyles/WindowBarButton.xaml` | Dialog caption buttons in the same hairline icons |
| `DerivedStyles/HighlightBorder.xaml` | Input edge for Default templates the theme does not replace |

## Deviations and limits

- **Sidebar position is ignored**: the tab strip is always on top (and `Views/Sidebar.xaml` has no vertical layout).
- **List view** keeps Playnite's `DataGrid` template: it reads Color keys, which theme XAML may not, so selected rows there are the solid gold `GlyphColor` with dark ink, not the wash used elsewhere. Details and Grid views are restyled.
- No letter-spacing (WPF has none) and no shadows or blur; the games' animated transitions are not reproduced.
- Fonts are not bundled (Toolbox skips a `Fonts/` folder). If Palatino Linotype is missing, Windows falls back down the list; small caps then show as typed.
- The body font's semibold does nothing: `Segoe UI Semilight` has one face, so weights are only used on headings.
- Playnite's own templates that this theme does not replace (DataGrid, DatePicker, TreeView, ComboBoxList, FilterSelectionBox, notification panel, Statistics and add-on views) read the palette, so they take the colors but not the AC shapes. The cover hover overlay and its play and info buttons (`GridViewItemTemplate`) are Playnite's.
- The tile icon in `info/icon.png` is an original mark (a diamond split by a blade), not the games' insignia.

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension assassinscreedtheme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Assassin's Creed Theme
```

## Not verified yet

Built and statically checked on Linux (`build-theme.ps1`, plus a property and `PART_` check against Playnite's Default files); **not yet loaded in Playnite**, and no screenshots exist (`info/screenshots/` and the `Screenshots:` block of `danitesler_assassinscreedtheme.yaml` are still to do before a database PR). First run: library (grid, details, list), game context menu, sub-bar dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus.

Things most likely to need a fix: tab titles (they come from each sidebar item's `Title`; a long add-on title is cut at 150px) and the caption buttons clearing the strip; the main menu button in the strip versus the one in the sub-bar; the cover frame in the details header (hidden when there is no cover) and the property columns at narrow widths; the corner brackets around covers (drawn 4px outside, in the grid gutter, so clipped if `ItemSpacingMargin` is 0); small caps and the diamond dividers with the fonts actually installed; the gold selected row in the List view; the description text color (Color keys); the diamond slider thumb sitting on top of the range; how the 34px menu items read in the game context menu; and every value in `tokens.css` and `Common.xaml` against the games themselves.
