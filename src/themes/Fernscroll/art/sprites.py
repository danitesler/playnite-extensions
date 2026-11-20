#!/usr/bin/env python3
"""Fernscroll sprites: deterministic white masks (RGB 255, effect in alpha) written to src/Images/fx/.

Generates:
  paper-grain.png      256x256  seamless cold-press watercolor parchment tooth & delicate fibers
  plaque-distress.png  256x128  seamless storybook ink distressing & tiny paper print specks for dark plaques
  taper-rule.png       360x10   hand-drawn tapered pen divider stroke (thick center, delicate needle ends)
  scroll-thumb.png     16x96    tapered vertical pen-needle scrollbar stroke (9-slice / stretched)
  deckle-edge.png      256x64   9-slice softly torn watercolor parchment plate edge
  bloom.png            320x112  9-slice warm sunbeam/watercolor aura bloom behind Play and hovered tiles
  melody-wisps.png     320x120  seamless melodic staff wisps & drifting eighth-notes for Running/Empty states

Also writes art/fx-sheet.png for visual inspection. Run from repo or theme root:
  python src/themes/Fernscroll/art/sprites.py
"""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "Images" / "fx"
OUT.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(2024)  # 2024 release year


def save(name, alpha):
    a = np.clip(alpha, 0.0, 1.0)
    rgba = np.dstack([np.full(a.shape, 255, np.uint8)] * 3 + [(a * 255.0 + 0.5).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(OUT / f"{name}.png", optimize=True, dpi=(96, 96))
    return a


def smooth(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def noise1(n, scale, wrap=True):
    knots = max(2, int(round(n / scale)))
    v = RNG.random(knots + 1)
    if wrap:
        v[-1] = v[0]
    x = np.arange(n) / n * knots
    i = np.floor(x).astype(int)
    t = smooth(x - i)
    return v[i] * (1.0 - t) + v[np.minimum(i + 1, knots)] * t


def noise2(w, h, sx, sy):
    gw, gh = max(2, int(round(w / sx))), max(2, int(round(h / sy)))
    g = RNG.random((gh, gw))
    ys, xs = np.arange(h) / h * gh, np.arange(w) / w * gw
    yi, xi = np.floor(ys).astype(int), np.floor(xs).astype(int)
    ty, tx = smooth(ys - yi), smooth(xs - xi)
    y1, x1 = (yi + 1) % gh, (xi + 1) % gw
    a = g[yi][:, xi] * (1.0 - tx) + g[yi][:, x1] * tx
    b = g[y1][:, xi] * (1.0 - tx) + g[y1][:, x1] * tx
    return a * (1.0 - ty[:, None]) + b * ty[:, None]


def make_paper_grain():
    """Seamless 256x256 cold-press watercolor paper tooth and subtle cotton fibers."""
    w, h = 256, 256
    coarse = noise2(w, h, 48, 48)
    mid = noise2(w, h, 16, 16)
    tooth = noise2(w, h, 5, 5)
    fine = RNG.random((h, w)).astype(np.float32)
    base = 0.22 * coarse + 0.30 * mid + 0.28 * tooth + 0.20 * fine

    img = Image.new("L", (w, h), 0)
    dr = ImageDraw.Draw(img)
    for _ in range(110):
        px = float(RNG.uniform(0, w))
        py = float(RNG.uniform(0, h))
        ang = float(RNG.uniform(0, math.pi * 2))
        ln = float(RNG.uniform(6, 18))
        pts = [(px, py)]
        for _ in range(4):
            ang += float(RNG.uniform(-0.4, 0.4))
            px += math.cos(ang) * (ln / 4.0)
            py += math.sin(ang) * (ln / 4.0)
            pts.append((px, py))
        for ox in (-w, 0, w):
            for oy in (-h, 0, h):
                dr.line([(x + ox, y + oy) for x, y in pts], fill=80, width=1)
    fibers = np.asarray(img.filter(ImageFilter.GaussianBlur(0.4)), dtype=np.float32) / 255.0

    a = smooth((base - 0.36) / 0.50) * 0.34 + fibers * 0.32
    return save("paper-grain", np.clip(a, 0.0, 0.48))


def make_plaque_distress():
    """Seamless 256x128 vintage print distressing flecks & fine paper scratches for dark plaques."""
    w, h = 256, 128
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.zeros((h, w), dtype=np.float32)

    # Fine isotropic print grain (zero blocky low-res grid artifacts)
    fine_a = RNG.random((h, w)).astype(np.float32)
    fine_b = noise2(w, h, 3, 3)
    a += np.clip((0.6 * fine_a + 0.4 * fine_b - 0.78) / 0.22, 0.0, 1.0) * 0.22

    # Tiny storybook paper dust flecks (wrapped seamlessly)
    for _ in range(180):
        cx = float(RNG.uniform(0, w))
        cy = float(RNG.uniform(0, h))
        r = float(RNG.uniform(0.35, 1.05))
        strength = float(RNG.uniform(0.28, 0.72))
        for ox in (-w, 0, w):
            for oy in (-h, 0, h):
                d = np.hypot(x - (cx + ox), y - (cy + oy))
                a = np.maximum(a, smooth((r - d + 0.45) / 0.85) * strength)

    # Subtle short hand-print hairline nicks
    img = Image.new("L", (w, h), 0)
    dr = ImageDraw.Draw(img)
    for _ in range(28):
        px = float(RNG.uniform(0, w))
        py = float(RNG.uniform(0, h))
        ang = float(RNG.uniform(-0.35, 0.35))
        ln = float(RNG.uniform(4, 14))
        x2, y2 = px + math.cos(ang) * ln, py + math.sin(ang) * ln
        val = int(RNG.integers(75, 150))
        for ox in (-w, 0, w):
            for oy in (-h, 0, h):
                dr.line([(px + ox, py + oy), (x2 + ox, y2 + oy)], fill=val, width=1)
    nicks = np.asarray(img, dtype=np.float32) / 255.0
    a = np.maximum(a, nicks)

    return save("plaque-distress", np.clip(a, 0.0, 0.80))


def make_taper_rule():
    """360x10 hand-drawn tapered pen horizontal divider stroke."""
    w, h = 360, 10
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = x / (w - 1.0)
    # Taper smoothly from 0 at ends to ~1.4px half-width in center with subtle hand wobble
    taper = np.maximum(0.0, np.sin(np.pi * u)) ** 0.55
    wobble = (noise1(w, 28, wrap=False) - 0.5) * 0.9 + (noise1(w, 8, wrap=False) - 0.5) * 0.35
    cy = h / 2.0 + wobble[None, :]
    half_thick = 0.25 + 1.15 * taper
    dist = np.abs(y - cy)
    tooth = 0.85 + 0.15 * noise2(w, h, 8, 3)
    a = smooth((half_thick - dist + 0.8) / 1.4) * taper * tooth
    return save("taper-rule", a)


def make_scroll_thumb():
    """16x96 tapered hand-inked vertical scrollbar needle stroke (like Audio screen)."""
    w, h = 16, 96
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    v = y / (h - 1.0)
    # Taper at top & bottom over 18% of length; slightly organic center wobble
    end_taper = np.minimum(1.0, np.minimum(v / 0.14, (1.0 - v) / 0.14)) ** 0.65
    wobble = (noise1(h, 18, wrap=False) - 0.5) * 0.7
    cx = w / 2.0 + wobble[:, None]
    half_thick = 0.35 + 1.95 * end_taper
    dist = np.abs(x - cx)
    a = smooth((half_thick - dist + 0.6) / 1.1) * end_taper
    return save("scroll-thumb", a)


def make_deckle_edge():
    """256x64 9-slice subtly deckled watercolor paper plate (32px side/14px top-bot caps, solid core)."""
    w, h = 256, 64
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)

    top_wobble = 4.5 + (noise1(w, 16) - 0.5) * 3.5 + (noise1(w, 5) - 0.5) * 1.6
    bot_wobble = h - 4.5 + (noise1(w, 16) - 0.5) * 3.5 + (noise1(w, 5) - 0.5) * 1.6
    left_wobble = 6.0 + (noise1(h, 12, wrap=False) - 0.5) * 5.0 + (noise1(h, 4, wrap=False) - 0.5) * 2.0
    right_wobble = w - 6.0 + (noise1(h, 12, wrap=False) - 0.5) * 5.0 + (noise1(h, 4, wrap=False) - 0.5) * 2.0

    vmask = smooth((y - top_wobble[None, :] + 2.0) / 3.2) * smooth((bot_wobble[None, :] - y + 2.0) / 3.2)
    hmask = smooth((x - left_wobble[:, None] + 2.5) / 4.2) * smooth((right_wobble[:, None] - x + 2.5) / 4.2)

    # Subtle watercolor edge bleed modulation without hurting center readability (center >= 0.96)
    core_tooth = 0.96 + 0.04 * noise2(w, h, 16, 12)
    a = vmask * hmask * core_tooth
    return save("deckle-edge", a)


def make_bloom():
    """Soft 9-slice sunbeam/watercolor aura glow: 320x112 with 28px squared falloff."""
    w, h, pad = 320, 112, 28
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = np.maximum(np.maximum(pad - x, x - (w - 1 - pad)), 0.0)
    dy = np.maximum(np.maximum(pad - y, y - (h - 1 - pad)), 0.0)
    d = np.hypot(dx, dy)
    return save("bloom", (np.clip(1.0 - d / pad, 0.0, 1.0) ** 2) * 0.85)


def draw_eighth_note(cx, cy, scale, angle_deg, size, ss=4):
    """Draw a hand-inked tilted musical eighth-note silhouette at (cx, cy)."""
    w, h = size
    img = Image.new("L", (w * ss, h * ss), 0)
    dr = ImageDraw.Draw(img)
    rad = math.radians(angle_deg)
    ca, sa = math.cos(rad), math.sin(rad)

    def xform(px, py):
        rx = (cx + (px * ca - py * sa) * scale) * ss
        ry = (cy + (px * sa + py * ca) * scale) * ss
        return (rx, ry)

    # Note head (tilted oval)
    head_pts = []
    for k in range(24):
        t = k / 24.0 * 2.0 * math.pi
        hx = -2.2 + 3.2 * math.cos(t) * math.cos(-0.4) - 2.1 * math.sin(t) * math.sin(-0.4)
        hy = 5.5 + 3.2 * math.cos(t) * math.sin(-0.4) + 2.1 * math.sin(t) * math.cos(-0.4)
        head_pts.append(xform(hx, hy))
    dr.polygon(head_pts, fill=255)

    # Stem + curved flag
    stem_pts = [
        xform(0.2, 5.2), xform(0.2, -7.2), xform(1.8, -7.2),
        xform(4.8, -4.6), xform(6.4, -1.2), xform(4.8, 1.2),
        xform(4.2, -1.6), xform(2.4, -3.6), xform(1.8, -3.6),
        xform(1.8, 5.2),
    ]
    dr.polygon(stem_pts, fill=255)
    return np.asarray(img.resize((w, h), Image.LANCZOS), dtype=np.float32) / 255.0


def make_melody_wisps():
    """Seamless 320x120 horizontal tile: gentle melodic staff waves + drifting eighth-notes."""
    w, h = 320, 120
    x = np.arange(w, dtype=np.float32)[None, :]
    y = np.arange(h, dtype=np.float32)[:, None]
    a = np.zeros((h, w), dtype=np.float32)

    lines = [
        (28.0, 6.0, 1, 1.3, 0.50, 0.0),
        (52.0, 8.0, 2, 1.7, 0.68, 1.0),
        (76.0, 7.0, 1, 1.4, 0.55, 2.1),
        (98.0, 5.5, 2, 1.2, 0.42, 0.7),
    ]
    for y0, amp, freq, thick, strength, phase in lines:
        cy = y0 + amp * np.sin(2.0 * np.pi * freq * x / w + phase)
        dist = np.abs(y - cy)
        env = 0.25 + 0.75 * np.maximum(0.0, np.sin(np.pi * x / w + phase)) ** 1.3
        a = np.maximum(a, np.exp(-((dist / thick) ** 2)) * env * strength)

    notes = [
        (56, 40, 0.85, -8, 0.85),
        (162, 66, 0.95, 10, 0.92),
        (264, 34, 0.78, -12, 0.78),
    ]
    for nx, ny, sc, ang, alpha in notes:
        a = np.maximum(a, draw_eighth_note(nx, ny, sc, ang, (w, h)) * alpha)

    return save("melody-wisps", a)


def make_sheet(parts):
    pad = 16
    width = max(p.shape[1] for _, p in parts) + pad * 2
    height = sum(p.shape[0] + pad + 18 for _, p in parts) + pad
    img = Image.new("RGB", (width, height), (237, 235, 214))  # mv-paper backdrop
    dr = ImageDraw.Draw(img)
    y = pad
    tints = {
        "paper-grain": (58, 46, 43),        # mv-ink
        "plaque-distress": (251, 249, 235), # mv-cream flecks on plum
        "taper-rule": (58, 46, 43),         # mv-ink
        "scroll-thumb": (59, 44, 47),       # mv-plum
        "deckle-edge": (51, 97, 73),        # mv-pine
        "bloom": (226, 168, 75),            # mv-gold
        "melody-wisps": (42, 84, 126),      # mv-indigo
    }
    for name, a in parts:
        dr.text((pad, y), f"{name}  {a.shape[1]}x{a.shape[0]}  peak {a.max():.2f}", fill=(38, 29, 23))
        y += 16
        h, w = a.shape
        bg = np.array([59, 44, 47] if name == "plaque-distress" else [237, 235, 214], np.float32)
        fg = np.array(tints[name], np.float32)
        rgb = bg[None, None, :] * (1.0 - a[..., None]) + fg[None, None, :] * a[..., None]
        tile = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
        img.paste(tile, (pad, y))
        y += h + pad
    img.save(ROOT / "art" / "fx-sheet.png", optimize=True)


def main():
    parts = [
        ("paper-grain", make_paper_grain()),
        ("plaque-distress", make_plaque_distress()),
        ("taper-rule", make_taper_rule()),
        ("scroll-thumb", make_scroll_thumb()),
        ("deckle-edge", make_deckle_edge()),
        ("bloom", make_bloom()),
        ("melody-wisps", make_melody_wisps()),
    ]
    make_sheet(parts)
    print(f"Generated {len(parts)} sprites in {OUT} and {ROOT / 'art' / 'fx-sheet.png'}")


if __name__ == "__main__":
    main()
