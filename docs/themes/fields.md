# Fields: inputs and dropdowns

Every text field and every closed dropdown in a theme wears **one signature drawn from its source**, not "a dark box with a 1px border that changes colour". That covers `TextBox`, `PasswordBox` and the closed `ComboBox` (Settings, dialogs, the filter panel). Required for every new theme. In the first 87 themes the box was a rectangle (or pill) with a rim, and about a quarter of them shared a near-identical template, so a screenshot could not tell Hexfall's field from Emberline's. Worked examples: **Tumbleweed**, **Cold Seat**, **Hexfall**, **Tatterspire**, **Runeskald**, **Vice Dusk**.

The popup list is a menu and follows [Menus](menus.md); this page is about the field you click and type in.

## Where it lives

| File | What |
|------|------|
| `DefaultControls/TextBox.xaml` | The field template, the shared signature template (below) and `BareTextBox` (chromeless, for hosts that draw their own frame: search box, editable dropdown) |
| `DefaultControls/PasswordBox.xaml` | The same signature over the same box |
| `DefaultControls/ComboBox.xaml` | The closed state: same signature, plus the arrow's own design (cap, hex cell, keycap, wedge) |
| `CustomControls/SearchBox.xaml` | Keeps its own shell; give it the same signature only if the source's search is a field |

## One signature, shared

Write the signature once as a `Local<Name>FieldTemplate` (a `ControlTemplate` for `Control`) in `TextBox.xaml` and host it in all three fields with `x:Name="FieldOverlay"`:

```xml
<Control x:Name="FieldOverlay" Template="{DynamicResource LocalNeonTubeFieldTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
```

Put it in the field's root `Grid` next to the field's `Border` (wrap the `Border` in a `Grid` if it is the root). The template reads hover from the nearest `Control` above it, and reads the active/focus state from its own `Tag="Active"`:

```xml
<DataTrigger Binding="{Binding IsMouseOver, RelativeSource={RelativeSource AncestorType={x:Type Control}}}" Value="True">
<Trigger Property="Tag" Value="Active">
```

Each host decides when `FieldOverlay` is active in its own `ControlTemplate.Triggers`:
- **`TextBox` and `PasswordBox`:** set `TargetName="FieldOverlay" Property="Tag" Value="Active"` on `<Trigger Property="IsKeyboardFocusWithin" Value="True">`.
- **`ComboBox`:** set `TargetName="FieldOverlay" Property="Tag" Value="Active"` ONLY on `<Trigger Property="IsDropDownOpen" Value="True">` (and a `<MultiTrigger>` for `IsEditable="True"` + `IsKeyboardFocusWithin="True"`). **Never** trigger a `ComboBox` active/focus state on unconditional `IsKeyboardFocusWithin` or `IsFocused`: in WPF, selecting an item closes the popup (`IsDropDownOpen="False"`) while leaving keyboard focus on the `ComboBox`, so an unconditional focus trigger leaves the closed dropdown stuck looking active after selection. The same rule applies to `ComboBox`'s own border/accent triggers and to Playnite's list dropdowns (`ComboBoxList`, `FilterSelectionBox` — trigger on the toggle's `IsChecked="True"`, never `IsKeyboardFocusWithin`).

Animate from `Trigger.EnterActions` / `ExitActions` with a named `BeginStoryboard` and a `RemoveStoryboard` on exit. A `ComboBox` that builds its border inside the toggle button's template (Vice Dusk, Vesperglass) gets the overlay in the combo's own root `Grid`, not inside the toggle.

## Unique: pick a signature on each lever

A field is the theme's own when a player would know it with the text blurred. Write the choices in the template's header comment.

| Lever | What it can be (examples, not a menu to copy) |
|-------|-----------------------------------------------|
| **Edge** | The source's frame motif, not a rectangle: forged iron band with rivets and worn texture, torn paper edge, hex or chamfered brackets, fork-ended silver rail, brush stroke, ink offset plate, gauge ticks, neon tube, pencil dots |
| **Rest mark** | One small mark that is there before any interaction: a stub of paint, two corner brackets, rivets, end ticks, a diamond, a fork |
| **Hover** | The mark lifts a step: a stub that grows, a band that lights, a rail that brightens. Never only a border colour change |
| **Focus** | The source's "selected" cue, played once (120-280 ms): a coat of paint wiped across, brackets locking on, a tube striking with a flicker, a star flare, a slanted tab sliding in, rime creeping up. Focus must be unmistakable at a glance |
| **Arrow / cap** (`ComboBox`) | Its own object: a prompt keycap, a hex cell, a wedge column, a plate with a rule. Lit on hover, in the "pressed" colour while the list is open (and turned, if the arrow is a chevron) |
| **Check and radio** | The same material as the field: a painted X, a reticle with ticks, a notched octagon, a stamped diamond. Not Playnite's tick on a square |

Two themes never share a field template. The check is the same as for menus: render both and compare with the labels blurred.

## Hard rules (each one cost a rebuild)

- **No desired size.** The signature is an overlay: it must not change the field's height or width. A `Path` or `Line` with `Stretch="Fill"` reports its geometry's natural size to the layout and can make a 32px field 160px tall (found in Medallion). For anything that has to stretch, use a `Rectangle` (no intrinsic size) whose `OpacityMask` is a `DrawingBrush` with the shape, or give the `Path` a fixed `Height`. Fixed-size paths (a 7x14 tab, a 5px diamond) are fine.
- **Keep `ControlHeight` (32; 28 in the filter panel).** Frames that eat padding (an iron band, brackets) are drawn over the 4px vertical padding, not added to it. `InputPadding` stays as it is; do not add `Margin="{TemplateBinding Padding}"` to the content host.
- **Never recolour only the border.** A hover or focus that only swaps `BorderBrush` is the stock template; the signature must change.
- **Every brush through `{DynamicResource}`** and only keys the theme defines. `FrameHoverBrush` is not in every theme (Slipstream failed validation on it); use `InputHoverBorderBrush`, `NormalBorderBrush`, `GlyphBrush`, `FocusBrush`, `TextBrush`, `TextBrushDarker` when unsure. ThemeModifier recolours the signature that way.
- **Sprites are masks or tiled `ImageBrush` fills**, as in the rest of the theme (`reference.md` -> Effects and motion). Prefer vector shapes drawn in XAML for 2-8px marks: a sprite stretched to a 2px strip turns to noise (Tatterspire's tear sprite looked like a bar until it became a drawn zigzag).
- **No `DropShadowEffect`**, no looping animation. One-shot enter and exit only.
- **State on the overlay's own layers.** Rest layers `Visibility="Collapsed"` or `Opacity="0"` for the focus-only ones.
- **The inner text box stays bare.** `BareTextBox` sets its own chromeless `Template` (never only `BasedOn` the field style), and the dropdown's `PART_EditableTextBox` uses `Style="{DynamicResource BareTextBox}"`. Otherwise the editable dropdown draws the signature twice, once inside itself (found in NightCity).
- **Fixed-size marks clear the text inset.** A mark on the left edge (tab, stud, bar) stays inside the `InputPadding` left inset and is vertically centred or kept short, so it never touches the first letter or crosses the lines of a multi-line box (found in Payload).
- **Check the theme's `ScrollViewer`.** Text boxes get `InputPadding` through the `ScrollViewer` template's `ScrollContentPresenter Margin="{TemplateBinding Padding}"`. A theme whose template drops it shows text 2px from the edge (found in Henchwork).
- **Dotted and dashed 1px strokes need `RenderOptions.EdgeMode="Aliased"`.** A `StrokeDashArray="1 1"` rectangle at a half-pixel position blurs into a solid grey line (found in Greenfield XP's dotted focus rectangle). For a dashed line that stretches, prefer a `Rectangle` with a tiled `DrawingBrush` mask (Checkpost).
- **Dropdowns clear their active state on close.** Never bind a `ComboBox` (or `ComboBoxList` / `FilterSelectionBox`) active/focus state to unconditional `IsKeyboardFocusWithin` or `IsFocused`, and never bind a shared `Local<Name>FieldTemplate` directly to `AncestorType={x:Type Control}` `IsKeyboardFocusWithin`. Drive the overlay via `FieldOverlay` `Tag="Active"` (`IsDropDownOpen="True"` + editable-only `IsKeyboardFocusWithin="True"` for `ComboBox`; `IsKeyboardFocusWithin="True"` for `TextBox`/`PasswordBox`). `validate-extension.ps1` enforces this (`Test-DropdownFocusTrigger`).
- **Those `FieldOverlay` triggers go in the `ComboBox` template's own `ControlTemplate.Triggers`**, never the inner `ToggleButton` template's (the first `</ControlTemplate.Triggers>` in the file). There `FieldOverlay` is out of scope and `IsDropDownOpen` does not exist, and Playnite crashes the first time any dropdown is drawn, so Settings will not open (found in 21 themes after a scripted rollout, Ancient first). `Test-WpfRuntimeTraps` fails it.
- **Ornaments outside the box** (a star bloom, brackets that close in from 7px outside) need an ancestor that does not clip. Check the Settings window and a game's edit dialog.

## Dropdown value room

In the closed `ComboBox` the value (`ContentSite`) and the arrow share a cell and the box is only as wide as its value. Reserving just the arrow's width leaves the value glued to the arrow (Swallowtail, Canister, Foldcraft and Henchwork all did):

```
right margin of ContentSite and PART_EditableTextBox  =  arrow cap / column width  +  the value's left inset
```

So with a 30px wedge column and a 10px left inset the right margin is 40: the gap before the arrow equals the gap after the left edge. `validate-extension.ps1` only fails below 12px; the rule above is the design requirement. Check a short value ("English", "Minimize") and a long one in Settings.

## Rolling it out to a theme

1. Read the theme's `AGENTS.md`, `BRIEF.md` and the source (the game's options screen, its text inputs, its pickers). Decide each lever above and write it in the template header comment.
2. Write `Local<Name>FieldTemplate` in `TextBox.xaml`; host it in `TextBox`, `PasswordBox` and `ComboBox`; design the combo arrow.
3. Render the controls in real WPF: merge the theme's XAML into an `Application` and snapshot a sample with `RenderTargetBitmap` from 32-bit Windows PowerShell (`C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe -STA`; Playnite's assemblies are x86). The sample holds a text box, password box, closed and editable combo, disabled and multi-line fields, check and radio. Look at it enlarged. A static render shows only the rest state. To see focus, render a scratch copy of the theme's `src` with `Tag="Active"` set on each `FieldOverlay`: every field then draws its active state, and the harness's 700ms wait lets the enter animation finish. Hover is still unchecked: read its triggers.
4. `validate-extension.ps1 -Extension <key>`, then `build-theme.ps1 -Extension <key> -Launch`.
5. Re-render the previews: `preview-settings.html` shows the fields, so draw the signature there too (`docs/themes/previews.md`).
