# RandomTheme — extension notes

## What this extension does

**RandomTheme** is a Playnite **GenericPlugin** (`net462`, WPF). On every Playnite startup it picks a random installed theme and saves it as the theme for the **next** start. **Desktop** and **Fullscreen** are two independent categories: each has its own on/off switch, its own "don't repeat" rule and its own list of themes to choose from, because the two modes never share themes. There is no mode selector or "Both" option; both categories are handled on every startup.

## Architecture

| Layer | File | Responsibility |
|-------|------|---------------|
| Plugin | `src/RandomThemePlugin.cs` | `OnApplicationStarted` picks for each enabled category; `RandomizeNow` (manual, per category) + restart offer; main-menu items; `GetSettings`/`GetSettingsView` |
| Playnite access | `src/PlayniteHost.cs` | Reflection into Playnite internals: `PlayniteApplication.Current.AppSettings` theme get/set, `SaveSettings()`, `Restart(bool)` |
| Discovery | `src/ThemeCatalog.cs` | Installed themes per mode via `ThemeManager.GetAvailableThemes(mode)` (skips incompatible), disk-scan fallback |
| Selection rules | `src/ThemePicker.cs` | Pure function: exclusions, avoid-repeat, uniform random. No Playnite dependencies, unit-testable |
| Settings model | `src/RandomThemeSettings.cs`, `src/ThemeCategorySettings.cs` | Root settings = `Desktop` + `Fullscreen` `ThemeCategorySettings` (`Enabled`, `AvoidRepeat`, `ExcludedThemeIds`) plus the runtime view-model bits (theme checklist, commands, texts) |
| Settings view | `src/RandomThemeSettingsView.xaml` | One `DataTemplate` rendered twice (Desktop, Fullscreen). Stock Playnite controls only |
| Loc helper | `src/RandomThemeLoc.cs` | `LOCRandomTheme_*` strings with English fallbacks |
| Strings | `Localization/*.xaml` | All 45 Playnite locales, same 21 keys each |

## Rules that are easy to get wrong (each was a real bug)

### The theme change only sticks if it goes through Playnite's in-memory settings

Playnite rewrites `config.json` / `fullscreenConfig.json` from its in-memory `PlayniteSettings` on every exit (`Quit` → `AppSettings.SaveSettings()`). Editing the files on disk is reverted at the next shutdown. So `PlayniteHost.SetTheme` sets `AppSettings.Theme` (Desktop) / `AppSettings.Fullscreen.Theme` (Fullscreen) and then `SaveSettings()` is called. There is deliberately **no** disk-write fallback: it silently "succeeds" and is then undone. If the reflection fails, log it and show a notification instead.

### `AppSettings` is on `PlayniteApplication.Current`, not `Application.Current`

`System.Windows.Application.Current` (the WPF app) has no `AppSettings` and no `Restart`. The old code reflected on it, so the in-memory write and the restart button both silently did nothing. Use the static `Playnite.PlayniteApplication.Current` (found by scanning loaded assemblies named `Playnite`). `Restart(bool saveSettings)` lives there too (`DesktopApplication` / `FullscreenApplication` override it).

### Playnite overwrites the settings view's `DataContext`

`PluginSettingsViewModel` does `view.DataContext = plugin.GetSettings(false)` **after** `GetSettingsView` returns. A view that sets its own `DataContext` (a view-model) is silently replaced, so every binding goes to nothing: empty theme list, dead checkboxes and radio buttons. Everything the view binds to must hang off the settings object (`RandomThemeSettings`), and the view has no `DataContext` code. The theme list is refreshed in `BeginEdit()`, which Playnite calls right after wiring the view.

### The new theme takes effect on the next start (by design)

Playnite loads its theme before any extension runs, so a theme picked in session N is used by session N+1. `Randomize now` therefore offers a restart (only when the affected mode is the one running); the other mode's pick applies the next time Playnite starts in that mode. Switching Desktop ⇄ Fullscreen restarts Playnite, so every switch also re-rolls.

### Themes are Desktop-only or Fullscreen-only

`ThemeManager.GetAvailableThemes(mode)` returns each mode's set; the two never overlap. Built-in "Default" has different ids per mode (`Playnite_builtin_DefaultDesktop` / `Playnite_builtin_DefaultFullscreen`). Themes flagged `IsCompatible == false` (unsupported theme API version) are never offered, because Playnite refuses to apply them.

### Localized text is resolved lazily

`ThemeCategorySettings` exposes its labels as getters, not fields filled in a constructor: the extension's `Localization` dictionary may not be loaded yet when the plugin/settings are constructed.

## Behaviour summary

- **Startup:** for each category with **Enabled** on, pick from (installed, compatible, not unchecked). With **AvoidRepeat** (always on by default in the background) and ≥ 2 candidates, skip the theme already set and (for the running mode) the theme running now, unless that leaves nothing. Set it, then `SaveSettings()` once.
- **Nothing eligible** (nothing installed or everything unchecked): the theme is left alone. `VerifySettings` blocks saving an enabled category with everything unchecked.
- **Randomize now** (settings button on right of Select all / none, or main menu per category) ignores the Enabled switch, applies the same pool rules, saves, and offers a restart.
- New themes are eligible until the user unchecks them (the setting stores *exclusions*).

## Key identifiers (keep stable)

| Identifier | Value |
|------------|-------|
| AddonId | `RandomTheme_C3F8A2D1` |
| DLL | `RandomTheme.dll` |
| Plugin GUID | `A4A17932-197C-4EFC-AB31-0F8D35732583` |

## Testing notes

- Playnite is a **32-bit (x86)** process. A harness that loads `Playnite.dll` must be built for x86.
- Playnite allows only **one instance per machine** (global mutex), so you can't run an isolated `--userdatadir` copy next to the user's running Playnite. Close it first, or test the pieces with a harness: real `ThemeManager` against copied `theme.yaml` files, `PlayniteHost` against a real `PlayniteSettings` behind `PlayniteApplication.Current`, `ThemePicker` on its own, the settings view hosted with `DataContext = settings`.
- Do not call `SaveSettings()` / `Restart()` from a harness pointed at the real Playnite folder; they write the user's real config.
- Log prefix is `RandomTheme` (`%AppData%\Playnite\extensions.log`).

## Build & deployment commands

```powershell
# Build and deploy directly to Playnite (close Playnite first: the DLL is locked while it runs)
.\scripts\build-plugin.ps1 -Extension randomtheme -Deploy

# Validate extension metadata
.\scripts\validate-extension.ps1 -Extension randomtheme

# Package release artifacts
.\scripts\build-artifacts.ps1 -Extension randomtheme -VerifyInstaller
```
