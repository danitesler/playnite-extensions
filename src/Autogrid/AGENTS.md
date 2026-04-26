# Autogrid — extension notes

## What this extension does

**Autogrid** is a **Playnite** extension (**GenericPlugin**, `net462`, **WPF**) that adjusts **`AppSettings.GridItemWidth`** when the main window layout changes so the **Desktop grid** view stays near a user-chosen **target column count**. It only applies when **`ActiveDesktopView == DesktopView.Grid`**.

## Product arc

1. **Core behavior** — Hook main window `SizeChanged` / `LayoutUpdated` / `StateChanged`, debounce ~100ms, read/write settings via reflection on the same `AppSettings` object Playnite binds to (`GridItemWidth`, `GridItemSpacing`).
2. **Column / gutter issues** — Viewport was initially guessed from window width / `ScrollViewer`; themes with max-width columns or margins caused wrong wrap width and side gutters.
3. **Gutter fix** — `GridLayoutService` picks a games `ScrollViewer`, measures the widest `ItemsPresenter` under it, resolves `ViewportMetrics`, applies `ViewportAdjustPx`, and uses per-tile horizontal margin budget.
4. **Settings** — `Enabled`, `TargetColumns` (1-20), `ViewportAdjustPx` (-200..200).
5. **Apply loop** — `AutogridPlugin` skips the tight epsilon early exit when window `ActualWidth` / `ActualHeight` changed enough so small corrections still apply after resize.

## Key files

| Area | Path |
|------|------|
| Plugin lifecycle, hooks, apply | `src/Autogrid/src/AutogridPlugin.cs` |
| Viewport, scroll/panel measure, width math | `src/Autogrid/src/GridLayoutService.cs` |
| Settings model | `src/Autogrid/src/AutogridSettings.cs` |
| Settings UI | `src/Autogrid/src/AutogridSettingsView.xaml` |
| Extension manifest | `src/Autogrid/info/extension.yaml` |
| Project file | `src/Autogrid/Autogrid.csproj` |

## Gotchas

- Reflection failures set `reflectionBroken` and stop applying until restart.
- Keep `Autogrid_7F3E9B82`, `Autogrid.dll`, and `7F3E9B82-4D1C-4E8A-9F2B-6C5A891D0E2F` stable for shipped users.
