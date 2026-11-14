# Inkbolt — research & sources

Source: **Infamous 2** (Sucker Punch, 2011), UI as catalogued on Game UI Database, <https://www.gameuidatabase.com/gameData.php?id=801>
(tags: Gamepad, PlayStation, Widescreen, Action, Open World, 3D Realistic, Third Person, Urban & City, Flat-Textured).
23 captures at 1920x1080, `https://www.gameuidatabase.com/uploads/Infamous-2<date>-<id>.jpg` (loading screen, Settings: Gameplay, button
layout, mission accept, Powers menu and its five purchase screens, area map, documents and intel, sound and music player, HUD).
Colors below were sampled from those captures in the browser (5x5 / region medians on the decoded image; JPEG noise, so each is rounded
and, where a value had to read on a dark window, tuned and marked "tuned"). Nothing is copied from the game: no logo, no art, no font file.

## Sources

| What | Where (package, version, file) |
|------|--------------------------------|
| Tokens | No published tokens. `src/tokens.css` holds values measured from the captures (table below) under role names (`ink-*`). |
| Components | The captures above: menu list and cursor, section tabs, detail panel, option rows, loading bar, HUD health bar, map legend, torn-photo frame. |
| Icons | Drawn in `Media.xaml` as geometries in the source's glyph language (blocky controller-button tiles, a hand, a padlock, a bolt). No icon pack; no license file needed. |
| Fonts | Barlow (body) and Barlow Condensed (headings), SIL OFL 1.1, bundled in `src/Typography/` as stand-ins for the game's distressed condensed capitals. |

## Palette (sampled, 1920x1080 captures)

| Role in the game | Sampled | Notes |
|------------------|---------|-------|
| Menu cursor slab | `#FEFFFF` | near-white plate, black text, arrowhead notch on the right, hand glyph when equipped |
| Row plate | `#413F3C`, `#393836` | warm charcoal, ~70% opaque over the grey wash |
| Section tab and detail header band | `#AAAAA9`, `#B1B2B3` | light grey band, black small caps; `1403` XP count left, `AVAILABLE XP` right |
| Detail body | `#605F5A`, lower box `#393836` | |
| Background wash | `#3A3E40` to `#555452`, highlights `#A7A8A8` | grey ink-splatter, torn paper, rain-streaked street photo |
| Corner ribbon | base `#283447`, highlight `#4C7AD2` | cobalt baroque damask ribbon in the top-right and bottom-right corners, with a diagonal slash band |
| HUD lightning | `#315ED6` core, `#F8FDFB` hot centre | zig-zag "health" line, blue-white |
| HUD ring | `#FDA403` | orange segmented ring around a purple orb (energy/health) |
| Karma tiles | evil `#65271D`, good `#425262` | square tiles (red / steel blue), padlock on locked rows |
| Dark edge | `#25292A` | |

Tuned for a dark Playnite window (marked in `tokens.css`): window page `#141516`, content `#1B1C1D`, plate `#2A2927` (the sampled charcoal one step
darker so it separates from the page), text `#DCDCD8`, muted `#A3A3A0`, lit bolt `#7FA8FF` (the sampled bolt `#315ED6` is too dark for text on
charcoal), evil karma `#C4472F` (sampled tile `#65271D` brightened for glyphs; the sampled value stays as the loading-bar remainder).

## Type

- Menu labels and section tabs: bold condensed capitals, slightly uneven and ink-bled (a distressed grotesque). Item names read as heavy
  small-cap slab text. Stand-in: **Barlow Condensed** SemiBold, uppercase, +0.04em tracking.
- Body copy (descriptions, hints): a plain humanist sans, light grey on charcoal. Stand-in: **Barlow** Regular / SemiBold.
- Mission toast: white bold title with a black drop shadow over a grey sub-line (`CONDUIT, NOT HUMAN` / `Mission Start`).
  Lands as the game page title.
- Windows fallbacks: Arial Narrow, Segoe UI.

## Interface parts (menu and HUD)

- **Menu list** (`Powers`, `Settings`, `Sound & Music`): full-width translucent charcoal rows 24 to 26 px at 1080p, light text; the current row
  is a near-white slab with black text and a right-pointing arrowhead notch; section tabs (`POWER LEVEL 1`) are thin grey bands with black
  caps; locked rows are ghosted with a padlock tile (red or blue karma tile).
- **Left button column**: a stack of controller-button tiles (R1, X, square, triangle, R2, D-pad...) as 24 px black glyphs; the current one is
  a white tile with a notch pointing into the list. The map: category icons and the ring-and-orb mark at the bottom.
- **Detail panel**: grey header band (`1403` left, `AVAILABLE XP` right, black), bold title, a framed preview picture, description, and a dark
  status box (`Acquired`, `Press X to purchase`).
- **Option rows** (`Settings: Gameplay`): label on a charcoal plate, value on a separate plate; current row `< NORMAL >` with arrow chevrons on a
  white slab; slider = thin dark line with a small white block thumb.
- **Loading screen**: black, centred two-line capitals tip text, a thin two-tone bar (blue progress, red remainder) with `Installing... 22%`
  above it.
- **HUD**: a segmented ring around an orb at the top left and a jagged electric-blue zig-zag as the health line; an orange ring segment as
  energy; a small round minimap bottom right with a ring; enemy health as a thin red bar with a name under it; contextual prompt = a D-pad
  diamond plus a white `R1` key cap and a label.
- **Map**: dark roads with thin blue rims, orange mission dots, a translucent charcoal `LEGEND:` box with glyph rows.
- **Documents**: a night photograph in a black ink-torn, splattered frame over a grey radial burst.
- **Back plate**: rain-streaked grey photograph under a grain and ink-splatter wash; the cobalt ribbon runs diagonally in the top-right, a star
  motif and acanthus scrolls at the left and bottom edge. Button prompts bottom left (`Navigate`, `Select`, `Back`) as small round glyphs.

## Motion (from the game, no frame-step captures available)

The captures are stills, so motion is inferred from the menu's behaviour: the cursor slab jumps row to row; the list slides in from the left;
hold-to-confirm in the game fills a ring. The lightning line is a continuously re-randomised zig-zag (jittering a few frames per second).
Decisions are in `BRIEF.md` (Motion).

## Fonts and licenses

Barlow and Barlow Condensed: SIL OFL 1.1 (Jeremy Tribby), `src/Typography/OFL.txt`. Named in `info/NOTICE-Inkbolt.txt`.

## Branding

Fan theme. Name "Inkbolt" echoes the source (ink and a bolt) without being an official name. The mark is a broken ring around a zig-zag bolt,
drawn from shapes in the source, not its logo.
