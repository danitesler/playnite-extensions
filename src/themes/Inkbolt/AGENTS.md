# Inkbolt — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the menus and HUD of **Infamous 2** (Sucker Punch, 2011). Dark only: the game has no light UI. Unofficial and not affiliated: no logo, art or font from the game. `info/NOTICE-Inkbolt.txt` still has to be written (see Not verified yet). Showcase ambition (see `BRIEF.md`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md). Creative brief (ambition, source DNA, game element map, signature moments, motion language, branding): [`BRIEF.md`](BRIEF.md).

## Tokens

`src/tokens.css` names each value by its role in the game (`ik-*`). Radii are all 0 (the game's plates are square); `CornerRadiusFull` stays 9999 for square badges only. Fonts: Barlow (body) and Barlow Condensed SemiBold/Bold (headings, caps labels), bundled in `src/Typography/`.

| Token | Key | Used for |
|-------|-----|----------|
| `ik-black` | `ShellBackgroundBrush`, `TextColorDark`, `SelectedForegroundBrush`, `HeaderBandForegroundBrush`, `WindowTitleBackgroundBrush`, `ScrimBrush` | Rail, dialog title band, ink on a slab or band |
| `ik-asphalt` | `WindowBackgourndBrush`, `ContentBackgroundBrush` | The page under the library |
| `ik-soot` | `TopPanelBackgroundBrush`, `GameOverviewBackgroundBrush`, `InputBackgroundBrush`, `PopupBackgroundBrush` | Top bar, game page, cards, inputs |
| `ik-plate` / `-lit` / `-hi` | `ButtonBackgroundBrush`, `ButtonHoverBackgroundBrush`, `ButtonPressedBackgroundBrush`, `ListItemHoverBrush` | The charcoal menu-row plate, idle / hover / pressed |
| `ik-ash` / `-lit` | `NormalBorderBrush`, `FrameBrush`, `ScrollBarThumbBrush`, `InputBorderBrush` | Hairlines, thumbs, the mark's dim ring segment |
| `ik-smoke` | `TextColorDarker`, `SidebarItemForegroundBrush`, `TabItemForegroundBrush` | Muted text and idle glyphs |
| `ik-chalk` | `TextColor`, `HeadingForegroundBrush`, `ButtonForegroundBrush` | Body text |
| `ik-slab` | `SelectedBrush`, `ListItemSelectedBrush`, `ToggleButtonCheckedBackgroundBrush`, `SliderThumbBackgroundBrush` | The near-white menu cursor |
| `ik-band` | `HeaderBandBrush`, `TabItemIndicatorBrush`, `SelectedSheenBrush` | Grey section tab (`POWER LEVEL 1`) and detail header band |
| `ik-bolt` | `GlyphColor` (`GlyphBrush`), `ProgressBarForegroundBrush`, `FocusBrush`, `PrimaryButtonHoverBackgroundBrush` | Lightning blue: accent, focus, Play hover |
| `ik-arc` | `PrimaryButtonGlowBrush`, `SliderHoverForegroundBrush` | Hot arc white-blue: Play arcs, sparks, progress head |
| `ik-cobalt` / `ik-ribbon` | `PrimaryButtonBackgroundBrush`, `StripeBrush` / `StripeDeepBrush` | Play slab and the baroque ribbon highlight / base |
| `ik-navy` | `GameBannerTintBrush`, `ArtTintBrush` | Banner darkening: the ribbon's shadow, the darkest branded surface |
| `ik-ember` | `DataChangeNotifColor`, `WarningBrush`, `HeadingMarkerAltBrush` | HUD ring orange: filter mark, the mark's orange segment |
| `ik-karma-red` / `-deep` | `DangerBrush`, `NegativeRatingBrush` / `ProgressBarTrackBrush` | Evil karma tile; the loading bar's remainder |

Inkbolt introduced these shared roles in `scripts/data/theme-keys.json`: `ArrowPlateTemplate` (the cursor slab with its arrowhead), `RibbonTemplate`, `RibbonCornerTemplate`, `GrainTemplate`, `SplatterTemplate`, `BrandMarkTemplate`, `HeaderBandBrush`, `HeaderBandForegroundBrush`, `StripeDeepBrush`. The lightning trace is the shared `ArcStripTemplate` (`Images/fx/bolt-h.png`).

## ThemeModifier

Keep the ThemeModifier Edit constants list focused on main backgrounds, button fills and text, selection, and inputs. Include existing sidebar and panel surface brushes through the shared catalog. When panels share a brush or are transparent, use the existing background control. Keep the existing layout controls. Use the shared opt-ins in scripts/data/theme-keys.json and let the build generate thememodifier.yaml. Hover, pressed, and decorative colors stay in the theme. The accent picker lives in the Editor tab.

## Component spacing (`src/Common.xaml`)

| Key | Value | Infamous 2 |
|-----|-------|---------------|
| `ButtonPadding` | 16,5 | Menu row label inset, cut to the 32px field height |
| `InputPadding` | 10,5 | Option row value inset |
| `MenuPadding` / `ComboBoxDropDownPadding` | 3 | Thin gap around a menu list |
| `MenuItemPadding` | 12,6 | Menu list row |
| `ComboBoxItemPadding` / `ListBoxItemPadding` | 10,6 | Option list row |
| `GroupBoxPadding` | 14,12,14,14 | Detail panel body under its grey band |
| `TooltipPadding` | 8,4 | Button prompt chip |
| `ControlHeight` | 32 | Shared field height |
| `IconSize` | 16 | Shared glyph size |
| `GameBannerHeight` | 260 | Mission toast over the banner; lower than most themes so the toast sits high |
| `GameBannerDarken` | 0 | Shared default |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | 44px ink-black rail with grain and a splatter at its foot, 1px charcoal inner rule; the main menu is the brand mark on a 32px charcoal tile. The splatter sits on a size-less `Canvas`: as a plain 210px child it stretched the rail to ~140px |
| `CustomControls/SidebarItem.xaml` | 44x40 cell, smoke glyph; current item is the white arrowhead slab popping in from the rail edge (160 ms BackEase), ink glyph |
| `Views/TopPanel.xaml` | 52px soot bar closed by a 2px charcoal rule with the lightning trace riding on it; toggled items are white slabs with ink glyphs; filter mark is a 9px ember bolt |
| `CustomControls/TopPanelItem.xaml` | Bare 34px cell; hover lifts a charcoal plate; toggled = slab without its notch |
| `Views/Library.xaml` | Flat asphalt library layer, no texture behind covers; top bar raised so the trace overlaps the views |
| `Views/LibraryDetailsView.xaml` | The details list on the rail's surface (ink black, the same grain, 1px charcoal edge rule), so rail and list read as one dark column; see-through with window art on |
| `DerivedStyles/MainWindowStyle.xaml` | Ink frame, one hairline, 3 x 40 caption buttons flush top-right (top bar keeps 132px clear) |
| `DerivedStyles/StandardWindowStyle.xaml` | 44px grain title band: mark, uppercase title in the heading face, cobalt damask ribbon under the 46x44 caption buttons |

## Components

Both game overview files must include a designed empty state using `LOCErrorNoGameSelected`. Keep the details `PART_ScrollViewHost` explicitly `Visibility="Visible"` so the inherited `DetailsScrollViewer` style cannot hide it on a null DataContext. Verify an initially empty selection, selected game -> grid -> details with selection cleared, and selecting a game again. See the theme-development reference's Interactive layer.

`GameDetailsPaneWidth` and `GridDetailsPaneWidth` both default to 300px of usable metadata content. Apply them inside horizontal padding and borders so the outer frame can size to content without shrinking the labels and properties. Preserve the exterior column gap and dynamic resizing through ThemeModifier.

Apply the responsive game-page breakpoints in both overview files. Keep metadata at the side when the body fits the preferred pane width, the theme's gap and 400px for content. Below that, use the full width under the content with two metadata columns at 560px of usable inner width and one below 560px. See the theme-development reference's Responsive game pages section.

Both overviews are generated by `art/gen-overviews.mjs` (`node src/themes/Inkbolt/art/gen-overviews.mjs src/themes/Inkbolt/src`); edit the generator, not the views. Sprites in `src/Images/fx/` come from `art/sprites.py`.

| Playnite file | Infamous 2 component |
|---------------|-------------------------|
| `DerivedStyles/DetailsViewItemStyle.xaml` | Menu list: bare rows on the list's ink black, charcoal wash on hover; selected row is the white arrowhead cursor, black name |
| `DefaultControls/TreeView.xaml` | Minimal Settings section list: bare rows, charcoal hover wash, selected = wash + 2px bolt-blue bar + bright text |
| `DerivedStyles/GridViewItemStyle.xaml` | Torn-photo document: ink-torn frame and a spark along the top on hover; selected = blue rim plus a slab along the foot |
| Running game (`RunningIndicatorBrush` = `ik-charge` 8fe35a, added to `tokens.css`) | a charging battery in lightning green. A hard block whose parent is masked into 6px cells (`RunningScan`), so the band lights the cells like a charge bar, crosses the arrowhead rows (the scan keeps the arrow shape), covers, and the arrowhead slab. **Launching:** the block takes 1.1s (1.7s loop) with a quick ease-in, a foot line fills behind it and the bolt flickers twice as it lands. **Running:** the foot stays full, the frame breathes 0.7 to 1 and the bolt crackles once per 2.6s while its glow rises and falls. The slab holds a 0.88 scrim over the green while launching and breathes 0.55 to 0.68 while running under a bright label; hover on RUNNING (button only, `Self`) swaps the label and play glyph for Cancel, and the lit plate and arcs are off while launching or running. |
| `DerivedStyles/GridViewItemTemplate.xaml` | Button-prompt key caps for Play / Info, staggered in from the left |
| `DerivedStyles/PlayButton.xaml` | Cobalt cursor slab; hover lights it bolt blue with crawling arcs (4-step flicker), press flashes white |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | Karma tiles: blue fill with an ink check and a white flash |
| `DefaultControls/ProgressBar.xaml` | Loading bar: blue progress over the deep red remainder, arc-white head |
| `DefaultControls/ComboBox.xaml`, `Slider.xaml` | Option row (`< NORMAL >`): value on a plate with a chevron; thin line with a white block thumb |
| `DefaultControls/TabControl.xaml`, `GroupBox.xaml` | Grey section band with black caps |
| `DerivedStyles/PropertyItemButton.xaml` | Blue text links; chips are small charcoal plates with an ash hairline |
| `Views/*GameOverview.xaml` | Mission toast title over the banner, cobalt corner ribbon, metadata on a flat plate; empty page = mark plus the two-tone loading bar with a flickering bolt |

## Previews

`art/preview-details.html` and `art/preview-settings.html` are generated by `art/previews.py` and rendered to `art/screenshot-*.png`. Signature motifs drawn: arrowhead cursor, grey section band, cobalt ribbon, karma tiles, lightning trace, Play arcs, torn cover frame. Fonts: Barlow and Barlow Condensed (bundled, no stand-ins).

## Deviations

## Not verified yet

- Preview checklist against the rendered screenshots, and post-XAML parity.
- WPF regression tests: game page breakpoints, details/grid layout at banner heights 0/5/10/20, side panel close button, Steam screenshots, top bar, search glyph.
- Game page with a selected game in both views, ThemeModifier palette and constants edits, Statistics GroupBox wrapping.
- The dialog title band's hidden `PART_TextTitle` sits in a Collapsed parent (a stray "Settings" label used to show at the top-left); confirm on screen in Settings and ThemeModifier Settings.
- Release finish: `info/NOTICE-Inkbolt.txt` (unofficial notice, Barlow fonts), `info/icon.png` tile, `-Mode Package` validation, generated README.
