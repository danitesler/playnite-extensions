# Rimewash — research & sources

Unofficial theme inspired by the menus of **Child of Light** (Ubisoft Montréal, 2014). Nothing from the game ships: no art, no logo, no font. Everything below was measured from public UI captures.

## Sources

| What | Where |
|------|-------|
| Captures (1920x1080) | Interface In Game, https://interfaceingame.com/games/child-of-light/ : main menu, inventory, skills, options, pause menu, party, oculi (crafting), confessions, map, fight HUD, loading, game over, win, credits, press start |
| Tokens | Median colour samples from those captures (table below), flattened to opaque hex |
| Components | The same captures; sizes measured in 1080p pixels, then scaled 0.5x to the 1280x720 previews |
| Icons | Redrawn by hand in `src/Media.xaml` (no stock pack); the game's own icons (sword, wolf-head shield, crit burst, boot, hourglass, envelope, compass star, cog, door) inform the *shapes*, none is copied |
| Fonts | Jost (Indestructible Type, SIL OFL 1.1) bundled as the stand-in for the game's geometric sans; Constantia (ships with Windows) for the storybook serif titles. Licence: `src/Typography/OFL.txt` |

## What the interface is

Every pause-menu screen (Pause, Party, Skills, Oculi, Inventory, Confessions, Options) shares one template:

- **Page**: a frosted watercolour sheet. Pale blue-grey cloud wash that is lightest at the top and darkens to a blue-grey vignette at the corners; faint pencil roots/branches drawn down the right edge; no hard rectangles anywhere.
- **Header**: the screen title in a large serif (about 90 px tall caps, old-style, slate ink) at left, button prompts at right (`BACK (o)`, `SELECT (x)`, `REMOVE (tri)`) in an all-caps sans with a ring glyph. A band 250 px tall that is lighter (`#e4eaee`) than the page, closed by a **thin dotted pencil rule** at y=247.
- **Plates**: content sits on near-white "snow" plates (`#f0f3f5`, top highlight `#fbfcfd`) with **feathered, torn, slightly wobbling edges** and a soft blue shadow (`#c2d3da`) below. Corner radius about 40 px but never clean: the edge is dry-brush. A plate's inner contents carry a serif sub-title and a hairline pencil rule under it.
- **Slots**: slate rounded squares (`#8d9aa2`, 110 px) with a light inner rim, used for items and letters. Selected = darker slate (`#4d626d`) with a white rim; a round count badge sits on the top-right corner (idle slate `#7d8b93`, selected **gold** `#de9f12` with glow).
- **Cursor**: a hand-drawn **gold chevron** `>` (`#d1a71c`, soft glow) sits left of the selected row/slot. The selected line in the main menu and pause menu gets a **white dry-brush swipe** (`#f4f7fa`, ragged ends) behind it and its label turns ink-dark.
- **Values**: numbers and effect values are printed in **orange** (`#da8a19`): "Skill Points x **0**", "Recover **50%** HP", `17`, `28`. Positive/instant text is green (`#72e64f`), checkmarks green (`#78bb31`), a cancelled option a dark X.
- **Controls**: options use plain label-left value-right rows; checkboxes are slate-framed squares with a hand-drawn green tick or dark X; L1/R1 are small slate (`#617682`) pill chips with white text flanking a character carousel; the "Craft Oculi" primary button is a **slate plate** (`#506c7a`, 2 px light rim, inner shadow) with white caps and a tool glyph at each end.
- **Skill tree**: round (passive) and rounded-square (active) nodes joined by short pencil lines; learned nodes are gold (`#e6b31c`) with a star count, locked ones slate-grey (`#abbec6`), a dark navy node (`#848f93`/`#2f3d4a`) is "available"; star pips sit on top.
- **Battle HUD** (dark scenes): party plates are smeared grey-white watercolour strips (`#aab0b8`) with a green HP dot (`#dafb3c`) and purple MP dot (`#d36ce1`); the level is a gold watercolour blob; Igniculus's bar is a thin teal line under a cyan wisp (`#5ef1e3`); the **timeline** is a pencil-framed bar, teal "WAIT" zone (`#6f9da6`) then a red "CAST" zone (`#d02534`) with round character markers hanging from it.
- **Mood in dark scenes** (Pause, Game over, Loading): everything dims to near black (`#151e20`), titles stay in pale serif (`#a9c3c9` on game over), the roundel emblem sits alone at the centre; "Loading.." in serif bottom right.
- **Title/start screens**: logo in thin deco capitals; the selected line is again the white brush swipe, the prompt "Press (x)".

## Measured palette (median of regions, 1080p captures)

| Role | Hex | Where |
|------|-----|-------|
| Page wash, top | `#b5c8d1` | inventory, top-left |
| Page wash, corner | `#7894a1` | inventory, lower-left vignette |
| Page wash, lower middle | `#c4cfd4` | inventory, bottom |
| Header band | `#e4eaee` | inventory, centre of band |
| Snow plate | `#f0f3f5`, highlight `#fbfcfd` | inventory right plate; crafting card |
| Plate shadow | `#c2d3da` | crafting, under card |
| Menu swipe | `#f4f7fa` | pause menu selected line |
| Title ink | `#394d57` | "Inventory" |
| Menu ink | `#3d4e56` | pause menu entries |
| Body ink | `#4e595f` | "Recover 50% HP" |
| Pencil rule | `#a2a7ab` | rule under header |
| Slot idle / selected | `#8d9aa2` / `#4d626d` | inventory |
| Slate chip (L1) | `#617682` | options |
| Slate button | `#506c7a`, rim `#496573` | Craft Oculi |
| Badge idle / gold | `#7d8b93` / `#de9f12` | inventory |
| Cursor gold | `#d1a71c` | chevron |
| Node gold | `#e6b31c` | skills |
| Orange values | `#da8a19` | skill points 0 |
| Green tick / instant | `#78bb31` / `#72e64f` | options / skills |
| Cast red | `#d02534` | timeline |
| Wait teal | `#6f9da6` | timeline |
| Wisp | `#5ef1e3` (soft `#d3f7f6`) | Igniculus |
| Fog / forest (dark scenes) | `#497681` / `#151e20` | main menu |

## Typography

- Titles: a high-contrast old-style serif with a wide, calm colour (Garamond/Sabon family) at 90 px caps height on a 1080p page, about 8% of the screen. Windows has **Constantia**, which is close (old-style figures, soft serifs).
- UI text: a Futura-like **geometric sans with a single-storey "a"** and thin even strokes (Century Gothic / Avant Garde feel): menu entries, labels, values. Stand-in: **Jost** (Regular 400, Medium 500).
- Button prompts: the same sans in capitals, about 0.04 em tracking.
- Poems ("Journey across the thorns sharp, / Fly delicately...") are serif, 1.0 line height, left aligned.

## Motion (from the captures and the game)

- Menu highlight: the white swipe draws in left to right (about 150 ms) and the chevron slides in from the left with the text a few px right.
- Slots: selected slot darkens and its badge gets a soft gold glow.
- Pages cross-fade; the dark scenes fade up from black.
- Igniculus drifts and glows (sine, 2-3 s); fireflies drift in the credits and menu fog.

## Shape / brand decisions

- The game's roundel (crossed branches, sun, moon) is its logo: **not used**. Rimewash draws its own mark, a hoarfrost crystal in a torn disc (`art/mark.svg`).
- Chevron, swipe and torn plate are generic painting devices; the exact sprites are generated by `art/sprites.py` from noise, not traced.
