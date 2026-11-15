# Gumshoe — creative brief

Mode: **Showcase**. Source: the menus and HUD of Mouse: P.I. For Hire (see `RESEARCH.md`). Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec. Dark theme: the game has no light UI. Light surfaces exist only as paper objects on a dark desk.

## Source DNA (5 traits -> where each lands)

1. **Black-and-white film.** No hue at all: void, chalk, paper. Depth comes from paper against chalk against void, never from color. -> every surface token is neutral grey; the accent is paper white and ThemeModifier's accent picker recolors it. Two spot inks only, both outside the source's menus and used for state, never for chrome: *lamp* amber (running, warnings, data changed) and *stamp* red (destructive).
2. **Hand-lettered type with a hand-drawn underline.** Rounded, slightly wobbly capitals; every page title is underlined by one wobbly stroke. -> body and headings in Patrick Hand; the wobbly underline sprite under the game title, the Settings title band and `GroupBox` / `Expander` headings; Anton for poster stamps only (Play label, empty-page marquee, count badges).
3. **Paper craft.** Masking-tape labels with ragged ends, notched price tags, stickers, swallowtail ribbons, dog-eared pages, a hanging bookmark. -> metadata chips are price tags, cover names ride on tape, section headers are ribbons, the metadata pane is a dog-eared page, the current sidebar item is a hanging bookmark.
4. **Rubber-hose bounce.** Squash and stretch, everything overshoots and settles; drawn lines "boil" between two or three frames. -> one easing personality (`BackEase`, EaseOut, amplitude 0.4-0.6) for every pop; stepped 3-frame jitter on the brand mark and the launching glyph.
5. **Theatre and chalkboard.** The Roadhouse proscenium arch, drawn curtains, a stencil marquee; the upgrade modal is a flat chalkboard with flourish dividers. -> the Settings title band is a curtain valance with the mark, the empty game page is a small stage with a spotlight, popups and menus are chalkboard panels with a flourish rule between groups.

## Game element map (source part -> Playnite surface)

1. **Case-file book** (pause, settings) -> the metadata pane on both game pages: a paper page with a dog-eared corner, dashed ruled rows, ink text.
2. **Smudge selection plate** (selected settings row: bright paper with feathered ends, ink text) -> selected row in the details list, list view, `ListBox`, `ComboBox` item, `TreeView` (Settings section list).
3. **Hanging bookmark tabs** along the top of the book -> `SidebarItem` current state (paper bookmark with a swallowtail hanging in the rail cell) and `TabControl` headers (folder tabs).
4. **Option row** `◀ Rookie ▶` with pip dashes -> `ComboBox` (value, arrow plate), `Slider` (dashed track, tab thumb), `ProgressBar` (chunky pips).
5. **Pencil scroll bar** (2px line, ridged capsule handle) -> `ScrollBar` thumb.
6. **Price tag** (bevelled, notched end) -> `PropertyItemButton` chips and the play time / completion badges.
7. **`BUY-D` sticker** (black oval, cream inner outline) -> the Play button; the tilted `TRIAL!` stamp -> the running / launching label.
8. **Chalkboard modal with flourish dividers** -> `ContextMenu`, `Menu`, `ComboBox` drop-downs, popups and tooltips (flat `#2b2b2b`, rim `#4b4b4c`); menu separators are a flourish rule.
9. **Roadhouse proscenium** (arch, curtains, marquee, pill buttons) -> empty game page (both views) and the Settings title band signature.
10. **Weapon-wheel slot** (riveted porthole, tape label under it, the chosen slot ringed in soft white) -> grid covers: hover rings the cover, a tape strip with the name rides up; Play and Info are round porthole discs.
11. **HUD swallowtail ribbon** (`SECRET FOUND`, currency counters) -> `GroupBox` / `Expander` headers and the Settings section headings; the notification count badge.
12. **Button-prompt disc** (grey disc holding a letter) -> `CheckBox` and `RadioButton` marks; prompts in the preview footers.
13. **Collectible empty slots** (dim rounded blobs) -> the cover placeholder and the Steam screenshots skeleton.
14. **Compass strip** (ticks on a line) -> the top bar's closing rule and the slider's tick marks.

## Moments

- **Hero: Play.** Rest: the black `BUY-D` sticker, a cream 1.5px outline inset 3px, Anton label. Hover (200 ms): the sticker squashes (ScaleX 1.05, ScaleY 0.94) and springs to 1.03 with a `BackEase`; the plate inverts to lit paper with ink label and ink outline; three short "impact" ticks pop out of the top-right corner and fade. Press: its own layer: plate to mid paper, an ink splat swells under the sticker, ScaleY 0.92. Release rebounds.
- **Secondary:**
  1. Sidebar current item: the paper bookmark drops from above the cell and settles with overshoot (200 ms); hover nudges it 3px down.
  2. Settings tree selection: the paper smudge wipes in from the left (160 ms), the `▶` pip pops last.
  3. Cover hover: a soft white ring fades in around the cover, the tape name strip rides up from below with a bounce, the cover lifts 3%.
  4. Cover hover controls: the Play and Info porthole discs bounce in from below, staggered 50 ms.
  5. Folder tab: the selected tab rises 4px with overshoot, label to ink.
  6. Check box: the ink check strokes in with overshoot inside the prompt disc.
  7. Slider thumb: the paper tab tilts 6 degrees on hover and straightens on press.
- **Ambient (2, sparse areas only):** the empty-page spotlight sways with a 3-frame boil; the running game's film-sprocket holes march along its row, cover and Play button (slow while running, fast while launching).

## Motion language

Fast 120 ms, base 200 ms, slow 360 ms. Easing: `BackEase` EaseOut, amplitude 0.4-0.6, for every pop and entrance; `CubicEase` EaseOut for fades; exits `QuadraticEase` EaseIn, no overshoot. Entrances pop from below (the bookmark hangs from above). Stagger 50 ms. Boil: three discrete frames 160 ms apart, +/-1.2 degrees, on the brand mark only.

## Brand

Name **Gumshoe**. Mark: a thick-stroke magnifying lens with a keyhole inside and three whisker ticks on its left (`art/mark.svg`), reused as the main menu disc, the Settings title band, the empty-page stage and the tile. Never the game's logo or the three-circle mouse head. `GameBannerTintBrush` = `gs-chalk` (`#2b2b2b`), the chalkboard panel: the darkest branded surface that is not the void.

## Kept calm

Details and list rows, the cover grid and its background stay flat desk grey with no texture. Description text sits on plain desk. Grain runs only on the rail, top bar and title bands at 6% or less. No vignette on the library. Paper objects are used sparingly: one metadata page per game page, chips, labels, the current bookmark.
