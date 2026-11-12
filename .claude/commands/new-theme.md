---
description: Start a new Playnite theme at Showcase level from a game, film, UI or design system
argument-hint: <source, e.g. "Hades pause menu"> [Showcase|Hybrid|Faithful]
---

Create a new Playnite theme inspired by: $ARGUMENTS

Go to the maximum. Unique game elements, signature animation and a full branding system drawn from the source. Show off every theme-design skill you have, within the repo's hard rules.

1. Load the `playnite-theme-dev` skill and read `creative-direction.md`, `settings-screens.md`, `previews.md` and `reference.md` before scaffolding.
2. Pick the ambition mode: the one named in the arguments, else Showcase for games, films and fictional UIs, Faithful for real design systems and OS UIs, Hybrid for a game whose UI is a clean system. Say which and why in one line.
3. Research deeply (root `AGENTS.md` -> New Theme Reference Research): colors, type, chrome, icons, and the source's interface parts and motion (HUD bars, slots, cursors, toasts, menu transitions).
4. Show me the brief before writing XAML: 5 name candidates with your pick, the five source-DNA traits, the game element map (8+ rows), the hero and secondary signature moments, the motion language and the branding system, including the banner darkening color (`GameBannerTintBrush`: the source's brand art tint or darkest branded surface, never plain black unless the theme is black). Wait for my OK, then scaffold with `-Ambition` and put the brief in `BRIEF.md`.
5. Build everything in `playnite-theme-dev` SKILL.md -> New theme, building what the brief names. Window background and banner tint are required: full-strength Playnite window art with a soft bottom edge, see-through chrome and a collapsed banner while it is on, both ThemeModifier banner sliders greyed out then, and the branded `GameBannerDarken` layer.
6. Run the review pass, fix the two lowest scores, re-render previews, then validate and build-deploy. Report the scores with evidence.
