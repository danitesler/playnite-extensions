#!/usr/bin/env python3
"""Menu icons and placeholders for the WoW Vanilla Theme: original artwork, not the game's icon files.

Each icon is a 64x64 SVG in one shared style (dark brown outline, warm gradients, a glint), the way the Vanilla
interface draws item icons. The subjects are generic props: a cog, a chest, a quill, an hourglass.

  python3 art/menu_icons.py svg      write art/svg/*.svg
  python3 art/menu_icons.py png      render src/Images/Menu/*.png (needs Node with Playwright's Chromium and Pillow)
  python3 art/menu_icons.py sheet    write art/menu-sheet.html to look at them all
"""
import math
import os
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = "#1c1206"

DEFS = f"""<defs>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4b0"/><stop offset=".45" stop-color="#f2b92e"/><stop offset="1" stop-color="#9a5f10"/></linearGradient>
<linearGradient id="bronze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c884"/><stop offset=".5" stop-color="#b47a30"/><stop offset="1" stop-color="#5e3a12"/></linearGradient>
<linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9fc"/><stop offset=".5" stop-color="#a8b3bf"/><stop offset="1" stop-color="#57626d"/></linearGradient>
<linearGradient id="red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e65f40"/><stop offset=".5" stop-color="#9c2513"/><stop offset="1" stop-color="#540d06"/></linearGradient>
<linearGradient id="parch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d2"/><stop offset=".55" stop-color="#e5ca8e"/><stop offset="1" stop-color="#b8955a"/></linearGradient>
<linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b0f068"/><stop offset=".5" stop-color="#4ea924"/><stop offset="1" stop-color="#1f610d"/></linearGradient>
<linearGradient id="blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93d2ff"/><stop offset=".5" stop-color="#3079dc"/><stop offset="1" stop-color="#14408f"/></linearGradient>
<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98d55"/><stop offset=".5" stop-color="#8c552a"/><stop offset="1" stop-color="#472612"/></linearGradient>
<linearGradient id="ivory" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffbe8"/><stop offset=".6" stop-color="#e6d9b0"/><stop offset="1" stop-color="#b3a372"/></linearGradient>
<linearGradient id="feather" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#d3dcea"/><stop offset="1" stop-color="#8496b0"/></linearGradient>
<radialGradient id="sun" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff7b8"/><stop offset=".55" stop-color="#ffc93a"/><stop offset="1" stop-color="#e07a10"/></radialGradient>
<radialGradient id="slot" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#3a2f22"/><stop offset="1" stop-color="#0d0b08"/></radialGradient>
</defs>"""

O = f'stroke="{OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"'
GLINT = 'fill="#fff" fill-opacity=".38"'


def pts(points):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in points)


def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.sin(a), cy - r * math.cos(a)


def star_points(cx, cy, ro, ri, n=5):
    return [polar(cx, cy, ro if i % 2 == 0 else ri, i * 180 / n) for i in range(2 * n)]


def gear_points(cx, cy, teeth, r_out, r_root):
    out, step = [], 360 / teeth
    for i in range(teeth):
        c = i * step
        for off, r in ((-0.36, r_root), (-0.2, r_out), (0.2, r_out), (0.36, r_root), (0.5, r_root)):
            out.append(polar(cx, cy, r, c + off * step))
    return out


def ring(inner_fill):
    """A gold-rimmed coin with a dark bed: the base of the round icons."""
    return (f'<circle cx="32" cy="32" r="27" fill="url(#gold)" {O}/>'
            f'<circle cx="32" cy="32" r="21" fill="{inner_fill}" {O}/>'
            f'<path d="M12 24 A22 22 0 0 1 30 10" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>')


ICONS = {}

ICONS["fullscreen"] = (
    f'<rect x="6" y="9" width="52" height="38" rx="4" fill="url(#gold)" {O}/>'
    f'<rect x="11" y="14" width="42" height="28" rx="2" fill="url(#blue)" {O}/>'
    f'<path d="M11 36 L24 26 L34 34 L42 28 L53 36 V42 H11Z" fill="#1f610d" fill-opacity=".85"/>'
    f'<path d="M25 50 H39 V56 H25Z" fill="url(#bronze)" {O}/><rect x="18" y="54" width="28" height="4" rx="2" fill="url(#bronze)" {O}/>'
    f'<path d="M14 17 L22 17 L14 25Z M50 17 L42 17 L50 25Z" fill="#fff" fill-opacity=".8"/>')

ICONS["plus"] = (ring("url(#slot)")
                 + f'<polygon points="{pts([(27,14),(37,14),(37,27),(50,27),(50,37),(37,37),(37,50),(27,50),(27,37),(14,37),(14,27),(27,27)])}" fill="url(#green)" {O}/>'
                 + '<path d="M28 16 H36" stroke="#fff" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round"/>')

ICONS["sync"] = (
    f'<path d="M10 30 A22 22 0 0 1 46 13" fill="none" stroke="{OUT}" stroke-width="13" stroke-linecap="round"/>'
    f'<path d="M54 34 A22 22 0 0 1 18 51" fill="none" stroke="{OUT}" stroke-width="13" stroke-linecap="round"/>'
    '<path d="M10 30 A22 22 0 0 1 46 13" fill="none" stroke="url(#gold)" stroke-width="7" stroke-linecap="round"/>'
    '<path d="M54 34 A22 22 0 0 1 18 51" fill="none" stroke="url(#gold)" stroke-width="7" stroke-linecap="round"/>'
    f'<polygon points="{pts([(38,4),(56,14),(36,24)])}" fill="url(#gold)" {O}/>'
    f'<polygon points="{pts([(26,60),(8,50),(28,40)])}" fill="url(#gold)" {O}/>')

ICONS["info"] = (ring("url(#blue)")
                 + f'<circle cx="32" cy="19" r="4" fill="#fff" {O}/>'
                 + f'<rect x="28" y="26" width="8" height="21" rx="2.5" fill="#fff" {O}/>')

ICONS["exit"] = (
    f'<rect x="8" y="6" width="30" height="52" rx="3" fill="url(#wood)" {O}/>'
    f'<rect x="13" y="12" width="20" height="18" rx="1.5" fill="#000" fill-opacity=".22"/><rect x="13" y="34" width="20" height="18" rx="1.5" fill="#000" fill-opacity=".22"/>'
    f'<circle cx="31" cy="33" r="2.6" fill="url(#gold)" stroke="{OUT}" stroke-width="1.6"/>'
    f'<polygon points="{pts([(36,25),(46,25),(46,16),(61,32),(46,48),(46,39),(36,39)])}" fill="url(#red)" {O}/>'
    '<path d="M39 28 H47" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>')

ICONS["gear"] = (
    f'<polygon points="{pts(gear_points(32, 32, 8, 28, 21))}" fill="url(#steel)" {O}/>'
    f'<circle cx="32" cy="32" r="12" fill="url(#gold)" {O}/><circle cx="32" cy="32" r="4.6" fill="{OUT}"/>'
    '<path d="M14 22 A20 20 0 0 1 26 12" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>')

ICONS["puzzle"] = (
    f'<g stroke="{OUT}" stroke-width="7" stroke-linejoin="round"><rect x="12" y="18" width="34" height="34" rx="4" fill="{OUT}"/><circle cx="29" cy="15" r="8" fill="{OUT}"/><circle cx="51" cy="35" r="8" fill="{OUT}"/></g>'
    '<rect x="12" y="18" width="34" height="34" rx="4" fill="url(#green)"/><circle cx="29" cy="15" r="8" fill="url(#green)"/><circle cx="51" cy="35" r="8" fill="url(#green)"/>'
    '<path d="M16 24 V47" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="12" r="2.6" fill="#fff" fill-opacity=".55"/>')

ICONS["play"] = (ring("url(#slot)")
                 + f'<polygon points="{pts([(25,16),(25,48),(49,32)])}" fill="url(#green)" {O}/>'
                 + '<path d="M28 21 V33" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" stroke-linecap="round"/>')

ICONS["download"] = (
    f'<polygon points="{pts([(26,4),(38,4),(38,22),(48,22),(32,38),(16,22),(26,22)])}" fill="url(#green)" {O}/>'
    f'<rect x="8" y="36" width="48" height="22" rx="3" fill="url(#wood)" {O}/><path d="M8 44 H56" stroke="{OUT}" stroke-width="2.5"/>'
    f'<rect x="26" y="40" width="12" height="10" rx="2" fill="url(#gold)" {O}/>'
    '<path d="M28 7 V19" stroke="#fff" stroke-opacity=".5" stroke-width="2.6" stroke-linecap="round"/>')

ICONS["link"] = (
    f'<g transform="rotate(-45 32 32)"><rect x="3" y="21" width="34" height="22" rx="11" fill="none" stroke="{OUT}" stroke-width="13"/>'
    f'<rect x="27" y="21" width="34" height="22" rx="11" fill="none" stroke="{OUT}" stroke-width="13"/>'
    '<rect x="3" y="21" width="34" height="22" rx="11" fill="none" stroke="#b9c4cf" stroke-width="7"/>'
    '<rect x="27" y="21" width="34" height="22" rx="11" fill="none" stroke="#dbe3ea" stroke-width="7"/>'
    '<path d="M10 24 H30" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/></g>')

ICONS["bag"] = (
    f'<path d="M20 24 C6 34 6 56 32 58 C58 56 58 34 44 24 Z" fill="url(#wood)" {O}/>'
    f'<rect x="21" y="14" width="22" height="12" rx="4" fill="url(#wood)" {O}/>'
    f'<ellipse cx="32" cy="14" rx="11" ry="4" fill="#1c1206" {O}/><circle cx="29" cy="13" r="3.4" fill="url(#gold)" stroke="{OUT}" stroke-width="1.5"/><circle cx="36" cy="12.5" r="3.2" fill="url(#gold)" stroke="{OUT}" stroke-width="1.5"/>'
    f'<path d="M20 26 C28 30 36 30 44 26" fill="none" stroke="url(#gold)" stroke-width="3.4" stroke-linecap="round"/>'
    '<path d="M14 38 C13 46 17 52 24 54" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>')

ICONS["coins"] = "".join(
    f'<path d="M10 {y} V{y + 8} A22 8 0 0 0 54 {y + 8} V{y} Z" fill="#a8680f" {O}/>'
    f'<ellipse cx="32" cy="{y}" rx="22" ry="8" fill="url(#gold)" {O}/><ellipse cx="32" cy="{y}" rx="15" ry="4.8" fill="none" stroke="#b8730f" stroke-width="2"/>'
    for y in (44, 33, 22)) + '<path d="M18 20 Q26 16 34 18" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round"/>'

ICONS["flag"] = (
    f'<rect x="13" y="9" width="5" height="50" rx="2" fill="url(#bronze)" {O}/><circle cx="15.5" cy="8" r="5" fill="url(#gold)" {O}/>'
    f'<path d="M18 12 Q34 5 52 15 L52 36 Q34 27 18 38 Z" fill="url(#red)" {O}/>'
    f'<circle cx="35" cy="24" r="5" fill="url(#gold)" stroke="{OUT}" stroke-width="2"/><path d="M22 16 Q30 12 38 14" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>')

ICONS["star"] = (
    f'<polygon points="{pts(star_points(32, 34, 28, 12))}" fill="{OUT}" fill-opacity=".55" stroke="{OUT}" stroke-width="9" stroke-linejoin="round"/>'
    f'<polygon points="{pts(star_points(32, 34, 28, 12))}" fill="none" stroke="url(#gold)" stroke-width="4.5" stroke-linejoin="round"/>')

ICONS["star-fill"] = (
    f'<polygon points="{pts(star_points(32, 34, 28, 12))}" fill="url(#gold)" {O}/>'
    '<path d="M32 12 L36 24" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>')

ICONS["eye"] = (
    f'<path d="M4 32 Q32 6 60 32 Q32 58 4 32Z" fill="url(#parch)" {O}/>'
    f'<circle cx="32" cy="32" r="12" fill="url(#blue)" {O}/><circle cx="32" cy="32" r="5.4" fill="{OUT}"/><circle cx="28" cy="28" r="2.8" fill="#fff"/>')

ICONS["eye-closed"] = (
    '<filter id="dim"><feColorMatrix type="saturate" values="0.15"/></filter>'
    '<g filter="url(#dim)" opacity=".75">'
    f'<path d="M4 32 Q32 6 60 32 Q32 58 4 32Z" fill="url(#parch)" {O}/>'
    f'<circle cx="32" cy="32" r="12" fill="url(#blue)" {O}/><circle cx="32" cy="32" r="5.4" fill="{OUT}"/></g>'
    f'<path d="M10 9 L54 55" stroke="{OUT}" stroke-width="9" stroke-linecap="round"/>'
    '<path d="M10 9 L54 55" stroke="url(#red)" stroke-width="4.4" stroke-linecap="round"/>')

ICONS["sun"] = "".join(
    f'<polygon points="{pts([polar(32, 32, 29, a), polar(32, 32, 18, a - 12), polar(32, 32, 18, a + 12)])}" fill="url(#gold)" {O}/>'
    for a in range(0, 360, 45)) + f'<circle cx="32" cy="32" r="14" fill="url(#sun)" {O}/><circle cx="27" cy="27" r="4" fill="#fff" fill-opacity=".6"/>'

ICONS["quill"] = (
    f'<path d="M12 54 C8 40 22 14 52 7 C54 32 42 50 22 55 Z" fill="url(#feather)" {O}/>'
    f'<path d="M12 56 L46 14" stroke="{OUT}" stroke-width="6" stroke-linecap="round"/><path d="M12 56 L46 14" stroke="#8a5a26" stroke-width="2.6" stroke-linecap="round"/>'
    f'<polygon points="{pts([(6,61),(10,49),(17,53)])}" fill="url(#gold)" {O}/>'
    '<path d="M22 40 C26 30 34 22 44 16" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2.2" stroke-linecap="round"/>')

ICONS["bin"] = (
    f'<path d="M13 20 H51 L47 57 H17 Z" fill="url(#steel)" {O}/>'
    '<path d="M13 20 H51 L47 57 H17 Z" fill="url(#red)" fill-opacity=".5"/>'
    f'<rect x="8" y="11" width="48" height="9" rx="3" fill="url(#steel)" {O}/><rect x="25" y="4" width="14" height="8" rx="3" fill="url(#steel)" {O}/>'
    f'<path d="M24 26 L26 51 M32 26 V51 M40 26 L38 51" stroke="{OUT}" stroke-width="3" stroke-linecap="round"/>'
    '<path d="M16 24 L19 52" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>')

ICONS["dice"] = (
    f'<g transform="rotate(12 32 32)"><rect x="9" y="9" width="46" height="46" rx="9" fill="url(#ivory)" {O}/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="4.2" fill="{OUT}"/>' for x, y in ((21, 21), (43, 21), (32, 32), (21, 43), (43, 43)))
    + '<path d="M15 15 Q20 11 30 12" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2.6" stroke-linecap="round"/></g>')

ICONS["book"] = (
    f'<rect x="12" y="6" width="42" height="52" rx="4" fill="url(#red)" {O}/>'
    '<rect x="47" y="9" width="4" height="46" rx="1.5" fill="url(#parch)"/>'
    f'<rect x="12" y="6" width="9" height="52" rx="4" fill="#000" fill-opacity=".28"/>'
    f'<rect x="24" y="14" width="22" height="11" rx="2" fill="url(#gold)" {O}/><circle cx="35" cy="41" r="7" fill="url(#gold)" {O}/><circle cx="35" cy="41" r="2.6" fill="{OUT}"/>'
    '<path d="M26 10 H46" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/>')

ICONS["chest"] = (
    f'<rect x="6" y="28" width="52" height="28" rx="3" fill="url(#wood)" {O}/>'
    f'<path d="M6 30 Q6 9 32 9 Q58 9 58 30 Z" fill="url(#wood)" {O}/>'
    f'<rect x="12" y="10" width="7" height="46" fill="url(#gold)" {O}/><rect x="45" y="10" width="7" height="46" fill="url(#gold)" {O}/>'
    f'<rect x="26" y="25" width="12" height="15" rx="2.5" fill="url(#gold)" {O}/><circle cx="32" cy="31" r="2.2" fill="{OUT}"/><rect x="31" y="31" width="2" height="6" fill="{OUT}"/>'
    '<path d="M20 16 Q32 11 44 16" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/>')

ICONS["hourglass"] = (
    f'<polygon points="{pts([(17,12),(47,12),(47,20),(35,32),(47,44),(47,52),(17,52),(17,44),(29,32),(17,20)])}" fill="#bfe0ff" fill-opacity=".45" {O}/>'
    f'<polygon points="{pts([(21,16),(43,16),(43,19),(32,29)])}" fill="url(#gold)"/><polygon points="{pts([(22,50),(42,50),(37,41),(27,41)])}" fill="url(#gold)"/>'
    f'<rect x="12" y="5" width="40" height="8" rx="3" fill="url(#bronze)" {O}/><rect x="12" y="51" width="40" height="8" rx="3" fill="url(#bronze)" {O}/>'
    '<path d="M20 20 L29 30" stroke="#fff" stroke-opacity=".7" stroke-width="2.2" stroke-linecap="round"/>')

# ---------------------------------------------------------------------------------------------------------------
# Placeholders (the client shows a question mark where a game has no icon or cover)
# ---------------------------------------------------------------------------------------------------------------

QUESTION = ('<text x="{x}" y="{y}" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-weight="bold" '
            'font-size="{size}" fill="url(#gold)" stroke="#1c1206" stroke-width="{sw}" paint-order="stroke" stroke-linejoin="round">?</text>')

PLACEHOLDERS = {
    # name -> (width, height, body)
    "questionmark": (64, 64,
                     '<rect x="3" y="3" width="58" height="58" rx="8" fill="url(#slot)" stroke="url(#bronze)" stroke-width="4"/>'
                     '<rect x="7" y="7" width="50" height="50" rx="5" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2"/>'
                     + QUESTION.format(x=32, y=47, size=44, sw=4)),
    "cover": (300, 420,
              '<rect width="300" height="420" fill="url(#slot)"/>'
              '<rect x="10" y="10" width="280" height="400" rx="10" fill="none" stroke="url(#bronze)" stroke-width="6"/>'
              '<rect x="22" y="22" width="256" height="376" rx="6" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3"/>'
              + QUESTION.format(x=150, y=268, size=210, sw=10)),
}


def svg_doc(name):
    if name in PLACEHOLDERS:
        w, h, body = PLACEHOLDERS[name]
    else:
        w, h, body = 64, 64, ICONS[name]
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{DEFS}{body}</svg>'


def write_svgs():
    d = HERE / "svg"
    d.mkdir(exist_ok=True)
    for name in list(ICONS) + list(PLACEHOLDERS):
        (d / f"{name}.svg").write_text(svg_doc(name), encoding="utf-8")
    return d


def write_sheet():
    cells = []
    for name in list(ICONS) + ["questionmark"]:
        doc = svg_doc(name)
        if name not in PLACEHOLDERS:
            doc = doc.replace('width="64" height="64"', 'width="96" height="96"')
        cells.append('<div class="c">' + doc + '<span>' + name + '</span></div>')
    html = ("<!doctype html><meta charset=utf-8><style>body{background:#211c16;color:#9d9d9d;font:12px sans-serif;margin:14px}"
            ".g{display:grid;grid-template-columns:repeat(8,116px);gap:10px}.c{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;background:#14110c;border-radius:4px}"
            "</style><div class=g>" + "".join(cells) + "</div>")
    p = HERE / "menu-sheet.html"
    p.write_text(html, encoding="utf-8")
    return p


def render_png(size_by_name=None):
    """Chromium renders each SVG at 2x, Pillow halves it, so edges are smooth at the final size."""
    from PIL import Image
    out_dir = HERE.parent / "src" / "Images" / "Menu"
    out_dir.mkdir(parents=True, exist_ok=True)
    svg_dir = write_svgs()
    node_root = subprocess.check_output(["npm", "root", "-g"], text=True).strip()
    script = f"""
const {{ chromium }} = require('{node_root}/playwright');
const fs = require('fs');
(async () => {{
  const browser = await chromium.launch();
  const jobs = JSON.parse(process.argv[2]);
  for (const j of jobs) {{
    const page = await browser.newPage({{ viewport: {{ width: j.w, height: j.h }}, deviceScaleFactor: 1 }});
    await page.setContent('<style>html,body{{margin:0;background:transparent}}svg{{display:block}}</style>' + fs.readFileSync(j.svg, 'utf8').replace(/width="\\d+" height="\\d+"/, 'width="' + j.w + '" height="' + j.h + '"'));
    await page.screenshot({{ path: j.out, omitBackground: true }});
    await page.close();
  }}
  await browser.close();
}})();
"""
    jobs, finals = [], []
    tmp = Path(tempfile.mkdtemp())
    for name in list(ICONS) + list(PLACEHOLDERS):
        w, h = (PLACEHOLDERS[name][0], PLACEHOLDERS[name][1]) if name in PLACEHOLDERS else (64, 64)
        target = (128, 128) if name == "questionmark" else ((300, 420) if name == "cover" else (48, 48))
        raster = (target[0] * 2, target[1] * 2)
        raw = tmp / f"{name}.png"
        jobs.append({"svg": str(svg_dir / f"{name}.svg"), "out": str(raw), "w": raster[0], "h": raster[1]})
        dest_dir = out_dir.parent if name in PLACEHOLDERS else out_dir
        finals.append((raw, target, dest_dir / (f"{name}.png")))
    import json
    js = tmp / "render.js"
    js.write_text(script, encoding="utf-8")
    subprocess.check_call(["node", str(js), json.dumps(jobs)])
    for raw, target, dest in finals:
        Image.open(raw).convert("RGBA").resize(target, Image.LANCZOS).save(dest, optimize=True)
    return out_dir


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "sheet"
    if cmd == "svg":
        print(write_svgs())
    elif cmd == "sheet":
        print(write_sheet())
    elif cmd == "png":
        print(render_png())
