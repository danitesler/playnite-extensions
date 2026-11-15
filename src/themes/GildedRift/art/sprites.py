#!/usr/bin/env python3
"""Gilded Rift sprites: white masks with alpha, deterministic (no random, no time).

The XAML fills each sprite with a theme brush through an OpacityMask, so ThemeModifier edits reach them.
Run from the repo root:  python3 src/themes/GildedRift/art/sprites.py
Needs Pillow only. Output: src/themes/GildedRift/src/Images/fx/

  rays.png   512x512  victory-banner burst: 24 tapered rays fading outward from a soft core (empty game page)
  glow.png   256x256  soft round bloom, smooth falloff (crystal core, Play bloom, running mark)
  spark.png  128x128  four-point glint with a hot centre (Play shine, cover corner glints)
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "Images", "fx")
os.makedirs(OUT, exist_ok=True)
SS = 4  # supersample


def finish(img, size, blur):
    img = img.resize((size, size), Image.LANCZOS)
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    return img


def rays(size=512, count=24):
    s = size * SS
    cx = cy = s / 2
    layer = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(layer)
    for i in range(count):
        a = 2 * math.pi * i / count
        long_ray = i % 2 == 0
        length = s * (0.49 if long_ray else 0.33)
        half = math.radians(3.4 if long_ray else 2.3)
        p = [
            (cx + math.cos(a - half) * s * 0.035, cy + math.sin(a - half) * s * 0.035),
            (cx + math.cos(a) * length, cy + math.sin(a) * length),
            (cx + math.cos(a + half) * s * 0.035, cy + math.sin(a + half) * s * 0.035),
        ]
        d.polygon(p, fill=255)
    # radial fade: opaque near the core, transparent at the rim
    fade = Image.new("L", (s, s), 0)
    px = fade.load()
    for y in range(0, s, 1):
        for x in range(0, s, 1):
            r = math.hypot(x - cx, y - cy) / (s / 2)
            v = max(0.0, 1.0 - r) ** 1.35
            px[x, y] = int(255 * v)
    alpha = Image.composite(layer, Image.new("L", (s, s), 0), layer)
    alpha = Image.eval(alpha, lambda v: v)  # keep
    a_small = finish(alpha, size, 0.8)
    f_small = finish(fade, size, 0)
    out = Image.new("L", (size, size), 0)
    pa, pf, po = a_small.load(), f_small.load(), out.load()
    for y in range(size):
        for x in range(size):
            po[x, y] = int(pa[x, y] * pf[x, y] / 255)
    # soft core on top
    core = glow(size, 0.16, 1.0)
    pc = core.getchannel("A").load()
    for y in range(size):
        for x in range(size):
            po[x, y] = min(255, po[x, y] + pc[x, y] // 2)
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    img.putalpha(out)
    return img


def glow(size=256, radius=0.5, gain=1.0):
    img = Image.new("L", (size, size), 0)
    px = img.load()
    c = (size - 1) / 2
    for y in range(size):
        for x in range(size):
            r = math.hypot(x - c, y - c) / (size / 2)
            # smooth gaussian-like falloff, zero at the rim
            v = math.exp(-((r / max(radius, 1e-3)) ** 2) * 2.2) * max(0.0, 1.0 - r ** 6)
            px[x, y] = int(255 * min(1.0, v * gain))
    out = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    out.putalpha(img)
    return out


def spark(size=128):
    s = size * SS
    c = s / 2
    layer = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(layer)
    long, thin = s * 0.49, s * 0.018
    d.polygon([(c - long, c), (c, c - thin), (c + long, c), (c, c + thin)], fill=255)
    d.polygon([(c, c - long), (c + thin, c), (c, c + long), (c - thin, c)], fill=255)
    layer = layer.filter(ImageFilter.GaussianBlur(SS * 0.6))
    hot = Image.new("L", (s, s), 0)
    hd = ImageDraw.Draw(hot)
    hd.ellipse([c - s * 0.07, c - s * 0.07, c + s * 0.07, c + s * 0.07], fill=255)
    hot = hot.filter(ImageFilter.GaussianBlur(SS * 3))
    merged = Image.new("L", (s, s), 0)
    pm, pl, ph = merged.load(), layer.load(), hot.load()
    for y in range(s):
        for x in range(s):
            pm[x, y] = min(255, pl[x, y] + ph[x, y])
    small = merged.resize((size, size), Image.LANCZOS)
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    img.putalpha(small)
    return img


if __name__ == "__main__":
    rays().save(os.path.join(OUT, "rays.png"), optimize=True)
    glow().save(os.path.join(OUT, "glow.png"), optimize=True)
    spark().save(os.path.join(OUT, "spark.png"), optimize=True)
    for n in ("rays.png", "glow.png", "spark.png"):
        p = os.path.join(OUT, n)
        print(n, os.path.getsize(p) // 1024, "KB")
