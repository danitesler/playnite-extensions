---
name: playnite-theme-dev
description: Develop, restyle, and debug Playnite WPF themes in this repo. Use for new themes, tokens, XAML controls, ThemeModifier, HTML previews, game state indicators (running, installing, favorite), and theme build or load failures.
---

# Playnite theme development

Read [the shared theme rules](../../../src/themes/AGENTS.md) and the affected theme's `AGENTS.md`. Use the section that matches the task.

| Task | Guide |
| --- | --- |
| Create a theme | [New theme workflow](../../../docs/themes/new-theme.md) and [creative direction](../../../docs/themes/creative-direction.md) |
| Retrofit motion and effects | [Interactive layer retrofit](../../../docs/themes/theme-maintenance.md#retrofit-the-interactive-layer-into-an-existing-theme) |
| Change tokens or restyle a control | [Token changes](../../../docs/themes/theme-maintenance.md#token-only-change-sibling-dark-theme-brand-swap), [control restyles](../../../docs/themes/theme-maintenance.md#restyle-one-control), and [XAML reference](../../../docs/themes/reference.md) |
| Fix the top bar or search | [Top bar and search rules](../../../docs/themes/reference.md#top-bar-layout-and-search) and the regression commands there |
| Fix Steam screenshot loading | [Steam screenshots](../../../docs/themes/reference.md#steam-screenshots) and `pwsh -STA -File tests/wpf/SteamScreenshotsRegressionTests.ps1` |
| Change the Settings screen or HTML previews | [Settings screens](../../../docs/themes/settings-screens.md), [preview authoring](../../../docs/themes/previews.md), and [preview checklist](../../../docs/themes/theme-preview-review.md) |
| Game art behind the window (window background setting) | [Window background checklist](../../../docs/themes/theme-maintenance.md#window-background-game-art-behind-the-whole-window) and the rules in [reference.md](../../../docs/themes/reference.md) |
| Diagnose build or load failures | [Theme maintenance](../../../docs/themes/theme-maintenance.md#reading-build-errors) |
| Patch multiple themes | [Theme patch workflow](../../../docs/themes/theme-patch-workflow.md) |
| Running or launching game mark (rows, covers, list view, Play cell) | [Running game indicator](../../../docs/themes/reference.md#running-game-indicator), the sweep / idle recipe and kit in [running-motion.md](../../../docs/themes/running-motion.md), `pwsh -STA -File tests/wpf/RunningIndicatorRegressionTests.ps1 -Keys <key>` and `pwsh -STA -File tests/wpf/RunningMotionFrames.ps1 -Keys <key> -OutDir <scratch>` |
| Mark another game state (installing, uninstalling, favorite, hidden, ...) | [Game state indicators](../../../docs/themes/reference.md#game-state-indicators-any-new-state), built on the running indicator |
| Generate brush, grain, bloom, or pattern sprites | Optional `art/sprites.py` (`Pillow` + `NumPy`) pattern below and [Generated graphic assets](../../../docs/themes/new-theme.md) |

After every change, redeploy and restart Playnite with `-Launch` and leave it open as the active, foreground window, not minimized (root `AGENTS.md`, Redeploy and show it after every change).

Validate the affected key with `pwsh scripts/validate-extension.ps1 -Extension <key>`. Finish source changes with `pwsh scripts/build-theme.ps1 -Extension <key>`. On local Windows that deploys the theme and restarts Playnite if it was running. Use `-NoDeploy` for worker builds. The coordinator owns live deployment.

State indicator rules that keep coming back (details in [Running game indicator](../../../docs/themes/reference.md#running-game-indicator)):

- **The whole item, clearly.** A live state (running, launching, installing) frames and tints the whole row, cover and game page button in the item's real shape, breathing about 0.65 to 1, with the theme's own motif on top. A faint edge mark alone was rejected as too subtle. Persistent attributes (favorite, hidden) get a static mark only.
- **Its own colour and layer.** A dedicated `<State>IndicatorBrush` that selection, hover and the filter mark never use; a layer above hover and selected, below content, untouched by their triggers, so a selected item shows both.
- **Above selection, in the real shape.** Draw the state layer after every selection and hover layer (outline, plate, brackets, marks) and inset its frame where both outline the same edge (covers 4px), or selecting the item hides it. Copy the item's real geometry (radius, chamfer, slant, arrow slab, cut corner, Path data) into the frame and tint; a square overlay on a shaped item looks like it changed shape.
- **The RUNNING button is Play's button, in a different colour.** `PART_ButtonContextAction` uses `Style="{DynamicResource PlayButton}" Tag="ContextAction"`, `PlayButton` hides its play glyph or prompt on that Tag, and while launching or running the plate fills with `RunningIndicatorBrush`. That colour is never Play's colour and never selection, hover or the filter mark. A near neighbour (yellow on an orange Play, a lighter green on a green Play) does not count. The overlay copies the plate's geometry; a rectangle laid over a slanted or cut plate paints a tint outside the plate.
- **Rows: 2px frame with a dark keyline inside**, so it reads on dark rows and on bright selected fills; list view rows use the theme's own selection fill.
- **Launching is progress, running is idle.** Launching on the button, the details row, the list row and the cover is a sweep in the item's own shape: a `RunningScan` band (a copy of the wash shape under a three-stop gradient `OpacityMask` whose named `GradientStop` offsets travel), a foot line filling (`ScaleX`) and the theme's mark reacting as the band lands; 1.4-2s per loop with a short rest, never a blink or a stepped keyframe. Running is a quiet idle: the frame breathes 0.7 to 1 and the mark idles on a 2.4-4s cycle, the foot line stays full. Make each theme's sweep its own (band profile, progress read, foot, mark, timing; levers and the XAML kit in [running-motion.md](../../../docs/themes/running-motion.md)); a launching storyboard that only pulses opacity fails the validator.
- **The Play plate keeps its shape and a readable label.** The plate is a solid `RunningIndicatorBrush` fill; a `ScrimBrush` copy of the plate shape (`RunningBreath`) darkens it (0.5 launching, 0.22-0.42 breathing running) and a `RunningScan` copy sweeps over it, both under the label, which stays opaque at 4.5:1 or better (3:1 floor for large bold labels). Never fade the plate: the page behind it would set the contrast.
- **Running hover is Cancel, and only on the button.** One `MultiDataTrigger` on `{Binding IsRunning}` and `{Binding IsMouseOver, RelativeSource={RelativeSource Self}}` shows `{DynamicResource LOCCancelLabel}` (and hides the Running label); the fill gets a second scrim (`RunningHoverDim`, faded in, below the label). **Never `RelativeSource TemplatedParent`**: the button lives in the game page's template, so that is the page's pointer state and Cancel showed with the pointer anywhere on the page. Cancel never shows while launching or idle. Collapse the idle hover plate while launching or running.
- **The mark never overlaps the label.** The mark gets its own strip: on the button `PlayContent` sits in `PlayRoom` and the launching / running triggers pad it (and `CancelLabel`) by the mark's footprint; on rows the presenter sits in `RowRoom` padded the same way, with a `RunningMarkPlate` gradient strip behind the mark. The Cancel trigger hides `PlayContent` (`Hidden`, never `Collapsed`, or the button resizes on hover). Size the strip from `pwsh -STA -File tests/wpf/RunningLabelOverlapRegressionTests.ps1 -Keys <key> -Report <csv>` (`NeedLeft` / `NeedRight`), never from one English string. Details in [running-motion.md](../../../docs/themes/running-motion.md#label-and-mark-never-overlap).
- **Look at it.** Run `pwsh -STA -File tests/wpf/RunningMotionFrames.ps1 -Keys <key> -OutDir <scratch>` and read `<key>-motion.png`: launching frames every 200ms (one band crossing), running frames, selected variants, the button under hover, and the label's worst-frame contrast. The validator enforces layer order, progress motion, the Cancel binding and the frame and tint.

Top bar progress rules that keep coming back (the global loading bar, `PART_ProgressGlobal` in `Views/TopPanel.xaml`):

- **The label is never tight.** The task text ("Importing Epic games...") is drawn over the bar, so give it room: at least 12px of side margin on `PART_TextProgressText` and a bar tall enough that the text does not touch the track edges (10-12px, not 6-8). Check a long label.
- **Make the bar taller from the top bar, not the control.** The shared `ProgressBar` template takes its height from `Height` with an 8px `MinHeight` (`Height="{TemplateBinding Height}"`), so one `Height="12"` on `PART_ProgressGlobal` changes only that bar; dialogs keep the standard 8px.

Settings window rules that keep coming back (details in [Settings screens](../../../docs/themes/settings-screens.md)):

- **No stray title text.** If the title band draws its own title and hides `PART_TextTitle`, put `PART_TextTitle` in a `Visibility="Collapsed"` parent. Collapsed on the element alone is not enough: Playnite makes it visible when a window has a Title and it draws bare text at the band's top-left. Check ThemeModifier Settings and Settings. The validator fails this.
- **Minimal section list, not boxed.** Settings and Add-ons section rows are bare 28px lines: no idle plate, outline or border; a soft hover wash, and a selected row with a held wash, a 2px accent bar and a brighter label, all opacity-animated. Keep the same restraint for any side panel or list.

Generated sprites and textures (optional — use when flat fills or vector `Path`s look thin next to the reference):

- **Preferred stack:** Python with `Pillow` (`PIL`) and `NumPy` in `art/sprites.py`, driven by a **fixed random seed** so regenerating `src/Images/fx/*.png` is bit-reproducible. Examples: `Inkbolt`, `Bloodpetal`, `GuidingWind`.
- **White-mask RGBA format:** render theme-colored sprites (dry-brush strokes, paper grain, lattices, streaks, blooms) as pure white (`255, 255, 255`) with varying alpha (`0..255`). Color them in XAML via `Fill="{DynamicResource ...Brush}"` + `OpacityMask` (`ImageBrush`) and in HTML previews via `-webkit-mask` / `-webkit-mask-box-image` (`var(--token)`), so ThemeModifier recolors every effect automatically.
- **Review before integrating:** save a dark-backed contact sheet (e.g. `art/fx-sheet.png` or scratch output) and inspect it visually before wiring masks into previews and XAML. For 9-slice plates, keep cap/edge pixel bounds aligned with `InkPlateTemplate`/`GlowFrameTemplate` `Viewbox` coordinates.

