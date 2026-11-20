# Wyldcrown — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, **0.1.0**, Showcase ambition) inspired by **Armello UI** (dark variant). Unofficial fan work; zero copyrighted assets bundled (`info/NOTICE-Wyldcrown.txt`).

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference captures, palette measurements, typography analysis, and motion timings are documented in [`RESEARCH.md`](RESEARCH.md). Creative direction and component mapping live in [`BRIEF.md`](BRIEF.md).

## Tokens

Armello palette roles (`--ar-*`) live exclusively in `src/tokens.css` and `src/Constants.template.xaml`; `scripts/build-theme.ps1` expands them into `src/Constants.xaml`.

| Token | Key | Used for |
|-------|-----|----------|
| `--ar-abyss` (`#090a0e`) | `TextColorDark`, `ScrimBrush` | Drop shadow ground, RunningBreath / cancel scrims, dark keylines |
| `--ar-void` (`#0e1017`) | `ShellBackgroundBrush`, `WindowBackgroundBrush` | Sidebar rail base, outer shell background, damask ground |
| `--ar-velvet` (`#13151d`) | `TopPanelBackgroundBrush`, `DialogTitleBrush` | Main window canvas, top bar, dialog title strip |
| `--ar-obsidian` (`#181922`) | `ContentBackgroundBrush`, `GameOverviewBackgroundBrush` | Content wells, description background, group boxes |
| `--ar-drawer` (`#21222d`) | `ButtonBackgroundBrush`, `ControlBackgroundBrush`, `PopupBackgroundBrush` | Controls, popups, tooltips, secondary buttons |
| `--ar-indigo-deep` (`#1e2e4a`) | `GameBannerTintBrush`, `HeaderBandBrush` | Banner twilight darken wash, section header gradient bands |
| `--ar-indigo-select` (`#213458`) | `SelectionBrush` | Selected row/tree/tab fill, selected chip hover |
| `--ar-indigo-wash` (`#293e63`) | `HighlightBrush` | Hovered list row, hovered toolbar plate, hovered menu item |
| `--ar-bronze` (`#7d6734`) | `NormalBorderBrush`, `ButtonBorderBrush`, `InputBorderBrush` | Muted antique brass hairline borders |
| `--ar-gold` (`#c9a84c`) | `GlyphBrush`, `AccentBrush`, `SelectedBorderBrush`, `HeadingMarkerBrush` | Active brass/gold trim, focus accent, scroll thumbs, diamonds |
| `--ar-gold-bright` (`#f2d878`) | `HighlightGlyphBrush`, `PrimaryButtonBorderBrush`, `GridViewItemSelectedBorderBrush` | Lit beveled borders, active rail markers, Play rim |
| `--ar-gold-glow` (`#ffe47a`) | `PrimaryButtonGlowBrush` | Sun-crown hover bloom behind hexagonal Play plate |
| `--ar-sapphire` (`#2153ab`) | `PrimaryButtonBackgroundBrush` | Diamond-quilted Royal Sapphire Play & Primary CTA fill |
| `--ar-spirit-cyan` (`#5ee3ff`) | `GridViewItemHoverBorderBrush`, `LinkBrush` | Cover hover Cerulean Spirit aura & dark-surface hyperlinks |
| `--ar-ivory` (`#f4edd6`) | `TextBrush`, `HeadingForegroundBrush` | Primary text on obsidian/velvet surfaces |
| `--ar-cream-bright` (`#fffef6`) | `PrimaryButtonForegroundBrush`, `DangerForegroundBrush` | Crisp high-contrast text on sapphire CTA & running/danger plates |
| `--ar-parchment` (`#eee2b2`) | `ParchmentBrush` | Deckled Character Tome metadata folio background |
| `--ar-parchment-edge` (`#b59e64`) | `ParchmentEdgeBrush` | Deckled paper rim & subtle section separators |
| `--ar-ink` / `--ar-ink-muted` / `--ar-ink-link` | `ParchmentTextBrush`, `ParchmentLabelBrush`, `ParchmentLinkBrush` | Deep sepia body ink, walnut captions, cobalt folio links |
| `--ar-chip-bg` (`#1c1d24`) | `PropertyItemBackgroundBrush` | Heraldic dark-iron bookmark chips & rating score tablets |
| `--ar-wyld` (`#289c52`) | `RunningIndicatorBrush` | Wyld Emerald running/launching frame, sweep & Wyld Star emblem |
| `--ar-crimson` / `--ar-crimson-bright` | `DangerBrush`, `FilterActiveBrush`, `NegativeRatingBrush` | Wax seal close hover, active filter diamond, negative scores |
| `Cinzel` (`./Typography/#Cinzel`, Regular/Bold) | `HeadingFontFamily` | Bundled carved uppercase capitals for game titles & headings |
| `Georgia, Palatino Linotype, Segoe UI` | `FontFamily` | Storybook serif body & metadata values |
| `--radius` (`4`) / `--radius-full` (`9999`) | `ControlCornerRadius` / `CornerRadiusFull` | Tight heraldic chamfer radii (`9999` reserved strictly for 1:1 circles) |

## ThemeModifier

Keep the `ThemeModifier` **Edit constants** catalog centered on shell, panel, button, selection, input, and layout keys exported through `scripts/data/theme-keys.json`; `build-theme.ps1` generates `thememodifier.yaml`. `GameDetailsPaneWidth` and `GridDetailsPaneWidth` default to `300`, `GameDetailsPanePosition` defaults to `Right` (`Left` / `Center` / `Stretch` / `Right`), `GameBannerHeight` defaults to `320`, and `GameBannerDarken` defaults to `0`. Accent and highlight colors use the shared picker.

## Component spacing (`src/Common.xaml`)

| Key | Value | Armello UI |
|-----|-------|---------------|
| `ControlHeight` | `32` | Uniform toolbar, search box, filter & input bar height |
| `ButtonPadding` | `16,5` | Horizontal clearance inside faceted action plaques |
| `InputPadding` | `10,5` | Inner horizontal clearance inside search and text wells |
| `IconSize` | `16` | Default stroked toolbar glyph dimension |
| `GameBannerHeight` | `320` | Default hero illustration canvas height |
| `GameBannerDarken` | `0` | Opt-in twilight scrim multiplier (`GameBannerTintBrush` floor) |
| `ChamferTemplate` | 6-sided bezel (9px cap) | Signature Armello hexagonal CTA / primary dialog plaque geometry |
| `FramedPlateTemplate` | 8-sided chamfer (6px cap) | Secondary obsidian-damask plaque geometry |
| `TornPlateTemplate` | `plate-torn.png` 9-slice (`20+32+20` DIP) | Deckled parchment folio with interior `Margin="5"` underlay |
| `GlowFrameTemplate` | `glow-frame.png` 9-slice (`44+40+44` DIP) | Outer lantern/spirit halo for hexagonal Play & grid cover hover |
| `DividerTemplate` / `GlowLineTemplate` | `diamond-seam.png` / ruled seam | Brass centerpiece diamond seam dividing major sections |
| `BookmarkTemplate` | `M0,0 L20,0 20,20 10,27 0,20 Z` | Hanging heraldic clan pennants crowning the Character Tome |

## Shell

| File | What it draws |
|------|---------------|
| `Views/MainWindow.xaml` | Default Playnite shell binding `WindowBackgroundBrush` (`ShowBackgroundImageOnWindow` aware) + `damask-tile.png` subtle shell ground |
| `DerivedStyles/MainWindowStyle.xaml` | 1px gold/bronze framed host window & obsidian top bar |
| `DerivedStyles/WindowBarButton.xaml` | Compact top window minimize/maximize/close glyphs (`DangerBrush` hover on Close) |
| `Views/Sidebar.xaml` + `CustomControls/SidebarItem.xaml` | `void` (`#0e1017`) 44px left heraldic rail with right gold edge and diamond cursor |
| `Views/TopPanel.xaml` + `TopPanelItem.xaml` + `SearchBox.xaml` | Single-row 32px dock: brand mark / menu, `PART_TextMainSearch`, `PART_ToggleFilter` (crimson wax diamond badge when active), `PART_PanelMainItems`, right-docked progress & notifications |
| `Views/FilterPanelView.xaml` & `Views/ExplorerPanel.xaml` | Obsidian drawer panels with brass rules and diamond seam headers |
| `Views/SettingsWindow.xaml` (in `DerivedStyles/StandardWindowStyle.xaml` + `DefaultControls/TreeView.xaml`) | `<◇ SETTINGS ◇>` centered carved header & bare Georgia 28px tree rows w/ left gold rule & diamond cursor |

## Components

Both `DetailsViewGameOverview.xaml` and `GridViewGameOverview.xaml` preserve Playnite's contract and include:
- **Empty state (`LOCErrorNoGameSelected`):** `PART_ScrollViewHost` stays `Visibility="Visible"` when `Game` is `null`; centered `EmptyGameTemplate` displays a softly pulsing golden crown emblem (`Opacity` animation only, `3.4s`).
- **Proportional banner spacer & close controls:** `DetailsBannerSpacer` (`x * 168 / 300`, `20` min floor) and `GridBannerSpacer` (`x * 124 / 300`, `14` min floor). `GridViewGameOverview` floats `SidePanelCloseButton` top-left when `GameBannerHeight >= 120` (unless `ShowBackgroundImageOnWindow`), switching seamlessly to `InlineSidePanelCloseButton` inline immediately before `PART_ImageIcon` when compact or transparent, with crimson wax `DangerBrush` hover.
- **Metadata pane widths & responsive breakpoints:** `DetailsMetadataViewport` (`GameDetailsPaneWidth`) and `GridMetadataViewport` (`GridDetailsPaneWidth`) default to `300` DIP inside the parchment card padding. Both views honour `GameDetailsPanePosition` (`Left`, `Center`, `Stretch`, `Right`) via `scripts/game-page-breakpoints.mjs`. `Center` and `Stretch` display the full-width card above the main content. Both hide the six group dividers so visible fields flow in three columns at 900 DIP and above, two at 560–899 DIP, and one below 560 DIP of usable inner width.

| Playnite file | Armello UI component |
|---------------|-------------------------|
| `DerivedStyles/PlayButton.xaml` | Hexagonal sapphire diamond-quilted Play CTA (`ChamferTemplate`), sun-crown glow, `RunningActionIndicator` (`Wyld Emerald`, right 40px Wyld Star strip, self-hover Cancel scrim) |
| `DerivedStyles/GridViewItemStyle.xaml` & `GridViewItemTemplate.xaml` | Gold selected bezel + `CornerMarksTemplate` corners; Cerulean Spirit `#5ee3ff` `GlowFrameTemplate` hover aura; staggered `BackEase` Royal Sapphire / Iron circular cover medallions; inset 4px Wyld Emerald running perimeter |
| `DerivedStyles/DetailsViewItemStyle.xaml` | Indigo `SelectionBrush` row highlight + left gold diamond cursor; `RowRoom` `0,0,34,0` clearance for right-docked `wyld-star.png` + emerald sweep when launching/running |
| `DerivedStyles/PropertyItemButton.xaml` | Cobalt ink links on parchment (`ParchmentLinkBrush`); dark iron gold-bordered heraldic bookmark plaques for `Tag="Chip"` |
| `DerivedStyles/TextBlockGameScore.xaml` | Compact dark-iron score medallions so emerald, amber & crimson scores stay legible over cream parchment |
| `DefaultControls/*.xaml` | Faceted brass-rimmed buttons (`PrimaryButton`, `SecondaryButton`, `DangerButton`, `GhostButton`), diamond-thumb sliders, carved tabs, jewel checkboxes/radios, obsidian toolbars & scrollbars |
| `ContextMenu`, `Menu`, `ComboBox`, `ComboBoxList`, `FilterSelectionBox` | Shared `LocalMenuPanelTemplate` (obsidian-damask drawer with bronze/gold double rim, `CornerMarksTemplate` filigree corners and top gold crown pip), 30px rows, `SelectionBarTemplate` twilight-indigo ribbon with bright gold lance + pointer, `DividerTemplate` diamond-ended bronze group breaks, Cinzel shortcut plaques illuminating into cream parchment with sepia ink, crimson wax-seal Exit banner with cream-bright ink, royal sapphire & gold diamond check mark |

## Previews

`art/preview-details.html` and `art/preview-settings.html` consume `src/tokens.css` (`var(--ar-*)`), mirror Playnite's details/settings chrome, and render `art/screenshot-details.png` and `art/screenshot-settings.png` via `scripts/take-screenshots.ps1` with zero fallback font warnings.
- Signature motifs drawn: Royal Sapphire hexagonal diamond-quilted Play CTA with sun-crown bloom & gold double rim; deckled parchment Character Tome with `BookmarkTemplate` clan pennants & charcoal bookmark chips; Cerulean Spirit cover hover ring & dual medallions; obsidian damask sidebar & `<◇ SETTINGS ◇>` bare navigation tree.
- Stand-in fonts (`scripts/data/fonts.json`): `Georgia` renders directly via system/Windows serif; `Gelasio` aliases to Windows `Georgia` / `Palatino Linotype` as specified in `fonts.json`; bundled static `Cinzel` (`Regular` & `Bold`) drives display capitals in Chromium and WPF.

## Deviations

- Game metadata folio replaces dark slate panels with a warm cream deckled parchment sheet (`ParchmentBrush` `#eee2b2` + dark sepia ink `#21180d`) wrapped in `TornPlateTemplate` so Playnite's dense tags and scores feel like an illuminated Armello Hero Card rather than dark-on-dark rows; score pills sit on dark iron `PropertyItemBackgroundBrush` plaques for >=4.5:1 rating legibility.
- Settings navigation uses bare row highlights (no full-row border boxes) with a 2px gold edge + right diamond cursor matching Armello's top-level pause/settings index rather than Playnite's heavy stock TreeViewItem highlight box.

## Not verified yet
