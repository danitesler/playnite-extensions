# Questlog — research & sources

The look is the Classic client's own interface: charcoal panels in a thin metal frame, deep red panel buttons with gold text, gold labels and white values, a gold glow under the current entry. The first version of the theme read its colors off the art by eye and landed on flat brown with yellow gradients; this version is measured.

## Sources

| What | Where |
|------|-------|
| Text colors, font styles | Client UI source, Classic Era 1.15.9 (`Gethe/wow-ui-source`, branch `classic_era`): `Blizzard_Fonts_Shared/Shared/FontStyles.xml`, `GameFontStyles.xml` (`GameFontNormal` 1.0/0.82/0.0, `GameFontHighlight` white, `GameFontDisable` 0.5, `GameFontRed` 1.0/0.1/0.1, `QuestFont` / `QuestTitleFont` black, `QuestFontNormalSmall` 0.30/0.18/0, `ItemTextFontNormal` 0.18/0.12/0.06) |
| Font families and sizes | `Blizzard_Fonts_Shared/Classic/Fonts.xml`: Friz Quadrata (`FRIZQT__.TTF`) 13 / 14, Morpheus 16, Arial Narrow for numbers |
| Status bar colors | `Blizzard_UIPanels_Game/Classic/CastingBarFrame.xml` (casting 1.0/0.7/0.0) |
| Item quality | Documented client values that live in data files, not in that source: `ITEM_QUALITY_COLORS` (#9d9d9d, #ffffff, #1eff00, #0070dd, #a335ee, #ff8000, #e6cc80) |
| Panel, frame, plate, button, field, knob, slot and tooltip colors | **Sampled per pixel from four reference captures** (table below). Named `PANEL_*`, `FRAME_*`, `TITLE_BAR_*`, `PLATE_*`, `BUTTON_*`, `SELECT_*`, `FIELD_*`, `CHECK_*`, `SLIDER_*`, `KNOB_*`, `SCROLL_*`, `SLOT_*`, `TOOLTIP_*` in `tokens.css`. The textures themselves are Blizzard's and are not used or shipped |
| Icons | Original drawings: `art/glyphs.py` (28 glyph geometries), `art/menu_icons.py` (24 painted menu icons and the question mark placeholders). No third-party icon set, so no icon license file |
| Paper | `art/parchment.py`: a seamless procedural tile (`src/Images/parchment.png`), used for the notes letter |
| Playnite mechanics | Playnite 10.60 Default theme (`scripts/data/playnite-theme-api.json`); `DescriptionView.html` and `ThemeFile` behavior read from `source/Playnite.DesktopApp/Controls/Views/GameOverview.cs` and `source/Playnite/Controls/HtmlTextView.cs` |

## Reference captures

Supplied by the theme's owner; not stored in the repository. Sizes are the capture sizes, coordinates are pixels in them.

| # | Screen | Size | Used for |
|---|--------|------|----------|
| 1 | Classic character creation | 2000x1125 | Info panels (tooltip frame), red Accept / Back buttons, slot plates, step arrows, the name edit box |
| 2 | Classic login | 2000x1000 | The big red Login button, edit boxes |
| 3 | An add-on options panel drawn with the client's frame art | 1220x970 | The model for Settings: frame, title strip, category list, dropdown plate, slider, check box, scroll bar, red buttons |
| 4 | Character and spellbook frames | 1024x576 | Frame tabs, the red close button, slot beds |

## Measurements

| Part | Samples | Token |
|------|---------|-------|
| Frame line | #9e9f9c, #979895 lit; #6d6f6f in shade; black line #0a0a0a just inside (capture 3, top edge x=400 and the rule under the title) | `FRAME_METAL_LIGHT`, `FRAME_METAL`, `FRAME_INK` |
| Panel body | #1d1f1e body, #1c1c1c category list (3) | `PANEL_BG`, `PANEL_NAV` |
| Category header band | #0f0f0f to #161616 fill, #2b2b2b line above, #535353 line below (3, x=200 y=118..156) | `PANEL_BAND`, `PANEL_BAND_LINE_*` |
| Rules | #333534 between list and page; #9d9d9d under the page heading (3) | `PANEL_RULE`, `PANEL_RULE_BRIGHT` |
| Title strip | #0a0806 at the top, #2f2c26 in the middle, #171513 at the bottom, then black, #858585..#9e9f9c, black (3, x=300 y=12..50) | `TITLE_BAR_*` |
| Selected entry | Fill #463f21 on the list charcoal (gold at about 18 to 24 percent), strongest near 40 percent of the row and fading to both ends; hairlines #ab9e60 above and #c4ae51 below; label white (3, y=312..342) | `SELECT_LINE`, `SELECT_GLOW` |
| Entries | Gold #e5c326..#f3cb37 as rendered (the client constant is #ffd100), gray #909292 for disabled, white for headers | `NORMAL_FONT_COLOR`, `DISABLED_FONT_COLOR` |
| Dropdown plate | Lit line #666666, then #404040 down to #2a2a2a and #1c1e1d; rim #474747; black outside #141414 (3, x=760 y=238..274) | `PLATE_*` |
| Step arrow | Same plate, gold arrow #e2c108 (3) | `PLATE_*`, `NORMAL_FONT_COLOR` |
| Red button | Bezel #625d5e; face #680404 in the middle, falling to #4d0202, #300407 and #0f0000 at the rim on all four sides (3, Defaults and Close). Login and Accept are brighter: #7a0b0a (1, 2) | `BUTTON_*` |
| Close button | The same red face, gold X, gray bezel #9e9c9a (3, 4) | `BUTTON_*` |
| Slider | Groove #0c0c0c with a #505050 edge; gray gem #6a6a68, lit #bfbfbd along the top, #4d4d4d below (3) | `SLIDER_*`, `KNOB_*` |
| Check box | Bed #070707..#141414, edge #494647 (3). Tick #fee213 | `CHECK_*` |
| Scroll bar | Knob #56504d, lit #8c8c8c on one side, #474642 on the other; lane #151515..#1a1a1a; bare gray arrows (3) | `SCROLL_*` |
| Edit box | Fill #010101..#151410, edge #61615d (1, the name box) | `FIELD_*` |
| Slot plate | Bed #0a0a0a, edge #3d3d3d with #585858 lit and #0f0f0f in shade (1, the appearance rows) | `SLOT_*` |
| Info panel | Backdrop #18141e..#1a171c (near black, a violet cast), edge #8b8882 with #3b383b in shade; gold title, white text (1) | `TOOLTIP_*` |
| NEW flag | White text in a blue glow, #3a6fa2 mid-glow (3). The 9px filter mark needs more light, so `NEW_FLAG_COLOR` is #7fc4ff | `NEW_FLAG_COLOR` (derived) |

Tokens marked "derived" in `tokens.css` are a measured value shifted for a state no capture shows (hover plates, hover edges, the lit button face, the disabled face).

## Design rules taken from the captures

- **One frame language.** Windows, dialogs and panels are a thin metal line with a black line inside it. No thick ring, no brown.
- **Charcoal, not brown.** Surfaces are neutral near-black; warmth comes only from the title strip, the gold text and the red buttons.
- **Gold is text, not fill.** Labels, entries and glyphs are gold; nothing is a gold plate. The primary action is the red button, the way Login, Accept and Enter World are.
- **Selection is a glow under white text**, strongest in the middle, with a gold hairline above and below. Never a solid bar.
- **Headers are white on a black band**; entries under them are gold.
- **Buttons sit in a bezel.** Red face, gray bezel, black line. Hover turns the label white (the button's highlight font).
- **Secondary controls are charcoal plates** lit along the top (dropdowns, step arrows), with gold glyphs.

## Motion

The client's interface barely moves: a button highlight is an additive glow that appears under the pointer, a checked slot keeps a gold line, and text switches from the normal to the highlight font. The theme keeps to that: fades of 0.12 to 0.3s, no ornament in motion.

| Part | Motion |
|------|--------|
| Play | The lit face fades in over 0.15s and a soft gold bloom rises round the button (0.2s); both fade back over 0.3s. Pressed is its own layer, 0.06s in |
| Cover hover | The slot highlight: a gold line and an inner glow fade in over 0.18s with two glints; out over 0.25s |
| Cover buttons | Red plates; the lit face fades in over 0.12s |
| Empty game page | A slow gold glow breathing behind an empty slot (2.2s each way), only while it shows |
