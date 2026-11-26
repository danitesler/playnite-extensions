# Overpass — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, dark only) inspired by the monochrome Swiss editorial pause menu, Liberty street cartography, and circular radar HUD of *Grand Theft Auto IV*. Unofficial fan work, not affiliated with or endorsed by Rockstar Games or Take-Two Interactive. Ships zero third-party logos, game files, or proprietary artwork; ships [`info/NOTICE-Overpass.txt`](info/NOTICE-Overpass.txt) and [`info/LICENSE-Playnite.txt`](info/LICENSE-Playnite.txt).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, pixel-measured color palette from 8 GTA IV captures (Map, Stats, Display, Audio, HUD/Radar, Title, Modal, Brief), and procedural cartography asset notes live in [`RESEARCH.md`](RESEARCH.md). Creative brief (Showcase ambition, source DNA, game element map, signature moments, motion language, trademark notes): [`BRIEF.md`](BRIEF.md).

## Tokens

Palette ratio: ~93% stark Swiss monochrome value ladder (`#000000` to `#F7F8FA`), ~7% subtle warm amber-orange (`#E89D10`) highlight, plus muted circular-radar semantic accents (Armor steel-blue `#1B5D7E`, Health sage-green `#56995C`, `[B]` crimson `#B8242A`). Radii are `0px` everywhere except strictly 1:1 circular radar elements (`CornerRadiusFull = 999` only on square hosts). Fonts: bundled SIL OFL `Schibsted Grotesk` (`Regular`, `Medium`, `SemiBold`, `Bold`, subset to Latin + Cyrillic under `src/Typography/` via `scripts/subset-theme-fonts.py`) for both heading and body faces, paired with `Consolas` for tabular numbers and menu shortcuts.

| Token (`src/tokens.css`) | Key (`Constants.template.xaml`) | Used for |
|---|---|---|
| `--op-void` (`#000000`) | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `MainMenuButtonBackgroundBrush` | Harbor-water black frame, 44px rail, 50px top bar, dialog title band |
| `--op-ground` (`#0A0B0C`) | `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `MainBackgourndBrush` | Deep asphalt library and game-page ground |
| `--op-panel` (`#111214`) | `PanelBackgroundBrush`, `PopupBackgroundBrush`, `GridItemBackgroundBrush` | Filter/Explorer side panels, popup menu boards, cover slots |
| `--op-input` (`#141517`) | `InputBackgroundBrush`, `TooltipBackgroundBrush`, `ControlBackgroundBrush` | Form fields, tooltips, flat secondary button rest |
| `--op-zebra` (`#1B1C1E`) | `LocalZebraBrush`, `ButtonBackgroundBrush`, `MenuItemBackgroundBrush` | Stats alternating zebra bands, resting buttons, raised surfaces |
| `--op-land` (`#232528`) | `ListItemSelectedBrush`, `MenuItemHoverBrush`, `TopPanelItemCheckedBackgroundBrush`, `LocalMapLandBrush` | Liberty map landmasses, active rows, highlighted menu plates |
| `--op-track` (`#2B2C2F`) | `ProgressBarTrackBrush`, `SliderTrackBrush`, `ButtonPressedBackgroundBrush` | Flat thumb-less Display slider tracks, progress tracks |
| `--op-rule` (`#727478`) | `TopPanelSeparatorBrush`, `NormalBorderBrush`, `MenuSeparatorBrush` | 1px GTA IV pause-menu closing hairlines and group rules |
| `--op-muted` (`#8E9094`) | `TextBrushDarker`, `SidebarItemForegroundBrush`, `LocalMapMinorRoadBrush` | Inactive pause tabs, metadata captions, rest Display slider fill |
| `--op-highway` (`#C8CACD`) | `LocalMapHighwayBrush`, `ScrollBarThumbHoverBrush` | Elevated expressways, secondary bright copy, map overlays |
| `--op-ink` (`#EBECEF`) | `TextBrush`, `WindowTitleForegroundBrush` | Primary Swiss off-white text |
| `--op-ink-pure` (`#F7F8FA`) | `HeadingForegroundBrush`, `SelectedForegroundBrush`, `PrimaryButtonBackgroundBrush` | Game titles, selected labels, Play button rest slab |
| `--op-ink-dark` (`#0A0B0C`) | `TextBrushDark`, `PrimaryButtonForegroundBrush` | Jet-black ink on white or amber slabs |
| `--op-amber` (`#E89D10`) | `GlyphBrush`, `PrimaryButtonHoverBackgroundBrush`, `LinkBrush`, `LocalMapRouteBrush` | Active tab/row indicator bar, focused Display slider fill, Play hover sweep, GPS route |
| `--op-radar-armor` (`#1B5D7E`) | `RunningIndicatorBrush` | Launching/running indicator across Play button, details rows, list rows, and covers (`>= 5.02:1` launching, `>= 6.78:1` running with `#F7F8FA`) |
| `--op-radar-health` (`#56995C`) | `DataChangeNotifBrush`, `PositiveRatingBrush` | Active filter 8x8 square pip in TopPanel and positive score gauge |
| `--op-gps-gold` (`#C9A424`) | `MixedRatingBrush` | Mixed score gauge |
| `--op-danger` (`#B8242A`) | `DangerBrush`, `NegativeRatingBrush` | `[B]` Back crimson hover on close buttons, Exit (`Alt+Q`) highlight slab, negative rating |
| `--op-danger-text` (`#E55258`) | `LocalDangerTextBrush` | Text-safe crimson for Exit (`Alt+Q`) label/shortcut at rest |
| `--op-banner-tint` (`#0C0D0F`) | `GameBannerTintBrush` | Matte noir asphalt banner darkening tint (matches Overpass's pitch-black/noir ground rather than a chromatic hue) |

## ThemeModifier

Keep the ThemeModifier Edit constants list focused on main backgrounds, button fills and text, selection, and inputs. Include existing sidebar and panel surface brushes through the shared catalog. When panels share a brush or are transparent, use the existing background control. Keep the existing layout controls. Use the shared opt-ins in `scripts/data/theme-keys.json` and let the build generate `thememodifier.yaml`. Hover, pressed, and decorative colors stay in the theme. The accent picker lives in the Editor tab.

## Component spacing (`src/Common.xaml`)

| Key | Value | GTA IV Pause Menu & Cartographic spec |
|---|---|---|
| `ControlHeight` | `32` (`28` in `FilterPanelView`) | Standard Playnite form-field alignment |
| `ControlCornerRadius` | `0` | Sharp 0px Swiss architectural cuts everywhere |
| `ControlBorderThickness` | `1` | Crisp 1px pause-menu hairlines |
| `ButtonPadding` | `12,5` | Compact Swiss buttons filling 32px height cleanly |
| `InputPadding` | `9,5` | Sharp field inset leaving room for left hover/focus rail |
| `MenuPadding` | `4,10,4,5` | Clears top 6px map-band crown + amber crosshair dash |
| `MenuItemPadding` | `6,0,10,0` | Compact 30px menu rows |
| `ComboBoxDropDownPadding` | `4,10,4,5` | Matches ContextMenu board inset |
| `ComboBoxItemPadding` | `10,0` | 30px ComboBox rows matching MenuItem |
| `ListBoxItemPadding` | `10,4` | Zebra ledger rows |
| `GroupBoxPadding` | `12,10` | Clean Statistics card inset |
| `TooltipPadding` | `8,5` | `LIBERTY`-style dark map tag |
| `IconSize` | `16` | Crisp Swiss geometric UI glyphs |
| `GameBannerHeight` | `300` | Tall cinema hero band above cartographic horizon seam |
| `GameBannerDarken` | `0` | ThemeModifier slider 0–1 (with 50% darkening floor > 0) |

## Shell

| File | What it draws |
|---|---|
| `Views/Sidebar.xaml` + `CustomControls/SidebarItem.xaml` | 44px clean matte dark rail (`#000000`, no background map) closed by a 1px pause hairline (`WindowPanelSeparatorBrush`), transparent when `ShowBackgroundImageOnWindow=True`. Crowned by `PART_ElemMainMenu` hosting the animated **Circular Liberty Radar** main menu mark (`LocalOverpassMenuMarkTemplate` in `Common.xaml`): a 28x28 circular radar dial with twin left Health (sage-green) / right Armor (steel-blue) arcs, miniature monochrome cross-streets, and a central amber GPS directional chevron — on hover the chevron nudges forward and cross-streets brighten, and while the main menu is open a dedicated amber sonar ring pulses outward with a breathing lock bezel. Selected rail items hold a `#232528` landmass plate with a `3px` amber left GPS bar and bright white glyph. |
| `Views/TopPanel.xaml` + `CustomControls/TopPanelItem.xaml` | 50px pitch-black pause-menu strip carrying an understated fading monochrome expressway map band (`map-band.png`, `0.11` opacity, collapsed under window art) closed by a 1px pause hairline + `28x2` amber crosshair dash. Order: `PART_ElemMainMenu` (hidden sidebar only) -> `244x32` `SearchBox` -> `34x32` Filter toggle (`8x8` Radar Health sage-green square pip on `Tag=True`, zero words) -> `PART_PanelMainItems` (Sorting pinned to column 0, icon-only view switches, active switch on `#232528` plate + `2px` amber bottom rule) -> `12px` flat amber `PART_ProgressGlobal` -> Notifications badge -> `138px` window caption clearance. `TopPanelMenu` is plain `BasedOn ContextMenu`. |
| `CustomControls/SearchBox.xaml` | `32px` sharp dark search well hosting `LocalOverpassFieldTemplate`, explicit `Foreground="{DynamicResource TextBrush}"`, persistent `IconSearch` magnifier outside `PART_SeachIcon` (`TextBrushDarker` idle -> `GlyphBrush` amber when focused/nonempty), and explicit transparent hit-box `PART_ClearTextIcon`. |
| `Views/Library.xaml` | Full-bleed `PART_ImageBackground` spanning top bar and reaching under the sidebar (`Margin -44,0,0,0` mirrored/rotated by `SidebarPosition`) with smooth fade into `WindowArtSwatch`; under `ShowBackgroundImageOnWindow=False`, hosts the single continuous translucent pure black-and-white Liberty cartography backdrop (`LocalOverpassMapBackdropTemplate`: `map-land` 0.44 + `map-roads` 0.13, zero orange routes) stretching uninterrupted from the game list all the way across the game details pane. |
| `Views/FilterPanelView.xaml` + `Views/ExplorerPanel.xaml` | Matte `#111214` side drawers (`28px` filter controls) turning transparent under `ShowBackgroundImageOnWindow=True`, closed by 1px pause hairlines. |
| `DerivedStyles/MainWindowStyle.xaml` | Frameless `WindowChrome` shell (`CaptionHeight=50`) with crisp monochrome `MainWindowButton` caption controls (crimson hover on close). |
| Running game | Radar Armor Steel-Blue (`#1B5D7E`, `#4AA3CC` bright ping/rim) across `PlayButton` (`RunningActionIndicator`), `DetailsViewItemStyle`, `GridViewItemStyle`, and `DefaultControls/ListView.xaml`. Launching sweeps an angled GPS scan band (`RunningScan`) with a segmented dashed highway foot-line (`RunningFill`) and expanding square GPS target ping (`*BlipPing`); running pulses gently (`3.2s`) and reveals `Cancel` only when hovering the `PlayButton` itself (`RelativeSource Self`). `PlayRoom` (`34px`) and `RowRoom` (`30px`) guarantee zero text/mark overlap. |

## Game page

Generated by `art/gen-overviews.mjs` + `scripts/game-page-breakpoints.mjs` into `Views/DetailsViewGameOverview.xaml` and `Views/GridViewGameOverview.xaml`:

- **Continuous Pure Black-and-White Map Backdrop**: `PageRoot` defaults transparent (`GameOverviewBackgroundBrush` `#000A0B0C`) so `Views/Library.xaml`'s single continuous `LocalOverpassMapBackdropTemplate` (`map-land.png` + `map-roads.png`, zero orange routes) stretches unbroken from the left game list straight across into the right game details pane without any seam (collapses when `ShowBackgroundImageOnWindow=True`).
- **Hero Banner**: Sharp `0px` `300px` `HeroArt` dissolves smoothly into the continuous monochrome map underneath via a `BitmapCache`-wrapped `OpacityMask` and subtle dark scrim (outside `PlayButton`), with no top divider above the title/Play header. Banner darkening uses `GameBannerTintBrush` (`#0C0D0F` matte noir asphalt).
- **Header & Focal Play Slab**: Tight-tracked bold `Schibsted Grotesk` title beside a `44x44` framed icon with a `14x2` amber bottom-left tick, paired with the sharp `40px`-tall `PlayButton` (crisp `#F7F8FA` Swiss white plate with subtle `map-plate.png` street etch and `4px` amber left rail -> sweeping left-to-right to `#E89D10` amber on hover with extending crosshair ticks) and equal `40x40` icon-only `PART_ButtonMoreActions` and `PART_ButtonEditGame`.
- **Stats Zebra Metadata Ledger**: No heavy card border around metadata — open top `1px` pause hairline over alternating `#1B1C1E` / transparent GTA IV *Stats* zebra rows, `300px` usable width (`GameDetailsPaneWidth` / `GridDetailsPaneWidth`), full `900+ / 560-899 / <560` breakpoints and `GameDetailsPanePosition` (`Right` default, `Left`, `Center` / `Stretch`).
- **Grid Side Panel Close Button**: `28x28` sharp plate with miniature top-left amber crosshair ticks and crimson hover (`DangerBrush`), fixed `12,12` over banners `>= 120px` and inline (`Panel.ZIndex="4"`) left of `PART_ImageIcon` when `GameBannerHeight < 120` or `ShowBackgroundImageOnWindow=True`.

## Components

| Playnite file | GTA IV Pause Menu & Cartographic component |
|---|---|
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `ComboBox.xaml`, `DerivedStyles/HighlightBorder.xaml` | Shared `LocalOverpassFieldTemplate` overlay: `0px` matte `#141517` well with a subtle bottom-left corner tick at rest, crisp hover lift, and a `2px` amber left GPS bar + horizontal bottom amber sweep played once on focus/open (`ComboBox` active ONLY on `IsDropDownOpen` or editable+focused). Closed `ComboBox` features a separated `30px` chevron cap (value reserves `40px` right room) that fills amber and rotates 180° when open. |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | Shared `LocalOverpassMenuBoardTemplate`: `0px` `#111214` board, `1px` `#55585D` rim, `6px` `map-band.png` expressway crown with centered `18x2` amber crosshair dash, and quiet `7.5%` bottom-right `map-roads.png` watermark. `30px` rows with animated `#232528` wipe + `3px` amber left bar, `+2px` label nudge, tiny amber `+` crosshair separators, slash-prefixed `/ F4` `Consolas` shortcuts, `[B]` crimson `Exit (Alt+Q)`, and 24 custom bare-icon Swiss duotone PNGs (`art/menu-icons.json` -> `src/Images/Overpass/*.png`). |
| `DefaultControls/Slider.xaml` | GTA IV *Display* flat thumb-less horizontal bar: `#2B2C2F` recessed track, `#8E9094` muted monochrome bar fill at rest turning `#E89D10` amber on hover/drag, invisible `Thumb` hit area, plus ThemeModifier window-art disable triggers. |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | Sharp `16x16` waypoint square checkboxes (`IconCheck` amber tick) and strictly `1:1` `16x16` circular radar-pip radio buttons (`6x6` amber core). |
| `DefaultControls/Button.xaml`, `ToggleButton.xaml`, `RepeatButton.xaml` | Sharp `0px` matte monochrome slabs lifting to `#323438` with subtle amber lead bar; preserves the `Width=41` ThemeModifier `32/41` `LayoutTransform` scale trigger. |
| `DefaultControls/TreeView.xaml`, `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Settings & Extensions window chrome: pitch-black `44px` pause-menu title band with understated `map-band.png` strip (`0.12`) and amber lead rule; continuous pure black-and-white `LocalOverpassMapBackdropTemplate` spanning the entire dialog body behind both the translucent `244px` (`WindowSettings`) / `280px` (`WindowExtensions`) left section tree (`LocalNavShadeBrush`, `VerticalScrollBarVisibility=Visible`, bare `28px` body-font rows) and the right settings content. |
| `DefaultControls/TabControl.xaml`, `GroupBox.xaml`, `ListBox.xaml`, `ListView.xaml`, `ScrollViewer.xaml`, `ProgressBar.xaml`, `ToolTip.xaml` | Bold GTA IV pause-menu tabs (amber active text + bottom rule, keeping `TabItem` foreground `TextBrush` for child pages), minimal content-sized `GroupBox` cards with amber corner ticks, `CanContentScroll="True"` `ListBox`, 8px monochrome scrollbars, flat amber `ProgressBar`, and `LIBERTY`-style dark map `ToolTip`s. All input/list controls explicitly set `Foreground="{DynamicResource TextBrush}"` so Advanced Settings text fields and presets stay crisp off-white. |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml`, `PropertyItemButton.xaml`, `TextBlockGameScore.xaml` | Zebra-inspired details rows with animated `#232528` wipe + `3px` amber GPS bar + `RowHoverAction` play/install glyphs; crisp `0px` grid covers with amber corner-bracket lock on hover/select and squared `50x50` sharp `0px` `GridTileButton` hover controls (3px amber left rail); sharp matte `PropertyItemButton` chips lighting amber on hover; GTA IV *Display*-style mini bar `TextBlockGameScore` gauges. |

## Previews

`art/preview-details.html` -> `art/screenshot-details.png` and `art/preview-settings.html` -> `art/screenshot-settings.png` (1280x720, zero literal hexes, `layout ok`).

- **Signature motifs drawn**: clean dark 44px rail, continuous translucent pure black-and-white Liberty street map stretching across game list -> game details and across Settings nav -> Settings content, 50px pause header with understated expressway strip and amber crosshair dash, Circular Liberty Radar main menu mark, dividerless hero banner dissolving into the map, crisp white-to-amber Play slab, alternating GTA IV *Stats* zebra metadata ledger, flat thumb-less *Display* sliders, separated-cap ComboBox, and `WindowSettings` tree/title chrome.
- **Stand-in fonts**: `Schibsted Grotesk` is bundled directly in `scripts/fonts/schibstedgrotesk/` and `src/Typography/` (exact match in Chromium and WPF); `Consolas` renders via `DejaVu Sans Mono` in Chromium previews.

## Deviations

- **Sharp 0px corners everywhere except radar controls**: Purely faithful to GTA IV's pause menus; strictly 1:1 circular `CornerRadiusFull` is reserved only for the Circular Liberty Radar main menu mark, `RadioButton`, and `50x50` `GridTileButton` cover discs.
- **Running indicator darkness**: `--op-radar-armor` was deepened slightly from raw in-game radar cyan `#2B7FA6` to `#1B5D7E` so white `#F7F8FA` text on `PlayButton` clears WCAG AA (`5.02:1` during peak launch scan, `6.78:1` while running).
- **Procedural cartography**: All map masks in `src/Images/fx/` are procedurally generated from scratch via `art/sprites.py` (fixed seed `4082008`, Catmull-Rom smooth coastlines, organic parks/piers, broken street grids, elevated expressways, aligned amber GPS route) so zero copyrighted Rockstar map tiles are used.

## Not verified yet

- Multi-monitor DPI scaling at 125%/150%/175% in live Playnite dialogs and edit-game multi-select popups.
- Live ThemeModifier accent-picker and live slider interaction across every Settings tab and Statistics view wrap check.
- Full manual walkthrough of all four `SidebarPosition` docks (Left/Right/Top/Bottom) and live `ShowBackgroundImageOnWindow` toggle in Playnite.
