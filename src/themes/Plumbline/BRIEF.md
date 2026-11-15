# Plumbline — creative brief

Mode: **Hybrid**. The Sims 4's menus are a clean system (white plates, blue ink, one green accent), so structure and
tokens stay faithful and the Showcase moments go on Play, the cover tiles, the running game, the empty page and the title
band. Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec.

## Source DNA

1. **Facet field** (light): the menu's saturated blue with big translucent triangles laid over it. Lands in the icon rail
   (`facets-rail.png`), the frame, the empty game page and the Settings backdrop, all as white masks.
2. **Glossy discs and capsules** (shape): white round buttons with a soft drop shadow, pale pill buttons lit from the top.
   Lands in the sidebar items, the top bar cells, Play, More and Edit, buttons, the slider thumb.
3. **Green means on** (color): one gloss green (`#88e050` to `#3cbc14`) for the open tab, check boxes, need bars, the
   toggled tool. Lands in list selection, Settings tree selection, `CheckBox`, `RadioButton`, `ProgressBar`, toggled top
   bar cells, the Play triangle.
4. **Blue ink on white, grey-blue bands** (type): every label, title and tab is blue (`#0848a8`), section titles sit on a
   grey-blue band (VOLUME, OTHER). Lands in all text, `Expander` and group headers, the description card, the dialog title.
5. **Springy motion** (motion): pops land with a small overshoot (`BackEase`), plates and discs lift and settle. Lands in
   Play, cover hover, cover buttons, sidebar discs, tree plates.

## Game element map

| Sims 4 part | Playnite surface |
|-------------|------------------|
| Round pack discs on the blue field (the current one white) | Sidebar items: 32px `--pl-disc` discs, the current one a white disc with a blue glyph and a sky ring |
| The big white Play disc with a green triangle (`Your Collection` screen) | **Play button** (hero): white capsule with the 56px disc overhanging its left end |
| Game Options tab list: centered labels, green gloss for the open tab | Settings `TreeView`: 28px plates, centered, green gloss selection; children inset |
| Section band (VOLUME, OTHER) | `Expander`, group and description headers (grey-blue band, deep ink) |
| Needs panel bar (green pill, round icon cap, darker decay end) | `ProgressBar`; community and critic scores as bars; launch sweep |
| Plumbob over the active Sim | Running game: an orange lozenge (the theme's plumb-bob mark) bobs over the row, cover and Play. Also the filter mark and the empty page |
| Pack preview tile (bright blue frame, white badge with a play circle at the corner) | Cover hover: sky frame and a white corner badge; selected = green frame |
| Round pack-tile Play and info buttons | `GridTileButton`: white discs with a green triangle and an `i`, popping in with a stagger |
| Top-right tool cluster (round discs, the active one green) | Top bar: white round cells, toggled = green gloss, filter mark = orange lozenge |
| Option sliders: thin track, white glossy thumb in a pale ring | `Slider` (`SliderThumb`, `SliderRangeButton`) |
| Option check boxes (green rounded square) | `CheckBox`; `RadioButton` = ring with a green dot |
| Notification card (blue, small-caps title, lighter footer, red round X) | `NotificationMessage` |
| Dialog: white card, centered blue title, medallion avatar on the corner, round blue X | `StandardWindowStyle`: 48px band, the gem medallion, round close |

Three a player names on sight: the Play disc, the green gloss tab list, the needs bar.

## Moments

- **Hero, Play hover and press**: rest = white capsule with a shadow, disc with a green triangle. Hover = capsule lifts 2px
  (`BackEase`), a lit sky ring (`bloom.png` through an `OpacityMask`) fades in around the disc, a sheen (`sheen.png`)
  crosses the capsule, the triangle brightens. Press = the capsule sinks 2px, the ring contracts, the plate takes
  `PrimaryButtonPressedBackgroundBrush`.
- **Secondary** (5+): cover hover frame and corner badge; cover buttons popping in; sidebar disc swelling to white; tree
  plate sliding in; tab indicator; check box tick popping; slider thumb ring; band header lighten on hover.
- **Ambient** (sparse areas only): the running lozenge bobs 3px over 2.4s; the empty page's lozenge turns slowly (only
  while visible).

## Motion language

Fast 110ms, base 200ms, slow 380ms. One easing personality: `BackEase` (EaseOut, Amplitude 0.35) for everything that
lands, `CubicEase` EaseOut for fades. Entrance: pop up (scale 0.85 to 1 with fade). Stagger 60ms.

## Brand

Name **Plumbline** (a plumb line hangs from a plumb bob: the name only echoes the source). Mark: a plumb bob, a
faceted weight on a cord (`art/mark.svg`, `art/mark-path.txt`), original, not EA's mark. It is the medallion in the
Settings title band, the running and filter marks, the empty page and the tile. Green set for the brand, orange set for
running. `GameBannerTintBrush` = `--pl-paper` (a light theme fades its banner toward the page, never toward black).
Unofficial fan theme: notice in `info/NOTICE-Plumbline.txt`.

## Kept calm

Game list rows, the cover grid well, metadata text and the description stay plain white and pale blue-grey. The facets
appear only on the rail, the frame, the empty page and the Settings backdrop; never behind lists or covers.
