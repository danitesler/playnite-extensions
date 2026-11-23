# Clearwater — Research Notes

## Source Overview

- **Inspiration**: **macOS 26 (Tahoe) — Liquid Glass** design language (Apple Human Interface Guidelines, introduced WWDC 2025 / released Fall 2025).
- **Branding & Trademark**: Unofficial fan theme. Not affiliated with, endorsed by, or sponsored by Apple Inc. No Apple logo, macOS wallpaper, SF Pro font, or Apple SF Symbols binary assets ship. All vector geometries, optical glass masks, and 48×48 full-color glass menu icons are original deterministic builds.

## Measured Visual & Structural Characteristics

### 1. Liquid Glass Material & Layering (Apple HIG Navigation Layer Rule)
- **Navigation vs. Content**: Liquid Glass belongs on the floating navigation layer (toolbar, sidebar, popovers, context menus, floating action controls). Content surfaces (library lists, game descriptions, metadata body) stay clean, bright, and high-contrast so text legibility never degrades.
- **Optical Refraction & Specular Edge**: Every glass surface combines three optical cues achievable in WPF without heavy `BlurEffect` or `DropShadowEffect`:
  1. A subtle translucent cool-white to glacial-blue vertical gradient (`#FFFFFF` → `#F1F6FC` → `#E8F0FA`).
  2. A crisp `1px` bright white top specular catchlight (`#E6FFFFFF` / `#FFFFFF`) simulating top-down glass lensing.
  3. A soft translucent outer hairline border (`#C5D4E6` / `#B5C7DD`) and optional 9-slice pure-white inner specular bloom (`src/Images/fx/glass-rim.png`).

### 2. Palette (macOS 26 Tahoe Light Mode)

| Role | Token | Hex | Notes |
|------|-------|-----|-------|
| Window canvas | `--tahoe-canvas` | `#E6EEF7` | Cool alpine mist under floating glass |
| Sidebar glass rail | `--tahoe-glass-rail` | `#DEE8F4` | Translucent frosted sidebar chrome |
| Top bar glass | `--tahoe-glass-bar` | `#EDF3FA` | Floating toolbar glass band |
| Content surface | `--tahoe-surface` | `#F8FBFF` | Clean high-legibility library & overview surface |
| Raised card / glass plate | `--tahoe-card` | `#FFFFFF` | Frosted white card, metadata dossier, popovers |
| Glass hover fill | `--tahoe-hover` | `#E3ECF7` | Subtle cool glass hover wash |
| Glass pressed fill | `--tahoe-pressed` | `#D4E2F3` | Tactile pressed glass state |
| Glass border / hairline | `--tahoe-border` | `#C3D2E4` | Soft refracted hairline stroke |
| Subtle divider | `--tahoe-divider` | `#DCE5F0` | Group breaks, metadata hairlines |
| Primary ink | `--tahoe-ink` | `#1C1F26` | Apple Label primary dark ink (~14.5:1 on white) |
| Secondary ink | `--tahoe-ink-secondary` | `#556070` | Apple Secondary Label (~6.1:1 on white) |
| Accent (System Blue) | `--tahoe-blue` | `#007AFF` | Primary action, active pill, selection, focus |
| Accent hover | `--tahoe-blue-hover` | `#0066DB` | Deepened optical blue on hover |
| Accent pressed | `--tahoe-blue-pressed` | `#0052B4` | Pressed glass lens blue |
| Accent soft tint | `--tahoe-blue-tint` | `#DCEBFF` | Selected list row / soft active wash |
| Running (System Green) | `--tahoe-green` | `#22B43C` | Launching/running indicator (distinct from blue) |
| Danger (System Red) | `--tahoe-red` | `#D70015` | Destructive action, Exit row (5.6:1 with white text) |
| Traffic Light Close | `--tahoe-tl-red` | `#FF5F57` | Window close dot |
| Traffic Light Min | `--tahoe-tl-yellow` | `#FEBC2E` | Window minimize dot |
| Traffic Light Zoom | `--tahoe-tl-green` | `#28C840` | Window maximize/restore dot |
| Filter / Notif (System Orange) | `--tahoe-orange` | `#FF9500` | Filter-active dot, badge accent |
| Banner tint | `--tahoe-banner-tint` | `#1B2A42` | Deep alpine lake blue for hero banner darkening |
| Window art foreground | `--tahoe-art-fg` | `#F5F8FC` | Crisp light ink when window background art is on |

### 3. Typography
- **Source face**: Apple **SF Pro** (proportional neo-grotesque with softly rounded terminals and crisp tabular numerals) + **SF Mono**.
- **Open-source stand-in**: **Barlow** (SIL OFL, `scripts/fonts/barlow/`) — static weights `Regular`, `Medium`, `SemiBold`, `Bold` subset to Latin + Cyrillic into `src/Typography/`. Monospace fallback: `Cascadia Mono, Consolas`.
- **Type scale**: `12 / 14 / 15 / 20 / 28` (`FontSizeSmall` through `FontSizeLargest`).

### 4. Geometry & Radii
- **Continuous curves**: `ControlCornerRadius` = `8` (buttons, inputs, Play pill, metadata chips, selected rows); `CornerRadiusSmall` = `6` (compact pills, menu rows); `CornerRadiusLarge` = `12` (metadata dossier card, popup menus, group boxes, covers).
- **Hairline rims**: `ControlBorderThickness` = `1`, `PopupBorderThickness` = `1`.

### 5. Iconography
- **Toolbar / sidebar / UI glyphs (`Icon<Role>` in `src/Media.xaml`)**: Original 20×20 vector geometries drawn in SF Symbols proportions (uniform `1.5px` optical stroke weight, rounded linecaps and joins, clean geometric balance) rendered via `IconTemplate` in inherited `Foreground`.
- **Menu icons (24 Playnite keys in `src/Images/MacGlass/*.png`)**: Deterministic 48×48 (4× supersampled) full-color macOS Tahoe Liquid Glass squircle-and-emblem PNGs generated by `art/icons.py` (Pillow + NumPy), giving every popup menu and context menu the same authentic OS-native visual polish as `BlissXp` and `Silver98`.

### 6. Motion Language
- **Fast (`120ms`)**: Glass hover highlights, traffic-light symbol reveal, menu highlight pill, button specular sheen.
- **Base (`200ms`)**: Selection pill glide, cover hover elevation & glass sheen sweep, tab & tree selection.
- **Slow (`340ms`)**: Main menu prism lens open pose, launching optical scan sweep.
- **Easing**: Smooth `CubicEase` (`EaseOut`) matching macOS fluid spring-damped responsiveness without bouncy game-UI overshoot.
