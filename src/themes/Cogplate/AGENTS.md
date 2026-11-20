# Cogplate — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the retro-industrial ordnance screens, CRT visor readouts, and nailed parchment requisitions of **Warhammer 40,000: Boltgun 2**. Unofficial fan theme; contains no game art, logos, copyrighted text, or proprietary font files.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, pixel measurements, and screenshot palette samples are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (ambition, source DNA, game element map, signature moments, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

Tokens live in `src/tokens.css` under `--cg-*`; `src/Constants.template.xaml` maps Playnite palette keys and shared keys by role.

| Token | Key | Used for |
|-------|-----|----------|
| `cg-iron-dark` (`#0C100D`) | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush` | 44px compact rail, 52px top bar, 44px dialog header |
| `cg-iron` (`#101511`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | Library workspace and game page: green-leaning black like the menu alcove, never neutral grey |
| `cg-steel-plate` (`#121C15`) / `cg-steel-lit` (`#1C2B20`) | `ButtonBackgroundBrush`, `MainColor`, `SecondaryButtonBackgroundBrush`; `HoverColor`, `ListItemHoverBrush` | Idle menu-plate glass (sampled from the unselected OPTIONS plate) and its hover |
| `cg-steel-rim` (`#5F5A46`) / `cg-steel-hi` (`#958A6C`) / `cg-bezel-dark` (`#26241B`) | `FrameBrush`, `ButtonBorderBrush`, `InputBorderBrush`, `WindowPanelSeparatorBrush`, `LocalBezelBrush`; `FrameHoverBrush`, `ScrollBarThumbBrush`, `LocalBezelLitBrush`; `LocalBezelDarkBrush` | The worn bronze-khaki bezel every source panel and button wears (despite the `steel` names), its lit edge and the dark keyline between bezel and glass |
| `cg-crt-deep` (`#0A140C`) | `InputBackgroundBrush`, `TooltipBackgroundBrush`, `GameBannerTintBrush`, `MainMenuButtonBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush`, `LocalCrtDeepBrush` | Recessed CRT phosphor wells, tooltips, darkened banner cast, Settings tree casing |
| `cg-crt` (`#112015`) | `PopupBackgroundBrush`, `ExpanderBackgroundBrush`, `HeaderBandBrush`, `PropertyItemBackgroundBrush`, `LocalCrtBrush` | Popups, group cards, section header bands, metadata tag chips, dossier cap |
| `cg-crt-lit` (`#1A3022`) | `PrimaryButtonBackgroundBrush`, `SelectedBrush`, `ListItemSelectedBrush`, `TopPanelItemCheckedBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `LocalCrtHoverBrush` (`#22402B`) | Chamfered CRT Play/Save CTA, luminous green selections, checked top toggles |
| `cg-mint` (`#8AF0A8`) / `cg-mint-hot` (`#D8FBE0`) | `GlyphBrush`, `PrimaryButtonGlowBrush`, `FocusBrush`, `TabItemIndicatorBrush`, `GridViewItemHoverBorderBrush`, `LinkBrush`, `LocalLedHotBrush` | Glowing phosphor mint rims, twin vertical LED end-capsules, focus brackets, active tab bars |
| `cg-lime` (`#9CB41C`) / `cg-lime-lit` (`#C9E33E`) | `CheckMarkBrush`, `DataChangeNotifBrush`, `ProgressBarForegroundBrush`, `PositiveRatingBrush` | Acid-lime pill CheckBox toggles, active filter LED, HUD progress bars |
| `cg-brass` (`#9A7942`) / `cg-brass-lit` (`#D8A84E`) | `LocalBrassBrush`, `HeadingMarkerBrush`, `GridViewItemSelectedBorderBrush`, `WarningBrush`, `MixedRatingBrush` | Tarnished brass chain trim, corner miters, diamond markers, selected cover frames |
| `cg-conduit` (`#942B28`) / `cg-blood-stain` (`#6E2318`) | `DangerBrush`, `LocalConduitBrush`, `LocalBloodStainBrush`, `ParchmentTitleBrush` | Close button hover, decorative cable conduit traces, dossier wax-seal rivet |
| `cg-parchment` (`#D3C19E`) | `ParchmentBrush`, `ParchmentEdgeBrush` (`#7A674D`), `ParchmentTextBrush` (`#241F17`), `ParchmentLabelBrush` (`#544736`), `ParchmentLinkBrush` (`#174525`) | Nailed aged-parchment Field Dossier surface and dark forest/umber inks |
| `cg-armor` (`#245CE0`) / `cg-armor-lit` (`#4D85FF`) | `RunningIndicatorBrush`, `LocalArmorLitBrush` | Dedicated HUD Armor Cobalt hue reserved for Launching / Running states |
| `./Typography/#Barlow Condensed` | `HeadingFontFamily`, `PosterFontFamily` | Game titles, section bands, Play/Save/Default CTAs, dialog title (`SemiBold`/`Bold` only) |
| `./Typography/#Barlow Semi Condensed` | `FontFamily` | Settings rows, game list, metadata dossier, body copy |

`GameBannerTintBrush` uses `cg-crt-deep` (`#0A140C`) so darkening a banner in ThemeModifier tints bright game artwork into Cogplate's deep CRT phosphor green cast rather than muddy gray.

## ThemeModifier

Surface plates (`ShellBackgroundBrush`, `ContentBackgroundBrush`, `TopPanelBackgroundBrush`, `GameOverviewBackgroundBrush`, `WindowBackgourndBrush`, `ExpanderBackgroundBrush`, `PopupBackgroundBrush`), button fills (`ButtonBackgroundBrush`, `PrimaryButtonBackgroundBrush`, `SecondaryButtonBackgroundBrush`), selection (`SelectedBrush`, `SelectedForegroundBrush`, `RunningIndicatorBrush`), inputs (`InputBackgroundBrush`), banner controls (`GameBannerHeight`, `GameBannerDarken`, `GameBannerTintBrush`), and metadata layout controls (`GameDetailsPaneWidth`, `GridDetailsPaneWidth`, `GameDetailsPanePosition`) are registered via `scripts/data/theme-keys.json`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Purpose |
|-----|-------|---------|
| `ControlHeight` | `32` | Standard form inputs, combos, and buttons (filter sidebar uses `28`) |
| `ButtonPadding` | `18,5` | Button inner padding |
| `InputPadding` | `10,5` | TextBox, PasswordBox, ComboBox inner padding |
| `GroupBoxPadding` | `14,12,14,14` | GroupBox inner padding |
| `IconSize` | `16` | Toolbar and rail icon size |
| `GameBannerHeight` | `300` | Default hero banner height (`0` to `600`) |
| `GameBannerDarken` | `0` | Default banner darkening (`0` to `1`) |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px `cg-iron-dark` left rail, top 12-tooth cogwheel menu trigger (`PART_ElemMainMenu`), 44x40 items with steel hover wash and CRT green selection + 3px mint LED edge; transparent when `ShowBackgroundImageOnWindow` is True |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px `cg-iron-dark` bar crowned by a bronze chain strip and closed by an engraved bronze groove (`DividerTemplate`, no centre pip); search -> filter (`9px` glowing lime LED pip) -> sorting first -> icon-only view switches with CRT green + bottom mint LED bar -> notifications -> progress readout (condensed sage `PART_TextProgressText` beside a 140x12 `PART_ProgressGlobal`, never printed over it); 132px right caption clearance |
| `Views/Library.xaml` | Full-window `PART_ImageBackground` behind top bar and rail with soft top/bottom gunmetal fades |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | Frameless 1px steel window border, `40x32` main window caption buttons, `46x44` dialog buttons with `DangerBrush` close hover |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Side panels turning transparent on `ShowBackgroundImageOnWindow`; 28px filter controls and 28x28 preset buttons |

## Components

Both game overview files include `EmptyGameTemplate` (a riveted CRT viewport with cracked glass hairline, subtle scanlines, cogwheel crest, and `LOCErrorNoGameSelected`) with `PART_ScrollViewHost` explicitly `Visibility="Visible"` so a cleared selection or null DataContext never hides the empty state.

`GameDetailsPaneWidth` and `GridDetailsPaneWidth` both default to `300` of usable metadata content inside the dossier's `16px` horizontal padding. Both views use `scripts/game-page-breakpoints.mjs` and default `GameDetailsPanePosition` to `Right`. `Left` and `Right` place metadata beside main content when the body fits `GameDetailsPaneWidth + 24 + 400` DIP; `Center` and `Stretch` place metadata full-width above main content and hide group dividers so visible items flow sequentially across 3 columns at 900+ DIP, 2 at 560–899 DIP, and 1 below 560 DIP.

| Playnite file | Source component |
|---------------|------------------|
| `DerivedStyles/PlayButton.xaml` | The lit PLAY GAME plate: octagonal CRT green glass (`ChamferTemplate`) in a 3px worn bronze bezel with a lit edge and dark keylines, faint 9-slice mint bloom at rest (0.12, 0.55 on hover) and twin vertical mint LED end-capsules (`LocalLedGlowTemplate` + `LocalLedHotBrush`); `Tag="ContextAction"` shares the same plate |
| `Common.xaml` bezel kit | `LocalBezelTemplate` (dark keyline, 3px bronze band with lit edge, dark inner keyline, scanlined glass) is the one plate for buttons, keycaps, title capsules and the dialog mark; `LocalLedStubTemplate` the end LEDs; `LocalChevronRowTemplate` the Options-row selection (ivory outline, rounded left, pointed right); `DividerTemplate` an engraved groove; `LocalCapsHeadingTemplate` uppercase capsule text; `LocalDossierLabel` the dossier caption |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml`, `ListBox.xaml`, `TreeView.xaml` | No row separators; hover a glass wash with a bronze chevron outline; selected the game's Options row: lit CRT glass inside an ivory outline with a rounded left end and a pointed chevron on the right (`LocalChevronRowTemplate`). Settings tree rows idle in sage, ivory when selected |
| `DefaultControls/Expander.xaml` | Library group header (`LocalGroupHeaderStyle`, local so ComboBox and filter toggles keep `ExpanderDownHeaderStyle`): 32px scanlined glass strip closed by a bronze groove, condensed label, mint chevron turning a quarter turn when open |
| Game page headings | Description and Notes are title capsules like SELECT DIFFICULTY: content-sized bezel plate with uppercase condensed ivory text, then a groove to the right edge |
| `DerivedStyles/GridViewItemStyle.xaml`, `DerivedStyles/GridViewItemTemplate.xaml` | Static brass corner marks + top/bottom mint LED pips on selection; animated mint bloom hover frame + rising 48x48 chamfered `GridTileButton` keycaps (`BackEase` 0.22, 50ms stagger) |
| **Running game** (`PlayButton.xaml`, `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `ListView.xaml`) | Dedicated HUD Armor Cobalt (`RunningIndicatorBrush` `#245CE0` / `LocalArmorLitBrush` `#4D85FF`) frame + dark keyline; Launching sweeps an angled cobalt `RunningScan` (1.6s cycle) + segmented (`LocalSegmentedCellsMaskBrush`) foot fill + 3 staggered pulsing cobalt chevron motes (`RunningMote1..3`); Running breathes calmly (3.2s cycle) with filled segmented bar and `Cancel` on `PlayButton` `IsMouseOver` (`RelativeSource Self`). `PlayRoom` reserves 30px right strip and `RowRoom` reserves 34px right strip with `RunningMarkPlate` |
| `DerivedStyles/StandardWindowStyle.xaml`, `DefaultControls/TreeView.xaml` | 44px `cg-iron-dark` dialog header trimmed with top chain links, shoulder conduit curve, CRT cog badge in a bronze bezel, uppercase `Barlow Condensed` title, ghosted cogwheel watermark, and a bronze rule; minimal 28px bare TreeView rows inside a recessed CRT casing (`WindowSettings` 250px, `WindowExtensions` 280px) with reserved `Visible` scroll lane |
| `DefaultControls/Button.xaml` | The idle menu plate (OPTIONS / NO): `LocalBezelTemplate` around `#121C15` glass, condensed SemiBold sage label that turns ivory on hover while the end LED stubs light (hidden below 72px wide, so More/Edit and icon buttons stay clean); `IsDefault` is the lit plate with mint LEDs; disabled fades to 0.45 |
| `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `ComboBox.xaml`, `TabControl.xaml`, `GroupBox.xaml` | `Width==41` ThemeModifier scale trigger on buttons; 34x18 acid-lime pill CheckBox toggles; octagonal CRT RadioButtons; flanged steel I-beam Sliders; segmented `ProgressBar`; 32px CRT `ComboBox` with FilterPanel swap; glowing mint `TabItem` bottom bar; content-sized `GroupBox` cards |
| `DerivedStyles/PropertyItemButton.xaml`, `DerivedStyles/TextBlockGameScore.xaml` | Links in the same sepia ink as plain values, turning forest green and underlined on hover; captions in condensed SemiBold sepia at the value's size (120px caption column in details view); dark ink badges (`TextBlockGameScore`) tailored for the aged-parchment dossier alongside dark CRT `Tag="Chip"` taxonomy pills |
| Menus (`ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `ComboBoxList.xaml`, `FilterSelectionBox.xaml`) | Ordnance CRT visor panel (`LocalOrdnanceCrtPanelTemplate`: scanline phosphor glass, 2px armored steel bezel, 6px tarnished brass chain-link top strip, four 4px brass corner rivets), 30px rows taking an octagonal chamfered CRT green plate with twin vertical hot-mint LED end-capsules, steel rail bolted between brass bolt heads for group breaks, recessed CRT monospace shortcut wells, chamfered conduit-crimson Exit plate with ivory LEDs/text, acid-lime LED pill checked rows. |

## Previews

`art/preview-details.html` and `art/preview-settings.html` render via `.\scripts\take-screenshots.ps1 -Extension cogplate` against `src/tokens.css` (`var(--cg-*)` tokens).

- **Signature motifs drawn:** 52px top bar trimmed by `chain-trim.png` links and an engraved bronze groove; bronze-bezel plates for Play, More/Edit, Save/Cancel and the SCREENSHOTS / DESCRIPTION capsules; chevron-tipped selected rows in the list and Settings tree; luminous lime pill filter pip; chamfered CRT green `PLAY`/`SAVE` plates with 9-slice `bloom.png` glow and `led-glow.png` end-capsules; CRT-capped nailed aged-parchment (`ParchmentBrush`, `parchment-grain.png`, `parchment-stain.png`) metadata dossier; acid-lime capsule toggles and steel I-beam sliders; HUD Armor Cobalt segmented running game indicators; `glass-cracks.png` empty visor plate.
- **Stand-in fonts:** Both `Barlow Condensed` (`SemiBold`, `Bold`) and `Barlow Semi Condensed` (`Regular`, `SemiBold`, `Bold`) are SIL Open Font License TTFs bundled directly in `src/Typography/` (subsetted to Latin & Cyrillic).

## Deviations

- Game descriptions (`PART_HtmlDescription`) bind `{DynamicResource FontFamily}` (`Barlow Semi Condensed`), while Playnite's Chromium/CEF HTML renderer falls back to `Segoe UI` if local custom font resolution isn't supported in the host web view.
- Playnite's built-in menu icon glyphs (`ExitIcon`, `RemoveGameIcon`, `AddFavoritesIcon`) remain icofont glyphs recolored to theme brushes.

## Not verified yet

- Bronze-bezel pass (2026-11-20): seen live in details view and grid view with the side panel (rows, chevron selection, group header, Play and keycaps at rest, dossier, title capsules, top-bar progress readout). Rendered in the x86 harness: buttons (idle, default, disabled), Settings tree, tabs, inputs. Not seen live: button hover/press LEDs, the Settings window and dialog title band, context menus, ListBox rows in dialogs. `RunningIndicatorRegressionTests` / `RunningLabelOverlapRegressionTests` still stop at the details row's `{MainViewModel}` hover buttons (harness gap shared by every theme); the button, cover and list checks pass.

- Interactive live Playnite check at 125% / 150% DPI scaling (`PlayButton` hover repeatability, `GridViewItemTemplate` hover fade-out, `CloseGameSideBarCommand` narrow-mode sticky scroll, and ThemeModifier live recolor).
