"""Tatterspire's torn-paper sprites. Pure white RGBA masks, tinted by brushes in XAML (OpacityMask) and in the previews.

Run:  python src/themes/Tatterspire/art/sprites.py
Writes src/Images/fx/:
  sheet.png       224x224 torn sheet silhouette, 9-slice (corners 48, tiled middles 128): the paper
  sheet-edge.png  the same silhouette grown 2px: the dark outline drawn under the paper
  sheet-rim.png   a 1.5px line 4px inside the torn edge: the lighter inner rim
  torn-foot.png   1024x40 strip, opaque below a ragged line: the game page banner foot
  torn-lip.png    the same strip flipped (opaque above the ragged line): the top bar's lower edge
  stain.png       256x256 soft mottling (alpha 0-70): faint paper stains over a sheet
  fx-sheet.png    contact sheet for review (art/, not shipped)
The edge profile is periodic over the 128px tile, so a tiled middle slice shows no seam. Fixed seed: output is repeatable.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

SS = 4                 # supersampling for antialiasing
SIZE = 224             # sheet canvas
CORNER = 48            # 9-slice corner
TILE = SIZE - 2 * CORNER  # 128
INSET = 3.0            # base distance of the torn edge from the canvas edge
RADIUS = 9.0           # corner rounding


def periodic_profile(rng, length, period, amp, jag_step=4, soft_step=16):
    """Edge offsets over `length` px that repeat every `period` px: soft swell + jagged nicks, range 0..amp."""
    n_soft = period // soft_step
    n_jag = period // jag_step
    soft = rng.random(n_soft)
    jag = rng.random(n_jag)
    t = np.arange(length) % period
    def interp(knots, step):
        k = len(knots)
        x = t / step
        i0 = np.floor(x).astype(int) % k
        i1 = (i0 + 1) % k
        f = x - np.floor(x)
        f = f * f * (3 - 2 * f)
        return knots[i0] * (1 - f) + knots[i1] * f
    swell = interp(soft, soft_step)
    rough = interp(jag, jag_step)
    prof = 0.55 * swell + 0.45 * rough
    # a few deeper nicks, placed on the period so they repeat
    for _ in range(3):
        c = int(rng.integers(0, period))
        w = int(rng.integers(5, 10))
        d = rng.uniform(0.35, 0.8)
        dist = np.minimum(np.abs(t - c), period - np.abs(t - c))
        prof = prof + d * np.clip(1 - dist / w, 0, 1)
    prof = (prof - prof.min()) / (prof.max() - prof.min() + 1e-9)
    return prof * amp


def silhouette(seed=7, amp=4.0):
    rng = np.random.default_rng(seed)
    s = SIZE * SS
    top = periodic_profile(rng, SIZE, TILE, amp) + INSET
    bottom = periodic_profile(rng, SIZE, TILE, amp) + INSET
    left = periodic_profile(rng, SIZE, TILE, amp) + INSET
    right = periodic_profile(rng, SIZE, TILE, amp) + INSET
    y, x = np.mgrid[0:s, 0:s]
    xf = (x + 0.5) / SS
    yf = (y + 0.5) / SS
    xi = np.clip(xf.astype(int), 0, SIZE - 1)
    yi = np.clip(yf.astype(int), 0, SIZE - 1)
    inside = (yf >= top[xi]) & (yf <= SIZE - bottom[xi]) & (xf >= left[yi]) & (xf <= SIZE - right[yi])
    # rounded corners on the base rectangle
    lo, hi = INSET + amp * 0.35, SIZE - INSET - amp * 0.35
    cx = np.clip(xf, lo + RADIUS, hi - RADIUS)
    cy = np.clip(yf, lo + RADIUS, hi - RADIUS)
    inside &= (xf - cx) ** 2 + (yf - cy) ** 2 <= RADIUS ** 2
    return inside


def to_image(mask_bool):
    img = Image.fromarray((mask_bool * 255).astype(np.uint8), "L")
    return img.resize((SIZE, SIZE), Image.Resampling.BOX)


def grow(mask_bool, px):
    img = Image.fromarray((mask_bool * 255).astype(np.uint8), "L")
    k = 2 * int(px * SS) + 1
    return np.asarray(img.filter(ImageFilter.MaxFilter(k))) > 127


def shrink(mask_bool, px):
    img = Image.fromarray((mask_bool * 255).astype(np.uint8), "L")
    k = 2 * int(px * SS) + 1
    return np.asarray(img.filter(ImageFilter.MinFilter(k))) > 127


def save_white(alpha_img, path):
    a = np.asarray(alpha_img, dtype=np.uint8)
    out = Image.new("RGBA", (a.shape[1], a.shape[0]), (255, 255, 255, 0))
    out.putalpha(Image.fromarray(a))
    out.save(path, optimize=True)


def sheet_layers(out):
    sil = silhouette()
    save_white(to_image(sil), out / "sheet.png")
    save_white(to_image(grow(sil, 2)), out / "sheet-edge.png")
    rim = shrink(sil, 4) & ~shrink(sil, 5.5)
    save_white(to_image(rim), out / "sheet-rim.png")


def torn_foot(out):
    rng = np.random.default_rng(23)
    w, h = 1024, 40
    period = 256
    prof = periodic_profile(rng, w, period, 11, jag_step=5, soft_step=32) + 9
    # break the repeat: blend with a second, offset profile so a wide banner does not show the period
    prof2 = np.roll(periodic_profile(rng, w, 341, 8, jag_step=6, soft_step=40), 97)
    line = 0.6 * prof + 0.4 * (prof2 + 10)
    s = h * SS
    y = (np.mgrid[0:s, 0:w * SS][0] + 0.5) / SS
    xcol = np.minimum((np.arange(w * SS) // SS), w - 1)
    mask = y >= line[xcol][None, :]
    img = Image.fromarray((mask * 255).astype(np.uint8), "L").resize((w, h), Image.Resampling.BOX)
    save_white(img, out / "torn-foot.png")
    save_white(img.transpose(Image.Transpose.FLIP_TOP_BOTTOM), out / "torn-lip.png")


def stain(out):
    rng = np.random.default_rng(41)
    n = 256
    def cloud(cells):
        c = rng.random((cells, cells))
        c = np.tile(c, (3, 3))
        im = Image.fromarray((c * 255).astype(np.uint8)).resize((n * 3, n * 3), Image.Resampling.BICUBIC)
        return np.asarray(im, dtype=float)[n:2 * n, n:2 * n] / 255
    field = 0.6 * cloud(4) + 0.3 * cloud(9) + 0.1 * cloud(24)
    field = (field - field.min()) / (field.max() - field.min())
    alpha = np.clip((field - 0.35) * 1.8, 0, 1) * 70
    save_white(Image.fromarray(alpha.astype(np.uint8), "L"), out / "stain.png")


def contact(out, art):
    sheet = Image.new("RGBA", (980, 520), (43, 67, 75, 255))
    def tint(path, color):
        im = Image.open(path).convert("RGBA")
        solid = Image.new("RGBA", im.size, color)
        solid.putalpha(im.getchannel("A"))
        return solid
    s = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    for layer, col in (("sheet-edge.png", (11, 17, 22, 255)), ("sheet.png", (59, 91, 106, 255)), ("sheet-rim.png", (90, 131, 150, 255))):
        s.alpha_composite(tint(out / layer, col))
    # nine-slice demo at 300x180
    demo = Image.new("RGBA", (300, 180), (0, 0, 0, 0))
    def piece(layer_img, box, dest, size):
        demo_part = layer_img.crop(box).resize(size, Image.Resampling.NEAREST)
        demo.alpha_composite(demo_part, dest)
    for layer_img in [s]:
        w, h = 300, 180
        c = CORNER
        piece(layer_img, (0, 0, c, c), (0, 0), (c, c))
        piece(layer_img, (SIZE - c, 0, SIZE, c), (w - c, 0), (c, c))
        piece(layer_img, (0, SIZE - c, c, SIZE), (0, h - c), (c, c))
        piece(layer_img, (SIZE - c, SIZE - c, SIZE, SIZE), (w - c, h - c), (c, c))
        # tiled middles
        for x0 in range(c, w - c, TILE):
            span = min(TILE, w - c - x0)
            demo.alpha_composite(layer_img.crop((c, 0, c + span, c)), (x0, 0))
            demo.alpha_composite(layer_img.crop((c, SIZE - c, c + span, SIZE)), (x0, h - c))
        for y0 in range(c, h - c, TILE):
            span = min(TILE, h - c - y0)
            demo.alpha_composite(layer_img.crop((0, c, c, c + span)), (0, y0))
            demo.alpha_composite(layer_img.crop((SIZE - c, c, SIZE, c + span)), (w - c, y0))
        # center fill
        fill = Image.new("RGBA", (w - 2 * c, h - 2 * c), (59, 91, 106, 255))
        demo.alpha_composite(fill, (c, c))
    sheet.alpha_composite(s, (20, 20))
    sheet.alpha_composite(demo, (270, 20))
    foot = tint(out / "torn-foot.png", (20, 32, 42, 255))
    bg = Image.new("RGBA", (940, 40), (164, 140, 106, 255))
    bg.alpha_composite(foot.crop((0, 0, 940, 40)))
    sheet.alpha_composite(bg, (20, 270))
    st = tint(out / "stain.png", (248, 240, 224, 255))
    sheet.alpha_composite(st, (20, 330))
    sheet.save(art / "fx-sheet.png")


if __name__ == "__main__":
    art = Path(__file__).resolve().parent
    out = art.parent / "src" / "Images" / "fx"
    out.mkdir(parents=True, exist_ok=True)
    sheet_layers(out)
    torn_foot(out)
    stain(out)
    contact(out, art)
    print("wrote", sorted(p.name for p in out.glob("*.png")))
