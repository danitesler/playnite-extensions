#!/usr/bin/env python3
"""Visorline effect sprites. Deterministic (seed 211): white masks, the effect in alpha.
    python3 src/themes/Visorline/art/sprites.py
Writes src/Images/fx/*.png and the review sheet art/fx-sheet.png. XAML fills a Rectangle with a theme brush
and uses a sprite as OpacityMask, so ThemeModifier recolors every one. Nothing here is taken from the game:
the profiles follow measurements of public captures (../RESEARCH.md).
    hex        24x42 honeycomb tile (pointy top, hexes 24 wide, rows 21 apart). 1px outlines, tiles both ways.
    bloom      128x64 soft bloom behind a plate or a lit label (stretched).
    grain      128x128 tile of fine grain for the selected band.
    scan       1x4 tile of scanlines (one row in four).
    seg        10x12 tile of one HUD segment (8 lit, 2 gap) for segmented bars.
    ruler-h    40x8 tile of a ruler's ticks growing down from the top edge (8, 3, 5, 3 px at 0, 10, 20, 30).
    ruler-v    8x40 the same, turned: ticks grow right from the left edge.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'src', 'Images', 'fx')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(211)


def save_mask(alpha, name):
    """alpha: float array 0..1 -> RGBA PNG, white with that alpha."""
    a = np.clip(alpha, 0, 1)
    img = np.zeros(a.shape + (4,), dtype=np.uint8)
    img[..., :3] = 255
    img[..., 3] = np.round(a * 255).astype(np.uint8)
    Image.fromarray(img, 'RGBA').save(os.path.join(OUT, name))
    return img


def hex_tile():
    """Pointy-top honeycomb, flat-to-flat 24, point-to-point 28, rows 21 apart: the tile is 24 x 42 (two rows)."""
    S = 8
    w, h = 24 * S, 42 * S
    im = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(im)
    verts = [(0, -14), (12, -7), (12, 7), (0, 14), (-12, 7), (-12, -7)]
    for row in range(-2, 4):
        cy = row * 21
        off = 12 if row % 2 else 0
        for col in range(-2, 4):
            cx = col * 24 + off
            pts = [((cx + vx) * S, (cy + vy) * S) for vx, vy in verts]
            d.line(pts + [pts[0]], fill=255, width=int(1.2 * S), joint='curve')
    im = im.resize((24, 42), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32) / 255.0
    return save_mask(a, 'hex.png')


def bloom():
    w, h = 128, 64
    base = Image.new('L', (w, h), 0)
    ImageDraw.Draw(base).rectangle([w * .22, h * .30, w * .78, h * .70], fill=255)
    a = np.asarray(base.filter(ImageFilter.GaussianBlur(11)), dtype=np.float32) / 255.0
    a /= a.max()
    return save_mask(a ** 1.35, 'bloom.png')


def grain():
    n = rng.random((128, 128)).astype(np.float32)
    # a touch of low-frequency mottling so the band is not pure TV noise
    f = np.fft.rfft2(rng.standard_normal((128, 128)))
    ky = np.minimum(np.arange(128), 128 - np.arange(128))[:, None]
    kx = np.arange(f.shape[1])[None, :]
    f *= np.exp(-((kx ** 2 + ky ** 2) / 14 ** 2))
    f[0, 0] = 0
    m = np.fft.irfft2(f, (128, 128))
    m = (m - m.min()) / (m.max() - m.min())
    a = 0.10 + 0.55 * (n ** 2.2) * (0.6 + 0.4 * m)
    return save_mask(a, 'grain.png')


def scan():
    a = np.zeros((4, 1), dtype=np.float32)
    a[0, 0] = 1.0
    return save_mask(a, 'scan.png')


def seg():
    a = np.zeros((12, 10), dtype=np.float32)
    a[:, :8] = 1.0
    return save_mask(a, 'seg.png')


def ruler_h():
    a = np.zeros((8, 40), dtype=np.float32)
    for x, length in ((0, 8), (10, 3), (20, 5), (30, 3)):
        a[:length, x] = 1.0
    return save_mask(a, 'ruler-h.png')


def ruler_v():
    a = np.zeros((40, 8), dtype=np.float32)
    for y, length in ((0, 8), (10, 3), (20, 5), (30, 3)):
        a[y, :length] = 1.0
    return save_mask(a, 'ruler-v.png')


def sheet(imgs):
    """Review sheet: each sprite over the theme's near-black in mint, tiles repeated."""
    W, H = 760, 330
    sh = Image.new('RGB', (W, H), (10, 13, 12))
    mint = Image.new('RGB', (1, 1), (163, 210, 189))

    def paste(name, x, y, tile=None, scale=1):
        im = Image.fromarray(imgs[name], 'RGBA')
        if tile:
            big = Image.new('RGBA', tile, (0, 0, 0, 0))
            for yy in range(0, tile[1], im.height):
                for xx in range(0, tile[0], im.width):
                    big.paste(im, (xx, yy))
            im = big
        if scale != 1:
            im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
        solid = Image.new('RGB', im.size, (163, 210, 189))
        sh.paste(solid, (x, y), im.split()[3])
    paste('hex', 10, 10, (240, 252))
    paste('bloom', 270, 10, scale=2)
    paste('grain', 270, 150, (240, 120))
    paste('scan', 530, 10, (200, 80))
    paste('seg', 530, 110, (200, 24))
    paste('ruler-h', 530, 150, (200, 24))
    paste('ruler-v', 740, 150, (8, 120))
    sh.save(os.path.join(HERE, 'fx-sheet.png'))


if __name__ == '__main__':
    imgs = {
        'hex': hex_tile(), 'bloom': bloom(), 'grain': grain(), 'scan': scan(), 'seg': seg(),
        'ruler-h': ruler_h(), 'ruler-v': ruler_v(),
    }
    sheet(imgs)
    print('wrote', ', '.join(sorted(imgs)), 'to', os.path.normpath(OUT))
