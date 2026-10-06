# Overworld — research & sources

## Sources

Mojang publishes no design system. Values were read from the game itself; `tokens.css` tags each one:

| Tag | What | Where |
|-----|------|-------|
| `[px]` | Every widget color, decoded pixel by pixel: `widget/button` (outline `#000`, highlight `#AAAAAA`, fill `#6F6F6F`, shadow `#565656`), `button_highlighted` (outline `#FFF`, fill `#757575`), `button_disabled` (`#2C2C2C`), `slider`, `slider_handle` (8x20), `text_field` (`#000`, edge `#A0A0A0`, focused `#FFF`), `checkbox` (17x17), `tab`, `scroller` (`#C0C0C0`), `menu_background` (black 25%), `menu_list_background` (black 44%), `header_separator` / `footer_separator` (white 20% over black 75%), `popup/background` | `assets/minecraft/textures/gui/sprites/widget/*.png` of 1.21 (InventivetalentDev/minecraft-assets, branch 1.21). Read for values only; nothing is shipped. |
| `[src]` | Text colors (button `#FFF` / `#A0A0A0`, field `#E0E0E0`, hint `#808080`), text shadow (color x 0.25, offset 1,1), list selection (white outline focused, `#808080` unfocused, black fill), tooltip (`0xF0100010`, frame `0x505000FF` to `0x5028007F`), splash (`0xFFFF00`, -20 degrees), title screen layout (200x20 buttons, 24px pitch, 20x20 icon buttons), tab underline | The 1.21.1 client (piston-meta.mojang.com) decompiled with Mojang's published mappings: `TitleScreen`, `EditBox`, `AbstractSelectionList`, `TooltipRenderUtil`, `SplashRenderer`, `TabButton`, `Font`. |
| `[br]` | Play button green `#3C8527`, ramp `#52A535` / `#2A641C` | Bedrock Ore UI palette (Mojang/bedrock-samples `textures/ui` for the legacy buttons, approximate). |
| `[eye]` | Window, rail and library surfaces, list background flattened for popups, row hover veil, XP green | Chosen between sourced values. |
| Icons | Pixelarticons 2.4.1 (MIT), whole pixels on a 24px grid | `art/icons.py` writes the geometries into `src/Media.xaml` and the menu PNGs into `src/Images/Pixel`. `info/LICENSE-pixelarticons.txt`. |
| Tile icon | `art/mark.svg` (original isometric block), default orange | `scripts/render-addon-icon.py` |
| Font | Monocraft (OFL 1.1) suggested, not bundled; Minecraftia is personal-use only, so only named | |
| Playnite | Every file starts from the Playnite 10.60 Default theme (MIT, `info/LICENSE-Playnite.txt`); game page and side panels follow the shared skeleton | |

Sizes are the game's at **GUI scale 2**: 1 sprite pixel = 2px (outlines, bevel edges), buttons 40px tall.
