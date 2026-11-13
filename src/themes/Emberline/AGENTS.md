# Emberline — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the menus of **Gears 5** as seen in public captures. Unofficial: not affiliated with, endorsed by or sponsored by The Coalition or Microsoft (`info/NOTICE-Emberline.txt`). It ships no game files, no logo and no game fonts; the mark is the theme's own broken cog-tooth ring.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Captures, sampled values and observed rules: [`RESEARCH.md`](RESEARCH.md). Creative brief (source DNA, game element map, signature moments, motion language, branding, review scores): [`BRIEF.md`](BRIEF.md). The requested reference (gameuidatabase.com, id 294) could not be read (bot check); other captures and the user's screenshots were used. Motion was not measured: no video was available.

Wiring (part names, triggers, the responsive body, the overview generator's structure) was started from this repo's Bloodpetal theme; every motif, sprite, icon, token and control look was redrawn for this source.

## Tokens

`em-*` in `src/tokens.css`. Radius is 0 everywhere; the only round shapes are the radio button and the search glyph.

| Token | Key | Used for |
|-------|-----|----------|
| `em-white` | `TextBrush`, `HeadingForegroundBrush`, `FocusBrush`, `SelectedForegroundBrush`, `TooltipBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `TabItemIndicatorBrush`, `SliderThumbBackgroundBrush`, `HeadingMarkerBrush` | Text, selected labels, key caps, the slanted tab |
| `em-label` | `TextBrushDarker`, `ButtonForegroundBrush`, `TabItemForegroundBrush`, `PropertyItemForegroundBrush`, `SliderTrackBrush` | Idle labels, captions |
| `em-steel` | `SidebarItemForegroundBrush`, `FrameHoverBrush`, `ScrollBarThumbHoverBrush` | Idle glyphs, lit hairlines |
| `em-ink` | `TextBrushDark`, `TooltipForegroundBrush`, `MainMenuButtonForegroundBrush` | Text and glyphs on white caps |
| `em-void` | `ShellBackgroundBrush`, `WindowTitleBackgroundBrush`, `BevelShadowBrush`, `ScrimBrush`, `TextShadowBrush` | Outside panels, the title band |
| `em-panel` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | Page and window bodies |
| `em-pit` | `NormalBrush`, `ButtonBackgroundBrush`, `InputBackgroundBrush`, `PopupBackgroundBrush`, `ExpanderBackgroundBrush`, `TopPanelBackgroundBrush`, `PrimaryButtonBackgroundBrush` | Plates: rows, buttons, inputs, cards, the bars |
| `em-plate` / `em-plate-lit` | `ButtonHoverBackgroundBrush`, `ListItemHoverBrush` / `HoverBrush`, `ButtonPressedBackgroundBrush`, `MenuItemHoverBrush` | Hover and pressed plates |
| `em-edge` / `em-edge-lit` / `em-edge-card` | `WindowPanelSeparatorBrush`, `ProgressBarTrackBrush` / `NormalBorderBrush`, `InputBorderBrush`, `ButtonBorderBrush` / `FrameBrush`, `PopupBorderBrush`, `CheckBoxBorderBrush`, `ScrollBarThumbBrush` | Hairlines |
| `em-ember` | `GlyphBrush`, `SelectedBorderBrush`, `PrimaryButtonBorderBrush`, `PrimaryButtonGlowBrush`, `GridViewItemHoverBorderBrush`, `GridViewItemSelectedBorderBrush`, `ProgressBarForegroundBrush`, `SidebarItemSelectedGlowBrush` | The burning frame, streaks, focus edges, links, progress |
| `em-ember-dim` | `SelectedSheenBrush` | The wash inside a selected plate |
| `em-cinder` | `SelectedBrush`, `ListItemSelectedBrush`, `PrimaryButtonHoverBackgroundBrush` | The plate inside the frame |
| `em-lancer` | `HighlightGlyphBrush`, `DangerBrush`, `SidebarItemSelectedForegroundBrush`, `HeadingMarkerAltBrush`, `NegativeRatingBrush` | Menu red: current rail glyph, close hover, menu bar |
| `em-blood` | `GameBannerTintBrush`, `ArtTintBrush`, `PrimaryButtonPressedBackgroundBrush` | Banner darkening, Play pressed |
| `em-rule` / `em-flare` | `TopPanelRuleStartBrush` / `TopPanelRuleEndBrush` | The flare rule's hairline / flare |
| `em-alert` | `DataChangeNotifBrush`, `WarningBrush` | Filter mark, notification count, warnings |
| `em-frost` | `TitleSuffixBrush` | The empty page's mark and glow |
| `em-gold` / `em-support` | `MixedRatingBrush` / `PositiveRatingBrush` | Group box rule, ratings |

**Banner darkening color**: `GameBannerTintBrush` = `em-blood` `#210302`, the dried-blood red of the source's class headers. The theme is near black, but a darkened banner should keep the menus' red cast, not go plain black.

Fonts: `HeadingFontFamily` Russo One (bundled, `src/Typography/`, OFL, unmodified: its license reserves the name, so it is not subset). `FontFamily` Bahnschrift, then Segoe UI.

## ThemeModifier

Edit constants come from the shared catalog (`scripts/data/theme-keys.json`); the build writes `thememodifier.yaml`. Every sprite is a white mask filled with a theme brush, so recoloring `GlyphBrush`-family brushes moves the frame, streaks and bloom together.

## Component spacing (`src/Common.xaml`)

| Key | Value | Why |
|-----|-------|-----|
| `ControlHeight` | 32 | Repo rule |
| `ButtonPadding` | 16,5 | Short caps labels on a plate |
| `InputPadding` | 10,5 | The source's rows hold text 20px inside a 44px row at 1080p |
| `MenuPadding`, `ComboBoxDropDownPadding` | 4 | Room for a selected item's frame |
| `MenuItemPadding` / `ListBoxItemPadding` / `ComboBoxItemPadding` | 12,7 / 10,7 / 10,7 | 32px rows |
| `GroupBoxPadding` | 14,12,14,14 | Body under the 34px header |
| `TooltipPadding` | 8,4 | A key cap is tight |
| `GameBannerHeight` | 360 | Title sits in the faded lower third |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | 44px near-black rail with faint scratches and a hairline edge. Main menu: the 32px white slanted tab holding the mark in ink; hover turns the mark red over an ember bloom |
| `CustomControls/SidebarItem.xaml` | 44x40, 16px glyph, no plate. Hover: a dim red glow from the outer edge. Current: red glyph over the red streak, which slides in |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px bar closed by the flare rule with a low trapezoid under the flare. 34px cells: a lifted plate on hover, a white key cap when toggled. Filter active: 8px orange square. Notification count in a 16px orange cap |
| `CustomControls/SearchBox.xaml` | Black plate; focus lights the edge ember and fades the flare rule in under it |
| `DerivedStyles/MainWindowStyle.xaml` | Window frame, `MainMenuButton` (the slanted tab), 40x32 caption buttons, 132px kept clear on the top bar |
| `Views/Library.xaml` | Flat page. Game art only while Playnite's window background setting is on, at full strength with a soft bottom edge; the top bar, side panels and game pages go see-through and the banner collapses |

## Game page

Generated by `art/gen-overviews.mjs` (edit the generator, then `node src/themes/Emberline/art/gen-overviews.mjs src/themes/Emberline/src`). Differences from the skeleton:

- Banner: shown clean (no wash), darkened at its head, plain gradient into the page. No mask on it (Play animates in front).
- Spacer `x * 200 / 360` in details (floor 20), `x * 140 / 360` in the grid panel (floor 14).
- Title: `PART_TextDisplayName` keeps its place but is drawn transparent; an uppercase copy (Playnite's `StringToUpperCaseConverter`) in the display face sits over a hard black copy, with the white slanted tab before it.
- Play is 190x48; More and Edit are 44x44 plates.
- Section headings: slanted tab, uppercase heading, hairline.
- Metadata pane: black card in one hairline, padding 20,18,20,20 (grid 18,16,18,18).
- Empty state: the mark in frost blue over a crystalline glow that breathes (Opacity loop in a Style trigger), a flare rule under the text.

## Components

| Playnite file | Drawn as |
|---------------|----------|
| `Common.xaml` | Motifs: `BevelTemplate` (options row), `FramedPlateTemplate` (card hairline), `EmberFrameTemplate` (the burning frame), `SelectionBarTemplate` (plate inside the frame), `GlowLineTemplate` (flare rule), `GlowFrameTemplate` (bloom), `DividerTemplate` (slanted tab + rule), `CornerMarksTemplate` (focus ticks). `RivetsTemplate` is kept empty |
| `Button`, `RepeatButton`, `ToggleButton` | Black plate, hairline, uppercase label. Default / checked = the plate in the frame |
| `TextBox`, `PasswordBox`, `ComboBox` | Options rows; ember edge on focus; the combo has a bare chevron (36px reserved) |
| `CheckBox` / `RadioButton` | 18px plate that takes a white cap with an ink check / a ring that turns white around a white core |
| `Slider` / `ProgressBar` | 1px rule with end ticks and a tick thumb / ember fill with a white leading marker |
| `ScrollViewer` | 12px lane, 4px square grey bar |
| `ToolTip` | A key cap: white plate, ink text |
| `ContextMenu`, `Menu`, `ListBox` | Black panels in a card hairline; menu items take a red bar, list rows the frame |
| `TabControl` | Bare uppercase labels; the current one over a white underline that sweeps in |
| `GroupBox` | Card with the slanted tab, uppercase title and a thin gold rule (content-sized) |
| `TreeView` | 28px plates 3px apart; hover lifts the plate; selected = frame, white label, red slanted tab. 250 / 280 wide in Settings / Add-ons with the scroll lane reserved |
| `StandardWindowStyle`, `WindowBarButton` | 44px black band: slanted tab, uppercase title, mark ghosted at 7%, flare rule that breathes; 46x44 caption buttons |
| `PlayButton` | The hero; see `BRIEF.md` -> Signature moments and the file header |
| `GridViewItemStyle` | Selected: static frame. Hover: white hairline, flickering frame, low ember light |
| `GridViewItemTemplate` | `GridTileButton`: 48px black plate that becomes a key cap on hover |
| `DetailsViewItemStyle` | Rows take the red streak (bar + light), not the frame |
| `PropertyItemButton` | Text links; chips are small black plates |

## Effects

`art/sprites.py` (Pillow + numpy, seed 505) writes white masks to `src/Images/fx/` and a review sheet to `art/fx-sheet.png`: `ember-top/bottom/left/right` (256x14 strips that tile along their length), `glow`, `flare`, `grime` (256 tile), `frost`. All are filled with theme brushes.

## Previews

Written by `art/previews.py` (edit the generator): tokens as `var(--em-*)`, the theme's sprites through CSS masks, icons from the `Media.xaml` geometries. Motifs drawn: the burning frame (Play, tree selection, Save), the red streak (list row, rail), the flare rule with the tray trapezoid, the white slanted tab, key caps (toggled items, tooltip, check box, Play prompt). Stand-in fonts: Barlow for Bahnschrift, Russo One as itself. The banner and covers are CSS paintings, not game art.

## Deviations

- The source's frame is a painted, animated texture; here it is four tiled masks, with a flicker on opacity only.
- Bahnschrift is a variable font and WPF draws its Regular instance only.
- Uppercase reaches only text that passes through a template the theme owns (titles, buttons, tabs, headings). Tree rows, metadata and Playnite's own dialogs stay mixed case.
- The source's check boxes do not exist (it uses ON / OFF values); the check box borrows the key cap.
- Rarity tier colors are not used (see `BRIEF.md`).
- The bottom tray is decor on the top bar, not a container around the toolbar (repo rule against wrapping `PART_PanelMainItems`).

## Not verified yet

- **Nothing has been looked at in a running Playnite.** The theme was built and validated on Linux. Still to check: hover and press on Play, covers and cover buttons at 125% and 150% scaling; the empty state in both views; Settings and Add-ons with every node open; the game edit dialog's tab labels; Statistics cards; ThemeModifier recoloring and its 41px buttons; the window background setting.
- The WPF regression tests (`tests/*RegressionTests.ps1`, `pwsh -STA`) need Windows and were not run.
- The title band's breathing flare starts from an `EventTrigger` on `FrameworkElement.Loaded` in the window template; no other theme here does that, so confirm dialogs open cleanly.
- Whether the burning frame reads well where a scroll viewer clips its outer halo (list boxes, the Settings tree's edges).
- Motion timings against the source (no video reference was available).
