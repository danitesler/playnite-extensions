# Henchwork — creative brief

Mode: **Showcase**. Source: *Evil Genius 2: World Domination* (Rebellion, 2021). Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec.

## Candidate lenses

Last five finished themes: Subspace (black LCARS elbows), Dewfield (light Stardew parchment ledger), Counterfoil (Disco Elysium film strip), Testbed (light Portal cleanroom), Rushdown (Street Fighter 6 neon glass). Swallowtail (Monkey Island stage) is in progress.

- **(a) Diegetic / Artifact — ring-bound villain dossier (dropped as the shell).** A cream paper shell repeats Dewfield's light parchment and hides the game's best trait, the colour-coded console. The dossier stays as one surface: the metadata card.
- **(b) HUD / Telemetry — lair management console (chosen).** Blueprint-navy war room, slate console panels, mustard pictogram tiles, colour-coded tab plates, odometer counters and red alert badges. Nothing in the last five uses flat '60s colour-coded plates on slate; it is the part of the UI players see for hundreds of hours.
- **(c) Title / Pause Menu — world-map title screen (dropped as the shell).** The painted map would fight cover art behind a library. Its blueprint grid survives as a faint backdrop, and its square pictogram tiles become the sidebar.

## Source DNA

1. **Flat colour-coded plates** (mustard, green, orange, purple, steel) with cream pictograms → sidebar tiles, Play plate, tabs, close plate, menu marks.
2. **Skewed mustard tape labels** (“SELECT GENIUS”, “EVENT LOG”) → settings title band, metadata group heads, game-page section heads, empty state.
3. **Odometer counters** (dim slate leading zeros, lime digits on a dark pill) → `TextBlockGameScore`, the playtime/progress readout.
4. **Ring-bound dossier with purple header strips and orange diamond bullets** → Details metadata card.
5. **Printed, hand-made finish** (worn print, inked outlines, pencil shading, torn tape) → grunge on plates, sketch frames, hatched shadows, torn tape labels.
6. **Pop-and-hold tile selection** (picked tile grows, lightens and sits on a hard ink offset) → covers, sidebar, tree, tabs.

## Game element map

| Source part | Playnite surface | Recognised on sight |
|-------------|------------------|---------------------|
| Title-menu mustard pictogram tiles | Sidebar items (36×36 tiles, cream glyph; selected tile turns cream with ink glyph) | ✔ |
| Skewed “SELECT DIFFICULTY” tape | Settings title band label, metadata group heads, `Description` / `Screenshots` heads | ✔ |
| Resource odometer (`0,000,033,990`) | Score plaque (`087` with dim zeros), progress readout | ✔ |
| Red “9+” notification badge | Filter-active mark (8px red disc on the filter toggle), update badge | ✔ |
| Colour-coded tab plates (Overview / Money / Minions / Global / Rogues) | `TabControl` tabs and the menu board's top colour strip | |
| Ring-bound difficulty dossier | Details metadata card: cream page, spiral rings, purple header strips | ✔ |
| Event-log diamond bullets | Details row selection mark, menu group break, tree selection | |
| Green START / NEXT bar + New Game tile | Play button: green slab with a cream pictogram tile cap | |
| Orange Quit tile with exit pictogram | 28×28 side-panel close plate, Exit row, danger buttons | |
| Loading poster: tilted card with concentric rings | Empty game page; launching ring sweep on the running indicator | ✔ |
| Floor selector `B 1 2 3 4` squares | Top-bar view switches (icon-only squares) | |
| Options scrollbar (mustard arrow triangles, olive thumb) | `ScrollViewer` | |
| Objective TV-monitor plates | Grid cover Info button glyph and the `IconInfo` pictogram | |

## Signature levers

| Lever | Henchwork choice |
|-------|------------------|
| Hero banner transition | Hard blueprint edge: the banner darkens into a 4px ink rule with a mustard tape (vault-eye) pinned across it. |
| Play button | Green slab, ink caps, a cream 32×32 pictogram tile on its left edge holding the play triangle, sitting on a 3px hard ink offset plate. |
| Metadata container & group break | Ring-bound dossier card: cream paper, spiral ring loops down the left edge, purple header strips with cream caps between groups. |
| Chip & score silhouette | Chips are flat steel plates with ink text (tab plates); score is an odometer pill with dim zeros and lime digits. |
| Row & cover selection mark | Row: mustard diamond bullet slides in on the left plus a slate-hi wash. Cover: tile pop (scale 1.04, BackEase) onto a 4px hard ink offset with a mustard frame; selected frame turns cream. |
| 28×28 close plate | Orange Quit tile with a cream exit-arrow pictogram and a 2px ink offset. |

## Popup menu levers

Panel: 30px rows on a slate console board, 2px ink edge, 3px hard ink offset, 4px top strip in the five tab colours. Highlight: mustard plate grows from the left (ScaleX, 110ms BackEase) and the icon sits on a cream pictogram square. Group break: dotted slate rule led by a small mustard diamond in the icon column. Icon hover: glyph turns ink on the cream square. Shortcuts: steel keycap plates (`F7` style) with ink text. Submenu mark: mustard ▸ triangle. Marked rows: Exit label in text-safe orange with its icon on an orange square, filling orange with ink text on highlight; checked rows carry a mustard diamond.

## Moments

- **Hero (Play hover + press):** the slab lifts 2px off its ink plate, brightens to `--hw-green-hi`, the cream pictogram tile pops to 1.12 with BackEase overshoot and the triangle slides 3px right. Press drops the slab onto its plate (offset 0) in 90ms.
- **Secondary:** details row diamond slides in (base); cover tile pop + offset grows (base); grid Play/Info 48×48 tiles pop (fast); sidebar tile pop and cream flip (fast); settings tree diamond + 2px mustard bar (base); tab plate rise (fast); checkbox tick stamps in with a scale overshoot (fast); slider thumb is a mustard tile that grows on drag.
- **Running:** purple scheme plate; launching = a lilac hatch sweep with the ring mark pulsing; running = slow ring pulse (3.2s).
- **Ambient:** none. The blueprint grid is static.

## Motion

Fast 110ms, base 180ms, slow 340ms. One personality: `BackEase` (Amplitude 0.4) on pops, `CubicEase` EaseOut on washes. Entrances slide in from the left (tape labels, menu highlight). Stagger 50ms.

## Brand

- Name: **Henchwork** (the minions' trade). Original; no game title or logo.
- Mark: a vault-eye — a ring around a keyhole disc, set on a mustard square tile with a hard ink offset. Drawn from the loading-poster rings and the pictogram tiles, not from the wordmark. Used in the settings title band, the empty game page and `art/mark.svg`.
- `GameBannerTintBrush`: `--hw-banner-tint` (blueprint navy).

## Kept calm

Row and cover backgrounds stay flat; the library layer carries only faint map contours and worn paint at low contrast, and description text is plain cream on navy. The sketch layer (grunge, pencil hatching, inked outlines, torn tape, stamp, marker) lives on chrome, plates and the dossier, never over cover art or body text.
