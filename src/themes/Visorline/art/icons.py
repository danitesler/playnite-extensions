#!/usr/bin/env python3
"""Visorline icons: thin HUD line glyphs drawn on a 24 grid and written as filled geometry.
    python3 src/themes/Visorline/art/icons.py
Each glyph is a set of polylines (arcs and circles are short segments). A stroke of STROKE px is turned into one quad
per segment with square caps, all wound the same way, so the whole glyph is one nonzero-filled geometry that
IconTemplate fills with the item's brush. Nothing here is traced from the game; the language (hairlines, 45 degree
cuts, square ends, a broken hex) follows the captures' brackets and plates.
Rewrites the Icon* geometries in src/Media.xaml and writes art/mark.svg (the theme's mark = IconMainMenu).
"""
import math
import os
import re
HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(HERE, '..', 'src', 'Media.xaml')
STROKE = 1.8


def circle(cx, cy, r, n=28):
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)] + [None]


def arc(cx, cy, r, a0, a1, n=18):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1), None]


def closed(*pts):
    return list(pts) + [None]


def hexv():
    return [(12, 2), (20.7, 7), (20.7, 17), (12, 22), (3.3, 17), (3.3, 7)]


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def _unit(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    ln = math.hypot(dx, dy)
    return dx / ln, dy / ln


def stroke_outline(pts, w):
    """One simple polygon around an open polyline: miter joins, square caps, no self-overlap (so any fill rule agrees)."""
    h = w / 2
    d = [_unit(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
    q = [list(p) for p in pts]
    q[0] = [pts[0][0] - d[0][0] * h, pts[0][1] - d[0][1] * h]
    q[-1] = [pts[-1][0] + d[-1][0] * h, pts[-1][1] + d[-1][1] * h]
    left, right = [], []
    for i, p in enumerate(q):
        if i == 0:
            n = (-d[0][1], d[0][0])
            m, k = n, h
        elif i == len(q) - 1:
            n = (-d[-1][1], d[-1][0])
            m, k = n, h
        else:
            n1, n2 = (-d[i - 1][1], d[i - 1][0]), (-d[i][1], d[i][0])
            mx, my = n1[0] + n2[0], n1[1] + n2[1]
            ml = math.hypot(mx, my)
            m = (mx / ml, my / ml)
            k = h / (m[0] * n1[0] + m[1] * n1[1])
        left.append((p[0] + m[0] * k, p[1] + m[1] * k))
        right.append((p[0] - m[0] * k, p[1] - m[1] * k))
    return left + right[::-1]


def plus_polygon(cx, cy, arm, w):
    h, L = w / 2, arm + w / 2
    return [(cx - h, cy - L), (cx + h, cy - L), (cx + h, cy - h), (cx + L, cy - h), (cx + L, cy + h), (cx + h, cy + h),
            (cx + h, cy + L), (cx - h, cy + L), (cx - h, cy + h), (cx - L, cy + h), (cx - L, cy - h), (cx - h, cy - h)]


def mark_polygons(w):
    ring = [lerp(V[0], V[1], .62), V[1], V[2], V[3], V[4], V[5], V[0], lerp(V[0], V[1], .26)]
    return [stroke_outline(ring, w), plus_polygon(12, 12, 3, w)]


def polygons_path(polys):
    return ' '.join('M' + ' '.join(f'{x:.2f},{y:.2f}'.replace('.00', '') for x, y in poly) + 'Z' for poly in polys)


V = hexv()
# The mark: a hex cell broken by a visor slit on its upper right edge, with a centre cross.
MARK = [[lerp(V[0], V[1], .62), V[1], V[2], V[3], V[4], V[5], V[0], lerp(V[0], V[1], .26)],
        [(12, 9), (12, 15)], [(9, 12), (15, 12)]]

ICONS = {
    'Search': [circle(10.5, 10.5, 6.6), [(15.4, 15.4), (21, 21)]],
    'Clear': [[(5, 5), (19, 19)], [(19, 5), (5, 19)]],
    'ViewSettings': [[(3, 7), (21, 7)], [(3, 17), (21, 17)], [(9, 3.5), (9, 10.5)], [(15, 13.5), (15, 20.5)]],
    'FilterPresets': [closed((6, 3), (18, 3), (18, 21), (12, 16), (6, 21))],
    'Group': [[(3, 5), (21, 5)], [(5, 8), (5, 17), (8, 17)], [(5, 12), (8, 12)], [(10, 12), (21, 12)], [(10, 17), (21, 17)]],
    'Sort': [[(7, 4), (7, 20)], [(4, 7), (7, 4), (10, 7)], [(17, 4), (17, 20)], [(14, 17), (17, 20), (20, 17)]],
    'DetailsView': [[(3, 6), (11, 6)], [(3, 12), (11, 12)], [(3, 18), (11, 18)], rect(14, 4, 21, 20)],
    'GridView': [rect(4, 4, 10, 10), rect(14, 4, 20, 10), rect(4, 14, 10, 20), rect(14, 14, 20, 20)],
    'ListView': [[(9, 6), (21, 6)], [(9, 12), (21, 12)], [(9, 18), (21, 18)], [(3, 5), (5.5, 5), (5.5, 7), (3, 7), (3, 5)],
                 [(3, 11), (5.5, 11), (5.5, 13), (3, 13), (3, 11)], [(3, 17), (5.5, 17), (5.5, 19), (3, 19), (3, 17)]],
    'Update': [arc(12, 12, 8, -40, 250, 26), [(17, 3.5), (18.5, 7.4), (14.4, 7.8)]],
    'Explorer': [closed((3, 6), (10, 6), (12, 8.5), (21, 8.5), (21, 19), (3, 19))],
    'Random': [[(3, 7), (8, 7), (15, 17), (21, 17)], [(3, 17), (8, 17), (10.5, 13.5)], [(13, 10.5), (15, 7), (21, 7)],
               [(18, 4), (21, 7), (18, 10)], [(18, 14), (21, 17), (18, 20)]],
    'ViewRandom': [rect(4, 4, 20, 20), [(8, 8), (9, 8)], [(15, 8), (16, 8)], [(11.5, 12), (12.5, 12)], [(8, 16), (9, 16)], [(15, 16), (16, 16)]],
    'Filter': [closed((3, 5), (21, 5), (14, 13), (14, 20), (10, 18), (10, 13))],
    'Notifications': [closed((4, 18), (7, 15.5), (7, 10), (9, 6), (12, 5), (15, 6), (17, 10), (17, 15.5), (20, 18)), [(10, 21), (14, 21)]],
    'MainMenu': MARK,
    'Library': [rect(4, 4, 8.5, 20), rect(10.5, 4, 15, 20), [(17, 5.5), (21, 4.5), (21, 19), (17, 20)]],
    'Statistics': [rect(4, 12, 8, 20), rect(10, 5, 14, 20), rect(16, 9, 20, 20)],
    'WindowMinimize': [[(6, 18), (18, 18)]],
    'WindowMaximize': [rect(5, 5, 19, 19)],
    'WindowRestore': [closed((8, 8), (8, 4), (20, 4), (20, 16), (16, 16)), rect(4, 8, 16, 20)],
    'WindowClose': [[(5, 5), (19, 19)], [(19, 5), (5, 19)]],
    'DropDown': [[(6, 9), (12, 15), (18, 9)]],
    'Submenu': [[(9, 6), (15, 12), (9, 18)]],
    'Check': [[(5, 12.5), (10, 17), (19, 7)]],
    'Add': [[(12, 4), (12, 20)], [(4, 12), (20, 12)]],
    'Edit': [closed((4, 20), (4, 16), (15, 5), (19, 9), (8, 20)), [(12, 8), (16, 12)]],
    'Remove': [[(4, 7), (20, 7)], [(9, 7), (9, 4), (15, 4), (15, 7)], closed((6, 7), (6, 20), (18, 20), (18, 7)), [(10, 11), (10, 16)], [(14, 11), (14, 16)]],
    'Options': [[(4, 12), (6, 12)], [(11, 12), (13, 12)], [(18, 12), (20, 12)]],
    'Play': [closed((7, 4), (19, 12), (7, 20))],
    'Info': [circle(12, 12, 9), [(12, 11), (12, 17)], [(12, 7), (12, 8)]],
    'Download': [[(12, 4), (12, 15)], [(7, 10), (12, 15), (17, 10)], [(5, 19.5), (19, 19.5)]],
}


def quads(poly, w):
    """One quad per segment with square caps, all wound the same way."""
    h = w / 2
    out = []
    pts = [p for p in poly if p is not None]
    closed_poly = poly[-1] is None
    segs = list(zip(pts, pts[1:]))
    if closed_poly and pts[0] != pts[-1]:
        segs.append((pts[-1], pts[0]))
    for (px, py), (qx, qy) in segs:
        dx, dy = qx - px, qy - py
        ln = math.hypot(dx, dy)
        if ln < 1e-6:
            dx, dy, ln = 1.0, 0.0, 1.0
            qx, qy = px, py
        dx, dy = dx / ln, dy / ln
        nx, ny = -dy, dx
        out.append([(px - dx * h + nx * h, py - dy * h + ny * h), (qx + dx * h + nx * h, qy + dy * h + ny * h),
                    (qx + dx * h - nx * h, qy + dy * h - ny * h), (px - dx * h - nx * h, py - dy * h - ny * h)])
    return out


def geometry(polys, w=STROKE):
    parts = []
    for poly in polys:
        for q in quads(poly, w):
            parts.append('M' + ' '.join(f'{x:.2f},{y:.2f}'.replace('.00', '') for x, y in q) + 'Z')
    return 'F1 ' + ' '.join(parts)


def main():
    src = open(MEDIA, encoding='utf-8').read()
    for name, polys in ICONS.items():
        pat = re.compile(r'(<Geometry x:Key="Icon%s">)[^<]*(</Geometry>)' % name)
        if not pat.search(src):
            print('missing in Media.xaml:', name)
            continue
        text = 'F0 ' + polygons_path(mark_polygons(STROKE)) if name == 'MainMenu' else geometry(polys)
        src = pat.sub(lambda m: m.group(1) + text + m.group(2), src)
    open(MEDIA, 'w', encoding='utf-8', newline='\n').write(src)
    d = polygons_path(mark_polygons(2.0))
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512">'
           f'<path fill="#fff" fill-rule="evenodd" d="{d}"/></svg>\n')
    open(os.path.join(HERE, 'mark.svg'), 'w', encoding='utf-8', newline='\n').write(svg)
    print('wrote', len(ICONS), 'icons and mark.svg')


if __name__ == '__main__':
    main()
