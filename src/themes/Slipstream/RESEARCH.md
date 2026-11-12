# Slipstream: research and sources

Reference: the menus of Star Wars: Galactic Racer (2026, console and PC) as catalogued on Game UI Database. Research date 2026-11-11.

## Sources

| What | Where |
|------|-------|
| Captures | [Game UI Database, Star Wars: Galactic Racer](https://www.gameuidatabase.com/gameData.php?id=2583): about 110 captures at 1920x1080 (title, mode select, settings, modals, character and world select, loadout, results, customisation, HUD). Viewed in a browser; nothing downloaded or shipped. |
| Captures sampled | Mode select `...10272026-092229-34607.jpg`; Settings, Gameplay `...092243-16131.jpg`; Settings, Accessibility `...092257-34286.jpg`; Modal `...092747-40007.jpg`; World select (map) `...092534-62212.jpg`; Multiplayer customise `...093336-51723.jpg` (all prefixed `uploads/Star-Wars-Galactic-Racer`) |
| Fonts | Not identified. Titles are wide, heavy, squared display capitals; body text is a highway-signage style sans, often italic for hints. Stand-ins: Unbounded (OFL, bundled) for titles, Bahnschrift (ships with Windows 10+) for body. |
| Icons | Lucide 1.49.0 (ISC, `info/LICENSE-lucide.txt`). None taken from the game. The game's own glyphs are solid; see Deviations in `AGENTS.md`. |
| Sprites | None. The source is flat print: no glow, no light. |

## Sampling method

Each capture was drawn into a canvas in the browser and read with `getImageData`: per region, the most common colours in 4-level buckets, or a 5x5 mean for small marks. Coordinates are in the 1920x1080 capture. JPEG noise is about +/-4 per channel, so values are rounded to the nearest stable reading.

| Element (capture) | Result | Token |
|-------------------|--------|-------|
| Backdrop (settings, hub) | #dedad6, #dedad2, #e2ded2 | `ss-paper` #dedad4 |
| Backdrop (map, multiplayer) | #e2e2da, #e6e5de | `ss-paper-hi` #e6e4dc |
| Modal panel fill | #cec6ba | `ss-plate` #cec6ba |
| Modal panel rim | #bcb9ae | `ss-plate-edge` #bcb9ae |
| Party chip under the profile | #cac6c2 | `ss-plate` |
| Screen title, labels | #222222, #161616; rules #0a0a0a | `ss-ink` #161616 |
| Toggle body, gauge body, preview panel | #161616, #121212 | `ss-ink` |
| Selected tab pill (settings, hub, map tag) | #b2523a, #b1513b | `ss-vermilion` #b2523a |
| Selected row pill (accessibility) | #b65e4e (lighter, a paper texture shows through) | `ss-vermilion-hi` #c26249 (hover) |
| "Off" toggle knob | #ba4242 | `ss-red` #ba4242 |
| Modal button, focused | #2a464e, rim #9da8ac | `ss-teal` #2a464e, `ss-teal-rim` #9da8ac |
| Modal button, idle | #263a42 | between `ss-teal` and `ss-teal-deep` |
| Settings scroll thumb | #1e363e | `ss-teal-deep` #1e363e |
| Profile chip | #324642 | `ss-teal` family |
| Stripe, blue band (map) | #346a80, #356c81 | `ss-blue` #356c81 |
| Poster blue (hub tile, multiplayer tile) | #3e7286, #2e5e72 | `ss-blue-deep` #2e5e72 |
| Stripe, sage band (map) | #acbdaf, #adbdaf | `ss-sage` #adbdaf |
| Stripe, pale sage (multiplayer) | #c4cdc4 | `ss-sage-pale` #c4cdc4 |
| Poster mustard (hub tile) | #c39949, #c5a260 | `ss-mustard` #c39949 |
| Route line (multiplayer, map) | #b75e20 | `ss-orange` #b75e20 |

Not measured: `ss-ink-muted`, `ss-ink-faint` (ink mixed toward paper for secondary text; the game uses a mid grey #6a6a66 for hint rules), `ss-green` (sage darkened for success text), `ss-paper-white` #f2f0ea (text on pills reads #e6ded6 to #eeeade through JPEG ringing).

## Design rules read from the captures

- **Paper, not glass.** Every menu sits on a warm off-white sheet over a blurred, bleached scene. No dark panels except the info preview box. No glow, no drop shadow, no gradient fills.
- **Screen title:** a vermilion "/" stroke, the title in wide heavy caps, then a small vermilion tag block with cut-out marks.
- **Group heading:** caps title followed by a 2px ink rule that runs to the column edge ("TUTORIAL ----").
- **Selection is a pill.** The current tab and the focused option row are vermilion capsules with paper-white text. The focused row also gets a small notched vermilion arrowhead in the gutter to its left.
- **Dialog buttons** are dark teal capsules with paper-white caps; the focused one is slightly lighter with a pale rim.
- **Option controls:** toggles are small ink capsules with a knob (paper white = on, at the right; red = off, at the left); gauges are ink capsules with a paper-white segmented fill and a percentage beside them.
- **Tiles** (mode select, customise) are flat poster cards with a corner of about 4px at 1080p and no frame.
- **Racing stripes:** broad blue, sage and thin mustard or ink bands, horizontal across the map screen and diagonal in the corner of the multiplayer screen. Decoration only, never behind text.
- **Orbit plot** (world select): thin ink circles, dashed and solid, with cross hairs and small markers.
- **Button prompts** are solid ink discs with the letter knocked out.

## Sizes (1080p capture, scaled 1:1 to WPF units at 100%)

| Element | Capture | Theme |
|---------|---------|-------|
| Option row / selected pill height | 46-50px at 1080p of a TV layout | 30-32px (Playnite's desktop density, `ControlHeight` 32) |
| Dialog button height | 48-50px | 32px pills, radius 16 |
| Toggle | 53x24 | 30x16, knob 12x10 |
| Gauge | 154x22, fill inset 5 | 8px track, fill inset 2 |
| Group rule | 3-4px | 2px |
| Tile corner | about 8px | 4px (`ss-radius-small`), cards 6px |

The game is laid out for a TV at arm's length; sizes are scaled to roughly 65 percent for a desktop launcher while keeping the proportions.

## Motion

Only stills are available on Game UI Database for this title, so motion is not measured. The theme keeps to short fades (0.2 to 0.3s) and one motif taken from the static art: racing stripes that sweep or wipe (Play hover, cover hover) and the orbit marker that circles on the empty page. If video captures appear, measure the tab and row transitions and revisit.
