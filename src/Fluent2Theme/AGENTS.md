# Fluent 2 Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of Microsoft's **Fluent 2** design system (Fluent UI React v9), on the `webDarkTheme` tokens, with a Windows 11 app shell. Standalone: every file it ships lives in this folder. Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`), the same as every theme here; Fluent's token names stay in `tokens.css` and the template's placeholders.

Playnite loading rules, overlay mechanics and the build checks are in **`.cursor/rules/playnite-themes.mdc`** and skill **`playnite-theme-dev`**.

## Sources

| What | Where |
|------|-------|
| Tokens | `@fluentui/react-theme` 9.2.2 (`@fluentui/tokens` 1.0.0-alpha.24), `webDarkTheme`, evaluated from the package |
| Components | Style hooks of `@fluentui/react-button`, `react-input`, `react-combobox` (Dropdown, Option), `react-menu` (MenuPopover, MenuItem), `react-tabs`, `react-checkbox`, `react-radio`, `react-slider`, `react-progress`, `react-tooltip`, `react-card`, `react-table` (TableRow), `react-tabster` (`createFocusOutlineStyle`) |
| Shell | Windows 11 / WinUI: NavigationView (LeftCompact), title bar, caption buttons, content layer (`OverlayCornerRadius` 8px) |
| Icons | Fluent UI System Icons, `@fluentui/svg-icons` 1.1.342 (MIT, `info/LICENSE-fluentui-system-icons.txt`): Regular 20px, `checkmark_16_filled` |

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | Fluent's tokens, verbatim names (`--colorNeutralBackground1`, as FluentProvider writes them) and dark values. |
| `src/Constants.template.xaml` | Tokens → Playnite's palette keys and the shared keys; rendered into `Constants.xaml`. |
| `src/Common.xaml` | `PopupBorder` (MenuPopover surface), `FocusVisual`, component spacing. |
| `src/Media.xaml` | Fluent System Icons (Playnite's roles plus chevron right/down and the 16px checkmark), `IconTemplate` (20px) and `IconSmallTemplate`. |
| `src/Views/*`, `src/DerivedStyles/MainWindowStyle.xaml`, `src/CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml` | Shell. |
| `src/DefaultControls/*`, other `src/CustomControls/*` and `src/DerivedStyles/*` | Controls. |
| `info/` | `theme.yaml`, `InstallerManifest.yaml`, `danitesler_fluent2theme.yaml`, `icon.png`, `LICENSE-Playnite.txt`, `LICENSE-fluentui-system-icons.txt`. |

## Tokens

Keys are the shared vocabulary; the template names the Fluent token behind each one (`borderRadiusMedium` is `ControlCornerRadius`, `strokeWidthThin` is `ControlBorderThickness`). Controls read brushes only, so ThemeModifier's palette edits (Editor tab) and the shared brushes in the generated `thememodifier.yaml` (Edit constants) recolor them.

| Token | Dark value | Key | Used for |
|-------|------------|-----|----------|
| `colorNeutralBackground2` | `#1f1f1f` | `WindowBackgourndBrush` | base layer: window, title-bar row, rail |
| `colorNeutralBackground1` | `#292929` | `ContentBackgroundBrush`, `ButtonBackgroundBrush`, `InputBackgroundBrush`, `PopupBackgroundBrush`, `ExpanderBackgroundBrush`, `TooltipBackgroundBrush`, `SliderThumbBackgroundBrush` | content layer, buttons, inputs, menus, cards, tooltips |
| `colorNeutralBackground1Hover` / `Pressed` / `Selected` | `#3d3d3d` / `#1f1f1f` / `#383838` | `ButtonHoverBackgroundBrush`, `MenuItemHoverBrush` / `ButtonPressedBackgroundBrush` / `ToggleButtonCheckedBackgroundBrush` | button and option hover / pressed / toggled |
| `colorSubtleBackgroundHover` / `Selected` | `#383838` / `#333333` | `HoverBrush` / `SelectedBrush` | subtle buttons, nav items (hover and current), list and table rows |
| `colorNeutralForeground1` / `3` | `#ffffff` / `#adadad` | `TextBrush`, `DangerForegroundBrush`, `ScrollBarThumbHoverBrush` / `TextBrushDarker`, `ScrollBarThumbBrush` | text, secondary text, scrollbar |
| `colorCompoundBrandBackground` / `Stroke` / `Foreground1` / `BackgroundHover` | `#479ef5` / hover `#62abf5` | `GlyphBrush` / `SliderHoverForegroundBrush` | checked, focus underline, tab and nav indicators, slider, progress |
| `colorBrandBackground` / `Hover`, `colorNeutralForegroundOnBrand` | `#115ea3` / `#0f6cbd`, white | `PrimaryButtonBackgroundBrush` / `PrimaryButtonHoverBackgroundBrush`, `PrimaryButtonForegroundBrush` | primary buttons, Play, CounterBadge |
| `colorNeutralStroke1` / `Stroke2` | `#666666` / `#525252` | `NormalBorderBrush`, `ThumbBrush` / `WindowPanelSeparatorBrush`, `PopupBorderBrush` | control edges / dividers and popup edge |
| `colorNeutralStrokeAccessible` / `Hover` | `#adadad` / `#bdbdbd` | `InputUnderlineBrush`, `CheckBoxBorderBrush`, `SliderTrackBrush`, `ThumbHoverBrush` / `InputHoverUnderlineBrush`, `CheckBoxHoverBorderBrush`, `GridViewItemHoverBorderBrush` | input bottoms, checkbox, slider rail / their hover |
| `colorNeutralStroke1Hover` | `#757575` | `InputHoverBorderBrush`, `TabItemHoverIndicatorBrush` | hover edges |
| `colorStrokeFocus2` | `#ffffff` | `FocusBrush` | keyboard focus outline |
| `colorNeutralBackground6` | `#333333` | `ProgressBarTrackBrush` | progress track |
| `colorPaletteRedBackground3` | `#d13438` | `DangerBrush` | close caption button hover |
| `colorStatus{Danger,Warning,Success}Foreground1` | `#dc626d` / `#faa06b` / `#54b054` | `WarningBrush`, `NegativeRatingBrush` / `DataChangeNotifBrush` / `PositiveRatingBrush` | warnings, data-changed, ratings |

Fluent has two blues: `colorBrandBackground` (dark, white text) fills primary buttons; the lighter compound brand (dark text) marks state. Font: `fontFamilyBase` (Segoe UI); the Playnite size ramp follows Fluent's (12 / 14 / 16 / 20 / 28).

Siblings: `createDarkTheme(brandVariants)` gives any brand ramp, and `teamsDarkTheme` uses the same names; swap the values in `tokens.css`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Fluent |
|-----|-------|--------|
| `ButtonPadding`, `InputPadding` | 12,5 | Button / Input / Dropdown medium: 32px |
| `MenuPadding`, `ComboBoxDropDownPadding` / `MenuItemPadding` | 4 / 8,6 | MenuPopover and Dropdown listbox 4px; MenuItem 6px + 2px label inset, 32px |
| `ComboBoxItemPadding`, `ListBoxItemPadding` | 8,6 | Option 6px 8px |
| `GroupBoxPadding`, `GroupBoxHeaderMargin` | 12, 0,0,0,12 | Card medium padding and gap |
| `TooltipPadding` | 11,4,11,6 | Tooltip 4px 11px 6px |
| `IconSize` | 20 | Button medium icons |

## Shell

Windows 11 layering: the window is the base layer (`colorNeutralBackground2`, standing in for Mica) holding the title-bar row and the navigation rail; the library sits on a lighter content layer.

| File | Fluent behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat base layer. |
| `DerivedStyles/MainWindowStyle.xaml` | Windows 11 caption buttons (`MainWindowButton`): 46x32, square, flush with the top-right corner; subtle fill on hover, red for close. |
| `Views/Sidebar.xaml` | NavigationView, LeftCompact: 48px rail, no border; the pane toggle (`MainMenuButton`, `PART_ElemMainMenu`) in the title-bar row; 40x36 items with a 4px gutter. |
| `CustomControls/SidebarItem.xaml` | NavigationViewItem: 40x36, borderRadiusMedium, 20px icons, subtle hover fill; selected = subtle fill + 3x16 compound-brand pill on the left edge. |
| `Views/TopPanel.xaml` | 48px title-bar row: search (`TopPanelSearchBox`) centered, up to 468px; subtle 32px icon buttons on the right; brand CounterBadge for notifications. |
| `CustomControls/TopPanelItem.xaml` | Button subtle, icon only: 32px; hover and checked = subtle fill + brand icon. |
| `CustomControls/SearchBox.xaml` | SearchBox (outline): Input chrome with a 20px search icon and a dismiss icon. |
| `Views/Library.xaml` | Content layer on `colorNeutralBackground1`, top-left corner rounded 8px where it meets the rail (base-colored mask); square when the rail is elsewhere or hidden. The background art fades out on every edge. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Playnite's panels on Fluent's spacing ramp without separators. |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | Minimal game overview (details pane, grid side panel): icon and name without shadow, Play / More / Edit on hover, a short fact list with muted labels and no section titles or dividers, then description and notes. No cover; the details pane keeps the background art at half strength. Dropped fields (added, recent activity, install folder and size, categories, features, tags, age rating, series, source, region, version, scores) are parts Playnite skips when missing. |

## Components

| Playnite file | Fluent component |
|---------------|------------------|
| `DefaultControls/Button.xaml` | Button: secondary (Background1, Stroke1 edge) for regular buttons, primary (`colorBrandBackground`) for `IsDefault`; semibold |
| `DerivedStyles/PlayButton.xaml` | Button primary |
| `DefaultControls/ToggleButton.xaml` | ToggleButton: Button chrome, `Background1Selected` when checked |
| `DefaultControls/RepeatButton.xaml` | Button secondary |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | Input (outline): accessible-stroke bottom, 2px compound-brand underline that grows from the center on focus (+ `BareTextBox`) |
| `DefaultControls/ComboBox.xaml` | Dropdown: Input chrome, chevron_down; listbox popover with Options (hover `Background1Hover`, leading 16px checkmark) |
| `DefaultControls/CheckBox.xaml` | Checkbox: 16px, borderRadiusSmall, accessible edge; checked = compound-brand fill, inverted mark |
| `DefaultControls/RadioButton.xaml` | Radio: accessible edge; checked = brand edge + brand dot |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | Slider: 4px accessible-stroke rail, compound-brand progress, 20px thumb (brand disc in a Background1 ring) |
| `DefaultControls/ProgressBar.xaml` | ProgressBar: `Background6` track, compound-brand bar, borderRadiusMedium, 33% indeterminate segment |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | Windows 11 scrollbar: 2px line at rest widening to a 6px thumb over the bar (`ScrollBarThumb`) |
| `DefaultControls/ToolTip.xaml` | Tooltip: Background1, Foreground1, borderRadiusMedium |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | Menu: MenuPopover (borderRadiusMedium, 4px) and MenuItems (32px, `Background1Hover`, Foreground3 shortcuts, checkmark_16_filled, chevron_right_20), MenuDivider in `Stroke2` |
| `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | MenuPopover, one-line styles `BasedOn` the ContextMenu |
| `DefaultControls/TabControl.xaml` | TabList: subtle hover fill, 3px rounded indicator (`Stroke1Hover` on hover, compound brand when selected), selected label semibold |
| `DefaultControls/GroupBox.xaml` | Card (filled, medium): Background1, borderRadiusMedium, 12px padding, semibold header |
| `DefaultControls/ListBox.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml` | TableRow (subtle): `SubtleBackgroundHover` / `SubtleBackgroundSelected`, borderRadiusMedium |
| `DerivedStyles/GridViewItemStyle.xaml` | Cover outline: `StrokeAccessibleHover` on hover, compound brand when selected |
| `DerivedStyles/WindowBarButton.xaml` | Dialog caption buttons: subtle hover, red close |
| `DerivedStyles/HighlightBorder.xaml` | Input edge for Default templates the theme does not replace |

## Deviations from Fluent

- No shadows (`shadow16` on menus and tooltips, `shadow4` on cards). Popups get a `colorNeutralStroke2` edge instead of Fluent's transparent stroke; cards have no edge.
- No Mica or acrylic: WPF layered popups and Playnite's window can't use the Windows 11 backdrop from a theme; the base layer is a flat color.
- MenuItem text stays `colorNeutralForeground1` (Fluent uses `Foreground2` at rest): Playnite's MenuItem style sets the item foreground, and disabled items rely on it.
- Menu icons Playnite copies stay icofont glyphs (Playnite rebuilds them from `Text`/`FontFamily`).
- Views other than the library (Statistics, add-on views) sit on the base layer; only the library gets the content layer.

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension fluent2theme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Fluent 2 Theme
```

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run: library (grid, details, list), game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus. Also: the focus underline animation on text boxes and dropdowns (and that it resets when focus leaves), the curved bottom edge at the corners, the white 2px focus outline next to panel edges, the checkmark and chevron icons in menus and dropdowns, and how visible the subtle selected row is in the details view.

Layout checks: the content layer's rounded corner with the background image on (details view), the corner going square with the rail on the right or hidden, the centered search shrinking in narrow windows, caption buttons flush with the corner (also maximized), and the rail's brand pill.
