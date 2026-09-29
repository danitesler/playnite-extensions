#!/usr/bin/env python3
"""Draw a Playnite add-on icon in the danitesler.com/projects tile style.

The mark is flat. The tile is a dark rounded square with a hairline inset
outline and a radial glow along the bottom, matching .project-icon--glow on
that page (23% radius, 1px outline at 50px, glow 180% 82% at 50% 102%).

  python3 scripts/render-addon-icon.py --svg logo.svg --extension mytheme
  python3 scripts/render-addon-icon.py --svg logo.svg --out src/themes/MyTheme/info/icon.png

Pass the mark only (no wordmark, no full-bleed background). On macOS the SVG
is rasterized with Quick Look so holes and fill rules stay intact. Elsewhere
it falls back to a small path rasterizer (path, rect, circle, ellipse, line,
polyline, polygon). Needs Pillow.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ACCENT_DEFAULT = (255, 122, 26)  # #FF7A1A, the Playnite tiles on the projects page
SHAPES = {"path", "rect", "circle", "ellipse", "polygon", "polyline", "line"}


def parse_color(text: str) -> tuple[int, int, int]:
    value = text.strip().lstrip("#")
    if len(value) == 3:
        value = "".join(ch * 2 for ch in value)
    if len(value) != 6 or any(ch not in "0123456789abcdefABCDEF" for ch in value):
        raise SystemExit(f"Color must be #RRGGBB, got {text!r}")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def extension_icon_path(key: str) -> Path:
    index = json.loads((ROOT / "src" / "extensions.json").read_text(encoding="utf-8-sig"))
    for row in index["extensions"]:
        if row["key"] == key:
            return ROOT / row["dir"] / "info" / "icon.png"
    known = ", ".join(row["key"] for row in index["extensions"])
    raise SystemExit(f"Unknown extension {key!r}. Known: {known}")


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def rewrite_mark_svg(svg_text: str) -> ET.Element:
    """White mark on a black field, so luminance is the mask."""
    root = ET.fromstring(svg_text)
    if local_name(root.tag) != "svg":
        raise SystemExit("The file is not an SVG.")
    view_box = root.get("viewBox")
    if not view_box:
        width = re.sub(r"[^\d.]", "", root.get("width") or "24") or "24"
        height = re.sub(r"[^\d.]", "", root.get("height") or "24") or "24"
        view_box = f"0 0 {width} {height}"
        root.set("viewBox", view_box)
    parts = view_box.replace(",", " ").split()
    if len(parts) != 4:
        raise SystemExit(f"Bad viewBox: {view_box!r}")
    x, y, width, height = parts

    def paint(el: ET.Element) -> None:
        tag = local_name(el.tag)
        if tag in {"defs", "style", "title", "desc", "metadata", "clipPath", "mask"}:
            return
        style = el.get("style")
        if style:
            style = re.sub(r"fill\s*:\s*(?!none\b)[^;]+", "fill:#ffffff", style, flags=re.I)
            style = re.sub(r"stroke\s*:\s*(?!none\b)[^;]+", "stroke:#ffffff", style, flags=re.I)
            el.set("style", style)
        fill = el.get("fill")
        stroke = el.get("stroke")
        if fill and fill.lower() != "none":
            el.set("fill", "#ffffff")
        elif tag in SHAPES and not fill and (not stroke or stroke.lower() == "none"):
            el.set("fill", "#ffffff")
        if stroke and stroke.lower() != "none":
            el.set("stroke", "#ffffff")
        for child in list(el):
            paint(child)

    paint(root)
    root.set("fill", "#ffffff")
    root.set("width", "1024")
    root.set("height", "1024")
    rect = ET.Element("rect")
    rect.set("x", x)
    rect.set("y", y)
    rect.set("width", width)
    rect.set("height", height)
    rect.set("fill", "#000000")
    root.insert(0, rect)
    if root.tag.startswith("{"):
        ET.register_namespace("", root.tag[1:].split("}", 1)[0])
    return root


def rasterize_quicklook(svg_text: str) -> Image.Image | None:
    qlmanage = shutil.which("qlmanage")
    if not qlmanage:
        return None
    root = rewrite_mark_svg(svg_text)
    with tempfile.TemporaryDirectory(prefix="addon-icon-") as folder:
        svg_path = Path(folder) / "mark.svg"
        svg_path.write_text(ET.tostring(root, encoding="unicode"))
        subprocess.run(
            [qlmanage, "-t", "-s", "1024", "-o", folder, str(svg_path)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        rendered = svg_path.with_name("mark.svg.png")
        if not rendered.exists():
            return None
        return Image.open(rendered).convert("RGB")


def rasterize_paths(svg_text: str) -> Image.Image:
    """Fallback for machines without Quick Look. Holes in one subpath may be wrong."""
    root = ET.fromstring(svg_text)
    view_box = root.get("viewBox") or "0 0 24 24"
    vx, vy, vw, vh = [float(n) for n in view_box.replace(",", " ").split()]
    canvas = 1024
    scale = canvas / max(vw, vh)
    ox = (canvas - vw * scale) / 2 - vx * scale
    oy = (canvas - vh * scale) / 2 - vy * scale
    mask = Image.new("L", (canvas, canvas), 0)
    draw = ImageDraw.Draw(mask)

    def map_point(x: float, y: float) -> tuple[float, float]:
        return ox + x * scale, oy + y * scale

    for el in root.iter():
        tag = local_name(el.tag)
        if tag == "rect" and el.get("fill", "").lower() != "none":
            x = float(el.get("x") or 0)
            y = float(el.get("y") or 0)
            w = float(el.get("width") or 0)
            h = float(el.get("height") or 0)
            radius = float(el.get("rx") or el.get("ry") or 0) * scale
            box = [ox + x * scale, oy + y * scale, ox + (x + w) * scale, oy + (y + h) * scale]
            if radius:
                draw.rounded_rectangle(box, radius=radius, fill=255)
            else:
                draw.rectangle(box, fill=255)
        elif tag == "circle":
            cx = float(el.get("cx") or 0)
            cy = float(el.get("cy") or 0)
            r = float(el.get("r") or 0)
            c = map_point(cx, cy)
            rr = r * scale
            draw.ellipse([c[0] - rr, c[1] - rr, c[0] + rr, c[1] + rr], fill=255)
        elif tag == "path" and el.get("fill", "").lower() != "none":
            data = el.get("d")
            if not data:
                continue
            for sub in flatten_subpaths(data):
                points = [map_point(x, y) for x, y in sub]
                if len(points) >= 3:
                    layer = Image.new("L", (canvas, canvas), 0)
                    ImageDraw.Draw(layer).polygon(points, fill=255)
                    mask = Image.frombytes("L", mask.size, bytes(a ^ b for a, b in zip(mask.tobytes(), layer.tobytes())))
                    draw = ImageDraw.Draw(mask)
    rgb = Image.merge("RGB", (mask, mask, mask))
    return rgb


def flatten_subpaths(d: str, samples: int = 12) -> list[list[tuple[float, float]]]:
    tokens = re.findall(r"[MmLlHhVvCcQqAaZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?", d)
    i = 0
    cmd = None
    cx = cy = sx = sy = 0.0
    sub: list[tuple[float, float]] = []
    subs: list[list[tuple[float, float]]] = []

    def num() -> float:
        nonlocal i
        value = float(tokens[i])
        i += 1
        return value

    def close_sub() -> None:
        nonlocal sub
        if len(sub) > 2:
            subs.append(sub)
        sub = []

    def add(x: float, y: float) -> None:
        sub.append((x, y))

    def cubic(x1, y1, x2, y2, x, y) -> None:
        nonlocal cx, cy
        p0x, p0y = cx, cy
        for step in range(1, samples + 1):
            t = step / samples
            u = 1 - t
            add(
                u**3 * p0x + 3 * u**2 * t * x1 + 3 * u * t**2 * x2 + t**3 * x,
                u**3 * p0y + 3 * u**2 * t * y1 + 3 * u * t**2 * y2 + t**3 * y,
            )
        cx, cy = x, y

    def quad(x1, y1, x, y) -> None:
        nonlocal cx, cy
        p0x, p0y = cx, cy
        for step in range(1, samples + 1):
            t = step / samples
            u = 1 - t
            add(u * u * p0x + 2 * u * t * x1 + t * t * x, u * u * p0y + 2 * u * t * y1 + t * t * y)
        cx, cy = x, y

    def arc(rx, ry, phi, fa, fs, x2, y2) -> None:
        nonlocal cx, cy
        x1, y1 = cx, cy
        if abs(x1 - x2) < 1e-9 and abs(y1 - y2) < 1e-9:
            cx, cy = x2, y2
            return
        phi_r = math.radians(phi % 360)
        cos_p, sin_p = math.cos(phi_r), math.sin(phi_r)
        dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
        x1p = cos_p * dx + sin_p * dy
        y1p = -sin_p * dx + cos_p * dy
        rx, ry = abs(rx), abs(ry) or 1e-6
        lam = x1p**2 / rx**2 + y1p**2 / ry**2
        if lam > 1:
            factor = math.sqrt(lam)
            rx *= factor
            ry *= factor
        sign = -1 if fa == fs else 1
        den = rx**2 * y1p**2 + ry**2 * x1p**2
        sq = 0 if den == 0 else max(0.0, (rx**2 * ry**2 - rx**2 * y1p**2 - ry**2 * x1p**2) / den)
        coef = sign * math.sqrt(sq)
        cxp = coef * rx * y1p / ry
        cyp = coef * -ry * x1p / rx
        ccx = cos_p * cxp - sin_p * cyp + (x1 + x2) / 2
        ccy = sin_p * cxp + cos_p * cyp + (y1 + y2) / 2

        def ang(ux, uy, vx, vy) -> float:
            return math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)

        theta1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
        dtheta = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
        if fs == 0 and dtheta > 0:
            dtheta -= 2 * math.pi
        elif fs == 1 and dtheta < 0:
            dtheta += 2 * math.pi
        steps = max(samples, int(abs(dtheta) / (math.pi / 10)) + 1)
        for step in range(1, steps + 1):
            th = theta1 + dtheta * step / steps
            add(
                ccx + rx * math.cos(th) * cos_p - ry * math.sin(th) * sin_p,
                ccy + rx * math.cos(th) * sin_p + ry * math.sin(th) * cos_p,
            )
        cx, cy = x2, y2

    while i < len(tokens):
        if len(tokens[i]) == 1 and tokens[i].isalpha():
            cmd = tokens[i]
            i += 1
            if cmd in "Zz":
                if sub:
                    sub.append(sub[0])
                cx, cy = sx, sy
                close_sub()
                continue
        if cmd is None:
            raise SystemExit("SVG path does not start with a command.")
        rel = cmd.islower()
        kind = cmd.upper()
        if kind == "M":
            if sub:
                close_sub()
            x, y = num(), num()
            if rel:
                x += cx
                y += cy
            cx, cy = sx, sy = x, y
            add(x, y)
            cmd = "l" if rel else "L"
        elif kind == "L":
            x, y = num(), num()
            if rel:
                x += cx
                y += cy
            cx, cy = x, y
            add(x, y)
        elif kind == "H":
            x = num()
            if rel:
                x += cx
            cx = x
            add(cx, cy)
        elif kind == "V":
            y = num()
            if rel:
                y += cy
            cy = y
            add(cx, cy)
        elif kind == "C":
            vals = [num() for _ in range(6)]
            if rel:
                vals[0] += cx
                vals[1] += cy
                vals[2] += cx
                vals[3] += cy
                vals[4] += cx
                vals[5] += cy
            cubic(*vals)
        elif kind == "Q":
            vals = [num() for _ in range(4)]
            if rel:
                vals[0] += cx
                vals[1] += cy
                vals[2] += cx
                vals[3] += cy
            quad(*vals)
        elif kind == "A":
            rx, ry, phi, fa, fs, x, y = (num() for _ in range(7))
            if rel:
                x += cx
                y += cy
            arc(rx, ry, phi, int(fa), int(fs), x, y)
        else:
            raise SystemExit(f"SVG path command {cmd!r} is not supported.")
    if sub:
        close_sub()
    return subs


def mark_image(svg_text: str) -> Image.Image:
    rendered = rasterize_quicklook(svg_text)
    if rendered is None:
        print("Quick Look is not available; using the built-in path rasterizer.", file=sys.stderr)
        rendered = rasterize_paths(svg_text)
    return rendered


def compose(mark: Image.Image, size: int, color: tuple[int, int, int], mark_scale: float) -> Image.Image:
    ss = 4
    canvas = size * ss
    lum = mark.convert("L")
    bbox = lum.point(lambda p: 255 if p > 16 else 0).getbbox()
    if not bbox:
        raise SystemExit("The SVG produced an empty mark.")
    cropped = lum.crop(bbox)
    target = canvas * mark_scale
    scale = target / max(cropped.size)
    resized = cropped.resize(
        (max(1, int(round(cropped.width * scale))), max(1, int(round(cropped.height * scale)))),
        Image.Resampling.LANCZOS,
    )
    alpha = Image.new("L", (canvas, canvas), 0)
    alpha.paste(resized, ((canvas - resized.width) // 2, (canvas - resized.height) // 2))

    tile = Image.new("L", (canvas, canvas), 0)
    radius = int(canvas * 0.23)
    ImageDraw.Draw(tile).rounded_rectangle([1, 1, canvas - 2, canvas - 2], radius=radius, fill=255)
    inset = canvas / 50  # 1px when the tile is shown at the site's 50px
    inner = Image.new("L", (canvas, canvas), 0)
    ImageDraw.Draw(inner).rounded_rectangle(
        [1 + inset, 1 + inset, canvas - 2 - inset, canvas - 2 - inset],
        radius=max(1, int(radius - inset)),
        fill=255,
    )

    # Radial glow: 180% 82% at 50% 102%, accent*0.38 -> accent*0.14 at 48% -> black.
    px = tile.load()
    inner_px = inner.load()
    mark_px = alpha.load()
    out = Image.new("RGBA", (canvas, canvas))
    out_px = out.load()
    cx, cy = 0.50 * canvas, 1.02 * canvas
    rx, ry = 1.80 * canvas, 0.82 * canvas
    c0 = tuple(channel * 0.38 for channel in color)
    c1 = tuple(channel * 0.14 for channel in color)
    for y in range(canvas):
        for x in range(canvas):
            cover = px[x, y] / 255
            if cover <= 0:
                out_px[x, y] = (0, 0, 0, 0)
                continue
            t = math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
            if t <= 0.48:
                mix = t / 0.48
                glow = tuple(c0[i] * (1 - mix) + c1[i] * mix for i in range(3))
            else:
                mix = min(1.0, (t - 0.48) / 0.52)
                glow = tuple(c1[i] * (1 - mix) for i in range(3))
            rim = max(0.0, (px[x, y] - inner_px[x, y]) / 255) * 0.10
            rgb = tuple(glow[i] * (1 - rim) + 255 * rim for i in range(3))
            m = (mark_px[x, y] / 255) * cover
            rgb = tuple(rgb[i] * (1 - m) + color[i] * m for i in range(3))
            out_px[x, y] = tuple(int(round(channel)) for channel in rgb) + (int(round(cover * 255)),)

    return out.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--svg", required=True, type=Path, help="SVG of the mark (not a wordmark)")
    parser.add_argument("--out", type=Path, help="PNG to write (default: the extension's info/icon.png)")
    parser.add_argument("--extension", help="Extension key from src/extensions.json")
    parser.add_argument("--color", default="#FF7A1A", help="Flat mark color (default: the projects-page orange)")
    parser.add_argument("--mark-scale", type=float, default=0.62, help="How much of the tile the mark fills (default: 0.62)")
    parser.add_argument("--size", type=int, default=512, help="PNG size in pixels (default: 512)")
    args = parser.parse_args()
    if not args.svg.is_file():
        raise SystemExit(f"No such file: {args.svg}")
    out = args.out
    if args.extension:
        icon = extension_icon_path(args.extension)
        out = out or icon
    if out is None:
        raise SystemExit("Pass --out or --extension.")
    if not 0.2 <= args.mark_scale <= 0.9:
        raise SystemExit("--mark-scale must be between 0.2 and 0.9.")

    image = compose(mark_image(args.svg.read_text()), args.size, parse_color(args.color), args.mark_scale)
    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out, "PNG", optimize=True)
    print(out)


if __name__ == "__main__":
    main()
