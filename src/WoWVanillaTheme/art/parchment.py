#!/usr/bin/env python3
"""Seamless paper texture for the WoW Vanilla Theme's quest page: src/Images/parchment.png (256x256, RGBA).

Procedural (filtered noise on a torus, so it tiles), not a scan or the game's art. Light and dark grain plus a few
fibers, at low alpha: it sits over the ParchmentBrush gradient and only adds tooth to it.

  python3 art/parchment.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

N = 256
rng = np.random.default_rng(1112)


def blur_noise(sx, sy=None):
    """Gaussian-filtered noise on a torus (FFT), zero mean, unit deviation. sx/sy are sigmas in pixels."""
    sy = sx if sy is None else sy
    n = rng.standard_normal((N, N))
    fy = np.fft.fftfreq(N)[:, None]
    fx = np.fft.fftfreq(N)[None, :]
    kernel = np.exp(-((fx * 2 * np.pi * sx) ** 2 + (fy * 2 * np.pi * sy) ** 2) / 2)
    out = np.real(np.fft.ifft2(np.fft.fft2(n) * kernel))
    return (out - out.mean()) / out.std()


grain = 0.5 * blur_noise(0.8) + 0.8 * blur_noise(2.2)
cloud = blur_noise(24)
fibers = 0.6 * blur_noise(9, 0.7) + 0.5 * blur_noise(0.7, 9)
tone = 0.6 * grain + 0.12 * cloud + 0.5 * fibers
tone = (tone - tone.mean()) / tone.std()

dark = np.clip(-tone, 0, None)
light = np.clip(tone, 0, None)
alpha_dark = np.clip(dark * 0.075 + np.clip(-cloud - 1.1, 0, None) * 0.05, 0, 0.5)
alpha_light = np.clip(light * 0.055, 0, 0.32)

rgba = np.zeros((N, N, 4), dtype=np.float32)
dark_rgb = np.array([74, 44, 14], dtype=np.float32)
light_rgb = np.array([255, 244, 205], dtype=np.float32)
a = alpha_dark + alpha_light
weight = np.where(a > 0, alpha_dark / np.maximum(a, 1e-6), 0)[..., None]
rgba[..., :3] = dark_rgb * weight + light_rgb * (1 - weight)
rgba[..., 3] = a * 255
out = Path(__file__).resolve().parent.parent / "src" / "Images" / "parchment.png"
out.parent.mkdir(parents=True, exist_ok=True)
Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA").save(out, optimize=True)
print(out, out.stat().st_size, "bytes")

# preview: the tile repeated 3x3 over the page gradient
base = Image.new("RGBA", (N * 3, N * 3), (220, 196, 140, 255))
tile = Image.open(out)
for i in range(3):
    for j in range(3):
        base.alpha_composite(tile, (i * N, j * N))
base.convert("RGB").save(Path(__file__).with_name("parchment-preview.png"))
