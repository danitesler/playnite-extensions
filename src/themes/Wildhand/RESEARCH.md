# Wildhand — research (Balatro)

Unofficial fan theme. No game art, logo, card faces or font files are used: every shape is redrawn as vector or generated white-mask sprites.

## Sources

| Source | What it gave | Notes |
|--------|--------------|-------|
| [Game UI Database, Balatro (id 1935)](https://www.gameuidatabase.com/gameData.php?id=1935) | 45 captures (title, settings, blind select, HUD, shop, packs, collection, run info, cash out). Viewed in the browser pane, colors sampled with a canvas, nothing downloaded or kept. | Captures carry the game's CRT shader, so sampled colors run ~6-10% darker than the palette: blue samples `#008af6` vs `#009dff`, red `#f4473d` vs `#fe5f55`, felt `#2a5d47`. |
| Balatro's UI palette (`G.C` in the game's `globals.lua`) | Hex values below. | **Recalled, not re-read online:** a web search did not return the file. Hue and ratio agree with every capture sample, so treat the hexes as close, not exact. |
| m6x11 (Daniel Linssen) | The face the game sets all text in. | Free with attribution, not OFL, so it is not bundled. |
| Pixelify Sans (OFL, `scripts/fonts/pixelifysans`) | Stand-in face, Regular only (the static folder ships one weight), used at 17px and up. | Latin + Cyrillic subset, `src/Typography/`, with `liga` / `dlig` removed: its f ligatures draw an A-like glyph ("filter" read "Alter"), and below 17px its c reads as o (checked in a size test). |
| Nunito (OFL, `scripts/fonts/nunito`) | Regular and Bold, every size under 17px. | Rounded, close to the game's soft letter shapes; subset like Pixelify. |

## Palette

| Token (tokens.css) | Hex | Role in the game |
|---|---|---|
| `--chips` | `#009dff` | Chips box, Play Hand, hands counter number |
| `--mult` | `#fe5f55` | Mult box, Discard, discards counter, danger, Rare |
| `--money` | `#f3b958` | `$` totals, price tags |
| `--orange` | `#ff9a00` | Options, Back bar, Rank/Suit sort, current blind Select, "important" |
| `--green` | `#4bc292` | Reroll, Cash Out, Uncommon, "chance" |
| `--purple` | `#8867a5` | Tarot / Legendary family |
| `--gold` | `#eac058` | SHOP sign letters, gold seal |
| `--black` | `#374244` | Panel body (HUD column, menu panel) |
| `--l-black` | `#4f6367` | Inner boxes, hover wash, UI text-dark |
| `--grey` | `#5f7377` | Inactive/secondary plates |
| `--joker-grey` | `#bfc7d5` | Muted text |
| `--ui-outline-light` | `#d8d8d8` | Modal panel outline, checkbox rim |
| felt tokens | `#173629 / #214a39 / #2f6a50` | Sampled from the in-run table (CRT-lifted back to palette) |
| `--inset` | `#1e2628` | Recessed boxes (Round score, chips x mult well, price tag) |

Blind colors: Small `#50846e`, Big `#5186a8`, Boss `#b44430` (blind select, not mapped to chrome).

White text on the raw hues misses 4.5:1 (white on `#009dff` 2.9, on `#fe5f55` 3.0, on `#ff9a00` 2.1). The theme keeps the raw hues for numbers and decor and deepens only plates that carry white text (Play blue `#0a72c4` 5.2:1, danger red `#cf4339` 4.65:1); orange, green and gold plates carry ink `#1e2628` (7.2 / 6.9 / 8.7:1). The game has the same plates with white text and a pixel shadow.

## Interface parts observed

- **HUD column** (left, ~19% of screen): blind bar (blue, name), blind chip + "Score at least" + reward `$$$`, **Round score** inset (chip glyph + number), hand name + `lvl.1`, **Chips x Mult** (blue box, red X, red box), Run Info (red) / Options (orange) tall buttons, Hands (blue number) / Discards (red number) twin cells, money `$4` inset, Ante `1/8` / Round `1` twin cells. Outer rim is a dark 3px edge.
- **Buttons**: flat colour face, rounded ~8px (at 1080p), a darker **ledge** (bottom 4px), white pixel text with a hard shadow, a controller glyph in a small circle on the label row. Hover = scale up + a small rotation wobble ("juice"), press = ledge collapses.
- **Modal panel** (settings, run info, collection): dark slate rounded rect with a thin pale outline, tab row inside its own white-outlined rounded frame (red tabs, a **red triangle** over the active one, `Lb` / `Rb` bumper pills at both ends), wide orange **Back** bar at the bottom.
- **Option rows**: label above, red value box between two small red square arrows `<` `>`, three tiny dots under the value (position indicator); slider = red fill on a dark track with the value in a red pill; checkbox = dark rounded square with white rim.
- **SHOP sign**: gold pixel letters in a red marquee frame, white bulbs chasing round it, "Improve your run!" below.
- **Price tag**: small dark tab with a notch, gold `$` number, sits above a card.
- **Cash Out**: dotted leader lines between label and amount, big green button.
- **Cards**: white/cream, rounded, a selected card rises and tilts; jokers and tarots show an edition shimmer.
- **Collection**: pages with `<` Page 3/10 `>` in red, count bars under cards.
- **Background**: paint-swirl shader (red/blue menu, green felt in a run, blind-coloured in boss rounds) under a CRT filter (scanlines, curvature, bloom).

## Motion observed

- Everything "juices": a pop to ~1.1 scale with a ±3° rock settling in ~250 ms (cards, buttons, counters when a value changes).
- Hover on a card: lift ~10 px and a slight tilt; selected cards stay raised.
- Counters tick up digit by digit; chip and mult boxes bounce on each added value.
- Menu panels slide in from below with an overshoot; the tab pointer slides between tabs.
- Marquee bulbs on the SHOP sign alternate on a ~300 ms step.
- Value dots (`• • •`) under option boxes step through positions.

## Decisions carried into the brief

Pixel face on titles, Play, tabs, scores and the band (17px and up, Regular only); Nunito under 17px. Panels are slate with ledged colour plates; the library sits on felt, not on the swirl (kept calm). CRT scanlines appear only on decor layers (rail foot, hero banner, empty state), never over lists or text.
