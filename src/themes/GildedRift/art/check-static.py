#!/usr/bin/env python3
"""Static checks for the Gilded Rift XAML on machines without PowerShell, .NET or WPF.

This is NOT validate-extension.ps1 and proves nothing about WPF: it catches the mistakes that are visible in text.
Run from the repo root:  python3 -I src/themes/GildedRift/art/check-static.py [--strict]

  1. every .xaml under src/ is well-formed XML
  2. every file Gumshoe (the reference tree) ships under src/ exists here, minus its art and fonts
  3. every {DynamicResource K} / {StaticResource K} resolves to a key this theme defines, a shared catalog key
     (scripts/data/theme-keys.json), a Playnite global key (scripts/data/playnite-theme-api.json) or a LOC key
  4. every {ThemeFile '...'} path exists
  5. no literal colors (#RRGGBB) outside Constants.template.xaml (brushes only, never hex, in controls)
  6. every required shared key of the catalog is defined by the theme
Exit code 1 when a check in 1, 2, 4 or 6 fails, or with --strict when anything is reported.
"""
import json
import os
import re
import sys
import xml.dom.minidom

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
THEME = os.path.join(ROOT, "src", "themes", "GildedRift")
SRC = os.path.join(THEME, "src")
REF = os.path.join(ROOT, "src", "themes", "Gumshoe", "src")
strict = "--strict" in sys.argv
hard = 0
soft = 0


def files(base, ext=".xaml"):
    out = []
    for d, _, fs in os.walk(base):
        for f in fs:
            if f.endswith(ext):
                out.append(os.path.relpath(os.path.join(d, f), base).replace("\\", "/"))
    return sorted(out)


mine = files(SRC)
texts = {}
for rel in mine:
    p = os.path.join(SRC, rel)
    s = open(p, encoding="utf-8-sig").read()
    texts[rel] = s
    try:
        xml.dom.minidom.parseString(s.encode("utf-8"))
    except Exception as e:  # noqa: BLE001
        print(f"error: {rel}: not well-formed: {e}")
        hard += 1

ref = [r for r in files(REF) if not r.startswith(("Typography/", "Images/"))]
for rel in ref:
    want = rel.replace("Constants.xaml", "Constants.template.xaml")
    if want not in mine:
        print(f"error: missing {want} (the reference tree has it)")
        hard += 1

cat = json.load(open(os.path.join(ROOT, "scripts", "data", "theme-keys.json"), encoding="utf-8"))
api = json.load(open(os.path.join(ROOT, "scripts", "data", "playnite-theme-api.json"), encoding="utf-8"))
shared = {e["key"] for e in cat["keys"]}
palette = set(cat.get("playnitePalette", {}).keys())
glob = set(api["globalKeys"])
defined = set()
for s in texts.values():
    defined |= set(re.findall(r'x:Key="([^"]+)"', s))
known = defined | shared | palette | glob

use = re.compile(r"\{(?:DynamicResource|StaticResource)\s+(?:ResourceKey=)?([A-Za-z_][\w.]*)")
seen = {}
for rel, s in texts.items():
    for k in use.findall(s):
        if k in known or k.startswith("LOC") or k.startswith("ThemeFile"):
            continue
        seen.setdefault(k, set()).add(rel)
for k, rels in sorted(seen.items()):
    print(f"warn: unresolved resource {k} used in {', '.join(sorted(rels)[:3])}{' ...' if len(rels) > 3 else ''}")
    soft += 1

for rel, s in texts.items():
    for m in re.finditer(r"\{ThemeFile\s+'([^']+)'\}", s):
        if not os.path.exists(os.path.join(SRC, m.group(1))):
            print(f"error: {rel}: ThemeFile '{m.group(1)}' does not exist")
            hard += 1

hexre = re.compile(r'="#[0-9A-Fa-f]{6,8}"')
for rel, s in texts.items():
    if rel == "Constants.template.xaml":
        continue
    n = len(hexre.findall(s))
    if n:
        print(f"warn: {rel}: {n} literal color(s); use a brush key instead")
        soft += 1

for e in cat["keys"]:
    if e.get("required") and e["key"] not in defined and e["type"] not in ("Style",) or (e.get("required") and e["type"] == "Style" and e["key"] not in defined):
        print(f"error: required shared key {e['key']} ({e['type']}) is not defined")
        hard += 1

print(f"{len(mine)} xaml files; {hard} error(s), {soft} warning(s)")
sys.exit(1 if hard or (strict and soft) else 0)
