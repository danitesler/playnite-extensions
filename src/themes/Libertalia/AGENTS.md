# Libertalia — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Uncharted 4: A Thief's End menus** (main menu, pause menu, options, save game; dark only). The library floats on the darkened game art the way the main menu list floats on its scene: muted khaki text at rest, warm ivory for the selected item on a feathered smudge of light that fades out to the right (and moves the row a few pixels in), title case serif type, hairline rules under headers, near-black panels in a thin frame, save-slot outlines for buttons. No accent hue: selection is brightness.

**Unofficial fan theme.** Not affiliated with or endorsed by Naughty Dog or Sony Interactive Entertainment. No logos, icons, fonts, images or game files are included (see `info/NOTICE-Libertalia.txt`). The compass mark is hand-drawn.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Colors and sizes | Pixels sampled from the 1920x1080 captures of the **Legacy of Thieves PC version** (build 1.3.20900) on interfaceingame.com/games/uncharted-4/ (main menu, collection launcher, pause, display, audio, controls, accessibility, difficulty, save game), read 2026-10-01. No PS4 2016 captures were found. The game publishes no style sheet, so `src/tokens.css` names each value after where it was read; states the captures do not show are marked "derived". |
| Layout | Same captures: the main menu is a plain left-aligned list in the left third with no logo, five entries; options screens are one framed panel per category with section headers over hairlines and value rows; the pause menu darkens and blurs the scene. |
| Icons | **Material Symbols Sharp**, outlined, weight 300 (Apache-2.0, `info/LICENSE-material-symbols.txt`): the menus carry almost no icons, so the lightest open set. `art/icons.py` prints the `Media.xaml` geometries (works on any OS; `icons.json` is the same job for `render-icons.ps1`). |
| Compass mark | Original: `IconMainMenu` in `src/Media.xaml` and `art/mark.svg` (add-on tile). |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

The game's UI typeface is undocumented (a humanist face with slight flares) and not bundled. **Constantia** (ships with Windows 7+) stands in everywhere, body and headings, through `FontFamily` and `HeadingFontFamily`. Playnite's own menu icons keep their icofont glyphs, recolored by the palette.

## Tokens

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `text-description` | `#bfb59c` | `TextColor` / `TextBrush`, `PropertyItemForegroundBrush`, `TooltipForegroundBrush` | body text, values, installed games |
| `text-rest` | `#7b725e` | `TextColorDarker` / `TextBrushDarker`, `NormalBorderBrush`, `ButtonBorderBrush`, `CheckBoxBorderBrush`, scroll and slider thumbs, `GridViewItemHoverBorderBrush`, `TopPanelSeparatorBrush` | rows at rest, captions, save-slot frames |
| `text-selected` | `#f0e6c6` | `GlyphColor`, `SelectedForegroundBrush`, `FocusBrush`, `ButtonForegroundBrush`, `HeadingForegroundBrush`, `PrimaryButtonBorderBrush`, `GridViewItemSelectedBorderBrush`, `ProgressBarForegroundBrush` | selected item, titles, section headers, checks, focus |
| `text-main-selected` | `#eee8d5` | `PrimaryButtonForegroundBrush` | Play label |
| `text-on-ivory` | `#0b0a08` | `TextColorDark` | text on an ivory fill |
| `smudge` / `smudge-hover` / `smudge-pressed` | `#2f2b22` / `#1d1a15` / `#3a352a` | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `TabItemIndicatorBrush`, `PrimaryButtonBackgroundBrush` / `HoverBrush`, `ListItemHoverBrush`, `ButtonHoverBackgroundBrush` / `SelectedHoverBrush`, `PrimaryButtonHoverBackgroundBrush` | the selection smudge, drawn through a radial opacity mask |
| `page` | `#000000` | `WindowBackgourndBrush`, `ScrimBrush` | window, darkening of the art |
| `panel` / `panel-translucent` | `#060505` / 82% | `MainColorDark`, `TooltipBackgroundBrush`, `ExpanderBackgroundBrush` / `GameOverviewBackgroundBrush`, `InputBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush` | options panel, game page and side panels, fields |
| `popup` | `#0c0b0a` | `MainColor`, `PopupBackgroundColor` | menus, dropdowns |
| `panel-frame` | `#231f1c` | `FrameBrush` (3px, `FrameThickness`), `PanelSeparatorColor`, `MenuSeparatorBrush` | metadata panel frame, side panel edge |
| `hairline` | `#514f4a` | `WindowPanelSeparatorColor`, `PopupBorderColor`, `InputBorderBrush`, `TooltipBorderBrush` | rules under headers, popup and field edges |
| `slider-track` / `scroll-track` | `#56514e` / `#2a2724` | `SliderTrackBrush`, `ProgressBarTrackBrush` / `ScrollBarTrackBrush` | 2px track, 1px scroll lane |
| `vram-red`, `danger`, `warning`, `positive` | `#c4161c`, `#b3412e`, `#c9a14a`, `#8a9a5b` | `WarningBrush`, `DangerBrush` + `NegativeRatingBrush`, `MixedRatingBrush` + `DataChangeNotifColor`, `PositiveRatingBrush` | the only saturated color in the menus is the VRAM bar; the rest are derived |
| `radius` | 0 | `ControlCornerRadius`, `CornerRadiusSmall`/`Large` | everything is square |

Shell fills (`ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `ContentBackgroundBrush`, `TabControlHeaderBackgroundBrush`) are transparent: the menus have no bars.

Type: 12 / 14 / 16 / 19 / 30, title case, normal weight everywhere (the game's 1080p rows are 26 to 28px, titles 30). `HtmlTextView` reads the Colors of the brushes on its `TextElement.Foreground` and `Tag`, so ThemeModifier brush edits reach the description.

## Component spacing (`src/Common.xaml`)

| Key | Value | From |
|-----|-------|------|
| `ButtonPadding` | 16,6,16,7 | save slot text inset, scaled |
| `InputPadding` | 8,6 | value field, 32px tall |
| `MenuPadding` / `MenuItemPadding` | 0,8 / 14,8 | pause menu rows (10px around 26px type, ~0.55 scale); highlighted rows move 6px in |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,8 / 16,8 | as the menu |
| `ListBoxItemPadding` | 10,6 | options rows |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 8,0,0,12 / 0,0,0,10 | rows under a section header |
| `TooltipPadding` | 10,7,10,8 | the description line, boxed |
| `IconSize` | 20 | prompt glyphs |
| `GameBannerHeight` / `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 320 / 300 / 280 | shared game page keys |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 56px column on the window black, the compass (main menu) in a 64px cell on top; khaki glyphs, the current one ivory on a round smudge. Top/bottom docking: a 64px strip where views are title case entries. |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 64px, no fill. Search at the left; the view switches as title case 19px entries in the middle between the prompt bar's 1px "\|" rules (`Canvas` separators), current one ivory on the smudge; filter and notifications at the right, 150px kept clear for the caption buttons. |
| `Views/Library.xaml` | Background art over both rows, darkened like the pause menu: black 55% over all, 80% at the left edge fading out by 55% of the width (where the list sits), shades along top and bottom. The library has no fill. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons with thin glyphs, rust close hover, 64px caption height. |

## Game page

Follows the shared skeleton. Differences:

- Header: the name as a screen title (Constantia 30, normal weight, ivory, keeps Playnite's case); Play is the main menu's selected entry in the selected save slot's ivory frame; More and Edit are square khaki-framed buttons.
- Section titles (Description, Notes, Steam screenshots) are options section headers: ivory, 19px, title case, 1px hairline under them.
- Metadata pane on the options panel: near-black in the 3px panel frame, groups split by hairlines; khaki captions, values in the description color, chips as small save slots.
- Banner scrim: black, clear at the top, 70% toward the title.

## Components

| Playnite file | Menu element |
|---------------|--------------|
| `DefaultControls/Button.xaml`, `ToggleButton.xaml` | save slot: 1px khaki frame, no fill; ivory frame and text over the half smudge on hover; checked/default = selected slot |
| `DerivedStyles/PlayButton.xaml` | the selected main menu entry in an ivory frame, smudge inside |
| `DefaultControls/RepeatButton.xaml` | option value arrows: khaki, ivory on hover |
| `DefaultControls/Menu.xaml`, `ContextMenu.xaml`, `ComboBox.xaml`, `ListBox.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml` | the menu list: highlighted/selected row ivory on the feathered smudge (radial mask, strongest near the text, gone by the right edge), moved 6 to 8px in |
| `DefaultControls/TabControl.xaml` | category titles in a row over a hairline; current one ivory on the smudge |
| `DefaultControls/GroupBox.xaml` | options section header with hairline |
| `DefaultControls/Slider.xaml`, `ProgressBar.xaml` | 2px track, small upright thumb; ivory fill for progress |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | 1px lane with a 4px khaki thumb |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `CustomControls/SearchBox.xaml`, `DerivedStyles/HighlightBorder.xaml` | near-black field, hairline edge, ivory on focus |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | 16px square / ring in khaki, ivory when on |
| `DefaultControls/ToolTip.xaml` | the description line, boxed on the panel |
| `DerivedStyles/GridViewItemStyle.xaml` | covers as save slots: 1px khaki edge on hover, 2px ivory when selected |
| `DerivedStyles/PropertyItemButton.xaml` | values in the description color, ivory on hover; chips as small save slots |

## Deviations

- **Font**: Constantia stands in for the game's unnamed humanist face; Playnite also applies the user's font setting over `FontFamily`.
- **Smudge**: the game's soft light is drawn as a fill through a radial `OpacityMask`, not a blur. Its indent is 6 to 8px instead of the game's 45px at 1080p, so lists don't jump.
- **No tab strip in the game**: Playnite's tabs become a row of category titles.
- **Panel frame**: the game's frame is about 6px at 1080p; 3px here on the metadata pane, a 1px hairline on popups (WPF popups keep a thin edge).
- **Scroll bar** has no end arrows.
- **List view column headers** keep Playnite's Default header style.

## Not verified yet

Built and checked statically only (cloud session; Playnite is never started on a server). Not yet seen running: every view, Constantia rendering at 12px, the smudge masks on wide rows, settings tabs, the game edit dialog, top panel dropdowns, filter panel, notifications, progress dialog, the sidebar at top/bottom/right, ThemeModifier edits.

## Preview and screenshots

`art/preview-grid.html` is an approximate HTML replica of the grid view (this theme's token values and sizes; Bitstream Charter stands in for Constantia, a CSS gradient for the game art), rendered to `art/preview-grid.png` with `node scripts/render-theme-preview.mjs src/themes/Libertalia/art/preview-grid.html`. It is a mockup, not a Playnite capture. Real screenshots (`info/screenshots/`) come from `.\scripts\take-screenshots.ps1 -Extension libertalia` on a local Windows machine and are still to add before the release and the database PR.
