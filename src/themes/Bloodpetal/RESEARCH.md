# Bloodpetal: research and sources

Inspired by the interface of *Diablo IV* (Blizzard Entertainment). The game publishes no design tokens or style guide, so every value below was sampled from public captures. Unofficial; no game file is used or redistributed.

## Sources

| What | Where | Notes |
|------|-------|-------|
| Screens | [Interface In Game, Diablo IV Beta](https://interfaceingame.com/games/diablo-iv-beta/): Accessibility, Character selection, Codex, Weapon, Confirmation, 1920x1080 PNG | Viewed and sampled in a browser canvas on 2026-11-11, not saved or shipped. Beta captures (March 2023); the launch UI kept the same chrome. |
| Requested reference | `gameuidatabase.com/gameData.php?id=1783` | Down for maintenance on 2026-11-11, so nothing was taken from it. Re-check the motion and any screen missing above once it is back. |
| Design intent | [PC Gamer on the Feb 2020 quarterly update](https://pcgamer.com/diablo-4-developer-update-showcases-ui-changes-and-darker-more-gritty-monsters), [GamesRadar](https://www.gamesradar.com/diablo-4s-first-quarterly-update-introduces-cannibal-family-left-click-rebinding-and-pc-controller-support) | Blizzard dropped a painterly icon style for one that reads at small sizes, and toned panel colors down. |
| Player criticism | [Blizzard forum: UI/UX feedback from a graphic designer](https://us.forums.blizzard.com/en/d3/t/diablo-iv-ui-ux-feedback-from-a-graphic-designer/9549) | Stone panels and metal trim praised; body type called plain and hierarchy weak. A reason to keep body text in a plain sans and put all character into headings. |
| Fonts | Not confirmed by any source found | The game's display serif and its sans are proprietary. Palatino Linotype (ships with Windows) stands in for headings, Segoe UI for body. Assumption, not a match. |
| Icons | Cut for this theme in `src/Media.xaml` | Nothing traced from the game. |
| Structure | Playnite Default theme 10.60 (MIT) | `info/LICENSE-Playnite.txt` |

## Measured colors

Averages over small regions of the 1920x1080 captures (`getImageData`), or the brightest pixel of a text run. Textured surfaces vary by about +-10 per channel around the value given.

| Region (capture) | Value | Token |
|------------------|-------|-------|
| Outside a dialog (Accessibility) | `#050505` | `bp-abyss` |
| Dialog body | `#09090a` | `bp-pitch` |
| Slider track | `#13191b`, edge `#303a3a` | `bp-well`, `bp-iron-lit` |
| Dropdown field | `#191b1b`, edge `#252b2c` | `bp-slate`, `bp-iron` |
| Tooltip body | `#181d1c` over the scene, `#08090a` over a panel | `bp-tomb` (`#0d0f0f`, between the two) |
| Stone footer under the dialog | average `#262924`, brightest `#52514e` | `bp-stone`, `bp-slab-lit` |
| Section heading band | `#353635`, `#2f302f` | `bp-slab` |
| Checkbox edge | `#5a5046` | `bp-pewter` |
| Dialog frame highlights | up to `#8c8680` | `bp-steel` |
| Heading text (brightest) | `#dbd8d2` | `bp-bone` |
| Option label text | `#b9b1a7`, `#b5aea4` | `bp-parchment` |
| Small button text, captions | `#867f70` | `bp-dust` |
| Disabled button text / fill | `#4b4a4a` / `#232322` | `bp-faded` (reference; disabled controls use Playnite's 0.5 opacity) |
| Button label, dropdown arrow | `#b69d79` | `bp-gilt` |
| Button fill / rim / label shadow | `#521010` / `#6f1312` / `#410807` | `bp-wine`, `bp-rim`, `bp-oxide` |
| Dropdown arrow button | `#96261c` | `bp-blood` |
| Page gem lit / unlit | `#c21714` / `#3c4040` | `bp-gem` |
| Slot counter text | `#e5180d` | `bp-hot` |
| Selected slot frame (Codex) | `#dbdad0` | reuses `bp-bone` |
| Slider fill | `#948d84` | reuses `bp-steel` at 60% |

Chosen, not measured (too small or too mixed with the scene to sample): `bp-ember` and `bp-ember-core` (the glowing line along the Codex panel's head reads orange-red with a near-white core), `bp-legend` (legendary item text, orange), `bp-magic` (blue numbers in item text), `bp-verdant` (positive stat green), `bp-gilt-lit`, `bp-clot`, `bp-slab-dim`.

## Chrome and component rules (observed)

- **Three materials.** Near-black panel bodies, grey cut stone for bands, tabs and footers, and dark iron for frames. Nothing is rounded except gems.
- **Frames** are a dark iron line with a thinner line inside it and a square stud or notch on each corner (dialog, tooltip, character list).
- **Section headings** sit on a full-width stone band about 30px tall at 1080p, opened by a four-point ornament (four small lozenges in a diamond), set in serif capitals with larger initials.
- **Dialog titles** are centred serif capitals over a red haze that is densest behind the words and fades out before both ends of the band.
- **Buttons that act** (Next, Accept, Start) are blood-red plates: a brighter centre, a bright rim, a black outline, gilt serif capitals. Buttons that only offer (Create new character, tabs) are stone slabs. A disabled button is grey stone with grey text.
- **Tabs** are separate stone plates in a row; the current one is a red plate.
- **Selected list row** (character list) is a red plate with a bright rim; a selected grid slot gets a thin bone frame.
- **Dropdown**: dark field, with a red square button holding a gilt triangle at its right end.
- **Slider**: a dark segmented trough, the active part a flat bone-grey block.
- **Checkbox**: a dark square in a warm grey edge. **Paging** under a dialog: round red gems, dark when inactive.
- **A molten line** runs along the head of the large collection panels.
- **Tooltips** are near-black cards in the iron frame with a centred title and an ornament divider.

## Motion

Not measured: the captures are stills and the requested video reference was offline. The theme uses the shared defaults (fades of 120 to 350 ms, loops only while hovered) with the source's materials: plates heat up, the ember seam crawls, light breathes slowly. Treat the durations as provisional until a capture can be frame-stepped.

## What is not reproduced

No logo, no class or skill art, no item icons, no textures or fonts from the game. The stone grain, haze, seam, glow and petals are generated by `art/sprites.py`; the petal mark is the theme's own.
