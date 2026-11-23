# Starlane — Creative Brief (`Showcase`)

Unofficial *Star Wars*-inspired minimalist OLED desktop theme. Research: [RESEARCH.md](RESEARCH.md).

## 1. Candidate Lenses -> Pick 1

Recent themes in `src/themes/AGENTS.md`: `Dewfield` (walnut/parchment ledger), `Subspace` (curved LCARS pastel blocks), `Stride` (light ice glass), `Ditherwake` (1-bit copperplate ledger), `Wildhand` (Balatro green felt), `Checkpost` (black & olive stamps).

- **(a) Diegetic / Artifact**: A heavy, bordered Imperial console or Holocron box. *Dropped*: Too visually busy and boxed-in; loses the iconic emptiness of space and lightsaber glow.
- **(b) HUD / Telemetry**: Cluttered cockpit wireframes and rank plaques. *Dropped*: Competes with game art and breaks minimalist clarity.
- **(c) Opening Titles & Minimalist Lightsaber OLED — CHOSEN**: Pure `#000000` OLED deep space dusted with a calm starfield (`starfield.png`), monumentally clean **hollow-yellow outlined Star Wars movie typography** (`#FFE81F` outline around `#000000` interior in `Unbounded Bold`) for titles, `Orbitron` sci-fi section headings, and razor-sharp **white-cored glowing Lightsaber beams** in **Jedi Blue (`#28A8FF`)**, **Consular Green (`#18C958`)**, and **Sith Red (`#E52222`)** as the sole color punctuation across an ultra-minimalist borderless interface.

## 2. Source DNA (5 Traits)

| Trait | Where it lands in Playnite |
| --- | --- |
| **Pure OLED Space & Starfield** (`#000000` + subtle `starfield.png` pinpoints) | Window, sidebar, top bar, game list, game page, Settings backdrop |
| **Hollow-Outlined Star Wars Movie Title** (`#FFE81F` crisp outline around `#000000` core in `Unbounded Bold`) | Game page display title (`PART_TextDisplayName`), Settings title band (`SETTINGS`), empty-state display |
| **Star Wars Sci-Fi Typography Triad** (`Unbounded Bold` + `Orbitron` + `Barlow`) | Outlined movie titles, uppercase `Orbitron` section/button labels, calm News-Gothic-like `Barlow` list & prose |
| **Multi-Color White-Cored Lightsaber Glows** (`saber-beam-h.png`, `saber-beam-v.png`, `saber-frame.png` + `#FFFFFF` core) | **Blue** = Play ignition, selected rows, focus, slider blade; **Green** = running/launching sweep, checked toggles, positive scores; **Red** = Exit (`Alt+Q`), close hover, Cancel hover, danger |
| **Minimalist Opening-Screen Restraint** (zero heavy boxes, whisper-thin `#181C24` hairlines) | Borderless OLED metadata ledger, frameless sidebar & top bar, clean floating game list |

## 3. Game Element Map (9 Rows — 4+ Recognizable on Sight)

| Star Wars Element | Playnite Surface | Recognizable on Sight |
| --- | --- | --- |
| **Hollow-Yellow Outlined Opening Logo Title** | Game title (`DetailsViewGameOverview`, `GridViewGameOverview`) & Settings title | Yes |
| **Deep-Space Opening Starfield (`#000000` OLED)** | Library backdrop, game page, Settings window | Yes |
| **Igniting Blue Lightsaber Hilt + Plasma Blade** | `DerivedStyles/PlayButton.xaml` (hero moment) | Yes |
| **Vertical Blue Lightsaber Beam Selection** | `DetailsViewItemStyle.xaml`, `SidebarItem.xaml`, `TreeView.xaml` | Yes |
| **Green Lightsaber Ignition Sweep** | `RunningIndicator` across Play, rows, covers, list view | Yes |
| **Sith Red Lightsaber Alert Beam** | Exit (`Alt+Q`), `SidePanelCloseButton` hover, `RUNNING` Cancel hover, negative score | Yes |
| **"A Long Time Ago..." Cyan Subtitle Accent** | Active filter star pip (`PART_ToggleFilter`), metadata section captions, links | |
| **Horizontal Lightsaber Power Blade** | `Slider.xaml` filled track & `ProgressBar.xaml` (`PART_ProgressGlobal`) | |
| **Starfield Standby Emblem** | Empty game page (`LOCErrorNoGameSelected` in both views) | |

## 4. Six Shell & Game Page Levers

1. **Hero banner transition (`Views/*ViewGameOverview.xaml`)**: Pure OLED `#000000` deep-space fade emerging into subtle twinkling `starfield.png`, closed below the title by a whisper-thin `#181C24` hairline with a short glowing Crawl-Yellow lead accent.
2. **Play button architecture (`DerivedStyles/PlayButton.xaml`)**: Ultra-minimalist **Lightsaber Hilt & Blade** plate — sleek obsidian `#090B0F` body with a compact metallic left emitter collar; at rest framed by a clean `1px` **Jedi Blue (`#28A8FF`)** edge and uppercase `Orbitron` label. **On hover (hero moment)**: a white-hot `#FFFFFF` plasma core + lush **Blue Lightsaber glow** (`saber-beam-h.png` + `saber-frame.png`) ignites left-to-right across the blade (`170ms PowerEase 3`). While launching/running, the blade ignites **Consular Green (`#18C958`)**; hovering `RUNNING` switches to **Sith Red (`#E52222`)** `Cancel`.
3. **Metadata container & group break (`Views/*ViewGameOverview.xaml`)**: **Minimalist Borderless OLED Ledger** — no heavy card box; calm starfield space separated from content by a single `1px` `#181C24` hairline, with subtle `"A long time ago..."` Cyan captions and whisper-thin lightsaber-pipped hairline group breaks (`DividerTemplate`).
4. **Chip & score silhouette (`PropertyItemButton.xaml`, `TextBlockGameScore.xaml`)**: Minimal dark `#090B0F` hairline chips that ignite a thin Blue Lightsaber bottom edge on hover; minimalist OLED score badges underscored by a glowing 2px lightsaber bar (**Green** positive / **Yellow** mixed / **Red** negative).
5. **Row & cover selection mark (`DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`)**:
   - Details rows: hover fades a soft `#141923` tint; selection ignites a **vertical Blue Lightsaber beam** (`#FFFFFF` 1.5px core + `saber-beam-v.png` blue aura) on the left edge over a calm `#081826` wash.
   - Grid covers: hover ignites a crisp **Blue Lightsaber perimeter aura** (`saber-frame.png`); selection locks a glowing **Crawl Yellow (`#FFE81F`)** hairline frame with white-cored top lightsaber glint.
6. **Custom 28×28 side-panel close plate (`SidePanelCloseButton`)**: Minimal dark `#090B0F` hairline square (`#232936` rim, `14px` `IconWindowClose`), igniting **Sith Red (`#E52222`)** with a white-hot edge flash and pure white glyph on hover (`120ms`).

## 5. Seven Popup Menu Levers (`ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`)

1. **Panel (`LocalStarlaneMenuBoardTemplate`)**: `30px` rows; pure near-OLED `#090B0F` floating sheet in a crisp `1px` `#232936` hairline, crowned by a thin glowing **Blue Lightsaber** top emitter edge (`saber-beam-h.png` + `1px` white core fading right) and subtle `starfield.png` specks.
2. **Highlight**: Calm `#081826` blue wash with an igniting **vertical Blue Lightsaber blade** on the left (`1.5px` `#FFFFFF` core + `saber-beam-v.png` blue aura) and a razor-thin bottom blue glow line wiping left-to-right (`ScaleX 0.85 -> 1`, `120ms CubicEase`), brightening label, icon, and submenu arrow to pure `#FFFFFF` (`+2px` nudge). Open submenus hold the steady `#081826` wash with blue left bar.
3. **Group break (`DividerTemplate`)**: `10px` whisper-thin `#181C24` hairline led by a tiny `10x2` glowing Crawl-Yellow saber spark.
4. **Icons**: Muted `#8A95A8` at rest; illuminate to pure `#FFFFFF` on Blue Lightsaber highlight and `#FFFFFF` on Sith Red Exit highlight via `TextElement.Foreground`.
5. **Shortcuts**: Clean minimalist right-aligned `Consolas` monospace (`#8A95A8`), illuminating to `#75CBFF` (or `#FFFFFF` on Exit) on highlight — zero clunky boxes.
6. **Submenu mark**: Minimal chevron (`IconSubmenu`), lighting `#28A8FF` while `IsSubmenuOpen`, pure `#FFFFFF` on highlight.
7. **Marked rows**: Exit (`Alt+Q`) uses Sith Red (`#FF6666`) text/icon at rest, igniting a **Sith Red Lightsaber blade** (`#E52222` solid plate + white-hot left saber core + pure `#FFFFFF` label, `5.1:1`) on highlight. Checked & chosen rows show a minimal glowing **Consular Green (`#18C958`)** saber dot + crisp check glyph.

## 6. Motion Language & Running Game Indicator

- **Durations**: Fast `100ms` (hover washes, hairline flips), Base `170ms` (lightsaber blade ignition, row beam wipe), Slow `320ms` (running foot fill, cover settle).
- **Easing**: `CubicEase` (`EaseOut`) for clean minimal UI; `PowerEase` (`Power="3"`) for lightsaber ignition sweeps.
- **Running / Launching (`RunningIndicatorBrush` = `#18C958` Consular Green Lightsaber)**:
  - **Launching (`1.6s` loop)**: **Green Lightsaber Ignition Sweep** — bright white-cored emerald plasma beam (`saber-beam-h.png` + `RunningScan`) sweeps left-to-right across the item, charging a sleek glowing emerald foot blade while **three minimalist lightsaber power pips** pulse sequentially on the right edge.
  - **Running (`3.2s` idle hum)**: Calm emerald saber hum (`0.72 -> 1.0 -> 0.72` opacity) while the three power pips breathe gently. Hovering `RUNNING` shifts to **Sith Red** `Cancel` (`PlayContent` `Visibility="Hidden"`).
