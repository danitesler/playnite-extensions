"""Joyride's collage sprites. Pure white RGBA masks, tinted by brushes in XAML (OpacityMask) and in the previews (CSS mask).

Nothing here is traced from a game: every shape is built from rectangles, arcs and noise with fixed seeds.

Run:  python src/themes/Joyride/art/sprites.py
Writes src/Images/fx/:
  skyline.png   1200x320  night city skyline silhouette (towers, steps, antennas, a water tower), bottom-anchored
  windows.png   1200x320  the lit windows of that skyline (same canvas, so the two stack)
  bridge.png    1200x320  suspension bridge: two towers, main cable, hangers and deck
  palms.png      640x420  three palm silhouettes leaning in from the right, bottom-anchored
  hills.png     1200x240  two rolling ridges for the desert panel, bottom-anchored
  sun.png        256x256  a sun disc with a soft halo
  heli.png       240x120  a police helicopter silhouette with a searchlight beam
  car.png        480x150  a low two-door coupe in profile
  halftone.png    96x96   tileable print dots (8px pitch)
  sweep.png      256x64   a soft-edged white band for the press flash and the selection punch
  fx-sheet.png   contact sheet for review (art/, not shipped)
"""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "src" / "Images" / "fx"
SS = 3  # supersampling for the vector-ish silhouettes


def save_mask(alpha, name):
    """alpha: float array 0..1 or a PIL 'L' image."""
    if isinstance(alpha, Image.Image):
        a = np.asarray(alpha, dtype=np.float32) / 255.0
    else:
        a = alpha
    a = np.clip(a, 0, 1)
    img = np.zeros(a.shape + (4,), dtype=np.uint8)
    img[..., :3] = 255
    img[..., 3] = (a * 255).round().astype(np.uint8)
    im = Image.fromarray(img, "RGBA")
    im.save(OUT / name, optimize=True)
    return im


def canvas(w, h):
    im = Image.new("L", (w * SS, h * SS), 0)
    return im, ImageDraw.Draw(im)


def down(im, w, h):
    return im.resize((w, h), Image.LANCZOS)


def skyline():
    w, h = 1200, 320
    rng = np.random.default_rng(31)
    sil, d = canvas(w, h)
    win, dw = canvas(w, h)
    x = 0
    while x < w:
        bw = int(rng.integers(34, 96))
        tall = rng.random()
        bh = int(70 + (tall ** 1.6) * 220)
        if 420 < x < 640:  # a cluster of towers in the middle third
            bh = int(bh * 1.25 + 30)
        bh = min(bh, 300)
        top = h - bh
        d.rectangle([x * SS, top * SS, (x + bw) * SS, h * SS], fill=255)
        kind = rng.random()
        if kind < 0.25:  # stepped crown
            d.rectangle([(x + bw * 0.18) * SS, (top - 16) * SS, (x + bw * 0.82) * SS, top * SS], fill=255)
            d.rectangle([(x + bw * 0.34) * SS, (top - 30) * SS, (x + bw * 0.66) * SS, top * SS], fill=255)
        elif kind < 0.42:  # antenna
            ax = x + bw * 0.5
            d.rectangle([(ax - 1.5) * SS, (top - 46) * SS, (ax + 1.5) * SS, top * SS], fill=255)
            d.rectangle([(ax - 5) * SS, (top - 10) * SS, (ax + 5) * SS, top * SS], fill=255)
        elif kind < 0.52:  # spire
            d.polygon([((x + bw * 0.25) * SS, top * SS), ((x + bw * 0.5) * SS, (top - 54) * SS),
                       ((x + bw * 0.75) * SS, top * SS)], fill=255)
        elif kind < 0.62 and bh < 160:  # water tower on a low roof
            cx = x + bw * 0.5
            d.rectangle([(cx - 2 - 9) * SS, (top - 12) * SS, (cx - 9) * SS, top * SS], fill=255)
            d.rectangle([(cx + 9) * SS, (top - 12) * SS, (cx + 11) * SS, top * SS], fill=255)
            d.rectangle([(cx - 12) * SS, (top - 32) * SS, (cx + 12) * SS, (top - 12) * SS], fill=255)
            d.polygon([((cx - 14) * SS, (top - 32) * SS), (cx * SS, (top - 42) * SS), ((cx + 14) * SS, (top - 32) * SS)], fill=255)
        # windows: a grid, some lit
        cols = max(2, bw // 9)
        rows = max(3, bh // 12)
        for r in range(1, rows):
            for c in range(cols):
                if rng.random() < 0.22:
                    wx = x + 4 + c * ((bw - 8) / cols)
                    wy = top + 6 + r * ((bh - 10) / rows)
                    dw.rectangle([wx * SS, wy * SS, (wx + 3.2) * SS, (wy + 4.2) * SS], fill=255)
        x += bw + int(rng.integers(-6, 3))
    save_mask(down(sil, w, h), "skyline.png")
    save_mask(down(win, w, h), "windows.png")


def bridge():
    w, h = 1200, 320
    im, d = canvas(w, h)
    deck = 250
    towers = (300, 900)
    # deck and its truss band
    d.rectangle([0, deck * SS, w * SS, (deck + 10) * SS], fill=255)
    d.rectangle([0, (deck + 10) * SS, w * SS, (deck + 13) * SS], fill=140)
    for tx in towers:
        d.rectangle([(tx - 14) * SS, 40 * SS, (tx - 6) * SS, h * SS], fill=255)
        d.rectangle([(tx + 6) * SS, 40 * SS, (tx + 14) * SS, h * SS], fill=255)
        for yy in (52, 120, 190):
            d.rectangle([(tx - 14) * SS, yy * SS, (tx + 14) * SS, (yy + 7) * SS], fill=255)
    # main cable: parabolas between and beyond the towers
    def cable(x0, y0, x1, y1, sag):
        pts = []
        for i in range(121):
            t = i / 120
            xx = x0 + (x1 - x0) * t
            yy = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)
            pts.append((xx * SS, yy * SS))
        d.line(pts, fill=255, width=int(3 * SS))
        return pts
    spans = [(-60, 210, towers[0], 44, 60), (towers[0], 44, towers[1], 44, 175), (towers[1], 44, w + 60, 210, 60)]
    for x0, y0, x1, y1, sag in spans:
        pts = cable(x0, y0, x1, y1, sag)
        for i in range(0, len(pts), 6):
            px, py = pts[i]
            if py / SS < deck - 4:
                d.line([(px, py), (px, deck * SS)], fill=200, width=int(1.2 * SS))
    save_mask(down(im, w, h), "bridge.png")


def palm(d, base_x, base_y, height, lean, rng, scale=1.0):
    """Curved trunk of stacked rings, crown of tapered fronds."""
    pts = []
    n = 40
    for i in range(n + 1):
        t = i / n
        x = base_x + lean * (t ** 1.8) * height
        y = base_y - t * height
        pts.append((x, y))
    for i in range(n):
        t = i / n
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        wdt = (11 - 6 * t) * scale
        d.polygon([((x0 - wdt) * SS, y0 * SS), ((x0 + wdt) * SS, y0 * SS),
                   ((x1 + wdt * 0.94) * SS, y1 * SS), ((x1 - wdt * 0.94) * SS, y1 * SS)], fill=255)
        if i % 3 == 0:  # ring notches
            d.line([((x0 - wdt - 1) * SS, y0 * SS), ((x0 + wdt + 1) * SS, (y0 - 2) * SS)], fill=255, width=int(2 * SS))
    cx, cy = pts[-1]
    angles = [-170, -140, -112, -80, -55, -25, 5, 30, 160, 200]
    for a in angles:
        a = math.radians(a + rng.uniform(-8, 8))
        length = rng.uniform(70, 105) * scale
        droop = rng.uniform(0.35, 0.6)
        leaf = []
        m = 18
        for j in range(m + 1):
            t = j / m
            xx = cx + math.cos(a) * length * t
            yy = cy + math.sin(a) * length * t + droop * length * t * t
            leaf.append((xx, yy))
        upper, lower = [], []
        for j, (xx, yy) in enumerate(leaf):
            t = j / m
            wdt = (8 * math.sin(math.pi * min(1, t * 1.15)) + 1) * scale
            nx, ny = -math.sin(a), math.cos(a)
            upper.append(((xx + nx * wdt) * SS, (yy + ny * wdt) * SS))
            lower.append(((xx - nx * wdt) * SS, (yy - ny * wdt) * SS))
        d.polygon(upper + lower[::-1], fill=255)
        # serrated fringe: short strokes off the lower edge
        for j in range(3, m, 2):
            xx, yy = leaf[j]
            d.line([(xx * SS, yy * SS), ((xx + rng.uniform(-6, 6)) * SS, (yy + 12 * scale) * SS)], fill=255, width=int(2.2 * SS))
    d.ellipse([(cx - 9 * scale) * SS, (cy - 7 * scale) * SS, (cx + 9 * scale) * SS, (cy + 9 * scale) * SS], fill=255)


def palms():
    w, h = 640, 420
    rng = np.random.default_rng(7)
    im, d = canvas(w, h)
    palm(d, 560, h + 4, 330, -0.42, rng, 1.15)
    palm(d, 470, h + 4, 250, -0.30, rng, 0.95)
    palm(d, 610, h + 4, 190, -0.18, rng, 0.8)
    save_mask(down(im, w, h), "palms.png")


def hills():
    w, h = 1200, 240
    rng = np.random.default_rng(12)
    x = np.arange(w)
    far = 70 + 40 * np.sin(x / 170 + 1.2) + 26 * np.sin(x / 61 + 0.4) + 10 * np.sin(x / 23)
    near = 150 + 30 * np.sin(x / 210 + 2.6) + 14 * np.sin(x / 47 + 1.1) + 5 * np.sin(x / 13)
    yy = np.arange(h)[:, None]
    a = np.where(yy >= far[None, :], 0.55, 0.0)
    a = np.where(yy >= near[None, :], 1.0, a)
    # anti-alias the ridge lines
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)), dtype=np.float32) / 255
    save_mask(a, "hills.png")


def sun():
    s = 256
    y, x = np.mgrid[0:s, 0:s]
    r = np.hypot(x - s / 2 + 0.5, y - s / 2 + 0.5)
    disc = np.clip((70 - r) / 1.5 + 0.5, 0, 1)
    halo = np.exp(-((np.maximum(r - 60, 0)) / 34) ** 2) * 0.45
    save_mask(np.maximum(disc, halo), "sun.png")


def heli():
    w, h = 240, 120
    im, d = canvas(w, h)
    # searchlight beam (faint) first
    d.polygon([(70 * SS, 64 * SS), (10 * SS, 120 * SS), (120 * SS, 120 * SS)], fill=70)
    d.ellipse([60 * SS, 36 * SS, 132 * SS, 72 * SS], fill=255)  # cabin
    d.rectangle([118 * SS, 46 * SS, 214 * SS, 54 * SS], fill=255)  # tail boom
    d.polygon([(204 * SS, 30 * SS), (220 * SS, 30 * SS), (216 * SS, 54 * SS), (206 * SS, 54 * SS)], fill=255)  # fin
    d.rectangle([92 * SS, 24 * SS, 98 * SS, 38 * SS], fill=255)  # mast
    d.rectangle([20 * SS, 21 * SS, 176 * SS, 25 * SS], fill=255)  # rotor
    d.rectangle([70 * SS, 78 * SS, 126 * SS, 81 * SS], fill=255)  # skid
    d.rectangle([80 * SS, 70 * SS, 83 * SS, 79 * SS], fill=255)
    d.rectangle([112 * SS, 70 * SS, 115 * SS, 79 * SS], fill=255)
    save_mask(down(im, w, h), "heli.png")


def car():
    w, h = 480, 150
    im, d = canvas(w, h)
    body = [(18, 104), (30, 86), (120, 76), (178, 46), (300, 42), (364, 74), (444, 82), (466, 96), (462, 112), (20, 114)]
    d.polygon([(x * SS, y * SS) for x, y in body], fill=255)
    for cx in (118, 372):
        d.ellipse([(cx - 34) * SS, (112 - 34) * SS, (cx + 34) * SS, (112 + 34) * SS], fill=255)
    # glass cut-outs read as holes
    d.polygon([(x * SS, y * SS) for x, y in [(190, 54), (252, 50), (252, 76), (160, 78)]], fill=0)
    d.polygon([(x * SS, y * SS) for x, y in [(262, 50), (296, 50), (340, 76), (262, 76)]], fill=0)
    for cx in (118, 372):
        d.ellipse([(cx - 15) * SS, (112 - 15) * SS, (cx + 15) * SS, (112 + 15) * SS], fill=0)
    save_mask(down(im, w, h), "car.png")


def halftone():
    s, pitch = 96, 8
    y, x = np.mgrid[0:s, 0:s] + 0.5
    cx = (np.floor(x / pitch) + 0.5) * pitch
    cy = (np.floor(y / pitch) + 0.5) * pitch
    r = np.hypot(x - cx, y - cy)
    save_mask(np.clip((1.9 - r) + 0.5, 0, 1), "halftone.png")


def sweep():
    w, h = 256, 64
    x = np.linspace(-1, 1, w)[None, :]
    y = np.linspace(-1, 1, h)[:, None]
    band = np.exp(-(x / 0.32) ** 2) * np.clip(1.2 - np.abs(y) * 0.2, 0, 1)
    save_mask(np.broadcast_to(band, (h, w)).copy(), "sweep.png")


def contact():
    names = ["skyline", "windows", "bridge", "palms", "hills", "sun", "heli", "car", "halftone", "sweep"]
    tiles = []
    for n in names:
        im = Image.open(OUT / f"{n}.png")
        im.thumbnail((380, 160))
        tiles.append((n, im))
    cols, cw, ch = 3, 400, 190
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cw, rows * ch), (40, 30, 60))
    d = ImageDraw.Draw(sheet)
    for i, (n, im) in enumerate(tiles):
        x, y = (i % cols) * cw + 10, (i // cols) * ch + 22
        sheet.paste(Image.new("RGB", im.size, (250, 236, 200)), (x, y), im)
        d.text((x, y - 16), n, fill=(255, 255, 255))
    sheet.save(HERE / "fx-sheet.png")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    skyline()
    bridge()
    palms()
    hills()
    sun()
    heli()
    car()
    halftone()
    sweep()
    contact()
    print("wrote", sorted(p.name for p in OUT.glob("*.png")))
