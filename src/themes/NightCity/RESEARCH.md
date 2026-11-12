# NightCity — research & sources

## Sources

| What | Where | Status |
|------|-------|--------|
| Yellow `#FCEE09` | leandroruel CSS recreation gist `4f0e6a7919ac6ef6459abd55bc40a12e`; other sources give `#FCEE0A`, `#F2E900`, `#F3E600` (cybercore-css, colorswall 154112, color-hex 1041326) | Verified in fan sources only, no official palette found |
| Cyan `#02D7F2`, red `#FF003C`, black `#050A0E`, off-white `#FAFAFA` | same gist and colorswall 154112 (gist cyan `#00F0FF`, colorswall red `#FF1111`) | Verified in fan sources only |
| Panel blacks `#0C1414`, `#141414` | Steam store screenshot 3 of app 1091500 (`ss_af2804aa...1920x1080.jpg`), left panel, histogram of 8-level buckets | Measured, about 8 per channel of JPEG error |
| Chamfer shape, glitch language | gist polygon `92% 0, 100% 25%, 100% 100%, 8% 100%, 0 75%, 0 0`; jh3y "CSS Cyberpunk 2077 buttons" (dev.to); alddesign cyberpunk-css demo | Fan CSS |
| Fonts | Rajdhani (UI), Orbitron (secondary) per fontsinuse; Blender Pro and Refinery on the websites | Rajdhani and Orbitron are OFL and not Windows fonts; both are bundled in `src/Typography/` |
| Icons | Phosphor (MIT) recommended, not yet rendered | Planned, license file goes in `info/` |

**Finding that matters:** the real in-game screens that could be sampled are not yellow. The character creator (Steam) and the Map screen (Fandom, 1920x1080 PNG) are **red and cyan**: red labels `#D36868`/`#E35D58`, cyan active tab `#63E3EC`..`#5FF5FF`, hint text `#71B9C0`, near-black backgrounds `#0C0A08`/`#0F0E15`. The only yellow measured is the eddies icon, `#F6C355`, a gold tone. No pause, inventory or main-menu screenshot in yellow was obtainable. So the yellow here is the franchise and fan-UI yellow, not a measured in-game menu token. Cyan and red stay at the fan-palette values, not the bloom-lifted screenshot peaks.

**Derived (my choices, not measured):** muted text (off-white at 60%), hover/pressed fills (yellow at 16%/28%), separators (yellow at 30%), popup edge (yellow at 60%), black on-yellow text, scroll and track tints.

## Motion

What could be found about how the Cyberpunk 2077 UI moves. **No source gives the game's own hover timings**: the inkwidget animation values are in the game archives (RED modding wiki documents the format: transparency, translation and size interpolators with a duration and start delay) and could not be read from the build environment. Everything below is the fan reconstruction of the look, so the durations are mine.

| What | Found | Used for |
|------|-------|----------|
| Glitch hover (jh3y, "CSS Cyberpunk 2077 buttons", dev.to; the game's website button) | A copy of the button is revealed on hover and runs a looping keyframe animation of about 20 stops: clip-path slices (bands such as 2 to 95%, 78 to 100%, 44 to 54%, 40 to 85%, 63 to 80% of the height) and a shimmy of plus or minus 5 (px or percent of width), with 2px text-shadows in cyan and yellow offset the opposite way, on a 4px border | Play hover: stepped (discrete) keyframes, cyan and red ghosts of the slab at plus or minus 3 to 4px, a 7px slice shearing across the plate, a 2px label shake; the burst repeats every 3s while hovered |
| Palette of the glitch | red `hsl(0 85% 50%)`, cyan `hsl(180 90% 50%)`, yellow `hsl(60 90% 60%)` shadows | Ghosts use `HighlightGlyphBrush` (cyan) and `DangerBrush` (red), yellow is the plate itself |
| Chamfer | gist polygon `92% 0, 100% 25%, 100% 100%, 8% 100%, 0 75%, 0 0` (leandroruel) | Cover hover cut corners and the cover buttons use the Play slab's cut (top-left and bottom-right) |
| Stepped, hard-edged frames | The glitch has no easing: frames jump | Discrete keyframes for the glitch layers only; the plate fade (0.1s in, 0.2s out) and every exit stay smooth (the repo rule: no snaps) |

Not verified: any in-game duration or easing, whether the real menus flicker or shear on hover (the website does), the idle behavior of the menus, sounds. Sources: [jh3y on dev.to](https://dev.to/jh3y/css-cyberpunk-2077-buttons-taking-your-css-to-night-city-43l0), [leandroruel gist](https://gist.github.com/leandroruel/4f0e6a7919ac6ef6459abd55bc40a12e), [RED modding wiki, inkwidget animations](https://wiki.redmodding.org/cyberpunk-2077-modding/for-mod-creators-theory/files-and-what-they-do/inkwidgets-a-custom-interface).

## In-game menus (Game UI Database, 2026-11-12)

Source: [Game UI Database, Cyberpunk 2077](https://www.gameuidatabase.com/gameData.php?id=439), 1920x1080 captures of the PC build (Settings: Options `Cyberpunk-207712292020-013430-5461.jpg`, Inventory: Browse `...013727-50521.jpg`, Equipping `...013729-33863.jpg`). Colors from a 16-level histogram of the Settings capture (lossy JPEG, every third pixel).

| What | Value | Notes |
|------|-------|-------|
| Background | `#080808` / `#080818` dominant, red-violet `#180818`, red plate `#381818` | Near black with a red-violet cast, never neutral grey |
| Chrome red | bright `#F84848`..`#F85858`, mid `#D84848`, dim `#982828` (most common saturated bucket) | Labels, section heads in caps, 1px outlines, rules, scroll thumb, selected half of the OFF/ON switch |
| Active cyan | `#58F8F8`..`#68F8F8` | Active top tab (icon + caps label), values, button hints, current level |
| Yellow | Only the eddies counter and "new item" badges in menus | The franchise yellow lives in marketing, box art and the website, not the in-game menus |
| Layout motifs | Faint grid of red `+` crosshairs on the backdrop; thin red rule across the top with tabs; cut-corner outlined slabs with an icon tile and caps label; item cards with a coloured rarity bar on the left; small data-noise text at the edges | Crosshair grid used in dialogs; cut corners already in the theme |
| Controls | Sliders are a filled bar with a chamfered block thumb; toggles are a two-cell OFF/ON switch (selected cell solid red); section heads have a 1px rule under them | Theme keeps its slider and checkbox, filled in yellow |

**The mix:** red for chrome and cyan for state come straight from these screens. Yellow stays for what commits or is chosen (Play, selection, checked, the title), so the brand colour marks the one thing you act on, which the in-game palette does with its solid red cells.
