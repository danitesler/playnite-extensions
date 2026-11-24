// Composes one bare, full-frame 24x24 SVG per menu icon slot from a theme recipe (src/themes/<Theme>/art/menu-icons.json).
// Pure icon styling ONLY — never a background badge/plate.
// When a recipe pairs a dark outline ink with a brighter filled body, open-stroke icons (.o, .k, hollow silhouettes,
// and standalone .i fills) automatically render double-layered (dark ink outer outline + bright body core) so every icon
// stays bold and legible on both dark and light menu plates at 15-16px.
import { GLYPHS, SLOTS, TONES } from './menu-icon-kit.mjs';

const SLOT_INDEX = Object.fromEntries(SLOTS.map((s, i) => [s, i]));
const num = (v) => Math.round(v * 1000) / 1000;

function hexLum(hex) {
  if (typeof hex !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(hex)) return 0.5;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function avgLum(v) {
  if (!v) return 0;
  if (Array.isArray(v)) return v.reduce((s, c) => s + hexLum(c), 0) / v.length;
  return hexLum(v);
}

function paint(id, v, y1 = 2, y2 = 22, angle = 'v') {
  if (!v) return { ref: 'none', def: '' };
  if (Array.isArray(v)) {
    const stops = v.map((c, idx) => {
      const off = v.length === 1 ? 0 : idx / (v.length - 1);
      return `<stop offset="${num(off)}" stop-color="${c}"/>`;
    }).join('');
    const coords = angle === 'd'
      ? `x1="${y1}" y1="${y1}" x2="${y2}" y2="${y2}"`
      : `x1="0" y1="${y1}" x2="0" y2="${y2}"`;
    return { ref: `url(#${id})`, def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" ${coords}>${stops}</linearGradient>` };
  }
  return { ref: v, def: '' };
}

function finishMarkup(id, kind, c, op) {
  const o = op !== undefined ? op : null;
  switch (kind) {
    case 'gloss':
      return `<ellipse cx="12" cy="5.2" rx="10.5" ry="5.6" fill="${c || '#ffffff'}" opacity="${o ?? 0.34}"/>`;
    case 'bevel':
      return `<path d="M0 0h24v12H0z" fill="${c || '#ffffff'}" opacity="${o ?? 0.22}"/>` +
        `<path d="M0 14h24v10H0z" fill="#000000" opacity="${(o ?? 0.22) * 0.85}"/>`;
    case 'split':
      return `<path d="M0 0h24L0 24z" fill="${c || '#ffffff'}" opacity="${o ?? 0.24}"/>` +
        `<path d="M24 0v24H0z" fill="#000000" opacity="${(o ?? 0.24) * 0.7}"/>`;
    case 'stripe':
      return `<path d="M-2 15L15 -2h5.2L-2 20.2z" fill="${c || '#ffffff'}" opacity="${o ?? 0.3}"/>`;
    case 'scan':
      return Array.from({ length: 8 }, (_, i) =>
        `<path d="M0 ${2.5 + i * 2.8}h24" stroke="${c || '#000000'}" stroke-width="0.95" opacity="${o ?? 0.26}"/>`
      ).join('');
    case 'halftone': {
      let s = '';
      for (let y = 12.5; y < 23; y += 2.6) {
        for (let x = ((y - 12.5) / 2.6) % 2 ? 1.3 : 0; x < 24; x += 2.6) {
          const r = 0.38 + ((y - 12) / 12) * 0.45;
          s += `<circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}" fill="${c || '#000000'}" opacity="${o ?? 0.32}"/>`;
        }
      }
      return s;
    }
    case 'grain':
      return `<rect x="0" y="0" width="24" height="24" filter="url(#${id}_grain)" opacity="${o ?? 0.45}"/>`;
    default:
      return '';
  }
}

export function composeIcon(recipe, slot) {
  const R = recipe;
  if (R.badge) {
    throw new Error(`Background badges are forbidden (${slot}). Style the bare icon itself (docs/themes/menu-icons.md).`);
  }
  const gl = R.glyph || {};
  const over = (R.slots && R.slots[slot]) || {};
  const variant = over.v || (R.pick && R.pick[slot]) || 'a';
  const g = GLYPHS[slot] && (GLYPHS[slot][variant] || GLYPHS[slot].a);
  if (!g) throw new Error(`No glyph for ${slot}/${variant}`);
  const id = (s) => `${slot}_${s}`;

  const mode = R.mode || 'duotone';
  let ink = over.ink || gl.ink || '#ffffff';
  let acc = over.acc || gl.acc || ink;
  let body = over.body !== undefined ? over.body : (mode === 'line' ? null : gl.body);
  let halo = over.halo !== undefined ? over.halo : R.halo;
  let echo = R.echo || null;

  const idx = SLOT_INDEX[slot];
  if (R.cycle) {
    const c = R.cycle;
    if (c.acc) acc = c.acc[idx % c.acc.length];
    if (c.ink) ink = c.ink[idx % c.ink.length];
    if (c.body) body = c.body[idx % c.body.length];
  }
  const tone = TONES[slot];
  if (tone && R.tones && R.tones[tone]) acc = R.tones[tone];
  const ts = tone && R.toneStyles && R.toneStyles[tone];
  if (ts) {
    if (ts.acc) acc = ts.acc;
    if (ts.ink) ink = ts.ink;
    if (ts.body !== undefined) body = ts.body;
    if (ts.halo !== undefined) halo = ts.halo;
    if (ts.echo !== undefined) echo = ts.echo;
  }

  const gs = R.gs !== undefined ? R.gs : 0.94;
  const sw = gl.sw || 2.0;
  const w = num(sw / gs);
  const defs = [];

  const angle = R.gradAngle || 'v';
  const bp = paint(id('body'), mode === 'cutout' ? ink : body, 2, 22, angle);
  const ip = paint(id('ink'), ink, 2, 22, angle);
  const ap = paint(id('acc'), acc, 2, 22, angle);
  if (bp.def) defs.push(bp.def);
  if (ip.def) defs.push(ip.def);
  if (ap.def) defs.push(ap.def);

  // Detect outlined-filled icon style (dark ink framing a brighter body fill):
  // open-stroke icons and hollow silhouettes then draw dark ink outer outline + bright body core stroke!
  const outlinedBody = Boolean(mode !== 'line' && mode !== 'cutout' && body && avgLum(body) > avgLum(ink) + 0.12);

  const finishes = R.finish ? (Array.isArray(R.finish) ? R.finish : [R.finish]) : [];
  if (finishes.includes('grain')) {
    defs.push(`<filter id="${id('fin')}_grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.05" numOctaves="2" seed="5"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.4 -.45" result="n"/><feFlood flood-color="${R.finishC || '#000'}"/><feComposite in2="n" operator="in"/></filter>`);
  }

  let glyphDefs = '';
  if (g.u) {
    glyphDefs += `<g id="${id('U')}">${g.u}</g>`;
    glyphDefs += `<mask id="${id('M')}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="40" height="40"><rect x="-8" y="-8" width="40" height="40" fill="#fff"/><use href="#${id('U')}" fill="#000" stroke="none"/></mask>`;
    if (finishes.length && !g.hollow && bp.ref !== 'none') {
      glyphDefs += `<mask id="${id('FM')}" maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32"><use href="#${id('U')}" fill="#fff" stroke="none"/></mask>`;
    }
  }

  const ringMult = mode === 'solid' ? 1.25 : (mode === 'cutout' ? 0.9 : 1.75);
  const hasBody = Boolean(g.u && !g.hollow && bp.ref !== 'none');
  const finishLayer = (hasBody && finishes.length)
    ? `<g mask="url(#${id('FM')})">${finishes.map((fn) => finishMarkup(id('fin'), fn, R.finishC, R.finishOpacity)).join('')}</g>`
    : '';

  const uBase = g.u
    ? (g.hollow && outlinedBody
      ? `<use href="#${id('U')}" class="hollow-out"/><use href="#${id('U')}" class="hollow-in"/>`
      : `<g mask="url(#${id('M')})"><use href="#${id('U')}" class="ring"/></g>` + (hasBody ? `<use href="#${id('U')}" class="body"/>` : ''))
    : '';

  const dLayer = (outlinedBody && g.d)
    ? `<g class="d-out">${g.d}</g><g class="${g.u ? 'd-in-u' : 'd-in'}">${g.d}</g>`
    : g.d;

  const baseInner = uBase + (outlinedBody && g.d ? `<g class="d-out">${g.d}</g>` : g.d);
  const fgInner = uBase + finishLayer + dLayer;

  glyphDefs += `<g id="${id('S')}">${baseInner}</g>`;

  // Build pure icon transform (centered at 12,12)
  const dx = R.glyphDx || 0;
  const dy = R.glyphDy || 0;
  const tf = R.transform || {};
  const parts = [`translate(${num(12 + dx)} ${num(12 + dy)})`];
  if (tf.rotate) parts.push(`rotate(${tf.rotate})`);
  if (tf.skewX) parts.push(`skewX(${tf.skewX})`);
  const sx = num(gs * (tf.scaleX || 1));
  const sy = num(gs * (tf.scaleY || 1));
  parts.push(`scale(${sx} ${sy})`, 'translate(-12 -12)');
  const gt = parts.join(' ');

  let glyph = '';
  if (echo) {
    const ec = echo.c || '#00f0ff';
    const eop = echo.opacity !== undefined ? echo.opacity : 0.72;
    glyph += `<use href="#${id('S')}" opacity="${eop}" transform="translate(${num((echo.dx || 1.4) / gs)} ${num((echo.dy || 0.7) / gs)})" style="--ink:${ec};--body:${ec};--acc:${ec};--hs:${ec}"/>`;
  }
  if (R.shadow) {
    const s = R.shadow;
    glyph += `<use href="#${id('S')}" transform="translate(${num(s.dx / gs)} ${num(s.dy / gs)})" style="--ink:${s.c};--body:${s.c};--acc:${s.c};--hs:${s.c}"/>`;
  }
  if (halo) {
    const hw = num(halo.w / gs);
    glyph += `<use href="#${id('S')}" style="--ink:${halo.c};--body:${halo.c};--acc:${halo.c};--hs:${halo.c};--w:${num(w + hw)};--aw:${num(hw + 0.5 / gs)};--dash:none"/>`;
  }
  glyph += `<g>${fgInner}</g>`;

  if (R.fx && R.fx.includes('glow')) {
    const sd = R.glow || 0.9;
    defs.push(`<filter id="${id('glow')}" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
    glyph = `<g filter="url(#${id('glow')})">${glyph}</g>`;
  }

  let body2 = `<g transform="${gt}">${glyph}</g>`;
  if (R.fx && R.fx.includes('rough')) {
    defs.push(`<filter id="${id('rough')}" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency="${R.roughFreq || 0.30}" numOctaves="2" seed="${R.roughSeed || 4}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${R.roughScale || 1.05}" xChannelSelector="R" yChannelSelector="G"/></filter>`);
    body2 = `<g filter="url(#${id('rough')})">${body2}</g>`;
  }

  const dash = R.stencil ? (typeof R.stencil === 'string' ? R.stencil : '5.2 1.9') : 'none';
  const css =
    '.o{fill:none;stroke:var(--ink);stroke-width:var(--w);stroke-linecap:var(--cap);stroke-linejoin:var(--join);stroke-dasharray:var(--dash)}' +
    '.x{fill:none;stroke:var(--acc);stroke-width:var(--w);stroke-linecap:var(--cap);stroke-linejoin:var(--join)}' +
    '.k{fill:none;stroke:var(--ink);stroke-width:calc(var(--w)*.62);stroke-linecap:var(--cap);stroke-linejoin:var(--join)}' +
    '.a{fill:var(--acc);stroke:var(--hs,var(--acc));stroke-width:var(--aw);stroke-linejoin:round}' +
    '.i{fill:var(--ink);stroke:var(--hs,var(--ink));stroke-width:var(--aw);stroke-linejoin:round}' +
    `.ring{fill:var(--ink);stroke:var(--ink);stroke-width:calc(var(--w)*${ringMult});stroke-linejoin:var(--join);stroke-linecap:var(--cap);stroke-dasharray:var(--dash)}` +
    '.body{fill:var(--body);stroke:none}' +
    '.hollow-out{fill:none;stroke:var(--ink);stroke-width:calc(var(--w)*1.85);stroke-linejoin:var(--join);stroke-linecap:var(--cap)}' +
    '.hollow-in{fill:none;stroke:var(--body);stroke-width:calc(var(--w)*.92);stroke-linejoin:var(--join);stroke-linecap:var(--cap)}' +
    '.d-out .o{stroke:var(--ink);stroke-width:calc(var(--w)*1.85)}' +
    '.d-out .x{stroke:var(--ink);stroke-width:calc(var(--w)*1.75)}' +
    '.d-out .k{stroke:var(--ink);stroke-width:calc(var(--w)*1.15)}' +
    '.d-out .a,.d-out .i{fill:var(--ink);stroke:var(--ink);stroke-width:calc(var(--w)*.95)}' +
    '.d-in .o{stroke:var(--body);stroke-width:calc(var(--w)*1.0)}' +
    '.d-in .k{stroke:var(--body);stroke-width:calc(var(--w)*.58)}' +
    '.d-in .i{fill:var(--body);stroke:var(--body);stroke-width:var(--aw)}' +
    '.d-in-u .o{stroke:var(--body);stroke-width:calc(var(--w)*1.0)}' +
    '.d-in-u .k{stroke:var(--ink);stroke-width:calc(var(--w)*.55)}';

  const rootVars = `--ink:${ip.ref};--acc:${ap.ref};--body:${bp.ref};--w:${w};--aw:${num(0.45 / gs)};--cap:${gl.cap || 'round'};--join:${gl.join || 'round'};--dash:${dash}`;
  const shapeRend = R.pixel ? ' shape-rendering="crispEdges"' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"${shapeRend} style="${rootVars}"><style>${css}</style><defs>${defs.join('')}${glyphDefs}</defs>${body2}</svg>`;
}
