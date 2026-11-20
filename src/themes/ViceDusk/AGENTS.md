# Vice Dusk — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) in the style of **Vice Twilight UI** — an unofficial **dark smoked charcoal-plum & twilight sunset magenta-plum**, neon flamingo-pink, pure white-to-lavender fade bar, and coastal palm silhouette theme inspired by the pause, exploration, progress, dossier, and settings screens of *Grand Theft Auto VI*.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (ambition, source DNA, game element map, signature moments, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

Palette tokens live in `src/tokens.css`, rendered into `src/Constants.xaml` via `src/Constants.template.xaml` (`--vd-*` palette keys + `GameDetailsPaneWidth`, `GridDetailsPaneWidth`, `GameDetailsPanePosition`, and Playnite `ThemeModifier` editable keys).

| Token | Key | Used for |
| --- | --- | --- |
| `--vd-ink` `#F5F1F8` | `TextColor` / `TextBrush` | Primary alabaster-tinted plum-white labels |
| `--vd-ink-muted` `#CABBD9` | `TextColorDarker` / `TextBrushDarker` | Secondary metadata labels and descriptions |
| `--vd-ink-dim` `#8D7C9E` | `TextColorDark` / `TextBrushDark` | Dimmed counts and subtle labels |
| `--vd-ink-dark` `#191223` | `SelectedForegroundColor` / `SelectedForegroundBrush` | Deep plum ink on stark white and white-to-lavender selection plates |
| `--vd-void` `#140E1C` | `ShellBackgroundBrush` / `MainColorDark` / `ScrimBrush` | Deep smoked plum-void and foreground palm silhouette tint |
| `--vd-page` `#24122B` | `WindowBackgourndBrush` / `ContentBackgroundBrush` / `GameOverviewBackgroundBrush` | Deep sunset aubergine base under atmospheric dusk sky |
| `--vd-panel` `#1F192A` | `MainColor` / `PopupBackgroundColor` / `NormalBrush` / `TopPanelBackgroundBrush` | Smoked charcoal-plum sidebar rail, top bar, menus, drawers |
| `--vd-panel-raised` `#2B2339` | `BackgroundToneColor` / `ButtonBackgroundBrush` / `SecondaryButtonBackgroundBrush` | Inputs, secondary buttons, badges |
| `--vd-dossier-glass` `#9E160E20` | `LocalDossierGlassBrush` | Translucent smoked-plum Overview dossier container |
| `--vd-dusk-top` / `--vd-dusk-mid` / `--vd-dusk-deep` | `LocalDuskTopBrush` / `LocalDuskMidBrush` / `GameBannerTintBrush` | Multi-stop Vice twilight magenta-plum sky (`LocalSunsetBackdropTemplate`) |
| `--vd-pink` `#F77BB8` | `GlyphColor` / `GlyphBrush` | Neon flamingo-pink active rail rule, keylines, Play CTA, pill toggle tracks |
| `--vd-pink-hi` `#FFA5D4` | `HighlightGlyphColor` / `HighlightGlyphBrush` | Hover flamingo-pink highlight |
| `--vd-white` `#FFFFFF` / `--vd-white-fade` `#D5BDD9` | `SelectedBrush` / `MenuItemHoverBrush` / `LocalWhiteFadeBrush` | Stark white left plateau fading smoothly into lavender |
| `--vd-gps-cyan` `#0E7894` | `RunningIndicatorBrush` | Leonida GPS cyan running indicator / progress sweep / telemetry bars |
| `--vd-emerald` `#2DB874` / `--vd-emerald-pill` `#1E7A50` | `PositiveRatingBrush` / `LocalEmeraldPillBrush` | Sunbelt causeway emerald rating pills & telemetry status |
| `--vd-gold` `#F2C94C` | `DataChangeNotifColor` / `DataChangeNotifBrush` | 45° rotated Vice Gold rail & top-bar active filter diamond pips |
| `--vd-crimson` `#C82843` | `DangerBrush` | Siren crimson Exit row highlight and danger states |
| `--vd-font-body` | `FontFamily` | Bundled `Barlow` static TTF (`Typography/`) |
| `--vd-font-heading` | `HeadingFontFamily` | Bundled `Barlow Condensed` static TTF (`Typography/`) |
| `--vd-font-mono` | `MonospaceFontFamily` | Bundled `Cascadia Mono` static TTF (`Typography/`) |

## Component spacing (`src/Common.xaml`)

| Key | Value | Vice Twilight UI |
| --- | --- | --- |
| `ControlHeight` | `32` | Standard button, input, and combo box height |
| `IconSize` | `16` | Rail and top bar icon glyph size |
| `GameBannerHeight` | `300` | Default game hero art height (`0`–`600`) |
| `ButtonPadding` | `16,5` | Compact action button inset matching 32px control rhythm |
| `InputPadding` | `10,5` | Standard text/combo input padding |
| `MenuPadding` | `4,6,4,5` | Smoked charcoal drawer padding under the 2px flamingo top crown |
| `MenuItemPadding` | `10,5` | 30px popup menu rows |
| `ComboBoxDropDownPadding` | `4` | ComboBox popup padding |
| `ComboBoxItemPadding` | `10,5` | 30px ComboBox items |
| `ListBoxItemPadding` | `10,6` | Exploration sub-list rows |
| `GroupBoxPadding` | `14,12,14,14` | Group card padding |
| `TooltipPadding` | `10,7` | Dark slate map-callout tooltip padding with 2px neon flamingo top rule |

## Shell

| File | What it draws |
| --- | --- |
| `DerivedStyles/MainWindowStyle.xaml` | Smoked dark twilight framing and main caption controls |
| `DerivedStyles/StandardWindowStyle.xaml` | 44px Vice sunset header band + `LocalSunsetBackdropTemplate` sunset magenta sky and dark coastal palms behind Settings, Add-ons, and dialogs |
| `Views/Sidebar.xaml` | 46px smoked charcoal-plum Exploration rail closed right by hairline rule, crowned by a 36x36 main menu tile with palm sunset mark and `2px` top flamingo rule |
| `CustomControls/SidebarItem.xaml` | 40px rail cell with Map-style stark white `34x32` selected plate, `3px` neon flamingo left bar, `5px` rotated Vice Gold diamond pip, and directional white right pointer |
| `Views/TopPanel.xaml` & `TopPanelItem.xaml` | 48px smoked toolbar with top-left flamingo trace, white-slab active view switch (`L1`/`R1` mode switcher style), gold diamond filter pip, and 12px global progress bar |
| `CustomControls/SearchBox.xaml` | Top-bar command search input with monospaced `Cascadia Mono` hotkey hint and neon flamingo focus border |

## Game page

Both `Views/DetailsViewGameOverview.xaml` and `Views/GridViewGameOverview.xaml` paint `LocalSunsetBackdropTemplate` (warm magenta-plum sky + dark bottom-right coastal palm silhouettes, auto-collapsed when `ShowBackgroundImageOnWindow=True`) behind `HeroArt`, share the responsive breakpoint layout (`GameDetailsPaneWidth` / `GridDetailsPaneWidth` `300`, `GameDetailsPanePosition` `Right` default; `Left`/`Center`/`Stretch` via `scripts/game-page-breakpoints.mjs`), and wrap metadata in the translucent smoked-plum `LocalDossierGlassBrush` Overview dossier crowned by localized uppercase `LOCOverviewLabel` and `DividerTemplate`'s pink dash + circular node.

## Components

| Playnite file | Vice Twilight UI component |
| --- | --- |
| `DefaultControls/Menu.xaml`, `ContextMenu.xaml`, `ComboBox.xaml` | Smoked charcoal-plum drawer (`LocalMenuBoardTemplate`), 2px neon flamingo top rule, subtle bottom-right palm silhouette, animated stark white-to-lavender fade highlight rows (`30px`, `+3px` label glide, dark plum ink), `Cascadia Mono` keycaps, neon flamingo check dot, Siren crimson Exit row |
| `DefaultControls/CheckBox.xaml` | GTA VI `36x18` Neon Flamingo Pill Toggle Switch with sliding pure white thumb (`TranslateTransform` 130ms `CubicEase`) |
| `DefaultControls/Slider.xaml` & `ProgressBar.xaml` | Thick rectangular neon flamingo bars with tall crisp white vertical needle cap ("Aim Assist Strength" motif) |
| `DefaultControls/ToolTip.xaml` | Dark map-callout card ("FIX YOUR CAR" motif) with 2px neon flamingo top cap and lavender hairline border |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml`, `DerivedStyles/GridViewItemStyle.xaml`, `DerivedStyles/GridViewItemTemplate.xaml` | White-to-lavender fade list rows with dark plum ink, crisp `2px` stark white Progress-card selected cover rims with subtle bottom cover vignette & condensed display titles, `GridTileButton` >= 50x50 tiles, and Leonida GPS cyan running sweep / signal bars |
| `DefaultControls/TreeView.xaml` & `TabControl.xaml` | Bare `28px` settings categories with soft pink wash + `2px` flamingo bar preserving alabaster ink (`ViceDuskNavDivider` non-selectable separator) |

## Deviations

- Running state uses Leonida GPS Cyan (`#0E7894` + scrim) rather than neon flamingo (`#F77BB8`) so running/launching indicators stay unmistakably separate from the Play CTA and active selections.
- `LocalWhiteFadePlateTemplate` backs the `white-fade-bar.png` `OpacityMask` rectangle with solid `LocalWhiteFadeBrush` (`#D5BDD9`) so dark plum text (`#191223`) keeps high contrast across the full row width while the left 38% plateau reads pure white.

## Not verified yet

- Interactive Settings, Add-ons, and Extension dialogs inside a running Playnite Desktop session (covered visually by static previews and WPF regression suites; live Playnite verification runs after final deploy).
