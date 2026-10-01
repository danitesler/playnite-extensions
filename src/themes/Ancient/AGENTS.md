# Ancient — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) after the **Dota 2 main menu** (the dashboard of the Panorama UI, Reborn and later): a near-black slate top bar with uppercase tabs, a black secondary strip under it, bevelled grey buttons, black tick boxes that fill pale teal, and the big green PLAY DOTA button, all over the game's background art. Dark only. Minimal on purpose: no hero renders, no textures, no animated scenes; the marks that make the dashboard recognisable are kept, the rest is flat. Unofficial and standalone: every file it ships lives in this folder, no Valve asset is in it (`info/NOTICE-ancient.txt`). Resource keys are the shared vocabulary; the game's own names stay in `tokens.css`.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

**Intended layout: the sidebar on the left** (Playnite's default; repo rule): the dashboard's top bar turned into a 44px compact rail. Right mirrors it; top and bottom still draw the game's horizontal bar with uppercase tabs as a fallback.

## Sources

Valve publishes no design system, but the game's interface stylesheets are public game data. `tokens.css` tags each value:

| Tag | What | Where |
|-----|------|-------|
| `[CSS]` | Top bar tabs (`.TopBarMenuItem`: 18px title font, uppercase, `#777f88`, hover white, selected white with a `#3382ff` glow; 60px tall, 164px wide), secondary strip (`#TopBarSecondaryTabs` black `aa` fading right, `.SecondaryTabButton` `#768e8d`, selected glow `#5d7070`), search box (`#TopBarSearchBox` 350px, 2px `#556663` edge), gear button wash `#444a55`/`#9999aa`, `#VerticalSeparator`; PLAY button (`play.css .PlayButton`: `#5Aa15E` → `#87d69533`, light top/left edge, dark bottom/right, 28px bold uppercase); `ButtonBevel`, `ButtonDark`, `DropDown`/`DropDownMenu`, `TextEntry`, tick box and radio, slider, scroll thumb (`dotastyles.css`); tooltip `#252b30` (`core tooltip_base.css`); popup panel (`core popups_shared.css`); chat panel `#161E24` (`chat.css`); hero card dimming (`hero_card.css`); fonts `Radiance` / `Reaver` | `pak01_dir/panorama/styles` of the build of 2021-02-15, as mirrored in [SteamDatabase/GameTracking-Dota2](https://github.com/SteamDatabase/GameTracking-Dota2) commit `3b077d8` (`dashboard.css`, `dotastyles.css`, `play.css`, `hero_grid.css`, `hero_card.css`, `chat.css`, core `tooltips/`, `popups/`). Layout facts from `layout/dashboard.xml` (settings, home, Heroes/Store/Watch/Learn/Arcade tabs, right-side buttons). Read for values only; no file is shipped. |
| `[eye]` | Surfaces the game draws with textures or 3D scenes (window, top bar slate, page layer), the glow washes, the pressed green | Chosen by eye between the sourced values. Screenshots of the game could not be fetched from the build environment (image hosts blocked), so nothing is measured against a capture. |
| Icons | Original line artwork, 24 grid, 1.75 stroke, round joins | Written directly as geometries in `src/Media.xaml`. Menu icons stay Playnite's glyphs. MIT with the repo. |
| Tile icon | `art/mark.svg` (original faceted keystone), default orange | `scripts/render-addon-icon.py` |
| Playnite | Every file starts from the Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`); game page and side panels follow the shared skeleton | |

## Tokens

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `void` | `#07090b` | `WindowBackgourndBrush` | window |
| `topbar` | `#121619` | `ShellBackgroundBrush` | top bar, shaded darker toward the window edge |
| `deck` | `#0d1114` | `ContentBackgroundBrush`, `NormalBrushDark` | library layer, under the art |
| `strip` | black 67% | `TopPanelBackgroundBrush` | secondary strip, thinning out at the right |
| `chat` | `#161e24` | `NormalBrush`, `ExpanderBackgroundBrush`, `BackgroundToneColor`, `GridItemBackgroundColor` | side panels, cards, game details pane, grid panel |
| `tooltip` | `#252b30` | `TooltipBackgroundBrush` | tooltips |
| `menu` / `menu-hover` | `#3d4448` / `#585e62` | `PopupBackgroundBrush` / `MenuItemHoverBrush` | dropdown lists, menus |
| `bevel` / `-hover` / `-pressed` | `#4d5860` / `#6c7d88` / `#555555` | `ButtonBackgroundBrush` / `ButtonHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` | ButtonBevel (lighter stop; the shade darkens the top) |
| `dark-fill` / `-hover` | `#292e2e` / `#393e3e` | `PropertyItemBackgroundBrush` / `PropertyItemHoverBackgroundBrush` | ButtonDark, dropdowns, chips, toggles |
| `frame` / `frame-hover` / `frame-lit` | `#5e686966` / `#5e6869` / `#697879` | `NormalBorderBrush`, `ButtonBorderBrush`, `CheckBoxBorderBrush` / `InputHoverBorderBrush` / `CheckBoxHoverBorderBrush` | 2px control edges |
| `input` / `input-border` | `#1a1a1a` / `#444444` | `InputBackgroundBrush` / `InputBorderBrush` | TextEntry |
| `text` / `text-soft` | `#a5ada2` / `#7f8b8d` | `TextBrush`, `PropertyItemForegroundBrush` / `TextBrushDarker` | baseText, muted labels and tabs |
| `white` | `#ffffff` | `SelectedForegroundBrush`, `ButtonForegroundBrush`, `PrimaryButtonForegroundBrush`, `TooltipForegroundBrush`, `DangerForegroundBrush`, `TabItemIndicatorBrush` | hover and current text, button labels |
| `tick` | `#a0d6d7` | `GlyphBrush`, `FocusBrush` | accent: ticked box, selection, links, focus |
| `tick-halo` | `#5b62bf77` | `CheckBoxCheckedHoverBackgroundBrush` | halo around a ticked box |
| `nav-glow` | `#3382ff` | `SidebarItemSelectedGlowBrush`, `FocusHaloBrush`; as washes: `SelectedBrush`, `ListItemSelectedBrush`, `ToggleButtonCheckedBackgroundBrush`, `HighlightGlyphBrush` | glow behind the current tab, selected rows |
| `text-subtab` | `#768e8d` | `TabItemHoverIndicatorBrush` | glow behind selected strip items and tabs |
| `gear` | `#444a55` | `MainMenuButtonForegroundBrush` | home button, caption buttons |
| `scroll` | `#566767` | `ScrollBarThumbBrush`, `ThumbBrush` | scroll thumb, slider range |
| `slider-thumb` / `-hover` | `#91a5b9` / `#b8c5d3` | `SliderThumbBackgroundBrush` / `SliderThumbHoverBorderBrush` | slider thumb |
| `play` / `-hover` / `-pressed` | `#5aa15e` / `#87d695` / `#3f7a43` | `PrimaryButton*BackgroundBrush`, `ProgressBarForegroundBrush` | PLAY, default buttons, progress |
| `play-light` / `bevel-shadow` | white 27% / black | `BevelLightBrush` / `BevelShadowBrush`, `SlotBorderBrush`, `MenuSeparatorBrush`, `PopupBorderBrush`, `CheckBoxCheckMarkBkBrush` | bevel edges, shades, black slots and lines |
| `off-white` | `#cccccc` | `GridViewItemHoverBorderBrush`, `FrameBrush` | cover hover and current frames |
| `line` | `#1f2629` | `WindowPanelSeparatorBrush`, `PanelSeparatorBrush` | the light half of paired separators |
| `gold`, `win`, `lose`, `mixed`, `danger` | `#ffcc33`, `#88ff88`, `#ff4433`, `#e4c269`, `#b0261e` | `DataChangeNotifBrush`, `PositiveRatingBrush`, `NegativeRatingBrush` + `WarningBrush`, `MixedRatingBrush`, `DangerBrush` | signals |

Type: body `Radiance, Segoe UI`; `HeadingFontFamily` `Reaver, Trajan Pro, Cinzel, Georgia` (tabs, titles, captions). Nothing is bundled; most machines get Segoe UI and Georgia. Sizes 12 / 14 / 16 / 20 / 28. Corners are square (`ControlCornerRadius` 0).

Keys this theme added to `scripts/data/theme-keys.json`: **`BevelLightBrush`**, **`BevelShadowBrush`** (the bevel's edges and the shade over gradient fills), **`SidebarItemSelectedGlowBrush`** (glow behind the current tab), **`BevelTemplate`** (ControlTemplate for a plain `Control`: host `Background` shaded toward the top, lit top/left and dark bottom/right edges).

## Component spacing (`src/Common.xaml`)

| Key | Value | Game |
|-----|-------|------|
| `ButtonPadding` | 16,8 | ButtonBevel min-height 36 |
| `InputPadding` | 8,7 | TextEntry 36px |
| `MenuPadding`, `ComboBoxDropDownPadding` | 0 | DropDownMenu rows edge to edge |
| `MenuItemPadding`, `ComboBoxItemPadding` | 16,7,16,6 | DropDownMenu Label padding 6,0,2,16 |
| `ListBoxItemPadding` | 12,6 | |
| `GroupBoxPadding`, `GroupBoxHeaderMargin` | 16, 0,0,0,12 | |
| `TooltipPadding` | 12,8 | tooltip #Contents padding 16 at 18px text |
| `IconSize` | 20 | |
| `GameBannerHeight`, `GameDetailsPaneWidth`, `GridDetailsPaneWidth` | 340, 290, 280 | |

## Shell

| File | Behavior |
|------|----------|
| `Views/Sidebar.xaml` | **Left (intended):** a 44px compact rail in the top bar's slate, shaded darker toward the window edge, paired rule on the library side; home button at the top, the paired separator under it, then the items. **Right:** mirrored. **Top (fallback):** the top bar, 64px, slate shaded darker at the top, paired rule under it (black then faint light); home button (`MainMenuButton`, keystone glyph in the gear grey, lighter on hover), the game's paired vertical separator, then the tabs; 146px clear for caption buttons. **Bottom:** strip. |
| `CustomControls/SidebarItem.xaml` | **Rails (intended):** icon only, 44x40 with 16px glyphs, muted at rest, white on hover, white over the blue glow when current; title as tooltip. **Top/bottom (fallback):** title only, uppercase via `StringToUpperCaseConverter`, title font 18px semibold, min 140px wide, 24px either side; muted at rest, white on hover, white over a radial `#3382ff` glow when current. No dividers or underline, like the game. |
| `Views/TopPanel.xaml` | The black secondary strip, 52px, fading from full to 40% at the right; view, group, sort and filter icons at the left in the muted grey (white on hover and when on, a faint teal-grey glow behind toggled ones); notifications and a 350px search box at the right. Keeps 146px clear for the caption buttons when it is the topmost bar (the intended left-rail layout). |
| `Views/Library.xaml` | The game's background art fills the whole library layer, the strip included (like the dashboard scene behind its bars), faded left and down, dimmed, and a radial vignette in the layer's brush. |
| `DerivedStyles/MainWindowStyle.xaml` | Caption buttons 46x40 in the gear grey, centred on the 52px strip (12px from the top in the top-bar fallback), red close hover. |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | Playnite's panels on the chat-panel slate so they read over the art. |

## Game page

Follows the shared skeleton, generated by `art/overview.py` (edit it, then rerun; the two views stay identical in their pane). Details view: 150px of art above the title, title in the title font 38px white small caps with no rule under it, PLAY 220x48 beside More (bevel) and Edit. The metadata pane draws no card: transparent with no edge, fields flush with the Game details caption; groups split by 1px dark lines, captions beside values (112px). Grid panel: transparent like the details view with the same banner scrim and gradient transition, 1px edge on the grid side, title at `FontSizeLargest`, PLAY 44px tall, captions above values, close button in the gear grey.

## Components

| Playnite file | Game component |
|---------------|----------------|
| `DefaultControls/Button.xaml`, `RepeatButton.xaml` | `.ButtonBevel` through `BevelTemplate`: slate gradient, bevel edges, uppercase white label, label nudged 1px when pressed; `IsDefault` = the PLAY green |
| `DerivedStyles/PlayButton.xaml` | `.PlayButton`: green bright at the top, darker at the bottom; hover fills the bottom with light green; bevel edges; bold uppercase label at 20px |
| `DefaultControls/ToggleButton.xaml` | `.ButtonDark`: dark fill, 2px faint edge, muted label; on = blue glow wash |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | tick box / radio: black, 2px faint edge; checked = pale teal fill in a black ring with a violet halo |
| `DefaultControls/ComboBox.xaml` | `DropDown` (dark gradient, 2px edge, chevron) and `DropDownMenu` (#3d4448, rows split by dark lines, #585e62 hover) |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `CustomControls/SearchBox.xaml` | `TextEntry`; the search glyph sits at the right like `#SearchButton` |
| `DefaultControls/Slider.xaml` | black slot, slate range, steel-blue 10x20 thumb |
| `DefaultControls/ScrollViewer.xaml` | 8px slate thumb, no rail or arrows |
| `DefaultControls/ToolTip.xaml`, `ContextMenu.xaml`, `Menu.xaml` | tooltip `#Contents`; menus as `DropDownMenu` |
| `DefaultControls/TabControl.xaml` | secondary tabs: muted, white with a glow and a thin line when selected |
| `DefaultControls/GroupBox.xaml` | chat-panel slate card with a black edge, caption over the paired separator |
| `DerivedStyles/GridViewItemStyle.xaml` | hero card: dimmed at rest (the game desaturates), lifts on hover with a light edge; current = 2px light frame and a blue glow from the bottom |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListBox.xaml` | list rows: dark line under each, veil on hover, blue wash when selected |
| `DerivedStyles/PropertyItemButton.xaml` | links underline white on hover (`.LabelLink`); chips are small ButtonDark plates |
| `DerivedStyles/*GroupStyle.xaml` | hero grid category titles: title font, count, paired separator |
| `Common.xaml` | `BevelTemplate`, `DividerTemplate` (paired separator), `HeadingTextBlock`, `FocusVisual` (1px pale teal outline) |

## Deviations

- **Uppercase:** WPF has no text-transform. Tabs and string button labels go through `StringToUpperCaseConverter`; LOC captions and data-bound text use `Typography.Capitals="AllSmallCaps"`, which shows them as typed with fonts that lack small caps (Georgia, Segoe UI).
- **No letter-spacing, no text glow, no blur, no saturation:** the game's tracked capitals, text-shadow glows, blurred popups and desaturated hero cards are not possible; glows are radial gradient masks on a brush, dimming is a black veil.
- **Not the game's fonts** unless Radiance and Reaver are installed.
- **No textures, no hero renders, no 3D scene:** the top bar image, the PLAY button texture and the dashboard scene are game art; the library shows each game's own background art instead.
- **Focus:** the game has no keyboard focus visual; this theme draws a 1px pale teal outline.
- Playnite templates this theme does not replace (DataGrid, DatePicker, TreeView, notification panel, add-on views) take the colors only.

## Not verified yet

**Never loaded in Playnite.** Built on Linux: `build-theme.ps1` and `validate-extension.ps1` pass (static checks), but WPF never parsed it. `art/preview-grid.png` is an HTML replica of the grid view drawn with the same token values and sizes and rendered in Chromium, not a Playnite capture. Take real screenshots (`info/screenshots/`) before a database PR.

First run, most likely to need a fix: the rail glow behind the current item; the uppercase converter and tab glow in the top/bottom fallback; the black strip over the art (Library puts `TopPanel` inside the art grid); caption buttons over the 64px bar; `BevelTemplate` shading at small heights; the checked tick box ring and halo; and every `[eye]` value in `tokens.css`.
