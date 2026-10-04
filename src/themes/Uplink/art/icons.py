"""Uplink icon set: original line icons in the angular style of the StarCraft II menus (straight strokes, 45-degree
chamfers, no curves except the radar). Drawn for this theme; nothing is traced from the game.

Every icon is path data on a 24 grid, drawn as a 1.5 stroke with miter joins. Running this script writes:
  icons/<name>.svg        the sources (also the input of scripts/render-icons.ps1 on Windows)
  and prints the Geometry lines for src/Media.xaml (python3 art/icons.py --xaml).
art/render-png.mjs renders the menu icons to src/Images/Icons with Chromium.
"""
import math, os, sys

def poly(points, close=True):
    d = "M" + " L".join(f"{x:g} {y:g}" for x, y in points)
    return d + (" Z" if close else "")

def star(cx=12, cy=12.4, r1=9, r2=3.9):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        r = r1 if i % 2 == 0 else r2
        pts.append((round(cx + r * math.cos(a), 2), round(cy + r * math.sin(a), 2)))
    return poly(pts)

def gear(cx=12, cy=12, ro=9, ri=6.8, teeth=8):
    pts = []
    step = 2 * math.pi / teeth
    for i in range(teeth):
        a = i * step - math.pi / 2
        for da, r in ((-0.30, ri), (-0.17, ro), (0.17, ro), (0.30, ri)):
            pts.append((round(cx + r * math.cos(a + da * step / 0.9), 2), round(cy + r * math.sin(a + da * step / 0.9), 2)))
    hexa = [(round(cx + 3.2 * math.cos(math.pi / 6 + k * math.pi / 3), 2), round(cy + 3.2 * math.sin(math.pi / 6 + k * math.pi / 3), 2)) for k in range(6)]
    return poly(pts) + " " + poly(hexa)

OCT_LENS = poly([(8, 4.5), (13, 4.5), (16.5, 8), (16.5, 13), (13, 16.5), (8, 16.5), (4.5, 13), (4.5, 8)])
EYE = "M2.5 12 L7 7 H17 L21.5 12 L17 17 H7 Z"

# Vector icons for Media.xaml (Icon<Role>).
GEOMETRY = {
    "Search": OCT_LENS + " M15.5 15.5 L20.5 20.5",
    "Clear": "M6 6 L18 18 M18 6 L6 18",
    "ViewSettings": "M4 7 H8 M11 7 H20 M8 5 H11 V9 H8 Z M4 17 H14 M17 17 H20 M14 15 H17 V19 H14 Z",
    "FilterPresets": "M6.5 3.5 H17.5 V20.5 L12 16 L6.5 20.5 Z M9.5 7.5 H14.5",
    "Group": "M12 4 L20 8 L12 12 L4 8 Z M4 12 L12 16 L20 12 M4 16 L12 20 L20 16",
    "Sort": "M7 4.5 V19.5 M4 16.5 L7 19.5 L10 16.5 M17 19.5 V4.5 M14 7.5 L17 4.5 L20 7.5",
    "DetailsView": "M3.5 4.5 H20.5 V19.5 H3.5 Z M9.5 4.5 V19.5 M12.5 9 H18 M12.5 12.5 H16",
    "GridView": "M5.5 4 H10.5 V10.5 H4 V5.5 Z M13.5 4 H18.5 L20 5.5 V10.5 H13.5 Z M4 13.5 H10.5 V20 H5.5 L4 18.5 Z M13.5 13.5 H20 V18.5 L18.5 20 H13.5 Z",
    "ListView": "M4 6 H6 M4 12 H6 M4 18 H6 M9 6 H20 M9 12 H20 M9 18 H20",
    "Update": "M12 4 V15 M7 10 L12 15 L17 10 M4.5 19.5 H19.5",
    "Explorer": "M3.5 12 A8.5 8.5 0 1 1 20.5 12 A8.5 8.5 0 1 1 3.5 12 Z M12 12 L17.5 6.5 M12 3.5 V6.5 M12 17.5 V20.5 M3.5 12 H6.5 M17.5 12 H20.5",
    "Random": "M6 3.5 H18 L20.5 6 V18 L18 20.5 H6 L3.5 18 V6 Z M8.5 8 H10 V9.5 H8.5 Z M14 14.5 H15.5 V16 H14 Z M11.25 11.25 H12.75 V12.75 H11.25 Z",
    "ViewRandom": "M3.5 7.5 H8 L16 16.5 H20.5 M18 14 L20.5 16.5 L18 19 M3.5 16.5 H8 L10.5 13.7 M13.5 10.3 L16 7.5 H20.5 M18 5 L20.5 7.5 L18 10",
    "Filter": "M3.5 5 H20.5 L14 12.5 V19.5 L10 17.5 V12.5 Z",
    "Notifications": "M6.5 16 V10 L9 6.5 H15 L17.5 10 V16 L19.5 18 H4.5 Z M10 20.5 H14",
    "MainMenu": "M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z M12 8 L16 10.25 V13.75 L12 16 L8 13.75 V10.25 Z",
    "Library": "M4.5 4.5 H8.5 V19.5 H4.5 Z M10.5 4.5 H14.5 V19.5 H10.5 Z M16.3 5.2 L19.9 4.4 L21.6 18.9 L18 19.7 Z",
    "Statistics": "M3.5 20 H20.5 M6 17 V12 M10 17 V7 M14 17 V10 M18 17 V4.5",
    "WindowMinimize": "M6 12 H18",
    "WindowMaximize": "M6.5 6.5 H17.5 V17.5 H6.5 Z",
    "WindowRestore": "M9 9 V5.5 H18.5 V15 H15 M5.5 9 H15 V18.5 H5.5 Z",
    "WindowClose": "M6 6 L18 18 M18 6 L6 18",
    "DropDown": "M6.5 9.5 L12 15 L17.5 9.5",
    "Submenu": "M9.5 6.5 L15 12 L9.5 17.5",
    "Check": "M5.5 12.5 L10 17 L18.5 7.5",
    "Add": "M12 5 V19 M5 12 H19",
    "Edit": "M4.5 19.5 L5.5 15 L15.5 5 L19 8.5 L9 18.5 Z M13 7.5 L16.5 11",
    "Options": gear(),
    "Remove": "M5 7 H19 M9.5 7 V4.5 H14.5 V7 M6.5 7 L7.5 20 H16.5 L17.5 7 M10 10.5 V16.5 M14 10.5 V16.5",
}

# Menu icons (Playnite copies these as images): file name -> path data.
MENU = {
    "fullscreen": "M4 9 V4 H9 M15 4 H20 V9 M20 15 V20 H15 M9 20 H4 V15",
    "add": GEOMETRY["Add"],
    "sync": "M19 9.5 L16.5 5.5 H7.5 L4.5 10 M4.5 5.5 V10 H9 M5 14.5 L7.5 18.5 H16.5 L19.5 14 M19.5 18.5 V14 H15",
    "info": "M8.5 3.5 H15.5 L20.5 8.5 V15.5 L15.5 20.5 H8.5 L3.5 15.5 V8.5 Z M12 10.5 V16.5 M12 7 V8.5",
    "settings": gear(),
    "addons": "M4 4 H10.5 V10.5 H4 Z M13.5 4 H20 V10.5 H13.5 Z M4 13.5 H10.5 V20 H4 Z M16.75 13 V20.5 M13 16.75 H20.5",
    "play": "M7 4.5 L19 12 L7 19.5 Z",
    "install": "M12 3.5 V14.5 M7.5 10 L12 14.5 L16.5 10 M4 15.5 V20 H20 V15.5",
    "links": "M10 14 L14 10 M8.5 11 L5.5 14 V16 L8 18.5 H10 L13 15.5 M11 8.5 L14 5.5 H16 L18.5 8 V10 L15.5 13",
    "folder": "M3.5 6 H9.5 L11.5 8 H20.5 V18.5 H3.5 Z",
    "database": "M4.5 6.5 L12 3.5 L19.5 6.5 L12 9.5 Z M4.5 6.5 V17.5 L12 20.5 L19.5 17.5 V6.5 M4.5 12 L12 15 L19.5 12",
    "desktop-shortcut": "M3.5 4.5 H20.5 V15.5 H3.5 Z M9 20 H15 M12 15.5 V20 M9.5 12.5 L14.5 7.5 M10.5 7.5 H14.5 V11.5",
    "star": star(),
    "star-fill": star(),
    "eye": EYE + " M12 9.5 L14.5 12 L12 14.5 L9.5 12 Z",
    "eye-closed": EYE + " M4 20 L20 4",
    "sun": "M10.5 8.5 H13.5 L15.5 10.5 V13.5 L13.5 15.5 H10.5 L8.5 13.5 V10.5 Z M12 2.5 V5 M12 19 V21.5 M2.5 12 H5 M19 12 H21.5 M5.3 5.3 L7 7 M17 17 L18.7 18.7 M5.3 18.7 L7 17 M17 7 L18.7 5.3",
    "edit": GEOMETRY["Edit"],
    "random": GEOMETRY["Random"],
    "book": "M4 4.5 H10 L12 6.5 L14 4.5 H20 V18.5 H14 L12 20.5 L10 18.5 H4 Z M12 6.5 V20.5",
    "archive": "M3.5 4.5 H20.5 V8.5 H3.5 Z M5 8.5 V19.5 H19 V8.5 M10 12 H14",
    "history": "M4.5 9 L8.5 4.5 H15.5 L19.5 8.5 V15.5 L15.5 19.5 H8.5 L4.5 15.5 V13 M4.5 5 V9 H8.5 M12 8 V12 L15 14",
    "exit": "M14 4.5 H19.5 V19.5 H14 M10 8 L6 12 L10 16 M6 12 H15",
    "remove": GEOMETRY["Remove"],
}
FILLED = {"star-fill"}

def svg(d, filled=False):
    fill = 'fill="currentColor" stroke="none"' if filled else 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="miter" stroke-linecap="butt"'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {fill}><path d="{d}"/></svg>\n'

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    if "--xaml" in sys.argv:
        for k, d in GEOMETRY.items():
            print(f'    <Geometry x:Key="Icon{k}">{d}</Geometry>')
        sys.exit()
    out = os.path.join(here, "..", "icons")
    os.makedirs(out, exist_ok=True)
    for name, d in MENU.items():
        with open(os.path.join(out, name + ".svg"), "w") as f:
            f.write(svg(d, name in FILLED))
    for k, d in GEOMETRY.items():
        name = "icon-" + "".join("-" + c.lower() if c.isupper() else c for c in k).lstrip("-")
        with open(os.path.join(out, name + ".svg"), "w") as f:
            f.write(svg(d))
    print("wrote", len(MENU) + len(GEOMETRY), "svgs to", os.path.normpath(out))
