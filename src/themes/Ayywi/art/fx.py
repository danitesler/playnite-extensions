#!/usr/bin/env python3
"""Generates the one effect sprite of Ayywi: src/Images/fx/glow.png and the review sheet art/fx-sheet.png.

ayywi has a glow token for its primary button: shadow.glow = 0 0 18px at 18 percent of the glow color. A CSS box shadow
is a gaussian blur (sigma = blur / 2 = 9px) of the box, drawn outside the border box only. This script renders that
falloff for a rounded box (radius 12 = radius-control) as a white mask: alpha = 0.5 * erfc(s / (sigma * sqrt 2)) outside
the box edge (s = distance outside, 0.5 at the edge), 0 inside. The theme fills it with a brush through OpacityMask and
9-slices it (corners 36px = 24px of bloom + the 12px radius, middle 24px), so the host sits at Margin -24 around the button.

    python art/fx.py          (from src/themes/Ayywi; needs Pillow and numpy)

No randomness. Not shipped in the package.
"""
import pathlib
from math import erfc, sqrt

import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images" / "fx"
SIZE, EDGE, RADIUS, SIGMA = 96, 24, 12, 9.0


def glow():
    y, x = np.mgrid[:SIZE, :SIZE]
    half = SIZE / 2 - EDGE
    qx = np.abs(x + 0.5 - SIZE / 2) - (half - RADIUS)
    qy = np.abs(y + 0.5 - SIZE / 2) - (half - RADIUS)
    s = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - RADIUS
    alpha = 0.5 * np.vectorize(erfc)(np.maximum(s, 0) / (SIGMA * sqrt(2)))
    alpha[s < 0] = 0
    return alpha


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    a = np.rint(np.clip(glow(), 0, 1) * 255).astype(np.uint8)
    rgba = np.full((SIZE, SIZE, 4), 255, dtype=np.uint8)
    rgba[:, :, 3] = a
    sprite = Image.fromarray(rgba)
    sprite.save(OUT / "glow.png", optimize=True)

    # Review sheet on the page color: the sprite at 1x and 2x, and a 160x72 button with the 9-sliced halo around it.
    sheet = Image.new("RGBA", (560, 220), (0, 0, 0, 255))
    sheet.alpha_composite(sprite, (16, 16))
    sheet.alpha_composite(sprite.resize((192, 192), Image.NEAREST), (130, 14))
    w, h = 160, 72
    halo = Image.new("RGBA", (w + 48, h + 48), (0, 0, 0, 0))
    cuts = [0, 36, SIZE - 36, SIZE]
    xs = [0, 36, w + 48 - 36, w + 48]
    ys = [0, 36, h + 48 - 36, h + 48]
    for j in range(3):
        for i in range(3):
            piece = sprite.crop((cuts[i], cuts[j], cuts[i + 1], cuts[j + 1]))
            piece = piece.resize((xs[i + 1] - xs[i], ys[j + 1] - ys[j]), Image.BILINEAR)
            halo.alpha_composite(piece, (xs[i], ys[j]))
    ImageDraw.Draw(halo).rounded_rectangle((24, 24, 24 + w - 1, 24 + h - 1), radius=RADIUS, fill=(255, 255, 255, 255))
    sheet.alpha_composite(halo, (340, 14))
    sheet.save(ROOT / "art" / "fx-sheet.png")
    print("edge alpha %.3f, corner-cell max %.3f" % (a[48, 23] / 255, a[:36, :36].max() / 255))


if __name__ == "__main__":
    main()
