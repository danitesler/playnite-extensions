"""Draws src/Images/fx/*.png: the light and smoke Attache's interactive layer is built from, plus art/fx-sheet.png.

Original artwork from seeded noise and closed-form falloffs; no game files. Every sprite is white (RGB 255) with the
effect in alpha, so XAML fills a Rectangle with a theme brush and uses the PNG as OpacityMask (ThemeModifier recolors
them). Deterministic: fixed seeds, no clock. Run from anywhere: python art/fx.py   (needs Pillow and numpy)

sheen   192x48  one soft skewed band of light, the glint that crosses a brushed pewter plate (Play, cover buttons).
smoke   512x128 seamless in both axes: long horizontal wisps like the plate's smoke texture, drifted while hovered and
                in the empty game page. Tile 512px wide, scale to the host's height.
halo    128x128 soft round falloff, the glow behind the empty-page case and under a lit cover button.
"""
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "src" / "Images" / "fx"
SHEET = Path(__file__).resolve().parent / "fx-sheet.png"


def smooth(t):
    return t * t * (3 - 2 * t)


def tile_noise(w, h, cx, cy, rng):
    """Value noise that wraps in both axes: cx by cy random cells, smoothstep blended."""
    grid = rng.random((cy, cx))
    gx = np.arange(w) / w * cx
    gy = np.arange(h) / h * cy
    ix, iy = np.floor(gx).astype(int), np.floor(gy).astype(int)
    fx, fy = smooth(gx - ix)[None, :], smooth(gy - iy)[:, None]
    ix0, ix1 = ix % cx, (ix + 1) % cx
    iy0, iy1 = iy % cy, (iy + 1) % cy
    a = grid[iy0][:, ix0] * (1 - fx) + grid[iy0][:, ix1] * fx
    b = grid[iy1][:, ix0] * (1 - fx) + grid[iy1][:, ix1] * fx
    return a * (1 - fy) + b * fy


def save(name, alpha):
    a = np.clip(alpha, 0, 1)
    px = np.zeros(a.shape + (4,), dtype=np.uint8)
    px[..., :3] = 255
    px[..., 3] = np.round(a * 255).astype(np.uint8)
    Image.fromarray(px, "RGBA").save(OUT / name, optimize=True)
    return px


def sheen():
    w, h = 192, 48
    y, x = np.mgrid[0:h, 0:w].astype(float)
    u = (x - w / 2) - (y - h / 2) * 0.8          # skewed distance from the band's centre line
    band = np.exp(-(u / 15.0) ** 2)
    core = np.exp(-(u / 4.5) ** 2)
    return save("sheen.png", 0.55 * band + 0.45 * core)


def smoke():
    w, h = 512, 128
    rng = np.random.default_rng(4)
    v = (tile_noise(w, h, 8, 2, rng) * 0.5 + tile_noise(w, h, 24, 4, rng) * 0.32
         + tile_noise(w, h, 64, 8, rng) * 0.18)
    v = np.clip((v - 0.38) / 0.62, 0, 1)
    return save("smoke.png", v ** 1.7 * 0.9)


def halo():
    n = 128
    y, x = np.mgrid[0:n, 0:n].astype(float)
    d = np.hypot(x - (n - 1) / 2, y - (n - 1) / 2) / (n / 2)
    tail = np.exp(-4.0)
    f = np.clip((np.exp(-4.0 * d) - tail) / (1 - tail), 0, 1)
    return save("halo.png", f ** 1.2)


def sheet(px):
    names = list(px)
    W = 560
    H = sum(p.shape[0] + 24 for p in px.values()) + 16
    img = Image.new("RGB", (W, H), (16, 17, 15))
    y = 12
    for name in names:
        p = px[name]
        tint = np.zeros(p.shape[:2] + (3,), dtype=float)
        tint[:] = (216, 205, 186)
        a = p[..., 3:4] / 255.0
        rgb = (tint * a + np.array([29, 29, 27]) * (1 - a)).astype(np.uint8)
        img.paste(Image.fromarray(rgb, "RGB"), (12, y))
        y += p.shape[0] + 24
    img.save(SHEET, optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    made = {"sheen": sheen(), "smoke": smoke(), "halo": halo()}
    sheet(made)
    for k, p in made.items():
        a = p[..., 3]
        print(k, p.shape[1], "x", p.shape[0], "edge alpha max",
              int(max(a[0].max(), a[-1].max(), a[:, 0].max(), a[:, -1].max())))
