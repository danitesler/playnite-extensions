# Neonrust — Visual Research (*RAGE 2*, 2019)

**Source:** *RAGE 2* (Avalanche Studios / id Software / Bethesda Softworks, 2019)  
**Primary archive:** `https://www.gameuidatabase.com/gameData.php?id=204` (50 UI captures across 6 categories)  
**Saved scratch captures inspected visually & pixel-sampled (`scratch/refs/`):**
1. `01-title.jpg` (`RAGE-207012020-093749-66734.jpg`) — Title screen (distressed brush `RAGE` with ringed anarchy `A` + hot magenta `2`)
2. `02-mainmenu.jpg` (`RAGE-207012020-093749-84296.jpg`) — Main Menu (weathered light plaster backdrop, hot magenta dry-brush `CONTINUE GAME` selection bar, dark-to-magenta news column, torn charcoal footer)
3. `03-settings.jpg` (`RAGE-207012020-093752-22607.jpg`) — Video Settings (hot magenta dry-brush active row with `< Borderless >` arrows, segmented dash ticks beneath values, white-over-charcoal tapered sliders, dark help box with hot-magenta inner hairline)
4. `04-pause.jpg` (`RAGE-207012020-093758-65063.jpg`) — Pause Menu (hot magenta header + dry-brush `RESUME GAME` bar, dimmed `STATISTICS`)
5. `05-inventory.jpg` (`RAGE-207012020-094122-69560.jpg`) — Inventory / Wingstick Datapad (deep oxidized petrol-teal canvas, gunmetal top bumper tabs with glowing yellow-and-magenta active `INVENTORY` flare, 45° chamfered rows in 1px Ranger seafoam-teal snapping to blazing Solar Yellow `#FFD600` + black ink when selected, `+` registration crosshairs in preview box, bruised magenta-plum scratched `WINGSTICK` card header, crimson `UNLOCKS AT LEVEL 2` band, ambient bottom-left magenta & bottom-right teal edge glow)
6. `06-skills.jpg` (`RAGE-207012020-094126-11291.jpg`) — Projects / Tiers Skill Tree (left vertical chamfered tier rail with glowing yellow active chevron tab, chamfered teal skill slots, `HOLD TO PURCHASE` elongated trapezoid button)
7. `07-codex.jpg` (`RAGE-207012020-094120-83657.jpg`) — Log / Characters Codex (left chamfered index list, far-left glowing yellow tab + hot magenta `*` badge, 1px teal-framed `INFORMATION / CROSS` dossier with yellow headline, crimson-magenta `!` intel diamond)
8. `08-hud.jpg` (`RAGE-207012020-094117-58808.jpg`) — Gameplay HUD (overdrive `x2` in hot magenta, glowing Feltrite blue pickups `#1496FF`, crimson health bar, orange-yellow `ENTERING REGION` banner, magenta `!` objective pip)
9. `09-modal.jpg` (`RAGE-207012020-093756-75350.jpg`) — Intel Attained Modal (translucent dark band framed by crisp 1px horizontal cyan hairlines, amber `INTEL ATTAINED`, neon-lit `BANDIT FLYER`, green `A CONFIRM`)
10. `10-quests.jpg` (`RAGE-207012020-093802-43213.jpg`) — Stanley Express Vendor (hot magenta torn banner, kraft paper / black split, Solar Yellow `SAND WORM INVASION`, seafoam-teal `IN STOCK` / `CASH`, magenta dry-brush `BUY x1`)

## Value Ladder & Measured Palette (Pillow pixel samples)

RAGE 2 is **not** a generic neutral-charcoal sci-fi UI. Its Ranger Datapad ground is a distinctly weathered, cool **oxidized petrol-teal** (`#101C1B`–`#182926`), energized by a disciplined tri-accent hierarchy (~88% petrol ground/slate/ink, ~12% controlled neon):

| Role | Measured Source Hex | Capture Reference | Neonrust Token |
|---|---|---|---|
| Deepest bezel / input wells | `#0B1313` / `#0F0705` | `05-inventory.jpg` preview well | `--nr-void: #0B1313` |
| Datapad canvas ground | `#101C1B`–`#182926` | `05-inventory.jpg` center canvas | `--nr-ground: #101C1B` |
| Raised datapad surface / rail | `#152423` | `06-skills.jpg` panel surface | `--nr-surface: #152423` |
| Elevated control / plate | `#1D312F` | `05-inventory.jpg` level slots | `--nr-surface-hi: #1D312F` |
| Inactive bumper tab metal | `#374B47`–`#466259` | `05-inventory.jpg` top tab bar | `--nr-tab-metal: #374B47` |
| Structural 1px wireframe | `#2A695E` | `05-inventory.jpg`, `07-codex.jpg` | `--nr-teal-dim: #2A695E` |
| Ranger seafoam-teal accent | `#4CC7AD`–`#55D1B5` | `05-inventory.jpg` row text/strokes | `--nr-teal: #4CC7AD` |
| Selected slab / active headline | `#FFD600` | `05-inventory.jpg` `WINGSTICK`, `07-codex.jpg` `CROSS` | `--nr-yellow: #FFD600` |
| Hot active tab core | `#FFF04D`–`#FFFF81` | `05-inventory.jpg` `INVENTORY` tab | `--nr-yellow-bright: #FFF04D` |
| Hot punk magenta (brush / flare) | `#FF00AE`–`#FE00AD` | `02-mainmenu.jpg`, `03-settings.jpg`, `05-inventory.jpg` | `--nr-magenta-neon: #FF00AE` |
| Play CTA / readable magenta plate | `#C80085` (hover `#E20096`) | Derived for >= 4.7:1 white text contrast | `--nr-magenta: #C80085` |
| Bruised magenta-plum header wash | `#591B3A`–`#632235` | `05-inventory.jpg` `WINGSTICK` header band | `--nr-magenta-wash: #591B3A` |
| Authority crimson (danger / locks) | `#C81D3A`–`#AA1136` | `05-inventory.jpg` `UNLOCKS AT LEVEL 2`, `08-hud.jpg` HP | `--nr-crimson: #C81D3A` |
| Intel amber-orange | `#F5A623` | `09-modal.jpg` `INTEL ATTAINED` | `--nr-amber: #F5A623` |
| Feltrite electric blue (running) | `#1B72E8` | `08-hud.jpg` Feltrite crystal / X prompt | `--nr-feltrite: #1B72E8` |
| Primary body ink | `#E2ECEA`–`#B8C0BF` | `05-inventory.jpg`, `07-codex.jpg` descriptions | `--nr-ink: #E2ECEA` |
| Muted petrol-sage text | `#82A6A0` | `05-inventory.jpg` inactive counters | `--nr-ink-muted: #82A6A0` |
| Ink on Solar Yellow slabs | `#091110` | `05-inventory.jpg` `WINGSTICK` / `07-codex.jpg` `CROSS` | `--nr-ink-dark: #091110` |

## Material & Edge Anatomy
- **Asymmetric 45° chamfered geometry:** Inventory & Log list rows (`05-inventory.jpg`, `07-codex.jpg`) cut **top-left and bottom-right** corners at 45° (8px bevel) with crisp 1px Ranger seafoam-teal wireframes. Confirmation buttons (`HOLD TO PURCHASE`, `CHANGE SKIN`) use symmetrical trapezoid-chamfered sides.
- **Dry-brush punk spray texture:** Selection bars in Main Menu / Pause / Settings (`02-mainmenu.jpg`, `03-settings.jpg`, `04-pause.jpg`) and Stanley Express (`10-quests.jpg`) are raw horizontal dry-brush strokes with frayed bristle tips—never flat pill rectangles.
- **Weathered datapad surface tooth:** Datapad screens carry a faint geometric triangular/diamond mesh overlay, subtle glass scuffing, and atmospheric ambient color bleed (magenta from bottom-left, teal from bottom-right).
- **Scratched magenta header bands:** Detail cards (`WINGSTICK` in `05-inventory.jpg`) top a 1px teal container with a distressed plum-magenta band holding bold Solar Yellow uppercase titles.
- **Registration crosshairs (`+`) & stepped ticks:** Preview panels use tiny `+` crosshairs in corners (`05-inventory.jpg`); Settings options use small segmented dash pips beneath values (`─ ─ ■ ─`) and crisp tapered white-on-charcoal slider bars (`03-settings.jpg`).

## Typography Voice
- **Display & UI Headers (`HeadingFontFamily`):** **Chakra Petch** (SIL OFL-1.1, Google Fonts `ofl/chakrapetch`, bundled in `src/Typography/` as static `Regular`, `SemiBold`, `Bold`). Its 45°-chamfered square bowls mirror *RAGE 2*'s exact `WINGSTICK` / `CROSS` / `TORN PLAINS` / `PROJECTS` display lettering. Uppercase with tight-to-medium tracking on titles and section headers.
- **Body & Lists (`FontFamily`):** `Segoe UI` (Windows native; mapped to bundled OFL `Selawik` in HTML previews) for effortless readability across long game descriptions, metadata prose, and Settings trees.
- **Monospace / Counters / Keycaps (`MonospaceFontFamily`):** `Consolas` (Windows native; mapped to `Cascadia Mono` in previews) for tabular scores, counts, and menu shortcuts.

## Observed UI Parts & States
- **Top bumper strip (`05-inventory.jpg`, `06-skills.jpg`):** Oxidized gunmetal chamfered tabs (`MAP`..`VEHICLES`); active tab explodes into blazing yellow core + hot magenta spray halo.
- **Left rail vertical pips (`06-skills.jpg`, `07-codex.jpg`):** Slender vertical chamfered segments along the far-left margin; active segment lights solid Solar Yellow with a left-edge glow.
- **List rows (`05-inventory.jpg`, `07-codex.jpg`):** Idle = dark petrol fill, 1px teal chamfered wireframe, teal label. Hover = brighter teal wash + hot-teal rim. Selected = solid blazing Solar Yellow (`#FFD600`) fill with pitch-black ink text.
- **Settings controls (`03-settings.jpg`):** Active row wrapped in hot-magenta dry-brush bar with `<` `>` chevrons; white-filled tapered horizontal sliders; dark info boxes framed by a crisp hot-magenta inner hairline.
- **Modals & dividers (`09-modal.jpg`):** Crisp 1px horizontal cyan lines framing dark smoked bands with amber/yellow headings and subtle magenta center flares.
