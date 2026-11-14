# Bloodpetal — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the interface of **Diablo IV** as seen in public captures of the March 2023 beta. Unofficial: not affiliated with, endorsed by or sponsored by Blizzard Entertainment (`info/NOTICE-Bloodpetal.txt`). It ships no game files, no logo and no game fonts; the mark is the theme's own petal.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Captures, sample points, measured values and observed rules: [`RESEARCH.md`](RESEARCH.md). The user's requested reference (gameuidatabase.com, id 1783) was offline when the theme was made.

## Tokens

`bp-*` in `src/tokens.css`. Radius is 0 everywhere; the only round shapes are gems (radio, notification count, page pips).

| Token | Key | Used for |
|-------|-----|----------|
| `bp-bone` | `TextBrush`, `HeadingForegroundBrush`, `FocusBrush`, `GridViewItemSelectedBorderBrush` | Text, headings, focus ticks, the selected cover's frame |
| `bp-parchment` | `TextBrushDarker`, `TabItemForegroundBrush`, `PropertyItemForegroundBrush` | Captions, idle labels |
| `bp-dust` | `SidebarItemForegroundBrush` | Idle rail and toolbar glyphs |
| `bp-gilt` / `bp-gilt-lit` | `GlyphBrush` / `HighlightGlyphBrush`, `PrimaryButtonForegroundBrush` | Accent: carets, checks, links, expanders; labels on blood |
| `bp-abyss` | `ShellBackgroundBrush`, `BevelShadowBrush`, `ScrimBrush` | Outlines, shadows, the space outside panels |
| `bp-pitch` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `ExpanderBackgroundBrush` | Panel bodies |
| `bp-tomb` | `PopupBackgroundBrush`, `TooltipBackgroundBrush` | Menus, tooltips |
| `bp-slate` / `bp-well` | `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush` / `SliderTrackBrush`, `ProgressBarTrackBrush` | Wells |
| `bp-stone` | `ButtonBackgroundBrush`, `ListItemHoverBrush`, `MenuItemHoverBrush`, `TabControlHeaderBackgroundBrush` | Stone slabs: buttons, tabs, hover plates |
| `bp-slab` / `bp-slab-lit` / `bp-slab-dim` | `HoverBrush`, `HeadingRuleBrush`, `ButtonHoverBackgroundBrush` / `BevelLightBrush` / `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush` | Section bands, lit edges and grain, the bars |
| `bp-iron` / `bp-iron-lit` | `WindowPanelSeparatorBrush`, `FrameInnerBrush` / `NormalBorderBrush`, `InputBorderBrush` | Rules, control edges |
| `bp-pewter` / `bp-steel` | `FrameBrush`, `PopupBorderBrush`, `ButtonBorderBrush`, `CheckBoxBorderBrush` / `FrameHoverBrush`, `HeadingMarkerBrush`, `SliderThumbBackgroundBrush` | Frames and studs / highlights, ornaments, slider block |
| `bp-wine` / `bp-blood` | `SelectedBrush`, `PrimaryButtonBackgroundBrush` / `SelectedBorderBrush`, `PrimaryButtonBorderBrush` | Blood plate fill / rim |
| `bp-hot` | `SelectedSheenBrush`, `PrimaryButtonGlowBrush` | The plate's lit centre, bloom |
| `bp-gem` | `DangerBrush`, `ProgressBarForegroundBrush`, `HeadingMarkerAltBrush` | Gems, progress, close hover, the title rule |
| `bp-ember` / `bp-ember-core` | `TopPanelRuleStartBrush`, `TabItemIndicatorBrush` / `TopPanelRuleEndBrush` | The ember seam's glow / molten core |
| `bp-legend` | `DataChangeNotifBrush`, `WarningBrush`, `MixedRatingBrush` | Filter-active lozenge, warnings |

Fonts: `HeadingFontFamily` Palatino Linotype, bold, with `Typography.Capitals="SmallCaps"` (an OpenType feature the font has; another font ignores it and shows mixed case). `FontFamily` Segoe UI.

## Component spacing (`src/Common.xaml`)

| Key | Value | Why |
|-----|-------|-----|
| `ControlHeight` | 32 | Repo rule |
| `ButtonPadding` | 18,5 | Serif capitals need stone either side; the source's buttons are wide |
| `InputPadding` | 9,5 | Text sits 9px inside a well |
| `MenuPadding`, `ComboBoxDropDownPadding` | 3,4 | Room for the iron frame's inner line |
| `MenuItemPadding` / `ListBoxItemPadding` / `ComboBoxItemPadding` | 12,7 / 10,7 / 10,7 | 32px rows |
| `GroupBoxPadding` | 16,14,16,16 | Body under the 30px stone band |
| `GameBannerHeight` | 360 | Title sits in the faded lower third |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | 44px rail of dark cut stone with grain, closed by an iron line beside a black one. Main menu: 32px blood plate with the gilt petal, a four-point ornament under it; hover heats the plate and fades in a bloom |
| `CustomControls/SidebarItem.xaml` | 44x40, 16px glyph. Hover: a 32px stone slab fades in. Current: blood plate, gilt glyph, 2px ember bar on the outer edge |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px dark stone band closed by the ember seam. 34px cells: stone slab on hover, blood plate when toggled. Filter active: 8px orange lozenge. Notification count in a round red gem |
| `CustomControls/SearchBox.xaml` | Sunken well; focus gilds the edge and lights the seam along its bottom |
| `DerivedStyles/MainWindowStyle.xaml` | Window frame, `MainMenuButton` (the seal), 40x32 caption buttons, 132px kept clear on the top bar |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). A low blood glow rises from the bottom (decor, not on the art). |
## Game page

Generated by `art/gen-overviews.mjs` (edit the generator, then `node src/themes/Bloodpetal/art/gen-overviews.mjs src/themes/Bloodpetal/src`). Differences from the skeleton:

- Banner: red wash at 0.34, darkened at its head, plain gradient into the page. No mask and no seam on it (Play animates in front).
- Spacer `x * 200 / 360` in details (floor 20), `x * 140 / 360` in the grid panel (floor 14).
- Title in bone small capitals over a hard black copy, with the ornament and a gem-red rule under it.
- Play is 180x46; More and Edit are 44x44 stone slabs.
- Section headings (Description, Notes, Game details) are 30px stone bands.
- Metadata pane: pitch body in the iron frame with corner studs, padding 20,18,20,20 (grid 18,16,18,18).
- Empty state: an empty item slot holding the dark petal, blood light breathing behind it, petals falling past (a `Margin` animation in a clipped Canvas), five page gems under the text.

## Components

| Playnite file | Drawn as |
|---------------|----------|
| `Common.xaml` | Motifs: `BevelTemplate` (stone slab), `FramedPlateTemplate` + `RivetsTemplate` (iron frame, studs), `SelectionBarTemplate` (blood plate), `GlowLineTemplate` (ember seam), `GlowFrameTemplate`, `DividerTemplate`, `CornerMarksTemplate` |
| `Button`, `RepeatButton` | Stone slab, pewter outline, carved inner line, serif small capitals. `IsDefault` = blood plate |
| `ToggleButton`, `TabControl` | Stone slab; on / current = blood plate with a gilt label |
| `TextBox`, `PasswordBox`, `ComboBox` | Slate well with a shadow under its top edge; the combo carries a 24px blood square with a gilt fang (36px reserved) |
| `CheckBox` / `RadioButton` | 18px socket filled by a blood plate and a bone check / a round red gem in an iron ring |
| `Slider` / `ProgressBar` | Cold trough, steel run, bone block thumb / gem-red fill with a lit top line |
| `ScrollViewer` | 12px lane, 6px square stone bar (radius 0) |
| `ToolTip`, `ContextMenu`, `GroupBox` | Iron-framed panels; the group box is headed by a stone band |
| `Menu`, `ListBox` | Stone hover; menu items get a 3px gem bar, list rows a blood plate when selected |
| `TreeView` | 28px full-width rows: stone slab on hover, blood plate + gilt ornament + bone label when selected; 250 / 280 wide in Settings / Add-ons with the scroll lane reserved |
| `StandardWindowStyle`, `WindowBarButton` | 44px stone band, centred small-capital title over the blood haze between two ornaments, ember seam as the closing rule, studs on the window corners, 46x44 caption buttons |
| `PlayButton` | Iron socket with studs holding a blood plate; hover: hotter plate, bloom that breathes, the seam crawling along the plate's foot; own pressed layer |
| `GridViewItemStyle` | Selected: bone frame, corner ticks, ember seam under the cover. Hover: iron frame with studs fades in over rising blood light |
| `GridViewItemTemplate` | `GridTileButton`: 52px iron slot; hover draws a bone line around it and fills it with blood |
| `DetailsViewItemStyle`, `PropertyItemButton` | Stone hover and blood plate rows; chips are small slate sockets |
| Running game (`RunningIndicatorBrush` = `--bp-magic`, the magic item blue) | A cold socketed magic gem, square like the stone. Every surface carries a 0.16 tint, a 2px frame (1px dark keyline inside) and a 7px magic gem (covers: a gem in an iron socket at the top centre over a 6px band and an iron strip holding the foot hairline; the Play / RUNNING slab: a 1px frame and a hairline between two gems along its top; the bone frame, ticks and ember seam stay outside). **Launching:** a narrow glint (`RunningScan`, a soft symmetric bar on a slant, like light crossing a cut gem) crosses the surface in 1.3s with a heavy ease in and out, a hairline along the foot fills in step, and as it lands the gem flares and pings a ring (2s loop, 0.7s rest). The slab holds a 0.22 `ScrimBrush` layer under the glint. **Running:** the hairline stays full, the frame breathes 0.72 to 1 and the gem idles with a ring pinging once per cycle (3.4s); the slab's scrim breathes 0.08 to 0.2 under the dark label. **Hover on RUNNING:** the label turns to Cancel in bone ink on a darker plate (a second scrim); the ember seam, bloom and hover plate are off while launching or running, and the hover binding is `Self`. The running layer sits above the selection layers, so it stays visible on a selected item. |

## Effects

`art/sprites.py` (Pillow + numpy, seed 1404) writes white masks to `src/Images/fx/` and a review sheet to `art/fx-sheet.png`: `glow` (bloom), `seam` + `seam-core` (1024x16, tiles in x), `haze` (title smear), `stone` (256 tile), `petals` (256x512 tile). All are filled with theme brushes.

## Previews

Both previews are written by hand against the XAML: tokens as `var(--bp-*)`, the theme's sprites through CSS masks, icons from `Media.xaml` geometries. Motifs drawn: stone bands with the four-point ornament, iron frames with corner studs, blood plates, the ember seam, round gems. Stand-in fonts: Gelasio for Palatino Linotype (small caps are synthesized), Selawik for Segoe UI. The banner is a CSS painting, not game art.

## Deviations

- The source's stone, iron and blood are painted textures; here they are flat fills with one generated grain and vector edges, so ThemeModifier can recolor them.
- Every actionable button in the source is red. Here only default buttons, Play and current / checked states are, so a Playnite dialog full of buttons does not turn solid red.
- Small capitals depend on Palatino Linotype. Text Playnite draws itself (not through a `TextBlock` that inherits the property) stays mixed case.
- The source's segmented slider is drawn as a continuous trough.

## Not verified yet

- Nothing has been looked at in a running Playnite: hover and press on Play, covers and cover buttons at 125% and 150% scaling, the empty state in both views, Settings and Add-ons with every node open, the game edit dialog's tab labels, Statistics cards, ThemeModifier recoloring and its 41px buttons.
- Whether `Typography.Capitals` reaches every button label and tab header as intended.
- Motion timings against the source (no video reference was available).
