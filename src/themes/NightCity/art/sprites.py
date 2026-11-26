#!/usr/bin/env python3
"""Night City sprite generator -> src/Images/fx/*.png

Every sprite is a white mask (alpha only). The XAML paints it with a theme brush through an OpacityMask
(src/Common.xaml, LocalNc*Mask), so ThemeModifier recolours it, and the HTML previews do the same with a CSS mask.

  corner-body.png   360x120 corner mark: a chamfered 1px frame with three ruled lines (painted red)
  corner-edge.png   its tick scale and bracket (painted cyan)
  corner-accent.png its commit bar and two pips (painted yellow)
  rail-foot.png     44x220 foot of the icon rail: circuit trace, hex cells, tick ruler, barcode
  topbar-trace.png  460x52 circuit run and tick ruler for the right end of the top bar
  hex-mesh.png     90x104 seamless hex lattice for the library backdrop
  circuit-vein.png  380x260 corner of traces, vias and a chip footprint (Settings, grid side panel)

Run: python art/sprites.py   (needs Pillow and numpy). Seeded, so the output is stable.
"""
import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "src", "Images", "fx")
SS = 2  # supersample: draw at 2x, downsample for clean 1px edges


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def save_mask(arr, name):
    """arr: float 0..1 (h, w) -> white RGBA PNG with that alpha."""
    a = np.clip(arr, 0, 1)
    h, w = a.shape
    img = np.zeros((h, w, 4), dtype=np.uint8)
    img[..., :3] = 255
    img[..., 3] = (a * 255 + 0.5).astype(np.uint8)
    Image.fromarray(img, "RGBA").save(os.path.join(OUT, name), optimize=True)
    print("wrote", name, w, "x", h)


def down(im):
    w, h = im.size
    return np.asarray(im.resize((w // SS, h // SS), Image.LANCZOS), dtype=np.float32) / 255.0


class Canvas:
    """A 2x supersampled L-mode canvas addressed in 1x coordinates."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        self.im = Image.new("L", (w * SS, h * SS), 0)
        self.d = ImageDraw.Draw(self.im)

    def _p(self, pts):
        return [(x * SS, y * SS) for x, y in pts]

    def rect(self, x0, y0, x1, y1, v=255):
        self.d.rectangle([x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1], fill=v)

    def poly(self, pts, v=255):
        self.d.polygon(self._p(pts), fill=v)

    def line(self, pts, width=1.0, v=255):
        self.d.line(self._p(pts), fill=v, width=max(1, int(round(width * SS))), joint="curve")

    def ring(self, cx, cy, r, width=1.0, v=255):
        self.d.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], outline=v, width=max(1, int(round(width * SS))))

    def disc(self, cx, cy, r, v=255):
        self.d.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=v)

    def arr(self):
        return down(self.im)


# ----------------------------------------------------------------------------------------------------------------------
# Corner mark: one small chamfered frame with ruled lines, a tick scale and a bracket. Thin lines only, no fills.
# ----------------------------------------------------------------------------------------------------------------------
SW, SH = 360, 120


def build_corner():
    body = Canvas(SW, SH)
    edge = Canvas(SW, SH)
    accent = Canvas(SW, SH)
    # frame: chamfered top-left, 1px
    fx0, fy0, fx1, fy1, cut = 150, 26, 348, 106, 20
    frame = [(fx0 + cut, fy0), (fx1, fy0), (fx1, fy1), (fx0, fy1), (fx0, fy0 + cut)]
    body.line(frame + [frame[0]], 1.0)
    # ruled lines inside, decreasing
    for i, ln in enumerate([96, 70, 44]):
        body.rect(fx0 + 16, fy0 + 30 + i * 10, fx0 + 16 + ln, fy0 + 31 + i * 10, 200 - i * 40)
    # tick scale on the left of the frame (cyan)
    for i in range(9):
        y = 34 + i * 8
        edge.rect(130 if i % 4 else 124, y, 140, y + 1, 255 if i % 4 == 0 else 150)
    # bracket at the top right (cyan)
    edge.line([(fx1 - 18, fy0 - 10), (fx1 + 0, fy0 - 10), (fx1 + 0, fy0 - 28 + 18)], 1.0, 200)
    # commit bar on the chamfer edge and two pips (yellow)
    accent.rect(fx0 + cut + 8, fy0 - 1, fx0 + cut + 36, fy0 + 2)
    accent.rect(fx1 - 22, fy1 - 14, fx1 - 18, fy1 - 10)
    accent.rect(fx1 - 14, fy1 - 14, fx1 - 10, fy1 - 10)
    save_mask(body.arr(), "corner-body.png")
    save_mask(edge.arr(), "corner-edge.png")
    save_mask(accent.arr(), "corner-accent.png")


# ----------------------------------------------------------------------------------------------------------------------
# Rail foot
# ----------------------------------------------------------------------------------------------------------------------
def hexagon(cx, cy, r):
    return [(cx + r * math.cos(math.radians(60 * i)), cy + r * math.sin(math.radians(60 * i))) for i in range(6)]


def build_rail_foot():
    w, h = 44, 220
    c = Canvas(w, h)
    # circuit trace down the left, with a 45 degree jog and a via
    c.line([(6, 20), (6, 118), (12, 124), (12, 176)], 1.2)
    c.ring(6, 20, 2.4, 1.0)
    c.ring(12, 176, 3.0, 1.2)
    c.disc(12, 176, 1.0)
    c.rect(4, 70, 9, 72)  # trace pad
    # hex cells
    c.line(hexagon(28, 96, 7) + [hexagon(28, 96, 7)[0]], 1.0)
    c.poly(hexagon(28, 96, 3.2))
    c.line(hexagon(22, 109, 7) + [hexagon(22, 109, 7)[0]], 1.0)
    c.line(hexagon(34, 109, 7) + [hexagon(34, 109, 7)[0]], 1.0, 150)
    # tick ruler on the right edge
    for i, y in enumerate(range(42, 176, 6)):
        c.rect(40 if i % 5 else 37, y, 43, y + 1, 255 if i % 5 == 0 else 150)
    # chevrons
    for k in range(3):
        y = 140 + k * 6
        c.line([(18, y), (22, y + 3), (18, y + 6)], 1.1, 255 - k * 70)
    # barcode
    rng = random.Random(44)
    x = 18
    while x < 38:
        bw = rng.choice([1, 1, 2, 3])
        c.rect(x, 186, x + bw, 206)
        x += bw + rng.choice([1, 2])
    c.rect(18, 209, 38, 210, 200)
    arr = c.arr()
    ys = np.arange(h)[:, None]
    ramp = np.vectorize(lambda v: smooth(v / 56.0))(ys)  # fades in from the top
    save_mask(arr * ramp, "rail-foot.png")


# ----------------------------------------------------------------------------------------------------------------------
# Top bar trace
# ----------------------------------------------------------------------------------------------------------------------
def build_topbar_trace():
    w, h = 460, 52
    c = Canvas(w, h)
    # main run, right to left, with a 45 degree step up
    c.line([(452, 26), (352, 26), (340, 14), (262, 14)], 1.2)
    c.ring(352, 26, 2.6, 1.0)
    c.ring(262, 14, 3.0, 1.2)
    c.disc(262, 14, 1.0)
    # second run with a square pad
    c.line([(452, 38), (396, 38), (388, 30), (372, 30)], 1.0, 190)
    c.rect(366, 27, 372, 33)
    # short stub
    c.line([(452, 12), (420, 12)], 1.0, 150)
    c.disc(420, 12, 1.6)
    # tick ruler along the foot
    for i, x in enumerate(range(150, 452, 8)):
        tall = (i % 4 == 0)
        c.rect(x, 52 - (7 if tall else 4), x + 1, 51, 255 if tall else 140)
    # chevrons
    for k in range(3):
        x = 200 + k * 7
        c.line([(x, 20), (x + 4, 24), (x, 28)], 1.1, 255 - k * 75)
    arr = c.arr()
    xs = np.arange(w)[None, :]
    ramp = np.vectorize(lambda v: smooth((v - 60) / 190.0))(xs)
    save_mask(arr * ramp, "topbar-trace.png")


# ----------------------------------------------------------------------------------------------------------------------
# Hex mesh (seamless)
# ----------------------------------------------------------------------------------------------------------------------
def build_hex_mesh():
    r = 30
    tw, th = 90, 104  # 3r x 2*sqrt(3)*r (103.92)
    big = Canvas(tw * 3, th * 3)
    dx, dy = 1.5 * r, math.sqrt(3) * r
    for i in range(-2, 8):
        for j in range(-2, 8):
            cx = i * dx
            cy = j * dy + (dy / 2 if i % 2 else 0)
            pts = hexagon(cx, cy, r)  # neighbours share edges, so each edge is drawn once (twice, on top of itself)
            big.line(pts + [pts[0]], 1.0, 255)
    arr = big.arr()
    tile = arr[th: th * 2, tw: tw * 2]
    save_mask(tile, "hex-mesh.png")


# ----------------------------------------------------------------------------------------------------------------------
# Circuit vein
# ----------------------------------------------------------------------------------------------------------------------
def build_circuit_vein():
    w, h = 380, 260
    c = Canvas(w, h)
    # traces enter from the right edge and the top edge
    c.line([(380, 34), (300, 34), (284, 50), (200, 50), (186, 64), (186, 120)], 1.4)
    c.ring(186, 124, 3.2, 1.2)
    c.line([(380, 78), (336, 78), (322, 92), (322, 170), (306, 186), (250, 186)], 1.2, 210)
    c.rect(244, 183, 250, 189)
    c.line([(380, 118), (352, 118)], 1.0, 160)
    c.disc(352, 118, 1.8)
    c.line([(332, 0), (332, 20), (318, 34)], 1.2, 220)
    c.line([(250, 0), (250, 22), (240, 32), (214, 32)], 1.0, 170)
    c.ring(214, 32, 2.6, 1.0)
    # chip footprint: outline, pin ticks, inner mark
    c.rect(258, 196, 346, 198)
    c.rect(258, 238, 346, 240)
    c.rect(258, 196, 260, 240)
    c.rect(344, 196, 346, 240)
    for k in range(7):
        c.rect(262 + k * 12, 190, 264 + k * 12, 196, 190)
        c.rect(262 + k * 12, 240, 264 + k * 12, 246, 190)
    c.poly([(266, 204), (278, 204), (266, 216)], 200)
    c.rect(290, 214, 330, 216, 150)
    c.rect(290, 222, 316, 224, 150)
    # vias scattered along the main run
    for (x, y) in [(300, 34), (284, 50), (200, 50)]:
        c.disc(x, y, 1.7)
    arr = c.arr()
    xs = np.arange(w)[None, :]
    ys = np.arange(h)[:, None]
    rx = np.vectorize(lambda v: smooth((v - 40) / 160.0))(xs)
    ry = np.vectorize(lambda v: 1.0 - smooth((v - 236) / 24.0))(ys)  # only the last rows soften, the chip stays whole
    save_mask(arr * rx * ry, "circuit-vein.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    build_corner()
    build_rail_foot()
    build_topbar_trace()
    build_hex_mesh()
    build_circuit_vein()
