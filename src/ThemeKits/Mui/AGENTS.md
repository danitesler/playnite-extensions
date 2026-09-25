# Mui theme kit — agent notes

## What this is

Material UI (MUI, Material Design 2) component styles and app shell for Playnite desktop themes. It **extends the Shadcn kit** (`kit.json` → `"extends": "src/ThemeKits/Shadcn"`) and replaces only what Material draws differently. Loading rules, token contract, control metrics, and placeholder syntax: **`src/ThemeKits/Shadcn/AGENTS.md`**.

Current consumers: **Material UI Theme** (`src/MaterialUiTheme`).

## Shell

MUI's app bar + mini drawer layout. The app bar (Paper at elevation 4, `--header`) is the only raised surface; everything else is `background.default`, with no dividers.

| File | Material behavior |
|------|-------------------|
| `Views/MainWindow.xaml` | Flat: drawer and view on `background.default`. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as IconButtons (40px circles, 20px icons) on the app bar, 12px from the top and the right edge. |
| `Views/Sidebar.xaml` | Permanent mini drawer, 64px wide, no divider. Its top 64px is painted in the app bar color and holds the menu IconButton (`PART_ElemMainMenu`), so the bar reads as one full-width app bar. |
| `CustomControls/SidebarItem.xaml` | ListItemButton rows: 64x48, square, 24px icons in muted foreground; action.hover on hover; selected = primary @ selectedOpacity with a primary icon. |
| `Views/TopPanel.xaml` | 64px Toolbar with 16px gutters. MUI's app bar search on the left: white 15% (25% on hover), icon inside, no border, widening 240 → 360px while focused. IconButtons on the right; Badges instead of text (primary dot while a filter applies, error count for notifications). |
| `CustomControls/TopPanelItem.xaml` | IconButton medium, `color="inherit"`: 40px circle, 24px icon; a toggled item turns primary. |
| `CustomControls/SearchBox.xaml` | FilledInput with a start adornment, for search boxes outside the app bar. |

Icons: Material Icons, filled (`@material-design-icons/svg` 0.14.15, Apache-2.0, `LICENSE-material-icons.txt`), in `Desktop/Media.xaml`, drawn at 24px (20px in search boxes and title buttons).

## Controls

Source: `mui/material-ui` `packages/mui-material/src` (`Button`, `AppBar`, `Toolbar`, `Drawer`, `ListItemButton`, `IconButton`, `Badge`, `Tab`/`Tabs`, `FilledInput`, `Checkbox`, `Radio`, `Slider`, `LinearProgress`, `Tooltip`, `ToggleButton`, `styles/createTypography.js`).

| File | Material behavior |
|------|-------------------|
| `Common.xaml` | Keyboard focus = state layer: `ShadcnFocusVisual` fills the control with `action.focus` (no ring). Metrics (8px unit): contained Button 6px 16px, FilledInput small 40px, MenuList 8px 0 with square 36px items, ListItemButton 8px 16px, Card 16px at radius 4, Tooltip 4px 8px; field radius 4,4,0,0 with an underline-only border. Repeats `PopupBorder`. |
| `DefaultControls/Button.xaml` | Regular = `text` variant (no border or fill, primary label, min-width 64, primary 8% on hover). `IsDefault` = `contained` (primary fill, `primary.dark` on hover). Uppercase medium-weight labels; disabled at 38%. |
| `DerivedStyles/PlayButton.xaml` | `contained`, uppercase, no border. |
| `DefaultControls/ToggleButton.xaml` | Divider border, text.secondary; selected = primary @ 16% with primary text. |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | FilledInput (small, hidden label): white 9% fill (13% on hover), rounded top, 1px white 70% underline (text.primary on hover), 2px primary underline growing from the center on focus. The inherited select gets the same fill and underline through the field tokens. |
| `DefaultControls/TabControl.xaml` | 48px uppercase tabs, text.secondary idle, primary text + 2px primary indicator when selected, no divider. |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | 18px outline icons (2px text.secondary), primary when checked, round hover state layer spilling past the control. |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | 4px rail at 38% primary, 4px primary track to the thumb center, 20px filled thumb, primary 16% halo (8px on hover and focus, 14px while dragging). |
| `DefaultControls/ProgressBar.xaml` | `LinearProgress`: square ends, rail = primary at half strength. |
| `DefaultControls/ToolTip.xaml` | grey[700] @ 92%, no border, 4px 8px padding. |

Inherited and close enough: menus (square items via the metrics), scrollbars, cover tiles, details rows, group boxes (elevation-1 cards).

## Uppercase labels

`text-transform: uppercase` has no WPF equivalent. Button and tab templates carry an implicit `DataTemplate` for `sys:String` that renders `AccessText` through Playnite's `StringToUpperCaseConverter`. Only string content hits it; icon or panel content passes through. Do not bind the converter to `Content` directly: it returns an empty string for anything that is not a string, which blanks icon buttons.

## Palette notes for Material themes

- Surfaces are MUI's white elevation overlays on `#121212`, written as `rgba(255,255,255,a)` so the build flattens them: `--card` = elevation 1 (5.1%), `--popover` = elevation 8 (11.9%), `--header` = elevation 4 (9%, the app bar).
- State layers stay translucent (template `~`): `--accent` = action.hover 8%, `--focus-overlay` = action.focus 12%, `--primary-subtle` / `--sidebar-accent` = primary @ 16%, `--input-background` / `--input-hover` = FilledInput 9% / 13%, `--input-border` = white 70% underline, `--header-field` / `--header-field-hover` = the app bar search 15% / 25%.
- `--primary-hover` = `primary.dark`; `--primary-foreground` = `contrastText` composited over `primary.main`.
- Sibling theme: swap `--primary`, `--primary-hover`, `--primary-foreground`, and the three primary-based rgba values for another MUI color (dark-mode primaries are the `[200]` shade).

## Not covered

Roboto is not bundled (Toolbox drops `Fonts/`; Segoe UI is used). No letter-spacing (WPF TextBlock has none). No ripple animation; hover and focus use static state layers. No drop shadows (Playnite popups are layered windows; separation comes from elevation color and a divider-color edge). No floating labels on text fields (Playnite's forms put labels beside or above them), hence the hidden-label FilledInput metrics.
