# Night City — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, in the style of the **Cyberpunk 2077 yellow look**: black panels, Cyberpunk yellow (`#FCEE09`) as the main accent, cyan as the secondary accent, red for danger, square and chamfered shapes. Unofficial fan theme: no CD PROJEKT RED assets, logos or fonts are shipped. "Cyberpunk 2077" is a trademark of CD PROJEKT S.A.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

All colors are in `src/tokens.css` (dark block); the template maps them by role.

| Token | Key | Used for |
|-------|-----|----------|
| `cp-yellow` | `GlyphBrush`, `SelectedBrush`, `ThumbBrush`, `MixedRatingBrush`, `WarningBrush`, `GridViewItemHoverBorderBrush` | The accent: selection, checked, links, thumbs, hover outline on covers |
| `cp-cyan` | `HighlightGlyphBrush`, `FocusBrush`, `PositiveRatingBrush`, `DataChangeNotifBrush` | Keyboard focus, text input focus, scores, secondary accent |
| `cp-red` | `DangerBrush`, `NegativeRatingBrush` | Destructive actions, close hover |
| `cp-void` | `WindowBackgourndBrush`, `InputBackgroundBrush`, `TooltipBackgroundBrush`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `BackgroundToneColor` | Page, inputs, rail, top bar |
| `cp-panel` | `NormalBrushDark`, `PopupBackgroundBrush`, `ExpanderBackgroundBrush`, `ContentBackgroundBrush` | Cards, popups, library layer |
| `cp-panel-raised` | `NormalBrush`, `ButtonBackgroundBrush` | Control fill |
| `cp-text` | `TextBrush`, `DangerForegroundBrush`, `PrimaryButtonHoverBackgroundBrush` | Body text; the Play button turns off-white on hover |
| `cp-text-muted` at 60% | `TextBrushDarker` | Secondary text |
| `cp-on-yellow` | `TextBrushDark` | Black text on yellow fills |
| `cp-yellow` at 16% / 28% / 20% / 70% | `HoverBrush` and `ButtonHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` / `ProgressBarTrackBrush` / `ScrollBarThumbBrush` | Derived tints |
| `cp-yellow` at 45% / 30%, `cp-yellow-edge` | `NormalBorderBrush` / `WindowPanelSeparatorBrush` / `PopupBorderBrush` | Hairlines |

Radii: `ControlCornerRadius` 2px, `CornerRadiusSmall` and the rest 0; the look is square. Thin tracks use explicit half-thickness radii (4px slider track = 2, 6px progress bar and scrollbar thumb = 3). Fonts: `FontFamily` = Rajdhani, Bahnschrift, Segoe UI; `MonospaceFontFamily` = Consolas. Sizes are Playnite's scale (12/14/15/20/29).

## Component spacing (`src/Common.xaml`)

| Key | Value | Why |
|-----|-------|-----|
| `ButtonPadding` | 16,6 | Dense game-menu buttons |
| `InputPadding` | 10,6 | Inputs and dropdown |
| `MenuPadding` / `MenuItemPadding` | 0,4 / 14,7 | Context menus |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,2 / 10,6 | Dropdown |
| `ListBoxItemPadding` | 10,6 | List rows |
| `GroupBoxPadding` | 14 | Cards |
| `TooltipPadding` | 10,6 | Tooltips |
| `IconSize` | 16 | Phosphor bold at 16px |
| `GameBannerHeight` | 340 | Default banner; the spacer ratio is `x * 220 / 340` (details) and `x * 160 / 340` (grid) |

These are this theme's own values: there is no published spec to quote.

## Shell

| File | What it draws |
|------|---------------|
| `Views/MainWindow.xaml`, `DerivedStyles/MainWindowStyle.xaml` | Frame on `ShellBackgroundBrush`; `MainWindowButton` (close hover = `DangerBrush`) |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px left rail, items 44x40 with 16px glyphs, yellow marker and tinted plate on the current item; `MainMenuButton` |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml` | 52px black strip, icon-only view switches (current = solid yellow plate, black glyph, one 8px cut corner), search box on the right (`TopPanelSearchBox`), 128px kept clear for the window buttons |
| `Views/Library.xaml` | Library art at 0.18 opacity, not feathered |

## Game page

Follows the skeleton in `../AGENTS.md`. The banner spacer uses `MathConverter` with the default 340 banner; with `ActualHeight` 0 it drops to 24. Metadata is one card with six collapsing groups separated by 1px yellow rules, with one cut corner. Steam screenshots show a skeleton for Steam games (`SteamScreenshotsSkeletonTemplate`).

## Components

| Playnite file | Night City component |
|---------------|----------------------|
| `Button`, `ToggleButton`, `RepeatButton` | Near-black fill, 1px yellow hairline, yellow tint on hover, cyan focus box (`FocusVisual`) |
| `TextBox`, `PasswordBox`, `BareTextBox` | `InputBackgroundBrush`, hairline, cyan edge on `IsKeyboardFocusWithin` |
| `CheckBox`, `RadioButton` | 16px square box (yellow fill, black check) and a 14px circle with a 6px dot |
| `ComboBox`, `ListBox`, `TabControl`, `GroupBox` | Square; active tab with a cut corner; cards with a yellow top hairline |
| `Slider`, `SliderEx`, `ProgressBar`, `ScrollViewer`, `Thumb` | 4px slider rail, 6px progress and scrollbar thumb, yellow fill |
| `ToolTip`, `ContextMenu`, `Menu`, `GameMenu`, `GameGroupMenu`, `TrayContextMenu` | Black popups with a 1px yellow edge, yellow-tinted hover rows |
| `DetailsViewItemStyle`, `GridViewItemStyle` | Hairline rows, solid yellow selection with black text; cover hover outline |
| `PlayButton`, `PropertyItemButton`, `WindowBarButton`, `HighlightBorder` | Solid yellow CTA with a cut corner; yellow text links and square chips |
| `FilterPanelView`, `ExplorerPanel` | Hairline rows, yellow section headers |

## Deviations

- Yellow is the franchise and fan-UI yellow; the real in-game screens that could be sampled are red and cyan (see Sources).
- Rajdhani is not shipped (`Fonts/` is not allowed) and is not a Windows font; without it the stack falls back to Bahnschrift. The HTML previews render in a system font here, so the shots show neither face.
- Cut corners are a single 8px triangle drawn in the surface brush on a few elements, not a full chamfer on every control.
- No `SliderTrackBrush` or `ProgressBarForegroundBrush` is defined: the slider rail uses `ProgressBarTrackBrush` and the progress fill uses `GlyphBrush`.
- The indeterminate `ProgressBar` scales a fill from the left instead of Default's opaque masks, which would show through a translucent rail.
- `OpacityMask` gradients on the banner use the named colors `Black` and `Transparent`: a mask needs a color and `*Color` keys are not allowed.
- Library art is dimmed, not feathered, for the same reason.
- `TrayContextMenu`, `GameMenu` and `GameGroupMenu` are `BasedOn` the theme's ContextMenu; Default ships them as full templates.
- Menu check mark and submenu arrow are drawn with `IconCheck` and `IconSubmenu` instead of Marlett glyphs.
- Menu icons Playnite copies (`AddGameIcon`, ...) stay Playnite's Default icofont ones.

## Not verified yet

- **Never loaded in Playnite.** Written and built on Linux: the build and package validation pass and every attribute was checked against Default, but WPF never parsed these files. Check `playnite.log` for `XamlParseException` on first start.
- Whether `{Binding Game.PluginId}` for the Steam skeleton matches Playnite's view model (if not, the skeleton never shows).
- Whether `PART_ElemMainMenu` accepts a `Border` style for `MainMenuButton`.
- Cut-corner triangles against the surface brush behind them on hover and selected states.
- Rajdhani and Bahnschrift rendering and text fit.
- ThemeModifier: palette edits and Edit constants recoloring the restyled controls.
- Screenshots come from the HTML previews, not Playnite.
