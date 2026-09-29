# Uplink — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) taking inspiration from the **StarCraft II** menus as they have looked since patch 3.0 (the "glue" screens: a navigation bar across the top with a sub navigation strip under it). Dark only: deep space navy, pale blue text, one lit blue accent, plates with cut corners, blue glows and a bright line under whatever is current. Unofficial and standalone: every file it ships lives in this folder, and no Blizzard asset is in it (`info/NOTICE-uplink.txt`). Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`); the theme's own token names stay in `tokens.css`.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

**Intended layout: Settings → Appearance → Layout → Sidebar position = Top.** That turns the sidebar into the game's navigation bar. Left, right and bottom still work (an icon rail, or a bottom strip).

## Sources

Blizzard publishes no design system. Where a value could be sourced it was, and `tokens.css` tags every value with where it came from:

| Tag | What | Where |
|-----|------|-------|
| `[FS]` | Text colors of the top navigation (`BattlenetTopNav` 9aebff, highlight white, glow 0078ff), sub navigation (`BattlenetSubNav` 47849e), tab buttons (8dbfea / cce7ff / selected ink 020e1e / disabled 405f71), buttons (`ColorStandardButton` c6f0ff, alternate ffe490), labels (`GlueLabel` 41baff), titles (`GlueTitle` c1ffff); the Subnav Extended button fill (12,33,53) and border glow (0,102,255) | The game's UI data, `Mods/Core.SC2Mod/Base.SC2Data/UI/FontStyles.SC2Style` and `UI/Layout/Common/StandardNavigationTemplates.SC2Layout`, as mirrored in [SC2Mapster/SC2GameData](https://github.com/SC2Mapster/SC2GameData). Layout facts too: `ScreenNavigationSC2.SC2Layout` (72-unit bar, home button first, tab dividers, party panel right). Read for values only; no file from it is shipped. |
| `[UI]` | Navigation bar gradient #090f16 → #121d2b, dividers #1d2b35, sub-nav band #080c14, the lit line under the current tab (#97ebf9 fading out), portrait frame glow #278fe5 | [xavortm/starcraft-ui](https://github.com/xavortm/starcraft-ui), a hand-built HTML/CSS clone of the nav bar. |
| `[eye]` | Surfaces between those values, the Play button blue, the veils | Chosen by eye. Screenshots of the game could not be fetched from the build environment (image hosts were blocked), so none of the layout is measured against a capture. |
| Icons | Original angular line artwork, 24 grid, 1.5 stroke | `art/icons.py` (path data) → `icons/*.svg` → `src/Media.xaml` geometries and `src/Images/Icons/*.png` (`art/render-png.mjs`, Chromium). MIT with the repo. |
| Playnite | Every file starts from the Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`); the game page and side panels follow the shared skeleton. | |

## Tokens

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `void` | `#02060b` | `WindowBackgourndBrush`, `CheckBoxCheckMarkBkBrush`; at 70% / 90%: `InputBackgroundBrush`, `TopPanelSearchBox*` | window, input wells |
| `nav-top` | `#090f16` | `ShellBackgroundBrush` | navigation bar (lit toward the bottom by `FrameInnerBrush` at 10%) |
| `deck` | `#050b13` | `ContentBackgroundBrush`, `NormalBrushDark` | library layer |
| `hull` | `#08111c` | `NormalBrush`, `TopPanelBackgroundBrush`, `ExpanderBackgroundBrush` | sub navigation strip, panels, cards |
| `plate` / `plate-hover` | `#0c2135` / `#123252` | `ButtonBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `PropertyItemBackgroundBrush`, `ProgressBarTrackBrush`, `SliderThumbBackgroundBrush` / `ButtonHoverBackgroundBrush`, `PropertyItemHoverBackgroundBrush` | buttons, chips |
| `popup` | `#07111d` | `PopupBackgroundBrush`, `TooltipBackgroundBrush` | menus, tooltips |
| `line` | `#1d2b35` | `PanelSeparatorBrush`, `WindowPanelSeparatorBrush`, `MenuSeparatorBrush` | dividers |
| `line-blue` / `-hover` | `#1c4466` / `#2e6fa6` | `NormalBorderBrush`, `PopupBorderBrush`, `ButtonBorderBrush`, `SlotBorderBrush`, `SliderTrackBrush`, `ScrollBarThumbBrush`, `ThumbBrush` / `InputHoverBorderBrush`, `CheckBoxBorderBrush` | the blue frame of controls |
| `text` / `text-soft` / `text-nav` / `text-button` | `#d0f0ff` / `#8dbfea` / `#9aebff` / `#c6f0ff` | `TextBrush`, `TooltipForegroundBrush` / `TextBrushDarker`, `PropertyItemForegroundBrush` / `MainMenuButtonForegroundBrush` / `ButtonForegroundBrush` | text |
| `white` | `#ffffff` | `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush`, `DangerForegroundBrush` | current tab, hovered button, Play |
| `on-bright` | `#020e1e` | `TextBrushDark` | ink on a lit fill |
| `cyan` | `#5cdeff` | `GlyphBrush`, `CheckBoxHoverBorderBrush`, `GridViewItemHoverBorderBrush` | accent: selection, checked, links, headings, button hover edge |
| `blue` | `#58baff` | `ProgressBarForegroundBrush`, `ScrollBarThumbHoverBrush`, `ThumbHoverBrush` | fills |
| `glow` | `#0078ff` | `FrameInnerBrush`, `FocusHaloBrush`; as `glow-wash` / `glow-haze` (20% / 34%): `SelectedBrush`, `ListItemSelectedBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush` / `HighlightGlyphBrush`, `SelectedHoverBrush`, `ButtonPressedBackgroundBrush` | the glow behind current items |
| `beam` | `#97ebf9` | `FocusBrush`, `TabItemIndicatorBrush`, `SliderHoverForegroundBrush`, `SliderThumbHoverBorderBrush` | the lit line, focus ticks |
| `edge-glow` | `#278fe5` | `FrameBrush`, `TabItemHoverIndicatorBrush` | frame of the current cover |
| `cta` / `-hover` / `-pressed` | `#0d4fae` / `#1768d6` / `#0a3c85` | `PrimaryButton*BackgroundBrush` | Play and default buttons |
| `veil` / `veil-strong` | blue 7% / 13% | `ListItemHoverBrush`, `ScrollBarTrackBrush` / `HoverBrush`, `MenuItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` | hover |
| `gold`, `green`, `orange`, `red-light`, `red` | `#ffe490`, `#9bffbe`, `#ffd386`, `#ffaaaa`, `#e0453a` | `DataChangeNotifBrush`, `PositiveRatingBrush`, `MixedRatingBrush`, `NegativeRatingBrush` + `WarningBrush`, `DangerBrush` | signals |

Type: body `Segoe UI`; `HeadingFontFamily` is `Eurostile Extended, Microgramma D Extended, Eurostile, Bahnschrift SemiBold, Bahnschrift, Segoe UI` (the game sets navigation and headings in Eurostile Extended caps; nothing is bundled, so most machines get Bahnschrift). Sizes 12 / 14 / 16 / 21 / 28. Corners are square (`ControlCornerRadius` 0); cut corners are drawn by `ChamferTemplate`.

New shared key this theme added to `scripts/data/theme-keys.json`: **`ChamferTemplate`**, a ControlTemplate for a plain `Control` that draws a plate with 6px cut corners from the host's `Background` and a 1px edge from its `BorderBrush`: `<Control Template="{DynamicResource ChamferTemplate}" Background="..." BorderBrush="..." />` behind the content, hit testing off.

## Component spacing (`src/Common.xaml`)

| Key | Value | Notes |
|-----|-------|-------|
| `ButtonPadding` | 20,9 | 36px buttons, uppercase heading-sans label |
| `InputPadding` | 10,7 | 34px fields |
| `MenuPadding`, `ComboBoxDropDownPadding` / `MenuItemPadding` | 4 / 14,8 | 34px items |
| `ComboBoxItemPadding`, `ListBoxItemPadding` | 12,7 | |
| `GroupBoxPadding`, `GroupBoxHeaderMargin` | 16, 0,0,0,12 | |
| `TooltipPadding` | 12,7,12,8 | |
| `IconSize` | 20 | sub navigation icons; the navigation tabs use 16 |

## Shell

| File | Behavior |
|------|----------|
| `Views/Sidebar.xaml` | **Top:** the navigation bar, 56px, `ShellBackgroundBrush` with the glow rising toward the 1px bottom line; the home button (`MainMenuButton`, `PART_ElemMainMenu`, 56px plate with a hexagon mark) boxed at the left; 146px kept clear for the caption buttons. **Left/right:** a 56px rail with the same glow running sideways. **Bottom:** a strip. |
| `CustomControls/SidebarItem.xaml` | **Top/bottom:** icon + title in uppercase heading sans (15px, Playnite's `StringToUpperCaseConverter`), 20px either side, short 1px dividers; `TextBrushDarker` at rest; hover and current = white over a blue glow (`FrameInnerBrush`) rising from the bar's bottom edge; current adds a 2px beam (`TabItemIndicatorBrush`) that fades out at both ends. **Rails:** icon only, 56x48, glow from the library-side edge and a 1px beam there; title as tooltip. |
| `Views/TopPanel.xaml` | The sub navigation strip: 48px on `TopPanelBackgroundBrush`, 1px line under it; search (320px) left; view, sort, filter, notification icons right, `TextBrushDarker`, light blue on a glow wash when on. Keeps 146px clear for the caption buttons only when it is the topmost bar (sidebar not at the top). |
| `DerivedStyles/MainWindowStyle.xaml` | Caption buttons 46x40, 8px from the top with the sidebar at the top (centered on the 56px bar), 4px otherwise; red close hover. |
| `Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml`, `SearchView.xaml` | Library layer on `deck`, the game's background art feathered in; side panels on `hull`. |

## Game page

Follows the shared skeleton. Title in the heading sans (28px), Play 180x40, the other actions 150x40. Section headings (`HeadingTextBlock`) are the heading sans in `GlyphBrush` over the lit divider (`DividerTemplate`: a 28x3 bar and a 1px line fading right). The cover in the details header sits in a 1px frame with the lit corner ticks.

## Components

| Playnite file | Design |
|---------------|--------|
| `DefaultControls/Button.xaml` | `ChamferTemplate` plate (`plate` fill, `line-blue` edge), uppercase heading-sans label in `ButtonForegroundBrush`; hover lights the plate, light blue edge, white text; pressed = glow haze; `IsDefault` = the lit `cta` plate with a light blue edge |
| `DerivedStyles/PlayButton.xaml` | The game's big lit button: `cta` chamfer plate, light blue edge, a blue glow rising from the bottom, a 2px beam along the bottom, bold uppercase 16px label |
| `DefaultControls/ToggleButton.xaml` | The Button plate; on = glow wash, light blue edge |
| `DefaultControls/GroupBox.xaml` | Card on a chamfer plate (`ExpanderBackgroundBrush`, `NormalBorderBrush` edge), heading over the lit divider |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | 18px square / octagon slot, a lit square / octagon inside when checked |
| `DefaultControls/Slider.xaml` | 2px rail, light blue range, a 10x16 cut-corner thumb |
| `DefaultControls/ToolTip.xaml`, `ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml` | `popup` surface, blue edge, a 2px light blue rule on tooltips, blue veil on hover |
| `DerivedStyles/GridViewItemStyle.xaml` | Covers as portrait frames: 1px `SlotBorderBrush`; hover = light blue edge, a glow creeping in from the edges, corner ticks; current = 2px `FrameBrush`, glow, ticks in the beam color |
| `Common.xaml` | `ChamferTemplate`, `CornerMarksTemplate` (45° ticks with 10px stubs), `DividerTemplate`, `HeadingTextBlock`, `FocusVisual` (the ticks in `FocusBrush`) |

The rest (TextBox, PasswordBox, ScrollViewer, ProgressBar, TabControl, Expander, ListBox, group styles, property chips, window bar buttons) keeps the square-cut structure from the Default files, colored through the keys above.

## Deviations

- **Uppercase:** WPF has no text-transform. Navigation titles and string button labels go through Playnite's `StringToUpperCaseConverter`. Headings from Playnite's `LOC` strings and data-bound text (game title, group names) can't take a converter where they are set from code or through `ObjectToStringConverter`, so they use `Typography.Capitals="AllSmallCaps"`, which shows them as typed with fonts that have no small caps (Bahnschrift, most Eurostile builds).
- **No letter-spacing, no blur**: the game's tracked capitals and blurred glass behind the bar are not possible; glows are radial gradients masked onto `FrameInnerBrush`, never `DropShadowEffect`.
- **Not the game's font**: Eurostile Extended is used only if installed. Bahnschrift is narrower, so tabs are shorter than in the game.
- **No hexagon pattern, no 3D scenes**: the bar's animated hex shimmer and the menu backgrounds are game art; the library shows the game's own background art instead.
- Playnite templates this theme does not replace (DataGrid in List view, DatePicker, TreeView, notification panel, add-on views) take the colors, not the chamfers.

## Not verified yet

**Never loaded in Playnite.** It was built on Linux: `build-theme.ps1` and `validate-extension.ps1` pass (static checks: file paths, keys, types, placeholders, cross-file references, well-formed XAML), but WPF never parsed it, so a XAML error that only shows at load time would make Playnite fall back to Default and log it in `playnite.log`. `art/preview-grid.png` is an HTML replica of the grid view drawn with the same token values and sizes, rendered in Chromium, not a Playnite capture (fonts stand in: Barlow for Bahnschrift, Open Sans for Segoe UI). Take real screenshots (`info/screenshots/`) before a database PR.

First run, most likely to need a fix: the uppercase converter binding on `SidebarItem` titles; the chamfer plates at small sizes (the 6px corner cells need at least 12px of height); the tab glow and beam with the sidebar at the top and at the bottom; the flipped glow on a right-hand rail; caption buttons over the 56px bar and the 48px strip; `Typography.Capitals` with the installed heading font; and every `[eye]` value in `tokens.css`.
