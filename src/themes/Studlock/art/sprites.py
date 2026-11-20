#!/usr/bin/env python3
"""
Deterministic procedural white-mask FX sprite generator for Studlock.
All outputs are pure white (RGB 255, 255, 255) RGBA PNGs with alpha-only detail
so WPF OpacityMask and CSS -webkit-mask tint them dynamically via ThemeModifier.

Usage:
  python art/sprites.py [--contact-sheet <path>]
"""
import argparse
import os
import sys
import numpy as np
from PIL import Image

SEED = 20250930
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "src", "Images", "fx"))


def save_white_mask(alpha: np.ndarray, path: str) -> Image.Image:
    a = np.clip(np.round(alpha * 255.0), 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    img = Image.fromarray(rgba, mode="RGBA")
    img.save(path, optimize=True)
    return img


def make_stud_wall(size: int = 64, cell: int = 32) -> np.ndarray:
    """
    Seamless 64x64 molded ABS baseplate stud grid (2x2 circular studs per tile).
    Top-left crescent highlight + clean bevel rim + subtle inner plateau.
    Used at low opacity (4-9%) on sparse chrome surfaces (title band, rail spine, empty page).
    """
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    alpha = np.zeros((size, size), dtype=np.float32)

    # Subtle tile grid seam lines at cell edges
    seam_x = np.minimum(x % cell, cell - (x % cell))
    seam_y = np.minimum(y % cell, cell - (y % cell))
    seam = np.where((seam_x < 0.75) | (seam_y < 0.75), 0.14, 0.0)
    alpha = np.maximum(alpha, seam)

    r_outer = cell * 0.30
    r_inner = cell * 0.23
    for cy in range(cell // 2, size, cell):
        for cx in range(cell // 2, size, cell):
            dx = x - cx
            dy = y - cy
            dist = np.sqrt(dx * dx + dy * dy)
            # Soft outer molded rim
            rim = np.exp(-((dist - r_outer) / 1.15) ** 2)
            # Directional top-left catchlight on the circular stud rim
            angle_light = np.clip((-dx * 0.65 - dy * 0.76) / (dist + 1e-4), -1.0, 1.0)
            rim_lit = rim * (0.42 + 0.58 * np.clip(angle_light * 0.75 + 0.35, 0.0, 1.0))
            # Flat top plateau slight sheen
            plateau = np.where(dist < r_inner, 0.26 + 0.14 * np.clip((-dy / r_inner) * 0.5 + 0.5, 0.0, 1.0), 0.0)
            # Smooth anti-aliased plateau edge
            edge_aa = np.clip((r_inner + 0.8 - dist) / 1.6, 0.0, 1.0)
            stud = np.maximum(rim_lit, plateau * edge_aa)
            alpha = np.maximum(alpha, stud)

    return np.clip(alpha, 0.0, 1.0)


def make_stud_row(w: int = 24, h: int = 12) -> np.ndarray:
    """
    Seamless horizontal row of circular molded studs (24x12 tile -> 2 studs per tile).
    Mirrors the stud-row divider between DISPLAY and GRAPHICS in Settings.
    """
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    alpha = np.zeros((h, w), dtype=np.float32)

    # Subtle recessed channel edge top/bottom
    alpha = np.where((y <= 0.6) | (y >= h - 1.6), 0.16, 0.0)

    r_outer = 3.7
    r_inner = 2.7
    for cx in (6.0, 18.0):
        cy = (h - 1) * 0.5
        dx = x - cx
        dy = y - cy
        dist = np.sqrt(dx * dx + dy * dy)
        rim = np.exp(-((dist - r_outer) / 0.85) ** 2)
        dir_lit = np.clip((-dx * 0.4 - dy * 0.92) / (dist + 1e-4), -1.0, 1.0)
        rim_lit = rim * (0.45 + 0.55 * np.clip(dir_lit * 0.7 + 0.4, 0.0, 1.0))
        plateau = np.clip((r_inner + 0.6 - dist) / 1.2, 0.0, 1.0) * (0.48 + 0.22 * np.clip(-dy / r_inner, -0.5, 1.0))
        alpha = np.maximum(alpha, np.maximum(rim_lit, plateau))

    return np.clip(alpha, 0.0, 1.0)


def make_brick_seams(w: int = 96, h: int = 8) -> np.ndarray:
    """
    Seamless horizontal modular ABS brick joint pattern (vertical joints every 48px
    with a crisp 1px groove + 1px soft secondary edge catchlight).
    Vertically uniform so it stretches or tiles to any plate height (28-48px) with zero wrap seams.
    """
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    alpha = np.zeros((h, w), dtype=np.float32)

    # Vertical modular brick seam joints at x=0 and x=48
    for sx in (0.0, 48.0):
        d = np.minimum(np.abs(x - sx), w - np.abs(x - sx))
        groove = np.where(d < 0.75, 0.88, 0.0)
        d_next = np.abs(x - (sx + 1.5))
        bevel = np.where(d_next < 0.7, 0.25, 0.0)
        alpha = np.maximum(alpha, np.maximum(groove, bevel))

    return np.clip(alpha, 0.0, 1.0)


def make_brick_sheen(w: int = 256, h: int = 64) -> np.ndarray:
    """
    Diagonal glossy ABS plastic specular sheen sweep for PlayButton hover & card glints.
    Hard-edged twin diagonal light ribbons (wide primary + narrow trailing catchlight).
    """
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = x / float(w)
    v = y / float(h)
    # Slanted axis (~24 degrees)
    t = u - 0.16 * (1.0 - v)

    # Primary glossy plastic highlight ribbon
    c1 = 0.44
    w1 = 0.11
    b1 = np.exp(-((t - c1) / w1) ** 4) * 0.92

    # Crisp narrow trailing specular ribbon
    c2 = 0.62
    w2 = 0.032
    b2 = np.exp(-((t - c2) / w2) ** 4) * 0.65

    # Soft horizontal fade near left/right bounds so ends never clip abruptly
    env = np.clip(np.minimum(u / 0.12, (1.0 - u) / 0.12), 0.0, 1.0)
    return np.clip((b1 + b2) * env, 0.0, 1.0)


def make_brick_ticks(w: int = 12, h: int = 16) -> np.ndarray:
    """
    Seamless 12x16 vertical brick-plate segments (9px solid plate + 3px crisp vertical joint).
    Used as an OpacityMask on ProgressBar fills and RunningScan launching sweeps to recreate
    the Minigame segmented vertical-brick countdown bar.
    """
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    # 9px wide vertical brick bar, 3px dark notch gap between bars
    bar = np.where((x >= 1.0) & (x <= 9.0), 1.0, 0.0)
    # Subtle 1px vertical bevel darkening on right edge of each brick tick
    bar = np.where((x > 8.5) & (x <= 9.5), 0.72, bar)
    # Full height crisp plate
    return np.clip(bar, 0.0, 1.0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--contact-sheet", default="", help="Optional dark-backed contact sheet PNG path")
    args = parser.parse_args()

    np.random.seed(SEED)
    os.makedirs(OUT_DIR, exist_ok=True)

    sprites = [
        ("stud-wall.png", make_stud_wall(64, 32)),
        ("stud-row.png", make_stud_row(24, 12)),
        ("brick-seams.png", make_brick_seams(96, 8)),
        ("brick-sheen.png", make_brick_sheen(256, 64)),
        ("brick-ticks.png", make_brick_ticks(12, 16)),
    ]

    imgs = []
    for name, arr in sprites:
        p = os.path.join(OUT_DIR, name)
        img = save_white_mask(arr, p)
        imgs.append((name, img))
        print(f"wrote {p} ({img.size[0]}x{img.size[1]}, max_a={arr.max():.2f}, mean_a={arr.mean():.3f})")

    if args.contact_sheet:
        os.makedirs(os.path.dirname(os.path.abspath(args.contact_sheet)), exist_ok=True)
        # Render tiled previews tinted with Studlock palette colors on dark baseplate
        sheet_w, sheet_h = 640, 320
        sheet = Image.new("RGBA", (sheet_w, sheet_h), (26, 28, 32, 255))
        tints = [
            ("stud-wall.png", (97, 69, 154), (20, 20, 180, 120), True),
            ("stud-row.png", (180, 190, 205), (220, 30, 380, 24), True),
            ("brick-seams.png", (255, 228, 33), (220, 80, 380, 40), True),
            ("brick-sheen.png", (255, 255, 255), (20, 165, 280, 72), False),
            ("brick-ticks.png", (25, 136, 64), (320, 165, 280, 32), True),
        ]
        by_name = dict(imgs)
        for name, rgb, (px, py, pw, ph), tile in tints:
            src = by_name[name]
            a_src = np.array(src)[..., 3]
            if tile:
                reps_y = (ph + src.height - 1) // src.height
                reps_x = (pw + src.width - 1) // src.width
                a_tiled = np.tile(a_src, (reps_y, reps_x))[:ph, :pw]
            else:
                a_tiled = np.array(src.resize((pw, ph), Image.BILINEAR))[..., 3]
            patch = np.zeros((ph, pw, 4), dtype=np.uint8)
            patch[..., 0] = rgb[0]
            patch[..., 1] = rgb[1]
            patch[..., 2] = rgb[2]
            patch[..., 3] = a_tiled
            # Draw dark card behind
            bg = Image.new("RGBA", (pw + 8, ph + 8), (38, 41, 46, 255))
            sheet.alpha_composite(bg, (px - 4, py - 4))
            sheet.alpha_composite(Image.fromarray(patch, "RGBA"), (px, py))
        sheet.convert("RGB").save(args.contact_sheet)
        print(f"wrote contact sheet {args.contact_sheet}")


if __name__ == "__main__":
    main()
