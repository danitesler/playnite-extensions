# Material UI Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+). Fully dark: MUI's default dark theme (`createTheme({ palette: { mode: 'dark' } })`) on the **Mui** kit (`src/ThemeKits/Mui`, which extends the Shadcn kit). Kit behavior: **`src/ThemeKits/Mui/AGENTS.md`**.

## Files

| Path | Role |
|------|------|
| `palette.css` | MUI dark values mapped onto the kit's variable names; each line names its MUI source. |
| `info/theme.yaml` | Playnite theme manifest. |
| `info/InstallerManifest.yaml` | Minimal installer manifest; `PackageUrl` points at the `.pthm`. |
| `info/danitesler_materialuitheme.yaml` | PlayniteAddonDatabase listing (`Type: ThemeDesktop`). |
| `info/icon.png` | 512×512 add-on icon. |

No per-theme overrides. For one, add `"themeDir": "src/MaterialUiTheme/theme"` to the profile.

## Palette (rendered)

| Role | MUI source | Value |
|------|------------|-------|
| background / sidebar | `background.default`, permanent Drawer | `#121212` |
| card | Paper elevation 1 | `#1E1E1E` |
| popover (menus, dropdowns) | Paper elevation 8 | `#2E2E2E` |
| border / popover edge | `divider` (white 12%) | `#2E2E2E` page, `#474747` on popovers |
| input border | OutlinedInput (white 23%) | `#494949` |
| foreground / muted-foreground | `text.primary` / `text.secondary` | `#FFFFFF` / `#B8B8B8` |
| primary / primary-foreground | `primary.main` (blue[200]) / `contrastText` | `#90CAF9` / `#131A20` |
| primary-hover | `primary.dark` (blue[400]) | `#42A5F5` |
| hover / focus / selected layers | `action.hover` / `action.focus` / primary @ 16% | white 8% / white 12% / `#90CAF9` 16% (translucent) |
| tooltip | grey[700] @ 92% | `#5B5B5B` |
| destructive | `error.main` (red[500]) | `#F44336` |

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension materialuitheme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Material UI Theme
```

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. Beyond the checklist in `src/ShadcnUiTheme/AGENTS.md`, check: uppercase labels on dialog buttons (and that icon-only buttons still show their icon), access-key underscores in button text, checkbox/radio hover halos near panel edges, and slider halos.
