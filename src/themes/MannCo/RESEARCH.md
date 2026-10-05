# Mann Co — research & sources

Unofficial fan theme. It reproduces the *look* of the Team Fortress 2 menus (tan paper plates on dark brown, rust hover, RED and BLU) from public descriptions of the game's UI scheme. No Valve art, logos, textures, bitmaps or fonts are used or shipped; the mark, every icon and the preview art are original (`info/NOTICE-MannCo.txt`).

This file was assembled from what the theme's earlier notes, `src/tokens.css` header and the XAML headers already recorded. The sources below were **not re-fetched** when it was written; "status" says what is known about each. Where a value has no source it says so.

## Sources

| ID | What | Where | Status |
|----|------|-------|--------|
| S1 | Default TF2 HUD scheme: Colors, Borders, Fonts, CustomFontFiles | `resource/clientscheme.res`, read from the mirror https://raw.githubusercontent.com/Hypnootize/TF2-Default-HUD/master/resource/clientscheme.res | recorded as read by the earlier notes |
| S1b | Cross-check of TanLight, TanDark, TanDarker | https://raw.githubusercontent.com/Jofre-Problem/OGHUD/f3c1bd1d20ab9c544afe31289acfef907d9b61d5/resource/clientscheme.res | recorded as read |
| S2 | Main menu layout: left column of 250 x 26 buttons, 5px gap, tan plate with dark text, hover swaps the plate | default `resource/ui/mainmenuoverride.res` | recorded as read; the file names the button bitmaps but not their pixels |
| S3 | Quality colors (only Unique gold is used, for mixed scores) | https://wiki.teamfortress.com/wiki/Item_quality | recorded as read |
| S4 | Background browns `#221E1B`, `#2B2724`, `#3C352D`, button text highlight `#C95138` | CriticalFlaw TF2HUD.Editor `docs/resources/teamfortress.css` (community-measured values) | recorded as read |
| S7 | RED and BLU: Team Spirit paint values `#B8383B` and `#5885A2` | mannterface `resource/paint_colors.res` | recorded as read |
| — | Icons | original, hand drawn on a 24 grid in `src/Media.xaml` | own work |
| — | Add-on tile mark | `art/mark.svg`, a supply crate seen from the front | own work |

The `S1`, `S3`, `S4` and `S7` labels are the ones `src/tokens.css` uses in its header; `S2` and `S1b` are labels added here. `S5` and `S6` are not used anywhere (the label gap predates this file).

No screenshots or captures of the game were used; none are stored in the repo.

## Chosen values

### Palette (`src/tokens.css`)

| Token | Hex | Source |
|-------|-----|--------|
| `tan-light` | `#EBE2CA` | S1 TanLight, S1b |
| `tan-dark` | `#756B5E` | S1 TanDark, S1b |
| `tan-darker` | `#2E2B2A` | S1 TanDarker, S1b |
| `yellow` | `#FBEBCA` | S1 Yellow (check marks) |
| `brown-darkest`, `brown-dark`, `brown-mid` | `#221E1B`, `#2B2724`, `#3C352D` | S4 |
| `brown-lighter` | `#3B3630` | S1 LighterDarkBrown |
| `rust` | `#91493B` | S1 TFOrange |
| `rust-bright` | `#C95138` | S4 |
| `orange` | `#F08149` | "press kit hot orange"; no file in the sources above gives it, taken from the earlier notes |
| `amber` | `#FFA72A` | S1 ItemColor |
| `red-solid`, `red-bright` | `#C01C00`, `#FF4040` | S1 RedSolid, ItemAttribNegative |
| `team-red`, `team-blu` | `#B8383B`, `#5885A2` | S7. The HUD scheme's own team colors (`#B45C4D`, `#687C9B`) were rejected as muddy next to the browns |
| `gray` | `#B2B2B2` | S1 Gray |
| `slider-track`, `slider-knob` | `#1F1F1F`, `#6C6C6C` | S1 Slider.TrackColor, NobColor |
| `disabled-bg` | `#4F4D44` | S1 UpgradeDisabledBg |
| `success` | `#5E9631` | S1 SaleGreen |
| `transparent-black` | black at 77% | S1 TransparentBlack |
| `quality-unique` | `#FFD700` | S3 |
| `black-wash` | black at 45% | derived here (entry box fill), not in a source |

### Type

TF2 Build and TF2 Secondary, the game's UI fonts, are proprietary and not shipped. S1 lists Verdana and Trebuchet MS as the scheme's fallbacks, so the theme uses Verdana for body text (13px) and Trebuchet MS bold for headings, buttons, tabs and captions. Previews draw Verdana with DejaVu Sans and Trebuchet MS with Selawik (`scripts/data/fonts.json`).

### Shape

S1 Borders gives 2px corners for Playnite controls. The main menu bitmaps are said to round about 4px at 32px height; the pixel values are not in any source (the .res files only name the bitmaps). Radii: `ControlCornerRadius` 2, `CornerRadiusSmall` 1, Large 4, XLarge 6.

## Design decisions

- Tan paper marks whatever is current, selected, pressed or lit (rail item, list row, tab, menu row, tooltip); rust marks hover. This inverts the main menu, where tan is the resting plate and hover swaps it (S2).
- The 3px RED | BLU rule under the top bar stands for the two sides of every map. Colors are S7 values, not the HUD's.
- Checkboxes, radios and sliders follow the S1 CheckButton and Slider entries (18px box, TransparentBlack fill, Yellow edge; 6px near-black track).
- Flat fills with a 1px edge: TF2 draws its plates from textured bitmaps with torn paper edges, which the repo rules do not allow (no bitmap textures or shadow effects on tiles).

## Not found / not done

- Exact pixel colors and corner radii of the main menu bitmaps.
- The tan-versus-dark fill of the tooltip and the look of the tabs in the options dialog: design calls here.
- No in-game capture was measured; every color above comes from scheme files or the community CSS, not from sampled pixels.
- Whether the earlier notes' `orange` (`#F08149`) matches any game file: unverified.
