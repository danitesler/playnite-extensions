"""
Dewfield — deterministic white-mask FX sprite generator (Pillow + NumPy).
All sprites are pure white (255, 255, 255) with varying alpha (0..255) so WPF OpacityMask
and HTML -webkit-mask tint them live with ThemeModifier brushes / CSS tokens.
"""
import os
import numpy as np
from PIL import Image

SEED = 20260417
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "Images", "fx")
SHEET_PATH = os.path.join(os.path.dirname(__file__), "fx-sheet.png")


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


def make_wood_planks_h(rng: np.random.Generator) -> np.ndarray:
    """256x64 tileable horizontal walnut notice-board plank grain + crisp pixel seams."""
    w, h = 256, 64
    a = np.zeros((h, w), dtype=np.float32)
    # 3 horizontal plank bands (21, 21, 22px)
    seams = [0, 21, 42]
    for y in range(h):
        # subtle plank-to-plank brightness variation
        plank = 0 if y < 21 else (1 if y < 42 else 2)
        base = [26.0, 44.0, 32.0][plank]
        # pixel-stepped horizontal wood grain streaks (2px vertical pixel feel)
        py = (y // 2) * 2
        row_noise = rng.normal(0, 7.0)
        x = np.arange(w, dtype=np.float32)
        wave = np.sin((x / w) * 2 * np.pi * (2 + plank) + py * 0.37) * 10.0
        wave += np.sin((x / w) * 2 * np.pi * 7 + py * 1.1) * 5.0
        # quantize to 2px horizontal pixel blocks
        q = (np.arange(w) // 2) * 2
        a[y, :] = base + row_noise + wave[q]
    # pixel knots & fiber flecks
    for _ in range(38):
        ky = int(rng.integers(2, h - 2)) // 2 * 2
        kx = int(rng.integers(0, w)) // 2 * 2
        length = int(rng.integers(6, 22)) // 2 * 2
        val = float(rng.choice([78.0, 12.0]))
        for dx in range(length):
            a[ky:ky + 2, (kx + dx) % w] = val
    # plank seams: crisp highlight above seam, shadow line on seam
    for sy in seams:
        a[sy:sy + 2, :] = 175.0
        a[(sy + 2) % h:(sy + 4) % h, :] = 85.0
    # vertical plank end-joints staggered per plank
    joints = [(72, 0, 21), (188, 21, 42), (124, 42, 64)]
    for jx, y0, y1 in joints:
        a[y0:y1, jx:jx + 2] = 155.0
    return np.clip(a, 0, 255)


def make_wood_planks_v(rng: np.random.Generator) -> np.ndarray:
    """64x256 tileable vertical timber grain for the 44px walnut sidebar rail."""
    return make_wood_planks_h(rng).T.copy()


def make_parchment_grain(rng: np.random.Generator) -> np.ndarray:
    """128x128 calm warm parchment fiber grain (pixel-dithered for Stardew cohesion)."""
    s = 128
    # 2x2 pixel grain cells so it feels softly retro without visual noise
    low = rng.normal(24.0, 14.0, size=(s // 2, s // 2))
    # soft horizontal rag-paper fibers
    for _ in range(28):
        fy = int(rng.integers(0, s // 2))
        fx = int(rng.integers(0, s // 2))
        fl = int(rng.integers(4, 14))
        for dx in range(fl):
            low[fy, (fx + dx) % (s // 2)] += 22.0
    # occasional warm flecks
    for _ in range(45):
        fy = int(rng.integers(0, s // 2))
        fx = int(rng.integers(0, s // 2))
        low[fy, fx] += 36.0
    a = np.repeat(np.repeat(low, 2, axis=0), 2, axis=1)
    return np.clip(a, 0, 120)


def make_wood_bevel_glow() -> np.ndarray:
    """96x96 9-slice inner sunlit bevel bloom (24px borders) for Play hover & active slots."""
    s = 96
    yy, xx = np.mgrid[0:s, 0:s]
    d_top = yy
    d_bot = (s - 1) - yy
    d_left = xx
    d_right = (s - 1) - xx
    d_edge = np.minimum(np.minimum(d_top, d_bot), np.minimum(d_left, d_right))
    # smooth inner glow falling off across 20px, slightly brighter on top/left bevel
    glow = np.clip(1.0 - d_edge / 20.0, 0.0, 1.0) ** 2.1 * 215.0
    top_left_boost = (
        np.clip(1.0 - d_top / 10.0, 0.0, 1.0) * 55.0
        + np.clip(1.0 - d_left / 10.0, 0.0, 1.0) * 35.0
    )
    a = glow + top_left_boost
    # crisp 2px pixel-stepped outer edge
    a[d_edge < 2] = 245.0
    return np.clip(a, 0, 255)


def make_pixel_sheen() -> np.ndarray:
    """160x48 diagonal pixel-stepped light glint for Play hover & selection sweep."""
    w, h = 160, 48
    yy, xx = np.mgrid[0:h, 0:w]
    # quantize to 2px pixel steps
    qx = (xx // 2) * 2
    qy = (yy // 2) * 2
    # main diagonal beam + thin companion glint
    pos = qx - qy * 1.15
    beam1 = np.exp(-((pos - 62.0) / 14.0) ** 2) * 215.0
    beam2 = np.exp(-((pos - 90.0) / 5.0) ** 2) * 145.0
    return np.clip(beam1 + beam2, 0, 255)


def make_pixel_cells() -> np.ndarray:
    """16x16 tiled vertical pixel energy/water bar segments (6px bar + 2px gap)."""
    s = 16
    a = np.zeros((s, s), dtype=np.float32)
    # 2 segments across 16px: columns 0..5 and 8..13 lit, 6..7 and 14..15 dark seams
    for c0 in (0, 8):
        a[:, c0:c0 + 6] = 255.0
        a[:, c0 + 6:c0 + 8] = 65.0
    # subtle top pixel highlight & bottom bevel
    a[0:2, :] = np.minimum(255.0, a[0:2, :] * 1.0)
    a[14:16, :] = a[14:16, :] * 0.72
    return np.clip(a, 0, 255)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    rng = np.random.default_rng(SEED)
    sprites = [
        ("wood-planks-h.png", make_wood_planks_h(rng)),
        ("wood-planks-v.png", make_wood_planks_v(rng)),
        ("parchment-grain.png", make_parchment_grain(rng)),
        ("wood-bevel-glow.png", make_wood_bevel_glow()),
        ("pixel-sheen.png", make_pixel_sheen()),
        ("pixel-cells.png", make_pixel_cells()),
    ]
    imgs = [(name, save_white_mask(arr, name)) for name, arr in sprites]

    # Build a dark walnut-backed contact sheet for visual review
    sheet = Image.new("RGBA", (620, 320), (42, 22, 10, 255))
    positions = [
        (16, 16),   # wood-planks-h (256x64)
        (292, 16),  # wood-planks-v (64x256)
        (376, 16),  # parchment-grain (128x128)
        (16, 100),  # wood-bevel-glow (96x96)
        (128, 100), # pixel-sheen (160x48)
        (128, 164), # pixel-cells (16x16 scaled 4x for preview)
    ]
    for (name, im), (x, y) in zip(imgs, positions):
        disp = im.resize((64, 64), Image.NEAREST) if name == "pixel-cells.png" else im
        sheet.alpha_composite(disp, (x, y))
    sheet.save(SHEET_PATH)
    print(f"Generated {len(imgs)} sprites in {OUT_DIR} and contact sheet {SHEET_PATH}")


if __name__ == "__main__":
    main()
