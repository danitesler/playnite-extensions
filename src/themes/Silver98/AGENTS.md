# Silver 98

Light Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by Microsoft Windows 95 and Windows 98 Classic UI (unofficial, no Microsoft assets or binaries; see `info/NOTICE-Silver98.txt`). Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record the classic Win32 system metrics and sampled palette; the [Faithful brief](BRIEF.md) maps Windows 95/98 Explorer and dialogs to Playnite.

## Sources

`RESEARCH.md` (classic Windows 95 / Windows 98 Win32 3D chrome metrics, 16-color VGA palette, Explorer 4.0 Web View `folder.htt`, and shell icon inventory) and `BRIEF.md` (lens: authentic `#C0C0C0` 3D beveled silver chrome, `#FFFFFF` sunken document client wells, `#000080` → `#1084D0` active title bars, and 16×16 VGA pixel icons).

## Tokens

All values are in `src/tokens.css`; `Constants.template.xaml` maps them.

| Token | Plays |
|-------|-------|
| `--w98-face` / `--w98-face-hi` / `--w98-face-press` | Classic `#C0C0C0` 3D silver chrome (`ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `MainColor`, `PopupBackgroundBrush`, `ButtonBackgroundBrush`, `GameBannerTintBrush`) |
| `--w98-window` / `--w98-dither-well` | Sunken `#FFFFFF` client wells (`ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `InputBackgroundBrush`, `WindowBackgourndBrush`) and dithered scroll/checked wells (`MainColorDark`, `ScrollBarTrackBrush`) |
| `--w98-bevel-highlight` / `--w98-bevel-light` / `--w98-bevel-shadow` / `--w98-bevel-dark` | 2px Win32 `EDGE_RAISED` & `EDGE_SUNKEN` bevel stops (`#FFFFFF`, `#DFDFDF`, `#808080`, `#000000`) |
| `--w98-navy` / `--w98-title-blue` | Active title-bar gradient (`#000080` → `#1084D0`), selection bars (`SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`), default Play CTA (`PrimaryButtonBackgroundBrush`), and segmented progress blocks (`ProgressBarForegroundBrush`) |
| `--w98-teal` / `--w98-teal-hi` / `--w98-teal-scrim` | Dedicated Windows 95/98 Desktop Teal (`#008080`) running/launching sweep (`RunningIndicatorBrush`, `LocalRunningHighlightBrush`) paired with `ScrimBrush` (`#002E2E`) |
| `--w98-tooltip-bg` | Classic `#FFFFE1` pale-yellow tooltip well (`TooltipBackgroundBrush`) |
| `--w98-web-red` / `--w98-web-yellow` / `--w98-web-green` / `--w98-web-blue` | Explorer 4.0 Web View 4-color divider rule (`DividerTemplate`) |
| `--w98-danger` | Classic crimson close/exit hover (`DangerBrush`, `NegativeRatingBrush`) |
| `--w98-text` / `--w98-text-muted` / `--w98-text-invert` | Black body ink (`TextColor`), muted shadow labels (`TextColorDarker`), and white text over navy bars or window background art (`SelectedForegroundBrush`, `WindowArtForegroundBrush`) |

Radii: `ControlCornerRadius` 0, `CornerRadiusSmall` 0, `CornerRadiusLarge` 0, `CornerRadiusFull` 9999 (circular radio dots only). Type: `Tahoma, Segoe UI` (`FontFamily`); bundled static OFL `Pixelify Sans` (`HeadingFontFamily`, `src/Typography/PixelifySans-Regular.ttf`) for display titles and `PLAY`; `Consolas` monospace for scores and shortcuts; sizes 11 / 13 / 15 / 19 / 30.

## Component spacing

`Common.xaml`: `ControlHeight` 32; `ButtonPadding` 14,5; `InputPadding` 8,5; `MenuPadding` 3,3,3,3; `MenuItemPadding` 8,4; `ComboBoxDropDownPadding` 3,3,3,3; `ComboBoxItemPadding` 8,4; `GroupBoxPadding` 12,10,12,12; `TooltipPadding` 7,4; `IconSize` 16. `art/icons.py` generates all 16×16 whole-pixel vector `Icon<Role>` geometries in `Media.xaml`, 24 full-color 48×48 (3× nearest-neighbor 16×16) 16-color VGA pixel-art PNG menu icons in `src/Images/Win98/*.png`, and white-mask sprites (`dither-checker.png`, `progress-blocks.png`).

## Shell

| File | What it draws |
|------|---------------|
| `Views/TopPanel.xaml` | Classic 48px Win98 Explorer rebar toolbar (`TopPanelBackgroundBrush`) with 2px etched rebar grip handles, sunken white search well (`CustomControls/SearchBox.xaml`), yellow 8×8 square filter pip without text label, sorting-first main items, icon-only view toggles (`LocalThinRaisedBevelTemplate` on hover, dithered sunken well when active), segmented `#000080` block `PART_ProgressGlobal`, and 136px right caption clearance |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px `#C0C0C0` Win32 quick-launch rail closed by a raised 2px bevel seam, crowned by `PART_ElemMainMenu` wearing the animated CRT Computer / Window mark (`LocalSilver98MenuMarkTemplate`, also used in `TopPanel.xaml`); active rail items sink into a dithered 3D sunken well with a 3px `#000080` Navy left edge bar |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Classic `#000080` → `#1084D0` horizontal active title-bar gradient, 16×16 CRT computer icon, raised 3D silver minimize/maximize/close caption buttons (`DangerBrush` on close hover) |
| `DefaultControls/TreeView.xaml` | Settings category tree inside a sunken white well with `#000080` Navy selection bars, 1px dotted inner focus frame, and `WindowArtForegroundBrush` support |

## Game page

`art/gen-overviews.mjs` generates both overviews (`Views/DetailsViewGameOverview.xaml` and `Views/GridViewGameOverview.xaml`) and applies responsive breakpoints via `scripts/game-page-breakpoints.mjs`. Explorer 4.0 Web View `HeroArt` banner (`GameBannerHeight=260`, `DetailsBannerSpacer` `x * 204 / 260` floor 20, `GridBannerSpacer` `x * 188 / 260` floor 14) with `GameBannerDarken` + 50% `GameBannerTintBrush` floor and bottom dissolve into `PageRoot.Background`. Header pairs `PART_ImageIcon`, bold `Pixelify Sans` title (flips to `WindowArtForegroundBrush` over window art) over the 4-color Explorer Web View rule (`DividerTemplate`), `PlayButton` + `PART_ButtonContextAction` + `RunningActionIndicator`, and equal 40×40 raised 3D silver `SecondaryButton` More/Edit squares. Two-column body sets SteamScreenshots gate + Description/Notes beside a Windows 98 File Properties 3D dialog metadata card (`GameDetailsPaneWidth`/`GridDetailsPaneWidth=300` usable width, `GameDetailsPanePosition` Right / Left / Center / Stretch). Empty state centers the Explorer Program Manager dialog (`EmptyGameTemplate`) in `ViewportHeight`.

## Components

| Playnite file | Component |
|---------------|-----------|
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | `LocalMenuBoardTemplate` (raised 2px 3D `#C0C0C0` Win32 popup board with vertical `#000080` → `#1084D0` "Silver 98" Start-menu branding banner strip on root `ContextMenu` and 24 full-color 16-color VGA pixel-art PNG icons), 28px rows inverting to `#000080` Navy with 1px dotted inner focus frame and white ink, etched 2px bevel separators, right-aligned `Consolas` shortcuts, crimson `Alt+Q` Exit, and sunken check squares (row in `docs/themes/menus.md`) |
| `DerivedStyles/PlayButton.xaml` | Classic Win32 Default Push Button (`BS_DEFPUSHBUTTON`, `MinWidth="158"`, `Height="40"`): 1px black outer frame, `#000080` → `#1084D0` active title-bar gradient plate, 2px raised 3D bevel, 1px dotted inner focus rectangle, sunken press with 1px content shift; Windows Desktop Teal (`#008080`) `RunningActionIndicator` with segmented foot bar and 3 stepping pixel block pips (`Cancel` on button Self hover) |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Explorer list rows: pale-blue hot-track wash (`#E4ECF7`) + 2px Navy tick on hover, solid `#000080` Navy bar + 1px dotted inner focus frame on selection, Desktop Teal running indicator + `RowHoverAction` Play/Install controls |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Window-framed cover tiles with raised 3D bevel rim, `#1084D0` hover border + `CornerMarksTemplate`, `#000080` selection frame with 7px active title-bar cap, 50×50 raised 3D `GridTileButton` hover actions, and Desktop Teal running status tape |
| `DerivedStyles/PropertyItemButton.xaml`, `TextBlockGameScore.xaml` | Classic `#0000EE` underlined Explorer Web View links; raised 2px 3D silver `0px` metadata tag chips inverting to `#000080` Navy on hover; `Consolas` bold score readouts |
| `DefaultControls/*` | 2px raised/sunken Win32 buttons, inputs, checkboxes, circular recessed radios, pointed slider thumbs, segmented `#000080` block progress bars, dithered checkerboard scrollbar tracks, `#FFFFE1` tooltips, etched group boxes, and classic raised folder tabs (`TabControl.xaml`) |
| Grid side panel close | Custom 28×28 raised 3D Win95/98 `×` caption button (`SidePanelCloseButton` + sticky `InlineSidePanelCloseButton` when `GameBannerHeight < 120` or `ShowBackgroundImageOnWindow=True`) |

## Deviations

- Uses crisp 2px nested `Border` bevels (`LocalRaisedBevelTemplate` / `LocalSunkenBevelTemplate`) with zero `DropShadowEffect` (unavailable per repo rules) and `ControlHeight=32` / `28px` menu rows to satisfy repo ergonomics while preserving authentic Win95/98 proportions.
- Uses `Tahoma, Segoe UI` (authentic Windows 98 system font) for UI body text and bundled OFL `Pixelify Sans` only at display sizes (`30px` title, `17px` `PLAY` button) so small labels stay crisp without bitmap-font aliasing artifacts.
- Menu icons are original 16-color VGA pixel-art PNGs generated procedurally by `art/icons.py` (no extracted Windows `shell32.dll` icons).

## Not verified yet

- `MenuRender.ps1` runs under 32-bit Windows PowerShell against Playnite's installed assemblies; interactive pointer hover/press transitions (`PlayButton`, `GridTileButton`, `SidebarItem`, `TopPanelItem`, `SecondaryButton`) and `ShowBackgroundImageOnWindow=True` art-contrast switching are checked inside live Playnite.
