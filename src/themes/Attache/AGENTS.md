# Attache — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the **Resident Evil 4 (2023) menus**: the main menu, the pause/load screen and the options screen. It focuses on the main-menu elements: a column of uppercase words, the brushed pewter selection plate, the glowing tab mark, warm greys on near black. It keeps the minimal look of the other themes here.

Unofficial fan theme. It is not affiliated with Capcom and includes no Capcom logos, fonts, textures or game files (`info/NOTICE-Attache.txt`). The colors were measured on screenshots. The smoke texture and the tile mark are original (`art/`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Options screen (tabs, rows, pewter plate, slider) | Language tab at 2560x1440, from caniplaythat.com, "Resident Evil 4 remake's approach to accessibility options" (2023-03-23). Colors measured with ImageMagick. |
| Pause / load screen (menu list, current item, amber dot, slots) | 1920x1080 capture from gameluster.com, "Resident Evil 4 Remake guide: unlock Professional mode / New Game+". |
| Main menu (word list at the left, scene behind, hint line) | Russian-language 720p YouTube thumbnail (OqUvWpAgdqs) and a low-res English frame. Layout only; no high-res English capture was found. |
| 2005 game | Title screen, attaché case and merchant thumbnails (residentevil.fandom.com, YouTube). Used for context only: the theme follows the remake. |
| Icons | Phosphor Icons, Light weight, `phosphor-icons/core` main, `assets/light` (MIT, `info/LICENSE-phosphor.txt`). |
| Smoke texture | `art/smoke.py` → `src/Images/smoke.png` (seeded value noise, white at low alpha). |
| Game pages | `art/gamepage.py` → `src/Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml`. Edit the script, not the XAML. |

What the screenshots show, and what the theme follows:
- **The menus use no red.** Red appears only in the logo. The palette is warm greys on near black.
- **Main and pause menu:** the current item has no bar. It turns near white, gets larger and steps about 20px to the left. Other items are warm grey (#aaa9a7). An amber dot (#ab854d) marks items with something new.
- **Options:** tabs are condensed uppercase words separated by 1px vertical rules. The current tab is #ccc7ba over a 2–3px line that fades out at both ends, with a soft light above it. Rows are separated by #232323 hairlines.
- **The current options row** sits on a brushed pewter plate: dark in the middle (#1f1f20), lighter toward the edges, a bright hairline along the top and bottom (#8d877d), smoky mottling, and soft ends.

## Tokens

`src/tokens.css` holds the measured values under this theme's own names.

| Token | Key | Used for |
|-------|-----|----------|
| `page` #050505 | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `ScrimBrush`, `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `TextColorDark` | Everything sits on near black |
| `scene` #10110f | `MainColorDark`, `PopupBackgroundColor`, `TooltipBackgroundBrush`, `ExpanderBackgroundBrush` | Popups, cards |
| `slot` #1d1d1b / `slot-hover` | `MainColor`, `ButtonBackgroundBrush`, `ListItemHoverBrush`, `PropertyItem*` / `HoverColor`, `ToggleButtonCheckedBackgroundBrush` | Buttons, chips, hovered rows |
| `hairline` #232323, `tab-divider`, `hairline-strong` | `WindowPanelSeparatorColor`, `PanelSeparatorColor`, `MenuSeparatorBrush`, `PopupBorderColor`, `NormalBorderBrush`, `InputBorderBrush`, `ButtonBorderBrush` | Rules, edges (`hairline-strong` lifts edges so inputs read on black) |
| `text-body` #ccc7ba | `TextColor`, `FocusBrush`, `ProgressBarForegroundBrush` | Values, descriptions |
| `text-idle` #7c7772 | `TextColorDarker`, `CheckBoxBorderBrush`, `InputHoverBorderBrush` | Labels at rest |
| `text-tab` #726d68 | `HeadingForegroundBrush` | Section captions, inactive tabs |
| `text-menu` #aaa9a7 / `text-menu-current` #faf9f4 | `SidebarItemForegroundBrush` / `SidebarItemSelectedForegroundBrush`, `PrimaryButtonForegroundBrush` | Main menu words |
| `text-current` #f4e9dc | `SelectedForegroundBrush` | Text on the plate |
| `plate-core` #1f1f20 / `plate-sheen` #4e4b47 / `plate-edge` #8d877d | `SelectedBrush`, `MenuItemHoverBrush`, `ButtonHoverBackgroundBrush`, `PrimaryButtonBackgroundBrush` / `SelectedSheenBrush` / `SelectedBorderBrush`, `PrimaryButtonBorderBrush`, `GridViewItemSelectedBorderBrush` | The pewter plate |
| `tab-line` #8d877d | `TabItemIndicatorBrush` | Tab mark, current toggle |
| `new-dot` #ab854d | `GlyphColor`, `WarningBrush`, `DataChangeNotifColor` | The only accent: checked boxes, links, the notifications dot |
| `completed` #96d397 / `speaker` #d4c24a / `herb-red` | `PositiveRatingBrush` / `MixedRatingBrush` (and the favorite star) / `NegativeRatingBrush` | Scores |
| `logo-red` #b0182a | `DangerBrush` | Close hover, exit and remove icons |

`GlyphColor` is amber, not the menus' warm white, so links and checked states stay distinguishable from body text.

Radii are 0 everywhere. Fonts: Segoe UI for body text; `HeadingFontFamily` is **Bahnschrift SemiCondensed** (it falls back to Bahnschrift, then Segoe UI). Bahnschrift is the condensed grotesque Windows ships, closest to the menus' Helvetica Condensed-like face. Section captions, tabs and the Play label use small caps (`Typography.Capitals`), because WPF has no `text-transform`. Sidebar words use Playnite's `StringToUpperCaseConverter`.

## Component spacing (`src/Common.xaml`)

| Key | Value | From |
|-----|-------|------|
| `ButtonPadding` | 18,8 | 34px controls |
| `InputPadding` | 10,7 | 34px |
| `MenuPadding` / `MenuItemPadding` | 0,6 / 16,8,24,8 | Rows run edge to edge, like the options list |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` / `ListBoxItemPadding` | 0,4 / 12,7 / 12,7 | |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 16 / 0,0,0,10 | |
| `TooltipPadding` | 12,7,12,8 | |
| `IconSize` | 18 | Thin Phosphor Light glyphs |
| `GameBannerHeight` / `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 360 / 300 / 260 | |

Shared templates in `Common.xaml`:
- `SelectionBarTemplate`: the pewter plate. It draws Background as the body, Foreground as the sheen toward the edges, BorderBrush as the edge hairlines, with the smoke texture on top and soft ends.
- `TabItemIndicatorTemplate`: the tab mark.
- `HeadingTextBlock`, `FocusVisual` (a 1px warm-white outline) and `SteamScreenshotsSkeletonTemplate`.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | **The main menu.** A 208px rail on `page` with a hairline toward the library. The main menu button sits in a 56px header, then a short rule. Items are words only (no icons): uppercase Bahnschrift at 16px in `text-menu`, in 44px rows. The current word turns `text-menu-current`, grows to 19px and steps 12px to the left. Hover brightens a word in place. Top and bottom are fallbacks: a 56px strip of words, with 148px kept clear for the caption buttons. |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | A 56px transparent strip over the library art with a hairline under it. The search box (underline only) is on the left; thin icons are on the right. The current view or open panel gets the tab mark. Notifications show an amber dot instead of a count. 148px is kept clear on the right. |
| `DerivedStyles/MainWindowStyle.xaml` | 44x32 caption buttons, 12px from the top. Close turns `logo-red`. |
| `Views/Library.xaml` | The background art sits behind the top strip and the library, anchored top right and faded toward the left and the bottom, under an 85% `ScrimBrush` veil (the title-screen scene). |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Black columns with a hairline edge and 16px gutters. |

## Game page

It follows the skeleton in `../AGENTS.md`. Differences:
- **Banner:** darkened by three scrims (35% overall, heavier at the left, heavier toward the title), like the menus' scenes.
- **Title:** small caps, in warm white.
- **Actions:** Play is the always-lit pewter plate; More and Edit are square buttons (44px in details, 40px in the grid panel).
- **Metadata pane:** no card. Group rules are hairlines.

## Components

| Playnite file | Menu element |
|---------------|--------------|
| Button, ToggleButton | Slot-grey plate with a hairline edge. On hover the pewter plate slides on. A toggle that is on gets a 2px warm line at its left. |
| PlayButton | The pewter plate, always lit, with the label in small caps |
| ListBox, ComboBox items, DetailsViewItemStyle, Menu, ContextMenu | Options-list rows. Hover lifts the row to slot grey; the current or highlighted row gets the pewter plate. |
| TabControl | Options tabs with vertical rules and the tab mark. With the strip on the left (Settings), the tabs become plate rows. |
| Slider | A hairline with a 2x14 tick as the thumb, as in the options sliders. The part before the thumb is a lighter hairline. |
| ScrollViewer | The save list's thin scroll bar: a 2px line that widens on hover. |
| CheckBox, RadioButton | Warm-grey hairline. Checked fills with amber and shows a black check. |
| GridViewItemStyle | Bare covers. Hover draws a 1px warm-grey outline; selected draws a 2px `plate-edge` outline. |
| PropertyItemButton | Plain warm text, underlined on hover. Chips are square, slot grey with a hairline edge. |
| SearchBox, TextBox, PasswordBox, HighlightBorder | Black inputs with hairline edges (the search box has a bottom line only). The edge turns warm white while typing. |

## Deviations

- **No mottled metal art.** The plate is built from gradients plus a generated smoke texture, not the game's texture.
- **Fonts and type:** the menus' fonts are not published. Bahnschrift and Segoe UI stand in for them. WPF has no letter spacing.
- **Game page sizes:** the game page and grid sizes are this theme's own. The menus have no library or game page.
- **Amber accent:** `GlyphColor` (amber) also drives Playnite's unrestyled views wherever they use the accent.
- **No hint line or key prompts:** the menus' centered description line and key prompts have no Playnite equivalent and are left out.

## Not verified yet

Not yet checked in Playnite (built and statically checked in a cloud session only):
- `Bahnschrift SemiCondensed` resolves in WPF on Windows 10/11. Otherwise the fallback to Bahnschrift applies.
- `ThemeFile 'Images/smoke.png'` loads inside the `ImageBrush` in `SelectionBarTemplate`.
- Small caps render with Bahnschrift.
- The look of the sidebar step-out with long add-on titles.
