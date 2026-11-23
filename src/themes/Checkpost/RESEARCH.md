# Checkpost — research notes

Unofficial theme inspired by the interface of *Papers, Please* (Lucas Pope, 2013). No game art, logo, seal, fonts or text are shipped.

## Sources

- 15 official Steam store screenshots (`store.steampowered.com/api/appdetails?appids=239030`, `ss_*.1920x1080.jpg`), viewed in the browser pane and sampled with a canvas (`fetch` + `createImageBitmap`, 4-5 bit colour clustering per region). Nothing was downloaded to disk. The ones used: title screen, Official Bulletin, rulebook, newspaper, entry visa and permit desk, stamp bar, end-of-day ledger, arrest screen.
- Five more captures supplied by the user in chat (Official Bulletin, the rulebook spread with spiral binding and the scalloped Arstotzka permit card, the booth desk with the pale-blue M.O.A. identity record, the pink citation slip and the red-framed visa, the French mobile rulebook, the stamp bar with the transcript). They fix: document text is a plum-brown (about `#5a4545`) on pale lime `#d5dda1`; the permit has a scalloped edge, a taupe inner border broken by its title ("ARSTOTZKA" on top, a ministry line at the bottom right) and caption + value fields standing on underlines; the pink slip peeks out under it (estimated `#f2d6e0`); the identity record is pale blue (`#cfe3f2`, estimated) with a dotted perforation; seals are round, dark brown or orange-red; section titles are caps over a dotted underline. Colors from these were estimated by eye, not sampled (the images are not on disk).
- Web searches for a font or palette write-up found nothing usable (fan wiki lists the fonts only as "derived from existing typefaces"; box-art title is Agit Prop, per Fontmeme). Typography below is judged from the captures.
- Motion is **not** frame-stepped from captures (stills only). The stamp slam, document slide-in and text type-on are recalled from playing the game and are stated as design intent in `BRIEF.md`, not measured.

## What the game's interface really is

The roadmap pitched an olive desk and manila paper. The captures say otherwise: every menu and report screen is **near-black** with **dark olive plates** and cream text; the only light surfaces are paper documents (bulletin, rulebook, permit, visa, newspaper) lying on a dark booth. So Checkpost is a dark theme with paper reserved for small moments.

## Palette (sampled)

| Role | Hex | Where it was sampled |
|---|---|---|
| Void black | `#050303` / `#000000` | menu, report and title backdrops |
| Booth metal / brown | `#1e1916`, `#352d26`, `#3a312b` | stamp bar, desk front, booth panel |
| Olive plate | `#384636` (variants `#364433`, `#3b453a`) | DAY tab, OK circles, SPACE / TAB tags, menu text on black |
| Olive shade | `#242b23` | title-screen extrusion, ring behind plates |
| Booth counter olive | `#656849`, `#494936` | desk top, rulebook cover |
| Rule green-grey | `#b5bc9c` | date rule, dotted total rule |
| Text on black | `#e4e4e4` (title `#fefefe`) | SAVINGS, SALARY lines |
| Bulletin / newspaper cream | `#e5e5cb`, grey ink blocks `#b5b39c`, ink `#44413a` / `#545245` | newspaper, bulletin |
| Rulebook / permit lime | `#d5dda1` (`#d4da9d`) | rulebook page, entry permit |
| Visa peach | `#e3d3c5` | visa page, STAMP HERE slip |
| Eagle red | `#ac191d` (`#b1161d`) | title-screen eagle |
| Seal red | `#d45242` | M.O.A. seal on rulebook and permit |
| Expense red | about `#d03030` | RENT / FOOD / HEAT lines (JPEG-smeared, estimated) |
| Stamp bodies | red `#4d0f10`, green `#364f0e` | **dimmed**: the stamp bar screenshot is under the game's 50% shade, so true faces are about twice as bright (`#9a1e20`, `#6c9e1c`): estimate |
| Concrete | `#706c6d` | border yard strip |

Contrast notes: the game dims secondary menu text to `#384636` on black (about 1.9:1), too low to ship; Checkpost uses `#b5bc9c` (5:1 on the olive plate).

## Typography

- Headlines (bulletin, newspaper): a narrow gothic, close to League Gothic / Pathway Gothic One. Masthead "The Truth of ..." is blackletter (not used).
- Permit and rulebook heads: chunky slab (the wiki lists ChunkFive); documents' small text is a pixel serif.
- Menu text: tiny pixel caps, tracked, with a **dotted underline** one pixel under the baseline.
- Stand-ins (all SIL OFL, bundled where Windows lacks them): Pathway Gothic One for display and stamp labels, Zilla Slab for body (typewriter-slab, readable at 13-14px), Consolas for ledger numerals (every Windows has it). Pixelify Sans was dropped: its small sizes misread (Wildhand's trap).

## Interface parts and behaviour worth rebuilding

- **Stamp bar**: dark metal strip with hex bolts; two stamps side by side (red DENIED, green APPROVED), each a black round knob over a coloured body, label on the body base; caption "ALIGN VISA BENEATH STAMP" under it.
- **End-of-day ledger**: black page; "DAY 17" is an olive plate with notched top and bottom corners between two hairlines; ledger lines are caption left, value right-aligned, expenses in red, a dotted rule, then the total.
- **Dotted-underline buttons**: NEXT, WALK TO WORK, SLEEP, STORY, ENDLESS are small caps text over a one-pixel dotted line, olive at rest.
- **OK circles**: 28px olive discs with "OK" for family members, empty dark circles for missing slots.
- **Key tags**: SPACE / TAB tags: small olive rounded plates with a key icon, text in dark olive.
- **Discrepancy bar**: bottom-right red label "HIGHLIGHT DISCREPANCIES" with a red X on a dark square; "DISCREPANCY DETECTED" is a cream-outlined callout with a dotted leader.
- **Documents**: cream, lime and peach sheets, pixel portraits, dithered; permit has a zigzag perforated edge and a red seal in the corner; rulebook is a spiral-bound page with bookmark tabs on its right edge and a red seal grid; bulletin has a page counter 1/4 in its corner.
- **Newspaper**: cream sheet, hatched grey text blocks, one rule under the masthead.
- **Letterbox**: gameplay sits in a 4:3 window with black bars; the border yard (concrete grey, hazard stripes, queue silhouettes) is a strip above the booth.
- **Title**: white blocky letters with an olive 3D extrusion, red eagle above, menu of two dotted-underline words.

## Not used on purpose

The eagle, the M.O.A. shield seal, the country names, "Glory to", the title lettering and every character portrait. The mark is an original rubber-stamp silhouette.
