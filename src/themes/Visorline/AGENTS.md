# Visorline — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the menus and Nano Visor HUD of **Crysis 2** as seen in public captures. Unofficial: not affiliated with, endorsed by or sponsored by Crytek or Electronic Arts (`info/NOTICE-Visorline.txt`). It ships no game files, no logo and no game fonts; the mark is the theme's own hex cell broken by a visor slit.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Captures, sampled values and observed rules: [`RESEARCH.md`](RESEARCH.md) (Game UI Database entry 1204, 15 captures). Creative brief (source DNA, game element map, moments, motion, brand): [`BRIEF.md`](BRIEF.md). Motion was not measured: no video was available.

Wiring (part names, triggers, the responsive body, the overview generator's structure, the running-game contract) was started from this repo's Emberline theme; every motif, sprite, icon, token and control look was redrawn for this source.

## Tokens

`vs-*` in `src/tokens.css`, sampled from the captures. Plates are square or cut at 45 degrees; the only round shapes are the radio button and the glyphs.

| Token | Key | Used for |
|-------|-----|----------|
| `vs-hud` | `HeadingForegroundBrush`, `SelectedForegroundBrush`, `FocusBrush`, `HighlightGlyphBrush`, `PrimaryButtonForegroundBrush`, `SliderThumbBackgroundBrush`, `MainMenuButtonForegroundBrush`, `GridViewItemSelectedBorderBrush` | Lit text, selected labels, brackets on the selected cover |
| `vs-mint` | `TextBrush`, `ButtonForegroundBrush`, `PropertyItemForegroundBrush`, `TooltipForegroundBrush` | Body ink |
| `vs-label` | `TextBrushDarker`, `TabItemForegroundBrush`, `SidebarItemForegroundBrush` | Captions, idle glyphs |
| `vs-ink` | `TextBrushDark` | Text on a lit fill |
| `vs-void` | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush`, `InputBackgroundBrush`, `TooltipBackgroundBrush`, `ScrimBrush`, `BevelShadowBrush` | Shell, rail, bars, field wells |
| `vs-panel` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | Page and window bodies |
| `vs-pit` | `NormalBrush`, `ExpanderBackgroundBrush`, `PopupBackgroundBrush`, `PropertyItemBackgroundBrush`, `TabControlHeaderBackgroundBrush` | Cards, popups, chips |
| `vs-slab` / `vs-slab-lit` | `ButtonBackgroundBrush`, `PrimaryButtonBackgroundBrush` / `ButtonHoverBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush` | The chamfered plate (captured `#27332c` to `#3b4d43`) |
| `vs-band` / `vs-band-dim` | `SelectedBrush`, `ListItemSelectedBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush`, `ButtonPressedBackgroundBrush` / `SelectedSheenBrush` | The grained selection band |
| `vs-plate` / `vs-plate-lit` | `ListItemHoverBrush` / `HoverBrush`, `MenuItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` | Hover plates |
| `vs-edge` / `vs-edge-lit` | `PanelSeparatorBrush`, `ProgressBarTrackBrush`, `FrameInnerBrush` / `NormalBorderBrush`, `InputBorderBrush`, `ButtonBorderBrush`, `FrameBrush`, `CheckBoxBorderBrush`, `ScrollBarThumbBrush` | Hairlines |
| `vs-rule` | `GlyphBrush`, `SelectedBorderBrush`, `PrimaryButtonBorderBrush`, `PrimaryButtonGlowBrush`, `ProgressBarForegroundBrush`, `FrameHoverBrush`, `GridViewItemHoverBorderBrush`, `TitleSuffixBrush`, `TabItemIndicatorBrush` | The lit mint rule: selection edges, progress, brackets, the empty page's mark |
| `vs-deep` | `GameBannerTintBrush`, `ArtTintBrush` | Banner darkening |
| `vs-star` | `RunningIndicatorBrush`, `DataChangeNotifBrush`, `WarningBrush`, `MixedRatingBrush` | The source's neon yellow marker: running game, filter mark, favourites |
| `vs-alert` | `DangerBrush`, `NegativeRatingBrush` | The red ammo digits: danger |

**Banner darkening color**: `GameBannerTintBrush` = `vs-deep` `#08110e`, the teal-black the menus fade to, so a darkened banner keeps the menu's green cast instead of going plain black.

Fonts: `HeadingFontFamily` Rajdhani Bold (bundled in `src/Typography/`, OFL, trimmed to Latin and Cyrillic), set bold wherever it is used. `FontFamily` Bahnschrift, then Segoe UI. WPF has no letter-spacing, so none is drawn.

## ThemeModifier

Edit constants come from the shared catalog (`scripts/data/theme-keys.json`); the build writes `thememodifier.yaml`. Every sprite is a white mask filled with a theme brush, so recoloring `GlyphBrush`-family brushes moves the rule, brackets, bars and bloom together. The six shared template keys this theme added to the catalog: `ChamferLeftTemplate`, `ArrowTemplate`, `BandTemplate`, `BracketFrameTemplate`, `RulerLineTemplate`, `BloomTemplate`.

## Component spacing (`src/Common.xaml`)

| Key | Value | Why |
|-----|-------|-----|
| `ControlHeight` | 32 | Repo rule |
| `ButtonPadding` | 16,5 | Caps label on a chamfered plate |
| `InputPadding` | 12,5 | The cut left end needs room |
| `MenuPadding`, `ComboBoxDropDownPadding` | 4 | Room for a selected item's band |
| `MenuItemPadding` / `ListBoxItemPadding` / `ComboBoxItemPadding` | 12,7 / 10,7 / 10,7 | 32px rows |
| `GroupBoxPadding` | 14,12,14,14 | Body under the 34px header |
| `TooltipPadding` | 10,5 | A prompt plate |
| `GameBannerHeight` | 300 | Title sits in the faded lower third |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | 44px near-black rail over a faint honeycomb, closed by the HUD's rule (1px, burning mint at the top, cooling down the rail) with a ruler of ticks beside it. Main menu: the mark in a 32px hex cell; hover lights the cell and fades a bloom in |
| `CustomControls/SidebarItem.xaml` | 44x40, 16px glyph. Hover: a plate fades in. Current: the grained band between two lit rules, sliding in from the edge in 200ms |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px bar closed by a mint rule fading at both ends, an angled bracket at each end. 34px cells: a plate on hover, the band when toggled. Filter active: an 8px yellow diamond. Notification count in a 16px yellow plate |
| `CustomControls/SearchBox.xaml` | Left-cut plate; focus lights the edge mint and fades the ruler rule in under it |
| `DerivedStyles/MainWindowStyle.xaml` | Window frame, `MainMenuButton` (the hex cell), 40x32 caption buttons, 132px kept clear on the top bar |
| `Views/Library.xaml` | Flat page. Game art only while Playnite's window background setting is on, at full strength with a soft bottom edge; the top bar, side panels and game pages go see-through and the banner collapses |

## Game page

Generated by `art/gen-overviews.mjs` (edit the generator, then `node src/themes/Visorline/art/gen-overviews.mjs src/themes/Visorline/src`). Differences from the skeleton:

- Banner: shown clean, darkened at its head, plain gradient into the page, two angled corner lines over the art. No mask on it.
- Spacer `x * 200 / 360` in details (floor 20), `x * 140 / 360` in the grid panel (floor 14).
- Title: hex bullet, then the name in the display face (uppercase copy over a hard black copy). Play is 210x48; More and Edit are 44x44 chamfered plates.
- Compass strip under the title row: a rule with ruler ticks and the HUD's yellow marker at 62%.
- Section headings: hex bullet, uppercase heading, hairline.
- Metadata pane: card with angled corner brackets. Scores are segmented bars (the shared `ProgressBar`, 0 to 100) with the number after them.
- Empty state: the mark over a bloom that breathes (Opacity loop in a Style trigger), four angled corner brackets around it, `LOCErrorNoGameSelected` between two angle brackets, a ruler rule under it.

## Components

| Playnite file | Drawn as |
|---------------|----------|
| `Common.xaml` | Motifs: `ChamferTemplate` / `ChamferLeftTemplate` / `ArrowTemplate` (plates cut 7px, built from exact pieces so the cut holds at any size), `BandTemplate` (the selection), `BracketFrameTemplate` (four angled brackets), `RulerLineTemplate`, `BloomTemplate`, `FramedPlateTemplate` (card with two brackets), `DividerTemplate` (hex bullet + rule), `CornerMarksTemplate` (focus). `RivetsTemplate` is kept empty |
| `Button`, `ToggleButton` | Chamfered slab plate, mint caps label (Rajdhani Bold); default = lit rim; toggled = the band |
| `RepeatButton` | Plain plate: spin and carousel buttons are too small to chamfer |
| `TextBox`, `PasswordBox` | Left-cut plate; mint edge on focus |
| `ComboBox` | Arrow plate (the source's dropdown), value in Rajdhani Bold, bare chevron (36px reserved) |
| `CheckBox` / `RadioButton` | 18px hex cell that lights its check / a ring that lights around a HUD-white core |
| `Slider` / `ProgressBar` | Segmented cells (10px, 8 lit) under a fixed mask; the slider's thumb is a bracket pair / the HUD's ENERGY bar |
| `ScrollViewer` | 12px lane, 4px square bar |
| `ToolTip` | The source's contextual prompt: near-black plate, mint rim, two angled corner brackets |
| `ContextMenu`, `Menu`, `ListBox` | Black panels in a bracketed card hairline; menu items take a 3px mint bar, list rows the band |
| `TabControl` | Caps labels; the current one on the band, fading in |
| `GroupBox` | Card with bracketed corners, hex bullet, display-face title and a ruler rule (content-sized) |
| `TreeView` | Bare 28px rows beside the HUD's left rule and ruler; hover lifts a plate; selected = band, lit label and a 3px tick. 250 / 280 wide in Settings / Add-ons with the scroll lane reserved |
| `StandardWindowStyle`, `WindowBarButton` | 44px band over a faint honeycomb: the mark, then the title between two angle brackets, the mark ghosted at 7%, the ruler rule closing it; 46x44 caption buttons |
| `PlayButton` | The hero; see `BRIEF.md` -> Moments and the file header |
| `GridViewItemStyle` | Selected: static brackets in HUD white and a hairline. Hover: a mint hairline, brackets drawing in once with a boot flicker, low bloom |
| `GridViewItemTemplate` | `GridTileButton`: 48px chamfered plate that lifts to the lit slab on hover |
| `DetailsViewItemStyle`, `ListView` rows | Rows take the band; hover lifts a plate |
| Running game (`RunningIndicatorBrush` = `vs-star`) | The shared contract (`docs/themes/running-motion.md`): a yellow frame, wash and scan, a foot line that fills, and three segment pips that tick up. Launching sweeps once per 1.7s; running idles at 3.2s. The Play plate keeps its shape and fills with the yellow while launching or running |
| `PropertyItemButton` | Text links; chips are small slanted plates (the source's mode tabs), both ends cut at the same slant |

## Effects

`art/sprites.py` (Pillow + numpy, seed 211) writes white masks to `src/Images/fx/` and a review sheet to `art/fx-sheet.png`: `hex` (24x42 honeycomb tile), `bloom`, `grain`, `scan` (kept for future use), `seg` (10x12 cell tile), `ruler-h` and `ruler-v`. `art/icons.py` writes the `Icon*` geometries in `Media.xaml` and `art/mark.svg`; edit the script, not the paths. All are filled with theme brushes.

## Previews

Written by `art/previews.py` (edit the generator): tokens as `var(--vs-*)`, the theme's sprites through CSS masks, icons from the `Media.xaml` geometries. Motifs drawn: the grained band (list row, rail, tree, toggled cells), chamfered plates, the ENERGY bar under Play (its hovered end state with brackets and the prompt cap), segmented score bars, , the compass strip with its yellow marker, corner brackets and `+` marks, hex check boxes. Stand-in fonts: Barlow for Bahnschrift; Rajdhani as itself. The banner and covers are CSS paintings.

## Deviations

- No letter-spacing: WPF's `TextBlock` cannot track text, so the preview draws none either.
- Combo and button values keep their case: the value is arbitrary content, not a string Playnite lets the theme upper-case. Titles, tabs, headings and buttons that pass through a theme template are upper-cased.
- Bloom is a stretched sprite behind a plate or label; text itself has no glow (no `DropShadowEffect` in this repo).
- The source's selected band is a photographic texture; here it is a flat fill, a darkening gradient and a grain tile.
- The hex mesh is tiled at 5 to 8% opacity on chrome only (rail, title band, Play plate); lists and covers stay on flat near-black.
- The preview's `+` marks are drawn on the banner in the preview only; in Playnite the banner carries the two angled corner lines.
- Bahnschrift is a variable font and WPF draws its Regular instance only.

## Not verified yet

- Only the details view of the library was looked at in a running Playnite, with one game launching. Still to check: hover and press on Play and the cover hover buttons at 125% and 150% scaling; grid and list views; the empty state in both views; Settings and Add-ons with every node open; the game edit dialog's tab labels; Statistics cards; ThemeModifier recoloring and its 41px buttons; the window background setting.
- Whether the bracket frame reads cleanly where a scroll viewer clips its 6px bleed (list boxes, the Settings tree's edges).
- Motion timings against the source (no video reference was available).
