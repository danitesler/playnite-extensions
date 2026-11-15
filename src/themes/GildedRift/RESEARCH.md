# Gilded Rift — research & sources

Gilded Rift is an unofficial fan theme inspired by the **League of Legends** client and **League of Legends: Wild Rift** (Riot Games). Nothing here is either game's art, logo or font.

## Sources

| What | Where |
|------|-------|
| Interface captures (PC) | Interface In Game, <https://interfaceingame.com/games/league-of-legends/>, viewed 2026-11-15: main menu, champion select, match found, profile, item shop, spell tooltip, loading, scoreboard (500x281 thumbnails, all that the page serves without a login). |
| Interface captures (mobile) | Interface In Game, <https://interfaceingame.com/games/league-of-legends-wild-rift/>: main menu, champion select, ability information, victory, scoreboard, game summary. |
| Colors | Spot-sampled from those thumbnails with PIL (median of clustered pixels, JPEG/PNG noise about +-4 per channel). The full ladders in `src/tokens.css` are the client's widely published palette, **recalled, not read from a file**: only the blue-black and the gold and teal midtones were confirmed by sampling (below). Treat the exact hex of the dim and dark gold steps as unverified until compared against a full-size capture. |
| Type | Read from the captures. Headings are set in Beaufort for LOL (a flared, small-capital serif), body in Spiegel (a humanist sans). Both are Riot's and cannot be bundled. Cinzel (OFL, `scripts/fonts/cinzel`) stands in for Beaufort; Segoe UI for Spiegel. |
| Icons | Hand-drawn in `src/Media.xaml` in a thin 1.5px gold-line style with angular terminals. No icon pack. Menu icons keep Playnite's own glyphs, recolored. |
| Motion | Static captures only; no video or frame-step was available. Durations and easing in the brief are inferred from how the client behaves (cinematic fades, glow pulses, shine sweeps), not measured. |

## Measured values (spot checks)

| Part (capture) | Sample |
|----------------|--------|
| Darkest regions (all PC captures) | `#030608` to `#040A13`; profile page background exactly `#010A13` |
| Darkest regions (Wild Rift) | `#101317` to `#16110D`, a warmer black |
| Gold, median of gold-hued pixels | `#B3925A` (victory), `#BA935A` (champion select), `#BC966D` (main menu), `#BA9344` (item shop) |
| Teal, median of cyan-hued pixels | `#46A3B9` (match found), `#2EA4EF` (item shop), `#38B2FA` (victory), `#1CC5F1` (WR main menu) |
| Champion-select row, selected | a `#202A2B` wash with a gold bar on the left edge |
| Tooltip panel | near-black translucent navy with a thin warm-grey border (spell tooltip) |

## Interface parts read from the captures

| Part | What it is | Where it lands |
|------|------------|----------------|
| Top navigation (HOME, PROFILE, COLLECTION) | caps text, the active tab brightens to cream and gets a small gold notch on the bar edge and a soft underline glow | sidebar current item, toolbar toggled state, tabs |
| PLAY button | dark plate in a gold bevelled frame with angled corners and a crest on its left | Play button |
| Champion-select roster | rows with portrait, name, subtitle, a gold bar on the selected row | details list rows |
| Champion grid | square portraits, a gold ring and corner marks on hover, a small teal level badge top-right | cover tiles |
| LOCK IN / ACCEPT | angled dark plate, gold frame, teal inner glow that pulses | primary and secondary buttons |
| Match Found ring | a circular crest inside a gold ring and a cyan arc that sweeps for the timer | launching sweep, running ring |
| Ability tooltip | dark panel, gold title with a key hint, cooldown and mana icons, grey body text | `ToolTip`, menus |
| Item shop tabs | "Recommended / All items" caps tabs with a gold underline | `TabControl` |
| Social panel | collapsible group headers with a small triangle and a count | `Expander` and filter group headers |
| Profile banner | a long pennant with a gold edge and a crest | game page title plate |
| Victory banner | a gold-bevelled plate with swept wings and a burst of light behind it | empty game page, title band flourish |
| XP bar | thin green fill in a dark track under a ring | `ProgressBar` |

## Not used

No Riot logo, no champion art, no Beaufort or Spiegel files, no rank crests, no screenshots stored in the repo. The captures were downloaded to a scratch folder only to be viewed and sampled.
