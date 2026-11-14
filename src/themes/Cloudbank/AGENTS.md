# Cloudbank: theme notes

## What this is

Standalone dark Playnite Desktop theme, `ThemeApiVersion` 2.9.0, inspired by the interface of *Transistor* (Supergiant Games, 2014): the Functions screen, the Turn() planning bar and the pause menu. One dark variant. Unofficial; not affiliated with, endorsed by or sponsored by Supergiant Games. No game art, function icon, logo or font ships; the tile mark (`art/mark.svg`: an upgrade-slot hexagon in selection brackets), the glow sprites and the preview art are original. See `info/NOTICE-Cloudbank.txt`.

Shared anatomy and first-run checks: [`../AGENTS.md`](../AGENTS.md). Loading rules: `docs/themes/reference.md`.

## Sources

[`RESEARCH.md`](RESEARCH.md): public captures (Functions, Turn() HUD, new-function and pause screens), the sampling method, every measured color, the Game Font Library font identification, and the chrome rules taken from them. Structural source: Playnite Default 10.60 (MIT, `info/LICENSE-Playnite.txt`). Icons: Phosphor light (MIT, `info/LICENSE-phosphor.txt`).

## Tokens

`src/tokens.css` names each color by its role in the game (`tr-*`).

| Token | Playnite / shared keys |
|-------|------------------------|
| `tr-void` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush` |
| `tr-deep` | `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `ScrimBrush`, `BackgroundToneColor` |
| `tr-panel`, `tr-panel-raised` | `MainColorDark`, `ExpanderBackgroundBrush`, `ListItemHoverBrush`; popups, tooltips, `HoverColor` |
| `tr-cell` | `MainColor`, `ButtonBackgroundBrush`, `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `TextColorDark`, chips, tracks, `ArtTintBrush` |
| `tr-glow` | `SelectedBrush`, hover fills for buttons, menus, chips, top bar items |
| `tr-frame`, `tr-trace` | `NormalBorderBrush`, `PanelSeparatorColor`, input edges, thumbs; `WindowPanelSeparatorColor`, menu separators, pressed buttons |
| `tr-circuit`, `tr-circuit-soft` | `FrameBrush` (lit panel edge and its bloom), `TopPanelRuleStartBrush`; `PopupBorderColor`, `ButtonBorderBrush`, check box edges |
| `tr-turn`, `tr-turn-dim` | `GlyphColor`, Play and default button, checked top bar item, slider, progress, tab indicator, `SidebarItemSelectedGlowBrush`; `HighlightGlyphColor`, pressed Play |
| `tr-bracket`, `tr-mint` | `FocusBrush`, `SelectedBorderBrush`, selected cover outline; links, chips, `TitleSuffixBrush`, main menu glyph |
| `tr-text`, `tr-text-body`, `tr-text-menu` | `TextColor`; `TextColorDarker`, `HeadingRuleBrush`; idle sidebar glyphs |
| `tr-func`, `tr-detail`, `tr-mem` | `HeadingMarkerBrush` (orange bar), `HeadingMarkerAltBrush` (blue bar); `PositiveRatingBrush` |
| `tr-active`, `tr-process` | `WarningBrush`, `MixedRatingBrush`, `DataChangeNotifColor`; `DangerBrush`, `NegativeRatingBrush` |

Radii: `ControlCornerRadius` 2 (`tr-radius`), small 1, large 3, XL 4, full 9999 only on square badges. Slider track 3 / fill 2 (6 / 4px), scroll thumb 3 (6px), tab indicator 1 (2px). Fonts: headings bundled Sora (`./Typography/#Sora`), then `Raleway, Century Gothic, Segoe UI` (`HeadingFontFamily`), body `Ubuntu, Segoe UI`; nothing ships. Scale 12 / 14 / 15 / 20 / 29.

## Component spacing (`src/Common.xaml`)

| Key | Value | From the game (1080p, scaled to a 14px base) |
|-----|-------|----------------------------------------------|
| `ButtonPadding` | 14,6 | Confirm and hint buttons |
| `InputPadding` | 8,6 | Turn() cells |
| `MenuPadding` / `MenuItemPadding` | 0,6 / 12,6 | pause menu rows |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,4 / 10,6 | |
| `ListBoxItemPadding` | 10,6 | |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 16,12,16,16 / 0,0,0,10 | Functions panels |
| `TooltipPadding` | 10,6 | |
| `IconSize` | 16 | |
| `GameBannerHeight` | 340 | spacer `x * 150 / 340` (details), `x * 120 / 340` (grid) |
| `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 300 / 300 | |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px rail on `tr-void`, 1px frame line; mint main menu glyph over a circuit stub; items 44x40 with a fixed 32x32 plate (no `IconPadding`), 16px glyph area; current = glow plate, aqua glyph, a soft aqua halo and cyan corner brackets |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px Turn() bar: 32px cells (cell fill, frame edge), current view = aqua cell with a bloom; the rule's left third is charged: bloom, electric arcs and a spark at the tip. Default order; 132px kept clear for the caption buttons |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). Solid `tr-deep` layer with the pause-panel glow under the top bar; the top bar is raised (`Panel.ZIndex` 1). |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | 1px frame around the window; 40x32 caption buttons with the theme's glyphs (close hovers Process red) |
| `DerivedStyles/StandardWindowStyle.xaml` | dialogs: 36px title band with an aqua marker, charged rule under it |

## Effects (`src/Images/fx`, `art/sprites.py`)

White alpha masks, colored in XAML by filling a rectangle with a theme brush and using the sprite as `OpacityMask` (CSS `mask` in the previews), so ThemeModifier edits recolor every glow. Generated by `art/sprites.py` (written with Codex from the measured profiles in `RESEARCH.md`; deterministic; `art/fx-sheet.png` is the review sheet). Rerun: `python art/sprites.py` from the theme folder.

| Sprite | Size | Used by |
|--------|------|---------|
| `glow-frame.png` | 128, 9-slice 44 / 40 / 44 | `GlowFrameTemplate`: details pane, GroupBox (0.22), Play, current view cell, selected and hovered covers |
| `glow-line.png` | 256x48 | `GlowLineTemplate`: top bar and dialog title rules |
| `arc-strip.png` | 512x40, tiles in x | `ArcStripTemplate`: top bar charge; Play hover (its own crawling strips) |
| `spark.png`, `halo.png`, `flourish.png` | 64, 128, 72x18 | top bar tip; sidebar halo and library glow; end of every section rule (`DividerTemplate`) |

No `DropShadowEffect` anywhere. Banner rule (found the hard way): the banner behind Play must not use an `OpacityMask`. When the Play hover animates, WPF repaints only the patch behind its bloom and arcs; on a scaled display a masked image re-rendered for that patch blends its edges with transparent black and leaves dark boxes at the bloom and arc bounds. The banner fades through a plain gradient rectangle to the page color instead (`Background.Color` of `PageRoot`). Removing `BitmapCache`, pixel snapping and ending the animations did not help; those changes stayed in place (no `BitmapCache` on any layer) but were not the fix.

## Game page

Skeleton as shared. Title: heading font 29 bold plus a mint `()` suffix in a `WrapPanel` (the game's function names). Section headers (Description, Notes, Details) = 4x14 marker bar, heading, hairline rule with the flourish. The metadata pane is the Functions DETAILS panel: `tr-panel`, 1px lit circuit edge, a second line 3px inside at 25%, and the panel bloom; header `LOCGameDetails`. Both views are generated by `art/gen-overviews.mjs` (one field table): edit the generator, then `node src/themes/Cloudbank/art/gen-overviews.mjs src/themes/Cloudbank/src`.

Empty state (no game selected): content hidden; a 96x84 slot hexagon in the selection brackets with a pulsing diamond pip, `LOCErrorNoGameSelected`, and a standby scan along seven memory pips; loops run only while it shows. The `()` title suffix hides when the title is empty. No divider under the title and actions.

## Components

| Playnite file | Game component |
|---------------|----------------|
| `Button`, `ToggleButton`, `RepeatButton` | Confirm button: cell, mint edge; default = aqua plate; Width=41 ThemeModifier detection, uniformly scaled to 32x32 with proportional content |
| `PlayButton` | lit Turn() remainder with bloom; hover animates both ways: mint plate, bloom and arcs fade in over 0.22s, the arcs crawl and flicker while hovered, all fade out over 0.35s; pressed fades in its own teal plate |
| `TextBox`, `PasswordBox`, `SearchBox`, `ComboBox` | sunken Turn() cells; aqua focus; ComboBox reserves 32px for the chevron |
| `CheckBox`, `RadioButton` | square slot pip; upgrade-slot hexagon |
| `Slider`, `ProgressBar` | memory pips (4px lit, 2px gap, tiled mask) |
| `GroupBox`, `TabControl`, `TreeView`, `ListBox`, `Menu`, `ToolTip` | section headers and panels; selection = glow fill plus a 2px aqua bar |
| `GridViewItemStyle`, `DetailsViewItemStyle` | selected function tile: static cyan brackets and bloom; hover is an animated target lock (brackets close in from 8% outside while fading in, mint outline and bloom fade in, the bloom breathes, all fade out over 0.25s); selected row bar with light bleeding into the row |
| `GridViewItemTemplate` (+ `GridTileButton`) | cover hover controls as 48x42 upgrade-slot hexagons with Cloudbank glyphs (`IconPlay` outlined triangle with circuit stubs, `IconInfo` diamond pip over a serifed bar, `IconDownload` outlined arrow over a split base, all custom in `Media.xaml`); entrance: shade fades in, buttons rise 10px and scale 0.86 to 1 (BackEase), Info 60ms after Play; hover traces an aqua outline around the hexagon (dash offset 97 to 0), lights the slot and pops the glyph |
| Running game (`RunningIndicatorBrush` = `--tr-func`, the Function orange) | The powered circuit, warm against the cyan: every surface carries an orange tint, a frame (2px; 1px on the button) and a trace of memory pips (the theme's own 4px-lit, 2px-gap progress cells, a tiled mask) running into a node, an upgrade-slot hexagon (covers: a dark tape at the foot holds both; the cyan bars, brackets and the selection stay outside). **Launching:** a block of lit cells (`RunningScan`: pip mask under a hard-edged block) crosses the item at a steady, mechanical pace while the pip trace fills behind it with a hard edge; as it lands the node lights and turns 120 degrees (1.7s loop, 0.5s rest). The slab holds a `ScrimBrush` scrim (0.2) under the cells and swaps the aqua bloom for an orange one. **Running:** the trace stays full, the node turns slowly (60 degrees per 3.2s) and the layer breathes 0.72 to 1; the slab scrim and orange bloom breathe, dark ink on the orange plate stays above 4.5:1. **Hover on RUNNING:** the plate darkens (second scrim 0.5), the label reads Cancel in the light text colour; the aqua hover plate, arcs and pressed plate are off while launching or running; hover binding is `Self`. Levers: block of cells band, linear pace, segmented pip trace, turning hexagon mark. |

## Previews

Both previews are written from `RESEARCH.md`, colors as `var(--tr-*)`, sprites loaded from `../src/Images/fx`. Motifs: Turn() bar cells and the charged rule with arcs and spark, cyan selection brackets, section bars with flourish rules, the glowing DETAILS panel, the `()` title suffix, the solid teal-to-black library. Play is shown in its hovered end state (arcs); the animation itself only runs in Playnite. Stand-ins: Raleway and Century Gothic drawn with Sora, Ubuntu with Selawik (`scripts/data/fonts.json` aliases). Banner and screenshots are CSS drawings.

## Deviations

- Heading font: the bundled Sora stands in for Raleway. Body text is Ubuntu when installed, else Segoe UI.
- WPF has no text-transform, so Playnite's localized labels keep their case; only theme strings imitate the game's caps.
- Neither the game page banner nor the library layer uses an `OpacityMask` (see Effects): their fades, the bottom darkening and the top glow are plain gradients whose colors come from brush swatches (`PageRoot`, `LibraryRoot`, `VoidSwatch`, `AccentSwatch`).
- Motion uses storyboards, not animated GIFs: WPF images do not play GIF frames, and a GIF would bake in its colors where the storyboards animate brush-colored sprites.
- Glows are pre-rendered sprites stretched by 9-slice, not live bloom; very small hosts (under 24px) show compressed corners.
- The cover brackets and bloom draw inside the item spacing; with very small grid spacing they clip at the panel edge.

## Not verified yet

- In Playnite: the cover hover target lock (no leftover boxes at 125% and 150%), the Play hover animation (fade in and out, crawl, flicker, leaving while pressed), the top bar bloom over the details and grid views, the Play arcs on hover, GroupBox bloom on the Statistics page (cards must still wrap compactly), and dialog title charge in Settings and the game editor.
- ThemeModifier recoloring of the glows (they follow `FrameBrush`, `GlyphBrush`, `TopPanelRuleStartBrush`, `PrimaryButton*` and `SelectedBorderBrush`).
- Performance with many glowing covers on large libraries.
