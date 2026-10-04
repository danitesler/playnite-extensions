# Clutch — research & sources

## Sources

| What | Where |
|------|-------|
| Tokens and component values | The game's Panorama style sheets, `game/csgo/pak01_dir/panorama/styles/*.css` (`csgostyles.css`, `mainmenu.css`, `mainmenu_play.css`, `popups/*.css`, `settings/*.css`, `tooltips.css`, `context_menu.css`), as tracked by **SteamDatabase/GameTracking-CS2** (fetched 2026-09-30). Values were read and rewritten as plain numbers in `src/tokens.css`, each with the selector it came from; no file was copied. |
| Icons | **Material Symbols Sharp**, filled (Apache-2.0, `info/LICENSE-material-symbols.txt`), the closest open set to the game's solid square-cut menu glyphs. Geometries in `src/Media.xaml` (shifted to a 0..960 grid), menu PNGs in `src/Images/Material/`. Jobs in `icons.json`. |
| Crosshair | Original: five rectangles in `src/Media.xaml` (`IconMainMenu`) and `art/mark.svg` (add-on tile). |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

The game's fonts (Stratum2, Noto Sans) are not bundled. Body text is Segoe UI; headings, tabs and the GO label use **Bahnschrift** (ships with Windows 10+), the nearest condensed DIN-like face to Stratum2.
