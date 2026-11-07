"""Deterministic white RGBA intensity masks (Pillow and numpy only).

glow-line 256x48: stretch horizontally beneath top-bar and other glowing rules.
glow-frame 128x128: bloom-only 9-slice, 32px margins; host draws its crisp border.
arc-strip 512x40: tile along lit rules and hovered Play buttons at low opacity.
spark 64x64: hot charge tip and selection-bracket flare.
halo 128x128: soft glow behind active sidebar items and above the library.
flourish 72x18: circuit ornament at the right end of a hairline rule.
fx-sheet: colored review sheet, deliberately not a runtime mask.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent.parent
S = 4


def fade(distance, end, rate):
    """Truncated exponential, exactly one at zero and zero at end."""
    tail = np.exp(-rate * end)
    return np.clip((np.exp(-rate * distance) - tail) / (1 - tail), 0, 1)


def fitted_rate(end, sample, value):
    lo, hi = 0.000001, 2.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if fade(sample, end, mid) > value:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def ink(size):
    return Image.new("L", (size[0] * S, size[1] * S))


def stroke(canvas, points, strength=1, width=1):
    ImageDraw.Draw(canvas).line(
        [(round(x * S), round(y * S)) for x, y in points],
        fill=round(strength * 255), width=round(width * S), joint="curve",
    )


def ring(canvas, x, y, radius, strength=1):
    ImageDraw.Draw(canvas).ellipse(
        tuple(round(v * S) for v in (x-radius, y-radius, x+radius, y+radius)),
        outline=round(255 * strength), width=S,
    )


def luminous(canvas, sigma, core, glow):
    sharp = np.asarray(canvas, dtype=float) / 255
    soft = np.asarray(canvas.filter(ImageFilter.GaussianBlur(sigma * S)), dtype=float) / 255
    if soft.max():
        soft *= glow / soft.max()
    field = np.maximum(core * sharp, soft)
    # LANCZOS on float images preserves sub-byte detail until final quantization.
    return np.asarray(Image.fromarray(field.astype(np.float32)).resize(
        (canvas.width // S, canvas.height // S), Image.Resampling.LANCZOS)).copy()


def glow_line():
    d = np.abs(np.arange(48) - 23.5)
    a = np.ones(48)
    body = (d > 1) & (d <= 5)
    a[body] = np.exp(np.log(0.6) * ((d[body] - 1) / 4) ** 2)
    bloom = d > 5
    a[bloom] = 0.6 * np.exp(-np.log(5) * (d[bloom] - 5) / 9)
    t = np.clip((d - 14) / 9, 0, 1)
    a *= 1 - t*t*(3 - 2*t)
    a[d >= 23] = 0
    return np.repeat(a[:, None], 256, axis=1)


def glow_frame():
    y, x = np.mgrid[:128, :128]
    qx, qy = np.abs(x - 64) - 32, np.abs(y - 64) - 32
    s = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0)
    # The requested inside/outside edge amplitudes differ: s == 0 uses outside.
    return np.where(s >= 0,
                    0.55 * fade(np.maximum(s, 0), 30, fitted_rate(30, 10, 0.18/0.55)),
                    0.35 * fade(np.maximum(-s, 0), 12, fitted_rate(12, 6, 0.08/0.35)))


def arc_strip():
    rng = np.random.default_rng(7319)
    paths = []
    for limit in (11, 7, 7):
        ys = np.array([20.0, 20.0])
        amplitude = 11.0
        for _ in range(7):
            refined = np.empty(ys.size * 2 - 1)
            refined[::2] = ys
            refined[1::2] = (ys[:-1] + ys[1:]) / 2 + rng.uniform(-amplitude, amplitude, ys.size-1)
            ys = refined
            amplitude *= 0.8  # Keep sharp, high-frequency kinks at the 4px scale.
        ys -= 20
        ys[ys > 0] *= limit / ys.max()
        ys[ys < 0] *= limit / -ys.min()
        # 4px horizontal steps with <=7.5px rises give 4..8.5px segments.
        for _ in range(3):
            for i in range(1, len(ys)-1):
                ys[i] = np.clip(ys[i], ys[i-1]-7.5, ys[i-1]+7.5)
            for i in range(len(ys)-2, 0, -1):
                ys[i] = np.clip(ys[i], ys[i+1]-7.5, ys[i+1]+7.5)
        ys += 20
        paths.append(np.column_stack((np.linspace(0, 512, ys.size), ys)))

    def draw_segments(canvas, path, values):
        for shift in (0, 512, 1024):
            for j in range(len(path)-1):
                # Independent straight segments: no spline or curved joins.
                if len(values) == len(path):
                    # Linear intensity ramp along each straight fork segment.
                    for k in range(8):
                        t = np.array([k, k+1])[:, None] / 8
                        segment = path[j] + t*(path[j+1]-path[j])
                        value = values[j] + (values[j+1]-values[j])*(k+1)/8
                        stroke(canvas, segment + (shift, 0), value)
                else:
                    stroke(canvas, path[j:j+2] + (shift, 0), values[j])

    a = np.zeros((40, 512), dtype=float)
    for n, path in enumerate(paths):
        canvas = ink((1536, 40))
        phase = path[:-1, 0] / 512 * 2*np.pi
        values = 0.65 + 0.2*np.cos(phase*5 + n*2)
        draw_segments(canvas, path, values)
        # Blur each filament independently so crossings retain their own bloom.
        a = np.maximum(a, luminous(canvas, 2.5, 1, 0.4)[:, 512:1024])

    hot = ink((1536, 40))
    for centre in (84, 204, 332, 440):
        j = centre // 4
        draw_segments(hot, paths[0][j-2:j+3], np.ones(4))
    a = np.maximum(a, luminous(hot, 4, 1, 0.55)[:, 512:1024])

    forks = ink((1536, 40))
    for n in range(8):
        path = paths[n % 3]
        j = int(rng.integers(6, len(path)-9))
        start = path[j]
        # Leave toward the roomier half of the strip, at 25..60 degrees.
        sign = 1 if start[1] < 20 else -1
        angle = sign * np.deg2rad(rng.uniform(25, 60))
        available = (37-start[1]) if sign > 0 else (start[1]-3)
        length = min(rng.uniform(10, 30), available / abs(np.sin(angle)))
        t = np.linspace(0, 1, max(4, int(np.ceil(length/4))+1))
        direction = np.array([np.cos(angle), np.sin(angle)])
        normal = np.array([-direction[1], direction[0]])
        jitter = rng.uniform(-1.8, 1.8, len(t))
        jitter[[0, -1]] = 0
        jitter[1] = 0  # Pin the actual departure angle to the requested range.
        fork = start + length*t[:, None]*direction + jitter[:, None]*normal
        draw_segments(forks, fork, 0.85*(1-t)**1.3)
        if n in (2, 6):
            branch = fork[len(fork)//2]
            u = np.linspace(0, 1, 4)
            end = np.array([9, -sign*5])
            split = branch + u[:, None]*end
            split[1:3, 1] += rng.uniform(-1, 1, 2)
            draw_segments(forks, split, 0.4*(1-u))
    a = np.maximum(a, luminous(forks, 2.5, 1, 0.3)[:, 512:1024])
    # Explicit support boundary; no stray antialiasing or bloom on outer rows.
    a[[0, -1], :] = 0
    a[:, -1] = a[:, 0]
    return a


def spark():
    y, x = np.mgrid[:64, :64].astype(float)
    x, y = x-32, y-32
    r = np.hypot(x, y)
    core = np.exp(-r*r / 8)
    def spike(along, across, extent):
        return np.exp(-0.5*(across/0.75)**2) * np.maximum(1-np.abs(along)/extent, 0)**1.6
    axes = np.maximum(spike(x, y, 31), spike(y, x, 31))
    diagonals = 0.3*np.maximum(spike((x+y)/np.sqrt(2), (x-y)/np.sqrt(2), 14),
                              spike((x-y)/np.sqrt(2), (x+y)/np.sqrt(2), 14))
    a = np.maximum.reduce((core, axes, diagonals))
    a[[0, -1], :] = 0
    a[:, [0, -1]] = 0
    return a


def halo():
    y, x = np.mgrid[:128, :128]
    r = np.hypot(x-64, y-64)
    return np.where(r < 63, np.exp(-(r/36)**2), 0)


def flourish():
    canvas = ink((72, 18))
    stroke(canvas, [(0, 9), (10, 9), (14, 13), (63.5, 13)])
    # Cubic joining curve meets the spiral at its outermost left point.
    t = np.linspace(0, 1, 80)[:, None]
    p = ((1-t)**3*np.array([10, 9]) + 3*(1-t)**2*t*np.array([18, 9])
         + 3*(1-t)*t*t*np.array([19, 6]) + t**3*np.array([25, 6]))
    stroke(canvas, p)
    theta = np.linspace(np.pi, np.pi+3*np.pi, 220)
    radius = np.linspace(5, 0.7, theta.size)
    stroke(canvas, np.column_stack((30+radius*np.cos(theta), 6+radius*np.sin(theta))))
    ring(canvas, 66, 13, 2.5)
    stroke(canvas, [(44, 7), (48, 3)])
    stroke(canvas, [(48, 7), (52, 3)])
    return luminous(canvas, 1.2, 1, 0.35)


def main():
    folder = ROOT / "src/Images/fx"
    folder.mkdir(parents=True, exist_ok=True)
    sprites = []
    for name, render in (("glow-line", glow_line), ("glow-frame", glow_frame),
                         ("arc-strip", arc_strip),
                         ("spark", spark), ("halo", halo), ("flourish", flourish)):
        alpha = np.rint(np.clip(render(), 0, 1)*255).astype(np.uint8)
        rgba = np.full((*alpha.shape, 4), 255, dtype=np.uint8)
        rgba[:, :, 3] = alpha
        sprite = Image.fromarray(rgba)
        path = folder / (name + ".png")
        sprite.save(path, optimize=True)
        sprites.append((path, sprite))
    # Native-size sprites in two columns, 16px gutters and readable labels.
    sheet = Image.new("RGBA", (816, 576), "#041A1B")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=13)
    positions = [(16, 16), (16, 104), (16, 272), (544, 16),
                 (544, 312), (640, 312), (16, 352)]
    for (path, sprite), (x, y) in zip(sprites, positions):
        tinted = Image.new("RGBA", sprite.size, "#75FFFB")
        tinted.putalpha(sprite.getchannel("A"))
        sheet.alpha_composite(tinted, (x, y))
        draw.text((x, y+sprite.height+8), path.name, font=font, fill="#75FFFB")
    sheet_path = ROOT / "art/fx-sheet.png"
    sheet.save(sheet_path, optimize=True)
    outputs = sprites + [(sheet_path, sheet)]
    total = 0
    for path, sprite in outputs:
        size = path.stat().st_size
        total += size
        print(f"{path.relative_to(ROOT).as_posix()}: {sprite.width} x {sprite.height}, {size:,} bytes")
    print(f"Total PNGs: {total:,} bytes (limit 300,000)")
    if total >= 300_000:
        raise RuntimeError("PNG budget exceeded")


if __name__ == "__main__":
    main()
