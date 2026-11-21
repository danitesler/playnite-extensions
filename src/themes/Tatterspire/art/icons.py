"""Tatterspire's UI icons: chunky filled shapes on a 24-unit grid. IconTemplate fills them in the control's Foreground and
adds a 0.9 round-joined stroke of the same color, so every corner reads soft and hand-cut like the source's flat game icons.

Run:  python src/themes/Tatterspire/art/icons.py
Rewrites the block between the ICONS markers in src/Media.xaml and in art/preview-*.html (an inline <symbol> sheet), and
writes art/mark.svg. Every Geometry is even-odd ("F0"): a subpath inside another punches a hole.
"""
import math
import re
from pathlib import Path


def gear(cx=12, cy=12, r_out=9.6, r_in=7.2, hole=3.2, teeth=8):
    pts = []
    for i in range(teeth):
        a = 2 * math.pi * i / teeth
        step = 2 * math.pi / teeth
        for off, r in ((-0.30, r_in), (-0.19, r_out), (0.19, r_out), (0.30, r_in)):
            ang = a + off * step * 1.6
            pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    d = "M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in pts) + " Z"
    # centre hole (counter-wound circle)
    d += f" M{cx - hole:.2f},{cy:.2f} a{hole},{hole} 0 1 0 {2 * hole:.2f},0 a{hole},{hole} 0 1 0 {-2 * hole:.2f},0 Z"
    return d


def circle(cx, cy, r):
    return f"M{cx - r},{cy} a{r},{r} 0 1 0 {2 * r},0 a{r},{r} 0 1 0 {-2 * r},0 Z"


ICONS = {
    "IconSearch": f"{circle(10, 10, 6.6)} {circle(10, 10, 3.9)} M14.4,16.4 L16.4,14.4 L21,19 L19,21 Z",
    "IconClear": "M6.2,4.6 L12,10.4 L17.8,4.6 L19.4,6.2 L13.6,12 L19.4,17.8 L17.8,19.4 L12,13.6 L6.2,19.4 L4.6,17.8 L10.4,12 L4.6,6.2 Z",
    "IconViewSettings": gear(),
    "IconFilterPresets": "M7.6,3 L11.2,3 L11.2,4.6 L10.6,4.6 L10.6,8.4 C12.6,9.2 14,11 14,13.2 C14,15.9 11.9,18 9.4,18 C6.9,18 4.8,15.9 4.8,13.2 C4.8,11 6.2,9.2 8.2,8.4 L8.2,4.6 L7.6,4.6 Z M16.5,9.5 L21.5,9.5 L21.5,11.6 L16.5,11.6 Z M16.5,13.4 L21.5,13.4 L21.5,15.5 L16.5,15.5 Z M16.5,17.3 L21.5,17.3 L21.5,19.4 L16.5,19.4 Z",
    "IconGroup": "M7,4 L21,4 L21,16 L18.6,16 L18.6,6.4 L7,6.4 Z M3,8.6 L16,8.6 L16,21 L3,21 Z M5.4,11 L5.4,18.6 L13.6,18.6 L13.6,11 Z",
    "IconSort": "M3,5 L13,5 L13,7.4 L3,7.4 Z M3,10.3 L11,10.3 L11,12.7 L3,12.7 Z M3,15.6 L9,15.6 L9,18 L3,18 Z M18,5 L20.2,5 L20.2,15.2 L22.1,13.3 L23.6,14.8 L19.1,19.6 L14.7,14.8 L16.2,13.3 L18,15.2 Z",
    "IconDetailsView": "M3,4.6 L6.4,4.6 L6.4,8 L3,8 Z M9,5.1 L21,5.1 L21,7.5 L9,7.5 Z M3,10.3 L6.4,10.3 L6.4,13.7 L3,13.7 Z M9,10.8 L21,10.8 L21,13.2 L9,13.2 Z M3,16 L6.4,16 L6.4,19.4 L3,19.4 Z M9,16.5 L21,16.5 L21,18.9 L9,18.9 Z",
    "IconGridView": "M3,3 L11,3 L11,11 L3,11 Z M13,3 L21,3 L21,11 L13,11 Z M3,13 L11,13 L11,21 L3,21 Z M13,13 L21,13 L21,21 L13,21 Z",
    "IconListView": "M3,4.7 L21,4.7 L21,7.3 L3,7.3 Z M3,10.7 L21,10.7 L21,13.3 L3,13.3 Z M3,16.7 L15,16.7 L15,19.3 L3,19.3 Z",
    "IconUpdate": "M12,4.5 C16.1,4.5 19.5,7.8 19.5,12 C19.5,13 19.3,13.9 19,14.8 L16.9,14.1 C17.1,13.5 17.2,12.8 17.2,12 C17.2,9.1 14.9,6.8 12,6.8 L12,9.6 L7.2,5.7 L12,1.8 Z M12,19.5 C7.9,19.5 4.5,16.2 4.5,12 C4.5,11 4.7,10.1 5,9.2 L7.1,9.9 C6.9,10.5 6.8,11.2 6.8,12 C6.8,14.9 9.1,17.2 12,17.2 L12,14.4 L16.8,18.3 L12,22.2 Z",
    "IconExplorer": "M3,5 L21,5 L21,19 L3,19 Z M5.4,7.4 L5.4,16.6 L9.2,16.6 L9.2,7.4 Z M11,7.4 L11,16.6 L13,16.6 L13,7.4 Z M14.8,7.4 L14.8,16.6 L18.6,16.6 L18.6,7.4 Z",
    "IconRandom": f"M5,3 L19,3 Q21,3 21,5 L21,19 Q21,21 19,21 L5,21 Q3,21 3,19 L3,5 Q3,3 5,3 Z {circle(8, 8, 1.5)} {circle(16, 8, 1.5)} {circle(12, 12, 1.5)} {circle(8, 16, 1.5)} {circle(16, 16, 1.5)}",
    "IconViewRandom": f"M5,3 L19,3 Q21,3 21,5 L21,19 Q21,21 19,21 L5,21 Q3,21 3,19 L3,5 Q3,3 5,3 Z {circle(8, 8, 1.5)} {circle(16, 8, 1.5)} {circle(12, 12, 1.5)} {circle(8, 16, 1.5)} {circle(16, 16, 1.5)}",
    "IconFilter": "M9.4,3 L14.6,3 L14.6,4.8 L13.8,4.8 L13.8,9 C16.5,9.9 18.4,12.4 18.4,15.3 C18.4,18.5 15.5,21 12,21 C8.5,21 5.6,18.5 5.6,15.3 C5.6,12.4 7.5,9.9 10.2,9 L10.2,4.8 L9.4,4.8 Z",
    "IconNotifications": "M11,3.6 C11,3 11.4,2.5 12,2.5 C12.6,2.5 13,3 13,3.6 L13,4.4 C15.9,5 18,7.4 18,10.4 L18,14.4 L20,16.6 L20,18 L4,18 L4,16.6 L6,14.4 L6,10.4 C6,7.4 8.1,5 11,4.4 Z M9.6,19.4 L14.4,19.4 C14.4,20.8 13.3,21.7 12,21.7 C10.7,21.7 9.6,20.8 9.6,19.4 Z",
    "IconMainMenu": "M3,5 L21,5 L21,7.6 L3,7.6 Z M3,10.7 L16,10.7 L16,13.3 L3,13.3 Z M3,16.4 L21,16.4 L21,19 L3,19 Z",
    "IconLibrary": "M3.5,4 L8.4,4 L8.4,20.4 L3.5,20.4 Z M10,5.6 L14.9,5.6 L14.9,20.4 L10,20.4 Z M16.2,5.2 L20.9,6.4 L17.2,20.8 L12.5,19.6 Z",
    "IconStatistics": "M3.5,13 L7.5,13 L7.5,20 L3.5,20 Z M10,8.5 L14,8.5 L14,20 L10,20 Z M16.5,4 L20.5,4 L20.5,20 L16.5,20 Z",
    "IconWindowMinimize": "M5,16.8 L19,16.8 L19,19.2 L5,19.2 Z",
    "IconWindowMaximize": "M5,5 L19,5 L19,19 L5,19 Z M7.4,7.4 L7.4,16.6 L16.6,16.6 L16.6,7.4 Z",
    "IconWindowRestore": "M8,3.5 L20.5,3.5 L20.5,16 L18,16 L18,6 L8,6 Z M3.5,8 L16,8 L16,20.5 L3.5,20.5 Z M5.9,10.4 L5.9,18.1 L13.6,18.1 L13.6,10.4 Z",
    "IconWindowClose": "M6.2,4.6 L12,10.4 L17.8,4.6 L19.4,6.2 L13.6,12 L19.4,17.8 L17.8,19.4 L12,13.6 L6.2,19.4 L4.6,17.8 L10.4,12 L4.6,6.2 Z",
    "IconDropDown": "M5.5,8.5 L18.5,8.5 L12,17 Z",
    "IconSubmenu": "M8.5,5.5 L17,12 L8.5,18.5 Z",
    "IconCheck": "M4.2,12.4 L6.6,10 L10,13.4 L17.4,6 L19.8,8.4 L10,18.2 Z",
    "IconAdd": "M10.6,4.4 L13.4,4.4 L13.4,10.6 L19.6,10.6 L19.6,13.4 L13.4,13.4 L13.4,19.6 L10.6,19.6 L10.6,13.4 L4.4,13.4 L4.4,10.6 L10.6,10.6 Z",
    "IconEdit": "M4,20 L5.2,15.6 L16.4,4.4 C17.2,3.6 18.4,3.6 19.2,4.4 L19.6,4.8 C20.4,5.6 20.4,6.8 19.6,7.6 L8.4,18.8 Z M6.6,16.2 L7.8,17.4 L16.4,8.8 L15.2,7.6 Z",
    "IconRemove": "M8.5,3.6 L15.5,3.6 L15.5,5.4 L19.9,5.4 L19.9,7.6 L4.1,7.6 L4.1,5.4 L8.5,5.4 Z M5.9,9.4 L18.1,9.4 L17.2,19.6 C17.1,20.5 16.4,21.2 15.4,21.2 L8.6,21.2 C7.6,21.2 6.9,20.5 6.8,19.6 Z M9.6,11.8 L9.6,18.4 L11.2,18.4 L11.2,11.8 Z M12.8,11.8 L12.8,18.4 L14.4,18.4 L14.4,11.8 Z",
    "IconOptions": f"{circle(5, 12, 1.9)} {circle(12, 12, 1.9)} {circle(19, 12, 1.9)}",
    "IconPlay": "M7,4.8 L19.4,12 L7,19.2 Z",
    "IconInfo": f"{circle(12, 12, 9.4)} M10.9,10.6 L13.1,10.6 L13.1,17.4 L10.9,17.4 Z {circle(12, 7.6, 1.3)}",
    "IconDownload": "M10.8,3 L13.2,3 L13.2,11.2 L15.8,8.6 L17.5,10.3 L12,15.8 L6.5,10.3 L8.2,8.6 L10.8,11.2 Z M4,17.5 L20,17.5 L20,21 L4,21 Z",
}

MARK = ("M7,22.5 L10.1,13.1 C10.4,12.2 9.9,11.2 10.3,10.3 C10.8,9 11,7 11.2,5.6 L12.8,5.6 C13,7 13.2,9 13.7,10.3 "
        "C14.1,11.2 13.6,12.2 13.9,13.1 L17,22.5 Z "
        "M12,10.2 L13,11.5 L12,12.8 L11,11.5 Z M12,14.2 L13.2,15.7 L12,17.2 L10.8,15.7 Z M12,18.4 L13.4,20.2 L10.6,20.2 Z "
        "M11.4,1.4 L12.6,1.4 L12.6,5.1 L11.4,5.1 Z M12.8,1.7 L17.6,3.4 L12.8,5.1 Z")


def xaml_block():
    lines = ["    <!-- ICONS:BEGIN (art/icons.py) -->"]
    for key, d in ICONS.items():
        lines.append(f'    <Geometry x:Key="{key}">F0 {d}</Geometry>')
    lines.append(f'    <Geometry x:Key="LocalSpireMarkGeometry">F0 {MARK}</Geometry>')
    lines.append("    <!-- ICONS:END -->")
    return "\n".join(lines)


def symbol_block():
    out = ['<!-- ICONS:BEGIN (art/icons.py) -->', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>']
    for key, d in ICONS.items():
        out.append(f'<symbol id="{key}" viewBox="0 0 24 24"><path fill-rule="evenodd" d="{d}"/></symbol>')
    out.append(f'<symbol id="LocalSpireMark" viewBox="0 0 24 24"><path fill-rule="evenodd" d="{MARK}"/></symbol>')
    out.append('</defs></svg>')
    out.append('<!-- ICONS:END -->')
    return "\n".join(out)


def patch(path, block, pattern):
    text = path.read_text(encoding="utf-8")
    new, n = re.subn(pattern, lambda m: block, text, flags=re.S)
    if n != 1:
        raise SystemExit(f"{path}: expected one ICONS block, found {n}")
    path.write_text(new, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    art = Path(__file__).resolve().parent
    theme = art.parent
    patch(theme / "src" / "Media.xaml", xaml_block(), r"[ \t]*<!-- ICONS:BEGIN.*?<!-- ICONS:END -->")
    for name in ("preview-details.html", "preview-settings.html"):
        f = art / name
        if f.exists() and "ICONS:BEGIN" in f.read_text(encoding="utf-8"):
            patch(f, symbol_block(), r"<!-- ICONS:BEGIN.*?<!-- ICONS:END -->")
    (art / "mark.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="{MARK}"/></svg>\n',
        encoding="utf-8")
    print("icons:", len(ICONS))
