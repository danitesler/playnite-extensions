# Chakra UI Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+). Fully dark: Chakra UI v3 dark semantic tokens with **teal** as the color palette, on the **Chakra** kit (`src/ThemeKits/Chakra`, which extends the Shadcn kit). Kit behavior lives in **`src/ThemeKits/Chakra/AGENTS.md`**.

## Files

| Path | Role |
|------|------|
| `palette.css` | Chakra tokens mapped onto the kit's variable names; each line names its Chakra token. |
| `info/theme.yaml` | Playnite theme manifest. |
| `info/InstallerManifest.yaml` | Minimal installer manifest; `PackageUrl` points at the `.pthm`. |
| `info/danitesler_chakrauitheme.yaml` | PlayniteAddonDatabase listing (`Type: ThemeDesktop`). |
| `info/icon.png` | 512×512 add-on icon. |

No per-theme overrides. For one, add `"themeDir": "src/ChakraUiTheme/theme"` to the profile.

## Palette (dark)

| Role | Chakra token | Hex |
|------|--------------|-----|
| background | `bg` (black) | `#09090B` |
| card / popover / sidebar | `bg.panel` (gray.950) | `#111111` |
| secondary (button fill) / muted | `gray.subtle`, `bg.muted` (gray.900) | `#18181B` |
| accent (hover) / border | `bg.emphasized`, `border` (gray.800) | `#27272A` |
| input (control edges) | `border.emphasized` (gray.700) | `#3F3F46` |
| input-background / input-border | Input `subtle`: `bg.muted` / transparent | `#18181B` / none |
| foreground / muted-foreground | `fg` (gray.50) / `fg.muted` (gray.400) | `#FAFAFA` / `#A1A1AA` |
| primary / primary-foreground | `teal.solid` (teal.600) / `teal.contrast` | `#0D9488` / `#FFFFFF` |
| primary-subtle / its foreground | `teal.subtle` (teal.900) / `teal.fg` (teal.300) | `#032726` / `#5EEAD4` |
| ring | `teal.focusRing` (teal.500) | `#14B8A6` |
| destructive | `fg.error` (red.400) | `#F87171` |

Deviation: `--input` uses `border.emphasized` instead of Chakra's `border` for checkbox and radio edges, so they stay visible on the near-black background. Text fields and selects use the `subtle` variant instead of `outline`, so they have no edge at all.

## Layout

Chakra kit shell: one flat `#09090B` surface, no borders. 64px top bar with Playnite's view controls in a single SegmentGroup on the left, the `subtle` search input (h-10) on the right, and ghost 40px IconButtons for filters and notifications. 72px sidebar with a teal rounded-full logo button and teal `subtle` selection. lucide icons at 20px. Inputs use the `subtle` variant (bg.muted fill, no visible border).

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension chakrauitheme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Chakra UI Theme
```

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. Same first-run checklist as `src/ShadcnUiTheme/AGENTS.md`, plus: tab underline alignment in the game edit dialog, and the 2px focus ring on buttons (Tab key).

Layout checks: the SegmentGroup with many or few top bar items enabled, the teal logo and selection in the sidebar, the subtle search input and selects (fill visible, no edge), window buttons centered on the 64px bar, and the slider's outlined thumb.
