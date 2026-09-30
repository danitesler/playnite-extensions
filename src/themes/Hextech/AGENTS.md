# Hextech — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) inspired by the **League of Legends client**: near-black blue surfaces, dark-gold one pixel edges, cream headings, gold-tan interactive text, and hextech blue kept for the Play button and keyboard focus. Square corners throughout. Unofficial: not affiliated with Riot Games, no Riot logos, fonts or artwork.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

**Scope.** This first version restyles the main window shell and the controls around it (navigation, toolbar, buttons, inputs, menus, sliders, scroll bars, tooltips, Play button). The library list and the game page are **Playnite's Default files read through this theme's palette** (gold selection bar and text, cream/grey text); they have not been restyled yet.

## Sources

Riot publishes no design system, so there is no pinned spec. The Riot sites (technology.riotgames.com, nexus, the wiki) were blocked from the build environment, so nothing was sampled from the client or read from Riot's own write-ups.

| What | Where |
|------|-------|
| Palette | Values as they circulate in community client UI kits and Pengu Loader themes (search results and repo READMEs, not Riot): gold `#C8AA6E` `#C89B3C` `#785A28` `#463714`, hextech blue `#0AC8B9` `#0397AB` `#005A82` `#0A323C`, `#A09B8C`, `#1E2328`, text `#F0E6D2` `#CDBE91`. The near-black surfaces (`hx-void`, `hx-page`, `hx-card`) and status colors are chosen by eye. Marked "kit" or "eye" in `src/tokens.css`. |
| Design language | Public descriptions of the client's Hextech UI: blue "Hextech Magic" buttons only for actions on the game itself, gold for everything else (navigation, secondary actions, modals). |
| Icons | Phosphor Icons 2.1.1, Regular (MIT, `info/LICENSE-phosphor.txt`), npm `@phosphor-icons/core`. The hexagon mark (`IconMainMenu`) is original. |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`), each shipped file restyled from its Default copy. |

## Tokens

| Token | Value | Key | Used for |
|-------|-------|-----|----------|
| `hx-void` | `#010a13` | `ShellBackgroundBrush`, `PopupBackgroundBrush`, `TooltipBackgroundBrush`, `InputBackgroundBrush`, `TextColorDark`, `CheckBoxCheckMarkBkBrush` | window frame, nav bar, popups, input wells |
| `hx-page` | `#050d15` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `TopPanelBackgroundBrush` | library, game page, toolbar |
| `hx-card` / `-hover` / `-active` | `#0a141d` / `#14202a` / `#1e282d` | `MainColorDark`, `ExpanderBackgroundBrush` / `HoverBrush`, `ListItemHoverBrush` / `MenuItemHoverBrush`, `TopPanelItemHoverBackgroundBrush`, `SliderTrackBrush` | game list, cards, hover, rails |
| `hx-button` / `-hover` / `-pressed` | `#1e2328` / `#2b3238` / `#0a0f14` | `ButtonBackgroundBrush` (`MainColor`) / `ButtonHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` | flat buttons |
| `hx-gold-6` / `-5` / `-3` | `#463714` / `#785a28` / `#c8aa6e` | `NormalBorderBrush`, `InputBorderBrush`, `PopupBorderBrush`, `ButtonBorderBrush`, `ScrollBarThumbBrush` / `InputHoverBorderBrush`, `CheckBoxBorderBrush`, `ScrollBarThumbHoverBrush`, `GridViewItemHoverBorderBrush` / `GlyphBrush`, `MainMenuButtonForegroundBrush`, `TabItemIndicatorBrush`, `SliderThumbBackgroundBrush` | edges at rest, hovered edges, accent |
| `hx-gold-7` | `#32281e` | `WindowPanelSeparatorBrush`, `MenuSeparatorBrush`, `SelectedBrush`, `ListItemSelectedBrush`, `TopPanelItemCheckedBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush` | dividers, selected and toggled-on fills |
| `hx-gold-2` / `-1` | `#cdbe91` / `#f0e6d2` | `ButtonForegroundBrush`, `PropertyItemForegroundBrush` / `TextBrush`, `TooltipForegroundBrush`, `SelectedForegroundBrush` | interactive text, headings and hovered text |
| `hx-text-muted` | `#a09b8c` | `TextBrushDarker` | secondary text, resting nav tabs and toolbar icons |
| `hx-blue-4` / `-3` / `-5` / `-1` / `-hi` | `#0a323c` / `#005a82` / `#091428` / `#0ac8b9` / `#cdfafa` | `PrimaryButtonBackgroundBrush` / `…HoverBackgroundBrush` / `…PressedBackgroundBrush` / `PrimaryButtonBorderBrush` (new shared key), `FocusBrush`, `ProgressBarForegroundBrush` / `PrimaryButtonForegroundBrush` | Play button, keyboard focus, progress |
| `hx-red`, `hx-red-deep`, `hx-amber`, `hx-green` | `#e84057`, `#a72939`, `#c89b3c`, `#0ace83` | `WarningBrush`, `NegativeRatingBrush` / `DangerBrush` / `DataChangeNotifBrush`, `MixedRatingBrush` / `PositiveRatingBrush` | status |

Radii: 0 (`ControlCornerRadius`, `CornerRadiusSmall`), 2 (`CornerRadiusLarge`), pill for the notification badge. Fonts: Segoe UI body at 12 / 14 / 15 / 20 / 30; **Palatino Linotype** (`HeadingFontFamily`) for nav tabs, the game title and Play, the closest serif Windows ships to the client's Beaufort. Neither client font is bundled.

## Component spacing (`src/Common.xaml`)

| Key | Value | Notes |
|-----|-------|-------|
| `ButtonPadding` | 18,7 | 34px buttons |
| `InputPadding` | 10,7 | 34px inputs; the search box is 32px |
| `MenuPadding`, `ComboBoxDropDownPadding` | 2 | popup surface |
| `MenuItemPadding`, `ComboBoxItemPadding`, `ListBoxItemPadding` | 14,7 / 12,7 / 12,7 | |
| `GroupBoxPadding` | 16 | |
| `TooltipPadding` | 10,6 | |
| `IconSize` | 20 | toolbar icons |

## Shell

| File | Behavior |
|------|----------|
| `Views/MainWindow.xaml` | The sidebar is **always docked to the top**, whatever the Sidebar position setting says: the client's navigation is a top bar. |
| `Views/Sidebar.xaml` | The nav bar: 56px, `ShellBackgroundBrush`, the hexagon button (`PART_ElemMainMenu`, opens the main menu) at the left, one tab per sidebar item, and a hairline of dark gold under it that fades out toward both ends (`OpacityMask`). 150px clear on the right for the window buttons. |
| `CustomControls/SidebarItem.xaml` | Icon and title (`SideItem.Title`) side by side, Palatino bold 15px. Grey at rest, cream on hover, cream with a 2px gold bar under it when current. |
| `DerivedStyles/MainWindowStyle.xaml` | Caption height 56 (the nav bar drags the window). Window buttons sit in the nav bar's top right: 46x40, thin icons, cool grey on hover, red on close. |
| `Views/TopPanel.xaml` | Toolbar under the nav bar: 48px, page color, dark-gold rule. Search (300px), view controls, filter toggle, notifications (red badge), plugin items, global progress. The hexagon button is repeated here only when Playnite shows it (sidebar hidden). |
| `CustomControls/TopPanelItem.xaml` | Flat 36px buttons: grey icon, cream on hover with a cool-grey fill, gold on a dark-gold wash when toggled. |
| `CustomControls/SearchBox.xaml` | Near-black well with a 1px dark-gold edge; brighter gold on hover, full gold while typing. `TopPanelSearchBox` is the same box on the toolbar. |

## Components

| Playnite file | Client component |
|---------------|------------------|
| `DefaultControls/Button.xaml`, `ToggleButton.xaml` | Flat button: grey fill, dark-gold edge, gold-tan text; hover gold edge and cream text; pressed near-black; toggled on = gold edge and text on a dark-gold wash |
| `DerivedStyles/PlayButton.xaml` | Hextech Magic button: deep teal fill, 1px `#0ac8b9` edge, fainter inner line, serif bold label |
| `DefaultControls/TextBox.xaml` | Near-black well, dark-gold edge, gold on hover and focus (`BareTextBox` for hosts that draw their own frame) |
| `DefaultControls/Menu.xaml`, `ContextMenu.xaml` | Near-black panel, dark-gold edge, gold-tan text turning cream on the hovered (cool grey) row, gold check |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | 2px cool-grey rail, gold fill, gold diamond thumb |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | 6px dark-gold thumb, gold when hovered or dragged, no arrows |
| `DefaultControls/ToolTip.xaml` | Near-black tooltip with a dark-gold edge and cream text |

Everything else (combo boxes, check boxes, tabs, group boxes, list, game page) is Playnite's Default look with this theme's palette.

## Deviations from the client

- **No client artwork or fonts.** The client's gold-gradient frames, hextech glow, animated backgrounds and Beaufort/Spiegel fonts are not reproduced. Edges are flat 1px lines.
- **Nav labels are mixed case.** The client uses capitals; WPF has no text-transform, so titles show as Playnite gives them.
- **Game list and page are not restyled yet** (see Scope).
- **Colors are approximations** (see Sources).

## Not verified yet

Built and statically checked on Linux (`build-theme.ps1` under PowerShell 7). **Never loaded in Playnite**: no WPF or Windows here, so the XAML has not been compiled against the WPF assemblies and there is no real screenshot. Check first: the nav bar (tabs, underline, hairline mask, window buttons reachable), the hexagon button opening the main menu, `SideItem.Title` showing on every tab, the two SidebarLibrary/Statistics icon `ContentControl`s in `Media.xaml`, menus and slider thumb, then the standard first-run list in `../AGENTS.md`.
