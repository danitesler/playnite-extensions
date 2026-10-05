# Codex — research & sources

## Sources

| What | Where |
|------|-------|
| Look and layout | The in-game menus, reproduced from memory of how they look and are laid out (tab strip, list on the left and detail on the right, ivory on charcoal with gold, diamond markers, corner brackets). **No screenshots or game files were available while building**, so nothing is measured: every value in `tokens.css` and every size in `Common.xaml` is an estimate to tune against the game. |
| Tokens | None published. `tokens.css` holds this theme's own values under descriptive names (`void`, `night`, `slate`, `ivory`, `gold`, ...). |
| Fonts | Ship with Windows, none bundled: Segoe UI Semilight (body), Palatino Linotype with Book Antiqua and Georgia behind it (headings). |
| Icons | Original artwork, drawn for this theme: 47 thin-line SVGs in `icons/` (24 grid, 1.5 stroke, miter joins, diamonds where other sets use dots). Not copied or traced from any game or icon pack. |
| Playnite | Default theme files at the tag in `scripts/data/playnite-theme-api.json` (MIT, `info/LICENSE-Playnite.txt`) are the starting point of every file. |

What "copying the menus" means here: the layout, hierarchy, states and motifs are reproduced; the games' logos, art, fonts and icon drawings are not, and would not be shipped. `info/NOTICE-Codex.txt` says so in the package.
