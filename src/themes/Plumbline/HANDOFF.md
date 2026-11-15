# Plumbline — handoff to the XAML phase

Written by the agent that did research, design, previews, tokens and sprites. It had **no PowerShell, no .NET and no
Windows**, so nothing here was built, validated or loaded in Playnite. The next agent needs a Windows machine with
Playnite installed and `pwsh`. Start by reading `BRIEF.md`, then open both `art/screenshot-*.png`: the previews are the spec.

## State

| Done | Where |
|------|-------|
| Research, measured tokens | `RESEARCH.md`, `src/tokens.css` |
| Brief (Hybrid), game element map, moments, motion | `BRIEF.md` |
| Previews (both rendered, checked against `docs/themes/theme-preview-review.md`) | `art/preview-details.html`, `art/preview-settings.html`, `art/screenshot-*.png` |
| `Constants.template.xaml`, every placeholder mapped, 143 keys, key names and tokens checked by script | `src/Constants.template.xaml` |
| Field-height overlays (the five the scaffold writes) | `src/CustomControls/*`, `src/DefaultControls/DatePicker.xaml` |
| Manifests, index row, notice, add-on tile | `info/`, `src/extensions.json` |
| Sprites (deterministic, white or black masks) | `src/Images/*.png` from `art/generate-sprites.py` |
| Mark (flat tile and 6-facet geometry) | `art/mark.svg`, `art/mark-path.txt` |
| Icon geometries for 29 roles | `art/icons-geometry.xaml` |

**Not done: every other XAML file.** Without them Playnite loads the theme as its Default layout recolored by
`Constants.xaml`, which is a valid but plain baseline.

## Before anything: run the gate once

```powershell
.\scripts\build-theme.ps1 -Extension plumbline -NoDeploy      # renders Constants.xaml; fails on any unmapped placeholder
.\scripts\validate-extension.ps1 -Extension plumbline         # will list the missing required files: that is the to-do list
```

Expect `Constants.template.xaml` to pass (placeholder names and key names were checked, the build itself was not run). The validator
will fail on the missing `TreeView`, `StandardWindowStyle`, `Expander`, `Common.xaml` keys and the rest until they exist.

## Work order

Each step follows `docs/themes/new-theme.md` (steps 6 to 12) and `.agents/skills/playnite-theme-dev/SKILL.md`. Start every file from
Playnite's Default file at the snapshot tag. Other themes are named below only as references for one mechanism each (the doc names them), not as bases.

1. **`src/Common.xaml`**: `PopupBorder`, `FocusVisual`, padding keys, `ControlHeight` 32, `IconSize` 16, `GameBannerHeight` 320,
   `GameBannerDarken` 0, targets in `AGENTS.md` -> Component spacing.
2. **`src/Media.xaml`**: paste `art/icons-geometry.xaml`, add `IconTemplate` (stroke 2.4, round caps and joins; `IconPlay` is
   the one filled glyph), add the menu icon keys. Playnite's own menu icons (`AddGameIcon`, ...) go in `icons.json` as PNG jobs
   (`.\scripts\render-icons.ps1 -Extension plumbline`), tinted from `tokens.css`; needs `pwsh` and network.
3. **Shell** (`Views/MainWindow`, `Sidebar`, `TopPanel`, `Library`, `DerivedStyles/MainWindowStyle`, `CustomControls/SidebarItem`,
   `TopPanelItem`): per `AGENTS.md` -> Shell. Required here: the window background art rules (a **light** theme: define
   `WindowArtForegroundBrush` use, see `src/themes/AGENTS.md` -> Window background), the filter mark (orange lozenge, copy Ancient's
   `TopPanelFilterToggle` pattern for the mechanism), the grid side panel close button (Night City's overview is the pattern), the
   reserved window-button width.
4. **Controls**: Button (+ the `Width == 41` ThemeModifier trigger and 32px scale), ToggleButton, RepeatButton, TextBox, PasswordBox,
   ComboBox (reserve chevron room), CheckBox, RadioButton, Slider, ProgressBar, ScrollViewer, Thumb, ToolTip, Menus, TabControl,
   GroupBox, ListBox, `Expander` (required: see-through under window art), `SearchBox`.
5. **Settings screen (required)**: `DefaultControls/TreeView.xaml` and `DerivedStyles/StandardWindowStyle.xaml` +
   `WindowBarButton.xaml`. The preview is the spec: 28px centered plates, green gloss when selected, children inset 16px,
   48px title band with the gem medallion and a round close. Rules: `docs/themes/settings-screens.md`.
6. **Game page**: `DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml`, banner tint layers, breakpoints
   (`node scripts/game-page-breakpoints.mjs ...`), minimum top gutter, empty states in both views, steam screenshot gate.
7. **Interactive layer (required)**, see below.
8. **Verify**: the WPF regression tests listed in `docs/themes/new-theme.md` steps 8 and 9, then `take-screenshots.ps1`, preview
   parity (`node scripts/preview-layout.mjs src/themes/Plumbline`), build with `-Launch`, `generate-readmes.mjs`.

## The signature pieces (how to build them in WPF)

### Play button (hero)
White capsule (`PrimaryButtonBackgroundBrush`, height 44, `CornerRadiusXLarge`) with a 56px disc overhanging its left end. Put the
disc in a `Canvas` or a negative-margin `Grid` and set `ClipToBounds` False on the ancestors (the disc leaves the capsule).
- Rest: capsule + disc, shadows are `shadow-plate.png` (9-slice, slice 18) and `shadow-disc.png` laid 3px lower as `Image`s
  filled through an `OpacityMask` with a black brush at about 0.3 (no `DropShadowEffect`).
- Hover (animate in and out, 200ms, never snap): capsule `TranslateTransform.Y` 0 to -2 with `BackEase` (EaseOut, Amplitude
  0.35); `bloom.png` (100x100, centered on the disc) as an `OpacityMask` over a `PrimaryButtonGlowBrush` rectangle, Opacity 0 to 1;
  `sheen.png` (70x44) as an `OpacityMask` over a white rectangle sliding left to right across the capsule over 380ms, clipped to
  the capsule's rounded shape (`Border` with `ClipToBounds`, or a `Clip` geometry, because sprite masks do not clip themselves);
  triangle brightens (`PrimaryButtonHoverBackgroundBrush` plate).
- Press: capsule Y +2 (110ms), bloom scale 1 to 0.9, plate `PrimaryButtonPressedBackgroundBrush`.
- The triangle is `IconPlay`, filled. The preview paints it `--pl-green-play` (`#41a833`), which has no key yet. Either add a shared key
  (`PlayGlyphBrush`, type Brush) to `scripts/data/theme-keys.json` and map it in `Constants.template.xaml`, or use `GlyphBrush`
  (`#65d136`, lighter than the game's). Decide and note it in `AGENTS.md`.
- Running or launching: `RunningActionIndicator` over the capsule (see below). Label stays `PrimaryButtonForegroundBrush` at 4.5:1.

### Running game indicator
Orange (`RunningIndicatorBrush`, never green: Play and selection are green). Motif: the orange gem (`art/mark-path.txt`, orange set) bobbing
3px over 2.4s (running) and dropping into place while a progress sweep crosses the item (launching). On the details row it sits at
the right (`RowRoom` reserves 28px and a `RunningMarkPlate` backing strip); on the cover top-right; over Play as the
`RunningActionIndicator`. Frame 2px `RunningIndicatorBrush`, wash 10 percent. Kit and tests: `docs/themes/running-motion.md`,
`tests/wpf/RunningIndicatorRegressionTests.ps1 -Keys plumbline`, `RunningLabelOverlapRegressionTests.ps1`.

### Cover tiles
- Hover (`GridViewItemStyle.xaml`): 3px `GridViewItemHoverBorderBrush` frame (the pack preview tile) and a white corner badge (28px, bottom-left)
  with a small play circle that pops in (`BackEase`, 200ms). Selected = 3px `GridViewItemSelectedBorderBrush` (green), static.
- Cover buttons (`GridViewItemTemplate.xaml`, `GridTileButton`): 36px white discs, glyph `IconPlay` (green) and `IconInfo`, entering with a
  scale 0.85 to 1 pop, 60ms stagger, hover = the Play bloom at small scale. Root `Background="Transparent"`.
- Clip covers, their scrims and the frame to the same 6px rounded rectangle; leave the outside transparent.

### Empty game page (both views)
The facet field (`facets.png` as a white mask at about 0.9 over `ShellBackgroundBrush`) fills a rounded 6px card, the green gem hangs
centered from its cord and turns slowly (a `ScaleTransform.ScaleX` between 1 and 0.35 over 4s, only while the page is visible; never a
`RenderTransform` from a `Style` trigger, see `docs/themes/reference.md` -> Builds), `LOCErrorNoGameSelected` below in `TextBrush`.
Hide the game content, keep details `PART_ScrollViewHost` `Visibility="Visible"`, keep the grid close button. Run the empty-state checks.

### Settings title band
48px, centered `Settings` in `HeadingFontFamily` 22px, the medallion (40px white disc, 2px `SidebarItemSelectedGlowBrush` ring, shadow sprite,
the green gem 15x20 inside) at left, a 26px round close (white, 2px `SidebarItemSelectedForegroundBrush` ring and X; hover = `DangerBrush`, glyph `DangerForegroundBrush`).

### Section bands
`Expander`, `GroupBox` and the description card header: 24px, `HeaderBandBrush`, lighter at the top in the preview (`pl-band-hi` to `pl-band`). The catalog allows a `LinearGradientBrush` for any Brush key, so
the cleanest route is to make `HeaderBandBrush` itself that gradient in `Constants.template.xaml` (`{{pl-band-hi}}` and `{{pl-band}}` stops).
`HeaderBandForegroundBrush` 11px bold. `TextBlock` has no tracking, so skip the preview's 1.2px letter spacing and accept the difference. Text goes
through `ToUpperCaseConverter`.

### Need bars
`ProgressBar` and the score bars: 12px high, radius 6, track `ProgressBarTrackBrush`, fill gradient `pl-green-hi`, `pl-green-bright`, `pl-green` top to bottom.
Same route as the bands: make `ProgressBarForegroundBrush` a `LinearGradientBrush` in the template (the green gloss is also wanted for `SelectedBrush` and
`TopPanelItemCheckedBackgroundBrush`; one gloss gradient shared by the three is fine). A 20px round cap holding the value sits at the left. Thin tracks use half-thickness radii (`CornerRadius="6"`), never `CornerRadiusFull`.

## Sprites: state and what could not be generated

All present in `src/Images/` and regenerated by `python3 -I src/themes/Plumbline/art/generate-sprites.py`.

| File | Use |
|------|-----|
| `facets.png` 1280x720 | frame, empty page, Settings backdrop (white mask, brush it) |
| `facets-rail.png` 44x720 | icon rail (stretch to the rail's height) |
| `bloom.png` 256x256 | Play and cover button hover ring |
| `shadow-disc.png` 128x128, `shadow-plate.png` 48x48 (9-slice 18) | all drop shadows (black mask) |
| `sheen.png` 160x40 | Play and button hover streak |
| `gem-glow.png` 96x96 | halo behind the running gem |

**Needs another agent or a Windows run, none of it blocks the theme:**
- **Menu icon PNGs** (`AddGameIcon`, `PlayIcon`, ... ~40 keys): jobs in `icons.json` and `.\scripts\render-icons.ps1 -Extension plumbline`. Style: the
  same 2.4px rounded strokes as `art/icons-geometry.xaml`, tinted `--pl-ink`; exit and remove in `--pl-red`, favorites in `--pl-orange-mark`. Not generated
  here because `render-icons.ps1` is PowerShell.
- **Optional painted art**: the game's chunky filled glyphs inside discs (a house, a light bulb, people) would sell the sidebar more than strokes. If
  wanted, ask an image tool for 6 white-mask PNGs, 64x64, filled chunky glyphs (library, statistics, add-on, settings, heart, clock), no text, and
  recolor through `OpacityMask`. Today the strokes are enough and fully recolorable.
- **Cover placeholder** for games with no cover: a pale facet field with the gem hanging in it, 360x480, white mask. Easy to add to `generate-sprites.py`.

## Decisions to keep or change on purpose

- Mode **Hybrid**, name **Plumbline**, mark an original plumb bob. Do not draw EA's plumbob or logo, and keep the "unofficial" notice and listing text.
- Running = **orange**, not green (rule: different hue from Play and selection). The brief's Sims reference is the plumbob over the active Sim.
- Text on green, band and orange is **deep ink**, not the game's white (contrast). Primary dialog button (Save) is orange with ink text.
- Segoe UI, no bundled font. Headings Segoe UI Semibold.
- Light theme: `GameBannerTintBrush` is `pl-paper` (paper for light themes). It does need the "light themes flip text on art" work.
- Shadows are sprites, not effects.

## Known risks

- Hyperlinks: `GlyphBrush` is green (selection accent); links on white would be 1.9:1. Restyle `DetailsHyperlink` to `LinkBrush`.
- `TextBlock` has no tracking, `Typography.Capitals` has no effect on Segoe UI: bands are plain uppercase, bold.
- The overhanging Play disc needs `ClipToBounds="False"` up the visual tree and room above the action row (about 7px); check the details and grid views.
- Selected-row gloss on the `pl-green` gradient has a 5.1:1 ink label at the bottom edge, 6.5:1 at the middle: do not lighten the gradient further.
- Nothing was loaded in Playnite. Treat every XAML claim in `AGENTS.md` as a plan until the build and the WPF tests pass.
