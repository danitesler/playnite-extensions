// Glyph kit for the Playnite main-menu / context-menu item icons (the 24 *Icon string keys).
// Every glyph is drawn full-frame on a 24x24 grid (roughly 2..22) with NO background badge/plate.
// Each variant has two layers:
//   u  closed silhouette shapes (no class): painted as an outline ring + body fill so unions stay seamless
//   d  details layered on top, using classes: o (ink stroke), x (accent stroke), a (accent fill), i (ink fill), k (thin ink stroke)
// Core slots have 5-6 distinct full-frame metaphors so every theme wears its own bold 15-16px silhouette.

export const SLOTS = [
  'FullscreenModeIcon', 'AddGameIcon', 'UpdateDbIcon', 'AboutPlayniteIcon', 'ExitIcon', 'SettingsIcon',
  'AddonsIcon', 'PlayIcon', 'InstallIcon', 'LinksIcon', 'OpenFolderIcon', 'InstallSizeIcon',
  'DesktopShortcutIcon', 'AddFavoritesIcon', 'RemoveFavoritesIcon', 'HideIcon', 'UnHideIcon', 'HdrIcon',
  'EditGameIcon', 'RemoveGameIcon', 'DiceIcon', 'ManualIcon', 'BackupIcon', 'RestoreBackupIcon'
];

// Slots that wear a tone colour on their accent: danger (red), gold (star), ok (green/lit).
export const TONES = {
  ExitIcon: 'danger',
  RemoveGameIcon: 'danger',
  AddFavoritesIcon: 'gold',
  RemoveFavoritesIcon: 'gold',
  PlayIcon: 'ok'
};

const f = (n) => Math.round(n * 100) / 100;
const pol = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

function gear(cx, cy, n, ro, ri, rh, tw = 0.17) {
  const step = (2 * Math.PI) / n;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i * step - Math.PI / 2;
    pts.push(
      pol(cx, cy, ri, a - tw * 1.95 * step),
      pol(cx, cy, ro, a - tw * step),
      pol(cx, cy, ro, a + tw * step),
      pol(cx, cy, ri, a + tw * 1.95 * step)
    );
  }
  const ring = 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';
  const hole = `M${f(cx + rh)} ${f(cy)}a${rh} ${rh} 0 1 0 ${f(-2 * rh)} 0a${rh} ${rh} 0 1 0 ${f(2 * rh)} 0z`;
  return `<path fill-rule="evenodd" d="${ring}${hole}"/>`;
}

function star(cx, cy, ro, ri, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) pts.push(pol(cx, cy, i % 2 ? ri : ro, -Math.PI / 2 + (i * Math.PI) / n));
  return `<path stroke-linejoin="round" d="M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z"/>`;
}

// Arc with a chunky arrowhead at its end. Angles in degrees, clockwise from east.
function arcArrow(cx, cy, r, a0, a1, cls = 'x') {
  const d2r = Math.PI / 180;
  const p0 = pol(cx, cy, r, a0 * d2r);
  const p1 = pol(cx, cy, r, a1 * d2r);
  const cw = a1 > a0;
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const th = a1 * d2r;
  const t = cw ? [-Math.sin(th), Math.cos(th)] : [Math.sin(th), -Math.cos(th)];
  const n = [-t[1], t[0]];
  const tip = [p1[0] + t[0] * 2.5, p1[1] + t[1] * 2.5];
  const base = [p1[0] - t[0] * 1.3, p1[1] - t[1] * 1.3];
  const w1 = [base[0] + n[0] * 3.4, base[1] + n[1] * 3.4];
  const w2 = [base[0] - n[0] * 3.4, base[1] - n[1] * 3.4];
  return `<path class="${cls}" d="M${f(p0[0])} ${f(p0[1])}A${r} ${r} 0 ${large} ${cw ? 1 : 0} ${f(p1[0])} ${f(p1[1])}"/>` +
    `<path class="a" d="M${f(tip[0])} ${f(tip[1])}L${f(w1[0])} ${f(w1[1])}L${f(w2[0])} ${f(w2[1])}Z"/>`;
}

const ARCS = arcArrow(12, 12, 8.2, 198, 332) + arcArrow(12, 12, 8.2, 18, 152);
const LOOP = arcArrow(12, 12, 8.2, 48, 326);
const CLOUD = '<path d="M7.2 19A4.8 4.8 0 0 1 6.6 9.5 6.1 6.1 0 0 1 18.4 10.4a4.3 4.3 0 0 1-.4 8.6z"/>';
const BOX = '<rect x="2.5" y="3.5" width="19" height="5.2" rx="1.5"/><path d="M4 8.7h16v10.6a1.6 1.6 0 0 1-1.6 1.7H5.6A1.6 1.6 0 0 1 4 19.3z"/>';
const HEART = '<path d="M12 21C4.5 15.6 2.5 12 2.5 8.6A4.8 4.8 0 0 1 7.3 3.8c1.9 0 3.6 1 4.7 2.6 1.1-1.6 2.8-2.6 4.7-2.6A4.8 4.8 0 0 1 21.5 8.6c0 3.4-2 7-9.5 12.4z"/>';
const EYE = '<path d="M2 12C4.7 7.1 8.2 5 12 5s7.3 2.1 10 7c-2.7 4.9-6.2 7-10 7S4.7 16.9 2 12z"/>';
const DIAMOND = '<path stroke-linejoin="round" d="M12 2.2l9.2 9.8-9.2 9.8L2.8 12z"/>';

export const GLYPHS = {
  FullscreenModeIcon: {
    // a: 4 rounded viewfinder brackets + bold center accent block
    a: { u: '', d: '<path class="o" d="M3.2 9V4.8A1.6 1.6 0 0 1 4.8 3.2H9M15 3.2h4.2a1.6 1.6 0 0 1 1.6 1.6V9M20.8 15v4.2a1.6 1.6 0 0 1-1.6 1.6H15M9 20.8H4.8a1.6 1.6 0 0 1-1.6-1.6V15"/><rect class="a" x="8.8" y="8.8" width="6.4" height="6.4" rx="1.1"/>' },
    // b: Wide display/monitor with stand and expand brackets inside
    b: { u: '<rect x="2.5" y="3.5" width="19" height="13.5" rx="2"/>', d: '<path class="o" d="M8 20.8h8M12 17v3.8"/><path class="x" d="M7.5 10.5V7.5h3M16.5 10v3h-3"/>' },
    // c: Bold diagonal opposing expand arrows
    c: { u: '', d: '<path class="o" d="M13.5 3.5h7v7M10.5 20.5h-7v-7"/><path class="x" d="M20 4l-6.8 6.8M4 20l6.8-6.8"/>' },
    // d: 4 outward corner arrowheads (bold solid)
    d: { u: '', d: '<path class="i" d="M3 3h6.8L3 9.8zM21 3h-6.8L21 9.8zM3 21h6.8L3 14.2zM21 21h-6.8L21 14.2z"/><path class="x" d="M5.5 5.5l4.3 4.3M18.5 5.5l-4.3 4.3M5.5 18.5l4.3-4.3M18.5 18.5l-4.3-4.3"/>' },
    // e: Sharp hollow L-corner viewfinder brackets (clean minimal/tech)
    e: { u: '', d: '<path class="o" d="M3 9.2V3h6.2M14.8 3H21v6.2M21 14.8V21h-6.2M9.2 21H3v-6.2"/><path class="x" d="M7.5 12h9M12 7.5v9"/>' },
    // f: Solid viewport window with bold expand corners
    f: { u: '<rect x="3" y="4" width="18" height="16" rx="2.5"/>', d: '<path class="x" d="M7 10.5V7.5h3M17 13.5v3h-3"/>' }
  },
  AddGameIcon: {
    // a: Game cartridge/box with bold +
    a: { u: '<rect x="3.5" y="2.5" width="17" height="19" rx="3"/>', d: '<path class="x" d="M12 7.5v9M7.5 12h9"/>' },
    // b: Chunky gamepad silhouette + corner +
    b: { u: '<path d="M6.8 8.8h10.4a5.2 5.2 0 0 1 5.2 5.2v.6a3.5 3.5 0 0 1-6 2.5L14.8 15.6H9.2L7.6 17.1a3.5 3.5 0 0 1-6-2.5V14a5.2 5.2 0 0 1 5.2-5.2z"/>', d: '<path class="o" d="M7.4 11.4v3.8M5.5 13.3h3.8"/><circle class="a" cx="15.5" cy="12.5" r="1.2"/><circle class="a" cx="18.2" cy="14.4" r="1.2"/><path class="x" d="M18.8 2.2v5.4M16.1 4.9h5.4"/>' },
    // c: Bold standalone solid + cross (fills entire 16px cleanly!)
    c: { u: '<path d="M9 2.5h6v6.5h6.5v6H15v6.5H9V15H2.5v-6H9z"/>', d: '<path class="x" d="M12 6v12M6 12h12"/>' },
    // d: Game disc with bold + corner
    d: { u: '<circle cx="11" cy="13" r="8.2"/>', d: '<circle class="o" cx="11" cy="13" r="2.6"/><path class="x" d="M18.5 2.5v6M15.5 5.5h6"/>' },
    // e: Faceted hex/gem crystal with bold +
    e: { u: '<path stroke-linejoin="round" d="M12 2.2l8.5 4.9v9.8L12 21.8l-8.5-4.9V7.1z"/>', d: '<path class="x" d="M12 7.8v8.4M7.8 12h8.4"/>' },
    // f: Library card / tab case with bold +
    f: { u: '<path d="M4 4.5h6l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5V19a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 19V6A1.5 1.5 0 0 1 4 4.5z"/>', d: '<path class="x" d="M12 10.2v7.2M8.4 13.8h7.2"/>' }
  },
  UpdateDbIcon: {
    // a: Two bold curved chasing sync arrows
    a: { u: '', d: ARCS },
    // b: Cloud with bold downward sync arrow
    b: { u: CLOUD, d: '<path class="x" d="M12 10v6.5M9.2 14l2.8 2.8 2.8-2.8"/>' },
    // c: Single 3/4 bold circular refresh arrow
    c: { u: '', d: LOOP },
    // d: Angular/octagonal chasing tech arrows
    d: { u: '', d: '<path class="o" d="M4 11V5.5L6.5 3h11L20 5.5V8M20 13v5.5L17.5 21h-11L4 18.5V16"/><path class="a" d="M16.6 6.2l3.4 3.6 3.4-3.6zM7.4 17.8L4 14.2.6 17.8z"/>' },
    // e: Paired opposing vertical sync arrows (chunky solid heads)
    e: { u: '', d: '<path class="o" d="M7.5 19V6.5"/><path class="a" d="M3.2 8.2L7.5 2.8l4.3 5.4z"/><path class="x" d="M16.5 5v12.5"/><path class="a" d="M12.2 15.8l4.3 5.4 4.3-5.4z"/>' },
    // f: Database stack with refresh arrow
    f: { u: '<path d="M4 6c0-1.9 3.6-3.2 8-3.2s8 1.3 8 3.2v12c0 1.9-3.6 3.2-8 3.2S4 19.9 4 18z"/>', d: '<path class="k" d="M4 6c0 1.8 3.6 3.1 8 3.1s8-1.3 8-3.1M4 12c0 1.8 3.6 3.1 8 3.1s8-1.3 8-3.1"/><path class="x" d="M12 11.2v6.2M9.4 15l2.6 2.6 2.6-2.6"/>' }
  },
  AboutPlayniteIcon: {
    // a: Bold circle with i
    a: { u: '<circle cx="12" cy="12" r="9.4"/>', d: '<path class="x" d="M12 10.8v6"/><circle class="a" cx="12" cy="7.4" r="1.45"/>' },
    // b: Speech bubble with i
    b: { u: '<path d="M3.5 4h17a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H12l-5.5 4.2V17H3.5A1.5 1.5 0 0 1 2 15.5v-10A1.5 1.5 0 0 1 3.5 4z"/>', d: '<path class="x" d="M12 9.5v4"/><circle class="a" cx="12" cy="6.8" r="1.3"/>' },
    // c: Bold standalone slab 'i' (huge and unmistakable at 16px!)
    c: { u: '<circle cx="12" cy="5.5" r="2.6"/><path d="M8.5 10.5h6v8.2h2.2v2.8H7.3v-2.8h2.2v-5.4H8.5z"/>', d: '<circle class="a" cx="12" cy="5.5" r="1.4"/>' },
    // d: Diamond sign with i
    d: { u: DIAMOND, d: '<path class="x" d="M12 11v5.2"/><circle class="a" cx="12" cy="7.8" r="1.35"/>' },
    // e: Tag / scroll plaque with i
    e: { u: '<path d="M5 2.8h14v18.4l-7-3.6-7 3.6z"/>', d: '<path class="x" d="M12 9.5v5"/><circle class="a" cx="12" cy="6.6" r="1.3"/>' },
    // f: Chamfered octagon / terminal plate with i
    f: { u: '<path d="M7.5 2.5h9L21.5 7.5v9l-5 5h-9l-5-5v-9z"/>', d: '<path class="x" d="M12 11v5.5"/><circle class="a" cx="12" cy="7.6" r="1.35"/>' }
  },
  ExitIcon: {
    // a: Open door frame + bold right exit arrow
    a: { u: '', d: '<path class="o" d="M10.5 3H5.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5"/><path class="x" d="M15.8 7.2L20.8 12l-5 4.8M20.5 12h-11"/>' },
    // b: Power button (open ring + vertical top stem)
    b: { u: '', d: '<path class="o" d="M6.6 5.8a8.5 8.5 0 1 0 10.8 0"/><path class="x" d="M12 2.4v8.6"/>' },
    // c: Bold standalone solid X cross
    c: { u: '<path d="M5.5 2.8L12 9.3l6.5-6.5 2.7 2.7L14.7 12l6.5 6.5-2.7 2.7L12 14.7l-6.5 6.5-2.7-2.7L9.3 12 2.8 5.5z"/>', d: '<path class="x" d="M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8"/>' },
    // d: Solid wood/metal door with handle + chunky red exit arrow (Questlog style!)
    d: { u: '<rect x="3" y="2.8" width="10.2" height="18.4" rx="1.5"/>', d: '<circle class="i" cx="10.5" cy="12" r="1.15"/><path class="x" d="M13 12h7.5"/><path class="a" d="M15.6 7.4L21.5 12l-5.9 4.6z"/>' },
    // e: Heavy vertical rail + chunky solid right arrow
    e: { u: '<rect x="3" y="3" width="3.6" height="18" rx="1"/>', d: '<path class="x" d="M9 12h9.5"/><path class="a" d="M14.5 6.2L21.8 12l-7.3 5.8z"/>' },
    // f: Cut-corner door frame + solid arrowhead exiting right
    f: { u: '', d: '<path class="o" d="M11 3H5.5L3 5.5v13L5.5 21H11"/><path class="a" d="M14.8 6.8L21.5 12l-6.7 5.2v-3.1H9.5V9.9h5.3z"/>' }
  },
  SettingsIcon: {
    // a: 8-tooth classic gear with bore
    a: { u: gear(12, 12, 8, 10.4, 7.8, 3.4, 0.17), d: '' },
    // b: 3 horizontal sliders with chunky accent knobs
    b: { u: '', d: '<path class="o" d="M2.8 6.5h9.5M18 6.5h3.2M2.8 12h3.2M11.8 12h9.4M2.8 17.5h10.4M18.6 17.5h2.6"/><circle class="a" cx="15.2" cy="6.5" r="2.6"/><circle class="a" cx="8.8" cy="12" r="2.6"/><circle class="a" cx="15.8" cy="17.5" r="2.6"/>' },
    // c: 6-tooth chunky heavy industrial cog with accent hub
    c: { u: gear(12, 12, 6, 10.6, 7.2, 3.6, 0.2), d: '<circle class="x" cx="12" cy="12" r="3.6"/>' },
    // d: Bold diagonal workshop wrench
    d: { u: '<path d="M19.8 7.5a5.5 5.5 0 0 1-7.4 5.1L6.2 18.8a2.2 2.2 0 0 1-3.1-3.1l6.2-6.2a5.5 5.5 0 0 1 7.1-7.1l-3.1 3.1 2.6 2.6 3.1-3.1c.5.8.8 1.6.8 2.5z"/>', d: '<circle class="a" cx="5" cy="17.3" r="1.2"/>' },
    // e: Heavy hex bolt/nut with inner bore
    e: { u: '<path fill-rule="evenodd" d="M12 2.2l8.8 5.1v9.4L12 21.8l-8.8-5.1V7.3zM16 12a4 4 0 1 0-8 0a4 4 0 1 0 8 0z"/>', d: '<circle class="x" cx="12" cy="12" r="4"/>' },
    // f: 10-tooth precision watchmaker gear with bright inner ring
    f: { u: gear(12, 12, 10, 10.4, 8.2, 3.2, 0.16), d: '<circle class="a" cx="12" cy="12" r="2.1"/>' }
  },
  AddonsIcon: {
    // a: Classic puzzle piece
    a: { u: '<rect x="3.5" y="8.5" width="14.5" height="12.5" rx="1.8"/><circle cx="10.8" cy="6.4" r="3.2"/><circle cx="18.6" cy="14.8" r="3.2"/>', d: '<circle class="a" cx="10.8" cy="14.8" r="1.8"/>' },
    // b: Isometric 3D cube with bold Y-seam
    b: { u: '<path stroke-linejoin="round" d="M12 2.4l8.8 4.8v9.6L12 21.6l-8.8-4.8V7.2z"/>', d: '<path class="x" d="M12 12l8.6-4.7M12 12L3.4 7.3M12 12v9.4"/>' },
    // c: Electric plug with prongs & cord
    c: { u: '<path d="M6.8 7.8h10.4v4.4a5.2 5.2 0 0 1-10.4 0z"/>', d: '<path class="x" d="M9.4 2.8v5M14.6 2.8v5"/><path class="o" d="M12 17.4v4"/>' },
    // d: 4-tile modular grid with popped accent tile
    d: { u: '<rect x="3" y="3" width="7.4" height="7.4" rx="1.4"/><rect x="3" y="13.6" width="7.4" height="7.4" rx="1.4"/><rect x="13.6" y="13.6" width="7.4" height="7.4" rx="1.4"/>', d: '<rect class="a" x="13.6" y="3" width="7.4" height="7.4" rx="1.4" transform="rotate(14 17.3 6.7)"/>' },
    // e: 2-stud building brick silhouette
    e: { u: '<rect x="2.5" y="8" width="19" height="12.5" rx="1.8"/><rect x="5.2" y="4" width="5" height="4.5" rx="1"/><rect x="13.8" y="4" width="5" height="4.5" rx="1"/>', d: '<path class="x" d="M6 14.2h12"/>' },
    // f: Large 4-point arcane star + satellite spark
    f: { u: '<path stroke-linejoin="round" d="M11 2.2l2.6 6.8 6.8 2.6-6.8 2.6L11 21l-2.6-6.8-6.8-2.6 6.8-2.6z"/>', d: '<path class="a" d="M18.8 2.5l1.1 2.6 2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6-2.6-1.1 2.6-1.1z"/>' }
  },
  PlayIcon: {
    a: { u: '<path stroke-linejoin="round" d="M6.5 4.2v15.6a1.1 1.1 0 0 0 1.7.9l12-7.8a1.1 1.1 0 0 0 0-1.8l-12-7.8a1.1 1.1 0 0 0-1.7.9z"/>', d: '<path class="a" stroke-linejoin="round" d="M9.2 8.2v7.6l6.2-3.8z"/>' },
    b: { u: '<circle cx="12" cy="12" r="9.5"/>', d: '<path class="a" stroke-linejoin="round" d="M9.6 7.4v9.2L17 12z"/>' },
    c: { u: '', d: '<path class="a" stroke-linejoin="round" d="M3.5 4.8v14.4L12.5 12zM12 4.8v14.4L21 12z"/>' },
    d: { u: '<path stroke-linejoin="round" d="M5 3.5L21 12 5 20.5l3.5-8.5z"/>', d: '<path class="a" stroke-linejoin="round" d="M8.5 8.5l8 3.5-8 3.5 1.8-3.5z"/>' }
  },
  InstallIcon: {
    a: { u: '', d: '<path class="o" d="M3.5 19.8h17M3.5 16.5v3.3M20.5 16.5v3.3"/><path class="x" d="M12 3.2v11.5"/><path class="a" d="M6.8 10.6L12 16.2l5.2-5.6z"/>' },
    b: { u: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/>', d: '<path class="x" d="M12 7.5v7.5M8.2 12l3.8 3.8 3.8-3.8"/>' },
    c: { u: '<path d="M9.2 2.8h5.6v7.4h4.4L12 17.6 4.8 10.2h4.4z"/>', d: '<path class="x" d="M3.5 20.5h17"/>' }
  },
  LinksIcon: {
    a: { u: '', d: '<path class="o" d="M9.8 14.2a4.3 4.3 0 0 0 6.1 0l3.2-3.2a4.3 4.3 0 0 0-6.1-6.1l-1.1 1.1"/><path class="x" d="M14.2 9.8a4.3 4.3 0 0 0-6.1 0l-3.2 3.2a4.3 4.3 0 0 0 6.1 6.1l1.1-1.1"/>' },
    b: { u: '<circle cx="12" cy="12" r="9.4"/>', d: '<path class="k" d="M2.6 12h18.8M12 2.6c-3.4 3.2-3.4 15.6 0 18.8M12 2.6c3.4 3.2 3.4 15.6 0 18.8"/>' },
    c: { u: '', d: '<path class="o" d="M13 6l4-3 4 4-3 4M11 18l-4 3-4-4 3-4"/><path class="x" d="M8.5 15.5l7-7"/>' }
  },
  OpenFolderIcon: {
    a: { u: '<path d="M2.5 6.5a2 2 0 0 1 2-2h5l2.2 2.6h7.8a2 2 0 0 1 2 2V18.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2z"/>', d: '<path class="x" d="M2.5 10.5h19"/>' },
    b: { u: '<path d="M2.8 6a2 2 0 0 1 2-2h4.4l2 2.2h6.8a1.8 1.8 0 0 1 1.8 1.8V10H2.8z"/><path d="M1.8 10.5h20.4l-2.1 8.8a1.7 1.7 0 0 1-1.6 1.4H5.5a1.7 1.7 0 0 1-1.6-1.4z"/>', d: '' }
  },
  InstallSizeIcon: {
    a: { u: '<rect x="2.5" y="6.2" width="19" height="11.6" rx="2.5"/>', d: '<path class="o" d="M6.5 12h6.5"/><circle class="a" cx="17.6" cy="12" r="1.5"/>' },
    b: { u: '<path d="M4.2 5.8c0-1.8 3.5-3.2 7.8-3.2s7.8 1.4 7.8 3.2v12.4c0 1.8-3.5 3.2-7.8 3.2s-7.8-1.4-7.8-3.2z"/>', d: '<path class="k" d="M4.2 5.8c0 1.8 3.5 3.2 7.8 3.2s7.8-1.4 7.8-3.2M4.2 12c0 1.8 3.5 3.2 7.8 3.2s7.8-1.4 7.8-3.2"/>' },
    c: { u: '<rect x="3" y="13.5" width="4.4" height="7.5" rx="1"/><rect x="9.8" y="8.5" width="4.4" height="12.5" rx="1"/><rect x="16.6" y="3.5" width="4.4" height="17.5" rx="1"/>', d: '' }
  },
  DesktopShortcutIcon: {
    a: { u: '<rect x="3" y="3" width="18" height="18" rx="2.8"/>', d: '<path class="x" d="M8.5 15.5l7-7M9.5 8.5h6v6"/>' },
    b: { u: '<rect x="2.5" y="3.5" width="19" height="13" rx="2"/>', d: '<path class="o" d="M8 20.5h8M12 16.5v4"/><path class="x" d="M9 12.8l5.8-5.8M9.8 7h5v5"/>' }
  },
  AddFavoritesIcon: {
    a: { u: star(12, 12.6, 10.4, 4.6), d: '<path class="a" d="M12 6.8l1.6 3.5 3.8.5-2.8 2.6.7 3.8L12 15.4l-3.3 1.8.7-3.8-2.8-2.6 3.8-.5z"/>' },
    b: { u: HEART, d: '<circle class="a" cx="9" cy="9.2" r="1.8"/>' },
    c: { u: DIAMOND, d: '<path class="a" d="M12 6.5l4.8 5.5-4.8 5.5L7.2 12z"/>' }
  },
  RemoveFavoritesIcon: {
    a: { u: star(12, 12.6, 10.4, 4.6), d: '<path class="x" d="M4 4l16 16"/>', hollow: true },
    b: { u: HEART, d: '<path class="x" d="M4 4l16 16"/>', hollow: true },
    c: { u: DIAMOND, d: '<path class="x" d="M4 4l16 16"/>', hollow: true }
  },
  HideIcon: {
    a: { u: EYE, d: '<circle class="i" cx="12" cy="12" r="3"/><path class="x" d="M4 4l16 16"/>' },
    b: { u: '', d: '<path class="o" d="M2.5 10.5C5.2 14.8 8.4 16.5 12 16.5s6.8-1.7 9.5-6"/><path class="x" d="M6.2 14.8l-1.8 3.2M12 16.5v3.5M17.8 14.8l1.8 3.2"/>' }
  },
  UnHideIcon: {
    a: { u: EYE, d: '<circle class="a" cx="12" cy="12" r="3.1"/>' },
    b: { u: '<path d="M2 12L12 4.5 22 12 12 19.5z"/>', d: '<circle class="a" cx="12" cy="12" r="3.2"/>' }
  },
  HdrIcon: {
    a: { u: '<circle cx="12" cy="12" r="4.8"/>', d: '<path class="x" d="M12 2v3.2M12 18.8V22M2 12h3.2M18.8 12H22M4.9 4.9l2.3 2.3M16.8 16.8l2.3 2.3M19.1 4.9l-2.3 2.3M7.2 16.8l-2.3 2.3"/>' },
    b: { u: star(12, 12, 10.4, 5.2, 8), d: '<circle class="a" cx="12" cy="12" r="3.2"/>' }
  },
  EditGameIcon: {
    a: { u: '<path stroke-linejoin="round" d="M3.2 20.8l1.2-5L16.5 3.6a2.2 2.2 0 0 1 3.1 0l.8.8a2.2 2.2 0 0 1 0 3.1L8.2 19.6z"/>', d: '<path class="x" d="M14.2 5.8l4 4"/>' },
    b: { u: '<path d="M4.5 3h10.5l4.5 4.5V21H4.5z"/>', d: '<path class="x" d="M8 11h8M8 14.5h8M8 18h4.5"/>' }
  },
  RemoveGameIcon: {
    a: { u: '<path d="M5.5 7.5h13l-1.1 12.6a1.6 1.6 0 0 1-1.6 1.4H8.2a1.6 1.6 0 0 1-1.6-1.4z"/>', d: '<path class="o" d="M3.2 5.6h17.6M9.2 5.6V3.2h5.6v2.4"/><path class="x" d="M9.8 11v6.5M14.2 11v6.5"/>' },
    b: { u: '<circle cx="12" cy="12" r="9.4"/>', d: '<path class="x" d="M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6"/>' }
  },
  DiceIcon: {
    // a: Rounded 5-pip die (D6)
    a: { u: '<rect x="3" y="3" width="18" height="18" rx="3.6"/>', d: '<circle class="a" cx="7.8" cy="7.8" r="1.65"/><circle class="a" cx="16.2" cy="7.8" r="1.65"/><circle class="a" cx="12" cy="12" r="1.65"/><circle class="a" cx="7.8" cy="16.2" r="1.65"/><circle class="a" cx="16.2" cy="16.2" r="1.65"/>' },
    // b: Faceted D20 / icosahedron
    b: { u: '<path stroke-linejoin="round" d="M12 2l8.8 5v10L12 22l-8.8-5V7z"/>', d: '<path class="x" d="M12 7.5l-4.5 7.5h9z"/><path class="k" d="M12 7.5V2M7.5 15l-4.3 2M16.5 15l4.3 2"/>' },
    // c: Playing card with central diamond suit
    c: { u: '<rect x="4.8" y="2.5" width="14.4" height="19" rx="2.4"/>', d: '<path class="a" d="M12 7l3.4 5-3.4 5-3.4-5z"/>' },
    // d: Bold crossed shuffle arrows
    d: { u: '', d: '<path class="o" d="M3 17.5h3.5l8-11h5"/><path class="a" d="M16.8 3.2L21.8 6.5l-5 3.3z"/><path class="x" d="M3 6.5h3.5l8 11h5"/><path class="a" d="M16.8 14.2l5 3.3-5 3.3z"/>' },
    // e: Tilted diamond 3-pip die
    e: { u: DIAMOND, d: '<circle class="a" cx="12" cy="8.2" r="1.55"/><circle class="a" cx="12" cy="12" r="1.55"/><circle class="a" cx="12" cy="15.8" r="1.55"/>' },
    // f: Bold standalone mystery ? mark
    f: { u: '', d: '<path class="o" d="M7.6 8.2a4.6 4.6 0 1 1 6.7 4c-1.5.8-2.3 1.5-2.3 3.1v.7"/><circle class="a" cx="12" cy="19.6" r="2.1"/>' }
  },
  ManualIcon: {
    a: { u: '<path d="M4.5 4A1.6 1.6 0 0 1 6.1 2.5H19.5v16H6.1A1.6 1.6 0 0 0 4.5 20zM4.5 20a1.6 1.6 0 0 0 1.6 1.5H19.5v-3"/>', d: '<path class="x" d="M8.8 7.2h6.8M8.8 11h6.8"/>' },
    b: { u: '<path d="M12 6C9.3 4.2 6.2 3.8 3 4.4v14.2c3.2-.6 6.3 0 9 1.9 2.7-1.9 5.8-2.5 9-1.9V4.4c-3.2-.6-6.3-.2-9 1.6z"/>', d: '<path class="x" d="M12 6v14.5"/>' }
  },
  BackupIcon: {
    a: { u: BOX, d: '<path class="x" d="M12 18v-6.2M9.2 14.3l2.8-2.8 2.8 2.8"/>' },
    b: { u: CLOUD, d: '<path class="x" d="M12 17.2v-6.5M9.2 13.4l2.8-2.8 2.8 2.8"/>' },
    c: { u: '<path d="M3.5 3.5h13.5l3.5 3.5v13.5H3.5z"/>', d: '<rect class="a" x="7" y="3.5" width="7.5" height="5.5"/><rect class="o" x="7" y="13" width="10" height="7.5"/>' }
  },
  RestoreBackupIcon: {
    a: { u: BOX, d: '<path class="x" d="M12 11.8V18M9.2 15.5l2.8 2.8 2.8-2.8"/>' },
    b: { u: '', d: '<path class="a" stroke-linejoin="round" d="M11.6 4.8v14.4L2.8 12zM21.2 4.8v14.4L12.4 12z"/>' }
  }
};
