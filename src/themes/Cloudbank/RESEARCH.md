# Cloudbank: research and sources

Cloudbank is an unofficial Playnite theme inspired by the interface of *Transistor* (Supergiant Games, 2014). It is not affiliated with, endorsed by or sponsored by Supergiant Games. No game art, logo, icon or font is shipped; every value below was measured or read from public captures and then rebuilt as XAML.

Research date: 2026-11-06.

## Sources

| What | Where | Used for |
|------|-------|----------|
| Functions screen (Access Point), 1920x1080 | theaveragegamer.com, "I Really Hate Transistor's Interface", `Transistor-Menu-Interface.jpg` (2014-07-07) | Panel fill, circuit border, section bars, corner brackets, slot-effect colors, body and disabled text |
| Turn() planning HUD, 1920x1080 | same article, `Transistor-Combat-Interface.jpg` | Turn() bar cells and glow, HUD stat labels, enemy name tags |
| New-function screen ("User Level 2 / Access Granted"), 1200x750 | MobyGames Windows screenshot 12293235 | Header band, gold level bar, Confirm button, mint trait text |
| Pause menu, 2560x1440 | WSGF `menu_16x9.png` (Transistor widescreen report) | Menu text, panel black, glow behind the panel, wide-tracked title |
| Steam store screenshots (app 237930) | store.steampowered.com | World palette only (teal city, amber lamps, red Process); no HUD in them |
| Font identification | Game Font Library, `gamefontlibrary.com/games/transistor` | Raleway (main), Ubuntu (secondary), Julius Sans One (tertiary); UI artist credited as Josh Barnett |
| Turn() mechanics | transistor.fandom.com/wiki/Turn() | Planning bar at the top that drains as actions are queued |
| Structure | Playnite Default theme at 10.60 (`scripts/data/playnite-theme-api.json`) | Every XAML file starts from it (MIT, `info/LICENSE-Playnite.txt`) |

Colors were sampled in Chromium from the full-size images (canvas `getImageData`, 9x9 to 13x13 neighbourhoods, then the dominant quantized color of the bright pixels). The captures are JPEG, so values are within roughly ±8 per channel of the game's.

## Measured colors

| Role in the game | Sampled | Token |
|------------------|---------|-------|
| Pause panel, deepest fill | `#010708`, `#020C0D` | `--tr-void` `#020A0B` |
| Functions panel fill | `#031D1D` | `--tr-deep` `#041A1B` |
| Functions panel, lighter area / new-function bg | `#092528`, `#112C2C` | `--tr-panel` `#0A2628`, `--tr-panel-raised` `#112C2C` |
| Turn() queued-action cell | `#00202D` | `--tr-cell` `#00202D` |
| Glow behind the pause panel | `#0E3435` | `--tr-glow` `#0E3435` |
| Pause panel frame line | `#184B4F` | `--tr-frame` `#184B4F` |
| Dim circuit trace | `#108070`, `#0A7961` | `--tr-trace` `#0F6B5E` |
| Lit circuit border (panel edge) | `#40E0C0`, `#50D0C0`, peak `#37FBD4` | `--tr-circuit` `#40E0C0` |
| Confirm button edge | `#3FBC9D` | `--tr-circuit-soft` `#3FBC9D` |
| Turn() bar, remaining planning | `#75FFFB` (core), `#2EB9B3` (falloff) | `--tr-turn` `#75FFFB`, `--tr-turn-dim` `#2EB9B3` |
| Selection corner brackets, MEM pips | `#80D0F0`, `#90E0F0` | `--tr-bracket` `#86D4F0` |
| Function traits ("Disruptive, Reliable"), cost pips | `#B0F0E0` | `--tr-mint` `#B0F0E0` |
| Headings, names, title | `#F0F0F0` | `--tr-text` `#F0F0F0` |
| Body copy | `#90A0A0` | `--tr-text-body` `#90A0A0` |
| Unselected pause-menu item | `#4A8078` | `--tr-text-menu` `#4A8078` |
| Disabled hint ("Already Installed") | `#407070` | `--tr-text-off` `#3E6E6C` |
| MEM section bar | `#30B070` | `--tr-mem` `#30B070` |
| FUNCTIONS section bar | `#F0A050` | `--tr-func` `#F0A050` |
| DETAILS section bar | `#70A0D0` | `--tr-detail` `#70A0D0` |
| Active-slot heading | `#F0D060` | `--tr-active` `#F0D060` |
| Active-slot text | `#C09050` | `--tr-active-text` `#C09050` |
| Upgrade-slot glyph | `#80C0A0` | `--tr-upgrade` `#80C0A0` |
| Passive-slot glyph | `#8080B0` | `--tr-passive` `#8080B0` |
| Function tile frame (gold) | `#908040`, highlight `#C0D080` | `--tr-gold` `#A89448` |
| Unavailable cost pip / Process red | `#E01010`, enemy core `#FB210F` | `--tr-process` `#E8261A` |
| Enemy health bar | `#35C923` | `--tr-health` `#35C923` |

## Typography

- Game Font Library lists **Raleway** as the main face, **Ubuntu** second and **Julius Sans One** third. The captures agree: headings ("Crash()", "User Level 2") are a geometric sans with Raleway's pointed W and tall caps; small labels ("ACTIVE SLOT EFFECT", "FUNCTION", "USER LEVEL") are the same face in bold caps; body copy is a humanist sans. The pause-menu wordmark is wide-tracked thin caps. Not confirmed by Supergiant; treat as a strong match, not a fact.
- Headings use Sora, bundled in `src/Typography/` (Regular, SemiBold, Bold) as the stand-in for Raleway; body `Ubuntu, Segoe UI`.
- Sizes in the game at 1080p: section labels ~22px caps, function names ~30px bold, body ~18px, HUD labels ~15px caps. At Playnite's 14px base that maps to 12 (labels, caps), 14 (body), 20 (names), 29 (title).
- Case: section headers and HUD labels are all caps; names are title case with a trailing `()` (`Crash()`, `Turn()`, `Jaunt()`). WPF has no text-transform, so caps can only be used on the theme's own strings, not on Playnite's localized labels.

## Chrome and component rules

1. **Section header**: a 4x14px colored bar (green MEM, orange FUNCTIONS, blue DETAILS), the label in caps, then a 1px near-white rule across the panel ending in a small circuit flourish on the right.
2. **Panels**: deep teal fill with a 1px lit mint circuit line on the edge plus a soft falloff (the glow is 2 to 3px of the same hue at low alpha), corners square, with short circuit stubs breaking out of the frame.
3. **Selection**: the current function tile is marked by cyan L-shaped brackets just outside its frame (arm length about a quarter of the tile, 2px thick). Nothing fills; the bracket is the selection.
4. **Turn() bar**: a full-width bar at the top. Queued actions are dark cells (`#00202D`) with a 1px dim edge and caps labels `JAUNT()`, `CRASH()`; the remaining budget is a bright aqua fill with a glow. Under it, small caps stats (`USER LEVEL 9`, `LIMITERS 3`, `BONUS 8%`) with the value in mint.
5. **Memory pips**: costs and the MEM meter are drawn as stacks of short horizontal dashes, not continuous bars.
6. **Buttons**: rectangular, at most 2px corners, dark fill, 1px mint edge, white label; hint buttons carry a small glyph before the label. Disabled ones drop to `#407070` text.
7. **Slot glyphs**: tiny geometric marks before headings: orange square (active), green hexagon (upgrade), lavender square (passive).
8. **Enemy tags**: caps name in white bold over a short green health bar with `50/50`.

## Icons

Transistor's function icons are painted art and cannot be reused. The UI glyphs (Playnite's `Icon*` set) are Phosphor **light** (MIT, `info/LICENSE-phosphor.txt`): thin strokes on a 256 grid, close to the game's hairline chrome.

## What the theme takes from this (implementation choices, not facts)

- Window, rail and top bar use `--tr-void`; the library sits on `--tr-deep`; cards and popups on `--tr-panel`/`--tr-panel-raised`.
- Accent (`GlyphColor`) is the Turn() aqua; selection is drawn as the cyan corner brackets (`CornerMarksTemplate`), with the dark Turn() cell as the selected fill.
- Section headings (GroupBox, game page captions) use the colored-bar + rule motif; the game title gets a mint `()` suffix.
- Progress bars and the slider fill use the memory-pip segmentation.
