# Ancient — research & sources

## Sources

Valve publishes no design system, but the game's interface stylesheets are public game data. `tokens.css` tags each value:

| Tag | What | Where |
|-----|------|-------|
| `[CSS]` | Top bar tabs (`.TopBarMenuItem`: 18px title font, uppercase, `#777f88`, hover white, selected white with a `#3382ff` glow; 60px tall, 164px wide), secondary strip (`#TopBarSecondaryTabs` black `aa` fading right, `.SecondaryTabButton` `#768e8d`, selected glow `#5d7070`), search box (`#TopBarSearchBox` 350px, 2px `#556663` edge), gear button wash `#444a55`/`#9999aa`, `#VerticalSeparator`; PLAY button (`play.css .PlayButton`: `#5Aa15E` → `#87d69533`, light top/left edge, dark bottom/right, 28px bold uppercase); `ButtonBevel`, `ButtonDark`, `DropDown`/`DropDownMenu`, `TextEntry`, tick box and radio, slider, scroll thumb (`dotastyles.css`); tooltip `#252b30` (`core tooltip_base.css`); popup panel (`core popups_shared.css`); chat panel `#161E24` (`chat.css`); hero card dimming (`hero_card.css`); fonts `Radiance` / `Reaver` | `pak01_dir/panorama/styles` of the build of 2021-02-15, as mirrored in [SteamDatabase/GameTracking-Dota2](https://github.com/SteamDatabase/GameTracking-Dota2) commit `3b077d8` (`dashboard.css`, `dotastyles.css`, `play.css`, `hero_grid.css`, `hero_card.css`, `chat.css`, core `tooltips/`, `popups/`). Layout facts from `layout/dashboard.xml` (settings, home, Heroes/Store/Watch/Learn/Arcade tabs, right-side buttons). Read for values only; no file is shipped. |
| `[eye]` | Surfaces the game draws with textures or 3D scenes (window, top bar slate, page layer), the glow washes, the pressed green | Chosen by eye between the sourced values. Screenshots of the game could not be fetched from the build environment (image hosts blocked), so nothing is measured against a capture. |
| Icons | Original line artwork, 24 grid, 1.75 stroke, round joins | Written directly as geometries in `src/Media.xaml`. Menu icons stay Playnite's glyphs. MIT with the repo. |
| Tile icon | `art/mark.svg` (original faceted keystone), default orange | `scripts/render-addon-icon.py` |
| Playnite | Every file starts from the Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`); game page and side panels follow the shared skeleton | |


## Motion

Read from the same source as the tokens: the Panorama stylesheets in SteamDatabase/GameTracking-Dota2 at commit `3b077d8` (`game/dota/pak01_dir/panorama/styles/play.css`, `dotastyles.css`, `hero_card.css`, fetched 2026-11-08 with the GitHub contents API). Stylesheet values, not frame-stepped footage.

| What | Value (file, selector) |
|------|------------------------|
| PLAY button | `transition-property: box-shadow, background-color, opacity, transform; transition-duration: 0.2s; transition-timing-function: ease-in-out` (`play.css` `.PlayButton`); rest `box-shadow: fill #002a6644 -4px -4px 8px 9px`; `:hover` is `box-shadow: fill #414f4daa -4px -4px 8px 8px; brightness: 1.2`; `:active` takes the gradient's bottom stop to `#ffffff`; label `color` transitions over `0.2s` |
| Searching | `@keyframes SearchingAnimation`: `wash-color` white, `#7aa8b7` at 50%, white at 100% (the Find Match state of the button) |
| ButtonBevel | `transition-property: background-color, opacity; transition-duration: 0.05s`; label colour `0.35s` (`dotastyles.css` `.ButtonBevel`) |
| ButtonDark | `transition-property: border, background-color; 0.1s` |
| General | most hover transitions in `dotastyles.css` are `0.15s`, `0.2s` or `0.25s` |
| Hero card | `transition-property: transform, box-shadow, opacity, saturation, wash-color; transition-duration: expandDuration, expandDuration, 0.3s, 0.3s, 0.3s; ease-in-out` (`hero_card.css` `#Contents`); resting `saturation: 0.7`; highlighted `saturation: 1`, `box-shadow: #00ffff44 -4px -4px 8px 8px`, a `0.2s` `HeroCardHighlight` pop (`pre-transform-scale2d` 1, 1.25, 1); expanded `0.18s` and `HeroCardExpand 0.25s ease-in` |
| Empty page | no stylesheet rule found for an empty dashboard; the game fills its pages |

What I used:

- **Play hover:** 0.2s ease-in-out both ways. The light green (the 1.2 brightness) rises from the bottom (Lift), the bottom shade thins, and the box-shadow glow (generated white mask, `Images/fx/glow-frame.png`, filled with the button's green) goes 0 to 0.3 (hover only; no resting glow). Pressed is its own deep-green layer (0.05s in, 0.12s out) with a 1px label nudge. The game takes the bottom stop to white on `:active`; the theme already had a darker green, kept.
- **Cover hover:** 0.3s ease-in-out: the 22% veil lifts (the saturation 0.7 to 1 look; WPF has no saturation), a 1px light edge fades in, the blue nav glow blooms around the card, and the cover image zooms 1.03 inside its frame (the game pops a highlighted card to 1.25 for 0.2s; that is too big for a library tile). Selected stays static.
- **Cover buttons:** the game's ButtonBevel: 40px bevelled squares with the theme's line glyphs, hover plate over 0.08s (the game uses 0.05s), glyph from muted to white over 0.2s. Entrance: shade 55%, 10px rise and 0.9 to 1 scale with a tiny overshoot, 0.25s (the game's expand time), Info 60ms later.
- **Empty page:** the keystone mark (the tile icon's shape, outline only) with the game's SearchingAnimation on it: a white outline fades in over the muted one and back, 2s loop, only while shown, with "No game selected" in the title face.
- **Assets:** one sprite, `glow-frame.png` (`art/fx.py`, deterministic, review sheet `art/fx-sheet.png`): the box-shadow, a blurred box with about 0.8 alpha at the edge. The game's glow is `box-shadow`, which WPF cannot do without `DropShadowEffect`.

Also changed because the animations sit over it: `Views/Library.xaml` and the banner in both overviews lost their `OpacityMask` and `BitmapCache` (reference.md: masked art behind animated controls leaves dark seams on scaled displays); the fades are plain gradients in the page brush.

Not verified: the numbers against footage; that the banner's bottom edge (it fades to the page brush at half strength to match the library art veil) is seamless against the library art on a real game; `HeroCardHighlight` pop sizes beyond what the CSS states.
