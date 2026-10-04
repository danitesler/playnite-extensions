# Dropzone — research & sources

## Sources

| What | Where |
|------|-------|
| Colors and measurements | Sampled pixel by pixel from Epic's own screenshots in the Fortnite Creative docs on dev.epicgames.com (fetched 2026-10-01): *Exploring Discover* (lobby with navbar, homebar and rows, Discover rows, island details page), *Let's Play* (lobby, navbar strip, play card with PLAY), *Exploring the Sidebar and Game Menu* (sidebar rail and MENU, settings screen, exit dialog). Each token in `src/tokens.css` names the screenshot and element. Epic publishes no tokens; hover and pressed states are derived and marked so. No image is shipped. |
| Layout notes | The Chapter 5 redesign coverage (Dexerto, Sportskeeda): rounded small icons instead of slanted rectangles, navbar centered at the top, lobby options on the left. |
| Icons | **Material Symbols Rounded**, filled (Apache-2.0, `info/LICENSE-material-symbols.txt`), the closest open set to the game's chunky rounded glyphs. Geometries in `src/Media.xaml` (shifted to a 0..960 grid), menu PNGs in `src/Images/Material/`. Jobs in `icons.json`. |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

The game's font (Burbank Big Condensed) is not free and is not bundled. Body text is Segoe UI; headings, tabs, buttons and titles use **Bahnschrift** (ships with Windows 10+) in Bold with `FontStretch="Condensed"`, the nearest condensed heavy face on every Windows machine.
