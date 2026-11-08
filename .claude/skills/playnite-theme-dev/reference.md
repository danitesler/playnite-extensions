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
4. Two values for one role in different controls: the main control takes the role's key; the other reuses the key of the token it shares (Primo's pressed `Button` uses `HoverBrush`; its pressed `RepeatButton` uses `ButtonPressedBackgroundBrush`).
5. A role not in the vocabulary: add it to `theme-keys.json` first (key, type, group, one-line description), then use it. Never invent a key inside a theme.

**Naming** (new vocabulary entries): `<Control>[<Variant>][<State>]<Part><Type>` with Playnite's control names (`Button`, `ToggleButton`, `ComboBox`, `ListBox`, `GroupBox`, `SidebarItem`, `TopPanel`, `Tooltip`), never a design system's component names (ActionList, Card, AppBar, MenuPopover). General roles drop the control (`SelectedBrush`, `FocusBrush`); a plain fill drops the part (`SliderTrackBrush`, `MenuSeparatorBrush`). Spacing `<Control>Padding`; radii `ControlCornerRadius` (medium) and `CornerRadiusSmall`/`Large`/`XLarge`/`Full`; icons `Icon<Role>` drawn by `IconTemplate`; styles by what they style (`FocusVisual`, `BareTextBox`, `MainWindowButton`, `MainMenuButton`, `TopPanelSearchBox`, `SliderThumb`, `ScrollBarThumb`).

**Each theme keeps its own design.** Values, radii, spacing, shell, icon set and component shapes come from the design system's published spec, pinned to a version in its `AGENTS.md`; only names are shared. Map by role, not by color. Write the component spec in each file's header comment (component, tokens, sizes). A design system is more than colors: spacing (`Common.xaml`), shell, icons (`Media.xaml`), component shapes. Where WPF/Playnite can't follow the spec, list it under "Deviations" in `AGENTS.md`.

## ThemeModifier

Lacro59's ThemeModifier recolors a theme by **replacing Playnite's palette brushes** (`TextBrush`, `GlyphBrush`, `HoverBrush`, `ButtonBackgroundBrush`, `PopupBackgroundBrush`, ... 24 in all) in application resources, and edits the theme's own constants listed in `thememodifier.yaml`.

- Only `{DynamicResource <Brush>}` references follow a replaced brush. A `*Color` key, or a second key holding the same color, does not. Theme XAML reads **brushes only**; the build fails on a `Color` reference outside `Constants.xaml`. Gradient: fill with the brush, put the gradient in an `OpacityMask` (see any theme's indeterminate `ProgressBar`).
- Sanctioned exception: `HtmlTextView.HtmlForeground` and `LinkForeground` (game description) are Color-typed with a black default, so they read `TextColor`/`GlyphColor`; the check allows exactly those two attributes, and brush edits do not reach that text.
- Define palette and shared brushes as plain `SolidColorBrush` entries in the template. A brush pointing at another brush can't follow an edit.
- `build-theme.ps1` generates `thememodifier.yaml` next to `theme.yaml`: every shared brush the theme defines (plus sized doubles such as `IconSize`), grouped and labelled from `theme-keys.json`. Palette brushes in `playnitePaletteConstants` (window background `WindowBackgourndBrush`) lead their group. Don't hand-edit; change descriptions in `theme-keys.json`.
- **Banner height ("Banner height (0 = off)")**: Defined as `GameBannerHeight` in `Common.xaml` (ranged `0,600` in `thememodifier.yaml`). ThemeModifier adjusts it dynamically: setting to `0` turns off/collapses the banner, decreasing shifts top elements closer to the top, and increasing shifts them down. The spacer MUST scale proportionally with `HeroArt.ActualHeight` via `{StaticResource MathConverter}` (`ConverterParameter='x * <DefaultSpacer> / <DefaultBanner>'`) and an `ActualHeight == 0` trigger; never bind spacer `Height` directly to `{DynamicResource GameBannerHeight}`.

## How Playnite loads a theme

Source: `source/Playnite/Themes.cs` (`ThemeManager.ApplyTheme`).
1. Only XAML whose relative path matches a file in Playnite's **Default** theme loads (`scripts/data/playnite-theme-api.json`); anything else is ignored.
2. Each theme file is first parsed **on its own**, with only Default resources present.
3. Files merge in pairs, `Default/A.xaml` then `Theme/A.xaml`, in API order: `Constants.xaml`, `Common.xaml`, `Media.xaml`, `DefaultControls/*`, `CustomControls/*`, `DerivedStyles/*`, `Views/*`. The later definition of a key wins.
4. `Toolbox pack` skips any `Fonts/` folder and any file identical to the Default copy.

## Hard rules (Playnite fails silently otherwise)

- **Statistics page = compact cards.** The `GroupBox` template (and any template it uses) must never report a large desired width (Path/Line wider than ~200px, `Line Stretch="Fill"` with no Width, fixed Width/MinWidth >= 200); draw spanning decoration inside a `Canvas` in a clipped `Grid`. Reference: Ayywi `GroupBox.xaml`. See `AGENTS.md` -> Statistics Page.
- **ComboBox chevron room.** Wrap `ContentSite` in a `Border Margin="0,0,R,0"` (R = chevron width + its margin + 8) or use separate columns; otherwise short values run under the dropdown arrow. See `AGENTS.md` -> ComboBox chevron room.
- **Game page action buttons.** More and Edit beside Play are icon-only, the same fixed square size, each with a `ToolTip` and Edit is always visible, never hover-only. See `AGENTS.md` -> Game page action buttons.
- Theme files are **overlays**: only restyled keys. Keep every `PART_*` and every part Playnite code dereferences (`SearchBox` needs `PART_SeachIcon`, `PART_TextInpuText`, `PART_ClearTextIcon`). Start from the Default file at the snapshot's tag; change visuals/layout, not behavior.
- Theme keys via `DynamicResource`. `StaticResource` only for Playnite keys or keys defined earlier in the same file.
- `StaticResource {x:Type ContextMenu}` in a later file resolves to the theme's own style (files merge one by one): use `BasedOn` that way instead of copying templates (SliderEx, GameMenu, GameGroupMenu, TrayContextMenu, TopPanelMenu).
- A Default style that references a sibling in its own file with `StaticResource`: redefine both (`Separator` + `MenuItem.SeparatorStyleKey`).
- `BaseStyle` already sets Opacity 0.5 when disabled; styles based on it must not add their own `IsEnabled` opacity trigger (0.25).
- Focus: buttons, toggles, checkboxes, tabs use a keyed `FocusVisualStyle` (`FocusVisual`; keyboard only). Text inputs draw focus on `IsKeyboardFocusWithin`. No `IsKeyboardFocused` border triggers on buttons (mouse clicks focus too).
- No hard-coded colors in theme XAML: add a token, a template line, and a vocabulary entry if the role is new.
- **Control Corner Radii**: In WPF, `CornerRadiusFull` (9999/10000) clamps X and Y radii independently to `width/2` and `height/2`, distorting any element where `width != height` into a stretched oval/ellipse instead of a true capsule. Therefore, never use `CornerRadiusFull` on base control styles (`Button`, `RepeatButton`, `ToggleButton`, `SearchBox`, `TabControl`, menu items), action buttons (`PlayButton`), or metadata tag chips (`PropertyItemButton`). All of these must use `ControlCornerRadius` (or `CornerRadiusSmall`). Thin tracks and progress fills (`Slider` tracks, `ProgressBar`, tab indicator lines, `ScrollBarThumb`) must also NEVER use `CornerRadiusFull` (which turns the track into an elongated needle/spindle); always specify an explicit numeric radius equal to half the track thickness (e.g. `CornerRadius="2"` for a 4px slider track, `CornerRadius="3"` for a 6px progress bar, `CornerRadius="1.5"` for a 3px tab indicator, `CornerRadius="3"` for a 6px scrollbar thumb). `CornerRadiusFull` is strictly reserved for fixed 1:1 square elements where `Width == Height` (e.g. 16x16 notification badges, circular icon buttons). Never wrap dynamic toolbar collections (`PART_PanelMainItems`) in an outer pill container.
- **ThemeModifier icon buttons (fixed-width buttons)**: ThemeModifier hardcodes its edit pencil and restore X at `Width="41"` (editor XAML and constants code) in two fixed 41px columns, with no height, so the theme's `ButtonPadding` clips the glyph to a sliver. The base `Button` style adds a `Width == 41` trigger with `Padding="0"`, `HorizontalContentAlignment`/`VerticalContentAlignment` = `Center`, `MinWidth` 41, `MinHeight` 41 and `FontSize` 16: the buttons render as a small 41x41 square with a centred glyph and breathing room, and auto-width buttons keep their padding. `MinWidth` 41 keeps the square even when the theme sets a larger `MinWidth` (MUI-style buttons use 64, which would coerce the pair wider and overlap in `Edit constants`). `validate-extension.ps1` fails a theme that drops or mutates the trigger.
- Only XAML attributes that exist on that element in Playnite's Default files. The build checks keys, placeholders and file paths, but never validates property names, so an unknown member (e.g. `CharacterCasing` on a `TextBlock` — it exists only on text inputs) passes build and validate, then crashes Playnite at startup. Never hand-write an attribute from memory: grep the Default snapshot for it on that element first.
- Icon resources Playnite copies (`Media.xaml` menu icons such as `AddGameIcon`, `PlayIcon`) are rebuilt from a `TextBlock`'s glyph and font, so a vector there is lost. To use the design system's icons, make each key a `sys:String` theme-relative PNG path (loaded through `ThemeFile`), rendered by `scripts/render-icons.ps1` from the theme's `icons.json`. Vector icons elsewhere are `Icon<Role>` geometries through `IconTemplate`.
- Game overview (`Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml`): every `PART_*` is optional (null-checked) but a name may appear once. All themes follow one skeleton (banner, header, then two columns: Steam screenshots + description + notes on the left, metadata pane on the right; screenshots never span over the metadata) and put **every** metadata field in one pane of six collapsing groups; layout, part names, triggers: `src/themes/AGENTS.md` -> Game page. Banner spacer scales proportionally with `HeroArt.ActualHeight` via `{StaticResource MathConverter}` (`ConverterParameter='x * <DefaultSpacer> / <DefaultBanner>'`), preserving default title/gradient alignment while moving top elements up/down dynamically when Banner height (0 = off) changes in ThemeModifier (never bind spacer directly to `{DynamicResource GameBannerHeight}`). List values are Buttons styled from code with `{StaticResource PropertyItemButton}`, so `DerivedStyles/PropertyItemButton.xaml` is the only hook. `HtmlTextView` takes `Color`s (see ThemeModifier).
- View switches (`Views/TopPanel.xaml`): `TopPanelSwitchDetailsViewTemplate`, `TopPanelSwitchGridViewTemplate`, `TopPanelSwitchListViewTemplate` are icons only (`IconDetailsView` / `IconGridView` / `IconListView` through `IconTemplate` at `IconSize`). No text word labels; the item's `Title` is the `TopPanelItem` tooltip.
- Slider: set `Track.Thumb` last (Track stacks parts in the order set). `ScrollContentPresenter` clips: anything drawn outside an item needs the gutter as the panel's margin.
- No `DropShadowEffect` on popups or tiles; popups keep a 1px edge (WPF popups are layered windows). Wrap masked art (`OpacityMask`) in an element with `BitmapCache`, except art that sits behind an animated control (next rule).
- **No `OpacityMask` on art behind anything that animates** (the game page banner behind an animated Play button, library art behind animated top bar items). While a control animates, WPF repaints only the patch behind it; on a scaled display (125%, 150%) a masked image re-rendered for that patch blends its edges with transparent black and leaves dark rectangles at the animated layers' bounds that stay after the hover. Pixel snapping, removing `BitmapCache` and ending the animations do not fix it. Fade such art with a plain gradient rectangle on top that goes from `#00000000` to the page color, read from the page's own brush so ThemeModifier still applies: name the page root (`x:Name="PageRoot" Background="{DynamicResource GameOverviewBackgroundBrush}"`) and bind the last stop to `{Binding Background.Color, ElementName=PageRoot}` (Cloudbank's game page).
- No `--` inside XML comments, no `{{`/`}}` in template comments, no `Fonts/` folder.
- Keep `ThemeApiVersion` as low as the theme allows (2.9.0 = Playnite 10.45+). Major must match Playnite's.

## Effects and motion (glows, sprites, animation)

- **Generate, don't hand-draw.** Glow, lightning, texture and other effect art comes from a deterministic generator script kept in the theme's `art/` (Python + Pillow/numpy, or Node), never pixels drawn by hand or copied from the source game. Prefer handing the generator to an external coding agent: OpenAI Codex CLI (`codex exec -s workspace-write -C <theme folder> - < prompt.md`, attach references with `-i`), Antigravity CLI (`agy -p "<prompt>"`, `--add-dir <theme folder>`), or a similar tool. Give it measured specs, not adjectives: sizes, alpha profiles and falloff distances sampled from reference captures (see `RESEARCH.md`), seamless-tile and 9-slice requirements, a fixed seed, and a contact sheet (`art/fx-sheet.png`) to review. Then check its diff and its output yourself (hash the sprites it should not have touched, zoom the new ones) and send it back with measured feedback when a sprite misses ("alpha > 0.3 spans rows 15 to 22, too flat"). Cloudbank's `art/sprites.py` is the worked example.
- **Sprites are white masks.** PNG with RGB 255 and the effect in alpha. XAML fills a `Rectangle` with a theme brush and uses the sprite as `OpacityMask` (`ImageBrush ImageSource="{ThemeFile 'Images/fx/<name>.png'}"`), so ThemeModifier recolors every glow; previews use the same file through CSS `-webkit-mask` / `-webkit-mask-box-image`. Never bake color into a sprite.
- **Scalable glows** are 9-slice: one sprite, a 3x3 `Grid` of `Rectangle`s each masked by an `ImageBrush` with an absolute `Viewbox` on its slice (Cloudbank `GlowFrameTemplate`). Fixed corner cells only, so a GroupBox stays content-sized. The host sits at a negative margin equal to the bloom width.
- **No GIFs.** WPF's `Image` shows only the first GIF frame, and a GIF bakes in its colors. Animate with storyboards instead:
  - Fades: `Trigger.EnterActions` / `ExitActions` with `DoubleAnimation` on `Opacity` and an easing function (`QuadraticEase`), never setters on the animated properties, so leaving mid-fade does not snap.
  - Looping motion (crawling arcs, scanlines, flowing energy): a sprite tiled on a wide `Rectangle` inside a `Canvas` (no layout clip) inside a `Grid ClipToBounds="True"`, moved by a named `TranslateTransform` exactly one tile per loop (`RepeatBehavior="Forever"`). Do not animate transforms inside brushes (they can be frozen).
  - Flicker: `DoubleAnimationUsingKeyFrames` with `LinearDoubleKeyFrame`s on a wrapper's `Opacity`.
  - Stop loops on exit by starting finite animations on the same properties (default `SnapshotAndReplace`) and give exit animations `FillBehavior="Stop"` so no clock outlives the fade.
  - Give pressed its own layer (a plate that fades in) instead of reusing the hover layer, or leaving while pressed strands the hover state.
  - Show layers with `Visibility` keyframes at the start of the fade-in and hide them at the end of the fade-out.
- Check motion in Playnite at a scaled display (125% or 150%), hover in and out several times and look for leftovers around the control; HTML previews show only the end state.

## Interactive layer (required for new themes)

Recipes for the items listed in SKILL.md -> New theme -> Required interactive layer. Design each from the source; Cloudbank's files are the worked example of the mechanics, not of the look.

- **Play hover** (`DerivedStyles/PlayButton.xaml`): layers, bottom to top: a bloom (`GlowFrameTemplate` at -32, resting opacity 0.3 to 0.5), the plate, a hover plate in `PrimaryButtonHoverBackgroundBrush` at opacity 0, a pressed plate in `PrimaryButtonPressedBackgroundBrush` at opacity 0, the content, then any effect layer (arcs, sheen) at opacity 0 and `Visibility="Hidden"`. Enter: fade hover plate, bloom and effect in over about 0.2s; loops (crawl, flicker, shimmer) run only while hovered. Exit: fade back over about 0.35s, replace loops with finite glides, `FillBehavior="Stop"`. Press: fade the pressed plate in and out on its own trigger. No `Style.Triggers` setters on the background: the plates carry the color change.
- **Cover hover** (`DerivedStyles/GridViewItemStyle.xaml`): keep the selected look static (setters) and build hover from separate named layers (outline, bloom, marks) that animate. Draw everything inside the item's own spacing margin (`Margin="{Settings ItemSpacingMargin}"` grid, negative child margins no larger than the spacing). Set `Canvas.ZIndex` on hover so the bloom overlaps neighbours. A breathing loop goes on a wrapper's `Opacity`, not on the layer being faded.
- **Cover hover controls** (`DerivedStyles/GridViewItemTemplate.xaml`): start from Default, keep `PART_PanelHost`, `PART_ImageCover`, `PART_ButtonPlay`, `PART_ButtonInfo` and the empty-cover-name and darken-uninstalled triggers. Split the uninstalled darkening (static) from the hover shade (animated). Default sets the Play glyph from a `Content` character; set `Content` to an `Icon*` geometry instead (`IconDownload` for `IsInstalled = False`) and draw it through `IconTemplate`. Define `GridTileButton` in the same file, before use (`StaticResource`). Entrance: shade fades in, buttons rise about 10px and scale from about 0.86 to 1 with a small overshoot (`BackEase`), the second one 60ms later; exit reverses with `FillBehavior="Stop"` and hides the panel at the end with a `Visibility` keyframe. Cap the `Viewbox` (`MaxWidth`) so the buttons do not fill the whole cover. Outline draw-on effects use a fixed-size `Path` with `StrokeDashArray` equal to the perimeter in stroke widths and an animated `StrokeDashOffset`.
- **Empty game page** (`Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml`): the no-game condition is `{Binding Game, FallbackValue={x:Null}}` = `{x:Null}` (the fallback also covers a null DataContext). Hide the content panel with it, and show an empty-state `Grid` sized to `{Binding ViewportHeight, ElementName=PART_ScrollViewHost}` so it centres in the visible area. Text: `LOCErrorNoGameSelected` (themes cannot ship strings). Idle loops live in the element's own `Style` `DataTrigger` with `EnterActions` `BeginStoryboard x:Name="..."` and `ExitActions` `RemoveStoryboard`, so they stop when a game is selected. Any decorative addition next to Playnite data (title suffix, badges) needs a trigger that hides it when that data is empty.
- **Details scroll-host visibility:** set `Visibility="Visible"` directly on the details `ScrollViewer` named `PART_ScrollViewHost`, especially when it uses `Style="{DynamicResource DetailsScrollViewer}"`. Playnite's inherited style collapses that host when its DataContext is null, hiding every child including the empty state. Keep the empty state and selected-game content as sibling panels inside the visible host, with opposite no-game visibility triggers. Verify null DataContext as well as a non-null model with `Game = null`; test selected game -> grid -> details with selection cleared, and selecting a game again. Apply the empty-state recipe to both overview files and preserve it in any generator that writes them.
- **Generated assets for realism:** backgrounds, light, glows, ornaments and textures come from generator scripts (Effects and motion above). Prefer white masks filled with theme brushes; full-color art is only for non-themeable illustration and ships with its generator. Busy textures behind lists and covers read as noise in a real library: keep those layers solid or gradient and put texture where content is sparse (panels, headers, empty states).
- **Verify in Playnite**, not only in previews: hover Play, covers and the cover buttons repeatedly at 125% and 150% scaling, deselect the game to see the empty state, and check ThemeModifier recolors every animated layer.

## Motion by source type

Motion has a language per source. Pick the row, then measure the source (frame-step a capture, or read the motion tokens) before writing durations.

| Source | Play hover | Cover hover | Cover buttons | Empty page | Assets |
|--------|-----------|-------------|---------------|-----------|--------|
| Design system (Material, Fluent, shadcn, Chakra, Primer, ayywi) | Its own interactive states: state layer or elevation fade, ripple (Material), reveal highlight (Fluent), ring (shadcn, Chakra), 80-200 ms, its easing | Ring, elevation or scale 1.02, the system's focus/hover colour fading in; no ornament | Icon buttons of the system (round, rounded square, ghost) with its icon set, fade and 6-8 px rise | Its empty-state pattern: a quiet icon in a tinted circle or box, one line of text, no loops (or a slow 3 s fade) | None. Never generate glow sprites for a system that has no glow |
| Game menu with a signature effect (glow, sheen, ink, frost, rust, pixel) | The effect, animated in and out, looping only while hovered | Game's selection language animated (cursor, brackets, bevel flash, underline sweep, page-flip) | Buttons in the game's shapes and icon style | A game motif (empty slot, vault door, blank card, standby screen) with a slow idle | Generated from measured specs when the source has light or texture (reference.md -> Effects and motion); otherwise none |
| Pixel or retro game (Terraria, Minecraft, Fallout, Warcraft) | Frame swap: step the bevel or sprite in 2-3 steps (`DiscreteDoubleKeyFrame`), no smooth glows | Pixel-snapped outline pop or bounce | Pixel-art or bevelled square buttons | Sprite-style empty slot or terminal prompt blink | Pixel sprites from a generator at 1x, `RenderOptions.BitmapScalingMode="NearestNeighbor"` |

Always: fades, never snaps; loops only while visible; exit animations `FillBehavior="Stop"`; durations 120-350 ms unless the source is slower on purpose; no `DropShadowEffect`; no `OpacityMask` on art behind animated controls.

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
