# Greenfield XP — Research & Design Reference

Reference notes, color measurements, typography, component geometry, iconography, and motion observations for the **Windows XP Luna Blue** (`luna.msstyles`, 2001) visual style.

## 1. Sources & References

- **Microsoft Windows XP Luna Blue (`luna.msstyles`, NormalColor)**: Official Windows XP visual style specification (2001–2008): glossy Royal Blue title bars and taskbar, Grass Green Start button, warm cream-beige `#ECE9D8` dialog chrome, periwinkle `#D6DFF7` / `#7BA2E7` Explorer Common Tasks sidebars, `#316AC5` highlight selection, and Luna Orange `#F8B330` / `#E59700` button/tab hover glow.
- **XP.css (`botoxparty/XP.css`, MIT)** & classic Win32 `UxTheme` / `luna.msstyles` color measurements: verified hex stops for title bar gradients (`#0058EE`, `#3593FF`, `#288EFF`, `#127DFF`, `#036FFC`, `#0046D5`, `#00138C`), Start button green (`#55B535`, `#3C9C3E`, `#2E8B32`, `#1F6E23`), glossy red Close button (`#E86F54`, `#D5492B`, `#B72D12`), warm beige chrome (`#ECE9D8`, `#F7F5EA`, `#ACA899`), and Explorer Common Tasks (`#7BA2E7`, `#6375D6`, `#D6DFF7`, `#215DC6`).
- **Windows XP Iconography Guidelines (MSDN, 2001)**: 32-bit RGBA icons with 8-bit alpha channel, soft drop shadows, upper-left light source, isometric/angled perspective, warm golden manila folders, glossy green Go/Play orbs, blue-glass magnifiers, silver/blue metallic Control Panel tools, and vivid 48×48 / 16×16 clarity. All icons in Greenfield XP are clean-room original artworks rendered deterministically by `art/icons.py` (zero copyrighted Windows bitmaps or trademarks).

## 2. Measured Color Palette (`luna.msstyles` — Blue)

| Surface / Element | Hex / Stops | Contrast / Notes |
|-------------------|-------------|------------------|
| **Active Title Bar / Top Bar** | `#3F8CF3` (top sheen) → `#245EDC` (mid) → `#1941A5` (foot), edge `#00138C` | Glossy 3D cylindrical blue bar; white text (`#FFFFFF`) with dark-blue drop shadow |
| **Taskbar / Left Rail** | `#3168D5` → `#245EDC` → `#1941A5`, right edge `#00138C` | Signature Luna Blue vertical taskbar rail |
| **Start Button / Play Button** | `#55B535` (top gloss) → `#3C9C3E` (mid) → `#226E24` (foot); hover `#6AC961` → `#3BA33F` with `#FFD54F` inner glow | Classic Grass Green pill/tab (`>4.8:1` with white bold text on `#2B7C2D` base) |
| **Close Caption Button** | `#E86F54` → `#D5492B` → `#B72D12`, crisp `#FFFFFF` inner rim | Glossy coral-red rounded square (`3px` radius) |
| **Dialog / Chrome Face (`COLOR_3DFACE`)** | `#ECE9D8` (warm alabaster beige), light `#F7F5EA`, shadow `#ACA899`, inner shadow `#D6D2C2` | Unmistakably warm XP beige — distinct from Win98 cold `#C0C0C0` |
| **Document / List Client Area** | `#FFFFFF` (pure white), subtle Explorer card `#F7F9FE` | Calm, crisp readability (`21:1` with `#000000` ink) |
| **Explorer Common Tasks Pane** | Header `#FFFFFF` → `#C6D3F7`, card `#D6DFF7`, frame `#FFFFFF`, title `#215DC6`, hover `#428EFF` | Iconic XP left/right Explorer task dossier |
| **Button Face & Steel Border** | `#FFFFFF` → `#F4F3EE` → `#E2DFD6`, border `#003C74`, `CornerRadius="3"` | Rounded 3px XP push button |
| **Luna Orange Hover Glow** | `#FDD889` → `#F8B330` → `#E59700` | Inner rim glow on hovered buttons, checkboxes, radio buttons, and selected tab caps (`2px` orange top cap) |
| **Selection (`COLOR_HIGHLIGHT`)** | `#316AC5` (Luna Royal Blue) with `#FFFFFF` text (`5.35:1`) | Used for selected rows, menu items, TreeView nodes, ComboBox items |
| **Row Hover Wash** | `#EBF3FD` with `#B8D6FB` border | Subtle hot-track blue wash |
| **Balloon ToolTip** | `#FFFFE1` fill, `#000000` border, `4px` radius | Classic XP notification balloon |
| **Progress Bar (Segmented Green)** | `#28D438` → `#18A824` glossy blocks in sunken `#FFFFFF` trough (`#686868` rim) | Iconic XP 3-block segmented green progress bar |
| **Running / Launching Accent** | `#0E8A9E` (XP Messenger / System Tray Teal-Cyan), highlight `#35BBD1`, dark scrim `#06444E` | Dedicated hue distinct from Play green (`#3C9C3E`), selection blue (`#316AC5`), orange hover (`#E59700`), and filter gold (`#F5A623`) |
| **Typography Inks** | Primary `#000000` (`17.4:1` on `#ECE9D8`), Secondary `#4A4A4A` (`7.3:1` on `#ECE9D8`), Inverted `#FFFFFF` | All text passes WCAG AA (`>= 4.5:1`) |

## 3. Typography

- **Window Titles & Game Headings**: `Trebuchet MS` (Bold, native Windows font; mapped to `Selawik` in `scripts/data/fonts.json` for cross-platform preview rendering). Classic XP title bars use `Trebuchet MS` Bold with a crisp `1px` dark-blue text shadow.
- **UI Body, Lists, Buttons, Menus**: `Tahoma` (Regular / Bold, native Windows font; mapped to `DejaVu Sans` in `scripts/data/fonts.json`).
- **Monospace / Shortcuts / Scores**: `Consolas` (native Windows font).
- No bundled `.ttf` files required because `Tahoma`, `Trebuchet MS`, and `Consolas` ship natively on every Windows system.

## 4. Geometry, Borders & Surfaces

- **Radii**: `ControlCornerRadius = 3px` (classic XP rounded push buttons, inputs, checkboxes), `CornerRadiusSmall = 2px` (chips, inner frames), `CornerRadiusLarge = 5px` (Explorer task cards, popup panels, tab sheets), `CornerRadiusXLarge = 8px` (window top corners, Start/Play pill cap).
- **Glossy 3D Cylinders**: Title bar, top panel, taskbar rail, Start/Play button, and caption buttons use vertical 4-stop linear gradients with a bright upper specular band (`0–18%`), saturated midtone (`18–85%`), and deep lower bevel (`85–100%`).
- **Explorer Task Cards**: Rounded top corners (`5,5,0,0`), `#FFFFFF` → `#C6D3F7` header band with `#215DC6` bold title and circular chevron badge, over a `#D6DFF7` body bordered in `#FFFFFF` inside a `#7BA2E7` accent edge.

## 5. Iconography & Motion

- **Icons**: Clean-room Windows XP-style 32-bit glossy isometric PNGs (`48×48`, 4x supersampled in `art/icons.py`) for all 24 Playnite menu keys in `src/Images/WinXP/*.png` (golden manila folders, green Play orb, blue-glass magnifier, metallic wrench/gear settings, glossy red Turn Off exit, yellow wooden pencil, golden Favorites star, Bliss-hill desktop monitor, blue info orb, etc.), plus custom XP-proportioned vector `Geometry` icons in `src/Media.xaml` for toolbar/shell `Icon<Role>` slots so ThemeModifier and dark/light surfaces recolor cleanly.
- **Motion**: Crisp, responsive Luna transitions (`CubicEase`, `90ms` fast hover/orange-rim glow, `160ms` selection/tab/tree settle, `280ms` launching segmented green/teal sweep). No un-XP neon blooms; all motion reinforces glossy specular highlights, orange rim warm-up, and 1px tactile button press shifts.

## 6. Luna details added after the first pass

Checked against three reference captures of the stock Luna Blue desktop (Start menu, My Computer and My Documents Explorer windows, taskbar and tray). Hex values for gradients that no public source gives exactly were matched by eye from those captures, so treat them as close, not measured.

| Detail | Source in the captures | Where it lands |
|--------|------------------------|----------------|
| Start menu user header: glossy blue band, white-framed avatar tile, bold white name with a navy 1px shadow, orange stripe fading out underneath | Start menu capture | `ContextMenu.xaml` `StartHeader`, only when the menu's `PlacementTarget` is `PART_ElemMainMenu` |
| Start menu footer strip (Log Off / Turn Off Computer) | Start menu capture | `ContextMenu.xaml` `StartFooter`, same condition, carries the "Greenfield XP" wordmark |
| Start button's rounded end and bold italic lettering | Taskbar capture | `Sidebar.xaml` Start tile `CornerRadius="0,0,13,0"`; `PlayButton.xaml` `FontStyle="Italic"` |
| Quick Launch grip: two rows of light/dark dots after Start | Taskbar capture | `Sidebar.xaml` `QuickLaunchGrip` |
| Notification area: lighter cyan-blue plate with a dark top rule and speaker, network and shield icons | Taskbar capture | `Sidebar.xaml` `TrayArea`, `#1B97EE -> #0C6FD4`, rule `#0A4DB5` |
| Window frame: 1px specular line on the title band, 3px blue frame left, right and bottom, navy title shadow | Explorer window captures | `StandardWindowStyle.xaml`, `art/preview-settings.html` |
| Scroll bar thumb with three engraved grip lines (horizontal bars get vertical lines) | Explorer window captures | `ScrollViewer.xaml` `GripV` / `GripH` |

Sources are unofficial and the artwork is original; nothing here is a Microsoft bitmap.
