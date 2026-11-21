"""Brushlight's UI icons: hairline drawings on a 24-unit grid, in the manner of Clair Obscur's menu glyphs (thin strokes,
diamonds and lozenges, the skill tree's turned squares). IconTemplate strokes each Geometry in the control's Foreground at
1.6 units with mitred joins and no fill, so closed shapes stay outlines and tiny closed shapes read as dots.

Run:  python src/themes/Brushlight/art/icons.py
Rewrites the block between the ICONS markers in src/Media.xaml and in art/preview-*.html (an inline <symbol> sheet), and
writes art/mark.svg (the brand mark: a lozenge split by a hairline, two nodes, a brush stroke across it).
"""
import re
from pathlib import Path


def circle(cx, cy, r):
    return f"M{cx - r:g},{cy} a{r:g},{r:g} 0 1 0 {2 * r:g},0 a{r:g},{r:g} 0 1 0 {-2 * r:g},0 Z"


def diamond(cx, cy, r, ry=None):
    ry = r if ry is None else ry
    return f"M{cx:g},{cy - ry:g} L{cx + r:g},{cy:g} L{cx:g},{cy + ry:g} L{cx - r:g},{cy:g} Z"


ICONS = {
    "IconSearch": f"{circle(10.5, 10.5, 6.5)} M15.2,15.2 L20.5,20.5",
    "IconClear": "M6,6 L18,18 M18,6 L6,18",
    "IconViewSettings": f"M3,6 L21,6 M3,12 L21,12 M3,18 L21,18 {diamond(8, 6, 2.2)} {diamond(16, 12, 2.2)} {diamond(10, 18, 2.2)}",
    "IconFilterPresets": "M3,5 L15,5 L10.5,11 L10.5,17 L7.5,19 L7.5,11 Z M17,10 L21,10 M17,14 L21,14 M17,18 L21,18",
    "IconGroup": "M7,4.5 L19.5,4.5 L21.5,7.5 L19.5,10.5 L7,10.5 L9,7.5 Z M3,13.5 L15.5,13.5 L17.5,16.5 L15.5,19.5 L3,19.5 L5,16.5 Z",
    "IconSort": "M3,6 L14,6 M3,12 L11,12 M3,18 L8,18 M18,4.5 L18,19 M14.8,15.8 L18,19 L21.2,15.8",
    "IconDetailsView": f"{diamond(5, 6, 1.8)} M9,6 L21,6 {diamond(5, 12, 1.8)} M9,12 L21,12 {diamond(5, 18, 1.8)} M9,18 L21,18",
    "IconGridView": "M4,4 L10.5,4 L10.5,10.5 L4,10.5 Z M13.5,4 L20,4 L20,10.5 L13.5,10.5 Z M4,13.5 L10.5,13.5 L10.5,20 L4,20 Z M13.5,13.5 L20,13.5 L20,20 L13.5,20 Z",
    "IconListView": "M3,6 L21,6 M3,12 L21,12 M3,18 L16,18",
    "IconUpdate": "M19,9.5 A7.5,7.5 0 0 0 5.4,8 M5,14.5 A7.5,7.5 0 0 0 18.6,16 M19.4,4.6 L19,9.5 L14.2,9 M4.6,19.4 L5,14.5 L9.8,15",
    "IconExplorer": "M3,6 L9,6 L10.5,8 L21,8 L21,19 L3,19 Z M3,11 L21,11",
    "IconRandom": f"{diamond(12, 12, 9)} {circle(12, 8, 0.6)} {circle(8, 12, 0.6)} {circle(16, 12, 0.6)} {circle(12, 16, 0.6)}",
    "IconViewRandom": f"{diamond(12, 12, 9)} {circle(12, 8, 0.6)} {circle(8, 12, 0.6)} {circle(16, 12, 0.6)} {circle(12, 16, 0.6)}",
    "IconFilter": "M3.5,4.5 L20.5,4.5 L14,12 L14,18.5 L10,20.5 L10,12 Z",
    "IconNotifications": "M6.5,17 L6.5,10.5 A5.5,5.5 0 0 1 17.5,10.5 L17.5,17 L19.5,18.5 L4.5,18.5 Z M10,21 L14,21 M12,3 L12,5",
    "IconMainMenu": f"M9,6 L21,6 M9,12 L21,12 M9,18 L21,18 {diamond(4.5, 12, 1.9)}",
    "IconLibrary": "M4,4.5 L8,4.5 L8,19.5 L4,19.5 Z M10,6.5 L14,6.5 L14,19.5 L10,19.5 Z M15.8,6.2 L19.6,5.2 L22,18.8 L18.2,19.8 Z M4,8 L8,8 M10,10 L14,10",
    "IconStatistics": "M4,20 L20,20 M5.5,20 L5.5,13 L9,13 L9,20 M10.5,20 L10.5,8 L14,8 L14,20 M15.5,20 L15.5,4 L19,4 L19,20",
    "IconWindowMinimize": "M5,17 L19,17",
    "IconWindowMaximize": "M5,5 L19,5 L19,19 L5,19 Z",
    "IconWindowRestore": "M8.5,4.5 L19.5,4.5 L19.5,15.5 M4.5,8.5 L15.5,8.5 L15.5,19.5 L4.5,19.5 Z",
    "IconWindowClose": "M5.5,5.5 L18.5,18.5 M18.5,5.5 L5.5,18.5",
    "IconDropDown": "M6,9.5 L12,15.5 L18,9.5",
    "IconSubmenu": "M9.5,6 L15.5,12 L9.5,18",
    "IconCheck": "M4.5,12.5 L9.5,17.5 L19.5,6.5",
    "IconAdd": "M12,4.5 L12,19.5 M4.5,12 L19.5,12",
    "IconEdit": "M14.5,4.5 L19.5,9.5 L10,19 L5,19 L5,14 Z M12.5,6.5 L17.5,11.5 M5,19 L3.5,20.5",
    "IconRemove": "M4,6.5 L20,6.5 M9.5,6.5 L9.5,3.5 L14.5,3.5 L14.5,6.5 M6,6.5 L7,20.5 L17,20.5 L18,6.5 M10,10 L10,17 M14,10 L14,17",
    "IconOptions": f"{circle(5, 12, 0.9)} {circle(12, 12, 0.9)} {circle(19, 12, 0.9)}",
    "IconPlay": "M7,4 L20,12 L7,20 Z M9.6,9.2 L14.2,12 L9.6,14.8 Z",
    "IconInfo": f"{diamond(12, 12, 9.5)} M12,10.5 L12,16.5 {circle(12, 7.6, 0.5)}",
    "IconDownload": "M12,3.5 L12,15 M7.5,10.5 L12,15 L16.5,10.5 M4.5,19.5 L19.5,19.5",
}

# The mark: a tall lozenge split by a hairline (the Chroma shape) with a node at each side, stroked like the icons.
MARK_LINES = f"{diamond(12, 12, 5.2, 10.6)} M12,4.6 L12,19.4 {diamond(3.2, 12, 1.8)} {diamond(20.8, 12, 1.8)}"
# The same mark as filled shapes for raster tools (even-odd: the ring's hole is open, the split bar inside it is filled).
MARK_FILL = (f"{diamond(12, 12, 5.6, 11.2)} {diamond(12, 12, 4.1, 9.0)} M11.35,4.6 L12.65,4.6 L12.65,19.4 L11.35,19.4 Z "
             f"{diamond(3.0, 12, 2.2)} {diamond(21.0, 12, 2.2)}")
# The brush stroke that crosses it (filled, nonzero): a ragged band rising slightly to the right.
MARK_STROKE = ("M1.6,15.4 L4.2,14.6 L7.6,14.2 L11.8,13.4 L16.4,12.8 L20.4,12.2 L22.6,11.8 L22.1,12.9 L19.6,13.6 "
               "L21.4,13.9 L17.2,14.6 L12.6,15.2 L8.4,15.8 L5.2,16.3 L2.4,16.6 L3.6,16 Z")


def xaml_block():
    lines = ["    <!-- ICONS:BEGIN (art/icons.py) -->"]
    for k, v in ICONS.items():
        lines.append(f'    <Geometry x:Key="{k}">F1 {v}</Geometry>')
    lines.append(f'    <Geometry x:Key="LocalBrushMarkGeometry">F1 {MARK_LINES}</Geometry>')
    lines.append(f'    <Geometry x:Key="LocalBrushMarkStroke">F1 {MARK_STROKE}</Geometry>')
    lines.append("    <!-- ICONS:END -->")
    return "\n".join(lines)


def symbol_block():
    out = ['<!-- ICONS:BEGIN (art/icons.py) -->', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>']
    for k, v in ICONS.items():
        out.append(f'<symbol id="{k}" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.6" '
                   f'stroke-linejoin="miter" d="{v}"/></symbol>')
    out.append(f'<symbol id="LocalBrushMark" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.3" '
               f'stroke-linejoin="miter" d="{MARK_LINES}"/></symbol>')
    out.append(f'<symbol id="LocalBrushMarkStroke" viewBox="0 0 24 24"><path fill="currentColor" d="{MARK_STROKE}"/></symbol>')
    out.append('</defs></svg>')
    out.append('<!-- ICONS:END -->')
    return "\n".join(out)


def patch(path, block, pattern):
    text = path.read_text(encoding="utf-8")
    new, n = re.subn(pattern, lambda m: block, text, count=1, flags=re.S)
    if n:
        path.write_text(new, encoding="utf-8", newline="\n")
        print("patched", path.name)
    else:
        print("no ICONS markers in", path.name)


def main():
    theme = Path(__file__).resolve().parent.parent
    media = theme / "src" / "Media.xaml"
    if media.exists():
        patch(media, xaml_block(), r"[ \t]*<!-- ICONS:BEGIN.*?<!-- ICONS:END -->")
    for name in ("preview-details.html", "preview-settings.html"):
        f = theme / "art" / name
        if f.exists() and "ICONS:BEGIN" in f.read_text(encoding="utf-8"):
            patch(f, symbol_block(), r"<!-- ICONS:BEGIN.*?<!-- ICONS:END -->")
    (theme / "art" / "mark.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
        f'<path fill="currentColor" fill-rule="evenodd" d="{MARK_FILL}"/></svg>\n',
        encoding="utf-8")
    print("wrote art/mark.svg")


if __name__ == "__main__":
    main()
