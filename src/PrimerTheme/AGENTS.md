# Primer Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+). GitHub Primer **dark** tokens (`@primer/primitives` 11.10.0) on the **Primer** kit (`src/ThemeKits/Primer`, which extends the Shadcn kit). Kit behavior: **`src/ThemeKits/Primer/AGENTS.md`**.

## Files

| Path | Role |
|------|------|
| `palette.css` | Primer dark functional tokens mapped onto the kit's variable names; each line names its token. |
| `info/theme.yaml` | Playnite theme manifest. |
| `info/InstallerManifest.yaml` | Minimal installer manifest; `PackageUrl` points at the `.pthm`. |
| `info/danitesler_primertheme.yaml` | PlayniteAddonDatabase listing (`Type: ThemeDesktop`). |
| `info/icon.png` | 512×512 add-on icon. |

No per-theme overrides. For one, add `"themeDir": "src/PrimerTheme/theme"` to the profile.

## Palette (rendered)

| Role | Primer token | Value |
|------|--------------|-------|
| background | `bgColor-default` | `#0D1117` |
| card / muted | `bgColor-muted` | `#151B23` |
| popover / sidebar | `overlay-bgColor`, `bgColor-inset` | `#010409` |
| border / input edge | `borderColor-default` | `#3D444D` |
| popover and sidebar edge | `borderColor-muted` | `#2B3139` |
| default button / hover | `control-bgColor-rest` / `-hover` | `#212830` / `#262C36` |
| row hover | `control-transparent-bgColor-hover` | `#656C76` @ 20% (translucent) |
| foreground / muted-foreground | `fgColor-default` / `fgColor-muted` | `#F0F6FC` / `#9198A1` |
| primary (blue) | `bgColor-accent-emphasis`, `focus-outlineColor` | `#1F6FEB` |
| primary button (green) / hover | `button-primary-bgColor-rest` / `-hover` | `#238636` / `#29903B` |
| tab indicator | `underlineNav-borderColor-active` | `#F78166` |
| tooltip | `bgColor-emphasis` | `#3D444D` |
| destructive / attention / success | `fgColor-danger` / `-attention` / `-success` | `#F85149` / `#D29922` / `#3FB950` |

## Siblings

Primer's other dark themes (`dark-dimmed`, `dark-high-contrast`, `dark-colorblind`, `dark-tritanopia`) use the same token names. Copy `palette.css` and swap values from that theme's CSS in `@primer/primitives/dist/css/functional/themes/`.

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension primertheme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Primer Theme
```

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. Beyond the checklist in `src/ShadcnUiTheme/AGENTS.md`, check: green default buttons in dialogs, the coral tab bar alignment, the thick radio ring, and that the inside focus outline is visible on the green and blue buttons.
