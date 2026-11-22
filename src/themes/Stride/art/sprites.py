"""
Stride — Deterministic white-mask FX sprite generator (Pillow + NumPy, fixed seed).
Outputs pure white (255, 255, 255) RGBA alpha-mask PNGs into src/Images/fx/ so WPF OpacityMask
and CSS -webkit-mask tint them dynamically with theme brushes.

Sprites (Mirror's Edge 2008 id=815 + Catalyst architectural glass surfaces):
- glass-inset.png     (96x96, 9-slice 28px border): velvety 4-edge inner shadow for tempered ice-blue glass panels
- glass-sheen.png     (256x128): broad -26 deg architectural window refraction beam + crisp specular catchlight
- city-skyline.png    (640x160): sunlit Mirror's Edge geometric white/blue rooftop skyline silhouette
- micro-grid.png      (48x48): subtle architectural glass curtain-wall wireframe tile
- momentum-stripes.png(32x32): seamless -22 deg diagonal velocity stripes for progress & running sweeps
"""
import argparse
import pathlib
import numpy as np
from PIL import Image


def save_mask(alpha: np.ndarray, out_path: pathlib.Path) -> None:
    a = np.clip(np.round(alpha * 255.0), 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    Image.fromarray(rgba, mode="RGBA").save(out_path)


def make_glass_inset(size: int = 96, border: int = 28) -> np.ndarray:
    """
    9-slice 4-edge velvety architectural glass inner shadow.
    Strongest along bottom & side edges (like Mirror's Edge 2008 UNLOCKABLES / OPTIONS VIDEO boxes),
    with a softer inset along top so panels feel like recessed backlit tempered glass.
    """
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    b = float(border)

    # Smooth cubic falloff from each edge inward across `border` pixels
    dl = np.clip(1.0 - xx / b, 0.0, 1.0) ** 2.1
    dr = np.clip(1.0 - (size - 1 - xx) / b, 0.0, 1.0) ** 2.1
    dt = np.clip(1.0 - yy / (b * 0.72), 0.0, 1.0) ** 2.2
    db = np.clip(1.0 - (size - 1 - yy) / (b * 1.05), 0.0, 1.0) ** 1.9

    # Weight bottom and sides richer than top (top also carries a crisp white catchlight in XAML/CSS)
    edge = np.maximum.reduce([dl * 0.78, dr * 0.78, dt * 0.48, db * 0.96])
    # Subtle corner darkening where two glass edges meet
    corners = np.clip((dl + dr) * (dt + db) * 0.45, 0.0, 0.45)
    return np.clip(edge + corners, 0.0, 1.0)


def make_glass_sheen(w: int = 256, h: int = 128) -> np.ndarray:
    """Broad -26 deg architectural window refraction beam + razor-sharp secondary specular highlight."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    shear = np.tan(np.deg2rad(26.0))
    u = (xx + (yy - h * 0.5) * shear) / float(w)

    # Broad translucent glass reflection band
    broad = np.exp(-((u - 0.36) / 0.16) ** 2) * 0.52
    # Crisp leading window specular edge
    razor1 = np.exp(-((u - 0.56) / 0.022) ** 2) * 0.92
    # Narrow secondary glass double-pane reflection
    razor2 = np.exp(-((u - 0.635) / 0.012) ** 2) * 0.58
    # Soft top-to-bottom glass reflection falloff (brighter near upper pane)
    v_grad = 0.65 + 0.35 * (1.0 - yy / float(h))
    # Gentle edge feather so it never clips harshly
    env = np.clip(xx / 12.0, 0.0, 1.0) * np.clip((w - 1 - xx) / 12.0, 0.0, 1.0)
    return np.clip(np.maximum.reduce([broad, razor1, razor2]) * v_grad * env, 0.0, 1.0)


def make_city_skyline(w: int = 640, h: int = 160) -> np.ndarray:
    """
    Sunlit Mirror's Edge geometric architectural skyline silhouette (inspired by the rising blue-white
    skyscrapers along the bottom of Mirror's Edge 2008 UNLOCKABLES, TIME TRIAL & OPTIONS screens).
    Pure procedural geometric towers with crisp vertical light/shadow facades and soft upward mist fade.
    """
    a = np.zeros((h, w), dtype=np.float32)
    # Deterministic geometric skyscrapers: (x0, width, top_y, alpha_level, slant_top, has_spire)
    towers = [
        (0, 44, 66, 0.85, -8, False),
        (36, 32, 88, 0.60, 0, False),
        (62, 54, 42, 0.95, 10, False),
        (108, 28, 78, 0.55, 0, False),
        (132, 48, 28, 0.90, -12, True),
        (172, 38, 64, 0.70, 4, False),
        (206, 62, 50, 0.80, -6, False),
        (262, 34, 92, 0.50, 0, False),
        (294, 46, 58, 0.72, 8, False),
        (336, 30, 104, 0.42, 0, False),
        (368, 52, 74, 0.65, -6, False),
        (416, 40, 46, 0.82, 10, False),
        (452, 58, 24, 0.95, -14, True),
        (504, 34, 70, 0.62, 0, False),
        (534, 48, 40, 0.88, 8, False),
        (578, 62, 56, 0.92, -10, False),
    ]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    for x0, tw, top_y, lvl, slant, spire in towers:
        x1 = min(w, x0 + tw)
        # Slanted architectural rooftop line
        frac = np.clip((xx - x0) / max(1.0, float(tw)), 0.0, 1.0)
        roof_y = top_y + slant * frac
        in_tower = (xx >= x0) & (xx < x1) & (yy >= roof_y)
        # Split each tower into sunlit left facet (brighter) & shaded right facet (deeper)
        shade = np.where(frac < 0.62, lvl, lvl * 0.58)
        # Subtle horizontal floor-slab window bands
        slabs = np.where(((yy - top_y) % 10.0) < 1.5, 0.75, 1.0)
        tower_alpha = np.where(in_tower, shade * slabs, 0.0)
        a = np.maximum(a, tower_alpha)
        if spire:
            sx = x0 + int(tw * 0.35)
            in_spire = (np.abs(xx - sx) <= 1.2) & (yy >= max(4, top_y - 22)) & (yy < roof_y)
            a = np.maximum(a, np.where(in_spire, lvl * 0.75, 0.0))

    # Diagonal perspective light ray slicing subtly upward
    ray_d = np.abs((xx - w * 0.32) + (yy - h * 0.7) * 0.42)
    ray = np.clip(1.0 - ray_d / 28.0, 0.0, 1.0) * 0.22 * (yy / float(h))
    a = np.maximum(a, ray)

    # Smooth vertical mist fade so skyline dissolves cleanly upward into sky-white
    v_fade = np.clip((yy - 8.0) / float(h - 12), 0.0, 1.0) ** 1.15
    return np.clip(a * v_fade, 0.0, 1.0)


def make_micro_grid(size: int = 48) -> np.ndarray:
    """Architectural glass curtain-wall wireframe tile (24px grid + subtle cross-ticks)."""
    a = np.zeros((size, size), dtype=np.float32)
    step = 24
    for y in range(0, size, step):
        a[y, :] = np.maximum(a[y, :], 0.60)
    for x in range(0, size, step):
        a[:, x] = np.maximum(a[:, x], 0.60)
    for y in range(0, size, step):
        for x in range(0, size, step):
            for d in range(-2, 3):
                a[y, (x + d) % size] = 1.0
                a[(y + d) % size, x] = 1.0
    return a


def make_momentum_stripes(w: int = 32, h: int = 32) -> np.ndarray:
    """Seamless tiled -22 deg diagonal velocity stripes for progress bar & running sweeps."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    phase = (xx + yy * 0.5) % 16.0
    a = np.where((phase >= 2.0) & (phase < 7.0), 1.0, 0.0).astype(np.float32)
    a = np.where((phase >= 1.2) & (phase < 2.0), (phase - 1.2) / 0.8, a)
    a = np.where((phase >= 7.0) & (phase < 7.8), 1.0 - (phase - 7.0) / 0.8, a)
    return np.clip(a, 0.0, 1.0)


def make_edge_wiggle_v(w: int = 24, h: int = 256) -> np.ndarray:
    """
    Organic glossy blurry variable-weight specular edge filament (Mirror's Edge Catalyst FOLLOW THE RED edge):
    a luminous white-hot core with multi-harmonic random weight swells, subtle center-line drift, and a soft
    feathered glossy halo. Vertical orientation for Sidebar right edge.
    """
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = yy / float(h)
    # Multi-harmonic organic thickness wiggle (1.1px .. 4.6px) + subtle positional drift
    wiggle = (
        1.75
        + 0.85 * np.sin(t * 2.0 * np.pi * 3.0 + 0.4)
        + 0.55 * np.sin(t * 2.0 * np.pi * 7.0 + 1.9)
        + 0.35 * np.sin(t * 2.0 * np.pi * 13.0 + 0.8)
    )
    # Add 3 bright glossy specular flare hotspots along the edge
    flares = (
        1.85 * np.exp(-((t - 0.24) / 0.055) ** 2)
        + 2.30 * np.exp(-((t - 0.56) / 0.065) ** 2)
        + 1.40 * np.exp(-((t - 0.84) / 0.050) ** 2)
    )
    half_w = np.clip(wiggle + flares, 0.9, 5.4)
    center_x = (w * 0.46) + 0.85 * np.sin(t * 2.0 * np.pi * 5.0 + 1.1) + 0.45 * np.sin(t * 2.0 * np.pi * 11.0)
    dist = np.abs(xx - center_x)
    # Soft glossy blurry Gaussian core + wider misty halo
    core = np.exp(-((dist / (half_w * 0.62)) ** 2))
    halo = 0.52 * np.exp(-((dist / (half_w * 1.65)) ** 2))
    intensity = np.clip(0.68 + 0.32 * np.clip(flares, 0.0, 1.0), 0.0, 1.0)
    return np.clip(np.maximum(core, halo) * intensity, 0.0, 1.0)


def make_edge_wiggle_h(w: int = 256, h: int = 24) -> np.ndarray:
    """Horizontal counterpart of make_edge_wiggle_v for PlayButton & Grid Play tile bottom edge."""
    v = make_edge_wiggle_v(h, w).T
    # Softly taper the left & right ends so the filament melts into the button corners
    xx = np.linspace(0.0, 1.0, w, dtype=np.float32)[None, :]
    taper = np.clip(xx / 0.14, 0.0, 1.0) * np.clip((1.0 - xx) / 0.14, 0.0, 1.0)
    return np.clip(v * (0.25 + 0.75 * taper), 0.0, 1.0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", type=str, default="", help="Optional contact sheet PNG path (save to scratch).")
    args = parser.parse_args()

    np.random.seed(20081111)
    here = pathlib.Path(__file__).resolve().parent
    fx_dir = here.parent / "src" / "Images" / "fx"
    fx_dir.mkdir(parents=True, exist_ok=True)

    # Clean up obsolete v1 masks if present
    for old in ("swiss-grid.png", "stride-sheen.png", "horizon-grid.png"):
        old_p = fx_dir / old
        if old_p.exists():
            old_p.unlink()

    sprites = {
        "glass-inset.png": make_glass_inset(96, 28),
        "glass-sheen.png": make_glass_sheen(256, 128),
        "city-skyline.png": make_city_skyline(640, 160),
        "micro-grid.png": make_micro_grid(48),
        "momentum-stripes.png": make_momentum_stripes(32, 32),
        "edge-wiggle-v.png": make_edge_wiggle_v(24, 256),
        "edge-wiggle-h.png": make_edge_wiggle_h(256, 24),
    }
    for name, mask in sprites.items():
        save_mask(mask, fx_dir / name)
        print(f"wrote {fx_dir / name} ({mask.shape[1]}x{mask.shape[0]})")

    if args.sheet:
        sheet = Image.new("RGB", (820, 320), (234, 241, 249))
        panels = [
            ("glass-inset", sprites["glass-inset.png"], (220, 120), False, (238, 246, 255), (107, 142, 184)),
            ("glass-sheen", sprites["glass-sheen.png"], (240, 120), False, (230, 25, 6), (255, 255, 255)),
            ("micro-grid", sprites["micro-grid.png"], (140, 120), True, (230, 25, 6), (255, 255, 255)),
            ("momentum", sprites["momentum-stripes.png"], (140, 120), True, (0, 108, 168), (255, 255, 255)),
            ("city-skyline", sprites["city-skyline.png"], (640, 140), False, (239, 245, 252), (96, 142, 194)),
        ]
        coords = [(16, 16), (252, 16), (508, 16), (664, 16), (16, 158)]
        for (label, mask, (pw, ph), tile, bg, fg), (ox, oy) in zip(panels, coords):
            if tile:
                mh, mw = mask.shape
                tiled = np.tile(mask, (ph // mh + 1, pw // mw + 1))[:ph, :pw]
            else:
                im = Image.fromarray((mask * 255).astype(np.uint8)).resize((pw, ph), Image.BILINEAR)
                tiled = np.array(im).astype(np.float32) / 255.0
            rgb = np.zeros((ph, pw, 3), dtype=np.uint8)
            for c in range(3):
                rgb[..., c] = np.clip(bg[c] * (1.0 - tiled) + fg[c] * tiled, 0, 255).astype(np.uint8)
            sheet.paste(Image.fromarray(rgb), (ox, oy))
        out_sheet = pathlib.Path(args.sheet)
        out_sheet.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(out_sheet)
        print(f"wrote contact sheet {out_sheet}")


if __name__ == "__main__":
    main()
