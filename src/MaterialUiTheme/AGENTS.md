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
| input border | OutlinedInput (white 23%), used by checkbox-style edges | `#494949` |
| field fill / hover / underline | FilledInput | white 9% / white 13% / white 70% (translucent) |
| app bar / app bar search | Paper elevation 4 / `alpha(common.white, 0.15)`, 0.25 on hover | `#272727` / white 15% (translucent) |
| foreground / muted-foreground | `text.primary` / `text.secondary` | `#FFFFFF` / `#B8B8B8` |
| primary / primary-foreground | `primary.main` (blue[200]) / `contrastText` | `#90CAF9` / `#131A20` |
| primary-hover | `primary.dark` (blue[400]) | `#42A5F5` |
| hover / focus / selected layers | `action.hover` / `action.focus` / primary @ 16% | white 8% / white 12% / `#90CAF9` 16% (translucent) |
| tooltip | grey[700] @ 92% | `#5B5B5B` |
| destructive | `error.main` (red[500]) | `#F44336` |

## Layout

Mui kit shell: a 64px app bar at elevation 4 (`#272727`) that the drawer's header band continues across the window; everything else is `#121212` with no dividers. App bar search on the left (white 15%, widens on focus), 40px round IconButtons with Material icons on the right, Badges for filter state and notification count. Mini drawer: 64x48 square rows, primary-tinted selection. Regular buttons are the `text` variant; fields are FilledInput (white 9% fill with an underline).

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension materialuitheme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Material UI Theme
```

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. Beyond the checklist in `src/ShadcnUiTheme/AGENTS.md`, check: uppercase labels on dialog buttons (and that icon-only buttons still show their icon), access-key underscores in button text, checkbox/radio hover halos near panel edges, and slider halos.

Layout checks: the app bar color continuing through the drawer's header band, the search widening on focus, Badges on the filter and notification buttons, full-width drawer rows, FilledInput underline animation in the game edit dialog, and the slider halo.

Known limit: the app bar belongs to the library view, so on other views (Statistics, add-on views) only the drawer's header band shows the bar color.
