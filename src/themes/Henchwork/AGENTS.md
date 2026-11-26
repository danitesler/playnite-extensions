# Henchwork — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark, `Showcase` ambition, inspired by the management console of *Evil Genius 2: World Domination* (Rebellion, 2021): a blueprint-navy war room with slate console panels, mustard pictogram tiles, skewed mustard tape labels, colour-coded tab plates, odometer counters, red alert badges and a ring-bound villain dossier. Unofficial fan theme: original name, original vault-eye mark, no game logos, art, fonts or icons (`info/NOTICE-Henchwork.txt`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, sampled colours and contrast ratios: [`RESEARCH.md`](RESEARCH.md). Creative brief (lenses, source DNA, game element map, levers, menu levers, motion, brand): [`BRIEF.md`](BRIEF.md).

## Tokens

| Token | Key | Used for |
|-------|-----|----------|
| `--hw-blueprint` `#131D27` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `ScrimBrush`, `BackgroundToneColor` | Map-ocean navy library layer |
| `--hw-page` `#070B10` | `GameOverviewBackgroundBrush` | Darker game page so it separates from the game list (text 16.6:1, muted 10.5:1, dim 6.0:1) |
| `--hw-hud` `#1B2733` | `MainColorDark`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush`, `ScrollBarTrackBrush`, `TabControlHeaderBackgroundBrush` | HUD tray: rail, top bar, title band, settings tree, header bands, odometer strip |
| `--hw-ink` `#0E151D` | `PopupBorderColor`, `PanelSeparatorColor`, `InputBackgroundBrush`, `TooltipBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `ButtonBorderBrush`, `LocalInkBrush` | Hard offset plates, 2px edges, recessed wells |
| `--hw-slate` / `--hw-slate-hi` / `--hw-slate-line` | `MainColor`, `PopupBackgroundColor`, `ExpanderBackgroundBrush` / `HoverColor`, `ButtonBackgroundBrush`, `SelectedBrush` / `NormalBorderBrush`, `ButtonHoverBackgroundBrush` | Console panels, keys, selection wash, rims |
| `--hw-mustard` `#EAC66A` | `GlyphColor`, `SelectedBorderBrush`, `MenuItemHoverBrush`, `PrimaryButtonBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `LinkBrush`, `HeadingForegroundBrush` | Pictogram tiles, selection marks, menu highlight, primary buttons |
| `--hw-mustard-tape` / `--hw-mustard-deep` | `FocusBrush` / `ScrollBarThumbBrush`, `PrimaryButtonPressedBackgroundBrush`, `FocusHaloBrush` | Tape labels and focus; tile under-edge, olive thumb |
| `--hw-cream` `#F5E7B8` | `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush`, `GridViewItemSelectedBorderBrush` | Picked tile face, active view switch, selected cover frame |
| `--hw-paper` `#F3F0DC` | `TextColor`, `LocalPaperBrush` | Body text; dossier card paper |
| `--hw-green` / `--hw-green-hi` | `StripeAccentBrush`, `LocalGreenBrush` | Play go-slab and grid Play tile |
| `--hw-lime` `#67D501` | `ProgressBarForegroundBrush`, `LocalLimeBrush` | Odometer digits, progress fill |
| `--hw-orange` / `--hw-orange-text` | `DangerBrush`, `StripeAltBrush` / `WarningBrush`, `LocalOrangeTextBrush` | Quit tiles, Exit row (fill / text-safe label) |
| `--hw-badge` `#C62E24` | `DataChangeNotifColor` | Red alert-badge filter mark and notification count |
| `--hw-purple` / `--hw-lilac` | `RunningIndicatorBrush`, `StripeDeepBrush` / `LocalLilacBrush` | Running scheme plate, ring mark, dossier strips and captions |
| `--hw-steel` `#ACBDC0` | `PropertyItemBackgroundBrush`, `TabItemIndicatorBrush` | Chips, selected tab, keycaps |
| `--hw-banner-tint` `#142130` | `GameBannerTintBrush` | Blueprint-navy banner darkening |
| `--hw-text-muted` / `--hw-text-dim` / `--hw-text-ink` | `TextColorDarker` / `LocalDimTextBrush` / `TextColorDark`, `PrimaryButtonForegroundBrush` | Muted captions, dim text on navy only, ink on plates |

Fonts: `FontFamily` and `HeadingFontFamily` = `./Typography/#Barlow Condensed` (OFL; Regular, SemiBold, Bold bundled) with Bahnschrift condensed fallbacks; `MonospaceFontFamily` = `Consolas` (odometer digits, keycaps). Sizes 13 / 15 / 17 / 22 / 34. Radii: `CornerRadiusSmall` 1, `ControlCornerRadius` 2, `CornerRadiusLarge` 3, `CornerRadiusXLarge` 4, `CornerRadiusFull` only on 1:1 elements.

## ThemeModifier

Generated from `scripts/data/theme-keys.json` at build time. `GameBannerTintBrush` is solid blueprint navy. `GameBannerHeight` (300) and `GameBannerDarken` (0) sliders disable in `DefaultControls/Slider.xaml` while `ShowBackgroundImageOnWindow` is on.

## Component spacing (`src/Common.xaml`)

| Key | Value | Source |
|-----|-------|--------|
| `ControlHeight` | `32` | Repo rule; pause-menu button rows |
| `ButtonPadding` | `14,5` | Key plate on a 2px ink foot |
| `InputPadding` | `10,5` | Ink well with 1px rim |
| `MenuPadding` / `ComboBoxDropDownPadding` | `6,10,6,6` | Clears the 4px tab-colour strip |
| `MenuItemPadding` / `ComboBoxItemPadding` | `8,4` | 30px rows |
| `GroupBoxPadding` | `12,10,12,12` | Overview card body under the HUD header band |
| `TooltipPadding` | `10,6` | Ink callout under a 3px mustard bar |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px HUD rail with a 2px ink edge; main menu is the vault-door mark on a mustard tile (`LocalHenchworkMenuMarkTemplate`, shared with `TopPanel.xaml`: hover pops the tile and clicks the combination dial left, right, left; while the menu is open the door swings open on its hinge onto a red alarm lamp that pulses with a sonar ring); items are 30x30 mustard pictogram tiles with ink glyphs (fixed `14,12` padding, no `IconPadding`); selected tile flips cream on a 3px ink offset |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml` | 48px HUD bar closed by a 2px ink rule; 244px ink search well; filter key with a 9px red badge disc (`TextFilter`); sorting-first icon-only 34x32 slate keys on ink feet, current view cream; lime odometer progress bar; notifications key with a red count badge |
| `Views/Library.xaml` | Blueprint-navy layer; full-strength window art layer with bottom fade |
| `DerivedStyles/MainWindowStyle.xaml` | Bare caption glyphs, slate on hover, close turns into the orange Quit tile |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | 44px title band: HUD navy + faint blueprint grid, vault-eye tile, title on a skewed mustard tape, 2px ink rule; close key is an orange Quit tile at rest |
| `DefaultControls/TreeView.xaml` | Bare 28px rows on the HUD tray; slate hover; selection = slate-hi wash + growing 3px mustard bar + mustard diamond on leaf rows + semibold label; 260 / 280px widths with a reserved scroll lane |

## Sketch layer

The game's UI is printed and hand-lettered, so flat plates get a worn, inked finish. Shared pieces in `Common.xaml`: mask brushes `Local{Grunge,GrungeSmall,PencilHatch,SketchH,SketchV,TapeTorn,Stamp,Marker,MapContours}MaskBrush`, `LocalSketchFrameTemplate` (four wobbly ink strokes over a host's edges, Rectangles only so it is GroupBox-safe) and `LocalHatchShadowTemplate` (3px solid offset in the Foreground brush plus a slate pencil-hatched tail; slate because ink hatching vanishes on navy).

| Where | Treatment |
|-------|-----------|
| Rail, top bar, title band | Grunge paint; top bar adds faint map contours; hand-inked stroke on the rail edge and bar rules |
| Library layer, game pages, dialog pages | Map contours + grunge behind the views and under the game page content (hidden while window art is on) |
| Sidebar tiles, brand tile, grid Play/Info tiles, Play slab | Grunge in the plate's deep tone; Play slab also gets an inked outline and a hatched shadow |
| Tape labels, banner pin, settings title tape | Torn ends (`tape-torn.png`) + grunge |
| Banner | Pencil hatching across the lower 40%, inked stroke on the 4px rule |
| Game title | Mustard felt-marker swipe under the baseline |
| Dossier | Hatched shadow, inked outline, grunge on the paper, faded purple rubber stamp (top right) |
| Menu board, GroupBox, empty-state poster, cover offsets, game icon | Hatched shadows and/or inked outlines; menu and card bodies get grunge |

## Game page

Generated by `art/gen-overviews.mjs`, then `node scripts/game-page-breakpoints.mjs` on both files. Banner darkens toward a hard 4px ink rule with a mustard tape (vault-eye) pinned across it. Metadata is the ring-bound dossier: cream paper on a hatched ink offset, paper fibre, punch holes and steel rings tiled down the left edge (`DrawingBrush`), purple header strips with orange diamonds as group breaks (stack offset `-23`), purple captions, ink values. Scores are odometers: a dim `000` counter under the lit score. Section heads are tape labels. Empty state: tilted loading poster with pulsing rings over a blueprint grid.

## Components

| Playnite file | Henchwork component |
|---------------|---------------------|
| `DerivedStyles/PlayButton.xaml` | Green go-slab with a cream 30px pictogram cap on a 3px ink plate. Hover: slab lifts 2px, brightens, cap pops 1.12 (BackEase), triangle nudges. Press: slab drops onto the plate (Margin setter). Launching/running: purple plate, `RunningBreath`, lilac hatch sweep, `RunningActionIndicator` ring mark |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Slate hover with a hollow mustard diamond sliding in; selection = slate-hi wash, growing 3px mustard bar, solid diamond on an ink offset; `RowHoverAction`; running ring mark in `RowRoom` |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Cover pops 1.04 onto a 4px ink offset with a 3px mustard frame; selected stays lifted with a cream frame and a pinned mustard diamond; 50x50 green Play and mustard Info tiles on ink offsets |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | Lair console board (slate, 2px ink edge, 3px ink offset, 4px tab-colour strip); mustard highlight grows from the left; cream icon square; diamond group break; steel keycaps; orange Quit Exit row; mustard diamond checks |
| `DefaultControls/TabControl.xaml` | Mustard tab plates; selected tab rises in steel with a slate + ink inset |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ScrollViewer.xaml` | Mustard stamped tick; diamond radio; mustard tile thumb on an ink track; mustard triangle scroll arrows with an olive thumb |
| `DerivedStyles/PropertyItemButton.xaml`, `TextBlockGameScore.xaml` | Ink links on paper; steel tab-plate chips; Consolas odometer digits |
| **Running game levers** (`running-motion.md`) | Hue: scheme purple `#674A9E` with lilac `#B399D8` (distinct from green Play, mustard selection, slate hover, red filter badge). Band: diagonal hatch (`hatch.png`). Foot: 2px lilac fill line. Mark: ring mark (pulsing lilac ring, cream inner ring, lilac core) in `RunningMarkPlate` room (38px rows / 36px button). Timing: 1.6s launch sweep, 3.2s idle pulse |

## Previews

`art/preview-details.html` and `art/preview-settings.html`, rendered with `node scripts/render-theme-preview.mjs`. Sketch layers are added by a small script at the end of each preview from `data-grunge`, `data-contours`, `data-sketch`, `data-hatch-shadow`, `data-hatch-band`, `data-torn`, `data-stamp` and `data-marker` attributes, using the same masks as the XAML. Motifs drawn: mustard pictogram rail with the cream picked tile, red filter badge, hovered green Play slab with popped cream cap, diamond row selection with the purple running ring mark, skewed tape labels, odometer scores, ring-bound dossier with purple strips, vault-eye title band, diamond radio and mustard tile slider. Stand-in fonts: Barlow Condensed draws itself; Consolas draws with Cascadia Mono. Placeholder game art uses literal colours.

## Deviations

- `art/sprites.py` writes twelve white masks: `blueprint-grid`, `rings`, `hatch`, `paper-fibre`, plus the sketch layer `grunge` (worn paint), `hatch-pencil` (pencil shading), `sketch-h` / `sketch-v` (wobbly ink strokes), `tape-torn`, `stamp`, `marker` and `map-contours`.
- WPF has no letter-spacing, so tape labels and buttons use Playnite's mixed-case strings in bold condensed type rather than tracked caps.
- Template setters cannot target Transforms, so press offsets use `Margin` setters and rotated arrows replace the element's `RenderTransform`.

## Not verified yet

Authored on macOS without PowerShell, so none of the `.ps1` tooling ran: no `new-theme.ps1` (scaffold written by hand from it), no `validate-extension.ps1`, no `build-theme.ps1`, no `take-screenshots.ps1` (previews rendered with `render-theme-preview.mjs` directly) and no WPF regression tests. Fonts are not subset (`fontTools` missing). Checks that did run: XML parse of all 44 XAML files, resource-key, template-name and setter-target resolution scripts, Constants placeholder resolution, `theme-fonts.mjs`, `preview-tokens.mjs check`, `preview-layout.mjs` (both `layout ok`). First Windows pass: `validate-extension.ps1 -Extension henchwork -Mode Package`, `build-theme.ps1 -Extension henchwork -Launch`, the `tests/wpf/*` suite, `MenuRender.ps1`, and `python3 scripts/subset-theme-fonts.py src/themes/Henchwork/src/Typography/*.ttf`.
