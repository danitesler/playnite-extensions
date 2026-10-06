#!/usr/bin/env python3
"""Overworld icons from Pixelarticons (MIT, halfmage/pixelarticons, pinned below).

The same open pixel set the Biome theme uses, drawn on a 24px grid in whole-pixel rectangles and read here as the
closest open set to a pixel-art game UI. The game's own icons are Mojang's artwork and are not used.

  python3 src/themes/Overworld/art/icons.py [--svg-dir <pixelarticons/svg>]

Writes:
  src/Media.xaml             the Icon<Role> geometries (24x24 grid), spliced in between the icons:start/end markers
  src/Images/Pixel/*.png     menu icons Media.xaml maps Playnite's *Icon keys to, 48px (2x, crisp pixels)

Without --svg-dir the SVGs are fetched from GitHub at REF. PNG colors are tokens from src/tokens.css (white, gold,
red); re-run after changing them. Needs cairosvg. The add-on tile mark (art/mark.svg) is separate hand-authored art.
"""
import argparse
import os
import re
import urllib.request

import cairosvg

REF = "8275e0af7c16aa40c54ea2b90b7af83b1fe4eb4c"  # pixelarticons 2.4.1
URL = "https://raw.githubusercontent.com/halfmage/pixelarticons/{ref}/svg/{name}.svg"

HERE = os.path.dirname(os.path.abspath(__file__))
THEME = os.path.dirname(HERE)
MEDIA = os.path.join(THEME, "src", "Media.xaml")

# Icon<Role> geometries drawn by IconTemplate.
GEOMETRIES = [
    ("search", "Search"), ("close", "Clear"), ("sliders", "ViewSettings"), ("bookmark", "FilterPresets"),
    ("blocks", "Group"), ("sort-vertical", "Sort"), ("layout", "DetailsView"), ("grid-3x3", "GridView"),
    ("bulletlist", "ListView"), ("download", "Update"), ("folder", "Explorer"), ("sparkles", "Random"),
    ("shuffle", "ViewRandom"), ("filter", "Filter"), ("bell", "Notifications"), ("gamepad", "Library"),
    ("chart", "Statistics"), ("minus", "WindowMinimize"), ("square", "WindowMaximize"),
    ("copy", "WindowRestore"), ("close", "WindowClose"), ("chevron-down", "DropDown"),
    ("chevron-right", "Submenu"), ("check", "Check"), ("plus", "Add"), ("pencil", "Edit"), ("trash", "Remove"),
    ("more-horizontal", "Options"), ("play", "Play"), ("info-box", "Info"), ("menu", "MainMenu"),
]

# Playnite menu icons (file name, pixelarticons name, src/tokens.css color token).
MENU = [
    ("fullscreen", "expand", "white"), ("add", "plus", "white"), ("sync", "reload", "white"),
    ("info", "info-box", "white"), ("settings", "settings-cog", "white"),
    ("extension", "blocks", "white"), ("play", "play", "white"), ("download", "download", "white"),
    ("link", "link", "white"), ("folder", "folder", "white"), ("storage", "save", "white"),
    ("desktop", "monitor", "white"), ("star", "star", "gold"), ("star-off", "star", "white"),
    ("hide", "eye-off", "white"), ("unhide", "eye", "white"), ("hdr", "badge-hd", "white"),
    ("edit", "pencil", "white"), ("delete-danger", "trash", "red"), ("dice", "sparkles", "white"),
    ("manual", "book-open", "white"), ("backup", "archive", "white"), ("restore", "reload", "white"),
    ("power-danger", "power", "red"),
]


def tokens():
    css = open(os.path.join(THEME, "src", "tokens.css"), encoding="utf-8").read()
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"--([\w-]+):\s*([^;]+);", css)}


def load(name, svg_dir):
    if svg_dir:
        return open(os.path.join(svg_dir, name + ".svg"), encoding="utf-8").read()
    with urllib.request.urlopen(URL.format(ref=REF, name=name)) as r:
        return r.read().decode("utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--svg-dir")
    args = ap.parse_args()
    tok = tokens()

    lines = []
    for src, role in GEOMETRIES:
        paths = re.findall(r'<path[^>]*\sd="([^"]+)"', load(src, args.svg_dir))
        lines.append(f'    <Geometry x:Key="Icon{role}">F1 {" ".join(paths)}</Geometry> <!-- {src} -->')

    text = open(MEDIA, encoding="utf-8").read()
    start, end = "<!-- icons:start -->", "<!-- icons:end -->"
    block = start + "\n" + "\n".join(lines) + "\n    " + end
    i, j = text.index(start), text.index(end) + len(end)
    open(MEDIA, "w", encoding="utf-8").write(text[:i] + block + text[j:])

    out = os.path.join(THEME, "src", "Images", "Pixel")
    os.makedirs(out, exist_ok=True)
    for file, src, color in MENU:
        svg = load(src, args.svg_dir).replace("currentColor", tok[color])
        cairosvg.svg2png(bytestring=svg.encode(), write_to=os.path.join(out, file + ".png"),
                         output_width=48, output_height=48)
    print(f"wrote {len(lines)} geometries and {len(MENU)} PNGs")


if __name__ == "__main__":
    main()
