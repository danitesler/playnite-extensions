# Gumshoe — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), dark only, inspired by the menus and HUD of **Mouse: P.I. For Hire** (Fumi Games, 2026), a black-and-white 1930s rubber-hose cartoon. Unofficial and not affiliated: no logo, art or font from the game, own name, `info/NOTICE-Gumshoe.txt`. Showcase ambition (see `BRIEF.md`). Light surfaces exist only as paper objects (the metadata page, the selected-row smudge, the bookmark, tape, tags) on a dark desk.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, measurements and the capture list are in [`RESEARCH.md`](RESEARCH.md) (53 UI captures from Game UI Database, id 2378, sampled with a canvas, nothing downloaded). Creative brief (source DNA, game element map, moments, motion language, branding): [`BRIEF.md`](BRIEF.md). The source is strictly neutral grey, so every surface token is neutral; there are no motion captures, so durations and easing are inferred from the art style.

## Tokens

`src/tokens.css` names each value by its role in the game (`gs-*`). Radii: 8 medium (`ControlCornerRadius`), 4 small, 12 large, 16 xlarge, 9999 only on 1:1 discs. Borders are 2px. Fonts: Patrick Hand (body and headings, `FontFamily` / `HeadingFontFamily`) and Anton (`PosterFontFamily`: the Play label, count badges, the empty-page marquee), both OFL, bundled in `src/Typography/`; they stand in for the game's custom hand-lettered faces. Patrick Hand runs small, so the size scale is one step above Playnite's (15 / 13 / 17 / 23 / 38).

| Token | Key | Used for |
|-------|-----|----------|
| `gs-void` | `ShellBackgroundBrush`, `InputBackgroundBrush`, `TooltipBackgroundBrush`, `WindowTitleBackgroundBrush`, `PrimaryButtonBackgroundBrush`, `ScrimBrush` | Rail, title band, input wells, tooltips, the black Play sticker |
| `gs-desk` | `WindowBackgourndBrush`, `ContentBackgroundBrush` | The window page and the library layer |
| `gs-felt` | `TopPanelBackgroundBrush`, `GameOverviewBackgroundBrush`, `ExpanderBackgroundBrush`, `MainColorDark` | Top bar, game page, cards |
| `gs-chalk` / `-lit` / `-hi` | `ButtonBackgroundBrush`, `PopupBackgroundBrush`, `GameBannerTintBrush`, `ArtTintBrush` / `HoverBrush`, `ListItemHoverBrush` / `ButtonPressedBackgroundBrush` | The chalkboard modal panel (plates, popups) and its hover and pressed steps; the banner darkening colour |
| `gs-rim` / `-lit` | `PopupBorderBrush`, `ButtonBorderBrush`, `InputBorderBrush`, `FrameBrush` / `NormalBorderBrush`, `FrameHoverBrush` | The chalkboard's thin light edge and a lit step |
| `gs-paper` family | `ParchmentBrush` (`gs-paper`), `SelectedBrush`, `GlyphBrush` (`gs-paper-lit`), `PropertyItemBackgroundBrush` (`gs-paper-mid`), `HeaderBandBrush` (`gs-paper-shade`), `ParchmentEdgeBrush` (`gs-paper-edge`), `StripeDeepBrush` (`gs-paper-fold`) | The book page, the lit smudge, price tags, the page edge and fold |
| `gs-ink` family | `TextColorDark` / `SelectedForegroundBrush` / `ParchmentTextBrush` (`gs-ink`), `ParchmentTitleBrush` (`gs-ink-title`), `ParchmentLabelBrush` (`gs-ink-dim`) | Text on paper |
| `gs-cream` / `gs-smoke` / `gs-ghost` | `TextBrush` / `TextBrushDarker`, `SidebarItemForegroundBrush` / disabled | Text on the dark |
| `gs-lamp` | `RunningIndicatorBrush`, `FocusBrush`, `DataChangeNotifBrush`, `WarningBrush`, `MixedRatingBrush` | The only warm ink: running game, keyboard focus, the filter mark, warnings. Added: the game is black and white; the title screen's desk lamp as a tinted-print amber |
| `gs-stamp` | `DangerBrush`, `NegativeRatingBrush` | A rubber-stamp red for destructive hover and negative scores. Added, same reason |

Shared roles this theme added to `scripts/data/theme-keys.json`: `PosterFontFamily`, `UnderlineTemplate`, `SwagTemplate`, `SprocketStripTemplate`, `CurtainTemplate`, `SpotlightTemplate`, `ImpactTemplate`, `SplatTemplate`, `DogEarTemplate`, `RingGlowTemplate`, `BulbRowTemplate`. The motif templates live in `src/Common.xaml` (contract comment at their head); their sprites in `src/Images/fx/` come from `art/sprites.py` (deterministic, white masks coloured by theme brushes).

## ThemeModifier

Keep the ThemeModifier Edit constants list focused on main backgrounds, button fills and text, selection, and inputs. Include existing sidebar and panel surface brushes through the shared catalog. When panels share a brush or are transparent, use the existing background control. Keep the existing layout controls. Use the shared opt-ins in scripts/data/theme-keys.json and let the build generate thememodifier.yaml. Hover, pressed, and decorative colors stay in the theme. The accent picker lives in the Editor tab.

## Component spacing (`src/Common.xaml`)

| Key | Value | Mouse: P.I. For Hire |
|-----|-------|----------------------|
| `ButtonPadding` | 18,5 | Menu row label inset, cut to the 32px field height |
| `InputPadding` | 10,5 | Option row value inset |
| `MenuPadding` / `ComboBoxDropDownPadding` | 6 | Gap inside the chalkboard modal |
| `MenuItemPadding` | 12,6 | Menu row |
| `ComboBoxItemPadding` / `ListBoxItemPadding` | 10,6 | Settings row |
| `GroupBoxPadding` | 14,12,14,14 | Card body under its ribbon |
| `TooltipPadding` | 10,5 | Tooltip box |
| `ControlHeight` | 32 | Shared field height |
| `IconSize` | 16 | Shared glyph size |
| `GameBannerHeight` | 300 | Banner; title and underline sit at 126/300 of it |
| `GameBannerDarken` | 0 | Shared default |

## Shell

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml` | 44px void rail with faint grain and a column of film-sprocket holes 4px from its inner edge; the main menu is a 30px paper coin (a grey button-prompt disc) holding `LocalGumshoeMenuMarkTemplate` (Common.xaml, also the top bar button): the detective's magnifying glass with a question mark in the lens; hover gives it a damped rubber-hose wobble about the handle (-12, 9, -5, 2.5 degrees), open turns the question mark stamp red and lets the glass search in a slow Lissajous drift until the menu closes |
| `CustomControls/SidebarItem.xaml` | 44x40 cell; the current item is a paper bookmark (`BookmarkTemplate`, swallowtail foot) that drops in from above with a BackEase (200 ms) and nudges 3px down on hover |
| `Views/TopPanel.xaml` | 52px felt bar closed by a 2px dashed rule over compass ticks (two dashed `Line`s, no height added); search, filter, sorting first, view switches icon-only; toggled cells are lit paper plates with ink glyphs; filter mark is an 8x10 lamp-amber teardrop; the notification count is a 16px amber coin; 142px clear on the right |
| `CustomControls/TopPanelItem.xaml`, `SearchBox.xaml` | 34px cells (`ControlCornerRadius`, hover plate, toggled = lit paper); the search well is a void plate with a 2px rim that brightens on hover and focus |
| `Views/Library.xaml`, `LibraryGridView.xaml`, `LibraryDetailsView.xaml`, `FilterPanelView.xaml` | Flat desk layer, window-art layer per the shared Window background rules, grid details width mechanism per the shared rules, bare list on the desk, Default's filter panel respaced |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | Hairline frame; 3 x 38 chalk caption plates (30x30, 2px rim); close hovers stamp red |
| `DerivedStyles/StandardWindowStyle.xaml` | 40px void band (CaptionHeight 40): paper coin with the mark, the title with its hand-drawn underline, a row of marquee bulbs, and a curtain valance (`SwagTemplate`) hanging 14px over the content without adding height |

## Game page

Skeleton and metadata pane follow the shared rules. Both overviews are generated by `art/gen-overviews.mjs` (`node src/themes/Gumshoe/art/gen-overviews.mjs src/themes/Gumshoe/src`); edit the generator, not the views. Differences: the title is the game name in the heading face with `UnderlineTemplate` under it (width of the name); sections (`LOCGameDescriptionTitle`, `LOCNotesLabel`) sit under paper swallowtail ribbons; the metadata pane is the **case-file page**: ink on `ParchmentBrush`, two offset sheets behind it for the page edges, the top-right corner turned down (`DogEarTemplate` flap in a 28x28 cell where the page is cut away), masking tape across the top-left, 2px dashed group rules drawn by a tiled `DrawingBrush` border, scores as small ink-rimmed pills. Play time is an ordinary field of `MetaProgress`.

## Components

Both game overview files include a designed empty state using `LOCErrorNoGameSelected`; the details `PART_ScrollViewHost` stays explicitly `Visibility="Visible"`. Empty state = the Roadhouse stage: a two-rim proscenium, pleated curtains under a valance, marquee bulbs, a spotlight cone (its 3-frame opacity "boil" lives in the cone's own Style, Opacity only), the mark, and the `LOCErrorNoGameSelected` line on a swallowtail ribbon in Anton.

`GameDetailsPaneWidth` and `GridDetailsPaneWidth` both default to 300px of usable metadata content, set inside the page's 18px horizontal padding.

| Playnite file | Gumshoe component |
|---------------|-------------------|
| `DerivedStyles/DetailsViewItemStyle.xaml`, `DefaultControls/ListView.xaml` | Bare rows; hover = chalk plate; selected = the lit paper smudge (`OpacityMask` feather, ink name, a pip that pops in with a BackEase) |
| Running game (`RunningIndicatorBrush` = `gs-lamp`) | Film strip. A lamp-amber 2px frame, wash, foot line and a sweep band, plus film-sprocket holes marching along the top and bottom of a reserved 76px strip at the row's right end (`RunningMarkPlate` behind it, `StrokeDashOffset` loops: 0.6 s per hole launching, 2.4 s running); on covers and the Play button the same holes march along the edges |
| `DerivedStyles/GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml` | Weapon-wheel slot: rounded covers, a soft white ring (`RingGlowTemplate`) and a masking-tape name strip that rides up with a bounce on hover; Play and Info are porthole discs that bounce in, staggered |
| `DerivedStyles/PlayButton.xaml` | The BUY-D sticker: black plate, cream inner outline, Anton label; hover squashes and springs, inverts to lit paper and pops impact ticks; pressed swells an ink splat |
| `DerivedStyles/PropertyItemButton.xaml` | Ink links; chips are price tags (notched plate with a hole dot) |
| `DefaultControls/Button, ToggleButton, RepeatButton` | Chalk plates with a 2px rim; the `Width == 41` ThemeModifier trigger |
| `DefaultControls/TextBox, PasswordBox, ComboBox` | Void wells; the combo is the option row with a paper arrow plate; the drop-down is a chalkboard panel |
| `DefaultControls/CheckBox, RadioButton` | Button-prompt discs: grey, lit paper when checked, ink check or dot |
| `DefaultControls/Slider, ProgressBar` | Pip dashes; the slider thumb is a paper tab that tilts on hover |
| `DefaultControls/ScrollViewer, Thumb` | The pencil: a 2px line and a ridged capsule |
| `DefaultControls/ContextMenu, Menu, ToolTip` | Chalkboard modal (`LocalChalkboardMenuTemplate`: film grain, inset hairline, top masking-tape tab) across all menus, submenus, ComboBox and multi-select lists; 30px rows with feathered paper smudge + ink pip on highlight, 10px flourish breaks, void prompt-pill shortcuts, stamp-red Exit smudge, prompt-disc checks; tooltips are void boxes |
| `DefaultControls/TabControl` | Folder tabs: the selected one is paper and rises 4px |
| `DefaultControls/GroupBox, Expander` | GroupBox: a paper ribbon over a card. Expander (library groups): a dark chalk ribbon, because Playnite's group headers draw their own TextBlock in `TextBrush` |
| `DefaultControls/ListBox, TreeView` | Smudge rows; the Settings section list: 28px plates, hover chalk, selected = smudge + ink pip |

## Previews

`art/preview-details.html` and `art/preview-settings.html` are hand-written and rendered to `art/screenshot-*.png`. Signature motifs drawn: dog-eared case-file page with dashed rules and price tags, the lit smudge row, the hanging bookmark, the hovered BUY-D Play sticker with impact ticks, ribbon headings, the pencil scroll bar, film-sprocket rail and running row, the curtain-valance title band, prompt-disc check boxes and the pip slider. Fonts: Patrick Hand and Anton (bundled, no stand-ins).

## Deviations

- The details list's icon plate (a rim around each game icon in the preview) is Playnite's own item template (`DetailsViewItemTemplate`); the theme restyles only the row.
- The preview shows the in-game tooltip pointer nowhere: WPF tooltips are plain void boxes.
- Playnite's group headers (`DetailsViewGroupStyle`) draw their own TextBlock in `TextBrush`, so library group ribbons are dark chalk rather than paper.
- The source has no hue; lamp amber and stamp red are additions (state only). The accent (paper white) recolors through ThemeModifier's Editor tab.

## Not verified yet

- In-Playnite checks beyond a first look: the grid view covers (hover ring, tape strip, porthole discs), the Play button hover and press, the empty page in both views, the Settings window and its title band, a dialog's title band, ThemeModifier palette and Edit-constants recolouring, Statistics GroupBox wrapping, the context menu and combo drop-downs, a launching and a running game.
- Motion timings are inferred (no motion captures): tune them against the real feel.
- Release finish: `-Mode Package` validation and the generated README are done in this tree; there is no GitHub release or database PR yet.
