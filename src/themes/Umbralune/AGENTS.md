# Umbralune — Theme Notes

Unofficial *Bayonetta 2*-inspired nocturnal Umbran sanctuary Playnite desktop theme (`Showcase`).

## Sources
- Visual reference research & measured hex values: [RESEARCH.md](RESEARCH.md) (8 captures from [Game UI Database — Bayonetta 2 `id=215`](https://www.gameuidatabase.com/gameData.php?id=215): Title, Options, Pause, Chapter V Select, Combat HUD, Gates of Hell Dialogue, Loadout, Codex).
- Creative direction & levers: [BRIEF.md](BRIEF.md).
- Fonts: `Cinzel Decorative` (Regular, Bold — Natanael Gama, SIL OFL 1.1, Reserved Font Name `'Cinzel'`, shipped unmodified) + `Jost` (Regular, Medium — Owen Earl, SIL OFL 1.1) bundled in `src/Typography/` and credited in `info/NOTICE-Umbralune.txt`.

## Shell
- **44px Abyssal Sapphire rail (`Sidebar.xaml`)**: closed by a sapphire-gold hairline and crescent foot colophon, crowned by `PART_ElemMainMenu` hosting the animated **`LocalUmbraluneMenuMarkTemplate`** (Umbran Crescent Watch: outer clockwork ring turns 45° and gold 4-point star-needle glints on hover; Witch-Time amethyst core breathes and four diamond pips orbit while the menu is open).
- **50px Nocturnal Sapphire top bar (`TopPanel.xaml`)**: closed by a sapphire hairline and cyan optical flare (`LocalFlareBeamTemplate`); order: Search (`244×32` recessed sapphire well with paired antique-gold diamond ticks) -> Filter toggle (`8×8` faceted Ruby Gem diamond pip, zero text) -> `PART_PanelMainItems` (Sorting first in column 0, icon-only view switches) -> `PART_ProgressGlobal` (`12px` Combat HUD Mint-Jade HP bar) -> Notifications -> 136px caption clearance.
- **Window art (`Library.xaml`)**: full-strength `PART_ImageBackground` spans TopPanel and reaches under the rail (`-44` / `-56`), fading into `WindowArtSwatch`; under `ShowBackgroundImageOnWindow=True`, chrome turns transparent, `HeroArt` collapses, and ThemeModifier banner sliders grey out. `GameBannerTintBrush` = `#06112A` (Astral Midnight Sapphire from Title & Options screens).

## Controls, Fields & Menus
- **Menus (`ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`)**: unified `LocalUmbraluneMenuBoardTemplate` (midnight-sapphire board, faint nebula wash, antique-gold corner ticks, 2px cyan optical flare crown + gold diamond pip), 30px rows, animated Moon-Cyan `OPTIONS` rune-beam highlight (`LocalRuneBandTemplate`) with sliding ice-cyan diamond cursor, console-badge pill shortcuts, fading hairline + gold diamond breaks, and Gates-of-Hell Ruby `Alt+Q` Exit row.
- **Menu item icons (`art/menu-icons.json` -> `src/Images/Umbralune/`)**: 24 bare full-frame 48×48 faceted silver-chrome & sapphire-cyan baroque PNGs with split/bevel metallic finish, abyssal contour halo, and Solar Gold / Ruby tones.
- **Fields (`LocalUmbraluneFieldTemplate` in `TextBox.xaml`)**: hosted by `TextBox`, `PasswordBox`, and closed `ComboBox` (`Tag="Active"` only while open or editable+focused); paired 5px antique-gold diamond edge ticks and a one-shot 180ms horizontal Moon-Cyan optical flare (`flare-beam.png`); `ComboBox` reserves 38px right margin (28px sapphire-chrome cap + 10px inset).
- **Sliders (`Slider.xaml`)**: Bayonetta 2 `OPTIONS` grooved antique bronze-gold track with vertical faceted silver-chrome diamond thumb inset with a sapphire gem.
- **Settings chrome (`StandardWindowStyle.xaml`, `WindowBarButton.xaml`, `TreeView.xaml`)**: 44px `OPTIONS`-flared title band with `BrandMarkTemplate`, ghosted `watch-watermark.png`, and `WindowSettings` title trigger; bare 28px `Jost` tree rows with reserved scroll lane and glowing cyan rune-beam selection.

## Game Page & Running Motion
- **Generator (`art/build-overviews.mjs`)**: writes both `Views/DetailsViewGameOverview.xaml` and `Views/GridViewGameOverview.xaml` and runs `scripts/game-page-breakpoints.mjs` (`Right`, `Left`, `Center`/`Stretch` 3/2/1-col grid).
- **Focal pieces**: Hero banner melting across a cyan-flared Umbran Horizon seam; Solar Halo Gold `PlayButton` flaring with a horizontal cyan optical streak on hover; Chapter V Midnight-Sapphire & Gold Filigree Tarot metadata dossier (`300px` usable width, vertical `filigree-border.png` lace, 4 gold corner studs, centered violet-amethyst `HARD` rune ribbons); 28×28 diamond-ticked `SidePanelCloseButton` turning Ruby on hover; 50×50 Umbran Watch circular-diamond `GridTileButton` hover medallions.
- **Running game (`RunningIndicatorBrush` = `#8432E0` Witch-Time Amethyst)**: distinct from Gold Play, Cyan selection/hover, and Ruby filter/danger; diagonal comet `RunningScan`, amethyst foot fill `RunningFill`, and 3 socketed pulsing Bayonetta 2 Magic Orbs inside 48px `RowRoom` / 46px `PlayRoom` with `LOCCancelLabel` on `IsRunning + IsMouseOver(Self)`.

## Previews
- `art/preview-details.html` & `art/preview-settings.html` -> `art/screenshot-details.png` & `art/screenshot-settings.png`.
- Bundled faces match XAML 1:1 (`Cinzel Decorative` for display, `Jost` for body, `Consolas` -> `Cascadia Mono` for mono).
- Drawn motifs: Umbran Crescent Watch mark & watermark, `OPTIONS` cyan rune-beam selection, Solar Gold flared Play slab, Witch-Time Amethyst 3-orb running row, Chapter V Tarot dossier with `HARD` violet rune ribbons, and `OPTIONS` diamond-gem sliders.
