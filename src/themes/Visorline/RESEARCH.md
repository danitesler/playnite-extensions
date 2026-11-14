# Visorline — research & sources

## Sources

| What | Where |
|------|-------|
| Reference captures | Game UI Database, Crysis 2 entry (`gameData.php?id=1204`): 15 full-size captures (1920x1080) of the title, welcome, difficulty, campaign, options, graphics, advanced graphics, pause, dialogue, objective and in-game HUD screens. Read in the browser; none are copied, traced or shipped. |
| Game | Crysis 2 (2011) and its Remastered release as shown in those captures. The theme borrows the look of the menus and the Nano Visor HUD only. |
| Tokens | Sampled from the captures (see below). No published token package exists. |
| Fonts | Rajdhani (OFL), bundled, for the squared condensed caps. Body stays Bahnschrift, then Segoe UI. |
| Icons | Drawn for this theme in `src/Media.xaml` (thin 1.5px HUD line language), no icon pack. |
| Motion | Not measured: no video was available. Boot, scan and segment timings come from the brief (`BRIEF.md`). |

## Measured values (1920x1080 captures, dominant colors of the lit pixels)

| Part | Sample |
|------|--------|
| Menu page | near-black `#0a0c0a` to `#0c0d0d`, a darker teal-black `#0a1613` toward the middle where the suit art sits |
| Menu text, idle and selected | pale mint `#9cd3bb` / `#a3d2be` (modal rows `#a5ccbb`) |
| Disabled option | flat grey `#818181` |
| Selected row band | grainy grey-green, `#656b67` to `#949b96` under the text, with a 1px lit mint rule on top and below |
| Vertical rail | 1px mint `#9cd3bc` line with a short ruler of ticks beside it, left of the list |
| Dropdown fill | dark green-grey gradient `#27332c` to `#3b4d43` inside a chamfered plate with a mint rim |
| HUD ink | white-mint `#e8fbf1` (`#d5fce9` in the digits' halo) |
| HUD ammo digits | pure red `#e30c0a` |
| Minimap slab | translucent grey-green `#43584b` to `#668974` with a darker `#36463b` shade |
| Favorite / new marker | neon yellow star `#faf70d` |

## Interface parts seen

- **Menu list:** left-aligned condensed caps, one row per entry, a full-width band for the current row, a yellow star for new content, a faint honeycomb on black, angled corner brackets and `+` registration marks scattered at fixed positions, a mint rule with ruler ticks on the left.
- **Options rows:** caps label on the left, value in a chamfered dropdown plate on the right (the plate's left end points like an arrow); plain caps value where there is no choice; greyed rows are mid grey. Bottom: `« BACK` plate on the left, `DEFAULT` and `APPLY` plates on the right, profile line and a hint line in the centre.
- **Difficulty panel:** a framed card with a header tab top-right, art on top, two lines of caps text below.
- **Campaign screen:** a stats block with thin bars, percentages in large numerals.
- **Pause:** same list over the game, an `OBJECTIVES` header with a long rule, a counter list in the lower right.
- **HUD:** weapon card with segmented stat bars (`ACCURACY`, `RATE OF FIRE`, `MOBILITY`, `DAMAGE`, `RANGE`) and a tall white edge bar; red `000 / 000` ammo digits; a long segmented `ENERGY` bar with the word cut out of the segments, a percent value on its left and three parallelogram tabs under it (`ARMR`, `PWR`, `STLTH`); a minimap drawn as a tilted translucent slab with a compass strip (`N I I E I`) and a ruler edge; `‹ Checkpoint reached ›` and `‹ INITIALIZING ›` notices between angle brackets; contextual prompts (`Press [key] Open door`); an objective line in mint at the top.

## Rules observed

- Everything is drawn in one pale ink on near black. The only other colors are the yellow star (marker) and the red digits (warning).
- Hairlines, never fills, carry structure: 1px mint rules, corner brackets, ticks, `+` marks.
- The one filled shape is the selected band (grey-green, grained) and the chamfered plates.
- Light is soft bloom on the lit ink, not colored glows.
- Caps everywhere, a squared condensed face, wide tracking on small labels.
- Disabled is grey, not dim mint.

## Not read or reused

The CryNet Systems logo in the corner, the suit art, the game's own font files, and the Crysis 2 logo are not used. The mark is this theme's own hex cell with a visor slit.
