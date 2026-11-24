# Theme preview checklist

Check the rendered previews yourself before implementing the theme in XAML. Do not spawn a reviewer, and do not hand this checklist to another agent. Treat Pass 1 as a draft, never a rubber stamp: run a harsh side-by-side critique against the real source captures, execute at least **one dedicated visual revision pass**, and re-render before writing a single line of XAML.

Open and inspect **together** in this step:
- The theme's `BRIEF.md`, `RESEARCH.md`, and `src/tokens.css`
- The **saved source reference screenshots** in scratch (captured during research)
- Both `art/preview-details.html` and `art/preview-settings.html`
- Both rendered `art/screenshot-details.png` and `art/screenshot-settings.png`

Use [creative-direction.md](creative-direction.md), [previews.md](previews.md), [settings-screens.md](settings-screens.md), and [src/themes/AGENTS.md](../../src/themes/AGENTS.md) as references.

## Before XAML

### 1. Side-by-side visual fidelity (against the reference captures)
Compare `screenshot-details.png` and `screenshot-settings.png` directly against the saved reference screenshots:
- **Squint test:** Does the overall value structure (light/dark balance, contrast hierarchy, warm/cool cast, accent % of area) match the source — or did it drift into a generic dark Playnite dashboard tinted with one accent color?
- **Swap test:** If the sample game title were replaced with a random unrelated game and the brand mark were hidden, would someone who knows the source still recognize it on sight?
- **Material & silhouette:** Do borders, corners, surface grain/textures (`art/sprites.py` masks), typography scale/case, and negative space feel crafted from the same world as the source? If flat fills look sterile next to the captures, add or refine real white-mask FX/texture assets now.

### 2. Anti-slop audit (mandatory — name at least 2–3 specific flaws on Pass 1)
Audit both PNGs against every item in [creative-direction.md -> Anti-slop red flags](creative-direction.md#anti-slop-red-flags-never):
- Any unmotivated glows, neon 1px outlines, generic chamfers, tech brackets, or uppercase monospace labels the source doesn't have?
- Any boxed-in clutter (heavy cards around every metadata field, noisy list rows, competing accents) where the source is cleaner or more disciplined?
- Any scaffold leftovers or copied layout rhythm from another Playnite theme?
- List the exact screenshot regions that still read as generic or off-model, and fix them before moving on.

### 3. Focal hierarchy & ambition
- Are the 1–2 hero focal pieces unmistakable and staged in their rich end state (hero moment hovered in `preview-details.html`, signature brand mark in the `preview-settings.html` title band)?
- Are at least 3 source UI translations from `BRIEF.md` immediately legible without cluttering dense content?

### 4. Repo rules visible in a preview
Check form and filter sizing (`ControlHeight` 32px, filter sidebar 28px), the More and Edit icon-only actions, 44px sidebar rail, top bar order (`PART_TextMainSearch` -> `PART_ToggleFilter` -> `PART_PanelMainItems` with sorting first and icon-only view switches), filter mark shape, settings chrome (`StandardWindowStyle` title band + bare 28–32px `TreeView` rows), ComboBox chevron clearance, corner radii, `var(--token)` colors, bundled fonts (zero `system font used` warnings), and original branding. Flag scaffold leftovers.

### 5. WPF feasibility
Flag anything XAML can't reproduce cheaply: `backdrop-filter`, `mix-blend-mode`, CSS filters, text gradients, complex `clip-path`, many stacked shadows (no `DropShadowEffect` in this repo), animated layouts. Replace with the exact WPF-portable route (white-mask `art/sprites.py` PNG + `OpacityMask`/`-webkit-mask`, crisp `Path` geometry, 9-slice, layered gradients) so XAML matches the preview 1:1.

### 6. Legibility & restraint
Body and metadata text contrast (≥ 4.5:1), cover art unobstructed by decoration, calm list and grid backgrounds, nothing clipped outside 1280×720.

### Triage & mandatory Pass 2 revision
Fix the most important visual and structural problems first. Name a `file:line` or screenshot region for each one.

- **Blocking**: unrecognizable or generic/AI-slop look, palette/material mismatch against reference captures, rule breaks, infeasible effects. **Do not start XAML while any blocking issue remains.**
- **Mandatory Pass 2**: After fixing Pass 1 findings (tightening typography, proportions, material masks, restraint, or focal drama), re-render both PNGs with `scripts/take-screenshots.ps1 -Extension <key>` and re-inspect them side-by-side with the captures to confirm the upgrade actually landed.
- **Keep**: note the exact visual decisions locked in the final previews to translate faithfully into XAML.

## After XAML

Compare the HTML and PNGs with the corresponding Playnite views. Check top-panel order, settings chrome, spacing, material textures, and the signature states from the brief. Run `node scripts/preview-layout.mjs src/themes/<Theme>` after `TopPanel.xaml` exists, then record any intentional differences in the theme's notes.
