---
name: game-theme
description: Create a new, creative, unique, and visually bombastic Playnite theme based on a game link or name.
---

Create a new, creative, unique, and visually bombastic Playnite theme based on this game (link or name provided by the user).

Follow the [new-theme workflow](../../../docs/themes/new-theme.md) and [creative direction](../../../docs/themes/creative-direction.md) at maximum ambition (`-Ambition Showcase`):
- Research the game thoroughly first (UI/HUD captures, color palette, typography, chrome, plates, iconography, and motion), recording sources and measurements in `RESEARCH.md` and writing `BRIEF.md` before scaffolding.
- Give the theme an original, evocative name (no official/trademarked title or copied logos) and ship `info/NOTICE-<Dir>.txt`.
- Build previews first (`art/preview-details.html`, `art/preview-settings.html`), render and verify them against the preview checklist, then implement the full XAML theme including custom `art/sprites.py` FX masks if needed, interactive layer, running game indicator, empty states, and window background support.

Requirement: the details view's metadata pane position is switchable Left / Center / Stretch / Right through `GameDetailsPanePosition` (default Right; Center and Stretch stretch metadata full-width on top in 3 / 2 / 1 columns; Left, Center and Stretch stack metadata above screenshots and description on narrow pages). See [Responsive game pages](../../../docs/themes/reference.md#responsive-game-pages).
