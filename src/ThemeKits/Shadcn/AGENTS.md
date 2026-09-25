# Shadcn theme kit — agent notes

## What this is

A reusable **component layer** for Playnite desktop themes: shadcn/ui-style control templates, an app shell (window frame, sidebar, top bar), a lucide icon set, and a Constants template that maps shadcn's CSS variables onto Playnite's resource keys. It is not an add-on by itself. Themes opt in with `"themeKit": "src/ThemeKits/Shadcn"` in `src/extensions.json` and supply their own `palette.css`.

Current consumers: **Shadcn UI Theme** (`src/ShadcnUiTheme`), and the **Chakra**, **Mui**, **Primer**, and **Fluent** kits (`src/ThemeKits/<Kit>`), which extend this one.

## Kit inheritance

A kit can extend another with `kit.json` → `{ "extends": "src/ThemeKits/<Base>" }`. The build copies the base kit's `<Mode>/` overlay, then the derived kit's (same path = the derived file replaces the base file whole), and renders the nearest `Constants.template.xaml` up the chain. LICENSE notices from every kit in the chain ship in the package. A new design system with mostly the same control shapes should extend this kit and override only what differs; one with different shapes everywhere should be a standalone kit.

Three layers let a derived kit change less than a whole file:

1. **Palette** (`palette.css`): colors, radius scale, optional tokens (table below).
2. **Metrics** (`Desktop/Common.xaml`): paddings and component radii the kit's controls read with `DynamicResource` (section below).
3. **Files**: replace a control or view when its structure differs.

## How Playnite loads a theme (drives every rule below)

Source: `source/Playnite/Themes.cs` (`ThemeManager.ApplyTheme`) in the Playnite repo.

1. Playnite only loads theme XAML whose relative path matches a file in its **Default** theme (the list is in `scripts/data/playnite-theme-api.json`). Any other `.xaml` is silently ignored.
2. It first parses **each theme file on its own** as a validity check. At that point only Default theme resources exist, so a `{StaticResource X}` where `X` lives in another of our files throws and the whole theme fails to apply.
3. It then merges files in pairs: `Default/A.xaml`, `Theme/A.xaml`, `Default/B.xaml`, `Theme/B.xaml`, ... The theme file is an **overlay**: it only needs the keys it changes; the later definition wins. File order follows the API list: `Constants.xaml`, `Common.xaml`, `Media.xaml`, `DefaultControls/*`, `CustomControls/*`, `DerivedStyles/*`, `Views/*`.
4. `Toolbox pack` skips any `Fonts/` folder and any file identical to the Default theme's copy.

## Layout

| Path | Role |
|------|------|
| `Constants.template.xaml` | Token contract. Rendered with a theme's `palette.css` into the build's `Constants.xaml`. Derived kits reuse it. |
| `Desktop/**` | Overlay files, same relative paths as Playnite's `Themes/Desktop/Default/`. Copied into every theme on this kit. |
| `LICENSE-Playnite.txt` | Templates are derived from Playnite's Default theme (MIT). |
| `LICENSE-lucide.txt` | Icon path data in `Desktop/Media.xaml` comes from lucide (ISC; Feather-derived icons MIT). |

## Rules

- **Kit tokens via `DynamicResource` only.** `Shadcn*` keys are defined in `Constants.xaml`, `Common.xaml`, `Media.xaml` and a few control files. `StaticResource` is fine for Playnite keys (`BaseStyle`, `{x:Type Button}`, `True`, `SimpleButton`) and for keys defined earlier in the same file. `Test-ThemeOverlay` enforces this.
- **Overlay, don't copy.** An overlay file holds only the styles it restyles. Exception: when a Default style references a sibling in its own file with `StaticResource`, redefine both (e.g. `Separator` + `MenuItem.SeparatorStyleKey` in `Menu.xaml`).
- **Keep Playnite's part names** (`PART_*`, `ItemsPresenter`, template names that code looks up) and every part the code dereferences without a null check (`SearchBox` needs all three of `PART_SeachIcon`, `PART_TextInpuText`, `PART_ClearTextIcon`). Start from the Default file at the targeted Playnite tag and change visuals and layout, not behavior.
- **No new files outside the Default list**, no `Fonts/` folder, no hard-coded colors (add a token instead). No `--` inside XML comments (the validator rejects it).
- **Icon resources Playnite copies must stay `TextBlock`s.** `MenuHelpers.GetIcon` and `SdkHelpers.ResolveUiItemIcon` rebuild `Media.xaml` icons (menu icons, `SidebarLibraryIcon`, ...) from `Text`, `FontFamily`, `FontStyle` and `Foreground` only. Vector icons go through `DataTemplate`s (`TopPanel*Template`, `SearchTextIconTemplate`) or through kit templates (`SidebarItem` swaps Library and Statistics by their icon key).
- **Focus:** buttons, toggles, checkboxes, tabs use `FocusVisualStyle="{DynamicResource ShadcnFocusVisual}"` (keyboard only, like `focus-visible`). Text inputs draw their focus state on `IsKeyboardFocusWithin`. Do not add `IsKeyboardFocused` border triggers to buttons: a mouse click also gives WPF keyboard focus, so the border sticks.
- **No `DropShadowEffect`** on popups or tiles; separation comes from surfaces and spacing. Popups keep a 1px edge because WPF popups are layered windows.
- **No layout dividers.** `PanelSeparatorColor` is transparent unless a palette sets `--panel-separator`; kit views draw none.
- **Slider tracks:** set `Track.Thumb` last. Track stacks its parts in the order they are set, and the range (drawn by the decrease button, reaching half a thumb past it) must end under the thumb.
- **`ScrollContentPresenter` clips.** Anything drawn outside an item (Primer's current-item bar) needs the gutter as the panel's margin, not the `ScrollViewer`'s padding.

## Shell (layout)

shadcn "inset" layout (blocks `sidebar-07` / `dashboard-01`):

| File | What it draws |
|------|---------------|
| `Views/MainWindow.xaml` | Window frame in `--sidebar`; the active view on a `--background` card, rounded-xl, inset 8px (m-2, ml-0 beside the sidebar). Four frame-colored corner masks (`ShadcnInsetCornerGeometry`) round the card over the view's content. |
| `DerivedStyles/MainWindowStyle.xaml` | Playnite's window template with the minimize / maximize / close buttons (`ShadcnMainWindowBarButton`, 32px ghost) centered on the card header. |
| `Views/Sidebar.xaml` | No fill, no border; 16px padding; the main menu is a 32px rounded-lg primary tile with the gamepad icon. `ShadcnLogoTile` is its style (the top bar reuses it). |
| `CustomControls/SidebarItem.xaml` | SidebarMenuButton, icon mode: 32px, rounded-md, sidebar-accent on hover and when active. Library and Statistics draw the kit's icons. |
| `Views/TopPanel.xaml` | 48px header inside the card, px-4: search on the left (filled, borderless, h-8, w-64), ghost 32px icon buttons on the right, progress in the middle. Icon templates, `TopPanelMenu`, filter and notification toggles. |
| `CustomControls/TopPanelItem.xaml` | Ghost icon button (size-8); accent when toggled. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Playnite's panels on p-4 spacing without separators. |

Derived kits replace these files with their own shell. The window button reserve on the right of each top bar must match the kit's `MainWindowStyle.xaml`.

## Control metrics (`Desktop/Common.xaml`)

Kit controls read spacing from these keys, so a derived kit restates its design system's numbers in its own `Common.xaml` instead of replacing control files:

| Key | shadcn value | Used by |
|-----|--------------|---------|
| `ShadcnButtonPadding` | 16,8 (h-9, px-4) | Button, ToggleButton, PlayButton (kits) |
| `ShadcnInputPadding` | 12,7 (h-9, px-3) | TextBox, PasswordBox, ComboBox trigger |
| `ShadcnMenuPadding` | 4 (p-1) | ContextMenu, Menu popups, ComboBox popup, `TopPanelMenu`, game menus |
| `ShadcnMenuItemPadding` | 8,6 (px-2 py-1.5) | MenuItem, ComboBoxItem |
| `ShadcnListItemPadding` | 8,6 | ListBoxItem |
| `ShadcnCardPadding`, `ShadcnCardTitleMargin` | 24, 0,0,0,24 | GroupBox (card) |
| `ShadcnTooltipPadding` | 12,6 (px-3 py-1.5) | ToolTip |
| `ShadcnIconSize` | 16 | top bar icon templates |

Radii come from the palette scale in `Constants.xaml` and a derived kit may restate them in `Common.xaml` (merged later, so it wins): `ShadcnPopupRadius` (md), `ShadcnMenuItemRadius` (sm), `ShadcnCardRadius` (xl), `ShadcnFieldRadius` (md), plus `ShadcnFieldBorderThickness` (1). Each derived `Common.xaml` replaces this file whole, so it must define every key above, plus `PopupBorder` and `ShadcnFocusVisual`.

## Icons (`Desktop/Media.xaml`)

lucide 1.48.0 path data (stroked, 24px canvas) for the roles Playnite's chrome needs: `ShadcnIcon{Search, Clear, ViewSettings, FilterPresets, Group, Sort, DetailsView, GridView, ListView, Update, Explorer, Random, ViewRandom, Filter, Notifications, MainMenu, Library, Statistics, WindowMinimize, WindowMaximize, WindowRestore, WindowClose}`. `ShadcnIconTemplate` draws a geometry (the `Content`) in the inherited foreground at whatever size the host gives it. The same file overrides `SearchTextIconTemplate` / `ClearTextIconTemplate` and drops Playnite's hard-coded colors from menu icons (remove-game keeps the destructive red).

A kit with another icon set replaces `Media.xaml` whole and defines all keys, with its own `ShadcnIconTemplate` (fill instead of stroke, its own canvas size). Path data is the SVG `d` with explicit separators; convert with a script, check `F0`/`F1` fill rules, and start every path with an absolute `M`.

## Token contract (`Constants.template.xaml`)

One `Color` + one `Brush` per shadcn variable: `Shadcn{Background,Foreground,Card,CardForeground,Popover,PopoverForeground,Primary,PrimaryForeground,Secondary,SecondaryForeground,Muted,MutedForeground,Accent,AccentForeground,Destructive,Border,Input,Ring,Sidebar,SidebarForeground,SidebarPrimary,SidebarPrimaryForeground,SidebarAccent,SidebarAccentForeground,SidebarBorder}{Color,Brush}`.

Optional keys (each falls back so older palettes render unchanged):

| Key | Palette var | Fallback | Used by |
|-----|-------------|----------|---------|
| `ShadcnPrimarySubtle` / `...Foreground` | `--primary-subtle` / `--primary-subtle-foreground` | accent | Chakra and Mui toggles, MUI selected drawer row |
| `ShadcnPrimaryHover` | `--primary-hover` | primary/90 | primary buttons, Fluent slider hover |
| `ShadcnPrimaryButton` / `...Foreground` / `...Hover` | `--primary-button` / `-foreground` / `-hover` | primary, primary-foreground, primary-hover | Primer's green buttons, Fluent badge |
| `ShadcnSecondaryHover` | `--secondary-hover` | secondary/80 | shadcn, Primer and Fluent default-button hover |
| `ShadcnTabIndicator` | `--tab-indicator` | primary | underline tabs (Primer coral) |
| `ShadcnStrongBorder` | `--border-strong` | input | Fluent input bottom edge, checkbox/radio outline, slider rail |
| `ShadcnPopoverBorder` / `PopupBorderColor` | `--popover-border` | border | popup edges |
| `ShadcnInputBorder` | `--input-border` | input | text field edges only (`transparent` = Chakra subtle inputs, white 70% = MUI filled underline) |
| `ShadcnInputBackground` | `--input-background` | input/30 | text field and checkbox fill |
| `ShadcnInputHover` | `--input-hover` | input/50 | field hover fill |
| `ShadcnPrimaryTint` | (none) | primary/8 | Mui text-button hover, checkbox state layer |
| `ShadcnTooltip` / `...Foreground` | `--tooltip` / `--tooltip-foreground` | foreground / background (inverted chip) | tooltips |
| `ShadcnFocusOverlay` | `--focus-overlay` | ring/30 | Mui focus state layer |
| `ShadcnHeader` | `--header` | background | MUI app bar and Primer header band (and the sidebar strip under them) |
| `ShadcnHeaderField` / `...Hover` | `--header-field` / `--header-field-hover` | input-background, input-hover | MUI's app bar search |
| `ShadcnSliderThumb` | `--slider-thumb` | white | shadcn thumb fill, Primer knob |
| `PanelSeparatorColor` | `--panel-separator` | transparent | Playnite's panel separators |

Translucent on purpose (`~` in the template, so Material-style white overlays lighten whatever surface they sit on): accent, accent/50, primary-subtle, sidebar-accent, input-background, input-border, input-hover, header-field, focus-overlay.

Derived keys, named after the Tailwind classes shadcn uses: `ShadcnInputHover` (input/50), `ShadcnRingFocus` (ring/50), `ShadcnPrimaryHover` (primary/90), `ShadcnAccentSubtle` (accent/50), `ShadcnDestructiveSubtle` (destructive/60), `ShadcnOverlay` (background/60, for controls on game art), `ShadcnCardBorder` / `ShadcnPopoverBorder` (border composited over that surface).

Radii: `ShadcnRadius{Sm,Md,Lg,Xl}` follow shadcn v4 (`--radius` minus 4 / minus 2 / as is / plus 4), `ShadcnRadiusFull` = 9999 (pill). `ControlCornerRadius` = md. `ShadcnInsetCornerGeometry` is the frame-colored mask for one rounded-xl corner.

Playnite's own palette keys (`TextColor`, `GlyphColor`, `PopupBackgroundBrush`, ...) are mapped in the same file, so Default views the kit never touches still follow the palette. `GlyphColor` = primary and `TextColorDark` = primary-foreground: Playnite always pairs those two (selected rows, play button).

### Placeholder syntax

| Placeholder | Result |
|-------------|--------|
| `{{name}}` | Color from `--name`: hex, `oklch()`, `hsl()`, `rgb()`, bare shadcn v3 `H S% L%`, `var(--other)`, `transparent`. Emitted as `#AARRGGBB`. |
| `{{name/50}}` | Alpha scaled to 50% (Tailwind `/50`: multiplies whatever alpha the color has). |
| `{{name@surface}}` | Palette alpha composited over `--surface` instead of `--background`. |
| `{{name~}}` | Keep the palette's alpha (no flattening). |
| `{{a/30?b@card?c~}}` | First variable that exists; modifiers belong to the alternative they follow. |
| `{{name\|#F59E0B}}` | Literal fallback (optionally `\|#hex/NN`) when no alternative exists. |
| `{{radius:md}}` | Radius scale from `--radius` (rem or px), as a plain number. |
| `{{text:name\|Segoe UI}}` | Raw text (XML-escaped), with fallback. |

Palette colors with alpha (v4 `--border: oklch(1 0 0 / 10%)`) are flattened to opaque colors unless the placeholder says `~`: WPF popups are layered windows, so a translucent border would blend with whatever sits behind the popup. Unresolved placeholders fail the build.

## What the kit restyles

| File | shadcn component |
|------|------------------|
| `Common.xaml` | `PopupBorder` radius, `ShadcnFocusVisual`, control metrics |
| `Media.xaml` | lucide icons, search / clear icon templates, menu icon colors |
| `DefaultControls/Button.xaml` | Button: "secondary" variant (filled, no border) for regular buttons; `IsDefault` = primary |
| `DefaultControls/ToggleButton.xaml`, `RepeatButton.xaml` | Toggle (outline), button chrome |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | Input (+ `ShadcnBareTextBox` for hosts that draw their own chrome) |
| `DefaultControls/ComboBox.xaml` | Select trigger, popover list, check on selected item |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | Checkbox, RadioGroup |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | Slider: 6px muted track, range to the thumb center, 16px white thumb (`ShadcnSliderThumb`, `ShadcnSliderRangeButton`) |
| `DefaultControls/ProgressBar.xaml` | Progress (indeterminate = sliding segment) |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | ScrollArea scrollbar |
| `DefaultControls/ToolTip.xaml` | Tooltip: inverted chip, no border |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | DropdownMenu |
| `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | DropdownMenu surfaces |
| `DefaultControls/TabControl.xaml` | Tabs (muted list, raised active trigger, no border line) |
| `DefaultControls/GroupBox.xaml` | Card without the border line |
| `DefaultControls/ListBox.xaml` | Command / Select item states |
| `CustomControls/SearchBox.xaml` | Input with a leading search icon and a "Search" placeholder |
| `DerivedStyles/DetailsViewItemStyle.xaml` | Details-view rows as Command items (accent fill instead of Playnite's primary edge) |
| `DerivedStyles/PlayButton.xaml` | Button, default (primary) variant |
| `DerivedStyles/WindowBarButton.xaml` | Ghost title bar buttons with icon-set glyphs; close = destructive |
| `DerivedStyles/GridViewItemStyle.xaml` | Cover ring (ring-2 ring-offset-2) |
| `DerivedStyles/HighlightBorder.xaml` | Input chrome for Default templates the kit does not replace |
| Shell files | See **Shell (layout)** |

Everything else (DataGrid, DatePicker, TreeView, Expander, game details views) is Playnite's template recolored by the palette.

## Adding or changing a component

1. Copy the style from Playnite's Default file at the targeted tag (see `playniteVersion` in `scripts/data/playnite-theme-api.json`) into the matching path under `Desktop/`.
2. Swap colors for `Shadcn*` tokens and spacing for the metric keys, keep part names and triggers, and add a header comment naming the shadcn component.
3. New color need? Add a `Color` + `Brush` pair to `Constants.template.xaml` with a placeholder, not a literal. New spacing need? Add a metric key to every kit's `Common.xaml`.
4. `.\scripts\build-theme.ps1 -Extension <theme key>` must pass, then check it in Playnite (`-Deploy`, restart).

## Updating to a new Playnite release

1. Check out Playnite at the new tag and run `.\scripts\update-playnite-theme-api.ps1 -PlayniteSource <checkout> -PlayniteVersion <tag>`.
2. Diff the Default theme between the old and new tag for every file under `Desktop/`; port relevant changes. Check the view controls' part lists (`Controls/Views/*.cs`) for the shell files.
3. Rebuild every theme on the kit. Only raise a theme's `ThemeApiVersion` if the kit now depends on something new (a higher value hides the theme from older Playnite builds).
