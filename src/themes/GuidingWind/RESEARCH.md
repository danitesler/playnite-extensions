# Guiding Wind — research & sources

Guiding Wind is an unofficial fan theme inspired by the menus and HUD of **Ghost of Tsushima** (Sucker Punch Productions, 2020; Director's Cut PC 2024). Nothing here reproduces the game's art, logos, clan emblems or font files.

## Sources

| What | Where | Notes |
|------|-------|-------|
| Reference captures | [interfaceingame.com/games/ghost-of-tsushima](https://interfaceingame.com/games/ghost-of-tsushima/) | 49 screenshots (1920x1080 PNG) inspected on 2026-11-16 (`main-menu`, `pause`, `gear`, `gear-2`, `gear-upgrade`, `items-upgrade`, `journal`, `collections`, `inventory`, `skill-tree`, `skill-tree-2`, `save-game`, `accessibility`, `game`, `graphics`, `display`, `audio`, `controls`, `mouse-keyboard`, `store`, `store-2`, `confirmation`, `confirmation-2`, `confirmation-3`, `confirmation-4`, `dialogue`, `hud`, `hud-2`, `hud-3`, `map`, `map-2`, `map-3`, `celebration`, `celebration-2`, `notes`, `quest`, `tutorial`, `tutorial-2`, `hint`, `hint-2`, `minigame`, `credits`, `interact`, `subtitles`, `logo`, `splash-screen`, `splash-screen-2`). Nothing downloaded into or shipped in the repo; exact colors were sampled from decoded PNG regions in Python. |
| Tokens | Sampled from the captures above; stored under `gt-*` in `src/tokens.css` | No official published token package exists. |
| Fonts | Proprietary geometric sans UI headers + humanist body copy | Uppercase geometric sans headers, tabs and prompts (`NEW GAME`, `MAP`, `JOURNAL`, `GEAR`, `OPTIONS`, `SAKAI KATANA`, `INARI SHRINES`) are matched by **Sora** (Regular, Medium, SemiBold, Bold; SIL OFL 1.1) bundled in `src/Typography/`. Body descriptions and settings rows use **Segoe UI** (Windows) with **Selawik** as preview stand-in. |
| Icons | Drawn in `src/Media.xaml` | Clean 1.7px geometric/blade line strokes and diamond/scroll accents inspired by the menu top bar and prompt glyphs. Playnite menu icons keep Playnite's built-in glyphs, recolored. |
| Motion | Static captures only; motion language designed from the game's UI motifs | Fast ink settles (110ms), base brush reveals (180ms), smooth Guiding Wind drifts (300ms / 3.2s-3.6s ambient). |

## Measured values (1920x1080 captures)

| Part (capture) | Sample | Token |
|----------------|--------|-------|
| Top navigation bar (`gear`, `journal`, `pause`) | `#070707` | `gt-sumi` |
| Active tab top / mid / bottom gradient (`gear`) | `#292828` -> `#bdbdbc` -> `#dfdfde` | `gt-tab-top`, `gt-tab-mid`, `gt-tab-bot` |
| Active tab red top-left corner triangle (`gear`, `journal`) | `#d7403b` | `gt-crimson-lit` |
| Misty washi page backdrop (`accessibility`, `collections`, `save-game`) | `#c0c5c4` .. `#dbdcdb` | `gt-mist`, `gt-mist-hi`, `gt-mist-lo` |
| Right-hand Sayagata panel base (`gear`, `accessibility`) | `#141414` .. `#171616` | `gt-sayagata` |
| Right-hand Sayagata key-fret lattice lines (`accessibility`, `gear`) | `#1d1e1e` .. `#272828` | `gt-sayagata-fret` |
| Section black sumi-e brush header banner (`accessibility`, `game`, `save-game`) | `#0a0a0a` | `gt-ink-banner` |
| Pause stack sumi-e brush button (`pause`, `confirmation-2`) | `#080808` .. `#0e0e0e` | `gt-brush-dark` |
| Selected option / save slot / gear red brush (`accessibility`, `save-game`, `gear`) | `#c43a36` (also `#d63c38` tile, `#d13e3a` warning) | `gt-crimson`, `gt-crimson-hi` |
| Selected option label grey strip (`accessibility`, `game`) | `#7e8080` | `gt-slate-mid` |
| Idle option pale brush bar (`accessibility`, `save-game`) | `#b7bbbb` | `gt-mist-plate` |
| Disabled option row (`game`) | `#b0b5b3` | `gt-mist-muted` |
| White sumi-e brush button / highlight (`main-menu`, `gear`, `store-2`) | `#eff0f0` .. `#fefefe` | `gt-washi` |
| Antique Tsushima gold text & labels (`gear` EQUIPPED, `collections`) | `#b4a163`, `#c4b36e`, `#ebd487` | `gt-gold`, `gt-gold-bright` |
| Gold damage / progress bar (`gear`) | `#c4b36e` -> `#f4d480` | `gt-gold`, `gt-gold-bright` |
| Journal center slate card (`journal`) | `#21262a` | `gt-slate-card` |
| Options scroll thumb (`accessibility`) | `#848685` | `gt-scroll-thumb` |
| Slider numeric box fill (`mouse-keyboard`) | `#bcc2c1` | `gt-mist-lo` |
| Exploration firefly upgrade chevron (`gear-upgrade`) | `#18be6d` | `gt-firefly-raw` (tuned to `#137a43` `gt-firefly` for >= 4.5:1 contrast with `#f2f1ed`) |

Derived / tuned tokens: `gt-ink-deep` (`#111111`) for dark ink on white tabs/plates, `gt-ink` (`#171817`) for body text on misty washi (`12.17:1`), `gt-ink-muted` (`#505350`, `5.33:1`), `gt-gold-ink` (`#6e5921`, `4.61:1` for links on light mist), `gt-crimson-deep` (`#962925`) for pressed/danger states, `gt-crimson-aa` (`#b82f2b`, `5.34:1` with `#f2f1ed` for solid selected rows/buttons), `gt-firefly` (`#137a43`, `4.77:1` with `#f2f1ed` for running/launching states), and `gt-sayagata-chip` (`#242423`) / `gt-sayagata-rim` (`#4b483d`) for metadata chips on the dark Sayagata panel.

## Interface parts observed

- **Top navigation bar (`gear`, `journal`, `collections`, `save-game`)**: Full-width pure `#070707` black bar with crisp uppercase geometric sans nav labels (`MAP`, `JOURNAL`, `GEAR`, `TECHNIQUES`, `COLLECTIONS`, `OPTIONS`), keyboard cap hints (`[Q]`, `[E]`), right-aligned stat counters, and an active vertical gradient white-washi tab (`#292828` to `#dfdfde`) holding dark `#111111` ink text and a tiny vermilion `#d7403b` top-left corner triangle.
- **Section brush banners (`accessibility`, `game`, `save-game`)**: Wide left-anchored jet-black `#0a0a0a` sumi-e ink brush strokes with jagged dry-brush and splatter right edges, carrying an icon + uppercase white title.
- **Misty washi workspace (`accessibility`, `gear`, `collections`, `save-game`, `skill-tree`)**: Cool pale grey-ivory misty gradient (`#c0c5c4` -> `#dcdcd8`) that keeps dense option lists and icons calm.
- **Dark Sayagata details panel (`gear`, `gear-upgrade`, `accessibility`, `collections`)**: Right-hand `#141414` charcoal lacquer column stamped with a subtle repeating Japanese Sayagata key-fret pattern (`#212221`), crisp white title, antique gold `#c4b36e` subtitle/labels, gold horizontal stat bar, gold-bordered callout box (`collections`), crimson `#d13e3a` warnings, and bottom-right `[KEY] LABEL` keycap prompts.
- **Selection bars (`accessibility`, `save-game`, `gear-2`)**: Selected option or save row paints a feathered vermilion crimson (`#c43a36` / `#d63c38`) brush stroke behind crisp white text (plus `✓` check mark or `< value >` cycle arrows + circular page dots).
- **Sliders (`mouse-keyboard`)**: Tapered hand-inked dark brush stroke track with a slightly tilted (`-8 deg`) dark ink-dash thumb and a sharp rectangular numeric frame.
- **Location / celebration banners (`hud-2`, `confirmation-3`)**: Centered uppercase title flanked by hollow/inner-dot diamond motifs (`❖`) extending into thin tapered horizontal hairlines; diamond progression pips (`◆ ◆ ◇ ◇`) in `gear-upgrade`.
- **Swirling cloud crest (`journal`)**: Ornate circular swirling wind/cloud ring framing a gold Japanese *kamon* diamond badge on the active tale card.

## Design rules taken from the captures

- Three-surface tonal rhythm: pure `#070707` sumi black top chrome, calm `#d4d6d3` misty washi workspace, and `#141414` dark Sayagata lacquer detail inspector.
- Organic sumi-e dry-brush edges live on headers, CTA slabs, and active selection strokes, while inputs, keycaps, borders, and metadata chips keep razor-sharp `0-2px` architectural corners.
- Color roles are strictly separated: vermilion crimson (`#b82f2b`/`#c43a36`) for selection and active focus, antique Tsushima gold (`#c4b36e`/`#ebd487`) for metadata labels/borders/notifications, sumi ink (`#0c0c0c`) for primary CTAs and section banners, and firefly jade (`#137a43`) for live running/launching states.
