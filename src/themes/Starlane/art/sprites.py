"""Deterministic pure-white RGBA alpha masks for Starlane (OLED Star Wars theme).

Generates four pure-white (255, 255, 255) PNG masks in src/Images/fx/ colored at runtime
via WPF OpacityMask and CSS -webkit-mask:
  1. starfield.png     — Seamless 512x512 deep-space OLED starfield (sparse, calm pinpoints)
  2. saber-beam-h.png  — Horizontal glowing lightsaber plasma blade aura (tight bright core + smooth bloom)
  3. saber-beam-v.png  — Vertical glowing lightsaber plasma blade aura (for rows, rail, tree selection)
  4. saber-frame.png   — Soft 9-slice perimeter lightsaber bloom for Play & cover lock
"""

import argparse
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 19770525


def to_white_mask(alpha: np.ndarray) -> Image.Image:
    h, w = alpha.shape
    a = np.clip(np.round(alpha * 255.0), 0, 255).astype(np.uint8)
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    return Image.fromarray(rgba, mode="RGBA")


def make_starfield() -> Image.Image:
    """Seamless 512x512 calm deep-space starfield reminiscent of the Star Wars opening screen."""
    rng = np.random.default_rng(SEED)
    size = 512
    canvas = np.zeros((size, size), dtype=np.float32)

    # 150 crisp distant 1px stars
    xs = rng.integers(2, size - 2, size=150)
    ys = rng.integers(2, size - 2, size=150)
    br = rng.uniform(0.32, 0.70, size=150).astype(np.float32)
    for x, y, b in zip(xs, ys, br):
        canvas[y, x] = max(canvas[y, x], b)

    # 44 medium crisp stars with subtle cross-pixel softness
    xs2 = rng.integers(4, size - 4, size=44)
    ys2 = rng.integers(4, size - 4, size=44)
    br2 = rng.uniform(0.75, 1.0, size=44).astype(np.float32)
    for x, y, b in zip(xs2, ys2, br2):
        canvas[y, x] = max(canvas[y, x], b)
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            canvas[y + dy, x + dx] = max(canvas[y + dy, x + dx], b * 0.42)

    # 12 bright hero stars with tiny 2px soft pin-halo
    xs3 = rng.integers(6, size - 6, size=12)
    ys3 = rng.integers(6, size - 6, size=12)
    for x, y in zip(xs3, ys3):
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                d = np.hypot(dx, dy)
                if d <= 2.3:
                    val = np.exp(-((d / 1.1) ** 2))
                    canvas[y + dy, x + dx] = max(canvas[y + dy, x + dx], float(val))

    return to_white_mask(np.clip(canvas, 0.0, 1.0))


def make_saber_beam_h() -> Image.Image:
    """256x44 horizontal lightsaber plasma blade bloom (intense core + lush Gaussian halo)."""
    w, h = 256, 44
    y = np.linspace(-1.0, 1.0, h, dtype=np.float32)[:, None]
    x = np.linspace(0.0, 1.0, w, dtype=np.float32)[None, :]

    core = np.exp(-((y / 0.14) ** 2))
    mid = 0.72 * np.exp(-((y / 0.36) ** 2))
    outer = 0.38 * np.exp(-((y / 0.78) ** 2))
    # Clean ignition taper at the tip (right) and crisp hilt base (left)
    x_env = np.clip(np.minimum(x / 0.04, (1.0 - x) / 0.08), 0.0, 1.0) ** 0.55
    alpha = np.clip((core + mid + outer) * x_env, 0.0, 1.0)
    return to_white_mask(alpha)


def make_saber_beam_v() -> Image.Image:
    """44x256 vertical lightsaber plasma blade bloom (left-edge glow fading softly right)."""
    w, h = 44, 256
    x = np.linspace(0.0, 1.0, w, dtype=np.float32)[None, :]
    y = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]

    # Intense vertical saber line near left edge + soft rightward plasma falloff
    core = np.exp(-(((x - 0.08) / 0.07) ** 2))
    halo = 0.65 * np.exp(-(((x - 0.08) / 0.34) ** 2)) * (x >= 0.02)
    tail = 0.24 * np.exp(-(((x - 0.08) / 0.72) ** 2)) * (x >= 0.06)
    y_env = np.clip(np.minimum(y / 0.06, (1.0 - y) / 0.06), 0.0, 1.0) ** 0.5
    alpha = np.clip((core + halo + tail) * y_env, 0.0, 1.0)
    return to_white_mask(alpha)


def make_saber_frame() -> Image.Image:
    """96x96 soft lightsaber perimeter glow mask for buttons & cover frames."""
    s = 96
    img = Image.new("L", (s, s), 0)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([12, 12, s - 13, s - 13], radius=5, outline=255, width=4)
    halo1 = img.filter(ImageFilter.GaussianBlur(radius=5.0))
    halo2 = img.filter(ImageFilter.GaussianBlur(radius=10.0))
    a = (
        np.asarray(img, dtype=np.float32) * 0.70
        + np.asarray(halo1, dtype=np.float32) * 0.85
        + np.asarray(halo2, dtype=np.float32) * 0.45
    ) / 255.0
    return to_white_mask(np.clip(a, 0.0, 1.0))


def make_contact_sheet(sprites: dict[str, Image.Image], out_path: Path) -> None:
    cols = 2
    cell_w, cell_h = 360, 160
    sheet = Image.new("RGBA", (cols * cell_w + 30, 2 * cell_h + 40), (0, 0, 0, 255))
    draw = ImageDraw.Draw(sheet)
    tints = [
        (242, 245, 250),  # Starlight
        (40, 168, 255),   # Jedi Blue Saber
        (24, 201, 88),    # Consular Green Saber
        (229, 34, 34),    # Sith Red Saber
    ]
    for idx, (name, mask_img) in enumerate(sprites.items()):
        r, c = divmod(idx, cols)
        x0 = 10 + c * (cell_w + 10)
        y0 = 10 + r * (cell_h + 15)
        draw.rectangle([x0, y0, x0 + cell_w - 1, y0 + cell_h - 1], fill=(5, 6, 8, 255), outline=(35, 41, 54, 255))
        draw.text((x0 + 8, y0 + 6), name, fill=(255, 232, 31, 255))
        tint = tints[idx % len(tints)]
        arr = np.asarray(mask_img, dtype=np.uint8).copy()
        arr[..., 0], arr[..., 1], arr[..., 2] = tint
        colored = Image.fromarray(arr, mode="RGBA")
        colored.thumbnail((cell_w - 24, cell_h - 34), Image.Resampling.LANCZOS)
        sheet.alpha_composite(colored, (x0 + 12, y0 + 26))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", type=Path, default=None)
    args = parser.parse_args()

    out_dir = Path(__file__).resolve().parent.parent / "src" / "Images" / "fx"
    out_dir.mkdir(parents=True, exist_ok=True)
    # Remove any superseded masks cleanly
    for old in ("deathstar-slit-v.png", "holo-scan.png", "trench-grid.png", "saber-core.png"):
        p = out_dir / old
        if p.exists():
            p.unlink()

    sprites = {
        "starfield.png": make_starfield(),
        "saber-beam-h.png": make_saber_beam_h(),
        "saber-beam-v.png": make_saber_beam_v(),
        "saber-frame.png": make_saber_frame(),
    }
    for filename, img in sprites.items():
        img.save(out_dir / filename)
        print(f"Wrote {out_dir / filename} ({img.size[0]}x{img.size[1]})")

    if args.sheet:
        make_contact_sheet(sprites, args.sheet)
        print(f"Wrote contact sheet {args.sheet}")


if __name__ == "__main__":
    main()
