# Autogrid — extension notes

## What this extension does

**Autogrid** is a **Playnite** extension (**GenericPlugin**, `net462`, **WPF**) that adjusts **`AppSettings.GridItemWidth`** when the main window layout changes so the **Desktop grid** view stays near a user-chosen **target column count** (or **target row count**). It only applies when **`ActiveDesktopView == DesktopView.Grid`**.

## Product arc

1. **Core behavior** — Hook main window `SizeChanged` / `LayoutUpdated` / `StateChanged`, debounce ~50ms, read/write settings via reflection on the same `AppSettings` object Playnite binds to (`GridItemWidth`, `GridItemSpacing`).
2. **Column / gutter issues** — Viewport was initially guessed from window width / `ScrollViewer`; themes with max-width columns or margins caused wrong wrap width and side gutters.
3. **Gutter fix** — `GridLayoutService` picks a games `ScrollViewer` and uses its **viewport width** as the wrap target (not `ItemsPresenter` ActualWidth, which follows the tiles and locks side gutters). Presenter `MaxWidth` / margin still constrain. `ViewportAdjustPx` remains the theme-escape hatch.
4. **Settings** — `Enabled`, `SizingMode` (Columns / Rows), `TargetColumns` (1-20), `TargetRows` (1-10), `ViewportAdjustPx` (-200..200).
5. **Apply loop** — Writes cover width and leftover-gutter spacing, then `SaveSettings()` on Playnite `AppSettings` in the background. Turning Autogrid off restores the snapshotted user width and spacing and persists that restore.

## Implementation

- **Cover-size ownership** — First apply while enabled snapshots `GridItemWidth` / `GridItemSpacing` into plugin settings (`HasSavedUserLayout`). Disable restores both and saves Playnite settings so the user’s grid comes back. Snapshot is not recaptured until the next enable. Playnite’s `GridItemWidth` setter **rounds** to an integer.
- **Leftover gutter** — Column mode sizes covers from the scroll viewport and snapshotted user spacing (`spacing/2` per side). Leftover pixels go into **cover width**, not `GridItemSpacing` (spacing bumps add left/right tile margin). `SafetyPadding` is 0 so offset 0 stays flush; `ViewportAdjustPx` is for theme chrome that still measures wrong. Row mode does not change spacing.

## Key files

| Area | Path |
|------|------|
| Plugin lifecycle, hooks, apply | `src/Autogrid/src/AutogridPlugin.cs` |
| Viewport, scroll/panel measure, width math | `src/Autogrid/src/GridLayoutService.cs` |
| Settings model | `src/Autogrid/src/AutogridSettings.cs` |
| Settings UI | `src/Autogrid/src/AutogridSettingsView.xaml` |
| Loc helper | `src/Autogrid/src/AutogridLoc.cs` |
| Localization | `src/Autogrid/Localization/*.xaml` (Playnite Crowdin set; English fallback) |
| Extension manifest | `src/Autogrid/info/extension.yaml` |
| Project file | `src/Autogrid/Autogrid.csproj` |

## Gotchas

- Reflection failures set `reflectionBroken` and stop applying until restart. Log once with `LogManager.GetLogger()`.
- Keep `Autogrid_7F3E9B82`, `Autogrid.dll`, and `7F3E9B82-4D1C-4E8A-9F2B-6C5A891D0E2F` stable for shipped users.
- Always persist Autogrid’s computed `GridItemWidth` to Playnite settings. Always persist the **restore** when disabling. Do not write `GridItemSpacing` unless restoring the user snapshot.
- Do not snapshot layout after Autogrid has already written this session — capture only when `HasSavedUserLayout` is false.
