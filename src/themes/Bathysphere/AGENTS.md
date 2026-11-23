# Bathysphere — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) styled in **BioShock Infinite's Finkton / Vox Populi** dark industrial palette: wrought-iron charcoal cabinetry, oxidized copper-brass, deep Vox crimson selection plaques, weathered manifesto vellum dossiers, and electric cobalt Salts indicators. Unofficial fan theme; not affiliated with 2K Games, Take-Two Interactive, Irrational Games, or Cloud Chamber; contains no game art, official logos, copyrighted text, or proprietary font files.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference captures, palette measurements, typography notes, and franchise UI comparisons live in [`RESEARCH.md`](RESEARCH.md). Creative brief (ambition, Source DNA, 11-item game element map, hero & secondary moments, motion language, brand mark): [`BRIEF.md`](BRIEF.md).

## Tokens

Tokens live in `src/tokens.css` under `--bs-*`; `src/Constants.template.xaml` maps Playnite palette keys and shared keys by role.

| Token | Key | Used for |
|-------|-----|----------|
| `bs-abyss` (`#081113`) | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush`, `GameBannerTintBrush`, `ArtTintBrush`, `MainMenuButtonBackgroundBrush` | 44px compact rail, 52px top bar, 44px dialog title band, banner darkening tint |
| `bs-deep` (`#0D1A1D`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | Library workspace and game page submerged ocean lacquer base |
| `bs-well` (`#070F11`) | `InputBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush`, `CheckBoxCheckMarkBkBrush` | Recessed search, form inputs, slider and glass-tube progress tracks |
| `bs-panel` (`#112126`) / `bs-panel-alt` (`#162B31`) | `PopupBackgroundBrush`, `ExpanderBackgroundBrush`, `ButtonBackgroundBrush`, `TooltipBackgroundBrush`, `NormalBrush` | Deco menus, dropdown boards, cards, standard & secondary buttons, tooltips |
| `bs-brass` (`#C99A36`) / `bs-brass-hover` (`#DEB24E`) | `PrimaryButtonBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `FrameBrush`, `PopupBorderBrush`, `SliderThumbBackgroundBrush` | Pointed-hexagonal Play/Default CTA, Deco brass framing, BioShock 2 hacking needle thumb |
| `bs-gold` (`#E5BC5E`) / `bs-gold-hot` (`#F8DF9B`) | `GlyphBrush`, `FocusBrush`, `SelectedBorderBrush`, `TabItemIndicatorBrush`, `PrimaryButtonGlowBrush`, `GridViewItemHoverBorderBrush`, `LocalGoldHotBrush` | Art Deco linework, sunbursts, stepped corner marks, active markers, 9-slice hover bloom |
| `bs-teal-sel` (`#173E44`) / `bs-slate-pill` (`#2C4B59`) | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `TopPanelItemCheckedBackgroundBrush`, `HeaderBandBrush` | Deep Atlantic teal selection fills and Columbia riveted header plaque |
| `bs-eve` (`#1A69CC`) / `bs-eve-lit` (`#4BA3FF`) | `RunningIndicatorBrush`, `LocalEveLitBrush`, `LocalEveForegroundBrush` | Dedicated EVE / Salts Electric Cobalt hue reserved strictly for Launching & Running states |
| `bs-hack` (`#22D485`) / `bs-progress` (`#176953`) | `DataChangeNotifBrush`, `PositiveRatingBrush`, `ProgressBarForegroundBrush` | BS1 hacking pipe emerald active filter starburst, positive ratings, high-contrast progress tube fill |
| `bs-crimson` (`#A62626`) / `bs-crimson-fg` (`#FBF4E4`) | `DangerBrush`, `DangerForegroundBrush`, `NegativeRatingBrush` | Close button hover, `Alt+Q` Exit menu bar, negative ratings |
| `bs-vellum` (`#DFD0B4`) | `ParchmentBrush`, `ParchmentEdgeBrush` (`#7A6340`), `ParchmentTextBrush` (`#231B13`), `ParchmentLabelBrush` (`#594734`), `ParchmentLinkBrush` (`#144A52`) | 1912 Columbia cotton-rag vellum Archive Dossier and deep sepia/marine inks |
| `./Typography/#Pathway Gothic One` | `HeadingFontFamily` | Tall Art Deco condensed display titles, Play/Default CTAs, dialog title band, section headers |
| `./Typography/#Jost` | `FontFamily` | Futura-revival geometric UI body, library lists, Settings tree rows, metadata values (`Regular` + `Medium`) |
| `./Typography/#Cinzel` | `PosterFontFamily` | Columbia engraved score seals (`TextBlockGameScore`) |

`GameBannerTintBrush` uses `bs-abyss` (`#081113`), Rapture's darkest branded oceanic lacquer, so ThemeModifier banner darkening casts hero artwork into submerged deep-sea noir rather than flat grey.

## Component spacing (`src/Common.xaml`)

| Key | Value | Purpose |
|-----|-------|---------|
| `ControlHeight` | `32` | Shared form inputs, combos, and buttons (filter sidebar uses `28`) |
| `ButtonPadding` | `18,5` | Button inner padding |
| `InputPadding` | `10,5` | TextBox, PasswordBox, ComboBox inner padding |
| `GroupBoxPadding` | `14,12,14,14` | GroupBox inner padding |
| `IconSize` | `16` | Toolbar and rail icon size |
| `GameBannerHeight` | `300` | Default hero banner height (`0` to `600`) |
| `GameBannerDarken` | `0` | Default banner darkening (`0` to `1`) |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px `bs-abyss` left rail closed by a double brass/bronze edge, crowned by `PART_ElemMainMenu`, `LocalBathysphereMenuMarkTemplate` (Common.xaml, also the top bar's menu button): a brass airship porthole with four rivets and three steel venetian slats; hover tilts the slats open one after another over a faint Salts-blue glow; while the menu is open the blind draws up to the top of the window, the rim lights hot brass and a bright EVE core swells in and breathes; 44x40 items with ocean hover wash and deep Atlantic teal selection + 3px gold bar & chevron; transparent when `ShowBackgroundImageOnWindow` is True |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px `bs-abyss` top bar with subtle 4.5% Deco fan lattice and stepped gold diamond `DividerTemplate`; search (stepped brass corners, persistent magnifier) -> filter (8px Hacking Emerald 4-point starburst pip) -> sorting first -> icon-only view switches (34x34 uniform plates) -> notifications -> 12px silver-capped glass-tube `PART_ProgressGlobal`; 132px right caption clearance; `TopPanelMenu` inherits `ContextMenu` |
| `Views/Library.xaml` | Full-window `PART_ImageBackground` behind top bar and rail with soft bottom fade into `WindowArtSwatch` |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | 1px antique brass window border, `40x32` main window captions, `46x44` dialog captions with crimson close hover |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Side panels turning transparent on `ShowBackgroundImageOnWindow`; 28px filter controls and 28x28 preset buttons |

## Game page

- Both `Views/DetailsViewGameOverview.xaml` and `Views/GridViewGameOverview.xaml` dress the metadata pane as a **1912 Columbia Vellum Archive Dossier** (`ParchmentBrush`, subtle `vellum-grain.png`, double sepia hairline border, riveted Columbia slate-teal header bar, stepped brass outer bezel) with `GameDetailsPaneWidth` / `GridDetailsPaneWidth` set to `300` usable inner width and responsive `GameDetailsPanePosition` (default `Right`; `Left`, `Center`, `Stretch`) managed by `scripts/game-page-breakpoints.mjs`.
- Both overviews host `EmptyGameTemplate` (a riveted Bathysphere porthole framing the breathing Lighthouse mark and 16-ray sunburst over `LOCErrorNoGameSelected`) with `PART_ScrollViewHost` explicitly `Visibility="Visible"`.

## Components

| Playnite file | Franchise component |
|---------------|---------------------|
| `DerivedStyles/PlayButton.xaml` | BioShock 1 pointed-hexagonal 45° burnished imperial brass plaque (`LocalHexPlateTemplate`) with brushed-silver tip rivets, 9-slice brass `bloom.png`, and animated diagonal Deco glint sweep on hover; `Tag="ContextAction"` shares the same plate |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Animated brass-tinted ocean hover wash + sliding left gold tick + label nudge; Atlantic teal selected bar framed in antique gold + springing left Deco chevron + confirmation glint; `RowHoverAction` with `RowHoverRoom` 38px clearance |
| `DerivedStyles/GridViewItemStyle.xaml`, `DerivedStyles/GridViewItemTemplate.xaml` | Animated cover lift (`1.02`), warm 9-slice brass bloom & sliding stepped Deco corner brackets on hover; double-hairline antique brass frame + golden top/bottom diamond clasps on selection; 50x50 riveted octagonal `GridTileButton` medallions rising with `BackEase` 0.24 (`55ms` stagger) |
| **Running game** (`PlayButton.xaml`, `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `ListView.xaml`) | Dedicated **EVE / Salts Electric Cobalt** (`RunningIndicatorBrush` `#1A69CC` / `LocalEveLitBrush` `#4BA3FF`) frame + dark keyline: Launching sweeps an angled cobalt EVE surge (`1.65s`) + BioShock Infinite 12-segment Salts foot meter (`LocalSaltsSegmentMaskBrush`) + 3 staggered rising EVE bubbles (`RunningMote1..3`); Running breathes calmly (`3.2s`) with steady Salts bar and `Cancel` ONLY on `PlayButton` `IsMouseOver` (`RelativeSource Self`). `PlayRoom` reserves 36px right strip and `RowRoom` reserves 36px right strip with `RunningMarkPlate` |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | Stepped-corner Rapture verdigris-lacquer board (`LocalMenuBoardTemplate`, 5% `deco-fan.png`), 30px rows, BioShock 1 pointed-hexagonal teal/brass highlight (`LocalMenuHexPlateTemplate`) + sliding Art Deco chevron cursor + `+2px` label glide, 10px double-rule 3-ray sunburst group break, brass-bracketed condensed shortcuts, porthole starburst checked mark, crimson `Alt+Q` Exit |
| `DerivedStyles/StandardWindowStyle.xaml`, `DefaultControls/TreeView.xaml` | 44px `bs-abyss` dialog title band with Lighthouse-Porthole crest, uppercase `Pathway Gothic One` title (`WindowSettings` -> `LOCSettingsLabel`), ghosted Rapture Art Deco skyscraper skyline watermark in a zero-size `Canvas`, and stepped double brass rule; minimal 28px bare `Jost` TreeView rows (`WindowSettings` 250px, `WindowExtensions` 280px) with reserved `Visible` scroll lane |
| `DefaultControls/Button.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `TabControl.xaml`, `GroupBox.xaml` | Oceanic steel buttons + riveted brass `IsDefault` CTA (`Width==41` ThemeModifier scale trigger); chamfered brass CheckBox; circular riveted porthole RadioButton; BioShock 2 diamond-tipped hacking-needle Slider (`12x20` thumb); brushed-silver end-capped glass-tube ProgressBar; stepped gold diamond `TabItem`; content-sized stepped-corner `GroupBox` |
| `DerivedStyles/PropertyItemButton.xaml`, `DerivedStyles/TextBlockGameScore.xaml` | Deep marine-teal links (`ParchmentLinkBrush`), dark brass-rimmed `Tag="Chip"` taxonomy badges, and engraved `Cinzel` bold score seals on the 1912 Columbia vellum dossier |

## Previews

`art/preview-details.html` and `art/preview-settings.html` render via `.\scripts\take-screenshots.ps1 -Extension bathysphere` against `src/tokens.css` (`var(--bs-*)` tokens, 0 hex drift).

- **Signature motifs drawn:** pointed-hexagonal burnished imperial brass `PLAY` bar with brushed-silver tip rivets and 9-slice brass bloom; 1912 Columbia vellum Archive Dossier with riveted slate-teal header plaque and engraved `Cinzel` score seals; EVE/Salts Cobalt running row with 12-segment Salts foot meter and rising EVE bubbles; Hacking Emerald 8px starburst active filter pip; 12px silver-capped glass-tube global progress bar; 44px dialog header with Lighthouse-Porthole crest and ghosted Rapture Art Deco skyline; BioShock 2 diamond-tipped hacking-needle slider; stepped-corner Deco popup menu with pointed-hexagonal highlight and 3-ray sunburst group break.
- **Bundled fonts:** `Pathway Gothic One` (`Regular`, unmodified OFL), `Jost` (`Regular`, `Medium`, OFL), and `Cinzel` (`Bold`, OFL) live in `src/Typography/`.

## Deviations

- Game descriptions (`PART_HtmlDescription`) bind `{DynamicResource FontFamily}` (`Jost`), while Playnite's CEF/HTML view falls back to `Segoe UI` if bundled local TTFs are unavailable inside the embedded browser.
- Playnite's built-in menu icon glyphs (`ExitIcon`, `RemoveGameIcon`, `AddFavoritesIcon`) remain icofont glyphs recolored onto theme brushes.

## Not verified yet

- Interactive live Playnite check at 125% and 150% DPI scaling (`PlayButton` hover repeatability, `GridViewItemTemplate` hover fade-out, `CloseGameSideBarCommand` narrow-mode sticky scroll, and ThemeModifier live recolor).
