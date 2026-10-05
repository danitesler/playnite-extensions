# Cold Seat — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) after the **Warcraft III: The Frozen Throne main menu**: near-black blue void, stone button plates with a lit top/left and dark bottom/right bevel, gold labels that turn white on hover, frozen-ice blue for glow and selection. Dark only. Unofficial and standalone: no Blizzard asset is in it (`info/NOTICE-ColdSeat.txt`). Resource keys are the shared vocabulary; the game's look lives in `tokens.css` under this theme's own `--wc3-*` names.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

**Intended layout: the sidebar on the left** (repo rule): a 44px compact stone rail. Right mirrors it; top and bottom draw a strip as a fallback.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

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

`ButtonPadding` 14,6; `InputPadding` and item paddings 8,5; menu surface 3; group box 12; tooltip 10,6; `IconSize` 16; `GameBannerHeight` 320; `GameDetailsPaneWidth` 330; `GridDetailsPaneWidth` 280. `BevelTemplate` (lit top/left, dark bottom/right) is defined there too.

## Shell

Left 44px stone rail with a bevelled library-side edge, icon-only items (gold, white on hover, ice glow when current); a night top strip with icon view switches and a search box, 146px clear for the caption buttons; library art cooled and dimmed under `ScrimBrush` and `ArtTintBrush`; caption buttons 46x40 with a red close hover.

## Game page

Shared skeleton. Gold title, Esc-menu style double frame (stone rim plus inner dark line) around the metadata pane, gold PLAY plate beside blue-bar More and Edit buttons (`SecondaryButton`, `--wc3-blue*`).

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
