# Rimewash — creative brief

Mode: **Showcase**. Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec.

- **Source DNA (5 traits -> where each lands)**
  1. *Frosted watercolour paper*: pale blue-grey cloud wash, darker vignette at the edges. -> `WindowBackgourndBrush` wash, a cloud/grain mask over page and plates (`art/sprites.py`), banner fade.
  2. *Torn snow plates*: near-white panels with feathered, wobbling edges and a soft blue shadow, never a clean rectangle. -> game page sheet, GroupBox / Expander cards, popups, filter and explorer panels, Settings sections (9-slice plate sprite).
  3. *Slate ink + pencil rule*: slate ink type and a thin dotted pencil line under every title. -> text colour, `HeadingRuleBrush` under group headers, title band, top bar closing rule.
  4. *Gold chevron and orange numerals*: a hand-drawn gold `>` marks the cursor; values print in orange. -> selection marker on rows, tree, tabs, Play; metadata values and counts in orange.
  5. *Storybook serif over geometric sans*: Constantia-style titles, Jost UI, verse-like empty text. -> `HeadingFontFamily` for game title, group captions, window titles; empty page poem.
- **Game element map (8+ source parts -> Playnite surface)**
  1. Menu **white brush swipe** behind the selected line -> selected game row (details/list view), Settings tree selection, sidebar current item, top-bar toggles.
  2. **Inventory slot** (slate rounded square, rim, gold count badge) -> grid-view cover tile frame; selected cover = deep slate rim; badge = the completion/running mark.
  3. **Torn snow card with serif title + rule** -> game page sheet, GroupBox, Statistics cards.
  4. **Craft Oculi slate button** (white caps, tool glyph either end) -> `Button` and the Play button.
  5. **L1 / R1 slate pill chips** -> `TabItem` selected state and numeric badges.
  6. **Checkbox** (slate frame, hand-drawn green tick / dark X) -> `CheckBox` and `RadioButton`.
  7. **Skill-tree node + pencil link** -> `Slider` (pencil track, gold node thumb), radio dot.
  8. **Battle timeline WAIT/CAST bar with round markers** -> `ProgressBar` (teal track, red cast end, round wisp marker); global top-bar progress.
  9. **Level blob** (gold watercolour disc with number) -> filter-active mark and notification count.
  10. **Igniculus wisp** (cyan glow, bobbing) -> running indicator mark on rows, covers, Play.
  11. **HP / MP plate** (smeared grey strip, coloured dot) -> metadata chips (`PropertyItemButton`), dot colour by group.
  12. **Button prompts** `BACK (o)` `SELECT (x)` -> caption buttons (close = ring with x), dialog footers.
  13. **Loading roundel + "Loading.."** -> empty game page.
- **Hero moment**: *Play hover and press*. Hover: the slate plate lifts, a white swipe draws across it left to right, the gold chevron slides in at the left and the wisp trails one pass (240 ms). Press: plate darkens to deep slate, a gold ring blooms from the click point and the chevron nudges forward. Separate pressed layer.
- **Secondary moments (5+)**: cover hover (rim to gold, tile lifts 2px, chevron appears); cover Play/Info discs (staggered rise, gold glow on hover); sidebar current item (swipe + chevron); Settings tree selection (swipe + chevron); tab selection (slate pill slides); checkbox (tick draws, 140 ms); slider node (gold bloom on drag); list row hover (swipe 60%).
- **Ambient (sparse areas only)**: empty game page, the roundel breathes (4 s) and two motes drift; nothing animates over lists or metadata.
- **Motion**: fast 110 ms, base 200 ms, slow 380 ms. One easing personality: `CubicEase` EaseOut, calm and painterly. Entrance direction left to right (the swipe). Stagger 50 ms on cover discs and chip rows. No bounce.
- **Brand**: name **Rimewash**. Mark: a six-armed hoarfrost crystal in a torn disc, with a tiny gold chevron under it (`art/mark.svg`); reused in the Settings title band, empty page and tile. `GameBannerTintBrush` = frost band `#e4eaee` (paper tint, light theme): the banner dissolves into snow, never black.
- **Kept calm**: library lists and cover grid backgrounds are flat wash; metadata text is plain ink on snow; the game description has no texture behind it.

## Light-theme rules that apply

`WindowArtForegroundBrush` is the lightest text (`#f8fafb`) and flips unselected list rows, group headers and the game title while Playnite's window-background setting is on. Selected and hover plates keep ink text. All inks are at least 4.5:1 on their plate: `rw-ink` 7.9:1 on snow, `rw-ink-muted` 4.8:1, `rw-amber-ink` 4.9:1.
