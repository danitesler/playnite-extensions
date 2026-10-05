#!/usr/bin/env python3
"""Generates the icon parts of Calling Card: src/Media.xaml, src/Images/Heroicons/*.png and art/mark.svg.

The Persona 5 menus draw chunky, solid white glyphs. Calling Card uses Heroicons 2.2.0 solid (MIT, tailwindlabs/heroicons),
the heaviest open set that covers Playnite's roles: filled shapes on a 24 grid. This script fetches the pinned SVGs,
joins each icon's paths into one WPF path string (IconTemplate fills it in the inherited foreground) and renders the
menu icons Playnite copies as 48px PNGs. The star mark and the window buttons are drawn here, not taken from the set.

    python3 art/icons.py          (from src/themes/CallingCard; needs network and: pip install cairosvg)

PNG colors come from src/tokens.css (paper for menu icons, red for exit and remove, amber for the favorites star).
Not shipped in the package.
"""
import math, pathlib, re, urllib.request

VERSION = "2.2.0"  # heroicons on npm, MIT license
URL = "https://cdn.jsdelivr.net/npm/heroicons@%s/24/solid/%s.svg"
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
SRC = ROOT / "src"

# Icon<Role> geometry -> Heroicons solid name (None: drawn below)
UI = [
    ("IconSearch", "magnifying-glass"), ("IconClear", "x-mark"), ("IconViewSettings", "adjustments-horizontal"),
    ("IconFilterPresets", "bookmark"), ("IconGroup", "square-3-stack-3d"), ("IconSort", "arrows-up-down"),
    ("IconDetailsView", "list-bullet"), ("IconGridView", "squares-2x2"), ("IconListView", "queue-list"),
    ("IconUpdate", "arrow-down-circle"), ("IconExplorer", "folder-open"), ("IconRandom", "sparkles"),
    ("IconViewRandom", "arrows-right-left"), ("IconFilter", "funnel"), ("IconNotifications", "bell"),
    ("IconMainMenu", None), ("IconLibrary", "rectangle-stack"), ("IconStatistics", "chart-bar"),
    ("IconWindowMinimize", None), ("IconWindowMaximize", None), ("IconWindowRestore", None),
    ("IconWindowClose", "x-mark"), ("IconDropDown", "chevron-down"), ("IconSubmenu", "chevron-right"),
    ("IconCheck", "check"), ("IconAdd", "plus"), ("IconEdit", "pencil"), ("IconRemove", "trash"),
    ("IconOptions", "ellipsis-horizontal"), ("IconPlay", "play"), ("IconInfo", "information-circle"),
    ("IconDownload", "arrow-down-tray"),
]

# Playnite menu icon key -> (Heroicons name, color)
MENU = [
    ("FullscreenModeIcon", "arrows-pointing-out", "paper"), ("AddGameIcon", "plus", "paper"),
    ("UpdateDbIcon", "arrow-path", "paper"), ("AboutPlayniteIcon", "information-circle", "paper"),
    ("ExitIcon", "arrow-right-start-on-rectangle", "red"), ("SettingsIcon", "cog-6-tooth", "paper"),
    ("AddonsIcon", "puzzle-piece", "paper"), ("PlayIcon", "play", "paper"), ("InstallIcon", "arrow-down-tray", "paper"),
    ("LinksIcon", "link", "paper"), ("OpenFolderIcon", "folder-open", "paper"), ("InstallSizeIcon", "server", "paper"),
    ("DesktopShortcutIcon", "computer-desktop", "paper"), ("AddFavoritesIcon", "star", "amber"),
    ("RemoveFavoritesIcon", "star", "paper"), ("HideIcon", "eye-slash", "paper"), ("UnHideIcon", "eye", "paper"),
    ("HdrIcon", "sun", "paper"), ("EditGameIcon", "pencil", "paper"), ("RemoveGameIcon", "trash", "red"),
    ("DiceIcon", "sparkles", "paper"), ("ManualIcon", "book-open", "paper"), ("BackupIcon", "archive-box", "paper"),
    ("RestoreBackupIcon", "clock", "paper"),
]


def num(x):
    s = ("%.3f" % x).rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def star(cx=12.0, cy=12.4, outer=11.2, inner=4.7, tilt=-12.0):
    """The mark: a five-pointed star knocked off level, like the stars stamped over the menus."""
    pts = []
    for i in range(10):
        r = outer if i % 2 == 0 else inner
        a = math.radians(-90 + tilt + i * 36)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return "M " + " L ".join("%s %s" % (num(x), num(y)) for x, y in pts) + " Z"


# Window buttons: square-cut, 24 grid, 1.75 thick, like every plate in the menus.
DRAWN = {
    "IconMainMenu": star(),
    "IconWindowMinimize": "M 5 11.125 H 19 V 12.875 H 5 Z",
    "IconWindowMaximize": "M 5 5 H 19 V 19 H 5 Z M 6.75 6.75 V 17.25 H 17.25 V 6.75 Z",
    "IconWindowRestore": "M 8 4 H 20 V 16 H 16 V 14.25 H 18.25 V 5.75 H 9.75 V 8 H 8 Z "
                         "M 4 8 H 16 V 20 H 4 Z M 5.75 9.75 V 18.25 H 14.25 V 9.75 Z",
}


def fetch(name):
    cache = HERE / ".cache"
    cache.mkdir(exist_ok=True)
    f = cache / (name + ".svg")
    if not f.exists():
        f.write_bytes(urllib.request.urlopen(URL % (VERSION, name), timeout=30).read())
    return f.read_text(encoding="utf-8")


COUNT = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7}


def wpf_path(d):
    """SVG path data -> WPF path data with every number separated (WPF rejects packed arc flags such as '0 1 1')."""
    out, cmd, i = [], None, 0
    toks = []
    for m in re.finditer(r"[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?", d):
        toks.append(m.group(0))
    # Arc flags may be packed ("a.75.75 0 1 1"): split single-digit flags out of numbers inside arcs.
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t
            i += 1
            if cmd in "Zz":
                out.append("Z")
            continue
        up = cmd.upper()
        n = COUNT[up]
        args = toks[i:i + n]
        if up == "A":
            fixed = []
            j = i
            while len(fixed) < 7:
                v = toks[j]
                if len(fixed) in (3, 4) and len(v) > 1 and v[0] in "01" and v[1] != ".":
                    fixed.append(v[0])
                    toks[j] = v[1:]
                    continue
                fixed.append(v)
                j += 1
            args, i = fixed, j
        else:
            i += n
        out.append(cmd + " " + " ".join(a if (up == "A" and k in (3, 4)) else num(float(a)) for k, a in enumerate(args)))
        if cmd == "M":
            cmd = "L"
        elif cmd == "m":
            cmd = "l"
    return " ".join(out)


def svg_geometry(svg):
    # A path's first moveto is absolute even when written "m"; joined into one geometry it must say so.
    parts = [re.sub(r"^m ", "M ", wpf_path(m.group(1))) for m in re.finditer(r'<path\b[^>]*?\bd="([^"]*)"', svg)]
    if not parts:
        raise ValueError("no paths")
    return " ".join(parts)


def token_colors():
    css = (SRC / "tokens.css").read_text(encoding="utf-8")
    return {k: re.search(r"--%s:\s*(#[0-9a-fA-F]{6})" % k, css).group(1) for k in ("paper", "red", "amber")}


HEADER = """<!--
    Overlay on Playnite Default/Media.xaml. GENERATED by art/icons.py: edit the script, not this file.
    Icon set: Heroicons %s solid (MIT, info/LICENSE-heroicons.txt), the heaviest open set that covers Playnite's
    roles; the Persona 5 menus draw chunky solid glyphs. Each Icon<Role> is one path string on a 24 grid, filled by
    IconTemplate in the inherited foreground; the host sets the size (IconSize). IconMainMenu is the theme's own
    tilted star; the window buttons are square-cut and drawn in the script.

    Menu icons (main menu, game menu) are theme file paths: Playnite's MenuHelpers.GetIcon loads a string resource as an
    image through ThemeFile. Images/Heroicons holds them at 48px in paper (red for exit and remove, amber for the
    favorites star).
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib">
"""

FOOTER = """
    <!-- Content = one of the geometries above, filled in the inherited foreground. -->
    <DataTemplate x:Key="IconTemplate">
        <Viewbox Stretch="Uniform">
            <Canvas Width="24" Height="24">
                <Path Data="{Binding}"
                      Fill="{Binding (TextElement.Foreground), RelativeSource={RelativeSource Self}}" />
            </Canvas>
        </Viewbox>
    </DataTemplate>

    <DataTemplate x:Key="SearchTextIconTemplate">
        <ContentPresenter Width="16" Height="16"
                          Content="{DynamicResource IconSearch}"
                          ContentTemplate="{DynamicResource IconTemplate}" />
    </DataTemplate>

    <DataTemplate x:Key="ClearTextIconTemplate">
        <ContentPresenter Width="14" Height="14"
                          Content="{DynamicResource IconClear}"
                          ContentTemplate="{DynamicResource IconTemplate}" />
    </DataTemplate>

    <!-- Main menu and game menu icons (Images/Heroicons, 48px PNGs) -->
%s
</ResourceDictionary>
"""


def main():
    colors = token_colors()
    lines = []
    for key, name in UI:
        if name is None:
            lines.append('    <!-- drawn -->\n    <Geometry x:Key="%s">F1 %s</Geometry>' % (key, DRAWN[key]))
        else:
            # Heroicons solid cut holes with evenodd; F0 keeps them open.
            lines.append('    <!-- heroicons: %s -->\n    <Geometry x:Key="%s">F0 %s</Geometry>' % (name, key, svg_geometry(fetch(name))))

    import cairosvg
    outdir = SRC / "Images" / "Heroicons"
    outdir.mkdir(parents=True, exist_ok=True)
    strings, done = [], set()
    for key, name, col in MENU:
        file = "%s%s.png" % (name, "" if col == "paper" else "-" + col)
        if file not in done:
            svg = fetch(name).replace('fill="currentColor"', 'fill="%s"' % colors[col])
            cairosvg.svg2png(bytestring=svg.encode(), write_to=str(outdir / file), output_width=48, output_height=48)
            done.add(file)
        strings.append('    <sys:String x:Key="%s">Images/Heroicons/%s</sys:String>' % (key, file))

    (SRC / "Media.xaml").write_text(HEADER % VERSION + "\n".join(lines) + "\n" + FOOTER % "\n".join(strings), encoding="utf-8")

    mark = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n'
            '  <path fill="#000" d="%s"/>\n</svg>\n' % star())
    (HERE / "mark.svg").write_text(mark, encoding="utf-8")
    print("wrote Media.xaml (%d icons), %d PNGs, art/mark.svg" % (len(UI), len(done)))


if __name__ == "__main__":
    main()
