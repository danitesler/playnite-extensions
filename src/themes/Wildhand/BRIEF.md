# Wildhand — creative brief (Showcase)

Unofficial Balatro-inspired desktop theme. Measurements and sources: [RESEARCH.md](RESEARCH.md).

## 1. Candidate lenses -> pick 1

Last five themes in `src/themes/AGENTS.md`: Subspace (LCARS elbows), Dewfield (walnut ledger), Counterfoil (film transcript), Testbed (cleanroom aluminium), Joyride (GTA collage); Ditherwake and Stride are in flight.

- (a) **Diegetic / Artifact**: the playing card or the joker sleeve as the object. Dropped: Dewfield, Counterfoil and Ditherwake already live in "paper object" territory, and a card has no room for lists.
- (b) **HUD / Telemetry — chosen**: the in-run left HUD column (blind bar, Round score, Chips x Mult, ledged colour buttons, twin Hands / Discards cells) laid over the felt table. It is the part of Balatro a player names first, it maps to a rail + inset-cell metadata, and nothing in the catalog is built from chunky ledged plates on slate.
- (c) **Title / Pause Menu**: the PLAY / OPTIONS / QUIT / COLLECTION stack and the tabbed settings panel. Not dropped, folded in: tabs, Back bar, marquee and option rows supply Settings, menus and controls.

## 2. Source DNA

| Trait | Where it lands |
|---|---|
| **Ledge**: every plate is a flat colour face with a darker 4px ledge under it | Play, buttons, tabs, row/cover selection, chips, close plate, menu highlight |
| **Slate + felt**: `#374244` panels on green felt, recessed `#1e2628` wells inside | rail, top bar, metadata cells, search well; library and page sit on felt |
| **Chips blue x Mult red x Money gold**: three signal colours, never mixed | Play blue, Discard/danger red, scores and playtime gold; orange for selection |
| **Pixel face with a hard drop shadow** | Pixelify Sans Regular everywhere; one-pixel shadow on plate labels |
| **Juice**: pop to ~1.1 and rock a few degrees, settling fast | Play hover (hero), cover lift + tilt, cover buttons, checkbox tick, sidebar pointer |

## 3. Game element map

| Balatro part | Playnite surface |
|---|---|
| HUD column (slate, rim) | Left rail (44px) and the game page header column look |
| Blind bar (blue ledged title) | Game title bar on the game page |
| Round score inset (chip glyph + number) | Search well (chip glyph persistent) and the progress label |
| Play Hand blue / Discard red pair | Play button / context action |
| Hands / Discards cells (label with a recessed value) | Metadata rows (caption left, value in a recessed well) |
| `$4` money inset | Playtime value in gold |
| Run Info red / Options orange tall buttons | More actions / Edit squares |
| Sort Hand Rank / Suit orange buttons | Details / Grid / List view switches (the toggled one is the orange ledged plate) |
| Tab row with the red triangle pointer | TabControl, Settings tree selection, sidebar current item |
| SHOP marquee sign (gold letters, chasing bulbs) | Settings window title band |
| Price tag (dark notched tab, gold number) | Community / critic / user score |
| Dotted Cash Out leader | Menu group break, metadata group break |
| Value dots `• • •` | Running / launching idle mark |
| Empty joker slot `0/5` | Empty game page |
| Option arrows `<` `>` | Close plate, ComboBox arrow, spin buttons |
| Checkbox (dark square, white rim) | CheckBox / RadioButton |
| Red slider with value pill | Slider |
| Felt paint swirl + scanlines | Window art layer decor, banner scan band, empty-state backdrop |

Three read on sight: HUD column of ledged plates, blue x red chips-mult colours, the red pointer over a tab.

**Type (decided after the first render):** Pixelify Sans reads cleanly only from 17px up (its c reads as o below that) and its f ligatures draw wrong, so Nunito (Regular, Bold) carries every smaller size and Pixelify carries titles, Play, tab labels, price numerals and the band at 17px and up.

## 4. Signature levers

| Lever | Choice |
|---|---|
| Hero banner transition | Felt fade with a **CRT scan band**: gradient into `#214a39` plus a 2px scanline layer over the lower 40% of the art |
| Play button | **Ledged Play Hand plate**: blue face, 5px ledge, controller bubble, hover rocks and scales 1.06, press drops onto the ledge |
| Metadata container | **Recessed value wells** beside their captions (Hands / Discards cells), groups broken by a **dotted leader** |
| Chips + score | Rounded tag with a 2px ledge, hover turns orange; score is the notched **price tag** |
| Row / cover selection | Row: red triangle pointer + orange ledged plate; cover: card lifts 10px, tilts 2deg, white rim over an orange ledge |
| Close plate | 28x28 red option-arrow square with ledge, white pixel X |

## 5. Popup menu levers (`docs/themes/menus.md`)

| Lever | Choice |
|---|---|
| Panel | Slate rounded 10, 2px pale outline, 4px dark ledge shadow below |
| Highlight | Orange ledged pill, ink text, fades in 110ms with a 1px hop |
| Group break | Dotted leader (2px dots, 4px pitch, `--l-black`) |
| Icon hover contrast | Icon column rests joker-grey, turns ink on the orange pill |
| Shortcut | Bumper pill (dark inset, 3px radius, grey letters) on the right edge |
| Submenu mark | 14px red square with white `>` |
| Marked rows | Exit: red text, red pill with white text on highlight; checked row: white-rimmed box with a tick |

## 6. Moments

- **Hero**: Play hover + press (rock, scale, rim, ledge drop).
- **Secondary**: row hover + select, cover hover + select (lift and tilt), cover Play/Info pop with 50ms stagger, sidebar current item (pointer slides in), tree selection (red tab), tab (pointer), checkbox tick pop, slider value pill.
- **Ambient (sparse)**: marquee bulbs in the Settings title band (300ms step), the three running dots.

## 7. Motion language

fast 100ms, base 180ms, slow 320ms. One easing personality: `BackEase` (punchy, small amplitude) for pops, `QuadraticEase` for fades. Entrances rise 8px from below. Stagger 50ms. Discrete steps for the bulbs and dots. Lists, grid backgrounds and metadata text stay still.

## 8. Brand

Name **Wildhand**. Mark: a tilted playing-card outline holding a three-point jester cap, drawn from card and cap shapes only (not the game's logo). Reused in the title band, the empty page and `art/mark.svg`. `GameBannerTintBrush`: felt deep `#173629`, the darkest branded surface.

## 9. Restraint

No swirl behind lists, no scanlines over text, no glow the game does not have, one drop-shadow depth. Selection stays orange, running stays green, so the hue itself says the state.
