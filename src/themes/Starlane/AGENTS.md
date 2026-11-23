# Starlane — theme notes

Unofficial *Star Wars*-inspired minimalist OLED desktop theme (`Showcase` ambition). Shared anatomy lives in [src/themes/AGENTS.md](../AGENTS.md); research and plan in [RESEARCH.md](RESEARCH.md) and [BRIEF.md](BRIEF.md).

## Palette & Surfaces
- Pure `#000000` OLED black across shell, library, game page, and Settings (`--sw-oled`), dusted with a calm procedural starfield (`src/Images/fx/starfield.png`).
- **Opening Title Yellow (`#FFE81F`)**: 8-direction hollow-outlined Star Wars movie titles (`OutlinedTextTemplate` + `PART_TextDisplayName`), Orbitron section headings, and selected cover frames.
- **Multi-Color White-Cored Lightsabers**:
  - **Jedi Blue (`#28A8FF`)**: `PlayButton` hover ignition, vertical selected row/rail/tree beams, focus rings, sliders, and popup menu highlights.
  - **Consular Green (`#18C958`)**: `RunningIndicatorBrush` launching sweeps & running idle hum, checked `CheckBox`, menu checkmarks, positive scores.
  - **Sith Red (`#E52222`)**: `DangerBrush` (`Alt+Q` Exit blade, `SidePanelCloseButton` hover, `RUNNING` Cancel hover, negative scores).
  - **"A Long Time Ago..." Cyan (`#4BD5EE`)**: active filter diamond pip (`DataChangeNotifBrush`), links, and subtle captions.

## Typography
- `PosterFontFamily`: `./Typography/#Unbounded` (`SemiBold`, `Bold`, subsetted OFL) — hollow-yellow outlined game titles and Settings window title.
- `HeadingFontFamily`: `./Typography/#Orbitron` (`Regular`, `SemiBold`, `Bold`, unmodified OFL due to Reserved Font Name) — section headers, Play label, scores.
- `FontFamily`: `./Typography/#Barlow` (`Regular`, `Medium`, `SemiBold`, `Bold`, subsetted OFL) — calm News-Gothic-inspired body & list text.
- `MonospaceFontFamily`: `Consolas` (Chromium preview alias: `Cascadia Mono`).

## Generators & FX Assets
- `art/sprites.py` -> `src/Images/fx/{starfield,saber-beam-h,saber-beam-v,saber-frame}.png` (pure-white RGBA masks colored via `OpacityMask`).
- `art/gen-overviews.mjs` -> generates `src/Views/DetailsViewGameOverview.xaml` and `src/Views/GridViewGameOverview.xaml` through `scripts/overview-generator.mjs` + `scripts/game-page-breakpoints.mjs`.
- `art/mark.svg` -> 1:1 round orbital station silhouette (`info/icon.png` rendered in default `#FF7A1A` orange).

## Running Game
- `RunningIndicatorBrush` = Consular Green (`#18C958`).
- **Launching (`1.6s`)**: horizontal emerald plasma sweep (`RunningScan`), white-cored foot blade (`RunningFill`), and 3 staggered vertical lightsaber power pips (`Pip1..3`, reserved via `PlayRoom` 28px / `RowRoom` 32px). Worst-frame launching contrast: `5.24:1` (`#FFFFFF` over `RunningBreath`).
- **Running (`3.2s`)**: calm idle hum (`0.72 -> 1 -> 0.72`); hovering `RUNNING` switches to Sith Red `Cancel` (`PlayContent` `Visibility="Hidden"`).

## Previews
- `art/preview-details.html` & `art/preview-settings.html` -> `art/screenshot-{details,settings}.png`.
- Motifs: pure OLED starfield, hollow-yellow `Unbounded Bold` titles, full-width igniting Blue Lightsaber Play blade, vertical Blue/Green lightsaber rows, glowing Blue slider, and OLED menu with Blue highlight / Green check / Sith Red Exit.
