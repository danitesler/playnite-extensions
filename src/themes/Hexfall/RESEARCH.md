# Hexfall: research

What the source is, measured. What the theme does with it: [`BRIEF.md`](BRIEF.md).

## Sources

| What | Where | Notes |
|------|-------|-------|
| Requested reference | [gameuidatabase.com/gameData.php?id=405](https://www.gameuidatabase.com/gameData.php?id=405) (Age of Wonders: Planetfall, Triumph Studios, 2019) | 65 captures at 1920x1080, read on 2026-11-13 in a browser. Nothing was saved or shipped; colours were sampled from the full-size images in the page (median of a region, or the brightest / most saturated pixel for lines). |
| Captures read | Title screen, Main menu, Options (General), Pause menu, Research tree (Military), Imperial Archives (codex), Select Commander, Pre-game "Ready for Planetfall", Commander equipment, two HUD frames (battle, world map) | Region coordinates are in 1920x1080 pixels. |
| Fonts | No source names the game's faces | Display: wide geometric caps. Body: humanist sans. See Type. |
| Icons | Cut for this theme in `src/Media.xaml` | Nothing traced from the game. |
| Motion | No video | See Motion: assumptions, flagged. |
| Structure | Playnite Default theme 10.60 (MIT), through this repo's Emberline wiring | `info/LICENSE-Playnite.txt` |

## Colors (sampled)

| Role | Value | Capture | Token |
|------|-------|---------|-------|
| Panel interior | `#0a1c2b`, `#0b1c33`, `#0b212d` (translucent over the scene) | Options | `pf-hull` |
| Field / row fill | `#091722`, `#06131e` | Options dropdowns | `pf-well`, `pf-void` |
| Menu button fill | `#0a1828`, `#112534` | Options (CONTROLS) | `pf-plate` |
| Hover / raised plate | `#183946` | Options | `pf-plate-hi` |
| Button edge | `#305369` | Options | `pf-line` |
| Panel frame | `#3b84a9`, `#4999ca`; lit edge of friendly HUD plates `#48d2f6`, `#60c9e7` | Options, HUD | `pf-frame`, `pf-cyan` |
| Panel inner rule | `#1c475a`, `#27475c` | Options | `pf-line-dim` |
| Tree / connector line | `#526e7c` | Research | `pf-slate` |
| Title and button text | `#cff4fd`, `#ecf9ff`, `#effaff` | Options, Codex | `pf-ice`, `pf-white` |
| Panel rule text | `#aed8e6` | Options | `pf-mist` |
| Keyword link | `#58bced` | Codex | `pf-link` |
| Slider thumb | `#84d2f8` | Options | `pf-cyan` family |
| Selected nav button | fill `#09251e` / `#092521`, edge `#387565`, text `#ecf9ff` | Options (GENERAL) | `pf-viridian`, `pf-viridian-edge` |
| Active tree node edge | `#0e9a15`, fill `#1e3b41` | Research | `pf-go` |
| Active tab | fill `#444f3d`, edge `#d5d78c`; idle tab `#1b2832` | Research (MILITARY) | `pf-olive`, `pf-olive-edge` |
| Brass action button | fill `#6b5224` / `#735a2e`, edge `#a2843b` / `#b29049`, lit `#a27a40` with edge `#ffdf77`, text `#fff3e0` | Options (OK), Codex (CLOSE), Research | `pf-brass*` |
| Brass ornament | `#9f8b56` | Options cap | `pf-brass-dim` |
| Orange bullets, slashes | `#d97810` (bullet), `#e37d2b` ("//" heading), `#d38f4e` (category icons) | Codex | `pf-amber` |
| Orange check mark | `#f58450` | Options | `pf-amber-hot` |
| Orange dropdown arrow | `#944719` (dimmed in capture) | Options | `pf-amber-dim` |
| Orange shield badge | `#dc570a` | Equipment | `pf-badge` |
| Gunmetal cap | `#474946`, `#585a56`, `#59544a`; lamp lights `#e48a41`, white `#f1f3f4` | Options | `pf-gunmetal*` |
| Scroll thumb | `#7ba8a3` | Codex | `pf-steel` |
| Resource: energy / shield / cosmite | `#f4d501` / `#0091fe` / `#ae43f1` | Research top bar | `pf-energy`, `pf-shield`, `pf-cosmite` |
| Hostile marker | `#ff001c`, `#fd2824` | World map | `pf-hostile` |

Derived, not sampled: `pf-plate-lit` (pressed plate), `pf-dim` (hint and disabled text), `pf-brass-void` (a dark brass wash for a lit brass button).

## Chrome and rules observed

- **Panels.** Dark navy glass over the scene, a 1px frame in steel cyan, corners cut at 45 degrees. A gunmetal cap bar crowns the Options dialog and a mirror cap closes it: riveted plates, a central notch, three small lamps (orange, white, orange) lit on the cap. The Codex and Pause menu use a slimmer brass cap with a centre badge.
- **Menu buttons.** Dark rectangles with a 1px cyan-grey edge, centred caps label, 28px high at 1080p, stacked with 4px gaps. The selected one fills deep green with a green edge.
- **Action buttons.** A brass plate with a double rim: OK, CLOSE, RESEARCH, START GAME. The brightest control on screen; the lit state adds a yellow rim and a cream label.
- **Lists.** Codex and Commander rows: orange square bullet (Codex) or a portrait square (Commander), white label, coloured sub-label ("Assembly, Synthesis"), a hairline between rows. Selected: a warm grey fill with the same hairline.
- **Headings.** `//Imperial Archives`, `/BASICS`, `/Accuracy`: an orange slash run before white caps.
- **Dropdowns.** A dark field, caps value right-aligned, a small orange triangle at the right.
- **Sliders.** Dark rail, cyan thumb, a chevron button at each end.
- **Check boxes.** Dark square with a cyan edge; the check is orange.
- **Tabs (MILITARY | SOCIETY).** Flat rectangles; the current one olive with a pale yellow-green edge.
- **Research tree.** Dark cards joined by 1px grey-blue rules; a circular emblem at the card's left with a rank ring; a cost counter at the bottom-right; the active node edged green.
- **HUD.** Unit slots as dark square cards under a small cost caption; an ability hotbar of square slots each with a key number; resource bar with an icon and a number per resource; a minimap in a triangular bracket.
- **Targeting.** Thin hex rings and arcs on the map (cyan friendly, red hostile); a faint radar ring grid behind the title screen.
- **Loading.** A circular arc spinner above a thin progress bar with a left-to-right fill.
- **Scroll.** A 5px steel bar on a dark lane.

## Type

- Display: wide geometric caps, medium weight, tracked (OPTIONS, SELECT COMMANDER, menu items). **Sora** (OFL, bundled) stands in: an eyeball match, not a confirmed one.
- Body: humanist sans (Open Sans or Segoe class). **Segoe UI** ships with Windows.
- Small caps labels at 10-11px with +0.06em tracking on panels ("PLANET SCAN", "COMMANDER").

## Interface parts (feeds the game element map)

Options cap bar and lamps, menu button, brass button, selected nav button, dropdown with orange arrow, slider with end chevrons, orange check box, `//` heading, orange list bullet, commander list row, planet scan table, objectives header, tab with olive fill, research node card, resource bar, unit slot card with cost caption, ability hotbar slot with key number, tooltip (dark plate, bold white title, grey body), loading arc, targeting ring.

## Motion

Not measured: no video was available. Assumed from the genre and the still frames: panels fade in with a short rise, the brass buttons gain a yellow rim on hover, the target rings pulse slowly. Recorded in BRIEF.md as the theme's own language, not the game's.

## Icons

Hand-cut for Hexfall in `src/Media.xaml`: outlines about 2.5px thick on a 24 grid with 45-degree cuts, and hexagon rings where a round glyph would sit (search lens, notifications, random), so they read as the same family as the cut-corner panels. Nothing is traced from the game.
