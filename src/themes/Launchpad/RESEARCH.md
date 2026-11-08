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

## Motion

How the interactive layer (Play hover, cover hover, cover buttons, empty page) was chosen. Read this with the caveat first: **none of the numbers below were measured from the client.** Blizzard publishes no motion spec, the searches (WebSearch, retrieved for this pass) found no teardown or frame-stepped capture of the Battle.net app's hover states, and the client itself was not available to capture. What is documented is thin:

| Fact | Source |
|------|--------|
| Battle.net 2.0 (2023) moved the game list to a row across the top, added reorderable and favourite games, and improved keyboard navigation and contrast. No motion details. | Engadget, Overclock3D and Game Developer coverage of the redesign (search results, not fetched in full) |
| UI-motion guidance for hover transitions is 100-250 ms with transform and opacity as the cheap properties; the same hover animation on every button. | Generic web guidance from the same searches; used as a ceiling, not as a measurement |

What I used, as an interpretation of the app's flat style (a design-system-like launcher, so no ornament and no sprites, per reference.md -> Motion by source type):

- **Play hover:** the lighter blue plate fades in over 0.15 s ease-out and out over 0.22 s; a 1px inner light edge fades to 22% with it; pressed has its own deep-blue layer (0.06 s in, 0.12 s out) and a 0.985 scale settle. Matches the client's behaviour as I know it (the button brightens, then darkens when pressed), but the durations are mine.
- **Cover hover:** a grey outline fades in (0.16 s) and a 3 px launcher-blue bar grows from the centre of the bottom edge (0.22 s). The bar borrows the client's selected-game-tab underline; the client does not do this on a tile, so this part is an adaptation, not a copy. Selected stays the static blue outline.
- **Cover buttons:** 44 px rounded squares (the client's radius), Play blue, Info on the card fill; the plate lightens in 0.15 s and the glyph grows to 1.08. Entrance and exit use the shared recipe (shade fade, 10 px rise, 0.86 to 1 scale, Info 60 ms later; 0.22 s in, 0.18 s out).
- **Empty page:** the client has nothing like it; a quiet Library glyph in a card square breathing between 100% and 45% opacity over 3 s, plus Playnite's "No game selected". No other loops.
- **Assets:** none generated. The client has no glow, texture or light to recreate.

Not verified: any of the timings against the real app; whether the client's Play button also has a gradient or edge light.
