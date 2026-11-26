#!/usr/bin/env python3
"""Wildhand sprite generator. Deterministic (fixed seed).

Generates white-mask RGBA PNGs (RGB 255, effect in alpha) in src/Images/fx/
at 2 px per DIP (192 dpi) plus a dark-backed contact sheet art/fx-sheet.png.
XAML fills geometry/rectangles with DynamicResource brushes masked by ImageBrush,
so ThemeModifier recolors every texture cleanly.

Run from repo root or theme directory:
    python src/themes/Wildhand/art/sprites.py
"""
import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
THEME = os.path.dirname(HERE)
OUT = os.path.join(THEME, "src", "Images", "fx")
os.makedirs(OUT, exist_ok=True)

PX = 2
SS = 4
S = PX * SS
DPI = 96 * PX


def save_mask(name: str, alpha_01: np.ndarray, blur: float = 0.0):
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
    rng = np.random.default_rng(seed)
    g = rng.random((cy, cx), dtype=np.float32)
    ys = np.arange(h, dtype=np.float32) / h * cy
    xs = np.arange(w, dtype=np.float32) / w * cx
    yi = np.floor(ys).astype(int)
    xi = np.floor(xs).astype(int)
    ty = ys - yi
    tx = xs - xi
    ty = ty * ty * (3.0 - 2.0 * ty)
    tx = tx * tx * (3.0 - 2.0 * tx)
    y1 = (yi + 1) % cy
    x1 = (xi + 1) % cx
    a = g[yi][:, xi] * (1.0 - tx) + g[yi][:, x1] * tx
    b = g[y1][:, xi] * (1.0 - tx) + g[y1][:, x1] * tx
    return a * (1.0 - ty[:, None]) + b * ty[:, None]


def gen_felt_weave():
    """Seamless 128x128 DIP (256x256 px) crisp casino baize felt grain + subtle diagonal weave."""
    n = 128 * PX
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    coarse = value_noise2(n, n, 16, 16, 3101)
    fine = value_noise2(n, n, 64, 64, 3102)
    micro = value_noise2(n, n, 128, 128, 3103)
    swirl = 0.5 + 0.5 * np.sin((x + y) * (2.0 * math.pi / (n / 4.0)) + coarse * 1.2)
    threads = 0.88 + 0.12 * np.sin(x * (math.pi / 2.0)) * np.sin(y * (math.pi / 2.0))
    alpha = np.clip((0.22 + 0.36 * fine + 0.28 * micro + 0.14 * swirl) * threads, 0.0, 0.90)
    return save_mask("felt-weave", alpha)


def gen_felt_vignette():
    """256x256 DIP deep-felt table vignette with calm center and rich corner depth."""
    n = 256 * PX
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    nx = (x - (n - 1) * 0.5) / ((n - 1) * 0.5)
    ny = (y - (n - 1) * 0.5) / ((n - 1) * 0.5)
    r = np.hypot(nx * 0.90, ny * 0.90)
    edge = np.clip((r - 0.34) / 0.92, 0.0, 1.0) ** 1.6
    grain = 0.88 + 0.12 * value_noise2(n, n, 32, 32, 3201)
    return save_mask("felt-vignette", np.clip(edge * grain * 0.88, 0.0, 1.0))


def gen_felt_corner():
    """40x40 DIP (80x80 px) crisp Balatro pixel-stepped table corner bracket + diamond pip."""
    size = 40 * S
    img = Image.new("L", (size, size), 0)
    dr = ImageDraw.Draw(img)
    s = S
    # Crisp stepped L-bracket
    dr.rectangle([4 * s, 4 * s, 26 * s, 6.5 * s], fill=245)
    dr.rectangle([4 * s, 4 * s, 6.5 * s, 26 * s], fill=245)
    # Inner fine accent rule
    dr.rectangle([9 * s, 9 * s, 18 * s, 10.5 * s], fill=165)
    dr.rectangle([9 * s, 9 * s, 10.5 * s, 18 * s], fill=165)
    # Corner diamond pip
    dr.polygon([(5.2 * s, 1.5 * s), (8.9 * s, 5.2 * s), (5.2 * s, 8.9 * s), (1.5 * s, 5.2 * s)], fill=255)
    # End square pips
    dr.rectangle([28.5 * s, 4 * s, 31.5 * s, 7 * s], fill=215)
    dr.rectangle([4 * s, 28.5 * s, 7 * s, 31.5 * s], fill=215)
    out = img.resize((40 * PX, 40 * PX), Image.Resampling.LANCZOS)
    return save_mask("felt-corner", np.array(out, dtype=np.float32) / 255.0)


def gen_card_plate_sheen():
    """128x48 DIP crisp Balatro HUD plate top catchlight, subtle halftone stipple & bottom edge."""
    w, h = 128 * PX, 48 * PX
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    v = y / (h - 1)
    u = np.abs(x - (w - 1) * 0.5) / ((w - 1) * 0.5)
    # Crisp top pixel bevel catchlight + soft upper-third sheen
    top_edge = np.exp(-((v / 0.08) ** 2)) * 0.90
    upper_sheen = np.clip(1.0 - v * 2.1, 0.0, 1.0) ** 1.3 * 0.30
    # Subtle micro-halftone dot grid on upper half
    gx = (x % (4 * PX)) - (2 * PX)
    gy = (y % (4 * PX)) - (2 * PX)
    dots = (np.hypot(gx, gy) < (0.85 * PX)).astype(np.float32) * np.clip(1.0 - v * 1.4, 0.0, 1.0) * 0.14
    horiz = np.clip(1.0 - (u ** 4.0) * 0.45, 0.0, 1.0)
    alpha = np.clip((top_edge + upper_sheen + dots) * horiz, 0.0, 1.0)
    return save_mask("card-plate-sheen", alpha)


def gen_card_suit_tile():
    """Seamless 96x96 DIP (192x192 px) subtle 4-suit poker watermark tile for slate panels & active plates."""
    n = 96 * PX
    ss = 2
    cw = n * ss
    img = Image.new("L", (cw, cw), 0)
    dr = ImageDraw.Draw(img)

    def draw_diamond(cx, cy, r):
        dr.polygon([(cx, cy - r), (cx + r * 0.78, cy), (cx, cy + r), (cx - r * 0.78, cy)], fill=210)

    def draw_club(cx, cy, r):
        cr = r * 0.36
        dr.ellipse([cx - cr, cy - r * 0.72 - cr, cx + cr, cy - r * 0.72 + cr], fill=195)
        dr.ellipse([cx - r * 0.48 - cr, cy + r * 0.05 - cr, cx - r * 0.48 + cr, cy + r * 0.05 + cr], fill=195)
        dr.ellipse([cx + r * 0.48 - cr, cy + r * 0.05 - cr, cx + r * 0.48 + cr, cy + r * 0.05 + cr], fill=195)
        dr.polygon([(cx, cy), (cx + r * 0.25, cy + r * 0.82), (cx - r * 0.25, cy + r * 0.82)], fill=195)

    def draw_heart(cx, cy, r):
        cr = r * 0.38
        dr.ellipse([cx - r * 0.36 - cr, cy - r * 0.35 - cr, cx - r * 0.36 + cr, cy - r * 0.35 + cr], fill=195)
        dr.ellipse([cx + r * 0.36 - cr, cy - r * 0.35 - cr, cx + r * 0.36 + cr, cy - r * 0.35 + cr], fill=195)
        dr.polygon([(cx - r * 0.74, cy - r * 0.18), (cx + r * 0.74, cy - r * 0.18), (cx, cy + r * 0.82)], fill=195)

    def draw_spade(cx, cy, r):
        dr.polygon([(cx, cy - r * 0.85), (cx + r * 0.72, cy + r * 0.05), (cx - r * 0.72, cy + r * 0.05)], fill=205)
        cr = r * 0.35
        dr.ellipse([cx - r * 0.35 - cr, cy + r * 0.05 - cr, cx - r * 0.35 + cr, cy + r * 0.05 + cr], fill=205)
        dr.ellipse([cx + r * 0.35 - cr, cy + r * 0.05 - cr, cx + r * 0.35 + cr, cy + r * 0.05 + cr], fill=205)
        dr.polygon([(cx, cy + r * 0.12), (cx + r * 0.24, cy + r * 0.85), (cx - r * 0.24, cy + r * 0.85)], fill=205)

    q = cw // 4
    r = 16 * ss
    draw_spade(q, q, r)
    draw_heart(3 * q, q, r)
    draw_diamond(q, 3 * q, r)
    draw_club(3 * q, 3 * q, r)

    out = img.resize((n, n), Image.Resampling.LANCZOS)
    return save_mask("card-suit-tile", np.array(out, dtype=np.float32) / 255.0)


def build_contact_sheet(sprites):
    cols = 3
    tile_w, tile_h = 340, 210
    rows = (len(sprites) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tile_w + 24, rows * tile_h + 24), (23, 54, 41))
    dr = ImageDraw.Draw(sheet)
    for idx, (name, arr) in enumerate(sprites):
        r, c = divmod(idx, cols)
        x0, y0 = 12 + c * tile_w, 12 + r * tile_h
        dr.rectangle([x0 + 4, y0 + 4, x0 + tile_w - 8, y0 + tile_h - 8], outline=(82, 102, 105), fill=(33, 74, 57))
        tint = (255, 162, 0) if "corner" in name or "suit" in name else (245, 245, 245)
        rgba = np.dstack([
            np.full(arr.shape, tint[0], dtype=np.uint8),
            np.full(arr.shape, tint[1], dtype=np.uint8),
            np.full(arr.shape, tint[2], dtype=np.uint8),
            np.clip(arr * 255.0, 0, 255).astype(np.uint8),
        ])
        spr = Image.fromarray(rgba, "RGBA")
        spr.thumbnail((tile_w - 24, tile_h - 42), Image.Resampling.LANCZOS)
        px = x0 + (tile_w - spr.width) // 2
        py = y0 + 26 + (tile_h - 36 - spr.height) // 2
        sheet.paste(spr, (px, py), spr)
        dr.text((x0 + 12, y0 + 8), f"{name}.png ({arr.shape[1]}x{arr.shape[0]}px)", fill=(245, 245, 245))

    sheet_path = os.path.join(HERE, "fx-sheet.png")
    sheet.save(sheet_path)
    print(f"Wrote {len(sprites)} sprites to {OUT} and sheet to {sheet_path}")


if __name__ == "__main__":
    items = [
        ("felt-weave", gen_felt_weave()),
        ("felt-vignette", gen_felt_vignette()),
        ("felt-corner", gen_felt_corner()),
        ("card-plate-sheen", gen_card_plate_sheen()),
        ("card-suit-tile", gen_card_suit_tile()),
    ]
    build_contact_sheet(items)
