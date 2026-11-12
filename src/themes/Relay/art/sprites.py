"""Relay effect sprites: white masks with the effect in alpha, colored in XAML through brush-filled OpacityMasks.

glow-frame.png (128x128, 9-slice 44/40/44): rim bloom of the lit Mass Effect 2 panels. The plate edge sits 28px
inside the sprite (hosts use Margin -28). Outside the edge alpha falls as a Gaussian (sigma 9px, peak 0.55 at the
rim), measured by eye from the codex panel captures where the amber bloom fades out over about 25px at 1080p.
Inside the edge a short 3px falloff lights the rim only, so the plate stays readable.

Usage: python -I src/themes/Relay/art/sprites.py   (writes src/themes/Relay/src/Images/fx/, deterministic)
"""
import math
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "src", "Images", "fx")


def glow_frame(size=128, inset=28, sigma=9.0, peak=0.55, inner=3.0):
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    px = img.load()
    lo, hi = inset, size - inset
    for y in range(size):
        for x in range(size):
            cx, cy = x + 0.5, y + 0.5
            dx = max(lo - cx, 0.0, cx - hi)
            dy = max(lo - cy, 0.0, cy - hi)
            if dx > 0 or dy > 0:
                d = math.hypot(dx, dy)
                a = peak * math.exp(-(d * d) / (2 * sigma * sigma))
            else:
                din = min(cx - lo, hi - cx, cy - lo, hi - cy)
                a = peak * math.exp(-(din * din) / (2 * inner * inner))
            px[x, y] = (255, 255, 255, int(round(a * 255)))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    glow_frame().save(os.path.join(OUT, "glow-frame.png"), optimize=True)
    print("wrote", os.path.join(OUT, "glow-frame.png"))


if __name__ == "__main__":
    main()
