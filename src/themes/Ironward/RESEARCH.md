# Ironward — research & sources

Ironward is an unofficial fan theme inspired by the menus, codex, and HUD of **DOOM: The Dark Ages** (id Software / Bethesda Softworks, 2025). Nothing here reproduces the game's art, logos, emblems, or proprietary font files.

## Sources

| What | Where | Notes |
|------|-------|-------|
| Reference captures | [gameuidatabase.com/gameData.php?id=2212](https://www.gameuidatabase.com/gameData.php?id=2212) | 61 cataloged screenshots (1920x1080 JPG) inspected on 2026-11-16 (`02-menu`, `03-difficulty`, `08-settings-gameplay`, `09-settings-display`, `13-modal`, `20-pause`, `28-loadout`, `35-upgrade-browse`, `36-upgrade-tree`, `45-codex`, `51-hud`, `52-boss`). Exact colors were sampled from decoded pixel regions in Python (`scratch/sample.py`). |
| Tokens | Sampled from the captures above; stored under `--iw-*` in `src/tokens.css` | No official published token package exists. |
| Fonts | Classical engraved uppercase serif headings + clean humanist UI body | Section titles, tabs, and modal headers (`GAME`, `DIFFICULTY`, `SENTINEL SHRINE`, `ARSENAL`, `COMBAT ASSISTANCE`) match **Cinzel** (Regular 400, Bold 700; SIL OFL 1.1) bundled in `src/Typography/`. Body labels, option descriptions, and controls use **Segoe UI** (Windows) with **Selawik** as the preview stand-in. |
| Icons | Drawn in `src/Media.xaml` | Crisp geometric ironwork strokes with spearhead/chevron tips and diamond finials inspired by the Settings tab strip, Arsenal nav bar, and HUD prompts. Playnite menu icons keep Playnite's built-in glyphs, recolored. |
| Motion | Static captures; motion language built from the source's forge & shield motifs | Fast forged settles (`110ms`), ember/teal wash fades (`180ms`), smooth exit cooling (`300ms`), and Armor Jade shield-sweep running/launching motion (`1.6s` sweep / `3.2s` idle pulse). |

## Measured values (1920x1080 captures)

| Part (capture) | Sample | Token | Contrast / Note |
|----------------|--------|-------|-----------------|
| Deep verdigris-iron frame (`08-settings-gameplay`, `35-upgrade-browse`) | `#041517` | `iw-void` | Window chrome, sidebar rail, outer void |
| Header / title band (`08-settings-gameplay`, `28-loadout`) | `#092123` | `iw-chrome` | Top bar, StandardWindowStyle title band |
| Abyssal verdigris page surface (`08-settings-gameplay`, `03-difficulty`) | `#0f2123` | `iw-surface` | Library content layer, game page root (`14.85:1` with bone text) |
| Elevated slate panel / modal (`13-modal`, `03-difficulty`) | `#15292c` | `iw-panel` | Metadata pane, popups, tooltips, cards (`13.52:1` with bone text) |
| Control well / section header band (`08-settings-gameplay`) | `#193134` | `iw-well` | Inputs, resting buttons, `GAMEPLAY` / `WEAPON` bars (`12.24:1` with bone text) |
| Sea-steel hover wash (`03-difficulty` *Hurt Me Plenty*) | `#25484c` | `iw-hover` | Hovered rows, secondary button hover (`8.88:1` with bone text) |
| Sea-steel hover border / active slider (`03-difficulty`) | `#579390` / `#699fa0` | `iw-sea-teal` | Slider active track, hover plate outline |
| Spearhead silver-teal rule & finial (`08-settings-gameplay`, `20-pause`) | `#8ba8aa` / `#b5d0d2` | `iw-rule` / `iw-rule-lit` | Horizontal spear-tipped rules, modal corner barbs, diamond splitters |
| Hairline border & card rim (`08-settings-gameplay`, `36-upgrade-tree`) | `#2d4d50` / `#3f6468` | `iw-hairline` / `iw-border` | Panel seams, resting control borders |
| Primary text bone-ivory (`08-settings-gameplay`, `13-modal`) | `#eef3f2` | `iw-bone` | Primary labels, headings, button text |
| Muted frost-teal text (`08-settings-gameplay`, `13-modal`) | `#bdd6d7` / `#9cb9bb` | `iw-mist` / `iw-muted` | Descriptions, metadata captions (`10.91:1` / `7.27:1` on panel) |
| Molten forge ember rim (`02-menu`, `08-settings-gameplay`, `13-modal`) | `#e17239` / `#f98851` | `iw-ember` / `iw-ember-lit` | Selection outline, focus rim, active tab chevron glow (`5.93:1` dark on `#e17239`) |
| Molten forge solid plate (`02-menu`, `03-difficulty`, `13-modal`) | `#822f0e` / `#9e3b12` | `iw-ember-deep` / `iw-ember-aa` | Play button rest (`7.93:1`) & hover (`6.07:1`), selected row plate (`#6b2810`) |
| Pressed forge plate | `#5c2008` | `iw-ember-press` | Play & primary button pressed state |
| Gold shrine triangle (`28-loadout`, `51-hud`) | `#d4a238` / `#f3c75a` | `iw-gold` / `iw-gold-lit` | Filter active diamond pip, upgrade/star ratings |
| Armor Jade HUD chevron (`51-hud`) | `#3db56e` / `#4bca7d` (tuned `#1d7a47` fill) | `iw-jade` / `iw-jade-lit` | Dedicated `RunningIndicatorBrush` (`4.77:1` bone text on `#1d7a47` fill) |
| Health Steel-Blue HUD chevron (`51-hud`) | `#5188bc` | `iw-steel-blue` | Link accents on dark surfaces |
| Boss / Locked crimson (`13-modal`, `52-boss`) | `#a82c32` / `#ff565d` | `iw-crimson` / `iw-crimson-lit` | `DangerBrush` (`6.10:1` with bone text), negative rating |

## Interface parts observed

- **Top navigation strip (`08-settings-gameplay`, `35-upgrade-browse`)**: Full-width dark verdigris bar (`#092123`) closed by a thin `#8ba8aa` horizontal rule whose ends flare into sharp spear-tips; the active tab sits over a burning ember V-notch chevron (`#f98851` / `#e17239`).
- **Spear-tipped selection plates (`02-menu`, `03-difficulty`, `08-settings-gameplay`, `13-modal`)**: Elongated hexagonal/spear-tipped bars (`Campaign`, `Aspiring Slayer`, `Daze Highlight`, `Accept`) — molten ember fill fading horizontally with bright copper-orange top/bottom rims and glowing tip flares when selected/active; cooler sea-teal (`#25484c` / `#579390`) when hovered.
- **Corner-winged modal & inspect frames (`13-modal`, `20-pause`, `36-upgrade-tree`)**: Rectangular slate-verdigris panels (`#15292c`) crowned and footed by 1px `#8ba8aa` rules whose corners flare outward into tiny barbed spearhead wings.
- **Section header slate wash (`08-settings-gameplay`)**: Left-anchored gradient slate band (`#193134` fading right) carrying tracked uppercase `Cinzel` section headings (`GAMEPLAY`, `WEAPON`, `ACCESSIBILITY`).
- **Diamond-finial vertical rule (`08-settings-gameplay`)**: Thin silver-teal vertical divider topped by a 4-point diamond star (`❖`) and ended with a split-feather tail.
- **Difficulty modifier slider (`03-difficulty`)**: Dark recessed iron track (`#193134`) with glowing sea-teal fill (`#579390`) and a crisp rotated diamond thumb.
- **Diamond pagination pips & option arrows (`08-settings-gameplay`, `13-modal`)**: Hollow silver-teal diamonds (`◇`) turning molten ember (`◆`) when active; left/right spearhead chevrons (`◀ ▶`) flanking option controls.
- **Boss & Challenge bars (`51-hud`, `52-boss`)**: Chamfered dark iron tracks with sharp `1px` silver-teal outlines and glowing fill (`#579390` / `#3db56e` / `#ff565d`).
- **Armor & Health HUD chevrons (`51-hud`)**: Flanking emerald-green (`#3db56e`) Armor and steel-blue (`#5188bc`) Health chevron wings around the central Slayer helm crest.

## Design rules taken from the captures

- **Dark verdigris-iron hierarchy**: Deep void chrome (`#041517`/`#092123`), calm abyssal teal-slate workspace (`#0f2123`), and mottled iron panels (`#15292c`) — never pure `#000000` black or generic neon sci-fi cyan.
- **Spearhead geometry & crisp 2px chamfers**: Rectangular panels and controls stay razor-sharp (`0-2px` corners) accented by 45-degree spear-tipped plates, diamond finials, and outward-flared corner barbs — never rounded pills.
- **Strict color separation**: Molten Ember (`#822f0e`/`#e17239`/`#f98851`) owns primary selection, active focus, and Play; Sea-Steel (`#25484c`/`#579390`) owns hover and sliders; Armor Jade (`#1d7a47`/`#3db56e`) is reserved exclusively for live running/launching game states; Shrine Gold (`#d4a238`) marks active filters and ratings.
