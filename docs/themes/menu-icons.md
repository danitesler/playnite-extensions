# Menu item icons (every theme, new ones included)

The icons beside Add Game, Update Game Library, Pick a Random Game, Add-ons, Settings, Switch to Fullscreen, About and Exit in the main menu, and beside Play, Install, Favorite, Hide, Edit, Remove, Open folder and the rest in the game context menu, are **never Playnite's stock icofont glyphs**. Each theme draws **its own set of 24 bare, styled PNG icons**, built from that theme's source (its silhouette geometry, material, fill, line craft and palette). No two themes may share a set: the validator and `check-all` fail a copy, a recolour of another theme's drawings, a theme still on the stock glyphs, or a recipe that wraps icons in a background plate.

This is the menu-item counterpart of the [main menu mark](menu-mark.md): the mark is the button, these are the rows.

## Display sizes and how Playnite loads them

Playnite builds each menu row's `Icon` from the theme's `*Icon` resource. A `<sys:String>` holding a theme-relative PNG path (`Images/<Dir>/AddGame.png`) or a `BitmapImage` (pixel sets, see below) is loaded as an image inside the menu's `Icon` presenter; a `TextBlock` is an icofont glyph.

Across the repo's themes (`DefaultControls/Menu.xaml`), the menu `Icon` presenter renders at:

- **16x16** in almost every theme (74 themes)
- **15x15** in Dropzone and Emberline
- **18x18** in Clearwater
- **20x20** in Biome and Questlog

PNGs are rasterised at **48x48** (3x of 16px) so they stay crisp up to 300% DPI scaling. Because almost every menu shows them at **15-16px**, every pixel of the 24x24 design grid matters.

### Sharpness at 125% / 175% display scaling

Vector icons are not an option: Playnite's `MenuHelpers.GetIcon` accepts only a `string` path, a `BitmapImage` or a `TextBlock` (icofont glyph, one colour) and ignores a `DrawingImage`. So the icons stay bitmaps, and two things decide how sharp they look when 16px is not a whole number of device pixels (16px is 20 device pixels at 125% and 28 at 175%):

- **Scaling mode.** A `<sys:String>` path is always drawn with `HighQuality` (Fant) scaling. That suits smooth sets but smears pixel art into mush. A `BitmapImage` resource lends its own `RenderOptions.BitmapScalingMode` to the menu `Image`, which was verified against Playnite.dll. Recipes with `"pixel"` therefore render as `<BitmapImage x:Key="…Icon" UriSource="{ThemeFile 'Images/…png'}" RenderOptions.BitmapScalingMode="NearestNeighbor" />`, at a whole multiple of their grid (16 -> 48, 20 -> 60). Nearest-neighbour on a smooth set looks jagged, so smooth sets keep the string path.
- **Whole-pixel placement.** Every theme's implicit `ContextMenu` style sets `<Setter Property="UseLayoutRounding" Value="True" />`. It inherits into submenus, the main menu and `TopPanelMenu`. Without it, 30px rows put every other row on half a device pixel at 175%, and that row's icon blurs.

`validate-extension.ps1` fails a pixel recipe whose keys are not NearestNeighbor `BitmapImage`s and a `ContextMenu` style without the rounding setter. `render-menu-icons.mjs --check` also fails the former.

The 24 keys: `FullscreenModeIcon`, `AddGameIcon`, `UpdateDbIcon`, `AboutPlayniteIcon`, `ExitIcon`, `SettingsIcon`, `AddonsIcon`, `PlayIcon`, `InstallIcon`, `LinksIcon`, `OpenFolderIcon`, `InstallSizeIcon`, `DesktopShortcutIcon`, `AddFavoritesIcon`, `RemoveFavoritesIcon`, `HideIcon`, `UnHideIcon`, `HdrIcon`, `EditGameIcon`, `RemoveGameIcon`, `DiceIcon`, `ManualIcon`, `BackupIcon`, `RestoreBackupIcon`. Nothing else in a theme references them, so replacing the TextBlocks is safe.

## Pure icon only — no background plates

**Never define an icon set's style with a background badge, plate, box, circle, hexagon, diamond, shield, tag, card or frame behind every icon.**

At 15-16px, a uniform background container around every icon steals ~40% of the canvas and shrinks the actual symbol to 7-9px, turning distinct menu actions into barely visible smudges. Reference sets that read cleanly in Playnite (`Questlog`, `Biome`, `Overworld`, `Silver98`, `GreenfieldXp`, `Counterfoil`) all draw **purely the icon itself** filling the full canvas.

Instead, every theme's identity comes from **how the icon itself is drawn**:

- **Full-frame silhouette**: icons fill nearly the full 24x24 box (`gs` 0.88-0.98, default `0.94`; `--check` rejects anything under `0.80` or any `badge` field).
- **Readable at 15-16px on both rest and hover plates**: PNGs do not recolour when a row highlights. Give bare icons either a filled `body` + contrasting `ink` stroke, a tight contour `halo` hugging only the glyph edges, or a crisp contour `shadow` so they survive both rest and hover plates (especially on themes whose menu plate flips between light and dark on hover).
- **Theme-unique icon craft**: differentiate sets through silhouette geometry, metaphor picks, fill mode, material finish clipped *inside the icon body itself*, stroke weight/cap/join, skew/proportion/pixel-grid snapping, and contour treatment — never by pasting a shared thin glyph onto a different background shape.

## The pipeline

```
src/themes/<Theme>/art/menu-icons.json   the recipe: the only hand-written file
node scripts/render-menu-icons.mjs <Theme> [--sheet]
  -> src/themes/<Theme>/src/Images/<Dir>/<Slot>.png   24 PNGs, 48x48 (pixel sets: a whole multiple of the grid), transparent
  -> src/themes/<Theme>/src/Media.xaml                 the MENU-ICONS:BEGIN/END block of 24 keys (<sys:String>, or NearestNeighbor <BitmapImage> for pixel sets)
  -> .docs-local/menu-icon-sheets/*.png                review sheets (40px on rest, real 16px on rest, real 16px on hover)
```

`--all` re-renders every theme that has a recipe; `--check` (also `npm run check:menu-icons`, and a step in `check-all.ps1`) renders nothing and fails when a theme is on stock glyphs, has missing files, uses a `badge` background plate or `gs < 0.80`, ships byte-identical PNGs to another theme, or draws nearly the same icons as another theme (mean edge overlap of the eight core icons at or above 0.75). Chromium does the rasterising (`scripts/lib/chrome.mjs`), so gradients, filters and clip paths all work.

`new-theme.ps1` drops a neutral bare-icon starter recipe into `art/menu-icons.json`. Restyle it from the theme's source, render with `--sheet`, and inspect the real 16px strips on both rest and hover plates.

## Writing a recipe

Start from the theme's source, not from a generic icon pack: how would that game, OS or design system draw a standalone 16px icon? Is it chiseled metallic bevel, chunky cel-shaded ink with offset shadow, crisp pixel art, skewed kinetic neon with chromatic echo, soft hand-inked watercolour, sharp angular stencil, or glossy enamel? Pick the silhouette idiom, material finish, proportions and metaphor variants, then pull colours from `src/tokens.css`.

| Field | What it does |
|---|---|
| `dir` | `Images/<dir>`: theme-owned, never a name another theme uses for different art |
| `glyph` | `{ ink, body, acc, sw, cap, join }`: `ink` strokes/outlines (hex or `[top, bottom]` / `[top, mid, bot]` gradient), `body` fills closed icon shapes (hex, gradient array, or `null` for bold open-line icons), `acc` is the accent colour (plus signs, arrows, pips, stars; also accepts gradients). `sw` is the pen in 24-grid units (`1.8`-`2.6`; keep bold enough to read at 15-16px). `cap`/`join`: `round`, `square`/`miter`, `butt`/`bevel` |
| `mode` | `"duotone"` (default: filled `body` + `ink` outline + `acc` details), `"solid"` (bold filled silhouette with thin contrast rim and crisp inner details), `"line"` (open bold strokes, `body: null`), `"cutout"` (solid `ink` silhouette with inner `acc` accents) |
| `gs` | glyph scale on the 24x24 box (default `0.94`, allowed `0.80`-`1.0`; aim for `0.90`-`0.98` so icons fill their 15-16px slot); `glyphDy` / `glyphDx` nudge alignment if needed |
| `finish` | Surface finish clipped strictly to the icon body itself (never a background box): `"gloss"` (upper specular sheen), `"bevel"` (top-left lit rim + bottom-right shade), `"split"` (diagonal two-tone facet sheen), `"scan"` (subtle CRT/holo lines inside the glyph), `"grain"` (subtle textured speckles inside the glyph), `"halftone"` (comic dot shade inside the glyph), `"stripe"` (subtle angled metallic sheen across the glyph). Accepts a string or array; tune with `finishC` / `finishOpacity` |
| `transform` | Pure icon geometry styling: `{ skewX, rotate, scaleX, scaleY }` (e.g. `skewX: -10` for slanted kinetic themes, `scaleX: 0.86` for tall condensed gothic/Art Deco, `rotate: -4` for playful/jaunty sets) |
| `pixel` | Pixel-art quantization (`16` or `12`): renders crisp pixel-stepped icons at that grid size, scaled by a whole factor to at least 48px, and wires them as NearestNeighbor `BitmapImage`s so 125%/175% display scaling keeps hard pixel edges (great for retro/VGUI/arcade themes) |
| `stencil` | `true` or dash string (e.g. `"5 1.8"`): breaks long outer strokes into military/industrial stencil segments |
| `halo` | Tight contrast outline `{ c, w }` hugging only the glyph silhouette (`w` `1.0`-`2.2`) so the icon reads on both rest and hover plates without any background box |
| `shadow` | Hard solid offset silhouette shadow `{ c, dx, dy }` (no blur) hugging the icon itself — comic, pop, sticker, cut-paper, retro craft |
| `echo` | Chromatic / split-lens offset silhouette `{ c, dx, dy, opacity }` behind the glyph — cyberpunk, synthwave, arcade, holo |
| `fx` | `["rough"]` (hand-inked wobble: `roughScale`, `roughFreq`, `roughSeed`), `["glow"]` (tight luminous edge glow around the glyph: `glow`, `glowC`) |
| `tones` / `toneStyles` | `danger` (Exit, Remove), `gold` (Favorites), `ok` (Play): an accent colour each, or a fuller override `{ acc, ink, body, halo }` |
| `cycle` | `{ acc, ink, body }` arrays handed out slot by slot: LCARS multi-colour silhouettes, LEGO primary brick colours, Balatro card suits |
| `pick` | `{ <Slot>: "a" \| "b" \| "c" \| "d" \| "e" \| "f" }`: the glyph variant per slot. Choose metaphors that genuinely fit the theme (e.g. a wrench or heavy 6-tooth cog for industrial Settings, a D20 for RPG Dice, a card for card games, a standalone thick `+` or power glyph for clean UI themes, sharp angular sync arrows for sci-fi). `slots: { <Slot>: { v, ink, acc, body } }` overrides one icon completely |
| `plates` | `{ rest, hover }` the menu's real rest and hover plate colours (matching `PopupBackgroundBrush` and the row highlight in `Menu.xaml`), used to verify 16px legibility on the review sheet |

Glyph variants live in `scripts/lib/menu-icon-kit.mjs` (24 slots, 2 to 6 bold full-frame variants each). Add a variant there when no existing metaphor fits a theme, and every recipe can use it.

## Rules

- **No background plates**: never wrap icons in a uniform badge, box, tile, circle, hexagon, shield or frame. `badge` is forbidden and rejected by `--check`. Style the icon itself.
- **Full-frame & legible at 15-16px**: `gs` at least `0.88` (hard floor `0.80`), pen `1.8` or more for open strokes, no hairline detail under one grid unit, and strong contrast on **both** `plates.rest` and `plates.hover` (use filled `body` + contrasting `ink` or a tight `halo` when rest and hover plates flip luminance).
- **Unique**: a theme never copies or recolours another theme's set. Combine the source's own silhouette idiom (`mode`, `finish`, `transform`, `pixel`, `stencil`, `fx`, `shadow`, `echo`), line language (`sw`, `cap`, `join`) and fitting metaphor `pick`s. The check measures edge overlap over the eight core icons (`< 0.75`).
- **Right tones**: Exit and Remove read as danger, Favorites as the theme's gold, Play as its go colour, taken from the theme's own tokens; no off-palette red.
- **Kept calm**: no animation, no heavy blurred drop shadow, no visual clutter that turns to mud at 16px.
- **Review at real size**: always inspect the review sheet's **16px rest** and **16px hover** strips across all 24 icons before calling a set done, and fix any icon that looks faint, cramped or ambiguous.

## Legacy shared packs

Before this rule, about twenty themes drew their icons from a generic pack tinted per theme (Lucide, Phosphor, Material, the shared Pixel set, "Icons"). `render-menu-icons.mjs` lists them in `LEGACY_SHARED` and tolerates identical pairs among them only. Give one its own bare-icon recipe, render it, and remove it from that list; new themes never join it.
