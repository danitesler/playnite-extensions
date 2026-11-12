# Glyphbit: theme notes

## What this is

Standalone dark Playnite Desktop theme, `ThemeApiVersion` 2.9.0, inspired by the interface of *Hyper Light Drifter* (Heart Machine, 2016): the HUD, the inventory and the settings screen. One dark variant. Unofficial; not affiliated with, endorsed by or sponsored by Heart Machine. No game art, logo, font or glyph ships: icons, rune columns and the tile mark are original and generated. See `info/NOTICE-Glyphbit.txt`.

Shared anatomy and first-run checks: [`../AGENTS.md`](../AGENTS.md). Loading rules: `.claude/skills/playnite-theme-dev/reference.md`.

## Sources

[`RESEARCH.md`](RESEARCH.md): captures, sampling method, measured and estimated colors, interface rules. Structural source: Playnite Default 10.60 (MIT, `info/LICENSE-Playnite.txt`).

## Tokens

`src/tokens.css` names each color by its role on screen (`gb-*`).

| Token | Playnite / shared keys |
|-------|------------------------|
| `gb-void` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `ExpanderBackgroundBrush`, `InputBackgroundBrush`, `ScrimBrush`, `TextColorDark` |
| `gb-ink` | `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, popups, `MainColorDark` |
| `gb-slot`, `gb-slate` | `MainColor`, buttons, chips; `HoverColor`, list hover, top bar hover |
| `gb-edge`, `gb-mauve` | control edges, slider track, separators; `FrameInnerBrush` (runes, cover button edge) |
| `gb-magenta` | `GlyphColor`, frame hover, links, `PrimaryButtonGlowBrush`, progress, top rule start |
| `gb-magenta-deep`, `gb-magenta-dark` | `SelectedBrush` (the full bar), `FrameBrush`, popup edge; button hover |
| `gb-mint`, `gb-mint-hi`, `gb-mint-dim` | Play and its states, `FocusBrush`, current sidebar item, `PositiveRatingBrush`, top rule end |
| `gb-cyan` | top rule middle |
| `gb-white`, `gb-ash` | `TextColor`, checked top bar chip; `TextColorDarker`, filled slider pips |
| `gb-amber`, `gb-red`, `gb-violet` | warnings, mixed rating; danger, negative rating; banner wash |

Radii are all 0: corners are stepped by `ChamferTemplate`. Fonts: `Bahnschrift` body, `Bahnschrift SemiCondensed` headings, Segoe UI fallback; nothing ships. Scale 12 / 14 / 15 / 20 / 30.

## Component spacing (`src/Common.xaml`)

| Key | Value |
|-----|-------|
| `ButtonPadding` / `InputPadding` | 14,5 / 8,5 |
| `MenuPadding` / `MenuItemPadding` | 0,4 / 12,7 |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,2 / 10,6 |
| `ListBoxItemPadding` / `TooltipPadding` | 10,6 / 10,6 |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 16,14,16,16 / 2,0,0,6 |
| `IconSize` / `ControlHeight` | 16 / 32 |
| `GameBannerHeight` | 320; spacer `x * 170 / 320` (details), `x * 130 / 320` (grid) |
| `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 300 / 300 |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px void rail; mint main menu glyph over a short ramp; items 44x40, 16px glyph, no `IconPadding`; current = black slot with a mint edge and three 2px counter squares |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px void bar, 2px stepped ramp magenta to cyan to mint; icon-only 32px cells, current = white chip; Default order; 132px kept clear for the caption buttons |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). |
| `DerivedStyles/StandardWindowStyle.xaml` | dialogs as the settings screen: 2px magenta frame, magenta title with a pip, noise strips along two edges |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | 1px slate edge; pixel caption glyphs; close hovers red |

## Generated art

No sprites. Everything is vector or opacity, so ThemeModifier recolors it.

- `art/glyphs.py`: writes `src/Media.xaml` (32 glyphs on an 8x8 grid doubled to 16, plus `EmptyGameIcon`, `IconGlyphColumn`, `IconGlyphStrip`, `IconCrumbleEdge`, `IconScanlines`), 24 menu icons in `src/Images/Glyphs` and `art/glyphs.js` for the previews. Fixed seed. Menu icon PNGs bake bone, red and amber, because Playnite rebuilds those keys and a vector would be lost.
- `art/gen-overviews.mjs`: writes both game pages from one field table. Edit it, not the XAML.
- `ChamferTemplate` (Common.xaml): the stepped plate, two crossed rectangles per layer. Solid fills only, or the overlap shows.
- `PixelRampTemplate` (Common.xaml): 12 hard bands of Foreground over Background by opacity alone.

The banner uses no `OpacityMask`, since it sits behind animated Play. Slider and ProgressBar pips do use a tiled mask; nothing animates behind them.

## Game page

Skeleton as shared. Description and notes carry no heading, only a short stepped ramp. The metadata pane has no heading either: a 2px magenta frame on void, a rune column inside the top-left corner and a white pip on the top right. Field captions stay, since the shared layout requires them, small and in ash. The banner gets a violet wash, scanlines and a ragged pixel edge.

Empty state: an inventory slot with bracket marks holding a stepped-diamond module that pulses in hard frames, three blinking mint sparks and a pip row scanning underneath. Loops animate plain properties and run only while it shows.

## Components

| Playnite file | Game element |
|---------------|--------------|
| `Button`, `ToggleButton`, `RepeatButton` | footer hint plates; default = magenta bar; Width=41 ThemeModifier detection, scaled to 32x32 |
| `PlayButton` | mint health pip with a stepped ramp into magenta. Hover: two magenta afterimages trail left and flicker, four pips charge across the ramp, plate brightens, in 40 to 60ms hard frames; separate pressed plate |
| `Slider`, `ProgressBar` | settings volume row (14px pips, 2px gap); energy gauge (8px pips) |
| `CheckBox`, `RadioButton` | slot with one mint pip; stepped diamond with a magenta core |
| `ComboBox`, `ListBox`, `TreeView`, `Menu`, `TabControl`, details rows | selection and hover as the full magenta bar with white text |
| `GroupBox` | label above a thin frame, rune column, corner pip; content-sized (runes in a Canvas) |
| `GridViewItemStyle` | selected: static magenta frame and white pip. Hover: the slot's brackets close on the cover in three hard steps |
| `GridViewItemTemplate` (+ `GridTileButton`) | 40px chamfered slots with `IconPlay` / `IconDownload` / `IconInfo`; shade steps in, buttons rise 8px in hard steps, Info 60ms later; hover fills mint |

## Previews

Written from `RESEARCH.md`, colors as `var(--gb-*)`, glyphs from `art/glyphs.js`. Motifs: stepped ramps, the magenta selection bar, thin frames with rune columns and corner pips, pip sliders, chamfered white chip, ragged banner edge with scanlines, diamond backdrop. Bahnschrift draws with Barlow stand-ins. Banner and screenshots are procedural canvases of a fictional game.

## Deviations

- The game's pixel typeface is not reproduced. No Windows pixel font is safe to rely on and themes cannot ship fonts, so Bahnschrift stands in.
- Field captions remain on the game page despite the near-wordless source: the shared layout requires them and themes cannot ship strings.
- Scanlines cover only the banner, not the whole window, to keep library text legible.
- Motion is stepped from judgment, not measured from video.

## Not verified yet

- In Playnite: Play hover and exit at 125% and 150% (no leftovers around the afterimages), cover brackets and overlay buttons, empty state in both views (fresh empty selection; game -> grid -> details with selection cleared; reselect), Statistics cards wrap, game edit dialog fields line up and its labels read, ThemeModifier recolors ramps and frames and its icon buttons render 32x32.
- Glyph crispness at fractional scaling: glyphs are 2px art on a device-independent grid.
- Add-on sidebar icons render inside the 16px area.
