#!/usr/bin/env python3
"""Generate deterministic pure-white RGBA alpha-mask FX sprites for Subspace (LCARS).

Outputs pure white (255, 255, 255) PNGs under src/Images/fx/ so WPF OpacityMask and
HTML -webkit-mask tint them dynamically through theme brushes / CSS tokens.
Optional --sheet <path> writes a dark contact sheet to scratch for visual inspection.
"""
import argparse
import os
import numpy as np
from PIL import Image


def save_mask(alpha: np.ndarray, out_path: str) -> Image.Image:
    a = np.clip(np.round(alpha * 255.0), 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    img = Image.fromarray(rgba, mode="RGBA")
    img.save(out_path, optimize=True)
    return img


def make_play_glint(w: int = 256, h: int = 64) -> np.ndarray:
    """Backlit LCARS horizontal sheen sweep with crisp leading telemetry edge."""
    x = np.linspace(0.0, 1.0, w)[None, :]
    y = np.linspace(0.0, 1.0, h)[:, None]
    # Diagonal acrylic light-guide streak (clean, backlit plexiglass feel)
    diag = x - 0.16 * (y - 0.5)
    core = np.exp(-((diag - 0.62) / 0.13) ** 2)
    tail = np.exp(-((diag - 0.38) / 0.28) ** 2) * 0.42
    # Top edge backlit catchlight
    top_edge = np.exp(-((y - 0.06) / 0.14) ** 2) * (0.28 + 0.35 * np.exp(-((x - 0.55) / 0.35) ** 2))
    # Subtle fine horizontal backlit diffuser lines (3px pitch, subtle)
    scan = 0.90 + 0.10 * np.cos(2.0 * np.pi * np.arange(h)[:, None] / 4.0)
    alpha = np.clip((core * 0.85 + tail + top_edge) * scan, 0.0, 1.0)
    # Soft fade at left/right boundaries so it never clips harshly
    edge_fade = np.clip(np.minimum(x / 0.08, (1.0 - x) / 0.08), 0.0, 1.0)
    return alpha * edge_fade


def make_backlit_bloom(w: int = 256, h: int = 64) -> np.ndarray:
    """Soft backlit Kodalith panel internal luminance wash (subtle top/left glow)."""
    x = np.linspace(0.0, 1.0, w)[None, :]
    y = np.linspace(0.0, 1.0, h)[:, None]
    top = np.exp(-((y - 0.0) / 0.35) ** 2) * 0.55
    left = np.exp(-((x - 0.0) / 0.25) ** 2) * 0.40
    center = np.exp(-(((x - 0.5) / 0.65) ** 2 + ((y - 0.5) / 0.7) ** 2)) * 0.32
    return np.clip(top + left + center, 0.0, 0.92)


def make_scan_cells(w: int = 24, h: int = 16) -> np.ndarray:
    """Tileable LCARS segmented vertical telemetry block mask (9px block + 3px black gap)."""
    alpha = np.zeros((h, w), dtype=np.float32)
    # Two 9px lit cells with 3px dark channels (period = 12px)
    alpha[:, 0:9] = 1.0
    alpha[:, 12:21] = 1.0
    # Subtle 1px vertical anti-alias shoulder
    alpha[:, 9] = 0.18
    alpha[:, 21] = 0.18
    return alpha


def make_viewscreen_grid(w: int = 160, h: int = 96) -> np.ndarray:
    """Sparse astrometric telemetry graticule for empty states & header accents."""
    alpha = np.zeros((h, w), dtype=np.float32)
    # Subtle horizontal scan ticks every 16px, vertical ticks every 32px
    for yy in range(0, h, 16):
        alpha[yy : yy + 1, :] = 0.22
    for xx in range(0, w, 32):
        alpha[:, xx : xx + 1] = np.maximum(alpha[:, xx : xx + 1], 0.18)
    # Brighter node crosses at intersections
    for yy in range(0, h, 16):
        for xx in range(0, w, 32):
            y0, y1 = max(0, yy - 2), min(h, yy + 3)
            x0, x1 = max(0, xx - 2), min(w, xx + 3)
            alpha[y0:y1, xx : xx + 1] = 0.55
            alpha[yy : yy + 1, x0:x1] = 0.55
    return alpha


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", default="", help="Optional contact sheet PNG path (scratch)")
    args = parser.parse_args()

    theme_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(theme_dir, "src", "Images", "fx")
    os.makedirs(out_dir, exist_ok=True)

    sprites = [
        ("play-glint.png", make_play_glint()),
        ("backlit-bloom.png", make_backlit_bloom()),
        ("scan-cells.png", make_scan_cells()),
        ("viewscreen-grid.png", make_viewscreen_grid()),
    ]

    rendered = []
    for name, mask in sprites:
        img = save_mask(mask, os.path.join(out_dir, name))
        rendered.append((name, img))
        print(f"wrote {os.path.join(out_dir, name)} ({img.size[0]}x{img.size[1]})")

    if args.sheet:
        os.makedirs(os.path.dirname(os.path.abspath(args.sheet)), exist_ok=True)
        sheet = Image.new("RGBA", (620, 260), (11, 13, 20, 255))
        tints = [
            (255, 204, 102),  # gold
            (204, 136, 255),  # lavender
            (56, 232, 184),   # ops mint
            (136, 170, 255),  # periwinkle
        ]
        positions = [(20, 20), (310, 20), (20, 120), (310, 120)]
        for (name, img), tint, (px, py) in zip(rendered, tints, positions):
            arr = np.array(img)
            col = np.zeros_like(arr)
            col[..., 0] = tint[0]
            col[..., 1] = tint[1]
            col[..., 2] = tint[2]
            col[..., 3] = arr[..., 3]
            tinted = Image.fromarray(col, mode="RGBA")
            if name == "scan-cells.png":
                tiled = Image.new("RGBA", (240, 48), (0, 0, 0, 0))
                for tx in range(0, 240, tinted.size[0]):
                    for ty in range(0, 48, tinted.size[1]):
                        tiled.paste(tinted, (tx, ty))
                tinted = tiled
            sheet.alpha_composite(tinted, (px, py))
        sheet.save(args.sheet)
        print(f"wrote contact sheet {args.sheet}")


if __name__ == "__main__":
    main()
