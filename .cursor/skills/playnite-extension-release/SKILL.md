---
name: playnite-extension-release
description: Packages and publishes Playnite add-ons (.pext, InstallerManifest.yaml, Toolbox verify, GitHub Releases, PlayniteAddonDatabase). Use when publishing, versioning, add-on browser submission, PackageUrl/AddonId questions, or creating artifacts/releases. Requires Release build output (or run playnite-extension-build first).
---

# Playnite extension — release

## Preconditions

- The extension is registered in **`src/extensions.json`**.
- **Release** (or chosen configuration) output exists under the profile's **`outputPath`** (primary **`.dll`**, **`extension.yaml`** in that folder).
- **This repo:** run **`.\scripts\build-plugin.ps1 -Extension <key>`** first, or use **`.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller`** for a one-shot validate + build + package.

## Release artifact layout

- Per run, write user-facing artifacts under:
  - **`artifacts/releases/<key>/`**
- That folder should contain at least:
  - A **zip** of **`extension.yaml`** + the primary **`.dll`** (convenience download).
  - A **`.pext`** produced by **Playnite Toolbox** **`pack`** (see below).

## Script (this repo)

- **`.\scripts\validate-extension.ps1 -Extension <key> -Mode Package`** — checks AddonId, versions, URLs, expected **`PackageUrl`**, and metadata consistency.
- **`.\scripts\package-release.ps1 -Extension <key>`** — optional **`-VerifyInstaller`** (Toolbox **`verify installer`**), then zip + **`.pext`** into **`artifacts/releases/<key>/...`**. Does not compile; use **`build-plugin.ps1`** first.
- **`.\scripts\package-release.ps1 -Extension <key> -VerifyInstaller -VerifyOnly`** — verify the extension's installer manifest only (no packaging).
- **`.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller`** — orchestrates validation, optional verify, build, then package. Package-only runs allow an expected-but-unpublished `PackageUrl`; use **`-StrictInstallerVerification`** after the GitHub Release asset is uploaded.

## Pack for users

1. Ensure **Release** output: **`extension.yaml`** + **`YourPlugin.dll`** (and any other packaged files) in the build output directory.
2. Use **Playnite Toolbox** to create a **`.pext`**: [Toolbox — packing extensions](https://playnite.link/docs/tutorials/toolbox.html#packing-extensions).
3. Attach **`.pext`** to a **GitHub Release** (or other HTTPS host). The download URL must be stable for updates.

## Installer manifest

**`InstallerManifest.yaml`** lives under **`src/<PluginName>/info/`**:

- **`AddonId`**: must match **`extension.yaml`** **`Id`** exactly (stable forever).
- **`Packages`**: each entry needs **`Version`**, **`RequiredApiVersion`** (Playnite / SDK level), **`ReleaseDate`**, **`PackageUrl`** (HTTPS to **`.pext`**), **`Changelog`**.

Keep **`extension.yaml` `Version`** and assembly / **`Directory.Build.props`** aligned with **`Packages[].Version`** when you cut a release.

## In-app add-on browser

- Submit a YAML file to **[PlayniteAddonDatabase](https://github.com/JosefNemec/PlayniteAddonDatabase)** under the correct **`addons/`** subtree (e.g. **`addons/generic/`** for generic plugins).
- **`InstallerManifestUrl`** should point at the **raw** per-extension installer manifest, e.g. `https://raw.githubusercontent.com/<owner>/<repo>/main/src/<PluginName>/info/InstallerManifest.yaml`.

## Direct install link (optional)

- `playnite://playnite/installaddon/<AddonId>` (see database README for details).

## See also

- Skill: **`playnite-extension-build`**
- Rule: **`.cursor/rules/playnite-ci-packaging.mdc`**
