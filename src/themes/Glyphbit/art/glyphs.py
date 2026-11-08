"""Generates Glyphbit's pixel glyphs, deterministically (fixed seed, no game art).

Outputs:
  src/Media.xaml            Icon* geometries, procedural chrome geometries, Playnite's menu icon keys
  src/Images/Glyphs/*.png   menu icons Playnite copies (nearest-neighbour, 48px)
  art/glyphs.js             the same path data for the HTML previews

Every glyph is drawn on an 8x8 grid and doubled to 16x16, so one art pixel is exactly 2px at IconSize.
The rune columns are procedural noise on a seed: they echo the idea of an unreadable script without being one.

Run from anywhere: python src/themes/Glyphbit/art/glyphs.py
"""
import json
import random
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / "src"
IMG = SRC / "Images" / "Glyphs"

BONE = (254, 254, 254, 255)
RED = (224, 22, 30, 255)
AMBER = (217, 160, 44, 255)

G = {
    "Search": """
.####...
#....#..
#....#..
#....#..
#....#..
.####...
.....##.
......##""",
    "Clear": """
##....##
###..###
.######.
..####..
..####..
.######.
###..###
##....##""",
    "ViewSettings": """
...##...
..#..#..
.#.##.#.
#.#..#.#
#.#..#.#
.#.##.#.
..#..#..
...##...""",
    "FilterPresets": """
########
.######.
..####..
...##...
........
########
.######.
..####..""",
    "Group": """
...##...
...##...
........
##....##
##....##
........
...##...
...##...""",
    "Sort": """
########
........
.######.
........
..####..
........
...##...
........""",
    "DetailsView": """
##.#####
##.#####
........
##.#####
##.#####
........
##.#####
##.#####""",
    "GridView": """
##.##.##
##.##.##
........
##.##.##
##.##.##
........
##.##.##
##.##.##""",
    "ListView": """
########
........
########
........
########
........
########
........""",
    "Update": """
...##...
..####..
.######.
##.##.##
...##...
...##...
........
########""",
    "Explorer": """
####....
#..#....
####....
.#......
.#.#####
.###...#
...#####
........""",
    "Random": """
########
#......#
#.##...#
#.##...#
#...##.#
#...##.#
#......#
########""",
    "ViewRandom": """
#####...
#...#...
#.#.####
#...#..#
#####.##
...#.#.#
...#...#
...#####""",
    "Filter": """
########
########
.######.
..####..
...##...
...##...
...##...
...##...""",
    "Notifications": """
...##...
..####..
..####..
.######.
.######.
########
........
...##...""",
    "MainMenu": """
##....##
########
...##...
.##..##.
.##..##.
...##...
########
##....##""",
    "Library": """
##.##.##
##.##.##
##.##.##
##.##.##
##.##.##
##.##.##
##.##.##
########""",
    "Statistics": """
......##
......##
...##.##
...##.##
##.##.##
##.##.##
##.##.##
##.##.##""",
    "WindowMinimize": """
........
........
........
........
........
.######.
.######.
........""",
    "WindowMaximize": """
........
.######.
.#....#.
.#....#.
.#....#.
.#....#.
.######.
........""",
    "WindowRestore": """
...####.
...#..#.
.####.#.
.#..###.
.#..#...
.####...
........
........""",
    "WindowClose": """
........
.##..##.
..####..
...##...
..####..
.##..##.
........
........""",
    "DropDown": """
........
........
########
.######.
..####..
...##...
........
........""",
    "Submenu": """
..#.....
..##....
..###...
..####..
..####..
..###...
..##....
..#.....""",
    "Check": """
........
......##
.....##.
##..##..
.####...
..##....
........
........""",
    "Add": """
...##...
...##...
...##...
########
########
...##...
...##...
...##...""",
    "Edit": """
.....##.
....##.#
...##.#.
..##.#..
.##.#...
##.#....
###.....
##......""",
    "Remove": """
.######.
########
.#.##.#.
.#.##.#.
.#.##.#.
.#.##.#.
.#.##.#.
.######.""",
    "Options": """
...##...
...##...
........
...##...
...##...
........
...##...
...##...""",
    "Play": """
.##.....
.####...
.######.
.#######
.#######
.######.
.####...
.##.....""",
    "Info": """
...##...
...##...
........
.####...
...##...
...##...
...##...
.######.""",
    "Download": """
...##...
...##...
...##...
##.##.##
.######.
..####..
...##...
########""",
}

MENU = {
    "AddGameIcon": ("add", BONE, "Add"),
    "UpdateDbIcon": ("update", BONE, "Update"),
    "AboutPlayniteIcon": ("about", BONE, "Info"),
    "ExitIcon": ("exit", RED, "Clear"),
    "SettingsIcon": ("settings", BONE, "ViewSettings"),
    "AddonsIcon": ("addons", BONE, """
###.###.
###.###.
###.###.
........
###..#..
###.###.
###..#..
........"""),
    "PlayIcon": ("play", BONE, "Play"),
    "InstallIcon": ("install", BONE, "Download"),
    "LinksIcon": ("links", BONE, """
####....
#..#....
#..####.
####..#.
...#..#.
...#..#.
...####.
........"""),
    "OpenFolderIcon": ("folder", BONE, """
###.....
#..####.
#.....#.
#######.
#.....#.
#.....#.
#######.
........"""),
    "InstallSizeIcon": ("size", BONE, """
########
#......#
########
#......#
########
#......#
########
........"""),
    "DesktopShortcutIcon": ("desktop", BONE, """
########
#......#
#......#
#......#
########
...##...
.######.
........"""),
    "AddFavoritesIcon": ("favorite", AMBER, """
...##...
..####..
.######.
########
########
.######.
..####..
...##..."""),
    "RemoveFavoritesIcon": ("unfavorite", BONE, """
...##...
..#..#..
.#....#.
#......#
#......#
.#....#.
..#..#..
...##..."""),
    "HideIcon": ("hide", BONE, """
#.......
.#.####.
..#...##
#..#...#
#...#..#
##...#..
.####.#.
.......#"""),
    "UnHideIcon": ("unhide", BONE, """
........
..####..
.#....#.
#..##..#
#..##..#
.#....#.
..####..
........"""),
    "HdrIcon": ("hdr", BONE, """
#..##..#
........
..####..
#.####.#
#.####.#
..####..
........
#..##..#"""),
    "EditGameIcon": ("edit", BONE, "Edit"),
    "RemoveGameIcon": ("remove", RED, "Remove"),
    "DiceIcon": ("dice", BONE, "Random"),
    "ManualIcon": ("manual", BONE, """
###..###
#..##..#
#..##..#
#..##..#
#..##..#
#..##..#
###..###
........"""),
    "BackupIcon": ("backup", BONE, """
...##...
..####..
.######.
...##...
#..##..#
#......#
########
........"""),
    "RestoreBackupIcon": ("restore", BONE, """
...##...
...##...
.######.
..####..
#..##..#
#......#
########
........"""),
    "FullscreenModeIcon": ("fullscreen", BONE, """
###..###
#......#
#......#
........
........
#......#
#......#
###..###"""),
}

# Large empty-slot module for the no-game page: stepped diamond, ring and core. 16x16, doubled to 64px at 4px a cell.
MODULE = """
.......##.......
......####......
.....##..##.....
....##....##....
...##..##..##...
..##..#..#..##..
.##..#.##.#..##.
##..#.####.#..##
##..#.####.#..##
.##..#.##.#..##.
..##..#..#..##..
...##..##..##...
....##....##....
.....##..##.....
......####......
.......##......."""


def rows(text):
    return [r for r in text.strip("\n").split("\n")]


def runs(bitmap, scale):
    """Merged horizontal runs as relative-free path figures."""
    out = []
    for y, row in enumerate(bitmap):
        x = 0
        while x < len(row):
            if row[x] == "#":
                start = x
                while x < len(row) and row[x] == "#":
                    x += 1
                out.append(f"M{start*scale},{y*scale}h{(x-start)*scale}v{scale}h{-(x-start)*scale}z")
            else:
                x += 1
    return "".join(out)


def check(name, bitmap, width):
    assert len(bitmap) == width, f"{name}: {len(bitmap)} rows"
    assert all(len(r) == width for r in bitmap), f"{name}: bad row width"


def png(path, bitmap, color, size=48):
    n = len(bitmap)
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    for y, row in enumerate(bitmap):
        for x, cell in enumerate(row):
            if cell == "#":
                img.putpixel((x, y), color)
    img.resize((size, size), Image.NEAREST).save(path, optimize=True)


def rune_column(rng, cells=26):
    """5 cells wide, grouped in small blocks with gaps, 1 cell = 2px."""
    out, y = [], 0
    while y < cells:
        height = rng.choice([2, 3, 4])
        for row in range(height):
            for x in range(5):
                if rng.random() < 0.55:
                    out.append(f"M{x*2},{(y+row)*2}h2v2h-2z")
        y += height + rng.choice([2, 3, 5])
    return "".join(out)


def rune_strip(rng, cols=5, cells=70):
    """Dense scannable-looking noise, 2px cells; thins out along its length."""
    out = []
    for y in range(cells):
        density = 0.72 - 0.55 * (y / cells)
        for x in range(cols):
            if rng.random() < density:
                out.append(f"M{x*2},{y*2}h2v2h-2z")
    return "".join(out)


def crumble(rng, width=2880, height=40, cell=8):
    """Ragged pixel skyline, filled below: the eroded edge under the banner."""
    level, path, x = height / 2, [f"M0,{height}"], 0
    while x <= width:
        level = max(0, min(height - 8, level + rng.choice([-16, -8, -8, 0, 8, 8, 16])))
        snapped = int(level / 4) * 4
        path.append(f"V{snapped}H{x + cell}")
        x += cell
    path.append(f"V{height}H0z")
    return "".join(path)


def scanlines(width=2880, height=600, step=3):
    return "".join(f"M0,{y}H{width}V{y+1}H0z" for y in range(0, height, step))


def main():
    rng = random.Random(4117)
    IMG.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, art in G.items():
        bm = rows(art)
        check(name, bm, 8)
        paths[name] = runs(bm, 2)

    module = rows(MODULE)
    check("module", module, 16)
    chrome = {
        "EmptyGameIcon": runs(module, 4),
        "IconGlyphColumn": rune_column(rng),
        "IconGlyphStrip": rune_strip(rng),
        "IconCrumbleEdge": crumble(rng),
        "IconScanlines": scanlines(),
    }

    lines = [
        "<!--",
        "    Glyphbit: icons. Generated by art/glyphs.py; edit the generator, not this file.",
        "    Icon* are pixel glyphs on a 16x16 canvas (8x8 art doubled). Playnite's menu icon keys are PNG paths,",
        "    because Playnite rebuilds those keys from a TextBlock and a vector would be lost.",
        "-->",
        '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"',
        '                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"',
        '                    xmlns:sys="clr-namespace:System;assembly=mscorlib">',
    ]
    for name, data in paths.items():
        lines.append(f'    <Geometry x:Key="Icon{name}">F1{data}</Geometry>')
    for name, data in chrome.items():
        lines.append(f'    <Geometry x:Key="{name}">F1{data}</Geometry>')
    lines += [
        '    <DataTemplate x:Key="IconTemplate">',
        '        <Viewbox Width="{DynamicResource IconSize}" Height="{DynamicResource IconSize}">',
        '            <Canvas Width="16" Height="16">',
        '                <Path Data="{Binding}" Fill="{Binding Foreground, RelativeSource={RelativeSource AncestorType=ContentControl}}" SnapsToDevicePixels="True" />',
        "            </Canvas>",
        "        </Viewbox>",
        "    </DataTemplate>",
        '    <DataTemplate x:Key="IconSmallTemplate">',
        '        <Viewbox Width="12" Height="12">',
        '            <Canvas Width="16" Height="16">',
        '                <Path Data="{Binding}" Fill="{Binding Foreground, RelativeSource={RelativeSource AncestorType=ContentControl}}" SnapsToDevicePixels="True" />',
        "            </Canvas>",
        "        </Viewbox>",
        "    </DataTemplate>",
        '    <DataTemplate x:Key="ClearTextIconTemplate">',
        '        <ContentControl Content="{DynamicResource IconClear}" ContentTemplate="{DynamicResource IconSmallTemplate}" />',
        "    </DataTemplate>",
        '    <DataTemplate x:Key="SearchTextIconTemplate">',
        '        <ContentControl Content="{DynamicResource IconSearch}" ContentTemplate="{DynamicResource IconTemplate}" />',
        "    </DataTemplate>",
    ]
    for key, (file, color, art) in MENU.items():
        bm = rows(G[art]) if art in G else rows(art)
        check(key, bm, 8)
        png(IMG / f"{file}.png", bm, color)
        lines.append(f'    <sys:String x:Key="{key}">Images/Glyphs/{file}.png</sys:String>')
    lines.append("</ResourceDictionary>")
    (SRC / "Media.xaml").write_text("\n".join(lines) + "\n", encoding="utf-8")

    js = {k: v for k, v in paths.items()}
    js.update(chrome)
    (HERE / "glyphs.js").write_text("window.GLYPHS=" + json.dumps(js) + ";\n", encoding="utf-8")
    print(f"{len(paths)} glyphs, {len(MENU)} menu icons")


if __name__ == "__main__":
    main()
