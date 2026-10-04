# Questlog — research & sources

## Sources

| What | Where |
|------|-------|
| Text colors, font styles | Client UI source, Classic Era 1.15.9 (`Gethe/wow-ui-source`, branch `classic_era`): `Blizzard_Fonts_Shared/Shared/FontStyles.xml`, `GameFontStyles.xml` (`GameFontNormal` 1.0/0.82/0.0, `GameFontHighlight`, `GameFontDisable` 0.5, `GameFontRed` 1.0/0.1/0.1, `QuestFont` / `QuestTitleFont` black, `QuestFont_Shadow_Huge` shadow 0.49/0.35/0.05, `QuestFontNormalSmall` 0.30/0.18/0, `ItemTextFontNormal` 0.18/0.12/0.06) |
| Font families and sizes | `Blizzard_Fonts_Shared/Classic/Fonts.xml`: Friz Quadrata (`FRIZQT__.TTF`) 13 / 14, Morpheus 16, Arial Narrow for numbers |
| Status bar colors | `Blizzard_ActionBar/Classic/ExpBarOverrides.lua` (experience 0.58/0.0/0.55, rested 0.0/0.39/0.88), `Blizzard_UIPanels_Game/Classic/CastingBarFrame.xml` (casting 1.0/0.7/0.0), `SkillFrame.lua` |
| Quest log layout | `Blizzard_UIPanels_Game/Vanilla/QuestLogFrame.xml`: 384x512 frame, the list above the detail scroll frame, quest title and text in black, buttons at the foot |
| Tooltip, item quality | Documented client values that live in data files, not in that source: `TOOLTIP_DEFAULT_BACKGROUND_COLOR` (0.09, 0.09, 0.19), `TOOLTIP_DEFAULT_COLOR` white, `ITEM_QUALITY_COLORS` (#9d9d9d, #ffffff, #1eff00, #0070dd, #a335ee, #ff8000, #e6cc80) |
| Frame, button, bar, knob and paper colors | **Read off the interface art by eye** (dialog border, `UI-Panel-Button-*`, stone bar, scroll knob, quest paper). These are approximations, named `FRAME_*`, `BUTTON_*`, `STONE_*`, `KNOB_*`, `PARCHMENT_*`, `SLOT_*`, `FIELD_*`, `TEXTURE_*` in `tokens.css`. The textures themselves are Blizzard's and are not used or shipped |
| Icons | Original drawings: `art/glyphs.py` (28 glyph geometries), `art/menu_icons.py` (24 painted menu icons and the question mark placeholders). No third-party icon set, so no icon license file |
| Paper | `art/parchment.py`: a seamless procedural tile (`src/Images/parchment.png`) |
| Playnite mechanics | Playnite 10.60 Default theme (`scripts/data/playnite-theme-api.json`); `DescriptionView.html` and `ThemeFile` behavior read from `source/Playnite.DesktopApp/Controls/Views/GameOverview.cs` and `source/Playnite/Controls/HtmlTextView.cs` |
