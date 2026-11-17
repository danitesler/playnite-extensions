# Ironward — creative brief

Mode: **Showcase**. Source: the menus, modals, and combat HUD of **DOOM: The Dark Ages** (see `RESEARCH.md`). Abyssal verdigris-iron workspace crowned by spearhead-tipped silver-teal rules, engraved Cinzel titles, and molten forge-ember selection plates.

## 1. Source DNA (5 traits -> where each lands)

| Trait | Evidence (`RESEARCH.md`) | Lands on |
|-------|--------------------------|----------|
| Abyssal verdigris-iron surfaces with subtle weathered stone-metal grain | `08-settings-gameplay`, `03-difficulty`, `13-modal` | `Shell` (`#041517`/`#092123`), `Library` / `Details` (`#0f2123`), `MetaPane` & `Popup` (`#15292c` + 4% `stone-grain.png` mask) |
| Spearhead-tipped silver-teal rules & corner-winged frames | `08-settings-gameplay`, `13-modal`, `20-pause` | `TopPanel` closing rule, `StandardWindowStyle` title band, `DividerTemplate`, `MetaPane`, `ToolTip` |
| Elongated hexagonal / spear-tipped ember plates vs sea-steel hover washes | `02-menu`, `03-difficulty`, `08-settings-gameplay`, `13-modal` | `PlayButton` (`ArrowTemplate`/`ChamferTemplate` molten ember), `DetailsViewItemStyle`, `ListViewItem`, `TreeViewItem` |
| Engraved wide-tracked `Cinzel` serif headings on left-fading slate bands | `08-settings-gameplay`, `28-loadout`, `35-upgrade-browse` | `Details` & `Grid` section headers (`SCREENSHOTS`, `DESCRIPTION`, `NOTES`), `GroupBox`, `StandardWindowStyle` |
| Diamond finials, keycap `[KEY]` square buttons, and Armor-Jade HUD chevrons | `03-difficulty`, `13-modal`, `51-hud` | `Slider` diamond thumb, `CheckBox`/`RadioButton` diamond pips, `SecondaryButton` (`More`/`Edit`), `RunningIndicator` |

## 2. Game element map (source UI part -> Playnite surface)

| Source element | Playnite surface | How |
|----------------|------------------|-----|
| **Arsenal / Settings top header bar + active ember V-chevron** (`08-settings-gameplay`, `35-upgrade-browse`) | `Views/TopPanel.xaml`, `CustomControls/SidebarItem.xaml` | 52px `#092123` verdigris bar closed by a `#8ba8aa` spear-tipped rule; active view switch & current sidebar item light a copper-ember V-notch chevron + `#f98851` edge tick |
| **Molten ember spear-tipped CTA plate** (`Campaign`, `Accept`, `02-menu`, `13-modal`) | `DerivedStyles/PlayButton.xaml` & primary `Button` | Chamfered/spear-tipped deep ember plate (`#822f0e`) rimmed in `#e17239`; hover blooms (`ember-glow.png`), ignites `#9e3b12` fill + `#f98851` rim, and fires twin horizontal `spear-flare.png` tip glints |
| **Difficulty hover vs selected plates** (`Aspiring Slayer` ember vs `Hurt Me Plenty` sea-steel, `03-difficulty`) | `DetailsViewItemStyle`, `ListViewItem`, `TreeViewItem`, `ListBox` | Hover washes in translucent sea-steel (`#25484c` + `#579390` rim); selected locks into a molten ember left-fading bar (`#6b2810` -> transparent) with `#f98851` top/bottom hairlines and a diamond cursor |
| **Corner-winged modal card** (`COMBAT ASSISTANCE`, `13-modal`) | `MetaPane`, `Popup`, `ToolTip`, `GroupBox` | `#15292c` slate card bordered top & bottom by 1px `#8ba8aa` rules with flared spearhead corner barbs |
| **Settings section gradient strip** (`GAMEPLAY`, `WEAPON`, `08-settings-gameplay`) | Section headers (`SCREENSHOTS`, `DESCRIPTION`, `NOTES`), `GroupBox` | Left-anchored `#193134` gradient strip fading right, paired with tracked uppercase `Cinzel` heading and a 4-point diamond prefix |
| **Diamond-finial vertical / horizontal rule** (`08-settings-gameplay`, `20-pause`) | `DividerTemplate`, `StandardWindowStyle` title band | 1px `#8ba8aa` hairline crowned by a 4-point diamond star (`❖`) and tapered spear-tips |
| **Difficulty modifier slider** (`Parry Window`, `03-difficulty`) | `DefaultControls/Slider.xaml`, `SliderEx` | Recessed `#193134` channel filled with sea-teal `#579390` and anchored by a crisp rotated diamond thumb |
| **Challenge / Boss progress gauge** (`PLUNDERER 97/150`, `Vagary Champion`, `51-hud`, `52-boss`) | `DefaultControls/ProgressBar.xaml`, `PART_ProgressGlobal` | Chamfered iron track with `#8ba8aa` rim and glowing sea-teal / ember fill |
| **Codex / Empty-page sentinel shield ward** (`13-modal`, `28-loadout`, `45-codex`) | `EmptyGameTemplate`, `StandardWindowStyle` watermark | Original toothed shield-disc & spear-diamond mark (`art/mark.svg`) over subtle stone grain + `LOCErrorNoGameSelected` |
| **Sentinel Armor Jade HUD chevron** (`51-hud` `41` green chevron) | `RunningIndicator` & `RunningActionIndicator` | Dedicated Armor Jade (`#1d7a47` / `#3db56e`) frame + dark keyline, angled shield-slash `RunningScan`, segmented foot chevron bar, and 3 pulsing jade diamond motes |

## 3. Moments

- **Hero: Play (`PlayButton`).** Rest: chamfered molten-iron plate (`#822f0e`) with `#e17239` rim, `Cinzel` uppercase label + forged blade play glyph. Hover (180ms in, 300ms out): `#9e3b12` ember fill and 9-slice `ember-glow.png` aura fade in smoothly, `#f98851` rim ignites, and twin `spear-flare.png` tip streaks flash outward along the chamfered ends. Press (90ms): cools into `#5c2008` deep forge bronze.
- **Secondary (7):**
  1. Cover hover (`GridViewItemStyle`): `#579390` sea-teal corner spear-brackets & subtle bloom fade in (`180ms`); selected cover locks a crisp `#f98851` ember chamfered frame with corner diamond studs.
  2. Cover hover buttons (`GridViewItemTemplate`): square bevelled dark-iron `Play` and `Info` plates (`#092123`, `#8ba8aa` rim) rise `8px` and scale `0.86 -> 1` (`BackEase` 0.22), staggered `50ms`, lighting ember on hover.
  3. Top panel view switches & filter toggle: active view button lights a warm ember V-chevron underline (`#f98851`); filter active adds an 8px Shrine Gold (`#d4a238`) diamond pip on the icon's top-right corner.
  4. Sidebar selection (`SidebarItem`): current slot fades (`180ms`) into a subtle ember left-edge spear bar + soft forge glow behind the bright `#eef3f2` icon.
  5. Settings `TreeView`: minimal 28px bare rows in `Segoe UI`; soft sea-steel wash hover (`110ms`), selected ember gradient plate + 2px `#f98851` left bar + bright `#eef3f2` label (`180ms`).
  6. Tabs (`TabControl`): active tab ignites an ember V-notch chevron underline (`ScaleX 0.3 -> 1`, `180ms`) matching the Settings/Arsenal tab bar.
  7. CheckBox, RadioButton & Slider: CheckBox / RadioButton use crisp diamond-cornered iron wells that ignite `#e17239` ember when checked; Slider moves a rotated sea-teal diamond thumb along a glowing `#579390` channel.
- **Ambient (2, sparse areas only):**
  1. Empty game page (`EmptyGameTemplate`): slow `3.6s` forge-ember breath behind the original toothed shield-ward crest (`BrandMarkTemplate`) while visible.
  2. Running / Launching (`RunningIndicator`): Armor Jade (`#1d7a47` / `#3db56e`) angled shield-slash `RunningScan` + segmented foot fill (`1.6s` cycle while launching; `3.2s` calm breathing frame + pulsing jade diamond beacon while running).

## 4. Motion language

- Durations: fast `110ms` (press, check, hover start), base `180ms` (plate fades, chevrons, brackets), slow `300ms` (cool-down exits); ambient `3.2s-3.6s`.
- Easing: `CubicEase` (`EaseOut`) for crisp forged-metal settles; `BackEase` (`EaseOut`, amplitude `0.22`) on cover button entrances; `QuadraticEase` (`EaseIn`) + `FillBehavior="Stop"` on exits.
- Entrance direction: rising cleanly (`+8px` on cover buttons) and flaring horizontally from center to spear-tips (Play hover flare, tab chevron).
- Stagger: `50ms` between cover Play and Info buttons; `280ms` stagger across the 3 running jade diamond motes.

## 5. Brand

- Name: **Ironward** (evokes medieval iron shield-craft and fortress wards without any trademarked *DOOM* names).
- Mark (`art/mark.svg`): An original 12-tooth circular iron saw-shield rim enclosing a vertical split spear-diamond ward. Used in `IconMainMenu`, `StandardWindowStyle` title band, `EmptyGameTemplate`, and `info/icon.png` (rendered in default `#FF7A1A` orange).
- `GameBannerTintBrush`: `iw-void` (`#041517`), the deep abyssal verdigris-iron backdrop, so ThemeModifier banner darkening veils bright game art into cold Dark Ages slate rather than neutral grey.

## 6. Restraint

- Game list rows, cover grid background, and description reading area remain calm abyssal verdigris (`#0f2123`), reserving `stone-grain.png` (<= 4% opacity) for sparse panels, headers, and the empty state.
- Armor Jade (`#1d7a47`/`#3db56e`) is reserved strictly for running/launching indicators and positive ratings; Molten Ember (`#822f0e`/`#e17239`/`#f98851`) for primary CTA and selection; Sea-Steel (`#25484c`/`#579390`) for hover and sliders; Shrine Gold (`#d4a238`) for filters and ratings.
