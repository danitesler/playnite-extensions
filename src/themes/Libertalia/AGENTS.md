# Libertalia — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Uncharted 4: A Thief's End menus** (main menu, pause menu, options, save game; dark only). The library floats on the darkened game art the way the main menu list floats on its scene: muted khaki text at rest, warm ivory for the selected item on a feathered smudge of light that fades out to the right (and moves the row a few pixels in), title case serif type, hairline rules under headers, near-black panels in a thin frame, save-slot outlines for buttons. No accent hue: selection is brightness.

**Unofficial fan theme.** Not affiliated with or endorsed by Naughty Dog or Sony Interactive Entertainment. No logos, icons, fonts, images or game files are included (see `info/NOTICE-Libertalia.txt`). The compass mark is hand-drawn.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Shell fills (`ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `ContentBackgroundBrush`, `TabControlHeaderBackgroundBrush`) are transparent: the menus have no bars.

Type: 12 / 14 / 16 / 19 / 30, title case, normal weight everywhere (the game's 1080p rows are 26 to 28px, titles 30). `HtmlTextView` reads the Colors of the brushes on its `TextElement.Foreground` and `Tag`, so ThemeModifier brush edits reach the description.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px compact column on the window black, the compass (main menu) in a 44x64 cell on top, 44x40 items; khaki glyphs, the current one ivory on a round smudge. Top/bottom docking: a 64px strip where views are title case entries. |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 64px, no fill. Search at the left; icon view switches in the middle between the prompt bar's 1px "\|" rules (`Canvas` separators), current one ivory on the smudge; filter and notifications at the right, 150px kept clear for the caption buttons. |
| `Views/Library.xaml` | Background art over both rows, darkened like the pause menu: black 55% over all, 80% at the left edge fading out by 55% of the width (where the list sits), shades along top and bottom. The library has no fill. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons with thin glyphs, rust close hover, 64px caption height. |

## Game page

Follows the shared skeleton. Differences:

- Header: the name as a screen title (Constantia 30, normal weight, ivory, keeps Playnite's case); Play is the main menu's selected entry in the selected save slot's ivory frame; More and Edit are square khaki-framed buttons.
- Section titles (Description, Notes, Steam screenshots) are options section headers: ivory, 19px, title case, 1px hairline under them.
- Metadata pane on the options panel: near-black in the 3px panel frame, groups split by hairlines; khaki captions, values in the description color, chips as small save slots.
- Banner scrim: black, clear at the top, 70% toward the title.

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations

- **Font**: Constantia stands in for the game's unnamed humanist face; Playnite also applies the user's font setting over `FontFamily`.
- **Smudge**: the game's soft light is drawn as a fill through a radial `OpacityMask`, not a blur. Its indent is 6 to 8px instead of the game's 45px at 1080p, so lists don't jump.
- **No tab strip in the game**: Playnite's tabs become a row of category titles.
- **Panel frame**: the game's frame is about 6px at 1080p; 3px here on the metadata pane, a 1px hairline on popups (WPF popups keep a thin edge).
- **Notification count badge** (`TopPanelNotificationsToggle`) uses `ControlCornerRadius` (0, square like every save-slot shape), not `CornerRadiusFull`: the badge is `MinWidth` 15 x `Height` 15 and grows with two-digit counts, so it is not a 1:1 square and a pill radius would distort it.
- **Scroll bar** has no end arrows.
- **List view column headers** keep Playnite's Default header style.

## Not verified yet

Built and checked statically only (cloud session; Playnite is never started on a server). Not yet seen running: every view, Constantia rendering at 12px, the smudge masks on wide rows, settings tabs, the game edit dialog, top panel dropdowns, filter panel, notifications, progress dialog, the sidebar at top/bottom/right, ThemeModifier edits.

## Preview and screenshots

Screenshots in `art/` (`screenshot-details.png` and `screenshot-settings.png`) are rendered from `art/preview-details.html` and `art/preview-settings.html` via `take-screenshots.ps1`.
