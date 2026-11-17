#!/usr/bin/env python3
"""Black Box sprite generator. Deterministic (fixed seed 20170223).

Generates white-mask RGBA PNGs (RGB 255, effect in alpha) in src/Images/fx/
at 2 px per DIP (192 dpi). XAML fills geometry/rectangles with DynamicResource
brushes masked by ImageBrush, and HTML previews apply the same files with CSS
-webkit-mask / -webkit-mask-box-image, so ThemeModifier recolors every effect.

Run from repo root:
    python src/themes/BlackBox/art/sprites.py [--sheet <scratch-path>]
"""
import argparse
import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
THEME = os.path.dirname(HERE)
OUT = os.path.join(THEME, "src", "Images", "fx")
os.makedirs(OUT, exist_ok=True)

PX = 2
DPI = 96 * PX
SEED = 20170223


def save_mask(name: str, alpha_01: np.ndarray, blur: float = 0.0) -> np.ndarray:
    a = np.clip(alpha_01, 0.0, 1.0)
    img_a = Image.fromarray((a * 255.0 + 0.5).astype(np.uint8), "L")
    if blur > 0:
        img_a = img_a.filter(ImageFilter.GaussianBlur(blur))
    arr_a = np.array(img_a, dtype=np.uint8)
    rgba = np.dstack([
        np.full_like(arr_a, 255),
        np.full_like(arr_a, 255),
        np.full_like(arr_a, 255),
        arr_a,
    ])
    path = os.path.join(OUT, f"{name}.png")
    Image.fromarray(rgba, "RGBA").save(path, optimize=True, dpi=(DPI, DPI))
    return arr_a.astype(np.float32) / 255.0


def gen_grid_scan() -> np.ndarray:
    """Seamless 64x64 DIP (128x128 px) 32px YoRHa coordinate grid + CRT scanlines."""
    w = h = 64 * PX
    arr = np.zeros((h, w), dtype=np.float32)
    # Horizontal CRT scanlines every 4 px (2 DIP)
    for y in range(0, h, 4):
        arr[y, :] = 0.18
        arr[y + 1, :] = 0.08
    # 32 DIP (64 px) coordinate grid hairlines
    step = 32 * PX
    for pos in (0, step):
        arr[pos, :] = np.maximum(arr[pos, :], 0.48)
        arr[:, pos] = np.maximum(arr[:, pos], 0.48)
    # '+' crosshair ticks at grid intersections (16 DIP offset too)
    for cy in (0, step):
        for cx in (0, step):
            for d in range(-5, 6):
                arr[(cy + d) % h, cx] = 0.85
                arr[cy, (cx + d) % w] = 0.85
    # Sub-grid center diamond pip at (16 DIP, 16 DIP) and (48 DIP, 48 DIP)
    for cy in (step // 2, step + step // 2):
        for cx in (step // 2, step + step // 2):
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    if abs(dx) + abs(dy) <= 2:
                        arr[cy + dy, cx + dx] = max(arr[cy + dy, cx + dx], 0.65)
    return save_mask("grid-scan", arr, blur=0.0)


def gen_diamond_frieze() -> np.ndarray:
    """320x14 DIP (640x28 px) YoRHa diamond-and-dot horizontal border ornament."""
    w, h = 320 * PX, 14 * PX
    ss = 2
    cw, ch = w * ss, h * ss
    img = Image.new("L", (cw, ch), 0)
    dr = ImageDraw.Draw(img)
    cy = ch // 2
    cx = cw // 2

    # Main horizontal hairline rule with end tapers
    dr.rectangle([16 * ss, cy - 1 * ss, cw - 16 * ss, cy + 1 * ss], fill=215)
    # Secondary parallel musical staff hairline 5 DIP below center in middle span
    y2 = cy + 6 * ss
    dr.rectangle([cx - 170 * ss, y2, cx + 170 * ss, y2 + 1 * ss], fill=125)

    def draw_open_diamond(x: int, y: int, r: int, stroke: int = 3, fill_dot: bool = True):
        pts_out = [(x, y - r), (x + r, y), (x, y + r), (x - r, y)]
        dr.polygon(pts_out, fill=255)
        r_in = max(1, r - stroke)
        pts_in = [(x, y - r_in), (x + r_in, y), (x, y + r_in), (x - r_in, y)]
        dr.polygon(pts_in, fill=0)
        if fill_dot and r >= 8 * ss:
            rd = 3 * ss
            dr.polygon([(x, y - rd), (x + rd, y), (x, y + rd), (x - rd, y)], fill=245)

    def draw_solid_diamond(x: int, y: int, r: int):
        dr.polygon([(x, y - r), (x + r, y), (x, y + r), (x - r, y)], fill=235)

    # Center double-diamond cluster
    draw_open_diamond(cx, cy, 11 * ss, stroke=3 * ss, fill_dot=True)
    for sign in (-1, 1):
        draw_solid_diamond(cx + sign * 22 * ss, cy, 4 * ss)
        draw_open_diamond(cx + sign * 42 * ss, cy, 8 * ss, stroke=2 * ss, fill_dot=True)
        draw_solid_diamond(cx + sign * 60 * ss, cy, 3 * ss)
        # Musical double-bar vertical ticks
        bx = cx + sign * 84 * ss
        dr.rectangle([bx - 2 * ss, cy - 7 * ss, bx + 2 * ss, cy + 7 * ss], fill=240)
        bx2a = min(bx + sign * 5 * ss, bx + sign * 7 * ss)
        bx2b = max(bx + sign * 5 * ss, bx + sign * 7 * ss)
        dr.rectangle([bx2a, cy - 7 * ss, bx2b, cy + 7 * ss], fill=190)
        # Outer repeating diamond pips
        for step_x in (116, 152, 188, 224, 260):
            draw_solid_diamond(cx + sign * step_x * ss, cy, 3 * ss)

    img = img.resize((w, h), Image.Resampling.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    # Soft fade at extreme left/right 24 DIP edges
    xs = np.arange(w, dtype=np.float32)
    edge_fade = np.minimum(xs / (24.0 * PX), (w - 1 - xs) / (24.0 * PX))
    edge_fade = np.clip(edge_fade, 0.0, 1.0)
    arr *= edge_fade[None, :]
    return save_mask("diamond-frieze", arr, blur=0.0)


def gen_cursor_glow() -> np.ndarray:
    """128x64 DIP (256x128 px) 9-slice CRT phosphor edge bloom + rail overhangs (slice 32 DIP)."""
    w, h = 128 * PX, 64 * PX
    pad = 14 * PX
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # Distance to inner rectangle [pad, w-pad] x [pad, h-pad]
    dx = np.maximum(0.0, np.maximum(pad - xx, xx - (w - 1 - pad)))
    dy = np.maximum(0.0, np.maximum(pad - yy, yy - (h - 1 - pad)))
    dist_out = np.hypot(dx, dy)
    # Distance inside inner rectangle
    dx_in = np.minimum(xx - pad, (w - 1 - pad) - xx)
    dy_in = np.minimum(yy - pad, (h - 1 - pad) - yy)
    dist_in = np.maximum(0.0, np.minimum(dx_in, dy_in))
    dist = np.where((xx >= pad) & (xx <= w - 1 - pad) & (yy >= pad) & (yy <= h - 1 - pad), dist_in, dist_out)

    glow = np.exp(-((dist / (6.0 * PX)) ** 1.85)) * 0.72
    # Crisp 1 DIP tracking rail 3 DIP outside top and bottom edges of the inner box
    rail_y_top = pad - 3 * PX
    rail_y_bot = h - 1 - pad + 3 * PX
    in_x = (xx >= pad - 4 * PX) & (xx <= w - 1 - pad + 4 * PX)
    for ry in (rail_y_top, rail_y_bot):
        rail_band = np.exp(-(((yy - ry) / (1.0 * PX)) ** 2)) * in_x
        glow = np.maximum(glow, rail_band * 0.95)
    # Corner diamond nodes at the 4 corners of the tracking rails
    for cy in (rail_y_top, rail_y_bot):
        for cx in (pad - 2 * PX, w - 1 - pad + 2 * PX):
            md = np.abs(xx - cx) + np.abs(yy - cy)
            glow = np.maximum(glow, np.clip(1.0 - md / (4.0 * PX), 0.0, 1.0))
    # Ensure zero alpha at outer boundaries so 9-slice edges never show a box line
    edge_x = np.clip(np.minimum(xx, w - 1 - xx) / (6.0 * PX), 0.0, 1.0)
    edge_y = np.clip(np.minimum(yy, h - 1 - yy) / (6.0 * PX), 0.0, 1.0)
    glow *= (edge_x * edge_y) ** 1.5
    return save_mask("cursor-glow", glow, blur=0.5)


def gen_scan_glitch() -> np.ndarray:
    """160x40 DIP (320x80 px) angled YoRHa telemetry scan-beam with CRT scan-bars."""
    w, h = 160 * PX, 40 * PX
    rng = np.random.default_rng(SEED)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u = xx / w
    v = yy / h
    # Angled slash center around u = 0.52 - 0.14*(v - 0.5)
    center = 0.52 - 0.14 * (v - 0.5)
    beam = np.exp(-(((u - center) / 0.16) ** 2)) * 0.65
    head = np.exp(-(((u - (center + 0.07)) / 0.025) ** 2)) * 0.95
    arr = np.maximum(beam, head)
    # Modulate with horizontal CRT scanline bars
    scan = np.where((yy.astype(int) % 4) < 2, 1.0, 0.42).astype(np.float32)
    arr *= scan
    # Deterministic horizontal data-packet bars near the scan head
    for _ in range(18):
        ry = int(rng.integers(4, h - 4))
        rx = int(w * (0.35 + rng.random() * 0.35))
        rw = int(rng.integers(10 * PX, 28 * PX))
        rh = 2
        arr[ry:min(h, ry + rh), max(0, rx - rw // 2):min(w, rx + rw // 2)] = np.maximum(
            arr[ry:min(h, ry + rh), max(0, rx - rw // 2):min(w, rx + rw // 2)], 0.88
        )
    # Fade extreme left/right ends so tile/clip edges never hard-cut
    fade_x = np.sin(np.clip(u, 0.0, 1.0) * math.pi) ** 1.4
    arr *= fade_x
    return save_mask("scan-glitch", arr, blur=0.4)


def gen_pod_reticle() -> np.ndarray:
    """128x128 DIP (256x256 px) geometric YoRHa Pod reticle + octagram + musical double-bars."""
    w = h = 128 * PX
    ss = 2
    cw, ch = w * ss, h * ss
    img = Image.new("L", (cw, ch), 0)
    dr = ImageDraw.Draw(img)
    cx = cy = cw // 2

    # Outer and inner circles
    for r, width, col in [(56 * PX * ss, 2 * ss, 200), (42 * PX * ss, 2 * ss, 235), (18 * PX * ss, 2 * ss, 220)]:
        dr.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=width)

    # 36 degree radial tick marks between r=44 and r=54
    for deg in range(0, 360, 10):
        rad = math.radians(deg)
        r0 = (44 if deg % 30 == 0 else 48) * PX * ss
        r1 = 53 * PX * ss
        x0, y0 = cx + r0 * math.cos(rad), cy + r0 * math.sin(rad)
        x1, y1 = cx + r1 * math.cos(rad), cy + r1 * math.sin(rad)
        dr.line([x0, y0, x1, y1], fill=225 if deg % 30 == 0 else 145, width=2 * ss if deg % 30 == 0 else ss)

    # Rotated 45-deg diamond square + axis-aligned square (Black Box octagram)
    r_d = 34 * PX * ss
    dr.polygon([(cx, cy - r_d), (cx + r_d, cy), (cx, cy + r_d), (cx - r_d, cy)], outline=250, width=3 * ss)
    r_s = int(r_d * 0.7071)
    dr.rectangle([cx - r_s, cy - r_s, cx + r_s, cy + r_s], outline=185, width=2 * ss)

    # Center diamond pip
    r_c = 6 * PX * ss
    dr.polygon([(cx, cy - r_c), (cx + r_c, cy), (cx, cy + r_c), (cx - r_c, cy)], fill=255)

    # Cardinal musical double-bars outside outer ring
    for sign in (-1, 1):
        bx = cx + sign * 60 * PX * ss
        dr.rectangle([bx - 2 * ss, cy - 8 * PX * ss, bx + 2 * ss, cy + 8 * PX * ss], fill=245)

    img = img.resize((w, h), Image.Resampling.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return save_mask("pod-reticle", arr, blur=0.0)


def build_contact_sheet(masks: dict[str, np.ndarray], sheet_path: str):
    os.makedirs(os.path.dirname(os.path.abspath(sheet_path)), exist_ok=True)
    # Render on dark charcoal #333029 so white-alpha masks are clearly inspectable
    cw, ch = 920, 480
    sheet = Image.new("RGBA", (cw, ch), (51, 48, 41, 255))
    positions = [
        ("grid-scan", 24, 24),
        ("diamond-frieze", 200, 24),
        ("cursor-glow", 24, 200),
        ("scan-glitch", 320, 200),
        ("pod-reticle", 660, 170),
    ]
    for name, x, y in positions:
        a = masks[name]
        h, w = a.shape
        # Tint with warm parchment #f2efe0
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[..., 0] = 242
        rgba[..., 1] = 239
        rgba[..., 2] = 224
        rgba[..., 3] = (np.clip(a, 0.0, 1.0) * 255.0 + 0.5).astype(np.uint8)
        tile = Image.fromarray(rgba, "RGBA")
        sheet.alpha_composite(tile, (x, y))
    sheet.save(sheet_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", default="", help="Optional path for contact sheet PNG")
    args = parser.parse_args()
    masks = {
        "grid-scan": gen_grid_scan(),
        "diamond-frieze": gen_diamond_frieze(),
        "cursor-glow": gen_cursor_glow(),
        "scan-glitch": gen_scan_glitch(),
        "pod-reticle": gen_pod_reticle(),
    }
    if args.sheet:
        build_contact_sheet(masks, args.sheet)
    print(f"Generated {len(masks)} sprites in {OUT}")


if __name__ == "__main__":
    main()
