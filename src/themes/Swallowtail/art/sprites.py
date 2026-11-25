#!/usr/bin/env python3
"""
Deterministic white-mask FX sprite generator for Swallowtail.
Outputs pure-white (255, 255, 255) RGBA alpha-mask PNGs into src/Images/fx/
so WPF OpacityMask and CSS -webkit-mask recolor them dynamically via theme brushes.
Fixed random seed (1525) guarantees bit-identical regenerations.
"""
import argparse
import math
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 1525
OUT_DIR = Path(__file__).resolve().parent.parent / "src" / "Images" / "fx"


def save_white_mask(alpha: np.ndarray, path: Path) -> Image.Image:
    a = np.clip(alpha, 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    img = Image.fromarray(rgba, mode="RGBA")
    img.save(path)
    return img


def make_curtain_drape() -> Image.Image:
    """160x512 diagonal pleated theater-curtain drape fading smoothly toward the right & bottom."""
    w, h = 160, 512
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = xx / (w - 1)
    ny = yy / (h - 1)

    # Curved drape silhouette sweeping diagonally inward from top-left
    edge = 0.92 - 0.62 * (ny ** 0.72) + 0.06 * np.sin(ny * math.pi * 2.5)
    body = np.clip((edge - nx) * 5.2, 0.0, 1.0)
    # Soft vertical theater pleats along diagonal fold lines
    phase = (nx * 10.5 + ny * 3.8) * math.pi
    pleats = 0.58 + 0.42 * (0.5 + 0.5 * np.sin(phase))
    # Subtle top-down theatrical fade
    vfade = np.clip(1.0 - 0.55 * (ny ** 1.4), 0.12, 1.0)
    # Soft feathered outer edge
    alpha = body * pleats * vfade * 235.0
    img = Image.fromarray(np.clip(alpha, 0, 255).astype(np.uint8), mode="L")
    img = img.filter(ImageFilter.GaussianBlur(radius=1.6))
    return save_white_mask(np.array(img), OUT_DIR / "curtain-drape.png")


def make_parchment_grain() -> Image.Image:
    """256x256 seamless hand-painted storybook gouache/paper grain tile."""
    rng = np.random.default_rng(SEED)
    size = 256
    # Tileable low-frequency clouds + fine brush fiber grain using periodic FFT synthesis
    freqs = np.fft.fftfreq(size)
    fy, fx = np.meshgrid(freqs, freqs, indexing="ij")
    r = np.sqrt(fx * fx + fy * fy)
    r[0, 0] = 1.0

    # Broad gouache mottling
    noise_lo = rng.normal(0.0, 1.0, (size, size))
    spec_lo = np.fft.fft2(noise_lo) / (r ** 1.15)
    spec_lo[0, 0] = 0.0
    lo = np.real(np.fft.ifft2(spec_lo))
    lo = (lo - lo.min()) / (lo.max() - lo.min() + 1e-6)

    # Fine paper fiber grain (slight horizontal brush bias)
    noise_hi = rng.normal(0.0, 1.0, (size, size))
    aniso = np.sqrt((fx * 0.65) ** 2 + (fy * 1.35) ** 2)
    aniso[0, 0] = 1.0
    spec_hi = np.fft.fft2(noise_hi) * np.exp(-((aniso - 0.18) / 0.14) ** 2)
    hi = np.real(np.fft.ifft2(spec_hi))
    hi = (hi - hi.min()) / (hi.max() - hi.min() + 1e-6)

    combined = 0.62 * lo + 0.38 * hi
    alpha = np.clip(combined * 255.0, 0, 255)
    return save_white_mask(alpha, OUT_DIR / "parchment-grain.png")


def make_ribbon_swirl() -> Image.Image:
    """512x64 delicate inner calligraphic spiral flourishes echoing RTMI's wavy teal title banners."""
    w, h = 512, 64
    canvas = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(canvas)

    # Upper & lower subtle wavy highlight strokes
    top_pts = []
    bot_pts = []
    for x in range(16, w - 16, 4):
        t = (x - 16) / (w - 32)
        wave = math.sin(t * math.pi * 2.0) * 3.5
        top_pts.append((x, 10 + wave))
        bot_pts.append((x, h - 10 - wave * 0.8))
    draw.line(top_pts, fill=140, width=2)
    draw.line(bot_pts, fill=115, width=2)

    # Symmetrical calligraphic spirals on left and right wings of the ribbon
    def draw_spiral(cx: float, cy: float, direction: float) -> None:
        pts = []
        for i in range(90):
            theta = i * 0.11
            rad = 2.0 + 17.0 * (1.0 - i / 95.0)
            x = cx + direction * math.cos(theta) * rad * 1.45
            y = cy + math.sin(theta) * rad * 0.78
            pts.append((x, y))
        draw.line(pts, fill=220, width=2)
        # Smooth cubic Bezier flourish tail sweeping gracefully inward
        p0 = (cx + direction * 20.0, cy - 5.0)
        p1 = (cx + direction * 56.0, cy - 19.0)
        p2 = (cx + direction * 92.0, cy + 12.0)
        p3 = (cx + direction * 140.0, cy + 2.0)
        tail = []
        for s in range(41):
            t = s / 40.0
            mt = 1.0 - t
            tx = (mt**3) * p0[0] + 3 * (mt**2) * t * p1[0] + 3 * mt * (t**2) * p2[0] + (t**3) * p3[0]
            ty = (mt**3) * p0[1] + 3 * (mt**2) * t * p1[1] + 3 * mt * (t**2) * p2[1] + (t**3) * p3[1]
            tail.append((tx, ty))
        draw.line(tail, fill=185, width=2)

    draw_spiral(76, 33, 1.0)
    draw_spiral(w - 76, 33, -1.0)

    # Soften & feather horizontal ends
    canvas = canvas.filter(ImageFilter.GaussianBlur(radius=0.9))
    arr = np.array(canvas, dtype=np.float32)
    xx = np.linspace(0.0, 1.0, w, dtype=np.float32)
    fade = np.minimum(np.clip(xx * 9.0, 0.0, 1.0), np.clip((1.0 - xx) * 9.0, 0.0, 1.0))
    arr *= fade[None, :]
    return save_white_mask(arr, OUT_DIR / "ribbon-swirl.png")


def make_gold_glint() -> Image.Image:
    """256x64 warm diagonal lantern sheen band for PlayButton hover & golden ribbon sweep."""
    w, h = 256, 64
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = xx / (w - 1)
    ny = yy / (h - 1)

    # Diagonal main beam + narrower companion sparkle streak
    d1 = (nx - 0.46) - (ny - 0.5) * 0.28
    d2 = (nx - 0.62) - (ny - 0.5) * 0.28
    beam1 = np.exp(-((d1 / 0.11) ** 2))
    beam2 = 0.55 * np.exp(-((d2 / 0.038) ** 2))
    # Soft upper catchlight glow
    top_lit = 0.32 * np.exp(-((ny / 0.32) ** 2))
    # Gentle edge taper
    edge = np.maximum(0.0, np.sin(np.clip(nx, 0.0, 1.0) * math.pi)) ** 0.45
    alpha = np.clip((beam1 + beam2 + top_lit) * edge * 235.0, 0, 255)
    return save_white_mask(alpha, OUT_DIR / "gold-glint.png")


def make_stitch_frame() -> Image.Image:
    """96x96 stitched leather inner perimeter mask echoing Guybrush's inventory pouch."""
    size = 96
    canvas = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(canvas)
    pad = 7
    dash = 7
    gap = 5
    # Top and bottom dashed stitches
    x = pad
    while x < size - pad:
        x2 = min(x + dash, size - pad)
        draw.line([(x, pad), (x2, pad)], fill=235, width=2)
        draw.line([(x, size - 1 - pad), (x2, size - 1 - pad)], fill=235, width=2)
        x += dash + gap
    # Left and right dashed stitches
    y = pad
    while y < size - pad:
        y2 = min(y + dash, size - pad)
        draw.line([(pad, y), (pad, y2)], fill=235, width=2)
        draw.line([(size - 1 - pad, y), (size - 1 - pad, y2)], fill=235, width=2)
        y += dash + gap
    canvas = canvas.filter(ImageFilter.GaussianBlur(radius=0.4))
    return save_white_mask(np.array(canvas), OUT_DIR / "stitch-frame.png")


def make_stage_chart() -> Image.Image:
    """512x512 atmospheric nocturnal Caribbean sea-chart & gouache backdrop mask."""
    rng = np.random.default_rng(SEED + 77)
    size = 512

    # Painterly low-frequency gouache clouds / harbor mist
    freqs = np.fft.fftfreq(size)
    fy, fx = np.meshgrid(freqs, freqs, indexing="ij")
    r = np.sqrt(fx * fx + fy * fy)
    r[0, 0] = 1.0
    noise = rng.normal(0.0, 1.0, (size, size))
    spec = np.fft.fft2(noise) / (r ** 1.35)
    spec[0, 0] = 0.0
    clouds = np.real(np.fft.ifft2(spec))
    clouds = (clouds - clouds.min()) / (clouds.max() - clouds.min() + 1e-6)
    base = np.clip((clouds ** 1.25) * 145.0, 0, 255)

    # Hand-drawn nautical sea-chart rhumb lines, compass arcs, and scribbled wavelets
    overlay = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(overlay)

    # Large faint nautical compass rings
    cx, cy = 370, 355
    for rad in (78, 128, 186):
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=120, width=2)
    # Radiating rhumb lines
    for deg in range(0, 360, 30):
        ang = math.radians(deg)
        x1 = cx + math.cos(ang) * 32
        y1 = cy + math.sin(ang) * 32
        x2 = cx + math.cos(ang) * 320
        y2 = cy + math.sin(ang) * 320
        draw.line([(x1, y1), (x2, y2)], fill=92, width=1)

    # Subtle curved dashed sea-route arcs across the chart
    for start_y, amp, phase in ((110, 26, 0.3), (265, 22, 1.9), (430, 18, 0.8)):
        pts = []
        for x in range(18, size - 18, 6):
            t = x / size
            y = start_y + math.sin(t * math.pi * 2.2 + phase) * amp
            pts.append((x, y))
        for i in range(0, len(pts) - 1, 3):
            draw.line([pts[i], pts[i + 1]], fill=130, width=2)

    # Small hand-drawn wave crests scattered lightly
    for wx, wy in ((74, 178), (195, 92), (112, 392), (288, 218), (435, 134)):
        wave = [(wx + k * 6, wy + (3 if k % 2 else -2)) for k in range(7)]
        draw.line(wave, fill=115, width=2)

    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=0.7))
    combined = np.clip(base + np.array(overlay, dtype=np.float32) * 0.85, 0, 255)
    return save_white_mask(combined, OUT_DIR / "stage-chart.png")


def write_contact_sheet(sprites: list[tuple[str, Image.Image]], sheet_path: Path) -> None:
    """Render a dark-backed tinted inspection contact sheet to scratch."""
    sheet_path.parent.mkdir(parents=True, exist_ok=True)
    w, h = 920, 560
    sheet = Image.new("RGBA", (w, h), (7, 12, 18, 255))
    draw = ImageDraw.Draw(sheet)

    tints = {
        "curtain-drape.png": (21, 100, 135),
        "parchment-grain.png": (157, 181, 194),
        "ribbon-swirl.png": (60, 163, 204),
        "gold-glint.png": (245, 206, 75),
        "stitch-frame.png": (191, 98, 15),
    }

    slots = [
        (20, 34, 160, 480),
        (210, 34, 240, 240),
        (480, 34, 420, 64),
        (480, 140, 420, 96),
        (210, 314, 200, 200),
    ]
    for (name, mask_img), (x, y, sw, sh) in zip(sprites, slots):
        draw.rectangle([x - 2, y - 2, x + sw + 2, y + sh + 2], outline=(21, 100, 135, 255), width=1)
        draw.text((x, y - 18), f"{name} ({mask_img.width}x{mask_img.height})", fill=(228, 178, 23, 255))
        resized = mask_img.resize((sw, sh), Image.Resampling.LANCZOS)
        r, g, b = tints.get(name, (247, 245, 238))
        alpha = resized.getchannel("A")
        tinted = Image.new("RGBA", (sw, sh), (r, g, b, 255))
        tinted.putalpha(alpha)
        sheet.alpha_composite(tinted, (x, y))

    sheet.save(sheet_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Swallowtail white-mask FX PNGs.")
    parser.add_argument("--sheet", type=Path, default=None, help="Optional scratch path for contact sheet PNG.")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sprites = [
        ("curtain-drape.png", make_curtain_drape()),
        ("parchment-grain.png", make_parchment_grain()),
        ("ribbon-swirl.png", make_ribbon_swirl()),
        ("gold-glint.png", make_gold_glint()),
        ("stitch-frame.png", make_stitch_frame()),
        ("stage-chart.png", make_stage_chart()),
    ]
    for name, img in sprites:
        print(f"wrote {OUT_DIR / name} ({img.width}x{img.height})")
    if args.sheet:
        write_contact_sheet(sprites, args.sheet)
        print(f"wrote contact sheet {args.sheet}")


if __name__ == "__main__":
    main()
