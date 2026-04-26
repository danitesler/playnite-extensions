---
name: playnite-extension-debug
description: Debugs Playnite plugins (logs, UI thread, view gates, reflection failures, settings). Use when an extension does nothing, throws at startup, or behaves wrong in Desktop vs Fullscreen.
---

# Playnite extension — debug

## Quick checks

1. **Plugin disabled** — Add-on settings in Playnite may have the extension turned off.
2. **Wrong surface** — Many features only apply in **Desktop** or **Fullscreen**; gate with **`PlayniteApi.MainView.ActiveDesktopView`** (and related APIs) where appropriate.
3. **DLL not updated** — Plugins are **not** hot-reloaded. User must copy **`*.dll`** (and manifest if changed) and **restart Playnite**.
4. **Reflection / internal APIs** — If reflection fails after a Playnite upgrade, log clearly and **stop retrying** every tick (use a latch / `reflectionBroken` pattern).

## Logs

- Use **`LogManager.GetLogger()`**; inspect Playnite’s log file for your **Info/Warn/Error** lines.
- Optional **rate-limited** **`Logger.Info`** behind a setting helps confirm the plugin runs without flooding.

## UI and threading

- Dispatch UI work to **`PlayniteApi.MainView.UIDispatcher`** when touching WPF trees, **`MainWindow`**, or controls created by Playnite.

## Settings

- Confirm **`GetSettings`**, **`BeginEdit`/`EndEdit`**, and **`SavePluginSettings`** wiring if persistence looks wrong.

## See also

- Rule: **`.cursor/rules/playnite-extensions.mdc`**
