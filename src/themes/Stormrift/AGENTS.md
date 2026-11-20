# Stormrift: theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the interface of **Heroes of the Storm** (Blizzard Entertainment) as seen in public captures. Unofficial: not affiliated with, endorsed by or sponsored by Blizzard Entertainment (`info/NOTICE-Stormrift.txt`). It ships no game files, no Blizzard logos and no proprietary fonts; the mark is a faceted pointy-top hexagon ring enclosing three inward storm shards around a small central hexagon (`art/mark.svg` and `IconMainMenu`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Captures, sampled values and rules: [`RESEARCH.md`](RESEARCH.md). Creative brief (source DNA, game element map, signature moments, motion language, branding, review): [`BRIEF.md`](BRIEF.md). Reference captures (`gameuidatabase.com`, id `1338`) were inspected in Chrome; nothing was downloaded or shipped.

## Tokens

`sr-*` in `src/tokens.css`. Corner radii: `sr-radius` 2px (`ControlCornerRadius`), `sr-radius-sm` 1px (`CornerRadiusSmall`), `sr-radius-lg` 4px (`CornerRadiusLarge`).

| Token | Key | Used for |
|-------|-----|----------|
| `sr-white` / `sr-ice` / `sr-lavender` | `TextBrush`, `HeadingForegroundBrush`, `SelectedForegroundBrush`, `SidebarItemSelectedForegroundBrush`, `ButtonForegroundBrush`, `TabItemHoverForegroundBrush` / `MainMenuButtonForegroundBrush`, `PropertyItemForegroundBrush` / `TextBrushDarker`, `TabItemForegroundBrush`, `SidebarItemForegroundBrush` | Primary text and headings, secondary icon/chip ink, muted labels and idle tabs |
| `sr-void` | `ShellBackgroundBrush`, `ScrimBrush`, `ArtTintBrush`, `GameBannerTintBrush`, `TextShadowBrush`, `BevelShadowBrush` | Sidebar rail, background scrims, text shadows, banner darkening |
| `sr-topbar` / `sr-tooltip` | `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush` / `PopupBackgroundColor`, `TooltipBackgroundBrush` | Top bar, window title band, popups and tooltips |
| `sr-panel` / `sr-panel-deep` / `sr-panel-lit` | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` / `ExpanderBackgroundBrush` / `InputHoverBackgroundBrush` | Page body, window chrome, expanders, hovered inputs |
| `sr-well` / `sr-well-deep` | `MainColor` (`NormalBrush`), `InputBackgroundBrush`, `TopPanelSearchBoxBackgroundBrush` / `CheckBoxCheckMarkBkBrush` | Recessed field wells, cards, checkbox interior |
| `sr-plate`, `-hi`, `-press` | `ButtonBackgroundBrush`, `MainMenuButtonBackgroundBrush`, `PropertyItemBackgroundBrush`, `SecondaryButtonBackgroundBrush` / `HoverBrush`, `ButtonHoverBackgroundBrush`, `ListItemHoverBrush`, `MenuItemHoverBrush`, `TopPanelItemHoverBackgroundBrush` / `ButtonPressedBackgroundBrush` | Flat cosmic-indigo plates and hover/press states |
| `sr-ready`, `-hi`, `-press`, `-edge`, `-hot` | `PrimaryButtonBackgroundBrush`, `PrimaryButtonHoverBackgroundBrush`, `PrimaryButtonPressedBackgroundBrush`, `PrimaryButtonBorderBrush`, `PrimaryButtonGlowBrush` | Pointed-hex Ready primary action slab |
| `sr-sel`, `-hi`, `sr-tab` | `SelectedBrush`, `ListItemSelectedBrush` / `SelectedHoverBrush` / `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush` | Magenta-violet active selection plates and checked toggles |
| `sr-line-dim`, `sr-line`, `sr-rim`, `sr-rim-lit`, `sr-track` | `WindowPanelSeparatorBrush`, `MenuSeparatorBrush`, `FrameInnerBrush`, `ScrollBarTrackBrush` / `NormalBorderBrush`, `InputBorderBrush`, `HeadingRuleBrush`, `TopPanelRuleStartBrush` / `ButtonBorderBrush`, `PopupBorderBrush`, `FrameBrush`, `ScrollBarThumbBrush` / `SelectedBorderBrush`, `TabItemIndicatorBrush`, `GridViewItemSelectedBorderBrush`, `FrameHoverBrush` / `SliderTrackBrush`, `ProgressBarTrackBrush` | Hairlines, borders, luminous ice-periwinkle selection/focus rims |
| `sr-periwinkle` / `sr-cyan` | `SectionHeaderBrush`, `HeadingMarkerBrush`, `HighlightGlyphBrush`, `TitleSuffixBrush` / `GlyphBrush`, `FocusBrush`, `LinkBrush`, `GridViewItemHoverBorderBrush`, `SidebarItemSelectedGlowBrush`, `SliderThumbHoverBorderBrush` | Section headers/markers, links, focus, hover locks, sidebar selection glow |
| `sr-boost` | `RunningIndicatorBrush`, `PositiveRatingBrush` | Launching/running hex lattice sweep, mini talent hexes, positive rating |
| `sr-gold` / `sr-crimson` / `sr-ally` | `DataChangeNotifBrush`, `WarningBrush`, `MixedRatingBrush` / `DangerBrush`, `NegativeRatingBrush` / `ProgressBarForegroundBrush` | Active filter hex pip & unread badge, danger/close actions, progress fill |

**Banner darkening color**: `GameBannerTintBrush` = `sr-void` (`#0a041a`), the deepest cosmic void-indigo of the Nexus shell, keeping darkened banners within the indigo palette.

**Fonts**: `HeadingFontFamily` Sora (`Sora-SemiBold.ttf`, `Sora-Bold.ttf` bundled under `src/Typography/`, OFL) for headings, buttons, and uppercase section labels; `FontFamily` Segoe UI (`MonospaceFontFamily` Consolas). Preview HTML uses `Selawik` as the Linux/macOS metric stand-in for Segoe UI and `Sora` directly.

## Component spacing (`src/Common.xaml`)

| Key | Value | Why |
|-----|-------|-----|
| `ControlHeight` | 32 | Shared repo rule for inputs and controls |
| `IconSize` | 16 | Standard action/glyph size |
| `ButtonPadding` / `InputPadding` | 16,5 / 10,5 | Balanced uppercase labels and 32px form wells |
| `ComboBoxItemPadding`, `ListBoxItemPadding` | 14,7,10,7 | Clearance for selection plate bar and pointer |
| `MenuPadding`, `ComboBoxDropDownPadding` | 4 | Compact popup frame margin |
| `MenuItemPadding` / `TooltipPadding` | 12,7 / 10,6 | Context menu and tooltip breathing room |
| `GroupBoxPadding` / `GroupBoxHeaderMargin` | 14,12,14,14 / 0 | Framed plate content padding |
| `GameBannerHeight` / `GameBannerDarken` | 320 / 0 | Banner hero height and ThemeModifier darken floor |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | 44px `sr-void` rail closed by a 1px hairline. Main menu icon sits inside a double-bezel 36x38 / 30x32 pointy-top hex seal (`Seal`) over `GlowFrameTemplate`, turning bright with a cosmic cyan bloom on hover. Window-art mode makes the rail background transparent |
| `CustomControls/SidebarItem.xaml` | 44x40 item cell; hover smoothly fades a cosmic plate; selected shows the magenta-violet dome selection fill, cyan left glow bar, and luminous rim |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | Top bar with faint hex-lattice wash and azure radial highlight behind navigation items, closed by an ice-periwinkle center-flared gradient rule (`GlowLineTemplate`); smooth hover/toggled fades (`TopPanelItem`); active filter places a quest-gold (`DataChangeNotifBrush`) mini hex pip at the icon corner (`Tag == True`); notifications badge sits in a quest-gold mini plate |
| `CustomControls/SearchBox.xaml` | Recessed indigo well with clear action and focus highlight |
| `DerivedStyles/MainWindowStyle.xaml` | Frameless window shell, double-bezel hex `MainMenuButton`, caption buttons |
| `Views/Library.xaml`, `LibraryGridView.xaml`, `FilterPanelView.xaml` | Library grid/details hosts; full-strength `PART_ImageBackground` when `ShowBackgroundImageOnWindow` is enabled; zoom slider and themed filter panel |

## Game page

Generated via `art/gen-overviews.mjs` (`node src/themes/Stormrift/art/gen-overviews.mjs src/themes/Stormrift/src`), implementing `applyGamePageBreakpoints`:

- Banner: hero banner at `GameBannerHeight` with a gradient fade into the cosmic page surface and ThemeModifier darken layers (`GameBannerDarken` + `0.5` floor layer); collapses when `ShowBackgroundImageOnWindow` is on.
- Title & actions: uppercase `Sora` title with drop shadow, double-bezel pointed-hex `Ready` `PlayButton`, plus sculpted bevel square plates for More and Edit.
- Body: responsive columns separating description, media/features, links, and metadata; metadata sits in a framed card with uppercase `sr-periwinkle` group labels and crisp white values.
- Grid side panel: includes 28x28 `SidePanelCloseButton` and pinned `InlineSidePanelCloseButton` sharing the same template when `GameBannerHeight < 120` or window art mode is active.

## Components

| Playnite file | Drawn as |
|---------------|----------|
| `Common.xaml` | Shared templates: `BevelTemplate` (vertical depth shadow + top-center radial dome highlight + fine hex-lattice grain + top specular flare + bottom bounce), `ChamferTemplate` (pointed-hex left/right 12px end caps with matching vertical depth, radial dome, hex grain, and mitered rims), `FramedPlateTemplate`, `SelectionBarTemplate` (radial magenta-orchid dome + hex grain + top gleam + cyan bar), `GlowLineTemplate`, `GlowFrameTemplate`, `TabItemIndicatorTemplate`, `DividerTemplate`, `CornerMarksTemplate`, `BrandMarkTemplate` |
| `Button`, `RepeatButton`, `ToggleButton` | Sculpted rectangular `BevelTemplate` plates with smooth CubicEase hover/press fade transitions (`0.14s` in / `0.26s` out) and `1px` press dip; `IsDefault` (`Accept`/`Save`) keeps rectangular HotS proportions with arcane-violet dome flare & bloom; base `Button` preserves ThemeModifier's 41px `LayoutTransform` (`0.7804878`) scale rule |
| `TextBox`, `PasswordBox`, `ComboBox`, `DatePicker` | 32px (`ControlHeight`) recessed wells with cyan focus rim, smooth item hover fade, and right-reserved combo chevron |
| `CheckBox` / `RadioButton` | Sunken well square with smooth hover border glow and periwinkle check (`100ms` fade) / hex-faceted radio with cyan accent |
| `Slider` / `ProgressBar` | 3-layer energy beam fill (cyan bloom + ally-blue fill + ice-white filament) and sculpted thumb with hover/drag glow; multi-trigger disables ThemeModifier `GameBannerHeight` / `GameBannerDarken` sliders while window background art is enabled |
| `ScrollViewer`, `Thumb`, `Expander`, `GroupBox` | Slim scrollbars fading in window-art mode; `GroupBox` content-sized framed plates with top dome glow; `Expander` transparent header strip under window art |
| `ToolTip`, `ContextMenu`, `Menu`, `ListBox`, `TreeView`, `ListView` | Cosmic Nexus menu panel (`LocalMenuPanelTemplate`: void-indigo, `hexgrid.png` wash, `FramedPlateTemplate` rim, top-centre cyan hex crest) shared across menus, submenus, ComboBox and multi-select lists; 30px rows, magenta-orchid `SelectionBarTemplate` highlight with sliding cyan hex pip, tapered hairline breaks around a mini periwinkle hex, recessed Sora SemiBold shortcut chips, Exit on a deep crimson plate with white ink (>6.6:1), checked/chosen rows a cyan-rimmed magenta hex with check (docs/themes/menus.md); smooth-fading list hover/selection plates, and 28px bevelled nav tree rows with radiant magenta selection (`WindowSettings` 250px / `WindowExtensions` 280px) |
| `TabControl` | Minimal tabs with animated hover wash and `TabItemIndicatorTemplate` bottom bar |
| `StandardWindowStyle`, `WindowBarButton` | Dialog frame with top-center electric azure flare, 44px hex-patterned title band, double-bezel hex badge, Nexus flare rule, and caption buttons |
| `PlayButton` | Double-bezel pointed-hex `Ready` slab (outer recessed dark hex cradle + textured arcane-violet dome core + top edge flare + ambient bloom surging smoothly `0.16->0.56` on hover + diagonal sheen); switches to Boost teal (`RunningIndicatorBrush`) when launching/running |
| `GridViewItemStyle`, `GridViewItemTemplate` | Double-ringed pointy-top hex tile hover sockets (`GridTileButton` with transparent hit grid) and cyan focus brackets / periwinkle selection rim |
| `DetailsViewItemStyle`, `ListView` | Rows with radial magenta-orchid selection plate, 2px cyan accent bar, and Boost-teal running overlay |
| Running game (`RunningIndicatorBrush` = `sr-boost` `#0fe7d0`) | **Launching & Running**: `RunningIndicator` overlay drawn in `RunningIndicatorBrush` across `DetailsViewItemStyle`, `ListView`, `GridViewItemStyle`, and `PlayButton` (`RunningActionIndicator`), combining a clipped hex-lattice scan (`RunningScan`) and three staggered mini talent hexes (`RunningHex1`/`2`/`3`); triggers use `IsRunning` / `IsLaunching` with `RemoveStoryboard` on exit, and hover on running `PlayButton` swaps the label to Cancel via `RelativeSource Self` |
| `PropertyItemButton` | Cosmic chip buttons for metadata tags/genres/developers |

## Previews

Hand-written HTML in `art/` (`preview-details.html`, `preview-settings.html`) driven strictly by `src/tokens.css` variables (`var(--sr-*)`, 0 literal hex colors) and inline SVGs matching `Media.xaml` geometries and `mark.svg`. Rendered screenshots live at `art/screenshot-details.png` and `art/screenshot-settings.png`. Previews use `Sora` natively and `Selawik` as the stand-in for `Segoe UI`.

## Deviations

- Pointed-hex (`ChamferTemplate`) geometry is reserved exclusively for the signature `PlayButton` `Ready` slab (`Accept`/`Save` dialog buttons keep clean HotS rectangular bevel plates alongside `Cancel`), main-menu hex seal, cover hover tiles, and running hex indicators, preserving dialog alignment and WPF hit-testing.
- Native WPF lacks CSS `letter-spacing`, so tracked uppercase headers rely on uppercase converters and `Sora` SemiBold glyph metrics.
- Blizzard proprietary display typefaces are replaced by bundled OFL `Sora`.

## Not verified yet

- Created on macOS where `pwsh` and Windows Playnite Desktop (`10.60+`) are unavailable: `scripts/validate-extension.ps1 -Extension stormrift -Mode Package`, `scripts/build-theme.ps1 -Extension stormrift -Launch`, WPF C# regression tests (`dotnet test tests/Tests.csproj`), and live visual verification inside Playnite at 100% / 125% / 150% DPI scaling have **not** been executed yet.
