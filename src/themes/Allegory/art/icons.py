"""Allegory UI icons: filled silhouettes on a 24-unit grid built from quill strokes.

Metaphor: ReFantazio's menu glyphs are flat white silhouettes with sharp, wedge-cut terminals (the category tabs, the
item flasks, the wide Didone letterforms). Here every line is a *quill stroke*: an elongated diamond, thick in the
middle and pointed at both ends, or a tapered blade (thick at its root, pointed at its tip). Rings are hairline donuts,
like the menus' compass rings. IconTemplate fills each geometry with the control's Foreground (nonzero rule, so the
helpers wind every outline clockwise and every hole counter-clockwise).

Run:  python3 src/themes/Allegory/art/icons.py
Rewrites the block between the ICONS markers in src/Media.xaml and in art/preview-*.html (an inline <symbol> sheet),
and writes art/mark.svg (the brand mark, filled: the tile rasterizer ignores strokes).
"""
import math
import re
from pathlib import Path


def _fmt(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def _area(pts):
    return sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1])) / 2


def poly(pts, hole=False):
    """Closed polygon; clockwise on screen (y down) unless it is a hole."""
    pts = list(pts)
    cw = _area(pts) > 0  # with y pointing down a positive shoelace area is clockwise on screen
    if cw == hole:
        pts.reverse()
    return "M" + " L".join(f"{_fmt(x)},{_fmt(y)}" for x, y in pts) + " Z"


def quill(x0, y0, x1, y1, w):
    """Elongated diamond from (x0, y0) to (x1, y1), w wide at the middle."""
    dx, dy = x1 - x0, y1 - y0
    ln = math.hypot(dx, dy) or 1
    nx, ny = -dy / ln * w / 2, dx / ln * w / 2
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    return poly([(x0, y0), (mx + nx, my + ny), (x1, y1), (mx - nx, my - ny)])


def blade(x0, y0, x1, y1, w, tip=0.0):
    """Tapered blade: w wide at (x0, y0), narrowing to `tip` at (x1, y1)."""
    dx, dy = x1 - x0, y1 - y0
    ln = math.hypot(dx, dy) or 1
    nx, ny = -dy / ln, dx / ln
    a, b = w / 2, tip / 2
    if tip:
        return poly([(x0 + nx * a, y0 + ny * a), (x1 + nx * b, y1 + ny * b), (x1 - nx * b, y1 - ny * b), (x0 - nx * a, y0 - ny * a)])
    return poly([(x0 + nx * a, y0 + ny * a), (x1, y1), (x0 - nx * a, y0 - ny * a)])


def bar(x0, y, x1, h):
    return poly([(x0, y - h / 2), (x1, y - h / 2), (x1, y + h / 2), (x0, y + h / 2)])


def circle(cx, cy, r, hole=False):
    # two arcs; sweep flag 1 = clockwise on screen
    s = 0 if hole else 1
    return f"M{_fmt(cx - r)},{_fmt(cy)} A{_fmt(r)},{_fmt(r)} 0 1 {s} {_fmt(cx + r)},{_fmt(cy)} A{_fmt(r)},{_fmt(r)} 0 1 {s} {_fmt(cx - r)},{_fmt(cy)} Z"


def ring(cx, cy, r, t):
    return circle(cx, cy, r) + " " + circle(cx, cy, r - t, hole=True)


def arc_band(cx, cy, r, t, a0, a1):
    """Ring segment from angle a0 to a1 (degrees, clockwise on screen, 0 = right)."""
    def pt(rad, a):
        return cx + rad * math.cos(math.radians(a)), cy + rad * math.sin(math.radians(a))
    large = 1 if (a1 - a0) % 360 > 180 else 0
    (ox0, oy0), (ox1, oy1) = pt(r, a0), pt(r, a1)
    (ix1, iy1), (ix0, iy0) = pt(r - t, a1), pt(r - t, a0)
    return (f"M{_fmt(ox0)},{_fmt(oy0)} A{_fmt(r)},{_fmt(r)} 0 {large} 1 {_fmt(ox1)},{_fmt(oy1)} "
            f"L{_fmt(ix1)},{_fmt(iy1)} A{_fmt(r - t)},{_fmt(r - t)} 0 {large} 0 {_fmt(ix0)},{_fmt(iy0)} Z")


def diamond(cx, cy, rx, ry=None, hole=False):
    ry = rx if ry is None else ry
    return poly([(cx, cy - ry), (cx + rx, cy), (cx, cy + ry), (cx - rx, cy)], hole)


def frame(x0, y0, x1, y1, t):
    return poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)]) + " " + poly([(x0 + t, y0 + t), (x1 - t, y0 + t), (x1 - t, y1 - t), (x0 + t, y1 - t)], hole=True)


def slant(x0, y0, x1, y1, s):
    """Plate with a slanted left end (the MONEY plate / prompt plate silhouette)."""
    return poly([(x0 + s, y0), (x1, y0), (x1, y1), (x0, y1)])


def J(*parts):
    return " ".join(parts)


ICONS = {
    # magnifier: a hairline ring and a quill handle
    "IconSearch": J(ring(10, 10, 6.6, 1.9), blade(14.3, 14.3, 21.2, 21.2, 3.4)),
    "IconClear": J(quill(5, 5, 19, 19, 3.2), quill(19, 5, 5, 19, 3.2)),
    # funnel: the category tab's inverted triangle on a quill stem
    "IconFilter": J(poly([(3.5, 4.5), (20.5, 4.5), (12, 14)]), quill(12, 12.5, 12, 21.5, 3)),
    "IconFilterPresets": J(poly([(2.5, 4.5), (14, 4.5), (8.25, 11)]), quill(8.25, 10, 8.25, 19.5, 2.6),
                           quill(15, 10, 22, 10, 2.2), quill(15, 14.5, 22, 14.5, 2.2), quill(15, 19, 22, 19, 2.2)),
    "IconSort": J(blade(3, 6, 15, 6, 2.6, 1.0), blade(3, 12, 12, 12, 2.6, 1.0), blade(3, 18, 9, 18, 2.6, 1.0),
                  quill(18.5, 3, 18.5, 16, 2.2), poly([(15, 15), (22, 15), (18.5, 21.5)])),
    # two slanted plates, one over the other
    "IconGroup": J(slant(6, 4, 21, 10, 3), slant(3, 14, 18, 20, 3)),
    "IconViewSettings": J(bar(3, 6, 21, 1.4), bar(3, 12, 21, 1.4), bar(3, 18, 21, 1.4),
                          diamond(8, 6, 2.6, 3.2), diamond(16, 12, 2.6, 3.2), diamond(10, 18, 2.6, 3.2)),
    "IconDetailsView": J(diamond(5, 6, 2.2), blade(9, 6, 21, 6, 2.4, 1.0), diamond(5, 12, 2.2), blade(9, 12, 21, 12, 2.4, 1.0),
                         diamond(5, 18, 2.2), blade(9, 18, 21, 18, 2.4, 1.0)),
    "IconGridView": J(slant(3, 3.5, 11, 11, 2), slant(13, 3.5, 21, 11, 2), slant(3, 13, 11, 20.5, 2), slant(13, 13, 21, 20.5, 2)),
    "IconListView": J(blade(3, 5, 21, 5, 2.2, 0.8), blade(3, 10, 21, 10, 2.2, 0.8), blade(3, 15, 21, 15, 2.2, 0.8), blade(3, 20, 15, 20, 2.2, 0.8)),
    "IconUpdate": J(arc_band(12, 12, 8.2, 2.3, 200, 335), poly([(21.5, 7.2), (20.8, 13.4), (15.6, 10.2)]),
                    arc_band(12, 12, 8.2, 2.3, 20, 155), poly([(2.5, 16.8), (3.2, 10.6), (8.4, 13.8)])),
    # compass: a ring with a four-point star needle (the menus' compass rings)
    "IconExplorer": J(ring(12, 12, 9.5, 1.5), poly([(12, 3.5), (13.6, 10.4), (20.5, 12), (13.6, 13.6), (12, 20.5), (10.4, 13.6), (3.5, 12), (10.4, 10.4)])),
    "IconRandom": J(diamond(12, 12, 10), diamond(12, 12, 7.6, hole=True), diamond(12, 7.8, 1.5), diamond(7.8, 12, 1.5), diamond(16.2, 12, 1.5), diamond(12, 16.2, 1.5)),
    "IconViewRandom": J(diamond(12, 12, 10), diamond(12, 12, 7.6, hole=True), diamond(12, 7.8, 1.5), diamond(7.8, 12, 1.5), diamond(16.2, 12, 1.5), diamond(12, 16.2, 1.5)),
    "IconNotifications": J(poly([(12, 2.5), (13.6, 5), (17.5, 8), (17.5, 15), (20.5, 18), (3.5, 18), (6.5, 15), (6.5, 8), (10.4, 5)]),
                           diamond(12, 20.6, 2.6, 1.6)),
    # main menu: the player menu's cascade of words, three quills stepping in
    "IconMainMenu": J(blade(3, 5.5, 21, 5.5, 2.8, 0.8), blade(5.5, 12, 21, 12, 2.8, 0.8), blade(8, 18.5, 21, 18.5, 2.8, 0.8)),
    "IconLibrary": J(poly([(3.5, 4), (7.5, 4), (7.5, 20), (3.5, 20)]), poly([(9.5, 6), (13.5, 6), (13.5, 20), (9.5, 20)]),
                     poly([(15.2, 6.8), (18.8, 5.6), (22, 18.8), (18.4, 20)]), bar(2.5, 21.2, 21.5, 1.2)),
    # three spires
    "IconStatistics": J(poly([(4, 21), (4, 13), (6.25, 10), (8.5, 13), (8.5, 21)]), poly([(9.75, 21), (9.75, 8), (12, 4.5), (14.25, 8), (14.25, 21)]),
                        poly([(15.5, 21), (15.5, 11), (17.75, 8), (20, 11), (20, 21)])),
    "IconPlay": poly([(6.5, 3.5), (20.5, 12), (6.5, 20.5), (8.6, 12)]),
    "IconDownload": J(quill(12, 2.5, 12, 15, 3), poly([(6.5, 11), (17.5, 11), (12, 17.5)]), blade(3, 21, 21, 21, 2.2, 0.8)),
    "IconInfo": J(diamond(12, 5, 2.4), quill(12, 9, 12, 21.5, 3.6)),
    "IconOptions": J(diamond(4.5, 12, 2.6), diamond(12, 12, 2.6), diamond(19.5, 12, 2.6)),
    # a quill nib writing on a rule
    "IconEdit": J(quill(19.5, 3.5, 6, 17, 4.2), poly([(6, 17), (3.5, 20.5), (7.2, 18.4)]), blade(10, 21, 21, 21, 1.8, 0.6)),
    "IconAdd": J(quill(12, 3, 12, 21, 3.2), quill(3, 12, 21, 12, 3.2)),
    "IconRemove": quill(3, 12, 21, 12, 3.4),
    "IconCheck": J(blade(4, 12.5, 9.5, 18.5, 3.2, 1.6), blade(9.5, 18.5, 21, 5, 3.4, 0.6)),
    "IconDropDown": poly([(6.5, 8.5), (17.5, 8.5), (12, 16)]),
    "IconSubmenu": poly([(8.5, 6), (16.5, 12), (8.5, 18)]),
    "IconWindowClose": J(quill(6, 6, 18, 18, 2.2), quill(18, 6, 6, 18, 2.2)),
    "IconWindowMinimize": quill(5, 12.5, 19, 12.5, 2.2),
    "IconWindowMaximize": frame(5.5, 5.5, 18.5, 18.5, 1.5),
    "IconWindowRestore": J(frame(4.5, 8.5, 15.5, 19.5, 1.5), poly([(8.5, 4.5), (19.5, 4.5), (19.5, 15.5), (17, 15.5), (17, 7), (8.5, 7)])),
}

# Brand mark (48 units): two compass rings, a long diagonal hairline through them, and a quill-nib spire standing in the
# middle. Filled shapes only.
MARK = J(
    ring(24, 25, 20, 1.6),
    ring(24, 25, 13.5, 1.1),
    quill(4, 44, 44, 4, 1.6),
    poly([(24, 3), (28.6, 22), (26, 34), (24, 42), (22, 34), (19.4, 22)]),
    diamond(24, 25, 1.9, hole=True),
)


# The mark's parts, for the animated main menu mark (each part moves on its own).
MARK_PARTS = {
    "LocalMarkOuterRingGeometry": ring(24, 25, 20, 1.6),
    "LocalMarkInnerRingGeometry": ring(24, 25, 13.5, 1.1),
    "LocalMarkDiagonalGeometry": quill(4, 44, 44, 4, 1.6),
    "LocalMarkNibGeometry": J(poly([(24, 3), (28.6, 22), (26, 34), (24, 42), (22, 34), (19.4, 22)]), diamond(24, 25, 1.9, hole=True)),
}


def dab_geometry(seed=7, w=40.0, h=26.0, n=56):
    """A ragged dry-brush dab outline (vector, so it can animate without an image mask): a rounded slab whose top and
    bottom edges wobble, with a dry, split tail on the right."""
    import random
    rnd = random.Random(seed)
    top, bot = [], []
    for i in range(n + 1):
        t = i / n
        x = 1.5 + t * (w - 3)
        edge = 2.2 + math.sin(t * 9.0 + 0.6) * 0.8 + rnd.uniform(-1.1, 1.1)
        if t > 0.86:  # bristles split at the tail
            edge += (t - 0.86) * 18 * rnd.uniform(0.2, 1.0)
        if t < 0.05:
            edge += (0.05 - t) * 50
        top.append((x, edge))
        eb = h - 2.0 - math.sin(t * 7.0 + 1.9) * 0.9 - rnd.uniform(-1.2, 1.2)
        if t > 0.88:
            eb -= (t - 0.88) * 20 * rnd.uniform(0.2, 1.0)
        if t < 0.05:
            eb -= (0.05 - t) * 50
        bot.append((x, eb))
    return poly(top + list(reversed(bot)))


def banner_edge_geometry(seed=19, w=1000.0, h=60.0, n=220):
    """The banner foot as vector (no OpacityMask over art behind the animated Play button): a band filled with the page colour whose
    top is a dragged dry-brush edge, ragged with bristle tips, plus a few thin horizontal drag slivers floating just above it."""
    import random
    rnd = random.Random(seed)
    base = 0.55 * h
    knots = [rnd.uniform(-1, 1) for _ in range(14)]
    top = []
    for i in range(n + 1):
        t = i / n
        k = t * (len(knots) - 1)
        a, b = knots[int(k)], knots[min(int(k) + 1, len(knots) - 1)]
        low = a + (b - a) * (k - int(k))
        y = base + low * 0.12 * h + rnd.uniform(-0.05, 0.05) * h
        if rnd.random() < 0.12:
            y -= rnd.uniform(0.06, 0.2) * h  # bristle tip poking up
        top.append((t * w, y))
    parts = [poly(top + [(w, h), (0, h)])]
    for _ in range(26):
        x0 = rnd.uniform(0, w * 0.95)
        ln = rnd.uniform(0.02, 0.09) * w
        y = rnd.uniform(0.18, 0.42) * h
        th = rnd.uniform(0.6, 1.6)
        parts.append(poly([(x0, y), (x0 + ln, y - th * 0.3), (x0 + ln, y + th * 0.4), (x0 + 3, y + th)]))
    return J(*parts)


# The add-on tile rasterizer XORs overlapping paths, so the tile's copy of the mark breaks the diagonal around the nib (the ring
# crossings XOR into small notches, which read as the hairline cutting through).
MARK_TILE = J(
    ring(24, 25, 20, 1.6),
    ring(24, 25, 13.5, 1.1),
    blade(4, 44, 17.2, 30.8, 1.6, 0.9),
    blade(44, 4, 30.8, 17.2, 1.6, 0.9),
    poly([(24, 3), (28.6, 22), (26, 34), (24, 42), (22, 34), (19.4, 22)]),
    diamond(24, 25, 1.9, hole=True),
)


def xaml_block():
    lines = ["    <!-- ICONS:BEGIN (art/icons.py) -->"]
    lines.append(f'    <Geometry x:Key="LocalBannerEdgeGeometry">F1 {banner_edge_geometry()}</Geometry>')
    for k, d in ICONS.items():
        lines.append(f'    <Geometry x:Key="{k}">F1 {d}</Geometry>')
    lines.append(f'    <Geometry x:Key="LocalAllegoryMarkGeometry">F1 {MARK}</Geometry>')
    for k, d in MARK_PARTS.items():
        lines.append(f'    <Geometry x:Key="{k}">F1 {d}</Geometry>')
    lines.append(f'    <Geometry x:Key="LocalDabGeometry">F1 {dab_geometry()}</Geometry>')
    lines.append("    <!-- ICONS:END -->")
    return "\n".join(lines)


def symbol_block():
    lines = ['<!-- ICONS:BEGIN (art/icons.py) -->', '<svg width="0" height="0" style="position:absolute" aria-hidden="true">']
    for k, d in ICONS.items():
        lines.append(f'  <symbol id="{k}" viewBox="0 0 24 24"><path d="{d}"/></symbol>')
    lines.append(f'  <symbol id="Mark" viewBox="0 0 48 48"><path d="{MARK}"/></symbol>')
    lines.append('</svg>')
    lines.append('<!-- ICONS:END -->')
    return "\n".join(lines)


def patch(path, block, pattern):
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8")
    new, n = re.subn(pattern, lambda _m: block, text, flags=re.S)
    if n:
        path.write_text(new, encoding="utf-8", newline="\n")
    return bool(n)


def main():
    theme = Path(__file__).resolve().parent.parent
    pat_x = r"    <!-- ICONS:BEGIN.*?ICONS:END -->"
    pat_h = r"<!-- ICONS:BEGIN.*?ICONS:END -->"
    done = [str(p.name) for p, b, pt in (
        (theme / "src" / "Media.xaml", xaml_block(), pat_x),
        (theme / "art" / "preview-details.html", symbol_block(), pat_h),
        (theme / "art" / "preview-settings.html", symbol_block(), pat_h),
    ) if patch(p, b, pt)]
    (theme / "art" / "mark.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#ffffff" d="' + MARK_TILE + '"/></svg>\n',
        encoding="utf-8", newline="\n")
    print("patched:", ", ".join(done) or "(no markers yet)", "+ art/mark.svg")


if __name__ == "__main__":
    main()
