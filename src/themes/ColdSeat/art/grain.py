"""Tileable rock grain for the Play plate and the secondary slabs (src/Images/fx/grain.png): a white mask whose alpha is
blotchy stone mottling (three octaves of wrapped value noise) with fine speckle and a few dark pits. Isotropic, so it reads
as rough stone, never as wood grain. Colored in XAML through an OpacityMask. Fixed seed: reruns give the same file.
Run from the theme folder: python art/grain.py"""
import numpy as np
from PIL import Image

rng = np.random.default_rng(1403)
N = 128


def octave(cells):
    base = rng.random((cells, cells))
    # wrapped bilinear upsample so the tile repeats seamlessly
    xs = np.linspace(0, cells, N, endpoint=False)
    x0 = np.floor(xs).astype(int) % cells
    x1 = (x0 + 1) % cells
    t = xs - np.floor(xs)
    t = t * t * (3 - 2 * t)
    rows = base[x0] * (1 - t)[:, None] + base[x1] * t[:, None]
    return rows[:, x0] * (1 - t)[None, :] + rows[:, x1] * t[None, :]


mottle = 0.5 * octave(4) + 0.3 * octave(9) + 0.2 * octave(21)
speck = rng.random((N, N))
pits = (rng.random((N, N)) > 0.985).astype(float)
v = 0.62 * mottle + 0.38 * speck
v = (v - v.min()) / (v.max() - v.min())
alpha = np.clip((v - 0.28) * 1.7, 0, 1)
alpha = np.clip(alpha + pits * 0.5, 0, 1)
a = (alpha * 255).astype(np.uint8)
img = np.dstack([np.full((N, N), 255, np.uint8)] * 3 + [a])
Image.fromarray(img, "RGBA").save("src/Images/fx/grain.png")
print("wrote src/Images/fx/grain.png")
