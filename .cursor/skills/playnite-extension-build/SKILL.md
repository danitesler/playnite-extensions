---
name: playnite-extension-build
description: Playnite extension builds — compile, msbuild, dotnet build, or fix WPF/MSBuild errors (net462, build-plugin.ps1, artifacts/builds). For .pext/zip/installer/publishing use playnite-extension-release.
---

# Playnite extension — build

## Scope (details the short `description` points at)

- **Use this skill** for any “build the extension,” compile, or fix-build request here (see **What to run**).
- **Do not** use for `.pext`, `InstallerManifest` verify, or releases — use **`playnite-extension-release`**.
- **File in use / access denied** when building: treat as possible Playnite (or host) lock first — see **File locks**; do not assume a code bug first.

## What to run

From repo root (PowerShell), using the extension **key** from `src\extensions.json`:

```powershell
.\scripts\build-plugin.ps1 -Extension <key>
```

Optionally also: `.\scripts\validate-extension.ps1 -Extension <key>` when validating after edits.

- **Project:** `src\<PluginName>\<PluginName>.csproj`
- **Per-run drop:** `artifacts\builds\<key>\` (script clears and copies from `bin\<Configuration>\net462\`)
- **Typical local output:** `src\<PluginName>\bin\Release\net462\<PluginName>.dll` plus copy-to-output files (e.g. `extension.yaml`).

**csproj:** `Microsoft.NET.Sdk.WindowsDesktop` + `UseWPF` when using XAML; `TargetFramework` usually `net462`; `PlayniteSDK` with `PrivateAssets=all` unless you need otherwise.

## End of every build-related reply (required)

After any build attempt the agent makes (`build-plugin.ps1`, `dotnet build` on the extension, or failure before success), end with this block (same headline lines for searchability):

**Success (exit 0 / build succeeded):**

```text
✅ success - built
Extension: <key>
Output: artifacts/builds/<key>/
```

**Failure:**

```text
❌ error - not build
Reason: <one line: first error, exit code, or lock message>
```

If several keys were built, list them under `Extension:` or repeat the block per key.

## File locks

Playnite (or any host that loaded the extension) can lock `bin\...\net462\` or `artifacts\builds\<key>\` DLLs. Do not assume a code bug first. Ask the user to fully exit Playnite, retry; repeat until a closed-host build still fails, then treat as a normal build error.

## See also

`playnite-extension-release` (`.pext`, installer, publishing). Rules: `playnite-extensions.mdc`, `playnite-ci-packaging.mdc`.
