#!/usr/bin/env python3
"""Cold Seat effect sprites (white RGB, effect in alpha). Deterministic; no randomness.

    python art/sprites.py          (from src/themes/ColdSeat; needs Pillow and numpy)

Writes src/Images/fx/*.png and art/fx-sheet.png (review sheet, not shipped). XAML fills a Rectangle with a theme brush and
uses the sprite as OpacityMask, so ThemeModifier recolors every effect.

  glow-frame.png  128x128  9-slice bloom ring (slices 44 / 40 / 44): alpha 0.55 at the rectangle edge falling off over
                           30px outward and 12px inward. The Frozen Throne menu's button highlight is an additive light
                           texture over the plate edge; this is its scalable form.
  highlight.png   64x32    the lit top of a stone plate: alpha 0.60 at the top row, falling to 0 by 60 percent of the height,
                           with a faint 0.12 floor on the left and right edges. Filled with a light brush it reads as the
                           additive highlight texture the game blends over a hovered button.
  glint.png       64x64    four-point frost glint: a 1px-bright core, a long vertical arm and a shorter horizontal arm
                           (power-law falloff), plus a soft 6px core halo.
  flake.png       24x24    six-arm snowflake with two side branches per arm, 1.2px strokes, antialiased by 4x supersampling.
"""
import math, pathlib
import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images" / "fx"


def save(alpha, name):
    h, w = alpha.shape
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.clip(np.round(alpha * 255), 0, 255).astype(np.uint8)
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(OUT / name)
    return rgba


def falloff(d, length):
    t = np.clip(d / length, 0, 1)
    return (1 - t) ** 2.4


def glow_frame():
    y, x = np.mgrid[:128, :128].astype(np.float64) + 0.5
    qx, qy = np.abs(x - 64) - 32, np.abs(y - 64) - 32
    s = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0)
    return save(np.where(s >= 0, 0.55 * falloff(np.maximum(s, 0), 30), 0.55 * falloff(np.maximum(-s, 0), 12)), "glow-frame.png")


def highlight():
    h, w = 32, 64
    y = (np.arange(h) + 0.5) / h
    x = (np.arange(w) + 0.5) / w
    top = 0.60 * (1 - np.clip(y / 0.6, 0, 1)) ** 1.6
    edge = 0.12 * np.maximum(1 - np.minimum(x, 1 - x) / 0.06, 0)
    a = np.maximum(top[:, None], edge[None, :] * (1 - y[:, None]))
    return save(a, "highlight.png")


def glint():
    n = 64
    y, x = np.mgrid[:n, :n].astype(np.float64) + 0.5
    dx, dy = np.abs(x - n / 2), np.abs(y - n / 2)
    vert = np.exp(-(dx / 1.1) ** 1.2) * (1 - np.clip(dy / 31, 0, 1)) ** 2.2
    horz = np.exp(-(dy / 1.1) ** 1.2) * (1 - np.clip(dx / 21, 0, 1)) ** 2.2 * 0.8
    halo = 0.55 * np.exp(-((dx ** 2 + dy ** 2) / (2 * 3.2 ** 2)))
    return save(np.clip(np.maximum(np.maximum(vert, horz), halo), 0, 1), "glint.png")


def flake():
    n, ss = 24, 4
    img = Image.new("L", (n * ss, n * ss), 0)
    d = ImageDraw.Draw(img)
    c = n * ss / 2
    R = 10.5 * ss
    for k in range(6):
        a = math.radians(60 * k - 90)
        ex, ey = c + R * math.cos(a), c + R * math.sin(a)
        d.line([(c, c), (ex, ey)], fill=255, width=int(1.2 * ss))
        for f in (0.48, 0.74):
            bx, by = c + R * f * math.cos(a), c + R * f * math.sin(a)
            for s in (-1, 1):
                b = a + s * math.radians(55)
                L = R * (0.30 if f < 0.6 else 0.20)
                d.line([(bx, by), (bx + L * math.cos(b), by + L * math.sin(b))], fill=255, width=int(1.2 * ss))
    a = np.asarray(img.resize((n, n), Image.LANCZOS), np.float64) / 255.0
    return save(np.clip(a, 0, 1), "flake.png")


def sheet(items):
    img = Image.new("RGBA", (640, 200), (5, 8, 15, 255))
    x = 12
    for name, rgba in items:
        im = Image.fromarray(rgba, "RGBA")
        col = Image.new("RGBA", im.size, (191, 230, 255, 255)) if name != "highlight.png" else Image.new("RGBA", im.size, (252, 211, 18, 255))
        col.putalpha(im.getchannel("A"))
        k = 2 if im.width >= 64 else 4
        big = col.resize((im.width * k, im.height * k), Image.NEAREST)
        img.alpha_composite(big, (x, 12)); x += big.width + 14
    img.save(ROOT / "art" / "fx-sheet.png")


if __name__ == "__main__":
    items = [("glow-frame.png", glow_frame()), ("highlight.png", highlight()), ("glint.png", glint()), ("flake.png", flake())]
    sheet(items)
    print("wrote", [n for n, _ in items])
