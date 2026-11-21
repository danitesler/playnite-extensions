#!/usr/bin/env python3
"""Counterfoil (Disco Elysium / FELD Playback) effect sprites.

Deterministic (fixed seed 1951). Pure white RGB (255, 255, 255) with effect in alpha,
so XAML (`Fill="{DynamicResource ...}"` + `OpacityMask`) and HTML previews (`-webkit-mask`)
recolor every sprite automatically through ThemeModifier.

Run:
    python src/themes/Counterfoil/art/sprites.py [--sheet <path>]

Writes src/Images/fx/*.png:
    paper-tape.png     512x96   Full-width torn / deckled photo-paper strip (OPTIONS, VOICE OVER MODE, active row).
    tape-tab.png       256x64   Compact torn photo-paper label strip (SETTINGS, INVENTORY, section headers, active tabs).
    brush-bar.png      512x96   Painterly oil-brush dialogue / CONTINUE / Play reply slab with rough edges & bristle tail.
    film-rail.png      36x512   Vertical 35mm FELD film-strip rail with stepped mechanical cutouts, ruler ticks & frame notches.
    film-rail-h.png    512x24   Horizontal FELD film-strip ruler rail with stepped cutouts & millimeter ticks.
    film-grain.png     256x256  Seamless 35mm photographic emulsion grain & fine analog film scratches.
    oil-wash.png       512x256  Expressionist impasto oil-paint mottled wash (Play button sheen, darkroom atmosphere).
    torn-frame.png     128x128  9-slice weathered ink-and-film portrait frame with organic brush edges & corner marks.
    darkroom-leak.png  256x512  Vertical darkroom burnt-amber light-leak column (title/options sidebar glow).
    halftone-corner.png 256x192 Distressed diagonal halftone dot-screen fading into corner (Inventory/Overview corner).
"""
import argparse
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'src', 'Images', 'fx')
os.makedirs(OUT, exist_ok=True)
RNG = np.random.default_rng(1951)


def save_mask(name, alpha):
    a = np.clip(alpha, 0.0, 1.0)
    rgba = np.zeros(a.shape + (4,), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.round(a * 255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, name + '.png'), optimize=True)
    return rgba


def smooth(e0, e1, x):
    t = np.clip((x - e0) / np.maximum(1e-6, e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def noise1d(n, scale, octaves=4, tile=False):
    out = np.zeros(n, dtype=float)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        step = max(1, int(round(scale / (2 ** o))))
        if tile:
            count = max(2, int(round(n / step)))
            pts = RNG.uniform(-1.0, 1.0, count)
            xs = (np.arange(n) / n) * count
            i = np.floor(xs).astype(int) % count
            i1 = (i + 1) % count
            f = xs - np.floor(xs)
        else:
            count = n // step + 3
            pts = RNG.uniform(-1.0, 1.0, count)
            xs = np.arange(n) / step
            i = xs.astype(int)
            i1 = i + 1
            f = xs - i
        f = f * f * (3.0 - 2.0 * f)
        out += amp * (pts[i] * (1.0 - f) + pts[i1] * f)
        total += amp
        amp *= 0.5
    return out / total


def noise2d(h, w, scale, octaves=4, tile=False):
    out = np.zeros((h, w), dtype=float)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        s = max(1, int(round(scale / (2 ** o))))
        if tile:
            gh = max(2, int(round(h / s)))
            gw = max(2, int(round(w / s)))
            grid = RNG.uniform(-1.0, 1.0, (gh, gw))
            ys = (np.arange(h)[:, None] / h) * gh
            xs = (np.arange(w)[None, :] / w) * gw
            yi = np.floor(ys).astype(int) % gh
            xi = np.floor(xs).astype(int) % gw
            yi1 = (yi + 1) % gh
            xi1 = (xi + 1) % gw
            fy = ys - np.floor(ys)
            fx = xs - np.floor(xs)
        else:
            gh, gw = h // s + 3, w // s + 3
            grid = RNG.uniform(-1.0, 1.0, (gh, gw))
            ys = np.arange(h)[:, None] / s
            xs = np.arange(w)[None, :] / s
            yi, xi = ys.astype(int), xs.astype(int)
            yi1, xi1 = yi + 1, xi + 1
            fy, fx = ys - yi, xs - xi
        fy = fy * fy * (3.0 - 2.0 * fy)
        fx = fx * fx * (3.0 - 2.0 * fx)
        a = grid[yi, xi]
        b = grid[yi, xi1]
        c = grid[yi1, xi]
        d = grid[yi1, xi1]
        out += amp * ((a * (1.0 - fx) + b * fx) * (1.0 - fy) + (c * (1.0 - fx) + d * fx) * fy)
        total += amp
        amp *= 0.5
    return out / total


def make_paper_tape():
    """512x96 torn / deckled photo-paper strip (OPTIONS, VOICE OVER MODE, active library row)."""
    h, w = 96, 512
    y, x = np.mgrid[0:h, 0:w].astype(float)
    # Slightly irregular deckled top & bottom edges (keep interior ~8..88 solid for crisp ink text)
    top = 5.5 + 3.2 * noise1d(w, 42, 4) + 1.4 * noise1d(w, 8, 2)
    bot = (h - 6.0) + 3.4 * noise1d(w, 38, 4) + 1.5 * noise1d(w, 7, 2)
    band = smooth(top - 1.6, top + 1.6, y) * (1.0 - smooth(bot - 1.6, bot + 1.6, y))

    # Torn fibrous left & right ends (left is cleaner/near-flush for docked rails; right is rougher & slightly torn)
    left_edge = 3.0 + 4.5 * (noise1d(h, 12, 3) * 0.5 + 0.5)
    right_edge = (w - 6.0) - 11.0 * (noise1d(h, 11, 4) * 0.5 + 0.5) - 3.5 * np.sin(np.arange(h) / h * np.pi * 2.2)
    ends = smooth(left_edge[:, None] - 1.8, left_edge[:, None] + 2.2, x) * (
        1.0 - smooth(right_edge[:, None] - 3.0, right_edge[:, None] + 1.8, x)
    )

    # Subtle fibrous paper tooth & tiny distressed edge nicks (never punching holes through text interior)
    fiber = noise2d(h, w, 14, 4) * 0.5 + 0.5
    fine = noise2d(h, w, 4, 2) * 0.5 + 0.5
    edge_dist = np.minimum(np.minimum(y - top, bot - y), np.minimum(x - left_edge[:, None], right_edge[:, None] - x))
    near_edge = 1.0 - smooth(0.0, 12.0, edge_dist)
    wear = 1.0 - (0.04 * (1.0 - fiber) + 0.24 * near_edge * (1.0 - fine))

    # Tiny horizontal dry-tear scratch notch near the right third (classic Disco Elysium SETTINGS/INVENTORY strip detail)
    notch_y = int(h * 0.24)
    notch = np.exp(-0.5 * ((y - notch_y) / 1.4) ** 2) * smooth(w - 58, w - 18, x) * 0.55

    alpha = np.clip(band * ends * wear - notch, 0.0, 1.0)
    return save_mask('paper-tape', alpha)


def make_tape_tab():
    """256x64 compact torn photo-paper label strip (SETTINGS, INVENTORY, section headers, active tabs)."""
    h, w = 64, 256
    y, x = np.mgrid[0:h, 0:w].astype(float)
    # Top edge very slightly tilted/hand-cut, bottom edge rough deckled
    top = 4.0 + 2.4 * noise1d(w, 28, 4) + 1.0 * noise1d(w, 6, 2)
    bot = (h - 4.5) + 2.6 * noise1d(w, 26, 4) + 1.2 * noise1d(w, 6, 2)
    band = smooth(top - 1.4, top + 1.4, y) * (1.0 - smooth(bot - 1.4, bot + 1.4, y))

    # Hand-torn left and right ends with subtle brush feathering
    left_edge = 4.5 + 5.5 * (noise1d(h, 9, 3) * 0.5 + 0.5)
    right_edge = (w - 5.0) - 8.5 * (noise1d(h, 8, 4) * 0.5 + 0.5)
    ends = smooth(left_edge[:, None] - 1.6, left_edge[:, None] + 2.0, x) * (
        1.0 - smooth(right_edge[:, None] - 2.6, right_edge[:, None] + 1.5, x)
    )

    fiber = noise2d(h, w, 10, 4) * 0.5 + 0.5
    fine = noise2d(h, w, 3, 2) * 0.5 + 0.5
    edge_dist = np.minimum(np.minimum(y - top, bot - y), np.minimum(x - left_edge[:, None], right_edge[:, None] - x))
    near_edge = 1.0 - smooth(0.0, 9.0, edge_dist)
    wear = 1.0 - (0.04 * (1.0 - fiber) + 0.28 * near_edge * (1.0 - fine))

    # Signature small white/cut scratch on upper-right edge (like INVENTORY header in ref screenshot 7)
    cut = np.exp(-0.5 * ((y - 12.0) / 1.3) ** 2) * smooth(w - 42, w - 12, x) * 0.45
    alpha = np.clip(band * ends * wear - cut, 0.0, 1.0)
    return save_mask('tape-tab', alpha)


def make_brush_bar():
    """512x96 painterly oil-brush slab (CONTINUE, Red Check reply, Play button, Danger exit)."""
    h, w = 96, 512
    y, x = np.mgrid[0:h, 0:w].astype(float)
    u = x / (w - 1.0)

    # Bold painted body with dry-brush ridges along top/bottom and organic drag on right end
    top = 5.0 + 4.0 * noise1d(w, 34, 4) + 1.8 * noise1d(w, 7, 2) + 2.5 * smooth(0.84, 1.0, u[0])
    bot = (h - 5.5) + 4.2 * noise1d(w, 30, 4) + 1.8 * noise1d(w, 6, 2) - 3.0 * smooth(0.82, 1.0, u[0])
    band = smooth(top - 2.0, top + 2.0, y) * (1.0 - smooth(bot - 2.0, bot + 2.0, y))

    left_edge = 3.0 + 5.0 * (noise1d(h, 9, 3) * 0.5 + 0.5)
    right_edge = (w - 10.0) - 18.0 * (noise1d(h, 8, 4) * 0.5 + 0.5)
    ends = smooth(left_edge[:, None] - 2.0, left_edge[:, None] + 2.5, x) * (
        1.0 - smooth(right_edge[:, None] - 6.0, right_edge[:, None] + 2.5, x)
    )

    # Bristle streaks running horizontally + organic oil-paint mottling near right tail
    bristle = 0.92 + 0.08 * noise1d(h, 5, 3)[:, None]
    impasto = noise2d(h, w, 18, 4) * 0.5 + 0.5
    tail_zone = smooth(0.68, 0.98, u)
    tail_dry = 1.0 - 0.34 * tail_zone * smooth(0.42, 0.78, 1.0 - impasto)

    core = band * ends * bristle * tail_dry

    # A few subtle fine dry-bristle flicks past the right edge
    flicks = np.zeros((h, w), dtype=float)
    for _ in range(10):
        row = int(RNG.uniform(14, h - 14))
        x0 = int(RNG.uniform(w - 52, w - 24))
        length = int(RNG.uniform(16, 44))
        xs = np.arange(x0, min(w - 1, x0 + length))
        fade = (1.0 - (xs - x0) / max(1, length)) ** 1.3
        for xx, ff in zip(xs, fade):
            flicks[row, xx] = max(flicks[row, xx], 0.72 * ff)
            if row + 1 < h:
                flicks[row + 1, xx] = max(flicks[row + 1, xx], 0.28 * ff)

    alpha = np.clip(np.maximum(core, flicks), 0.0, 1.0)
    return save_mask('brush-bar', alpha)


def make_film_rail():
    """36x512 vertical 35mm FELD PLAYBACK film strip rail with stepped cutouts & millimeter ticks.
    Tiles seamlessly vertically. Right edge holds fine ruler ticks; body holds stepped metallic strip & frame bars.
    """
    h, w = 512, 36
    alpha = np.zeros((h, w), dtype=float)

    # Base vertical metallic film band (x=4..28) with subtle stepped mechanical cutouts along outer left edge
    # Stepped notches repeat every 128px (exact divisor of 512 for seamless tiling)
    for y in range(h):
        ym = y % 128
        # Trapezoidal notch cut into left edge between ym=26..66 (like Options & Archetype vertical film strips)
        if 26 <= ym < 34:
            left_x = 4 + (ym - 26) * 1.0
        elif 34 <= ym < 58:
            left_x = 12.0
        elif 58 <= ym < 66:
            left_x = 12.0 - (ym - 58) * 1.0
        else:
            left_x = 4.0

        # Subtle inner step on right side between ym=88..108
        if 88 <= ym < 94:
            right_x = 24.0 - (ym - 88) * 0.5
        elif 94 <= ym < 102:
            right_x = 21.0
        elif 102 <= ym < 108:
            right_x = 21.0 + (ym - 102) * 0.5
        else:
            right_x = 24.0

        lx0 = int(np.floor(left_x))
        rx0 = int(np.ceil(right_x))
        alpha[y, lx0:rx0] = 0.76
        # Crisp bright inner edge line
        alpha[y, rx0 - 1] = 0.96
        alpha[y, lx0] = 0.90

    # Punched sprocket / registration slots inside the film band (every 128px)
    for base in range(0, h, 128):
        # Twin vertical registration punch marks
        alpha[base + 8:base + 20, 8:14] = 0.14
        alpha[base + 72:base + 82, 8:13] = 0.14
        # Bright micro index bar (evoking printed frame codes 01A13 / 01A14 at low-res scale)
        alpha[base + 112:base + 115, 7:19] = 0.98
        alpha[base + 117:base + 119, 7:15] = 0.55

    # Fine graduated millimeter ruler ticks projecting along right edge (x=24..35)
    for y in range(0, h, 8):
        if y % 64 == 0:
            alpha[y:y + 2, 24:36] = 0.98  # major 64px tick
        elif y % 32 == 0:
            alpha[y:y + 1, 24:33] = 0.88  # medium 32px tick
        elif y % 16 == 0:
            alpha[y:y + 1, 24:30] = 0.72  # minor 16px tick
        else:
            alpha[y:y + 1, 24:28] = 0.48  # micro 8px tick

    # Subtle weathered photographic grain so the silver film strip feels tactile
    grain = noise2d(h, w, 10, 3, tile=True) * 0.5 + 0.5
    alpha = np.clip(alpha * (0.86 + 0.14 * grain), 0.0, 1.0)
    return save_mask('film-rail', alpha)


def make_film_rail_h():
    """512x24 horizontal FELD film-strip ruler rail (under hero banner, top bar rule, Character Sheet top)."""
    h, w = 24, 512
    alpha = np.zeros((h, w), dtype=float)

    for x in range(w):
        xm = x % 128
        # Stepped mechanical cutout along bottom edge
        if 34 <= xm < 40:
            bot_y = 14.0 - (xm - 34) * 0.65
        elif 40 <= xm < 66:
            bot_y = 10.0
        elif 66 <= xm < 72:
            bot_y = 10.0 + (xm - 66) * 0.65
        else:
            bot_y = 14.0
        by = int(round(bot_y))
        alpha[2:by, x] = 0.74
        alpha[2, x] = 0.96
        alpha[by - 1, x] = 0.92

    # Sprocket notches & micro frame dashes
    for base in range(0, w, 128):
        alpha[5:10, base + 12:base + 24] = 0.15
        alpha[5:8, base + 94:base + 110] = 0.98

    # Graduated millimeter ruler ticks projecting downward (y=14..23)
    for x in range(0, w, 8):
        if x % 64 == 0:
            alpha[14:24, x:x + 2] = 0.98
        elif x % 32 == 0:
            alpha[14:21, x:x + 1] = 0.86
        elif x % 16 == 0:
            alpha[14:19, x:x + 1] = 0.68
        else:
            alpha[14:17, x:x + 1] = 0.44

    grain = noise2d(h, w, 8, 3, tile=True) * 0.5 + 0.5
    alpha = np.clip(alpha * (0.88 + 0.12 * grain), 0.0, 1.0)
    return save_mask('film-rail-h', alpha)


def make_film_grain():
    """256x256 seamless 35mm photographic emulsion grain + faint vertical film scratches."""
    h, w = 256, 256
    # High-frequency photographic silver-halide grain + soft emulsion mottle
    fine = RNG.normal(0.5, 0.24, (h, w))
    coarse = noise2d(h, w, 32, 3, tile=True) * 0.5 + 0.5
    grain = np.clip(0.55 * fine + 0.45 * coarse, 0.0, 1.0)

    # A few subtle vertical analog film scratches
    scratches = np.zeros((h, w), dtype=float)
    for _ in range(7):
        col = int(RNG.uniform(0, w))
        strength = RNG.uniform(0.18, 0.45)
        y0 = int(RNG.uniform(0, h))
        length = int(RNG.uniform(50, 180))
        for dy in range(length):
            yy = (y0 + dy) % h
            fade = np.sin(np.pi * dy / length)
            scratches[yy, col] = max(scratches[yy, col], strength * fade)

    alpha = np.clip(grain * 0.85 + scratches, 0.0, 1.0)
    return save_mask('film-grain', alpha)


def make_oil_wash():
    """512x256 expressionist impasto oil-paint mottled wash (CONTINUE gradient texture, hero/panel atmosphere)."""
    h, w = 256, 512
    y, x = np.mgrid[0:h, 0:w].astype(float)
    # Domain-warped oil brushstrokes (horizontal-diagonal swirling impasto)
    wx = noise2d(h, w, 48, 3) * 34.0
    wy = noise2d(h, w, 48, 3) * 20.0
    # Stretched brush strokes along a slight diagonal
    u = (x + wx) / w
    v = (y + wy) / h
    swirl = np.sin((u * 3.8 + v * 1.4) * np.pi) * 0.5 + 0.5
    clouds = noise2d(h, w, 42, 4) * 0.5 + 0.5
    detail = noise2d(h, w, 12, 3) * 0.5 + 0.5
    # Soft vignette so edges blend cleanly without seams
    vx = smooth(0.0, 0.14, x / w) * (1.0 - smooth(0.86, 1.0, x / w))
    vy = smooth(0.0, 0.16, y / h) * (1.0 - smooth(0.84, 1.0, y / h))
    alpha = np.clip((0.50 * clouds + 0.30 * swirl + 0.20 * detail) * vx * vy, 0.0, 1.0)
    return save_mask('oil-wash', alpha)


def make_torn_frame():
    """128x128 9-slice weathered portrait / card frame (Skill Cards, Game Covers, Screenshots)."""
    s = 128
    y, x = np.mgrid[0:s, 0:s].astype(float)
    # Distance to outer border (frame sits at inset 4..9 with organic brush variation)
    d = np.minimum(np.minimum(x, s - 1 - x), np.minimum(y, s - 1 - y))
    rough = 1.4 * noise2d(s, s, 10, 3)
    outer = smooth(2.0 + rough, 4.0 + rough, d)
    inner = 1.0 - smooth(6.5 + rough, 9.0 + rough, d)
    ring = outer * inner

    # Crisp double-corner registration L-brackets at all 4 corners (inset 12..24)
    corners = np.zeros((s, s), dtype=float)
    for cy0, cy1 in [(0, 26), (s - 26, s)]:
        for cx0, cx1 in [(0, 26), (s - 26, s)]:
            # Outer reinforced corner cap
            corners[cy0:cy1, cx0:cx1] = np.maximum(corners[cy0:cy1, cx0:cx1], ring[cy0:cy1, cx0:cx1] * 1.25)

    # Fine inner keyline at inset 12 (dashed near corners)
    keyline = smooth(11.0, 11.8, d) * (1.0 - smooth(12.2, 13.0, d)) * 0.42
    fiber = 0.85 + 0.15 * (noise2d(s, s, 6, 2) * 0.5 + 0.5)
    alpha = np.clip(np.maximum(ring * 0.85, np.maximum(corners, keyline)) * fiber, 0.0, 1.0)
    return save_mask('torn-frame', alpha)


def make_darkroom_leak():
    """256x512 vertical photographic darkroom amber light-leak column (Options / Title strip glow)."""
    h, w = 512, 256
    y, x = np.mgrid[0:h, 0:w].astype(float)
    u = x / (w - 1.0)
    v = y / (h - 1.0)

    # Bright warm photographic light leak peaking in the upper 35%, tapering gently into deep darkroom shadow below
    vert = (1.0 - smooth(0.18, 0.92, v)) * (0.72 + 0.28 * smooth(0.0, 0.15, v))
    # Subtle soft horizontal bloom (fuller across the film column, gently softer at edges)
    horiz = smooth(0.0, 0.12, u) * (1.0 - smooth(0.84, 1.0, u))
    # Analog photographic emulsion bands & gentle light-leak mottle
    mottle = 0.82 + 0.18 * (noise2d(h, w, 54, 4) * 0.5 + 0.5)
    streaks = 0.92 + 0.08 * noise1d(w, 18, 3)[None, :]
    alpha = np.clip(vert * horiz * mottle * streaks, 0.0, 1.0)
    return save_mask('darkroom-leak', alpha)


def make_halftone_corner():
    """256x192 distressed diagonal halftone dot-screen fading into bottom-right / corner (Inventory background)."""
    h, w = 192, 256
    y, x = np.mgrid[0:h, 0:w].astype(float)
    # Diagonal 45-degree halftone grid
    angle = np.deg2rad(38.0)
    rx = x * np.cos(angle) - y * np.sin(angle)
    ry = x * np.sin(angle) + y * np.cos(angle)
    spacing = 8.0
    gx = (rx % spacing) - spacing * 0.5
    gy = (ry % spacing) - spacing * 0.5
    dist = np.sqrt(gx * gx + gy * gy)

    # Radial/diagonal falloff from bottom-right corner (1,1) outward
    u = x / (w - 1.0)
    v = y / (h - 1.0)
    falloff = smooth(0.15, 0.98, 0.55 * u + 0.65 * v)
    distress = noise2d(h, w, 24, 4) * 0.5 + 0.5
    # Dot radius shrinks smoothly with falloff and distressed ink wear
    radius = 2.7 * falloff * (0.55 + 0.65 * distress)
    dots = 1.0 - smooth(radius - 0.65, radius + 0.55, dist)

    # Mask out outer fade so it never hits a hard edge on top/left
    edge_fade = smooth(0.05, 0.45, u) * smooth(0.05, 0.45, v)
    alpha = np.clip(dots * edge_fade * 0.88, 0.0, 1.0)
    return save_mask('halftone-corner', alpha)


def write_sheet(sprites, sheet_path):
    """Compose a dark-backed visual inspection contact sheet."""
    cols = 2
    cell_w, cell_h = 540, 160
    rows = (len(sprites) + cols - 1) // cols
    pad = 16
    sheet = Image.new('RGB', (cols * cell_w + (cols + 1) * pad, rows * cell_h + (rows + 1) * pad), (18, 21, 22))

    # Tinted preview colors matching Counterfoil's authentic roles
    tints = {
        'paper-tape': (230, 228, 222),
        'tape-tab': (230, 228, 222),
        'brush-bar': (200, 61, 27),
        'film-rail': (169, 178, 183),
        'film-rail-h': (169, 178, 183),
        'film-grain': (210, 215, 218),
        'oil-wash': (133, 98, 204),
        'torn-frame': (230, 228, 222),
        'darkroom-leak': (185, 93, 23),
        'halftone-corner': (228, 171, 46),
    }

    for idx, (name, rgba) in enumerate(sprites):
        r, c = divmod(idx, cols)
        x0 = pad + c * (cell_w + pad)
        y0 = pad + r * (cell_h + pad)
        # Subtle dark cell frame
        cell = Image.new('RGBA', (cell_w, cell_h), (12, 14, 15, 255))
        src = Image.fromarray(rgba, 'RGBA')
        # Tint white mask for easy visual inspection
        tr, tg, tb = tints.get(name, (235, 235, 235))
        arr = np.array(src)
        arr[..., 0] = tr
        arr[..., 1] = tg
        arr[..., 2] = tb
        tinted = Image.fromarray(arr, 'RGBA')

        # Fit inside cell preserving aspect ratio (or rotate film-rail vertically/sideways for visibility)
        if name == 'film-rail':
            # Show 3 side-by-side copies at 1x height cropped/scaled to cell_h
            scale = (cell_h - 16) / tinted.height
            nw = max(12, int(tinted.width * scale))
            nh = cell_h - 16
            resized = tinted.resize((nw, nh), Image.Resampling.LANCZOS)
            # Also show a 2x zoomed section next to it!
            crop = tinted.crop((0, 0, tinted.width, 160)).resize((tinted.width * 2, cell_h - 16), Image.Resampling.NEAREST)
            cell.alpha_composite(resized, (40, 8))
            cell.alpha_composite(crop, (110, 8))
        else:
            scale = min((cell_w - 24) / tinted.width, (cell_h - 20) / tinted.height)
            nw = max(1, int(tinted.width * scale))
            nh = max(1, int(tinted.height * scale))
            resized = tinted.resize((nw, nh), Image.Resampling.LANCZOS)
            cell.alpha_composite(resized, ((cell_w - nw) // 2, (cell_h - nh) // 2))

        sheet.paste(cell.convert('RGB'), (x0, y0))

    os.makedirs(os.path.dirname(os.path.abspath(sheet_path)), exist_ok=True)
    sheet.save(sheet_path, optimize=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sheet', default='', help='Optional path to write a visual inspection contact sheet PNG')
    args = parser.parse_args()

    sprites = [
        ('paper-tape', make_paper_tape()),
        ('tape-tab', make_tape_tab()),
        ('brush-bar', make_brush_bar()),
        ('film-rail', make_film_rail()),
        ('film-rail-h', make_film_rail_h()),
        ('film-grain', make_film_grain()),
        ('oil-wash', make_oil_wash()),
        ('torn-frame', make_torn_frame()),
        ('darkroom-leak', make_darkroom_leak()),
        ('halftone-corner', make_halftone_corner()),
    ]
    print(f'Wrote {len(sprites)} sprites to {OUT}')
    if args.sheet:
        write_sheet(sprites, args.sheet)
        print(f'Wrote contact sheet to {args.sheet}')


if __name__ == '__main__':
    main()
