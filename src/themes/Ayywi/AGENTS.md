# Ayywi — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the **ayywi** design system (github.com/danitesler/ayywi), on its default `dark` theme: black page, white as the primary color, alpha hairlines, pill buttons, segmented pill tabs. `dark-soft` (charcoal) would be a token-only sibling theme.

Shared anatomy: **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Tokens | ayywi 0.3.0 `tokens/tokens.json`, compiled to `src/css/tokens.css` (dark), written into `src/tokens.css` with derived washes and lines as hex |
| Components | ayywi `src/components/*/*.css`: button, input, select, checkbox, radio, tabs, menu, tooltip, card, badge, progress (each file's header names its component and numbers) |
| Icons | Lucide 1.49.0 (ISC, `info/LICENSE-lucide.txt`): the pack ayywi's own markup uses (24px grid, stroke 2, round caps) |

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | ayywi's tokens, own names. Control sizes are ayywi's **comfortable** density (40px controls, 14px text). |
| `art/lucide.py`, `art/Media.template.txt` | Generate `src/Media.xaml` (32 `Icon*` geometries, stroked by `IconTemplate`) and `src/Images/Lucide/*.png` (menu icons). Re-run after changing icons or `tokens.css`. `render-icons.ps1` needs WPF, so this is a Python port. Not shipped. |
| `art/mark.svg` | Ring mark of `info/icon.png` (ayywi's favicon). |

## Tokens

| Token | Key |
|-------|-----|
| `color-bg` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `ContentBackgroundBrush`, `TopPanelBackgroundBrush` (one black layer) |
| `color-surface` / `-surface-raised` | `ExpanderBackgroundBrush`, `MainColorDark` (cards) / `PopupBackgroundBrush`, `TooltipBackgroundBrush` |
| `color-text` / `-muted` / `-primary-fg` | `TextBrush` / `TextBrushDarker` / `TextBrushDark` |
| `color-primary` | `GlyphBrush`, `SelectedBrush`, `PrimaryButtonBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush`, progress and slider fill |
| `color-wash` / `-wash-hover` | `ButtonBackgroundBrush`, `InputBackgroundBrush`, `PropertyItemBackgroundBrush` / `HoverBrush`, `ButtonHoverBackgroundBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush` |
| `color-line` / `-line-strong` / `-line-hover` | `WindowPanelSeparatorBrush`, `ButtonBorderBrush` / `NormalBorderBrush`, `InputBorderBrush`, `PopupBorderBrush` (flattened onto surface-raised) / `InputHoverBorderBrush`, `GridViewItemHoverBorderBrush` |
| `color-ring` | `FocusBrush` |
| `color-success` / `-warning` / `-destructive` | `PositiveRatingBrush` / `MixedRatingBrush`, `WarningBrush`, `DataChangeNotifBrush` / `NegativeRatingBrush`, `DangerBrush` |

Radii: `ControlCornerRadius` = radius-control (12), `CornerRadiusSmall` = radius-lg (8), `CornerRadiusLarge` = radius-card (16), `CornerRadiusXLarge` = 24, `CornerRadiusFull` = pill (buttons, chips, tabs). Fonts: `Sora, Segoe UI` and `Unbounded, Sora, Segoe UI` for `HeadingFontFamily`.

## Component spacing (`src/Common.xaml`)

| Key | Value | ayywi |
|-----|-------|-------|
| `ButtonPadding` | 18,9 | control-pad-md 18, 40px tall |
| `InputPadding` | 12,9 | input inline space-3 |
| `MenuPadding`, `ComboBoxDropDownPadding` | 4 | menu padding space-1 |
| `MenuItemPadding`, `ComboBoxItemPadding` | 8,7,12,7 | space-2 / space-3 inline; 33px tall instead of ayywi's 40 (Playnite's game menu is long) |
| `ListBoxItemPadding` | 12,8 | |
| `GroupBoxPadding` | 20 | card padding space-5 |
| `TooltipPadding` | 12,6 | tooltip padding |
| `IconSize` | 18 | Lucide at 18px |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 64px rail, 40px rounded-square items, current item inverted (white fill, black icon); works at all four positions |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 56px bar with a hairline under it; view/filter/sort items in a pill strip like ayywi tabs (checked = white); pill search box; 168px kept clear for window buttons |
| `DerivedStyles/MainWindowStyle.xaml` | 46x32 ghost pill window buttons, close hover in `DangerBrush` |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | 16px gutters, ghost icon buttons |

## Game page

Skeleton and metadata pane as in `../AGENTS.md`; the pane is one card (`ExpanderBackgroundBrush`, 16px radius) with hairline rules between groups. Details view: 112px caption column. Title in `HeadingFontFamily`. Play is the primary pill. Edit and More appear on header hover. `GridViewItemTemplate.xaml` is overlaid: 12px rounded cover masked with a `VisualBrush` inside a `BitmapCache` host, round 44px Play and Info buttons (`GridTileButton`).

## Components

| Playnite file | ayywi component |
|---------------|-----------------|
| `Button`, `RepeatButton` | secondary button; `IsDefault` buttons render as primary |
| `PlayButton` | primary button |
| `ToggleButton` | outline button; checked = inverted |
| `TextBox`, `PasswordBox`, `HighlightBorder` | input (2px ring overlay on focus) |
| `ComboBox` | select |
| `CheckBox`, `RadioButton` | checkbox (4px radius), radio |
| `TabControl` | tabs (pill strip) |
| `Menu`, `ContextMenu`, `GameMenu`, `GameGroupMenu`, `TrayContextMenu` | menu |
| `ToolTip` | tooltip |
| `ProgressBar` | progress (6px pill) |
| `GroupBox` | card |
| `PropertyItemButton` | badge (chip) or text link |
| `Slider`, `ScrollViewer` | no ayywi spec: pill track and thumb from the brief |

## Deviations

- No hover lift, glow, heading tracking or shimmer: WPF templates here cannot animate `translateY` or run CSS effects.
- A theme cannot ship fonts: Sora and Unbounded apply only where installed.
- Main window caption band is the whole 56px top bar (Default: 25px).
- `Expander` and `ExpanderEx` are not restyled (palette recolor only), so the game edit dialog sections are not cards.
- Progress bar indeterminate keeps Playnite's hider animation; it does not slide ayywi's 40% bar.
- Menu items are 33px tall, not 40.

## Not verified yet

Everything was checked statically (`build-theme.ps1`, `validate-extension.ps1 -Mode Package`) and never loaded in Playnite. In particular:

- All first-run checks in `../AGENTS.md`, on Windows with Playnite 10.60.
- Rounded popups (menus, tooltips, dropdowns) need popup transparency.
- Sidebar Library and Statistics icons trigger on `SideItem.Icon` equal to `SidebarLibraryIcon` / `SidebarStatisticsIcon`; if Playnite passes something else, Playnite's own glyphs show.
- `PasswordBox.SelectionOpacity`, the rotated horizontal scroll bar, and the `LOC*` caption keys in the metadata pane (a wrong key shows an empty caption).
- `BitmapCache` on every cover tile in a very large library.
