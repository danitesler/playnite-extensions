"""
Foldcraft — deterministic white-mask FX sprite generator (Pillow + NumPy).
All sprites are pure white (255, 255, 255) RGBA alpha masks so WPF OpacityMask and
CSS -webkit-mask tint them dynamically with ThemeModifier brushes / CSS tokens.

Outputs white-mask PNGs to src/Images/fx/ and a dark-backed contact sheet to
the specified scratch directory (or OS temp if omitted).
"""
import argparse
import os
import tempfile
import numpy as np
from PIL import Image, ImageDraw

SEED = 1404
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "Images", "fx")


def save_white_mask(alpha: np.ndarray, name: str) -> Image.Image:
    a = np.clip(alpha, 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    img = Image.fromarray(rgba, mode="RGBA")
    img.save(os.path.join(OUT_DIR, name))
    return img


def make_cutting_mat_grid() -> np.ndarray:
    """64x64 seamless self-healing cutting mat grid with major lines and corner ticks."""
    s = 64
    a = np.zeros((s, s), dtype=np.float32)
    # Faint 16px subdivision grid
    for p in (16, 48):
        a[p, :] = 48.0
        a[:, p] = 48.0
    # Primary 32px craft grid
    for p in (0, 32):
        a[p, :] = 135.0
        a[:, p] = 135.0
    # Crisp + registration ticks at 32px intersections
    for py in (0, 32):
        for px in (0, 32):
            for d in range(-4, 5):
                a[py, (px + d) % s] = 235.0
                a[(py + d) % s, px] = 235.0
    return np.clip(a, 0, 255)


def make_paper_fibers(rng: np.random.Generator) -> np.ndarray:
    """128x128 tactile handmade construction-paper pulp tooth, speckles, and organic fibers."""
    s = 128
    a = rng.normal(38.0, 18.0, size=(s, s)).astype(np.float32)
    # Multi-angle short matte pulp fibers
    for _ in range(180):
        x0 = float(rng.uniform(0, s))
        y0 = float(rng.uniform(0, s))
        ang = float(rng.uniform(0, np.pi))
        length = float(rng.uniform(4.0, 12.0))
        val = float(rng.uniform(75.0, 155.0))
        steps = int(length * 2) + 1
        for i in range(steps):
            t = i / max(1, steps)
            px = int(round(x0 + np.cos(ang) * length * t)) % s
            py = int(round(y0 + np.sin(ang) * length * t)) % s
            a[py, px] = max(a[py, px], val)
    # Organic paper flecks
    for _ in range(140):
        py = int(rng.integers(0, s))
        px = int(rng.integers(0, s))
        a[py, px] = float(rng.uniform(110.0, 175.0))
    return np.clip(a, 0, 180)


def make_corrugated_kraft(rng: np.random.Generator) -> np.ndarray:
    """64x64 seamless diagonal-ribbed craft paper & cardstock weave for sidebars and lists."""
    s = 64
    yy, xx = np.mgrid[0:s, 0:s]
    # Subtle diagonal craft-paper ribs + cross-grain
    diag = np.sin((xx + yy) * (2.0 * np.pi / 16.0)) * 38.0 + 52.0
    cross = np.sin((xx - yy) * (2.0 * np.pi / 32.0)) * 16.0
    noise = rng.normal(0.0, 14.0, size=(s, s))
    return np.clip(diag + cross + noise, 0, 155)


def make_accordion_creases() -> np.ndarray:
    """128x128 seamless origami fold creases & paper facets for cardstock dossiers and cards."""
    s = 128
    img = Image.new("L", (s, s), 18)
    draw = ImageDraw.Draw(img)
    # Diagonal & vertical valley/mountain fold lines
    creases = [
        ((0, 0), (128, 128), 115),
        ((0, 64), (64, 0), 95),
        ((64, 128), (128, 64), 95),
        ((42, 0), (42, 128), 85),
        ((86, 0), (86, 128), 85),
    ]
    for p0, p1, val in creases:
        draw.line([p0, p1], fill=val, width=2)
        draw.line([(p0[0] + 2, p0[1]), (p1[0] + 2, p1[1])], fill=45, width=1)
    # Subtle shaded triangular facet
    draw.polygon([(0, 0), (42, 0), (42, 42)], fill=52)
    draw.polygon([(86, 86), (128, 86), (128, 128)], fill=48)
    return np.asarray(img, dtype=np.float32)


def make_deckle_edge_h(rng: np.random.Generator) -> np.ndarray:
    """256x16 seamless scissor-cut deckled edge strip (opaque top fading over hand-cut facets)."""
    w, h = 256, 16
    img = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(img)
    pts = [(0, 0), (w, 0)]
    xs = list(range(0, w + 1, 8))
    bottom_pts = []
    for x in reversed(xs):
        # Seamless periodic wave + deterministic small scissor facets
        phase = (x % w) / w * 2.0 * np.pi
        jitter = 0.0 if x in (0, w) else float(rng.uniform(-2.2, 2.2))
        y = 10.5 + 2.2 * np.sin(phase * 3.0) + 1.1 * np.cos(phase * 7.0) + jitter
        bottom_pts.append((x, float(np.clip(y, 5.0, 15.0))))
    draw.polygon(pts + bottom_pts, fill=255)
    return np.asarray(img, dtype=np.float32)


def make_blueprint_folds() -> np.ndarray:
    """256x256 seamless papercraft blueprint net (dashed fold lines and glue-tab polygons)."""
    s = 256
    img = Image.new("L", (s, s), 0)
    draw = ImageDraw.Draw(img)

    def dashed_line(p0, p1, dash=7, gap=5, val=150):
        x0, y0 = p0
        x1, y1 = p1
        dist = float(np.hypot(x1 - x0, y1 - y0))
        if dist < 1:
            return
        pos = 0.0
        while pos < dist:
            end = min(dist, pos + dash)
            t0, t1 = pos / dist, end / dist
            draw.line(
                (x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0, x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1),
                fill=val,
                width=1,
            )
            pos += dash + gap

    # Faint unfolded geometric papercraft net polygons
    polys = [
        [(28, 24), (88, 24), (104, 68), (28, 80)],
        [(136, 44), (214, 30), (226, 98), (154, 110)],
        [(36, 134), (110, 128), (122, 206), (50, 222)],
        [(144, 152), (222, 144), (212, 224), (156, 212)],
    ]
    for poly in polys:
        for i in range(len(poly)):
            p0 = poly[i]
            p1 = poly[(i + 1) % len(poly)]
            draw.line([p0, p1], fill=105, width=1)
        # Inner fold crease & small glue tab on edge 0
        dashed_line(poly[0], poly[2], val=125)
        a0, a1 = poly[0], poly[1]
        mx, my = (a0[0] + a1[0]) * 0.5, (a0[1] + a1[1]) * 0.5
        dx, dy = a1[0] - a0[0], a1[1] - a0[1]
        l = float(np.hypot(dx, dy)) or 1.0
        nx, ny = dy / l, -dx / l
        tab = [
            (a0[0] + dx * 0.22, a0[1] + dy * 0.22),
            (a0[0] + dx * 0.30 + nx * 10, a0[1] + dy * 0.30 + ny * 10),
            (a0[0] + dx * 0.70 + nx * 10, a0[1] + dy * 0.70 + ny * 10),
            (a0[0] + dx * 0.78, a0[1] + dy * 0.78),
        ]
        draw.line(tab, fill=120, width=1)
        dashed_line(tab[0], tab[3], dash=4, gap=4, val=135)

    return np.asarray(img, dtype=np.float32)


def make_paper_sheen() -> np.ndarray:
    """160x48 diagonal sunlit paper-fold glint for Play hover & selection sweeps."""
    w, h = 160, 48
    yy, xx = np.mgrid[0:h, 0:w]
    pos = xx - yy * 0.95
    beam1 = np.exp(-((pos - 64.0) / 14.0) ** 2) * 210.0
    beam2 = np.exp(-((pos - 92.0) / 5.5) ** 2) * 140.0
    return np.clip(beam1 + beam2, 0, 255)


def make_confetti_sweep() -> np.ndarray:
    """128x32 geometric cut-paper diamond & confetti sweep band for Launching indicators."""
    w, h = 128, 32
    img = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(img)
    # Base angled band across 24..104
    for x in range(w):
        dist = abs(x - 64.0) / 40.0
        base = max(0, int(115 * max(0.0, 1.0 - dist ** 1.6)))
        if base > 0:
            draw.line([(x, 0), (x, h - 1)], fill=base)
    # Scattered crisp geometric paper confetti diamonds & triangles inside the band
    shapes = [
        [(28, 8), (36, 4), (40, 12)],
        [(46, 20), (52, 14), (58, 20), (52, 26)],
        [(62, 6), (70, 3), (74, 11), (66, 14)],
        [(76, 18), (85, 14), (82, 25)],
        [(90, 9), (98, 6), (101, 15)],
    ]
    for sh in shapes:
        draw.polygon(sh, fill=245)
    return np.asarray(img, dtype=np.float32)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--sheet-out",
        default=os.path.join(tempfile.gettempdir(), "foldcraft-fx-sheet.png"),
        help="Scratch path for the disposable contact sheet PNG.",
    )
    args = parser.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    rng = np.random.default_rng(SEED)
    sprites = [
        ("cutting-mat-grid.png", make_cutting_mat_grid()),
        ("paper-fibers.png", make_paper_fibers(rng)),
        ("corrugated-kraft.png", make_corrugated_kraft(rng)),
        ("accordion-creases.png", make_accordion_creases()),
        ("deckle-edge-h.png", make_deckle_edge_h(rng)),
        ("blueprint-folds.png", make_blueprint_folds()),
        ("paper-sheen.png", make_paper_sheen()),
        ("confetti-sweep.png", make_confetti_sweep()),
    ]
    imgs = [(name, save_white_mask(arr, name)) for name, arr in sprites]

    sheet = Image.new("RGBA", (720, 380), (11, 88, 83, 255))
    positions = [
        (16, 16),     # cutting-mat-grid (64x64)
        (96, 16),     # paper-fibers (128x128)
        (16, 96),     # corrugated-kraft (64x64)
        (96, 160),    # accordion-creases (128x128)
        (240, 16),    # deckle-edge-h (256x16)
        (240, 48),    # blueprint-folds (256x256)
        (240, 316),   # paper-sheen (160x48)
        (420, 324),   # confetti-sweep (128x32)
    ]
    for (_, im), (x, y) in zip(imgs, positions):
        sheet.alpha_composite(im, (x, y))
    os.makedirs(os.path.dirname(os.path.abspath(args.sheet_out)), exist_ok=True)
    sheet.save(args.sheet_out)
    print(f"Generated {len(imgs)} sprites in {OUT_DIR} and contact sheet {args.sheet_out}")


if __name__ == "__main__":
    main()
