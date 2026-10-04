# Biome — research & sources

## Sources

| What | Where |
|------|-------|
| Tokens and component values | Terraria 1.4.4.1 UI classes as published decompiled: `UIPanel`, `UITextPanel`, `UIScrollbar`, `UICharacterListItem`, `UIWorldListItem`, `UICharacterSelect`, `UIWorldSelect`, `UICharacterCreation`, `Main.DrawMenu`, `Utils.DrawInvBG`, `Terraria.ID.Colors` (github.com/br4dnblehh/terraria-source-code, cross-checked with tModLoader's `UICommon.cs`, read 2026-10-01). Values are rewritten as plain numbers in `src/tokens.css`, each marked `source` or `approx.`; no code was copied. |
| Approximations | Sky colors, panel corner rounding and the scroll bar and slot tints are drawn from textures in the game; eyeballed from screenshots and marked `approx.` in `tokens.css`. |
| Icons | **Pixelarticons** 2.4.1 (MIT, `info/LICENSE-pixelarticons.txt`, commit pinned in `art/icons.py`): whole-pixel glyphs on a 24px grid, the closest open set to the game's pixel-art UI. |
| Tree mark | Original, 16px pixel grid in `art/icons.py` (`IconMainMenu`, `art/mark.svg`, `info/icon.png`). |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

Andy Bold (the game's font, commercial) is not bundled. `HeadingFontFamily` is `Andy, Segoe UI Black`, so Andy is used where installed and Segoe UI Black otherwise; body text is Segoe UI.
