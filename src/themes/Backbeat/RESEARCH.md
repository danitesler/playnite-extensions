# Backbeat - research and sources

Backbeat is an unofficial theme inspired by the comic-book, cel-shaded look of *Hi-Fi RUSH* (Tango Gameworks, 2023). The look is the brief; no game file, character, logo or font is used.

## Sources

| What | Where | Used for |
|------|-------|----------|
| Store page and screenshots | [Steam app 1817230](https://store.steampowered.com/app/1817230/HiFi_RUSH/), viewed 2026-11-08 | Color sampling, HUD observations, developer and publisher names |
| Toon renderer overview | [80 Level, on the GDC 2024 talk](https://80.lv/articles/the-making-of-hi-fi-rush-s-3d-toon-rendering-style) | The whole world, characters and environments, is toon shaded to read as 2D |
| Style breakdown (student blog) | [Ulster University](https://blogs.ulster.ac.uk/b00873164-bdes-animation/?p=820) | Flat color, two-tone shading, Ben-Day dots, action lines, saturated palette, panel-like action shots |
| Influences and art lead | [Vice](https://vice.com/en/article/88qyw5/how-a-designer-known-for-horror-made-the-musical-gaming-triumph-hi-fi-rush), [Xbox Wire oral history](https://news.xbox.com/en-us/2023/10/04/hi-fi-rush-exclusive-oral-history/) | Context only |
| Beat-synced animation | [GDC: Developing Hi-Fi RUSH Backwards](https://gdcvault.com/play/1034256/Developing-Hi-Fi-RUSH-Backwards) (listing only; the session is members-only) | The principle that motion lands on the beat |

## Color sampling

Method: each screenshot was drawn to a canvas in the browser at 240x135 or 320x180, then pixels were binned to 4 bits per channel. The saturated pass kept pixels with max channel at least 150 and saturation at least 0.55. Values are bin centers, so they are accurate to about ±8 per channel. Screenshots were measured in place and not saved.

| Token | Value | Measured | Where it was seen |
|-------|-------|----------|-------------------|
| `bb-ink`, `bb-night` | `#120821`, `#1b0d31` | `#180828`, `#180818`, `#080808` | Darkest factory purples, HUD plates |
| `bb-plum`, `bb-panel` | `#2b1648`, `#3a2060` | `#280838`, `#281848`, `#482858` | Factory walls and floor shadow |
| `bb-panel-hi` | `#52307f` | `#582868`, `#5838a8` | Lit purple surfaces |
| `bb-lilac` | `#c7a6e6` | `#b888c8`, `#b888d8` | Lit floor; lightened for text contrast |
| `bb-paper` | `#fbf8ff` | `#f8f8f8` (8.1% of one frame) | HUD outlines, impact arcs |
| `bb-orange` | `#f87808` | `#f87808` | Rank badge, impact flash |
| `bb-yellow` | `#f8d828` | `#f8d828` | Impact, lightning on the HUD |
| `bb-cyan`, `bb-cyan-deep` | `#28d8e8`, `#18a8b8` | `#28d8e8`, `#18a8b8` | Key art background |
| `bb-blue` | `#0868e8` | `#0868e8` | City sky |
| `bb-red` | `#e84848` | `#e84848` | Level art |

Chosen by eye, not measured: `bb-lilac-dim`, `bb-orange-hot`, `bb-blue-deep`, `bb-green`.

## Observed in the screenshots

- The HUD is angular: shard-shaped plates, black with white edges, and a rank letter on an orange burst with radial spikes.
- Impacts use hard white arcs, yellow-orange flashes and jagged star shapes, with dots in the flash.
- Speech appears as small hand-drawn balloons in the world.
- Shading is hard-edged and flat. Soft glows are rare outside of impacts.

## What the sources do not say

- No source confirms heavy black outlines or a specific halftone system across the game. The one written source describes the shading as having no outlines. **Thick outlines, angled cards, halftone textures, sticker indicators and illustrated controls come from the theme's brief**, then expressed in the game's palette and shapes.
- No source gave the game's fonts or its UI spec. Impact is a stand-in chosen for a heavy comic headline.
- The game's menus and motion were not frame-stepped. The 0.46s beat (130 BPM) is a design choice, not a measured value.

## Chrome and component rules

| Motif | Rule | Where |
|-------|------|-------|
| Hard ink | 2px on controls, 3px on cards and Play; no rounded corners, no blur, no glow | All controls |
| Hard offset shadow | A solid copy shifted 3px (controls) or 6px (cards), never soft | `SlantPlateTemplate`, `AngledCardTemplate` |
| Slant | Plates skew 9 degrees; cards tilt 1.4 degrees; content stays upright | Buttons, tabs, chips, game list, stickers, cards |
| Halftone | Dots on a 45-degree lattice, shrinking away from a corner; only where content is sparse | Banner corner, card corners, rail foot |
| Impact star | One hand-cut 14-point vector shape | Main menu, cover hover and selection, Play hover, radio, empty page |
| Beat | Short hits that decay, 0.46s apart | Play hover, empty page dots |
| Color roles | Yellow = current, orange = primary, cyan = secondary, blue = selection under text or icons the theme does not draw | Constants template |

## Icons

All icons are hand-cut polygons written for this theme in `src/Media.xaml`. No icon pack is bundled.
