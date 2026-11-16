#!/usr/bin/env python3
"""Stormrift effect sprites. Deterministic: no randomness. White masks, effect in alpha.
    python3 src/themes/Stormrift/art/sprites.py
Writes src/Images/fx/*.png and the review sheet art/fx-sheet.png. XAML fills a Rectangle with a theme brush and
uses a sprite as OpacityMask, so ThemeModifier recolors every one.
    glow     96x96 soft cosmic bloom behind a plate or tab flare (9-slice stretched).
    hexgrid  26x45 seamless tile of a pointy-top hexagon lattice, 1px lines, for the title band and launching scan mask.
    vortex   512x512 concentric Nexus portal rings with 30-degree angular storm ticks and subtle arc breaks.
    flare    256x24 horizontal soft energy flare for active tab underline and divider highlights.
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
    cx = cy = (n - 1) / 2
    hx = hy = n / 2 - 30
    qx = np.abs(x - cx) - hx
    qy = np.abs(y - cy) - hy
    d = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0)
    a = np.exp(-(np.maximum(d, 0) / 14.5) ** 2) * 0.92
    a *= smooth(n / 2, n / 2 - 6, np.maximum(np.abs(x - cx), np.abs(y - cy)))
    return save('glow', a)


def hexgrid():
    w, h = 26, 45
    ss = 8
    ys, xs = np.mgrid[0:h * ss, 0:w * ss].astype(float)
    u = (xs + 0.5) / ss * (np.sqrt(3) / w)
    v = (ys + 0.5) / ss * (3.0 / h)
    best = np.full(u.shape, 9.0)
    for ox, oy in ((0.0, 0.0), (np.sqrt(3) / 2, 1.5)):
        for kx in (-1, 0, 1, 2):
            for ky in (-1, 0, 1):
                px, py = u - (ox + kx * np.sqrt(3)), v - (oy + ky * 3.0)
                m = np.max([np.abs(px * np.cos(t) + py * np.sin(t)) for t in (0.0, np.pi / 3, 2 * np.pi / 3)], axis=0)
                inside = np.sqrt(3) / 2 - m
                best = np.where((inside >= 0) & (inside < best), inside, best)
    px_per_unit = w / np.sqrt(3)
    d_px = best * px_per_unit
    line = 1.0 - smooth(0.18, 0.72, d_px)
    line = line.reshape(h, ss, w, ss).mean(axis=(1, 3))
    return save('hexgrid', line * 0.85)


def vortex():
    n = 512
    y, x = np.mgrid[0:n, 0:n].astype(float)
    cx = cy = (n - 1) / 2
    r = np.hypot(x - cx, y - cy)
    ang = np.arctan2(y - cy, x - cx)
    a = np.zeros((n, n))

    # Three concentric portal rings with gentle soft halos
    for rad, strength, halo in ((88, 0.72, 10.0), (156, 0.55, 14.0), (228, 0.78, 12.0)):
        ring_core = 1.0 - smooth(0.5, 1.8, np.abs(r - rad))
        ring_halo = np.exp(-((r - rad) / halo) ** 2) * 0.25
        a = np.maximum(a, np.maximum(ring_core * strength, ring_halo))

    # Subtle 3-fold storm arc sweep on middle ring
    arc_mod = 0.55 + 0.45 * np.sin(3.0 * ang + 0.4)
    a = np.where((r > 138) & (r < 174), a * arc_mod + (1.0 - smooth(0.5, 2.0, np.abs(r - 156))) * 0.25, a)

    # 30-degree angular tick marks on outer ring
    step = np.pi / 6
    t = np.abs(((ang + step / 2) % step) - step / 2) * r
    ticks = (r > 214) & (r < 236) & (t < 1.1)
    a = np.maximum(a, np.where(ticks, 0.7, 0))

    # Subtle radial fade at outer boundary
    a *= 1.0 - smooth(232, 254, r)
    return save('vortex', a)


def flare():
    w, h = 256, 24
    y, x = np.mgrid[0:h, 0:w].astype(float)
    nx = (x - (w - 1) / 2.0) / ((w - 1) / 2.0)
    ny = (y - (h - 1) / 2.0) / ((h - 1) / 2.0)
    horiz = np.exp(-(nx / 0.48) ** 2) * (1.0 - smooth(0.82, 1.0, np.abs(nx)))
    vert = np.exp(-(ny / 0.35) ** 2) * (1.0 - smooth(0.75, 1.0, np.abs(ny)))
    return save('flare', horiz * vert * 0.95)


if __name__ == '__main__':
    sheets = [glow(), hexgrid(), vortex(), flare()]
    sheet = Image.new('RGBA', (1180, 560), (10, 4, 26, 255))
    x0 = 20
    for img in sheets:
        im = Image.fromarray(img, 'RGBA')
        if im.size == (26, 45):
            big = Image.new('RGBA', (26 * 8, 45 * 4))
            for i in range(8):
                for j in range(4):
                    big.paste(im, (i * 26, j * 45))
            im = big
        tinted = Image.new('RGBA', im.size, (154, 184, 254, 255))
        tinted.putalpha(im.getchannel('A'))
        sheet.alpha_composite(tinted, (x0, 20))
        x0 += im.size[0] + 24
    sheet.convert('RGB').save(os.path.join(HERE, 'fx-sheet.png'))
    print('wrote glow, hexgrid, vortex, flare and art/fx-sheet.png')
