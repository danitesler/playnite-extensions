"""
Deterministic FX white-mask generator for Vesperglass (Dragon Age: The Veilguard inspired theme).

Generates pure white (255, 255, 255) RGBA alpha-mask sprites into src/Images/fx/
so WPF OpacityMask and HTML -webkit-mask tint every layer dynamically via ThemeModifier.

Run from repo root or theme folder:
    python src/themes/Vesperglass/art/sprites.py [--sheet <path>]
"""

from __future__ import annotations
import argparse
import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 20241031  # Fixed deterministic seed
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
    """128x128 9-slice soft amethyst/copper halo bloom (32px border slices, 64px center)."""
    size = 128
    pad = 32.0
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    dx = np.maximum(0.0, np.maximum(pad - xx, xx - (size - 1 - pad)))
    dy = np.maximum(0.0, np.maximum(pad - yy, yy - (size - 1 - pad)))
    dist = np.sqrt(dx * dx + dy * dy) / pad
    t = np.clip(1.0 - dist, 0.0, 1.0)
    # Slightly sharper arcane rim falloff with wide ethereal tail
    alpha = (0.65 * (t ** 2.2) + 0.35 * (t ** 3.6)) * 242.0
    inside = (dx == 0) & (dy == 0)
    alpha[inside] = 228.0
    return save_white_mask(alpha, FX_DIR / "bloom.png")


def make_star_flare() -> Image.Image:
    """64x64 Veilguard 4-point celestial star flare: crisp N/S/E/W needle rays + diamond halo."""
    size = 64
    c = (size - 1) / 2.0
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    dx = np.abs(xx - c)
    dy = np.abs(yy - c)
    r = np.sqrt(dx * dx + dy * dy)

    # Sharp cardinal needle rays along X and Y axes
    ray_x = np.exp(-((dy / 1.35) ** 2)) * np.clip(1.0 - dx / 30.0, 0.0, 1.0) ** 1.55
    ray_y = np.exp(-((dx / 1.35) ** 2)) * np.clip(1.0 - dy / 30.0, 0.0, 1.0) ** 1.55

    # Delicate short 45-degree micro-spurs
    u = (dx + dy) * 0.70710678
    v = np.abs(dx - dy) * 0.70710678
    spur = np.exp(-((v / 1.1) ** 2)) * np.clip(1.0 - u / 13.5, 0.0, 1.0) ** 1.9 * 0.55

    # Faceted diamond core + soft ethereal bloom halo
    diamond_d = (dx + dy) / 7.5
    core = np.clip(1.0 - diamond_d, 0.0, 1.0) ** 1.25
    halo = np.exp(-((r / 11.0) ** 2)) * 0.42 * np.clip(1.0 - r / 30.0, 0.0, 1.0)

    combined = np.clip(np.maximum(np.maximum(ray_x, ray_y), np.maximum(spur, core)) + halo, 0.0, 1.0)
    # Cleanly zero out edges so no bounding box ever shows
    edge_fade = np.clip((31.0 - r) / 4.0, 0.0, 1.0)
    alpha = combined * edge_fade * 255.0
    return save_white_mask(alpha, FX_DIR / "star-flare.png")


def make_hourglass_glow() -> Image.Image:
    """96x64 soft vertical hourglass/twin-cone glow behind active tabs and sidebar items."""
    w, h = 96, 64
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xx - (w - 1) / 2.0) / (w / 2.0)  # -1..1
    ny = (yy - (h - 1) / 2.0) / (h / 2.0)  # -1..1

    # Crisp twin-triangle hourglass envelope pinched tightly at ny = 0
    cone_w = 0.08 + 0.56 * np.abs(ny)
    inside_cone = np.exp(-((np.abs(nx) / cone_w) ** 2.4))
    vert_env = np.clip(1.0 - (np.abs(ny) ** 1.35), 0.0, 1.0)
    # Soft nexus sparkle at center waist
    nexus = np.exp(-((nx / 0.14) ** 2 + (ny / 0.18) ** 2)) * 0.65
    # Edge taper so boundaries are completely invisible
    edge = np.clip(1.0 - np.maximum(np.abs(nx), np.abs(ny)), 0.0, 1.0)
    edge_soft = np.clip(edge * 4.5, 0.0, 1.0)

    val = np.clip(inside_cone * vert_env * 0.82 + nexus, 0.0, 1.0) * edge_soft
    return save_white_mask(val * 235.0, FX_DIR / "hourglass-glow.png")


def make_sheen_band() -> Image.Image:
    """256x64 diagonal crystalline light-beam swipe for Play hover and selection glints."""
    w, h = 256, 64
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = xx / (w - 1)
    ny = yy / (h - 1)
    # Diagonal band centered at x = 0.50 + 0.18*(y - 0.5)
    center = 0.50 + 0.16 * (ny - 0.5)
    d = np.abs(nx - center)
    # Main crisp crystal blade + secondary parallel micro-glint
    main = np.exp(-((d / 0.065) ** 2))
    rim = np.exp(-(((d - 0.09) / 0.018) ** 2)) * 0.45
    fade_x = np.clip(np.minimum(nx, 1.0 - nx) * 8.0, 0.0, 1.0)
    alpha = np.clip(main + rim, 0.0, 1.0) * fade_x * 235.0
    return save_white_mask(alpha, FX_DIR / "sheen-band.png")


def make_astrolabe_tile() -> Image.Image:
    """256x256 seamless subtle celestial astrolabe arcs, faceted floating shards & fine stardust."""
    rng = np.random.default_rng(SEED)
    size = 256
    scale = 2
    S = size * scale
    img = Image.new("L", (S, S), 0)
    draw = ImageDraw.Draw(img)

    # Tileable subtle diagonal diamond lattice hairlines (very delicate architectural grid)
    step = S // 2
    for ox in (-step, 0, step, 2 * step):
        draw.line([(ox, 0), (ox + S, S)], fill=42, width=1)
        draw.line([(ox, S), (ox + S, 0)], fill=42, width=1)

    # Tileable concentric astrolabe rings centered on tile corners and tile center
    centers = [(S // 2, S // 2), (0, 0), (S, 0), (0, S), (S, S)]
    for cx, cy in centers:
        for r, val in [(int(S * 0.34), 78), (int(S * 0.23), 56), (int(S * 0.12), 68)]:
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=val, width=2)
        # Small rotated diamond at each astrolabe nexus
        d = 12
        draw.polygon([(cx, cy - d), (cx + d, cy), (cx, cy + d), (cx - d, cy)], outline=110)

    # Subtle angular Veilguard floating shards (wrapped toroidally across edges)
    for _ in range(18):
        cx = rng.uniform(0, S)
        cy = rng.uniform(0, S)
        rx = rng.uniform(5, 14)
        ry = rng.uniform(10, 24)
        ang = rng.uniform(0, math.pi)
        ca, sa = math.cos(ang), math.sin(ang)
        pts_rel = [(0, -ry), (rx * 0.85, 0), (0, ry * 0.9), (-rx * 0.75, 0.1 * ry)]
        val = int(rng.integers(55, 115))
        for dx_wrap in (-S, 0, S):
            for dy_wrap in (-S, 0, S):
                pts = [
                    (cx + dx_wrap + px * ca - py * sa, cy + dy_wrap + px * sa + py * ca)
                    for px, py in pts_rel
                ]
                draw.polygon(pts, fill=val)

    # Tiny crisp stardust specks
    for _ in range(75):
        sx = int(rng.integers(0, S))
        sy = int(rng.integers(0, S))
        sr = int(rng.integers(1, 3))
        sv = int(rng.integers(90, 210))
        draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=sv)

    # Soften faintly and downsample cleanly
    down = img.filter(ImageFilter.GaussianBlur(radius=0.5)).resize((size, size), Image.Resampling.LANCZOS)
    return save_white_mask(np.array(down, dtype=np.float32), FX_DIR / "astrolabe-tile.png")


def make_contact_sheet(sprites: dict[str, Image.Image], out_path: Path) -> None:
    """Render a dark plum contact sheet showing every white-mask sprite tinted in theme colors."""
    cols = 3
    cell_w, cell_h = 280, 200
    rows = math.ceil(len(sprites) / cols)
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (25, 6, 38))
    draw = ImageDraw.Draw(sheet)

    tints = {
        "bloom.png": (182, 107, 255),
        "star-flare.png": (215, 170, 255),
        "hourglass-glow.png": (163, 85, 224),
        "sheen-band.png": (223, 157, 133),
        "astrolabe-tile.png": (203, 133, 107),
    }

    for idx, (name, spr) in enumerate(sprites.items()):
        r, c = divmod(idx, cols)
        x0, y0 = c * cell_w, r * cell_h
        draw.rectangle([x0 + 8, y0 + 8, x0 + cell_w - 8, y0 + cell_h - 8], fill=(18, 4, 28), outline=(126, 78, 66))

        # Tint white mask onto preview color
        tint = tints.get(name, (245, 241, 250))
        arr = np.array(spr, dtype=np.uint8)
        colored = np.zeros_like(arr)
        colored[..., 0] = tint[0]
        colored[..., 1] = tint[1]
        colored[..., 2] = tint[2]
        colored[..., 3] = arr[..., 3]
        preview = Image.fromarray(colored, mode="RGBA")

        # Fit neatly inside cell
        max_w, max_h = cell_w - 40, cell_h - 54
        scale = min(max_w / preview.width, max_h / preview.height, 2.0)
        nw, nh = max(1, int(preview.width * scale)), max(1, int(preview.height * scale))
        resized = preview.resize((nw, nh), Image.Resampling.LANCZOS)
        px = x0 + (cell_w - nw) // 2
        py = y0 + 18 + (max_h - nh) // 2
        sheet.paste(resized, (px, py), resized)
        draw.text((x0 + 18, y0 + cell_h - 26), f"{name} ({spr.width}x{spr.height})", fill=(229, 180, 158))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate deterministic FX white-mask sprites for Vesperglass.")
    parser.add_argument("--sheet", type=Path, default=None, help="Optional contact sheet PNG output path.")
    args = parser.parse_args()

    FX_DIR.mkdir(parents=True, exist_ok=True)
    sprites = {
        "bloom.png": make_bloom(),
        "star-flare.png": make_star_flare(),
        "hourglass-glow.png": make_hourglass_glow(),
        "sheen-band.png": make_sheen_band(),
        "astrolabe-tile.png": make_astrolabe_tile(),
    }
    for name, img in sprites.items():
        print(f"wrote {FX_DIR / name} ({img.width}x{img.height})")

    if args.sheet:
        make_contact_sheet(sprites, args.sheet)
        print(f"wrote contact sheet {args.sheet}")


if __name__ == "__main__":
    main()
