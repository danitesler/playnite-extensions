# Studlock — Creative Brief

- **Ambition**: `Showcase` (maximum craft, original molded ABS brick & Technic workshop UI inspired by *LEGO Party!*).
- **Target bar**: Anyone who has opened *LEGO Party!*'s Settings, Pause, Wardrobe, Modal, or Challenge Zone screens recognizes **Studlock** on sight with every brand name, minifigure, and logo removed.

## 1. Candidate Lenses (3 Explored -> 1 Chosen)

Compared against the last 5 themes in `src/themes/AGENTS.md` and `src/extensions.json`:
- `Vesperglass` (dark twilight aubergine glass & astrolabe — Diegetic / Artifact)
- `Runeskald` (dark frost-slate Norse equipment tablet — Diegetic / Artifact)
- `Cropmark` (light Bristol comic rag paper & non-photo blue cropmarks — Diegetic / Artifact)
- `Vice Dusk` / `Palmdusk` (dark charcoal-plum twilight pause menu & neon flamingo — Title / Pause Menu)

Also distinct from earlier `Rumpus` (bright saturated orange backdrop, butter panels, squishy cream/green pills).

| Lens | Concept | Comparison & Decision |
| --- | --- | --- |
| **(a) Diegetic / Artifact — Molded Charcoal Baseplate & ABS Brick Workshop** *(CHOSEN)* | Playnite's shell IS *LEGO Party!*'s tactile Settings/Wardrobe/Modal ABS brick board: matte dark charcoal molded baseplate (`#222427` / `#27292D`) with subtle side stud texture (`stud-wall.png`), **Studded Stage Violet (`#61459A`)** top header plaques & rail spine, **Chamfered Cerulean Brick (`#2B8FC4`)** structural frames & segmented section bands (`DISPLAY`/`GRAPHICS`), **Canary Yellow (`#FFE421`)** brick-seamed snap-focus bars with the **black-outlined golden triangle cursor (`▶`/`▼`)**, **Technic axle scrollbar & collar slider**, **molded stud-row dividers**, **Wardrobe Equipped Green (`#198840`)** running state, and **Wardrobe Aqua (`#12DCE0`)** active filter pip. | **Freshest & most iconic.** Completely distinct in materiality (molded matte/glossy ABS plastic, studs, chamfered brick rims, Technic axles) from all 5 recent metallic/glass/paper/neon themes and from orange/cream `Rumpus`. Keeps dense library lists calm while landing unmistakable *LEGO Party!* craftsmanship on every surface. |
| **(b) HUD / Telemetry — Challenge Zone Stage & 4-Player Board Overlay** *(Dropped)* | Full-window saturated sky-blue brick wall (`#0090D8`), 4-color red/blue/yellow/green player score strips, giant 3D sculpted numerals. | Saturated electric blue across full library lists fights colorful cover art and fatigues browsing. Harvested: the HUD's **segmented vertical-brick yellow timer bar** for `ProgressBar` / `PART_ProgressGlobal`, **Equipped/P4 Brick Green** for Running, and **Golden 2×2 Brick** icon for the brand mark & empty page. |
| **(c) Title / Pause Menu — Showtime Spotlight Purple Stage & Floating Capsule Stack** *(Dropped)* | Electric violet spotlight stage (`#3500D9`) with huge `999px` floating stadium pills stacked centrally. | Overlaps `Vice Dusk`'s Title/Pause purple lens and conflicts with WPF's `CornerRadiusFull` guardrails on variable-width controls. Harvested: the Pause/Title screen's **brick-seamed Canary Yellow CTA**, **golden black-outlined `▶` triangle cursor**, and **studded violet header trapezoid**. |

## 2. Source DNA (5 Identifying Traits)

1. **Matte Charcoal ABS Baseplate + Molded Circular Studs (`#222427` / `stud-wall.png` / `stud-row.png`)**: Calm graphite plastic baseplate across the library and shell, accented with circular molded stud relief on sparse chrome (Settings title band, sidebar violet spine, popup crown, horizontal stud-row dividers).
2. **Studded Stage Violet Crown & Chamfered Cerulean Brick Frames (`#61459A` + `#2B8FC4`)**: Top-center studded violet trapezoid plaques (`SETTINGS`, `PAUSE`), purple studded booklet spine along the rail, and 45° chamfered cerulean brick bezels (`LEAVE PARTY?` modal, `Wardrobe` frame, `DISPLAY`/`GRAPHICS` segmented blue headers).
3. **Canary Yellow Brick-Seamed Focus + Outlined Golden Triangle Cursor (`#FFE421` + `▶`/`▼`)**: Solid canary yellow plates divided by subtle vertical modular brick seams (`brick-seams.png`), paired with crisp ABS ink text (`#161719`, 13.85:1) and the floating black-outlined golden triangle cursor on selected rows, active covers, menus, and Play hover.
4. **Technic Axle Scrollbar, Collar Slider & Segmented Brick Timer (`#7C828A` / `#C4C9CE` / `#FFE421`)**: Vertical scrollbar styled as a cylindrical Technic axle rod with a grooved light-grey brick thumb; horizontal slider modeled as a slotted axle track with a notched white Technic collar thumb; progress bars built from segmented vertical brick ticks.
5. **High-Contrast Toybox Semantic Accents**: Equipped Brick Green (`#198840` / `#2CC856`) for Running/Launching and checked badges, Wardrobe Aqua (`#12DCE0`) for the filter-active badge & notifications, and Classic Brick Red (`#C9242B`) for Danger/Exit/Close hover — zero hue collisions.

## 3. Game Element Map (12 Elements)

| Source Element (*LEGO Party!*) | Playnite Surface |
| --- | --- |
| `SETTINGS (VIDEO)` studded violet trapezoid plaque | `DerivedStyles/StandardWindowStyle.xaml` 44px dialog title band + top-bar violet crown accent |
| `Help: Challenge Zones` vertical studded violet booklet spine | `Views/Sidebar.xaml` left rail right-edge studded violet spine & `44x44` studded violet Main Menu brick tile |
| `SETTINGS` horizontal segmented icon tab bar (grey idle / yellow active) | `DefaultControls/TabControl.xaml` & icon-only view switches in `Views/TopPanel.xaml` |
| `LET'S PARTY!` / `CONTINUE` canary-yellow brick-seamed CTA + `▶` cursor | `DerivedStyles/PlayButton.xaml` (molded yellow brick plate, lower plastic lip, brick seams, glossy sheen sweep, sliding `▶` cursor) |
| `SETTINGS` / `Power-Up` yellow focus row + `▶` cursor | `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml`, `DefaultControls/Menu.xaml` |
| `Wardrobe` dark cell + yellow selected frame + top `▼` cursor | `DerivedStyles/GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml` (`50x50` beveled brick-tile Play/Info buttons) |
| `LEAVE PARTY?` 45° chamfered cerulean brick modal frame | `DefaultControls/ContextMenu.xaml` (`LocalMenuBoardTemplate`), `DefaultControls/ComboBox.xaml`, & Metadata dossier frame |
| `DISPLAY` / `GRAPHICS` stud-row divider & cerulean section strip | 6 `Meta*` group breaks (`stud-row.png`), `Menu.xaml` separator (`SeparatorStyleKey`), and `GroupBox.xaml` header band |
| `SETTINGS` Technic axle scrollbar & notched white collar slider | `DefaultControls/ScrollViewer.xaml` (`ScrollBarThumb`) & `DefaultControls/Slider.xaml` (`SliderThumb`) |
| `Minigame` segmented vertical-brick yellow timer bar | `DefaultControls/ProgressBar.xaml` & `12px` `PART_ProgressGlobal` in `Views/TopPanel.xaml` |
| `Wardrobe` equipped green checkmark badge & aqua `!` new badge | `RunningIndicator` / `RunningActionIndicator` (`#198840` segmented brick sweep + 3 bouncing green studs), checked menu items, and `PART_ToggleFilter` aqua pip (`#12DCE0`) |
| `Loading Screen` dark interlocking tile mosaic + tumbling Golden 2×2 Brick | `EmptyGameTemplate` in Details & Grid views (dark tile wall + breathing isometric 2×2 Golden Brick emblem) |

## 4. Signature Levers (Shell, Game Page & Menus)

| Lever | Studlock Choice (Source-Derived) |
| --- | --- |
| **Hero banner transition** | **Chamfered Cerulean Brick Top/Side Bezel (`3px` `#2B8FC4`) + Hard ABS Plastic Seam Foot**: hero art sits inside a crisp chamfered cerulean upper frame with modular brick-joint ticks, transitioning smoothly at the bottom via a clean page-matched gradient scrim (`GameOverviewBackgroundBrush`, no `OpacityMask` on art behind animated controls) closed by a subtle `2px` violet/cerulean seam. |
| **Play button architecture** | **Brick-Seamed Canary Yellow Molded Tile Slab (`PlayButton.xaml`)**: `6px` (`ControlCornerRadius`) molded `#FFE421` plate with `2px` ABS ink border (`#161719`), `3px` lower gold plastic lip (`#C9A900`), vertical modular brick-joint seams (`brick-seams.png`), bold-italic `#161719` uppercase label, and sliding black-outlined golden `▶` triangle pointer; hover sweeps a diagonal white ABS specular sheen (`brick-sheen.png`) and brightens to `#FFF064`; press drops onto the lower lip (`#E2C000`). |
| **Metadata container & group break** | **Chamfered Cerulean-Framed ABS Dossier (`#2B2E33`)**: `2px` Cerulean Brick border (`#2B8FC4`) with `4px` chamfered corner notches, subtle brick-joint seam header trim, and **10px horizontal molded circular stud rows (`stud-row.png`)** separating the 6 `Meta*` groups (collapsed cleanly in `Center`/`Stretch` modes for continuous 3/2/1-column flow). |
| **Chip & score silhouette** | **Molded 1×2 Brick Tile Tags (`PropertyItemButton`, `Tag="Chip"`)**: `4px`-radius cool slate ABS tiles (`#34383E`) with `1px` top specular highlight, `2px` dark bottom lip (`#17191C`), and a tiny molded circular stud pip on the left (flipping to solid Canary Yellow `#FFE421` with `#161719` ink on hover). **Scores (`TextBlockGameScore`)**: `Standings`-inspired **beveled 3D plastic rank cubes** with `2px` top specular bevel, `2px` bottom dark lip, and bold tabular score numerals colored by rating. |
| **Row & cover selection mark** | **Details rows**: hover fades a cool slate brick plate with a Cerulean left stud-notch (`110ms`); click/selection snaps in the **Canary Yellow (`#FFE421`) brick-seamed focus bar** (`ScaleX 0.90->1`, `150ms` `BackEase`) with `1.5px` ABS ink border, vertical brick seams, sliding black-outlined golden `▶` cursor on the left, and bold `#161719` ink nudging `+3px` right. **Grid covers**: hover lifts cover (`Scale 1.025`, `140ms`) with a Cerulean brick frame; click/selection locks the **Wardrobe `3px` Canary Yellow molded frame** with white inner keyline, dark shadow lip, and the floating **black-outlined golden `▼` triangle cursor** centered on the top edge. |
| **Side-panel close plate** | **28×28 Chamfered Molded Brick Cap (`SidePanelCloseButton`)**: 4px chamfered octagonal-square ABS tile (`#35383E`), `1.5px` ABS ink rim, `1px` top bevel highlight, `2px` bottom plastic lip, bold `14px` geometric `X` glyph; hover transitions (`120ms`) to Classic Brick Red (`#C9242B`) with white `X` (`5.57:1`). |
| **Popup menus & ComboBox lists** | **30px rows** on `LocalMenuBoardTemplate`: dark matte charcoal ABS board (`#2A2C30`) framed in a **`3px` chamfered Cerulean Brick border (`#2B8FC4`)** with `1px` inner ABS ink groove and a **`6px` Studded Stage Violet (`#61459A`) crown bar** along the top edge. **Highlight**: Canary Yellow (`#FFE421`) brick-seamed plate snaps in (`ScaleX 0.92->1`, `120ms` `BackEase`) while the black-outlined golden `▶` cursor slides in and label/icon invert sharply to `#161719` (`13.85:1`, `+2px` nudge). **Group break**: `10px` recessed channel holding a horizontal row of circular molded ABS studs (`stud-row.png`). **Shortcuts**: dark controller-prompt brick caps (`#1B1D20`, `Consolas` bold white) inverting to `#161719` caps with yellow text on highlight. **Marked rows**: Exit (`Alt+Q`) uses Classic Brick Red (`#C9242B`) text/icon/cap rim at rest and a solid Brick Red brick-seamed plate with crisp white text/icon/cursor (`5.57:1`) on highlight; checked rows wear the **Wardrobe Equipped Circular Green Checkmark Badge** (`#24A84C` disc + white check). |

## 5. Moments

- **Hero moment**: `PlayButton` hover & press — Canary Yellow (`#FFE421`) brick-seamed slab with `2px` ABS ink rim and `3px` lower gold lip; hover snaps the black-outlined golden `▶` cursor into view from left, sweeps a diagonal glossy plastic sheen (`brick-sheen.png`), and lifts the top bevel (`150ms` `BackEase` `0.18`); press compresses onto the lip (`90ms`).
- **Secondary moments (7)**:
  1. **Details row hover & click/selection**: Cerulean brick hover wash + left stud notch (`110ms`); click/selection snaps in the Canary Yellow brick-seamed focus bar + sliding `▶` cursor + `#161719` ink nudge (`150ms` `BackEase`).
  2. **Grid cover hover & click/selection**: cover lifts (`Scale 1.025`, `140ms`) into a Cerulean chamfered brick rim; click/selection locks Wardrobe's `3px` Canary Yellow frame + white inner keyline + floating top `▼` triangle cursor with a springy click settle.
  3. **Cover hover controls (`GridTileButton`)**: `50×50` chamfered molded brick buttons (Canary Yellow Play/Install with dark ink; Cool Slate Info with white glyph, both with `2px` lower plastic lips) rising `-8px -> 0` with `BackEase` (`0.22`) and `55ms` stagger.
  4. **Popup menus & ComboBox lists**: Cerulean chamfered brick board crowned by a studded violet strip, 30px Canary Yellow brick-seamed highlight + `▶` cursor, molded stud-row dividers, prompt keycaps, Wardrobe green check discs, and Brick Red Exit.
  5. **Sidebar selection**: `44px` matte ABS charcoal rail closed by a `3px` **Studded Stage Violet (`#61459A`)** booklet spine; crowned by a `44×44` studded violet **Studlock** 2×2 brick menu tile; active item snaps into a **Canary Yellow (`#FFE421`)** brick plate with dark ink icon and `3px` gold lip.
  6. **Settings tree selection (`TreeView.xaml`)**: bare 28px `Sora` rows (no idle boxes), soft charcoal-blue hover wash (`110ms`), held deep cerulean/yellow-accent wash + `2px` Canary Yellow left bar + crisp bright label on selected (`170ms`).
  7. **Controls**: Technic axle `ScrollBar`, notched white collar `Slider`, segmented brick `ProgressBar`, Wardrobe-green checkmark `CheckBox`, circular stud `RadioButton`, `SETTINGS`-style grey/yellow segmented `TabItem`, yellow-capped dark charcoal `ToolTip`.
- **Ambient loops (sparse areas only)**:
  1. `EmptyGameTemplate`: calm `4.2s` gentle opacity breathing (`0.60 <-> 1.0`) on the isometric Golden 2×2 Brick emblem & subtle stud-tile halo (stopped via `RemoveStoryboard` when any game is selected).
  2. Launching/Running indicators: `1.6s` **Equipped Brick Green (`#198840`)** segmented brick-tick sweep + filling segmented foot line + 3 circular green studs popping sequentially while launching; quiet `3.0s` breathing frame & staggered green stud idle while running.

## 6. Motion Language

- **Durations**: Fast `110ms` (hovers, press snap, checkbox/radio, menu highlight), Base `160ms` (brick-snap row/cover selection, cover lift, cover buttons, tab switch), Slow `260ms` (Play sheen decay, hover exit `FillBehavior="Stop"`).
- **Easing**: `BackEase` (`EasingMode="EaseOut"`, `Amplitude="0.16–0.22"`) on snap-in selections, cursor entrances, and cover button pops (evoking interlocking bricks clicking firmly into place); clean `CubicEase` (`EaseInOut`) on exits with zero bounce.
- **Direction**: Horizontal left-to-right brick lock (`ScaleX`, sliding `▶` cursor, `+2px`/`+3px` label nudge); vertical `-8px -> 0` snap-up on cover controls and top `▼` drop-in on selected covers.

## 7. Brand Identity

- **Name**: **Studlock** (`studlock`, `src/themes/Studlock`) — original name evoking interlocking molded brick studs and snap-lock plastic craft; zero trademarks or official titles.
- **Brand Mark (`art/mark.svg` / `BrandMarkTemplate` / `IconMainMenu`)**: Original **Isometric 2×2 Molded Stud-Lock Brick** vector silhouette with 4 circular raised studs on the top face and crisp geometric bevel lines. Reused in `PART_ElemMainMenu`, Settings title band, `EmptyGameTemplate`, and `info/icon.png` (default `#FF7A1A` orange).
- **`GameBannerTintBrush`**: `--sl-violet-tint` (`#2B2142`, deep Stage Violet-charcoal from the Loading/Title stage) so ThemeModifier banner darkening wraps hero art in *LEGO Party!*'s signature dark purple showtime atmosphere rather than flat black.

## 8. Restraint

- Dense library lists, cover grid canvases, and game descriptions sit on calm solid matte ABS charcoal (`#222427` / `#27292D`); `stud-wall.png` stays strictly in sparse chrome (Settings title band, sidebar rail spine, empty game page) at `<= 8%` opacity.
- Zero `DropShadowEffect`, zero `OpacityMask` on art behind animated controls, pure white RGBA masks for all procedural textures, and strict `>= 4.5:1` contrast on every interactive text pair.
