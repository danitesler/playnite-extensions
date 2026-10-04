#!/usr/bin/env python3
"""Generates the icon parts of Payload: src/Media.xaml and src/Images/Symbols/*.png.

The Overwatch 2 menus draw chunky filled glyphs with square cuts and no inner outlines (the role, social, career and
settings icons). Payload uses Google's Material Symbols in the Sharp style, weight 700, filled (Apache-2.0): solid
shapes with square terminals on a 960 grid. This script fetches the pinned SVGs, turns each into one WPF path string
(IconTemplate fills it in the inherited foreground and shifts the grid's negative y origin) and renders the menu icons
Playnite copies as PNGs (cairosvg).

    python3 art/icons.py          (from src/themes/Payload; needs network and: pip install cairosvg)

PNG colors come from src/tokens.css (menu-row white, the orange for the favorite star, the enemy red for exit and
remove). Not shipped in the package.
"""
import re, pathlib, urllib.request

VERSION = "0.27.0"  # @material-symbols/svg-700 on npm, Apache-2.0 license
URL = "https://cdn.jsdelivr.net/npm/@material-symbols/svg-700@%s/sharp/%s.svg"
# Names are filled by default; "name:outline" takes the unfilled glyph.
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# Icon<Role> geometry -> Material Symbols name
UI = [
    ("IconSearch", "search"), ("IconClear", "close"), ("IconViewSettings", "tune"),
    ("IconFilterPresets", "bookmark"), ("IconGroup", "stacks"), ("IconSort", "swap_vert"),
    ("IconDetailsView", "view_list"), ("IconGridView", "grid_view"), ("IconListView", "view_agenda"),
    ("IconUpdate", "downloading"), ("IconExplorer", "account_tree"), ("IconRandom", "casino"),
    ("IconViewRandom", "shuffle"), ("IconFilter", "filter_alt"), ("IconNotifications", "notifications"),
    ("IconMainMenu", "menu"), ("IconLibrary", "sports_esports"), ("IconStatistics", "leaderboard"),
    ("IconWindowMinimize", "remove"), ("IconWindowMaximize", "crop_square"), ("IconWindowRestore", "filter_none"),
    ("IconWindowClose", "close"), ("IconDropDown", "arrow_drop_down"), ("IconSubmenu", "arrow_right"),
    ("IconCheck", "check"), ("IconAdd", "add"), ("IconEdit", "edit"), ("IconRemove", "delete"),
    ("IconOptions", "more_horiz"), ("IconPlay", "play_arrow"), ("IconInfo", "info"), ("IconDownload", "download"),
]

# Playnite menu icon key -> (Material Symbols name, color token)
MENU = [
    ("FullscreenModeIcon", "fullscreen", "text"), ("AddGameIcon", "add", "text"),
    ("UpdateDbIcon", "sync", "text"), ("AboutPlayniteIcon", "info", "text"),
    ("ExitIcon", "logout", "red"), ("SettingsIcon", "settings", "text"), ("AddonsIcon", "extension", "text"),
    ("PlayIcon", "play_arrow", "text"), ("InstallIcon", "download", "text"), ("LinksIcon", "link", "text"),
    ("OpenFolderIcon", "folder_open", "text"), ("InstallSizeIcon", "hard_drive", "text"),
    ("DesktopShortcutIcon", "desktop_windows", "text"), ("AddFavoritesIcon", "star", "orange"),
    ("RemoveFavoritesIcon", "star:outline", "text"), ("HideIcon", "visibility_off", "text"), ("UnHideIcon", "visibility", "text"),
    ("HdrIcon", "hdr_on", "text"), ("EditGameIcon", "edit", "text"), ("RemoveGameIcon", "delete", "red"),
    ("DiceIcon", "casino", "text"), ("ManualIcon", "menu_book", "text"), ("BackupIcon", "archive", "text"),
    ("RestoreBackupIcon", "history", "text"),
]

# Menu PNG color -> token in tokens.css
COLOR_TOKENS = {"text": "ow-text", "red": "ow-enemy", "orange": "ow-color-orange-150"}


def fetch(name):
    cache = pathlib.Path(__file__).resolve().parent / ".cache"
    cache.mkdir(exist_ok=True)
    base, _, style = name.partition(":")
    file = base if style == "outline" else base + "-fill"
    f = cache / ("%s.svg" % file)
    if not f.exists():
        f.write_bytes(urllib.request.urlopen(URL % (VERSION, file), timeout=30).read())
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
        lines.append('    <!-- material symbols sharp 700: %s -->\n    <Geometry x:Key="%s">F1 %s</Geometry>' % (name, key, svg_to_path(fetch(name))))

    import cairosvg
    outdir = SRC / "Images" / "Symbols"
    outdir.mkdir(parents=True, exist_ok=True)
    strings, done = [], set()
    for key, name, col in MENU:
        file = "%s%s%s.png" % (name.partition(":")[0], "-outline" if name.endswith(":outline") else "", "" if col == "text" else "-" + col)
        if file not in done:
            svg = fetch(name).replace("<path ", '<path fill="%s" ' % colors[col])
            cairosvg.svg2png(bytestring=svg.encode(), write_to=str(outdir / file), output_width=48, output_height=48)
            done.add(file)
        strings.append('    <sys:String x:Key="%s">Images/Symbols/%s</sys:String>' % (key, file))

    template = (ROOT / "art" / "Media.template.txt").read_text(encoding="utf-8")
    media = template.replace("@@GEOMETRIES@@", "\n".join(lines)).replace("@@MENUICONS@@", "\n".join(strings))
    (SRC / "Media.xaml").write_text(media, encoding="utf-8")
    print("wrote Media.xaml (%d icons) and %d PNGs" % (len(UI), len(done)))


if __name__ == "__main__":
    main()
