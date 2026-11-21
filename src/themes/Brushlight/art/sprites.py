"""Brushlight's paint sprites. Pure white RGBA masks, tinted by brushes in XAML (OpacityMask) and in the previews (CSS mask).

Run:  python src/themes/Brushlight/art/sprites.py
Writes src/Images/fx/:
  stroke.png      640x120 black dry-brush stroke of the combat commands: feathered bristle start, dry broken tail
  smear.png       640x160 ochre paint smear and splatter that sits under the combat commands
  chalk.png       128x128 tileable streaky grain (alpha 0-255): breaks the white plate rims into a dry-brush line
  lattice.png     48x48 tileable Art Deco diamond lattice (1px lines): the bronze pattern on cards and corners
  brush-foot.png  1024x120 tileable strip, clear at the top, opaque at the bottom, the change painted as horizontal
                  bristle streaks: the game page banner foot (filled with the page colour)
  fx-sheet.png    contact sheet for review (art/, not shipped)
Fixed seeds: output is repeatable.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "src" / "Images" / "fx"


def smooth_noise_1d(rng, n, knots, wrap=False):
    """Values 0..1 over n samples, smoothly interpolated between `knots` random knots."""
    k = rng.random(knots + (0 if wrap else 1))
    x = np.linspace(0, knots, n, endpoint=not wrap)
    i0 = np.floor(x).astype(int)
    f = x - i0
    f = f * f * (3 - 2 * f)
    if wrap:
        i0 = i0 % knots
        i1 = (i0 + 1) % knots
    else:
        i0 = np.clip(i0, 0, knots)
        i1 = np.clip(i0 + 1, 0, knots)
    return k[i0] * (1 - f) + k[i1] * f


def streaks(rng, h, w, cell_x, wrap=True):
    """Horizontal streak noise: random per row, smooth along x over `cell_x` px cells (periodic when wrap)."""
    cols = max(2, w // cell_x)
    base = rng.random((h, cols))
    x = np.linspace(0, cols, w, endpoint=False)
    i0 = np.floor(x).astype(int) % cols
    i1 = (i0 + 1) % cols
    f = x - np.floor(x)
    f = f * f * (3 - 2 * f)
    return base[:, i0] * (1 - f) + base[:, i1] * f


def to_mask(a, path):
    a = np.clip(a, 0, 1)
    img = np.zeros(a.shape + (4,), dtype=np.uint8)
    img[..., :3] = 255
    img[..., 3] = (a * 255).round().astype(np.uint8)
    Image.fromarray(img, "RGBA").save(path, optimize=True)
    return img


def blur(a, radius):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(im).astype(np.float32) / 255.0


def stroke():
    rng = np.random.default_rng(33)
    h, w = 120, 640
    y = np.arange(h)[:, None].astype(np.float32)
    x = np.arange(w)[None, :].astype(np.float32)
    mid, half = 60.0, 42.0
    v = np.abs(y - mid) / half
    # ragged start: bristles begin at different places, the edges start later
    start = 16 + 34 * smooth_noise_1d(rng, h, 18)[:, None] + 26 * v ** 2
    # tapering tail: the edges run out first
    end = w - 18 - 70 * smooth_noise_1d(rng, h, 14)[:, None] - 150 * v ** 1.6
    inside = (x >= start) & (x <= end) & (v <= 1.0)
    t = np.clip((x - start) / np.maximum(end - start, 1), 0, 1)
    s = streaks(rng, h, w, 22, wrap=False)
    grain = rng.random((h, w))
    dry = 0.12 + 0.62 * t ** 3 + 0.30 * np.clip(1 - t / 0.06, 0, 1) + 0.25 * v ** 4
    body = (0.72 * s + 0.28 * grain) > dry
    row = 0.78 + 0.22 * rng.random((h, 1))
    a = inside * body * row
    a = blur(a.astype(np.float32), 0.6)
    return np.clip(a * 1.25, 0, 1)


def smear():
    rng = np.random.default_rng(7)
    h, w = 160, 640
    acc = np.zeros((h, w), np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # blobs thrown left to right: dense and big on the left, thinner to the right
    for _ in range(70):
        cx = w * rng.beta(1.3, 2.2)
        cy = 80 + rng.normal(0, 18) - 0.03 * (cx - 320)
        rx = rng.uniform(18, 70) * (1.2 - cx / w)
        ry = rng.uniform(4, 13)
        acc += np.exp(-(((xx - cx) / max(rx, 4)) ** 2 + ((yy - cy) / ry) ** 2))
    s = streaks(rng, h, w, 18, wrap=False)
    paint = (acc * (0.55 + 0.6 * s)) > 0.55
    a = paint.astype(np.float32)
    # flecks and droplets around the band
    img = Image.new("L", (w * 2, h * 2), 0)
    d = ImageDraw.Draw(img)
    for _ in range(150):
        cx = w * rng.beta(1.2, 1.8) * 2
        cy = (80 + rng.normal(0, 34)) * 2
        r = rng.uniform(0.8, 3.4) * 2
        d.ellipse([cx - r, cy - r * rng.uniform(0.5, 1), cx + r, cy + r * rng.uniform(0.5, 1)], fill=255)
    for _ in range(14):
        x0 = w * rng.uniform(0.05, 0.7) * 2
        y0 = (80 + rng.normal(0, 16)) * 2
        ln = rng.uniform(40, 160) * 2
        d.line([x0, y0, x0 + ln, y0 - ln * rng.uniform(0.01, 0.08)], fill=255, width=int(rng.integers(1, 4)))
    fleck = np.asarray(img.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255.0
    a = np.maximum(a, fleck)
    return blur(a, 0.5)


def chalk():
    rng = np.random.default_rng(12)
    n = 128
    s = streaks(rng, n, n, 16, wrap=True)
    s2 = streaks(rng, n, n, 5, wrap=True)
    # wrap vertically too: blend the first and last rows
    a = 0.65 * s + 0.35 * s2
    a = (a - a.min()) / (a.max() - a.min())
    gaps = a < 0.22
    a = np.where(gaps, 0.0, 0.35 + 0.65 * a)
    return a.astype(np.float32)


def lattice():
    ss, n = 8, 48
    big = Image.new("L", (n * ss, n * ss), 0)
    d = ImageDraw.Draw(big)
    lw = ss  # 1px
    c = n * ss
    # outer diamond lattice (lines along both diagonals, period 48)
    for k in (-c, 0, c):
        d.line([(k, 0), (k + c, c)], fill=255, width=lw)
        d.line([(k + c, 0), (k, c)], fill=255, width=lw)
    # stepped inner diamond in each cell (Art Deco concentric step)
    for (cx, cy) in ((c / 2, c / 2), (0, 0), (c, 0), (0, c), (c, c)):
        for r in (10 * ss, 5 * ss):
            d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], outline=255, width=lw)
    # small crosses where the diagonals meet at the cell edges
    for (cx, cy) in ((c / 2, 0), (0, c / 2), (c, c / 2), (c / 2, c)):
        r = 3 * ss
        d.line([(cx - r, cy), (cx + r, cy)], fill=255, width=lw)
        d.line([(cx, cy - r), (cx, cy + r)], fill=255, width=lw)
    a = np.asarray(big.resize((n, n), Image.LANCZOS)).astype(np.float32) / 255.0
    return np.clip(a * 1.15, 0, 1)


def brush_foot():
    rng = np.random.default_rng(21)
    h, w = 120, 1024
    y = np.arange(h)[:, None].astype(np.float32)
    edge = 30 + 46 * smooth_noise_1d(rng, w, 16, wrap=True)[None, :] + 10 * smooth_noise_1d(rng, w, 64, wrap=True)[None, :]
    t = (y - edge) / 34.0
    ramp = np.clip(t, 0, 1)
    s = streaks(rng, h, w, 26, wrap=True)
    g = streaks(rng, h, w, 6, wrap=True)
    noise = 0.7 * s + 0.3 * g
    a = np.where(ramp >= 1, 1.0, (noise < ramp * 1.15).astype(np.float32) * (0.6 + 0.4 * ramp))
    a[-8:, :] = 1.0
    return blur(a, 0.6)


def contact(sheets):
    pad = 16
    wmax = max(a.shape[1] for _, a in sheets) + 2 * pad
    htot = sum(a.shape[0] + 2 * pad + 18 for _, a in sheets)
    out = Image.new("RGB", (wmax, htot), (28, 20, 28))
    d = ImageDraw.Draw(out)
    yy = 0
    for name, a in sheets:
        d.text((pad, yy + 2), name, fill=(235, 203, 167))
        tile = a
        if a.shape[0] <= 128:
            reps = (1, max(1, (wmax - 2 * pad) // a.shape[1]))
            tile = np.tile(a, reps) if name in ("chalk", "lattice") else a
        rgb = np.zeros(tile.shape + (3,), np.uint8)
        rgb[...] = (np.clip(tile, 0, 1)[..., None] * np.array([246, 243, 238])).astype(np.uint8)
        out.paste(Image.fromarray(rgb, "RGB"), (pad, yy + 18 + pad))
        yy += tile.shape[0] + 2 * pad + 18
    out.save(HERE / "fx-sheet.png")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sheets = [
        ("stroke", stroke()),
        ("smear", smear()),
        ("chalk", chalk()),
        ("lattice", lattice()),
        ("brush-foot", brush_foot()),
    ]
    for name, a in sheets:
        to_mask(a, OUT / f"{name}.png")
    contact(sheets)
    print("wrote", ", ".join(n for n, _ in sheets), "->", OUT)


if __name__ == "__main__":
    main()
