#!/usr/bin/env python3
"""Light sprites for Questlog: src/Images/fx/*.png and the review sheet art/fx-sheet.png.

Deterministic (Pillow + numpy, no randomness). Every sprite is a white-RGB alpha mask: XAML fills a Rectangle with a
theme brush and uses the PNG as its OpacityMask, so ThemeModifier recolors the light. Nothing here is traced from
the client's textures; the shapes follow what the Vanilla client does with light:

  glow-frame.png  96x96   9-slice, 32px corners: a soft bloom outside a plate (Play bloom, hovered cover halo)
  slot-glow.png   64x64   stretched: UI-Common-MouseHilight / ButtonHilight-Square, the additive highlight that
                          brightens the inside of a slot or panel button toward its edges
  shine-h.png     96x12   tile in x: autocast sparkles (UI-AutoCastableOverlay, AutoCastTemplates.lua: 16 sparkles
                          that run round the button border), horizontal edges
  shine-v.png     12x96   the same for vertical edges
  flare.png       48x48   four-point glint, the item-slot twinkle
  glow-spot.png   128x128 round soft glow behind the quest marker of the empty page

  python art/fx.py     (from src/themes/Questlog)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images" / "fx"


def save(alpha, name):
    a = np.clip(alpha, 0, 1)
    h, w = a.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.round(a * 255).astype(np.uint8)
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(OUT / name, optimize=True)
    return a


def trunc_exp(d, end, rate):
    """1 at d=0, exactly 0 at d>=end."""
    tail = np.exp(-rate * end)
    return np.clip((np.exp(-rate * d) - tail) / (1 - tail), 0, 1)


def glow_frame(n=96, margin=32, radius=5, rate=0.19, peak=0.95):
    y, x = np.mgrid[0:n, 0:n] + 0.5
    lo, hi = margin, n - margin
    # signed distance to a rounded rect occupying the middle cell
    qx = np.abs(x - n / 2) - (hi - lo) / 2 + radius
    qy = np.abs(y - n / 2) - (hi - lo) / 2 + radius
    d = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - radius
    return peak * trunc_exp(np.maximum(d, 0), margin - 1, rate)


def slot_glow(n=64, depth=15, rate=0.22, peak=0.9):
    y, x = np.mgrid[0:n, 0:n] + 0.5
    d = np.minimum(np.minimum(x, n - x), np.minimum(y, n - y))
    return peak * trunc_exp(d, depth, rate)


def star(w, h, cx, cy, arm, thick, core, power=1.6):
    """Four-point glint: two tapering arms plus a round core."""
    y, x = np.mgrid[0:h, 0:w] + 0.5
    dx, dy = x - cx, y - cy
    horiz = np.exp(-(np.abs(dx) / arm) ** power * 2.2) * np.exp(-(dy / thick) ** 2)
    vert = np.exp(-(np.abs(dy) / arm) ** power * 2.2) * np.exp(-(dx / thick) ** 2)
    glow = np.exp(-(dx ** 2 + dy ** 2) / (2 * core ** 2))
    return np.clip(np.maximum(np.maximum(horiz, vert), glow), 0, 1)


def shine_h():
    w, h = 96, 12
    a = np.zeros((h, w))
    # three sparkles of different size and strength, kept clear of the tile edges so it tiles seamlessly
    for cx, arm, thick, core, s in ((14, 5.0, 0.7, 1.4, 0.95), (47, 4.0, 0.6, 1.1, 0.6), (78, 5.5, 0.75, 1.5, 0.8)):
        a = np.maximum(a, s * star(w, h, cx, 6, arm, thick, core))
    return a


def flare(n=48):
    return star(n, n, n / 2, n / 2, 20, 1.1, 2.6, power=1.35)


def glow_spot(n=128):
    y, x = np.mgrid[0:n, 0:n] + 0.5
    d = np.hypot(x - n / 2, y - n / 2) / (n / 2)
    return 0.9 * trunc_exp(np.clip(d, 0, 1), 1.0, 3.2)


def sheet(sprites):
    bg = (23, 20, 15)
    tints = {"glow-frame": (255, 209, 0), "slot-glow": (255, 209, 0), "shine-h": (242, 242, 82), "shine-v": (242, 242, 82),
             "flare": (255, 235, 150), "glow-spot": (255, 209, 0)}
    scale = {"glow-frame": 2, "slot-glow": 2, "shine-h": 3, "shine-v": 3, "flare": 3, "glow-spot": 1}
    pad = 16
    tiles = []
    for name, a in sprites.items():
        img = np.zeros(a.shape + (3,))
        img[:] = bg
        t = np.array(tints[name], dtype=float)
        img = img * (1 - a[..., None]) + t * a[..., None]
        im = Image.fromarray(img.astype(np.uint8), "RGB")
        s = scale[name]
        im = im.resize((im.width * s, im.height * s), Image.NEAREST)
        tiles.append((name, im))
    width = sum(i.width for _, i in tiles) + pad * (len(tiles) + 1)
    height = max(i.height for _, i in tiles) + pad * 2 + 16
    out = Image.new("RGB", (width, height), (13, 11, 8))
    d = ImageDraw.Draw(out)
    x = pad
    for name, im in tiles:
        out.paste(im, (x, pad + 14))
        d.text((x, pad), name, fill=(200, 200, 200))
        x += im.width + pad
    out.save(ROOT / "art" / "fx-sheet.png")


def main():
    sprites = {
        "glow-frame": save(glow_frame(), "glow-frame.png"),
        "slot-glow": save(slot_glow(), "slot-glow.png"),
    }
    h = shine_h()
    sprites["shine-h"] = save(h, "shine-h.png")
    sprites["shine-v"] = save(h.T.copy(), "shine-v.png")
    sprites["flare"] = save(flare(), "flare.png")
    sprites["glow-spot"] = save(glow_spot(), "glow-spot.png")
    sheet(sprites)


if __name__ == "__main__":
    main()
