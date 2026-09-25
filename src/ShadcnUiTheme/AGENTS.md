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
| card / popover / sidebar | `#18181B` | window frame and sidebar, menus, cards, header search |
| secondary / muted / accent | `#27272A` | buttons, hover and selected rows, tab list, slider track |
| border (white 10%) | `#222223` page, `#2F2F32` on card/popover | popup edges, dialog separators (panel separators are transparent) |
| input (white 15%) | `#2E2E30` | control borders |
| ring | `#71717B` | focus borders, scroll thumb hover |
| foreground / muted-foreground | `#FAFAFA` / `#9F9FA9` | text and icons, tooltips (inverted) / secondary text |
| primary / primary-foreground | `#E4E4E7` / `#18181B` | Play button, default buttons, checked boxes, Playnite `GlyphColor` |
| destructive | `#FF6467` | close-button hover, warnings, negative ratings |

## Layout

shadcn's inset dashboard (Shadcn kit shell): the window frame is the sidebar color (`#18181B`) and the library sits on a rounded-xl `#09090B` card inset 8px. The 48px header lives inside the card: borderless filled search on the left, ghost 32px icon buttons (lucide, 16px) on the right, window buttons in the same row. The sidebar has no fill or border: 32px rounded-md items, a white logo tile for the main menu. No separators anywhere; buttons are the borderless `secondary` variant, tooltips the inverted v4 chip.

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension shadcnuitheme -Deploy   # composes artifacts/builds/shadcnuitheme and copies it to %AppData%\Playnite\Themes\Desktop\<Id>
# restart Playnite -> Settings -> Appearance -> Theme: Shadcn UI Theme
```

Portable Playnite: add `-DeployPath <Playnite folder>\Themes`.

## Not verified yet

Built and statically checked on Linux (XML, file allowlist, resource keys, StaticResource scope); **not yet loaded in Playnite**. First run on Windows should cover: main library (grid, details, list), game context menu, top panel dropdowns, settings window tabs, game edit dialog, search (Ctrl+F), a progress dialog, and keyboard focus on buttons and inputs. If Playnite rejects the theme it falls back to Default and logs the XAML error in `playnite.log`.

Layout checks: the inset card's rounded corners over the library background image (details view), the window buttons centered in the card header, sidebar at each position (Settings → Appearance → Layout), the search placeholder hiding while typing, lucide icons in the top bar and on Library / Statistics, and slider ranges ending under the thumb (grid zoom slider).
