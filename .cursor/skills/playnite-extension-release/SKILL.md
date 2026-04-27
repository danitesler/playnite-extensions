---
name: playnite-extension-release
description: Playnite extension releases — .pext, zip, Toolbox verify, InstallerManifest, artifacts/releases. Use for packaging, version bumps at ship time, or upload-ready drops. Compiling or fixing builds — use playnite-extension-build.
---

# Playnite extension — release

## Scope (details the short `description` points at)

- **Use this skill** for any “package a release,” “create `.pext` / zip for GitHub,” `InstallerManifest` / `PackageUrl` alignment at **ship time**, or “what to run to produce **`artifacts/releases/`**” (see **What to run**).
- **Do not** use for everyday compile, MSBuild, or WPF build fixes — use **`playnite-extension-build`**. Release packaging **does not compile**; it expects **Release** (or chosen config) output where the profile’s **`outputPath`** points (from **`src\extensions.json`**).
- **Toolbox:** scripts locate **`Toolbox.exe`** or bootstrap Playnite; set **`$env:TOOLBOX_EXE`** if resolution fails. Verify steps need a working Toolbox.

## What to run

From repo root (PowerShell), using the extension **key** from **`src\extensions.json`**:

**Full path (validate → build → package):**

```powershell
.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller
```

- `-VerifyInstaller` runs Toolbox **verify installer** (with **`-AllowUnpublishedPackageUrl`**-style behavior via the script) before the build+pack. After the **`.pext`** is on the release URL, re-verify with **`-StrictInstallerVerification`** if the workflow needs a strict `PackageUrl` check.

**Package only** (already built; no compile):

```powershell
.\scripts\package-release.ps1 -Extension <key>
```

- Optional: **`-VerifyInstaller`** on **`package-release.ps1`** (Toolbox **verify** + zip + **`.pext`**). **`-VerifyOnly`** = verify manifest only, no packaging.
- **Validation** of metadata: **`.\scripts\validate-extension.ps1 -Extension <key> -Mode Package`**

- **Per-run drop:** **`artifacts\releases\<key>\`** — release zip (**`extension.yaml`** + primary **`.dll`**) and Toolbox-generated **`.pext`**
- **Installer manifest:** **`src\<PluginName>\info\InstallerManifest.yaml`** — must stay aligned with **`extension.yaml`** (especially **`AddonId`**, **`Packages[].Version`**, **`PackageUrl`**, **`RequiredApiVersion`**, **`ReleaseDate`**, **`Changelog`**) when you cut a release. **`PackageUrl`** must eventually point at the published **`.pext`**.

**Manual Toolbox** (if not using scripts): [Toolbox — packing extensions](https://playnite.link/docs/tutorials/toolbox.html#packing-extensions)

## Version bumps (only when cutting a release)

- **Do not** bump semver during ordinary development unless the user asked to **ship** (GitHub Release, publish **`.pext`**, or explicit “cut **x.y.z**”).
- **Before changing version fields:** read current **`extension.yaml`** `Version` and **`Directory.Build.props`**; tell the user what is live; suggest next semver; **ask** for the exact string (unless they already gave it verbatim in the same message).
- **After they confirm:** align **`extension.yaml`**, **`Directory.Build.props`**, **`InstallerManifest.yaml`** (including **`PackageUrl`** and tag per **`src\extensions.json`** `tagPattern`), and addon database YAML if you maintain it; then run validation / **`build-artifacts.ps1`** / **`package-release.ps1`** as needed.

Rule: **`.cursor/rules/playnite-extension-versioning.mdc`**

## End of every release-related reply (required)

After any release attempt the agent makes (`package-release.ps1`, `build-artifacts.ps1` for packaging, `validate-extension -Mode Package`, or failure before success), end with this block (same headline lines for searchability):

**Success (exit 0 / package succeeded):**

```text
✅ success - release packaged
Extension: <key>
Output: artifacts/releases/<key>/
```

**Failure:**

```text
❌ error - not release
Reason: <one line: first error, exit code, Toolbox path, or validation message>
```

If several keys were packaged, list them under `Extension:` or repeat the block per key.

## See also

`playnite-extension-build` (compile, **`artifacts/builds/<key>/`**). Rules: **`playnite-extensions.mdc`**, **`playnite-ci-packaging.mdc`**, **`playnite-extension-versioning.mdc`**.
