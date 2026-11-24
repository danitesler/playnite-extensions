---
name: playnite-new-theme
description: Create a new, creative, unique, and visually bombastic Playnite theme from a game link or name, film, fictional UI, or design system. Use when scaffolding or building a new Playnite theme.
---

# Create a new Playnite theme

Build a standalone Playnite desktop theme under `src/themes/<Name>/` inspired by the user's source (game link or name, film, fictional UI, or design system). Read [docs/themes/new-theme.md](../../../docs/themes/new-theme.md), [docs/themes/creative-direction.md](../../../docs/themes/creative-direction.md), [src/themes/AGENTS.md](../../../src/themes/AGENTS.md), and [playnite-theme-dev](../playnite-theme-dev/SKILL.md).

## Core rule: Two-phase firewall (Art Direction before XAML Plumbing)

The #1 cause of generic "AI slop" themes is letting WPF compliance checklists and cloned XAML files dictate the visuals. Enforce a strict separation:

- **Phase A — Visual Grounding & HTML Design Lock (zero XAML):** Study real screenshots of the source, sample real colors, craft real material textures/masks (`art/sprites.py` when needed), author bespoke `art/preview-details.html` & `art/preview-settings.html` from scratch, and run a harsh side-by-side critique + at least one visual revision pass against the captures until the previews look unmistakably like the source.
- **Phase B — Playnite XAML Engineering:** Translate the locked Phase A previews faithfully into WPF XAML. **Never copy another theme's visual XAML** — only reuse invisible behavioral wiring (`PART_*` names, triggers, `MathConverter` math, breakpoints, crash guards).

## How global skills and repo context fit together

- **Design context (`RESEARCH.md` + `BRIEF.md` + `src/tokens.css`)**: Each theme in this monorepo is its own self-contained design system under `src/themes/<Name>/`. Its `RESEARCH.md`, `BRIEF.md`, `AGENTS.md`, and `src/tokens.css` (scaffolded by `scripts/new-theme.ps1`) act as that theme's design memory and plan in place of a root `DESIGN.md`.
- **What you CAN use from global skills**:
  - **Reference research (`design-references`)**: Collect real UI captures from the user's link, web search/browser (Interface In Game, HUDS+GUIS, official media, Steam store/community, wiki UI galleries), reference repos, and `inspire.mjs` (open fonts, Lospec palettes, Iconify sets, Are.na; ask before opening Game UI Database). Save captures to scratch, inspect them visually with `read_file`, and record every URL, license, measured hex value, font, and structural UI observation in `src/themes/<Name>/RESEARCH.md`.
  - **Visual & motion principles (`design-visual-direction`, `design-motion`)**: Use their hierarchy, restraint, anti-tell checks (`ai-tells.md`), and purposeful motion rules (`game-ui.md`, `app-ui.md`), translating them into `src/themes/<Name>/BRIEF.md` and WPF `ControlTemplate.Triggers` storyboards.
  - **File placement (`agent-local-docs`)**: Keep maintained theme deliverables (`RESEARCH.md`, `BRIEF.md`, `AGENTS.md`, `README.md`, `info/*`, `src/*`, `art/preview-*.html`, `art/screenshot-*.png`, `art/mark.svg`, and deterministic generators like `art/sprites.py` or `art/icons.mjs`) in `src/themes/<Name>/`. Send all disposable files (reference captures, sprite contact sheets like `fx-sheet.png`, `RunningMotionFrames.ps1 -OutDir <scratch>`, `MenuRender.ps1 -Out <scratch>`) to scratch.
  - **Delegation (`agent-delegate`)**: Check rendered HTML previews against [theme-preview-review.md](../../../docs/themes/theme-preview-review.md) yourself before starting XAML (do not spawn a preview-reviewer subagent). Any other delegation follows `agent-delegate` budgets, and workers always build with `-NoDeploy`.
- **What replaces web-only checks**: Do not run mobile viewport checks or `npx impeccable` / `style-census.js` DOM checks on Playnite themes. Theme verification uses the 1280×720 Chromium preview pipeline (`scripts/take-screenshots.ps1`, `scripts/preview-tokens.mjs`, `scripts/preview-layout.mjs`, `scripts/theme-fonts.mjs`), [theme-preview-review.md](../../../docs/themes/theme-preview-review.md), `pwsh scripts/validate-extension.ps1 -Extension <key> -Mode Package`, and the WPF regression scripts in `tests/wpf/`.

## Ambition modes (`new-theme.ps1 -Ambition`)

Pick the mode requested by the user, or default by source type:

| Mode | When to use | What it requires |
| --- | --- | --- |
| **`Showcase`** (default for games, films, fictional UIs) | Translating a game's HUD, pause/title menu, or diegetic artifact into Playnite | Maximum source fidelity (not clutter): 1–2 unmistakable hero focal pieces + 4–6 observed UI translations (3+ recognizable on sight), bespoke source-drawn `Icon<Role>` vectors, custom white-mask FX/texture sprites (`art/sprites.py`) whenever flat vector fills look plastic next to the source, cohesive animated Play/row/cover/menu/running states |
| **`Hybrid`** | A game whose UI is a clean, minimal design system | Exact layout discipline and restraint + Showcase craft on Play, covers, empty state, and settings title band; bespoke `Icon<Role>` vectors |
| **`Faithful`** | Real design systems and OS UIs (Material, Fluent, Primer, shadcn) | Exact published tokens, radii, states, and motion curves; no invented glows or game ornaments; may map the system's official open icon pack via `icons.json` |

---

## Phase A — Visual Grounding & HTML Design Lock (before any XAML)

### A1. Visual Reference Collection & Measured Research (`RESEARCH.md`)

Never design from memory or text descriptions alone.

1. **Gather 3–6 real UI captures** into the session scratch folder (title/start screen, pause/settings/inventory menu, HUD/dialog/tooltip, button/selection states). Inspect any link the user provided first (webpage, Steam page, Figma/design system, gallery), then supplement via web search or browser captures.
   - **Hard stop:** if the source is obscure and you cannot obtain real visual references, stop and ask the user for 2–3 screenshots instead of hallucinating from the title.
2. **Visually inspect every capture** with `read_file` and **measure exact colors** (pixel-sample captures with a quick scratch Pillow script or read live CSS/spec tokens — never guess hex codes).
3. **Document structural anatomy in `RESEARCH.md`:**
   - **Value ladder & accent budget:** lightest surface -> mid -> deep ground -> ink -> accent % of area. Respect the source's true luminance and temperature instead of defaulting to dark charcoal.
   - **Material & edge anatomy:** border thickness, inner bevels, corner cuts/ornaments, texture/grain/brushwork/scanlines/glass, shadow behavior (or absence of shadows).
   - **Typography voice:** display vs body families (and open SIL OFL stand-ins from `scripts/fonts/` when the source uses commercial or non-Windows fonts), case rules, tracking, weight contrast, tabular numerals.
   - **Proportions & negative space:** density, padding rhythm, column alignment.
   - **Observed UI parts & frame-stepped states:** tie each part (bar, cursor, frame, button, list row, tooltip, menu) to a specific capture and note idle -> hover -> selected -> pressed transitions.

### A2. Creative Brief (`BRIEF.md`, per [creative-direction.md](../../../docs/themes/creative-direction.md))

- **3 Candidate lenses -> pick 1**: Sketch *(a) Diegetic / Artifact*, *(b) HUD / Telemetry*, and *(c) Title / Pause Menu*; compare against the last 5 themes in [src/themes/AGENTS.md](../../../src/themes/AGENTS.md) and pick the freshest, most faithful lens.
- **Source DNA (5 measured traits)** tied directly to captures.
- **Focal hierarchy & source translations**: 1–2 unmistakable hero focal pieces + 4–6 structural UI translations observed in `RESEARCH.md` (3+ recognizable on sight) — no filler ornaments to inflate a count.
- **Material & FX plan**: decide upfront whether `art/sprites.py` white-mask PNGs are needed for real texture, brushwork, paper tooth, metallic sheen, scanlines, or bloom.
- **6 Shell & Game Page Levers** (each derived from captured geometry, never generic rectangles):
  1. Hero banner transition (`Views/*ViewGameOverview.xaml`)
  2. Play button architecture (`DerivedStyles/PlayButton.xaml`)
  3. Metadata container & group break (`Views/*ViewGameOverview.xaml`)
  4. Chip & score silhouette (`DerivedStyles/PropertyItemButton.xaml`, `TextBlockGameScore.xaml`)
  5. Row & cover selection mark (`DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`)
  6. Custom 28×28 side-panel close plate (`SidePanelCloseButton` in `GridViewGameOverview.xaml`)
- **7 Popup Menu Levers** ([docs/themes/menus.md](../../../docs/themes/menus.md)): panel material/edge, animated highlight, group break, icon hover contrast, shortcut treatment, submenu mark, and marked rows (`Alt+Q` Exit in danger style + checked row mark), distinct from every finished row in the `menus.md` signatures table.
- **Motion language**: fast (90–140ms), base (160–240ms), slow (280–450ms) durations, one easing personality, cohesive hero + secondary feedback, and explicit restraint + anti-slop rules.
- **Original branding**: an evocative original or `<Source>-inspired` name (never an official/trademarked product title), one custom vector mark from the source's shapes (never a copied logo) reused in the title band, empty state, and `art/mark.svg`, plus `info/NOTICE-<Dir>.txt`.

### A3. Scaffold, Measured Tokens, Bundled Fonts & Early Material FX

1. **Scaffold**:
   ```powershell
   pwsh scripts/new-theme.ps1 -Name "<Theme Name>" -Key <key> -DesignSystem "<Source>" -Ambition Showcase|Hybrid|Faithful
   ```
   Move your research and brief into `src/themes/<Name>/RESEARCH.md` and `BRIEF.md`.
2. **Tokens (`src/tokens.css` & `src/Constants.template.xaml`)**:
   - Define the source's measured tokens in `src/tokens.css` (`:root`, or `.dark` override).
   - Map every `{{TODO}}` in `src/Constants.template.xaml` using only Playnite palette keys (`scripts/data/playnite-theme-api.json`) and shared vocabulary keys (`scripts/data/theme-keys.json`; theme-only templates/geometries use `Local*` keys).
   - Required special brushes: `GameBannerTintBrush` (solid dark brand surface or art tint, never plain black unless the theme is black), `RunningIndicatorBrush` (distinct hue from Play, selection, hover, and filter mark), and `WindowArtForegroundBrush` (for light themes when window background art is enabled).
3. **Bundled fonts (`src/Typography/`)**:
   - If the theme leads any font stack with a face Windows does not ship, copy static `.ttf` weights (only weights used + `Regular`) and `OFL*.txt` from `scripts/fonts/` into `src/Typography/` (never `Fonts/`), subset to Latin + Cyrillic with `python3 scripts/subset-theme-fonts.py` (unless Reserved Font Name), and reference as `./Typography/#<Family>, <Fallback>`.
4. **Early Material & FX sprites (`art/sprites.py` -> `src/Images/fx/*.png`)**:
   - When the source relies on surface tooth, paper/parchment grain, brush strokes, torn edges, metallic bevels, scanlines, filigree, or organic blooms that look plastic in flat CSS/XAML, author deterministic pure-white (`255, 255, 255`) RGBA alpha masks with `Pillow` + `NumPy` (fixed random seed) **now, before writing the previews**. Inspect contact sheets in scratch (`agent-local-docs`), then wire them into both the HTML previews (`-webkit-mask`) and later XAML (`OpacityMask` with `Local*` brushes) so both share the exact same craft.

### A4. Bespoke HTML Previews & Side-by-Side Revision Lock (`art/preview-*.html`)

Build both 1280×720 HTML previews per [docs/themes/previews.md](../../../docs/themes/previews.md) **from scratch against `RESEARCH.md`** (never re-skin another theme's preview):
- Use `var(--token)` colors from `src/tokens.css` (`node scripts/preview-tokens.mjs link src/themes/<Name>`), bundled font names only (zero `system font used` warnings), real sizes, WPF-feasible techniques only, and all required `data-part` attributes (`top-panel` order: `PART_TextMainSearch` -> `PART_ToggleFilter` -> `PART_PanelMainItems` with sorting first and icon-only view switches).
- Stage the hero focal piece in its hovered end state in `preview-details.html`, show the brand mark in the `preview-settings.html` title band, and show at least 3 source UI translations from `BRIEF.md` with authentic restraint.
- **Render & Side-by-Side Critique Loop**:
  1. Render Pass 1: `pwsh scripts/take-screenshots.ps1 -Extension <key>` (`art/screenshot-details.png`, `art/screenshot-settings.png`).
  2. Open **both rendered PNGs AND the saved scratch reference captures together** with `read_file`.
  3. Audit ruthlessly against [docs/themes/theme-preview-review.md](../../../docs/themes/theme-preview-review.md) (squint test, swap test, anti-slop audit, material fidelity, legibility, WPF feasibility). Explicitly identify at least 2–3 concrete weaknesses where Pass 1 still looks generic, flat, cluttered, or off-model.
  4. **Mandatory Pass 2 revision**: fix those weaknesses in `tokens.css`, `art/sprites.py`, and `preview-*.html`, re-render, and re-inspect side-by-side with the captures. Do **not** begin Phase B until every blocking and anti-slop issue is resolved.

---

## Phase B — Playnite XAML Engineering, Icons & Verification

Translate the locked Phase A previews faithfully into WPF XAML. **Never copy another theme's visual templates** — copy only invisible behavioral wiring (`PART_*` names, triggers, breakpoint math, crash guards).

### B1. Icons & Add-on Tile

- **UI icons (`Icon<Role>` in `src/Media.xaml`)**:
  - `Showcase` / `Hybrid`: author bespoke vector `StreamGeometry` / `DrawingImage` icons in `src/Media.xaml` (or generate via `art/icons.mjs`) matching the source's stroke weight, terminals, and silhouette.
  - `Faithful`: may render the design system's official icon set via `icons.json` (`format: "Geometry"`, `updateXaml: true`) + `pwsh scripts/render-icons.ps1 -Extension <key>`.
- **Menu item icons (24 Playnite menu keys — required)**:
  - Every theme draws its own 24 bare, full-frame menu item icons (Add Game, Update Library, Settings, Exit, Play, Favorite, etc.) — never Playnite's stock glyphs, never wrapped in a background badge/plate, and never another theme's set recoloured. Restyle the scaffolded `art/menu-icons.json` from the source (fill/finish, line weight, cap/join, geometry/transform, contour contrast, palette from `tokens.css`, fitting metaphor variants), run `node scripts/render-menu-icons.mjs <Theme> --sheet`, and review the sheet at 16px on both rest and hover plates. Follow [docs/themes/menu-icons.md](../../../docs/themes/menu-icons.md); `validate-extension.ps1` and `node scripts/render-menu-icons.mjs --check` enforce it.
- **Add-on tile (`info/icon.png`)**: author `art/mark.svg` and run `pwsh scripts/render-addon-icon.ps1 -Svg src/themes/<Name>/art/mark.svg -Extension <key>` (always default `#FF7A1A` orange, never pass `-Color`).

### B2. XAML Implementation (Required Surfaces & Mechanics)

Implement all files listed in [src/themes/AGENTS.md](../../../src/themes/AGENTS.md#the-files-every-theme-ships), following [docs/themes/reference.md](../../../docs/themes/reference.md):

- **Spacing & field heights (`src/Common.xaml`)**: `ControlHeight` = `32` (vertical `InputPadding`/`ButtonPadding` = 5, or 4 with thick borders; `Padding` applied once on `TextBox`/`PasswordBox`; `Button` `Width == 41` ThemeModifier trigger scaled `32/41` via `LayoutTransform`). Filter sidebar controls in `FilterPanelView.xaml` and preset buttons are `28px` (`28×28` square preset buttons).
- **Corner radii**: Base controls, `PlayButton`, and `PropertyItemButton` chips use `{DynamicResource ControlCornerRadius}` (never `CornerRadiusFull` on non-square elements; tracks/thumbs use explicit half-thickness numeric radii). `GroupBox.xaml` stays content-sized with no child reporting width ≥ 200px (wrap wide decor in `<Canvas>` inside `<Grid ClipToBounds="True">`). `ComboBox.xaml` reserves ≥ 12px right margin on `ContentSite` for the chevron. `TabControl.xaml` keeps `Foreground="{DynamicResource TextBrush}"` on `TabItem` and sets state colors on the header `TextBlock` via `TargetName`.
- **Shell (`MainWindow`, `Sidebar`, `TopPanel`, `Library`, `SidebarItem`, `TopPanelItem`, `SearchBox`)**:
  - Left 44px compact rail (44×40 items, ≥ 16×16 icon area — never stack fixed plate padding with `IconPadding`).
  - **Main menu mark (required)**: custom animated main menu mark unique to the theme (hover + menu-open animation, one shared `Local<Name>MenuMarkTemplate` in `Common.xaml` used by `Sidebar.xaml` and `TopPanel.xaml`). Follow [docs/themes/menu-mark.md](../../../docs/themes/menu-mark.md), copy only the mechanics from Cloudbank, and verify hover and open live.
  - Top bar order: search (`PART_TextMainSearch` with persistent `Glyph` outside `PART_SeachIcon` and transparent hit-test `Border` on `PART_ClearTextIcon`) -> filter toggle (`PART_ToggleFilter` with 7–10px `DataChangeNotifBrush` shape mark, never `LOCFilterActiveLabel` text) -> sorting first inside `PART_PanelMainItems`, icon-only view switches, and `PART_ProgressGlobal` (`Height="12"`, ≥ 12px side margin on `PART_TextProgressText`).
- **Settings chrome ([docs/themes/settings-screens.md](../../../docs/themes/settings-screens.md))**:
  - `DefaultControls/TreeView.xaml`: bare 28–32px rows in body font at rest, opacity-animated hover wash, selected wash + 2px accent bar + brighter label, and `WindowSettings` / `WindowExtensions` triggers setting `Width` (240–280) and `ScrollViewer.VerticalScrollBarVisibility="Visible"`.
  - `DerivedStyles/StandardWindowStyle.xaml` + `WindowBarButton.xaml`: 36–48px title band (`CaptionHeight` == content top margin), signature vector graphic, `WindowSettings` title trigger (`LOCSettingsLabel`), and any hidden `PART_TextTitle` wrapped inside a `Visibility="Collapsed"` parent.
- **Unified popup menus & dropdown lists ([docs/themes/menus.md](../../../docs/themes/menus.md))**:
  - One shared `Local*` board template in `DefaultControls/ContextMenu.xaml`, reused by `DefaultControls/Menu.xaml` (`SubmenuItemTemplateKey`, `SubmenuHeaderTemplateKey`, `SeparatorStyleKey`), `DefaultControls/ComboBox.xaml` (`PART_Popup` and `ComboBoxItem`), and optional `CustomControls/{ComboBoxList,FilterSelectionBox}.xaml` overrides; `TopPanelMenu` in `TopPanel.xaml` is `BasedOn="{StaticResource {x:Type ContextMenu}}"` with no `Template`.
  - Compact 28–32px rows, fixed icon column, plain `*` label column, shared-size shortcut column, `TextElement.Foreground` set on `TargetName="Icon"` in `IsHighlighted` / Exit triggers, and `Alt+Q` Exit in danger style (≥ 4.5:1 contrast). Add the theme's row to the signatures table in `docs/themes/menus.md`.
- **Game pages (`Views/DetailsViewGameOverview.xaml` & `Views/GridViewGameOverview.xaml`)**:
  - May be written directly or generated via a theme script importing `scripts/overview-generator.mjs`.
  - **Must** run `node scripts/game-page-breakpoints.mjs` on both overview files so `GameDetailsPanePosition` (`Right` default, `Left`, `Center` / `Stretch` full-width 3/2/1-column sequential grid with `Meta*` dividers collapsed) and responsive 900+ / 560–899 / <560 breakpoints work in both views.
  - Proportional `MathConverter` banner spacer + minimum top gutter floor at low/zero/collapsed banner heights; `PART_ButtonMoreActions` and `PART_ButtonEditGame` as equal fixed-size icon-only squares with tooltips (`Edit` always visible); `SteamScreenshotsGameScope` parent eligibility gate (`FallbackValue=PluginUnavailable`); custom 28×28 `SidePanelCloseButton` (top-left corner at banner ≥ 120px or no game; fixed inline left of the game icon below 120px or when `ShowBackgroundImageOnWindow` is True); designed `LOCErrorNoGameSelected` empty state in both views with `PART_ScrollViewHost` explicitly `Visibility="Visible"`.
- **Interactive layer & running game indicator ([docs/themes/running-motion.md](../../../docs/themes/running-motion.md))**:
  - `DerivedStyles/PlayButton.xaml`: animated hover + separate pressed layer, `MinWidth` fitting `LAUNCHING`/`RUNNING` + mark room, `PART_ButtonContextAction` styled with `PlayButton` + `Tag="ContextAction"`, solid `RunningIndicatorBrush` plate while launching/running darkened by `RunningBreath` scrim, and `LOCCancelLabel` + `RunningHoverDim` on `{Binding IsRunning}` + `{Binding IsMouseOver, RelativeSource={RelativeSource Self}}` (hiding `PlayContent` with `Visibility="Hidden"`, never `Collapsed`).
  - `DerivedStyles/DetailsViewItemStyle.xaml`: smooth branded hover (`IsMouseOver`) and click/selection (`IsSelected`) animations, plus `RowHoverPlay` / `RowHoverInstall` (26×26, transparent background, row `Foreground`, collapsed when launching/running) and `RowHoverRoom` (`0,0,38,0` padding on hover).
  - `DerivedStyles/GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml`: smooth branded cover hover and click/selection animations; themed `GridTileButton` Play and Info overlay buttons at least **48×48** (`Width` and `Height` ≥ 48, whole-button hit area).
  - `RunningIndicator` across `DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`, `DefaultControls/ListView.xaml`, and `RunningActionIndicator` in `PlayButton.xaml`: drawn above selection/hover layers in the item's real shape, launching progress sweep (`RunningScan` + `RunningFill` + reacting mark) and running idle pulse, with `PlayRoom` / `RowRoom` + `RunningMarkPlate` padding sized so marks never overlap text.
- **Window background art**: in `Views/Library.xaml`, full-strength `PART_ImageBackground` in a `Grid.RowSpan="2"` layer reaching under the rail (`-44,0,0,0` / `-56`) with a soft bottom fade into `WindowArtSwatch`; under `{Settings ShowBackgroundImageOnWindow}` = True, top bar, rail, panels, overviews, and `Expander` headers turn `Transparent`, scrollbar `TrackFill` drops to `0.4`, `HeroArt` collapses, ThemeModifier `GameBannerHeight` / `GameBannerDarken` sliders disable in `Slider.xaml`, and light themes switch unplated text to `WindowArtForegroundBrush`. With the setting off, `GameBannerDarken` + `GameBannerTintBrush` (with the 50% floor layer) tint the hero banner.
- **WPF runtime safety**: keep inactive overlay plates `Visibility="Collapsed"` at rest; animate `RenderTransform` only from `ControlTemplate.Triggers` targeting named transforms (never from `Style.Triggers`); define `WindowDesignStyle` standalone (never `BasedOn` `StandardWindowStyle`); include `ScrollViewer.CanContentScroll="True"` on `ListBox`; set explicit `Hidden` scrollbars on `PasswordBox` `PART_ContentHost`; never put `TextBlock.TextTrimming` / `TextWrapping` as attached attributes on `ContentPresenter`.

### B3. Verify, Document & Deploy

1. **Re-render & check preview parity**:
   ```powershell
   pwsh scripts/take-screenshots.ps1 -Extension <key>
   node scripts/preview-layout.mjs src/themes/<Name>
   ```
2. **Validate & build**:
   ```powershell
   pwsh scripts/validate-extension.ps1 -Extension <key> -Mode Package
   pwsh scripts/build-theme.ps1 -Extension <key> -Launch   # use -NoDeploy in worker subagents or off Windows
   ```
   On Windows with Playnite installed, run the WPF regression tests (`tests/wpf/{GamePageBreakpoints,DetailsViewLayout,GridOverviewLayout,SidePanelCloseButton,SteamScreenshots,TopPanelLayout,SearchGlyph,SearchClear,RunningIndicator,RunningLabelOverlap}RegressionTests.ps1 -Keys <key>`, `RunningMotionFrames.ps1 -Keys <key> -OutDir <scratch>`, and 32-bit `tests/wpf/MenuRender.ps1 -Key <key> -Out <scratch>/<key>-menu.png`) and confirm `%APPDATA%\Playnite\playnite.log` shows `Application ... started` with zero `Unhandled exception occured` lines.
3. **Catalog & READMEs**:
   - Complete `src/themes/<Name>/AGENTS.md` (following `src/themes/AGENTS.md` -> Per-theme notes) and `info/danitesler_<key>.yaml`.
   - Add the theme's layout row to [src/themes/AGENTS.md](../../../src/themes/AGENTS.md), its menu signature row to [docs/themes/menus.md](../../../docs/themes/menus.md), and its table row to root [README.md](../../../README.md).
   - Run `python3 scripts/sort-readme-themes.py`, `node scripts/generate-readmes.mjs`, and `npm run check:readmes`.
