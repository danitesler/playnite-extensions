# Verst — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), key `verst`, folder `Verst`, dark only, Showcase ambition. It merges the menus of two games from one series: **Metro Exodus** (4A Games, 2019) gives the electronics (the oscilloscope options screen, the burnt-orange selection flag with a slanted tail, the torn orange "hints" banner, odometer counters, the green case lamp, the rail map with handwritten notes) and **Metro: Last Light Redux** (4A Games, 2014) gives the paper and the light (the spiral-bound notebook, the glowing console display, stamped label plates, the bullet counter tab, the workbench's black part tiles and header strip, key prompts in white and orange).

**Unofficial fan theme**: not affiliated with, endorsed by or sponsored by 4A Games, Deep Silver or PLAION. "Verst" (an old Russian mile; the map's "0 км") is its own name. No game asset, logo or font is shipped: the mark is a tunnel mouth drawn by `art/sprites.py`, every sprite is generated from noise and geometry, icons are hand-drawn in `src/Media.xaml`, colours are sampled values in `src/tokens.css`. See `info/NOTICE-Verst.txt`.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

[`RESEARCH.md`](RESEARCH.md): the 57 captures (Game UI Database ids 218 and 2308, sampled with a canvas in the browser, nothing downloaded), the interface parts of both games, the measured palette, typography and inferred motion. [`BRIEF.md`](BRIEF.md): source DNA, the game element map, hero and secondary moments, motion language, brand. Structural source: Playnite Default 10.x (MIT, `info/LICENSE-Playnite.txt`); the XAML skeleton was started from the Gumshoe theme's files and every visual was rewritten.

## Tokens

All colours are in `src/tokens.css` as `vs-*`; `src/Constants.template.xaml` maps them by role.

| Token | Key | Used for |
|-------|-----|----------|
| `vs-void` | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `InputBackgroundBrush`, `SecondaryButtonBackgroundBrush`, `ScrimBrush`, `TextColorDark`, `CheckBoxCheckMarkBkBrush` | Rail, the black top strip, wells, workbench tiles, the bullet tab and name strip, text on the ember accent |
| `vs-iron` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | The window page, library and game page |
| `vs-panel` | `PopupBackgroundColor`, `ExpanderBackgroundBrush`, `WindowTitleBackgroundBrush`, `GameBannerTintBrush`, `ArtTintBrush` | The pause panel: menus, cards, the title band; banner darkening |
| `vs-plate` / `-lit` / `-hi` | `ButtonBackgroundBrush`, `MainColor`, `ListItemHoverBrush`; `HoverColor`, `ButtonHoverBackgroundBrush`; `ButtonPressedBackgroundBrush` (also the Play housing) | Steel plates and their hover and pressed steps |
| `vs-rim` / `-lit` | `PopupBorderColor`, `FrameBrush`, `ButtonBorderBrush`; `NormalBorderBrush`, `InputBorderBrush`, `FrameHoverBrush` (rivets) | The pause panel's grey edge line and a lit step |
| `vs-chalk`, `vs-white`, `vs-smoke`, `vs-ghost` | `TextColor`; `SelectedForegroundBrush`, `HeadingForegroundBrush`; `TextColorDarker`, `SidebarItemForegroundBrush`; disabled | Text on the iron |
| `vs-flag`, `-hi`, `-deep` | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `HeaderBandBrush`, `TopPanelItemCheckedBackgroundBrush`, `SliderThumbBackgroundBrush`; `SelectedBorderBrush`, `StripeBrush` (speckle); `StripeDeepBrush` | The selection flag, the torn banners, their speckle |
| `vs-ember` | `GlyphColor`, `FocusBrush`, `DataChangeNotifColor`, `ValueAccentBrush`, `CheckMarkBrush`, `GridViewItemHoverBorderBrush`, `TitleSuffixBrush`, `TopPanelRuleStartBrush`, `ProgressBarForegroundBrush` | Last Light's prompt orange: values, focus, the filter lamp, lit check boxes, the cover hover frame, the source line over a title |
| `vs-display`, `-deep`, `-glow`, `-hot` | `DisplayGlassBrush`, `DisplayDeepBrush`, `DisplayGlowBrush`, `DisplayHotBrush` | The Play display |
| `vs-crt`, `-deep`, `-grid`, `vs-phosphor`, `-dim`, `vs-wave` | `CrtGlassBrush`, `PropertyItemBackgroundBrush`; `CrtCaseBrush`; `CrtGridBrush`; `PhosphorBrush`, `PropertyItemForegroundBrush`, `PropertyItemHoverBackgroundBrush`; `PhosphorDimBrush`; `WaveformBrush` | The oscilloscope: metadata pane, Settings list, empty page |
| `vs-paper`, `-shade`, `-edge`, `vs-ink`, `-dim`, `vs-binder`, `vs-rule-blue`, `vs-coil` | `ParchmentBrush`, `TooltipBackgroundBrush`; `PaperShadeBrush`, `PrimaryButtonPressedBackgroundBrush`; `ParchmentEdgeBrush`, `TooltipBorderBrush`, `PrimaryButtonBorderBrush`; `ParchmentTextBrush`, `TooltipForegroundBrush`, `PrimaryButtonForegroundBrush`; `ParchmentLabelBrush`; `ParchmentTitleBrush`, `ParchmentLinkBrush`; `PaperRuleBrush`; `CoilBrush`, `PrimaryButtonBackgroundBrush` | The notebook, the ticker-tape tooltips, the ivory label plates (default button, stencil plates) |
| `vs-lamp` | `RunningIndicatorBrush`, `PositiveRatingBrush` | The running game (tunnel lamps). Decorative case lamps use `PositiveRatingBrush`, never the running brush |
| `vs-rust`, `vs-amber` | `DangerBrush`, `NegativeRatingBrush`; `WarningBrush`, `MixedRatingBrush` | Danger and warnings |

Radii: `ControlCornerRadius` 2, `CornerRadiusSmall` 1, `CornerRadiusLarge` 4, `CornerRadiusXLarge` 10 (the CRT glass is drawn at 10 inside its template), `CornerRadiusFull` 9999 (1:1 only). Borders are 1px. Fonts (bundled, OFL, `src/Typography`): `FontFamily` Barlow Semi Condensed Regular and SemiBold, `HeadingFontFamily` and `PosterFontFamily` Barlow Condensed Bold, `NoteFontFamily` Marck Script (Reserved Font Name, shipped unmodified, not subset). Sizes 13 / 15 / 17 / 22 / 34; the Play label is 20px bold.

Shared roles this theme added to `scripts/data/theme-keys.json`: `CoilBrush`, `PaperRuleBrush`, `PaperShadeBrush`, `CrtGlassBrush`, `CrtCaseBrush`, `CrtGridBrush`, `PhosphorBrush`, `PhosphorDimBrush`, `WaveformBrush`, `DisplayGlassBrush`, `DisplayDeepBrush`, `DisplayGlowBrush`, `DisplayHotBrush`, `CrtGlassTemplate`, `CoilStripTemplate`, `OdometerTemplate`, `LampChainTemplate`, `RailMapTemplate`.

## ThemeModifier

Keep the ThemeModifier Edit constants list focused on main backgrounds, button fills and text, selection, and inputs. Include existing sidebar and panel surface brushes through the shared catalog. When panels share a brush or are transparent, use the existing background control. Keep the existing layout controls. Use the shared opt-ins in scripts/data/theme-keys.json and let the build generate thememodifier.yaml. Hover, pressed, and decorative colors stay in the theme. The accent picker lives in the Editor tab.

## Component spacing (`src/Common.xaml`)

| Key | Value | Source |
|-----|-------|--------|
| `ButtonPadding` / `InputPadding` | 18,5 / 10,5 | 32px `ControlHeight` plates and wells |
| `MenuPadding` / `MenuItemPadding` | 4 / 14,6,12,6 | the pause menu's text inset on a 32px row |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` / `ListBoxItemPadding` | 4 / 12,6 / 12,6 | text clears the flag's slanted tail |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 14,12,14,14 / 0 | card body under its torn banner |
| `TooltipPadding` | 10,4,10,5 | ticker tape |
| `IconSize` | 16 | 2-unit square-cap strokes on a 24 grid |
| `GameBannerHeight` | 320 | spacer `x * 140 / 320` (details, floor 20), `x * 110 / 320` (grid, floor 14) |
| `GameDetailsPaneWidth`, `GridDetailsPaneWidth` | 300 | usable metadata width inside the CRT glass's 14px padding |

## Sprites (`src/Images/fx`, `art/sprites.py`)

White alpha masks, 1 pixel per DIP, fixed seed, 4x supersampled (`python src/themes/Verst/art/sprites.py`; the contact sheet goes to the temp folder). `Common.xaml` turns them into templates (contract comment at their head); every one is filled with a theme brush through an `OpacityMask`.

| Sprite | Cells | Template |
|--------|-------|----------|
| `flag.png`, `speckle.png` | 3-slice 16 / 104 / 8; speckle tile 96x32 | `SelectionBarTemplate` |
| `banner.png` | 3-slice 10 / 118 / 32 | `RibbonTemplate` (section headings, GroupBox, Expander) |
| `scan.png`, `glare.png`, `vignette.png` | tile 4x3; 256x160; stretched | `CrtGlassTemplate` (with a DrawingBrush graticule) |
| `coil.png`, `coil-hole.png` | tiles 22x30 | `CoilStripTemplate` |
| `lamp.png`, `lamp-v.png` | tiles 28x12 / 12x28 | `LampChainTemplate` |
| `bloom.png` | 9-slice 40 / 16 / 40 | `BloomTemplate` (Play hover) |
| `glow.png` | stretched | lamp halos, the Play letter glow and scan band |
| `map.png`, `stain.png`, `grain.png` | stretched; tile 256; tile 256 | `RailMapTemplate`; notebook stains; `GrainTemplate` |

The mark (`art/mark.svg`, `BrandMarkTemplate`) is five arch ribs over two legs, two rails meeting under a lamp and two sleepers: filled outlines only, no overlapping sub-paths, because the icon rasterizer XORs overlaps.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px void rail with faint grain, closed by a 1px grey edge line on its inner side; the main menu a 32px riveted steel plate with the mark in prompt orange; items 44x40, hover a steel plate, the current item the flag sliding in from the rail's outer edge (200 ms PowerEase) under a white glyph |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml` | 52px black strip closed by a 1px steel rule with a 72px prompt-orange segment under the search box; search 260x32 void well; 34px cells, toggled cells take the flag; the filter mark is an 8px orange lamp; notification count on a black tab with an orange rim; 142px clear for the window buttons |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | caption buttons 46x32 (main window) and 44x44 (dialogs), bare cells that fill on hover, close in danger red |
| `Views/Library.xaml` | flat iron with a 5% rail map in the lower-right corner; game art only through Playnite's window background setting, at full strength |

**Settings chrome** (`DefaultControls/TreeView.xaml`, `DerivedStyles/StandardWindowStyle.xaml`): the section list sits on CRT glass in the Settings and Add-ons windows (`Tag` = `Crt` from the window triggers) with phosphor text; hover a dim outline, selected the cream phosphor plate with dark text and a dark triangle, lit with a two-frame flicker and fading out over 400 ms (afterglow). The title band is 44px: grain, the ivory stencil plate (mark, "KM 0"), the title in bold condensed caps, a green case lamp, the odometer at the right, a 1px rule with a 96px orange segment.

## Game page

Generated by `art/gen-overviews.mjs` (`node src/themes/Verst/art/gen-overviews.mjs src/themes/Verst/src`); edit the generator, not the views. Differences from the skeleton: the header is the workbench strip's order (the game's source in orange caps over the name in bold condensed white); section headings are the torn orange banner (uppercase through `StringToUpperCaseConverter` on the LOC string); description and notes are spiral notebook sheets (ink on paper, stains, a shaded foot, the blue rule, coils over the top edge); screenshots in black slots; the metadata pane is the oscilloscope unit (dark case, CRT glass, stencil plate and lamp on the case edge, dashed graticule group rules, phosphor captions at `FontSizeSmall` beside phosphor values, phosphor chips, odometer scores, the trace along its foot). More and Edit are black workbench tiles. While game art is behind the window the page goes see-through; the notebook and the CRT keep their own surfaces.

Empty state (no game selected): the oscilloscope with no signal: case with a knob column and a blinking green lamp, the stencil plate, the mark in dim phosphor, `LOCErrorNoGameSelected` in phosphor caps, an odometer at zero and a trace that travels (`StrokeDashOffset`), over the rail map with a handwritten "0 км". Loops are Opacity and StrokeDashOffset only, in the elements' own Styles.

Scores: the score `TextBlock` (`TextBlockGameScore`) stays in the tree collapsed; an `OdometerTemplate` control reads its `Text`. Rating colours are not shown.

## Components

| Playnite file | Verst component |
|---------------|-----------------|
| `Button`, `ToggleButton`, `RepeatButton` | Steel plates with a lit top edge; hover lights a 2px orange lamp line with a flicker; pressed sinks 1px. Default button: the ivory label plate with a rivet at each end. `Width == 41` ThemeModifier detection scaled to 32x32 |
| `PlayButton` | The console display: riveted steel housing, deep glass under the lit panel at 0.55, white-hot 20px label (4.1:1). Hover: five-step surge flicker, bloom, letter glow, white-hot rim, one scan band. Press: power dip. Running/launching: the glass turns lamp green with a void label; the overlay passes tunnel lamps along both edges |
| `TextBox`, `PasswordBox`, `ComboBox`, `SearchBox` | Void wells, 1px rim, orange on focus; the combo arrow is the menus' chalk triangle |
| `CheckBox`, `RadioButton` | Lamps: an 18px void well that lights a 10px orange lamp (square / round lens) with a halo and a two-frame flicker |
| `Slider`, `ProgressBar` | Square segments (12x8, 2px gaps): phosphor fill and a flag lever for the slider, orange fill for progress |
| `TabControl` | Bare tabs; the selected one takes the flag |
| `GroupBox`, `Expander` | GroupBox: a pause-panel card under the torn orange banner. Expander (library groups): the banner in dark steel, so repeated group headers stay calm |
| `ContextMenu`, `Menu`, `ToolTip` | Riveted iron pause panel (`LocalMenuPanelTemplate`: grain texture, 4 corner rivets, 56px orange top strip, green case lamp) shared across menus, submenus, ComboBox and multi-select lists; 30px rows, sliding burnt-orange speckled flag (`SelectionBarTemplate`) with white chalk triangle on highlight, dashed graticule breaks (`DividerTemplate`), void workbench shortcut tiles in prompt orange (ivory paper on highlight), Exit on a rust-red flag with void-black ink (4.94:1), checked/chosen rows a lit orange case-lamp square (docs/themes/menus.md). Tooltips are paper ticker tape with ink |
| `ScrollViewer`, `Thumb` | A 2px rail with a 10px steel capsule |
| `ListBox`, `TreeView` | Flag rows; the Settings list on the oscilloscope (above) |
| `DetailsViewItemStyle`, `ListView` | Bare rows, hover steel plate, selected the flag with a white triangle that hides while the row is hovered (the hover Play / Install button sits there) or the game is launching or running; text starts 16px in |
| `GridViewItemStyle`, `GridViewItemTemplate` | Workbench slots: hover a 2px orange frame, the bullet counter's black tab dropping from the top edge (BackEase 0.3), the black name strip sliding up, a 2% lift; selected a 2px white frame and the static strip. `GridTileButton` is a black part tile that lights orange (60 ms stagger) |
| Running game (`RunningIndicatorBrush` = `vs-lamp`) | Tunnel lamps: green frame, wash and foot line; a chain of three lamps passes along the row's reserved strip (rows, `StrokeDashOffset`, 22px pitch) or along the top and bottom edges (covers and Play, tiled `lamp.png`, 28px pitch); fast while launching, slow while running |
| `PropertyItemButton` | Phosphor links; chips are dim phosphor outlines that light to the cream plate on hover |

## Previews

`art/preview-details.html` and `art/preview-settings.html` are hand-written replicas with colours as `var(--vs-*)` and the sprites from `../src/Images/fx` as CSS masks. Signature motifs drawn: the flag (rail, row, toggled view, tab), the Play display in its hovered end state (surge, bloom, rim, scan band), torn banners, the spiral notebook, the oscilloscope pane with odometer scores and the trace, the running row's tunnel lamps, the CRT Settings list, the riveted title band with stencil plate, lamp and odometer, lamp check boxes, the segment slider, the ivory Save plate, the rail map with the handwritten note. Fonts are the bundled faces themselves (no stand-ins). Banner art and cover thumbnails are CSS drawings.

## Deviations

- The game name keeps its own case: Playnite fills `PART_TextDisplayName` from code, so it cannot pass through the uppercase converter like the headings and the title band.
- Scores are drawn as odometer windows and lose Playnite's rating colours.
- Popups cannot show sprites with shadows (layered windows), so menus and drop-downs are plain pause-panel plates.
- `HtmlTextView` (descriptions) resolves installed fonts only, so the bundled Barlow falls back there to Segoe UI.
- The source's in-game icons (weapons, filters, ammo types) have no Playnite counterpart; only the bullet counter appears, as the cover hover tab.
- Motion is inferred from stills (RESEARCH.md): fast 120 ms, base 200 ms, slow 400 ms, PowerEase for movement, discrete flickers for anything electric.
- The Play label is 4.1:1 at rest, 3.2:1 at the brightest hover frame and 5.3:1 pressed (computed from the brushes and layer opacities, not measured on screen). 20px bold is large text, so it passes the 3:1 floor, not 4.5:1.

## Not verified yet

- Seen live in Playnite: the details view with a selected game (rail, top bar, filter lamp, group banner, flag row, hover row, header, Play at rest, notebook, CRT pane with odometer scores). Rendered in the WPF harness: Settings list, tabs, GroupBox, check box, radio, slider, progress bar, wells, buttons, Play at rest, odometer, flag, coils.
- Not yet seen live: Play hover, press and running; the grid view covers (frame, bullet tab, name strip, tile buttons); the grid side panel; the empty page in both views; the Settings window and dialog title band; Statistics wrapping; the filter panel; context menus and tooltips; ThemeModifier recolouring; window art behind the library.
- `tests/wpf/RunningIndicatorRegressionTests.ps1` and `RunningLabelOverlapRegressionTests.ps1` cannot build the details row in their harness (`{MainViewModel}` from the row hover buttons, the same for every theme in this tree); the button, cover and list checks pass.
