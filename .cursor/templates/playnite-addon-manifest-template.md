# Playnite Generic Add-on Manifest Template


```yaml
AddonId: YourAddonId_here
Type: (GenericPlugin or MetadataPlugin or LibraryPlugin)
Name: Your Add-on Name
Author: Your Github name
ShortDescription: "One-sentence description shown in Playnite add-on list."
InstallerManifestUrl: https://raw.githubusercontent.com/your-user/your-repo/main/src/YourExtension/info/InstallerManifest.yaml
SourceUrl: https://github.com/your-user/your-repo
# Optional fields:
# Description: |-
#   Longer multi-line description.
# Tags: ["Tag1", "Tag2"]
# Links:
#   Website: https://example.com
# IconUrl: https://raw.githubusercontent.com/your-user/your-repo/main/src/YourExtension/info/icon.png
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