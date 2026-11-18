# Whalebone — research & sources

Reference: the menus, overlays and HUD of **Dishonored 2** (Arkane Studios, 2016), from the 4K captures and menu videos on Interface In Game (<https://interfaceingame.com/games/dishonored-2/>, 45 stills and 8 videos, inspected November 2026). The captures were downloaded to a scratch folder for colour sampling only; none are committed or shipped, and no game asset, logo or font is reused.

## Sources

| What | Where |
|------|-------|
| Tokens | Sampled from the captures (median / top-decile pixels in measured boxes on 1600x900 downscales, saturated accents from the 3840x2160 originals). Values and boxes below. |
| Components | Main menu, Pause, Options, Visuals / Video Settings, Statistics, Powers, Bonecharms, Lore & Maps, Campaign slots, Black market, Mission complete (stills); main menu, apply settings, mission (videos, frame-stepped at 6 fps). |
| Fonts | The game's own faces are commercial and not used. Stand-ins (OFL): **Cinzel** (flared Roman caps: `CAMPAIGN SLOT 01`, `STATISTICS`, `CONTROLS`), **Zilla Slab** (slab body and slab-italic labels: `Screen Resolution`, `Time Played`), **Marck Script** (slanted pen script: `Options`, `Visuals`, `General`, `Esc Back`). All three bundled in `src/Typography/`. |
| Icons | Hand-drawn for this theme (`art/icons.mjs`): filled ink silhouettes with cut, shard-like corners, the language of the game's medallion icons. No pack, no license file needed. |

## Palette (sampled)

| Token | Hex | Sampled from |
|-------|-----|--------------|
| `wb-pitch` | `#0b0a0d` | Main menu shadows (`#0a0809` low decile), rail |
| `wb-ink` | `#121016` | Idle ink plates under settings rows (`#130e16`), campaign slot card (`#0f0b0f`) |
| `wb-slate` | `#181b22` | Video Settings backdrop (`#1b1e27`), Lore list backdrop (`#201e23`) |
| `wb-slate-hi` | `#22252c` | Statistics panel (`#202125`) |
| `wb-pewter` / `-hi` | `#2e323a` / `#3b4049` | Lit plate under a hovered row, keycap prompt plates |
| `wb-fog` | `#545e5e` | The desaturated teal-grey world behind overlays (Powers backdrop `#545e5e`, Pause `#333439`) |
| `wb-ash` | `#9c98a0` | Row labels (`#b1acb2` top decile, lowered for body) |
| `wb-chalk` | `#dfe5e6` | Values (`00H 37M 42S` top decile `#dde4e7`) |
| `wb-bone` / `-shade` | `#d6e2e0` / `#a7b5b4` | The marble "paper" plate of a selected row / tab (`#cddfde`, hi `#dbeeeb`, tab `#d7d9d7`) |
| `wb-frost` | `#eef7fc` | Frost glow along a selected plate's edge (`#f1f9fe`) |
| `wb-frost-blue` | `#9db4ca` | The glow frame around the chosen campaign slot (`#8499b1` .. `#b0c1d3`), Powers ring (`#8fa8ae` .. `#b3c5d2`) |
| `wb-teal` / `-hi` | `#6cc9c3` / `#a6dedb` | Keyword text in the help panel (`#64bab7` .. `#73ded8`); the "!" new-item badge (`#9ad6d3` .. `#b4e3e1`) |
| `wb-violet` / `-hi` | `#1c1b2e` / `#2a2944` | Value plates (`3840 x 2160`, `Full Screen`) with violet marbling (`#1a192c` .. `#242440`) |
| `wb-wine` | `#4a1526` | Crimson ink smear behind help titles and on the Pause backdrop (very dark: `#221117` median, lifted so it reads at 1:1 scale) |
| `wb-blood` | `#a3263a` | Danger: the red of the same ink at full strength |
| `wb-oil` | `#e39a43` | Whale-oil amber: the warm ember bokeh on Options (`#6a3b30` .. `#7d4940`) lifted to the lamp light of the game's oil tanks; used only for the running game |

## Interface parts and rules

- **Menu cursor = white dry-brush stroke.** The current menu entry (`CAMPAIGN`, `Resume`, `CONTROLS`) sits on a near-white stroke with torn, feathered ends and long hairline bristles, about 2.2x the label height, wider than the label by ~40% each side. A thin frost hairline frame with hooked tips hugs it (Options, Video Settings). Moving the cursor repaints the stroke on the new entry in 2 frames (~160-330 ms in the 30 fps capture), no slide.
- **Idle entries on ink plates.** Each unselected entry sits on its own black torn brush plate, slightly rotated, a few px larger than the label. Labels mix faces on purpose: slab (`Save Game`), letterspaced caps (`LOAD GAME`), bold caps (`OPTIONS`), script (`Tutorials`).
- **Selected list row = marble paper.** In lists (Video Settings, Lore) the selected row becomes a pale marble plate (`wb-bone`, faint grey veins) with frost-white edge glow and curled hook tips at both ends; its value plate stays dark violet. Idle rows are ink plates 52-60px apart, 46px tall at 4K/1080 (~23px at 1x).
- **Value plates.** Dark violet capsules with pointed hexagonal ends and a thin pale rim (`3840 x 2160 (16:9)`); a round chevron button sits right of them (the dropdown). Sliders: a dotted track between two hand-drawn arrows, a white disc thumb with the value inside.
- **Tabs.** Selected tab = paper plate with an ornate wrought-iron bracket frame and a small "v" notch under its centre; idle tabs = ink plates; a keycap with the swap glyph on each end.
- **Cards with notched corners.** Campaign slots and the black-market cards are rectangles with small concave (inverted-radius) corners, a hairline inner frame and a grainy ink fill; the chosen one glows frost blue, with offset L-brackets on its top-left and bottom-left corners and a "v" hook under the bottom edge.
- **Medallions.** Tab icons (Mission, Powers, Bonecharms, Lore & Maps, Travel Log) are circular ink medallions with a bone silhouette inside; the current one is larger and wears a frosty ring of short radial ticks. A teal "!" disc with a soft glow marks new content.
- **Keycap prompts.** `Esc Back`, `Ctrl Restore Settings`, `⏎ Upgrade Power`: a small dark rounded keycap with a 1px pale rim and a script label beside it.
- **Section captions in script on a crimson or ink smear** (`Display Mode`, `General`, `Economy`), body in slab italic; statistics rows are italic labels with a hairline leader to right-aligned caps values.
- **Shattered glass.** Every overlay scatters white glass shards (sharp triangles 8-40px, bright face plus darker facet) and long 1px fracture hairlines crossing the screen at shallow angles. Ornate iron filigree scrolls curl at panel corners.
- **Motion.** Screens fade through black (~300-450 ms); shards drift slowly; the cursor stroke repaints quickly; the frost glow on a chosen card pulses very slightly. No bounce.

## Typography (measured at 1080p)

| Role | Source look | Theme |
|------|-------------|-------|
| Screen titles, chosen entries | flared Roman caps, ~22-26px, tracked | Cinzel Bold, uppercase |
| Buttons, tabs, menu entries | caps 14-16px | Cinzel Bold (`UIFontFamily`) |
| Labels, body, help text | slab italic 14-16px | Zilla Slab (Regular / Italic / SemiBold) |
| Section captions, prompts, empty states | slanted pen script 18-24px | Marck Script (`NoteFontFamily`) |
