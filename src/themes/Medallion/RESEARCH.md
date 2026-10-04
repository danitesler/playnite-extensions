# Medallion — research & sources

## Sources

| What | Where |
|------|-------|
| Colors and sizes | Sampled pixel by pixel from 3840x2160 PC captures of patch 1.32 hosted by interfaceingame.com (main menu, pause, graphics, quests, inventory, character), halved to 1080p; JPEG, so within 2 to 3 per channel. Logo red and frame line widths were re-sampled from the same main menu and graphics captures. Each value in `src/tokens.css` names the screen and element it comes from; the few estimates say why. |
| Font | The game's UI font is PF DIN (`tw3pfdin`, `tw3pfdinb`, per Nexus mod pages), one face on every screen. Not bundled. **Bahnschrift** (Windows' DIN 1451) stands in. |
| Icons | **Phosphor Icons, Light** (MIT, `info/LICENSE-phosphor.txt`), the closest open set to the game's thin engraved glyphs. Paths from `phosphor-icons/core` `assets/light`, kept on their 256 grid in `src/Media.xaml`. Playnite's menu icons keep its icofont glyphs. |
| Mark | Original: two rings and a wolf head of straight cuts, `art/mark.svg` (add-on tile) and `IconMainMenu`. |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

Next-gen 4.0 added main menu items but no restyle that we could find. Pre-1.20 (2015) inventory and journal screens looked different and were not used.
