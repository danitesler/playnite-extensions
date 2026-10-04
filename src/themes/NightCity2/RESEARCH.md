# NightCity2 — research & sources

## Sources

| What | Where | Status |
|------|-------|--------|
| Yellow `#FCEE09` | leandroruel CSS recreation gist `4f0e6a7919ac6ef6459abd55bc40a12e`; other sources give `#FCEE0A`, `#F2E900`, `#F3E600` (cybercore-css, colorswall 154112, color-hex 1041326) | Verified in fan sources only, no official palette found |
| Cyan `#02D7F2`, red `#FF003C`, black `#050A0E`, off-white `#FAFAFA` | same gist and colorswall 154112 (gist cyan `#00F0FF`, colorswall red `#FF1111`) | Verified in fan sources only |
| Panel blacks `#0C1414`, `#141414` | Steam store screenshot 3 of app 1091500 (`ss_af2804aa...1920x1080.jpg`), left panel, histogram of 8-level buckets | Measured, about 8 per channel of JPEG error |
| Chamfer shape, glitch language | gist polygon `92% 0, 100% 25%, 100% 100%, 8% 100%, 0 75%, 0 0`; jh3y "CSS Cyberpunk 2077 buttons" (dev.to); alddesign cyberpunk-css demo | Fan CSS |
| Fonts | Rajdhani (UI), Orbitron (secondary) per fontsinuse; Blender Pro and Refinery on the websites | Rajdhani is OFL but not a Windows font and a theme cannot ship `Fonts/`; the stack falls back to Bahnschrift, then Segoe UI |
| Icons | Phosphor (MIT) recommended, not yet rendered | Planned, license file goes in `info/` |

**Finding that matters:** the real in-game screens that could be sampled are not yellow. The character creator (Steam) and the Map screen (Fandom, 1920x1080 PNG) are **red and cyan**: red labels `#D36868`/`#E35D58`, cyan active tab `#63E3EC`..`#5FF5FF`, hint text `#71B9C0`, near-black backgrounds `#0C0A08`/`#0F0E15`. The only yellow measured is the eddies icon, `#F6C355`, a gold tone. No pause, inventory or main-menu screenshot in yellow was obtainable. So the yellow here is the franchise and fan-UI yellow, not a measured in-game menu token. Cyan and red stay at the fan-palette values, not the bloom-lifted screenshot peaks.

**Derived (my choices, not measured):** muted text (off-white at 60%), hover/pressed fills (yellow at 16%/28%), separators (yellow at 30%), popup edge (yellow at 60%), black on-yellow text, scroll and track tints.
