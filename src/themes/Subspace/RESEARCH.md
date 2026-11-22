# Star Trek: LCARS — Research Notes

Reference research for **Subspace**, an unofficial desktop theme inspired by Michael Okuda's **Library Computer Access/Retrieval System (LCARS)** from *Star Trek: The Next Generation*, *Deep Space Nine*, and *Voyager* (1987–2001).

## Sources

- Michael Okuda's original TNG/DS9/Voyager backlit Kodalith plexiglass panels ("Okudagrams") — canonical digital color standards documented at [The LCARS Website](https://www.thelcars.com) and community LCARS design guides.
- Typography: authentic broadcast panels used **Swiss 911 Ultra Compressed BT** / **Helvetica Ultra Compressed** in all-caps with tight counter apertures and flat-sided stroke geometry.
- Open SIL OFL fonts bundled in `src/Typography/`:
  - **Pathway Gothic One** (`PathwayGothicOne-Regular.ttf`, SIL OFL 1.1 with Reserved Font Name `'Pathway'`, shipped unmodified) — ultra-narrow neo-grotesque matching Swiss 911 Ultra Compressed proportions for titles, LCARS header tracks, Play button, numeric scores, and Settings title band.
  - **Barlow Semi Condensed** (`Regular`, `SemiBold`, `Bold`, SIL OFL 1.1) — clean geometric semi-condensed sans for dense body prose, library game lists, metadata labels, and Settings navigation rows (28–32px) so long titles and multi-language strings stay readable without cramping.
  - **Consolas** (Windows system font; rendered via **Cascadia Mono** in previews) — tabular numeric telemetry codes (`47-01`, shortcuts).

## Canonical Color Palette & Measured Contrast

Classic LCARS places high-chroma pastel/warm-neon acrylic blocks directly onto pure black (`#000000`) backlit glass. All colors below are checked against WCAG 2.1 AA (≥ 4.5:1 normal text, ≥ 3:1 large bold/UI graphics):

| Token | Hex | LCARS Role | Contrast Check |
| --- | --- | --- | --- |
| `--lcars-void` | `#000000` | True black backlit console glass (`WindowBackgourndBrush`, shell, library) | Base |
| `--lcars-panel` | `#0B0D14` | Recessed console module interior (metadata card, popup board, input troughs) | Base raised |
| `--lcars-surface` | `#141824` | Secondary dark control fill, inactive pills, tracks | Base control |
| `--lcars-surface-hi` | `#1C2234` | Elevated hover well, subtle divider backing | Base hover |
| `--lcars-tangerine` | `#FF9900` | Classic TNG primary elbow & `PlayButton` command bar | `#000000` ink = **9.8:1**; on `#000000` = **9.8:1** |
| `--lcars-gold` | `#FFCC66` | Sunflower / Golden Tanoi: Play hover, menu highlight lozenge, heading readouts | `#000000` ink = **13.7:1**; on `#000000` = **13.7:1** |
| `--lcars-flash` | `#FFE6B3` | LCARS activation flash on Play press (sharp bright cream-gold pop) | `#000000` ink = **16.7:1** |
| `--lcars-peach` | `#FF9966` | Butterscotch / Almond framing segments, metadata elbow trim, close-key stub | `#000000` ink = **9.4:1** |
| `--lcars-lavender` | `#CC88FF` | African Violet: selection bar/accent, active rail & view-switch lozenges | `#000000` ink = **9.1:1**; on `#000000` = **9.1:1** |
| `--lcars-lavender-wash` | `#26193B` | Deep backlit violet wash for selected rows & Settings tree items | `#F2EFE9` text = **13.2:1**; `#FFCC66` = **9.8:1** |
| `--lcars-lavender-edge` | `#4D3570` | Hairline frame around selected modules & popups | Structural |
| `--lcars-periwinkle` | `#88AAFF` | Voyager Sky/Periwinkle: hover accent, interactive links, chips, secondary tracks | `#000000` ink = **9.0:1**; on `#000000` = **9.0:1** |
| `--lcars-periwinkle-wash` | `#162038` | Calm hover wash for rows, tree nodes, and buttons | `#F2EFE9` text = **14.3:1** |
| `--lcars-periwinkle-dim` | `#4A5E94` | Muted border/divider for inputs and metadata framing | Structural |
| `--lcars-cyan` | `#66CCFF` | Science-station Ice Cyan: active filter pip (`DataChangeNotifBrush`) & focus ring | On `#000000` = **11.9:1** |
| `--lcars-ops-teal` | `#0D7F6B` | Warp Ops Teal: `RunningIndicatorBrush` (distinct hue from Tangerine, Violet, Periwinkle, Cyan, Red) | `#F2EFE9` text = **4.6:1** bare, **6.5–9.0:1** with scrim |
| `--lcars-ops-mint` | `#38E8B8` | Bright Ops Mint telemetry bars & scanline glint highlights | On `#000000` = **12.5:1** |
| `--lcars-alert-red` | `#C42828` | Red Alert crimson: Exit danger lozenge, Close button hover, destructive states | `#F2EFE9` text = **5.9:1** |
| `--lcars-alert-red-hi` | `#EE5555` | Mars Red negative score & danger rest label | On `#000000` = **6.3:1** |
| `--lcars-text` | `#F2EFE9` | Warm backlit Space White primary text | On `#000000` = **18.5:1**; on `#0B0D14` = **16.9:1** |
| `--lcars-text-muted` | `#B6ADCA` | Lavender-Mist secondary text, captions, inactive icons | On `#000000` = **9.3:1**; on `#0B0D14` = **8.5:1** |
| `--lcars-banner-tint` | `#0E0A18` | Solid deep obsidian-plum brand tint for `GameBannerTintBrush` | Solid (no alpha) |

## Geometry, Chrome & Component Anatomy

1. **The Sweeping Elbow (The Signature Form):** An L-shaped structural joint curving cleanly from a vertical left column (`44px` rail) into a horizontal tracking header bar (`50px` top bar, `6px` lower rail) with a rounded outer corner (`22px`) and a **concave inner fillet** (`M 0,0 L 14,0 A 14,14 0 0 0 0,14 Z`) where rail meets header.
2. **3px Pure-Black Structural Channels:** Every contiguous bar is broken into colored functional segments by razor-clean `2px–3px` black gaps (`#000000`), creating the unmistakable monolithic backlit acrylic panel look.
3. **Half-Pill & Lozenge Endcaps:** Horizontal bars and action buttons terminate in true semicircular half-caps (explicit numeric half-height radii such as `0,14,14,0` or `16,0,0,16` — never `CornerRadiusFull`), often paired with a short contrasting `5px–10px` leading endcap stub separated by a `2px–3px` black gap.
4. **Embedded Bar Titles:** Section headers and dialog titles sit inline inside a broken horizontal colored tracking bar, uppercase in `Pathway Gothic One`, flanked by segmented color blocks terminating in a right pill cap.
5. **Segmented Bar Meters & Equalizers:** Progress indicators (`PART_ProgressGlobal`, `ProgressBar`), sliders, and running-state telemetry readouts use evenly spaced vertical blocks separated by dark channels rather than mushy gradients.

## Motion & State Behavior

- **Rigid Geometry, Crisp Backlit Transitions:** LCARS acrylic frames never wobble or squish organically; motion happens through sharp luminance shifts, clean `CubicEase` slides (`110ms` fast / `180ms` base / `320ms` slow), and crisp activation flashes on press.
- **Press Flash:** Clicking Play triggers a brief pale cream-gold (`#FFE6B3`) illumination flash across the lozenge — echoing on-screen LCARS touch-panel chirp feedback.
- **Telemetry Sweeps & Equalizer Bars:** Launching a game drives a segmented Ops Teal progress sweep (`1.6s` loop) + filling pill foot track + 3 staggered vertical LCARS telemetry bars (`ScaleY`); while running, the bars breathe calmly on a `3.2s` harmonic cycle.
