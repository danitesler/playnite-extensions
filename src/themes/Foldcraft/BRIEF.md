# Foldcraft — Creative Brief

Mode: **Showcase** (`new-theme.ps1 -Ambition Showcase`). Light craft-paper theme framed by dark cutting-mat and torn-charcoal HUD chrome. Notes in [`RESEARCH.md`](RESEARCH.md); the reviewed previews are the visual contract.

## 1. Candidate Lenses (3 → Pick 1)

Recent 5+ themes in `src/themes/AGENTS.md`: **Swallowtail** (midnight-harbor theater curtains & pirate gold ribbons), **Subspace** (true-black LCARS backlit bridge console), **Dewfield** (light honey-parchment & walnut notice board), **Counterfoil** (dark 35mm film-strip & oil brush), **Testbed** (light cleanroom aluminum & carbon chamber), **Rushdown** (dark ultraviolet neon & aqua glass).

- **(a) Diegetic / Artifact — Gridded Cutting Mat & Accordion Papercraft Binder *(CHOSEN)*:** Playnite's shell becomes a physical papercraft workbench: a **self-healing teal cutting-mat** `44px` left rail (`#0B5853` + `#25B5AD` hairline grid), a **torn-charcoal HUD** `50px` top bar (`#262423` + deckled `#B5B2AD` edge & curled sky-blue confetti progress ribbon), a **calm warm fibrous paper** library (`#EFECE4` with `#221D1A` warm umber ink), **seafoam-mint bookmark strip** row selections (`#95C5B0`), **serrated/folded-corner cover mounts**, and an **accordion-creased ivory cardstock** (`#EAE3D2`) metadata dossier and popup menu board. Completely distinct in hue, material warmth, and craft construction from Testbed (clinical aluminum), Dewfield (honey/walnut pixel art), Cropmark (comic Bristol ink/orange), and Swallowtail (nocturnal sea-teal).
- **(b) HUD / Telemetry — Charcoal Torn-Strip Overlays *(Dropped)*:** Using torn charcoal strips (`#262423`) across the entire window makes the theme dark and monochrome, repeating Tumbleweed/Counterfoil while losing Tearaway's bright construction paper, cutting mat, and accordion cards. We keep the torn charcoal strip strictly for the `50px` top bar, tooltips, and shortcut keycaps.
- **(c) Title / Pause Menu — Full-Page Chartreuse / Mint Construction Fan *(Dropped)*:** Filling the entire library backdrop with saturated seafoam-mint (`#A3C8B8`) or chartreuse (`#AEC572`) fights colorful game covers and reduces reading comfort. Instead, we keep those paper colors on tabs, selection strips, badges, and controls over calm `#EFECE4` fibrous paper.

## 2. Source DNA (5 Traits → Playnite Surfaces)

1. **Gridded Teal Cutting Mat + Torn Charcoal Strip (`#0B5853` + `#262423`):** Grounds the `44px` left rail (with `cutting-mat-grid.png`), Settings `44px` title band, and `50px` top bar (with `deckle-edge-h.png` scissor-cut lower edge).
2. **Warm Fibrous Craft Paper & Accordion Ivory Cardstock (`#EFECE4` / `#EAE3D2`):** Calm high-contrast reading surfaces (`> 12:1` ink contrast) marked by subtle 3-panel vertical accordion fold creases, studio offset paper shadows (`#C4BA9F`, no `DropShadowEffect`), and `4%` `paper-fibers.png`.
3. **Multi-Colored Construction-Paper Bookmark Tabs (`#95C5B0` Mint, `#F7F5EE` White, `#E0A229` Ochre, `#187A36` Emerald):** Radial-inspired sliding tabs on sidebar items, active crisp white `PAPERCRAFT` view-switch tabs on the top bar, seafoam-mint selected library rows with deep-teal fold tabs, and rounded-cut ochre-gold `Continue` Play CTA.
4. **Blueprint Fold Lines, Hot Magenta Rules & Wavy Postal Stamps (`#E91E78` / `#28A7DF`):** Hot magenta rules lead section headings (`ALL PHOTOS` energy), faint `blueprint-folds.png` anchors the empty game page, and dashed/wavy rules divide the 6 metadata groups.
5. **Cut-Paper Typography (`Oswald` + `Nunito`):** Tall, upright condensed `Oswald` titles & action labels paired with warm, rounded `Nunito` UI labels and body prose.

## 3. Game Element Map (11 Source Elements → Playnite Surfaces)

| Source UI Element (*Tearaway*) | Playnite Surface |
| --- | --- |
| Gridded green cutting mat (`19/40`) | `44px` Sidebar rail (`#0B5853` + `cutting-mat-grid.png`) & Settings `44px` title band |
| Charcoal torn-edge prompt strip (`36/40`, `39/40`) | `50px` Top Panel bar (`#262423` + `deckle-edge-h.png`), `ToolTip`, and menu keycap shortcuts |
| Accordion-folded 3-panel ivory dialog (`14/40`, `18/40`) | Game Page metadata dossier (`#EAE3D2` with subtle vertical fold crease seams) & `LocalPaperBoardTemplate` popup menu |
| Radial colored paper fan tabs (`1/40`, `3/40`, `26/40`) | `SidebarItem` sliding colored bookmark plates (`#1EA1D4`/`#5BC28E`/`#F7F5EE`) & `TopPanel` crisp white active view tab |
| `Continue` / `Replay` ochre-gold pill (`1/40`, `15/40`) | `PlayButton` primary CTA (`#E0A229` rounded-cut ochre pill with `#B87E15` bottom bevel lip & `paper-sheen.png`) |
| Bookmarks Seafoam-Mint panel (`15/40`, `16/40`) | `DetailsViewItemStyle` selected row (`#95C5B0` seafoam bookmark + `#0B5853` left fold tab + sliding folded-triangle pointer) |
| `[✓]` Emerald / `[✕]` Crimson split folded toggle (`3/40`) | `CheckBox` (`#187A36` Emerald ON plate with crisp white cut check) & `RadioButton` |
| `COLOURED-IN` Tangerine spinner (`30/40`) | `ComboBox` right-side Tangerine (`#D96218`) triangle stepper button & `Slider` active track/thumb highlight |
| Curled Sky-Blue confetti counter ribbon (`18/40`, `35/40`) | `PART_ProgressGlobal` (`12px` curled sky-blue confetti bar) & `ProgressBar` |
| Circular grey cutout `X` disc (`30/40`, `19/40`) | `28×28` `SidePanelCloseButton` (concentric pale-grey fibrous paper disc flipping solid Crimson `#C62828` on hover) |
| Papercraft Blueprint Sheet (`26/40`, `30/40`) | `EmptyGameTemplate` (`blueprint-folds.png` fold-tab background, Origami Seal mark, `LOCErrorNoGameSelected`) |

## 4. Shell, Game Page & Menu Levers

1. **Hero banner transition:** Soft craft-paper bottom scrim fading cleanly into `PageRoot.Background.Color` (`#EFECE4`) — keeping `PART_ImageBackground` free of any `OpacityMask` — framed along the top/bottom by a subtle **deckled scissor-cut paper rule** (`#C8BFAA` + `GameBannerTintBrush` `#EFECE4` for light-theme banner darkening).
2. **Play button architecture:** Rounded-cut Ochre-Gold construction-paper pill (`#E0A229`, `ControlCornerRadius="6"`, `2px` bottom bevel fold `#B87E15`, crisp `#221D1A` `Oswald` uppercase label); hover warms to `#EEB53E`, lifts `-1px` (`BackEase`), sweeps `paper-sheen.png` catchlight, and flares a miniature folded gold bookmark corner; press depresses cleanly onto its fold shadow (`#B87E15`).
3. **Metadata container & group break:** **Accordion-Folded Ivory Cardstock Dossier (`#EAE3D2`, `300px` usable content width)** with `2` subtle vertical fold-crease lines dividing the sheet into 3 tactile accordion panels, a `3px` bottom-right hard studio paper shadow (`#C4BA9F`), and **Blueprint dashed cut-fold dividers with tiny scissor-tick notches** between the 6 groups (collapsed automatically in `Center`/`Stretch`).
4. **Chip & score silhouette:** `PropertyItemButton` (`Tag="Chip"`) tags look like **small cut-paper sticky labels** (`#FAF8F3` ivory-white paper, `1.5px` `#B8AE98` cut border, `ControlCornerRadius="6"`, tiny `3px` Seafoam/Cerulean left sticker tab that turns Ochre-Gold on hover); `TextBlockGameScore` uses framed circular/octagonal cardstock stamps with Emerald/Amber/Crimson rating rims.
5. **Row & cover selection mark:**
   - *Details row:* Calm `#EFECE4` paper at rest; hover fades in a pale seafoam tissue wash (`#DCECE4`, `110ms`) and slides a `7px` folded-paper triangle pointer (`▶`) from the left; selected locks a **Seafoam-Mint (`#95C5B0`) bookmark strip** with a `3px` Deep Cutting-Mat Teal (`#0B5853`) left fold bar, crisp `#1E1B18` ink, and subtle bottom paper lip.
   - *Grid cover:* Crisp `#F7F5EE` cardstock mount inside `ItemSpacingMargin` with a `2px` bottom-right paper shadow; hover scales (`1.024`, `BackEase`) and reveals a **Cerulean (`#1EA1D4`) folded corner tape** + `48×48` concentric circular cut-paper `GridTileButton` Play/Info discs; selection locks an **Emerald Green (`#187A36`) crisp cut-paper frame** and a **golden-yellow (`#F2B705`) top-right folded triangle seal**.
6. **28×28 Side-panel close plate:** Circular-notched pale grey fibrous paper disc (`#D6D9DC` outer ring, `#EBECEE` inner disc, `#221D1A` `14px` `IconWindowClose`); hover smoothly fills solid Crimson (`#C62828`, `120ms`) with paper-white `X` (`#FAF8F3`).
7. **Unified Popup Menus (`ContextMenu`, `Menu`, `TopPanelMenu`, `ComboBox`):** Compact `30px` rows on `LocalPaperBoardTemplate` — **accordion-folded ivory cardstock (`#F3EFE6`)** with a subtle vertical fold crease, `1.5px` warm umber border (`#3A332D`), `3px` hard bottom-right paper shadow (`#C4BA9F`), and a **top-left folded teal paper dog-ear tab**. **Highlight:** **Emerald Green (`#187A36`)** construction-paper strip glides in (`ScaleX 0.90→1`, `120ms` `CubicEase`) while a crisp white folded-triangle cursor slides in (`-6→0`), icon flips paper-white (`#FAF8F3` via `TextElement.Foreground`), and label steps `+2px` right (`5.25:1`). **Group break:** `10px` dashed blueprint cut line led by a hot-magenta scissor tick. **Shortcuts:** Dark torn-charcoal HUD key tags (`#262423`, `#F7F5EE` text, flipping `#FAF8F3` + `#187A36` ink on highlight). **Marked rows:** Exit (`Alt+Q`) sits in Crimson (`#C62828`) at rest and solid Crimson plate with `#FAF8F3` label on highlight (`5.5:1`); checked rows draw an Emerald square cut-paper socket with crisp white check.

## 5. Running & Launching Indicator

- **Color (`RunningIndicatorBrush`):** **Confetti Electric Cobalt (`#1264B5`, bright highlight `#3BB5F0`)** — completely distinct from Ochre-Gold Play (`#E0A229`), Seafoam-Mint/Emerald Selection (`#95C5B0`/`#187A36`), Hot Magenta Filter Pip (`#E91E78`), and Crimson Danger (`#C62828`). `#FAF8F3` white labels keep `5.85:1` bare and `>8.5:1` under `ScrimBrush` (`#0B2239`).
- **Launching (`1.6s` loop):** Angled multi-facet confetti sweep (`confetti-sweep.png` mask moving across `RunningScan`) + segmented sky-blue ribbon foot bar (`RunningFill`) + **three tumbling paper confetti diamonds** popping along the right edge (`0.9–1.35s`) as the sweep lands.
- **Running (`3.2s` loop):** Quiet breathing cobalt frame (`0.72 → 1.0`), full ribbon foot bar, and gently floating confetti diamonds (`TranslateTransform Y`, staggered); hovering the `RUNNING` Play button dims via `RunningHoverDim` and reveals `Cancel` while keeping `PlayContent` `Visibility="Hidden"`.

## 6. Moments & Motion Language

- **Hero moment:** `PlayButton` hover — Ochre-Gold paper pill lifts `-1px` (`BackEase`), warms to `#EEB53E`, sweeps `paper-sheen.png` sunlight across its cut bevel, and flares a folded gold bookmark corner; press depresses smoothly onto `#B87E15`.
- **Secondary moments (7):** Details row tissue wash + seafoam bookmark slide; Grid cover lift + cerulean corner tape + staggered `48×48` circular cut-paper `GridTileButton` pops; Sidebar colored bookmark tab slide; TreeView bare-row paper wash + `2px` emerald fold bar; CheckBox Emerald `[✓]` paper pop; ComboBox Tangerine chevron bounce; TabControl active crisp-white paper tab rise.
- **Durations & Easing:** Fast `110ms` (menu & row hovers, press snap), Base `185ms` (`BackEase` amplitude `0.24` for playful papercraft springs; `CubicEase` Out for washes/tabs), Slow `320ms` (empty-state fold breath & exits with `FillBehavior="Stop"`). Stagger `50ms`. Entrance direction: left-to-right bookmark slide and top-down tab lift.

## 7. Brand & Restraint

- **Name:** **Foldcraft** (`foldcraft`, `src/themes/Foldcraft`) — unofficial community fan theme inspired by *Tearaway* (2013); zero trademarks or game assets; ships `info/NOTICE-Foldcraft.txt`.
- **Brand Mark:** Original **Foldcraft Origami Seal** — an 8-point notched folded-paper diamond rosette with crisp center crease lines (`art/mark.svg`, `BrandMarkTemplate`, `IconMainMenu`, `info/icon.png` in standard `#FF7A1A`).
- **`GameBannerTintBrush`:** Solid Warm Fibrous Paper (`#EFECE4`) so banner darkening blends cleanly into the paper board, paired with `WindowArtForegroundBrush` (`#FAF8F3`) for light-theme window background art.
- **Restraint:** Library list (`#EFECE4`), cover grid backdrop (`#EFECE4`), and description boxes (`#FAF8F3` / `#EFECE4`) stay completely calm — paper fibers stay <= `4%`, cutting-mat grid stays <= `7%` on the 44px rail, and blueprint fold diagrams live only in sparse empty states and subtle dossier margins.
