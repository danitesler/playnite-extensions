# Verst — creative brief

Mode: **Showcase**. Two Metro games merged into one machine: Exodus gives the electronics (oscilloscope CRT, burnt-orange flags, odometers, green lamps, torn banners), Last Light Redux gives the paper and the light (spiral notebook, glowing console display, label plates, bullet tab, ticker tape). Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec.

## Source DNA

1. **Burnt-orange flag with a slanted tail** (Exodus pause menu): the current item everywhere: rows, rail, tabs, menus.
2. **Oscilloscope CRT** (Exodus options): slate glass, graticule, scanlines, cream phosphor plate. Lands on the metadata pane, the Settings section list and the empty page.
3. **Glowing console display** (Last Light title menu): hot orange glass in a riveted steel housing. Lands on Play.
4. **Spiral field notebook** (Last Light options): coils, blue rule, worn paper, brown ink. Lands on the description and notes.
5. **Mechanical counters and lamps** (both consoles): odometer wheels, a green LED, stamped label plates. Land on the title band, scores, the running game and the default button.

## Game element map

| Source part | Playnite surface |
|-------------|------------------|
| Exodus orange flag, slanted left end, speckle | Selected details row, current rail item, selected tab, hovered menu item, toggled top-bar cell |
| Exodus pause panel with the right-edge line | The rail (1px grey line on its inner edge), context menus |
| Exodus CRT options (glass, graticule, scanlines, phosphor plate) | Metadata pane on the game page; Settings section list (`TreeView`) selection |
| Exodus waveform trace | Foot of the CRT metadata pane; the empty page's moving trace |
| Exodus torn "HINTS" banner | Section headings (description, notes, screenshots) and `GroupBox` headers |
| Exodus odometer | Title band signature; scores (`TextBlockGameScore`) as counter windows; empty page counter |
| Exodus green LED | Running game (`RunningIndicatorBrush`): a chain of tunnel lamps marching past |
| Exodus route map with handwriting | Empty page corner note "0 км" in Marck Script over faint rail lines |
| Last Light console display | `PlayButton` (the hero) |
| Last Light spiral notebook | Description and notes sheet |
| Last Light label plates | Default (`IsDefault`) button: an ivory stamped plate with two rivets |
| Last Light workbench tiles | More / Edit squares, cover hover buttons (`GridTileButton`) |
| Last Light bullet counter tab | Cover hover: a black tab with an orange bullet drops from the cover's top edge |
| Last Light ticker tape | Tooltips: a strip of paper tape with typed ink |
| Last Light key prompts (white key, orange action) | Input gestures in menus; filter mark is an orange lamp |

Names a player knows on sight: the orange flag, the oscilloscope, the notebook, the glowing display, the odometer.

## Moments

- **Hero: Play.** Rest: the display lit orange in its steel housing, white-hot letters. Hover: the glass surges with a three-step flicker, a bloom rises around the housing, a scan band runs down the glass. Press: the power dips (glass drops to deep red-brown), the letters flash white. Launching / running: the glass goes lamp green under a scrim, tunnel lamps march along its foot.
- **Secondary:** the flag slides in from the left on rows and rail (PowerEase, 200 ms); cover hover lights an orange frame and drops the bullet tab (BackEase, 200 ms) with the tile buttons dropping in after it (60 ms stagger); Settings rows light the phosphor plate with a short afterglow on leave; tabs take the flag; check boxes light like a lamp (two-frame flicker); the slider thumb is a lever plate whose fill is phosphor segments; GroupBox and section banners carry the torn orange strip.
- **Ambient (sparse areas only):** the empty page's waveform travels (`StrokeDashOffset`) and its green lamp blinks.

## Motion language

Fast 120 ms, base 200 ms, slow 400 ms. `PowerEase` (power 3) ease-out for movement; `DiscreteDoubleKeyFrame` flickers for lamps, display and phosphor. Entrance from the left. Stagger 60 ms.

## Brand

Name **Verst** (an old Russian mile; the map's "0 км"). The mark is a tunnel mouth: a ribbed arch over two rails meeting at a lamp, drawn from the Exodus loading screen's tunnel, not from any logo. It sits on the rail's main menu plate, in the title band and on the empty page; the add-on tile uses it. `GameBannerTintBrush` is `vs-panel`, the pause panel's dark.

## Kept calm

The library list, the cover grid background and metadata text: plain iron, plain text. Grain and map lines only at 4-8%. The CRT's scanlines are faint; the notebook has no texture beyond its foot shade.
