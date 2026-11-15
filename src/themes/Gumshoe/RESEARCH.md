# Gumshoe — research & sources

Gumshoe is an unofficial fan theme inspired by the menus and HUD of **Mouse: P.I. For Hire** (Fumi Games, 2026), a first-person shooter drawn as a 1930s rubber-hose cartoon. Nothing here is the game's art, logo or font.

## Sources

| What | Where |
|------|-------|
| Interface captures | Game UI Database, <https://www.gameuidatabase.com/gameData.php?id=2378>, 53 screenshots (1920x1080), viewed 2026-11-14 in a browser tab. Nothing downloaded or saved: pixel values below were read in the page with a canvas. |
| Colors | Sampled from those captures (JPEG, so about ±2 per channel). Every sample is neutral grey (R = G = B within 2): the game is black and white. |
| Type | Read from the captures. The game's faces are custom; stand-ins are open fonts already bundled in `scripts/fonts/`: Patrick Hand (hand-lettered body and headings) and Anton (condensed poster capitals). |
| Icons | Hand-drawn in `src/Media.xaml` in a chunky rounded-stroke cartoon style. No icon pack. Menu icons keep Playnite's own glyphs, recolored. |
| Motion | Static captures only: no video or frame-step was available. Motion in the brief is inferred from the art style (squash and stretch, line boil), not measured. |

## Measured values

| Part (capture) | Sample |
|----------------|--------|
| Void behind menus (title, pause backdrop) | `#0d0d0d` to `#252525` |
| Open book, page (pause, settings, cards) | `#bdbdbd` (left page), `#b9bab9` (right page) |
| Book rim and page edge | `#898a89`, darker fold `#787a79` |
| Hanging tabs (icon bookmarks) | mean `#9c9c9a`, lit parts `#d6d6d4`, dark parts `#4c4e4d` |
| Page title ink (PAUSE, SETTINGS) | `#434341` |
| Row ink on paper | `#2c2c2c` |
| Selected row plate (smudge) | `#cdcfce` to `#e4e4e2`, fading at both ends |
| Card paper (shop) | `#acacac` |
| Price tag plate | `#b7b7b6`, lit `#dededc` |
| Chalkboard modal panel | flat `#2b2b2b`, rim `#4b4b4c` to `#5a5a5c`, 2px |
| Tooltip | `#28282a`, text `#e9ebe8` |
| HUD ribbon | `#808080`, text `#e1e1e1` |
| Menu text, title screen | selected `#e0e1e3`, idle `#858585` on `#0d0d0d` |

## Interface parts (what the brief rebuilds)

- **Case-file book** (pause, settings, collectibles, shop): two aged-paper pages, rounded corners, stacked page edges at the sides, a dark rim. Titles in hand-lettered capitals with a wobbly underline stroke. Rows are ruled with dashed lines; the selected row is a bright smudge plate with feathered ends.
- **Hanging bookmark tabs** along the top of the book: small paper tabs with an icon, the current one raised and lighter. Section tabs on the page edge are folder tabs (Gameplay, Graphics, Audio, Controls).
- **Option row**: `◀ Rookie ▶` with a few pip dashes under the value.
- **Scroll bar**: a 2px vertical line with a ridged capsule handle (a pencil or microphone), nothing like a normal thumb.
- **Price tags**: bevelled rectangles with a notched end holding a number and a coin. **Stickers and stamps**: a black oval `BUY-D` sticker with an inner cream outline, a tilted `paid TRIAL!` stamp.
- **Chalkboard modal** (upgrade info, confirmations): flat dark panel with a thin light rim, flourish dividers above and below the title, `CLOSE ✕` and `BUY ✓` with grey prompt discs.
- **Roadhouse sign**: Art Deco proscenium frame, a stage with drawn curtains, a stencil title on a dark plate, two pill buttons with prompt discs.
- **Weapon wheel**: riveted porthole slots, masking-tape labels with ragged ends under each slot, the chosen slot ringed with a soft white glow.
- **HUD**: swallowtail ribbons (`SECRET FOUND`, currency counters), coin portraits with a ribbon number, compass strip with tick marks, round reticle with four drops.
- **Collectible grid**: empty slots are dim rounded blobs; filled ones are tilted photos.
- **Tooltip**: near-black rounded box, cream text, small pointer.
- **Button prompts**: a grey disc holding the letter, then bold capitals (`CONFIRM`, `CLOSE`).

## Type

- Menu and body: a rounded, slightly wobbly hand-lettered sans (Patrick Hand stand-in). Titles are the same face in capitals, larger, underlined by hand.
- Posters and stamps (`ROADHOUSE`, `BUY-D`, `TRIAL!`): heavy condensed capitals (Anton stand-in).
- Sizes in the 1080p captures: body about 22px, titles about 48px, HUD labels about 18px. Scaled to Playnite's 14px base.

## Design rules taken from the captures

- No hue anywhere. Depth comes from paper against chalk against void, plus grain and a vignette.
- Plates have soft corners (about 10px at 1080p) and a darker rim, never a hairline.
- Light surfaces carry dark ink; dark surfaces carry cream. There is no mid-contrast text.
- Decoration is paper-craft (tape, tags, ribbons, dog-ears), never glow. The one glow is the chosen weapon slot.
