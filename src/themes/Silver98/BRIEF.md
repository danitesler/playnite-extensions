# Silver 98 — creative brief

Mode: **Faithful** (with signature Windows 95/98 OS shell, Win32 3D bevels, Explorer 4.0 Web View game page, and classic 16-color pixel iconography). Unofficial theme inspired by Microsoft Windows 95 and Windows 98; see [RESEARCH.md](RESEARCH.md) and `info/NOTICE-Silver98.txt`.

## 1. Candidate lenses -> pick 1

Last 5 themes in `src/themes/AGENTS.md`: Checkpost (*Papers, Please* dark void/olive report screen), Starlane (OLED *Star Wars* yellow-outline crawl), Wildhand (*Balatro* green felt & slate run HUD), Ditherwake (*Obra Dinn* 1-bit copperplate ledger), Stride (*Mirror's Edge* ice-blue glass).

- **(a) Diegetic / Artifact**: A beige CRT monitor bezel surrounding the Playnite window with plastic power buttons. Dropped: wastes viewport space and fights Playnite's native window frame.
- **(b) HUD / Telemetry**: Windows 98 Resource Meter / System Monitor graphs everywhere. Dropped: feels like a diagnostic utility rather than the iconic desktop shell.
- **(c) Classic OS Shell & Explorer 4.0 Web View — chosen**: The authentic Windows 98 Explorer & Desktop experience: `#C0C0C0` 3D raised silver chrome, the `#000080` → `#1084D0` active navy title bar gradient, raised/sunken 2px Win32 bevels (`#FFFFFF` / `#DFDFDF` / `#808080` / `#000000`), `#FFFFFF` sunken document client areas, Windows 98 Explorer's "View as Web Page" (`folder.htt`) game overview with its 4-color (`red / yellow / green / blue`) divider rule, `#FFFFE1` pale-yellow tooltips, dithered scrollbar tracks, and full-color 16×16 pixel-art icons. Completely distinct from the last 5 themes (and every other theme in the repo).

## 2. Source DNA

| Trait | Where it lands |
|-------|----------------|
| **Win32 2px 3D Bevels** (`#FFFFFF` / `#DFDFDF` top-left light, `#808080` / `#000000` bottom-right shadow; zero rounded corners `0px`) | Every button, dialog frame, toolbar, popup menu, tab sheet, status pane, and sunken input/list well |
| **Windows 98 Active Title Bar Gradient** (`#000080` Navy to `#1084D0` Sky Blue with bold white pixel-crisp title & grey 3D caption buttons) | `StandardWindowStyle.xaml` dialog title band, `DetailsView` / `GridView` Explorer Web View header band, and active window accents |
| **Explorer 4.0 "View as Web Page" (`folder.htt`)** (white document pane, bold title, 4-color Red/Yellow/Green/Blue rule, and left/right split with a sunken status bar) | Both game overviews (`DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml`) and section headings |
| **Classic 16×16 Pixel Icons** (black-outlined 16-color VGA pixel art: yellow folders, CRT computer, magnifier, floppy disk, green play triangle, recycle bin) | `Media.xaml` crisp 16×16 vector pixel glyphs for `Icon<Role>` + 48×48 integer-scaled 16-color PNGs in `src/Images/Win98/` for all 24 Playnite menu icons |
| **Navy Selection Inversion & Dotted Focus Rects** (`#000080` solid highlight bar with `#FFFFFF` text and 1px dotted focus rectangle) | Library rows, popup menu highlight, TreeView nodes, ComboBox dropdown items, and hovered/focused command buttons |

## 3. Game element map (11 Windows 95/98 UI parts -> Playnite surfaces)

| Windows 95/98 UI part | Playnite surface |
|-----------------------|------------------|
| **Taskbar "Start" Button** (raised 3D silver slab with pixel computer/window mark) | **`PART_ElemMainMenu`** at top of the 44px Quick Launch rail and top bar |
| **IE4 / Win98 Quick Launch & Explorer Rebar** (`TBSTYLE_FLAT` hot-tracking buttons that raise on hover and sink with dithered well when checked) | **Sidebar rail (`Sidebar.xaml`) & Top bar (`TopPanel.xaml`)** view switches, sort, and filter buttons |
| **Win32 Default Push Button (`BS_DEFPUSHBUTTON`)** (1px black outer frame + 2px raised bevel + 1px inner dotted focus box + 16×16 Play glyph) | **`PlayButton.xaml`** (hero moment: navy/silver command slab with dotted focus box and 1px press shift) |
| **Explorer 4.0 "View as Web Page" (`folder.htt`) Header & 4-Color Bar** (Red `#FF3300` / Yellow `#FFCC00` / Green `#009933` / Blue `#0066CC` 2px rule) | **Game page section dividers (`DividerTemplate`)** and banner-to-sheet transition |
| **System Properties / File Properties Dialog Sheet** (raised 3D `#C0C0C0` property sheet with etched `GroupBox` frames, sunken white value wells, and status bar) | **Metadata dossier pane** in `DetailsViewGameOverview.xaml` & `GridViewGameOverview.xaml` |
| **Classic `msctls_progress32` Segmented Navy Block Bar** (sunken trough filled with discrete `#000080` blocks) | **`ProgressBar.xaml`** and top panel `PART_ProgressGlobal` (`Height="12"`) |
| **Win95/98 Dithered Scrollbar & TrackBar** (checkerboard track + raised 3D thumb with center grip ticks; pointed 3D slider thumb over sunken 4px channel) | **`ScrollViewer.xaml`** & **`Slider.xaml`** |
| **Classic Win32 Popup Menu** (raised 3D `#C0C0C0` frame, etched 2px separator, 16-color pixel icons, `#000080` navy selection bar, right-aligned shortcut text) | **`ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`** unified popup menu system |
| **Control Panel / Registry Editor TreeView** (sunken white tree pane, dotted hierarchy lines, +/- box expanders, `#000080` navy selected label plate) | **`TreeView.xaml`** in Settings and Add-ons windows |
| **Win98 Active Window Caption Bar** (`#000080` → `#1084D0` horizontal gradient, 16×16 control icon, bold white title, grouped 3D `_`, `□`, `×` buttons) | **`StandardWindowStyle.xaml`** & **`WindowBarButton.xaml`** |
| **Windows 95/98 "Setup / Copying Files..." & Active Desktop Teal Standby Dialog** (titled 3D dialog box with pixel computer monitor mark and blinking DOS/Explorer cursor) | **`EmptyGameTemplate`** empty game page in both overviews |

## 4. Signature levers

| Lever | Choice |
|-------|--------|
| **Hero banner transition** | **Explorer 4.0 Web View Frame**: Hero artwork sits inside a sunken 2px Win32 viewport frame at the top of the page, fading cleanly at its lower edge into the `#FFFFFF` Web View document surface above a 3px 4-color Explorer Web View rule (`#FF3300` / `#FFCC00` / `#009933` / `#0066CC`). |
| **Play button architecture** | **Win32 Default Push Button (`BS_DEFPUSHBUTTON`)**: Crisp `0px` rectangular slab (`Height="40"`, `MinWidth="156"`) with an outer 1px `#000000` keyline, 2px raised 3D bevel (`#FFFFFF` / `#DFDFDF` top-left, `#808080` / `#000000` bottom-right), navy `#000080` → `#1084D0` active fill, bold white label, and a 1px inner dotted focus frame (`LocalDottedFocusTemplate`) that snaps in on hover and shifts `1px` down-right with inverted sunken bevels on press. |
| **Metadata container & group break** | **Win98 File Properties Sheet**: Raised 3D `#C0C0C0` dialog sheet (`#FFFFFF` top-left, `#808080`/`#000000` bottom-right) topped by a compact `#000080` → `#1084D0` "Properties" title strip and broken into groups by 2px etched Win32 rules (`#808080` over `#FFFFFF`). Field values sit on crisp sunken-edged rows. |
| **Chip & score silhouette** | **Sunken Status Cells & Raised 3D Key Tags**: Metadata chips (`PropertyItemButton.xaml`) are compact `0px` raised 3D `#C0C0C0` button tags (`#FFFFFF` top-left, `#808080` bottom-right) that invert to `#000080` navy with white ink on hover; scores (`TextBlockGameScore`) are sunken 3D `#FFFFFF` numeric readouts with monospace numerals and a 3px left status bar (`#007A3D` green / `#9E6B00` amber / `#A80000` red). |
| **Row & cover selection mark** | **Details row**: `#000080` Navy selection bar (`SelectedBrush`) with pure `#FFFFFF` text and a 1px inner dotted white focus border. **Grid cover**: Raised 3D `#C0C0C0` window frame around the cover art that lights up with a `#000080` → `#1084D0` title-bar frame and corner pixel handles on selection. |
| **Side-panel close plate** | **Classic Win95/98 `×` Caption Button (`28×28`)**: Raised 3D `#C0C0C0` square plate (`#FFFFFF` / `#DFDFDF` top-left, `#808080` / `#000000` bottom-right) with a crisp 2px pixel `×` glyph (`#000000`), flipping to `#A80000` danger crimson with `#FFFFFF` glyph on hover and sunken bevel on press. |

## 5. Popup menu levers (`docs/themes/menus.md`)

| Lever | Choice |
|-------|--------|
| **Panel** (`LocalWin98MenuBoardTemplate`) | Raised 3D `#C0C0C0` Win32 menu board (`#DFDFDF`/`#FFFFFF` top-left bevel, `#808080`/`#000000` bottom-right shadow) with a vertical 6px `#000080` → `#1084D0` Windows 98 Start-Menu banner stripe along the left spine. |
| **Highlight** | Full-bleed `#000080` Navy selection bar (`SelectedBrush`) with a 1px dotted inner focus line (`#80C8FF` at 45%), snapping/fading in over 90ms (`CubicEase`) and flipping label, icon, and shortcut to `#FFFFFF`. |
| **Group break** | Classic Win32 2px etched separator (`1px #808080` shadow over `1px #FFFFFF` highlight) inset 8px from the left banner stripe. |
| **Icon hover contrast** | Full-color 16-color pixel PNGs (`src/Images/Win98/*.png`) in a fixed 26px column; vector/icofont fallback sets `TextElement.Foreground` on `TargetName="Icon"` to `#FFFFFF` (`SelectedForegroundBrush`) on highlight. |
| **Shortcuts** | Right-aligned `Tahoma` / `Consolas` accelerator text (`#4A4A4A` at rest, `#FFFFFF` on highlight) — no modern rounded pill badges, matching real Win32 menus. |
| **Submenu mark** | Crisp 4×7 pixel right-pointing triangle (`IconSubmenu`), `#000000` at rest and `#FFFFFF` when highlighted or `IsSubmenuOpen`. |
| **Marked rows** | `Alt+Q` Exit row wears `#A80000` crimson text at rest and highlights with a solid `#A80000` danger bar + `#FFFFFF` text (7.8:1 contrast); checked rows draw the classic sunken 3D check box (`#DFDFDF` well) with a bold pixel checkmark (`IconCheck`). |

## 6. Motion language

- **Durations**: Fast `90ms` (button hover, menu highlight, toolbar hot-track), Base `150ms` (row/cover selection, tab switch, tree highlight), Slow `260ms` (empty-state cursor blink, launching segmented block sweep).
- **Easing**: Crisp `CubicEase` (`EaseOut`) for opacity/color state transitions paired with instant 1px mechanical press shifts (`DiscreteDoubleKeyFrame` on `IsPressed`) so controls feel like real tactile Win32 buttons.
- **Hero moment**: `PlayButton` hover locks a 1px inner dotted focus rectangle and sweeps a subtle active-caption blue sheen across the navy command plate; pressing it shifts the content `1px` right and `1px` down while inverting the outer 2px bevel from raised to sunken.
- **Secondary moments (6)**:
  1. Details row hover (`#E8EEF8` hot-track wash + dotted underline cue) and click selection (`#000080` navy bar + 1px white dotted focus frame).
  2. Grid cover tile hover (raised 3D silver frame pops into hot-track `#1084D0` outline + staggered 48×48 Win98 3D Play/Info buttons) and click selection (`#000080` navy frame lock).
  3. Top bar & sidebar `TBSTYLE_FLAT` hot-tracking (flush at rest → 1px raised 3D bevel on hover → 1px sunken dithered well when checked).
  4. Settings `TreeView` row hover (`#E8EEF8` wash) and selection (`#000080` navy plate + 2px `#1084D0` left bar + white text).
  5. `CheckBox` & `RadioButton` sunken 3D white wells snapping crisp black pixel checkmark / 6×6 pixel dot on check.
  6. **Running / Launching indicator (`RunningIndicatorBrush` = `#008080` Windows 95/98 Desktop Teal)**: Launching sweeps a segmented blocky progress band (`RunningScan` + `RunningFill` + 3 stepping hourglass/block pips) across the item; Running holds the teal frame and pulses softly (2.8s cycle).

## 7. Brand

- **Name**: **Silver 98** (`key: silver98`, folder: `src/themes/Silver98`).
- **Original Mark (`art/mark.svg` & `BrandMarkTemplate`)**: An original pixel-art **Classic 90s CRT Monitor & Cascading Window** emblem (no Microsoft flag or trademarked logo), reused in the Quick Launch `PART_ElemMainMenu` button, the Settings window title bar icon, the `EmptyGameTemplate` dialog, and `info/icon.png`.
- **`GameBannerTintBrush`**: `#C0C0C0` (`--w98-face`, classic Win32 3D silver face) so darkening the hero banner blends seamlessly into the classic desktop chrome.

## 8. Kept calm

- Document lists (`DetailsView` game list, `Settings` page content, description text) sit on calm, high-contrast `#FFFFFF` / `#C0C0C0` surfaces with zero noisy textures behind text.
