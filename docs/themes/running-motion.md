# Running and launching motion

How a theme shows **LAUNCHING** (the game is starting) and **RUNNING** (the game is live) on its four surfaces. The contract (element names, triggers, shapes, selected-item visibility) is in [reference.md](reference.md) -> Running game indicator; this page is the design recipe and the XAML kit. Worked example: **Tumbleweed** (`src/themes/Tumbleweed/src/DerivedStyles/{DetailsViewItemStyle,GridViewItemStyle,PlayButton}.xaml`, `DefaultControls/ListView.xaml`). Hallowtide, Emberline and the rest started from the old pulse-only motion and are being moved to this.

## What each state says

| State | Message | Motion | Never |
|-------|---------|--------|-------|
| LAUNCHING | "Loading, wait." | A **progress sweep** in the item's own shape: a band crosses the surface, a foot line fills, the theme's mark reacts as the band lands. Loops every 1.4-2s (travel 0.9-1.2s, then a short rest). | A pulse of the whole layer, a blink, stepped keyframes that flicker, anything faster than 1.2s per pass. |
| RUNNING | "Live, nothing to do." | **Idle pulse**: the frame breathes 0.7 to 1 and the theme's mark idles (slow tap, drift, turn) on a 2.4-4s cycle. The foot line stays full. Quiet enough to live beside 40 other rows. | A travelling sweep (that means launching), anything that draws the eye from the game page. |
| RUNNING + hover (Play / RUNNING button only) | "Click to stop." | The label becomes **Cancel**, the plate darkens. | Cancel while launching, idle, or with the pointer elsewhere. |

The four surfaces, each keeping its own shape: details row, list view row, cover tile, and the game page's Play / RUNNING button (the plate keeps Play's form; only fill, scan and label change).

## The kit (copy, then restyle per theme)

**1. Scan band** (`RunningScan`): a copy of the surface's wash shape (`Border`, `Path`, `Control` with the sprite template, the 3-part Grid of a torn slab), filled with `{DynamicResource RunningIndicatorBrush}`, `Visibility="Collapsed"` at rest, shown by the launching trigger's setter. Its **OpacityMask** is a three-stop gradient whose stops travel: the mask is black with alpha, so no colour key is needed and ThemeModifier recolours it with the brush.

```xml
<Border x:Name="RunningScan" Visibility="Collapsed" Background="{DynamicResource RunningIndicatorBrush}" Opacity="0.4">
    <Border.OpacityMask>
        <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
            <GradientStop x:Name="RunningScanTail" Color="#00000000" Offset="-0.4" />
            <GradientStop x:Name="RunningScanHead" Color="#FF000000" Offset="0" />
            <GradientStop x:Name="RunningScanEdge" Color="#00000000" Offset="0.002" />
        </LinearGradientBrush>
    </Border.OpacityMask>
</Border>
```

Storyboard (inside the launching `BeginStoryboard Name="RunningIndicatorLaunching"`, `Storyboard RepeatBehavior="Forever"`): tail -0.4 to 1, head 0 to 1.4, edge 0.002 to 1.402 over 1.15s with `KeySpline="0.45,0 0.25,1"`, then hold to 1.6s (the rest). Offsets outside 0-1 are fine. Per surface Opacity: rows 0.4, covers 0.3-0.34 (over art), button 0.7 over a darkened plate. Tail length 0.4-0.5 of the width. Stops are named per template, so every template that has a scan names them identically (the names are only unique within one template).

**2. Foot line** (`RunningFill`): a 2px track (running colour at 0.3) with a fill that is a `Rectangle` with `RenderTransformOrigin="0,0.5"` and a named `ScaleTransform ScaleX="0"`. Launching: ScaleX 0 to 1 in step with the band, the fill fades out in the last 0.4s, loop. Running: a second **non-repeating** `BeginStoryboard Name="RunningIndicatorFill"` grows it to 1 in 0.45s (the swipe has landed) and holds; remove it in `ExitActions` too. A fill that grows must not live in the repeating running storyboard (it would restart every cycle).

**3. Mark** (the theme's motif: keys, embers, glyph, ring, bars): named parts animated with `Opacity`, `TranslateTransform` or `RotateTransform`. Launching: it reacts as the band lands (keys tap at 0.9-1.2s, a glyph flares, a ring pings). Running: a slow idle (3.2s cycle, staggered parts).

**4. Idle pulse**: running storyboard on `RunningIndicator` `Opacity`, 3.2s keyframes 0.72 to 1 to 0.72 (`KeySpline="0.4,0 0.6,1"`), `RepeatBehavior="Forever"`. Launching sets `RunningIndicator` to 1 (`To="1" Duration="0:0:0.2"`) so the frame is fully lit while loading.

`RunningIndicator` keeps the contract: `IsHitTestVisible="False"`, collapsed at rest, `RunningFrame` and `RunningWash` inside it, named `BeginStoryboard`s removed in `ExitActions`, above selection and hover layers (inset frame where selection outlines the same edge).

## Game page button

The cell holds the theme's `PlayButton` (Tag `ContextAction`) with the overlay `RunningActionIndicator` on top. The overlay is above the label, so it carries only frame, a faint wash (0.12), the foot line and the mark. The **slab itself** carries the loud parts, all under the label and all in the plate's exact shape:

| Layer (inside the PlayButton template) | Role |
|----------------------------------------|------|
| plate (`PlayFill`, ...) | `Background` becomes `RunningIndicatorBrush` through the style's `IsLaunching` / `IsRunning` triggers; the plate is never faded or made translucent (the page behind would decide the label's contrast) |
| `RunningBreath` | a `ScrimBrush` copy of the plate shape. Launching: holds at 0.5 (fade in from 0.3 over 0.25s). Running: breathes 0.22 to 0.42 over 3.2s. This is the idle pulse; the label stays opaque |
| `RunningScan` | the swipe, a copy of the plate shape in `RunningIndicatorBrush`, Opacity 0.6-0.7, mask as in the kit |
| `HoverPlate` / `HoverLayer` (idle hover fill) | `Visibility="Collapsed"` in both running triggers; the idle hover fill must never paint over a running plate |
| `RunningHoverDim` | a second scrim, faded in (0.15s) only with the Cancel label; static `Opacity="0"` otherwise. **Below the label**, no `Panel.ZIndex` above content |
| `PlayContent` / `CancelLabel` | Cancel is `Visibility="Collapsed"` at rest and shown by **one** `MultiDataTrigger`: `{Binding IsRunning}` = True and `{Binding IsMouseOver, RelativeSource={RelativeSource Self}}` = True, which also collapses `PlayContent`. Fade it in (`From="0" To="1"`, 0.12-0.15s) in the trigger's `EnterActions` |

- **Self, never TemplatedParent.** The button sits inside the game page's `ControlTemplate`, so `RelativeSource TemplatedParent` is the **page's** `IsMouseOver`: Cancel appeared with the pointer anywhere on the page. `validate-extension.ps1` fails any `IsMouseOver` binding on `TemplatedParent` in `PlayButton.xaml`.
- **Animated values beat setters.** A `Setter` on a property an active storyboard animates is ignored. Keep hover/cancel layers separate from the layers the loops animate (`RunningBreath` loops, `RunningHoverDim` is faded by its own storyboard).
- **Text stays readable.** Label and plate: at least 4.5:1 at the worst frame of the loop (3:1 is the floor for the large bold labels), with the label in `PrimaryButtonForegroundBrush` (or a dark ink the style sets on the running triggers when the running colour is light). Darken the plate with `RunningBreath`, never with transparency. `tests/wpf/RunningMotionFrames.ps1` prints the worst-frame contrast for launching and running.
- Slabs built from sprites (`Control` with a mask template): the scan is a `Control` with the same `Template` and an `OpacityMask` on the control itself (it multiplies with the template's own mask). Paths: copy the `Data`. Chamfers and slants: copy the clip geometry.

## Per surface

| Surface | Wash | Scan | Foot line | Mark |
|---------|------|------|-----------|------|
| Details row, list view row | 0.16 over the row | band across the row, 0.4 | 2px inside the keyline, 3px margin | far edge (selection is on the near edge) |
| Cover tile | band inside the edge (0.18) | band across the cover, 0.3 | a 14-18px tape at the cover's foot holds line and mark | inside the tape |
| Button overlay | 0.12 | on the slab (above) | 2px, 5px above the foot | right end of the plate, clear of the label |

Selected items: nothing in the kit is touched by selection triggers; the frame keeps the inset the contract asks for. Check selected + launching in the contact sheet.

## Make it the theme's own

The kit is the skeleton. A theme is judged on whether its states could be swapped with another theme's without anyone noticing. Pick from its source (game, film, design system) and vary at least **three** of these; write the choice into the theme's `AGENTS.md` -> Running game row.

| Lever | Options |
|-------|---------|
| Band profile | soft comet with a hard head (paint, tape), symmetric glow bar, hard-edged block (ink, shutter), double bar, angled slash (`EndPoint="1,0.35"`), iris / radial (`RadialGradientBrush` mask, `GradientOrigin` travelling), vertical rise from the foot on covers |
| Progress read | smooth fill, **segmented** fill (the scan or fill under a parent whose `OpacityMask` is a tiled `DrawingBrush` of cells: pixel and terminal themes step like a bar of blocks without discrete keyframes), tick ruler, marching dashes (`StrokeDashOffset` on a dashed `Line`/`Path`) |
| Foot | hairline, segmented, dotted, double rule, brush stroke, corner bracket pair filling |
| Mark | taps (keys), embers or motes rising (`TranslateTransform Y` + opacity, staggered), turning cog or spiral (`RotateTransform`), expanding ring (scale + fade), equaliser bars (`ScaleY` staggered), pilot light, heartbeat or cursor, wisps, seal or stamp landing |
| Timing | cycle length (1.4-2s), easing (hard-in for mechanical, `SineEase` for soft, `BackEase` small overshoot for playful), rest length, stagger |
| Colour | the running colour (`RunningIndicatorBrush`) is fixed by the contract; vary the support: a second layer in `TextBrush`-family highlights, the scrim, dark ink keylines |
| Restraint | design-system themes (Material, Fluent, Primer, shadcn) use their own language: an indeterminate **linear progress** (two travelling bars), a ripple, a skeleton shimmer; no ornaments |

Match the idle pulse to the launching mark so the two read as one object: the mark that taps while launching idles with a slow tap; the ring that pings fires once per cycle, then idles with a breathing ring.

## Verify

1. `.\scripts\build-theme.ps1 -Extension <key> -NoDeploy`
2. `pwsh -NoProfile -File .\scripts\validate-extension.ps1 -Extension <key>` (progress motion, Cancel binding, contract).
3. `pwsh -NoProfile -STA -File tests\wpf\RunningIndicatorRegressionTests.ps1 -Keys <key>` (items visible while running, selected, no clock left after stop).
4. `pwsh -NoProfile -STA -File tests\wpf\RunningMotionFrames.ps1 -Keys <key> -OutDir <scratch>` writes `<key>-motion.png`: launching every 200ms (the sweep must read as one band crossing), running every 600ms (the pulse), selected variants, the button under hover (Cancel on the label; launching + hover shows no Cancel and no idle hover fill) and the label contrast numbers. **Read the PNG**; static checks passed while a sweep drew nothing. Use `-Surfaces "game page action"` to render one surface.
5. Hover in the harness is emulated with keyboard focus, so the sheet shows the Cancel layout but not the real pointer; confirm once in Playnite after the build deploys.

## Pitfalls

- `Storyboard.TargetName` on a `GradientStop`, a `ScaleTransform` or `TranslateTransform` named inside the template works from `ControlTemplate.Triggers`; **never** from a `Style.Triggers` storyboard through a sub-object (it crashes Playnite).
- Child timelines of different lengths inside one repeating `Storyboard` all restart with it. A once-only grow belongs in its own `BeginStoryboard`; name both and remove both in `ExitActions`.
- Keep the first `BeginStoryboard` of each trigger the one named `RunningIndicatorLaunching` / `RunningIndicatorRunning` (the validator and the test look for it); extra named storyboards are fine.
- No `DropShadowEffect`, no `OpacityMask` on art behind the item (the scan's mask is on the overlay band only), no loops that start on `Loaded`, no `DiscreteDoubleKeyFrame` in the launching storyboard.
- Rows are recycled by virtualization: every clock is removed on exit, so a recycled row never keeps sweeping.
- One level of margin: on covers, the frame stays inset 4px inside the selection outline; the tape sits inside the frame.
