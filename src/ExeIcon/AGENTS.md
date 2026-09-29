# ExeIcon — extension notes

## What this extension does

Playnite **MetadataPlugin** (`net462`). A metadata source for the **Icon** field only. It finds the game's executable and returns its icon as a `.ico` with every size the exe carries (up to 256px PNG frames). No settings, no UI, no network.

Solves: store-launched games (Epic, Steam, EA, Ubisoft…) import without icons, and Playnite's own "icon from exe" refuses when the play action is a URL ("Cannot get icon if Play action is missing or is set to URL").

## Implementation

- **Provider** — `ExeIconMetadataProvider` resolves once per game and caches. `AvailableFields` returns `[Icon]` only when an icon was actually extracted, so Playnite does not list the source for games it cannot help.
- **Candidates** — `GameExecutableFinder.FindCandidates`: file-type **play actions** first (variables expanded via `ExpandGameVariables`; relative paths resolve against `WorkingDir`, then `InstallDirectory`), then a bounded BFS of `InstallDirectory` (depth ≤ 3, ≤ 300 folders, ≤ 200 exes). Emulated games (ROMs or emulator actions, no file action) are skipped: their install dir is the ROM folder. Drive roots are never scanned.
- **Ranking** — exact normalized name match (100) > initials (`RDR2`, `GTAV`, `ACU`: 70) > substring match (50), plus name-token hits, minus 8 per folder level, minus 15 for launcher/config/settings exes, plus a small size bonus. Excluded exe names (installers, redists, crash handlers, anti-cheat, CEF/Qt helpers) never count **unless** the exe name contains the game name (`CrashBandicoot…exe`). Excluded folders include `_CommonRedist`, `Engine` (Unreal), `EasyAntiCheat`, `Redist`.
- **Extraction** — `PeIconExtractor` parses the PE resource tree in managed code (PE32 and PE32+): first `RT_GROUP_ICON` in resource order (what Explorer shows), its `RT_ICON` frames, rebuilt into an `ICONDIR`. Only the `.rsrc` section is read (cap 64 MB). Any malformed input returns `null`, never throws.

## Key files

| Area | Path |
|------|------|
| Plugin (source name, supported fields) | `src/ExeIcon/src/ExeIconPlugin.cs` |
| Per-game provider | `src/ExeIcon/src/ExeIconMetadataProvider.cs` |
| Exe discovery and ranking | `src/ExeIcon/src/GameExecutableFinder.cs` |
| PE icon extraction | `src/ExeIcon/src/PeIconExtractor.cs` |
| Manifest | `src/ExeIcon/info/extension.yaml` |

## Gotchas

- Keep **`ExeIcon_28501CFD`**, **`ExeIcon.dll`**, and the plugin **`Guid`** stable once shipped.
- Do not switch to `System.Drawing.Icon.ExtractAssociatedIcon`: it returns 32px only. `ExtractIconEx` / `PrivateExtractIcons` would work but lose PNG frames unless re-encoded.
- `GameExecutableFinder` and `PeIconExtractor` use only `System.*` so they can be unit-tested off Windows. Keep Playnite types out of them.
- No `ValueTuple` (`net462` reference assemblies do not ship it without an extra package).
- The metadata source name `ExeIcon` is a brand name; there are no user-visible strings to localize. If settings are added later, add the full `Localization/*.xaml` set (**`.cursor/rules/playnite-localization.mdc`**).
