# Studlock — theme notes

Shared layout, Playnite rules, build checks and game-page skeleton live in `src/themes/AGENTS.md`. This file records only what belongs to **Studlock**.

## 1. What this is

- **Mode:** `Showcase` dark desktop theme inspired by the molded charcoal ABS baseplate, studded violet header plaques, chamfered cerulean brick frames, canary yellow focus bars, and Technic axle controls of *LEGO Party!* (2025).
- **Unofficial notice:** Original fan theme; not affiliated with or endorsed by The LEGO Group, SMG Studio, or Fictions. Contains no official game artwork, logos, trademarks, minifigures, or proprietary fonts. Ships `info/NOTICE-Studlock.txt` and an original isometric 2×2 studded brick vector mark (`art/mark.svg`).

## 2. Sources

- Full measured reference notes, Game UI Database capture URLs (`id=2468`, 92 screens), median RGB samples, and motion analysis: [RESEARCH.md](RESEARCH.md).
- Creative lenses, 12-row game element map, and signature levers: [BRIEF.md](BRIEF.md).
- Bundled open fonts (`src/Typography/`): **Sora** (`Regular`, `Medium`, `SemiBold`, `Bold`; SIL OFL 1.1, `OFL-Sora.txt`) and **Nunito** (`Bold`, `ExtraBold`, `Black`; SIL OFL 1.1, `OFL-Nunito.txt`, subset to Latin + Cyrillic via `scripts/subset-theme-fonts.py`). Monospace uses Windows native `Consolas`.
- Procedural white-mask FX sprites (`art/sprites.py`, seed `20250930` -> `src/Images/fx/`): `stud-wall.png`, `stud-row.png`, `brick-seams.png`, `brick-sheen.png`, `brick-ticks.png`.

## 3. Tokens

All source-measured colors live in `src/tokens.css` under `--sl-*` names and map in `src/Constants.template.xaml`:

- **Baseplate & surfaces:** `WindowBackgourndBrush` / `ShellBackgroundBrush` / `TopPanelBackgroundBrush` = `--sl-baseplate` (`#222427`), `ContentBackgroundBrush` / `GameOverviewBackgroundBrush` = `--sl-canvas` (`#27292D`), `NormalBrushDark` / `PopupBackgroundBrush` / `ExpanderBackgroundBrush` = `--sl-panel` (`#2B2E33`), `NormalBrush` / `TooltipBackgroundBrush` = `--sl-surface` (`#31353B`), `ButtonBackgroundBrush` / `ListItemHoverBrush` = `--sl-surface-raised` (`#3A3E46`), `InputBackgroundBrush` = `--sl-surface-deep` (`#1B1D20`).
- **Selection & primary CTA:** `GlyphBrush` / `SelectedBrush` / `ListItemSelectedBrush` / `MenuItemHoverBrush` / `PrimaryButtonBackgroundBrush` / `GridViewItemSelectedBorderBrush` / `TopPanelItemCheckedBackgroundBrush` / `ProgressBarForegroundBrush` = `--sl-yellow` (`#FFE421`) with `TextBrushDark` / `SelectedForegroundBrush` / `PrimaryButtonForegroundBrush` = `--sl-ink` (`#161719`, 13.85:1).
- **Stage Violet chrome & banner tint:** `MainMenuButtonBackgroundBrush` / `WindowTitleBackgroundBrush` = `--sl-violet` (`#61459A`, 7.43:1 with white). `GameBannerTintBrush` = `--sl-violet-tint` (`#2B2142`) so ThemeModifier banner darkening washes hero art into the dark showtime stage purple rather than plain black.
- **Cerulean Brick frames & headers:** `PopupBorderBrush` / `FrameBrush` / `TopPanelSeparatorBrush` = `--sl-cerulean` (`#2B8FC4`), `HeaderBandBrush` = `--sl-cerulean-band` (`#2279A8`), `FocusBrush` / `LinkBrush` / `GridViewItemHoverBorderBrush` = `--sl-cerulean-lit` (`#4BB4E6`).
- **Semantic hue separation:** `RunningIndicatorBrush` = `--sl-green-run` (`#198840`, Wardrobe Equipped / P4 Green, >= 4.53:1 un-scrimmed with white), `DataChangeNotifBrush` = `--sl-aqua` (`#12DCE0`, Wardrobe `!` notification badge), `DangerBrush` = `--sl-red` (`#C9242B`, 5.57:1 with white).
- **Radii:** `CornerRadiusSmall` = `4`, `ControlCornerRadius` = `6`, `CornerRadiusLarge` = `8`, `CornerRadiusXLarge` = `10`, `CornerRadiusFull` = `999` (square/circular badges only).
- **Fonts:** `FontFamily` = `./Typography/#Sora, Sora, Segoe UI`; `HeadingFontFamily` = `./Typography/#Nunito, Nunito, Segoe UI`; `MonospaceFontFamily` = `Consolas`.

## 4. Component spacing

In `src/Common.xaml`: `ControlHeight` = `32`, `IconSize` = `16`, `GameBannerHeight` = `320`, `GameBannerDarken` = `0`, `ButtonPadding` = `12,5`, `InputPadding` = `9,5`, `MenuPadding` = `4,5`, `MenuItemPadding` = `8,4,10,4`, `ComboBoxDropDownPadding` = `4`, `ComboBoxItemPadding` = `8,4`, `ListBoxItemPadding` = `8,5`, `GroupBoxPadding` = `12,10,12,12`, `TooltipPadding` = `10,7`.

## 5. Shell

- **`Views/Sidebar.xaml` & `CustomControls/SidebarItem.xaml`:** `44px` matte charcoal ABS rail with faint violet stud relief (`stud-wall.png`) that meets the game list with no divider (the violet `EdgeSpine` is kept in the template but collapsed); crowned by a `44x50` studded violet Main Menu brick tile with a `3px` Canary Yellow bottom trim and `BrandMarkTemplate`; `44x40` rail items (`Padding="14,12"`, no `IconPadding` stacking) snap into Canary Yellow molded brick plates with dark ABS ink glyphs when active.
- **`Views/TopPanel.xaml` & `CustomControls/TopPanelItem.xaml`:** `50px` matte charcoal bar crowned at the top-right corner by a studded violet plaque (straight on the window edge, slanted on its left) and closed by a `2px` Cerulean Brick rule; order is menu (sidebar hidden), `240px` recessed `SearchBox` (`32px`), `32x32` filter toggle (`9px` Wardrobe Aqua circular pip `TextFilter`, no text label), `PART_PanelMainItems` (sorting at `Grid.Column="0"`, icon-only view switches snapping into Canary Yellow when active), notifications, plugins, and a `12px` segmented yellow brick `PART_ProgressGlobal`; `136px` reserved on right for `44x48` `MainWindowButton`s.
- **`Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml`:** full-strength `PART_ImageBackground` with soft bottom fade into `WindowArtSwatch`, spanning behind top bar and rail; `28px` filter controls and `28x28` preset buttons; all chrome surfaces turn transparent under `{Settings ShowBackgroundImageOnWindow}`.

## 6. Game page

Generated by `art/gen-overviews.mjs` (`scripts/overview-generator.mjs` + `scripts/game-page-breakpoints.mjs`):

- **Hero banner (`HeroArt`, `GameBannerHeight=320`):** framed along top/sides by a `3px` Cerulean Brick bezel with brick-seam highlights, `GameBannerDarken` + 50% floor layer, and a clean `GameOverviewBackgroundBrush` bottom gradient scrim (no `OpacityMask` behind animated Play). Proportional `MathConverter` spacers: `x * 214 / 320` (floor `18`) in Details, `x * 198 / 320` (floor `14`) in Grid.
- **Metadata pane (`GameDetailsPaneWidth=300`, `GridDetailsPaneWidth=300`, `GameDetailsPanePosition` Left / Center / Stretch / Right):** Cerulean-framed dark ABS dossier crowned by a segmented Cerulean header cap with 3 miniature circular studs; `10px` molded horizontal circular stud rows (`DividerTemplate` / `stud-row.png`) divide the 6 collapsing groups and collapse cleanly in `Center`/`Stretch` for continuous 3/2/1-column flow.
- **Side panel close button:** custom `28x28` chamfered octagonal-square molded ABS brick cap (`SidePanelCloseButton`), inline sticky left of game icon below `120px` banner height or under window background art, corner `12,12` at `>=120px` and when no game is selected; Brick Red hover (`120ms`).
- **Empty state (`EmptyGameTemplate`):** Loading-Screen studded dark card with violet stud trim and breathing isometric Golden 2×2 Brick emblem (`PART_ScrollViewHost` explicitly `Visibility="Visible"`).

## 7. Components

| Playnite Surface | Studlock Implementation |
| --- | --- |
| `PlayButton.xaml` | Molded Canary Yellow brick-seamed slab (`6px` radius, `2px` ABS ink rim, `3px` gold lip, `156x42`); hover sweeps glossy `brick-sheen.png` and snaps black-outlined golden `▶` cursor from left; press uses separate `PressedPlate`. |
| `DetailsViewItemStyle.xaml` | Hover fades slate plate + Cerulean left stud notch + `RowHoverAction` (`RowHoverRoom` `38px`); click/selection snaps Canary Yellow brick-seamed bar (`ScaleX 0.90->1`, `BackEase 0.16`) + sliding `▶` cursor + ABS ink `+3px` nudge. |
| `GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml` | Hover lifts cover (`Scale 1.024`) into Cerulean rim; selection locks Wardrobe `3px` Canary Yellow frame + white inner keyline + top downward `▼` cursor (`BackEase 0.24`); `50x50` molded brick Play (Yellow) & Info (Slate) hover buttons rise staggered (`55ms`). |
| `ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | `LocalMenuBoardTemplate` (`2px` Cerulean outer frame + `1px` ABS ink groove + `6px` studded Stage Violet crown); `30px` rows with Canary Yellow brick-seamed highlight + sliding `▶` cursor + ABS ink inversion; `10px` molded stud-row dividers; dark controller-prompt shortcut caps; Wardrobe green circular check badge; Brick Red Exit (`Alt+Q`). |
| `ScrollViewer.xaml` & `Slider.xaml` | Technic axle cylindrical track (`TrackFill` drops to `0.4` opacity on window art) + grooved light-grey Technic brick thumb; slotted Technic axle slider with notched white collar thumb + ThemeModifier banner-slider disable triggers. |
| `ProgressBar.xaml` | Vector tiled `LocalBrickTicksMaskBrush` (`DrawingBrush`) recreating the Minigame segmented vertical-brick yellow countdown bar (`8px` dialog / `12px` top bar). |
| `TreeView.xaml` & `StandardWindowStyle.xaml` | Bare `28px` `Sora` Settings rows with reserved vertical scroll lane (`WindowSettings` `248px`, `WindowExtensions` `280px`), Cerulean wash + `3px` Canary Yellow left bar + golden `▶` pip on selected; `44px` Studded Stage Violet title band (`CaptionHeight=44`) with trapezoid echo, ghosted 2×2 brick mark, and `44x44` `WindowBarButton`s. |
| `PropertyItemButton.xaml` & `TextBlockGameScore.xaml` | Molded 1×2 slate brick chips with left Cerulean stud pip (flipping Canary Yellow on hover); Standings 3D beveled rank score blocks. |
| `ToolTip.xaml`, `TabControl.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `GroupBox.xaml` | Yellow-capped charcoal tooltip card; segmented grey/yellow Settings tabs (`TabItem` keeps `TextBrush`); Wardrobe green check badge; circular yellow-core stud radio; content-sized Cerulean-capped `GroupBox`. |
| **Running game** | **Color:** Equipped Brick Green (`RunningIndicatorBrush` `#198840`, `LocalGreenBrightBrush` `#2CC856` accents). **Launching (`1.6s`):** segmented vertical-brick sweep (`LocalBrickTicksMaskBrush` `DrawingBrush` over travelling 3-stop mask) + filling segmented foot track + 3 circular green studs (`*Stud1/2/3`) popping sequentially (`RowRoom` `44px`, `PlayRoom` `34px`). **Running (`3.0s`):** quiet breathing frame (`0.72<->1`, button via `RunningBreath` `0.22<->0.42`), full segmented foot bar, staggered green stud pulse; button hover (`RelativeSource Self`) fades `RunningHoverDim` + white `Cancel` without resizing. |

## 8. Previews

- `art/preview-details.html` -> `art/screenshot-details.png` and `art/preview-settings.html` -> `art/screenshot-settings.png` (`1280x720`, zero `system font used` warnings, `layout ok`).
- Signature motifs shown: studded Stage Violet header band & top-right plaque, chamfered Cerulean Brick frames & segmented headers, Canary Yellow brick-seamed selection/Play with sliding golden `▶`/`▼` cursors and plastic sheen, molded circular stud-row dividers, Technic axle scrollbar & collar slider, segmented yellow brick timer bar, Wardrobe Aqua filter pip, and Equipped Brick Green running row with 3 studs.
- Fonts match Playnite 1:1 (`Sora` + `Nunito` bundled statically in `src/Typography/`; `Consolas` drawn via `Cascadia Mono` in headless previews).

## 9. Deviations

- Pause/modal buttons in *LEGO Party!* use full capsule (`999px`) ends; per repo WPF `CornerRadiusFull` guardrails, Studlock uses bounded `ControlCornerRadius` (`6px`) on variable-width buttons, chips, and tabs so plugins and narrow controls never distort into ovals, preserving the modular brick seams, lower plastic lip, and golden triangle cursor instead.
- `LocalBrickTicksMaskBrush` uses a vector tiled `DrawingBrush` rather than a bitmap `ImageBrush` so segmented ticks stay razor-sharp across 100%–200% DPI scaling and render identically in automated WPF test harnesses.

## 10. Not verified yet

- Check ThemeModifier live constant editing and Playnite Settings/Add-ons trees across non-English locales at 125% and 150% DPI scaling.
- `RunningIndicatorRegressionTests.ps1` and `RunningLabelOverlapRegressionTests.ps1` skip `details row` in the shared test harness due to `{MainViewModel ...}` in `RowHoverAction` (same baseline behavior across all themes; cover tile, list view row, and game page action all pass and `RunningMotionFrames.ps1` verified contrast at `>= 4.5:1`).
