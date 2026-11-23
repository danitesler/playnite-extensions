# Hearthside — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0) inspired by the interface of **Hearthstone** (Blizzard Entertainment, 2014 onward) and refined against the 66-screen Game UI Database gallery (`id=628`): the hinged tavern oak box, the Collection Manager open parchment tome, the Card Crafting riveted wrought-iron panels, the Options modal, and the game board. Hearthside pairs three contrasting materials — dark carved oak timber with subtle woodgrain texture, riveted wrought-iron nameplates, and aged warm cream parchment with espresso ink — framed in burnished gold/brass with Hearthstone's signal colors (End Turn gold, Playable emerald aura, Mana crystal blue, Health crimson wax seals, and Legendary amber).

**Unofficial fan theme.** It contains no Blizzard assets. The hearth-flame compass mark, brass corner clasps, woodgrain, vellum parchment grain, 9-slice glow aura, riveted iron nameplates, and faceted gem shapes are original; the icons are Phosphor. Belwe (Bitstream, commercial) is not shipped: `HeadingFontFamily` names it first and falls back to Bookman Old Style / Georgia (bundled preview stand-in: Gelasio). Body text uses Franklin Gothic Medium / Segoe UI (bundled preview stand-in: Libre Franklin). Hearthstone and Blizzard are trademarks of Blizzard Entertainment.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**. Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources & Brief

- Visual research and material measurements: [`RESEARCH.md`](RESEARCH.md)
- Creative direction, element map, and motion language: [`BRIEF.md`](BRIEF.md)
- Procedural white-mask sprite generator (`Pillow` + `NumPy`, fixed seed): `art/sprites.py` → `src/Images/fx/*.png` (`wood-grain.png`, `parchment-grain.png`, `parchment-sheet.png`, `glow-frame.png`, `corner-clasp.png`, `hearth-halo.png`, `metal-sheen.png`). Every FX sprite is pure white (`255,255,255`) with alpha so ThemeModifier recolors every texture and glow automatically via `DynamicResource` brushes.

## Tokens (`src/tokens.css`)

| Token | Key | Used for |
|-------|-----|----------|
| `hs-wood-night` `170e09` | `WindowBackgourndBrush` | Window / dialog outer backdrop |
| `hs-wood-deep` `24150c` | `ShellBackgroundBrush`, `TopPanelBackgroundBrush`, `BackgroundToneColor`, `ScrollBarTrackBrush` | Outer tavern box rim: rail, top bar, Settings tree, scroll groove |
| `hs-wood` `311d11` | `ContentBackgroundBrush`, `ArtTintBrush`, `GameBannerTintBrush` | Library board planks; warm banner tint |
| `hs-wood-panel` `412817` | `MainColorDark`, `PopupBackgroundColor`, `ExpanderBackgroundBrush` | Raised timber panels, menus, group boxes |
| `hs-wood-mid` `5b3b23` | `MainColor`, `HoverColor`, `ButtonBackgroundBrush`, `ListItemHoverBrush`, `TopPanelItemHoverBackgroundBrush`, `PropertyItemBackgroundBrush` | Resting oak buttons, hovered deck strips, dark wood tag chips |
| `hs-wood-light` `7c5432` | `SelectedBrush`, `ListItemSelectedBrush`, `MenuItemHoverBrush`, `ButtonHoverBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush`, `TopPanelItemCheckedBackgroundBrush`, `PropertyItemHoverBackgroundBrush` | Lit selected oak planks and hover fills |
| `hs-wood-pressed` `1b1009` | `InputBackgroundBrush`, `CheckBoxCheckMarkBkBrush`, `ButtonPressedBackgroundBrush`, `SliderTrackBrush`, `ProgressBarTrackBrush`, `TopPanelSearchBoxBackgroundBrush` | Deeply recessed wells and mana grooves |
| `hs-wood-grain` `100905` | `ScrimBrush`, `FrameInnerBrush`, `BevelShadowBrush` | Woodgrain shadows, carved moldings, plate bevels |
| `hs-iron` `35373f` / `hs-iron-dark` `222329` / `hs-iron-edge` `5e616e` | `LocalIronBrush`, `LocalIronDarkBrush`, `LocalIronEdgeBrush` | Riveted wrought-iron nameplates (`Game Details`, dialog titles), Info cover medallion, score stat sockets |
| `hs-gold` `efc342` / `hs-gold-light` `ffe270` | `GlyphColor`, `SelectedBorderBrush`, `FrameHoverBrush`, `CheckBoxHoverBorderBrush`, `TabItemIndicatorBrush`, `SidebarItemSelectedGlowBrush` / `SelectedForegroundBrush`, `SidebarItemSelectedForegroundBrush`, `HeadingForegroundBrush`, `GridViewItemSelectedBorderBrush`, `BevelLightBrush` | Gold selection rims, headings, lantern highlights, rivets |
| `hs-brass` `c9963b` / `hs-brass-dark` `8c6226` / `hs-brass-deep` `6b4319` | `FrameBrush`, `PopupBorderColor`, `InputHoverBorderBrush`, `ScrollBarThumbHoverBrush`, `GridViewItemHoverBorderBrush` / `NormalBorderBrush`, `ButtonBorderBrush`, `InputBorderBrush`, `CheckBoxBorderBrush`, `TopPanelSeparatorBrush`, `ScrollBarThumbBrush`, `ThumbBrush` / `WindowPanelSeparatorColor`, `PanelSeparatorColor`, `MenuSeparatorBrush` | Carved brass trim, corner clasps, borders, dividers |
| `hs-cream` `f8ecd2` / `hs-cream-muted` `cab38d` | `TextColor`, `ButtonForegroundBrush` / `TextColorDarker`, `SidebarItemForegroundBrush` | Warm ivory lettering on dark oak |
| `hs-parchment` `ebd9b4`, `hs-parchment-light` `f6ead0`, `hs-parchment-edge` `b99b6b`, `hs-ink` `2b1a0e`, `hs-ink-title` `4e260c`, `hs-ink-label` `6d4a26` | `ParchmentBrush`, `TooltipBackgroundBrush`, `LocalParchmentLightBrush`, `ParchmentEdgeBrush`, `TooltipBorderBrush`, `ParchmentTextBrush`, `TooltipForegroundBrush`, `ParchmentTitleBrush`, `PropertyItemForegroundBrush`, `ParchmentLabelBrush` | Open-tome Game Details Metadata Folio and aged parchment tooltips |
| `hs-endturn` `f6c41c` (+ hover `ffe566`, pressed `b8840a`, ink `331c06`) | `PrimaryButton*`, `TextColorDark`, `MixedRatingBrush` | Play button, default dialog buttons (`Save`, `OK`), mixed scores |
| `hs-playable` `2ee655` | `FocusBrush`, `PositiveRatingBrush` | Focus ring, positive scores |
| `hs-mana` `4aa3f0` / `hs-mana-dark` `1d4e8f` / `hs-mana-light` `9ce2ff` / `hs-mana-glow` `00b8ff` | `RunningIndicatorBrush`, `ProgressBarForegroundBrush`, `SliderThumbBackgroundBrush` / `MainMenuButtonBackgroundBrush` / `SliderHoverForegroundBrush`, `SliderThumbHoverBorderBrush` / `PrimaryButtonGlowBrush`, `LocalManaGlowBrush` | Running mana crystals, mana tray slider & progress bar, Main Menu compass orb & halo, tight Hearthstone arcane cyan-blue Play & card hover aura |
| `hs-health` `c82a25` / `hs-health-light` `ff5447` | `DangerBrush` / `NegativeRatingBrush`, `LocalHealthLightBrush` | Close hover, crimson wax-seal notification pip, folio bookmark ribbon, low scores |
| `hs-legendary` `ff8c14` | `WarningBrush`, `DataChangeNotifColor` | Filter-active diamond gem, update icon, warnings |
| `hs-outline` `000000` | `TextOutlineBrush` | Drop shadow behind game titles |

Radii: `CornerRadiusSmall` 3, `ControlCornerRadius` 6, `CornerRadiusLarge` 10, `CornerRadiusXLarge` 14, `CornerRadiusFull` 9999 (used strictly on 1:1 square medallions/tokens). Thin tracks use half-thickness radii (`3` on 6px groove, `2` on 4px fill, `1.5` on 3px bars).

## Shell & Dialog Chrome

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px carved oak rail with `LocalWoodGrainTemplate` and a 3-layer brass molding edge. The main menu is a 32px mana-blue compass medallion with cardinal gold notches, `LocalIconHearthMark`, and a soft `LocalHearthHaloMaskBrush` bloom on hover. Items are 44×40 with 32px beveled oak plates; selected gets a lit gold-rimmed plate, 9-slice `GlowFrameTemplate` golden aura, and left-edge gold diamond cursor. Main menu mark: `LocalHearthsideMenuMarkTemplate`, a faceted mana crystal set into the medallion; hover sweeps a glint across the gem (clipped to its outline, 0.5s), open lights the gem from within and breathes the mana glow until the menu closes (`AncestorLevel` 2: the medallion border is the nearest `Border`). |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 56px woodgrain oak beam closed by the 3-layer brass molding with a centered brass diamond clasp. Recessed search well (`260×34`), 36px beveled oak toolbar plates, legendary-amber diamond filter-active mark, crimson wax-seal notification badge with gold rim, and 12px mana-tray global progress bar with 12px text margins. |
| `DerivedStyles/MainWindowStyle.xaml`, `WindowBarButton.xaml` | Caption buttons appear as wood plates on hover; close hovers crimson. |
| `Views/Library.xaml` | Textured dark oak library layer (`LocalWoodGrainTemplate`) when window art is off; turns transparent with window art at full strength when Playnite's "Use game background image as window background" is on. |
| `DerivedStyles/StandardWindowStyle.xaml`, `DefaultControls/TreeView.xaml` | Options-modal dialog chrome: 44px carved oak title band with woodgrain, Hearthside brand compass orb, riveted wrought-iron & gold title nameplate (`PART_TextTitle`), 3-layer brass molding, and 4-corner brass clasps. `TreeView` uses minimal bare 29px body-font rows (no idle boxes), opacity-animated oak hover wash, held selected wash + 2px gold edge bar + glowing mana diamond cursor, and reserved `Visible` vertical scroll lane in Settings (250px) and Add-ons (280px). |

## Game page

`DetailsViewGameOverview.xaml` and `GridViewGameOverview.xaml` follow the shared responsive skeleton (`GameDetailsPanePosition`: Right, Left, Center, Stretch) with Hearthstone's signature surfaces:
- **Hero & Card Cover**: Warm tavern wood banner fade; bold cream Belwe title with black drop; collectible-card `CoverFrame` in burnished gold with 4 brass corner clasps (`LocalCornerClaspsTemplate`).
- **Hero Moment (`PlayButton`)**: 42px beveled End Turn gold plate with twin flank rivets and lantern sheen; idle hover lights the gold bevel + inner specular rim, sweeps a slanted golden card glint across the plate, lifts smoothly (`1.028`), and hugs the border with a tight 9-slice Hearthstone arcane cyan-blue `LocalBloomFrameTemplate` aura; flanked by matching 42×42 beveled `More` and `Edit` plates.
- **Section Headings**: Gold Belwe headings over `DividerTemplate` (faceted gold diamond + brass pip + tapered brass rule).
- **Open-Tome Parchment Metadata Folio**: Warm aged parchment (`ParchmentBrush` + `LocalParchmentGrainTemplate` + inner aged vignette + `LocalBottomCornerClaspsTemplate`) crowned by a riveted wrought-iron & gold `Game Details` nameplate and a crimson wax-ribbon bookmark tab. Crisp espresso/umber ink values and captions, sepia group dividers, dark wrought-iron stat medallions for scores, and dark carved-oak tag chips (`PropertyItemButton`).
- **Empty State (`EmptyGameTemplate`)**: Centered Tavern Hearth compass medallion with gentle 3.6s `hearth-halo.png` breathing pulse, flourished brass divider, and Belwe `LOCErrorNoGameSelected` prompt.

## Components

| Playnite file | Hearthstone element |
|---------------|---------------------|
| `Button`, `ToggleButton`, `RepeatButton` | Beveled carved oak plates with smooth hover fill fade, subtle `BackEase` micro-lift (1.022) and press thud (0.965); `IsDefault` (`Save`, `OK`) is End Turn gold with twin flank rivets, Belwe text, and a golden hover sheen sweep |
| `PlayButton` | End Turn gold plate with twin rivets, springy micro-lift, diagonal golden sheen sweep, and a smooth 9-slice Playable emerald hover aura that fades in and gently breathes while hovered; running/launching swaps solidly to Mana Crystal Blue with legendary glint sweep, 5 mana diamonds, and Cancel on hover (`Self`) |
| `GridViewItemStyle`, `GridViewItemTemplate` | Collectible card cover lifts on hover (`Scale 1.032`, `Y -3px`, `BackEase`) with an arcane-mana 9-slice glow, brass corner clasps, and a diagonal foil card glint sweep; selected cards hold a gently breathing golden aura; hover reveals staggered coin-bounce 48×48 circular Hero Power / Coin `GridTileButton` medallions with springy pop (`1.10`) and radial halos |
| `DetailsViewItemStyle` | Calm dark oak list at rest; beveled oak deck strip fades in smoothly on hover with a 3px deck-pull content slide; selected strip fades in a lit gold-rimmed plaque, springs the 3px left gold bar vertically (`BackEase`), and plays a one-shot golden glint sweep; preserves `RowHoverAction` (with springy glyph pop) and mana-crystal running indicator |
| `Sidebar`, `SidebarItem`, `TopPanelItem` | Main Menu mana compass medallion blooms its arcane halo, pops (`1.09`), and rotates its gold compass notches +45° on hover; sidebar/top-bar plates fade smoothly with icon micro-pops and a sliding left gold diamond cursor on active sidebar items |
| `CheckBox`, `RadioButton`, `TabControl`, `PropertyItemButton` | CheckBox pops the gold check (`BackEase`); RadioButton pops & spins the faceted gold diamond; TabControl smoothly expands the 3px gold base bar from center; dark wood tag chips fade and lift (`1.045`) on hover |
| `Slider`, `ProgressBar` | Recessed mana trough, glowing mana-blue fill, and faceted gold-rimmed mana crystal diamond thumb that pops (`1.18`) and blooms a mana halo on hover/drag |
| `GroupBox` | Gold Belwe title over beveled oak panel with compact 4-corner brass clasps (zero fixed widths >= 200 for Statistics wrapping) |
| `ToolTip` | Aged parchment card with vellum paper grain and brass-edge border |

## Previews

`art/preview-details.html` and `art/preview-settings.html` are 1280×720 HTML replicas using `src/tokens.css` variables, bundled open font stand-ins (Gelasio for Belwe, Libre Franklin for Franklin Gothic), and the exact `src/Images/fx/*.png` white-mask sprites. Re-render with `.\scripts\take-screenshots.ps1 -Extension hearthside`. Motifs shown: carved oak grain + 3-layer brass moldings with centered diamond clasp, glowing mana compass medallion, beveled deck strips + mana-crystal running row, hovered End Turn emerald aura hero moment, gold-clasped collectible card cover, Open-Tome Parchment Metadata Folio with riveted wrought-iron nameplate & crimson bookmark, and Options-modal dialog chrome with minimal section tree & faceted mana slider.
