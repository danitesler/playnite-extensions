# Biome — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of the **Terraria 1.4.4 main menu** and its menu screens (character and world select, character creation). Dark only: the window is the title screen's night sky. Translucent blue panels with 2px black edges, white text, menu words that go from white at 60% to gold, the gold edge of a hovered menu button, inventory-slot covers and pixel-art icons. Kept minimal: no textures, no parallax, no ornaments.

**Unofficial fan theme.** Not affiliated with or endorsed by Re-Logic. No Re-Logic logos, icons, fonts, textures or game files are included (see `info/NOTICE-Biome.txt`). The tree mark is hand-drawn (`art/icons.py`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Tokens and component values | Terraria 1.4.4.1 UI classes as published decompiled: `UIPanel`, `UITextPanel`, `UIScrollbar`, `UICharacterListItem`, `UIWorldListItem`, `UICharacterSelect`, `UIWorldSelect`, `UICharacterCreation`, `Main.DrawMenu`, `Utils.DrawInvBG`, `Terraria.ID.Colors` (github.com/br4dnblehh/terraria-source-code, cross-checked with tModLoader's `UICommon.cs`, read 2026-10-01). Values are rewritten as plain numbers in `src/tokens.css`, each marked `source` or `approx.`; no code was copied. |
| Approximations | Sky colors, panel corner rounding and the scroll bar and slot tints are drawn from textures in the game; eyeballed from screenshots and marked `approx.` in `tokens.css`. |
| Icons | **Pixelarticons** 2.4.1 (MIT, `info/LICENSE-pixelarticons.txt`, commit pinned in `art/icons.py`): whole-pixel glyphs on a 24px grid, the closest open set to the game's pixel-art UI. |
| Tree mark | Original, 16px pixel grid in `art/icons.py` (`IconMainMenu`, `art/mark.svg`, `info/icon.png`). |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`). |

Andy Bold (the game's font, commercial) is not bundled. `HeadingFontFamily` is `Andy, Segoe UI Black`, so Andy is used where installed and Segoe UI Black otherwise; body text is Segoe UI.

## Tokens

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `text` | white | `TextColor` / `TextBrush`, `ButtonForegroundBrush`, `HeadingForegroundBrush` | body text, button labels |
| `text-muted` | `rgb(178,186,222)` | `TextColorDarker` | captions, idle menu words and glyphs |
| `fancy-gold` | `rgb(255,231,69)` (`Colors.FancyUIFatButtonMouseOver`) | `GlyphColor`, `FocusBrush`, `PrimaryButtonBorderBrush`, `GridViewItemSelectedBorderBrush`, `TabItemIndicatorBrush`, `ProgressBarForegroundBrush` | hover and selected edges, checks, links, focus |
| `menu-selected` | `rgb(255,215,0)` (hovered menu item) | `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush` | current view word, hovered glyphs, Play label, selected rows |
| `panel` | `(63,82,151)` at 70% (`UIPanel`) | `ButtonBackgroundBrush`, `ExpanderBackgroundBrush`, `ListItemHoverBrush`, `PropertyItemBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush`; flattened onto the sky: `MainColor`, `GridItemBackgroundColor` | buttons, cards, chips, metadata pane |
| `panel-hover` | `rgb(73,94,171)` (`FadedMouseOver`) | `HoverBrush`, `SelectedBrush`, `ButtonHoverBackgroundBrush`, `MenuItemHoverBrush`, `ToggleButtonCheckedBackgroundBrush` | hover and selected fills |
| `panel-outer` | `(33,43,79)` at 80% (select screen list panel) | `ShellBackgroundBrush`, `GameOverviewBackgroundBrush`, `InputBackgroundBrush`, track brushes; flattened: `MainColorDark`, `BackgroundToneColor` | rail, game page, side panels, inputs |
| `panel-border` | black (`UIPanel.BorderColor`) | `NormalBorderBrush`, `ButtonBorderBrush`, `InputBorderBrush`, `SlotBorderBrush`, `CheckBoxBorderBrush` | every 2px panel edge |
| `list-item-border(-hover)` | `(89,116,213)` at 70% / full | `PopupBorderColor`, `TooltipBorderBrush` / `InputHoverBorderBrush`, `GridViewItemHoverBorderBrush`, `PrimaryButtonHoverBackgroundBrush` | popup edges, hover edges |
| `title-pill` | `rgb(73,94,171)` | `PrimaryButtonBackgroundBrush`, `WindowTitleBackgroundBrush` | Play button, dialog titles |
| `tooltip-back` | `(23,25,81)` at 92.5% | `TooltipBackgroundBrush`, `PopupBackgroundColor` (flattened) | tooltips, menus, dropdowns |
| `separator` | `(92,94,167)` at 90% (character creation) | `WindowPanelSeparatorColor` (flattened), `MenuSeparatorBrush`, `TopPanelSeparatorBrush` | rules |
| `sky-top` / `sky-horizon` | `#0b1030` / `#26335e` (approx.) | `WindowBackgourndBrush`, `ScrimBrush` / `ContentBackgroundBrush` | the night sky (Views/Library.xaml) |
| `text-outline` | black | `TextOutlineBrush` (new shared key) | the bordered menu text |
| rarity colors | Green `#96FF96`, Light Red `#FF9696`, Orange `#FFC896`, Red `#FF2864`, Amber `#FFAF00` | `PositiveRatingBrush`, `NegativeRatingBrush`, `MixedRatingBrush`, `WarningBrush`, `DataChangeNotifColor` | ratings, warnings |
| `hardcore` | `rgb(255,38,25)` | `DangerBrush` | close hover, notification badge |
| `radius-panel` / `-small` / `-large` | 6 / 4 / 10 px | `ControlCornerRadius` / `CornerRadiusSmall` / `CornerRadiusLarge` | panels / covers, rows / unused |
| `border-panel` | 2px | `ControlBorderThickness`, `PopupBorderThickness` | |

Type: 12 / 14 / 16 / 22 / 32. New vocabulary entries added for this theme: `TextOutlineBrush`, `OutlinedTextTemplate` (`scripts/data/theme-keys.json`).

**Bordered text.** The game draws menu words four times in black, 2px off, then once on top (`Utils.DrawBorderString`). `OutlinedTextTemplate` (Common.xaml) does the same for a `ContentControl` (1.5px at Playnite's sizes); the game title repeats `PART_TextDisplayName` as four black copies bound to its `Text`. Used for the view switches, the Play label, section headings and the game title only.

## Component spacing (`src/Common.xaml`)

| Key | Value | Game rule |
|-----|-------|-----------|
| `ButtonPadding` | 16,8 | Back/New `UITextPanel`, 50px tall at 1080p |
| `InputPadding` | 10,7 | search bar panel |
| `MenuPadding` / `MenuItemPadding` | 0,6 / 14,7 | list item padding 6 |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,6 / 14,7 | as menus |
| `ListBoxItemPadding` | 10,6 | list item padding 6 |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 12 / 0,0,0,10 | `UIPanel` padding 12 |
| `TooltipPadding` | 10,7 | |
| `IconSize` | 24 | Pixelarticons' grid, one icon pixel per screen pixel |
| `GameBannerHeight` / `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 320 / 300 / 280 | shared game page keys |

Pixel icons are drawn aliased (`IconTemplate`) and only at 24px or 12px (whole or half scale) so pixels stay square; menu PNGs are 48px shown at 24.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Library.xaml` | Night sky: window color at the top, `ContentBackgroundBrush` rising from the bottom (masked, cached). Background art at 45% with a sky-colored shade under the top bar. The library layer has no fill. |
| `Views/TopPanel.xaml` | The title screen: 64px, no fill. Search bar panel at the left; view switches in the middle as outlined menu words (idle white 60%, hover/current gold), grouping/sort/random glyphs beside them, Playnite's two separators as plain gaps; filters, notifications (Hardcore red badge), progress on the right; 150px clear for caption buttons. 48px when the sidebar is at the top. |
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 64px rail in the list panel blue with a 2px black edge; tree mark in a 64px cell; items are 44px hotbar slots (hover: panel + black edge; current: hover blue + gold edge). Top/bottom: a 64px strip, views as outlined words. |
| `CustomControls/TopPanelItem.xaml` | No plate; muted, gold on hover or toggled. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons, 24px pixel glyphs, hover panel with gold edge, red close; black window edge; caption height 64. |

## Game page

Follows the shared skeleton. Differences: the page sits on the list panel blue; the name is outlined (32px heading font); Play is the title panel blue with the gold edge and an outlined gold label; Options and edit are 48px square menu buttons; section titles are outlined bold words over a 2px separator rule; the metadata pane is a menu panel (blue at 70%, 2px black edge, 6px corners) with 1px separator rules between groups (12px around rules, 6px around fields, caption column 128px in the details view). The banner fades into the sky color.

## Components

| Playnite file | Game component |
|---------------|----------------|
| `DefaultControls/Button.xaml`, `RepeatButton.xaml`, `ToggleButton.xaml` | Back/New `UITextPanel`: panel blue, 2px black edge; hover `FadedMouseOver` (brighter blue, gold edge); checked toggle = selected category (gold edge, gold label); `IsDefault` = Play colors |
| `DerivedStyles/PlayButton.xaml` | title panel blue, gold edge, outlined gold label |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml`, `CustomControls/SearchBox.xaml`, `DerivedStyles/HighlightBorder.xaml` | select screen search bar: dark panel, black edge, hover blue edge, gold focus |
| `DefaultControls/ComboBox.xaml`, `ContextMenu.xaml`, `Menu.xaml`, `ToolTip.xaml` | opaque tooltip box navy with the list items' blue edge; hovered rows in the hover blue, inset and rounded |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | small inventory slot with a gold pixel check / dot; gold edge on hover |
| `DefaultControls/Slider.xaml`, `ProgressBar.xaml` | character creation slider (black-edged bar, white block marker, gold fill); gold loading bar |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | slim `UIScrollbar`: dark rounded track, pale thumb at 85%, full on hover |
| `DefaultControls/TabControl.xaml` | character creation category buttons |
| `DefaultControls/GroupBox.xaml` | bold title over a 2px separator, no card |
| `DefaultControls/ListBox.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml` | list items: panel blue on hover, hover blue + gold text when selected (+ 3px gold bar in the game list) |
| `DerivedStyles/GridViewItemStyle.xaml` | inventory slot: 2px black edge, hover blue edge, 3px gold edge when selected |
| `DerivedStyles/PropertyItemButton.xaml` | gold links; chips as small black-edged panels |

## Deviations

- **No textures.** The game's 9-slice panel, slot and scroll bar textures become flat fills with a 2px edge and 6px corners.
- **Menu word scaling.** The game grows a hovered word from 0.8 to 1.0; here words keep their size so the bar does not shift.
- **Fonts.** Andy Bold is not bundled; Segoe UI Black / Segoe UI stand in. Playnite also applies the user's font setting over `FontFamily`.
- **Sky.** The animated parallax sky is a static night gradient.
- **Outline** is drawn with offset copies, so very long names cost five text layouts; used only for short headline text.

## Not verified yet

Nothing has been seen running in Playnite yet (built and statically checked in a cloud session). To check on Windows: everything in the shared first-run list, plus the outline alignment at 100%/150% DPI, Andy fallback, the pixel icons' crispness at non-100% DPI, and the sky gradient behind the details view.

## Preview and screenshots

`art/preview-grid.html` (written by `art/preview-grid.py`) is an approximate HTML replica of the grid view with this theme's token values, sizes and icons (fonts stand in), rendered to `art/preview-grid.png` with `node scripts/render-theme-preview.mjs src/themes/Biome/art/preview-grid.html`. It is a mockup, not a Playnite capture. Real screenshots (`info/screenshots/`) come from `.\scripts\take-screenshots.ps1 -Extension biome` on a local Windows machine and are still to add before the release and the database PR.

## Regenerating art

`python3 src/themes/Biome/art/icons.py [--svg-dir <pixelarticons/svg>]` writes `art/icons.generated.xaml` (paste into `src/Media.xaml`), `art/mark.svg` and `src/Images/Pixel/*.png`. Then `python3 scripts/render-addon-icon.py --svg src/themes/Biome/art/mark.svg --extension biome` for the tile.
