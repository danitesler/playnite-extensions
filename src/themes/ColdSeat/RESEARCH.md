# ColdSeat — research & sources

## Sources

Blizzard publishes no design system and the game draws its panels with BLP textures. Text values come from the frame definition files; surface colors are measured from captures. `tokens.css` tags each value `[FDF]` (verified), `[cap]` (measured) or `[eye]` (estimated).

| Tag | What | Where |
|-----|------|-------|
| `[FDF]` | Label/button text gold `#FCD312` (FontColor 0.99 0.827 0.0705), highlight white, disabled `#808080`, shadow black at 90%, titles white (glue) or gold (main menu); Friz Quadrata (`FRIZQT__.TTF`) for every UI font; frame proportions (glue button corner 0.016, Esc panel 0.288 x 0.384 with 0.01 insets, checkbox 0.024, radio 0.016, slider 0.139 x 0.012, scrollbar 0.012, edit box 0.04 tall) | `EscMenuTemplates.fdf` in [tdauth/wowr](https://github.com/tdauth/wowr) @ `361680f`; `UI/FrameDef/Glue/StandardTemplates.fdf`, `UI/war3skins.txt` in [WarRaft/War3.mpq](https://github.com/WarRaft/War3.mpq) @ `bce1f9d`. The skin files read were the Human skin; the Frozen Throne main menu skin itself was not read. |
| `[cap]` | Six captures of the 1.26 menus supplied by the repo owner (2026-11-10), sampled with Pillow: main menu (1280x720), game lobby, loading screen, Battle.net dialog, LAN games list (474x379), Sound options (1280x1024). Not stored in the repo (Blizzard art). | Values below |
| `[eye]` | Ice `#5FB4E8`, ice light `#BFE6FF`, muted text, void | Chosen by eye |
| Fonts | Friz Quadrata TT, then Palatino Linotype, Book Antiqua, Georgia | Friz Quadrata is not bundled and not on Windows. |
| Icons | Original line artwork, 24 grid | `src/Media.xaml`; menu icons stay Playnite's glyphs. MIT with the repo. |
| Tile icon | `art/mark.svg` (original ice spire), default orange | `scripts/render-addon-icon.py` |
| Playnite | Every file starts from the Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`) | |

## Measurements from the captures

| Part | Sampled | Token |
|------|---------|-------|
| Button plate body (Sound options, "Gameplay") | `#000036` to `#01003B`, base `#000026` | `--wc3-blue` `#00003A`, `--wc3-blue-deep` `#000024` |
| Plate lit line, top and left | `#000498`, `#060F83`, `#0B0F74` | `--wc3-blue-lit` `#0A16A8` |
| Plate corner glint (dropdown) | `#4952EA` | `--wc3-blue-glint` |
| Iron frame band | `#141414` to `#292929`, warm in places (`#24201D`) | `--wc3-stone` `#222225` |
| Iron lit edge, rivet heads | `#464646` to `#515355` | `--wc3-stone-border` `#56565E` |
| Grooves beside the band | `#030303`, `#010101` | `--wc3-groove` `#030304` |
| Panel glass (over the scene) | `#242529` to `#2F3039` | `--wc3-night` `#1C1D26` (darker: Playnite has no bright scene behind it) |
| Dialog body | black | `--wc3-dialog` `#08080B` |
| Check box well, slider channel | `#111309`, `#1F1F23` | `--wc3-stone-dark` `#0A0A0D` |
| Check mark | `#F1D750` to `#F3D76A` over a dark gold underside (`#4E3400`) | `--wc3-gold`, `--wc3-gold-dark` |
| Slider gem | `#43468B`, `#333572` | `--wc3-blue-glint` |
| List selection bar (LAN games) | `#4240D1` to `#433ED8` | `--wc3-royal` |

## Design rules read from the captures

- Every button is the same object: a blue plate with a lit top edge inside a thick dark iron frame; the label is gold, white while highlighted. Main menu and dialog buttons carry a barbed iron spike beside the frame.
- Dropdowns are the same plate with a solid gold down triangle; a locked dropdown (lobby slots of other players) loses the blue and goes black.
- Panels are translucent blue-grey glass in a wide iron band with rivets every few centimetres; panels hang from chains on the main menu.
- Edit boxes and the chat box are black wells with a thin iron rim. Text in them is white.
- Field labels are gold, values white (lobby: "Map size:" gold, "Small" white).
- Check boxes: iron bezel, dark well, a heavy hand-drawn gold tick that overflows the well.
- Sliders: a dark channel, a round blue gem thumb, "Low" / "High" in white at the ends.
- Lists select with a flat saturated blue bar across the row.
- The loading bar is a blue fill in an iron channel with spiked ends.

## Motion

The menus have little motion: panels slide in on chains, buttons swap to a highlight texture at once and the label offsets by one pixel while pressed (`ButtonPushedTextOffset` in the FDF files). The theme fades the lit plate in over 0.1 to 0.18s, pushes the label 1px on press, and keeps the frost glint and bloom on Play from the earlier version.
