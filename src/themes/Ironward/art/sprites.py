"""Deterministic sprite & mark generator for Ironward (seed 2212).

Outputs pure white (255, 255, 255) RGBA alpha-mask PNGs to src/Images/fx/
so WPF OpacityMask and HTML -webkit-mask tint them with theme brushes.
"""
from __future__ import annotations

import argparse
import math
from pathlib import Path

import numpy as np
from PIL import Image

SEED = 2212
ROOT = Path(__file__).resolve().parent.parent
FX_DIR = ROOT / "src" / "Images" / "fx"


def generate_mark_svg(out_path: Path) -> None:
    """Write the original Ironward saw-shield + spearhead diamond mark SVG."""
    cx, cy = 50.0, 50.0
    n_teeth = 10
    outer_r = 48.0
    base_r = 38.5
    inner_r = 31.0

    # Saw-toothed circular shield rim (angled directional teeth)
    outer_pts = []
    for i in range(n_teeth):
        a0 = math.radians(i * (360.0 / n_teeth) - 90)
        a1 = math.radians((i + 0.52) * (360.0 / n_teeth) - 90)
        a2 = math.radians((i + 0.80) * (360.0 / n_teeth) - 90)
        outer_pts.append((cx + base_r * math.cos(a0), cy + base_r * math.sin(a0)))
        outer_pts.append((cx + outer_r * math.cos(a1), cy + outer_r * math.sin(a1)))
        outer_pts.append((cx + base_r * math.cos(a2), cy + base_r * math.sin(a2)))

    ring_d = "M " + " L ".join(f"{x:.2f} {y:.2f}" for x, y in outer_pts) + " Z"
    # Inner hollow circle (counter-clockwise for evenodd)
    inner_pts = []
    steps = 40
    for i in range(steps):
        a = math.radians(-i * (360.0 / steps))
        inner_pts.append((cx + inner_r * math.cos(a), cy + inner_r * math.sin(a)))
    hole_d = " M " + " L ".join(f"{x:.2f} {y:.2f}" for x, y in inner_pts) + " Z"

    # Central vertical spearhead diamond with hollow core + barbed horizontal guard ticks
    spear_d = (
        "M 50 13 L 61.5 50 L 50 87 L 38.5 50 Z "
        "M 50 28 L 44.5 50 L 50 72 L 55.5 50 Z "
        "M 23 50 L 36.5 45.5 L 34 50 L 36.5 54.5 Z "
        "M 77 50 L 63.5 45.5 L 66 50 L 63.5 54.5 Z"
    )

    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        '<!-- Original Ironward mark: 10-tooth saw-shield ring enclosing a hollow spearhead diamond ward. -->'
        f'<path fill="#fff" fill-rule="evenodd" d="{ring_d}{hole_d}"/>'
        f'<path fill="#fff" fill-rule="evenodd" d="{spear_d}"/>'
        '</svg>\n'
    )
    out_path.write_text(svg, encoding="utf-8")


def white_rgba(alpha: np.ndarray) -> Image.Image:
    h, w = alpha.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    return Image.fromarray(rgba, mode="RGBA")


def make_stone_grain(rng: np.random.Generator, size: int = 256) -> Image.Image:
    """Seamless weathered iron-stone micro-mottle (periodic FFT noise)."""
    fy = np.fft.fftfreq(size)[:, None]
    fx = np.fft.fftfreq(size)[None, :]
    freq = np.hypot(fx, fy)
    # Multi-scale 1/f^1.1 falloff for natural mineral iron texture
    spectrum = (rng.normal(size=(size, size)) + 1j * rng.normal(size=(size, size)))
    falloff = np.where(freq > 0, 1.0 / (freq * size) ** 1.05, 0.0)
    low = np.fft.ifft2(spectrum * falloff).real
    low = (low - low.min()) / (low.max() - low.min() + 1e-8)

    fine = rng.normal(0.5, 0.14, size=(size, size))
    alpha = 0.65 * low + 0.35 * np.clip(fine, 0.0, 1.0)
    alpha = np.clip((alpha - 0.18) / 0.72, 0.0, 1.0) ** 1.25
    return white_rgba(alpha)


def make_ember_glow(size: int = 128, pad: int = 32) -> Image.Image:
    """9-slice soft forge bloom: 32px feathered border, solid-zero interior or soft halo."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    # Distance outside inner [pad, size-pad] box
    dx = np.maximum(0.0, np.maximum(pad - x, x - (size - 1 - pad)))
    dy = np.maximum(0.0, np.maximum(pad - y, y - (size - 1 - pad)))
    dist = np.hypot(dx, dy) / float(pad)
    # Smooth forge bloom decay; reaches zero cleanly before edge
    alpha = np.clip(1.0 - dist, 0.0, 1.0) ** 2.1
    # Slightly reduce core inside inner box so plate sits clean, glow stays rich on rim
    inside = (x >= pad) & (x <= size - 1 - pad) & (y >= pad) & (y <= size - 1 - pad)
    alpha = np.where(inside, 0.55, alpha)
    return white_rgba(alpha * 0.92)


def make_spear_flare(w: int = 256, h: int = 48) -> Image.Image:
    """Horizontal spear-tipped forge flare streak for active bars and Play hover tips."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (x - (w - 1) * 0.5) / ((w - 1) * 0.5)
    ny = (y - (h - 1) * 0.5) / ((h - 1) * 0.5)

    # Narrow core line + broad soft ember halo tapering smoothly to tips
    horiz = np.clip(1.0 - np.abs(nx) ** 1.45, 0.0, 1.0)
    # Taper vertical thickness toward ends like a forged spearhead flash
    thick = 0.16 + 0.34 * horiz
    core = np.exp(-((ny / (thick * 0.35)) ** 2))
    halo = np.exp(-((ny / (thick * 1.45)) ** 2)) * 0.45
    alpha = horiz * np.clip(core + halo, 0.0, 1.0)
    return white_rgba(alpha)


def make_vignette_bloom(size: int = 256) -> Image.Image:
    """Soft radial forge aura for the empty-state shield crest."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    r = np.hypot((x - (size - 1) * 0.5) / (size * 0.5), (y - (size - 1) * 0.5) / (size * 0.5))
    alpha = np.clip(1.0 - r, 0.0, 1.0) ** 2.2
    return white_rgba(alpha)


def render_contact_sheet(sprites: dict[str, Image.Image], out_path: Path) -> None:
    cols = 2
    cell_w, cell_h = 280, 160
    sheet = Image.new("RGB", (cols * cell_w + 30, 2 * cell_h + 30), (9, 33, 35))
    tints = {
        "stone-grain.png": (181, 208, 210),
        "ember-glow.png": (249, 136, 81),
        "spear-flare.png": (249, 136, 81),
        "vignette-bloom.png": (225, 114, 57),
    }
    for idx, (name, mask) in enumerate(sprites.items()):
        col = idx % cols
        row = idx // cols
        x0 = 15 + col * cell_w
        y0 = 15 + row * cell_h
        rgb = tints.get(name, (238, 243, 242))
        tinted = Image.new("RGBA", mask.size, (*rgb, 255))
        tinted.putalpha(mask.getchannel("A"))
        thumb = tinted.copy()
        thumb.thumbnail((cell_w - 20, cell_h - 20), Image.Resampling.LANCZOS)
        px = x0 + (cell_w - thumb.width) // 2
        py = y0 + (cell_h - thumb.height) // 2
        sheet.paste(thumb, (px, py), thumb)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", type=Path, default=None, help="Optional dark-backed contact sheet output path")
    args = parser.parse_args()

    rng = np.random.default_rng(SEED)
    FX_DIR.mkdir(parents=True, exist_ok=True)

    generate_mark_svg(ROOT / "art" / "mark.svg")

    sprites = {
        "stone-grain.png": make_stone_grain(rng),
        "ember-glow.png": make_ember_glow(),
        "spear-flare.png": make_spear_flare(),
        "vignette-bloom.png": make_vignette_bloom(),
    }
    for name, img in sprites.items():
        img.save(FX_DIR / name)

    if args.sheet:
        render_contact_sheet(sprites, args.sheet)


if __name__ == "__main__":
    main()
