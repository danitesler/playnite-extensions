#!/usr/bin/env python3
"""Tints the menu icons Playnite copies (src/Images/Lucide/*.png) for Slipstream's light page.

The PNGs are Lucide 1.49.0 strokes (ISC) rendered at 48px as single-colour images with the shape in alpha.
Playnite rebuilds menu icons from image files, so they cannot follow a brush; this script sets their RGB from
src/tokens.css and leaves alpha alone, so it can be run again after a token change:

    muted ink (ss-ink-muted)   every icon
    toggle red (ss-red)        *-destructive.png (exit, remove)
    stripe orange (ss-orange)  *-warning.png (favorites star)

    python art/tint-menu-icons.py        (from src/themes/Slipstream; needs Pillow and numpy)

No randomness. Not shipped in the package.
"""
import pathlib
import re

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICONS = ROOT / "src" / "Images" / "Lucide"


def token(name):
    css = (ROOT / "src" / "tokens.css").read_text(encoding="utf-8")
    m = re.search(r"--%s:\s*#([0-9a-fA-F]{6})" % re.escape(name), css)
    if not m:
        raise SystemExit("token not found: " + name)
    h = m.group(1)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def main():
    colors = {"destructive": token("ss-red"), "warning": token("ss-orange"), None: token("ss-ink-muted")}
    for f in sorted(ICONS.glob("*.png")):
        kind = next((k for k in ("destructive", "warning") if f.stem.endswith("-" + k)), None)
        a = np.array(Image.open(f).convert("RGBA"))
        a[..., :3] = colors[kind]
        Image.fromarray(a, "RGBA").save(f)
        print(f.name, kind or "muted")


if __name__ == "__main__":
    main()
