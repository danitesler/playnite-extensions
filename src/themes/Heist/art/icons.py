"""Fetch the Material Symbols Rounded (filled) icons this theme uses and print them as WPF Geometry resources.

Run: python3 src/themes/Heist/art/icons.py > icons.generated.xaml, then paste the entries into src/Media.xaml.
The SVGs draw on 0,-960..960,0; every path is rewritten with absolute commands and moved onto a 0..960 grid, so
IconTemplate needs no offset. Apache-2.0 (info/LICENSE-material-symbols.txt).
"""
import math
import re
import sys
import urllib.request

URL = "https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/{0}/materialsymbolsrounded/{0}_fill1_24px.svg"

ICONS = [
    ("search", "Search"), ("close", "Clear"), ("tune", "ViewSettings"), ("bookmarks", "FilterPresets"),
    ("stacks", "Group"), ("sort", "Sort"), ("vertical_split", "DetailsView"), ("grid_view", "GridView"),
    ("view_list", "ListView"), ("download", "Update"), ("account_tree", "Explorer"), ("casino", "Random"),
    ("shuffle", "ViewRandom"), ("filter_alt", "Filter"), ("notifications", "Notifications"), ("home", "Library"),
    ("leaderboard", "Statistics"), ("remove", "WindowMinimize"), ("crop_square", "WindowMaximize"),
    ("filter_none", "WindowRestore"), ("close", "WindowClose"), ("expand_more", "DropDown"),
    ("chevron_right", "Submenu"), ("check", "Check"), ("add", "Add"), ("edit", "Edit"), ("delete", "Remove"),
    ("settings", "Options"), ("play_arrow", "Play"), ("info", "Info"), ("download", "Download"),
]

TOKEN = re.compile(r"[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?")
ARGS = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7, "Z": 0}


def fmt(v):
    v = round(v, 2)
    return ("%d" % v) if v == int(v) else ("%g" % v)


def absolute(d):
    """Rewrite SVG path data with absolute commands and y moved down by 960."""
    toks = TOKEN.findall(d)
    out, i, cmd = [], 0, None
    x = y = sx = sy = 0.0
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t
            i += 1
            if cmd in "Zz":
                out.append("Z")
                x, y = sx, sy
                continue
        n = ARGS[cmd.upper()]
        a = [float(v) for v in toks[i:i + n]]
        i += n
        rel = cmd.islower()
        C = cmd.upper()
        if C == "H":
            x = a[0] + (x if rel else 0)
            out.append("L%s,%s" % (fmt(x), fmt(y + 960)))
        elif C == "V":
            y = a[0] + (y if rel else 0)
            out.append("L%s,%s" % (fmt(x), fmt(y + 960)))
        elif C == "A":
            ex, ey = a[5] + (x if rel else 0), a[6] + (y if rel else 0)
            out.append("A%s,%s %s %d %d %s,%s" % (fmt(a[0]), fmt(a[1]), fmt(a[2]), int(a[3]), int(a[4]), fmt(ex), fmt(ey + 960)))
            x, y = ex, ey
        else:
            pts = []
            for k in range(0, n, 2):
                px, py = a[k] + (x if rel else 0), a[k + 1] + (y if rel else 0)
                pts.append((px, py))
            out.append(C + " ".join("%s,%s" % (fmt(px), fmt(py + 960)) for px, py in pts))
            x, y = pts[-1]
            if C == "M":
                sx, sy = x, y
                cmd = "l" if rel else "L"  # extra pairs after a moveto are linetos
    return " ".join(out)


seen = {}
for name, role in ICONS:
    if name not in seen:
        svg = urllib.request.urlopen(URL.format(name)).read().decode()
        seen[name] = " ".join(absolute(d) for d in re.findall(r'\sd="([^"]+)"', svg))
    print('    <Geometry x:Key="Icon%s">F1 %s</Geometry> <!-- %s -->' % (role, seen[name], name))
