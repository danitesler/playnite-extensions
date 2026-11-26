# Vice Dusk — Creative Brief

- **Ambition**: `Showcase` (maximum craft, original Vice twilight & coastal pause-menu UI system inspired by *Grand Theft Auto VI*).
- **Target bar**: Anyone who has studied the *GTA VI* Pause, Map, Progress, Dossier, or Settings screens recognizes **Vice Dusk** immediately with every title, character name, and Rockstar mark stripped away.

## 1. Candidate Lenses (3 Explored -> 1 Chosen)

Compared against the last 5 themes in `src/themes/AGENTS.md` and `src/extensions.json`:
- `Cogplate` (dark phosphor green CRT ordnance visor — HUD / Telemetry)
- `Vesperglass` (dark twilight aubergine glass & astrolabe — Diegetic / Artifact)
- `Runeskald` (dark frost-slate Norse equipment tablet — Diegetic / Artifact)
- `Cropmark` (light Bristol comic illustration paper & non-photo blue cropmarks — Diegetic / Artifact)

None of the last 5 themes use a **Title / Pause Menu** lens, and none use the stark white-to-fade selection bar, sleek 2px neon flamingo top rules, or twilight plum dusk + palm silhouette vocabulary:

| Lens | Concept | Comparison & Decision |
| --- | --- | --- |
| **(a) Title / Pause Menu — Vice Twilight Pause & Settings System** *(CHOSEN)* | Playnite's shell IS the *GTA VI* Pause / Settings / Dossier suite: deep charcoal-plum chrome (`#1C1726` / `#241D30`), stark white rail tile with a 3px neon flamingo left bar, left-to-right fading white selection bars (`Targeting` / `Default`) with dark plum ink, 2px neon-pink-crowned floating slate cards (`FIX YOUR CAR`), `JASON DUVAL` pink-underlined key-value dossier ledger, `PROGRESS` crisp 2px white-framed portrait cards, and twilight plum dusk + layered palm silhouettes on hero bands and Settings. | **Freshest & most recognizable.** Zero overlap with the last 5 Diegetic/CRT themes, directly faithful to the 6 captured pause/settings/dossier screens, and keeps dense library lists calm while delivering unmistakable coastal dusk glamour. |
| **(b) HUD / Telemetry — Leonida GPS & Cash Overlay** *(Dropped)* | Bright turquoise coastal map backdrop, `$992` cash badges, `Sunbelt Hwy` green pills, wanted-star HUD corners. | Bright ocean cyan across full library panels would clash with game cover art and feel loud for everyday browsing. We still harvest **Leonida GPS Cyan (`#2EC4E8`)** for Running/Launching, **Sunbelt Emerald (`#2DB874`)** for positive ratings/cash accents, and **Rail Gold (`#F2C94C`)** diamonds for active filter pips. |
| **(c) Diegetic / Artifact — Smartphone Social Feed** *(Dropped)* | Rounded mobile cards, vertical video frames, social feed badges. | Too generic/web-app-like and drifts away from the iconic sleek pause/settings/dossier chrome captured in the primary reference screens. |

## 2. Source DNA (5 Identifying Traits)

1. **Vice Twilight Plum + Palm Dusk (`#513460` / `#8A508A` / `#2E1A3B`)**: Deep plum-charcoal shell surfaces (`#1C1726` / `#231D30`) paired with twilight magenta-plum dusk gradients and subtle dark palm frond silhouettes in sparse chrome (Settings title band, hero banner dusk scrim, empty game page).
2. **White-to-Fade Selection Slab (`#F7F4FA` -> `#C9B2CE` + `#191223` Ink)**: The unmistakable *Settings* focus bar (`Default`, `Targeting`) and *Map* active rail plate — solid crisp white on the left fading smoothly across the row with deep plum ink text and a 3px neon flamingo left bar.
3. **2px Neon Flamingo Top Rules & Underlines (`#F47BB8` / `#FE9ECE`)**: Razor-sharp 2px flamingo-pink accent rules crowning dark slate floating cards (`FIX YOUR CAR`), underlining dossier headings (`JASON DUVAL`), and lighting active top navigation labels (`MAP`, `PROGRESS`).
4. **Photo-Framed 2px White Cover Outlines (`PROGRESS` Cards)**: Sharp `2px` corners with a crisp `2px` white frame and dark translucent bottom label strip on selected covers (`STATS`), separating photo art cleanly from the plum dusk ground.
5. **Condensed Grotesk Caps + Hairline Ledger Rhythm (`Barlow Condensed` + `Barlow`)**: Tightly tracked uppercase `Barlow Condensed` headers paired with `Barlow` body copy, thin translucent lavender hairlines between metadata rows, pink-filled bar sliders, and gold diamond rail pips.

## 3. Game Element Map (11 Elements)

| Source Element (*GTA VI* Captures) | Playnite Surface |
| --- | --- |
| *Settings* `Targeting` / `Default` white-to-fade focus bar + 3px pink edge | `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml`, `DefaultControls/Menu.xaml` |
| *Map* left category rail (white active plate + 3px pink bar + gold diamond pips) | `Views/Sidebar.xaml` & `CustomControls/SidebarItem.xaml`, plus `PART_ToggleFilter` (`DataChangeNotifBrush` `#F2C94C` gold diamond pip) |
| *Exploration* / *Fix Your Car* 2px flamingo-pink-crowned dark slate card | `DefaultControls/ContextMenu.xaml` (`LocalMenuBoardTemplate`), `DefaultControls/ToolTip.xaml`, `DefaultControls/GroupBox.xaml` |
| *Progress* (`STATS` / `VEHICLES`) 2px white-framed card + dark bottom band | `DerivedStyles/GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml` (sharp 2px corners + 2px white frame + 50x50 crisp action buttons) |
| *Jason Duval* character dossier (pink-underlined uppercase header + key-value ledger) | `Views/DetailsViewGameOverview.xaml` & `Views/GridViewGameOverview.xaml` metadata pane |
| *Settings* `CONTROL SCHEME` / `GAMEPLAY` stark white active tab plate + `L1`/`R1` caps | `DefaultControls/TabControl.xaml` & active view switches in `Views/TopPanel.xaml` |
| *Gameplay* `Aim Assist Strength` pink-filled horizontal bar + vertical needle thumb | `DefaultControls/Slider.xaml` (`SliderTrack` pink fill + crisp white/pink needle thumb) |
| *Gameplay* `Shooting Assist` flamingo-pink pill switch & *Control Scheme* pink-dot radio | `DefaultControls/CheckBox.xaml` & `DefaultControls/RadioButton.xaml` |
| *Map* `Sunbelt Hwy` / `$992` emerald tags + *Control Scheme* `L1` / `?` / `?` prompt caps | `DerivedStyles/PropertyItemButton.xaml` (chips & key prompts) + `TextBlockGameScore.xaml` + menu shortcut caps |
| *Settings* twilight plum gradient + layered palm frond silhouettes | `DerivedStyles/StandardWindowStyle.xaml` (44px title band + dusk palm silhouettes) & `EmptyGameTemplate` (dusk palm horizon + breathing dusk reticle) |
| *Map* electric cyan coastal GPS route (`#2EC4E8`) | `RunningIndicator` & `RunningActionIndicator` (`RunningIndicatorBrush` `#2EC4E8` GPS route sweep + segmented route foot line + 3 staggered signal pips) |

## 4. Signature Levers (Shell, Game Page & Menus)

| Lever | Vice Dusk Choice (Source-Derived) |
| --- | --- |
| **Hero banner transition** | **Twilight Plum Dusk Gradient + Subtle Palm-Horizon Foot Vignette**: hero art fades seamlessly at the bottom through a twilight plum dusk scrim (`GameOverviewBackgroundBrush` `#1E1829` with subtle dusk-plum mid stop) framed by a thin `1px` translucent lavender top/bottom hairline and a 2px neon-pink accent tick under the title. |
| **Play button architecture** | **Flamingo-Crowned Vice Action Slab (`PlayButton.xaml`)**: sharp `2px` chamfered/crisp rectangle in vivid **Flamingo Pink (`#F47BB8`)** with deep plum ink (`#191223`), a crisp `2px` white top specular cap bar, and a subtle left vertical notch; hovering sweeps a crisp white-to-pink sheen (`white-sheen.png`) across the slab and ignites a soft flamingo rim bloom (`bloom.png`); pressing sinks into a deeper rose plate (`#D45A98`). |
| **Metadata container & group break** | **`JASON DUVAL` Character Dossier Ledger**: recessed dark aubergine-slate ledger (`#241E30`) crowned by a crisp **2px Neon Flamingo Pink top rule**, with thin `1px` translucent lavender hairlines (`rgba(220,200,235,0.14)`) and a subtle left pink tick as the 6 `Meta*` group breaks (collapsed in `Center`/`Stretch` so items pack cleanly in 3/2/1 columns). |
| **Chip & score silhouette** | **Prompt-Tag Chips (`PropertyItemButton`)**: sharp `2px`-corner dark slate tags (`#2C253A`) with a crisp `1px` lavender-plum rim and `2px` flamingo-pink left bar (`Tag="Chip"`), inverting to stark white with dark ink on hover. **Scores (`TextBlockGameScore`)**: crisp framed numeric plaques with a 2px top accent bar (emerald/gold/crimson by rating) echoing `$992` / `LVL 3/4` status badges. |
| **Row & cover selection mark** | **Details rows**: horizontal left-to-right **white-to-lavender fade sweep** (`ScaleX 0.92 -> 1`, `160ms`) + `3px` neon flamingo-pink left edge bar + deep plum ink text (`#191223`) with a `+3px` label glide (`Default` / `Targeting` focus bar). **Grid covers**: `2px` corners lock into a crisp **2px Stark White `PROGRESS`-card outline** with a `2px` flamingo-pink top bar and subtle lift (`Scale 1.024`). |
| **Side-panel close plate** | **28x28 Vice Pause Close Cap (`SidePanelCloseButton`)**: sharp `2px` dark slate square (`#2A2438`) with a `1px` lavender rim and a crisp `2px` flamingo-pink top hairline; hovering fills Siren Crimson (`#C82843`) with crisp white `X` (`120ms`). |
| **Popup menus & ComboBox lists** | **30px rows** on `LocalMenuBoardTemplate`: smoked charcoal-plum drawer (`#231E30`), `1px` lavender-slate border, **`2px` Neon Flamingo Pink top crown rule** (`FIX YOUR CAR` card), and faint `palm-dusk.png` watermark in the bottom-right corner. **Highlight**: the iconic *Settings* **white-to-lavender fade selection bar** (`ScaleX 0.90 -> 1`, `120ms`) with a `3px` flamingo-pink left bar and deep plum ink text (`> 10:1` contrast), plus a crisp `?` white/pink cursor nudge. **Group break**: `10px` translucent lavender hairline led by a `6px` neon-pink horizontal dash. **Shortcuts**: crisp *Control Scheme* **rounded/chamfered dark keycap badges** (`L1`/`F4`) with `1px` rim, inverting to dark plum ink on white highlight. **Marked rows**: Exit (`Alt+Q`) uses Siren Crimson (`#C82843`) text/cap at rest and solid Siren Crimson bar with crisp white text (`5.35:1`) on highlight; checked rows draw a **flamingo-pink dot inside a crisp white ring** (matching *Control Scheme* radio/check indicators). |

## 5. Moments

- **Hero moment**: `PlayButton` hover & press — solid **Flamingo Pink (`#F47BB8`)** Vice slab with `2px` white top specular cap and deep plum ink (`#191223`); hovering sweeps a horizontal white-pink light sheen (`sheen-sweep.png`), illuminates an outer flamingo rim bloom (`bloom.png`), and snaps two crisp `2px` white corner ticks (`160ms` `CubicEase`); pressing depresses into deep rose (`#D45A98`, `90ms`).
- **Secondary moments (7)**:
  1. **Details row hover & click/selection**: translucent lavender-plum wash + thin pink left pip on hover (`120ms`); click/selection sweeps the signature **white-to-lavender fade plate** (`ScaleX 0.92 -> 1`, `160ms`) with a `3px` flamingo-pink left bar and dark plum ink (`+3px` label glide).
  2. **Grid cover hover & click/selection**: cover lifts (`Scale 1.024`, `160ms`) with a soft flamingo top bar and white corner ticks; click/selection locks the crisp **2px Stark White `PROGRESS` frame** + flamingo-pink top accent strip with a clean settle.
  3. **Cover hover controls (`GridTileButton`)**: `50x50` sharp `2px` dark slate squares crowned by a `2px` pink top line (white/pink on Play), rising `-8px -> 0` with `BackEase` (`0.18`) and `50ms` stagger.
  4. **Popup menus & ComboBox lists**: `LocalMenuBoardTemplate` (flamingo-crowned dark drawer), 30px white-fade highlight bar with 3px pink edge, pink-dash hairline breaks, inverting keycap shortcuts, and Siren Crimson Exit.
  5. **Sidebar selection**: 44px dark charcoal-plum rail (`#1C1726`) closed by a `1px` lavender hairline; crowned by a flamingo-pink & plum **Vice Dusk** main-menu tile; active item takes the *Map* rail's **Stark White square plate (`#F7F4FA`) with a 3px Flamingo Pink left edge bar** and dark plum icon!
  6. **Settings tree selection (`TreeView.xaml`)**: bare 28px `Barlow` rows (no boxed cards), soft plum wash on hover (`120ms`), held **white-to-lavender fade wash** (or deep plum-pink wash with 2px flamingo left bar & bright white label, keeping `TextBrush` readable per `settings-screens.md`: held plum-pink wash + `2px` neon flamingo left bar + crisp white label) (`180ms`).
  7. **Controls**: *Gameplay*-style pink-filled `Slider` with crisp vertical needle thumb; flamingo pill/square `CheckBox`; *Control Scheme*-style pink-dot `RadioButton`; *Settings*-style stark-white active `TabItem` (`#F7F4FA` plate, dark plum ink `#191223`).
- **Ambient loops (sparse areas only)**:
  1. `EmptyGameTemplate`: calm `5.0s` gentle breathing opacity (`0.6 <-> 1.0`) on the twilight dusk palm-horizon & Vice Dusk diamond-sun reticle (stopped via `RemoveStoryboard` when any game is selected).
  2. Launching/Running indicators: `1.6s` **Leonida GPS Cyan (`#2EC4E8`)** route-pulse sweep + filling cyan GPS track foot line + 3 staggered cyan GPS signal bars while launching; calm `3.2s` breathing cyan frame & staggered idle signal while running.

## 6. Motion Language

- **Durations**: Fast `120ms` (hovers, press, menu highlight, checkbox/radio), Base `170ms` (white-fade row selection, cover lift, cover buttons, tab switch), Slow `300ms` (Play bloom decay, hover exit `FillBehavior="Stop"`).
- **Easing**: `CubicEase` (`EaseOut` enter, `EaseInOut` exit) for crisp modern console-menu poise; restrained `BackEase` (`Amplitude="0.18"`) for cover button rise (`50ms` stagger).
- **Direction**: Horizontal left-to-right sweep (`ScaleX`, `+2px` to `+3px` label glide, echoing the white-to-fade bar); upward `-8px -> 0` pop on cover controls.

## 7. Brand Identity

- **Name**: **Vice Dusk** (`vicedusk`, `src/themes/Vice Dusk`) — original name celebrating twilight palm silhouettes over coastal magenta dusk; zero trademarks or official titles.
- **Brand Mark (`art/mark.svg` / `BrandMarkTemplate` / `IconMainMenu`)**: Original **Sunset Palm Horizon Emblem** — a crisp geometric twilight horizon frame enclosing a rising dusk sun disc bisected by two clean coastal palm frond silhouettes and a sharp horizon line. Reused in the main menu button, Settings title band, empty game page, and orange add-on tile (`info/icon.png`).
- **`GameBannerTintBrush`**: `--vd-dusk-deep` (`#2B1836`), the deep Vice twilight plum of the Settings/Progress backdrop, so ThemeModifier banner darkening wraps hero art in lush coastal plum dusk rather than flat black.

## 8. Restraint

- Dense library lists, cover grid backgrounds, and metadata body text stay calm solid deep charcoal-plum (`#1C1726` / `#231D30`), keeping the subtle palm silhouette mask (`palm-dusk.png`) strictly in sparse chrome (Settings title band, popup menu bottom corner, empty game page) at <= 10% opacity.
- Zero `DropShadowEffect`, zero `OpacityMask` on art behind animated controls, pure white RGBA masks for all generated textures, and strict >= 4.5:1 contrast on every interactive text pair.
