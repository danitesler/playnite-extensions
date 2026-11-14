# Backbeat: theme notes

## What this is

Standalone dark Playnite Desktop theme, `ThemeApiVersion` 2.9.0, inspired by the comic-book, cel-shaded look of *Hi-Fi RUSH* (Tango Gameworks, 2023). One dark variant. Unofficial; not affiliated with, endorsed by or sponsored by Tango Gameworks, Bethesda Softworks, ZeniMax Media or KRAFTON, Inc. No game art, character, logo or font ships; the tile mark, icons, sprites, speech balloon and preview art are original. See `info/NOTICE-Backbeat.txt`.

Shared anatomy and first-run checks: [`../AGENTS.md`](../AGENTS.md). Loading rules: `docs/themes/reference.md`.

## Sources

[`RESEARCH.md`](RESEARCH.md): the sampling method, measured colors, what the sources do and do not establish, and the chrome rules. Structural source: Playnite Default 10.60 (MIT, `info/LICENSE-Playnite.txt`). Icons: hand-cut for this theme.

## Tokens

`src/tokens.css` names each color by its role (`bb-*`).

| Token | Playnite / shared keys |
|-------|------------------------|
| `bb-ink` | `TextColorDark`, `ShellBackgroundBrush`, `InputBackgroundBrush`, `PanelShadowBrush`, `CheckBoxCheckMarkBkBrush`, chips, tooltips, `PrimaryButtonBorderBrush`, heading text, `TextOutlineBrush` |
| `bb-night` | `WindowBackgourndBrush`, `TopPanelBackgroundBrush`, `PopupBackgroundColor`, `ArtTintBrush` |
| `bb-plum` | `MainColorDark`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `ScrimBrush` |
| `bb-panel`, `bb-panel-hi` | `MainColor`, `ButtonBackgroundBrush`, `ExpanderBackgroundBrush`; `HoverColor`, `ListItemHoverBrush` |
| `bb-paper` | `TextColor`, `FrameBrush`, `ButtonBorderBrush`, `PopupBorderColor`, `TopPanelRuleEndBrush`, `CheckBoxBorderBrush` |
| `bb-lilac`, `bb-lilac-dim` | `TextColorDarker`, `InputBorderBrush`, idle sidebar glyphs; `NormalBorderBrush`, `WindowPanelSeparatorColor`, scroll thumbs, rules |
| `bb-yellow` | `GlyphColor`, `ListItemSelectedBrush`, `TopPanelItemCheckedBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `HeadingMarkerAltBrush`, `SelectedBorderBrush`, sliders and progress |
| `bb-orange`, `bb-orange-hot` | `PrimaryButtonBackgroundBrush`, `HighlightGlyphColor`, `TitleSuffixBrush` (metadata card shadow and header), `MainMenuButtonBackgroundBrush`, `SliderThumbBackgroundBrush`, `WarningBrush`; `PrimaryButtonPressedBackgroundBrush` |
| `bb-cyan` | `FocusBrush`, `PropertyItemForegroundBrush`, `HeadingMarkerBrush`, `GridViewItemHoverBorderBrush`, `SecondaryButtonBackgroundBrush`, `PrimaryButtonGlowBrush`, halftone patches |
| `bb-blue`, `bb-blue-deep` | `SelectedBrush`, `MenuItemHoverBrush`, button and top bar hover; `ButtonPressedBackgroundBrush` |
| `bb-red`, `bb-green` | `DangerBrush`, `NegativeRatingBrush`; `PositiveRatingBrush` |

Blue is the selection color wherever Playnite or an add-on may draw its own light text or icons. Yellow plates hold ink text only where the theme controls the content: toggled top bar items, tabs, Play hover, section stickers and the game list (Default's row text inherits the item's `Foreground`).

Radii: all 0 except `CornerRadiusFull` 9999, used only on the 17x17 notification badge. Border keys: `ControlBorderThickness` and `PopupBorderThickness` 2. Fonts: headings `Impact, Segoe UI` (italic, normal weight), body `Segoe UI`; nothing ships. Scale 12 / 14 / 16 / 20 / 34.

New vocabulary entries in `theme-keys.json`: `AngledCardTemplate`, `HalftoneTemplate`, `IconBurst`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Note |
|-----|-------|------|
| `ControlHeight` | 32 | Shared form height |
| `ButtonPadding` | 16,6 | Wider than usual so the slant does not crowd labels |
| `InputPadding` | 8,6 | |
| `MenuPadding` / `MenuItemPadding` | 0,6 / 12,6 | |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,4 / 10,6 | |
| `ListBoxItemPadding` | 10,6 | |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 18,14,18,18 / 0,0,0,12 | Clears the tilt and outline |
| `TooltipPadding` | 10,6 | |
| `IconSize` | 16 | |
| `GameBannerHeight` | 340 | Spacer `x * 150 / 340` (details), `x * 120 / 340` (grid) |
| `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 300 / 300 | Content width inside the card padding |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px ink rail, 3px white edge; main menu is an orange impact star; items 44x40 with a fixed 32x32 plate (no `IconPadding`); current = blue sticker, white line, yellow offset; halftone patch at the rail's foot |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 56px night strip, 3px white rule, three slanted print-color tabs on its left end; 32px slanted stickers; current view is yellow with an ink glyph; Default order; 132px kept clear for caption buttons |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | 40x32 caption buttons with the theme's glyphs; hover blue, close hover red |
| `DerivedStyles/StandardWindowStyle.xaml` | Dialogs: 40px ink title band, 3px white rule, title on a yellow sticker |

## Effects (`src/Images/fx`, `art/sprites.py`)

White alpha masks colored in XAML through `OpacityMask`, so ThemeModifier recolors them. `python art/sprites.py` regenerates them deterministically and prints the `IconBurst` path; `art/fx-sheet.png` is the review sheet. The script was written directly rather than through an external agent because the sprites are plain geometry.

| Sprite | Size | Used by |
|--------|------|---------|
| `halftone-wide.png` | 420x120 | Banner top-right corner, height `x * 0.3` of the banner so it stays clear of the Play star |
| `halftone-card.png` | 180x100 | `HalftoneTemplate`: metadata card and GroupBox corners |
| `halftone-rail.png` | 44x150 | Sidebar foot |
| `speedlines.png` | 512x40, tiles in x | Play hover |

The impact star is a vector `Path` (`IconBurst`), so the Play and cover animations put no masked art behind themselves. The banner fades through a plain gradient to `PageRoot`'s color. No `DropShadowEffect` anywhere.

## Game page

Skeleton as shared. Both views come from `art/gen-overviews.mjs`: edit the generator, then `node src/themes/Backbeat/art/gen-overviews.mjs src/themes/Backbeat/src`. Title: heading font 34 italic over a hard ink copy offset 3px, bound to the real title so it empties with it. A slanted 3px white panel cut sits in the content flow under the header, so it can never cross the text columns. Section headers are stickers followed by a hard rule ending in four beat ticks. The metadata pane is a comic panel: 1.4 degree tilt, 3px white line, orange 6px shadow, halftone corner.

Empty state (no game selected): content hidden; a blank speech balloon on a cyan impact star with three dots pulsing on the beat (0.46s apart), then `LOCErrorNoGameSelected`. Loops animate `Opacity` only and stop when a game is selected. The details `PART_ScrollViewHost` is explicitly `Visibility="Visible"`.

## Components

| Playnite file | Treatment |
|---------------|-----------|
| `Button`, `ToggleButton` | Slanted sticker, 2px white line, ink offset; hover blue; `IsDefault` orange with ink label; Width=41 ThemeModifier detection, uniformly scaled to 32x32 with proportional content. `RepeatButton` stays square because a slant crowds small spin buttons |
| `PlayButton` | Orange sticker, 3px ink. Hover animates both ways: yellow plate fades in, cyan impact star pops out (BackEase), speed lines crawl, and the button thumps every 0.46s. Pressed fades in a hot-orange plate and shoves 2px into its shadow |
| `TextBox`, `PasswordBox`, `SearchBox`, `ComboBox`, `DatePicker` | Ink field, lilac line, white hover, yellow focus; SearchBox is slanted; ComboBox reserves 32px for its chevron |
| `CheckBox`, `RadioButton` | Marker-stroke yellow tick overshooting the box; yellow impact star in a ring |
| `Slider`, `ProgressBar` | Guitar-pick thumb on an ink track; slanted yellow beat segments |
| `GroupBox`, `TabControl`, `TreeView`, `ListBox`, `Menu`, `ToolTip` | Comic panel with sticker header; yellow sticker tabs; blue selection with a 4px yellow bar |
| `GridViewItemStyle` | Selected, static: white line, yellow offset, star sticker top-left. Hover, animated: cover lifts 3px, cyan shadow slides to 7px, orange star spins onto the top-right corner |
| `GridViewItemTemplate` (+ `GridTileButton`) | 48x40 parallelogram stickers, orange Play and cyan Info, custom ink glyphs; they drop in tilted and small, then snap into place, Info 60ms after Play; hover lights yellow and pops the glyph |
| `DetailsViewItemStyle` | Selected row is a yellow sticker with ink text; hover is a purple slanted plate |
| `PropertyItemButton` | Cyan links; chips are slanted ink stickers with a cyan line |
| Running game (`RunningIndicatorBrush` = `bb-green`) | the backbeat: everything rides the -9 degree skew of the sticker plates. A reverse comet (a hard trailing edge with a soft front, `RunningScan`, masked inside the skewed layer so it keeps the slant) crosses details rows, list rows, covers and the slanted plate, and the equalizer is the progress read. **Launching:** the hit takes 0.95s (1.5s loop, a hard ease), a foot line fills behind it and the three equalizer bars (`RunningBar1..3`) kick up one after another as it lands. **Running:** the foot stays full, the frame breathes 0.72 to 1, the bars dance on their own phases (2.4s) and the plate thumps once per cycle (`Thump`, 2.5%). The plate holds a 0.88 scrim over the green while launching and breathes 0.55 to 0.68 while running under a light label; hover on RUNNING (button only, `Self`) swaps the label for Cancel, and the burst, hover plate and speed lines are off while launching or running. |

## Previews

Both previews are written from `RESEARCH.md`, colors as `var(--bb-*)`, sprites loaded from `../src/Images/fx`. Motifs: slanted stickers, hard offset shadows, halftone corners, impact stars, the tilted metadata panel, beat ticks on rules, the guitar-pick slider. Play is shown in its hovered end state. Stand-ins: Impact is drawn with Anton, Segoe UI with Selawik. The banner, screenshots and game names are invented; no game art appears.

## Deviations

- Fonts are named, not shipped. Impact has no italic face, so WPF slants it synthetically.
- WPF has no text-transform, so Playnite's localized labels keep their case.
- Skewed plates are drawn outside their layout box by a few pixels. At the edge of a clipped list the row's slanted ends are cut.
- Cover shadows and stars draw inside the item spacing; with very small grid spacing they clip at the panel edge.
- Motion is storyboards, so the beat is a fixed 130 BPM and is not tied to any audio.

## Not verified yet

- In Playnite at 100%, 125% and 150%: Play hover in and out and leaving while pressed, cover hover, cover buttons, no leftover boxes.
- The Statistics page wraps as compact cards with the tilted GroupBox.
- Empty state in both views, including selected game -> grid -> details with selection cleared.
- ThemeModifier recolors every layer; pencil and restore buttons read as 32x32 squares.
- Synthetic italics on Impact in the title, tabs and stickers at small sizes.
