# Swallowtail — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the nocturnal Caribbean theater menus and storybook craft of **Return to Monkey Island (2022)** (Terrible Toybox / Devolver Digital / Lucasfilm Games). Dark variant (`Showcase` ambition).

Swallowtail is an **unofficial, fan-made community theme** and is not affiliated with, endorsed by, or sponsored by Terrible Toybox, Devolver Digital, or Lucasfilm Ltd. All vector marks, bespoke `Icon<Role>` geometries, procedural FX masks, and XAML templates are original works; no game assets, logos, or trademarks are shipped. See [`info/NOTICE-Swallowtail.txt`](info/NOTICE-Swallowtail.txt).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **[`../AGENTS.md`](../AGENTS.md)**. Loading rules and build checks: **[`docs/themes/reference.md`](../../../docs/themes/reference.md)**.

## Sources

Reference captures, sampled swatches, typography stand-ins, and motion observations are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (candidate lenses, source DNA, 11-row game element map, 6 shell/game-page levers, menu & running-motion signatures, brand): [`BRIEF.md`](BRIEF.md).

## Tokens

`src/tokens.css` holds Return to Monkey Island's measured palette under `--rtmi-*` names; `src/Constants.template.xaml` maps them to Playnite palette and shared keys (`scripts/data/theme-keys.json`):

| Token (`tokens.css`) | Key | Used for |
| --- | --- | --- |
| `--rtmi-stage-void` (`#070C12`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `ScrimBrush` | Nocturnal theater stage backdrop & running scrim |
| `--rtmi-harbor-deep` (`#0B1924`) | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush`, `ScrollBarTrackBrush` | Sidebar rail, top bar, Settings title band & tree |
| `--rtmi-curtain-shadow` (`#0F2736`) | `MainColorDark`, `PopupBackgroundBrush`, `ExpanderBackgroundBrush`, `TooltipBackgroundBrush`, `PropertyItemBackgroundBrush`, `SecondaryButtonBackgroundBrush` | Harbor Dossier card, popup menu board, cards, tooltips, chips |
| `--rtmi-aqua-dark` (`#0F4157`) | `MainColor`, `ButtonBackgroundBrush`, `GameBannerTintBrush`, `ArtTintBrush` | Dark Aqua curtain drapes, button plates, branded banner darkening tint (solid dark Caribbean aqua, never plain black) |
| `--rtmi-aqua-deep` (`#156487`) | `NormalBorderBrush`, `PopupBorderBrush`, `PanelSeparatorBrush`, `HeaderBandBrush`, `SlotBorderBrush`, `ScrollBarThumbBrush`, `TopPanelItemCheckedBackgroundBrush` | Wavy swallowtail title & dossier ribbons, pinched Save-slot frames, stepper `<` `>` wedges, borders |
| `--rtmi-aqua-pale` (`#3CA3CC`) | `LinkBrush` | Metadata links, ribbon spiral flourish highlight, ComboBox wedge arrow |
| `--rtmi-satchel-leather` (`#231D16`) | `InputBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `ProgressBarTrackBrush` | Stitched espresso-leather Inventory Satchel wells & menu shortcut tags |
| `--rtmi-satchel-stitch` (`#4A3B2B`) | `WindowPanelSeparatorBrush`, `SliderTrackBrush` | Dashed leather stitching & subtle horizontal dividers |
| `--rtmi-hover-curtain` (`#143649`) | `HoverBrush`, `ListItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` | Nocturnal harbor hover wash |
| `--rtmi-selected-curtain` (`#133E54`) | `SelectedBrush`, `ListItemSelectedBrush` | Selected row, sidebar item & Settings tree plate |
| `--rtmi-menu-highlight` (`#154963`) | `MenuItemHoverBrush` | Popup menu & ComboBox highlight plate |
| `--rtmi-gold` (`#E4B217`) | `GlyphBrush`, `PrimaryButtonBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `GridViewItemSelectedBorderBrush`, `FocusBrush`, `GiltBrush`, `HeadingForegroundBrush`, `WindowTitleForegroundBrush` | Curled gold Play ribbon, main-menu crest tile, checked octagon diamond core, title serif, selected rail bar |
| `--rtmi-gold-bright` (`#F5CE4B`) | `PrimaryButtonHoverBackgroundBrush`, `GiltHotBrush`, `CheckBoxHoverBorderBrush` | Play hover warmth, sunlit gold highlights |
| `--rtmi-gold-deep` (`#B8870B`) | `PrimaryButtonPressedBackgroundBrush`, `PrimaryButtonBorderBrush` | Folded underside shadow of curled gold ribbon |
| `--rtmi-bronze` (`#BF620F`) | `DataChangeNotifBrush`, `WarningBrush` | Top-bar rotated filter active diamond pip & warnings |
| `--rtmi-bronze-bright` (`#E07D24`) | `SliderHoverForegroundBrush`, `MixedRatingBrush`, `TitleSuffixBrush` | Slider filled track, mixed score, shortcut key label |
| `--rtmi-crimson` (`#D4343B`) | `DangerBrush`, `NegativeRatingBrush` | Save-slot overwrite crimson: close hovers, Exit (`Alt+Q`), negative scores |
| `--rtmi-ectoplasm` (`#137A59`) | `RunningIndicatorBrush` | Ghost-Ship Emerald running/launching frame, plate & wisps (distinct hue from gold Play, teal select, bronze filter, crimson danger) |
| `--rtmi-ectoplasm-bright` (`#34C796`) | `PositiveRatingBrush` | Launching comet glint, seafoam tide fill, positive scores |
| `--rtmi-ivory` (`#F7F5EE`) | `TextBrush`, `SelectedForegroundBrush`, `DangerForegroundBrush`, `CheckBoxBorderBrush`, `GridViewItemHoverBorderBrush` | Primary readable text, notched-octagon checkbox frame, hovered Save-slot frame |
| `--rtmi-mist` (`#9DB5C2`) | `TextBrushDarker`, `SidebarItemForegroundBrush`, `TabItemForegroundBrush` | Secondary captions & muted rail icons |
| `--rtmi-ink-dark` (`#14110C`) | `TextBrushDark`, `PrimaryButtonForegroundBrush`, `MainMenuButtonForegroundBrush` | Sepia ink on Pirate Gold ribbons |

- **Radii:** `CornerRadiusSmall` `3`, `ControlCornerRadius` `4`, `CornerRadiusLarge` `6`, `CornerRadiusXLarge` `10`, `CornerRadiusFull` `9999` (1:1 squares/circles only).
- **Fonts:** `FontFamily` = `./Typography/#Nunito, Nunito, Segoe UI` (bundled static `Nunito-Regular.ttf` + `Nunito-Bold.ttf`, SIL OFL 1.1); `HeadingFontFamily` = `Constantia, Georgia` (Title-Case storybook serif; HTML previews draw it with bundled OFL stand-in `Gelasio`); `MonospaceFontFamily` = `Consolas` (HTML previews draw with `Cascadia Mono`).

## Component spacing (`src/Common.xaml`)

| Key | Value | Source spec |
| --- | --- | --- |
| `ControlHeight` | `32` | Repo 32px form-row baseline (`28px` in `FilterPanelView.xaml`) |
| `ButtonPadding` / `InputPadding` | `14,4` / `10,4` | 4px vertical padding paired with `1.5px` borders keeps `32px` alignment |
| `MenuPadding` / `MenuItemPadding` | `6,6` / `8,4` | Compact 30px popup menu rows inside swallowtail board |
| `GroupBoxPadding` / `TooltipPadding` | `12,10` / `10,6` | Harbor dossier & contextual prompt pill spacing |
| `IconSize` | `16` | Compact 44px rail & 34px toolbar glyphs |
| `GameBannerHeight` / `GameBannerDarken` | `300` / `0` | Nocturnal stage banner band with ThemeModifier darkening |

## Shell

| File | What it draws |
| --- | --- |
| `Views/Sidebar.xaml` | 44px harbor rail with `curtain-drape.png` wash, `1.5px` Deep Aqua edge, `44×50` Curled Pirate Gold Main Menu tile (folded bottom-right lip) holding the treasure-map mark (`LocalSwallowtailMenuMarkTemplate`, shared with `TopPanel.xaml`: hover unrolls the map, rolls spring apart and the sheet stretches; while the menu is open the ink rows fade, a dotted route marches to a crimson X that stamps down and breathes), and winged-flourish colophon at foot |
| `CustomControls/SidebarItem.xaml` | `44×40` cell (`Padding="14,10"`, never stacked with `IconPadding`); hover washes nocturnal teal; selected locks harbor-teal plate with `3px` Pirate Gold bar & pennant notch |
| `Views/TopPanel.xaml` | 50px harbor bar closed by a `1.5px` Deep Aqua seam with centered miniature gold skull; strict order Search -> Filter (`8×8` rotated Burnt Bronze diamond `TextFilter`) -> `PART_PanelMainItems` (Sorting col 0, icon-only view switches) -> Plugin items -> `12px` `PART_ProgressGlobal` -> Notifications -> 136px caption clearance; `TopPanelMenu` `BasedOn` `ContextMenu` |
| `CustomControls/SearchBox.xaml` | 32px stitched espresso-leather satchel well with inner dashed seam, persistent magnifier `Glyph` outside `PART_SeachIcon`, full-hit transparent `PART_ClearTextIcon` |
| `Views/Library.xaml` | Full-strength `PART_ImageBackground` spanning `TopPanel` and reaching under the `44px` rail (`-44` / `-56`), fading smoothly into `WindowArtSwatch` |
| `DerivedStyles/MainWindowStyle.xaml` | `44×48` harbor caption buttons (Overwrite Crimson close hover), `MainMenuButton`, and `TopPanelSearchBox` |

## Game page

Generated deterministically by `node src/themes/Swallowtail/art/gen-overviews.mjs` (which runs `scripts/game-page-breakpoints.mjs` automatically for `GameDetailsPanePosition` `Left` / `Center` / `Stretch` / `Right` and `900+` / `560–899` / `<560` breakpoints):

- **Banner (`HeroArt`, `GameBannerHeight="300"`):** `PART_ImageBackground` + `GameBannerTintBrush` (`#0F4157` Dark Aqua + 50% floor) + top-left/right `curtain-drape.png` drapes + plain vertical gradient fade to `PageRoot.Background.Color` (no `OpacityMask` behind animated PlayButton). Proportional spacers: `x * 204 / 300` (floor `18`) in Details, `x * 196 / 300` (floor `14`) in Grid.
- **Metadata Dossier (`GameDetailsPaneWidth="300"` / `GridDetailsPaneWidth="300"`):** Crowned by a `22px` wavy Deep Aqua swallowtail ribbon (`LocalSwallowtailRibbonTemplate` + `ribbon-swirl.png`) holding the Pirate Gold `BrandMarkTemplate` crest, framed in `1.5px` Deep Aqua with flared corner ticks and `4%` gouache grain; separated by `10px` Pause-menu golden skull-centered `DividerTemplate` breaks.
- **Grid close button (`SidePanelCloseButton`):** Custom `28×28` RTMI notched-octagon harbor-teal bezel turning Save-slot Overwrite Crimson on hover; switches inline left of the game icon below `GameBannerHeight=120` or while `ShowBackgroundImageOnWindow=True`.
- **Empty state (`EmptyGameTemplate`):** Nocturnal curtained harbor stage with breathing lantern halo, `BrandMarkTemplate`, gold `Constantia` `LOCErrorNoGameSelected`, golden skull divider, and ivory winged-flourish colophon (`PART_ScrollViewHost` explicitly `Visibility="Visible"`).

## Components

| Playnite file | Return to Monkey Island element |
| --- | --- |
| `DerivedStyles/PlayButton.xaml` | Curled Pirate Gold `Back`/`OK` ribbon CTA (`gold-glint.png` hover sweep, folded underside corner, `BackEase` lift) + `RunningActionIndicator` |
| `DerivedStyles/DetailsViewItemStyle.xaml` | Dialogue & Pause list rows (nocturnal teal hover + sliding aqua wedge + `RowHoverAction` Play/Install; selected harbor-teal plate + springing `3px` gold rail + gold diamond pip) |
| `DerivedStyles/GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml` | Load/Save 3×3 pinched concave cover frames (Deep Aqua idle -> crisp Ivory hover -> Pirate Gold selected + bottom teal notch ribbon) + `50×50` notched-octagon `GridTileButton` medallions |
| `DefaultControls/CheckBox.xaml` | Display / Text & Language white 8-corner notched-octagon outline with springing solid Pirate Gold diamond core |
| `DefaultControls/Slider.xaml` | Sound screen `<` `>` Deep Aqua wedge caps flanking stitched track, Burnt Bronze range, rotated gold diamond thumb + ThemeModifier banner slider disable triggers |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | Unified `LocalSwallowtailMenuBoardTemplate` (harbor night-stage board, wavy 7px Deep Aqua ribbon + rising gold shield crest, flared corner ticks, 30px harbor-teal gold-hairline highlight rows, golden skull separators, stitched leather shortcut tags, Crimson `Alt+Q` Exit, notched-octagon checkmarks) |
| `DerivedStyles/StandardWindowStyle.xaml` & `DefaultControls/TreeView.xaml` | 44px harbor title band crowned by wavy Deep Aqua swallowtail ribbon + `BrandMarkTemplate` + gold `Constantia` title (`WindowSettings` -> `LOCSettingsLabel`); bare 28px `Nunito` tree rows with reserved scroll lane (`252px`/`280px`) |
| `DerivedStyles/PropertyItemButton.xaml` & `TextBlockGameScore.xaml` | Notched harbor-teal chips with Pirate Gold diamond pips & Trivia-card `Constantia` score plaques |
| **Running game** (`PlayButton`, `DetailsViewItemStyle`, `GridViewItemStyle`, `ListView`) | **Ghost-Ship Emerald (`#137A59` / glint `#34C796`)**: angled spectral mist comet sweep (`EndPoint="1,0.3"`) + double-notched seafoam tide foot bar (`RunningFill`) + **3 drifting ghost-lantern diamond wisps** flaring on launch (`1.6s` loop) and gently bobbing on harbor water while running (`3.2s` loop); `PlayRoom` (`34px`) & `RowRoom` (`42px` + `RunningMarkPlate`) keep wisps clear of labels; `Cancel` on `IsRunning` + button `Self` hover |

## Previews

`art/preview-details.html` and `art/preview-settings.html` render to `art/screenshot-details.png` and `art/screenshot-settings.png` via `scripts/take-screenshots.ps1 -Extension swallowtail` (1280×720, zero hex drift, zero system font warnings).

- **Signature motifs drawn:** Curled Pirate Gold Play ribbon with lantern sheen (staged hovered), wavy Deep Aqua swallowtail ribbons with spiral flourishes, night-harbor theater curtains, pinched concave Save-slot frames, Pause-menu golden skull-centered hairlines, white notched-octagon + gold-diamond checkboxes, Deep Aqua `<` `>` wedge slider with Burnt Bronze readout, stitched espresso-leather inputs, and Ghost-Ship Emerald running row with 3 lantern wisps.
- **Stand-in fonts:** `Constantia` renders via bundled SIL OFL `Gelasio` and `Consolas` via `Cascadia Mono` in Chromium (`scripts/data/fonts.json`); `Nunito` is bundled identically in `src/Typography/` and `scripts/fonts/nunito/`.

## Deviations

- Playnite Settings checkboxes place labels to the right of the control (`CheckBox` content presenter) rather than Return to Monkey Island's full-width right-aligned toggle column; Swallowtail preserves the authentic white notched-octagon + gold diamond geometry in standard left-aligned form flow so every Playnite & plugin dialog stays consistent.
- Return to Monkey Island's `<` `>` stepper controls map onto Playnite's native `Slider` (flanking `<` `>` wedges + Burnt Bronze range + gold diamond thumb) and `ComboBox` (stitched leather input + Deep Aqua wedge chevron) to preserve continuous dragging and long option lists.

## Not verified yet

- Live Windows Playnite Desktop runtime checks & WPF regression scripts (`tests/wpf/*RegressionTests.ps1`, `RunningMotionFrames.ps1`, 32-bit `MenuRender.ps1`, `%APPDATA%\Playnite\playnite.log` startup inspection) — authored and validated on macOS; run on Windows Playnite before release.
