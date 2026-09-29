# Chakra UI — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) in the style of **Chakra UI v3**, fully dark with **teal** as the color palette. Standalone: every file it ships lives in this folder. Resource keys are the shared theme vocabulary (Playnite's palette plus `scripts/data/theme-keys.json`), the same as every theme here; Chakra's token paths stay in `tokens.css` and the template's placeholders.

Playnite loading rules, overlay mechanics and the build checks are in **`.cursor/rules/playnite-themes.mdc`** and skill **`playnite-theme-dev`**.

## Sources

| What | Where |
|------|-------|
| Tokens | `chakra-ui/chakra-ui` 3.37 `packages/react/src/theme`: `tokens/colors.ts`, `semantic-tokens/colors.ts`, `tokens/radius.ts`, `semantic-tokens/radii.ts` |
| Components | same package, `recipes/`: button, input, select, checkbox + checkmark, radio-group + radiomark, slider, progress, tabs, tooltip, menu, card, listbox, table, segment-group, scroll-area, badge; `preset-base.ts` (`focusVisibleRing`) |
| Icons | lucide 1.48.0 (ISC, `info/LICENSE-lucide.txt`); Chakra's docs use lucide through `react-icons/lu` |

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | Chakra's CSS variables under the names Chakra emits (`--chakra-colors-bg-panel`, `--chakra-radii-l2`, the virtual `--chakra-colors-color-palette-*`). |
| `src/Constants.template.xaml` | Tokens → Playnite's palette keys and the shared keys; rendered into `Constants.xaml`. |
| `src/Common.xaml` | `PopupBorder`, `FocusVisual`, recipe spacing. |
| `src/Media.xaml` | lucide icons (Playnite's roles plus chevron-down, chevron-right, check). |
| `src/Views/*`, `src/DerivedStyles/MainWindowStyle.xaml`, `src/CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml` | Shell. |
| `src/DefaultControls/*`, other `src/CustomControls/*` and `src/DerivedStyles/*` | Controls. |
| `info/` | `theme.yaml`, `InstallerManifest.yaml`, `danitesler_chakraui.yaml`, `icon.png`, `LICENSE-Playnite.txt`, `LICENSE-lucide.txt`. |

## Tokens

Keys are the shared vocabulary; the template names the Chakra token behind each one (`colors.bg.panel` is `chakra-colors-bg-panel`, opacity modifiers keep Chakra's `/NN`). Controls read brushes only, so ThemeModifier's palette edits (Editor tab) and the shared brushes in the generated `thememodifier.yaml` (Edit constants) recolor them.

| Group | Tokens (dark) |
|-------|---------------|
| bg | `bg` (black #09090B), `bg.muted` (gray.900), `bg.emphasized` (gray.800), `bg.inverted` (white), `bg.panel` (gray.950) |
| fg | `fg` (gray.50), `fg.muted` (gray.400), `fg.inverted` (black), `fg.error` (red.400), `fg.warning` (orange.300), `fg.success` (green.300) |
| border | `border` (gray.800), `border.emphasized` (gray.700) |
| gray palette | `gray.fg`, `gray.subtle`, `gray.muted`, `gray.solid` (white) — Button subtle, IconButton ghost, scrollbar |
| red palette | `red.solid`, `red.contrast` — close button hover, notification Badge |
| colorPalette (teal) | `contrast` (white), `fg` (teal.300), `subtle` (teal.900), `muted` (teal.800), `solid` (teal.600), `focusRing` (teal.500) |
| radii | `l1` = xs (2px), `l2` = sm (4px), `l3` = md (6px), `full` |
| opacity | `colorPalette.solid/90` (solid hover), `colorPalette.focusRing/50` (slider thumb ring), `bg.emphasized/60` (highlighted items), `bg.emphasized/72` (slider track) |

| Token | Key | Used for |
|-------|-----|----------|
| `bg` / `bg.panel` / `bg.muted` | `WindowBackgourndBrush`, `SliderThumbBackgroundBrush` / `ExpanderBackgroundBrush`, `PopupBackgroundBrush` / `InputBackgroundBrush`, `ListItemSelectedBrush`, `ProgressBarTrackBrush`, `MenuSeparatorBrush` | window, slider thumb / cards, menus / inputs, selected listbox item, progress track, menu separators |
| `bg.emphasized` / `/60` / `/72` | `TopPanelItemCheckedBackgroundBrush` / `MenuItemHoverBrush`, `ListItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` / `SliderTrackBrush` | SegmentGroup indicator / highlighted items / slider track |
| `bg.inverted` / `fg.inverted` | `TooltipBackgroundBrush` / `TooltipForegroundBrush` | tooltips |
| `fg` / `fg.muted` | `TextBrush` / `TextBrushDarker` | text, secondary text |
| `border` / `border.emphasized` | `PopupBorderBrush`, `WindowPanelSeparatorBrush` / `NormalBorderBrush`, `GridViewItemHoverBorderBrush` | popup edge / checkbox, radio, slider edges, cover hover |
| `colorPalette.solid` / `/90` / `contrast` | `GlyphBrush` / `PrimaryButtonHoverBackgroundBrush` / `TextBrushDark` | solid buttons, checked, tab indicator / solid hover / text on solid |
| `colorPalette.subtle` / `fg` | `SelectedBrush` / `SelectedForegroundBrush` | current nav item, toggled buttons, selected rows |
| `colorPalette.focusRing` / `/50` | `FocusBrush` / `FocusHaloBrush` | focus rings / slider thumb ring |
| `gray.subtle` / `gray.muted` / `gray.fg` | `ButtonBackgroundBrush`, `HoverBrush` / `ButtonHoverBackgroundBrush`, `ButtonPressedBackgroundBrush`, `ButtonBorderBrush` / `ButtonForegroundBrush` | Button subtle, IconButton ghost hover / outline edge / button text |
| `gray.solid` | `ScrollBarThumbBrush`, `ScrollBarTrackBrush`, `ThumbBrush` | scrollbar (drawn at 10–50%) |
| `red.solid` / `red.contrast` | `DangerBrush` / `DangerForegroundBrush` | close button hover, notification Badge |
| `fg.error` / `fg.warning` / `fg.success` | `WarningBrush`, `NegativeRatingBrush` / `DataChangeNotifBrush`, `MixedRatingBrush` / `PositiveRatingBrush` | errors, data-changed, ratings |
| `colorPalette.subtle` / `.fg` / `.muted` (teal) | `PropertyItemBackgroundBrush` / `PropertyItemForegroundBrush` / `PropertyItemHoverBackgroundBrush` | Badges in the game overview |

`ButtonBackgroundBrush` and `HoverBrush` hold Chakra's gray subtle (`gray.subtle`), so Playnite's notification toasts and its own list views share the button and ghost-hover colors. Font: `fonts.body` is Inter with a system fallback; Inter is not bundled, so Segoe UI.

A sibling palette (blue, purple, ...): swap the six `--chakra-colors-color-palette-*` values in `tokens.css` for that palette's semantic tokens.

## Recipe spacing (`src/Common.xaml`)

| Key | Value | Chakra |
|-----|-------|--------|
| `ButtonPadding` | 16,10 | button md: h-10, px-4 |
| `InputPadding` | 12,9 | input / select trigger md: h-10, px-3 |
| `MenuPadding` / `MenuItemPadding` | 6 / 8,6 | menu md: content p-1.5, item px-2 py-1.5 |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 4 / 8,6 | select md: content p-1, item px-2 py-1.5 |
| `ListBoxItemPadding` | 8,6 | listbox item |
| `GroupBoxPadding`, `GroupBoxHeaderMargin`, `GroupBoxHeaderFontSize` | 24, 0,0,0,24, 18 | card md: card-padding 6, title textStyle lg |
| `TooltipPadding` | 10,4 | tooltip px-2.5 py-1 |
| `IconSize` | 20 | button md `_icon` size 5 |

`FocusVisual` is `focusVisibleRing="outside"` (2px `colorPalette.focusRing`, 2px offset); inputs, the select and the search box draw `focusVisibleRing="inside"` in their templates (a 2px focus-ring edge).

## Shell

One flat surface (`bg`) for the window, sidebar and top bar; no borders or panel fills. Structure comes from spacing and teal `subtle` states.

| File | Chakra behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat: sidebar and view on `bg`, no inset. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as ghost IconButtons, size sm (36px, `MainWindowButton`), centered on the 64px bar, 24px from the right; close = red solid on hover. |
| `Views/Sidebar.xaml` | px-4 around 40px items, gap-2. Main menu = `MainMenuButton`, a rounded-full `colorPalette.solid` IconButton (40px, white icon). |
| `CustomControls/SidebarItem.xaml` | IconButton md (40px, radius l2): ghost at rest, `gray.subtle` hover; active view = teal `subtle` (`colorPalette.subtle` fill, `colorPalette.fg` icon). |
| `Views/TopPanel.xaml` | 64px bar, px-6. Playnite's view controls in one SegmentGroup on the left (`bg.muted` track, radius l3); search on the right (`TopPanelSearchBox`: InputGroup + Input `subtle`, h-10, 320px); ghost IconButtons for filters and notifications, teal `subtle` while active; red solid Badge for the notification count. |
| `CustomControls/TopPanelItem.xaml` | SegmentGroup items: 40px, 20px icons; checked = `bg.emphasized` indicator, hover = `bg.emphasized/60`. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml`, `Views/Library.xaml` | Playnite's panels on the 4px spacing scale without separators; background art under the top bar, feathered on every edge. |
| `Views/DetailsViewGameOverview.xaml`, `Views/GridViewGameOverview.xaml` | Chakra dashboard page: cover clipped to radius l3, Heading 3xl (bold), solid Play, subtle More and IconButton Edit; description and notes under Heading lg titles next to a 380px Details Card that holds every metadata field Playnite can show, as one horizontal DataList (120px `fg.muted` labels, values beside them) in the six shared groups (progress, scores, about, tags as Badges, library, links; see `.cursor/rules/playnite-themes.mdc`) split by `border` Separators. A group whose fields are all hidden collapses with its Separator. No art. The grid panel uses the same two columns (description left, a 280px Details Card right) with a vertical DataList (label over value); no tabs. Fields left out are parts Playnite skips. |

## Components

| Playnite file | Chakra recipe |
|---------------|---------------|
| `DefaultControls/Button.xaml` | button md: gray `subtle` for regular buttons, brand `solid` for `IsDefault`; fontWeight medium |
| `DerivedStyles/PlayButton.xaml` | button md, brand `solid` |
| `DerivedStyles/PropertyItemButton.xaml` | Link `plain` (gray.fg, underline on hover); tagged `Chip`, a Badge `subtle` in the brand palette (teal subtle / fg, muted on hover) |
| `DefaultControls/ToggleButton.xaml` | button: gray `subtle` off, brand `subtle` on |
| `DefaultControls/RepeatButton.xaml` | button, gray `outline` |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | input `subtle` md (+ `BareTextBox` for hosts with their own chrome) |
| `DefaultControls/ComboBox.xaml` | select `subtle` md: chevron-down indicator, content p-1, items with the check indicator at the end |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | checkmark / radiomark `solid` md: 20px, `border.emphasized` edge, `colorPalette.solid` when checked, label gap 2.5, medium |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | slider `outline` md: 8px `bg.emphasized/72` track, solid range, 20px `bg` thumb with a 2px solid edge, 3px `focusRing/50` ring on keyboard focus |
| `DefaultControls/ProgressBar.xaml` | progress `outline`, shape rounded: `bg.muted` track (l1), solid range; Chakra's fading indeterminate range |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | scroll-area md: 8px rail in `gray.solid/10`, thumb `gray.solid/25` (50 on hover and drag) |
| `DefaultControls/ToolTip.xaml` | tooltip: `bg.inverted` / `fg.inverted`, px-2.5 py-1, radius l2, xs, medium |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | menu `subtle` md: `bg.panel` content (l2, p-1.5), l1 items, `bg.emphasized/60` highlight, `bg.muted` separators, command text at 60% |
| `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | menu content, one-line styles `BasedOn` the ContextMenu |
| `DefaultControls/TabControl.xaml` | tabs `line` without the list's edge line: `fg.muted` triggers, 2px `colorPalette.solid` indicator |
| `DefaultControls/GroupBox.xaml` | card md, `elevated` without its shadow: `bg.panel`, l3, padding 24, semibold lg title |
| `DefaultControls/ListBox.xaml` | listbox `subtle` items: `bg.emphasized/60` hover, `bg.muted` selected |
| `CustomControls/SearchBox.xaml` | InputGroup with a start element (search icon) + input `subtle` md |
| `DerivedStyles/DetailsViewItemStyle.xaml` | table rows, interactive: `gray.subtle` hover, `colorPalette.subtle` selected |
| `DerivedStyles/GridViewItemStyle.xaml` | cover outline in the focus ring's shape: `border.emphasized` on hover, `colorPalette.focusRing` when selected |
| `DerivedStyles/WindowBarButton.xaml` | dialog title bar buttons: ghost IconButtons, red solid close |
| `DerivedStyles/HighlightBorder.xaml` | input `subtle` chrome for Default templates the theme does not replace |

## Deviations from Chakra

- Inputs, selects and the search box use the `subtle` variant (Chakra's default is `outline`), so fields have no visible edge; checkbox and radio edges use `border.emphasized` so they stay visible on black.
- No shadows (menus `lg`, select `md`, tooltip `md`, card `elevated`): WPF popups are layered windows, so menus and popovers get a 1px `border` edge instead, and the card is borderless `bg.panel`.
- The SegmentGroup track keeps a 4px inset and radius l3, and items are icon-sized (40px square) with no dividers between them.
- Menu icons Playnite copies stay icofont glyphs (Playnite rebuilds them from `Text`/`FontFamily`).
- The DataList has no group titles: themes cannot ship localization, so groups are told apart by Separators and spacing.

## Game page banner

The game's background art is a banner at the top of the game page (details view and grid panel), tinted at the top, darkened toward the title and faded into the page. Its height is the shared key `GameBannerHeight` (`Common.xaml`, default 320; ThemeModifier > Edit constants, slider 0 to 600). At 0 the banner and the room above the title go away and the title sits at the top of the page. Games without background art get the same layout.

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension chakraui -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: Chakra UI
```

## Not verified yet

Built and statically checked on Linux; **not yet loaded in Playnite**. First run: library (grid, details, list), game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus on buttons and inputs.

Layout checks: the SegmentGroup with many or few top bar items, the teal logo and selection in the sidebar, the subtle search input and selects (fill visible, no edge), window buttons centered on the 64px bar, the slider's outlined thumb, the 20px checkboxes and radios in settings, the select's check indicator, and the red notification badge.

Game overview: the rounded cover mask (VisualBrush), the Separators and group collapse when fields are hidden (the first visible group starts flush at the card padding), Badges wrapping in the 196px value column, the DataList at narrow widths, and the Description / Details tabs in the grid panel.
