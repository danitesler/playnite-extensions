# Guiding Wind — creative brief

Mode: **Showcase**. Source: the menus and HUD of Ghost of Tsushima (see `RESEARCH.md`). Light misty washi workspace crowned by pure sumi ink top chrome and paired with a dark Sayagata lacquer metadata inspector.

## 1. Source DNA (5 traits -> where each lands)

| Trait | Evidence (`RESEARCH.md`) | Lands on |
|-------|--------------------------|----------|
| Surface split: sumi `#070707` top chrome, calm `#d4d6d3` misty washi lists/pages, `#141414` dark Sayagata key-fret inspector | `gear`, `accessibility`, `collections`, `save-game` | `TopPanel` & `Sidebar` (sumi black), `Library` / `Details` / `Settings` pages (misty washi), `MetaPane` & `ToolTip` (dark Sayagata lacquer) |
| Active tab wash: bright vertical washi gradient tab with dark ink glyph and tiny top-left crimson corner triangle | `gear`, `journal`, `collections`, `save-game` | `TopPanel` active view switches (`Details`, `Grid`, `List`), `SidebarItem` current slot, `TabControl` active tab |
| Sumi-e dry-brush strokes: asymmetric black ink banners with frayed right bristles & crimson vermilion selection strokes | `accessibility`, `game`, `save-game`, `pause`, `main-menu` | `PlayButton` (`#0c0c0c` brush slab), `SCREENSHOTS` / `DESCRIPTION` / `GroupBox` headers, selected `DetailsViewItemStyle`, `ListViewItem`, `TreeViewItem` |
| Feathered diamond rule & diamond progression pips | `hud-2` (*Traveler's Rest Inn*), `confirmation-3`, `gear-upgrade` | Title underline divider (`DividerTemplate`), `StandardWindowStyle` title band flourish, `EmptyGameTemplate`, `ProgressBar` / filter diamond mark |
| Ink-slash slider & `[KEY]` prompt keycaps | `mouse-keyboard`, `gear`, `confirmation-2` | `Slider` (tapered brush rail + angled `-8 deg` ink-dash thumb), `More` / `Edit` square keycap buttons, `CheckBox` / `RadioButton` |

## 2. Game element map (source part -> Playnite surface)

| Source element | Playnite surface | How |
|----------------|------------------|-----|
| **Top navigation bar + gradient active tab with red corner triangle** (`MAP \| JOURNAL \| GEAR`, `gear`) | `Views/TopPanel.xaml`, `CustomControls/SidebarItem.xaml` | 52px `#070707` sumi bar; active view switch & current sidebar item rise into a white-to-grey vertical wash with dark `#111111` ink icon and a 7px crimson top-left corner triangle |
| **Black sumi-e section banner** (`ACCESSIBILITY`, `SAVE GAME`) | `DetailsViewGameOverview`, `GridViewGameOverview`, `GroupBox` | Asymmetric left-solid `#0a0a0a` dry-brush banner mask (`brush-banner-r.png`) with white uppercase `Sora` heading and diamond/crest prefix |
| **Crimson brush selection bar** (`SUBTITLE BACKDROP`, `MANUAL_0001.SAV`) | `DetailsViewItemStyle`, `ListViewItem`, `TreeViewItem`, `ListBox` | Feathered vermilion crimson (`#b82f2b`/`#c43a36`) 9-slice brush stroke (`InkPlateTemplate`) behind crisp `#f2f1ed` white text (plus gold diamond gutter mark on selected rows) |
| **Right-hand Sayagata lacquer panel** (`SAKAI KATANA`, `INARI SHRINES`, `gear`, `collections`) | Metadata pane (`Details` & `Grid` overviews), `ToolTip` | Dark `#141414` lacquer card tiled with a 7% seamless Sayagata key-fret mask (`sayagata.png`), `#c4b36e` antique gold labels, `#ebd487` links, keycap chips, and gold top trim |
| **Pause / Confirmation sumi brush slab** (`RESTART FROM LAST CHECKPOINT`, `SAVE GAME`, `pause`) | `PlayButton` & primary `Button` | `#0c0c0c` sumi dry-brush slab (`InkPlateTemplate`) with crisp white `Sora` text; on hover transitions smoothly to crimson vermilion (`#b82f2b`) with white ink aura + gold diamond corner ticks |
| **Keycap prompt badges** (`[C]`, `[ESC]`, `[F]`, `gear`, `confirmation-2`) | `SecondaryButton` (`More`, `Edit`), `Button`, `PropertyItemButton` chips | Crisp 1-2px bordered rectangular plates (`0-2px` corners) with tactile ink/gold rim shifts on hover |
| **Inked sensitivity slider** (`mouse-keyboard`) | `Slider`, `SliderEx` | Thin tapered ink-brush track (`#171817`), crimson/gold active fill, and an `-8 deg` tilted sumi brush-dash thumb that straightens slightly on hover |
| **Damage / Legend gold & crimson gauges** (`gear`, `celebration-2`) | `ProgressBar`, `TextBlockGameScore` | Gold-gradient filled bar (`#b49a5d` -> `#ebd487`) in a recessed charcoal track; score pills ringed in antique gold on the Sayagata metadata card |
| **Location discovery diamond rule** (`❖ TRAVELER'S REST INN ❖`, `hud-2`) | `DividerTemplate`, `StandardWindowStyle` title band | Tapered horizontal rule flanked by nested diamond ornaments (`❖`) |
| **Swirling cloud crest + Guiding Wind** (`THE WARRIOR'S CODE`, `journal`) | `EmptyGameTemplate`, `StandardWindowStyle` watermark | Original swirling wind-cloud *kamon* seal (`art/mark.svg`) over gently drifting `wind-wisps.png` Guiding Wind streaks + `LOCErrorNoGameSelected` |
| **Exploration Firefly & Guiding Wind** (`gear-upgrade`, `#18be6d` green firefly) | `RunningIndicator` / `RunningActionIndicator` | Firefly Jade (`#137a43`) frame + ink keyline, angled Guiding Wind `RunningScan` streak, jade brush foot fill, and 3 staggered drifting firefly diamond motes |

## 3. Moments

- **Hero: Play (`PlayButton`).** Rest: sumi black (`#0c0c0c`) 9-slice dry-brush slab (`InkPlateTemplate`), crisp white uppercase `Sora` label + blade play glyph, subtle crimson seal diamond at left. Hover (180ms in, 300ms out): vermilion crimson brush plate (`#b82f2b`) fades in smoothly over the sumi base, soft feathered aura (`bloom.png`) expands around the slab, a diagonal wind-katana white sheen glides once across the face, and gold diamond corner ticks lock inward at both ends. Press (90ms): settles into deep crimson (`#962925`) with a subtle 1px dip.
- **Secondary (7):**
  1. Cover hover (`GridViewItemStyle`): crisp crimson ink-brush frame (`InkFrameTemplate`) + soft dark mist bloom fade in (180ms), corner diamond ticks lock inward; selected cover holds a solid crimson-gold double border.
  2. Cover hover buttons (`GridViewItemTemplate`): square keycap-framed sumi `Play` and `Info` plates rise 8px and scale `0.86 -> 1` (`BackEase` 0.25), staggered 50ms.
  3. Top panel view switch & filter toggle: active view button elevates into the vertical washi gradient tab with dark glyph + top-left crimson triangle; filter active adds a 9px antique gold (`#d9b963`) diamond pip.
  4. Sidebar selection (`SidebarItem`): smooth fade into the bright washi gradient tab (`#dfdfde`) with dark `#111111` ink icon and crimson corner triangle.
  5. Settings `TreeView`: minimal 28px bare rows in `Segoe UI`; soft mist-wash hover (110ms), selected crimson brush-wash + 2px left vermilion/gold bar + crisp `#f2f1ed` text (180ms).
  6. Tabs (`TabControl`): active tab rises into crisp washi/ink contrast with a vermilion brush underline bar (`ScaleX 0.3 -> 1`, 180ms).
  7. CheckBox & Slider: CheckBox fills vermilion crimson (`#c43a36`) with crisp check animation (110ms); Slider's angled ink-dash thumb highlights crimson/gold on hover.
- **Ambient (2, sparse areas only):**
  1. Empty game page (`EmptyGameTemplate`): Guiding Wind wisps (`wind-wisps.png`) drift slowly across the center behind the swirling *kamon* seal on a 3.6s gentle loop while visible.
  2. Running / Launching (`RunningIndicator`): Firefly Jade (`#137a43`) angled wind-streak scan (`RunningScan`) + brush foot fill (`1.65s` cycle while launching; `3.2s` calm breathing frame + drifting firefly diamond motes while running).

## 4. Motion language

- Durations: fast `110ms` (press, check, hover start), base `180ms` (brush fades, tabs, ticks), slow `300ms` (exits); ambient `3.2s-3.6s`.
- Easing: `CubicEase` (`EaseOut`) for crisp sumi-e ink settles; `BackEase` (`EaseOut`, amplitude `0.25`) strictly on cover button entrances; `QuadraticEase` (`EaseIn`) + `FillBehavior="Stop"` on exits.
- Entrance direction: rising cleanly (+8px on cover buttons) or gliding rightward along the wind (sheen, wind scan).
- Stagger: `50ms` between cover Play and Info buttons; `350ms` stagger across the 3 running firefly motes.

## 5. Brand

- Name: **Guiding Wind** (evokes Ghost of Tsushima's signature diegetic wind mechanic without using any trademarked name).
- Mark (`art/mark.svg`): An original circular swirling wind-cloud crest enclosing a tilted folded diamond seal (inspired by traditional Japanese *kamon* without reproducing any Sakai or Tsushima clan crest). Used in `IconMainMenu`, `StandardWindowStyle` title band, `EmptyGameTemplate`, and `info/icon.png` (rendered in default `#FF7A1A` orange).
- `GameBannerTintBrush`: `gt-mist` (`#d4d6d3`), the theme's misty washi paper backdrop, so darkening a banner in ThemeModifier veils it smoothly into Tsushima fog rather than muddying it to black.

## 6. Restraint

- Game list rows, cover grid well, and game description area remain calm misty washi (`#d4d6d3`) with at most 4% paper grain, zero heavy splatters behind readable copy.
- Sayagata key-fret pattern appears strictly on the dark metadata inspector card (`MetaPane`) and subtly in the Settings window title band.
- Firefly Jade (`#137a43`) is reserved exclusively for live running/launching game states and positive ratings; Tsushima Gold (`#c4b36e` / `#d9b963`) for metadata accents, filters, and notifications; Vermilion Crimson (`#b82f2b` / `#c43a36`) for selection and active focus.
