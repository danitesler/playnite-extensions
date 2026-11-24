"""Deterministic pure-white RGBA alpha masks for Baylight (macOS 27 Dark).

Every mask is pure white (255, 255, 255) with the shape in alpha, so WPF colours it through an OpacityMask over a
theme brush and the HTML previews through -webkit-mask: ThemeModifier edits still recolour them.

  silk-light.png   the lit ridges of the desktop picture's silk folds (diffused, as seen through glass)
  silk-shade.png   the shadow troughs of the same folds
  glass-halo.png   a soft rounded-rect halo for the Siri glow behind Play (stretched over the button)
  lift-shadow.png  a soft rounded-rect shadow under a magnified cover (stretched under the tile)

The folds are an original procedural field (warped sine bands), not Apple's wallpaper.

    python3 art/sprites.py            # writes src/Images/fx/*.png
    python3 art/sprites.py --sheet X  # also writes a contact sheet to X (use the session scratch folder)
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 20260608
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images" / "fx"


def to_white_mask(alpha: np.ndarray) -> Image.Image:
    a = np.clip(np.round(alpha * 255.0), 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = a
    return Image.fromarray(rgba, mode="RGBA")


def blur(alpha: np.ndarray, radius: float) -> np.ndarray:
    img = Image.fromarray(np.clip(alpha * 255.0, 0, 255).astype(np.uint8), mode="L")
    return np.asarray(img.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32) / 255.0


def silk_field(w: int, h: int) -> np.ndarray:
    """Phase of the silk sheets: a few broad layers sweeping from lower left to upper right, curling as they go."""
    rng = np.random.default_rng(SEED)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = x / w
    v = y / h
    p = rng.uniform(0, 2 * np.pi, size=4).astype(np.float32)
    # A slow bow (the sheets curve like petals) plus one gentle secondary sway.
    bow = 0.42 * np.sin(1.15 * v * np.pi + 0.6 * u * np.pi + p[0])
    sway = 0.12 * np.sin(2.4 * v * np.pi - 1.3 * u * np.pi + p[1])
    return 1.05 * u + 0.62 * v + bow + sway


def make_silk(w: int = 600, h: int = 1000):
    phi = silk_field(w, h) * 1.6
    f = phi - np.floor(phi)  # 0 at a sheet's root, 1 at its edge
    # Each sheet brightens toward its edge and ends in a thin specular line; the next sheet starts in its shadow.
    edge = np.exp(-(1.0 - f) / 0.022)
    ramp = f ** 2.4 * 0.55
    light = np.clip(edge + ramp, 0, 1)
    shade = (1.0 - f) ** 1.6
    # The picture settles toward the lower right, where it meets the slate band.
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    fall = np.clip(1.12 - 0.45 * (y / h) - 0.2 * (x / w), 0.4, 1.0)
    light = blur(light * fall, 2.6)
    shade = blur(shade * (0.55 + 0.45 * fall), 6.0)
    return to_white_mask(light), to_white_mask(shade * 0.85)


def rounded_rect_alpha(w: int, h: int, inset: int, radius: int, blur_r: float) -> np.ndarray:
    img = Image.new("L", (w, h), 0)
    ImageDraw.Draw(img).rounded_rectangle((inset, inset, w - 1 - inset, h - 1 - inset), radius=radius, fill=255)
    img = img.filter(ImageFilter.GaussianBlur(blur_r))
    return np.asarray(img, dtype=np.float32) / 255.0


def make_halo() -> Image.Image:
    # 240x88 halo for a ~200x40 button: the solid core matches the plate, the falloff is 20px.
    a = rounded_rect_alpha(240, 88, 24, 14, 10.0)
    return to_white_mask(a * 0.95)


def make_lift_shadow() -> Image.Image:
    # 160x220 for a cover: shadow offset down (light from above), denser at the bottom edge.
    a = rounded_rect_alpha(160, 220, 22, 14, 12.0)
    y = np.linspace(0.55, 1.0, a.shape[0], dtype=np.float32)[:, None]
    return to_white_mask(a * y)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheet", help="write a contact sheet PNG here")
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    light, shade = make_silk()
    sprites = {
        "silk-light.png": light,
        "silk-shade.png": shade,
        "glass-halo.png": make_halo(),
        "lift-shadow.png": make_lift_shadow(),
    }
    for name, img in sprites.items():
        img.save(OUT / name, optimize=True)
        print(f"wrote {OUT / name} {img.size}")
    if args.sheet:
        # Composite the silk the way the rail draws it: bronze gradient, gold ridges, umber troughs.
        w, h = light.size
        base = Image.new("RGB", (w, h))
        top, bot = np.array([0x7C, 0x5B, 0x42], np.float32), np.array([0x4F, 0x4F, 0x68], np.float32)
        t = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
        grad = (top * (1 - t) + bot * t).repeat(w, axis=1)
        la = np.asarray(light, np.float32)[..., 3:4] / 255.0
        sa = np.asarray(shade, np.float32)[..., 3:4] / 255.0
        gold = np.array([0xC9, 0xA6, 0x78], np.float32)
        deep = np.array([0x2A, 0x22, 0x20], np.float32)
        comp = grad * (1 - sa * 0.75) + deep * sa * 0.75
        comp = comp * (1 - la * 0.7) + gold * la * 0.7
        silk = Image.fromarray(np.clip(comp, 0, 255).astype(np.uint8), "RGB")
        tinted = Image.fromarray(np.clip(comp * 0.38 + np.array([24, 21, 19]) * 0.62, 0, 255).astype(np.uint8), "RGB")
        sheet = Image.new("RGB", (w * 2 + 520, h), (30, 30, 30))
        sheet.paste(silk, (0, 0))
        sheet.paste(tinted, (w, 0))
        x = w * 2 + 20
        yy = 20
        for name in ("glass-halo.png", "lift-shadow.png"):
            m = sprites[name]
            bg = Image.new("RGB", m.size, (40, 40, 40))
            bg.paste(Image.new("RGB", m.size, (255, 255, 255)), (0, 0), m)
            sheet.paste(bg, (x, yy))
            yy += m.size[1] + 20
        sheet.save(args.sheet)
        print(f"sheet {args.sheet}")


if __name__ == "__main__":
    main()
