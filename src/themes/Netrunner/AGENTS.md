# Netrunner — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the menus of **Cyberpunk 2077** (patch 2.x, PC): a cold blue-black page, menu text, headings and rules in the game's red, a dark red wash with a red edge bar on the selected row, cyan for whatever is active or focused, the brand yellow for notifications, and a cut-corner red plate for Play. Square corners otherwise, no glow.

**Unofficial fan theme.** No CD PROJEKT RED assets: the mark is original, the icons are Phosphor. Rajdhani (OFL) is named first but not bundled; the fallback is Bahnschrift, which Windows 10+ ships. Cyberpunk 2077 is a trademark of CD PROJEKT S.A.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

Structure (shell wiring, game page, control templates) was built from Playnite's Default files, then recolored and restyled.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens (`src/tokens.css`)

| Token | Key | Used for |
|-------|-----|----------|
| `cp-page` 0b0b12 | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `TopPanelBackgroundBrush`, `NormalBrushDark` | Page |
| `cp-black` | `ShellBackgroundBrush` | Rail |
| `cp-row` 16161f | `ButtonBackgroundBrush`, `InputBackgroundBrush`, `NormalBrush` | Rows, buttons, inputs |
| `cp-row-hover` 2a1416 | `HoverBrush`, `ListItemHoverBrush`, hover keys | Red wash on hover |
| `cp-row-selected` 52272a | `ListItemSelectedBrush`, `ToggleButtonCheckedBackgroundBrush` | Selected row (MainColors.DarkRed) |
| `cp-red` ff6158 | `GlyphBrush`, `SelectedBrush`, `PrimaryButtonBackgroundBrush`, `HeadingForegroundBrush`, `TabItemIndicatorBrush`, `ProgressBarForegroundBrush`, `PropertyItemForegroundBrush` | Menu ink, Play plate, rules |
| `cp-cyan` 5ef6ff | `SelectedForegroundBrush`, `FocusBrush`, `SliderThumbBackgroundBrush`, `CheckBoxHoverBorderBrush`, `GridViewItemSelectedBorderBrush` | Active and focused element, ticks |
| `cp-rule` 5c2b2d | `NormalBorderBrush`, `TopPanelSeparatorBrush` | 1px control edges, dividers |
| `cp-text` / `-dim` / `-ink` | `TextBrush` / `TextBrushDarker` / `TextBrushDark` | Pale body type, dim captions, dark ink on red |
| `cp-yellow` | `DataChangeNotifBrush`, `WarningBrush` | Notifications |
| `cp-danger` ff2b45 | `DangerBrush` | Close hover, destructive |

Radii are all 0 (`CornerRadiusFull` also 0, so the repo radius rule holds by construction). The cut corner on Play is geometry, not a radius. `ControlBorderThickness` 1, `FrameThickness` 2.

## Component spacing (`src/Common.xaml`)

Unchanged from the forked structure: rows 34px (`ButtonPadding` 16,7.5; `InputPadding` 8,7.5), menu rows 30, `IconSize` 18, `GameBannerHeight` 340.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px compact black rail, 1px red rule on its inner edge (60%), 44 x 40 items with 16px red glyphs; hover is the red wash; current item is the dark red wash, a 2px red bar on the left and a cyan glyph |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 56px bar on the page color ending in a tapered dim red rule; dim glyph hints, cyan when hovered or current with a red underline |
| `DerivedStyles/MainWindowStyle.xaml` | 44 x 32 window buttons, close hovers the alarm red |
| `Views/Library.xaml` | Library art darkened and vignetted |

## Game page

Skeleton and metadata pane as in `../AGENTS.md` (screenshots left above the description, spacer scaled from `HeroArt` through `MathConverter`, 100/340 details, 72/340 grid). Headings are red uppercase with a short red underline; Play is the red cut-corner plate with dark ink.

## Components

| Playnite file | Cyberpunk 2077 element |
|---------------|------------------------|
| Button, ToggleButton, TextBox, ComboBox | Menu row with a 1px dim red edge; hover adds the red wash and a 2px red edge; keyboard focus is a cyan frame |
| PlayButton | Confirm plate: red fill, dark ink, bottom-right corner clipped 10px |
| CheckBox, RadioButton | Red outlined box / ring, cyan tick / dot |
| Slider, ProgressBar | Red fill on a dark red rail, cyan tick thumb |
| ListBox, DetailsViewItem | Dark red wash with cyan text when selected |
| TabControl | Uppercase tabs, cyan with a red underline when current |
| Menu, ContextMenu, ToolTip | Blue-black tooltip panel with a dark red edge |

## Deviations

- No glitch, chromatic aberration or scanline effects in WPF (the previews draw a faint scanline only).
- Only Play has the cut corner; WPF has no cheap clip that scales with every control.
- Colors are recalled ink values and capture estimates, not a verified data dump.

## Previews

`art/preview-details.html` and `art/preview-settings.html` are approximate HTML replicas rendered to `art/details.png` and `art/settings.png` by `.\scripts\take-screenshots.ps1 -Extension netrunner`. Not Playnite captures.

## Not verified yet

- Everything in a real Playnite: `build-theme.ps1` and `validate-extension.ps1` have not been run (authored on Linux, no PowerShell). Template placeholders and XML well-formedness were checked with a script.
- Sidebar at Top, Bottom and Right.
