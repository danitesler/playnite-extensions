# Creative direction

Correct but anonymous is a failed theme. Bar: someone who knows the source recognizes it immediately with every title, game name, and logo removed — not because of a tinted accent color, but because the **value structure, proportions, typography, material craft, and interaction grammar** belong unmistakably to that source.

**Default stance for every new theme:** high fidelity to the source, never generic "gaming UI" ornament. Decide boldly and build without presenting timid option menus — **except** if you cannot obtain real visual references for an obscure source, in which case stop and ask the user for 2–3 screenshots rather than designing from memory.

**Mode** (`new-theme.ps1 -Ambition`): **Showcase** for games, films, fictional UIs. **Faithful** for real design systems and OS UIs: max = exact tokens, states and motion curves, no invented glows. **Hybrid** for a game whose UI is a clean system: faithful structure and restraint, Showcase craft on Play, covers, empty page and title band.

## Visual grounding first (required before `BRIEF.md` or `tokens.css`)

Never design from memory or text adjectives ("weathered parchment", "tactical cyan HUD"). Before writing a single token:

1. **Collect 3–6 real reference captures** of the source's actual UI (title/start screen, pause/settings/inventory menu, HUD/dialog/tooltip, button/selection states) into the session scratch folder (never into the repo). Start from any link the user provided, then search visual UI archives (Interface In Game, HUDS+GUIS, official media, Steam store/community, wiki UI galleries).
2. **Inspect every capture visually** (`read_file` on the images) and **measure real hex values** (sample pixels or inspect live CSS/design tokens — never guess colors).
3. **Record visual anatomy in `RESEARCH.md`:**
   - **Value ladder & accent budget:** lightest surface -> mid -> deep ground -> ink -> accent % of screen area. Respect the source's actual lightness and temperature (warm parchment, chalk, olive drab, brutalist white, CRT amber, sunlit stone) instead of defaulting to generic `#0D0F14` dark slate.
   - **Material & edge anatomy:** exact border weights, inner bevels, corner cuts/ornaments, surface tooth (paper fiber, brushed metal, halftone, scanline, lacquer, flat ink), and whether shadows exist at all.
   - **Typography voice:** display vs body pairing, case rules, letter-spacing, weight contrast, tabular numerals, rules/underlines.
   - **Density & negative space:** cramped tactical ledger vs airy editorial frame vs chunky beveled OS chrome.
   - **Observed UI parts & states:** cite which capture shows each surface (frame, bar, cursor, tab, button, dialog) and how idle -> hover -> selected -> pressed transitions actually behave.

## High fidelity vs. visual noise

**High fidelity ≠ clutter.** Do not pile unrelated gimmicks onto every surface to hit a quota.

- **Match the source's true restraint.** A clean, minimal source gets razor-sharp typography, exact spacing, and generous negative space — zero invented glows or extra borders. An ornate or tactile source gets real material craft (bespoke `art/sprites.py` alpha masks for paper grain, brushwork, engraved filigree, metallic sheen, scanlines, or bloom) on **anchor surfaces**, while dense reading areas (game list rows, grid background, metadata copy, descriptions) stay calm and legible.
- **Keep the accent budget disciplined.** Most iconic UIs are 85–95% ground/surface/ink and 5–15% accent. Let one or two focal areas carry the drama so the eye knows where to land.
- **Every ornament must trace to a capture.** If a bracket, glow, chamfer, or rule isn't grounded in `RESEARCH.md`, cut it.

## BRIEF.md (working notes, grounded in `RESEARCH.md`)

1. **Candidate lenses (3 -> pick 1):** before committing to a layout, sketch 3 distinct ways to translate the source into Playnite — **(a) Diegetic / Artifact** (an in-world object: journal, codex, console, brass plaque, dossier), **(b) HUD / Telemetry** (in-game combat HUD, visor, tactical readout, inventory frame), and **(c) Title / Pause Menu** (the game's own start screen, pause list, or chapter select). Compare them against the last 5 themes in `src/themes/AGENTS.md` and pick the lens that feels freshest and most authentic to the captured UI; state why the other two were dropped.
2. **Source DNA (5 measured traits):** value/palette structure, material/texture, silhouette/geometry, typography voice, and motion feel — each tied to a capture and where it lands in Playnite.
3. **Focal hierarchy & source translations:**
   - **1–2 hero focal pieces** (the unmistakable visual anchors — typically the game-page header/banner transition + Play command, or the diegetic frame + active selection cursor).
   - **4–6 structural UI translations** directly observed in `RESEARCH.md` (at least 3 a player names on sight — e.g., HP bar -> `ProgressBar`; inventory slot -> cover tile; menu cursor -> settings tree selection; codex divider -> metadata group break; toast -> filter mark; loading screen -> empty game page). Quality and authenticity beat raw count.
4. **Material & FX plan:** state whether flat vector fills suffice (`Faithful` or crisp graphic sources) or whether `art/sprites.py` white-mask PNGs are needed to capture real texture, brushwork, paper tooth, scanlines, metallic sheen, or organic glow — and build those masks in Phase A so previews and XAML share the real surface craft.
5. **Signature levers:** declare one source-derived choice for every lever in the table below. `validate-extension.ps1` rejects verbatim copies of another theme's `Menu.xaml`, `PlayButton.xaml`, `DetailsViewItemStyle.xaml`, or `GridViewItemStyle.xaml` templates.
6. **Interactive moments & motion language:**
   - 1 hero moment (Play hover + press) and cohesive secondary feedback across details rows, covers, cover buttons, sidebar, settings tree, tabs, checkboxes, and sliders — unified under one motion personality, never noisy.
   - Three durations (fast 90–140ms, base 160–240ms, slow 280–450ms), one easing personality (`CubicEase` calm, `BackEase` punchy, `DiscreteDoubleKeyFrame` pixel, `PowerEase` cinematic), one entrance direction, 40–80ms stagger, 0–2 ambient loops in sparse areas only. Mechanics: [reference.md](reference.md) -> Effects and motion.
7. **Brand:** own original name, one custom vector mark from the source's shapes (never its logo) reused in title band, empty page and tile; `GameBannerTintBrush` from the source's art tint or darkest branded surface.
8. **Restraint & anti-slop commitment:** explicitly state what stays quiet (list rows, grid ground, metadata prose) and which generic clichés are forbidden for this source.

## Shell, Texture & Component Levers

Like [menus.md](menus.md) for popups and [fields.md](fields.md) for inputs and dropdowns, vary **every visible surface and control** from the source instead of falling back to generic flat rectangles or stock form boxes. Every new theme must declare a source-relevant design across backgrounds, side panels, dividers, navigation, menus, inputs, dropdowns, toggles, buttons, and icons:

| Lever | Where it lives | Ways to vary from the source |
|-------|----------------|------------------------------|
| **Background & side-panel textures** | `Views/{Library,Sidebar,TopPanel,FilterPanelView,ExplorerPanel,*GameOverview}.xaml`, `StandardWindowStyle.xaml`, `TreeView.xaml` | Subtle tiled grain, felt/damask weave, corner vignette + source corner brackets, comic ink crosshatch, brushed metal, parchment fiber, scanlines, or circuit grid (`src/Images/fx/*.png` white masks via `OpacityMask` on `PageRoot` and dialog bodies). Always keep dense lists/covers legible and collapse under `ShowBackgroundImageOnWindow` |
| **Layout & structural dividers** | `Common.xaml` (`DividerTemplate`), `Views/*`, `Menu.xaml` | Tapered rules with source crests, dashed conspiracy/stitch lines, segmented HUD rails, hazard bars, stud rows, or ragged hand-inked seams |
| **Left-side menus & navigation** | `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml`, `DefaultControls/TreeView.xaml` | Source-shaped main-menu emblem tile, distinct rail edge seam & foot motif, custom active rail plate/bar, and calm 28–32px Settings/Add-ons tree rows with a source-specific hover wash and selection mark |
| **Inputs & search** | `DefaultControls/{TextBox,PasswordBox}.xaml`, `CustomControls/SearchBox.xaml`, `DerivedStyles/HighlightBorder.xaml` | Sunken notebook/terminal wells, marker edge tabs, stitched leather pouches, chamfered slots, subtle inner texture/baseline rules, and chromatic/glowing focus edges (32px `ControlHeight`, 28px in FilterPanel) |
| **Dropdowns & popup menus** | `DefaultControls/{ComboBox,ContextMenu,Menu}.xaml` | Split chevron cap or `<` `>` stepper cap, source-themed shared popup board (`Local*MenuBoardTemplate`), animated highlight, shortcut badge style, and Exit danger row |
| **Checkboxes, radios & sliders** | `DefaultControls/{CheckBox,RadioButton,Slider,ProgressBar}.xaml` | Hand-inked comic squares, notched octagons, Skill-Node circular badges, toggle switches, vial/gauge sliders with themed end-caps, and source HUD progress bars |
| **Buttons & bespoke icons** | `DefaultControls/{Button,ToggleButton}.xaml`, `DerivedStyles/PlayButton.xaml`, `Media.xaml`, `CustomControls/TopPanelItem.xaml` | Chamfered/taped/bevelled/ledged/sticker plates with source-matched surface textures (`art/sprites.py` bevel sheen, quilt, damask, hex, or suit watermark) across primary, secondary, toggle, and active top-bar plates + bespoke source-drawn `Icon<Role>` geometries (never stock icon packs in `Showcase`/`Hybrid`) |
| **Hero banner transition** | `Views/*ViewGameOverview.xaml` | Soft gradient fade, stepped/pixel dissolve, torn paper or brush mask, chamfered/clipped frame, chromatic seam, or hard engraved rule + ornament |
| **Metadata container & group break** | `Views/*ViewGameOverview.xaml` | Pinned torn notebook flyer, borderless ledger with engraved rules, framed codex card, recessed telemetry cells, tabbed index dividers, or notched brackets |
| **Chip & score silhouette** | `DerivedStyles/PropertyItemButton.xaml`, `TextBlockGameScore.xaml` | Inked sticker tags, cut-corner tags, stamped graffiti rank plaques, bracketed tokens, pill/capsule stamps, or ruled key-value ticks |
| **Row & cover selection mark** | `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Edge rail bar, chromatic corner brackets, directional cursor/chevron, bevelled slot frame, tilted wash, or metallic sheen + `>=48x48` source-shaped `GridTileButton` hover controls |
| **Side-panel close plate** | `GridViewGameOverview.xaml` (`SidePanelCloseButton`) | Custom 28x28 template matching the source's close glyph and plate geometry (cut corner, diamond bezel, comic sticker square, riveted square) — not a stock rectangle |

## Anti-slop red flags (Never)

Unless literally measured in the source's reference captures, never ship:
- Generic dark-charcoal dashboards (`#0D0F14` / `#111318`) with neon cyan/purple/amber 1px glowing borders and 45° chamfered boxes on every surface.
- Glowing shadows, gradients, or heavy card frames wrapping every metadata row, chip, and list item.
- Uppercase wide-tracked monospace micro-labels (`METADATA // SYSTEM // 01`) for non-terminal/non-sci-fi sources.
- Generic tech corner-brackets (`[ ]`, L-ticks) pasted onto covers or panels when the source doesn't use tactical reticles.
- Flat, plastic 8px SaaS cards with zero texture when the source has painted, printed, parchment, metallic, cloth, pixel, or glass craft (use `art/sprites.py` masks).
- Re-skinning another Playnite theme's HTML preview or visual XAML with swapped tokens (copy only invisible behavioral wiring).
- Generic Windows system fonts (`Georgia`, `Segoe UI`, `Impact`) for `Showcase`/`Hybrid` titles instead of a unique, free/open-licensed font found online that matches the game or movie (e.g., `Berkshire Swash` in Swallowtail).
- One radius and one 200ms fade for everything; stock icon packs for `Icon<Role>` in `Showcase`/`Hybrid` themes; a plain coloured title bar; an empty page that is only grey text; decoration over content.

## Preview lock

Treat `art/preview-details.html` and `art/preview-settings.html` as the **art-direction lock** before touching XAML. Inspect the rendered PNGs side-by-side with the saved reference captures against [the preview checklist](theme-preview-review.md), run at least one deliberate visual revision pass to eliminate generic/off-model tells, and only start XAML once the previews pass blind recognition. Do not spawn a reviewer. Check preview parity once XAML is available.
