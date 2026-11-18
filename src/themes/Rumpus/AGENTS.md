# Rumpus — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) inspired by the menus of **Party Animals** (2023). A **light** theme with no dark variant: a saturated orange page, butter panels, cream pill rows that sit on a darker lip, brown ink, a yellow pill for whatever is selected, a green Play pill and dusty blue type on secondary buttons, a chalkboard for the empty page.

Unofficial and fan-made: not affiliated with, endorsed by or sponsored by Recreate Games or the game's publisher. It ships no game art, logo, font or capture (`info/NOTICE-Rumpus.txt`). The name only echoes the source; the mark is the theme's own paw print.

Shared anatomy: **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Captures, sampled colors, component specs and where the theme departs from them: [`RESEARCH.md`](RESEARCH.md). Creative brief (source DNA, game element map, moments, motion, brand): [`BRIEF.md`](BRIEF.md). The requested reference (gameuidatabase.com, id 1890, 41 menu and HUD captures) was read in a browser pane; nothing was downloaded or shipped. Motion was not measured: stills only.

Wiring (part names, triggers, the responsive body, the overview structure) was started from this repo's Slipstream theme, the other light pill theme; every motif, token, sprite and control look was redrawn for this source.

## Tokens

`rp-*` in `src/tokens.css`. Fonts are plain `font-heading`, `font-body`, `font-note` (the font checker reads those names).

| Token | Key | Used for |
|-------|-----|----------|
| `rp-ink` | `TextColor` | Body text: 5.2:1 on the orange page, 9.8:1 on cream |
| `rp-ink-muted` | `TextColorDarker` | Captions, idle glyphs, 5.8:1 on cream |
| `rp-ink-deep` | `TextColorDark`, `SelectedForegroundBrush`, `HeadingForegroundBrush`, `SectionHeaderBrush`, `SidebarItemSelectedForegroundBrush` | Titles, text on the yellow fills |
| `rp-orange` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `HighlightGlyphColor`, `InputHoverBorderBrush`, `CheckBoxHoverBorderBrush` | The page, rims on hover |
| `rp-orange-deep` | `GameBannerTintBrush`, `ScrollBarThumbBrush` / `ThumbBrush`, `SlotBorderBrush` | Banner tint, scroll thumbs, the orange rim of a selected row and of the dialog window |
| `rp-orange-ink` | `GlyphColor`, `HeadingMarkerBrush`, `WarningBrush`, `MixedRatingBrush`, `SliderHoverForegroundBrush`, `SidebarItemSelectedGlowBrush` | Glyphs and the bone on cream |
| `rp-bar` / `rp-bar-deep` | `ShellBackgroundBrush`, `TopPanelBackgroundBrush` / `CapBarBrush` | The rail and top bar, their lip |
| `rp-butter` | `PopupBackgroundBrush`, `BackgroundToneColor`, `GameOverviewBackgroundBrush`, `ScrimBrush` | Menus, dialogs, the game page, side panels |
| `rp-butter-deep` | `PanelShadowBrush` | The Settings section column |
| `rp-header` | `WindowTitleBackgroundBrush` | Title band |
| `rp-cream` / `rp-cream-hi` / `rp-cream-white` | `NormalBrush` (and `MainColor`), `ExpanderBackgroundBrush` / `ButtonBackgroundBrush`, `InputBackgroundBrush`, `PropertyItemBackgroundBrush`, `HoverColor` / `ButtonHoverBackgroundBrush`, `ListItemHoverBrush`, `MenuItemHoverBrush`, `SliderThumbBackgroundBrush`, `WindowTitleForegroundBrush` | Rows, pills, inputs, hovered pills |
| `rp-cream-lip` | `ButtonBorderBrush`, `NormalBorderBrush`, `InputBorderBrush`, `HeadingRuleBrush`, `CheckBoxBorderBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush`, `ButtonPressedBackgroundBrush` | Lips, rims, rules, tracks |
| `rp-yellow` / `-hi` / `-deep` | `SelectedBrush`, `ListItemSelectedBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush`, `GridViewItemSelectedBorderBrush`, `TabItemIndicatorBrush` / `SelectedHoverBrush` / `SelectedBorderBrush` | Selection and the lip under it |
| `rp-green` / `-hi` / `-deep` / `-ink` | `PrimaryButtonBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `StripeAltBrush` / `…HoverBackgroundBrush`, `CheckBoxCheckedHoverBackgroundBrush` / `PrimaryButtonPressedBackgroundBrush`, `PrimaryButtonBorderBrush` / `PrimaryButtonForegroundBrush`, `MainMenuButtonForegroundBrush` | Play, default dialog button, the main menu pill, ON toggles |
| `rp-green-bar` / `rp-green-ok` | `ProgressBarForegroundBrush` / `PositiveRatingBrush` | Level bar, good scores |
| `rp-blue` / `-ink` / `-hi` | `StripeBrush` / `ButtonForegroundBrush`, `PropertyItemForegroundBrush`, `FocusBrush` / `FocusHaloBrush` | Confetti, secondary button type, links, focus ring |
| `rp-coral` / `rp-red` | `DataChangeNotifBrush`, `StripeAccentBrush` / `DangerBrush`, `NegativeRatingBrush` | Filter dot, badge, close hover |
| `rp-indigo` / `-deep` | `RunningIndicatorBrush` / `StripeDeepBrush` | The running game |
| `rp-chalk` / `-hi` / `-white` | `TooltipBackgroundBrush` / `TooltipBorderBrush` / `TooltipForegroundBrush` | Tooltips, the empty page board |

`Stripe*` keys (shared, first added for Slipstream) carry the confetti colors here: blue, green, coral. `BoneGeometry` and `PawGeometry` are new shared Icons keys (`scripts/data/theme-keys.json`).

Radii: `ControlCornerRadius` 16 (a true capsule on a 32px control: the face is 29px over a 3px lip), `CornerRadiusLarge` 20 (cards, input wells, panels, popups), `CornerRadiusSmall` 10, `CornerRadiusXLarge` 28. Covers are radius 12 inside a 4px sticker border of radius 16.

**Banner darkening color**: `GameBannerTintBrush` = `rp-orange-deep` `#D38C37`, the burnt orange rim of the game's menu panels, so a darkened banner keeps the page's warmth.

Fonts: `FontFamily` and `HeadingFontFamily` = Nunito (Regular, Bold, ExtraBold and Black bundled in `src/Typography/`, SIL OFL; a stand-in for the game's proprietary heavy rounded face). `NoteFontFamily` = Patrick Hand (the chalkboard notes and tooltips). Weights set in XAML: Regular for descriptions, Bold for labels, ExtraBold for buttons and tabs, Black for titles.

## Component spacing (`src/Common.xaml`)

| Key | Value | From |
|-----|-------|------|
| `ControlHeight` | 32 | Repo rule; the game's option row height scaled to desktop |
| `ButtonPadding` | 18,5 | Room for the pill ends |
| `InputPadding` | 12,5 | |
| `MenuItemPadding`, `ComboBoxItemPadding` | 8,7,12,7 | 31px rows |
| `GroupBoxPadding` / `GroupBoxHeaderPadding` | 16 / 16,14,16,0 | Card body and its ruled heading |
| `IconSize` | 18 | |
| `GameBannerHeight` | 320 | Spacer ratio 100/320 (details), 72/320 (grid) |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px yellow bar rail closed by a 3px lip. Main menu: a 32px green QUICK JOIN pill with a lip. Items 44x40 with a 32px cream pill over a lip; hover lifts the face 1.5px with an overshoot; the current item is the yellow pill with a yellow-deep lip and a small orange tab on the rail's outer edge |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 56px yellow bar closed by a 4px lip. Search (280x32, a sunk well with a 3px top lip), filter toggle, sorting first, tools, icon-only view switches, notifications. Every plate is a 32px cream pill over a lip that lifts on hover; toggled = yellow. Filter active = 10px coral dot with a cream rim. Notification badge = coral. 168px clear for window buttons |
| `DerivedStyles/MainWindowStyle.xaml` | 46x32 cream pills over a lip; close hovers red over an orange-deep lip |
| `Views/Library.xaml` | The orange page; game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength. The top bar, side panels and game pages go see-through then; the banner collapses |
| `Views/FilterPanelView.xaml`, `ExplorerPanel.xaml` | Butter side panels, 28px filter controls, Expander headers as cream pills with a lip |

**Settings chrome.** Title band (`StandardWindowStyle.xaml`): 44px header yellow with a 4px orange-deep lip, the paw mark, the title in Nunito Black 20px in cream over a hard 2px orange shadow (a second TextBlock bound to `PART_TextTitle`), four confetti bits left of the caption pills; the body is butter with a 2px orange-deep rim. Section list (`TreeView.xaml`): 30px cream pill rows on the butter-deep column; hover = lighter pill + a half-lit bone at the row's end; selected = yellow pill over a yellow-deep lip with a 2px orange-deep rim and a full bone; children indent; width 256 (Settings) / 280 (Add-ons) with the scroll lane reserved.

## Game page

Skeleton and metadata pane as in `../AGENTS.md`. Differences: the page is butter (`GameOverviewBackgroundBrush`) on the orange page; the banner is warmed by a butter wash (ScrimBrush at 28 percent) and faded with a gradient from transparent white. The title is preceded by a bone. Cards are cream option rows over a 4px lip headed by a Black title and a 4px rounded tan rule. Chips are cream pills over a 2px lip with blue bold type. Action row is 40px: Play pill, More and Edit 40x40 cream icon buttons. Details view caption column 112px.

## Components

| Playnite file | Drawn as |
|---------------|----------|
| `Button`, `ToggleButton`, `RepeatButton` | A lit cream face over a 3px lip with dusty blue ExtraBold type; hover lifts the face 1.5px (BackEase), pressed drops it onto the lip; default button is the green pill; checked toggle is yellow over a yellow-deep lip |
| `CheckBox` | The game's ON / OFF toggle: a 36x20 tan capsule, cream 16px knob over a short shadow; on = green capsule with a green-deep rim, the knob slides right with an overshoot |
| `RadioButton` | 18px cream disc, 2px tan ring, orange dot |
| `Slider`, `ProgressBar` | The audio slider: 10px tan capsule, orange fill, 20px cream knob over an orange-deep lip; the level bar: 12px tan capsule with a green fill |
| `TextBox`, `PasswordBox`, `ComboBox` | Sunk cream wells (1px sides, 3px top rim), radius 20 (a capsule at 32px), blue focus ring |
| `TabControl` | Cream pills over a lip; selected = yellow over a yellow-deep lip |
| `GroupBox` | Cream card over a 4px lip, Black heading plus a 4px rounded rule (content-sized: the rule is a star column) |
| `Expander` (+ group headers) | A cream pill over a 2px lip with the group chevron |
| `ListBox`, `DetailsViewItemStyle` | Cream pill rows over a lip; selected = yellow pill, 2px orange-deep rim and a bone at the end |
| `Menu`, `ContextMenu`, `ToolTip` | Butter sheet with a 2px tan rim; the tooltip is the chalkboard with chalk-white handwriting |
| `PlayButton` | The hero. A 40px green capsule over a 4px lip with a chevron. Hover (0.14s, BackEase): the face lifts 2px, a lighter plate fades in, a pale sheen crosses once, the chevron nudges right, eight confetti bits (blue, coral, yellow, cream) pop out and fade over 0.55s. Pressed: the face drops 3px onto the lip, its own plate fades in |
| `GridViewItemStyle` | Selected: 4px yellow sticker border. Hover: a 4px cream-white border fades in and a three-colour confetti ribbon wipes along the cover's bottom edge |
| Running game (`RunningIndicatorBrush` = `rp-indigo`) | The ping bars: three rising bars (details row, list row, cover, Play plate) that fill in order while launching (an indigo sweep crosses the plate, the foot line fills) and bob slowly while running (frame breathing 0.72 to 1, 3.2s). Play's plate turns indigo with a cream label; hover on RUNNING swaps the label for Cancel (button only, `Self`) |
| `GridViewItemTemplate` | Sticker tile (radius 12 with a transparent mask), orange scrim on hover, 44px round pills over a lip: green Play, cream Info with a blue glyph |
| Empty game page (both overviews) | A chalkboard card (`TooltipBackgroundBrush`) with the paw drawn in dashed chalk and a few chalk marks, and a taped yellow sticky note holding `LOCErrorNoGameSelected` in handwriting; the note sways 2.2 degrees every 4.2s (`ControlTemplate.Triggers`, named transform) |
| `NotificationMessage` | Cream card with a ghost close glyph |

No sprites: the source is flat color with lips, so nothing is generated. `scripts/render-icons.ps1 -Extension rumpus` uses `icons.json` to tint the menu PNGs (`src/Images/Lucide`) from `tokens.css`. `art/mark.svg` is the paw (the same path is `PawGeometry` in `Media.xaml`).

## Previews

`art/preview-details.html` and `art/preview-settings.html`, written for this theme. Motifs drawn: lip pills, the bone pointer, the staged Play hover with confetti, cream option cards, the butter Settings window with the paw, a cream title over a hard shadow, ON/OFF toggles, the tan slider. Stand-in fonts: Nunito is bundled. Banner, cover and screenshot art are CSS placeholders (literal colors), not game art; sample games are made up. The settings backdrop (a sunburst and confetti) is preview-only.

## Deviations

- **Icons** are Lucide strokes, 2.5px thick. The game's glyphs are solid and proprietary; Play is redrawn as a fat rounded chevron, the bone and paw are the theme's own.
- **No capitals.** The game sets labels in caps; WPF cannot transform Playnite's strings.
- **Flat lips, no blur shadows.** The game's menus are 3D rendered with soft shadows; the theme draws a 2-4px lip layer (no `DropShadowEffect`).
- **Title shadow** is a second TextBlock offset below, not an outline.
- **Menu panel tilt** (the Custom Game card leans about 1.5 degrees) is not reproduced on layout surfaces; only the empty-page sticky note sways.
- **Density.** The game's TV layout is scaled to Playnite's 32px controls.
- **Motion** is designed, not measured: Game UI Database has stills only for this title.

## Not verified yet

Checked: build, `validate-extension.ps1`, the WPF regression tests, Playnite starts with the theme and logs no XAML error, a live capture of the details view with the selected row, Play and the chips. The Settings window chrome was rendered in the WPF harness, not opened in Playnite. **Not looked at in a live window yet:**
- Grid view covers (sticker border, hover buttons) and the sidebar at Right / Top / Bottom.
- The game edit dialog, Add-ons browser, progress and message dialogs, the list view header (DataGrid) on the orange page.
- Play hover confetti and sheen at 125% and 150% scaling; the empty state in both views; selected game -> grid -> details with the selection cleared.
- Statistics page cards wrap; ThemeModifier recolors pills, lips and the 41px icon buttons.
