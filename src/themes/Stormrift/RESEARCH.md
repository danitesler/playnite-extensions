# Stormrift — research & sources

Stormrift is an unofficial fan theme inspired by the menus and HUD of **Heroes of the Storm** (Blizzard Entertainment, 2015). Nothing here reproduces the game's art, logo or font files.

## Sources

| What | Where | Notes |
|------|-------|-------|
| Reference captures | [gameuidatabase.com/gameData.php?id=1338](https://www.gameuidatabase.com/gameData.php?id=1338) | 96 screenshots (1920x1080) viewed in a browser on 2026-11-16 (Title, Mode Select, Options Gameplay/Display/Audio, Modals, Hero Select, Match Results, Profile & Progression, Talents, Collection/Mounts/Bundles, Matchmaking Lobby, In-Game HUD). Nothing downloaded or shipped; colors were sampled from the decoded 1920x1080 images using canvas pixel sampling. |
| Tokens | Sampled from the captures above; stored under `sr-*` in `src/tokens.css` | No official published token package exists. |
| Fonts | No source package names the game's faces | The menus pair a clean, slightly wide geometric sans for headings and buttons with a crisp humanist sans for options/descriptions. **Sora** (SemiBold, Bold; SIL OFL 1.1) is bundled in `src/Typography/` for headings; **Segoe UI** (Windows) / Selawik (preview stand-in) is used for body text. |
| Icons | Drawn in `src/Media.xaml` | Clean 1.8px geometric line/faceted strokes echoing the game's hex/chevron UI language. Menu icons keep Playnite's built-in glyphs, recolored. |
| Motion | Static captures only: no video or frame-step was available | Durations and easing in `BRIEF.md` are designed from the still end states (Ready hover glow, Searching cyan beam, active tab underline) rather than measured from video. |

## Measured values (1920x1080 captures)

| Part (capture index) | Sample | Token |
|----------------------|--------|-------|
| Top navigation bar (`#1`) | `#110626` | `sr-topbar` |
| Sub-navigation strip (`#1`) | `#1a0b37` | `sr-subnav` |
| Ready button idle fill / rim (`#1`) | `#3e2991` / `#7133c6` | `sr-ready` / `sr-ready-edge` |
| Ready button hover fill / rim glow (`#2`) | `#6035d5` / `#a96bf4` | `sr-ready-hi` / `sr-ready-hot` |
| Options modal backdrop top / mid / bottom (`#6`) | `#110b31` / `#1d1635` / `#150e34` | `sr-panel`, `sr-panel-lit`, `sr-panel-deep` |
| Options header bar / outer frame highlight (`#6`) | `#181041` / `#ecf0ff` | `sr-header`, `sr-white` |
| Options nav idle fill / border (`#6`) | `#1a103b` / `#2b1061` | `sr-plate`, `sr-line-dim` |
| Options nav selected fill / ice border (`#6`, `#74`) | `#4d116f` (`#551789` Collection) / `#9ab8fe` | `sr-sel`, `sr-rim-lit` |
| Options Accept button (`#6`) | `#3c237f` | `sr-ready` family |
| Options dropdown / search well (`#8`, `#74`) | `#120c30` / `#120427`, rim `#2a226b` / `#2f215e` | `sr-well`, `sr-line` |
| Checkbox well (`#6`, `#8`) | `#0c0628` | `sr-void` / `sr-well-deep` |
| Slider track / arcane fill / thumb (`#6`, `#8`) | `#0e0d3e` / `#005fb3` / `#ecf0ff` (rim `#05458d`) | `sr-track`, `sr-ally`, `sr-white` |
| Tooltip panel / border / subtitle (`#23`, `#94`) | `#130a36` / `#6f5cae` / `#d0d2ff` | `sr-tooltip`, `sr-rim`, `sr-ice` |
| Top bar idle nav / subnav dim (`#1`) | `#9e99ff` / `#3a2c6a` | `sr-lavender`, `sr-dim` |
| Options body label / dropdown text (`#6`, `#8`) | `#7d9eff` / `#908bf2` | `sr-periwinkle`, `sr-lavender` |
| Matchmaking searching cyan beam / floor ring (`#1`, `#86`) | `#2676ff` / `#2a27fa` | `sr-ally` |
| Top bar Gems / Boost / Gold (`#1`) | `#2fdbff` / `#0fe7d0` / `#fdd61f` | `sr-cyan`, `sr-boost`, `sr-gold` |
| Tooltip Quest gold (`#94`) | `#e4c725` | `sr-gold` |
| HUD Enemy crimson (`#88`) | `#e30045` | `sr-crimson` |
| Collection Legendary / Epic card rims (`#74`) | `#ffe74e` / `#221040` | `sr-gold`, `sr-line-dim` |

Derived (not directly sampled): `sr-void` (`#0a041a`, slightly deeper than `#110626` for outer window chrome and scrims), `sr-plate-hi` (`#291a59`, stepped hover plate between `#1a103b` and `#3e2991`), `sr-plate-press` (`#130b2c`), `sr-ready-press` (`#2b1b6b`), `sr-sel-hi` (`#681e94`, lit hover step of `#4d116f`), `sr-ink` (`#090418`, dark ink for bright teal/gold badges).

## Interface parts observed

- **Top navigation (`#1`, `#2`)**: Dark violet-black bar (`PLAY | COLLECTION | LOOT | WATCH`) with vertical pipe rules (`|`), active item white with a glowing periwinkle/cyan underline bar, sub-navigation strip directly beneath. Right side displays Gold, Gems, Boost (`#0fe7d0`), and portrait/party hex slot.
- **Ready button (`#1`, `#2`, `#86`)**: Wide pointed-hexagonal slab (angled ends at ~45 deg) in violet-indigo (`#3e2991` -> `#6035d5` on hover) with a luminous rim (`#7133c6` -> `#a96bf4`), inner translucent edge, and centered white label. When searching (`#86`), switches to muted indigo ("Cancel Search") over a rising cyan beam.
- **Options modal (`#6`, `#7`, `#8`)**: Deep cosmic indigo panel (`#110b31` to `#1d1635`) with a subtle hex-lattice texture near the top, 1px lavender rim (`#6f5cae`), uppercase white heading (`OPTIONS`), left column of section rows where the active row lights in rich magenta-violet (`#4d116f`) with an ice-blue rim (`#9ab8fe`), right column of sunken dropdowns (`#120c30`), square 18px checkboxes (`#0c0628`), thin sliders with vertical ice-silver capsule thumbs, and bottom `Accept` / `Cancel` pair.
- **Profile modal & tabs (`#55`, `#56`, `#61`)**: Horizontal tab strip (`Summary | Progression | Roster | Match History | Statistics`) over a thin hairline; the active tab has white text and a glowing ice-blue underline bar (`#9ab8fe`). Centerpiece circular Nexus progression ring with concentric glowing rings.
- **Talents & Ability hotbar (`#42`, `#94`)**: Pointy-top hexagon tiles with thin lavender/cyan rims, level numbers (`1, 4, 7, 10, 13, 16, 20`) in vertical stack, and deep indigo tooltips (`#130a36`) with `#6f5cae` borders and `#fdd61f` quest highlights.
- **Collection cards & sidebar (`#70`, `#74`)**: Left sidebar with magenta-selected category (`Featured Mounts`), sharp 1px-bordered dark cards with glowing rarity borders and top-left star (`★`) badges.

## Design rules taken from the captures

- Depth is cosmic violet-indigo (`#0a041a` -> `#120a31` -> `#1b1240`), never neutral grey.
- Sharp 0-2px architectural corners paired with 45-degree pointed hex ends (Ready plate) and pointy-top hexagons (talent/ability buttons, badges).
- Selected states use magenta-purple (`#4d116f`) paired with a bright ice-periwinkle edge (`#9ab8fe`), while primary actions use arcane violet (`#3e2991` -> `#6035d5`).
- Accents are sharply role-separated: violet-indigo for primary actions, magenta-purple + ice-blue for selection, cyan (`#2fdbff`) for focus/links, Boost teal (`#0fe7d0`) for live/running states, Quest gold (`#fdd61f`) for notifications/warnings, and crimson (`#e30045`) for danger/destructive hover.
