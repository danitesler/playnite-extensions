"""
Umbralune — Deterministic Procedural White-Mask FX & Texture Generator
Generates pure-white (255, 255, 255) RGBA alpha-mask PNGs into src/Images/fx/
so both HTML previews (-webkit-mask) and WPF XAML (OpacityMask) tint them dynamically.
"""

import math
import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 2014  # Bayonetta 2 release year
OUT_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "src", "Images", "fx"))
os.makedirs(OUT_DIR, exist_ok=True)


def save_white_mask(alpha_arr: np.ndarray, filename: str) -> Image.Image:
    a = np.clip(alpha_arr, 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, 0] = 255
    rgba[:, :, 1] = 255
    rgba[:, :, 2] = 255
    rgba[:, :, 3] = a
    img = Image.fromarray(rgba, mode="RGBA")
    img.save(os.path.join(OUT_DIR, filename), "PNG", optimize=True)
    return img


def fbm_noise(h: int, w: int, rng: np.random.Generator, octaves=(8, 16, 32, 64)) -> np.ndarray:
    acc = np.zeros((h, w), dtype=np.float32)
    weight = 0.55
    total_w = 0.0
    for grid in octaves:
        gh = max(2, h // grid)
        gw = max(2, w // grid)
        base = rng.random((gh, gw), dtype=np.float32)
        pil = Image.fromarray((base * 255).astype(np.uint8), mode="L").resize(
            (w, h), resample=Image.Resampling.BICUBIC
        )
        acc += (np.array(pil, dtype=np.float32) / 255.0) * weight
        total_w += weight
        weight *= 0.52
    acc /= max(total_w, 1e-6)
    return acc


def make_watch_watermark() -> Image.Image:
    """512x512 Umbran Crescent Watch dial watermark (Title & Options backdrop)."""
    S = 512
    img = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(img)
    cx, cy = S // 2, S // 2

    # Outer concentric watch rings
    for r, w, col in [
        (236, 3, 210),
        (228, 1, 130),
        (198, 2, 185),
        (192, 1, 110),
        (134, 2, 145),
        (82, 1, 120),
    ]:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=col, width=w)

    # Bold offset crescent moon arc on the left/lower-left
    cres = Image.new("L", (S, S), 0)
    cd = ImageDraw.Draw(cres)
    cd.ellipse((cx - 216, cy - 216, cx + 216, cy + 216), fill=235)
    cd.ellipse((cx - 148, cy - 230, cx + 250, cy + 168), fill=0)
    # Soften slightly and composite
    img = Image.fromarray(np.maximum(np.array(img), np.array(cres)), mode="L")
    d = ImageDraw.Draw(img)

    # 12 Roman-style watch radial ticks + 36 fine sub-ticks between r=198 and r=228
    for i in range(36):
        ang = math.radians(i * 10 - 90)
        is_major = (i % 3 == 0)
        r0 = 198 if is_major else 210
        r1 = 228 if is_major else 222
        x0, y0 = cx + math.cos(ang) * r0, cy + math.sin(ang) * r0
        x1, y1 = cx + math.cos(ang) * r1, cy + math.sin(ang) * r1
        d.line((x0, y0, x1, y1), fill=220 if is_major else 120, width=3 if is_major else 1)
        if is_major:
            # Tiny diamond pip at major clock positions
            rm = 213
            mx, my = cx + math.cos(ang) * rm, cy + math.sin(ang) * rm
            dr = 4.5
            pts = [(mx, my - dr), (mx + dr, my), (mx, my + dr), (mx - dr, my)]
            d.polygon(pts, fill=230)

    # Geometric Umbran 8-point star / diamond lattice (Chapter Select & Options motif)
    for rot in (0, 45):
        pts = []
        for k in range(4):
            a = math.radians(rot + k * 90)
            pts.append((cx + math.cos(a) * 190, cy + math.sin(a) * 190))
        d.polygon(pts, outline=150, width=2)

    # Fine vertical needle & central 4-point star
    d.line((cx, cy - 238, cx, cy + 238), fill=150, width=2)
    d.line((cx - 170, cy, cx + 170, cy), fill=115, width=1)
    star = [
        (cx, cy - 42), (cx + 10, cy - 10), (cx + 42, cy), (cx + 10, cy + 10),
        (cx, cy + 42), (cx - 10, cy + 10), (cx - 42, cy), (cx - 10, cy - 10),
    ]
    d.polygon(star, fill=215)

    # Subtle radial falloff so edges breathe cleanly
    arr = np.array(img.filter(ImageFilter.GaussianBlur(radius=0.6)), dtype=np.float32)
    yy, xx = np.mgrid[0:S, 0:S]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (S * 0.5)
    fade = np.clip(1.0 - np.maximum(0.0, dist - 0.88) / 0.12, 0.0, 1.0)
    return save_white_mask(arr * fade, "watch-watermark.png")


def make_nebula_smoke(rng: np.random.Generator) -> Image.Image:
    """512x256 nocturnal sapphire astral mist + crisp starlight dust motes."""
    W, H = 512, 256
    n1 = fbm_noise(H, W, rng, octaves=(12, 24, 48, 96))
    n2 = fbm_noise(H, W, rng, octaves=(6, 14, 32))
    cloud = np.clip((n1 * 0.72 + n2 * 0.28 - 0.34) * 2.1, 0.0, 1.0) ** 1.35

    # Smooth feathering to edges so tiled/stretched overlays never show hard seams
    yy, xx = np.mgrid[0:H, 0:W]
    fx = np.sin(np.pi * (xx / (W - 1))) ** 0.55
    fy = np.sin(np.pi * (yy / (H - 1))) ** 0.55
    alpha = cloud * fx * fy * 215.0

    # Add 44 crisp tiny starlight pinpoints & 8 tiny diamond glints
    stars = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(stars)
    for _ in range(44):
        sx = int(rng.integers(12, W - 12))
        sy = int(rng.integers(10, H - 10))
        sr = float(rng.uniform(0.6, 1.6))
        br = int(rng.integers(140, 250))
        sd.ellipse((sx - sr, sy - sr, sx + sr, sy + sr), fill=br)
    for _ in range(8):
        sx = int(rng.integers(20, W - 20))
        sy = int(rng.integers(16, H - 16))
        sd.line((sx - 3, sy, sx + 3, sy), fill=235, width=1)
        sd.line((sx, sy - 3, sx, sy + 3), fill=235, width=1)

    alpha = np.maximum(alpha, np.array(stars, dtype=np.float32))
    return save_white_mask(alpha, "nebula-smoke.png")


def make_rune_band(rng: np.random.Generator) -> Image.Image:
    """320x48 horizontally feathered OPTIONS / HARD band etched with Enochian-style micro-glyphs."""
    W, H = 320, 48
    yy, xx = np.mgrid[0:H, 0:W]
    xn = xx / (W - 1)
    yn = (yy - (H - 1) / 2.0) / ((H - 1) / 2.0)

    # Soft horizontal feathered beam + gentle vertical core luminance
    h_env = np.clip(np.sin(np.pi * xn) ** 0.48, 0.0, 1.0)
    # Slightly stronger left-center weighting like Bayonetta 2's Sound row
    h_bias = 0.72 + 0.28 * np.exp(-((xn - 0.32) / 0.35) ** 2)
    v_env = np.clip(1.0 - (np.abs(yn) ** 2.6), 0.0, 1.0)
    base = (h_env * h_bias * v_env) * 165.0

    # Faint subtle noise grain in the mist
    mist = fbm_noise(H, W, rng, octaves=(4, 8, 16))
    base = base * (0.78 + 0.34 * mist)

    # Top & bottom glowing razor hairlines inside the band
    edge_line = (np.exp(-((np.abs(yn) - 0.86) / 0.06) ** 2)) * h_env * 135.0
    base = np.maximum(base, edge_line)

    # 3 micro-rows of stylized geometric angular Enochian/Umbran glyphs
    glyphs = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(glyphs)
    for row_y in (9, 24, 39):
        x = 12
        while x < W - 14:
            # Draw a tiny angular rune (3-5px glyph)
            gw = int(rng.integers(4, 7))
            gh = 5
            top = row_y - gh // 2
            bot = row_y + gh // 2
            kind = int(rng.integers(0, 6))
            col = int(rng.integers(145, 245))
            if kind == 0:
                gd.line((x, bot, x + gw // 2, top, x + gw, bot), fill=col, width=1)
                gd.line((x + 1, row_y, x + gw - 1, row_y), fill=col, width=1)
            elif kind == 1:
                gd.line((x + gw // 2, top, x + gw // 2, bot), fill=col, width=1)
                gd.line((x, top + 1, x + gw, top + 1), fill=col, width=1)
                gd.point((x + gw - 1, bot), fill=col)
            elif kind == 2:
                gd.polygon([(x + gw // 2, top), (x + gw, row_y), (x + gw // 2, bot), (x, row_y)], outline=col)
            elif kind == 3:
                gd.line((x, top, x + gw, bot), fill=col, width=1)
                gd.line((x, bot, x + gw // 2, top), fill=col, width=1)
            elif kind == 4:
                gd.arc((x, top, x + gw, bot), start=200, end=30, fill=col, width=1)
                gd.line((x + gw // 2, top, x + gw // 2, bot), fill=col, width=1)
            else:
                gd.line((x, top, x + gw, top, x, bot, x + gw, bot), fill=col, width=1)
            x += gw + int(rng.integers(3, 6))

    g_arr = np.array(glyphs, dtype=np.float32) * (h_env ** 0.85) * 0.72
    out = np.clip(base + g_arr, 0, 255)
    return save_white_mask(out, "rune-band.png")


def make_flare_beam(rng: np.random.Generator) -> Image.Image:
    """256x32 razor-sharp optical lens-star horizon flare (OPTIONS header & Play hover)."""
    W, H = 256, 32
    yy, xx = np.mgrid[0:H, 0:W]
    xn = xx / (W - 1)
    yn = (yy - (H - 1) / 2.0) / ((H - 1) / 2.0)

    # Sharp razor horizontal beam centered vertically, brightest around x=0.30
    core_x = 0.30
    horiz_env = np.exp(-((xn - core_x) / 0.34) ** 2) * 0.75 + np.sin(np.pi * xn) * 0.25
    horiz_env *= np.clip(np.sin(np.pi * xn) ** 0.35, 0.0, 1.0)
    thin_beam = np.exp(-((yn / 0.11) ** 2)) * horiz_env * 255.0
    wide_halo = np.exp(-((yn / 0.52) ** 2)) * np.exp(-((xn - core_x) / 0.28) ** 2) * 140.0

    # Vertical star-spike at the flare core
    v_spike = np.exp(-((xn - core_x) / 0.022) ** 2) * np.exp(-((yn / 0.78) ** 2)) * 225.0
    # Secondary smaller diamond twinkle on right
    v_spike2 = np.exp(-((xn - 0.72) / 0.014) ** 2) * np.exp(-((yn / 0.42) ** 2)) * 130.0

    alpha = np.maximum.reduce([thin_beam, wide_halo, v_spike, v_spike2])

    # Tiny sparkling dust motes near the flare
    motes = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(motes)
    for _ in range(14):
        mx = int(rng.normal(W * core_x, W * 0.18))
        my = int(rng.normal(H * 0.5, H * 0.26))
        if 4 <= mx < W - 4 and 3 <= my < H - 3:
            md.ellipse((mx - 1, my - 1, mx + 1, my + 1), fill=int(rng.integers(170, 255)))
    alpha = np.maximum(alpha, np.array(motes, dtype=np.float32))
    return save_white_mask(alpha, "flare-beam.png")


def make_filigree_border() -> Image.Image:
    """48x256 tileable vertical baroque gold lace strip (Codex & Tarot card edge)."""
    W, H = 48, 256
    img = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(img)

    # Outer double vertical rails
    d.line((4, 0, 4, H), fill=175, width=2)
    d.line((9, 0, 9, H), fill=110, width=1)
    d.line((W - 5, 0, W - 5, H), fill=175, width=2)
    d.line((W - 10, 0, W - 10, H), fill=110, width=1)

    # Repeating baroque diamond-and-scroll medallions every 32px
    cx = W // 2
    for y0 in range(0, H, 32):
        cy = y0 + 16
        # Faceted diamond medallion
        d.polygon([(cx, cy - 11), (cx + 10, cy), (cx, cy + 11), (cx - 10, cy)], outline=225, width=2)
        d.polygon([(cx, cy - 5), (cx + 5, cy), (cx, cy + 5), (cx - 5, cy)], fill=200)
        # Scroll brackets connecting top & bottom
        d.arc((cx - 11, y0 - 6, cx + 11, y0 + 10), start=15, end=165, fill=180, width=1)
        d.arc((cx - 11, y0 + 22, cx + 11, y0 + 38), start=195, end=345, fill=180, width=1)
        # Side bead pips
        d.ellipse((11, cy - 2, 15, cy + 2), fill=195)
        d.ellipse((W - 15, cy - 2, W - 11, cy + 2), fill=195)
        # Junction pip at y0
        d.ellipse((cx - 2, y0 - 2, cx + 2, y0 + 2), fill=220)

    return save_white_mask(np.array(img, dtype=np.float32), "filigree-border.png")


def make_gold_sheen() -> Image.Image:
    """256x64 satin-metallic diagonal polish & top bevel catchlight for Play & buttons."""
    W, H = 256, 64
    yy, xx = np.mgrid[0:H, 0:W]
    xn = xx / (W - 1)
    yn = yy / (H - 1)

    # Crisp upper bevel catchlight
    top_rim = np.exp(-((yn / 0.08) ** 2)) * 175.0
    # Broad angled metallic satin sheen sweeping diagonally
    diag = (xn * 0.85 - yn * 0.35)
    sheen1 = np.exp(-(((diag - 0.38) / 0.14) ** 2)) * 190.0
    sheen2 = np.exp(-(((diag - 0.56) / 0.045) ** 2)) * 140.0
    # Subtle lower bounce
    bot_rim = np.exp(-(((1.0 - yn) / 0.12) ** 2)) * 65.0

    alpha = np.clip(np.maximum.reduce([top_rim, sheen1, sheen2, bot_rim]), 0, 255)
    return save_white_mask(alpha, "gold-sheen.png")


def make_climax_sweep(rng: np.random.Generator) -> Image.Image:
    """256x48 Witch-Time amethyst diagonal sweep + clock-tick sparkles for RunningScan."""
    W, H = 256, 48
    yy, xx = np.mgrid[0:H, 0:W]
    xn = xx / (W - 1)
    yn = yy / (H - 1)

    diag = xn - (yn - 0.5) * 0.22
    band_main = np.exp(-(((diag - 0.52) / 0.13) ** 2)) * 220.0
    band_lead = np.exp(-(((diag - 0.68) / 0.025) ** 2)) * 245.0
    band_trail = np.exp(-(((diag - 0.34) / 0.04) ** 2)) * 125.0
    alpha = np.maximum.reduce([band_main, band_lead, band_trail])

    # Tiny diamond sparkles trailing the sweep
    sp = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(sp)
    for _ in range(18):
        sx = int(rng.uniform(W * 0.25, W * 0.78))
        sy = int(rng.uniform(5, H - 5))
        r = int(rng.integers(2, 4))
        sd.polygon([(sx, sy - r), (sx + r, sy), (sx, sy + r), (sx - r, sy)], fill=int(rng.integers(180, 255)))
    alpha = np.maximum(alpha, np.array(sp, dtype=np.float32))
    # Feather top/bottom 2px
    vf = np.clip(np.minimum(yy, H - 1 - yy) / 2.0, 0.0, 1.0)
    return save_white_mask(alpha * vf, "climax-sweep.png")


def main():
    rng = np.random.default_rng(SEED)
    sprites = [
        ("watch-watermark.png", make_watch_watermark(), (60, 203, 255)),
        ("nebula-smoke.png", make_nebula_smoke(rng), (56, 145, 255)),
        ("rune-band.png", make_rune_band(rng), (60, 203, 255)),
        ("flare-beam.png", make_flare_beam(rng), (139, 240, 255)),
        ("filigree-border.png", make_filigree_border(), (234, 184, 50)),
        ("gold-sheen.png", make_gold_sheen(), (251, 224, 122)),
        ("climax-sweep.png", make_climax_sweep(rng), (197, 136, 255)),
    ]

    print(f"Generated {len(sprites)} white-mask sprites in {OUT_DIR}")

    # Optional contact sheet written to scratch when --sheet <path> is passed
    if len(sys.argv) >= 3 and sys.argv[1] == "--sheet":
        sheet_path = sys.argv[2]
        os.makedirs(os.path.dirname(sheet_path), exist_ok=True)
        sheet = Image.new("RGB", (960, 620), (6, 17, 42))
        sd = ImageDraw.Draw(sheet)
        positions = [
            (20, 20, 260, 260),   # watch-watermark
            (300, 20, 420, 180),  # nebula-smoke
            (300, 220, 420, 64),  # rune-band
            (300, 310, 420, 56),  # flare-beam
            (760, 20, 80, 340),   # filigree-border
            (20, 310, 260, 72),   # gold-sheen
            (20, 410, 420, 76),   # climax-sweep
        ]
        for (name, im, tint), (x, y, rw, rh) in zip(sprites, positions):
            sd.rectangle((x - 1, y - 1, x + rw + 1, y + rh + 1), outline=(43, 85, 161))
            tinted = Image.new("RGBA", im.size, tint + (255,))
            tinted.putalpha(im.getchannel("A"))
            thumb = tinted.resize((rw, rh), Image.Resampling.LANCZOS)
            sheet.paste(thumb, (x, y), thumb)
            sd.text((x + 4, y + rh + 4), name, fill=(235, 244, 255))
        sheet.save(sheet_path, "PNG")
        print(f"Wrote contact sheet to {sheet_path}")


if __name__ == "__main__":
    main()
