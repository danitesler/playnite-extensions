#!/usr/bin/env python3
"""
Deterministic procedural white-mask FX sprite generator for Rushdown.
All outputs are pure white (RGB 255, 255, 255) RGBA PNGs with alpha-only detail
so WPF OpacityMask and CSS -webkit-mask tint them dynamically via ThemeModifier.

Usage:
  python art/sprites.py [--contact-sheet <path>]
"""
import argparse
import os
import numpy as np
from PIL import Image, ImageDraw

SEED = 20230602
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


def make_ice_facet(w: int = 256, h: int = 64) -> np.ndarray:
    """
    Horizontally seamless 256x64 prismatic low-poly diagonal crystal shard facets for
    Street Fighter 6's faceted white-ice selection bars (Options / Character Select).
    Height 64px ensures 30-56px rows/buttons never tile vertically.
    """
    img = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(img)

    # Contiguous diagonal strips covering [0, w] seamlessly: top x_i -> bottom (x_i - 42)
    xs = [0, 56, 116, 168, 214, 256]
    vals = [195, 90, 235, 130, 195]
    dx = 42
    for i in range(len(xs) - 1):
        x0, x1 = xs[i], xs[i + 1]
        poly = [(x0, 0), (x1, 0), (x1 - dx, h), (x0 - dx, h)]
        for ox in (-w, 0, w):
            draw.polygon([(px + ox, py) for (px, py) in poly], fill=vals[i])

    # Crisp diagonal sub-facet triangles inside two planes
    sub_polys = [
        ([(56, 0), (116, 0), (48, h)], 150),
        ([(168, 0), (214, 0), (160, h)], 75),
    ]
    for poly, val in sub_polys:
        for ox in (-w, 0, w):
            draw.polygon([(px + ox, py) for (px, py) in poly], fill=val)

    # Crisp diagonal crystal crease glints
    for x0 in xs[:-1]:
        for ox in (-w, 0, w):
            draw.line([(x0 + ox, 0), (x0 - dx + ox, h)], fill=255, width=1)

    return np.array(img, dtype=np.float32) / 255.0


def make_prism_splash(size: int = 128) -> np.ndarray:
    """
    Seamless 128x128 angular street-graffiti shard & spray droplet tile.
    Used strictly in sparse chrome (Settings title band, popup bottom-right corner,
    empty game page) at <= 8% opacity.
    """
    rng = np.random.default_rng(SEED)
    img = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(img)

    # Dynamic diagonal graffiti slash shards (periodic wrapping)
    shards = [
        [(10, 96), (54, 18), (64, 24), (22, 102)],
        [(46, 112), (98, 34), (104, 38), (54, 116)],
        [(74, 88), (118, 8), (123, 12), (82, 92)],
        [(4, 42), (38, 6), (43, 10), (10, 46)],
    ]
    for i, poly in enumerate(shards):
        val = 195 if i % 2 == 0 else 135
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                draw.polygon([(px + ox, py + oy) for (px, py) in poly], fill=val)

    # Fine spray-paint aerosol mist & pinpoint droplets along the slashes
    for _ in range(95):
        cx = float(rng.uniform(0, size))
        cy = float(rng.uniform(0, size))
        r = float(rng.uniform(0.6, 2.2))
        val = int(rng.integers(110, 245))
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                x0, y0 = cx + ox - r, cy + oy - r
                x1, y1 = cx + ox + r, cy + oy + r
                if x1 >= 0 and y1 >= 0 and x0 <= size and y0 <= size:
                    draw.ellipse([x0, y0, x1, y1], fill=val)

    return np.array(img, dtype=np.float32) / 255.0


def make_prism_sheen(w: int = 256, h: int = 64) -> np.ndarray:
    """
    Diagonal twin-ribbon crystal overdrive flash for PlayButton hover & cover glints.
    """
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = x / float(w)
    v = y / float(h)
    # Aggressive fighting-game slash angle (~28 deg)
    t = u - 0.22 * (1.0 - v)

    b1 = np.exp(-((t - 0.42) / 0.095) ** 4) * 0.95
    b2 = np.exp(-((t - 0.60) / 0.028) ** 4) * 0.72
    env = np.clip(np.minimum(u / 0.10, (1.0 - u) / 0.10), 0.0, 1.0)
    return np.clip((b1 + b2) * env, 0.0, 1.0)


def make_drive_segments(w: int = 18, h: int = 36) -> np.ndarray:
    """
    Seamless 18x36 slanted parallelogram Drive Gauge segments (1:2 slope -> 36 * 0.5 == 18 == w,
    so both X and Y tile seamlessly without step artifacts).
    Matches the 6-segment slanted Drive Gauge bars beneath SF6's combat health HUD.
    """
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    skew_x = (x + y * 0.5) % float(w)
    d_left = np.clip((skew_x - 1.5) / 0.9, 0.0, 1.0)
    d_right = np.clip((14.2 - skew_x) / 0.9, 0.0, 1.0)
    seg = np.minimum(d_left, d_right)
    return np.clip(seg, 0.0, 1.0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--contact-sheet", default="", help="Optional dark-backed contact sheet PNG path")
    args = parser.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)

    sprites = [
        ("ice-facet.png", make_ice_facet(256, 64)),
        ("prism-splash.png", make_prism_splash(128)),
        ("prism-sheen.png", make_prism_sheen(256, 64)),
        ("drive-segments.png", make_drive_segments(18, 36)),
    ]

    imgs = []
    for name, arr in sprites:
        p = os.path.join(OUT_DIR, name)
        img = save_white_mask(arr, p)
        imgs.append((name, img))
        print(f"wrote {p} ({img.size[0]}x{img.size[1]}, max_a={arr.max():.2f}, mean_a={arr.mean():.3f})")

    if args.contact_sheet:
        os.makedirs(os.path.dirname(os.path.abspath(args.contact_sheet)), exist_ok=True)
        sheet_w, sheet_h = 640, 320
        sheet = Image.new("RGBA", (sheet_w, sheet_h), (11, 14, 26, 255))
        tints = [
            ("ice-facet.png", (168, 200, 236), (20, 20, 280, 42), True),
            ("prism-splash.png", (255, 60, 224), (20, 80, 280, 140), True),
            ("prism-sheen.png", (244, 250, 255), (320, 20, 290, 72), False),
            ("drive-segments.png", (22, 135, 54), (320, 120, 290, 32), True),
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
            bg = Image.new("RGBA", (pw + 8, ph + 8), (21, 26, 46, 255))
            sheet.alpha_composite(bg, (px - 4, py - 4))
            sheet.alpha_composite(Image.fromarray(patch, "RGBA"), (px, py))
        sheet.convert("RGB").save(args.contact_sheet)
        print(f"wrote contact sheet {args.contact_sheet}")


if __name__ == "__main__":
    main()
