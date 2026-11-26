# Umbralune — Creative Brief (`Showcase`)

Unofficial *Bayonetta 2*-inspired nocturnal Umbran sanctuary desktop theme. Measurements and visual references: [RESEARCH.md](RESEARCH.md).

## 1. Candidate Lenses -> Pick 1

Last 5 themes in `src/themes/AGENTS.md` / `src/extensions.json`:
- `Baylight 27` (macOS 27 dark bronze Liquid Glass)
- `Greenfield XP` (Windows XP glossy Luna Blue & Grass Green)
- `Starlane` (OLED pure-black *Star Wars* yellow-outline crawl & lightsabers)
- `Checkpost` (*Papers, Please* black & olive stamps + paper slips)
- `Wildhand` (*Balatro* green felt & ledged pixel slate HUD)

Candidate lenses:
- **(a) Diegetic / Artifact — Aged Grimoire Book (`loadout.png`, `codex.png`):** Warm burnt-edge parchment pages, walnut leather straps, crimson serif headings. *Dropped:* `Dewfield`, `Fernscroll`, `Counterfoil`, `Swallowtail`, and `Whalebone` already occupy parchment/paper territory, and it would miss Bayonetta 2's defining nocturnal sapphire-blue identity.
- **(b) HUD / Telemetry — Combat HUD Overlay (`hud.png`):** Chrome crescent health bars, spiky combo blades, red boss frames on every panel. *Dropped:* Too jagged and aggressive for a calm library browser; its best elements (mint HP progress bar, amethyst Magic Orbs, spiky score ribbons) work far better as disciplined functional accents.
- **(c) Nocturnal Umbran Watch & Options Sanctuary (`title.png`, `options.png`, `pause.png`, `chapter.png`) — CHOSEN:** Grounds Playnite in Bayonetta 2's iconic astral midnight sapphire (`#06112A`), cobalt nebula mist, ghostly circular Umbran Watch watermarks, electric moon-cyan rune-etched selection beams (`options.png`), a blazing Solar Gold hero Play command (`title.png`), silver-chrome diamond-gem sliders (`options.png`), and a Chapter V Midnight-Sapphire & Gold Filigree Tarot metadata dossier (`chapter.png`). Completely fresh against the last 5 themes and unmistakable on sight.

## 2. Source DNA (5 Measured Traits)

| Trait | Measured Capture Origin | Where It Lands in Playnite |
|---|---|---|
| **Astral Midnight Sapphire & Umbran Watch Mist** (`#030918` / `#06112A` / `#0C1D42` + `nebula-smoke.png` + `watch-watermark.png`) | `title.png`, `options.png` | Window frame, 44px rail, top bar, game page backdrop, Settings dialog body, empty state |
| **Electric Moon-Cyan Rune Beams & Optical Flare Rules** (`#3CCBFF` / `#8BF0FF` + `rune-band.png` + `flare-beam.png`) | `options.png` (`Sound` & `OPTIONS` header) | Active details rows, active sidebar & Settings tree rows, header/top-bar flare seams, menu highlight beams, input focus flares |
| **Solar Halo Gold Flare & Filigree** (`#EAB832` / `#F9D86B` + `filigree-border.png` + `gold-sheen.png`) | `title.png` (gold `"2"`), `chapter.png` (tarot card), `codex.png` (gold lace) | Hero Play CTA, tarot metadata crest & borders, gold filigree dividers, playtime/Halo highlights |
| **Witch-Time Amethyst & Violet `HARD` Rune Ribbons** (`#9842F5` / `#5A2770` + `climax-sweep.png`) | `pause.png` (`HARD`), `hud.png` (8 Magic Orbs) | Launching/running `RunningIndicator` (amethyst clockwork sweep + 3 Magic Orbs), metadata score/group ribbons, active tab crown |
| **Swept Baroque Display + Crisp Humanist Sans** (`Cinzel Decorative` + `Jost`) | `title.png`, `options.png`, `chapter.png` | `Cinzel Decorative` on game titles, Play CTA, Settings band, and empty state; calm `Jost` on lists, tree, metadata prose, and controls |

## 3. Focal Hierarchy & Source UI Translations

- **Hero Focal Piece 1 — Solar Halo Play Slab (`PlayButton.xaml`):** Deep antique-gold-framed Solar Gold slab (`#E6B029` → `#C88F14`) with crescent filigree end-notches and `Cinzel Decorative` midnight-ink label; on **hover**, a luminous horizontal **Moon-Cyan & Gold optical flare** (`flare-beam.png` + `gold-sheen.png`) ignites across the plate with cyan diamond end-sparks; on **press**, settles cleanly with darkened gold bevel.
- **Hero Focal Piece 2 — Astral Horizon Banner & Chapter V Tarot Dossier (`DetailsViewGameOverview`, `GridViewGameOverview`):** Full-bleed banner dissolving seamlessly into midnight sapphire across a cyan-flared Umbran horizon rule (`flare-beam.png`), paired with a **Midnight-Sapphire & Gold Filigree Tarot Metadata Dossier** crowned by a geometric gold Umbran crescent-diamond seal, faint lace border (`filigree-border.png`), and `HARD`-inspired violet-amethyst rune ribbons for group breaks and score badges.

**6 Structural UI Translations (4+ recognizable on sight):**
1. **`OPTIONS` Glowing Cyan Rune-Beam Selection (`options.png`)** → Details rows (`DetailsViewItemStyle`), Settings tree (`TreeView`), active sidebar item (`SidebarItem`), and popup menu highlight (`Menu.xaml`) — **Recognizable on sight**.
2. **`OPTIONS` Silver-Chrome Diamond-Gem Slider (`options.png`)** → `Slider.xaml` (bronze-gold grooved rail + tall vertical faceted silver diamond thumb with sapphire gem core) — **Recognizable on sight**.
3. **Title Screen Umbran Crescent Watch (`title.png`, `options.png`)** → `LocalUmbraluneMenuMarkTemplate` (animated nested crescent + clock ring + diamond hand), page watermark (`watch-watermark.png`), and Empty Game Page sanctuary — **Recognizable on sight**.
4. **Combat HUD Witch-Time Amethyst & 8 Magic Orbs (`hud.png`)** → `RunningIndicator` across Play, rows, covers, and list view (distinct amethyst sweep + 3 glowing Magic Orbs) — **Recognizable on sight**.
5. **Combat HUD Mint-Jade Crescent HP Bar (`hud.png`)** → `ProgressBar.xaml` & `PART_ProgressGlobal` (`Height="12"`, dark chrome groove, mint-jade fill tipped with an ice-cyan gem spark).
6. **Gates of Hell Chrome Thorns & Faceted Ruby Gem (`dialogue.png`)** → `SidePanelCloseButton` (`28×28` sapphire diamond-notched plate lighting Gates-of-Hell Ruby `#D9283B` on hover), `PART_ToggleFilter` **8×8 faceted Ruby Gem diamond pip** (`#F24455`), and `Alt+Q` Exit danger row.

## 4. Material & FX Plan (`art/sprites.py` → `src/Images/fx/*.png`)

Deterministic Pillow + NumPy pure-white (`255, 255, 255`) alpha masks (fixed seed `2014`):
- `watch-watermark.png` (512×512): Concentric Umbran Watch dial, offset crescent moon arc, 12 Roman-tick radials, subtle inner rune circle (5–8% backdrop watermark).
- `nebula-smoke.png` (512×256): Soft layered indigo nebula clouds + sparse pinpoint starlight dust (game page, library, Settings body).
- `rune-band.png` (320×48): Horizontally feathered luminous band textured with delicate rows of geometric Enochian micro-glyphs (active rows, menu highlights, `HARD` ribbons).
- `flare-beam.png` (256×32): Sharp optical star-flare horizon streak tapering cleanly to zero (top bar, Settings title band, Play hover ignition, focus underline).
- `filigree-border.png` (64×256): Repeating vertical baroque gold lace edge strip (Tarot metadata card edge, Settings frame edge).
- `gold-sheen.png` (256×64): Diagonal satin-metallic light sweep (Play button, primary buttons, active plates).
- `climax-sweep.png` (256×48): Witch-Time diagonal astral ribbon + tick sparkles (`RunningScan` launching sweep).

## 5. Signature Levers

### Shell, Texture & Component Levers
1. **Background & side-panel textures:** Midnight sapphire ground layered with `nebula-smoke.png` (8–12%) and centered `watch-watermark.png` (6%) on game pages and Settings; calmer nebula only behind library lists/covers; all collapse under `ShowBackgroundImageOnWindow=True`.
2. **Layout & structural dividers:** `DividerTemplate` is a tapering hairline centered on an antique-gold Umbran crescent-and-diamond crest; top bar closes with a sapphire hairline + `flare-beam.png` cyan optical streak.
3. **Left-side menus & navigation:** 44px abyssal sapphire rail closed by a fine sapphire-gold seam and a crescent foot pip; crowned by a 44×48 main-menu emblem tile (`LocalUmbraluneMenuMarkTemplate`: nested sapphire crescent watch with gold diamond hand — hover rotates the crescent arc & flashes a gold star-glint; open reveals a breathing Witch-Time amethyst core & orbiting diamond pips); active rail item lights a vertical cyan rune-beam wash + `3px` electric cyan edge bar + glowing glyph. Settings `TreeView` uses bare 28px `Jost` rows with soft sapphire hover wash and `2px` cyan edge bar + rune-beam selected wash.
4. **Inputs & search (`LocalUmbraluneFieldTemplate`):**
   - **Edge:** Recessed abyssal-sapphire well (`#040C20`) with a 1px royal-sapphire rim and fine top/bottom inner hairline.
   - **Rest mark:** Paired left & right miniature 4px antique-gold diamond corner ticks centered vertically inside the border edge.
   - **Hover:** Diamond ticks brighten to ice-cyan and a subtle horizontal cyan hairline appears along the bottom rim.
   - **Focus (`Tag="Active"`):** One-shot 180ms horizontal **cyan optical flare (`flare-beam.png` / gradient beam)** ignites along the bottom edge while the left/right diamond ticks scale in and light electric cyan.
   - **Dropdown arrow (`ComboBox`):** Dedicated 28px sapphire-chrome right cap separated by a subtle gold-tinted hairline, carrying Bayonetta 2's faceted **double-chevron / diamond arrow** (lights cyan on hover, flips & turns gold when open). `ContentSite` reserves `28 + 10 = 38px` right margin.
   - **CheckBox & RadioButton:** Faceted diamond-bezel sapphire sockets (`CheckBox`: notched sapphire square with glowing cyan Umbran diamond-check; `RadioButton`: concentric Umbran crescent-ring disc with glowing cyan star-core).
5. **Hero banner transition:** Soft midnight-sapphire dissolve over `PART_ImageBackground` ending on a crisp horizontal cyan-flared Umbran horizon seam (`flare-beam.png`) with a miniature centered gold crescent crest.
6. **Metadata container & group break:** Chapter V **Midnight-Sapphire & Gold Filigree Tarot Dossier** (`#091736`) with a 1px antique-gold outer hairline, subtle vertical `filigree-border.png` right lace strip, top crescent-diamond seal, and feathered **violet-amethyst `HARD`-style rune ribbons** (`rune-band.png`) for group breaks (`Meta*` dividers collapse cleanly in `Center`/`Stretch`).
7. **Chip & score silhouette:** `PropertyItemButton` chips are sleek pointed/chamfered dark-sapphire tags with tiny gold end-pips that ignite moon-cyan on hover; `TextBlockGameScore` wears a spiky gothic-diamond combo plaque (`hud.png`) rimmed in silver-cyan with gold/mint/ruby score tinting.
8. **Row & cover selection mark:** Details rows (`DetailsViewItemStyle`) rest calm and borderless on sapphire, lift with a soft sapphire-cyan hover mist + slight 2px glide, and lock on select with Bayonetta 2's iconic **feathered electric moon-cyan rune beam (`rune-band.png`) + 3px glowing cyan bar + starlight text**. Grid covers (`GridViewItemStyle`) clip cleanly to `4px` corners, frame in a glowing cyan crescent-corner halo + subtle lift on hover, lock with a royal sapphire-and-gold filigree rim on select, and display **50×50 octagonal sapphire-and-gold medallion `GridTileButton` controls**.
9. **Side-panel close plate (`SidePanelCloseButton`):** Custom 28×28 diamond-notched dark-sapphire chrome bezel with antique-gold corner ticks and 14px starlight `×`; smoothly ignites into **Gates-of-Hell Ruby (`#D9283B`)** with bright white `×` on hover (0.12s).

### 7 Popup Menu Levers (`docs/themes/menus.md` — distinct from all existing rows)
- **Panel (`LocalUmbraluneMenuBoardTemplate`):** 30px rows; midnight-sapphire astral panel (`#071430`) with faint `nebula-smoke.png` wash, 1px royal-sapphire rim with inset antique-gold filigree corner ticks, crowned by a 2px electric-cyan optical flare seam and centered gold crescent pip.
- **Highlight:** Feathered electric moon-cyan `OPTIONS` rune beam (`rune-band.png`) fades in (120ms) while a 7px rotated ice-cyan diamond cursor glides in from the left and the label turns starlight-white and shifts 2px right.
- **Group break:** Fading sapphire hairline centered on a 6px antique-gold rotated diamond crest (`10px` tall).
- **Icons:** Bespoke bare-icon set (`art/menu-icons.json` → `src/Images/Umbralune/`) drawn in crisp silver-ice & antique-gold baroque gothic strokes with dark-sapphire contour contrast so they read cleanly on both midnight rest and luminous cyan highlight; `TextElement.Foreground` updates `TargetName="Icon"` on highlight/Exit.
- **Shortcuts:** Sleek circular/pill silver-rimmed console-badge style (`options.png`'s `(A)` / `(B)` prompt feel) in muted periwinkle, illuminating to ice-cyan rim + starlight text on highlight.
- **Submenu mark:** Faceted right-pointing diamond-chevron (`▸`) in muted gold, lighting bright ice-cyan while open (held sapphire-cyan plate on open header).
- **Marked rows:** `Alt+Q` Exit rests with Gates-of-Hell Ruby text/glyph and highlights into a luminous **Ruby rune beam (`#B81E30`)** with starlight-white label (>6.2:1) and ruby diamond cursor; checked rows display a faceted cyan diamond gem inside a gold-rimmed square socket.

## 6. Motion Language & Restraint

- **Durations:** Fast `110ms` (hovers, ticks, close plate), Base `190ms` (Play flare, rune-beam selection, focus beam, menu highlight), Slow `340ms` (tarot/empty reveals, cover settle).
- **Easing Personality:** `PowerEase` (`Power="3"`, `EasingMode="EaseOut"`) — poised, theatrical, silk-sharp Bayonetta grace (never cartoonish bounce, never robotic step).
- **Ambient Loops (max 2, sparse areas only):** Open main-menu mark Witch-Time core breath (2.6s) and Running/Launching Witch-Time indicator pulse (2.8s). Zero looping animations on fields, menus, or resting rows.
- **Restraint & Anti-Slop Commitment:**
  - Dense reading surfaces (game list rows, grid background, metadata copy, game descriptions) stay calm, uncluttered midnight sapphire with ≥7:1 text contrast—no glowing boxes around every metadata row, no noisy borders on idle list items.
  - Forbidden clichés: neutral charcoal `#0D0F14`, generic 45° sci-fi HUD chamfers/tech brackets `[ ]`, uppercase monospace labels (`SYS // 01`), unmotivated `DropShadowEffect`, or flat untextured SaaS pills.

## 7. Brand & Attribution

- **Original Name:** `Umbralune` (key `umbralune`) — unofficial, fan-made theme inspired by *Bayonetta 2*. Not affiliated with or endorsed by PlatinumGames, SEGA, or Nintendo.
- **Custom Mark (`art/mark.svg`):** Original geometric **Umbran Crescent Watch** — an asymmetrical crescent moon embracing a concentric clock ring pierced by a vertical 4-point star-diamond needle (zero copied logos). Reused in `info/icon.png` (default orange tile), `LocalUmbraluneMenuMarkTemplate`, Settings title band, and empty game page.
- **`GameBannerTintBrush`:** `#06112A` (Astral Midnight Sapphire — the solid nocturnal ground of the Title and Options screens).
