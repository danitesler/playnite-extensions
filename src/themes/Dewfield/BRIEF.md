# Dewfield — Creative Brief (Showcase)

## 1. Candidate Lenses (3 → Pick 1)

Recent 5 themes in `src/themes/AGENTS.md`: **Counterfoil** (dark 35mm film), **Testbed** (light cool aluminum + carbon cleanroom), **Rushdown** (dark ultraviolet neon), **Studlock** (dark matte ABS bricks), **Vice Dusk** (dark smoked plum sunset).

- **(a) Diegetic / Artifact — Farmstead Wooden Ledger & Notice Board (CHOSEN):** Playnite's shell becomes a warm handcrafted walnut notice board (`#522E08`) framing sunlit honey-parchment ledger sheets (`#FCE3A8` / `#FFD284`) with 3-step cedar wood bevels (`#5B2B2A` / `#B14E05` / `#DC7B05`), folder-tab view switches, rolled scroll headers, inventory-slot grid covers, meadow-green `OK`/`DONE` Play plaques, and a pinned notice-board parchment popup menu. Completely fresh in hue, warmth, and handcrafted pixel materiality compared to every one of the last 5 themes.
- **(b) HUD / Telemetry — Overworld Sky & Floating Clock HUD (DROPPED):** Bright azure-to-turquoise sky (`#014991` → `#64E8E2`) behind game lists and descriptions strains readability and clashes with diverse game cover art; Stardew's actual menus sit inside warm parchment boxes, not open sky.
- **(c) Title / Pause Menu — Signboard Plank Tiles (DROPPED):** Sparse pale-yellow plank tiles over starry blue sky lack the structural vocabulary needed for dense library lists, metadata panes, and settings trees.

## 2. Source DNA (5 Traits → Playnite Surfaces)

1. **3-Step Carved Cedar Wood Bevel (`#5B2B2A` / `#B14E05` / `#DC7B05` / `#853605`):** Frames the hero banner, metadata ledger, popup menus, tabs, group boxes, and buttons.
2. **Dark Walnut Notice-Board Timber (`#522E08` / `#5E360C` with horizontal plank grain):** Grounds the 44px left rail, 50px top bar, and Settings title band so the bright parchment library pops cleanly.
3. **Sunlit Honey-Apricot & Cream Parchment (`#FCE3A8` / `#FFD284` / `#FFF2CC`) + Deep Mahogany Ink (`#56160C`):** Warm, calm, 9:1–12:1 contrast reading surface for library lists, game descriptions, inputs, and Settings.
4. **Chunky Pixel Craft (`Pixelify Sans` headings + stepped square pixel bevels & corner pegs):** Immediate Stardew recognition on game titles, scroll headers, Play slab, and bespoke `Icon<Role>` pixel-bevelled geometries.
5. **Tactile Cozy Motion (`BackEase` spring-pops + crisp 2px wooden pointer slide):** Playful wooden button bounce, sliding pixel pointer arrows on hovered rows/menus, and active folder-tab drop.

## 3. Game Element Map (11 Elements)

| Source UI Element | Playnite Surface |
|---|---|
| Calendar Notice Board (`calendar.png`) | Walnut timber left sidebar rail (`44px`) & top bar (`50px`) with subtle procedural wood-grain mask |
| Inventory Stepped Folder Tabs (`inventory.png`) | Top bar view switches (`Details`/`Grid`/`List`) & `TabControl` headers — active tab drops down in honey parchment |
| Rolled Parchment Scroll (`journal.png`, `pelican-town.png`) | Metadata pane crown header & Settings title-band ribbon |
| Pierre's Store / Journal Rows (`store.png`, `journal.png`) | Details list rows (`DetailsViewItemStyle`) — warm cream-parchment cards with toasted honey hover & sliding wooden pixel arrow |
| Inventory Tool Slots (`inventory.png`) | Grid cover tiles (`GridViewItemStyle`) — recessed cedar sockets that lock with a Crimson active hotbar border on select |
| `OK` / `DONE` Meadow-Green Bevel Button (`create-character.png`, `journal.png`) | `PlayButton` primary CTA with sunlit emerald-to-meadow bevel, golden hover rim, and spring lift |
| Energy Bar `E` (`pelican-town.png`) | `PART_ProgressGlobal` top-bar loading bar & `ProgressBar` in vivid harvest emerald inside a mahogany-cedar tube |
| Red `X` Close Tile (`inventory.png`, `calendar.png`) | `SidePanelCloseButton` (`28×28` cream-and-wood square with chunky crimson `X`) & `WindowBarButton` close |
| Skill Level 4+1 Wooden Pip Meter (`skill-level.png`) | Metadata group dividers (wooden pixel pip bars) & `TextBlockGameScore` framed rating plaques |
| Pinned Notice-Board Slip + Thumbtack (`calendar.png`) | Unified `ContextMenu` / `TopPanelMenu` / `ComboBox` popup panel with centered steel thumbtack & hotbar-slot shortcut caps |
| Golden `!` Quest Exclamation (`pelican-town.png`) | `PART_ToggleFilter` active filter pip (9px stepped gold diamond-badge) & notification indicator |

## 4. Shell & Game Page Levers (6 Structural Decisions)

1. **Hero banner transition:** Carved double-bevel wooden picture frame (matching Pelican Town map & Robin's portrait) with cedar corner pegs and a warm bottom honey-parchment scrim fade into the page.
2. **Play button architecture:** Meadow-green wooden bevelled plaque (`#1E6E19` fill, `#47C432` top/left inner highlight, `#144810` bottom/right shadow, `2px` `#5B2B2A` outer outline) with corner pixel studs, sunlit golden hover bloom, and sliding wooden pointer chevron.
3. **Metadata container & group break:** Framed honey-parchment Farmstead Ledger (`#FFD284`) in a 3-step cedar wood frame, crowned by a rolled cream scroll accent bar, with **Skill-Level wooden pip dividers** between groups.
4. **Chip & score silhouette:** Sunken warm wood inventory-tag chips (`#F2BE72` fill, `1.5px` cedar bevel rim, `2px` corners) that toast to sunlit gold on hover; numeric scores sit in framed dark-wood & cream-gold skill plaques with ruby/amber/emerald indicator pips.
5. **Row & cover selection mark:**
   - *Details row:* Hover warms to toasted honey (`#F7BC6B`) and slides a `7px` cedar-gold pixel arrow (`▶`) from the left; selected locks a golden-amber plank (`#F2A844`) with a `3px` crimson-cedar pin bar, stepped top highlight, and crisp mahogany ink.
   - *Grid cover:* Recessed wood inventory slot (`#E09650`); hover lifts (`Scale 1.025`, `BackEase`) with a warm sunlit amber bevel rim; selection locks Stardew's signature **thick crimson-red active hotbar frame** (`#D43200`) with bright cream corner ticks.
6. **28×28 Side-panel close plate:** Cream parchment square (`#FFF2CC`) inside a `2px` `#5B2B2A` outline + inner cedar bevel, holding a bold `14px` crimson `X` (`IconWindowClose`); hover smoothly fills solid Crimson (`#B8240E`) and flips the `X` to cream (`#FFF7DC`).

## 5. Menu & Running Game Signatures

- **Menus (`ContextMenu`, `Menu`, `ComboBox`):** Compact `30px` rows on a pinned notice-board cream parchment slip (`#FFF2CC`) framed in a 3-step cedar wood bevel (`#5B2B2A` / `#B14E05` / `#DC7B05`) with a centered steel thumbtack pin at top center (`LocalNoticeBoardTemplate`); hover slides a toasted honey plank (`#F2A844`) with a `2px` cedar rim and sliding mahogany pixel pointer (`▶`); group breaks are `10px` cedar fence-rail rules centered on a diamond knot; shortcuts sit in sunken inventory-slot wood keycaps (`#F2BE72`); Exit (`Alt+Q`) sits in Crimson (`#B8240E`) with cream label; checked rows show a meadow-green pixel checkmark inside a sunken square wood box.
- **Running / Launching Indicator:** **Starwater Sky Blue** (`#1162A8`, highlight `#3FA3E8`, completely separate from Harvest Green Play, Honey-Amber Selection, and Crimson Danger).
  - *Launching*: Segmented pixel water-droplet sweep (`RunningScan` masked by tiled vertical pixel cells) + filling `2px` sky-blue irrigation foot line (`RunningFill`) + 3 staggered rising starwater sparkles (`RotateTransform`/`TranslateTransform Y`) on a `1.6s` cycle.
  - *Running*: Calm `3.2s` breathing Starwater frame (`0.72 → 1.0`) with gently twinkling starwater sparkles and full foot line; hovering the `RUNNING` Play button darkens under a deep-night scrim and shows `Cancel`.

## 6. Moments & Motion Language

- **Hero moment:** `PlayButton` hover — sunlit gold inner bevel bloom (`wood-glow.png`), gentle `BackEase` spring lift (`-1px` / scale sheen), sliding golden pixel arrow, and crisp bevel inversion on press.
- **Secondary moments:** Details row hover & selection lock, Grid cover slot hover lift & crimson hotbar lock, staggered `GridTileButton` hover controls (`48×48` wooden bevel tiles), Sidebar walnut folder-tab drop, TreeView bare-row cream wash + cedar left peg, TabControl drop-down folder tab, CheckBox meadow-green pop, Slider amber knob glow.
- **Durations & Easing:** Fast `110ms` (hovers, pointer slides), Base `180ms` (`BackEase` amplitude `0.3` for playful spring-settle), Slow `320ms` (empty-state & launch/idle breathing); stagger `50ms`. Entrance direction: left-to-right for pointers and sweeps, top-down drop for active folder tabs.

## 7. Brand & Restraint

- **Name:** **Dewfield** (original fan theme, unofficial, no trademarks or game art).
- **Brand Mark:** Original **Sprout-Star Emblem** — a crisp pixel-crafted 5-point golden harvest star cradled by two spring sprout leaves (`BrandMarkTemplate`, `art/mark.svg`, `info/icon.png` in standard repo `#FF7A1A`).
- **`GameBannerTintBrush`:** Warm honey parchment (`#FCE3A8`, solid) so banner darkening washes cleanly into the sunlit parchment page, matching light-theme rules.
- **Restraint:** Library list background (`#FCE3A8`) and metadata text (`#56160C`) stay completely calm (only 4% subtle parchment fiber grain via white-mask sprite, zero busy textures behind dense text or covers).
