# Primer Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of GitHub's **Primer** design system, on Primer's `dark` functional tokens. Standalone: every file it ships lives in this folder. Resource keys it adds start with `Primer` (profile `resourcePrefix`) and are Primer's own token and component names.

Playnite loading rules, overlay mechanics and the build checks are in **`.cursor/rules/playnite-themes.mdc`** and skill **`playnite-theme-dev`**.

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
| `src/Constants.template.xaml` | Tokens → `Primer*` keys and Playnite's palette keys; rendered into `Constants.xaml`. |
| `src/Common.xaml` | `PopupBorder`, `PrimerFocusOutline` (inside), `PrimerFocusOutlineOffset` (checkbox and radio), component spacing. |
| `src/Media.xaml` | Octicons (Playnite's roles plus triangle-down, check, chevron-right). |
| `src/Views/*`, `src/DerivedStyles/MainWindowStyle.xaml`, `src/CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml` | Shell. |
| `src/DefaultControls/*`, other `src/CustomControls/*` and `src/DerivedStyles/*` | Controls. |
| `info/` | `theme.yaml`, `InstallerManifest.yaml`, `danitesler_primertheme.yaml`, `icon.png`, `LICENSE-Playnite.txt`, `LICENSE-octicons.txt`. |

## Tokens

Keys are Primer's token names in Pascal case: `bgColor-default` → `PrimerBgColorDefaultColor` / `...Brush`, `control-transparent-bgColor-hover` → `PrimerControlTransparentBgColorHover`, `borderRadius-medium` → `PrimerBorderRadiusMedium`, octicons → `PrimerOcticon<Role>`.

| Token | Dark value | Used for |
|-------|------------|----------|
| `bgColor-default` / `-muted` / `-inset` | `#0d1117` / `#151b23` / `#010409` | page / Box header, cards / header band |
| `fgColor-default` / `-muted` | `#f0f6fc` / `#9198a1` | text, secondary text and icons |
| `bgColor-accent-emphasis`, `focus-outlineColor` | `#1f6feb` | checked, selected, focus (Playnite `GlyphColor`) |
| `button-primary-bgColor-rest` / `-hover` | `#238636` / `#29903b` | primary buttons, Play (green) |
| `control-bgColor-rest` / `-hover` / `-active` | `#212830` / `#262c36` / `#2a313c` | default buttons, pressed toggles |
| `control-borderColor-rest` / `-emphasis` | `#3d444d` / `#656c76` | control and checkbox edges |
| `control-transparent-bgColor-hover` / `-selected` | `#656c76` at 20% | ActionList hover and selection |
| `overlay-bgColor`, `overlay-borderColor` | `#010409`, `borderColor-muted` | menus, dropdowns, popovers |
| `underlineNav-borderColor-active` | `#f78166` | UnderlineNav bar (coral) |
| `tooltip-bgColor` / `-fgColor` | `#3d444d` / white | tooltips |
| `button-danger-bgColor-hover` | `#b62324` | close button hover |
| `fgColor-danger` / `-attention` / `-success` | `#f85149` / `#d29922` / `#3fb950` | warnings, data-changed, ratings |

Primer has two accents: blue (`accent`) for focus, checked controls, selection and links; green (`button-primary`) for primary buttons and progress. Translucent tokens keep their alpha; the popup edge is flattened onto the overlay. Font: `fontStack-sansSerif` resolves to Segoe UI on Windows; Mona Sans is not bundled.

Siblings: Primer's other dark themes (`dark-dimmed`, `dark-high-contrast`, `dark-colorblind`, `dark-tritanopia`) use the same token names; swap the values in `tokens.css` from that theme's CSS.

## Component spacing (`src/Common.xaml`)

| Key | Value | Primer |
|-----|-------|--------|
| `PrimerButtonPadding`, `PrimerTextInputPadding` | 12,5 | control medium: 32px, 12px inline |
| `PrimerActionListPadding` / `PrimerActionListItemPadding` | 8 / 8,6 | ActionList padding-block 8px, items 6px 8px (32px) |
| `PrimerBoxPadding`, `PrimerBoxHeaderPadding` | 16, 16 | Box body and Box-header |
| `PrimerTooltipPadding` | 8,4 | Tooltip condensed padding |
| `PrimerOcticonSize` | 16 | Octicons 16px |

## Shell

GitHub's page layout: `bgColor-default` everywhere except one dark band (`bgColor-inset`) across the top, with no borders between regions.

| File | Primer behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat: sidebar and view on `bgColor-default`. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as invisible IconButtons (32px, `PrimerWindowButton`) on the band, 16px from the top; close takes the danger hover. |
| `Views/Sidebar.xaml` | Navigation rail on the page color. Its top 64px is painted in the band color and holds the three-bars button (`PrimerAppHeaderMenuButton`, `PART_ElemMainMenu`). |
| `CustomControls/SidebarItem.xaml` | NavList item, icon only: 32px, 16px octicons in `fgColor-muted`; the current item gets the fill and NavList's 4x24 accent bar 8px outside the item. |
| `Views/TopPanel.xaml` | AppHeader: 64px band, 16px padding; search (`PrimerAppHeaderSearch`, TextInput medium, 272px), then the view controls, filters and notifications as invisible IconButtons; notifications show GitHub's unread dot. |
| `CustomControls/TopPanelItem.xaml` | Invisible IconButton, medium; toggled = `control-transparent-bgColor-selected`. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml`, `Views/Library.xaml` | Playnite's panels on Primer's base-size scale without separators; background art under the band, feathered on every edge. |

## Components

| Playnite file | Primer component |
|---------------|------------------|
| `DefaultControls/Button.xaml` | Button: `default` for regular buttons, `primary` (green) for `IsDefault`; medium weight |
| `DerivedStyles/PlayButton.xaml` | Button `primary` |
| `DefaultControls/ToggleButton.xaml` | Button `default` with `aria-pressed` (`control-bgColor-active` when pressed) |
| `DefaultControls/RepeatButton.xaml` | Button `default` |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | TextInput: accent border plus 1px inset accent on focus (+ `PrimerBareTextBox`) |
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
- Menu icons Playnite copies stay icofont glyphs (Playnite rebuilds them from `Text`/`FontFamily`).

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension primertheme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Primer Theme
```

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run: library (grid, details, list), game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus. Also: green default buttons in dialogs, the coral tab bar alignment, the thick radio ring, the inside focus outline on green and blue buttons, the Box headers in settings, the leading check in dropdowns, and the checkbox mark.

Layout checks: the band continuing through the sidebar's top, the right-hand cluster at narrow widths, the current-item bar next to the selected sidebar item (not clipped), the unread dot, the pill-shaped slider knob.

Known limit: the header band belongs to the library view, so on other views (Statistics, add-on views) only the sidebar's top shows the band color.
