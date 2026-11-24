# Greenfield XP — Creative Brief

Mode: **Faithful** (authentic Windows XP Luna Blue `luna.msstyles` shell, glossy Royal Blue chrome, Grass Green Start/Play accents, warm `#ECE9D8` beige controls, Explorer Common Tasks metadata cards, and full-color 32-bit XP-style iconography). Unofficial theme inspired by Microsoft Windows XP; see [RESEARCH.md](RESEARCH.md) and `info/NOTICE-GreenfieldXp.txt`.

## 1. Candidate lenses -> pick 1

Last 5 themes in `src/themes/AGENTS.md`: Silver 98 (Win95/98 flat grey 3D bevels & 16-color pixel art), Starlane (OLED *Star Wars* yellow-outline crawl), Checkpost (*Papers, Please* dark void/olive report screen), Wildhand (*Balatro* green felt & slate run HUD), Ditherwake (*Obra Dinn* 1-bit copperplate ledger).

- **(a) Diegetic / Artifact**: A glossy silver-and-blue Windows Media Player 9 skin with round transport pods. Dropped: too eccentric for a library browser and loses the iconic Explorer/Taskbar recognition.
- **(b) HUD / Telemetry**: Windows XP Task Manager / Performance tab green-on-black graphs. Dropped: feels like a diagnostic monitor instead of the beloved Luna desktop.
- **(c) Luna Blue Desktop & Explorer Common Tasks Shell — chosen**: The unmistakable Windows XP Luna Blue experience: glossy Royal Blue (`#3F8CF3` → `#245EDC` → `#1941A5`) vertical taskbar rail and top title/toolbar band, Grass Green (`#55B535` → `#3C9C3E` → `#226E24`) Start-style Main Menu & Play button, warm `#ECE9D8` cream-beige controls with `#003C74` rounded `3px` rims and `#F8B330` Luna Orange hover glows, glossy coral-red (`#D5492B`) Close buttons, periwinkle (`#D6DFF7`) Explorer Common Tasks metadata dossier, segmented green progress bars, and rich 32-bit glossy XP-style icons. Completely distinct in palette, lighting, curvature, and surface finish from Silver 98 and every other theme in the repo.

## 2. Source DNA

| Trait | Where it lands |
|-------|----------------|
| **Glossy Luna Royal Blue Chrome** (`#3F8CF3` → `#245EDC` → `#1941A5` cylindrical sheen, `#00138C` edge) | 44px left taskbar rail (`Sidebar.xaml`), 48px top bar (`TopPanel.xaml`), and Settings/dialog title bands (`StandardWindowStyle.xaml`) |
| **Grass Green Start Button Gloss** (`#55B535` → `#3C9C3E` → `#226E24` with upper white specular gleam and warm hover glow) | `PART_ElemMainMenu` Start tile (`LocalGreenfieldXpMenuMarkTemplate`) and game-page `PlayButton.xaml` |
| **Warm `#ECE9D8` Alabaster Chrome + Luna Orange Hover Glow** (`#003C74` 3px rounded borders lighting up with `#F8B330` / `#E59700` inner rims) | Buttons, CheckBoxes, RadioButtons, ComboBoxes, Sliders, ScrollBars, and TabControl (`2px` orange top cap on selected tabs) |
| **Explorer Common Tasks Dossier** (`#FFFFFF` → `#C6D3F7` rounded card headers with `#215DC6` titles over `#D6DFF7` body) | Metadata pane in `DetailsViewGameOverview.xaml` and `GridViewGameOverview.xaml` |
| **32-Bit Glossy XP Iconography** (4x supersampled soft-shadowed isometric icons: manila folders, green Play orb, blue-lens magnifier, golden star, red Turn Off button, Bliss monitor) | 24 full-color 48×48 PNGs in `src/Images/WinXP/` for all Playnite menus + crisp XP-proportioned vector `Icon<Role>` glyphs in `src/Media.xaml` |

## 3. Game element map (11 Windows XP Luna parts -> Playnite surfaces)

| Windows XP Luna UI part | Playnite surface |
|-------------------------|------------------|
| **Taskbar "Start" Button** (glossy Grass Green dome with custom 4-pane hilltop-window ribbon mark) | **`PART_ElemMainMenu`** at top of the 44px Royal Blue rail and top bar |
| **Luna Taskbar & Explorer Toolbar** (glossy Royal Blue `#245EDC` rail with lit `#3C81F0` hovered plates and pressed `#1338A0` active task buttons) | **Sidebar (`Sidebar.xaml`)** and **Top bar (`TopPanel.xaml`)** view switches, sort, and filter buttons |
| **Glossy Green "Start / Go" Command Pill** (rounded `5px` Grass Green glossy slab with upper highlight arc, white bold text, and Luna Orange hover rim) | **`PlayButton.xaml`** (hero moment: green glossy slab lighting up with a warm specular sheen and `#FFD54F` inner glow on hover) |
| **Windows XP Explorer "Common Tasks" Accordion Card** (`#FFFFFF` → `#C6D3F7` rounded header with `#215DC6` title, `#FFFFFF` inner rim, `#D6DFF7` body) | **Metadata dossier pane** in `DetailsViewGameOverview.xaml` & `GridViewGameOverview.xaml` |
| **Luna Segmented Green Progress Bar** (sunken rounded `#FFFFFF` trough with glossy `#28D438` → `#18A824` segmented chunks) | **`ProgressBar.xaml`** and top panel `PART_ProgressGlobal` (`Height="12"`) |
| **Luna Periwinkle ScrollBar & Pointed Slider** (soft `#E8ECF7` track with glossy `#C1D5F7` → `#99B9EE` rounded thumb + 4 grip lines; `#3C9C3E` hover/pressed slider cap) | **`ScrollViewer.xaml`** & **`Slider.xaml`** |
| **Windows XP Start Menu & Classic Context Menu** (crisp `#FFFFFF` card with `#00138C`/`#7BA2E7` border, 6px Royal Blue glossy left header spine, full-color XP icons, `#316AC5` highlight bar, glossy red Turn Off Exit row) | **`ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`** unified popup menu system |
| **Luna Display Properties Tabs** (`#FFFFFF` raised tab card crowned by a `2px` `#E68B2C` / `#FFC73C` Luna Orange cap over warm `#ECE9D8` property sheet) | **`TabControl.xaml`** & **`GroupBox.xaml`** |
| **Luna Glossy Coral-Red `×` Caption Button** (`#E86F54` → `#D5492B` → `#B72D12` with crisp white inner border and bold white `×`) | **`WindowBarButton.xaml`** & **`SidePanelCloseButton`** (`28×28`) |
| **Control Panel / Explorer Folders TreeView** (clean `#FFFFFF` pane, `#EBF3FD` hover wash, `#316AC5` selected bar + `2px` `#3F8CF3` left pip + white text) | **`TreeView.xaml`** in Settings and Add-ons windows |
| **Windows XP "Welcome / Tour" Balloon Card** (glossy Royal Blue header bar, warm `#ECE9D8` dialog body, custom Bliss Hilltop-Window emblem, and gentle pulsing status orb) | **`EmptyGameTemplate`** empty game page in both overviews |

## 4. Signature levers

| Lever | Choice |
|-------|--------|
| **Hero banner transition** | **Luna Explorer Framed Banner**: Hero artwork sits inside a rounded `5px` `#FFFFFF`-rimmed viewport at the top of the game page, softening smoothly at its lower edge into the `#FFFFFF` client surface above a `2px` Royal-to-Sky Luna accent rule (`#245EDC` → `#7BA2E7` → transparent). |
| **Play button architecture** | **Luna Grass Green Start Pill (`Height="40"`, `MinWidth="164"`, `CornerRadius="5"`)**: Deep forest `#1B5E20` outer rim, glossy 4-stop Grass Green fill (`#6BC95E` → `#3C9C3E` → `#2E8B32` → `#226E24`), curved top specular glass highlight, and an animated `#FFD54F` / `#F8B330` Luna Orange inner glow ring on hover that shifts `1px` down with deepened forest shading on press. |
| **Metadata container & group break** | **Explorer Common Tasks Card**: Periwinkle-tinted (`#D6DFF7`) rounded card (`CornerRadius="5"`) framed in `#FFFFFF` over a `#7BA2E7` outer keyline, crowned by a `#FFFFFF` → `#C6D3F7` glossy header band with `#215DC6` bold `Trebuchet MS` title; groups separated by crisp `#B8CBEF` hairlines with a `24px` `#215DC6` leading accent tick. |
| **Chip & score silhouette** | **Rounded Luna Push-Button Tags & Framed Score Badges**: Metadata chips (`PropertyItemButton.xaml`) are `3px`-rounded glossy warm-beige (`#FFFFFF` → `#ECE9D8`) mini Luna buttons with `#7F9DB9` borders that glow with the `#E59700` Luna Orange rim on hover; scores (`TextBlockGameScore`) are `3px`-rounded `#FFFFFF` badges with `#7F9DB9` rims and a glossy `4px` left rating bar (`#2E8B32` green / `#D48806` amber / `#C9361A` red). |
| **Row & cover selection mark** | **Details row**: `#EBF3FD` sky hot-track wash + `#B8D6FB` border on hover; `#316AC5` Luna Royal Blue plate with subtle upper gloss highlight and pure `#FFFFFF` text on selection. **Grid cover**: `5px`-rounded `#FFFFFF` Explorer Thumbnail frame with `#C8D6EC` border that glows `#F8B330` Luna Orange on hover and locks into a glossy `#316AC5` Royal Blue frame on selection. |
| **Side-panel close plate** | **Luna Glossy Coral-Red / Beige `28×28` Close Button (`CornerRadius="4"`)**: At rest, a crisp `#ECE9D8` Luna button plate with `#003C74` rim and dark `×`; on hover, fades smoothly (`0.12s`) into the iconic glossy coral-red XP Close plate (`#E86F54` → `#D5492B`) with white inner highlight rim and crisp white `×`. |

## 5. Popup menu levers (`docs/themes/menus.md`)

| Lever | Choice |
|-------|--------|
| **Panel** (`LocalGreenfieldXpMenuBoardTemplate`) | Clean `#FFFFFF` Windows XP Start-Menu / Context-Menu sheet (`CornerRadius="4"`) inside a `#003C74` outer rim, `#FFFFFF` inner highlight, and a signature `6px` glossy Royal Blue (`#3F8CF3` → `#245EDC` → `#1941A5`) vertical spine along the left edge capped by a subtle `#F8B330` orange top tick. |
| **Highlight** | Glossy `#316AC5` Luna Royal Blue selection bar (`CornerRadius="2"`, subtle top `#5B92E5` catchlight) fading in over `100ms` (`CubicEase`) while a `3px` `#F8B330` Luna Orange lead pip lights on the left edge and label/shortcut turn `#FFFFFF`. |
| **Group break** | Soft `#D6DFEE` hairline from the label column led by a `14px` `#7BA2E7` periwinkle accent dash (total `9px` tall). |
| **Icon hover contrast** | Full-color 32-bit glossy XP PNGs (`src/Images/WinXP/*.png`) in a fixed `26px` icon gutter; vector/icofont fallback sets `TextElement.Foreground` on `TargetName="Icon"` to `#FFFFFF` (`SelectedForegroundBrush`) on highlight. |
| **Shortcuts** | Right-aligned `Tahoma` muted slate (`#4A4A4A`) accelerator labels turning crisp `#FFFFFF` on the blue highlight bar. |
| **Submenu mark** | Clean `5×8` XP right chevron (`IconSubmenu`), `#215DC6` at rest and `#FFFFFF` on highlight or `IsSubmenuOpen`. |
| **Marked rows** | `Alt+Q` Exit row wears `#C9361A` Turn-Off crimson text at rest and highlights with the glossy `#D5492B` → `#B72D12` XP Turn-Off crimson bar + `#FFFFFF` text (`5.6:1` contrast); checked rows show a rounded `14×14` `#ECE9D8` box with `#003C74` rim and vivid Grass Green (`#2E8B32`) XP checkmark (`IconCheck`, turning `#FFFFFF` on blue highlight). |

## 6. Motion language

- **Durations**: Fast `100ms` (Luna Orange rim glow, menu highlight, toolbar hot-track), Base `170ms` (row/cover selection, tab switch, tree highlight), Slow `320ms` (Start menu mark open breath, launching segmented teal sweep).
- **Easing**: Smooth `CubicEase` (`EaseOut`) for glossy highlights and state washes, paired with a crisp `1px` downward press shift on buttons.
- **Hero moment**: `PlayButton` hover illuminates the Grass Green Start pill with a warm `#FFD54F` / `#F8B330` Luna Orange inner rim glow and upper glass gleam; pressing it deepens the green gradient and shifts content `1px` down-right.
- **Secondary moments (6)**:
  1. Details row hover (`#EBF3FD` sky wash + `#B8D6FB` border) and click selection (`#316AC5` glossy Royal Blue plate + white ink).
  2. Grid cover tile hover (`#F8B330` Luna Orange thumbnail frame glow + staggered 48×48 glossy green Play & blue Info orb buttons) and click selection (`#316AC5` Royal Blue thumbnail frame).
  3. Top bar & sidebar Luna Blue taskbar hot-tracking (glossy `#4B89F5` highlight on hover → inset `#1338A0` pressed task button when active).
  4. Settings `TreeView` row hover (`#EBF3FD` wash) and selection (`#316AC5` blue bar + `2px` `#F8B330` Luna Orange left accent pip + white text).
  5. `CheckBox` & `RadioButton` `#003C74` rounded wells warming with `#F8B330` Luna Orange inner borders on hover and snapping vivid Grass Green (`#2E8B32`) checks/dots.
  6. **Running / Launching indicator (`RunningIndicatorBrush` = `#0E8A9E` XP System-Tray Teal-Cyan)**: Launching sweeps a glossy cyan-teal scan band + segmented foot bar + 3 pulsing status orbs; Running holds the teal-cyan frame and pulses calmly (`2.8s` cycle).

## 7. Brand

- **Name**: **Greenfield XP** (`key: greenfieldxp`, folder: `src/themes/GreenfieldXp`).
- **Original Mark (`art/mark.svg` & `LocalGreenfieldXpMenuMarkTemplate`)**: An original **Rolling Bliss Hill & Sunlit Horizon Window** emblem (a soft rounded horizon frame enclosing a curved green meadow hill and sunlit sky arcs — zero Microsoft flag or trademarked logo), reused in the green Start `PART_ElemMainMenu` button, the Settings window title bar, the `EmptyGameTemplate` welcome card, and `info/icon.png`.
- **`GameBannerTintBrush`**: `#1941A5` (`--xp-blue-dark`, deep Luna Royal Blue) so darkening the hero banner blends naturally into the Luna Blue window chrome.

## 8. Kept calm

- Document lists (`DetailsView` game list, `Settings` page content, description text) sit on clean, high-contrast `#FFFFFF` / `#ECE9D8` surfaces with zero busy background textures behind text.
