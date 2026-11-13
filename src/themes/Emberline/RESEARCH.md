# Emberline: research

What the source is, measured. What the theme does with it: [`BRIEF.md`](BRIEF.md).

## Sources

| What | Where | Notes |
|------|-------|-------|
| Requested reference | `gameuidatabase.com/gameData.php?id=294` (Gears 5) | Behind a Cloudflare bot check on 2026-11-12; not read. Nothing was taken from it. |
| Captures, 1920x1080 PNG | [Interface In Game, Gears 5](https://interfaceingame.com/games/gears-5/): Main menu, Accessibility, Lobby, Campaign, Loading, Map, Extras, Account, Collectibles, Item, Upgrading Jack, Ability | Downloaded for sampling on 2026-11-12, not shipped. |
| Captures, 2500x1406 | [Stephen Cleland, Gears 5 UX/UI](https://stephencleland.squarespace.com/work/gears-5-ux): Customization, Weapons, Classes, Store details, Accessibility, Key mappings, Video settings | Sampled, not shipped. The page describes no tokens or type. |
| Captures from the user | Five 1920x1080 screens: Options (Audio, Accessibility), Main menu (Operation 4), Campaign cards, Campaign lobby | Used to confirm the above. |
| Credits | [ArtStation Magazine, The Coalition art blast](https://magazine.artstation.com/2019/09/the-coalition-gears-5-art-blast-hard-surface-ui-marketing-tech-art/) (search result only; the page refused automated reading) | Front-end / UI artist Mike Tam, art director Aryan Hanbeck. |
| Fonts | No source names the game's faces | Display face: heavy, squared, proprietary. Body: DIN-style. See Type. |
| Icons | Cut for this theme in `src/Media.xaml` | Nothing traced from the game. |
| Structure | Playnite Default theme 10.60 (MIT) | `info/LICENSE-Playnite.txt` |

## Colors (sampled)

Median or brightest-pixel samples of a region of each capture (panel interiors, label strokes, frame bands).

| Role | Value | Capture | Token |
|------|-------|---------|-------|
| Options panel | `#111010` | Accessibility | `em-panel` |
| Row / card fill | `#0a0a09` (cards `#060707`) | Accessibility, Customization | `em-pit` |
| Row hairline | `#2d2d2d` to `#383838` | Accessibility | `em-edge`, `em-edge-lit` |
| Card hairline | `#4b4b4b` | Customization | `em-edge-card` |
| Scroll thumb | `#8b8b8b` | Accessibility | `em-steel` |
| Rule ends (cool grey) | `#445055` | Accessibility, top rule | `em-rule` |
| Flare core | `#fffefc`; cold tint `#cbeef5` | Accessibility; Upgrading Jack | `em-white`, `em-flare` |
| Idle label, values | `#b9b9b9` | Accessibility | `em-label` |
| Hint text | `#a2a2a2` | Accessibility | `em-note` |
| Selected label, key caps | `#fffefc` | Accessibility | `em-white` |
| Ember frame, bright | `#ff2100` / `#fc2100` | Customization (selected card) | `em-ember` |
| Ember frame, dim glow | `#54170c` | Accessibility (selected row) | `em-ember-dim` |
| Main menu red | `#ce0909`, streak peak `#fa0000` | Main menu | `em-lancer` |
| Class header, assault | `#210302` (tank `#021121`, support `#022202`, promo `#1e071b`) | Classes | `em-blood` |
| Hold-to-build bar | `#f81a00` | Upgrading Jack | `em-ember` |
| New-item badge | `#e86c02` | Customization | `em-alert` |
| Boost text / ice | `#8bb9c7` / `#72d2e7` | Customization; Loading | `em-frost`, `em-ice` |
| Tiers | legendary `#ffd213`, epic `#be6edc`, rare `#23ccdc` | Store details | `em-gold`, `em-epic`, `em-rare` |

Derived, not sampled: `em-plate` and `em-plate-lit` (hover and pressed plates, one and two steps above the panel), `em-cinder` (a black plate lit by its frame), `em-support` (the support green lifted until it reads as text).

## Chrome and rules observed

- **Options rows.** Flat black plates, 1px hairline, about 44px tall at 1080p with 8px gaps, label 20px inside. The left list and the right value rows are the same plate.
- **Selection.** Never a filled accent. The selected row, card or button keeps its black fill and gets a rough burning frame: a band 3 to 6px thick with ragged edges, hotter in patches, a dim halo and small sparks outside. The label turns white (idle is grey). Cards also grow a docked strip under them with a key cap and an action ("[A] BROWSE SAVES").
- **Main menu.** No plates. The current item turns red and a red light streak runs to it from the screen's left edge.
- **Panel rules.** A panel opens and closes with a hairline that fades at both ends under a bright flare at its centre.
- **Screen titles.** Heavy caps, with a white slanted tab running off the left edge before the title.
- **Key caps.** White boxes with dark text name every action in the footers. The current page in the bottom tray is a white disc with a dark glyph; the tray itself is a low trapezoid.
- **Value rows.** `‹ value ›` with thin chevrons. Sliders are a thin line with a short tick at each end and a vertical tick for a thumb.
- **Scroll.** A thin square grey bar, no rail.
- **Loading.** A mark frozen in ice, cold blue glow on black.
- **Tour panel.** Objectives over thin gold progress rules.

## Type

- Display: heavy squared caps, proprietary, not identified. **Russo One** (Jovanny Lemonad, OFL 1.1, Reserved Font Name "Russo") stands in and is bundled unmodified in `src/Typography/`. An eyeball match, not a confirmed one.
- Body: DIN-style. **Bahnschrift** ships with Windows 10 and later. WPF draws only its Regular instance (variable axes are ignored), so weights are synthesized.
- Everything in the source's menus is uppercase. The theme uppercases what it can reach through `StringToUpperCaseConverter` (game title, window titles, buttons, tabs, group and section headings); Settings tree rows and metadata stay mixed case (repo rule and legibility).

## Motion

**Not measured.** No video of the menus was available; only stills. The stills show end states (frame lit, streak drawn, flare lit). Durations, easing and the flicker loop in `BRIEF.md` are design choices built on those states, not timings taken from the game. Re-check against a menu capture when one is available.

## Assets

`art/sprites.py` (Pillow + numpy, seed 505) generates every sprite as a white mask: the four ember strips (256x14, tile along their length), `glow`, `flare`, `grime`, `frost`. Review sheet: `art/fx-sheet.png`. Nothing is taken from the game.
