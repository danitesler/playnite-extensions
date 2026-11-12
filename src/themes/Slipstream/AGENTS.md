# Slipstream — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) inspired by the menus of **Star Wars: Galactic Racer** (2026). A **light** theme with no dark variant: warm paper page, ink type and rules, vermilion pills for whatever is selected, dark teal pills for buttons, blue / sage / mustard racing stripes as decoration.

Unofficial and fan-made: not affiliated with, endorsed by or sponsored by Lucasfilm, Disney, or the game's developer or publisher. It ships no game art, logo, font or capture (`info/NOTICE-Slipstream.txt`). The name only echoes the source.

Shared anatomy: **`../AGENTS.md`**. Loading rules and build checks: **`.claude/skills/playnite-theme-dev/reference.md`**.

## Sources

Captures, sampled pixels, design rules and sizes: [`RESEARCH.md`](RESEARCH.md). The game publishes no tokens; `src/tokens.css` holds this theme's own names (`ss-*`) for the measured values.

## Tokens

| Token | Key | Used for |
|-------|-----|----------|
| `ss-ink` | `TextColor`, `PopupBorderColor`, `HeadingRuleBrush`, `CheckBoxBorderBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush`, `TooltipBackgroundBrush`, `InputHoverBorderBrush` | Type, rules, toggle and gauge bodies, popup edge, tooltip |
| `ss-ink-muted` | `TextColorDarker` | Secondary text, idle icons |
| `ss-paper-white` | `TextColorDark`, `SelectedForegroundBrush`, `ButtonForegroundBrush`, `PrimaryButtonForegroundBrush`, `ProgressBarForegroundBrush`, `SliderThumbBackgroundBrush` | Text on vermilion, teal and ink; gauge fill and knob |
| `ss-paper` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `TopPanelBackgroundBrush`, `ScrimBrush`, `WindowTitleBackgroundBrush` | The page |
| `ss-paper-hi` | `MainColorDark`, `PopupBackgroundColor`, `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `PropertyItemBackgroundBrush` | Input wells, menu sheets, chips |
| `ss-plate` | `MainColor`, `ExpanderBackgroundBrush`, `ShellBackgroundBrush` | Cards, the rail, the Settings tree column |
| `ss-vermilion` (+ `-hi`, `-deep`) | `GlyphColor`, `SelectedBrush`, `ListItemSelectedBrush`, `PrimaryButton*`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush`, `HeadingMarkerBrush`, `DataChangeNotifColor`, `GridViewItemSelectedBorderBrush` | Selection pills, Play, the title slash, the filter dot |
| `ss-teal` (+ `-hi`, `-deep`) | `ButtonBackgroundBrush`, `ButtonHoverBackgroundBrush`, `ButtonPressedBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `ScrollBarThumbBrush`, `GridViewItemHoverBorderBrush`, `PropertyItemForegroundBrush` | Buttons, scroll thumbs, links |
| `ss-blue`, `ss-sage`, `ss-mustard` | `StripeBrush`, `StripeAltBrush`, `StripeAccentBrush` (added to `theme-keys.json` for this theme), `FocusBrush` = blue | Racing stripes; keyboard focus ring |
| `ss-red`, `ss-orange`, `ss-green` | `DangerBrush`, `NegativeRatingBrush`; `WarningBrush`, `MixedRatingBrush`; `PositiveRatingBrush` | Status |
| `ss-wash-strong`, `ss-hairline` | `ListItemHoverBrush`, `MenuItemHoverBrush`, `TopPanelItemHoverBackgroundBrush`; `WindowPanelSeparatorColor`, `PanelSeparatorColor` | Hover plates; dividers |

`ButtonBackgroundBrush` is dark (teal) while `TextBrush` is ink, so anything that puts `TextBrush` on `ButtonBackgroundBrush` must use `ButtonForegroundBrush` instead. That is why `DerivedStyles/NotificationMessage.xaml` is overlaid and the side panel close glyph is `ButtonForegroundBrush`.

Radii: `ControlCornerRadius` 16 (a true capsule on 32px controls: buttons, tabs, rows, search), `CornerRadiusLarge` 6 (cards, input wells, popups), `CornerRadiusSmall` 4 (covers, chips, tooltips), `CornerRadiusFull` unused. Play is 40px with a literal radius 20.

Fonts: `FontFamily` = `Bahnschrift, Segoe UI`; `HeadingFontFamily` = `./Typography/#Unbounded, Unbounded, Bahnschrift, Segoe UI` (Unbounded Bold bundled in `src/Typography/`, OFL; every heading is Bold, so no other face ships). Headings are Bold. WPF has no text-transform, so titles keep Playnite's casing instead of the game's capitals.

## Component spacing (`src/Common.xaml`)

| Key | Value | From |
|-----|-------|------|
| `ControlHeight` | 32 | Repo rule; also the game's row and pill height scaled to desktop |
| `ButtonPadding` | 18,5 | Room for the pill ends |
| `InputPadding` | 12,5 | |
| `MenuItemPadding`, `ComboBoxItemPadding` | 8,7,12,7 | 31px rows, near the 30px option rows |
| `GroupBoxPadding` / `GroupBoxHeaderPadding` | 16 / 16,14,16,0 | Card body and its ruled heading |
| `IconSize` | 18 | |
| `GameBannerHeight` | 320 | Spacer ratio 100/320 (details), 72/320 (grid) |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px plate rail with a hairline. Main menu: a 32px teal disc. Items 44x40 with a 32px disc: wash on hover, vermilion with a paper-white glyph for the current item plus the notched selection arrow on the rail's outer edge |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 56px bar on paper closed by a 2px ink rule. Search (280x32 pill), filter toggle, sorting first, tools, icon-only view switches, notifications. All plates 32px ghost pills; toggled = vermilion. Filter active = 9px vermilion dot with a paper rim. 168px clear for window buttons |
| `DerivedStyles/MainWindowStyle.xaml` | 46x32 ghost pills; hover teal with a paper-white glyph, close hovers red |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | On paper, hairline edge, 28px filter controls |

**Settings chrome.** Title band (`StandardWindowStyle.xaml`): 44px paper band, vermilion "/" stroke, title in Unbounded Bold, the vermilion tag block, three slanted racing stripes left of the 40x32 caption buttons (zero-size `Canvas` in the clipped band), closed by a 2px ink rule. Section list (`TreeView.xaml`): 30px pill rows in the body font on a plate column; hover = wash pill and the arrow at 45%; selected = vermilion pill, paper-white label, full arrow in the left gutter; children under a hairline; width 256 (Settings) / 280 (Add-ons) with the scroll lane reserved.

## Game page

Skeleton and metadata pane as in `../AGENTS.md`. Differences: the banner is bleached by a paper wash and faded with a gradient that starts at transparent **white** (a transparent-black start would draw a grey band on a light page). The title is preceded by a vermilion "/" stroke. Cards are plates headed by a heading-face title and a 2px ink rule. Action row is 40px: Play capsule, More and Edit 40x40 teal icon buttons. Details view caption column 112px.

## Components

| Playnite file | Drawn as |
|---------------|----------|
| `Button`, `ToggleButton`, `RepeatButton` | Teal dialog pill; default button and checked toggle are vermilion |
| `CheckBox` | The game's option toggle: 30x16 ink capsule, knob paper-white at the right (on) or red at the left (off), muted in the middle (indeterminate) |
| `RadioButton` | 18px ring, 2px ink, vermilion dot |
| `Slider`, `ProgressBar` | Gauge: 8px ink capsule with a paper-white fill inset 2px; 16px knob |
| `TextBox`, `PasswordBox`, `ComboBox` | Paper wells, radius 6, ink rim on hover, blue focus ring |
| `TabControl` | Bare row of SemiBold labels; selected = vermilion pill |
| `GroupBox` | Plate card, heading plus 2px rule (content-sized: the rule is a star column) |
| `ListBox`, `DetailsViewItemStyle` | Pill rows; selected vermilion, with the arrow in the game list |
| `Menu`, `ContextMenu`, `ToolTip` | Paper sheet with an ink edge; tooltip is the ink info panel |
| `PlayButton` | 40px vermilion capsule; hover fades a lighter plate in and sweeps three slanted stripes across, looping while hovered; separate pressed plate |
| `GridViewItemStyle` | Selected: 3px vermilion outline. Hover: teal outline fades in, a blue/sage/mustard bar wipes along the cover's bottom edge |
| `GridViewItemTemplate` | Poster tile (4px corners with a transparent mask), paper scrim on hover, 44px disc buttons: vermilion Play, teal Info |
| Empty game page (both overviews) | Orbit plot (dashed and solid orbits, cross hairs, teal body, vermilion marker circling it via `ControlTemplate.Triggers`), `LOCErrorNoGameSelected`, a racing stripe |
| `NotificationMessage` | Plate card with a ghost close glyph |

No sprites: the source is flat print, so nothing is generated. `art/tint-menu-icons.py` tints the menu PNGs (`src/Images/Lucide`) from `tokens.css`.

## Previews

`art/preview-details.html` and `art/preview-settings.html`, written for this theme. Motifs drawn: the "/" title stroke and tag block, vermilion selection pills with the arrow marker, ruled group headings, ink toggles and gauges, racing stripes (title band and backdrop), teal dialog pills. Stand-in fonts: Bahnschrift is drawn with Barlow; Unbounded is bundled. Banner, cover and screenshot art are CSS placeholders (literal colors), not game art; sample games are made up.

## Deviations

- **Icons** are Lucide strokes. The game's glyphs are solid; no open solid set matched closely enough to justify a second pack.
- **No capitals.** The game sets titles and buttons in caps; WPF cannot transform Playnite's strings, and themes cannot ship their own.
- **Density.** The game's TV layout (about 48px rows at 1080p) is scaled to Playnite's 32px controls.
- **Toggle for CheckBox.** Lists of check boxes (categories in the game editor) become lists of toggles, 12px wider each.
- **More / Edit** are 40x40 with radius 16, not full discs: they take the base `Button` radius.
- **Motion** is designed, not measured: Game UI Database has stills only for this title.

## Not verified yet

Checked: build, `validate-extension.ps1`, the WPF regression tests (breakpoints, details and grid layout, close button, Steam screenshots, top panel, search), Playnite starts with the theme and logs no XAML error. **Not looked at in a live window yet** (Playnite was minimized when this was built):

- Light-theme readability in views this theme does not restyle: DataGrid (list view header), the game edit dialog, Add-ons browser, progress and message dialogs.
- Bahnschrift at 14px in WPF; whether Unbounded loads from `Typography/`.
- Play hover sweep and its capsule clip (`OpacityMask` from the Rest plate) at 125% and 150%.
- Cover hover stripe bar against the 4px corner pieces; cover buttons over the paper scrim.
- Banner bleach and fade with real art; title legibility on a bright banner.
- Empty state in both views (orbit loop starts and stops), and selected game -> grid -> details with the selection cleared.
- Toggle check boxes inside list boxes and the filter panel; indeterminate state.
- Statistics page cards wrap; ThemeModifier recolors pills, stripes and the 41px icon buttons.
- Sidebar at Right / Top / Bottom (the arrow marker is drawn for Left).
