# Ironward — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the menus, codex, and HUD of **DOOM: The Dark Ages** (id Software / Bethesda Softworks, 2025). Unofficial fan theme; contains no game art, logos, or proprietary font files.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, pixel measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (ambition, source DNA, game element map, signature moments, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

Tokens live in `src/tokens.css` under `--iw-*`; `src/Constants.template.xaml` maps Playnite palette keys and shared keys by role.

| Token | Key | Used for |
|-------|-----|----------|
| `iw-void` (`#041517`) | `ShellBackgroundBrush`, `GameBannerTintBrush`, `TextColorDark` | Compact rail, darkened banner cast |
| `iw-chrome` (`#092123`) | `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush` | 52px top bar, 44px dialog title band |
| `iw-surface` (`#0f2123`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | Library workspace, game page surface |
| `iw-panel` (`#15292c`) | `PopupBackgroundBrush`, `TooltipBackgroundBrush`, `ExpanderBackgroundBrush`, `NormalBrushDark` | Metadata card, popups, tooltips, group boxes |
| `iw-well` (`#193134`) | `NormalBrush`, `ButtonBackgroundBrush`, `HeaderBandBrush`, `PropertyItemBackgroundBrush` | Resting buttons, slate section bands, chips |
| `iw-well-deep` (`#0b191b`) | `InputBackgroundBrush`, `ProgressBarTrackBrush`, `SliderTrackBrush`, `CheckBoxCheckMarkBkBrush` | Sunken inputs, tracks, checkboxes |
| `iw-hover` (`#25484c`) | `HoverBrush`, `ListItemHoverBrush`, `ButtonHoverBackgroundBrush`, `TopPanelItemHoverBackgroundBrush` | Sea-steel hover wash (`03-difficulty` *Hurt Me Plenty*) |
| `iw-rule` / `iw-rule-lit` (`#8ba8aa` / `#b5d0d2`) | `TopPanelRuleStartBrush`, `TopPanelRuleEndBrush`, `HeadingRuleBrush`, `HeadingMarkerBrush`, `FrameBrush` | Spearhead-tipped silver-teal rules, corner barbs |
| `iw-ember-deep` / `iw-ember-aa` / `iw-ember` / `iw-ember-lit` | `PrimaryButtonBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `GlyphBrush`, `SelectedBorderBrush` | 6-point hexagonal Play/Save CTA, molten ember selections, active tab chevrons |
| `iw-ember-row` (`#6b2810`) | `SelectedBrush`, `ListItemSelectedBrush`, `TopPanelItemCheckedBackgroundBrush` | Left-fading molten ember row/tab selection |
| `iw-jade` (`#1d7a47`) | `RunningIndicatorBrush`, `PositiveRatingBrush` (lit `#3db56e`) | Dedicated running/launching Armor Jade indicator |
| `iw-gold-lit` (`#f3c75a`) | `DataChangeNotifBrush`, `WarningBrush`, `MixedRatingBrush` | Active filter diamond pip, warnings |
| `iw-steel-blue-lit` (`#7ab0df`) | `LinkBrush` | Links on dark surfaces |
| `iw-crimson` (`#a82c32`) | `DangerBrush`, `NegativeRatingBrush` | Close hover, destructive actions |
| `./Typography/#Cinzel, Georgia` | `HeadingFontFamily` | Game titles, section bands, Play/Save, dialog title band |
| `Segoe UI` | `FontFamily` | Settings rows, game list, metadata, descriptions |

`GameBannerTintBrush` uses `iw-void` (`#041517`) — the theme's deepest verdigris-iron surface — so darkening a banner in ThemeModifier cools bright art into Ironward's abyssal iron palette rather than flat neutral grey.

## ThemeModifier

Main surfaces (`ShellBackgroundBrush`, `ContentBackgroundBrush`, `TopPanelBackgroundBrush`, `GameOverviewBackgroundBrush`, `WindowBackgourndBrush`, `ExpanderBackgroundBrush`, `PopupBackgroundBrush`), button fills (`ButtonBackgroundBrush`, `PrimaryButtonBackgroundBrush`, `SecondaryButtonBackgroundBrush`), selection (`SelectedBrush`, `SelectedForegroundBrush`, `RunningIndicatorBrush`), inputs (`InputBackgroundBrush`), banner controls (`GameBannerHeight`, `GameBannerDarken`, `GameBannerTintBrush`), and metadata pane controls (`GameDetailsPaneWidth`, `GridDetailsPaneWidth`, `GameDetailsPanePosition`) are exposed through the shared catalog in `scripts/data/theme-keys.json`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Purpose |
|-----|-------|---------|
| `ControlHeight` | `32` | Standard form inputs, combos, and buttons (filter sidebar overrides to `28`) |
| `ButtonPadding` | `16,5` | Button inner padding |
| `InputPadding` | `10,5` | TextBox, PasswordBox, ComboBox inner padding |
| `GroupBoxPadding` | `14,12,14,14` | GroupBox body padding |
| `IconSize` | `16` | Toolbar & rail glyph size |
| `GameBannerHeight` | `300` | Default hero banner height (`0` to `600`) |
| `GameBannerDarken` | `0` | Default banner darkening (`0` to `1`) |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px `iw-void` left rail, `PART_ElemMainMenu` holding `LocalIronwardMenuMarkTemplate` (Common.xaml, also the top bar button), a saw-toothed heater shield with inner rim and gash, at top (hover fires a jade parry ring that snaps in and closes on the shield; open lifts and swells the shield while its rim and gash burn ember and breathe until the menu closes), 44x40 items with sea-steel hover wash and molten ember selected bar + 2px left edge; transparent when `ShowBackgroundImageOnWindow` is True |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px `iw-chrome` bar closed by a spearhead-tipped silver-teal rule (`DividerTemplate`); search -> filter (8px gold diamond pip) -> sorting first -> icon-only view switches with ember V-notch chevrons -> notifications -> 12px `PART_ProgressGlobal`; 132px right caption clearance |
| `Views/Library.xaml` | Full-strength `PART_ImageBackground` spanning behind top bar and rail with soft bottom gradient fade |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | Frameless 1px hairline window chrome, `40x32` main window buttons, `46x44` dialog caption buttons with `DangerBrush` close hover |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Side panels turning transparent on `ShowBackgroundImageOnWindow`; 28px filter controls and 28x28 preset buttons |

## Components

Both game overview files include a designed empty state (`EmptyGameTemplate` + `LOCErrorNoGameSelected`) with `PART_ScrollViewHost` explicitly `Visibility="Visible"` so a null DataContext or cleared selection never collapses the empty state.

`GameDetailsPaneWidth` and `GridDetailsPaneWidth` both default to `300` of usable metadata content inside the corner-winged verdigris card's `16px` horizontal padding. Both views use `scripts/game-page-breakpoints.mjs` and default `GameDetailsPanePosition` to `Right`. `Left` and `Right` put metadata beside the main content when the body fits the preferred width, the theme gap and 400 DIP for content. `Center` and `Stretch` put metadata above the main content at full width and hide the group dividers, allowing visible fields to flow in three columns at 900 DIP and above, two at 560–899 DIP, and one below 560 DIP of usable inner width.

| Playnite file | Source component |
|---------------|------------------|
| `DerivedStyles/PlayButton.xaml` | 6-point hexagonal molten ember CTA plate (`ChamferTemplate`) with `ember-glow.png` bloom and twin `spear-flare.png` tip streaks on hover; `Tag="ContextAction"` shares the exact shape |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Sea-steel hover wash, molten ember left-fading selection bar + left diamond cursor |
| `DerivedStyles/GridViewItemStyle.xaml`, `DerivedStyles/GridViewItemTemplate.xaml` | Static molten ember cover outline + corner marks; animated sea-steel hover frame + rising 52x52 dark-iron `Play`/`Info` tiles (`BackEase` 0.22, 50ms stagger) |
| **Running game** (`PlayButton.xaml`, `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `ListView.xaml`) | Armor Jade (`RunningIndicatorBrush` `#1d7a47`) frame + dark keyline; Launching sweeps an angled jade shield-slash (`RunningScan`, 1.6s cycle) + 2px foot fill + 3 staggered pulsing jade diamond motes (`RunningMote1..3`); Running breathes calmly (3.2s cycle) with full foot line and `Cancel` on `PlayButton` `IsMouseOver` (`RelativeSource Self`). `PlayRoom` reserves 28px right strip and `RowRoom` reserves 34px right strip with `RunningMarkPlate` |
| `DerivedStyles/StandardWindowStyle.xaml`, `DefaultControls/TreeView.xaml` | 44px `iw-chrome` dialog title band with Cinzel title, diamond marker, ghosted saw-shield watermark, and spearhead closing rule; minimal 28px bare TreeView rows in body font with sea-steel hover, ember selection bar + 2px edge, and reserved `Visible` scroll lane |
| `DefaultControls/Button.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `ComboBox.xaml`, `TabControl.xaml`, `GroupBox.xaml` | `ChamferTemplate` default buttons + `Width==41` 32x32 ThemeModifier scale trigger; ember CheckBoxes; 45-deg diamond RadioButtons; recessed sea-teal Slider with diamond thumb; `TabControl` ember V-notch active indicator; content-sized `GroupBox` cards |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | Menus/submenus/ComboBox/multi-select lists wear the verdigris-iron codex tablet (`LocalIronwardMenuTemplate`: stone mottle, diagonal corner barbs, silver-teal top rule with ember V-notch crown); 30px rows with 6-point hexagonal ember spear plate + hollow diamond cursor, 10px double-spearhead breaks, Cinzel chevron-flanked shortcuts, Boss Crimson Exit plate, forged diamond-ward checks |

## Previews

`art/preview-details.html` and `art/preview-settings.html` render via `.\scripts\take-screenshots.ps1 -Extension ironward` against `src/tokens.css` (`var(--iw-*)` tokens, zero hex literals).

- **Signature motifs drawn:** 52px verdigris-iron top bar closed by a spearhead-tipped silver-teal rule; active tab ember V-notch chevron + `spear-flare.png` glint; Shrine Gold diamond filter mark; 6-point hexagonal molten ember `PLAY` / `SAVE` CTA with 9-slice `ember-glow.png` bloom and twin tip flares; corner-winged metadata card & Settings window frame; vertical diamond-finial Settings splitter; sea-steel hover vs ember selected vs Armor Jade `RUNNING` row; `stone-grain.png` subtle iron mottle.
- **Stand-in fonts:** `Cinzel` renders natively via bundled `Cinzel` (`scripts/fonts/cinzel/`); `"Segoe UI"` renders via bundled `Selawik` (`scripts/fonts/selawik/`).

## Deviations

- Game descriptions (`PART_HtmlDescription`) use `Segoe UI` because Playnite's `HtmlTextView` resolves installed system fonts.
- Menu item icons: the theme's own 24-icon PNG set (`art/menu-icons.json` rendered to `src/Images/Banner/` by `scripts/render-menu-icons.mjs`; [docs/themes/menu-icons.md](../../../docs/themes/menu-icons.md)), never Playnite's stock glyphs.

## Not verified yet

- Interactive live Playnite check at 125% / 150% DPI scaling (hover repeatability on `PlayButton`, `GridViewItemTemplate`, `CloseGameSideBarCommand` scroll-under-120px, and ThemeModifier live recolor).
