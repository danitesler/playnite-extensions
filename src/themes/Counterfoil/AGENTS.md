# Counterfoil — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by **Disco Elysium** and its **FELD Playback** 35mm film-transcript interface (dark variant, unofficial fan theme).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (ambition, source DNA, game element map, signature moments, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Sprites & Typography

- **Deterministic white-mask FX sprites** (`art/sprites.py`, seed `1951` → `src/Images/fx/*.png`): `paper-tape.png` (512×96 torn photo-paper row/menu strip), `tape-tab.png` (256×64 compact torn header/tab plate), `brush-bar.png` (512×96 painterly oil-brush Play / Red Check / Danger slab), `film-rail.png` (36×512 seamless vertical 35mm FELD film rail with stepped cutouts & millimeter ticks), `film-rail-h.png` (512×24 horizontal film ruler), `film-grain.png` (256×256 photographic emulsion grain & fine vertical scratches), `oil-wash.png` (512×256 impasto wash for Play button Psyche-violet sheen), `torn-frame.png` (128×128 weathered portrait card frame), `darkroom-leak.png` (256×512 vertical burnt-amber light-leak column), and `halftone-corner.png` (256×192 distressed diagonal corner halftone). All sprites are pure white RGB with alpha so ThemeModifier recolors every effect automatically.
- **Bundled fonts** (`src/Typography/`): `Barlow Condensed` (Regular, Medium, SemiBold, Bold; OFL-1.1) for mastheads, titles, Play CTA, and torn-paper section tabs; `Barlow Semi Condensed` (Regular, Medium, SemiBold, Bold; OFL-1.1) for UI controls, menus, and metadata captions; `Georgia` (Windows built-in) for dialogue/reading text and library rows; `Consolas` (Windows built-in) for scores, shortcuts, and counters.

## Tokens

| Token (`src/tokens.css`) | Key (`Constants.template.xaml`) | Used for |
| --- | --- | --- |
| `--cf-void` (`#0B0D0E`) | `ScrimBrush`, `WindowTitleBackgroundBrush`, `TabControlHeaderBackgroundBrush`, `BevelShadowBrush` | Deep cinema emulsion black, title bar, running scrim |
| `--cf-carbon` (`#111415`) | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `PopupBackgroundBrush`, `ButtonBackgroundBrush` | Smoked 35mm film chrome, menus, transcript metadata dossier |
| `--cf-stock` (`#16191A`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `GameBannerTintBrush` | Library & game page dark film stock |
| `--cf-well` (`#0D1011`) | `InputBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush`, `ProgressBarTrackBrush` | Recessed darkroom search/input well |
| `--cf-rail` / `--cf-rail-bright` (`#7E878C` / `#AAB3B8`) | `FrameBrush`, `LocalFilmRailBrush`, `LocalFilmRailBrightBrush`, `SliderTrackBrush` | Metallic 35mm FELD film-strip rails & millimeter ruler ticks |
| `--cf-paper` / `--cf-paper-bright` (`#E6E4DE` / `#F4F2EC`) | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `TextColor` | Torn chalk photo-paper selection strips, tabs, section headers, readable body copy |
| `--cf-ink` (`#101213`) | `SelectedForegroundBrush`, `SidebarItemSelectedForegroundBrush`, `TextColorDark` | Jet-black ink printed onto torn photo-paper strips |
| `--cf-amber` (`#B95D17`) | `LocalDarkroomAmberBrush`, `HeadingMarkerBrush`, `TopPanelRuleStartBrush` | Vertical darkroom amber light-leak (Sidebar, Library rail, Settings nav) |
| `--cf-vermilion` (`#C83D1B`) | `PrimaryButtonBackgroundBrush`, `LocalVermilionBrush`, `ProgressBarForegroundBrush` | Dialogue Red Check / Play brush slab, active accent bar, notification orb |
| `--cf-int-cyan` / `--cf-psy-violet` / `--cf-fys-crimson` / `--cf-mot-ochre` | `LocalIntCyanBrush`, `LocalPsyVioletBrush`, `LocalFysCrimsonBrush`, `LocalMotOchreBrush`, `DataChangeNotifColor` | Four-skill attribute micro-stripe & diamond pips; Psyche violet impasto wash on Play; Motorics ochre filter active diamond |
| `--cf-success` (`#1B9E62`) | `RunningIndicatorBrush` | Dedicated Check Success Emerald live launching/running state |
| `--cf-danger` (`#B82D2D`) | `DangerBrush` | Destructive crimson for Exit, Close hover, negative ratings |

## ThemeModifier

Main backgrounds, chrome surfaces, selection, Play button, running emerald, inputs, `GameBannerHeight` (260), `GameBannerDarken` (0), `GameDetailsPaneWidth` (300), `GridDetailsPaneWidth` (300), and `GameDetailsPanePosition` (`Right` default; `Left` / `Center` / `Stretch` / `Right`) are exposed via the shared catalog. Hover, pressed, and decorative colors stay in the theme.

## Component spacing (`src/Common.xaml`)

| Key | Value | Role |
| --- | --- | --- |
| `ControlHeight` | `32` | Inputs, combos, standard buttons |
| `ButtonPadding` | `16,5` | Smoked-film buttons |
| `InputPadding` | `10,5` | Darkroom input wells |
| `MenuPadding` / `ComboBoxDropDownPadding` | `4` | FELD film-rail popup boards |
| `MenuItemPadding` / `ComboBoxItemPadding` | `8,4` | Compact 30px menu & dropdown rows |
| `GameBannerHeight` | `260` | Hero banner height (0..600) |
| `IconSize` | `16` | Compact rail & top bar bespoke counterfoil vectors |

## Shell & Components

- **Sidebar (`Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml`)**: 44px smoked-film rail over `darkroom-leak.png`, closed on the inner edge by a vertical metallic `film-rail.png` ruler strip. Current item stamps `tape-tab.png` in chalk paper with black ink icon and a 3px vermilion left bar.
- **Top bar (`Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml`)**: 50px dark ribbon closed by `film-rail-h.png` and an amber lead line; persistent search magnifier, 9px rotated Motorics ochre diamond filter pip (`TextFilter`), sorting-first tools, icon-only view switches (`tape-tab.png` when toggled), vermilion notification orb, and 12px `PART_ProgressGlobal`.
- **Game pages (`art/gen-overviews.mjs` → `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml`)**: Hero art dissolved into dark film stock and terminated by a horizontal `film-rail-h.png` splice; torn photo-paper `tape-tab.png` section headers with diamond-headed rules; twin-rail FELD transcript metadata dossier crowned by the 4-color `INT`/`PSY`/`FYS`/`MOT` micro-stripe bar; responsive `GameDetailsPanePosition` applied via `scripts/game-page-breakpoints.mjs`; centered blank-frame `EmptyGameTemplate` when no game is selected.
- **Play button & Running game (`DerivedStyles/PlayButton.xaml`, `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `DefaultControls/ListView.xaml`)**: Painterly `brush-bar.png` vermilion Play slab with Psyche-violet `oil-wash.png` sheen, separated play-glyph cell, and chalk lip. Launching sweeps an angled (`1,0.28`) emerald FELD exposure band across the exact surface shape while filling a segmented 35mm sprocket foot bar (`LocalSprocketSegmentsMask`) and sequentially lighting twin 2d6 skill-check diamonds (`◆ ◆`, `1.6s` loop). Running settles into a `3.2s` idle breath (`0.72..1.0` frame, `0.30..0.44` button scrim keeping label contrast >5.5:1) with alternating diamond glow; hovering RUNNING swaps `PlayContent` (`Hidden`) for `Cancel` via `RelativeSource Self`. `PlayRoom` (`0,0,44,0`) and `RowRoom` (`0,0,46,0` + `RunningMarkPlate`) keep labels clear of the diamonds.
- **Menus (`DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`)**: Smoked 35mm film board (`LocalMenuPanelTemplate`) with 6px left metallic `film-rail.png` and amber top rule; 30px rows with sliding `paper-tape.png` highlight, 3px vermilion left bar, black ink inversion on label/icon/shortcut, notched square + hollow diamond separators, plain `Consolas` shortcuts, filled diamond checks, and crimson `brush-bar.png` Exit (`Alt+Q`).
- **Authentic Options Controls**: Curved parenthesis `( ──⊙── )` bullseye-ring `Slider`, chalk-block `CheckBox`, vermilion-bullseye `RadioButton`, wire-and-bead Dialogue `ScrollViewer`, brushed-black + torn-paper `TabControl`, and minimal 28px `TreeView` over darkroom amber glow (`WindowSettings` width `228`).

## Previews

`art/preview-details.html` and `art/preview-settings.html` (styled by `art/preview.css`) use `var(--cf-*)` tokens and the same `src/Images/fx/*.png` masks via `-webkit-mask`, rendered to `art/screenshot-details.png` and `art/screenshot-settings.png` via `scripts/take-screenshots.ps1 -Extension counterfoil`.

## Deviations

- Uses `Barlow Condensed`, `Barlow Semi Condensed`, `Georgia`, and `Consolas` as open/built-in stand-ins for Disco Elysium's condensed grotesque & literary serif typography.
- Playnite's `RowHoverAction` uses `{MainViewModel StartGameCommand}` / `{MainViewModel InstallGameCommand}` per `src/themes/AGENTS.md`.
