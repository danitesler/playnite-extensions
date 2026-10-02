# PlayniteAddonDatabase - add and update add-ons

Upstream: <https://github.com/JosefNemec/PlayniteAddonDatabase> (branch `master`). Our fork: `danitesler/PlayniteAddonDatabase`. Playnite's add-on browser reads this repo; only listed add-ons appear and auto-update.

## How the pieces connect

```
PlayniteAddonDatabase/addons/<folder>/danitesler_<key>.yaml     (listing: name, description, icon, screenshots)
   └─ InstallerManifestUrl -> raw.githubusercontent.com/danitesler/playnite-extensions/main/<dir>/info/InstallerManifest.yaml
        └─ Packages[0].PackageUrl -> github.com/danitesler/playnite-extensions/releases/download/<tag>/<AddonId>_<x_y_z>.pext|.pthm
```

The database holds only the listing. Versions come from the installer manifest in **this** repo's `main`, so a routine update needs no database PR.

## Folder by `Type`

| `Type` (database) | Folder in `addons/` | Repo add-on |
|---|---|---|
| `Generic` | `generic` | `GenericPlugin` |
| `MetadataProvider` | `metadata` | `MetadataPlugin` |
| `GameLibrary` | `library` | `LibraryPlugin` |
| `ThemeDesktop` | `themes_desktop` | Desktop theme |
| `ThemeFullscreen` | `themes_fullscreen` | Fullscreen theme |

The `Type` values differ from `extension.yaml`'s; `validate-extension.ps1` checks them.

## Our listing file

- Source of truth: `<dir>/info/danitesler_<key>.yaml` in this repo (`databasePrefix` in `src/extensions.json`). Copy it **byte for byte** to `addons/<folder>/danitesler_<key>.yaml` in the database repo. The filename is only for humans/PRs; the `AddonId` inside is the identity.
- Required: `AddonId`, `Type`, `Name`, `Author` (`danitesler`), `ShortDescription`, `InstallerManifestUrl`. We also always set `SourceUrl`, `IconUrl`, `Description`, `Tags`, `Links`. Optional upstream: `Screenshots`, `UserAgreement`, `FaqTopics`. Themes list `Screenshots` (Thumbnail + Image URLs under `art/`).
- All URLs are `raw.githubusercontent.com/danitesler/playnite-extensions/main/...` and must resolve **before** the PR (the files have to be on `main`).
- `AddonId` equals `Id` in `extension.yaml` / `theme.yaml` and in `InstallerManifest.yaml`.
- Template: copy an existing `danitesler_*.yaml` (`src/Autogrid/info/danitesler_autogrid.yaml` for plugins, `src/themes/ShadcnUi/info/danitesler_shadcnui.yaml` for themes). `new-extension.ps1` / `new-theme.ps1` scaffold one.

## Status check (do this first; it changes over time)

```bash
gh api repos/JosefNemec/PlayniteAddonDatabase/git/trees/master?recursive=1 --jq '.tree[].path' | grep danitesler_
```

As of 2026-09-29 only `autogrid` and `gamehoverdetails` are listed (merged in upstream PR 561, `addons/generic/`). Everything else in `src/extensions.json` is unlisted.

## Add a new add-on (first listing)

Preconditions (verify, do not assume):

1. Release exists for the version in `InstallerManifest.yaml` and `curl -sI <PackageUrl>` succeeds (see `playnite-release`).
2. Manifests, `icon.png` and `art/*` (`details.png` and `settings.png` rendered from `art/preview-*.html` via `scripts/take-screenshots.ps1`) are on `main` (raw URLs return 200). Check every URL in the listing: `grep -oE 'https://[^ ]+' <file> | xargs -n1 curl -sI -o /dev/null -w '%{http_code} %{url_effective}\n'`.
3. `.\scripts\validate-extension.ps1 -Extension <key> -Mode Package` passes; also `Toolbox.exe verify Addon <danitesler_key.yaml>` and `verify Installer <InstallerManifest.yaml>`.

Then (only when the user asks to push/open the PR):

```bash
gh repo sync danitesler/PlayniteAddonDatabase --source JosefNemec/PlayniteAddonDatabase --branch master
git clone https://github.com/danitesler/PlayniteAddonDatabase.git   # or reuse a clone kept outside this repo
cd PlayniteAddonDatabase && git switch -c add-danitesler-<key>
cp <repo>/<dir>/info/danitesler_<key>.yaml addons/<folder>/
git add addons && git commit -m "Add <Name>" && git push -u origin HEAD
gh pr create -R JosefNemec/PlayniteAddonDatabase --base master --title "Add <Name>" --body "<what it is, type, link to repo>"
```

- **One PR per add-on, always.** Several new add-ons or themes: repeat the whole sequence for each, on its own branch (`add-danitesler-<key>`), with its own PR titled `Add <Name>`, and never put two listing files in one PR. (Upstream PR 561 bundled two; do not repeat that.) Start each branch from a fresh `master` so the PRs stay independent.
- Do not clone the database inside this repo. Use a sibling directory or the scratchpad.
- After merge the add-on shows in the browser within about a minute: `https://playnite.link/addons.html#<AddonId>`, install link `playnite://playnite/installaddon/<AddonId>`.

## Update an existing add-on

- **New version**: no database PR. Release, prepend the `Packages` entry, get it on `main`. Playnite picks it up from the installer manifest.
- **Listing change** (description, tags, icon, screenshots, name, links): edit `<dir>/info/danitesler_<key>.yaml` here, get any new icon/screenshot files onto `main`, then repeat the PR steps above with the updated file (branch `update-danitesler-<key>`, title `Update <Name> listing`). Diff before copying:

```bash
gh api repos/JosefNemec/PlayniteAddonDatabase/contents/addons/<folder>/danitesler_<key>.yaml --jq .content | base64 -d | diff - <dir>/info/danitesler_<key>.yaml
```

- Never change `AddonId` or `Type` on a listed add-on.
- Renaming the repo, branch or `dir` changes every raw URL: update the listing and open a database PR at the same time, or existing installs stop updating.

## Failure modes

| Symptom | Cause |
|---|---|
| Listed but no update offered | `Packages[0].Version` not higher, `PackageUrl` 404 (release/asset missing or tag mismatch), or manifest not on `main` |
| PR rejected / not shown | Missing required field, wrong `Type` folder, invalid YAML, `AddonId` not matching the package's `Id` |
| Icon or screenshot blank | Raw URL 404 (file not on `main`, wrong path case) |
