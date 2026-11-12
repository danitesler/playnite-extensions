#!/usr/bin/env python3
"""Cuts the bundled faces into src/Typography: static instances only (WPF ignores variation axes) and only the
weights Hallowtide sets. Sources are the open fonts in scripts/fonts (SIL OFL). Run from anywhere:

    python art/fonts.py && python scripts/subset-theme-fonts.py src/themes/Hallowtide/src/Typography/*.ttf

Faces: Cinzel SemiBold + Bold (page headings), Gelasio Regular + Bold (body), Barlow Semi Condensed Medium +
SemiBold (buttons, menus, prompts), Patrick Hand Regular (pinned notes).
"""
import os
import shutil

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", "..", "..", ".."))
FONTS = os.path.join(ROOT, "scripts", "fonts")
OUT = os.path.normpath(os.path.join(HERE, "..", "src", "Typography"))
os.makedirs(OUT, exist_ok=True)


def set_names(font, family, style, weight, bold=False, group=None):
    """Same naming pattern as the repo's other bundled statics: ID 1 carries the weight in the family when it is not
    Regular or Bold, ID 16/17 hold the real family and style."""
    name = font["name"]
    full = f"{family} {style}".strip() if style != "Regular" else family
    ps = f"{family.replace(' ', '')}-{style.replace(' ', '')}"
    for rec in list(name.names):
        if rec.nameID in (1, 2, 3, 4, 6, 16, 17, 21, 22, 25):
            name.removeNames(nameID=rec.nameID)
    plain = style in ("Regular", "Bold")
    name.setName(family if plain else f"{family} {style}", 1, 3, 1, 0x409)
    name.setName(style if plain else "Regular", 2, 3, 1, 0x409)
    name.setName(f"{family} {style} {ps}", 3, 3, 1, 0x409)
    name.setName(f"{family} {style}", 4, 3, 1, 0x409)
    name.setName(ps, 6, 3, 1, 0x409)
    if not plain:
        name.setName(family, 16, 3, 1, 0x409)
        name.setName(style, 17, 3, 1, 0x409)
    os2 = font["OS/2"]
    os2.usWeightClass = weight
    sel = os2.fsSelection & ~(1 | 32 | 64 | 256)
    sel |= 32 if bold else 64
    sel |= 128
    os2.fsSelection = sel
    font["head"].macStyle = 1 if bold else 0


def instance(src, axes, out, family, style, weight, bold=False):
    font = TTFont(src)
    font = instancer.instantiateVariableFont(font, axes)
    set_names(font, family, style, weight, bold)
    font.save(os.path.join(OUT, out))
    print("wrote", out)


def copy(src, out):
    shutil.copyfile(src, os.path.join(OUT, out))
    print("copied", out)


instance(os.path.join(FONTS, "cinzel", "Cinzel[wght].ttf"), {"wght": 600}, "Cinzel-SemiBold.ttf", "Cinzel", "SemiBold", 600)
instance(os.path.join(FONTS, "cinzel", "Cinzel[wght].ttf"), {"wght": 700}, "Cinzel-Bold.ttf", "Cinzel", "Bold", 700, bold=True)
instance(os.path.join(FONTS, "gelasio", "Gelasio[wght].ttf"), {"wght": 400}, "Gelasio-Regular.ttf", "Gelasio", "Regular", 400)
instance(os.path.join(FONTS, "gelasio", "Gelasio[wght].ttf"), {"wght": 700}, "Gelasio-Bold.ttf", "Gelasio", "Bold", 700, bold=True)
copy(os.path.join(FONTS, "barlowsemicondensed", "BarlowSemiCondensed-Medium.ttf"), "BarlowSemiCondensed-Medium.ttf")
copy(os.path.join(FONTS, "barlowsemicondensed", "BarlowSemiCondensed-SemiBold.ttf"), "BarlowSemiCondensed-SemiBold.ttf")
copy(os.path.join(FONTS, "patrickhand", "PatrickHand-Regular.ttf"), "PatrickHand-Regular.ttf")

# One license file covers the folder; each family's own OFL is appended so nothing is dropped.
with open(os.path.join(OUT, "OFL.txt"), "w", encoding="utf-8") as lic:
    for fam, folder in (("Cinzel", "cinzel"), ("Gelasio", "gelasio"), ("Barlow Semi Condensed", "barlowsemicondensed"), ("Patrick Hand", "patrickhand")):
        with open(os.path.join(FONTS, folder, "OFL.txt"), encoding="utf-8", errors="replace") as f:
            lic.write(f"==== {fam} ====\n")
            lic.write(f.read().strip() + "\n\n")
print("wrote OFL.txt")
