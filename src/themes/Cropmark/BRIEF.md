# Cropmark — Creative Brief

- **Ambition**: `Showcase` (maximum craft, original comic-production Bristol board UI system inspired by *Marvel Tōkon: Fighting Souls*).
- **Target bar**: Anyone who has opened *Marvel Tōkon*'s Main Menu, Options, Pause, or Character Select recognizes **Cropmark** instantly with every superhero, title, and logo removed.

## 1. Candidate Lenses (3 Explored -> 1 Chosen)

Compared against the last 5 themes in `src/themes/AGENTS.md` and `src/extensions.json`:
- `Runeskald` (dark frost-slate Norse equipment tablet — Diegetic)
- `Rimeweld` (dark black/silver equipment tray — Diegetic)
- `Vesperglass` (dark twilight aubergine glass & astrolabe — Diegetic)
- `Cogplate` (dark phosphor green ordnance CRT visor — HUD/Telemetry)

All 5 recent themes are dark metallic/glass/CRT themes, and our only two recent light themes (`Slipstream`, `Rumpus`) are rounded pastel capsule/pill systems.

| Lens | Concept | Comparison & Decision |
| --- | --- | --- |
| **(a) Diegetic / Artifact — Bristol Illustration Art Board** *(CHOSEN)* | Playnite's window IS a physical Japanese manga/comic Bristol art board (`#ECE3D6`): crisp 0px `1.5px` sumi-olive ink frames (`#26291F`), non-photo blue (`#6BA7CC`) dashed trim/copy-area crop marks (`=|+|=`), cut dark charcoal construction-paper backing peeking behind key panels, perforated tear-off notepad popups, textured Marker Orange (`#FF7916`) italic selection sweeps, and non-photo sky-blue (`#81B7D5`) active tabs. | **Freshest & most iconic.** Zero overlap with the last 5 dark themes and opposite in shape language to rounded-pill `Slipstream`/`Rumpus`. Captures the game's unmistakable art-board identity across every surface. |
| **(b) HUD / Telemetry — Match Battle Overlay** *(Dropped)* | Skewed black/neon combat bars, diamond corner squad portraits, glowing super-meter strips. | Too close to `Payload`, `Night City`, and `Calling Card`, and discards the Bristol paper + non-photo blue board that makes *Tōkon* singular. We still borrow the HUD's **Punish! Teal** for Running, skewed energy bars for `ProgressBar`, and Assist Lime for positive ratings. |
| **(c) Title / Pause Menu — Blueprint Cyanotype Wash** *(Dropped)* | Whole-window pale cyanotype blueprint wash (`#A3C3D8`) with floating tilted tear-off notepads. | Saturated mid-blue full-screen canvas fatigues reading and fights cover art. We keep the tear-off perforated notepad for popup menus/dialogs and blueprint tones for active tabs, guides, and window-art transitions. |

## 2. Source DNA (5 Identifying Traits)

1. **Warm Bristol Rag Paper + Sumi-Olive Ink (`#ECE3D6` / `#26291F`)**: Tactile cream comic illustration paper framed by sharp 0px `1.5px–2px` warm charcoal ink rules — across the shell, library lists, game pages, and forms.
2. **Non-Photo Blue Crop Marks & Registration Guides (`#6BA7CC` / `#81B7D5`)**: `=|+|=` center registration ticks, double corner crop marks (`||`), dashed vertical fold spines, and solid sky-blue active tab cells — across the top bar, sidebar divider, game page banner frame, metadata ledger, and Settings chrome.
3. **Textured Comic Marker Orange Selection (`#FF7916`)**: Diagonal-tooth marker highlight bands (`marker-stroke.png` white mask) that sweep across selected rows and menu items while flipping labels to **Bold Italic** deep ink (`#1D2016`, 6.30:1).
4. **Charcoal Construction-Paper Backing & Slanted Orange-Drop-Cap CTA (`#2D3024` + `#FF7916`)**: The Main Menu's signature `EPISODE` slab (dark charcoal bar with an oversized vivid orange leading accent block and cream condensed caps) drives `PlayButton`, while cut charcoal backing planes anchor the metadata dossier and Settings window.
5. **Perforated Tear-Off Notepad Popups + HUD Punish! Teal (`#00756B`)**: Context menus, dropdowns, and dialogs wear the Pause/Confirmation sheet's vertical dashed tear-off edge and crisp `ITEM` header rule; launching/running games break out in the HUD's skewed **Punish! Teal** with segmented gauge ticks.

## 3. Game Element Map (12 Elements)

| Source Element (*Marvel Tōkon*) | Playnite Surface |
| --- | --- |
| Main Menu `EPISODE` slanted charcoal bar + orange drop-cap | `DerivedStyles/PlayButton.xaml` (charcoal ink slab with leading orange vertical slash/drop-bar, marker-orange hover sweep, angled comic burst glints) |
| `OPTIONS` / `PAUSE MENU` textured orange marker row + italic text | `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml`, `DefaultControls/Menu.xaml` |
| `CHARACTER SELECT` P1 portrait card + tilted orange corner frame | `DerivedStyles/GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml` (sharp inked comic panel border + orange corner cropmarks + `52x52` inked square/notched cover action plates) |
| `OPTIONS` top `L1`/`R1` non-photo sky-blue tab bar (`#81B7D5`) | `DefaultControls/TabControl.xaml` & active view switches in `Views/TopPanel.xaml` |
| `PAUSE MENU` / `CONFIRMATION` perforated tear-off sheet (`ITEM`) | `DefaultControls/ContextMenu.xaml` (`LocalMenuBoardTemplate`) & `DefaultControls/ComboBox.xaml` |
| `OPTIONS` bottom-edge charcoal fill bar (`Master Volume`) | `DefaultControls/Slider.xaml` (`SliderTrack` bottom ink rule + square notched ink thumb) |
| `EPISODE` non-photo blue `PROGRESS` strip + HUD skewed gauge | `DefaultControls/ProgressBar.xaml` & `12px` `PART_ProgressGlobal` in `Views/TopPanel.xaml` |
| `CHARACTER SELECT` comic page frame with `=|+|=` crop ticks | `Views/DetailsViewGameOverview.xaml` & `Views/GridViewGameOverview.xaml` hero banner frame + `StandardWindowStyle.xaml` 44px title band |
| `OPTIONS` torn charcoal backing + ink ledger table | Metadata pane (`GameDetailsPanePosition` Left / Center / Stretch / Right) with `RESULTS`-style dashed non-photo blue group breaks |
| Main Menu orange bookmark ribbon / `P1` badge | `PART_ToggleFilter` active filter indicator (`DataChangeNotifBrush` `#FF7916` sharp notched bookmark pip on icon corner) |
| HUD `Punish!` teal callout banner + segmented super meter | `RunningIndicator` & `RunningActionIndicator` (`RunningIndicatorBrush` `#00756B` skewed Punish! sweep + segmented foot ticks + 3 bouncing spark bars) |
| Title Screen drafting board with cropmarks & registration target | `EmptyGameTemplate` in both Details and Grid views (non-photo blue drafting frame + breathing Cropmark registration reticle) |

## 4. Signature Levers (Shell, Game Page & Menus)

| Lever | Cropmark Choice (Source-Derived) |
| --- | --- |
| **Hero banner transition** | **Hard engraved comic-panel ink frame (`2px`) + corner non-photo blue crop ticks (`||` & `=|+|=`)** with a subtle paper-tint foot scrim so hero art looks printed inside a real comic panel on Bristol board (distinct from generic soft-only gradients). |
| **Play button architecture** | **Charcoal ink slab (`#2D3024`) with an oversized Marker Orange (`#FF7916`) left drop-block & hard `2px` offset paper-ink frame** (from Main Menu's `EPISODE` button): hover sweeps textured orange marker sheen + angled corner crop ticks expand outward; press snaps into a sunken offset ink layer. |
| **Metadata container & group break** | **Inked comic production ledger (`#F5EFE5`) over an offset charcoal construction-paper backing strip (`4px` left/bottom shadow lip)**, using **non-photo blue dashed fold lines (`StrokeDashArray="3,3"`) with tiny left trim ticks** as the 6 group dividers (collapsed in Center/Stretch). |
| **Chip & score silhouette** | **Stamped 0px inked production tags** (cream fill, `1.5px` charcoal ink outline, `3px` non-photo blue left accent bar that flips to Marker Orange on hover); **Score badges** styled as `RESULTS` framed numeric plaques with a crisp ink double top/bottom rule and rating color pip. |
| **Row & cover selection mark** | **Details rows**: horizontal left-to-right textured **Marker Orange (`#FF7916`)** brush sweep + `3px` deep-ink left edge bar + bold italic deep-ink label shift (`+3px`). **Grid covers**: hard `2px` charcoal panel border locks into an energetic **Marker Orange double-corner cropmark frame + asymmetric 3px offset orange backing lip** with subtle lift (`Scale 1.022`). |
| **Side-panel close plate** | **28x28 inked comic-board stamp (`SidePanelCloseButton`)**: sharp 0px cream paper square with `1.5px` charcoal border, `2px` bottom-right solid ink offset lip, and tiny non-photo blue corner ticks; hover fills Issue Crimson (`#C11A21`) with cream `X` glyph (`120ms`). |
| **Popup menus & ComboBox lists** | **30px rows** on `LocalMenuBoardTemplate`: warm cream tear-off Bristol notepad (`#F5EFE5`), `1.5px` charcoal ink border, **vertical dashed tear-off perforation line on the left**, a **`3px` non-photo blue top trim bar with centered `=|+|= ` registration mark**, and a **3px hard offset charcoal backing shadow** (no `DropShadowEffect`). **Highlight**: textured Marker Orange (`#FF7916`) brush plate wipes left-to-right (`ScaleX 0.88->1`, `120ms`) while a crisp charcoal **ink triangle cursor** slides in and label shifts `+2px` in deep ink (`6.30:1`). **Group break**: `10px` dashed non-photo blue fold rule led by a `||` trim tick. **Shortcuts**: crisp monochrome **ink-ring key-prompt pills** (echoing `✕`/`○`/`□` circular/stadium prompts, inverting to solid charcoal ink with cream text on highlight). **Marked rows**: Exit (`Alt+Q`) uses Issue Crimson (`#C11A21`) text/key-pill at rest and solid Issue Crimson marker plate with cream text/cursor (`5.34:1`) on highlight; checked rows draw a **non-photo blue inked square box with bold charcoal check** (inverting cleanly on highlight). |

## 5. Moments

- **Hero moment**: `PlayButton` hover & press — charcoal ink slab (`#2D3024`) with leading vivid orange drop-bar (`#FF7916`) and hard offset backing; hovering sweeps a diagonal textured marker-orange streak (`marker-stroke.png`), snaps four non-photo blue corner crop ticks outward, and brightens the charcoal body (`160ms` `CubicEase`); pressing depresses the slab `2px` onto its ink offset (`90ms`).
- **Secondary moments (7)**:
  1. **Details row hover & click/selection**: soft non-photo blue drafting wash + subtle left crop tick on hover (`110ms`); click/selection sweeps the textured Marker Orange brush band (`ScaleX 0.92 -> 1`, `160ms`) with a `3px` ink edge bar and `+3px` label nudge.
  2. **Grid cover hover & click/selection**: cover lifts (`Scale 1.022`, `150ms`) with blue cropmark corner brackets snapping in; click/selection locks a vivid Marker Orange comic frame with offset bottom-right orange backing lip and subtle settle bounce (`BackEase` `0.18`).
  3. **Cover hover controls (`GridTileButton`)**: `52x52` sharp inked paper/charcoal square plates with `3px` orange offset lips sliding up `-8px -> 0` (`BackEase` `0.2`, `50ms` stagger).
  4. **Popup menus & ComboBox lists**: perforated tear-off Bristol board with textured Marker Orange wipe, dashed blue fold breaks, monochrome prompt pills, and crimson Exit.
  5. **Sidebar selection**: 44px recessed Bristol rail closed by a `1.5px` charcoal rule + non-photo blue dashed bleed spine; crowned by a charcoal-and-orange Cropmark menu tile; selected item takes a sky-blue (`#81B7D5`) inked cell with a `3px` Marker Orange rail edge bar.
  6. **Settings tree selection (`TreeView.xaml`)**: bare 28px `Segoe UI` lines (no boxed cards), soft paper-shadow hover wash (`110ms`), held sky-blue drafting wash (`#81B7D5` at ~45%) + `2px` Marker Orange left bar + deep ink text on selected (`170ms`).
  7. **Controls**: `OPTIONS`-style bottom-bar `Slider`, sharp inked `CheckBox` with orange marker tick, circular inked `RadioButton` with orange dot, `OPTIONS` sky-blue `TabItem` with crisp charcoal borders, drafting-ruler `ScrollBar`.
- **Ambient loops (sparse areas only)**:
  1. `EmptyGameTemplate`: calm `4.5s` gentle breathing opacity (`0.55 <-> 1.0`) on the Cropmark registration reticle and blueprint frame (removed via `RemoveStoryboard` when a game is selected).
  2. Launching/Running indicators: `1.55s` angled **Punish! Teal** sweep + segmented gauge foot ticks + 3 staggered comic spark bars while launching; quiet `3.0s` breathing frame & staggered bar idle while running.

## 6. Motion Language

- **Durations**: Fast `110ms` (hovers, press snap, checkbox/radio, menu highlight), Base `170ms` (selection sweep, tab switch, cover lift, cover buttons), Slow `280ms` (Play hover exit, list exit `FillBehavior="Stop"`).
- **Easing**: `CubicEase` (`EaseOut` enter, `EaseInOut` exit) for crisp editorial snap; restrained `BackEase` (`Amplitude="0.18"`) on cover button rise (`50ms` stagger) and selection lock settle.
- **Direction**: Left-to-right marker sweeps (`+2px` to `+3px` horizontal label kick); upward `-8px -> 0` pop on cover controls.

## 7. Brand Identity

- **Name**: **Cropmark** (`cropmark`, `src/themes/Cropmark`) — original name celebrating comic-book Bristol board crop marks and drafting registration; zero trademarks or official titles.
- **Brand Mark (`art/mark.svg` / `BrandMarkTemplate` / `IconMainMenu`)**: Four sharp L-shaped corner crop-ticks framing a crisp diagonal registration crosshair with a bold 4-point geometric spark at center. Reused in the Main Menu button, Settings title band, Empty Game Page, and `info/icon.png` (default `#FF7A1A` orange).
- **`GameBannerTintBrush`**: `--cm-paper` (`#ECE3D6`, light Bristol paper) so ThemeModifier banner darkening washes hero art smoothly into the warm comic board rather than black.
- **Light-Theme Window Background Flip**: Defines `WindowArtForegroundBrush` (`#F5EFE5`, crisp paper-white) so unselected list rows, group/Expander headers, and game titles stay high-contrast when Playnite's "Use game background image as window background" is enabled.

## 8. Restraint

- Dense library lists, cover grid backgrounds, and game descriptions stay calm solid Bristol paper (`#ECE3D6`), keeping `paper-grain.png` at <= 4% opacity strictly in sparse chrome (top bar, title band, tear-off menus, metadata ledger, empty state).
- Zero `DropShadowEffect`, zero `OpacityMask` on art behind animated controls, pure white RGBA masks for all generated textures, and strict >= 4.5:1 contrast on every interactive text pair.
