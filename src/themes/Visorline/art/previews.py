#!/usr/bin/env python3
"""Writes art/preview-details.html and art/preview-settings.html for Visorline.
    python3 src/themes/Visorline/art/previews.py
1280x720 replicas of the theme's XAML, not captures. Colors are var(--vs-*) from src/tokens.css (injected at render
time), icons are the geometries in src/Media.xaml, effects are the theme's own sprites through CSS masks. Sizes follow
the XAML: 44px rail, 52px top bar with 34px cells, 28px tree rows, 44px title band, 32px fields, 7px plate chamfer.
No game art, logo or capture is used: the banner and covers are CSS paintings. Render with
scripts/take-screenshots.ps1 -Extension visorline.
"""
import os
import re
HERE = os.path.dirname(os.path.abspath(__file__))
media = open(os.path.join(HERE, '..', 'src', 'Media.xaml'), encoding='utf-8').read()
ICON = {k: re.sub(r'^F[01]\s*', '', v.strip()) for k, v in re.findall(r'<Geometry x:Key="Icon(\w+)">([^<]*)<', media)}


def icon(name, size=16, cls='', style=''):
    return (f'<svg class="i {cls}" style="{style}" width="{size}" height="{size}" viewBox="0 0 24 24">'
            f'<path fill="currentColor" fill-rule="nonzero" d="{ICON[name]}"/></svg>')


FX = '../src/Images/fx/'
BR = ('<svg class="br tl" width="34" height="10"><path d="M0,10 L10,0 L34,0" fill="none" stroke="currentColor"/></svg>'
      '<svg class="br tr" width="34" height="10"><path d="M0,0 L24,0 L34,10" fill="none" stroke="currentColor"/></svg>'
      '<svg class="br bl" width="34" height="10"><path d="M0,0 L10,10 L34,10" fill="none" stroke="currentColor"/></svg>'
      '<svg class="br brr" width="34" height="10"><path d="M0,10 L24,10 L34,0" fill="none" stroke="currentColor"/></svg>')
BR_SMALL = BR.replace('width="34" height="10"', 'width="20" height="7"').replace('M0,10 L10,0 L34,0', 'M0,7 L7,0 L20,0').replace(
    'M0,0 L24,0 L34,10', 'M0,0 L13,0 L20,7').replace('M0,0 L10,10 L34,10', 'M0,0 L7,7 L20,7').replace('M0,10 L24,10 L34,0', 'M0,7 L13,7 L20,0')
STAR = '<svg class="i" width="14" height="14" viewBox="0 0 24 24"><path fill="var(--vs-star)" d="M12,2 L14.9,8.6 L22,9.3 L16.6,14 L18.2,21 L12,17.3 L5.8,21 L7.4,14 L2,9.3 L9.1,8.6Z"/></svg>'
MARK = icon('MainMenu', 22)
PLUS = '<svg class="abs" style="left:%dpx;top:%dpx;color:var(--vs-rule);opacity:.35" width="15" height="15"><path d="M7.5,0 L7.5,15 M0,7.5 L15,7.5" stroke="currentColor" fill="none"/></svg>'
DECOR = (PLUS % (120, 36) + PLUS % (470, 120) + PLUS % (780, 52) +
         '<svg class="abs" style="left:24px;top:14px;color:var(--vs-rule);opacity:.4" width="64" height="14"><path d="M0,14 L14,0 L64,0" stroke="currentColor" fill="none"/></svg>'
         '<svg class="abs" style="right:24px;top:96px;color:var(--vs-rule);opacity:.4" width="64" height="14"><path d="M0,0 L50,0 L64,14" stroke="currentColor" fill="none"/></svg>')

CSS = r'''
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1280px; height: 720px; overflow: hidden; background: var(--vs-void); color: var(--vs-mint);
       font: 14px/1.4 Bahnschrift, "Segoe UI"; position: relative; }
.h { font-family: "Rajdhani"; font-weight: 700; text-transform: uppercase; }
.i { display: block; flex: none; }
.abs { position: absolute; }
/* hex mesh, grain, scanlines, bloom: the theme's white-mask sprites, filled with brushes */
.mesh { position: absolute; inset: 0; pointer-events: none; background: var(--vs-rule); opacity: .07;
        -webkit-mask: url(%(fx)shex.png); mask: url(%(fx)shex.png); }
.grain { position: absolute; inset: 0; pointer-events: none; background: var(--vs-hud); opacity: .13;
         -webkit-mask: url(%(fx)sgrain.png); mask: url(%(fx)sgrain.png); }
.scan { position: absolute; inset: 0; pointer-events: none; background: var(--vs-void); opacity: .35;
        -webkit-mask: url(%(fx)sscan.png); mask: url(%(fx)sscan.png); }
.bloom { position: absolute; pointer-events: none; background: var(--vs-rule); opacity: .5;
         -webkit-mask: url(%(fx)sbloom.png) center / 100%% 100%% no-repeat; mask: url(%(fx)sbloom.png) center / 100%% 100%% no-repeat; }
.rulev { position: absolute; top: 0; bottom: 0; width: 8px; background: var(--vs-edge-lit);
         -webkit-mask: url(%(fx)sruler-v.png) repeat-y; mask: url(%(fx)sruler-v.png) repeat-y; }
.ruleh { position: absolute; left: 0; right: 0; height: 8px; background: var(--vs-edge-lit);
         -webkit-mask: url(%(fx)sruler-h.png) repeat-x; mask: url(%(fx)sruler-h.png) repeat-x; }
/* the selected band: grey-green, grained, between two lit rules */
.band { position: relative; background: linear-gradient(to bottom, var(--vs-band), var(--vs-band-dim)); color: var(--vs-hud); }
.band > .grain { opacity: .12; }
.band::after { content: ""; position: absolute; inset: 0; border-top: 1px solid var(--vs-rule); pointer-events: none;
               border-bottom: 1px solid color-mix(in srgb, var(--vs-rule) 55%%, transparent); }
.band > *:not(.grain):not(.bloom) { position: relative; }
/* a plate cut at 45 degrees: rim = the clipped outer shape, fill = the same shape inset 1px */
.plate { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 16px;
         color: var(--vs-mint); background: var(--vs-edge-lit); white-space: nowrap;
         clip-path: polygon(7px 0, calc(100%% - 7px) 0, 100%% 7px, 100%% calc(100%% - 7px), calc(100%% - 7px) 100%%, 7px 100%%, 0 calc(100%% - 7px), 0 7px); }
.plate::before { content: ""; position: absolute; inset: 1px; background: var(--vs-slab);
                 clip-path: polygon(6px 0, calc(100%% - 6px) 0, 100%% 6px, 100%% calc(100%% - 6px), calc(100%% - 6px) 100%%, 6px 100%%, 0 calc(100%% - 6px), 0 6px); }
.plate > * { position: relative; }
.plate.hot { background: var(--vs-rule); color: var(--vs-hud); }
.plate.hot::before { background: var(--vs-slab-lit); }
.plate.dark::before { background: var(--vs-void); }
.plate.sq { padding: 0; width: 44px; height: 44px; }
/* angled corner brackets (the source's chamfered corner lines) */
.br { position: absolute; color: var(--vs-rule); overflow: visible; }
.br.tl { left: -4px; top: -4px; } .br.tr { right: -4px; top: -4px; }
.br.bl { left: -4px; bottom: -4px; } .br.brr { right: -4px; bottom: -4px; }
.cap { display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--vs-rule); color: var(--vs-hud);
       font: 700 11px Rajdhani; padding: 0 5px; height: 18px; }
/* segmented bar: cells 8 lit + 2 gap, from seg.png */
.segbar { position: relative; height: 12px; }
.segbar i { position: absolute; left: 0; top: 0; bottom: 0; -webkit-mask: url(%(fx)sseg.png) repeat-x; mask: url(%(fx)sseg.png) repeat-x; }
.segbar .t { right: 0; background: var(--vs-edge); }
.segbar .f { width: var(--p); background: var(--vs-rule); }
.segbar.red .f { background: var(--vs-alert); }
.hexbox { position: relative; display: inline-block; width: 18px; height: 20px; flex: none; background: var(--vs-edge-lit);
          clip-path: polygon(50%% 0, 100%% 25%%, 100%% 75%%, 50%% 100%%, 0 75%%, 0 25%%); }
.hexbox::before { content: ""; position: absolute; inset: 1px; background: var(--vs-void);
                  clip-path: polygon(50%% 0, 100%% 25%%, 100%% 75%%, 50%% 100%%, 0 75%%, 0 25%%); }
.hexbox.on { background: var(--vs-rule); } .hexbox.on::before { background: var(--vs-slab-lit); }
.hexbox svg { position: absolute; left: 2px; top: 3px; color: var(--vs-hud); }
''' % {'fx': FX}

DETAILS_CSS = r'''
.rail { position: absolute; left: 0; top: 0; bottom: 0; width: 44px; background: var(--vs-void); }
.rail .rline { position: absolute; right: 0; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, var(--vs-rule), var(--vs-edge-lit) 40%%, var(--vs-edge)); }
.rail .rulev { right: 1px; opacity: .45; }
.menu { position: relative; width: 44px; height: 52px; display: flex; align-items: center; justify-content: center; }
.menu .hexcell { width: 32px; height: 34px; display: flex; align-items: center; justify-content: center; color: var(--vs-hud); background: var(--vs-slab);
                 clip-path: polygon(50%% 0, 100%% 25%%, 100%% 75%%, 50%% 100%%, 0 75%%, 0 25%%); }
.ritem { position: relative; width: 43px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--vs-label); }
.ritem.cur { color: var(--vs-hud); }
.main { position: absolute; left: 44px; top: 0; right: 0; bottom: 0; background: var(--vs-panel); }
.top { position: absolute; left: 0; right: 0; top: 0; height: 52px; background: var(--vs-void); }
.top .mesh { opacity: .05; -webkit-mask-position: 0 0; }
.top .rule { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--vs-edge-lit); }
.top .endl, .top .endr { position: absolute; bottom: 0; width: 40px; height: 10px; color: var(--vs-rule); }
.top .endl { left: 0; } .top .endr { right: 132px; }
.tcell { position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; color: var(--vs-label); }
.tcell.on { color: var(--vs-hud); }
.tcell.on .band { position: absolute; inset: 0; }
.search { position: relative; display: flex; align-items: center; gap: 8px; width: 250px; height: 32px; padding: 0 10px; color: var(--vs-label);
          background: var(--vs-edge-lit); clip-path: polygon(7px 0, 100%% 0, 100%% 100%%, 7px 100%%, 0 calc(100%% - 7px), 0 7px); }
.search::before { content: ""; position: absolute; inset: 1px; background: var(--vs-void);
                  clip-path: polygon(6px 0, 100%% 0, 100%% 100%%, 6px 100%%, 0 calc(100%% - 6px), 0 6px); }
.search > * { position: relative; }
.mark { position: absolute; right: -2px; top: -2px; width: 8px; height: 8px; background: var(--vs-star); transform: rotate(45deg) scale(.8); }
.win { position: absolute; right: 0; top: 0; height: 32px; display: flex; color: var(--vs-label); }
.win div { width: 40px; height: 32px; display: flex; align-items: center; justify-content: center; }
.list { position: absolute; left: 0; top: 52px; bottom: 0; width: 276px; background: var(--vs-panel); border-right: 1px solid var(--vs-edge); }
.grow { position: relative; height: 32px; display: flex; align-items: center; gap: 10px; padding: 0 12px 0 14px; color: var(--vs-mint); font-size: 13px; }
.grow .ico { width: 18px; height: 18px; background: var(--vs-pit); border: 1px solid var(--vs-edge-lit); flex: none; }
.grow .nm { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.grow.sel { color: var(--vs-hud); }
.grow.sel .ico { border-color: var(--vs-rule); }
.page { position: absolute; left: 277px; top: 52px; right: 0; bottom: 0; overflow: hidden; background: var(--vs-panel); }
.banner { position: absolute; left: 0; right: 0; top: 0; height: 300px; overflow: hidden;
          background: radial-gradient(60%% 80%% at 78%% 38%%, #2b4a40 0%%, transparent 70%%), radial-gradient(40%% 60%% at 30%% 20%%, #1a2f29 0%%, transparent 75%%),
                      linear-gradient(180deg, #0c1a16 0%%, #0a1613 60%%, var(--vs-panel) 100%%); }
.banner .towers { position: absolute; left: 0; right: 0; bottom: 60px; height: 130px; opacity: .55;
  background: linear-gradient(90deg, transparent 0 4%%, #07100d 4%% 9%%, transparent 9%% 12%%, #07100d 12%% 20%%, transparent 20%% 23%%, #07100d 23%% 27%%, transparent 27%% 41%%,
              #07100d 41%% 46%%, transparent 46%% 50%%, #07100d 50%% 62%%, transparent 62%% 66%%, #07100d 66%% 71%%, transparent 71%% 100%%);
  -webkit-mask: linear-gradient(to top, #000 30%%, transparent); mask: linear-gradient(to top, #000 30%%, transparent); }
.banner .mesh { opacity: .1; left: 38%%; -webkit-mask-position: 0 0; }
.banner .fade { position: absolute; left: 0; right: 0; bottom: 0; height: 170px; background: linear-gradient(to bottom, transparent, var(--vs-panel) 88%%); }
.strip { position: absolute; left: 30px; right: 30px; top: 243px; height: 16px; }
.strip .ruleh { top: 8px; background: var(--vs-rule); opacity: .45; }
.strip .line { position: absolute; left: 0; right: 0; top: 8px; height: 1px; background: var(--vs-rule); opacity: .6; }
.strip .pip { position: absolute; top: 4px; width: 9px; height: 9px; background: var(--vs-star); transform: rotate(45deg); }
.title { position: absolute; left: 30px; top: 183px; height: 48px; display: flex; align-items: center; gap: 12px; font: 700 34px/1 Rajdhani; text-transform: uppercase; color: var(--vs-hud); }
.title i.hx { display: block; width: 14px; height: 16px; background: var(--vs-rule); clip-path: polygon(50%% 0, 100%% 25%%, 100%% 75%%, 50%% 100%%, 0 75%%, 0 25%%); }
.title .bloom { left: -30px; top: -14px; width: 360px; height: 70px; opacity: .22; }
.acts { position: absolute; right: 30px; top: 183px; display: flex; gap: 12px; align-items: center; }
.play { position: relative; width: 210px; height: 48px; }
.play .pcap { position: absolute; left: 14px; top: 13px; width: 18px; height: 18px; border: 1px solid var(--vs-rule); display: flex; align-items: center; justify-content: center; color: var(--vs-hud); }
.play .plate { width: 100%%; height: 100%%; padding: 0; justify-content: flex-start; background: var(--vs-rule); }
.play .plate::before { background: linear-gradient(to bottom, var(--vs-slab-lit), var(--vs-slab)); }
.play .lbl { position: absolute; left: 0; right: 0; top: 7px; text-align: center; font: 700 20px/1 Rajdhani; color: var(--vs-hud); }
.play .segbar { position: absolute; left: 14px; right: 14px; bottom: 7px; height: 6px; }
.play .segbar i { -webkit-mask: url(%(fx)sseg.png) 0 0 / 10px 6px repeat-x; mask: url(%(fx)sseg.png) 0 0 / 10px 6px repeat-x; }
.play .segbar .f { background: var(--vs-hud); }
.play .bloom { left: 20px; right: 20px; top: 4px; height: 40px; opacity: .22; }
.play .br { color: var(--vs-rule); }
.play .br.tl { left: -7px; top: -7px; } .play .br.tr { right: -7px; top: -7px; } .play .br.bl { left: -7px; bottom: -7px; } .play .br.brr { right: -7px; bottom: -7px; }
.body { position: absolute; left: 30px; right: 30px; top: 271px; bottom: 0; }
.cols { display: flex; gap: 24px; }
.left { flex: 1; min-width: 0; }
.shots { display: flex; gap: 10px; margin-bottom: 16px; }
.shot { position: relative; width: 138px; height: 78px; border: 1px solid var(--vs-edge-lit); }
.shot.hov { border-color: var(--vs-rule); }
.sec { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; color: var(--vs-hud); font: 700 14px Rajdhani; text-transform: uppercase; }
.sec i { display: block; width: 7px; height: 8px; background: var(--vs-rule); clip-path: polygon(50%% 0, 100%% 25%%, 100%% 75%%, 50%% 100%%, 0 75%%, 0 25%%); }
.sec b { flex: 1; height: 1px; background: linear-gradient(to right, var(--vs-edge-lit), transparent); }
.desc { font-size: 14px; line-height: 1.55; color: var(--vs-mint); max-width: 520px; }
.meta { position: relative; width: 322px; flex: none; background: var(--vs-pit); border: 1px solid var(--vs-edge-lit); padding: 6px 10px; }
.mg { padding: 7px 0; border-top: 1px solid var(--vs-edge); }
.mg:first-child { border-top: 0; }
.mr { display: flex; gap: 12px; align-items: baseline; padding: 2px 0; font-size: 13px; }
.mr .k { width: 40%%; flex: none; color: var(--vs-label); }
.mr .v { flex: 1; color: var(--vs-mint); }
.score { display: flex; align-items: center; gap: 10px; flex: 1; }
.score .segbar { flex: 1; height: 9px; }
.score .segbar i { -webkit-mask: url(%(fx)sseg.png) 0 0 / 10px 9px repeat-x; mask: url(%(fx)sseg.png) 0 0 / 10px 9px repeat-x; }
.score b { font: 700 15px Rajdhani; color: var(--vs-hud); width: 22px; text-align: right; }
.chips { display: flex; flex-wrap: wrap; gap: 5px; }
.chip { position: relative; height: 22px; padding: 0 9px; display: inline-flex; align-items: center; font-size: 12px; color: var(--vs-mint); background: var(--vs-edge-lit);
        clip-path: polygon(5px 0, 100%% 0, calc(100%% - 5px) 100%%, 0 100%%); }
.chip::before { content: ""; position: absolute; inset: 1px; background: var(--vs-pit); clip-path: polygon(5px 0, 100%% 0, calc(100%% - 5px) 100%%, 0 100%%); }
.chip span { position: relative; }
.metabr { color: var(--vs-edge-lit); }
.scanwrap { position: absolute; inset: 0; pointer-events: none; }
''' % {'fx': FX}


def games():
    names = [('Ashfall Relay', 0), ('Brink of Static', 0), ('Cinder Orbit', 1), ('Concrete Meridian', 1), ('Dust Protocol', 0), ('Echo Harbor', 0),
             ('Fault Line 2', 0), ('Glass Reservoir', 1), ('Hollow Array', 0), ('Iron Lantern', 0), ('Kilo District', 0), ('Lost Frequency', 0),
             ('Mesh Runner', 0), ('Night Telemetry', 1), ('Orbital Yard', 0), ('Pale Signal', 0), ('Quarry Zero', 0), ('Relic District', 0),
             ('Salt Terminal', 0), ('Tidal Ledger', 0)]
    out = []
    for n, star in names:
        sel = n == 'Concrete Meridian'
        row = (f'<div class="grow{" sel band" if sel else ""}">' + ('<i class="grain"></i><i class="bloom" style="left:20px;top:3px;width:160px;height:26px;opacity:.28"></i>' if sel else '') +
               f'<span class="ico"></span><span class="nm">{n}</span>' + (STAR if star else '') + '</div>')
        out.append(row)
    return ''.join(out)


def tool(name, on=False, mark=False, part=''):
    p = f' data-part="{part}"' if part else ''
    inner = ('<i class="grain"></i>' if on else '') + icon(name, 16) + ('<i class="mark"></i>' if mark else '')
    return f'<div class="tcell{" on band" if on else ""}"{p}>{inner}</div>'


def details():
    nav = ''.join([
        f'<div class="ritem cur band"><i class="grain"></i>{icon("Library", 16)}</div>',
        f'<div class="ritem">{icon("Statistics", 16)}</div>',
        f'<div class="ritem">{icon("Update", 16)}</div>',
        f'<div class="ritem">{icon("Explorer", 16)}</div>'])
    ruler_gap = '<div style="height:12px"></div>'
    topbar = (
        '<div class="top" data-part="top-panel"><i class="mesh" style="right:132px"></i>'
        '<div class="abs" style="left:12px;top:9px;display:flex;gap:6px;align-items:center">'
        f'<div class="search" data-part="PART_TextMainSearch">{icon("Search", 16)}<span style="font-size:13px">Search</span></div>'
        f'<div style="width:6px"></div>{tool("Filter", mark=True, part="PART_ToggleFilter")}'
        '<div style="display:flex;gap:0" data-part="PART_PanelMainItems">'
        f'{tool("Sort")}{tool("Group")}{tool("DetailsView", on=True)}{tool("GridView")}{tool("ListView")}{tool("ViewSettings")}</div>'
        '</div>'
        f'<div class="abs" style="right:140px;top:9px">{tool("Notifications", part="PART_ToggleNotifications")}</div>'
        '<div class="win">' + ''.join(f'<div>{icon(n, 14)}</div>' for n in ('WindowMinimize', 'WindowMaximize', 'WindowClose')) + '</div>'
        '<div class="rule"></div>'
        '<svg class="endl" width="40" height="10"><path d="M0,0 L0,1 L26,1 L36,10" fill="none" stroke="currentColor"/></svg>'
        '<svg class="endr" width="40" height="10"><path d="M40,1 L14,1 L4,10" fill="none" stroke="currentColor"/></svg></div>')
    shots = ''.join(
        f'<div class="shot{" hov" if i == 0 else ""}" style="background:{bg}">' + (BR_SMALL if i == 0 else '') + '</div>'
        for i, bg in enumerate([
            'radial-gradient(60% 80% at 70% 40%, #35574b, #0c1714)', 'radial-gradient(60% 80% at 30% 50%, #3b4d43, #0b1411)',
            'radial-gradient(70% 90% at 60% 30%, #2c4a43, #09110f)']))
    meta = f'''
<div class="meta" data-part="metadata">
  <svg class="metabr abs" style="left:-1px;top:-1px" width="20" height="7"><path d="M0,7 L7,0 L20,0" fill="none" stroke="currentColor"/></svg>
  <svg class="metabr abs" style="right:-1px;bottom:-1px" width="20" height="7"><path d="M0,7 L13,7 L20,0" fill="none" stroke="currentColor"/></svg>
  <div class="mg">
    <div class="mr"><span class="k">Completion Status</span><span class="v">Playing</span></div>
    <div class="mr"><span class="k">Time Played</span><span class="v">48h 12m</span></div>
    <div class="mr"><span class="k">Last Played</span><span class="v">Yesterday</span></div>
  </div>
  <div class="mg">
    <div class="mr"><span class="k">Community Score</span><span class="score"><span class="segbar" style="--p:86%"><i class="t"></i><i class="f"></i></span><b>86</b></span></div>
    <div class="mr"><span class="k">Critic Score</span><span class="score"><span class="segbar" style="--p:78%"><i class="t"></i><i class="f"></i></span><b>78</b></span></div>
    <div class="mr"><span class="k">User Score</span><span class="score"><span class="segbar" style="--p:92%"><i class="t"></i><i class="f"></i></span><b>92</b></span></div>
  </div>
  <div class="mg">
    <div class="mr"><span class="k">Developers</span><span class="v">Fault Line Works</span></div>
    <div class="mr"><span class="k">Release Date</span><span class="v">2025</span></div>
  </div>
  <div class="mg">
    <div class="mr"><span class="k">Genres</span><span class="chips"><span class="chip"><span>Shooter</span></span><span class="chip"><span>Stealth</span></span><span class="chip"><span>Sci-Fi</span></span></span></div>
  </div>
  <div class="mg">
    <div class="mr"><span class="k">Library</span><span class="v">Steam</span></div>
  </div>
</div>'''
    page = f'''
<div class="page" data-part="game-page">
  <div class="banner"><i class="mesh"></i><div class="towers"></div><div class="fade"></div>{DECOR}</div>
  <div class="strip"><i class="ruleh"></i><i class="line"></i><i class="pip" style="left:62%"></i></div>
  <div class="title"><i class="hx"></i>Concrete Meridian<i class="bloom"></i></div>
  <div class="acts">
    <div class="play"><i class="bloom"></i><div class="plate hot"></div>
      <span class="pcap">{icon("Play", 11)}</span><div class="lbl">PLAY</div>
      <div class="segbar" style="--p:100%"><i class="t"></i><i class="f"></i></div>{BR}</div>
    <div class="plate sq">{icon("Options", 20)}</div>
    <div class="plate sq">{icon("Edit", 18)}</div>
  </div>
  <div class="body">
    <div class="cols">
      <div class="left">
        <div class="shots">{shots}</div>
        <div class="sec"><i></i>About<b></b></div>
        <p class="desc">Four hours before the district goes dark, a courier's last signal pings from beneath the harbor line. Move through flooded
        service tunnels, read the city's failing grid and decide who gets the power back first. A single-player campaign with open approach
        paths and a suit that rewards patience.</p>
      </div>
      {meta}
    </div>
  </div>
</div>'''
    return (f'<!doctype html><html><head><meta charset="utf-8"><title>Visorline: details view</title><style>{CSS}{DETAILS_CSS}</style></head><body>'
            f'<div class="rail" data-part="sidebar"><i class="mesh" style="opacity:.05"></i><i class="rulev"></i><i class="rline"></i>'
            f'<div class="menu" data-part="PART_ElemMainMenu"><div class="hexcell">{icon("MainMenu", 24)}</div></div>{nav}</div>'
            f'<div class="main">{topbar}<div class="list" data-part="game-list">{games()}</div>{page}</div></body></html>')


SETTINGS_CSS = r'''
body { background: radial-gradient(70%% 70%% at 50%% 40%%, #0d1613, var(--vs-void)); }
.win { position: absolute; left: 200px; top: 8px; width: 880px; height: 676px; background: var(--vs-panel); border: 1px solid var(--vs-edge-lit); }
.tband { position: absolute; left: 0; right: 0; top: 0; height: 44px; background: var(--vs-void); border-bottom: 1px solid var(--vs-edge-lit); }
.tband .mesh { opacity: .08; }
.tband .t { position: absolute; left: 16px; top: 0; height: 44px; display: flex; align-items: center; gap: 10px; color: var(--vs-hud); font: 700 18px Rajdhani; text-transform: uppercase; }
.tband .t .gt { color: var(--vs-rule); font: 700 20px Rajdhani; }
.tband .x { position: absolute; right: 0; top: 0; width: 46px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--vs-label); }
.nav { position: absolute; left: 0; top: 45px; bottom: 56px; width: 250px; padding: 8px 12px 8px 14px; overflow: hidden; border-right: 1px solid var(--vs-edge); }
.nav .rulev { left: 4px; opacity: .5; }
.nav .vline { position: absolute; left: 12px; top: 0; bottom: 0; width: 1px; background: var(--vs-rule); opacity: .7; }
.nrow { position: relative; height: 28px; margin: 0 0 1px 14px; display: flex; align-items: center; padding-left: 12px; color: var(--vs-mint); font-size: 13px; }
.nrow.sub { margin-left: 30px; color: var(--vs-mint); }
.nrow.sel { color: var(--vs-hud); }
.nrow.sel .band { position: absolute; left: -14px; right: -12px; top: 0; bottom: 0; }
.lane { position: absolute; right: 2px; top: 8px; width: 4px; height: 360px; background: var(--vs-edge-lit); }
.nrow .chev { color: var(--vs-label); margin-left: auto; margin-right: 10px; }
.nrow .tick { position: absolute; left: -14px; top: 7px; bottom: 7px; width: 3px; background: var(--vs-hud); }
.content { position: absolute; left: 251px; right: 0; top: 45px; bottom: 56px; padding: 16px 22px; overflow: hidden; }
.content .ct { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: var(--vs-hud); font: 700 15px Rajdhani; text-transform: uppercase; }
.content .ct b { flex: 1; height: 1px; background: linear-gradient(to right, var(--vs-edge-lit), transparent); }
.field { display: flex; align-items: center; gap: 12px; min-height: 32px; margin: 0 0 10px; }
.field .k { width: 200px; flex: none; color: var(--vs-mint); font-size: 13px; }
.chk { display: flex; align-items: center; gap: 10px; margin: 0 0 12px; font-size: 13px; color: var(--vs-mint); }
.radio { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--vs-mint); margin-right: 24px; }
.ring { width: 16px; height: 16px; border: 1px solid var(--vs-edge-lit); border-radius: 50%%; position: relative; }
.ring.on { border-color: var(--vs-rule); } .ring.on::after { content: ""; position: absolute; inset: 3px; border-radius: 50%%; background: var(--vs-hud); }
.combo { position: relative; height: 32px; width: 220px; background: var(--vs-edge-lit); display: flex; align-items: center; padding: 0 34px 0 18px; color: var(--vs-hud); font: 700 15px Rajdhani;
         clip-path: polygon(14px 0, 100%% 0, 100%% 100%%, 14px 100%%, 0 50%%); }
.combo::before { content: ""; position: absolute; inset: 1px; background: linear-gradient(to bottom, var(--vs-slab-lit), var(--vs-slab)); clip-path: polygon(13px 0, 100%% 0, 100%% 100%%, 13px 100%%, 0 50%%); }
.combo span { position: relative; } .combo svg { position: absolute; right: 10px; color: var(--vs-hud); }
.input { position: relative; height: 32px; width: 220px; display: flex; align-items: center; padding: 0 12px; color: var(--vs-mint); font-size: 13px; background: var(--vs-edge-lit);
         clip-path: polygon(7px 0, 100%% 0, 100%% 100%%, 7px 100%%, 0 calc(100%% - 7px), 0 7px); }
.input::before { content: ""; position: absolute; inset: 1px; background: var(--vs-void); clip-path: polygon(6px 0, 100%% 0, 100%% 100%%, 6px 100%%, 0 calc(100%% - 6px), 0 6px); }
.input span { position: relative; }
.slider { position: relative; width: 220px; height: 24px; }
.slider .segbar { position: absolute; left: 0; right: 0; top: 9px; height: 6px; }
.slider .segbar i { -webkit-mask: url(%(fx)sseg.png) 0 0 / 10px 6px repeat-x; mask: url(%(fx)sseg.png) 0 0 / 10px 6px repeat-x; }
.slider .th { position: absolute; left: 60%%; top: 2px; width: 14px; height: 20px; margin-left: -7px; }
.slider .th::before, .slider .th::after { content: ""; position: absolute; top: 0; bottom: 0; width: 5px; border: 1px solid var(--vs-hud); border-right: 0; }
.slider .th::before { left: 0; border-width: 1px 0 1px 1px; } .slider .th::after { right: 0; border-width: 1px 1px 1px 0; }
.energy { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.energy .pc { width: 38px; text-align: right; font: 700 15px Rajdhani; color: var(--vs-hud); }
.energy .segbar { width: 300px; height: 12px; }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 56px; border-top: 1px solid var(--vs-edge-lit); background: var(--vs-void); }
.bar .rn { position: absolute; left: 16px; top: 0; height: 56px; display: flex; align-items: center; color: var(--vs-label); font-size: 12px; }
.bar .btns { position: absolute; right: 16px; top: 12px; display: flex; gap: 10px; }
.foot { position: absolute; left: 0; right: 0; bottom: 12px; text-align: center; color: var(--vs-label); font-size: 11px; }
''' % {'fx': FX}


def settings():
    tree = [('General', 0, 0), ('Appearance', 0, 1), ('General', 1, 2), ('Advanced', 1, 0), ('Details View', 1, 0), ('Grid View', 1, 0), ('List View', 1, 0),
            ('Layout', 1, 0), ('Top panel', 1, 0), ('Search', 0, 0), ('Updating', 0, 0), ('Metadata', 0, 0), ('Sorting', 0, 0), ('Scripts', 0, 0),
            ('Auto Close Clients', 0, 0), ('Import Exclusion List', 0, 0), ('Backup', 0, 0), ('For developers', 0, 0), ('Input', 0, 0), ('Advanced', 0, 0)]
    rows = []
    for n, sub, state in tree:
        sel = state == 2
        cls = 'nrow' + (' sub' if sub else '') + (' sel' if sel else '')
        inner = ('<div class="band"><i class="grain"></i><i class="bloom" style="left:8px;top:0;width:120px;height:28px;opacity:.2"></i></div><i class="tick"></i>' if sel else '')
        chev = f'<span class="chev">{icon("DropDown", 12)}</span>' if state == 1 else ''
        rows.append(f'<div class="{cls}">{inner}<span style="position:relative">{n}</span>{chev}</div>')
    return (f'<!doctype html><html><head><meta charset="utf-8"><title>Visorline: settings</title><style>{CSS}{SETTINGS_CSS}</style></head><body>'
            f'<div class="win" data-part="settings-window">'
            f'<div class="tband"><i class="mesh"></i><div class="t">{icon("MainMenu", 22)}<span class="gt">‹</span>Settings<span class="gt">›</span></div>'
            f'<div class="x">{icon("WindowClose", 16)}</div></div>'
            f'<div class="nav" data-part="settings-nav"><i class="rulev"></i><i class="vline"></i><i class="lane"></i>{"".join(rows)}</div>'
            f'<div class="content" data-part="settings-content">'
            f'<div class="ct">General<b></b></div>'
            f'<div class="chk"><span class="hexbox on">{icon("Check", 14)}</span>Start Playnite when I sign in</div>'
            f'<div class="chk"><span class="hexbox"></span>Minimize to tray when the window is closed</div>'
            f'<div class="field"><span class="k">Language</span><div class="combo"><span>English</span>{icon("DropDown", 14)}</div></div>'
            f'<div class="field"><span class="k">Library folder</span><div class="input"><span>D:\\Games\\Library</span></div></div>'
            f'<div class="field"><span class="k">Game list scale</span><div class="slider"><div class="segbar" style="--p:60%"><i class="t"></i><i class="f"></i></div><div class="th"></div></div></div>'
            f'<div class="field"><span class="k">Update mode</span><div class="radio"><span class="ring on"></span>Automatic</div><div class="radio"><span class="ring"></span>Manual</div></div>'
            f'<div class="ct" style="margin-top:22px">Library update<b></b></div>'
            f'<div class="energy"><span class="pc">90%</span><div class="segbar" style="--p:90%"><i class="t"></i><i class="f"></i></div></div>'
            f'<div class="field" style="margin-top:20px"><span class="k"></span><div class="plate hot" style="min-width:140px"><span class="h" style="font-size:14px">Update now</span></div>'
            f'<div class="plate" style="min-width:120px"><span class="h" style="font-size:14px">Defaults</span></div></div>'
            f'</div>'
            f'<div class="bar" data-part="settings-buttons"><div class="rn">* Requires restart to apply</div><div class="btns">'
            f'<div class="plate hot" style="min-width:104px"><span class="h" style="font-size:14px">Save</span></div>'
            f'<div class="plate" style="min-width:104px"><span class="h" style="font-size:14px">Cancel</span></div></div></div>'
            f'</div><div class="foot">Visorline · an unofficial fan theme inspired by public captures of the Crysis 2 menus and HUD. Not affiliated with Crytek or Electronic Arts.</div></body></html>')


def main():
    open(os.path.join(HERE, 'preview-details.html'), 'w', encoding='utf-8', newline='\n').write(details())
    open(os.path.join(HERE, 'preview-settings.html'), 'w', encoding='utf-8', newline='\n').write(settings())
    print('wrote preview-details.html, preview-settings.html')


if __name__ == '__main__':
    main()
