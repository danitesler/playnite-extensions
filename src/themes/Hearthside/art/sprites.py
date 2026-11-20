#!/usr/bin/env python3
"""Hearthside procedural white-mask sprite generator. Deterministic (fixed seed).

Generates white-mask RGBA PNGs (RGB 255, effect in alpha) in src/Images/fx/
at 2 px per DIP (192 dpi) so XAML fills rectangles/shapes with DynamicResource
theme brushes via OpacityMask, and HTML previews reuse the exact same files via
CSS -webkit-mask / -webkit-mask-box-image. ThemeModifier recolors every texture
and ornament automatically.

Usage:
    python src/themes/Hearthside/art/sprites.py [--sheet path/to/sheet.png]
"""
import argparse
import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
THEME = os.path.dirname(HERE)
OUT = os.path.join(THEME, "src", "Images", "fx")
os.makedirs(OUT, exist_ok=True)

PX = 2
DPI = 96 * PX


def save_mask(name: str, alpha_01: np.ndarray, blur: float = 0.0) -> np.ndarray:
    a = np.clip(alpha_01, 0.0, 1.0)
    img_a = Image.fromarray((a * 255.0 + 0.5).astype(np.uint8), "L")
    if blur > 0:
        img_a = img_a.filter(ImageFilter.GaussianBlur(blur))
    arr_a = np.array(img_a, dtype=np.uint8)
    rgba = np.dstack([
        np.full_like(arr_a, 255),
        np.full_like(arr_a, 255),
        np.full_like(arr_a, 255),
        arr_a,
    ])
    path = os.path.join(OUT, f"{name}.png")
    Image.fromarray(rgba, "RGBA").save(path, optimize=True, dpi=(DPI, DPI))
    return arr_a.astype(np.float32) / 255.0


def value_noise2(h: int, w: int, cy: int, cx: int, seed: int) -> np.ndarray:
    """Periodic 2D smooth value noise (tileable in both axes)."""
    rng = np.random.default_rng(seed)
    g = rng.random((cy, cx), dtype=np.float32)
    ys = np.arange(h, dtype=np.float32) / h * cy
    xs = np.arange(w, dtype=np.float32) / w * cx
    yi = np.floor(ys).astype(int) % cy
    xi = np.floor(xs).astype(int) % cx
    ty = ys - np.floor(ys)
    tx = xs - np.floor(xs)
    ty = ty * ty * (3.0 - 2.0 * ty)
    tx = tx * tx * (3.0 - 2.0 * tx)
    y1 = (yi + 1) % cy
    x1 = (xi + 1) % cx
    a = g[yi][:, xi] * (1.0 - tx) + g[yi][:, x1] * tx
    b = g[y1][:, xi] * (1.0 - tx) + g[y1][:, x1] * tx
    return a * (1.0 - ty[:, None]) + b * ty[:, None]


def gen_wood_grain() -> np.ndarray:
    """Seamless 128x128 DIP (256x256 px) warm carved oak plank grain with subtle plank seams."""
    n = 128 * PX
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    # Periodic wavy horizontal wood fibers
    warp_lo = value_noise2(n, n, 4, 4, 62801)
    warp_hi = value_noise2(n, n, 12, 6, 62802)
    phase = (y / n) * 2.0 * math.pi * 10.0 + warp_lo * 4.8 + warp_hi * 1.4
    rings = 0.5 + 0.5 * np.sin(phase)
    # Fine horizontal pores stretched along X
    pores = value_noise2(n, n, 48, 8, 62803)
    fine = value_noise2(n, n, 64, 16, 62804)
    # Two subtle horizontal plank seam grooves across the 128-DIP tile
    plank_dist = np.minimum(np.abs(y - n * 0.25), np.abs(y - n * 0.75))
    plank_seam = np.exp(-((plank_dist / 1.6) ** 2)) * 0.36
    # Slight tonal shift between the two planks
    plank_band = np.where((y >= n * 0.25) & (y < n * 0.75), 0.10, 0.0)
    alpha = 0.26 * rings + 0.38 * pores + 0.18 * fine + plank_seam + plank_band
    # Normalize cleanly into [0.05, 0.92]
    alpha = (alpha - alpha.min()) / max(1e-5, alpha.max() - alpha.min())
    return save_mask("wood-grain", 0.08 + 0.84 * alpha, blur=0.4)


def gen_parchment_grain() -> np.ndarray:
    """Seamless 128x128 DIP (256x256 px) fine aged vellum & subtle parchment mottling."""
    n = 128 * PX
    cloud = value_noise2(n, n, 4, 4, 62811)
    mottle = value_noise2(n, n, 10, 10, 62812)
    fiber_h = value_noise2(n, n, 32, 12, 62813)
    fiber_v = value_noise2(n, n, 12, 32, 62814)
    speck = value_noise2(n, n, 64, 64, 62815)
    # Soft mottling + subtle cross-laid paper fibers + light foxing specks
    alpha = 0.34 * cloud + 0.26 * mottle + 0.16 * fiber_h + 0.14 * fiber_v + 0.10 * (speck ** 2)
    alpha = (alpha - alpha.min()) / max(1e-5, alpha.max() - alpha.min())
    return save_mask("parchment-grain", 0.05 + 0.88 * alpha, blur=0.35)


def gen_parchment_sheet() -> np.ndarray:
    """9-slice gently deckled parchment folio sheet: 72x72 DIP (144x144 px), slice 20+32+20 DIP.
    Strictly periodic edge roughness across the 32-DIP middle band so stretching has zero seam.
    """
    d = 72 * PX
    tile_w = 32 * PX
    c0 = 20 * PX
    rng = np.random.default_rng(62821)

    def periodic_edge(length: int, period: int, amps=(1.35, 0.7, 0.32)) -> np.ndarray:
        out = np.zeros(length, dtype=np.float32)
        for amp, freq in zip(amps, (1, 2, 4)):
            ph = rng.random() * 2.0 * math.pi
            t = (np.arange(length, dtype=np.float32) - c0) / period
            out += amp * np.sin(2.0 * math.pi * freq * t + ph)
        return out

    n_top = periodic_edge(d, tile_w)
    n_bot = periodic_edge(d, tile_w)
    n_lft = periodic_edge(d, tile_w)
    n_rgt = periodic_edge(d, tile_w)

    y, x = np.mgrid[0:d, 0:d].astype(np.float32)
    margin = 4.5 * PX
    # Signed distance inside the gently deckled rectangle (positive inside)
    d_top = y - (margin + n_top[x.astype(int)])
    d_bot = (d - 1 - margin + n_bot[x.astype(int)]) - y
    d_lft = x - (margin + n_lft[y.astype(int)])
    d_rgt = (d - 1 - margin + n_rgt[y.astype(int)]) - x

    # Softly beveled corners
    corner_r = 5.0 * PX
    dx_c = np.maximum(0.0, corner_r - np.minimum(d_lft, d_rgt))
    dy_c = np.maximum(0.0, corner_r - np.minimum(d_top, d_bot))
    sd_box = np.minimum(np.minimum(d_top, d_bot), np.minimum(d_lft, d_rgt))
    sd = np.where((dx_c > 0) & (dy_c > 0), corner_r - np.hypot(dx_c, dy_c), sd_box)

    # Smooth crisp anti-aliased deckled edge
    alpha = np.clip(0.5 + sd / (1.3 * PX), 0.0, 1.0)
    return save_mask("parchment-sheet", alpha, blur=0.3)


def gen_glow_frame() -> np.ndarray:
    """9-slice silky outer arcane / playable aura: 128x128 DIP (256x256 px), slice 44+40+44 DIP.
    Matches Wyldcrown/Cogplate 9-slice coordinate conventions (Viewbox 44 / 40 / 44 in DIP).
    """
    d = 128 * PX
    pad = 22 * PX
    r = 10 * PX
    y, x = np.mgrid[0:d, 0:d].astype(np.float32)
    cx = (d - 1) / 2.0
    cy = (d - 1) / 2.0
    hx = (d / 2.0) - pad - r
    hy = (d / 2.0) - pad - r
    qx = np.abs(x - cx) - hx
    qy = np.abs(y - cy) - hy
    # Signed distance to inner rounded rect (0 on perimeter, positive outside, negative inside)
    outside = np.hypot(np.maximum(qx, 0.0), np.maximum(qy, 0.0))
    inside = np.minimum(np.maximum(qx, qy), 0.0)
    sd = outside + inside - r

    # Lush multi-layered outer bloom + soft inner lip kiss
    sd_pos = np.maximum(sd, 0.0)
    outer = np.where(sd >= 0.0, np.exp(-((sd_pos / (7.5 * PX)) ** 1.35)) * 0.92, 0.0)
    wide = np.where(sd >= 0.0, np.exp(-((sd_pos / (14.5 * PX)) ** 1.6)) * 0.42, 0.0)
    inner_rim = np.where(sd < 0.0, np.exp(-((sd / (3.2 * PX)) ** 2.0)) * 0.55, 0.0)
    # Fade smoothly to zero before tile border so no clipping line appears
    edge_dist = np.minimum(np.minimum(x, d - 1 - x), np.minimum(y, d - 1 - y))
    edge_fade = np.clip(edge_dist / (5.0 * PX), 0.0, 1.0)
    alpha = np.clip((outer + wide + inner_rim) * edge_fade, 0.0, 1.0)
    return save_mask("glow-frame", alpha, blur=0.8)


def gen_corner_clasp() -> np.ndarray:
    """40x40 DIP (80x80 px) Hearthstone tavern-box beveled brass corner L-bracket with dome rivet."""
    d = 40 * PX
    ss = 4
    S = PX * ss
    n = d * ss
    img = Image.new("L", (n, n), 0)
    dr = ImageDraw.Draw(img)

    # Outer notched L-bracket silhouette (top-left corner, full 40x40 DIP space)
    poly = [
        (2 * S, 2 * S),
        (33 * S, 2 * S),
        (38 * S, 6.5 * S),
        (32 * S, 11 * S),
        (13.5 * S, 11 * S),
        (11 * S, 13.5 * S),
        (11 * S, 32 * S),
        (6.5 * S, 38 * S),
        (2 * S, 33 * S),
    ]
    dr.polygon(poly, fill=215)

    # Subtle stepped outer highlight bevel along top/left edges
    dr.line([(3 * S, 3 * S), (32 * S, 3 * S)], fill=255, width=2 * S)
    dr.line([(3 * S, 3 * S), (3 * S, 32 * S)], fill=255, width=2 * S)

    # Inner decorative gusset triangle
    dr.polygon([(13.5 * S, 13.5 * S), (20 * S, 13.5 * S), (13.5 * S, 20 * S)], fill=145)

    # Tapered end finials along the bracket arms
    dr.polygon([(31 * S, 4.5 * S), (36.5 * S, 6.5 * S), (31 * S, 8.5 * S)], fill=255)
    dr.polygon([(4.5 * S, 31 * S), (6.5 * S, 36.5 * S), (8.5 * S, 31 * S)], fill=255)

    # Raised round dome rivet at corner junction (dark groove + bright stud)
    rx, ry = 7.8 * S, 7.8 * S
    r_groove = 4.0 * S
    r_stud = 2.6 * S
    dr.ellipse([rx - r_groove, ry - r_groove, rx + r_groove, ry + r_groove], fill=65)
    dr.ellipse([rx - r_stud, ry - r_stud, rx + r_stud, ry + r_stud], fill=255)

    small = img.resize((d, d), Image.Resampling.LANCZOS)
    arr = np.array(small, dtype=np.float32) / 255.0
    return save_mask("corner-clasp", arr)


def gen_hearth_halo() -> np.ndarray:
    """64x64 DIP (128x128 px) centered radial arcane/lantern bloom with subtle compass rays."""
    n = 64 * PX
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    cx = (n - 1) / 2.0
    dx = (x - cx) / cx
    dy = (y - cx) / cx
    r = np.hypot(dx, dy)
    ang = np.arctan2(dy, dx)
    # Smooth radial core + faint 8-point tavern compass shimmer
    core = np.exp(-((r / 0.42) ** 2.0)) * 0.85
    halo = np.exp(-((r / 0.72) ** 2.2)) * 0.40
    rays = (0.5 + 0.5 * np.cos(8.0 * ang)) ** 3.0 * np.exp(-((r / 0.68) ** 2.0)) * 0.22
    fade = np.clip((1.0 - r) / 0.15, 0.0, 1.0)
    alpha = np.clip((core + halo + rays) * fade, 0.0, 1.0)
    return save_mask("hearth-halo", alpha, blur=0.6)


def gen_metal_sheen() -> np.ndarray:
    """64x32 DIP (128x64 px) brushed lantern highlight & top-edge specular sheen for metal/gold plates."""
    w, h = 64 * PX, 32 * PX
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = x / (w - 1)
    v = y / (h - 1)
    # Soft top-down lantern curve (brightest across upper third, centered horizontally)
    vert = np.exp(-((v / 0.38) ** 1.6)) * 0.72
    top_lip = np.exp(-((v / 0.06) ** 2.0)) * 0.95
    horiz = 0.65 + 0.35 * np.sin(u * math.pi)
    brush = 0.86 + 0.14 * value_noise2(h, w, 24, 4, 62831)
    alpha = np.clip((vert + top_lip) * horiz * brush, 0.0, 1.0)
    return save_mask("metal-sheen", alpha, blur=0.4)


def build_contact_sheet(masks: dict, out_path: str):
    """Save a dark-backed visual contact sheet so every sprite can be inspected at 1:1."""
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    cols = 4
    cell = 280
    rows = math.ceil(len(masks) / cols)
    sheet = Image.new("RGB", (cols * cell, rows * cell), (22, 14, 9))
    dr = ImageDraw.Draw(sheet)
    tint_map = {
        "wood-grain": (210, 155, 88),
        "parchment-grain": (235, 217, 180),
        "parchment-sheet": (235, 217, 180),
        "glow-frame": (46, 230, 85),
        "corner-clasp": (239, 195, 66),
        "hearth-halo": (74, 163, 240),
        "metal-sheen": (255, 226, 112),
    }
    for idx, (name, alpha) in enumerate(masks.items()):
        r, c = divmod(idx, cols)
        ox, oy = c * cell, r * cell
        # Subtle cell box
        dr.rectangle([ox + 8, oy + 8, ox + cell - 9, oy + cell - 9], outline=(90, 62, 34))
        rgb = tint_map.get(name, (240, 210, 150))
        h, w = alpha.shape
        scale = min((cell - 56) / w, (cell - 72) / h, 2.0)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        rgba = np.dstack([
            np.full((h, w), rgb[0], dtype=np.uint8),
            np.full((h, w), rgb[1], dtype=np.uint8),
            np.full((h, w), rgb[2], dtype=np.uint8),
            (np.clip(alpha, 0, 1) * 255).astype(np.uint8),
        ])
        im = Image.fromarray(rgba, "RGBA").resize((nw, nh), Image.Resampling.LANCZOS)
        px = ox + (cell - nw) // 2
        py = oy + 36 + (cell - 56 - nh) // 2
        sheet.paste(im, (px, py), im)
        dr.text((ox + 16, oy + 14), f"{name} ({w//PX}x{h//PX} DIP)", fill=(248, 236, 210))
    sheet.save(out_path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheet", default="", help="Optional path for visual verification contact sheet")
    args = ap.parse_args()

    masks = {
        "wood-grain": gen_wood_grain(),
        "parchment-grain": gen_parchment_grain(),
        "parchment-sheet": gen_parchment_sheet(),
        "glow-frame": gen_glow_frame(),
        "corner-clasp": gen_corner_clasp(),
        "hearth-halo": gen_hearth_halo(),
        "metal-sheen": gen_metal_sheen(),
    }
    print(f"Generated {len(masks)} white-mask sprites in {OUT}")
    if args.sheet:
        build_contact_sheet(masks, args.sheet)
        print(f"Wrote contact sheet: {args.sheet}")


if __name__ == "__main__":
    main()
