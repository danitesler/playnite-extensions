# Last Flame: theme notes

## What this is

Standalone dark Playnite Desktop theme, `ThemeApiVersion` 2.9.0, inspired by the interface of *Darkest Dungeon II* (Red Hook Studios): gothic, engraved, distressed. One dark variant. Unofficial; not affiliated with, endorsed by or sponsored by Red Hook Studios. No game art, icon, logo or font ships; the tile mark (`art/mark.svg`: a torch flame in a broken diamond), icons, sprites and preview art are original. See `info/NOTICE-LastFlame.txt`.

Shared anatomy and first-run checks: [`../AGENTS.md`](../AGENTS.md). Loading rules: `.claude/skills/playnite-theme-dev/reference.md`.

## Sources

[`RESEARCH.md`](RESEARCH.md): captures, sampling method, measured colors, chrome rules, font notes. Structure: Playnite Default 10.60 (MIT, `info/LICENSE-Playnite.txt`).

## Tokens

`src/tokens.css` names each color by its role in the game (`lf-*`).

| Token | Playnite / shared keys |
|-------|------------------------|
| `lf-void` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, tracks, tooltips, `TextShadowBrush`, chips |
| `lf-ink` | `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `BackgroundToneColor` |
| `lf-soot`, `lf-char`, `lf-ash` | `MainColorDark`, panels, popups, `ButtonBackgroundBrush`; `MainColor`, list and top bar hover; `HoverColor`, button hover |
| `lf-iron`, `lf-frame`, `lf-brass`, `lf-tan` | separators, `SlotBorderBrush`; control edges, `FrameInnerBrush`, rules; `FrameBrush`, hover edges; `GlyphColor`, headings, focus, ticks |
| `lf-bone`, `lf-dust`, `lf-grey` | `TextColor`; `TextColorDarker`; idle shell glyphs |
| `lf-blood`, `lf-blood-hot`, `lf-blood-deep` | Play, default button, ribbons, progress, `DangerBrush`; hover; pressed |
| `lf-wine`, `lf-oxblood` | `SelectedBrush`, menu hover, checked toggles, current sidebar plate; pressed buttons, `ArtTintBrush` |
| `lf-flame` | `PrimaryButtonGlowBrush`, `WarningBrush`, `DataChangeNotifColor` |
| `lf-verdigris` | `PositiveRatingBrush` |

Radii are 0 throughout; `CornerRadiusFull` is defined but unused. Scroll thumb 3 (6px wide). Fonts: `Dwarven Axe BB, Georgia` headings, Georgia body; nothing ships. Scale 12 / 14 / 16 / 20 / 32.

## Component spacing (`src/Common.xaml`)

| Key | Value |
|-----|-------|
| `ButtonPadding` | 16,5 |
| `InputPadding` | 9,5 |
| `MenuPadding` / `MenuItemPadding` | 0,5 / 12,7 |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,5 / 11,7 |
| `ListBoxItemPadding` | 11,7 |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 20,16,20,20 / 0,0,0,12 |
| `TooltipPadding` | 11,7 |
| `IconSize` | 16 |
| `GameBannerHeight` | 380, spacer `x * 210 / 380` (details), `x * 150 / 380` (grid) |
| `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 300 / 300 of usable content, inside the pane padding (repo default) |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px black rail with soot grain, closed by the worn double rule. Main menu is the hanging pennant carrying the theme's flame. Items 44x40, fixed 14,12 padding (no `IconPadding`), 16px glyphs; grey idle, tan on hover; current = 32x32 wine plate with tan chisel ticks |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px black bar with grain and the worn double rule. Default order; 132px kept clear. Toggled item = wine plate plus ticks. Notifications count on a red diamond |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). Low torchlight rises from the bottom (decor). |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | 1px iron window line; 40x32 caption buttons with hand-cut glyphs, close hovers crimson. `MainWindowButton` lives in `WindowBarButton.xaml` so it derives from the theme's style, not Default's |
| `DerivedStyles/StandardWindowStyle.xaml` | Dialogs: 40px band, crimson diamond, tan title, worn double rule |

## Effects (`src/Images/fx`, `art/sprites.py`)

White alpha masks filled with theme brushes, so ThemeModifier edits recolor them. Deterministic; rerun with `python art/sprites.py` from the theme folder. `art/fx-sheet.png` is the review sheet.

| Sprite | Size | Used by |
|--------|------|---------|
| `frame.png` | 192, 9-slice 48 / 96 / 48 | `DoubleFrameTemplate`: GroupBox, details pane |
| `ribbon.png` | 480x72 | `SelectionBarTemplate`: selected list row, selected cover, tab indicator, title underline |
| `pennant.png` | 360x104 | Play plates |
| `rule.png`, `rule-v.png` | 1024x10 and 10x1024, tile | Top bar, rail, dialogs, `DividerTemplate` |
| `grain.png` | 256, tiles | Rail and top bar, 0.3 opacity |
| `embers.png` | 128x256, tiles in y | Play hover |
| `glow.png` | 256 | `GlowFrameTemplate`: torchlight on Play, covers, cover buttons, empty page |
| `flame.png`, `flame-core.png` | 96x144 | Empty page brazier |

The banner's torn edge is a vector Path filled with the page brush and generated in `art/gen-overviews.mjs`. It is deliberately not a mask: masked art behind the animated Play button leaves dark seams on scaled displays.

## Game page

Skeleton as shared; both views generated by `art/gen-overviews.mjs` (`node src/themes/LastFlame/art/gen-overviews.mjs src/themes/LastFlame/src`). Title: bold heading font 32 in tan over a hard black copy, with the torn crimson ribbon under it; copy and ribbon hide when the title is empty. Play 172x46, More and Edit 44x44 icon squares. Section headers run into a diamond and the worn rule. Metadata sits in the broken double frame.

Empty state: an iron brazier with a flickering flame and breathing torchlight, `LOCErrorNoGameSelected`, and five diamonds with one lit. Loops run only while it shows. Details `PART_ScrollViewHost` is explicitly `Visibility="Visible"`.

## Components

`GameDetailsPaneWidth` and `GridDetailsPaneWidth` both default to 300px of usable metadata content. Width is applied inside the panel's horizontal padding, preserving that content space when ThemeModifier changes the padding or width.

| Playnite file | Game element |
|---------------|--------------|
| `Button`, `ToggleButton`, `RepeatButton` | Black plates with a worn gold edge and inner hairline; default = crimson plate; toggled = wine with ticks; Width=41 ThemeModifier detection, uniformly scaled to 32x32 with proportional content |
| `PlayButton` | Torn crimson chevron pennant. Hover animates both ways: hotter plate and torchlight fade in over 0.22s, embers rise, light flickers, ticks spread; out over 0.35s. Pressed has its own plate |
| `TextBox`, `PasswordBox`, `SearchBox`, `ComboBox` | Sunken black item slots; ComboBox reserves 32px for the chevron |
| `CheckBox`, `RadioButton` | Double-lined slot with a chisel check; diamond pip |
| `Slider`, `ProgressBar` | Health bar: black groove, crimson fill; diamond thumb |
| `GroupBox` | Soot panel in the broken double frame, content-sized |
| `TabControl`, `ListBox`, `TreeView`, `Menu`, `ToolTip` | Torn ribbon under the current tab; wine fill and tan bar for selection; black skill card with a crimson bar |
| `GridViewItemStyle`, `DetailsViewItemStyle` | Selected cover: static tan outline, ticks, ribbon below. Hover: torchlight fades up and flickers, brass outline, ticks spread with BackEase. Selected row lies on the torn ribbon |
| `GridViewItemTemplate` (+ `GridTileButton`) | 58px double-lined diamonds, hand-cut glyphs; shade fades, buttons rise 10px and scale 0.84 to 1, Info 60ms after Play; hover inks a tan line around the diamond (dash offset 106 to 0) and lights it crimson |

## Previews

Written from `RESEARCH.md`, colors as `var(--lf-*)`, sprites loaded from `../src/Images/fx`. Motifs: broken double frames and rules, hanging pennant, torn crimson ribbon, chevron Play with embers (shown hovered), corner ticks, diamond pips. Stand-in: Georgia drawn with Gelasio. Game names, banner and screenshots are invented CSS and SVG drawings.

## Deviations

- Fonts are named, not shipped, so most machines render Georgia Bold instead of a gothic display face.
- WPF has no text-transform or stroke: the cut lettering is an offset black copy of the title.
- Motion timings are chosen, not frame-measured (see `RESEARCH.md`).
- Playnite's menu icons (`AddGameIcon`, ...) keep their icofont glyphs; only hardcoded colors moved to theme brushes.
- `FilterPanelView` and `ExplorerPanel` are Default templates recolored through the palette.

## Not verified yet

- Hover at 125% and 150% scaling: Play, covers, cover buttons (no leftover boxes).
- Statistics: GroupBox cards must still wrap compactly.
- Empty state in both views, including selected game -> grid -> details with selection cleared.
- ThemeModifier recoloring of sprites and its 32x32 buttons.
- Sidebar at Right, Top and Bottom.
