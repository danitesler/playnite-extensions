# Autogrid — extension notes

## What this extension does

**Autogrid** is a **Playnite** extension (**GenericPlugin**, `net462`, **WPF**) that adjusts **`AppSettings.GridItemWidth`** when the main window layout changes so the **Desktop grid** view stays near a user-chosen **target column count** (or **target row count**). It only applies when **`ActiveDesktopView == DesktopView.Grid`**.

## Product arc

1. **Core behavior** — Hook main window `SizeChanged` / `StateChanged` / `LayoutUpdated` (the last only when the games list's measured size changed; see Debounce), debounce ~50ms, read/write settings via reflection on the same `AppSettings` object Playnite binds to (`GridItemWidth`, `GridItemSpacing`).
2. **Column / gutter issues** — Viewport was initially guessed from window width / `ScrollViewer`; themes with max-width columns or margins caused wrong wrap width and side gutters.
3. **Gutter fix** — `GridLayoutService` picks a games `ScrollViewer` and uses its **viewport width** as the wrap target (not `ItemsPresenter` ActualWidth, which follows the tiles and locks side gutters). Presenter `MaxWidth` / margin still constrain. `ViewportAdjustPx` remains the theme-escape hatch.
4. **Settings** — `Enabled`, `SizingMode` (Columns / Rows), `TargetColumns` (1-20), `TargetRows` (1-10), `KeepGridWhileDetailsOpen` (default on), `ViewportAdjustPx` (-200..200).
5. **Apply loop** — Writes cover width and leftover-gutter spacing, then `SaveSettings()` on Playnite `AppSettings` in the background. Turning Autogrid off restores the snapshotted user width and spacing and persists that restore.

## Implementation

- **Cover-size ownership** — First apply while enabled snapshots `GridItemWidth` / `GridItemSpacing` into plugin settings (`HasSavedUserLayout`) and persists that snapshot immediately. Playnite's own width is saved 250ms later; a kill in between must not make the next launch snapshot the computed width. Disable restores both and saves Playnite settings so the user’s grid comes back. Snapshot is not recaptured until the next enable. Playnite’s `GridItemWidth` setter **rounds** to an integer.
- **Grid details panel** — Grid view's game details panel (`PART_ControlGameView`) is bound in code to `PlayniteSettings.GridViewSideBarVisible` (set by `ShowGameSideBarCommand` on every game it shows, cleared by `CloseGameSideBarCommand`, persisted in config.json, so it can be open at launch). The stock `LibraryGridView` template docks it beside the games list (`GridViewDetailsPosition`, width `GrdiDetailsWitdh`), so opening it narrows the list; `VirtualizingWrapPanel` recomputes items per line from its measure width and every tile moves (containers re-realized, covers reload, scroll jumps). With `KeepGridWhileDetailsOpen` (and Autogrid enabled):
  - **Pin** (`GridWidthPin`) — the plugin watches the `AppSettings` object's `PropertyChanged`. On open, synchronously (before the next layout pass) it sets `Width` on `PART_ListGames`'s `ScrollViewer` content (the `ItemsPresenter`) to its current `ActualWidth`; the wrap panel keeps its columns and the panel covers the grid's edge (layout clip). Panel on the left also sets `HorizontalAlignment=Right` so the visible tiles keep their screen position. Window width changes while pinned accumulate the same deltas and grow/shrink the pin once after a 50ms pause, on the pinned content's dispatcher. This avoids reflowing the covers on every resize event; the details panel still resizes live. Releasing the pin cancels any queued resize. On close it clears both values, then applies directly at `Loaded` priority (right after the layout pass that collapses the panel), falling back to the debounce only if that apply can't measure yet. The debounce alone lagged: each layout pass of the reflow restarts its 50ms timer. A theme that sets `Width` on that element itself is left alone (one warning). Grouped grids work because the outer panel hands its pinned viewport to each group.
  - **Pause** — `ApplyAutogrid` returns early (no width write, no snapshot) while the flag is true, since the narrowed `ScrollViewer` would otherwise shrink covers.
  - **Tile size cache** — `VirtualizingWrapPanel` 2.5.4 caches the first tile's size in private `sizeOfFirstItem` and refreshes it only when item 0 is realized (scrolled to top); rows and every tile's measure use it. After any cover width write, including the restore when Autogrid is turned off, clear it (`GridLayoutService.ResetWrapPanelItemSize`, all panels under `PART_ListGames`, tiles skipped) before the layout pass. Without it, one large width jump (window resized while the panel was open, then closed, or disable while scrolled) leaves missing or clipped covers. Missing field after a Playnite upgrade: one warning, no reset.
  - Trade-off: tiles under the panel are hidden until it closes. Panel already open at launch: nothing to pin; closing it reflows once. Missing flag after a Playnite upgrade: log one warning and keep the old behavior.
- **Debounce** — `LayoutUpdated` fires for every layout pass in the app. Something can re-lay out every frame (240 passes/s logged after using a filter, source not identified, Autogrid made no writes during it), and restarting the 50ms timer on each pass starved it so nothing re-fit. Only a changed `GridLayoutSignature` of the picked `ScrollViewer` restarts it; `SizeChanged`/`StateChanged` always do; before a list is tracked, a pass arms the timer without pushing it back. Cover size changes don't alter that signature, so `AppSettings` `PropertyChanged` for `GridItemWidth`/`GridItemSpacing` requests the apply instead (confirmation pass after Autogrid's own write, zoom slider re-fit).
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
