#!/usr/bin/env python3
"""
Deterministic white-mask FX sprite generator for Canister.
Outputs pure-white (255, 255, 255) RGBA alpha-mask PNGs into src/Images/fx/
so WPF OpacityMask and CSS -webkit-mask recolor them dynamically via theme brushes.
Fixed random seed (2024) guarantees bit-identical regenerations.

Run:
    python3 src/themes/Canister/art/sprites.py [--sheet /path/to/scratch/fx-sheet.png]
"""
import argparse
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 2024
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
    img.save(path, optimize=True)
    return img


def smoothstep(e0, e1, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - e0) / np.maximum(1e-6, e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def noise1d(rng: np.random.Generator, n: int, scale: int, octaves: int = 4) -> np.ndarray:
    out = np.zeros(n, dtype=np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        step = max(1, int(round(scale / (2 ** o))))
        count = n // step + 3
        pts = rng.uniform(-1.0, 1.0, count).astype(np.float32)
        xs = np.arange(n, dtype=np.float32) / step
        i = xs.astype(int)
        f = xs - i
        f = f * f * (3.0 - 2.0 * f)
        out += amp * (pts[i] * (1.0 - f) + pts[i + 1] * f)
        total += amp
        amp *= 0.5
    return out / total


def make_tape_strip(rng: np.random.Generator) -> Image.Image:
    """512x80 rough-edged torn painter's masking-tape strip with crepe ridges."""
    w, h = 512, 80
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    # Slight organic deckle along top & bottom edges
    top_edge = 5.0 + 2.6 * noise1d(rng, w, 48, 3) + 1.0 * noise1d(rng, w, 10, 2)
    bot_edge = (h - 5.0) + 2.6 * noise1d(rng, w, 44, 3) + 1.0 * noise1d(rng, w, 9, 2)
    vert = smoothstep(top_edge - 1.5, top_edge + 1.5, yy) * (1.0 - smoothstep(bot_edge - 1.5, bot_edge + 1.5, yy))

    # Jagged ripped painter's tape ends on left & right (keep middle ~90% solid)
    y1 = np.arange(h, dtype=np.float32)
    left_rip = 14.0 + 7.5 * np.sin((y1 / h) * math.pi * 4.5) + 5.5 * noise1d(rng, h, 14, 3)
    right_rip = (w - 14.0) - 7.0 * np.cos((y1 / h) * math.pi * 5.0) + 5.5 * noise1d(rng, h, 13, 3)
    horiz = smoothstep(left_rip[:, None] - 1.8, left_rip[:, None] + 1.8, xx) * (
        1.0 - smoothstep(right_rip[:, None] - 1.8, right_rip[:, None] + 1.8, xx)
    )

    # Subtle horizontal crepe-tape fiber texture
    crepe = 0.88 + 0.12 * np.sin(yy * 0.75 + 1.8 * noise1d(rng, w, 32, 2)[None, :])
    speckle = 0.94 + 0.06 * rng.uniform(0.0, 1.0, (h, w)).astype(np.float32)
    alpha = vert * horiz * crepe * speckle * 255.0
    return save_white_mask(alpha, OUT_DIR / "tape-strip.png")


def make_splatter_cloud(rng: np.random.Generator) -> Image.Image:
    """384x256 organic NYC aerosol spray-paint mist & droplet splatter cloud."""
    w, h = 384, 256
    canvas = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(canvas)

    # Soft overlapping aerosol mist puffs forming a ragged central cloud
    cx, cy = w * 0.5, h * 0.5
    for _ in range(28):
        angle = rng.uniform(0, math.tau)
        dist = rng.exponential(36.0)
        px = cx + math.cos(angle) * dist * 1.35
        py = cy + math.sin(angle) * dist * 0.82
        rx = rng.uniform(18, 52)
        ry = rng.uniform(14, 38)
        val = int(rng.uniform(45, 110))
        draw.ellipse((px - rx, py - ry, px + rx, py + ry), fill=val)

    mist = canvas.filter(ImageFilter.GaussianBlur(radius=14))
    arr = np.array(mist, dtype=np.float32)

    # Crisp aerosol micro-splatter & radial paint droplets
    drops = Image.new("L", (w, h), 0)
    dd = ImageDraw.Draw(drops)
    for _ in range(180):
        angle = rng.uniform(0, math.tau)
        dist = rng.uniform(12, 165) ** 1.03
        px = cx + math.cos(angle) * dist * 1.08
        py = cy + math.sin(angle) * dist * 0.72
        if 4 <= px < w - 4 and 4 <= py < h - 4:
            r = rng.choice([1.2, 1.8, 2.5, 3.6, 5.2], p=[0.42, 0.28, 0.16, 0.10, 0.04])
            val = int(rng.uniform(145, 245))
            dd.ellipse((px - r, py - r, px + r, py + r), fill=val)

    # Edge fade so mask never clips at bitmap boundaries
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rx = (xx - cx) / (w * 0.47)
    ry = (yy - cy) / (h * 0.47)
    rad = np.sqrt(rx * rx + ry * ry)
    vignette = 1.0 - smoothstep(0.68, 1.0, rad)

    combined = np.clip((arr * 1.45 + np.array(drops, dtype=np.float32) * 0.85) * vignette, 0, 255)
    return save_white_mask(combined, OUT_DIR / "splatter-cloud.png")


def make_chalk_grain(rng: np.random.Generator) -> Image.Image:
    """256x256 seamless tileable gritty dark chalkboard / alley concrete micro-grain."""
    size = 256
    freqs = np.fft.fftfreq(size)
    fy, fx = np.meshgrid(freqs, freqs, indexing="ij")
    r = np.sqrt(fx * fx + fy * fy)
    r[0, 0] = 1.0

    # Broad chalk clouds
    lo = np.real(np.fft.ifft2(np.fft.fft2(rng.normal(0, 1, (size, size))) / (r ** 1.05)))
    lo = (lo - lo.min()) / (lo.max() - lo.min() + 1e-6)

    # Diagonal comic chalk hatch micro-grain
    aniso = np.sqrt((fx * 0.85 + fy * 0.5) ** 2 + (-fx * 0.5 + fy * 1.25) ** 2)
    aniso[0, 0] = 1.0
    hi = np.real(
        np.fft.ifft2(np.fft.fft2(rng.normal(0, 1, (size, size))) * np.exp(-((aniso - 0.24) / 0.16) ** 2))
    )
    hi = (hi - hi.min()) / (hi.max() - hi.min() + 1e-6)

    combined = 0.52 * lo + 0.48 * hi
    return save_white_mask(combined * 255.0, OUT_DIR / "chalk-grain.png")


def make_torn_bottom(rng: np.random.Generator) -> Image.Image:
    """512x48 jagged torn bottom paper edge (solid top -> ripped lower silhouette)."""
    w, h = 512, 48
    yy, _ = np.mgrid[0:h, 0:w].astype(np.float32)
    x1 = np.arange(w, dtype=np.float32)
    rip = 24.0 + 11.0 * noise1d(rng, w, 34, 4) + 5.0 * noise1d(rng, w, 9, 2) + 3.0 * np.sin(x1 * 0.045)
    alpha = (1.0 - smoothstep(rip[None, :] - 1.4, rip[None, :] + 1.4, yy)) * 255.0
    return save_white_mask(alpha, OUT_DIR / "torn-bottom.png")


def make_notebook_lines(rng: np.random.Generator) -> Image.Image:
    """256x128 seamless tileable ruled notebook lines (every 25.6px) + subtle paper tooth."""
    w, h = 256, 128
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    alpha = np.full((h, w), 14.0, dtype=np.float32)

    # 5 horizontal ruled lines across 128px (spacing 25.6px) with slight hand-printed wobble
    for i in range(5):
        cy = 12.0 + i * 25.6
        wobble = 0.45 * np.sin((xx / w) * math.tau * 2.0 + i * 1.3)
        dist = np.abs(yy - (cy + wobble))
        line = np.clip(1.0 - dist / 1.35, 0.0, 1.0) * 195.0
        alpha = np.maximum(alpha, line)

    tooth = rng.uniform(0.82, 1.0, (h, w)).astype(np.float32)
    return save_white_mask(alpha * tooth, OUT_DIR / "notebook-lines.png")


def make_ooze_glint(rng: np.random.Generator) -> Image.Image:
    """256x64 diagonal sketchy comic highlight slash + splatter specks for Play hover."""
    w, h = 256, 64
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # Slanted double comic shine band
    diag = (xx - w * 0.5) + (yy - h * 0.5) * 0.85
    main_band = np.exp(-((diag + 6.0) / 19.0) ** 2) * 235.0
    thin_band = np.exp(-((diag - 26.0) / 5.5) ** 2) * 185.0
    # Slight dry-brush horizontal streaks
    streaks = 0.78 + 0.22 * noise1d(rng, h, 6, 2)[:, None]
    alpha = np.clip((main_band + thin_band) * streaks, 0, 255)
    return save_white_mask(alpha, OUT_DIR / "ooze-glint.png")


def make_spiral_holes() -> Image.Image:
    """24x256 vertically tiled spiral-notebook punched holes & wire binding marks."""
    w, h = 24, 256
    canvas = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(canvas)
    # 8 punched holes evenly spaced every 32px
    for i in range(8):
        cy = 16 + i * 32
        # Punched circular hole
        draw.ellipse((9, cy - 5, 19, cy + 5), fill=235)
        # Double wire coil loop bridging left edge into hole
        draw.rounded_rectangle((0, cy - 3, 14, cy - 1), radius=1, fill=200)
        draw.rounded_rectangle((0, cy + 1, 14, cy + 3), radius=1, fill=165)
    return save_white_mask(np.array(canvas, dtype=np.float32), OUT_DIR / "spiral-holes.png")


def make_sketch_hatch(rng: np.random.Generator) -> Image.Image:
    """256x256 seamless hand-drawn comic crosshatch & pencil-tooth background texture."""
    size = 256
    canvas = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(canvas)

    def wrap_line(x0, y0, x1, y1, val, width=1):
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                draw.line((x0 + ox, y0 + oy, x1 + ox, y1 + oy), fill=val, width=width)

    # Loose diagonal pencil/ink hatch clusters (primary -35deg & secondary +52deg)
    for _ in range(190):
        x0 = rng.uniform(0, size)
        y0 = rng.uniform(0, size)
        length = rng.uniform(16, 52)
        angle = math.radians(-34 + rng.uniform(-6, 6))
        x1 = x0 + math.cos(angle) * length
        y1 = y0 + math.sin(angle) * length
        val = int(rng.uniform(55, 165))
        w_px = 1 if rng.random() < 0.8 else 2
        wrap_line(x0, y0, x1, y1, val, width=w_px)

    # Sparse cross-strokes & tiny sketchy ink ticks
    for _ in range(75):
        x0 = rng.uniform(0, size)
        y0 = rng.uniform(0, size)
        length = rng.uniform(10, 28)
        angle = math.radians(52 + rng.uniform(-8, 8))
        x1 = x0 + math.cos(angle) * length
        y1 = y0 + math.sin(angle) * length
        wrap_line(x0, y0, x1, y1, int(rng.uniform(45, 130)), width=1)

    # Subtle paper tooth speckle
    arr = np.array(canvas.filter(ImageFilter.GaussianBlur(radius=0.35)), dtype=np.float32)
    tooth = rng.uniform(0.0, 26.0, (size, size)).astype(np.float32)
    alpha = np.clip(arr + tooth, 0, 255)
    return save_white_mask(alpha, OUT_DIR / "sketch-hatch.png")


def make_sidepanel_sketch(rng: np.random.Generator) -> Image.Image:
    """192x512 vertically tileable side-panel sketchbook margin texture with zig-zags,
    halftone patches, hand-drawn comic stars, arrow scribbles, and dry-brush streaks."""
    w, h = 192, 512
    canvas = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(canvas)

    def wrap_y_line(pts, val, width=2):
        for oy in (-h, 0, h):
            draw.line([(x, y + oy) for x, y in pts], fill=val, width=width)

    # Diagonal comic crosshatch clusters concentrated near panel edges
    for _ in range(140):
        x0 = rng.uniform(4, w - 8)
        y0 = rng.uniform(0, h)
        length = rng.uniform(14, 38)
        ang = math.radians(-38 + rng.uniform(-9, 9))
        pts = [(x0, y0), (x0 + math.cos(ang) * length, y0 + math.sin(ang) * length)]
        wrap_y_line(pts, int(rng.uniform(60, 155)), width=1 if rng.random() < 0.7 else 2)

    # Hand-drawn sketchy zig-zag scribble bands (Mutant Mayhem margin energy)
    for cy in (76, 224, 388):
        cx = rng.uniform(26, w - 42)
        pts = []
        for k in range(9):
            px = cx + (k % 2) * rng.uniform(14, 24) - 8
            py = cy + k * 7.5 + rng.uniform(-1.5, 1.5)
            pts.append((px, py))
        wrap_y_line(pts, 185, width=2)

    # Sketchy 4-point comic stars & little 'X' graffiti ticks
    for sx, sy, sr in ((34, 146, 9), (144, 294, 11), (48, 456, 8), (152, 62, 7)):
        for oy in (-h, 0, h):
            star = [
                (sx, sy - sr + oy), (sx + sr * 0.28, sy - sr * 0.28 + oy),
                (sx + sr, sy + oy), (sx + sr * 0.28, sy + sr * 0.28 + oy),
                (sx, sy + sr + oy), (sx - sr * 0.28, sy + sr * 0.28 + oy),
                (sx - sr, sy + oy), (sx - sr * 0.28, sy - sr * 0.28 + oy),
            ]
            draw.polygon(star, outline=210, fill=65)

    for tx, ty in ((130, 178), (28, 336), (118, 434), (82, 42)):
        wrap_y_line([(tx - 5, ty - 5), (tx + 5, ty + 5)], 175, width=2)
        wrap_y_line([(tx + 5, ty - 5), (tx - 5, ty + 5)], 175, width=2)

    # Gritty comic halftone dot clusters along outer right/left margins
    for bx, by in ((152, 112), (24, 266), (142, 372)):
        for r_i in range(5):
            for c_i in range(4):
                dx = bx + c_i * 7 + (r_i % 2) * 3
                dy = by + r_i * 7
                rad = max(1.1, 2.7 - 0.35 * abs(c_i - 1.5) - 0.3 * abs(r_i - 2))
                for oy in (-h, 0, h):
                    draw.ellipse((dx - rad, dy + oy - rad, dx + rad, dy + oy + rad), fill=150)

    # Loose vertical dry-brush marker strokes hugging left edge
    for x_off, val in ((5, 140), (10, 85)):
        pts = [(x_off + rng.uniform(-1.5, 1.5), y) for y in range(0, h + 16, 16)]
        wrap_y_line(pts, val, width=2)

    arr = np.array(canvas.filter(ImageFilter.GaussianBlur(radius=0.35)), dtype=np.float32)
    return save_white_mask(arr, OUT_DIR / "sidepanel-sketch.png")


def make_halftone_doodle(rng: np.random.Generator) -> Image.Image:
    """320x240 comic halftone dot burst + hand-drawn speed lines & sketchy lightning/star scribbles
    for sparse corners of Game Pages & Settings."""
    w, h = 320, 240
    canvas = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(canvas)

    # Angled comic halftone dot field concentrated toward bottom-right
    step = 9
    for y in range(6, h - 4, step):
        for x in range(6, w - 4, step):
            nx = x / w
            ny = y / h
            strength = max(0.0, (nx * 0.72 + ny * 0.68) - 0.48)
            if strength > 0.04:
                r = min(3.4, strength * 4.4)
                jx = x + rng.uniform(-0.8, 0.8)
                jy = y + rng.uniform(-0.8, 0.8)
                draw.ellipse((jx - r, jy - r, jx + r, jy + r), fill=int(min(220, 90 + strength * 190)))

    # Hand-inked diagonal speed slashes sweeping from bottom-right corner
    for i in range(14):
        sx = w - 12 - i * 16 + rng.uniform(-5, 5)
        sy = h - 8 - rng.uniform(0, 42)
        length = rng.uniform(44, 118)
        ang = math.radians(-148 + rng.uniform(-6, 6))
        ex = sx + math.cos(ang) * length
        ey = sy + math.sin(ang) * length
        draw.line((sx, sy, ex, ey), fill=int(rng.uniform(110, 215)), width=2 if i % 3 == 0 else 1)

    # Sketchy comic lightning bolt & two hand-drawn stars
    bolt = [(236, 128), (258, 112), (249, 134), (272, 120), (254, 152)]
    draw.line(bolt, fill=235, width=3)
    for sx, sy, sr in ((198, 174, 13), (276, 186, 10)):
        star = [
            (sx, sy - sr), (sx + sr * 0.3, sy - sr * 0.3),
            (sx + sr, sy), (sx + sr * 0.3, sy + sr * 0.3),
            (sx, sy + sr), (sx - sr * 0.3, sy + sr * 0.3),
            (sx - sr, sy), (sx - sr * 0.3, sy - sr * 0.3),
        ]
        draw.polygon(star, outline=230, fill=90)

    # Soft vignette fade on top & left edges so it never clips abruptly
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    fade = smoothstep(0.05, 0.38, xx / w) * smoothstep(0.05, 0.38, yy / h)
    arr = np.array(canvas.filter(ImageFilter.GaussianBlur(radius=0.3)), dtype=np.float32) * fade
    return save_white_mask(arr, OUT_DIR / "halftone-doodle.png")


def make_sketch_edge_v(rng: np.random.Generator) -> Image.Image:
    """12x256 vertically tileable ragged hand-inked marker seam for side-panel borders."""
    w, h = 12, 256
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    y1 = np.arange(h, dtype=np.float32)
    # Periodic wobble so vertical tiling is seamless
    wobble = 1.6 * np.sin((y1 / h) * math.tau * 3.0) + 0.9 * np.cos((y1 / h) * math.tau * 7.0 + 0.8)
    center = 5.5 + wobble[:, None]
    thickness = 1.6 + 0.65 * np.sin((y1 / h) * math.tau * 5.0 + 1.4)[:, None]
    line = np.clip(1.0 - np.abs(xx - center) / thickness, 0.0, 1.0)
    # Secondary faint sketchy double-stroke
    center2 = 8.4 + 1.1 * np.cos((y1 / h) * math.tau * 4.0)[:, None]
    line2 = np.clip(1.0 - np.abs(xx - center2) / 0.95, 0.0, 1.0) * 0.45
    grain = rng.uniform(0.72, 1.0, (h, w)).astype(np.float32)
    alpha = np.clip(np.maximum(line, line2) * grain * 255.0, 0, 255)
    return save_white_mask(alpha, OUT_DIR / "sketch-edge-v.png")


def write_contact_sheet(images: list[tuple[str, Image.Image]], sheet_path: Path) -> None:
    cols = 2
    rows = math.ceil(len(images) / cols)
    cell_w, cell_h = 400, 170
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (19, 22, 26))
    draw = ImageDraw.Draw(sheet)
    palette = [(247, 220, 40), (68, 230, 29), (237, 79, 36), (238, 40, 54)]

    for idx, (name, mask_img) in enumerate(images):
        r, c = divmod(idx, cols)
        x0, y0 = c * cell_w, r * cell_h
        draw.rectangle((x0 + 6, y0 + 6, x0 + cell_w - 6, y0 + cell_h - 6), outline=(56, 63, 72))
        draw.text((x0 + 14, y0 + 12), f"{name} ({mask_img.width}x{mask_img.height})", fill=(244, 241, 232))

        tint = Image.new("RGBA", mask_img.size, palette[idx % len(palette)] + (255,))
        tint.putalpha(mask_img.getchannel("A"))
        preview = tint.copy()
        preview.thumbnail((cell_w - 36, cell_h - 46), Image.Resampling.LANCZOS)
        px = x0 + (cell_w - preview.width) // 2
        py = y0 + 34 + (cell_h - 44 - preview.height) // 2
        sheet.paste(preview, (px, py), preview)

    sheet_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(sheet_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", type=str, default="", help="Optional path for contact sheet PNG (use scratch)")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(SEED)

    outputs = [
        ("tape-strip.png", make_tape_strip(rng)),
        ("splatter-cloud.png", make_splatter_cloud(rng)),
        ("chalk-grain.png", make_chalk_grain(rng)),
        ("torn-bottom.png", make_torn_bottom(rng)),
        ("notebook-lines.png", make_notebook_lines(rng)),
        ("ooze-glint.png", make_ooze_glint(rng)),
        ("spiral-holes.png", make_spiral_holes()),
        ("sketch-hatch.png", make_sketch_hatch(rng)),
        ("sidepanel-sketch.png", make_sidepanel_sketch(rng)),
        ("halftone-doodle.png", make_halftone_doodle(rng)),
        ("sketch-edge-v.png", make_sketch_edge_v(rng)),
    ]
    for name, img in outputs:
        print(f"wrote {OUT_DIR / name} ({img.width}x{img.height})")

    if args.sheet:
        write_contact_sheet(outputs, Path(args.sheet))
        print(f"wrote contact sheet {args.sheet}")


if __name__ == "__main__":
    main()
