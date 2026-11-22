#!/usr/bin/env python3
"""Generate deterministic 1-bit pixelated Bayer 4x4 white-mask FX sprites for Ditherwake.

Every sprite is built on a chunky 2x2-pixel macro-grid with strict binary alpha (0 or 255)
so WPF (NearestNeighbor) and Chromium (image-rendering: pixelated) render crisp,
authentic Return of the Obra Dinn 1-bit duotone dithering with zero blurry anti-aliasing.
"""

import math
from pathlib import Path
from PIL import Image

ART_DIR = Path(__file__).resolve().parent
OUT_DIR = ART_DIR.parent / "src" / "Images" / "fx"
OUT_DIR.mkdir(parents=True, exist_ok=True)

DARK_INK = (0x33, 0x33, 0x19, 255)   # Canonical Obra Dinn Macintosh dark olive-ink
LIGHT_INK = (0xE5, 0xFF, 0xFF, 255)  # Canonical Obra Dinn Macintosh pale cyan-cream

BAYER_4X4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
]


def put_block(px, bx: int, by: int, scale: int, rgba):
    for dy in range(scale):
        for dx in range(scale):
            px[bx * scale + dx, by * scale + dy] = rgba


def gen_dither_band():
    """64x16 (32x8 macro-pixels at 2px) horizontal 1-bit Bayer stepped gradient strip."""
    scale = 2
    mw, mh = 32, 8
    img = Image.new("RGBA", (mw * scale, mh * scale), (255, 255, 255, 0))
    px = img.load()
    for y in range(mh):
        for x in range(mw):
            # Symmetrical ramp peaking in center (0.0 -> 0.85 -> 0.0) for crisp 1-bit band
            dist = abs((x + 0.5) / mw - 0.5) * 2.0
            density = max(0.0, 1.0 - dist * 1.15)
            # Slightly stronger along the bottom edge for horizon/rule feel
            if y >= mh - 2:
                density = min(1.0, density + 0.25)
            threshold = (BAYER_4X4[y % 4][x % 4] + 0.5) / 16.0
            if density > threshold:
                put_block(px, x, y, scale, (255, 255, 255, 255))
    img.save(OUT_DIR / "dither-band.png")


def gen_dither_glint():
    """48x24 (24x12 macro-pixels at 2px) diagonal 1-bit Bayer sweep glint for Play/Running motion."""
    scale = 2
    mw, mh = 24, 12
    img = Image.new("RGBA", (mw * scale, mh * scale), (255, 255, 255, 0))
    px = img.load()
    for y in range(mh):
        for x in range(mw):
            diag = abs((x - y * 0.9) - 7.0)
            density = max(0.0, 1.0 - diag / 6.5)
            threshold = (BAYER_4X4[y % 4][x % 4] + 0.5) / 16.0
            if density > threshold:
                put_block(px, x, y, scale, (255, 255, 255, 255))
    img.save(OUT_DIR / "dither-glint.png")


def gen_vellum_stipple():
    """16x16 (8x8 macro-pixels at 2px) crisp 25% 1-bit Bayer stipple tile for panel textures."""
    scale = 2
    mw, mh = 8, 8
    img = Image.new("RGBA", (mw * scale, mh * scale), (255, 255, 255, 0))
    px = img.load()
    for y in range(mh):
        for x in range(mw):
            # 25% density (Bayer levels 0..3 of 16) -> clean pixel dot matrix
            if BAYER_4X4[y % 4][x % 4] < 4:
                put_block(px, x, y, scale, (255, 255, 255, 255))
    img.save(OUT_DIR / "vellum-stipple.png")


def gen_dither_cells():
    """16x16 (8x8 macro-pixels at 2px) strict 50% 1-bit pixel checkerboard tile."""
    scale = 2
    mw, mh = 8, 8
    img = Image.new("RGBA", (mw * scale, mh * scale), (255, 255, 255, 0))
    px = img.load()
    for y in range(mh):
        for x in range(mw):
            if (x + y) % 2 == 0:
                put_block(px, x, y, scale, (255, 255, 255, 255))
    img.save(OUT_DIR / "dither-cells.png")


def render_1bit_scene(out_path: Path, mw: int, mh: int, scale: int, lum_fn):
    img = Image.new("RGBA", (mw * scale, mh * scale), DARK_INK)
    px = img.load()
    for y in range(mh):
        for x in range(mw):
            lum = lum_fn(x, y, mw, mh)
            on = lum > (BAYER_4X4[y % 4][x % 4] + 0.5) / 16.0
            put_block(px, x, y, scale, LIGHT_INK if on else DARK_INK)
    img.save(out_path)


def gen_preview_scenes():
    """Generate authentic 1-bit pixelated Bayer 4x4 duotone preview art in art/."""
    # Hero banner: moonlit ocean, storm clouds, tall-ship brigantine silhouette, shimmering waves
    def hero_lum(x, y, w, h):
        mx, my = 276, 30
        dist = math.hypot(x - mx, y - my)
        horizon = 68
        if y < horizon:
            if dist < 15:
                return 1.0
            sky = max(0.0, 0.90 - (dist - 15) * 0.014)
            cloud = math.sin(x * 0.045 + y * 0.08) * 0.5 + math.cos(x * 0.09 - y * 0.05) * 0.5
            band = max(0.0, 1.0 - abs(y - 56) / 22.0)
            sky = max(sky, band * (0.50 + cloud * 0.25))
            # Tall-ship silhouette centered under moon
            sx = x - mx
            hull = 59 <= y < 68 and abs(sx) < (24 - (y - 59) * 0.9)
            m1 = abs(sx + 10) <= 0.6 and 38 <= y < 60
            m2 = abs(sx) <= 0.8 and 30 <= y < 60
            m3 = abs(sx - 10) <= 0.6 and 41 <= y < 60
            sail1 = 41 <= y <= 55 and abs(sx + 10) < 5
            sail2 = 34 <= y <= 55 and abs(sx) < 7
            sail3 = 44 <= y <= 55 and abs(sx - 10) < 4
            if hull or m1 or m2 or m3 or sail1 or sail2 or sail3:
                return 0.0
            return min(0.95, max(0.02, sky))
        else:
            dy = y - horizon
            wave = math.sin(dy * 1.45 + math.sin(x * 0.06) * 2.0)
            spread = 16 + dy * 1.15
            refl = max(0.0, 1.0 - abs(x - mx) / spread)
            shimmer = refl * (0.94 if wave > -0.15 else 0.12)
            sea_glow = max(0.0, 0.14 - dy * 0.002) + (0.18 if wave > 0.65 else 0.0)
            return min(0.95, max(0.02, shimmer + sea_glow))

    render_1bit_scene(ART_DIR / "preview-hero.png", 490, 108, 2, hero_lum)

    # Shot 1: Quarterdeck perspective planks + compass watch silhouette
    def shot1_lum(x, y, w, h):
        cx, cy = 55, 19
        d = math.hypot(x - cx, y - cy)
        if 9.5 < d < 12:
            return 1.0
        if d <= 9.5:
            return 0.92 if (abs(x - cx) < 1 or abs(y - cy) < 1) else 0.12
        if y > 25:
            plank = ((x - 55) / (y - 15)) * 14.0
            if abs(plank - round(plank)) < 0.09:
                return 0.0
            return max(0.08, 0.64 - (y - 25) * 0.016)
        return max(0.08, 0.72 - d * 0.015)

    render_1bit_scene(ART_DIR / "preview-shot1.png", 110, 46, 2, shot1_lum)

    # Shot 2: Bowsprit & rigging against moonlit sky
    def shot2_lum(x, y, w, h):
        spar = abs((y - 38) + (x - 18) * 0.42) < 1.6 and 14 < x < 92
        mast = abs(x - 42) < 1.2 and y > 4
        rope1 = abs((y - 6) - (x - 42) * 0.68) < 0.8 and x >= 42
        rope2 = abs((y - 14) - (x - 42) * 0.45) < 0.8 and x >= 42
        if spar or mast or rope1 or rope2:
            return 0.0
        md = math.hypot(x - 76, y - 16)
        if md < 8:
            return 1.0
        return max(0.10, 0.82 - md * 0.018)

    render_1bit_scene(ART_DIR / "preview-shot2.png", 110, 46, 2, shot2_lum)

    # Shot 3: Orlop deck lantern & ribbed hull beams
    def shot3_lum(x, y, w, h):
        beam = (x % 18 < 3) and (y < 14 or y > 34)
        post = abs(x - 22) < 2 or abs(x - 88) < 2
        if beam or post:
            return 0.0
        ld = math.hypot(x - 55, y - 22)
        if ld < 5:
            return 1.0
        return max(0.05, 0.88 - ld * 0.022)

    render_1bit_scene(ART_DIR / "preview-shot3.png", 110, 46, 2, shot3_lum)


def main():
    gen_dither_band()
    gen_dither_glint()
    gen_vellum_stipple()
    gen_dither_cells()
    gen_preview_scenes()
    print(f"Wrote 4 1-bit pixelated Bayer FX sprites to {OUT_DIR} and 4 preview scenes to {ART_DIR}")


if __name__ == "__main__":
    main()
