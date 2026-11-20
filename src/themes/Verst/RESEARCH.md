# Verst — research & sources

Verst merges the menus of two games from one series: **Metro Exodus** (4A Games, 2019) and **Metro: Last Light Redux** (4A Games, 2014). Neither publishes tokens, so every value below was sampled from public interface captures with a canvas in the browser (nothing downloaded or shipped). Unofficial fan theme: no logo, art, icon or font from either game.

## Sources

| What | Where |
|------|-------|
| Metro Exodus captures (22) | Game UI Database, game id 218: main menu console, CRT options (sound, game options, controller, video, accessibility, audio, subtitles, layout), pause menu, difficulty, load/save, loading screen hints, autosave notice, diaries (codex), HUD |
| Last Light Redux captures (35) | Game UI Database, game id 2308: title screen, handcar console menu, clipboard difficulty, spiral notebook options (game, controls, video, audio, gamma), journal notes, weapon workbench (optics, barrel, misc), trader, credits, HUD |
| Tokens | Sampled (below), stored in `src/tokens.css` as `vs-*` |
| Icons | Hand-drawn strokes in `src/Media.xaml` (no icon pack) |
| Fonts | Barlow Condensed (Bold), Barlow Semi Condensed (Regular, SemiBold), Marck Script (Regular): OFL, bundled. They stand in for the games' condensed grotesque and the handwritten map notes. |

Captures are 1920x1080 JPEGs. Coordinates below are in an 800px-wide view of each capture (x 2.4 for source pixels).

## The interface parts

### Metro Exodus

| Part | What it looks like | Sample |
|------|--------------------|--------|
| **Oscilloscope options** | The settings live on a CRT in a battered military case: slate glass with a dark graticule grid, faint scanlines and a curved bezel, a stencil label plate ("СО-1-98 МЕН МЗ"), a toggle, a green LED, knobs and jack sockets down the left side | glass `#3c4248` / `#3b444c`, grid `#5f6771`, case `#24262a` |
| **Phosphor selection** | The current row is a flat cream phosphor plate; its text turns dark; other rows are cream text on the glass | plate `#9a9c86` in the JPEG, seen brighter on a CRT (`#cfcba6` tuned) |
| **Waveform** | An amber zigzag trace runs along the bottom of the screen, beside a `◉ BACK` prompt | `#8c7d60`, tuned `#d0a85c` |
| **Pause / options flag** | A near-black panel with a thin grey line down its right edge. The current row is a burnt-orange bar that sticks out past the panel's left edge, the left end cut on a slant, speckled with a lighter grunge | bar `#bc5918` / `#b0551b`, speckle `#da7b41`, panel `#222222` to `#060606`, edge `#474747`, idle text `#8b8b8b` |
| **List arrows** | White triangles `◀ HOLD ▶` either side of a value; a triangle points down at the list's foot | white |
| **Hints banner** | The loading screen labels its tip with an orange torn banner: a strip with a slanted right end, distressed edges and the word in white bold caps | `#bc5918` |
| **Odometer** | The autosave and loading screens count with mechanical counter wheels: white digit windows with black bold digits in a black frame (`000009`) | white, black |
| **Route map** | The loading screen is a rail map drawn in thin lines, with a handwritten "МОСКВА 0 км 22.02.20" and a star | white lines, 30% |
| **Console menu** | The main menu is the locomotive cab: modules with stamped ivory label plates (NEW GAME, CHAPTERS, CONTINUE, LOAD, OPTIONS), green and amber indicator lamps, a small CRT showing the current choice, an odometer, yellow painted levers | plates `#93908b`-ish ivory |
| **Diary page** | Codex entries are an aged parchment page with dated entries in dark ink; the list beside it is black with right-aligned orange flags, an orange group header (MOSCOW) and dim "- not collected -" rows | page `#e5cda6`, `#ceb892`; header `#bf6530`; prompt `#c73c15` |
| **Green lamp** | The CRT case's LED, the only green in the menus | `#bfd998` core |

### Metro: Last Light Redux

| Part | What it looks like | Sample |
|------|--------------------|--------|
| **Spiral notebook** | Options are a ring-bound notebook page: chrome coils across the top, a faint blue rule under them, pale worn paper | paper `#e6ded1`, `#e3d8c5`, shade `#d4c6b1` |
| **Notebook selection** | The current row is a brown bar with white bold caps; other rows brown ink; checkboxes are brown squares with an amber tick; values sit between `◀ ▶` triangles | bar `#7c5a47` / `#805d49`, tick `#ce9d10`, ink `#8d7a66` |
| **Console display** | The title menu's current choice glows on a gas-discharge display behind glass: hot orange panel with brighter orange letters, in a riveted steel housing on a handcar | glass `#fa6e1c` / `#ff6d08`, letters `#ff9404` / `#ffa65b` |
| **Label plates** | Stamped plates under the console's switches: NEW GAME, CHAPTERS, CONTINUE, OPTIONS | `#93908b` plate, `#2e2d29` text |
| **Ticker tape** | A hint runs along a strip of paper tape under the console ("Military grade ammo is more effective than regular...") | `#a69784` |
| **Key prompts** | `Esc QUIT GAME` on a black plate: the key white, the action orange | key white, action `#ff8e00` / `#ff6900` |
| **Workbench** | Weapon parts are black tiles with white silhouettes on a rusty bench; a black header strip carries the slot in white caps and the part in red-orange; the military-grade bullet counter hangs from the top edge as a black tab with an orange outlined bullet and a number | header `#000000`, part `#c93b00`, bullet `#ff9200` |
| **Chalk price card** | A slate card in a worn frame with a big condensed number and a bullet glyph | slate `#242529` |
| **Credits** | Black page, roles in orange, names in white, condensed | |

## Palette (sampled, tuned for a Playnite window)

| Token | Value | Source |
|-------|-------|--------|
| `vs-void` | `#080808` | Exodus pause panel foot `#060606` |
| `vs-iron` | `#131211` | tuned between the panel foot and the bench shadows; the window |
| `vs-panel` | `#1c1b1a` | Exodus pause panel top `#222222`, tuned |
| `vs-plate` / `-lit` / `-hi` | `#262523` / `#32302d` / `#3f3c38` | derived steps for plates, hover, pressed |
| `vs-rim` / `-lit` | `#474747` / `#6e6b66` | pause panel edge line; lit step |
| `vs-chalk` | `#dcd9d2` | codex white text `#ddd9d7` |
| `vs-smoke` | `#8b8b8b` | pause menu idle rows (5.5:1 on the iron) |
| `vs-flag` | `#a84d15` | the burnt-orange bar `#bc5918`, darkened so chalk text holds 5:1 |
| `vs-flag-hi` / `-deep` | `#da7b41` / `#6e300b` | speckle; pressed |
| `vs-ember` | `#ff8e00` | Last Light prompt orange (8:1 on the iron) |
| `vs-display` / `-deep` / `-glow` / `-hot` | `#f26a12` / `#7a2c06` / `#ffa65b` / `#fff1dc` | the console display glass, its unlit edge, the letters, a white-hot flash |
| `vs-rust` | `#e0482c` | Last Light part name `#c93b00`, pushed redder for danger and 4.5:1 |
| `vs-amber` | `#f8bb13` | Last Light cursor and tick |
| `vs-lamp` | `#8ed14f` | Exodus green LED: the running game only |
| `vs-crt` / `-deep` / `-grid` | `#2c3338` / `#1a1f23` / `#46505a` | CRT glass `#3c4248`, darkened so phosphor reads; graticule |
| `vs-phosphor` / `-dim` | `#cfcba6` / `#a6a891` | the selection plate seen on the glass; JPEG value `#9a9c86` lifted to 5.5:1 for labels |
| `vs-wave` | `#d0a85c` | the waveform trace |
| `vs-paper` / `-shade` / `-edge` | `#e6ded1` / `#d4c6b1` / `#a0917d` | notebook paper and its worn foot |
| `vs-ink` / `-dim` | `#3a2e25` / `#6b5848` | tuned from the notebook ink `#8d7a66` (too light for body text): 9.9:1 and 5:1 on paper |
| `vs-binder` | `#7c5a47` | notebook selection bar |
| `vs-rule-blue` | `#9db3bb` | the notebook's blue rule |

## Typography

Both games use a condensed grotesque in bold caps for menu rows and headers and a regular condensed face for body text. Barlow Condensed Bold stands in for the caps (rows, headings, the Play label); Barlow Semi Condensed Regular and SemiBold for body text, where the full condensed width would tire the eye. Exodus annotates its map by hand; Marck Script (OFL, Latin and Cyrillic) draws those notes on the empty page.

## Motion (inferred from stills)

The captures are stills. Inferred: menus snap like hardware (the flag moves to the new row, lamps blink on), lit parts flicker as they power up, the CRT selection is instant with a short phosphor afterglow. This theme uses fast 120 ms, base 200 ms, slow 400 ms, `PowerEase` (power 3) ease-out for anything that moves, `DiscreteDoubleKeyFrame` flickers for anything electric, entrances from the left (the flag's side), 60 ms stagger.
