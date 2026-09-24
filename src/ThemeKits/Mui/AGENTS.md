# Mui theme kit — agent notes

## What this is

Material UI (MUI, Material Design 2) component styles for Playnite desktop themes. It **extends the Shadcn kit** (`kit.json` → `"extends": "src/ThemeKits/Shadcn"`) and replaces only what Material draws differently. Loading rules, token contract, and placeholder syntax: **`src/ThemeKits/Shadcn/AGENTS.md`**.

Current consumers: **Material UI Theme** (`src/MaterialUiTheme`).

## What differs from the Shadcn kit

Source: `mui/material-ui` `packages/mui-material/src` (`Button`, `Tab`/`Tabs`, `OutlinedInput`, `Checkbox`, `Radio`, `Slider`, `LinearProgress`, `Tooltip`, `ToggleButton`, `styles/createTypography.js`).

| File | Material behavior |
|------|-------------------|
| `Common.xaml` | Keyboard focus = state layer: `ShadcnFocusVisual` fills the control with `action.focus` (no ring). Repeats `PopupBorder`. |
| `DefaultControls/Button.xaml` | Regular = `outlined` (primary text, primary/50 border, primary 8% on hover). `IsDefault` = `contained` (primary fill, `primary.dark` on hover). Uppercase medium-weight labels. |
| `DerivedStyles/PlayButton.xaml` | `contained`, uppercase. |
| `DefaultControls/ToggleButton.xaml` | Divider border, text.secondary; selected = primary @ 16% with primary text. |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | `OutlinedInput` size small: transparent, white/23% border, text.primary border on hover, 2px primary when focused. |
| `DefaultControls/TabControl.xaml` | 48px uppercase tabs, text.secondary idle, primary text + 2px primary indicator when selected. |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | 18px outline icons (2px text.secondary), primary when checked, round hover state layer spilling past the control. |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | 4px track, rail at 38% primary, 20px filled thumb, primary 16% halo (larger while dragging). |
| `DefaultControls/ProgressBar.xaml` | `LinearProgress`: square ends, rail = primary at half strength. |
| `DefaultControls/ToolTip.xaml` | grey[700] @ 92%, no border, 4px 8px padding. |

Inherited from Shadcn and close enough: select, menus (items get 2px corners instead of square), scrollbars, sidebar, top panel, cover tiles, group boxes (read as elevation-1 cards).

## Uppercase labels

`text-transform: uppercase` has no WPF equivalent. Button and tab templates carry an implicit `DataTemplate` for `sys:String` that renders `AccessText` through Playnite's `StringToUpperCaseConverter`. Only string content hits it; icon or panel content passes through. Do not bind the converter to `Content` directly: it returns an empty string for anything that is not a string, which blanks icon buttons.

## Palette notes for Material themes

- Surfaces are MUI's white elevation overlays on `#121212`, written as `rgba(255,255,255,a)` so the build flattens them: `--card` = elevation 1 (5.1%), `--popover` = elevation 8 (11.9%).
- State layers stay translucent (template `~`): `--accent` = action.hover 8%, `--focus-overlay` = action.focus 12%, `--primary-subtle` / `--sidebar-accent` = primary @ 16%.
- `--primary-hover` = `primary.dark`; `--primary-foreground` = `contrastText` composited over `primary.main`.
- Sibling theme: swap `--primary`, `--primary-hover`, `--primary-foreground`, and the three primary-based rgba values for another MUI color (dark-mode primaries are the `[200]` shade).

## Not covered

Roboto is not bundled (Toolbox drops `Fonts/`; Segoe UI is used). No letter-spacing (WPF TextBlock has none). No ripple animation; hover and focus use static state layers. No drop shadows (Playnite popups are layered windows; separation comes from elevation color and a divider-color edge).
