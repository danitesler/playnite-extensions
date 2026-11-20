---
description: Build a new Playnite theme at maximum ambition from a game, film, UI or design system
argument-hint: <source, e.g. "Hades pause menu"> [Showcase|Hybrid|Faithful]
---

Create a Playnite theme inspired by $ARGUMENTS. Follow the [new-theme workflow](../../docs/themes/new-theme.md) and use the requested ambition mode.

Requirement: the details and grid views' metadata pane position is switchable Left / Center / Stretch / Right through `GameDetailsPanePosition` (default Right; Center and Stretch stretch full-width on top with group dividers hidden so items flow sequentially in a 3 / 2 / 1-column grid; Left, Center and Stretch stack metadata above screenshots and description on narrow pages). See [Responsive game pages](../../docs/themes/reference.md#responsive-game-pages).

Requirement: every popup menu and dropdown list (hamburger menu, top bar dropdowns, game and tray menus, `ComboBox` lists, multi-select boxes) wears one menu designed from the source: a signature panel, an animated highlight, a group break, shortcut and checked-row marks, Exit in the danger colour, compact 28-32px rows with arrows and shortcuts on the right edge, and levers no finished theme in the signatures table uses. See [Menus](../../docs/themes/menus.md).
