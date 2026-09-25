# Material UI Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of **Material UI** (MUI, Material Design 2), with MUI's default dark theme (`createTheme({ palette: { mode: 'dark' } })`). Standalone: every file it ships lives in this folder. Resource keys it adds start with `Mui` (profile `resourcePrefix`) and follow `theme.palette` paths and MUI component names.

Playnite loading rules, overlay mechanics and the build checks are in **`.cursor/rules/playnite-themes.mdc`** and skill **`playnite-theme-dev`**.

## Sources

| What | Where |
|------|-------|
| Tokens | `mui/material-ui` 9.4 `packages/mui-material/src/styles` (`createPalette.js`, `createThemeWithVars.js`, `getOverlayAlpha.ts`, `createTypography.js`) and `colors/` |
| Components | same package: AppBar, Toolbar, Drawer, ListItemButton, IconButton, Badge, Button, ToggleButton, FilledInput, Select, Menu, MenuItem, Divider, Card, CardHeader, Checkbox, Radio, Slider, LinearProgress, Tooltip, Tab / Tabs |
| Icons | Material Icons, filled (`@material-design-icons/svg` 0.14.15, Apache-2.0, `info/LICENSE-material-icons.txt`), the set `@mui/icons-material` wraps |

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | MUI's CSS variables under the names MUI emits with `cssVariables` (`--mui-palette-background-paper`, `--mui-palette-FilledInput-bg`, `--mui-overlays-8`, `--mui-shape-borderRadius`), plus the few dark-mode values MUI's components hard-code. |
| `src/Constants.template.xaml` | Tokens → `Mui*` keys and Playnite's palette keys; rendered into `Constants.xaml`. |
| `src/Common.xaml` | `PopupBorder`, `MuiFocusVisible` (focus state layer), component spacing. |
| `src/Media.xaml` | Material Icons (Playnite's roles plus arrow_drop_down, chevron_right, check). |
| `src/Views/*`, `src/DerivedStyles/MainWindowStyle.xaml`, `src/CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml`, `SearchBox.xaml` | Shell. |
| `src/DefaultControls/*`, other `src/CustomControls/*` and `src/DerivedStyles/*` | Controls. |
| `info/` | `theme.yaml`, `InstallerManifest.yaml`, `danitesler_materialuitheme.yaml`, `icon.png`, `LICENSE-Playnite.txt`, `LICENSE-material-icons.txt`. |

## Tokens

Keys follow `theme.palette` paths: `palette.background.paper` → `MuiBackgroundPaperColor` / `...Brush`, `palette.FilledInput.bg` → `MuiFilledInputBg`, `palette.primary.contrastText` → `MuiPrimaryContrastText`. Paper at elevation N (the dark-mode white overlay on `background.paper`) is `MuiPaperElevationN`. Selection layers are `MuiPrimaryHover` / `MuiPrimarySelected` / `MuiPrimarySelectedHover` = `alpha(primary.main, hoverOpacity / selectedOpacity / both)`.

| Token | Dark value | Used for |
|-------|------------|----------|
| `background.default` / `.paper` | `#121212` | window, drawer |
| Paper elevation 1 / 4 / 8 | white 5.1% / 9.2% / 11.9% on `#121212` | Card / AppBar / Menu, Popover |
| `text.primary` / `.secondary` | white / white 70% | text, icons |
| `primary.main` / `.dark` / `.contrastText` | blue[200] `#90CAF9` / blue[400] `#42A5F5` / black 87% on primary | primary actions, selection, focus lines |
| `action.hover` / `.selected` / `.focus` | white 8% / 16% / 12% | state layers |
| `divider` | white 12% | separators, toggle and popup edges |
| `FilledInput.bg` / `.hoverBg`, underline | white 9% / 13%, white 70% | text fields, selects |
| `Tooltip.bg` | `grey[700]` at 92% | tooltips |
| `LinearProgress.primaryBg` | `darken(primary.main, 0.5)` | progress rail |
| `error.main` / `warning.main` / `success.main` | red[500] / orange[400] / green[400] | close button, warnings, ratings |

Action and text colors keep their alpha, as in MUI; popup surfaces and edges are flattened onto the paper, since WPF popups are layered windows. Font: MUI's Roboto is not bundled (Toolbox drops `Fonts/`), so Segoe UI.

Sibling theme: swap `--mui-palette-primary-main` / `-dark` / `-contrastText` and `--mui-palette-LinearProgress-primaryBg` for another MUI color (dark-mode primaries are the `[200]` shade).

## Component spacing (`src/Common.xaml`)

| Key | Value | MUI |
|-----|-------|-----|
| `MuiButtonPadding` | 16,9,16,8 | Button medium, 6px 16px |
| `MuiFilledInputPadding`, `MuiFilledInputBorderThickness`, `MuiFilledInputRadius` | 12,10 / 0,0,0,1 / 4,4,0,0 | FilledInput small, hiddenLabel: underline only, rounded top |
| `MuiMenuListPadding` / `MuiMenuItemPadding` | 0,8 / 16,9,16,8 | MenuList 8px 0, MenuItem 6px 16px |
| `MuiListItemButtonPadding` | 16,8 | ListItemButton 8px 16px |
| `MuiCardContentPadding`, `MuiCardHeaderMargin` | 16, 0,0,0,16 | CardHeader / CardContent |
| `MuiTooltipPadding` | 8,4 | Tooltip 4px 8px |
| `MuiSvgIconSize` | 24 | SvgIcon medium |

`MuiFocusVisible` fills a keyboard-focused control with `action.focus`: Material shows focus as a state layer, not a ring.

## Shell

MUI's app bar + mini drawer layout. The app bar (Paper at elevation 4) is the only raised surface; everything else is `background.default`, with no dividers.

| File | Material behavior |
|------|-------------------|
| `Views/MainWindow.xaml` | Flat: drawer and view on `background.default`. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as IconButtons (40px circles, 20px icons, `MuiWindowButton`) on the app bar, 12px from the top and against the right edge; close fills with `error.main`. |
| `Views/Sidebar.xaml` | Permanent mini Drawer, 64px wide, no divider. Its top 64px is painted in the app bar color and holds the menu IconButton (`MuiMenuIconButton`, `PART_ElemMainMenu`), so the bar reads as one full-width app bar. |
| `CustomControls/SidebarItem.xaml` | ListItemButton rows: 64x48, square, 24px icons in `text.secondary`; `action.hover` on hover; selected = `MuiPrimarySelected` with a primary icon. |
| `Views/TopPanel.xaml` | 64px Toolbar with 16px gutters. App bar search on the left (`MuiAppBarSearch`: white 15%, 25% on hover, no border, widening 240 → 360px while focused). IconButtons on the right; Badges instead of text (primary dot while a filter applies, error count for notifications). |
| `CustomControls/TopPanelItem.xaml` | IconButton medium, `color="inherit"`: 40px circle, 24px icon; a toggled item turns primary. |
| `CustomControls/SearchBox.xaml` | FilledInput with a start adornment, for search boxes outside the app bar. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml`, `Views/Library.xaml` | Playnite's panels on the 8px spacing unit without separators; background art under the app bar, feathered on every edge. |

## Components

| Playnite file | MUI component |
|---------------|---------------|
| `DefaultControls/Button.xaml` | Button: `text` for regular buttons (primary label, min-width 64, primary 8% on hover), `contained` for `IsDefault`; uppercase medium labels |
| `DerivedStyles/PlayButton.xaml` | Button `contained` |
| `DefaultControls/ToggleButton.xaml` | ToggleButton: divider edge, `text.secondary`; selected = primary @ 16% with primary text |
| `DefaultControls/RepeatButton.xaml` | Button `outlined` (primary edge at 50%) |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | FilledInput: 2px primary underline growing from the center on focus (+ `MuiBareTextBox`) |
| `DefaultControls/ComboBox.xaml` | Select `filled`: ArrowDropDown that turns over while open; Menu paper; selected MenuItem in primary @ 16% (no check) |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | Checkbox, Radio: 18px outline icons, primary when checked, round hover state layer |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | Slider: 4px rail at 38% primary, primary track to the thumb center (`MuiSliderTrack`), 20px thumb, 8px / 14px primary halo |
| `DefaultControls/ProgressBar.xaml` | LinearProgress: square ends, `primaryBg` rail |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | Material dark scrollbar: 8px thumb, `text.primary` at 26% / 50% / 70% |
| `DefaultControls/ToolTip.xaml` | Tooltip: `Tooltip.bg`, white text, 4px 8px |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | Menu (elevation 8 paper, MenuList 8px 0) and MenuItem (square, action.hover, ListItemIcon column, check icon, body2 shortcut in `text.secondary`, chevron_right for nested menus, dividers with 8px margins) |
| `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | Menu paper, one-line styles `BasedOn` the ContextMenu |
| `DefaultControls/TabControl.xaml` | Tabs: 48px uppercase tabs, primary text and 2px indicator when selected |
| `DefaultControls/GroupBox.xaml` | Card: elevation 1, radius 4, padding 16, h6 title |
| `DefaultControls/ListBox.xaml` | ListItemButton states |
| `DerivedStyles/DetailsViewItemStyle.xaml` | ListItemButton rows: full width, square, primary @ 16% when selected |
| `DerivedStyles/GridViewItemStyle.xaml` | 2px cover outline: `text.secondary` on hover, primary when selected |
| `DerivedStyles/WindowBarButton.xaml` | Dialog title bar buttons: small circular IconButtons, `error.main` close |
| `DerivedStyles/HighlightBorder.xaml` | FilledInput chrome for Default templates the theme does not replace |

## Uppercase labels

`text-transform: uppercase` has no WPF equivalent. Button and tab templates carry an implicit `DataTemplate` for `sys:String` that renders `AccessText` through Playnite's `StringToUpperCaseConverter`. Only string content hits it; icon or panel content passes through. Do not bind the converter to `Content` directly: it returns an empty string for anything that is not a string, which blanks icon buttons.

## Deviations from MUI

- No Roboto, no letter-spacing (WPF `TextBlock` has none), no ripple animation (static state layers), no drop shadows (a divider edge on popups instead; elevation shows as the Paper overlay color).
- No floating labels on text fields (Playnite's forms put labels beside or above them), hence the hidden-label FilledInput metrics.
- The Card title is h6 instead of CardHeader's default h5, sized for settings sections.
- The indeterminate LinearProgress slides one segment; MUI runs two bars at different speeds.

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension materialuitheme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Material UI Theme
```

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run: library (grid, details, list), game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus on buttons and inputs. Also: uppercase labels on dialog buttons (icon-only buttons must still show their icon), access-key underscores in button text, checkbox/radio hover halos near panel edges, slider halos, the Select arrow turning over while open, and the menu icon column alignment.

Layout checks: the app bar color continuing through the drawer's header band, the search widening on focus, Badges on the filter and notification buttons, full-width drawer rows, the FilledInput underline animation in the game edit dialog.

Known limit: the app bar belongs to the library view, so on other views (Statistics, add-on views) only the drawer's header band shows the bar color.
