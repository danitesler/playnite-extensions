"""Deterministic white RGBA masks for the Verst theme (Pillow and numpy only).

Every sprite is RGBA with RGB = 255 everywhere and the shape only in alpha: XAML fills a Rectangle with a theme
brush and uses the sprite as its OpacityMask, so ThemeModifier recolours it. Nothing is copied from either game: all
shapes come from the parameters below, a fixed seed and 4x supersampling (drawn at 4x, area-averaged down).
1 sprite pixel = 1 DIP. Run from the repo root:

    python src/themes/Verst/art/sprites.py [--sheet PATH]

Sprites (written to src/Images/fx/):
  grain 256x256 seamless grain                 flag 128x32 the slanted selection flag (3-slice 16|104|8)
  speckle 96x32 worn-paint speckle tile         banner 160x34 the torn heading banner (3-slice 10|118|32)
  coil 22x30 one ring of the notebook spiral    coil-hole 22x30 the punched hole under it
  scan 4x3 CRT scanline tile                    glare 256x160 curved glass sheen
  vignette 256x256 radial edge darkening        bloom 96x96 soft halo (9-slice, 40px corners)
  glow 128x32 soft horizontal glow              lamp 28x12 / lamp-v 12x28 one tunnel lamp per 28px (tiles)
  map 320x240 rail map lines and stations       stain 256x256 seamless paper stains and fibres

It also writes art/mark.svg (the tunnel-mouth mark, filled outlines only, no overlapping sub-paths, because the
repo's icon rasterizer XORs overlaps) and prints the same geometry as XAML path data. A contact sheet for review goes
to --sheet (default: the temp folder, never the repo).
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
SEED = 2033


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


def knots(r, n, count, lo=-1.0, hi=1.0):
    k = r.uniform(lo, hi, size=count)
    return np.interp(np.linspace(0, count - 1, n), np.arange(count), k)


def periodic_noise(n_h, n_w, sigma, r):
    """Gaussian-blurred white noise that wraps on both axes (FFT blur), unit std."""
    fy = np.fft.fftfreq(n_h)[:, None]
    fx = np.fft.fftfreq(n_w)[None, :]
    f2 = fx ** 2 + fy ** 2
    noise = np.fft.fft2(r.standard_normal((n_h, n_w)))
    out = np.fft.ifft2(noise * np.exp(-2 * np.pi ** 2 * sigma ** 2 * f2)).real
    return out / out.std()


# ----------------------------------------------------------------------------------------------------------------
# grain: the iron's faint texture


def grain():
    r = rng_for("grain")
    z = 0.35 * periodic_noise(256, 256, 0.6, r) + 0.55 * periodic_noise(256, 256, 2.0, r) + 0.5 * periodic_noise(256, 256, 7.0, r)
    z = z / z.std()
    return 0.6 * np.clip((z + 1.6) / 4.2, 0, 1) ** 1.3


# ----------------------------------------------------------------------------------------------------------------
# the flag: Exodus' selection bar. Left end cut on a slant (top reaches further left), chipped; right end slightly rough.


def flag():
    w, h = 128, 32
    r = rng_for("flag")
    im = canvas(w, h)
    n = 64
    ys = np.linspace(0, h, n)
    # slant: x = 1 at the top to 13 at the bottom, with chips
    left = 1 + 12 * (ys / h) + np.clip(knots(r, n, 14, -0.6, 1.6), 0, None)
    right = w - 2.2 + knots(r, n, 9, -0.7, 0.7)
    top = 0.8 + knots(r, 40, 12, -0.5, 0.5)
    bottom = h - 0.8 + knots(r, 40, 12, -0.5, 0.5)
    xs_top = np.linspace(left[0], right[0], 40)
    xs_bot = np.linspace(left[-1], right[-1], 40)
    pts = [(left[i], ys[i]) for i in range(n)]                      # left edge, top to bottom
    pts += [(xs_bot[i], bottom[i]) for i in range(40)]               # foot, left to right
    pts += [(right[n - 1 - i], ys[n - 1 - i]) for i in range(n)]     # right edge, bottom to top
    pts += [(xs_top[39 - i], top[39 - i]) for i in range(40)]        # top, right to left
    fill_poly(im, pts)
    return from_canvas(im, w, h)


def speckle():
    """Worn-paint speckle tile (wraps horizontally): sparse light chips, denser toward the top and bottom edges."""
    w, h = 96, 32
    r = rng_for("speckle")
    z = 0.6 * periodic_noise(h, w, 0.7, r) + 0.4 * periodic_noise(h, w, 2.2, r)
    z = z / z.std()
    yy = (np.arange(h)[:, None] + 0.5) / h
    edge = np.maximum(smooth((0.28 - yy) / 0.28), smooth((yy - 0.72) / 0.28))
    thresh = 1.65 - 0.9 * edge
    a = smooth((z - thresh) / 0.35)
    # scattered single chips
    chips = r.random((h, w)) > 0.985
    a = np.maximum(a, chips * r.uniform(0.4, 0.9, (h, w)))
    return np.clip(a, 0, 1)


def banner():
    """The torn heading banner: ragged left end, straight top and bottom with wear, the right end cut on a slant
    (the top runs out further than the foot)."""
    w, h = 160, 34
    r = rng_for("banner")
    im = canvas(w, h)
    n = 60
    ys = np.linspace(0, h, n)
    left = 1.5 + np.abs(knots(r, n, 18, -2.2, 2.2))
    right = (w - 1) - 26 * (ys / h) + knots(r, n, 10, -0.8, 0.8)
    top = 1.0 + np.abs(knots(r, 50, 26, -0.9, 0.9))
    bottom = h - 1.0 - np.abs(knots(r, 50, 26, -0.9, 0.9))
    xt = np.linspace(left[0], right[0], 50)
    xb = np.linspace(right[-1], left[-1], 50)
    pts = [(xt[i], top[i]) for i in range(50)]
    pts += [(right[i], ys[i]) for i in range(n)]
    pts += [(xb[i], bottom[i]) for i in range(50)]
    pts += [(left[n - 1 - i], ys[n - 1 - i]) for i in range(n)]
    fill_poly(im, pts)
    a = from_canvas(im, w, h)
    # a few nicks out of the edges
    for _ in range(9):
        cx, cy = r.uniform(12, w - 34), r.choice([1.5, h - 1.5])
        rad = r.uniform(0.8, 1.8)
        X, Y = np.meshgrid(np.arange(w) + 0.5, np.arange(h) + 0.5)
        a = a * np.clip(np.hypot(X - cx, Y - cy) - rad, 0, 1)
    return a


# ----------------------------------------------------------------------------------------------------------------
# the notebook spiral


def coil():
    """One wire ring seen from the front: a tall narrow loop leaning a little right, brightest on its left flank.
    The strip's paper edge sits at y = 12; the loop's foot goes into the hole at y = 21."""
    w, h = 22, 30
    X, Y = grid(w, h)
    cx, cy, rx, ry = 10.0, 11.5, 4.8, 10.5
    lean = (Y - cy) * 0.14
    d = np.hypot((X - cx - lean) / rx, (Y - cy) / ry)
    ring = smooth((d - 0.5) / 0.12) * smooth((1.0 - d) / 0.12)
    shade = 0.72 + 0.28 * smooth((cx + lean - X + 3.0) / 6.0)
    a = ring * shade
    # the loop's lower right flank is behind the page (it goes through the hole): hide it
    behind = (X > cx + lean + 0.5) & (Y > cy + 4)
    a = np.where(behind, 0.0, a)
    return down(a, w, h)


def coil_hole():
    w, h = 22, 30
    X, Y = grid(w, h)
    d = np.hypot((X - 10.8) / 2.8, (Y - 21.5) / 2.1)
    return down(smooth((1.0 - d) / 0.25), w, h)


# ----------------------------------------------------------------------------------------------------------------
# the oscilloscope


def scan():
    a = np.zeros((3, 4))
    a[0, :] = 1.0
    a[1, :] = 0.25
    return a


def glare():
    """A curved sheen across the glass's upper left, as the bezel's curve catches the room light."""
    w, h = 256, 160
    X, Y = grid(w, h)
    u = (X / w) * 1.0 + (Y / h) * 0.55
    band = np.exp(-((u - 0.42) / 0.11) ** 2)
    fall = smooth((1.0 - (X / w) * 0.9 - (Y / h) * 0.8) / 0.6)
    return down(0.55 * band * fall, w, h)


def vignette():
    w, h = 256, 256
    X, Y = grid(w, h)
    u, v = X / w * 2 - 1, Y / h * 2 - 1
    d = np.sqrt((u * 0.96) ** 2 + (v * 0.96) ** 2)
    return down(np.clip(smooth((d - 0.45) / 0.75), 0, 1) ** 1.4, w, h)


def bloom():
    """Soft halo around a rectangle: full inside the inner box (36..60), Gaussian falloff outward."""
    w = h = 96
    X, Y = grid(w, h)
    dx = np.maximum(np.maximum(36 - X, X - 60), 0)
    dy = np.maximum(np.maximum(36 - Y, Y - 60), 0)
    d = np.hypot(dx, dy)
    return down(np.exp(-(d / 13.0) ** 2), w, h)


def glow():
    w, h = 128, 32
    X, Y = grid(w, h)
    d = np.hypot((X - 64) / 60, (Y - 16) / 14)
    return down(np.exp(-(d / 0.55) ** 2), w, h)


def lamp():
    """One tunnel lamp every 28px: a 5px core and a soft halo, so a strip reads as a chain of lamps."""
    w, h = 28, 12
    X, Y = grid(w, h)
    d = np.hypot(X - 7, Y - 6)
    core = smooth((2.6 - d) / 0.6)
    halo = 0.45 * np.exp(-(d / 4.2) ** 2)
    return down(np.clip(np.maximum(core, halo), 0, 1), w, h)


def lamp_v():
    return lamp().T


# ----------------------------------------------------------------------------------------------------------------
# the loading screen's rail map


def rail_map():
    w, h = 320, 240
    r = rng_for("map")
    im = Image.new("L", (w * S, h * S), 0)
    d = ImageDraw.Draw(im)

    def line(pts, width):
        d.line([(x * S, y * S) for x, y in pts], fill=255, width=int(width * S), joint="curve")

    cx, cy = 168, 118
    # ring line
    ring = [(cx + 62 * math.cos(t) * (1 + 0.06 * math.sin(3 * t)), cy + 52 * math.sin(t) * (1 + 0.05 * math.cos(2 * t)))
            for t in np.linspace(0, 2 * math.pi, 120)]
    line(ring, 1.4)
    # radial lines
    for k in range(9):
        ang = k * (2 * math.pi / 9) + r.uniform(-0.18, 0.18)
        pts = []
        rad = 0
        x, y = cx, cy
        while rad < 230:
            rad += r.uniform(10, 22)
            ang += r.uniform(-0.12, 0.12)
            x, y = cx + rad * math.cos(ang), cy + rad * math.sin(ang) * 0.82
            pts.append((x, y))
        line([(cx, cy)] + pts, 1.1 if k % 3 else 1.6)
        for (px, py) in pts[1::2]:
            if 4 < px < w - 4 and 4 < py < h - 4:
                d.ellipse(((px - 2) * S, (py - 2) * S, (px + 2) * S, (py + 2) * S), outline=255, width=int(0.9 * S))
    # contour scratches
    for _ in range(14):
        x0, y0 = r.uniform(0, w), r.uniform(0, h)
        pts = [(x0 + i * 6, y0 + 8 * math.sin(i * 0.5 + x0)) for i in range(r.integers(4, 12))]
        line(pts, 0.6)
    a = np.asarray(im, dtype=float) / 255.0
    a = down(a, w, h)
    # fade toward the edges
    X, Y = np.meshgrid(np.arange(w) + 0.5, np.arange(h) + 0.5)
    e = smooth(np.minimum(np.minimum(X, w - X), np.minimum(Y, h - Y)) / 36)
    return a * e


def stain():
    r = rng_for("stain")
    z = 0.7 * periodic_noise(256, 256, 18.0, r) + 0.3 * periodic_noise(256, 256, 5.0, r)
    z = z / z.std()
    blot = smooth((z - 0.8) / 1.4) * 0.55
    fib = periodic_noise(256, 256, 0.9, r)
    fibres = smooth((fib - 2.4) / 0.6) * 0.35
    return np.clip(blot + fibres, 0, 1)


# ----------------------------------------------------------------------------------------------------------------
# the mark: a tunnel mouth. A ribbed arch (five segments split by 2-unit gaps), two rails meeting under a lamp, two
# sleepers. 72-unit box. Filled outlines only, none overlapping.

def arc_segment(cx, cy, r0, r1, a0, a1, steps=18):
    outer = [(cx + r1 * math.cos(a), cy - r1 * math.sin(a)) for a in np.linspace(a0, a1, steps)]
    inner = [(cx + r0 * math.cos(a), cy - r0 * math.sin(a)) for a in np.linspace(a1, a0, steps)]
    return outer + inner


def mark_geometry():
    cx, cy = 36.0, 40.0
    r0, r1 = 23.0, 31.0
    polys = []
    # legs: straight down from the arch ends to the foot
    polys.append([(cx - r1, cy), (cx - r0, cy), (cx - r0, 68.0), (cx - r1, 68.0)])
    polys.append([(cx + r0, cy), (cx + r1, cy), (cx + r1, 68.0), (cx + r0, 68.0)])
    # arch: five ribs with gaps; the leg tops leave a 2-unit gap below the first and last rib
    gap = 2.0 / ((r0 + r1) / 2)  # radians for a 2-unit gap at mid radius
    lo, hi = math.radians(0) + gap, math.radians(180) - gap
    n = 5
    span = (hi - lo - gap * (n - 1)) / n
    for i in range(n):
        a0 = lo + i * (span + gap)
        polys.append(arc_segment(cx, cy - 2.0, r0, r1, a0, a0 + span))
    # lamp at the vanishing point
    lamp = (cx, 41.0, 3.6)
    # rails: from the foot to just under the lamp, tapering
    vy = 46.0
    polys.append([(cx - 1.4, vy), (cx - 0.4, vy), (cx - 11.0, 68.0), (cx - 15.5, 68.0)])
    polys.append([(cx + 0.4, vy), (cx + 1.4, vy), (cx + 15.5, 68.0), (cx + 11.0, 68.0)])

    # sleepers between the rails (stop 0.8 short of each rail)
    def rail_x(y, side):
        t = (y - vy) / (68.0 - vy)
        inner = 0.4 + t * (11.0 - 0.4)
        return cx + side * inner

    for y0, y1 in ((56.0, 58.2), (62.0, 64.8)):
        xl0, xl1 = rail_x(y0, -1) + 0.8, rail_x(y1, -1) + 0.8
        xr0, xr1 = rail_x(y0, 1) - 0.8, rail_x(y1, 1) - 0.8
        polys.append([(xl0, y0), (xr0, y0), (xr1, y1), (xl1, y1)])
    return polys, lamp


def path_d(poly):
    return "M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in poly) + " Z"


def write_mark():
    polys, (lx, ly, lr) = mark_geometry()
    paths = "\n".join(f'  <path d="{path_d(p)}"/>' for p in polys)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="512" height="512" fill="#FF7A1A">\n'
           f'{paths}\n  <circle cx="{lx}" cy="{ly}" r="{lr}"/>\n</svg>\n')
    (ROOT / "art" / "mark.svg").write_text(svg, encoding="utf-8")
    arch = " ".join(path_d(p) for p in polys[:7])
    track = " ".join(path_d(p) for p in polys[7:])
    return arch, track, (lx, ly, lr)


# ----------------------------------------------------------------------------------------------------------------

SPRITES = {
    "grain": (256, 256, grain),
    "flag": (128, 32, flag),
    "speckle": (96, 32, speckle),
    "banner": (160, 34, banner),
    "coil": (22, 30, coil),
    "coil-hole": (22, 30, coil_hole),
    "scan": (4, 3, scan),
    "glare": (256, 160, glare),
    "vignette": (256, 256, vignette),
    "bloom": (96, 96, bloom),
    "glow": (128, 32, glow),
    "lamp": (28, 12, lamp),
    "lamp-v": (12, 28, lamp_v),
    "map": (320, 240, rail_map),
    "stain": (256, 256, stain),
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
    h, w = a.shape
    mid = Image.fromarray((a[:, left:w - right] * 255).astype(np.uint8)).resize((width - left - right, h), Image.BILINEAR)
    return np.concatenate([a[:, :left], np.asarray(mid, dtype=float) / 255, a[:, w - right:]], axis=1)


def contact_sheet(alphas, path):
    from PIL import ImageFont

    font = ImageFont.load_default()
    W = 1400
    items = []

    def add(label, arr, scale=1, color=(255, 255, 255), bg=(30, 30, 30)):
        items.append((label, np.asarray(arr, dtype=float), scale, color, bg))

    flag_c = (168, 77, 21)
    add("flag x3", alphas["flag"], 3, flag_c)
    add("flag 3-slice at 300 x2", stretch_h(alphas["flag"], 16, 8, 300), 2, flag_c)
    add("speckle x3 (tiled 3)", np.tile(alphas["speckle"], (1, 3)), 2, (218, 123, 65))
    add("banner x3", alphas["banner"], 3, flag_c)
    add("banner 3-slice at 260 x2", stretch_h(alphas["banner"], 10, 32, 260), 2, flag_c)
    add("coil tiled 10 x4", np.tile(alphas["coil"], (1, 10)), 4, (184, 181, 173), (230, 222, 209))
    add("coil-hole tiled 10 x4", np.tile(alphas["coil-hole"], (1, 10)), 4, (10, 10, 10), (230, 222, 209))
    add("scan tiled x6", np.tile(alphas["scan"], (12, 40)), 3, (0, 0, 0), (44, 51, 56))
    add("glare", alphas["glare"], 1, (255, 255, 255), (44, 51, 56))
    add("vignette", alphas["vignette"], 1, (0, 0, 0), (120, 120, 120))
    add("bloom x2", alphas["bloom"], 2, (242, 106, 18))
    add("glow x2", alphas["glow"], 2, (255, 166, 91))
    add("lamp tiled 8 x3", np.tile(alphas["lamp"], (1, 8)), 3, (142, 209, 79))
    add("map", alphas["map"], 1)
    add("stain", alphas["stain"], 1, (160, 145, 125), (230, 222, 209))
    add("grain", alphas["grain"], 1)

    pad, x, y, row_h, placed = 14, 14, 14, 0, []
    for label, arr, scale, color, bg in items:
        h, w = arr.shape
        iw, ih = w * scale, h * scale + 12
        if x + iw + pad > W:
            x, y, row_h = pad, y + row_h + pad, 0
        placed.append((label, arr, scale, color, bg, x, y))
        x += iw + pad
        row_h = max(row_h, ih)
    sheet = Image.new("RGB", (W, y + row_h + pad), (90, 90, 90))
    draw = ImageDraw.Draw(sheet)
    for label, arr, scale, color, bg, px, py in placed:
        img = Image.fromarray(np.rint(arr * 255).astype(np.uint8))
        if scale > 1:
            img = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
        sheet.paste(Image.new("RGB", img.size, bg), (px, py + 12))
        sheet.paste(Image.new("RGB", img.size, color), (px, py + 12), img)
        draw.text((px, py), label, fill=(240, 240, 240), font=font)
    sheet.save(path)


def main():
    ap = argparse.ArgumentParser()
    default_sheet = os.environ.get("VERST_FX_SHEET") or str(Path(tempfile.gettempdir()) / "verst-fx-sheet.png")
    ap.add_argument("--sheet", default=default_sheet, help="contact sheet path (outside the repo)")
    args = ap.parse_args()
    FX.mkdir(parents=True, exist_ok=True)
    alphas = {}
    for name, (w, h, fn) in SPRITES.items():
        alphas[name] = save(name, fn(), w, h) / 255.0
        print(f"{name}.png {w}x{h}")
    arch, track, lampc = write_mark()
    print("xaml arch:", arch)
    print("xaml track:", track)
    print("xaml lamp:", lampc)
    contact_sheet(alphas, args.sheet)
    print("sheet:", args.sheet)


if __name__ == "__main__":
    main()
