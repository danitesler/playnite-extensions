# WoW Vanilla — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **World of Warcraft Vanilla (1.x) interface**: gold and bronze frames, red leather panel buttons with gold text, the navy tooltip, stone bars, item slots, the quest log. The game details screen is laid out like the quest log.

Fan-made and unofficial: **no game files are included**. Every icon, texture and placeholder is original artwork drawn for this theme (`art/`), and the client font is not bundled (see Fonts). `info/NOTICE-WoWVanilla.txt` ships in the package.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Text colors, font styles | Client UI source, Classic Era 1.15.9 (`Gethe/wow-ui-source`, branch `classic_era`): `Blizzard_Fonts_Shared/Shared/FontStyles.xml`, `GameFontStyles.xml` (`GameFontNormal` 1.0/0.82/0.0, `GameFontHighlight`, `GameFontDisable` 0.5, `GameFontRed` 1.0/0.1/0.1, `QuestFont` / `QuestTitleFont` black, `QuestFont_Shadow_Huge` shadow 0.49/0.35/0.05, `QuestFontNormalSmall` 0.30/0.18/0, `ItemTextFontNormal` 0.18/0.12/0.06) |
| Font families and sizes | `Blizzard_Fonts_Shared/Classic/Fonts.xml`: Friz Quadrata (`FRIZQT__.TTF`) 13 / 14, Morpheus 16, Arial Narrow for numbers |
| Status bar colors | `Blizzard_ActionBar/Classic/ExpBarOverrides.lua` (experience 0.58/0.0/0.55, rested 0.0/0.39/0.88), `Blizzard_UIPanels_Game/Classic/CastingBarFrame.xml` (casting 1.0/0.7/0.0), `SkillFrame.lua` |
| Quest log layout | `Blizzard_UIPanels_Game/Vanilla/QuestLogFrame.xml`: 384x512 frame, the list above the detail scroll frame, quest title and text in black, buttons at the foot |
| Tooltip, item quality | Documented client values that live in data files, not in that source: `TOOLTIP_DEFAULT_BACKGROUND_COLOR` (0.09, 0.09, 0.19), `TOOLTIP_DEFAULT_COLOR` white, `ITEM_QUALITY_COLORS` (#9d9d9d, #ffffff, #1eff00, #0070dd, #a335ee, #ff8000, #e6cc80) |
| Frame, button, bar, knob and paper colors | **Read off the interface art by eye** (dialog border, `UI-Panel-Button-*`, stone bar, scroll knob, quest paper). These are approximations, named `FRAME_*`, `BUTTON_*`, `STONE_*`, `KNOB_*`, `PARCHMENT_*`, `SLOT_*`, `FIELD_*`, `TEXTURE_*` in `tokens.css`. The textures themselves are Blizzard's and are not used or shipped |
| Icons | Original drawings: `art/glyphs.py` (28 glyph geometries), `art/menu_icons.py` (24 painted menu icons and the question mark placeholders). No third-party icon set, so no icon license file |
| Paper | `art/parchment.py`: a seamless procedural tile (`src/Images/parchment.png`) |
| Playnite mechanics | Playnite 10.60 Default theme (`scripts/data/playnite-theme-api.json`); `DescriptionView.html` and `ThemeFile` behavior read from `source/Playnite.DesktopApp/Controls/Views/GameOverview.cs` and `source/Playnite/Controls/HtmlTextView.cs` |

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | The client's constants under their own names (`NORMAL_FONT_COLOR`, `TOOLTIP_DEFAULT_BACKGROUND_COLOR`, `EPIC_PURPLE_COLOR`, ...) and the approximated art colors. |
| `src/Common.xaml` | `PopupBorder`, `FocusVisual`, `CheckBoxFocusVisual`, component spacing, `IconSize`. |
| `src/Media.xaml` | Glyph geometries (generated block, `python3 art/glyphs.py media`), `IconTemplate`, the search icons, the menu icon paths (`Images/Menu/*.png`), `DefaultGameIcon` and `DefaultGameCover` (the question mark). |
| `src/DescriptionView.html` | The template Playnite renders the game description with: dark ink on paper. Carries its colors as literals (see Deviations). |
| `src/Images/` | `Menu/*.png` (48px), `questionmark.png`, `cover.png`, `parchment.png`. |
| `src/Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml` | The quest log page (details view and grid view side panel). |
| `art/` | Sources of the artwork (`glyphs.py`, `menu_icons.py`, `parchment.py`, `mark.svg` for the tile). Not shipped. |

## Tokens

Keys are the shared vocabulary; the template names the token behind each one. Gradient keys (buttons, frame, bars, page, row highlights) are `LinearGradientBrush`; ThemeModifier's solid-color editor does not recolor those stops.

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `HIGHLIGHT_FONT_COLOR` | `#ffffff` | `TextBrush`, `SelectedForegroundBrush` | values, body text, list rows |
| `NORMAL_FONT_COLOR` | `#ffd100` | `GlyphBrush`, `ButtonForegroundBrush`, `FocusBrush`, `MixedRatingBrush` | labels, headings, button text, checked marks, accent, focus |
| `NORMAL_FONT_COLOR` at 28 / 60 / 45 % | | `HoverBrush` / `HighlightGlyphBrush` / `SelectedBrush` | mouse highlight, selected band |
| `NORMAL_FONT_COLOR` gradient at 30 to 6 % / 52 to 14 % / 42 to 12 % | | `ListItemHoverBrush` / `ListItemSelectedBrush` / `MenuItemHoverBrush` | quest log row highlight, menu highlight (UI-Common-MouseHilight) |
| `POOR_GRAY_COLOR` | `#9d9d9d` | `TextBrushDarker` | secondary text, uninstalled games |
| `QUEST_FONT_COLOR` | `#000000` | `TextBrushDark`, `ParchmentTitleBrush` | ink on gold, outlines, headings on paper |
| `ITEM_TEXT_FONT_COLOR`, `QUEST_SMALL_FONT_COLOR`, `PARCHMENT_LINK` | `#2e1f0f`, `#4d2e00`, `#7a1a0a` | `ParchmentTextBrush`, `ParchmentLabelBrush`, `DescriptionView.html` | body, labels and links on paper |
| `PARCHMENT_HIGHLIGHT` / `PARCHMENT` / `PARCHMENT_SHADE` / `PARCHMENT_EDGE` | | `ParchmentBrush` (gradient), `ParchmentEdgeBrush` | the page and its shaded rim |
| `TOOLTIP_DEFAULT_BACKGROUND_COLOR` | `#171730` | `PopupBackgroundBrush`, `TooltipBackgroundBrush` | tooltips, menus, dropdown lists, the property list |
| `TEXTURE_TOOLTIP_BORDER` | `#c9c9c9` | `PopupBorderBrush` | the light 2px popup edge |
| `PANEL_FILL`, `DIALOG_BG_DARK` | `#2a241c`, `#0d0b08` | `NormalBrush`, `NormalBrushDark` | control surface, darker surface |
| `DIALOG_BG_TOP` to `DIALOG_BG_BOTTOM` | `#211c16` to `#14110c` | `WindowBackgourndBrush`, `ContentBackgroundBrush` (to `DIALOG_BG_DARK`) | window and dialog background, the library layer |
| `STONE_LIGHT` to `STONE_DARK` | `#362f26` to `#1c1813` | `ShellBackgroundBrush` (horizontal) | sidebar |
| `FRAME_HIGHLIGHT` / `FRAME_GOLD` / `FRAME_BRONZE` | `#f4dc8e` / `#c99a3e` / `#7c5820` | `FrameBrush` (diagonal gradient), `PanelSeparatorBrush`, `WindowPanelSeparatorBrush`, `MenuSeparatorBrush`, `CheckBoxBorderBrush`, `GridViewItemHoverBorderBrush` | frame ring, dividers, hover edges |
| `FRAME_SHADOW` | `#3d2810` | `FrameInnerBrush` | line just inside the frame |
| `SLOT_FILL_BOTTOM`, `SLOT_EDGE_LIGHT` / `SLOT_EDGE` / `SLOT_EDGE_DARK` | | `GridItemBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `SlotBorderBrush` | the dark bed behind covers and icon slots, the bevel |
| `FIELD_BACKGROUND`, `FIELD_BORDER`, `FIELD_BORDER_HOVER` | `#050403`, `#8b7548`, `#b39a63` | `InputBackgroundBrush`, `NormalBorderBrush`, `InputBorderBrush`, `InputHoverBorderBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush`, `ScrollBarTrackBrush` | edit boxes, grooves and troughs |
| `BUTTON_RED_HIGHLIGHT` / `BUTTON_RED` / `BUTTON_RED_SHADOW` | `#8e3320` / `#5d170d` / `#3a0c07` | `ButtonBackgroundBrush` (gradient) | button face |
| `BUTTON_HOVER_*`, `BUTTON_RED_PRESSED`, `BUTTON_EDGE` | | `ButtonHoverBackgroundBrush`, `ButtonPressedBackgroundBrush`, `ButtonBorderBrush`, `PrimaryButton*Brush`, `ToggleButtonCheckedBackgroundBrush`, `DangerBrush` | hover, pressed, edge, Play, close button hover |
| `KNOB_LIGHT` / `KNOB` / `KNOB_DARK` | `#efdcae` / `#c2a468` / `#8d7440` | `ScrollBarThumbBrush`, `ThumbBrush`, `SliderThumbBackgroundBrush` | scroll knob, slider plate |
| `CASTING_BAR_COLOR` (+ `_HIGHLIGHT`, `_SHADOW`) | `#ffb200` | `ProgressBarForegroundBrush` | progress bars |
| `UNCOMMON_GREEN_COLOR`, `RED_FONT_COLOR`, `LEGENDARY_ORANGE_COLOR` | `#1eff00`, `#ff1a1a`, `#ff8000` | `PositiveRatingBrush`, `NegativeRatingBrush` / `WarningBrush`, `DataChangeNotifBrush` | scores, warnings, unsaved marker |

Font: `FONT_FAMILY` = `Friz Quadrata TT, Constantia, Palatino Linotype, Georgia, Segoe UI`. Sizes 12 / 14 / 16 / 20 / 28 (the client sets its UI at 13 and its large headings at 16 and 20).

## Component spacing (`src/Common.xaml`)

| Key | Value | Client |
|-----|-------|--------|
| `ButtonPadding` | 14,4,14,5 | `UIPanelButtonTemplate`, 21px face, text 14px in from the caps |
| `InputPadding` | 8,3,8,3 | `InputBoxTemplate`, 20px field |
| `MenuPadding`, `ComboBoxDropDownPadding` | 5 | tooltip and dropdown backdrops inset their content by 5px |
| `MenuItemPadding`, `ComboBoxItemPadding`, `ListBoxItemPadding` | 10,4 / 8,4 / 8,4 | dropdown and quest log rows |
| `GroupBoxPadding`, `GroupBoxHeaderPadding`, `GroupBoxHeaderFontSize` | 12 / 12,6 / 16 | options frame, `GameFontNormalLarge` |
| `TooltipPadding` | 10,8 | 5px backdrop inset plus air |
| `IconSize` | 20 | micro menu glyphs |
| `FrameThickness` | 3 | dialog border ring |

## Shell

| File | Behavior |
|------|----------|
| `DerivedStyles/MainWindowStyle.xaml` | The window is the gold and bronze frame (`FrameBrush`, 3px) with a dark inner line. `MainWindowButton`: plain 24x22 gold glyphs, no plate; a faint wash on hover, close turns `DangerBrush`. |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Dialogs: the same frame, the title on a plaque at the top center (gold on the panel fill in a gold ring, `UI-DialogBox-Header`), caption glyphs as above. Content starts 32px down. |
| `Views/Sidebar.xaml` | A plain strip of stone (`ShellBackgroundBrush`), no rule toward the library, all four positions. `MainMenuButton`: a bare gold hamburger that takes a faint wash on hover. |
| `CustomControls/SidebarItem.xaml` | Borderless 40px icons. Hover is a faint wash; the current item is a gold glyph on a faint gold wash. Library is the tome, Statistics the hourglass. `PART_ProgressStatus` overlays a translucent gold fill. |
| `Views/TopPanel.xaml` | Plain 50px band, transparent so the library shows through, no rule under it. `TopPanelSearchBox`: a single-edge edit box with a magnifier. View controls are borderless 32px icons (`TopPanelItem.xaml`). Notifications are a letter with a red count. The global progress bar is the casting bar. The right 110px stay clear for the window buttons. |
| `Views/Library.xaml` | The library on the dark `ContentBackgroundBrush` layer; the game's background art is drawn over it. |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | Plain dark glass, no bronze rule; the preset buttons are bare gold glyphs (bin, quill, plus). |

## Game overview (the quest log)

`Views/DetailsViewGameOverview.xaml` (details view) and `GridViewGameOverview.xaml` (grid view side panel) keep Playnite's arrangement and every `PART_` name:

- Title in gold at 28px with a one pixel shadow; the icon and cover sit in a single thin slot edge (hidden with the image).
- **Steam screenshots, description and notes = quest text** on the left: ink on a paper page (`ParchmentBrush`, the tiled `parchment.png` at 90 %, a shaded rim from an `OpacityMask` in a `BitmapCache` wrapper), inside one `FrameBrush` frame. Headings are `QuestTitleFont` style: black with a brown shadow copy behind, with no rule under them. Screenshots use the Steam Screenshots plugin host (`SteamScreenshots_SteamScreenshotsViewControl`), hidden when that plugin's control is not visible.
- **Properties = an item tooltip** on the right of that page: the tooltip navy inside a 1px light edge, no inner line and no rule under the title. Labels gold, values white, links white until the pointer turns them gold, scores in the item quality colors. It holds every metadata field Playnite can show, in the six shared groups (progress, scores, about, tags as plain dark chips, library, links; see `.claude/skills/playnite-theme-dev/reference.md`) split by space only (108px gold caption column beside white values; a group whose fields are all hidden collapses). The grid panel uses the same two columns (quest text, then a 280px tooltip) with each caption over its value. The side panel has no bronze rule against the grid.
- `DescriptionView.html` draws the description with the same ink.

## Components

| Playnite file | Client component | Notes |
|---------------|------------------|-------|
| `DefaultControls/Button.xaml`, `RepeatButton.xaml`, `ToggleButton.xaml`, `DerivedStyles/PlayButton.xaml` | `UIPanelButtonTemplate` | plain red face, one gold edge, gold text with a 1px shadow (`DropShadowEffect`, blur 0), hover lightens the face and the edge, pressed goes dark and nudges the text; disabled goes gray (Opacity restored to 1). Play is one step brighter with white 16px text |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `CustomControls/SearchBox.xaml` | `InputBoxTemplate` | near-black field, a single tan edge that turns gold on `IsKeyboardFocusWithin` |
| `DefaultControls/ComboBox.xaml` | `UIDropDownMenuTemplate` | the same field with a borderless gold triangle; the list is a tooltip-style popup with one edge |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | `UI-CheckBox`, `UI-RadioButton` | 20px dark box / disc, one gold edge, gold tick / dot |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | `OptionsSliderTemplate` | dark groove, red leather fill (`SliderRangeButton`), beige plate (`SliderThumb`) |
| `DefaultControls/ProgressBar.xaml` | casting bar | gold fill under a lit line; Playnite's indeterminate animation; host `BorderThickness 0` removes the edge |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | `UIPanelScrollBarTemplate` | 16px groove, arrow buttons at both ends (`ScrollBarArrowButton`), beige knob with three grip lines (`ScrollBarThumb`) |
| `DefaultControls/TabControl.xaml` | `CharacterFrameTabButtonTemplate` | plain text tabs, no strip line; the current tab is gold text on a faint gold wash |
| `DefaultControls/ToolTip.xaml`, `ContextMenu.xaml`, `Menu.xaml`, `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | `GameTooltip`, `UIDropDownMenuButtonTemplate` | navy, a single 1px light edge, gold mouse highlight rows, gold check and submenu glyphs; menu separators are a faint line |
| `DefaultControls/GroupBox.xaml` | options frame | gold 16px title, no frame and no rule under it |
| `DerivedStyles/PropertyItemButton.xaml` | tooltip lines, item slots | values that filter: white, gold under the pointer; in a list tagged `Chip` a plain dark bed, gold text on hover |
| `DefaultControls/ListBox.xaml`, `ListView.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml` | quest log rows, action button slots | gold wash on hover and when selected, no row rules; covers get a 1px gold line on hover and when selected |
| `DefaultControls/Expander.xaml`, `DerivedStyles/*GroupStyle.xaml` | quest log zone headers | a 14px plus / minus box, the group name in gold, the count in gray |
| `DerivedStyles/NotificationMessage.xaml`, `Views/SearchView.xaml` | tracker messages, search results | dark glass, gold hover; the search list uses the quest log highlights instead of Playnite's blue |

## Deviations from the client

- **No game assets, no client font.** Icons and textures are original; Friz Quadrata is used only if installed (`FONT_FAMILY` falls back to Constantia, Palatino Linotype, Georgia, Segoe UI). Playnite's HTML description uses `DescriptionView.html`'s own font list.
- **Colors of the art are approximations** (see Sources); the client's textures are not sampled.
- **Shadows**: text shadows are `DropShadowEffect` (blur 0) on buttons, the progress text and the game title only, not on every text block, to keep list scrolling cheap. No shadows on popups or tiles (repo rule).
- **Plainer than the client chrome.** The window and dialogs keep the gold frame. Inside it, rails, the top bar, icon buttons, group boxes, tabs and the game page drop the extra rules, slot borders and glows, closer to the quiet panels (the test dialog, the HUD edit list, the classic login form) than to a frame around every control.
- **Gradients** are used where the art is a gradient; ThemeModifier's solid-color editor cannot recolor them.
- **`DescriptionView.html` carries its colors as literals** (`#2E1F0F` ink, `#7A1A0A` links): the file is not a template. Keep it in step with `ITEM_TEXT_FONT_COLOR` and `PARCHMENT_LINK` in `tokens.css`.
- **The client has no left-hand list plus right-hand page** in the quest log (the list sits above the text); Playnite's details view keeps its own split, dressed in the same pieces.
- **Disabled buttons** restore `Opacity` to 1 (BaseStyle dims to 0.5) because the gray face is the disabled look.
- **Disabled and unsupported**: menu icons Playnite copies stay PNG paths (Playnite rebuilds glyph resources from text); the grid tile's hover play / info buttons keep Playnite's glyph font; no fullscreen theme.
- Window buttons use the icons of `Media.xaml`, not Marlett glyphs; Playnite still sets the content to `0`, `1`, `2`, `r` and the templates read it.

## Art

```text
python3 art/glyphs.py media      # rewrite the glyph block in src/Media.xaml
python3 art/glyphs.py preview    # art/glyphs-preview.html
python3 art/menu_icons.py png    # src/Images/Menu/*.png, questionmark.png, cover.png (Node + Playwright Chromium, Pillow)
python3 art/menu_icons.py sheet  # art/menu-sheet.html
python3 art/parchment.py         # src/Images/parchment.png
python3 scripts/render-addon-icon.py --svg src/themes/WoWVanilla/art/mark.svg --extension wowvanilla   # info/icon.png
```

## Not verified yet

Built and statically checked on Linux (the repo's `build-theme.ps1` and `validate-extension.ps1` under PowerShell 7, plus a lint of every XAML file against the .NET Framework 4.6.2 WPF reference assemblies: element, property, attached property, `TemplateBinding` and `TargetName` names, checked on Playnite's own Default theme first); **never loaded in Playnite**, so no screenshot exists yet (`info/danitesler_wowvanilla.yaml` has no `Screenshots`; add `info/screenshots/*.png` and the entries once it runs).

First run: library (grid, details, list), the quest log page with a game that has a description, notes and scores, the game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus. Also: how the `DropShadowEffect` on buttons looks with ClearType, the `OpacityMask` vignette and the tiled paper in the overview (`BitmapCache`), the plaque title at different dialog widths, `ImageBrush` with `{ThemeFile}` inside a control template, the scroll bar arrows on horizontal bars, whether Constantia is picked when Friz Quadrata is missing, and how the 16px scroll bar sits in `DetailsScrollViewer`'s 17px margin, and the tooltip pane with every field on and with few (spacing between groups, item slots wrapping, two-line captions such as "Completion Status" in the 108px column).
