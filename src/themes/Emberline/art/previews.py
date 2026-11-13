#!/usr/bin/env python3
"""Writes art/preview-details.html and art/preview-settings.html for Emberline.

    python3 src/themes/Emberline/art/previews.py

The previews are 1280x720 replicas of the theme's XAML, not captures. Colors are var(--em-*) from src/tokens.css
(injected at render time), icons are the geometries in src/Media.xaml, effects are the theme's own sprites through CSS
masks. Sizes follow the XAML: 44px rail, 52px top bar with 34px cells, 28px tree rows, 44px title band, 32px fields.
No game art, logo or capture is used: the banner and the covers are CSS paintings. Render with
scripts/take-screenshots.ps1 -Extension emberline.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
media = open(os.path.join(HERE, '..', 'src', 'Media.xaml'), encoding='utf-8').read()
ICON = dict(re.findall(r'<Geometry x:Key="Icon(\w+)">([^<]*)<', media))


def icon(name, size=16, cls=''):
    return (f'<svg class="i {cls}" width="{size}" height="{size}" viewBox="0 0 24 24">'
            f'<path fill="currentColor" fill-rule="evenodd" d="{ICON[name]}"/></svg>')


EMBER = '<span class="ember"><i class="t"></i><i class="b"></i><i class="l"></i><i class="r"></i></span>'
FLARE = '<span class="flare"><i></i><b></b></span>'

CSS = r'''
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1280px; height: 720px; overflow: hidden; background: var(--em-void); color: var(--em-white);
       font: 14px/1.35 Bahnschrift, "Segoe UI"; position: relative; }
.h { font-family: "Russo One", Bahnschrift, "Segoe UI"; font-weight: 400; text-transform: uppercase; }
.i { display: block; flex: none; }
/* the burning frame: four strips, the band 1px inside the host's edge (EmberFrameTemplate) */
.ember { position: absolute; inset: -8px; pointer-events: none; }
.ember i { position: absolute; background: var(--em-ember); }
.ember .t { left: 7px; right: 7px; top: 0; height: 14px; -webkit-mask: url(../src/Images/fx/ember-top.png) repeat-x; mask: url(../src/Images/fx/ember-top.png) repeat-x; }
.ember .b { left: 7px; right: 7px; bottom: 0; height: 14px; -webkit-mask: url(../src/Images/fx/ember-bottom.png) repeat-x; mask: url(../src/Images/fx/ember-bottom.png) repeat-x; }
.ember .l { top: 7px; bottom: 7px; left: 0; width: 14px; -webkit-mask: url(../src/Images/fx/ember-left.png) repeat-y; mask: url(../src/Images/fx/ember-left.png) repeat-y; }
.ember .r { top: 7px; bottom: 7px; right: 0; width: 14px; -webkit-mask: url(../src/Images/fx/ember-right.png) repeat-y; mask: url(../src/Images/fx/ember-right.png) repeat-y; }
/* the selection plate inside the frame (SelectionBarTemplate) */
.sel { position: relative; background: linear-gradient(to bottom, var(--em-cinder) 35%, color-mix(in srgb, var(--em-ember-dim) 50%, var(--em-cinder))); }
.sel::after { content: ""; position: absolute; inset: 0; border: 1px solid color-mix(in srgb, var(--em-ember) 55%, transparent); pointer-events: none; }
/* flare rule (GlowLineTemplate): hairline fading at both ends under a centre-bright flare */
.flare { position: absolute; left: 0; right: 0; height: 16px; pointer-events: none; }
.flare i { position: absolute; left: 0; right: 0; top: 7.5px; height: 1px;
           background: linear-gradient(to right, transparent, var(--em-rule) 18%, var(--em-rule) 82%, transparent); }
.flare b { position: absolute; left: 50%; top: 0; width: min(420px, 100%); height: 16px; transform: translateX(-50%); background: var(--em-flare);
           -webkit-mask: url(../src/Images/fx/flare.png) center / 100% 100% no-repeat; mask: url(../src/Images/fx/flare.png) center / 100% 100% no-repeat; }
.grime { position: absolute; inset: 0; background: var(--em-edge-card); opacity: .5; pointer-events: none;
         -webkit-mask: url(../src/Images/fx/grime.png); mask: url(../src/Images/fx/grime.png); }
.tab { display: block; flex: none; background: var(--em-white); clip-path: polygon(30% 0, 100% 0, 70% 100%, 0 100%); }
.plate { background: var(--em-pit); border: 1px solid var(--em-edge-lit); }
.cap { display: inline-flex; align-items: center; justify-content: center; background: var(--em-white); color: var(--em-ink); }
'''

DETAILS_CSS = r'''
.rail { position: absolute; left: 0; top: 0; bottom: 0; width: 44px; background: var(--em-pit); border-right: 1px solid var(--em-edge); }
.menu { position: relative; width: 44px; height: 62px; }
.menu .seal { position: absolute; left: 6px; top: 8px; width: 32px; height: 32px; background: var(--em-white); clip-path: polygon(22% 0, 100% 0, 78% 100%, 0 100%); }
.menu .i { position: absolute; left: 14px; top: 16px; color: var(--em-ink); }
.menu u { position: absolute; left: 10px; bottom: 8px; width: 24px; height: 1px; background: var(--em-edge-lit); }
.ri { position: relative; width: 44px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--em-steel); }
.ri.on { color: var(--em-lancer); }
.ri.on::before { content: ""; position: absolute; inset: 9px 0; background: linear-gradient(to right, color-mix(in srgb, var(--em-ember) 32%, transparent), transparent); }
.ri.on::after { content: ""; position: absolute; left: 0; right: 0; top: 19px; height: 2px; background: linear-gradient(to right, var(--em-ember), transparent); }
.ri .i { position: relative; z-index: 1; }
.top { position: absolute; left: 45px; right: 0; top: 0; height: 52px; background: var(--em-pit); display: flex; align-items: center; padding: 9px 132px 9px 12px; }
.top .tray { position: absolute; left: 50%; bottom: 0; width: 220px; height: 9px; transform: translateX(-50%); background: var(--em-edge-lit); clip-path: polygon(0 100%, 5.5% 0, 94.5% 0, 100% 100%); }
.top .tray::after { content: ""; position: absolute; inset: 1px 1px 0; background: var(--em-void); clip-path: polygon(0 100%, 5.5% 0, 94.5% 0, 100% 100%); }
.top .flare { bottom: -8px; }
.search { width: 280px; height: 32px; margin-right: 5px; display: flex; align-items: center; gap: 8px; padding: 0 9px; background: var(--em-pit); border: 1px solid var(--em-edge-lit); color: var(--em-label); }
.search span { color: var(--em-dim); }
.cell { position: relative; width: 34px; height: 34px; margin-left: 5px; display: flex; align-items: center; justify-content: center; color: var(--em-steel); }
.cell.on::before { content: ""; position: absolute; inset: 3px; background: var(--em-white); }
.cell.on { color: var(--em-ink); }
.cell .i { position: relative; }
.cell .mark { position: absolute; right: 4px; top: 4px; width: 8px; height: 8px; background: var(--em-alert); outline: .5px solid var(--em-void); }
.items { display: flex; margin-left: 4px; height: 34px; }
.sep { width: 1px; height: 18px; margin: 8px 3px 0 8px; background: var(--em-edge-lit); }
.bell { color: var(--em-label); }
.bell em { position: absolute; right: 0; bottom: 1px; width: 16px; height: 16px; background: var(--em-alert); color: var(--em-ink); font: 700 10px/16px Bahnschrift, "Segoe UI"; text-align: center; font-style: normal; border: 1px solid var(--em-void); }
.caps { position: absolute; right: 0; top: 0; display: flex; }
.caps div { width: 40px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--em-label); }
.list { position: absolute; left: 45px; top: 52px; bottom: 0; width: 236px; background: var(--em-panel); border-right: 1px solid var(--em-edge); padding: 14px 0 0; }
.row { position: relative; height: 30px; display: flex; align-items: center; gap: 10px; padding: 0 12px; color: var(--em-white); }
.row b { width: 18px; height: 18px; flex: none; border: 1px solid var(--em-edge-card); }
.row.off { color: var(--em-label); }
.row.hover { color: var(--em-white); }
.row.hover::before { content: ""; position: absolute; inset: 0; background: var(--em-plate); border: 1px solid var(--em-edge-lit); }
.row.on { color: var(--em-white); background: linear-gradient(to right, color-mix(in srgb, var(--em-ember) 42%, var(--em-cinder)), var(--em-cinder) 80%); }
.row.on::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--em-ember); }
.row > * { position: relative; }
.page { position: absolute; left: 281px; right: 0; top: 52px; bottom: 0; background: var(--em-panel); overflow: hidden; }
.hero { position: absolute; left: 0; right: 0; top: 0; height: 300px; overflow: hidden;
        background: linear-gradient(to bottom, #35506a 0%, #6f8ea6 34%, #a9bccb 52%, #5c6f7c 60%, #2b343b 100%); }
.hero .ridge { position: absolute; left: 0; right: 0; bottom: 96px; height: 120px; background: #dfe8ee; opacity: .8; clip-path: polygon(0 100%, 0 62%, 9% 44%, 16% 58%, 27% 20%, 35% 46%, 44% 30%, 52% 55%, 63% 12%, 72% 48%, 81% 34%, 90% 56%, 100% 40%, 100% 100%); }
.hero .ridge2 { position: absolute; left: 0; right: 0; bottom: 96px; height: 96px; background: #7f97a8; clip-path: polygon(0 100%, 0 70%, 12% 52%, 22% 68%, 33% 40%, 46% 66%, 58% 44%, 70% 70%, 84% 50%, 100% 66%, 100% 100%); }
.hero .arch { position: absolute; right: 110px; top: -120px; width: 520px; height: 520px; border: 34px solid #26323b; border-radius: 50%; opacity: .92; }
.hero .hull { position: absolute; left: 0; right: 0; bottom: 0; height: 128px; background: #1b2227;
              clip-path: polygon(0 100%, 0 34%, 6% 34%, 6% 12%, 13% 12%, 13% 40%, 24% 40%, 24% 24%, 31% 24%, 31% 0, 34% 0, 34% 44%, 47% 44%, 47% 30%, 55% 30%, 55% 50%, 68% 50%, 68% 18%, 72% 18%, 72% 46%, 86% 46%, 86% 28%, 93% 28%, 93% 52%, 100% 52%, 100% 100%); }
.hero .red { position: absolute; left: 47%; bottom: 62px; width: 84px; height: 26px; background: #7d1f17; }
.hero .head { position: absolute; left: 0; right: 0; top: 0; height: 120px; background: linear-gradient(to bottom, color-mix(in srgb, var(--em-panel) 70%, transparent), transparent); }
.hero .fade { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 25%, var(--em-panel) 100%); }
.body { position: absolute; left: 30px; right: 30px; top: 176px; }
.head-row { display: flex; align-items: center; gap: 0; margin-bottom: 20px; }
.gicon { width: 44px; height: 44px; margin-right: 14px; background: var(--em-pit); border: 1px solid var(--em-edge-card); display: flex; align-items: center; justify-content: center; color: var(--em-lancer); }
.title { flex: 1; font-size: 34px; line-height: 1.12; text-transform: uppercase; text-shadow: 2px 2px 0 var(--em-void); white-space: nowrap; }
.play { position: relative; width: 190px; height: 48px; display: flex; align-items: center; justify-content: center; padding-bottom: 3px; font-size: 20px;
        background: var(--em-cinder); border: 1px solid var(--em-edge-card); }
.play .bloom { position: absolute; inset: -22px -26px; background: var(--em-ember); opacity: .5; -webkit-mask: url(../src/Images/fx/glow.png) center / 100% 100%; mask: url(../src/Images/fx/glow.png) center / 100% 100%; z-index: -1; }
.play .bar { position: absolute; left: 12px; right: 12px; bottom: 6px; height: 3px; background: var(--em-edge-card); }
.play .bar::after { content: ""; position: absolute; left: 62%; width: 9%; top: 0; bottom: 0; background: var(--em-white); opacity: .6; }
.play span.t { position: relative; }
.play .pc { position: absolute; left: 14px; top: 13px; width: 18px; height: 18px; }
.sq { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--em-label); margin-left: 8px; }
.cols { display: flex; gap: 26px; }
.main { flex: 1; min-width: 0; }
.sec { display: flex; align-items: center; height: 26px; margin-bottom: 14px; font-size: 16px; }
.sec .tab { width: 10px; height: 12px; margin-right: 10px; }
.sec::after { content: ""; flex: 1; height: 1px; margin: 2px 0 0 14px; background: var(--em-edge-lit); }
.shots { display: flex; gap: 8px; margin-bottom: 20px; }
.shots div { flex: 1; height: 104px; border: 1px solid var(--em-edge-card); }
.desc { color: var(--em-white); font-size: 14px; line-height: 1.5; }
.desc a { color: var(--em-ember); }
.meta { position: relative; flex: none; width: 342px; background: var(--em-pit); border: 1px solid var(--em-edge-card); padding: 18px 20px 20px; align-self: flex-start; }
.meta::before { content: ""; position: absolute; left: 0; right: 0; top: -1px; height: 1px; background: linear-gradient(to right, transparent, var(--em-steel), transparent); opacity: .55; }
.meta .sec { margin-bottom: 6px; }
.grp { border-top: 1px solid var(--em-edge); margin-top: 12px; padding-top: 12px; }
.grp:first-of-type { border-top: 0; margin-top: 0; padding-top: 0; }
.f { display: flex; padding: 7px 0; }
.f label { width: 108px; flex: none; font-size: 12px; color: var(--em-label); padding-top: 2px; }
.f div { margin-left: 8px; color: var(--em-label); }
.f div.t { color: var(--em-white); }
.chip { display: inline-block; font-size: 12px; padding: 3px 8px; margin: 2px 4px 2px 0; background: var(--em-pit); border: 1px solid var(--em-edge-lit); color: var(--em-label); }
.score { color: var(--em-support); font-weight: 700; }
.note { position: absolute; left: 30px; bottom: 8px; font-size: 10px; color: var(--em-dim); }
'''


def cover(a, b):
    return f'background: linear-gradient(135deg, {a}, {b});'


def details():
    games = [('Ashfall Protocol', 'on'), ('Breakwater', ''), ('Cinder Company', 'hover'), ('Deadlight Run', ''), ('Echo Trench', 'off'),
             ('Frostline', ''), ('Gravel & Glory', ''), ('Hollow Sun', 'off'), ('Iron Meridian', ''), ('Kestrel Down', ''),
             ('Last Outpost', 'off'), ('Mortar Hymn', ''), ('Night Convoy', ''), ('Old Guard', ''), ('Powder Keg', 'off'),
             ('Quarry Nine', ''), ('Rust Belt Kings', ''), ('Sawtooth Ridge', ''), ('Tidebreaker', 'off'), ('Under Siege', '')]
    tint = ['#3a2a22', '#2c3a44', '#4a3a1e', '#2a2f3a', '#3b3b3b', '#31404a', '#4a2a22', '#333', '#2f3b2f', '#3a3328']
    rows = ''.join(f'<div class="row {c}"><b style="{cover(tint[i % 10], "#101010")}"></b><span>{n}</span></div>' for i, (n, c) in enumerate(games))
    cells = ''.join([
        f'<div class="cell">{icon("Sort")}</div>',
        f'<div class="cell">{icon("ViewSettings")}</div>',
        f'<div class="cell">{icon("FilterPresets")}</div>',
        f'<div class="cell">{icon("Group")}</div>',
        '<div class="sep"></div>',
        f'<div class="cell on">{icon("DetailsView")}</div>',
        f'<div class="cell">{icon("GridView")}</div>',
        f'<div class="cell">{icon("ListView")}</div>',
        f'<div class="cell">{icon("Random")}</div>',
        f'<div class="cell">{icon("Explorer")}</div>',
    ])
    chips = lambda xs: ''.join(f'<span class="chip">{x}</span>' for x in xs)
    return f'''<!DOCTYPE html>
<!-- Emberline: Game Details view. Written by art/previews.py; edit the generator, not this file. A replica of the XAML, not a capture.
     Staged: Play hovered (burning frame, bloom, reload bar), the selected list row on the red streak, a toggled view switch as a key cap. -->
<html lang="en"><head><meta charset="utf-8"><title>Emberline: details</title>
<style>{CSS}{DETAILS_CSS}</style></head>
<body>
<div class="rail" data-part="sidebar">
  <div class="grime"></div>
  <div class="menu" data-part="PART_ElemMainMenu"><span class="seal"></span>{icon("MainMenu")}<u></u></div>
  <div class="ri on">{icon("Library")}</div>
  <div class="ri">{icon("Statistics")}</div>
  <div class="ri">{icon("Download")}</div>
  <div class="ri">{icon("ViewSettings")}</div>
</div>
<div class="top" data-part="top-panel">
  <div class="tray"></div>
  <div class="search" data-part="PART_TextMainSearch">{icon("Search")}<span>Search</span></div>
  <div class="cell on" data-part="PART_ToggleFilter">{icon("Filter")}<span class="mark"></span></div>
  <div class="items" data-part="PART_PanelMainItems">{cells}</div>
  <div class="cell bell" data-part="PART_ToggleNotifications">{icon("Notifications")}<em>2</em></div>
  {FLARE}
  <div class="caps"><div>{icon("WindowMinimize", 12)}</div><div>{icon("WindowMaximize", 12)}</div><div>{icon("WindowClose", 12)}</div></div>
</div>
<div class="list" data-part="game-list">{rows}</div>
<div class="page" data-part="game-page">
  <div class="hero"><div class="arch"></div><div class="ridge"></div><div class="ridge2"></div><div class="hull"></div><div class="red"></div><div class="head"></div><div class="fade"></div></div>
  <div class="body">
    <div class="head-row">
      <div class="gicon">{icon("MainMenu", 24)}</div>
      <span class="tab" style="width:14px;height:30px;margin-right:12px"></span>
      <div class="title h">Ashfall Protocol</div>
      <div class="play h"><span class="bloom"></span><span class="bar"></span>{EMBER}<span class="pc cap">{icon("Play", 10)}</span><span class="t">Play</span></div>
      <div class="sq plate" style="margin-left:12px">{icon("Options")}</div>
      <div class="sq plate">{icon("Edit")}</div>
    </div>
    <div class="cols">
      <div class="main">
        <div class="shots"><div style="{cover('#4b6074', '#161b20')}"></div><div style="{cover('#5a3a2a', '#14110f')}"></div><div style="{cover('#39444c', '#101214')}"></div></div>
        <div class="sec h"><span class="tab"></span>Description</div>
        <div class="desc">A squad shooter set on a frozen industrial frontier. Hold the breakwater through a week of storms, rebuild the line between raids and decide who rides the last convoy out.<br><br>Four-player co-op campaign, a wave defence mode with a build phase, and an escape run against the clock. <a>Official site</a></div>
      </div>
      <div class="meta" data-part="metadata">
        <div class="sec h"><span class="tab"></span>Game details</div>
        <div class="grp">
          <div class="f"><label>Completion status</label><div>Playing</div></div>
          <div class="f"><label>Time played</label><div class="t">41h 20m</div></div>
          <div class="f"><label>Last played</label><div class="t">Yesterday</div></div>
        </div>
        <div class="grp">
          <div class="f"><label>Community score</label><div class="score">86</div></div>
        </div>
        <div class="grp">
          <div class="f"><label>Developer</label><div>Northgate Works</div></div>
          <div class="f"><label>Release date</label><div>9/10/2019</div></div>
        </div>
        <div class="grp">
          <div class="f"><label>Genre</label><div>{chips(["Shooter", "Co-op", "Action"])}</div></div>
        </div>
      </div>
    </div>
  </div>
  <div class="note">Unofficial replica. No game art or logo.</div>
</div>
</body></html>
'''


SETTINGS_CSS = r'''
body { background: radial-gradient(900px 500px at 30% 20%, #1c2a36, transparent), radial-gradient(700px 500px at 80% 80%, #2a1512, transparent), var(--em-void); }
.win { position: absolute; left: 180px; top: 24px; width: 920px; height: 672px; background: var(--em-panel); border: 1px solid var(--em-edge-card); display: flex; flex-direction: column; }
.band { position: relative; height: 44px; flex: none; background: var(--em-void); overflow: hidden; display: flex; align-items: center; }
.band .tab { position: absolute; left: 0; top: 8px; width: 26px; height: 26px; clip-path: polygon(0 0, 100% 0, 73% 100%, 0 100%); }
.band .name { margin-left: 40px; font-size: 20px; padding-bottom: 2px; position: relative; }
.band .ghost { position: absolute; right: 164px; top: -14px; color: var(--em-white); opacity: .07; }
.band .caps { position: absolute; right: 0; top: 0; display: flex; }
.band .caps div { width: 46px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--em-label); }
.band .caps div.x { background: var(--em-lancer); color: var(--em-white); }
.win > .flare { top: 36px; z-index: 2; }
.mid { flex: 1; display: flex; min-height: 0; }
.nav { position: relative; width: 250px; flex: none; padding: 6px 14px 0 4px; border-right: 1px solid var(--em-edge); overflow: hidden; }
.nav .thumb { position: absolute; right: 4px; top: 8px; width: 4px; height: 330px; background: var(--em-edge-card); }
.n { position: relative; height: 28px; margin-bottom: 3px; display: flex; align-items: center; padding: 0 10px; color: var(--em-label); background: var(--em-pit); border: 1px solid var(--em-edge-lit); }
.n .m { width: 6px; height: 12px; margin-right: 8px; background: var(--em-white); clip-path: polygon(33% 0, 100% 0, 67% 100%, 0 100%); opacity: 0; }
.n .x { width: 14px; height: 14px; margin-right: 6px; display: flex; align-items: center; justify-content: center; color: var(--em-ember); }
.n.c { margin-left: 18px; }
.n.hover { background: var(--em-plate); border-color: var(--em-edge-card); color: var(--em-white); }
.n.hover .m { opacity: .45; }
.n.on { color: var(--em-white); border-color: transparent; background: linear-gradient(to bottom, var(--em-cinder) 35%, color-mix(in srgb, var(--em-ember-dim) 50%, var(--em-cinder))); z-index: 1; }
.n.on .m { opacity: 1; background: var(--em-lancer); }
.pg { flex: 1; padding: 22px 28px; min-width: 0; }
.pg h2 { display: flex; align-items: center; font-size: 16px; font-weight: 400; margin-bottom: 16px; }
.pg h2 .tab { width: 10px; height: 12px; margin-right: 10px; }
.pg h2::after { content: ""; flex: 1; height: 1px; margin-left: 14px; background: var(--em-edge-lit); }
.line { display: flex; align-items: center; height: 32px; margin-bottom: 10px; color: var(--em-white); }
.line > label { width: 210px; flex: none; color: var(--em-label); }
.cb { position: relative; width: 18px; height: 18px; margin-right: 9px; flex: none; background: var(--em-pit); border: 1px solid var(--em-edge-card); }
.cb.on::before { content: ""; position: absolute; inset: 1px; background: var(--em-white); }
.cb.on .i { position: absolute; left: 2px; top: 2px; color: var(--em-ink); }
.rb { position: relative; width: 18px; height: 18px; margin-right: 9px; flex: none; border-radius: 50%; background: var(--em-pit); border: 1.5px solid var(--em-edge-card); }
.rb.on { border-color: var(--em-white); }
.rb.on::after { content: ""; position: absolute; inset: 3.5px; border-radius: 50%; background: var(--em-white); }
.field { height: 32px; width: 260px; display: flex; align-items: center; padding: 0 10px; background: var(--em-pit); border: 1px solid var(--em-edge-lit); color: var(--em-white); }
.field.focus { border-color: var(--em-ember); }
.combo { justify-content: space-between; padding-right: 10px; }
.combo .i { color: var(--em-label); }
.slider { position: relative; width: 260px; height: 20px; }
.slider::before { content: ""; position: absolute; left: 6px; right: 6px; top: 9.5px; height: 1px; background: var(--em-label); opacity: .55; }
.slider i { position: absolute; top: 7.5px; width: 1px; height: 5px; background: var(--em-label); }
.slider .run { position: absolute; left: 6px; top: 9px; width: 62%; height: 2px; background: var(--em-white); }
.slider .th { position: absolute; left: calc(6px + 62%); top: 3px; width: 2px; height: 14px; background: var(--em-white); }
.val { margin-left: 12px; color: var(--em-label); }
.btn { text-transform: uppercase; position: relative; height: 32px; padding: 0 16px; display: inline-flex; align-items: center; background: var(--em-pit); border: 1px solid var(--em-edge-lit); color: var(--em-label); }
.btn.def { color: var(--em-white); border-color: transparent; }
.prog { position: relative; width: 260px; height: 10px; background: var(--em-edge); border: 1px solid var(--em-edge-lit); }
.prog::before { content: ""; position: absolute; left: 1px; top: 1px; bottom: 1px; width: 58%; background: var(--em-ember); border-right: 2px solid var(--em-white); }
.tabs { display: flex; gap: 18px; border-bottom: 1px solid var(--em-edge); margin-bottom: 18px; height: 32px; }
.tabs div { text-transform: uppercase; position: relative; padding: 5px 2px 8px; color: var(--em-label); }
.tabs div.on { color: var(--em-white); }
.tabs div.on::after { content: ""; position: absolute; left: 0; right: 0; bottom: 3px; height: 2px; background: var(--em-white); }
.foot { flex: none; height: 56px; border-top: 1px solid var(--em-edge); display: flex; align-items: center; padding: 0 20px; gap: 12px; }
.foot .req { flex: 1; color: var(--em-note); font-size: 12px; }
.tip { position: absolute; left: 706px; top: 552px; padding: 4px 8px; font-size: 12px; }
'''


def settings():
    def n(label, cls='', child=False, arrow=None):
        x = f'<span class="x">{icon(arrow, 12) if arrow else ""}</span>'
        em = EMBER if 'on' in cls else ''
        return f'<div class="n {cls}{" c" if child else ""}">{em}<span class="m"></span>{x}<span>{label}</span></div>'
    tree = ''.join([
        n('General'), n('Appearance', arrow='DropDown'),
        n('General', 'on', True), n('Advanced', '', True), n('Details View', 'hover', True), n('Grid View', '', True), n('List View', '', True),
        n('Layout', '', True), n('Top panel', '', True),
        n('Search'), n('Updating'), n('Metadata'), n('Sorting'), n('Scripts'), n('Auto Close Clients'), n('Import Exclusion List'),
        n('Backup'), n('For developers'), n('Input'), n('Advanced', arrow='Submenu'),
    ])
    return f'''<!DOCTYPE html>
<!-- Emberline: Settings window. Written by art/previews.py; edit the generator, not this file. A replica of the XAML, not a capture.
     Shown: the title band (slanted tab, title, ghosted mark, flare rule), the section list with one selected and one hovered row,
     and the controls in their real states. -->
<html lang="en"><head><meta charset="utf-8"><title>Emberline: settings</title>
<style>{CSS}{SETTINGS_CSS}</style></head>
<body>
<div class="win" data-part="settings-window">
  <div class="band"><div class="grime"></div><span class="tab"></span><span class="ghost">{icon("MainMenu", 72)}</span>
    <span class="name h">Settings</span>
    <div class="caps"><div>{icon("WindowMinimize", 12)}</div><div>{icon("WindowMaximize", 12)}</div><div class="x">{icon("WindowClose", 12)}</div></div>
  </div>
  {FLARE}
  <div class="mid">
    <div class="nav" data-part="settings-nav">{tree}<span class="thumb"></span></div>
    <div class="pg" data-part="settings-content">
      <div class="tabs"><div class="on">General</div><div>Fonts</div><div>Covers</div></div>
      <h2 class="h"><span class="tab"></span>Appearance</h2>
      <div class="line"><label>Theme</label><div class="field combo"><span>Emberline</span>{icon("DropDown", 12)}</div></div>
      <div class="line"><label>Language</label><div class="field combo"><span>English</span>{icon("DropDown", 12)}</div></div>
      <div class="line"><label>Font size</label><div class="slider"><i style="left:5px"></i><i style="right:5px"></i><span class="run"></span><span class="th"></span></div><span class="val">14</span></div>
      <div class="line"><label>Application font</label><div class="field focus">Bahnschrift</div></div>
      <div class="line"><span class="cb on">{icon("Check", 12)}</span>Use game background image as window background</div>
      <div class="line"><span class="cb"></span>Blur background image</div>
      <div class="line"><label>Darken background image</label><span class="rb on"></span><span style="margin-right:22px">Light</span><span class="rb"></span>Heavy</div>
      <div class="line"><label>Metadata download</label><div class="prog"></div><span class="val">58%</span></div>
      <div class="line" style="margin-top:6px"><label></label><span class="btn">Edit theme constants</span></div>
    </div>
  </div>
  <div class="foot" data-part="settings-buttons"><span class="req">* Requires restart to apply</span><span class="btn def sel">{EMBER}Save</span><span class="btn">Cancel</span></div>
  <span class="tip cap">Edit theme constants</span>
</div>
</body></html>
'''


def main():
    for name, fn in (('preview-details.html', details), ('preview-settings.html', settings)):
        with open(os.path.join(HERE, name), 'w', encoding='utf-8', newline='\n') as f:
            f.write(fn())
    print('wrote both previews')


if __name__ == '__main__':
    main()
