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
