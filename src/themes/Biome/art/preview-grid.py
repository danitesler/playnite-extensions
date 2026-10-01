#!/usr/bin/env python3
"""Writes art/preview-grid.html: an approximate HTML replica of Biome's grid view (not a Playnite capture).

Same token values (src/tokens.css), sizes and shell as the XAML; Noto Sans stands in for Segoe UI / Segoe UI Black.
Icons are the theme's own geometries from art/icons.generated.xaml. Render with
  NODE_PATH=$(npm root -g) node scripts/render-theme-preview.mjs src/themes/Biome/art/preview-grid.html
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ICONS = {m.group(1): m.group(2) for m in re.finditer(r'x:Key="Icon(\w+)">F1 ([^<]+)<',
                                                       open(os.path.join(HERE, "icons.generated.xaml")).read())}


def icon(name, size=24, cls=""):
    return (f'<svg class="ic {cls}" width="{size}" height="{size}" viewBox="0 0 24 24" shape-rendering="crispEdges">'
            f'<path d="{ICONS[name]}"/></svg>')


GAMES = [
    ("Hollow Depths", "#3b2a5e", "#8a5cc7"), ("Starfall Tactics", "#10244a", "#3f8fd6"),
    ("Ember Keep", "#4a1a12", "#e0703a"), ("Verdant Run", "#123a20", "#5cc76a"),
    ("Iron Tides", "#1e2a33", "#7a9bb0"), ("Moonlit Harvest", "#2b2246", "#d9b45c"),
    ("Pixel Frontier", "#3a1630", "#d65c9a"), ("Glacier Line", "#16323f", "#8fd6e8"),
    ("Dust & Gears", "#3a2c16", "#c79a5c"), ("Neon Abyss Run", "#140f33", "#5c6bd6"),
    ("Sunken Crown", "#0f3330", "#4fc7b0"), ("Last Lantern", "#33200f", "#f0b84a"),
]

covers = []
for i, (name, a, b) in enumerate(GAMES):
    cls = "cv sel" if i == 1 else ("cv hov" if i == 4 else "cv")
    covers.append(f'<div class="{cls}" style="background:linear-gradient(160deg,{b} 0%,{a} 70%)">'
                  f'<i style="background:{b}"></i><b>{name}</b></div>')

html = f'''<!doctype html><html><head><meta charset="utf-8"><title>Biome preview</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
/* Approximate HTML replica of Biome's grid view, values from src/tokens.css. Not a Playnite capture. */
:root{{--panel:rgba(63,82,151,.7);--hover:rgb(73,94,171);--outer:rgba(33,43,79,.8);--edge:#000;--item:rgb(89,116,213);
--gold:rgb(255,231,69);--menu:rgb(255,215,0);--muted:rgb(178,186,222);--sep:rgba(92,94,167,.9);--sky:#0b1030;--horizon:#26335e}}
*{{box-sizing:border-box;margin:0}}
body{{width:1600px;height:900px;overflow:hidden;display:flex;color:#fff;font:14px "Noto Sans","Liberation Sans",sans-serif;
background:linear-gradient(var(--sky) 0%,color-mix(in srgb,var(--horizon) 35%,var(--sky)) 55%,var(--horizon) 100%)}}
.ic{{fill:currentColor;display:block}}
.out{{font-weight:900;text-shadow:-1.5px 0 #000,1.5px 0 #000,0 -1.5px #000,0 1.5px #000,-1px -1px #000,1px 1px #000,-1px 1px #000,1px -1px #000}}
.rail{{width:64px;background:var(--outer);border-right:2px solid var(--edge);display:flex;flex-direction:column;align-items:center}}
.rail .mm{{height:64px;display:grid;place-items:center;color:#fff}}
.slot{{width:44px;height:44px;margin:4px 0;display:grid;place-items:center;border-radius:6px;border:2px solid transparent;color:var(--muted)}}
.slot.cur{{background:var(--hover);border-color:var(--gold);color:#fff}}
.slot.hov{{background:var(--panel);border-color:#000;color:var(--menu)}}
.main{{flex:1;display:flex;flex-direction:column;min-width:0}}
.top{{height:64px;display:flex;align-items:center;padding:0 150px 0 12px;position:relative}}
.search{{width:280px;height:38px;background:var(--panel);border:2px solid #000;border-radius:6px;display:flex;align-items:center;gap:8px;padding:0 8px;color:var(--muted)}}
.menu{{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:4px;color:var(--muted)}}
.menu .w{{font-size:22px;padding:0 10px 2px;color:rgba(255,255,255,.6)}}
.menu .w.on{{color:var(--menu)}}
.menu .g{{padding:0 6px}}.menu .gap{{width:18px}}
.right{{margin-left:auto;display:flex;gap:10px;color:var(--muted);align-items:center}}
.win{{position:absolute;right:12px;top:16px;display:flex;color:var(--muted)}}.win div{{width:44px;height:32px;display:grid;place-items:center}}
.body{{flex:1;display:flex;min-height:0}}
.lib{{flex:1;padding:14px 24px;overflow:hidden}}
.grp{{display:flex;align-items:center;gap:10px;font-size:16px;margin:4px 0 14px;padding-bottom:6px;border-bottom:2px solid var(--sep)}}
.grp small{{color:var(--muted);font-weight:600;font-size:13px}}
.grid{{display:grid;grid-template-columns:repeat(6,150px);gap:18px}}
.cv{{height:210px;position:relative;border-radius:4px;outline:2px solid #000;outline-offset:0;overflow:hidden}}
.cv i{{position:absolute;width:64px;height:64px;left:43px;top:52px;opacity:.55;border-radius:2px;
box-shadow:16px 16px 0 -4px rgba(255,255,255,.12),-12px 20px 0 -8px rgba(0,0,0,.25)}}
.cv b{{position:absolute;left:0;right:0;bottom:0;padding:26px 10px 9px;background:linear-gradient(transparent,rgba(11,16,48,.92));font-weight:700;font-size:14px}}
.cv.hov{{outline-color:var(--item)}}.cv.sel{{outline:3px solid var(--gold)}}
.panel{{width:470px;background:var(--outer);border-left:2px solid #000;position:relative;overflow:hidden}}
.hero{{height:250px;background:linear-gradient(160deg,#3f8fd6,#10244a 75%);position:relative;-webkit-mask:linear-gradient(#000 45%,transparent)}}
.hero:after{{content:"";position:absolute;inset:0;background:linear-gradient(transparent 20%,rgba(11,16,48,.7))}}
.hero .sun{{position:absolute;left:330px;top:46px;width:48px;height:48px;background:#f0e6a0;opacity:.8;box-shadow:0 0 0 6px rgba(240,230,160,.15)}}
.pc{{position:absolute;inset:0;padding:150px 24px 24px}}
.close{{position:absolute;right:12px;top:12px;width:32px;height:32px;background:var(--panel);border:2px solid #000;border-radius:6px;display:grid;place-items:center}}
h1{{font-size:32px;line-height:1.1;margin-bottom:16px}}
.acts{{display:flex;gap:8px;margin-bottom:22px}}
.play{{height:48px;min-width:180px;display:grid;place-items:center;background:rgb(73,94,171);border:2px solid var(--gold);border-radius:6px;font-size:22px;color:var(--menu)}}
.sq{{width:48px;height:48px;display:grid;place-items:center;background:var(--panel);border:2px solid #000;border-radius:6px}}
.cols{{display:flex;gap:24px}}
.desc{{flex:1}}
.h{{font-size:16px;padding-bottom:6px;margin-bottom:10px;border-bottom:2px solid var(--sep)}}
p{{line-height:1.55;color:#fff;font-size:14px}}
.meta{{width:190px;background:var(--panel);border:2px solid #000;border-radius:6px;padding:4px 14px}}
.meta .f{{padding:6px 0}}.meta .f span{{display:block;color:var(--muted);font-size:13px;margin-bottom:2px}}
.meta .r{{height:1px;background:var(--sep);margin:6px 0}}
.chip{{display:inline-block;font-size:12px;padding:3px 9px;margin:0 6px 6px 0;background:var(--panel);border:2px solid #000;border-radius:6px}}
.link{{color:var(--gold)}}
</style></head><body>
<div class="rail">
  <div class="mm">{icon("MainMenu")}</div>
  <div class="slot cur">{icon("Library")}</div>
  <div class="slot hov">{icon("Statistics")}</div>
  <div class="slot">{icon("Random")}</div>
</div>
<div class="main">
  <div class="top">
    <div class="search">{icon("Search")}<span>Search</span></div>
    <div class="menu">
      <span class="g">{icon("Explorer")}</span><span class="g">{icon("ViewRandom")}</span>
      <span class="gap"></span>
      <span class="w out">Details</span><span class="w out on">Grid</span><span class="w out">List</span>
      <span class="gap"></span>
      <span class="g">{icon("Group")}</span><span class="g">{icon("Sort")}</span><span class="g">{icon("ViewSettings")}</span>
    </div>
    <div class="right"><span>{icon("FilterPresets")}</span><span>{icon("Filter")}</span><span>{icon("Notifications")}</span></div>
    <div class="win"><div>{icon("WindowMinimize")}</div><div>{icon("WindowMaximize")}</div><div>{icon("WindowClose")}</div></div>
  </div>
  <div class="body">
    <div class="lib">
      <div class="grp out">Steam <small>12</small></div>
      <div class="grid">{"".join(covers)}</div>
    </div>
    <div class="panel">
      <div class="hero"><div class="sun"></div></div>
      <div class="close">{icon("WindowClose", 12)}</div>
      <div class="pc">
        <h1 class="out">Starfall Tactics</h1>
        <div class="acts"><div class="play out">Play</div><div class="sq">{icon("Options")}</div><div class="sq">{icon("Edit")}</div></div>
        <div class="cols">
          <div class="desc">
            <div class="h out">Description</div>
            <p>Lead a small crew across a broken star map. Dig for parts, build outposts between the
            asteroids and hold the line when the night waves arrive. Every run draws a new sky.</p>
          </div>
          <div class="meta">
            <div class="f"><span>Completion Status</span><b class="link">Playing</b></div>
            <div class="f"><span>Time Played</span>14h 20m</div>
            <div class="r"></div>
            <div class="f"><span>Developers</span><span class="link" style="color:var(--gold);font-size:14px">Lantern Works</span></div>
            <div class="f"><span>Release Date</span>2024</div>
            <div class="r"></div>
            <div class="f"><span>Genres</span><i class="chip" style="font-style:normal">Strategy</i><i class="chip" style="font-style:normal">Sandbox</i></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</body></html>
'''
open(os.path.join(HERE, "preview-grid.html"), "w", encoding="utf-8").write(html)
print("wrote art/preview-grid.html")
