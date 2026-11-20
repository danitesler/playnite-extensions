# Cogplate — research & sources

Cogplate is an unofficial fan theme inspired by the menus, phosphor CRT terminals, purity dossiers, and HUD of **Warhammer 40,000: Boltgun 2** (Auroch Digital / Big Fan Games, 2026). Nothing here reproduces the game's art, logos, emblems, skulls, Aquilas, or proprietary font files.

## Sources

| What | Where | Notes |
|------|-------|-------|
| Reference captures | [gameuidatabase.com/gameData.php?id=2587](https://www.gameuidatabase.com/gameData.php?id=2587) | 33 cataloged screenshots inspected on 2026-11-18 (`01-title`, `02-main-menu`, `04-difficulty`, `05-loading`, `06-settings-gameplay`, `12-settings-controls`, `16-modal`, `17-character-select`, `19-world-map`, `22-stage-select`, `24-game-over`, `25-level-complete`, `26-area-map`, `27-weapon-wheel`, `28-hud-vitals`, `31-hud-enemy`, `32-hud-log`). Colors sampled from pixel regions in Python (`PIL` + `NumPy`). |
| Tokens | Sampled from the captures above; stored under `--cg-*` in `src/tokens.css` | No official published token package exists. |
| Fonts | Tall condensed industrial grotesque + clean condensed body | Screen titles, CTA plates, and dossier headings (`PLAY GAME`, `OPTIONS`, `SELECT DIFFICULTY`, `LEVEL COMPLETE`, `CULTIST CHAMPION`) match **Barlow Condensed** (`SemiBold` 600, `Bold` 700; SIL OFL 1.1) bundled in `src/Typography/`. Body labels, option rows, and metadata use **Barlow Semi Condensed** (`Regular` 400, `SemiBold` 600, `Bold` 700; SIL OFL 1.1), also bundled. |
| Icons | Drawn in `src/Media.xaml` | Crisp geometric chamfered iron & HUD stroke/glyph vectors inspired by the weapon reticle, controller prompts, gothic arches, and area map markers. Playnite menu icons keep Playnite's built-in glyphs, recolored. |
| Motion | Static captures + HUD/CRT affordances | Snappy mechanical settles (`110ms`), phosphor LED & scan fades (`180ms`), smooth cool-down exits (`280ms`), and HUD Armor Cobalt diagonal energy sweep + segmented bar (`1.65s` launch sweep / `3.2s` idle pulse). |

## Measured values (Game UI Database captures)

| Part (capture) | Sample | Token | Contrast / Note |
|----------------|--------|-------|-----------------|
| Obsidian skull alcove & outer void (`02-main-menu`, `06-settings-gameplay`) | `#070605` -> `#090B09` | `cg-void` | Window chrome, outer recess, input trough |
| Gunmetal rail & title band (`02-main-menu`, `06-settings-gameplay`) | `#111512` | `cg-iron-dark` | Sidebar rail, top bar, dialog title band |
| Dark iron workspace (`02-main-menu`, `16-modal`) | `#171B18` | `cg-iron` | Library content layer, game page root (`14.3:1` with ivory text) |
| Resting iron button / plate (`06-settings-gameplay`, `12-settings-controls`) | `#222723` | `cg-steel-plate` | Standard buttons, resting keycap squares |
| Hovered steel surface (`06-settings-gameplay`, `12-settings-controls`) | `#2E342F` | `cg-steel-lit` | Secondary hover plates, hovered tree/list rows |
| Gunmetal frame bevel (`06-settings-gameplay`, `04-difficulty`) | `#4C524B` (bevel `#63615D`–`#737871`) | `cg-steel-rim` / `cg-steel-hi` | Bolted frame outlines, panel seams, scroll rail |
| CRT phosphor green glass (`06-settings-gameplay`, `05-loading`, `16-modal`) | `#0B1D0E`–`#142919` (`#102415` mid) | `cg-crt-deep` / `cg-crt` | CRT monitor interior, Settings/Modal panels, banner tint (`#0B1B0E`) |
| Lit CRT active plate (`02-main-menu` *PLAY GAME*, `16-modal` *YES*) | `#1A3022`–`#214026` (`#183520` tuned) | `cg-crt-lit` | `PlayButton` plate, selected rows, checked tabs (`11.2:1` with ivory text) |
| Pressed CRT plate | `#0D1E11` | `cg-crt-press` | `PlayButton` & default button pressed state |
| Luminous phosphor mint LED (`02-main-menu` LED end-pills, `06-settings-gameplay` bottom LED) | `#BECDB9`–`#FAFBF9` (halo `#8AF0A8`) | `cg-mint` / `cg-mint-hot` | Active LED end-capsules, focus glow, active edge bars |
| Primary ivory-white text (`06-settings-gameplay` *Hit Markers*, `02-main-menu` *PLAY GAME*) | `#F4F8E0` -> `#F2F4EA` | `cg-ivory` | Active labels, headings, focused white chevron pill border |
| Secondary sage text (`06-settings-gameplay` *Auto Switch Weapons*) | `#576E4C`–`#8A9A87` (tuned `#8FA38B`) | `cg-sage` | Tuned >= `5.1:1` on `#102415` CRT and `#171B18` iron |
| Tarnished brass & gold medal (`04-difficulty`, `06-settings-gameplay` corners) | `#7A664C`–`#9A7942` / `#EEB24F` | `cg-brass` / `cg-brass-lit` | Corner miter brackets, bolted rivets, section markers, gold scores |
| Coiled crimson power conduit (`06-settings-gameplay`, `22-stage-select`, `24-game-over`) | `#802B2B`–`#B53D3C` (`#942B28` / `#D13D38`) | `cg-conduit` / `cg-conduit-lit` | Corner conduit trims, `DangerBrush`, negative ratings |
| Acid lime toggle & ability pod (`06-settings-gameplay` *Enabled*, `28-hud-vitals`, `26-area-map`) | `#8D930F`–`#D3E737` (`#9CB41C` / `#C9E33E`) | `cg-lime` / `cg-lime-lit` | Checked toggle capsule, filter active diamond pip, positive ratings |
| Aged parchment dossier (`04-difficulty`, `22-stage-select`, `25-level-complete`) | `#CEBB98`–`#D3C09D` (`#D3C19E`) | `cg-parchment` | Right-hand metadata dossier sheet (`10.1:1` with sepia ink) |
| Parchment shade, rim & sepia ink (`04-difficulty`, `22-stage-select`) | `#B49F7B` / `#7A674D` / `#312A1E` -> `#241F17` | `cg-parchment-shade` / `cg-parchment-edge` / `cg-ink` | Dossier margins, sepia headings/values, deep green link ink `#174525` |
| HUD Armor Cobalt (`28-hud-vitals` upper armor bar) | `#2200CE`–`#3662F0` (tuned `#245CE0` / `#4D85FF`) | `cg-armor` / `cg-armor-lit` | Dedicated `RunningIndicatorBrush` (`5.2:1` ivory text on `#245CE0`) |

## Interface parts observed

- **Chain-link viewport border (`02-main-menu`, `06-settings-gameplay`, `26-area-map`)**: Continuous riveted chain track running horizontally across the top and bottom edges of every menu screen.
- **Bolted CRT phosphor monitor (`06-settings-gameplay`, `16-modal`, `05-loading`)**: Chamfered dark iron bezel with mitered brass corner caps, coiled crimson conduits along the top shoulders, horizontal CRT scanlines across deep green glass (`#102415`), a bottom-center glowing mint LED lamp, and fine spiderweb glass cracks in the lower-right corner.
- **Main Menu & Modal LED action plates (`02-main-menu` *PLAY GAME*, `16-modal` *YES / NO*)**: Horizontally chamfered dark green CRT slabs (`#183520`) flanked on left and right by glowing vertical mint-green LED end-pills (`#8AF0A8` / `#D8FBE0`) when active.
- **Settings pointed-chevron focus outline (`06-settings-gameplay` *Hit Markers*, `12-settings-controls` *Reset Bindings*)**: Crisp `1.5px` white pill-chevron outline wrapping the active option row over green CRT glass.
- **Stage Select hybrid CRT + Nailed Parchment dossier (`22-stage-select`, `04-difficulty`, `25-level-complete`)**: Chamfered dark green CRT header strip stacked directly over a nailed aged-parchment dossier sheet (`#D3C19E`) with weathered edges and sepia ink stats (`TIME`, `KILLS`, `DIFFICULTY`, `SECRETS`, `SEAL`), all bound inside one bolted iron-and-brass frame.
- **Capsules, I-beam sliders & keycap prompts (`06-settings-gameplay`, `12-settings-controls`)**: Olive/acid-lime horizontal pill toggle (`Enabled`); slim track with vertical flanged steel I-beam thumb (`Crosshair Opacity`); elongated hexagonal keycap slots (`[SPACE]`, `[V]`, `[LB]`, `[RB]`).
- **HUD Vitals dual bar & gothic ability arches (`28-hud-vitals`, `31-hud-enemy`)**: Tapered/pointed dual-track armor (blue) + health (red) bar (`100/100`) and three lancet-arched ability pods in acid lime.

## Design rules taken from the captures

- **Iron & Phosphor separation**: Calm `#171B18` gunmetal-iron holds dense game lists and descriptions; `#102415` CRT phosphor green owns terminal headers, active buttons, and Settings/Modal interiors; `#D3C19E` nailed bone parchment owns the Metadata Dossier sheet.
- **Chamfered & hexagonal silhouettes**: Heavy `45-degree` chamfered corners (`ControlCornerRadius` kept crisp at `2px` on standard rectangles while hero plates, headers, and combos use chamfered bevel geometry) — never soft consumer rounded cards.
- **Strict hue ownership**: Phosphor Green + Mint LEDs own `PlayButton` and active selection; Steel owns hover; Acid Lime / Brass own filters, toggles, and ratings; Conduit Crimson owns close hover and danger; **HUD Armor Cobalt** (`#245CE0`) is reserved exclusively for running/launching game states.
