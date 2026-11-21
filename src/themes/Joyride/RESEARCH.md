# Joyride: research

Unofficial theme inspired by the 3D and HD era of Grand Theft Auto: III (2001), Vice City (2002), San Andreas (2004), IV (2008) and V (2013). No game assets, logos, characters or art are used; every picture in the theme is drawn by `art/sprites.py` from simple shapes. Gathered 2026-11-21 in the browser pane (nothing downloaded).

## Sources

| Source | What it gave | Notes |
|--------|--------------|-------|
| [FiveM docs: HUD colors](https://docs.fivem.net/docs/game-references/hud-colors/) | GTA V `common:/data/ui/hudcolor.dat` defaults, RGBA per index | Read with a script in the browser pane; values below are copied as listed |
| [gta.wiki `MediaWiki:HUD.css` (raw)](https://gta.wiki/index.php?title=MediaWiki:HUD.css&action=raw) | Wiki-curated HUD colors for Vice City, San Andreas, IV (and The Ballad of Gay Tony) | Display CSS chosen by wiki editors to match each game's HUD, not values read from the game files |
| [gta.wiki Fonts](https://gta.wiki/w/Fonts) | Per-game fonts for box art, menus, HUD, subtitles and centre messages | Community identifications |
| Play memory of the five games (pause menus, HUD, loading screens, box art) | Layout and motion notes below | Not measured; treat sizes as proportions |

## Colors

GTA V `hudcolor.dat` (exact):

| Name | RGBA | Theme token |
|------|------|-------------|
| `HUD_COLOUR_PURE_WHITE` | 255,255,255,255 | `--pure` |
| `HUD_COLOUR_WHITE` | 240,240,240,255 | `--white` (text) |
| `HUD_COLOUR_GREYLIGHT` | 205,205,205,255 | `--grey-light` |
| `HUD_COLOUR_GREY` / `MENU_GREY` | 155,155,155 / 140,140,140 | `--grey` |
| `HUD_COLOUR_MENU_DIMMED` | 75,75,75 | `--dim` |
| `HUD_COLOUR_MENU_GREY_DARK` | 60,60,60 | `--edge` |
| `HUD_COLOUR_MENU_HIGHLIGHT` | 30,30,30 | `--panel-lit` |
| `HUD_COLOUR_PAUSE_BG` / `INGAME_BG` | 0,0,0,186 (73%) | menu panel and banner scrim alpha |
| `HUD_COLOUR_YELLOW` | 240,200,80 | `--mission` (accent, selection, "mission passed") |
| `HUD_COLOUR_YELLOWDARK` | 126,107,41 | `--mission-deep` |
| `HUD_COLOUR_GREEN` / `GREENDARK` | 114,204,114 / 57,102,57 | `--cash` / `--cash-deep` |
| `HUD_COLOUR_RADAR_HEALTH` | 53,154,71 | `--health` (progress bar) |
| `HUD_COLOUR_RED` / `REDLIGHT` | 224,50,50 / 240,153,153 | `--wasted` base / `--wasted-lit` |
| `HUD_COLOUR_BLUE` | 93,182,229 | `--siren` (running indicator only) |
| `HUD_COLOUR_FREEMODE` / `FREEMODE_DARK` | 45,110,185 / 22,55,92 | `--freemode` / `--freemode-deep` |
| `HUD_COLOUR_MICHAEL` | 101,180,212 | `--michael` |
| `HUD_COLOUR_FRANKLIN` | 171,237,171 | `--franklin` |
| `HUD_COLOUR_TREVOR` | 255,163,87 | `--trevor` |
| `HUD_COLOUR_PINK` | 203,54,148 | `--vice-magenta` |
| `HUD_COLOUR_GOLD` | 214,181,99 | `--gold` (wanted star fill) |

Classic HUD colors (gta.wiki CSS):

| Game | Values | Theme use |
|------|--------|-----------|
| Vice City | pink 246,145,225; blue 96,188,237; green 4,195,126; red 116,40,70 | `--vice-pink`, `--vice-teal`: the sunset collage panel |
| San Andreas | cream 227,192,102; dark blue 23,31,178; light blue 152,178,211; money green 61,111,48; red 165,25,28 | `--sa-cream`, `--sa-blue`: the desert collage panel; money green as the HUD counter shadow |
| IV | blue 74,148,160; blue dark 51,105,114; yellow 206,169,13; grey 100,100,100; menu yellow 240,160,0 | `--liberty`, `--liberty-deep`: the night city collage panel |

`--wasted` is darkened to `#CC2929` so a white label on the Exit plate keeps 5.4:1 (the game's 224,50,50 gives 4.5:1).

## Typography

| Game | Logo / titles | Menus | HUD money | Other |
|------|---------------|-------|-----------|-------|
| III | Pricedown | Pricedown | Pricedown | Arial Black for location, vehicle and subtitles |
| Vice City | Pricedown | Pricedown | Pricedown | Rage Italic for mission and location names |
| San Andreas | Pricedown | Beckett titles, Bank Gothic items | Pricedown | Futura Bold subtitles |
| IV | Pricedown | Helvetica Neue Heavy | Pricedown | DIN 1451 subtitles |
| V | Pricedown | Chalet Comprime Cologne (titles), Chalet London 1960 (items) | Pricedown | SignPainter for location names |

Pricedown is the one constant: every title, every "MISSION PASSED", every money counter, always white or colored with a heavy black outline and a hard shadow. The user asked for Impact outlined titles, so **Impact** (ships with Windows) carries that role with a 2-3px black outline built from offset copies plus a hard drop shadow. The GTA V menu faces are commercial; **Barlow** (body, Chalet London stand-in) and **Barlow Condensed Bold** (tabs, headings, captions; Chalet Comprime stand-in) are bundled under the OFL. No script face is bundled (Rage Italic and SignPainter are commercial and no Windows face matches).

## Interface parts (the game element map reads from these)

- **Box art collage (all five games).** The cover is a grid of illustrated panels separated by thick black gutters (about 1.5% of the cover width), one panel holding the stacked title in white Pricedown with a black outline. Panels are painted scenes: a skyline, palms against a sunset, a car, a helicopter, hills. The grid is irregular: tall, wide and square cells.
- **Loading screens.** III/VC/SA: a full-bleed illustration with a thin progress bar. IV: art panels slide in and settle. V: collage panels pan slowly, separated by black gutters, then cut to the next.
- **Pause menu (V).** Black at 73% over the frozen world. A title line top left in Chalet Comprime, the player's name, time and cash top right. A row of tabs (MAP, BRIEF, STATS, SETTINGS, GAME...): the current tab is a white plate with black text; the others are dark plates with white text. A thin bar in the current character's color (Michael blue, Franklin green, Trevor orange) runs over the tab row. Lists: dark rows, the selected row is a white plate with black text, value cells end in `< value >` arrows.
- **Interaction menu (V).** A picture banner header with a title, a black sub-header with the section name in blue and a counter `1/12`, then dark translucent rows with the selected one white. No animation: the highlight jumps.
- **Instructional buttons (V, PC).** Bottom right: white rounded key caps with black letters (`ESC`, `ENTER`, `F4`) next to a label.
- **HUD.** Money top right: green or white Pricedown digits with a black outline (`$00012345`). Wanted level: up to six (five in IV and V) gold or white stars with black outlines that flash when the police search. Health and armor bars: SA draws thick bars with a black border (red health, white armor); V draws green health and blue armor segments under the radar. The radar is a circle (III-SA) or a rounded square (IV-V) with the player arrow and blips.
- **Mission messages.** "MISSION PASSED" in big yellow-gold Pricedown with a black outline, centred, with "RESPECT +" under it in SA; "WASTED" in red over a desaturated slow-motion screen; "BUSTED" the same in V. V adds a white bar sweep under the title.
- **Mission markers.** III-SA: a glowing corona cylinder (yellow for missions, pink for safehouses, blue for shops). V: a yellow letter blip.
- **Police lights.** The wanted stars flash, and the radar edge strobes red and blue while the cops chase.
- **Phone.** IV and V: a phone slides up from the bottom right with app tiles. Not used (no fitting Playnite surface).

## Motion (from play)

- Menus snap: the GTA V highlight jumps between rows with no tween. Tabs switch instantly.
- Big messages scale down from about 110% to 100% in under 200 ms, hold, and fade.
- Wanted stars flash on and off at about 2 Hz.
- Loading collages pan slowly (several seconds per panel) and cut.
- The weapon and radio wheels pop open from the centre.

Joyride keeps the snap: fast 90 ms steps for highlights, a 180 ms punch-in (`BackEase`) for "message" moments, and slow pans only on the empty page.
