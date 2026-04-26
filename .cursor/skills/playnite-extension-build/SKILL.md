---
name: playnite-extension-build
description: Builds Playnite .NET WPF extensions (net462, SDK-style csproj). Use when the user asks to build, compile, fix MSBuild/WPF errors, or produce a build drop under artifacts/builds. While Playnite (or a host that loaded the extension) is running, it may lock plugin DLLs or other outputs under bin/.../net462/ or artifacts/builds/<key>/, causing access denied, copy failures, or “cannot access the file” from MSBuild. On those errors, ask in the agent chat for the user to fully close Playnite (and the host if needed), then retry the same build; repeat until the build succeeds or a clean run rules out locks. Do not use for .pext, installer verification, or publishing — use playnite-extension-release.
---

# Playnite extension — build

## Defaults

- **Extension profiles:** `src/extensions.json`.
- **Project path:** `src/<PluginName>/<PluginName>.csproj`.
- **Build command (this repo):** `.\scripts\build-plugin.ps1 -Extension <key>` from repo root.
- **One-shot package build:** `.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller`.
- **Build drop:** a stable folder per extension: **`artifacts/builds/<key>/`**. Each scripted run **clears** that folder, then copies **`bin/<Configuration>/net462/`** output into it.

Typical output: **`src/<PluginName>/bin/Release/net462/<PluginName>.dll`** plus files marked **`CopyToOutputDirectory`** (often **`extension.yaml`**).

## Artifact layout (build only)

- After **`dotnet build`**, copy output into:
  - **`artifacts/builds/<key>/...`**

## csproj reminders

- **`Microsoft.NET.Sdk.WindowsDesktop`**, **`UseWPF`**: true when using WPF / XAML.
- **`TargetFramework`**: match Playnite (often **`net462`**).
- **`PlayniteSDK`** package: **`PrivateAssets=all`** unless you need otherwise.

## After code changes

Run **`.\scripts\validate-extension.ps1 -Extension <key>`** and **`.\scripts\build-plugin.ps1 -Extension <key>`**, then fix errors before suggesting the user test inside Playnite.

## File locks (Playnite running)

- **Symptoms:** Failed copy to output, `Access denied`, `The process cannot access the file because it is being used by another process`, MSBuild **`Copy`/`AL` errors**, or a locked **`<PluginName>.dll`** (or `pdb` / other outputs) under **`src/<PluginName>/bin/.../net462/`** or **`artifacts/builds/<key>/`**. The extension may also be loaded from Playnite’s install `Extensions` folder; that path can be locked the same way.
- **Do not** assume a code bug first; treat these as **possible file locks** from **Playnite** or any process that has loaded the assembly (including the IDE in edge cases).
- **Agent behavior:** In the agent window, **ask the user to fully exit Playnite** (and close any other host that loaded the plugin if they use one). **Retry** the same build step after they confirm. **Repeat** the prompt and retry **until the build completes successfully** or a run with Playnite and hosts closed still fails—in which case treat the remainder as a normal compile or script error.

## See also

- Skill: **`playnite-extension-release`** — zip, **`.pext`**, **`InstallerManifest.yaml`**, GitHub Releases, PlayniteAddonDatabase.
- Rule: **`.cursor/rules/playnite-extensions.mdc`**
- Rule: **`.cursor/rules/playnite-ci-packaging.mdc`**
