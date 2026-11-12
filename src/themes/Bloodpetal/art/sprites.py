#!/usr/bin/env python3
"""Bloodpetal effect sprites. Deterministic (fixed seed); run from the theme folder: python art/sprites.py

Every sprite is a white mask (RGB 255, the effect in alpha) that XAML colors with a theme brush, so ThemeModifier edits
reach them. Nothing is copied from the game: the shapes follow the measurements in RESEARCH.md (ember seam, blood
haze behind titles, chiselled stone, drifting petals).

Output: src/Images/fx/*.png and art/fx-sheet.png (review sheet on the theme's black).
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images" / "fx"
OUT.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(1404)


def save(name, alpha):
    a = np.clip(alpha, 0, 1)
    rgba = np.dstack([np.full(a.shape, 255, np.uint8)] * 3 + [(a * 255 + 0.5).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(OUT / f"{name}.png", optimize=True, dpi=(96, 96))
    return a


def noise1(n, scale, wrap=True):
    """1-D value noise in 0..1, smoothstep between random knots `scale` samples apart; wraps by default."""
    knots = max(2, int(round(n / scale)))
    v = RNG.random(knots + 1)
    if wrap:
        v[-1] = v[0]
    x = np.arange(n) / n * knots
    i = np.floor(x).astype(int)
    t = x - i
    t = t * t * (3 - 2 * t)
    return v[i] * (1 - t) + v[np.minimum(i + 1, knots)] * t


def noise2(w, h, sx, sy):
    """2-D value noise in 0..1 that tiles in both directions."""
    gw, gh = max(2, int(round(w / sx))), max(2, int(round(h / sy)))
    g = RNG.random((gh, gw))
    ys, xs = np.arange(h) / h * gh, np.arange(w) / w * gw
    yi, xi = np.floor(ys).astype(int), np.floor(xs).astype(int)
    ty, tx = ys - yi, xs - xi
    ty, tx = ty * ty * (3 - 2 * ty), tx * tx * (3 - 2 * tx)
    y1, x1 = (yi + 1) % gh, (xi + 1) % gw
    a = g[yi][:, xi] * (1 - tx) + g[yi][:, x1] * tx
    b = g[y1][:, xi] * (1 - tx) + g[y1][:, x1] * tx
    return a * (1 - ty[:, None]) + b * ty[:, None]


def glow():
    """Bloom behind a plate: opaque core, then a 28px squared falloff. 320x112, stretched to its host."""
    w, h, pad = 320, 112, 28
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = np.maximum(np.maximum(pad - x, x - (w - 1 - pad)), 0)
    dy = np.maximum(np.maximum(pad - y, y - (h - 1 - pad)), 0)
    d = np.hypot(dx, dy)
    return save("glow", np.clip(1 - d / pad, 0, 1) ** 2 * 0.9)


def seam():
    """Ember seam, 1024x16, tiles in x. `seam` is the soft glow, `seam-core` the 1 to 2px molten line inside it.

    The line wanders +-1.5px and breaks up into hot and cold stretches (cold = alpha 0.25), like a crack with fire
    under it: measured on the red line along the head of the game's collection panels.
    """
    w, h = 1024, 16
    centre = 7.5 + (noise1(w, 90) - 0.5) * 3.0 + (noise1(w, 17) - 0.5) * 1.0
    heat = 0.25 + 0.75 * np.clip((noise1(w, 140) * 0.7 + noise1(w, 31) * 0.5) * 1.35 - 0.2, 0, 1)
    width = 0.7 + noise1(w, 23) * 0.8
    y = np.arange(h, dtype=np.float32)[:, None]
    d = np.abs(y - centre[None, :])
    core = np.clip(1 - (d / width[None, :]) ** 2, 0, 1) * heat[None, :]
    halo = np.exp(-(d / 3.2) ** 2) * heat[None, :] * 0.55
    save("seam-core", core)
    return save("seam", np.clip(halo + core * 0.5, 0, 1))


def haze():
    """Blood haze behind a title, 640x64, stretched: a smear that is densest in the middle and gone by both ends.

    Horizontal profile cos^1.5, vertical profile soft with a brighter band in the middle; mottled with noise so it
    reads as paint, not a gradient.
    """
    w, h = 640, 64
    x = np.linspace(-1, 1, w, dtype=np.float32)[None, :]
    y = np.linspace(-1, 1, h, dtype=np.float32)[:, None]
    horiz = np.clip(np.cos(x * np.pi / 2), 0, 1) ** 1.5
    vert = np.clip(1 - np.abs(y) ** 2.2, 0, 1)
    mottle = 0.72 + 0.28 * noise2(w, h, 46, 14) + 0.12 * (noise2(w, h, 9, 5) - 0.5)
    return save("haze", horiz * vert * mottle)


def stone():
    """Chiselled stone grain, 256x256, tiles. Low alpha (peak about 0.5): laid over a slab in a light brush."""
    n = 256
    base = noise2(n, n, 64, 64) * 0.5 + noise2(n, n, 20, 20) * 0.3 + noise2(n, n, 6, 6) * 0.2
    speck = (RNG.random((n, n)) > 0.985).astype(np.float32)
    speck = np.asarray(Image.fromarray((speck * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255
    a = np.clip((base - 0.38) * 1.5, 0, 1) * 0.42 + speck * 0.35
    # hairline cracks: a few random walks, wrapped
    img = Image.new("L", (n, n), 0)
    dr = ImageDraw.Draw(img)
    for _ in range(5):
        px, py = RNG.random(2) * n
        ang = RNG.random() * np.pi * 2
        for _ in range(int(40 + RNG.random() * 60)):
            ang += (RNG.random() - 0.5) * 0.7
            nx, ny = px + np.cos(ang) * 3, py + np.sin(ang) * 3
            dr.line([(px % n, py % n), (nx % n, ny % n)] if abs(nx % n - px % n) < 8 and abs(ny % n - py % n) < 8 else [(px % n, py % n)] * 2, fill=110, width=1)
            px, py = nx, ny
    crack = np.asarray(img.filter(ImageFilter.GaussianBlur(0.5)), np.float32) / 255
    return save("stone", np.clip(a + crack * 0.5, 0, 0.6))


def petal_shape(size, angle, bend):
    """One petal: a pointed teardrop with a curved spine, drawn 4x and reduced."""
    s = size * 4
    img = Image.new("L", (s, s), 0)
    t = np.linspace(0, 1, 40)
    half = np.sin(t * np.pi) ** 0.8 * (0.26 - 0.1 * t) * s
    spine_x = s * 0.5 + np.sin(t * np.pi) * bend * s
    spine_y = s * (0.06 + 0.88 * t)
    left = list(zip(spine_x - half, spine_y))
    right = list(zip(spine_x + half, spine_y))
    ImageDraw.Draw(img).polygon(left + right[::-1], fill=255)
    img = img.rotate(angle, resample=Image.BICUBIC).resize((size, size), Image.LANCZOS)
    return np.asarray(img, np.float32) / 255


def petals():
    """Drifting petals, 256x512, tiles in y (and x): 22 petals of 7 to 18px, alpha 0.25 to 0.9 by depth."""
    w, h = 256, 512
    a = np.zeros((h, w), np.float32)
    for _ in range(22):
        size = int(7 + RNG.random() ** 1.6 * 11)
        p = petal_shape(size, RNG.random() * 360, (RNG.random() - 0.5) * 0.3) * (0.25 + 0.65 * (size - 7) / 11)
        px, py = int(RNG.random() * w), int(RNG.random() * h)
        ys, xs = (np.arange(size) + py) % h, (np.arange(size) + px) % w
        a[np.ix_(ys, xs)] = np.maximum(a[np.ix_(ys, xs)], p)
    return save("petals", a)


def sheet(parts):
    pad = 16
    width = max(p.shape[1] for _, p in parts) + pad * 2
    height = sum(p.shape[0] + pad + 14 for _, p in parts) + pad
    img = Image.new("RGB", (width, height), (9, 9, 10))
    dr = ImageDraw.Draw(img)
    y = pad
    tints = {"seam": (232, 66, 26), "seam-core": (255, 178, 122), "haze": (150, 38, 28), "glow": (229, 24, 13),
             "stone": (140, 134, 128), "petals": (194, 23, 20)}
    for name, a in parts:
        dr.text((pad, y), f"{name}  {a.shape[1]}x{a.shape[0]}  peak {a.max():.2f}", fill=(134, 127, 112))
        y += 14
        tint = np.array(tints[name], np.float32)
        block = (np.array([9, 9, 10], np.float32)[None, None, :] * (1 - a[..., None]) + tint[None, None, :] * a[..., None]).astype(np.uint8)
        img.paste(Image.fromarray(block, "RGB"), (pad, y))
        y += a.shape[0] + pad
    img.save(ROOT / "art" / "fx-sheet.png", optimize=True)


if __name__ == "__main__":
    g = glow()
    s = seam()
    core = np.asarray(Image.open(OUT / "seam-core.png").split()[3], np.float32) / 255
    sheet([("glow", g), ("seam", s), ("seam-core", core), ("haze", haze()), ("stone", stone()), ("petals", petals())])
    print("sprites written to", OUT)
