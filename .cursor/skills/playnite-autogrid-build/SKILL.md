---
name: playnite-autogrid-build
description: Builds and packages the Autogrid Playnite extension (net462, WPF). Use when the user asks to build, compile, release, package, or deploy Autogrid, or when bin/Release is locked by Playnite.
---

# Playnite Autogrid — build

## Default build (Playnite closed or not locking the DLL)

From repo root:

```bash
dotnet build src/Autogrid/Autogrid.csproj -c Release
```

**Output:** `src/Autogrid/bin/Release/net462/` — **`Autogrid.dll`** and **`extension.yaml`** (copied via csproj).

## Build when Playnite locks `bin/Release`

From repo root (PowerShell):

```powershell
./build.ps1
```

Or:

```powershell
./scripts/build-release.ps1
```

**Output:** `artifacts/Release/` — same artifacts, separate folder so the build succeeds while Playnite runs.

## Project facts

- **SDK-style** csproj under `src/Autogrid/`, **`TargetFramework`**: `net462`, **`UseWPF`**: true.
- **PlayniteSDK** NuGet **6.6.0** with **`PrivateAssets=all`**; **`CopyLocalLockFileAssemblies`**: false.
- **`NuGet.config`** at repo root may point to custom feeds; restore uses normal `dotnet restore`.
- **`src/Directory.Build.props`** carries assembly/file **version**; keep aligned with **`src/Autogrid/extension.yaml`** `Version` when releasing.

## Deploy to Playnite

Copy **`Autogrid.dll`** + **`extension.yaml`** into the extension folder Playnite uses for this add-on (same pair the build emits). Restart Playnite or reload extensions if the host does not pick up DLL changes.

## After code changes

Always run **`dotnet build -c Release`** (or **`./build.ps1`**) and confirm **0 errors** before telling the user to test in Playnite.
