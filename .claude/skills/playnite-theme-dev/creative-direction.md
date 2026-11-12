# Creative direction: make every theme a showcase

The other files in this skill keep a theme correct. This one makes it memorable. Read it before scaffolding a new theme, before a retrofit of the interactive layer, and whenever a theme "works but feels generic".

Correct but anonymous is a failed theme. The bar: a player who knows the source recognizes it with every logo and name removed, and someone who doesn't still screenshots it.

## Default stance

Unless the user says otherwise, every new theme is built at **Showcase** level. Treat the request as if it said:

> Go to the maximum. Unique game elements, signature animation and a full branding system drawn from the source. Show off every theme-design skill you have, within the repo's hard rules.

Ambition never overrides a hard rule (root `AGENTS.md`, [reference.md](reference.md) -> Hard rules, the validator). It decides what you do inside them.

### Ambition modes

`new-theme.ps1 -Ambition` writes the mode into the theme's `BRIEF.md`. Pick from the source, not from taste:

| Mode | Use for | What "max" means |
|------|---------|------------------|
| **Showcase** (default) | Games, films, shows, fictional UIs (Transistor, Persona, Cyberpunk, Fallout) | Translate the source's own UI pieces into Playnite (game element map below), one hero moment, 5+ signature moments, an ambient layer, generated light/texture assets, a branded title band and empty page |
| **Faithful** | Real design systems and OS UIs (Fluent, Primer, Material, shadcn) | Exact fidelity: every token, radius, state layer and motion curve from the spec, its own interaction patterns (ripple, reveal, ring), polish in the details. No invented game flair, no glows the system doesn't have. Max is precision, not spectacle |
| **Hybrid** | A game whose UI is itself a clean system (Destiny, Mirror's Edge, Portal) | Faithful structure and spacing, Showcase moments on Play, covers, empty page and the title band only |

## The brief (`BRIEF.md`) — write it after research, before scaffolding XAML

`RESEARCH.md` says what the source *is* (measured). `BRIEF.md` says what the theme will *do* with it. Keep it short and concrete: numbers, element names, durations. No adjectives without a value behind them. Link it from `AGENTS.md` -> Sources. Sections:

### 1. Source DNA

Five traits that make the source recognizable with the logo removed. Each one names the evidence (capture, file, timestamp in `RESEARCH.md`) and the Playnite surface it lands on.

| Trait | Evidence | Lands on |
|-------|----------|----------|
| e.g. corner brackets that snap in around the selected function | Functions screen capture | Cover hover, settings tree selection |

Look across: **shape** (corners, cuts, bevels, frames), **light** (glow, bloom, scanlines, flicker, none), **texture** (paper, metal, noise, halftone, pixel grid), **type** (case, tracking, weight, numerals), **motion** (snap, ease, bounce, stepped, ink spread), **sound translated to motion** (a heavy "clunk" menu = short overshoot; a soft chime = slow fade).

### 2. Game element map (Showcase and Hybrid)

The strongest themes don't decorate Playnite; they rebuild it out of the source's own interface parts. Inventory the source's UI elements and assign each to a Playnite surface. Aim for **8+ rows**, at least **3 that the player would name on sight**.

| Source element | Playnite surface | How |
|----------------|------------------|-----|
| HP / stamina bar | `ProgressBar` (library update, completion %) | Segmented fill, damage-flash trailing bar |
| Inventory slot | Cover tile (`GridViewItemStyle`) | Slot frame at rest, item-pickup glint on hover |
| Item rarity tiers | Completion status / score | Rarity colour edge per status (theme brushes only) |
| Quest log entry | Details view list row | Quest-marker glyph on the selected row |
| Minimap / compass | Explorer panel header | Compass tick strip as a static rule |
| Loading screen / standby | Empty game page | Idle motif + `LOCErrorNoGameSelected` |
| Dialogue box | `ToolTip` | Speaker-box frame, typewriter-free (no text animation) |
| Pause menu | Settings window title band + tree | Menu cursor as the selected-row motif |
| Achievement toast | Notifications badge / mark | Toast shape at 7-10px for the filter mark |
| Options menu toggles / sliders | `CheckBox`, `Slider`, `RadioButton` | The game's own on/off pips and slider knob |
| Ability cooldown ring | Play pressed state | Radial sweep on the pressed plate |
| Map pin / waypoint | Sidebar selected item | Pin glyph or chevron in the rail |

These are examples. Build the table from the source, not from this list.

**Surfaces available** (every one is a canvas): Play button (rest, hover, pressed), cover rest / hover / selected, cover hover controls, cover corners and name plate, sidebar rail item (idle, hover, selected), top panel buttons and filter mark, search box, settings title band and tree selection, `GroupBox` headers (respect the Statistics card rule), `TabItem` headers, `CheckBox` / `RadioButton` / `Slider` / `ProgressBar` / `ScrollBarThumb`, `ToolTip`, context menus, window caption buttons, empty game page, banner scrim and title block, metadata labels, section headings, `HighlightBorder`.

### 3. Signature moments

Name them, then budget them. A theme with motion everywhere has no signature.

- **Hero (exactly 1):** the moment people remember. Usually Play hover + press, sometimes the cover hover. Gets the richest layering (bloom, effect loop, pressed sweep).
- **Secondary (5+):** cover hover, cover controls entrance, sidebar selection change, settings tree selection, filter mark appearing, tab switch, checkbox tick, slider thumb grab, title band idle.
- **Ambient (0-2):** slow idle loops only where content is sparse (title band, empty page). Never on lists, covers at rest or behind text.

For each moment record: trigger, layers, duration, easing, brush. Example: `Cover hover | bracket corners slide 6px inward + outline draw-on | 180ms in / 300ms out | CubicEase Out / QuadraticEase In | GlyphColor`.

### 4. Motion language

One vocabulary for the whole theme, so moments feel related:

- **Three durations**: fast (90-140ms: press, tick), base (160-240ms: hover in), slow (280-450ms: hover out, panel entrance). Idle loops 1.5-6s.
- **Easing personality**: `CubicEase`/`QuadraticEase` (calm, systems), `BackEase` Amplitude 0.3-0.6 (punchy, arcade, mech), `ElasticEase` (cartoon only, sparingly), `DiscreteDoubleKeyFrame` steps (pixel, retro, terminal), `PowerEase` Power 4-5 (cinematic, sci-fi).
- **Direction**: what enters from where (rise, slide from left, scale from centre, wipe) and the same rule for every entrance.
- **Stagger**: 40-80ms between sibling elements.
- **Mechanics and limits**: [reference.md](reference.md) -> Effects and motion, Interactive layer, Motion by source type.

### 5. Branding system

The theme is a product. Its pieces should look like one family:

- **Name**: own abstract name that echoes the source (root `AGENTS.md` -> Trademarks & Branding). Write 5 candidates, pick one, record why.
- **Mark**: one simple vector motif from the source's shape language (not its logo). It appears in the title band, the empty page and, reduced to the default orange, `info/icon.png` via `render-addon-icon.ps1`.
- **Title band** (settings + dialogs): the signature graphic ([settings-screens.md](settings-screens.md)). Same mark, same motion vocabulary.
- **Empty game page**: the theme's "poster". Mark + a source motif (empty slot, standby, blank card) + idle loop. Themes can't ship strings: the voice comes from shapes, not words.
- **Type voice**: heading case, tracking, numerals (tabular for stats), one display face at most (bundled, OFL).
- **Previews**: the screenshots are the storefront. Stage the hero moment in its hovered end state in `preview-details.html` and show the brand mark in `preview-settings.html` title band.

### 6. Restraint

List where the theme stays calm, and why. Required entries: library list and cover grid backgrounds (solid or gradient), metadata text (body face, full contrast), dense settings pages. The richer the moments, the quieter the ground under them.

## Ban list (generic tells)

Any of these means the source wasn't used. Replace it with something from the brief.

- A neon glow on everything, or a glow the source doesn't have.
- Purple-to-blue or teal gradients standing in for "gaming".
- Uniform 8px rounded rectangles for every control regardless of the source's shapes.
- The same 200ms opacity fade on every hover.
- Stock icon pack glyphs left unmodified where the source has its own icon language (Play, Info, Download, filter mark).
- Scaffold sample data, "Lorem", or another theme's preview recoloured.
- A title band that is just a coloured bar with the window title.
- An empty page that is centred grey text.
- Decoration that hides content, competes with cover art or breaks the Statistics cards.

## Review pass (after the first full build and preview render)

Score the theme 1-5 on each, write the scores and the fix into `BRIEF.md` -> Review, then fix the two lowest before calling the theme done. Repeat once.

| Criterion | 5 means |
|-----------|---------|
| Recognition | Logo-off test passes from the details screenshot alone |
| Game element map | 8+ rows implemented, 3+ instantly nameable |
| Hero moment | Layered, smooth in and out at 125% and 150%, pressed state distinct |
| Motion coherence | Every moment uses the three durations and one easing personality |
| Brand cohesion | Mark, title band, empty page, tile and previews read as one family |
| Restraint and legibility | Lists, covers and metadata calm; text contrast intact; validator clean |

A score is only valid with evidence: the screenshot looked at, the hover tested in Playnite, the validator output read.
