"""Build Runeskald's original frost and low fog masks. Both are tinted in XAML."""
from pathlib import Path

import numpy as np
from PIL import Image


def cloud(rng, width, height, cells_x, cells_y):
    cells = rng.integers(0, 256, (cells_y, cells_x), dtype=np.uint8)
    field = Image.fromarray(cells).resize((width, height), Image.Resampling.BICUBIC)
    return np.asarray(field, dtype=float) / 255


def save_mask(values, file):
    alpha = np.clip(values, 0, 255).astype(np.uint8)
    mask = Image.new("RGBA", (alpha.shape[1], alpha.shape[0]), "white")
    mask.putalpha(Image.fromarray(alpha))
    mask.save(file, optimize=True)


def frost(rng, out):
    width, height = 512, 64
    y, x = np.mgrid[0:height, 0:width]
    u = x / (width - 1)
    broad = cloud(rng, width, height, 10, 3)
    fine = cloud(rng, width, height, 74, 13)
    # Oblique bands catch light inside the pale left half of the options strip.
    ridge = np.exp(-((np.sin(u * 16 + y / height + broad * 5)) / .22) ** 2)
    tone = 206 + 32 * broad + 15 * ridge + 9 * fine - 65 * u ** 2
    tone[:2] = np.maximum(tone[:2], 246 - 50 * u[:2])
    tone[-1] = 235 - 47 * u[-1]
    save_mask(tone, out / "silver-leaf.png")


def fog(rng, out):
    width, height = 600, 180
    y, x = np.mgrid[0:height, 0:width]
    broad = cloud(rng, width, height, 13, 5)
    fine = cloud(rng, width, height, 64, 15)
    center = .60 + .12 * np.sin(x / 100) + .20 * (broad - .5)
    envelope = np.exp(-((y / height - center) / .28) ** 2) * np.sin(np.pi * x / width) ** 1.3
    density = envelope * np.clip(160 * broad + 80 * fine - 69, 0, 145)
    save_mask(density, out / "mist.png")


if __name__ == "__main__":
    directory = Path(__file__).resolve().parents[1] / "src" / "Images" / "fx"
    directory.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(1842)
    frost(rng, directory)
    fog(rng, directory)
