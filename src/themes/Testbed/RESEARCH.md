# Testbed — Reference Research (`Portal 2`)

- **Primary gallery**: `https://interfaceingame.com/games/portal-2/` (20 full-res 3840x2160 captures cached locally during research and sampled pixel-by-pixel).
- **Captures inspected**:
  - Menus & dialogs: `portal-2-main-menu.jpg`, `portal-2-options.jpg`, `portal-2-video.jpg`, `portal-2-keyboard-and-mouse.jpg`, `portal-2-edit-keys-and-buttons.jpg`, `portal-2-save-game.jpg`, `portal-2-quit-the-game.jpg`, `portal-2-extras.jpg`, `portal-2-co-op-mode.jpg`
  - Customization, Store & Workshop: `portal-2-bot-customization.jpg`, `portal-2-skins.jpg`, `portal-2-workshop.jpg`, `portal-2-quick-play.jpg`, `portal-2-test-chamber-evaluation.jpg`, `portal-2-create-map.jpg`
  - In-game, HUD & Loading: `portal-2-start-screen.jpg`, `portal-2-loading.jpg`, `portal-2-chapter.jpg`, `portal-2-create-blue-portal.jpg`, `portal-2-pick-up.jpg`

---

## 1. Visual System & Structural Chrome Measurements

### Cleanroom Panel Grid & Stepped-Tab Dialogs (`options.jpg`, `video.jpg`, `save-game.jpg`, `edit-keys-and-buttons.jpg`, `quit-the-game.jpg`)
- **Stepped-tab panel silhouette**: Every dialog and sub-menu rises from a **top-left stepped header tab** protruding above the main rectangular body (`~36–42%` width, `~22%` height of the panel), cleanly unifying the window/section title with a tiled wall surface below.
- **Modular chamber wall panel gradient**: Panel surfaces are lit subtly across a flat off-white aluminum wall (`#D9D9D9` median, `#E2E5E8` base wall, `#F2F4F6` bright tile, `#AAAEB1` top bezel shade, `#A2A4A5` foot bezel shade) subdivided by faint **1px modular square tile grout lines**.
- **Row selection & hover**:
  - Idle rows sit transparently over the modular tile grid (`#1B1D20` ink).
  - Hovered rows (`edit-keys-and-buttons.jpg` `Move Back`) take a crisp flat grey plate (`#C9C9C9` / `#CFD4D8`).
  - Selected / focused rows (`options.jpg` `AUDIO`, `video.jpg` `Brightness`, `save-game.jpg` `New Saved Game Slot`) invert cleanly into **Aperture Charcoal (`#343639` / `#393939`)** spanning edge-to-edge across the tile panel with crisp `#F5F7F9` white typography (`11.29:1` contrast).
- **Interactive controls inside panels**:
  - **Sliders (`video.jpg`, `keyboard-and-mouse.jpg`)**: Flush horizontal track (`#979797` grey) with solid white (`#FFFFFF`) or solid black active fill and a small **downward-pointing triangle marker (`▼`)** hovering along the top edge of the track.
  - **Option cycling / dropdowns (`keyboard-and-mouse.jpg`, `skins.jpg`)**: Crisp white dropdown bar (`#FFFFFF`) with solid downward triangle (`▼`), or left/right triangle chevrons (`◀ Disabled ▶`) inside the selected charcoal bar.
  - **Dialog footer buttons (`Back`, `Use Defaults`, `Edit key`, `Save`, `Quit`, `Cancel`)**: Flat sharp-cornered rectangular aluminum chips (`0px` radius, `#8B8B8C` / `#F2F4F6`, subtle top/bottom shading) tucked just beneath the bottom-left edge of the panel.

### Dark Carbon Chrome + Cleanroom Light Wall (`bot-customization.jpg`, `skins.jpg`)
- **Two-zone structural framing**:
  - Top and bottom structural bands (`~13%` height) use **Dark Carbon Tiles (`#292B2E` / `#2C2C2C`)** subdivided by faint modular square seams (`#3A3E44` raised plaques/tabs, `#4F4F4F` inactive tab chips).
  - Main workspace canvas uses **Cleanroom Aluminum Wall (`#D9D9D9` / `#E2E5E8`)** with `0px` modular tile seams (`#A9B1B9` grout).
- **Active Portal Blue / Steel-Cyan Controls**:
  - `STORE`, `ADD TO CART`, `CHECKOUT` active tabs/buttons switch cleanly from mid-grey (`#838383`) to saturated **Portal Blue / Steel-Cyan (`#5A92AA` / `#0D77A3` -> hover `#0B6991`, highlight `#6893AD` / `#1CA8E3`)** with bold uppercase white lettering.
  - Active item category tab (`SKINS` in `skins.jpg`) rises above the dark header band in light aluminum/grey (`#8D9092` / `#F2F4F6`) while idle tabs remain muted dark tiles (`#4F4F4F`).
- **Grid cards & brackets (`bot-customization.jpg`, `skins.jpg`)**:
  - Viewport frame around Atlas & P-body uses crisp **L-shaped dark corner brackets** around a thin hairline square.
  - Store grid cards sit on sharp `0px` white/light-grey square tiles (`#CCCCCC` / `#F2F4F6`) with vibrant **Orange `SALE!` / `-70%` tags** (`#C37324` / `#A86E01`) and twin **Blue + Orange portal-colored dot badges** at bottom-left.

### Workshop, Puzzle Maker & In-Game HUD (`workshop.jpg`, `quick-play.jpg`, `loading.jpg`, `pick-up.jpg`, `create-blue-portal.jpg`)
- **Workshop yellow highlight (`workshop.jpg`, `quick-play.jpg`)**: Selected dark-panel row flips to muted caution yellow (`#DCD786`) with dark ink; caution/accent yellow (`#E2B824`) also anchors facility signage and active indicators.
- **Loading & Chamber Antlines (`loading.jpg`, `pick-up.jpg`)**:
  - Loading screen bottom-right progress indicator displays a **horizontal sequence of circular cyan dots** (`#3386A6` / `#1CA8E3` lit vs `#3A464C` unlit), echoing Aperture's signature **test-chamber indicator antlines** (5px bright dots marching along chamber walls from button to exit door).
  - Portal polarity pairs **Portal Blue / Cyan (`#0D77A3` / `#1CA8E3`)** directly against **Propulsion Orange (`#C64E08` / `#F47A1F` / `#CF560D`)**, giving us an unmistakable non-colliding hue pair for Play vs Running/Launching!
  - Thermal Discouragement Laser Beams (`loading.jpg`) glow crisp **Thermal Crimson (`#F55060` / `#C42334`)** — natural Danger / Exit / Close hover hue.
  - In-game interaction prompts (`pick-up.jpg`) render crisp white square keycaps (`[E]`) with dark bevel rims and clean sans-serif labels.

---

## 2. Sampled Color Table

| Sample Source | Region | Sampled Hex | Mapped Token |
| --- | --- | --- | --- |
| `portal-2-options.jpg` | Panel wall mid | `#D9D9D9` -> `#E2E5E8` / `#F2F4F6` | `--tb-wall-base`, `--tb-wall-tile` |
| `portal-2-edit-keys-and-buttons.jpg` | Hovered row plate | `#C9C9C9` -> `#CFD4D8` | `--tb-wall-hover` |
| `portal-2-options.jpg` | Selected charcoal row | `#393939` -> `#343639` | `--tb-charcoal` |
| `portal-2-options.jpg` | Panel top/bottom bezel shade | `#AAAEB1` / `#A2A4A5` -> `#A9B1B9` | `--tb-grout`, `--tb-grout-deep` |
| `portal-2-bot-customization.jpg` | Dark header carbon tiles | `#2C2C2C` -> `#292B2E` / `#2E3135` | `--tb-carbon`, `--tb-carbon-top` |
| `portal-2-bot-customization.jpg` | Header center tile | `#3F3F3F` -> `#3A3E44` | `--tb-carbon-tile` |
| `portal-2-bot-customization.jpg` | `STORE` / `ADD TO CART` button | `#5A92AA` -> `#0D77A3` (4.5:1+ AA white text) | `--tb-portal-blue` |
| `portal-2-main-menu.jpg` | Portal figure cyan | `#0988A9` / `#1CA8E3` | `--tb-portal-cyan` |
| `portal-2-create-map.jpg` | Propulsion gel orange | `#CF560D` -> `#C64E08` / `#F47A1F` | `--tb-orange`, `--tb-orange-hi` |
| `portal-2-skins.jpg` | Store `-70%` / `SALE!` tag plaque orange | `#BF6E0A` / `#CC7621` -> `#D07D16` (5.33:1 AA black ink) | `--tb-tag-orange` |
| `portal-2-loading.jpg` | Thermal laser crimson | `#F55060` -> `#C42334` | `--tb-crimson` |
| `portal-2-skins.jpg` / `workshop.jpg` | Caution / active mark yellow | `#DCD786` / `#E2B824` | `--tb-yellow` |

---

## 3. Typography & Bundled Open Stand-Ins

- **Source game typography**: *Portal 2* signage, menus, and logo rely on **Univers** (*Univers 67 Condensed*, *Univers 75 Black*, *Univers 49 Ultra Condensed*) and **FF DIN Bold** (commercial Monotype / FontFont families not shipped by Windows).
- **Windows-consistent bundled stand-ins (`src/Typography/`, OFL-1.1, subsetted to Latin + Cyrillic)**:
  - **Body & UI (`FontFamily`)**: **Barlow Semi Condensed** (`Regular 400`, `Medium 500`, `SemiBold 600`, `Bold 700`) — geometric DIN/Univers proportions matching Portal 2's clean semi-condensed sans-serif menu rows.
  - **Display Headings & CTA (`HeadingFontFamily`)**: **Barlow Condensed** (`SemiBold 600`, `Bold 700`) — tight architectural condensed caps matching `OPTIONS`, `SAVE GAME`, `CO-OP BOT CUSTOMIZATION`, and chamber numbering.
  - **Shortcuts & Monospace (`MonospaceFontFamily`)**: `Consolas` (Windows system font; Chromium preview uses bundled `Cascadia Mono`).

---

## 4. Motion Language Specs

- **Architectural snap (`CubicEase`, `EaseOut`)**: Panels, stepped selection bars, and viewport brackets lock cleanly into grid alignment without cartoon wobble or organic blur (`110ms` hover, `150ms` selection sweep, `220ms` Play sheen pass, `240ms` exit decay with `FillBehavior="Stop"`).
- **Indicator antlines (`antline-dots.png`)**: Progress and running states pulse sequentially through circular chamber nodes (`1.6s` directional Propulsion Orange sweep + filling dotted antline foot while Launching; calm `3.0s` breathing pulse while Running).
