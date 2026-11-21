# Rushdown — theme notes

Shared layout, Playnite rules, build checks and game-page skeleton live in `src/themes/AGENTS.md`. This file records only what belongs to **Rushdown**.

## 1. What this is

- **Mode:** `Showcase` dark desktop theme fusing *Street Fighter 6* (2023) **Fighting Ground / Shortcut Settings** luminous ultraviolet-indigo -> electric royal-purple -> neon magenta gradients, glowing titles, and `On`/`Off` switches with **World Tour Pause Mode** translucent deep teal-indigo glass cards, glowing aqua-teal tabs & diagonal ribbons, and sunburst amber-gold active rows / Confirm buttons, plus 6-block slanted Drive Gauge progress bars and Super Art pink/blue score gauges.
- **Unofficial notice:** Original fan theme; not affiliated with or endorsed by Capcom Co., Ltd. Contains no official game artwork, character art, logos, trademarks, or proprietary fonts. Ships `info/NOTICE-Rushdown.txt` and an original 3D isometric street-graffiti cube vector mark (`art/mark.svg`).

## 2. Sources

- Full measured reference notes, Game UI Database capture URLs (`id=1841`, 143 screens across 10 categories), median RGB samples, and motion analysis: [RESEARCH.md](RESEARCH.md).
- Creative lenses, 12-row game element map, and signature levers: [BRIEF.md](BRIEF.md).
- Bundled open fonts (`src/Typography/`): **Barlow** (`Regular`, `Medium`, `SemiBold`, `Bold`; SIL OFL 1.1, `OFL-Barlow.txt`) and **Rajdhani** (`SemiBold`, `Bold`; SIL OFL 1.1, `OFL-Rajdhani.txt`, subset to Latin + Cyrillic via `scripts/subset-theme-fonts.py`). Monospace uses Windows native `Consolas`.
- Procedural white-mask FX sprites (`art/sprites.py`, seed `20230602` -> `src/Images/fx/`): `ice-facet.png` (`256x64`), `prism-splash.png` (`128x128`), `prism-sheen.png` (`256x64`), `drive-segments.png` (`18x36`), plus crisp DPI-independent vector `DrawingBrush` `LocalDriveSegmentsMaskBrush`.

## 3. Tokens

All source-measured colors live in `src/tokens.css` under `--rd-*` names and map in `src/Constants.template.xaml`:

- **Ultraviolet midnight-indigo shell & canvas:** `WindowBackgourndBrush` / `ShellBackgroundBrush` / `TopPanelBackgroundBrush` = `--rd-shell` (`#100526`), `ContentBackgroundBrush` / `GameOverviewBackgroundBrush` = `--rd-canvas` (`#120529`), `PopupBackgroundBrush` / `TooltipBackgroundBrush` = `--rd-panel` (`#1C063E`), `NormalBrush` = `--rd-surface` (`#260A52`), `InputBackgroundBrush` / `TopPanelSearchBoxBackgroundBrush` = `--rd-void` (`#0A0318`).
- **Fighting Ground neon violet-magenta gradients:** `--rd-grad-start` (`#4A1296`) -> `--rd-grad-mid` (`#7A1CB0`) -> `--rd-grad-end` (`#A822BE`) on sidebar selection, Play button (`#5214A6`->`#B020C0`), `On` switches (`#7218B0`->`#A826C4`), menus, and scrollbars, rimmed with `--rd-ice-rim` (`#FFE0FF`) and `--rd-magenta-neon` (`#E046FF`).
- **World Tour Pause Mode aqua-teal glass:** `LocalTealGlassCardBrush` (`#102446` -> `#092B44` -> `#062238`), `LocalTealBorderBrush` (`#1A8E9E`), `LocalTealGlowBrush` (`#28DCE4`), `LocalTealTextBrush` (`#72E8EE`), `LocalTealBarBrush` (`#092034`), `LocalTealTabActiveBrush` (`#0A6470` -> `#0D7D88` -> `#28DCE4`, with crisp `1.5px` white border), `LocalTealRibbonBrush` (`#0A6470` -> `#0D7D88` -> `#1A8E9E`) across metadata dossiers, `TabControl`, active `TopPanelItem`, `GroupBox`, `LocalNotesTextBox`, section ribbons, hovered game rows, and resting metadata chips.
- **World Tour Pause Mode sunburst amber-gold:** `LocalSunburstGoldBrush` (`#E68A14` -> `#F6B432` -> `#FFD252`) with `LocalGoldRimBrush` (`#FFF099`), `LocalGoldGlowEffect` (`#FFB424`), and crisp obsidian ink `TextBrushDark` (`#0C041A`) on selected game rows (`DetailsViewItemStyle`), `Button IsDefault="True"` Confirm actions, and hovered metadata chips (`PropertyItemButton`).
- **Drive Gauge & Super Art semantic gauges:** 6-block slanted Drive Gauge progress bars (`--rd-drive-block-fill` `#17621F`, `--rd-drive-block-rim` `#53F83C`, `LocalDriveBlocksBrush` / `LocalDriveEmptyBlocksBrush`), running indicator (`--rd-drive-run` `#168736`), and Super Art slanted score gauges (Critic `--rd-score-pink` `#CD1B79` / `#FF2B92` glow; Community `--rd-score-blue` `#1A6BCE` / `#2B8BFF` glow).
- **Radii:** `CornerRadiusSmall` = `2`, `ControlCornerRadius` = `4`, `CornerRadiusLarge` = `6`, `CornerRadiusXLarge` = `8`, `CornerRadiusFull` = `999` (square/circular elements only).
- **Fonts:** `FontFamily` = `./Typography/#Barlow, Segoe UI`; `HeadingFontFamily` = `./Typography/#Rajdhani, Segoe UI`; `MonospaceFontFamily` = `Consolas`.

## 4. Component spacing

In `src/Common.xaml`: `ControlHeight` = `32`, `IconSize` = `16`, `GameBannerHeight` = `320`, `GameBannerDarken` = `0`, `ButtonPadding` = `12,5`, `InputPadding` = `9,5`, `MenuPadding` = `4,5`, `MenuItemPadding` = `8,4,10,4`, `ComboBoxDropDownPadding` = `4`, `ComboBoxItemPadding` = `8,4`, `ListBoxItemPadding` = `8,5`, `GroupBoxPadding` = `12,10,12,12`, `TooltipPadding` = `10,7`.

## 5. Shell

- **`Views/Sidebar.xaml` & `CustomControls/SidebarItem.xaml`:** `44px` midnight indigo rail closed by a `1px` steel-indigo hairline + `76px` Battle Hub Cyan segment, crowned by a `44x48` isometric graffiti cube Main Menu tile (`BrandMarkTemplate`) with `2.5px` Neon Magenta laser top trim; `44x40` rail items (`Padding="14,12"`, no `IconPadding` stacking) snap into Prismatic White-Ice plates with `#0E1220` ink when selected.
- **`Views/TopPanel.xaml` & `CustomControls/TopPanelItem.xaml`:** `50px` midnight indigo bar closed by a Neon-Magenta-to-Cyan gradient laser rule; order is menu (sidebar hidden), recessed `SearchBox` (`#070912`), `32x32` filter toggle (`8px` rotated Spray Orange diamond/cube pip `TextFilter`, zero text label), `PART_PanelMainItems` (sorting at `Grid.Column="0"`, icon-only view switches), notifications, plugins, and `12px` slanted Drive Gauge `PART_ProgressGlobal`; `136px` right clearance.
- **`Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml`:** full-bleed `PART_ImageBackground` behind chrome; compact dark-indigo filter/explorer controls; all chrome surfaces turn transparent under `{Settings ShowBackgroundImageOnWindow}`.

## 6. Game page

Generated by `art/gen-overviews.mjs` (`scripts/overview-generator.mjs` + `scripts/game-page-breakpoints.mjs`):

- **Hero banner (`HeroArt`, `GameBannerHeight=320`):** top/side steel-indigo frame, `GameBannerDarken` + floor layer, and clean `GameOverviewBackgroundBrush` bottom fade (no `OpacityMask` behind animated Play). Proportional `MathConverter` spacers in Details & Grid views.
- **Metadata pane (`GameDetailsPaneWidth=300`, `GridDetailsPaneWidth=300`, `GameDetailsPanePosition` Left / Center / Stretch / Right):** midnight-indigo dossier pane with `10px` diamond-capped technical callout dividers (`DividerTemplate`) that collapse cleanly in `Center`/`Stretch` for continuous 3/2/1-column flow. `PART_ImageIcon` hides cleanly via `DataTrigger` when `Source == null`.
- **Empty state (`EmptyGameTemplate`):** arcade standby emblem card (`PART_ScrollViewHost` explicitly `Visibility="Visible"`).

## 7. Components

| Playnite Surface | Rushdown Implementation |
| --- | --- |
| `PlayButton.xaml` | 45-deg top-right chamfered Fighting Ground Neon Magenta (`#C4168C`) slab (`M 0,0 L 148,0 L 162,13 L 162,42 L 0,42 Z`, `MinWidth="162"`, `Height="42"`) with `#FF3CE0` rim and `Rajdhani` Bold text; hover brightens (`#D91E9D`), illuminates inner glow border, sweeps `prism-sheen.png`, and snaps `>>` chevrons; press uses `PressedPlate` (`#96106A`). |
| `DetailsViewItemStyle.xaml` | Hover fades chamfered indigo capsule + `1px` Cyan rim + `3px` Cyan left tick + `RowHoverAction` (`RowHoverRoom` `38px`); selection scales in Prismatic Faceted White-Ice crystal (`#E4F0FC` + `ice-facet.png`, `ScaleX 0.90->1`, `140ms CubicEase`) + `4px` Neon Magenta strike bar + dark ink `>>` chevron + `+3px` nudge. |
| `GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml` | Hover lifts cover (`Scale 1.024`) into Electric Cyan frame; selection locks `3px` Prismatic White-Ice frame + `1px` Neon Magenta rim + `16x16` Challenger Gold top-left corner triangle (`BackEase 0.24`); `50x50` chamfered `GridTileButton` Play (Neon Magenta) & Info (Midnight Indigo + Cyan rim) buttons rise staggered (`55ms`). |
| `ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | `LocalMenuBoardTemplate` (midnight indigo `#13182B`, `1.5px` `#4D5E91` border, `2.5px` Neon Magenta top crown with Information downward V-notch, 5.5% `prism-splash.png` mist); `30px` rows with Prismatic White-Ice highlight (`ScaleX 0.91->1`, `120ms CubicEase`) + `3px` Neon Magenta strike + sliding `>` chevron + `#0E1220` ink; `10px` `DividerTemplate`; dark bumper shortcut pills; `15x15` Cyan gem check; Burnout Crimson Exit (`Alt+Q`). |
| `ScrollViewer.xaml`, `Slider.xaml`, `ProgressBar.xaml` | `4px` electric-blue scrollbar thumbs (`CornerRadius="2"`, `TrackFill` drops to `0.4` opacity on window art); `8x18` vertical needle slider thumb over Cyan `SliderRangeButton` fill + ThemeModifier banner-slider disable triggers; slanted 6-segment Drive Gauge `ProgressBar` (`LocalDriveSegmentsMaskBrush`). |
| `Button.xaml`, `ToggleButton.xaml`, `CheckBox.xaml`, `RadioButton.xaml` | `32px` min-height buttons with ThemeModifier `Width="41"` `ScaleTransform(0.7804878048780488)` square trigger & Neon Magenta `IsDefault`; Prismatic White-Ice checked `ToggleButton`; `18x18` chamfered Cyan `CheckBox` (`M 0,0 L 14,0 L 18,4 L 18,18 L 4,18 L 0,14 Z`); circular reticle diamond `RadioButton`. |
| `TextBox.xaml`, `PasswordBox.xaml`, `TabControl.xaml`, `GroupBox.xaml`, `Expander.xaml` | `#070912` inputs with Cyan top focus bar + `BareTextBox` (`MinHeight="0"`); Royal-blue glow underline `TabItem`s (keeping `TextBrush`); content-sized diagonal-cyan `HeaderBandBrush` `GroupBox`; `Expander` header turns `Transparent` on window background art. |
| `TreeView.xaml`, `ListBox.xaml`, `ListView.xaml`, `StandardWindowStyle.xaml` | Bare `28px` Settings `TreeView` rows (`WindowSettings` `248px`, `WindowExtensions` `280px` + Prismatic White-Ice bar); Prismatic White-Ice `ListBoxItem` & `ListViewItem` (implicit `ListViewItem` only, Drive Green running sweep); `44px` Midnight Indigo window header (`CaptionHeight=44`) + cube emblem. |
| **Running game** | **Color:** Drive Gauge Overdrive Green (`RunningIndicatorBrush` `#168736`, `--rd-drive-lime` `#7CE826` accents). **Launching/Running:** slanted 6-segment Drive band (`LocalDriveSegmentsMaskBrush`) + slanted foot bar + 3 slanted Drive Impact chevrons (`RowRoom` `44px` in details, inset `Margin="4"` in grid, Play button keeps exact chamfered polygon shape via `RunningBreath` `0.22<->0.42` and swaps to `Cancel` via `RunningHoverDim` on hover). |

## 8. Previews

- `art/preview-details.html` -> `art/screenshot-details.png` and `art/preview-settings.html` -> `art/screenshot-settings.png` (`1280x720`, zero `system font used` warnings, `layout ok`).
- Fonts match Playnite 1:1 (`Barlow` + `Rajdhani` bundled statically in `src/Typography/`; `Consolas` monospace).

## 9. Deviations

- Source pill buttons and some rounded HUD badges in *Street Fighter 6* use full capsule (`999px`) ends; per repo WPF `CornerRadiusFull` guardrails, Rushdown uses bounded `4px` (`ControlCornerRadius`) / `6px` (`CornerRadiusLarge`) or 45-deg chamfered `Path` geometry (`PlayButton`, `GridTileButton`, `CheckBox`) on variable-width controls so narrow controls and plugins never distort into ovals.
- `LocalDriveSegmentsMaskBrush` uses a vector tiled `DrawingBrush` alongside bitmap `ice-facet.png` / `prism-splash.png` / `prism-sheen.png` masks so Drive Gauge segments stay razor-sharp across 100%–200% DPI scaling.

## 10. Not verified yet

- Check ThemeModifier live constant editing and non-English Settings/Add-ons trees at 125% and 150% DPI scaling.
- Re-check WPF regression tests after any future shared overview generator changes.
