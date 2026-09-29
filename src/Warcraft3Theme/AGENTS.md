# Warcraft III Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) in the style of **Warcraft III**. Standalone: every file it ships lives in this folder. Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`), the same as every theme here; Warcraft III's token names stay in `tokens.css`.

## Sources

| What | Where (package, version, file) |
|------|--------------------------------|
| Tokens | TODO |
| Components | TODO |
| Icons | TODO (license file in `info/`) |

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | Warcraft III's CSS custom properties under their own names; `.dark` wins over `:root`. |
| `src/Constants.template.xaml` | Tokens -> Playnite's palette keys and the shared keys; rendered into `Constants.xaml`. |
| `src/Common.xaml` | `PopupBorder`, `FocusVisual`, and component spacing keyed by the Playnite control. |
| `src/Media.xaml` | Warcraft III's icon set as `Icon<Role>` geometries and `IconTemplate`. |
| `src/Views/*`, `src/DerivedStyles/MainWindowStyle.xaml`, `src/CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml` | Shell: how Warcraft III lays out an app. |
| `src/DefaultControls/*`, other `src/CustomControls/*`, `src/DerivedStyles/*` | Controls, each from a Warcraft III component. |
| `info/` | `theme.yaml`, installer and add-on database manifests, `icon.png` (512x512), `LICENSE-*.txt` notices shipped in the package. |

## Keys

Which Warcraft III token plays each key (Playnite palette first, then shared keys).

| Key | Token | Used for |
|-----|-------|----------|
| TODO | | |

## Components

| Playnite file | Warcraft III component | Notes |
|---------------|-------------------|-------|
| TODO | | |

## Known gaps

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension warcraft3theme -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Warcraft III Theme
```
