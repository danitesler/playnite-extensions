#!/usr/bin/env python3
"""Henchwork FX masks: pure-white RGBA alpha masks, tinted in XAML with OpacityMask.

    python3 src/themes/Henchwork/art/sprites.py [--sheet <scratch>/fx-sheet.png]

Deterministic (seed 710). Writes src/Images/fx/*.png next to this theme:
  blueprint-grid.png  48x48 tile: war-room map grid (1px minor line, 2px major line every tile)
  rings.png           256x256: loading-poster concentric rings (empty page, running ring pulse)
  hatch.png           16x16 tile: diagonal hatch band for launching sweeps and progress
  paper-fibre.png     128x128 tile: faint fibre speckle for the dossier paper
  grunge.png          256x256 tile: mottled paint / worn print for panels, tiles and tape
  hatch-pencil.png    64x64 tile: uneven diagonal pencil hatching for sketched shadows
  sketch-h.png        256x8 tile (x): wobbly double-pass ink stroke for rough horizontal edges
  sketch-v.png        8x256 tile (y): the same stroke turned for vertical edges
  tape-torn.png       256x40: masking-tape strip with torn ragged ends (stretched to fit)
  stamp.png           160x160: distressed rubber-stamp rings for the dossier
  marker.png          256x24: felt-marker swipe with tapered ends (title underline)
  map-contours.png    512x512 tile: topographic contour lines (the world-map table)
"""
import argparse
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "src", "Images", "fx"))
RNG = np.random.default_rng(710)


def mask(alpha):
    a = np.clip(alpha, 0, 1)
    rgba = np.zeros(a.shape + (4,), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (a * 255).round().astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def blueprint_grid(size=48):
    a = np.zeros((size, size))
    a[0:2, :] = 1.0          # major line, top
    a[:, 0:2] = 1.0          # major line, left
    half = size // 2
    a[half, :] = np.maximum(a[half, :], 0.45)  # minor line
    a[:, half] = np.maximum(a[:, half], 0.45)
    return mask(a)


def rings(size=256, count=6):
    y, x = np.mgrid[0:size, 0:size] + 0.5
    c = size / 2
    r = np.hypot(x - c, y - c) / c  # 0 centre .. 1 edge
    band = (r * count) % 1.0
    # Thick poster rings with soft 1px edges, fading toward the rim.
    edge = 1.5 / (size / 2) * count
    ring = np.clip((band - 0.5) / edge + 0.5, 0, 1) * np.clip((1.0 - band) / edge, 0, 1)
    ring *= np.clip((1.0 - r) / 0.08, 0, 1)
    return mask(ring)


def hatch(size=16, width=5):
    y, x = np.mgrid[0:size, 0:size] + 0.5
    d = (x + y) % size
    a = np.clip(width / 2 - np.abs(d - size / 2) + 0.5, 0, 1)
    return mask(a)


def paper_fibre(size=128):
    a = RNG.random((size, size)) ** 6 * 0.55
    # Short horizontal fibres.
    for _ in range(90):
        yy = RNG.integers(0, size)
        xx = RNG.integers(0, size)
        ln = RNG.integers(4, 14)
        cols = (xx + np.arange(ln)) % size
        a[yy, cols] = np.maximum(a[yy, cols], RNG.uniform(0.25, 0.6))
    return mask(a)


def periodic_noise(size, scale, power=2.0):
    """Tileable smooth noise in 0..1 built in the frequency domain (wraps at the edges)."""
    f = np.fft.fftfreq(size)
    fx, fy = np.meshgrid(f, f)
    r = np.hypot(fx, fy)
    r[0, 0] = 1
    amp = 1 / (r * size / scale) ** power
    amp[0, 0] = 0
    phase = RNG.uniform(0, 2 * np.pi, (size, size))
    n = np.real(np.fft.ifft2(amp * np.exp(1j * phase)))
    n -= n.min()
    return n / n.max()


def grunge(size=256):
    big = periodic_noise(size, 6, 1.6)
    mid = periodic_noise(size, 24, 1.4)
    grain = RNG.random((size, size))
    a = np.clip((big * 0.6 + mid * 0.4 - 0.45) * 2.2, 0, 1) * 0.75
    a += (grain > 0.985) * 0.5            # flecks
    a += np.clip((mid - 0.78) * 4, 0, 1) * 0.35
    return mask(np.clip(a, 0, 1))


def hatch_pencil(size=64, lines=12):
    y, x = np.mgrid[0:size, 0:size] + 0.5
    period = size / lines
    d = ((x + y) % period) - period / 2
    a = np.zeros((size, size))
    for i in range(lines):
        w = RNG.uniform(0.7, 1.4)
        strength = RNG.uniform(0.55, 1.0)
        band = (((x + y) // period) % lines) == i
        a += band * np.clip(w - np.abs(d) + 0.5, 0, 1) * strength
    # pencil breaks along each stroke
    breaks = periodic_noise(size, 10, 1.2)
    a *= np.clip((breaks - 0.25) * 3, 0.15, 1)
    return mask(np.clip(a, 0, 1))


def _wobble(n, length, amp, k_max=6):
    t = np.arange(n) / n * 2 * np.pi
    w = np.zeros(n)
    for k in range(1, k_max + 1):
        w += RNG.uniform(-1, 1) * amp / k * np.sin(k * t * length / 256 * 1 + RNG.uniform(0, 6.28))
    return w


def sketch_h(width=256, height=8):
    y, x = np.mgrid[0:height, 0:width] + 0.5
    a = np.zeros((height, width))
    for passes, (amp, thick, alpha) in enumerate([(1.4, 1.5, 1.0), (2.0, 0.8, 0.6)]):
        centre = height / 2 + _wobble(width, width, amp)[None, :] + (passes * 0.8 - 0.4)
        th = thick + 0.5 * periodic_noise(width, 8, 1.0)[0][None, :]
        a = np.maximum(a, np.clip(th - np.abs(y - centre) + 0.5, 0, 1) * alpha)
    gaps = periodic_noise(width, 12, 1.0)[0][None, :]
    a *= np.clip((gaps - 0.12) * 4, 0.35, 1)
    return mask(a)


def tape_torn(width=256, height=40):
    y, x = np.mgrid[0:height, 0:width] + 0.5
    left = 5 + 4 * np.abs(np.sin(np.arange(height) * 1.7)) * RNG.uniform(0.4, 1.0, height)
    right = width - (5 + 4 * np.abs(np.sin(np.arange(height) * 2.3 + 1)) * RNG.uniform(0.4, 1.0, height))
    a = ((x >= left[:, None]) & (x <= right[:, None])).astype(float)
    mottle = periodic_noise(width, 10, 1.4)[:height, :width]
    a *= 0.86 + 0.14 * mottle
    return mask(a)


def stamp(size=160):
    y, x = np.mgrid[0:size, 0:size] + 0.5
    c = size / 2
    r = np.hypot(x - c, y - c)
    a = np.clip(4 - np.abs(r - 70) + 0.5, 0, 1) + np.clip(2 - np.abs(r - 60) + 0.5, 0, 1)
    a += np.clip(1.6 - np.abs(r - 34) + 0.5, 0, 1)
    # diamond core and two bars where a word would sit
    a += (np.abs(x - c) + np.abs(y - c) < 14)
    a += ((np.abs(y - (c - 24)) < 3) & (np.abs(x - c) < 26))
    a += ((np.abs(y - (c + 24)) < 3) & (np.abs(x - c) < 26))
    wear = periodic_noise(size, 9, 1.3)
    a = np.clip(a, 0, 1) * np.clip((wear - 0.22) * 3, 0, 1)
    return mask(a)


def marker(width=256, height=24):
    y, x = np.mgrid[0:height, 0:width] + 0.5
    t = x / width
    taper = np.clip(np.minimum(t / 0.06, (1 - t) / 0.12), 0, 1)
    centre = height / 2 + 1.5 * np.sin(t * 5.5) - 2 * t
    half = 7 * taper
    a = np.clip(half - np.abs(y - centre) + 0.5, 0, 1)
    streak = periodic_noise(width, 6, 1.0)[:height, :width]
    a *= 0.7 + 0.3 * np.clip(streak + 0.2, 0, 1)
    return mask(a)


def map_contours(size=512, levels=14):
    n = periodic_noise(size, 4, 2.2)
    v = n * levels
    frac = v - np.floor(v)
    gy, gx = np.gradient(v)
    g = np.hypot(gx, gy) + 1e-6
    dist = np.minimum(frac, 1 - frac) / g
    a = np.clip(1.1 - dist, 0, 1)
    coast = np.clip(1.6 - np.abs(v - levels * 0.5) / g, 0, 1)   # heavier "coastline"
    return mask(np.clip(a * 0.8 + coast, 0, 1))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", help="optional contact sheet path (scratch)")
    args = parser.parse_args()
    os.makedirs(OUT, exist_ok=True)
    sprites = {
        "blueprint-grid.png": blueprint_grid(),
        "rings.png": rings(),
        "hatch.png": hatch(),
        "paper-fibre.png": paper_fibre(),
        "grunge.png": grunge(),
        "hatch-pencil.png": hatch_pencil(),
        "sketch-h.png": sketch_h(),
        "tape-torn.png": tape_torn(),
        "stamp.png": stamp(),
        "marker.png": marker(),
        "map-contours.png": map_contours(),
    }
    sprites["sketch-v.png"] = sprites["sketch-h.png"].transpose(Image.Transpose.ROTATE_90)
    for name, img in sprites.items():
        img.save(os.path.join(OUT, name), optimize=True)
        print(os.path.join(OUT, name))
    if args.sheet:
        cell = 260
        cols = 6
        rows = (len(sprites) + cols - 1) // cols
        sheet = Image.new("RGBA", (cell * cols, cell * rows), (22, 33, 43, 255))
        for i, img in enumerate(sprites.values()):
            tile = img
            if img.width < 128 or img.height < 64:
                tile = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
                for ty in range(0, 256, img.height):
                    for tx in range(0, 256, img.width):
                        tile.alpha_composite(img, (tx, ty))
            if tile.width > 256 or tile.height > 256:
                tile = tile.crop((0, 0, min(256, tile.width), min(256, tile.height)))
            sheet.alpha_composite(tile, ((i % cols) * cell + 2, (i // cols) * cell + 2))
        sheet.save(args.sheet)
        print(args.sheet)


if __name__ == "__main__":
    main()
