# Clutch — research & sources

## Sources

| What | Where |
|------|-------|
| Tokens and component values | The game's Panorama style sheets, `game/csgo/pak01_dir/panorama/styles/*.css` (`csgostyles.css`, `mainmenu.css`, `mainmenu_play.css`, `popups/*.css`, `settings/*.css`, `tooltips.css`, `context_menu.css`), as tracked by **SteamDatabase/GameTracking-CS2** (fetched 2026-09-30). Values were read and rewritten as plain numbers in `src/tokens.css`, each with the selector it came from; no file was copied. |
| Icons | **Material Symbols Sharp**, filled (Apache-2.0, `info/LICENSE-material-symbols.txt`), the closest open set to the game's solid square-cut menu glyphs. Geometries in `src/Media.xaml` (shifted to a 0..960 grid), menu PNGs in `src/Images/Material/`. Jobs in `icons.json`. |
| Crosshair | Original: five rectangles in `src/Media.xaml` (`IconMainMenu`) and `art/mark.svg` (add-on tile). |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

The game's fonts (Stratum2, Noto Sans) are not bundled. Body text is Segoe UI; headings, tabs and the GO label use **Bahnschrift** (ships with Windows 10+), the nearest condensed DIN-like face to Stratum2.

## Motion

Read from the same source as the tokens: the game's Panorama stylesheets in SteamDatabase/GameTracking-CS2 (`game/csgo/pak01_dir/panorama/styles/csgostyles.css`, `mainmenu.css`, `mainmenu_play.css`, fetched 2026-11-08 through raw.githubusercontent.com). These are stylesheet values, not frame-stepped footage. Panorama is CSS-like: `transition-property` / `transition-duration`, `brightness`, `wash-color`, `pre-transform-scale2d`, and a few `@keyframes`.

| What | Value (selector) |
|------|------------------|
| FlatButton (the GO button's family) | `transition-property: background-color, brightness; transition-duration: .25s; transition-timing-function: ease-in-out`; `:hover` is `brightness: 1.2`; label `color` goes to `White` over `.25s` (`.FlatButton`, `.FlatButton:hover`, `.FlatButton Label`) |
| GO bar | `.play-menu__playbtn:hover .play-menu__playbtn__bar { brightness: 2 }`; the button itself transitions `opacity, box-shadow, wash-color, transform` over `.25s` |
| GO pressed | `.play-menu__playbtn.pressed { transform: translateY(-0px) rotateX(100deg); opacity: 0 }` (the button flips away when a search starts) |
| `Positive` / `Operation` / `Blue` hover | `brightness: 1.4; transition-duration: 0s` (instant in the game) |
| IconButton | `transition-property: background-color; transition-duration: .1s; ease-in-out`; icon `wash-color: white`, selected `black` |
| Navbar icon buttons | `background-color` to `rgba(255,255,255,0.10)` on hover (`ease-in`); icon `wash-color` to `selectedNavColor` over `.15s` when selected |
| PopupButton | `.1s` base, hover wash `rgba(255,255,255,.05)` over `.2s` |
| Map tile (`.map-selection-btn`) | `transition-property: border, box-shadow, brightness, opacity; .25s`; hover zooms the screenshot `pre-transform-scale2d: 1.02` (`.25s`), selected `1.2` with a 4px `rgba(255,255,255,.849)` border |
| Empty maps list | `.map-selection-no-subscriptions-label`: centred, 24px, no motion |
| Keyframes in `csgostyles.css` | `BackgroundPulse` (3s loop), `Spinner` (1.25s), `RadialSweep` (2s loop), `DropIn` (0.5s, `ease-in`); no loop on the menu itself while idle |

What I used:

- **Play (GO):** hover = a lighter green plate cross-fades in over 0.25s ease-in-out (the 1.2 brightness), the label cross-fades to white (0.25s), the glows rise 0.35 to 0.8 and the bars 0.55 to 1 (the `brightness: 2` bars). Pressed: its own deep-green layer and a ScaleY squash to 0.92 in 0.08s (a stand-in for the game's `rotateX(100deg)` flip, which WPF cannot do on a Button).
- **Cover hover:** the game zooms the tile image 1.02 in 0.25s; the cover image does the same inside the tile (clipped), with a 2px white-40% edge fading in over 0.25s. Selected is the game's `:selected` tile border (now drawn: 3px, `maptile-selected`), static. This was a visible deviation before: the old theme drew no outline in any state.
- **Cover buttons:** the game's IconButton: square 40px plates on the 50% tile blur, white 10% wash in 0.12s (the game uses 0.1s), the glyph washes from `baseText` to `selectedNavColor` over 0.15s with a 1px lit edge. Play is in the GO greens. The entrance is the shared recipe (shade fade, 8px rise, Info 60ms later, 0.25s ease-in-out, no overshoot: the menu eases).
- **Empty page:** the game's crosshair (the theme's own mark), arms breathing out and in 5px over 1.4s each way, `LOCErrorNoGameSelected` in the uppercase heading face. The game's own empty label has no motion; the breathing is the only invention.
- **Assets:** none generated. The menu has no light or texture beyond the GO bar glow, which already exists.

Not verified: the real feel of these transitions in game (no capture was frame-stepped); that `Positive:hover` is really instant (taken from the CSS, 0s), which I deliberately fade in 0.25s instead because the brief forbids snapping.
