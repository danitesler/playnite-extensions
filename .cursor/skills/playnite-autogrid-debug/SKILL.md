---
name: playnite-autogrid-debug
description: Debugs the Autogrid Playnite extension (layout, reflection, logging, settings). Use when gutters, column count, GridItemWidth, or "plugin does nothing" issues appear, or when the user asks to trace Autogrid in Playnite.
---

# Playnite Autogrid — debug

## Quick checks

1. **Desktop grid only** — Plugin returns early unless **`PlayniteApi.MainView.ActiveDesktopView == DesktopView.Grid`**.
2. **Enabled** — **`AutogridSettings.Enabled`** must be true.
3. **Reflection circuit breaker** — If read/write of **`GridItemWidth`** / **`GridItemSpacing`** fails once, **`reflectionBroken`** is set; **restart Playnite** to retry.
4. **New DLL** — User must deploy **`Autogrid.dll`** (and **`extension.yaml`** if changed); Playnite may keep the old assembly loaded.

## Playnite log

- Open Playnite’s log / diagnostics (path depends on install; search Playnite docs for log file location).
- Autogrid uses **`LogManager.GetLogger()`** from **Playnite.SDK**.

## Structured layout diagnostics

In add-on settings enable **`Log debug measurements`**. The plugin emits **`Logger.Info`** at most **once per 500 ms** with:

- Resolved **viewport**, **panel** (ItemsPresenter), **scroll** widths  
- **`ViewportAdjustPx`**, **`GridItemSpacing`**, computed **per-tile margin** (from **`ItemSpacingMargin`** reflection when available)  
- **target** vs **current** width, **target columns**, **winSizeChanged**

Use this to see whether viewport is underestimated vs theme chrome.

## Code anchors

| Symptom | Where to look |
|---------|----------------|
| Wrong width / gutters | `src/Autogrid/GridLayoutService.cs` — `ResolveViewportMetrics`, `GetMaxItemsPresenterWidthUnder`, `TryPickGamesScrollViewer` |
| Spacing / column math | `GetHorizontalMarginPerTile`, `ComputeTargetGridItemWidth` |
| No apply after resize | `src/Autogrid/AutogridPlugin.cs` — `ApplyAutogrid` — epsilon bypass when window size changes |
| Settings not applied | `src/Autogrid/AutogridSettings.cs` / `EndEdit` save; `ViewportAdjustPx` clamp -200..200 |

## Manual verification

1. Release build, deploy DLL (+ yaml).  
2. Grid view, resize window; toggle **Viewport adjust** if a theme still shows side gutters.  
3. With debug logging on, confirm log fields move sensibly with resize.
