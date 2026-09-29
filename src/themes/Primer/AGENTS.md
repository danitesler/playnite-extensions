# Primer — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of GitHub's **Primer** design system, on Primer's `dark` functional tokens.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Tokens | `@primer/primitives` 11.10.0: `dist/css/functional/themes/dark.css`, `functional/size/radius.css`, `border.css`, `size.css` |
| Components | `@primer/react` 38.40 CSS: Button, IconButton, TextInput, Select, Checkbox, Radio, ToggleSwitch, ActionList, ActionMenu / Overlay, UnderlineNav, NavList, ProgressBar, Tooltip; GitHub's Box / Box-header |
| Icons | Octicons 19.38.0 (MIT, `info/LICENSE-octicons.txt`), 16px set |

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | Primer's functional CSS variables, verbatim names and values (aliases written out, with the alias in a comment). |
| `src/Common.xaml` | `PopupBorder`, `FocusVisual` (inside), `CheckBoxFocusVisual` (checkbox and radio), component spacing. |
| `src/Media.xaml` | Octicons (Playnite's roles plus triangle-down, check, chevron-right, trash, pencil, plus) and the menu icon paths. |
| `src/Images/Octicons/` | Octicons rendered to PNG for Playnite's menu icons. |

## Tokens

Keys are the shared vocabulary; the template names the Primer token behind each one.

| Token | Dark value | Key | Used for |
|-------|------------|-----|----------|
| `bgColor-default` / `-muted` / `-inset` | `#0d1117` / `#151b23` / `#010409` | `WindowBackgourndBrush`, `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush` / `ExpanderBackgroundBrush` / `ShellBackgroundBrush`, `TopPanelBackgroundBrush` | page and inputs / Box header / header band |
| `fgColor-default` / `-muted` | `#f0f6fc` / `#9198a1` | `TextBrush` / `TextBrushDarker` | text, secondary text and icons |
| `bgColor-accent-emphasis` | `#1f6feb` | `GlyphBrush` | checked, selected, slider fill |
| `focus-outlineColor` | `#1f6feb` | `FocusBrush` | focus outline, focused input edge |
| `button-primary-bgColor-rest` / `-hover` / `-fgColor-rest` | `#238636` / `#29903b` / white | `PrimaryButtonBackgroundBrush` / `PrimaryButtonHoverBackgroundBrush` / `PrimaryButtonForegroundBrush` | primary buttons, Play (green) |
| `control-bgColor-rest` / `-hover` / `-active` | `#212830` / `#262c36` / `#2a313c` | `ButtonBackgroundBrush` / `ButtonHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` | default buttons, pressed toggles |
| `control-fgColor-rest` | `#f0f6fc` | `ButtonForegroundBrush` | button text |
| `control-borderColor-rest` / `-emphasis` | `#3d444d` / `#656c76` | `NormalBorderBrush` / `CheckBoxBorderBrush` | control and checkbox edges |
| `control-transparent-bgColor-hover` / `-selected` | `#656c76` at 20% | `HoverBrush`, `SliderTrackBrush` / `SelectedBrush` | ActionList hover and selection, slider track |
| `overlay-bgColor`, `overlay-borderColor` | `#010409`, `borderColor-muted` | `PopupBackgroundBrush`, `PopupBorderBrush` | menus, dropdowns, popovers |
| `borderColor-default` / `-muted` / `-emphasis` | `#3d444d` / 70% / `#656c76` | `WindowPanelSeparatorBrush`, `ScrollBarThumbBrush` / `MenuSeparatorBrush` / `GridViewItemHoverBorderBrush` | Box edge, scrollbar / menu dividers / cover hover |
| `underlineNav-borderColor-active` | `#f78166` | `TabItemIndicatorBrush` | UnderlineNav bar (coral) |
| `tooltip-bgColor` / `-fgColor` | `#3d444d` / white | `TooltipBackgroundBrush` / `TooltipForegroundBrush` | tooltips |
| `button-danger-bgColor-hover` / `-fgColor-hover` | `#b62324` / white | `DangerBrush` / `DangerForegroundBrush` | close button hover |
| `progressBar-bgColor-success` / `-track-bgColor` | `#238636` / `#3d444d` | `ProgressBarForegroundBrush` / `ProgressBarTrackBrush` | progress |
| `fgColor-danger` / `-attention` / `-success` | `#f85149` / `#d29922` / `#3fb950` | `WarningBrush`, `NegativeRatingBrush` / `DataChangeNotifBrush`, `MixedRatingBrush` / `PositiveRatingBrush` | warnings, data-changed, ratings |
| `bgColor-accent-muted` / `fgColor-accent` | `#388bfd1a` / `#4493f8` | `PropertyItemBackgroundBrush` / `PropertyItemForegroundBrush` | topic tags in the game overview (hover: `bgColor-accent-emphasis`, `PropertyItemHoverBackgroundBrush`) |

`ButtonBackgroundBrush` holds Primer's default button fill (`control-bgColor-rest`), so Playnite's notification toasts, which read it too, share that color.

Primer has two accents: blue (`accent`) for focus, checked controls, selection and links; green (`button-primary`) for primary buttons and progress. Translucent tokens keep their alpha; the popup edge is flattened onto the overlay. Font: `fontStack-sansSerif` resolves to Segoe UI on Windows; Mona Sans is not bundled.

Siblings: Primer's other dark themes (`dark-dimmed`, `dark-high-contrast`, `dark-colorblind`, `dark-tritanopia`) use the same token names; swap the values in `tokens.css` from that theme's CSS.

## Component spacing (`src/Common.xaml`)

| Key | Value | Primer |
|-----|-------|--------|
| `ButtonPadding`, `InputPadding` | 12,5 | control medium: 32px, 12px inline |
| `MenuPadding`, `ComboBoxDropDownPadding` / `MenuItemPadding`, `ComboBoxItemPadding`, `ListBoxItemPadding` | 8 / 8,6 | ActionList padding-block 8px, items 6px 8px (32px) |
| `GroupBoxPadding`, `GroupBoxHeaderPadding` | 16, 16 | Box body and Box-header |
| `TooltipPadding` | 8,4 | Tooltip condensed padding |
| `IconSize` | 16 | Octicons 16px |

## Shell

GitHub's page layout: `bgColor-default` everywhere except one dark band (`bgColor-inset`) across the top, with no borders between regions.

| File | Primer behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat: sidebar and view on `bgColor-inset`, the same color as the header band. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as invisible IconButtons (32px, `MainWindowButton`) on the band, 16px from the top; close takes the danger hover. |
| `Views/Sidebar.xaml` | Navigation rail on the page color. Its top 64px is painted in the band color and holds the three-bars button (`MainMenuButton`, `PART_ElemMainMenu`). |
| `CustomControls/SidebarItem.xaml` | NavList item, icon only: 32px, 16px octicons in `fgColor-muted`; the current item gets the fill and NavList's 4x24 accent bar 8px outside the item. |
| `Views/TopPanel.xaml` | AppHeader: 64px band, 16px padding; search (`TopPanelSearchBox`, TextInput medium, 272px), then the view controls, filters and notifications as invisible IconButtons; notifications show GitHub's unread dot. |
| `CustomControls/TopPanelItem.xaml` | Invisible IconButton, medium; toggled = `control-transparent-bgColor-selected`. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml`, `Views/Library.xaml` | Playnite's panels on Primer's base-size scale without separators; background art under the band, feathered on every edge. |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | GitHub's repository page. Header: icon and name (20px semibold) on the left; Edit (IconButton, octicon pencil), More (triangle-down) and green Play on the right; a rule under it. Main column: README Box (GroupBox "Description") and a Notes Box. 296px sidebar (BorderGrid) holding every metadata field Playnite can show, each a 12px semibold `fgColor-muted` label over its value (as an issue's sidebar lists Assignees and Labels), in six sections split by 1px `borderColor-default` rules (progress, scores, about, tags as topic tags, library, links; see `.claude/skills/playnite-theme-dev/reference.md`). A section whose fields are all hidden collapses with its rule. No art, no cover. The grid panel uses the same two columns (a 280px sidebar on the right); no tabs. Fields left out are parts Playnite skips. |

## Components

| Playnite file | Primer component |
|---------------|------------------|
| `DefaultControls/Button.xaml` | Button: `default` for regular buttons, `primary` (green) for `IsDefault`; medium weight |
| `DerivedStyles/PlayButton.xaml` | Button `primary` |
| `DerivedStyles/PropertyItemButton.xaml` | Link (fgColor-default, accent and underline on hover); in a list tagged `Chip`, a topic-tag (22px pill, `bgColor-accent-muted` / `fgColor-accent`, accent-emphasis fill on hover) |
| `DefaultControls/ToggleButton.xaml` | Button `default` with `aria-pressed` (`control-bgColor-active` when pressed) |
| `DefaultControls/RepeatButton.xaml` | Button `default` |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | TextInput: accent border plus 1px inset accent on focus (+ `BareTextBox`) |
| `DefaultControls/ComboBox.xaml` | Select trigger (triangle-down) opening an ActionMenu; single-select check in the leading slot |
| `DefaultControls/CheckBox.xaml` | Checkbox: 16px, `control-borderColor-emphasis` edge, radius small, accent fill with Primer's own mark, 2px focus outline 2px outside |
| `DefaultControls/RadioButton.xaml` | Radio: checked = 4px accent ring around a white center, outside focus outline |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | No Primer slider: ProgressBar track (8px, accent fill to the thumb center) with the ToggleSwitch knob |
| `DefaultControls/ProgressBar.xaml` | ProgressBar: green bar on `progressBar-track-bgColor`, radius small |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | GitHub's scrollbar: `borderColor-default` thumb, `fgColor-muted` on hover and drag |
| `DefaultControls/ToolTip.xaml` | Tooltip: `tooltip-bgColor`, white text |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | ActionMenu: Overlay (radius large, 8px list padding) and ActionList items (radius medium, muted leading and trailing visuals, check, chevron-right, full-width `borderColor-muted` dividers) |
| `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | ActionMenu, one-line styles `BasedOn` the ContextMenu |
| `DefaultControls/TabControl.xaml` | UnderlineNav: semibold selected item with the 2px coral bar |
| `DefaultControls/GroupBox.xaml` | Box: `borderColor-default` edge, radius medium, `bgColor-muted` Box-header with a semibold title |
| `DefaultControls/ListBox.xaml` | ActionList items: transparent hover and selected fills |
| `CustomControls/SearchBox.xaml` | TextInput with a leading search octicon |
| `DerivedStyles/DetailsViewItemStyle.xaml` | Inset ActionList rows |
| `DerivedStyles/GridViewItemStyle.xaml` | Cover outline: `borderColor-emphasis` on hover, focus-outline accent when selected |
| `DerivedStyles/WindowBarButton.xaml` | Dialog title bar buttons: invisible IconButtons, danger close |
| `DerivedStyles/HighlightBorder.xaml` | TextInput chrome for Default templates the theme does not replace |

## Deviations from Primer

- Header search and icon buttons use the invisible variant (no edge) to keep the band quiet; the search input keeps its edge.
- No shadows: the Overlay keeps only the 1px ring `shadow-floating-small` starts with.
- `GlyphColor` is `bgColor-accent-emphasis` (`#1f6feb`) because Playnite also uses it as a fill under white text; Primer's link color (`fgColor-accent`, `#4493f8`) is a little lighter.
- Menu icons are octicon PNGs in `src/Images/Octicons` (48px, `fgColor-muted`; `fgColor-danger` for exit and remove), referenced by path because Playnite rebuilds TextBlock icons from their glyph and font. They don't follow a token change; the list, colors and Octicons tag are in `icons.json`, so after a palette change update the colors there and run `.\scripts\render-icons.ps1 -Extension primer`.
- Overview fields have visible labels, not octicons with a tooltip: there are 25 fields and Octicons for a handful, and the sidebar has no section headings because themes cannot ship localization (sections are told apart by the rules and spacing).

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run: library (grid, details, list), game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus. Also: green default buttons in dialogs, the coral tab bar alignment, the thick radio ring, the inside focus outline on green and blue buttons, the Box headers in settings, the leading check in dropdowns, and the checkbox mark.

Layout checks: the band continuing through the sidebar's top, the right-hand cluster at narrow widths, the current-item bar next to the selected sidebar item (not clipped), the unread dot, the pill-shaped slider knob.

Known limit: the header band belongs to the library view, so on other views (Statistics, add-on views) only the sidebar's top shows the band color.

Game overview: the two-column page at narrow pane widths (the sidebar is a fixed 296px), topic-tag wrapping, the sidebar sections and the collapse of a section whose fields are hidden (the first visible section starts flush under the heading), long install folders wrapping, the green Play next to More and Edit.
