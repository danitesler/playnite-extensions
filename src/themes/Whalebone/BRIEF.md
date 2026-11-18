# Whalebone — creative brief

Mode: **Showcase**. Source: the menus and overlays of Dishonored 2 (see `RESEARCH.md`). Dark only. Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec.

## Source DNA (5 traits -> where each lands)

1. **White dry-brush stroke as the cursor** -> current sidebar item, toggled top-bar cells, selected game row, Settings tree selection, Play plate (`brush-stroke.png` mask, wipes in from the left).
2. **Torn ink plates behind entries** -> idle buttons, hovered rows, keycaps, section caption smears (`ink-plate.png`, `ink-smear.png`), crimson smear behind the game title.
3. **Frost light on whatever is chosen** -> frost hairline frame with hooked tips around the selected row and Play; frost glow frame on the hovered cover (`frost-frame.png` 9-slice).
4. **Shattered glass and fracture hairlines** -> top bar rule, settings title band, empty game page, Play hover shards (vector triangles, sparse).
5. **Mixed type: flared caps, slab italic, pen script** -> Cinzel titles and buttons, Zilla Slab body and italic captions, Marck Script section captions, tooltips and the empty state.

## Game element map (source part -> Playnite surface)

| Dishonored 2 | Playnite |
|--------------|----------|
| Menu cursor stroke (`CAMPAIGN`) | Selected game row, sidebar current item, Settings tree selection |
| Marble paper row with frost hooks (Video Settings) | Selected details-view row frame |
| Ink entry plates (`Save Game`) | Buttons, hovered rows, top-bar hover |
| Value plate with pointed ends + round chevron | `ComboBox` (and `TextBox` well) |
| Dotted slider between arrows, white disc thumb | `Slider` |
| Paper tab with iron brackets and "v" notch | `TabControl` selected tab |
| Notched campaign-slot card with frost glow, L-brackets and hook | Cover tile hover / selected |
| Keycap prompt (`Esc Back`) | More / Edit buttons, cover Play / Info buttons, caption buttons |
| Teal "!" new-item disc | Filter active mark, notification badge |
| Medallion tab icon with frost tick ring | Main menu button (rail top), brand mark |
| Statistics sheet (script heading, italic label, leader, caps value) | Metadata pane |
| Whale-oil tank glow | Running / launching game (amber) |
| "Death has taken you" fade through black | Empty game page (mark in frost, script caption) |

## Moments

- **Hero: Play.** Bone brush plate with ink Cinzel `PLAY` inside a frost hairline frame with hooked tips. Hover: frost bloom fades in (0.24s), a second wet stroke repaints the plate from the left (ScaleX 0->1, 0.2s), three glass shards slide out from the right end with 50 ms stagger. Press: plate drops to `wb-bone-shade`, shards snap back (90 ms).
- Cover hover: frost glow frame fades in with the offset L-brackets and the "v" hook under the tile; selected = static bone hairline frame.
- Cover buttons: keycaps (Play, Info) rise in from 8px below, 60 ms apart; hover lights the keycap rim frost.
- Sidebar current item: brush stroke wipes in from the rail edge behind an ink glyph.
- Settings tree: soft ink wash on hover; selected = held stroke wash at low opacity, 2px frost bar, brighter label.
- Tabs: paper plate with brackets and "v" notch, fades in.
- Checkbox: ink square with pale rim, checked = bone fill with an ink check that inks in (scale 0.6->1).
- Ambient: none in lists; the empty game page lets three shards drift slowly.

## Motion language

Fast 120 ms, base 200 ms, slow 360 ms; `CubicEase` EaseOut (calm, inky); entrances wipe from the left (stroke) or rise 8px (prompts); 50-60 ms stagger.

## Brand

Name **Whalebone**: the carved bone charms and whale-oil of the game's world, not an official name. Mark: a round medallion holding a carved bone spindle crossed by a short bar, with one glass shard breaking through the ring (`art/mark.svg`), used for `IconMainMenu`, the settings title band, the empty page and the tile. `GameBannerTintBrush` = `wb-slate`, the darkest branded surface of the overlays (the game has no art tint of its own beyond that cold slate).

## Kept calm

Library rows and covers sit on flat slate; no texture under lists; shards and filigree only in the title band, the top-bar rule, Play hover and the empty page.
