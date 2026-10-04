# Launchpad — research & sources

## Sources — read this first

Blizzard publishes no design system, no tokens and no component specs, so unlike the other themes here there is **no pinned spec to copy values from**. What this theme is built from:

| What | Where |
|------|-------|
| Layout and colors | The author's knowledge of the desktop client's dark UI. **Nothing was sampled from the client**: the Blizzard hosts were blocked from the build environment, so no screenshots were available to measure. Every value in `src/tokens.css` is an approximation chosen by eye. |
| Icons | Phosphor Icons 2.1.1, Regular weight (MIT, `info/LICENSE-phosphor.txt`), npm `@phosphor-icons/core`. Chosen as the closest open outline set to the thin rounded line icons of the client. |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`), every file restyled from its Default copy. |

**Not included, on purpose:** Blizzard's logo, wordmark, game art and its own icon files. Those are Blizzard's copyrighted and trademarked artwork; bundling them in a public add-on is not something this repo does. The logo button shows the add-on tile's orbit mark (two interlaced rings and a core, hand-built as an `F0` even-odd geometry in `src/Media.xaml`) in launcher blue where the client shows its own logo. To match the client's icons exactly for personal use, replace the geometries in `src/Media.xaml` and the PNGs in `src/Images/Phosphor` on your machine; nothing else depends on them.

To tighten the colors, sample a screenshot of the client and edit the values in `src/tokens.css` (see Tokens). No XAML changes are needed.
