#!/usr/bin/env python3
"""Wyldcrown sprite generator. Deterministic (fixed seed).

Generates white-mask RGBA PNGs (RGB 255, effect in alpha) in src/Images/fx/
at 2 px per DIP (192 dpi) plus a dark-backed contact sheet art/fx-sheet.png.
XAML fills geometry/rectangles with DynamicResource brushes masked by ImageBrush,
and HTML previews apply the same files with CSS -webkit-mask / -webkit-mask-box-image,
so ThemeModifier recolors every ornament seamlessly.

Run from repo root or theme directory:
    python src/themes/Wyldcrown/art/sprites.py
"""
import math
import os
import random
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


def gen_damask_tile():
    """Seamless 128x128 DIP (256x256 px) fleur-de-lis & diamond lattice damask."""
    w = h = 128 * PX
    ss = 4
    cw, ch = w * ss, h * ss
    img = Image.new("L", (cw, ch), 0)
    dr = ImageDraw.Draw(img)

    def draw_fleur(cx, cy, sc):
        # Stylized centered fleur-de-lis / crown motif inside each lattice cell
        petal_c = [
            (cx, cy - 28 * sc),
            (cx + 8 * sc, cy - 10 * sc),
            (cx + 5 * sc, cy + 4 * sc),
            (cx, cy + 8 * sc),
            (cx - 5 * sc, cy + 4 * sc),
            (cx - 8 * sc, cy - 10 * sc),
        ]
        dr.polygon(petal_c, fill=225)
        for sign in (-1, 1):
            wing = [
                (cx + sign * 5 * sc, cy + 2 * sc),
                (cx + sign * 18 * sc, cy - 14 * sc),
                (cx + sign * 24 * sc, cy - 6 * sc),
                (cx + sign * 17 * sc, cy + 8 * sc),
                (cx + sign * 7 * sc, cy + 6 * sc),
            ]
            dr.polygon(wing, fill=200)
        # Base band + diamond tail
        dr.rectangle([cx - 12 * sc, cy + 6 * sc, cx + 12 * sc, cy + 11 * sc], fill=245)
        dr.polygon([(cx, cy + 11 * sc), (cx + 7 * sc, cy + 22 * sc), (cx, cy + 30 * sc), (cx - 7 * sc, cy + 22 * sc)], fill=185)

    # Diagonal lattice lines spanning tiled period
    half = cw // 2
    for ox in (-half, 0, half, cw, cw + half):
        for oy in (-half, 0, half, ch, ch + half):
            dr.line([(ox, oy - half), (ox + half, oy)], fill=90, width=int(1.2 * ss * PX))
            dr.line([(ox + half, oy), (ox, oy + half)], fill=90, width=int(1.2 * ss * PX))

    # Place fleur-de-lis motifs at half-tile staggered centers (wrapping symmetrically)
    centers = [(half, half)]
    for x in (0, cw):
        for y in (0, ch):
            centers.append((x, y))
    for cx, cy in centers:
        draw_fleur(cx, cy, sc=2.0 * (ss / 2.0))

    small = img.resize((w, h), Image.Resampling.LANCZOS)
    arr = np.array(small, dtype=np.float32) / 255.0
    # Subtle damask silk grain
    grain = 0.88 + 0.12 * value_noise2(h, w, 16, 16, 2015)
    return save_mask("damask-tile", arr * grain)


def gen_sapphire_quilt():
    """Seamless 64x64 DIP (128x128 px) crisp beveled cushion diamond quilt (armello-wyld-chest/dlc sapphire CTA)."""
    n = 64 * PX
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    cell = n / 2.0
    u = ((x + y) / cell) % 1.0 - 0.5
    v = ((x - y) / cell) % 1.0 - 0.5
    du = np.abs(u) * 2.0
    dv = np.abs(v) * 2.0
    d_edge = 1.0 - np.maximum(du, dv)
    # Crisp beveled pillow dome + sharp seam groove + bright diamond stud
    cushion = np.clip(d_edge * 1.5, 0.0, 1.0) ** 0.50
    grooves = 1.0 - np.exp(-((d_edge * 10.5) ** 2))
    stud_d = np.abs(u) + np.abs(v)
    stud = np.clip(1.0 - stud_d * 5.2, 0.0, 1.0) * 0.52
    alpha = np.clip(0.24 + 0.52 * cushion * grooves + stud, 0.12, 0.98)
    return save_mask("sapphire-quilt", alpha)


def gen_plate_torn():
    """9-slice deckled parchment folio sheet: 72x72 DIP (144x144 px), slice 20+32+20 DIP.
    Edge roughness is strictly periodic along the 32-DIP inner tile band so stretching has zero seam.
    """
    d = 72 * PX
    tile_w = 32 * PX
    c0 = 20 * PX
    c1 = d - c0

    rng_h = np.random.default_rng(7701)
    def periodic_edge(length, period, amps=(1.2, 0.65, 0.3)):
        freqs = (1, 2, 4)
        out = np.zeros(length, dtype=np.float32)
        for amp, freq in zip(amps, freqs):
            ph = rng_h.random() * 2 * math.pi
            t = (np.arange(length, dtype=np.float32) - c0) / period
            out += amp * np.sin(2 * math.pi * freq * t + ph)
        return out

    n_top = periodic_edge(d, tile_w)
    n_bot = periodic_edge(d, tile_w)
    n_left = periodic_edge(d, tile_w, (1.45, 0.75, 0.35))
    n_right = periodic_edge(d, tile_w, (1.35, 0.7, 0.35))

    y, x = np.mgrid[0:d, 0:d].astype(np.float32)
    pad = 2.8
    dist_top = y - (pad + n_top[None, :])
    dist_bot = (d - 1 - pad + n_bot[None, :]) - y
    dist_left = x - (pad + n_left[:, None])
    dist_right = (d - 1 - pad + n_right[:, None]) - x

    sdf = np.minimum(np.minimum(dist_top, dist_bot), np.minimum(dist_left, dist_right))
    mask = np.clip(0.5 + sdf * 0.9, 0.0, 1.0)
    fiber = 0.97 + 0.03 * value_noise2(d, d, 18, 18, 9912)
    return save_mask("plate-torn", mask * fiber)


def gen_filigree_corner():
    """40x40 DIP (80x80 px) gothic heraldic corner filigree + corner diamond stud (top-left orientation)."""
    size = 40 * S
    img = Image.new("L", (size, size), 0)
    dr = ImageDraw.Draw(img)
    s = S
    # Crisp corner L-bracket with stepped filigree notch & corner diamond
    dr.polygon([(4*s, 4*s), (28*s, 4*s), (26*s, 6.2*s), (6.2*s, 6.2*s), (6.2*s, 26*s), (4*s, 28*s)], fill=255)
    # Inner fine accent rule
    dr.line([(9*s, 9*s), (21*s, 9*s)], fill=175, width=int(1.2*s))
    dr.line([(9*s, 9*s), (9*s, 21*s)], fill=175, width=int(1.2*s))
    # Corner rotated jewel diamond
    dr.polygon([(5*s, 1.2*s), (8.8*s, 5*s), (5*s, 8.8*s), (1.2*s, 5*s)], fill=255)
    # Small diamond studs on arm ends
    dr.polygon([(30*s, 4*s), (32.5*s, 6.2*s), (30*s, 8.4*s), (27.5*s, 6.2*s)], fill=220)
    dr.polygon([(4*s, 30*s), (6.2*s, 32.5*s), (8.4*s, 30*s), (6.2*s, 27.5*s)], fill=220)
    # Inner scroll flourish arc (3-dot heraldic cluster inside corner)
    dr.arc([10*s, 10*s, 24*s, 24*s], start=180, end=270, fill=200, width=int(1.3*s))
    dr.ellipse([11.5*s, 11.5*s, 14.5*s, 14.5*s], fill=235)
    out = img.resize((40 * PX, 40 * PX), Image.Resampling.LANCZOS)
    return save_mask("filigree-corner", np.array(out, dtype=np.float32) / 255.0)


def gen_glow_frame():
    """9-slice soft outer bloom frame: 128x128 DIP (256x256 px), pad 44 DIP (44+40+44)."""
    n = 128 * PX
    pad = 44 * PX
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    dx = np.maximum(np.maximum(pad - x, x - (n - 1 - pad)), 0.0)
    dy = np.maximum(np.maximum(pad - y, y - (n - 1 - pad)), 0.0)
    d = np.hypot(dx, dy) / pad
    falloff = np.clip(1.0 - d, 0.0, 1.0) ** 2.1
    return save_mask("glow-frame", falloff * 0.92)


def gen_bloom():
    """256x128 DIP soft elliptical solar crown glow for Play & Empty state."""
    w, h = 256 * PX, 128 * PX
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (x - w * 0.5) / (w * 0.5)
    ny = (y - h * 0.5) / (h * 0.5)
    r = np.hypot(nx, ny)
    a = np.clip(1.0 - r, 0.0, 1.0) ** 2.0
    return save_mask("bloom", a * 0.85)


def gen_diamond_seam():
    """512x12 DIP horizontal tapered filigree rule with bright center diamond finial."""
    w, h = 512 * PX, 12 * PX
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = np.abs(x - w * 0.5) / (w * 0.5)
    horiz = np.clip(1.0 - nx ** 1.4, 0.0, 1.0)
    dy = np.abs(y - h * 0.5)
    line = np.clip(1.0 - dy / (1.3 * PX), 0.0, 1.0) * 0.95
    halo = np.exp(-((dy / (2.8 * PX)) ** 2)) * 0.35
    # Center diamond node
    cdx = np.abs(x - w * 0.5) / (5.5 * PX)
    cdy = np.abs(y - h * 0.5) / (5.0 * PX)
    diamond = np.clip(1.0 - (cdx + cdy), 0.0, 1.0) * 3.0
    a = np.clip((line + halo) * horiz + diamond, 0.0, 1.0)
    return save_mask("diamond-seam", a)


def gen_checker_frieze():
    """48x12 DIP seamless medieval architectural checkerboard tapestry trim."""
    w, h = 48 * PX, 12 * PX
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    cell = 6 * PX
    ix = (x // cell).astype(int)
    iy = (y // cell).astype(int)
    chk = ((ix + iy) % 2 == 0).astype(np.float32) * 0.72 + 0.14
    # Fine top and bottom rules
    edge = ((y < 1.5 * PX) | (y >= h - 1.5 * PX)).astype(np.float32)
    a = np.maximum(chk, edge * 0.85)
    return save_mask("checker-frieze", a)


def gen_wyld_star():
    """24x24 DIP sharp 4-point star spark + tiny halo for Running/Empty indicators."""
    n = 24 * PX
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    cx = cy = (n - 1) * 0.5
    dx = np.abs(x - cx) / (n * 0.45)
    dy = np.abs(y - cy) / (n * 0.45)
    star = np.clip(1.0 - (np.sqrt(dx + 1e-4) + np.sqrt(dy + 1e-4)), 0.0, 1.0) * 2.2
    core = np.exp(-((dx ** 2 + dy ** 2) * 14.0))
    return save_mask("wyld-star", np.clip(star + core * 0.85, 0.0, 1.0))


def gen_spirit_sweep():
    """128x48 DIP comet-tailed luminous band sweep for Launching / Sheen."""
    w, h = 128 * PX, 48 * PX
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = x / (w - 1)
    # Bright leading edge around u = 0.78 tapering behind
    head = np.exp(-(((u - 0.78) / 0.09) ** 2))
    tail = np.where(u <= 0.78, np.exp(-((np.maximum(0.78 - u, 0.0) / 0.34) ** 1.4)), np.exp(-(((u - 0.78) / 0.05) ** 2)))
    v = np.maximum(np.sin(np.pi * np.clip(y / (h - 1), 0.0, 1.0)), 0.0) ** 0.45
    return save_mask("spirit-sweep", np.clip((head * 0.6 + tail * 0.75) * v, 0.0, 1.0))


def gen_tapestry_vignette():
    """256x256 DIP radial corner tapestry wash & subtle weave for sparse page backgrounds."""
    n = 256 * PX
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    nx = (x - (n - 1) * 0.5) / ((n - 1) * 0.5)
    ny = (y - (n - 1) * 0.5) / ((n - 1) * 0.5)
    r = np.hypot(nx * 0.92, ny * 0.92)
    # Clear calm center for reading, atmospheric indigo wash toward edges & corners
    edge_wash = np.clip((r - 0.32) / 0.95, 0.0, 1.0) ** 1.55
    weave = 0.86 + 0.14 * value_noise2(n, n, 24, 24, 4401)
    # Subtle fine crosshatch tapestry threads
    threads = 0.92 + 0.08 * np.sin((x + y) * 0.45) * np.sin((x - y) * 0.45)
    return save_mask("tapestry-vignette", np.clip(edge_wash * weave * threads * 0.85, 0.0, 1.0))


def gen_parchment_grain():
    """128x128 DIP seamless aged vellum/parchment fiber grain + faint diamond watermark."""
    n = 128 * PX
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    coarse = value_noise2(n, n, 8, 8, 5501)
    medium = value_noise2(n, n, 20, 20, 5502)
    fine = value_noise2(n, n, 48, 48, 5503)
    mottle = 0.48 * coarse + 0.32 * medium + 0.20 * fine
    # Faint watermarked diamond lattice lines
    cell = n / 2.0
    u = np.abs(((x + y) / cell) % 1.0 - 0.5) * 2.0
    v = np.abs(((x - y) / cell) % 1.0 - 0.5) * 2.0
    lattice = np.exp(-(((1.0 - np.maximum(u, v)) * 18.0) ** 2)) * 0.22
    alpha = np.clip(0.18 + 0.52 * mottle + lattice, 0.0, 0.92)
    return save_mask("parchment-grain", alpha)


def gen_button_bevel_sheen():
    """128x48 DIP faceted heraldic metallic bevel highlight + center diamond glint."""
    w, h = 128 * PX, 48 * PX
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    v = y / (h - 1)
    u = np.abs(x - (w - 1) * 0.5) / ((w - 1) * 0.5)
    # Crisp top bevel catchlight + soft upper-half specular sheen
    top_edge = np.exp(-((v / 0.09) ** 2)) * 0.85
    upper_sheen = np.clip(1.0 - v * 1.65, 0.0, 1.0) ** 1.4 * 0.38
    # Subtle bottom reflected bounce
    bot_edge = np.exp(-(((1.0 - v) / 0.08) ** 2)) * 0.28
    # Center horizontal crown glint
    center_glint = np.exp(-((u / 0.42) ** 2)) * np.exp(-(((v - 0.14) / 0.12) ** 2)) * 0.32
    horiz_fade = np.clip(1.0 - (u ** 3.2) * 0.65, 0.0, 1.0)
    alpha = np.clip((top_edge + upper_sheen + bot_edge + center_glint) * horiz_fade, 0.0, 1.0)
    return save_mask("button-bevel-sheen", alpha)


def gen_crest_divider():
    """512x20 DIP heraldic section divider with centered crowned diamond medallion & side pips."""
    w, h = 512 * PX, 20 * PX
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    cx = (w - 1) * 0.5
    cy = (h - 1) * 0.5
    nx = np.abs(x - cx) / (w * 0.5)
    dy = np.abs(y - cy)

    horiz = np.clip(1.0 - nx ** 1.35, 0.0, 1.0)
    line = np.clip(1.0 - dy / (1.1 * PX), 0.0, 1.0) * 0.88
    # Double hairline near center
    double_line = np.clip(1.0 - np.abs(dy - 3.2 * PX) / (0.85 * PX), 0.0, 1.0) * np.clip(1.0 - nx * 2.4, 0.0, 1.0) * 0.55

    # Center diamond medallion
    cdx = np.abs(x - cx) / (8.0 * PX)
    cdy = np.abs(y - cy) / (7.5 * PX)
    outer_d = np.clip(1.0 - (cdx + cdy), 0.0, 1.0) * 3.0
    inner_d = np.clip(1.0 - (cdx * 1.8 + cdy * 1.8), 0.0, 1.0) * 3.0
    medallion = np.clip(outer_d * 0.7 + inner_d * 0.5, 0.0, 1.0)

    # Flanking diamond pips at +-28 DIP
    pips = np.zeros_like(line)
    for off in (-28 * PX, 28 * PX):
        pdx = np.abs(x - (cx + off)) / (3.8 * PX)
        pdy = np.abs(y - cy) / (3.8 * PX)
        pips = np.maximum(pips, np.clip(1.0 - (pdx + pdy), 0.0, 1.0) * 2.5)

    a = np.clip((line + double_line) * horiz + medallion + pips, 0.0, 1.0)
    return save_mask("crest-divider", a)


def build_contact_sheet(sprites):
    cols = 3
    tile_w, tile_h = 340, 210
    rows = (len(sprites) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tile_w + 24, rows * tile_h + 24), (14, 16, 23))
    dr = ImageDraw.Draw(sheet)
    for idx, (name, arr) in enumerate(sprites):
        r, c = divmod(idx, cols)
        x0, y0 = 12 + c * tile_w, 12 + r * tile_h
        dr.rectangle([x0 + 4, y0 + 4, x0 + tile_w - 8, y0 + tile_h - 8], outline=(60, 52, 34), fill=(19, 21, 29))
        # Tint gold/cyan cleanly just on the preview contact sheet
        tint = (94, 227, 255) if "glow" in name or "spirit" in name else ((103, 240, 140) if "wyld" in name else (218, 186, 98))
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
        dr.text((x0 + 12, y0 + 8), f"{name}.png ({arr.shape[1]}x{arr.shape[0]}px)", fill=(244, 237, 214))

    sheet_path = os.path.join(HERE, "fx-sheet.png")
    sheet.save(sheet_path)
    print(f"Wrote {len(sprites)} sprites to {OUT} and sheet to {sheet_path}")


if __name__ == "__main__":
    items = [
        ("damask-tile", gen_damask_tile()),
        ("sapphire-quilt", gen_sapphire_quilt()),
        ("plate-torn", gen_plate_torn()),
        ("filigree-corner", gen_filigree_corner()),
        ("glow-frame", gen_glow_frame()),
        ("bloom", gen_bloom()),
        ("diamond-seam", gen_diamond_seam()),
        ("checker-frieze", gen_checker_frieze()),
        ("wyld-star", gen_wyld_star()),
        ("spirit-sweep", gen_spirit_sweep()),
        ("tapestry-vignette", gen_tapestry_vignette()),
        ("parchment-grain", gen_parchment_grain()),
        ("button-bevel-sheen", gen_button_bevel_sheen()),
        ("crest-divider", gen_crest_divider()),
    ]
    build_contact_sheet(items)
