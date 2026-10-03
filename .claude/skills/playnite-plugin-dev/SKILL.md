---
name: playnite-plugin-dev
description: Work on .NET Playnite plugins in this monorepo (Generic, Metadata, Library) - conventions, settings UI with stock controls, localization of every locale, building with build-plugin.ps1, debugging "does nothing" or startup failures. Themes use playnite-theme-dev; packaging and releases use playnite-release.
---

# Playnite plugin - develop, build, debug

Docs: [Extensions intro](https://playnite.link/docs/tutorials/extensions/intro.html), [Plugins](https://playnite.link/docs/tutorials/extensions/plugins.html). Scaffold: `.\scripts\new-extension.ps1 -Name MyPlugin -Key myplugin -Type GenericPlugin|MetadataPlugin|LibraryPlugin -Author <name>`.

## Shape

- Each plugin lives in `src/<PluginName>/` and is a row in `src/extensions.json`. Keep together: `.csproj`, `Directory.Build.props`, `src/`, `info/` (`extension.yaml`, `InstallerManifest.yaml`, `danitesler_<key>.yaml`, `icon.png`), and `Localization/`.
- `net462`, `UseWPF` for UI plugins, `Microsoft.NET.Sdk.WindowsDesktop`. PlayniteSDK NuGet with `PrivateAssets=all`, `CopyLocalLockFileAssemblies` false.
- `extension.yaml`: `Id` = the AddonId for life (matches `InstallerManifest.yaml` and the database listing); `Module` = main DLL; `Type` = `GenericPlugin`/`MetadataPlugin`/`LibraryPlugin` matching the base class; `Version` in sync with `Directory.Build.props` (bumped only per `playnite-release`).
- Per-add-on notes: `src/<PluginName>/AGENTS.md`. Read it before editing that plugin.

## Playnite SDK conventions

- Log with `LogManager.GetLogger()` (Playnite.SDK). `IPlayniteAPI.CreateLogger` does not exist.
- Touch the visual tree, `MainWindow` or Playnite-created controls only via `PlayniteApi.MainView.UIDispatcher` (`BeginInvoke`). Gate by surface with `PlayniteApi.MainView.ActiveDesktopView` (Desktop vs Fullscreen).
- Settings: implement `ISettings` (`BeginEdit`/`CancelEdit`/`EndEdit`), persist with `SavePluginSettings`, validate in `VerifySettings`. The `UserControl` from `GetSettingsView` binds to the same object the plugin uses.
- Metadata plugins: `SupportedFields` = every field the source can ever provide. One `OnDemandMetadataProvider` is created per game per download, off the UI thread: resolve lazily, cache on the instance, honor `GetMetadataFieldArgs.CancelToken`. `AvailableFields` lists only fields that actually resolved. Files: `new MetadataFile(path)` or `new MetadataFile(fileName, bytes)`.
- Reflection into Playnite/`AppSettings` breaks on upgrades: prefer public APIs; otherwise add a disable latch (`reflectionBroken`) and log once.
- Plugins are **not hot-reloaded**: replace the DLL, restart Playnite. Test Desktop and Fullscreen when both apply.

## Settings UI: stock controls only (always)

Applies to any plugin settings `UserControl`.

- Only Playnite's stock WPF controls: `CheckBox`, `Label`, `Slider`, `RadioButton`, `ComboBox`, `TextBox`, `Button`, `TextBlock`; layout with `StackPanel`/`Grid`.
- Baseline: `src/Autogrid/src/AutogridSettingsView.xaml` (`Label` + `CheckBox` + `Slider`/`RadioButton`, `TextBlock` with `{DynamicResource TextBrush}`, label margins `0,0,0,4` / `0,16,0,4`). Copy that pattern.
- No invented chrome (cards, pills, tab strips, toggles, icon buttons, pickers, shadows) and no custom `FontSize`/`FontWeight` on `CheckBox`/`Label`. A new control only when the user explicitly asks.
- A keyed style must be `BasedOn="{StaticResource {x:Type CheckBox}}"` (or `Label`); without `BasedOn` it replaces Playnite's template (12px WPF chrome).
- Dependent options nest under the checkbox that reveals them (a `StackPanel` with `Margin="25,12,0,0"` bound to the checkbox, recursively). Never above it or in a later sibling block.

```xml
<!-- BAD --> <Border CornerRadius="8" Background="#1C1C1E"><TextBlock FontSize="11" FontWeight="SemiBold" Text="Columns" /></Border>
<!-- GOOD --> <Label Margin="0,16,0,4" Content="Target columns" />
              <Slider Minimum="1" Maximum="20" IsSnapToTickEnabled="True" Value="{Binding TargetColumns, Mode=TwoWay}" />
```

## Localization: translate with the feature (always)

User-visible strings live in `src/<Plugin>/Localization/*.xaml`. `en_US.xaml` is the source and runtime fallback, but every locale file gets the same keys, translated. Applies to any new or changed setting, field, sample, button, tab, tooltip or error.

1. Add/edit the key in `en_US.xaml` first (`LOC<Plugin>_...`).
2. Copy the same key into **every** other `Localization/*.xaml` (same order as English).
3. Translate. Keep English only for brand names (Playnite, Steam, Phosphor...), `{0}` placeholders, `&#10;` newlines, and values identical in that language. Escape `&` as `&amp;`; keep `↑↓` and `{0}`. Reuse wording already in that locale file.
4. Keep the in-code English fallbacks identical to `en_US.xaml`. A plugin with no loc files that gains UI strings gets the full locale set.

## Build

**Build after every change** to the plugin (code, XAML, `extension.yaml`) and end the reply with the footer below. There is no deploy script: to test, the user copies the DLL from `artifacts/builds/<key>/` into Playnite's Extensions folder and restarts Playnite; remind them when a change needs testing.

```powershell
.\scripts\build-plugin.ps1 -Extension <key>            # dotnet build + drop in artifacts/builds/<key>/
.\scripts\validate-extension.ps1 -Extension <key>      # manifest / installer / database consistency
```

- Output: `src\<Plugin>\bin\Release\net462\<Plugin>.dll` + `extension.yaml`; the drop is cleared and re-copied each run. Never edit `artifacts/`.
- "File in use / access denied": Playnite has the DLL locked. Ask the user to exit Playnite fully and retry before suspecting code.
- The index `src/extensions.json` holds only what cannot be derived (`key`, `name`, `kind`, `dir`, `addonId`, `pluginType`, `requiredApiVersion`); `scripts/extension-profiles.ps1` (`Get-ExtensionProfile`) derives every path and URL. Scripts and CI read profiles, never hardcoded paths. CI (`ci.yml`, `windows-latest`, .NET 8 SDK) runs validate then build for every row.

## Debug: "does nothing" / throws at startup

1. Plugin disabled in Add-ons settings?
2. Wrong surface (Desktop vs Fullscreen)? Check the `ActiveDesktopView` gate.
3. Old DLL still loaded? Copy DLL (and manifest if changed) and restart Playnite.
4. Reflection failed after a Playnite upgrade? Look for the latch/log line; do not retry every tick.
5. UI touched off the UI thread? Route through `UIDispatcher`.
6. Persistence wrong? Check `GetSettings`, `BeginEdit`/`EndEdit`, `SavePluginSettings`.
7. Read Playnite's log (`%AppData%\Playnite\playnite.log`, portable: next to `Playnite.exe`) for your Info/Warn/Error lines. A rate-limited `Logger.Info` behind a setting confirms the plugin runs without flooding.
