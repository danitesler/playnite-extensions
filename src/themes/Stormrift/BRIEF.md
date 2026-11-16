# Stormrift — creative brief

Mode: **Showcase**. Source: the menus and HUD of Heroes of the Storm (see `RESEARCH.md`). Dark theme only.

## 1. Source DNA (5 traits -> where each lands)

| Trait | Evidence (`RESEARCH.md`) | Lands on |
|-------|--------------------------|----------|
| Shape: pointed hexagonal slabs (`Ready`) and pointy-top hex ability/talent slots | Mode select `#1/#2`, Talents `#42`, HUD `#94` | `PlayButton` (pointed-hex slab), `GridTileButton` (hex slots), filter active mark, notification badge |
| Surface: deep cosmic violet-indigo depth with subtle top hex lattice and crisp 1px lavender rims | Options `#6`, Collection `#74`, Tooltips `#94` | Shell, panels, popups, tooltips, metadata card, `StandardWindowStyle` title band |
| Selection: magenta-violet plate (`#4d116f`) lit by an ice-periwinkle border (`#9ab8fe`) | Options nav `#6`, Collection sidebar `#74` | `DetailsViewItemStyle`, `ListViewItem`, `ListBoxItem`, `SidebarItem`, `TreeViewItem` |
| Light: glowing arcane violet (`#a96bf4`) on Ready hover, ice-blue underline glow on active tabs, rising cyan Nexus rings | Mode select `#2`, Profile `#56`, Searching `#86` | Play hover bloom & rim flare, `TabControl` indicator, `EmptyGameTemplate` portal rings |
| Type: clean wide geometric uppercase headers (`Sora`) paired with crisp humanist body (`Segoe UI`) | `OPTIONS`, `PLAY`, `CHOOSE YOUR ROLE` | Titles, buttons, tabs, section headings (`HeadingFontFamily`) vs body/tree/metadata (`FontFamily`) |

## 2. Game element map (source part -> Playnite surface)

| Source element | Playnite surface | How |
|----------------|------------------|-----|
| **Ready button** (pointed-hex violet slab `#3e2991` -> `#6035d5`, glowing `#a96bf4` rim, inner hairline) | `PlayButton` & primary `Button` | Custom `PointedHexTemplate` (left/right angled points, 1px rim, inner top highlight) with hover bloom, rim flare and sheen |
| **Ability / Talent hexagon slots** (`#42`, `#94`) | `GridViewItemTemplate` (`GridTileButton`), `Sidebar` main menu | Pointy-top hexagon hover buttons (`Play` violet, `Info` indigo/ice) rising with overshoot on cover hover; hex main-menu seal |
| **Top bar nav + pipe rules** (`PLAY \| COLLECTION \| LOOT \| WATCH`, `#1`) | `Views/TopPanel.xaml`, `TopPanelItem` | 52px void-indigo bar closed by a glowing Nexus rule, vertical pipe dividers, ice-blue underline on toggled view switches |
| **Options / Collection active nav plate** (`#4d116f` + `#9ab8fe` rim, `#6`, `#74`) | `DetailsViewItemStyle`, `ListBox`, `SidebarItem` | Magenta-violet fill with ice-periwinkle edge highlight and left glow bar |
| **Options modal frame & hex lattice** (`#6`) | `StandardWindowStyle`, `GroupBox`, `Popup`, `ToolTip` | 44px cosmic title band with subtle hex-lattice strip, Stormrift mark, glowing bottom rule, 1px `#6f5cae` outer border |
| **Profile tabs** (`Summary \| Progression \| Roster`, `#56`) | `TabControl` | Clean uppercase tabs with a glowing `#9ab8fe` / `#2fdbff` underline flare under the active tab |
| **Options CheckBox & Radio** (`#6`, `#8`) | `CheckBox`, `RadioButton` | 18px sunken `#0c0628` square well with ice-blue checkmark; rotated diamond-hex radio indicator |
| **Options Slider** (`#6`, `#8`) | `Slider`, `SliderEx`, `ProgressBar` | Thin `#0e0d3e` rail, arcane blue `#2676ff` -> `#2fdbff` fill, tall ice-silver `#ecf0ff` thumb bar |
| **Options Dropdown** (`#8`) | `ComboBox`, `TextBox`, `PasswordBox` | Sunken `#120c30` well, `#382678` -> `#2fdbff` focus rim, 36px reserved chevron lane |
| **Quest / Talent tooltip** (`#94`) | `ToolTip`, `PropertyItemButton`, metadata pane | `#130a36` body with `#6f5cae` border, `#fdd61f` quest-gold accents, `#2fdbff` links |
| **Nexus Progression Ring** (`#56`) | `EmptyGameTemplate` (both game views) | Concentric glowing cosmic rings + Stormrift mark at center + `LOCErrorNoGameSelected` in uppercase `Sora` |
| **Boost Status & Talent Charge** (`#1`, `#42`, `#88`) | `RunningIndicator` / `RunningActionIndicator` | Boost teal (`#0fe7d0`) frame, hex-lattice sweep scan, foot charge line, and 3 pulsing mini talent hexagons |

## 3. Moments

- **Hero: Play (Ready slab).** Rest: pointed-hex violet slab (`#3e2991`), `#7133c6` rim, translucent inner top edge, uppercase `Sora` label + `IconPlay`. Hover (180ms out, 320ms in): plate lifts to `#6035d5`, rim flares to `#a96bf4`, soft 9-slice violet bloom fades in (`0.42`), a diagonal pale sheen sweeps once across the plate, and angled corner ticks lock inward around the ends. Press (90ms): drops to `#2b1b6b`, label dips 1px; release rebounds smoothly.
- **Secondary:**
  1. Cover hover (`GridViewItemStyle`): crisp cyan-periwinkle frame (`#2fdbff`) + subtle bloom fade in (180ms), corner ticks lock inward.
  2. Cover hover buttons (`GridViewItemTemplate`): Play & Info hexagon slots rise 8px and scale `0.86 -> 1` with `BackEase` (0.25), staggered 50ms.
  3. Sidebar selection (`SidebarItem`): magenta plate fades in with an ice-periwinkle left edge bar and soft aura (`GlowFrameTemplate`).
  4. Settings `TreeView` selection: minimal 28px bare row; hover soft `#291a59` wash (120ms), selected held `#4d116f` wash + 2px `#9ab8fe` left accent bar + bright `#ecf0ff` text (180ms).
  5. Tabs (`TabControl`): glowing ice-blue underline flare expands smoothly (`ScaleX 0.3 -> 1`, 180ms).
  6. CheckBox: crisp ice checkmark strokes/fades in (100ms), border brightens to `#9ab8fe`.
  7. Search focus (`SearchBox`): border illuminates `#2fdbff` and bottom flare rule fades in (140ms).
- **Ambient (2, sparse areas only):**
  1. Empty game page (`EmptyGameTemplate`): concentric Nexus portal rings pulse softly in opacity/scale on a 3.4s cycle while visible.
  2. Running / Launching (`RunningIndicator`): Boost-teal (`#0fe7d0`) hex-lattice scan + charge foot line + 3 mini talent hexagons (1.65s sweep launching; 3.2s calm pulse running).

## 4. Motion language

- Durations: fast `100ms`, base `180ms`, slow `320ms`; ambient `3.2s–3.4s`.
- Easing: `CubicEase` (`EaseOut`) for crisp arcane transitions; `BackEase` (`EaseOut`, amplitude `0.25`) only on cover hex-button pop-ins; `QuadraticEase` (`EaseIn`) or `FillBehavior="Stop"` on exits.
- Entrance direction: rising cleanly (cover buttons +8px) or locking inward (corner ticks); never noisy bounce.
- Stagger: `50ms` between cover Play and Info slots.

## 5. Brand

- Name: **Stormrift** (abstract, echoes *Heroes of the Storm* and the Nexus rift; no Blizzard assets, logos or fonts).
- Mark (`art/mark.svg`): a faceted pointy-top hexagon ring enclosing three inward-pointing storm shards around a central diamond core — reused in `IconMainMenu`, `StandardWindowStyle` title band, `EmptyGameTemplate`, and `info/icon.png` (rendered in `#FF7A1A`).
- `GameBannerTintBrush`: `sr-void` (`#0a041a`), the deepest cosmic indigo behind the menus, keeping darkened banners rich dark indigo rather than flat black.

## 6. Restraint

- Details list, cover grid backgrounds, and game description area remain calm (`sr-panel` `#120a31` / `sr-panel-deep` `#0e0726`) with zero busy hex textures behind dense text or covers.
- Hex-grid lattice appears only subtly in the title band / empty state / launching scan mask.
- Boost teal (`#0fe7d0`) is strictly reserved for live running/launching states and positive match status; Quest gold (`#fdd61f`) only for filter active / notifications / warnings; Crimson (`#e30045`) only for danger/close hover.
