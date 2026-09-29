# WoW Vanilla Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **World of Warcraft Vanilla (1.x) interface**: gold and bronze frames, red leather panel buttons with gold text, the navy tooltip, stone bars, item slots, the quest log. The game details screen is laid out like the quest log. Standalone: every file it ships lives in this folder. Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`); the client's own names for its colors stay in `tokens.css` and the template's placeholders.

Fan-made and unofficial: **no game files are included**. Every icon, texture and placeholder is original artwork drawn for this theme (`art/`), and the client font is not bundled (see Fonts). `info/NOTICE-WoWVanillaTheme.txt` ships in the package.

Playnite loading rules, overlay mechanics and the build checks are in **`.cursor/rules/playnite-themes.mdc`** and skill **`playnite-theme-dev`**.

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
| `src/Constants.template.xaml` | Tokens → Playnite's palette keys and the shared keys; rendered into `Constants.xaml`. Gradients are plain `LinearGradientBrush` entries. |
| `src/Common.xaml` | `PopupBorder`, `FocusVisual`, `CheckBoxFocusVisual`, component spacing, `IconSize`. |
| `src/Media.xaml` | Glyph geometries (generated block, `python3 art/glyphs.py media`), `IconTemplate`, the search icons, the menu icon paths (`Images/Menu/*.png`), `DefaultGameIcon` and `DefaultGameCover` (the question mark). |
| `src/DescriptionView.html` | The template Playnite renders the game description with: dark ink on paper. Carries its colors as literals (see Deviations). |
| `src/Images/` | `Menu/*.png` (48px), `questionmark.png`, `cover.png`, `parchment.png`. |
| `src/Views/*`, `src/DerivedStyles/MainWindowStyle.xaml`, `StandardWindowStyle.xaml`, `src/CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml`, `SearchBox.xaml` | Shell and window frames. |
| `src/Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml` | The quest log page (details view and grid view side panel). |
| `src/DefaultControls/*`, other `src/CustomControls/*` and `src/DerivedStyles/*` | Controls. |
| `art/` | Sources of the artwork (`glyphs.py`, `menu_icons.py`, `parchment.py`, `mark.svg` for the tile). Not shipped. |
| `info/` | `theme.yaml`, `InstallerManifest.yaml`, `danitesler_wowvanillatheme.yaml`, `icon.png`, `LICENSE-Playnite.txt`, `NOTICE-WoWVanillaTheme.txt`. |

## Tokens

Keys are the shared vocabulary; the template names the token behind each one. Controls read brushes only, so ThemeModifier's palette edits recolor them. Gradient keys (buttons, frame, bars, page, row highlights) are `LinearGradientBrush`; ThemeModifier's solid-color editor does not recolor those stops.

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `HIGHLIGHT_FONT_COLOR` | `#ffffff` | `TextBrush`, `SelectedForegroundBrush` | values, body text, list rows |
| `NORMAL_FONT_COLOR` | `#ffd100` | `GlyphBrush`, `ButtonForegroundBrush`, `FocusBrush`, `MixedRatingBrush` | labels, headings, button text, checked marks, accent, focus |
| `NORMAL_FONT_COLOR` at 28 / 60 / 45 / 55 % | | `HoverBrush` / `HighlightGlyphBrush` / `SelectedBrush` / `SelectedHoverBrush` | mouse highlight, selected band |
| `NORMAL_FONT_COLOR` gradient at 30 to 6 % / 52 to 14 % / 42 to 12 % | | `ListItemHoverBrush` / `ListItemSelectedBrush` / `MenuItemHoverBrush` | quest log row highlight, menu highlight (UI-Common-MouseHilight) |
| `POOR_GRAY_COLOR` | `#9d9d9d` | `TextBrushDarker` | secondary text, uninstalled games |
| `QUEST_FONT_COLOR` | `#000000` | `TextBrushDark`, `ParchmentTitleBrush` | ink on gold, outlines, headings on paper |
| `ITEM_TEXT_FONT_COLOR`, `QUEST_SMALL_FONT_COLOR`, `PARCHMENT_LINK` | `#2e1f0f`, `#4d2e00`, `#7a1a0a` | `ParchmentTextBrush`, `ParchmentLabelBrush`, `ParchmentLinkBrush` | body, labels and links on paper |
| `PARCHMENT_HIGHLIGHT` / `PARCHMENT` / `PARCHMENT_SHADE` / `PARCHMENT_EDGE` | | `ParchmentBrush` (gradient), `ParchmentEdgeBrush` | the page and its shaded rim |
| `TOOLTIP_DEFAULT_BACKGROUND_COLOR` | `#171730` | `PopupBackgroundBrush`, `TooltipBackgroundBrush` | tooltips, menus, dropdown lists, the property list |
| `TEXTURE_TOOLTIP_BORDER` | `#c9c9c9` | `PopupBorderBrush` | the light 2px popup edge |
| `PANEL_FILL`, `DIALOG_BG_DARK` | `#2a241c`, `#0d0b08` | `NormalBrush`, `NormalBrushDark` | control surface, darker surface |
| `DIALOG_BG_TOP` to `DIALOG_BG_BOTTOM` | `#211c16` to `#14110c` | `WindowBackgourndBrush`, `ContentBackgroundBrush` (to `DIALOG_BG_DARK`) | window and dialog background, the library layer |
| `STONE_LIGHT` to `STONE_DARK` | `#362f26` to `#1c1813` | `ShellBackgroundBrush` (horizontal), `TopPanelBackgroundBrush` (vertical) | sidebar, top bar |
| `FRAME_HIGHLIGHT` / `FRAME_GOLD` / `FRAME_BRONZE` | `#f4dc8e` / `#c99a3e` / `#7c5820` | `FrameBrush` (diagonal gradient), `PanelSeparatorBrush`, `WindowPanelSeparatorBrush`, `MenuSeparatorBrush`, `CheckBoxBorderBrush`, `GridViewItemHoverBorderBrush`, `TabItemHoverIndicatorBrush` | frame ring, dividers, hover edges |
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
| `DerivedStyles/MainWindowStyle.xaml` | The window is the gold and bronze frame (`FrameBrush`, 3px) with a dark inner line. `MainWindowButton`: 24x22 plates top right; bronze-bordered dark plates for minimize / maximize, red leather for close (lights to `DangerBrush`). |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Dialogs: the same frame, the title on a plaque at the top center (gold on the panel fill in a gold ring, `UI-DialogBox-Header`), caption plates as above. Content starts 32px down. |
| `Views/Sidebar.xaml` | A strip of stone (`ShellBackgroundBrush`) with a 2px bronze edge toward the library, all four positions. `MainMenuButton`: a 40px slot with a bevelled border and a gold hamburger. |
| `CustomControls/SidebarItem.xaml` | Micro menu buttons: 40px slots, hover lights the border, the current item gets the bright gold border with a faint glow. Library is the tome, Statistics the hourglass. `PART_ProgressStatus` overlays a translucent gold fill. |
| `Views/TopPanel.xaml` | 50px stone band on a bronze rule. `TopPanelSearchBox`: the edit box with a magnifier. View controls are 32px slots (`TopPanelItem.xaml`). Notifications are a letter with a red count. The global progress bar is the casting bar. The right 110px stay clear for the window buttons. |
| `Views/Library.xaml` | The library on the dark `ContentBackgroundBrush` layer; the game's background art is drawn over it. |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | Dark glass panels on a bronze line; the preset buttons are bare gold glyphs (bin, quill, plus). |

## Game overview (the quest log)

`Views/DetailsViewGameOverview.xaml` (details view) and `GridViewGameOverview.xaml` (grid view side panel) keep Playnite's arrangement and every `PART_` name:

- Title in gold at 28px with a one pixel shadow; the icon and cover sit in item slots (bevelled bronze edge in a black line, hidden with the image).
- **Properties = an item tooltip**: the tooltip navy inside its 2px light edge, labels gold, values white, links white until the pointer turns them gold, scores in the item quality colors.
- **Description and notes = quest text**: ink on a paper page (`ParchmentBrush`, the tiled `parchment.png` at 90 %, a shaded rim from an `OpacityMask` in a `BitmapCache` wrapper), inside the `FrameBrush` frame. Headings are `QuestTitleFont` style: black with a brown shadow copy behind.
- `DescriptionView.html` draws the description with the same ink.

## Components

| Playnite file | Client component | Notes |
|---------------|------------------|-------|
| `DefaultControls/Button.xaml`, `RepeatButton.xaml`, `ToggleButton.xaml`, `DerivedStyles/PlayButton.xaml` | `UIPanelButtonTemplate` | lit red face, gold edge in a black outline, gold text with a 1px shadow (`DropShadowEffect`, blur 0), hover lifts the face and lights the edge, pressed goes dark and nudges the text; disabled goes gray (Opacity restored to 1). Play is one step brighter with white 16px text |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `CustomControls/SearchBox.xaml` | `InputBoxTemplate` | near-black field, tan edge, focus ring on `IsKeyboardFocusWithin` |
| `DefaultControls/ComboBox.xaml` | `UIDropDownMenuTemplate` | field plus a square arrow button; the list is a tooltip-style popup |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | `UI-CheckBox`, `UI-RadioButton` | 20px dark box / disc, gold edge, gold tick / dot, faint hover ring |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | `OptionsSliderTemplate` | dark groove, red leather fill (`SliderRangeButton`), beige plate (`SliderThumb`) |
| `DefaultControls/ProgressBar.xaml` | casting bar | gold fill under a lit line; Playnite's indeterminate animation; host `BorderThickness 0` removes the edge |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | `UIPanelScrollBarTemplate` | 16px groove, arrow buttons at both ends (`ScrollBarArrowButton`), beige knob with three grip lines (`ScrollBarThumb`) |
| `DefaultControls/TabControl.xaml` | `CharacterFrameTabButtonTemplate` | tabs are plates with rounded corners away from the content; the current one is gold |
| `DefaultControls/ToolTip.xaml`, `ContextMenu.xaml`, `Menu.xaml`, `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | `GameTooltip`, `UIDropDownMenuButtonTemplate` | navy, light 2px edge, dark line inside, gold mouse highlight rows, gold check and submenu glyphs |
| `DefaultControls/GroupBox.xaml` | options frame | dark glass, bronze line, gold 16px title |
| `DefaultControls/ListBox.xaml`, `ListView.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml` | quest log rows, action button slots | gold gradient hover / selected rows; covers ring in bronze gold on hover and bright gold with a glow when selected |
| `DefaultControls/Expander.xaml`, `DerivedStyles/*GroupStyle.xaml` | quest log zone headers | a 14px plus / minus box, the group name in gold, the count in gray |
| `DerivedStyles/NotificationMessage.xaml`, `Views/SearchView.xaml` | tracker messages, search results | dark glass, gold hover; the search list uses the quest log highlights instead of Playnite's blue |

## Deviations from the client

- **No game assets, no client font.** Icons and textures are original; Friz Quadrata is used only if installed (`FONT_FAMILY` falls back to Constantia, Palatino Linotype, Georgia, Segoe UI). Playnite's HTML description uses `DescriptionView.html`'s own font list.
- **Colors of the art are approximations** (see Sources); the client's textures are not sampled.
- **Shadows**: text shadows are `DropShadowEffect` (blur 0) on buttons, the progress text and the game title only, not on every text block, to keep list scrolling cheap. No shadows on popups or tiles (repo rule); the glow around a selected cover is a translucent ring.
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
python3 scripts/render-addon-icon.py --svg src/WoWVanillaTheme/art/mark.svg --extension wowvanillatheme   # info/icon.png
```

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension wowvanillatheme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: WoW Vanilla Theme
```

## Not verified yet

Built and statically checked on Linux (the repo's `build-theme.ps1` and `validate-extension.ps1` under PowerShell 7, plus a lint of every XAML file against the .NET Framework 4.6.2 WPF reference assemblies: element, property, attached property, `TemplateBinding` and `TargetName` names, checked on Playnite's own Default theme first); **never loaded in Playnite**, so no screenshot exists yet (`info/danitesler_wowvanillatheme.yaml` has no `Screenshots`; add `info/screenshots/*.png` and the entries once it runs).

First run: library (grid, details, list), the quest log page with a game that has a description, notes and scores, the game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus. Also: how the `DropShadowEffect` on buttons looks with ClearType, the `OpacityMask` vignette and the tiled paper in the overview (`BitmapCache`), the plaque title at different dialog widths, `ImageBrush` with `{ThemeFile}` inside a control template, the scroll bar arrows on horizontal bars, whether Constantia is picked when Friz Quadrata is missing, and how the 16px scroll bar sits in `DetailsScrollViewer`'s 17px margin.
