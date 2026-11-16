#!/usr/bin/env python3
"""Guiding Wind sprites: deterministic white masks (RGB 255, effect in alpha) written to src/Images/fx/.

Generates:
  brush-plate.png     256x64   9-slice sumi-e dry-brush bar (PlayButton, crimson selected rows, buttons)
  brush-banner-r.png  360x48   asymmetric left-flush brush banner with frayed right edge & ink flecks
  sayagata.png        96x96    seamless Japanese Sayagata interlocking key-fret geometric lattice
  washi-grain.png     256x256  seamless subtle paper fiber grain
  wind-wisps.png      320x160  seamless Guiding Wind air streams & drifting maple leaf silhouettes
  bloom.png           320x112  9-slice soft aura bloom behind Play and hovered tiles

Also writes art/fx-sheet.png for visual inspection. Run from repo or theme root:
  python3 src/themes/GuidingWind/art/sprites.py
"""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images" / "fx"
OUT.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(1274)  # 1274: historical setting year


def save(name, alpha):
    a = np.clip(alpha, 0.0, 1.0)
    rgba = np.dstack([np.full(a.shape, 255, np.uint8)] * 3 + [(a * 255.0 + 0.5).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(OUT / f"{name}.png", optimize=True, dpi=(96, 96))
    return a


def smooth(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def noise1(n, scale, wrap=True):
    knots = max(2, int(round(n / scale)))
    v = RNG.random(knots + 1)
    if wrap:
        v[-1] = v[0]
    x = np.arange(n) / n * knots
    i = np.floor(x).astype(int)
    t = smooth(x - i)
    return v[i] * (1.0 - t) + v[np.minimum(i + 1, knots)] * t


def noise2(w, h, sx, sy):
    gw, gh = max(2, int(round(w / sx))), max(2, int(round(h / sy)))
    g = RNG.random((gh, gw))
    ys, xs = np.arange(h) / h * gh, np.arange(w) / w * gw
    yi, xi = np.floor(ys).astype(int), np.floor(xs).astype(int)
    ty, tx = smooth(ys - yi), smooth(xs - xi)
    y1, x1 = (yi + 1) % gh, (xi + 1) % gw
    a = g[yi][:, xi] * (1.0 - tx) + g[yi][:, x1] * tx
    b = g[y1][:, xi] * (1.0 - tx) + g[y1][:, x1] * tx
    return a * (1.0 - ty[:, None]) + b * ty[:, None]


def make_brush_plate():
    """9-slice sumi dry-brush bar: 256x64, solid textured core (x=32..224, y=10..54), frayed bristles on edges."""
    w, h = 256, 64
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)

    # Top & bottom organic edge wobble (gentle, stays inside y=0..10 and y=54..64)
    top_edge = 5.0 + (noise1(w, 16) - 0.5) * 4.5 + (noise1(w, 5) - 0.5) * 2.0
    bot_edge = h - 5.0 + (noise1(w, 16) - 0.5) * 4.5 + (noise1(w, 5) - 0.5) * 2.0
    v_mask = smooth((y - top_edge[None, :] + 1.5) / 2.2) * smooth((bot_edge[None, :] - y + 1.5) / 2.2)

    # Left & right dry-brush bristles (per-row bristle reach & streak texture)
    row_streaks = noise1(h, 2.2, wrap=False) * 0.65 + noise1(h, 5.5, wrap=False) * 0.35
    left_reach = 2.0 + row_streaks * 24.0
    right_reach = w - 2.0 - (noise1(h, 2.0, wrap=False) * 0.65 + noise1(h, 6.0, wrap=False) * 0.35) * 24.0

    # Subtle dry-brush gaps inside the left/right 32px borders
    fine_streaks = 0.45 + 0.55 * noise1(h, 1.5, wrap=False)[:, None]
    left_mask = smooth((x - left_reach[:, None] + 2.0) / 5.5)
    right_mask = smooth((right_reach[:, None] - x + 2.0) / 5.5)
    edge_blend = np.minimum(1.0, np.minimum(x / 30.0, (w - 1 - x) / 30.0))
    bristle_tex = edge_blend + (1.0 - edge_blend) * fine_streaks

    # Very gentle paper-ink grain in the center (always >= 0.94 so text contrast stays uniform)
    core_grain = 0.94 + 0.06 * noise2(w, h, 14, 4)
    a = v_mask * left_mask * right_mask * bristle_tex * core_grain

    # Tiny ink droplets near left/right ends
    for _ in range(18):
        dx = float(RNG.choice([RNG.uniform(2, 26), RNG.uniform(w - 26, w - 2)]))
        dy = float(RNG.uniform(8, h - 8))
        r = float(RNG.uniform(0.8, 1.8))
        d = np.hypot(x - dx, y - dy)
        a = np.maximum(a, smooth((r - d + 0.6) / 1.0) * 0.75)

    return save("brush-plate", a)


def make_brush_banner_r():
    """Left-anchored sumi section banner (360x48): flush left, tapered 20-deg frayed bristle & splatter right tail."""
    w, h = 360, 48
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)

    top_edge = 3.0 + (noise1(w, 22, wrap=False) - 0.5) * 3.0 + (noise1(w, 6, wrap=False) - 0.5) * 1.5
    bot_edge = h - 3.0 + (noise1(w, 22, wrap=False) - 0.5) * 3.0 + (noise1(w, 6, wrap=False) - 0.5) * 1.5
    v_mask = smooth((y - top_edge[None, :] + 1.2) / 1.8) * smooth((bot_edge[None, :] - y + 1.2) / 1.8)

    # Diagonal sweep + dry-brush bristle tail starting around x=260..340
    row_streaks = noise1(h, 2.0, wrap=False) * 0.65 + noise1(h, 7.0, wrap=False) * 0.35
    slant = (h - y[:, 0]) * 0.65
    right_cut = 275.0 + slant + row_streaks * 52.0
    right_mask = smooth((right_cut[:, None] - x + 3.0) / 10.0)

    tail_zone = smooth((x - 245.0) / 40.0)
    dry_lines = 1.0 - tail_zone * (0.65 * (1.0 - noise1(h, 1.6, wrap=False)[:, None]))

    # Left edge is solid (x=0..8 only slightly brushed)
    core_tex = 0.93 + 0.07 * noise2(w, h, 18, 4)
    a = v_mask * right_mask * dry_lines * core_tex

    # Characteristic Ghost of Tsushima ink splatter specks beyond the frayed right tip
    for _ in range(28):
        dx = float(RNG.uniform(285, 355))
        dy = float(RNG.uniform(4, h - 4))
        r = float(RNG.uniform(0.7, 2.2))
        d = np.hypot(x - dx, y - dy)
        a = np.maximum(a, smooth((r - d + 0.5) / 0.9) * float(RNG.uniform(0.5, 0.95)))

    return save("brush-banner-r", a)


def make_sayagata():
    """Seamless 96x96 Japanese Sayagata interlocking key-fret geometric tile (48x48 unit repeated 2x2)."""
    cell = 48
    ss = 2
    s = cell * ss
    # Draw on a 3x3 periodic grid then crop center so edges wrap with zero seams
    big = Image.new("L", (s * 3, s * 3), 0)
    dr = ImageDraw.Draw(big)
    lw = 3  # 1.5px at 1x

    # Traditional Sayagata (tilted interlocking fret unit in 48x48 tile):
    # Clean orthogonal-plus-diagonal key-fret interlocking lattice matching Ghost of Tsushima right panel
    u = s / 4.0  # 24px at 2x = 12px at 1x
    segs = [
        # Outer interlocking arms (horizontal + vertical stepped meanders)
        [(0, u), (u, u), (u, 0)],
        [(u * 2, 0), (u * 2, u * 2), (u * 3, u * 2), (u * 3, u), (u * 4, u)],
        [(0, u * 3), (u, u * 3), (u, u * 2), (u * 2, u * 2), (u * 2, u * 4)],
        [(u * 3, u * 4), (u * 3, u * 3), (u * 4, u * 3)],
        # Diagonal connecting fret bridges (classic Sayagata diagonal links)
        [(u, u), (u * 2, u * 2)],
        [(u * 3, u * 3), (u * 2, u * 2)],
        [(u, u * 3), (u * 2, u * 2)],
        [(u * 3, u), (u * 2, u * 2)],
    ]
    for ox in (0, s, s * 2):
        for oy in (0, s, s * 2):
            for poly in segs:
                dr.line([(px + ox, py + oy) for px, py in poly], fill=255, width=lw, joint="miter")

    unit = big.crop((s, s, s * 2, s * 2)).resize((cell, cell), Image.LANCZOS)
    tile = Image.new("L", (cell * 2, cell * 2), 0)
    for tx in (0, cell):
        for ty in (0, cell):
            tile.paste(unit, (tx, ty))
    a = np.asarray(tile, dtype=np.float32) / 255.0
    return save("sayagata", a)


def make_washi_grain():
    """Seamless 256x256 fine mulberry washi paper fiber texture."""
    w, h = 256, 256
    # Subtle multi-scale paper pulp variation + fine 1px pixel grain + delicate mulberry fibers
    coarse = noise2(w, h, 48, 48)
    mid = noise2(w, h, 16, 16)
    fine = RNG.random((h, w)).astype(np.float32)
    base = 0.45 * coarse + 0.35 * mid + 0.20 * fine

    # Wrapped delicate mulberry paper fibers (random short curved strokes)
    img = Image.new("L", (w, h), 0)
    dr = ImageDraw.Draw(img)
    for _ in range(140):
        px = float(RNG.uniform(0, w))
        py = float(RNG.uniform(0, h))
        ang = float(RNG.uniform(0, math.pi * 2))
        ln = float(RNG.uniform(8, 22))
        pts = [(px, py)]
        for step in range(4):
            ang += float(RNG.uniform(-0.35, 0.35))
            px += math.cos(ang) * (ln / 4.0)
            py += math.sin(ang) * (ln / 4.0)
            pts.append((px, py))
        for ox in (-w, 0, w):
            for oy in (-h, 0, h):
                dr.line([(x + ox, y + oy) for x, y in pts], fill=95, width=1)
    fibers = np.asarray(img.filter(ImageFilter.GaussianBlur(0.35)), dtype=np.float32) / 255.0

    a = smooth((base - 0.32) / 0.50) * 0.35 + fibers * 0.45
    return save("washi-grain", np.clip(a, 0.0, 0.55))


def draw_maple_leaf(cx, cy, radius, angle_deg, canvas_size, ss=4):
    """Draw a 5-lobed Japanese momiji maple leaf silhouette at (cx, cy)."""
    w, h = canvas_size
    img = Image.new("L", (w * ss, h * ss), 0)
    dr = ImageDraw.Draw(img)
    pts = []
    # 5 pointed lobes + stem notch
    lobe_angles = [-120, -60, 0, 60, 120]
    lobe_lens = [0.58, 0.86, 1.00, 0.86, 0.58]
    rad0 = math.radians(angle_deg)
    # Base stem
    pts.append((0.0, 0.35 * radius))
    for i, (la, ll) in enumerate(zip(lobe_angles, lobe_lens)):
        a_tip = math.radians(la - 90)
        a_prev = math.radians(la - 90 - 26)
        a_next = math.radians(la - 90 + 26)
        if i == 0:
            pts.append((math.cos(a_prev) * radius * 0.25, math.sin(a_prev) * radius * 0.25))
        pts.append((math.cos(a_tip) * radius * ll, math.sin(a_tip) * radius * ll))
        pts.append((math.cos(a_next) * radius * 0.30, math.sin(a_next) * radius * 0.30))

    rot_pts = []
    ca, sa = math.cos(rad0), math.sin(rad0)
    for px, py in pts:
        rx = (cx + px * ca - py * sa) * ss
        ry = (cy + px * sa + py * ca) * ss
        rot_pts.append((rx, ry))
    dr.polygon(rot_pts, fill=255)
    small = img.resize((w, h), Image.LANCZOS)
    return np.asarray(small, dtype=np.float32) / 255.0


def make_wind_wisps():
    """Seamless 320x160 horizontal tile: curved Guiding Wind air ribbons + 3 drifting maple leaves."""
    w, h = 320, 160
    x = np.arange(w, dtype=np.float32)[None, :]
    y = np.arange(h, dtype=np.float32)[:, None]
    a = np.zeros((h, w), dtype=np.float32)

    # 4 gracefully curved periodic wind ribbons (seamless in x over 320px!)
    ribbons = [
        (36.0, 7.0, 1, 1.4, 0.55, 0.0),
        (68.0, 10.0, 2, 1.9, 0.72, 1.2),
        (106.0, 6.0, 1, 1.2, 0.48, 2.4),
        (134.0, 8.0, 2, 1.5, 0.50, 0.6),
    ]
    for y0, amp, freq, thick, strength, phase in ribbons:
        cy = y0 + amp * np.sin(2.0 * np.pi * freq * x / w + phase)
        dist = np.abs(y - cy)
        # Fade ribbon density along a periodic envelope so strands breathe naturally
        env = 0.25 + 0.75 * np.maximum(0.0, np.sin(np.pi * x / w + phase)) ** 1.4
        strand = np.exp(-((dist / thick) ** 2)) * env * strength
        a = np.maximum(a, strand)

    # Add 3 tiny drifting maple leaves (momiji) nestled in the wind streams
    leaves = [(54, 48, 7.5, -28, 0.75), (168, 92, 9.0, 18, 0.85), (272, 62, 6.5, -45, 0.68)]
    for lx, ly, lr, lang, lalpha in leaves:
        a = np.maximum(a, draw_maple_leaf(lx, ly, lr, lang, (w, h)) * lalpha)

    return save("wind-wisps", a)


def make_bloom():
    """Soft 9-slice aura glow: 320x112 with 28px squared falloff."""
    w, h, pad = 320, 112, 28
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = np.maximum(np.maximum(pad - x, x - (w - 1 - pad)), 0.0)
    dy = np.maximum(np.maximum(pad - y, y - (h - 1 - pad)), 0.0)
    d = np.hypot(dx, dy)
    return save("bloom", (np.clip(1.0 - d / pad, 0.0, 1.0) ** 2) * 0.85)


def make_sheet(parts):
    pad = 16
    width = max(p.shape[1] for _, p in parts) + pad * 2
    height = sum(p.shape[0] + pad + 18 for _, p in parts) + pad
    img = Image.new("RGB", (width, height), (212, 214, 211))  # misty washi backdrop
    dr = ImageDraw.Draw(img)
    y = pad
    tints = {
        "brush-plate": (184, 47, 43),      # crimson brush
        "brush-banner-r": (10, 10, 10),    # sumi banner
        "sayagata": (20, 20, 20),          # dark lacquer lines (previewed darker so visible)
        "washi-grain": (17, 18, 17),       # subtle grain
        "wind-wisps": (19, 122, 67),       # firefly / guiding wind
        "bloom": (196, 58, 54),            # crimson glow
    }
    for name, a in parts:
        dr.text((pad, y), f"{name}  {a.shape[1]}x{a.shape[0]}  peak {a.max():.2f}", fill=(25, 26, 25))
        y += 16
        h, w = a.shape
        bg = np.array([20, 20, 20] if name == "sayagata" else [212, 214, 211], np.float32)
        fg = np.array([196, 179, 110] if name == "sayagata" else tints[name], np.float32)
        rgb = bg[None, None, :] * (1.0 - a[..., None]) + fg[None, None, :] * a[..., None]
        tile = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
        img.paste(tile, (pad, y))
        y += h + pad
    img.save(ROOT / "art" / "fx-sheet.png", optimize=True)


def main():
    parts = [
        ("brush-plate", make_brush_plate()),
        ("brush-banner-r", make_brush_banner_r()),
        ("sayagata", make_sayagata()),
        ("washi-grain", make_washi_grain()),
        ("wind-wisps", make_wind_wisps()),
        ("bloom", make_bloom()),
    ]
    make_sheet(parts)
    print(f"Generated {len(parts)} sprites in {OUT} and {ROOT / 'art' / 'fx-sheet.png'}")


if __name__ == "__main__":
    main()
