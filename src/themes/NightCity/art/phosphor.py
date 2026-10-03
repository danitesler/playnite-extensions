#!/usr/bin/env python3
"""Generates the icon parts of Frontier: src/Media.xaml and src/Images/Phosphor/*.png.

The Red Dead Redemption 2 menus draw small, solid, slightly rounded white glyphs. Frontier uses Phosphor (MIT) in its
regular weight, the closest open set in feel: filled outlines on a 256 grid with soft ends. This script fetches the
pinned SVGs, turns each into one WPF path string (IconTemplate fills it in the inherited foreground) and renders the
menu icons Playnite copies as PNGs (cairosvg).

    python3 art/phosphor.py          (from src/themes/Frontier; needs network and: pip install cairosvg)

PNG colors come from src/tokens.css (dim text for menu icons, the menu red for exit and remove, gold for the star).
Not shipped in the package.
"""
import re, pathlib, urllib.request

VERSION = "2.1.1"  # @phosphor-icons/core on npm, MIT license
URL = "https://cdn.jsdelivr.net/npm/@phosphor-icons/core@%s/assets/regular/%s.svg"
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# Icon<Role> geometry -> Phosphor icon name
UI = [
    ("IconSearch", "magnifying-glass"), ("IconClear", "x"), ("IconViewSettings", "sliders-horizontal"),
    ("IconFilterPresets", "bookmark-simple"), ("IconGroup", "stack"), ("IconSort", "arrows-down-up"),
    ("IconDetailsView", "list-dashes"), ("IconGridView", "squares-four"), ("IconListView", "rows"),
    ("IconUpdate", "arrow-circle-down"), ("IconExplorer", "tree-structure"), ("IconRandom", "dice-five"),
    ("IconViewRandom", "shuffle"), ("IconFilter", "funnel-simple"), ("IconNotifications", "bell"),
    ("IconMainMenu", "list"), ("IconLibrary", "horse"), ("IconStatistics", "chart-bar"),
    ("IconWindowMinimize", "minus"), ("IconWindowMaximize", "square"), ("IconWindowRestore", "copy"),
    ("IconWindowClose", "x"), ("IconDropDown", "caret-down"), ("IconSubmenu", "caret-right"),
    ("IconCheck", "check"), ("IconAdd", "plus"), ("IconEdit", "pencil-simple"), ("IconRemove", "trash"),
    ("IconOptions", "dots-three"), ("IconPlay", "play"), ("IconInfo", "info"), ("IconDownload", "download-simple"),
]

# Playnite menu icon key -> (Phosphor name, color token)
MENU = [
    ("FullscreenModeIcon", "corners-out", "dim"), ("AddGameIcon", "plus", "dim"),
    ("UpdateDbIcon", "arrows-clockwise", "dim"), ("AboutPlayniteIcon", "info", "dim"),
    ("ExitIcon", "sign-out", "red"), ("SettingsIcon", "gear-six", "dim"), ("AddonsIcon", "puzzle-piece", "dim"),
    ("PlayIcon", "play", "dim"), ("InstallIcon", "download-simple", "dim"), ("LinksIcon", "link", "dim"),
    ("OpenFolderIcon", "folder-open", "dim"), ("InstallSizeIcon", "hard-drives", "dim"),
    ("DesktopShortcutIcon", "app-window", "dim"), ("AddFavoritesIcon", "star", "gold"),
    ("RemoveFavoritesIcon", "star", "dim"), ("HideIcon", "eye-slash", "dim"), ("UnHideIcon", "eye", "dim"),
    ("HdrIcon", "sun", "dim"), ("EditGameIcon", "pencil-simple", "dim"), ("RemoveGameIcon", "trash", "red"),
    ("DiceIcon", "dice-five", "dim"), ("ManualIcon", "book-open", "dim"), ("BackupIcon", "archive", "dim"),
    ("RestoreBackupIcon", "clock-counter-clockwise", "dim"),
]

# Menu PNG color -> token in tokens.css
COLOR_TOKENS = {"dim": "rdr-text-dim", "red": "rdr-red", "gold": "rdr-gold"}


def fetch(name):
    cache = pathlib.Path(__file__).resolve().parent / ".cache"
    cache.mkdir(exist_ok=True)
    f = cache / (name + ".svg")
    if not f.exists():
        f.write_bytes(urllib.request.urlopen(URL % (VERSION, name), timeout=30).read())
    return f.read_text(encoding="utf-8")


def num(x):
    s = ("%.3f" % x).rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


ARGS = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7, "Z": 0}
NUMBER = re.compile(r"-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?")


def norm_path(d):
    """Re-emit path data with explicit separators (WPF rejects packed arc flags) and an absolute first moveto."""
    out, cmd, first, pos, n = [], None, True, 0, len(d)

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
        return m.group(0)

    def flag():
        nonlocal pos
        skip()
        c = d[pos]
        pos += 1
        return c

    while True:
        skip()
        if pos >= n:
            break
        c = d[pos]
        if c.isalpha():
            cmd = c
            pos += 1
            if cmd in "Zz":
                out.append("Z")
                continue
        elif cmd is None:
            raise ValueError("path must start with a command: " + d)
        elif cmd in "Mm":
            cmd = "L" if cmd == "M" else "l"
        up = cmd.upper()
        vals = [number(), number(), number(), flag(), flag(), number(), number()] if up == "A" else [number() for _ in range(ARGS[up])]
        letter = "M" if first else cmd
        first = False
        out.append(letter + " " + " ".join(v if (up == "A" and k in (3, 4)) else num(float(v)) for k, v in enumerate(vals)))
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
    colors = token_colors()
    lines = []
    for key, name in UI:
        lines.append('    <!-- phosphor: %s -->\n    <Geometry x:Key="%s">F1 %s</Geometry>' % (name, key, svg_to_path(fetch(name))))

    import cairosvg
    outdir = SRC / "Images" / "Phosphor"
    outdir.mkdir(parents=True, exist_ok=True)
    strings, done = [], set()
    for key, name, col in MENU:
        file = "%s%s.png" % (name, "" if col == "dim" else "-" + col)
        if file not in done:
            svg = fetch(name).replace('fill="currentColor"', 'fill="%s"' % colors[col])
            cairosvg.svg2png(bytestring=svg.encode(), write_to=str(outdir / file), output_width=48, output_height=48)
            done.add(file)
        strings.append('    <sys:String x:Key="%s">Images/Phosphor/%s</sys:String>' % (key, file))

    template = (ROOT / "art" / "Media.template.txt").read_text(encoding="utf-8")
    media = template.replace("@@GEOMETRIES@@", "\n".join(lines)).replace("@@MENUICONS@@", "\n".join(strings))
    (SRC / "Media.xaml").write_text(media, encoding="utf-8")
    print("wrote Media.xaml (%d icons) and %d PNGs" % (len(UI), len(done)))


if __name__ == "__main__":
    main()
