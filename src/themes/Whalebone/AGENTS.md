# Whalebone — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the menus and overlays of **Dishonored 2** (Arkane Studios, 2016) as seen in public captures. Showcase ambition (`BRIEF.md`). Unofficial: not affiliated with, endorsed by or sponsored by Arkane Studios, Bethesda or ZeniMax (`info/NOTICE-Whalebone.txt`). It ships no game files, logos or fonts; the mark is a medallion ring around a carved bone spindle crossed by a slit bar, with one glass shard breaking through the ring (`art/mark.svg`, `IconMainMenu`, `EmptyGameIcon`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Captures, sampled values, interface parts and motion: [`RESEARCH.md`](RESEARCH.md). Creative brief (source DNA, game element map, moments, motion, brand): [`BRIEF.md`](BRIEF.md). Captures from Interface In Game were sampled in a scratch folder; none are committed or shipped.

## Tokens

`wb-*` in `src/tokens.css`. Radii: `wb-radius` 2px (`ControlCornerRadius`), `wb-radius-sm` 1px, `wb-radius-lg` 3px, `wb-radius-xl` 4px (keycaps). The torn plates carry the shape; corners stay nearly square.

| Token | Key | Used for |
|-------|-----|----------|
| `wb-pitch` | `ShellBackgroundBrush`, `ScrimBrush`, `WindowTitleBackgroundBrush`, `TextShadowBrush`, `BevelShadowBrush` | Rail, dialog title band, scrims, title shadow |
| `wb-ink` | `MainColor`, `ButtonBackgroundBrush`, `SecondaryButtonBackgroundBrush`, `TopPanelBackgroundBrush`, `PopupBackgroundColor`, `TooltipBackgroundBrush`, `ExpanderBackgroundBrush`, `HeadingMarkerAltBrush` | Ink plates, keycaps, top bar, popups, caption smears |
| `wb-slate` / `wb-slate-hi` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `ArtTintBrush`, `GameBannerTintBrush` / `MainColorDark`, `BackgroundToneColor` | Page, game page, banner darkening |
| `wb-pewter` / `-hi` | `HoverColor`, `ButtonHoverBackgroundBrush`, `ListItemHoverBrush`, `MenuItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` / `ButtonPressedBackgroundBrush`, `ScrollBarThumbBrush` | Hover plates, pressed |
| `wb-line`, `wb-rim`, `wb-rim-dim` | `NormalBorderBrush`, separators, `HeadingRuleBrush` / `ButtonBorderBrush`, `CheckBoxBorderBrush`, keycap rims / `InputBorderBrush`, `PopupBorderColor`, `FrameBrush` | Hairlines and rims |
| `wb-ash` / `wb-chalk` / `wb-ink-text` | `TextColorDarker` / `TextColor` / `TextColorDark`, `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush` | Muted labels, text, ink on bone |
| `wb-bone` / `wb-bone-shade` | `GlyphColor`, `SelectedBrush`, `ListItemSelectedBrush`, `PrimaryButtonBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush`, `SidebarItemSelectedGlowBrush`, `TabItemIndicatorBrush`, `SliderThumbBackgroundBrush` / `SelectedSheenBrush`, `PrimaryButtonPressedBackgroundBrush`, `SectionHeaderBrush`, `WarningBrush` | The cursor stroke and marble paper; its veins and iron brackets |
| `wb-frost` / `wb-frost-blue` | `SelectedBorderBrush`, `FocusBrush`, `FrameHoverBrush`, `PrimaryButtonGlowBrush`, `PrimaryButtonHoverBackgroundBrush`, `GridViewItemHoverBorderBrush` / `HighlightGlyphColor`, `FocusHaloBrush`, `CheckBoxHoverBorderBrush`, `MixedRatingBrush`, `TopPanelRuleEndBrush` | Frost light on whatever is chosen |
| `wb-violet` / `-hi` | `InputBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush`, `PropertyItemBackgroundBrush`, `ProgressBarTrackBrush` / hover fills | Value plates and chips |
| `wb-teal` / `wb-teal-hi` | `LinkBrush`, `PositiveRatingBrush` / `DataChangeNotifColor` | Keywords and links / the "!" filter mark and notification badge |
| `wb-wine` / `wb-blood` / `wb-blood-hi` | `HeadingMarkerBrush` / `DangerBrush` / `NegativeRatingBrush` | Crimson smear under titles / close and errors |
| `wb-oil` | `RunningIndicatorBrush` | Whale-oil amber, the running and launching game only |

**Banner darkening color**: `GameBannerTintBrush` = `wb-slate` (`#181b22`). The game has no art tint of its own; its overlays wash the world in this cold slate, the darkest branded surface.

**Fonts** (bundled in `src/Typography/`, OFL, unmodified; `OFL.txt` holds all three notices): `FontFamily` Zilla Slab Regular / Italic / Bold (body, italic labels and tooltips, the notification count); `HeadingFontFamily` and `UIFontFamily` Cinzel Regular / Bold (titles, buttons, tabs); `NoteFontFamily` Marck Script (section captions, dialog titles, the empty page; Reserved Font Name, so never subset). Previews use the same faces from `scripts/fonts/`.

## ThemeModifier

Keep the ThemeModifier Edit constants list focused on main backgrounds, button fills and text, selection, and inputs. Include existing sidebar and panel surface brushes through the shared catalog. When panels share a brush or are transparent, use the existing background control. Keep the existing layout controls. Use the shared opt-ins in scripts/data/theme-keys.json and let the build generate thememodifier.yaml. Hover, pressed, and decorative colors stay in the theme. The accent picker lives in the Editor tab.

## Component spacing (`src/Common.xaml`)

| Key | Value | Dishonored 2 |
|-----|-------|--------------|
| `ButtonPadding` | 18,5 | Entry label inset on its ink plate, cut to the 32px field height |
| `InputPadding` | 16,5 | Value plate text clears the 10px pointed ends plus 6 |
| `MenuPadding` / `ComboBoxDropDownPadding` | 4 | Thin gap around a list |
| `MenuItemPadding` | 14,7 | Pause menu entries |
| `ComboBoxItemPadding` / `ListBoxItemPadding` | 14,7,12,7 | 12px right clears the selected paper's hook |
| `GroupBoxPadding` | 16,10,16,14 | Statistics sheet body under its script caption |
| `TooltipPadding` | 10,5 | Help text chip |
| `ControlHeight` / `IconSize` | 32 / 16 | Shared |
| `GameBannerHeight` / `GameBannerDarken` | 300 / 0 | Art band above the title; shared default |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | 44px pitch rail closed by a hairline; the main menu is a 32px ink medallion with the bone mark; hover fades in a ring of frost ticks and a frost bloom |
| `CustomControls/SidebarItem.xaml` | 44x40 cell; hover lifts an ink plate; current item = the bone cursor stroke wiping in from the rail edge (0.2s) behind an ink glyph, plus a 2px frost tick |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px ink bar closed by the fracture rule (`GlowLineTemplate`); 34px cells, ink plate on hover, bone stroke + ink glyph when toggled; filter mark = 9px teal disc with a halo; notification count on a 15px teal disc; progress bar 12px with 12px label margins |
| `CustomControls/SearchBox.xaml` | Violet value plate with pointed ends; frost rim and bloom on focus |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | Frame, medallion `MainMenuButton`, caption buttons on ink plates (blood on close) |
| `DerivedStyles/StandardWindowStyle.xaml` | 44px pitch title band: tick-ring medallion, the title in Marck Script on a crimson smear, fracture rule along the foot |
| `Views/Library.xaml`, `FilterPanelView.xaml` | Flat slate library (nothing behind covers); window art at full strength with the soft bottom fade |

## Game page

Generated by `art/gen-overviews.mjs` (`node src/themes/Whalebone/art/gen-overviews.mjs src/themes/Whalebone/src`); edit the generator, not the views. Banner 300px with two fracture hairlines and shards over the art; spacer `x * 170 / 300` (details, floor 20) and `x * 120 / 300` (grid, floor 14); Cinzel caps title on a crimson smear with a pitch shadow; brush-stroke Play (176x40, bleeding 10px) then 40x40 keycap More / Edit (`LocalKeycapButton`, 30px after Play for the bleed and shards). Section captions are script on ink smears. Metadata is a Statistics sheet: italic slab labels, a dotted leader, values right; the grid pane keeps the shared 2*:3* columns. Empty page: the frost medallion in a tick ring, `LOCErrorNoGameSelected` in script on a crimson smear, the fracture rule, three shards drifting on `Canvas.Top` / `Opacity` only.

## Components

| Playnite file | Dishonored 2 component |
|---------------|------------------------|
| `Common.xaml` | `InkPlateTemplate` (entry plate), `TornPlateTemplate` (cursor stroke with veins), `SelectionBarTemplate` (marble paper row with frost edges and hooks), `LocalBrushStrokeTemplate`, `LocalKeycapTemplate`, `LocalValuePlateTemplate`, `LocalInkSmearTemplate`, `LocalHooksTemplate`, `LocalSlotBracketsTemplate`, `GlowLineTemplate` (fracture rule), `GlowFrameTemplate` (frost 9-slice), `FramedPlateTemplate` (filigree corners) |
| `Button`, `RepeatButton`, `ToggleButton` | Entries on ink plates in Cinzel caps; default buttons and checked toggles are the bone stroke with ink caps; Width == 41 keeps ThemeModifier's 32x32 icons |
| `TextBox`, `PasswordBox`, `ComboBox` | Value plates: violet, pointed ends, pale rim; combo knob = 20px bone disc with an ink chevron (36px reserved); multi-line text boxes stay square |
| `CheckBox`, `RadioButton` | Ink square / ring; checked = bone fill with an inked check / bone disc in a frost ring |
| `Slider`, `ProgressBar` | Dotted ash track, bone bar, 16px bone disc thumb with frost halo / violet track, bone fill, frost edge |
| `TabControl` | Ink plate tabs; selected = marble paper in iron brackets with a "v" notch |
| `TreeView` | Bare 28px rows; hover ink wash; selected = faint bone stroke, 2px frost bar, bright label |
| `GroupBox` | Statistics sheet card, script header on an ink smear, content-sized |
| `ListBox`, `DetailsViewItemStyle`, `ListView` | Ink plate hover; marble paper selection with ink text |
| `ContextMenu`, `Menu`, `ComboBox`, `ComboBoxList`, `FilterSelectionBox` | Shared `LocalMenuPanelTemplate` (Dunwall ink well with `FramedPlateTemplate` filigree corners and faint wine wash), 30px rows, `SelectionBarTemplate` marble-paper highlight with curled frost hooks and ink text, fracture hairline + bone shard group break, `LocalKeycapTemplate` Cinzel shortcuts, blood-red Exit row with chalk ink, bone diamond check mark |
| `PlayButton` | Bone cursor stroke in a frost hairline frame with hooks; hover: frost bloom, wet stroke wipe, three shards out (50 ms stagger); press 90 ms |
| `GridViewItemStyle`, `GridViewItemTemplate` | Covers clipped to the campaign slot's notched corners; hover = frost frame with offset brackets, "v" hook and a shard; selected = bone hairline + thin brackets; Play / Info = keycap prompts rising in (60 ms stagger) |
| Running game (`RunningIndicatorBrush` = `wb-oil` `#e39a43`) | Rows and list rows: 2px amber frame with an ink keyline, wash, band sweep, foot line and three amber shards in a 50px strip. Cover: inset 4px frame, rising band, foot tape. Play: plate fills amber under a pitch scrim (0.55 launching, 0.48-0.62 running) with a chalk label (5:1 or better), band across the stroke (1.15s of a 1.65s loop), shards lighting in turn; running breathes on 3.2s; Cancel only on hover of the RUNNING button (`RelativeSource Self`) |
| `PropertyItemButton` | Chalk values turning teal; chips are violet plates with a pale rim |
| `ToolTip` | Ink plate, slab italic text (the game's help text) |

## Previews

Hand-written `art/preview-details.html` and `art/preview-settings.html`, colors from `var(--wb-*)`; icons come from `art/icons.mjs` (the `<!-- icons:begin -->` block), sprites from `src/Images/fx/` through `-webkit-mask`. Signature motifs drawn: the brush cursor (rail, toggled cells, Play, Accept/Save), marble paper row with frost hooks, ink plates, value plates with pointed ends and the round knob, paper tab in iron brackets, keycap prompts, teal "!" disc, fracture rule with a shard, crimson and ink smears under script captions, the Statistics-sheet metadata. Literal colors are only the banner, screenshot and icon art placeholders. Fonts: Zilla Slab, Cinzel, Marck Script, no stand-ins.

## Deviations

- Dishonored 2 mixes typefaces inside one menu (slab, tracked caps, script); a theme cannot pick a face per entry, so caps cover buttons and tabs, slab covers text, script covers captions only.
- WPF has no letter-spacing: Cinzel caps are untracked.
- The game's slider shows its value inside the thumb and arrow buttons at both ends; Playnite's sliders range from 0-1 to hundreds, so the thumb is a plain disc and the track has no arrows.
- Zilla Slab is not trimmed with `scripts/subset-theme-fonts.py` (fontTools was not installed when the theme was built; the faces are Latin-only already, about 270 KB each).

## Not verified yet

- Built and validated on macOS (`validate-extension.ps1` Ci and Package modes, `build-theme.ps1 -NoDeploy`); Playnite was not run. On Windows: deploy with `.\scripts\build-theme.ps1 -Extension whalebone -Launch` and run the WPF regression tests (`GamePageBreakpoints`, `DetailsViewLayout`, `GridOverviewLayout` at banner heights 0/5/10/20, `SidePanelCloseButton`, `SteamScreenshots`, `TopPanelLayout`, `SearchGlyph`, `SearchClear`, `RunningIndicator`, `RunningLabelOverlap`, `RunningMotionFrames -Keys whalebone`).
- In Playnite: the brush and frost masks at 125% / 150% scaling (cover hover repaint), the notched cover clip, the Play hover shards and wipe, the empty page drift in both views, ThemeModifier palette and constants edits, Statistics GroupBox wrapping, and Settings / ThemeModifier title bands (no stray `PART_TextTitle`).
