# Shadcn UI Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, loads on Playnite 10.45+). Fully dark: shadcn/ui v4 **zinc** palette, shadcn component styles from the **Shadcn kit** (`src/ThemeKits/Shadcn`). Kit rules, token contract, and the list of restyled controls live in **`src/ThemeKits/Shadcn/AGENTS.md`**.

## Files

| Path | Role |
|------|------|
| `palette.css` | shadcn CSS variables (zinc dark, verbatim from the shadcn registry) + `--radius`. The only file a palette change touches. |
| `info/theme.yaml` | Playnite theme manifest (`Id`, `Version`, `Mode`, `ThemeApiVersion`). |
| `info/InstallerManifest.yaml` | Minimal installer manifest; `PackageUrl` points at the `.pthm`. |
| `info/danitesler_shadcnuitheme.yaml` | PlayniteAddonDatabase listing (`Type: ThemeDesktop`). |
| `info/icon.png` | 512×512 add-on icon. |

No per-theme overrides yet. To change one control for this theme only, add `"themeDir": "src/ShadcnUiTheme/theme"` to its profile and put the file at the Default-theme path under that folder; it replaces the kit's copy at build time.

## Palette mapping (zinc dark)

| Role | Hex | Used for |
|------|-----|----------|
| background | `#09090B` | window and library background |
| card / popover / sidebar | `#18181B` | sidebar, menus, tooltips, cards, search panel |
| secondary / muted / accent | `#27272A` | hover and selected rows, tab list, slider track |
| border (white 10%) | `#222223` page, `#2F2F32` on card/popover | separators, popup edges |
| input (white 15%) | `#2E2E30` | control borders |
| ring | `#71717B` | focus borders, scroll thumb hover |
| foreground / muted-foreground | `#FAFAFA` / `#9F9FA9` | text / secondary text |
| primary / primary-foreground | `#E4E4E7` / `#18181B` | Play button, default buttons, checked boxes, Playnite `GlyphColor` |
| destructive | `#FF6467` | close-button hover, warnings, negative ratings |

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension shadcnuitheme -Deploy   # composes artifacts/builds/shadcnuitheme and copies it to %AppData%\Playnite\Themes\Desktop\<Id>
# restart Playnite -> Settings -> Appearance -> Theme: Shadcn UI Theme
```

Portable Playnite: add `-DeployPath <Playnite folder>\Themes`.

## Not verified yet

Built and statically checked on Linux (XML, file allowlist, resource keys, StaticResource scope); **not yet loaded in Playnite**. First run on Windows should cover: main library (grid, details, list), game context menu, top panel dropdowns, settings window tabs, game edit dialog, search (Ctrl+F), a progress dialog, and keyboard focus on buttons and inputs. If Playnite rejects the theme it falls back to Default and logs the XAML error in `playnite.log`.
