"""Libertalia fx sprites: deterministic white RGBA masks (Pillow and numpy only).

smudge 256x64: the feathered smudge of warm light behind a selected row in the Uncharted 4 menus (captures on
  interfaceingame.com: brightest at the left edge, fading out to the right over the row's width, soft top and
  bottom, a dry-brush grain at its edges). Profile measured from those captures: full strength for the first 12%,
  then a smoothstep falloff to zero at the right edge (^1.3); vertical softness over the outer 65% of the half
  height; streak noise (blurred along x) lifts and eats the edges by +-25%. Seed 4104.
compass-rose 256x256: an engraved compass bezel for the empty game page: a 2px outer ring and a 1px inner ring,
  64 ticks (every 4th longer, the cardinals longest), outlined four-point and four-point rose and a small centre
  circle. Drawn at 4x and reduced, so the 1px lines stay soft.
fx-sheet.png: review sheet (tinted, not a runtime mask).

Run: python art/fx.py
"""

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
S = 4


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def gaussian_kernel(sigma):
    r = max(1, int(sigma * 3))
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    return k / k.sum()


def blur(a, sx, sy):
    out = a
    if sx:
        k = gaussian_kernel(sx)
        out = np.apply_along_axis(lambda row: np.convolve(np.pad(row, len(k) // 2, mode="reflect"), k, mode="valid"), 1, out)
    if sy:
        k = gaussian_kernel(sy)
        out = np.apply_along_axis(lambda col: np.convolve(np.pad(col, len(k) // 2, mode="reflect"), k, mode="valid"), 0, out)
    return out


def smudge():
    w, h = 256, 64
    x = (np.arange(w) + 0.5) / w
    y = np.abs((np.arange(h) + 0.5) / h * 2 - 1)
    horiz = np.where(x < 0.12, 1.0, (1 - smoothstep(0.12, 1.0, x)) ** 1.3)
    vert = 1 - smoothstep(0.35, 1.0, y)
    rng = np.random.default_rng(4104)
    noise = blur(rng.random((h, w)), 18, 1.4)
    noise = (noise - noise.min()) / (noise.max() - noise.min())
    a = horiz[None, :] * np.clip(vert[:, None] + (noise - 0.5) * 0.5, 0, 1)
    # keep the left edge crisp (the row starts there) and the right edge exactly zero
    a *= smoothstep(0, 3 / w, x)[None, :] * 0 + 1
    a[:, -2:] = 0
    return a


def compass_rose():
    size = 256 * S
    img = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(img)
    c = size / 2

    def ring(r, width):
        d.ellipse((c - r * S, c - r * S, c + r * S, c + r * S), outline=255, width=round(width * S))

    def line(p, q, width):
        d.line([(c + p[0] * S, c + p[1] * S), (c + q[0] * S, c + q[1] * S)], fill=255, width=round(width * S))

    ring(122, 2)
    ring(108, 1)
    for i in range(64):
        ang = i * 2 * math.pi / 64
        u = (math.sin(ang), -math.cos(ang))
        if i % 16 == 0:
            r0, wd = 96, 2
        elif i % 4 == 0:
            r0, wd = 100, 1.4
        else:
            r0, wd = 103, 1
        line((u[0] * r0, u[1] * r0), (u[0] * 108, u[1] * 108), wd)
    ring(40, 1)
    ring(6, 1)

    def pointer(angle, length, half):
        ang = math.radians(angle)
        u = (math.sin(ang), -math.cos(ang))
        v = (-u[1], u[0])
        tip = (u[0] * length, u[1] * length)
        mid = (u[0] * length * 0.28, u[1] * length * 0.28)
        l = (mid[0] + v[0] * half, mid[1] + v[1] * half)
        r = (mid[0] - v[0] * half, mid[1] - v[1] * half)
        for p, q in ((tip, l), (l, (0, 0)), ((0, 0), r), (r, tip)):
            line(p, q, 1.2)

    for a in (0, 90, 180, 270):
        pointer(a, 94, 13)
    for a in (45, 135, 225, 315):
        pointer(a, 60, 9)
    small = np.asarray(img.resize((256, 256), Image.Resampling.LANCZOS), dtype=float) / 255
    return small


def main():
    folder = ROOT / "src/Images/fx"
    folder.mkdir(parents=True, exist_ok=True)
    sprites = []
    for name, render in (("smudge", smudge), ("compass-rose", compass_rose)):
        alpha = np.rint(np.clip(render(), 0, 1) * 255).astype(np.uint8)
        rgba = np.full((*alpha.shape, 4), 255, dtype=np.uint8)
        rgba[:, :, 3] = alpha
        img = Image.fromarray(rgba)
        path = folder / (name + ".png")
        img.save(path, optimize=True)
        sprites.append((path, img))
    sheet = Image.new("RGBA", (304, 424), "#000000")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=12)
    for (path, img), (x, y) in zip(sprites, ((16, 16), (16, 112))):
        tint = Image.new("RGBA", img.size, "#F0E6C6")
        tint.putalpha(img.getchannel("A"))
        sheet.alpha_composite(tint, (x, y))
        draw.text((x, y + img.height + 6), f"{path.name} {img.width}x{img.height}", font=font, fill="#7b725e")
    sheet.save(ROOT / "art/fx-sheet.png", optimize=True)
    for path, img in sprites:
        print(f"{path.relative_to(ROOT).as_posix()}: {img.width} x {img.height}, {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
