#!/usr/bin/env python3
"""Vector glyphs for the WoW Vanilla: the Icon* geometries in src/Media.xaml.

Original drawings on a 24x24 grid, one filled shape per icon (holes are wound the other way, fill rule NonZero).
The subjects are the props of the Vanilla interface (spellbook, hourglass, scroll, quill, dice, banner, gear).
Nothing here is traced from the game's icon files.

  python3 art/glyphs.py xaml     print the Geometry lines for Media.xaml
  python3 art/glyphs.py media    rewrite the glyph block of src/Media.xaml in place
  python3 art/glyphs.py preview  write art/glyphs-preview.html (open it in a browser)
"""
import math
import sys
from pathlib import Path

# ---------------------------------------------------------------------------------------------------------------
# Path building blocks. Filled shapes wind clockwise, holes counter-clockwise, so overlapping shapes merge (NonZero).
# ---------------------------------------------------------------------------------------------------------------


def n(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def area(pts):
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1])) / 2


def poly(pts, hole=False):
    # SVG y points down: a positive shoelace area is clockwise on screen.
    pts = list(pts)
    if (area(pts) > 0) == hole:
        pts.reverse()
    return "M" + " L".join(f"{n(x)},{n(y)}" for x, y in pts) + " Z"


def circle(cx, cy, r, hole=False):
    sweep = 0 if hole else 1
    return (f"M{n(cx - r)},{n(cy)} A{n(r)},{n(r)} 0 1 {sweep} {n(cx + r)},{n(cy)} "
            f"A{n(r)},{n(r)} 0 1 {sweep} {n(cx - r)},{n(cy)} Z")


def rrect(x, y, w, h, r, hole=False):
    r = min(r, w / 2, h / 2)
    a = n(r)
    if not hole:
        return (f"M{n(x + r)},{n(y)} H{n(x + w - r)} A{a},{a} 0 0 1 {n(x + w)},{n(y + r)} V{n(y + h - r)} "
                f"A{a},{a} 0 0 1 {n(x + w - r)},{n(y + h)} H{n(x + r)} A{a},{a} 0 0 1 {n(x)},{n(y + h - r)} "
                f"V{n(y + r)} A{a},{a} 0 0 1 {n(x + r)},{n(y)} Z")
    return (f"M{n(x + r)},{n(y)} A{a},{a} 0 0 0 {n(x)},{n(y + r)} V{n(y + h - r)} A{a},{a} 0 0 0 {n(x + r)},{n(y + h)} "
            f"H{n(x + w - r)} A{a},{a} 0 0 0 {n(x + w)},{n(y + h - r)} V{n(y + r)} A{a},{a} 0 0 0 {n(x + w - r)},{n(y)} Z")


def bar(x1, y1, x2, y2, half, hole=False):
    dx, dy = x2 - x1, y2 - y1
    ln = math.hypot(dx, dy)
    px, py = -dy / ln * half, dx / ln * half
    return poly([(x1 + px, y1 + py), (x2 + px, y2 + py), (x2 - px, y2 - py), (x1 - px, y1 - py)], hole=hole)


def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.sin(a), cy - r * math.cos(a)


def gear(cx, cy, teeth, r_out, r_root, hole_r):
    pts = []
    step = 360 / teeth
    for i in range(teeth):
        c = i * step
        for off, r in ((-0.36, r_root), (-0.2, r_out), (0.2, r_out), (0.36, r_root), (0.5, r_root)):
            pts.append(polar(cx, cy, r, c + off * step))
    return poly(pts) + " " + circle(cx, cy, hole_r, hole=True)


# ---------------------------------------------------------------------------------------------------------------
# The glyphs
# ---------------------------------------------------------------------------------------------------------------

X_SHAPE = bar(5.6, 5.6, 18.4, 18.4, 1.75) + " " + bar(18.4, 5.6, 5.6, 18.4, 1.75)

GLYPHS = {
    # Search: a lens with a stout handle
    "IconSearch": circle(10, 10, 7.2) + " " + circle(10, 10, 4.5, hole=True) + " " + bar(14.6, 14.6, 21.2, 21.2, 1.7),
    "IconClear": X_SHAPE,
    # View settings: a cogwheel
    "IconViewSettings": gear(12, 12, 8, 10.8, 8.2, 3.7),
    # Filter presets: a banner on its pole, swallow-tailed, with a device
    "IconFilterPresets": (rrect(4.5, 2.6, 15, 2.6, 1.1)
                          + " " + poly([(6, 5.2), (18, 5.2), (18, 21), (12, 16.4), (6, 21)])
                          + " " + circle(12, 10.6, 2.5, hole=True)),
    # Grouping: a stack of tomes
    "IconGroup": (rrect(3, 3.6, 18, 4.8, 1.3) + " " + rrect(5, 9.6, 16, 4.8, 1.3) + " " + rrect(3, 15.6, 18, 4.8, 1.3)
                  + " " + circle(17.6, 6, 0.95, hole=True) + " " + circle(6.8, 12, 0.95, hole=True)
                  + " " + circle(17.6, 18, 0.95, hole=True)),
    # Sorting: shrinking rows and a descending arrow
    "IconSort": (rrect(3, 5, 11.5, 2.7, 0.9) + " " + rrect(3, 10.6, 8.5, 2.7, 0.9) + " " + rrect(3, 16.2, 5.5, 2.7, 0.9)
                 + " " + poly([(17.4, 4), (20.4, 4), (20.4, 14), (23.4, 14), (18.9, 20.6), (14.4, 14), (17.4, 14)])),
    # Details view: an open spellbook
    "IconDetailsView": (poly([(2.2, 5.6), (11.3, 7.2), (11.3, 20), (2.2, 18.6)])
                        + " " + poly([(21.8, 5.6), (12.7, 7.2), (12.7, 20), (21.8, 18.6)])
                        + " " + poly([(4.2, 9.9), (9.4, 10.7), (9.4, 11.9), (4.2, 11.1)], hole=True)
                        + " " + poly([(4.2, 13.4), (9.4, 14.2), (9.4, 15.4), (4.2, 14.6)], hole=True)
                        + " " + poly([(19.8, 9.9), (14.6, 10.7), (14.6, 11.9), (19.8, 11.1)], hole=True)
                        + " " + poly([(19.8, 13.4), (14.6, 14.2), (14.6, 15.4), (19.8, 14.6)], hole=True)),
    # Grid view: bag slots
    "IconGridView": rrect(3, 3, 8.2, 8.2, 1.7) + " " + rrect(12.8, 3, 8.2, 8.2, 1.7) + " " + rrect(3, 12.8, 8.2, 8.2, 1.7) + " " + rrect(12.8, 12.8, 8.2, 8.2, 1.7),
    # List view: quest log rows with diamond bullets
    "IconListView": "".join(
        poly([(4.6, y), (6.2, y - 1.6), (7.8, y), (6.2, y + 1.6)]) + " " + rrect(10.2, y - 1.3, 10.8, 2.6, 0.9) + " "
        for y in (5.6, 12, 18.4)).strip(),
    # Update available: the quest marker
    "IconUpdate": poly([(9.6, 2.4), (14.4, 2.4), (13.4, 14.6), (10.6, 14.6)]) + " " + circle(12, 19, 2.3),
    # Explorer: a compass
    "IconExplorer": (circle(12, 12, 10) + " " + circle(12, 12, 7.9, hole=True)
                     + " " + poly([(12, 5.6), (13.7, 10.3), (18.4, 12), (13.7, 13.7), (12, 18.4), (10.3, 13.7), (5.6, 12), (10.3, 10.3)])),
    # Random game: a die
    "IconRandom": (rrect(3, 3, 18, 18, 3.6) + " " + circle(8, 8, 1.75, hole=True) + " " + circle(16, 8, 1.75, hole=True)
                   + " " + circle(12, 12, 1.75, hole=True) + " " + circle(8, 16, 1.75, hole=True) + " " + circle(16, 16, 1.75, hole=True)),
    # Random game from the view: two arrows passing
    "IconViewRandom": (rrect(3, 6.3, 12.4, 2.8, 0.9) + " " + poly([(13.6, 3.4), (21, 7.7), (13.6, 12)])
                       + " " + rrect(8.6, 14.9, 12.4, 2.8, 0.9) + " " + poly([(10.4, 12), (3, 16.3), (10.4, 20.6)])),
    # Filter: a funnel
    "IconFilter": poly([(2.8, 4.2), (21.2, 4.2), (14, 12.8), (14, 20.4), (10, 17.8), (10, 12.8)]),
    # Notifications: a letter
    "IconNotifications": (rrect(2.4, 4.8, 19.2, 14.4, 2.2)
                          + " " + poly([(3.9, 7), (5.1, 5.9), (12, 11.5), (18.9, 5.9), (20.1, 7), (12, 13.7)], hole=True)),
    # Main menu: three bars
    "IconMainMenu": rrect(3, 4.6, 18, 3, 1.1) + " " + rrect(3, 10.5, 18, 3, 1.1) + " " + rrect(3, 16.4, 18, 3, 1.1),
    # Library: a bound tome with a clasp
    "IconLibrary": (rrect(4.4, 2.8, 15.2, 18.4, 1.8)
                    + " " + rrect(6.4, 4.2, 0.9, 15.6, 0.3, hole=True)
                    + " " + rrect(9.3, 6.6, 7.4, 3.2, 0.7, hole=True)
                    + " " + circle(13, 15, 2.1, hole=True)),
    # Statistics: an hourglass
    "IconStatistics": (rrect(4.6, 2.2, 14.8, 2.3, 0.9) + " " + rrect(4.6, 19.5, 14.8, 2.3, 0.9)
                       + " " + poly([(6.3, 4.5), (17.7, 4.5), (17.7, 7.4), (13.6, 12), (17.7, 16.6), (17.7, 19.5), (6.3, 19.5), (6.3, 16.6), (10.4, 12), (6.3, 7.4)])
                       + " " + poly([(9, 6.9), (15, 6.9), (12, 9.9)], hole=True)),
    # Window buttons
    "IconWindowMinimize": rrect(4, 15, 16, 3.2, 1),
    "IconWindowMaximize": rrect(4, 4.5, 16, 15, 2) + " " + rrect(6.6, 8.6, 10.8, 8.2, 0.6, hole=True),
    "IconWindowRestore": (poly([(8.6, 3.4), (20.6, 3.4), (20.6, 15.4), (17.6, 15.4), (17.6, 6.4), (8.6, 6.4)])
                          + " " + rrect(3.4, 8.4, 14, 12.4, 1.8) + " " + rrect(6, 11.6, 8.8, 6.2, 0.5, hole=True)),
    "IconWindowClose": X_SHAPE,
    # Indicators
    "IconDropDown": poly([(5.5, 8.6), (18.5, 8.6), (12, 16.2)]),
    "IconSubmenu": poly([(8.6, 5), (8.6, 19), (16.4, 12)]),
    "IconCheck": poly([(3.6, 12.8), (6.2, 10.2), (9.7, 13.7), (17.8, 5.6), (20.4, 8.2), (9.7, 18.9)]),
    "IconAdd": bar(12, 4, 12, 20, 1.8) + " " + bar(4, 12, 20, 12, 1.8),
    # Edit: a quill
    "IconEdit": (poly([(3.4, 20.6), (5.2, 14.6), (7.4, 9.4), (12, 5), (18.6, 3.2), (21, 3.4), (20.8, 5.8), (19, 12.4), (14.6, 17), (9.4, 19.2)])
                 + " " + bar(6.2, 17.8, 16.2, 7.8, 0.6, hole=True)),
    # Remove: a bin
    "IconRemove": (rrect(9, 2.3, 6, 2.6, 0.9) + " " + rrect(3.8, 4.8, 16.4, 2.8, 1)
                   + " " + poly([(5.8, 8.6), (18.2, 8.6), (17.2, 21.2), (6.8, 21.2)])
                   + " " + rrect(9.4, 10.8, 1.5, 7.6, 0.5, hole=True) + " " + rrect(13.1, 10.8, 1.5, 7.6, 0.5, hole=True)),
}


def to_xaml():
    return "\n".join(f'    <Geometry x:Key="{k}">F1 M{v[1:]}</Geometry>' if v.startswith("M") else f'    <Geometry x:Key="{k}">F1 {v}</Geometry>'
                     for k, v in GLYPHS.items())


def preview(path):
    cells = []
    for k, v in GLYPHS.items():
        cells.append(f'<div class="c"><svg viewBox="0 0 24 24" width="72" height="72"><path d="{v}" fill="currentColor" fill-rule="nonzero"/></svg>'
                     f'<svg viewBox="0 0 24 24" width="20" height="20"><path d="{v}" fill="currentColor"/></svg><span>{k[4:]}</span></div>')
    html = ("<!doctype html><meta charset=utf-8><style>body{background:#17140f;color:#ffd100;font:12px sans-serif;margin:16px}"
            ".g{display:grid;grid-template-columns:repeat(7,130px);gap:10px}.c{background:#0d0b08;border:1px solid #5d4a2a;border-radius:4px;padding:8px;"
            "display:flex;flex-direction:column;align-items:center;gap:6px}span{color:#9d9d9d}</style><div class=g>" + "".join(cells) + "</div>")
    Path(path).write_text(html, encoding="utf-8")


def write_media():
    media = Path(__file__).resolve().parent.parent / "src" / "Media.xaml"
    text = media.read_text(encoding="utf-8")
    begin, end = "<!-- glyphs:begin", "<!-- glyphs:end -->"
    b = text.index(begin)
    b = text.index("\n", b) + 1
    e = text.index(end)
    media.write_text(text[:b] + to_xaml() + "\n    " + text[e:], encoding="utf-8")
    return media


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "xaml"
    if cmd == "media":
        print(write_media())
    elif cmd == "xaml":
        print(to_xaml())
    elif cmd == "preview":
        out = Path(__file__).with_name("glyphs-preview.html")
        preview(out)
        print(out)
