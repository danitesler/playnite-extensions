# Shade — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, loads on Playnite 10.45+) named **Shade** (key `shade`, folder `Shade`, `AddonId` `Shade_B66DB7B1`), in the style of **shadcn/ui** (new-york-v4 registry), fully dark on the **zinc** base color.

**Unofficial fan theme**: not affiliated with, endorsed by or sponsored by shadcn or the shadcn/ui project. shadcn/ui is named only to say what inspired the look (nominative use). No shadcn/ui logo, icon, font or artwork is shipped: the add-on tile (`art/mark.svg`) is an original inset-card mark, the icons are Lucide (ISC, `info/LICENSE-lucide.txt`), and the colors and spacing follow the open-source (MIT) registry values. See `info/NOTICE-Shade.txt`.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Keys are the shared vocabulary; the template names the shadcn variable behind each one. Variables in `tokens.css`: background, foreground, card(-foreground), popover(-foreground), primary(-foreground), secondary(-foreground), muted(-foreground), accent(-foreground), destructive, border, input, ring, sidebar, sidebar-foreground, sidebar-primary(-foreground), sidebar-accent(-foreground), sidebar-border. Optional ones fall back the way shadcn pairs them (`popover` → `card`, `sidebar-*` → the base token), so a pasted palette without them still renders.

`ButtonBackgroundBrush` holds shadcn's secondary Button fill, so Playnite's notification toasts, which read it too, share that color.

`border` and `input` stay translucent white, as in shadcn; only popup edges (`PopupBorderColor`) are flattened onto the popover, because WPF popups are layered windows. Radii: `CornerRadiusSmall`, `ControlCornerRadius`, `CornerRadiusLarge`, `CornerRadiusXLarge` = Tailwind `rounded-sm` / `-md` / `-lg` / `-xl` from the `--radius-*` tokens, `CornerRadiusFull` = pill. Fonts: `--font-sans` / `--font-mono` when a palette sets them, else Segoe UI / Consolas.

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

shadcn's inset layout (blocks `sidebar-07` / `dashboard-01`):

| File | What it draws |
|------|---------------|
| `Views/MainWindow.xaml` | Window frame in `sidebar`; the active view on a `background` card, rounded-xl, inset 8px (m-2, ml-0 beside the sidebar). Four frame-colored corner masks (`MainWindowInsetCorner`) round the card over the view's content. |
| `DerivedStyles/MainWindowStyle.xaml` | Playnite's window template with minimize / maximize / close (`MainWindowButton`, 32px ghost) centered on the card header. |
| `Views/Sidebar.xaml` | Sidebar `collapsible="icon"` as the repo's 44px compact rail: no fill, no border, 16px top and bottom padding, none at the sides. Main menu = the sidebar-07 TeamSwitcher logo (`MainMenuButton`: size-8, rounded-lg, `sidebar-primary`); the top bar reuses it when the sidebar is hidden. |
| `CustomControls/SidebarItem.xaml` | SidebarMenuButton, icon mode: 44x40 item around the 32px rounded-md button (16px glyphs), `sidebar-accent` on hover and when active. Library and Statistics draw lucide icons. |
| `Views/TopPanel.xaml` | site-header inside the card: 48px, px-4; search on the left (`TopPanelSearchBox`: card fill, borderless, h-8, w-64), ghost 32px icon buttons on the right, progress in the middle. |
| `CustomControls/TopPanelItem.xaml` | Button ghost, size icon-sm (32px); accent when toggled. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Playnite's panels on p-4 spacing without separators. |
| `Views/Library.xaml` | Background art under the top bar, feathered on every edge (bitmap-cached opacity masks). |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | shadcn page: h1 (text-3xl bold) with the icon, actions on the right (icon Button Edit, secondary More, default Play); Separator; then two columns: the description and Notes Cards, and a 280px Details Card (`GameDetailsPaneWidth`) that holds every metadata field Playnite can show, as label cells (muted, font-medium, 120px) beside the value in the six shared groups (progress, scores, about, tags as Badges, library, links; see `.claude/skills/playnite-theme-dev/reference.md`) split by Separators (my-4). A group whose fields are all hidden collapses with its Separator. No art, no cover. The grid panel uses the same two columns (a 280px Details Card on the right), with the label over the value. Fields left out are parts Playnite skips. |

The top bar's right padding (132px = 16px + 108px of window buttons + an 8px gap) keeps it clear of the window buttons; keep it in step with `MainWindowStyle.xaml`.

## Components

Everything else (DataGrid, DatePicker, TreeView, Expander, game details) is Playnite's template recolored through the palette keys.

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations from shadcn

- No borders on cards, the sidebar or the header, and no layout separators: surfaces and spacing carry the structure. Regular buttons are `secondary` (filled, borderless) rather than `outline`.
- No shadows (`shadow-xs`, `shadow-md`): WPF popups are layered windows and Playnite's lists redraw often.
- The logo tile dims to 90% on hover; the block has no hover state of its own there.
- Menu icons Playnite copies stay icofont glyphs (Playnite rebuilds them from `Text`/`FontFamily`), recolored to muted-foreground.
- The notification count badge (`Views/TopPanel.xaml`) uses `ControlCornerRadius` (rounded-md, like shadcn's Badge) instead of a pill: its width grows with the count, and `CornerRadiusFull` on a non-square element draws an oval in WPF (AGENTS.md, Control Corner Radii). `CornerRadiusFull` stays defined in `Constants.template.xaml` for custom CSS palettes but nothing in the theme uses it.
- The Details Card has no group titles: themes cannot ship localization, so groups are told apart by Separators and spacing.

## Not verified yet

Built and statically checked on Linux (XML, file allowlist, resource keys, StaticResource scope); **not yet loaded in Playnite**. First run checklist: follow standard list in `../AGENTS.md`.

Layout checks: the inset card's rounded corners over the library background image (details view), window buttons centered in the card header, the sidebar at each position (Settings → Appearance → Layout), the search placeholder hiding while typing, lucide icons in the top bar and on Library / Statistics, the blue logo tile, and slider ranges ending under the thumb (grid zoom slider).

Game overview: the 384px Details Card beside the description (and at narrow window widths), the group Separators and the collapse of a group whose fields are hidden (the first visible group starts flush at the card padding), Badge wrapping in the 200px value column, Tabs inside the grid panel's scrolling pane.

## Previews

`art/preview-details.html` and `art/preview-settings.html` render `art/screenshot-details.png` and `art/screenshot-settings.png` (`scripts/take-screenshots.ps1 -Extension shade`). Motifs: the rounded-xl `background` card inset in the `sidebar` frame, the borderless `card` panels with 24px padding, ghost 32px icon buttons with the accent fill on the current view switch, the amber count badge on the bell (rounded-md, as in the XAML), and the muted label column of the Details Card with hairline group rules. Segoe UI is drawn with the bundled Selawik stand-in. Colors are `var(--token)` from `src/tokens.css`; the amber of the badge and the white slider thumb are literal, as in `Constants.template.xaml`. The art holds no shadcn/ui logo; the preview shows the theme's own name only.
