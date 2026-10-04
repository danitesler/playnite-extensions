---
name: playnite-theme-dev
description: Playnite theme work in this monorepo - a new standalone theme from a design system's tokens, token swaps, restyling a control, build-theme.ps1 / -Deploy, theme validation or load failures, ThemeModifier compatibility, theme-keys vocabulary. For .NET plugins use playnite-plugin-dev; for .pthm packaging and releases use playnite-release.
---

# Playnite theme - develop

Use for anything under `src/themes/<Theme>/src/` or `info/theme.yaml`, `build-theme.ps1`, `new-theme.ps1`, or "why does my theme not load / look wrong".

Read in this order when needed:
- [reference.md](reference.md) - how Playnite loads a theme, key vocabulary and how to pick a key, ThemeModifier, hard rules, placeholders, build checks. **Read before writing or restyling XAML.**
- `src/themes/AGENTS.md` - what every theme shares: file map, shell mechanics, game page skeleton and metadata pane, icons, first-run checks.
- `src/themes/<Theme>/AGENTS.md` - that theme's sources, token-to-key map, shell, components, deviations.

Every theme is standalone: no shared kits, no inheritance, never read another theme's files. Other themes show how Playnite's parts and triggers are wired and which key a role uses, not styles or numbers. A new theme is written from its design system's spec and Playnite's Default files. The only thing shared is the key vocabulary (Playnite's keys + `scripts/data/theme-keys.json`).

## After every change: build and deploy

Every edit under `src/themes/<Theme>/` ends with `.\scripts\build-theme.ps1 -Extension <key> -Deploy -Restart [-DeployPath <Themes folder>]` (auto-activates the theme in `config.json` and launches/restarts Playnite on Windows). Redeploys replace the same folder, so no duplicates stack up. If Deploy fails with "themes folder not found", ask for the portable `-DeployPath`.

## New theme from a reference (design system, game, movie, or UI)

1. **Research & sources first.** Before scaffolding or coding without ready-made tokens, thoroughly research the reference using any available source (captures/screenshots, reference codebases/repos, style guides, or specs): sample/measure exact colors, note typography and Windows system fallbacks, examine chrome/plates/tabs/radii, and pick matching icons. Record captures, repos, URLs, values, and design rules in `AGENTS.md` -> `Sources`.
2. **Scaffold:** `.\scripts\new-theme.ps1 -Name "My Theme" -Key mytheme [-DesignSystem "My DS"] [-TokensCss <file>]`. Creates `src/themes/<Name>/` (`info/` manifests + `LICENSE-Playnite.txt`, `src/tokens.css`, `src/Constants.template.xaml` with palette and required shared brushes as `{{TODO}}`, `AGENTS.md`) and registers the index row.
3. **`src/tokens.css`:** the system's tokens under their own names (`:root` shared, a `dark` selector for the dark theme). Write var() aliases out; keep the alias in a comment.
4. **`src/Constants.template.xaml`:** replace each `{{TODO}}` with the token that plays that key's role (the build fails until all are mapped). Map by role: `GlyphColor` = selection/checked accent, `TextColorDark` = text on accent, `HoverBrush` = hover fill, `SelectedBrush` = selected fill. Add optional shared keys as controls need them and the radius scale (`CornerRadiusSmall`/`Large`/`XLarge`/`Full`; `ControlCornerRadius` is the medium step). Brushes only in controls.
5. **`src/Common.xaml`:** `PopupBorder`, `FocusVisual`, spacing keys (`ButtonPadding`, `InputPadding`, `MenuPadding`, `MenuItemPadding`, `ComboBoxDropDownPadding`, `ComboBoxItemPadding`, `ListBoxItemPadding`, `GroupBoxPadding`, `TooltipPadding`, `IconSize`), and `GameBannerHeight` (default banner height, e.g. 320/340/360; edited in ThemeModifier), each with a comment quoting the spec.
6. **`src/Media.xaml`:** the icon set as `Icon<Role>` geometries drawn by `IconTemplate` (`IconSearch`, `IconClear`, `IconViewSettings`, `IconFilterPresets`, `IconGroup`, `IconSort`, `IconDetailsView`/`GridView`/`ListView`, `IconUpdate`, `IconExplorer`, `IconRandom`, `IconViewRandom`, `IconFilter`, `IconNotifications`, `IconMainMenu`, `IconLibrary`, `IconStatistics`, `IconWindowMinimize`/`Maximize`/`Restore`/`Close`, plus `IconDropDown`, `IconSubmenu`, `IconCheck` as needed). Generate: `.\scripts\render-icons.ps1 -Pack <pack> -Icons search,x=Clear,three-bars=MainMenu -Format Geometry -KeyPrefix Icon` (stroked packs such as Lucide/Tabler need `-Format DrawingImage`). Playnite's own menu icons (`AddGameIcon`, `SettingsIcon`...) go in `src/themes/<Theme>/icons.json` as `Png` jobs mapped to `sys:String` paths (see Primer's `Media.xaml`/`icons.json`), then `.\scripts\render-icons.ps1 -Extension <key>`. Ship the icon license in `info/`.
7. **Shell:** `Views/MainWindow.xaml`, `Views/Sidebar.xaml`, `Views/TopPanel.xaml`, `DerivedStyles/MainWindowStyle.xaml`, `CustomControls/SidebarItem.xaml`, `CustomControls/TopPanelItem.xaml` (optionally `Views/Library.xaml`). Start each from Playnite's Default file, keep every `PART_*`, reserve the window buttons' width on the top bar's right. Navigation goes on the left: design the sidebar as a left rail (Playnite's default position); top/bottom are fallbacks only. Shared shell keys: styles `MainMenuButton`, `MainWindowButton`, `TopPanelSearchBox`; brushes `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `ContentBackgroundBrush`.
8. **Controls:** for each, open the Default file at the snapshot's Playnite tag, keep structure and part names, restyle to the system's component (name it and its tokens in the file header). Usual set: Button, ToggleButton, RepeatButton, TextBox (+`BareTextBox`), PasswordBox, ComboBox, CheckBox, RadioButton, Slider (`SliderRangeButton`, `SliderThumb`; one-line SliderEx), ProgressBar, ScrollViewer (`ScrollBarThumb`)/Thumb, ToolTip, ContextMenu/Menu (one-line GameMenu, GameGroupMenu, TrayContextMenu), TabControl, GroupBox, ListBox, SearchBox, DetailsViewItemStyle, GridViewItemStyle, PlayButton, WindowBarButton, HighlightBorder.
   **Game page:** `Views/DetailsViewGameOverview.xaml` and `Views/GridViewGameOverview.xaml` follow the skeleton and metadata pane in `src/themes/AGENTS.md` -> Game page, dressed in the system's components. Banner spacer scales proportionally with `HeroArt` via `{StaticResource MathConverter}` (`'x * <DefaultSpacer> / <DefaultBanner>'`) and an `ActualHeight == 0` trigger, keeping default title/gradient scrim positions intact while dynamically moving top elements up/down when "Banner height (0 = off)" is changed in ThemeModifier. Never bind spacer height directly to `{DynamicResource GameBannerHeight}`.
9. **HTML Previews & Screenshots:** every theme has two HTML preview templates under `art/`: `preview-details.html` (Game Details view) and `preview-settings.html` (Settings view showcasing checkboxes, radio buttons, sliders, text inputs, combo boxes, buttons). Render them into release screenshots with `.\scripts\take-screenshots.ps1 -Extension <key>`, producing `art/details.png` and `settings.png`. Playnite is never launched or captured directly for screenshots. Geometry, sample game (Eldritch Void), game list panel, metadata data and settings controls are fixed by `src/themes/AGENTS.md` -> Previews and screenshots; read it before writing either file.
10. **Build:** `.\scripts\build-theme.ps1 -Extension mytheme -Deploy -Restart [-DeployPath <Themes folder>]` (auto-sets active theme and starts/restarts Playnite). Warns about required shared keys still missing.
11. **Finish:** `info/icon.png` (512x512, `.\scripts\render-addon-icon.ps1 -Svg logo.svg -Extension <key>`, default orange mark: never pass `-Color`, all tiles share it), database listing `info/danitesler_<key>.yaml`, `AGENTS.md` in the section order of `src/themes/AGENTS.md` -> Per-theme notes (only what differs from the shared anatomy), then `.\scripts\validate-extension.ps1 -Extension mytheme -Mode Package`. Check in ThemeModifier that palette edits (Editor tab) and shared brushes (Edit constants) recolor the restyled controls.

## Token-only change (sibling dark theme, brand swap)

Edit values in `tokens.css`, keep names, rebuild. A missing token gets a `?fallback` in the template. Keys never change.

## Restyle one control

Edit or add `src/themes/<Theme>/src/<Default path>.xaml`: start from Playnite's Default file, keep part names, include only the styles you change. Colors: palette brush if the design uses that key's token for the role, else a shared brush (`{DynamicResource SelectedBrush}`); a brush the theme lacks gets one template line with its token; a role the vocabulary lacks is added to `theme-keys.json` first. Spacing from the theme's `Common.xaml` keys. Brushes only, never `*Color`.

## Playnite update

`.\scripts\update-playnite-theme-api.ps1 -PlayniteSource <checkout> -PlayniteVersion <tag>`, then diff the Default theme against every file each theme ships.

## Reading build errors

| Message | Fix |
|---------|-----|
| `is not a Playnite Desktop theme file` | Path/name differs from Default's (case-insensitive). Rename or merge into the right file. |
| `defines 'X', which is neither a Playnite key nor a shared key` | Use the role's key from `theme-keys.json`; new role -> add the entry there. Design-system names belong in `tokens.css`. |
| `defines 'X' as ...; theme-keys.json lists it as ...` | Wrong resource type for that key. |
| `reads the Color 'X'` | Use the brush. Gradient: brush fill + gradient `OpacityMask`. |
| `Required shared keys not defined yet` (warning) / `missing` (validate) | Define the vocabulary's `required` entries. |
| `uses {StaticResource X}, but 'X' only exists in another theme file` | Switch to `DynamicResource`. |
| `references unknown resource 'X'` | Typo, or key missing from this Playnite version / the template. |
| `Template rendering failed` (file:line key) | Token missing from `tokens.css`, `{{TODO}}` left, or translucent surface: add token or fallback. |
| `still contains an unrendered {{placeholder}}` | Braces in a comment or malformed placeholder. |
| `ThemeApiVersion ... will not load` | Declared API newer than snapshot's Playnite, or major differs. |
| `An XML comment cannot contain '--'` | A comment mentions a CSS variable (`--name`); reword. |

## Builds but looks wrong in Playnite

- Reverts to Default: XAML threw at load. Check `%AppData%\Playnite\playnite.log` (portable: next to `Playnite.exe`) for file and line.
- Playnite crashes or never finishes starting after a deploy: an unknown XAML member on an element (the build does not validate property names). Check the log tail for `XamlParseException: Cannot set unknown member '...'` — it names the bad attribute. Fix it in the theme source, rebuild, redeploy, restart.
- A control ignores tokens: its Default template hard-codes a color or reads a Playnite key; override that style.
- No change visible: themes load at startup only; restart after `-Deploy`.

