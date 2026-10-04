# Mann Co — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the interface of **Team Fortress 2**: dark brown pages, tan paper plates for whatever you press or select, rust on hover, a thin RED and BLU rule under the top bar. Square-ish corners (2px), flat fills, bold Trebuchet headings, no gradients except the banner fade.

**Unofficial fan theme.** No Valve assets: the mark, every icon and the screenshots' mock game are original. The game's fonts (TF2 Build, TF2 Secondary) are proprietary and not shipped; the theme uses Verdana and Trebuchet MS, which Valve's own scheme lists as fallbacks. Team Fortress, TF2, RED, BLU and Mann Co. are trademarks of Valve Corporation (`info/NOTICE-MannCo.txt`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Palette, borders, fonts | Default TF2 HUD `resource/clientscheme.res` (Colors, Borders, Fonts, CustomFontFiles), read from the mirror https://raw.githubusercontent.com/Hypnootize/TF2-Default-HUD/master/resource/clientscheme.res; TanLight, TanDark and TanDarker cross-checked against https://raw.githubusercontent.com/Jofre-Problem/OGHUD/f3c1bd1d20ab9c544afe31289acfef907d9b61d5/resource/clientscheme.res |
| Main menu layout | Default `resource/ui/mainmenuoverride.res` (left column of 250 x 26 buttons, 5px gap, tan plate with dark text, hover swaps the plate) |
| Quality colors | https://wiki.teamfortress.com/wiki/Item_quality (only Unique gold, for mixed scores) |
| Background browns | CriticalFlaw TF2HUD.Editor `docs/resources/teamfortress.css` (community-measured `#221E1B`, `#2B2724`, `#3C352D`) |
| RED and BLU | Team Spirit paint values `#B8383B` and `#5885A2` (mannterface `resource/paint_colors.res`). These are the colors everyone calls RED and BLU, not the HUD scheme's own team colors (`#B45C4D`, `#687C9B`), which read muddy next to the browns. |
| Icons | Original, hand drawn on a 24 grid in `src/Media.xaml` |
| Add-on tile | `art/mark.svg`, original: a supply crate seen from the front |

Not found in any source: exact pixel colors and corner radii of the main menu bitmaps (the .res files only name the bitmaps), the tan-versus-dark fill of the tooltip, and the look of the tabs in the options dialog. Those are design calls here, marked below.

## Tokens (`src/tokens.css`)

Tokens keep the scheme's names (`tan-light` = TanLight, `tan-dark` = TanDark, `tan-darker` = TanDarker, `rust` = TFOrange, `red-solid` = RedSolid, `gray` = Gray).

| Token | Key | Used for |
|-------|-----|----------|
| `brown-darkest` | `WindowBackgourndBrush`, `GameOverviewBackgroundBrush` | Page |
| `brown-dark` | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `PopupBackgroundBrush`, `NormalBrushDark` | Rail, top bar, menus, header strips |
| `brown-mid` | `NormalBrush`, `PropertyItemBackgroundBrush`, `PanelSeparatorBrush` | Control fill, chips |
| `brown-lighter` | `ExpanderBackgroundBrush`, `BackgroundToneColor` | Cards and the metadata pane |
| `tan-light` | `TextBrush`, `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `ButtonPressedBackgroundBrush`, `TooltipBackgroundBrush`, `FocusBrush` | Text, paper plates (current item, selected row, lit menu row, pressed button, tooltip) |
| `tan-darker` | `TextBrushDark`, `SelectedForegroundBrush`, `TooltipForegroundBrush`, `ButtonBorderBrush` | Ink on paper, button edge |
| `tan-dark` | `ButtonBackgroundBrush`, `NormalBorderBrush`, `InputBorderBrush`, `PopupBorderBrush`, `ScrollBarThumbBrush`, `ThumbBrush` | Resting button plate, edges, thumbs |
| `gray` | `TextBrushDarker` | Muted text |
| `rust` | `HoverBrush`, `ButtonHoverBackgroundBrush`, `ListItemHoverBrush`, `ProgressBarForegroundBrush`, `PropertyItemHoverBackgroundBrush` | Hover and fills |
| `orange` | `GlyphBrush`, `HighlightGlyphBrush`, `GridViewItemHoverBorderBrush`, `CheckBoxHoverBorderBrush` | Accent: links, hovered tile outline, hovered check |
| `team-red` | `PrimaryButtonBackgroundBrush`, `TabItemIndicatorBrush`, `TopPanelRuleStartBrush` | Play, current tab tick, left half of the top rule |
| `team-blu` | `TopPanelRuleEndBrush` | Right half of the top rule |
| `rust-bright` | `PrimaryButtonHoverBackgroundBrush`, `SliderHoverForegroundBrush` | Play hover |
| `red-solid` | `DangerBrush` | Close hover, notification badge, plugin items without an icon |
| `red-bright`, `success`, `quality-unique` | `NegativeRatingBrush`, `PositiveRatingBrush`, `MixedRatingBrush` | Score colors |
| `amber` | `WarningBrush`, `DataChangeNotifBrush` | Warnings, unsaved marker |
| `transparent-black`, `black-wash` | `CheckBoxCheckMarkBkBrush`, `InputBackgroundBrush`, `ScrollBarTrackBrush` | S1 CheckButton background; `black-wash` (black at 45%) is derived for entry boxes |
| `slider-track`, `slider-knob` | `SliderTrackBrush`, `SliderThumbBackgroundBrush` | S1 Slider colors |

Palette decisions that differ from the Default meaning of a key (unrestyled Playnite views read them too): `ButtonBackgroundBrush` is TanDark, not a dark fill, so a stray default button still shows tan text on a mid plate; `TextBrushDarker` is the neutral Gray; `GlyphBrush` is the orange, and `TextBrushDark` is ink, which reads on orange as well as on tan.

Radii: `ControlCornerRadius` 2, `CornerRadiusSmall` 1, Large 4, XLarge 6; `CornerRadiusFull` is 9999 and used on no control. Fonts: Verdana body (13px), Trebuchet MS bold for headings, buttons, tabs and captions (`HeadingFontFamily`).

## Component spacing (`src/Common.xaml`)

| Key | Value | Source |
|-----|-------|--------|
| `ButtonPadding` | 14,6 | Main menu button is 26 tall with 14px bold text; 14,6 around 13px text gives 31 |
| `InputPadding` | 8,5 | Entry box about 30 tall |
| `MenuPadding` / `MenuItemPadding` | 3 / 10,6 | Popup edge to row, row of one text line + 12 |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 3 / 10,6 | Same as menus |
| `ListBoxItemPadding` | 10,6 | Same rhythm |
| `GroupBoxPadding` | 12 | Cards |
| `TooltipPadding` | 10,6 | |
| `IconSize` | 18 | |
| `GameBannerHeight` | 340 | Spacer 180 of 340 on the details view, 80 of 340 on the grid panel |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px compact rail on the left, `ShellBackgroundBrush`, 1px edge. Main menu button: a 32px tan plate with an ink hamburger (`MainMenuButton`). Items 44 x 40 with a 32px square plate and a 16px glyph: empty at rest, rust on hover, tan paper with an ink glyph when current. |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml` | 52px bar on `TopPanelBackgroundBrush` ending in a 3px rule, left half RED and right half BLU (hidden with the "panel separators" setting). 36 x 32 plates: `NormalBrush` at rest, rust on hover, tan with an ink glyph when on. Search box is a black-washed 28px strip. View switches are icons only. 128px kept free on the right for the window buttons. |
| `DerivedStyles/MainWindowStyle.xaml` | 1px `PopupBorderBrush` frame, 28px caption, three 40 x 28 square buttons (`MainWindowButton`); close lights `DangerBrush`, the others rust. |
| `DerivedStyles/WindowBarButton.xaml` | Dialog caption buttons: Marlett glyphs on a square plate that turns rust. |

## Game page

Follows the skeleton in `../AGENTS.md`. Details view: 340 banner (`HeroArt`) fading into the page, spacer `x * 180 / 340`, header with a 28px bold title, a RED Play button and the cover on the right with a 2px ink frame, then the Steam screenshots / description / notes column and a 340px metadata pane. Grid panel: spacer `x * 80 / 340`, 20px side padding, captions above values, close button over the top right. The pane is a `ExpanderBackgroundBrush` card with a 1px edge, 16px side padding, groups separated by a 1px `WindowPanelSeparatorBrush` rule (the first rule is clipped by a `-1` top margin), captions in bold 11px `HeadingFontFamily` at 120px (details) and tags as 2px-radius chips. A caption is a `TextBlock` with `Tag="Caption"`; a trigger in the pane's resources styles it, so no extra keys are defined.

## Components

| Playnite file | Mann Co |
|---------------|---------|
| `DefaultControls/Button`, `ToggleButton`, `RepeatButton`, `DerivedStyles/PlayButton` | Main menu button: tan-dark plate, ink edge, bold Trebuchet; rust hover; tan flash with ink text while pressed. On = tan paper. Play is RED. |
| `DefaultControls/TextBox`, `PasswordBox`, `ComboBox`, `CustomControls/SearchBox` | TF2 text entry: black-washed box, tan-dark edge that turns tan on hover and keyboard focus (`IsKeyboardFocusWithin`). Combo arrow is a solid triangle; popup dark with a tan-dark edge. |
| `DefaultControls/CheckBox`, `RadioButton` | S1 CheckButton: 18px TransparentBlack box, Yellow edge and check; orange edge on hover. |
| `DefaultControls/Slider`, `CustomControls/SliderEx`, `ProgressBar` | S1 Slider: 6px near-black track, 4px rust fill, grey 10 x 16 knob that gets a tan edge. Progress: black wash with a rust fill. |
| `DefaultControls/ScrollViewer`, `Thumb` | 12px black-wash rail, flat 8px tan-dark thumb, tan when hot. |
| `DefaultControls/Menu`, `ContextMenu`, `CustomControls/GameMenu`, `GameGroupMenu`, `TrayContextMenu` | Dark popup, lit row is tan paper with ink text (the inverse of the main menu), 1px tan-dark separators. |
| `DefaultControls/ToolTip` | A paper note: tan fill, ink text, 1px ink edge. |
| `DefaultControls/TabControl`, `GroupBox`, `ListBox` | Paper tabs (current = tan with ink text and a 3px RED base, hover = rust); cards on `ExpanderBackgroundBrush`; list rows rust on hover and tan when selected. |
| `DerivedStyles/DetailsViewItemStyle`, `GridViewItemStyle`, `PropertyItemButton`, `HighlightBorder` | Library rows like the server browser (rust hover, tan selected row with ink text); cover tiles get a 3px orange outline on hover and tan when selected; tags are small square chips. |

## Deviations

- **No Steam Screenshots skeleton.** The host (`SteamScreenshots_SteamScreenshotsViewControl`, shown through `{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible}`) is in place, but the 12 second pulsing placeholder for Steam games is not drawn yet, so the left column jumps when the plugin control appears.
- **Sidebar icons keep Playnite's glyphs.** `SidebarLibraryIcon` and `SidebarStatisticsIcon` are font glyphs Playnite copies; `IconLibrary` and `IconStatistics` are defined for the vocabulary and used by the preview mockups, not by the live sidebar.
- **Menu icons** (`AddGameIcon`, `PlayIcon`, ...) stay Playnite's glyph font, recolored by `TextBrush`.
- **Fonts**: Verdana and Trebuchet MS stand in for TF2 Build and TF2 Secondary; the originals have no Windows equivalent and are not redistributable. Uppercase headings are not possible on a plain `TextBlock`, so labels keep their localized case.
- **No bitmap chrome**: TF2 draws its plates from textured bitmaps with torn paper edges. Plates here are flat fills with a 1px edge, as the repo rules forbid bitmap textures and shadow effects on tiles.

## Not verified yet

This theme was written in a container without PowerShell or Playnite, so nothing below has run:

- `build-theme.ps1`, `validate-extension.ps1` (a Python approximation of their checks passed: well-formed XML, Playnite file paths, key vocabulary, no `Color` reads outside `Constants`, no cross-file `StaticResource`).
- Loading in Playnite 10.60: every restyled file, the game page with a game that has many fields and one with few, banner height 0 and 600 in ThemeModifier, the collapsing metadata groups, the sidebar at each position.
- Contrast of tan text on the TanDark button plate (about 4:1) and on the rust hover plate.
- That `HighlightGlyphColor` at 55% reads on tan and rust.
