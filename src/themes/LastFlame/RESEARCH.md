# Last Flame: research and sources

Inspired by the interface of *Darkest Dungeon II* (Red Hook Studios). The game publishes no design tokens or style guide, so every value below was sampled from public captures. Unofficial; no game file is used or redistributed.

## Sources

| What | Where | Notes |
|------|-------|-------|
| Screens | Steam store screenshots for app 1940340, 20 images at 1920x1080 (`store.steampowered.com/api/appdetails?appids=1940340&filters=screenshots`) | Viewed and sampled in a browser canvas, not saved or shipped. Inn, map, combat, region, title cards. |
| Art direction | [Game Developer: road trip from hell](https://gamedeveloper.com/design/how-a-theme-of-a-road-trip-from-hell-would-shape-darkest-dungeon-ii), [PC Gamer interview](https://www.pcgamer.com/interview-darkest-dungeon-2s-new-3d-look-monsters-the-narrator-and-its-surprising-aspirational-spirit) | 2D-first environment art carried into 3D. |
| Title font | [Steam thread naming Dwarven Axe BB](https://steamcommunity.com/app/262060/discussions/0/612823460268981859) | A player's identification for the first game, not an official credit. Treat as unverified. |
| Icons | Hand-cut for this theme in `src/Media.xaml` | Nothing traced from the game. |
| Structure | Playnite Default theme 10.60 (MIT) | `info/LICENSE-Playnite.txt` |

## Measured colors

Sampled as 5-bit-per-channel histograms over the named regions, so values are accurate to about +-8 per channel.

| Region (screenshot) | Dominant colors | Token |
|---------------------|-----------------|-------|
| Inventory panel, map bars | `#000000` 62 to 86% | `lf-void` |
| Empty item slots, chevron tabs | `#080808`, `#101010`, `#181818`, `#202020` | `lf-ink`, `lf-soot`, `lf-char` (warmed slightly) |
| Currency row rule | `#382818`, `#302818` | `lf-iron` |
| Active filter icon | `#685028` to `#705830`, `#504020` | `lf-frame` |
| Banner star and frame | `#987038`, `#886030`, `#785828` | `lf-brass` |
| Hero name text | `#b09058`, `#b89860`, `#c0a060` | `lf-tan` |
| Health ribbon | `#c00008` to `#c00010`, `#e00008`, `#600000` | `lf-blood`, `lf-blood-hot`, `lf-blood-deep` |
| Altar room | `#100000` to `#380000` | `lf-oxblood`, `lf-wine` |
| Fire | `#f89058`, core `#f0f0d8`, reds `#981818` to `#b02020` | `lf-flame`, `lf-flame-core` |
| Map background | `#081828`, `#081020` | `lf-night` (reference only) |

`lf-bone`, `lf-dust`, `lf-grey`, `lf-on-tan` and `lf-verdigris` are chosen, not measured: the game's small body text is too thin at store-image resolution to sample, and these needed to clear contrast on black.

## Chrome and component rules (observed)

- Panels are pure black with no fill gradient. Depth comes from art behind them, not from raised surfaces.
- Frames are a double line in worn gold with visible breaks and chips, never a clean stroke (Day banner, region cards).
- The Day banner hangs from the top edge and ends in a point. It carries an emblem; Last Flame uses its own torch flame there.
- Names sit over a torn crimson ribbon.
- Camp bar tabs are chevrons pointing right; Play borrows the shape.
- Action buttons in combat are double-lined diamonds; so are the pips under title cards and the alert badge.
- A selected skill gets short gold L ticks at its corners. It has no fill.
- Idle icons are grey and turn gold when active.
- No rounded corners anywhere.

## Typography

The game uses a heavy gothic display face for names and titles. Windows has no equivalent and Playnite themes cannot ship fonts, so headings name `Dwarven Axe BB` first and fall back to Georgia Bold. Old English Text MT was rejected: it only ships with Office and is not on this machine.

## Motion

Not frame-measured: only stills were available, so timings are chosen, not sampled. The fade-and-flicker language comes from the torch and embers visible in the stills. Durations sit in the 120 to 350 ms range the repo asks for. Measure against a capture if the motion feels off.
