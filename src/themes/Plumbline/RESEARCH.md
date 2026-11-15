# Plumbline — research & sources

## Sources

| What | Where |
|------|-------|
| Captures | interfaceingame.com, The Sims 4 page (https://interfaceingame.com/games/the-sims-4/): 1920x1080 PNGs at `https://interfaceingame.com/wp-content/uploads/the-sims-4/the-sims-4-<slug>.png` for `main-menu`, `start-screen`, `audio`, `graphics`, `buy-toys`, `happy`, `full-body`, `paint-mode`, `walk-style`, `new-question`, `select-a-place-to-live`, `friend-of-the-animals`, `credits`. The page lists 48 captures (Menu 16, Overlay 11, Character 10, In game 5, Settings 4, ...). The site's bot check blocks some fetchers; `curl` with a browser user agent works. Captures are not committed (third-party art); re-download to re-measure. |
| Tokens | None published. Measured from the captures, below. |
| Type | The game's face is proprietary (EA's Sims Sans, a Proxima Nova-like humanist sans; headings in small caps). Not bundled. |
| Icons | Hand-drawn for this theme (`art/icons-geometry.xaml`). The game's icons are chunky filled glyphs on discs; ours are 2.4px rounded strokes on a 24px grid. |
| Mark | Original plumb bob (`art/mark.svg`). The game's plumbob (a double-pointed green diamond) is EA's mark and is not drawn. |

## Measured values

Each is the most common value (4-level quantised) of a region, 1920x1080 coordinates.

| Token | Value | Capture, region |
|-------|-------|-----------------|
| `--pl-sky` | `#0098ec` | main-menu bottom field (0,614)-(1920,1080); start-screen background `#0098EC` for 1.26M px |
| `--pl-sky-hi` | `#29baf7` | main-menu lit facet (900,1030) |
| `--pl-sky-pale` | `#5ccaff` | main-menu brightest facet (1000,800); start-screen `#38D4FC` |
| `--pl-sky-mist` | `#9cecfc` | start-screen haze |
| `--pl-disc` | `#0054d0` | main-menu pack disc (14,668)-(72,716) |
| `--pl-white` | `#fcfcfc` | audio dialog body (600,600) |
| `--pl-paper` | `#f4f4f4`/`#f6f6f7` | buy-toys dialog (800,330), row (900,430); main-menu top `#F6F6F6` |
| `--pl-mist` | `#e4e8f4`..`#e8ecf8` | happy: mood panel (822,40)-(1098,72), needs panel row |
| `--pl-tab` | `#e0e5ee` | audio: idle tab (610,302) |
| `--pl-line` | `#d3dce8` | buy-toys: list header (870,332) |
| `--pl-foot` | `#e4e7ed` | audio: dialog footer (600,812) |
| `--pl-band` | `#a4b0c0` | audio: VOLUME / OTHER band (700,296)-(1380,312), 10500 px |
| `--pl-pill-hi` / `-lo` | `#f8f8f8` / `#e0e0e0` | audio: Apply Changes button face (1190,815)-(1380,840) |
| `--pl-ink` | `#0848a8` | audio: GAME OPTIONS title (868,243)-(1030,270); tab text `#0C4CAC` |
| `--pl-ink-label` | `#1c58b0` | happy: needs labels (1550,820)-(1730,834) |
| `--pl-ink-link` | `#2484e4` | audio: field labels (724,334)-(816,348) |
| `--pl-ink-off` | `#9c9c9c` | audio: disabled tab "Gameplay" (578,386)-(640,400) |
| `--pl-indigo` | `#1400b0` | main-menu logotype (1530,115)-(1890,255) |
| `--pl-green` / `-bright` / `-hi` | `#3cbc14` / `#65d136` / `#88e050` | audio: selected tab (530,318)-(686,346) |
| `--pl-green-deep` / `-dark` | `#209020` / `#0c7c0c` | happy: need bar (1590,848)-(1680,866), gradient across the bar |
| `--pl-green-tool` | `#28c038` | happy: toggled tool disc (1600,2)-(1650,46) |
| `--pl-green-play` | `#41a833` | main-menu Play triangle (1700,390) |
| `--pl-green-pale` | `#e7f5d9` | happy: mood panel fill |
| `--pl-orange` / `-hi` | `#f87400` / `#ffad01` | main-menu BUILD YOUR BUNDLE (1516,962)-(1844,1012) |
| `--pl-note` / `-foot` | `#2880c8` (darkened to `#2377bd`) / `#5c80bc` | happy: notification card body and footer |
| `--pl-red` | `#e85c5c` (darkened to `#d93636`) | main-menu -50% tag; notification close |

Derived values (marked in `tokens.css`): `--pl-ink-deep`, `--pl-ink-muted`, `--pl-green-ink`, `--pl-orange-ink`,
`--pl-orange-text`, `--pl-orange-mark`, `--pl-hover`, `--pl-band-hi`, `--pl-pill-rim`, the sky and disc shades. All
text pairs measured against WCAG: ink on white 8.4:1, ink on mist 7.0:1, ink-deep on bright green 6.5:1, ink-deep on the
band 5.9:1, muted on mist 4.9:1, orange ink on orange 6.4:1. The game prints white on light green (2.5:1), white on the
band (2.2:1) and white on orange (about 3:1); this theme prints deep ink on those three.

## Interface parts (stills)

- **Main menu**: white top half with the Play disc (about 220px, white, soft shadow, green triangle) at the right of the
  logo; the lower half is the blue field with translucent light triangles; round blue pack discs (58px, white glyph;
  the current one a white disc with a teal glyph); pack preview tiles with a 3px bright blue frame, a white corner badge
  with a play circle; `YOUR COLLECTION` tab (indigo plate, striped corners); an orange pill call to action.
- **Game Options dialog**: white rounded card, centered small-caps blue title, round blue X; a left list of tabs
  (centered bold blue labels on pale plates, the open one green gloss with white text, a disabled one grey); right
  page of grey-blue band headers (white small caps), labels right-aligned in blue, thin sliders with a white glossy
  thumb and a pale-blue ring, `100%` in blue, drop-shadowed combo boxes with a blue triangle, green rounded check boxes;
  a footer in `#E4E7ED` with three pale pill buttons.
- **Buy Toys dialog**: an avatar medallion overlapping the card's top-left corner, centered title, list header in
  `#D3DCE8` with sortable columns, rows with a thumbnail plate, `Simoleon` prices, spinner arrows in grey wells.
- **Live HUD**: top-right round tool discs (the active one green with a white glyph, others white glass), a sheet under
  them with a slider and 4 small buttons; needs panel (2x3 cells, label in blue, green pill bar with a round icon cap
  and a darker segment at the decayed end); notification card (blue, small-caps title, lighter footer with the Sim's
  portrait, red round X); mood panel (a green gloss "Happy" bar).

## Not measured

Motion. The captures are stills, so the curves in `BRIEF.md` (springy `BackEase`, 110/200/380ms) are chosen from
how the menus look and from general knowledge of the game's feel, not from frame-stepped video. If a screen recording
becomes available, check the Play hover and the tab press and adjust the durations in `HANDOFF.md`.
