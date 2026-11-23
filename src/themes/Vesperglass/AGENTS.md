# Vesperglass — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the deep aubergine-plum glass, burnished rose-copper architectural hairlines, electric amethyst star flares, hourglass active markers, and lyrium crystal accents of **Dragon Age: The Veilguard**. Unofficial fan theme; not affiliated with, endorsed by, or sponsored by Electronic Arts Inc. or BioWare (`info/NOTICE-Vesperglass.txt`). Ships no game art, official logos, or proprietary font files; the brand mark (`art/mark.svg` and `IconMainMenu`) is an original faceted Astrolabe-Hourglass Diamond.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference captures (16 `1920x1080` captures inspected on `gameuidatabase.com/gameData.php?id=1997`), GUDB 81-swatch palette strip measurements, typography notes, and chrome observations: [`RESEARCH.md`](RESEARCH.md). Creative brief (Ambition `Showcase`, Source DNA, 11-item game element map, hero & secondary moments, motion language, brand mark): [`BRIEF.md`](BRIEF.md).

## Tokens

Tokens live in `src/tokens.css` under `--vg-*`; `src/Constants.template.xaml` maps Playnite palette keys and shared keys by role.

| Token | Key | Used for |
|-------|-----|----------|
| `vg-void` (`#12041C`) | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush`, `GameBannerTintBrush`, `ScrimBrush`, `MainMenuButtonBackgroundBrush` | 44px compact rail, 52px top bar, 44px dialog title band, banner darkening tint, scrims |
| `vg-page` (`#190626`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | Library workspace and game overview deep aubergine-plum base |
| `vg-well` (`#100319`) | `InputBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush`, `CheckBoxCheckMarkBkBrush` | Recessed search, form inputs, slider and diamond-capped progress rails |
| `vg-panel` (`#220A33`) / `vg-panel-alt` (`#2C0F42`) | `NormalBrush`, `PopupBackgroundBrush`, `ExpanderBackgroundBrush`, `ButtonBackgroundBrush`, `TooltipBackgroundBrush`, `SecondaryButtonBackgroundBrush` | Double-hairline Codex dossier, popup boards, cards, buttons, tooltips |
| `vg-copper` (`#CB856B`) / `vg-copper-hi` (`#DF9D85`) | `PrimaryButtonBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `FrameBrush`, `PopupBorderBrush`, `TooltipBorderBrush` | Pointed-hexagonal Play/Default CTA, architectural double hairlines, diamond dividers |
| `vg-amethyst` (`#A355E0`) / `vg-amethyst-bright` (`#C58AFF`) / `vg-amethyst-deep` (`#3B145C`) | `GlyphBrush`, `FocusBrush`, `SelectedBorderBrush`, `SelectedBrush`, `ListItemSelectedBrush`, `TabItemIndicatorBrush`, `PrimaryButtonGlowBrush` | Active selection rim & fill, 4-point star flares, glowing hourglass tab marker, 9-slice bloom |
| `vg-lyrium` (`#147E9E`) / `vg-lyrium-lit` (`#6CE0FA`) | `RunningIndicatorBrush`, `LocalLyriumLitBrush`, `LocalLyriumForegroundBrush` | Dedicated Lyrium Frost Cyan reserved strictly for Launching & Running indicators |
| `vg-emerald` (`#5FD678`) | `DataChangeNotifBrush`, `PositiveRatingBrush` | Vitality Emerald 9px 4-point active filter star pip and positive score seals |
| `vg-crimson` (`#B8214C`) / `vg-crimson-fg` (`#FDF7FA`) | `DangerBrush`, `DangerForegroundBrush`, `NegativeRatingBrush` | Close button hover, `Alt+Q` Exit menu highlight (`6.25:1`), negative ratings |
| `./Typography/#Cinzel` | `HeadingFontFamily` | Carved flared fantasy serif for game titles, dialog title band, Play/Default CTAs, tabs, score seals (`Cinzel-Regular.ttf`, `Cinzel-Bold.ttf`, OFL) |
| `Segoe UI` | `FontFamily` | Clean Flat 2.0 UI body, library rows, Settings section tree, metadata (`Selawik` stand-in in previews) |
| `Consolas` | `MonospaceFontFamily` | Keycap shortcut badges and numeric readouts (`Cascadia Mono` stand-in in previews) |

`GameBannerTintBrush` uses `vg-void` (`#12041C`), Vesperglass's deepest twilight aubergine, so ThemeModifier banner darkening wraps hero art in plum twilight fog rather than flat grey.

## Component spacing (`src/Common.xaml`)

| Key | Value | Purpose |
|-----|-------|---------|
| `ControlHeight` | `32` | Shared form inputs, combos, and buttons (filter sidebar uses `28`) |
| `ButtonPadding` | `16,5` | Button inner padding |
| `InputPadding` | `10,5` | TextBox, PasswordBox, ComboBox inner padding |
| `MenuPadding` / `MenuItemPadding` | `4,7,4,5` / `10,5` | Compact popup board and 30px menu rows |
| `GroupBoxPadding` | `14,12,14,14` | Framed GroupBox inner padding |
| `IconSize` | `16` | Toolbar and rail icon size |
| `GameBannerHeight` / `GameBannerDarken` | `300` / `0` | Default hero banner height (`0..600`) and banner darkening (`0..1`) |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px `vg-void` left rail closed by a copper edge with a rotated copper diamond tick, crowned by `PART_ElemMainMenu` wearing `LocalVesperglassMenuMarkTemplate` (Common.xaml, also the top bar's menu button), a Veilguard hourglass with amethyst sand, in a double copper bezel that takes an amethyst rim on hover; hover turns the glass over (180 degrees, small overshoot); while the menu is open an amethyst thread of sand draws through the waist, grains keep falling and an alabaster four-point star flare opens over the waist and breathes; 44x40 items (`Padding="14,12"`, no stacked `IconPadding`) illuminating deep amethyst + `hourglass-glow.png` aura + 2px bright amethyst bar; transparent on window background art |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px `vg-void` top bar with 4.5% `astrolabe-tile.png` and tapered copper-diamond `DividerTemplate`; search (double copper hairline, persistent magnifier) -> filter (9px Vitality Emerald 4-point star `TextFilter`, zero text) -> sorting first -> icon-only view switches (`34x34`, toggled wears glowing amethyst hourglass aura) -> notifications -> 12px copper-diamond end-capped `PART_ProgressGlobal`; 132px right caption clearance; `TopPanelMenu` inherits `ContextMenu` |
| `Views/Library.xaml`, `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Full-strength `PART_ImageBackground` spanning behind top bar & rail with soft bottom fade into `WindowArtSwatch`; side panels turn transparent on window art; 28px filter controls & 28x28 preset buttons |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | 1px rose-copper frame border, `40x32` main window captions, `46x44` dialog captions with crimson close hover |

## Game page

Generated via `art/gen-overviews.mjs` (`node src/themes/Vesperglass/art/gen-overviews.mjs`, which invokes `scripts/game-page-breakpoints.mjs`):

- Both `Views/DetailsViewGameOverview.xaml` and `Views/GridViewGameOverview.xaml` frame the metadata pane as a **Codex Metadata Dossier** (double rose-copper hairline, 3.8% `astrolabe-tile.png`, centered top hollow-diamond crest, 300px usable inner width, `GameDetailsPanePosition` Left / Center / Stretch / Right).
- Both overviews host the breathing Astrolabe `EmptyGameTemplate` when `Game` is null (`PART_ScrollViewHost` explicitly `Visibility="Visible"`).

## Components

| Playnite file | Veilguard-inspired component |
|---------------|------------------------------|
| `DerivedStyles/PlayButton.xaml` | Pointed-hexagonal burnished rose-copper plaque (`LocalHexPlateTemplate`) with 9-slice amethyst & copper `bloom.png`, corner 4-point `star-flare.png` glints, and diagonal `sheen-band.png` sweep on hover; `Tag="ContextAction"` shares the same plaque; 40x40 double-hairline `SecondaryButton` More/Edit |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Load/Save-inspired rows: copper-rimmed hover wash + sliding left diamond tick + `+2px` slide; double electric amethyst selection rim + vertical scaling amethyst bar + popping top-left 4-point star flare; `RowHoverAction` + `RowHoverRoom` 38px clearance |
| `DerivedStyles/GridViewItemStyle.xaml`, `DerivedStyles/GridViewItemTemplate.xaml` | Codex tarot covers: `1.022` lift + 9-slice amethyst bloom + copper `CornerMarksTemplate` + top-left star flare on hover; electric amethyst rim + top/bottom diamond clasps on selection; 50x50 faceted octagonal `GridTileButton` medallions rising with `BackEase` `0.22` (`55ms` stagger) |
| **Running game** (`PlayButton.xaml`, `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `ListView.xaml`) | Dedicated **Lyrium Frost Cyan** (`RunningIndicatorBrush` `#147E9E` / `LocalLyriumLitBrush` `#6CE0FA`) frame + dark keyline: Launching sweeps a diagonal Lyrium band (`1.70s`, `EndPoint="1,0.22"`) + diamond-end-capped foot line + **3 cascading Lyrium Dagger diamond rune sockets** (`RunningRune1..3`); Running breathes calmly (`3.2s`) with staggered rune pulse and `Cancel` ONLY on `PlayButton` `IsMouseOver` (`RelativeSource Self`). `PlayRoom` & `RowRoom` reserve 38px right strips with `RunningMarkPlate` |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | Aubergine-plum double-hairline board (`LocalMenuBoardTemplate`, 4.5% `astrolabe-tile.png`, chamfered facets, centered top hollow-diamond crest), 30px rows, electric amethyst rim + sliding 4-point star flare + dotted copper leader + `+2px` alabaster label glide, 10px tapered diamond-centered group breaks, inverting solid-alabaster keycap shortcuts, rotated copper diamond rune-socket check marks, Veilguard crimson `Alt+Q` Exit (`>6.25:1`) |
| `DerivedStyles/StandardWindowStyle.xaml`, `DefaultControls/TreeView.xaml` | 44px `vg-void` dialog title band with Astrolabe-Hourglass Diamond crest, `Cinzel` uppercase title (`WindowSettings` -> `LOCSettingsLabel`), ghosted concentric Astrolabe Rings watermark in a zero-size `Canvas`, and copper diamond rule; minimal 28px bare `Segoe UI` TreeView rows (`WindowSettings` 250px, `WindowExtensions` 280px) with reserved `Visible` scroll lane |
| `DefaultControls/Button.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `TabControl.xaml`, `GroupBox.xaml` | Plum double-hairline buttons + rose-copper `Cinzel` `IsDefault` CTA (`Width==41` ThemeModifier scale trigger); copper-rimmed amethyst `CheckBox`; astrolabe-ring diamond `RadioButton`; Settings rotated-diamond double-outline `SliderThumb` with copper `<`/`>` ticks; diamond-end-capped `ProgressBar`; glowing hourglass `TabItemIndicatorTemplate`; content-sized double-hairline `GroupBox` |
| `DerivedStyles/PropertyItemButton.xaml`, `DerivedStyles/TextBlockGameScore.xaml` | Rose-copper text links, chamfered slate-plum `Tag="Chip"` badges (`ControlCornerRadius`), and engraved `Cinzel` bold score seals |

## Previews

`art/preview-details.html` and `art/preview-settings.html` render via `.\scripts\take-screenshots.ps1 -Extension vesperglass` against `src/tokens.css` (`var(--vg-*)` tokens, 0 hex drift, `layout ok`).

- **Signature motifs drawn:** pointed-hexagonal rose-copper `PLAY` plaque with 9-slice amethyst+copper bloom, corner star glints, and crystal sheen; Load/Save selected row with electric amethyst rim & 4-point star flare; Lyrium Frost Cyan running row with 3 Lyrium Dagger diamond runes; Vitality Emerald 4-point active filter star; glowing hourglass active view switch & tab indicator; diamond-end-capped progress bar; Codex Metadata Dossier with top hollow-diamond crest and engraved `Cinzel` score seals; 44px Settings title band with Astrolabe-Hourglass mark & ghosted concentric rings; Settings dotted-leader rows, rotated-diamond slider, and popup menu preview with inverting alabaster `F4` keycap.
- **Bundled fonts:** `Cinzel` (`Cinzel-Regular.ttf`, `Cinzel-Bold.ttf`, SIL OFL 1.1) in `src/Typography/`; previews use `Selawik` as the stand-in for `Segoe UI` and `Cascadia Mono` for `Consolas`.

## Deviations

- `HtmlTextView` (game descriptions) uses `Segoe UI` natively on Windows (consistent with the UI body font).
- Playnite's built-in menu icon glyphs (`ExitIcon`, `RemoveGameIcon`, `AddFavoritesIcon`) remain icofont glyphs recolored onto theme brushes.

## Not verified yet

- Interactive live Playnite check at 125% and 150% DPI scaling (`PlayButton` hover repeatability, `GridViewItemTemplate` hover fade-out, `CloseGameSideBarCommand` narrow-mode sticky scroll, and ThemeModifier live recolor).
