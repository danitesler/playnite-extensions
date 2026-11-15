# Gilded Rift — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the **League of Legends** client and **League of Legends: Wild Rift**: blue-black navy panels closed by thin gold bevels, a roster of rows with a gold selection bar, notched plates and diamonds, a winged Play plate, and hextech teal as the one live colour. Unofficial and not affiliated with Riot Games: no logo, art or font from either game, own name, `info/NOTICE-GildedRift.txt`. Showcase ambition (see `BRIEF.md`).

**Status: unvalidated.** Written on a Linux machine with no PowerShell, .NET or WPF, so it has not been built, validated or loaded in Playnite. The implementation brief, the measurements and the Windows follow-up list are in [`HANDOFF.md`](HANDOFF.md); start there.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, measurements and the capture list are in [`RESEARCH.md`](RESEARCH.md) (Interface In Game captures of the PC client and Wild Rift, spot-sampled with PIL; the full palette ladders are recalled, not read from a file, and only the darkest blue-black, the gold and teal midtones were confirmed by sampling). Creative brief (source DNA, game element map, moments, motion language, branding): [`BRIEF.md`](BRIEF.md). There are no motion captures, so durations and easing are inferred.

## Tokens

`src/tokens.css` names each value by its role (`gr-*`). Radii: 2 medium (`ControlCornerRadius`), 1 small, 4 large, 6 xlarge, 9999 only on 1:1 discs; the notched plates (Play, chips, banners, the metadata pane) are drawn as paths. Borders are 1px. Fonts: Cinzel Bold (`HeadingFontFamily`: titles and section headings; OFL, bundled in `src/Typography/`; stands in for Beaufort) and Segoe UI (`FontFamily`; stands in for Spiegel).

| Token | Key | Used for |
|-------|-----|----------|
| `gr-void` | `ShellBackgroundBrush`, `InputBackgroundBrush`, `TooltipBackgroundBrush`, `PopupBackgroundColor`, `WindowTitleBackgroundBrush`, `PrimaryButtonBackgroundBrush`, `ScrimBrush`, `TextColorDark` | Rail, wells, popups, title band, the Play plate |
| `gr-abyss` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | The window page, the library layer, the game page |
| `gr-navy` | `TopPanelBackgroundBrush`, `ExpanderBackgroundBrush`, `MainColorDark`, `GameBannerTintBrush`, `ArtTintBrush`, `HeaderBandBrush` | Top bar, cards, the metadata pane, banner darkening |
| `gr-slate` family | `ButtonBackgroundBrush`, `MainColor`, `PropertyItemBackgroundBrush`, `ListItemHoverBrush` / `HoverBrush`, `MenuItemHoverBrush`, `ButtonHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` | Button plates, chips, hover washes |
| `gr-gold-pale` | `TextBrush`, `HeadingForegroundBrush`, `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush`, `FocusBrush` | Text on the dark, lit text |
| `gr-gold-lit` | `HighlightGlyphBrush`, `BevelLightBrush`, `PropertyItemForegroundBrush`, `TabItemHoverForegroundBrush`, `SliderThumbBackgroundBrush` | Hover glyphs, bevel highlight, chip text |
| `gr-gold` | `GlyphBrush`, `SelectedBorderBrush`, `PrimaryButtonBorderBrush`, `TabItemIndicatorBrush`, `ButtonForegroundBrush`, `GridViewItemHoverBorderBrush` | The accent: selection bar, checked, focus rim |
| `gr-gold-rich` | `DataChangeNotifBrush`, `WarningBrush`, `MixedRatingBrush` | Filter mark, warnings |
| `gr-gold-dim` / `-dark` / `gr-bronze` | `FrameBrush`, `NormalBorderBrush`, `ButtonBorderBrush`, `ScrollBarThumbBrush` / `FrameInnerBrush`, `InputBorderBrush`, `MenuSeparatorBrush` / `SelectedBrush`, `ListItemSelectedBrush`, `TopPanelItemCheckedBackgroundBrush` | Resting frames and rules, hairlines, the selected-row wash |
| `gr-hex` | `RunningIndicatorBrush`, `LinkBrush`, `ProgressBarForegroundBrush` | Live state only: running or launching game, progress, links, the count badge |
| `gr-ash` | `TextBrushDarker`, `SidebarItemForegroundBrush`, `TabItemForegroundBrush`, `TitleSuffixBrush` | Muted text and idle glyphs |
| `gr-blood` / `gr-leaf` | `DangerBrush`, `NegativeRatingBrush` / `PositiveRatingBrush` | Destructive hover, scores. Added (not in the client's chrome) |

`gr-hex-pale`, `-mid`, `-deep`, `-dark` and `gr-ash-dim` are used by the previews and the running-state ramps only; `Constants.template.xaml` maps no role to them. Shared roles this theme adds to `scripts/data/theme-keys.json`: `WingsTemplate`.

## ThemeModifier

Keep the ThemeModifier Edit constants list focused on main backgrounds, button fills and text, selection, and inputs. Include existing sidebar and panel surface brushes through the shared catalog. When panels share a brush or are transparent, use the existing background control. Keep the existing layout controls. Use the shared opt-ins in scripts/data/theme-keys.json and let the build generate thememodifier.yaml. Hover, pressed, and decorative colors stay in the theme. The accent picker lives in the Editor tab.

## Component spacing (`src/Common.xaml`)

Values and the measurements behind them are in [`HANDOFF.md`](HANDOFF.md) -> Measurements (rail 44, top bar 52, cells 34, roster rows 40, tree rows 28, title band 40, `ControlHeight` 32, `IconSize` 16, `GameBannerHeight` 300, banner darkening 0, metadata pane 300px of usable content).

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px void rail with a double gold edge; the main menu is a 32px diamond ring holding the winged-gem mark; the current item has a gold notch on the rail edge and a gold wash |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `SearchBox.xaml` | 52px navy bar closed by a gold hairline with a keystone diamond; search, filter, sorting, icon-only view switches; toggled cells are bronze with a gold underline; the filter mark is a gold diamond; the notification count is a teal disc |
| `Views/Library.xaml`, `LibraryGridView.xaml`, `LibraryDetailsView.xaml`, `FilterPanelView.xaml` | Flat library layer, window-art layer per the shared Window background rules, grid details width mechanism per the shared rules |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | Hairline frame, caption buttons with a blood-red close hover |
| `DerivedStyles/StandardWindowStyle.xaml` | 40px band: diamond-ring crest, title in Cinzel, centred wings flourish over a gold rule |

## Game page

Skeleton and metadata pane follow the shared rules. Both overviews are generated by `art/gen-overviews.mjs` (`node src/themes/GildedRift/art/gen-overviews.mjs src/themes/GildedRift/src`); edit the generator, not the views. Differences: the title is the game name in Cinzel Bold over a flourish line with a diamond; sections sit under a diamond and a fading rule; the metadata pane is a notched navy slab in a two-line gold frame, groups separated by a diamond-headed rule, chips are chamfered plates, scores are bordered pills. Play time is an ordinary field of `MetaProgress`.

## Components

Both game overview files include a designed empty state using `LOCErrorNoGameSelected`; the details `PART_ScrollViewHost` stays explicitly `Visibility="Visible"`. Empty state = a breathing rift crystal: a faceted diamond with a teal core, a gold ray burst and two counter-rotating dashed rings, with the line under it in Cinzel.

`GameDetailsPaneWidth` and `GridDetailsPaneWidth` both default to 300px of usable metadata content, set inside the pane's padding.

| Playnite file | Gilded Rift component |
|---------------|-----------------------|
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Champion-select roster rows: hover = slate plate, selected = bronze wash with a gold bar |
| Running game (`RunningIndicatorBrush` = `gr-hex`) | Match-found ring: a teal frame, wash and foot line, a sweep band while launching, the diamond-ring gem at the row's right end (and on covers and the Play cell); frame breathes while running |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Champion-grid tiles: gold ring and corner marks on hover; Play and Info are 34px navy discs with a gold rim that rise in, staggered |
| `DerivedStyles/PlayButton.xaml` | The winged Play plate: void plate, notched gold bevel, wings; hover blooms pale gold with a shine sweep |
| `DerivedStyles/PropertyItemButton.xaml` | Links in teal; chips are chamfered plates |
| `DefaultControls/Button, ToggleButton, RepeatButton` | Slate plates with a dim gold rim that lights on hover; the `Width == 41` ThemeModifier trigger |
| `DefaultControls/TextBox, PasswordBox, ComboBox` | Void wells; the combo has a 30px arrow cell; the drop-down is an ability-tooltip panel |
| `DefaultControls/CheckBox, RadioButton` | Corner-cut gold-rimmed box with a drawn tick; ring with a glowing diamond |
| `DefaultControls/Slider, ProgressBar` | Gold range on a slate rail with a diamond thumb; teal fill in a gold-rimmed track |
| `DefaultControls/ScrollViewer, Thumb` | Dim gold 6px thumb on a void track |
| `DefaultControls/ContextMenu, Menu, ToolTip` | Ability-tooltip panels: void, gold border and inner hairline, diamond rules between groups |
| `DefaultControls/TabControl` | Item-shop tabs with a gold indicator |
| `DefaultControls/GroupBox, Expander` | Social-group headers: diamond, heading font, fading rule |
| `DefaultControls/ListBox, TreeView` | Roster rows; the Settings section list: 28px rows, hover slate, selected = gold bar + bronze wash + diamond |

## Previews

`art/preview-details.html` and `art/preview-settings.html` are hand-written and rendered to `art/screenshot-*.png` with `node scripts/render-theme-preview.mjs`. Signature motifs drawn: the winged Play plate in its hovered end state, the notched metadata pane with diamond-headed rules, the selected roster row with its gold bar, the running (launching) row with the teal gem, the rail notch, the keystone on the top bar rule, the title band wings, corner-cut check boxes, the diamond slider thumb, the ability-style tooltip. Fonts: Cinzel (bundled) and Segoe UI (drawn with the bundled Selawik).

## Deviations

- WPF has no letter-spacing, so titles and headings render without the previews' 2.5px tracking.
- The previews draw the title band wings, crest and chamfers as CSS clip-paths and SVG; the XAML draws them as paths, so edges can differ by a pixel.
- Riot's Beaufort and Spiegel are proprietary: Cinzel and Segoe UI stand in.
- `gr-blood` and `gr-leaf` are additions (state only); the client's chrome is gold and navy.
- Top bar: Playnite's two separator Canvases share one column, so only one rule is drawn (before the view switches); the gap before the group cell is 9px. The preview matches.
- Row running frame is 2px with a void keyline (the shared rule), not the brief's 1px; the Play plate's running scrim is 0.46-0.58 so the label holds about 4.7:1 on the teal (the kit's 0.22-0.42 measured about 2.7:1 by hand).
- Tree rows and chips use the `FontSize` / `FontSizeSmall` keys (14 / 12), check box labels inherit 14, not the previews' 13.
- The Settings tree selection is drawn by hand (bar growing from the centre), not with `SelectionBarTemplate`. The title band wings sit in a 360px Canvas centred with `MathConverter` and hide under a 600px window.
- Disabled controls use `BaseStyle`'s 0.5 opacity (the brief said 0.45). The indeterminate `ProgressBar` marches lit segments.
- Overview banner fades and `Library.xaml` keep one `#00000000` gradient stop each: WPF's `Transparent` is white-alpha and hazes the art grey. Everything else reads brushes.
- The details list's icon plate rim from the preview is Playnite's own item template; only the row is restyled. The preview's second view-switch separator is not drawn (see above).

## Not verified yet

Everything: nothing has been built, validated or loaded in Playnite (see Status). In particular the list in `HANDOFF.md` -> Windows follow-up: `validate-extension.ps1`, `build-theme.ps1`, the `tests/wpf` regression scripts, the hand checks from `../AGENTS.md`, and a look at every moment in the brief (Play hover and press, cover hover and controls, running and launching states, empty page in both views, Settings title band). Motion timings are inferred.
