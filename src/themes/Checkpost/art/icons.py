"""Checkpost icons: pixel glyphs on a 16-unit grid, the way the game draws its tiny HUD marks (hard 1px steps, 2px strokes).

Every icon is rasterised onto a 16x16 boolean grid from a few primitives (rect, disc, ring, line, poly) and written out as a
union of whole-pixel rectangles, so a glyph at IconSize 16 is exactly 16 pixels and scales up in whole steps. IconTemplate
fills the geometry with the control's Foreground. Rewrites the block between the ICONS markers in src/Media.xaml and in
art/preview-*.html (an inline <symbol> sheet), and writes art/mark.svg (the brand mark: an original rubber-stamp silhouette).

Run:  python src/themes/Checkpost/art/icons.py
"""
import math
import os
import re
from pathlib import Path

N = 16


class Grid:
    def __init__(self):
        self.p = [[False] * N for _ in range(N)]

    def _set(self, x, y, v=True):
        if 0 <= x < N and 0 <= y < N:
            self.p[y][x] = v

    def where(self, fn, v=True):
        for y in range(N):
            for x in range(N):
                if fn(x + 0.5, y + 0.5):
                    self._set(x, y, v)
        return self

    # additive shapes -------------------------------------------------------
    def rect(self, x0, y0, x1, y1, v=True):
        return self._rect(x0, y0, x1, y1, v)

    def _rect(self, x0, y0, x1, y1, v):
        for y in range(int(y0), int(y1)):
            for x in range(int(x0), int(x1)):
                self._set(x, y, v)
        return self

    def disc(self, cx, cy, r, v=True):
        return self.where(lambda x, y: (x - cx) ** 2 + (y - cy) ** 2 <= r * r, v)

    def ring(self, cx, cy, ro, ri, v=True):
        return self.where(lambda x, y: ri * ri <= (x - cx) ** 2 + (y - cy) ** 2 <= ro * ro, v)

    def line(self, x0, y0, x1, y1, t=2.0, v=True):
        dx, dy = x1 - x0, y1 - y0
        L2 = dx * dx + dy * dy

        def fn(x, y):
            u = max(0, min(1, ((x - x0) * dx + (y - y0) * dy) / L2)) if L2 else 0
            px, py = x0 + u * dx, y0 + u * dy
            return (x - px) ** 2 + (y - py) ** 2 <= (t / 2) ** 2
        return self.where(fn, v)

    def poly(self, pts, v=True):
        def fn(x, y):
            inside = False
            j = len(pts) - 1
            for i in range(len(pts)):
                xi, yi = pts[i]
                xj, yj = pts[j]
                if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                    inside = not inside
                j = i
            return inside
        return self.where(fn, v)

    # erase variants ---------------------------------------------------------
    def clear_rect(self, x0, y0, x1, y1):
        return self._rect(x0, y0, x1, y1, False)

    def clear_disc(self, cx, cy, r):
        return self.disc(cx, cy, r, False)

    # output -------------------------------------------------------------------
    def rects(self):
        """Horizontal runs, merged downward when identical."""
        runs = {}
        for y in range(N):
            x = 0
            while x < N:
                if self.p[y][x]:
                    x0 = x
                    while x < N and self.p[y][x]:
                        x += 1
                    runs.setdefault(y, []).append((x0, x))
                else:
                    x += 1
        out, open_ = [], {}
        for y in range(N + 1):
            cur = set(runs.get(y, []))
            for key in list(open_):
                if key not in cur:
                    y0 = open_.pop(key)
                    out.append((key[0], y0, key[1], y))
            for key in cur:
                if key not in open_:
                    open_[key] = y
        return sorted(out, key=lambda r: (r[1], r[0]))

    def path(self):
        return " ".join(f"M{x0},{y0} H{x1} V{y1} H{x0} Z" for x0, y0, x1, y1 in self.rects())


def G():
    return Grid()


def search():
    return G().ring(6.5, 6.5, 6, 3.6).line(10.6, 10.6, 14.2, 14.2, 2.6)


def clear():
    return G().line(3, 3, 13, 13, 2.4).line(13, 3, 3, 13, 2.4)


def view_settings():
    g = G()
    for y, kx in ((2, 10), (7, 4), (12, 8)):
        g.rect(1, y, 15, y + 2)
        g.clear_rect(kx - 1, y - 1, kx + 3, y + 3)
        g.rect(kx - 1, y - 1, kx + 3, y + 3)
    # knobs are full blocks; carve a notch so they read as sliders, not dashes
    for y, kx in ((2, 10), (7, 4), (12, 8)):
        g.clear_rect(kx, y, kx + 2, y + 2)
    return g


def filter_presets():
    g = G().poly([(1, 2), (13, 2), (8.5, 8), (8.5, 14), (5.5, 12.5), (5.5, 8)])
    g.rect(11, 10, 15, 14)
    g.clear_rect(12, 11, 14, 13)
    return g


def group():
    """Two stacked frames, the front one over the back: a collection, not a list."""
    g = G().rect(5, 1, 15, 11)
    g.clear_rect(7, 3, 13, 9)
    g.clear_rect(0, 4, 12, 16)
    g.rect(1, 5, 11, 15)
    g.clear_rect(3, 7, 9, 13)
    return g


def sort():
    g = G().rect(1, 2, 9, 4).rect(1, 7, 7, 9).rect(1, 12, 5, 14)
    g.rect(11, 1, 13, 11)
    g.poly([(8.2, 10), (15.8, 10), (12, 15)])
    return g


def details_view():
    g = G()
    for y in (1, 6, 11):
        g.rect(1, y, 5, y + 4)
        g.rect(7, y + 1, 15, y + 3)
    return g


def grid_view():
    return G().rect(1, 1, 7, 7).rect(9, 1, 15, 7).rect(1, 9, 7, 15).rect(9, 9, 15, 15)


def list_view():
    g = G()
    for y in (2, 6, 10, 14):
        g.rect(1, y - 1, 15, y + 1)
    return g


def update():
    g = G().ring(8, 8, 6.4, 3.8)
    g.clear_rect(8, 0, 16, 8)
    g.poly([(8, 0), (16, 1), (11, 6)])
    return g


def explorer():
    g = G().rect(1, 2, 15, 14)
    g.clear_rect(3, 4, 13, 12)
    g.rect(3, 4, 6, 12)
    return g


def dice(pips):
    g = G().rect(1, 1, 15, 15)
    g.clear_rect(3, 3, 13, 13)
    for px, py in pips:
        g.rect(px, py, px + 2, py + 2)
    return g


def funnel():
    return G().poly([(1, 2), (15, 2), (9.5, 8.5), (9.5, 14), (6.5, 12.5), (6.5, 8.5)])


def notifications():
    g = G().poly([(4, 3), (7, 1), (9, 1), (12, 3), (12, 9), (14, 12), (2, 12), (4, 9)])
    g.rect(6, 12, 10, 15)
    return g


def main_menu():
    return G().rect(1, 3, 15, 5).rect(1, 7, 15, 9).rect(1, 11, 15, 13)


def library():
    g = G().rect(1, 3, 5, 14).rect(6, 1, 10, 14)
    g.line(11.5, 3.5, 14.5, 13.5, 3.2)
    return g


def statistics():
    return G().rect(1, 9, 5, 15).rect(6, 3, 10, 15).rect(11, 6, 15, 15)


def win_min():
    return G().rect(3, 11, 13, 13)


def win_max():
    g = G().rect(3, 3, 13, 13)
    g.clear_rect(5, 5, 11, 11)
    return g


def win_restore():
    g = G().rect(5, 2, 14, 11)
    g.clear_rect(7, 4, 12, 9)
    g.clear_rect(2, 6, 11, 15)
    g.rect(2, 6, 11, 15)
    g.clear_rect(4, 8, 9, 13)
    return g


def drop_down():
    return G().poly([(3, 5), (13, 5), (8, 11)])


def submenu():
    return G().poly([(5, 3), (11, 8), (5, 13)])


def check():
    return G().line(2.2, 8.2, 6, 12, 2.6).line(5.6, 12, 14, 4, 2.6)


def add():
    return G().rect(7, 2, 9, 14).rect(2, 7, 14, 9)


def edit():
    g = G().line(11, 3, 13, 5, 3.4).line(4, 12, 11.5, 4.5, 3.4)
    g.poly([(2, 14), (2, 10.5), (5.5, 14)])
    return g


def remove():
    g = G().rect(1, 3, 15, 5).rect(5, 1, 11, 3)
    g.rect(3, 6, 13, 15)
    g.clear_rect(5, 8, 7, 13)
    g.clear_rect(9, 8, 11, 13)
    return g


def options():
    return G().rect(1, 6, 4, 10).rect(6, 6, 10, 10).rect(12, 6, 15, 10)


def play():
    return G().poly([(4, 2), (13.5, 8), (4, 14)])


def info():
    g = G().ring(8, 8, 7.2, 5.2)
    g.rect(7, 7, 9, 12)
    g.rect(7, 4, 9, 6)
    return g


def download():
    g = G().rect(7, 1, 9, 9)
    g.poly([(3, 7.5), (13, 7.5), (8, 12.5)])
    g.rect(2, 13, 14, 15)
    return g


# Theme-only shapes ------------------------------------------------------------
def mark():
    """The brand mark: a rubber stamp seen from the front (knob, neck, body, base) over two dotted impressions."""
    g = G().disc(8, 3.2, 3.2)
    g.rect(7, 5, 9, 8)
    g.rect(3, 8, 13, 11)
    g.rect(2, 11, 14, 13)
    g.rect(3, 14, 5, 15).rect(7, 14, 9, 15).rect(11, 14, 13, 15)
    return g


def seal():
    """Filter mark: a pixel octagon (the red seal)."""
    return G().rect(5, 1, 11, 15).rect(3, 3, 13, 13).rect(1, 5, 15, 11)


def knob():
    return G().disc(8, 8, 7.2)


def pointer():
    """Down-pointing pixel triangle (rotated -90 degrees by LocalPointerRightTemplate)."""
    return G().poly([(2.5, 4), (13.5, 4), (8, 11.5)])


def tick_ok():
    return G().line(3, 8.4, 6.6, 12, 2.6).line(6.2, 12, 13, 4.6, 2.6)


ICONS = {
    "IconSearch": search(),
    "IconClear": clear(),
    "IconViewSettings": view_settings(),
    "IconFilterPresets": filter_presets(),
    "IconGroup": group(),
    "IconSort": sort(),
    "IconDetailsView": details_view(),
    "IconGridView": grid_view(),
    "IconListView": list_view(),
    "IconUpdate": update(),
    "IconExplorer": explorer(),
    "IconRandom": dice([(3, 3), (11, 3), (7, 7), (3, 11), (11, 11)]),
    "IconViewRandom": dice([(3, 3), (7, 7), (11, 11)]),
    "IconFilter": funnel(),
    "IconNotifications": notifications(),
    "IconMainMenu": main_menu(),
    "IconLibrary": library(),
    "IconStatistics": statistics(),
    "IconWindowMinimize": win_min(),
    "IconWindowMaximize": win_max(),
    "IconWindowRestore": win_restore(),
    "IconWindowClose": clear(),
    "IconDropDown": drop_down(),
    "IconSubmenu": submenu(),
    "IconCheck": check(),
    "IconAdd": add(),
    "IconEdit": edit(),
    "IconRemove": remove(),
    "IconOptions": options(),
    "IconPlay": play(),
    "IconInfo": info(),
    "IconDownload": download(),
}
LOCAL = {
    "LocalMarkGeometry": mark(),
    "LocalSealGeometry": seal(),
    "LocalKnobGeometry": knob(),
    "LocalTickGeometry": tick_ok(),
    "LocalPointerGeometry": pointer(),
}


def xaml_block():
    lines = ["    <!-- ICONS:BEGIN (art/icons.py) -->"]
    for k, g in list(ICONS.items()) + list(LOCAL.items()):
        lines.append(f'    <Geometry x:Key="{k}">F1 {g.path()}</Geometry>')
    lines.append("    <!-- ICONS:END -->")
    return "\n".join(lines)


def symbol_block():
    out = ['<!-- ICONS:BEGIN (art/icons.py) -->', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>']
    for k, g in list(ICONS.items()) + list(LOCAL.items()):
        out.append(f'<symbol id="{k}" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="nonzero" shape-rendering="crispEdges" d="{g.path()}"/></symbol>')
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
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">'
        f'<path fill="currentColor" d="{mark().path()}"/></svg>\n', encoding="utf-8")
    sheet = ['<svg xmlns="http://www.w3.org/2000/svg" width="880" height="330" style="background:#1e1916">']
    for i, (k, g) in enumerate(list(ICONS.items()) + list(LOCAL.items())):
        x, y = (i % 11) * 80 + 16, (i // 11) * 100 + 12
        sheet.append(f'<g transform="translate({x},{y}) scale(3)"><path fill="#e4e4e4" d="{g.path()}"/></g>')
        sheet.append(f'<text x="{x}" y="{y + 66}" fill="#b5bc9c" font-size="9" font-family="sans-serif">{k[4:] if k.startswith("Icon") else k[5:]}</text>')
    sheet.append("</svg>")
    scratch = Path(os.environ.get("CHECKPOST_SCRATCH", os.environ.get("TEMP", ".")))
    (scratch / "checkpost-icon-sheet.svg").write_text("\n".join(sheet), encoding="utf-8")
    print("wrote art/mark.svg and", scratch / "checkpost-icon-sheet.svg")


if __name__ == "__main__":
    main()
