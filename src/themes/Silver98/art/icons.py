#!/usr/bin/env python3
"""Silver 98 icon & menu sprite generator (art/icons.py).

Generates:
1. 16x16 whole-pixel vector StreamGeometry entries in src/Media.xaml (between ICONS:BEGIN and ICONS:END)
   for every Playnite Icon<Role> + Local* geometry in authentic Windows 95 / Windows 98 pixel silhouette.
2. Full-color 48x48 (3x nearest-neighbor scaled 16x16) classic 16-color VGA pixel-art PNG icons
   in src/Images/Win98/*.png for all 24 Playnite context-menu keys.
3. White-mask FX pattern PNGs in src/Images/fx/ (dither-checker.png for Win95/98 dithered scrollbar tracks
   and checked toolbar wells, progress-blocks.png for segmented navy progress bars).
4. art/mark.svg (the original Classic 90s CRT Computer & Cascading Window emblem for render-addon-icon.ps1).
"""
import os
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
THEME = HERE.parent
N = 16

# Classic Windows 95 / 98 16-Color VGA Palette
PAL = {
    ".": (0, 0, 0, 0),         # Transparent
    "K": (0, 0, 0, 255),       # Black outline / shadow (#000000)
    "W": (255, 255, 255, 255), # Pure White highlight (#FFFFFF)
    "S": (192, 192, 192, 255), # 3D Face Silver (#C0C0C0)
    "G": (128, 128, 128, 255), # 3D Shadow Dark Grey (#808080)
    "Y": (255, 255, 0, 255),   # Manila Folder / Star Bright Yellow (#FFFF00)
    "O": (192, 148, 0, 255),   # Folder / Gold Ochre Shadow (#C09400)
    "N": (0, 0, 128, 255),     # Title Bar Navy Blue (#000080)
    "B": (16, 132, 208, 255),  # Windows 98 Title Blue (#1084D0)
    "C": (0, 255, 255, 255),   # Screen / Lens Bright Cyan (#00FFFF)
    "T": (0, 128, 128, 255),   # Desktop Teal (#008080)
    "L": (0, 255, 0, 255),     # Bright LED Lime Green (#00FF00)
    "E": (0, 128, 0, 255),     # Classic Forest Green (#008000)
    "R": (255, 0, 0, 255),     # Bright Alert Red (#FF0000)
    "M": (128, 0, 0, 255),     # Dark Maroon Red (#800000)
    "P": (255, 0, 255, 255),   # Magenta (#FF00FF)
    "V": (128, 0, 128, 255),   # Purple (#800080)
}


def rows_to_rects(rows):
    """Convert a 16-line ASCII bitmap (non-'.' is filled) into merged horizontal/vertical SVG/XAML rectangles."""
    grid = [[c != "." for c in row.ljust(N, ".")[:N]] for row in rows[:N]]
    while len(grid) < N:
        grid.append([False] * N)
    runs = {}
    for y in range(N):
        x = 0
        while x < N:
            if grid[y][x]:
                x0 = x
                while x < N and grid[y][x]:
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


def rows_to_path(rows):
    return " ".join(f"M{x0},{y0} H{x1} V{y1} H{x0} Z" for x0, y0, x1, y1 in rows_to_rects(rows))


# ==============================================================================
# 1. 16x16 Vector Pixel Geometries for Media.xaml (Icon<Role> & Local*)
# ==============================================================================
VECTOR_ICONS = {
    # Classic 90s CRT Computer + Cascading Window (Start / Main Menu mark)
    "IconMainMenu": [
        "........KKKKKKKK",
        "........KWWWWWWK",
        ".KKKKKKKKK....KK",
        ".KWWWWWWWWK...KK",
        ".KWNNNNNNWK...KK",
        ".KWNNNNNNWKKKKKK",
        ".KWNNNNNNWK.....",
        ".KWWWWWWWWK.....",
        ".KKKKKKKKKK.....",
        "....KKKK........",
        "..KKKKKKKK......",
        ".KKKKKKKKKK.....",
        ".K.K.K.K.KK.....",
        ".KKKKKKKKKK.....",
        "................",
        "................",
    ],
    # Classic Windows 95/98 Explorer Find Magnifier
    "IconSearch": [
        "....KKKKK.......",
        "..KK.....KK.....",
        ".K..KKK....K....",
        ".K.K.......K....",
        "K..K........K...",
        "K...........K...",
        "K...........K...",
        ".K.........K....",
        ".K.........K....",
        "..KK.....KK.....",
        "....KKKKK.KK....",
        "..........KKKK..",
        "...........KKKK.",
        "............KKKK",
        ".............KK.",
        "................",
    ],
    # Classic Win32 Clear / Delete X
    "IconClear": [
        "................",
        "..KK........KK..",
        "..KKK......KKK..",
        "...KKK....KKK...",
        "....KKK..KKK....",
        ".....KKKKKK.....",
        "......KKKK......",
        "......KKKK......",
        ".....KKKKKK.....",
        "....KKK..KKK....",
        "...KKK....KKK...",
        "..KKK......KKK..",
        "..KK........KK..",
        "................",
        "................",
        "................",
    ],
    # Classic Win95/98 Control Panel Sliders / Equalizer
    "IconViewSettings": [
        ".........KKK....",
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        ".........KKK....",
        "................",
        "...KKK..........",
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        "...KKK..........",
        "................",
        ".......KKK......",
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        ".......KKK......",
        "................",
        "................",
    ],
    # Classic Funnel + Preset Bookmark Folder
    "IconFilterPresets": [
        ".KKKKKKKKKKKK...",
        "..KKKKKKKKKK....",
        "...KKKKKKKK.....",
        "....KKKKKK......",
        ".....KKKK.......",
        ".....KKKK.......",
        ".....KKKK..KKKKK",
        ".....KKKK..K...K",
        ".....KKKK..K...K",
        ".....KKKK..K.K.K",
        "......KK...KK.KK",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Cascading Program Group Windows
    "IconGroup": [
        ".....KKKKKKKKKK.",
        ".....KKKKKKKKKK.",
        ".....K........K.",
        ".....K........K.",
        ".KKKKKKKKKK...K.",
        ".KKKKKKKKKK...K.",
        ".K........K...K.",
        ".K........KKKKK.",
        ".K........K.....",
        ".K........K.....",
        ".K........K.....",
        ".KKKKKKKKKK.....",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Explorer Sort A->Z Bars + Down Arrow
    "IconSort": [
        "...........KK...",
        ".KKKKKKK...KK...",
        ".KKKKKKK...KK...",
        "...........KK...",
        ".KKKKK.....KK...",
        ".KKKKK.....KK...",
        "...........KK...",
        ".KKK.......KK...",
        ".KKK.....KKKKKK.",
        "..........KKKK..",
        ".KK........KK...",
        ".KK.............",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Explorer Details View (Split Folder Pane + Rows)
    "IconDetailsView": [
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        ".K....K.......K.",
        ".K.KK.K.KKKKK.K.",
        ".K....K.......K.",
        ".K.KK.K.KKKKK.K.",
        ".K....K.......K.",
        ".K.KK.K.KKKKK.K.",
        ".K....K.......K.",
        ".K.KK.K.KKKKK.K.",
        ".K....K.......K.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Explorer Large Icons Grid View (2x2 Folders/Monitors)
    "IconGridView": [
        ".KKKKKK..KKKKKK.",
        ".KKKKKK..KKKKKK.",
        ".K....K..K....K.",
        ".K....K..K....K.",
        ".K....K..K....K.",
        ".KKKKKK..KKKKKK.",
        "................",
        "................",
        ".KKKKKK..KKKKKK.",
        ".KKKKKK..KKKKKK.",
        ".K....K..K....K.",
        ".K....K..K....K.",
        ".K....K..K....K.",
        ".KKKKKK..KKKKKK.",
        "................",
        "................",
    ],
    # Classic Explorer List View (Icon + Line Rows)
    "IconListView": [
        "................",
        ".KK..KKKKKKKKKK.",
        ".KK..KKKKKKKKKK.",
        "................",
        ".KK..KKKKKKKKKK.",
        ".KK..KKKKKKKKKK.",
        "................",
        ".KK..KKKKKKKKKK.",
        ".KK..KKKKKKKKKK.",
        "................",
        ".KK..KKKKKKKKKK.",
        ".KK..KKKKKKKKKK.",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Windows Update Circular Refresh Arrow
    "IconUpdate": [
        ".....KKKKKK.....",
        "...KKK....KK.KK.",
        "..KK........KKK.",
        ".KK.........KKKK",
        ".KK........KKKKK",
        ".KK.............",
        ".KK.............",
        "..KK.........KK.",
        "...KK.......KK..",
        ".KKKKK.....KK...",
        ".KKKK.....KK....",
        ".KKK.KK..KKK....",
        ".KK...KKKKK.....",
        "................",
        "................",
        "................",
    ],
    # Classic Explorer Tree Folder Pane
    "IconExplorer": [
        "..KKKKK.........",
        ".KKKKKKK........",
        ".KKKKKKKKKKKKKK.",
        ".K............K.",
        ".K.KK.........K.",
        ".K.KKKKK......K.",
        ".K.K..........K.",
        ".K.KKKKK......K.",
        ".K.K..........K.",
        ".K.KKKKK......K.",
        ".K............K.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic 5-Pip Game Die
    "IconRandom": [
        ".KKKKKKKKKKKKKK.",
        ".K............K.",
        ".K.KK......KK.K.",
        ".K.KK......KK.K.",
        ".K............K.",
        ".K............K.",
        ".K.....KK.....K.",
        ".K.....KK.....K.",
        ".K............K.",
        ".K............K.",
        ".K.KK......KK.K.",
        ".K.KK......KK.K.",
        ".K............K.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
    ],
    # Classic 3-Pip Game Die
    "IconViewRandom": [
        ".KKKKKKKKKKKKKK.",
        ".K............K.",
        ".K.KK.........K.",
        ".K.KK.........K.",
        ".K............K.",
        ".K............K.",
        ".K.....KK.....K.",
        ".K.....KK.....K.",
        ".K............K.",
        ".K............K.",
        ".K.........KK.K.",
        ".K.........KK.K.",
        ".K............K.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
    ],
    # Classic Filter Funnel
    "IconFilter": [
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        "..KKKKKKKKKKKK..",
        "...KKKKKKKKKK...",
        "....KKKKKKKK....",
        ".....KKKKKK.....",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        ".......KKK......",
        "........KK......",
        "................",
        "................",
        "................",
    ],
    # Classic System Tray Bell / Alert
    "IconNotifications": [
        ".......KK.......",
        ".....KKKKKK.....",
        "....KKKKKKKK....",
        "....KKKKKKKK....",
        "...KKKKKKKKKK...",
        "...KKKKKKKKKK...",
        "...KKKKKKKKKK...",
        "...KKKKKKKKKK...",
        "..KKKKKKKKKKKK..",
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        "......KKKK......",
        ".......KK.......",
        "................",
        "................",
        "................",
    ],
    # Classic Yellow Folder + Gamepad / Program Library
    "IconLibrary": [
        "..KKKKK.........",
        ".KKKKKKK........",
        ".KKKKKKKKKKKKKK.",
        ".K............K.",
        ".K...KK.......K.",
        ".K..KKKK..KK..K.",
        ".K...KK.....K.K.",
        ".K............K.",
        ".K............K.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Win98 System Monitor Bar Chart
    "IconStatistics": [
        ".K..............",
        ".K.........KKK..",
        ".K.........KKK..",
        ".K.....KKK.KKK..",
        ".K.....KKK.KKK..",
        ".K.....KKK.KKK..",
        ".K.KKK.KKK.KKK..",
        ".K.KKK.KKK.KKK..",
        ".K.KKK.KKK.KKK..",
        ".K.KKK.KKK.KKK..",
        ".K.KKK.KKK.KKK..",
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
        "................",
    ],
    # Classic Win95/98 Marlett Minimize Baseline Bar
    "IconWindowMinimize": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "...KKKKKKKKKK...",
        "...KKKKKKKKKK...",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Win95/98 Marlett Maximize Window Box (thick top title bar)
    "IconWindowMaximize": [
        "................",
        "................",
        "..KKKKKKKKKKKK..",
        "..KKKKKKKKKKKK..",
        "..KKKKKKKKKKKK..",
        "..K..........K..",
        "..K..........K..",
        "..K..........K..",
        "..K..........K..",
        "..K..........K..",
        "..K..........K..",
        "..K..........K..",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................",
    ],
    # Classic Win95/98 Marlett Restore Cascading Window Boxes
    "IconWindowRestore": [
        "................",
        ".....KKKKKKKKK..",
        ".....KKKKKKKKK..",
        ".....K.......K..",
        "..KKKKKKKKK..K..",
        "..KKKKKKKKK..K..",
        "..K.......K..K..",
        "..K.......KKKK..",
        "..K.......K.....",
        "..K.......K.....",
        "..K.......K.....",
        "..KKKKKKKKK.....",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Win95/98 Marlett Close X
    "IconWindowClose": [
        "................",
        "................",
        "..KKK......KKK..",
        "...KKK....KKK...",
        "....KKK..KKK....",
        ".....KKKKKK.....",
        "......KKKK......",
        "......KKKK......",
        ".....KKKKKK.....",
        "....KKK..KKK....",
        "...KKK....KKK...",
        "..KKK......KKK..",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Win32 7x4 Downward Pixel Triangle
    "IconDropDown": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "....KKKKKKKK....",
        ".....KKKKKK.....",
        "......KKKK......",
        ".......KK.......",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Win32 4x7 Rightward Pixel Triangle
    "IconSubmenu": [
        "................",
        "................",
        "................",
        ".....KK.........",
        ".....KKKK.......",
        ".....KKKKKK.....",
        ".....KKKKKKKK...",
        ".....KKKKKKKK...",
        ".....KKKKKK.....",
        ".....KKKK.......",
        ".....KK.........",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Win32 Bold Pixel Checkmark
    "IconCheck": [
        "................",
        "................",
        "............KK..",
        "...........KKK..",
        "..........KKKK..",
        ".........KKKK...",
        "..KK....KKKK....",
        "..KKK..KKKK.....",
        "...KKKKKKK......",
        "....KKKKK.......",
        ".....KKK........",
        "......K.........",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Plus
    "IconAdd": [
        "................",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "................",
    ],
    # Classic Pixel Pencil / Edit
    "IconEdit": [
        "...........KKK..",
        "..........KKKKK.",
        ".........KKKKKK.",
        "........KKKKKK..",
        ".......KKKKKK...",
        "......KKKKKK....",
        ".....KKKKKK.....",
        "....KKKKKK......",
        "...KKKKKK.......",
        "..KKKKKK........",
        "..KKKKK.........",
        ".KKKK...........",
        ".KKK............",
        ".KK.............",
        "................",
        "................",
    ],
    # Classic Recycle Bin / Trash Can
    "IconRemove": [
        ".....KKKKKK.....",
        "..KKKKKKKKKKKK..",
        "..KKKKKKKKKKKK..",
        "................",
        "...KKKKKKKKKK...",
        "...K.KK..KK.K...",
        "...K.KK..KK.K...",
        "...K.KK..KK.K...",
        "...K.KK..KK.K...",
        "...K.KK..KK.K...",
        "...K.KK..KK.K...",
        "...K.KK..KK.K...",
        "...KKKKKKKKKK...",
        "................",
        "................",
        "................",
    ],
    # Classic 3-Dot More Options
    "IconOptions": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        ".KKKK.KKKK.KKKK.",
        ".KKKK.KKKK.KKKK.",
        ".KKKK.KKKK.KKKK.",
        ".KKKK.KKKK.KKKK.",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    # Classic Win95 CD Player Play Triangle
    "IconPlay": [
        "................",
        "...KK...........",
        "...KKKK.........",
        "...KKKKKK.......",
        "...KKKKKKKK.....",
        "...KKKKKKKKKK...",
        "...KKKKKKKKKKKK.",
        "...KKKKKKKKKKKK.",
        "...KKKKKKKKKK...",
        "...KKKKKKKK.....",
        "...KKKKKK.......",
        "...KKKK.........",
        "...KK...........",
        "................",
        "................",
        "................",
    ],
    # Classic Info Balloon / 'i' Box
    "IconInfo": [
        "..KKKKKKKKKKKK..",
        ".KKKKKKKKKKKKKK.",
        ".KK....KK....KK.",
        ".KK....KK....KK.",
        ".KK..........KK.",
        ".KK...KKKK...KK.",
        ".KK....KK....KK.",
        ".KK....KK....KK.",
        ".KK....KK....KK.",
        ".KK...KKKK...KK.",
        ".KK..........KK.",
        ".KKKKKKKKKKKKKK.",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................",
    ],
    # Classic Setup Floppy / Download Arrow
    "IconDownload": [
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "......KKKK......",
        "..KKKKKKKKKKKK..",
        "...KKKKKKKKKK...",
        "....KKKKKKKK....",
        ".....KKKKKK.....",
        "......KKKK......",
        ".......KK.......",
        ".KKKKKKKKKKKKKK.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
    ],
    # Local Hourglass Geometry (for running indicator & empty state)
    "LocalHourglassGeometry": [
        "..KKKKKKKKKKKK..",
        "..KKKKKKKKKKKK..",
        "...K........K...",
        "...K.KKKKKK.K...",
        "....K.KKKK.K....",
        ".....K.KK.K.....",
        "......KKKK......",
        ".......KK.......",
        "......KKKK......",
        ".....K....K.....",
        "....K..KK..K....",
        "...K..KKKK..K...",
        "...K.KKKKKK.K...",
        "..KKKKKKKKKKKK..",
        "..KKKKKKKKKKKK..",
        "................",
    ],
}


# ==============================================================================
# 2. Full-Color 16x16 Classic Win95/98 Menu Icon Bitmaps (scaled 3x to 48x48)
# ==============================================================================
COLOR_MENU_ICONS = {
    # Fullscreen Mode: Classic CRT Monitor with Blue Screen & White Fullscreen Corners
    "fullscreen": [
        ".KKKKKKKKKKKKKK.",
        ".KSSSSSSSSSSSSK.",
        ".KSKKKKKKKKKKGK.",
        ".KSKBBBBBBBBKGK.",
        ".KSKBWW..WWBKGK.",
        ".KSKBW....WBKGK.",
        ".KSKB......BKGK.",
        ".KSKBW....WBKGK.",
        ".KSKBWW..WWBKGK.",
        ".KSKBBBBBBBBKGK.",
        ".KSKKKKKKKKKKGK.",
        ".KSSSSSSSSSLSSK.",
        ".KKKKKKKKKKKKKK.",
        ".....KKKKKK.....",
        "...KKKKKKKKKK...",
        "................",
    ],
    # Add Game: Manila Folder with Bright Green '+' Badge
    "add": [
        "..KKKKK.........",
        ".KYYYYYK........",
        "KYYYYYYYKKKKKK..",
        "KWWWWWWWWWWWWK..",
        "KYOOOOOOOOOOYK..",
        "KYOOOOOOOOkkkkk.",
        "KYOOOOOOOOkLLLk.",
        "KYOOOOOOkkkkLLkk",
        "KYOOOOOOkLLLLLLk",
        "KYOOOOOOkkkkLLkk",
        "KYOOOOOOOOOkLLk.",
        "KKKKKKKKKKKkkkk.",
        "................",
        "................",
        "................",
        "................",
    ],
    # Update Library: Classic Teal/Cyan Globe with Gold Refresh Arrows
    "sync": [
        "....KKKKKKKK....",
        "..KKCCCCCCCCKK..",
        ".KCCCTTTTTTCCCK.",
        ".KCTTTTTTTTTTCK.",
        "KCTTTTYYYYTTTTCK",
        "KCTTTYYYYYYTTTCK",
        "KCTTTTYYYYTTTTCK",
        ".KCTTTTTTTTTTCK.",
        ".KCCCTTTTTTCCCK.",
        "..KKCCCCCCCCKK..",
        "....KKKKKKKK....",
        "..KKYYYYYYYYKK..",
        "..KYYYYYYYYYYK..",
        "...KKKKKKKKKK...",
        "................",
        "................",
    ],
    # About Playnite: Classic White/Navy Info Balloon ('i')
    "info": [
        "....KKKKKKKK....",
        "..KKWWWWWWWWKK..",
        ".KWWBBBBBBBBWWK.",
        ".KWBBBBWWBBBBWK.",
        "KWBBBBBWWBBBBBWK",
        "KWBBBBBBBBBBBBWK",
        "KWBBBBWWWBBBBBWK",
        "KWBBBBBWWBBBBBWK",
        "KWBBBBBWWBBBBBWK",
        "KWBBBBWWWWBBBBWK",
        ".KWBBBBBBBBBBWK.",
        ".KWWBBBBBBBBWWK.",
        "..KKWWWWWWWWKK..",
        "....KKKKKKWWK...",
        ".........KKKK...",
        "................",
    ],
    # Exit / Shut Down: Classic Win95/98 Red/Orange Shut Down Computer/Power Emblem
    "exit": [
        "....KKKKKKKK....",
        "..KKRRRRRRRRKK..",
        ".KRRWWWRRWWWRRK.",
        ".KRWWRRRRRRWWRK.",
        "KRWWRRRWWRRRWWRK",
        "KRWRRRRWWRRRRWRK",
        "KRWRRRRWWRRRRWRK",
        "KRWRRRRWWRRRRWRK",
        "KRWWRRRWWRRRWWRK",
        ".KRWWRRRRRRWWRK.",
        ".KRRWWWWWWWWRRK.",
        "..KKRRRRRRRRKK..",
        "....KKKKKKKK....",
        "................",
        "................",
        "................",
    ],
    # Settings: Classic Control Panel Folder with Mechanical Gear & Wrench
    "settings": [
        "..KKKKK.........",
        ".KYYYYYK........",
        "KYYYYYYYKKKKKK..",
        "KWWWWWWWWWWWWK..",
        "KYOOOOOOOOOOYK..",
        "KYOOOOKKKKOOYK..",
        "KYOOOKSSSSKOYKK.",
        "KYOOOKSKKSSKKKK.",
        "KYOOOKSSKSSGSSK.",
        "KYOOOOKSSKSSGSK.",
        "KYOOOOOKKKKKSSK.",
        "KKKKKKKKKKKKKKK.",
        "................",
        "................",
        "................",
        "................",
    ],
    # Add-ons: Classic Hardware Expansion Card / Puzzle Component
    "addons": [
        ".....KKKK.......",
        "....KLLLLK......",
        ".KKKKLLLLKKKK...",
        ".KLLLLLLLLLLK...",
        ".KLLWWLLLLLLKKK.",
        ".KLLLLLLLLLLLLLK",
        ".KLLLLLLLLLLLLLK",
        ".KLLLLLLLLLLKKK.",
        ".KLLLLLLLLLLK...",
        ".KLLLLLLLLLLK...",
        ".KKKKKKKKKKKK...",
        "..KYYK..KYYK....",
        "..KKKK..KKKK....",
        "................",
        "................",
        "................",
    ],
    # Play: Classic Green Play Triangle on Raised Silver Bevel
    "play": [
        "................",
        "...KK...........",
        "...KLKK.........",
        "...KLLLKK.......",
        "...KLLLLLKK.....",
        "...KLLLLLLLKK...",
        "...KLLLLLLLLLKK.",
        "...KLLLLLEEEEKK.",
        "...KLLLLEEEEKK..",
        "...KLLLEEEEKK...",
        "...KLLEEEEKK....",
        "...KLEEEEKK.....",
        "...KEEEEKK......",
        "...KKKK.........",
        "................",
        "................",
    ],
    # Install / Setup: Classic 3.5" Blue Floppy Disk + Box
    "download": [
        ".KKKKKKKKKKKKKK.",
        ".KNNNWWWWWWNNNK.",
        ".KNNNWKKKKWNNNK.",
        ".KNNNWKKKKWNNNK.",
        ".KNNNWWWWWWNNNK.",
        ".KNNNNNNNNNNNNK.",
        ".KNNKKKKKKKKNNK.",
        ".KNNKWWWWWWKNNK.",
        ".KNNKWWWWWWKNNK.",
        ".KNNKWWWWWWKNNK.",
        ".KNNKWWWWWWKNNK.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
        "................",
        "................",
    ],
    # Links: Classic IE Globe + Chain Link
    "link": [
        "....KKKKKKKK....",
        "..KKBBBBBBBBKK..",
        ".KBBCCCCCCCCBBK.",
        ".KBCCTTTTTTCCBK.",
        "KBCTTTEEEETTTCBK",
        "KBCTTEEEEEETTCBK",
        "KBCTTTEEEETTTCBK",
        ".KBCCTTTTTTCCBK.",
        "..KKBBBBBBBBKK..",
        ".KKKKKK..KKKKKK.",
        "KSSSSSSKKSSSSSSK",
        "KSGGGGGGGGGGGGSK",
        ".KKKKKK..KKKKKK.",
        "................",
        "................",
        "................",
    ],
    # Open Folder: Classic Windows 95/98 Open Manila Folder
    "folder": [
        "..KKKKK.........",
        ".KYYYYYK........",
        "KYYYYYYYKKKKKK..",
        "KWWWWWWWWWWWWK..",
        "KYOOOOOOOOOOYK..",
        "KYKKKKKKKKKKKKKK",
        "KYKYYYYYYYYYYYYK",
        "KYYOOOOOOOOOOOYK",
        "KYYOOOOOOOOOOOYK",
        "KYYOOOOOOOOOOOYK",
        "KYYOOOOOOOOOOOYK",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
        "................",
        "................",
    ],
    # Install Size: Classic Hard Drive (C:) with Green Activity LED
    "storage": [
        "................",
        "................",
        "..KKKKKKKKKKKK..",
        ".KWWWWWWWWWWWWK.",
        "KSSSSSSSSSSSSSSK",
        "KSSSSSSSSSSSSSSK",
        "KGGGGGGGGGGGGGGK",
        "KKKKKKKKKKKKKKKK",
        "KSSSSSSSSSSLLSSK",
        "KGGGGGGGGGGGGGGK",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    # Desktop Shortcut: Classic Shortcut Arrow Box
    "desktop": [
        ".KKKKKKKKKKKK...",
        ".KWWWWWWWWWWK...",
        ".KWNNNNNNNNWK...",
        ".KWWWWWWWWWWK...",
        ".KW....KKKWWK...",
        ".KW...KKKKWWK...",
        ".KW..KKKKKWWK...",
        ".KW...KK.KWWK...",
        ".KW..KK..KWWK...",
        ".KW..K...KWWK...",
        ".KWWWWWWWWWWK...",
        ".KKKKKKKKKKKK...",
        "................",
        "................",
        "................",
        "................",
    ],
    # Favorites: Classic Gold 5-Point Star
    "star": [
        ".......KK.......",
        "......KYYK......",
        "......KYYK......",
        ".....KYYYYK.....",
        ".KKKKKYYYYKKKKK.",
        "KYYYYYYYYYYYYYYK",
        ".KYYYYYYYYYYYYK.",
        "..KYYYYYYYYYYK..",
        "...KYYYYYYYYK...",
        "...KYYYYOYYYK...",
        "..KYYYYOOYYYYK..",
        "..KYYKK..KKYYK..",
        ".KKKK......KKKK.",
        "................",
        "................",
        "................",
    ],
    # Remove Favorite: Muted Silver Star
    "star-off": [
        ".......KK.......",
        "......KSSK......",
        "......KSSK......",
        ".....KSSSSK.....",
        ".KKKKKSSSSKKKKK.",
        "KSSSSSSSSSSSSSSK",
        ".KSSSSSSSSSSSSK.",
        "..KSSSSSSSSSSK..",
        "...KSSSSSSSSK...",
        "...KSSSSGSSSK...",
        "..KSSSSGGSSSSK..",
        "..KSSKK..KKSSK..",
        ".KKKK......KKKK.",
        "................",
        "................",
        "................",
    ],
    # Hide: Classic Glasses / Hidden Eye
    "hide": [
        "................",
        "................",
        "....KKKKKKKK....",
        "..KKSSSSSSSSKK..",
        ".KSSGGGGGGGGSSK.",
        "KSSGKKKKKKKKGSSK",
        "KSSGKGGGGGGKGSSK",
        ".KSSGGGGGGGGSSK.",
        "..KKSSSSSSSSKK..",
        "....KKKKKKKK....",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    # Unhide: Classic Bright Cyan Eye
    "unhide": [
        "................",
        "................",
        "....KKKKKKKK....",
        "..KKWWWWWWWWKK..",
        ".KWWCCCCCCCCWWK.",
        "KWWCCNNNNNNCCWWK",
        "KWWCCNWNNNNCCWWK",
        ".KWWCCCCCCCCWWK.",
        "..KKWWWWWWWWKK..",
        "....KKKKKKKK....",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    # HDR / Display: Classic Sun / Monitor Brightness
    "hdr": [
        ".......KK.......",
        "..K....YY....K..",
        "...K..KKKK..K...",
        "....KKYYYYKK....",
        "..KKYYYYYYYYKK..",
        "..KYYYYWWYYYYK..",
        ".KYYYYWWWWYYYYK.",
        ".KYYYYYYYYYYYYK.",
        "..KYYYYYYYYYYK..",
        "..KKYYYYYYYYKK..",
        "....KKYYYYKK....",
        "...K..KKKK..K...",
        "..K....YY....K..",
        ".......KK.......",
        "................",
        "................",
    ],
    # Edit Game: Classic Notepad Document + Yellow Pencil
    "edit": [
        ".KKKKKKKKKK.....",
        ".KWWWWWWWWK..KK.",
        ".KWKKKKKKWK.KYYK",
        ".KWWWWWWWWKKYYYK",
        ".KWKKKKKKWKYYYK.",
        ".KWWWWWWWWYYYK..",
        ".KWKKKKKKYYYK...",
        ".KWWWWWWYYYK....",
        ".KWKKKKYYYK.....",
        ".KWWWWWRRK......",
        ".KWKKKKKK.......",
        ".KWWWWWWWWK.....",
        ".KKKKKKKKKK.....",
        "................",
        "................",
        "................",
    ],
    # Remove Game: Classic Win95/98 Recycle Bin
    "delete": [
        ".....KKKKKK.....",
        "..KKKKKKKKKKKK..",
        "..KSSSSSSSSSSK..",
        "..KKKKKKKKKKKK..",
        "...KSSSSSSSSK...",
        "...KSKSSKSSGK...",
        "...KSKSSKSSGK...",
        "...KSKSSKSSGK...",
        "...KSKSSKSSGK...",
        "...KSKSSKSSGK...",
        "...KSKSSKSSGK...",
        "...KSKSSKSSGK...",
        "...KGGGGGGGGK...",
        "....KKKKKKKK....",
        "................",
        "................",
    ],
    # Dice: Classic 3D White Game Die with Red Pips
    "dice": [
        ".KKKKKKKKKKKKKK.",
        ".KWWWWWWWWWWWWK.",
        ".KWWRRWWWWKKWWK.",
        ".KWWRRWWWWKKWWK.",
        ".KWWWWWWWWWWWWK.",
        ".KWWWWWWWWWWWWK.",
        ".KWWWWWRRWWWWWK.",
        ".KWWWWWRRWWWWWK.",
        ".KWWWWWWWWWWWWK.",
        ".KWWWWWWWWWWWWK.",
        ".KWWKKWWWWRRWWK.",
        ".KWWKKWWWWRRWWK.",
        ".KSSSSSSSSSSSSK.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
    ],
    # Manual: Classic Windows Help Book with Question/Bookmark
    "manual": [
        "..KKKKKKKKKKKK..",
        ".KBBBBBBBBBBBBK.",
        ".KBWWWWWWWWWWBK.",
        ".KBWBBBBBBBBWBK.",
        ".KBWBBBYYBBBWBK.",
        ".KBWBBYYYYBBWBK.",
        ".KBWBBBBYYBBWBK.",
        ".KBWBBBBBBBBWBK.",
        ".KBWBBBBYYBBWBK.",
        ".KBWBBBBBBBBWBK.",
        ".KBWWWWWWWWWWBK.",
        ".KBBBBBBBBBBBBK.",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................",
    ],
    # Backup: Classic 3.5" Floppy Diskette
    "backup": [
        ".KKKKKKKKKKKKKK.",
        ".KNNNWWWWWWNNNK.",
        ".KNNNWKKKKWNNNK.",
        ".KNNNWKKKKWNNNK.",
        ".KNNNWWWWWWNNNK.",
        ".KNNNNNNNNNNNNK.",
        ".KNNKKKKKKKKNNK.",
        ".KNNKYYYYYYKNNK.",
        ".KNNKYYYYYYKNNK.",
        ".KNNKWWWWWWKNNK.",
        ".KNNKWWWWWWKNNK.",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
        "................",
        "................",
    ],
    # Restore Backup: Classic Win95 Hourglass with Sand
    "restore": [
        "..KKKKKKKKKKKK..",
        "..KOOOOOOOOOOK..",
        "...KWWWWWWWWK...",
        "...KWYYYYYYWK...",
        "....KWYYYYWK....",
        ".....KWYYWK.....",
        "......KWWK......",
        ".......KK.......",
        "......KWWK......",
        ".....KWWWWK.....",
        "....KWWYYWWK....",
        "...KWWYYYYWWK...",
        "...KWYYYYYYWK...",
        "..KOOOOOOOOOOK..",
        "..KKKKKKKKKKKK..",
        "................",
    ],
}


def render_menu_pngs():
    out_dir = THEME / "src" / "Images" / "Win98"
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, rows in COLOR_MENU_ICONS.items():
        img = Image.new("RGBA", (N, N), (0, 0, 0, 0))
        px = img.load()
        for y, row in enumerate(rows[:N]):
            for x, ch in enumerate(row.ljust(N, ".")[:N]):
                px[x, y] = PAL.get(ch, (0, 0, 0, 0))
        # Nearest-neighbor scale 3x to 48x48 so every pixel stays razor-sharp
        scaled = img.resize((48, 48), Image.NEAREST)
        scaled.save(out_dir / f"{name}.png", optimize=True)
    return out_dir


def render_fx_sprites():
    """Generate deterministic pure-white RGBA masks for Win95/98 dithered scrollbar tracks and progress blocks."""
    fx_dir = THEME / "src" / "Images" / "fx"
    fx_dir.mkdir(parents=True, exist_ok=True)

    # 1. dither-checker.png: 2x2 pixel alternating checkerboard (pure white 255,255,255 at (0,0) and (1,1))
    dither = Image.new("RGBA", (4, 4), (0, 0, 0, 0))
    dpx = dither.load()
    for y in range(4):
        for x in range(4):
            if (x + y) % 2 == 0:
                dpx[x, y] = (255, 255, 255, 255)
    dither.save(fx_dir / "dither-checker.png", optimize=True)

    # 2. progress-blocks.png: 10x12 segmented Win95 progress block mask (8px solid block + 2px transparent gap)
    prog = Image.new("RGBA", (10, 12), (0, 0, 0, 0))
    ppx = prog.load()
    for y in range(1, 11):
        for x in range(0, 8):
            ppx[x, y] = (255, 255, 255, 255)
    prog.save(fx_dir / "progress-blocks.png", optimize=True)
    return fx_dir


def write_media_xaml():
    lines = [
        "<!--",
        "    Silver 98: Media.xaml — Classic Windows 95 and Windows 98 16x16 pixel iconography.",
        "    Generated by art/icons.py. Vector Icon<Role> geometries snap cleanly to a 16x16 pixel grid",
        "    (RenderOptions.EdgeMode=Aliased, SnapsToDevicePixels=True). Playnite's 24 context-menu icon keys",
        "    point to 48x48 (3x nearest-neighbor scaled 16x16) 16-color VGA pixel-art PNGs in Images/Win98/*.png.",
        "-->",
        '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"',
        '                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"',
        '                    xmlns:sys="clr-namespace:System;assembly=mscorlib">',
        "    <!-- ICONS:BEGIN (art/icons.py) -->",
    ]
    for key, rows in VECTOR_ICONS.items():
        lines.append(f'    <Geometry x:Key="{key}">F1 {rows_to_path(rows)}</Geometry>')
    lines.extend([
        "    <!-- ICONS:END -->",
        "",
        '    <DataTemplate x:Key="IconTemplate">',
        '        <Viewbox MaxWidth="{DynamicResource IconSize}" MaxHeight="{DynamicResource IconSize}" Stretch="Uniform">',
        '            <Canvas Width="16" Height="16" SnapsToDevicePixels="True">',
        '                <Path Data="{Binding}" RenderOptions.EdgeMode="Aliased"',
        '                      Fill="{Binding Foreground, RelativeSource={RelativeSource AncestorType=ContentControl}}" />',
        "            </Canvas>",
        "        </Viewbox>",
        "    </DataTemplate>",
        "",
        '    <DataTemplate x:Key="IconSmallTemplate">',
        '        <Viewbox MaxWidth="12" MaxHeight="12" Stretch="Uniform">',
        '            <Canvas Width="16" Height="16" SnapsToDevicePixels="True">',
        '                <Path Data="{Binding}" RenderOptions.EdgeMode="Aliased"',
        '                      Fill="{Binding Foreground, RelativeSource={RelativeSource AncestorType=ContentControl}}" />',
        "            </Canvas>",
        "        </Viewbox>",
        "    </DataTemplate>",
        "",
        '    <DataTemplate x:Key="ClearTextIconTemplate">',
        '        <ContentPresenter MaxWidth="14" MaxHeight="14" Content="{DynamicResource IconClear}" ContentTemplate="{DynamicResource IconTemplate}" />',
        "    </DataTemplate>",
        "",
        '    <DataTemplate x:Key="SearchTextIconTemplate">',
        '        <ContentPresenter MaxWidth="16" MaxHeight="16" Content="{DynamicResource IconSearch}" ContentTemplate="{DynamicResource IconTemplate}" />',
        "    </DataTemplate>",
        "",
        "    <!-- Classic 16-Color Pixel PNG Menu Icons (48x48 nearest-neighbor scaled from 16x16) -->",
        '    <sys:String x:Key="FullscreenModeIcon">Images/Win98/fullscreen.png</sys:String>',
        '    <sys:String x:Key="AddGameIcon">Images/Win98/add.png</sys:String>',
        '    <sys:String x:Key="UpdateDbIcon">Images/Win98/sync.png</sys:String>',
        '    <sys:String x:Key="AboutPlayniteIcon">Images/Win98/info.png</sys:String>',
        '    <sys:String x:Key="ExitIcon">Images/Win98/exit.png</sys:String>',
        '    <sys:String x:Key="SettingsIcon">Images/Win98/settings.png</sys:String>',
        '    <sys:String x:Key="AddonsIcon">Images/Win98/addons.png</sys:String>',
        '    <sys:String x:Key="PlayIcon">Images/Win98/play.png</sys:String>',
        '    <sys:String x:Key="InstallIcon">Images/Win98/download.png</sys:String>',
        '    <sys:String x:Key="LinksIcon">Images/Win98/link.png</sys:String>',
        '    <sys:String x:Key="OpenFolderIcon">Images/Win98/folder.png</sys:String>',
        '    <sys:String x:Key="InstallSizeIcon">Images/Win98/storage.png</sys:String>',
        '    <sys:String x:Key="DesktopShortcutIcon">Images/Win98/desktop.png</sys:String>',
        '    <sys:String x:Key="AddFavoritesIcon">Images/Win98/star.png</sys:String>',
        '    <sys:String x:Key="RemoveFavoritesIcon">Images/Win98/star-off.png</sys:String>',
        '    <sys:String x:Key="HideIcon">Images/Win98/hide.png</sys:String>',
        '    <sys:String x:Key="UnHideIcon">Images/Win98/unhide.png</sys:String>',
        '    <sys:String x:Key="HdrIcon">Images/Win98/hdr.png</sys:String>',
        '    <sys:String x:Key="EditGameIcon">Images/Win98/edit.png</sys:String>',
        '    <sys:String x:Key="RemoveGameIcon">Images/Win98/delete.png</sys:String>',
        '    <sys:String x:Key="DiceIcon">Images/Win98/dice.png</sys:String>',
        '    <sys:String x:Key="ManualIcon">Images/Win98/manual.png</sys:String>',
        '    <sys:String x:Key="BackupIcon">Images/Win98/backup.png</sys:String>',
        '    <sys:String x:Key="RestoreBackupIcon">Images/Win98/restore.png</sys:String>',
        "</ResourceDictionary>",
        "",
    ])
    media_path = THEME / "src" / "Media.xaml"
    media_path.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    return media_path


def write_mark_svg():
    mark_path = THEME / "art" / "mark.svg"
    mark_d = rows_to_path(VECTOR_ICONS["IconMainMenu"])
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">\n'
        f'  <path fill="currentColor" d="{mark_d}" />\n'
        "</svg>\n"
    )
    mark_path.write_text(svg, encoding="utf-8", newline="\n")
    return mark_path


if __name__ == "__main__":
    print("Media.xaml:", write_media_xaml())
    print("Menu PNGs:", render_menu_pngs())
    print("FX sprites:", render_fx_sprites())
    print("mark.svg:", write_mark_svg())
