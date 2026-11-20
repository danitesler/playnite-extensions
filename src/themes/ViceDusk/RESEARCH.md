# Vice Dusk — Research & Sources

## Sources

| What | Where |
| --- | --- |
| Primary UI captures (6 screens) | User-supplied *Grand Theft Auto VI* UI captures: Settings -> Control Scheme, Pause -> Map, Pause -> Map / Exploration + Mission Card, Progress, Jason & Lucia Dossier, Settings -> Gameplay |
| Bundled open typography | `scripts/fonts/barlowcondensed/` (Barlow Condensed Regular, Medium, SemiBold, Bold; OFL-1.1) and `scripts/fonts/barlow/` (Barlow Regular, Medium, SemiBold, Bold; OFL-1.1) as open stand-ins for Rockstar's condensed display grotesk and clean geometric UI sans; `scripts/fonts/cascadiamono/` (Cascadia Mono; OFL-1.1) for numeric/key prompts |
| Icon language | Bespoke `Icon<Role>` vector geometries authored in `src/Media.xaml` (clean 1.75px-2px uniform geometric silhouettes matching the Map category rail & settings prompts); Playnite's 24 context-menu PNGs generated via `icons.json` (`render-icons.ps1`) |

## Measured Palette (sampled directly from the 6 UI captures)

| Role | Source Sighting | Sampled / Calibrated Hex | Notes |
| --- | --- | --- | --- |
| Deep Twilight Shell | Map & Profile top bar (`#273848` / `#2A2637`), Exploration drawer (`#293243` / `#2C3849`) | `#1C1726` / `#231D30` | Deepened twilight plum-charcoal for calm library contrast |
| Raised Pause Drawer / Card | Tooltip card body (`#282B36` / `#383F4F`), Exploration sidebar | `#2A2438` / `#322B42` | Smoked aubergine-slate surface |
| Vice Twilight Plum Sky | Settings & Progress gradient (`#8A508A` -> `#774B80` -> `#513460`) | `#6F3D73` / `#513460` / `#382046` | Used for title bands, hero dusk backdrop, empty state, palm silhouettes |
| Palm Silhouette Plum | Settings bottom-right palm fronds (`#573665` / `#3D214A`) | `#2E1A3B` | Dark twilight frond silhouette layer |
| Flamingo Neon Pink | Active top tab (`MAP`, `PROGRESS`, `JASON & LUCIA`), slider fill (`#FDA0CD`), toggle pill (`#FE98C8`), tooltip top rule (`#E092B9`), tooltip subline (`#F263A1`), rail left tick (`#E594BD`) | `#F47BB8` (vivid) / `#FE9ECE` (luminous) / `#D95C9E` (deep rose) | Primary brand & CTA accent |
| Stark White Focus Slab | Active Settings tab (`CONTROL SCHEME`, `GAMEPLAY` `#FFFFFF`), active Map rail tile, focused Settings row (`Default` / `Targeting` `#F1EFF4` fading right to `#BE98BD`) | `#F7F4FA` -> `#C9B2CE` | Iconic left-solid, right-fading selection plate with dark plum ink `#191223` |
| Leonida GPS Cyan | Map coastline & GPS route (`#66BFDE` / `#35A6C8`) | `#2EC4E8` | Running / Launching indicator hue (distinct from Pink Play & White Selection) |
| Sunbelt Cash Emerald | Pocket cash `$992` badge, `Sunbelt Hwy` pill (`#0B8459` / `#2C8E70`) | `#2DB874` | Positive rating / completion / cash accent |
| Rail Alert Gold | Gold diamond notification pips on the Map left icon rail | `#F2C94C` | `DataChangeNotifBrush` (active filter pip) |
| Siren Crimson | Police lightbar / destructive actions (`Exit`) | `#C82843` | 5.35:1 with crisp white text (`#FFFFFF`) |
| Primary Ink & Secondary Lavender | Profile values (`#FFFFFF`), dossier labels (`#E4D7E5` / `#CBB9CF`), tooltip copy (`#D7DCE3`) | `#F5F1F8` / `#B9ABC4` | High contrast on dark plum surfaces |

## Measured Typography & Layout Specs

- **Headings (`HeadingFontFamily`)**: Condensed uppercase grotesk (`Barlow Condensed`, weights 600 SemiBold / 700 Bold) used for `SETTINGS`, `EXPLORATION`, `JASON DUVAL`, `FIX YOUR CAR`, `COMBAT`, `TARGETING`, section headers, and Play/Action CTAs.
- **UI & Body (`FontFamily`)**: Clean geometric sans (`Barlow`, weights 400 Regular / 500 Medium / 600 SemiBold) used for game descriptions, settings option rows, metadata values, and menu rows.
- **Chrome Geometry**: Sharp 0-2px corners on top tabs, rail plates, photo cards (`STATS`), and mission tooltip cards; smooth stadium pill tracks strictly on switch toggles (`Shooting Assist`) and highway/chip indicators where the source uses them (respecting Playnite's `ControlCornerRadius` rule of `2px` on base buttons/inputs/chips so unconstrained dialogs never distort into ovals).
- **Signature Motifs Observed**:
  1. **Left-to-right fading white selection bar** (`Default 1/3`, `Targeting 2/3`) paired with dark plum ink text.
  2. **2px Neon Flamingo Pink top accent rule** crowning dark slate floating cards (`FIX YOUR CAR`) and underlining dossier headings (`JASON DUVAL`).
  3. **White square rail plate with a 3px pink left vertical edge bar** on active category icons, plus **gold diamond notification pips** on the rail's right edge.
  4. **Photo-framed `PROGRESS` cards** with a crisp 2px white selection outline and dark bottom title band.
  5. **Twilight plum gradient & layered palm silhouettes** on Settings, Profile, and Progress backdrops, plus **thin translucent lavender hairlines** separating list rows and dossier items.
  6. **Pink-filled horizontal bar slider** with a crisp vertical thumb needle, and **pink-dot circular radio buttons**.

## Motion & Interactive Language

- **Transitions**: Sleek modern console-menu snap (`CubicEase` / `PowerEase` 120-200ms) with subtle horizontal left-to-right sweep entrances (echoing the white gradient row sweep and top-bar tab switch) and a restrained crisp `BackEase` (`0.18`) pop on cover hover controls.
- **No invented noise**: Dense library lists and cover grid backdrops stay calm deep plum-charcoal (`#1C1726`); palm silhouettes and twilight gradient haze stay strictly in sparse areas (Settings title band, hero banner dusk scrim, empty game page).
