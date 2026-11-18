#!/usr/bin/env python3
"""Whalebone effect sprites. Deterministic (fixed seed). White masks, effect in alpha.
    python3 -I src/themes/Whalebone/art/sprites.py
Writes src/Images/fx/*.png and the review sheet art/fx-sheet.png. XAML fills a Rectangle with a theme brush and uses a
sprite as OpacityMask (previews use the same files through -webkit-mask), so ThemeModifier recolors every effect.

    brush-stroke  512x128  the menu cursor: a near-solid dry-brush stroke with ragged ends, bristle streaks and a few
                           long hairline flicks past the right end (Dishonored 2 `CAMPAIGN`, `Resume`).
    ink-plate     384x96   an idle entry plate: a rough torn rectangle of ink, slightly heavier at the left.
    ink-smear     512x96   a caption smear: thick at the left, tapering to dry bristles at the right (`Display Mode`).
    frost-frame   96x96    9-slice frost frame: a 1.5px bright core at inset 24 with a soft bloom both sides.
    bloom         256x128  soft elliptical bloom behind the Play plate.
    marble        256x96   faint veins and cloud for the bone paper plate (drawn darker over bone).
    shard-glint   64x64    a soft diagonal glint for glass shards.
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'src', 'Images', 'fx')
os.makedirs(OUT, exist_ok=True)
RNG = np.random.default_rng(1916)  # fixed seed: regenerating is bit-reproducible


def save(name, alpha):
    a = np.clip(alpha, 0, 1)
    rgba = np.zeros(a.shape + (4,), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.round(a * 255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, name + '.png'), optimize=True)
    return rgba


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def noise1d(n, scale, octaves=3):
    """Smooth 1D value noise in [-1, 1]."""
    out = np.zeros(n)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        step = max(1, int(scale / (2 ** o)))
        pts = RNG.uniform(-1, 1, n // step + 3)
        xs = np.arange(n) / step
        i = xs.astype(int)
        f = xs - i
        f = f * f * (3 - 2 * f)
        out += amp * (pts[i] * (1 - f) + pts[i + 1] * f)
        total += amp
        amp *= 0.5
    return out / total


def noise2d(h, w, scale, octaves=4):
    out = np.zeros((h, w))
    amp, total = 1.0, 0.0
    for o in range(octaves):
        s = max(1, int(scale / (2 ** o)))
        gh, gw = h // s + 3, w // s + 3
        grid = RNG.uniform(-1, 1, (gh, gw))
        ys = np.arange(h)[:, None] / s
        xs = np.arange(w)[None, :] / s
        yi, xi = ys.astype(int), xs.astype(int)
        fy, fx = ys - yi, xs - xi
        fy, fx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
        a = grid[yi, xi]; b = grid[yi, xi + 1]; c = grid[yi + 1, xi]; d = grid[yi + 1, xi + 1]
        out += amp * ((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy)
        total += amp
        amp *= 0.5
    return out / total


def brush_stroke():
    h, w = 128, 512
    y, x = np.mgrid[0:h, 0:w].astype(float)
    # Ragged top/bottom edges of the band (core from ~22 to ~106).
    u = np.arange(w) / (w - 1)
    taper = 22 * (1 - smooth(0.0, 0.22, u)) + 26 * smooth(0.72, 1.0, u)  # the band narrows toward both ends
    top = 24 + taper * 0.55 + 7 * noise1d(w, 40) + 3 * noise1d(w, 6)
    bot = 104 - taper * 0.45 + 7 * noise1d(w, 46) + 3 * noise1d(w, 7)
    band = smooth(top - 3, top + 3, y) * (1 - smooth(bot - 3, bot + 3, y))
    # Per-row start / end: feathered, uneven ends.
    start = 18 + 34 * (noise1d(h, 10) * 0.5 + 0.5)
    end = w - 40 - 46 * (noise1d(h, 9) * 0.5 + 0.5)
    ends = smooth(start[:, None] - 10, start[:, None] + 16, x) * (1 - smooth(end[:, None] - 28, end[:, None] + 6, x))
    # Bristle streaks: horizontal, per row.
    streak = 0.9 + 0.1 * noise1d(h, 7, 2)[:, None]
    dry = noise2d(h, w, 22, 3)
    gaps = smooth(0.35, 0.65, dry * 0.5 + 0.5 + (np.abs(x - w / 2) / w) * 0.55 - 0.42)
    gaps = gaps * smooth(0.22, 0.42, np.abs(x / w - 0.5))  # the loaded middle stays solid under a label
    core = band * ends * streak * (1 - 0.85 * gaps)
    # Long hairline flicks past the right end and a few at the left (bristles dragging).
    flicks = np.zeros((h, w))
    for _ in range(9):
        row = int(RNG.uniform(30, 100))
        x0 = int(RNG.uniform(w - 150, w - 90))
        length = int(RNG.uniform(50, 110))
        xs = np.arange(x0, min(w - 2, x0 + length))
        fade = 1 - (xs - x0) / max(1, length)
        ys = row + (xs - x0) * RNG.uniform(-0.05, 0.05)
        for xx, yy, ff in zip(xs, ys, fade):
            yi = int(yy)
            if 0 <= yi < h - 1:
                flicks[yi, xx] = max(flicks[yi, xx], 0.85 * ff)
                flicks[yi + 1, xx] = max(flicks[yi + 1, xx], 0.3 * ff)
    for _ in range(4):
        row = int(RNG.uniform(36, 96))
        x1 = int(RNG.uniform(40, 70))
        length = int(RNG.uniform(24, 40))
        xs = np.arange(max(1, x1 - length), x1)
        fade = (xs - (x1 - length)) / max(1, length)
        for xx, ff in zip(xs, fade):
            flicks[row, xx] = max(flicks[row, xx], 0.7 * ff)
    return save('brush-stroke', np.maximum(core, flicks))


def ink_plate():
    h, w = 96, 384
    y, x = np.mgrid[0:h, 0:w].astype(float)
    n = noise2d(h, w, 18, 4)
    # Rounded rectangle distance with a noisy edge.
    m = 12
    qx = np.maximum(m - x, x - (w - 1 - m))
    qy = np.maximum(m - y, y - (h - 1 - m))
    d = np.maximum(qx, qy)  # >0 outside inset rect
    edge = 2 + 7 * n + 3 * noise2d(h, w, 4, 2)
    a = 1 - smooth(edge - 2.5, edge + 2.5, d)
    tone = 0.9 + 0.1 * noise2d(h, w, 30, 2)  # a slightly uneven ink load
    heavier = 1 - 0.12 * (x / w)
    return save('ink-plate', a * tone * heavier)


def ink_smear():
    h, w = 96, 512
    y, x = np.mgrid[0:h, 0:w].astype(float)
    t = x / (w - 1)
    half = (38 - 26 * t ** 1.3) + 4 * noise1d(w, 30)[None, :]
    cy = 48 + 4 * noise1d(w, 120)[None, :]
    band = 1 - smooth(half - 3, half + 2, np.abs(y - cy))
    start = 10 + 16 * (noise1d(h, 8) * 0.5 + 0.5)
    left = smooth(start[:, None] - 6, start[:, None] + 10, x)
    right = 1 - smooth(0.68, 0.98, t + 0.1 * noise1d(h, 4)[:, None])
    streak = 0.9 + 0.1 * noise1d(h, 6, 2)[:, None]
    dry = smooth(0.2, 0.75, noise2d(h, w, 16, 3) * 0.5 + 0.5 + t * 0.6 - 0.35)
    return save('ink-smear', band * left * right * streak * (1 - 0.8 * dry))


def frost_frame():
    n, inset = 96, 24
    y, x = np.mgrid[0:n, 0:n].astype(float)
    # Distance to the inset rectangle outline.
    qx = np.abs(x - (n - 1) / 2) - ((n - 1) / 2 - inset)
    qy = np.abs(y - (n - 1) / 2) - ((n - 1) / 2 - inset)
    outside = np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qy, 0) ** 2)
    inside = np.minimum(np.maximum(qx, qy), 0)
    d = np.where(outside > 0, outside, -inside)
    core = 1 - smooth(0.6, 1.6, d)
    bloom_out = np.exp(-(outside / 7.0) ** 2) * 0.55 * (outside > 0)
    bloom_in = np.exp(-(np.abs(inside) / 4.0) ** 2) * 0.32 * (outside <= 0)
    return save('frost-frame', np.maximum(core, bloom_out + bloom_in))


def bloom():
    h, w = 128, 256
    y, x = np.mgrid[0:h, 0:w].astype(float)
    r = np.sqrt(((x - (w - 1) / 2) / (w / 2)) ** 2 + ((y - (h - 1) / 2) / (h / 2)) ** 2)
    return save('bloom', (1 - smooth(0.0, 1.0, r)) ** 1.6)


def marble():
    h, w = 96, 256
    y, x = np.mgrid[0:h, 0:w].astype(float)
    cloud = smooth(0.1, 0.9, noise2d(h, w, 48, 4) * 0.5 + 0.5) * 0.35
    veins = np.zeros((h, w))
    for _ in range(5):
        y0 = RNG.uniform(0, h)
        slope = RNG.uniform(-0.25, 0.25)
        wob = noise1d(w, 50) * RNG.uniform(6, 14)
        line_y = y0 + slope * np.arange(w) + wob
        d = np.abs(y - line_y[None, :])
        veins = np.maximum(veins, np.exp(-(d / 0.9) ** 2) * RNG.uniform(0.35, 0.7))
    return save('marble', np.maximum(cloud, veins))


def shard_glint():
    n = 64
    y, x = np.mgrid[0:n, 0:n].astype(float)
    d = np.abs((x - y)) / np.sqrt(2)
    r = np.sqrt((x - 31.5) ** 2 + (y - 31.5) ** 2)
    return save('shard-glint', np.exp(-(d / 3.0) ** 2) * (1 - smooth(10, 31, r)))


def sheet(images):
    pad = 16
    width = max(im.shape[1] for im in images) + 2 * pad
    height = sum(im.shape[0] + pad for im in images) + pad
    canvas = Image.new('RGB', (width, height), (24, 27, 34))
    top = pad
    for im in images:
        tile = Image.fromarray(im, 'RGBA')
        tinted = Image.new('RGBA', tile.size, (214, 226, 224, 255))
        tinted.putalpha(tile.getchannel('A'))
        canvas.paste(tinted, (pad, top), tinted)
        top += im.shape[0] + pad
    canvas.save(os.path.join(HERE, 'fx-sheet.png'))


if __name__ == '__main__':
    sheet([brush_stroke(), ink_plate(), ink_smear(), frost_frame(), bloom(), marble(), shard_glint()])
