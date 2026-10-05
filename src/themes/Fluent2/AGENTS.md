# Fluent-inspired — theme notes

## What this is

Playnite **Desktop** theme named **Fluent-inspired** (`ThemeApiVersion` 2.9.0, Playnite 10.45+), in the style of Microsoft's **Fluent 2** design system (Fluent UI React v9, `@fluentui/react-theme` 9.2.2), dark variant only (`webDarkTheme` tokens), with a Windows 11 style app shell. The Id `Fluent2_3EA906E4`, key `fluent2` and folder `Fluent2` keep the original name so released installs keep updating; only the display name changed.

Unofficial: not affiliated with, endorsed by or sponsored by Microsoft Corporation. Fluent, Windows and Microsoft are named only as the look's inspiration. No Microsoft logo, Windows logo, font or artwork ships; the icons are the open-licensed Fluent UI System Icons (MIT, `info/LICENSE-fluentui-system-icons.txt`), see `info/NOTICE-Fluent2.txt`. Never use the Windows logo or any Microsoft mark in the icon, previews or listing, and never put "Microsoft", "Windows" or "Fluent 2" alone as the theme's name.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Keys are the shared vocabulary; the template names the Fluent token behind each one (`borderRadiusMedium` is `ControlCornerRadius`, `strokeWidthThin` is `ControlBorderThickness`).

Fluent has two blues: `colorBrandBackground` (dark, white text) fills primary buttons; the lighter compound brand (dark text) marks state. Font: `fontFamilyBase` (Segoe UI); the Playnite size ramp follows Fluent's (12 / 14 / 16 / 20 / 28).

Siblings: `createDarkTheme(brandVariants)` gives any brand ramp, and `teamsDarkTheme` uses the same names; swap the values in `tokens.css`.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

Windows 11 layering: the window is the base layer (`colorNeutralBackground2`, standing in for Mica) holding the title-bar row and the navigation rail; the library sits on a lighter content layer.

| File | Fluent behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat base layer. |
| `DerivedStyles/MainWindowStyle.xaml` | Windows 11 caption buttons (`MainWindowButton`): 46x32, square, flush with the top-right corner; subtle fill on hover, red for close. |
| `Views/Sidebar.xaml` | NavigationView, LeftCompact: 48px rail, no border; the pane toggle (`MainMenuButton`, `PART_ElemMainMenu`) in the title-bar row; 40x36 items with a 4px gutter. |
| `CustomControls/SidebarItem.xaml` | NavigationViewItem: 40x36, borderRadiusMedium, 20px icons, subtle hover fill; selected = subtle fill + 3x16 compound-brand pill on the left edge. |
| `Views/TopPanel.xaml` | 48px title-bar row: search (`TopPanelSearchBox`) centered, up to 468px; subtle 32px icon buttons on the right; brand CounterBadge for notifications. |
| `CustomControls/TopPanelItem.xaml` | Button subtle, icon only: 32px; hover and checked = subtle fill + brand icon. |
| `CustomControls/SearchBox.xaml` | SearchBox (outline): Input chrome with a 20px search icon and a dismiss icon. |
| `Views/Library.xaml` | Content layer on `colorNeutralBackground1`, top-left corner rounded 8px where it meets the rail (base-colored mask); square when the rail is elsewhere or hidden. The background art fades out on every edge. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Playnite's panels on Fluent's spacing ramp without separators. |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | Microsoft Store product page: hero art 320px fading into the content layer (hidden without art); box art tile (borderRadiusLarge, 1px `colorNeutralStroke2`), title at 28px semibold, large primary Play, secondary More, subtle icon Edit. Below, two columns under 20px semibold headings, no cards: the main column holds Steam screenshots, Description and Notes; the 320px column on the right holds every metadata field Playnite can show, each a Caption 1 (12px) `colorNeutralForeground3` label over its Body 1 value, in six groups split by 1px `colorNeutralStroke2` Dividers (progress, scores, about, tags as small outline InteractionTags, library, links; see `.claude/skills/playnite-theme-dev/reference.md`). A group whose fields are all hidden collapses with its Divider. The grid panel uses the same two columns after its header: Steam screenshots, Description and Notes on the left (16px headings), Game details on the right (320px). Fields left out are parts Playnite skips. |

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations from Fluent

- The notification CounterBadge (`TopPanel.xaml`) uses `ControlCornerRadius` (4px), not Fluent's capsule: its width grows with the count, so `CornerRadiusFull` would stretch it into an oval in WPF (AGENTS.md Control Corner Radii). The preview draws the same 4px corners.
- No shadows (`shadow16` on menus and tooltips, `shadow4` on cards). Popups get a `colorNeutralStroke2` edge instead of Fluent's transparent stroke; cards have no edge.
- No Mica or acrylic: WPF layered popups and Playnite's window can't use the Windows 11 backdrop from a theme; the base layer is a flat color.
- MenuItem text stays `colorNeutralForeground1` (Fluent uses `Foreground2` at rest): Playnite's MenuItem style sets the item foreground, and disabled items rely on it.
- Menu icons Playnite copies stay icofont glyphs (Playnite rebuilds them from `Text`/`FontFamily`).
- Views other than the library (Statistics, add-on views) sit on the base layer; only the library gets the content layer.
- The game overview has no Cards: the content layer and Fluent's Card are both `colorNeutralBackground1`, so the Store's sections are headed blocks instead.
- The details pane has no group headings (themes cannot ship localization, so there are no captions for "progress", "about" and so on): groups are told apart by Dividers and spacing. The Store's own page is a single column; the second column is this theme's addition so all metadata sits in one place.

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run checklist: follow standard list in `../AGENTS.md`. Also: the focus underline animation on text boxes and dropdowns (and that it resets when focus leaves), the curved bottom edge at the corners, the white 2px focus outline next to panel edges, the checkmark and chevron icons in menus and dropdowns, and how visible the subtle selected row is in the details view.

Layout checks: the content layer's rounded corner with the background image on (details view), the corner going square with the rail on the right or hidden, the centered search shrinking in narrow windows, caption buttons flush with the corner (also maximized), and the rail's brand pill.

Game overview: the hero fade into the content layer, the box art tile mask and edge, the two columns at narrow pane widths (the details column is a fixed 320px, the main column has a 240px minimum), the Dividers and the collapse of a group whose fields are hidden (the first visible group starts flush under the heading), InteractionTag wrapping, long install folders. Grid side panel: the same 320px details column beside screenshots, description and notes (widen the panel if the left column is squeezed).
