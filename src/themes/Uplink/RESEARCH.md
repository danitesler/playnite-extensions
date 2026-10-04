# Uplink — research & sources

## Sources

Blizzard publishes no design system. Where a value could be sourced it was, and `tokens.css` tags every value with where it came from:

| Tag | What | Where |
|-----|------|-------|
| `[FS]` | Text colors of the top navigation (`BattlenetTopNav` 9aebff, highlight white, glow 0078ff), sub navigation (`BattlenetSubNav` 47849e), tab buttons (8dbfea / cce7ff / selected ink 020e1e / disabled 405f71), buttons (`ColorStandardButton` c6f0ff, alternate ffe490), labels (`GlueLabel` 41baff), titles (`GlueTitle` c1ffff); the Subnav Extended button fill (12,33,53) and border glow (0,102,255) | The game's UI data, `Mods/Core.SC2Mod/Base.SC2Data/UI/FontStyles.SC2Style` and `UI/Layout/Common/StandardNavigationTemplates.SC2Layout`, as mirrored in [SC2Mapster/SC2GameData](https://github.com/SC2Mapster/SC2GameData). Layout facts too: `ScreenNavigationSC2.SC2Layout` (72-unit bar, home button first, tab dividers, party panel right). Read for values only; no file from it is shipped. |
| `[UI]` | Navigation bar gradient #090f16 → #121d2b, dividers #1d2b35, sub-nav band #080c14, the lit line under the current tab (#97ebf9 fading out), portrait frame glow #278fe5 | [xavortm/starcraft-ui](https://github.com/xavortm/starcraft-ui), a hand-built HTML/CSS clone of the nav bar. |
| `[eye]` | Surfaces between those values, the Play button blue, the veils | Chosen by eye. Screenshots of the game could not be fetched from the build environment (image hosts were blocked), so none of the layout is measured against a capture. |
| Icons | Original angular line artwork, 24 grid, 1.5 stroke | `art/icons.py` (path data) → `icons/*.svg` → `src/Media.xaml` geometries and `src/Images/Icons/*.png` (`art/render-png.mjs`, Chromium). MIT with the repo. |
| Playnite | Every file starts from the Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`); the game page and side panels follow the shared skeleton. | |
