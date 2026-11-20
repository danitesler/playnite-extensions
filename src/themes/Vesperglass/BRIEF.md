# Vesperglass — Creative Brief

- **Ambition**: `Showcase` (maximum craft, original fantasy-arcane UI system inspired by *Dragon Age: The Veilguard*).
- **Target bar**: A player who has spent five minutes in Veilguard's menus recognizes Vesperglass instantly with every title, icon, and logo stripped away.

## 1. Source DNA (5 Identifying Traits)

1. **Aubergine-Plum Glass + Burnished Rose-Copper (`#190626` / `#CB856B`)**: Deep twilight plum panels wrapped in fine double copper hairlines and 45-degree chamfered corner facets — landed across the shell, popup menus, group boxes, tooltips, and the game page Codex metadata dossier.
2. **Electric Amethyst Rim + 4-Point Star Flares (`#A355E0` / `#C58AFF`)**: Selected rows, active Codex covers, and highlighted menu items ignite an electric violet perimeter aura with a sharp 4-point celestial star flare pinned to the leading edge/corner.
3. **Wireframe Hourglass & Nested Diamond Geometry**: The iconic vertical twin-triangle hourglass marks active tabs and the brand crest; rotated 45-degree diamonds drive slider thumbs, progress bar end-caps, check sockets, radio cores, and tapered divider centers.
4. **Inverting Alabaster Keycaps & Dotted Leader Rhythm**: Settings rows bridge labels to controls with delicate copper dots; keyboard shortcuts in menus flip from dimmed plum-framed badges into Veilguard's iconic solid alabaster keycaps with deep plum ink on highlight.
5. **Dual-Magic Status Separation (Lyrium Frost Cyan vs. Vitality Emerald)**: Launching/running games pulse with cold Lyrium Dagger cyan (`#147E9E` / `#6CE0FA`) and 3 staggered diamond rune sockets; active filters perch a glowing Vitality Emerald (`#5FD678`) 4-point star dot over the filter icon.

## 2. Game Element Map (11 Elements)

| Source Element (Veilguard) | Playnite Surface |
| --- | --- |
| Pointed-hexagonal `WARRIOR` / `[Space] LOAD` primary action plaque | `DerivedStyles/PlayButton.xaml` (burnished rose-copper chamfered double-bezel slab with diamond end-caps, amethyst/copper 9-slice bloom, corner star glints, diagonal crystal sheen) |
| Load/Save double-bordered row + electric violet rim & 4-point star flare | `DerivedStyles/DetailsViewItemStyle.xaml` & `DefaultControls/ListView.xaml` |
| `LIBRARY` Codex vertical tarot cards + sparkle corners | `DerivedStyles/GridViewItemStyle.xaml` & `DerivedStyles/GridViewItemTemplate.xaml` (chamfered double copper/amethyst frame + 52x52 faceted octagonal cover buttons) |
| Top nav glowing violet Hourglass active tab marker | `DefaultControls/TabControl.xaml` (`TabItemIndicatorTemplate`) & active view switches in `Views/TopPanel.xaml` |
| `Settings` rotated-diamond double-outline slider thumb | `DefaultControls/Slider.xaml` (`SliderThumb`, amethyst energy fill, copper `<` `>` end ticks) |
| `Preparing Dragon Age` copper-diamond end-capped progress bar | `DefaultControls/ProgressBar.xaml` & 12px `PART_ProgressGlobal` in `Views/TopPanel.xaml` |
| `Reset to Default` double-hairline modal with top hollow-diamond crest | `DerivedStyles/StandardWindowStyle.xaml` (44px title band + ghosted Astrolabe rings) & `DefaultControls/ContextMenu.xaml` |
| `Pause` / `Dialogue Choice` tapered copper rule with center hollow diamond | `DividerTemplate`, `MenuItem.SeparatorStyleKey`, top bar closing rule, metadata group dividers |
| Unread tab pale-green 4-point star dot | `PART_ToggleFilter` active filter indicator (`DataChangeNotifBrush` `#5FD678`) |
| `Character` Lyrium Dagger 3-socket diamond runes + Ultimate meter | `RunningIndicator` & `RunningActionIndicator` (`RunningIndicatorBrush` `#147E9E` cyan sweep + diamond-capped foot line + 3 cascading diamond runes) |
| `Loading` / `Area Map` concentric astrolabe rings over plum fog | `EmptyGameTemplate` in both Details and Grid views (slowly breathing astrolabe rings around the Vesperglass Hourglass-Diamond mark) |

## 3. Moments

- **Hero moment**: `PlayButton` hover & press — burnished rose-copper pointed-hexagonal double-hairline plaque; hover blooms a 9-slice amethyst-and-copper aura (`bloom.png`), ignites four 4-point star glints (`star-flare.png`) at the chamfer vertices, and sweeps a diagonal crystalline sheen (`sheen-band.png`) across the face (`200ms` enter, `320ms` settle); press dips into a separate deeper burnished layer (`100ms`).
- **Secondary moments (7)**:
  1. **Details row hover + selection**: copper-tinted hover wash (`120ms`) with a delicate left diamond tick + `+2px` label glide; click/selection locks an electric amethyst double rim, luminous 4-point star flare at the left edge, and amethyst wash (`200ms`).
  2. **Grid cover hover + selection**: cover lifts (`Scale 1.022`, `160ms`), ignites 9-slice violet bloom + sliding copper chamfer corner brackets + top-left star flare; selection locks a crisp amethyst + copper double frame with top/bottom diamond clasps.
  3. **Cover hover controls (`GridTileButton`)**: `52x52` faceted copper-rimmed octagonal plum medallions rising `-8px -> 0` with `BackEase` (`0.22`) and `55ms` stagger (`PART_ButtonPlay` then `PART_ButtonInfo`).
  4. **Popup menus & ComboBox lists**: `LocalMenuBoardTemplate` (double copper hairline, chamfered corners, top hollow-diamond crest, subtle `astrolabe-tile.png`), 30px rows with electric amethyst rim + sliding 4-point star flare + subtle copper dotted leader, tapered diamond breaks, inverting solid-alabaster keycap shortcuts, diamond rune-socket checks, crimson `Alt+Q` Exit.
  5. **Sidebar selection**: 44px void rail closed by a copper hairline with subtle astrolabe tick; current item glows in deep amethyst with a vertical 2px bright amethyst bar and glowing wireframe hourglass aura behind the glyph.
  6. **Settings tree selection (`TreeView.xaml`)**: bare 28px `Segoe UI` rows (no boxed cards), soft plum wash on hover (`120ms`), held amethyst wash + 2px bright amethyst left bar + tiny leading diamond pip + alabaster text on selected (`200ms`).
  7. **Controls**: rotated-diamond `SliderThumb` expanding slightly on hover/drag; sunken copper-rimmed `CheckBox` snapping an amethyst diamond check; mini astrolabe-ring `RadioButton` lighting a glowing amethyst diamond core; active `TabItem` illuminating the twin-triangle wireframe hourglass underneath.
- **Ambient loops (sparse areas only)**:
  1. `EmptyGameTemplate`: slow `5.5s` gentle breathing opacity on the concentric astrolabe ring and floating 4-point star motes (stops immediately via `RemoveStoryboard` when any game is selected).
  2. Launching/Running indicators: `1.70s` diagonal Lyrium sweep + 3 cascading diamond runes while launching; calm `3.2s` breathing frame & staggered rune pulse while running.

## 4. Motion Language

- **Durations**: Fast `120ms` (hovers, menu row highlight, checkbox/radio snap), Base `200ms` (selection confirmation, tab hourglass flare, cover lift, cover buttons), Slow `320ms` (Play bloom decay, hover exit `FillBehavior="Stop"`).
- **Easing**: `CubicEase` (`EaseOut` enter / `EaseInOut` exit) for crystalline poise; `BackEase` (`Amplitude="0.22"`) solely for cover button rise (`55ms` stagger) and star-flare entrance.
- **Direction**: Horizontal left-to-right light sweeps and `+2px` label glides; vertical `-8px -> 0` upward lift on cover controls.

## 5. Brand Identity

- **Name**: **Vesperglass** (`vesperglass`, `src/themes/Vesperglass`) — original name evoking twilight plum glass, evening-star flares, and astrolabe crystal; zero trademarks or official titles.
- **Brand Mark (`art/mark.svg` / `BrandMarkTemplate` / `IconMainMenu`)**: Original **Astrolabe-Hourglass Diamond** — a tall faceted outer diamond intersected by an astrolabe arc, enclosing two opposed slender hourglass triangles meeting at a crisp 4-point star nexus. Reused in the main menu button, Settings title band, empty game page, and orange add-on tile (`info/icon.png`).
- **`GameBannerTintBrush`**: `--vg-void` (`#12041C`), the deepest twilight aubergine of the shell, so ThemeModifier banner darkening wraps hero art in rich Veilguard plum fog rather than flat black or grey.

## 6. Restraint

- Dense library lists, cover grid backgrounds, and game description/metadata body text stay calm solid/dark plum (`#190626` / `#1C1B2A`), keeping `astrolabe-tile.png` at <= 4.5% opacity strictly in sparse chrome (title bands, menus, Codex dossier frame, empty state).
- Zero `DropShadowEffect`, zero `OpacityMask` on art behind animated controls, zero baked colors in sprites (pure white RGBA masks only), and strict >= 4.5:1 contrast on every interactive text pair.
