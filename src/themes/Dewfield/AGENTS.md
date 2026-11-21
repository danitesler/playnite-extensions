# Dewfield — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by **Stardew Valley**'s handcrafted wooden ledger frames, warm honey parchment, walnut notice boards, and cozy pastoral pixel craft. Light theme (`Showcase` ambition), unofficial fan work with no official art, logos, or trademarks.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, pixel-sampled measurements, and source URLs are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (3 candidate lenses, source DNA, game element map, 6 shell/game-page levers, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

| Token | Key | Used for |
|-------|-----|----------|
| `--df-parchment-page` (`#FCE3A8`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `GameBannerTintBrush` | Calm warm honey-parchment page sheet & light-theme banner darkening color (washes banner art cleanly into the ledger page) |
| `--df-parchment` (`#FFD284`) | `NormalBrush`, `ExpanderBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `ScrollBarTrackBrush` | Store/Journal honey ledger surfaces, metadata card, active folder tabs |
| `--df-cream` (`#FFF2CC`) | `PopupBackgroundBrush`, `InputBackgroundBrush`, `ButtonBackgroundBrush`, `TooltipBackgroundBrush` | Calendar/Scroll bright cream inputs, buttons, tooltips, pinned notice-board menus |
| `--df-cream-hi` (`#FFF7DC`) | `PrimaryButtonForegroundBrush`, `DangerForegroundBrush`, `WindowArtForegroundBrush`, `MainMenuButtonForegroundBrush` | High-contrast cream ink on Meadow Green, Starwater Blue, Crimson, Walnut, and light-theme window background art |
| `--df-walnut` / `--df-walnut-mid` (`#522E08` / `#5E360C`) | `ShellBackgroundBrush`, `TopPanelBackgroundBrush` | Dark walnut notice-board sidebar rail, top panel, and Settings title band |
| `--df-wood-outline` (`#5B2B2A`) | `NormalBorderBrush`, `PopupBorderBrush`, `InputBorderBrush`, `ButtonBorderBrush`, `WindowPanelSeparatorBrush` | Universal 2px mahogany outer wood frame outline |
| `--df-ink` / `--df-ink-muted` / `--df-ink-deep` (`#56160C` / `#7A3410` / `#3B100A`) | `TextBrush`, `TextBrushDarker`, `TextBrushDark`, `HeadingForegroundBrush`, `SelectedForegroundBrush` | Mahogany body ink (> 9.7:1 on parchment), muted labels, deep selected ink |
| `--df-cedar` / `--df-cedar-hi` / `--df-amber` (`#B14E05` / `#DC7B05` / `#FA9305`) | `GlyphBrush`, `HighlightGlyphBrush`, `ScrollBarThumbBrush`, `SliderThumbBackgroundBrush`, `MainMenuButtonBackgroundBrush` | 3-step carved cedar bevel rims, scrollbars, slider knobs, signpost menu tile |
| `--df-selected` / `--df-hover` (`#F2A844` / `#F7BC6B`) | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `HoverBrush`, `ListItemHoverBrush` | Sun-amber selected planks & toasted honey row hovers |
| `--df-meadow` / `--df-meadow-hi` / `--df-energy` (`#1E6E19` / `#227C1D` / `#32AD14`) | `PrimaryButtonBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `ProgressBarForegroundBrush`, `PositiveRatingBrush` | Harvest Meadow-Green Play plaque, OK/DONE checkboxes, Energy progress bar |
| `--df-sky-run` (`#1162A8`) | `RunningIndicatorBrush`, `FocusBrush` | Dedicated Starwater Sky Blue running/launching indicator (distinct from Meadow Green Play, Amber selection, Crimson danger) |
| `--df-crimson` (`#B8240E`) | `DangerBrush`, `NegativeRatingBrush` | Iconic Red-X Close hover, Exit (`Alt+Q`) danger plank, negative score badge |
| `--df-quest-gold` (`#FFCA28`) | `DataChangeNotifBrush`, `PrimaryButtonGlowBrush`, `GridViewItemHoverBorderBrush` | Active filter golden `!` diamond pip, Play hover bevel glow, cover hover rim |

Fonts: `HeadingFontFamily` = `./Typography/#Pixelify Sans, Pixelify Sans, Segoe UI` (bundled OFL-1.1 static `PixelifySans-Regular.ttf`); `FontFamily` = `Segoe UI`; `MonospaceFontFamily` = `Consolas`. Radii: `CornerRadiusSmall` 2px, `ControlCornerRadius` 3px, `CornerRadiusLarge` 4px, `CornerRadiusFull` 9999 (1:1 circles only).

## ThemeModifier

`thememodifier.yaml` is generated at build time from `scripts/data/theme-keys.json`. `GameBannerTintBrush` uses solid `#FCE3A8` (`--df-parchment-page`) so banner darkening smoothly tones hero art into the sunlit parchment page. `GameBannerHeight` (default 320) and `GameBannerDarken` (default 0) disable cleanly in `DefaultControls/Slider.xaml` when `ShowBackgroundImageOnWindow=True`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Stardew Valley |
|-----|-------|---------------|
| `ControlHeight` | `32` | Standard 32px Create-Character inputs, combos, buttons |
| `IconSize` | `16` | Compact rail & top bar bespoke pixel-stepped glyphs |
| `GameBannerHeight` | `320` | Carved wooden picture-frame hero banner height (0..600) |
| `ButtonPadding` | `14,4` | 2px mahogany wood rim + 4px vertical padding = 32px |
| `InputPadding` | `9,4` | Sunken cream parchment text box inset |
| `MenuPadding` / `ComboBoxDropDownPadding` | `8,12,8,8` | Pinned notice-board parchment slip inset (clears thumbtack) |
| `MenuItemPadding` / `ComboBoxItemPadding` | `10,4` | Compact 30px menu & dropdown rows |
| `GroupBoxPadding` | `12,10,12,12` | Honey-parchment wooden ledger group box inset |
| `TooltipPadding` | `10,6` | Cream wooden item tooltip inset |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` + `CustomControls/SidebarItem.xaml` | 44px dark walnut notice-board rail with vertical plank grain (`wood-planks-v.png`), cedar-and-mahogany closing edge, cedar bevel `PART_ElemMainMenu` signpost tile holding the Sprout-Star emblem, and honey-parchment active folder tabs with 4px sun-amber left pegs |
| `Views/TopPanel.xaml` + `CustomControls/TopPanelItem.xaml` | 50px dark walnut notice-board top bar with horizontal plank grain (`wood-planks-h.png`) and 3-step cedar closing molding; 32px cream search box, 9px rotated golden `!` filter diamond pip, sorting-first `PART_PanelMainItems` with icon-only view switches, and 12px Energy-bar `PART_ProgressGlobal` |
| `Views/Library.xaml` | Calm honey-parchment workspace with 4% rag grain (`parchment-grain.png`) and full-strength `ShowBackgroundImageOnWindow` layer with soft bottom fade |
| `DerivedStyles/MainWindowStyle.xaml`, `StandardWindowStyle.xaml`, `WindowBarButton.xaml` | 28×28 cream-and-mahogany caption tiles (Red-X close flipping to solid Crimson on hover); 44px walnut Settings title band with Sprout-Star badge + ghosted watermark |
| `DefaultControls/TreeView.xaml` | Bare 28px Settings/Add-ons rows in body font, opacity-animated cream hover wash & sun-amber selection + 3px crimson pin, reserved `Visible` scroll lane for `WindowSettings` (248px) and `WindowExtensions` (280px) |

## Components

| Playnite file | Stardew Valley component |
|---------------|-------------------------|
| `DerivedStyles/PlayButton.xaml` | Harvest Meadow-Green wooden bevel plaque with 4 golden corner studs, 9-slice sunlit inner bevel glow (`wood-bevel-glow.png`), pixel sheen sweep (`pixel-sheen.png`), `BackEase` hover lift, and Starwater Sky Blue `RunningActionIndicator` |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Stacked Journal/Store rows: toasted honey hover + sliding 6px wooden pixel arrow + transparent `RowHoverAction` Play/Install buttons (`RowHoverRoom` 38px); golden-amber selected plank + 4px crimson pin; Starwater Sky Blue `RunningIndicator` |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Recessed cedar Inventory Tool Slots (`BackEase` hover lift + golden rim; Stardew Crimson active hotbar outline + cream corner studs on select); 52×52 Meadow-Green bevel `GridTileButton` hover controls |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | Unified Pinned Notice-Board slip (`LocalNoticeBoardTemplate`) with steel thumbtack pin, 3-step cedar bevel, 30px rows, sun-amber highlight plank + sliding pixel arrow, fence-post diamond knot dividers, sunken hotbar-slot keycaps, Crimson `Alt+Q` Exit, and Meadow-Green check boxes |
| `Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml` | Generated by `art/gen-overviews.mjs` + `scripts/game-page-breakpoints.mjs`: carved wooden picture-frame banner, Pixelify Sans title, Farmstead Wooden Ledger metadata card with rolled parchment scroll crown, custom 28×28 Red-X `SidePanelCloseButton`, `EmptyGameTemplate`, `GameDetailsPanePosition` Left/Center/Stretch/Right |
| **Running game levers** (`running-motion.md`) | **Hue:** Starwater Sky Blue (`#1162A8`). **Band profile:** segmented pixel water-cell sweep (`pixel-cells.png`). **Foot:** 2px irrigation progress line filling smoothly (`ScaleX`). **Mark:** 3 staggered rising starwater diamond sparkles inside a `RunningMarkPlate` gradient strip (`36px` row room / `32px` button room). **Timing:** `1.6s` launch cycle, `3.2s` calm idle breathing (`5.06:1` worst launching contrast, `7.09:1` running). |

## Previews

Generated from `art/preview-details.html` and `art/preview-settings.html` via `.\scripts\take-screenshots.ps1 -Extension dewfield`.
- **Signature motifs drawn:** Dark walnut notice-board rail & top bar with wood-plank grain; 3-step carved cedar wood bevels; rolled cream parchment `FARM LEDGER` crown & 4+1 Skill-Level pip dividers; Meadow-Green hovered Play plaque with golden corner studs & pixel sheen; Starwater Sky Blue running game row; Energy bar `E` meter; golden `!` filter diamond pip; Red-X wooden close tiles; bare 28px Settings tree & stepped folder tabs.
- **Stand-in fonts:** `Segoe UI` draws with bundled `Selawik`, `Consolas` draws with `Cascadia Mono`, and `Pixelify Sans` draws directly from bundled `PixelifySans[wght].ttf` (matching `src/Typography/PixelifySans-Regular.ttf`). Zero system-font warnings.

## Deviations

- `art/sprites.py` generates six deterministic white-mask RGBA sprites in `src/Images/fx/` (`wood-planks-h.png`, `wood-planks-v.png`, `parchment-grain.png`, `wood-bevel-glow.png`, `pixel-sheen.png`, `pixel-cells.png`).
- `art/gen-overviews.mjs` generates both game overview XAML files and invokes `scripts/game-page-breakpoints.mjs`.
- `preview-details.html` shows a compact visual `E` badge beside the global progress bar to illustrate the Energy Meter motif; runtime `TopPanel.xaml` renders Playnite's native `PART_ProgressGlobal` (12px tall) with the same emerald segmented pixel fill.

## Not verified yet

- None (validated with `validate-extension.ps1 -Mode Package`, WPF regression suite, `MenuRender.ps1`, `RunningMotionFrames.ps1`, and live Playnite deployment).
