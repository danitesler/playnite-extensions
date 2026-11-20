# Bathysphere — creative brief

Mode: **Showcase**. Unofficial BioShock franchise theme uniting Rapture's 1950s submerged Art Deco brass & ocean-lacquer noir (**BioShock 1 & 2**, **Burial at Sea**) with Columbia's 1912 gilded Beaux-Arts vellum & Salts/Shield HUD (**BioShock Infinite**). See [`RESEARCH.md`](RESEARCH.md).

## 1. Source DNA (5 traits -> where each lands)

| Trait | Franchise evidence (`RESEARCH.md`) | Lands on |
|---|---|---|
| **Pointed-hexagonal burnished brass bars with brushed-silver rivets** | BioShock 1 Settings & Load/Save active bars (`id=1171`) | `PlayButton` slab, `Button` (`IsDefault=True`), `Menu.xaml` & `ComboBoxItem` highlight plaques |
| **Stepped Art Deco brass frames, sunburst dividers & Rapture skyline** | BioShock 1 Loading boards, Journal frames & Pause skyline (`id=1171`) | `TopPanel` stepped sunburst rule, `StandardWindowStyle` 44px title band + skyline watermark, `ContextMenu` Deco panel, `GridViewItemStyle` stepped corner brackets |
| **1912 Columbia vellum parchment & riveted slate-teal plaque** | BioShock Infinite Codex, Modals & Parlor Settings (`id=338`) | Right/stretched **Metadata Dossier** (`ParchmentBrush` `#DFD0B4`, slate-teal riveted cap, sepia ink, dark brass-rimmed chips, engraved `Cinzel` score seals) |
| **EVE glass vials, 12-segment Salts bar & analog hacking needle** | BioShock 1/2 EVE & Health vials, BS2 needle hack gauge, Infinite 12-segment Salts (`id=1171`, `id=338`) | `ProgressBar` silver-capped glass tube, `Slider` brass hacking-needle thumb, `RunningIndicator` dedicated EVE/Salts Cobalt (`#1A69CC`) sweep + 12-segment Salts bar + rising bubbles |
| **Tall Art Deco condensed display + Futura geometric body** | BioShock 1 `Andes`/`Futura`/`Century Gothic` + Infinite `VOXOPHONES` & engraved serif | `Pathway Gothic One` (`HeadingFontFamily`), `Jost` Regular/Medium (`FontFamily`), `Cinzel` Bold (`PosterFontFamily`) |

## 2. Game element map (11 franchise UI parts -> Playnite surfaces)

| Franchise UI part | Playnite surface | How |
|---|---|---|
| **BS1 Pointed-Hexagonal Riveted Brass Bar** | `DerivedStyles/PlayButton.xaml`, default `Button` | 45° hexagonal burnished gold plaque (`#C99A36`), double dark/bright-gold hairline, brushed-silver tip rivets, 9-slice brass `bloom.png`, gilded hover sheen |
| **BS1 Pause Skyline & Stepped Art Deco Crest** | `DerivedStyles/StandardWindowStyle.xaml`, `Views/TopPanel.xaml` | 44px abyssal dialog title band with Lighthouse-Porthole crest, tall `Pathway Gothic One` title, ghosted Art Deco Rapture skyscraper skyline, double stepped gold rule |
| **BS Infinite Vellum Card + Riveted Slate-Teal Pill** | Metadata pane (`DetailsViewGameOverview`, `GridViewGameOverview`) | Heavy stepped brass frame crowning aged `#DFD0B4` vellum (`vellum-grain.png` <= 5%) with a riveted `#2C4B59` Columbia header bar, dark sepia ink, dark Rapture chips |
| **BS1/2 EVE Vial + Infinite 12-Segment Salts Bar** | `RunningIndicator`, `RunningActionIndicator` (all 4 surfaces) | Dedicated EVE/Salts Cobalt (`#1A69CC` / `#4BA3FF`): launching sweeps a diagonal cobalt surge band (`RunningScan`) + 12-segment Salts foot meter + 3 staggered rising EVE bubbles; running breathes calmly |
| **BS1 Hacking Pipe Emerald Fluid** | `PART_ToggleFilter` active indicator (`Views/TopPanel.xaml`) | 8px Art Deco 4-point starburst diamond filled with `#22D485` hacking emerald at icon's top-right when `Tag="True"` |
| **BS2 Real-Time Hacking Needle Gauge** | `DefaultControls/Slider.xaml`, `SliderEx` | Recessed dark calibrated rail with burnished gold progress range and diamond-tipped vertical brass needle thumb (`10x20`) |
| **BS1/2 Health & EVE Glass Tube** | `DefaultControls/ProgressBar.xaml`, `PART_ProgressGlobal` | Brushed-silver end-capped recessed glass tube with glowing liquid fill (`Height="12"` in top bar with >= 12px text margin) |
| **BS1 Starburst Medallions & Infinite Vigor Wheel** | `DerivedStyles/GridViewItemTemplate.xaml` (`GridTileButton`), `RadioButton` | 50x50 octagonal riveted dark-iron & brass medallions for cover Play/Info with Art Deco glyphs; circular riveted porthole socket for `RadioButton` |
| **BS1 Stepped Brass Housing** | `DefaultControls/CheckBox.xaml`, `TabControl.xaml`, `GroupBox.xaml` | Chamfered brass toggle socket lighting emerald/gold on check; Art Deco stepped gold tab underline with center diamond; content-sized stepped-corner GroupBox |
| **BS1 Lacquer Plaque + Hexagonal Bar + BS Infinite Brackets** | `ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | Deep verdigris-lacquer Deco panel (`deco-fan.png` <= 5%), 30px rows, pointed-hexagonal brass-rimmed teal highlight + sliding Art Deco chevron pointer, brass-bracketed shortcuts `[F4]`, 3-ray sunburst group break, crimson `Alt+Q` Exit |
| **Franchise Lighthouse & Bathysphere Porthole** | `EmptyGameTemplate` (both game overviews) | Centered riveted brass porthole reticle with `sunburst-rays.png`, breathing Lighthouse-over-Waves mark, stepped Deco flanking rules, and `LOCErrorNoGameSelected` |

## 3. Moments

- **Hero: `PlayButton` (`PLAY`).** Rest: pointed-hexagonal burnished imperial brass plaque (`#C99A36`) with dark abyssal ink (`#091113`), double Art Deco gold hairline frame, twin brushed-silver vertex rivets, and subtle resting brass bloom (`0.25`). Hover (`170ms` in, `260ms` out): face brightens to gleaming `#DEB24E`, 9-slice gold `bloom.png` flares (`0.85`), brushed-silver rivets catch bright specular highlight, and a crisp gilded Deco light sweep glides left-to-right across the hexagonal face. Press (`95ms`): plate settles to deep burnished bronze (`#997222`) with muted rim.
- **Secondary (7):**
  1. Details list row (`DetailsViewItemStyle`): hover (`130ms`) fades in brass-tinted ocean wash + slides a slim gold hairline tick from left (`X: -4 -> 0`) with `+2px` label nudge; click/selection (`180ms`) locks a luminous deep Atlantic teal plate (`#173E44`) with top/bottom antique brass hairlines, a springing left stepped-gold chevron bar (`ScaleY: 0.35 -> 1`), and a quick golden confirmation glint sweep (`220ms`).
  2. Cover tile (`GridViewItemStyle`): hover (`160ms`) gently scales (`1 -> 1.02`), reveals stepped 4-corner brass brackets + 9-slice warm gold bloom; click/selection locks a crisp double-hairline antique brass Art Deco frame with top/bottom centered gold diamond clasps and a brief golden rim flash.
  3. Cover hover buttons (`GridTileButton`): 50x50 riveted octagonal brass-iron medallions (`Play`, `Info`) rise `10px` and scale `0.86 -> 1` (`BackEase` 0.24, `55ms` stagger), igniting to bright burnished brass on hover.
  4. Popup menus & ComboBox (`ContextMenu`, `Menu`, `ComboBox`): 30px rows on a stepped-corner verdigris-lacquer board; pointed-hexagonal brass-rimmed highlight fades in (`120ms`) as a Deco chevron slides in from left and label shifts `+2px`.
  5. Sidebar selection (`SidebarItem`): 44px abyssal `#081113` rail crowned by the Bathysphere Lighthouse-Porthole mark; active slot illuminates a deep Atlantic teal plate + left 3px stepped gold bar and bright gold glyph (`170ms`).
  6. Settings `TreeView`: minimal 28px bare rows in `Jost` (`14px`) with subtle ocean wash hover (`120ms`); selected row reveals deep teal wash, 2px antique gold left bar with diamond tick, and bright ivory-gold label (`180ms`).
  7. `CheckBox`, `RadioButton`, `Slider`, `TabControl`: crisp `120–180ms` brass detent animations across chamfered check jewel, porthole lens, needle thumb rim, and stepped gold tab diamond bar.
- **Ambient (2, sparse areas only):**
  1. `EmptyGameTemplate`: riveted brass Bathysphere porthole with slow `3.6s` breathing beacon rays and Lighthouse mark behind `LOCErrorNoGameSelected` (runs only while visible).
  2. `RunningIndicator`: dedicated EVE/Salts Cobalt (`#1A69CC`) sweep (`1.65s` launching loop with 12-segment Salts foot meter + 3 rising EVE bubbles; calm `3.2s` breathing idle while running).

## 4. Motion language

- **Durations:** fast `110ms` (press, toggle detent, hover wash), base `170–180ms` (brass plate locks, chevron entrances, tab bar), slow `260–280ms` (cool-down exits); ambient `3.2–3.6s`.
- **Easing:** `CubicEase` (`EaseOut`) for heavy mechanical brass detents; `BackEase` (`EaseOut`, amplitude `0.24`) for cover medallion entrances; `QuadraticEase` (`EaseIn`) + `FillBehavior="Stop"` on exits.
- **Direction & stagger:** left-to-right Deco light sweeps & chevron entrances (`X: -5 -> 0`); vertical rise (`+10px`, `55ms` stagger) on cover medallions; `220ms` stagger across rising EVE bubbles.

## 5. Brand

- **Name:** **Bathysphere** (generic real-world deep-sea diving vessel word; zero trademarked *BioShock* / *Rapture* / *Columbia* / *Big Daddy* terms).
- **Mark (`art/mark.svg`):** Original geometric Art Deco Bathysphere porthole ring with 4 cardinal rivet lugs framing a streamlined lighthouse tower over stepped ocean chevrons and 3 radiating beacon beams. Used in `IconMainMenu`, `StandardWindowStyle`, `EmptyGameTemplate`, and `info/icon.png` (default `#FF7A1A` orange).
- **`GameBannerTintBrush`:** `bs-abyss` (`#081113`), Rapture's deep abyssal Atlantic lacquer, casting hero art into submerged ocean-noir when darkened in ThemeModifier.

## 6. Restraint

- Game list rows, cover grid wells, filter/explorer panels, and game descriptions stay calm `#0D1A1D` deep oceanic slate with clean high-contrast cream typography (`#ECE4CE`); Art Deco fan patterns, vellum grain, and caustic ripples stay <= 5% opacity on sparse surfaces (menus, dossier, title band, empty porthole).
- Strict 5-hue role separation: Burnished Gold = Play & Deco chrome; Deep Atlantic Teal = Selection; **EVE/Salts Cobalt (`#1A69CC`)** = Running/Launching ONLY; Hacking Emerald (`#22D485`) = Filter active & positive ratings; Health Crimson (`#A62626`) = Danger, Close hover, and Exit.
