"""Deterministic procedural white-mask FX sprite generator for Testbed.

Outputs pure white (255, 255, 255) RGBA alpha-mask PNGs under src/Images/fx/
so WPF OpacityMask and CSS mask-image tint dynamically via theme brushes/tokens.
Also writes a dark-backed contact sheet to scratch for visual inspection.
"""

from __future__ import annotations

import os
import sys
import numpy as np
from PIL import Image

SEED = 20110419


def make_white_rgba(alpha: np.ndarray) -> Image.Image:
    h, w = alpha.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.clip(np.round(alpha), 0, 255).astype(np.uint8)
    return Image.fromarray(rgba, mode="RGBA")


def gen_panel_grid() -> Image.Image:
    """64x64 seamless modular test-chamber wall grout tile (clean crisp architectural seams)."""
    size = 64
    a = np.zeros((size, size), dtype=np.float32)
    # Crisp 1px bottom/right grout seam + subtle adjacent shoulder
    a[-1, :] = 215.0
    a[:, -1] = 215.0
    a[0, :] = 58.0
    a[:, 0] = 58.0
    # Subtle micro surface matte finish (very calm, no noisy speckles)
    rng = np.random.default_rng(SEED)
    grain = rng.normal(0.0, 2.0, (size, size)).astype(np.float32)
    interior = np.clip(6.0 + grain, 0.0, 14.0)
    mask = a == 0
    a[mask] = interior[mask]
    return make_white_rgba(a)


def gen_inner_shadow() -> Image.Image:
    """96x96 9-slice pure-white inset inner-shadow mask (28px corner/edge slice, 0 alpha interior)."""
    size = 96
    inset = 28.0
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    f_left = np.clip(1.0 - xx / inset, 0.0, 1.0) ** 2.1
    f_right = np.clip(1.0 - ((size - 1.0) - xx) / inset, 0.0, 1.0) ** 2.1
    f_top = np.clip(1.0 - yy / inset, 0.0, 1.0) ** 1.85
    f_bottom = np.clip(1.0 - ((size - 1.0) - yy) / inset, 0.0, 1.0) ** 1.75
    combined = 1.0 - (1.0 - f_left) * (1.0 - f_right) * (1.0 - f_top) * (1.0 - f_bottom)
    alpha = combined * 245.0
    return make_white_rgba(alpha)


def gen_antline_dots() -> Image.Image:
    """12x8 seamless horizontal tile containing one crisp 5px circular indicator dot."""
    w, h = 12, 8
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = 5.5, 3.5
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    # Sharp core r<=1.8, smooth anti-aliased edge to r=2.9
    alpha = np.clip((2.85 - dist) / 1.05, 0.0, 1.0) * 255.0
    return make_white_rgba(alpha)


def gen_portal_sheen() -> Image.Image:
    """256x64 angled crisp energy sheen stripe for Play hover and scan passes."""
    w, h = 256, 64
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # Slanted stripe center
    center = 128.0 + (yy - h * 0.5) * 0.42
    d = np.abs(xx - center)
    core = np.exp(-((d / 18.0) ** 2)) * 235.0
    trailing = np.exp(-(((xx - (center - 28.0)) / 32.0) ** 2)) * 90.0
    alpha = np.maximum(core, trailing)
    # Soft fade at extreme left/right so stretched overlays never clip hard
    edge_x = np.clip(np.minimum(xx, (w - 1) - xx) / 14.0, 0.0, 1.0)
    alpha *= edge_x
    return make_white_rgba(alpha)


def gen_portal_bloom() -> Image.Image:
    """96x96 9-slice crisp rectangular halo mask (28px corner slice)."""
    size = 96
    inset = 28.0
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    # Distance outside inner [inset, size-inset) box
    dx = np.maximum(0.0, np.maximum(inset - xx, xx - (size - 1 - inset)))
    dy = np.maximum(0.0, np.maximum(inset - yy, yy - (size - 1 - inset)))
    dist = np.sqrt(dx * dx + dy * dy)
    alpha = np.exp(-((dist / 10.5) ** 1.7)) * 225.0
    # Zero inside core so 9-slice bloom only frames outside edge
    inside = (dx == 0.0) & (dy == 0.0)
    alpha[inside] = 0.0
    # Zero at very outer perimeter
    border_fade = np.clip(
        np.minimum(np.minimum(xx, size - 1 - xx), np.minimum(yy, size - 1 - yy)) / 4.0,
        0.0,
        1.0,
    )
    alpha *= border_fade
    return make_white_rgba(alpha)


def build_contact_sheet(sprites: list[tuple[str, Image.Image]], out_path: str) -> None:
    cols = 2
    rows = (len(sprites) + cols - 1) // cols
    cell_w, cell_h = 300, 140
    sheet = Image.new("RGBA", (cols * cell_w, rows * cell_h), (24, 27, 32, 255))
    for i, (name, img) in enumerate(sprites):
        r, c = divmod(i, cols)
        ox, oy = c * cell_w, r * cell_h
        # Tile small sprites so pattern is visible
        if img.width <= 64 and img.height <= 64:
            panel = Image.new("RGBA", (cell_w - 24, cell_h - 24), (24, 27, 32, 255))
            for ty in range(0, panel.height, img.height):
                for tx in range(0, panel.width, img.width):
                    panel.alpha_composite(img, (tx, ty))
        else:
            panel = img.resize((cell_w - 24, min(cell_h - 24, img.height)), Image.Resampling.BILINEAR)
        sheet.alpha_composite(panel.convert("RGBA"), (ox + 12, oy + 12))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    sheet.save(out_path)


def main() -> None:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fx_dir = os.path.join(root, "src", "Images", "fx")
    os.makedirs(fx_dir, exist_ok=True)

    outputs = [
        ("panel-grid.png", gen_panel_grid()),
        ("antline-dots.png", gen_antline_dots()),
        ("portal-sheen.png", gen_portal_sheen()),
        ("portal-bloom.png", gen_portal_bloom()),
        ("inner-shadow.png", gen_inner_shadow()),
    ]
    for fname, img in outputs:
        img.save(os.path.join(fx_dir, fname))

    contact_out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "art", "fx-sheet.png")
    build_contact_sheet(outputs, contact_out)
    print(f"Generated {len(outputs)} sprites in {fx_dir}; contact sheet -> {contact_out}")


if __name__ == "__main__":
    main()
