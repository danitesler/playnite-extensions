# Attache — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the **Resident Evil 4 (2023) menus**: the main menu, the pause/load screen and the options screen. It focuses on the menu elements: a compact icon rail on the left, the brushed pewter selection plate, the glowing tab mark, warm greys on near black. It keeps the minimal look of the other themes here.

Unofficial fan theme. It is not affiliated with Capcom and includes no Capcom logos, fonts, textures or game files (`info/NOTICE-Attache.txt`). The colors were measured on screenshots. The smoke texture and the tile mark are original (`art/`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

`src/tokens.css` holds the measured values under this theme's own names.

`GlyphColor` is amber, not the menus' warm white, so links and checked states stay distinguishable from body text.

Radii are 0 everywhere. Fonts: Segoe UI for body text; `HeadingFontFamily` is **Bahnschrift SemiCondensed** (it falls back to Bahnschrift, then Segoe UI), the condensed grotesque Windows ships, closest to the menus' Helvetica Condensed-like face. WPF has no `text-transform`. Text a template can reach goes through Playnite's `StringToUpperCaseConverter`: sidebar words and the game page section captions. Text it cannot reach uses small caps (`Typography.Capitals`) set a step larger, because small caps are short: tabs and group box captions at `FontSizeLarger`, the Play label at 24, the game name at `FontSizeLargest` (42).

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

Shared templates in `Common.xaml`:
- `SelectionBarTemplate`: the pewter plate. It draws Background as the body, Foreground as the sheen toward the edges, BorderBrush as the edge hairlines, with the smoke texture on top and soft ends.
- `TabItemIndicatorTemplate`: the tab mark.
- `HeadingTextBlock`, `FocusVisual` (a 1px warm-white outline) and `SteamScreenshotsSkeletonTemplate`.

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | **The compact icon rail.** A 44px rail on `page` with a hairline toward the library. The main menu button sits in a 44x56 header, then a short rule. Items are icons only: 44x40 rows with 16px glyphs in `SidebarItemForegroundBrush`. Hover brightens the icon in place with a subtle wash. The current item sits on the brushed pewter selection plate (`SelectionBarTemplate`) in `SelectedForegroundBrush`. Top and bottom are fallbacks: a 56px strip, with 148px kept clear for the caption buttons. |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | A 56px transparent strip over the library art with a hairline under it. The search box (underline only) is on the left; thin icons are on the right. The current view or open panel gets the tab mark. Notifications show an amber dot instead of a count. 148px is kept clear on the right. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons, 12px from the top. Close turns `logo-red`. |
| `Views/Library.xaml` | The background art sits behind the top strip and the library, anchored top right and faded toward the left and the bottom, under a 75% `ScrimBrush` veil (the title-screen scene). |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Black columns with a hairline edge and 16px gutters. |

## Game page

It follows the skeleton in `../AGENTS.md`. Differences:
- **Banner:** darkened by three scrims (35% overall, heavier at the left, heavier toward the title), like the menus' scenes.
- **Title:** small caps at `FontSizeLargest` (42px), in warm white. Section captions are uppercase words over a hairline.
- **Actions:** Play is the always-lit pewter plate; More and Edit are square buttons (44px in details, 40px in the grid panel).
- **Metadata pane:** no card. Group rules are hairlines.

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations

- **No mottled metal art.** The plate is built from gradients plus a generated smoke texture, not the game's texture.
- **Fonts and type:** the menus' fonts are not published. Bahnschrift and Segoe UI stand in for them. WPF has no letter spacing.
- **Game page sizes:** the game page and grid sizes are this theme's own. The menus have no library or game page.
- **Amber accent:** `GlyphColor` (amber) also drives Playnite's unrestyled views wherever they use the accent.
- **No hint line or key prompts:** the menus' centered description line and key prompts have no Playnite equivalent and are left out.

## Not verified yet

Not yet checked in Playnite (built and statically checked in a cloud session only):
- `Bahnschrift SemiCondensed` resolves in WPF on Windows 10/11. Otherwise the fallback to Bahnschrift applies.
- `ThemeFile 'Images/smoke.png'` loads inside the `ImageBrush` in `SelectionBarTemplate`.
- Small caps render with Bahnschrift.
- The look of the sidebar step-out with long add-on titles.
