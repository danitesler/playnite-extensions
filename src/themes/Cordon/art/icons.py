#!/usr/bin/env python3
"""Generates the icon parts of Cordon: src/Media.xaml and src/Images/Phosphor/*.png.

The S.T.A.L.K.E.R. menus and PDA use small, heavy, utilitarian glyphs (stencilled marks, the radiation trefoil).
Cordon uses Phosphor (MIT) in its bold weight, the closest open set in feel: thick filled outlines on a 256 grid.
The sidebar's Library item is Phosphor's radioactive trefoil. This script fetches the pinned SVGs, turns each into
one WPF path string (IconTemplate fills it in the inherited foreground) and renders the menu icons Playnite copies as
PNGs (cairosvg).

    python3 art/icons.py          (from src/themes/Cordon; needs network and: pip install cairosvg)

PNG colors come from src/tokens.css (dim label color for menu icons, the lens red for exit and remove, the LED amber
for the favorite star). Not shipped in the package.
"""
import pathlib
import re
import urllib.request

VERSION = "2.1.1"  # @phosphor-icons/core on npm, MIT license
URL = "https://cdn.jsdelivr.net/npm/@phosphor-icons/core@%s/assets/bold/%s-bold.svg"
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# Icon<Role> geometry -> Phosphor icon name
UI = [
    ("IconSearch", "magnifying-glass"), ("IconClear", "x"), ("IconViewSettings", "sliders-horizontal"),
    ("IconFilterPresets", "bookmark-simple"), ("IconGroup", "stack"), ("IconSort", "arrows-down-up"),
    ("IconDetailsView", "list-dashes"), ("IconGridView", "squares-four"), ("IconListView", "rows"),
    ("IconUpdate", "arrow-circle-down"), ("IconExplorer", "tree-structure"), ("IconRandom", "dice-five"),
    ("IconViewRandom", "shuffle"), ("IconFilter", "funnel"), ("IconNotifications", "bell"),
    ("IconMainMenu", "list"), ("IconLibrary", "radioactive"), ("IconStatistics", "chart-bar"),
    ("IconWindowMinimize", "minus"), ("IconWindowMaximize", "square"), ("IconWindowRestore", "copy"),
    ("IconWindowClose", "x"), ("IconDropDown", "caret-down"), ("IconSubmenu", "caret-right"),
    ("IconCheck", "check"), ("IconAdd", "plus"), ("IconEdit", "pencil-simple"), ("IconRemove", "trash"),
    ("IconOptions", "dots-three"), ("IconPlay", "play"), ("IconInfo", "info"), ("IconDownload", "download-simple"),
]

# Playnite menu icon key -> (Phosphor name, color role)
MENU = [
    ("FullscreenModeIcon", "corners-out", "dim"), ("AddGameIcon", "plus", "dim"),
    ("UpdateDbIcon", "arrows-clockwise", "dim"), ("AboutPlayniteIcon", "info", "dim"),
    ("ExitIcon", "sign-out", "red"), ("SettingsIcon", "gear-six", "dim"), ("AddonsIcon", "puzzle-piece", "dim"),
    ("PlayIcon", "play", "dim"), ("InstallIcon", "download-simple", "dim"), ("LinksIcon", "link", "dim"),
    ("OpenFolderIcon", "folder-open", "dim"), ("InstallSizeIcon", "hard-drives", "dim"),
    ("DesktopShortcutIcon", "app-window", "dim"), ("AddFavoritesIcon", "star", "amber"),
    ("RemoveFavoritesIcon", "star", "dim"), ("HideIcon", "eye-slash", "dim"), ("UnHideIcon", "eye", "dim"),
    ("HdrIcon", "sun", "dim"), ("EditGameIcon", "pencil-simple", "dim"), ("RemoveGameIcon", "trash", "red"),
    ("DiceIcon", "dice-five", "dim"), ("ManualIcon", "book-open", "dim"), ("BackupIcon", "archive", "dim"),
    ("RestoreBackupIcon", "clock-counter-clockwise", "dim"),
]

# Menu PNG color role -> token in tokens.css
COLOR_TOKENS = {"dim": "zone-text-dim", "red": "zone-lens", "amber": "zone-led"}

ARGS = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7, "Z": 0}
NUMBER = re.compile(r"-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?")


def fetch(name):
    cache = pathlib.Path(__file__).resolve().parent / ".cache"
    cache.mkdir(exist_ok=True)
    f = cache / (name + "-bold.svg")
    if not f.exists():
        f.write_bytes(urllib.request.urlopen(URL % (VERSION, name), timeout=30).read())
    return f.read_text(encoding="utf-8")


def num(x):
    s = ("%.3f" % x).rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def norm_path(d):
    """Path data with explicit separators (WPF rejects packed arc flags such as '0,1,1') and a leading moveto."""
    out, cmd, pos, n = [], None, 0, len(d)

    def skip():
        nonlocal pos
        while pos < n and d[pos] in " ,\t\r\n":
            pos += 1

    def number():
        nonlocal pos
        skip()
        m = NUMBER.match(d, pos)
        if not m:
            raise ValueError("bad number at %d in %r" % (pos, d))
        pos = m.end()
        return num(float(m.group(0)))

    def flag():
        nonlocal pos
        skip()
        pos += 1
        return d[pos - 1]

    while True:
        skip()
        if pos >= n:
            break
        if d[pos].isalpha():
            cmd = d[pos]
            pos += 1
            if cmd in "Zz":
                out.append("Z")
                continue
        elif cmd is None:
            raise ValueError("path must start with a command: " + d)
        elif cmd in "Mm":
            cmd = "L" if cmd == "M" else "l"  # implicit lineto after a moveto
        up = cmd.upper()
        if up == "A":
            vals = [number(), number(), number(), flag(), flag(), number(), number()]
        else:
            vals = [number() for _ in range(ARGS[up])]
        out.append(("M" if not out else cmd) + " " + " ".join(vals))
    return " ".join(out)


def svg_to_path(svg):
    parts = [norm_path(m.group(1)) for m in re.finditer(r'<path\b[^>]*?\bd="([^"]*)"', svg)]
    if not parts:
        raise ValueError("no paths")
    return " ".join(parts)


def token_colors():
    css = (SRC / "tokens.css").read_text(encoding="utf-8")
    return {k: re.search(r"--%s:\s*(#[0-9a-fA-F]{6})" % t, css).group(1) for k, t in COLOR_TOKENS.items()}


def main():
    import cairosvg

    colors = token_colors()
    geometries = ['    <!-- phosphor bold: %s -->\n    <Geometry x:Key="%s">F1 %s</Geometry>' % (name, key, svg_to_path(fetch(name)))
                  for key, name in UI]

    outdir = SRC / "Images" / "Phosphor"
    outdir.mkdir(parents=True, exist_ok=True)
    strings, done = [], set()
    for key, name, role in MENU:
        file = "%s%s.png" % (name, "" if role == "dim" else "-" + role)
        if file not in done:
            svg = fetch(name).replace('fill="currentColor"', 'fill="%s"' % colors[role])
            cairosvg.svg2png(bytestring=svg.encode(), write_to=str(outdir / file), output_width=48, output_height=48)
            done.add(file)
        strings.append('    <sys:String x:Key="%s">Images/Phosphor/%s</sys:String>' % (key, file))

    template = (ROOT / "art" / "Media.template.txt").read_text(encoding="utf-8")
    media = template.replace("@@GEOMETRIES@@", "\n".join(geometries)).replace("@@MENUICONS@@", "\n".join(strings))
    (SRC / "Media.xaml").write_text(media, encoding="utf-8")
    print("wrote Media.xaml (%d icons) and %d PNGs" % (len(UI), len(done)))


if __name__ == "__main__":
    main()
