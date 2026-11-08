# Ayywi — research & sources

## Sources

| What | Where |
|------|-------|
| Tokens | ayywi 0.3.0 `tokens/tokens.json`, compiled to `src/css/tokens.css` (dark), written into `src/tokens.css` with derived washes and lines as hex |
| Components | ayywi `src/components/*/*.css`: button, input, select, checkbox, radio, tabs, menu, tooltip, card, badge, progress (each file's header names its component and numbers) |
| Icons | Lucide 1.49.0 (ISC, `info/LICENSE-lucide.txt`): the pack ayywi's own markup uses (24px grid, stroke 2, round caps) |

## Motion

How ayywi moves, read from its repo (github.com/danitesler/ayywi, raw files `tokens/tokens.json`, `src/components/button/button.css`, `card/card.css`, `empty-state/empty-state.css`). Retrofit of the interactive layer into Play, cover hover, cover buttons and the empty page.

| Token | Value |
|-------|-------|
| `duration.fast` / `base` / `slow` / `slower` | 150 / 300 / 450 / 600 ms |
| `ease.standard` | cubic-bezier(0.2, 0, 0, 1) (hover, colour changes) |
| `ease.spring` | cubic-bezier(0.175, 0.885, 0.32, 1.275) (slight overshoot) |
| `ease.out-expo` | cubic-bezier(0.25, 1, 0.5, 1) (arriving, lifting elements) |
| `shadow.glow` | `0 0 18px` at 18 percent of the glow color (primary button hover) |
| `shadow.lift` | `0 16px 36px` black at 40 percent (hovered cards) |

What each component does, and what the theme draws:

- **Button** (`button.css`): `transform` transitions on the spring curve, colours, shadow and opacity on `ease`, all `duration.base`. Hover: `translateY(-2px)` (hover-capable devices), primary also opacity 0.9 and `shadow.glow`. `:active` sets `transform: none` (no press scale). Drawn: the white plate fades to 90 percent opacity over 0.3s on `ease` (KeySpline 0.25, 0.1, 0.25, 1; the theme's hover brush is the same colour at alpha, so a plate over the plate would show nothing); a 9-sliced glow mask (`src/Images/fx/glow.png`, gaussian sigma 9 = blur 18px) fades to layer opacity 0.36; the lift is -2px on the spring KeySpline; pressed cancels the lift and dims the plate to 80 percent over 0.15s. The glow is the only generated asset, because it is the only shadow ayywi puts on a button. The CSS value gives 9 percent at the glow's edge; the layer opacity is 2x that so it reads on a monitor (not checked in Playnite).
- **Card** (`card.css`): interactive hover `translateY(-2px)`, `shadow.lift`, border colour to line-hover (`duration.base`, ease), media `scale(1.03)` over `duration.slower` on out-expo; the `--view` card fades its body in over `duration.fast` and slides it up from `translateY(6px)` over `duration.base` on out-expo. Drawn: the hover outline (line-hover) fades 0.3s in and out; the cover image zooms to 1.03 over 0.6s on out-expo (0.45s back); the cover buttons fade over 0.15s and rise 6px over 0.3s on out-expo, Info 50ms after Play. Not drawn: card lift and `shadow.lift` (the outline sits in the item's spacing margin, and a shadow needs `DropShadowEffect`, which is banned), an entrance scale (ayywi has none).
- **Icon buttons** (cover buttons) follow the button spec: fill and line-hover edge fade 0.3s, lift 2px, `:active` cancels the lift.
- **Empty state** (`empty-state.css`): centered column, icon tile (wash fill, muted glyph), title in the heading font at text-lg semibold, optional description; no transitions or keyframes. Drawn: icon tile plus the title (Playnite's own string, no description); the only motion is a 0.45s out-expo fade-in when it appears.

Not verified: how the spring KeySpline (y above 1) behaves in WPF, glow visibility at 125 and 150 percent scaling, and all hover and empty states inside Playnite (only static checks were run).
