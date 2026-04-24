# Autogrid — agent handoff

## What this repo is

**Autogrid** is a **Playnite** extension (**GenericPlugin**, `net462`, **WPF**) that adjusts **`AppSettings.GridItemWidth`** when the main window layout changes so the **Desktop grid** view stays near a user-chosen **target column count**. It only applies when **`ActiveDesktopView == DesktopView.Grid`**.

## Conversation / product arc (short)

1. **Core behavior** — Hook main window `SizeChanged` / `LayoutUpdated` / `StateChanged`, debounce ~100ms, read/write settings via **reflection** on the same `AppSettings` object Playnite binds to (`GridItemWidth`, `GridItemSpacing`).
2. **Column / gutter issues** — Viewport was initially guessed from window width / `ScrollViewer`; themes with max-width columns or margins caused wrong wrap width and side gutters.
3. **Gutters “root fix”** (current layout code) — **`GridLayoutService`** picks a games **`ScrollViewer`**, measures the widest **`ItemsPresenter`** under it, resolves **`ViewportMetrics`** (caps by scroll width; no longer relies on a harsh window-only ceiling), adds **`ViewportAdjustPx`**, uses **`ItemSpacingMargin`** (Thickness `Left+Right`) when reflection succeeds else **`GridItemSpacing`**, **`ComputeTargetGridItemWidth`** uses per-tile horizontal margin budget.
4. **Settings** — `Enabled`, `TargetColumns` (1–20), **`ViewportAdjustPx`** (-200..200), **`LogDebugMeasurements`** (rate-limited `Logger.Info`).
5. **Apply loop** — **`AutogridPlugin`** skips the tight epsilon early exit when **window `ActualWidth`/`ActualHeight`** changed enough so small corrections still apply after resize.

## Key files

| Area | Path |
|------|------|
| Plugin lifecycle, hooks, apply | `src/Autogrid/AutogridPlugin.cs` |
| Viewport, scroll/panel measure, width math | `src/Autogrid/GridLayoutService.cs` |
| Settings model | `src/Autogrid/AutogridSettings.cs` |
| Settings UI | `src/Autogrid/AutogridSettingsView.xaml` |
| Extension manifest | `src/Autogrid/extension.yaml` |
| NuGet / Playnite SDK | `src/Autogrid/Autogrid.csproj` (PlayniteSDK **6.6.0**, `PrivateAssets`) |
| Release build script | `scripts/build-release.ps1` (root `build.ps1` delegates here) |

## APIs / gotchas other agents should know

- **Logging** — Use **`LogManager.GetLogger()`**; **`IPlayniteAPI`** here does not expose `CreateLogger`.
- **Reflection** — On failure the plugin sets **`reflectionBroken`** and stops applying until restart.
- **Locked DLL** — If Playnite holds `bin/Release`, run **`./build.ps1`** or **`scripts/build-release.ps1`** (outputs to **`artifacts/Release`**) or close Playnite before `dotnet build` to default `src/Autogrid/bin/Release/net462/`.

## Skills in this repo

Project Cursor skills live under **`.cursor/skills/`**:

- **`playnite-autogrid-build`** — build commands, output paths, scripts.
- **`playnite-autogrid-debug`** — Playnite log, debug settings, what to log/verify for layout issues.

Read those **`SKILL.md`** files when the user asks to build, deploy, or debug Autogrid.
