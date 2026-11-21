# Brushlight: research

Source: Clair Obscur: Expedition 33 (Sandfall Interactive, Kepler Interactive, April 2025). Unofficial; no logo, art or font file is copied. Captures: the 24 UI screenshots at 1920x1080 on <https://interfaceingame.com/games/clair-obscur-expedition-33/> (viewed in the browser pane, colors sampled with a canvas on the loaded image; nothing saved to disk). Game UI Database also lists the game (<https://gameuidatabase.com/gameData.php?id=2060>) but sits behind a bot check, so it was not used. Colors are 5-bit quantized samples (dominant color in a rectangle, or the dominant bright color for ink), rounded in `src/tokens.css`.

## Sources

| What | Where |
|------|-------|
| Screens | interfaceingame.com captures: pause, logo (start screen), character, character-2, character-selection, inventory, inventory-2, skill-tree, store, accessibility (settings), controls-map, result-screen (Victory), game-over (Expedition Failed), dialogue-2, tutorial (combat commands), hud-3 to hud-6, autosave |
| Type | Not published by the studio (Steam threads only note the ornamented face is hard to read). Display caps match Cinzel (open, bundled); body is an old-style serif, Palatino Linotype on Windows; numerals are a tall condensed grotesque, Oswald (open, bundled) |
| Icons | Drawn for the theme in the game's manner (thin strokes, diamonds); nothing from the game |

## Surfaces and measured colors

| Part | Sample | Token |
|------|--------|-------|
| Screen black behind menus (smoky paint) | `#070605`, mid `#130f0c` | `--void`, `--smoke` |
| Plate fill (settings rows, inventory rows, tabs) | `#1c1c1c` (82%), darker half `#141414` | `--plate`, `--plate-deep` |
| Card surface (character select, description card) | `#1c141c` (plum-tinted black) | `--card` |
| Art Deco lattice on cards and screen corners | `#3c342c`, `#443c34`, `#2c2c24` | `--bronze`, `--bronze-lit` |
| Selected tab / setting tab (Quest Items, ACCESSIBILITY) | `#341c2c`, edge `#3c2434`, rim `#4c3444` | `--plum`, `--plum-lit` |
| Headings, values, selected tab label (ATTRIBUTES, CAMERA, VICTORY, names, levels) | `#e8c8a8` (79% of the ink) | `--cream` |
| Body text and plate labels | `#fcfcfc` / `#f4f4f4` | `--white` |
| Muted ink (descriptions, Owned) | `#988878`, `#887868` | `--muted` |
| Dry-brush plate rim (broken chalk white) | `#fcfcfc` at partial coverage, grey `#b4b4b4` | `--rim` |
| HP bar on the character cards | `#942c24`, dark `#7c2424`, lit `#9c3c3c` | `--hp`, `--hp-deep` |
| Expedition Failed linework and lettering | `#b82828` | `--blood` |
| Ochre paint smear under the combat commands | `#b88858`, `#a88858`, dark `#584838` | `--ochre`, `--ochre-deep` |
| Gold icon ink (Pictos star, Chroma) | `#b49434` | `--gilt` |
| Special merchant row tint | `#0c1c1c` | `--teal-deep` |
| Lumina (Colour of Lumina item, luminous cyan) | `#58f8d8`, `#78f8e8` | `--lumina` |
| AP pips | `#2888d8` | `--ap` |
| Pictos equipped diamond | `#18f878` | (not used: too loud for a library) |

## Interface parts (the game element map reads from these)

- **Tapered plates.** Every list row, tab and value field is a dark plate with a pointed left end (a 10-14px arrow notch) and a cut right end, edged by a broken dry-brush white rim (chalky, 1-2px, gaps along it). Settings rows are 30px; inventory tabs are lozenges pointed at both ends. The selected row grows: it reaches further left past the column, its rim brightens, the label grows a step and turns white.
- **Plum selection.** The selected tab (inventory Quest Items, settings ACCESSIBILITY) is filled plum `#341c2c` with a cream label; everything else is charcoal with white labels.
- **Spinners.** Values sit between thin chevrons `‹ Enable ›`; sliders are a flat grey segment `#848484` on the plate with the number to the right in Oswald.
- **Section headings.** Cream Roman capitals with taller initials (CAMERA, BATTLE, IMAGE, MERCHANT, ATTRIBUTES), left aligned above their rows.
- **Hairline rules with a crossing tick.** Victory / Battle Loot / Kills headings sit on a long hairline that starts past the text with a short vertical tick crossing it (a surveyor's mark) and fades out to the right; "Recently Obtained" sits on a torn white brush smear with the same rule under it.
- **Description card.** Right-hand panels (Camera Shake, Festival Token, Colour of Lumina): `#1c1c1c` card, small cream corner ticks at the top left and bottom right, title in cream caps centered, icon, centered body.
- **Key prompts.** Every action carries a keyboard prompt: a 22-26px square hairline box with rounded 2px corners and a cream letter (F, E, Esc, Q, R), the label beside or under it. Bottom buttons (Buy Item, Fight Merchant, Back) are trapezoid plates (wider at the top) with the prompt box under the label.
- **Combat commands.** Aim / Items / Skills / Attack stack down a diagonal: each is a ragged black dry-brush stroke (8 degrees down to the right) with a key prompt on its left and white caps, an ochre paint splatter sitting under each stroke. Skill cards (Immolation, Ice Lance, Thunderfall) are dark panels tilted a few degrees.
- **Character select cards.** Portrait cards with the two top corners cut, an Art Deco diamond lattice in bronze on the plum-black card, a dry-brush dissolve on the lower edge, name in cream caps, HP bar (red fill with arrow-pointed ends in a thin grey outline), "Level" over a big Oswald numeral.
- **Skill tree.** Diamond nodes (squares turned 45 degrees) in a white hairline joined by thin lines; locked nodes carry a padlock, red Oswald numbers mark costs.
- **Expedition Failed.** Red caps in the middle of a red geometric thorn linework (stacked chevrons and verticals) over a darkened scene.
- **Start screen.** Black, red and white petals and flecks drift slowly across it.
- **Dialogue.** Speaker name in serif over a long hairline frame with a small curl at the left end.
- **Currency.** The Chroma mark is a lozenge split by a vertical line.

## Motion (from the captures and the game's behaviour)

Plates slide in from the left and settle (no bounce); the selection grows its plate rather than flashing; petals drift slowly; nothing pulses except the running Lumina. Durations in the theme: 120 / 200 / 380 ms, power-ease out.
