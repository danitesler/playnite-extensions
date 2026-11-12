#!/usr/bin/env python3
"""Hallowtide sprite generator. Deterministic (fixed seed). Writes white-mask PNGs (RGB 255, the drawing in alpha)
to src/Images/fx/ and a contact sheet to art/fx-sheet.png.

XAML fills a Rectangle with a theme brush and uses a sprite as its OpacityMask, so ThemeModifier recolours every
ornament. Sprites are authored at 2 px per DIP and saved at 192 dpi, so WPF sees DIP sizes and sharpens on scaled
displays. 9-slice sprites keep their four corners fixed and tile their edges: edge functions are periodic in the tile
width, so the seam never shows.

    python art/sprites.py

Sprites (DIP sizes in brackets, slices as corner+tile+corner):
  rope-frame.png    [120x120  36+48+36]  hand-inked rope border: outer and inner wobbly line with twist ticks
  plate-torn.png    [ 72x 72  20+32+20]  solid plate with torn edges (play plate, notices)
  plate-ink.png     [ 64x 64  16+32+16]  brush-stroke plate with dry-brush ends (rows, chips, buttons)
  glow-frame.png    [128x128  44+40+44]  soft bloom frame (lantern light behind a plate)
  thorn-tile.png    [ 48x 14]            wavy thorn rule, seamless horizontally
  spiral-pair.png   [ 76x 18]            double spiral flourish with a leaf between
  spiral-mark.png   [ 16x 16]            single spiral, the settings list's selection mark
  serpent-ribbon.png[360x 44]            bark ribbon ending in a serpent head biting it (page header)
  serpent-ribbon-l.png                   mirrored copy
  mote.png          [ 16x 16]            soft firefly dot
  ink-blot.png      [ 48x 48]            irregular ink blot (round buttons)
  pin-head.png      [ 20x 20]            wax pin head: highlight crescent mask (shading only)
"""
import math
import os
import random
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "src", "Images", "fx"))
os.makedirs(OUT, exist_ok=True)

PX = 2      # pixels per DIP in the saved sprite
SS = 4      # supersampling for drawing
S = PX * SS # drawing pixels per DIP
DPI = 96 * PX


def rng(seed):
    return random.Random(seed)


def save(mask, name):
    """mask: float array 0..1 (H, W) at PX px per DIP."""
    a = (np.clip(mask, 0, 1) * 255).astype(np.uint8)
    img = Image.new("RGBA", (a.shape[1], a.shape[0]), (255, 255, 255, 0))
    img.putalpha(Image.fromarray(a, "L"))
    img.save(os.path.join(OUT, name), dpi=(DPI, DPI), optimize=True)
    return img


def down(img_l):
    """Supersampled L image -> float mask at PX px per DIP."""
    w, h = img_l.size
    small = img_l.resize((w // SS, h // SS), Image.LANCZOS)
    return np.asarray(small, dtype=np.float32) / 255.0


def canvas(w_dip, h_dip):
    return Image.new("L", (int(w_dip * S), int(h_dip * S)), 0)


def periodic_noise(period, seed, octaves=((1, 1.0), (2, 0.55), (4, 0.3)), zero_at_ends=False):
    """A function f(x) periodic in `period`, mean 0, roughly in [-1, 1]."""
    r = rng(seed)
    terms = [(k, a, r.uniform(0, 2 * math.pi)) for k, a in octaves]

    def f(x):
        v = 0.0
        for k, a, ph in terms:
            if zero_at_ends:
                v += a * math.sin(2 * math.pi * k * x / period)
            else:
                v += a * math.sin(2 * math.pi * k * x / period + ph)
        return v / sum(a for _, a, _ in terms)

    return f


def stamp(draw, pts, width_fn, step=0.25):
    """Round brush along a polyline (DIP points). width_fn(t in 0..1) -> width in DIP."""
    seg = [(math.dist(pts[i], pts[i + 1])) for i in range(len(pts) - 1)]
    total = sum(seg)
    if total == 0:
        return
    done = 0.0
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        n = max(1, int(seg[i] / step))
        for j in range(n + 1):
            u = j / n
            x, y = x0 + (x1 - x0) * u, y0 + (y1 - y0) * u
            t = (done + seg[i] * u) / total
            r = max(0.05, width_fn(t) / 2) * S
            draw.ellipse((x * S - r, y * S - r, x * S + r, y * S + r), fill=255)
        done += seg[i]


# ---------------------------------------------------------------- rope frame

def rope_frame():
    W = H = 120
    C, T = 36, 48                         # corner and tile (DIP)
    wob_outer = periodic_noise(T, 11, zero_at_ends=True)
    wob_inner = periodic_noise(T, 12, zero_at_ends=True)
    OUTER, INNER = 4.0, 13.0              # line offsets from the sprite edge
    R_OUT, R_IN = 17.0, 8.0               # corner radii of the two lines
    img = canvas(W, H)
    d = ImageDraw.Draw(img)

    def tl_path(offset, radius, wob, amp):
        """Top-left quarter of the frame line: left edge going up, arc, top edge going right (DIP points)."""
        pts = []
        # left edge, from the tile end (y = C + T) up to the corner start (y = C), x = offset + wob(y)
        for i in range(0, 241):
            y = C + T - (T + 0.0) * i / 240.0
            pts.append((offset + amp * wob(y - C), y))
        # corner arc from (offset, C) to (C, offset), centre (C, C)
        cx = cy = C
        rr = C - offset
        for i in range(1, 91):
            a = math.pi + (math.pi / 2) * i / 90.0
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
        for i in range(1, 241):
            x = C + T * i / 240.0
            pts.append((x, offset + amp * wob(x - C)))
        return pts

    # tick marks: slanted bridges between outer and inner lines, one per 12 DIP along the tile and the arc
    def ticks_top(draw_):
        for k in range(0, 5):
            x = C + 6 + k * 12 + 0.0
            draw_.line((x * S, (OUTER + 0.8) * S, (x + 3.4) * S, (INNER - 0.8) * S), fill=255, width=int(2.0 * S))

    # draw top-left corner + both edges as stamps, then mirror/rotate into the full sprite
    quarter = canvas(C + T, C + T)
    qd = ImageDraw.Draw(quarter)
    for off, rad, wob, amp, wdt in ((OUTER, R_OUT, wob_outer, 0.9, 3.1), (INNER, R_IN, wob_inner, 0.7, 2.0)):
        pts = tl_path(off, rad, wob, amp)
        stamp(qd, pts, lambda t, w=wdt: w * (0.82 + 0.18 * math.sin(t * 19.0) + 0.06 * math.sin(t * 7.3)))
    # corner knot: a small curl inside the corner
    # (kept inside the corner cell, 36 DIP, or its tail would repeat along the edge tiles)
    cx, cy = 26.5, 26.5
    pts = []
    for i in range(0, 120):
        a = i / 120 * 5.2
        rr = 0.8 + a * 0.85
        pts.append((cx + rr * math.cos(a + 0.6), cy + rr * math.sin(a + 0.6)))
    stamp(qd, pts, lambda t: 1.5 * (1 - 0.4 * t))
    # ticks on the top edge (x from C) and the left edge (y from C), between the two lines
    for k in range(0, 4):
        x = C + 2 + k * 12.0
        yo = OUTER + 0.9 * wob_outer(x - C)
        yi = INNER + 0.7 * wob_inner(x - C)
        qd.line((x * S, (yo + 1.0) * S, (x + 3.6) * S, (yi - 1.0) * S), fill=255, width=int(1.9 * S))
        y = C + 2 + k * 12.0
        xo = OUTER + 0.9 * wob_outer(y - C)
        xi = INNER + 0.7 * wob_inner(y - C)
        qd.line(((xo + 1.0) * S, y * S, (xi - 1.0) * S, (y + 3.6) * S), fill=255, width=int(1.9 * S))
    # corner arc ticks
    for k in range(1, 4):
        a = math.pi + (math.pi / 2) * k / 4
        x0 = C + (C - OUTER - 1.2) * math.cos(a)
        y0 = C + (C - OUTER - 1.2) * math.sin(a)
        x1 = C + (C - INNER + 1.2) * math.cos(a + 0.12)
        y1 = C + (C - INNER + 1.2) * math.sin(a + 0.12)
        qd.line((x0 * S, y0 * S, x1 * S, y1 * S), fill=255, width=int(1.9 * S))
    q = quarter  # size (C+T) x (C+T): rows 0..C+T are the top-left corner and the first tile of each edge

    full = canvas(W, H)
    qx = q.copy()
    full.paste(qx, (0, 0))
    # right half: mirror
    mir = qx.transpose(Image.FLIP_LEFT_RIGHT)
    full.paste(mir, (int((W - (C + T)) * S), 0), mir)
    bot = qx.transpose(Image.FLIP_TOP_BOTTOM)
    full.paste(bot, (0, int((H - (C + T)) * S)), bot)
    br = qx.transpose(Image.ROTATE_180)
    full.paste(br, (int((W - (C + T)) * S), int((H - (C + T)) * S)), br)
    # the quarter covers 36+48 of each edge; the remaining middle (84..120-84=36 wide) is outside the mirrors: that's
    # the second half of the tile run, drawn by the mirrored quarter, so the 48 DIP middle is covered once by each side.
    # Both halves are the same periodic function evaluated from opposite ends, so the seam is at tile centre.
    return down(full)


# ---------------------------------------------------------------- torn plate and ink plate

def tooth_profile(period, seed, base, amp, step_range, steps_hint=None):
    """Piecewise-linear random profile, periodic in `period`: returns f(x) -> inward offset in DIP."""
    r = rng(seed)
    xs, x = [], 0.0
    while x < period:
        xs.append(x)
        x += r.uniform(*step_range)
    hs = [base + r.uniform(0, amp) for _ in xs]
    xs.append(period)
    hs.append(hs[0])

    def f(v):
        v = v % period
        for i in range(len(xs) - 1):
            if xs[i] <= v <= xs[i + 1]:
                u = (v - xs[i]) / max(1e-6, xs[i + 1] - xs[i])
                return hs[i] + (hs[i + 1] - hs[i]) * u
        return hs[0]

    return f


def plate(name, size, corner, tile, edge_h, edge_v, round_r, seed, blur=0.0):
    """edge_h/edge_v: (base, amp, step range) for the horizontal (top, bottom) and vertical (left, right) edges."""
    W = H = size
    fh_t = tooth_profile(tile, seed + 1, edge_h[0], edge_h[1], edge_h[2])
    fh_b = tooth_profile(tile, seed + 2, edge_h[0], edge_h[1], edge_h[2])
    fv_l = tooth_profile(tile, seed + 3, edge_v[0], edge_v[1], edge_v[2])
    fv_r = tooth_profile(tile, seed + 4, edge_v[0], edge_v[1], edge_v[2])
    px = W * S
    ys, xs = np.mgrid[0:px, 0:px]
    xd = (xs + 0.5) / S
    yd = (ys + 0.5) / S
    # periodic across the whole sprite: the middle tile is the periodic stretch, corners reuse the same functions
    top = np.vectorize(lambda x: fh_t(x - corner))(np.arange(px) / S)
    bot = np.vectorize(lambda x: fh_b(x - corner))(np.arange(px) / S)
    lef = np.vectorize(lambda y: fv_l(y - corner))(np.arange(px) / S)
    rig = np.vectorize(lambda y: fv_r(y - corner))(np.arange(px) / S)
    inside = (yd >= top[None, :]) & (yd <= H - bot[None, :]) & (xd >= lef[:, None]) & (xd <= W - rig[:, None])
    # round the four corners: inside a corner square of side round_r the plate is a quarter disc
    r_ = float(round_r)
    for cx, cy in ((r_, r_), (W - r_, r_), (r_, H - r_), (W - r_, H - r_)):
        zx = (xd < r_) if cx == r_ else (xd > W - r_)
        zy = (yd < r_) if cy == r_ else (yd > H - r_)
        zone = zx & zy
        inside &= ~(zone & (np.hypot(xd - cx, yd - cy) > r_))
    img = Image.fromarray((inside * 255).astype(np.uint8), "L")
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur * S))
    return down(img)


def torn_plate():
    return plate("plate-torn", 72, 20, 32, (1.2, 4.6, (1.4, 3.6)), (1.0, 3.0, (1.8, 4.2)), 6, 100)


def ink_plate():
    # brush plate: calmer long edges, ragged dry-brush ends
    return plate("plate-ink", 64, 16, 32, (0.6, 1.5, (3.0, 7.0)), (0.5, 6.5, (0.8, 2.2)), 8, 200, blur=0.12)


# ---------------------------------------------------------------- glow frame and motes

def glow_frame():
    W, C, T = 128, 44, 40
    px = W * PX
    ys, xs = np.mgrid[0:px, 0:px]
    x = (xs + 0.5) / PX
    y = (ys + 0.5) / PX
    inner = 30.0            # distance from the edge where the plate begins (bloom is outside the plate)
    dx = np.minimum(x - inner, (W - inner) - x)
    dy = np.minimum(y - inner, (W - inner) - y)
    # signed distance to the rounded rectangle [inner, W-inner]^2
    qx = np.maximum(-dx, 0)
    qy = np.maximum(-dy, 0)
    out = np.hypot(qx, qy)
    d = out - 2.0
    glow = np.exp(-np.maximum(d, 0) / 9.0) * (1 - np.clip((d + 1.0) / 1.0, 0, 1) * 0)
    glow = np.where(d > 0, glow, 1.0) * np.clip(1 - d / 28.0, 0, 1)
    return np.clip(glow, 0, 1) * 0.9


def mote():
    n = 16 * PX
    ys, xs = np.mgrid[0:n, 0:n]
    r = np.hypot(xs - n / 2 + 0.5, ys - n / 2 + 0.5) / (n / 2)
    return np.clip(np.exp(-(r ** 2) * 4.0) * 1.2 - 0.05, 0, 1) * (r < 1)


# ---------------------------------------------------------------- thorn rule and spirals

def thorn_tile():
    W, H = 48, 14
    img = canvas(W, H)
    d = ImageDraw.Draw(img)
    f = periodic_noise(W, 31, octaves=((2, 1.0), (3, 0.35)), zero_at_ends=True)
    mid = H / 2
    pts = [(x / 8.0, mid + 2.1 * f(x / 8.0)) for x in range(-16, W * 8 + 17)]
    stamp(d, pts, lambda t: 2.1)
    # thorns: little tapered spikes at the wave's crests, alternating sides
    for k, x in enumerate((6, 18, 30, 42)):
        up = -1 if k % 2 == 0 else 1
        y = mid + 2.1 * f(x)
        tip = (x + 2.6, y + up * 5.2)
        base_l = (x - 1.6, y)
        base_r = (x + 1.8, y)
        d.polygon([(bx * S, by * S) for bx, by in (base_l, tip, base_r)], fill=255)
    # wrap: draw the first 16 DIP again at +W so thorn bases and wave that cross the seam are continuous
    arr = down(img)
    return arr


def spiral(d, cx, cy, r0, r1, turns, sense, w0, w1, rot):
    pts = []
    n = 160
    for i in range(n + 1):
        t = i / n
        a = rot + sense * t * turns * 2 * math.pi
        rr = r0 + (r1 - r0) * t
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    stamp(d, pts, lambda t: w0 + (w1 - w0) * t)


def spiral_pair():
    W, H = 76, 18
    img = canvas(W, H)
    d = ImageDraw.Draw(img)
    cy = H / 2
    # left spiral curls outward-left, right spiral mirrors it
    for sx, sense, rot in ((22.0, 1, math.pi), (54.0, -1, 0.0)):
        spiral(d, sx, cy, 5.6, 0.6, 1.5, sense, 1.9, 1.1, rot)
    # tail strokes joining each spiral to the centre leaf
    stamp(d, [(22 + 5.6 * math.cos(math.pi), cy)] + [(x, cy + 0.9 * math.sin(x * 0.7)) for x in np.linspace(14, 4, 20)], lambda t: 1.6 * (1 - 0.7 * t))
    stamp(d, [(54 + 5.6, cy)] + [(x, cy + 0.9 * math.sin(x * 0.7)) for x in np.linspace(62, 72, 20)], lambda t: 1.6 * (1 - 0.7 * t))
    stamp(d, [(22 + 5.6, cy), (30, cy + 1.2), (38, cy)], lambda t: 1.7)
    stamp(d, [(54 - 5.6, cy), (46, cy + 1.2), (38, cy)], lambda t: 1.7)
    # leaf (almond) in the middle
    leaf = []
    for i in range(0, 61):
        t = i / 60
        x = 32 + 12 * t
        y = cy - 3.6 * math.sin(math.pi * t)
        leaf.append((x, y))
    for i in range(60, -1, -1):
        t = i / 60
        x = 32 + 12 * t
        y = cy + 3.6 * math.sin(math.pi * t)
        leaf.append((x, y))
    d.polygon([(x * S, y * S) for x, y in leaf], fill=255)
    return down(img)



# ---------------------------------------------------------------- spiral mark (selection marker of the settings list)

def spiral_mark():
    n = 16
    img = canvas(n, n)
    d = ImageDraw.Draw(img)
    spiral(d, 8.2, 8.0, 6.4, 0.5, 1.75, 1, 2.3, 1.2, math.pi * 0.15)
    # a short tail leaving the outer end
    stamp(d, [(14.2, 7.0), (15.2, 9.2)], lambda t: 1.6)
    return down(img)


# ---------------------------------------------------------------- serpent ribbon

def serpent_ribbon():
    W, H = 360, 44
    img = canvas(W, H)
    d = ImageDraw.Draw(img)
    cy = H / 2
    f = periodic_noise(60, 41, octaves=((1, 1.0), (2, 0.5)), zero_at_ends=True)
    # body: two wobbling lines with scale ticks, getting thicker toward the head
    body_end = 290.0
    top, bot = [], []
    for i in range(0, 581):
        x = 4 + (body_end - 4) * i / 580
        k = i / 580
        half = 7.2 + 3.0 * k
        c = cy + 3.0 * math.sin(x / 36.0) * (1 - 0.4 * k) + 0.7 * f(x)
        top.append((x, c - half))
        bot.append((x, c + half))
    stamp(d, top, lambda t: 2.6 + 0.8 * t)
    stamp(d, bot, lambda t: 2.6 + 0.8 * t)
    for i in range(6, 580, 17):
        x = 4 + (body_end - 4) * i / 580
        k = i / 580
        half = 7.2 + 3.0 * k
        c = cy + 3.0 * math.sin(x / 36.0) * (1 - 0.4 * k) + 0.7 * f(x)
        d.line((x * S, (c - half + 1.4) * S, (x + 3.2) * S, (c + half - 1.4) * S), fill=255, width=int(1.7 * S))
    # tail taper: the left end narrows to a curl
    tail = [(4 - 2.0 * math.sin(a), cy + (1 - math.cos(a)) * 6.0) for a in np.linspace(0, 2.2, 30)]
    stamp(d, tail, lambda t: 2.4 * (1 - 0.7 * t))
    # head: big rounded wedge facing right, mouth open, fangs, eye
    hx, hy = body_end, cy + 1.5
    head = []
    for a in np.linspace(math.pi * 0.62, -math.pi * 0.5, 40):
        head.append((hx + 18 * math.cos(a) * 1.35 + 18, hy + 13 * math.sin(a)))
    # upper jaw with snout
    upper = [(hx - 2, hy - 9.5), (hx + 10, hy - 14.5), (hx + 30, hy - 13.0), (hx + 52, hy - 6.2), (hx + 62, hy - 1.2),
             (hx + 40, hy - 2.2), (hx + 18, hy - 1.8), (hx - 2, hy - 1.5)]
    lower = [(hx - 2, hy + 1.5), (hx + 16, hy + 4.0), (hx + 36, hy + 5.2), (hx + 54, hy + 3.2), (hx + 58, hy + 9.2),
             (hx + 34, hy + 15.0), (hx + 12, hy + 14.5), (hx - 2, hy + 9.5)]
    d.polygon([(x * S, y * S) for x, y in upper], fill=255)
    d.polygon([(x * S, y * S) for x, y in lower], fill=255)
    # fangs
    for fx in (hx + 44, hx + 52):
        d.polygon([(fx * S, (hy - 2.2) * S), ((fx + 3.0) * S, (hy - 2.0) * S), ((fx + 1.6) * S, (hy + 4.6) * S)], fill=255)
    for fx in (hx + 40, hx + 47):
        d.polygon([(fx * S, (hy + 3.4) * S), ((fx + 3.0) * S, (hy + 3.2) * S), ((fx + 1.4) * S, (hy - 2.8) * S)], fill=255)
    # nostril + eye cut-outs (erase)
    d.ellipse(((hx + 56) * S, (hy - 6.4) * S, (hx + 58.4) * S, (hy - 4.0) * S), fill=0)
    d.ellipse(((hx + 21) * S, (hy - 10.2) * S, (hx + 27.5) * S, (hy - 4.6) * S), fill=0)
    d.ellipse(((hx + 23.2) * S, (hy - 8.2) * S, (hx + 25.4) * S, (hy - 6.0) * S), fill=255)
    # brow ridge line
    stamp(d, [(hx + 16, hy - 12.5), (hx + 26, hy - 13.8), (hx + 34, hy - 11)], lambda t: 1.4)
    # scale ticks on the head
    for k in range(5):
        x = hx + 4 + k * 4.2
        d.line((x * S, (hy - 7.8) * S, (x + 2.2) * S, (hy - 3.4) * S), fill=255, width=int(1.1 * S))
    # a small tongue-less fork flame under the chin: skip. Soften edges slightly for a brushed look.
    img = img.filter(ImageFilter.GaussianBlur(0.35 * S / 2))
    return down(img)


# ---------------------------------------------------------------- ink blot

def ink_blot():
    n = 48
    img = canvas(n, n)
    d = ImageDraw.Draw(img)
    r = rng(51)
    f = periodic_noise(2 * math.pi, 52, octaves=((2, 1.0), (3, 0.7), (5, 0.4), (7, 0.25)))
    pts = []
    for i in range(0, 361, 3):
        a = math.radians(i)
        rr = 20.5 + 2.4 * f(a) + r.uniform(-0.35, 0.35)
        pts.append((n / 2 + rr * math.cos(a), n / 2 + rr * math.sin(a)))
    d.polygon([(x * S, y * S) for x, y in pts], fill=255)
    # splatter flecks
    for _ in range(7):
        a = r.uniform(0, 2 * math.pi)
        dist = r.uniform(21.5, 23.2)
        rr = r.uniform(0.5, 1.2)
        x, y = n / 2 + dist * math.cos(a), n / 2 + dist * math.sin(a)
        d.ellipse(((x - rr) * S, (y - rr) * S, (x + rr) * S, (y + rr) * S), fill=255)
    return down(img.filter(ImageFilter.GaussianBlur(0.25 * S / 2)))


# ---------------------------------------------------------------- contact sheet and main

def sheet(items):
    pad = 16
    tiles = []
    for name, arr in items:
        h, w = arr.shape
        t = Image.new("RGB", (w + 2 * pad, h + 2 * pad + 14), (88, 52, 40))
        base = Image.new("RGB", (w, h), (236, 214, 190))
        a = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), "L")
        base.paste(Image.new("RGB", (w, h), (30, 12, 10)), (0, 0), a)
        t.paste(base, (pad, pad))
        ImageDraw.Draw(t).text((pad, h + pad + 2), name, fill=(240, 225, 211))
        tiles.append(t)
    wmax = 1500
    x = y = row_h = 0
    placed = []
    for t in tiles:
        if x + t.width > wmax:
            x, y, row_h = 0, y + row_h, 0
        placed.append((t, x, y))
        x += t.width
        row_h = max(row_h, t.height)
    out = Image.new("RGB", (wmax, y + row_h), (60, 30, 24))
    for t, px_, py_ in placed:
        out.paste(t, (px_, py_))
    out.save(os.path.join(HERE, "fx-sheet.png"))


def main():
    items = []
    for name, fn in (
        ("rope-frame.png", rope_frame),
        ("plate-torn.png", torn_plate),
        ("plate-ink.png", ink_plate),
        ("glow-frame.png", glow_frame),
        ("thorn-tile.png", thorn_tile),
        ("spiral-pair.png", spiral_pair),
        ("spiral-mark.png", spiral_mark),
        ("serpent-ribbon.png", serpent_ribbon),
        ("mote.png", mote),
        ("ink-blot.png", ink_blot),
    ):
        arr = fn()
        save(arr, name)
        items.append((name, arr))
        if name == "serpent-ribbon.png":
            flipped = arr[:, ::-1]
            save(flipped, "serpent-ribbon-l.png")
            items.append(("serpent-ribbon-l.png", flipped))
        print("wrote", name, arr.shape)
    sheet(items)


if __name__ == "__main__":
    main()
