# Primo — research & sources

Unofficial theme inspired by GitHub's Primer design system; not affiliated with or endorsed by GitHub, Inc. Primer and GitHub are GitHub's trademarks, named here only as the source of the design reference.

## Sources

| What | Where |
|------|-------|
| Tokens | `@primer/primitives` 11.10.0: `dist/css/functional/themes/dark.css`, `functional/size/radius.css`, `border.css`, `size.css` |
| Components | `@primer/react` 38.40 CSS: Button, IconButton, TextInput, Select, Checkbox, Radio, ToggleSwitch, ActionList, ActionMenu / Overlay, UnderlineNav, NavList, ProgressBar, Tooltip; GitHub's Box / Box-header |
| Icons | Octicons 19.38.0 (MIT, `info/LICENSE-octicons.txt`), 16px set |

## Motion

How Primer moves, for the interactive layer. Primer is near-instant on purpose.

| Source | What it says |
|--------|--------------|
| `@primer/react` `Button/ButtonBase.module.css` (raw GitHub) | `transition: 80ms cubic-bezier(0.65, 0, 0.35, 1)` on color, fill, background-color, border-color; `:active` sets `transition: none`; no transform, scale or ripple in base, hover or active rules; primary and default hover/active only change background and border color |
| `@primer/react` `Blankslate/Blankslate.module.css` | padding 32px (medium), visual (icon) `fgColor-muted` and max-width 24px (small), heading from the title text style, description `fgColor-muted`; no transition or animation |
| `@primer/primitives` `motion/easing.json5` | ease (0.25, 0.1, 0.25, 1), easeIn (0.7, 0.1, 0.75, 0.9), easeOut (0.3, 0.8, 0.6, 1), easeInOut (0.6, 0, 0.2, 1); no duration tokens in the file read |

Numbers used: 80ms on `0.65,0,0.35,1` for the Play hover step (the opaque `button-primary-bgColor-hover` fades over the rest plate), the cover ring and the icon buttons; cover buttons and shade fade in 80ms with 40ms between the two. No rise, scale, zoom, glow or pressed layer: Primer has none, and the theme maps no primary active color (`button-primary-bgColor-active` is not in `tokens.css`). The empty page is static, as Blankslate is. Octicons has no play glyph (only a 4px `triangle-right` caret), so `IconPlay` is drawn on the 16px grid in its style; `IconInfo` and `IconDownload` are Octicons `info` and `download`, the empty icon is `cursor`.

Could not verify: how Primer animates overlays (ActionMenu / Overlay entrance), so the cover buttons use a plain fade; whether the 80ms ease is fast enough to read as a transition in Playnite. Nothing was run in Playnite.
