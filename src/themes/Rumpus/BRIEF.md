# Rumpus — creative brief

Mode: **Showcase** (a game's UI). Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec.

## Source DNA

1. **Squishy lip.** Every plate is a lit cream face over a darker lip, like a button you can press into the page. Lands on: pills in the rail and top bar, list rows, cards, Play, inputs. Built as a face `Border` over a lip `Border`, no blur shadows.
2. **Orange page, butter panels.** One saturated orange backdrop, menus float on it as cream and butter. Lands on: `WindowBackgourndBrush` orange, game page butter, rows cream, the bar yellow.
3. **Heavy rounded type.** Chunky, friendly, a little tilted in spirit. Lands on: Nunito Black titles, Bold labels, a cream title with a hard brown offset shadow in the Settings band.
4. **Color-coded buttons.** Green plays, yellow confirms, cream-and-blue cancels, coral flags. Lands on: Play (green), selected row and toggled plate (yellow), dialog buttons (cream with blue type), notification badge and filter dot (coral).
5. **Chalkboard and sticky notes.** The map and controller screens are a dark chalkboard with handwriting and taped notes. Lands on: the empty game page.

## Game element map

| Game part | Playnite surface |
|-----------|------------------|
| Option row (cream pill, title, caption, control) | Library rows, metadata cards, Settings tree rows |
| QUICK JOIN / START MATCH green pill with a chevron | Play button, main menu pill |
| APPLY yellow pill | Selected row, tab, toggled top bar button, current rail item |
| CANCEL / RESET cream pills with blue type | Button, ToggleButton idle, More and Edit, dialog buttons |
| Bottom bar with cream pills and counters | Top bar and rail, the pills sit on the yellow bar |
| `N` badge on the shop pill | Notification count badge, filter active dot |
| ON / OFF option toggles | CheckBox as a tan capsule that turns green |
| Audio sliders (tan track, orange fill) | Slider, ProgressBar (green level bar) |
| Ping bars (three rising bars) | The running game motif: three indigo bars that fill in order while launching and bob while running |
| Chalkboard with a taped sticky note | Empty game page |
| Sunburst and confetti (level-up screen) | Play hover burst, launching sweep, banner when no art |
| Forum card indigo | Running game color (`RunningIndicatorBrush`) |
| Bone currency | The marker before titles and on the selected row |
| Panel header band with a cream title and shadow | Settings and dialog title band |

## Moments

**Hero: Play.** Rest: a green lip-pill with a dark green label and a chevron. Hover (0.14s ease-out back): the face lifts 2px and the lip grows from 4 to 6px, a pale sheen sweeps across once, six confetti bits (blue, coral, yellow) pop out and settle. Press: the face drops onto the lip and squashes 1px. Launching: an indigo sweep crosses the plate while the three ping bars fill in order; Running: a slow indigo-framed breathing and bobbing bars.

**Secondary:** cover hover (a cream sticker border grows around the cover, the cover lifts), cover buttons (round green Play and cream Info pills that bounce in staggered), rail selection (yellow pill with an orange tick pops in), tree selection (yellow row slides a bone out at the right), tabs and toggles (face lifts, lip grows), checkbox (knob slides, capsule turns green), slider (knob lifts on hover), empty page (a sticky note with tape swings gently on the chalkboard).

**Ambient (one):** the empty page note swings 1.5 degrees every 4.2s while visible. Nothing else loops.

## Motion language

Durations 120ms (hover lifts), 200ms (selections, toggles), 360ms (entrances, the empty note). One easing personality: **BackEase** (`EasingMode=EaseOut`, amplitude 0.35): things pop and settle like squishy buttons. Entrances come from below (6px up) with 50ms stagger. Exits fade plainly (`CubicEase` EaseIn), they never bounce.

## Brand

Name **Rumpus** (an echo of "party", not the game's title). Mark: a **paw print** (four toes over a pad), drawn by the theme (`art/mark.svg`), shown in the Settings title band, the empty page and the tile. The bone is the pointer, not the mark. `GameBannerTintBrush` = `rp-orange-deep` `#D38C37`, the burnt orange rim of the game's menu panels: a darkened banner keeps the page's orange cast.

## Kept calm

The game list and cover grid sit on flat orange; rows have no texture. Metadata text is brown ink on cream with 5:1 or better contrast. Backgrounds behind descriptions stay plain butter.
