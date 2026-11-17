# Wyldcrown — Creative Brief

Mode: **Showcase**. Unofficial dark fairytale tabletop theme inspired by *Armello*'s illuminated tapestry menus, sapphire diamond-quilted plaques, obsidian fleur-de-lis damask panels, deckled parchment character folios, gothic-braced heraldic frames, and glowing Wyld magic auras (see [`RESEARCH.md`](RESEARCH.md)).

## 1. Source DNA (5 traits -> where each lands)

| Trait | Evidence (`RESEARCH.md`) | Lands on |
|---|---|---|
| **Nocturne Obsidian Damask + Royal Indigo Tapestry Wash** | `armello-wyld-chest-unlocked`, `armello-dlc`, `armello-attack` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `TopPanel`, `StandardWindowStyle`, `Popup` (`#0e1017`–`#181922` w/ subtle `damask-tile.png` fleur-de-lis weave & calm `#1e2e4a` corner wash) |
| **Burnished Gold `<◇ Title ◇>` Medallions, Brace Rims & Filigree Corners** | `armello-card-gallery`, `armello-wyld-chest-unlocked`, `armello-dlc` | `TopPanel` bottom diamond rule (`diamond-seam.png`), `StandardWindowStyle` `<◇ Title ◇>` medallion band, `CornerMarksTemplate` filigree corners on Description / Metadata / Popups, gilded scroll rail & 3-tick brass thumb |
| **Sapphire Diamond-Quilted Plaques & Damask Iron Secondary Plates** | `armello-wyld-chest-unlocked`, `armello-dlc` (`Back` vs `€4.99`) | `PlayButton` & Primary `Save` (`ChamferTemplate` notched sapphire diamond-quilt `#2153ab`–`#3b82f6` in beveled gold rim + crown cusp); secondary `Button`, `More`, `Edit` in chamfered obsidian damask + antique gold rim |
| **Deckled Illuminated Parchment Tome + Hanging Pennant Bookmarks** | `armello-thane`, `armello-inventory`, `armello-quest-reward` | Right-hand **Metadata Tome** (`ParchmentBrush` `#eee2b2` w/ `plate-torn.png` deckled edges, pointing heraldic ribbon bookmarks at top rim, dark obsidian chip tags `#1c1d24`, sepia `#21180d` typography, gold sunburst scores) |
| **Concentric Diamond Cursors, Spirit Cyan Card Auras & Wyld Emerald Magic** | `armello-main-menu`, `armello-card-preview`, `armello-multiplayer` | Selection: concentric gold/ivory double-diamond cursor (`◇`) + indigo swath; Cover hover: luminous Cerulean aura (`#5ee3ff` `glow-frame.png`); Filter mark: Crimson wax seal diamond (`#b5262e`); Running/Launching: Wyld Emerald (`#289c52`) sweep & 4-point turning stars |

## 2. Game Element Map (11 source UI parts -> Playnite surfaces)

| Source Element | Playnite Surface | How it translates |
|---|---|---|
| **Main Menu Concentric Diamond Cursor (`◇`)** | `DetailsViewItemStyle`, `TreeViewItem`, `ListViewItem` | Left double concentric gold/ivory diamond cursor + subtle royal indigo selection swath with hairline top/bottom gold sheen |
| **Sapphire Diamond-Quilted Plaque (`Back` / `Open Chest`)** | `PlayButton`, Primary `Button` | Chamfered notched plate in sapphire `#2153ab` + `sapphire-quilt.png` cushion overlay + `1.5px` burnished gold rim + top/bottom center diamond cusps |
| **Obsidian Damask Price Plaque (`€4.99`)** | Default `Button`, `SecondaryButton` (`More` / `Edit`) | Charcoal obsidian damask interior (`damask-tile.png`) framed in beveled gold chamfer rim, brightening to royal twilight indigo on hover |
| **`<◇ Screen Title ◇>` Diamond Medallion** | `StandardWindowStyle` title band, Section Headers | Centered obsidian velvet ribbon strip flanked by paired double-gold diamonds and `diamond-seam.png` fading gold rule |
| **Hero Character Tome (Thane)** | `Metadata` pane (both views) & `ToolTip` | Deckled warm cream parchment (`#eee2b2`, `plate-torn.png`), `1px` sepia dividers, topped by hanging notched heraldic ribbon pennants |
| **Left Spine Bookmark Tabs** (`Inventory`) | `Sidebar` & `SidebarItem` | Compact `44px` obsidian rail with sapphire/gold `MainMenuButton` sun-crown seal and notched bookmark hover/active plates with crisp engraved icons |
| **Chambered Icon Header Tabs** (`DLC`, `Character Overview`) | `TabControl` / `TabItem` | Chamfered top-corner dark tab plates (`Overview` style): muted brass at rest, sharp `1.5px` burnished gold hex rim + luminous ivory text when selected |
| **Achievements Brass Hairline Scrollbar** | `ScrollViewer` / `ScrollBarThumb` | Quiet vertical/horizontal hairline gold wire with slender gold-rimmed capsule thumb stamped with three grip ticks |
| **Card Gallery Crimson Wax Seal (`new`)** | `TopPanelFilterToggle`, `Close` danger hover, badges | Crimson diamond/seal (`#b5262e` `DataChangeNotifBrush`) perched top-right of active filter icon; crimson hover fill on window/sidebar Close |
| **Card Preview Electric Cerulean Aura** | `GridViewItemStyle` (hover) & `GridViewItemTemplate` | Static beveled gold frame when selected; animated radiant `#5ee3ff` aura (`glow-frame.png`) on hover while round-beveled sapphire `Play` & iron `Info` tiles rise `10px` with `BackEase` |
| **Multiplayer Active Wyld Magic Aura & Dawn Turn Sparks** | `RunningIndicator` & `RunningActionIndicator` | Dedicated `#289c52` Wyld Emerald sweep (`RunningScan`), bottom emerald rule (`RunningFill`), and twin staggered 4-point Wyld sun stars |

## 3. Moments & Motion Language

- **Hero Moment (`PlayButton` hover & press):** `215ms` `CubicEase` fade-in expands the golden crown sunburst bloom (`glow-frame.png`), illuminates the sapphire quilted sheen to azure `#3373df`, and gently wakes twin subtle golden diamond corner glints; exit glides back smoothly over `320ms`; pressing drops swiftly (`70ms`) onto an indented royal sapphire-abyss plate (`#172338`) so mid-hover exits never snap.
- **Secondary Moments (6):**
  1. Cover hover: `180ms` cerulean `#5ee3ff` Spirit glow + elevated z-index vs static burnished gold selected frame.
  2. Cover action buttons (`GridTilePlayButton`, `GridTileButton`): `220ms` `BackEase` `10px` staggered upward entrance (`60ms` delay on Info).
  3. Sidebar bookmark selection: instant-smooth `180ms` gold edge marker + notched slate/indigo bookmark illumination + subtle glow behind glyph.
  4. Settings tree row: `120ms` twilight wash hover; `200ms` indigo swath + `2px` gold left bar + `◇` cursor mark on selected.
  5. CheckBox / Radio / Slider: sunken obsidian/gold jewel box with crisp animated diamond tick; circular jewel dot radio; continuous tarnished-gold rail with rotated diamond jewel thumb.
  6. Tab switch: chamfered octagonal crown plate snaps brass border & ivory glow in `160ms`.
- **Ambient Loops (2, sparse regions only):**
  1. `EmptyGameTemplate` (both overviews): central **Wyld Sun Crown** geometric emblem breathing inside a gentle pulsing radial aura above `LOCErrorNoGameSelected` in `Cinzel` capitals (`3.4s` sine cycle, starts/stops strictly on `{Binding Game} = null`).
  2. `RunningIndicator`: smooth `1.65s` Wyld Emerald progress sweep during launch; calm `3.2s` breathing frame & gentle alternating sparkle stars while running.
- **Motion Vocabulary:**
  - `fast = 120ms` (press, hover tint, focus ring), `base = 200ms` (selection swath, button hover bloom, tab/control reveal), `slow = 320ms` (overlay fade-out, curtain settle);
  - **Easing:** `CubicEase` (`EaseOut` / `EaseInOut`) for regal cloth/curtain glides, `BackEase` (`Amplitude="0.35"`) exclusively for cover tile action buttons popping in (`10px` upward entrance, `40ms`–`60ms` stagger).

## 4. Brand & Restraint

- **Brand Name & Mark (`Wyldcrown`):** Unofficial fan theme. Vector emblem (`art/mark.svg` & `BrandMarkTemplate`): a stylized **royal sun crown enclosing a central rotated diamond jewel above a symmetrical fleur/leaf trefoil cusp** — original vector art inspired by Armello's heraldic crown & diamond motifs with zero Armello game artwork or logos.
- **`GameBannerTintBrush`:** `--ar-indigo-deep` (`#1e2e4a`), solid deep twilight tapestry indigo so banner darkening blends hero art directly into the nocturne tapestry palette rather than flat mud.
- **Kept Calm:** Dense Library game lists, filter/explorer sidebars, and cover grid wells keep a clean matte `#0e1017`–`#13151d` obsidian ground (`damask-tile.png` suppressed behind dense lists or kept at `< 0.04` opacity only on sparse surfaces like empty states and chrome). Description prose uses warm high-contrast `#f4edd6` on `#181922`, and the Metadata parchment folio (`#eee2b2`) uses deep legible `#21180d` sepia ink (`> 13:1` contrast) with generous spacing.
