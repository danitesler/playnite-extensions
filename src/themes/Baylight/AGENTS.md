# Baylight 27

Dark Playnite Desktop theme, version 0.1.0, theme API 2.9.0, inspired by **macOS 27 "Golden Gate"** in its Dark appearance (Faithful mode: the Mac's own tokens, shapes, states and motion). Unofficial, no Apple fonts, symbols, wallpaper or logo (see `info/NOTICE-Baylight.txt`). Dark only. Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record the sources, the sampled palette and the observed motion; the [brief](BRIEF.md) maps macOS parts to Playnite.

## Sources

`RESEARCH.md`: apple.com/os/macos (viewed in the browser pane), Apple's macOS 27 UI kit thumbnail on developer.apple.com/design/resources (colours sampled with a canvas, nothing downloaded), the Figma community "macOS 27" kit page (licence: Apple Design Resources, nothing copied), press hands-ons for the window corner, toolbar and glass-slider changes. Lens: a macOS 27 app window (Apple's Games app in Dark mode), with the Dock and Siri folded in for covers, the running state and Play.

## Tokens

All values are in `src/tokens.css`; `Constants.template.xaml` maps them.

| Token | Plays |
|-------|-------|
| `--window` / `--window-deep` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `TopPanelBackgroundBrush`, `HeaderBandBrush`, `ScrimBrush` (the wallpaper-tinted dark window) / `ShellBackgroundBrush` (the rail's tint, 62% over the desktop picture), `PanelSeparatorColor`, `TextOutlineBrush` |
| `--section` / `--section-raised` | `MainColorDark`, `BackgroundToneColor`, `ExpanderBackgroundBrush`, the grouped sections (`LocalSectionBrush`) |
| `--control` / `--control-hover` / `--control-pressed` | `MainColor`, `ButtonBackgroundBrush`, `SecondaryButtonBackgroundBrush`, `CheckBoxCheckMarkBkBrush` / `HoverColor`, `ButtonHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` |
| `--menu` | `PopupBackgroundColor`, `TooltipBackgroundBrush` |
| `--separator` / `--separator-strong` | `WindowPanelSeparatorColor`, `ProgressBarTrackBrush`, `SlotBorderBrush`, `HeadingRuleBrush` / `PopupBorderColor`, `NormalBorderBrush`, `InputBorderBrush`, `CheckBoxBorderBrush`, `SliderTrackBrush`, `MenuSeparatorBrush`, `FrameBrush` |
| `--label` / `--label-secondary` / `--label-tertiary` | `TextColor`, `HeadingForegroundBrush`, `ButtonForegroundBrush` / `TextColorDarker`, `SidebarItemForegroundBrush` / `InputHoverBorderBrush`, `ScrollBarThumbBrush`, `ThumbBrush` |
| `--white` / `--ink` | `TextColorDark`, `SelectedForegroundBrush`, `PrimaryButtonForegroundBrush`, `DangerForegroundBrush`, `CheckMarkBrush` / text on the running green |
| `--blue` / `--blue-lit` / `--blue-wash` | `GlyphColor`, `FocusBrush`, `LinkBrush`, `ValueAccentBrush`, `SidebarItemSelectedForegroundBrush`, `ProgressBarForegroundBrush`, `GridViewItemSelectedBorderBrush` / `SliderHoverForegroundBrush` / `TopPanelItemCheckedBackgroundBrush`, the tree selection pill |
| `--blue-deep` / `--blue-deep-lit` | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `PrimaryButtonBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush` (white label 5:1) / their hover |
| `--glass*` | `TopPanelSearchBoxBackgroundBrush`, `InputBackgroundBrush`, `ListItemHoverBrush`, `TabControlHeaderBackgroundBrush`, `ScrollBarTrackBrush`, `TopPanelItemHoverBackgroundBrush`, `ButtonBorderBrush`; the glass rim and sheen gradients (`LocalGlassRimBrush`, `LocalGlassSheenBrush`) |
| `--red` / `--red-deep` / `--red-lit` | `DataChangeNotifColor` (the badge dot), `NegativeRatingBrush` / `DangerBrush` (white 4.8:1) / Exit on the menu (5:1) |
| `--green` / `--orange` | `RunningIndicatorBrush`, `PositiveRatingBrush` / `MixedRatingBrush`, `WarningBrush` |
| `--tl-*` | the traffic lights (fill, rim, glyph ink, inactive grey) |
| `--silk-*` | the desktop picture (`LocalSilkBaseBrush`, `LocalSilkLightBrush`, `LocalSilkShadeBrush`); `--silk-umber-deep` is `GameBannerTintBrush`: the darkest fold of the wallpaper, so a darkened banner sinks into the desktop's own brown |
| `--orange`, `--pink`, `--purple`, `--blue`, `--teal` | the Siri glow (`LocalSiriBrush`, `LocalSiriFlowBrush`) |

Radii: `ControlCornerRadius` 12 (near-capsule at 32px: macOS large controls), `CornerRadiusSmall` 6 (repeat buttons, the popup chevron cell), `CornerRadiusLarge` 14 (menus, GroupBox cards), `CornerRadiusXLarge` 22 (the empty-page desktop); 8 for selection pills and menu highlights, 10 for covers, 12 for the metadata section caps; `CornerRadiusFull` only on fixed squares (More / Edit, cover buttons, close). Type: Segoe UI Variable Text (body) and Display (titles, headings) at 12 / 14 / 15 / 20 / 28, game title 30 bold; nothing bundled.

## ThemeModifier

Edit constants keep the shared catalog (backgrounds, buttons, selection, inputs). The rail tint follows `ShellBackgroundBrush`; the desktop picture, glass rims, Siri colours and traffic lights stay in the theme as `Local*` brushes.

## Component spacing (`src/Common.xaml`)

Buttons 16,5 (32px with `ControlHeight`); inputs 11,5; menu panel 5px inside a 1px edge, rows 28px with a 26px icon column; combo rows as menu rows; list box rows 10,5; group box 14,8,14,10 with the header 6px above the card; tooltip 9,5,9,6; `IconSize` 16; `GameBannerHeight` 300.

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | the edge-to-edge sidebar: the desktop picture (`LocalSilkRailTemplate`) under `ShellBackgroundBrush` at 62%, a 1px shade edge; the main menu is `LocalBaylightMenuMarkTemplate` (Common.xaml, also the top bar's menu button): the Baylight 27 squircle with a sun behind two swells; hover is a sunrise (the sun climbs 1.6px out of the water on a spring while the swells ripple opposite ways), open lifts the sun further on its own transform, turns it systemYellow and breathes a thin ring around it (1.3s) until the menu closes; the current item is a neutral glass pill settling in from 94% with the glyph in the accent |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml`, `CustomControls/SearchBox.xaml` | the uniform toolbar: a 52px band in the window colour, every button its own 32px glass plate (bright-top rim); the Spotlight search capsule with a persistent magnifier; the filter mark is a 10px red badge dot ringed in the window colour; the toggled view switch is blue-tinted glass with the glyph in the accent; notifications carry a red app badge |
| `DerivedStyles/MainWindowStyle.xaml` | traffic lights at the toolbar's right end (Windows order: minimize, zoom, close), 12px dots on a 20px pitch; hovering the cluster shows all three glyphs; grey while the window is inactive |
| `Views/LibraryDetailsView.xaml` | the game list on the window colour, a 1px split-view divider before the game page |
| `Views/Library.xaml`, `FilterPanelView.xaml`, `ExplorerPanel.xaml`, `MainWindow.xaml` | structure from the skeleton; window art fills the content row below the top bar |

## Game page

`art/gen-overviews.mjs` writes both overviews (then `scripts/game-page-breakpoints.mjs`). Banner: the scroll edge effect: the art is sharp above, a blurred copy (`BlurEffect` 28, cached) takes over from 40% down through a gradient mask, the banner darkening sits over both, the window colour fades in last. Title: the game's name in Segoe UI Variable Display Bold 30 (24 in the grid panel) beside the icon clipped to an app-icon squircle with a glass rim. Play is the Liquid Glass button; More and Edit are equal 36x36 glass circles. Metadata: a System Settings grouped form. Every field row carries the section fill reaching 14px past it, and each `Meta*` group break is a closing cap (rounded bottom corners), 10px of window and an opening cap, so the groups read as separate rounded cards while the fields keep the full 300px for captions and values (the clip is along the top only, so the first break hides and the fill can pass the sides). Captions sit left in 13px secondary label; text values and single links sit right-aligned; scores are the number beside a 64x4 range bar filled in the rating colour. Center / Stretch collapse the breaks into one card. Section headings are Display semibold 15 with no rule. Empty page: `LocalEmptyDockTemplate`, a small desktop (the silk picture, 22px corners) with an idle glass Dock whose middle tile, the Baylight 27 mark, bounces every 3.4s, over `LOCErrorNoGameSelected`. Grid side panel close: a 28x28 glass circle with the xmark that turns into the red traffic light on hover.

## Components

| Playnite file | Component |
|---------------|-----------|
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `CustomControls/ComboBoxList.xaml`, `FilterSelectionBox.xaml` | the macOS menu: dark panel with 14px corners, a shade edge and a glass rim; 28px rows with the accent selection pill snapping in (60ms), white label, shortcuts written the Mac way (⌥Q, ⌦, ⌃C), chevron submenus, bare checkmarks, Exit in the accessible red; the ComboBox is the pop-up button (glass face, blue 20x20 cell with up/down chevrons) (row in `docs/themes/menus.md`) |
| `DerivedStyles/PlayButton.xaml` | the Liquid Glass prominent button (see Moments) |
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml`, `DefaultControls/ListBox.xaml` | table rows: glass hover pill; selected = the inset blue pill settling from 97%; running = green frame, wash and the Dock dot |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | covers with 10px corners: Dock magnification on hover (1.07, rise 4px, soft lift shadow, glass edge), the accent focus ring on selection; Play / Info are 50px glass circles |
| `DefaultControls/Button.xaml`, `ToggleButton.xaml`, `RepeatButton.xaml`, `CheckBox.xaml`, `RadioButton.xaml`, `Slider.xaml`, `ProgressBar.xaml`, `TextBox.xaml`, `PasswordBox.xaml`, `ScrollViewer.xaml`, `Thumb.xaml`, `ToolTip.xaml`, `GroupBox.xaml`, `Expander.xaml`, `TabControl.xaml` | glass push buttons that squash on press (the default button blue), 16px checkboxes and radios in the accent, a 4px slider with a white capsule knob that stretches while dragged, thin progress bars, text fields with the 3px accent focus ring, overlay scrollers, help tags, grouped-section group boxes, disclosure chevrons, the segmented control for tabs |
| `DefaultControls/TreeView.xaml`, `DerivedStyles/StandardWindowStyle.xaml`, `WindowBarButton.xaml` | the Settings sidebar (tinted blue-wash pill with a 3x12 accent capsule, white label); the 44px unified title band with the traffic lights on the left in Mac order and the mark + title centred |
| `DerivedStyles/PropertyItemButton.xaml` | Finder tags: capsule chips with an 8px tag dot coloured by list (platforms grey, genres orange, categories green, features purple, tags blue) |

## Moments

- Hero, Play hover: the Siri glow. A five-colour halo (the `glass-halo.png` mask over `LocalSiriBrush`) rises behind the glass and a 2px rim in the same colours lights around it; a second rim with the colours reversed crossfades against it every 1.6s while the pointer stays, so the colours flow. The glass lifts to 1.03 on a spring. Press squashes it (1.04 x 0.93) and it springs back.
- Running (all four surfaces), the Dock: launching sweeps a band across the item while the Dock dot bounces twice per 1.6s pass; running breathes the frame and the dot (3.2s). The Play plate fills systemGreen with ink text; Cancel only while the button itself is hovered.
- Motion: fast 110ms (hover fills, menu snap 60ms), base 200ms (selection pills, focus ring), slow 360ms (magnification, glass release); `BackEase` 0.25-0.4 on transforms, `CubicEase` out on opacity.

## Previews

Signature motifs drawn: the edge-to-edge rail with the desktop picture, the mark in its open pose, the glass toolbar with the red badge and the blue-tinted view switch, the traffic lights, the open main menu (blue pill, ⌥Q, chevrons, red Exit, the theme's menu icons), the progressive-blur banner, the Siri-glow Play in its hovered end state, glass More / Edit circles, the grouped metadata sections with range-bar scores and Finder tags, the blue selection pill and a running row with the Dock dot; the Settings window on the desktop picture with a menu bar, the left traffic lights, the tinted sidebar selection, pop-up buttons with the blue chevron cell, a capsule slider knob. Sample games and art are invented gradients. Stand-ins: Segoe UI Variable Text / Display are drawn with Selawik in the previews.

## Deviations

- WPF has no backdrop blur, so glass is a translucent fill with a rim and a sheen; the only real blur is the banner's blurred copy of the art. The rail shows a static desktop picture, not the real wallpaper.
- The main window's traffic lights sit at the right (Windows order) because Playnite keeps the caption buttons on the toolbar's right; dialogs put them on the left in Mac order.
- Window corners are square (WPF window chrome cannot round them).
- Separate metadata cards are drawn with caps inside one column (Playnite flattens the groups into one wrap panel); rows have no hairlines between them.
- The title band title is 15px semibold (the Mac's window title), not `FontSizeLarger`.
- The Siri rim cannot rotate a theme brush (shared brushes are frozen), so two rims crossfade instead.

## Verified & remaining live checks

- Verified: `validate-extension.ps1`, all 12 WPF regression tests, 32-bit `MenuRender.ps1`, `RunningMotionFrames.ps1`, live Playnite launch with rounded grouped metadata cards and right-aligned values.
- Manual live UI spot-check remaining: Settings window, real pointer hover on Play (Siri glow), open menus, and empty game page.
