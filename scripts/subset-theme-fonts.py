#!/usr/bin/env python3
"""Trims bundled theme fonts (src/<Theme>/src/Typography/*.ttf) to Latin and Cyrillic, in place.

Keeps every OpenType feature (kerning included), hinting and the name table. Glyphs outside the ranges below fall back
to the next font in the XAML stack, per character. Only for fonts whose license allows modified copies under the same
name: not Orbitron (Reserved Font Name), whose official files ship unmodified. Needs fontTools (pip install fonttools).

    python scripts/subset-theme-fonts.py src/themes/Ayywi/src/Typography/Unbounded-*.ttf
"""
import sys, os
from fontTools import subset
from fontTools.ttLib import TTFont

# Latin (Basic, Latin-1, Extended A/B, Extended Additional), Cyrillic (+ Supplement, Extended), spacing and combining
# marks, punctuation, currency, letterlike symbols, arrows, math operators, BOM and replacement char.
UNICODES = "U+0000-024F,U+02B0-036F,U+0400-052F,U+1C80-1C8F,U+1E00-1EFF,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-21FF,U+2200-22FF,U+2C60-2C7F,U+A640-A69F,U+A720-A7FF,U+FEFF,U+FFFD"

opts = subset.Options()
opts.layout_features = ["*"]
opts.name_IDs = ["*"]
opts.name_languages = ["*"]
opts.name_legacy = True
opts.notdef_outline = True
opts.glyph_names = True
opts.hinting = True
opts.legacy_kern = True
opts.drop_tables = []

for path in sys.argv[1:]:
    before = os.path.getsize(path)
    font = TTFont(path)
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(UNICODES))
    s.subset(font)
    font.save(path)
    print(f"{path}: {before // 1024} KB -> {os.path.getsize(path) // 1024} KB, {len(font.getBestCmap())} chars")
