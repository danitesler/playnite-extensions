"""Deterministic white RGBA masks & SVG brand mark for Cogplate (Pillow + NumPy).

Every sprite is pure white (RGB 255, 255, 255) with the shape solely in alpha (0..255).
XAML fills Rectangles with theme brushes and uses these PNGs as OpacityMask so ThemeModifier
recolors every layer automatically. Run from repo root:

    python src/themes/Cogplate/art/sprites.py [--sheet PATH]
"""

import argparse
import math
import os
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
FX = ROOT / "src" / "Images" / "fx"
S = 4
SEED = 40002


def rng_for(name: str) -> np.random.Generator:
    return np.random.default_rng([SEED, sum(ord(c) * (i + 1) for i, c in enumerate(name))])


def smooth(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def grid(w: int, h: int):
    ys, xs = np.mgrid[0 : h * S, 0 : w * S]
    return (xs + 0.5) / S, (ys + 0.5) / S


def down(a: np.ndarray, w: int, h: int) -> np.ndarray:
    return a.reshape(h, S, w, S).mean(axis=(1, 3))


def periodic_noise(n_h: int, n_w: int, sigma: float, r: np.random.Generator) -> np.ndarray:
    fy = np.fft.fftfreq(n_h)[:, None]
    fx = np.fft.fftfreq(n_w)[None, :]
    f2 = fx ** 2 + fy ** 2
    noise = np.fft.fft2(r.standard_normal((n_h, n_w)))
    out = np.fft.ifft2(noise * np.exp(-2.0 * math.pi ** 2 * sigma ** 2 * f2)).real
    std = out.std()
    return out / std if std > 1e-8 else out


def save_mask(path: Path, alpha: np.ndarray):
    path.parent.mkdir(parents=True, exist_ok=True)
    h, w = alpha.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.clip(np.round(alpha * 255.0), 0, 255).astype(np.uint8)
    Image.fromarray(rgba, mode="RGBA").save(path)


# ---------------------------------------------------------------------------
# 1. chain-trim (24x8 seamless horizontal tile): riveted mechanical chain track
# ---------------------------------------------------------------------------
def chain_trim():
    w, h = 24, 8
    X, Y = grid(w, h)
    # Periodic horizontal repeat every 12px (2 links per 24px tile)
    lx = np.mod(X, 12.0)
    # Outer link pill body: x in [1.2, 10.8], y in [1.0, 7.0]
    dx = np.maximum(np.abs(lx - 6.0) - 3.0, 0.0)
    dy = np.maximum(np.abs(Y - 4.0) - 1.3, 0.0)
    link_d = np.hypot(dx, dy)
    outer = smooth((1.65 - link_d) / 0.35)
    # Recessed inner slot
    inner_dx = np.maximum(np.abs(lx - 6.0) - 2.0, 0.0)
    inner_dy = np.maximum(np.abs(Y - 4.0) - 0.55, 0.0)
    inner = smooth((0.8 - np.hypot(inner_dx, inner_dy)) / 0.3)
    # Connecting pin bridging links at lx = 0 / 12
    pin_x = np.minimum(lx, 12.0 - lx)
    pin = smooth((1.6 - pin_x) / 0.35) * smooth((1.8 - np.abs(Y - 4.0)) / 0.35)
    # Center rivet stud
    rivet_d = np.hypot(lx - 6.0, Y - 4.0)
    rivet = smooth((1.05 - rivet_d) / 0.28)
    # Subtle top & bottom track rail hairlines
    rails = np.maximum(smooth((0.8 - np.abs(Y - 0.6)) / 0.3), smooth((0.8 - np.abs(Y - 7.4)) / 0.3)) * 0.42
    a = np.maximum(outer * (1.0 - 0.55 * inner), pin * 0.85)
    a = np.maximum(a, rivet)
    a = np.maximum(a, rails)
    return down(np.clip(a, 0.0, 1.0), w, h)


# ---------------------------------------------------------------------------
# 2. scanlines (4x4 tile): subtle horizontal CRT phosphor grating
# ---------------------------------------------------------------------------
def scanlines():
    a = np.zeros((4, 4), dtype=float)
    a[0, :] = 0.74
    a[1, :] = 0.40
    a[2, :] = 0.14
    a[3, :] = 0.26
    return a


# ---------------------------------------------------------------------------
# 3. glass-cracks (160x110): spiderweb shatter hairlines at bottom-right
# ---------------------------------------------------------------------------
def glass_cracks():
    w, h = 160, 110
    im = Image.new("L", (w * S, h * S), 0)
    draw = ImageDraw.Draw(im)
    r = rng_for("glass-cracks")
    ox, oy = 148.0, 102.0  # impact origin near bottom-right corner
    rays = [
        (184.0, 138.0, 2.2),
        (197.0, 125.0, 2.0),
        (212.0, 108.0, 1.8),
        (229.0, 96.0, 1.6),
        (246.0, 88.0, 1.4),
        (262.0, 74.0, 1.2),
        (165.0, 62.0, 1.4),
    ]
    pts_by_ray = []
    for ang_deg, length, width0 in rays:
        ang = math.radians(ang_deg)
        steps = 8
        pts = [(ox, oy)]
        cur_x, cur_y = ox, oy
        for i in range(1, steps + 1):
            t = i / steps
            jitter_a = ang + r.uniform(-0.14, 0.14)
            step_len = length / steps
            cur_x += math.cos(jitter_a) * step_len
            cur_y += math.sin(jitter_a) * step_len
            pts.append((cur_x, cur_y))
            seg_w = max(1, int(round(width0 * (1.0 - 0.65 * t) * S * 0.55)))
            draw.line(
                [(pts[-2][0] * S, pts[-2][1] * S), (pts[-1][0] * S, pts[-1][1] * S)],
                fill=int(255 * (1.0 - 0.55 * t)),
                width=seg_w,
            )
            # Occasional short fork
            if i in (3, 5) and r.random() > 0.35:
                fa = jitter_a + r.choice([-0.48, 0.48])
                fx = cur_x + math.cos(fa) * (length * 0.18)
                fy = cur_y + math.sin(fa) * (length * 0.18)
                draw.line(
                    [(cur_x * S, cur_y * S), (fx * S, fy * S)],
                    fill=int(255 * (0.55 - 0.25 * t)),
                    width=max(1, int(round(0.75 * S * 0.5))),
                )
        pts_by_ray.append(pts)

    # Concentric spiderweb bridges between neighboring rays
    for ring_idx in (2, 4, 6):
        for k in range(len(pts_by_ray) - 1):
            if r.random() > 0.25:
                p0 = pts_by_ray[k][ring_idx]
                p1 = pts_by_ray[k + 1][ring_idx]
                draw.line(
                    [(p0[0] * S, p0[1] * S), (p1[0] * S, p1[1] * S)],
                    fill=135 if ring_idx == 2 else 85,
                    width=max(1, int(round(0.65 * S * 0.5))),
                )

    arr = down(np.asarray(im, dtype=float) / 255.0, w, h)
    # Soft radial fade out toward top-left
    X1 = np.arange(w)[None, :] + 0.5
    Y1 = np.arange(h)[:, None] + 0.5
    dist = np.hypot(X1 - ox, Y1 - oy)
    fade = smooth((145.0 - dist) / 70.0)
    return np.clip(arr * fade, 0.0, 1.0)


# ---------------------------------------------------------------------------
# 4. glare (256x140): curved diagonal CRT monitor sheen
# ---------------------------------------------------------------------------
def glare():
    w, h = 256, 140
    X, Y = grid(w, h)
    u = (X / w) * 0.95 + (Y / h) * 0.65
    band1 = np.exp(-((u - 0.38) / 0.10) ** 2)
    band2 = 0.45 * np.exp(-((u - 0.62) / 0.06) ** 2)
    fall = smooth((1.05 - (X / w) * 0.85 - (Y / h) * 0.75) / 0.65)
    return down(0.55 * (band1 + band2) * fall, w, h)


# ---------------------------------------------------------------------------
# 5. parchment-grain (256x256 seamless): aged bone paper tooth & micro-fibers
# ---------------------------------------------------------------------------
def parchment_grain():
    r = rng_for("parchment-grain")
    z = (
        0.45 * periodic_noise(256, 256, 0.8, r)
        + 0.40 * periodic_noise(256, 256, 3.2, r)
        + 0.35 * periodic_noise(256, 256, 11.0, r)
    )
    z = z / z.std()
    flecks = (r.random((256, 256)) > 0.992) * r.uniform(0.35, 0.8, (256, 256))
    a = 0.55 * np.clip((z + 1.4) / 3.6, 0.0, 1.0) ** 1.25
    return np.clip(np.maximum(a, flecks), 0.0, 1.0)


# ---------------------------------------------------------------------------
# 6. parchment-stain (128x96): irregular corner weathering & ink blot mask
# ---------------------------------------------------------------------------
def parchment_stain():
    w, h = 128, 96
    r = rng_for("parchment-stain")
    z = 0.6 * periodic_noise(h, w, 4.5, r) + 0.4 * periodic_noise(h, w, 1.4, r)
    z = z / z.std()
    yy, xx = np.mgrid[0:h, 0:w]
    # Concentrated near bottom-right corner
    d = np.hypot((w - 1 - xx) / (w * 0.75), (h - 1 - yy) / (h * 0.75))
    edge = smooth((1.05 - d) / 0.65)
    a = edge * smooth((z + 0.35) / 1.1)
    # Scattered small splatter dots
    for _ in range(18):
        cx, cy = r.uniform(w * 0.45, w - 4), r.uniform(h * 0.35, h - 4)
        rad = r.uniform(1.0, 3.2)
        dot = smooth((rad - np.hypot(xx - cx, yy - cy)) / 0.8)
        a = np.maximum(a, dot * 0.85)
    return np.clip(a, 0.0, 1.0)


# ---------------------------------------------------------------------------
# 7. bloom (96x96, 9-slice with 36px corners): soft mint LED halo
# ---------------------------------------------------------------------------
def _blur2d(a: np.ndarray, sigma_px: float) -> np.ndarray:
    """Fast FFT 2D Gaussian blur on high-res array (sigma in final pixels)."""
    sig = sigma_px * S
    rad = max(2, int(math.ceil(sig * 3.0)))
    pad = np.pad(a, ((rad, rad), (rad, rad)), mode="constant")
    nh, nw = pad.shape
    fy = np.fft.fftfreq(nh)[:, None]
    fx = np.fft.rfftfreq(nw)[None, :]
    kern = np.exp(-2.0 * (math.pi * sig) ** 2 * (fx ** 2 + fy ** 2))
    out = np.fft.irfft2(np.fft.rfft2(pad) * kern, s=(nh, nw))
    return np.clip(out[rad : rad + a.shape[0], rad : rad + a.shape[1]], 0.0, None)


def bloom():
    w = h = 96
    X, Y = grid(w, h)
    # Exact 9-slice seam invariance across [36..60] with soft multi-scale radial phosphor falloff
    dx = np.maximum(np.maximum(36.0 - X, X - 60.0), 0.0)
    dy = np.maximum(np.maximum(36.0 - Y, Y - 60.0), 0.0)
    d = np.hypot(dx, dy)
    window = smooth((35.5 - d) / 9.0)
    glow = 0.45 * np.exp(-((d / 9.0) ** 1.25)) + 0.55 * np.exp(-((d / 16.0) ** 1.75))
    return down(np.clip(glow * window * 0.82, 0.0, 1.0), w, h)


# ---------------------------------------------------------------------------
# 7b. drop-glow (232x88) and drop-glow-square (76x80): multi-scale Gaussian CRT phosphor auras for the Play plate and
#     the 48px cover buttons. True 2D Gaussian dispersion eliminates hard box ridges and corners.
# ---------------------------------------------------------------------------
def _drop(w, h, x0, x1, y0, y1, s1, s2, s3, corner=8.0):
    X, Y = grid(w, h)
    cx = 0.5 * (x0 + x1)
    cy = 0.5 * (y0 + y1)
    hw = max(1.0, 0.5 * (x1 - x0) - corner)
    hh = max(1.0, 0.5 * (y1 - y0) - corner)
    qx = np.maximum(np.abs(X - cx) - hw, 0.0)
    qy = np.maximum(np.abs(Y - cy) - hh, 0.0)
    core = smooth((corner - np.hypot(qx, qy)) / 2.0)
    # Multi-scale 2D Gaussian dispersion (tight rim + medium halo + wide atmospheric CRT haze)
    g = 0.34 * _blur2d(core, s1) + 0.42 * _blur2d(core, s2) + 0.24 * _blur2d(core, s3)
    g = g / max(g.max(), 1e-6)
    bx = np.minimum(X / (w * 0.14), (w - X) / (w * 0.14))
    by = np.minimum(Y / (h * 0.16), (h - Y) / (h * 0.17))
    window = smooth(bx) * smooth(by)
    return down(np.clip(g * window * 0.78, 0.0, 1.0), w, h)


def drop_glow():
    # Play: 180x40 plate (X in 26..206, Y in 18..58) in a 232x88 box; core inset slightly & shifted 2px low
    return _drop(232, 88, 30.0, 202.0, 22.0, 58.0, 5.0, 10.5, 17.5, corner=10.0)


def drop_glow_square():
    # Cover Play / Info: 48x48 tile (X in 14..62, Y in 12..60) in a 76x80 box; core inset slightly & shifted 2px low
    return _drop(76, 80, 16.0, 60.0, 15.0, 59.0, 3.8, 7.5, 12.5, corner=8.0)


# ---------------------------------------------------------------------------
# 8. led-glow (24x40): glowing vertical LED capsule + soft radial bloom
# ---------------------------------------------------------------------------
def led_glow():
    w, h = 24, 40
    X, Y = grid(w, h)
    dx = np.abs(X - 12.0)
    dy = np.maximum(np.abs(Y - 20.0) - 9.0, 0.0)
    d = np.hypot(dx, dy)
    core = smooth((2.4 - d) / 0.6)
    halo = 0.72 * np.exp(-((d / 6.2) ** 2))
    return down(np.clip(np.maximum(core, halo), 0.0, 1.0), w, h)


# ---------------------------------------------------------------------------
# 9. vignette (256x256): CRT corner darkening mask
# ---------------------------------------------------------------------------
def vignette():
    w = h = 256
    X, Y = grid(w, h)
    u = (X / w) * 2.0 - 1.0
    v = (Y / h) * 2.0 - 1.0
    d = np.sqrt((u * 0.94) ** 2 + (v * 0.94) ** 2)
    return down(np.clip(smooth((d - 0.42) / 0.78), 0.0, 1.0) ** 1.45, w, h)


# ---------------------------------------------------------------------------
# 10. segmented-cells (16x8 tile): crisp HUD segmented gauge cells
# ---------------------------------------------------------------------------
def segmented_cells():
    w, h = 16, 8
    X, Y = grid(w, h)
    cell = smooth((6.0 - np.abs(X - 6.5)) / 0.4) * smooth((3.5 - np.abs(Y - 4.0)) / 0.4)
    return down(cell, w, h)


# ---------------------------------------------------------------------------
# Brand mark SVG: 12-tooth square-cut cogwheel enclosing octagonal CRT viewport
# ---------------------------------------------------------------------------
def build_mark_svg_and_data():
    # ViewBox 0..72, center (36, 36). Build 12 square-cut gear teeth around radius 25.5..33.0,
    # inner octagonal bore radius 16.5 (CCW for evenodd), plus separate horizontal CRT slit & center diamond!
    cx, cy = 36.0, 36.0
    n_teeth = 12
    r_root = 25.0
    r_tip = 33.0
    outer_pts = []
    for i in range(n_teeth):
        a0 = (2.0 * math.pi * i) / n_teeth
        step = (2.0 * math.pi) / n_teeth
        # Root start -> rise -> tooth plateau -> drop -> root end
        for ang, rad in [
            (a0 + step * 0.08, r_root),
            (a0 + step * 0.22, r_tip),
            (a0 + step * 0.56, r_tip),
            (a0 + step * 0.70, r_root),
        ]:
            outer_pts.append((cx + math.cos(ang) * rad, cy + math.sin(ang) * rad))

    # Inner octagonal cutout (winding opposite doesn't matter with fill-rule="evenodd")
    r_bore = 17.2
    bore_pts = []
    for i in range(8):
        ang = (2.0 * math.pi * i) / 8.0 + (math.pi / 8.0)
        bore_pts.append((cx + math.cos(ang) * r_bore, cy + math.sin(ang) * r_bore))

    def fmt_poly(pts):
        return "M " + " L ".join(f"{x:.2f},{y:.2f}" for x, y in pts) + " Z"

    gear_d = fmt_poly(outer_pts) + " " + fmt_poly(bore_pts)
    # Non-overlapping center aperture: twin angled horizontal sight pins + central chamfered hex/diamond
    pin_l = "M 22.50,34.20 L 29.00,34.20 L 29.00,37.80 L 22.50,37.80 Z"
    pin_r = "M 43.00,34.20 L 49.50,34.20 L 49.50,37.80 L 43.00,37.80 Z"
    core = "M 36.00,29.50 L 42.50,36.00 L 36.00,42.50 L 29.50,36.00 Z"
    full_data = f"{gear_d} {pin_l} {pin_r} {core}"

    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="512" height="512">\n'
        f'  <path fill="#FF7A1A" fill-rule="evenodd" d="{gear_d}"/>\n'
        f'  <path fill="#FF7A1A" d="{pin_l} {pin_r} {core}"/>\n'
        '</svg>\n'
    )
    (ROOT / "art" / "mark.svg").write_text(svg, encoding="utf-8")
    return full_data


def write_contact_sheet(sprites: dict[str, np.ndarray], out_path: Path):
    cols = 3
    cell_w, cell_h = 280, 150
    rows = math.ceil(len(sprites) / cols)
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (14, 18, 15))
    draw = ImageDraw.Draw(sheet)
    for idx, (name, alpha) in enumerate(sprites.items()):
        c = idx % cols
        r = idx // cols
        x0, y0 = c * cell_w + 14, r * cell_h + 24
        # Dark CRT green backing card
        draw.rectangle([c * cell_w + 6, r * cell_h + 6, (c + 1) * cell_w - 6, (r + 1) * cell_h - 6], fill=(16, 36, 21), outline=(76, 82, 75))
        draw.text((x0, r * cell_h + 8), f"{name} ({alpha.shape[1]}x{alpha.shape[0]})", fill=(242, 244, 234))
        # Tile small sprites so pattern is easy to inspect
        ah, aw = alpha.shape
        if aw <= 32 and ah <= 40:
            rep_x = max(1, min(8, 220 // aw))
            rep_y = max(1, min(6, 96 // ah))
            vis = np.tile(alpha, (rep_y, rep_x))
        else:
            vis = alpha
        vh, vw = vis.shape
        scale = min(244 / vw, 110 / vh, 2.0)
        nw, nh = max(1, int(vw * scale)), max(1, int(vh * scale))
        # Tint white mask with phosphor mint (#8AF0A8) over CRT green
        rgb = np.zeros((vh, vw, 3), dtype=np.uint8)
        rgb[..., 0] = np.round(16 * (1 - vis) + 138 * vis).astype(np.uint8)
        rgb[..., 1] = np.round(36 * (1 - vis) + 240 * vis).astype(np.uint8)
        rgb[..., 2] = np.round(21 * (1 - vis) + 168 * vis).astype(np.uint8)
        patch = Image.fromarray(rgb, mode="RGB").resize((nw, nh), Image.Resampling.BILINEAR)
        sheet.paste(patch, (x0, y0))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path)
    print(f"Wrote contact sheet: {out_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", default=os.path.join(tempfile.gettempdir(), "cogplate-fx-sheet.png"))
    args = parser.parse_args()

    sprites = {
        "chain-trim": chain_trim(),
        "scanlines": scanlines(),
        "glass-cracks": glass_cracks(),
        "glare": glare(),
        "parchment-grain": parchment_grain(),
        "parchment-stain": parchment_stain(),
        "bloom": bloom(),
        "drop-glow": drop_glow(),
        "drop-glow-square": drop_glow_square(),
        "led-glow": led_glow(),
        "vignette": vignette(),
        "segmented-cells": segmented_cells(),
    }
    for name, alpha in sprites.items():
        save_mask(FX / f"{name}.png", alpha)
        print(f"Saved {name}.png ({alpha.shape[1]}x{alpha.shape[0]})")

    xaml_data = build_mark_svg_and_data()
    print(f"Wrote art/mark.svg (XAML Data length: {len(xaml_data)})")
    write_contact_sheet(sprites, Path(args.sheet))


if __name__ == "__main__":
    main()
