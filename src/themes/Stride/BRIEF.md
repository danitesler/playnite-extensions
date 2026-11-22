# Stride v2 — Creative Brief (`Hybrid` Architectural Glass Rebuild)

Original unofficial Playnite Desktop theme fusing **Mirror's Edge (2008, `id=815`)** tempered ice-blue glass, inner shadows, blazing red vertical pillar, glossy charcoal selection bars, and red-thumb scrollbars with **Mirror's Edge Catalyst (`id=181`)** frosted glass refraction and asymmetric corners.

## 1. Candidate Lenses -> Chosen Lens

- **(a) Diegetic BEAT HUD**: Minimalist in-world reticle; too sparse for multi-pane library chrome.
- **(b) Catalyst Pure Flat White**: Too sterile and risked reading like a generic light dashboard.
- **(c) Chosen — Mirror's Edge (`id=815` + `id=181`) Tempered Architectural Glass & Red Vertical Pillar**: Combines Mirror's Edge 2008's unforgettable **blazing red vertical left pillar (`STORY` menu)** with pure-white inverted active rail tiles, **thick tempered ice-blue glass panels (`#FAFDFF -> #DCEBFC`) with velvety 4-edge cool-blue inner shadows (`glass-inset.png`) and diagonal window refraction (`glass-sheen.png`)**, **glossy charcoal-glass selection bars (`#6D7177 -> #31353B`) with blazing red `+` markers**, **vivid red scrollbar thumbs on steel-blue glass tracks**, **raised glass folder tabs (`ARTWORK | VIDEOS | MUSIC`)**, **blue-track / red-thumb calibration sliders**, and **subtle sunlit architectural skyscraper silhouettes (`city-skyline.png`)**.

## 2. Source DNA (5 Traits)

1. **Tempered Ice-Blue Frosted Glass with Velvety 4-Edge Inner Shadow**: Every card, popup, listbox, input, and metadata dossier uses a crystal vertical gradient (`#FAFDFF -> #ECF4FE -> #DCEBFC`), `1px` steel-blue rim (`#7B9ABA`), `1px` white top specular reflection, and 9-slice blue inner shadow (`glass-inset.png`).
2. **Blazing Red Vertical Pillar + Pure White Inverted Selection**: Full-height 44px blazing crimson glass rail (`#E81B08 -> #BE0F03`) with subtle curtain-wall micro-grid and glass sheen; active item inverts to a stark pure-white horizontal slab (`#FFFFFF`) with bold dark ink.
3. **Glossy Charcoal-Glass Selection Bar + Red `+` Signal**: Selected details rows, settings tree rows, and highlighted menu rows wear the iconic vertical metallic-charcoal gradient (`#6D7177 -> #31353B`) with crisp white ink and a chunky blazing red `+` signal.
4. **Blazing Red Scrollbar & Slider Thumbs on Steel-Blue Tracks**: Signature Mirror's Edge 2008 kinetic hardware — unmistakable at a glance on both library views and Settings.
5. **Airy Italic Glass-Etched Uppercase Headings + Sunlit Skyline Silhouette**: Oblique `Sora` uppercase titles with subtle steel-blue etched depth over a glacial sky-mist canvas (`#EBF2FA`) with sunlit white/blue architectural towers (`city-skyline.png`) rising softly along sparse lower horizons.

## 3. Game Element Map (10 Rebuilt Mirror's Edge Elements)

| Source Element | Playnite Surface | Recognizable Cue |
| --- | --- | --- |
| **`STORY` Blazing Red Pillar + White `NEW GAME` Slab** | `Views/Sidebar.xaml` & `SidebarItem.xaml` | Full-height red glass rail with subtle `micro-grid.png` + `glass-sheen.png`; active item snaps to stark `#FFFFFF` bar with dark icon |
| **`UNLOCKABLES` Ice-Blue Glass Panel + 4-Edge Inner Shadow** | Metadata Dossier, `GroupBox`, `ContextMenu`, `ComboBox`, Game List | `#FAFDFF -> #DCEBFC` glass gradient + 9-slice `glass-inset.png` inner shadow + `1px` steel-blue rim + white top specular line |
| **`Faith sketches +` / `EDGE` Glossy Charcoal Selection Bar** | `DetailsViewItemStyle.xaml`, `Menu.xaml`, `TreeView.xaml` | Vertical charcoal-glass gradient (`#6D7177 -> #31353B`), pure white text, and chunky blazing red `+` mark |
| **`TIME TRIAL ONLINE` Red Scrollbar Thumb / Steel-Blue Track** | `DefaultControls/ScrollViewer.xaml` | Blazing red `#E81B08` thumb sliding in translucent steel-blue `#859EC4` glass rail |
| **`OPTIONS / VIDEO` Blue-Track / Red-Thumb Slider** | `DefaultControls/Slider.xaml` | `4px` steel-blue glass track (`#2F6291` / `#8BA8C6`) with blazing red rectangular glass block thumb |
| **`ARTWORK \| VIDEOS \| MUSIC` Glass Folder Tabs** | `DefaultControls/TabControl.xaml` | Raised snow-white glass active tab merging seamlessly into pane vs recessed ice-blue inactive tabs with bottom inner shadow |
| **Crimson Glass Play Slab + Diagonal Window Refraction** | `DerivedStyles/PlayButton.xaml` | Glossy crimson glass gradient (`#E81B08 -> #BE0F03`), `1px` white upper catchlight, sweeping `glass-sheen.png` beam & gliding white `+` / `>>` on hover |
| **Sunlit White-Blue Skyline Backdrop** | `StandardWindowStyle.xaml`, `EmptyGameTemplate`, Game Page foot | Subtle procedural geometric skyscrapers (`city-skyline.png`) dissolving softly upward into glacial sky-mist |
| **Chunky `+` Active Signal** | `PART_ToggleFilter`, Menu Separators, Selected Rows | Bold architectural `+` mark (Runner Bag Signal Amber on active filter; Runner Vision Red on selected rows & menu group breaks) |
| **Airy Italic Glass-Etched Titles (`UNLOCKABLES` / `STORY`)** | Game Page Title & Settings Masthead | Oblique `Sora` uppercase with subtle `1px,1px` steel-blue etched shadow |

## 4. Shell, Game Page & Menu Levers

- **Hero banner transition**: Sunlit glacial sky-mist horizon dissolve (`#00EBF2FA -> #D8EBF2FA -> #FFEBF2FA`) closed below the italic etched title by a steel-blue hairline + blazing red glass datum bar.
- **Play button**: `168×42` blazing crimson glass slab with white top specular edge, white left vertical strut, sweeping `glass-sheen.png` refraction on hover, press detent, and Rooftop Sky Cerulean (`#0068A3`) glass launching/running sweep with 3 staggered skewed momentum bars.
- **Metadata container**: Thick tempered ice-blue glass card (`300px` usable inner width) with 9-slice `glass-inset.png` inner shadow, `1px` steel-blue rim, raised bright-white glass header tab, and steel-blue glass dividers led by a crisp `+` / slash tick.
- **Chips & scores**: Translucent white-to-ice-blue glass tag chips with steel-blue rim inverting to glossy charcoal glass with white text & red left rail on hover; tabular `Consolas` Bold rating plaques.
- **Side-panel close plate**: Custom `28×28` frosted ice-blue glass square with velvety inner shadow, `1px` steel-blue rim, and top white catchlight, wiping to blazing crimson glass on hover.
- **Popup menus (`LocalStrideMenuBoardTemplate`)**: Tempered ice-blue glass board (`#FAFDFF -> #DCEBFC`) with 9-slice `glass-inset.png` inner shadow, `1px` steel-blue rim, and a `4px` blazing red vertical pillar along the left edge; glossy charcoal-glass wipe highlight with sliding red `+` mark and pure white inverted icons/text; recessed ice-blue glass `Consolas` keycaps; steel-blue hairline separators led by a red `+`; blazing crimson glass `Alt+Q` Exit row; steel-blue square check box with solid red check.

## 5. Motion & Restraint

- **Motion**: Fast `100ms`, Base `140ms`, Slow `320ms`, crisp `CubicEase` `EaseOut` (zero wobble).
- **Running / Launching (`RunningIndicatorBrush` = Rooftop Sky Cerulean `#0068A3`)**: Angled `-22°` sky-glass velocity sweep, `2px` bottom fill track, 3 staggered skewed momentum bars.
- **Restraint**: Dense text stays crisp `#111821` / `#345476` on bright frosted glass (`>= 5.2:1`–`15.5:1`), skyline silhouettes stay subtle (`0.14–0.20`) in sparse areas only, and light-theme `WindowArtForegroundBrush` flips unplated text cleanly when `ShowBackgroundImageOnWindow=True`.
