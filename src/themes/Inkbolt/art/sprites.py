#!/usr/bin/env python3
"""Inkbolt sprites: white masks (RGB 255, the effect in alpha) written to src/Images/fx and a review sheet to art/fx-sheet.png.

Deterministic (fixed seed). XAML fills each with a theme brush through an OpacityMask, so ThemeModifier recolors them.
Measured specs (RESEARCH.md): the HUD health line is a zig-zag about 2 px core with a soft halo; the corner ribbon is a damask band
with a ragged ink edge; documents are shown in a torn black ink frame; the back plate is grey grain with ink splatter.

  bolt-h.png      256x28   seamless horizontal zig-zag trace (top-bar rule, loading flicker, title band)
  arc-a/b/c.png   200x24   forked arcs for Play hover, ends faded
  ribbon.png      512x44   damask band, slanted left end (settings title band)
  ribbon-corner.png 320x320 diagonal damask ribbon + stars in the top-right corner (empty page, banner corner)
  frame.png       128x128  torn ink frame, 9-slice, border 28 (cover hover, screenshots)
  grain.png       256x256  seamless grain (rail, title band)
  splat.png       256x256  ink splatter (empty page)
  notch.png       n/a      (drawn as XAML geometry)
"""
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 2011
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "src" / "Images" / "fx"
OUT.mkdir(parents=True, exist_ok=True)
SS = 4  # supersampling


def smooth(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3 - 2 * t)


def to_png(alpha, name):
    """alpha: float array 0..1 -> white RGBA PNG."""
    a = np.clip(alpha, 0, 1)
    h, w = a.shape
    img = np.empty((h, w, 4), dtype=np.uint8)
    img[..., :3] = 255
    img[..., 3] = (a * 255 + 0.5).astype(np.uint8)
    Image.fromarray(img, "RGBA").save(OUT / name, optimize=True)
    return Image.fromarray(img, "RGBA")


def value_noise(w, h, cell, r, octaves=3):
    out = np.zeros((h, w), dtype=np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        c = max(2, cell // (2 ** o))
        gw, gh = w // c + 3, h // c + 3
        g = np.array([[r.random() for _ in range(gw)] for _ in range(gh)], dtype=np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((gw * c, gh * c), Image.BICUBIC)
        arr = np.asarray(im, dtype=np.float32)[:h, :w] / 255.0
        out += arr * amp
        tot += amp
        amp *= 0.5
    return out / tot


def jag(p0, p1, rough, depth, r):
    """Midpoint-displaced polyline from p0 to p1 (perpendicular displacement)."""
    pts = [p0, p1]
    disp = rough
    for _ in range(depth):
        nxt = [pts[0]]
        for a, b in zip(pts, pts[1:]):
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            dx, dy = b[0] - a[0], b[1] - a[1]
            ln = math.hypot(dx, dy) or 1
            nx, ny = -dy / ln, dx / ln
            d = (r.random() * 2 - 1) * disp
            nxt += [(mx + nx * d, my + ny * d), b]
        pts = nxt
        disp *= 0.55
    return pts


def draw_polyline(size, pts, core, halo, halo_alpha=0.55):
    """Core line + blurred halo on a transparent float canvas (supersampled)."""
    w, h = size
    big = Image.new("L", (w * SS, h * SS), 0)
    d = ImageDraw.Draw(big)
    d.line([(x * SS, y * SS) for x, y in pts], fill=255, width=max(1, int(core * SS)), joint="curve")
    core_img = big.resize((w, h), Image.LANCZOS)
    halo_img = big.filter(ImageFilter.GaussianBlur(halo * SS)).resize((w, h), Image.LANCZOS)
    c = np.asarray(core_img, dtype=np.float32) / 255.0
    hl = np.asarray(halo_img, dtype=np.float32) / 255.0
    hl = np.clip(hl * 2.2, 0, 1) * halo_alpha
    return np.clip(np.maximum(c, hl), 0, 1)


# ---------------------------------------------------------------- bolt-h (seamless)
def make_bolt_h():
    r = random.Random(SEED + 1)
    W, H = 256, 28
    # zig-zag with 11 vertices, first and last at mid so the tile joins
    n = 12
    xs = [i * W / n for i in range(n + 1)]
    ys = [H / 2]
    for i in range(1, n):
        side = 1 if i % 2 else -1
        ys.append(H / 2 + side * (5 + r.random() * 5))
    ys.append(H / 2)
    pts = list(zip(xs, ys))
    # tile three times and crop the middle so blur wraps seamlessly
    tri = [(x + k * W, y) for k in (-1, 0, 1) for x, y in pts]
    a = draw_polyline((W * 3, H), [(x + W, y) for x, y in tri], 1.7, 2.2)
    a = a[:, W:2 * W]
    to_png(a, "bolt-h.png")
    return a


# ---------------------------------------------------------------- arcs
def make_arc(seed, name):
    r = random.Random(seed)
    W, H = 200, 24
    pts = jag((6, H / 2), (W - 6, H / 2), 7.0, 5, r)
    a = draw_polyline((W, H), pts, 1.9, 2.4, 0.75)
    # two short forks
    for _ in range(2):
        i = r.randrange(len(pts) // 4, 3 * len(pts) // 4)
        x0, y0 = pts[i]
        ang = (r.random() * 0.9 + 0.35) * (1 if r.random() > 0.5 else -1)
        ln = 22 + r.random() * 20
        f = jag((x0, y0), (x0 + math.cos(ang) * ln, y0 + math.sin(ang) * ln * 0.5), 3.0, 3, r)
        a = np.maximum(a, draw_polyline((W, H), f, 1.0, 1.4, 0.4) * 0.8)
    x = np.arange(W, dtype=np.float32)
    fade = smooth(x / 30.0) * smooth((W - 1 - x) / 30.0)
    a = a * fade[None, :]
    to_png(a, name)
    return a


# ---------------------------------------------------------------- damask ribbon
def motif(size, flip):
    """One damask tile: diamond core, four petals, two curls. Returns float array (cut = 1)."""
    s = size * SS
    img = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(img)
    c = s / 2
    lw = max(1, int(s * 0.035))
    # diamond
    d.polygon([(c, s * 0.18), (s * 0.64, c), (c, s * 0.82), (s * 0.36, c)], fill=255)
    # petals
    for ang in (0, 90, 180, 270):
        a = math.radians(ang)
        ex, ey = c + math.cos(a) * s * 0.36, c + math.sin(a) * s * 0.36
        d.ellipse([ex - s * 0.09, ey - s * 0.05, ex + s * 0.09, ey + s * 0.05] if ang in (0, 180)
                  else [ex - s * 0.05, ey - s * 0.09, ex + s * 0.05, ey + s * 0.09], fill=255)
    # curls (arcs) mirrored left/right
    for sx in (-1, 1):
        bx = c + sx * s * 0.34
        box = [bx - s * 0.16, s * 0.04, bx + s * 0.16, s * 0.36]
        start, end = (200, 20) if sx > 0 else (160, 340)
        d.arc(box, start=min(start, end), end=max(start, end), fill=255, width=lw * 2)
        box2 = [bx - s * 0.16, s * 0.64, bx + s * 0.16, s * 0.96]
        d.arc(box2, start=min(340, 160), end=max(340, 160), fill=255, width=lw * 2)
    # carve the centre of the diamond back out (relief ring)
    d.polygon([(c, s * 0.34), (s * 0.55, c), (c, s * 0.66), (s * 0.45, c)], fill=0)
    if flip:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    return np.asarray(img.resize((size, size), Image.LANCZOS), dtype=np.float32) / 255.0


def ribbon_band(W, H, slant, r, edge_noise=2.5):
    """Damask band, W x H, left end slanted by `slant` px; ragged ink top and bottom edge."""
    base = np.zeros((H, W), dtype=np.float32)
    tile = H - 8
    step = tile - 6
    for i, x in enumerate(range(slant, W, step) if tile >= 24 else []):
        m = motif(tile, i % 2 == 1)
        h, w = m.shape
        xe = min(W, x + w)
        base[4:4 + h, x:xe] = np.maximum(base[4:4 + h, x:xe], m[:, : xe - x])
    # band alpha: solid body with ragged edges
    yy, xx = np.mgrid[0:H, 0:W]
    n = value_noise(W, H, 6, r, 2)
    top = 2.0 + (n - 0.5) * edge_noise * 2.0
    n2 = value_noise(W, H, 6, r, 2)
    bot = H - 3.0 + (n2 - 0.5) * edge_noise * 2.0
    body = ((yy >= top) & (yy <= bot)).astype(np.float32)
    body *= (xx >= (slant * (1 - yy / H)) ).astype(np.float32)  # slanted left end
    # two-tone relief: body 0.9, motif lifts it to 1.0 and inner field dims to 0.55
    alpha = body * (0.55 + 0.45 * base)
    # fade the right end so the band can run off a window edge
    return alpha


def make_ribbon():
    r = random.Random(SEED + 5)
    a = ribbon_band(512, 44, 18, r)
    x = np.arange(512, dtype=np.float32)
    a = a * smooth((511 - x) / 40.0)[None, :]
    to_png(a, "ribbon.png")
    return a


def star(size, r):
    s = size * SS
    img = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(img)
    c = s / 2
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rad = s * (0.48 if i % 2 == 0 else 0.2)
        pts.append((c + math.cos(ang) * rad, c + math.sin(ang) * rad))
    d.polygon(pts, fill=255)
    return np.asarray(img.resize((size, size), Image.LANCZOS), dtype=np.float32) / 255.0


def make_ribbon_corner():
    r = random.Random(SEED + 7)
    S = 320
    band = ribbon_band(420, 58, 14, r, 3.5)
    img = Image.fromarray((band * 255).astype(np.uint8))
    img = img.rotate(-38, expand=True, resample=Image.BICUBIC)
    canvas = Image.new("L", (S, S), 0)
    # anchor: band enters from the right edge, a third of the way down
    canvas.paste(img, (S - img.width + 70, -30), img)
    # thin second line
    thin = Image.fromarray((ribbon_band(340, 14, 6, r, 1.4) * 255).astype(np.uint8)).rotate(-38, expand=True, resample=Image.BICUBIC)
    canvas.paste(thin, (S - thin.width + 40, 40), thin)
    a = np.asarray(canvas, dtype=np.float32) / 255.0
    # fade toward the open (left / bottom) edges so it can sit on any surface
    yy, xx = np.mgrid[0:S, 0:S]
    d = (S - xx) + yy  # distance from the top-right corner along the diagonal
    a *= smooth(1.0 - (d - 250) / 160.0)
    to_png(a, "ribbon-corner.png")
    return a


# ---------------------------------------------------------------- torn ink frame (9-slice)
def make_frame():
    r = random.Random(SEED + 11)
    S, B = 128, 28
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    d = np.minimum(np.minimum(xx, yy), np.minimum(S - 1 - xx, S - 1 - yy))
    n1 = value_noise(S, S, 14, r, 3)
    n2 = value_noise(S, S, 5, r, 2)
    thick = 10.0 + n1 * 12.0 + (n2 - 0.5) * 6.0  # 4..28 px of ink, ragged
    ink = (d < thick).astype(np.float32)
    # splatter dots near the inner edge and outside the ragged boundary
    big = Image.fromarray((ink * 255).astype(np.uint8))
    dr = ImageDraw.Draw(big)
    for _ in range(46):
        edge = r.randrange(4)
        t = r.random() * S
        off = 6 + r.random() * 20 + 8
        px, py = {0: (t, off), 1: (t, S - off), 2: (off, t), 3: (S - off, t)}[edge]
        rad = 0.8 + r.random() * 2.4
        dr.ellipse([px - rad, py - rad, px + rad, py + rad], fill=255)
    a = np.asarray(big.filter(ImageFilter.GaussianBlur(0.6)), dtype=np.float32) / 255.0
    # keep the centre clear
    a[B:S - B, B:S - B] = np.where(d[B:S - B, B:S - B] < thick[B:S - B, B:S - B], a[B:S - B, B:S - B], 0)
    a[B + 8:S - B - 8, B + 8:S - B - 8] = 0
    to_png(a, "frame.png")
    return a


# ---------------------------------------------------------------- grain and splatter (seamless)
def make_grain():
    r = random.Random(SEED + 13)
    S = 256
    n = np.zeros((S, S), dtype=np.float32)
    rr = np.random.default_rng(SEED + 14)
    n += rr.random((S, S)).astype(np.float32) * 0.5
    big = Image.fromarray((rr.random((S // 4, S // 4)) * 255).astype(np.uint8)).resize((S, S), Image.BICUBIC)
    n += np.asarray(big, dtype=np.float32) / 255.0 * 0.5
    a = np.clip((n - 0.62) * 2.6, 0, 1) * 0.55
    to_png(a, "grain.png")
    return a


def make_splat():
    r = random.Random(SEED + 17)
    S = 256
    img = Image.new("L", (S * SS, S * SS), 0)
    d = ImageDraw.Draw(img)
    for _ in range(5):
        cx, cy = r.random() * S, r.random() * S
        for _ in range(90):
            ang = r.random() * math.tau
            dist = abs(r.gauss(0, 28))
            px, py = cx + math.cos(ang) * dist, cy + math.sin(ang) * dist
            rad = max(0.6, 5.2 - dist * 0.12) * (0.5 + r.random())
            for ox in (-S, 0, S):
                for oy in (-S, 0, S):
                    d.ellipse([(px + ox - rad) * SS, (py + oy - rad) * SS, (px + ox + rad) * SS, (py + oy + rad) * SS], fill=255)
    a = np.asarray(img.resize((S, S), Image.LANCZOS), dtype=np.float32) / 255.0
    to_png(a, "splat.png")
    return a


def sheet(items):
    pad = 12
    w = max(i.shape[1] for _, i in items) + pad * 2
    h = sum(i.shape[0] + 26 for _, i in items) + pad
    sh = Image.new("RGB", (w, h), (20, 21, 22))
    d = ImageDraw.Draw(sh)
    y = pad
    for name, a in items:
        d.text((pad, y), name, fill=(170, 170, 168))
        y += 14
        tint = np.zeros((a.shape[0], a.shape[1], 3), dtype=np.float32)
        base = np.array([127, 168, 255], dtype=np.float32)
        bg = np.array([42, 41, 39], dtype=np.float32)
        tint = bg[None, None, :] * (1 - a[..., None]) + base[None, None, :] * a[..., None]
        sh.paste(Image.fromarray(tint.astype(np.uint8)), (pad, y))
        y += a.shape[0] + 12
    sh.save(HERE / "fx-sheet.png")


if __name__ == "__main__":
    items = [
        ("bolt-h (256x28)", make_bolt_h()),
        ("arc-a", make_arc(SEED + 2, "arc-a.png")),
        ("arc-b", make_arc(SEED + 3, "arc-b.png")),
        ("arc-c", make_arc(SEED + 4, "arc-c.png")),
        ("ribbon (512x44)", make_ribbon()),
        ("ribbon-corner (320)", make_ribbon_corner()),
        ("frame (128, 9-slice 28)", make_frame()),
        ("grain (256)", make_grain()),
        ("splat (256)", make_splat()),
    ]
    sheet(items)
    print("wrote", OUT)
