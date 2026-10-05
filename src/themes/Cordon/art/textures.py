#!/usr/bin/env python3
"""Generates the texture overlays of Cordon: src/Images/grain.png and src/Images/rust.png.

The S.T.A.L.K.E.R. menus are painted on worn steel: a grainy olive-black panel inside a rusted, riveted frame. No game
file is used; both images are procedural noise, made tileable by filtering white noise in the frequency domain (the
FFT wraps around, so the left edge continues the right one).

Both are overlays, not fills: each control draws its brush (ThemeModifier can recolor it) and lays the texture over it
with an ImageBrush, so the grain darkens or lightens whatever color is below.

    grain.png  black and white specks and soft blotches at low alpha, for panels and fields
    rust.png   corrosion patches (rust brown, alpha up to about 0.5), pitting and fine light scratches, for metal plates

    python3 art/textures.py          (from src/themes/Cordon; needs: pip install numpy pillow)

Not shipped in the package.
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
    alpha = np.abs(field) * np.where(field < 0, 0.30, 0.14)
    save("grain.png", rgb, alpha)


def rust():
    patches = fbm(SIZE, [30, 12, 4], [0.55, 0.3, 0.15])
    detail = fbm(SIZE, [2, 1], [0.6, 0.4])
    # Corrosion: patches above a threshold, with ragged edges from the fine detail.
    corrosion = smoothstep(0.52, 0.78, patches * 0.85 + detail * 0.15)
    # Rust browns, darker where the corrosion is deepest.
    light = np.array([122, 66, 32], float)
    dark = np.array([58, 30, 16], float)
    depth = smoothstep(0.6, 1.0, patches)[..., None]
    rgb = light * (1 - depth) + dark * depth
    alpha = corrosion * 0.5

    # Pitting: small dark holes everywhere, more inside the rust.
    pits = (RNG.random((SIZE, SIZE)) > 0.995 - corrosion * 0.02).astype(float)
    rgb = np.where(pits[..., None] > 0, np.array([20, 14, 10], float), rgb)
    alpha = np.maximum(alpha, pits * 0.55)

    # Scratches: short straight light strokes, wrapped around the tile edges.
    scratch = np.zeros((SIZE, SIZE))
    for _ in range(30):
        x, y = RNG.random(2) * SIZE
        angle = RNG.normal(0.0, 0.35) + (np.pi / 2 if RNG.random() < 0.3 else 0)
        length = RNG.uniform(5, 28)
        strength = RNG.uniform(0.3, 0.7)
        for t in np.linspace(0, length, int(length * 2)):
            px = int(x + np.cos(angle) * t) % SIZE
            py = int(y + np.sin(angle) * t) % SIZE
            scratch[py, px] = max(scratch[py, px], strength)
    s = scratch > 0
    rgb = np.where(s[..., None], np.array([214, 200, 176], float), rgb)
    alpha = np.where(s, np.maximum(alpha * 0.4, scratch * 0.22), alpha)

    # General grime over the plate: faint dark mottling where there is no rust.
    grime = fbm(SIZE, [16, 5], [0.7, 0.3])
    g = (1 - corrosion) * (1 - s) * smoothstep(0.45, 0.9, grime) * 0.22
    rgb = np.where((g > alpha)[..., None], 0, rgb)
    alpha = np.maximum(alpha, g)
    save("rust.png", rgb, alpha)


if __name__ == "__main__":
    grain()
    rust()
