# Payload — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the **Overwatch 2** menus (Blizzard Entertainment, 2022 to 2025 interface; the February 2026 relaunch reworked the lobby and is not modeled). The game's menus are light: a blue-grey gradient behind white plates. Payload is the dark side of the same system. The career profile's navy tab bar and stat tiles become the shell. Selection is the game's solid cyan fill with black text. The call to action is the OW2 orange, slanted 15 degrees like the VS-screen plates. Headings use the oblique display face, and scores take the team colors.

**Unofficial fan theme.** No Blizzard assets. The tile mark (a slanted plate with a forward chevron) and the slanted plates are original. The icons are Google's Material Symbols. The game's display face (BigNoodleTooOblique) and menu face (Config) are not shipped. The theme names them first and falls back to Bahnschrift, then Impact and Segoe UI. Overwatch is a trademark of Blizzard Entertainment.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens (`src/tokens.css`)

`ow-color-*` are Blizzard's tokens verbatim. `ow-*` are sampled from captures or derived (marked in the file).

| Token | Key | Used for |
|-------|-----|----------|
| `ow-color-neutral-dark-blue` 0e1425 | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `ScrimBrush`, `InputBackgroundBrush`, `TooltipBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `TopPanelSearchBoxBackgroundBrush` | Page, wells, tooltip |
| `ow-color-neutral-medium-blue` 1d253a | `MainColorDark` (`NormalBrushDark`), `PopupBackgroundColor` | Popups, side panels, metadata stat panel |
| `ow-tab-bar` 191d2f | `ShellBackgroundBrush`, `TopPanelBackgroundBrush` (70%), `BackgroundToneColor`, `InputHoverBackgroundBrush` | Rail, top bar |
| `ow-item` 363c4a | `MainColor`, `ButtonBackgroundBrush` | Buttons, group box header strip |
| `ow-header` 4f5864 / `ow-tile` 323a4b | `ButtonHoverBackgroundBrush`, `PropertyItemHoverBackgroundBrush` / `ButtonPressedBackgroundBrush`, `ExpanderBackgroundBrush`, `PropertyItemBackgroundBrush` | Hover, pressed, cards, chips |
| `ow-band` 3b486d | `MenuItemHoverBrush`, `ScrollBarThumbBrush`, `ThumbBrush` | Menu highlight, thumbs |
| `ow-cyan` 1defef | `GlyphColor`, `SelectedBrush`, `TopPanelItemCheckedBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `TabItemIndicatorBrush`, `FocusBrush`, `SliderThumbHoverBorderBrush` | Selection, checks, focus |
| `ow-cyan-wash` 12485a | `ListItemSelectedBrush` | Selected list rows (plus a 3px cyan edge) |
| `ow-on-accent` 0e1425 | `TextColorDark`, `SidebarItemSelectedForegroundBrush` | Black text on cyan |
| `ow-text` e5ebf4 / `ow-text-muted` a1aec5 | `TextColor`, `SelectedForegroundBrush`, `ButtonForegroundBrush`, `HeadingForegroundBrush` / `TextColorDarker`, `SidebarItemForegroundBrush`, `CheckBoxBorderBrush`, `ButtonBorderBrush` | Text ramp |
| `ow-color-orange-150` ed6516 / `-100` ff7926 / `ow2-…-orange-150` c04e0c | `PrimaryButton*`, `MainMenuButtonBackgroundBrush`, `ProgressBarForegroundBrush`, `SliderHoverForegroundBrush` | Play, main menu, progress, slider fill, heading rule tips |
| `ow-color-neutral-light-blue` 33528f | `NormalBorderBrush`, `InputBorderBrush`, `InputUnderlineBrush` | Control edges |
| `ow-edge` 2c3550 | `PopupBorderColor`, `WindowPanelSeparatorColor`, `PanelSeparatorColor`, `TopPanelSeparatorBrush`, `MenuSeparatorBrush` | Hairlines |
| `ow-color-neutral-navy` 1b1f4f | `ArtTintBrush` | Wash over library and banner art |
| `ow-ally` / `ow-color-yellow-100` / `ow-enemy` | `PositiveRatingBrush` / `MixedRatingBrush`, `WarningBrush` / `NegativeRatingBrush`, `DangerBrush` | Scores, warnings, close hover |
| `ow-glow` ff943c | `GridViewItemSelectedBorderBrush` | Selected cover frame |

Radii: `CornerRadiusSmall` and `ControlCornerRadius` 2, `Large` 4, `XLarge` 6, `Full` 9999 (only for 1:1 marks). `FrameThickness` 2. Fonts: `FontFamily` "Config, Bahnschrift, Segoe UI"; `HeadingFontFamily` "BigNoodleTooOblique, …, Bahnschrift SemiBold Condensed, Bahnschrift, Impact". Hosts set `FontStyle="Oblique"` on display text.

## Component spacing (`src/Common.xaml`)

1080p capture sizes scaled by 2/3: `ButtonPadding` 18,8 (36 tall), `InputPadding` 10,7 (34), menu and dropdown rows 30, `ListBoxItemPadding` 10,6 (32), `GroupBoxPadding` 12,10,12,12 with a 12,6 header band, `GroupBoxHeaderFontSize` 20, `IconSize` 18, `GameBannerHeight` 360, `GameDetailsPaneWidth` 320, `GridDetailsPaneWidth` 270.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px tab-bar navy rail with a 1px edge. The main menu button is an orange 32 x 28 parallelogram (glyph counter-skewed upright) in a 44 x 56 cell. Items are 44 x 40, 16px glyphs in blue-grey. The current item is a cyan slanted plate with a black glyph and a short orange tick below it. |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 56px bar in tab-bar navy at 70% with a 1px rule. The search field is a dark well with a light blue edge. Glyph buttons show a faint slanted plate on hover and the cyan slanted plate when toggled. The notification count is an orange pip. |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | Flat window buttons. Hover uses the header strip, and close hovers enemy red. |
| `Views/Library.xaml` | Library art under the site's navy wash (45%), the page blue (45%) and a vignette. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Medium blue side panels. Filter labels use the oblique display face. |

## Game page

Skeleton and metadata pane follow `../AGENTS.md`: Steam screenshots sit in the left column above the description, and the banner spacer scales with `HeroArt` through `MathConverter` (110/360 details, 76/360 grid). Differences from the skeleton:

- **Banner:** it gets the navy wash (`ArtTintBrush` at 40%) before the fade.
- **Title:** the oblique display face in white, like a hero name.
- **Section headings:** the oblique display face over a 2px hairline whose first 40px are orange.
- **Metadata pane:** a stat panel (medium blue, 1px hairline, 2px corners, 16px padding).
- **Play:** the slanted orange plate.

## Components

| Playnite file | Overwatch 2 element |
|---------------|---------------------|
| Button, ToggleButton, RepeatButton, GridTileButton | Menu button plate (363c4a); a checked toggle is the cyan tab fill; a default button is orange |
| TextBox, PasswordBox, SearchBox, ComboBox | Dark well with a 1px light-blue edge that turns cyan on focus |
| ListBox, DetailsViewItemStyle | Career profile list: cyan wash with a 3px cyan edge |
| Menu, ComboBoxItem | Dropdown panel: profile band highlight, cyan check |
| CheckBox, RadioButton | Square with 2px corners or a ring; checked is cyan with a black tick |
| Slider | 4px rail with an orange fill; the thumb is an 8 x 18 light slanted plate |
| ProgressBar | Battle Pass bar: orange on a navy rail, 6px |
| ScrollViewer | 6px band-blue thumb, no visible track |
| TabControl | Profile tab bar: bold labels; the current tab is a cyan fill with black text |
| GroupBox | Collapsible profile section: header strip with an orange tick, then a framed body |
| GridViewItemStyle | Hero gallery card: off-white frame on hover, orange glow color when selected |
| PlayButton | PLAY: orange plate slanted 15 degrees |
| PropertyItemButton | Links turn cyan; chips are stat-tile plates |

## Deviations

- **Dark, not light:** the game's menus are light. Payload carries the career profile's dark bands across the whole window. The light f4f5f8 plate only survives as the slider thumb.
- **Dark dropdowns:** OW2 dropdowns are light with black text, but here they are dark wells. Playnite's unrestyled filter boxes and grids read `TextBrush` (light), and a light field would leave their text unreadable.
- **Selected list rows:** these use a cyan wash plus an edge instead of the game's solid cyan, so long multi-select lists stay readable. Tabs, the rail and the top bar keep the solid fill.
- **Slant:** the 15-degree slant comes from OW1-era VS plates, which OW2 still uses on its VS and hero-select screens. The OW2 menus themselves are rectangular.
- **No uppercase:** WPF has no text-transform. Display text is uppercase only when BigNoodleTooOblique (caps-only) is installed; the Bahnschrift fallback shows mixed case, made oblique by `FontStyle`.
- **Unverified controls:** see Sources. No settings-menu capture was available.

## Previews

`art/preview-details.html` and `art/preview-settings.html` are HTML replicas (same tokens, sizes, icons and shell), rendered to `art/screenshot-details.png` and `art/screenshot-settings.png` by `.\scripts\take-screenshots.ps1 -Extension payload`. Barlow and Barlow Condensed italic (Google Fonts) stand in for Config and BigNoodleTooOblique. They are not Playnite captures.

## Not verified yet

- Nothing has been checked in a real Playnite. Build and validation pass, but the theme was built on Linux with no Windows available.
- The skewed plates: overhang clipping inside the 40px top bar items and the 44px rail, and the counter-skewed main menu glyph.
- The Material Symbols 960 grid (negative y origin) shifted with `Canvas.Top` in `IconTemplate`.
- `Bahnschrift SemiBold Condensed` resolving as a WPF family name on Windows 10/11, and synthetic oblique on it.
- Sidebar at Right, Top and Bottom.
