# Testbed — Creative Brief

- **Ambition**: `Showcase` (maximum craft, clinical modular test-chamber architecture inspired by *Portal 2*).
- **Target bar**: Anyone who has played *Portal 2* or navigated its stepped test-chamber Options, Save Game, Bot Customization, Workshop, or Loading screens recognizes **Testbed** immediately with every character, logo, and Aperture name removed.

---

## 1. Candidate Lenses (3 Explored -> 1 Chosen)

Compared against the last 5 themes in `src/themes/AGENTS.md` and `src/extensions.json`:
- `Runeskald` (dark frost-slate Norse equipment tablet — Diegetic / Artifact)
- `Cropmark` (light warm Bristol comic illustration board & non-photo blue — Diegetic / Artifact)
- `Vice Dusk` (dark charcoal-plum twilight pause menu & neon flamingo — Title / Pause Menu)
- `Studlock` (dark matte charcoal ABS brick workshop & Canary Yellow — Diegetic / Artifact)
- `Tatterspire` (dark torn slate paper & torch gold — Diegetic / Artifact)

Four of the last five themes are dark, and the single light theme (`Cropmark`) uses warm cream editorial paper and comic ink. None uses a clinical cool aluminum modular-tile facility aesthetic with dark carbon structural chrome and Portal Blue / Propulsion Orange polarity:

| Lens | Concept | Comparison & Decision |
| --- | --- | --- |
| **(a) Diegetic / Artifact — Clinical Modular Test-Chamber Panel Wall** *(CHOSEN)* | Cleanroom cool aluminum wall panels (`#E2E5E8` / `#F2F4F6`) divided by crisp `1px` modular tile seams (`panel-grid.png`), framed inside dark carbon structural chrome (`#292B2E` rail & top bar from *Bot Customization* / *Skins*). Stepped top-left chamber tabs crown popups & the metadata dossier, Aperture Charcoal (`#343639`) inversion bars sweep across selected rows & menus, Portal Blue (`#0D77A3` / `#1CA8E3`) drives CTAs & brackets, and Propulsion Orange (`#C64E08` / `#F47A1F`) drives the Running/Launching chamber loop. | **Freshest & most iconic.** Instantly separates itself from all 5 recent themes (and avoids warm cream overlap with `Cropmark`) while keeping dense library lists bright, crisp, and effortless to read. |
| **(b) HUD / Telemetry — Overgrown Ruin & Crosshair HUD** *(Dropped)* | Dark mossy facility shadows (`main-menu.jpg`) with floating cyan/orange crosshair rings and dark terminal bars. | Repeats dark slate/charcoal surfaces across 4 of the last 5 themes and discards Portal 2's defining modular white wall panels and stepped options sheets. Harvested: dual-arc crosshair brand mark, 12-dot antline progress tracks (`loading.jpg`), and crisp `[E]` keycap prompts (`pick-up.jpg`). |
| **(c) Title / Pause Menu — Perpetual Testing Dark Grey Grid** *(Dropped)* | Mid-grey (`#5F6366`) Workshop slabs with pale yellow selection bars. | Mid-grey walls muddy contrast against diverse game art. Harvested: Aperture Caution Yellow (`#E2B824`) for the active filter pip & notifications, and the clean Evaluation card layout (`test-chamber-evaluation.jpg`) for score plaques & empty states. |

---

## 2. Source DNA (5 Identifying Traits)

1. **Cleanroom Aluminum Wall + Dark Carbon Tile Chrome (`#E2E5E8`/`#F2F4F6` + `#292B2E`)**: Sharp `0px` modular square wall panels framed by dark carbon rail and top chrome bands — directly mirroring *Bot Customization* and *Skins*.
2. **Stepped Top-Left Chamber Tabs (`options.jpg`, `save-game.jpg`, `test-chamber-evaluation.jpg`)**: Signature stepped top-left tab silhouette rising above rectangular white panels, uniting popup menus, Settings title bands, selected grid covers, and the metadata dossier.
3. **Aperture Charcoal Inversion Bars + Luminous Cyan Slit (`#343639` + `#1CA8E3`)**: High-contrast dark charcoal selection slabs sweeping cleanly over white tiles (`11.29:1` white text), punctuated by a sharp `3px` Portal Cyan leading slit.
4. **Chamber Indicator Antlines (`antline-dots.png`)**: Crisp circular dot lines (`• • •`) running through progress bars, global loading bars, menu group breaks, metadata dividers, and Propulsion Orange running tracks.
5. **Dual-Portal Polarity (`#0D77A3` Blue Play vs `#C64E08` Propulsion Orange Running)**: Unmistakable complementary portal hues separating normal interaction (Portal Blue), running/launching states (Propulsion Orange), caution filter pips (Yellow `#E2B824`), and Thermal Laser Danger (Crimson `#C42334`).

---

## 3. Game Element Map (12 Elements)

| Source Element (*Portal 2*) | Playnite Surface |
| --- | --- |
| *Bot Customization* dark carbon header/footer tile bands | `Views/Sidebar.xaml` (`#292B2E` 44px left rail) & `Views/TopPanel.xaml` (`#2E3135` 48px top bar) |
| *Bot Customization* cleanroom modular white panel canvas | `Views/Library.xaml`, metadata dossier, and calm list/grid backgrounds (`#E2E5E8` / `#F2F4F6`) |
| *Options* / *Save Game* stepped top-left panel silhouette | `DefaultControls/ContextMenu.xaml` (`LocalMenuBoardTemplate`), metadata dossier crown, & Settings header tab |
| *Options* solid dark charcoal selection bar (`AUDIO`) | `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml`, `DefaultControls/Menu.xaml` |
| *Bot Customization* L-shaped black/cyan viewport brackets | `DerivedStyles/GridViewItemStyle.xaml` hover brackets & `PlayButton.xaml` hover lock |
| *Skins* `ADD TO CART` / `STORE` Portal Blue action bar | `DerivedStyles/PlayButton.xaml` (`#0D77A3` slab + `#1CA8E3` cyan slit + sheen sweep + bloom) |
| *Loading Screen* bottom-right circular dot sequence | `DefaultControls/ProgressBar.xaml` & `12px` `PART_ProgressGlobal` antline dots (`antline-dots.png`) |
| *Chamber* cyan/orange antline dots & thermal laser glow | `RunningIndicator` / `RunningActionIndicator` (`#C64E08` Propulsion Orange sweep + dotted antline foot + 3 beacon dots) |
| *Video* downward-triangle marker track slider (`Brightness`) | `DefaultControls/Slider.xaml` (`SliderTrack` fill + crisp downward triangle thumb) |
| *Skins* stepped category tabs (`SKINS` / `HEADWEAR`) | `DefaultControls/TabControl.xaml` & icon-only view switches in `Views/TopPanel.xaml` |
| *Pick Up* `[E]` crisp square keycap prompt (`pick-up.jpg`) | `Menu.xaml` `[F4]` shortcut keycaps & `PropertyItemButton.xaml` modular tag tiles |
| *Chapter* / *Dual-Arc Crosshair* standby screen | `EmptyGameTemplate` in Details & Grid views (modular test wall grid + breathing Dual-Arc Aperture mark) |

---

## 4. Signature Levers (Shell, Game Page & Menus)

| Lever | Testbed Choice (Source-Derived) |
| --- | --- |
| **Hero banner transition** | **Charcoal Observation-Bay Frame + Chamber Seam Foot (`Views/*ViewGameOverview.xaml`)**: `2px` top/left/right Aperture Charcoal border with modular vertical panel seam ticks along the upper edge, smooth page-matched gradient scrim (`PageRoot.Background.Color`, NO `OpacityMask` on art behind animated controls), closed by a `2px` grout rule led by a Portal Blue accent bar. |
| **Play button architecture** | **Portal Blue Architectural Slab with Luminous Cyan Slit (`DerivedStyles/PlayButton.xaml`)**: `0px` `#0D77A3` plate (`MinWidth="156"`), `1.5px` deep portal border (`#085170`), `3px` Portal Cyan (`#1CA8E3`) left slit bar; **Hero Hover**: 9-slice `portal-bloom.png` rim glow, angled `portal-sheen.png` energy sweep (`220ms`), 4 internal viewport corner brackets snapping inward (`150ms`), and brightened cyan edge; **Press**: recessed `#085170` (`90ms`). |
| **Metadata container & group break** | **Stepped-Tab Test-Chamber Dossier (`#F2F4F6`)**: crisp modular white tile with 3% `panel-grid.png` wall seams, `1.5px` steel grout border, `2px` bottom shadow lip, crowned by a **protruding stepped top-left dark charcoal tab bar (`8px` tall, `42%` wide) with a `2px` Portal Blue top line and 3 cyan indicator dots** (no unlocalized text). Holds `300px` usable inner width. **6 `Meta*` group breaks**: `1px` steel grout rule led by 3 Portal Blue circular antline dots (`• • •`), collapsed cleanly in `Center`/`Stretch`. |
| **Chip & score silhouette** | **Modular Aluminum Tile Chips (`PropertyItemButton`, `Tag="Chip"`)**: `0px` `#E4E8EC` tiles with `1px` steel rim, `2px` bottom bevel lip, and a `3x3` top-left Portal Blue corner pip (inverting cleanly to `#343639` charcoal with `#F5F7F9` text on hover). **Scores (`TextBlockGameScore`)**: crisp framed numeric plaques with `1.5px` charcoal top/bottom bars, `4px` semantic left bar, and tabular `Barlow Condensed` numerals. |
| **Row & cover selection mark** | **Details rows**: hover fades cool aluminum tile wash (`#CFD4D8`, `110ms`) + `2px` Portal Blue left tick; click/selection sweeps **Aperture Charcoal (`#343639`)** left-to-right (`ScaleX 0.92->1`, `150ms` `CubicEase`) with a `3px` Portal Cyan left slit and crisp `#F5F7F9` white text (`+3px` glide). **Grid covers**: hover lifts (`Scale 1.022`, `140ms`) as 4 Portal Cyan L-corner viewport brackets snap inward; click/selection locks a `2.5px` Charcoal + `2px` Portal Cyan twin frame topped by a centered stepped Portal Blue chamber tab. |
| **Side-panel close plate** | **28x28 Chamber Hatch Tile (`SidePanelCloseButton`)**: `0px` `#F2F4F6` modular cap, `1.5px` charcoal border, `2px` bottom shadow lip, `3x3` top-left Portal Blue notch, `14px` bespoke `IconWindowClose` glyph; hover fills Thermal Crimson (`#C42334`) with white `X` (`120ms`). |
| **Popup menus & ComboBox lists** | **30px rows** on `LocalMenuBoardTemplate`: cleanroom white stepped-tab panel (`#F2F4F6`), `4.5%` `panel-grid.png`, `1.5px` charcoal border, `2px` bottom shadow lip, and **protruding top-left charcoal stepped tab cap (`6px` tall, `38%` wide) with `2px` Portal Cyan top line + 3 cyan dots**. **Highlight**: solid Aperture Charcoal (`#343639`) inversion bar wipes left-to-right (`ScaleX 0.90->1`, `120ms` `CubicEase`) with a `3px` Portal Cyan left slit, sliding white `▶` chevron, and label/icon/arrow inverting to `#F5F7F9` (`11.29:1`, `+2px` nudge). **Group break**: 5-dot Portal Blue antline segment (`• • • • •`) leading into a `1px` steel hairline (`10px` height). **Shortcuts**: white `[F4]` keycaps (`1px` charcoal rim, `2px` bottom bevel lip) inverting to dark `#24272B` keycaps with Portal Cyan rim and white text on highlight. **Marked rows**: Exit (`Alt+Q`) uses Thermal Crimson (`#C42334`) label/icon/cap rim at rest and solid Crimson inversion bar with white slit/text/icon (`5.77:1`) on highlight; checked rows draw a `14x14` charcoal-rimmed square chamber switch box with a Portal Blue square core + white check. |

---

## 5. Moments

- **Hero moment**: `PlayButton` hover & press — `#0D77A3` Portal Blue slab with `3px` Portal Cyan left slit; hover illuminates the 9-slice `portal-bloom.png` halo, sweeps `portal-sheen.png` diagonally (`220ms`), snaps 4 internal viewport brackets inward (`150ms`), and intensifies the cyan slit; press drops cleanly into recessed `#085170` (`90ms`).
- **Secondary moments (7)**:
  1. **Details row hover & click/selection**: `#CFD4D8` modular grey tile fade + blue edge tick (`110ms`); click/selection sweeps Aperture Charcoal (`#343639`) + `3px` Portal Cyan slit + crisp white `+3px` nudge (`150ms`).
  2. **Grid cover hover & click/selection**: cover lifts (`Scale 1.022`, `140ms`) into snapping Portal Cyan L-brackets; click/selection locks the `2.5px` Charcoal + `2px` Cyan twin frame with stepped top Portal Blue tab.
  3. **Cover hover controls (`GridTileButton`)**: `50x50` sharp modular tiles (Portal Blue Play/Install, Aperture Charcoal Info) sliding up `-8px -> 0` (`150ms`, `55ms` stagger).
  4. **Popup menus & ComboBox lists**: Stepped-tab white chamber board (`LocalMenuBoardTemplate`), charcoal inversion + cyan slit highlight, 5-dot antline breaks, `[F4]` keycaps, Crimson Exit, blue square check boxes.
  5. **Sidebar selection**: `44px` dark carbon tile rail (`#292B2E`) closed by `1px` steel grout seam; crowned by a `44x48` carbon-and-cyan **Testbed** Dual-Arc main menu tile; active item snaps into cleanroom white/Portal Blue stepped rail tile with crisp icon & `3px` cyan edge slit.
  6. **Settings tree selection (`TreeView.xaml`)**: bare 28px `Barlow Semi Condensed` rows (no boxed idle plates), `#CFD4D8` tile wash on hover (`110ms`), solid Aperture Charcoal (`#343639`) held plate + `2px` Portal Cyan left bar + crisp `#F5F7F9` label on selected (`170ms`).
  7. **Controls**: Downward-triangle marker `Slider`, square chamber switch `CheckBox`, circular portal-dot `RadioButton`, antline-dot `ProgressBar`, dark carbon `ScrollBarThumb`, stepped `SKINS` `TabControl`, dark carbon-and-cyan `ToolTip`.
- **Ambient loops (sparse areas only)**:
  1. `EmptyGameTemplate`: calm `4.4s` gentle opacity breathing (`0.60 <-> 1.0`) on the **Dual-Arc Chamber Aperture Emblem** over clean modular wall tile lines (stopped via `RemoveStoryboard` when any game is selected).
  2. Launching/Running indicators: `1.6s` **Propulsion Orange (`#C64E08` / `#F47A1F`)** sweep + antline-dotted orange foot fill (`antline-dots.png`) + 3 staggered circular orange beacon dots while launching; quiet `3.0s` breathing orange frame & staggered dot wave while running.

---

## 6. Motion Language

- **Durations**: Fast `110ms` (hovers, press snap, menu row highlight, checkbox/radio), Base `160ms` (charcoal selection sweep, cover bracket lock, cover buttons, tab switch), Slow `240ms` (Play sheen pass & exit decay `FillBehavior="Stop"`).
- **Easing**: `CubicEase` (`EasingMode="EaseOut"` on enter, `EaseInOut` on exit) — crisp mechanical/architectural precision matching hydraulic test-chamber panels, zero bounce or jelly overshoot.
- **Direction**: Horizontal left-to-right sweep (`ScaleX`, `+2px`/`+3px` label glide, left cyan slit activation); clean inward bracket lock on Play/covers; vertical `-8px -> 0` entrance on cover controls.

---

## 7. Brand Identity

- **Name**: **Testbed** (`testbed`, `src/themes/Testbed`) — original name celebrating modular testing chambers and cleanroom experimental rigs; zero trademarks or official titles.
- **Brand Mark (`art/mark.svg` / `BrandMarkTemplate` / `IconMainMenu`)**: Original **Dual-Arc Chamber Aperture Emblem** — a crisp square modular tile frame with 4 corner tile notches framing a centered vertical portal slit flanked by two offset opposing elliptical arcs. Reused in `PART_ElemMainMenu`, Settings title band, `EmptyGameTemplate`, and `info/icon.png` (default `#FF7A1A` orange).
- **`GameBannerTintBrush`**: `--tb-wall-base` (`#E2E5E8`, light aluminum chamber wall) so ThemeModifier banner darkening washes hero art cleanly into the bright cleanroom wall rather than black.
- **Light-Theme Window Background Flip**: Defines `WindowArtForegroundBrush` (`#F5F7F9`, crisp white) so unselected list rows, Expander/group headers, filter labels, and game titles stay high-contrast over game art when `ShowBackgroundImageOnWindow=True`.

---

## 8. Restraint

- Dense library lists, cover grid backgrounds, and game descriptions sit on calm solid cleanroom aluminum (`#E2E5E8` / `#F2F4F6`), keeping `panel-grid.png` at <= 4.5% on sparse light cards and <= 7% on dark chrome (`Sidebar`, `TopPanel`, `StandardWindowStyle`, empty page).
- Zero `DropShadowEffect`, zero `OpacityMask` on art behind animated controls, pure white RGBA masks for all procedural textures, and strict `>= 4.5:1` contrast across every light/dark state pair.
