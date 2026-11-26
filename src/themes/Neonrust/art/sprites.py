#!/usr/bin/env python3
"""Deterministic white-mask FX & surface texture sprites for Neonrust (RAGE 2-inspired).

Outputs pure-white (255, 255, 255) RGBA alpha masks to src/Images/fx/ so XAML
(OpacityMask) and HTML previews (-webkit-mask-image) share the exact same craft
and ThemeModifier recolors every layer live.
"""
import argparse
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 2042026
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "Images", "fx")


def save_mask(alpha: np.ndarray, name: str) -> Image.Image:
    os.makedirs(OUT_DIR, exist_ok=True)
    a = np.clip(alpha, 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    img = Image.fromarray(rgba, mode="RGBA")
    img.save(os.path.join(OUT_DIR, name), optimize=True)
    return img


def tileable_fbm(rng: np.random.Generator, size: int, octaves=(4, 8, 16, 32), weights=(0.45, 0.30, 0.16, 0.09)) -> np.ndarray:
    """Periodic (seamlessly tileable) multi-octave value noise in [0, 1]."""
    out = np.zeros((size, size), dtype=np.float32)
    ys = np.arange(size, dtype=np.float32) / size
    xs = np.arange(size, dtype=np.float32) / size
    for grid, w in zip(octaves, weights):
        base = rng.random((grid, grid)).astype(np.float32)
        gy = ys * grid
        gx = xs * grid
        y0 = np.floor(gy).astype(np.int32) % grid
        x0 = np.floor(gx).astype(np.int32) % grid
        y1 = (y0 + 1) % grid
        x1 = (x0 + 1) % grid
        fy = gy - np.floor(gy)
        fx = gx - np.floor(gx)
        # Smoothstep
        sy = fy * fy * (3.0 - 2.0 * fy)
        sx = fx * fx * (3.0 - 2.0 * fx)
        v00 = base[np.ix_(y0, x0)]
        v01 = base[np.ix_(y0, x1)]
        v10 = base[np.ix_(y1, x0)]
        v11 = base[np.ix_(y1, x1)]
        top = v00 * (1.0 - sx[None, :]) + v01 * sx[None, :]
        bot = v10 * (1.0 - sx[None, :]) + v11 * sx[None, :]
        out += (top * (1.0 - sy[:, None]) + bot * sy[:, None]) * w
    out -= out.min()
    mx = out.max()
    if mx > 1e-6:
        out /= mx
    return out


def rect_fbm(rng: np.random.Generator, h: int, w: int, scales=(6, 14, 32)) -> np.ndarray:
    """Smooth multi-octave noise for arbitrary rectangular sprites in [0, 1]."""
    acc = np.zeros((h, w), dtype=np.float32)
    weights = [0.52, 0.31, 0.17][:len(scales)]
    for sc, wt in zip(scales, weights):
        gh = max(2, int(round(h / sc)))
        gw = max(2, int(round(w / sc)))
        lo = Image.fromarray((rng.random((gh, gw)) * 255).astype(np.uint8), mode="L")
        up = lo.resize((w, h), Image.Resampling.BICUBIC)
        acc += (np.array(up, dtype=np.float32) / 255.0) * wt
    acc -= acc.min()
    mx = acc.max()
    if mx > 1e-6:
        acc /= mx
    return acc


def make_datapad_mesh(rng: np.random.Generator, size=256) -> Image.Image:
    """Seamless RAGE 2 perforated metal-net / expanded-mesh texture with mottled wear & micro-scuffs."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)

    # Staggered diamond/hex perforated metal-net lattice (pitch 8px, authentic dark holes + rough metal web)
    pitch = 8.0
    row_idx = np.floor(y / (pitch * 0.5))
    x_shift = (row_idx % 2) * (pitch * 0.5)
    lx = ((x + x_shift) % pitch) - pitch * 0.5
    ly = (y % (pitch * 0.5)) - pitch * 0.25

    # Elliptical/diamond perforation holes inside metallic webbing
    hole_dist = np.sqrt((lx / 2.25) ** 2 + (ly / 1.45) ** 2)
    # Metal wire net ridge is bright between holes, recessed dark inside holes
    net_web = np.clip((hole_dist - 0.62) / 0.48, 0.0, 1.0)
    # Slight directional sheen on upper-left rim of each perforation (industrial stamped metal feel)
    bevel = np.clip(((lx + ly) / 4.2) * 0.32, -0.18, 0.22) * net_web
    mesh = np.clip(0.16 + 0.68 * net_web + bevel, 0.0, 1.0)

    # Organic worn stains & oxidized grime patches modulating the metal net
    stains = tileable_fbm(rng, size, octaves=(4, 8, 16, 32), weights=(0.48, 0.28, 0.16, 0.08))
    blotch = np.clip((stains - 0.34) * 1.9, 0.0, 1.0)
    # Subtle fine metallic pitting / noise
    grit = rng.normal(0.0, 0.075, size=(size, size)).astype(np.float32)

    combined = mesh * (0.48 + 0.52 * blotch) + blotch * 0.26 + grit

    # Seamless wrapped fine scratches across the metal net
    scratch = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(scratch)
    for _ in range(34):
        x0 = int(rng.integers(0, size))
        y0 = int(rng.integers(0, size))
        length = int(rng.integers(14, 58))
        ang = rng.uniform(-0.45, 0.45)
        x1 = int(x0 + length * np.cos(ang))
        y1 = int(y0 + length * np.sin(ang))
        val = int(rng.integers(55, 130))
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                d.line([(x0 + ox, y0 + oy), (x1 + ox, y1 + oy)], fill=val, width=1)
    sc_arr = np.array(scratch, dtype=np.float32) / 255.0

    alpha = np.clip((combined * 0.88 + sc_arr * 0.38) * 255.0, 0, 255)
    return save_mask(alpha, "datapad-mesh.png")


def make_bg_stains(rng: np.random.Generator, size=512) -> Image.Image:
    """Large-scale mottled grunge stains, worn paint clouds, and oxidation rings for datapad canvases."""
    cloud = tileable_fbm(rng, size, octaves=(3, 6, 12, 24, 48), weights=(0.40, 0.26, 0.16, 0.11, 0.07))
    # Ring/water-stain edges where noise crosses mid bands
    stain_body = np.clip((cloud - 0.36) * 2.1, 0.0, 1.0)
    stain_rim = np.exp(-((cloud - 0.56) / 0.055) ** 2) * 0.55

    # Splatter & dusty mottling
    specks = (rng.random((size, size)) > 0.965).astype(np.float32) * rng.uniform(0.2, 0.65, (size, size))
    fine = rng.normal(0.0, 0.06, (size, size)).astype(np.float32)

    # Diagonal weathered wipe marks
    wipe = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(wipe)
    for _ in range(42):
        x0 = int(rng.integers(0, size))
        y0 = int(rng.integers(0, size))
        dx = int(rng.integers(36, 140))
        dy = int(rng.integers(-45, 45))
        val = int(rng.integers(35, 95))
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                d.line([(x0 + ox, y0 + oy), (x0 + dx + ox, y0 + dy + oy)], fill=val, width=1)
    wipe_img = wipe.filter(ImageFilter.GaussianBlur(radius=0.8))
    w_arr = np.array(wipe_img, dtype=np.float32) / 255.0

    val = np.clip(stain_body * 0.72 + stain_rim * 0.42 + w_arr * 0.34 + specks * 0.4 + fine, 0.0, 1.0)
    img = Image.fromarray((val * 255).astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(radius=0.6))
    return save_mask(np.array(img, dtype=np.float32), "bg-stains.png")


def make_brush_bar(rng: np.random.Generator, w=512, h=72) -> Image.Image:
    """High-detail RAGE 2 horizontal dry-brush CTA bar (dense core + ragged bristle tails + paint flecks)."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = x / (w - 1)
    yn = (y - (h - 1) * 0.5) / (h * 0.5)

    # Multi-frequency row-coherent bristle tracks
    row_hi = rng.normal(0.0, 1.0, size=(h, 1)).astype(np.float32)
    row_lo = np.convolve(row_hi[:, 0], np.ones(5) / 5.0, mode="same")[:, None]
    bristle_track = 0.6 * row_hi + 0.4 * row_lo

    # Rough organic top & bottom paint deckle (keeps inner 76% dense for crisp text)
    col_wave = np.sin(xn * 19.0) * 0.032 + np.cos(xn * 53.0) * 0.024 + np.sin(xn * 107.0) * 0.012
    edge_j = np.convolve(rng.normal(0.0, 0.055, size=w), np.ones(5) / 5.0, mode="same")[None, :]
    y_limit = 0.85 + col_wave + edge_j

    # Left & right irregular bristle streak endings (right side longer tail)
    left_cut = 0.032 + 0.042 * np.abs(bristle_track) + 0.018 * np.sin(y * 0.85)
    right_cut = 0.905 - 0.085 * np.clip(bristle_track + 0.45, 0.0, 1.5) + 0.024 * np.cos(y * 1.1)

    mask = np.ones((h, w), dtype=np.float32)
    mask *= np.clip((y_limit - np.abs(yn)) / 0.12, 0.0, 1.0)
    mask *= np.clip((xn - left_cut) / 0.024, 0.0, 1.0)
    mask *= np.clip((right_cut - xn) / 0.052, 0.0, 1.0)

    # Interior subtle paint roller/brush grain + frayed outer bristle scratches
    fbm = rect_fbm(rng, h, w, scales=(8, 18, 40))
    near_edge = (np.abs(yn) > 0.66) | (xn < 0.085) | (xn > 0.83)
    bristle = np.clip(0.50 + 0.45 * bristle_track + 0.30 * (fbm - 0.5), 0.0, 1.0)
    interior = np.clip(0.95 + 0.08 * (fbm - 0.5), 0.90, 1.0)
    mask = np.where(near_edge, mask * (0.35 + 0.65 * bristle), mask * interior)

    # Dry-brush fine hairline notches cutting into top/bottom edges
    notch = (np.abs(yn) > 0.72) & (fbm < 0.34)
    mask = np.where(notch, mask * 0.42, mask)

    # Aerosol paint flecks beyond left & right tails
    flecks_r = (rng.random((h, w)) > 0.988) & (xn > 0.85) & (np.abs(yn) < 0.90)
    flecks_l = (rng.random((h, w)) > 0.993) & (xn < 0.08) & (np.abs(yn) < 0.86)
    mask = np.maximum(mask, (flecks_r | flecks_l).astype(np.float32) * rng.uniform(0.45, 0.88, (h, w)))

    img = Image.fromarray(np.clip(mask * 255, 0, 255).astype(np.uint8), mode="L")
    img = img.filter(ImageFilter.GaussianBlur(radius=0.3))
    return save_mask(np.array(img, dtype=np.float32), "brush-bar.png")


def make_spray_halo(rng: np.random.Generator, w=360, h=120) -> Image.Image:
    """Rich multi-layered aerosol spray-paint bloom with smoky drift & overspray mist."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = (x - w * 0.5) / (w * 0.47)
    yn = (y - h * 0.5) / (h * 0.47)
    r2 = xn * xn + yn * yn
    cloud = rect_fbm(rng, h, w, scales=(12, 28, 56))
    core = np.exp(-r2 * (2.15 - 0.42 * (cloud - 0.5)))

    # Fine + coarse aerosol overspray droplets around the outer halo
    sp1 = rng.random((h, w)).astype(np.float32)
    sp2 = rng.random((h, w)).astype(np.float32)
    ring = np.clip(1.15 - r2, 0.0, 1.0)
    mist = np.where((r2 > 0.18) & (r2 < 1.2) & (sp1 > 0.78), ring * 0.62, 0.0)
    dots = np.where((r2 > 0.28) & (r2 < 1.25) & (sp2 > 0.94), ring * 0.85, 0.0)

    alpha = np.clip((core * (0.86 + 0.24 * cloud) + mist * 0.36 + dots * 0.42) * 255.0, 0, 255)
    img = Image.fromarray(alpha.astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(radius=0.9))
    return save_mask(np.array(img, dtype=np.float32), "spray-halo.png")


def make_yellow_spray(rng: np.random.Generator, w=384, h=88) -> Image.Image:
    """RAGE 2 selected-button yellow spray-paint aura radiating behind chamfered selection slabs."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = (x - w * 0.5) / (w * 0.46)
    yn = (y - h * 0.5) / (h * 0.44)

    # Rounded-bar distance field so spray hugs the whole horizontal button width, not just the middle dot
    dx = np.maximum(np.abs(xn) - 0.58, 0.0) / 0.42
    dy = np.maximum(np.abs(yn) - 0.32, 0.0) / 0.68
    d2 = dx * dx + dy * dy

    cloud = rect_fbm(rng, h, w, scales=(7, 16, 36))
    # Uneven spray-can pass (stronger along left/bottom-left & center-right like hand-sprayed stencil)
    spray_body = np.exp(-d2 * (2.25 - 0.65 * (cloud - 0.5)))

    # Crisp aerosol overspray grain around the button perimeter
    sp_fine = rng.random((h, w)).astype(np.float32)
    sp_coarse = rng.random((h, w)).astype(np.float32)
    band = np.exp(-((np.sqrt(d2) - 0.55) / 0.42) ** 2)
    overspray = np.where(sp_fine > 0.72, band * 0.58, 0.0) + np.where(sp_coarse > 0.935, band * 0.92, 0.0)

    # Soft Gaussian-smoothed horizontal airbrush pass (never stripey)
    row_streak = np.convolve(rng.normal(0.0, 0.045, size=h), np.ones(9) / 9.0, mode="same")[:, None]
    val = np.clip(spray_body * (0.86 + 0.24 * cloud + row_streak) + overspray * 0.56, 0.0, 1.0)
    # Feather very outer 6px so WPF never shows a rectangular clipping edge
    edge_fade = (
        np.clip(x / 10.0, 0.0, 1.0)
        * np.clip((w - 1 - x) / 10.0, 0.0, 1.0)
        * np.clip(y / 8.0, 0.0, 1.0)
        * np.clip((h - 1 - y) / 8.0, 0.0, 1.0)
    )
    img = Image.fromarray(np.clip(val * edge_fade * 255.0, 0, 255).astype(np.uint8), mode="L")
    img = img.filter(ImageFilter.GaussianBlur(radius=1.15))
    return save_mask(np.array(img, dtype=np.float32), "yellow-spray.png")


def make_yellow_slab(rng: np.random.Generator, w=384, h=52) -> Image.Image:
    """Chamfered selected-button fill with subtle stencil-paint edge texture (never sterile flat vector)."""
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    c = 11  # chamfer size matching RAGE 2 left/right cut corners
    # Left top chamfer + right top/bottom angled chamfer matching CROSS/MISSIONS
    poly = [(c, 2), (w - 3, 2), (w - 3, h - 1 - c), (w - 1 - c, h - 3), (2, h - 3), (2, c)]
    d.polygon(poly, fill=255)

    arr = np.array(img, dtype=np.float32) / 255.0
    # Slight rough edge jitter & subtle painted density variation inside the yellow fill
    fbm = rect_fbm(rng, h, w, scales=(5, 13, 28))
    # Soft boundary erosion so edges feel spray-stenciled rather than laser-cut
    blur = np.array(img.filter(ImageFilter.GaussianBlur(radius=1.1)), dtype=np.float32) / 255.0
    is_edge = (blur > 0.05) & (blur < 0.96)
    grit = rng.normal(0.0, 0.12, (h, w)).astype(np.float32)
    painted = np.where(
        is_edge,
        np.clip(blur * (0.78 + 0.42 * fbm + grit), 0.0, 1.0),
        arr * np.clip(0.94 + 0.09 * fbm, 0.90, 1.0),
    )
    return save_mask(painted * 255.0, "yellow-slab.png")


def make_rough_border_row(rng: np.random.Generator, w=384, h=52) -> Image.Image:
    """RAGE 2 distressed/rough-etched chamfered button & list-row outline (like MISSIONS / KVASIR / LILY)."""
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    c = 11
    pts = [
        (c, 2),
        (w - 3, 2),
        (w - 3, h - 1 - c),
        (w - 1 - c, h - 3),
        (2, h - 3),
        (2, c),
        (c, 2),
    ]

    # Draw primary hand-scratched / jittered segments along the chamfered perimeter
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        dist = float(np.hypot(x1 - x0, y1 - y0))
        steps = max(6, int(dist / 3.5))
        prev = (x0, y0)
        for i in range(1, steps + 1):
            t = i / steps
            px = x0 + (x1 - x0) * t
            py = y0 + (y1 - y0) * t
            if i < steps:
                px += rng.uniform(-0.75, 0.75)
                py += rng.uniform(-0.75, 0.75)
            # Occasional slight chalky wear variation along stroke
            brightness = int(rng.integers(145, 255))
            if rng.random() < 0.08:
                brightness = int(rng.integers(55, 110))
            d.line([prev, (px, py)], fill=brightness, width=2)
            prev = (px, py)

    # Secondary faint distressed double-scratch / dust halo hugging the outer/inner rim
    scratch = Image.new("L", (w, h), 0)
    ds = ImageDraw.Draw(scratch)
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        dist = float(np.hypot(x1 - x0, y1 - y0))
        steps = max(4, int(dist / 7.0))
        for i in range(steps):
            if rng.random() > 0.48:
                continue
            t0 = i / steps
            t1 = min(1.0, (i + rng.uniform(0.35, 0.9)) / steps)
            ox = rng.uniform(-1.6, 1.6)
            oy = rng.uniform(-1.6, 1.6)
            ds.line(
                [(x0 + (x1 - x0) * t0 + ox, y0 + (y1 - y0) * t0 + oy),
                 (x0 + (x1 - x0) * t1 + ox, y0 + (y1 - y0) * t1 + oy)],
                fill=int(rng.integers(55, 130)),
                width=1,
            )

    base_arr = np.array(img, dtype=np.float32)
    sc_arr = np.array(scratch, dtype=np.float32)
    # Break up stroke with fine dry-ink grit so it reads unmistakably hand-weathered
    fbm = rect_fbm(rng, h, w, scales=(4, 10, 22))
    pitting = np.where(rng.random((h, w)) > 0.86, 0.35, 1.0)
    combined = np.clip(base_arr * (0.58 + 0.52 * fbm) * pitting + sc_arr * 0.58, 0, 255)
    out = Image.fromarray(combined.astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(radius=0.25))
    return save_mask(np.array(out, dtype=np.float32), "rough-border-row.png")


def make_rough_edge(rng: np.random.Generator, horizontal: bool = True, length: int = 512, thick: int = 8) -> Image.Image:
    """Weathered, scratched etched hairline strip for panel borders & dividers (zero aspect distortion)."""
    w, h = (length, thick) if horizontal else (thick, length)
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    mid = thick * 0.5

    steps = length // 4
    prev = (0.0, mid) if horizontal else (mid, 0.0)
    for i in range(1, steps + 1):
        p = (i / steps) * (length - 1)
        jitter = rng.uniform(-0.85, 0.85)
        cur = (p, mid + jitter) if horizontal else (mid + jitter, p)
        val = int(rng.integers(140, 255))
        if rng.random() < 0.09:
            val = int(rng.integers(45, 105))
        d.line([prev, cur], fill=val, width=2)
        prev = cur

    # Faint parallel scratch wisps & chalk dust along the line
    for _ in range(36):
        p0 = float(rng.integers(0, length - 12))
        p1 = p0 + float(rng.integers(8, 34))
        off = mid + rng.uniform(-2.3, 2.3)
        val = int(rng.integers(45, 120))
        if horizontal:
            d.line([(p0, off), (p1, off + rng.uniform(-0.7, 0.7))], fill=val, width=1)
        else:
            d.line([(off, p0), (off + rng.uniform(-0.7, 0.7), p1)], fill=val, width=1)

    arr = np.array(img, dtype=np.float32)
    # Fine breaks along the etched stroke
    noise = rect_fbm(rng, h, w, scales=(3, 9, 24))
    grain = np.where(rng.random((h, w)) > 0.88, 0.42, 1.0)
    arr = np.clip(arr * (0.62 + 0.48 * noise) * grain, 0, 255)
    name = "rough-edge-h.png" if horizontal else "rough-edge-v.png"
    return save_mask(arr, name)


def make_tab_burn_core(rng: np.random.Generator, w=256, h=96) -> Image.Image:
    """RAGE 2 active top-tab ('LOG') incandescent inner bottom burn core that does NOT touch the borders."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    # Inset strongly from left, right, and top; concentrated inside the bottom-center
    xn = (x - w * 0.5) / (w * 0.34)
    yn = (y - h * 0.72) / (h * 0.38)
    d2 = (xn * xn) * (0.82 + 0.32 * np.clip(-yn, 0.0, 1.5)) + (yn * yn) * 1.05
    cloud = rect_fbm(rng, h, w, scales=(8, 18, 36))
    # Hot dense center core + soft surrounding glow
    core = np.clip(np.exp(-d2 * (1.55 - 0.30 * (cloud - 0.5))) * 1.25, 0.0, 1.0)

    # Keep clear margin from left/right/top/bottom edges so the burn NEVER touches the tab border
    inset_x = np.clip((x - w * 0.10) / (w * 0.13), 0.0, 1.0) * np.clip((w * 0.90 - x) / (w * 0.13), 0.0, 1.0)
    inset_top = np.clip((y - h * 0.12) / (h * 0.22), 0.0, 1.0)
    inset_bot = np.clip((h * 0.94 - y) / (h * 0.10), 0.0, 1.0)

    sp = rng.random((h, w)).astype(np.float32)
    mist = np.where((d2 > 0.35) & (d2 < 1.25) & (sp > 0.85), np.clip(1.25 - d2, 0, 1) * 0.40, 0.0)

    val = np.clip((core * (0.92 + 0.14 * cloud) + mist * 0.32) * inset_x * inset_top * inset_bot, 0.0, 1.0)
    img = Image.fromarray((val * 255).astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(radius=1.3))
    return save_mask(np.array(img, dtype=np.float32), "tab-burn-core.png")


def make_tab_burn_halo(rng: np.random.Generator, w=256, h=96) -> Image.Image:
    """Wider fiery magenta-pink burn bloom rising from the bottom of the active top tab."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = (x - w * 0.5) / (w * 0.46)
    yn = (y - h * 0.72) / (h * 0.58)
    d2 = xn * xn * 0.95 + yn * yn * 1.1
    cloud = rect_fbm(rng, h, w, scales=(10, 22, 44))
    halo = np.exp(-d2 * (1.75 - 0.40 * (cloud - 0.5)))

    # Soft outer fade so it never clips harshly at sprite bounds
    fade_x = np.clip(x / (w * 0.12), 0.0, 1.0) * np.clip((w - 1 - x) / (w * 0.12), 0.0, 1.0)
    fade_y = np.clip(y / (h * 0.14), 0.0, 1.0) * np.clip((h - 1 - y) / (h * 0.08), 0.0, 1.0)

    sp = rng.random((h, w)).astype(np.float32)
    mist = np.where((d2 > 0.25) & (d2 < 1.35) & (sp > 0.80), np.clip(1.35 - d2, 0, 1) * 0.42, 0.0)

    val = np.clip((halo * (0.85 + 0.22 * cloud) + mist * 0.32) * fade_x * fade_y, 0.0, 1.0)
    img = Image.fromarray((val * 255).astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(radius=1.4))
    return save_mask(np.array(img, dtype=np.float32), "tab-burn-halo.png")


def make_title_glow(rng: np.random.Generator, w=384, h=80) -> Image.Image:
    """RAGE 2 title & section-header background glow (WASTELAND CELEBRITY / LEVEL / CROSS).

    Anchored bright along the bottom underline on the left-center, feathering smoothly upward
    and rightward into smoky atmospheric neon mist.
    """
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = x / (w - 1)      # 0..1 left to right
    yn = y / (h - 1)      # 0..1 top to bottom

    # Strongest near bottom-left-to-center (yn -> 1.0, xn ~ 0.05..0.55), fading upward & rightward
    v_rise = np.power(np.clip(yn, 0.0, 1.0), 1.65)
    h_spread = np.exp(-((xn - 0.24) / 0.46) ** 2) * (0.55 + 0.45 * np.clip(1.0 - xn * 0.85, 0.0, 1.0))
    # Soft left-edge entry so glow doesn't start as a hard vertical cliff
    left_soft = np.clip(xn / 0.045, 0.0, 1.0)
    right_soft = np.clip((1.0 - xn) / 0.14, 0.0, 1.0)
    top_soft = np.clip(yn / 0.20, 0.0, 1.0)

    cloud = rect_fbm(rng, h, w, scales=(8, 20, 42))
    # Subtle horizontal smoky wisps + fine grain
    wisp = 0.82 + 0.30 * cloud + rng.normal(0.0, 0.03, (h, w)).astype(np.float32)
    val = np.clip(v_rise * h_spread * left_soft * right_soft * top_soft * wisp * 1.18, 0.0, 1.0)

    img = Image.fromarray((val * 255).astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(radius=1.1))
    return save_mask(np.array(img, dtype=np.float32), "title-glow.png")


def make_item_glow(rng: np.random.Generator, size=128) -> Image.Image:
    """Soft radial neon aura with subtle spray grain for game icons, badges, and covers."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    xn = (x - size * 0.5) / (size * 0.46)
    yn = (y - size * 0.5) / (size * 0.46)
    r2 = xn * xn + yn * yn
    cloud = rect_fbm(rng, size, size, scales=(8, 18, 36))
    core = np.exp(-r2 * (2.25 - 0.35 * (cloud - 0.5)))
    sp = rng.random((size, size)).astype(np.float32)
    mist = np.where((r2 > 0.25) & (r2 < 1.1) & (sp > 0.84), np.clip(1.1 - r2, 0, 1) * 0.38, 0.0)
    edge = np.clip(1.0 - np.maximum(np.abs(xn), np.abs(yn)) * 0.92, 0.0, 1.0) * 3.0
    edge = np.clip(edge, 0.0, 1.0)
    val = np.clip((core * (0.88 + 0.18 * cloud) + mist) * edge, 0.0, 1.0)
    img = Image.fromarray((val * 255).astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(radius=1.0))
    return save_mask(np.array(img, dtype=np.float32), "item-glow.png")


def make_grunge_header(rng: np.random.Generator, w=512, h=80) -> Image.Image:
    """Weathered brushed-concrete & scratched metal texture for TopPanel fascia & card headers."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = x / (w - 1)
    yn = y / (h - 1)

    # Multi-scale worn concrete/metal mottling
    cloud = rect_fbm(rng, h, w, scales=(5, 14, 34))
    # Horizontal brushed-metal streaks
    row_brush = np.convolve(rng.normal(0.0, 0.14, size=h), [0.2, 0.6, 0.2], mode="same")[:, None]
    base = 0.52 + 0.34 * cloud + row_brush + 0.10 * np.sin(xn * 11.0 + yn * 5.0)

    # Fine pitting and dark chips
    pitting = rng.random((h, w)).astype(np.float32)
    val = np.clip(base - (pitting > 0.91) * 0.26 + (pitting < 0.05) * 0.18, 0.0, 1.0)

    # Crisp diagonal & horizontal metal scratches
    scratch_img = Image.fromarray((val * 255).astype(np.uint8), mode="L")
    d = ImageDraw.Draw(scratch_img)
    for _ in range(38):
        sx = int(rng.integers(0, w))
        sy = int(rng.integers(0, h))
        dx = int(rng.integers(24, 110))
        dy = int(rng.integers(-24, 12))
        d.line([(sx, sy), (sx + dx, sy + dy)], fill=int(rng.integers(165, 248)), width=1)
    return save_mask(np.array(scratch_img, dtype=np.float32), "grunge-header.png")


def make_paint_glint(rng: np.random.Generator, w=256, h=96) -> Image.Image:
    """Angled dry-brush sheen streak for Play hover and Launching progress sweep."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    xn = x / (w - 1)
    yn = y / (h - 1)
    proj = xn - 0.30 * (1.0 - yn)
    band = np.exp(-((proj - 0.42) / 0.13) ** 2)
    cloud = rect_fbm(rng, h, w, scales=(6, 16, 32))
    streak = 0.68 + 0.32 * np.sin(y * 1.85 + 0.8) + 0.22 * (cloud - 0.5)
    alpha = np.clip(band * streak * 255.0, 0, 255)
    return save_mask(alpha, "paint-glint.png")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", default="", help="Optional contact sheet output path (use scratch).")
    args = parser.parse_args()
    rng = np.random.default_rng(SEED)

    sprites = [
        ("datapad-mesh.png", make_datapad_mesh(rng), (76, 199, 173)),
        ("bg-stains.png", make_bg_stains(rng), (60, 166, 145)),
        ("grunge-header.png", make_grunge_header(rng), (185, 65, 130)),
        ("rough-border-row.png", make_rough_border_row(rng), (76, 199, 173)),
        ("rough-edge-h.png", make_rough_edge(rng, horizontal=True), (76, 199, 173)),
        ("rough-edge-v.png", make_rough_edge(rng, horizontal=False), (76, 199, 173)),
        ("yellow-spray.png", make_yellow_spray(rng), (255, 214, 0)),
        ("yellow-slab.png", make_yellow_slab(rng), (255, 214, 0)),
        ("tab-burn-core.png", make_tab_burn_core(rng), (255, 224, 30)),
        ("tab-burn-halo.png", make_tab_burn_halo(rng), (255, 0, 174)),
        ("title-glow.png", make_title_glow(rng), (235, 32, 128)),
        ("item-glow.png", make_item_glow(rng), (255, 0, 174)),
        ("brush-bar.png", make_brush_bar(rng), (255, 0, 174)),
        ("spray-halo.png", make_spray_halo(rng), (255, 0, 174)),
        ("paint-glint.png", make_paint_glint(rng), (255, 214, 0)),
    ]
    print(f"Generated {len(sprites)} white-mask sprites in {OUT_DIR}")

    if args.sheet:
        os.makedirs(os.path.dirname(args.sheet), exist_ok=True)
        cols = 3
        cell_w, cell_h = 360, 118
        rows = (len(sprites) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * cell_w + 24, rows * cell_h + 24), (11, 19, 19))
        draw = ImageDraw.Draw(sheet)
        for idx, (name, im, col) in enumerate(sprites):
            r, c = divmod(idx, cols)
            x0 = 12 + c * cell_w
            y0 = 12 + r * cell_h
            draw.rectangle([x0 + 2, y0 + 2, x0 + cell_w - 6, y0 + cell_h - 6], outline=(38, 78, 72))
            tinted = Image.new("RGBA", im.size, col + (255,))
            tinted.putalpha(im.getchannel("A"))
            max_w, max_h = cell_w - 24, cell_h - 32
            scale = min(max_w / im.width, max_h / im.height)
            pw = max(6, int(round(im.width * scale)))
            ph = max(6, int(round(im.height * scale)))
            preview = tinted.resize((pw, ph), Image.Resampling.LANCZOS)
            px = x0 + (cell_w - pw) // 2
            py = y0 + 22 + (max_h - ph) // 2
            sheet.paste(preview, (px, py), preview)
            draw.text((x0 + 10, y0 + 6), f"{name} ({im.width}x{im.height})", fill=(215, 232, 228))
        sheet.save(args.sheet)
        print(f"Saved contact sheet: {args.sheet}")


if __name__ == "__main__":
    main()
