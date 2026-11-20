#!/usr/bin/env python3
"""Generates the texture and FX sprites of Cordon in src/Images/:
    grain.png      256x256 tileable warm dust/CRT speck and blotch overlay for panels
    rust.png       256x256 tileable weathered gunmetal brushing, corrosion mottling, pitting and scratches for plates
    scanlines.png  256x256 tileable CRT horizontal scanlines + faint 32px tactical grid ticks for recessed wells
    tab-glow.png   128x24 pure-white alpha mask for the center-hot glowing PDA under-bar lamp on active tabs/toggles

Inspired by S.T.A.L.K.E.R. 2: Heart of Chornobyl and S.T.A.L.K.E.R. menus. No game file is used; all images are
procedural with a fixed random seed for bit-reproducible builds.

    python art/textures.py          (from src/themes/Cordon; needs: pip install numpy pillow)
"""
import pathlib

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images"
SIZE = 256
RNG = np.random.default_rng(1986)  # fixed seed: the build is reproducible


def periodic_noise(size, sigma):
    """White noise low-passed with a Gaussian of `sigma` px in the frequency domain (periodic), scaled to 0..1."""
    white = RNG.standard_normal((size, size))
    f = np.fft.fftfreq(size)
    fx, fy = np.meshgrid(f, f)
    kernel = np.exp(-2 * (np.pi * sigma) ** 2 * (fx ** 2 + fy ** 2))
    n = np.real(np.fft.ifft2(np.fft.fft2(white) * kernel))
    n -= n.min()
    return n / n.max()


def fbm(size, sigmas, weights):
    total = sum(w * periodic_noise(size, s) for s, w in zip(sigmas, weights))
    total -= total.min()
    return total / total.max()


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def save(name, rgb, alpha):
    a = np.clip(alpha, 0, 1)
    img = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(img, "RGBA").save(OUT / name, optimize=True)
    print("wrote", OUT / name)


def grain():
    # Signed field: below 0 darkens (black at alpha), above 0 lightens (white at alpha).
    blotch = fbm(SIZE, [24, 9], [0.7, 0.3]) - 0.5
    speck = RNG.random((SIZE, SIZE)) - 0.5
    field = blotch * 0.55 + speck * 0.45
    rgb = np.where(field[..., None] < 0, 0, 255) * np.ones(3)
    alpha = np.abs(field) * np.where(field < 0, 0.28, 0.13)
    save("grain.png", rgb, alpha)


def rust():
    patches = fbm(SIZE, [30, 12, 4], [0.55, 0.3, 0.15])
    detail = fbm(SIZE, [2, 1], [0.6, 0.4])
    # Corrosion: weathered oxidation mottling over gunmetal plates.
    corrosion = smoothstep(0.50, 0.78, patches * 0.85 + detail * 0.15)
    light = np.array([112, 76, 46], float)
    dark = np.array([48, 30, 18], float)
    depth = smoothstep(0.58, 1.0, patches)[..., None]
    rgb = light * (1 - depth) + dark * depth
    alpha = corrosion * 0.46

    # Soft anisotropic brushed gunmetal grain (periodic in both X and Y, stretched horizontally).
    white = RNG.standard_normal((SIZE, SIZE))
    fx, fy = np.meshgrid(np.fft.fftfreq(SIZE), np.fft.fftfreq(SIZE))
    kernel = np.exp(-2 * (np.pi ** 2) * ((22.0 * fx) ** 2 + (1.6 * fy) ** 2))
    brush = np.real(np.fft.ifft2(np.fft.fft2(white) * kernel))
    brush = (brush - brush.min()) / (brush.max() - brush.min())
    bright_brush = smoothstep(0.55, 0.95, brush) * 0.07
    rgb = np.where((bright_brush > alpha)[..., None], np.array([196, 190, 176], float), rgb)
    alpha = np.maximum(alpha, bright_brush)

    # Pitting: small dark holes everywhere, more inside the rust.
    pits = (RNG.random((SIZE, SIZE)) > 0.995 - corrosion * 0.02).astype(float)
    rgb = np.where(pits[..., None] > 0, np.array([16, 14, 12], float), rgb)
    alpha = np.maximum(alpha, pits * 0.55)

    # Scratches: short straight light strokes, wrapped around the tile edges.
    scratch = np.zeros((SIZE, SIZE))
    for _ in range(34):
        x, y = RNG.random(2) * SIZE
        angle = RNG.normal(0.0, 0.32) + (np.pi / 2 if RNG.random() < 0.25 else 0)
        length = RNG.uniform(6, 30)
        strength = RNG.uniform(0.3, 0.72)
        for t in np.linspace(0, length, int(length * 2)):
            px = int(x + np.cos(angle) * t) % SIZE
            py = int(y + np.sin(angle) * t) % SIZE
            scratch[py, px] = max(scratch[py, px], strength)
    s = scratch > 0
    rgb = np.where(s[..., None], np.array([220, 212, 196], float), rgb)
    alpha = np.where(s, np.maximum(alpha * 0.4, scratch * 0.24), alpha)

    # General grime over the plate: faint dark mottling where there is no rust.
    grime = fbm(SIZE, [16, 5], [0.7, 0.3])
    g = (1 - corrosion) * (1 - s) * smoothstep(0.45, 0.9, grime) * 0.22
    rgb = np.where((g > alpha)[..., None], 0, rgb)
    alpha = np.maximum(alpha, g)
    save("rust.png", rgb, alpha)


def scanlines():
    """S.T.A.L.K.E.R. 2 recessed equipment & PDA CRT well overlay: subtle 2px horizontal scanlines + 32px reticle ticks."""
    yy, xx = np.mgrid[0:SIZE, 0:SIZE]
    # Every 2nd row is a dark CRT scanline, every other row has a faint greenish-white phosphor lift.
    is_dark_line = (yy % 2 == 0)
    rgb = np.zeros((SIZE, SIZE, 3), float)
    alpha = np.zeros((SIZE, SIZE), float)

    # Dark scanline rows
    alpha = np.where(is_dark_line, 0.22, 0.0)

    # Subtle 32px tactical grid hairlines and micro cross-ticks (white/olive highlight at very low alpha)
    grid_line = ((xx % 32 == 0) | (yy % 32 == 0))
    cross_tick = (((xx % 32 <= 2) | (xx % 32 >= 30)) & (yy % 32 == 0)) | (
        ((yy % 32 <= 2) | (yy % 32 >= 30)) & (xx % 32 == 0)
    )
    rgb = np.where(grid_line[..., None], np.array([180, 196, 178], float), rgb)
    alpha = np.where(grid_line, 0.018, alpha)
    alpha = np.where(cross_tick, 0.065, alpha)
    save("scanlines.png", rgb, alpha)


def tab_glow():
    """128x24 pure-white RGBA mask: S.T.A.L.K.E.R. 2 PDA center-hot glowing under-bar lamp with soft upward bloom."""
    w, h = 128, 24
    yy, xx = np.mgrid[0:h, 0:w]
    nx = (xx - (w - 1) / 2.0) / ((w - 1) / 2.0)  # -1..1
    # Bottom distance: y=h-1 is the bottom edge
    dy = (h - 1 - yy) / float(h - 1)  # 0 at bottom, 1 at top

    # Soft upward elliptical bloom centered horizontally at the bottom edge
    bloom_x = np.exp(-3.2 * (nx ** 2))
    bloom_y = np.exp(-3.6 * (dy ** 1.35))
    bloom = bloom_x * bloom_y * 0.58

    # Crisp 2px center-hot lamp bar along the bottom 2 rows (y = h-2, h-1)
    bar_profile = np.clip(1.0 - np.abs(nx) ** 1.8, 0.0, 1.0)
    bar_core = np.where(yy >= h - 2, bar_profile * 0.98, 0.0)
    # 1px specular lip immediately above the bar
    bar_lip = np.where(yy == h - 3, np.exp(-4.5 * (nx ** 2)) * 0.72, 0.0)

    # Faint scanline modulation in the bloom
    scan_mod = np.where(yy % 2 == 0, 0.92, 1.0)
    alpha = np.clip(np.maximum(bar_core, np.maximum(bar_lip, bloom * scan_mod)), 0.0, 1.0)
    rgb = np.full((h, w, 3), 255.0, float)
    save("tab-glow.png", rgb, alpha)


if __name__ == "__main__":
    grain()
    rust()
    scanlines()
    tab_glow()
