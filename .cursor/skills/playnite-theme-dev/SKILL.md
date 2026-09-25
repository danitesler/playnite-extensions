---
name: playnite-theme-dev
description: Playnite theme work — new theme from a shadcn palette, palette swaps, restyling a control in a kit, build-theme.ps1 / -Deploy, theme validation errors, .pthm. For .NET plugins use playnite-extension-build.
---

# Playnite theme — develop

## Scope

- **Use this skill** for anything under `src/ThemeKits/`, a theme's `palette.css` / `info/theme.yaml`, `build-theme.ps1`, `new-theme.ps1`, or "why does my theme not load / look wrong".
- Packaging and version bumps follow **`playnite-extension-release`** (themes produce `.pthm` instead of `.pext`; same scripts).
- Rules: **`.cursor/rules/playnite-themes.mdc`**. Kit internals: **`src/ThemeKits/<Kit>/AGENTS.md`**.

## New theme (most common)

1. Get the palette: a shadcn theme export (ui.shadcn.com/themes, tweakcn.com, or a project's `globals.css`) saved as a `.css` file. Only `.dark` and `:root` blocks are read; `.dark` wins.
2. Scaffold: `.\scripts\new-theme.ps1 -Name "My Theme" -Key mytheme -PaletteCss <file>` (or `-CopyPaletteFrom <key>`). It creates `src/<Name>/` (palette, manifests, AGENTS.md) and registers the profile.
3. Build: `.\scripts\build-theme.ps1 -Extension mytheme -Deploy`. Restart Playnite → Settings → Appearance → Theme.
4. Add `info/icon.png` (512×512), fill the database description, run `.\scripts\validate-extension.ps1 -Extension mytheme -Mode Package`.

## Palette-only change

Edit `palette.css`, rebuild. Missing variables fall back per the template (`sidebar` → `card`, `popover` → `card`, ...); anything unresolved fails the build with the variable name.

## New design system (not just new colors)

If it shares most control shapes with an existing kit, create `src/ThemeKits/<Name>/kit.json` with `{ "extends": "src/ThemeKits/Shadcn" }` and add only the files it draws differently under `<Name>/Desktop/` (see `src/ThemeKits/Chakra`). Map the design system's tokens onto the kit's variable names in the theme's `palette.css`, with a comment naming each source token. Scaffold with `-Kit <Name>`.

A design system is more than colors. Give the kit:

1. **Metrics** in `Desktop/Common.xaml`: the system's button, input, menu, list, card and tooltip spacing and component radii (copy the key list from the Shadcn kit's `Common.xaml`; every key must be present).
2. **Its own shell**: how the system lays out an app (inset card, app bar + drawer, header band, title bar + rail, ...) in `Views/MainWindow.xaml`, `Views/Sidebar.xaml`, `Views/TopPanel.xaml`, `DerivedStyles/MainWindowStyle.xaml`, `CustomControls/SidebarItem.xaml`, `CustomControls/TopPanelItem.xaml`. Keep every `PART_*`; reserve the window buttons' width on the top bar's right.
3. **Its icon set** in `Desktop/Media.xaml` when it has one (all `ShadcnIcon*` keys + `ShadcnIconTemplate`), with the icon package's license file in the kit folder.
4. **Its slider**: rail, range and thumb from the system's spec; keep the range in the decrease button and set `Track.Thumb` last.

Borders and dividers: use the system's borderless variants where they exist (ghost / subtle / text / invisible) and leave layout separators out.

## Restyle one control

- **For every theme on a kit:** edit or add `src/ThemeKits/<Kit>/Desktop/<Default path>.xaml`. Start from Playnite's Default file at the tag in `scripts/data/playnite-theme-api.json`, keep part names, include only the styles you change.
- **For one theme only:** set `"themeDir": "src/<Theme>/theme"` in its profile and put the file there; it replaces the kit's copy.
- Colors come from tokens (`{DynamicResource Shadcn...Brush}`). Need a new one? Add a `Color` + `Brush` pair with a placeholder in `Constants.template.xaml`.
- Spacing comes from the metric keys (`ShadcnButtonPadding`, `ShadcnInputPadding`, `ShadcnMenuItemPadding`, ...); a kit changes them in its `Common.xaml` rather than replacing the control.

## Reading build errors

| Message | Fix |
|---------|-----|
| `is not a Playnite Desktop theme file` | Path/name differs from the Default theme (case-insensitive match). Rename or merge into the right file. |
| `uses {StaticResource X}, but 'X' only exists in another theme file` | Switch to `DynamicResource`. |
| `references unknown resource 'X'` | Typo, or a key missing from this Playnite version / the Constants template. |
| `still contains an unrendered {{placeholder}}` / `Template rendering failed` | Palette lacks the variable; add it or a fallback in the template. |
| `ThemeApiVersion ... will not load` | Declared API is newer than the snapshot's Playnite, or major differs. |
| `is not well-formed XML: An XML comment cannot contain '--'` | A comment mentions a CSS variable (`--name`); reword it. |

## When it builds but looks wrong in Playnite

- Theme silently reverts to Default → XAML threw at load. Check `%AppData%\Playnite\playnite.log` (portable: next to `Playnite.exe`) for the file and line.
- A control ignores the palette → its Default template hard-codes a color or uses a Playnite key the template maps differently; override that style in the kit.
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
