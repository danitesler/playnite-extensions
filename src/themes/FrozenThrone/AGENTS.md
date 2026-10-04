# Frozen Throne — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) after the **Warcraft III: The Frozen Throne main menu**: near-black blue void, stone button plates with a lit top/left and dark bottom/right bevel, gold labels that turn white on hover, frozen-ice blue for glow and selection. Dark only. Unofficial and standalone: no Blizzard asset is in it (`info/NOTICE-frozenthrone.txt`). Resource keys are the shared vocabulary; the game's look lives in `tokens.css` under this theme's own `--wc3-*` names.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

**Intended layout: the sidebar on the left** (repo rule): a 44px compact stone rail. Right mirrors it; top and bottom draw a strip as a fallback.

## Sources

Blizzard publishes no design system and the game draws its panels with BLP textures, so only text values are sourced. `tokens.css` tags each value `[FDF]` (verified) or `[eye]` (estimated).

| Tag | What | Where |
|-----|------|-------|
| `[FDF]` | Label/button text gold `#FCD312` (FontColor 0.99 0.827 0.0705), highlight white, disabled `#808080`, shadow black at 90%, titles white (glue) or gold (main menu); Friz Quadrata (`FRIZQT__.TTF`) for every UI font; frame proportions (glue button corner 0.016, Esc panel 0.288 x 0.384 with 0.01 insets, checkbox 0.024, radio 0.016, slider 0.139 x 0.012, scrollbar 0.012, edit box 0.04 tall) | `EscMenuTemplates.fdf` in [tdauth/wowr](https://github.com/tdauth/wowr) @ `361680f`; `UI/FrameDef/Glue/StandardTemplates.fdf`, `UI/war3skins.txt` in [WarRaft/War3.mpq](https://github.com/WarRaft/War3.mpq) @ `bce1f9d`. The skin files read were the Human skin; the Frozen Throne main menu skin itself was not read. |
| `[eye]` | Void `#05080F`, night `#0B111B`, stone `#2A2F36`, stone rim `#6B7480`, ice `#5FB4E8`, ice light `#BFE6FF` and the derived steps | Chosen by eye from memory of the menu scene; nothing is measured against a capture (image hosts were not reachable). |
| Fonts | Friz Quadrata TT, then Palatino Linotype, Book Antiqua, Georgia | Friz Quadrata is not bundled and not on Windows. |
| Icons | Original line artwork, 24 grid | `src/Media.xaml`; menu icons stay Playnite's glyphs. MIT with the repo. |
| Tile icon | `art/mark.svg` (original ice spire), default orange | `scripts/render-addon-icon.py` |
| Playnite | Every file starts from the Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`) | |

## Tokens

Type: body and headings `Friz Quadrata TT, Palatino Linotype, Book Antiqua, Georgia`; sizes 12 / 14 / 15 / 20 / 29. `ControlCornerRadius` 2, small 1, large 4, x-large 6.

| Token | Key |
|-------|-----|
| `--wc3-gold` | `GlyphBrush`, `ButtonForegroundBrush`, `FocusBrush`, `HeadingForegroundBrush`, sidebar glyphs |
| `--wc3-white` | `TextBrush`, hover text, `TooltipForegroundBrush` |
| `--wc3-muted` | `TextBrushDarker` |
| `--wc3-void` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `TextBrushDark` (text on gold) |
| `--wc3-night` | `NormalBrushDark`, `PopupBackgroundBrush`, `TooltipBackgroundBrush`, `ExpanderBackgroundBrush` |
| `--wc3-stone` / `-light` / `-dark` | `ButtonBackgroundBrush` / `HoverBrush`, `ButtonHoverBackgroundBrush` / `InputBackgroundBrush`, `ButtonPressedBackgroundBrush` |
| `--wc3-stone-border` | `NormalBorderBrush`, `PopupBorderBrush`, `InputBorderBrush`, `ScrollBarThumbBrush` |
| `--wc3-ice` | `SelectedBrush` (28%), `SidebarItemSelectedGlowBrush` (45%), `ProgressBarForegroundBrush`, `ArtTintBrush` (10%) |

## Component spacing (`src/Common.xaml`)

`ButtonPadding` 14,6; `InputPadding` and item paddings 8,5; menu surface 3; group box 12; tooltip 10,6; `IconSize` 16; `GameBannerHeight` 320. `BevelTemplate` (lit top/left, dark bottom/right) is defined there too.

## Shell

Left 44px stone rail with a bevelled library-side edge, icon-only items (gold, white on hover, ice glow when current); a night top strip with icon view switches and a search box, 146px clear for the caption buttons; library art cooled and dimmed under `ScrimBrush` and `ArtTintBrush`; caption buttons 46x40 with a red close hover.

## Game page

Shared skeleton. Gold title, Esc-menu style double frame (stone rim plus inner dark line) around the metadata pane, gold PLAY plate beside stone More and Edit buttons.

## Components

Every control is a stone plate: Button, ToggleButton, RepeatButton, TextBox, ComboBox, CheckBox, RadioButton, Slider, ScrollBar, TabControl, GroupBox, ListBox, menus, tooltip. Gold labels, white on hover, gold dashed focus.

## Deviations

- **No textures:** the game's stone, ice and Arthas/Frozen Throne scene are BLP art; the theme draws flat plates with a one-pixel bevel and shows each game's own art under a cold wash.
- **Text shadow on the game title only:** the game shadows every label with black at 90%; the theme draws it only on the game page title (a 2px `DropShadowEffect`), nowhere else.
- **Not the game's font** unless Friz Quadrata TT is installed.
- **Hover:** the game alpha-blends a highlight texture; the theme swaps fills.

## Not verified yet

- Stone, ice and void hexes are estimates; compare with a capture of the Frozen Throne menu.
- Builds and passes `validate-extension.ps1`, but nothing has been loaded in Playnite: it was authored on a Linux server, where Playnite is never run. Run `build-theme.ps1 -Deploy -Restart` on Windows and check `playnite.log` for XAML errors.
- The Steam screenshots skeleton binds `Game.PluginId` to the Steam library GUID; confirm it shows.
- Friz Quadrata fallbacks and sizes at 1080p.
