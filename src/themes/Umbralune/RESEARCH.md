# Umbralune — Visual Research (*Bayonetta 2*)

Source gallery: [Game UI Database — Bayonetta 2 (`id=215`)](https://www.gameuidatabase.com/gameData.php?id=215) (PlatinumGames / Nintendo, 2014).

## 1. Captured Reference Screens (Session Scratch)

All 8 full-resolution lightbox captures were saved to the session scratch folder (`refs/`) and inspected pixel-by-pixel with Pillow/NumPy:

| Ref | Screen | Direct Image URL | Avg Lum | Key Visual Takeaways |
|---|---|---|---|---|
| `title.png` | Title Screen | `https://www.gameuidatabase.com/uploads/Bayonetta-207162020-043231-26430.jpg` | 22.6 | Astral midnight sapphire sky (`#04173A` → `#000307`), concentric glowing sapphire-cyan Umbran crescent watch (`#3781AF` / `#5AB0E9`) etched with Enochian rings, blazing Solar Gold `"2"` (`#EBB728` → `#FEFE55`) with horizontal star-flare, swept baroque display lettering (`PRESS ANY BUTTON` in `#205FAB` / `#2774BA`). |
| `options.png` | Options — Sound | `https://www.gameuidatabase.com/uploads/Bayonetta-207162020-043232-87246.jpg` | 19.7 | Deep midnight sapphire backdrop (`#031237` / `#081F48`) with cobalt nebula smoke (`#082C76` / `#12398A`) and centered circular Umbran Watch watermark. `OPTIONS` header crowned by crescent-cross glyph and luminous ice-cyan horizontal flare (`#9CDDF0` / `#B9ECF9`). Left nav rows sit in rune-etched feathered sapphire bands; active `Sound` row erupts into an electric cyan beam (`#2F8EC8` → `#97F4FB`). Metallic gold-bronze slider rails (`#8E7950`) carry vertical faceted **silver-chrome diamond thumbs inset with sapphire gems**. `Voice Language` uses `< English >` triangular arrowheads. |
| `pause.png` | Pause Menu | `https://www.gameuidatabase.com/uploads/Bayonetta-207162020-043311-90558.jpg` | 67.6 | Translucent indigo-sapphire smoke veil (`#101E41` / `#152859`) with drifting glyph motes; `PROLOGUE` in glowing ice-cyan serif; textured violet-magenta `HARD` rune ribbon (`#4A2E60` / `#78336F`); glowing cyan (`#87E5FB`) vs periwinkle geometric icons (`Play` / `Skip`); circular silver `(A) OK (B) Cancel` badges. |
| `chapter.png` | Chapter V Select | `https://www.gameuidatabase.com/uploads/Bayonetta-207162020-043235-88029.jpg` | 80.2 | Cream-gold serif `CHAPTER V / The Cathedral of Cascades` over a glowing geometric cyan diamond-lattice, violet-magenta `HARD` rune ribbon, and a **midnight-sapphire & gold filigree Tarot Card** centered inside a glowing cyan Umbran rune ring flanked by `<` `>` cyan arrows. |
| `hud.png` | Combat HUD | `https://www.gameuidatabase.com/uploads/Bayonetta-207162020-043516-65289.jpg` | 68.4 | Silver-chrome crescent HP bars with sapphire gem orb and luminous **mint-jade HP fill (`#83B49F` / `#9AD2BC`)**, 8 dark-rimmed **amethyst-violet Magic Orbs (`#7B59AE` / `#9A71CF`)**, top-center **aqua-cyan Umbran Climax halo (`#29C2DA` / `#43E6EC`)**, spiky indigo-violet Combo Score blades (`#7184B7` / `#9DA4DC`), golden serif `VERSE 1` & Halo counter (`#D1AE60` / `#E1C16A`), and magenta-crimson Infernal Boss HP bar (`#C13265` / `#E54181`). |
| `dialogue.png` | Gates of Hell Shop | `https://www.gameuidatabase.com/uploads/Bayonetta-207162020-043307-79724.jpg` | 72.5 | Arching brushed blue-steel Umbran clockwork ring with etched indigo runes; bottom sculpted chrome gothic thorns centered on a **faceted crimson Ruby gem (`#CB2120` / `#F33431`)**. |
| `loadout.png` | Character Loadout | `https://www.gameuidatabase.com/uploads/Bayonetta-207162020-043309-68336.jpg` | 115.2 | Aged grimoire parchment (`#C0A97B` / `#CBB68F`) with dark walnut leather straps (`#6B4216`), `<` `>` stepper caps, luminous sunlit cream-gold active row (`#FADE98` / `#FDF4B7`), golden circular seal behind items, crimson headings (`#5F1E06`), and ornate vertical carved-gold scrollbar. |
| `codex.png` | Angelic Hymns Codex | `https://www.gameuidatabase.com/uploads/Bayonetta-207162020-043513-54418.jpg` | 97.3 | Leather-bound grimoire with pinned distressed ribbon banners, delicate gold filigree lace edge trim, and clean humanist body text. |

## 2. Measured Value Ladder & Accent Budget

Bayonetta 2's defining visual shift from Bayonetta 1 (crimson/black) is its **Nocturnal Umbran Sapphire** identity—deep celestial midnight blues rather than flat neutral charcoal (`#0D0F14` is forbidden):

- **Deepest Ground (Abyssal Night):** `#030918` (window frame, sunken wells)
- **Primary Canvas (Midnight Sapphire):** `#06112A` (library ground, game page, settings body)
- **Elevated Surface (Astral Indigo):** `#0C1D42` (cards, tarot metadata pane, popup menus, panels)
- **Raised Plate / Control Surface (Royal Sapphire):** `#122A5B` (buttons, inactive rune bands, hover surfaces)
- **Secondary Chrome Rim:** `#254A8A` (hairlines, filigree rails, inactive borders) and antique gold filigree `#B89342`
- **Primary Ink (Starlight Ice):** `#EBF5FF` (body copy, high-contrast labels, >14:1 on `#06112A`)
- **Muted Ink (Moonlit Periwinkle):** `#8FAAD4` (metadata captions, inactive nav, ~7.3:1 on `#06112A`)
- **Accents (disciplined ~10–12% screen area):**
  - **Electric Moon-Cyan (`#3CCBFF` / `#8BF0FF`)** — active navigation beam (`options.png`), focus flares, hover illumination, selected covers/rows.
  - **Solar Halo Gold (`#EAB832` / `#F9D86B`)** — hero Play CTA (echoing the Title Screen's blazing `"2"`), tarot filigree crests, gold Halo scores/playtime.
  - **Witch-Time Amethyst (`#9842F5` / `#B975FF`)** — launching/running indicator (`RunningIndicatorBrush`), `HARD` rune ribbons (`#5A2770`), magic orbs.
  - **Mint-Jade HP (`#48D69B`)** — `ProgressBar` / `PART_ProgressGlobal` vitality bar.
  - **Gates-of-Hell Ruby (`#D9283B` / `#F24455`)** — danger/Exit (`Alt+Q`), `SidePanelCloseButton` hover, `PART_ToggleFilter` active ruby diamond pip.

## 3. Material & Edge Anatomy

- **Atmospheric Sapphire Smoke & Watch Watermark:** Surfaces aren't flat plastic boxes—they float in midnight sapphire mist (`nebula-smoke.png`) over a ghostly circular Umbran clockwork dial (`watch-watermark.png`).
- **Feathered Rune Bands (`rune-band.png`):** Active options rows, menu highlights, and `HARD` ribbons feather horizontally at both ends and carry subtle rows of geometric Enochian micro-runes.
- **Optical Lens-Flare Rules (`flare-beam.png`):** Headers (`OPTIONS`) and major horizontal splits sit on a hairline punctuated by a razor-sharp cyan/ice optical flare streak rather than heavy 3px solid bars.
- **Beveled Silver-Chrome & Gold Filigree:** Sliders wear brushed bronze-gold rails and vertical faceted silver diamond thumbs with sapphire cores; tarot panels carry crisp 1px outer sapphire rims with inset antique-gold corner filigree and vertical lace (`filigree-border.png`).
- **Zero Heavy Box Shadow Clutter:** Bayonetta 2 relies on luminance, thin metallic rims, and feathered light beams—no drop shadows, no thick SaaS borders around every field.

## 4. Typography Voice

- **Display / Titles (`HeadingFontFamily`):** **`Cinzel Decorative`** (SIL OFL 1.1, Natanael Gama, Reserved Font Name `'Cinzel'`, shipped unmodified in `src/Typography/`). Its swept, flared baroque-serif terminals and regal capitals echo the `BAYONETTA`, `OPTIONS`, `PROLOGUE`, and `VERSE 1` lettering while staying sharp and legible at 18–32px.
- **Body / Dense UI (`FontFamily`):** **`Jost`** (SIL OFL 1.1, already bundled in `scripts/fonts/jost/`, Regular + Medium) falling back to `Segoe UI`. Mirrors the clean, circular-bowl single-storey geometric humanist sans used in `options.png` (`Controller`, `Effects Volume`, `Adjust sound volume settings.`) and `loadout.png` descriptions.
- **Case & Tracking:** Display titles use natural/title case or tracked small-caps where appropriate (`OPTIONS`, `SETTINGS`, `PLAY`); dense lists, Settings tree rows, metadata values, and descriptions stay natural sentence case in `Jost` (never uppercase monospace micro-labels).

## 5. Observed UI Parts & State Transitions

- **Idle -> Hover -> Selected (Options nav, `options.png`):** Calm dark-sapphire translucent strip -> soft sapphire-cyan illumination + subtle rune reveal -> full electric moon-cyan luminous horizontal beam (`#145CB4` → `#38D2FF`) with bright ice-white text and twinkling cyan diamond spark.
- **Buttons / Play (`title.png`, `pause.png`):** Solar Gold command plate with filigree crescent end-notches -> horizontal cyan-and-gold lens-star flare sweeps across on hover -> crisp metallic inset press.
- **Sliders (`options.png`):** Grooved antique-gold rail + tall silver diamond thumb with sapphire gem; hover illuminates the gem to ice-cyan and lifts the diamond sheen.
- **Running / Witch Time (`hud.png`):** Launching triggers an amethyst clockwork sweep (`climax-sweep.png`) + filling bottom foot bar + 3 igniting Magic Orbs; running settles into a slow regal Witch-Time amethyst pulse (2.8s).
