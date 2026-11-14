# Chakram — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) named **Chakram**: an unofficial theme inspired by **Chakra UI v3** (3.37), the dark variant only, with **teal** as the color palette. It is not affiliated with, endorsed by or sponsored by the Chakra UI project or Chakra Systems; the name is used only to say what inspired the look (`info/NOTICE-Chakram.txt`). No Chakra logo, mark, font or artwork is included: the tile icon (`art/mark.svg`) is a neutral dashboard glyph, and the icons are lucide (ISC). The folder is `Chakram`, the key `chakram` and the `AddonId` `Chakram_2C9CE76E`.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

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
| `Views/Sidebar.xaml` | The 44px compact rail (repo mandate), no fill or border. Main menu = `MainMenuButton`, a 32px rounded-full `colorPalette.solid` IconButton with a white 16px icon, centered in the rail and on the 64px bar. |
| `CustomControls/SidebarItem.xaml` | 44x40 item with a 36x36 plate (radius l2, 4px/2px margin) and a fixed 16px glyph, no `IconPadding`: ghost at rest, `gray.subtle` hover; active view = teal `subtle` (`colorPalette.subtle` fill, `colorPalette.fg` icon). |
| `Views/TopPanel.xaml` | 64px bar, px-6. Playnite's view controls on the left as SegmentGroup items without the group's track (repo rule: no container around `PART_PanelMainItems`); search on the right (`TopPanelSearchBox`: InputGroup + Input `subtle`, h-10, 320px); ghost IconButtons for filters and notifications, teal `subtle` while active; red solid Badge for the notification count. |
| `CustomControls/TopPanelItem.xaml` | SegmentGroup items: 40px, 20px icons; checked = `bg.emphasized` indicator, hover = `bg.emphasized/60`. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml`, `Views/Library.xaml` | Playnite's panels on the 4px spacing scale without separators; game art only while Playnite's window background setting is on, at full strength with Playnite's own darken and blur (repo rule "Window background"), in the content layer under the solid top bar. |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | Chakra dashboard page: cover clipped to radius l3, Heading 3xl (bold), solid Play, subtle More and IconButton Edit; description and notes under Heading lg titles next to a 380px Details Card that holds every metadata field Playnite can show, as one horizontal DataList (120px `fg.muted` labels, values beside them) in the six shared groups (progress, scores, about, tags as Badges, library, links; see `docs/themes/reference.md`) split by `border` Separators. A group whose fields are all hidden collapses with its Separator. No art. The grid panel uses the same two columns (description left, a 280px Details Card right) with a vertical DataList (label over value); no tabs. Fields left out are parts Playnite skips. |

**Settings chrome.** Chakra dialog header as a flat 48px band: teal status dot before the title (semibold, body face), a faint dot grid in the right end (tiled `OpacityMask`), a 1px border line; 36x32 ghost caption buttons. Section list (`DefaultControls/TreeView.xaml`): 30px rows, radius-l2 plates inset 8px; hover = `bg.emphasized/60` with a gray 2px line hint, selected = teal subtle fill, teal fg and the Tabs "line" indicator (2px solid-teal bar on the trailing edge); children under a 1px border line; width 256 (Settings), 280 (Add-ons).

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

Interactive layer, on Chakra's `moderate` (200ms) transition (details and unverified bits in `RESEARCH.md` -> Motion):

| File | What it does |
|------|--------------|
| `DerivedStyles/PlayButton.xaml` | Solid button: plate dims to 90 percent on hover (hover brush is the color at alpha). No pressed layer (the solid recipe has no active rule). |
| `DerivedStyles/GridViewItemStyle.xaml` | Ring on hover is its own layer fading in and out; selected stays static. |
| `DerivedStyles/GridViewItemTemplate.xaml` | New. Shade 0.5 fades in; 40px IconButtons (Play solid, Info subtle) enter like Chakra's popover, scale-fade-in (0.95 to 1, 150ms in, 100ms out), 30ms apart. No rise or zoom. Lucide glyphs in `Media.xaml` (`IconPlay`, `IconInfo`, `IconDownload`). |
| `Views/*GameOverview.xaml` | Banner fade is a gradient on top (`PageRoot` on `WindowBackgourndBrush`) instead of a mask; the grid panel's rounded banner corners are two page-colour pieces. Empty state: Chakra `EmptyState` (36px gamepad indicator in `fg.subtle`, inline path because the validator allows no new `Icon*` keys, semibold lg title), 200ms fade-in. |
| Running game (`RunningIndicatorBrush` = `--chakra-colors-purple-fg`, purple.300, added for this) | Chakra's striped, animated Progress in purple, off the teal, in each item's radius (details rows `CornerRadiusSmall`, list rows square, covers `CornerRadiusSmall` with the teal ring outside, the button `ControlCornerRadius`): a 0.16 tint, a 2px frame (1px on the button) and a 3px striped foot bar (45 degree stripes from a tiled `DrawingBrush`; a dark tape holds it on covers). **Launching:** a hard-edged slanted slash (`RunningScan`, ease-in-out) crosses the item while the striped bar fills behind it (a travelling hard edge in the bar's mask) and its stripes march (1.6s loop, 0.5s rest); the slab holds a page-colour scrim (0.28) so the slash reads. **Running:** the bar stays full, the stripes march slowly (3.2s) and the layer breathes 0.72 to 1; the slab scrim breathes 0.16 to 0.02, page-colour ink on the light purple plate (above 4.5:1). **Hover on RUNNING:** the plate darkens (second scrim 0.5), the label reads Cancel in the light text colour; the dim plate is its own layer so the hover fade cannot touch it; hover binding is `Self`. Levers: angled hard block, striped marching fill, no ornament mark, ease-in-out. |

## Deviations from Chakra

- Inputs, selects and the search box use the `subtle` variant (Chakra's default is `outline`), so fields have no visible edge; checkbox and radio edges use `border.emphasized` so they stay visible on black.
- No shadows (menus `lg`, select `md`, tooltip `md`, card `elevated`): WPF popups are layered windows, so menus and popovers get a 1px `border` edge instead, and the card is borderless `bg.panel`.
- The sidebar is the repo's 44px compact rail, not Chakra's usual 72px nav (px-4 around 40px IconButtons): items are 36px plates with 16px glyphs and the main menu mark is 32px.
- The SegmentGroup track (bg.muted, radius l3) is not drawn: the repo forbids a container around `PART_PanelMainItems`. The items keep the track's 4px inset as a margin, are icon-sized (40px square) and have no dividers between them.
- Menu icons Playnite copies stay icofont glyphs (Playnite rebuilds them from `Text`/`FontFamily`).
- The notification Badge (`TopPanelNotificationsToggle`) is not a 1:1 square (`MinWidth` 16, grows with the count), so it uses `CornerRadiusSmall` (radii.l1) instead of `CornerRadiusFull` (repo rule: no pill radius on non-square elements). Chakra's Badge is radius l2; the preview draws the same l1.
- The DataList has no group titles: themes cannot ship localization, so groups are told apart by Separators and spacing.

- No glow, lift, zoom or pressed state: Chakra's button and card recipes draw none. The hover controls and the banner sit over art, so no `OpacityMask` is behind them (the banner fades with a plain gradient).

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run checklist: follow standard list in `../AGENTS.md`. The new hover and empty states are not checked in Playnite at 125% / 150% display scaling (hover Play, covers and both cover buttons repeatedly; deselect the game; look for dark patches behind Play) or against a ThemeModifier recolour; the transition easing and the scale-fade values are assumptions (`RESEARCH.md`).

Layout checks: the SegmentGroup with many or few top bar items, the teal logo and selection in the sidebar, the subtle search input and selects (fill visible, no edge), window buttons centered on the 64px bar, the slider's outlined thumb, the 20px checkboxes and radios in settings, the select's check indicator, and the red notification badge.

Game overview: the rounded cover mask (VisualBrush), the Separators and group collapse when fields are hidden (the first visible group starts flush at the card padding), Badges wrapping in the 196px value column, the DataList at narrow widths, and the Description / Details tabs in the grid panel.
