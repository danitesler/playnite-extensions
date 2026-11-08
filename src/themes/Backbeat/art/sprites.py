#!/usr/bin/env python3
"""Backbeat effect sprites. Deterministic: run from anywhere, writes ../src/Images/fx and art/fx-sheet.png.

Every sprite is a white alpha mask (RGB 255), colored in XAML by filling a Rectangle with a theme brush and using the
PNG as OpacityMask, so ThemeModifier edits recolor it. Nothing here is taken from any game: dots and streaks are plain
geometry. Also prints the comic burst outline that Media.xaml keeps as the IconBurst geometry.
"""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

SS = 4  # supersampling factor
ART = Path(__file__).resolve().parent
OUT = ART.parent / "src" / "Images" / "fx"
OUT.mkdir(parents=True, exist_ok=True)


def to_mask(alpha):
    """Downsample an L image into a white RGBA mask."""
    small = alpha.resize((alpha.width // SS, alpha.height // SS), Image.LANCZOS)
    rgba = Image.new("RGBA", small.size, (255, 255, 255, 0))
    rgba.putalpha(small)
    return rgba


def halftone(width, height, pitch, r_max, falloff, gamma=1.15):
    """Dots on a 45-degree lattice; falloff(u, v) in 0..1 sets each dot's size (u, v are 0..1 across the sprite)."""
    alpha = Image.new("L", (width * SS, height * SS), 0)
    draw = ImageDraw.Draw(alpha)
    step = pitch / math.sqrt(2)
    rows = int(height / step) + 3
    cols = int(width / pitch) + 3
    for row in range(-1, rows):
        y = row * step
        offset = (pitch / 2) if row % 2 else 0
        for col in range(-1, cols):
            x = col * pitch + offset
            strength = max(0.0, min(1.0, falloff(x / width, y / height)))
            radius = r_max * strength ** gamma
            if radius < 0.35:
                continue
            draw.ellipse(
                [(x - radius) * SS, (y - radius) * SS, (x + radius) * SS, (y + radius) * SS],
                fill=255,
            )
    return to_mask(alpha)


def from_top_right(u, v):
    """Largest in the top-right corner, gone by the opposite diagonal."""
    return 1.0 - math.hypot((1.0 - u) * 0.82, v * 0.95)


def from_bottom(u, v):
    """Largest at the bottom edge, gone at the top."""
    return max(0.0, v) ** 1.2


def speedlines(width, height, count, seed):
    """Tapered horizontal streaks that wrap across the tile's x edge."""
    rng = np.random.default_rng(seed)
    alpha = Image.new("L", (width * SS, height * SS), 0)
    draw = ImageDraw.Draw(alpha)
    for _ in range(count):
        length = float(rng.uniform(70, 190))
        x = float(rng.uniform(0, width))
        y = float(rng.uniform(4, height - 4))
        half = float(rng.uniform(0.7, 1.9))
        for dx in (-width, 0, width):
            x0 = x + dx
            draw.polygon(
                [
                    (x0 * SS, y * SS),
                    ((x0 + length * 0.18) * SS, (y - half) * SS),
                    ((x0 + length) * SS, y * SS),
                    ((x0 + length * 0.18) * SS, (y + half) * SS),
                ],
                fill=255,
            )
    return to_mask(alpha)


def burst_path(points=14, outer=124.0, inner=84.0, seed=7, center=128.0):
    """A jagged comic impact star in a 256 box, slightly irregular so it reads hand-cut."""
    rng = np.random.default_rng(seed)
    pts = []
    for i in range(points * 2):
        angle = math.tau * i / (points * 2) - math.pi / 2
        angle += float(rng.uniform(-0.035, 0.035))
        base = outer if i % 2 == 0 else inner
        radius = base * float(rng.uniform(0.9, 1.0))
        pts.append((center + radius * math.cos(angle), center + radius * math.sin(angle)))
    head = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    tail = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts[1:])
    return f"F1 {head} L{tail}Z"


SPRITES = {
    "halftone-wide.png": halftone(420, 120, 13, 5.6, from_top_right),
    "halftone-card.png": halftone(180, 100, 11, 4.7, from_top_right),
    "halftone-rail.png": halftone(44, 150, 11, 4.6, from_bottom),
    "speedlines.png": speedlines(512, 40, 26, 20230125),
}

for name, image in SPRITES.items():
    image.save(OUT / name, optimize=True)

# Review sheet: every mask in paper white on the theme's plum.
sheet = Image.new("RGB", (980, 300), (43, 22, 72))
x = 16
for name, image in SPRITES.items():
    sheet.paste(image, (x, 16), image)
    x += image.width + 16
sheet.save(ART / "fx-sheet.png", optimize=True)

print(burst_path())
