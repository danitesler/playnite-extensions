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

## Tokens

Radii: `ControlCornerRadius` = radius-control (12), `CornerRadiusSmall` = radius-lg (8), `CornerRadiusLarge` = radius-card (16), `CornerRadiusXLarge` = 24, `CornerRadiusFull` = pill (buttons, chips, tabs). Fonts: `Sora, Segoe UI` and `Unbounded, Sora, Segoe UI` for `HeadingFontFamily`.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

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

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

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

## Preview and screenshots

Screenshots in `art/` (`details.png` and `settings.png`) are rendered from `art/preview-details.html` and `art/preview-settings.html` via `take-screenshots.ps1`.
