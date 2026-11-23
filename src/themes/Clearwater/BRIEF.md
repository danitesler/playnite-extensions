# Clearwater — Creative Brief

Mode: **Faithful** (authentic **macOS 26 Tahoe Liquid Glass** shell: luminous frosted-glass chrome with `1px` specular top-edge lensing, continuous `8px`/`12px` radii, macOS traffic-light window controls, Apple System Blue `#007AFF` accents, calm high-contrast light content surfaces, and full-color 48×48 Liquid Glass squircle menu icons). Unofficial theme inspired by macOS; see [RESEARCH.md](RESEARCH.md) and `info/NOTICE-Clearwater.txt`.

## 1. Candidate lenses -> pick 1

Last 5 themes in `src/themes/AGENTS.md`: Bliss XP (Windows XP Luna Blue glossy chrome), Silver 98 (Win95/98 flat grey 3D bevels), Starlane (OLED *Star Wars* yellow-outline crawl), Checkpost (*Papers, Please* dark void/olive report screen), Wildhand (*Balatro* green felt & slate run HUD).

- **(a) Diegetic / Artifact**: A skeuomorphic macOS Dock + Launchpad full-screen icon grid. Dropped: breaks Playnite's details/metadata workflow and feels gimmicky rather than like a real macOS desktop app.
- **(b) HUD / Telemetry**: macOS Activity Monitor / Control Center dark grid tiles. Dropped: overly dense and loses the airy, luminous Liquid Glass window feel.
- **(c) macOS Tahoe Finder & System Settings Liquid Glass Window — chosen**: Floating frosted-glass left sidebar rail and translucent top toolbar with specular white top rims over a crisp alpine-mist canvas (`#E6EEF7`), paired with clean `#F8FBFF` content pages, red/yellow/green traffic-light caption dots, continuous `8px`/`12px` Liquid Glass cards and pills, System Blue (`#007AFF`) active states, and full-color macOS Liquid Glass squircle menu icons. Completely distinct from Bliss XP, Silver 98, Fluence, and Stride.

## 2. Source DNA

| Trait | Where it lands |
|-------|----------------|
| **Liquid Glass Specular Lensing** (cool-white frosted gradient + crisp `1px` top white catchlight + `glass-rim.png` 9-slice inner bloom) | Floating 44px sidebar rail (`Sidebar.xaml`), 48px top bar (`TopPanel.xaml`), metadata dossier card, popup menus, and Settings title band |
| **Traffic-Light Window Controls** (`#FF5F57` Close, `#FEBC2E` Minimize, `#28C840` Zoom dots revealing crisp symbols on hover) | `MainWindowStyle.xaml`, `StandardWindowStyle.xaml`, and `WindowBarButton.xaml` |
| **Apple System Blue (`#007AFF`) Optical Pill** (luminous glass-capped blue fill with top specular sheen & white ink) | `PlayButton.xaml`, active view switches, active sidebar selection plate, checked toggles, and focus rings |
| **Continuous Squircle & Capsule Geometry** (`8px` control radius, `12px` card/menu/cover radius, `1px` frosted hairline borders) | Every button, search pill, metadata chip, cover tile, dropdown, and popover |
| **SF-Proportioned Vectors + Liquid Glass Squircle Menu Icons** (rounded-cap 20×20 vector glyphs + 24 full-color 48×48 glass squircle PNGs) | `Media.xaml`, `art/icons.py` → `src/Images/MacGlass/*.png` |

## 3. Game element map (10 macOS Tahoe Liquid Glass parts -> Playnite surfaces)

| macOS Tahoe UI part | Playnite surface |
|---------------------|------------------|
| **Traffic-Light Window Controls** (`#FF5F57` / `#FEBC2E` / `#28C840` circular dots with hover symbols) | **`MainWindowStyle.xaml`** & **`WindowBarButton.xaml`** |
| **Liquid Glass Floating Sidebar Rail** (translucent cool-mist rail with frosted glass inner rim and System Blue active pill) | **`Sidebar.xaml`** & **`SidebarItem.xaml`** |
| **Liquid Glass Prism Menu Button** (custom refracted optical lens mark that sweeps a specular gleam on hover and glows System Blue when open) | **`PART_ElemMainMenu`** (`LocalClearwaterMenuMarkTemplate` in `Common.xaml`) |
| **Translucent Finder Toolbar & Spotlight Search Pill** (floating glass top bar with frosted white search capsule, persistent magnifier, and segmented glass view pills) | **`TopPanel.xaml`**, **`TopPanelItem.xaml`**, **`SearchBox.xaml`** |
| **Liquid Glass Primary Action Pill** (`#007AFF` translucent-feeling blue glass capsule with curved top specular highlight and diagonal optical sheen sweep on hover) | **`PlayButton.xaml`** (hero moment) |
| **macOS Inspector / Get Info Glass Sheet** (`#FFFFFF` frosted glass card with `12px` corners, crisp `#FFFFFF` inner catchlight, `#C3D2E4` hairline, and soft `#DCE5F0` section dividers) | **Metadata dossier pane** in `DetailsViewGameOverview.xaml` & `GridViewGameOverview.xaml` |
| **macOS Tahoe Glass Popover Menu** (`12px` frosted white sheet with specular top rim, full-color 48×48 glass squircle icons, `#007AFF` selection capsule, and System Red Exit row) | **`ContextMenu.xaml`**, **`Menu.xaml`**, **`ComboBox.xaml`** |
| **macOS System Settings Sidebar Tree & Glass Title Band** (`240px` frosted sidebar tree with `#007AFF` active pill + `40px` glass title band with Clearwater prism mark) | **`TreeView.xaml`** & **`StandardWindowStyle.xaml`** |
| **macOS Pill Toggle Switch & Optical Slider** (rounded glass track with crisp white circular thumb + `#007AFF` active fill) | **`CheckBox.xaml`**, **`Slider.xaml`**, **`ProgressBar.xaml`** |
| **macOS Tahoe "No Selection" Frosted Glass Card** (centered floating glass prism emblem with subtle alpine mist glow and clean typography) | **`EmptyGameTemplate`** in both game overviews |

## 4. Signature levers

| Lever | Choice |
|-------|--------|
| **Hero banner transition** | **Liquid Glass Framed Alpine Banner**: Hero artwork sits inside a `12px`-rounded frosted-glass frame with a `1px` crisp white inner top specular rim, feathering smoothly into the `#F8FBFF` content canvas above a soft translucent blue-silver refraction rule (`#007AFF` at 25% → transparent). |
| **Play button architecture** | **Liquid Glass Blue Lens Pill (`Height="40"`, `MinWidth="164"`, `CornerRadius="{DynamicResource ControlCornerRadius}"`)**: Vibrant `#007AFF` → `#0062D1` optical blue gradient, `1px` `#66FFFFFF` top inner specular rim, and an animated diagonal `glass-sheen.png` refraction sweep + brightened blue lens glow on hover, settling `1px` deeper on press. |
| **Metadata container & group break** | **macOS Get Info Glass Sheet**: Floating `#FFFFFF` frosted card (`CornerRadius="12"`) with `#C3D2E4` outer hairline, `1px` pure-white inner top catchlight, and `glass-rim.png` subtle inner bloom; groups separated by clean `1px` `#DCE5F0` hairlines led by a `16px` `#007AFF` 2px optical dash. |
| **Chip & score silhouette** | **Frosted Glass Tag Pills & Tinted Glass Score Badges**: Metadata chips (`PropertyItemButton.xaml`) are `ControlCornerRadius` (`8px`) frosted-white glass pills (`#F4F8FD` → `#E9F0F9`) with `#C3D2E4` rims that tint soft `#DCEBFF` with `#007AFF` borders on hover; scores (`TextBlockGameScore`) are `8px` frosted glass badges with a `4px` rounded vertical rating bar (`#22B43C` / `#FF9500` / `#D70015`). |
| **Row & cover selection mark** | **Details row**: `#E6EFFA` translucent hover wash with crisp `#FFFFFF` top rim; `#007AFF` System Blue glass selection capsule with pure `#FFFFFF` text and top specular edge. **Grid cover**: `12px`-rounded frosted glass frame that lifts with a `#007AFF` optical rim + diagonal `glass-sheen.png` glint on hover and locks into a `2px` `#007AFF` System Blue glass frame on selection. |
| **Side-panel close plate** | **Liquid Glass `28×28` Frosted Close Pill (`CornerRadius="8"`)**: At rest, a translucent frosted-white glass plate (`#F2F6FC`) with `#C3D2E4` rim, `#FFFFFF` top catchlight, and dark `#1C1F26` `×`; on hover, fades smoothly (`0.12s`) into macOS Traffic-Light Red (`#FF5F57` → `#E0443E`) with crisp white `×`. |

## 5. Popup menu levers (`docs/themes/menus.md`)

| Lever | Choice |
|-------|--------|
| **Panel** (`LocalClearwaterMenuBoardTemplate`) | Frosted `#FAFCFF` → `#EEF4FB` Liquid Glass popover (`CornerRadius="12"`) with `#B8C9DF` outer hairline, crisp `1px` `#FFFFFF` inner specular rim, and subtle `glass-rim.png` top lensing bloom. |
| **Highlight** | System Blue `#007AFF` → `#0066DB` Liquid Glass capsule (`CornerRadius="6"`) with top `#55FFFFFF` specular catchlight fading in over `110ms` (`CubicEase`), turning label and shortcut crisp `#FFFFFF`. |
| **Group break** | Soft `#D8E2EE` translucent hairline inset to the icon column with a subtle `#FFFFFF` highlight line beneath (`9px` total height). |
| **Icon hover contrast** | Full-color 48×48 Liquid Glass squircle PNGs (`src/Images/MacGlass/*.png`) in a fixed `26px` icon column; vector/icofont fallback sets `TextElement.Foreground` on `TargetName="Icon"` to `#FFFFFF` on highlight. |
| **Shortcuts** | Right-aligned `Barlow` muted slate (`#556070`) macOS-style shortcut labels turning crisp `#FFFFFF` on the blue glass highlight. |
| **Submenu mark** | Clean SF-style rounded right chevron (`IconSubmenu`), `#556070` at rest and `#FFFFFF` on highlight or `IsSubmenuOpen`. |
| **Marked rows** | `Alt+Q` Exit wears System Red `#D70015` text at rest and highlights with a `#D70015` → `#B80012` red glass capsule + `#FFFFFF` text (`5.6:1` contrast); checked rows display a clean `#007AFF` SF-style checkmark (`IconCheck`, turning `#FFFFFF` on blue highlight). |

## 6. Motion language

- **Durations**: Fast `120ms` (glass hover wash, menu capsule, traffic-light glyph reveal), Base `200ms` (row/cover selection, Play sheen sweep, tab/tree switch), Slow `340ms` (menu prism open pose, launching optical scan).
- **Easing**: Smooth `CubicEase` (`EaseOut`) for fluid macOS optical responsiveness.
- **Restraint**: Library list backgrounds, grid canvases, and metadata text remain calm and static.
