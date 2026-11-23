# Checkpost — creative brief (Showcase)

Unofficial *Papers, Please*-inspired desktop theme. Measurements and sources: [RESEARCH.md](RESEARCH.md).

## 1. Candidate lenses -> pick 1

Last themes in `src/themes/AGENTS.md`: Subspace (LCARS elbows), Dewfield (walnut ledger), Counterfoil (film transcript), Testbed (cleanroom), Joyride (GTA collage), Ditherwake (copperplate ledger), Stride (glass), Wildhand (run HUD).

- (a) **Diegetic / Artifact**: the inspector's booth, documents on a desk. Dropped: Dewfield, Counterfoil, Ditherwake and Cropmark already own "paper object on a desk", and paper cannot carry a library list.
- (b) **HUD / Telemetry**: the booth overlay (clock, citation counter, SPACE / TAB tags, red alert). Folded in: tags and the red X become rail items, shortcuts and the close plate.
- (c) **Title / Pause Menu — chosen**: the game's menu and end-of-day report screens: black void, olive plates, cream ledger lines, dotted-underline words, one DAY tab between hairlines. Nothing in the catalog is black-and-olive with no frames; the stamp bar (the game's best-known object) is spent on Play, and paper appears only where a document would, as slips, tooltips and the empty page.

## 2. Source DNA

| Trait | Where it lands |
|---|---|
| **Void + olive**: black screens, flat `#384636` plates with notched corners, cream text | page and lists on void, rail/top bar on booth brown, plates for tabs, chips, tags |
| **Dotted rules**: every underline, leader and divider is a one-pixel dotted line | ghost buttons, menu group breaks, metadata leaders, ledger total, focus line |
| **Stamps**: green APPROVED, red DENIED, black knob, red seal, ink imprint | Play (green stamp), close / danger (red), filter mark (seal), press imprint |
| **Paper documents**: pink, lime, cream, pale-blue sheets, scalloped or perforated edges, taupe inner borders, brown ink | the **permit sheet** that carries the metadata, selection slips, tooltips (identity record), empty-state bulletin, tabs as rulebook bookmarks |
| **Pixel face and steps**: Pixelify Sans for titles and the stamp, 2px edges, no glow, motion in whole-pixel jumps | titles, Play, headings, DAY tabs at 17px and up; `DiscreteDoubleKeyFrame` everywhere, 2-4px hops, stepped fades |

## 3. Game element map

| Game part | Playnite surface |
|---|---|
| Stamp bar: black knob over a green APPROVED body | **Play button** (hero): green plate, black knob, base lip, label in display caps |
| Red DENIED stamp | Context action / Cancel label while running, danger plates |
| Entry permit (scalloped edge, taupe inner border broken by a title, caption + value on an underline) over a pink citation slip, red seal on the corner | **Metadata**: the permit sheet, pink paper over a lime one; fields are a caption and a value on an underline; negative values in red like the ledger's expenses |
| "DAY 17" olive notched tab between hairlines | **Settings title band**, Expander and group headers, tree section heads |
| NEXT / WALK TO WORK dotted-underline words | **Button** (ghost word + dotted line), dropdown rows, menu items |
| OK circles for family members, the rulebook's round dark seals | **RadioButton** (olive disc, lime dot), **score seals** (dark disc, dotted inner ring, number in the rating colour) |
| SPACE / TAB key tags | **Rail items** (olive key-cap tags), **menu shortcuts** (key-cap) |
| Red "HIGHLIGHT DISCREPANCIES" bar with red X | **Grid side-panel close plate** (28x28 olive plate on a hard ledge, cream X, red fill on hover) |
| Red seal and eagle | **Filter mark** (red seal pip), brand tile, empty-state stamp |
| Boxed "Keep on person" tag on the permit | **Chips** (outlined boxes on the sheet, inked when hovered) |
| M.O.A. identity record (pale blue slip, dotted perforation) | **Tooltip** |
| Rulebook section titles (name over a dotted underline) | **Section headings** (About, Notes) |
| Interrogate callout (cream frame + dotted leader tag) | **Cover selection**: cream frame, corner ticks, dotted callout under the title |
| Official Bulletin sheet with hatched text blocks | **Empty game page** (cream sheet, hatched lines, stamp mark) |
| Rulebook bookmark tabs | **TabControl** (bookmark tabs on the page edge) |
| Letterboxed booth window | **Hero banner**: art between black bars, stepped dissolve into the void |
| Empty family circle | Empty / unavailable value slots |

Three read on sight: green stamp Play, olive DAY tab with hairlines, dotted-underline words on black. Fourth: the red seal.

## 4. Signature levers

| Lever | Choice |
|---|---|
| Hero banner transition | **Letterbox + stepped dissolve**: art sits under a 10px black bar, then 6 hard bands of void climb over its lower half (no smooth fade) |
| Play button | **Rubber stamp**: green face, 3px dark ledge, black knob disc on the left with a lit ring; hover lifts the face 2px and the knob lights; press slams 3px and flashes a rotated ink-frame imprint (-4deg) |
| Metadata container | **Permit sheet**: pink scalloped sheet (a ring of round dots) over a lime one, taupe inner border broken by the stamp mark, a red seal on the corner; caption + value on an underline; group break = a dotted rule in the permit's taupe |
| Chip + score silhouette | Chip = outlined box (1px taupe, pink-lit fill, brown ink), hover = filled ink with pink text; score = **round dark seal** (olive-deep disc, dotted inner ring, Consolas number in the rating colour) on its underline |
| Row / cover selection | Row = **paper slip** (lime plate, ink text, three punched dots on the left, steps in 4px); cover = **cream frame with corner ticks** and a dotted callout strip |
| Close plate | 28x28 olive plate on a hard 3px ledge, cream X; hover fills red (the discrepancy bar's X) |

## 5. Popup menu levers (`docs/themes/menus.md`)

| Lever | Choice |
|---|---|
| Panel | Olive-deep board, 2px olive rim, 3px black hard shadow below and right |
| Highlight | Lime paper slip with ink text, three punched dots left; steps in over 3 frames of 35ms |
| Group break | Dotted one-pixel rule from the icon column |
| Icon hover contrast | Icon column rests dim green-grey, turns ink on the slip |
| Shortcut | Key-cap tag (olive plate, mono caps) on the right edge, ink-on-lime when highlighted |
| Submenu mark | 8px pixel triangle in seal red |
| Marked rows | Exit (`Alt+Q`): red-lit text and a red 3px left bar, red slip with cream text on highlight; checked rows a pixel OK tick in lime |

## 6. Motion language

Pixel, stepped. fast 100ms, base 200ms, slow 400ms. Easing personality: `DiscreteDoubleKeyFrame` (3-4 steps), never smooth glow. Entrance direction: down (a stamp coming onto the page), 4px hop. Stagger 60ms.

- **Hero**: Play hover (lift 2px in 2 steps, knob ring lights) and press (slam 3px, imprint frame flashes 160ms).
- **Secondary (6)**: details row hover (olive wash steps in, 4px nudge) and selection (slip snaps in with punched dots); cover hover (frame ticks appear one corner at a time) and selection (cream frame + callout drop 4px); cover Play / Info stamps drop in staggered; rail tag pops; tree DAY-tab fill; checkbox tick stamps in.
- **Ambient (1)**: running mark: three amber dots stepping like a typewriter, 600ms per step cycle. Nothing moves behind lists.

## 7. Brand

Name **Checkpost**. Mark: an original rubber-stamp silhouette (round knob, neck, wide body, base, three dotted impressions below), drawn in `art/mark.svg`, reused in the main menu tile, Settings band, the permit sheet's border gap and seal, the empty page and `info/icon.png`. `GameBannerTintBrush` = `--olive-deep` (the title screen's extrusion shade, the darkest branded surface). Running = amber, used nowhere else.

## 8. Restraint

Lists and covers stay flat black and cream; paper (the permit sheet, the tooltip, the empty bulletin) is the only light surface and the only texture besides the banner bands and the plates.

## 9. Revision after the first preview (user reference captures)

The user asked for a pixel face on titles and the main button, and for the details to stand out like the Arstotzka entry permit with a pinkish ground. The first brief had the metadata as a bare ledger on the void; it is now the permit sheet (pink, scalloped, taupe inner border). Titles, section headings, tabs and the Play stamp use Pixelify Sans at 17px and up (feature-stripped copy); Pathway Gothic One was dropped. The tooltip became the pale-blue identity-record slip.
