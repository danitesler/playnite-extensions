"""Draws src/Images/smoke.png: the smoky mottling of the selection plate (SelectionBarTemplate in src/Common.xaml).

Original artwork, made from seeded value noise; no game files. White with a low, varying alpha, so the plate's own
brushes (SelectedBrush and friends) keep its color and ThemeModifier edits still reach it.
Run: python3 art/smoke.py   (needs Pillow)
"""
import random
from PIL import Image

W, H = 512, 64
random.seed(4)


def octave(cells_x, cells_y):
    grid = [[random.random() for _ in range(cells_x + 2)] for _ in range(cells_y + 2)]

    def at(x, y):
        gx, gy = x / W * cells_x, y / H * cells_y
        ix, iy = int(gx), int(gy)
        fx, fy = gx - ix, gy - iy
        fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
        a = grid[iy][ix] * (1 - fx) + grid[iy][ix + 1] * fx
        b = grid[iy + 1][ix] * (1 - fx) + grid[iy + 1][ix + 1] * fx
        return a * (1 - fy) + b * fy
    return at


# Long horizontal wisps: many cells across, few down, like brushed smoke.
layers = [(octave(10, 2), 0.55), (octave(28, 4), 0.3), (octave(80, 8), 0.15)]
img = Image.new("RGBA", (W, H))
px = img.load()
for y in range(H):
    for x in range(W):
        v = sum(f(x, y) * w for f, w in layers)
        v = max(0.0, (v - 0.35) / 0.65)
        px[x, y] = (255, 255, 255, int(v * v * 70))
img.save("src/Images/smoke.png", optimize=True)
print("wrote src/Images/smoke.png")
