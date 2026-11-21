"""Joyride icons: chunky filled glyphs on a 24-unit grid, square corners, the weight of GTA-era map blips and HUD icons.

Every icon is a filled geometry (even-odd, so inner sub-paths punch holes). IconTemplate fills it with the control's
Foreground. Rewrites the block between the ICONS markers in src/Media.xaml and in art/preview-*.html (an inline <symbol>
sheet) and writes art/mark.svg (the brand mark: a collage tile cut into three panels, a wanted star punched in the big one).

Run:  python src/themes/Joyride/art/icons.py
"""
import math
import re
from pathlib import Path


def f(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def poly(*pts):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + " Z"


def rect(x0, y0, x1, y1):
    return poly((x0, y0), (x1, y0), (x1, y1), (x0, y1))


def circle(cx, cy, r):
    return (f"M{f(cx - r)},{f(cy)} A{f(r)},{f(r)} 0 1 1 {f(cx + r)},{f(cy)} "
            f"A{f(r)},{f(r)} 0 1 1 {f(cx - r)},{f(cy)} Z")


def bar(x0, y0, x1, y1, t):
    """A straight bar of thickness t between two points (a rotated rectangle)."""
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy)
    nx, ny = -dy / n * t / 2, dx / n * t / 2
    return poly((x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny))


def star(cx, cy, r, inner=0.42, rot=-90):
    pts = []
    for i in range(10):
        a = math.radians(rot + i * 36)
        rr = r if i % 2 == 0 else r * inner
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return poly(*pts)


def cross(cx, cy, r, t):
    return f"{bar(cx - r, cy - r, cx + r, cy + r, t)} {bar(cx - r, cy + r, cx + r, cy - r, t)}"


X = cross(12, 12, 7, 3.2)

ICONS = {
    # magnifier: thick ring + slanted handle
    "IconSearch": f"{circle(10, 10, 7.4)} {circle(10, 10, 4.4)} {poly((14.4, 16.6), (16.6, 14.4), (22.2, 20), (20, 22.2))}",
    "IconClear": cross(12, 12, 6, 3),
    # three sliders, square knobs
    "IconViewSettings": (f"{rect(2, 4, 22, 6.4)} {rect(2, 10.8, 22, 13.2)} {rect(2, 17.6, 22, 20)} "
                         f"{rect(14, 1.8, 18.6, 8.6)} {rect(5, 8.6, 9.6, 15.4)} {rect(11, 15.4, 15.6, 22.2)}"),
    # funnel with a star (saved presets)
    "IconFilterPresets": f"{poly((2, 3), (16, 3), (10.6, 10.6), (10.6, 19), (7.4, 21), (7.4, 10.6))} {star(18.4, 15.6, 5.2)}",
    # the collage grid: one tall panel, two small ones
    "IconGroup": f"{rect(2, 2, 12.8, 22)} {rect(15.2, 2, 22, 10.8)} {rect(15.2, 13.2, 22, 22)}",
    # bars of falling length + down arrow
    "IconSort": (f"{rect(2, 3.4, 13, 6.2)} {rect(2, 10.6, 10, 13.4)} {rect(2, 17.8, 7, 20.6)} "
                 f"{rect(16.4, 2.6, 19.2, 15)} {poly((13.2, 14), (22.4, 14), (17.8, 21.8))}"),
    "IconDetailsView": (f"{rect(2, 3, 6.6, 7.6)} {rect(9, 3.8, 22, 6.8)} {rect(2, 9.7, 6.6, 14.3)} {rect(9, 10.5, 22, 13.5)} "
                        f"{rect(2, 16.4, 6.6, 21)} {rect(9, 17.2, 22, 20.2)}"),
    "IconGridView": f"{rect(2, 2, 10.8, 10.8)} {rect(13.2, 2, 22, 10.8)} {rect(2, 13.2, 10.8, 22)} {rect(13.2, 13.2, 22, 22)}",
    "IconListView": f"{rect(2, 3, 22, 5.8)} {rect(2, 8.4, 22, 11.2)} {rect(2, 13.8, 22, 16.6)} {rect(2, 19.2, 22, 22)}",
    # circular arrow: thick arc + head
    "IconUpdate": ("M20.2,11.6 A8.2,8.2 0 1 1 15.6,4.6 L14.4,7.2 A5.4,5.4 0 1 0 17.4,11.6 Z "
                   f"{poly((12.4, 1.4), (20.8, 3.6), (15.2, 9.8))}"),
    # panel with a filled left column
    "IconExplorer": f"{rect(2, 3, 22, 21)} {rect(4.6, 5.6, 19.4, 18.4)} {rect(4.6, 5.6, 10, 18.4)}",
    # dice: rounded square with five pips
    "IconRandom": (f"M5,2 L19,2 Q22,2 22,5 L22,19 Q22,22 19,22 L5,22 Q2,22 2,19 L2,5 Q2,2 5,2 Z "
                   f"{circle(7.4, 7.4, 1.9)} {circle(16.6, 7.4, 1.9)} {circle(12, 12, 1.9)} {circle(7.4, 16.6, 1.9)} {circle(16.6, 16.6, 1.9)}"),
    "IconViewRandom": (f"M5,2 L19,2 Q22,2 22,5 L22,19 Q22,22 19,22 L5,22 Q2,22 2,19 L2,5 Q2,2 5,2 Z "
                       f"{circle(7.4, 7.4, 1.9)} {circle(16.6, 16.6, 1.9)} {circle(12, 12, 1.9)}"),
    "IconFilter": poly((2, 3), (22, 3), (14.2, 12.4), (14.2, 19.6), (9.8, 22), (9.8, 12.4)),
    # the phone (notifications arrive on the in-game phone)
    "IconNotifications": (f"M8,1.6 L16,1.6 Q18.4,1.6 18.4,4 L18.4,20 Q18.4,22.4 16,22.4 L8,22.4 Q5.6,22.4 5.6,20 L5.6,4 Q5.6,1.6 8,1.6 Z "
                          f"{rect(7.8, 4.4, 16.2, 16.2)} {rect(10.4, 18.2, 13.6, 20.2)}"),
    "IconMainMenu": f"{rect(2, 4, 22, 7)} {rect(2, 10.5, 22, 13.5)} {rect(2, 17, 22, 20)}",
    # three cases on a shelf, the middle one leaning
    "IconLibrary": f"{rect(2, 4, 6.6, 21)} {rect(8.4, 2.4, 13, 21)} {poly((14.6, 4.6), (18.8, 3.4), (22.6, 19.8), (18.4, 21))} {rect(1, 21.6, 23, 23)}",
    "IconStatistics": f"{rect(2, 12, 6.4, 21)} {rect(9.8, 4, 14.2, 21)} {rect(17.6, 8.4, 22, 21)}",
    "IconWindowMinimize": rect(4, 16.6, 20, 19.4),
    "IconWindowMaximize": f"{rect(4, 4, 20, 20)} {rect(6.8, 8.4, 17.2, 17.2)}",
    "IconWindowRestore": f"{poly((8, 3), (21, 3), (21, 16), (18.4, 16), (18.4, 5.6), (10.6, 5.6), (10.6, 8), (8, 8))} {rect(3, 8, 16, 21)} {rect(5.6, 10.6, 13.4, 18.4)}",
    "IconWindowClose": cross(12, 12, 6.6, 3),
    "IconDropDown": poly((4.4, 8.4), (19.6, 8.4), (12, 17)),
    "IconSubmenu": poly((8.4, 4.4), (17, 12), (8.4, 19.6)),
    "IconCheck": poly((2.6, 12.6), (5, 10.2), (9.4, 14.6), (19, 5), (21.4, 7.4), (9.4, 19.4)),
    "IconAdd": f"{rect(10.5, 3, 13.5, 21)} {rect(3, 10.5, 21, 13.5)}",
    "IconEdit": f"{poly((15.6, 2.8), (21.2, 8.4), (8.6, 21), (3, 21), (3, 15.4))} {poly((5.8, 16.6), (7.4, 18.2), (6.2, 18.2), (5.8, 17.8))}",
    "IconRemove": f"{rect(3, 5, 21, 7.6)} {rect(9, 2.4, 15, 5)} {poly((5, 9.2), (19, 9.2), (17.6, 22), (6.4, 22))} {rect(9.2, 11.6, 10.8, 19.4)} {rect(13.2, 11.6, 14.8, 19.4)}",
    "IconOptions": f"{rect(2.4, 9.6, 7.2, 14.4)} {rect(9.6, 9.6, 14.4, 14.4)} {rect(16.8, 9.6, 21.6, 14.4)}",
    "IconPlay": poly((6, 3), (20.6, 12), (6, 21)),
    "IconInfo": f"{circle(12, 12, 10)} {rect(10.4, 10.4, 13.6, 18)} {rect(10.4, 5.4, 13.6, 8.6)}",
    "IconDownload": f"{rect(10.4, 2, 13.6, 12)} {poly((5.6, 10.4), (18.4, 10.4), (12, 17.4))} {rect(3, 19, 21, 22)}",
}

# Theme-only shapes.
STAR = star(12, 12.6, 11, 0.42)
# The mark: a collage tile, three panels split by gutters, a wanted star punched into the tall panel.
MARK = f"{rect(1, 1, 14.6, 23)} {rect(16.6, 1, 23, 10.8)} {rect(16.6, 12.8, 23, 23)} {star(7.8, 12.6, 5.4, 0.42)}"

# Icons drawn as overlapping pieces (no holes) fill nonzero; the rest are even-odd.
NONZERO = {"IconViewSettings", "IconClear", "IconWindowClose"}

LOCAL = {
    "LocalStarGeometry": STAR,
    "LocalMarkGeometry": MARK,
}


def xaml_block():
    lines = ["    <!-- ICONS:BEGIN (art/icons.py) -->"]
    for k, v in ICONS.items():
        lines.append(f'    <Geometry x:Key="{k}">{"F1" if k in NONZERO else "F0"} {v}</Geometry>')
    for k, v in LOCAL.items():
        lines.append(f'    <Geometry x:Key="{k}">F0 {v}</Geometry>')
    lines.append("    <!-- ICONS:END -->")
    return "\n".join(lines)


def symbol_block():
    out = ['<!-- ICONS:BEGIN (art/icons.py) -->', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>']
    for k, v in list(ICONS.items()) + list(LOCAL.items()):
        rule = "nonzero" if k in NONZERO else "evenodd"
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
    # contact sheet for review
    sheet = ['<svg xmlns="http://www.w3.org/2000/svg" width="880" height="400" style="background:#0d0d0e">']
    for i, (k, v) in enumerate(list(ICONS.items()) + list(LOCAL.items())):
        x, y = (i % 11) * 80 + 16, (i // 11) * 96 + 12
        rule = "nonzero" if k in NONZERO else "evenodd"
        sheet.append(f'<g transform="translate({x},{y}) scale(2)"><path fill="#f0f0f0" fill-rule="{rule}" d="{v}"/></g>')
        sheet.append(f'<text x="{x}" y="{y + 62}" fill="#9b9b9b" font-size="9" font-family="Barlow">{k[4:] if k.startswith("Icon") else k[5:]}</text>')
    sheet.append("</svg>")
    (theme / "art" / "icon-sheet.svg").write_text("\n".join(sheet), encoding="utf-8")
    print("wrote art/mark.svg, art/icon-sheet.svg")


if __name__ == "__main__":
    main()
