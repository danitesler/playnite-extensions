# Visorline — creative brief

Mode: **Showcase** (a game's menus and HUD). Name: Visorline, an abstract echo of a visor HUD; key `visorline`. Unofficial, no owner assets.

## 1. Source DNA

| Trait | Where it lands in Playnite |
|-------|----------------------------|
| **Honeycomb on black.** Near-black page with a faint hex mesh | Tiled hex sprite on the rail, title band, game page header and the empty page; never behind lists or covers |
| **Pale mint ink, soft bloom.** One ink (`#a3d2bd` text, `#e8fbf1` lit) that blooms when selected | `TextBrush` is the mint; selected and hover labels go to the lit white-mint with a text bloom |
| **Hairline tactical chrome.** 1px rules, ruler ticks, angled corner brackets, `+` marks | Rail edge ruler, top bar end brackets, cover brackets, focus marks, group boxes, tooltips |
| **Squared condensed caps.** Rajdhani caps, wide tracking on small labels | Buttons, tabs, headings, tree rows; body copy stays Bahnschrift |
| **Chamfered plates and the grey-green band.** Dropdown and `BACK` plates cut at 45 degrees; the current row is a full-width grainy band with lit rules above and below | Button, ComboBox, tab plates; every selected row (tree, list, rail, toggles) |

## 2. Game element map

| Source part | Playnite surface |
|-------------|------------------|
| Selected row band with lit rules | Settings tree selection, list rows, rail current item, toggled top bar cells |
| Left mint rule with ruler ticks | Rail's right edge; tree's left edge in Settings |
| Chamfered dropdown plate | `ComboBox`, `Button`, cover hover buttons |
| `« BACK` plate | Close button on the grid side panel and dialogs; `WindowBarButton` |
| Segmented `ENERGY` bar | `ProgressBar` (10px cells), Play hover (the hero) |
| Weapon stat bars (segmented, tall edge bar) | Score rows in the metadata pane (`CommunityScore`, `CriticScore`, `UserScore`) as segmented bars |
| Armor / Power / Stealth parallelogram tabs | `TabControl` headers, filter preset chips |
| Minimap slab with compass strip and ruler edge | Game page header strip: a tilted ruler with ticks over the banner's lower edge |
| `‹ Checkpoint reached ›` / `‹ INITIALIZING ›` | Empty game page (`‹ NO GAME SELECTED ›`) and the launching state label |
| `+` registration marks | Focus visual, empty page corners, library corner decor |
| Contextual prompt `Press [key]` | Tooltips (key cap plate) and Play's prompt cap |
| Yellow star marker | Favorite mark, filter-active mark, running indicator |
| Red ammo digits | `DangerBrush`: close hover, errors |
| Suit hex mesh | Window title band and the rail's mesh |

## 3. Moments

- **Hero, Play:** hover charges the segmented bar left to right (12 cells, 40ms stagger, lit white-mint with bloom), the label brightens and corner brackets snap onto the plate. Press flashes every cell white, then holds them lit. Separate pressed layer.
- Cover hover: four angled corner brackets draw in, a `+` appears at the centre-bottom, name label lifts.
- Cover buttons: chamfered plates slide up with a 60ms stagger; hover lights the rim.
- Rail selection: the band slides in from the rule, glyph blooms.
- Tree selection: band fades in under the label with the lit rules sweeping from the left.
- Tab: chamfered plate lights, underline rule sweeps.
- Checkbox: hex cell that lights its check; slider: segmented track with a bracket thumb.
- Ambient (one, sparse): empty page hex mark and brackets idle, 4.2s, only while visible.

## 4. Motion language

Durations: fast 110ms, base 200ms, slow 360ms. Easing: `CubicEase` EaseOut (a calm HUD, nothing bouncy). Entrance: from the left along the rail rule. Stagger: 40ms per segment, 60ms per button. Light flickers once on entry (opacity 0.4 to 1 in two steps, 70ms) as a visor does when it boots.

## 5. Brand

Own name, mark `art/mark.svg`: a hex cell with a visor slit and a centre `+`, reused in the title band, empty page, rail menu button and tile. `GameBannerTintBrush` = `vs-deep` `#08110e`, the teal-black the menu fades to, so a darkened banner keeps the menu's cast instead of going plain black.

## 6. Restraint

Library lists, cover grid backgrounds and metadata text stay on flat near-black. Hex mesh is below 8% opacity and only on chrome. No colored glows: bloom is the mint ink only.
