# Cropmark

## 1. What this is
**Cropmark** is a **light** `Showcase` Playnite Desktop theme built on a Bristol comic-production illustration board aesthetic inspired by *Marvel Tōkon: Fighting Souls* (Arc System Works / Sony Interactive Entertainment).

Unofficial fan theme; not affiliated with or endorsed by Marvel, Arc System Works Co., Ltd., or Sony Interactive Entertainment Inc. Uses an original abstract name (`Cropmark`), an original geometric cropmark/spark brand mark, zero official assets/logos, and ships `info/NOTICE-Cropmark.txt`.

## 2. Sources
- Reference research, pixel measurements, and contrast table: [RESEARCH.md](RESEARCH.md)
- Creative brief, candidate lenses, element map, and signature levers: [BRIEF.md](BRIEF.md)
- Bundled static OFL fonts in `src/Typography/` (subsetted to Latin + Cyrillic):
  - `Anton-Regular.ttf` (`OFL-Anton.txt`, OFL-1.1) — compressed ALL-CAPS display headings (`HeadingFontFamily`).
  - `BarlowCondensed-SemiBold.ttf`, `BarlowCondensed-Bold.ttf`, `BarlowCondensed-BoldItalic.ttf` (`OFL-BarlowCondensed.txt`, OFL-1.1) — condensed labels, buttons, and bold-italic selected rows (`LocalCondensedFontFamily`).
- Windows system fonts: `Segoe UI` (`FontFamily`, preview stand-in `Selawik`) and `Consolas` (`MonospaceFontFamily`, preview stand-in `Cascadia Mono`).
- Procedural white-mask RGBA sprites in `src/Images/fx/` generated deterministically by `art/sprites.py` (`marker-stroke.png`, `paper-grain.png`, `backing-edge.png`, `halftone-corner.png`).

## 3. Tokens
Defined in `src/tokens.css` (`--cm-*`) and mapped in `src/Constants.template.xaml`:
- **Surfaces**: `ContentBackgroundBrush` / `WindowBackgourndBrush` / `GameBannerTintBrush` = `--cm-paper` (`#ECE3D6`, light Bristol rag paper so ThemeModifier banner darkening washes hero art cleanly into the warm board); `PopupBackgroundBrush` / `TopPanelBackgroundBrush` / `InputBackgroundBrush` = `--cm-paper-hi` (`#F5EFE5`); `ShellBackgroundBrush` = `--cm-paper-well` (`#E1D6C5`).
- **Ink & Backing**: `TextBrush` / `NormalBorderBrush` = `--cm-ink` (`#26291F`, 11.64:1 on paper); `TextBrushDarker` = `--cm-ink-muted` (`#575B4D`, 5.49:1); `PrimaryButtonBackgroundBrush` / `LocalBackingPaperBrush` / `TooltipBackgroundBrush` = `--cm-charcoal` (`#2D3024`); `SelectedForegroundBrush` = `--cm-ink-deep` (`#1D2016`).
- **Accents**: `GlyphBrush` / `SelectedBrush` / `ListItemSelectedBrush` / `MenuItemHoverBrush` / `DataChangeNotifBrush` = `--cm-orange` (`#FF7916`, textured Comic Marker Orange; 6.30:1 with deep ink); `LocalDraftingTabBrush` / `TabItemIndicatorBrush` / `TopPanelItemCheckedBackgroundBrush` = `--cm-blue-tab` (`#81B7D5`, 7.61:1 with deep ink); `LocalCropGuideBrush` = `--cm-blue-guide` (`#6BA7CC`); `FocusBrush` = `--cm-blue-vivid` (`#008FE0`); `LinkBrush` = `--cm-blue-link` (`#005F99`, 5.40:1 on paper).
- **Status**: `RunningIndicatorBrush` = `--cm-punish` (`#00756B`, HUD Punish! Teal — distinct from charcoal Play, orange selection, and sky-blue tabs); `DangerBrush` = `--cm-crimson` (`#C11A21`, 5.34:1 with paper-white); `PositiveRatingBrush` = `--cm-green` (`#1C8A42`); `MixedRatingBrush` = `--cm-gold` (`#D98200`).
- **Light-theme window art flip**: `WindowArtForegroundBrush` = `--cm-paper-hi` (`#F5EFE5`) flips unselected library rows, Expander/group headers, sidebar/top-bar glyphs, and game page titles/text while `ShowBackgroundImageOnWindow=True`.
- **Radii**: `ControlCornerRadius` = `0`, `CornerRadiusSmall` = `0`, `CornerRadiusLarge` = `2`, `CornerRadiusFull` = `9999` (1:1 circular badges & radio buttons only).

## 4. Component spacing
Defined in `src/Common.xaml`:
- `ControlHeight = 32` (filter sidebar overrides to 28px), `IconSize = 16`, `GameBannerHeight = 300`, `GameBannerDarken = 0`.
- `ButtonPadding = 14,4`, `InputPadding = 9,4`, `MenuPadding = 12,6,6,6`, `MenuItemPadding = 10,4`, `ComboBoxDropDownPadding = 12,5,5,5`, `ComboBoxItemPadding = 10,4`, `ListBoxItemPadding = 10,5`, `GroupBoxPadding = 12,10,12,12`, `TooltipPadding = 10,6`.

## 5. Shell
- **Sidebar (`Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml`)**: 44px recessed Bristol rail closed by a `1.5px` charcoal ink seam; crowned by a 44x48 charcoal Main Menu tile with a 4px Marker Orange drop-bar and Cropmark reticle. Selected items fill non-photo sky-blue (`#81B7D5`) with a 4px Marker Orange rail edge bar.
- **Top panel (`Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml`)**: 48px Bristol sheet closed by a 2px ink rule, subtle paper grain, and `=|+|=` registration mark. Search (32px with blue bottom-right drafting lip and persistent magnifier) -> Filter toggle (8x9 notched Marker Orange bookmark pip, zero text label) -> Sorting first, icon-only Details/Grid/List switches (sky-blue active plate + 3px orange foot), Group, View Settings -> Notifications -> 12px `PART_ProgressGlobal`.
- **Window chrome (`DerivedStyles/MainWindowStyle.xaml`, `StandardWindowStyle.xaml`, `WindowBarButton.xaml`)**: 44px Bristol dialog title band with 5px orange edge stripe, Cropmark brand mark badge, `Anton` title, `=|+|=` registration tick, subtle Ben-Day halftone corner (in a zero-size `Canvas`), and 46x44 caption buttons.

## 6. Game page
Generated by `art/gen-overviews.mjs` + `scripts/game-page-breakpoints.mjs`:
- **Hero banner**: comic-panel `2px` top/left/right charcoal frame + non-photo blue corner cropmarks + centered `=|+|=` mark + warm paper foot fade (`GameBannerHeight = 300`, reaching solid Bristol paper by `78%`; proportional spacers `x * 238 / 300` floor `20` on Details and `x * 218 / 300` floor `14` on Grid so the title and action buttons sit cleanly over solid paper).
- **Header & actions**: `Anton` display title over 2px ink rule; `PlayButton` charcoal ink slab with 10px Marker Orange drop-block, 3px orange offset lip, diagonal marker sheen & expanding blue corner crops on hover; equal 40x40 icon-only `SecondaryButton` More & Edit.
- **Metadata pane**: 300px usable inner width (`GameDetailsPaneWidth` / `GridDetailsPaneWidth`) inside a Bristol Production Ledger (`#F5EFE5`) over a 6px bottom-left charcoal construction-paper backing lip, with non-photo blue group rules and `GameDetailsPanePosition` (`Left` / `Center` / `Stretch` / `Right`).
- **Grid side panel close button**: custom 28x28 inked Bristol stamp with 2px charcoal offset lip, blue corner pip, and Issue Crimson hover; inline sticky left of icon below 120px banner height or when `ShowBackgroundImageOnWindow=True`, top-left corner at >= 120px and on null game.
- **Running game indicator**: Punish! Teal (`#00756B`) across details row, list view row, cover tile (inset 4px + 16px foot tape), and Play/ContextAction slab (`RunningActionIndicator`). Angled `1.55s` sweep (`EndPoint="1,0.3"`) + foot fill + 3 skewed comic spark bars while launching; `3.0s` breathing idle while running; `Cancel` on `RUNNING + hover` (`RelativeSource Self`).

## 7. Components
- **Menus & ComboBox (`ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`)**: `LocalMenuBoardTemplate` perforated tear-off Bristol notepad with vertical dashed seam, 3px charcoal offset backing, blue trim bar + `=|+|=` crown, 30px rows with textured Marker Orange wipe + charcoal triangle pointer, dashed blue `||` fold breaks, monochrome ink-ring key-prompt pills, sky-blue inked check boxes, and Issue Crimson Exit (`Alt+Q`).
- **Settings tree (`TreeView.xaml`)**: bare 28px `Segoe UI` lines, paper-shadow hover wash, sky-blue selected wash + 3px Marker Orange left bar, reserved vertical scrollbar lane (`Visible`) in `WindowSettings` (256px) / `WindowExtensions` (276px).
- **Controls**: `OPTIONS` bottom-edge charcoal `Slider` with square orange thumb (disables `GameBannerHeight` & `GameBannerDarken` under window art), `OPTIONS` sky-blue `TabControl` (header colors on `HeaderText` `TextBlock`), sharp inked `CheckBox` / circular `RadioButton`, `EPISODE` blue `ProgressBar`, drafting ruler `ScrollViewer`, content-sized charcoal-backed `GroupBox`, stamped inked `PropertyItemButton` chips, `RESULTS`-inspired `TextBlockGameScore` plaques.

## 8. Previews
- `art/preview-details.html` -> `art/screenshot-details.png` and `art/preview-settings.html` -> `art/screenshot-settings.png`.
- Motifs showcased: Bristol rag paper + sumi-olive ink panels, non-photo blue `COPY AREA // TRIM` + `=|+|=` registration guides, textured Marker Orange italic row selection, Punish! Teal running row, EPISODE charcoal-and-orange hovered Play slab with expanding blue crop ticks, charcoal-backed metadata ledger with dashed blue breaks, and cyanotype blueprint backdrop behind the Settings window.
- Preview font stand-ins: `Segoe UI` -> `Selawik`, `Consolas` -> `Cascadia Mono`; `Anton` and `Barlow Condensed` render with the exact bundled OFL families.

## 9. Deviations & Notes
- Playnite's `RunningIndicatorRegressionTests.ps1` and `RunningLabelOverlapRegressionTests.ps1` harness does not strip `{MainViewModel StartGameCommand}` from `DetailsViewItemStyle.xaml`'s mandatory `RowHoverAction` block (shared repo-wide behavior); cover tile, list view row, game page action button, label contrast (4.74:1 launching, 5.9:1 running), and 32-bit `MenuRender.ps1` all pass.
