# Gilded Rift — creative brief

Mode: **Showcase**. Source: the League of Legends client and Wild Rift (see `RESEARCH.md`). Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec. Dark only: the client has no light UI.

## Source DNA (5 traits -> where each lands)

1. **Gold bevel on blue-black.** Every panel is a navy slab closed by a thin gold line that is lit at the top-left and shadowed at the bottom-right. -> `FrameBrush` ladder (`gr-gold-lit` to `gr-gold-dim` to `gr-gold-dark`) on the metadata pane, cards, tooltips, popups, the Play plate, input rims; two-line frames (outer dim, inner hairline) for the big surfaces.
2. **Angled, notched silhouettes.** Plates are cut at the corners, never rounded; wings sweep out of the Play plate and the title banners; small diamonds sit on rules. -> `ChamferTemplate` plates for Play, chips and the title band; diamond ornaments on rules, the filter mark and tree selection; `ControlCornerRadius` stays 2px for ordinary controls.
3. **Hextech light.** The one cool colour: a cyan crystal glow that means something is live. -> `gr-hex` appears only for a running or launching game, progress fills, links and the empty-page crystal; everything else is gold.
4. **Caps serif over a humanist sans.** Beaufort-style caps with tracking for titles, a clean sans for everything you read. -> Cinzel for the game title, tab and section headings, button labels in caps at 12px with 1px tracking; Segoe UI for body, lists and metadata.
5. **Cinematic motion.** Fades and glow swells, shine sweeps across plates, light rays behind victory banners; nothing bounces. -> `CubicEase` EaseOut fades, a diagonal shine sweep on hover plates, a slow crystal pulse on the empty page.

## Game element map (source part -> Playnite surface)

1. **PLAY button** (dark plate, gold frame, angled corners) -> `PlayButton`: the hero.
2. **Top navigation tab** (cream text, gold notch, soft underline) -> `SidebarItem` current state (notch on the rail edge) and toggled toolbar cells (gold underline, cream glyph).
3. **Champion-select roster** (gold bar on the selected row) -> `DetailsViewItemStyle` and `ListView` rows, `ListBox` items.
4. **Champion grid tile** (gold ring and corner marks on hover) -> `GridViewItemStyle` cover hover and selected state.
5. **LOCK IN / ACCEPT** (angled plate, gold frame, teal-lit inner edge) -> `Button`, `ToggleButton`: gold frame at rest, pale gold when hovered.
6. **Match Found ring** (cyan arc sweeping a gold ring) -> launching sweep and running idle on rows, covers and the Play cell.
7. **Ability tooltip** (dark panel, gold title, thin border) -> `ToolTip`, `ContextMenu`, `ComboBox` drop-down.
8. **Item shop tabs** (caps, gold underline) -> `TabControl` headers.
9. **Social group header** (small triangle plus count) -> `Expander` and `GroupBox` headers.
10. **Profile pennant banner** (long gold-edged flag with a crest) -> the title plate on both game pages.
11. **Victory banner** (bevelled plate, swept wings, rays) -> empty game page and the Settings title band flourish.
12. **XP bar** (thin fill in a dark track) -> `ProgressBar` (teal fill, gold-dark track rim).
13. **Level badge** (small teal disc with a number) -> the notification count badge.

## Moments

- **Hero: Play.** Rest: a void plate with a notched gold bevel frame (outer `gr-gold`, inner hairline `gr-gold-dark`), two short wings flaring off the left and right edges, cream caps label. Hover (200 ms in, 320 ms out): the inside edge fills with a pale-gold bloom rising from the bottom, the frame brightens to `gr-gold-lit`, and a diagonal shine band sweeps left to right once. Press (own layer): the bloom drops to `gr-gold-dim`, the plate sinks 1px, the label dims to `gr-gold`.
- **Secondary:**
  1. Sidebar current item: a gold notch slides in on the rail edge (160 ms) with a soft gold wash fading to the right; hover lifts a slate plate.
  2. Settings tree selection: a 2px gold bar grows from the row's vertical centre and a bronze wash fades in behind it (160 ms); a gold diamond pip on the right.
  3. Cover hover: a 1px gold ring and four corner marks fade in and tighten 3px inward; the name plate brightens.
  4. Cover hover controls: Play and Info are 34px navy discs in a gold rim that rise 6px and fade in, staggered 60 ms.
  5. Tab: the gold underline wipes in from the centre (180 ms), label to cream.
  6. Check box: a gold-rimmed square with a clipped corner; the teal-free gold tick draws in (140 ms).
  7. Slider thumb: a gold diamond that scales to 1.15 on hover; the filled range is gold.
- **Ambient (2, sparse areas only):** the empty-page crystal breathes (glow 0.7 to 1, 4 s) with two counter-rotating dashed rings; the running game's teal ring idles on its row, cover and Play cell.

## Motion language

Fast 120 ms, base 200 ms, slow 360 ms. Easing: `CubicEase` EaseOut for every entrance and fade, `CubicEase` EaseIn for exits, no overshoot. Entrance direction: up (6 px) with a fade; the shine sweep travels left to right. Stagger 60 ms. Launching is a 1.6 s sweep of a teal band with a 0.2 s rest; running idles on a 3.2 s breathing cycle.

## Brand

Name **Gilded Rift** (gold plus the rift every match is fought across; never an official name). Mark: a **winged gem**: a diamond centre stone with two swept wings and a small base chevron (`art/mark.svg`), not Riot's logo or the hextech cube. Reused as the main menu crest, the Settings title band, the empty-page crystal and the tile. `GameBannerTintBrush` = `gr-navy` (`#0A1428`): the darkest branded surface that is not the blue-black void.

## Kept calm

Lists, the cover grid and its background stay flat blue-black with no texture or ornament except the selected row's bar. Description text sits on the plain page. Gold rules are 1px and used once per surface. The hextech teal never appears as decoration.
