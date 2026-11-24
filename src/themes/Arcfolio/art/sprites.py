"""
Arcfolio procedural FX & material mask generator.

Generates deterministic pure-white (255, 255, 255) RGBA alpha-mask PNGs under
src/Images/fx/ so both WPF OpacityMask and HTML -webkit-mask tint them live
through theme brushes / CSS tokens.

Fixed seed (1970) ensures identical output across runs.
Usage:
    python src/themes/Arcfolio/art/sprites.py
    python src/themes/Arcfolio/art/sprites.py --sheet <scratch/fx-sheet.png>
"""

import argparse
import math
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 1970


def save_white_mask(alpha: np.ndarray, path: Path) -> None:
    a = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[:, :, 0] = 255
    rgba[:, :, 1] = 255
    rgba[:, :, 2] = 255
    rgba[:, :, 3] = a
    Image.fromarray(rgba, mode="RGBA").save(path, optimize=True)


def value_noise_1d(n: int, scale: float, rng: np.random.Generator) -> np.ndarray:
    knots = max(2, int(math.ceil(n / scale)) + 2)
    vals = rng.random(knots)
    xs = np.linspace(0, knots - 2, n)
    idx = np.floor(xs).astype(int)
    t = xs - idx
    t = t * t * (3 - 2 * t)
    return vals[idx] * (1 - t) + vals[idx + 1] * t


def value_noise_2d(h: int, w: int, scale_y: float, scale_x: float, rng: np.random.Generator) -> np.ndarray:
    ky = max(2, int(math.ceil(h / scale_y)) + 2)
    kx = max(2, int(math.ceil(w / scale_x)) + 2)
    grid = rng.random((ky, kx))
    ys = np.linspace(0, ky - 2, h)
    xs = np.linspace(0, kx - 2, w)
    iy = np.floor(ys).astype(int)
    ix = np.floor(xs).astype(int)
    ty = (ys - iy)[:, None]
    tx = (xs - ix)[None, :]
    ty = ty * ty * (3 - 2 * ty)
    tx = tx * tx * (3 - 2 * tx)
    v00 = grid[iy[:, None], ix[None, :]]
    v01 = grid[iy[:, None], ix[None, :] + 1]
    v10 = grid[iy[:, None] + 1, ix[None, :]]
    v11 = grid[iy[:, None] + 1, ix[None, :] + 1]
    return (v00 * (1 - tx) + v01 * tx) * (1 - ty) + (v10 * (1 - tx) + v11 * tx) * ty


def make_gouache_brush(w: int, h: int, seed_offset: int, bold: bool = True) -> np.ndarray:
    """
    Metaphor: ReFantazio signature horizontal gouache brushstroke:
    solid opaque center core for crisp text contrast, raw parallel bristle streaks
    trailing asymmetrically at left/right ends, ragged dry-brush top/bottom teeth,
    and tiny hand-flicked paint droplets near the tails.
    """
    rng = np.random.default_rng(SEED + seed_offset)
    y = np.linspace(-1.0, 1.0, h)[:, None]
    x = np.linspace(0.0, 1.0, w)[None, :]

    # Subtle vertical profile wobble along the length of the stroke
    top_edge = -0.74 - 0.14 * value_noise_1d(w, w * 0.14, rng) - 0.08 * value_noise_1d(w, w * 0.035, rng)
    bot_edge = 0.74 + 0.14 * value_noise_1d(w, w * 0.13, rng) + 0.08 * value_noise_1d(w, w * 0.032, rng)
    if not bold:
        top_edge = -0.80 - 0.10 * value_noise_1d(w, w * 0.16, rng) - 0.06 * value_noise_1d(w, w * 0.04, rng)
        bot_edge = 0.80 + 0.10 * value_noise_1d(w, w * 0.16, rng) + 0.06 * value_noise_1d(w, w * 0.04, rng)

    # Fine horizontal bristle fibers running the full length
    bristles = (
        0.55 * value_noise_2d(h, w, 1.8, w * 0.35, rng)
        + 0.30 * value_noise_2d(h, w, 3.2, w * 0.12, rng)
        + 0.15 * value_noise_2d(h, w, 1.1, w * 0.06, rng)
    )

    # Per-row staggered left and right bristle lengths (signature jagged Metaphor tails!)
    row_jitter_l = (
        0.045 * value_noise_1d(h, 3.5, rng)
        + 0.030 * value_noise_1d(h, 1.6, rng)
        + (0.04 if bold else 0.02) * (np.abs(y[:, 0]) ** 1.6)
    )
    row_jitter_r = (
        0.095 * value_noise_1d(h, 3.2, rng)
        + 0.065 * value_noise_1d(h, 1.4, rng)
        + (0.06 if bold else 0.05) * (np.abs(y[:, 0]) ** 1.4)
    )
    # Slight leftward diagonal sweep on the left, ragged dry-brush drag on the right
    left_cut = (0.018 if bold else 0.005) + row_jitter_l[:, None] - 0.025 * y
    right_cut = (0.965 if bold else 0.980) - row_jitter_r[:, None] + 0.020 * y

    # Compute crisp dry-brush body
    inside_y = np.clip((y - top_edge[None, :]) / 0.11, 0.0, 1.0) * np.clip((bot_edge[None, :] - y) / 0.11, 0.0, 1.0)
    inside_x_l = np.clip((x - left_cut) / 0.022, 0.0, 1.0)
    inside_x_r = np.clip((right_cut - x) / 0.038, 0.0, 1.0)

    # Solid core preserves WCAG text contrast in the middle 82% of the bar
    core_mask = (
        np.clip((x - 0.06) / 0.04, 0.0, 1.0)
        * np.clip((0.88 - x) / 0.05, 0.0, 1.0)
        * np.clip((0.68 - np.abs(y)) / 0.12, 0.0, 1.0)
    )

    # Apply bristle tooth along outer edges and tails
    edge_density = inside_y * inside_x_l * inside_x_r
    alpha = np.where(
        edge_density > 0.01,
        np.clip((edge_density - 0.22 * (1.0 - bristles)) * 1.45, 0.0, 1.0),
        0.0,
    )
    alpha = np.maximum(alpha, core_mask * 0.99)

    img = Image.fromarray(np.clip(alpha * 255, 0, 255).astype(np.uint8), mode="L")
    draw = ImageDraw.Draw(img)
    # Expressive irregular dry-brush flicks along top/bottom edges
    for _ in range(18 if bold else 10):
        fx = rng.uniform(w * 0.14, w * 0.86)
        side = -1 if rng.random() < 0.5 else 1
        fy_base = h * (0.18 if side < 0 else 0.82)
        flen = rng.uniform(w * 0.04, w * 0.14)
        fdy = side * rng.uniform(h * 0.07, h * 0.16)
        poly = [
            (fx, fy_base),
            (fx + flen * 0.45, fy_base + fdy * 0.65),
            (fx + flen, fy_base + fdy),
            (fx + flen * 0.55, fy_base + fdy * 0.15),
        ]
        draw.polygon(poly, fill=int(rng.uniform(200, 255)))

    # Fine flicked paint droplets near the tails (no uniform circles)
    n_splats = 36 if bold else 20
    for _ in range(n_splats):
        if rng.random() < 0.70:
            sx = int(rng.uniform(w * 0.84, w * 0.99))
            sy = int(rng.uniform(h * 0.06, h * 0.94))
        elif rng.random() < 0.5:
            sx = int(rng.uniform(w * 0.01, w * 0.11))
            sy = int(rng.uniform(h * 0.10, h * 0.90))
        else:
            sx = int(rng.uniform(w * 0.15, w * 0.85))
            sy = int(rng.choice([rng.uniform(h * 0.02, h * 0.13), rng.uniform(h * 0.87, h * 0.98)]))
        rx = rng.uniform(1.2, 5.2 if bold else 3.2)
        ry = rng.uniform(0.7, 2.0 if bold else 1.4)
        op = int(rng.uniform(180, 255))
        draw.ellipse((sx - rx, sy - ry, sx + rx, sy + ry), fill=op)

    # Slight crisp sharpening so bristles look tactile, never blurry
    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = np.clip((arr - 0.08) / 0.86, 0.0, 1.0)
    return arr


def make_spine_line_v(w: int = 16, h: int = 512) -> np.ndarray:
    """
    Distressed painted chalk-white vertical spine seam (02_settings, 07_load,
    10_equipment, 11_memorandum, 12_quest). Crisp 2-3px core with dry-brush tooth
    and tiny chalk micro-breaks.
    """
    rng = np.random.default_rng(SEED + 101)
    cx = w * 0.5
    x = np.arange(w, dtype=np.float32)[None, :]
    wobble = (value_noise_1d(h, 42.0, rng) - 0.5) * 1.4 + (value_noise_1d(h, 9.0, rng) - 0.5) * 0.7
    half_w = 1.45 + 0.75 * value_noise_1d(h, 24.0, rng) + 0.45 * value_noise_1d(h, 6.0, rng)
    dist = np.abs(x - (cx + wobble[:, None]))
    line = np.clip(1.0 - (dist - half_w[:, None] * 0.45) / np.maximum(half_w[:, None] * 0.85, 0.6), 0.0, 1.0)

    # Fine chalk grit & dry-brush pinholes
    grit = value_noise_2d(h, w, 5.0, 2.0, rng) * 0.65 + value_noise_2d(h, w, 1.5, 1.2, rng) * 0.35
    alpha = np.clip(line * (0.68 + 0.52 * grit), 0.0, 1.0)
    # Keep spine nearly continuous with rare 1-2px dry skips
    skips = value_noise_1d(h, 14.0, rng)
    alpha = np.where(skips[:, None] < 0.06, alpha * 0.42, alpha)
    return alpha


def make_hairline_h(w: int = 512, h: int = 12) -> np.ndarray:
    """
    Distressed chalk horizontal underline/rule (02_settings, 04_codex, 06_modal).
    Crisp 1.5-2.5px painted chalk line that tapers slightly toward the right end.
    """
    rng = np.random.default_rng(SEED + 202)
    cy = h * 0.5
    y = np.arange(h, dtype=np.float32)[:, None]
    taper = np.clip((1.02 - np.linspace(0.0, 1.0, w)) / 0.14, 0.28, 1.0)
    wobble = (value_noise_1d(w, 48.0, rng) - 0.5) * 1.0 + (value_noise_1d(w, 10.0, rng) - 0.5) * 0.5
    half_h = (1.1 + 0.55 * value_noise_1d(w, 22.0, rng)) * (0.65 + 0.35 * taper)
    dist = np.abs(y - (cy + wobble[None, :]))
    line = np.clip(1.0 - (dist - half_h[None, :] * 0.35) / np.maximum(half_h[None, :] * 0.8, 0.5), 0.0, 1.0)
    grit = value_noise_2d(h, w, 1.8, 6.0, rng)
    return np.clip(line * (0.72 + 0.45 * grit) * taper[None, :], 0.0, 1.0)


def make_ink_splash(size: int = 256) -> np.ndarray:
    """
    Metaphor SYSTEM modal organic gouache splatter (06_modal, 11_memorandum).
    Irregular paint pool with radiating bristle spikes and flicked satellite droplets.
    """
    rng = np.random.default_rng(SEED + 303)
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    cx, cy = size * 0.48, size * 0.52
    dx = (xx - cx) / (size * 0.38)
    dy = (yy - cy) / (size * 0.36)
    # Tilt slightly at Metaphor's signature ~24° diagonal slash angle
    ang = math.radians(-24)
    rx = dx * math.cos(ang) - dy * math.sin(ang)
    ry = dx * math.sin(ang) + dy * math.cos(ang)
    theta = np.arctan2(ry, rx)
    rad = np.sqrt((rx * 0.88) ** 2 + (ry * 1.18) ** 2)

    # Multi-harmonic organic ink edge + spiky radial splashes
    edge = (
        0.64
        + 0.12 * np.sin(3 * theta + 0.6)
        + 0.09 * np.cos(5 * theta - 0.9)
        + 0.08 * np.sin(9 * theta + 1.8)
        + 0.06 * np.cos(14 * theta + 0.4)
    )
    noise = value_noise_2d(size, size, 16.0, 16.0, rng) * 0.55 + value_noise_2d(size, size, 5.0, 5.0, rng) * 0.45
    edge = edge + (noise - 0.5) * 0.38
    base = np.clip((edge - rad) / 0.06, 0.0, 1.0)

    img = Image.fromarray(np.clip(base * 255, 0, 255).astype(np.uint8), mode="L")
    draw = ImageDraw.Draw(img)
    # Tapered organic paint streaks (wide base pinching to razor tips, like 06_modal)
    for _ in range(26):
        a = rng.uniform(0, 2 * math.pi)
        r0 = rng.uniform(size * 0.10, size * 0.22)
        r1 = rng.uniform(size * 0.24, size * 0.44)
        base_w = rng.uniform(4.5, 11.0)
        px_dir, py_dir = math.cos(a), math.sin(a)
        nx_dir, ny_dir = -py_dir, px_dir
        p0 = (cx + px_dir * r0 + nx_dir * base_w, cy + py_dir * r0 + ny_dir * base_w)
        p1 = (cx + px_dir * r0 - nx_dir * base_w, cy + py_dir * r0 - ny_dir * base_w)
        p_tip = (cx + px_dir * r1, cy + py_dir * r1)
        draw.polygon([p0, p_tip, p1], fill=int(rng.uniform(215, 255)))
    # Scattered organic ink droplets (variable aspect, zero uniform lollipops)
    for _ in range(52):
        a = rng.uniform(0, 2 * math.pi)
        dist = rng.uniform(size * 0.23, size * 0.47)
        px = cx + math.cos(a) * dist
        py = cy + math.sin(a) * dist
        rx = rng.uniform(1.0, 4.4)
        ry = rng.uniform(0.9, 3.2)
        draw.ellipse((px - rx, py - ry, px + rx, py + ry), fill=int(rng.uniform(165, 255)))

    arr = np.asarray(img, dtype=np.float32) / 255.0
    # Crisp gouache tooth inside the splash
    tooth = 0.84 + 0.24 * value_noise_2d(size, size, 5.0, 5.0, rng)
    return np.clip((arr * tooth - 0.06) / 0.90, 0.0, 1.0)


def make_drafting_arcs(size: int = 512) -> np.ndarray:
    """
    Architectural astrolabe drafting compass arcs, tangent diagonal ray,
    fine crosshair axes, and calibrated ticks (01_title, 02_settings, 04_codex,
    06_modal, 13_status). Rendered at 2x supersampling for razor-clean antialiasing.
    """
    ss = size * 2
    img = Image.new("L", (ss, ss), 0)
    draw = ImageDraw.Draw(img)

    # Off-center grand compass origin matching Metaphor's asymmetric editorial framing
    cx, cy = int(ss * 0.72), int(ss * 0.36)

    # Concentric drafting circles (varying razor weights)
    for r, w, op in [
        (int(ss * 0.48), 3, 210),
        (int(ss * 0.34), 2, 165),
        (int(ss * 0.21), 2, 140),
        (int(ss * 0.085), 3, 225),
    ]:
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=op, width=w)

    # Secondary overlapping compass arc bottom-left
    cx2, cy2 = int(ss * 0.22), int(ss * 0.78)
    for r, w, op in [(int(ss * 0.38), 2, 145), (int(ss * 0.16), 2, 125)]:
        draw.ellipse((cx2 - r, cy2 - r, cx2 + r, cy2 + r), outline=op, width=w)

    # Crisp drafting horizontal & vertical axes through primary origin
    draw.line((0, cy, ss, cy), fill=145, width=2)
    draw.line((cx, 0, cx, ss), fill=145, width=2)

    # Signature diagonal tangent ray (~58° like 06_modal & 01_title)
    draw.line((int(ss * 0.18), ss, int(ss * 0.86), 0), fill=200, width=3)
    draw.line((0, int(ss * 0.64), ss, int(ss * 0.18)), fill=115, width=2)

    # Fine calibrated astrolabe degree ticks along the 0.34r ring
    r_tick = ss * 0.34
    for deg in range(0, 360, 15):
        a = math.radians(deg)
        tlen = 16 if deg % 45 == 0 else 8
        x0 = cx + math.cos(a) * (r_tick - tlen)
        y0 = cy + math.sin(a) * (r_tick - tlen)
        x1 = cx + math.cos(a) * (r_tick + tlen)
        y1 = cy + math.sin(a) * (r_tick + tlen)
        draw.line((x0, y0, x1, y1), fill=185 if deg % 45 == 0 else 120, width=2)

    # Hollow rotated drafting diamond at primary compass center
    d = 18
    draw.polygon([(cx, cy - d), (cx + d, cy), (cx, cy + d), (cx - d, cy)], outline=235, width=3)

    img = img.resize((size, size), Image.Resampling.LANCZOS)
    return np.asarray(img, dtype=np.float32) / 255.0


def make_canvas_wash(size: int = 512) -> np.ndarray:
    """
    Calm painterly gouache impasto & diagonal brush-sweep texture (02_settings,
    10_equipment, 11_memorandum). Rotated multi-angle brush fields avoid axis-aligned
    plaid artifacts so dark verdigris panels feel genuinely hand-painted.
    """
    rng = np.random.default_rng(SEED + 404)
    pad = int(size * 1.5)
    def rot_layer(sy: float, sx: float, deg: float) -> np.ndarray:
        n = value_noise_2d(pad, pad, sy, sx, rng)
        im = Image.fromarray(np.clip(n * 255, 0, 255).astype(np.uint8), mode="L")
        im = im.rotate(deg, resample=Image.Resampling.BILINEAR)
        c0 = (pad - size) // 2
        return np.asarray(im.crop((c0, c0, c0 + size, c0 + size)), dtype=np.float32) / 255.0

    broad = rot_layer(140.0, 110.0, 19.0)
    sweep_a = rot_layer(22.0, 145.0, -32.0)
    sweep_b = rot_layer(28.0, 120.0, 48.0)
    fine_tooth = rot_layer(7.0, 24.0, -18.0)
    grain = value_noise_2d(size, size, 3.0, 3.0, rng)

    wash = 0.36 * broad + 0.26 * sweep_a + 0.18 * sweep_b + 0.12 * fine_tooth + 0.08 * grain
    wash = np.clip((wash - 0.24) / 0.54, 0.0, 1.0)
    return wash


def make_paper_torn(w: int = 256, h: int = 32) -> np.ndarray:
    """
    Hand-torn jagged bottom parchment strip (03_inventory Fermis Ointment,
    10_equipment Venomward Charm, 02_settings helper strip).
    Opaque across the top, tearing irregularly to transparent along the bottom edge.
    """
    rng = np.random.default_rng(SEED + 505)
    y = np.linspace(0.0, 1.0, h)[:, None]
    tear_y = (
        0.58
        + 0.18 * (value_noise_1d(w, 28.0, rng) - 0.5)
        + 0.16 * (value_noise_1d(w, 9.0, rng) - 0.5)
        + 0.10 * (value_noise_1d(w, 3.5, rng) - 0.5)
    )
    # Add occasional sharp triangular paper-fiber notch
    for _ in range(7):
        pos = int(rng.uniform(w * 0.08, w * 0.92))
        span = int(rng.uniform(6, 18))
        depth = rng.uniform(0.10, 0.26)
        idx = np.arange(max(0, pos - span), min(w, pos + span))
        tear_y[idx] -= depth * (1.0 - np.abs(idx - pos) / max(1, span))
    alpha = np.clip((tear_y[None, :] - y) / 0.06, 0.0, 1.0)
    return alpha


def make_banner_dissolve(w: int = 512, h: int = 128) -> np.ndarray:
    """
    Hero banner bottom opacity mask: fully opaque across top 55%, dissolving cleanly
    downward with subtle horizontal dry-brush feathering so banner art flows organically
    into Arcfolio's deep verdigris-petrol page canvas.
    """
    rng = np.random.default_rng(SEED + 606)
    y = np.linspace(0.0, 1.0, h)[:, None]
    bristle = (
        0.55 * value_noise_2d(h, w, 6.0, 96.0, rng)
        + 0.30 * value_noise_2d(h, w, 2.5, 36.0, rng)
        + 0.15 * value_noise_1d(w, 40.0, rng)[None, :]
    )
    fade_start = 0.42 + 0.10 * (bristle - 0.5)
    fade_end = 0.94 + 0.06 * (bristle - 0.5)
    alpha = np.clip((fade_end - y) / np.maximum(fade_end - fade_start, 0.12), 0.0, 1.0)
    # Smooth cubic rolloff at bottom edge so bottom row is strictly 0.0
    alpha = alpha * alpha * (3.0 - 2.0 * alpha)
    alpha[-2:, :] = 0.0
    return alpha


def build_contact_sheet(fx_dir: Path, out_path: Path) -> None:
    """Render a dark verdigris contact sheet showing each white mask tinted in real theme colors."""
    entries = [
        ("brush-cta.png", (201, 36, 70), "Play CTA Carmine Brush"),
        ("brush-bar.png", (17, 126, 134), "Selection Cyan-Teal Brush"),
        ("spine-line-v.png", (226, 230, 226), "Chalk Vertical Spine"),
        ("hairline-h.png", (226, 230, 226), "Chalk Horizontal Hairline"),
        ("ink-splash.png", (34, 181, 189), "Modal Ink Splash"),
        ("drafting-arcs.png", (240, 237, 230), "Astrolabe Drafting Arcs"),
        ("canvas-wash.png", (42, 112, 116), "Painterly Canvas Wash"),
        ("paper-torn.png", (244, 241, 234), "Torn Paper Edge"),
        ("banner-dissolve.png", (214, 166, 24), "Banner Dry-Brush Dissolve"),
    ]
    cols = 3
    rows = 3
    cw, ch = 360, 190
    sheet = Image.new("RGB", (cols * cw + 40, rows * ch + 60), (16, 34, 36))
    draw = ImageDraw.Draw(sheet)
    draw.text((20, 14), "ARCFOLIO PROCEDURAL FX CONTACT SHEET (seed=1970)", fill=(240, 237, 230))

    for idx, (fname, color, label) in enumerate(entries):
        r, c = divmod(idx, cols)
        x0 = 20 + c * cw
        y0 = 48 + r * ch
        draw.rectangle((x0, y0, x0 + cw - 16, y0 + ch - 16), fill=(11, 22, 24), outline=(44, 80, 84))
        draw.text((x0 + 10, y0 + 8), f"{fname} — {label}", fill=(163, 188, 190))

        im = Image.open(fx_dir / fname).convert("RGBA")
        # Tint white mask with target RGB
        arr = np.asarray(im, dtype=np.uint8).copy()
        arr[:, :, 0] = color[0]
        arr[:, :, 1] = color[1]
        arr[:, :, 2] = color[2]
        tinted = Image.fromarray(arr, mode="RGBA")
        box_w, box_h = cw - 36, ch - 52
        tinted.thumbnail((box_w, box_h), Image.Resampling.LANCZOS)
        # If very narrow (vertical spine), tile/enlarge slightly for visual legibility
        if fname == "spine-line-v.png":
            tinted = tinted.resize((max(14, tinted.width), box_h), Image.Resampling.LANCZOS)
        px = x0 + 10 + (box_w - tinted.width) // 2
        py = y0 + 30 + (box_h - tinted.height) // 2
        sheet.paste(tinted, (px, py), tinted)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", type=Path, default=None, help="Optional contact sheet output path (scratch)")
    args = parser.parse_args()

    theme_root = Path(__file__).resolve().parent.parent
    fx_dir = theme_root / "src" / "Images" / "fx"
    fx_dir.mkdir(parents=True, exist_ok=True)

    save_white_mask(make_gouache_brush(512, 96, seed_offset=11, bold=True), fx_dir / "brush-cta.png")
    save_white_mask(make_gouache_brush(512, 64, seed_offset=29, bold=False), fx_dir / "brush-bar.png")
    save_white_mask(make_spine_line_v(16, 512), fx_dir / "spine-line-v.png")
    save_white_mask(make_hairline_h(512, 12), fx_dir / "hairline-h.png")
    save_white_mask(make_ink_splash(256), fx_dir / "ink-splash.png")
    save_white_mask(make_drafting_arcs(512), fx_dir / "drafting-arcs.png")
    save_white_mask(make_canvas_wash(512), fx_dir / "canvas-wash.png")
    save_white_mask(make_paper_torn(256, 32), fx_dir / "paper-torn.png")
    save_white_mask(make_banner_dissolve(512, 128), fx_dir / "banner-dissolve.png")

    print(f"Generated 9 Arcfolio FX masks in {fx_dir}")
    if args.sheet:
        build_contact_sheet(fx_dir, args.sheet)
        print(f"Wrote contact sheet to {args.sheet}")


if __name__ == "__main__":
    main()
