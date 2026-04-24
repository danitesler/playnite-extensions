# Autogrid

Playnite **GenericPlugin** that adjusts **grid cover width** in **Desktop grid** view so roughly your chosen **number of columns** fits the library area when you resize the window.

**Repository:** [github.com/danitesler/playnite-autogrid](https://github.com/danitesler/playnite-autogrid)

## Requirements

- [.NET SDK](https://dotnet.microsoft.com/download) (8.x or newer is fine for building `net462` + WPF on Windows)
- Windows (Playnite + WPF)

## Repository layout

| Path | Purpose |
|------|---------|
| `src/Autogrid/` | Extension project (`Autogrid.csproj`, `extension.yaml`, source) |
| `scripts/build-release.ps1` | Release build to `artifacts/Release` (avoids locked `bin` when Playnite is running) |
| `scripts/github-first-publish.ps1` | After `gh auth login`, creates private `origin`, pushes `main`, opens PR for EditorConfig, merges (optional helper) |
| `docs/AGENTS.md` | Notes for contributors / AI agents |
| `InstallerManifest.yaml` | Playnite add-on installer manifest (root URL for `PlayniteAddonDatabase`) |
| `.github/workflows/` | CI build; release workflow on version tags |

## Build

**Solution:**

```bash
dotnet build Autogrid.sln -c Release
```

Output (default): `src/Autogrid/bin/Release/net462/` (`Autogrid.dll`, `extension.yaml`).

**When Playnite locks the output folder**, from repo root:

```powershell
./build.ps1
```

Output: `artifacts/Release/`.

Assembly version is set in [`src/Directory.Build.props`](src/Directory.Build.props). When you ship a new version, update that file and **`src/Autogrid/extension.yaml`** `Version` together.

## Install locally (manual)

1. Build (see above).
2. Copy **`Autogrid.dll`** and **`extension.yaml`** into a subfolder under Playnite **Extensions**:
   - Installed Playnite: `%AppData%\Playnite\Extensions\Autogrid\`
   - Portable: `<Playnite>\Extensions\Autogrid\`
3. Restart Playnite (plugins are not hot-reloaded).

## Publish to GitHub

**First time (private repo + first PR):** install [GitHub CLI](https://cli.github.com/), then:

```powershell
gh auth login
./scripts/github-first-publish.ps1
```

Optional: `-RepoName YourRepoName` (default `playnite-autogrid`). If `origin` already exists, the script only pushes branches and opens the PR.

**Manual steps** (if you prefer not to use the script):

1. Create a GitHub repository and push this tree (`git init` if you have not yet).
2. **CI** runs on push and pull requests (Windows build).
3. **Release:** create a git tag `v1.0.0` (match your version). The **Release** workflow builds and uploads a **zip** artifact containing `extension.yaml` and `Autogrid.dll`. Use [Playnite Toolbox](https://playnite.link/docs/tutorials/toolbox.html#packing-extensions) to produce a **`.pext`**, create a **GitHub Release** on that tag, and attach the `.pext`.
4. Edit root **`InstallerManifest.yaml`**: set **`PackageUrl`** to the release asset URL, adjust **`Packages`** version / changelog / **`ReleaseDate`**, commit to `main`.
5. To list in Playnite’s add-on browser, open a PR on **[PlayniteAddonDatabase](https://github.com/JosefNemec/PlayniteAddonDatabase)** with a new YAML under `addons/generic/`, with **`InstallerManifestUrl`** pointing at the raw URL of **`InstallerManifest.yaml`** on `main`, e.g. `https://raw.githubusercontent.com/danitesler/playnite-autogrid/main/InstallerManifest.yaml`.

## Extension id

**AddonId** / manifest id: **`Autogrid_7F3E9B82`** (must stay stable across updates).

## More detail

See [`docs/AGENTS.md`](docs/AGENTS.md).
