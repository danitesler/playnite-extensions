#!/usr/bin/env python3
"""Render icons from a game-icons.net checkout into a Playnite theme (Geometry keys and menu PNGs).

  git clone --depth 1 https://github.com/game-icons/icons <dir>
  python3 scripts/render-game-icons.py --extension warcraft3theme --source <dir>

The job file is src/<Folder>/gameicons.json next to the theme's AGENTS.md. It is not icons.json, because
render-icons.ps1 feeds every icons.json job straight to its own parameters. Format:

  {
    "png":      { "outDir": "src/Images/GameIcons", "size": 48, "color": "#ffcc00",
                  "icons": { "SettingsIcon": "lorc/gears", "PlayIcon": {"path": "M0 0 ..."} } },
    "geometry": { "xamlFile": "src/Media.xaml", "grid": 512,
                  "icons": { "IconSearch": "lorc/magnifying-glass", "IconWindowClose": {"path": "..."} } }
  }

An icon is "<author>/<name>" (game-icons' folder and file name) or {"path": "<SVG path data in the grid>"} for
glyphs the pack has no good match for. The geometry block is written between the markers
`<!-- gameicons:begin -->` and `<!-- gameicons:end -->` in xamlFile. Path data is rewritten with explicit
separators (WPF's parser rejects packed arc flags). The background square every game-icons SVG carries is dropped.

game-icons.net icons are CC BY 3.0 (Lorc, Delapouite and others); ship the license text and credit the authors.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACKGROUND_PATH = re.compile(r'<path\s+d="M0 0h512v512H0z"\s*/>')
NUMBER = re.compile(r"[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?")
COMMANDS = "MmLlHhVvCcSsQqTtAaZz"
ARGS = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7, "Z": 0}


def fmt(value: float) -> str:
    text = f"{value:.3f}".rstrip("0").rstrip(".")
    return "0" if text in ("", "-0") else text


def normalize_path(data: str) -> str:
    """Re-emit SVG path data as 'C x y x y ...' groups, with arc flags split from the numbers behind them."""
    out: list[str] = []
    pos = 0
    length = len(data)
    command = ""
    while pos < length:
        ch = data[pos]
        if ch in " ,\t\r\n":
            pos += 1
            continue
        if ch in COMMANDS:
            command = ch
            pos += 1
            if command in "Zz":
                out.append("Z")
                continue
            out.append(command)
            continue
        if not command:
            raise ValueError(f"path data starts without a command: {data[:30]!r}")
        need = ARGS[command.upper()]
        values: list[str] = []
        for index in range(need):
            while pos < length and data[pos] in " ,\t\r\n":
                pos += 1
            if command in "Aa" and index in (3, 4):
                if pos >= length or data[pos] not in "01":
                    raise ValueError(f"bad arc flag near {data[pos:pos + 10]!r}")
                values.append(data[pos])
                pos += 1
                continue
            match = NUMBER.match(data, pos)
            if not match:
                raise ValueError(f"bad number near {data[pos:pos + 10]!r}")
            values.append(fmt(float(match.group(0))))
            pos = match.end()
        out.append(" ".join(values))
        # After the first pair, M / m continue as implicit L / l.
        if command in "Mm":
            command = "L" if command == "M" else "l"
    return " ".join(out)


def load_icon_path(source: Path, spec) -> str:
    if isinstance(spec, dict):
        return normalize_path(spec["path"])
    svg = (source / f"{spec}.svg").read_text(encoding="utf-8")
    if "transform=" in svg:
        raise ValueError(f"{spec}: has a transform, pick another icon or pass its path data")
    svg = BACKGROUND_PATH.sub("", svg)
    parts = re.findall(r'<path\b[^>]*?\sd="([^"]+)"', svg)
    if not parts:
        raise ValueError(f"{spec}: no path found")
    return " ".join(normalize_path(part) for part in parts)


def render_png(path_data: str, grid: int, size: int, color: str, out: Path) -> None:
    import cairosvg

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {grid} {grid}">'
        f'<path fill="{color}" fill-rule="nonzero" d="{path_data}"/></svg>'
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=str(out), output_width=size, output_height=size)


def extension_folder(key: str) -> Path:
    index = json.loads((ROOT / "src" / "extensions.json").read_text(encoding="utf-8-sig"))
    for row in index["extensions"]:
        if row["key"] == key:
            return (ROOT / row["extensionManifest"]).parent.parent
    raise SystemExit(f"Unknown extension {key!r}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--extension", required=True, help="theme key from src/extensions.json")
    parser.add_argument("--source", required=True, type=Path, help="game-icons checkout (folders: lorc, delapouite, ...)")
    args = parser.parse_args()

    folder = extension_folder(args.extension)
    jobs = json.loads((folder / "gameicons.json").read_text(encoding="utf-8-sig"))
    grid = int(jobs.get("geometry", {}).get("grid", 512))

    png = jobs.get("png")
    if png:
        out_dir = folder / png["outDir"]
        for name, spec in png["icons"].items():
            color = spec.get("color", png["color"]) if isinstance(spec, dict) else png["color"]
            render_png(load_icon_path(args.source, spec), grid, int(png["size"]), color, out_dir / f"{name}.png")
        print(f"Wrote {len(png['icons'])} PNG(s) to {out_dir}")

    geometry = jobs.get("geometry")
    if geometry:
        xaml_file = folder / geometry["xamlFile"]
        lines = []
        for key, spec in geometry["icons"].items():
            label = spec if isinstance(spec, str) else "drawn for this theme"
            lines.append(f"    <!-- {label} -->")
            lines.append(f'    <Geometry x:Key="{key}">F1 {load_icon_path(args.source, spec)}</Geometry>')
        block = "\n".join(lines)
        text = xaml_file.read_text(encoding="utf-8")
        pattern = re.compile(r"<!-- gameicons:begin -->.*?<!-- gameicons:end -->", re.S)
        if not pattern.search(text):
            raise SystemExit(f"{xaml_file} has no gameicons:begin / gameicons:end markers")
        text = pattern.sub(
            lambda m: "<!-- gameicons:begin -->\n" + block + "\n    <!-- gameicons:end -->", text, count=1
        )
        xaml_file.write_text(text, encoding="utf-8")
        print(f"Wrote {len(geometry['icons'])} geometries into {xaml_file}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
