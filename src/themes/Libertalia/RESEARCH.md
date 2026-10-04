# Libertalia — research & sources

## Sources

| What | Where |
|------|-------|
| Colors and sizes | Pixels sampled from the 1920x1080 captures of the **Legacy of Thieves PC version** (build 1.3.20900) on interfaceingame.com/games/uncharted-4/ (main menu, collection launcher, pause, display, audio, controls, accessibility, difficulty, save game), read 2026-10-01. No PS4 2016 captures were found. The game publishes no style sheet, so `src/tokens.css` names each value after where it was read; states the captures do not show are marked "derived". |
| Layout | Same captures: the main menu is a plain left-aligned list in the left third with no logo, five entries; options screens are one framed panel per category with section headers over hairlines and value rows; the pause menu darkens and blurs the scene. |
| Icons | **Material Symbols Sharp**, outlined, weight 300 (Apache-2.0, `info/LICENSE-material-symbols.txt`): the menus carry almost no icons, so the lightest open set. `art/icons.py` prints the `Media.xaml` geometries (works on any OS; `icons.json` is the same job for `render-icons.ps1`). |
| Compass mark | Original: `IconMainMenu` in `src/Media.xaml` and `art/mark.svg` (add-on tile). |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

The game's UI typeface is undocumented (a humanist face with slight flares) and not bundled. **Constantia** (ships with Windows 7+) stands in everywhere, body and headings, through `FontFamily` and `HeadingFontFamily`. Playnite's own menu icons keep their icofont glyphs, recolored by the palette.
