# Arcfolio — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, dark painted editorial variant) inspired by **Metaphor: ReFantazio** (2024). Unofficial community fan theme — not affiliated with or endorsed by ATLUS, Studio Zero, or SEGA; ships `info/NOTICE-Arcfolio.txt`, original vector marks, procedural FX masks, and bespoke icons with no owner logos or game assets.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, 13 measured Game UI Database captures (`id=1970`), pixel-sampled hex values, and typography/asset records live in [`RESEARCH.md`](RESEARCH.md). Creative brief (lenses, Source DNA, focal hierarchy, 6 game-page levers, 7 popup menu levers, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

Measured in `src/tokens.css` (`.dark`) and mapped into `src/Constants.template.xaml`:

| Token | Key | Used for |
|-------|-----|----------|
| `--af-canvas` (`#102224`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | Deep painted verdigris-petrol library & page canvas |
| `--af-shell-rail` (`#0B1618`) | `ShellBackgroundBrush`, `PopupBackgroundBrush` | 44px compact rail & unified popup menu board |
| `--af-shell-top` (`#0D1A1C`) | `TopPanelBackgroundBrush`, `TabControlHeaderBackgroundBrush` | 50px top bar & tab strip |
| `--af-surface-deep` (`#0D1C1E`) | `ExpanderBackgroundBrush`, `SecondaryButtonBackgroundBrush` | Metadata ledger, filter/explorer panels, More/Edit plates |
| `--af-banner-tint` (`#0D2225`) | `GameBannerTintBrush` | Solid deep verdigris ink banner darkening color (ThemeModifier-editable) |
| `--af-paper` (`#F4F1EA`) / `--af-paper-ink` (`#11181A`) | `ParchmentBrush`, `TooltipBackgroundBrush`, `PropertyItemBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush` / `ParchmentTextBrush` | Stark chalk-ivory paper slips: active view switches, active tabs, metadata chips, `NO.01` score plaques, torn-edge tooltips, default Save/OK buttons |
| `--af-carmine` (`#C92446`) / `--af-carmine-hover` (`#D92B4E`) | `PrimaryButtonBackgroundBrush`, `DangerBrush` / `PrimaryButtonHoverBackgroundBrush` | Hero Carmine Rose-Crimson gouache Play CTA brushstroke, destructive Exit/Close hover |
| `--af-teal` (`#117E86`) / `--af-teal-bright` (`#22B5BD`) | `GlyphBrush`, `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush` / `FocusBrush`, `LinkBrush`, `ProgressBarForegroundBrush` | Verdigris Cyan-Teal gouache selection brushstroke (details rows, Settings tree, popup menus), sliders, links |
| `--af-gold` (`#D6A618`) / `--af-gold-ink` (`#101718`) | `RunningIndicatorBrush` / `LocalGoldInkBrush` | Royal Quest Gold running & launching sweeps, stepping Quest Rank diamonds (`◇ ◆ ◇`), running Play plate |
| `--af-emerald` (`#24BC70`) | `DataChangeNotifBrush`, `PositiveRatingBrush` | Rotated 9px Quest-diamond active filter mark, positive score accent |
| `--af-radius-sm` (`1px`) | `ControlCornerRadius` | Razor-sharp rectilinear architectural plates contrasted against organic gouache brush masks |
| `Georgia, Palatino Linotype, Segoe UI` | `FontFamily` | Editorial transitional serif body & list text (`Gelasio` OFL stand-in in previews) |
| `./Typography/#Cinzel, Cinzel, Georgia` | `HeadingFontFamily` | Bundled static `Cinzel` Regular & Bold (OFL-1.1, subset to Latin + Cyrillic) for monumental titles & headings |

## Component spacing (`src/Common.xaml`)

| Key | Value | Basis |
|-----|-------|-------|
| `ControlHeight` | `32` | Repo form-height mandate across inputs, combos, and buttons (28px in filter sidebar) |
| `ButtonPadding` / `InputPadding` | `16,5` / `10,5` | Aligns serif text vertically at 32px with 1px architectural borders |
| `MenuPadding` / `MenuItemPadding` | `4,6` / `10,0` | Compact 30px menu rows inside the chalk-spined obsidian board |
| `TooltipPadding` | `12,8` | Comfortable margin inside the torn chalk-paper tooltip (`paper-torn.png`) |
| `IconSize` / `GameBannerHeight` / `GameBannerDarken` | `16` / `320` / `0` | Standard icon scale, default dry-brush banner height, 0% default darken |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Library.xaml` | Deep verdigris canvas + `LocalArcfolioBackdropOverlay` (diagonal impasto wash + burgundy edge gradient); full-strength `PART_ImageBackground` spanning TopPanel and under the 44px rail with soft fade into `WindowArtSwatch` |
| `Views/Sidebar.xaml` | 44px obsidian-petrol rail closed by a `6px` distressed chalk vertical spine (`spine-line-v.png`), crowned by `44×50` main menu tile wearing the animated **Astrolabe-Brush mark** (`LocalArcfolioMenuMarkTemplate`: hover rotates outer broken astrolabe ring `+45°` & flares quill-slash/carmine star; menu-open turns inner calibrated ring `-90°` & breathes ivory core jewel), foot cyan drafting diamond |
| `Views/TopPanel.xaml` | 50px dark verdigris top bar closed by distressed chalk horizontal rule (`hairline-h.png`); search first -> filter toggle (`9px` rotated Emerald Quest diamond `TextFilter`) -> `PART_PanelMainItems` (sorting first, icon-only view switches in Stark Chalk-Ivory + Carmine corner pip) -> carmine notifications orb -> 12px `PARAMETERS`-style `PART_ProgressGlobal`; `TopPanelMenu` plain `BasedOn` `ContextMenu` |
| `CustomControls/SidebarItem.xaml` | 44×40 cells (`11,11,15,11` fixed padding clearing right spine, never stacked with `IconPadding`); active Stark Chalk-Ivory paper slip + Pitch Ink icon + `3px` Carmine left bar |
| `CustomControls/TopPanelItem.xaml` | 34×32 toolbar cells; toggled Stark Chalk-Ivory slip + Pitch Ink glyph + `6px` Carmine corner dot pip (`11_memorandum`) |
| `CustomControls/SearchBox.xaml` | Recessed obsidian well with chalk bottom hairline lighting bright cyan-teal on focus, persistent `Glyph` outside `PART_SeachIcon`, full-hit transparent `Border` on `PART_ClearTextIcon` |
| `DerivedStyles/MainWindowStyle.xaml` | `44×48` caption buttons (Carmine hover on Close) + `MainWindowStyle` + `MainMenuButton` |

## Game page

Generated by `art/gen-overviews.mjs` (imports `scripts/overview-generator.mjs` and runs `applyGamePageBreakpoints()` for `GameDetailsPanePosition` Left / Center / Stretch / Right and 900+ / 560–899 / <560 responsive grids):

- **Hero banner**: `PART_ImageBackground` masked downward by `banner-dissolve.png` inside `BitmapCache`, tinted by `GameBannerTintBrush` (`#0D2225`) + 50% floor, overlaid with translucent `drafting-arcs.png` compass rings.
- **Header**: Circular Archetype-medallion icon bezel with crosshair ticks beside `Cinzel Bold` title on a distressed chalk rule (`hairline-h.png`), paired with the Carmine gouache brushstroke `PlayButton` (`MinWidth="176"`) + equal `40×40` `SecondaryButton` More & Edit icon plates.
- **Metadata ledger**: Obsidian-petrol dossier (`300px` inner usable width) bounded left by the distressed chalk vertical spine (`spine-line-v.png`), rotated hollow diamond + hairline group breaks, `NO.01`-style chalk-ivory score plaques, and Stark Chalk-Ivory `Tag="Chip"` slips.
- **Grid close button**: Custom `28×28` obsidian architectural square with chalk foot rule sweeping Carmine Rose-Crimson + diagonal chalk accent on hover; switches to scroll-pinned `InlineSidePanelCloseButton` below `120px` banner height or under window background art.
- **Empty state**: Centered `EmptyGameTemplate` (teal-to-rose `ink-splash.png` + breathing `drafting-arcs.png` + `LocalArcfolioBrandMarkTemplate` + `LOCErrorNoGameSelected`) in both views (`PART_ScrollViewHost` explicitly `Visibility="Visible"`).

## Components

| Playnite file | Metaphor: ReFantazio translation |
|---------------|----------------------------------|
| `DerivedStyles/PlayButton.xaml` | `01_title` `LOAD GAME` / `06_modal` `Yes` Carmine gouache brushstroke (`brush-cta.png`) + `24°` diagonal chalk slash on hover + Royal Quest Gold running plate & `RunningActionIndicator` |
| `DerivedStyles/DetailsViewItemStyle.xaml` & `DefaultControls/ListView.xaml` | `02_settings` Verdigris Cyan-Teal brushstroke selection (`brush-bar.png`) + chalk baseline & `▸` pointer; `RowHoverAction` Play/Install buttons; Royal Quest Gold running sweep + 3 stepping Quest Rank diamonds (`◇ ◆ ◇`, `RowRoom` `0,0,48,0`) |
| `DerivedStyles/GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml` | Sharp architectural covers with cyan-teal hover lift, double Stark Chalk-Ivory selection frame + Carmine corner pip, `50×50` Carmine/Ivory `GridTileButton` hover controls, and golden foot-tape running sweeps |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | Chalk-spined obsidian popup board (`LocalArcfolioMenuBoardTemplate`), sweeping Cyan-Teal brushstroke rows (`30px`), diagonal slash + diamond separators, `[ F4 ]` bracketed shortcuts, Carmine Exit brushstroke, Stark Chalk-Ivory checked squares |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml`, `DefaultControls/TreeView.xaml` | `44px` obsidian title band painted with `06_modal` teal-to-rose `ink-splash.png` + brand mark + `Cinzel` title; bare `28px` `Georgia` `TreeView` rows igniting Cyan-Teal brushstrokes on selection with reserved vertical scroll lane |
| `DefaultControls/ToolTip.xaml` | `03_inventory` / `10_equipment` hand-torn Stark Chalk-Ivory paper card (`paper-torn.png`) with Pitch Ink serif copy |
| `DefaultControls/Slider.xaml` & `ProgressBar.xaml` | `13_status` `PARAMETERS` chalk-to-teal horizontal gauges + rotated ivory diamond slider thumb + ThemeModifier banner slider disable triggers |
| `DefaultControls/ScrollViewer.xaml` | `07_load` / `11_memorandum` minimalist pure chalk-white ruler scrollbar |
| `DefaultControls/TabControl.xaml`, `CheckBox.xaml`, `RadioButton.xaml` | `11_memorandum` Stark Chalk-Ivory active tabs + Carmine corner dot; Stark Chalk-Ivory checkboxes with cyan-teal checks; rotated drafting-diamond radios with Carmine core |
| `Media.xaml` & `art/menu-icons.json` | 33 bespoke Renaissance architectural `Icon<Role>` vectors + 24 custom bare full-frame hand-inked chalk & verdigris-gouache menu PNG icons (`Images/Arcfolio/*.png`) |

## Running game

- **Hue:** Royal Quest Gold (`#D6A618`, distinct from Carmine Play, Verdigris Cyan-Teal selection, and Emerald filter mark) with Pitch Ink (`#101718`) label contrast `> 6.5:1` on PlayButton and Carmine `#C92446` + white Cancel on self-hover.
- **Levers:** Angled dry-brush golden scan (`EndPoint="1,0.25"`, `1.6s` loop), golden foot progress line, and three stepping Quest Rank diamonds (`◇ ◆ ◇`, `12_quest.png`) reacting sequentially on launch and idling on a `3.0s` breath.

## Previews

`art/preview-details.html` and `art/preview-settings.html` render `art/screenshot-details.png` and `art/screenshot-settings.png` (1280×720, zero hex literal drift, zero system font warnings).

- **Signature motifs drawn**: Painted verdigris-to-burgundy impasto canvas, distressed chalk vertical spines (`spine-line-v.png`), Carmine Play brushstroke with `24°` diagonal chalk slash (`brush-cta.png`), Cyan-Teal row/tree brushstroke (`brush-bar.png`), Stark Chalk-Ivory paper chips/tabs/score plaques & torn helper slip (`paper-torn.png`), astrolabe drafting compass arcs (`drafting-arcs.png`), and Royal Quest Gold running Rank diamonds.
- **Stand-in fonts**: `Georgia` renders via bundled `Gelasio` (OFL-1.1) and `Consolas` via `Cascadia Mono` (OFL-1.1) in Chromium previews; `Cinzel` Regular & Bold are bundled directly in `src/Typography/`.

## Deviations

- Playnite's native `RadioButton` layout renders individual controls rather than a flush horizontal segmented container; `RadioButton.xaml` carries the rotated Renaissance diamond + Carmine core motif cleanly in any Playnite stack or grid.
- Dense reading surfaces (game list ground, metadata descriptions, library grid background) remain calm dark verdigris-petrol with low-opacity impasto texture (`6.5%`) rather than full-opacity illustrated menu backgrounds, preserving desktop legibility (`> 7:1`–`14:1` contrast).

## Not verified yet

- Multi-monitor high-DPI scaling (175%/200%) visual inspection across every Playnite dialog beyond live 100%/125% Windows verification.
