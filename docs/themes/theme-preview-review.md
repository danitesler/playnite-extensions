# Theme preview checklist

Check the rendered previews yourself before implementing the theme in XAML. Do not spawn a reviewer, and do not hand this checklist to another agent. Fix blocking findings in the HTML, re-render, then continue.

Read the theme’s `BRIEF.md`, `RESEARCH.md`, `src/tokens.css`, both `art/preview-*.html` files and both rendered screenshots. Use the [creative brief](creative-direction.md), [preview rules](previews.md), [settings rules](settings-screens.md), and [shared theme guide](../../src/themes/AGENTS.md) as references.

## Before XAML

1. **Recognition.** From the screenshots alone, does it read as the source? Name what sells it and what's missing compared with `RESEARCH.md`.
2. **Ambition.** At least 3 game-element-map rows from `BRIEF.md` are visible, the hero moment is staged in its hovered end state, the brand mark is in the settings title band. Flag every "Never" item from creative-direction.md.
3. **Repo rules visible in a preview.** Check form and filter sizing, the More and Edit actions, sidebar, filter mark, settings chrome, ComboBox chevron, corner radii, token colours, bundled fonts and branding against the guides above. Flag scaffold leftovers.
4. **WPF feasibility.** Flag anything XAML can't reproduce cheaply: `backdrop-filter`, `mix-blend-mode`, CSS filters, text gradients, complex `clip-path`, many stacked shadows (no `DropShadowEffect` in this repo), animated layouts. Suggest the WPF route (white-mask sprite + `OpacityMask`, `Path` geometry, 9-slice) or a simpler look.
5. **Legibility.** Body and metadata text contrast, cover art not covered by decoration, calm list backgrounds.

Fix the most important problems first. Name a `file:line` or screenshot region for each one.

- **Blocking**: rule breaks, infeasible effects, unrecognizable or generic results. Do not start XAML while one of these is still in the previews.
- **Should fix**: weaker ambition, missing moments, polish.
- **Keep**: what to copy exactly when writing the XAML.

## After XAML

Compare the HTML and PNGs with the corresponding Playnite views. Check top-panel order, settings chrome, spacing and the signature states from the brief. Run `node scripts/preview-layout.mjs src/themes/<Theme>` after `TopPanel.xaml` exists, then record any intentional differences in the theme’s notes.
