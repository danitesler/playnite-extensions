#!/usr/bin/env python3
"""Cold Seat surface textures (neutral tint in RGB, texture in alpha). Deterministic: one fixed seed, no clock.
    python art/textures.py [sheet.png]      (from src/themes/ColdSeat; needs Pillow and numpy)
Writes src/Images/fx/*.png. The optional argument is where the review sheet goes (a scratch folder, never the repo).

The game's iron, stone and ice are painted BLP art that cannot be copied; these are original, procedural stand-ins that
carry the same materials. Unlike the glow sprites (white masks) these are neutral tints (black shade, pale iron, frost)
drawn as a plain ImageBrush Fill, never as an OpacityMask: they sit behind hover animations (top bar, rail, game page) and
a masked layer behind an animated control leaves dark rectangles on scaled displays (docs/themes/reference.md, Effects and
motion). Because they only shade whatever is under them, ThemeModifier recolors the surface and the texture follows.
The opacity of the Rectangle that hosts one is its strength.

  mottle.png      256x256 tile  cast-iron mottling: blotchy value noise, long horizontal hammer streaks and sparse pits.
                                Black tint: darkens an iron band unevenly instead of leaving it flat.
  scratch.png     256x256 tile  wear on iron: hairline scratches within 14 degrees of horizontal and bright specks.
                                Pale iron tint.
  flagstone.png   256x256 tile  cut slabs: periodic Voronoi seams as 1px lit lines plus a per-slab value and fine pitting.
                                Pale stone tint: at a few percent opacity it turns the void into a stone floor.
  frost-corner.png 192x192      frost growing out of the top-left corner: three stems (the diagonal and both edges), side
                                branches at 55 degrees, a second order of twigs, fine crystal dust and a soft haze that
                                fades with distance. Mirror it for the other corners.
  rime.png        256x22 tile   rime fringe along an edge: a bright 2px line and hanging crystal spikes of mixed length
                                (tiles in x). Flip it vertically to grow upward from a bottom edge.
  rivets.png      48x12 tile    one domed rivet per tile, lit from the top left (alpha = how bright the dome is).
"""
import math, pathlib, sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images" / "fx"
RNG = np.random.default_rng(1403)


TINT = {"mottle.png": (4, 4, 7), "scratch.png": (132, 134, 150), "flagstone.png": (104, 106, 122),
        "frost-corner.png": (196, 224, 248), "rime.png": (196, 224, 248), "rivets.png": (150, 152, 168)}


def save(alpha, name):
    h, w = alpha.shape
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[..., :3] = np.array(TINT[name], np.uint8)
    rgba[..., 3] = np.clip(np.round(alpha * 255), 0, 255).astype(np.uint8)
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(OUT / name)
    return name, rgba


def smooth(a, lo, hi):
    t = np.clip((a - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def pnoise(n, sx, sy=None, rng=RNG):
    """Periodic Gaussian-filtered noise, scaled to 0..1. sx, sy are the blur widths in pixels."""
    sy = sx if sy is None else sy
    f = rng.standard_normal((n, n))
    fx = np.fft.fftfreq(n)[None, :]
    fy = np.fft.fftfreq(n)[:, None]
    g = np.exp(-2 * (math.pi ** 2) * ((sx * fx) ** 2 + (sy * fy) ** 2))
    v = np.real(np.fft.ifft2(np.fft.fft2(f) * g))
    v -= v.min()
    return v / v.max()


def wrap_draw(draw_fn, n, ss, margin):
    """Draws with draw_fn(draw, ox, oy) at the nine wrapped offsets of an n*ss canvas so strokes tile seamlessly."""
    img = Image.new("L", (n * ss, n * ss), 0)
    d = ImageDraw.Draw(img)
    for ox in (-n, 0, n):
        for oy in (-n, 0, n):
            draw_fn(d, ox * ss, oy * ss)
    return np.asarray(img.resize((n, n), Image.LANCZOS), np.float64) / 255.0


def mottle():
    n = 256
    blot = 0.5 * pnoise(n, 24) + 0.32 * pnoise(n, 8) + 0.18 * pnoise(n, 2.5)
    blot = (blot - blot.min()) / (blot.max() - blot.min())
    streak = pnoise(n, 46, 1.1)  # hammer marks: long in x, thin in y
    a = 0.50 * smooth(blot, 0.38, 0.92) + 0.22 * smooth(streak, 0.45, 0.95)
    pits = np.zeros((n, n))
    ys, xs = np.mgrid[:n, :n]
    for _ in range(46):
        cx, cy, r = RNG.integers(0, n), RNG.integers(0, n), RNG.uniform(0.7, 1.7)
        dx = np.minimum(abs(xs - cx), n - abs(xs - cx))
        dy = np.minimum(abs(ys - cy), n - abs(ys - cy))
        pits = np.maximum(pits, np.clip(1.2 - np.hypot(dx, dy) / r, 0, 1) * RNG.uniform(0.6, 1.0))
    return save(np.clip(np.maximum(a, pits * 0.95), 0, 1), "mottle.png")


def scratch():
    n, ss = 256, 4
    lines = []
    for _ in range(70):
        x, y = RNG.uniform(0, n), RNG.uniform(0, n)
        ang = math.radians(RNG.uniform(-14, 14) + (0 if RNG.random() < 0.85 else 90))
        ln = RNG.uniform(14, 90)
        lines.append((x, y, ang, ln, int(RNG.uniform(70, 210))))
    specks = [(RNG.uniform(0, n), RNG.uniform(0, n), int(RNG.uniform(120, 255))) for _ in range(90)]

    def draw(d, ox, oy):
        for x, y, ang, ln, v in lines:
            d.line([(ox + x * ss, oy + y * ss), (ox + (x + ln * math.cos(ang)) * ss, oy + (y + ln * math.sin(ang)) * ss)],
                   fill=v, width=max(1, int(0.9 * ss)))
        for x, y, v in specks:
            d.ellipse([ox + (x - 0.7) * ss, oy + (y - 0.7) * ss, ox + (x + 0.7) * ss, oy + (y + 0.7) * ss], fill=v)
    return save(wrap_draw(draw, n, ss, 0) * 0.9, "scratch.png")


def flagstone():
    n, rows = 256, 4
    rh = n // rows
    # domain warp so courses and joints wander a little instead of ruling straight lines
    wx = (pnoise(n, 14) - 0.5) * 9
    wy = (pnoise(n, 14) - 0.5) * 6
    ys, xs = np.mgrid[:n, :n].astype(np.float64)
    u = (xs + wx) % n
    v = (ys + wy) % n
    row = np.floor(v / rh).astype(int) % rows
    block = np.zeros((n, n), int)
    value = {}
    nid = 0
    for r in range(rows):
        cuts, x = [], RNG.uniform(0, 60)
        while x < n + 60:
            cuts.append(x)
            x += RNG.uniform(52, 100)
        cuts = np.array(cuts)
        # blocks wrap: joints are taken modulo n, the last block closes on the first
        k = np.clip(np.searchsorted(cuts, u, side="right") - 1, 0, len(cuts) - 1)
        sel = row == r
        block[sel] = (nid + k)[sel]
        for i in range(len(cuts)):
            value[nid + i] = RNG.uniform(0.10, 0.26)
        nid += len(cuts)
    face_v = np.vectorize(lambda b: value[b])(block)
    top = (row != np.roll(row, 1, axis=0)) | (block != np.roll(block, 1, axis=0))      # course joint, lit
    left = block != np.roll(block, 1, axis=1)                                             # head joint, lit
    joint = np.maximum(top.astype(float), left.astype(float))
    joint = np.clip(joint + 0.55 * np.maximum(np.roll(joint, 1, axis=0), np.roll(joint, 1, axis=1)), 0, 1)
    face = face_v * (0.5 + 0.5 * pnoise(n, 7)) + 0.14 * pnoise(n, 1.7)
    chips = (RNG.random((n, n)) > 0.988) * 0.55
    a = np.maximum(joint * 0.8, face * (1 - joint))
    return save(np.clip(a + chips, 0, 1), "flagstone.png")


def frost_corner():
    n, ss = 192, 4
    img = Image.new("L", (n * ss, n * ss), 0)
    d = ImageDraw.Draw(img)

    def line(x0, y0, x1, y1, w, v=255):
        d.line([(x0 * ss, y0 * ss), (x1 * ss, y1 * ss)], fill=v, width=max(1, int(w * ss)))

    def stem(x, y, ang, length, width, order):
        step = 2.4
        pos = 0.0
        side = 1
        px, py = x, y
        wob = 0.0
        while pos < length:
            wob += RNG.uniform(-0.05, 0.05)
            wob *= 0.9
            ang += wob * 0.2
            nx, ny = px + step * math.cos(ang), py + step * math.sin(ang)
            t = pos / length
            line(px, py, nx, ny, width * (1 - 0.7 * t), int(255 * (1 - 0.35 * t)))
            pos += step
            if order < 3 and pos > 8 and int(pos / step) % (3 if order == 0 else 2) == 0:
                bl = length * (0.27 if order == 0 else 0.42) * (1 - 0.75 * t)
                if bl > 4:
                    stem(nx, ny, ang + side * math.radians(52 + RNG.uniform(-6, 6)), bl, width * 0.72, order + 1)
                side = -side
            px, py = nx, ny

    stem(0, 0, math.radians(45), 190, 1.9, 0)
    stem(0, 1, math.radians(2), 168, 1.5, 0)
    stem(1, 0, math.radians(88), 168, 1.5, 0)
    stem(0, 0, math.radians(24), 120, 1.3, 0)
    stem(0, 0, math.radians(66), 120, 1.3, 0)
    a = np.asarray(img.resize((n, n), Image.LANCZOS), np.float64) / 255.0
    ys, xs = np.mgrid[:n, :n].astype(np.float64) + 0.5
    dist = np.hypot(xs, ys)
    fall = np.clip(1 - dist / 215, 0, 1) ** 0.55
    haze = 0.20 * np.clip(1 - dist / 105, 0, 1) ** 1.8 * (0.6 + 0.4 * pnoise(n, 5))
    dust = (RNG.random((n, n)) > 0.955) * RNG.uniform(0.4, 1.0, (n, n)) * np.clip(1 - dist / 120, 0, 1) ** 1.2
    return save(np.clip(a * fall + haze + dust * 0.8, 0, 1), "frost-corner.png")


def rime():
    w, h, ss = 256, 22, 4
    img = Image.new("L", (w * ss, h * ss), 0)
    d = ImageDraw.Draw(img)
    pos = 0.0
    spikes = []
    while pos < w:
        wd = RNG.uniform(1.6, 6.0)
        ln = RNG.uniform(3, 19) if RNG.random() < 0.7 else RNG.uniform(2, 7)
        spikes.append((pos + wd / 2, wd, ln))
        pos += wd * RNG.uniform(0.55, 1.5)
    scale = w / pos
    for cx, wd, ln in spikes:
        cx *= scale
        for ox in (-w, 0, w):
            x = (cx + ox) * ss
            d.polygon([(x - wd * scale * ss / 2, 2 * ss), (x + wd * scale * ss / 2, 2 * ss), (x + RNG.uniform(-0.6, 0.6) * ss, (2 + ln) * ss)], fill=235)
    a = np.asarray(img.resize((w, h), Image.LANCZOS), np.float64) / 255.0
    ys = np.arange(h)[:, None].astype(np.float64)
    a *= (1 - 0.55 * np.clip((ys - 2) / 19, 0, 1))      # tips thinner and fainter than roots
    a[:2, :] = np.maximum(a[:2, :], 0.55 + 0.35 * pnoise(w, 3)[0][None, :])   # bright rim line
    return save(np.clip(a, 0, 1), "rime.png")


def rivets():
    w, h = 48, 12
    ys, xs = np.mgrid[:h, :w].astype(np.float64) + 0.5
    cx, cy, r = w / 2, h / 2, 3.2
    dx, dy = xs - cx, ys - cy
    dist = np.hypot(dx, dy)
    cover = np.clip(r + 0.5 - dist, 0, 1)
    light = np.clip(0.55 - 0.5 * (dx + dy) / (2 * r), 0.25, 1.0)   # lit from the top left
    spec = 0.6 * np.exp(-(((dx + 1.0) ** 2 + (dy + 1.0) ** 2) / 1.2))
    return save(np.clip(cover * np.clip(light + spec, 0, 1), 0, 1), "rivets.png")


def sheet(items, path):
    pad = 12
    img = Image.new("RGBA", (1100, 560), (6, 7, 12, 255))
    x, y = pad, pad
    for name, rgba in items:
        im = Image.fromarray(rgba, "RGBA")
        base = Image.new("RGBA", im.size, (34, 34, 37, 255) if name in ("mottle.png", "scratch.png") else (6, 7, 12, 255))
        base.alpha_composite(im)
        k = 4 if im.width <= 64 else 1
        big = base.resize((im.width * k, im.height * k), Image.NEAREST)
        if x + big.width > img.width - pad:
            x, y = pad, y + 270
        img.alpha_composite(big, (x, y))
        x += big.width + pad
    img.save(path)


if __name__ == "__main__":
    items = [mottle(), scratch(), flagstone(), frost_corner(), rime(), rivets()]
    if len(sys.argv) > 1:
        sheet(items, sys.argv[1])
    print("wrote", [n for n, _ in items])
