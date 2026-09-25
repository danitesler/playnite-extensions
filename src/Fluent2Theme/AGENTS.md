# Fluent 2 Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+). Microsoft Fluent 2 `webDarkTheme` tokens (`@fluentui/react-theme` 9.2.2) on the **Fluent** kit (`src/ThemeKits/Fluent`, which extends the Shadcn kit). Kit behavior: **`src/ThemeKits/Fluent/AGENTS.md`**.

## Files

| Path | Role |
|------|------|
| `palette.css` | Fluent dark tokens mapped onto the kit's variable names; each line names its token. |
| `info/theme.yaml` | Playnite theme manifest. |
| `info/InstallerManifest.yaml` | Minimal installer manifest; `PackageUrl` points at the `.pthm`. |
| `info/danitesler_fluent2theme.yaml` | PlayniteAddonDatabase listing (`Type: ThemeDesktop`). |
| `info/icon.png` | 512×512 add-on icon. |

No per-theme overrides. For one, add `"themeDir": "src/Fluent2Theme/theme"` to the profile.

## Palette (rendered)

| Role | Fluent token | Value |
|------|--------------|-------|
| background | `colorNeutralBackground2` | `#1F1F1F` |
| card / popover / controls / tooltip | `colorNeutralBackground1` | `#292929` |
| sidebar | `colorNeutralBackground3` | `#141414` |
| button hover / row hover | `colorNeutralBackground1Hover` / `colorSubtleBackgroundHover` | `#3D3D3D` / `#383838` |
| control edge / divider / strong edge | `colorNeutralStroke1` / `Stroke2` / `StrokeAccessible` | `#666666` / `#525252` / `#ADADAD` |
| foreground / muted-foreground | `colorNeutralForeground1` / `Foreground3` | `#FFFFFF` / `#ADADAD` |
| primary (checked, focus line, indicator) | `colorCompoundBrand*` | `#479EF5` (dark text `#242424`) |
| primary button / hover | `colorBrandBackground` / `Hover` | `#115EA3` / `#0F6CBD` |
| focus outline | `colorStrokeFocus2` | `#FFFFFF` |
| destructive / warning / success | `colorStatus*Foreground1` | `#DC626D` / `#FAA06B` / `#54B054` |

## Siblings

Fluent's brand ramp is swappable: `createDarkTheme(brandVariants)` in Fluent UI gives any accent. Copy `palette.css` and replace the brand values (`--primary*`, `--primary-button*`, `--primary-subtle*`, `--sidebar-primary*`). Teams' dark theme (`teamsDarkTheme`) uses the same token names.

## Layout

Fluent kit shell, Windows 11 style: the window is the base layer (`#1F1F1F`) with a compact 48px NavigationView rail (brand pill on the selected item) and a 48px title-bar row: search centered, subtle 32px icon buttons with 20px Fluent icons, Windows 11 caption buttons in the corner. The library sits on a `#292929` content layer with a rounded top-left corner.

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension fluent2theme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Fluent 2 Theme
```

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. Beyond the checklist in `src/ShadcnUiTheme/AGENTS.md`, check: the focus underline animation on text boxes and dropdowns (and that it resets when focus leaves), the curved bottom edge at the corners, and the white 2px focus outline on buttons next to panel edges.

Layout checks: the content layer's rounded corner with the background image on (details view), the corner going square with the rail on the right or hidden, the centered search shrinking in narrow windows, caption buttons flush with the corner (also maximized), and the rail's brand pill.
