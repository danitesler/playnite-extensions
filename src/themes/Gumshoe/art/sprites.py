"""Deterministic white RGBA masks for the Gumshoe theme (Pillow and numpy only).

Every sprite is RGBA with RGB = 255 everywhere and the shape only in alpha: XAML fills a Rectangle with a theme
brush and uses the sprite as its OpacityMask, so ThemeModifier recolors it. Nothing is hand-drawn and nothing is
copied from the game: all shapes come from the parameters below, a fixed seed and 4x supersampling (drawn at 4x,
area-averaged down). Run from the repo root:

    python src/themes/Gumshoe/art/sprites.py [--sheet PATH]

Sprites (1x pixels, written to src/Images/fx/):
  grain 256x256 seamless film grain          underline 360x16 wobbly brush stroke
  tape 120x30 masking tape (3-slice 14|92|14) ribbon 160x32 swallowtail (3-slice 28|104|28)
  dogear-fold 28x28 / dogear-shadow 34x34     impact 48x48 three rubber-hose ticks
  splat 128x72 ink splat                      spotlight 256x340 theatre cone
  curtain 160x320 pleated left half           swag 48x14 valance tile
  sprocket-h 28x12 / sprocket-v 12x28 tiles   ring 64x64 (9-slice, 24px corners)
  flourish 56x14 divider ornament             bulbs 20x10 marquee bulb tile

It also writes art/mark.svg (the brand mark, one colour, outlines only because the repo's SVG rasterizer fills
paths and ignores strokes) and a contact sheet for review (--sheet, default: the temp folder, never the repo).
"""

import argparse
import math
import os
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
FX = ROOT / "src" / "Images" / "fx"
S = 4
SEED = 1937


def rng_for(name):
    return np.random.default_rng([SEED, sum(ord(c) * (i + 1) for i, c in enumerate(name))])


def smooth(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3 - 2 * t)


def grid(w, h):
    """Supersampled pixel centres in 1x units."""
    ys, xs = np.mgrid[0:h * S, 0:w * S]
    return (xs + 0.5) / S, (ys + 0.5) / S


def down(a, w, h):
    return a.reshape(h, S, w, S).mean(axis=(1, 3))


def canvas(w, h):
    return Image.new("L", (w * S, h * S), 0)


def from_canvas(im, w, h):
    return down(np.asarray(im, dtype=float) / 255.0, w, h)


def fill_poly(im, pts, value=255):
    ImageDraw.Draw(im).polygon([(x * S - 0.5, y * S - 0.5) for x, y in pts], fill=value)


def stamp(im, xs, ys, widths, value=255):
    d = ImageDraw.Draw(im)
    for x, y, w in zip(xs, ys, widths):
        if w <= 0.02:
            continue
        r = w * S / 2.0
        cx, cy = x * S - 0.5, y * S - 0.5
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=value)


def knots(r, n, count, lo=-1.0, hi=1.0):
    """Smooth random curve along n samples (linear interpolation between random knots)."""
    k = r.uniform(lo, hi, size=count)
    return np.interp(np.linspace(0, count - 1, n), np.arange(count), k)


# ----------------------------------------------------------------------------------------------------------------
# film grain


def grain():
    n = 256
    r = rng_for("grain")
    fy = np.fft.fftfreq(n)[:, None]
    fx = np.fft.fftfreq(n)[None, :]
    f2 = fx ** 2 + fy ** 2

    def band(sigma):
        # periodic Gaussian blur through the FFT, so the tile wraps without a seam
        noise = np.fft.fft2(r.standard_normal((n, n)))
        out = np.fft.ifft2(noise * np.exp(-2 * np.pi ** 2 * sigma ** 2 * f2)).real
        return out / out.std()

    z = 0.30 * band(0.55) + 0.55 * band(1.9) + 0.60 * band(6.5) + 0.25 * band(24.0)
    z = z / z.std()
    a = 0.55 * np.clip((z + 1.7) / 4.4, 0, 1) ** 1.25
    return a


# ----------------------------------------------------------------------------------------------------------------
# hand-drawn underline


def underline():
    w, h = 360, 16
    r = rng_for("underline")
    im = canvas(w, h)
    x0, x1 = 2.0, w - 2.0
    xs = np.arange(x0, x1, 0.2)
    t = (xs - x0) / (x1 - x0)
    wob = 0.62 * np.sin(2 * np.pi * (1.15 * t + 0.10)) + 0.38 * np.sin(2 * np.pi * (2.3 * t + 0.55))
    cy = 8.0 + 1.2 * wob
    ramp_l = np.sin(np.clip(t / 0.10, 0, 1) * np.pi / 2) ** 0.9
    ramp_r = np.sin(np.clip((1 - t) / 0.20, 0, 1) * np.pi / 2) ** 0.9
    body = 5.0 + 0.45 * np.sin(2 * np.pi * (0.8 * t + 0.3)) + 0.22 * knots(r, len(xs), 34) + 0.10 * knots(r, len(xs), 120)
    wid = body * ramp_l * ramp_r
    stamp(im, xs, cy, wid)
    # second, lighter pass: sits a little lower and drifts, so the lower edge reads as a double stroke
    t2l = np.sin(np.clip((t - 0.06) / 0.12, 0, 1) * np.pi / 2)
    t2r = np.sin(np.clip((0.93 - t) / 0.16, 0, 1) * np.pi / 2)
    off = 1.05 + 0.45 * np.sin(2 * np.pi * (4.3 * t + 0.2)) + 0.25 * knots(r, len(xs), 60)
    stamp(im, xs, cy + off, 0.68 * body * t2l * t2r)
    return from_canvas(im, w, h)


# ----------------------------------------------------------------------------------------------------------------
# masking tape, swallowtail ribbon


def torn_edge(r, h, side, inner, outer):
    """Ragged torn end: vertices top to bottom, x measured in from the end; teeth 3 to 5px apart."""
    ys = [0.0]
    while ys[-1] < h:
        ys.append(ys[-1] + r.uniform(3.0, 5.0))
    ys[-1] = float(h)
    pts = []
    for i, y in enumerate(ys):
        tip = i % 2 == 0
        x = r.uniform(*inner) if tip else r.uniform(*outer)
        pts.append((x, y))
    return pts


def tape():
    w, h = 120, 30
    r = rng_for("tape")
    left = torn_edge(r, h, "l", (1.0, 3.2), (4.8, 8.2))
    right = torn_edge(r, h, "r", (1.6, 3.8), (5.2, 8.6))
    poly = [(x, y) for x, y in left]
    poly += [(w - x, y) for x, y in reversed(right)]
    im = canvas(w, h)
    fill_poly(im, poly)
    cover = from_canvas(im, w, h)
    # faint fibre streaks: row-correlated noise, long in x
    z = r.standard_normal((h, w + 120))
    k = np.exp(-0.5 * (np.arange(-40, 41) / 16.0) ** 2)
    k /= k.sum()
    z = np.apply_along_axis(lambda row: np.convolve(row, k, mode="same"), 1, z)[:, 60:60 + w]
    z = z / z.std()
    zy = z + 0.35 * np.roll(z, 1, axis=0)
    zy = zy / zy.std()
    body = np.clip(0.962 + 0.022 * zy, 0.91, 1.0)
    return cover * body


def ribbon():
    w, h, notch = 160, 32, 12
    im = canvas(w, h)
    fill_poly(im, [(0, 0), (w, 0), (w - notch, h / 2), (w, h), (0, h), (notch, h / 2)])
    a = from_canvas(im, w, h)
    # 2px fold lines, 26px in from each end (inside the 28px slices)
    xs = (np.arange(w) + 0.5)
    fold = np.zeros(w)
    for x_near in (26.0, w - 28.0):
        fold = np.maximum(fold, np.clip(np.minimum(xs - x_near, x_near + 2.0 - xs) + 0.5, 0, 1))
    return a * (1.0 - 0.45 * fold)[None, :]


# ----------------------------------------------------------------------------------------------------------------
# dog-ear


def dogear_fold():
    n = 28
    tip_r = 2.0
    pts = [(0.0, 0.0), (float(n), float(n)), (tip_r, float(n))]
    for k in range(1, 13):  # arc around the folded tip, centre (2, 26), from straight down to straight left
        ang = math.radians(90 + k * 90 / 12)
        pts.append((tip_r + tip_r * math.cos(ang), n - tip_r + tip_r * math.sin(ang)))
    im = canvas(n, n)
    fill_poly(im, pts)
    a = from_canvas(im, n, n)
    X, Y = grid(n, n)
    dist = (Y - X) / math.sqrt(2.0)  # perpendicular distance from the crease, measured into the flap
    crease = np.clip(1.0 - np.abs(dist - 1.1) / 0.55, 0, 1)
    crease = down(crease, n, n)
    return a * (1.0 - 0.5 * crease)


def dogear_shadow():
    n = 34
    shift = (-1.0, 2.0)
    pts = [(6 + shift[0], 0 + shift[1]), (34 + shift[0], 28 + shift[1]), (6 + shift[0], 28 + shift[1])]
    im = canvas(n, n)
    fill_poly(im, pts)
    soft = np.asarray(im.filter(ImageFilter.GaussianBlur(1.9 * S)), dtype=float) / 255.0
    X, Y = grid(n, n)
    page = np.clip((Y - (X - 6.0)) / math.sqrt(2.0) * 1.2 + 0.5, 0, 1)  # only where the page exists (below the crease)
    field = soft * page
    return down(field, n, n) * 0.35 / max(field.max(), 1e-6) * 1.0


# ----------------------------------------------------------------------------------------------------------------
# impact ticks, splat


def impact():
    n = 48
    im = canvas(n, n)
    corner = (0.0, float(n))
    thick = 3.0
    for ang, r0, r1 in ((17.0, 12.0, 26.0), (45.0, 13.5, 31.5), (73.0, 12.0, 26.0)):
        a = math.radians(ang)
        ux, uy = math.cos(a), -math.sin(a)
        c0, c1 = r0 + thick / 2, r1 - thick / 2  # cap centres, so the stated length includes the round ends
        steps = np.linspace(c0, c1, 120)
        stamp(im, corner[0] + ux * steps, corner[1] + uy * steps, np.full(120, thick))
    return from_canvas(im, n, n)


def smin(a, b, k):
    """Polynomial smooth minimum of two distance fields (a smooth union of shapes)."""
    hh = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - hh) + a * hh - k * hh * (1 - hh)


def splat():
    w, h = 128, 72
    X, Y = grid(w, h)
    r = rng_for("splat")
    ccx, ccy = 64.0, 36.0

    def disc(cx, cy, rad):
        return np.hypot(X - cx, Y - cy) - rad

    body = disc(ccx, ccy, 10.5)
    # the body: a ring of overlapping lobes of uneven size, stretched along x
    for k in range(9):
        a = math.radians(k * 40 + r.uniform(-12, 12))
        dist = r.uniform(8.0, 13.0)
        body = smin(body, disc(ccx + 1.75 * dist * math.cos(a), ccy + 0.85 * dist * math.sin(a), r.uniform(4.6, 7.4)), 6.0)
    # tongues: chains of shrinking discs reaching outward, merged smoothly into the body
    spikes = ((200, 38), (340, 43), (14, 33), (162, 35), (272, 23), (96, 21))
    for ang, length in spikes:
        a = math.radians(ang + r.uniform(-6, 6))
        scale = r.uniform(0.72, 1.2)
        n = max(int(length / 3.0), 3)
        tongue = None
        for i in range(n):
            t = i / (n - 1)
            dist = 15 + (length - 15) * t
            d = disc(ccx + dist * math.cos(a), ccy + dist * math.sin(a), scale * (4.8 - 3.2 * t) + 0.2)
            tongue = d if tongue is None else smin(tongue, d, 3.0)
        body = smin(body, tongue, 5.0)
    shape = body
    # droplets fly on beyond the tongues, smaller the farther they go
    drops = []
    for ang, length in spikes:
        a = math.radians(ang + r.uniform(-7, 7))
        dist = length + r.uniform(7.0, 11.0)
        drops.append((ccx + dist * math.cos(a), ccy + dist * math.sin(a), r.uniform(1.8, 3.3)))
    drops.append((ccx + 20, ccy + 26, 2.0))
    for cx, cy, rad in drops:
        shape = np.minimum(shape, disc(cx, cy, rad))
    return down((shape <= 0).astype(float), w, h)


# ----------------------------------------------------------------------------------------------------------------
# stage dressing


def spotlight():
    w, h = 256, 340
    yy, xx = np.mgrid[0:h, 0:w]
    y = (yy + 0.5) / h
    d = np.abs(xx + 0.5 - w / 2) / (18.0 + (w / 2 - 18.0) * y)
    edge = smooth((1.0 - d) / 0.55)
    core = (1.0 + 0.45 * np.exp(-((d / 0.36) ** 2))) / 1.45
    vert = (1.0 - y) ** 1.35
    return 0.55 * edge * core * vert


def curtain():
    w, h = 160, 320
    yy, xx = np.mgrid[0:h, 0:w]
    X, Y = xx + 0.5, yy + 0.5
    pitch = w / 6.0
    lean = 22.0 * np.clip((Y - 110) / 210.0, 0, 1) ** 1.5 * (X / w) ** 0.9
    sway = 1.7 * np.sin(Y / 47.0 + 0.6) + 0.9 * np.sin(Y / 23.0 + 2.0)
    u = (X - lean - sway) / pitch - 0.35
    crest = 0.5 + 0.5 * np.cos(2 * np.pi * u)
    crest = crest ** 1.2
    shade = 0.90 + 0.10 * np.cos(Y / 70.0)
    a = 0.5 * crest * shade
    # the tie-back: the right edge pinches in around y 232 and a sash crosses the folds on a diagonal
    pinch = 34.0 * np.exp(-(((Y - 232.0) / 46.0) ** 2))
    a = a * np.clip((w - pinch - X) / 1.6 + 0.5, 0, 1)
    t = np.linspace(0, 1, 90)
    sx = (1 - t) ** 2 * 58 + 2 * (1 - t) * t * 100 + t ** 2 * 134
    sy = (1 - t) ** 2 * 186 + 2 * (1 - t) * t * 204 + t ** 2 * 242
    dist = np.min(np.hypot(X[..., None] - sx, Y[..., None] - sy), axis=2)
    halo = 1.0 - 0.8 * (smooth((dist - 3.6) / 2.0) * (1 - smooth((dist - 7.5) / 3.0)))  # dark halo either side of the sash
    a = a * halo
    band = smooth((4.4 - dist) / 1.4)
    a = np.maximum(a, 0.5 * band * np.clip((w - pinch - X) / 1.6 + 0.5, 0, 1))
    return a


def swag():
    w, h = 48, 14
    X, Y = grid(w, h)
    band = Y < 4.0
    scallop = (((X - 24.0) / 22.0) ** 2 + ((Y - 4.0) / 10.0) ** 2 <= 1.0) & (Y >= 4.0)
    return down((band | scallop).astype(float), w, h)


def sprocket_h():
    w, h = 28, 12
    X, Y = grid(w, h)
    qx = np.abs(X - 14.0) - (6.0 - 2.0)
    qy = np.abs(Y - 6.0) - (4.0 - 2.0)
    d = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - 2.0
    return down((d <= 0).astype(float), w, h)


def sprocket_v():
    return sprocket_h().T.copy()


def ring():
    n = 64
    X, Y = grid(n, n)
    c, half, rad = 32.0, 22.0, 14.0
    qx = np.abs(X - c) - (half - rad)
    qy = np.abs(Y - c) - (half - rad)
    d = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - rad
    stroke = (np.abs(d) <= 1.5).astype(float)
    u = np.clip((d - 1.5) / 6.0, 0, 1)
    soft = np.where(d > 1.5, 0.5 * (1 - u) ** 2.2, 0.0)
    return down(np.maximum(stroke, soft), n, n)


def curl(start, heading, sign, stem, r0, r1, turn, wave=0.0):
    """A scroll: a stem (heading plus a gentle S wave), then a spiral that tightens from radius r0 to r1 over `turn` degrees."""
    x, y = start
    th = math.radians(heading)
    pts = [(x, y)]
    ds = 0.04
    s = 0.0
    turned = 0.0
    spiral = 0.0
    total = math.radians(turn)
    while turned < total and s < 200:
        if s < stem:
            k = 0.0
            th = math.radians(heading + wave * math.sin(2 * math.pi * s / stem))
        else:
            sigma = min(spiral / 11.0, 1.0)
            k = 1.0 / (r0 * (r1 / r0) ** sigma)
            spiral += ds
            turned += k * ds
            th += sign * k * ds
        x += math.cos(th) * ds
        y += math.sin(th) * ds
        s += ds
        pts.append((x, y))
    return pts


def flourish():
    w, h = 56, 14
    im = canvas(w, h)
    d = ImageDraw.Draw(im)
    cx, cy = 28.0, 7.0
    fill_poly(im, [(cx - 4.6, cy), (cx, cy - 4.0), (cx + 4.6, cy), (cx, cy + 4.0)])
    thick = 2.0
    arms = [curl((cx + 4.0, cy), 0.0, -1, 14.0, 2.8, 1.5, 285.0), curl((cx + 4.0, cy), 0.0, +1, 8.5, 2.8, 1.5, 285.0)]
    for pts in arms:
        xs = np.array([p[0] for p in pts])
        ys = np.array([p[1] for p in pts])
        stamp(im, xs, ys, np.full(len(xs), thick))
        stamp(im, w - xs, ys, np.full(len(xs), thick))
    return from_canvas(im, w, h)


def bulbs():
    w, h = 20, 10
    X, Y = grid(w, h)
    bulb = (X - 10.0) ** 2 + (Y - 5.0) ** 2 <= 3.0 ** 2
    notch = (X - 8.9) ** 2 + (Y - 3.9) ** 2 <= 0.95 ** 2
    return down((bulb & ~notch).astype(float), w, h)


# ----------------------------------------------------------------------------------------------------------------
# brand mark: a magnifying glass (ring, handle, keyhole, three whiskers), 72 x 72, one colour

MARK = dict(
    cx=40.0, cy=31.0, r_out=26.0, stroke=7.0,
    handle_angle=50.0, handle_r0=22.0, handle_r1=38.5, handle_w=10.4,
    key_cx=40.0, key_cy=27.4, key_r=4.6, slot_top=29.6, slot_bottom=41.6, slot_top_w=4.6, slot_bottom_w=9.2,
    whisker_w=3.8, whisker_angles=(204.0, 180.0, 156.0), whisker_r0=31.0, whisker_r1=37.0, whisker_droop=2.6,
)


def _capsule_inside(px, py, ax, ay, bx, by, rad):
    abx, aby = bx - ax, by - ay
    t = np.clip(((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby), 0, 1)
    return np.hypot(px - (ax + t * abx), py - (ay + t * aby)) <= rad


def mark_geometry():
    m = MARK
    cx, cy = m["cx"], m["cy"]
    ang = math.radians(m["handle_angle"])
    ux, uy = math.cos(ang), math.sin(ang)
    p0 = (cx + m["handle_r0"] * ux, cy + m["handle_r0"] * uy)
    p1 = (cx + m["handle_r1"] * ux, cy + m["handle_r1"] * uy)
    # outer boundary of ring + handle: star-shaped about the lens centre, so scan each ray for its last inside radius
    near = np.arange(0, 360, 0.25)
    phis = np.unique(np.concatenate([np.arange(0, 360, 1.0), near[np.abs(((near - m["handle_angle"] + 180) % 360) - 180) < 28]]))
    rs = np.arange(m["r_out"], m["r_out"] + 30, 0.005)
    ph = np.radians(phis)[:, None]
    px, py = cx + rs[None, :] * np.cos(ph), cy + rs[None, :] * np.sin(ph)
    inside = _capsule_inside(px, py, p0[0], p0[1], p1[0], p1[1], m["handle_w"] / 2)
    first_out = np.argmax(~inside, axis=1)
    radius = np.where(inside[:, 0], rs[first_out], m["r_out"])
    outer = [(cx + R * math.cos(a), cy + R * math.sin(a)) for R, a in zip(radius, np.radians(phis))]
    r_in = m["r_out"] - m["stroke"]
    hole = [(cx + r_in * math.cos(a), cy + r_in * math.sin(a)) for a in np.radians(np.arange(360, 0, -1.0))]
    # keyhole: disc plus a flared slot, star-shaped about the disc centre
    kx, ky, kr = m["key_cx"], m["key_cy"], m["key_r"]
    kphis = np.radians(np.arange(0, 360, 1.0))
    krs = np.arange(0, 20, 0.005)
    qx, qy = kx + krs[None, :] * np.cos(kphis)[:, None], ky + krs[None, :] * np.sin(kphis)[:, None]
    disc = (qx - kx) ** 2 + (qy - ky) ** 2 <= kr ** 2
    tt = np.clip((qy - m["slot_top"]) / (m["slot_bottom"] - m["slot_top"]), 0, 1)
    half = (m["slot_top_w"] + tt * (m["slot_bottom_w"] - m["slot_top_w"])) / 2
    slot = (qy >= m["slot_top"]) & (qy <= m["slot_bottom"]) & (np.abs(qx - kx) <= half)
    kin = disc | slot
    kfirst = np.argmax(~kin, axis=1)
    key = [(kx + krs[i] * math.cos(a), ky + krs[i] * math.sin(a)) for i, a in zip(kfirst, kphis)]
    # whiskers: short quadratic curves, drooping at the tip, outlined with round caps
    whiskers = []
    for deg in m["whisker_angles"]:
        a = math.radians(deg)
        s = (cx + m["whisker_r0"] * math.cos(a), cy + m["whisker_r0"] * math.sin(a))
        e = (cx + m["whisker_r1"] * math.cos(a) - 0.6, cy + m["whisker_r1"] * math.sin(a) + m["whisker_droop"])
        c = ((s[0] + e[0]) / 2, (s[1] + e[1]) / 2 + 0.7)
        whiskers.append((s, c, e))
    return dict(p0=p0, p1=p1, outer=outer, hole=hole, key=key, whiskers=whiskers)


def stroke_outline(s, c, e, width, steps=48):
    t = np.linspace(0, 1, steps)
    x = (1 - t) ** 2 * s[0] + 2 * (1 - t) * t * c[0] + t ** 2 * e[0]
    y = (1 - t) ** 2 * s[1] + 2 * (1 - t) * t * c[1] + t ** 2 * e[1]
    dx = 2 * (1 - t) * (c[0] - s[0]) + 2 * t * (e[0] - c[0])
    dy = 2 * (1 - t) * (c[1] - s[1]) + 2 * t * (e[1] - c[1])
    norm = np.hypot(dx, dy)
    nx, ny = -dy / norm, dx / norm
    r = width / 2
    left = list(zip(x + nx * r, y + ny * r))
    right = list(zip(x - nx * r, y - ny * r))
    a_end = math.atan2(ny[-1], nx[-1])
    cap_end = [(x[-1] + r * math.cos(a_end - k * math.pi / 12), y[-1] + r * math.sin(a_end - k * math.pi / 12)) for k in range(1, 12)]
    a_start = math.atan2(-ny[0], -nx[0])
    cap_start = [(x[0] + r * math.cos(a_start - k * math.pi / 12), y[0] + r * math.sin(a_start - k * math.pi / 12)) for k in range(1, 12)]
    return left + cap_end + right[::-1] + cap_start


def write_mark():
    g = mark_geometry()

    def d(points):
        return "M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in points) + " Z"

    parts = [d(g["outer"]), d(g["hole"]), d(g["key"])]
    for s, c, e in g["whiskers"]:
        parts.append(d(stroke_outline(s, c, e, MARK["whisker_w"])))
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="72" height="72">\n'
        "  <!-- Gumshoe mark: a thick-stroke magnifying glass with a keyhole in the lens and three whiskers on its left.\n"
        "       One colour. Outlines only (generated by art/sprites.py), so every rasterizer fills it the same way. -->\n"
        '  <path fill="#000000" fill-rule="evenodd" d="' + " ".join(parts) + '"/>\n'
        "</svg>\n"
    )
    (ROOT / "art" / "mark.svg").write_text(svg, encoding="utf-8", newline="\n")
    return g


def xaml_mark_data(g):
    m = MARK
    cx, cy = m["cx"], m["cy"]
    rc = m["r_out"] - m["stroke"] / 2
    ring_d = f"M{cx + rc:g},{cy:g} A{rc:g},{rc:g} 0 1 1 {cx - rc:g},{cy:g} A{rc:g},{rc:g} 0 1 1 {cx + rc:g},{cy:g} Z"
    handle_d = f"M{g['p0'][0]:.2f},{g['p0'][1]:.2f} L{g['p1'][0]:.2f},{g['p1'][1]:.2f}"
    whisk_d = " ".join(f"M{s[0]:.2f},{s[1]:.2f} Q{c[0]:.2f},{c[1]:.2f} {e[0]:.2f},{e[1]:.2f}" for s, c, e in g["whiskers"])
    kx, ky, kr = m["key_cx"], m["key_cy"], m["key_r"]
    tl, tr = kx - m["slot_top_w"] / 2, kx + m["slot_top_w"] / 2
    bl, br = kx - m["slot_bottom_w"] / 2, kx + m["slot_bottom_w"] / 2
    key_d = (
        f"F1 M{kx - kr:g},{ky:g} A{kr:g},{kr:g} 0 1 1 {kx + kr:g},{ky:g} A{kr:g},{kr:g} 0 1 1 {kx - kr:g},{ky:g} Z "
        f"M{tl:g},{m['slot_top']:g} L{tr:g},{m['slot_top']:g} L{br:g},{m['slot_bottom']:g} L{bl:g},{m['slot_bottom']:g} Z"
    )
    return ring_d, handle_d, whisk_d, key_d


# ----------------------------------------------------------------------------------------------------------------

SPRITES = {
    "grain": (256, 256, grain),
    "underline": (360, 16, underline),
    "tape": (120, 30, tape),
    "ribbon": (160, 32, ribbon),
    "dogear-fold": (28, 28, dogear_fold),
    "dogear-shadow": (34, 34, dogear_shadow),
    "impact": (48, 48, impact),
    "splat": (128, 72, splat),
    "spotlight": (256, 340, spotlight),
    "curtain": (160, 320, curtain),
    "swag": (48, 14, swag),
    "sprocket-h": (28, 12, sprocket_h),
    "sprocket-v": (12, 28, sprocket_v),
    "ring": (64, 64, ring),
    "flourish": (56, 14, flourish),
    "bulbs": (20, 10, bulbs),
}


def save(name, alpha, w, h):
    alpha = np.asarray(alpha, dtype=float)
    if alpha.shape != (h, w):
        raise SystemExit(f"{name}: got {alpha.shape}, want {(h, w)}")
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.rint(np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(FX / f"{name}.png", compress_level=9)
    return rgba[..., 3]


def stretch_h(a, left, right, width):
    """3-slice horizontal stretch (what the XAML does): fixed ends, the middle scaled."""
    h, w = a.shape
    mid = Image.fromarray((a[:, left:w - right] * 255).astype(np.uint8)).resize((width - left - right, h), Image.BILINEAR)
    return np.concatenate([a[:, :left], np.asarray(mid, dtype=float) / 255, a[:, w - right:]], axis=1)


def nine(a, corner, width, height):
    h, w = a.shape
    c = corner
    out = np.zeros((height, width))
    pieces = {
        (0, 0): (a[:c, :c], (0, 0)), (0, 2): (a[:c, w - c:], (0, width - c)),
        (2, 0): (a[h - c:, :c], (height - c, 0)), (2, 2): (a[h - c:, w - c:], (height - c, width - c)),
    }
    for piece, (y, x) in pieces.values():
        out[y:y + c, x:x + c] = piece

    def scaled(src, size):
        return np.asarray(Image.fromarray((src * 255).astype(np.uint8)).resize(size, Image.BILINEAR), dtype=float) / 255

    out[:c, c:width - c] = scaled(a[:c, c:w - c], (width - 2 * c, c))
    out[height - c:, c:width - c] = scaled(a[h - c:, c:w - c], (width - 2 * c, c))
    out[c:height - c, :c] = scaled(a[c:h - c, :c], (c, height - 2 * c))
    out[c:height - c, width - c:] = scaled(a[c:h - c, w - c:], (c, height - 2 * c))
    return out


def tile_h(a, count):
    return np.tile(a, (1, count))


def tile_v(a, count):
    return np.tile(a, (count, 1))


def contact_sheet(alphas, path):
    from PIL import ImageFont

    font = ImageFont.load_default()
    W = 1500
    bg = 118
    items = []  # (label, array, scale)

    def add(label, arr, scale=1):
        items.append((label, np.asarray(arr, dtype=float), scale))

    add("grain 256 (tiled 2x2 below)", alphas["grain"], 1)
    add("grain tiled 2x2 at opacity 1", np.tile(alphas["grain"], (2, 2)), 1)
    add("spotlight 256x340", alphas["spotlight"], 1)
    add("curtain L / R 160x320", np.concatenate([alphas["curtain"], alphas["curtain"][:, ::-1]], axis=1), 1)
    add("underline 360x16 x2", alphas["underline"], 2)
    add("underline stretched to 600 and 120", np.asarray(Image.fromarray((alphas["underline"] * 255).astype(np.uint8)).resize((600, 16), Image.BILINEAR)) / 255.0, 1)
    add("", np.asarray(Image.fromarray((alphas["underline"] * 255).astype(np.uint8)).resize((120, 16), Image.BILINEAR)) / 255.0, 2)
    add("tape x3", alphas["tape"], 3)
    add("tape 3-slice at 220 x3", stretch_h(alphas["tape"], 14, 14, 220), 3)
    add("ribbon x3", alphas["ribbon"], 3)
    add("ribbon 3-slice at 300 x2", stretch_h(alphas["ribbon"], 28, 28, 300), 2)
    add("dogear-fold x8", alphas["dogear-fold"], 8)
    add("dogear-shadow x8", alphas["dogear-shadow"], 8)
    fold = np.zeros((34, 34))
    fold[0:28, 6:34] = alphas["dogear-fold"]
    add("shadow under fold x8", 1 - (1 - alphas["dogear-shadow"]) * (1 - fold), 8)
    add("impact x5", alphas["impact"], 5)
    add("splat x4", alphas["splat"], 4)
    add("flourish x8", alphas["flourish"], 8)
    add("flourish divider 360 x2", np.concatenate([_rule(150), alphas["flourish"], _rule(150)], axis=1), 2)
    add("ring x5", alphas["ring"], 5)
    add("ring 9-slice 140x80 x2", nine(alphas["ring"], 24, 140, 80), 2)
    add("swag tiled 6 x3", tile_h(alphas["swag"], 6), 3)
    add("sprocket-h tiled 12 x2", tile_h(alphas["sprocket-h"], 12), 2)
    add("sprocket-v tiled 6 x2", tile_v(alphas["sprocket-v"], 6), 2)
    add("bulbs tiled 12 x4", tile_h(alphas["bulbs"], 12), 4)

    pad = 14
    x = pad
    y = pad
    row_h = 0
    placed = []
    for label, arr, scale in items:
        h, w = arr.shape
        iw, ih = w * scale, h * scale + 12
        if x + iw + pad > W:
            x = pad
            y += row_h + pad
            row_h = 0
        placed.append((label, arr, scale, x, y))
        x += iw + pad
        row_h = max(row_h, ih)
    H = y + row_h + pad
    sheet = Image.new("RGB", (W, H), (bg, bg, bg))
    draw = ImageDraw.Draw(sheet)
    for label, arr, scale, px, py in placed:
        img = Image.fromarray(np.rint(arr * 255).astype(np.uint8))
        if scale > 1:
            img = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
        white = Image.new("RGB", img.size, (255, 255, 255))
        sheet.paste(white, (px, py + 12), img)
        draw.text((px, py), label, fill=(20, 20, 20), font=font)
    sheet.save(path)


def _rule(n):
    a = np.zeros((14, n))
    a[6, :] = 1.0
    return a


def main():
    ap = argparse.ArgumentParser()
    default_sheet = os.environ.get("GUMSHOE_FX_SHEET") or str(Path(tempfile.gettempdir()) / "gumshoe-fx-sheet.png")
    ap.add_argument("--sheet", default=default_sheet, help="contact sheet path (outside the repo)")
    args = ap.parse_args()
    FX.mkdir(parents=True, exist_ok=True)
    alphas = {}
    for name, (w, h, fn) in SPRITES.items():
        a = fn()
        alphas[name] = save(name, a, w, h) / 255.0
        print(f"{name}.png {w}x{h}")
    g = write_mark()
    ring_d, handle_d, whisk_d, key_d = xaml_mark_data(g)
    print("xaml ring:", ring_d)
    print("xaml handle:", handle_d)
    print("xaml whiskers:", whisk_d)
    print("xaml keyhole:", key_d)
    contact_sheet(alphas, args.sheet)
    print("sheet:", args.sheet)


if __name__ == "__main__":
    main()
