# Bathysphere — reference research

Unofficial fan theme research spanning the entire **BioShock** franchise: **BioShock** (2007 / Remastered, Rapture 1959–1960), **BioShock 2** (2010 / Remastered, Rapture 1968), **BioShock Infinite** (2013, Columbia 1912), and **Burial at Sea** (2013–2014, pre-fall Rapture 1958).

## Primary sources inspected

1. **Game UI Database — BioShock (`id=1171`)**: `https://www.gameuidatabase.com/gameData.php?id=1171`
   - 37 UI captures across 7 categories (Title Screen `v1.0.122872`, Load/Save, Loading Screens, Settings Menu/Gameplay/Display/Audio, Pause, Vending/Circus of Values, Map/Goals/Audio Diaries, Weapon Wheel, Hacking, Gameplay HUD).
2. **Game UI Database — BioShock Infinite (`id=338`)**: `https://www.gameuidatabase.com/gameData.php?id=338`
   - 49 media items (34 screenshots + 15 clips) across 7 categories (Title Screen, Mode Select, Loading Postcards, Parlor Settings, Modals, Pause, Gear/Weapon/Vigor Inventory, Voxophones, Vigor Wheel, Gameplay HUD).
3. **BioShock 2 & Burial at Sea UI/HUD references** (BioShock 2 has no Game UI Database entry):
   - Big Daddy Alpha Series helmet bezel framing, real-time analog hacking needle gauge (green/blue/gold/red zones with sweeping brass needle), dual-wielding Plasmid + Weapon HUD, multi-floor Map tabs, and Burial at Sea's jewel-toned pre-fall Rapture Art Deco brass/ocean polish.

---

## 1. Color palettes measured across the franchise

### BioShock 1 & 2 (Rapture — Submerged Art Deco Noir)
- **Abyssal backgrounds & lacquered iron:** `#081113`–`#181816` deep Atlantic obsidian-charcoal, `#2A2621` distressed olive-bronze metal, `#0E3A2A` / `#123B26` deep Rapture emerald lacquer (loading plaques).
- **Metals & trim:** `#C9A45A` / `#A68B46` burnished antique brass, `#6B5A32` / `#4D3C25` oxidized bronze, `#8C99A6` brushed steel/silver end-caps & rivets, `#E5B526` / `#D6BA6E` bright active gold highlight.
- **Vitals, hacking & paper:**
  - Health tube / crimson lacquer: `#A82424` / `#C93232` (`#5E0F0F` dark crimson board)
  - EVE glass tube: `#2456A8` / `#2E74D1` electric cobalt
  - Hacking pipe fluid (BS1) & needle sweet spot (BS2): `#1FE08A` glowing seafoam-emerald
  - Journal/Map cream header plate & ivory type: `#E3D8B4` / `#F2EAD3`

### BioShock Infinite (Columbia — 1912 Gilded Beaux-Arts & Edwardian Print)
- **Parchment & cabinetry:** `#E3D4BC` / `#DECBA9` aged cotton-rag vellum parchment, `#C29D6B` warm sepia-tan selection ribbon, `#3B2114` mahogany mirror frame, `#1C1A18` dark wrought-iron HUD bezel.
- **Columbia accents:**
  - Slate-teal riveted header pills & garment tags: `#335068` / `#4A6B7C` / `#5F7E7A`
  - Patriotic bunting & objective ribbons: `#8F2622` / `#A62C26`
  - HUD Shield bar: `#E6A817` bright amber-gold
  - HUD Health bar: `#B82525` crimson
  - HUD Salts 12-segment bar: `#1F78FF`–`#47A3FF` glowing cobalt

### Franchise synthesis palette (`src/tokens.css`, `--bs-*`)
To unite Rapture's atmospheric deep-sea Art Deco with Columbia's gilded vellum dossiers while maintaining strict state color separation in Playnite:
- **Shell & workspace:** `--bs-abyss` `#081113` (rail/top bar/dialog title), `--bs-deep` `#0D1A1D` (library & game page), `--bs-panel` `#122327` (elevated popups/cards), `--bs-well` `#070F11` (recessed inputs & search).
- **Brass & Shield Gold (Brand / Play CTA / Chrome):** `--bs-brass` `#C99A36` (Play CTA fill, paired with `#091113` abyssal ink for 7.4:1 contrast), `--bs-brass-hover` `#DEB24E`, `--bs-brass-press` `#997222`, `--bs-gold` `#E5BC5E` (bright Art Deco linework, active indicators, hover blooms), `--bs-bronze` `#6E572A` (muted borders/hairlines), `--bs-steel` `#9FAEB8` (BS1 brushed-silver rivets & end caps).
- **Submerged Atlantic Teal (Selection & Active Nav):** `--bs-teal-sel` `#173E44`, `--bs-teal-hover` `#1E4D54`, `--bs-slate-pill` `#2C4B59` (Columbia header plaque).
- **EVE / Salts Cobalt (Running & Launching Game ONLY):** `--bs-eve` `#1A69CC` (solid plate fill with `#F6F9FF` ink >= 5.1:1), `--bs-eve-lit` `#4BA3FF` (scan glow, bubbles, 12-segment Salts foot bar).
- **Hacking Fluid Emerald (Active Filter Mark & Positive Ratings):** `--bs-hack` `#22D485`.
- **Health / Bunting Crimson (Danger, Close Hover, Exit Menu Row):** `--bs-crimson` `#A62626` (`#FBF4E4` text > 6.5:1), `--bs-crimson-lit` `#CC3B3B`.
- **Columbia 1912 Vellum (Metadata Dossier):** `--bs-vellum` `#DFD0B4`, `--bs-vellum-edge` `#7A6546`, `--bs-ink` `#231B13`, `--bs-umber` `#5A4936`, `--bs-vellum-link` `#164C54`.

---

## 2. Typography

| Source role | Franchise reference | Bathysphere bundled face (`src/Typography/`) | License / Notes |
|---|---|---|---|
| Display / Headers / Play CTA / Dialog title | BioShock 1 tall ultra-condensed Art Deco sans (`Andes` / `Plaza` / `ITC Anna`) + Infinite condensed banners (`VOXOPHONES`, `TURN OFF THE MACHINES`) | **`Pathway Gothic One`** (`PathwayGothicOne-Regular.ttf`) | SIL OFL 1.1 (Reserved Font Name `Pathway` — shipped unmodified, Latin & Cyrillic) |
| Body / Lists / Settings tree / Controls | BioShock 1 & 2 geometric sans (`Futura` / `Century Gothic`) + Infinite clean condensed UI labels | **`Jost`** (`Jost-Regular.ttf`, `Jost-Medium.ttf`) | SIL OFL 1.1 (Futura geometric revival; Regular + Medium bundled, base size `14px` to balance geometric x-height) |
| Engraved Score Seals & Plaque Badges | BioShock Infinite Edwardian/Beaux-Arts engraved display serif | **`Cinzel`** (`Cinzel-Bold.ttf`) | SIL OFL 1.1 (Bold bundled for score medallions and monumental dossier numerals) |

---

## 3. Chrome, geometry, and interface mechanics

1. **Pointed-hexagonal 45° chamfered plaques with brushed-silver rivets** (`id=1171` Settings, Load/Save, action bars): double gold hairline outline, crisp 45° pointed ends, twin silver rivets at left/right vertices. Used on `PlayButton`, `Button` (`IsDefault=True`), and popup menu highlight bars.
2. **Stepped Art Deco brass corners & double rules** (`id=1171` Loading screens, Journal frame): concentric stepped L-brackets and symmetrical sunburst fan finials. Used on `TopPanel` divider, `StandardWindowStyle` dialog header, `ContextMenu` boards, `GroupBox` cards, and `GridViewItemStyle` selection/hover frames.
3. **1912 Columbia Vellum & Slate-Teal Riveted Header Plaque** (`id=338` Settings, Modals, Codex): aged cream parchment framed by double dark-brass hairlines with Edwardian corner accents and a riveted slate-teal title pill. Used on the game page Metadata Dossier (`DetailsViewGameOverview`, `GridViewGameOverview`).
4. **Glass-tube Health/EVE gauges & 12-segment Salts bar** (`id=1171` & `id=338` HUD): silver-capped horizontal liquid vial (`ProgressBar` / `PART_ProgressGlobal`), plus 12-segment glowing cobalt Salts meter (`RunningFill`) and rising EVE vial bubbles (`RunningMote1..3`) on the `RunningIndicator`.
5. **BioShock 2 Analog Hacking Needle Gauge & BS1 Vertical Slider Needle** (`id=1171` Settings sliders & BS2 hacking): recessed dark calibrated rail with gold fill and a sharp diamond-tipped brass indicator needle thumb (`Slider`).
6. **8-/16-Point Starburst Medallions & Bronze Vigor Wheel** (`id=1171` Medkit/Ammo starbursts & `id=338` Vigor wheel): octagonal/circular riveted brass medallions for `GridTileButton` (cover Play/Info) and `RadioButton` porthole sockets.
7. **Rapture Art Deco Skyline & Lighthouse Porthole** (`id=1171` Pause skyline & franchise Lighthouse motif): ghosted Art Deco skyline watermark in `StandardWindowStyle` title band, and a riveted circular Bathysphere porthole framing the radiating Lighthouse-over-Waves mark in `EmptyGameTemplate`.

---

## 4. Motion personality

- **Mechanical brass precision + submerged light:** crisp `CubicEase` (`EaseOut`) for heavy brass detents and sliding chevron pointers (`120–180ms`), `BackEase` (`EaseOut`, amplitude `0.24`) for cover medallion deployment (`55ms` stagger), `QuadraticEase` (`EaseIn`, `FillBehavior="Stop"`) for smooth cool-down exits (`200–280ms`), and calm `3.2–3.6s` breathing on underwater porthole glow and live running EVE tubes.
- Launching sweeps use a smooth continuous `1.65s` EVE cobalt surge band paired with a 12-segment Salts foot fill and staggered rising bubbles — never blinking or stepped flicker.
