---
name: playnite-release
description: Release or publish a Playnite add-on from this monorepo - version bump, .pext/.pthm packaging, InstallerManifest, GitHub Release, and adding or updating the add-on in the PlayniteAddonDatabase. Use for "cut a release", "package", "publish", "add to the Playnite add-on browser", "update the database listing".
---

# Playnite add-on - release and publish

Two separate channels; know which one a change needs:

| Change | What ships | Database PR? |
|--------|-----------|--------------|
| New version of a listed add-on | GitHub Release + new top entry in `InstallerManifest.yaml` on `main` | **No**: Playnite reads the installer manifest straight from this repo |
| New add-on (first listing) | Release **and** `danitesler_<key>.yaml` added to PlayniteAddonDatabase | **Yes** |
| Name / description / tags / icon / screenshots / URLs changed | Push to `main` (icon, screenshots) **and** updated `danitesler_<key>.yaml` | **Yes** |

Full database procedure: [addon-database.md](addon-database.md).

## Hard rules

- **Never push, tag, create a release, or open a PR unless the user asks.** Preparing files locally is fine.
- **Several add-ons, several releases.** Never combine add-ons into one release, one tag or one database PR, even when they are ready together. Do them one after another, each with its own tag `{key}-v{version}`, package, notes and PR. Database PRs go to Josef Nemec's upstream repo: one PR per add-on even when several are requested in one prompt, and **before pushing, show the user the copy (PR title, description, manifest text) and wait for their review**.
- **Version bumps only when cutting a release.** Not during features, fixes, refactors, builds or validation. Before editing any version: state the current version (manifest + `Directory.Build.props`), suggest the next semver with a one-line reason, and ask for the exact string unless the user gave it.
- **Tag is `{key}-v{version}`** (`autogrid-v1.1.1`). Bare `v1.0.0` would collide across add-ons. Scripts derive it (`Get-ExtensionReleaseTag`).
- **One GitHub Release per add-on**: its tag, title, notes, only its own `.pext`/`.pthm`. Never an umbrella release; one add-on per `gh release create`.
- Wrong tag already published: `gh release edit <old-tag> --tag <new-tag>`, then delete the stale remote tag.

## Cut a release

1. Confirm the version with the user (rule above).
2. Align every location: `info/extension.yaml` / `info/theme.yaml` `Version`; `Directory.Build.props` `Version`/`AssemblyVersion`/`FileVersion` (plugins); **prepend** a block to `info/InstallerManifest.yaml` `Packages` (newest first, keep older entries): `Version`, `RequiredApiVersion`, `ReleaseDate` (YYYY-MM-DD), `PackageUrl`, `Changelog` bullets.
3. `PackageUrl` = `<repository>/releases/download/<tag>/<AddonId>_<version with underscores>.pext|.pthm`.
4. Package (from repo root, PowerShell):

```powershell
.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller   # validate -> verify -> build -> package
.\scripts\package-release.ps1 -Extension <key> [-VerifyOnly]      # package only / Toolbox verify only
.\scripts\validate-extension.ps1 -Extension <key> -Mode Package   # metadata + expected PackageUrl
```

   Output: `artifacts/releases/<key>/` (themes: `artifacts/releases/themes/<key>/`) with a zip and the Toolbox package. Packaging does not compile: it expects the build output (`bin/Release/net462/` for plugins, `artifacts/builds/themes/<key>/` for themes). `-VerifyInstaller` tolerates a `PackageUrl` that is not live yet; add `-StrictInstallerVerification` after the release exists. Theme `-Mode Package` fails until the `Screenshots` listed in the database manifest exist under `art/`.
5. **Screenshots (themes always, other add-ons with UI on first listing or a visual change):** run `.\scripts\take-screenshots.ps1 -Extension <key>`. It renders the theme's HTML preview templates (`art/preview-details.html` and `art/preview-settings.html`) using Chromium, saving `art/screenshot-details.png` and `screenshot-settings.png` (and automatically cleaning up any legacy `grid.png`). Check the images, commit them to `main` with the version commit, list them in the `Screenshots:` block of `danitesler_<key>.yaml`, and add them to the release notes. Playnite itself is never launched or captured directly.
6. When the user says to publish, in this order (the raw manifest URL points at `main` and the package URL at the release, so both must exist or auto-update breaks):
   1. `gh release create <tag> <package> [zip] --title "<Name> <version>" --notes "<changelog>"` (this add-on only).
   2. Refresh the README links: run `node scripts/generate-readmes.mjs` now that the `<tag>` exists (it rewrites the add-on's `Download` link in the root `README.md` and its own `README.md`), and commit the result with the version commit. `npm run check:readmes` must pass.
   3. Merge/push the version commit to `main`.
   4. Only for a new add-on or changed listing metadata: database PR ([addon-database.md](addon-database.md)).
7. Verify: `curl -sI <PackageUrl>` returns 200 (after redirects); `curl -s <InstallerManifestUrl>` shows the new top entry.

`Toolbox.exe` is found automatically (`%LOCALAPPDATA%\Playnite`, Program Files, PATH, `%TEMP%`; override `-ToolboxExe` or `$env:TOOLBOX_EXE`). Manual: `Toolbox.exe verify Installer <InstallerManifest.yaml>`, `Toolbox.exe pack <build dir> <out dir>`.

## Installer manifest shape

`src/<AddOn>/info/InstallerManifest.yaml` is minimal: `AddonId` + `Packages`. Name, description, URLs and icon live in `extension.yaml`/`theme.yaml` and `danitesler_<key>.yaml`. Validation reads the **first** package: its version must equal the manifest's and its `PackageUrl` must match the tag and package name. `AddonId` never changes (a new id is a new add-on and breaks auto-update).