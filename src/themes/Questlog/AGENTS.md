# Questlog — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) named Questlog, taking inspiration from the **World of Warcraft Classic interface**: neutral charcoal panels in a thin metal frame, deep red panel buttons with gold text, gold labels and white values, charcoal plates for dropdowns and icon buttons, and a gold glow under the current entry. The Settings window is modeled on a client options panel; the game page uses the info panels of the character screens.

Fan-made and unofficial: **no game files are included**. Every icon, texture and placeholder is original artwork drawn for this theme (`art/`), and the client font is not bundled (see Tokens). `info/NOTICE-Questlog.txt` ships in the package.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference captures, per-pixel measurements, design rules and motion notes are in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Keys are the shared vocabulary; the template names the token behind each one. The roles that matter:

| Role | Key | Token |
|------|-----|-------|
| Accent, labels, glyphs | `GlyphBrush`, `ButtonForegroundBrush` | `NORMAL_FONT_COLOR` (gold) |
| Text, values | `TextBrush` | `HIGHLIGHT_FONT_COLOR` (white) |
| Panel body | `WindowBackgourndBrush` | `PANEL_BG` |
| Library and game page layer | `ContentBackgroundBrush` | `PANEL_BG_DEEP` |
| Rail, sunken bands | `ShellBackgroundBrush`, `NormalBrushDark` | `PANEL_BAND` |
| Title strip | `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush` | `TITLE_BAR_*` gradient |
| Frame line, black line inside it | `FrameBrush`, `FrameInnerBrush` | `FRAME_METAL_*`, `FRAME_INK` |
| Red button face | `ButtonBackgroundBrush`, `PrimaryButtonBackgroundBrush` (brighter) | `BUTTON_RED_*` gradients |
| Button bezel | `ButtonBorderBrush` | `BUTTON_BEZEL` |
| Charcoal plate | `SecondaryButton*Brush`, `BevelLightBrush`, `BevelShadowBrush` | `PLATE_*` |
| Selection glow and hairline | `ListItemSelectedBrush`, `SelectedBorderBrush` | `NORMAL_FONT_COLOR` at 2 to 24 percent, `SELECT_LINE` |
| Popups, info panels | `PopupBackgroundBrush`, `TooltipBackgroundBrush`, `PopupBorderBrush` | `TOOLTIP_BACKDROP`, `TOOLTIP_BORDER` |
| Filter and notification mark | `DataChangeNotifBrush` | `NEW_FLAG_COLOR` (blue, reads against gold glyphs) |

Gradient keys (button faces, plates, title strip, knobs, selection glow) are `LinearGradientBrush`; ThemeModifier's solid-color editor does not recolor those stops.

Font: `FONT_FAMILY` = `Friz Quadrata TT, Constantia, Palatino Linotype, Georgia, Segoe UI`. Sizes 13 / 15 / 17 / 20 / 31.

The game title and all game-page section headings (Steam screenshots, Description, Details and Notes) use `HeadingFontFamily` = `Georgia, Palatino Linotype, Segoe UI` at semibold weight. Section headings all use FontSizeLarger (20px). Buttons and the dialog title use the body face.

Radii: 2 / 3 / 5. `FrameThickness` is 1 (the frame is three 1px lines: black, metal, black).

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | Behavior |
|------|----------|
| `DerivedStyles/MainWindowStyle.xaml` | The window frame is black, metal (`FrameBrush`), black, 1px each. `MainWindowButton`: the frame's red plates, 28x24 with 12px gold glyphs, centred on the top bar; hover lights the face and whitens the glyph, close goes to `DangerBrush`. |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Dialogs: the same frame and a 36px title strip (`WindowTitleBackgroundBrush`) closed by black, metal, black. The title sits in the middle in gold, body face, between two gold diamonds with a short fading rule each (the signature graphic, vectors in theme brushes). Caption buttons are the same red plates. The Settings window is titled through `LOCSettingsLabel`; content starts 36px down. |
| `Views/Sidebar.xaml` | The 44px compact rail: a sunken black band (`ShellBackgroundBrush`) closed toward the library by a hairline, all four positions. `MainMenuButton`: a bare gold hamburger that takes the charcoal plate on hover (36x32 on the rail, 32px in the top bar). |
| `CustomControls/SidebarItem.xaml` | 44x40 items with a 36x32 slot and 16px glyphs. Hover is the charcoal plate with a white glyph; the current item is a checked slot, gold glow inside a gold line with a white glyph. Library is the tome, Statistics the hourglass. `PART_ProgressStatus` overlays a translucent gold fill. |
| `Views/TopPanel.xaml` | The title strip of a frame: 48px warm dark band closed by black, metal, black. `TopPanelSearchBox`: a 280x30 edit box with a magnifier. View controls and toggles are 30px gold glyphs (`TopPanelItem.xaml`): charcoal plate on hover, a sunken black slot in a gold line while on. The filter mark is a 9px blue diamond. Notifications are a letter with a red count. The global progress bar is the casting bar. The right 116px stay clear for the window buttons. |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | Plain sunken charcoal; 28px fields; the preset buttons are bare gold glyphs (bin, quill, plus). |

## Game page

`Views/DetailsViewGameOverview.xaml` (details view) and `GridViewGameOverview.xaml` (grid side panel) are **generated by `art/overview.py`**; change the page there. They keep Playnite's arrangement and every `PART_` name.

- **Banner**: no `OpacityMask` (it sits behind the animated Play button). A black scrim darkens it toward the title and a gradient fades it into the page color, read from `PageRoot`.
- **Title** in Georgia semibold at 31px, gold, with a two pixel shadow; icon and cover in item slots (hidden with the image).
- **Actions**: Play is the big red panel button with a gold label (`PlayButton`); More and Edit are 40x40 charcoal plates with gold glyphs (`SecondaryButton`).
- **Left**: Steam screenshots and the description in one info panel, the tooltip frame (near-black backdrop, a metal line, a black line inside it, radius 5), with gold headings over a faint rule and white text drawn by `DescriptionView.html`. The panel goes away when it has neither. The **notes are a letter** under it: ink on the tiled paper (`ParchmentBrush`, `parchment.png`) with a shaded rim.
- **Right**: the details panel, the same frame, 300px of content. Gold captions (132px column in the details view so "Completion Status" stays on one line; 2:3 columns in the grid panel), white values, scores in the item quality colors, tags as small black slots with a gray edge. Six groups split by space only.
- **Empty state** (both views): an empty item slot holding the quest mark (`IconUpdate`) under a slow gold glow (`glow-spot.png`), and `LOCErrorNoGameSelected`.
- `DescriptionView.html` carries its colors as literals (white text, gold links): the file is not a template.

**Settings chrome** (`DefaultControls/TreeView.xaml`): the category list of an options panel, 30px rows in the body face. Entries are gold; an entry with children is a header, white on a black band with a lit line under it. Hover is a faint gold glow with the underline at 45 percent. Selected is the gold glow, strongest in the middle, between two gold hairlines, with a white label. Dialog trees reserve the scroll lane.

## Components

| File | Client component |
|------|------------------|
| `Button.xaml`, `ToggleButton.xaml`, `RepeatButton.xaml` | Panel button: red face darkening into its rim, gray bezel, black line; gold label, white on hover. Checked toggle: sunken black in a gold line |
| `Button.xaml` `SecondaryButton` | Step arrow plate: charcoal, lit along the top |
| `ComboBox.xaml` | Dropdown: the plate with a gold value and the arrow in its own cell. Editable boxes and boxes in the filter panel are edit fields |
| `TextBox.xaml`, `PasswordBox.xaml`, `SearchBox.xaml` | Edit box: near-black, gray edge, gold on keyboard focus |
| `CheckBox.xaml`, `RadioButton.xaml` | Check button: 20px sunken bed, gold tick reaching past the box; round bed with a gold dot |
| `Slider.xaml` | Options slider: sunken groove, a gold thread up to the value, a gray diamond gem |
| `ScrollViewer.xaml` | Slim bar: 12px quiet lane, bare gray arrows, warm gray knob |
| `TabControl.xaml` | Frame tabs: dark plates with gold labels; the current one is the lit plate with a gold line and a white label |
| `GroupBox.xaml`, `Expander.xaml` | Category header: white title on a black band; content-sized card |
| `TreeView.xaml`, `DetailsViewItemStyle.xaml`, `ListBox.xaml`, `Menu.xaml` | Category list rows: gold entries, gold glow selection |
| `ToolTip.xaml`, `ContextMenu.xaml`, `Common.xaml` `PopupBorder` | Tooltip frame |
| `PlayButton.xaml` | The Login / Accept button |
| `GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Item slot highlight; 48px red Play and charcoal Info cover buttons |
| `ProgressBar.xaml` | Casting bar |
| Running game (`RunningIndicatorBrush` = `GREEN_FONT_COLOR`) | The channeling bar in `GREEN_FONT_COLOR`, as a real cast. **Launching** (1.9s loop, 1.5s travel, ease-in spline like the game's cast): the casting bar (56x7 on rows, across the cover's foot and the plate's foot, spark at its end) fills from empty while a long-tailed green fill with a hard leading edge (`RunningScan`, 0.9 tail) travels behind it across the row, cover (rising) or plate; the bar rests full for the last 0.4s, then the next cast starts. **Running:** the bar ebbs to 30% and refills (`SineEase`, 3.2s) with frame and tint breathing 0.72 to 1. Plate: channel-green plate under a faint `RunningBreath` layer (`ShellBackgroundBrush`, the theme has no `ScrimBrush`, 0.05-0.14), black label (12:1 worst); Cancel only on RUNNING + hover of the button (`Self`). |

## Deviations from the client

- **No game assets, no client font.** Icons and textures are original; Friz Quadrata is not shipped.
- **Playnite's font setting wins.** Settings > Appearance > Font replaces the `FontFamily` and `FontSize*` keys at startup, so the UI is drawn in whatever the user picked there (seen live: a sans face at 14px), not in the theme's serif stack. For the client look, pick Friz Quadrata, Constantia or Palatino Linotype there. `DescriptionView.html` takes the same font from Playnite's `{font_family}` placeholder, so the description matches the window. The game title and panel headings set `HeadingFontFamily` themselves.
- **Measured colors, drawn shapes.** Colors are sampled from captures (see `RESEARCH.md`); the frame, bezels and plates are drawn with borders and gradients, not the client's textures, so they are flatter than the art.
- **Labels on Settings pages are white**, not gold: Playnite draws them as plain `TextBlock`s in `TextBrush`, and the theme does not restyle those views.
- **Shadows**: text shadows are `DropShadowEffect` (blur 0) on button labels, the progress text and the game title only. No shadows on popups or tiles (repo rule).
- **The slider shows its value** with a thin gold thread; the client's does not fill.
- **Gradients** are used where the art is a gradient; ThemeModifier's solid-color editor cannot recolor them.
- **Disabled buttons** restore `Opacity` to 1 (BaseStyle dims to 0.5) because the gray face is the disabled look.
- **Disabled and unsupported**: menu icons Playnite copies stay PNG paths (Playnite rebuilds glyph resources from text); no fullscreen theme.
- Window buttons use the icons of `Media.xaml`, not Marlett glyphs; Playnite still sets the content to `0`, `1`, `2`, `r` and the templates read it.

## Art

```text
python art/overview.py           # src/Views/DetailsViewGameOverview.xaml, GridViewGameOverview.xaml
python art/glyphs.py media       # rewrite the glyph block in src/Media.xaml
python art/glyphs.py preview     # art/glyphs-preview.html
python art/menu_icons.py png     # src/Images/Menu/*.png, questionmark.png, cover.png (Node + Chromium, Pillow)
python art/menu_icons.py sheet   # art/menu-sheet.html
python art/parchment.py          # src/Images/parchment.png
python art/fx.py                 # src/Images/fx/*.png (white masks), art/fx-sheet.png
python scripts/render-addon-icon.py --svg src/themes/Questlog/art/mark.svg --extension questlog   # info/icon.png
```

## Previews

`art/preview-details.html` and `art/preview-settings.html` replicate the current XAML (screenshots via `scripts/take-screenshots.ps1 -Extension questlog`). Icons are the `Media.xaml` geometries with the one pixel ink shadow of `IconTemplate`. Font stack `Friz Quadrata TT, Constantia, Palatino Linotype, Georgia, Segoe UI`: all drawn with the bundled Gelasio stand-in. Georgia in the game title and panel headings also uses Gelasio in previews.

Signature motifs: the three-line frame (black, metal, black) and the warm title strip with red frame buttons; the gold glow between two gold hairlines under the current entry (game list and Settings tree) and the white-on-black category band; red panel buttons in a gray bezel (Play 150x40 in the brighter face) beside 40x40 charcoal plates; info panels in the tooltip frame with gold headings, and the notes as a letter on paper; the dialog title between two gold diamonds. The details preview uses `GameBannerHeight` 200 (default 320) so the page fits in 720px, and shows four of the six metadata groups for the same reason. The banner is a painted placeholder.

## Not verified yet

Checked so far: `build-theme.ps1` and `validate-extension.ps1` pass; Playnite 10.64 loads the theme with no error in `playnite.log`; the main window in details view was looked at once (rail, top strip, game list selection, banner fade, Play, plates, both panels); and the form controls (tree, combo boxes, text box, slider, check and radio, buttons, the 41px button, tabs, group boxes, expander, scroll bar) were rendered off-screen from the built XAML in WPF, so their templates apply. Hover and pressed states, dialogs and the grid view were **not** looked at in Playnite. Still to check by hand:

- The standard list in `../AGENTS.md`.
- Banner: the page-color fade (`Background.Color` binding to `PageRoot`) with and without art, and Play hover at 125% and 150% scaling (no dark seams).
- Empty state in both views: fresh empty selection, and selected game -> grid -> details with the selection cleared, then a game again.
- The info panel collapsing for a game with no description and no screenshots; the notes letter alone.
- Settings and Add-ons trees: header bands on nodes with children, the reserved scroll lane, a selected child, a long translated label.
- ComboBox: a short value ("English") beside the arrow cell, an editable box, the filter panel preset box.
- Tabs in the game edit dialog (label colors on the page), the 41px ThemeModifier buttons, Statistics as compact cards.
- Text shadow (`DropShadowEffect`) on button labels with ClearType; whether Constantia is picked when Friz Quadrata is missing.
