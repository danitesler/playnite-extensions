# Chakram — research & sources

## Sources

| What | Where |
|------|-------|
| Tokens | `chakra-ui/chakra-ui` 3.37 `packages/react/src/theme`: `tokens/colors.ts`, `semantic-tokens/colors.ts`, `tokens/radius.ts`, `semantic-tokens/radii.ts` |
| Components | same package, `recipes/`: button, input, select, checkbox + checkmark, radio-group + radiomark, slider, progress, tabs, tooltip, menu, card, listbox, table, segment-group, scroll-area, badge; `preset-base.ts` (`focusVisibleRing`) |
| Icons | lucide 1.48.0 (ISC, `info/LICENSE-lucide.txt`); Chakra's docs use lucide through `react-icons/lu` |

## Motion

How Chakra UI v3 moves, from `chakra-ui/chakra-ui` `packages/react/src/theme` (raw GitHub): `recipes/button.ts`, `recipes/popover.ts`, `recipes/empty-state.ts`, `tokens/durations.ts`, `tokens/easings.ts`.

| Source | What it says |
|--------|--------------|
| `recipes/button.ts` | base `transitionProperty: "common"`, `transitionDuration: "moderate"`; `focusVisibleRing: "outside"`; solid `_hover: bg colorPalette.solid/90`; no `_active` |
| `tokens/durations.ts` | fastest 50, faster 100, fast 150, moderate 200, slow 300, slower 400, slowest 500 ms |
| `tokens/easings.ts` | ease-in (0.42, 0, 1, 1), ease-out (0, 0, 0.58, 1), ease-in-out (0.42, 0, 0.58, 1), ease-in-smooth (0.32, 0.72, 0, 1) |
| `recipes/popover.ts` | content open `animationStyle: scale-fade-in`, `animationDuration: fast` (150ms); closed `scale-fade-out`, `faster` (100ms) |
| `recipes/empty-state.ts` | indicator `color fg.subtle`, md text style 4xl, icon 1em; title semibold, md text style lg; description `fg.muted` sm; content gap md 6; no animation |

Numbers used: Play hover = plate dims to 90 percent (`solid/90`; the theme's hover brush is the same color at alpha) over 200ms; the hover ring on covers fades in 200ms; Info tile (`subtle`, gray.subtle to gray.muted) fades the hover plate in 200ms; ease-in-out as the transition curve; cover buttons enter like a popover (scale 0.95 to 1 plus fade, 150ms in and 100ms out, 30ms between the two); the empty page icon is 36px (4xl) in `fg.subtle` with a semibold lg title and fades in over 200ms. No rise, no zoom, no pressed layer, no glow: Chakra has none for these.

Could not verify: the recipe sets only `transitionProperty` and `transitionDuration`, so the easing of the button transition (ease-in-out here) is an assumption; `animation-styles.ts` and `keyframes.ts` returned 404, so the scale of `scale-fade-in` (0.95) and its easing (ease-out in, ease-in out) are assumptions too. Nothing was checked in Playnite.
