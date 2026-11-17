#!/usr/bin/env python3
"""Rimewash sprites: deterministic white alpha masks for the frosted watercolour look.

Everything is pure white (255,255,255) with varying alpha, so XAML tints it through an OpacityMask filled with a theme
brush and the HTML previews tint it through -webkit-mask (ThemeModifier recolours every effect).
All images are written at 2 px per DIP (PNG dpi 192), so WPF reads their size in DIP, and every sprite that is
tiled or 9-sliced says its cell sizes in DIP next to the generator.

    python art/sprites.py            # from the theme folder; writes src/Images/fx/*.png and art/fx-sheet.png

Needs Pillow and NumPy. Fixed seed: regenerating is bit-reproducible.
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "src", "Images", "fx")
SHEET = os.path.join(HERE, "fx-sheet.png")
PX = 2  # pixels per DIP
SEED = 20140429  # Child of Light's release date
rng_master = np.random.default_rng(SEED)

os.makedirs(OUT, exist_ok=True)


def rng(tag):
    return np.random.default_rng(SEED + sum(ord(c) * (i + 3) for i, c in enumerate(tag)))


def save(name, alpha, dpi=192):
    """alpha: float array 0..1 -> white RGBA PNG."""
    a = np.clip(alpha, 0.0, 1.0)
    h, w = a.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.round(a * 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    img.save(os.path.join(OUT, name), dpi=(dpi, dpi))
    return img


def smooth(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def periodic(n, period, rg, amp, harmonics=(1, 2, 3, 5, 8, 13)):
    """Sum of sines with integer cycles over `period` samples and zero phase: tiles, and is 0 at 0 and at period."""
    s = np.arange(n, dtype=np.float64)
    out = np.zeros(n)
    for k in harmonics:
        a = rg.uniform(0.3, 1.0) / (k ** 0.6)
        sign = rg.choice([-1.0, 1.0])
        out += sign * a * np.sin(2 * math.pi * k * s / period)
    out /= max(1e-6, np.abs(out).max())
    return out * amp


def fft_noise(h, w, beta, rg):
    """Tileable 1/f^beta noise in 0..1."""
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    f = np.sqrt(fx * fx + fy * fy)
    f[0, 0] = 1.0
    spec = (rg.standard_normal((h, w)) + 1j * rg.standard_normal((h, w))) / (f ** (beta / 2.0))
    spec[0, 0] = 0
    n = np.fft.ifft2(spec).real
    n -= n.min()
    n /= max(1e-9, n.max())
    return n


# --------------------------------------------------------------------------- plate-snow (9-slice, torn edge)
# Image 112 DIP = 224 px: corners 24 DIP (48 px), edge tile 64 DIP (128 px). The nominal edge sits MARGIN px inside the
# image so the wobble and the dry-brush feather have room; the interior is fully opaque.
def plate(name, size_px, corner_px, margin, radius, amp, feather, seed_tag, fleck=0.0):
    rg = rng(seed_tag)
    n = size_px
    cap = corner_px
    tile = n - 2 * cap
    # per-edge zero-phase periodic wobble (period = tile) so the tiled edge is seamless and 0 at every joint
    wob = {k: periodic(tile, tile, rg, amp, harmonics=(1, 2, 3, 5)) for k in ("t", "b", "l", "r")}
    fine = {k: periodic(tile, tile, rg, amp * 0.12, harmonics=(7, 11)) for k in ("t", "b", "l", "r")}
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float64)
    inner0, inner1 = margin, n - margin  # nominal edge lines
    r = radius
    # signed distance inside a rounded rect (positive inside)
    cx = np.clip(xx, inner0 + r, inner1 - r)
    cy = np.clip(yy, inner0 + r, inner1 - r)
    d = r - np.hypot(xx - cx, yy - cy)  # >0 inside the rounded corner discs ... fixed below
    # exact rounded-rect SDF
    qx = np.abs(xx - n / 2.0) - (n / 2.0 - margin - r)
    qy = np.abs(yy - n / 2.0) - (n / 2.0 - margin - r)
    outside = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0))
    inside = np.minimum(np.maximum(qx, qy), 0)
    sdf = -(outside + inside - r)  # positive inside
    # edge offset: look up the wobble by position along the nearest edge; corners use an angle window
    off = np.zeros((n, n))
    def lut(arr, s):
        s = np.clip(s, 0, tile - 1)
        return np.interp(s, np.arange(tile), arr)
    top = (yy < cap) & (xx >= cap) & (xx < n - cap)
    bot = (yy >= n - cap) & (xx >= cap) & (xx < n - cap)
    lef = (xx < cap) & (yy >= cap) & (yy < n - cap)
    rig = (xx >= n - cap) & (yy >= cap) & (yy < n - cap)
    off = np.where(top, lut(wob["t"], xx - cap) + lut(fine["t"], xx - cap), off)
    off = np.where(bot, lut(wob["b"], xx - cap) + lut(fine["b"], xx - cap), off)
    off = np.where(lef, lut(wob["l"], yy - cap) + lut(fine["l"], yy - cap), off)
    off = np.where(rig, lut(wob["r"], yy - cap) + lut(fine["r"], yy - cap), off)
    # corners: wobble windowed to zero at both joints
    for (x0, y0, kx, ky) in ((0, 0, "l", "t"), (n - cap, 0, "r", "t"), (0, n - cap, "l", "b"), (n - cap, n - cap, "r", "b")):
        cm = (xx >= x0) & (xx < x0 + cap) & (yy >= y0) & (yy < y0 + cap)
        ccx = x0 + (cap if x0 == 0 else 0)
        ccy = y0 + (cap if y0 == 0 else 0)
        ang = (np.arctan2(yy - ccy, xx - ccx))
        # angle -> 0..1 within the quarter turn
        base = {(0, 0): math.pi, (n - cap, 0): -math.pi / 2, (0, n - cap): math.pi / 2, (n - cap, n - cap): 0.0}[(x0, y0)]
        t = np.mod(ang - base, 2 * math.pi) / (math.pi / 2)
        t = np.clip(t, 0, 1)
        win = np.sin(math.pi * t)
        k = rg.integers(1, 3)
        corner_wob = win * (rg.uniform(0.5, 1.0) * amp * np.sin(2 * math.pi * k * t / 1.0 + rg.uniform(0, 6.28)) * 0.6
                            + 0.4 * amp * np.sin(2 * math.pi * (k + 2) * t + rg.uniform(0, 6.28)))
        off = np.where(cm, corner_wob, off)
    e = sdf + off  # positive inside the torn edge
    alpha = smooth(e, -feather * 0.15, feather)
    if fleck:
        fl = rg.random((n, n))
        near = smooth(np.abs(e), 0, feather * 1.6) < 0.9
        alpha = np.where(near & (e > -2) & (e < feather * 1.2), alpha * (1 - fleck * (fl > 0.82)), alpha)
    return alpha


def make_plate_snow():
    a = plate("plate-snow", 224, 48, margin=11, radius=34, amp=3.4, feather=9.0, seed_tag="snow", fleck=0.0)
    save("plate-snow.png", a)


def make_plate_shadow():
    # 9-slice: corners 40 DIP (80 px), edge tile 32 DIP (64 px) = 224 px. Soft blue shadow, drawn 6 DIP lower in XAML.
    n, cap = 224, 80
    base = plate("plate-shadow", n, cap, margin=32, radius=34, amp=2.0, feather=3.0, seed_tag="shadow")
    img = Image.fromarray((base * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(11))
    a = np.asarray(img, dtype=np.float64) / 255.0
    # the blurred edge is symmetric around the nominal edge, so it is periodic along each edge: tiles cleanly
    save("plate-shadow.png", a * 0.9)


def make_plate_chip():
    # Small torn chip for metadata chips and tags: 9-slice 40 DIP = 80 px, corners 12 DIP (24 px), tile 16 DIP (32 px)
    a = plate("plate-chip", 80, 24, margin=5, radius=12, amp=1.5, feather=4.2, seed_tag="chip", fleck=0.0)
    save("plate-chip.png", a)


# --------------------------------------------------------------------------- swipe (the white dry-brush stroke)
# Height 44 DIP = 88 px. Width: left cap 40 DIP (80 px) + tile 32 DIP (64 px) + right cap 40 DIP (80 px) = 224 px.
def make_swipe():
    rg = rng("swipe")
    h, tile, cap = 88, 64, 80
    w = cap + tile + cap
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    # lengthwise bristle gaps: per-row transparency, correlated over 2-5 rows
    rows = rg.random(h)
    rows = np.convolve(rows, np.ones(9) / 9, mode="same")
    rows = (rows - rows.min()) / (rows.max() - rows.min())
    gaps = 0.90 + 0.10 * smooth(rows, 0.25, 0.75)
    # ragged top and bottom edges, periodic over the tile
    top_w = periodic(tile, tile, rg, 3.0, harmonics=(1, 2, 3)) + periodic(tile, tile, rg, 0.8, harmonics=(5, 7))
    bot_w = periodic(tile, tile, rg, 3.0, harmonics=(1, 2, 3)) + periodic(tile, tile, rg, 0.8, harmonics=(5, 7))
    def per_x(arr):
        out = np.zeros(w)
        for x in range(w):
            if cap <= x < cap + tile:
                out[x] = arr[x - cap]
        return out
    # outside the tile the wobble is held at 0 (joints) and the end taper handles the rest
    topx, botx = per_x(top_w), per_x(bot_w)
    band_top, band_bot = 8, h - 8
    edge = np.minimum(yy - (band_top + topx[None, :]), (band_bot + botx[None, :]) - yy)
    body = smooth(edge, -0.5, 4.0)
    # end caps: each row ends at its own x (bristles), soft over 10 px
    ends_l = 4 + 44 * rg.random(h) ** 2.0
    ends_l = np.convolve(ends_l, np.ones(7) / 7, mode="same")
    ends_r = 4 + 44 * rg.random(h) ** 2.0
    ends_r = np.convolve(ends_r, np.ones(7) / 7, mode="same")
    lx = (xx - ends_l[:, None])
    rx = ((w - 1 - xx) - ends_r[:, None])
    endmask = smooth(lx, 0, 22) * smooth(rx, 0, 22)
    # dry-brush texture in the caps: streaks get lighter toward the tip
    tipl = smooth(cap - xx, -1, cap)
    tipr = smooth(xx - (cap + tile), -1, cap)
    tip = np.maximum(tipl, tipr)
    streak = 1.0 - tip * (1 - gaps[:, None]) * 2.2
    alpha = body * endmask * gaps[:, None] * np.clip(streak, 0.3, 1.0)
    save("swipe.png", alpha)


# --------------------------------------------------------------------------- chevron (the gold cursor)
def make_chevron():
    # 28 x 36 DIP = 56 x 72 px; an arrowhead with a notched back, hand-drawn: vertices jittered, edges brushed.
    rg = rng("chevron")
    S = 4  # supersample
    w, h = 56 * S, 72 * S
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    pts = [(8, 6), (49, 36), (8, 66), (19, 36)]
    jit = [(rg.uniform(-1.2, 1.2), rg.uniform(-1.2, 1.2)) for _ in pts]
    poly = [((x + jx) * S, (y + jy) * S) for (x, y), (jx, jy) in zip(pts, jit)]
    d.polygon(poly, fill=255)
    # soften corners like a loaded brush
    img = img.filter(ImageFilter.GaussianBlur(2.2 * S / 2))
    a = np.asarray(img, dtype=np.float64) / 255.0
    a = smooth(a, 0.32, 0.62)
    img = Image.fromarray((a * 255).astype(np.uint8), "L").resize((56, 72), Image.LANCZOS)
    arr = np.asarray(img, dtype=np.float64) / 255.0
    save("chevron.png", arr)
    # glow: a wide blur of the same shape, for the lantern glow under the chevron
    g = Image.fromarray((arr * 255).astype(np.uint8), "L")
    canvas = Image.new("L", (112, 128), 0)
    canvas.paste(g, (28, 28))
    canvas = canvas.filter(ImageFilter.GaussianBlur(9))
    ga = np.asarray(canvas, dtype=np.float64) / 255.0
    save("chevron-glow.png", np.clip(ga * 1.5, 0, 1))


# --------------------------------------------------------------------------- cloud (page wash mottling), tileable
def make_cloud():
    rg = rng("cloud")
    n = 512
    big = fft_noise(n, n, 2.6, rg)
    mid = fft_noise(n, n, 1.8, rg)
    fine = fft_noise(n, n, 1.1, rg)
    a = 0.70 * big + 0.26 * mid + 0.04 * fine
    a = smooth(a, 0.30, 0.78)
    # faint fibres: thin diagonal strokes, tileable by wrapping
    fib = Image.new("L", (n, n), 0)
    d = ImageDraw.Draw(fib)
    for _ in range(60):
        x, y = rg.integers(0, n), rg.integers(0, n)
        ln = rg.integers(14, 60)
        ang = rg.uniform(-0.5, 0.5)
        dx, dy = math.cos(ang) * ln, math.sin(ang) * ln
        for ox in (-n, 0, n):
            for oy in (-n, 0, n):
                d.line([(x + ox, y + oy), (x + ox + dx, y + oy + dy)], fill=int(rg.integers(40, 110)), width=1)
    fa = np.asarray(fib, dtype=np.float64) / 255.0
    alpha = np.clip(a * 0.85 + fa * 0.12, 0, 1) * 0.5
    save("cloud.png", alpha)


def make_vignette():
    # 256 x 144 px stretched over the window: clear in the middle, wash-deep toward the corners, torn by noise.
    rg = rng("vig")
    h, w = 144, 256
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    nx, ny = (xx / (w - 1) - 0.5) * 2, (yy / (h - 1) - 0.5) * 2
    r = np.sqrt((nx * 0.92) ** 2 + (ny * 1.05) ** 2)
    noise = fft_noise(h, w, 2.4, rg) - 0.5
    a = smooth(r + noise * 0.22, 0.72, 1.6)
    save("vignette.png", a * 0.8)


# --------------------------------------------------------------------------- pencil rule (tiled dotted line)
def make_pencil_rule():
    # tile 32 DIP wide x 3 DIP tall = 64 x 6 px: a dotted hand-drawn line with uneven dashes. Tiles seamlessly.
    rg = rng("rule")
    w, h = 64, 6
    a = np.zeros((h, w))
    x = 0
    while x < w:
        ln = int(rg.integers(2, 6))
        gap = int(rg.integers(2, 5))
        y = 2 + int(rg.integers(0, 2)) - 0
        a[y:y + 2, x:min(w, x + ln)] = rg.uniform(0.55, 1.0)
        x += ln + gap
    a[2:4, :] = np.maximum(a[2:4, :], 0.0)
    img = Image.fromarray((a * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.45))
    arr = np.asarray(img, dtype=np.float64) / 255.0
    arr = np.clip(arr * 1.25, 0, 1)
    save("pencil-rule.png", arr)


# --------------------------------------------------------------------------- glows and dots
def radial(size, power, core):
    c = (size - 1) / 2.0
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float64)
    r = np.hypot(xx - c, yy - c) / c
    glow = np.clip(1 - r, 0, 1) ** power
    return np.clip(glow + core * np.clip(1 - r / 0.28, 0, 1) ** 1.5, 0, 1)


def make_wisp():
    # Igniculus: 48 DIP = 96 px soft glow with a brighter core
    save("wisp.png", radial(96, 2.2, 0.8))
    # a short comet tail for the Play hover pass: 64 x 16 DIP = 128 x 32 px, bright at the right end
    h, w = 32, 128
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    t = xx / (w - 1)
    half = (1 - np.abs(yy - (h - 1) / 2) / ((h - 1) / 2))
    a = np.clip(half, 0, 1) ** 1.6 * (t ** 1.8)
    save("wisp-tail.png", a)


def make_mote():
    save("mote.png", radial(32, 1.6, 0.9))


def make_ring():
    # hand-drawn ring (BACK / SELECT prompt glyph): 32 DIP = 64 px, double line with a gap
    rg = rng("ring")
    S = 4
    n = 64 * S
    img = Image.new("L", (n, n), 0)
    d = ImageDraw.Draw(img)
    c = n / 2
    for rad, wd, ph in ((27 * S, 3.0 * S, 0.0), (19 * S, 2.2 * S, 1.3)):
        pts = []
        steps = 220
        for i in range(steps + 1):
            t = 2 * math.pi * i / steps
            wob = 1 + 0.018 * math.sin(3 * t + ph) + 0.012 * math.sin(7 * t + 2 * ph)
            pts.append((c + rad * wob * math.cos(t), c + rad * wob * math.sin(t)))
        d.line(pts, fill=255, width=int(wd), joint="curve")
    img = img.filter(ImageFilter.GaussianBlur(0.6 * S / 2)).resize((64, 64), Image.LANCZOS)
    save("ring.png", np.asarray(img, dtype=np.float64) / 255.0)


def make_blob():
    # gold watercolour blob (level badge, filter mark): 40 DIP = 80 px; pigment pools at the edge, centre lighter
    rg = rng("blob")
    n = 80
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float64)
    c = (n - 1) / 2.0
    ang = np.arctan2(yy - c, xx - c)
    wob = (1 + 0.07 * np.sin(3 * ang + 0.6) + 0.045 * np.sin(5 * ang + 2.0) + 0.03 * np.sin(8 * ang + 4.1))
    r = np.hypot(xx - c, yy - c) / (c * 0.86 * wob)
    body = smooth(1.0 - r, 0.0, 0.10)
    pool = smooth(r, 0.55, 0.96) * body
    mott = fft_noise(n, n, 2.0, rg)
    a = body * (0.72 + 0.20 * pool + 0.10 * (mott - 0.5))
    save("blob.png", a)


def make_roots():
    # faint pencil roots down the right edge of the menu pages: 120 x 260 DIP = 240 x 520 px
    rg = rng("roots")
    S = 3
    w, h = 240 * S, 520 * S
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)

    def branch(x, y, ang, length, width, depth):
        steps = max(6, int(length / (7 * S)))
        px, py = x, y
        a = ang
        for i in range(steps):
            a += rg.normal(0, 0.11)
            step = length / steps
            nx, ny = px + math.cos(a) * step, py + math.sin(a) * step
            wd = max(1, int(width * (1 - i / steps * 0.7)))
            d.line([(px, py), (nx, ny)], fill=int(rg.integers(170, 255)), width=wd)
            px, py = nx, ny
            if depth > 0 and rg.random() < 0.16:
                branch(px, py, a + rg.choice([-1, 1]) * rg.uniform(0.35, 0.9), length * rg.uniform(0.35, 0.6), max(1, width * 0.7), depth - 1)
        if depth > 0 and length > 30 * S:
            branch(px, py, a + rg.normal(0, 0.2), length * 0.5, max(1, width * 0.6), depth - 1)

    for i in range(7):
        branch(w * rg.uniform(0.55, 1.0), h * rg.uniform(0.0, 0.1), math.pi / 2 + rg.normal(-0.35, 0.25), h * rg.uniform(0.55, 0.95), 2.4 * S / 2, 3)
    img = img.filter(ImageFilter.GaussianBlur(0.5 * S / 2)).resize((240, 520), Image.LANCZOS)
    a = np.asarray(img, dtype=np.float64) / 255.0
    # fade toward the top and the left so it dissolves into the wash
    yy, xx = np.mgrid[0:520, 0:240].astype(np.float64)
    fade = smooth(yy / 520.0, 0.0, 0.25) * smooth(xx / 240.0, 0.05, 0.6)
    save("roots.png", a * fade * 0.9)


def make_crystal():
    # hoarfrost crystal used as the mark's body in sprites form (empty page): 96 DIP = 192 px, six brushed arms
    rg = rng("crystal")
    S = 3
    n = 192 * S
    img = Image.new("L", (n, n), 0)
    d = ImageDraw.Draw(img)
    c = n / 2
    for k in range(6):
        ang = math.pi / 3 * k - math.pi / 2
        for width, ln, off in ((4.2 * S, 0.88, 0.0),):
            ex, ey = c + math.cos(ang) * ln * c * 0.92, c + math.sin(ang) * ln * c * 0.92
            d.line([(c, c), (ex, ey)], fill=255, width=int(width))
            for t, bl in ((0.40, 0.30), (0.62, 0.22), (0.80, 0.14)):
                bx, by = c + math.cos(ang) * t * c * 0.92 * ln, c + math.sin(ang) * t * c * 0.92 * ln
                for sgn in (-1, 1):
                    a2 = ang + sgn * math.radians(rg.uniform(52, 62))
                    d.line([(bx, by), (bx + math.cos(a2) * bl * c, by + math.sin(a2) * bl * c)], fill=255, width=int(2.6 * S))
    img = img.filter(ImageFilter.GaussianBlur(0.7 * S / 2)).resize((192, 192), Image.LANCZOS)
    save("crystal.png", np.asarray(img, dtype=np.float64) / 255.0)


def contact_sheet():
    names = sorted(f for f in os.listdir(OUT) if f.endswith(".png"))
    cell_w, pad = 300, 12
    imgs = [Image.open(os.path.join(OUT, n)).convert("RGBA") for n in names]
    sc = []
    for im in imgs:
        s = min(1.0, (cell_w - pad * 2) / im.width, 240 / im.height)
        if im.width < 120 and im.height < 120:
            s = 2.0
        sc.append(im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.NEAREST))
    cols = 3
    rows = (len(sc) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * cell_w, rows * 280), (21, 30, 32, 255))
    d = ImageDraw.Draw(sheet)
    for i, (n, im) in enumerate(zip(names, sc)):
        cx, cy = (i % cols) * cell_w, (i // cols) * 280
        bg = Image.new("RGBA", (cell_w - 4, 276), (122, 148, 161, 255))
        sheet.paste(bg, (cx + 2, cy + 2))
        sheet.alpha_composite(im, (cx + pad, cy + 24))
        d.text((cx + 8, cy + 6), "%s  %dx%d" % (n, imgs[i].width, imgs[i].height), fill=(255, 255, 255, 255))
    sheet.convert("RGB").save(SHEET)


if __name__ == "__main__":
    make_plate_snow()
    make_plate_shadow()
    make_plate_chip()
    make_swipe()
    make_chevron()
    make_cloud()
    make_vignette()
    make_pencil_rule()
    make_wisp()
    make_mote()
    make_ring()
    make_blob()
    make_roots()
    make_crystal()
    contact_sheet()
    print("sprites written to", os.path.normpath(OUT))
