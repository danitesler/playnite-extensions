# Relay: theme notes

## What this is

Standalone dark Playnite Desktop theme, `ThemeApiVersion` 2.9.0, inspired by the Mass Effect 2 menus (BioWare, 2010): the Options screen, the codex, squad selection and research. One dark variant. Unofficial; not affiliated with, endorsed by or sponsored by BioWare or Electronic Arts. No game art, logo, font or capture ships: icons, plate shapes, the glow sprite and the tile mark are original. The name echoes the mass relays without using the game's name. See `info/NOTICE-Relay.txt`.

Shared anatomy and first-run checks: [`../AGENTS.md`](../AGENTS.md). Loading rules: `.claude/skills/playnite-theme-dev/reference.md`.

## Sources

[`RESEARCH.md`](RESEARCH.md): Game UI Database captures, sampling method and table, interface rules, motion notes, fonts. Structural source: Playnite Default 10.60 (MIT, `info/LICENSE-Playnite.txt`). Wiring of the shell, game pages and filter overlays started from Glyphbit's files (part names, triggers and regression-tested mechanics only); every look was rewritten.

## Tokens

`src/tokens.css` names each colour by its role on screen (`me-*`).

| Token | Playnite / shared keys |
|-------|------------------------|
| `me-void` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `InputBackgroundBrush`, `ScrimBrush`, `CheckBoxCheckMarkBkBrush`, `TextColorDark` |
| `me-hull` | `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `BackgroundToneColor` |
| `me-panel`, `me-panel-hi` | `MainColorDark`, popups, tooltips, `ExpanderBackgroundBrush` (cards, metadata pane); search well hover, chips |
| `me-row-hover` | `HoverColor`, `ListItemHoverBrush`, top bar hover |
| `me-plate`, `me-plate-hi` | `MainColor`, `ButtonBackgroundBrush`, `MenuItemHoverBrush`, `ArtTintBrush`; button hover |
| `me-rule`, `me-rim`, `me-copper` | separators, slider and progress tracks; `NormalBorderBrush`, button and input rims, scroll thumb; `FrameBrush`, `PopupBorderColor`, pressed button |
| `me-orange`, `me-amber`, `me-sand`, `me-gold`, `me-dust` | links, `HeadingMarkerBrush` ("+" marker, ticks), hover rims, slider; sidebar and top bar glyphs; `TextColor`; button text, `FocusBrush`; `TextColorDarker` |
| `me-lime`, `me-lime-mid`, `me-lime-hover`, `me-lime-deep`, `me-olive` | `GlyphColor`, titles, `SelectedBorderBrush`, `SelectedForegroundBrush`, `DataChangeNotifColor`, Play label and bloom; (tab rule reference); Play hover; `HighlightGlyphColor`, Play plate, selected tab; `SelectedBrush`, checked toggles |
| `me-new` | `HeadingMarkerAltBrush` |
| `me-yellow`, `me-renegade` | `WarningBrush`; `DangerBrush`, `NegativeRatingBrush` |

Unused for now: `me-steel`, `me-teal`, `me-paragon` (kept for disabled plates and dialogue colours). Radii are all 0: corners are cut by `ChamferTemplate`. Fonts: `Segoe UI` body; headings `./Typography/#Orbitron`, then `Orbitron, Eurostile Extended, Microgramma, Bahnschrift SemiBold, Segoe UI` (Korataki in the game; Orbitron Regular is bundled in `src/Typography/`). Scale 12 / 14 / 15 / 20 / 28.

## Component spacing (`src/Common.xaml`)

| Key | Value |
|-----|-------|
| `ButtonPadding` / `InputPadding` | 16,5 / 8,5 |
| `MenuPadding` / `MenuItemPadding` | 0,4 / 14,6 |
| `ComboBoxDropDownPadding` / `ComboBoxItemPadding` | 0,3 / 12,5 |
| `ListBoxItemPadding` / `TooltipPadding` | 12,5 / 10,6 |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 16,12,16,14 / 0,0,0,8 |
| `IconSize` / `ControlHeight` | 16 / 32 |
| `GameBannerHeight` | 340; spacer `x * 180 / 340` (details), `x * 140 / 340` (grid) |
| `GameDetailsPaneWidth` / `GridDetailsPaneWidth` | 300 / 300 |

## Shared shapes (`src/Common.xaml`)

- `ChamferTemplate`: the menu button plate. Top-left and bottom-right corners cut at 45 degrees, size from the host's `Padding.Left` (5 on small cells, 7 on buttons, 10 on Play, 12 on the metadata pane, 14 on the empty state). Background body, 1px BorderBrush rim, honeycomb band in BorderBrush at 0.22 through the middle row. Built from rectangles and stretched triangles: no desired size, safe in the Statistics GroupBox.
- `SlantPlateTemplate`: the research row and selected option, a parallelogram (slant = `Padding.Left`) with a 1px rim. Settings rows and metadata chips.
- `GlowFrameTemplate`: 9-slice rim bloom from `Images/fx/glow-frame.png` (`art/sprites.py`), host at Margin -28. Play bloom and the metadata pane.
- `CornerMarksTemplate`: 10px, 1.5px HUD targeting brackets (cover hover, empty state, Steam skeleton).
- `DividerTemplate`: heading rule, a 1px line at 0.55 with a slanted 18px tick (description and notes).

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px warm black rail with a dark copper edge; lime main menu glyph over a slanted lime tick; items 44x40, 16px glyph, no `IconPadding`; current = olive cut-corner plate, lime rim, lime glyph, slanted lime tick on the rail edge |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px warm black bar closed by a 1px `me-rule` line with a 240px copper segment; 32px icon cells with 5px cuts; current view = olive plate, lime rim; filter mark = 8x9 lime hexagon; search 240px well with 6px cuts; 132px kept clear for the caption buttons |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). |
| `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | 44px title band (CaptionHeight 44, content offset 44): slanted lime tick, lime display title (`LOCSettingsLabel` for the Settings window), honeycomb field fading in toward the right, copper closing rule with an orange segment under the title; 46x44 caption cells, close hovers Renegade red; 1px copper frame |
| `DerivedStyles/MainWindowStyle.xaml` | 1px dark copper edge; caption buttons 40x32 |

## Game page

Skeleton as shared, generated by `art/gen-overviews.mjs` (edit it, then `node src/themes/Relay/art/gen-overviews.mjs`). Banner: art under the amber wash (0.3) and 3px scanlines (0.35), plain gradient to the page, no mask (Play animates over it). Title in lime display type, no icon frame. Description and notes have no heading, only `DividerTemplate` in orange. Metadata pane: `ChamferTemplate` codex panel (cut 12, copper rim, panel fill) with a copper bloom at 0.16, a lime tick on its top edge and an orange "+" top-right; the padded inner Border keeps the 300px content width.

Empty state: a codex panel waiting for a target. The relay mark (`EmptyGameIcon`) breathes 1 to 0.55 over 3s inside targeting brackets, a lime scan line sweeps the panel (Margin animation in a clipped fixed-size host), and an orange segment runs along a five-segment shield bar. Loops animate plain properties only and run only while no game is selected.

## Components

| Playnite file | Mass Effect 2 element |
|---------------|-----------------------|
| `Button`, `ToggleButton`, `RepeatButton` | bottom bar buttons (Info, Exit): amber cut-corner plate, honeycomb, gold text; hover fades a lit plate in (0.12s); default and checked = selected option (olive, lime rim); Width=41 ThemeModifier detection, scaled to 32x32 |
| `PlayButton` | lime confirm plate (cut 10) with bloom at 0.25; hover swells the bloom to 0.7, fades a brighter plate in and sweeps a slanted light band across it every 1.6s while hovered; separate pressed plate |
| `GridViewItemStyle` | selected: 2px orange frame and orange "+"; hover: lime targeting brackets close in from 10px to 3px (0.18s, eased) with a lime outline |
| `GridViewItemTemplate` (`GridTileButton`) | 44px honeycomb-cell (hexagon) buttons, copper rim, gold glyph; lit lime cell on hover; staggered rise and BackEase scale entrance |
| `TreeView` | Options menu: 30px rows, slanted warm plate on hover with a half-lit "+", selected = olive slanted plate with lime rim, lime label nudged 3px right and the orange "+"; orange/lime triangle expanders; Settings width 250, Extensions 280, scroll lane reserved |
| `TabControl` | codex tabs: lime rule, selected tab a lime trapezoid with lime rim and text |
| `ListBox`, `DetailsViewItemStyle`, `ComboBox` items | hover = warm plate with an orange left tick; selected = olive between lime rules (details rows add a slanted lime tick) |
| `CheckBox`, `RadioButton` | 18px cut-corner black well, lime core and rim when checked; hexagon cell with a lime hexagon core |
| `Slider`, `ProgressBar` | audio bar: 4px track, orange fill, slanted 10x18 marker; HUD shield bar of slanted 10px segments |
| `TextBox`, `PasswordBox`, `SearchBox`, `HighlightBorder` | sunken wells with amber rims, orange on hover, gold on focus with an orange tick |
| `GroupBox` | codex panel card: lime heading, cut-corner copper-rimmed plate, orange "+" (content-sized) |
| `ContextMenu`, `Menu`, `ToolTip` | warm black panels in copper rims; menu hover = dark amber plate with an orange tick |

## Previews

`art/preview-details.html` and `art/preview-settings.html` (rendered with `.\scripts\take-screenshots.ps1 -Extension relay`). Signature motifs drawn: lime display titles behind a slanted lime tick; amber cut-corner plates with a honeycomb band; the selected option as an olive plate with a lime rim plus the orange "+"; the copper-rimmed codex panel; scanlines over the banner and backdrop. Stand-in fonts: Orbitron for the heading stack (via the `Eurostile Extended` alias), Selawik for Segoe UI.

## Deviations

- Heading font: Korataki is commercial and cannot ship; the bundled Orbitron stands in, a little rounder than the game's face.
- The honeycomb sits only in the middle band of each plate, so it never spills into the cut corners (WPF has no size-bound clip for the cut shape).
- Menu icons Playnite copies (`AddGameIcon`, ...) keep Playnite's own glyphs, recoloured by the palette.

## Not verified yet

- Live look in Playnite beyond a clean startup: hover Play, covers and the cover buttons at 125% and 150% scaling; Statistics cards wrap; Settings and Add-ons trees with every node open; game edit dialog tabs; filter sidebar 28px fields; ThemeModifier recolouring and its 32x32 pencil / restore buttons.
