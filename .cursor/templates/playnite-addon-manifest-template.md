# Playnite Generic Add-on Manifest Template

## File naming (this repo)

Save the **add-on manifest** (the YAML you copy into [PlayniteAddonDatabase](https://github.com/JosefNemec/PlayniteAddonDatabase)) under the extension’s `info/` folder as:

**`danitesler_<extension-key>.yaml`**

- **`<extension-key>`** is the lowercase **`key`** from **`src/extensions.json`** (e.g. `autogrid` → `danitesler_autogrid.yaml`).
- **Do not** embed the Playnite **`AddonId`** or its hex/characters suffix in the filename—the **`AddonId`** field inside the YAML is the stable ID; the filename is only for humans and PRs.

Example paths:

- `src/Autogrid/info/danitesler_autogrid.yaml`
- `src/GameHoverDetails/info/danitesler_gamehoverdetails.yaml`

---

```yaml
AddonId: YourAddonId_here
Type: (GenericPlugin or MetadataPlugin or LibraryPlugin)
Name: Your Add-on Name
Author: Your Github name
ShortDescription: "One-sentence description shown in Playnite add-on list."
InstallerManifestUrl: https://raw.githubusercontent.com/your-user/your-repo/main/src/YourExtension/info/InstallerManifest.yaml
SourceUrl: https://github.com/your-user/your-repo
Description: |-
Longer multi-line description.
Tags: ["Tag1", "Tag2"]
IconUrl: https://raw.githubusercontent.com/your-user/your-repo/main/src/YourExtension/info/icon.png
# Optional
# Links:
# Website: https://example.com
# Screenshots:
#   - Thumbnail: https://raw.githubusercontent.com/your-user/your-repo/main/screenshots/thumb1.jpg
#     Image: https://raw.githubusercontent.com/your-user/your-repo/main/screenshots/full1.jpg
```

Checklist before submitting:

1. `AddonId` exactly matches your extension `Id` in `src/<PluginName>/info/extension.yaml`.
2. `Type` is `Generic` for GenericPlugin entries.
3. `InstallerManifestUrl` points to the raw per-extension `InstallerManifest.yaml` on your default branch.
4. `SourceUrl` is reachable and public.
5. Required fields are present: `AddonId`, `Type`, `Name`, `Author`, `ShortDescription`, `InstallerManifestUrl`, `SourceUrl`.
6. `scripts/validate-extension.ps1 -Extension <key>` passes.
