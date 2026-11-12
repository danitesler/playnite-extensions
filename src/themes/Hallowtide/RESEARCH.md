# Hallowtide research

Unofficial, fan-made theme inspired by the quest book UI of **All Hallows: The Land of Lost Dreams** (a community
game made in Media Molecule's Dreams; every capture carries the "Made in Dreams" watermark). Not affiliated with,
endorsed by or sponsored by the game's creators, Media Molecule or Sony. No game asset is used: every ornament is
drawn in XAML by `art/ornaments.py`, every colour is a token in `src/tokens.css`.

## Sources

| What | Where | Used for |
|------|-------|----------|
| Game UI Database entry, 25 captures (1920x1080 JPEG) | https://www.gameuidatabase.com/gameData.php?id=1588 (listing: Console and PC, 2022; tags Free Pointer, Gamepad, PlayStation, Widescreen, User Creation, 3D Stylized, Low Poly, Fantasy, Flat 2.0) | Everything below |
| Capture file ids | `/uploads/All-Hallows-The-Land-of-Lost-Dreams12062022-1203NN-XXXXX.jpg`: settings 96884, dialogue 92801 64405 64243 94157 48733, choices 33221 65581, tutorial panel 80430, world map 26702 27994 58408, quest complete 90756, new quest 86064, contents 49134 6668, quest pages 6057 21766 23621 3429, inventory 16105, prompts 82840 21924 21350 70309 | Per-screen notes |
| Fonts | Open fonts already in `scripts/fonts/`: Cinzel, Gelasio, Barlow Semi Condensed, Patrick Hand (SIL OFL) | Stand-ins for the game's own faces |

Colour sampling: each capture was drawn to a canvas and either a 4 px median (single swatches) or a k-means cluster
(k 4 to 9) of a region was read; the table lists the cluster centres. The captures are lit and vignetted by the
engine, so paper and plates read darker than their authored value ("lifted" tokens in `tokens.css` compensate).
**Limitation:** the sources are stills. Motion below is inferred from the stills (cursor glow, pins, ribbons) and
from how Dreams menus behave, not frame-stepped from video; it is marked "inferred".

## Screens and what each gives the theme

| Screen | What is on it | Theme use |
|--------|---------------|-----------|
| Quest book (settings, quests, contents) | An open book on a near-black plum backdrop with a faint vine texture and a hard vignette. Parchment pages. Hand-inked **rope/bark border** (twin wobbly lines with twist ticks). Each page header is **"QUEST" in carved caps, then a twin-headed serpent biting a bark ribbon**. Dividers are a **wavy thorn rule with a centred double spiral**. A red **barcode-ribbon bookmark** hangs from the top-left page edge and **blue bookmark tabs with cog and key glyphs** sit below it. Ratings are five hand-drawn stars. Pinned notes carry a **red push pin** ("not to miss!"). | Sidebar rail (bookmarks), page frame, dividers, headers, pins, notes |
| Contents list | Quest entries are **ragged black-brown brush plates** with cream text and a page numeral (P. III) in ink beside them; a tick on completed ones; unfinished ones are smudged unreadable blobs; the highlighted entry turns **dark indigo** with a blue wisp cursor on it | List rows, chips, selected state |
| Settings page | Check boxes are hand-drawn square outlines; the slider is a ruled tick track with a **diamond thumb between square minus and plus buttons**; section titles are carved caps with spiral dividers; controls list uses glyph prompts | Check box, slider, group headers |
| Dialogue | Rounded deep-teal box, a bone **name tab** above its top left corner, bone text, a circled X to close; emphasised words in gold | Menus, dropdowns, popups |
| Dialogue choice | Near-black **stadium pills with a 2 px neon red outline and red glow**, red glyph and red condensed bold text, a bone-red alert tone | Danger, destructive hover, empty-state call to action |
| Tutorial panel | Ragged dark panel, text glowing peach-white with a soft halo (`#f5e7d9` core on `#794035`) | Empty state text glow |
| World map | Parchment sheet with hand-inked terrain; **drip-edged grey plates** for place names; **wooden "You are here" sign on a green pin**; torn parchment **"Travel to" label** with a circled button glyph | Play plate (torn paper), place-name drips |
| Quest complete / new quest | Cream-grey **torn paper banner**, ragged top and bottom edges, ink text, a small icon, centred over the scene | Notification banners |
| Inventory | Black slots with 2 px white outlines, item name in a bone pill | Cover slots, empty slot motif |
| Button prompts | **Black ragged brush plate** with a circled controller glyph and bone text ("Inspect", "Pick Up", "Fast Travel" on a plum plate) | Cover hover buttons |

## Measured palette

| Role | Hex | How |
|------|-----|-----|
| Void (backdrop darks) | `#050002` `#0a0104` `#130309` `#1e0711` `#29091a` | clusters of the book backdrop |
| Parchment page | `#b28149` `#aa7740` `#9c6534` `#865029` | page clusters; burn at the edges `#50250f` |
| Ink on paper | `#2d130e` `#3d1f16` | text and linework clusters |
| Ink plate (contents entry) | `#281410` `#3a231c` | plate clusters |
| Highlighted entry | `#171926` `#2a283e` | hovered contents plate |
| Bookmark tab | `#1a2c42` `#16253a` `#21344a` | tab clusters |
| Keyword violet | `#972597` | most saturated pixel of "Cursed Cones" |
| Wax pin | `#9b1411` | pin cluster |
| Dialogue teal | `#11343f`, edge `#2f4246`, text `#cfd0d0` | box clusters |
| Name tab | `#d2c6b9` | tab cluster |
| Gold emphasis | `#ccb10b` | highlighted word |
| Choice pill | outline `#d32735`, deep `#92070c`, fill `#0d0000` `#210000` | pill clusters |
| Torn notice paper | `#aba295`, ink `#382b17` | banner clusters |
| Tutorial glow | `#f5e7d9` core, halo `#794035` | panel clusters |

Contrast checks (WCAG relative luminance): bone `#f1e1d3` on void-wine `#130309` about 15:1; ink `#2d130e` on
parchment `#b28149` about 5.1:1; lantern `#f0913a` on void-wine about 8.8:1; wisp-ink `#5c1466` on parchment about
3.5:1 (links keep an underline).

## Type

| Game text | What it looks like | Stand-in (bundled, OFL) |
|-----------|--------------------|-------------------------|
| Page headers, "QUEST", "CONTENTS", "LIST OF QUESTS" | carved flared Roman caps, slightly uneven | **Cinzel** SemiBold, Bold |
| Quest text and descriptions | sturdy irregular book serif, bold-ish | **Gelasio** Regular, Bold (Georgia metrics, so `HtmlTextView` falls back to Georgia cleanly) |
| Prompts, dialogue choices, button labels | humanist semi-condensed bold sans | **Barlow Semi Condensed** Medium, SemiBold |
| Pinned notes ("not to miss!") | rounded felt-pen hand | **Patrick Hand** Regular |

## Motion (inferred from the stills)

- The cursor is a glowing blue **wisp** on a wand (white-blue core, soft halo): selection feedback is "the wisp
  lands": a plate lights and a spark pulses. Focus and hover glow use this blue (`dream-glow`, `dream-spark`).
- The scenes are lit by **lanterns**: warm orange from below, with drifting **fireflies and embers** (the dungeon
  captures show yellow motes, the tree capture shows orange sparks). Play hover = lantern bloom plus rising motes.
- Pins, notes and bookmarks are **physical**: they drop, hang and swing. Pin drop and ribbon unroll use short
  overshoot easing.
- Linework is **drawn**, not stamped: the border draws itself on (dash offset) when a cover is hovered.
- Choices glow red when focused (neon halo), calm otherwise.

## Rules distilled for the theme

1. Dark shell (void) with parchment used for **content pages only** (description, notes, metadata pane, tooltips,
   primary buttons). Never body text on a parchment page in `TextBrush`: pages set their own ink foreground.
2. Ink plates with ragged edges for rows, chips and buttons; the highlighted plate is indigo, not a bright fill.
3. Accent on dark is **lantern** orange (Halloween purple and orange, and the game's own scene light). Wisp violet
   marks keywords and links; wax red marks "something is on" (pin); dream blue marks focus and the current place.
4. Popups are the dialogue teal; destructive states borrow the neon choice pill.
5. Ornaments: serpent ribbon (headers), thorn rule with spirals (dividers), rope frame (pages, hovered cover),
   pushpin (notes, filter-active mark), bookmark ribbon (rail, tabs), torn edge (play plate, banners), ink blot
   (cover hover buttons).
