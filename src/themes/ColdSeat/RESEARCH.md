# ColdSeat — research & sources

## Sources

Blizzard publishes no design system and the game draws its panels with BLP textures, so only text values are sourced. `tokens.css` tags each value `[FDF]` (verified) or `[eye]` (estimated).

| Tag | What | Where |
|-----|------|-------|
| `[FDF]` | Label/button text gold `#FCD312` (FontColor 0.99 0.827 0.0705), highlight white, disabled `#808080`, shadow black at 90%, titles white (glue) or gold (main menu); Friz Quadrata (`FRIZQT__.TTF`) for every UI font; frame proportions (glue button corner 0.016, Esc panel 0.288 x 0.384 with 0.01 insets, checkbox 0.024, radio 0.016, slider 0.139 x 0.012, scrollbar 0.012, edit box 0.04 tall) | `EscMenuTemplates.fdf` in [tdauth/wowr](https://github.com/tdauth/wowr) @ `361680f`; `UI/FrameDef/Glue/StandardTemplates.fdf`, `UI/war3skins.txt` in [WarRaft/War3.mpq](https://github.com/WarRaft/War3.mpq) @ `bce1f9d`. The skin files read were the Human skin; the Frozen Throne main menu skin itself was not read. |
| `[eye]` | Void `#05080F`, night `#0B111B`, stone `#2A2F36`, stone rim `#6B7480`, ice `#5FB4E8`, ice light `#BFE6FF` and the derived steps | Chosen by eye from memory of the menu scene; nothing is measured against a capture (image hosts were not reachable). |
| Fonts | Friz Quadrata TT, then Palatino Linotype, Book Antiqua, Georgia | Friz Quadrata is not bundled and not on Windows. |
| Icons | Original line artwork, 24 grid | `src/Media.xaml`; menu icons stay Playnite's glyphs. MIT with the repo. |
| Tile icon | `art/mark.svg` (original ice spire), default orange | `scripts/render-addon-icon.py` |
| Playnite | Every file starts from the Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`) | |
