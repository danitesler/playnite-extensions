#!/usr/bin/env node
// Renders a theme's 24 main-menu / context-menu item icons from its recipe and wires them into Media.xaml.
//   node scripts/render-menu-icons.mjs <Theme> [<Theme> ...]   render those themes (folder names under src/themes)
//   node scripts/render-menu-icons.mjs --all                     every theme that has art/menu-icons.json
//   --sheet                                                      also write review sheets to .docs-local/menu-icon-sheets/
//   --check                                                      verify files, Media.xaml wiring, pure-icon rules and cross-theme uniqueness; renders nothing
// Recipe: src/themes/<Theme>/art/menu-icons.json (schema in scripts/lib/menu-icon-compose.mjs, rules in docs/themes/menu-icons.md).
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { launchBrowser } from './lib/chrome.mjs';
import { SLOTS } from './lib/menu-icon-kit.mjs';
import { composeIcon } from './lib/menu-icon-compose.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themesDir = path.join(root, 'src', 'themes');
const BEGIN = '<!-- MENU-ICONS:BEGIN (art/menu-icons.json via scripts/render-menu-icons.mjs) -->';
const END = '<!-- MENU-ICONS:END -->';
const fileOf = (slot) => slot.replace(/Icon$/, '') + '.png';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
let names = args.filter((a) => !a.startsWith('--'));
if (flags.has('--all')) names = fs.readdirSync(themesDir).filter((n) => fs.existsSync(path.join(themesDir, n, 'art', 'menu-icons.json')));
if (!names.length && !flags.has('--check')) { console.error('Name a theme folder (or --all).'); process.exit(2); }

const recipePath = (t) => path.join(themesDir, t, 'art', 'menu-icons.json');
const loadRecipe = (t) => JSON.parse(fs.readFileSync(recipePath(t), 'utf8').replace(/^\uFEFF/, ''));

// Pixel recipes ship as BitmapImage resources carrying NearestNeighbor: Playnite copies a BitmapImage resource's
// RenderOptions.BitmapScalingMode onto the menu Image, while a <sys:String> path is always drawn HighQuality, which
// smears pixel art at 125% and 175% display scaling. Smooth recipes keep the <sys:String> path.
function mediaLine(slot, dir, pixel) {
  const rel = `Images/${dir}/${fileOf(slot)}`;
  return pixel
    ? `    <BitmapImage x:Key="${slot}" UriSource="{ThemeFile '${rel}'}" CacheOption="OnLoad" RenderOptions.BitmapScalingMode="NearestNeighbor" />`
    : `    <sys:String x:Key="${slot}">${rel}</sys:String>`;
}

function updateMedia(theme, dir, pixel) {
  const p = path.join(themesDir, theme, 'src', 'Media.xaml');
  let text = fs.readFileSync(p, 'utf8'); const bom = text.startsWith('\uFEFF'); if (bom) text = text.slice(1);
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const keys = new Set(SLOTS);
  const keyRe = /^\s*<(TextBlock|sys:String|ContentControl|Image|BitmapImage)\s+x:Key="([A-Za-z]+Icon)"/;
  const block = [`    ${BEGIN}`, ...SLOTS.map((s) => mediaLine(s, dir, pixel)), `    ${END}`];
  let insertAt = -1; const kept = []; let skipping = false;
  for (const line of lines) {
    if (line.includes('MENU-ICONS:BEGIN')) { skipping = true; insertAt = kept.length; continue; }
    if (line.includes('MENU-ICONS:END')) { skipping = false; continue; }
    if (skipping) continue;
    if (/Playnite menu icons: omit local Foreground/.test(line)) continue; // describes the stock icofont icons being replaced
    const m = keyRe.exec(line);
    if (m && keys.has(m[2]) && /\/>\s*$|<\/(TextBlock|sys:String|ContentControl|BitmapImage)>\s*$/.test(line)) { if (insertAt < 0) insertAt = kept.length; continue; }
    kept.push(line);
  }
  const closeAt = kept.findIndex((l) => /<\/ResourceDictionary>/.test(l));
  if (closeAt < 0) throw new Error(`${theme}: Media.xaml has no </ResourceDictionary>`);
  if (insertAt < 0 || insertAt > closeAt) insertAt = closeAt;
  kept.splice(insertAt, 0, ...block);
  let out = kept.join(eol);
  if (!/xmlns:sys=/.test(out)) out = out.replace(/<ResourceDictionary\b/, '<ResourceDictionary xmlns:sys="clr-namespace:System;assembly=mscorlib"');
  fs.writeFileSync(p, (bom ? '\uFEFF' : '') + out);
}

async function renderTheme(browser, theme) {
  const recipe = loadRecipe(theme); const dir = recipe.dir;
  if (!dir) throw new Error(`${theme}: recipe needs "dir"`);
  if (recipe.badge) throw new Error(`${theme}: background badges are forbidden (docs/themes/menu-icons.md)`);
  const outDir = path.join(themesDir, theme, 'src', 'Images', dir); fs.mkdirSync(outDir, { recursive: true });
  const pix = recipe.pixel ? Math.max(12, Math.min(24, Number(recipe.pixel) || 16)) : 0;
  // Smooth sets are 48px (3x of 16). Pixel sets are a whole multiple of their grid (16 -> 48, 20 -> 60, 24 -> 48) so every
  // art pixel is an even block that NearestNeighbor scaling keeps sharp.
  const cs = pix ? pix * Math.ceil(48 / pix) : 48;

  const cells = SLOTS.map((s, i) => {
    const svg = composeIcon(recipe, s);
    return `<div class="c" id="c-${s}" style="left:${(i % 6) * cs}px;top:${Math.floor(i / 6) * cs}px">${svg}</div>`;
  }).join('');

  const page = await browser.newPage({ viewport: { width: 6 * cs, height: 4 * cs }, deviceScaleFactor: 1 });
  if (pix) {
    // Render each SVG onto a tiny pixel-grid canvas then nearest-neighbor upscale to cs x cs (a whole multiple).
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}.c{position:absolute;width:${cs}px;height:${cs}px}canvas{display:block;width:${cs}px;height:${cs}px;image-rendering:pixelated}</style><body>${cells}</body>`);
    await page.evaluate(async ([p, cs]) => {
      const divs = [...document.querySelectorAll('.c')];
      for (const div of divs) {
        const svgEl = div.querySelector('svg');
        const xml = new XMLSerializer().serializeToString(svgEl);
        const img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        const small = document.createElement('canvas'); small.width = p; small.height = p;
        const sctx = small.getContext('2d');
        sctx.drawImage(img, 0, 0, p, p);
        // Quantize alpha so pixel edges stay crisp (no muddy semi-transparent fringe)
        const idata = sctx.getImageData(0, 0, p, p);
        for (let k = 0; k < idata.data.length; k += 4) {
          idata.data[k + 3] = idata.data[k + 3] >= 96 ? 255 : 0;
        }
        sctx.putImageData(idata, 0, 0);
        const big = document.createElement('canvas'); big.width = cs; big.height = cs;
        const bctx = big.getContext('2d');
        bctx.imageSmoothingEnabled = false;
        bctx.drawImage(small, 0, 0, cs, cs);
        div.innerHTML = '';
        div.appendChild(big);
      }
    }, [pix, cs]);
  } else {
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}.c{position:absolute;width:48px;height:48px}svg{display:block}</style><body>${cells}</body>`);
  }
  for (const s of SLOTS) await page.screenshot({ path: path.join(outDir, fileOf(s)), omitBackground: true, selector: `#c-${s}` });
  await page.close();
  updateMedia(theme, dir, pix > 0);
  return recipe;
}

async function sheet(browser, themes, label) {
  const dataUri = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  let rows = '';
  for (const t of themes) {
    const r = loadRecipe(t); const rest = (r.plates && r.plates.rest) || '#1b1b1b'; const hover = (r.plates && r.plates.hover) || '#4a4a4a';
    const imgs = SLOTS.map((s) => dataUri(path.join(themesDir, t, 'src', 'Images', r.dir, fileOf(s))));
    rows += `<div class="row"><div class="n">${t}</div>` +
      `<div class="s" style="background:${rest}">${imgs.map((u) => `<img class="big" src="${u}">`).join('')}</div>` +
      `<div class="s" style="background:${rest}">${imgs.map((u) => `<img class="sm" src="${u}">`).join('')}</div>` +
      `<div class="s" style="background:${hover}">${imgs.map((u) => `<img class="sm" src="${u}">`).join('')}</div></div>`;
  }
  const w = 118 + 24 * 36 + 12 + 24 * 22 + 12 + 24 * 22 + 24;
  const page = await browser.newPage({ viewport: { width: w, height: themes.length * 46 + 12 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#101010;font:12px Segoe UI,Arial;color:#ddd}.row{display:flex;align-items:center;height:46px;gap:6px}.n{width:110px;padding-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.s{display:flex;align-items:center;padding:0 4px;height:42px}img.big{width:32px;height:32px;margin:0 2px}img.sm{width:16px;height:16px;margin:0 3px}</style><body>${rows}</body>`);
  const outDir = path.join(root, '.docs-local', 'menu-icon-sheets'); fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${label}.png`);
  await page.screenshot({ path: file });
  await page.close();
  return file;
}

// Minimal PNG reader (8-bit, non-interlaced) so the check can compare icon sets by their edge maps: a recoloured copy of
// another theme's pack has a different file hash but the same edges.
function readPng(file) {
  const buf = fs.readFileSync(file); let pos = 8; let ihdr; const idat = []; let plte = null; let trns = null;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos + 4, pos + 8); const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') ihdr = { w: data.readUInt32BE(0), h: data.readUInt32BE(4), depth: data[8], color: data[9], interlace: data[12] };
    else if (type === 'IDAT') idat.push(data); else if (type === 'PLTE') plte = data; else if (type === 'tRNS') trns = data;
    pos += 12 + len;
  }
  if (!ihdr || ihdr.depth !== 8 || ihdr.interlace) return null;
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ihdr.color]; if (!ch) return null;
  const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = ihdr.w * ch; const px = Buffer.alloc(stride * ihdr.h);
  for (let y = 0; y < ihdr.h; y++) {
    const ft = raw[y * (stride + 1)]; const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[y * stride + x - ch] : 0; const b = y ? px[(y - 1) * stride + x] : 0; const c = x >= ch && y ? px[(y - 1) * stride + x - ch] : 0;
      let v = row[x];
      if (ft === 1) v += a; else if (ft === 2) v += b; else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  const rgba = Buffer.alloc(ihdr.w * ihdr.h * 4);
  for (let i = 0; i < ihdr.w * ihdr.h; i++) {
    const s = i * ch; let r, g, b, a = 255;
    if (ihdr.color === 6) { r = px[s]; g = px[s + 1]; b = px[s + 2]; a = px[s + 3]; }
    else if (ihdr.color === 2) { r = px[s]; g = px[s + 1]; b = px[s + 2]; }
    else if (ihdr.color === 4) { r = g = b = px[s]; a = px[s + 1]; }
    else if (ihdr.color === 0) { r = g = b = px[s]; }
    else { const k = px[s] * 3; r = plte[k]; g = plte[k + 1]; b = plte[k + 2]; if (trns && px[s] < trns.length) a = trns[px[s]]; }
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a;
  }
  return { w: ihdr.w, h: ihdr.h, rgba };
}

function edgeMap(file) {
  const img = readPng(file); if (!img) return null;
  const { w, h, rgba } = img; const e = new Uint8Array(w * h);
  const diff = (i, j) => Math.max(Math.abs(rgba[i] - rgba[j]), Math.abs(rgba[i + 1] - rgba[j + 1]), Math.abs(rgba[i + 2] - rgba[j + 2]), Math.abs(rgba[i + 3] - rgba[j + 3])) > 48;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if ((x + 1 < w && diff(i, i + 4)) || (y + 1 < h && diff(i, i + w * 4))) e[y * w + x] = 1;
  }
  return e;
}

const CORE = ['AddGameIcon', 'UpdateDbIcon', 'DiceIcon', 'SettingsIcon', 'AddonsIcon', 'FullscreenModeIcon', 'AboutPlayniteIcon', 'ExitIcon'];
const SIMILAR = 0.75; // mean edge overlap (Jaccard) over the core icons at or above which two sets count as the same drawing
// Themes that shipped on a generic shared pack (Lucide, Phosphor, Material, Pixel, Icons) before this rule: reported, not failed.
// Give one its own recipe (art/menu-icons.json) and delete it from this list. New themes never go here.
const LEGACY_SHARED = new Set(['Ayywi', 'Chakram', 'Overworld']);

function similarity(a, b) {
  let total = 0;
  for (const k of CORE) {
    let inter = 0; let union = 0; const x = a[k]; const y = b[k];
    for (let i = 0; i < x.length; i++) { if (x[i] | y[i]) union++; if (x[i] & y[i]) inter++; }
    total += union ? inter / union : 1;
  }
  return total / CORE.length;
}

function check() {
  let bad = 0; const exact = new Map(); const maps = new Map();
  for (const t of fs.readdirSync(themesDir).sort()) {
    const mp = path.join(themesDir, t, 'src', 'Media.xaml'); if (!fs.existsSync(mp)) continue;
    const rp = recipePath(t);
    if (fs.existsSync(rp)) {
      const r = loadRecipe(t);
      if (r.badge) { console.log(`${t}: art/menu-icons.json defines a "badge" background plate. Style purely the bare icon itself (docs/themes/menu-icons.md).`); bad++; }
      if (r.gs !== undefined && r.gs < 0.80) { console.log(`${t}: art/menu-icons.json has gs=${r.gs} (< 0.80). Bare icons must fill their 15-16px slot (docs/themes/menu-icons.md).`); bad++; }
    }
    const media = fs.readFileSync(mp, 'utf8');
    const icons = {}; for (const m of media.matchAll(/<sys:String x:Key="([A-Za-z]+Icon)">(Images\/[^<]+\.png)</g)) icons[m[1]] = m[2];
    const nearest = new Set();
    for (const m of media.matchAll(/<BitmapImage x:Key="([A-Za-z]+Icon)" UriSource="\{ThemeFile '(Images\/[^']+\.png)'\}"([^>]*)\/>/g)) {
      icons[m[1]] = m[2]; if (/BitmapScalingMode="NearestNeighbor"/.test(m[3])) nearest.add(m[1]);
    }
    if (fs.existsSync(rp) && loadRecipe(t).pixel && CORE.some((k) => icons[k] && !nearest.has(k))) {
      console.log(`${t}: pixel recipe, but its menu icons are not NearestNeighbor BitmapImages (smeared at 125%/175% scaling); run render-menu-icons.mjs ${t} (docs/themes/menu-icons.md).`); bad++;
    }
    const missingKeys = CORE.filter((k) => !icons[k]);
    if (missingKeys.length) { console.log(`${t}: stock icofont menu icons (${missingKeys.join(', ')}); write art/menu-icons.json and run render-menu-icons.mjs ${t}`); bad++; continue; }
    const he = crypto.createHash('md5'); let missing = null;
    for (const k of Object.keys(icons).sort()) {
      const p = path.join(themesDir, t, 'src', icons[k]);
      if (!fs.existsSync(p)) { missing = icons[k]; break; }
      he.update(k).update(fs.readFileSync(p));
    }
    if (missing) { console.log(`${t}: ${missing} is missing`); bad++; continue; }
    const e = he.digest('hex');
    if (exact.has(e)) { console.log(`${t}: byte-identical menu icons to ${exact.get(e)}.`); bad++; } else exact.set(e, t);
    const em = {}; let ok = true;
    for (const k of CORE) { em[k] = edgeMap(path.join(themesDir, t, 'src', icons[k])); if (!em[k]) ok = false; }
    if (ok) maps.set(t, em);
  }
  const names = [...maps.keys()]; const legacy = [];
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
    const s = similarity(maps.get(names[i]), maps.get(names[j]));
    if (s < SIMILAR) continue;
    if (LEGACY_SHARED.has(names[i]) && LEGACY_SHARED.has(names[j])) legacy.push(`${names[i]} ~ ${names[j]}`);
    else { console.log(`${names[i]} and ${names[j]} draw nearly the same menu icons (${s.toFixed(2)} edge overlap, limit ${SIMILAR}). Each theme draws its own set (docs/themes/menu-icons.md).`); bad++; }
  }
  if (legacy.length) console.log(`Legacy themes still sharing a generic pack: ${legacy.length} pair(s), allowed until they get recipes.`);
  console.log(bad ? `${bad} problem(s).` : 'Every theme has its own bare menu icon set.');
  process.exit(bad ? 1 : 0);
}

if (flags.has('--check')) check();
const browser = await launchBrowser();
try {
  for (const t of names) { await renderTheme(browser, t); console.log(`rendered ${t}`); }
  if (flags.has('--sheet')) {
    for (let i = 0; i < names.length; i += 8) console.log('sheet', await sheet(browser, names.slice(i, i + 8), names.length > 8 ? `batch-${i / 8 + 1}` : names.join('-')));
  }
} finally { await browser.close(); }
