# Cogplate — creative brief

Mode: **Showcase**. Unofficial grimdark phosphor-CRT and bolted-iron theme inspired by the menus, purity dossiers, and HUD of **Warhammer 40,000: Boltgun 2** (see `RESEARCH.md`).

## 1. Source DNA (5 traits -> where each lands)

| Trait | Evidence (`RESEARCH.md`) | Lands on |
|-------|--------------------------|----------|
| **Bolted gunmetal bezels with brass corner miters & chain tracks** | `02-main-menu`, `06-settings-gameplay`, `22-stage-select` | `TopPanel` chain-link trim, `StandardWindowStyle` title band + crimson conduits, `MetaPane` bolted frame, `GroupBox` corner brackets |
| **CRT phosphor green glass with scanlines & corner glass cracks** | `06-settings-gameplay`, `16-modal`, `05-loading` | `PlayButton` slab, section header capsules, Settings `TreeView` active glass, `EmptyGameTemplate`, `ComboBox` & `SearchBox` wells |
| **Glowing twin mint-LED end-pills & white chevron selection outlines** | `02-main-menu` (`PLAY GAME`), `16-modal` (`YES`), `06-settings-gameplay` (`Hit Markers`) | `PlayButton` left/right mint LEDs + bloom, `DetailsViewItemStyle` & `ListViewItem` selected row, `SidebarItem` active LED bar, `TreeViewItem` selection |
| **Stage-Select hybrid CRT header + nailed purity-seal parchment dossier** | `22-stage-select`, `04-difficulty`, `25-level-complete` | Right/stretched **Metadata Dossier** pane (`ParchmentBrush` `#D3C19E` under a dark CRT header cap, dark sepia ink, dark CRT tag chips), `ToolTip` |
| **Tall condensed `Barlow Condensed` uppercase & HUD Armor Cobalt / Acid Lime meters** | `02-main-menu`, `06-settings-gameplay`, `28-hud-vitals`, `31-hud-enemy` | `HeadingFontFamily` titles & buttons, `CheckBox` lime toggle capsule, `Slider` steel I-beam thumb, `ProgressBar` tapered HUD gauge, `RunningIndicator` Armor Cobalt |

## 2. Game element map (11 source UI parts -> Playnite surfaces)

| Source element | Playnite surface | How |
|---|---|---|
| **Main Menu / Modal `PLAY GAME` / `YES` LED plate** (`02-main-menu`, `16-modal`) | `DerivedStyles/PlayButton.xaml`, default `Button` (`IsDefault=True`) | Chamfered steel bezel with brass corner ticks, `#183520` CRT green glass with subtle scanlines, and twin glowing `#8AF0A8` vertical mint LED end-pills |
| **Viewport chain-link border & crimson top conduits** (`02-main-menu`, `06-settings-gameplay`) | `Views/TopPanel.xaml`, `DerivedStyles/StandardWindowStyle.xaml` | Continuous `chain-trim.png` track strip crowning the 52px top bar & 44px dialog title band, paired with twin `#942B28` crimson conduit corner wires |
| **Options `Hit Markers` white chevron row outline** (`06-settings-gameplay`, `12-settings-controls`) | `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml`, `TreeView.xaml` | Selected row lights `#183520` CRT glass framed by a crisp ivory-white chamfered/chevron rim + left glowing mint LED capsule |
| **Stage Select hybrid CRT + Nailed Parchment card** (`22-stage-select`, `04-difficulty`) | Metadata pane (`DetailsViewGameOverview`, `GridViewGameOverview`) | Bolted gunmetal + brass-cornered frame with a thin CRT green dossier header cap over `#D3C19E` aged parchment (`parchment-grain.png` <= 5%), sepia ink, and dark CRT chips |
| **Difficulty `MEDIUM` medal card LEDs & corner miters** (`04-difficulty`) | `DerivedStyles/GridViewItemStyle.xaml` | Static brass corner miter brackets + glowing top/bottom mint LED pips on selected covers; animated phosphor green frame + LED bloom on hover |
| **Controller keycap badges (`[LB]`, `[RB]`, `[SPACE]`)** (`06-settings-gameplay`, `12-settings-controls`) | `SecondaryButton` (`More`, `Edit` 40x40), `GridTileButton` (cover Play/Info) | Chamfered dark gunmetal square keycaps (`#222723`) with corner rivets and bright ivory glyphs |
| **Options `Enabled` lime pill toggle** (`06-settings-gameplay`) | `DefaultControls/CheckBox.xaml` | Horizontal pill-capsule switch (`34x18`) with beveled thumb sliding right and filling `#9CB41C` acid-lime when checked |
| **Options `Crosshair Opacity` vertical I-beam slider** (`06-settings-gameplay`) | `DefaultControls/Slider.xaml`, `SliderEx` | Dark recessed track with glowing mint/lime fill and a tall flanged gunmetal I-beam thumb (`8x18`) |
| **Options header bar (`Gameplay | Controls | Video`)** (`06-settings-gameplay`) | `DefaultControls/TabControl.xaml` | Calm muted-sage text tabs turning crisp `#F2F4EA` bold ivory with a glowing mint underline bar when selected |
| **Tapered Enemy / Vitals dual gauge** (`28-hud-vitals`, `31-hud-enemy`) | `DefaultControls/ProgressBar.xaml`, `PART_ProgressGlobal` | Chamfered steel bezel holding a crisp high-contrast phosphor/lime bar (`Height="12"` in top bar with >= 12px text margin) |
| **Loading / World Map CRT viewport & HUD Armor Blue** (`05-loading`, `19-world-map`, `28-hud-vitals`) | `EmptyGameTemplate`, `RunningIndicator`, `RunningActionIndicator` | Empty page: bolted CRT screen with scanlines, `glass-cracks.png` corner hairline, orbital reticle + pulsing **Cogplate** cogwheel; Running: dedicated **HUD Armor Cobalt** (`#245CE0`) |

## 3. Moments

- **Hero: `PlayButton` (`PLAY`).** Rest: chamfered gunmetal bezel with brass corner ticks, `#183520` CRT green glass (`scanlines.png`), bold condensed ivory label, and glowing mint LED end-bars at soft rest. Hover (`180ms` in, `280ms` out): CRT glass brightens (`#224B2D`), 9-slice mint `bloom.png` flares around the bezel, both LED end-pills ignite to `#D8FBE0` hot mint, and a crisp phosphor scan sheen glides left-to-right across the glass. Press (`95ms`): plate drops to `#0D1E11` deep glass and LEDs dip before snapping back.
- **Secondary (7):**
  1. Cover hover (`GridViewItemStyle`): brass/phosphor rim + mint `bloom.png` + top/bottom LED pips fade in (`180ms`); selected cover holds static brass corner miters + ivory/mint top & bottom LEDs.
  2. Cover hover buttons (`GridTileButton`): 46x46 riveted dark-iron keycaps (`Play`, `Info`) rise `10px` and scale `0.86 -> 1` (`BackEase` 0.25, `50ms` stagger).
  3. Top bar & Filter mark (`TopPanel`): search well in `#0B1B0E` CRT glass with persistent magnifier; active filter lights an `8px` acid-lime (`#C9E33E`) diamond pip on top-right; active view toggle illuminates twin vertical mint LED bars.
  4. Sidebar selection (`SidebarItem`): `44px` `#111512` rail crowned by the **Cogplate** cogwheel mark; current slot fades (`180ms`) into `#183520` CRT plate + left `3px` glowing mint LED capsule.
  5. Settings `TreeView`: minimal `28px` bare rows in `Barlow Semi Condensed` (`14px`); soft steel wash hover (`110ms`); selected row lights `#183520` CRT plate, `2px` mint LED left bar, and bright ivory label (`180ms`).
  6. `CheckBox` & `RadioButton`: `120ms` thumb slide / acid-lime ignition (`CheckBox`) and octagonal CRT socket (`RadioButton`).
  7. `TabControl` & `Slider`: active tab fades to bold ivory + glowing mint indicator (`180ms`); I-beam slider thumb lights brass/mint rim on hover/drag.
- **Ambient (2, sparse areas only):**
  1. `EmptyGameTemplate`: centered bolted CRT monitor with faint scanlines, subtle corner glass crack, and slow `3.6s` pulsing cogwheel reticle behind `LOCErrorNoGameSelected` (only while visible).
  2. `RunningIndicator`: HUD Armor Cobalt (`#245CE0`) diagonal shield-slash `RunningScan` + segmented cell `RunningFill` foot bar + 3 staggered cobalt chevron pips (`1.65s` launch loop; calm `3.2s` idle breathing frame + pulsing pips while running).

## 4. Motion language

- **Durations:** fast `110ms` (press, toggle, hover tint), base `180ms` (LED ignitions, CRT washes, tab lines), slow `280ms` (cool-down exits); ambient `3.2s–3.6s`.
- **Easing:** `CubicEase` (`EaseOut`) for crisp mechanical settles; `BackEase` (`EaseOut`, amplitude `0.25`) on cover action button entrances; `QuadraticEase` (`EaseIn`) + `FillBehavior="Stop"` on exits.
- **Direction & stagger:** vertical rise (`+10px`) on cover keycaps (`50ms` stagger); left-to-right phosphor scan sweeps; `240ms` stagger across running cobalt pips.

## 5. Brand

- **Name:** **Cogplate** (evokes cogwheel machinery + riveted armor/dossier plates; zero trademarked *Warhammer* / *Boltgun* words).
- **Mark (`art/mark.svg`):** An original 10-tooth circular mechanical cogwheel enclosing a hollow chamfered octagonal aperture and twin horizontal rivet pins. Used in `IconMainMenu`, `StandardWindowStyle` title band, `EmptyGameTemplate`, and `info/icon.png` (default `#FF7A1A` orange).
- **`GameBannerTintBrush`:** `cg-crt-deep` (`#0B1B0E`), the darkened CRT phosphor glass tone, so ThemeModifier banner darkening casts hero artwork into Boltgun 2's deep emerald terminal mood.

## 6. Restraint

- Game list rows, cover grid wells, filter/explorer trees, and description reading area remain calm `#171B18` gunmetal iron with crisp readable typography; scanlines, parchment grain, and glass cracks stay subtle (`<= 6%`) on headers, cards, and empty states.
- Color separation: Phosphor Green/Mint owns Play & selection; Steel owns hover; Acid Lime & Brass own toggles, filters, and ratings; Crimson owns conduits & danger; **HUD Armor Cobalt** (`#245CE0`) is strictly reserved for running/launching games.
