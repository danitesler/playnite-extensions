# Tatterspire: research

Source: Slay the Spire 2 (Mega Crit, Early Access, March 2026). Unofficial; no logo, art or font file is copied. Captures: the 26 UI screenshots at 1920x1080 on <https://interfaceingame.com/games/slay-the-spire-2> (viewed in the browser pane, colors sampled with a canvas on the loaded image; nothing saved to disk). Colors below are the 8-level-quantized samples, rounded in `src/tokens.css`.

## Surfaces and measured colors

| Part | Sample | Where it lands |
|------|--------|----------------|
| Dialog / HUD bar / tab body | `#284048`, edge `#101820`, inner rim `#284850` | `--slate`, `--abyss`, `--slate-rim` |
| Raised slate (dropdown, tooltip) | `#385868` | `--slate-lit` |
| Filter panel, scroll track | `#202828`, `#102028` | `--slate-deep`, `--night` |
| Title and keyword gold | `#e8c850` (logo `#f8d000`) | `--gold` |
| Scroll handle, orange gold | `#d89038`, `#d8a838` | `--gold-deep` |
| Body text | `#f8f0e0` | `--paper` |
| Proceed hex | fill `#682830`, mid `#783030` / `#883838`, rim `#b04850` | `--proceed*` |
| Back ribbon (red flag) | `#781810`, `#882010` | `--flag` |
| Attack card frame | `#883020`; description well `#403830`; silver title ribbon `#a0a0a0`; cost gem `#c83030` / `#f07810` | `--rust`, `--umber` |
| HP red | `#d84040` | `--hp` |
| Map parchment | `#a08868`; legend paper `#a0c0c8` | `--parchment`, `--paper-blue` |
| Main-menu fog | `#404850` | `--fog` |
| Silent energy | `#58a038` | `--energy` |

## Interface parts (the game element map reads from these)

- **Torn paper everywhere.** Dialogs, compendium cards, the legend, the act title ribbon and the map are hand-torn sheets: irregular 3-6 px notches on every edge, a darker 2 px outline and a lighter inner rim, a faint stain gradient. Selected / available cards are tan, blue, green and maroon papers of the same shape (compendium, game mode).
- **Hex and ribbon buttons.** Proceed: a flat hexagon (pointed left and right) in `--proceed` with a lit rim and gold lettering. Continue: a teal arrow plate pointing right with a green "A" gem on its left. End Turn: a slate hexagon with cream text and a gold "Y" gem. Back: a red flag ribbon with a swallow-tail notch at the right and a white return arrow; a small "B" gem.
- **Tabs and rows (settings).** Tabs are rounded slate plates, the active one outlined in cyan with a soft glow. Rows are separated by 1 px dark rules, a checkbox is a dark teal square with a gold check, steppers are gold triangles, the dropdown is a lit slate plate with gold corner brackets and a gold arrow.
- **Scroll bar.** A dark teal rail with a gold hexagonal handle that sits at the top and drifts down (the handle is the only gold element in the rail).
- **HUD.** A slate bar with a ragged lower edge across the top: HP heart and number in red, gold coin and number, a dark capsule with three slashes (potions), a floor icon, run timer, deck, map and settings icons at the right. Enemy HP is a thin red bar on a dark red track.
- **Cards.** Frame by type (attack rust red, skill teal-blue, power cyan), a silver ribbon with the name, a red round cost gem at top left, a dark umber description well with gold keywords. Hover: the card lifts and a cyan glow outlines it; the fan overlaps.
- **Energy orb.** A hexagon (Silent, green) or heptagon (Ironclad, red-orange) with "3/3" in white, thick dark outline.
- **Map.** Parchment sheet with dotted routes between node icons, a gold corner-bracket cursor on the current node, a pale-blue torn legend with a gold circled "Y".
- **Act title.** A translucent dark band across the page with a small cyan "Act 1" and a large gold slab-serif title.
- **Main menu.** Fog and a lit tower; the list has no panel; the selected line is gold and gains a gold swash on each side (one-two curls), the others cream.
- **Tooltip.** A dark navy box (`#101820`/`#182830`) with a 2 px slate border, cream text and gold keywords.

## Type

Titles and labels are a bold slab serif in gold with a dark soft outline; body is the same family, regular, cream. The title logo is custom lettering and is not reproduced. The English UI face is probably Kreon (its predecessor used Kreon; not confirmed for the sequel). Windows lacks it, so Tatterspire bundles **Zilla Slab** (OFL, already in `scripts/fonts/`) in Regular, SemiBold and Bold under `src/Typography/` as the stand-in.

## Motion

- Menu selection: the gold swashes slide in from the label toward the edges while the label turns gold (about 150 ms ease-out).
- Cards: lift 12-16 px and scale 1.05-1.1 on hover with the cyan outline fading in; the hand fans and re-spaces.
- Settings tabs: outline and glow fade in; the body switches instantly.
- Act title: band and text fade in together, hold, fade out.
- Buttons: Proceed / Continue brighten the rim on hover and sink 1-2 px when pressed.

## Not available / not verified

- No exact font identification; no frame-step captures (stills only), so durations above are design choices in the same range.
- The in-game title logo, tower art, card art and enemy art are not used.
