# Inkbolt — creative brief

Mode: **Showcase**. Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec.

- **Source DNA (5 traits -> where each lands):**
  1. *Ink-wash grayscale city.* Charcoal plates on an ash-grey wash with ink splatter and grain -> page, rail and title band carry a calm generated
     grain; lists and cover grid stay flat charcoal.
  2. *White cursor slab with an arrowhead notch and black text.* -> every selection: details rows, tree rows, rail item, tabs, list/combo
     items, Play pressed. Unselected rows are translucent charcoal plates; disabled rows are ghosted.
  3. *Cobalt baroque ribbon.* Diagonal damask band in the corners -> Settings title band, empty game page, banner corner, grid empty tile.
     White-mask sprite coloured by `HighlightGlyphBrush`.
  4. *Karma pair, blue vs red tiles* (and the blue-progress / red-remainder loading bar) -> check boxes and radios are square karma tiles;
     `ProgressBar` is the loading bar; negative = red tile, positive = blue.
  5. *Lightning health line + segmented orb ring.* A jagged zig-zag of electric blue -> top-bar rule trace, Play hover arcs, filter mark,
     empty-page idle flicker, the brand mark (broken ring around a bolt).
- **Game element map (source part -> Playnite surface):**
  1. Menu cursor slab with arrow notch -> `DetailsViewItemStyle` selected row, `TreeViewItem` selection (settings), `ListBoxItem`, rail item.
  2. Grey section tab `POWER LEVEL 1` -> `Expander`/`GroupBox` headers, `TabControl` selected tab, list group headers.
  3. Detail header band `1403 | AVAILABLE XP` -> the metadata pane's progress band (play time and completion on a grey band).
  4. Karma tiles + padlock -> `CheckBox` / `RadioButton`, disabled rows (ghosted), chips (`PropertyItemButton`).
  5. HUD lightning health line + ring/orb -> `ProgressBar`, `SidebarItem` main menu orb, Play pressed ring.
  6. Loading screen (black, tip text, two-tone bar) -> empty game page (both views).
  7. Option row `< NORMAL >` -> `ComboBox` (value between chevrons), `Slider` (thin line, white block thumb).
  8. Mission toast (white title, grey sub-line) -> game page title and sub-line over the banner.
  9. Torn-photo frame (documents and intel) -> cover hover frame and screenshot thumbnails.
  10. Map `LEGEND:` panel -> filter panel / explorer panel (charcoal translucent card, caps heading).
  11. Left button-tile column -> sidebar rail (tiles, current one a white tile with a notch into the list).
  12. Button prompts (`Navigate / Select / Back`) -> the footer note in previews, Settings bottom bar.
- **Hero moment:** Play. Rest: cobalt slab with a right-pointing notch and black caps. Hover (180 ms): the plate lights to the lit bolt blue
  and three white-blue arcs crawl along its top and bottom edges, flickering in 4 discrete steps; the notch brightens. Press: the slab
  flashes white (the cursor), the arcs jump to a burst, then settle. Own layers for hover and pressed.
- **Secondary moments (5+):** sidebar current item (white tile slides in from the left with the notch popping out, 160 ms BackEase),
  tree selection (white slab wipes in left to right, notch last), cover hover (ink-torn frame fades in, white rim, a spark sweeps the
  top edge), cover hover buttons (white key-cap tiles stagger in from the left, 50 ms apart), tab (grey band lifts and the caps go black),
  check box (blue tile fills with a flash, check strokes in), slider thumb (white block, bolt halo on hover).
- **Ambient loops (sparse):** empty game page: the two-tone loading bar fills and a faint bolt flickers over it; Settings title band:
  one slow ribbon highlight sweep. Nothing animates in lists or grids.
- **Motion:** fast 100 ms, base 180 ms, slow 380 ms. Personality: punchy, `BackEase` EaseOut amplitude 0.25 for slab and notch entrances;
  lightning uses `DiscreteDoubleKeyFrame` 4-step flicker (comic cut feel). One entrance direction: from the left (as the game's menu
  list), 50 ms stagger.
- **Brand:** name **Inkbolt**; mark = a broken three-segment ring (orange, blue, dim) around a zig-zag bolt, reused in the rail's main-menu button,
  Settings title band, empty page and tile. `GameBannerTintBrush` = ink navy `#10141F`, the cobalt ribbon's shadow, the darkest branded
  surface (not black). Unofficial: no logo, no art, `info/NOTICE-Inkbolt.txt`.
- **Kept calm:** the details list shares the rail's ink black and faint grain with bare rows (no per-row plates); the cover grid sits on flat asphalt; metadata text on a flat plate; elsewhere the grain exists only on the title band and empty page.
