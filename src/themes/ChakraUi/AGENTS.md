# Chakra UI — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of **Chakra UI v3**, fully dark with **teal** as the color palette.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

| What | Where |
|------|-------|
| Tokens | `chakra-ui/chakra-ui` 3.37 `packages/react/src/theme`: `tokens/colors.ts`, `semantic-tokens/colors.ts`, `tokens/radius.ts`, `semantic-tokens/radii.ts` |
| Components | same package, `recipes/`: button, input, select, checkbox + checkmark, radio-group + radiomark, slider, progress, tabs, tooltip, menu, card, listbox, table, segment-group, scroll-area, badge; `preset-base.ts` (`focusVisibleRing`) |
| Icons | lucide 1.48.0 (ISC, `info/LICENSE-lucide.txt`); Chakra's docs use lucide through `react-icons/lu` |

## Tokens

Keys are the shared vocabulary; the template names the Chakra token behind each one (`colors.bg.panel` is `chakra-colors-bg-panel`, opacity modifiers keep Chakra's `/NN`).

`ButtonBackgroundBrush` and `HoverBrush` hold Chakra's gray subtle (`gray.subtle`), so Playnite's notification toasts and its own list views share the button and ghost-hover colors. Font: `fonts.body` is Inter with a system fallback; Inter is not bundled, so Segoe UI.

A sibling palette (blue, purple, ...): swap the six `--chakra-colors-color-palette-*` values in `tokens.css` for that palette's semantic tokens.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Recipe spacing (`src/Common.xaml`)

`FocusVisual` is `focusVisibleRing="outside"` (2px `colorPalette.focusRing`, 2px offset); inputs, the select and the search box draw `focusVisibleRing="inside"` in their templates (a 2px focus-ring edge).

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

One flat surface (`bg`) for the window, sidebar and top bar; no borders or panel fills. Structure comes from spacing and teal `subtle` states.

| File | Chakra behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat: sidebar and view on `bg`, no inset. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as ghost IconButtons, size sm (36px, `MainWindowButton`), centered on the 64px bar, 24px from the right; close = red solid on hover. |
| `Views/Sidebar.xaml` | px-4 around 40px items, gap-2. Main menu = `MainMenuButton`, a rounded-full `colorPalette.solid` IconButton (40px, white icon). |
| `CustomControls/SidebarItem.xaml` | IconButton md (40px, radius l2): ghost at rest, `gray.subtle` hover; active view = teal `subtle` (`colorPalette.subtle` fill, `colorPalette.fg` icon). |
| `Views/TopPanel.xaml` | 64px bar, px-6. Playnite's view controls in one SegmentGroup on the left (`bg.muted` track, radius l3); search on the right (`TopPanelSearchBox`: InputGroup + Input `subtle`, h-10, 320px); ghost IconButtons for filters and notifications, teal `subtle` while active; red solid Badge for the notification count. |
| `CustomControls/TopPanelItem.xaml` | SegmentGroup items: 40px, 20px icons; checked = `bg.emphasized` indicator, hover = `bg.emphasized/60`. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml`, `Views/Library.xaml` | Playnite's panels on the 4px spacing scale without separators; background art under the top bar, feathered on every edge. |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | Chakra dashboard page: cover clipped to radius l3, Heading 3xl (bold), solid Play, subtle More and IconButton Edit; description and notes under Heading lg titles next to a 380px Details Card that holds every metadata field Playnite can show, as one horizontal DataList (120px `fg.muted` labels, values beside them) in the six shared groups (progress, scores, about, tags as Badges, library, links; see `.claude/skills/playnite-theme-dev/reference.md`) split by `border` Separators. A group whose fields are all hidden collapses with its Separator. No art. The grid panel uses the same two columns (description left, a 280px Details Card right) with a vertical DataList (label over value); no tabs. Fields left out are parts Playnite skips. |

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations from Chakra

- Inputs, selects and the search box use the `subtle` variant (Chakra's default is `outline`), so fields have no visible edge; checkbox and radio edges use `border.emphasized` so they stay visible on black.
- No shadows (menus `lg`, select `md`, tooltip `md`, card `elevated`): WPF popups are layered windows, so menus and popovers get a 1px `border` edge instead, and the card is borderless `bg.panel`.
- The SegmentGroup track keeps a 4px inset and radius l3, and items are icon-sized (40px square) with no dividers between them.
- Menu icons Playnite copies stay icofont glyphs (Playnite rebuilds them from `Text`/`FontFamily`).
- The DataList has no group titles: themes cannot ship localization, so groups are told apart by Separators and spacing.

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run checklist: follow standard list in `../AGENTS.md`.

Layout checks: the SegmentGroup with many or few top bar items, the teal logo and selection in the sidebar, the subtle search input and selects (fill visible, no edge), window buttons centered on the 64px bar, the slider's outlined thumb, the 20px checkboxes and radios in settings, the select's check indicator, and the red notification badge.

Game overview: the rounded cover mask (VisualBrush), the Separators and group collapse when fields are hidden (the first visible group starts flush at the card padding), Badges wrapping in the 196px value column, the DataList at narrow widths, and the Description / Details tabs in the grid panel.
