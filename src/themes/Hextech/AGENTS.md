# Hextech â€” theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) inspired by the **League of Legends client**: near-black blue surfaces, dark-gold one pixel edges, cream headings, gold-tan interactive text, and hextech blue kept for the Play button and keyboard focus. Square corners throughout. Navigation is an icon rail on the left, docked by Playnite's Sidebar position setting. Unofficial: not affiliated with Riot Games, no Riot logos, fonts or artwork.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

**Scope.** This first version restyles the main window shell and the controls around it (navigation, toolbar, buttons, inputs, menus, sliders, scroll bars, tooltips, Play button). The library list and the game page are **Playnite's Default files read through this theme's palette** (gold selection bar and text, cream/grey text); they have not been restyled yet.

## Sources

Riot publishes no design system, so there is no pinned spec. The Riot sites (technology.riotgames.com, nexus, the wiki) were blocked from the build environment, so nothing was sampled from the client or read from Riot's own write-ups.

| What | Where |
|------|-------|
| Palette | Values as they circulate in community client UI kits and Pengu Loader themes (search results and repo READMEs, not Riot): gold `#C8AA6E` `#C89B3C` `#785A28` `#463714`, hextech blue `#0AC8B9` `#0397AB` `#005A82` `#0A323C`, `#A09B8C`, `#1E2328`, text `#F0E6D2` `#CDBE91`. The near-black surfaces (`hx-void`, `hx-page`, `hx-card`) and status colors are chosen by eye. Marked "kit" or "eye" in `src/tokens.css`. |
| Design language | Public descriptions of the client's Hextech UI: blue "Hextech Magic" buttons only for actions on the game itself, gold for everything else (navigation, secondary actions, modals). |
| Icons | Phosphor Icons 2.1.1, Regular (MIT, `info/LICENSE-phosphor.txt`), npm `@phosphor-icons/core`. The hexagon mark (`IconMainMenu`) is original. |
| Playnite structure | Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`), each shipped file restyled from its Default copy. |

## Tokens

Radii: 0 (`ControlCornerRadius`, `CornerRadiusSmall`), 2 (`CornerRadiusLarge`), pill for the notification badge. Fonts: Segoe UI body at 12 / 14 / 15 / 20 / 30; **Palatino Linotype** (`HeadingFontFamily`) for the game title and Play, the closest serif Windows ships to the client's Beaufort. Neither client font is bundled.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | Behavior |
|------|----------|
| `Views/MainWindow.xaml` | The sidebar docks with Playnite's Sidebar position setting; left is the default. |
| `Views/Sidebar.xaml` | Icon rail: 56px on `ShellBackgroundBrush`, a 1px dark-gold rule toward the library, the hexagon button (`PART_ElemMainMenu`, opens the main menu) at the start. Left and right are vertical; top and bottom become a strip, with 146px kept clear for the window buttons. |
| `CustomControls/SidebarItem.xaml` | Icon only, 56x48, 20px glyph; the title is the tooltip. Grey at rest, cream on a cool-grey fill when hovered, gold with a 3px gold bar on the edge facing the library when current. |
| `DerivedStyles/MainWindowStyle.xaml` | Caption height 48. Window buttons in the top right: 46x40, thin icons, cool grey on hover, red on close. |
| `Views/TopPanel.xaml` | Toolbar: 48px, page color, dark-gold rule, 146px clear on the right for the window buttons. Search (300px), view controls, filter toggle, notifications (red badge), plugin items, global progress. The hexagon button is repeated here only when Playnite shows it (sidebar hidden). |
| `CustomControls/TopPanelItem.xaml` | Flat 36px buttons: grey icon, cream on hover with a cool-grey fill, gold on a dark-gold wash when toggled. |
| `CustomControls/SearchBox.xaml` | Near-black well with a 1px dark-gold edge; brighter gold on hover, full gold while typing. `TopPanelSearchBox` is the same box on the toolbar. |

## Components

Everything else (combo boxes, check boxes, tabs, group boxes, list, game page) is Playnite's Default look with this theme's palette.

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations from the client

- **No client artwork or fonts.** The client's gold-gradient frames, hextech glow, animated backgrounds and Beaufort/Spiegel fonts are not reproduced. Edges are flat 1px lines.
- **Navigation is a left rail, not the client's top tab bar**, by request; icon only, titles are tooltips. The top position of the Sidebar setting gives a strip.
- **Game list and page are not restyled yet** (see Scope).
- **Colors are approximations** (see Sources).

## Not verified yet

Built and statically checked on Linux (`build-theme.ps1` under PowerShell 7). **Never loaded in Playnite**: no WPF or Windows here, so the XAML has not been compiled against the WPF assemblies and there is no real screenshot. Check first: the rail (gold bar on the current item, all four Sidebar positions, window buttons clear of the toolbar), the hexagon button opening the main menu, `SideItem.Title` showing as the tooltip, the two SidebarLibrary/Statistics icon `ContentControl`s in `Media.xaml`, menus and slider thumb, then the standard first-run list in `../AGENTS.md`.

## Preview and screenshots

Screenshots in `info/screenshots/` (`details.png` and `settings.png`) are rendered from `art/preview-details.html` and `art/preview-settings.html` via `take-screenshots.ps1`.
