# Calling Card — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) after the **Persona 5 menus** (Persona 5, Royal, and the spin-offs Strikers and Tactica, which keep the same language). Dark only. Three colors: ink plates, paper text, one screaming red for whatever is current, plus the blue sliver Tactica offsets behind the current command. The signature shape is the **slanted plate**: a parallelogram tilted 12 degrees behind the current item, with a second plate dropped behind it. Minimal on purpose: no collage art, no ransom-note lettering, no animated shapes; the plates, edges, halftone and type carry the look.

**Unofficial fan theme.** Not affiliated with or endorsed by ATLUS or SEGA. No game files, logos, fonts or artwork are included (`info/NOTICE-CallingCard.txt`). The star mark, plates, sawtooth edge and halftone are drawn for this theme.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

**Intended layout: the sidebar on the left** (Playnite's default; repo rule). Right mirrors it; top and bottom are fallback strips.

## Sources

ATLUS publishes no design system and the menus are drawn art, not style sheets, so every value is measured on screenshots (ImageMagick, `+dither -colors N` on cropped regions; dominant swatch). `src/tokens.css` tags each value with its capture.

| Tag | Capture | What it gave |
|-----|---------|--------------|
| `[P5T]` | Persona 5 Tactica Steam store screenshots (app 2254740), 1920x1080, the PARTY pause menu | The current command's red plate `#f60305`, the blue sliver `#1e6ee5` offset behind it, the black plates `#030101`, Tactica's cream stripes `#eae2ce`; command rows about 54px tall, plates tilted about 12 degrees, torn white stripes beside the commands (the rail's sawtooth). |
| `[P5S]` | Persona 5 Strikers Steam store screenshots (app 1382330), 1920x1080, the hideout command list | Selected command `#f90807` (red plate, white text); black command plates `#0a0a09` with white edges; ransom-note lettering (not reproduced). |
| `[P5R]` | Persona 5 Royal Steam store screenshots (app 1687950), 1920x1080: dialogue box, battle HUD, skill name plates | Paper `#f4f4f4`; HP teal `#73f9dc` and SP pink `#e066d0`; the black name plate in a white edge with a red drop (the title plate on the game page). |
| `[P5C]` | Confidant screen, mechanicsofmagic.com "Visual Design of Games: Persona 5" (2022-04-23), 1200x675 | Red ground `#9c0511` / `#660206`, greys `#2f2727`, `#605f5f`, `#a5a1a1`; the white name plate (tooltips); the black info box in a white edge (metadata pane). |
| `[eye]` | Chosen between measured values | Hover and pressed reds, coal and soot plates, amber. |
| Analysis | mechanicsofmagic.com (above); itch.io "Making UI come to life: study of Persona 5" | The palette is red, black and white with a splash of blue on the current selection; the selected item grows and takes color. |
| Icons | **Heroicons** 2.2.0 solid (MIT, `info/LICENSE-heroicons.txt`), via `art/icons.py` | The heaviest open set that covers Playnite's roles; the menus draw chunky solid glyphs. Menu PNGs in `src/Images/Heroicons/`. |
| Mark | `art/icons.py` → `art/mark.svg`, `IconMainMenu`, `info/icon.png` | Original tilted five-point star. |
| Playnite | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`) | Every file's structure. |

Fonts: the menus' lettering is custom art. `HeadingFontFamily` is **Impact, Haettenschweiler, Arial Black**: Impact ships with Windows and is the closest heavy condensed face. Body text is Segoe UI. The HTML previews inline Anton (OFL) as the stand-in for Impact, because the render machine has no Impact.

## Tokens

`src/tokens.css` keeps this theme's own names (`red`, `echo-blue`, `ink`, `paper`, `hp-teal`, ...). Mapping (full list in `src/Constants.template.xaml`):

| Token | Keys |
|-------|------|
| `red` | `GlyphColor`, `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `PrimaryButtonBackgroundBrush`, `ButtonPressedBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `GridViewItemSelectedBorderBrush`, `PropertyItemHoverBackgroundBrush`, `TabItemIndicatorBrush`, `NegativeRatingBrush` |
| `echo-blue` | `SelectedBorderBrush` (the sliver behind the current plate), `FocusBrush` |
| `ink` / `ink-soft` / `coal` / `soot` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `PopupBackgroundColor` / `ContentBackgroundBrush`, `ButtonBackgroundBrush` / `MainColor`, `InputBackgroundBrush`, `ExpanderBackgroundBrush` / `ListItemHoverBrush` |
| `paper` | `TextColor`, `TextColorDark` (text on red), `PopupBorderColor`, `FrameBrush`, `ButtonBorderBrush`, `ButtonHoverBackgroundBrush`, `TooltipBackgroundBrush`, `PropertyItemBackgroundBrush`, `TopPanelItemHoverBackgroundBrush` |
| `fog` / `smoke` / `ash` | `TextColorDarker` / `NormalBorderBrush`, `InputBorderBrush`, `ScrollBarThumbBrush` / `WindowPanelSeparatorColor`, `TopPanelSeparatorBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush` |
| `hp-teal` | `ProgressBarForegroundBrush`, `PositiveRatingBrush` |
| `amber` | `WarningBrush`, `MixedRatingBrush`, `DataChangeNotifColor` |

Radii: all 0 (`ControlCornerRadius`, `CornerRadiusSmall`, `CornerRadiusLarge`); `CornerRadiusFull` exists but nothing uses it. Edges are 2px (`ControlBorderThickness`, `PopupBorderThickness`).

Keys this theme added to `scripts/data/theme-keys.json`:
- **`SlantPlateTemplate`** (ControlTemplate for a plain `Control`, `Common.xaml`): the slanted plate. Background = body, BorderBrush/BorderThickness = edge, Foreground = the second plate offset 4px down and right (Transparent for none). Drawn behind content so text stays upright; hosts keep about 0.1 x height of room at the sides for the slanted corners. Every use sets `Focusable="False" IsTabStop="False" IsHitTestVisible="False"`.
- **`ButtonHoverForegroundBrush`**: button text while hovered, because the hover turns the plate over (paper fill, ink text).

## Component spacing (`src/Common.xaml`)

Measured at 1080p and scaled by 2/3 (Playnite's 14px body against the menus' 21px labels).

| Key | Value | From |
|-----|-------|------|
| `ButtonPadding` | 16,7 | Command plate, 34 tall |
| `InputPadding` | 10,7 | Field, 34 tall |
| `MenuPadding` / `MenuItemPadding` | 4 / 12,6,16,6 | Command list, rows 30 tall, room for the slant on the right |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 4 / 12,6,16,6 | Same |
| `ListBoxItemPadding` | 12,6 | Rows 30 tall |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` / `GroupBoxHeaderFontSize` | 0,10,0,4 / 0,0,0,4 / 20 | Section caption behind a red slash, 2px rule |
| `TooltipPadding` | 10,5 | White name plate |
| `IconSize` | 18 | |
| `GameBannerHeight` | 360 | Spacer 120 (details) and 84 (grid panel) at the default |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | **Left (intended):** a 44px ink rail (`ShellBackgroundBrush`) with a 6px paper sawtooth (`FrameBrush` through a tiled triangle `OpacityMask`, teeth 10px apart) laid over the views by a negative margin. `MainMenuButton`: a 44 x 44 red block with the paper star; hover turns it to paper with a red star. **Right:** mirrored, starts 52px down. **Top/bottom:** a strip without teeth, 156px kept clear for the window buttons. |
| `CustomControls/SidebarItem.xaml` | 44 x 40, 16px glyph, fog at rest, paper on hover; current: a 30 x 26 slanted red plate with the blue sliver. Progress as a 3px teal bar. |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px, transparent, on a hard 2px ash rule (hidden with panel separators off). Search 260 x 34. View, filter, sort, explorer, filter and notifications toggles as 44 x 40 glyph buttons: hover a paper slanted plate with an ink glyph; on, the red plate with its sliver. Notification count in a 16px red square. |
| `DerivedStyles/MainWindowStyle.xaml` | 44 x 32 window buttons 10px from the top and right; hover paper with ink glyph, close red. 1px ash window edge. Caption band 52px. |
| `Views/Library.xaml` | Ink layer; background art under `ScrimBrush` (85% ink) at 75% plus a bottom fade; a red halftone (`GlyphBrush` through an 8px dot mask) at 22% fading in toward the bottom-right corner. All in a `BitmapCache` wrapper. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Ink panels with a 1px ash edge; filter captions in heavy capitals. |

## Game page

Skeleton and metadata pane as in `../AGENTS.md`, dressed as a status screen:
- **Title:** a battle name plate: `SlantPlateTemplate` with an ink body, 2px paper edge and a red drop; title in `HeadingFontFamily` at 40 (details) / 28 (grid panel).
- **Cover (details view):** a 3px paper frame with a red plate dropped 6px behind it.
- **Headings** (screenshots, description, notes, details): `HeadingTextBlock` (Common.xaml) behind a 7 x 20 red slash.
- **Info box:** coal (`ExpanderBackgroundBrush`) in a 2px paper edge; group rules 2px ash, so the wrapper's top margin is -34 (2 x 12 + 2 + 8). Captions in heavy capitals, fog.
- Play 48 tall, 168 min wide (details); Play's plate is inset 6 / 10 / 4 so its corners and sliver stay inside the button.

## Components

| Playnite file | Menu element |
|---------------|--------------|
| `Button`, `ToggleButton`, `RepeatButton` | Command plate: ink, 2px paper edge; hover paper with ink text; pressed / checked red. Default button red. Not slanted (plugins reuse it at every size). |
| `TextBox`, `PasswordBox`, `ComboBox`, `SearchBox`, `HighlightBorder` | Coal field in a 2px smoke edge; paper on hover; red on keyboard focus or open. |
| `ComboBoxItem`, `Menu` items, `ListBoxItem`, `DetailsViewItemStyle` | Current / hovered command on the slanted red plate with the blue sliver (list hover: soot plate, no sliver). |
| `TabControl` | Heavy capitals, fog; selected on the slanted red plate. Strip on a 2px ash rule. |
| `GroupBox` | Heavy caption behind a red slash over a 2px ash rule. |
| `CheckBox` / `RadioButton` | 18px square, red fill and paper tick when checked / a 14px diamond with a red inner diamond. |
| `Slider` / `ProgressBar` | 4px ash rail with red fill and a slanted paper thumb / 6px HP-teal gauge. |
| `ToolTip` | White name plate: paper, ink semibold text, 2px ink edge. |
| `PlayButton` | Slanted red plate in a paper edge with the blue sliver, heavy capitals. |
| `PropertyItemButton` | Links paper, red on hover; chips are slanted paper labels with ink text, red with sliver on hover. |
| `GridViewItemStyle` | Hover 3px paper frame; selected 3px red frame with a blue frame echoed 4px down-right. |

## Deviations

- **No ransom-note lettering.** The games mix letters cut from different typefaces and invert some of them; WPF has no per-letter styling of bound text, so titles use one heavy face.
- **No collage art, stars or moving shapes.** The menus animate constantly and pose characters behind them; the theme keeps the static shapes only.
- **Slant is a skew, not a cut polygon.** The game's plates are irregular quadrilaterals; a `SkewTransform` parallelogram is the closest shape that still sizes with its content.
- **Tactica's blue sliver** is used on every current plate; mainline Persona 5 draws a black or white drop more often. Blue keeps the current item distinct from plain red accents.
- **Fonts:** Impact stands in for the custom lettering.

## Not verified yet

Built and validated on Linux only (`build-theme.ps1`, `validate-extension.ps1 -Mode Package`); Playnite was not run. On Windows, check beyond the shared list:
- The rail's sawtooth `OpacityMask` (tiled `DrawingBrush`) and the library halftone render crisply at 100% and 150% scaling, and the halftone does not cost scrolling performance.
- Slanted plates do not clip at the edges of lists, menus and the tab strip (their corners reach 0.1 x height past the sides).
- The name plate on the game page with long, wrapping titles and with an icon.
- Play / context action alignment (Play is 48 tall, the context action 40, top-aligned).
