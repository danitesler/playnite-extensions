# Main menu mark (every theme, new ones included)

The main menu button (`PART_ElemMainMenu` in `Views/Sidebar.xaml`, and again in `Views/TopPanel.xaml` for when the sidebar is hidden) never shows Playnite's stock hamburger or a static `IconMainMenu` glyph. Each theme draws **its own mark**, built from that theme's source (its shapes, materials, motifs and motion personality), and animates it on **hover** and while the **menu is open**. No two themes may share a mark or a motion idea: the mark is the theme's signature, so a copy of another theme's hexagon, bars or timing fails review.

Reference implementation: Cloudbank `LocalMainMenuMarkTemplate` in `src/themes/Cloudbank/src/Common.xaml` (an upgrade-slot hexagon with memory pips: hover traces an outline and lights the rows, open turns the slot, collapses the rows into a lit node). Copy its *mechanics*, never its look.

## Requirements

1. **Custom mark**: vector XAML (`Path`, `Canvas`, `Rectangle`, ...) drawn from the theme's own motif; fixed size inside the button (typically 24-30px in the 44x52 host; the top bar host is 32x32). Brushes only, from the theme's keys; sized so it reads as a menu affordance (a stack, grid, rows, a dial, a door, a cap, whatever the source supplies) at a glance.
2. **Rest state**: finished and calm; works at 100% and 175% scale.
3. **Hover** (`IsMouseOver` on the template's `Control`): a motion that fits the theme (trace, ignite, tick, slide, bloom, flip, shuffle, spark). 0.15-0.5s, eased, reverses on exit (`FillBehavior="Stop"` exit storyboard).
4. **Open** (`{Binding ContextMenu.IsOpen, RelativeSource={RelativeSource AncestorType={x:Type Border}}}` = True): Playnite sets a `ContextMenu` on `PART_ElemMainMenu`, so the nearest `Border` carries the state. A clearly different "engaged" pose that can idle (slow breathing, 1.5-4s, `RepeatBehavior="Forever"`) until the menu closes, with an exit storyboard that covers **every** property the enter storyboard animates.
5. **Separate elements per state**: hover and open never animate the same element or property, so they layer without fighting.
6. **One shared template**: define it in `Common.xaml` as a `Local<Name>MenuMarkTemplate` (`ControlTemplate` for `Control`; keys must start with `Local`) and use it in both `Sidebar.xaml` and `TopPanel.xaml` as `<Control Template="{DynamicResource Local...}" Focusable="False" IsTabStop="False" />`. Root `Grid` with `Background="Transparent"` so the whole button hovers. Keep `PART_ElemMainMenu`, its size, cursor and `WindowChrome.IsHitTestVisibleInChrome`.
7. **Position variants**: keep working for sidebar left, right, top and bottom (the host is 44x44 at top and bottom).
8. **Window art on**: the mark and any halo stay legible when the rail is transparent.
9. Keep `IconMainMenu` defined in `Media.xaml` (other files and tests use the key); it is just no longer drawn on this button.

## WPF traps (found live)

- Do not fade a masked halo layer in and out on hover: on a scaled display WPF repaints only a patch around the animated neighbour and leaves a faint box. Prefer animating transforms, dash offsets and the opacity of small unmasked shapes; keep halos static or breathing on the open state only, and use gradient masks, not image masks, for them.
- Animate `RenderTransform` only through named transforms inside the `ControlTemplate`; never from `Style.Triggers`.
- Looping storyboards: the exit storyboard (`BeginStoryboard` in `ExitActions`, default hand-off replaces the enter clock) must animate each property the loop touches, or the loop keeps running.
- `ScaleTransform` rest value 0.2 rather than 0 for parts that pop in.
- Start-up crashes only show in the live app: build with `-Launch` and check `playnite.log`.

## Verify (live, mandatory)

After `build-theme.ps1 -Extension <key> -Launch`, with Playnite visible, hover and open the real button and capture frames: copy the probe pattern from `.docs-local/tool--playnite-window-capture.ps1` (PrintWindow, DPI aware) and move the cursor onto the button (check `WindowFromPoint` belongs to Playnite first), click once, press Escape. Look at rest, hover (+60 ms, +260 ms, settled), open (+100 ms, +350 ms, +1 s), close. Also run `powershell.exe -NoProfile -STA -File tests/wpf/TopPanelLayoutRegressionTests.ps1 -Keys <key>` and `validate-extension.ps1 -Extension <key>`.

Update the theme's `art/preview-details.html` so the rail shows the new rest mark, re-render `screenshot-details.png` (`scripts/take-screenshots.ps1 -Extension <key>`), and record the mark and its motion in the theme's `AGENTS.md` Shell row.
