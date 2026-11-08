# Glyphbit: reference research

Inspiration: the interface of *Hyper Light Drifter* (Heart Machine, 2016). The notes describe what the game's UI does so the theme can echo it. No asset, logo, font or glyph from the game ships.

## Sources

| Source | Used for |
|--------|----------|
| [Steam store page, app 257850](https://store.steampowered.com/app/257850/Hyper_Light_Drifter/): 10 screenshots at 1920x1080 plus `header.jpg` | Palette sampling; HUD close-up |
| User-supplied captures (inventory, settings, upgrade screen, weapon select) | Panel, slot, slider, selection and scanline rules. Viewed only; colors marked "by eye" come from these |
| [Automaton interview with Alx Preston (JP), 2017](https://automaton-media.com/articles/interviewsjp/20170525-47328/) | Priorities: color, silhouette and contrast, legibility at low resolution, a heavy dark palette |
| [Critics at Large review, 2017](https://www.criticsatlarge.ca/2017/01/from-inside-out-hyper-light-drifter.html?m=1) | No spoken dialogue or readable text; only unreadable glyphs and symbols |

Text sources gave no hex values or HUD specs. Everything numeric below was measured or estimated from images.

## Measured colors

Method: each store screenshot drawn to a canvas, every 7th pixel binned at 3 bits per channel, bins averaged. The HUD was sampled from the top-left 320x120 of a screenshot, counting only pixels with a channel above 120.

| Token | Value | Where |
|-------|-------|-------|
| `gb-void` | `#060408` | Black floors, 54% of one frame |
| `gb-ink` | `#100715` | Violet-black floor, 32% of one frame |
| `gb-night` | `#180b2c` | Deep violet floor |
| `gb-slate`, `gb-edge` | `#2b1534`, `#3d334e` | Raised dark tiles |
| `gb-mint` | `#45ffa5` | Health pips |
| `gb-magenta` | `#fe25b0` | Energy pip |
| `gb-mauve` | `#5a5a8e` | Spent pips |
| `gb-ash` | `#ada9ad` | Stamina bar |
| `gb-white` | `#fefefe` | HUD glyphs |
| `gb-violet` | `#69016e` | Purple floor |
| `gb-cyan` | `#34cee6` | Glowing water, sparks |
| `gb-teal` | `#114a53` | Teal floor |
| `gb-cream` | `#faf8cc` | Key art highlight |

Derived steps: `gb-mint-dim`, `gb-mint-hi`. Estimated by eye from the user's captures, because those could not be sampled: `gb-magenta-deep` (`#c8127c`, settings bar and frame), `gb-magenta-dark`, `gb-slot` (`#1c1426`, empty slot), `gb-amber`, `gb-red` (panel accents). Treat those as approximate.

## Interface rules

- **HUD:** chunky mint and magenta blocks on black slots, white pixel icons, three tiny counter squares under an icon.
- **Panels:** square frames 2px thick with no fill or a near-black one. Frame color varies by panel: magenta, mint, amber, red, cream.
- **Selection:** the settings row is a full-width magenta bar with white text. Grid cells take a white frame with corner ticks.
- **Empty slots:** dark violet squares, 1px lighter edge, four L-shaped brackets inside.
- **Sliders:** rows of about ten square segments in pale grey, dim when unfilled.
- **Corners and edges:** small square pips on frame corners. Tiny unreadable rune columns inside top-left corners. Dense pixel-noise strips outside the settings frame. Thin connector lines between panels.
- **Controls:** white chamfered chips with dark labels for the shoulder buttons and footer hints.
- **Backdrops:** near-black with a large diamond and magenta or teal pillars of light, and faint horizontal scanlines over everything.
- **World edges:** ragged pixel silhouettes where colour meets black.
- **Text:** one pixel face, very little of it. No Windows pixel font is safe to assume, so the theme uses Bahnschrift and cuts words instead.

## Motion

Not frame-stepped from video: the captures are stills. The dash afterimages and the hard frame-step feel are from general familiarity with the game, not measurement. Durations (40 to 60ms a frame) are chosen to read as stepped; adjust after seeing them in Playnite.
