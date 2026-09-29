# Warcraft III Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) that recreates the interface of Blizzard's **Warcraft III** (Frozen Throne era): blue-grey stone plates in bronze-and-gold trim, gold menu text, the F10 game menu, the in-game top strip and play-field frame, and the unit info console. Standalone: every file it ships lives in this folder. Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`), the same as every theme here; the theme's own token names (`--wc3-*`) stay in `tokens.css` and the template's placeholders.

Fan work, not affiliated with or endorsed by Blizzard Entertainment. Warcraft is a Blizzard trademark.

Playnite loading rules, overlay mechanics and the build checks are in **`.cursor/rules/playnite-themes.mdc`** and skill **`playnite-theme-dev`**.

## What is copied and what is not

The layout, palette and shapes follow the game's interface. **No Blizzard art is shipped.** The game's icons (`BTN*.blp`), frame textures, logo and fonts are Blizzard's copyright, so:

- Frames and plates are drawn in XAML (nested borders: dark outline, 2px bronze rim, stone face with a lit top edge and shaded bottom edge).
- Icons are **game-icons.net** (CC BY 3.0, `info/LICENSE-game-icons.txt`), one per Playnite role, recolored gold. They stand in for the game icon of the same role.
- Text is set in **Friz Quadrata** when it is installed (the game's font, not redistributable), falling back to Palatino Linotype, then Georgia.
- To use the game's own icons on a machine that has them, replace the PNGs in `Images/GameIcons/` of the installed theme with files of the same name (48px, transparent). Menu icons load through `ThemeFile`, so no other change is needed. Do not commit extracted game assets.

## Sources

| What | Where |
|------|-------|
| Palette, proportions, layout | Reproduced by eye from the Frozen Throne (1.26) main menu, Options and Game Menu dialogs, tooltips, top strip, and the Human console and unit info panel. Warcraft III publishes no design tokens; values in `tokens.css` are approximations, not extracted from game files. |
| Playnite base | Playnite Default theme at 10.60 (MIT, `info/LICENSE-Playnite.txt`), per `scripts/data/playnite-theme-api.json` |
| Icons | game-icons.net (github.com/game-icons/icons), Lorc and Delapouite, CC BY 3.0. Names per icon are in `gameicons.json`; regenerate with `python3 scripts/render-game-icons.py --extension warcraft3theme --source <checkout>` |

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | The `--wc3-*` tokens: stone, trim, text, in-game colors, radii, type sizes. `.dark` wins over `:root`. |
| `src/Constants.template.xaml` | Tokens to Playnite's palette keys and the shared keys; rendered into `Constants.xaml`. |
| `src/Common.xaml` | `PopupBorder`, `FocusVisual`, component spacing. Not templated: numbers are literal. |
| `src/Media.xaml` | `Icon*` geometries (generated block between `gameicons:begin` and `gameicons:end`), `IconTemplate` on a 512 grid, menu icon paths. |
| `src/Images/GameIcons/*.png` | The 48px gold menu icons Playnite loads by path. Generated. |
| `gameicons.json` | Which game-icons icon plays which key. Not `icons.json`: `render-icons.ps1` would feed this format to its own parameters. |
| `info/` | `theme.yaml`, installer and database manifests, `icon.png`, `LICENSE-Playnite.txt`, `LICENSE-game-icons.txt`. |

## Keys

Palette keys (Playnite):

| Key | Token | Used for |
|-----|-------|----------|
| `TextBrush` | `wc3-text-white` `#f6f1de` | body text, tooltips |
| `TextBrushDarker` | `wc3-text-dim` `#b9a877` | stat labels, secondary text |
| `TextBrushDark` | `wc3-text-on-gold` `#1b1200` | text on gold fills |
| `NormalBrush` / `NormalBrushDark` | `wc3-stone-plate` / `wc3-stone-deep` | plate face / outline and dark wells |
| `NormalBorderBrush`, `ButtonBorderBrush` | `wc3-trim` `#8f6e25` | bronze rim |
| `PopupBorderBrush` | `wc3-trim` | popup, window and panel frames |
| `GlyphBrush` | `wc3-text-gold` `#ffcc00` | the one accent: titles, hover rim, checked, selection text |
| `HoverBrush` | `wc3-text-gold` at 18% | ghost hover |
| `PopupBackgroundBrush`, `ExpanderBackgroundBrush` | `wc3-stone-panel` | menus, dialog panels |
| `TooltipBackgroundBrush`, `WindowBackgourndBrush` | `wc3-stone-deep` | tooltips, window |
| `PositiveRatingBrush` / `NegativeRatingBrush` / `MixedRatingBrush` | green / red / gold | scores |

Shared keys used: shell (`ShellBackgroundBrush`, `ContentBackgroundBrush`, `TopPanelBackgroundBrush`, `MainMenuButton*`), states (`SelectedBrush`, `SelectedForegroundBrush`, `ListItem*`, `MenuItemHoverBrush`, `FocusBrush`, `Danger*`), buttons (`Button*`, `PrimaryButton*`, `ToggleButtonCheckedBackgroundBrush`), inputs (`Input*`), controls (check box, slider, progress bar as the green health bar, scroll bar, tabs, `GridViewItemHoverBorderBrush`, `GridViewItemSelectedBorderBrush`), popups. `GridViewItemSelectedBorderBrush` (the green selection ring) was added to `theme-keys.json` for this theme; themes that do not define it fall back to their accent.

## Shell

| Warcraft III | Playnite | File |
|--------------|----------|------|
| Main menu: a column of stone plates | Sidebar, 176px, one plate per item with its icon and title; the menu plate on top (`PART_ElemMainMenu`) | `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` |
| Top strip of the in-game screen | Top panel: menu plate, search well, command-card buttons (34px stone squares), filter and notification plates, progress as a health bar | `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `SearchBox.xaml` |
| F10 Game Menu | Every context menu, main menu, game menu, tray menu | `DefaultControls/ContextMenu.xaml`, `Menu.xaml` |
| Play field in the console frame | Library views inside a bronze frame; background art drawn inside it | `Views/Library.xaml` |
| Dialog panels with gold titles | GroupBox, dialog windows | `DefaultControls/GroupBox.xaml`, `DerivedStyles/StandardWindowStyle.xaml` |
| Unit info console | Game info screen: framed portrait (cover), gold name, action plates, then Game Details / Notes / Description panels with title strips | `Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml` |
| Command card icon frame | Grid covers: 2px bronze rim, gold on hover, green selection ring | `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` |
| Map list | Details list rows | `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListBox.xaml` |
| Options screen controls | Check box, radio, slider, drop-down, edit well, tabs, scroll bar | `DefaultControls/*` |

## Deviations

- No resource bar (gold, lumber, food) and no minimap: Playnite has no data for them, and drawing fake numbers would be worse than leaving the slot out.
- Frames are XAML, not the game's stone textures; no bevel gradients (brushes stay solid so ThemeModifier can recolor them).
- No shadows on popups or tiles. The game's text shadow appears only on the game name in the info screen.
- Icons are stand-ins from game-icons.net, not the game's own (see above). Some menu icons carry a different meaning than in the game (the "medal" is favorites).
- The sidebar shows item titles as text, so it is 176px wide, not Playnite's 44px rail.
- `scripts/theme-tools.ps1` allows a Color reference on `HtmlForeground` and `LinkForeground` only: `HtmlTextView` has no brush property, and the overview views must set them as Default does.

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension warcraft3theme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Warcraft III Theme
```

## Not verified yet

Built and statically checked on Linux (template render, key vocabulary, reference and part-name checks); **never loaded in Playnite**. Nothing has been seen rendered. First run: sidebar in all four positions, top strip at narrow widths, main menu and game context menu, game info screen (details view and grid side panel) with and without a background image, grid view selection ring, filter and explorer panels, settings dialogs, a progress run in the top strip, and that the Friz Quadrata fallback reads well at 14px.
