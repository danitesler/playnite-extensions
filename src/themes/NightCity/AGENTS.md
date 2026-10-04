# Night City — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the **Cyberpunk 2077** interface in its yellow livery (the brand yellow of the logo, main menu, loading screens and marketing UI): near-black cold panels, off-white type, the acid yellow as the rail, the Play slab, selection frames and headings, cyan for keyboard focus, hostile red for danger. Square plates with clipped (chamfered) corners. Dark only.

**Unofficial fan theme.** No CD PROJEKT RED assets: the mark, chamfers and layout are original; icons are Phosphor. Rajdhani and Orbitron (OFL) are named first in the font lists but not shipped; Bahnschrift (every Windows 10/11) is the fallback. See `info/NOTICE-NightCity.txt`.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens (`src/tokens.css`)

| Token | Key | Used for |
|-------|-----|----------|
| `cp-page` 0a0a0d | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `TopPanelBackgroundBrush`, `NormalBrushDark` | Menu background |
| `cp-row` 15151b | `ButtonBackgroundBrush`, `InputBackgroundBrush`, `NormalBrush` | Plates, inputs, rows |
| `cp-row-hover` / `-pressed` | `HoverBrush`, hover/pressed keys | |
| `cp-yellow` fcee0a | `GlyphBrush`, `ShellBackgroundBrush`, `PrimaryButtonBackgroundBrush`, `SelectedBrush`, `HeadingForegroundBrush`, slider/progress fills | The signature yellow |
| `cp-yellow-dim` 8f8706 | `CheckBoxBorderBrush`, `TooltipBorderBrush`, hover thumbs | Yellow at rest |
| `cp-edge` 3a3a12 | `PopupBorderBrush`, `WindowPanelSeparatorBrush`, `MenuSeparatorBrush` | Dim yellow hairlines |
| `cp-cyan` 02d7f2 | `FocusBrush`, `DataChangeNotifBrush` | Keyboard focus |
| `cp-red` ff003c | `DangerBrush`, `NegativeRatingBrush` | Close hover, errors |
| `cp-text` / `-dim` / `-ink` | `TextBrush` / `TextBrushDarker` / `TextBrushDark` | Off-white, grey, black ink on yellow |

Radii are all 0 (`CornerRadiusFull` too), so the repo's corner-radius rules hold by construction. `FrameThickness` 2.

## Component spacing (`src/Common.xaml`)

34px rows (`ButtonPadding` 16,7.5; `InputPadding` 8,7.5), menu rows 30, `IconSize` 18, `GameBannerHeight` 340.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px yellow rail, 44 x 40 items, 16px black glyphs; 1px black rule 3px in from the inner edge, a 10px chamfer cut at the bottom; current item inverted (32px black plate, yellow glyph, 2px yellow tick); hover shows the plate |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 56px bar on the page color ending in a 2px yellow rule that fades at both ends; current view yellow with underline |
| `DerivedStyles/MainWindowStyle.xaml` | 44 x 32 window buttons, close hovers red |

## Game page

Skeleton as in `../AGENTS.md` (spacer 100/340 details, 72/340 grid). Title in the heading face, bold, yellow, over a 48 x 3 yellow underline; section headings yellow; Play is the chamfered yellow slab.

## Components

| Playnite file | Cyberpunk 2077 element |
|---------------|------------------------|
| Button | Dark plate, 1px edge, dim yellow corner triangle; hover: yellow edge and bright corner |
| PlayButton | Yellow slab, black ink, top-left and bottom-right corners clipped |
| CheckBox, RadioButton | Dim yellow box/ring, yellow tick/dot |
| Slider, ProgressBar | Yellow fill on a dark rail |
| TabControl | Grey labels, current yellow with a 3px yellow underline |
| ListBox, DetailsViewItemStyle, GridViewItemStyle | Selection = 2px yellow frame, yellow text |

## Deviations

- PlayButton's chamfer is a stretched path, so the cut grows slightly on very wide buttons.
- Generic buttons get a corner triangle instead of a true clipped corner (WPF `Border` cannot clip a corner without knowing the background).
- No glitch/scanline effects (no shader effects in Playnite themes).

## Not verified yet

Not yet loaded in Playnite (built and checked on Linux only). Check the sidebar chamfer at Right/Top/Bottom positions, PlayButton in the grid side panel, and ThemeModifier recolors.
