# Gilded Rift — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the **League of Legends** client and **League of Legends: Wild Rift**: blue-black navy panels closed by thin gold bevels, a roster of rows with a gold selection bar, notched plates and diamonds, a winged Play plate, and hextech teal as the one live colour. Unofficial and not affiliated with Riot Games: no logo, art or font from either game, own name, `info/NOTICE-GildedRift.txt`. Showcase ambition (see `BRIEF.md`).

The XAML is built and validated on Windows with `scripts/build-theme.ps1` and `scripts/validate-extension.ps1`.

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

| Part | Spec |
|------|------|
| Rail | 44px, `ShellBackgroundBrush`; inner edge = 1px `FrameBrush` + 1px `FrameInnerBrush` just inside it. Main menu cell 44x52: a 32px diamond ring (1px `FrameBrush`, void fill) holding `LocalGildedRiftMenuMarkTemplate` (Common.xaml, also the top bar button), the winged gem (a diamond gem with two three-feather wings) in `GlyphBrush`: hover flaps the wings once (16 degrees up, a 6 degree rebound, home, 0.46s); open charges the gem with hextech teal rising from its point to its crown and then pulsing until the menu closes. Items 44x40, 16px stroke glyphs (stroke 1.6, square caps, miter joins) in `SidebarItemForegroundBrush`. Current item: glyph `SidebarItemSelectedForegroundBrush`, a wash (`SidebarItemSelectedGlowBrush` at 16% opacity, brightest at the right edge fading to clear by 85% leftwards), a 6x12 gold triangle notch on the rail's right edge pointing left (2px in from the edge, 14px from the top), a 1px bottom hairline fading from the right. Hover: `ListItemHoverBrush` plate. |
| Top bar | 52px `TopPanelBackgroundBrush`, closed by a 1px rule (gradient `TopPanelRuleStartBrush` to `TopPanelRuleEndBrush`, strong for 40%) with a 7px gold diamond (a rotated square, `GlyphBrush`) on the rule at x=14. Order: search 232x34, filter toggle, sorting, 1x18 separator, details / grid / list, separator, group, then (right) notifications; 142px clear at the right for the window buttons. Cells 34x34, `ControlCornerRadius`, 16px icons: idle `TextBrushDarker`, hover `TopPanelItemHoverBackgroundBrush` + `HighlightGlyphBrush` glyph, toggled `TopPanelItemCheckedBackgroundBrush` + `TextBrush` glyph + a 2px gold underline inset 7px with a soft glow. Filter mark: 8x8 diamond, `DataChangeNotifBrush`, top-right 4px. Notification count: 15px disc in `RunningIndicatorBrush`, `TextBrushDark` 10px bold number. Window buttons 38x30; close hover = `DangerBrush`. |
| Search | 232x34 well, `TopPanelSearchBoxBackgroundBrush`, 1px `InputBorderBrush`, hover `InputHoverBorderBrush`, focus `GlyphBrush`; magnifier rules from `src/themes/AGENTS.md` (persistent glyph). |
| Library | flat `ContentBackgroundBrush`; window-art layer per the shared Window background rules. |
| Roster row | 40px; icon plate 28px, 4px chamfered, 1px `FrameInnerBrush` rim (hover `FrameBrush`, selected `GlyphBrush`); text 14px `TextBrushDarker`. Hover: `ListItemHoverBrush` plate, text `HighlightGlyphBrush`. Selected: wash from `ListItemSelectedBrush` fading to clear at 85%, a 3px `SelectedBorderBrush` bar on the left edge with an 8px soft glow, text `SelectedForegroundBrush`. Selected + hover keep the bar. Colour of the glow is a blurred copy of the bar, not an `Effect` on the row. |
| Cover tile | art with no rim at rest; hover: 1px `GridViewItemHoverBorderBrush` ring + `CornerMarksTemplate` tightening 3px inward over `--base` 200ms, name plate text brightens; selected: `GridViewItemSelectedBorderBrush` ring (static, distinct from hover). Hover controls (Play, Info): 34px discs (`NavyDisc`: `NormalBrushDark` fill, 1px `FrameBrush` rim, gold glyph) that rise 6px and fade in, staggered 60ms; hover brightens the rim to `FrameHoverBrush`. |
| Game page | banner `GameBannerHeight` (300) fading into `GameOverviewBackgroundBrush` at 96%; header at 150px from the page top (default banner), icon 72px (chamfer 8, 2px gradient frame `BevelLightBrush` to `FrameBrush` to `FrameInnerBrush`), title `HeadingFontFamily` Bold 34px (WPF has no letter-spacing: the previews show 2.5px tracking, so accept 0 and say so in `AGENTS.md` -> Deviations; Cinzel draws lowercase as small capitals, so game names read as caps without a text transform), flourish under the title (340px: 1px line from `GlyphBrush` fading to clear, a 7px diamond at its start). Actions right of the title: Play 196x46 (see PlayButton), More and Edit 40x40 chamfer-6 squares (slate fill, `FrameBrush` rim, gold glyph; hover rim `FrameHoverBrush`). Section headings (`LOCGameDescriptionTitle`, `LOCNotesLabel`): `HeadingFontFamily` Bold 13px, a 6px diamond before and a rule fading to the right after. |
| Metadata pane | `GameDetailsPaneWidth` 300px of usable content (in 19px padding) inside a notched frame: 2px `FrameBrush` outer band, `FrameInnerBrush` hairline inset 1px, fill `NormalBrushDark`, top-left and bottom-right corners cut 12px (drawn as paths; fixed cuts so the pane stays content-sized). Groups separated by a 1px rule (`FrameBrush` fading to clear) with a 5px diamond at its start (`DividerTemplate`). Row min height 23: caption `TextBrushDarker` 12px (96px column), value `TextBrush` 13px. Chips (`Tag="Chip"` lists): chamfer-5 plates, `PropertyItemBackgroundBrush` fill, 1px `FrameInnerBrush` edge, `PropertyItemForegroundBrush` 12px text; hover `PropertyItemHoverBackgroundBrush` + `FrameBrush` edge. Scores: bordered pills (`PositiveRatingBrush` / `MixedRatingBrush` / `NegativeRatingBrush` text and 50% border, 12% fill). |
| Settings window | Title band 40px (`WindowTitleBackgroundBrush` fading to `ContentBackgroundBrush`), bottom rule gradient (`FrameInnerBrush`, `FrameHoverBrush` at 22%, `FrameBrush` centre, mirrored); left: 26px diamond-ring crest with the mark; title `HeadingFontFamily` Bold 14px; centred `WingsTemplate` (360x40: three tapering feathers fanning out of a centre diamond, mirrored); caption buttons 46x40, close hover `DangerBrush`. Tree rows 28px, body font 13px, child indent 38px, `TextBrushDarker`; hover `ListItemHoverBrush` + `HighlightGlyphBrush`; selected = 2px `SelectedBorderBrush` bar (3px inset top and bottom) growing from the centre + `ListItemSelectedBrush` wash fading to clear at 80% + `SelectedForegroundBrush` text + a 7px diamond 16px from the right edge; width triggers 240-280 per `docs/themes/settings-screens.md`. |
| Controls | `ControlHeight` 32. Button: chamfer-6 top-left plate, 1px `ButtonBorderBrush` edge, `ButtonBackgroundBrush` fill, label 12px semibold uppercase-feel (use the string as given) in `ButtonForegroundBrush`; hover edge `FrameHoverBrush`, fill `ButtonHoverBackgroundBrush`, label `ButtonHoverForegroundBrush`; pressed fill `ButtonPressedBackgroundBrush`; disabled 0.45. TextBox/PasswordBox: `InputBackgroundBrush` well, 1px `InputBorderBrush`, hover `InputHoverBorderBrush`, focus `GlyphBrush` edge + 1px `FrameBrush` underline. ComboBox: same well + a 30px arrow cell with a 1px `FrameInnerBrush` left rule and a thin gold chevron. CheckBox: 18px, top-left corner cut 5px, `CheckBoxBorderBrush` edge, `CheckBoxCheckMarkBkBrush` fill; hover edge `CheckBoxHoverBorderBrush`; checked edge `GlyphBrush` + 2.2px `TextBrush` tick drawn in. RadioButton: 18px circle, `CheckBoxBorderBrush` ring, checked ring `GlyphBrush` + a glowing `HighlightGlyphBrush` diamond. Slider: 4px rail (`SliderTrackBrush`, 1px `FrameInnerBrush` rim, radius 2), range gold gradient (`FrameBrush` to `GlyphBrush`), thumb a 14px rotated square (`SliderThumbBackgroundBrush`, 1px void rim, 6px void centre), hover scale 1.15 and `SliderThumbHoverBorderBrush`. ProgressBar: 8px track (`ProgressBarTrackBrush`, 1px `FrameInnerBrush` rim, radius 4), fill `ProgressBarForegroundBrush` with a soft end glow. ScrollBar: track `ScrollBarTrackBrush`, thumb 6px `ScrollBarThumbBrush` hover `ScrollBarThumbHoverBrush`, radius 3. ToolTip/popups/menus: `PopupBackgroundBrush`, 1px `PopupBorderBrush` + a `FrameInnerBrush` hairline inset 2px, items 32px, hover `MenuItemHoverBrush` + 2px gold bar, separators `DividerTemplate`. TabControl: header text 13px semibold, idle `TabItemForegroundBrush`, hover `TabItemHoverForegroundBrush`, selected `TextBrush` + `TabItemIndicatorTemplate` under it. Expander and GroupBox headers: `HeadingFontFamily` Bold 13px, diamond + fading rule. |
| Play (hero) | 196x46 void plate (`PrimaryButtonBackgroundBrush`), notched hexagon-ish outline (10px corner cuts) in `PrimaryButtonBorderBrush` (1.5px) with a `FrameInnerBrush` hairline inset 4px, two feather wings off the left and right edges (16px, `GlyphBrush` and `FrameBrush` strokes) and a small chevron notch on each edge; label `HeadingFontFamily` Bold 17px `PrimaryButtonForegroundBrush` with a 11px play triangle. Hover (200 ms in, 320 ms out, fade never snap): a bloom rising from the bottom (`PrimaryButtonGlowBrush` radial, `glow.png` mask), the outline to `BevelLightBrush`, a skewed shine band sweeping left to right once (`spark.png` glint at its head), fill to `PrimaryButtonHoverBackgroundBrush`. Pressed: own layer, bloom to `FrameBrush`, plate 1px down, label `GlyphBrush`. |

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
| `DefaultControls/ToolTip` | Ability-tooltip panel: void, gold border and inner hairline |
| `DefaultControls/ContextMenu, Menu, ComboBox`, `CustomControls/ComboBoxList, FilterSelectionBox` | Menus (every popup menu, `TopPanelMenu`, ComboBox and multi-select lists): one ability panel (`LocalAbilityPanelTemplate`: void slab, top-left and bottom-right corners cut 8px, bevel lit top-left and shadowed bottom-right, a gold diamond on the top-left cut); 30px roster rows: on highlight a bronze wash, the 3px gold bar with its glow and one shine sweep; shortcuts led by a small diamond, lighting gold with the row; diamond-headed rules as group breaks; Exit in blood; gold tick on checked rows. Recipe `docs/themes/menus.md` |
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

For live review, check the Play hover and press, cover hover controls, running and launching states, empty pages in both views, and the Settings title band. Motion timings are inferred.
