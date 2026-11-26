# Cold Seat — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, Playnite 10.45+) after the **Warcraft III: The Frozen Throne menus** (main menu, options, game lobby, LAN list): forged iron frames between black grooves with rivets, deep blue button plates lit along the top, gold labels that turn white on hover, black edit wells, a royal blue selection bar. Dark only. Unofficial and standalone: no Blizzard asset is in it (`info/NOTICE-ColdSeat.txt`). Resource keys are the shared vocabulary; the game's look lives in `tokens.css` under this theme's own `--wc3-*` names.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

**Intended layout: the sidebar on the left** (repo rule): a 44px compact rail. Right mirrors it; top and bottom draw a strip as a fallback.

## Sources

Reference notes, measurements, and asset sources are documented in [`RESEARCH.md`](RESEARCH.md).

## Tokens

Type: body and headings `Friz Quadrata TT, Palatino Linotype, Book Antiqua, Georgia`; sizes 12 / 14 / 15 / 20 / 32. `ControlCornerRadius` 2, small 1, large 3, x-large 4.

| Token | Key |
|-------|-----|
| `--wc3-gold` | `GlyphBrush`, `ButtonForegroundBrush`, `PrimaryButtonForegroundBrush`, `FocusBrush`, `HeadingForegroundBrush`, sidebar glyphs, check marks, dropdown arrows |
| `--wc3-white` | `TextBrush`, `ButtonHoverForegroundBrush`, `SelectedForegroundBrush`, `TooltipForegroundBrush` |
| `--wc3-muted` | `TextBrushDarker` |
| `--wc3-void` | `WindowBackgourndBrush`, `ShellBackgroundBrush`, `ContentBackgroundBrush`, `TextBrushDark` |
| `--wc3-night` | `NormalBrushDark`, `ExpanderBackgroundBrush` (panel glass) |
| `--wc3-dialog` | `PopupBackgroundBrush`, `TooltipBackgroundBrush`, `InputHoverBackgroundBrush` |
| `--wc3-stone` (iron band) / `-light` / `-border` (lit edge) | `FrameBrush`, `ButtonBorderBrush`, `TopPanelBackgroundBrush`, `WindowTitleBackgroundBrush` / `FrameHoverBrush`, `InputBorderBrush`, `MenuSeparatorBrush` / `BevelLightBrush`, `NormalBorderBrush`, `PopupBorderBrush` |
| `--wc3-groove` | `FrameInnerBrush`, `BevelShadowBrush` (85%), `CheckBoxBorderBrush` |
| `--wc3-stone-dark` | `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush` |
| `--wc3-blue` / `-hover` / `-deep` | `ButtonBackgroundBrush`, `PrimaryButtonBackgroundBrush`, `PropertyItemBackgroundBrush` / `ButtonHoverBackgroundBrush`, `HoverBrush` / `ButtonPressedBackgroundBrush` |
| `--wc3-blue-lit` / `-glint` | `SelectedSheenBrush`, `PrimaryButtonBorderBrush` (lit plate line) / `SelectedBorderBrush`, `SliderThumbBackgroundBrush`, `PrimaryButtonGlowBrush` |
| `--wc3-royal` | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `ListItemHoverBrush` (30%), `SidebarItemSelectedGlowBrush` (55%) |
| `--wc3-ice` | `ProgressBarForegroundBrush`, `ArtTintBrush` (8%) |

## Component spacing (`src/Common.xaml`)

`ButtonPadding` 14,4; `InputPadding` 8,4; item paddings 8,5; menu surface 3; group box 12; tooltip 10,6; `IconSize` 16; `GameBannerHeight` 320; `GameDetailsPaneWidth` 300; `GridDetailsPaneWidth` 300.

Shared templates defined there:

- `FramedPlateTemplate`: the glue button. Groove, 3px iron band (lit top/left, dark bottom/right), groove, then the host's `Background` as the plate with the host's `BorderBrush` as its lit top/left line and sheen. The plate starts 4px inside the bounds; hosts lay hover and pressed layers at `Margin="4"`.
- `RivetsTemplate`: bevel plus six rivets, laid over a panel's 8px iron band. No desired size.
- `BevelTemplate`: plain iron plate (title band).

## Shell

Left 44px void rail that merges into the library (no divider on its edge), icon-only items (gold, white on hover, royal blue glow when current); the top panel is a forged iron band with icon view switches (current = blue plate with a lit blue rim) and a black search well, 146px clear for the caption buttons; library art cooled and dimmed under `ScrimBrush` and `ArtTintBrush`; caption buttons 46x40 with a red close hover (dialog caption buttons: 40x32 Marlett cells).

**Settings chrome.** A 2px iron window rim and a 44px forged iron title band (`BevelTemplate`) closed by a black groove over a lit iron line, a rivet at each end, the title in menu gold between two barbed iron spikes (the ones beside the menu buttons); 40x32 Marlett caption cells. Section list (`DefaultControls/TreeView.xaml`): the main menu's button column, 30px rows in the body face, menu-gold labels; hover = the blue plate in its iron frame (white label, dim gold diamond), selected = the plate lit (white label, full gold diamond); children under a 1px iron line; width 256 (Settings), 280 (Add-ons).

## Game page

Shared skeleton. Gold title; the metadata pane sits in a riveted iron frame (8px band between grooves, `RivetsTemplate` as a sibling overlay in the same cell) around panel glass. Play is the menu button: blue plate in its iron frame with a barbed iron spike at each end (15px reserved per side), gold label with the black text shadow, white on hover. More and Edit are square glue buttons (`SecondaryButton` is the base Button).

Steam screenshots use a framed section behind the shared current-game eligibility gate in both views. Each Game.Id update restarts the 12-second skeleton; a timed-out Steam result shows an ice diamond and localized LOCNoItemsFound. Loaded content, non-Steam games and an unavailable plugin hide the placeholder/empty result. WPF regression coverage: `tests/wpf/SteamScreenshotsRegressionTests.ps1` (timing-sensitive: run it while Playnite is not starting up).

## Components

| File | Source component |
|------|------------------|
| `Button`, `SecondaryButton`, `PlayButton` | Glue button: blue plate, iron frame, gold label; hover lights the plate and whitens the label; pressed darkens and pushes the label 1px; disabled = black plate (locked lobby slots) |
| `ComboBox` | Popup menu button: the same plate, white value, solid gold triangle |
| `CheckBox` | 20px iron bezel, black well, heavy gold tick with a dark gold underside |
| `Slider` | 10px black channel in an iron rail, faint blue fill, 18px blue gem in an iron ring |
| `TextBox`, `PasswordBox`, search | Black edit well, iron rim, dark top/left inner edge |
| `GroupBox`, metadata pane | Riveted iron panel frame around panel glass |
| `TreeView` | Menu button column (see Settings chrome) |
| `ListBox`, library rows, combo and menu items | Royal blue selection bar, white label |
| `ToggleButton` | Glue button; checked stays lit with a white label |
| `TabControl` | Channel / Friends / Clan tabs: black plate in a thin iron bevel at rest, the blue plate on hover, the lit plate when selected; no indicator line |
| `RadioButton` | 20px iron ring, black well, gold stud |
| `ProgressBar` | Loading bar: black channel in an iron rim, steel blue fill (`--wc3-steel`) with a sheen |
| `GridViewItemTemplate` (`GridTileButton`) | Cover Play / Info as 40px glue buttons with gold glyphs |
| `FilterSelectionBox` | Filter dropdowns as the popup menu plate, lit on hover |
| `ScrollViewer` | Iron thumb with a lit/dark bevel, lighter iron on hover |
| `PropertyItemButton`, tooltip | Earlier templates, recolored through the tokens (blue chips, iron rims, black popups) |
| Menus (`ContextMenu.xaml`, `Menu.xaml`, `ComboBox.xaml`, `ComboBoxList.xaml`, `FilterSelectionBox.xaml`, `TopPanelMenu`) | Forged-iron dialog panel (`LocalFrozenIronPanelTemplate`: 3px beveled iron frame between black grooves, four corner rivets), 30px gold-labeled rows taking a lit royal-blue glue plate with upper sheen and barbed gold spike on highlight, beveled iron bar + centered rivet group breaks, sunken black edit-well shortcut chips, blood-crimson Exit plate with white text, iron-bezel gold check wells. |
| Running game (`RunningIndicatorBrush` = `--wc3-good`) | the own-unit selection circle in green, drawn as an iris. **Launching:** a ring band (`RunningScan`, a radial mask whose stops travel) expands from the centre of details rows, list rows, covers and the iron plate in 1.2s (1.75s loop), the foot line fills outward from its middle, and as the ring lands a second circle pings outward once like a spell taking hold. **Running:** the foot stays full, the frame breathes 0.7 to 1, the selection circle breathes and pings once per 3.4s. The plate (inset 15px, clear of the spikes) holds a 0.88 scrim over the green while launching and breathes 0.55 to 0.68 while running with a white label (5:1 or better); hover on RUNNING (button only, `Self`) swaps the label for Cancel, and the lit plate, bloom and glint are off while launching or running. The gold selection frame stays outside the green frame on covers. |

## Textures
`art/textures.py` (Python, Pillow and numpy, fixed seed; pass a scratch path as its argument to write a contact sheet) writes `src/Images/fx/`. They are **not** white masks like the glow sprites: each is a tiled `ImageBrush` Fill (shared `Local*Brush` resources in `Common.xaml`) with a neutral tint baked in (black shade, pale iron, frost), because a masked layer behind hover animations leaves dark rectangles on scaled displays (`docs/themes/reference.md`, Effects and motion). They only shade what is under them, so a recolored surface keeps its texture. A host sets `Opacity` for strength and `IsHitTestVisible="False"`.
| Sprite | Look | Where |
|--------|------|-------|
| `mottle.png`, `scratch.png` (256 tiles) | cast-iron blotches and hammer streaks, wear scratches | `LocalIronWearTemplate` over the top bar and the dialog title band (0.8); the section list panel (`TreeView.xaml`: groove-black fill, darker than the page, with slabs at 0.14, scratches at 0.14 and frost in its lower left corner at 0.3), a ring over the 8px band of every framed panel (`RivetsTemplate`: metadata pane, group boxes, empty state) and over the menu panel frame (`LocalFrozenIronPanelTemplate`) |
| `flagstone.png` (256 tile) | running-bond slabs with lit joints, per-slab value, chips | the library floor under every view (0.2), the rail (0.16, `LocalFlagstoneRailBrush`), the dialog body (0.14), the menu body (0.1) |
| `frost-corner.png` (192) | frost fern growing out of a corner | bottom-right of the library, under all content (0.42, mirrored); top-right of the dialog body under the title band (0.34, mirrored) |
| `rime.png` (256x22 tile) | rime fringe, flipped so it grows up from the lower edge of a band | `LocalRimeEdgeTemplate`: 12px at the bottom of the top bar and the title band (0.18) |
| `rivets.png` (48x12 tile) | one domed rivet, lit from the top left | along the top edge of the top bar and title band, and the top and bottom rails of panel frames |
The Save / Cancel bar is Playnite's own Border, so `StandardWindowStyle` lays 56px of mottle, scratches and a rivet row over it for the Settings window only (`SettingsFooterWear`, shown by the `WindowSettings` trigger; hit testing off). The top bar texture group and the library floor collapse or are covered while `{Settings ShowBackgroundImageOnWindow}` is on (the band and rail go see-through; the art layer paints over the floor). The previews draw the same files (`art/preview-*.html`, `.tx` classes) at the same opacities.

## Deviations

- **Procedural textures, not the game's art:** the iron, stone and ice of the game are BLP art that cannot be copied, so `art/textures.py` generates original stand-ins (see Textures). No chains, and the ice is a creeping rime and corner frost, not a crust over the frames.
- **Rivets:** four vector corner rivets plus a tiled row of domed rivets (`rivets.png`, one per 48px) along the top and bottom rails of every panel frame; the row is a baked-tint sprite, so ThemeModifier does not recolor it.
- **Spikes on Play and the dialog title only.** In the game every menu button has one; on 32px form buttons they would eat the label.
- **Text shadow on the game title and the Play label only.**
- **Not the game's font** unless Friz Quadrata TT is installed.
- **Hover:** the game alpha-blends a highlight texture; the theme fades a lit plate in.

## Not verified yet

- Textures: checked in the x86 WPF render harness and the HTML previews only; not yet seen in the live Playnite window (flagstone contrast under list text, rime strength on a scaled display, the dialog frost corner behind a real Settings page).

- The overhaul builds, passes `validate-extension.ps1`, deploys and loads in Playnite without XAML errors in `playnite.log`, but the screens have not been looked at by eye in Playnite: Settings, a game's edit dialog, ThemeModifier (pencil buttons, recoloring), Statistics (GroupBox cards must still wrap), filter sidebar dropdowns at 28px, disabled buttons and dropdowns.
- Tabs in a game's edit dialog (labels must stay readable on the tab page), the filter sidebar dropdowns while typing a filter, cover hover buttons and a progress dialog have not been looked at since they were redrawn.
- `tests/wpf/SteamScreenshotsRegressionTests.ps1` fails intermittently on "ColdSeat next Steam game restarts loading" (expects the skeleton back 100ms after a game change). The test loads only the `SteamScreenshotsGameScope` node, which the iron/blue overhaul did not touch; whether the restart is slow or broken in Playnite is open.
- Friz Quadrata fallbacks and sizes at 1080p.
