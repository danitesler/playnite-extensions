# Calling Card — research & sources

Unofficial fan theme after the **Persona 5 menus** (Persona 5, Royal, and the spin-offs Strikers and Tactica). No ATLUS or SEGA art, logos, fonts or game files are used or shipped (`info/NOTICE-CallingCard.txt`); the star mark, plates, sawtooth edge and halftone are drawn for this theme.

Everything below was written down when the theme was built (colors in `src/tokens.css` header comments, notes in `AGENTS.md`). The capture images themselves are not stored in the repo, so the measurements cannot be re-run from here: where a value is only recorded, not reproducible, it says so.

## Sources

ATLUS publishes no design system and the menus are drawn art, not style sheets, so there are no tokens to import. Colors were measured on screenshots with ImageMagick (`+dither -colors N` on cropped regions, dominant swatch).

| Tag | Source | What it gave | Status |
|-----|--------|--------------|--------|
| `[P5T]` | Persona 5 Tactica, Steam store screenshots (app 2254740), 1920x1080, the PARTY pause menu | Current command's red plate `#f60305`, the blue sliver `#1e6ee5` offset behind it, black plates `#030101`, Tactica's cream stripes `#eae2ce`; command rows about 54px tall, plates tilted about 12 degrees, torn white stripes beside the commands (the rail's sawtooth) | measured, captures not in repo |
| `[P5S]` | Persona 5 Strikers, Steam store screenshots (app 1382330), 1920x1080, the hideout command list | Selected command `#f90807` (red plate, white text); black command plates `#0a0a09` with white edges; ransom-note lettering (not reproduced) | measured, captures not in repo |
| `[P5R]` | Persona 5 Royal, Steam store screenshots (app 1687950), 1920x1080: dialogue box, battle HUD, skill name plates | Paper `#f4f4f4`; HP teal `#73f9dc`, SP pink `#e066d0`; the black name plate in a white edge with a red drop (the title plate on the game page) | measured, captures not in repo |
| `[P5C]` | Confidant screen from mechanicsofmagic.com, "Visual Design of Games: Persona 5" (2022-04-23), 1200x675 | Red ground `#9c0511` / `#660206`; greys `#2f2727`, `#605f5f`, `#a5a1a1`; the white name plate (tooltips); the black info box in a white edge (metadata pane) | measured on the article image |
| `[eye]` | Chosen between measured values | Hover red `#ff2a24`, pressed red `#c40208`, coal `#141212`, soot `#1f1b1b`, amber `#ffc21a` | **not measured**: nothing in the games has exactly these surfaces |
| Analysis | mechanicsofmagic.com (above); itch.io, "Making UI come to life: study of Persona 5" | The palette is red, black and white with a splash of blue on the current selection; the selected item grows and takes color | read, summarised in AGENTS.md |
| Icons | Heroicons 2.2.0 solid, MIT (`info/LICENSE-heroicons.txt`), via `art/icons.py` | The heaviest open set covering Playnite's roles; the menus draw chunky solid glyphs. Menu PNGs in `src/Images/Heroicons/` | pinned version |
| Mark | `art/icons.py` -> `art/mark.svg`, `IconMainMenu`, `info/icon.png` | Original tilted five-point star | original |
| Playnite | Playnite 10.60 Default theme, MIT (`info/LICENSE-Playnite.txt`) | Structure of every XAML file | |

Not available: no ATLUS style guide, no font files, no direct UI captures taken for this repo (only publisher store screenshots and the article above). Row heights, the 12 degree tilt and plate offsets are read off the 1080p screenshots by eye; no pixel measurement is recorded for them.

## Measured / chosen values

All names are in `src/tokens.css` (this theme's own; the games publish none).

| Token | Value | From |
|-------|-------|------|
| `red` | `#f60305` | `[P5T]` current plate (`[P5S]` has `#f90807`) |
| `red-hover`, `red-pressed` | `#ff2a24`, `#c40208` | `[eye]` |
| `blood`, `blood-deep` | `#9c0511`, `#660206` | `[P5C]` red ground, lit and in shadow |
| `ink`, `ink-soft` | `#030101`, `#0a0a09` | `[P5T]`, `[P5S]` black plates |
| `coal`, `soot` | `#141212`, `#1f1b1b` | `[eye]` raised plate on ink; hovered row |
| `ash`, `smoke`, `fog` | `#2f2727`, `#605f5f`, `#a5a1a1` | `[P5C]` greys |
| `paper` | `#f4f4f4` | `[P5R]` HUD white |
| `bone` | `#eae2ce` | `[P5T]` cream stripes (chips' hover edge only) |
| `echo-blue` | `#1e6ee5` | `[P5T]` the sliver behind the current plate |
| `hp-teal`, `sp-pink` | `#73f9dc`, `#e066d0` | `[P5R]` HP and SP |
| `amber` | `#ffc21a` | `[eye]` battle "WEAK" yellow |
| `ink-scrim`, `white-veil`, `red-veil` | 85% ink, 12% paper, 25% red | derived |

### Type

The menus' lettering is custom art (ransom-note mixes of cut letters), not a font, so no face was measured. Headings use `HeadingFontFamily` = **Impact, Haettenschweiler, Arial Black**: Impact ships with Windows and is the closest heavy condensed face; body is Segoe UI at 12 / 14 / 16 / 20 / 32. Previews draw Impact with the bundled Anton and Segoe UI with Selawik (`scripts/data/fonts.json`).

### Shape and sizes

Every plate in the menus is a hard polygon, so all radii are 0 (`--radius`). The signature shape is a parallelogram tilted 12 degrees (`SkewTransform AngleX="-12"`) with a second plate dropped behind it. Spacing was measured at 1080p and scaled by 2/3 (Playnite's 14px body against the menus' 21px labels): buttons 34 tall, command rows 30 tall, group captions 20px. Edges are 2px.

## Design decisions

- Three colors: ink plates, paper text, one red for whatever is current, plus the blue sliver Tactica offsets behind the current command.
- Slanted plate on the current sidebar item, tab, list row and view button; the blue sliver sits behind it. Hover is a paper or soot plate.
- Layout per repo shell rules: 44px compact rail on the left (ink, paper sawtooth edge, red star block on top), 52px transparent top bar on a hard 2px ash rule, red halftone fading into the library corner.
- The game page title is the battle name plate; the metadata pane is the black info box in a white edge.
- **Signature motifs drawn in the previews**: slanted red plates with a blue sliver; the paper sawtooth rail edge; the red halftone in the corner; the name plate with a red drop; paper chips with ink text; Impact capitals with a red slash before headings.

## Not reproduced

Ransom-note lettering, collage art, stars and moving shapes, character art, game fonts. See AGENTS.md -> Deviations.
