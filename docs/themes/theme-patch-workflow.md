# Theme patch workflow

Themes are standalone by design (`src/themes/AGENTS.md`): no shared XAML.
A shell, game-page, or sidebar fix must be applied to every theme
individually. This checklist keeps all registered themes in sync.

## Shared skeleton (same role in every theme)

| Area | Files (under each `src/themes/<Name>/src/`) |
|------|----------------------------------------------|
| Shell | `Views/MainWindow.xaml`, `Views/Sidebar.xaml`, `Views/TopPanel.xaml`, `Views/Library.xaml`, `DerivedStyles/MainWindowStyle.xaml`, `CustomControls/SidebarItem.xaml`, `CustomControls/TopPanelItem.xaml` |
| Game page | `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` |
| Game-page skeleton pieces | `GameBannerHeight` in `Common.xaml`, `MathConverter` spacer + `ActualHeight == 0` trigger, `Meta*` groups, `PropertyItemButton` chip trigger |
| Game page crash guards | Every theme XAML: no storyboard in a `Style` trigger that animates through a sub-object such as `RenderTransform` (`StyleTriggerComplexAnimation` validator rule), and well-formed path data (`PathDataSyntax` validator rule). Both pass the build and crash Playnite when game details open |

The [shared theme guide](../../src/themes/AGENTS.md) owns layout and control rules. Each theme’s own `AGENTS.md` records its differences.

## Steps

1. Fix one theme first, validate and load it in Playnite.
2. Find every copy — search from the repo root, not per folder:
   ```bash
   rg -n -g '*.xaml' '<pattern>' src/themes
   ```
   Useful patterns: `PART_PanelMainItems`, `MathConverter`, `IconPadding`,
   `CornerRadiusFull`, `MetaProgress`, `GameBannerHeight`.
3. Apply the same fix to each copy using that theme’s keys and spacing. Update any generator that writes the affected files.
4. Triage `CornerRadiusFull` hits before touching them: most are
   intentional 1:1 IconButtons (32x32 main menu, 40x40 toggles, 30x30
   plates, 16x16 dots). Only a pill radius on a non-square element is
   a bug — the validator's square-walk already allows the 1:1 cases.
5. Validate and build every touched theme — or all of them in one run:
   ```pwsh
   ./scripts/validate-themes.ps1 [-Keys shade,primo]   # all registered themes by default; -Mode Package before a release
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
   redeploy each one (`build-theme.ps1 -Extension <key> -Deploy -NoRestart`; keeps the active
   theme), then normally build/deploy the intended active theme to restart a running Playnite once. Normal single-theme builds now deploy automatically; `-NoDeploy` keeps only artifacts, and `-Launch` explicitly starts a closed Playnite.
6. Keep the PR to one area across themes (e.g. "sidebar padding in all
   themes"), not one theme across areas, so review stays mechanical.

## Why not shared XAML

Sharing would couple every design to one file: a change for one design
system would risk all others, and per-theme divergence (plates, rails,
badges) already exceeds what a shared template could carry. The grep +
checklist above is the deliberate substitute.

## Sweeping many themes at once

- Prove the change on one theme first. Record the key, the rule being fixed, and the checks that passed. Keep a targeted search with the coordinator and delegate substantial surveys or independent review.
- When the remaining work is large enough to split, give each worker a distinct set of theme folders. Each worker owns the XAML, any generators that write it, and the previews affected by the change. Use the current checkout by default. Create a dedicated worktree only when the user requests or approves one.
- Workers run `validate-themes.ps1 -Keys <keys>` and `build-themes.ps1 -Keys <keys>`. For a single theme, use `validate-extension.ps1 -Extension <key>` and `build-theme.ps1 -Extension <key> -NoDeploy`. Return touched keys, checks and failures to the coordinator.
- The coordinator owns shared scripts, the extension catalog and generated root README links. Inspect the combined diff and run the relevant checks on the combined result. Deploy the touched themes from one session and restart only for the intended active theme. Check `playnite.log` for XAML errors after exercising the changed views.
