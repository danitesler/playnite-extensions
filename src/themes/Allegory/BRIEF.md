# Allegory — creative brief

Mode: **Showcase**. Grounded in `RESEARCH.md` captures (`docs/themes/creative-direction.md`); the reviewed Pass 2 previews are the real spec.

## Candidate lenses

- **(a) Diegetic / artifact: the hero's fantasy picture book.** Parchment pages, illuminated initials. Dropped: the game's menus are not a book; it would read as a generic storybook theme (and Fernscroll / Hearthside already own parchment).
- **(b) HUD / telemetry: the battle command ring.** Circular commands, HP/MP bars, press-turn icons. Dropped: the battle HUD is sparse and only a few parts (ring prompts, bars) carry over; the library would end up anonymous.
- **(c) Title / pause menu: the submenu grammar (Item, Buy, Quest, Load, System, Settings).** **Picked.** Hairline-ruled rows, a dry-brush band on the current item, Didone small caps with enlarged initials, giant cropped section titles, slanted white plates. Players recognise it instantly and it maps 1:1 onto a list library. Against the last five themes (Silver 98, Bliss XP, Checkpost, Starlane, Wildhand: bevels, booth metal, starfield, felt) nothing is editorial-serif or painterly. Against siblings: Calling Card (Persona 5) owns slanted red plates and ransom type: Allegory never uses a red rectangle or plate for selection, only the ragged brush band; Brushlight (Clair Obscur) owns charcoal arrow plates and Cinzel: Allegory has no plates on rows at all.

## Source DNA

| Trait | Capture | Playnite surface |
|-------|---------|------------------|
| 1. Dark painted ground + white ink + one hot brush accent (crimson `#E43457`) on the current item only | Shop, Player menu, Dialogue | Every selected/current state; grounds `#0E1D1E` / `#193A3B` / oxblood `#380605` |
| 2. Dry-brush band with ragged edges and splatter as the selection | Shop row, System `LOAD`, Quest row | Library rows, menu highlight, settings tree (teal), Play hover, running (yellow) |
| 3. White hairline geometry: row rules past the text, doubled rules, vertical rules, compass rings, long diagonals | System, Load, Player menu | Row separators, top-bar foot, metadata ledger, settings band, empty page |
| 4. Wide Didone caps with enlarged initial; giant titles cropped by the frame; ghost leading zeros | Player menu, System, Settings, Shop prices | Section headers, game title watermark, Play label, score plate, settings band |
| 5. Snappy motion: brush wipes in from the left with a small overshoot, text nudges right, caption appears | Menu captures (frame-stepped states) | Row/menu/tree highlights, Play hover |

## Focal hierarchy

1. **Game page header:** the game's name as a giant cropped Didone watermark behind the real title (like `SYSTEM` / `QUEST`), over a banner that ends in a torn brush edge.
2. **Play:** a slanted white plate with `PLAY` in black Didone; on hover a crimson dry-brush band sweeps through it and past both ends, splatter at the tail.

## Observed UI translations

1. Shop/System current row -> library details row selection (crimson brush band, black text) and popup-menu highlight.
2. Settings teal brush row -> Settings section tree selection.
3. `MONEY` plate with slanted end + ghost zeros -> score plate (`0`85 with ghost leading zero) and Play plate.
4. Quest / Load white tag plates (`Search`, `Metalsday`) -> metadata chips (`PropertyItemButton`).
5. Description card with torn right edge -> tooltips.
6. Circle button prompts in rings -> grid cover Play / Info buttons and the side-panel close plate.

## Material & FX plan

Flat vectors look plastic for the brush, so `art/sprites.py` (Pillow + NumPy, fixed seeds) writes white alpha masks to `src/Images/fx/`: `brush-band.png` (long dry-brush band, ragged top/bottom, bristle streaks, feathered head, splattered tail), `brush-dab.png` (short dab for the rail), `brush-flick.png` (thin hover flick), `splatter.png` (droplet cluster), `torn-edge.png` (paper card right edge, vertical tile), `brush-edge.png` (banner foot), `paint-ground.png` (very soft mottled ink wash for the empty page and settings band only, never behind lists). Colours come from brushes via `OpacityMask`.

## Signature levers

| Lever | Choice |
|-------|--------|
| Hero banner transition | Torn brush edge mask at the banner foot + the giant cropped title watermark |
| Play button | Slanted-left white plate, black Didone `PLAY`, crimson brush sweep on hover, plate nudges on press |
| Metadata container & group break | Borderless ledger on white hairlines; group heads in Didone caps with enlarged initial and a hairline running right, doubled rule at the break |
| Chip & score silhouette | White tag plates with a slanted left end (ink text); score in a white plate with graphite Didone digits and a ghost leading zero |
| Row & cover selection mark | Brush band behind the row; cover gets a brush swash bleeding out under its bottom-left corner + a white hairline frame |
| Side-panel close plate | 28×28 white disc inside a thin ring (button prompt), ink X; danger disc on hover |

## Popup menu levers

Panel: ink `#0B1213` with white hairline top and bottom rules (no side frame). Highlight: crimson dry-brush band wiping in from the left, black text. Group break: hairline with a small diamond in the middle (quest rank pip). Icon hover contrast: icons go black on the band. Shortcut: tiny Didone caps, muted. Submenu mark: small white ▸ triangle (settings arrows). Marked rows: Exit in light crimson `#F0607A`; checked rows = a filled diamond.

## Motion language

- Durations: fast 110ms (text nudge, icon tint), base 200ms (brush wipe, plate fades), slow 360ms (Play sweep, cover swash, empty-page ring).
- Easing: `PowerEase` (EaseOut, power 3) for wipes, `BackEase` amplitude 0.3 only on the brush band arrival. Entrance direction: from the left. Stagger 60ms (cover buttons).
- Ambient: only the empty-page compass rings rotate slowly; the running pulse.
- Running: yellow `#D5B601` brush (the quest "in progress" brush), distinct from crimson selection and white Play.

## Brand

Name **Allegory** (echoes *Metaphor* without being it). Mark: two concentric compass rings crossed by a long diagonal hairline with a pointed nib-spire in the centre (the menus' ring prompts and quill-sharp letterforms), never the logo. Used on the main menu button, settings band, empty page, `art/mark.svg`. `GameBannerTintBrush` = teal ground `#193A3B`.

## Restraint & anti-slop

Quiet: list rows at rest (text on a faint rule), grid ground (flat deep teal, no texture), metadata prose, descriptions. Only the current item and Play get brush. Forbidden: glowing borders, chamfered sci-fi boxes, monospace micro-labels, rounded SaaS cards, drop shadows, red rectangles/plates for selection (that is Persona's language), corner brackets, more than one accent colour on one surface.
