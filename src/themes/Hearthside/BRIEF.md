# Hearthside — creative brief

**Ambition:** Showcase (inspired by Hearthstone's tavern box, Collection Manager tome, and Options modal from Game UI Database `id=628`).

## 1. Source DNA (5 traits)
1. **Three-material contrast** — Dark carved oak timber (`#24150c`–`#412817`), chamfered riveted wrought-iron nameplates (`#35373f`), and warm aged cream parchment (`#ebd9b4` with `#2b1a0e` sepia ink) meet across the shell, dialogs, and game details pane.
2. **Lantern-lit bevels & riveted metalwork** — Top-edge specular gold/iron highlights, carved bottom bevel shadows, brass corner L-clasps with dome rivets, and sculpted 3-layer box moldings on the rail and top bar.
3. **Chunky tabletop silhouettes** — Faceted mana crystal diamonds, 8-notch compass medallion, chamfered riveted title plaques, deckled parchment folio sheet, circular Hero Power / Coin cover tokens, and crimson wax-seal notification pips.
4. **Belwe display + dark drop shadow** — Warm cream/gold Belwe headings with a crisp black drop over wood/banners, deep espresso ink on parchment, paired with clean Franklin Gothic UI text.
5. **High-energy magic on calm wood** — Quiet dark timber backgrounds let End Turn gold, Playable Emerald hover aura, and Arcane Mana-Blue crystals pop instantly.

## 2. Game Element Map (11 elements)
| Hearthstone element | Playnite surface |
|---|---|
| Tavern box outer oak frame & brass moldings | `Sidebar` rail + `TopPanel` header beam with woodgrain texture and 3-layer carved brass edge |
| Main Menu glowing mana compass medallion | `PART_ElemMainMenu` (32px mana-blue orb in a notched burnished gold ring with hearth mark + radial bloom on hover) |
| Journal vertical icon rail | `SidebarItem` beveled square oak tiles; selected gains smooth gold `GlowFrameTemplate` aura, gold rim, and left gold diamond |
| Collection Manager & Card Crafting parchment tome | `DetailsViewGameOverview` & `GridViewGameOverview` right-side Metadata Pane: 9-slice deckled aged parchment sheet (`parchment-sheet.png` + `parchment-grain.png`), sepia dividers, dark wood tag chips, and stat-medallion score badges |
| Riveted wrought-iron nameplate (`Options` / `Card Crafting`) | Metadata Folio header bar + `StandardWindowStyle` dialog title band (chamfered iron bar, 1px inner gold trim, twin brass rivets) + crimson bookmark ribbon tab |
| End Turn gold button + Hearthstone arcane hover aura | `PlayButton`: beveled burnished gold plate with twin flank rivets; hover lights the gold bevel + inner specular rim and hugs the plate with a tight 9-slice `LocalBloomFrameTemplate` arcane cyan-blue (`#00b8ff`) aura |
| Hero Power / Coin round tokens | `GridTileButton` (48×48 circular beveled gold Play medallion with arcane cyan-blue hover ring + wrought-iron Info medallion) |
| Collectible card frame & hover/selection aura | `CoverFrame` & `GridViewItemStyle` (beveled gold frame, 4 brass corner clasps, smooth golden selection halo) |
| My Decks right-sidebar list strips | `DetailsViewItemStyle` rows (calm at rest; beveled carved oak plank on hover; lit gold-rimmed deck strip with left gold bar & diamond rivet when selected) |
| Mana tray & faceted crystal | `Slider` & `ProgressBar` (recessed timber trough, glowing mana-blue bar, faceted gold-rimmed mana crystal thumb) + `RunningActionIndicator` (legendary glint sweep + 5 mana diamonds) |
| Options modal chrome & crimson wax pip | `StandardWindowStyle` + `TreeView` (minimal 29px rows with hover wash, 2px gold edge bar, mana diamond cursor) + `TopPanelNotificationsToggle` crimson wax seal badge |

## 3. Moments
- **Hero moment:** `PlayButton` hover — beveled burnished gold plate with twin rivets brightens with a polished gold bevel rim, inner cream-gold specular edge, slanted golden glint sweep, micro-lift (`1.028`), and a tight Hearthstone arcane cyan-blue (`#00b8ff`) aura hugging the border; press sinks the plate and drops the top lantern highlight.
- **Secondary moments (6):**
  1. Main Menu mana compass medallion blooms with `hearth-halo.png` and turns its notched ring bright gold on hover.
  2. Sidebar & top-bar oak plates lift with warm lantern sheen; selected/toggled items glow with burnished gold rim + diamond indicator.
  3. Deck-list rows glide from quiet timber to beveled carved oak plank (hover) to gold-rimmed deck plaque with left gold bar + diamond stud (selected).
  4. Grid cover cards reveal beveled brass corner clasps + golden selection aura + 48×48 circular Hero Power Play/Info tokens.
  5. Settings `TreeView` rows animate opacity smoothly between idle, warm wood hover wash, and gold-edged + mana-diamond selected state.
  6. Running/Launching games sweep a slanted legendary glint across mana-blue frames while 5 faceted mana crystals charge up and breathe.
- **Ambient loop (1):** Empty Game Page hearth medallion breathes gently (`hearth-halo.png` opacity pulse over 3.6s) behind the Hearthside compass mark.

## 4. Motion Language
- **Durations:** Fast `110ms` (press, hover edge), Base `180ms` (plate/wash opacity fades, cover controls), Slow `320ms` (glow blooms, running state transitions).
- **Easing:** Warm physical `CubicEase` (`EaseOut` on enter, `EaseInOut` on breathing loops); crisp tactile feel like heavy wood and brass settling into place.
- **Performance:** All hover/selected/glow overlay layers stay `Visibility="Collapsed"` at rest and switch to `Visible` on entry; all sprite `ImageBrush` masks are shared `Local*MaskBrush` resources in `Common.xaml`.

## 5. Brand & Restraint
- **Brand mark:** `art/mark.svg` (hearth flame inside a studded compass ring) reused in the Main Menu medallion, Settings title band, Empty Game Page, and add-on tile.
- **Restraint:** Library list rows stay unboxed at rest; cover grid background stays calm dark woodgrain; parchment metadata typography stays crisp sepia ink with zero clutter behind text.
