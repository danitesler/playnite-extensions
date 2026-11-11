# Settings screens and dialog chrome

What Playnite's Settings window (and the add-ons window, the game editor and every other dialog) should look like in a theme. Required for every theme; `validate-extension.ps1` fails a theme without the two files and prints advisories for the sizes (rows outside 28-32px). Worked examples: **Ancient** (Dota 2 dashboard), **Attache**, **Cloudbank**, **Backbeat**, **LastFlame**.

## The idea

Settings is the one screen where the player stops looking at games and looks at the theme's own UI. The source has a screen for it: the options menu of a game, the preferences window of a design system, the pause menu. **Draw that screen.** A theme whose Settings window looks like Playnite's default with new colors (a small grey list of text links, a flat title bar) reads as unfinished, however good the library looks.

Two files carry it. The rest (checkboxes, combo boxes, buttons, tab strips) comes from the control files and must already follow the theme.

| Part | File | Where it shows |
|------|------|----------------|
| Title band, frame, caption buttons | `DerivedStyles/StandardWindowStyle.xaml` (+ `WindowBarButton.xaml`) | Settings, Add-ons, game editor, every dialog |
| Section list ("General, Appearance, Search...") | `DefaultControls/TreeView.xaml` | Settings and Add-ons windows, also the filter and explorer trees |

## Section list (TreeView)

The list is the screen's navigation. It must read as **buttons in the theme's language, not as links.**

- **Rows are full-width plates, 28-32px tall** (`MinHeight` on the row `Grid`; 30 is the default). The list holds ~20 entries and must fit a 620px window without a long scroll, so taller is wrong: a 40px row in a display face looked like a menu of a different app. Label in the **normal body font** (`FontFamily` / `FontSize` keys, no heading face, no small caps or uppercase, no weight change); the theme's character comes from the plate, the mark and the band, not from a louder typeface. Left padding 10-14. Never a bare `TextBlock` with an arrow.
- **Three distinct states, each a separate named layer** (`HoverPlate`, `SelectedPlate`, `Marker`), not one brush that changes:
  - Idle: label in `TextBrushDarker`, no plate.
  - Hover: a light plate (`ListItemHoverBrush`), label to `TextBrush`, and a teaser of the selected mark (the marker at 40-55% opacity, or the glyph shifted). Fade it if the theme animates.
  - Selected: the theme's selection plate, `SelectedForegroundBrush` label, and **at least one more cue than colour**: a bar, notch, bracket, corner, arrow, underline sweep, pip. The IsSelected trigger changes two or more named parts.
  - Keyboard focus is `FocusVisual` (visible, keyboard only).
- **The mark is the source's own selection motif**, never a generic left bar by default: Dota's blue nav glow, a Souls-style diamond cursor, a Material state layer, a terminal `>` prompt, a pixel arrow, a hazard stripe, a quest-log gold ring. Pick the one the source uses.
- **Width:** a `DataTrigger` on the ancestor window's `AutomationProperties.AutomationId` sets `Width` 240-280 for `WindowSettings` and 280 for `WindowExtensions` (and `ScrollViewer.HorizontalScrollBarVisibility` Disabled). Do not give the tree a fixed width anywhere else: the filter sidebar and the explorer panel size it themselves.
- **No layout jump when a node opens.** Expanding a node (Settings sections, Add-ons tree) can make the list taller than the window. With `Auto` the vertical scroll bar appears at that moment, takes its lane (about 12px) from the rows and everything beside it reflows. So in the `WindowSettings` and `WindowExtensions` triggers set `ScrollViewer.VerticalScrollBarVisibility` to **`Visible`** (never `Auto`) and `HorizontalScrollBarVisibility` to `Disabled`: the lane is reserved from the start and the bar's thumb just appears when there is something to scroll. Give the lane a quiet look (no rail, thin thumb) so a reserved empty lane reads as a margin. The same holds for every expander or accordion you restyle: a template that changes its own height must not depend on a scroll bar appearing to fit.
- **Children** (Appearance > General...) indent 16-24px under a guide line or a smaller plate, expanders are the theme's glyphs (`IconSubmenu` / `IconDropDown` in `IconSmallTemplate`, 12-16px), colored with `GlyphBrush`.
- **Separators:** Playnite puts `Separator` objects in the tree. Keep Attache's handling: a style that tags them and a `DataTrigger` that makes their container non-selectable and non-focusable.
- Labels wrap (`TextWrapping="Wrap"`, `MaxWidth` about 180-200) so a long translation never widens the column.
- Keep Playnite's structure and parts: `PART_Header`, the `Expander` toggle, `ItemsHost`, `IsExpanded`/`HasItems` triggers.

Optional but good: a faint watermark or a closing ornament at the bottom of the column, drawn in a `Canvas` so it adds no desired size.

## Title band (StandardWindowStyle)

- **36-48px band** with `WindowChrome CaptionHeight` equal to the band and the content `ContentPresenter` top margin equal to it (the validator checks the equality). Default is 25.
- **One signature graphic** that makes the screen the theme's: the source's logo mark ghosted at 5-8% into the right end, a hazard or stripe band, a ribbon, a bracketed title plate, an underline glow lit under the title, corner marks, pixel noise, a scanline sweep. Draw it from XAML vectors (`Path`, `Rectangle`, `Border`, icons from `Media.xaml` through `IconTemplate`) filled with theme brushes so ThemeModifier recolors it. Put wide decoration in a `Canvas` inside a `Grid ClipToBounds="True"`: small dialogs must still size to their content.
- **Title** in the heading font (`HeadingFontFamily`), `FontSizeLarger`, with the theme's casing (small caps, uppercase, italic). A glyph or marker before it.
- A closing rule under the band (single, paired, double, stripe: whichever the source draws).
- **Caption buttons:** `WindowBarButton.xaml` is resized to the band (e.g. 46x44 for a 44px band, `VerticalAlignment="Top"` in the band). It is only used by `StandardWindowStyle`; the main window has `MainWindowStyle`.
- **The Settings window has no `Title`**, so the band shows no name unless the template sets it: a `ControlTemplate.Triggers` entry `<Trigger Property="AutomationProperties.AutomationId" Value="WindowSettings">` with `<Setter TargetName="PART_TextTitle" Property="Text" Value="{DynamicResource LOCSettingsLabel}" />` (see Ancient / Attache). Check the band names the Settings window.
- Keep Playnite's parts and triggers: `PART_TextTitle`, `PART_ButtonMinimize`, `PART_ButtonMaximize`, `PART_ButtonClose`, the `WindowState` Maximized trigger (button content `2`, border padding 8), the `HasChildWindow` dim trigger, and `WindowDesignStyle`.
- The Settings page body, the bottom bar with Save and Cancel, and the "Requires restart" note are Playnite's; they take their look from `WindowBackgourndBrush`, the button and checkbox styles. Check them against the new band.

## Motif by source type

| Source | Section list | Title band |
|--------|--------------|------------|
| Game with an options menu (Dota, Souls, Transistor, Hades) | The game's menu list: its cursor, its highlight bar, its casing | The game's window header: logo mark ghosted in, its divider, its font |
| Pixel or retro game | Hard-edged plates, a pixel arrow cursor, 2px steps | Bevelled bar with a pixel border, noise strips |
| Terminal / sci-fi HUD (Holotape, Uplink, Payload) | `>` prompt marker, bracketed rows, a scanning highlight | A status bar: header text, a tick ruler, bracket corners |
| Design system (Material, Fluent, Primer, shadcn) | The system's navigation item: pill or rounded rect state layer, the system's selected indicator | A plain header with the system's weight and divider, no ornament it does not have |
| Print / editorial / lifestyle (Codex, Hearthside, Medallion) | An index list: numerals or a rule, an ink underline on selected | A masthead: rule above and below, title in the display face |

## Assets

- Prefer XAML vectors (no files to ship, themed brushes). A bitmap is for what vectors cannot do (smoke, grain, glow): generate a white mask with a deterministic script in `art/`, ship it in `src/Images/`, color it through a brush-filled `OpacityMask` (reference.md -> Effects and motion). Full-color art only for non-themeable illustration.
- An external coding agent (Codex CLI, Antigravity CLI) can draw a sprite from a measured spec; review its output and keep the generator in `art/`.
- No baked colors, no `DropShadowEffect`.

## Pitfalls

- Cross-file `StaticResource` fails the build: use `DynamicResource` for every key defined in another file (`BevelTemplate`, `FocusVisual`, icons, brushes). Only `BaseStyle` and `{x:Type ...}` styles are `StaticResource`.
- Never start a `RenderTransform` animation from a `Style` trigger (crashes Playnite; see SKILL.md -> Builds but looks wrong). `ControlTemplate` triggers with `Storyboard` on `Opacity` are fine.
- The window template is `TargetType="WindowBase"`. The `Separator` tag trick needs `Header.Tag`.
- Never let a scroll bar appear and disappear on a layout-bearing control (`Auto`) when a click can change the content height: reserve the lane (`Visible`) or draw the bar as an overlay.
- A hover layer and the selected layer must never share a look: on a selected row hover changes nothing visible, and an unselected hovered row must not look selected.
- Keep the band's decoration `IsHitTestVisible="False"` and out of the caption-button area (`WindowChrome.IsHitTestVisibleInChrome` is set by `WindowBarButton`).
- Check a long section name and a translated one (Settings language), a selected child row, a collapsed and an expanded parent, the maximized window.

## Small things that went wrong before

Each of these shipped wrong once. Check them on every theme.

| Symptom | Cause | Fix |
|---------|-------|-----|
| Section list looks like a different app: tall rows, display-face capitals | Copied the title band's heading face and a 40px row | Rows 28-32px, `FontFamily` / `FontSize` keys, no caps. The heading face belongs to the title band only |
| Settings window band shows no name | Playnite gives that window no `Title` | `WindowSettings` trigger setting `PART_TextTitle.Text` to `LOCSettingsLabel` |
| Window jumps sideways when a node opens | `Auto` scroll bar appears and takes its lane | Dialog trees: `VerticalScrollBarVisibility` `Visible`, horizontal `Disabled` |
| Add-ons tree is the tallest case | "Extensions settings > Libraries" opens 9+ children | Open it when checking: no jump, no clipped rows, the selected child readable |
| Page body overlaps the band or leaves a gap | `ContentPresenter` top margin differs from `CaptionHeight` | Same number (the rule may hang up to 8px below the band, as LastFlame's does) |
| Caption buttons sit at the top of a tall band, or clip | `WindowBarButton` kept Default's 25px size | Resize to the band (e.g. 46x44), margin 0, top-aligned |
| Labels no longer line up between parents and leaves | Expander collapsed instead of hidden on leaves | `HasItems=False` sets the toggle to `Hidden`, not `Collapsed`, so the label column stays aligned |
| Tree is 600px wide in a filter panel | Fixed `Width` set on the style itself | Width only through the `WindowSettings` / `WindowExtensions` triggers |
| Preview shows "A" or "4" for an arrow | A CSS `content: "A"` escape was mangled on its way into the file (shell or script) | Write the character itself (`▸`, `▾`) in the HTML, UTF-8; look at the render |
| Preview and real window disagree | Preview rows taller or in another font than the XAML | Same row height, same font, same states (one selected, one hovered row); arrows only on rows that have children |
| Giant triangle and square, no labels, in a Settings tree | The expander `ToggleButton` has no `Width`/`Height` and wraps a `Viewbox` (Ace): once the tree has a fixed width the Viewbox scales to fill the row | Give the expander a fixed size (14x14 or 16x16) and a margin; never an unsized `Viewbox` in a row |
| Hover looks selected | Same brush on both layers | Hover = light plate and a half-lit mark; selected = full plate, full mark, brighter label |

How to look at the real window: build with deploy, open Playnite's Settings and Add-ons (main menu), expand every node, hover and select rows, maximize, switch the Settings language to a long one. Capturing it from a script is unreliable (the main menu popup closes when focus moves), so look by hand.

## Preview

`art/preview-settings.html` shows this screen (title band, section list, page, bottom bar). Rebuild it from the new motifs (previews.md -> Layout) and re-render with `take-screenshots.ps1`. The preview's tree rows are the same height and font as the XAML's (28-32px, body font).

## Checklist

- [ ] `DefaultControls/TreeView.xaml`: scroll lane always reserved (`Visible`) in the dialog triggers, 28-32px plate rows in the body font, hover / selected / focus distinct, motif-based selected mark (2+ cues), Settings width trigger, separators, theme expanders.
- [ ] `DerivedStyles/StandardWindowStyle.xaml`: 36-48px band, caption height equals content offset, signature graphic, heading-face title, closing rule, all `PART_*` kept.
- [ ] `DerivedStyles/WindowBarButton.xaml` sized to the band.
- [ ] Title trigger for `WindowSettings` sets the band's name.
- [ ] Add-ons window checked with every node open: no layout jump, rows readable.
- [ ] `art/preview-settings.html` and `screenshot-settings.png` updated (real characters for arrows, rows match the XAML).
- [ ] `.\scripts\validate-extension.ps1 -Extension <key>` passes with no `settings chrome:` advisory; `build-theme.ps1` builds.
