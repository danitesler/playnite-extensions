"""Draws src/Images/fx/*.png: the pixel sprites Biome's interactive layer is built from, plus art/fx-sheet.png.

Original pixel art (nothing from the game's files), all drawn on whole pixels and saved at 2x so one art pixel is two
screen pixels, like the game's UI at 2x. White RGB with the shape in alpha: XAML fills a Rectangle with a theme brush and
uses the PNG as OpacityMask (ThemeModifier recolors them); the host Rectangle must be exactly the PNG size (or a whole
multiple) so the pixels stay square. Deterministic: fixed seeds. Run from anywhere: python art/fx.py (Pillow, numpy)

sparkle  22x22  a four-point star on an 11x11 art grid: the glint on a fallen star; hovered Play and covers twinkle with it.
star     44x44  the same star at 4x, the empty game page's fallen star.
shine    64x40  a hard-edged 45 degree band in two tones, crossed over the Play plate in pixel steps.
stars-a  256x160 sparse pixel stars (1 and plus shaped) in three alpha tiers, seamless, one half of the twinkle.
stars-b  256x160 the other half; the empty page blinks A and B against each other in steps.
"""
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "src" / "Images" / "fx"
SHEET = Path(__file__).resolve().parent / "fx-sheet.png"


def to_rgba(alpha):
    a = np.clip(alpha, 0, 255).astype(np.uint8)
    px = np.zeros(a.shape + (4,), dtype=np.uint8)
    px[..., :3] = 255
    px[..., 3] = a
    return px


def upscale(a, k):
    return np.kron(a, np.ones((k, k)))


def star_art():
    """11x11: a centre, arms of 5 with the alpha stepping down, and a 2px diagonal sparkle at the centre."""
    a = np.zeros((11, 11))
    c = 5
    a[c, c] = 255
    for i, v in enumerate((255, 255, 190, 120, 70), start=1):
        for dx, dy in ((i, 0), (-i, 0), (0, i), (0, -i)):
            a[c + dy, c + dx] = v
    for dx, dy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
        a[c + dy, c + dx] = 130
    return a


def shine():
    """32x20 art grid, 2x. A band 5 art pixels wide at 45 degrees: a bright core with a dimmer fringe."""
    h, w = 20, 32
    a = np.zeros((h, w))
    for y in range(h):
        for x in range(w):
            d = x - (w // 2 + (h // 2 - y))   # distance from the centre line x + y = const
            if abs(d) <= 1:
                a[y, x] = 255
            elif abs(d) <= 3:
                a[y, x] = 110
    return a


def starfield(seed, count):
    """128x80 art grid (seamless: stars are placed with wrap-around), 2x -> 256x160."""
    rng = np.random.default_rng(seed)
    h, w = 80, 128
    a = np.zeros((h, w))
    for _ in range(count):
        x, y = int(rng.integers(0, w)), int(rng.integers(0, h))
        tier = rng.choice([90, 160, 255], p=[0.5, 0.35, 0.15])
        a[y, x] = tier
        if tier == 255 and rng.random() < 0.6:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                a[(y + dy) % h, (x + dx) % w] = 110
    return a


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    made = {
        "sparkle": to_rgba(upscale(star_art(), 2)),
        "star": to_rgba(upscale(star_art(), 4)),
        "shine": to_rgba(upscale(shine(), 2)),
        "stars-a": to_rgba(upscale(starfield(11, 70), 2)),
        "stars-b": to_rgba(upscale(starfield(23, 70), 2)),
    }
    for name, px in made.items():
        Image.fromarray(px, "RGBA").save(OUT / f"{name}.png", optimize=True)
        print(name, px.shape[1], "x", px.shape[0])
    # Review sheet: colored (gold on sky), deliberately not a runtime mask.
    W = 620
    sheet = Image.new("RGB", (W, 520), (11, 16, 48))
    x, y = 12, 12
    for name, px in made.items():
        a = px[..., 3:4] / 255.0
        rgb = (np.array([255, 215, 0]) * a + np.array([33, 43, 79]) * (1 - a)).astype(np.uint8)
        if x + px.shape[1] > W - 12:
            x, y = 12, y + 180
        sheet.paste(Image.fromarray(rgb, "RGB"), (x, y))
        x += px.shape[1] + 16
    sheet.save(SHEET, optimize=True)


if __name__ == "__main__":
    main()
