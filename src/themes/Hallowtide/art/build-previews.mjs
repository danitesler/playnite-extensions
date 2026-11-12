// Writes art/preview-details.html and art/preview-settings.html: 1280x720 replicas of Hallowtide's Game Details view and
// Settings window. Icons come straight from src/Media.xaml (same geometry strings), ornaments are the same white-mask
// sprites the XAML uses (src/Images/fx) drawn through CSS masks, colours are var(--token) from src/tokens.css.
//
//   node art/build-previews.mjs && powershell -File scripts/take-screenshots.ps1 -Extension hallowtide
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const media = readFileSync(join(here, '..', 'src', 'Media.xaml'), 'utf8');
const geo = {};
for (const m of media.matchAll(/<Geometry x:Key="([^"]+)">([^<]+)<\/Geometry>/g)) geo[m[1]] = m[2].trim();
const icon = (name, size = 16, sw = 2, cls = '') =>
  `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="${geo['Icon' + name] || geo[name]}"/></svg>`;

const FX = '../src/Images/fx/';

const CSS = `
  :root { --bg: var(--void); --text: var(--bone); --muted: var(--bone-mute); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1280px; height: 720px; overflow: hidden; background: var(--void); color: var(--bone);
         font-family: "Gelasio", "Georgia", serif; font-size: 14px; position: relative; }
  .ic { display: block; flex: none; }
  .ui { font-family: "Barlow Semi Condensed", "Segoe UI", sans-serif; font-weight: 500; }
  .head { font-family: "Cinzel", "Georgia", serif; font-weight: 600; }

  /* ---- ornaments: the sprites the XAML masks use ---- */
  .thorn { height: 14px; background: var(--ink-rule); -webkit-mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; }
  .divider { height: 18px; display: flex; align-items: center; color: var(--ink-rule); }
  .divider::before, .divider::after { content: ""; flex: 1; height: 14px; background: currentColor; -webkit-mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; }
  .divider::before { margin-right: -6px; } .divider::after { margin-left: -6px; }
  .divider i { width: 76px; height: 18px; flex: none; background: currentColor; -webkit-mask: url(${FX}spiral-pair.png) center / 76px 18px no-repeat; mask: url(${FX}spiral-pair.png) center / 76px 18px no-repeat; }
  .plate-ink { position: relative; isolation: isolate; }
  .plate-ink::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--plate, var(--ink));
      -webkit-mask-box-image: url(${FX}plate-ink.png) 32 fill / 12px round; mask-border: url(${FX}plate-ink.png) 32 fill / 12px round; }
  .plate-torn { position: relative; isolation: isolate; }
  .plate-torn::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--plate, var(--paper-lit));
      -webkit-mask-box-image: url(${FX}plate-torn.png) 40 fill / 20px round; mask-border: url(${FX}plate-torn.png) 40 fill / 20px round; }
  .rope { position: absolute; inset: 2px; pointer-events: none; background: var(--rope, var(--ink-black)); opacity: .9;
      -webkit-mask-box-image: url(${FX}rope-frame.png) 72 / 36px round; mask-border: url(${FX}rope-frame.png) 72 / 36px round; }
  .mote { position: absolute; background: currentColor; -webkit-mask: url(${FX}mote.png) center / contain no-repeat; mask: url(${FX}mote.png) center / contain no-repeat; }
  .pin { width: 20px; height: 20px; position: relative; flex: none; }
  .pin::before { content: ""; position: absolute; left: 5px; top: 5px; width: 14px; height: 14px; border-radius: 50%; background: var(--void-deep); opacity: .72; }
  .pin::after { content: ""; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--pin-lit);
      border: .8px solid var(--paper-burn); box-shadow: inset 3px 3px 0 -1px rgba(255,235,210,.55); }
  .spiral { width: 14px; height: 14px; background: var(--lantern); -webkit-mask: url(${FX}spiral-mark.png) center / contain no-repeat; mask: url(${FX}spiral-mark.png) center / contain no-repeat; flex: none; }

  /* ---- the open book page: paper, burnt edge, inked rope frame ---- */
  .page { position: relative; background: var(--paper-lit); border-radius: 6px; color: var(--ink-text); }
  .page::before { content: ""; position: absolute; inset: 0; border-radius: 6px; background: radial-gradient(ellipse at 50% 50%, transparent 50%, var(--paper-burn) 130%); opacity: .6; pointer-events: none; }
  .page h3 { font-family: "Cinzel", Georgia, serif; font-weight: 600; font-size: 15px; color: var(--ink-black); }
  .page .divider { color: var(--ink-black); opacity: .75; margin: 4px 0 12px; }
  .page p { color: var(--ink-text); line-height: 1.55; font-size: 14px; }
  .page p b { color: var(--wisp-link); font-weight: 400; text-decoration: underline; text-decoration-thickness: 1px; }
  .page-body { position: relative; }

  /* ---- chips: ink plates on any ground ---- */
  .chips { display: flex; flex-wrap: wrap; gap: 6px 6px; }
  .chip { position: relative; isolation: isolate; padding: 3px 14px 4px; color: var(--bone); font-family: "Barlow Semi Condensed", sans-serif; font-weight: 500; font-size: 14px; line-height: 20px; }
  .chip::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--ink);
      -webkit-mask-box-image: url(${FX}plate-ink.png) 32 fill / 12px round; mask-border: url(${FX}plate-ink.png) 32 fill / 12px round; }
`;

// ---------------------------------------------------------------------------------------------- details preview
const gameRows = [
  'Amber Hollow', 'Brambleford', 'Candlewick Road', 'Dusk Orchard', 'Hollow Lantern', 'Ember & Elm', 'Foxglove Court', 'Gloam Market',
  'Hearthmoor', 'Inkwell Vale', 'Juniper Crypt', 'Kettle Wood', 'Lantern Orchard', 'Mistletoe Keep', 'Nightjar Path', 'Owlsmoor',
  'Pumpkin Wake', 'Quillfall'];

const row = (name, i) => {
  const selected = name === 'Hollow Lantern';
  const hover = name === 'Dusk Orchard';
  const cls = selected ? 'sel' : hover ? 'hov' : '';
  return `<div class="game-row ${cls}">${selected ? '<span class="rowplate plate-ink" style="--plate: var(--dream-plate)"></span><span class="spark mote"></span>' : hover ? '<span class="rowplate plate-ink" style="--plate: var(--ink)"></span>' : ''}<i style="background: hsl(${(i * 47) % 360} 28% ${selected ? 34 : 24}%)"></i><span>${name}</span></div>`;
};

const field = (label, content) => `<div class="mrow"><span class="ml ui">${label}</span><span class="mv">${content}</span></div>`;
const chip = t => `<span class="chip">${t}</span>`;

function detailsHtml() {
  return `<!doctype html>
<!-- Hallowtide: HTML replica of Playnite's Game Details view (1280x720). Generated by art/build-previews.mjs from the theme's
     tokens (var(--token)), Media.xaml icon geometries and the Images/fx sprites. Unofficial; no game assets. -->
<html>
<head>
<meta charset="utf-8">
<title>Hallowtide - Details Preview</title>
<style>${CSS}
  .rail { position: absolute; left: 0; top: 0; bottom: 0; width: 44px; background: var(--void-deep); border-right: 1px solid var(--ink-lit); z-index: 5; }
  .menu { position: absolute; left: 9px; top: 0; width: 26px; height: 44px; background: var(--pin);
          clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 83%, 0 100%); color: var(--bone); }
  .menu .ic { position: absolute; left: 5px; top: 7px; }
  .menu .tick { position: absolute; top: 27px; width: 1px; height: 10px; background: var(--bone); opacity: .5; }
  .ritem { position: absolute; left: 0; width: 43px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--bone-mute); }
  .ritem.cur { color: var(--bone); width: 43px; }
  .ritem.cur::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 43px; background: var(--dream-tab); border-radius: 0 8px 8px 0; z-index: -0; }
  .ritem.cur::after { content: ""; position: absolute; left: 0; top: 6px; bottom: 6px; width: 2px; background: var(--lantern); }
  .ritem.cur .ic { position: relative; z-index: 1; }
  .ritem.cur .glow { position: absolute; inset: -6px -10px; color: var(--dream-glow); opacity: .35; }

  .top { position: absolute; left: 44px; right: 0; top: 0; height: 52px; background: var(--void-plum); z-index: 4; }
  .top .rule { position: absolute; left: 0; right: 0; bottom: -7px; height: 14px; background: var(--ink-rule); -webkit-mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; }
  .top .line { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--ink-lit); }
  .search { position: absolute; left: 14px; top: 8px; width: 260px; height: 36px; background: var(--ink-well); border-radius: 3px 3px 0 0; border-bottom: 2px solid var(--paper-shade);
            display: flex; align-items: center; gap: 9px; padding: 0 12px; color: var(--bone-mute); font-size: 15px; }
  .tool { position: absolute; top: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--bone-mute); }
  .tool.on { color: var(--ink-text); }
  .tool.on::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--paper-lit); -webkit-mask-box-image: url(${FX}plate-ink.png) 32 fill / 12px round; mask-border: url(${FX}plate-ink.png) 32 fill / 12px round; }
  .tool .pin { position: absolute; right: -3px; top: -6px; transform: scale(.55); transform-origin: 100% 0; }
  .wbtn { position: absolute; top: 8px; width: 40px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--bone); }

  .list { position: absolute; left: 44px; top: 52px; bottom: 0; width: 262px; background: var(--void); border-right: 1px solid var(--ink-lit); padding-top: 12px; overflow: hidden; }
  .game-row { position: relative; height: 30px; margin: 1px 0; display: flex; align-items: center; gap: 10px; padding: 0 14px 0 14px; color: var(--bone-mute); font-size: 15px; }
  .game-row .rowplate { position: absolute; left: 3px; right: 3px; top: 0; bottom: 0; }
  .game-row i { width: 20px; height: 20px; border-radius: 3px; flex: none; position: relative; z-index: 1; }
  .game-row span:last-child { position: relative; z-index: 1; }
  .game-row.sel { color: var(--bone); } .game-row.hov { color: var(--bone); }
  .game-row .spark { right: 12px; top: 7px; width: 16px; height: 16px; color: var(--dream-glow); z-index: 1; }

  .stage { position: absolute; left: 306px; right: 0; top: 52px; bottom: 0; background: var(--void); overflow: hidden; }
  .banner { position: absolute; left: 0; right: 0; top: 0; height: 320px; overflow: hidden; }
  .art { position: absolute; inset: 0;
         background:
           radial-gradient(ellipse 22% 38% at 76% 62%, rgba(255,170,90,.95), rgba(240,145,58,.55) 45%, transparent 70%),
           radial-gradient(ellipse 60% 70% at 70% 60%, rgba(194,87,15,.55), transparent 70%),
           linear-gradient(100deg, #0c3a46 0%, #12303b 30%, #3a1a2a 62%, #5a2412 100%); }
  .art .arch { position: absolute; right: 150px; bottom: 0; width: 240px; height: 250px; background: var(--void-deep); border-radius: 120px 120px 0 0; opacity: .92; }
  .art .arch::after { content: ""; position: absolute; inset: 22px 24px 0 24px; border-radius: 100px 100px 0 0; background: radial-gradient(ellipse at 50% 80%, #ffb766, #d16a1c 55%, #7a2a0a); }
  .art .stones { position: absolute; left: 0; right: 0; bottom: 0; height: 120px; background: linear-gradient(to top, #12040a, transparent); }
  .tint { position: absolute; inset: 0; background: var(--art-tint, rgba(41,9,26,.38)); }
  .scrim { position: absolute; inset: 0; background: var(--void-deep); opacity: .3; }
  .fade { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 18%, var(--void) 96%); }

  .content { position: absolute; left: 24px; right: 41px; top: 16px; }
  .head { }
  .titlebar { position: relative; margin-top: 100px; height: 42px; display: flex; align-items: flex-end; justify-content: space-between; }
  .title { font-family: "Cinzel", Georgia, serif; font-weight: 700; font-size: 30px; line-height: 36px; color: var(--bone); display: flex; align-items: center; gap: 14px; }
  .title .gicon { width: 38px; height: 38px; border-radius: 4px; background: linear-gradient(135deg, #c2570f, #5a2412); }
  .actions { display: flex; align-items: flex-end; gap: 10px; }
  .play { position: relative; width: 132px; height: 42px; display: flex; align-items: center; justify-content: center; color: var(--ink-text);
          font-family: "Cinzel", Georgia, serif; font-weight: 600; font-size: 16px; --plate: var(--primary-hover, var(--paper-lit)); }
  .play .bloom { position: absolute; inset: -30px; z-index: -2; color: var(--lantern); opacity: .55;
                 -webkit-mask-box-image: url(${FX}glow-frame.png) 88 fill / 44px stretch; mask-border: url(${FX}glow-frame.png) 88 fill / 44px stretch; background: currentColor; }
  .play .m1 { left: 28px; bottom: 10px; width: 9px; height: 9px; color: var(--lantern-glow); opacity: .9; }
  .play .m2 { left: 66px; bottom: 26px; width: 7px; height: 7px; color: var(--lantern-glow); opacity: .75; }
  .play .m3 { left: 98px; bottom: 16px; width: 11px; height: 11px; color: var(--lantern-glow); opacity: .85; }
  .play .ul { position: absolute; left: 36px; right: 36px; bottom: 7px; height: 2px; background: var(--ink-text); opacity: .7; }
  .sq { position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; color: var(--bone); --plate: var(--ink); }
  .stage .divider { margin: 16px 0 26px; }

  .cols { display: flex; gap: 24px; align-items: flex-start; }
  .main { flex: 1; min-width: 0; }
  .main .page { padding: 42px 42px 42px; margin-bottom: 24px; }
  .meta { width: 384px; flex: none; padding: 42px 42px 38px; }
  .mrow { display: flex; margin: 8px 0; min-height: 22px; align-items: flex-start; }
  .ml { width: 118px; flex: none; margin-right: 14px; margin-top: 3px; font-size: 14px; color: var(--ink-label); }
  .mv { flex: 1; font-size: 14px; color: var(--ink-text); padding-top: 1px; }
  .mgroup { position: relative; margin-top: 12px; padding-top: 22px; }
  .mgroup .rl { position: absolute; left: 0; right: 0; top: 0; height: 14px; background: var(--paper-burn); opacity: .85; -webkit-mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; }
  .link { color: var(--wisp-link); text-decoration: underline; text-decoration-thickness: 1px; }
  .score { position: relative; isolation: isolate; display: inline-block; padding: 1px 12px 2px; background: none; color: var(--moss); font-family: "Barlow Semi Condensed", sans-serif; font-weight: 600; }
  .score::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--ink); -webkit-mask-box-image: url(${FX}plate-ink.png) 32 fill / 12px round; mask-border: url(${FX}plate-ink.png) 32 fill / 12px round; }
  .note { font-family: "Patrick Hand", cursive; }
  .lfoot { position: absolute; left: 14px; right: 14px; bottom: 8px; font-size: 10px; line-height: 1.3; color: var(--bone-mute); opacity: .6; font-family: "Barlow Semi Condensed", sans-serif; }
  .foot { position: absolute; left: 24px; bottom: 10px; font-size: 11px; color: var(--bone-mute); opacity: .55; font-family: "Barlow Semi Condensed", sans-serif; }
</style>
</head>
<body>
<div class="rail" data-part="sidebar">
  <div class="menu" data-part="PART_ElemMainMenu">${icon('MainMenu', 16, 2.2)}<span class="tick" style="left:8px"></span><span class="tick" style="left:12px"></span><span class="tick" style="left:15px"></span><span class="tick" style="left:19px"></span></div>
  <div class="ritem cur" style="top:64px"><span class="glow mote"></span>${icon('Library', 16)}</div>
  <div class="ritem" style="top:104px">${icon('Statistics', 16)}</div>
  <div class="ritem" style="top:144px">${icon('Explorer', 16)}</div>
  <div class="ritem" style="top:184px">${icon('Update', 16)}</div>
</div>

<div class="top" data-part="top-panel">
  <div class="search" data-part="PART_TextMainSearch">${icon('Search', 16)}<span class="ui" style="font-weight:400">Search</span></div>
  <div class="tool" data-part="PART_ToggleFilter" style="left:288px">${icon('Filter', 16)}<span class="pin"></span></div>
  <div data-part="PART_PanelMainItems">
    <div class="tool" style="left:330px">${icon('Sort', 16)}</div>
    <div class="tool" style="left:372px">${icon('Group', 16)}</div>
    <div class="tool on" style="left:420px">${icon('DetailsView', 16)}</div>
    <div class="tool" style="left:458px">${icon('GridView', 16)}</div>
    <div class="tool" style="left:496px">${icon('ListView', 16)}</div>
    <div class="tool" style="left:542px">${icon('ViewSettings', 16)}</div>
  </div>
  <div class="tool" data-part="PART_ToggleNotifications" style="right:152px">${icon('Notifications', 16)}</div>
  <div class="wbtn" style="right:80px">${icon('WindowMinimize', 14, 2.4)}</div>
  <div class="wbtn" style="right:40px">${icon('WindowMaximize', 14, 2.4)}</div>
  <div class="wbtn" style="right:0">${icon('WindowClose', 14, 2.4)}</div>
  <div class="line"></div><div class="rule"></div>
</div>

<div class="list" data-part="game-list">
  ${gameRows.map(row).join('\n  ')}
</div>

<div class="stage" data-part="game-page">
  <div class="banner">
    <div class="art"><div class="arch"></div><div class="stones"></div></div>
    <div class="tint"></div><div class="scrim"></div><div class="fade"></div>
  </div>
  <div class="content">
    <div class="titlebar">
      <div class="title"><span class="gicon"></span>Hollow Lantern</div>
      <div class="actions">
        <div class="play plate-torn"><span class="bloom"></span><span class="mote m1"></span><span class="mote m2"></span><span class="mote m3"></span>Play<span class="ul"></span></div>
        <div class="sq plate-ink">${icon('Options', 18)}</div>
        <div class="sq plate-ink" style="margin-left:-2px">${icon('Edit', 18)}</div>
      </div>
    </div>
    <div class="divider"><i></i></div>
    <div class="cols">
      <div class="main">
        <div class="page">
          <div class="page-body">
            <h3>Description</h3><div class="divider"><i></i></div>
            <p>Follow the lantern-keeper through a dream that has lost its way. <b>Cursed orchards</b> bloom in the dark, a <b>moth court</b> keeps your name in a ledger, and every door you open writes a new page into the book you carry. Light the wicks, trade stories for keys, and find the way home before the last candle gutters.</p><p style="margin-top:10px">The orchard remembers every visitor. Bring salt, bring a spare candle, and do not answer to a name you were not given.</p>
          </div>
          <div class="rope"></div>
        </div>
      </div>
      <div class="page meta" data-part="metadata">
        <div class="page-body">
          <h3>Game details</h3><div class="divider"><i></i></div>
          <div style="overflow:hidden"><div style="margin-top:-34px">
            <div class="mgroup" style="margin-top:12px"><div class="rl"></div>
              ${field('Time played', '48 hours')}${field('Last played', 'Yesterday')}
            </div>
            <div class="mgroup"><div class="rl"></div>
              ${field('Developer', '<span class="link">Candlewick Games</span>')}${field('Release date', '<span class="link">2024</span>')}
            </div>
            <div class="mgroup"><div class="rl"></div>
              ${field('Genres', `<span class="chips">${chip('Adventure')}${chip('Folk horror')}${chip('Puzzle')}</span>`)}
            </div>
          </div></div>
        </div>
        <div class="rope"></div>
      </div>
    </div>
  </div>
  </div>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------------- settings preview
function tree() {
  const row = (label, o = {}) => `<div class="tr ${o.sel ? 'sel' : ''} ${o.hov ? 'hov' : ''} ${o.child ? 'child' : ''}">${o.sel || o.hov ? `<span class="trplate plate-ink" style="--plate: var(${o.sel ? '--dream-plate' : '--ink'})"></span>` : ''}${o.sel ? '<span class="bar"></span>' : ''}<span class="exp">${o.open !== undefined ? icon('Submenu', 12, 2.4, o.open ? 'open' : '') : ''}</span>${o.sel || o.hov ? `<span class="spiral" style="opacity:${o.sel ? 1 : .45}"></span>` : ''}<span class="lbl">${label}</span></div>`;
  return [
    row('General', {}), row('Appearance', { open: true }), row('General', { child: true, sel: true }), row('Advanced', { child: true }),
    row('Details View', { child: true, hov: true }), row('Grid View', { child: true }), row('List View', { child: true }), row('Layout', { child: true }),
    row('Top panel', { child: true }), row('Search', { open: false }), row('Updating', {}), row('Metadata', { open: false }), row('Sorting', {}),
    row('Scripts', {}), row('Auto Close Clients', {}), row('Import Exclusion List', {}), row('Backup', {}), row('For developers', {}),
  ].join('\n');
}

function settingsHtml() {
  return `<!doctype html>
<!-- Hallowtide: HTML replica of Playnite's Settings window (1280x720). Generated by art/build-previews.mjs. -->
<html>
<head>
<meta charset="utf-8">
<title>Hallowtide - Settings Preview</title>
<style>${CSS}
  body { background: radial-gradient(ellipse at 50% 40%, var(--void-aubergine), var(--void-deep) 75%); }
  .win { position: absolute; left: 180px; top: 18px; width: 920px; height: 684px; background: var(--void-wine); border: 1px solid var(--ink-lit); overflow: hidden; }
  .band { position: absolute; left: 0; right: 0; top: 0; height: 44px; background: var(--void-plum); z-index: 3; }
  .band .ribbon { position: absolute; right: 150px; top: 0; width: 360px; height: 44px; background: var(--bone); opacity: .17; -webkit-mask: url(${FX}serpent-ribbon.png) 0 0 / 360px 44px no-repeat; mask: url(${FX}serpent-ribbon.png) 0 0 / 360px 44px no-repeat; }
  .band .t { position: absolute; left: 14px; top: 0; height: 44px; display: flex; align-items: center; gap: 8px; font-family: "Cinzel", Georgia, serif; font-weight: 600; font-size: 17px; color: var(--bone); }
  .band .rule { position: absolute; left: 0; right: 0; bottom: -7px; height: 14px; background: var(--ink-rule); -webkit-mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; mask: url(${FX}thorn-tile.png) 0 0 / 48px 14px repeat-x; }
  .cb { position: absolute; top: 0; width: 46px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--bone); }
  .nav { position: absolute; left: 0; top: 44px; bottom: 56px; width: 260px; padding: 12px 2px 8px 6px; overflow: hidden; }
  .tr { position: relative; height: 30px; margin-top: 1px; display: flex; align-items: center; color: var(--bone-mute); font-size: 14px; padding-left: 4px; }
  .tr.child { margin-left: 20px; }
  .tr .exp { width: 16px; height: 16px; margin: 0 2px 0 4px; display: flex; align-items: center; justify-content: center; color: var(--lantern); position: relative; z-index: 1; }
  .tr .exp .open { transform: rotate(90deg); }
  .tr .lbl { position: relative; z-index: 1; }
  .tr .spiral { margin: 0 8px 0 2px; position: relative; z-index: 1; }
  .tr .trplate { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
  .tr .bar { position: absolute; left: 6px; top: 7px; width: 2px; height: 16px; background: var(--lantern); z-index: 1; }
  .tr.sel, .tr.hov { color: var(--bone); }
  .tr.child::before { content: ""; position: absolute; left: -10px; top: -2px; bottom: -2px; width: 1px; background: var(--ink-lit); }
  .page { position: absolute; left: 260px; right: 0; top: 44px; bottom: 56px; padding: 26px 34px; background: none; color: var(--bone); border-left: 1px solid var(--ink-lit); }
  .page::before { display: none; }
  .sec { font-family: "Cinzel", Georgia, serif; font-weight: 600; font-size: 17px; margin-bottom: 4px; }
  .sec + .divider { color: var(--ink-rule); margin-bottom: 14px; }
  .line { display: flex; align-items: center; gap: 14px; margin: 14px 0; }
  .lab { width: 150px; font-size: 14px; color: var(--bone-dim); }
  .well { position: relative; width: 300px; height: 32px; background: var(--ink-well); border: 1px solid var(--ink-rule); border-bottom: 2px solid var(--paper-shade); border-radius: 3px; display: flex; align-items: center; padding: 0 10px; color: var(--bone); font-size: 14px; }
  .well.focus { border-color: var(--dream-glow); border-bottom-color: var(--lantern); box-shadow: 0 0 0 2px rgba(91,156,240,.45); }
  .well .chev { margin-left: auto; color: var(--bone-mute); }
  .cbx { width: 18px; height: 18px; border: 1.5px solid var(--bone-dim); border-radius: 3px; background: var(--ink-well); flex: none; display: flex; align-items: center; justify-content: center; }
  .cbx.on { background: var(--paper-lit); border-color: var(--paper-lit); color: var(--ink-text); }
  .rad { width: 18px; height: 18px; border: 1.5px solid var(--bone-dim); border-radius: 50%; background: var(--ink-well); flex: none; display: flex; align-items: center; justify-content: center; }
  .rad.on { background: var(--paper-lit); border-color: var(--paper-lit); }
  .rad.on::after { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--ink-text); }
  .opt { display: flex; align-items: center; gap: 10px; margin: 12px 0; font-size: 14px; }
  .slider { position: relative; width: 300px; height: 22px; }
  .slider .ticks { position: absolute; left: 0; right: 0; top: 1px; height: 7px; background: repeating-linear-gradient(to right, var(--ink-rule) 0 1px, transparent 1px 15px); }
  .slider .rail { position: absolute; left: 0; right: 0; top: 11px; height: 6px; border-radius: 3px; background: var(--ink-rule); }
  .slider .fill { position: absolute; left: 0; width: 138px; top: 11px; height: 6px; border-radius: 3px; background: var(--paper-lit); }
  .slider .thumb { position: absolute; left: 131px; top: 7px; width: 14px; height: 14px; background: var(--paper-lit); border: 1.5px solid var(--ink-text); transform: rotate(45deg); box-shadow: 0 0 0 3px rgba(91,156,240,.35); }
  .btn { position: relative; isolation: isolate; height: 32px; padding: 0 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; color: var(--bone); }
  .btn.prim { color: var(--ink-text); }
  .btn.prim.plate-ink::before { background: var(--paper-lit); }
  .btn .u { position: absolute; left: 12px; right: 12px; bottom: 6px; height: 2px; background: var(--lantern); }
  .bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 56px; border-top: 1px solid var(--ink-lit); background: var(--void-wine); display: flex; align-items: center; padding: 0 18px; gap: 10px; }
  .bottom .note { margin-right: auto; font-size: 13px; color: var(--bone-mute); }
  .foot { position: absolute; left: 24px; bottom: 5px; font-size: 11px; color: var(--bone-mute); opacity: .55; font-family: "Barlow Semi Condensed", sans-serif; }
</style>
</head>
<body>
<div class="win" data-part="settings-window">
  <div class="band"><div class="ribbon"></div><div class="t"><span class="spiral" style="width:14px;height:14px"></span>Settings</div>
    <span class="cb" style="right:92px">${icon('WindowMinimize', 14, 2.4)}</span><span class="cb" style="right:46px">${icon('WindowMaximize', 14, 2.4)}</span><span class="cb" style="right:0">${icon('WindowClose', 14, 2.4)}</span>
    <div class="rule"></div></div>
  <div class="nav" data-part="settings-nav">
${tree()}
  </div>
  <div class="page" data-part="settings-content">
    <div class="sec">Appearance</div><div class="divider"><i></i></div>
    <div class="line"><span class="lab ui">Desktop theme</span><div class="well focus ui">Hallowtide<span class="chev">${icon('DropDown', 14, 2.4)}</span></div></div>
    <div class="line"><span class="lab ui">Font size</span><div class="slider"><div class="ticks"></div><div class="rail"></div><div class="fill"></div><div class="thumb"></div></div><span class="ui" style="color:var(--bone-dim)">14</span></div>
    <div class="line"><span class="lab ui">Library folder</span><div class="well ui" style="color:var(--bone-mute)">C:\\Games\\Playnite</div><div class="btn plate-ink ui">Browse</div></div>
    <div class="opt"><span class="cbx on">${icon('Check', 14, 3)}</span>Show game names under covers</div>
    <div class="opt"><span class="cbx"></span>Minimize to tray when closed</div>
    <div class="opt" style="gap:22px"><span style="display:flex;gap:10px;align-items:center"><span class="rad on"></span>Fill covers</span><span style="display:flex;gap:10px;align-items:center"><span class="rad"></span>Fit covers</span></div>
    <div class="sec" style="margin-top:26px">Covers</div><div class="divider"><i></i></div>
    <div class="line"><span class="lab ui">Cover size</span><div class="slider"><div class="ticks"></div><div class="rail"></div><div class="fill" style="width:92px"></div><div class="thumb" style="left:85px"></div></div><span class="ui" style="color:var(--bone-dim)">220</span></div>
    <div class="line"><span class="lab ui">Item spacing</span><div class="well ui">Comfortable<span class="chev">${icon('DropDown', 14, 2.4)}</span></div></div>
    <div class="line" style="margin-top:22px"><div class="btn prim plate-ink ui" style="font-weight:600"><span>Apply</span><span class="u"></span></div><div class="btn plate-ink ui">Reset</div></div>
  </div>
  <div class="bottom" data-part="settings-buttons"><span class="note ui" style="font-weight:400">* Requires restart to apply</span>
    <div class="btn prim plate-ink ui" style="font-weight:600">Save</div><div class="btn plate-ink ui">Cancel</div></div>
</div>
<div class="foot">Hallowtide: an unofficial theme inspired by the quest book of All Hallows: The Land of Lost Dreams. Not affiliated with its creators.</div>
</body>
</html>
`;
}

writeFileSync(join(here, 'preview-details.html'), detailsHtml(), 'utf8');
writeFileSync(join(here, 'preview-settings.html'), settingsHtml(), 'utf8');
console.log('wrote previews');
