"""Deterministic procedural white-mask RGBA FX sprites for Cropmark.

Generates pure-white (255, 255, 255) alpha-mask PNGs under src/Images/fx/ so both
WPF OpacityMask (ImageBrush) and HTML -webkit-mask tint them dynamically with
ThemeModifier / CSS tokens. Seeded for bit-reproducible output.
"""

from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 20260806
ROOT = Path(__file__).resolve().parent.parent
FX_DIR = ROOT / "src" / "Images" / "fx"


def save_white_mask(alpha: np.ndarray, out_path: Path) -> Image.Image:
    a = np.clip(np.round(alpha), 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    img = Image.fromarray(rgba, mode="RGBA")
    img.save(out_path, optimize=True)
    return img


def make_marker_stroke(rng: np.random.Generator) -> Image.Image:
    """Chisel-tip comic marker diagonal stroke texture (512x96).

    Keeps a high solid alpha core (215..255) so text contrast over Marker Orange
    never drops below 6:1 while showing authentic diagonal chisel-marker streaks.
    """
    w, h = 512, 96
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    # Diagonal chisel streaks (~-14 degrees, matching OPTIONS / PAUSE MENU orange fill)
    diag = yy + 0.24 * xx
    # Multi-frequency smooth bristle striations
    s1 = np.sin(diag * 0.42 + rng.uniform(0, 6.28)) * 0.5 + 0.5
    s2 = np.sin(diag * 1.15 + 1.3) * 0.5 + 0.5
    s3 = np.sin((yy - 0.12 * xx) * 0.19) * 0.5 + 0.5

    # Low-frequency marker pressure waves along X
    pressure = 0.88 + 0.12 * np.sin(xx * 0.025 + 0.7) * np.cos(yy * 0.06)

    # Subtle paper tooth noise
    tooth = rng.normal(0.0, 1.0, (h, w)).astype(np.float32)
    tooth_img = Image.fromarray(np.clip((tooth * 40 + 128), 0, 255).astype(np.uint8))
    tooth_blur = np.asarray(tooth_img.filter(ImageFilter.GaussianBlur(radius=1.1)), dtype=np.float32) / 255.0

    # Combine into high-opacity textured fill (208..255)
    alpha = 216.0 + 26.0 * (0.55 * s1 + 0.30 * s2 + 0.15 * s3) + 18.0 * (tooth_blur - 0.5)
    alpha *= pressure

    # Slight organic marker lift on the far-right 2% edge
    right_fade = np.clip((w - xx) / 6.0, 0.75, 1.0)
    alpha *= right_fade
    return save_white_mask(alpha, FX_DIR / "marker-stroke.png")


def make_paper_grain(rng: np.random.Generator) -> Image.Image:
    """Tileable 256x256 cold-press Bristol rag paper grain mask."""
    size = 256
    # Tileable noise via FFT low-pass + fine fibers
    base = rng.normal(0.0, 1.0, (size, size)).astype(np.float32)
    fft = np.fft.fft2(base)
    fy = np.fft.fftfreq(size)[:, None]
    fx = np.fft.fftfreq(size)[None, :]
    r = np.sqrt(fx * fx + fy * fy)
    # Soft cold-press tooth band
    filt = np.exp(-((r * 26.0) ** 2)) * 0.7 + np.exp(-((r * 8.0) ** 2)) * 0.3
    smooth = np.real(np.fft.ifft2(fft * filt))
    smooth = (smooth - smooth.min()) / (smooth.max() - smooth.min() + 1e-6)

    # Fine isotropic grain
    fine = rng.uniform(0.0, 1.0, (size, size)).astype(np.float32)
    # Horizontal & vertical rag fiber hints (tileable)
    fibers = np.zeros((size, size), dtype=np.float32)
    for _ in range(90):
        y0 = int(rng.integers(0, size))
        x0 = int(rng.integers(0, size))
        length = int(rng.integers(8, 28))
        horiz = rng.random() > 0.45
        val = float(rng.uniform(0.15, 0.35))
        for k in range(length):
            if horiz:
                fibers[y0, (x0 + k) % size] = max(fibers[y0, (x0 + k) % size], val)
            else:
                fibers[(y0 + k) % size, x0] = max(fibers[(y0 + k) % size, x0], val)

    alpha = 255.0 * (0.55 * smooth + 0.25 * fine + 0.20 * fibers)
    return save_white_mask(alpha, FX_DIR / "paper-grain.png")


def make_backing_edge(rng: np.random.Generator) -> Image.Image:
    """Torn dark construction-paper texture (512x128) with subtly rough top/left edge."""
    w, h = 512, 128
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    # Coarse matte construction paper tooth
    n = rng.normal(0.0, 1.0, (h, w)).astype(np.float32)
    n_img = Image.fromarray(np.clip(n * 48 + 128, 0, 255).astype(np.uint8))
    n_blur = np.asarray(n_img.filter(ImageFilter.GaussianBlur(radius=1.8)), dtype=np.float32) / 255.0

    # Gently deckled top edge (2..5px)
    edge_x = np.linspace(0, 1, w)
    rough_top = (
        2.6
        + 1.1 * np.sin(edge_x * 47.0 + 0.4)
        + 0.7 * np.sin(edge_x * 131.0 + 2.1)
        + 0.4 * np.cos(edge_x * 263.0)
    )
    top_mask = np.clip((yy - rough_top[None, :]) / 1.8, 0.0, 1.0)

    # Gently deckled left edge (2..5px)
    edge_y = np.linspace(0, 1, h)
    rough_left = (
        2.5
        + 1.0 * np.sin(edge_y * 29.0 + 1.2)
        + 0.6 * np.cos(edge_y * 79.0 + 0.5)
    )
    left_mask = np.clip((xx - rough_left[:, None]) / 1.8, 0.0, 1.0)

    alpha = (224.0 + 31.0 * (n_blur - 0.5)) * top_mask * left_mask
    return save_white_mask(alpha, FX_DIR / "backing-edge.png")


def make_halftone_corner() -> Image.Image:
    """Crisp manga Ben-Day halftone dot gradient fading diagonally from top-right (256x256)."""
    size = 256
    img = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(img)

    step = 10
    for gy in range(-step, size + step, step):
        for gx in range(-step, size + step, step):
            # Offset odd rows for classic 45-deg manga screen tone
            ox = gx + (step // 2 if (gy // step) % 2 else 0)
            oy = gy
            # Distance from top-right corner (size, 0)
            dist = np.hypot((size - ox) / size, oy / size)
            strength = max(0.0, 1.0 - dist * 1.18)
            if strength <= 0.04:
                continue
            r = strength * 3.6
            draw.ellipse([ox - r, oy - r, ox + r, oy + r], fill=int(min(255, strength * 240)))

    alpha = np.asarray(img, dtype=np.float32)
    return save_white_mask(alpha, FX_DIR / "halftone-corner.png")


def write_contact_sheet(sprites: list[tuple[str, Image.Image]], out_path: Path) -> None:
    sheet = Image.new("RGB", (1100, 420), (38, 41, 31))
    draw = ImageDraw.Draw(sheet)
    positions = [(20, 30), (560, 30), (20, 180), (560, 150)]
    tints = [(255, 121, 22), (236, 227, 214), (129, 183, 213), (0, 143, 224)]
    for (name, im), (x, y), tint in zip(sprites, positions, tints):
        w, h = im.size
        if h > 220:
            im = im.resize((220, 220), Image.Resampling.LANCZOS)
            w, h = im.size
        # Composite white mask with preview tint on dark charcoal
        colored = Image.new("RGBA", (w, h), (*tint, 255))
        colored.putalpha(im.getchannel("A"))
        bg = Image.new("RGBA", (w, h), (45, 48, 36, 255))
        comp = Image.alpha_composite(bg, colored).convert("RGB")
        sheet.paste(comp, (x, y))
        draw.rectangle([x - 1, y - 1, x + w, y + h], outline=(107, 167, 204), width=1)
        draw.text((x, y - 16), f"{name} ({im.size[0]}x{im.size[1]})", fill=(245, 239, 229))
    sheet.save(out_path)


def main() -> None:
    FX_DIR.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(SEED)
    sprites = [
        ("marker-stroke.png", make_marker_stroke(rng)),
        ("paper-grain.png", make_paper_grain(rng)),
        ("backing-edge.png", make_backing_edge(rng)),
        ("halftone-corner.png", make_halftone_corner()),
    ]
    scratch = Path(r"C:\Users\zarte\.gemini\antigravity\brain\f90a4d4b-f31f-46c5-927a-499284f56e74\scratch")
    if scratch.exists():
        write_contact_sheet(sprites, scratch / "cropmark-fx-sheet.png")
    print("Generated FX sprites in", FX_DIR)


if __name__ == "__main__":
    main()
