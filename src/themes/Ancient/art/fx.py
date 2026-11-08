"""Ancient: generated effect sprites. Deterministic (no randomness). Run from anywhere: python art/fx.py

glow-frame.png: a 128x128 white mask (RGB 255, the glow in alpha) for the dashboard's box-shadow glows
([CSS] play.css .PlayButton:hover box-shadow 8px blur 8px spread; hero_card.css Highlighted box-shadow 8px blur 8px
spread). Nine-slice 44 / 40 / 44. The element's edge sits at inset 32 of the sprite, so a host placed at Margin -32
around an element puts the glow's lit edge exactly on the element. Outside the edge the alpha follows a Gaussian-blurred
box: about 0.8 at the edge falling to under 2% about 24px out. Inside the edge it keeps a soft 0.30 fill that fades over 12px
(the game's `box-shadow: fill`), which sits under the element and only shows through translucent plates.

Colour is never baked in: XAML fills a rectangle with a theme brush and uses this file as OpacityMask, so ThemeModifier
recolours every glow. art/fx-sheet.png is the review sheet (the sprite tinted and enlarged x3 on the page colour).
"""
from math import erf, sqrt
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SIZE, EDGE = 128, 32
SIGMA = 7.0          # blur 8px in the game is about a 4px sigma; the extra width reads as the 8px spread
SPREAD = 6.0


def glow_frame():
    y, x = np.mgrid[:SIZE, :SIZE]
    qx, qy = np.abs(x - SIZE / 2 + 0.5) - (SIZE / 2 - EDGE), np.abs(y - SIZE / 2 + 0.5) - (SIZE / 2 - EDGE)
    # signed distance to the element's box (negative inside)
    s = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0)
    # blurred hard edge: a half-plane of alpha 1 up to SPREAD outside, blurred with SIGMA
    outside = 0.5 * (1 - np.vectorize(erf)((s - SPREAD) / (SIGMA * sqrt(2))))
    edge_alpha = 0.5 * (1 - erf((0 - SPREAD) / (SIGMA * sqrt(2))))
    inside = 0.30 + (edge_alpha - 0.30) * np.clip(1 - (-s) / 12.0, 0, 1) ** 2
    a = np.where(s > 0, outside, inside)
    a[np.abs(s) > 60] = 0
    return np.clip(a, 0, 1)


def main():
    folder = ROOT / "src/Images/fx"
    folder.mkdir(parents=True, exist_ok=True)
    alpha = np.rint(glow_frame() * 255).astype(np.uint8)
    rgba = np.full((SIZE, SIZE, 4), 255, dtype=np.uint8)
    rgba[:, :, 3] = alpha
    sprite = Image.fromarray(rgba)
    path = folder / "glow-frame.png"
    sprite.save(path, optimize=True)

    sheet = Image.new("RGBA", (SIZE * 3 + 64, SIZE * 3 + 64), "#0d1114")
    tint = Image.new("RGBA", sprite.size, "#6fb5ff")
    tint.putalpha(sprite.getchannel("A"))
    sheet.alpha_composite(tint.resize((SIZE * 3, SIZE * 3), Image.NEAREST), (32, 32))
    d = ImageDraw.Draw(sheet)
    # the element's edge (inset 32 at 1x) so the lit edge can be checked
    d.rectangle([32 + EDGE * 3, 32 + EDGE * 3, 32 + (SIZE - EDGE) * 3, 32 + (SIZE - EDGE) * 3], outline="#ffffff")
    d.text((32, 8), "glow-frame.png x3, white box = element edge", font=ImageFont.load_default(), fill="#a5ada2")
    sheet.save(ROOT / "art/fx-sheet.png", optimize=True)
    prof = [int(alpha[SIZE // 2, SIZE // 2 + (SIZE // 2 - EDGE) + k]) for k in (0, 4, 8, 12, 16, 20, 24)]
    print("alpha 0..24px outside the edge:", prof)
    print(path.relative_to(ROOT).as_posix(), path.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
