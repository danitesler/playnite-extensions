# Creative direction

Correct but anonymous is a failed theme. Bar: someone who knows the source recognizes it with every name and logo removed.

**Default stance for every new theme:** go to the maximum. Unique game elements, signature animation and a full branding system drawn from the source, within the hard rules. Decide and build; don't present options or wait for approval.

**Mode** (`new-theme.ps1 -Ambition`): **Showcase** for games, films, fictional UIs. **Faithful** for real design systems and OS UIs: max = exact tokens, states and motion curves, no invented glows. **Hybrid** for a game whose UI is a clean system: faithful structure, Showcase moments on Play, covers, empty page and title band.

## BRIEF.md (working notes, a few lines each)

1. **Source DNA:** 5 traits that identify the source (shape, light, texture, type, motion), each with where it lands in Playnite.
2. **Game element map:** 8+ of the source's own UI parts rebuilt as Playnite surfaces, 3+ a player names on sight. Examples: HP bar -> `ProgressBar`; inventory slot -> cover tile; rarity tiers -> completion status edge; menu cursor -> settings tree selection; toast -> filter mark; loading screen -> empty game page; options toggles -> `CheckBox`/`Slider`; cooldown ring -> Play pressed.
3. **Moments:** 1 hero (usually Play hover + press, richest layering), 5+ secondary (cover hover, cover buttons, sidebar selection, tree selection, tab, checkbox, slider), 0-2 ambient loops in sparse areas only.
4. **Motion language:** three durations (fast 90-140ms, base 160-240ms, slow 280-450ms), one easing personality (`CubicEase` calm, `BackEase` punchy, `DiscreteDoubleKeyFrame` pixel, `PowerEase` cinematic), one entrance direction, 40-80ms stagger. Mechanics: [reference.md](reference.md) -> Effects and motion.
5. **Brand:** own name, one vector mark from the source's shapes (never its logo) reused in title band, empty page and tile; `GameBannerTintBrush` from the source's art tint or darkest branded surface.
6. **Restraint:** lists, cover grid backgrounds and metadata text stay calm.

## Never

Glows the source doesn't have; "gaming" purple/teal gradients; one radius and one 200ms fade for everything; stock glyphs where the source has its own icons; a plain coloured title bar; an empty page that is only grey text; decoration over content.

## Preview check

Check the rendered previews against [the preview checklist](theme-preview-review.md) before implementing XAML. Fix blocking findings in the HTML and re-render. Do not spawn a reviewer. Check preview parity once XAML is available.
