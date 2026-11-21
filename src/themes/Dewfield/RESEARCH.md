# Dewfield — Reference Research (Stardew Valley)

Source archive: [Interface In Game — Stardew Valley](https://interfaceingame.com/games/stardew-valley/) (24 full-resolution 2560×1440 / 3840×2160 captures inspected and pixel-sampled on 2026-11-21).

## Captures Inspected

| Capture | URL | UI Elements Measured |
|---------|-----|----------------------|
| Inventory (`inventory.png`, 2560×1440) | `https://interfaceingame.com/screenshots/stardew-valley-inventory/` | 3-step cedar bevel window frame, recessed inventory tool slots, stepped top folder tabs (active tab drops down into frame), red `X` close tile, item tooltip box, bottom-right energy bar |
| Store (`store.png`, 2560×1440) | `https://interfaceingame.com/screenshots/stardew-valley-store/` | Stacked butter-parchment item rows with mahogany rules, vertical wood-and-cream scrollbar with orange arrows & thumb, gold coin badges, portrait frame, red `X` close tile |
| Journal (`journal.png`, 2560×1440) | `https://interfaceingame.com/screenshots/stardew-valley-journal/` | Rolled cream parchment scroll header (`Journal`), hovered toasted-apricot list row, wooden pixel pointer cursor, `NEW!` golden-amber badge, `DONE` meadow-green badge |
| Calendar (`calendar.png`, 2560×1440) | `https://interfaceingame.com/screenshots/stardew-valley-calendar/` | Horizontal dark walnut plank notice board (`#522E08` / `#5E360C` / `#734414`), cream pinned sheet (`#FBEBC2`), centered steel thumbtack pin, warm tooltip box |
| Skill Level (`skill-level.png`, 2560×1440) | `https://interfaceingame.com/screenshots/stardew-valley-skill-level/` | Stepped top tabs, segmented 4+1 wooden skill-level pip meters with ruby-crimson filled blocks (`#DD003B`), tucked wallet sub-panel |
| Create Character (`create-character.png`, 2560×1440) | `https://interfaceingame.com/screenshots/stardew-valley-create-character/` | Sunken parchment text inputs, grooved wooden sliders with amber knobs, square dark-rimmed checkbox, meadow-green `OK` bevel button (`#236111`), wooden `BACK` arrow signpost |
| Pelican Town Map (`pelican-town.png`, 2560×1440) | `https://interfaceingame.com/screenshots/stardew-valley-pelican-town/` | Double-bevel wooden map frame, rolled bottom ribbon (`Pelican Town`), top-right brass/wood clock HUD + gold bar + golden `!` quest button, bottom-right vibrant green Energy bar (`E`) |
| Main Menu (`main-menu.png`, 3840×2160) | `https://interfaceingame.com/screenshots/stardew-valley-main-menu/` | Deep azure-to-turquoise sky (`#01458B` → `#025DB5` → `#64E8E2`), wooden plank signboard with spring leaves, pale-cream bevelled title buttons (`NEW`, `LOAD`, `CO-OP`, `EXIT`) |

## Measured Color Palette

Sampled directly from the lossless PNG captures above:

| Role | Source Element | Measured Hex | Dewfield Token |
|------|----------------|--------------|----------------|
| Deep mahogany outer outline | Every UI frame, button, HUD, energy tube | `#5B2B2A`, `#44121C` | `--df-wood-outline`, `--df-ink-deep` |
| Body & heading ink | Store, Journal, Dialogue text | `#56160C` | `--df-ink` |
| Muted wood ink | Secondary captions, recessed labels | `#802F03` → `#7A3410` | `--df-ink-muted` |
| Walnut notice board (dark) | Calendar plank board shadow & base | `#402202`, `#522E08` | `--df-walnut-deep`, `--df-walnut` |
| Walnut notice board (mid/grain) | Calendar horizontal timber planks | `#5E360C`, `#734414` | `--df-walnut-mid`, `--df-walnut-plank` |
| Cedar bevel shadow | Lower/right bevel rim on all panels | `#853605` | `--df-cedar-shadow` |
| Cedar mid timber | Primary wood frame body | `#B14E05` | `--df-cedar` |
| Cedar top highlight | Upper/left lit bevel edge | `#DC7B05` | `--df-cedar-hi` |
| Sun-amber accent | Scrollbar thumb, slider knob, bright bevel | `#FA9305` | `--df-amber` |
| Quest notification gold | `!` badge under clock, `NEW!` highlight | `#FFCA28`, `#FFC200` | `--df-quest-gold` |
| Cream parchment (bright) | Calendar sheet, rolled scroll, bright buttons | `#FBEBC2`, `#FFF0BA` → `#FFF2CC` | `--df-cream` |
| Honey parchment (page) | Softened sunlit page sheet for calm lists | `#FCE3A8` | `--df-parchment-page` |
| Golden parchment (ledger) | Store / Journal / Dialogue interior | `#FFD284` | `--df-parchment` |
| Warm apricot (recessed) | Inventory slots, secondary recessed wells | `#F7B870`, `#F2BE72` | `--df-parchment-well` |
| Toasted honey (hover/selected) | Journal hovered row, sunken wood slot | `#F5B75D`, `#E09650`, `#F2A844` | `--df-honey-hover`, `--df-slot-wood`, `--df-selected` |
| Harvest meadow green | `OK` button (`#236111`), `DONE` badge (`#008000`/`#32AD14`), Energy bar (`#43FF00`) | `#1E6E19` (base), `#227C1D` (hi), `#47C432` (bevel), `#32AD14` (energy) | `--df-meadow`, `--df-meadow-hi`, `--df-meadow-bevel`, `--df-energy` |
| Crimson close & skill ruby | Red `X` close (`#D43200`), Skill pip (`#DD003B`) | `#B8240E` (plate), `#D43200` (glyph), `#DD003B` (ruby) | `--df-crimson`, `--df-crimson-glyph`, `--df-ruby` |
| Starwater sky blue | Main menu zenith & Pelican Town river (`#0153A4`, `#3C80C1`) | `#1162A8` (base), `#3FA3E8` (highlight) | `--df-sky-run`, `--df-sky-hi` |

## Typography

- **Source**: Custom pixelated chunky serif/humanist display font for menu titles, scrolled banners, and signboard buttons (`Journal`, `Pelican Town`, `LOAD`); clean crisp dark-brown body copy in dialogues, descriptions, and item stats.
- **Dewfield mapping**:
  - `HeadingFontFamily`: `./Typography/#Pixelify Sans, Pixelify Sans, Segoe UI` (bundled OFL-1.1 static `PixelifySans-Regular.ttf` in `src/Typography/`, also registered in `scripts/data/fonts.json` for identical preview rendering).
  - `FontFamily`: `Segoe UI` (mapped to bundled `Selawik` in previews) — preserves crisp readability across long game descriptions, metadata labels, and Settings trees while `Pixelify Sans` carries titles, scroll headers, buttons, and section marks.
  - `MonospaceFontFamily`: `Consolas` (mapped to `Cascadia Mono` in previews) for hotkey chips and version/install path readouts.

## Chrome, Plates & Motion Language

- **3-Step Pixel Wood Bevel**: Every container uses a sharp `2px` outer dark-mahogany border (`#5B2B2A`), a `2px` cedar timber band (`#B14E05`), and directional inner bevel lines (`#DC7B05` top/left highlight, `#853605` bottom/right shadow). Corner radius stays tight (`2px–4px` outer, `0px–2px` inner) to preserve the pixel-crafted timber silhouette.
- **Stepped Folder Tabs**: Inactive tabs sit recessed on dark walnut; the active tab drops down and fills with bright honey-parchment (`#FFD284`) with a top gold highlight, visually fusing with the content below.
- **Inventory Slots**: Square recessed warm wood cells (`#E8AA5D`) with top-left dark bevel shadow and bottom-right light catchlight; hovered slots gleam golden-amber, selected slots lock with a bold `2px` crimson-ruby hotbar outline (`#D43200` / `#B8240E`) and corner pixel studs.
- **Motion**: Crisp, cozy, tactile — snappy `110ms` hover warm-ups, playful `180ms` `BackEase` spring-pops on Play hover and selection locks, subtle `2px` wooden pointer slides on list/menu rows, and gentle `3.2s` starwater-blue shimmer loops for live running indicators. No neon cyber glows or heavy blur filters.
