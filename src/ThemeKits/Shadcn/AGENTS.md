# Shadcn theme kit — agent notes

## What this is

A reusable **component layer** for Playnite desktop themes: shadcn/ui-style control templates plus a Constants template that maps shadcn's CSS variables onto Playnite's resource keys. It is not an add-on by itself. Themes opt in with `"themeKit": "src/ThemeKits/Shadcn"` in `src/extensions.json` and supply their own `palette.css`.

Current consumers: **Shadcn UI Theme** (`src/ShadcnUiTheme`).

## How Playnite loads a theme (drives every rule below)

Source: `source/Playnite/Themes.cs` (`ThemeManager.ApplyTheme`) in the Playnite repo.

1. Playnite only loads theme XAML whose relative path matches a file in its **Default** theme (the list is in `scripts/data/playnite-theme-api.json`). Any other `.xaml` is silently ignored.
2. It first parses **each theme file on its own** as a validity check. At that point only Default theme resources exist, so a `{StaticResource X}` where `X` lives in another of our files throws and the whole theme fails to apply.
3. It then merges files in pairs: `Default/A.xaml`, `Theme/A.xaml`, `Default/B.xaml`, `Theme/B.xaml`, ... The theme file is an **overlay**: it only needs the keys it changes; the later definition wins.
4. `Toolbox pack` skips any `Fonts/` folder and any file identical to the Default theme's copy.

## Layout

| Path | Role |
|------|------|
| `Constants.template.xaml` | Token contract. Rendered with a theme's `palette.css` into the build's `Constants.xaml`. |
| `Desktop/**` | Overlay files, same relative paths as Playnite's `Themes/Desktop/Default/`. Copied into every theme on this kit. |
| `LICENSE-Playnite.txt` | Templates are derived from Playnite's Default theme (MIT). |

## Rules

- **Kit tokens via `DynamicResource` only.** `Shadcn*` keys are defined in `Constants.xaml` (and a few in `Common.xaml`, `DefaultControls/Slider.xaml`, `DefaultControls/TextBox.xaml`). `StaticResource` is fine for Playnite keys (`BaseStyle`, `{x:Type Button}`, `True`) and for keys defined earlier in the same file. `Test-ThemeOverlay` enforces this.
- **Overlay, don't copy.** An overlay file holds only the styles it restyles. Exception: when a Default style references a sibling in its own file with `StaticResource`, redefine both (e.g. `Separator` + `MenuItem.SeparatorStyleKey` in `Menu.xaml`).
- **Keep Playnite's part names** (`PART_*`, `ItemsPresenter`, template names that code looks up). Start from the Default file at the targeted Playnite tag and change visuals only.
- **No new files outside the Default list**, no `Fonts/` folder, no hard-coded colors (add a token instead).
- **Focus:** buttons, toggles, checkboxes, tabs use `FocusVisualStyle="{DynamicResource ShadcnFocusVisual}"` (keyboard only, like `focus-visible`). Text inputs draw a 3px `ShadcnRingFocusBrush` halo on `IsKeyboardFocusWithin`. Do not add `IsKeyboardFocused` border triggers to buttons: a mouse click also gives WPF keyboard focus, so the border sticks.
- **No `DropShadowEffect`** on popups or tiles; separation comes from borders.

## Token contract (`Constants.template.xaml`)

One `Color` + one `Brush` per shadcn variable: `Shadcn{Background,Foreground,Card,CardForeground,Popover,PopoverForeground,Primary,PrimaryForeground,Secondary,SecondaryForeground,Muted,MutedForeground,Accent,AccentForeground,Destructive,Border,Input,Ring,Sidebar,SidebarForeground,SidebarPrimary,SidebarPrimaryForeground,SidebarAccent,SidebarAccentForeground,SidebarBorder}{Color,Brush}`.

Derived keys, named after the Tailwind classes shadcn uses: `ShadcnInputBackground` (input/30), `ShadcnInputHover` (input/50), `ShadcnRingFocus` (ring/50), `ShadcnPrimaryHover` (primary/90), `ShadcnAccentSubtle` (accent/50), `ShadcnDestructiveSubtle` (destructive/60), `ShadcnOverlay` (background/60, for controls on game art), `ShadcnCardBorder` / `ShadcnPopoverBorder` (border composited over that surface).

Radii: `ShadcnRadius{Sm,Md,Lg,Xl}` follow shadcn v4 (`--radius` minus 4 / minus 2 / as is / plus 4), `ShadcnRadiusFull` = 9999 (pill). `ControlCornerRadius` = md.

Playnite's own palette keys (`TextColor`, `GlyphColor`, `PopupBackgroundBrush`, ...) are mapped in the same file, so Default views the kit never touches still follow the palette. `GlyphColor` = primary and `TextColorDark` = primary-foreground: Playnite always pairs those two (selected rows, play button).

### Placeholder syntax

| Placeholder | Result |
|-------------|--------|
| `{{name}}` | Color from `--name`: hex, `oklch()`, `hsl()`, `rgb()`, bare shadcn v3 `H S% L%`, `var(--other)`. Emitted as `#AARRGGBB`. |
| `{{name/50}}` | Same color at 50% alpha. |
| `{{a?b}}` | First variable that exists. |
| `{{name@surface}}` | Palette alpha composited over `--surface` instead of `--background`. |
| `{{name\|#F59E0B}}` | Literal fallback when the variable is missing. |
| `{{radius:md}}` | Radius scale from `--radius` (rem or px). |
| `{{text:name\|Segoe UI}}` | Raw text (XML-escaped), with fallback. |

Palette colors with alpha (v4 `--border: oklch(1 0 0 / 10%)`) are flattened to opaque colors: WPF popups are layered windows, so a translucent border would blend with whatever sits behind the popup. Unresolved placeholders fail the build.

## What the kit restyles

| File | shadcn component |
|------|------------------|
| `Common.xaml` | `PopupBorder` radius, `ShadcnFocusVisual` |
| `DefaultControls/Button.xaml` | Button: outline variant; `IsDefault` = primary variant |
| `DefaultControls/ToggleButton.xaml`, `RepeatButton.xaml` | Toggle (outline), button chrome |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | Input (+ `ShadcnBareTextBox` for editable ComboBox) |
| `DefaultControls/ComboBox.xaml` | Select trigger, popover list, check on selected item |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | Checkbox, RadioGroup |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | Slider (`ShadcnSliderThumb`) |
| `DefaultControls/ProgressBar.xaml` | Progress (indeterminate = sliding segment) |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | ScrollArea scrollbar |
| `DefaultControls/ToolTip.xaml`, `ContextMenu.xaml`, `Menu.xaml` | Tooltip (popover style), DropdownMenu |
| `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml`, `Views/TopPanel.xaml` (`TopPanelMenu`) | DropdownMenu surfaces |
| `DefaultControls/TabControl.xaml` | Tabs (muted list, raised active trigger) |
| `DefaultControls/GroupBox.xaml` | Card |
| `DefaultControls/ListBox.xaml` | Command / Select item states |
| `CustomControls/SidebarItem.xaml`, `Views/Sidebar.xaml` | Sidebar menu buttons on a sidebar surface |
| `CustomControls/TopPanelItem.xaml`, `Views/TopPanel.xaml` (`TopPanelFilterToggle`) | Ghost icon buttons over a scrim |
| `DerivedStyles/PlayButton.xaml` | Button, default (primary) variant |
| `DerivedStyles/WindowBarButton.xaml` | Ghost title bar buttons; close = destructive |
| `DerivedStyles/GridViewItemStyle.xaml` | Cover ring (ring-2 ring-offset-2) |
| `DerivedStyles/HighlightBorder.xaml` | Input chrome for Default templates the kit does not replace |

Everything else (DataGrid, DatePicker, TreeView, Expander, filter panel, game details views) is Playnite's template recolored by the palette.

## Adding or changing a component

1. Copy the style from Playnite's Default file at the targeted tag (see `playniteVersion` in `scripts/data/playnite-theme-api.json`) into the matching path under `Desktop/`.
2. Swap colors for `Shadcn*` tokens, keep part names and triggers, and add a one-line header comment naming the shadcn component.
3. New color need? Add a `Color` + `Brush` pair to `Constants.template.xaml` with a placeholder, not a literal.
4. `.\scripts\build-theme.ps1 -Extension <theme key>` must pass, then check it in Playnite (`-Deploy`, restart).

## Updating to a new Playnite release

1. Check out Playnite at the new tag and run `.\scripts\update-playnite-theme-api.ps1 -PlayniteSource <checkout> -PlayniteVersion <tag>`.
2. Diff the Default theme between the old and new tag for every file under `Desktop/`; port relevant changes.
3. Rebuild every theme on the kit. Only raise a theme's `ThemeApiVersion` if the kit now depends on something new (a higher value hides the theme from older Playnite builds).
