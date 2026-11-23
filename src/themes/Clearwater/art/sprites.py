"""Generate deterministic pure-white RGBA alpha masks for Clearwater Liquid Glass FX."""
from pathlib import Path
import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "src" / "Images" / "fx"
OUT.mkdir(parents=True, exist_ok=True)


def save_mask(name: str, alpha: np.ndarray) -> None:
    a = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    Image.fromarray(rgba, mode="RGBA").save(OUT / name, optimize=True)


def make_glass_rim() -> None:
    """64x64 9-slice inner specular top-and-perimeter glass lensing bloom."""
    w, h = 64, 64
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = xx / (w - 1)
    yn = yy / (h - 1)

    # Strong luminous top catchlight fading smoothly down
    top_bloom = np.exp(-yn * 6.5) * 0.88
    # Subtle side and bottom rim refraction
    left_rim = np.exp(-xn * 12.0) * 0.28
    right_rim = np.exp(-(1.0 - xn) * 12.0) * 0.28
    bottom_rim = np.exp(-(1.0 - yn) * 14.0) * 0.22

    # Crisp 1-2px top inner specular ridge
    top_ridge = np.exp(-((yn - 0.015) / 0.025) ** 2) * 0.95

    alpha = np.clip(np.maximum(top_ridge, top_bloom + left_rim + right_rim + bottom_rim), 0.0, 1.0)
    save_mask("glass-rim.png", alpha)


def make_glass_sheen() -> None:
    """160x48 diagonal optical caustic glass sheen for hover highlights."""
    w, h = 160, 48
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = xx / (w - 1)
    yn = yy / (h - 1)

    # Diagonal primary refraction band + secondary faint harmonic
    d1 = (xn * 1.15 - yn * 0.42) - 0.38
    band1 = np.exp(-(d1 / 0.14) ** 2) * 0.85
    d2 = (xn * 1.15 - yn * 0.42) - 0.62
    band2 = np.exp(-(d2 / 0.06) ** 2) * 0.35

    # Vertical specular falloff (brighter near upper lens edge)
    vert = 0.55 + 0.45 * (1.0 - yn)
    alpha = np.clip((band1 + band2) * vert, 0.0, 1.0)
    save_mask("glass-sheen.png", alpha)


def make_tahoe_mist() -> None:
    """256x160 soft alpine atmospheric mist for empty state and title bands."""
    w, h = 256, 160
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = (xx / (w - 1)) * 2.0 - 1.0
    yn = (yy / (h - 1)) * 2.0 - 1.0

    # Soft central radial glass halo + gentle upper-left alpine light
    r1 = np.sqrt((xn * 0.85) ** 2 + (yn * 1.05) ** 2)
    halo = np.exp(-(r1 / 0.82) ** 2) * 0.72
    r2 = np.sqrt(((xn + 0.55) * 0.9) ** 2 + ((yn + 0.55) * 1.1) ** 2)
    glow = np.exp(-(r2 / 0.75) ** 2) * 0.45

    alpha = np.clip(halo + glow, 0.0, 1.0)
    save_mask("tahoe-mist.png", alpha)


if __name__ == "__main__":
    make_glass_rim()
    make_glass_sheen()
    make_tahoe_mist()
    print(f"Generated Clearwater FX masks in {OUT}")
