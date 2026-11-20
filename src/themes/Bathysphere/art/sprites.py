"""
Deterministic FX mask generator for Bathysphere (BioShock franchise theme).

Generates pure white (255, 255, 255) RGBA alpha-mask sprites into src/Images/fx/
so WPF OpacityMask and HTML -webkit-mask tint every layer dynamically via ThemeModifier.

Run from repo root or theme folder:
    python src/themes/Bathysphere/art/sprites.py [--sheet <path>]
"""

from __future__ import annotations
import argparse
import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 19591912  # Rapture 1959 + Columbia 1912
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
    """128x128 9-slice soft brass/EVE halo bloom (32px cap/edge slices, 64px center)."""
    size = 128
    pad = 32.0
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    # Distance to the inner 64x64 rounded box [32..96]
    dx = np.maximum(0.0, np.maximum(pad - xx, xx - (size - 1 - pad)))
    dy = np.maximum(0.0, np.maximum(pad - yy, yy - (size - 1 - pad)))
    dist = np.sqrt(dx * dx + dy * dy) / pad  # 0 inside box, 1 at outer border
    # Smooth Art Deco warm halo falloff (zero cleanly at dist >= 1.0)
    t = np.clip(1.0 - dist, 0.0, 1.0)
    alpha = (t ** 2.35) * 235.0
    # Slightly dim center so 9-slice glow stays strongest around perimeter
    inside = (dx == 0) & (dy == 0)
    alpha[inside] = 220.0
    return save_white_mask(alpha, FX_DIR / "bloom.png")


def make_hex_bloom() -> Image.Image:
    """256x90 3-slice pointed-hexagonal soft optical bloom (48px left/right caps, 160px center).
    Wraps a 42px-tall pointed-hexagonal PlayButton (12px pointed ends) with a 24px silky Gaussian halo
    that follows all 6 hexagonal edges naturally with zero rectangular corners."""
    W, H = 256, 90
    pad = 24
    tip = 12
    # Exact pointed-hexagonal polygon inside [pad..W-pad, pad..H-pad]
    poly = [
        (pad + tip, pad),
        (W - pad - tip, pad),
        (W - pad, H // 2),
        (W - pad - tip, H - pad),
        (pad + tip, H - pad),
        (pad, H // 2),
    ]
    base = Image.new("L", (W, H), 0)
    ImageDraw.Draw(base).polygon(poly, fill=255)

    # Multi-radius optical bloom: tight luminous edge + wide soft atmospheric aura
    tight = np.array(base.filter(ImageFilter.GaussianBlur(radius=4.5)), dtype=np.float32)
    mid = np.array(base.filter(ImageFilter.GaussianBlur(radius=9.0)), dtype=np.float32)
    wide = np.array(base.filter(ImageFilter.GaussianBlur(radius=14.0)), dtype=np.float32)
    alpha = np.clip(tight * 0.55 + mid * 0.45 + wide * 0.35, 0.0, 255.0)

    # Smooth outer 5px feather so alpha reaches 0 cleanly before the bitmap border (no clipped box)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    edge_x = np.minimum(xx, (W - 1) - xx) / 5.0
    edge_y = np.minimum(yy, (H - 1) - yy) / 5.0
    env = np.clip(np.minimum(edge_x, edge_y), 0.0, 1.0)
    alpha *= env

    return save_white_mask(alpha, FX_DIR / "hex-bloom.png")


def make_deco_fan() -> Image.Image:
    """96x96 seamless classic 1930s Rapture Art Deco scalloped sunburst fan lattice tile."""
    w, h = 96, 96
    # Render at 2x supersampling for crisp anti-aliased thin brass filigree lines
    scale = 2
    W, H = w * scale, h * scale
    img = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(img)

    # Classic Gatsby / Rapture brick-staggered fan lattice:
    # Row pitch = H/2, horizontal period = W, fan radius = W/2 (tangent side-by-side, overlapping half-row above)
    r_outer = W // 2
    rows = [
        # Draw top-to-bottom so lower fans cleanly overlap upper rows (standard Art Deco scale layering)
        [(W // 2, 0), (-W // 2, 0), (3 * W // 2, 0)],
        [(0, H // 2), (W, H // 2)],
        [(W // 2, H), (-W // 2, H), (3 * W // 2, H)],
        [(0, 3 * H // 2), (W, 3 * H // 2)],
    ]
    for row in rows:
        for cx, cy in row:
            bbox_outer = [cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer]
            draw.pieslice(bbox_outer, start=180, end=360, fill=0)
            # Concentric Art Deco arcs (3 stepped rings)
            for frac, width, val in [(1.0, 3, 225), (0.76, 2, 165), (0.50, 2, 130), (0.25, 2, 155)]:
                r = int(r_outer * frac)
                draw.arc([cx - r, cy - r, cx + r, cy + r], start=180, end=360, fill=val, width=width)
            # 7 radial sunburst ribs inside the fan
            for deg in (202.5, 225, 247.5, 270, 292.5, 315, 337.5):
                rad = math.radians(deg)
                x0 = cx + math.cos(rad) * (r_outer * 0.25)
                y0 = cy + math.sin(rad) * (r_outer * 0.25)
                x1 = cx + math.cos(rad) * (r_outer * 0.98)
                y1 = cy + math.sin(rad) * (r_outer * 0.98)
                val = 200 if deg == 270 else 135
                draw.line([(x0, y0), (x1, y1)], fill=val, width=2)

    down = img.resize((w, h), Image.Resampling.LANCZOS)
    return save_white_mask(np.array(down, dtype=np.float32), FX_DIR / "deco-fan.png")


def make_vellum_grain() -> Image.Image:
    """128x128 seamless 1912 Columbia cotton-rag vellum paper fiber texture."""
    rng = np.random.default_rng(SEED + 1)
    size = 128
    # Seamless multi-octave periodic noise via FFT
    freqs = np.fft.fftfreq(size)
    fy, fx = np.meshgrid(freqs, freqs, indexing="ij")
    radius = np.sqrt(fx * fx + fy * fy)
    radius[0, 0] = 1.0

    # Fine paper tooth + subtle organic clouds
    phase = rng.uniform(0, 2 * math.pi, (size, size))
    amp = np.where(radius > 0.02, (radius ** -0.85), 0.0)
    amp[0, 0] = 0.0
    spec = amp * np.exp(1j * phase)
    cloud = np.fft.ifft2(spec).real
    cloud = (cloud - cloud.min()) / (cloud.max() - cloud.min() + 1e-6)

    # Fine cotton fibers (short random lines wrapped toroidally)
    fiber_img = Image.new("L", (size, size), 0)
    fdraw = ImageDraw.Draw(fiber_img)
    for _ in range(140):
        x = rng.uniform(0, size)
        y = rng.uniform(0, size)
        ang = rng.uniform(0, 2 * math.pi)
        length = rng.uniform(4.0, 14.0)
        dx, dy = math.cos(ang) * length, math.sin(ang) * length
        val = int(rng.integers(90, 200))
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                fdraw.line([(x + ox, y + oy), (x + dx + ox, y + dy + oy)], fill=val, width=1)
    fibers = np.array(fiber_img.filter(ImageFilter.GaussianBlur(0.5)), dtype=np.float32) / 255.0

    # Combine into subtle high-frequency tooth + mottled warmth (mean ~115, good alpha spread)
    micro = rng.uniform(0.0, 1.0, (size, size)).astype(np.float32)
    combined = 0.50 * cloud + 0.30 * fibers + 0.20 * micro
    combined = (combined - combined.min()) / (combined.max() - combined.min() + 1e-6)
    alpha = (combined ** 1.15) * 230.0
    return save_white_mask(alpha, FX_DIR / "vellum-grain.png")


def make_water_caustic() -> Image.Image:
    """256x128 seamless underwater Atlantic caustic light ripple mask."""
    rng = np.random.default_rng(SEED + 2)
    h, w = 128, 256
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u = xx / w * 2.0 * math.pi
    v = yy / h * 2.0 * math.pi

    # Superpose periodic wave ridges for caustic web lines
    field = np.zeros((h, w), dtype=np.float32)
    waves = [
        (2, 1, 0.4, 1.0),
        (3, -2, 1.2, 0.85),
        (-4, 2, 2.5, 0.7),
        (5, 3, 0.9, 0.55),
        (-2, 4, 1.9, 0.5),
        (6, -1, 3.1, 0.4),
    ]
    for kx, ky, ph, weight in waves:
        field += weight * np.sin(kx * u + ky * v + ph + 0.35 * np.cos((kx - ky) * v))
    # Caustic ridges concentrate near zero-crossings of the potential gradient
    ridge = 1.0 - np.abs(field) / (np.max(np.abs(field)) + 1e-6)
    caustic = np.clip(ridge, 0.0, 1.0) ** 3.2
    # Gentle horizontal shimmer bands
    shimmer = 0.78 + 0.22 * np.sin(2.0 * v + 0.5 * np.sin(u))
    alpha = caustic * shimmer * 235.0
    return save_white_mask(alpha, FX_DIR / "water-caustic.png")


def make_sunburst_rays() -> Image.Image:
    """160x160 radial Art Deco 16-ray lighthouse beacon sunburst mask."""
    size = 160
    c = (size - 1) / 2.0
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    dx = xx - c
    dy = yy - c
    r = np.sqrt(dx * dx + dy * dy) / c  # 0 at center, 1 at edge
    theta = np.arctan2(dy, dx)

    # 16 sharp alternating major/minor Art Deco rays
    major = np.maximum(0.0, np.cos(8.0 * theta)) ** 5.0
    minor = 0.55 * (np.maximum(0.0, np.cos(8.0 * theta + math.pi)) ** 7.0)
    rays = np.clip(major + minor, 0.0, 1.0)

    # Radial envelope: open ring outside inner core (r=0.22..0.95), soft fade at edge
    inner_fade = np.clip((r - 0.16) / 0.14, 0.0, 1.0)
    outer_fade = np.clip(1.0 - np.maximum(0.0, (r - 0.25) / 0.75), 0.0, 1.0) ** 1.35
    # Subtle soft center glow
    core = np.clip(1.0 - r / 0.42, 0.0, 1.0) ** 2.2 * 0.45

    alpha = np.clip(rays * inner_fade * outer_fade + core, 0.0, 1.0) * 240.0
    return save_white_mask(alpha, FX_DIR / "sunburst-rays.png")


def build_contact_sheet(sprites: list[tuple[str, Image.Image, tuple[int, int, int]]], out_path: Path) -> None:
    """Save a dark-backed visual inspection sheet showing each white mask tinted in theme colors."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cell_w, cell_h = 260, 210
    cols = 3
    rows = (len(sprites) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * cell_w, rows * cell_h), (8, 17, 19, 255))
    draw = ImageDraw.Draw(sheet)

    for idx, (label, mask_img, tint) in enumerate(sprites):
        r, c = divmod(idx, cols)
        ox, oy = c * cell_w, r * cell_h
        draw.rectangle([ox + 6, oy + 6, ox + cell_w - 6, oy + cell_h - 6], fill=(13, 26, 29, 255), outline=(94, 75, 38, 255), width=1)
        # Tint white mask
        arr = np.array(mask_img, dtype=np.uint8)
        tinted = np.empty_like(arr)
        tinted[..., 0], tinted[..., 1], tinted[..., 2] = tint
        tinted[..., 3] = arr[..., 3]
        t_img = Image.fromarray(tinted, mode="RGBA")
        # Fit inside cell
        tw, th = t_img.size
        scale = min((cell_w - 36) / tw, (cell_h - 52) / th, 1.4)
        nw, nh = int(tw * scale), int(th * scale)
        resized = t_img.resize((nw, nh), Image.Resampling.LANCZOS)
        sheet.alpha_composite(resized, (ox + (cell_w - nw) // 2, oy + 14 + (cell_h - 48 - nh) // 2))
        draw.text((ox + 16, oy + cell_h - 26), f"{label} ({tw}x{th})", fill=(239, 231, 209, 255))

    sheet.convert("RGB").save(out_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", type=Path, default=None, help="Optional path for visual inspection contact sheet PNG.")
    args = parser.parse_args()

    FX_DIR.mkdir(parents=True, exist_ok=True)
    bloom = make_bloom()
    hex_bloom = make_hex_bloom()
    deco_fan = make_deco_fan()
    vellum = make_vellum_grain()
    caustic = make_water_caustic()
    sunburst = make_sunburst_rays()

    print(f"Generated 6 deterministic FX masks in {FX_DIR}")
    if args.sheet:
        build_contact_sheet(
            [
                ("bloom.png", bloom, (229, 188, 94)),
                ("hex-bloom.png", hex_bloom, (226, 168, 88)),
                ("deco-fan.png", deco_fan, (229, 188, 94)),
                ("vellum-grain.png", vellum, (223, 208, 180)),
                ("water-caustic.png", caustic, (75, 163, 255)),
                ("sunburst-rays.png", sunburst, (229, 188, 94)),
            ],
            args.sheet,
        )
        print(f"Saved inspection contact sheet to {args.sheet}")


if __name__ == "__main__":
    main()
