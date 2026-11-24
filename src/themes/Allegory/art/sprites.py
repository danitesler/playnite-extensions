"""Allegory FX sprites: white RGBA alpha masks (src/Images/fx/*.png).

Every mask is pure white (255, 255, 255) with the shape in alpha, so XAML (OpacityMask + a theme brush) and the HTML
previews (-webkit-mask + var(--token)) colour them. Deterministic: fixed seeds, rendered at 2x and downsampled.

Shapes are measured from the Metaphor: ReFantazio captures listed in RESEARCH.md:
  brush-band   the dry-brush band behind the current row (Shop, System, Dialogue): ragged top and bottom, bristle
               streaks, a dry feathered head, a tail that breaks into bristles and splatter.
  brush-dab    a short thick dab (rail current item, small toggles).
  brush-flick  a thin tapered flick (hover cue, mint flick behind the band).
  splatter     a droplet cluster (Play hover tail, title splats).
  torn-edge    the brushed right edge of the description card (tooltips), stretched vertically.
  brush-edge   banner foot: solid above, a ragged dragged-brush edge below.
  paint-ground a soft mottled ink wash (settings band, empty page; never behind lists).

Run: python3 src/themes/Allegory/art/sprites.py [--sheet <png>]
"""
import argparse
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "src", "Images", "fx"))
SS = 2  # supersampling


def smooth_noise(n, knots, rng, amp=1.0):
    """1D value noise: random knots, linear interpolation, then a box blur pass for softness."""
    xs = np.linspace(0, n - 1, knots)
    ys = rng.uniform(-1, 1, knots)
    v = np.interp(np.arange(n), xs, ys)
    k = max(3, int(n / knots / 2) | 1)
    v = np.convolve(v, np.ones(k) / k, mode="same")
    m = np.abs(v).max() or 1.0
    return v / m * amp


def blur2d(a, r):
    """Separable box blur (3 passes ~ gaussian)."""
    if r < 1:
        return a
    k = np.ones(2 * r + 1) / (2 * r + 1)
    for _ in range(3):
        a = np.apply_along_axis(lambda m: np.convolve(m, k, mode="same"), 0, a)
        a = np.apply_along_axis(lambda m: np.convolve(m, k, mode="same"), 1, a)
    return a


def field(h, w, rng, scales=((64, 1.0), (24, 0.5), (8, 0.25))):
    """Fractal value-noise field in [0, 1]."""
    acc = np.zeros((h, w))
    for cell, wgt in scales:
        gh, gw = max(2, h // cell + 2), max(2, w // cell + 2)
        g = rng.uniform(0, 1, (gh, gw))
        img = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)
        acc += blur2d(np.asarray(img, dtype=np.float64) / 255.0, max(1, cell // 3)) * wgt
    acc -= acc.min()
    return acc / (acc.max() or 1.0)


def droplets(a, rng, count, box, rmin, rmax, alpha=(0.8, 1.0)):
    """Stamp round droplets (some with a short trailing tail) inside box=(x0, y0, x1, y1)."""
    h, w = a.shape
    yy, xx = np.mgrid[0:h, 0:w]
    x0, y0, x1, y1 = box
    for _ in range(count):
        cx, cy = rng.uniform(x0, x1), rng.uniform(y0, y1)
        r = rng.uniform(rmin, rmax)
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        a[:] = np.maximum(a, np.clip((r - d) / 1.2, 0, 1) * rng.uniform(*alpha))
        if rng.random() < 0.35:  # tail
            ang = rng.uniform(0, 2 * np.pi)
            for t in np.linspace(0, 1, 6):
                tx, ty = cx + np.cos(ang) * r * 2.6 * t, cy + np.sin(ang) * r * 2.6 * t
                rr = r * (1 - t) * 0.6
                d = np.sqrt((xx - tx) ** 2 + (yy - ty) ** 2)
                a[:] = np.maximum(a, np.clip((rr - d) / 1.0, 0, 1))


def save(a, name):
    a = np.clip(a, 0, 1)
    h, w = a.shape
    img = Image.fromarray((a * 255).astype(np.uint8), "L").resize((w // SS, h // SS), Image.LANCZOS)
    rgba = Image.new("RGBA", img.size, (255, 255, 255, 0))
    rgba.putalpha(img)
    os.makedirs(OUT, exist_ok=True)
    rgba.save(os.path.join(OUT, name + ".png"), optimize=True)
    return rgba


def band(w, h, seed, core=(0.22, 0.80), head=0.07, tail=0.86, splat=True, spikes=14):
    """Horizontal dry-brush band mask (w, h in output pixels)."""
    rng = np.random.default_rng(seed)
    W, H = w * SS, h * SS
    a = np.zeros((H, W))
    x = np.arange(W)
    top = core[0] * H + smooth_noise(W, 18, rng, 0.04 * H) + smooth_noise(W, 150, rng, 0.03 * H) + smooth_noise(W, 420, rng, 0.012 * H)
    bot = core[1] * H + smooth_noise(W, 16, rng, 0.045 * H) + smooth_noise(W, 170, rng, 0.034 * H) + smooth_noise(W, 440, rng, 0.014 * H)
    # bristle tips that stick out of the edges
    for _ in range(spikes):
        cx = rng.uniform(0.05, 0.95) * W
        wd = rng.uniform(4, 22) * SS
        amp = rng.uniform(0.04, 0.12) * H
        g = np.exp(-((x - cx) / wd) ** 2) * amp
        r = rng.random()
        if r < 0.35:
            top -= g
        elif r < 0.7:
            bot += g
        elif r < 0.85:
            top += g * 0.7  # a bite into the band
        else:
            bot -= g * 0.7
    yy = np.arange(H)[:, None]
    inside = np.clip(np.minimum(yy - top[None, :], bot[None, :] - yy) / (1.2 * SS) + 0.5, 0, 1)
    # bristle streaks: each row carries its own density that drifts along x
    rows = rng.uniform(0.86, 1.0, H)
    rows = np.convolve(rows, np.ones(3) / 3, mode="same")
    drift = np.stack([smooth_noise(W, 6, rng, 1.0) for _ in range(4)])
    streak = rows[:, None] * (0.93 + 0.07 * drift[(np.arange(H) // max(1, H // 4)).clip(0, 3)])
    # dry gaps: thin horizontal lines where the brush skipped
    gaps = np.ones((H, W))
    for _ in range(int(H / SS / 12)):
        gy = int(rng.uniform(core[0] + 0.05, core[1] - 0.05) * H)
        gx0 = rng.uniform(0, 0.9) * W
        gx1 = gx0 + rng.uniform(0.04, 0.22) * W
        th = SS
        gaps[gy:gy + th, int(gx0):int(gx1)] *= rng.uniform(0.62, 0.85)
    a = inside * streak * gaps
    # dry feathered head: rows start at different x
    start = (head * W) * rng.uniform(0.0, 1.0, H)
    start = np.convolve(start, np.ones(5) / 5, mode="same")
    a *= np.clip((x[None, :] - start[:, None]) / (0.02 * W) , 0, 1)
    # tail breaks into bristles: rows end at different x
    end = W * (tail + rng.uniform(0.0, 0.13, H))
    end = np.convolve(end, np.ones(3) / 3, mode="same")
    a *= np.clip((end[:, None] - x[None, :]) / (0.012 * W), 0, 1)
    if splat:
        droplets(a, rng, 26, (tail * W, core[0] * H, 0.995 * W, core[1] * H), 1.2 * SS, 4.5 * SS)
        droplets(a, rng, 10, (0.1 * W, 0.02 * H, 0.95 * W, core[0] * H), 0.8 * SS, 2.6 * SS)
        droplets(a, rng, 10, (0.1 * W, core[1] * H, 0.95 * W, 0.98 * H), 0.8 * SS, 2.6 * SS)
    return a


def make_band():
    return save(band(1200, 96, 11), "brush-band")


def make_band_short():
    # a stubbier band for small cells (menu rows, toggles): less tail, fewer droplets
    return save(band(600, 72, 23, core=(0.2, 0.82), head=0.05, tail=0.9, spikes=8), "brush-band-short")


def make_dab():
    a = band(160, 112, 31, core=(0.16, 0.86), head=0.12, tail=0.72, spikes=6)
    return save(a, "brush-dab")


def make_flick():
    rng = np.random.default_rng(41)
    W, H = 480 * SS, 40 * SS
    x = np.arange(W)
    # thickness grows then tapers to a point, centre line drifts
    thick = (np.sin(np.clip(x / W, 0, 1) * np.pi) ** 0.6) * 0.32 * H
    thick *= np.clip(1.15 - x / W, 0, 1)
    mid = 0.5 * H + smooth_noise(W, 8, rng, 0.08 * H) - (x / W) * 0.12 * H
    yy = np.arange(H)[:, None]
    d = np.abs(yy - mid[None, :]) - thick[None, :]
    a = np.clip(-d / (1.0 * SS) + 0.5, 0, 1)
    rows = np.convolve(rng.uniform(0.7, 1.0, H), np.ones(3) / 3, mode="same")
    a *= rows[:, None]
    return save(a, "brush-flick")


def make_splatter():
    rng = np.random.default_rng(53)
    W = H = 256 * SS
    a = np.zeros((H, W))
    droplets(a, rng, 1, (0.42 * W, 0.42 * H, 0.5 * W, 0.5 * H), 22 * SS, 26 * SS)
    droplets(a, rng, 2, (0.6 * W, 0.25 * H, 0.75 * W, 0.7 * H), 8 * SS, 13 * SS)
    droplets(a, rng, 34, (0.1 * W, 0.1 * H, 0.9 * W, 0.9 * H), 2 * SS, 9 * SS)
    droplets(a, rng, 40, (0.02 * W, 0.02 * H, 0.98 * W, 0.98 * H), 0.8 * SS, 3 * SS)
    return save(a, "splatter")


def make_torn_edge():
    rng = np.random.default_rng(61)
    W, H = 32 * SS, 320 * SS
    y = np.arange(H)
    edge = 0.45 * W + smooth_noise(H, 24, rng, 0.2 * W) + smooth_noise(H, 120, rng, 0.12 * W)
    xx = np.arange(W)[None, :]
    a = np.clip((edge[:, None] - xx) / (0.8 * SS) + 0.5, 0, 1)
    # bristle drags beyond the edge
    for _ in range(40):
        ry = int(rng.uniform(0, H))
        th = int(rng.integers(1, 3) * SS)
        ln = rng.uniform(0.1, 0.45) * W
        x0 = int(edge[ry])
        a[ry:ry + th, x0:int(min(W, x0 + ln))] = np.maximum(a[ry:ry + th, x0:int(min(W, x0 + ln))], rng.uniform(0.5, 0.9))
    return save(a, "torn-edge")


def make_brush_edge():
    """Banner foot mask: opaque above; the bottom is a horizontal dry-brush drag (streaky rows that thin out), ending
    in a ragged edge with bristle tips, clear below. No drips: the game's paint edges are dragged, never running."""
    rng = np.random.default_rng(71)
    W, H = 1600 * SS, 480 * SS
    x = np.arange(W)
    edge = 0.8 * H + smooth_noise(W, 14, rng, 0.045 * H) + smooth_noise(W, 200, rng, 0.02 * H) + smooth_noise(W, 600, rng, 0.008 * H)
    for _ in range(40):  # short bristle tips poking below the edge
        cx = rng.uniform(0, W)
        wd = rng.uniform(6, 24) * SS
        edge += np.exp(-((x - cx) / wd) ** 2) * rng.uniform(0.006, 0.022) * H
    yy = np.arange(H)[:, None]
    a = np.clip((edge[None, :] - yy) / (1.2 * SS) + 0.5, 0, 1)
    # dragged zone: the last 20% above the edge breaks into long horizontal streaks (anisotropic noise: tall rows,
    # long runs), denser near the top of the zone and sparse at the edge
    zone = 0.2 * H
    depth = np.clip((yy - (edge[None, :] - zone)) / zone, 0, 1)
    g = rng.uniform(0, 1, (H // (2 * SS), W // (70 * SS)))
    streak = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), dtype=np.float64) / 255.0
    keep = np.clip((streak - depth * 0.95) * 3.0 + 0.5, 0, 1)
    a *= np.where(depth > 0, keep, 1.0)
    return save(a, "brush-edge")


def make_paint_ground():
    rng = np.random.default_rng(83)
    W, H = 960 * SS // 2, 540 * SS // 2  # half-res field, it is soft anyway
    f = field(H, W, rng, scales=((90, 1.0), (32, 0.55), (10, 0.22)))
    a = np.clip((f - 0.35) / 0.6, 0, 1) ** 1.4 * 0.9
    droplets(a, rng, 30, (0, 0, W, H), 1.0, 5.0, alpha=(0.4, 0.8))
    img = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "L").resize((960, 540), Image.BICUBIC)
    rgba = Image.new("RGBA", img.size, (255, 255, 255, 0))
    rgba.putalpha(img)
    os.makedirs(OUT, exist_ok=True)
    rgba.save(os.path.join(OUT, "paint-ground.png"), optimize=True)
    return rgba


def contact_sheet(imgs, path):
    pad = 16
    w = max(i.width for i in imgs) + 2 * pad
    h = sum(i.height + pad for i in imgs) + pad
    sheet = Image.new("RGBA", (w, h), (14, 29, 30, 255))
    y = pad
    colours = [(228, 52, 87), (34, 167, 173), (213, 182, 1), (247, 247, 247)]
    for n, i in enumerate(imgs):
        tint = Image.new("RGBA", i.size, colours[n % len(colours)] + (255,))
        tint.putalpha(i.getchannel("A"))
        sheet.alpha_composite(tint, (pad, y))
        y += i.height + pad
    sheet.save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheet", help="write a tinted contact sheet to this path (scratch)")
    args = ap.parse_args()
    imgs = [make_band(), make_band_short(), make_dab(), make_flick(), make_splatter(), make_torn_edge(),
            make_brush_edge(), make_paint_ground()]
    if args.sheet:
        contact_sheet(imgs, args.sheet)
    print("wrote", len(imgs), "masks to", OUT)


if __name__ == "__main__":
    main()
