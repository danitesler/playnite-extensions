# Rushdown — Creative Brief

- **Ambition**: `Showcase` (maximum craft, original Prismatic Neon-Ice & Drive System UI inspired by *Street Fighter 6*).
- **Target bar**: Anyone who has opened *Street Fighter 6*'s Options, Fighting Ground, Battle Settings, or World Tour screens recognizes **Rushdown** on sight with every official title, fighter render, and logo removed.

## 1. Candidate Lenses (3 Explored -> 1 Chosen)

Compared against the last 5 themes in `src/themes/AGENTS.md` and `src/extensions.json`:
- `Vesperglass` (dark twilight aubergine glass & astrolabe — Diegetic / Artifact)
- `Runeskald` (dark frost-slate Norse equipment tablet — Diegetic / Artifact)
- `Cropmark` (light Bristol comic rag paper & non-photo blue cropmarks — Diegetic / Artifact)
- `Vice Dusk` (dark charcoal-plum twilight pause menu & neon flamingo — Title / Pause Menu)
- `Studlock` (dark matte ABS charcoal baseplate & Canary Yellow bricks — Diegetic / Artifact)
- `Tatterspire` (dark slate fog & torn parchment sheets — Diegetic / Artifact)

| Lens | Concept | Comparison & Decision |
| --- | --- | --- |
| **(a) Diegetic / Artifact — World Tour Ruggedized Smartphone Shell** *(Dropped)* | Wrap Playnite inside the horizontal ruggedized dark phone bezel with brushed blue inner trim and Android hardware navigation icons on the right edge. | Four of the last five themes already use *Diegetic / Artifact*, and framing a dense desktop launcher inside a phone bezel wastes screen edge budget. **Harvested**: World Tour's **45° diagonal-tipped cyan header ribbons**, **diamond-capped technical divider rules**, and **unread notification pips**. |
| **(b) HUD / Telemetry — Fighting Ground & Battle Settings Prismatic Neon-Ice System** *(CHOSEN)* | Playnite's shell IS *Street Fighter 6*'s tournament telemetry & Options system: calm midnight indigo-obsidian canvas (`#0B0E1A` / `#0F1322`), **45° top-right chamfered dark navy capsules (`#151A2E`)** with steel-indigo rims (`#364268`), the unmistakable **Prismatic Faceted White-Ice Selection Crystal (`#E4F0FC` + `ice-facet.png` shards + `#0E1220` dark ink, 16.13:1)**, **Fighting Ground Neon Magenta (`#C4168C` / `#FF3CE0`)** & **Battle Hub Electric Cyan (`#18D8F2`)** accents, and the **6-segment slanted Drive Gauge Overdrive Green (`#168736` / `#7CE826`)** running state and progress bar. | **Freshest & most iconic.** Avoids repeating *Diegetic / Artifact* or *Vice Dusk*'s twilight purple pause screen, keeps library lists crisp and legible, and delivers *Street Fighter 6*'s signature faceted white-ice focus bars and slanted Drive Gauge. |
| **(c) Title / Pause Menu — Obsidian Asphalt Cube & Deep Violet Modal Stage** *(Dropped)* | Full-window deep violet `#36045A` stage with giant outlined graffiti typography across every surface. | Heavy saturated violet backgrounds collide visually with `Vice Dusk` and `Vesperglass` and hurt long-session readability. **Harvested**: the Title screen's **3D isometric street-graffiti hexagonal cube** for `BrandMarkTemplate` / `IconMainMenu`, the **`Information` modal's top-center downward V-notch pointer** on `LocalMenuBoardTemplate`, **Title Spray Neon Orange (`#FF6B1A`)** for `DataChangeNotifBrush`, and **Character Select's top-left Challenger Gold corner triangle (`#F5C518`)** on selected covers. |

## 2. Source DNA (5 Identifying Traits)

1. **Midnight Indigo-Obsidian Canvas + 45° Top-Right Chamfered Capsules (`#0F1322` / `#151A2E`)**: Calm deep indigo backdrops paired with crisp 45°-chamfered dark slate plates framed in `#364268` steel-indigo rims (`Options`, `Battle Settings` roster tiles).
2. **Prismatic Faceted White-Ice Selection Crystal (`#E4F0FC` + `ice-facet.png` + `#0E1220` Ink)**: Active Options rows, sidebar items, menu highlights, cover frames, and hovered chips snap into *Street Fighter 6*'s iconic faceted white-ice crystal gradient with `#0E1220` ink (`16.13:1`).
3. **Dual Neon Arcade Channel — Fighting Ground Magenta (`#C4168C` / `#FF3CE0`) & Battle Hub Cyan (`#18D8F2`)**: Neon magenta powers Play CTAs, modal top-notch rules, and left selection strike bars, while electric cyan drives focus rings, diagonal dossier ribbons, sliders, and metadata links.
4. **6-Segment Slanted Drive Gauge (`#168736` / `#7CE826` + `drive-segments.png`)**: The combat HUD's slanted parallelogram Drive segments animate `ProgressBar`, `PART_ProgressGlobal`, and `RunningIndicator` / `RunningActionIndicator` (`1.6s` overdrive sweep + 3 slanted Drive chevrons).
5. **Graffiti Cube Emblem, Diagonal Ribbons & Diamond-Capped Rules**: 3D isometric hex cube brand mark (`mark.svg`), World Tour 45°-tipped header ribbons, top-center modal V-notch, and `◇──────•───◇` diamond-capped dividers.

## 3. Game Element Map (12 Elements)

| Source Element (*Street Fighter 6*) | Playnite Surface |
| --- | --- |
| Title Screen 3D isometric street-graffiti cube | `BrandMarkTemplate` (`art/mark.svg`), `IconMainMenu`, Settings title band & `EmptyGameTemplate` |
| Options `[LB]` / `[RB]` glowing royal-blue tab strip | `DefaultControls/TabControl.xaml` & `Views/TopPanel.xaml` icon view switches |
| Options Prismatic Faceted White-Ice active row (`#E4F0FC`) | `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/Menu.xaml`, `DefaultControls/ComboBox.xaml`, `SidebarItem.xaml` |
| Fighting Ground Neon-Magenta framed hero strip | `HeroArt` upper laser bezel (`Views/*ViewGameOverview.xaml`) & `PlayButton.xaml` |
| `Information` confirmation modal (V-notch crown & `Yes` inner white-pink glow) | `DefaultControls/ContextMenu.xaml` (`LocalMenuBoardTemplate`), `ToolTip.xaml`, `PlayButton` hover glow rim |
| Options two-column diamond-capped vertical divider | `DividerTemplate` (`Common.xaml`), 6 `Meta*` group breaks, and `Menu.xaml` `SeparatorStyleKey` |
| World Tour `Safety Pin` / `Black Dye` diagonal cyan header card | Metadata dossier header ribbon & `DefaultControls/GroupBox.xaml` |
| Battle Settings 45° chamfered roster tile + gold corner triangle (`JAMIE`) | `DerivedStyles/GridViewItemStyle.xaml` (3px White-Ice frame + animated Challenger Gold top-left triangle) & `GridViewItemTemplate.xaml` (`50×50` chamfered hover buttons) |
| Combat HUD 6-segment slanted Drive Gauge | `DefaultControls/ProgressBar.xaml`, `12px` `PART_ProgressGlobal`, and `RunningIndicator` / `RunningActionIndicator` (`#168736`) |
| Options `< Value >` cyan slider bar & needle thumb | `DefaultControls/Slider.xaml` & `CustomControls/SearchBox.xaml` |
| Options Controls crisp 4px electric-blue vertical scrollbar | `DefaultControls/ScrollViewer.xaml` (`ScrollBarThumb`) |
| Title Spray Neon Orange splatter & `Loading` modal card | `PART_ToggleFilter` rotated Spray Orange cube `Dot` pip (`#FF6B1A`) & `EmptyGameTemplate` |

## 4. Signature Levers (Shell, Game Page & Menus)

| Lever | Rushdown Choice (Source-Derived) |
| --- | --- |
| **Hero banner transition** | **Fighting Ground Laser-Ruled Stage Bezel**: top/side stage frame (`2,2,2,0`) accented with glowing Neon Magenta (`#FF3CE0`) top hairline and Electric Cyan (`#18D8F2`) corner ticks + `GameBannerDarken` (`#280B2E` deep magenta-indigo stage tint + 50% floor), fading cleanly via `GameOverviewBackgroundBrush` bottom scrim. |
| **Play button architecture** | **45° Top-Right Chamfered Fighting Ground Neon-Magenta Drive Slab (`PlayButton.xaml`)**: `42px` tall, `MinWidth="156"`, `ControlCornerRadius=4px` outer host holding a chamfered `#C4168C` plate with `1.5px` `#FF3CE0` neon outer rim, subtle prismatic `ice-facet.png` shimmer, and `Rajdhani Bold` white label (`5.47:1`). Hover brightens to `#D91E9D` (`4.54:1`), lights an inner `2px` white-pink `Yes`-dialog glow rim, sweeps `prism-sheen.png`, and snaps `>>` chevrons in from right (`140ms BackEase`); press compresses to `#96106A` (`80ms`). |
| **Metadata container & group break** | **World Tour / Battle Settings Dossier Card (`#13182B`)**: `1.5px` `#364268` border, **24px diagonal-tipped Battle Hub Cyan header ribbon (`#117C96`)** with top-left Challenger Gold triangle & 3 slanted Drive ticks, `300px` usable inner width, and **10px Diamond-Capped Technical Callout Rules (`◇──────•───◇`)** between the 6 `Meta*` groups (collapsed in `Center`/`Stretch`). |
| **Chip & score silhouette** | **Chips (`PropertyItemButton.xaml`, `Tag="Chip"`)**: **45° Chamfered Options Capsules** (`#1E2642`, `#364268` border, `2px` left Battle Hub Cyan bar, `ControlCornerRadius=4px`) flipping to Prismatic White-Ice (`#E4F0FC`) with `#0E1220` ink (`16.13:1`) on hover. **Scores (`TextBlockGameScore`)**: **Combat HUD Match-Timer Octagonal Neon Plaques** (`#0B0E1A` core with double-lined octagonal rim colored by rating). |
| **Row & cover selection mark** | **Details rows**: hover fades a chamfered indigo capsule (`#1E2642`) with Electric Cyan rim and left `>` tick (`110ms`); selection snaps in the **Prismatic Faceted White-Ice Crystal Bar (`#E4F0FC` + `ice-facet.png`)** (`ScaleX 0.90->1`, `140ms CubicEase`) with a `4px` Neon Magenta left strike bar, sliding `#0E1220` `>>` chevron, and bold `#0E1220` ink (`+3px` nudge). **Grid covers**: hover lifts (`Scale 1.025`, `140ms`) into a `2px` Electric Cyan frame; selection locks a `3px` Prismatic White-Ice frame with outer Neon Magenta rim and drops the **14×14 Challenger Gold 45° Top-Left Corner Triangle (`#F5C518`)** into place (`BackEase 0.22`). |
| **Side-panel close plate** | **28×28 Top-Right 45° Chamfered Battle Capsule (`SidePanelCloseButton`)**: octagonal chamfered `#1E2642` cap with `1.5px` `#4D5E91` rim, `2px` Neon Magenta bottom-left tick, and `13px` `X`; hover fades (`120ms`) to P1 Burnout Crimson (`#CC1E38`) with white `X` (`5.51:1`). |
| **Popup menus & ComboBox lists** | **30px rows** on `LocalMenuBoardTemplate`: midnight indigo modal board (`#13182B`) in `1.5px` `#364268` border crowned by a **`2.5px` Neon Magenta (`#FF3CE0`) top rule dipping at top-center into the `Information` modal's downward V-notch**, with 6% bottom-right `prism-splash.png` texture. **Highlight**: Prismatic Faceted White-Ice Crystal Bar (`#E4F0FC` + `ice-facet.png`) with `3px` Neon Magenta left bar wipes in (`ScaleX 0.91->1`, `120ms CubicEase`) while an Options `>` stepper chevron slides in and label, icon, and submenu arrow invert to `#0E1220` (`16.13:1`, `+2px` nudge). **Group break**: `10px` diamond-capped rule (`DividerTemplate`). **Shortcuts**: `[LB]`/`[RB]` dark bumper pills (`#0B0E1A`, `Consolas`) inverting to `#0E1220` pills with Electric Cyan text on highlight. **Marked rows**: Exit (`Alt+Q`) uses `#FF4D6A` crimson at rest (`5.47:1`) and a solid `#CC1E38` Burnout Crimson plate with `3px` white bar and white text/icon/chevron (`5.51:1`) on highlight; checked rows show a **15×15 Hexagonal Battle Hub Cyan `[✓]` Gem Badge**. |

## 5. Moments

- **Hero moment**: `PlayButton` hover & press — 45° chamfered Neon Magenta slab lights its `Information` modal white-pink inner glow rim, sweeps `prism-sheen.png`, brightens to `#D91E9D`, and snaps `>>` arcade chevrons in from right (`140ms BackEase`); press compresses cleanly (`80ms`).
- **Secondary moments (7)**: Details row hover & Prismatic White-Ice crystal selection; Grid cover lift & Challenger Gold corner triangle lock-in; `50×50` chamfered `GridTileButton` staggered pop (`55ms` stagger); Prismatic White-Ice popup menus & ComboBox lists; `44px` sidebar active White-Ice plate with `3px` Neon Magenta edge bar; `28px` Settings tree selection with held indigo wash, `3px` White-Ice/Magenta bar & cyan diamond pip; `[LB]`/`[RB]` tabs, hexagonal cyan checkboxes, cyan needle slider, and 6-segment slanted Drive Gauge progress bar.
- **Ambient loops (sparse areas only)**: `EmptyGameTemplate` calm `4.2s` breathing glow around the 3D isometric street-graffiti cube emblem (`RemoveStoryboard` on exit); `RunningIndicator` / `RunningActionIndicator` `1.6s` slanted 6-segment Drive Gauge Overdrive Green sweep (`#168736`) + filling foot bar + 3 slanted Drive chevrons while launching, transitioning to a quiet `3.0s` idle pulse while running.

## 6. Motion Language

- **Durations**: Fast `110ms` (hovers, press, menu highlight), Base `150ms` (White-Ice crystal wipe, cover lift, cover buttons, tab switch), Slow `260ms` (crystal sheen decay, hover exits `FillBehavior="Stop"`).
- **Easing**: Crisp arcade snap — `CubicEase` (`EaseOut`) on horizontal Prismatic White-Ice wipes; `BackEase` (`Amplitude="0.18–0.22"`) on cursor chevrons, Challenger corner badges, and cover buttons; clean `CubicEase` on exits.
- **Direction**: Horizontal left-to-right crystal lock (`ScaleX`, sliding `>` / `>>`, `+2px`/`+3px` label nudge); vertical `-8px -> 0` pop on cover controls.

## 7. Brand Identity

- **Name**: **Rushdown** (`rushdown`, `src/themes/Rushdown`) — original fighting-game archetype name; zero trademarks.
- **Brand Mark (`art/mark.svg` / `BrandMarkTemplate` / `IconMainMenu`)**: Original **3D Isometric Chamfered Street-Graffiti Hexagonal Cube** silhouette echoed from the Title Screen centerpiece. Reused in `PART_ElemMainMenu`, Settings title band, `EmptyGameTemplate`, and `info/icon.png` (default `#FF7A1A`).
- **`GameBannerTintBrush`**: `--rd-magenta-tint` (`#280B2E`), deep Fighting Ground magenta-indigo stage tint.

## 8. Restraint

- Dense game lists, cover grid backgrounds, and descriptions stay on calm solid `#0F1322` / `#13182B`; `prism-splash.png` graffiti shards appear strictly in sparse chrome (Settings title band, popup bottom-right corner, empty game page) at `<= 8%` opacity.
- Zero `DropShadowEffect`, zero `OpacityMask` on art behind animated controls, pure white RGBA masks for all procedural textures, and verified `>= 4.5:1` contrast across all states.
