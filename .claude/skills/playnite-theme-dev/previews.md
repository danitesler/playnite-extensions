# HTML previews - how to build them

`art/preview-details.html` and `art/preview-settings.html` are the only source of the release screenshots (`art/details.png`, `art/settings.png`). They are 1280x720 replicas of the theme, not Playnite captures. `new-theme.ps1` writes generic placeholders (indigo, Segoe UI, 8px radius); **every theme must replace them** with a replica of its own look. Netrunner, Payload and Tumbleweed are the worked examples: read one before writing.

## Build order

1. Finish the reference research first (`src/<theme>/AGENTS.md` -> Sources: colors, type, chrome and selection styles, icons). The preview is written from those notes, not from the scaffold.
2. Put the colors in `src/tokens.css` (they drive the XAML too), then write the preview against them.
3. Style the shell the way the theme's XAML does, then add what makes the source recognisable.
4. `.\scripts\take-screenshots.ps1 -Extension <key>`, look at both PNGs, fix, repeat.

## Colors: tokens, not hex

- `render-theme-preview.mjs` injects the theme's `src/tokens.css` into the page (`:root` with `.dark` overrides applied, same as the build). Use `var(--token)` with the token's own name (`var(--cp-row-selected)`), not a hex copy.
- Local aliases are fine (`--bg: var(--cp-page)`) but an alias must not reuse a token's name.
- Gradients, glows and art placeholders may use literal colors that are not tokens (a banner gradient). Keep them few.
- After editing tokens or XAML colors: `.\scripts\validate-extension.ps1 -Extension <key>` lists preview colors that are not tokens (drift), then re-render. `node scripts/preview-tokens.mjs link src/themes/<Name>` rewrites hex that equals a token into `var(--token)`.
- Tokens given as `oklch()`, `hsl()` or `rgb()` work; the scripts resolve them in Chromium.

## Match the real UI

- Page size is `body { width: 1280px; height: 720px; overflow: hidden }`, the renderer viewport is the same. Nothing may be cut off at the edges: check the bottom (footers, panels) and the right.
- Use the theme's real values from XAML and tokens: sidebar rail 44px wide, 44x40 items, 16px glyphs (AGENTS.md mandate), corner radii, font sizes, row heights, control sizes. Do not invent new ones.
- Same shell as the theme: sidebar on the left, top panel, game list or grid, game page layout per `src/themes/AGENTS.md` (screenshots left above the description, metadata right, banner and title scrim).
- Font stack copies the theme's `FontFamily` keys. A font Playnite users may not have is fine as the first entry as long as the fallbacks match XAML. Say in AGENTS.md -> Previews which face stands in for which.
- Use the theme's own icon set, rendered from the same source as `art/` icons (SVG inline or the generated glyphs), not emoji or unicode stand-ins where a real glyph exists. Unicode glyphs are acceptable only where the theme itself uses text glyphs.
- Selection, hover, focus, checked and disabled looks are copied from the control templates (edge bars, fills, outlines), not guessed. The settings preview must show a checked box, a radio, a slider, a text box, a combo box and a primary and plain button in the theme's real states.
- Corner radii follow the AGENTS.md mandate: never `CornerRadiusFull` on non-square elements; capsule shapes are not used unless the source UI has them and the XAML draws them.

## Keep it unique

- Pull 3 to 5 signature motifs out of the source material and draw each one: Netrunner's scanline haze, 2px red edge on selected rows, uppercase condensed headings with a short underline, clipped button corners and a footer note. Name them in AGENTS.md -> Previews.
- Do not reuse another theme's preview as a base and recolor it. Start from the scaffold shell or from scratch.
- No leftover scaffold content: the indigo `#6366f1`, "Eldritch Void" sample data copied verbatim in every theme, the generic header comment. Give the sample game, metadata and settings labels that suit the theme.
- Unofficial replicas of a game or brand: no logos, no game assets; say so in the footer note, as Netrunner does.

## Checklist before finishing

- [ ] Written after the Sources research, motifs listed in AGENTS.md -> Previews
- [ ] Colors are `var(--token)`; `validate-extension.ps1` shows no unexplained drift
- [ ] 1280x720, nothing clipped, both PNGs looked at
- [ ] Real sizes, fonts, icons and control states, not scaffold defaults
- [ ] Re-rendered after the last token or XAML change
