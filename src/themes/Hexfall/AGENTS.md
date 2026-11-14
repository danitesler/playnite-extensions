# Hexfall: theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the interface of **Age of Wonders: Planetfall** (Triumph Studios, 2019) as seen in public captures. Unofficial: not affiliated with, endorsed by or sponsored by Triumph Studios or Paradox Interactive (`info/NOTICE-Hexfall.txt`). It ships no game files, no logo and no game fonts; the mark is the theme's own hexagon ring with a shard dropping out of its gap.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Captures, sampled values and observed rules: [`RESEARCH.md`](RESEARCH.md). Creative brief (source DNA, game element map, signature moments, motion language, branding, review): [`BRIEF.md`](BRIEF.md). The requested reference (gameuidatabase.com, id 405) was read in a browser; nothing was downloaded or shipped. Motion was not measured: no video was available.

Wiring (part names, triggers, the responsive body, the overview generator's structure) was started from this repo's Emberline theme; every motif, sprite, icon, token and control look was redrawn for this source.

## Tokens

`pf-*` in `src/tokens.css`. Radius is 0; the cut corners come from `ChamferTemplate`, not from radii.

| Token | Key | Used for |
|-------|-----|----------|
| `pf-white` / `pf-ice` / `pf-mist` | `TextBrush` / `HeadingForegroundBrush`, `SelectedForegroundBrush`, `SidebarItemSelectedForegroundBrush` / `TextBrushDarker`, `SectionHeaderBrush`, `PropertyItemForegroundBrush`, `TabItemForegroundBrush` | Body text, titles and selected labels, idle labels and data captions |
| `pf-void` | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush`, `TooltipBackgroundBrush`, `ScrimBrush`, `ArtTintBrush`, `GameBannerTintBrush`, `TextShadowBrush`, `BevelShadowBrush` | Outside panels, the rail and bars, the title band |
| `pf-hull` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `PopupBackgroundBrush` | Page and window bodies |
| `pf-well` | `NormalBrush`, `InputBackgroundBrush`, `ExpanderBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `TopPanelSearchBoxBackgroundBrush` | Fields, cards, the check box fill |
| `pf-plate` / `pf-plate-hi` / `pf-plate-lit` | `ButtonBackgroundBrush`, `ListItemHoverBrush`, `PropertyItemBackgroundBrush` / `HoverBrush`, `ButtonHoverBackgroundBrush`, `MenuItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` | Buttons and the plates a hover or press lifts |
| `pf-line` / `pf-line-dim` / `pf-frame` | `NormalBorderBrush`, `ButtonBorderBrush`, `InputBorderBrush`, `SliderTrackBrush` / `WindowPanelSeparatorBrush`, `MenuSeparatorBrush`, `HeadingRuleBrush` / `FrameBrush`, `PopupBorderBrush`, `CheckBoxBorderBrush`, `InputHoverBorderBrush` | Edges, rules, the panel frame |
| `pf-cyan` | `GlyphBrush`, `FocusBrush`, `FrameHoverBrush`, `GridViewItemHoverBorderBrush`, `GridViewItemSelectedBorderBrush`, `SliderThumbBackgroundBrush`, `ProgressBarForegroundBrush`, `SidebarItemSelectedGlowBrush`, `TitleSuffixBrush`, `MainMenuButtonForegroundBrush` | Links, focus, lock-on brackets, fills, the mark |
| `pf-viridian` / `pf-viridian-edge` | `SelectedBrush`, `ListItemSelectedBrush` / `SelectedBorderBrush`, `SelectedSheenBrush` | Selected plate and its edge |
| `pf-olive` / `pf-olive-edge` | `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush` / `TabItemIndicatorBrush` | Current tab, toggled items |
| `pf-brass`, `-lit`, `-edge`, `-hot`, `-text`, `-void` | `PrimaryButtonBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `PrimaryButtonBorderBrush`, `PrimaryButtonGlowBrush`, `PrimaryButtonForegroundBrush`, `PrimaryButtonPressedBackgroundBrush` | Play and the default button |
| `pf-amber` / `pf-amber-hot` / `pf-amber-dim` / `pf-badge` | `HeadingMarkerBrush`, `HighlightGlyphBrush` / `CapLampBrush` / `HeadingMarkerAltBrush` / `DataChangeNotifBrush`, `WarningBrush` | Pointers, `//` marks, check, lamps, badges |
| `pf-gunmetal`, `pf-gunmetal-hi` | `CapBarBrush`, `MainMenuButtonBackgroundBrush`, `CapBarLitBrush` | The cap bar and the main menu plate |
| `pf-slate` / `pf-steel` | `ScrollBarThumbBrush`, `ThumbBrush` / hover variants | Scroll thumb |
| `pf-hostile` / `pf-energy` / `pf-go-lit` | `DangerBrush`, `NegativeRatingBrush` / `MixedRatingBrush` / `PositiveRatingBrush` | Close hover, ratings |

New shared keys added for this theme (`scripts/data/theme-keys.json`, group Frames): `CapBarBrush`, `CapBarLitBrush`, `CapLampBrush`.

**Banner darkening color**: `GameBannerTintBrush` = `pf-void` `#06131e`, the darkest navy of the Options and HUD frames, so a darkened banner keeps the cool cast.

Fonts: `HeadingFontFamily` Sora (bundled SemiBold and Bold, `src/Typography/`, OFL; a stand-in for the game's proprietary wide geometric face). `FontFamily` Segoe UI. In the previews Selawik draws Segoe UI.

## ThemeModifier

Edit constants come from the shared catalog (`scripts/data/theme-keys.json`); the build writes `thememodifier.yaml`. The sprites are white masks filled with theme brushes, so recoloring `GlyphBrush`-family brushes moves the brackets, rings and bloom together.

## Component spacing (`src/Common.xaml`)

| Key | Value | Why |
|-----|-------|-----|
| `ControlHeight` | 32 | Repo rule |
| `ButtonPadding` / `InputPadding` | 16,5 / 10,5 | Caps label on a plate; the source's 28px outline buttons |
| `ComboBoxItemPadding`, `ListBoxItemPadding` | 22,7,10,7 | Room for the amber pointer |
| `MenuPadding`, `ComboBoxDropDownPadding` | 4 | |
| `MenuItemPadding` | 12,7 | |
| `GroupBoxPadding` | 14,12,14,14 | Body under the 34px header |
| `TooltipPadding` | 10,6 | |
| `GameBannerHeight` | 340 | Title sits in the faded lower third |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | 44px void rail with a 1px edge. Main menu: a 32px gunmetal plate with two cut corners holding the mark in cyan; hover turns the mark pale over a cyan bloom |
| `CustomControls/SidebarItem.xaml` | 44x40, 16px glyph. Hover: a navy plate fades in. Current: green plate in its edge, a cyan bar growing from the middle, an amber pointer |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px bar closed by the cap bar (strip, notch, three lamps), the notch hanging 4px over the content. 34px cells; toggled = olive tab. Filter active: a 9px orange hexagon on the icon's corner. Notification count in a 16px orange plate with two cut corners |
| `CustomControls/SearchBox.xaml` | Navy well; focus lights the edge cyan and fades the lit rule in under it |
| `DerivedStyles/MainWindowStyle.xaml` | Window frame, `MainMenuButton`, 40x32 caption buttons, 132px kept clear on the top bar |
| `Views/Library.xaml` | Flat page. Game art only while Playnite's window background setting is on, at full strength with a soft bottom edge; the top bar, side panels and game pages go see-through and the banner collapses |

## Game page

Generated by `art/gen-overviews.mjs` (edit the generator, then `node src/themes/Hexfall/art/gen-overviews.mjs src/themes/Hexfall/src`). Differences from the skeleton:

- Banner: shown clean, darkened at its head, plain gradient into the page. No mask on it (Play animates in front).
- Spacer `x * 200 / 340` in details (floor 20), `x * 140 / 340` in the grid panel (floor 14).
- Title: `PART_TextDisplayName` keeps its place but is drawn transparent; an uppercase copy in Sora SemiBold 28px sits over a dark copy, behind the amber double slash.
- Play is 190x48; More and Edit are 44x44 plates.
- Section headings: amber double slash, caps heading, hairline.
- Metadata pane: a `ChamferTemplate` body in a steel frame under a cap bar (no group captions); labels are 10px Sora caps in `pf-mist`, values white, hairlines between groups.
- Empty state: the mark in cyan at the centre of a radar sprite with three hexagon rings that ping outward (Width, Height and Opacity only, 3.2s loop, stopped when a game is selected), the words behind an amber double slash.

## Components

| Playnite file | Drawn as |
|---------------|----------|
| `Common.xaml` | Motifs: `BevelTemplate` (menu button), `ChamferTemplate` (two cut corners at any size), `FramedPlateTemplate` (frame with brackets), `RivetsTemplate` (the cap bar), `SelectionBarTemplate` (green plate, amber pointer), `GlowLineTemplate` (rule with a lit stretch), `GlowFrameTemplate` (bloom), `DividerTemplate` (amber double slash and rule), `CornerMarksTemplate` (2px brackets: focus and every lock-on) |
| `Button`, `RepeatButton`, `ToggleButton` | Navy plate, steel edge, caps label in Sora. Default button = the brass plate with a double rim and a lit gradient on hover. Toggled = olive tab |
| `TextBox`, `PasswordBox`, `ComboBox` | Dark wells; edge turns cyan on focus; the combo has an amber triangle (36px reserved) |
| `CheckBox` / `RadioButton` | 18px square with an amber check stamping in (100ms) / a diamond with an amber core |
| `Slider` / `ProgressBar` | 4px rail, cyan run, a 10x18 thumb plate, a chevron button at each end / cyan fill with a pale leading marker |
| `ScrollViewer` | 12px lane, 5px steel bar |
| `ToolTip`, `ContextMenu`, `Menu`, `ListBox` | Navy panels in a lit frame; hovered items lift a plate and show the amber pointer; list rows take the green selection plate |
| `TabControl` | Flat tabs; the current one fades to the olive plate with its pale edge |
| `GroupBox` | Chamfered card, amber double slash and caps title over a hairline (content-sized) |
| `TreeView` | Minimal bare 28px rows, no boxes: hover = navy wash, selected = green wash + 2px amber bar + bright label (opacity-animated). 240 / 280 wide in Settings / Add-ons with the scroll lane reserved |
| `StandardWindowStyle`, `WindowBarButton` | 44px band: cap bar with lamps, amber double slash, caps title, the mark ghosted at 7%, a cyan rule with a brass notch; 46x44 caption buttons |
| `PlayButton` | The hero; see `BRIEF.md` and the file header |
| `GridViewItemStyle` | Selected: cyan frame, bright brackets, brass hexagon. Hover: cyan hairline, brackets lock in from 8px to 2px |
| `GridViewItemTemplate` | `GridTileButton`: 44px hotbar slots, no key numbers; the Play slot lights brass |
| `DetailsViewItemStyle` | Rows open on a dim amber square; selected = green plate with the full pointer, fading in as it slides from the left |
| Running game (`RunningIndicatorBrush` = `pf-energy` f4d501) | Pathfinder's energy resource in `pf-energy` yellow, the hexagon grid made visible. **Launching** (1.7s loop, 1.2s travel): a soft-tailed band crosses the row, cover (rising) or plate, but only through a tiled hexagon lattice (a `DrawingBrush` mask on its parent), so it reads as a scan over hex cells; the foot energy line (with end ticks on rows and covers, plain beside the cells on the Play cell) fills in step and the three energy cells charge bottom to top (horizontal bars on the Play cell). **Running:** the foot stays full, cells charge in a loop (a staggered 3.2s swell) and frame and tint breathe 0.72 to 1. Plate: yellow chamfered plate under a faint `RunningBreath` scrim (0.04-0.14), dark ink label (7.3:1 worst); Cancel only on RUNNING + hover of the button (`Self`); the hex ping, lock-on brackets, sheen and hover plate are idle-hover only (a MultiDataTrigger on not launching and not running). |
| `PropertyItemButton` | White text links turning cyan; chips are small navy plates |

## Effects

`art/sprites.py` (Pillow + numpy, deterministic) writes white masks to `src/Images/fx/` and a review sheet to `art/fx-sheet.png`: `glow` (96x96 bloom), `hexgrid` (26x45 seamless hexagon lattice; generated, not yet used by a view) and `radar` (512x512 rings with ticks). All are filled with theme brushes.

## Previews

Hand-written HTML in `art/` (tokens as `var(--pf-*)`, icons as the `Media.xaml` geometries inlined as symbols). Motifs drawn: the cap bar with lamps (rivets, notch), the chamfered Play plate with four brackets and a hex ping, the amber `//` headings, the green selection with an amber pointer, olive tabs, cut-corner panels. Stand-in fonts: Selawik for Segoe UI, Sora as itself. The banner and covers are CSS paintings, not game art.

## Deviations

- Cut corners are drawn by `ChamferTemplate` on the metadata pane, the group box, the brass buttons, the main menu plate and the notification plate. Buttons, tree rows and inputs stay rectangles, as the source's are. A WPF window cannot be chamfered without transparency, so the Settings window frame stays square.
- WPF has no letter spacing: the source's tracked caps are plain caps here. Uppercase reaches only text that passes through a template the theme owns (titles, buttons, tabs, headings, captions); tree rows, metadata values and Playnite's own dialogs stay mixed case.
- Sora stands in for the game's face; Segoe UI for its body face.
- The research-node card (emblem, cost badge) was not built: it would compete with cover art.
- The title band's lamps are static (the brief's lamp breathing was dropped to avoid a `Loaded` trigger in the window template).

## Not verified yet

- **Playnite itself was not looked at.** The theme was deployed (Playnite 10.64 restarted with it active and its log shows no theme or XAML error), but nobody watched it. Built, validated, the WPF regression tests passed (details, grid, side-panel close button, game-page breakpoints, top panel, search glyph and clear, grid width, Steam screenshots) and the controls were rendered in a 32-bit WPF harness (a sample of every restyled control). Still to check live: hover and press on Play, covers and cover buttons at 125% and 150% scaling; the empty state in both views and its ping loop; Settings and Add-ons with every node open; the game edit dialog's tab labels; Statistics cards; ThemeModifier recoloring and its 41px buttons; the window background setting.
- The `Brass` layer's `OpacityMask` gradient on the Play and default buttons over an animated hover: check for repaint rectangles at 125% / 150%.
- Whether the cap bar notch hanging 4px over the library (top bar) and the brass notch under the title band overdraw anything they should not.
- Motion timings against the source (no video reference was available).
