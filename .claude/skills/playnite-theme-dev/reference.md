# Playnite themes - reference (monorepo policy)

## Shape

- A theme is an add-on with `"kind": "theme"` in `src/extensions.json`, laid out like a plugin:
  - `src/themes/<Theme>/AGENTS.md` - the theme's notes; shared anatomy is in `src/themes/AGENTS.md`.
  - `src/themes/<Theme>/info/` - `theme.yaml`, `InstallerManifest.yaml`, `danitesler_<key>.yaml`, `icon.png`, `LICENSE-*.txt` for everything bundled (Playnite's Default theme, icon sets).
  - `src/themes/<Theme>/src/` - XAML at Playnite Default-theme paths, plus `tokens.css` and `Constants.template.xaml`.
- Index row: `key`, `name`, `"kind": "theme"`, `dir`, `addonId`, `requiredApiVersion` = the **theme API** version. Scripts derive `src/`, `info/theme.yaml`, output `artifacts/builds/themes/<key>`. Packages are `.pthm`; database `Type` is `ThemeDesktop`/`ThemeFullscreen`.
- Build output is generated (`src/` copied, `Constants.xaml` rendered from template + `tokens.css`, `thememodifier.yaml`, licenses, `theme.yaml`). Edit sources, never `artifacts/builds/`.

## One vocabulary, each theme's own design

Tokens keep the design system's names; XAML keys do not. `tokens.css` holds the system's tokens verbatim. XAML keys are the same in every theme: Playnite's own keys (`scripts/data/playnite-theme-api.json`) plus the shared keys in `scripts/data/theme-keys.json`. The template maps each key to the token that plays its role, so design-system names appear only in `tokens.css` and template placeholders.

```xml
<!-- BAD: design-system key names -->
<SolidColorBrush x:Key="PrimerBgColorDefaultBrush" Color="{{bgColor-default}}" />
<!-- GOOD: shared key, Primer token as its value -->
<SolidColorBrush x:Key="InputBackgroundBrush" Color="{{bgColor-default}}" />
```

**Picking the key for a spot** (a color in a control template), in order:
1. **Playnite palette key** when its role covers the spot and the design uses that key's token there: `TextBrush`/`TextBrushDarker` text, `TextBrushDark` text on accent, `GlyphBrush` accent, `HoverBrush` hover, `ButtonBackgroundBrush` button fill, `NormalBorderBrush` control edge, `CheckBoxCheckMarkBkBrush`, `PopupBackgroundBrush`/`PopupBorderBrush`, `TooltipBackgroundBrush`, `ExpanderBackgroundBrush` cards, `WindowBackgourndBrush`, `WindowPanelSeparatorBrush` dividers, `WarningBrush`. If the design's value for the role differs from what the palette key holds, point the palette key at the design's token (unrestyled views read it too; note it in the theme's AGENTS.md).
2. **Shared general role** from `theme-keys.json`: `SelectedBrush`, `FocusBrush`, `FocusHaloBrush`, `DangerBrush`, `InputBackgroundBrush`, `PrimaryButton*`, `ShellBackgroundBrush`, ...
3. **Shared control slot** (`<Control>[<State>]<Part>Brush`, e.g. `SliderTrackBrush`, `TopPanelItemCheckedBackgroundBrush`) only where the design gives that part its own token.
4. Two values for one role in different controls: the main control takes the role's key; the other reuses the key of the token it shares (Primer's pressed `Button` uses `HoverBrush`; its pressed `RepeatButton` uses `ButtonPressedBackgroundBrush`).
5. A role not in the vocabulary: add it to `theme-keys.json` first (key, type, group, one-line description), then use it. Never invent a key inside a theme.

**Naming** (new vocabulary entries): `<Control>[<Variant>][<State>]<Part><Type>` with Playnite's control names (`Button`, `ToggleButton`, `ComboBox`, `ListBox`, `GroupBox`, `SidebarItem`, `TopPanel`, `Tooltip`), never a design system's component names (ActionList, Card, AppBar, MenuPopover). General roles drop the control (`SelectedBrush`, `FocusBrush`); a plain fill drops the part (`SliderTrackBrush`, `MenuSeparatorBrush`). Spacing `<Control>Padding`; radii `ControlCornerRadius` (medium) and `CornerRadiusSmall`/`Large`/`XLarge`/`Full`; icons `Icon<Role>` drawn by `IconTemplate`; styles by what they style (`FocusVisual`, `BareTextBox`, `MainWindowButton`, `MainMenuButton`, `TopPanelSearchBox`, `SliderThumb`, `ScrollBarThumb`).

**Each theme keeps its own design.** Values, radii, spacing, shell, icon set and component shapes come from the design system's published spec, pinned to a version in its `AGENTS.md`; only names are shared. Map by role, not by color. Write the component spec in each file's header comment (component, tokens, sizes). A design system is more than colors: spacing (`Common.xaml`), shell, icons (`Media.xaml`), component shapes. Where WPF/Playnite can't follow the spec, list it under "Deviations" in `AGENTS.md`.

## ThemeModifier

Lacro59's ThemeModifier recolors a theme by **replacing Playnite's palette brushes** (`TextBrush`, `GlyphBrush`, `HoverBrush`, `ButtonBackgroundBrush`, `PopupBackgroundBrush`, ... 24 in all) in application resources, and edits the theme's own constants listed in `thememodifier.yaml`.

- Only `{DynamicResource <Brush>}` references follow a replaced brush. A `*Color` key, or a second key holding the same color, does not. Theme XAML reads **brushes only**; the build fails on a `Color` reference outside `Constants.xaml`. Gradient: fill with the brush, put the gradient in an `OpacityMask` (see any theme's indeterminate `ProgressBar`).
- Sanctioned exception: `HtmlTextView.HtmlForeground` and `LinkForeground` (game description) are Color-typed with a black default, so they read `TextColor`/`GlyphColor`; the check allows exactly those two attributes, and brush edits do not reach that text.
- Define palette and shared brushes as plain `SolidColorBrush` entries in the template. A brush pointing at another brush can't follow an edit.
- `build-theme.ps1` generates `thememodifier.yaml` next to `theme.yaml`: every shared brush the theme defines (plus sized doubles such as `IconSize`), grouped and labelled from `theme-keys.json`. Palette brushes in `playnitePaletteConstants` (window background `WindowBackgourndBrush`) lead their group. Don't hand-edit; change descriptions in `theme-keys.json`.

## How Playnite loads a theme

Source: `source/Playnite/Themes.cs` (`ThemeManager.ApplyTheme`).
1. Only XAML whose relative path matches a file in Playnite's **Default** theme loads (`scripts/data/playnite-theme-api.json`); anything else is ignored.
2. Each theme file is first parsed **on its own**, with only Default resources present.
3. Files merge in pairs, `Default/A.xaml` then `Theme/A.xaml`, in API order: `Constants.xaml`, `Common.xaml`, `Media.xaml`, `DefaultControls/*`, `CustomControls/*`, `DerivedStyles/*`, `Views/*`. The later definition of a key wins.
4. `Toolbox pack` skips any `Fonts/` folder and any file identical to the Default copy.

## Hard rules (Playnite fails silently otherwise)

- Theme files are **overlays**: only restyled keys. Keep every `PART_*` and every part Playnite code dereferences (`SearchBox` needs `PART_SeachIcon`, `PART_TextInpuText`, `PART_ClearTextIcon`). Start from the Default file at the snapshot's tag; change visuals/layout, not behavior.
- Theme keys via `DynamicResource`. `StaticResource` only for Playnite keys or keys defined earlier in the same file.
- `StaticResource {x:Type ContextMenu}` in a later file resolves to the theme's own style (files merge one by one): use `BasedOn` that way instead of copying templates (SliderEx, GameMenu, GameGroupMenu, TrayContextMenu, TopPanelMenu).
- A Default style that references a sibling in its own file with `StaticResource`: redefine both (`Separator` + `MenuItem.SeparatorStyleKey`).
- `BaseStyle` already sets Opacity 0.5 when disabled; styles based on it must not add their own `IsEnabled` opacity trigger (0.25).
- Focus: buttons, toggles, checkboxes, tabs use a keyed `FocusVisualStyle` (`FocusVisual`; keyboard only). Text inputs draw focus on `IsKeyboardFocusWithin`. No `IsKeyboardFocused` border triggers on buttons (mouse clicks focus too).
- No hard-coded colors in theme XAML: add a token, a template line, and a vocabulary entry if the role is new.
- Icon resources Playnite copies (`Media.xaml` menu icons such as `AddGameIcon`, `PlayIcon`) are rebuilt from a `TextBlock`'s glyph and font, so a vector there is lost. To use the design system's icons, make each key a `sys:String` theme-relative PNG path (loaded through `ThemeFile`), rendered by `scripts/render-icons.ps1` from the theme's `icons.json`. Vector icons elsewhere are `Icon<Role>` geometries through `IconTemplate`.
- Game overview (`Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml`): every `PART_*` is optional (null-checked) but a name may appear once. All themes follow one skeleton (banner, header, Steam screenshots, two columns) and put **every** metadata field in one pane of six collapsing groups; layout, part names, triggers: `src/themes/AGENTS.md` -> Game page. List values are Buttons styled from code with `{StaticResource PropertyItemButton}`, so `DerivedStyles/PropertyItemButton.xaml` is the only hook. `HtmlTextView` takes `Color`s (see ThemeModifier).
- Slider: set `Track.Thumb` last (Track stacks parts in the order set). `ScrollContentPresenter` clips: anything drawn outside an item needs the gutter as the panel's margin.
- No `DropShadowEffect` on popups or tiles; popups keep a 1px edge (WPF popups are layered windows). Wrap masked art (`OpacityMask`) in an element with `BitmapCache`.
- No `--` inside XML comments, no `{{`/`}}` in template comments, no `Fonts/` folder.
- Keep `ThemeApiVersion` as low as the theme allows (2.9.0 = Playnite 10.45+). Major must match Playnite's.

## Template placeholders (`Constants.template.xaml`)

| Placeholder | Result |
|-------------|--------|
| `{{name}}` | token color, alpha kept |
| `{{name@surface}}` / `{{name@surface@base}}` | flattened onto the surface (use for popup edges); a translucent last surface is an error |
| `{{name/NN}}` | token at NN% opacity |
| `{{a?b}}` | first token that exists |
| `{{name\|#hex}}` | fallback literal |
| `{{px:name[\|fallback]}}` | length in px (rem, px, var(), calc()) |
| `{{text:name\|fallback}}` | raw text (font names) |
| `{{TODO}}` | fails the build with "not mapped yet" |

Tokens are read from `:root`/`@theme`; selectors containing `dark` override them. Errors report file, line and key.

## Build checks

`build-theme.ps1` and `validate-extension.ps1` fail on: files outside Playnite's list, unrendered placeholders, malformed XML, unknown references, cross-file `StaticResource`, keys that are neither Playnite's nor in `theme-keys.json`, a vocabulary key with the wrong type, `Color` references outside `Constants.xaml`, a `Fonts/` folder. Missing **required** vocabulary keys: warning in `build-theme.ps1` (a theme in progress still deploys), error in `validate-extension.ps1`.
