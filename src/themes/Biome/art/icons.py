#!/usr/bin/env python3
"""Biome icons from Pixelarticons (MIT, halfmage/pixelarticons, pinned below).

Pixelarticons draw on a 24px grid in whole-pixel rectangles, the closest open set to Terraria's pixel-art UI.
The game's own icons are Re-Logic's artwork and are not used.

  python3 src/themes/Biome/art/icons.py [--svg-dir <pixelarticons/svg>]

Writes:
  art/icons.generated.xaml   Icon<Role> geometries (24x24 grid) to paste into src/Media.xaml
  art/mark.svg               the add-on tile mark, for scripts/render-addon-icon.py
  src/Images/Pixel/*.png     menu icons Media.xaml maps Playnite's *Icon keys to, 48px (2x, crisp pixels)

Without --svg-dir the SVGs are fetched from GitHub at REF. PNG colors are tokens from src/tokens.css
(text, coin-gold, rarity-red); re-run after changing them. Needs cairosvg.
"""
import argparse
import io
import os
import re
import urllib.request

import cairosvg

REF = "8275e0af7c16aa40c54ea2b90b7af83b1fe4eb4c"  # pixelarticons 2.4.1
URL = "https://raw.githubusercontent.com/halfmage/pixelarticons/{ref}/svg/{name}.svg"

HERE = os.path.dirname(os.path.abspath(__file__))
THEME = os.path.dirname(HERE)

# Icon<Role> geometries drawn by IconTemplate. IconMainMenu is the theme's own mark (Media.xaml), not from the set.
GEOMETRIES = [
    ("search", "Search"), ("close", "Clear"), ("sliders", "ViewSettings"), ("bookmark", "FilterPresets"),
    ("blocks", "Group"), ("sort-vertical", "Sort"), ("layout", "DetailsView"), ("grid-3x3", "GridView"),
    ("bulletlist", "ListView"), ("download", "Update"), ("folder", "Explorer"), ("sparkles", "Random"),
    ("shuffle", "ViewRandom"), ("filter", "Filter"), ("bell", "Notifications"), ("gamepad", "Library"),
    ("chart", "Statistics"), ("minus", "WindowMinimize"), ("square", "WindowMaximize"),
    ("copy", "WindowRestore"), ("close", "WindowClose"), ("chevron-down", "DropDown"),
    ("chevron-right", "Submenu"), ("check", "Check"), ("plus", "Add"), ("pencil", "Edit"), ("trash", "Remove"),
    ("more-horizontal", "Options"), ("play", "Play"), ("info-box", "Info"),
]

# Playnite menu icons (file name, pixelarticons name, color token).
MENU = [
    ("fullscreen", "expand", "text"), ("add", "plus", "text"), ("sync", "reload", "text"),
    ("info", "info-box", "text"), ("settings", "settings-cog", "text"),
    ("extension", "blocks", "text"), ("play", "play", "text"), ("download", "download", "text"),
    ("link", "link", "text"), ("folder", "folder", "text"), ("storage", "save", "text"),
    ("desktop", "monitor", "text"), ("star", "star", "coin-gold"), ("star-off", "star", "text"),
    ("hide", "eye-off", "text"), ("unhide", "eye", "text"), ("hdr", "badge-hd", "text"),
    ("edit", "pencil", "text"), ("delete-danger", "trash", "rarity-red"), ("dice", "sparkles", "text"),
    ("manual", "book-open", "text"), ("backup", "archive", "text"), ("restore", "reload", "text"),
    ("power-danger", "power", "rarity-red"),
]


# The theme's own mark: a pixel-art tree on a strip of ground, drawn here by hand on a 16px grid (not game art).
# It is the add-on tile (art/mark.svg) and IconMainMenu (Media.xaml).
MARK = """
................
.....######.....
...##########...
..############..
..############..
.##############.
.##############.
..############..
...##########...
.....##..##.....
......####......
.......##.......
.......##.......
.......##.......
..############..
................
"""


def mark_rects():
    rows = MARK.strip("\n").split("\n")
    for y, row in enumerate(rows):
        for m in re.finditer(r"#+", row):
            yield m.start(), y, m.end() - m.start()


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
    rects = list(mark_rects())
    lines.append('    <Geometry x:Key="IconMainMenu">F1 ' +
                 " ".join(f"M{x * 1.5:g},{y * 1.5:g}h{w * 1.5:g}v1.5h-{w * 1.5:g}z" for x, y, w in rects) +
                 "</Geometry> <!-- mark, 16 grid scaled onto 24 -->")
    with open(os.path.join(HERE, "icons.generated.xaml"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    with open(os.path.join(HERE, "mark.svg"), "w", encoding="utf-8") as f:
        f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">\n')
        f.write("".join(f'  <rect x="{x}" y="{y}" width="{w}" height="1" fill="#000"/>\n' for x, y, w in rects))
        f.write("</svg>\n")

    out = os.path.join(THEME, "src", "Images", "Pixel")
    os.makedirs(out, exist_ok=True)
    for file, src, color in MENU:
        svg = load(src, args.svg_dir).replace("currentColor", tok[color])
        cairosvg.svg2png(bytestring=svg.encode(), write_to=os.path.join(out, file + ".png"),
                         output_width=48, output_height=48)
    print(f"wrote {len(lines)} geometries and {len(MENU)} PNGs")


if __name__ == "__main__":
    main()
