#!/usr/bin/env python3
"""Builds art/preview-details.html and art/preview-settings.html from their .src.html sources.

The sources reference Phosphor bold icons as <use href="#name"/>; this script inlines each one once as a <symbol> (same
pinned set as art/icons.py), so the previews render without network or cache. Textures load from ../src/Images.

    python3 art/previews.py      (from src/themes/Cordon), then .\\scripts\\take-screenshots.ps1 -Extension cordon
"""
import pathlib
import re

from icons import fetch

ART = pathlib.Path(__file__).resolve().parent

for name in ("preview-details", "preview-settings"):
    src = (ART / (name + ".src.html")).read_text(encoding="utf-8")
    icons = sorted(set(re.findall(r'href="#([a-z0-9-]+)"', src)))
    symbols = []
    for icon in icons:
        paths = "".join('<path d="%s"/>' % d for d in re.findall(r'<path\b[^>]*?\bd="([^"]*)"', fetch(icon)))
        symbols.append('<symbol id="%s" viewBox="0 0 256 256">%s</symbol>' % (icon, paths))
    block = '<svg style="display:none" xmlns="http://www.w3.org/2000/svg">%s</svg>' % "".join(symbols)
    out = src.replace("<!--ICONS-->", block).replace(
        "Source for\n     %s.html: art/previews.py inlines the Phosphor bold icons." % name,
        "GENERATED from\n     %s.src.html by art/previews.py (Phosphor bold icons inlined): edit the source." % name)
    (ART / (name + ".html")).write_text(out, encoding="utf-8")
    print("wrote %s.html (%d icons)" % (name, len(icons)))
