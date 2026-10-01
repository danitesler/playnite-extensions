# Primer — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of GitHub's **Primer** design system, on Primer's `dark` functional tokens.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Tokens | `@primer/primitives` 11.10.0: `dist/css/functional/themes/dark.css`, `functional/size/radius.css`, `border.css`, `size.css` |
| Components | `@primer/react` 38.40 CSS: Button, IconButton, TextInput, Select, Checkbox, Radio, ToggleSwitch, ActionList, ActionMenu / Overlay, UnderlineNav, NavList, ProgressBar, Tooltip; GitHub's Box / Box-header |
| Icons | Octicons 19.38.0 (MIT, `info/LICENSE-octicons.txt`), 16px set |

## Tokens

Keys are the shared vocabulary; the template names the Primer token behind each one.

`ButtonBackgroundBrush` holds Primer's default button fill (`control-bgColor-rest`), so Playnite's notification toasts, which read it too, share that color.

Primer has two accents: blue (`accent`) for focus, checked controls, selection and links; green (`button-primary`) for primary buttons and progress. Translucent tokens keep their alpha; the popup edge is flattened onto the overlay. Font: `fontStack-sansSerif` resolves to Segoe UI on Windows; Mona Sans is not bundled.

Siblings: Primer's other dark themes (`dark-dimmed`, `dark-high-contrast`, `dark-colorblind`, `dark-tritanopia`) use the same token names; swap the values in `tokens.css` from that theme's CSS.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

GitHub's page layout: `bgColor-default` everywhere except one dark band (`bgColor-inset`) across the top, with no borders between regions.

| File | Primer behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat: sidebar and view on `bgColor-inset`, the same color as the header band. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as invisible IconButtons (32px, `MainWindowButton`) on the band, 16px from the top; close takes the danger hover. |
| `Views/Sidebar.xaml` | Navigation rail on the page color. Its top 64px is painted in the band color and holds the three-bars button (`MainMenuButton`, `PART_ElemMainMenu`). |
| `CustomControls/SidebarItem.xaml` | NavList item, icon only: 32px, 16px octicons in `fgColor-muted`; the current item gets the fill and NavList's 4x24 accent bar 8px outside the item. |
| `Views/TopPanel.xaml` | AppHeader: 64px band, 16px padding; search (`TopPanelSearchBox`, TextInput medium, 272px), then the view controls, filters and notifications as invisible IconButtons; notifications show GitHub's unread dot. |
| `CustomControls/TopPanelItem.xaml` | Invisible IconButton, medium; toggled = `control-transparent-bgColor-selected`. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml`, `Views/Library.xaml` | Playnite's panels on Primer's base-size scale without separators; background art under the band, feathered on every edge. |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | GitHub's repository page. Header: icon and name (20px semibold) on the left; Edit (IconButton, octicon pencil), More (triangle-down) and green Play on the right; a rule under it. Main column: README Box (GroupBox "Description") and a Notes Box. 296px sidebar (BorderGrid) holding every metadata field Playnite can show, each a 12px semibold `fgColor-muted` label over its value (as an issue's sidebar lists Assignees and Labels), in six sections split by 1px `borderColor-default` rules (progress, scores, about, tags as topic tags, library, links; see `.claude/skills/playnite-theme-dev/reference.md`). A section whose fields are all hidden collapses with its rule. No art, no cover. The grid panel uses the same two columns (a 280px sidebar on the right); no tabs. Fields left out are parts Playnite skips. |

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations from Primer

- Header search and icon buttons use the invisible variant (no edge) to keep the band quiet; the search input keeps its edge.
- No shadows: the Overlay keeps only the 1px ring `shadow-floating-small` starts with.
- `GlyphColor` is `bgColor-accent-emphasis` (`#1f6feb`) because Playnite also uses it as a fill under white text; Primer's link color (`fgColor-accent`, `#4493f8`) is a little lighter.
- Menu icons are octicon PNGs in `src/Images/Octicons` (48px, `fgColor-muted`; `fgColor-danger` for exit and remove), referenced by path because Playnite rebuilds TextBlock icons from their glyph and font. They don't follow a token change; the list, colors and Octicons tag are in `icons.json`, so after a palette change update the colors there and run `.\scripts\render-icons.ps1 -Extension primer`.
- Overview fields have visible labels, not octicons with a tooltip: there are 25 fields and Octicons for a handful, and the sidebar has no section headings because themes cannot ship localization (sections are told apart by the rules and spacing).

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run checklist: follow standard list in `../AGENTS.md`. Also: green default buttons in dialogs, the coral tab bar alignment, the thick radio ring, the inside focus outline on green and blue buttons, the Box headers in settings, the leading check in dropdowns, and the checkbox mark.

Layout checks: the band continuing through the sidebar's top, the right-hand cluster at narrow widths, the current-item bar next to the selected sidebar item (not clipped), the unread dot, the pill-shaped slider knob.

Known limit: the header band belongs to the library view, so on other views (Statistics, add-on views) only the sidebar's top shows the band color.

Game overview: the two-column page at narrow pane widths (the sidebar is a fixed 296px), topic-tag wrapping, the sidebar sections and the collapse of a section whose fields are hidden (the first visible section starts flush under the heading), long install folders wrapping, the green Play next to More and Edit.
