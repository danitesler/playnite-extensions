"""
Deterministic FX white-mask generator for Vice Dusk (GTA VI inspired Playnite theme).

Generates pure white (255, 255, 255) RGBA alpha-mask PNGs into src/Images/fx/
so WPF OpacityMask and HTML -webkit-mask tint every layer dynamically via ThemeModifier.

Run from repo root or theme folder:
    python src/themes/ViceDusk/art/sprites.py [--sheet <path>]
"""

from __future__ import annotations
import argparse
import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 20261120
THEME_DIR = Path(__file__).resolve().parent.parent
FX_DIR = THEME_DIR / "src" / "Images" / "fx"


def save_white_mask(alpha: np.ndarray, path: Path) -> Image.Image:
    """Save a float/uint8 2D alpha array as a pure white (255,255,255,A) RGBA PNG."""
    a = np.clip(alpha, 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    img = Image.fromarray(rgba, mode="RGBA")
    img.save(path, optimize=True)
    return img


def make_bloom() -> Image.Image:
    """128x128 9-slice soft Vice flamingo halo bloom (32px border slices, 64px center)."""
    size = 128
    pad = 32.0
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    dx = np.maximum(0.0, np.maximum(pad - xx, xx - (size - 1 - pad)))
    dy = np.maximum(0.0, np.maximum(pad - yy, yy - (size - 1 - pad)))
    dist = np.sqrt(dx * dx + dy * dy) / pad
    t = np.clip(1.0 - dist, 0.0, 1.0)
    alpha = (0.62 * (t ** 2.1) + 0.38 * (t ** 3.4)) * 238.0
    inside = (dx == 0) & (dy == 0)
    alpha[inside] = 224.0
    return save_white_mask(alpha, FX_DIR / "bloom.png")


def make_sheen_sweep() -> Image.Image:
    """160x64 crisp angled Vice light sheen band for Play hover & cover sweeps."""
    w, h = 160, 64
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xx / (w - 1)) * 2.0 - 1.0
    ny = (yy / (h - 1)) * 2.0 - 1.0
    u = nx + 0.34 * ny
    band = np.exp(-((u / 0.28) ** 2))
    edge_x = np.clip(1.0 - np.abs(nx) ** 4.0, 0.0, 1.0)
    edge_y = np.clip(1.0 - np.abs(ny) ** 6.0, 0.0, 1.0)
    alpha = band * edge_x * edge_y * 235.0
    return save_white_mask(alpha, FX_DIR / "sheen-sweep.png")


def make_white_fade_bar() -> Image.Image:
    """256x32 GTA VI Settings selection bar mask: pure white left plateau melting right."""
    w, h = 256, 32
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = xx / (w - 1)
    fade = np.where(
        t <= 0.38,
        1.0,
        0.08 + 0.92 * (0.5 * (1.0 + np.cos(math.pi * np.clip((t - 0.38) / 0.62, 0.0, 1.0)))),
    )
    alpha = fade * 255.0
    return save_white_mask(alpha, FX_DIR / "white-fade-bar.png")


def _draw_palm(draw: ImageDraw.ImageDraw, cx: float, cy: float, trunk_base_x: float, trunk_base_y: float, scale: float, tilt: float):
    """Draw a slender coastal Vice palm silhouette (gracefully arched trunk + feathered fronds)."""
    pts_left = []
    pts_right = []
    steps = 18
    for i in range(steps + 1):
        t = i / steps
        x = trunk_base_x + (cx - trunk_base_x) * (t ** 0.85) + math.sin(t * math.pi) * tilt * scale
        y = trunk_base_y + (cy - trunk_base_y) * t
        half_w = (4.6 * (1.0 - 0.68 * t)) * scale
        pts_left.append((x - half_w, y))
        pts_right.append((x + half_w, y))
    draw.polygon(pts_left + list(reversed(pts_right)), fill=255)

    frond_specs = [
        (-160, 72, 16, 0.34),
        (-134, 82, 19, 0.28),
        (-104, 74, 17, 0.22),
        (-68, 60, 13, 0.16),
        (-28, 72, 16, 0.24),
        (6, 78, 17, 0.30),
        (34, 68, 15, 0.34),
        (164, 58, 14, 0.32),
    ]
    for angle_deg, length, droop, width_ratio in frond_specs:
        ang = math.radians(angle_deg)
        L = length * scale
        dx = math.cos(ang)
        dy = math.sin(ang)
        n_seg = 13
        spine = []
        for k in range(n_seg + 1):
            u = k / n_seg
            px = cx + dx * L * u
            py = cy + dy * L * u + (u ** 2) * droop * scale
            spine.append((px, py))
        for k in range(len(spine) - 1):
            w_seg = max(1, int(round((2.4 - 1.5 * (k / n_seg)) * scale)))
            draw.line([spine[k], spine[k + 1]], fill=255, width=w_seg)
        for k in range(2, n_seg):
            u = k / n_seg
            bx, by = spine[k]
            leaf_len = (18.5 * math.sin(u * math.pi * 0.92) + 4.0) * scale * (0.7 + width_ratio)
            side = -1.0 if dx < 0 else 1.0
            lx1 = bx + dx * leaf_len * 0.35 - side * leaf_len * 0.14
            ly1 = by + leaf_len * 0.85
            lx2 = bx + dx * leaf_len * 0.55 + side * leaf_len * 0.24
            ly2 = by + leaf_len * 0.54
            draw.polygon([(bx, by), (lx1, ly1), (bx + dx * 4 * scale, by + 2 * scale)], fill=255)
            draw.polygon([(bx, by), (lx2, ly2), (bx + dx * 3 * scale, by + 3 * scale)], fill=255)


def make_palm_dusk() -> Image.Image:
    """440x280 four-palm coastal twilight cluster anchored bottom-right like Captures 1 & 6."""
    w, h = 440, 280
    img = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(img)
    _draw_palm(draw, cx=312, cy=56, trunk_base_x=342, trunk_base_y=286, scale=1.18, tilt=-13.0)
    _draw_palm(draw, cx=205, cy=98, trunk_base_x=232, trunk_base_y=286, scale=0.92, tilt=-9.0)
    _draw_palm(draw, cx=390, cy=102, trunk_base_x=408, trunk_base_y=286, scale=0.88, tilt=7.0)
    _draw_palm(draw, cx=116, cy=165, trunk_base_x=130, trunk_base_y=286, scale=0.64, tilt=-5.0)
    img = img.filter(ImageFilter.GaussianBlur(radius=0.55))
    arr = np.asarray(img, dtype=np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    fade_left = np.clip(xx / 54.0, 0.0, 1.0)
    fade_top = np.clip(yy / 24.0, 0.0, 1.0)
    arr *= fade_left * fade_top
    return save_white_mask(arr, FX_DIR / "palm-dusk.png")


def make_dusk_haze() -> Image.Image:
    """192x192 soft coastal sunset horizon glow for empty state and sunset backdrop."""
    w, h = 192, 192
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xx - (w - 1) / 2.0) / (w / 2.0)
    ny = (yy - (h - 1) * 0.55) / (h / 2.0)
    r2 = (nx / 0.85) ** 2 + (ny / 0.65) ** 2
    glow = np.exp(-r2 * 1.9) * 210.0
    edge = np.clip(1.0 - np.maximum(np.abs(nx), np.abs((yy - (h - 1) / 2.0) / (h / 2.0))), 0.0, 1.0)
    alpha = glow * np.clip(edge * 3.5, 0.0, 1.0)
    return save_white_mask(alpha, FX_DIR / "dusk-haze.png")


def make_contact_sheet(sprites: dict[str, Image.Image], out_path: Path) -> None:
    cols = 3
    cell_w, cell_h = 300, 180
    rows = math.ceil(len(sprites) / cols)
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (28, 23, 38))
    draw = ImageDraw.Draw(sheet)
    for idx, (name, sp) in enumerate(sprites.items()):
        r, c = divmod(idx, cols)
        x0, y0 = c * cell_w, r * cell_h
        tint = Image.new("RGBA", sp.size, (247, 123, 184, 255))
        tint.putalpha(sp.split()[3])
        scale = min((cell_w - 24) / sp.width, (cell_h - 36) / sp.height, 1.0)
        nw, nh = max(1, int(sp.width * scale)), max(1, int(sp.height * scale))
        resized = tint.resize((nw, nh), Image.Resampling.LANCZOS)
        px = x0 + (cell_w - nw) // 2
        py = y0 + 24 + (cell_h - 32 - nh) // 2
        sheet.paste(resized, (px, py), resized)
        draw.rectangle([x0 + 1, y0 + 1, x0 + cell_w - 2, y0 + cell_h - 2], outline=(62, 52, 82))
        draw.text((x0 + 10, y0 + 6), f"{name} ({sp.width}x{sp.height})", fill=(245, 241, 248))
    sheet.save(out_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", type=Path, default=None)
    args = parser.parse_args()
    FX_DIR.mkdir(parents=True, exist_ok=True)
    sprites = {
        "bloom.png": make_bloom(),
        "sheen-sweep.png": make_sheen_sweep(),
        "white-fade-bar.png": make_white_fade_bar(),
        "palm-dusk.png": make_palm_dusk(),
        "dusk-haze.png": make_dusk_haze(),
    }
    if args.sheet:
        args.sheet.parent.mkdir(parents=True, exist_ok=True)
        make_contact_sheet(sprites, args.sheet)
    print(f"Wrote {len(sprites)} sprites to {FX_DIR}")


if __name__ == "__main__":
    main()
