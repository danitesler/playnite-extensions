# Silver 98 — research & sources

Unofficial Playnite Desktop theme inspired by the classic user interface of **Microsoft Windows 95 and Windows 98** (`Windows Standard` color scheme, Win32 Common Controls `comctl32.dll` v4.71/v4.72, Explorer 4.0 Web View, and the classic 16×16 / 32×32 16-color VGA / 256-color pixel icon vocabulary of `shell32.dll`, `explorer.exe`, and `comctl32.dll`). Not affiliated with, endorsed by, or sponsored by Microsoft Corporation. No Microsoft logo, Windows flag, font, or bitmap asset is shipped; see `info/NOTICE-Silver98.txt`.

## Sources

| What | Where (package, version, file) |
|------|--------------------------------|
| Win32 System Color Palette (`GetSysColor` / `Windows Standard`) | Microsoft Win32 User Interface Guidelines (*The Windows Interface Guidelines for Software Design*, Microsoft Press, 1995) & `98.css` v0.1.20 (`style.css`, MIT) |
| Win32 3D Border & Control Specs (`DrawEdge` / `BDR_RAISEDOUTER` / `BDR_SUNKENINNER`) | Win32 `WinUser.h` (`EDGE_RAISED`, `EDGE_SUNKEN`, `EDGE_ETCHED`, `EDGE_BUMP`) & `98.css` box-shadow border metrics |
| Windows 98 Explorer 4.0 "View as Web Page" & Active Title Bar Gradient | Windows 98 Second Edition shell specifications (`COLOR_ACTIVECAPTION` `#000080` to `COLOR_GRADIENTACTIVECAPTION` `#1084D0`, `folder.htt` Web View header & 4-color `red / yellow / green / blue` divider bar) |
| Classic Pixel Icon Language (`art/icons.py`) | Original hand-authored 16×16 crisp pixel geometries (`Media.xaml`) and 48×48 (3× integer-scaled 16×16) full-color classic 16-color pixel-art menu PNGs (`src/Images/Win98/*.png`) drawn from first principles on the classic Win95/98 black-outlined isometric/orthographic pixel grid (manila folders, CRT monitor, cyan-glass magnifier, gold key, hourglass, green play triangle, recycle bin, 3.5" floppy disk, book with bookmark, red shutdown power button) |

## Measured Win32 System Colors (`Windows Standard` Scheme)

| Win32 Constant | Hex | Role in Windows 95/98 | Role in Silver 98 |
|----------------|-----|-----------------------|-------------------|
| `COLOR_3DFACE` / `COLOR_BTNFACE` | `#C0C0C0` | Classic silver-grey dialog, toolbar, button, and menu face (`RGB(192, 192, 192)`) | `MainColor`, `ButtonBackgroundBrush`, `TopPanelBackgroundBrush`, `ShellBackgroundBrush`, `PopupBackgroundBrush`, `WindowTitleBackgroundBrush` |
| `COLOR_3DLIGHT` | `#DFDFDF` | Inner top/left 1px highlight on raised 3D controls (`RGB(223, 223, 223)`) | `LocalBevelLightBrush`, `ButtonHoverBackgroundBrush` (`#D4D4D4`), `ListItemHoverBrush` (`#E8EEF8`) |
| `COLOR_3DHILIGHT` / `COLOR_BTNHIGHLIGHT` | `#FFFFFF` | Outer top/left 1px specular edge on raised 3D controls and sunken bottom/right edge | `LocalBevelHighlightBrush`, `InputBackgroundBrush`, `ContentBackgroundBrush`, `WindowBackgourndBrush` |
| `COLOR_3DSHADOW` / `COLOR_BTNSHADOW` | `#808080` | Inner bottom/right 1px shadow on raised 3D controls and outer top/left on sunken wells (`RGB(128, 128, 128)`) | `NormalBorderBrush`, `PanelSeparatorColor`, `LocalBevelShadowBrush` |
| `COLOR_3DDKSHADOW` | `#000000` | Outer bottom/right 1px hard black edge on raised 3D buttons, windows, and popups | `PopupBorderColor`, `LocalBevelDarkBrush`, `TextColor` |
| `COLOR_WINDOW` | `#FFFFFF` | Document, list view, tree view, and edit control client area background | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `InputBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush` |
| `COLOR_WINDOWTEXT` / `COLOR_BTNTEXT` | `#000000` | High-contrast black text on silver `#C0C0C0` (11.6:1) and white `#FFFFFF` (21:1) | `TextColor`, `ButtonForegroundBrush`, `HeadingForegroundBrush` |
| `COLOR_GRAYTEXT` | `#545454` | Muted/secondary caption text on silver `#C0C0C0` and white `#FFFFFF` (Classic `#808080` is 3.95:1 on white and 1.9:1 on `#C0C0C0`; darkened to `#4A4A4A` for ≥ 4.6:1 WCAG AA legibility on silver) | `TextColorDarker` (`#4A4A4A`) |
| `COLOR_HIGHLIGHT` / `COLOR_ACTIVECAPTION` | `#000080` | Classic Windows 95/98 Navy Blue selection highlight, active title bar start, and progress bar chunks (`RGB(0, 0, 128)`) | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `PrimaryButtonBackgroundBrush`, `GlyphColor`, `ProgressBarForegroundBrush`, `TopPanelItemCheckedBackgroundBrush` |
| `COLOR_GRADIENTACTIVECAPTION` | `#1084D0` | Windows 98 active title bar right-hand gradient stop (`RGB(16, 132, 208)`) | `LocalCaptionGradientEndBrush`, `FocusBrush`, `TabItemIndicatorBrush`, `InputHoverBorderBrush` |
| `COLOR_HIGHLIGHTTEXT` / `COLOR_CAPTIONTEXT` | `#FFFFFF` | Pure white text on `#000080` navy selection bars and title bars (16.0:1 contrast) | `TextColorDark`, `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush`, `WindowTitleForegroundBrush` |
| `COLOR_DESKTOP` | `#008080` | Iconic Windows 95/98 Teal desktop background (`RGB(0, 128, 128)`) | `RunningIndicatorBrush` (`#008080`, darkened with `#003838` scrim on the running Play slab), `PositiveRatingBrush` (`#007A3D`) |
| `COLOR_INFOBK` | `#FFFFE1` | Classic Win95/98 pale yellow ToolTip surface (`RGB(255, 255, 225)`) with 1px black border | `TooltipBackgroundBrush` (`#FFFFE1`), `TooltipForegroundBrush` (`#000000`), `TooltipBorderBrush` (`#000000`) |
| `COLOR_INACTIVECAPTION` | `#808080` → `#B5B5B5` | Inactive window title bar gradient and disabled chrome | `MainColorDark` (`#B0B0B0`), `ExpanderBackgroundBrush` (`#D8D8D8`) |
| Explorer 4.0 Web View 4-Color Stripe | `#FF3300`, `#FFCC00`, `#009933`, `#0066CC` | The 4-segment horizontal rule under folder titles in Windows 98 Explorer's `folder.htt` Web View | `LocalWebRedBrush`, `LocalWebYellowBrush`, `LocalWebGreenBrush`, `LocalWebBlueBrush` |

## Win32 3D Border Recipes (Zero `DropShadowEffect`, Crisp 1px Steps)

Windows 95 and 98 construct all depth using two nested 1px asymmetric borders (`SnapsToDevicePixels="True"`, `CornerRadius="0"`):

1. **Raised 3D Control (`EDGE_RAISED` — Buttons, Window Frames, Menu Popups, Toolbar Pressed/Checked inverse)**:
   - Outer top & left: `#FFFFFF` (`LocalBevelHighlightBrush`) or `#DFDFDF` (`LocalBevelLightBrush` on command buttons)
   - Inner top & left: `#DFDFDF` (`LocalBevelLightBrush`) or `#FFFFFF`
   - Inner bottom & right: `#808080` (`LocalBevelShadowBrush`)
   - Outer bottom & right: `#000000` (`LocalBevelDarkBrush`)
2. **Default Command Button (`BS_DEFPUSHBUTTON` — Play Button, Save/OK)**:
   - Surrounded by an outer 1px `#000000` black keyline ring, with the 2px raised 3D bevel inside it and a 1px dotted inner focus rect on hover/focus.
3. **Sunken 3D Well (`EDGE_SUNKEN` — TextBox, PasswordBox, SearchBox, ListView, TreeView, Status Bar Panes, Progress Track, Metadata Wells)**:
   - Outer top & left: `#808080` (`LocalBevelShadowBrush`)
   - Inner top & left: `#000000` (`LocalBevelDarkBrush`)
   - Inner bottom & right: `#DFDFDF` (`LocalBevelLightBrush`)
   - Outer bottom & right: `#FFFFFF` (`LocalBevelHighlightBrush`)
4. **Etched GroupBox & Separator (`EDGE_ETCHED` — `GroupBox.xaml`, Menu Separators, Toolbar Dividers)**:
   - Top/left 1px `#808080` (`LocalBevelShadowBrush`) paired immediately with bottom/right 1px `#FFFFFF` (`LocalBevelHighlightBrush`).
5. **Dithered Checkerboard Scrollbar Track**:
   - Alternating 2×2 pixel `#C0C0C0` and `#FFFFFF` checkerboard (`scroll-dither.png` white mask over `#C0C0C0` track) with raised 3D `#C0C0C0` thumb and 16×16 raised arrow buttons.

## Typography & Bundled Fonts

- **Body & UI Controls (`FontFamily`)**: `Tahoma, Segoe UI` (Tahoma was introduced as the system UI face in Windows 98 / Office 97 and ships on every Windows installation; previews map `Tahoma` to bundled `DejaVu Sans` in `scripts/data/fonts.json` with zero system-font warnings).
- **Pixel Display & Classic Headers (`HeadingFontFamily`)**: `./Typography/#Pixelify Sans, Pixelify Sans, Tahoma, Segoe UI` (bundled static OFL `PixelifySans-Bold.ttf` & `PixelifySans-Regular.ttf` in `src/Typography/` to evoke bitmap `MS Sans Serif` bold title bars and Windows 98 Setup banners at ≥ 16px).
- **Monospace (`MonospaceFontFamily`)**: `Consolas` (for numeric scores, install sizes, DOS/registry paths, and shortcut hints; mapped to `Cascadia Mono` in previews).

## Classic Windows 95/98 Iconography (`Media.xaml` & `src/Images/Win98/`)

To look as close as possible to Windows 95/98 while remaining 100% original and license-clean:
1. **Vector UI Icons (`Icon<Role>` in `src/Media.xaml`)**:
   - Generated deterministically by `art/icons.py` on a 16×16 pixel grid (`RenderOptions.EdgeMode="Aliased"`, `SnapsToDevicePixels="True"`):
     - `IconMainMenu`: Classic 90s Desktop Computer & Window Cascading Start Emblem
     - `IconLibrary`: Classic Explorer Yellow Program Group / Game Controller Folder
     - `IconStatistics`: Classic Windows 98 System Monitor Bar Graph
     - `IconSearch`: Classic Windows 98 Find Magnifying Glass over Document
     - `IconFilter` / `IconFilterPresets`: Classic Funnel & Folder Filter
     - `IconSort` / `IconGroup`: Classic Explorer A→Z Sort Arrow & Cascading Program Group Windows
     - `IconDetailsView` / `IconGridView` / `IconListView`: Exact Windows 95/98 Explorer toolbar view icons (Details rows, Large Icons 2×2 grid, List columns)
     - `IconExplorer` / `IconNotifications` / `IconUpdate`: Classic Folder Tree, System Tray Message Envelope/Bell, and Windows Update Globe Arrow
     - `IconWindowMinimize` / `IconWindowMaximize` / `IconWindowRestore` / `IconWindowClose`: Exact Marlett-style 2px bottom baseline bar, thick top-bar window box, cascading dual window boxes, and crisp pixel `×`
     - `IconPlay` / `IconDownload` / `IconInfo` / `IconEdit` / `IconOptions` / `IconAdd` / `IconRemove` / `IconCheck` / `IconDropDown` / `IconSubmenu`: Exact CD-Player Play triangle, Setup Diskette/Arrow, Blue `i` Balloon, Pixel Pencil, Recycle Bin, Checkmark, and 7×4 / 4×7 Win32 pixel triangles.
2. **Full-Color 16-Color Pixel Menu Icons (`src/Images/Win98/*.png`)**:
   - Generated deterministically by `art/icons.py` as 48×48 PNGs (16×16 pixel art nearest-neighbor scaled 3× so every pixel is sharp in Playnite's menus) using the authentic 16-color Windows VGA palette (`#000000` black outline, `#FFFF00` / `#808000` manila folder yellow, `#00FFFF` / `#008080` screen cyan/teal, `#000080` / `#0000FF` title-bar navy/blue, `#C0C0C0` / `#808080` hardware silver, `#00FF00` / `#008000` LED green, `#FF0000` / `#800000` danger red).

## Interface Parts & Motion Observed

- **Button Press Mechanics**: In Win32, clicking a raised button swaps its outer/inner bevels to a sunken `#808080` / `#000000` border and shifts the inner content 1px right and 1px down (`TranslateTransform X="1" Y="1"`), while showing a 1px dotted black focus rectangle inside the button face.
- **Toolbar Hot-Tracking (Windows 98 `TBSTYLE_FLAT`)**: Windows 98 Explorer introduced flat toolbar buttons that sit flush on the `#C0C0C0` rebar at rest, pop up a 1px raised bevel (`#FFFFFF` top/left, `#808080` bottom/right) on mouse hover, and sink into a 1px sunken bevel (`#808080` top/left, `#FFFFFF` bottom/right) with a dithered `#DCDCDC` checkerboard well when checked/toggled.
- **Segmented Navy Progress Bar (`PBS_SMOOTH=0`)**: Classic `msctls_progress32` fills a sunken 3D trough with discrete `#000080` navy rectangular blocks separated by 2px gaps.
- **Menu & List Selection**: Instant or crisp-stepped `#000080` navy highlight bar across the row, flipping the text and shortcut hint simultaneously to `#FFFFFF` white while keeping the 16×16 colored pixel icon crisp on the left.
