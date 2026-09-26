---
name: playnite-theme-dev
description: Playnite theme work — a new standalone theme for a design system, token swaps, restyling a control, build-theme.ps1 / -Deploy, theme validation errors, .pthm. For .NET plugins use playnite-extension-build.
---

# Playnite theme — develop

## Scope

- **Use this skill** for anything under `src/<Theme>/src/` or `src/<Theme>/info/theme.yaml`, `build-theme.ps1`, `new-theme.ps1`, or "why does my theme not load / look wrong".
- Packaging and version bumps follow **`playnite-extension-release`** (themes produce `.pthm`; same scripts).
- Rules (loading mechanics, hard rules, placeholder syntax): **`.cursor/rules/playnite-themes.mdc`**. Per-theme notes: **`src/<Theme>/AGENTS.md`**.

Every theme is standalone. Other themes show how Playnite's parts and triggers have to be wired; they are not a source of styles, names or numbers. A new theme is written from its design system's spec and Playnite's Default files.

## New theme for a design system

1. **Sources first.** Find the design system's published tokens and component styles (npm packages, official theme CSS, docs) and pin versions. Note which dark theme you target. Record all of it in `AGENTS.md` → Sources.
2. **Scaffold:** `.\scripts\new-theme.ps1 -Name "My Theme" -Key mytheme -Prefix MyDs [-TokensCss <file>]`. `-Prefix` is the design system's name (PascalCase); every key the theme adds must start with it. The script creates `src/<Name>/` (`info/` manifests and `LICENSE-Playnite.txt`, `src/tokens.css`, `src/Constants.template.xaml`, `AGENTS.md`) and registers the profile.
3. **`src/tokens.css`:** the system's tokens under their own names (`:root` for shared values, a `dark` selector for the dark theme). Write var() aliases out and keep the alias in a comment.
4. **`src/Constants.template.xaml`:** one `Color` + `Brush` per token the theme uses, keyed `<Prefix><TokenName>` (`--bgColor-default` → `PrimerBgColorDefaultColor`), radii and stroke widths the same way. Then replace each `{{TODO}}` in the Playnite palette block with the token that plays that role; the build fails until all are mapped. Map by role: `GlyphColor` is the system's selection/checked accent, `TextColorDark` its text-on-accent.
5. **`src/Common.xaml`:** `PopupBorder`, the focus style, and component spacing named after the component (`<Prefix>ButtonPadding`, `<Prefix>MenuItemPadding`, ...), each with a comment quoting the spec.
6. **`src/Media.xaml`:** the system's icon set for Playnite's roles (search, clear, view settings, filter presets, group, sort, details/grid/list view, update, explorer, random, filter, notifications, main menu, library, statistics, window buttons) plus whatever the controls need (chevrons, check). Generate `Geometry` resources with `.\scripts\render-icons.ps1 -Pack <pack> -Icons <names> -Format Geometry -KeyPrefix <Prefix><Set>` (filled icons; stroked packs such as Lucide or Tabler outline need `-Format DrawingImage`). For Playnite's menu icons (`AddGameIcon`, `SettingsIcon`, ...), list them in `src/<Theme>/icons.json` as a `Png` job and map each key to its file as a `sys:String` (see Primer's `Media.xaml` and `icons.json`), then run `.\scripts\render-icons.ps1 -Extension <key>`. Ship the icon license in `info/`.
7. **Shell:** how the system lays out an app, in `Views/MainWindow.xaml`, `Views/Sidebar.xaml`, `Views/TopPanel.xaml`, `DerivedStyles/MainWindowStyle.xaml`, `CustomControls/SidebarItem.xaml`, `CustomControls/TopPanelItem.xaml` (optionally `Views/Library.xaml`). Start each from Playnite's Default file, keep every `PART_*`, reserve the window buttons' width on the top bar's right.
8. **Controls:** for each control, open the Default file at the snapshot's tag, keep structure and part names, and restyle it to the system's component (name the component and its tokens in the header). Usual set: Button, ToggleButton, RepeatButton, TextBox, PasswordBox, ComboBox, CheckBox, RadioButton, Slider (+ one-line SliderEx), ProgressBar, ScrollViewer/Thumb, ToolTip, ContextMenu/Menu (+ one-line GameMenu, GameGroupMenu, TrayContextMenu), TabControl, GroupBox, ListBox, SearchBox, DetailsViewItemStyle, GridViewItemStyle, PlayButton, WindowBarButton, HighlightBorder.
9. **Build:** `.\scripts\build-theme.ps1 -Extension mytheme -Deploy`, restart Playnite → Settings → Appearance → Theme.
10. **Finish:** `info/icon.png` (512×512), database description in `info/danitesler_<key>.yaml`, `AGENTS.md` (tokens table, spacing, shell, components, deviations, "Not verified yet"), then `.\scripts\validate-extension.ps1 -Extension mytheme -Mode Package`.

## Token-only change (a sibling dark theme, a brand swap)

Edit the values in `tokens.css`, keep the names, rebuild. If the new theme lacks a token, add a `?fallback` in the template rather than renaming keys.

## Restyle one control

- Edit or add `src/<Theme>/src/<Default path>.xaml`. Start from Playnite's Default file, keep part names, include only the styles you change.
- Colors from tokens (`{DynamicResource <Prefix>...Brush}`); a new one gets a `Color` + `Brush` pair with a placeholder in the template.
- Spacing from the theme's `Common.xaml` keys; add a key rather than a literal when the value is a spec number.

## Reading build errors

| Message | Fix |
|---------|-----|
| `is not a Playnite Desktop theme file` | Path/name differs from the Default theme (case-insensitive). Rename or merge into the right file. |
| `defines 'X'. Keys a theme adds must start with '<Prefix>'` | Rename the key to the design system's name with the prefix. |
| `uses {StaticResource X}, but 'X' only exists in another theme file` | Switch to `DynamicResource`. |
| `references unknown resource 'X'` | Typo, or a key missing from this Playnite version / the template. |
| `Template rendering failed` (file:line key) | Token missing from `tokens.css`, a `{{TODO}}` left, or a translucent surface; add the token or a fallback. |
| `still contains an unrendered {{placeholder}}` | Braces in a comment or a malformed placeholder. |
| `ThemeApiVersion ... will not load` | Declared API is newer than the snapshot's Playnite, or major differs. |
| `An XML comment cannot contain '--'` | A comment mentions a CSS variable (`--name`); reword it. |

## When it builds but looks wrong in Playnite

- Theme silently reverts to Default → XAML threw at load. Check `%AppData%\Playnite\playnite.log` (portable: next to `Playnite.exe`) for the file and line.
- A control ignores the tokens → its Default template hard-codes a color or reads a Playnite key; override that style.
- Changes not visible → Playnite reads themes at startup only; restart after `-Deploy`.

## End of every theme build reply (required)

```text
✅ theme built - <key>
Output: artifacts/builds/<key>/
```

or

```text
❌ theme build failed - <key>
Reason: <first error line>
```
