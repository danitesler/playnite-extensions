#!/usr/bin/env python3
"""Last Flame effect sprites. Deterministic (fixed seed); run from the theme folder: python art/sprites.py

Every sprite is a white mask (RGB 255, the effect in alpha) that XAML colors with a theme brush, so ThemeModifier edits
reach them. Nothing is copied from the game: the shapes follow the measurements in RESEARCH.md (broken double frame,
torn ribbon, chevron pennant, ember drift).

Output: src/Images/fx/*.png and art/fx-sheet.png (review sheet on the theme's black).
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images" / "fx"
OUT.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(1317)
SS = 4  # supersampling for anything with a hard inked edge


def save(name, alpha):
    a = np.clip(alpha, 0, 1)
    rgba = np.dstack([np.full(a.shape, 255, np.uint8)] * 3 + [(a * 255 + 0.5).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(OUT / f"{name}.png", optimize=True, dpi=(96, 96))
    return a


def smooth_noise(n, scale, wrap=False):
    """1-D value noise in -1..1, cubic between random knots spaced `scale` samples apart."""
    knots = max(2, int(round(n / scale)))
    v = RNG.uniform(-1, 1, knots + 3)
    if wrap:
        v[-3:] = v[:3]
    x = np.arange(n) / n * knots
    i = np.floor(x).astype(int)
    t = x - i
    t = t * t * (3 - 2 * t)
    return v[i] * (1 - t) + v[i + 1] * t


def field(w, h, sx, sy, wrap=False):
    """2-D value noise in 0..1. wrap=True tiles in both directions."""
    gw, gh = max(2, int(round(w / sx))), max(2, int(round(h / sy)))
    g = RNG.random((gh, gw))
    ys = np.arange(h) / h * gh
    xs = np.arange(w) / w * gw
    yi, xi = np.floor(ys).astype(int), np.floor(xs).astype(int)
    ty, tx = ys - yi, xs - xi
    ty, tx = ty * ty * (3 - 2 * ty), tx * tx * (3 - 2 * tx)
    y1, x1 = (yi + 1) % gh if wrap else np.minimum(yi + 1, gh - 1), (xi + 1) % gw if wrap else np.minimum(xi + 1, gw - 1)
    a = g[yi][:, xi] * (1 - tx) + g[yi][:, x1] * tx
    b = g[y1][:, xi] * (1 - tx) + g[y1][:, x1] * tx
    return a * (1 - ty[:, None]) + b * ty[:, None]


def downsample(a, w, h):
    img = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "L")
    return np.asarray(img.resize((w, h), Image.LANCZOS), dtype=np.float32) / 255


def chips(a, s, cut=0.72):
    """Knock small chips out of a hard line: the worn, broken gold line of the game's frames."""
    h, w = a.shape
    n = field(w, h, 26 * s, 26 * s) * 0.65 + field(w, h, 7 * s, 7 * s) * 0.35
    return a * (n < cut)


def frame():
    """Broken double frame, 9-slice 24/48/24 at 1x. Drawn at 2x (192px) so it stays sharp at 200% scaling."""
    px, s = 192, 2
    k = s * SS
    size = px * SS
    img = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(img)
    o, i = int(3.5 * k), int(8.5 * k)  # outer heavy line, inner hairline
    notch = int(8 * k)
    def octo(m, c, width):
        pts = [(m + c, m), (size - m - c, m), (size - m, m + c), (size - m, size - m - c),
               (size - m - c, size - m), (m + c, size - m), (m, size - m - c), (m, m + c), (m + c, m)]
        d.line(pts, fill=255, width=width, joint="curve")
    octo(o, notch, int(2 * k))
    octo(i, int(notch * 0.65), int(0.75 * k))
    # corner studs: a small diamond on each chamfer, the game's diamond pip
    for cx, cy in [(o + notch * 0.5, o + notch * 0.5), (size - o - notch * 0.5, o + notch * 0.5),
                   (o + notch * 0.5, size - o - notch * 0.5), (size - o - notch * 0.5, size - o - notch * 0.5)]:
        r = 3.2 * k
        d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=255)
    a = np.asarray(img, dtype=np.float32) / 255
    a = chips(a, k, 0.70)
    return save("frame", downsample(a, px, px))


def ribbon():
    """Torn crimson ribbon: the band behind a hero's name. 480x72, stretched to fit its host."""
    w, h = 480 * SS, 72 * SS
    top = (smooth_noise(w, 40 * SS) * 0.5 + smooth_noise(w, 9 * SS) * 0.5) * 7 * SS + 13 * SS
    bot = h - ((smooth_noise(w, 46 * SS) * 0.5 + smooth_noise(w, 8 * SS) * 0.5) * 7 * SS + 13 * SS)
    y = np.arange(h)[:, None]
    a = (y >= top[None, :]) & (y <= bot[None, :])
    # torn ends: each row stops at its own distance from the edge
    l = 10 * SS + (smooth_noise(h, 6 * SS) + 1) * 13 * SS
    r = w - (10 * SS + (smooth_noise(h, 6 * SS) + 1) * 13 * SS)
    x = np.arange(w)[None, :]
    a = a & (x >= l[:, None]) & (x <= r[:, None])
    # dry-brush streaks running along the band
    streak = field(w, h, 90 * SS, 2.2 * SS)
    fine = field(w, h, 30 * SS, 1.2 * SS)
    a = a.astype(np.float32) * ((streak * 0.6 + fine * 0.4) > 0.27)
    return save("ribbon", downsample(a, 480, 72))


def pennant():
    """Torn chevron pennant for Play (the arrow-shaped tabs of the game's camp bar). 360x104 at 2x of 180x52."""
    w, h = 360 * SS, 104 * SS
    cy = h / 2
    tip = 44 * SS  # length of the arrowhead
    margin = 7 * SS
    notch = 16 * SS
    y = np.arange(h)
    half = cy - margin
    # right edge: straight diagonals to the point; left edge: a shallow swallowtail
    t = np.clip(np.abs(y - cy) / half, 0, 1)
    right = w - margin - tip * t
    left = margin + notch * (1 - t)
    right = right + smooth_noise(h, 7 * SS) * 2.6 * SS
    left = left + smooth_noise(h, 6 * SS) * 3.2 * SS
    top = margin + (smooth_noise(w, 22 * SS) * 0.6 + smooth_noise(w, 5 * SS) * 0.4) * 2.4 * SS
    bot = h - margin - (smooth_noise(w, 26 * SS) * 0.6 + smooth_noise(w, 5 * SS) * 0.4) * 2.4 * SS
    yy = y[:, None]
    x = np.arange(w)[None, :]
    a = (x >= left[:, None]) & (x <= right[:, None]) & (yy >= top[None, :]) & (yy <= bot[None, :])
    streak = field(w, h, 80 * SS, 2.0 * SS) * 0.6 + field(w, h, 24 * SS, 1.1 * SS) * 0.4
    a = a.astype(np.float32) * (streak > 0.24)
    return save("pennant", downsample(a, 360, 104))


def grain():
    """Soot, pits and engraver's hatching. 256px seamless; used at low opacity on the rail, the bar and panels."""
    n = 256
    base = field(n, n, 3, 3, wrap=True) * 0.55 + field(n, n, 11, 11, wrap=True) * 0.45
    speck = (base > 0.77).astype(np.float32) * 0.8
    patch = field(n, n, 64, 64, wrap=True)
    yy, xx = np.mgrid[0:n, 0:n]
    # diagonal hatching with an integer period, so it tiles
    hatch = (((xx + yy) % 8) < 1).astype(np.float32) * (patch > 0.56) * 0.55
    return save("grain", np.maximum(speck, hatch))


def rule():
    """Worn gold double rule. 1024x10 (tiles in x) and its vertical twin 10x1024, drawn at 2x height."""
    w, h, k = 1024, 10, SS
    W, H = w * k, h * k
    y1, y2 = int(2 * k), int(6 * k)
    a = np.zeros((H, W), np.float32)
    a[y1:y1 + int(2.2 * k), :] = 1
    a[y2:y2 + int(1.1 * k), :] = 0.75
    n = field(W, H, 34 * k, 34 * k, wrap=True) * 0.6 + field(W, H, 9 * k, 9 * k, wrap=True) * 0.4
    a = a * (n < 0.71)
    out = downsample(a, w, h)
    save("rule", out)
    # the vertical twin is the same line turned 90 degrees, so the rail edge and the top rule match
    save("rule-v", np.rot90(out).copy())
    return out


def embers():
    """Sparks rising off a torch. 128x256, tiles vertically; moved one tile per loop."""
    w, h = 128, 256
    a = np.zeros((h, w), np.float32)
    for _ in range(46):
        cx, cy = RNG.uniform(6, w - 6), RNG.uniform(0, h)
        rx, ry = RNG.uniform(0.7, 1.5), RNG.uniform(1.2, 4.0)
        amp = RNG.uniform(0.45, 1.0)
        yy, xx = np.mgrid[0:h, 0:w]
        for dy in (-h, 0, h):  # wrap vertically
            d = ((xx - cx) / rx) ** 2 + ((yy - cy - dy) / ry) ** 2
            a = np.maximum(a, amp * np.exp(-d))
    return save("embers", a)


def glow():
    """Torchlight falloff. 256px; inverse-square-ish so it reads as a light, not a disc."""
    n = 256
    yy, xx = np.mgrid[0:n, 0:n]
    r = np.hypot(xx - n / 2 + 0.5, yy - n / 2 + 0.5) / (n / 2)
    return save("glow", np.clip(1 - r, 0, 1) ** 2.4)


def flame():
    """A torch flame in two layers: body and hot core. 96x144, the base at the bottom centre."""
    w, h = 96, 144
    W, H = w * SS, h * SS

    def tongue(cx, top, base, width, lean):
        ys = np.arange(H) / H
        t = np.clip((ys - top) / (base - top), 0, 1)
        half = np.where((ys >= top) & (ys <= base), width * np.sin(np.pi * t ** 0.62) ** 0.9, 0)
        centre = cx + lean * (1 - t) ** 2
        xs = np.arange(W)[None, :] / W
        return (np.abs(xs - centre[:, None]) <= half[:, None]).astype(np.float32)

    body = np.maximum.reduce([
        tongue(0.50, 0.05, 0.97, 0.27, 0.04),
        tongue(0.33, 0.30, 0.95, 0.15, -0.06),
        tongue(0.68, 0.24, 0.95, 0.16, 0.07),
        tongue(0.42, 0.14, 0.90, 0.13, -0.05),
    ])
    # ragged inner tearing and a soft fall-off toward the tips
    tear = field(W, H, 8 * SS, 18 * SS)
    ramp = np.linspace(0.45, 1.0, H)[:, None]
    a = body * (tear > 0.16) * ramp
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(1.1 * SS)), np.float32) / 255
    save("flame", downsample(a, w, h))

    core = tongue(0.50, 0.42, 0.96, 0.13, 0.015)
    core = np.asarray(Image.fromarray((core * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(2.2 * SS)), np.float32) / 255
    return save("flame-core", downsample(core, w, h))


def main():
    sprites = {}
    for fn in (frame, ribbon, pennant, grain, rule, embers, glow, flame):
        sprites[fn.__name__] = fn()
    # review sheet: every shipped mask on near black
    names = ["frame", "ribbon", "pennant", "grain", "rule", "embers", "glow", "flame", "flame-core"]
    sheet = Image.new("RGB", (1100, 660), (7, 5, 4))
    x, y, row = 12, 12, 0
    for n in names:
        im = Image.open(OUT / f"{n}.png")
        if im.width > 520:
            im = im.crop((0, 0, 520, im.height))
        if x + im.width > 1090:
            x, y, row = 12, y + row + 12, 0
        tint = Image.new("RGB", im.size, (192, 160, 96))
        sheet.paste(tint, (x, y), im.getchannel("A"))
        x += im.width + 12
        row = max(row, im.height)
    sheet.save(ROOT / "art" / "fx-sheet.png")
    print("wrote", ", ".join(names))


if __name__ == "__main__":
    main()
