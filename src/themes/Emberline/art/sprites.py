#!/usr/bin/env python3
"""Emberline effect sprites. Deterministic (seed 505): white masks, the effect in alpha.

    python3 src/themes/Emberline/art/sprites.py

Writes src/Images/fx/*.png and the review sheet art/fx-sheet.png. XAML fills a Rectangle with a theme brush
and uses a sprite as OpacityMask, so ThemeModifier recolors every one. Nothing here is taken from the game:
the profiles follow measurements of public captures (../RESEARCH.md, Ember frame and Flare rule).

    ember-top/bottom/left/right  the burning selection frame, one strip per side. 256 long, 14 thick, tiles
                                 along its length. A hot core line 4px from the inner side; licks of 1 to 8px
                                 reach outward, a 2px falloff inward.
    glow                         96x96 bloom behind a plate (stretched).
    flare                        512x16 light flare that sits on a panel's rule (stretched, centre-bright).
    grime                        256x256 tile of scratches and dust for sparse dark surfaces.
    frost                        256x256 cold crystalline glow for the empty page.
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'src', 'Images', 'fx')
rng = np.random.default_rng(505)


def periodic_noise(n, cutoff, power=1.0):
    """1D noise that wraps: white noise low-passed in the frequency domain."""
    f = np.fft.rfft(rng.standard_normal(n))
    k = np.arange(len(f))
    f *= np.exp(-(k / cutoff) ** 2)
    f[0] = 0
    v = np.fft.irfft(f, n)
    v = (v - v.min()) / (v.max() - v.min())
    return v ** power


def noise2d(h, w, cutoff):
    f = np.fft.rfft2(rng.standard_normal((h, w)))
    ky = np.minimum(np.arange(h), h - np.arange(h))[:, None]
    kx = np.arange(f.shape[1])[None, :]
    f *= np.exp(-((kx ** 2 + ky ** 2) / cutoff ** 2))
    f[0, 0] = 0
    v = np.fft.irfft2(f, (h, w))
    return (v - v.min()) / (v.max() - v.min())


def save(name, alpha):
    a = np.clip(alpha, 0, 1)
    rgba = np.full(a.shape + (4,), 255, np.uint8)
    rgba[..., 3] = (a * 255 + 0.5).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, name + '.png'), optimize=True)
    return a


def ember_strip(length=256, thick=14, core=9):
    """Top strip: row 0 is outside, the plate lies below the last row. The band's centre is row `core`.
    Captures show a rough band 3 to 6px thick, like burning paint: ragged on both sides, hotter in
    patches, with licks and a dim halo outward. The centre does not wander, so the four strips meet."""
    y = np.arange(thick)[:, None].astype(float)
    half = 0.9 + 1.5 * periodic_noise(length, 16, 1.3)             # band half-thickness per column
    rag_out = 1.6 * periodic_noise(length, 60, 2.0)                # fine ragged edge, outer side
    rag_in = 1.0 * periodic_noise(length, 60, 2.0)
    lick = 1.0 + 3.6 * periodic_noise(length, 10, 2.0)             # halo reach outward
    heat = 0.62 + 0.38 * periodic_noise(length, 12)
    d = core - y                                                   # > 0 outside, < 0 inside
    edge_out = (half + rag_out)[None, :]
    edge_in = (half * 0.8 + rag_in)[None, :]
    band = np.where(d >= 0, np.clip(edge_out - d + 0.5, 0, 1), np.clip(edge_in + d + 0.5, 0, 1))
    band = band * heat[None, :]
    halo_out = np.exp(-np.clip(d - edge_out, 0, None) / (lick[None, :] * 0.6)) * 0.42
    halo_in = np.exp(-np.clip(-d - edge_in, 0, None) / 1.4) * 0.30
    halo = np.where(d >= 0, halo_out, halo_in) * heat[None, :]
    # burned-through gaps
    gaps = np.clip((periodic_noise(length, 26) - 0.10) * 7, 0.35, 1)[None, :]
    a = np.clip(np.maximum(band * gaps, halo), 0, 1)
    for _ in range(18):                                            # sparks thrown outward
        x = rng.integers(0, length)
        yy = rng.integers(0, max(1, core - 4))
        a[yy, x] = max(a[yy, x], rng.uniform(0.3, 0.7))
    return a


def glow(n=96, pad=30):
    ax = np.arange(n)
    d = np.maximum(np.maximum(pad - ax, ax - (n - 1 - pad)), 0).astype(float)
    dist = np.hypot(d[:, None], d[None, :])
    return np.exp(-(dist / (pad * 0.42)) ** 1.6) * 0.9


def flare(w=512, h=16):
    x = (np.arange(w) - (w - 1) / 2) / (w / 2)
    y = (np.arange(h) - (h - 1) / 2)
    halo = np.exp(-(x[None, :] / 0.34) ** 2) * np.exp(-(y[:, None] / 3.4) ** 2) * 0.55
    core = np.exp(-(x[None, :] / 0.10) ** 2) * np.exp(-(y[:, None] / 1.5) ** 2)
    streak = np.exp(-np.abs(x[None, :]) / 0.45) * np.exp(-(y[:, None] / 0.7) ** 2) * 0.8
    dust = 0.75 + 0.25 * noise2d(h, w, 40)
    return np.clip((halo + core) * dust + streak, 0, 1)


def grime(n=256):
    a = np.clip((noise2d(n, n, 70) - 0.62) * 2.2, 0, 1) * 0.35      # dust
    cloud = noise2d(n, n, 5)
    a *= 0.4 + 0.6 * cloud
    for _ in range(46):                                              # scratches, mostly along x
        x0, y0 = rng.integers(0, n, 2)
        ln = rng.integers(8, 70)
        slope = rng.normal(0, 0.16)
        s = rng.uniform(0.10, 0.34)
        for t in range(ln):
            xx = (x0 + t) % n
            yy = int(y0 + t * slope) % n
            a[yy, xx] = max(a[yy, xx], s * (1 - abs(t / ln - 0.5) * 1.6))
    return a


def frost(n=256):
    ax = (np.arange(n) - (n - 1) / 2) / (n / 2)
    r = np.hypot(ax[:, None], ax[None, :])
    body = np.exp(-(r / 0.52) ** 2.2)
    crystal = noise2d(n, n, 46) * 0.55 + noise2d(n, n, 12) * 0.45
    veins = np.clip(1 - np.abs(noise2d(n, n, 18) - 0.5) * 9, 0, 1)     # thin cracks
    a = body * (0.30 + 0.55 * crystal) + body * veins * 0.35
    return np.clip(a * np.clip((1 - r) * 3, 0, 1), 0, 1)


def main():
    os.makedirs(OUT, exist_ok=True)
    top = ember_strip()
    parts = {
        'ember-top': top,
        'ember-bottom': ember_strip()[::-1, :],
        'ember-left': ember_strip().T,
        'ember-right': ember_strip().T[:, ::-1],
        'glow': glow(),
        'flare': flare(),
        'grime': grime(),
        'frost': frost(),
    }
    for name, a in parts.items():
        save(name, a)
    # review sheet: every sprite in its usual brush on black
    sheet = Image.new('RGB', (900, 620), (10, 10, 9))
    def tile(name, col, scale=1, rot=False):
        a = np.clip(parts[name], 0, 1)
        if rot:
            a = a.T
        im = Image.fromarray((a[..., None] * np.array(col)).astype(np.uint8), 'RGB')
        return im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    red, white, ice = (255, 33, 0), (255, 254, 252), (114, 210, 231)
    yy = 10
    for name, rot in (('ember-top', False), ('ember-bottom', False), ('ember-left', True), ('ember-right', True)):
        im = tile(name, red, 3, rot)
        sheet.paste(im, (10, yy)); yy += im.height + 8
    sheet.paste(tile('flare', white, 1), (10, yy)); yy += 26
    # a 220x40 plate framed with the four strips, as the XAML lays them out
    plate = np.zeros((60, 240))
    t, bt, l, r = parts['ember-top'], parts['ember-bottom'], parts['ember-left'], parts['ember-right']
    plate[0:14, :] = np.maximum(plate[0:14, :], t[:, :240]); plate[-14:, :] = np.maximum(plate[-14:, :], bt[:, :240])
    plate[:, 0:14] = np.maximum(plate[:, 0:14], l[:60, :]); plate[:, -14:] = np.maximum(plate[:, -14:], r[:60, :])
    im = Image.fromarray((plate[..., None] * np.array(red)).astype(np.uint8), 'RGB').resize((720, 180), Image.NEAREST)
    sheet.paste(im, (10, yy))
    sheet.paste(tile('glow', red, 1), (760, yy))
    yy += 190
    sheet.paste(tile('grime', white, 1).crop((0, 0, 256, 140)), (10, yy))
    sheet.paste(tile('frost', ice, 1).crop((0, 58, 256, 198)), (280, yy))
    sheet.save(os.path.join(HERE, 'fx-sheet.png'), optimize=True)


if __name__ == '__main__':
    main()
