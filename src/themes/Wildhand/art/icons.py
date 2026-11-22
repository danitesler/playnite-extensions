"""Wildhand icons: chunky filled glyphs on a 24-unit grid with softly rounded corners, the weight of Balatro's HUD marks.

Every icon is a filled geometry (even-odd, so inner sub-paths punch holes). IconTemplate fills it with the control's
Foreground. Rewrites the block between the ICONS markers in src/Media.xaml and in art/preview-*.html (an inline <symbol>
sheet) and writes art/mark.svg (the brand mark: a tilted playing card holding a three-point jester cap).

Corners: poly() rounds every vertex with a small quadratic curve, so rect(), star() and the arrows all read as the
game's softened pixel shapes. spoly() keeps a vertex sharp.

Run:  python src/themes/Wildhand/art/icons.py
"""
import math
import os
import re
from pathlib import Path

ROUND = 0.9


def f(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def rpoly(pts, r=ROUND):
    """Closed polygon with every corner rounded by a quadratic curve of reach r (capped at 40% of the shorter edge)."""
    n = len(pts)
    out = []
    for i in range(n):
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
        d1 = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
        d2 = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
        rr = min(r, d1 * 0.4, d2 * 0.4)
        if rr < 0.05:
            out.append(("L", p1))
            continue
        a = (p1[0] + (p0[0] - p1[0]) / d1 * rr, p1[1] + (p0[1] - p1[1]) / d1 * rr)
        b = (p1[0] + (p2[0] - p1[0]) / d2 * rr, p1[1] + (p2[1] - p1[1]) / d2 * rr)
        out.append(("Q", a, p1, b))
    s = ""
    for i, seg in enumerate(out):
        if seg[0] == "L":
            s += ("M" if i == 0 else " L") + f"{f(seg[1][0])},{f(seg[1][1])}"
        else:
            _, a, c, b = seg
            s += ("M" if i == 0 else " L") + f"{f(a[0])},{f(a[1])} Q{f(c[0])},{f(c[1])} {f(b[0])},{f(b[1])}"
    return s + " Z"


def poly(*pts):
    return rpoly(list(pts))


def spoly(*pts):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + " Z"


def rect(x0, y0, x1, y1, r=ROUND):
    return rpoly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], r)


def circle(cx, cy, r):
    return (f"M{f(cx - r)},{f(cy)} A{f(r)},{f(r)} 0 1 1 {f(cx + r)},{f(cy)} "
            f"A{f(r)},{f(r)} 0 1 1 {f(cx - r)},{f(cy)} Z")


def bar(x0, y0, x1, y1, t, r=0.6):
    """A straight bar of thickness t between two points (a rotated rectangle)."""
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy)
    nx, ny = -dy / n * t / 2, dx / n * t / 2
    return rpoly([(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)], r)


def star(cx, cy, r, inner=0.45, rot=-90):
    pts = []
    for i in range(10):
        a = math.radians(rot + i * 36)
        rr = r if i % 2 == 0 else r * inner
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return rpoly(pts, 0.5)


def cross(cx, cy, r, t):
    return f"{bar(cx - r, cy - r, cx + r, cy + r, t)} {bar(cx - r, cy + r, cx + r, cy - r, t)}"


def rot(pts, deg, cx=12, cy=12):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    return [(cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c) for x, y in pts]


def rrect_pts(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


ICONS = {
    # magnifier: thick ring + slanted handle
    "IconSearch": f"{circle(10, 10, 7.4)} {circle(10, 10, 4.4)} {bar(15.4, 15.4, 20.6, 20.6, 3.2)}",
    "IconClear": cross(12, 12, 6, 3.2),
    # three sliders, round knobs (a settings row's slider)
    "IconViewSettings": (f"{rect(2, 4, 22, 6.4, 1.1)} {rect(2, 10.8, 22, 13.2, 1.1)} {rect(2, 17.6, 22, 20, 1.1)} "
                         f"{circle(16.2, 5.2, 3.2)} {circle(7.4, 12, 3.2)} {circle(13.4, 18.8, 3.2)}"),
    # funnel with a chip
    "IconFilterPresets": f"{poly((2, 3), (16, 3), (10.6, 10.6), (10.6, 19), (7.4, 21), (7.4, 10.6))} {circle(18, 16.4, 4.6)} {circle(18, 16.4, 2.2)}",
    # three cards fanned
    "IconGroup": (f"{rpoly(rot(rrect_pts(3.4, 4.6, 11.2, 20.6), -10, 8, 13), 1.6)} "
                  f"{rpoly(rot(rrect_pts(8.2, 3.2, 16, 19.2), 0, 12, 12), 1.6)} "
                  f"{rpoly(rot(rrect_pts(12.8, 4.6, 20.6, 20.6), 10, 16.8, 13), 1.6)}"),
    # bars of falling length + down arrow
    "IconSort": (f"{rect(2, 3.4, 13, 6.2)} {rect(2, 10.6, 10, 13.4)} {rect(2, 17.8, 7, 20.6)} "
                 f"{rect(16.4, 2.6, 19.2, 15)} {poly((13.2, 14), (22.4, 14), (17.8, 21.8))}"),
    "IconDetailsView": (f"{rect(2, 3, 6.6, 7.6, 1.4)} {rect(9, 3.8, 22, 6.8)} {rect(2, 9.7, 6.6, 14.3, 1.4)} {rect(9, 10.5, 22, 13.5)} "
                        f"{rect(2, 16.4, 6.6, 21, 1.4)} {rect(9, 17.2, 22, 20.2)}"),
    "IconGridView": f"{rect(2, 2, 10.8, 10.8, 2)} {rect(13.2, 2, 22, 10.8, 2)} {rect(2, 13.2, 10.8, 22, 2)} {rect(13.2, 13.2, 22, 22, 2)}",
    "IconListView": f"{rect(2, 3, 22, 5.8, 1.2)} {rect(2, 8.4, 22, 11.2, 1.2)} {rect(2, 13.8, 22, 16.6, 1.2)} {rect(2, 19.2, 22, 22, 1.2)}",
    # circular arrow: thick arc + head
    "IconUpdate": ("M20.2,11.6 A8.2,8.2 0 1 1 15.6,4.6 L14.4,7.2 A5.4,5.4 0 1 0 17.4,11.6 Z "
                   f"{poly((12.4, 1.4), (20.8, 3.6), (15.2, 9.8))}"),
    # panel with a filled left column
    "IconExplorer": f"{rect(2, 3, 22, 21, 2.4)} {rect(4.6, 5.6, 19.4, 18.4, 1)} {rect(4.6, 5.6, 10, 18.4, 1)}",
    # dice: rounded square with five pips
    "IconRandom": (f"{rect(2, 2, 22, 22, 4)} "
                   f"{circle(7.4, 7.4, 1.9)} {circle(16.6, 7.4, 1.9)} {circle(12, 12, 1.9)} {circle(7.4, 16.6, 1.9)} {circle(16.6, 16.6, 1.9)}"),
    "IconViewRandom": (f"{rect(2, 2, 22, 22, 4)} "
                       f"{circle(7.4, 7.4, 1.9)} {circle(16.6, 16.6, 1.9)} {circle(12, 12, 1.9)}"),
    "IconFilter": poly((2, 3), (22, 3), (14.2, 12.4), (14.2, 19.6), (9.8, 22), (9.8, 12.4)),
    # bell
    "IconNotifications": ("M12,1.8 C7.8,1.8 5.8,5 5.8,9 L5.8,12.6 L3.2,17 L20.8,17 L18.2,12.6 L18.2,9 C18.2,5 16.2,1.8 12,1.8 Z "
                          f"{circle(12, 20, 2.4)}"),
    "IconMainMenu": f"{rect(2, 4, 22, 7, 1.4)} {rect(2, 10.5, 22, 13.5, 1.4)} {rect(2, 17, 22, 20, 1.4)}",
    # three cards on a shelf, the right one leaning
    "IconLibrary": (f"{rect(2, 4, 6.8, 21, 1.6)} {rect(8.6, 2.4, 13.4, 21, 1.6)} "
                    f"{rpoly([(15, 4.8), (19.4, 3.4), (23, 19.6), (18.6, 21)], 1.4)}"),
    "IconStatistics": f"{rect(2, 12, 6.4, 21, 1.4)} {rect(9.8, 4, 14.2, 21, 1.4)} {rect(17.6, 8.4, 22, 21, 1.4)}",
    "IconWindowMinimize": rect(4, 16.6, 20, 19.4, 1.2),
    "IconWindowMaximize": f"{rect(4, 4, 20, 20, 2)} {rect(6.8, 8.4, 17.2, 17.2, 0.6)}",
    "IconWindowRestore": (f"{poly((8, 3), (21, 3), (21, 16), (18.4, 16), (18.4, 5.6), (10.6, 5.6), (10.6, 8), (8, 8))} "
                          f"{rect(3, 8, 16, 21, 2)} {rect(5.6, 10.6, 13.4, 18.4, 0.6)}"),
    "IconWindowClose": cross(12, 12, 6.6, 3.2),
    "IconDropDown": poly((4.4, 8.4), (19.6, 8.4), (12, 17), ),
    "IconSubmenu": poly((8.4, 4.4), (17, 12), (8.4, 19.6)),
    "IconCheck": poly((2.6, 12.8), (5.2, 10.2), (9.4, 14.4), (18.8, 5), (21.4, 7.6), (9.4, 19.6)),
    "IconAdd": f"{rect(10.4, 3, 13.6, 21, 1.2)} {rect(3, 10.4, 21, 13.6, 1.2)}",
    "IconEdit": f"{poly((15.6, 2.8), (21.2, 8.4), (8.6, 21), (3, 21), (3, 15.4))}",
    "IconRemove": f"{rect(3, 5, 21, 7.6, 1.2)} {rect(9, 2.4, 15, 5, 1)} {poly((5, 9.2), (19, 9.2), (17.6, 22), (6.4, 22))} {rect(9.2, 11.6, 10.8, 19.4, 0.4)} {rect(13.2, 11.6, 14.8, 19.4, 0.4)}",
    # three dots: the value dots under an option box
    "IconOptions": f"{circle(5, 12, 2.7)} {circle(12, 12, 2.7)} {circle(19, 12, 2.7)}",
    "IconPlay": poly((6, 3), (20.6, 12), (6, 21)),
    "IconInfo": f"{circle(12, 12, 10)} {rect(10.4, 10.4, 13.6, 18, 0.8)} {circle(12, 6.9, 1.7)}",
    "IconDownload": f"{rect(10.4, 2, 13.6, 12, 1)} {poly((5.6, 10.4), (18.4, 10.4), (12, 17.4))} {rect(3, 19, 21, 22, 1.2)}",
}

# Theme-only shapes (24 grid).
SPADE = ("M12,2.4 C9,6.2 4,9 4,13.4 C4,16.2 6.2,18 8.6,18 C9.9,18 11,17.5 11.6,16.6 "
         "L10.4,21.6 L13.6,21.6 L12.4,16.6 C13,17.5 14.1,18 15.4,18 C17.8,18 20,16.2 20,13.4 C20,9 15,6.2 12,2.4 Z")
HEART = ("M12,21.4 C6.4,17 2.6,13.6 2.6,9.2 C2.6,6 4.9,4 7.6,4 C9.6,4 11.2,5.1 12,6.7 "
         "C12.8,5.1 14.4,4 16.4,4 C19.1,4 21.4,6 21.4,9.2 C21.4,13.6 17.6,17 12,21.4 Z")
DIAMOND = poly((12, 1.6), (20.6, 12), (12, 22.4), (3.4, 12), )
CLUB = (f"{circle(12, 7.4, 4.6)} {circle(6.8, 14, 4.6)} {circle(17.2, 14, 4.6)} "
        "M10.4,14 L13.6,14 L14.4,21.8 L9.6,21.8 Z")
# The pointer over the active tab (a downward triangle).
POINTER = spoly((3, 6), (21, 6), (12, 19))
# The round-score chip: a poker chip with eight spokes and a hub.
CHIP_SPOKES = "".join(bar(12 + 6.2 * math.cos(math.radians(a)), 12 + 6.2 * math.sin(math.radians(a)),
                          12 + 10.4 * math.cos(math.radians(a)), 12 + 10.4 * math.sin(math.radians(a)), 2.6, 0.5)
                      for a in range(0, 360, 45))
CHIP = f"{circle(12, 12, 4.2)} {CHIP_SPOKES}"
# The mark: a playing card tilted -8 degrees, outlined, holding a three-point jester cap with bells.
TILT = -8


def tilted(pts):
    return rpoly(rot(pts, TILT), 0.7)


CARD_OUT = rpoly(rot(rrect_pts(4.4, 1.8, 19.6, 22.2), TILT), 2.6)
CARD_IN = rpoly(rot(rrect_pts(6.6, 4, 17.4, 20), TILT), 1.2)
CAP = tilted([(7.4, 16.6), (8.2, 9.4), (10.2, 12), (12, 8.2), (13.8, 12), (15.8, 9.4), (16.6, 16.6)])
BAND = tilted([(7.2, 17.4), (16.8, 17.4), (16.8, 19), (7.2, 19)])


def bell(x, y):
    cx, cy = rot([(x, y)], TILT)[0]
    return circle(cx, cy, 1.25)


MARK = f"{CARD_OUT} {CARD_IN} {CAP} {BAND} {bell(8.2, 7.8)} {bell(12, 6.4)} {bell(15.8, 7.8)}"

# Icons drawn as overlapping pieces (no holes) fill nonzero; the rest are even-odd.
NONZERO = {"IconViewSettings", "IconClear", "IconWindowClose", "IconGroup", "IconOptions"}

LOCAL = {
    "LocalSpadeGeometry": SPADE,
    "LocalHeartGeometry": HEART,
    "LocalDiamondGeometry": DIAMOND,
    "LocalClubGeometry": CLUB,
    "LocalPointerGeometry": POINTER,
    "LocalChipGeometry": CHIP,
    "LocalMarkGeometry": MARK,
}
LOCAL_NONZERO = {"LocalClubGeometry"}


def xaml_block():
    lines = ["    <!-- ICONS:BEGIN (art/icons.py) -->"]
    for k, v in ICONS.items():
        lines.append(f'    <Geometry x:Key="{k}">{"F1" if k in NONZERO else "F0"} {v}</Geometry>')
    for k, v in LOCAL.items():
        lines.append(f'    <Geometry x:Key="{k}">{"F1" if k in LOCAL_NONZERO else "F0"} {v}</Geometry>')
    lines.append("    <!-- ICONS:END -->")
    return "\n".join(lines)


def symbol_block():
    out = ['<!-- ICONS:BEGIN (art/icons.py) -->', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>']
    for k, v in list(ICONS.items()) + list(LOCAL.items()):
        rule = "nonzero" if (k in NONZERO or k in LOCAL_NONZERO) else "evenodd"
        out.append(f'<symbol id="{k}" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="{rule}" d="{v}"/></symbol>')
    out.append('</defs></svg>')
    out.append('<!-- ICONS:END -->')
    return "\n".join(out)


def patch(path, block, pattern):
    text = path.read_text(encoding="utf-8")
    new, n = re.subn(pattern, lambda m: block, text, count=1, flags=re.S)
    if n:
        path.write_text(new, encoding="utf-8", newline="\n")
        print("patched", path.name)
    else:
        print("no ICONS markers in", path.name)


def main():
    theme = Path(__file__).resolve().parent.parent
    media = theme / "src" / "Media.xaml"
    if media.exists():
        patch(media, xaml_block(), r"[ \t]*<!-- ICONS:BEGIN.*?<!-- ICONS:END -->")
    for name in ("preview-details.html", "preview-settings.html"):
        p = theme / "art" / name
        if p.exists() and "ICONS:BEGIN" in p.read_text(encoding="utf-8"):
            patch(p, symbol_block(), r"<!-- ICONS:BEGIN.*?<!-- ICONS:END -->")
    (theme / "art" / "mark.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
        f'<path fill="currentColor" fill-rule="evenodd" d="{MARK}"/></svg>\n', encoding="utf-8")
    # contact sheet for review goes to scratch, not the repo
    sheet = ['<svg xmlns="http://www.w3.org/2000/svg" width="880" height="400" style="background:#374244">']
    for i, (k, v) in enumerate(list(ICONS.items()) + list(LOCAL.items())):
        x, y = (i % 11) * 80 + 16, (i // 11) * 96 + 12
        rule = "nonzero" if (k in NONZERO or k in LOCAL_NONZERO) else "evenodd"
        sheet.append(f'<g transform="translate({x},{y}) scale(2)"><path fill="#ffffff" fill-rule="{rule}" d="{v}"/></g>')
        sheet.append(f'<text x="{x}" y="{y + 62}" fill="#bfc7d5" font-size="9" font-family="sans-serif">{k[4:] if k.startswith("Icon") else k[5:]}</text>')
    sheet.append("</svg>")
    scratch = Path(os.environ.get("WILDHAND_SCRATCH", os.environ.get("TEMP", ".")))
    (scratch / "wildhand-icon-sheet.svg").write_text("\n".join(sheet), encoding="utf-8")
    print("wrote art/mark.svg and", scratch / "wildhand-icon-sheet.svg")


if __name__ == "__main__":
    main()
