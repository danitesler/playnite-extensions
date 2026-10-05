# Ace — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.60 Default files) in the style of **Counter-Strike 1.6's VGUI menus** and the Steam / GoldSrc olive skin of the same era. One dark variant. Unofficial fan theme: no Valve assets, original pixel icons and mark (`info/NOTICE-Ace.txt`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

[`RESEARCH.md`](RESEARCH.md): `ClientScheme.res` values (read from a published copy), HUD color, fonts, border construction. The seven Steam olive values are from memory and flagged unverified there.

## Tokens

Two tones, as the game shipped it: **olive Steam chrome** (frame, rail, top bar, buttons, scroll bars, tabs, dialog title bands) around **black panels with amber text** (lists, inputs, game page, menus). Scheme alpha colors are stored flattened onto the dark map haze.

| Token | Key | Used for |
|-------|-----|----------|
| `--cs-base-text` `#FFB000` | `TextColor`, `GlyphColor`, `FocusBrush`, `SidebarItemSelectedForegroundBrush` | amber text, accent, focus, current sidebar glyph |
| `--cs-dim-text` `#B3AC9F` | `TextColorDarker` | captions, secondary text |
| `--cs-void` `#080906` | `TextColorDark`, `PrimaryButtonForegroundBrush`, `ScrimBrush` | black ink on amber, scrims |
| `--steam-olive` `#4C5844` | `MainColor`, `ButtonBackgroundBrush`, `TopPanelBackgroundBrush`, `ScrollBarThumbBrush`, `WindowTitleBackgroundBrush` | olive body |
| `--steam-olive-dark` `#3E4637` | `ShellBackgroundBrush`, `ButtonPressedBackgroundBrush` | rail, pressed |
| `--steam-olive-deep` / `-light` | `BevelShadowBrush` / `BevelLightBrush` | 1px bevel edges |
| `--steam-olive-hover` | `HoverColor`, `ButtonHoverBackgroundBrush` | hover |
| `--steam-olive-text` | `ButtonForegroundBrush`, `SidebarItemForegroundBrush` | pale text on olive |
| `--steam-olive-gold` | `HeadingForegroundBrush` | headings, selected tab |
| `--cs-window-bg` `#0F100B` | `MainColorDark`, `WindowBackgourndBrush`, `PopupBackgroundColor`, `ContentBackgroundBrush` | content and popups |
| `--cs-list-bg` `#070805` | `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush` | sunken fields |
| `--cs-control-dark` | `ExpanderBackgroundBrush`, `ScrollBarTrackBrush` | cards, tracks |
| `--cs-selection` / `-soft` | `SelectedBrush`, `MenuItemHoverBrush` / `ListItemHoverBrush` | buy-menu pale bar (white text) / hover |
| `--cs-hud` `#FFA000` | `ProgressBarForegroundBrush` | HUD amber fills |
| `--cs-team-t` / `--cs-team-ct` | `DangerBrush`, `NegativeRatingBrush` | T red; CT blue is available, unused |

Radii: the whole scale (`ControlCornerRadius`, `CornerRadiusSmall`..`Full`) is **0**, so nothing can become an oval. Fonts: **Verdana** (the scheme's face), sizes 11 / 12 / 14 / 18 / 24, headings bold. No fonts are bundled.

## Component spacing (`src/Common.xaml`)

| Key | Value | From |
|-----|-------|------|
| `ButtonPadding` | `14,4.5` | 24px VGUI button |
| `InputPadding` | `6,3.5` | 22px field |
| `MenuItemPadding` | `8,3.5,14,3.5` | 22px buy-menu rows |
| `GroupBoxPadding` | `10,8,10,10` | etched frame |
| `IconSize` | 16 | compact rail glyphs |
| `GameBannerHeight` | 320 | spacer scaled `x * 180 / 320` (details), `x * 90 / 320` (grid) |

`BevelTemplate` (raised) and `BevelInsetTemplate` (sunken, added to `theme-keys.json` for this theme) draw the VGUI 1px bevel behind a control.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px olive-dark rail, raised edge; 44x40 items with 16px glyphs (no `IconPadding`); current item a sunken plate with an amber glyph |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 40px olive strip, 28px bevelled buttons, 260x24 sunken search box; Default order, all left; 110px kept clear for window buttons |
| `Views/MainWindow.xaml`, `DerivedStyles/MainWindowStyle.xaml` | black content layer; 26x22 bevelled caption buttons, close hover `DangerBrush` |
| `DerivedStyles/StandardWindowStyle.xaml` | dialogs: 25px olive title band, black body, raised 1px frame |

## Game page

Skeleton as in `../AGENTS.md`. Black page, amber bold title, gold captions over 1px rules, black metadata box with a 1px edge, dim beige captions and amber values. Grid panel has no `PART_ElemRecentActivity` (the Default grid file has none). Link color in descriptions is gold (`Tag`), because the accent equals the text color.

## Components

| Playnite file | Ace component |
|---------------|------------------|
| `Button`, `RepeatButton`, `ToggleButton` | olive bevelled button, pressed = sunken, checked toggle = sunken |
| `TextBox`, `PasswordBox`, `ComboBox`, `HighlightBorder` | sunken black field, edge turns `FocusBrush` on keyboard focus |
| `CheckBox`, `RadioButton` | 13px sunken box, amber pixel check / dot |
| `Slider`, `ProgressBar` | 4px / 8px sunken track, HUD-amber fill, olive bevelled thumb |
| `ScrollViewer` | 12px track, olive bevelled thumb (no arrow buttons: Default has none) |
| `TabControl` | VGUI property sheet: raised selected tab, gold text, 2px amber line |
| `GroupBox` | etched 1px frame, gold bold title |
| `Menu`, `ContextMenu`, `ToolTip` | black popup with lit olive edge, pale selection bar; olive-deep tooltip |
| `PlayButton` | the only amber fill, black ink |
| `PropertyItemButton` | amber link; square chip when the list has `Tag="Chip"` |

## Previews

`art/preview-details.html` and `art/preview-settings.html` follow the XAML sizes above. Motifs drawn: bevelled olive chrome, amber-on-black panels with the pale selection bar, dotted focus rectangle, HUD-style amber numerals and crosshair on the banner, gold group titles. Stand-in fonts: Verdana and Tahoma are drawn with DejaVu Sans (`scripts/data/fonts.json`). Sample game and studio are fictional.

## Deviations

- WPF has no per-side border colors, so bevels are stacked 1px rectangles (`BevelTemplate`), not borders.
- Selected-but-unfocused list rows are not dimmed (`Selector.IsSelectionActive` is not used by any Default file).
- Scheme translucency (`WindowBG` alpha 227) is flattened to opaque brushes; popups do not show the game behind them.
- Radio buttons are true circles (1:1); everything else is square.

## Not verified yet

- **Nothing has been loaded in Playnite.** The theme was built and validated on Linux (`build-theme.ps1`, `validate-extension.ps1`), which checks keys and XML but not property names or runtime behavior. First run needs the full list in `../AGENTS.md` plus: sidebar icon of an add-on is visible, dotted focus on buttons, caption buttons hover, ThemeModifier recolors.
- Steam olive digits (`RESEARCH.md`) are from memory.
- `SelectionBrush` / `SelectionOpacity` on text inputs are standard `TextBoxBase` members but are not in any Default file: if Playnite logs `unknown member`, drop them.
