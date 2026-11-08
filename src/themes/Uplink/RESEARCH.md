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

## Motion

How the menus move, read from the game's own UI data (SC2Mapster/SC2GameData, `mods/core.sc2mod/base.sc2data/UI/Layout/Common/StandardNavigationTemplates.SC2Layout` and `StandardTemplates.SC2Layout`; values only, nothing shipped). Animation keys there are in 0 to 255 alpha and seconds; `Fast` and `Slow` are the engine's curve names.

| What | Found | Used for |
|------|-------|----------|
| Top nav button hover (`HoverFrameImage`, `Hovered`) | Fade 0 to 255 over 0.4s (`out="Fast"`, `in="Fast"`), `OnMouseExit` plays the same animation reversed | Hover fades everywhere: 0.4s ease in-out in, 0.4s out. Small cover buttons use 0.3s |
| Top nav selected (`SelectedFrameImage`, `UnderlineImage`, `GlowImage`) | 0.5s fades, `Slow` ending, reversed when the tab is left | Selected states stay static in the theme (setters); only hover animates |
| Selected glow (`SelectedGlowImage`, `Glow2Image`, `BlendMode Add`) | Loop: 0 to 150 (or 255) at 1.2s, back to 0 at 2.4s, `Slow` curves | The hover "breathing": glow 0.7 to 1 and back on a 2.4s loop (Play), cover glow 1 to 0.65 (1.2s each way) |
| Sub nav bottom line (`BottomLineHighlightAnim`) | A highlight on the bottom rule, alpha 0 / 100 / 175 / 150 / 0 over a 10s loop, anchor moving along the line | The streak running along Play's bottom beam, and along the empty page's rule (one pass per 2.4s and 3.2s) |
| Sub nav background (`FadeNav`) | Fade in over 0.95s on show | Not used (no show animation on the strip) |
| Standard buttons (`StandardButtonTemplate`) | Normal and Hover are state images swapped by the engine; no animation is defined in the layout | No source timing for Play: it reuses the nav hover (0.4s fade) and the glow loop. Marked as an inference |
| Pressed | `PressedState` toggles a border glow in 0,102,255; no timing | Own plate, 0.08s in, 0.2s out (chosen) |

Not verified: the real feel of the 0.4s fade (the engine's `Fast` is not a documented easing; sine in-out is an approximation), the tile list hover (not read), sounds. The cover buttons' rise and scale come from the shared interactive layer recipe, not from the game (the menus do not move buttons).
