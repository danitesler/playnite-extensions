# Allegory

Dark Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by the menus of **Metaphor: ReFantazio** (Atlus, 2024). Unofficial: own name, own mark, no game assets, no logo, no game font (see `info/NOTICE-Allegory.txt`). Dark only. Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record the captures, measured palette, type and observed parts; the [Showcase brief](BRIEF.md) maps the source UI to Playnite. Built from scratch: the existing Arcfolio theme for the same game was not used as a reference.

## Sources

`RESEARCH.md`: ten Game UI Database captures (page id 1970: title, Player menu in red and orange, System, Settings, Item, Shop, Quest, Load, Dialogue, Pause), viewed in the browser pane and canvas-sampled; nothing downloaded. Lens (`BRIEF.md`): the in-game submenu grammar (hairline-ruled rows, the dry-brush band on the current item, Didone small caps, giant cropped section titles, slanted white plates).

## Tokens

All values are in `src/tokens.css`; `Constants.template.xaml` maps them.

| Token | Plays |
|-------|-------|
| `--text` / `--text-muted` / `--ink` | `TextColor` / `TextColorDarker` / `TextColorDark`, `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush` (ink on paper, crimson and yellow) |
| `--ground` / `--ground-deep` / `--teal-wash` / `--teal-lift` | page (`WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `TopPanelBackgroundBrush`) / `MainColorDark`, `ExpanderBackgroundBrush` / `GameBannerTintBrush` (the teal the game paints under its menus) / `HoverColor`, `ListItemHoverBrush` |
| `--panel` / `--ink` | `MainColor`, `PopupBackgroundColor`, `ButtonBackgroundBrush` / `ShellBackgroundBrush`, `HeaderBandBrush` (rail, title band) |
| `--paper` / `--paper-dim` / `--seg` | plates: `PrimaryButtonBackgroundBrush`, `TooltipBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `ButtonHoverBackgroundBrush`, chips / `PrimaryButtonPressedBackgroundBrush` / `ButtonPressedBackgroundBrush` (the grey segment) |
| `--crimson` / `--crimson-deep` / `--crimson-lit` | `GlyphColor`, `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `PrimaryButtonHoverBackgroundBrush`, `DataChangeNotifColor`, `ProgressBarForegroundBrush` / `DangerBrush` (paper on it 7.2:1) / `SelectedHoverBrush`, `NegativeRatingBrush`, Exit label on the board (5.9:1) |
| `--teal` | the Settings tree's brush band |
| `--yellow` | `RunningIndicatorBrush`, `WarningBrush`, `MixedRatingBrush` (the quest-in-progress brush; ink on it 9.6:1) |
| `--mint` / `--blue` | the flick under the selection band, `PositiveRatingBrush` / `LinkBrush` (description links) |
| `--rule-14` ... `--rule-80`, `--board-rule-30/40` | paper flattened onto the ground or the board: every hairline (`LocalRule*Brush`, `NormalBorderBrush`, `InputBorderBrush`, `PopupBorderColor`, `MenuSeparatorBrush`, `ScrollBarThumbBrush`...) |
| `--oxblood`, `--oxblood-mid`, `--magenta`, `--orange`, `--slate`, `--graphite`, `--ghost` | spare source colours (previews' painted grounds); `Local*` brushes only |

Radii: none (`ControlCornerRadius` 0 everywhere); plates are cut by a 10px slanted left end (`LocalSlantPlateTemplate`). Type: Gelasio Regular / Bold (body, `FontFamily`), Playfair Display SC Black (`HeadingFontFamily`, `LocalDisplayFontFamily`: titles, headings, Play, numerals; title case renders the game's enlarged initials) and Playfair Display SC Bold (`LocalCapsFontFamily`: captions, counts, shortcuts), all bundled in `src/Typography`. Sizes 12 / 14 / 16 / 22 / 34.

## ThemeModifier

Edit constants keep the shared catalog (backgrounds, buttons, selection, inputs). Hairline strengths, the painted washes and the brush masks stay in the theme as `Local*` brushes and `Local*Mask` image brushes.

## Component spacing (`src/Common.xaml`)

Buttons 22,5,18,5 (10px slant + 12px text inset; `ControlHeight` 32); inputs 16,5,10,5; menu board 0,6 (rows run edge to edge, 30px, a 33px icon column ending at the board's vertical hairline); dropdown rows 14,5,12,5; group box 2,10,2,6 under its heading; tooltip 12,7,18,8 plus the 12px torn edge; `IconSize` 16; `GameBannerHeight` 290.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px ink rail closed by a 1px hairline (the System menu's vertical rule); a small compass ring and a needle fading up at its foot; the main menu is `LocalAllegoryMenuMarkTemplate` (Common.xaml, also the top bar's menu button): the mark in parts, whose diagonal swings a quarter turn like a compass needle on hover (BackEase) while the nib rises, and which turns ink on a crimson vector dab that sweeps in from the left while the menu is open (outer ring breathing); rail items show a hairline ring on hover; the current item sits on a crimson dab (vector `LocalDabGeometry`) with an ink glyph |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml` | 50px teal band closed by the doubled hairline (faint over strong); ink search strip with a slanted end and underline, persistent quill magnifier; the filter mark is an 8px crimson dot (the game's "new" dot); toggled view switch = the white Settings segment plate with an ink glyph; notification count = crimson slanted tag with a Didone count |
| `DerivedStyles/MainWindowStyle.xaml` | bare 46x36 caption cells; close hover = a deep crimson prompt disc |
| `Views/LibraryDetailsView.xaml` | list on the ground, a 1px hairline to the game page |

## Game page

`art/gen-overviews.mjs` writes both overviews (then `scripts/game-page-breakpoints.mjs`). The banner's art is darkened toward the page by a plain gradient and ends in a dragged dry-brush edge drawn as a vector Path (`LocalBannerEdgeGeometry`) in the page colour: no OpacityMask over art behind the animated Play button. The game's name rises behind the header as the menus' giant cropped section title (Playfair Display SC Black 150px / 120px in the grid panel, paper at 16%, bleeding off the right edge, hosted in a zero-height Canvas so it never widens the page). Title in Playfair Display SC Black 34px beside the icon in a hairline frame; Play and the More / Edit ring prompts (`LocalGameActionRing`, 40x40) sit under it. Metadata is a borderless ledger on the ground: Playfair Display SC Bold captions, Gelasio values, doubled hairline group breaks (`DividerTemplate`), scores on ink slanted plates in the rating colour, chips as paper tag plates. Section headings: Didone small caps with a hairline running right. Empty page: `LocalEmptyPageTemplate` (two counter-turning compass rings around the mark) over `LOCErrorNoGameSelected`. Grid side panel close: the 28x28 button prompt (a disc with a hairline rim; the danger disc fades in on hover). Pane position: `GameDetailsPanePosition` Right / Left / Center / Stretch.

## Components

| Playnite file | Component |
|---------------|-----------|
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | the System-menu board: ink panel, doubled top hairline, strong foot hairline, a vertical hairline after the icon column; highlight = crimson dry-brush band sweeping in from the left with ink text; group break = hairline with a rank diamond on the vertical rule; shortcuts in small caps; submenu mark = the settings triangle; checked = paper diamond; Exit in lifted crimson, on a deep crimson band when highlighted (row in `docs/themes/menus.md`); closed ComboBox = the paper segment plate with a crimson underline on hover |
| `DerivedStyles/PlayButton.xaml` | the slanted paper prompt plate; hover = the Player menu's splash (crimson band sweeping behind it, mint flick, splatter, plate nudging right); launching / running = yellow plate with the turning compass |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | hairline-ruled rows; hover = teal wash and a strong hairline growing along the foot; selected = the Shop's crimson dry-brush band with a mint flick and bold ink text; running = yellow band-shaped wash, left-edge and foot frame, compass needle |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | covers: a hairline frame 4px outside on hover (cover rises 3px); selected = a crimson brush swash under the bottom-left corner, tilted, with a paper frame; Play / Info = 48px ring prompts (paper disc / ink disc) whose ring swells crimson on hover |
| `DefaultControls/Button.xaml`, `ToggleButton.xaml`, `RepeatButton.xaml`, `TextBox.xaml`, `PasswordBox.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `ScrollViewer.xaml`, `TabControl.xaml`, `GroupBox.xaml`, `ToolTip.xaml`, `Expander.xaml`, `ListBox.xaml` | ink strips with slanted ends and underlines (paper plate on hover; default button = paper plate with a crimson band behind on hover); underlined ink wells; hairline check boxes that fill with paper; compass-ring radios with a rank diamond; hairline slider with a paper diamond thumb; the party-gauge progress bar; 1px track scroll bars; tabs on a hairline with a crimson band on the selected tab; Didone group headings with a running hairline; the item description card (paper, torn right edge) as tooltip |
| Fields (`TextBox.xaml`, `PasswordBox.xaml`; the closed `ComboBox` keeps its paper slant plate) | `LocalSlashFieldTemplate`: one slanted paper slash in the 16px left inset (half lit at rest, full with a second slash on hover); keyboard focus turns both crimson and wipes a three-bristle crimson dry-brush streak along the bottom (0.24s). See `docs/themes/fields.md`. |
| `DefaultControls/TreeView.xaml`, `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Settings: bare 30px rows, teal brush band + ink triangle marker + bold ink label on the selected section; 44px ink title band with the mark, the title in Didone small caps, compass rings and a diagonal cropped behind the caption buttons, doubled hairline foot, and the window title as a giant cropped watermark behind the content; caption buttons are ring prompts |
| `DerivedStyles/PropertyItemButton.xaml` | links in paper (lifted crimson on hover); chips as paper tag plates with a slanted end that turn crimson on hover |

## Previews

Signature motifs drawn: the crimson dry-brush band on the selected row, the paper Play plate landing on a crimson splash with a mint flick, the giant cropped title behind the game page, Didone small caps headings with running hairlines and an `x12` counter, the white segment plate on the toggled view switch, the teal brush band and triangle marker in the Settings tree, the System menu's teal / oxblood split painted ground with compass rings behind the Settings window. Stand-ins: none; Gelasio and Playfair Display SC are the real bundled faces. The preview's game list, banner and screenshots are invented placeholders (gradients), not game art.

## Deviations

- The game's own fonts are commercial; Playfair Display SC stands in for the wide Didone menu type and Gelasio for the list serif.
- WPF cannot set per-letter sizes on bound text, so the enlarged initials come from a small-caps font (title case strings); all-caps source strings would lose them.
- The banner's brush edge is a vector Path, not the `brush-edge.png` mask the preview uses: an OpacityMask over art behind an animated control leaves repaint boxes at 125% / 150% scaling.
- Score plates have no ghost leading zero (the Shop's `0,000,050`): `TextBlockGameScore` gives one string and 100 would need three digits.
- The game's menus vary the brush colour per menu; the theme keeps crimson for selection everywhere except the Settings tree (teal) and running (yellow), so selection reads the same across the library.
- Playnite's user font setting overrides the body face (seen live: the library rows draw in the user's font).

## Not verified yet

- Seen live in Playnite 10.65 (2026-11-24): details view (rail with the crimson dab, top bar, group header, selected row band, banner with brush edge and cropped title, Play plate, ring prompts, ledger metadata). Not seen live: menus in the real app (only `tests/wpf/MenuRender.ps1`), the Settings window, real hover / press motion, the grid view and its side panel, list view, the empty page, Left / Center / Stretch metadata, window art mode, a launched game's running indicator.
