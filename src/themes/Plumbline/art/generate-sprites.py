#!/usr/bin/env python3
"""Plumbline sprites. Deterministic: no randomness, no external input. Run with Pillow installed:

    python3 -I src/themes/Plumbline/art/generate-sprites.py

Every sprite is a white or black MASK with alpha (never a baked brand color): XAML fills it through an OpacityMask with
a theme brush, so ThemeModifier recolors it (docs/themes/reference.md -> Effects and motion). Output: src/Images/.
  facets.png        1280x720 translucent triangles of the menu field (frame, empty page, title band, settings backdrop)
  facets-rail.png   44x720 the same planes cut to the icon rail's width (a 44px slice of facets.png shows almost none)
  bloom.png         256x256 soft ring + halo for the Play disc hover (a lit ring just outside the disc)
  shadow-disc.png   128x128 soft drop shadow of a circle (black mask), lays 3px lower than the disc
  shadow-plate.png  48x48 9-slice drop shadow of a 6px rounded plate (black mask, slice 18)
  sheen.png         160x40 diagonal gloss streak that crosses a plate on hover
  gem-glow.png      96x96 radial halo under the running lozenge
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math

OUT = Path(__file__).resolve().parents[1] / "src" / "Images"
OUT.mkdir(parents=True, exist_ok=True)
S = 4  # supersample


def save(img, name):
    img.save(OUT / name, optimize=True)
    print("wrote", OUT / name, img.size)


def facets():
    w, h = 1280, 720
    img = Image.new("RGBA", (w * S, h * S), (255, 255, 255, 0))
    # (triangle, alpha 0-255). Large, overlapping, alternating apexes: the main menu's lit and shaded planes.
    tris = [
        (((0, 720), (430, 0), (880, 720)), 40),
        (((430, 0), (1010, 0), (880, 720)), 22),
        (((880, 720), (1280, 150), (1280, 720)), 46),
        (((560, 720), (1040, 0), (1280, 0)), 18),
        (((0, 300), (0, 720), (300, 720)), 30),
        (((1280, 0), (1280, 330), (980, 0)), 34),
    ]
    for pts, a in tris:
        layer = Image.new("RGBA", img.size, (255, 255, 255, 0))
        ImageDraw.Draw(layer).polygon([(x * S, y * S) for x, y in pts], fill=(255, 255, 255, a))
        img = Image.alpha_composite(img, layer)
    save(img.resize((w, h), Image.LANCZOS), "facets.png")


def facets_rail():
    w, h = 44, 720
    img = Image.new("RGBA", (w * S, h * S), (255, 255, 255, 0))
    tris = [
        (((0, 0), (44, 0), (0, 190)), 44),
        (((44, 110), (44, 430), (0, 300)), 34),
        (((0, 360), (44, 520), (0, 720)), 40),
        (((0, 560), (44, 440), (44, 720)), 24),
    ]
    for pts, a in tris:
        layer = Image.new("RGBA", img.size, (255, 255, 255, 0))
        ImageDraw.Draw(layer).polygon([(x * S, y * S) for x, y in pts], fill=(255, 255, 255, a))
        img = Image.alpha_composite(img, layer)
    save(img.resize((w, h), Image.LANCZOS), "facets-rail.png")


def bloom():
    n = 256
    img = Image.new("RGBA", (n, n))
    px = img.load()
    c = (n - 1) / 2
    for y in range(n):
        for x in range(n):
            r = math.hypot(x - c, y - c) / c  # 0 center, 1 edge
            ring = math.exp(-((r - 0.78) ** 2) / (2 * 0.07 ** 2))  # lit ring just outside a disc of radius .70
            halo = max(0.0, 1 - abs(r - 0.78) / 0.22) ** 2 * 0.0 + max(0.0, (1 - r) ** 2) * 0.22
            a = min(1.0, ring * 0.85 + halo)
            if r > 1:
                a = 0
            px[x, y] = (255, 255, 255, int(a * 255))
    save(img, "bloom.png")


def shadow_disc():
    n = 128
    img = Image.new("RGBA", (n * S, n * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = 26 * S
    d.ellipse([pad, pad, n * S - pad, n * S - pad], fill=(0, 0, 0, 120))
    img = img.filter(ImageFilter.GaussianBlur(7 * S)).resize((n, n), Image.LANCZOS)
    save(img, "shadow-disc.png")


def shadow_plate():
    n = 48
    img = Image.new("RGBA", (n * S, n * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = 14 * S
    d.rounded_rectangle([pad, pad, n * S - pad, n * S - pad], radius=6 * S, fill=(0, 0, 0, 110))
    img = img.filter(ImageFilter.GaussianBlur(4 * S)).resize((n, n), Image.LANCZOS)
    save(img, "shadow-plate.png")


def sheen():
    w, h = 160, 40
    img = Image.new("RGBA", (w, h))
    px = img.load()
    for y in range(h):
        for x in range(w):
            u = (x + (h - y) * 0.9) / (w + h * 0.9)  # diagonal coordinate
            a = max(0.0, 1 - abs(u - 0.5) / 0.16) ** 1.6
            px[x, y] = (255, 255, 255, int(a * 200))
    save(img, "sheen.png")


def gem_glow():
    n = 96
    img = Image.new("RGBA", (n, n))
    px = img.load()
    c = (n - 1) / 2
    for y in range(n):
        for x in range(n):
            r = math.hypot(x - c, (y - c) * 0.8) / c
            a = max(0.0, 1 - r) ** 2 * 0.9
            px[x, y] = (255, 255, 255, int(a * 255))
    save(img, "gem-glow.png")


if __name__ == "__main__":
    facets(); facets_rail(); bloom(); shadow_disc(); shadow_plate(); sheen(); gem_glow()
