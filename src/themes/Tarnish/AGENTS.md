# Tarnish: theme notes

## What this is

Standalone dark Playnite Desktop theme, `ThemeApiVersion` 2.9.0, inspired by the Elden Ring menus (FromSoftware, 2022): the System options, Inventory and status panels, item and dialogue boxes, the title prompt. One dark variant. Unofficial; not affiliated with, endorsed by or sponsored by FromSoftware or Bandai Namco Entertainment. No game art, logo, rune, font or capture ships: icons, shapes, the glow sprite and the tile mark are original. The name echoes "the Tarnished" without using the game's name. See `info/NOTICE-Tarnish.txt`.

Shared anatomy and first-run checks: [`../AGENTS.md`](../AGENTS.md). Loading rules: `docs/themes/reference.md`.

## Sources

[`RESEARCH.md`](RESEARCH.md): Game UI Database captures, sampling method and table, interface rules, motion notes, fonts. Structural source: Playnite Default 10.60 (MIT, `info/LICENSE-Playnite.txt`). Wiring of the shell, game pages and filter overlays started from Relay's files (part names, triggers and regression-tested mechanics only); every look was rewritten.

## Tokens

`src/tokens.css` holds the palette under `er-*` names. Main roles:

| Token | Key | Used for |
|-------|-----|----------|
| `er-void` #0b0b08 | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `ScrimBrush`, `WindowTitleBackgroundBrush`, `TextBrushDark` | rail, top bar, title band |
| `er-night` #11100c | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `TooltipBackgroundBrush` | pages |
| `er-well` #0e0d0b | `ButtonBackgroundBrush`, `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush` | button plates, input wells |
| `er-panel` #191813 | `PopupBackgroundBrush`, `ExpanderBackgroundBrush`, `NormalBrushDark` | panels, menus, the metadata pane |
| `er-hover` #2b2920 | `HoverBrush`, `ListItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` | hover bars and patches |
| `er-select` #3d3b2f | `SelectedBrush`, `NormalBrush`, `ButtonHoverBackgroundBrush`, `PrimaryButtonBackgroundBrush`, `MenuItemHoverBrush` | the selected option bar, lit plates, Play |
| `er-select-hi` #4f4b3a | `SelectedHoverBrush`, `ButtonPressedBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush` | pressed and hovered lit plates |
| `er-haze` #47463a | `ArtTintBrush` | haze over art and along the library's bottom |
| `er-rule` #2f2d24 | `PanelSeparatorBrush`, `WindowPanelSeparatorBrush`, `SlotBorderBrush`, `FrameInnerBrush` | dim rules, panel outlines |
| `er-line` #5c5a4d | `NormalBorderBrush`, `ButtonBorderBrush`, `InputBorderBrush`, `PopupBorderBrush`, `FrameBrush` | button and input outlines |
| `er-hairline` #8a887c | `HeadingRuleBrush`, `CheckBoxBorderBrush`, `TopPanelRuleStartBrush` | fading section rules |
| `er-text` #cdcdcb / `er-text-dim` #a3a39c / `er-bright` #e8e6dc | `TextBrush` / `TextBrushDarker` / `SelectedForegroundBrush` | text, captions, selected labels |
| `er-gold-pale` #dfc798 | `GlyphBrush`, `HeadingForegroundBrush`, `PrimaryButtonForegroundBrush`, `FocusBrush`, `WindowTitleForegroundBrush` | accent, titles, Play label |
| `er-parchment` #cec391 | `SelectedBorderBrush`, `FrameHoverBrush`, `InputHoverBorderBrush`, `ProgressBarForegroundBrush`, `PropertyItemForegroundBrush` | lit outlines, hairlines on the selected bar, links |
| `er-gold` #f4cb4c | `PrimaryButtonGlowBrush`, `SidebarItemSelectedGlowBrush`, `HeadingMarkerAltBrush`, `DataChangeNotifBrush`, `WarningBrush` | the light streak, blooms, diamonds |
| `er-crimson` #a8322a | `DangerBrush`, `NegativeRatingBrush` | close hover |

Radii are all 0. Fonts: `FontFamily` = Palatino Linotype, Book Antiqua, Georgia; `HeadingFontFamily` = bundled Cinzel Regular (`src/Typography/`), then Palatino Linotype, Georgia. Sizes 12 / 14 / 15 / 19 / 30.

## Component spacing (`src/Common.xaml`)

| Key | Value | From |
|-----|-------|------|
| `ControlHeight` | 32 | repo rule |
| `ButtonPadding` | 18,5 | label inset from the bar's faded end, about 18px at desktop scale |
| `InputPadding` | 8,5 | repo rule (vertical 5) |
| `MenuItemPadding` / `ListBoxItemPadding` / `ComboBoxItemPadding` | 16,6 / 14,5 / 14,5 | option rows 36px apart at 1080p, about 30px here |
| `GroupBoxPadding` | 16,12,16,14 | status panel insets |
| `GameBannerHeight` | 340 | default banner |

Shared shapes, all without a desired size: `SelectionBarTemplate` (olive bar fading over 14px left and up to 64px right, hairlines along top and bottom), `FramedPlateTemplate` (plate, 1px outline, faint second line 3px inside), `GlowLineTemplate` (the light streak: elliptical bloom and 1px hot core), `DividerTemplate` (hairline fading right, led by a 7px diamond), `CornerMarksTemplate` (9px corner ticks), `GlowFrameTemplate` (9-slice bloom from `Images/fx/glow-frame.png`).

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | 44px rail in the void, 1px dim rule; main menu = pale gold glyph on the light streak |
| `CustomControls/SidebarItem.xaml` | 44x40, no plates; hover a faint patch of light (animated), current = pale gold glyph, gold glow, streak under it, gold diamond on the rail's left edge |
| `Views/TopPanel.xaml` | 52px, hairline bright near the left end fading right; 32px frameless cells; filter mark = 8px gold diamond |
| `CustomControls/TopPanelItem.xaml` | hover = soft patch; toggled = olive patch + parchment streak + bright glyph |
| `Views/Library.xaml` | Game art behind the top bar and the views only while Playnite's "Use game background image as window background" is on, at full strength: Playnite's darken and blur are the only treatment (no theme scrim, tint or mask). The top bar, side panels and game pages go see-through then; the banner collapses (repo rule "Window background"). |
| `DerivedStyles/MainWindowStyle.xaml` | 1px dim frame, 40x32 caption buttons |

## Game page

Generated by `art/gen-overviews.mjs` (edit the generator). Skeleton as in `../AGENTS.md`; differences: the title is in the heading face in pale gold; the metadata pane is a status panel (dark fill, dim outline, a brighter hairline across its top fading to both ends with a gold diamond at its middle); description and notes are led by the section rule instead of a caption. Empty state: the guiding light (`EmptyGameIcon`) breathing over a streak, above a dark band fading at both ends with `LOCErrorNoGameSelected` in pale gold capitals-face and a second streak pulsing under it. Loops animate `Opacity` only, from `Style` triggers.

## Components

| Playnite file | Elden Ring source |
|---------------|-------------------|
| `DefaultControls/Button.xaml` | menu button (Key Bindings, Next): black plate, thin outline; hover lights it olive and raises the streak |
| `DerivedStyles/PlayButton.xaml` | the confirm button lit: olive plate, parchment outline, gold label on the title-prompt streak; hover bloom, breathing streak, drifting light band; brass pressed plate |
| `DefaultControls/TreeView.xaml`, `ListBox.xaml`, `DerivedStyles/DetailsViewItemStyle.xaml` | System option rows: fading hover bar, fading olive selected bar between hairlines, gold diamond |
| `DefaultControls/TabControl.xaml` | icon tab row: patch of light and streak under the current tab |
| `DefaultControls/Slider.xaml` | options slider: thin track, pointed bright bar |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | square well with a gold diamond; diamond outline with a diamond core |
| `DefaultControls/GroupBox.xaml` | status panel section: gold title, fading rule, dim-outlined panel (content-sized) |
| `DefaultControls/ProgressBar.xaml` | vitals bar; indeterminate = a streak of light running along it |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | item box: dark panel, fading hairline on top, olive hover |
| `DerivedStyles/GridViewItemStyle.xaml` | inventory slot: static parchment frame, ticks and glint when selected; animated gold outline, closing ticks and breathing bloom on hover |
| `DerivedStyles/GridViewItemTemplate.xaml` | button prompts: 44px black discs in a parchment ring, lit olive with a gold ring on hover |
| `DerivedStyles/StandardWindowStyle.xaml` | menu header: 44px band lit olive at the left, icon tile with a gold glint, gold title, fading hairline |
| `DerivedStyles/PropertyItemButton.xaml` | parchment links; chips are small dim-outlined plates |
| Running game (`RunningIndicatorBrush` = `er-focus-blue`) | fog through a gate and spirit motes in FP blue: a very wide symmetric haze (`RunningScan`, 0.45 of the width each side, a sine ease) drifts across details rows, list rows, covers and the framed plate, a hairline foot that fades at both ends fills behind it, and three motes (`RunningMote`, 2, 3 with their `RunningRise` transforms) lift off as it passes. **Launching:** the haze takes 1.4s (2s loop) and the motes rise as it clears. **Running:** the foot stays full, the frame breathes 0.74 to 1 and the motes rise one after another, fading as they go (3.6s). The plate holds a 0.88 scrim over the blue while launching and breathes 0.55 to 0.68 while running under the pale-gold label; hover on RUNNING (button only, `Self`) swaps the label for Cancel, and the lit plate, sweep and streak are off while launching or running. |

## Previews

Both previews are written for this theme. Motifs drawn: the fading selection bar with hairlines and a gold diamond, the gold light streak (main menu, current rail item and tab, Play, focused field, lit button), fading section rules led by a diamond, the icon-tile title band, frameless icon tabs, the haze rising from the bottom. Fonts: Palatino Linotype is drawn with Gelasio; Cinzel is bundled. The banner art is a CSS gradient landscape, not game art.

## Deviations

- The game's rules and bars fade at both ends over a share of their length; WPF masks here use fixed feather widths (14px and up to 64px) so short rows stay readable.
- Selected labels are brighter than in the game (`er-bright`), where selection is carried almost only by the bar; a launcher list needs the extra cue.
- Body and title fonts are stand-ins (see Sources); capital-only title casing is not forced, because themes cannot change text case.
- Motion durations are estimates, not frame-stepped (RESEARCH.md -> Motion).

## Not verified yet

Checked by script only (build, `validate-extension.ps1`, the WPF regression tests for both overviews, top panel, search box, side panel close button, Steam screenshots). Still to look at in Playnite itself: every item of `../AGENTS.md` -> First run, hover animations at 125% and 150% scaling (cover bloom overlap near the list edges, Play streak leftovers), Statistics cards wrapping, the Settings and Add-ons trees with every node open, ThemeModifier recoloring of the streak and blooms, and the 41px ThemeModifier buttons.
