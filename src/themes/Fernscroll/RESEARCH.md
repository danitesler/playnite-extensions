# Fernscroll — research & sources

**Fernscroll** is an unofficial fan-made Playnite Desktop theme inspired by the hand-inked storybook UI, watercolor parchment panels, dark plum plaques, pine-green ribbons, and botanical scroll flourishes of **Snufkin: Melody of Moominvalley** (Hyper Games / Raw Fury, 2024). It ships no game art, logos, characters, or proprietary fonts.

## Sources

| What | Where | Notes |
|------|-------|-------|
| Reference captures | 8 in-game UI screenshots provided by the user (`1024x576` JPEG, corresponding to `gameuidatabase.com/gameData.php?id=2000`): `[0]` Dialogue bubble, `[1]` Settings (Misc), `[2]` Loading tip card, `[3]` Load save slot + toast, `[4]` Title main menu, `[5]` Settings (Audio) + sliders + scrollbar, `[6]` Inventory + Harmonica plaque, `[7]` Quests / Completed + Saving Sniff card | Sampled pixel-by-pixel in Python (`Pillow` + `NumPy`); nothing from the captures is shipped. |
| Tokens | Sampled from the 8 captures above and stored under `--mv-*` in [`src/tokens.css`](src/tokens.css) | No official token stylesheet exists. |
| Fonts | Tall, narrow hand-drawn condensed display & upright hand-lettered ink copy | Matched using open SIL OFL faces from `scripts/fonts/`: **Pathway Gothic One** (Regular) for tall condensed titles, headings, tabs and buttons; **Barlow Semi Condensed** (Regular, Medium, SemiBold, Bold) for calm readable body rows, settings trees and metadata; **Patrick Hand** (Regular) for handwritten storybook tip cards, dialogue quotes and tooltips. |
| Icons | Stroked rounded ink paths in [`src/Media.xaml`](src/Media.xaml) + 48px PNG menu icons in `src/Images/Lucide/` | Lucide strokes (ISC, 2px round caps/joins) mirror the game's clean rounded ink pen lines; Play, Scroll Curl, Quest Shield and Music Note marks are original geometries drawn for this theme. |
| Sprites | Generated deterministically via [`art/sprites.py`](art/sprites.py) into `src/Images/fx/` | Pure white (`RGB 255`) alpha masks: cold-press parchment paper tooth, distressed storybook print speckles, tapered pen divider stroke, 9-slice warm watercolor bloom, and drifting musical-note wisps. |
| Motion | Designed from static captures to reflect the game's watercolor ink and musical cadence | Gentle `CubicEase` ink/paper fades (`110ms` / `180ms` / `300ms`), playful `BackEase` (`0.30`) cover button entrance (`60ms` stagger), and melodic `1.65s` / `3.2s` running states. |

## Measured values (`1024x576` captures)

| Region / Component (Capture) | Sampled Hex | Token | Contrast / Note |
|------------------------------|-------------|-------|-----------------|
| Watercolor parchment sheet (`[1]`, `[5]`, `[6]`, `[7]`) | `#edebd6` (center), `#f2f0db` (light), `#e1dcc8` (edge) | `mv-paper`, `mv-paper-hi`, `mv-paper-soft` | Primary page, top bar, rail, light surfaces |
| Cream text & inset hairline (`[3]`, `[6]`, `[7]`) | `#fbf9eb` / `#f3ebde` / `#efedd8` | `mv-cream`, `mv-plum-border` | Text and 1px inner border on dark plaques & pine ribbons |
| Dialogue speech bubble cream (`[0]`) | `#c5b9ab`–`#e8d9d4` | `mv-oatmeal` (`#d8d3bd`) | Pressed light fills and soft card wells |
| Deep espresso ink & check marks (`[1]`, `[4]`) | `#261d17` / `#383735` | `mv-ink-deep` | `13.74:1` on `mv-paper` |
| Storybook heading & label ink (`[1]`, `[3]`) | `#3a2e2b` | `mv-ink` | `10.87:1` on `mv-paper` |
| Inactive tab / muted ink (`[1]`, `[4]`, `[6]`, `[7]`) | `#958f81` (tuned to `#696156` for AA text) | `mv-ink-muted` | `5.07:1` on `mv-paper`, `4.58:1` on `mv-paper-soft` |
| Hand-drawn divider rule & unchecked outline (`[1]`, `[5]`) | `#bab5a2` / `#969382` | `mv-ink-rule`, `mv-ink-faint` | Subtle dividers and slider tracks |
| Dark plum-charcoal plaques (`[3]` Save, `[6]` Harmonica, `[7]` Quest) | `#3b2c2f` (hover `#4e3b3f`, deep `#2b1f22`) | `mv-plum`, `mv-plum-hi`, `mv-plum-deep` | `12.51:1` with `mv-cream`; metadata folio, selected rows, secondary plaques |
| Snufkin pine-green ribbon (`[4]` *Melody of Moominvalley*, coat) | `#44775a` (tuned to `#336149` for crisp AA/AAA text) | `mv-pine`, `mv-pine-hi`, `mv-pine-deep` | `6.74:1` with `mv-cream`; Play ribbon and primary action |
| Quest shield terracotta crimson (`[7]` `!` shield) | `#bd5550` (tuned to `#b5453e`) | `mv-crimson`, `mv-crimson-hi`, `mv-crimson-deep` | `5.11:1` with `mv-cream`; filter badge, shield mark, danger close |
| Nocturnal valley campfire & sun halo gold (`[2]`, `[4]`) | `#fcc688` / `#f9e5ad` | `mv-gold` (`#e2a84b`), `mv-gold-soft` (`#f6e3aa`), `mv-gold-ink` (`#8a5617`) | `10.39:1` (`mv-gold-soft` on `mv-plum`); `5.10:1` (`mv-gold-ink` on `mv-paper`) |
| Twilight nocturnal valley river & sky (`[2]`) | `#182843` / `#294462` -> `#2a547e` | `mv-indigo`, `mv-indigo-hi`, `mv-indigo-deep` | `7.44:1` with `mv-cream`, `6.54:1` on `mv-paper`; distinct hue for `RunningIndicatorBrush` |

## Interface parts observed

- **Torn-edge watercolor parchment (`[1]`, `[5]`, `[6]`, `[7]`):** Full-bleed warm `#edebd6` storybook paper sheet with delicate paper tooth and softly organic watercolor edges over scenic valley art.
- **Curly scroll flourishes + tapered ink underline (`[1]`, `[4]`, `[6]`, `[7]`):** Every section heading (`SETTINGS`, `DELUXE SNUFKIN SKINS`, `LOADING`, `SAVING SNIFF`) and active tab/menu item (`MISC`, `AUDIO`, `INVENTORY`, `COMPLETED`, `CONTINUE`) sits between symmetrical ink scroll curls (`~o ... o~`) with a hand-drawn tapered horizontal underline below.
- **Dark plum plaques with inset cream hairline & distressing (`[3]`, `[6]`, `[7]`):** `HARMONICA`, `SAVING SNIFF`, and `SAVE #1` are dark `#3b2c2f` rectangular or pointed-hex plaques carrying a crisp `1px` inset cream hairline (`4px–5px` inside the edge) and faint vintage paper-speck distressing, topped in `[7]` by the overlapping terracotta crimson `!` quest shield.
- **Double-framed selected inventory slot (`[6]`):** Selected slot holds a thick dark plum-ink outer border plus a thin inner cream hairline frame; unselected slots sit quiet in muted `#bab5a2`.
- **Pine-green swallowtail ribbon (`[4]`):** Notched forest-green banner (`MELODY OF MOOMINVALLEY`) beneath the bold condensed title.
- **Hand-drawn audio sliders & tapered needle scrollbar (`[5]`):** Thin warm grey horizontal track with a `16px` hand-inked dark plum blot disc thumb, beside a slender vertical pen-stroke scrollbar tapering cleanly at both ends.
- **Hand-inked square checkboxes (`[1]`, `[7]`):** Slightly organic square ink boxes holding bold brushed `✓` marks.
- **Ivory loading tip card & circular button prompts (`[0]`, `[2]`, `[3]`):** Cream card with inset dark ink hairline rule and distressed speckles (`LOADING`), paired with crisp circular badge buttons (`(A)`, `(B)`, hourglass).

## Design rules taken from the captures

- **Parchment workspace + Dark Plum inspector contrast:** Keep library rows, sidebars, settings lists, and game descriptions on calm warm parchment (`#edebd6` / `#e3e0ca`), while using the iconic `#3b2c2f` dark plum-charcoal double-framed Quest Card for the right-hand Metadata Folio, selected items, secondary plates, and tooltips.
- **Strict hue separation across accents:** Pine green (`#336149`) owns Play & primary Save; Dark Plum (`#3b2c2f`) owns selection & Quest/Slot plates; Terracotta Crimson (`#b5453e`) owns `!` quest/filter/danger markers; Twilight Indigo (`#2a547e`) owns live running/launching game states; Warm Amber/Gold (`#e2a84b` / `#f6e3aa`) owns blooms and metadata headings.
- **Storybook ink warmth without clutter:** Reserve distressed speckle masks (`plaque-distress.png`) and watercolor grain (`paper-grain.png` <= 3.5% opacity) for sparse panels, plaques, and empty pages so dense lists and descriptions stay razor-sharp.
