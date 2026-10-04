# Questlog — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) named Questlog, taking inspiration from the **World of Warcraft Vanilla (1.x) interface**: gold and bronze frames, red leather panel buttons with gold text, the navy tooltip, stone bars, item slots, the quest log. The game details screen is laid out like the quest log.

Fan-made and unofficial: **no game files are included**. Every icon, texture and placeholder is original artwork drawn for this theme (`art/`), and the client font is not bundled (see Fonts). `info/NOTICE-Questlog.txt` ships in the package.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Keys are the shared vocabulary; the template names the token behind each one. Gradient keys (buttons, frame, bars, page, row highlights) are `LinearGradientBrush`; ThemeModifier's solid-color editor does not recolor those stops.

Font: `FONT_FAMILY` = `Friz Quadrata TT, Constantia, Palatino Linotype, Georgia, Segoe UI`. Sizes 12 / 14 / 16 / 20 / 28 (the client sets its UI at 13 and its large headings at 16 and 20).

*(Full token-to-key mapping: see `src/Constants.template.xaml`)*

## Component spacing (`src/Common.xaml`)

*(Control padding and dimensions: see `src/Common.xaml`)*

## Shell

| File | Behavior |
|------|----------|
| `DerivedStyles/MainWindowStyle.xaml` | The window is the gold and bronze frame (`FrameBrush`, 3px) with a dark inner line. `MainWindowButton`: plain 24x22 gold glyphs, no plate; a faint wash on hover, close turns `DangerBrush`. |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | Dialogs: the same frame, the title on a plaque at the top center (gold on the panel fill in a gold ring, `UI-DialogBox-Header`), caption glyphs as above. Content starts 32px down. |
| `Views/Sidebar.xaml` | A plain strip of stone (`ShellBackgroundBrush`), no rule toward the library, all four positions. `MainMenuButton`: a bare gold hamburger that takes a faint wash on hover. |
| `CustomControls/SidebarItem.xaml` | Borderless 40px icons. Hover is a faint wash; the current item is a gold glyph on a faint gold wash. Library is the tome, Statistics the hourglass. `PART_ProgressStatus` overlays a translucent gold fill. |
| `Views/TopPanel.xaml` | Plain 50px band, transparent so the library shows through, no rule under it. `TopPanelSearchBox`: a single-edge edit box with a magnifier. View controls are borderless 32px icons (`TopPanelItem.xaml`). Notifications are a letter with a red count. The global progress bar is the casting bar. The right 110px stay clear for the window buttons. |
| `Views/Library.xaml` | The library on the dark `ContentBackgroundBrush` layer; the game's background art is drawn over it. |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | Plain dark glass, no bronze rule; the preset buttons are bare gold glyphs (bin, quill, plus). |

## Game overview (the quest log)

`Views/DetailsViewGameOverview.xaml` (details view) and `GridViewGameOverview.xaml` (grid view side panel) keep Playnite's arrangement and every `PART_` name:

- Title in gold at 28px with a one pixel shadow; the icon and cover sit in a single thin slot edge (hidden with the image).
- **Steam screenshots, description and notes = quest text** on the left: ink on a paper page (`ParchmentBrush`, the tiled `parchment.png` at 90 %, a shaded rim from an `OpacityMask` in a `BitmapCache` wrapper), inside one `FrameBrush` frame. Headings are `QuestTitleFont` style: black with a brown shadow copy behind, with no rule under them. Screenshots use the Steam Screenshots plugin host (`SteamScreenshots_SteamScreenshotsViewControl`), hidden when that plugin's control is not visible.
- **Properties = an item tooltip** on the right of that page: the tooltip navy inside a 1px light edge, no inner line and no rule under the title. Labels gold, values white, links white until the pointer turns them gold, scores in the item quality colors. It holds every metadata field Playnite can show, in the six shared groups (progress, scores, about, tags as plain dark chips, library, links; see `.claude/skills/playnite-theme-dev/reference.md`) split by space only (108px gold caption column beside white values; a group whose fields are all hidden collapses). The grid panel uses the same two columns (quest text, then a 280px tooltip) with each caption over its value. The side panel has no bronze rule against the grid.
- `DescriptionView.html` draws the description with the same ink.

## Components

*(Standard control mapping follows `../AGENTS.md`; see `src/DefaultControls/` and `src/DerivedStyles/`)*

## Deviations from the client

- **No game assets, no client font.** Icons and textures are original; Friz Quadrata is used only if installed (`FONT_FAMILY` falls back to Constantia, Palatino Linotype, Georgia, Segoe UI). Playnite's HTML description uses `DescriptionView.html`'s own font list.
- **Colors of the art are approximations** (see Sources); the client's textures are not sampled.
- **Shadows**: text shadows are `DropShadowEffect` (blur 0) on buttons, the progress text and the game title only, not on every text block, to keep list scrolling cheap. No shadows on popups or tiles (repo rule).
- **Plainer than the client chrome.** The window and dialogs keep the gold frame. Inside it, rails, the top bar, icon buttons, group boxes, tabs and the game page drop the extra rules, slot borders and glows, closer to the quiet panels (the test dialog, the HUD edit list, the classic login form) than to a frame around every control.
- **Gradients** are used where the art is a gradient; ThemeModifier's solid-color editor cannot recolor them.
- **`DescriptionView.html` carries its colors as literals** (`#2E1F0F` ink, `#7A1A0A` links): the file is not a template. Keep it in step with `ITEM_TEXT_FONT_COLOR` and `PARCHMENT_LINK` in `tokens.css`.
- **The client has no left-hand list plus right-hand page** in the quest log (the list sits above the text); Playnite's details view keeps its own split, dressed in the same pieces.
- **Disabled buttons** restore `Opacity` to 1 (BaseStyle dims to 0.5) because the gray face is the disabled look.
- **Disabled and unsupported**: menu icons Playnite copies stay PNG paths (Playnite rebuilds glyph resources from text); the grid tile's hover play / info buttons keep Playnite's glyph font; no fullscreen theme.
- Window buttons use the icons of `Media.xaml`, not Marlett glyphs; Playnite still sets the content to `0`, `1`, `2`, `r` and the templates read it.

## Art

```text
python3 art/glyphs.py media      # rewrite the glyph block in src/Media.xaml
python3 art/glyphs.py preview    # art/glyphs-preview.html
python3 art/menu_icons.py png    # src/Images/Menu/*.png, questionmark.png, cover.png (Node + Chromium, Pillow)
python3 art/menu_icons.py sheet  # art/menu-sheet.html
python3 art/parchment.py         # src/Images/parchment.png
python3 scripts/render-addon-icon.py --svg src/themes/Questlog/art/mark.svg --extension questlog   # info/icon.png
```

## Not verified yet

Built and statically checked on Linux (the repo's `build-theme.ps1` and `validate-extension.ps1` under PowerShell 7, plus a lint of every XAML file against the .NET Framework 4.6.2 WPF reference assemblies: element, property, attached property, `TemplateBinding` and `TargetName` names, checked on Playnite's own Default theme first); **never loaded in Playnite**, so no screenshot exists yet (`info/danitesler_questlog.yaml` has no `Screenshots`; add `art/*.png` and the entries once it runs).

First run checklist: follow standard list in `../AGENTS.md`. Also: how the `DropShadowEffect` on buttons looks with ClearType, the `OpacityMask` vignette and the tiled paper in the overview (`BitmapCache`), the plaque title at different dialog widths, `ImageBrush` with `{ThemeFile}` inside a control template, the scroll bar arrows on horizontal bars, whether Constantia is picked when Friz Quadrata is missing, and how the 16px scroll bar sits in `DetailsScrollViewer`'s 17px margin, and the tooltip pane with every field on and with few (spacing between groups, item slots wrapping, two-line captions such as "Completion Status" in the 108px column).
