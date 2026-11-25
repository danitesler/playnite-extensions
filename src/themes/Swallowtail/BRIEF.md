# Swallowtail — Creative Brief (Showcase)

## 1. Candidate Lenses (3 → Pick 1)

Recent 5 themes in `src/themes/AGENTS.md`: **Subspace** (true-black Star Trek LCARS tangerine/violet elbows), **Dewfield** (light Stardew walnut wood & honey parchment), **Counterfoil** (dark Disco Elysium 35mm film-strip & oil brush), **Testbed** (light Portal cleanroom aluminum & carbon), **Rushdown** (dark Street Fighter 6 ultraviolet neon & aqua glass).

- **(a) Diegetic / Artifact — Scrapbook & Twine-Bound TODO Parchment (DROPPED):** Aged tan paper inside burgundy leather duplicates the warm parchment-on-wood mood of **Dewfield** and **Fernscroll**, while sacrificing *Return to Monkey Island*'s unmistakable nocturnal sea-teal, gold, and black menu identity.
- **(b) HUD / Telemetry — Leather Inventory Satchel & Floating Prompt Pills (DROPPED):** Dark brown leather with minimalist corner icons is too monochrome and sparse to carry Playnite's dense navigation shell on its own; instead, its stitched leather surface, charcoal prompt pill, and 4-tick crosshair feed our inputs, tooltips, and shortcut tags.
- **(c) Title / Pause Menu — Night-Harbor Theater Stage & Swallowtail Ribbon Chrome [CHOSEN]:** Playnite's shell becomes *Return to Monkey Island*'s signature **midnight-harbor theater stage** (`#070C12` velvet stage framed by `#0B1924`/`#0F4157` dark-aqua curtain drapes, `#156487` wavy swallowtail title ribbons & pinched Save-slot frames, `#E4B217` curled gold ribbons & notched-octagon diamonds, `#BF620F` burnt-bronze option values, `#D4343B` overwrite crimson, and `#137A59` ghost-ship seafoam emerald for launching/running). Completely fresh in hue, silhouette, and storybook craft compared to all 5 recent themes.

## 2. Source DNA (5 Traits → Playnite Surfaces)

1. **Wavy Deep-Aqua Swallowtail Ribbons (`#156487` + `ribbon-swirl.png` + shield crest):** Crowns the Settings 44px title band (`StandardWindowStyle`), the Game Page metadata dossier header, and the unified popup menu board (`LocalSwallowtailMenuBoardTemplate`).
2. **Curled Pirate-Gold Arrow Ribbon (`#E4B217` + folded `#B8870B` tail):** Shapes the `PlayButton` primary CTA and the Sidebar's 44×50 main-menu emblem crest, immediately echoing the game's iconic `Back`/`OK` ribbon.
3. **Pinched Concave Save-Slot Frames & Notched Octagon Widgets:** Drives `GridViewItemStyle` cover frames (concave teal frame flipping bright white on hover and pirate gold on select), `CheckBox` (bold white 8-corner notched octagon with a solid `#E4B217` gold diamond core), and `GroupBox` corner ears.
4. **Golden Skull-Centered Tapered Hairlines & Stitched Espresso Satchel Wells:** Pause-menu skull dividers separate metadata groups (`MetaProgress`..`MetaLinks`), popup menu sections, and anchor the top bar's bottom rule; dark stitched leather (`#231D16` + `#4A3B2B`) grounds the search well, inputs, and shortcut tags.
5. **Storybook Calligraphic Serif + Friendly Rounded Sans (`Constantia` Title Case + bundled `Nunito`):** Pairs *Return to Monkey Island*'s flared Title-Case menu serif (headings, Play, banners) with its crisp rounded dialogue/prompt sans (calm body copy, game lists, Settings tree rows).

## 3. Game Element Map (11 Elements)

| Source UI Element | Playnite Surface |
| --- | --- |
| Top-center wavy teal swallowtail banner + chest crest (`Save`, `Video`, `Sound`) | `StandardWindowStyle` 44px Settings title band & Game Page metadata dossier crown |
| Top-left curled gold `Back`/`OK` ribbon with folded underside | `PlayButton` primary CTA (curled pennant silhouette + folded lower-right tail + lantern glint sweep) & `PART_ElemMainMenu` crest tile |
| Night-harbor stage curtain framing (`Pause`, `Settings`) | `Sidebar` 44px deep harbor rail (`curtain-drape.png` at 14%) & `TopPanel` 50px bar closed by a golden skull-centered hairline |
| Pinched concave 3×3 Save-slot frames (`Load/Save`) | `GridViewItemStyle` cover frames (concave teal rim -> white hover -> gold selected with notched bottom ribbon tick) |
| Notched 8-point octagon checkbox + solid gold diamond core (`Video`, `Text & Language`) | `DefaultControls/CheckBox.xaml` & checked rows in `Menu.xaml` / `ComboBox.xaml` |
| Teal `<` `>` wedge steppers + burnt-bronze `#BF620F` values (`Sound`, `Display`) | `DefaultControls/Slider.xaml` (flanked by teal `<` `>` end-wedges, bronze track fill, gold diamond thumb) & `ComboBox.xaml` wedge chevron |
| Pause-menu golden skull-centered tapered hairline (`Pause`) | Metadata group breaks (`MetaProgress`..`MetaLinks`) & `MenuItem.SeparatorStyleKey` group breaks |
| Stitched dark-espresso leather inventory pouch (`Inventory: Browse`) | `SearchBox.xaml`, `TextBox.xaml`, `PasswordBox.xaml`, and menu shortcut key tags (`#231D16` + stitched seam) |
| Dialogue golden skull-bullet rows (`Dialogue Choice`) | `DetailsViewItemStyle.xaml` & `DefaultControls/TreeView.xaml` selection/hover cues (sliding gold compass-skull pip + luminous harbor-teal wash) |
| Save-slot circular crimson skull-delete badge & Trivia chamfered answer plaques | `SidePanelCloseButton` (`28×28` notched dark-teal bezel -> `#D4343B` crimson hover) & `TextBlockGameScore` chamfered score plaques |
| Achievements winged-flourish colophon + curtained harbor stage (`Achievements`) | `EmptyGameTemplate` in both Details & Grid views (draped curtains, centered Swallowtail Crest, gold Constantia `LOCErrorNoGameSelected`, winged colophon) |

## 4. Shell & Game Page Levers (6 Structural Decisions)

1. **Hero banner transition:** Clean stage-curtain framing — subtle `14%` dark-aqua corner curtain drapes (`curtain-drape.png`) at top-left and top-right over `PART_ImageBackground` (kept outside any `OpacityMask` on art behind animated controls; fades via plain `#00000000` -> `PageRoot.Background.Color` gradient rectangle + `GameBannerTintBrush` `#0F4157` darkening layer) with a thin engraved Deep Aqua top seam.
2. **Play button architecture:** Curled pirate gold pennant-ribbon plate (`ControlCornerRadius` base with top-left/bottom-left gentle flare, a crisp folded `#B8870B` underside shadow lip along bottom-right, and a golden lantern sheen `gold-glint.png` sweeping left-to-right on hover). Idle `#E4B217` with `#14110C` Sepia Ink `Constantia` Title Case; hover warms to `#F5CE4B` with subtle `-1px` lift (`BackEase`) and sliding gold compass pip; press sinks to `#B8870B`.
3. **Metadata container & group break:** Framed `#0F2736` Harbor Dossier (`300px` usable content width) edged in `1.5px` Deep Aqua (`#156487`) with flared Save-slot corner ticks, crowned by a miniature wavy Deep Aqua swallowtail ribbon bar (`ribbon-swirl.png`); group breaks are **10px golden skull-centered tapered hairlines** (collapsed automatically when `GameDetailsPanePosition` is `Center`/`Stretch`).
4. **Chip & score silhouette:** `PropertyItemButton` chips (`Tag="Chip"`) are dark harbor-teal notched tags (`#0F2736` fill, `1px` `#156487` rim, subtle `#E4B217` left diamond tick, `ControlCornerRadius="4"`) that illuminate to `#156487` + `#F5CE4B` border + `#F7F5EE` text on hover. `TextBlockGameScore` draws chamfered Trivia-card numeric plaques with Burnt Bronze / Ghost Emerald / Overwrite Crimson corner trims.
5. **Row & cover selection mark:**
   - *Details row:* Calm `#070C12` stage at rest; hover fades in a nocturnal teal wash (`#143649`, `120ms` `CubicEase`) and slides a `6px` Deep Aqua chevron pip from left; selected locks a deep harbor-teal plate (`#133E54`) framed top/bottom by faint `#156487` hairlines, a springing `3px` Pirate Gold left bar (`ScaleY`), a miniature golden skull-diamond pip, and crisp `#F7F5EE` ivory text.
   - *Grid cover:* Rounded `6px` clip inside a `#0B1924` socket; hover scales smoothly (`1.02`, `BackEase`) and draws a crisp **Storybook Ivory (`#F7F5EE`) pinched Save-slot frame** (echoing hovered slots in `Load/Save`); selected locks a bold **Pirate Gold (`#E4B217`) concave Save-slot frame** with corner ear-ticks and a bottom-center notched Deep Aqua ribbon tab. Cover hover controls (`GridTileButton`) are `48×48` notched-octagon beveled badges (Pirate Gold Play/Install + Deep Aqua Info) with staggered `60ms` entrance.
6. **28×28 Side-panel close plate:** `28×28` hand-notched dark-teal bezel (`#0F2736` fill, `1.5px` `#156487` notched octagon rim, crisp `#F7F5EE` 14px `IconWindowClose`); hover smoothly fills Save-slot Overwrite Crimson (`#D4343B`, `120ms`) with a gold rim highlight and `#F7F5EE` close glyph.

## 5. Menu & Running Game Signatures

- **Unified Popup Menus (`ContextMenu`, `Menu`, `TopPanelMenu`, `ComboBox`):** Compact `30px` rows on `LocalSwallowtailMenuBoardTemplate` (`#0F2736` night-harbor board with `4%` `parchment-grain.png`, `1.5px` `#156487` perimeter border with four flared Save-slot corner ticks, crowned by a wavy `7px` Deep Aqua swallowtail ribbon and centered miniature Pirate Gold shield crest rising `4px`). Highlighted rows glide in a `#154963` deep harbor-teal plate framed by tapered Pirate Gold hairlines (`ScaleX 0.90→1`, `120ms` `CubicEase`) while a golden compass-skull diamond slides in from the left (`-6→0`), icon lights Pirate Gold (`TextElement.Foreground`), and label shifts `+2px` right in Ivory (`#F7F5EE`, `9.2:1`). Group breaks are `10px` golden skull-centered tapered hairlines; shortcuts sit in dark stitched-leather pouch tags (`#231D16`, `#4A3B2B` rim, `Consolas` Burnt Bronze `#E07D24`, lighting gold/ivory on hover); open submenus hold `#133E54` + gold left swallowtail tick; Exit (`Alt+Q`) sits in Crimson (`#D4343B`) at rest and flips to a solid Crimson highlight plate with Ivory ink (`5.1:1`); checked rows show a mini white notched-octagon outline with a Pirate Gold diamond core.
- **Running / Launching Indicator:** **Ghost-Ship Emerald (`#137A59`, glint `#34C796`)** with `#F7F5EE` Ivory text (`4.91:1` bare, `6.5–9.8:1` under `RunningBreath` scrim).
  - *Launching (`1.6s` loop):* Angled spectral mist comet sweep (`EndPoint="1,0.3"`, `RunningScan`) + double-notched seafoam tide foot bar (`RunningFill`) + **three drifting ghost-lantern diamond wisps** flaring upward sequentially as the comet arrives (`0.9–1.35s`).
  - *Running (`3.2s` loop):* Quiet breathing emerald frame (`0.72 → 1.0`), full tide foot bar, gentle harbor-bobbing lantern wisps; hovering the `RUNNING` Play button darkens via `RunningHoverDim` and reveals `Cancel` while keeping `PlayContent` `Visibility="Hidden"`.

## 6. Moments & Motion Language

- **Hero moment:** `PlayButton` hover — curled Pirate Gold ribbon lifts `-1px` (`BackEase`), warms to Sunlit Gold (`#F5CE4B`), sweeps `gold-glint.png` lantern sheen across its face, and lights the folded underside edge; press sinks cleanly into `#B8870B`.
- **Secondary moments:** Details row nocturnal teal fade + springing gold rail & skull pip; Grid cover ivory-hover / gold-selected pinched Save-slot frame + staggered `48×48` notched-octagon `GridTileButton` pops; Sidebar active gold swallowtail flag; TreeView bare-row teal wash + `2px` gold rail; CheckBox white notched-octagon diamond pop (`Scale 0.4→1`, `BackEase`); Slider teal wedge highlight & gold diamond glow; TabControl wavy teal active tab with gold crown bar.
- **Durations & Easing:** Fast `110ms` (hovers, press, menu highlights), Base `190ms` (`CubicEase` Out for washes/panels, `BackEase` amplitude `0.24` for playful storybook check/button/tile pops), Slow `340ms` (empty-state lantern breath & fade-outs); stagger `55ms`. Entrance direction: left-to-right along ribbons and dialogue lines.

## 7. Brand & Restraint

- **Name:** **Swallowtail** — original unofficial fan theme inspired by *Return to Monkey Island* (2022). No trademarks, no game logos, no copyrighted artwork; ships `info/NOTICE-Swallowtail.txt`.
- **Brand Mark:** Original **Swallowtail Crest** — faceted pirate shield crown over an 8-point notched compass-octagon with forked swallowtail pennant tails and a center gold diamond (`art/mark.svg`, `BrandMarkTemplate`, `info/icon.png` rendered in standard repo `#FF7A1A`).
- **`GameBannerTintBrush`:** Solid Dark Aqua (`#0F4157`, no alpha) so banner darkening washes cleanly into the nocturnal Caribbean stage.
- **Restraint:** Library list (`#070C12`), cover grid backdrop (`#070C12`), and metadata body (`#0F2736`) remain crisp and calm — subtle `4%` gouache grain and `14%` curtain pleats stay confined to sparse framing margins, never muddying game covers or readable text.
