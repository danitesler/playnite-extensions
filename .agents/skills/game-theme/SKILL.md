---
name: game-theme
description: Create a new, creative, unique, and visually bombastic Playnite theme based on a game link or name.
---

Create a new, creative, unique, and visually bombastic Playnite theme based on this game (link or name provided by the user).

Follow the [new-theme workflow](../../../docs/themes/new-theme.md) and [creative direction](../../../docs/themes/creative-direction.md) at maximum ambition (`-Ambition Showcase`):
- Research the game thoroughly first (UI/HUD captures, color palette, typography, chrome, plates, iconography, and motion), recording sources and measurements in `RESEARCH.md` and writing `BRIEF.md` before scaffolding.
- In `BRIEF.md`, explore **3 distinct candidate lenses** (*Diegetic / Artifact*, *HUD / Telemetry*, *Title / Pause Menu*), compare them against the last 5 themes in `src/themes/AGENTS.md`, pick the least-repeated direction, and declare a source-derived choice for all 6 **Shell & Game Page Levers** (hero transition, Play button, metadata container/group break, chip & score silhouette, row/cover selection mark, 28x28 close plate).
- Author **bespoke `Icon<Role>` vector geometries** in `Media.xaml` (or `art/icons.mjs`) matching the game's icon language; reserve `icons.json` for Playnite's 24 rebuilt context-menu PNGs.
- Give the theme an original, evocative name (no official/trademarked title or copied logos) and ship `info/NOTICE-<Dir>.txt`.
- Build previews first (`art/preview-details.html`, `art/preview-settings.html`), render and verify them against the preview checklist, then implement the full XAML theme including custom `art/sprites.py` FX masks if needed, interactive layer, running game indicator, empty states, and window background support.

Requirement: the details view's metadata pane position is switchable Left / Center / Stretch / Right through `GameDetailsPanePosition` (default Right; Center and Stretch stretch metadata full-width on top in 3 / 2 / 1 columns; Left, Center and Stretch stack metadata above screenshots and description on narrow pages). See [Responsive game pages](../../../docs/themes/reference.md#responsive-game-pages).

Requirement: every popup menu and dropdown list (hamburger menu, top bar dropdowns, game and tray menus, `ComboBox` lists, multi-select boxes) wears one menu designed from the game's own pause/options menus: a signature panel, an animated highlight, a group break, shortcut and checked-row marks, Exit in the danger colour, compact 28-32px rows with arrows and shortcuts on the right edge. Pick levers no finished theme in the signatures table uses. See [Menus](../../../docs/themes/menus.md).

Requirement: both `DerivedStyles/DetailsViewItemStyle.xaml` (details list rows) and `DerivedStyles/GridViewItemStyle.xaml` (grid cover tiles) must have smooth, theme-aligned hover (`IsMouseOver`) and click/selection (`IsSelected`) animations matching the game's unique visual and motion language (e.g. branded wash/plate fade, subtle row slide or marker entrance, cover lift/frame lock, selection confirmation glint/bloom/settle), keeping inactive overlays `Visibility="Collapsed"` at rest and animating transforms only in `ControlTemplate.Triggers`. See [src/themes/AGENTS.md](../../../src/themes/AGENTS.md).
