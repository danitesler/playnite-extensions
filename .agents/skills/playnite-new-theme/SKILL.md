---
name: playnite-new-theme
description: Create a new, creative, unique, and visually bombastic Playnite theme from a game link or name, film, fictional UI, or design system. Use when scaffolding or building a new Playnite theme.
---

# Create a new Playnite theme

Build a standalone Playnite desktop theme under `src/themes/<Name>/` inspired by the user's source (game link or name, film, fictional UI, or design system). Read [docs/themes/new-theme.md](../../../docs/themes/new-theme.md), [docs/themes/creative-direction.md](../../../docs/themes/creative-direction.md), [src/themes/AGENTS.md](../../../src/themes/AGENTS.md), and [playnite-theme-dev](../playnite-theme-dev/SKILL.md).

## How global skills and repo context fit together

- **Design context (`RESEARCH.md` + `BRIEF.md` + `src/tokens.css`)**: Each theme in this monorepo is its own self-contained design system under `src/themes/<Name>/`. Its `RESEARCH.md`, `BRIEF.md`, `AGENTS.md`, and `src/tokens.css` (scaffolded by `scripts/new-theme.ps1`) act as that theme's design memory and plan in place of a root `DESIGN.md`.
- **What you CAN use from global skills**:
  - **Reference research (`design-references`)**: Use web search, user-supplied captures, reference repos, and `design-references` (`inspire.mjs` for open fonts, Lospec palettes, Iconify sets, Are.na boards, and browser galleries such as Interface In Game or HUDS+GUIS; ask before opening Game UI Database). Record every source URL, license, sampled color, font, and HUD/menu observation in `src/themes/<Name>/RESEARCH.md`.
  - **Visual & motion principles (`design-visual-direction`, `design-motion`)**: Use their hierarchy, anti-tell checks (`ai-tells.md`), and purposeful motion rules (`game-ui.md`, `app-ui.md`), translating them into `src/themes/<Name>/BRIEF.md` and WPF `ControlTemplate.Triggers` storyboards.
  - **File placement (`agent-local-docs`)**: Keep maintained theme deliverables (`RESEARCH.md`, `BRIEF.md`, `AGENTS.md`, `README.md`, `info/*`, `src/*`, `art/preview-*.html`, `art/screenshot-*.png`, `art/mark.svg`, and deterministic generators like `art/sprites.py` or `art/icons.mjs`) in `src/themes/<Name>/`. Send all disposable files (reference captures, sprite contact sheets like `fx-sheet.png`, `RunningMotionFrames.ps1 -OutDir <scratch>`, `MenuRender.ps1 -Out <scratch>`) to scratch.
  - **Delegation (`agent-delegate`)**: Check rendered HTML previews against [theme-preview-review.md](../../../docs/themes/theme-preview-review.md) yourself before starting XAML (do not spawn a preview-reviewer subagent). Any other delegation follows `agent-delegate` budgets, and workers always build with `-NoDeploy`.
- **What replaces web-only checks**: Do not run mobile viewport checks or `npx impeccable` / `style-census.js` DOM checks on Playnite themes. Theme verification uses the 1280×720 Chromium preview pipeline (`scripts/take-screenshots.ps1`, `scripts/preview-tokens.mjs`, `scripts/preview-layout.mjs`, `scripts/theme-fonts.mjs`), [theme-preview-review.md](../../../docs/themes/theme-preview-review.md), `pwsh scripts/validate-extension.ps1 -Extension <key> -Mode Package`, and the WPF regression scripts in `tests/wpf/`.

## Ambition modes (`new-theme.ps1 -Ambition`)

Pick the mode requested by the user, or default by source type:

| Mode | When to use | What it requires |
| --- | --- | --- |
| **`Showcase`** (default for games, films, fictional UIs) | Translating a game's HUD, pause/title menu, or diegetic artifact into Playnite | Maximum source specificity: 8+ rebuilt game UI elements, bespoke source-drawn `Icon<Role>` vectors, custom white-mask FX sprites (`art/sprites.py`) when flat vector fills look thin, signature animated Play/row/cover/menu/running states |
| **`Hybrid`** | A game whose UI is a clean, minimal design system | Faithful, clean layout and controls + Showcase signature moments on Play, covers, empty state, and settings title band; bespoke `Icon<Role>` vectors |
| **`Faithful`** | Real design systems and OS UIs (Material, Fluent, Primer, shadcn) | Exact published tokens, radii, states, and motion curves; no invented glows or game ornaments; may map the system's official open icon pack via `icons.json` |

## What MUST be used (end-to-end workflow)

### 1. Research & Creative Brief (`RESEARCH.md` & `BRIEF.md`, before XAML)

1. **Research (`RESEARCH.md`)**: Measure exact colors, typography (and open SIL OFL stand-ins from `scripts/fonts/` when the source uses a commercial or non-Windows font), borders/plates/radii, icon geometry, and frame-stepped motion (hover, press, selection, menu cursors, loading/running states).
2. **Brief (`BRIEF.md` per [creative-direction.md](../../../docs/themes/creative-direction.md))**:
   - **3 Candidate lenses -> pick 1**: Sketch *(a) Diegetic / Artifact*, *(b) HUD / Telemetry*, and *(c) Title / Pause Menu*; compare against the last 5 themes in [src/themes/AGENTS.md](../../../src/themes/AGENTS.md) and pick the least-repeated lens.
   - **Source DNA (5 traits)** and **Game element map (8+ rows, 3+ recognizable on sight)**.
   - **6 Shell & Game Page Levers** (each source-derived, never generic rectangles):
     1. Hero banner transition (`Views/*ViewGameOverview.xaml`)
     2. Play button architecture (`DerivedStyles/PlayButton.xaml`)
     3. Metadata container & group break (`Views/*ViewGameOverview.xaml`)
     4. Chip & score silhouette (`DerivedStyles/PropertyItemButton.xaml`, `TextBlockGameScore.xaml`)
     5. Row & cover selection mark (`DetailsViewItemStyle.xaml`, `GridViewItemStyle.xaml`)
     6. Custom 28×28 side-panel close plate (`SidePanelCloseButton` in `GridViewGameOverview.xaml`)
   - **7 Popup Menu Levers** ([docs/themes/menus.md](../../../docs/themes/menus.md)): panel material/edge, animated highlight, group break, icon hover contrast, shortcut treatment, submenu mark, and marked rows (`Alt+Q` Exit in danger style + checked row mark), distinct from every finished row in the `menus.md` signatures table.
   - **Motion language**: fast (90–140ms), base (160–240ms), slow (280–450ms) durations, one easing personality, 1 hero moment + 5+ secondary moments, and restraint rules (calm list/grid/metadata backgrounds).
   - **Original branding**: an evocative original or `<Source>-inspired` name (never an official/trademarked product title), one custom vector mark from the source's shapes (never a copied logo) reused in the title band, empty state, and `art/mark.svg`, plus `info/NOTICE-<Dir>.txt`.

### 2. Scaffold, Tokens & Fonts

1. **Scaffold**:
   ```powershell
   pwsh scripts/new-theme.ps1 -Name "<Theme Name>" -Key <key> -DesignSystem "<Source>" -Ambition Showcase|Hybrid|Faithful
   ```
   Move your research and brief into `src/themes/<Name>/RESEARCH.md` and `BRIEF.md`.
2. **Tokens (`src/tokens.css` & `src/Constants.template.xaml`)**:
   - Define the source's tokens in `src/tokens.css` (`:root`, or `.dark` override).
   - Map every `{{TODO}}` in `src/Constants.template.xaml` using only Playnite palette keys (`scripts/data/playnite-theme-api.json`) and shared vocabulary keys (`scripts/data/theme-keys.json`; theme-only templates/geometries use `Local*` keys).
   - Required special brushes: `GameBannerTintBrush` (solid dark brand surface or art tint, never plain black unless the theme is black), `RunningIndicatorBrush` (distinct hue from Play, selection, hover, and filter mark), and `WindowArtForegroundBrush` (for light themes when window background art is enabled).
3. **Bundled fonts (`src/Typography/`)**:
   - If the theme leads any font stack with a face Windows does not ship, copy static `.ttf` weights (only weights used + `Regular`) and `OFL*.txt` from `scripts/fonts/` into `src/Typography/` (never `Fonts/`), subset to Latin + Cyrillic with `python3 scripts/subset-theme-fonts.py` (unless Reserved Font Name), and reference as `./Typography/#<Family>, <Fallback>`.

### 3. HTML Previews First (`art/preview-details.html` & `art/preview-settings.html`)

Build both 1280×720 HTML previews per [docs/themes/previews.md](../../../docs/themes/previews.md) **before writing XAML**:
- Use `var(--token)` colors from `src/tokens.css` (`node scripts/preview-tokens.mjs link src/themes/<Name>`), bundled font names only (zero `system font used` warnings), real sizes, and all required `data-part` attributes (`top-panel` order: `PART_TextMainSearch` -> `PART_ToggleFilter` -> `PART_PanelMainItems` with sorting first and icon-only view switches).
- Stage the hero moment in its hovered end state in `preview-details.html`, show the brand mark in the `preview-settings.html` title band, and show at least 3 rows of the `BRIEF.md` game element map.
- Render with `pwsh scripts/take-screenshots.ps1 -Extension <key>` (`art/screenshot-details.png`, `art/screenshot-settings.png`), inspect both PNGs, and self-check against [docs/themes/theme-preview-review.md](../../../docs/themes/theme-preview-review.md). Fix any blocking findings before starting XAML.

### 4. Icons, Tile & Optional FX Sprites

- **UI icons (`Icon<Role>` in `src/Media.xaml`)**:
  - `Showcase` / `Hybrid`: author bespoke vector `StreamGeometry` / `DrawingImage` icons in `src/Media.xaml` (or generate via `art/icons.mjs`) in the source's stroke weight and silhouette.
  - `Faithful`: may render the design system's official icon set via `icons.json` (`format: "Geometry"`, `updateXaml: true`) + `pwsh scripts/render-icons.ps1 -Extension <key>`.
- **Context-menu PNGs (24 Playnite menu keys in `src/Media.xaml`)**: configure `Png` jobs with `colorToken` in `icons.json` (or custom SVGs in `icons/`) and run `pwsh scripts/render-icons.ps1 -Extension <key>`, or declare Playnite's icofont `TextBlock`s without local `Foreground` so hover triggers invert them.
- **Optional FX masks (`art/sprites.py` -> `src/Images/fx/*.png`)**: when flat fills or vector `Path`s cannot capture the source's textures, brush strokes, or 9-slice blooms, generate deterministic pure-white (`255, 255, 255`) RGBA alpha masks with `Pillow` + `NumPy` (fixed random seed). Color them via `OpacityMask` (`Local*` brushes in `Common.xaml`) and CSS `-webkit-mask`. Save contact sheets to scratch (`agent-local-docs`) and inspect before wiring in.
- **Add-on tile (`info/icon.png`)**: author `art/mark.svg` and run `pwsh scripts/render-addon-icon.ps1 -Svg src/themes/<Name>/art/mark.svg -Extension <key>` (always default `#FF7A1A` orange, never pass `-Color`).

### 5. XAML Implementation (Required Surfaces & Mechanics)

Implement all files listed in [src/themes/AGENTS.md](../../../src/themes/AGENTS.md#the-files-every-theme-ships), following [docs/themes/reference.md](../../../docs/themes/reference.md):

- **Spacing & field heights (`src/Common.xaml`)**: `ControlHeight` = `32` (vertical `InputPadding`/`ButtonPadding` = 5, or 4 with thick borders; `Padding` applied once on `TextBox`/`PasswordBox`; `Button` `Width == 41` ThemeModifier trigger scaled `32/41` via `LayoutTransform`). Filter sidebar controls in `FilterPanelView.xaml` and preset buttons are `28px` (`28×28` square preset buttons).
- **Corner radii**: Base controls, `PlayButton`, and `PropertyItemButton` chips use `{DynamicResource ControlCornerRadius}` (never `CornerRadiusFull` on non-square elements; tracks/thumbs use explicit half-thickness numeric radii). `GroupBox.xaml` stays content-sized with no child reporting width ≥ 200px (wrap wide decor in `<Canvas>` inside `<Grid ClipToBounds="True">`). `ComboBox.xaml` reserves ≥ 12px right margin on `ContentSite` for the chevron. `TabControl.xaml` keeps `Foreground="{DynamicResource TextBrush}"` on `TabItem` and sets state colors on the header `TextBlock` via `TargetName`.
- **Shell (`MainWindow`, `Sidebar`, `TopPanel`, `Library`, `SidebarItem`, `TopPanelItem`, `SearchBox`)**:
  - Left 44px compact rail (44×40 items, ≥ 16×16 icon area — never stack fixed plate padding with `IconPadding`).
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

### 6. Verify, Document & Deploy

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

## Main menu mark (required)

Every theme draws its own animated main menu mark (hover plus menu-open animation, unique to the theme's motif and motion, one shared `Local<Name>MenuMarkTemplate` in `Common.xaml` used by `Sidebar.xaml` and `TopPanel.xaml`). Follow `docs/themes/menu-mark.md`, copy only the mechanics from Cloudbank, and verify hover and open live before calling the theme done.
