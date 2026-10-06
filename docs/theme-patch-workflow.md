# Theme patch workflow (29x edits)

Themes are standalone by design (`src/themes/AGENTS.md`): no shared XAML.
A shell, game-page, or sidebar fix must be applied to every theme
individually. This checklist keeps the 29 copies in sync.

## Shared skeleton (same role in every theme)

| Area | Files (under each `src/themes/<Name>/src/`) |
|------|----------------------------------------------|
| Shell | `Views/MainWindow.xaml`, `Views/Sidebar.xaml`, `Views/TopPanel.xaml`, `Views/Library.xaml`, `DerivedStyles/MainWindowStyle.xaml`, `CustomControls/SidebarItem.xaml`, `CustomControls/TopPanelItem.xaml` |
| Game page | `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` |
| Game-page skeleton pieces | `GameBannerHeight` in `Common.xaml`, `MathConverter` spacer + `ActualHeight == 0` trigger, `Meta*` groups, `PropertyItemButton` chip trigger |
| Sidebar rail | 44px rail, 44x40 items, 16px glyphs; exactly one of fixed plate padding or `{Binding IconPadding}` (`SidebarIconPadding` validator rule) |
| Corner radii | `ControlCornerRadius` on base controls / PlayButton / chips / tracks; `CornerRadiusFull` only on 1:1 squares (validator rule) |
| ThemeModifier buttons | `DefaultControls/Button.xaml`: a `Width == 41` trigger (`Padding="0"`, content centered, `MinWidth` 41, `MinHeight` 41, `FontSize` 16) that renders the plugin's fixed-width pencil / restore buttons as small 41x41 squares (`ThemeModifierIconButtons` validator rule) |
| Statistics page | `DefaultControls/GroupBox.xaml`: content-sized — no child reports a large desired width (no Path/Line over ~200px, no fixed `Width`/`MinWidth` ≥ 200); spanning art goes in a clipped `Canvas` so the sections wrap as cards (`GroupBoxContentSized` validator rule) |
| ComboBox chevron | `DefaultControls/ComboBox.xaml`: `ContentSite` reserves ≥12px on its right (right margin or its own grid column) so a short value never runs under the dropdown arrow (`ComboBoxChevronRoom` validator rule) |
| Game action buttons | `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml`: More and Edit are icon-only, the same fixed square, each with a `ToolTip`, Edit always visible (`GameActionButtons` validator rule) |

Per-theme `AGENTS.md` records only what differs from the skeleton.

## Steps

1. Fix one theme first, validate and load it in Playnite.
2. Find every copy — search from the repo root, not per folder:
   ```bash
   grep -rn --include="*.xaml" "<pattern>" src/themes/*/src
   ```
   Useful patterns: `PART_PanelMainItems`, `MathConverter`, `IconPadding`,
   `CornerRadiusFull`, `MetaProgress`, `GameBannerHeight`.
3. Apply the same edit to each copy, adapting only to the theme's own
   keys and spacing (tokens differ; structure should not).
4. Triage `CornerRadiusFull` hits before touching them: most are
   intentional 1:1 IconButtons (32x32 main menu, 40x40 toggles, 30x30
   plates, 16x16 dots). Only a pill radius on a non-square element is
   a bug — the validator's square-walk already allows the 1:1 cases.
5. Validate and build every touched theme — or all of them in one run:
   ```pwsh
   ./scripts/validate-themes.ps1 [-Keys shade,primo]   # all 29 by default; -Mode Package before a release
   ./scripts/build-themes.ps1 [-Keys shade,primo] [-DeployKey <key>]  # builds never deploy; -DeployKey deploys + restarts only that theme
   ./scripts/take-screenshots.ps1 -Extension <key>      # per theme, only where previews changed
   ```
   Single-theme equivalents still work (`validate-extension.ps1 -Extension <key>`,
   `build-theme.ps1 -Extension <key> -Deploy -Restart`). Root `AGENTS.md` mandates a build
   after every edit; deploying sets the active theme, so only the theme being worked on gets `-Deploy -Restart`.
   Then `node scripts/generate-readmes.mjs` (fetch tags first) if
   screenshots or manifests changed.
   **Playnite reads the deployed copy, not the repo.** It loads
   `%AppData%\Playnite\Themes\Desktop\<Id>`, so a build drop (`artifacts/builds/...`) and
   `-DeployKey`/`-Deploy` of one theme leave every other deployed copy stale — switching to
   those themes in Playnite still shows the old build. After a change that spans themes,
   redeploy each one (`build-theme.ps1 -Extension <key> -Deploy`; no restart, keeps the active
   theme), then restart Playnite once to reload.
6. Keep the PR to one area across themes (e.g. "sidebar padding in all
   themes"), not one theme across areas, so review stays mechanical.

## Why not shared XAML

Sharing would couple 29 designs to one file: a change for one design
system would risk all others, and per-theme divergence (plates, rails,
badges) already exceeds what a shared template could carry. The grep +
checklist above is the deliberate substitute.
