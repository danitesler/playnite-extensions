# Creative direction

Correct but anonymous is a failed theme. Bar: someone who knows the source recognizes it with every name and logo removed.

**Default stance for every new theme:** go to the maximum. Unique game elements, signature animation and a full branding system drawn from the source, within the hard rules. Decide and build; don't present options or wait for approval.

**Mode** (`new-theme.ps1 -Ambition`): **Showcase** for games, films, fictional UIs. **Faithful** for real design systems and OS UIs: max = exact tokens, states and motion curves, no invented glows. **Hybrid** for a game whose UI is a clean system: faithful structure, Showcase moments on Play, covers, empty page and title band.

## BRIEF.md (working notes, a few lines each)

1. **Candidate lenses (3 -> pick 1):** before committing to a layout, sketch 3 distinct ways to translate the source into Playnite — **(a) Diegetic / Artifact** (an in-world object: journal, codex, console, brass plaque, dossier), **(b) HUD / Telemetry** (in-game combat HUD, visor, tactical readout, inventory frame), and **(c) Title / Pause Menu** (the game's own start screen, pause list, or chapter select). Compare them against the last 5 themes in `src/themes/AGENTS.md` and pick the lens that feels freshest and most recognizable for this source; state why the other two were dropped.
2. **Source DNA:** 5 traits that identify the source (shape, light, texture, type, motion), each with where it lands in Playnite.
3. **Game element map:** 8+ of the source's own UI parts rebuilt as Playnite surfaces, 3+ a player names on sight. Examples: HP bar -> `ProgressBar`; inventory slot -> cover tile; rarity tiers -> completion status edge; menu cursor -> settings tree selection; toast -> filter mark; loading screen -> empty game page; options toggles -> `CheckBox`/`Slider`; cooldown ring -> Play pressed.
4. **Signature levers:** declare one source-derived choice for every lever in the table below. `validate-extension.ps1` rejects verbatim copies of another theme's `Menu.xaml`, `PlayButton.xaml`, `DetailsViewItemStyle.xaml`, or `GridViewItemStyle.xaml` templates.
5. **Moments:** 1 hero (usually Play hover + press, richest layering), 5+ secondary (details row hover + click/selection, cover hover + click/selection, cover buttons, sidebar selection, tree selection, tab, checkbox, slider), 0-2 ambient loops in sparse areas only.
6. **Motion language:** three durations (fast 90-140ms, base 160-240ms, slow 280-450ms), one easing personality (`CubicEase` calm, `BackEase` punchy, `DiscreteDoubleKeyFrame` pixel, `PowerEase` cinematic), one entrance direction, 40-80ms stagger. Mechanics: [reference.md](reference.md) -> Effects and motion.
7. **Brand:** own name, one vector mark from the source's shapes (never its logo) reused in title band, empty page and tile; `GameBannerTintBrush` from the source's art tint or darkest branded surface.
8. **Restraint:** lists, cover grid backgrounds and metadata text stay calm.

## Shell & Game Page Levers

Like [menus.md](menus.md) for popups, vary these six structural surfaces from the source instead of falling back to generic rectangles:

| Lever | Where it lives | Ways to vary from the source |
|-------|----------------|------------------------------|
| **Hero banner transition** | `Views/*ViewGameOverview.xaml` | Soft gradient fade, stepped/pixel dissolve, torn paper or brush mask, chamfered/clipped frame, or hard engraved rule + ornament |
| **Play button architecture** | `DerivedStyles/PlayButton.xaml` | Chamfered plate, double-ruled crest, skewed parallelogram, stitched/riveted slab, inset bezel, or floating-underline trigger |
| **Metadata container & group break** | `Views/*ViewGameOverview.xaml` | Borderless ledger with engraved rules, framed codex card, recessed telemetry cells, tabbed index dividers, or notched brackets |
| **Chip & score silhouette** | `DerivedStyles/PropertyItemButton.xaml`, `TextBlockGameScore` | Cut-corner tags, stamped badges, bracketed tokens, pill/capsule stamps, framed numeric plaques, or ruled key-value ticks |
| **Row & cover selection mark** | `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml` | Edge rail bar, corner brackets, directional cursor/chevron, bevelled slot frame, tilted wash, or metallic sheen + clasp |
| **Side-panel close plate** | `GridViewGameOverview.xaml` (`SidePanelCloseButton`) | Custom 28x28 template matching the source's close glyph and plate geometry (cut corner, diamond bezel, stamp, riveted square) — not a stock rectangle |

## Never

Glows the source doesn't have; "gaming" purple/teal gradients; one radius and one 200ms fade for everything; stock icon packs for `Icon<Role>` in `Showcase`/`Hybrid` themes; a plain coloured title bar; an empty page that is only grey text; decoration over content.

## Preview check

Check the rendered previews against [the preview checklist](theme-preview-review.md) before implementing XAML. Fix blocking findings in the HTML and re-render. Do not spawn a reviewer. Check preview parity once XAML is available.
