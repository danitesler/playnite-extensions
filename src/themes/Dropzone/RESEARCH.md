# Dropzone — research & sources

## Sources

| What | Where |
|------|-------|
| Colors and measurements | Sampled pixel by pixel from Epic's own screenshots in the Fortnite Creative docs on dev.epicgames.com (fetched 2026-10-01): *Exploring Discover* (lobby with navbar, homebar and rows, Discover rows, island details page), *Let's Play* (lobby, navbar strip, play card with PLAY), *Exploring the Sidebar and Game Menu* (sidebar rail and MENU, settings screen, exit dialog). Each token in `src/tokens.css` names the screenshot and element. Epic publishes no tokens; hover and pressed states are derived and marked so. No image is shipped. |
| Layout notes | The Chapter 5 redesign coverage (Dexerto, Sportskeeda): rounded small icons instead of slanted rectangles, navbar centered at the top, lobby options on the left. |
| Icons | **Material Symbols Rounded**, filled (Apache-2.0, `info/LICENSE-material-symbols.txt`), the closest open set to the game's chunky rounded glyphs. Geometries in `src/Media.xaml` (shifted to a 0..960 grid), menu PNGs in `src/Images/Material/`. Jobs in `icons.json`. |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

The game's font (Burbank Big Condensed) is not free and is not bundled. Body text is Segoe UI; headings, tabs, buttons and titles use **Bahnschrift** (ships with Windows 10+) in Bold with `FontStretch="Condensed"`, the nearest condensed heavy face on every Windows machine.


## Motion

Fortnite's UI is built in Unreal (UMG/Slate), not CSS, and Epic publishes no motion spec, so there is **no stylesheet to read** here (unlike Clutch and Ancient). What exists:

| Fact | Source / status |
|------|-----------------|
| A web rebuild of the lobby's Battle Pass button, described from the game's behaviour: on hover or focus the artwork scales up and the button's bounds scale; the text skews 2 degrees on Y; a skewed bar rises from the bottom; a flash crosses the background. Values in the rebuild: wrapper `scale(1.04)`, transitions `150ms linear` / `150ms ease-out`, flash opacity `0, 0.5 at 15%, 0` over `500ms`. Background triangles scroll at 15 degrees, 50s loop, linear. | arcarr.com, "Recreating Fortnite's UI With Web Components" (fetched 2026-11-08). A fan rebuild of the older, slanted style; it records the author's reading of the game, not Epic's numbers |
| Chapter 5 and 6 menus use rounded small icons and a pulsing PLAY; the theme's existing note says the game pulses the button | Dexerto and Sportskeeda redesign coverage cited in this file's Sources; no timing |
| Focus ring on tiles: 3px, `#ceefff` | Sampled from Epic's Creative docs screenshots (Sources above) |
| Empty lobby or empty Discover row | not documented; nothing to copy |

What I used (sources above, so "the game's 1.04 and 150ms" means "as rebuilt from the game by someone else"):

- **Play hover:** 0.15s ease-out to 1.04 scale with a lighter plate, a 2px yellow halo fading in, and a one-shot flash (white wash to 0.35 at 15% of 0.5s, then 0). While hovered the halo breathes (1 to 0.45, 0.8s each way): the theme's note that the game pulses the button. Pressed: its own deep-yellow layer and a 0.97 squash. Exit 0.2s.
- **Cover hover:** a pale-cyan ring (the tile hover brush) fades in with a small BackEase overshoot from 0.96 to 1 (0.15s); inside the tile the cover zooms 1.04 and the same 0.5s flash runs at 22%. Selected is the static 3px focus ring, unchanged.
- **Cover buttons:** the Chapter 5 and 6 round icon buttons: 44px circles, Play in the PLAY yellow, Info a translucent lobby pill; hover pops to 1.1 with an overshoot and lights the pale-cyan focus ring. Entrance is the shared recipe with a stronger overshoot (the game's UI springs).
- **Empty page:** the theme's parachute mark drifting down (2.6s bob, 3.2s sway on its harness) onto a drop-zone ring that breathes (1.3s), with "No game selected" in heavy condensed capitals. The game has no such screen: this is Dropzone's own motif, kept quiet, loops only while visible.
- **Assets:** none generated. The parachute is the vector mark.

Also changed because PLAY animates over it: the banner in both overviews lost its `OpacityMask` and `BitmapCache` (reference.md: masked art behind animated controls leaves dark seams on scaled displays). The wash is one plain gradient ending in the page brush (translucent, 92%). `Views/Library.xaml` keeps its scrim masks: they are solid-colour rectangles, not art, and were left alone; check them at 125% and 150% display scaling.

Not verified: every number above against the real game; Fortnite's actual PLAY pulse rate; the rounded tile mask (VisualBrush) with the new hover content inside it.
