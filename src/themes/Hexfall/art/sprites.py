#!/usr/bin/env python3
"""Hexfall effect sprites. Deterministic: no randomness. White masks, the effect in alpha.
    python3 src/themes/Hexfall/art/sprites.py
Writes src/Images/fx/*.png and the review sheet art/fx-sheet.png. XAML fills a Rectangle with a theme brush and
uses a sprite as OpacityMask, so ThemeModifier recolors every one. Nothing here is taken from the game: the
profiles follow the thin hex rings and radar rings seen in public captures (../RESEARCH.md, Targeting).
    glow     96x96 soft bloom behind a plate or lamp (stretched).
    hexgrid  26x45 seamless tile of a pointy-top hexagon lattice, 1px lines, for the title band and the empty page.
    radar    512x512 faint radar: three rings, a tick every 10 degrees on the outer one, a cross with a gap at the centre.
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'src', 'Images', 'fx')
os.makedirs(OUT, exist_ok=True)


def save(name, alpha):
    a = np.clip(alpha, 0, 1)
    rgba = np.zeros(a.shape + (4,), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.round(a * 255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, name + '.png'))
    return rgba


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def glow():
    n = 96
    y, x = np.mgrid[0:n, 0:n].astype(float)
    # rounded-rect distance, so a stretched bloom keeps an even falloff
    cx = cy = (n - 1) / 2
    hx = hy = n / 2 - 30
    qx = np.abs(x - cx) - hx
    qy = np.abs(y - cy) - hy
    d = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0)
    a = np.exp(-(np.maximum(d, 0) / 15.0) ** 2) * 0.9
    a *= smooth(n / 2, n / 2 - 6, np.hypot(x - cx, y - cy) * 0 + np.maximum(np.abs(x - cx), np.abs(y - cy)))
    return save('glow', a)


def hexgrid():
    w, h = 26, 45
    ss = 8  # supersample
    ys, xs = np.mgrid[0:h * ss, 0:w * ss].astype(float)
    u = (xs + 0.5) / ss * (np.sqrt(3) / w)   # hex space, circumradius 1
    v = (ys + 0.5) / ss * (3.0 / h)
    # two staggered lattices of centres: (k*sqrt3, 3m) and ((k+.5)*sqrt3, 3m+1.5)
    best = np.full(u.shape, 9.0)
    # pointy-top hexagon: edge normals at 0, 60 and 120 degrees, apothem sqrt3/2; the distance to the nearest edge
    # is taken from the cell the pixel is inside (searched over the neighbouring centres, so the tile wraps).
    for ox, oy in ((0.0, 0.0), (np.sqrt(3) / 2, 1.5)):
        for kx in (-1, 0, 1, 2):
            for ky in (-1, 0, 1):
                px, py = u - (ox + kx * np.sqrt(3)), v - (oy + ky * 3.0)
                m = np.max([np.abs(px * np.cos(t) + py * np.sin(t)) for t in (0.0, np.pi / 3, 2 * np.pi / 3)], axis=0)
                inside = np.sqrt(3) / 2 - m
                best = np.where((inside >= 0) & (inside < best), inside, best)
    px_per_unit = w / np.sqrt(3)
    d_px = best * px_per_unit
    line = 1.0 - smooth(0.35, 0.95, d_px)
    # average the supersamples down
    line = line.reshape(h, ss, w, ss).mean(axis=(1, 3))
    return save('hexgrid', line * 0.9)


def radar():
    n = 512
    y, x = np.mgrid[0:n, 0:n].astype(float)
    cx = cy = (n - 1) / 2
    r = np.hypot(x - cx, y - cy)
    ang = np.arctan2(y - cy, x - cx)
    a = np.zeros((n, n))
    for rad, strength in ((90, 0.55), (170, 0.4), (250, 0.7)):
        a = np.maximum(a, (1 - smooth(0.4, 1.3, np.abs(r - rad))) * strength)
    # ticks every 10 degrees on the outer ring, longer every 30
    step = np.pi / 18
    t = np.abs(((ang + step / 2) % step) - step / 2) * r
    long_tick = np.abs(((ang + step * 1.5) % (step * 3)) - step * 1.5) * r
    ring_band = (r > 238) & (r < 250)
    a = np.maximum(a, np.where(ring_band & (t < 0.8), 0.7, 0))
    a = np.maximum(a, np.where((r > 230) & (r < 250) & (long_tick < 1.0), 0.8, 0))
    # cross with a gap at the centre
    cross = ((np.abs(x - cx) < 0.7) | (np.abs(y - cy) < 0.7)) & (r > 26) & (r < 250)
    a = np.maximum(a, np.where(cross, 0.45, 0))
    a = np.where(r > 252, 0, a)
    return save('radar', a)


if __name__ == '__main__':
    sheets = [glow(), hexgrid(), radar()]
    # contact sheet on the theme's void navy, each sprite filled cyan, hexgrid tiled 6x3
    sheet = Image.new('RGBA', (1160, 540), (6, 19, 30, 255))
    x0 = 20
    for img in sheets:
        im = Image.fromarray(img, 'RGBA')
        if im.size == (26, 45):
            big = Image.new('RGBA', (26 * 8, 45 * 4))
            for i in range(8):
                for j in range(4):
                    big.paste(im, (i * 26, j * 45))
            im = big
        tinted = Image.new('RGBA', im.size, (72, 210, 246, 255))
        tinted.putalpha(im.getchannel('A'))
        sheet.alpha_composite(tinted, (x0, 20))
        x0 += im.size[0] + 30
    sheet.convert('RGB').save(os.path.join(HERE, 'fx-sheet.png'))
    print('wrote glow, hexgrid, radar and art/fx-sheet.png')
