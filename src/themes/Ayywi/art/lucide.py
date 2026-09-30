#!/usr/bin/env python3
"""Generates the icon parts of Ayywi: src/Media.xaml and src/Images/Lucide/*.png.

ayywi draws its icons as Lucide-style strokes (24px grid, stroke 2, round caps and joins); Lucide is the pack ayywi's own
markup uses. This script fetches the pinned Lucide SVGs, turns each into one WPF path string (IconTemplate strokes it in
the inherited foreground) and renders the menu icons Playnite copies as PNGs (cairosvg).

    python3 art/lucide.py            (from src/themes/Ayywi; needs network and: pip install cairosvg)

Colors of the PNGs come from src/tokens.css (muted for menu icons, destructive for exit and remove, warning for star).
Not shipped in the package.
"""
import re, sys, math, pathlib, urllib.request

VERSION = "1.49.0"  # lucide-static on npm, ISC license
URL = "https://cdn.jsdelivr.net/npm/lucide-static@%s/icons/%s.svg"
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# Icon<Role> geometry -> Lucide icon name
UI = [
    ("IconSearch", "search"), ("IconClear", "x"), ("IconViewSettings", "sliders-horizontal"),
    ("IconFilterPresets", "bookmark"), ("IconGroup", "layers"), ("IconSort", "arrow-up-down"),
    ("IconDetailsView", "panel-right"), ("IconGridView", "layout-grid"), ("IconListView", "list"),
    ("IconUpdate", "circle-arrow-down"), ("IconExplorer", "folder-tree"), ("IconRandom", "dices"),
    ("IconViewRandom", "shuffle"), ("IconFilter", "list-filter"), ("IconNotifications", "bell"),
    ("IconMainMenu", "menu"), ("IconLibrary", "library"), ("IconStatistics", "chart-column"),
    ("IconWindowMinimize", "minus"), ("IconWindowMaximize", "square"), ("IconWindowRestore", "copy"),
    ("IconWindowClose", "x"), ("IconDropDown", "chevron-down"), ("IconSubmenu", "chevron-right"),
    ("IconCheck", "check"), ("IconAdd", "plus"), ("IconEdit", "pencil"), ("IconRemove", "trash-2"),
    ("IconOptions", "ellipsis"), ("IconPlay", "play"), ("IconInfo", "info"), ("IconDownload", "download"),
]

# Playnite menu icon key -> (Lucide name, color token)
MENU = [
    ("FullscreenModeIcon", "maximize", "muted"), ("AddGameIcon", "plus", "muted"), ("UpdateDbIcon", "refresh-cw", "muted"),
    ("AboutPlayniteIcon", "info", "muted"), ("ExitIcon", "log-out", "destructive"), ("SettingsIcon", "settings", "muted"),
    ("AddonsIcon", "puzzle", "muted"), ("PlayIcon", "play", "muted"), ("InstallIcon", "download", "muted"),
    ("LinksIcon", "link", "muted"), ("OpenFolderIcon", "folder-open", "muted"), ("InstallSizeIcon", "hard-drive", "muted"),
    ("DesktopShortcutIcon", "app-window", "muted"), ("AddFavoritesIcon", "star", "warning"),
    ("RemoveFavoritesIcon", "star-off", "muted"), ("HideIcon", "eye-off", "muted"), ("UnHideIcon", "eye", "muted"),
    ("HdrIcon", "sun", "muted"), ("EditGameIcon", "pencil", "muted"), ("RemoveGameIcon", "trash-2", "destructive"),
    ("DiceIcon", "dices", "muted"), ("ManualIcon", "book-open", "muted"), ("BackupIcon", "archive", "muted"),
    ("RestoreBackupIcon", "history", "muted"),
]


def fetch(name):
    cache = pathlib.Path(__file__).resolve().parent / ".cache"
    cache.mkdir(exist_ok=True)
    f = cache / (name + ".svg")
    if not f.exists():
        f.write_bytes(urllib.request.urlopen(URL % (VERSION, name), timeout=30).read())
    return f.read_text(encoding="utf-8")


def num(x):
    s = ("%.4f" % x).rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


TOKEN = re.compile(r"([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)")
ARGS = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7, "Z": 0}


def norm_path(d):
    """Re-emit path data with explicit separators (WPF rejects packed arc flags) and an absolute first moveto."""
    toks = [(m.group(1), m.group(2)) for m in TOKEN.finditer(d)]
    # numbers inside arcs may have packed flags: handle by scanning the raw string for arc commands
    out, i, cmd, first = [], 0, None, True
    pos = 0
    s = d
    n = len(s)

    def skip():
        nonlocal pos
        while pos < n and s[pos] in " ,\t\r\n":
            pos += 1

    def number():
        nonlocal pos
        skip()
        m = re.compile(r"-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?").match(s, pos)
        if not m:
            raise ValueError("bad number at %d in %r" % (pos, d))
        pos = m.end()
        return m.group(0)

    def flag():
        nonlocal pos
        skip()
        c = s[pos]
        pos += 1
        return c

    while True:
        skip()
        if pos >= n:
            break
        c = s[pos]
        if c.isalpha():
            cmd = c
            pos += 1
            if cmd in "Zz":
                out.append("Z")
                continue
        elif cmd is None:
            raise ValueError("path must start with a command: " + d)
        else:
            if cmd in "Mm":
                cmd = "L" if cmd == "M" else "l"
        up = cmd.upper()
        if up == "A":
            vals = [number(), number(), number(), flag(), flag(), number(), number()]
        else:
            vals = [number() for _ in range(ARGS[up])]
        letter = cmd
        if first:
            letter = "M"  # a leading relative moveto is absolute; keeps concatenated paths independent
            first = False
        out.append(letter + " " + " ".join(num(float(v)) if not (up == "A" and k in (3, 4)) else v for k, v in enumerate(vals)))
    return " ".join(out)


def circle(cx, cy, rx, ry):
    return "M %s %s a %s %s 0 1 0 %s 0 a %s %s 0 1 0 %s 0 Z" % (num(cx - rx), num(cy), num(rx), num(ry), num(2 * rx), num(rx), num(ry), num(-2 * rx))


def rect(x, y, w, h, rx, ry):
    if rx == 0 and ry == 0:
        return "M %s %s h %s v %s h %s Z" % (num(x), num(y), num(w), num(h), num(-w))
    return ("M %s %s h %s a %s %s 0 0 1 %s %s v %s a %s %s 0 0 1 %s %s h %s a %s %s 0 0 1 %s %s v %s a %s %s 0 0 1 %s %s Z" % (
        num(x + rx), num(y), num(w - 2 * rx), num(rx), num(ry), num(rx), num(ry), num(h - 2 * ry), num(rx), num(ry), num(-rx), num(ry),
        num(-(w - 2 * rx)), num(rx), num(ry), num(-rx), num(-ry), num(-(h - 2 * ry)), num(rx), num(ry), num(rx), num(-ry)))


def attrs(tag):
    return dict(re.findall(r'([\w:-]+)="([^"]*)"', tag))


def svg_to_path(svg):
    parts = []
    for m in re.finditer(r"<(path|circle|ellipse|rect|line|polyline|polygon)\b([^>]*?)/?>", svg):
        kind, a = m.group(1), attrs(m.group(2))
        f = lambda k, d=0.0: float(a.get(k, d))
        if kind == "path":
            parts.append(norm_path(a["d"]))
        elif kind == "circle":
            parts.append(circle(f("cx"), f("cy"), f("r"), f("r")))
        elif kind == "ellipse":
            parts.append(circle(f("cx"), f("cy"), f("rx"), f("ry")))
        elif kind == "rect":
            rx = f("rx", a.get("ry", 0)); ry = f("ry", a.get("rx", 0))
            parts.append(rect(f("x"), f("y"), f("width"), f("height"), rx, ry))
        elif kind == "line":
            parts.append("M %s %s L %s %s" % (num(f("x1")), num(f("y1")), num(f("x2")), num(f("y2"))))
        else:
            pts = [float(v) for v in re.findall(r"-?\d*\.?\d+", a["points"])]
            seg = ["%s %s" % (num(pts[i]), num(pts[i + 1])) for i in range(0, len(pts), 2)]
            parts.append("M " + " L ".join(seg) + (" Z" if kind == "polygon" else ""))
    if not parts:
        raise ValueError("no shapes")
    return " ".join(parts)


def token_colors():
    css = (SRC / "tokens.css").read_text()
    def val(n):
        m = re.search(r"--ayy-color-%s:\s*var\(--ayy-palette-([\w-]+)\)" % n, css)
        return re.search(r"--ayy-palette-%s:\s*(#\w+)" % m.group(1), css).group(1)
    return {n: val(n) for n in ("muted", "destructive", "warning")}


def main():
    colors = token_colors()
    lines = []
    for key, name in UI:
        lines.append('    <!-- lucide: %s -->\n    <Geometry x:Key="%s">%s</Geometry>' % (name, key, svg_to_path(fetch(name))))
    geometry = "\n".join(lines)

    import cairosvg
    outdir = SRC / "Images" / "Lucide"
    outdir.mkdir(parents=True, exist_ok=True)
    strings, done = [], {}
    for key, name, col in MENU:
        file = "%s%s.png" % (name, "-" + col if col != "muted" else "")
        if file not in done:
            svg = fetch(name).replace("currentColor", colors[col])
            svg = re.sub(r'width="24"\s+height="24"', 'width="48" height="48"', svg, count=1)
            cairosvg.svg2png(bytestring=svg.encode(), write_to=str(outdir / file), output_width=48, output_height=48)
            done[file] = 1
        strings.append('    <sys:String x:Key="%s">Images/Lucide/%s</sys:String>' % (key, file))

    template = (ROOT / "art" / "Media.template.txt").read_text(encoding="utf-8")
    (SRC / "Media.xaml").write_text(template.replace("@@GEOMETRIES@@", geometry).replace("@@MENUICONS@@", "\n".join(strings)), encoding="utf-8")
    print("wrote Media.xaml (%d icons) and %d PNGs" % (len(UI), len(done)))


if __name__ == "__main__":
    main()
