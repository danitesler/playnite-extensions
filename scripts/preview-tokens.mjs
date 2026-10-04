// Keeps a theme's HTML previews tied to its design tokens (src/themes/<Name>/src/tokens.css).
//   node scripts/preview-tokens.mjs check <ThemeDir>   report preview colors that are not tokens (drift)
//   node scripts/preview-tokens.mjs link  <ThemeDir>   rewrite hex colors that equal a token into var(--token)
// render-theme-preview.mjs imports tokenStyle() so var(--token) resolves at render time.
// Tokens are read the way theme-tools.ps1 Read-ThemeTokens does: :root and @theme blocks are the base, blocks whose
// selector mentions "dark" override them. Colors are resolved by Chromium, so oklch(), rgb(), var() chains all work.
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

function findBrowser() {
  if (process.env.CHROMIUM && fs.existsSync(process.env.CHROMIUM)) return process.env.CHROMIUM;
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/opt/pw-browsers/chromium'
  ];
  return candidates.find((c) => fs.existsSync(c));
}

// Shared by the renderer and the token checks. Set CHROMIUM to a browser executable if Playwright cannot find one.
export async function launchBrowser() {
  const { chromium } = createRequire(import.meta.url)('playwright');
  const executablePath = findBrowser();
  return chromium.launch(executablePath ? { executablePath } : { channel: 'chrome' });
}

// @font-face rules for the bundled open fonts (scripts/data/fonts.json, files in scripts/fonts/): the real families under
// their own names, plus the Windows / commercial names (Segoe UI, Bahnschrift, Georgia, ...) drawn with their stand-in, so a
// preview renders the same on any machine. Set PREVIEW_SYSTEM_FONTS=1 to skip the aliases and use the installed fonts.
export function fontFaceCss() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const reg = JSON.parse(fs.readFileSync(path.join(here, 'data', 'fonts.json'), 'utf8'));
  const sections = process.env.PREVIEW_SYSTEM_FONTS ? [reg.families] : [reg.families, reg.aliases];
  const rules = [];
  for (const section of sections) {
    for (const [name, def] of Object.entries(section)) {
      for (const face of def.faces) {
        const url = pathToFileURL(path.join(here, 'fonts', face.file)).href;
        rules.push(`@font-face{font-family:"${name}";src:url("${url}");font-weight:${face.weight};font-style:${face.style};font-display:block}`);
      }
    }
  }
  // Icon glyphs (arrows, shapes, dingbats): a symbol face next to each real face, with the SAME weight and style, so the
  // browser composites them as one face. (A symbol face with its own weight range would win the weight match for the whole
  // family and push every letter to an installed font.)
  const sym = reg.symbolFallback;
  if (sym) {
    const url = pathToFileURL(path.join(here, 'fonts', sym.file)).href;
    const seen = new Set();
    for (const section of sections) {
      for (const [name, def] of Object.entries(section)) {
        for (const face of def.faces) {
          const key = `${name}|${face.weight}|${face.style}`;
          if (seen.has(key)) continue;
          seen.add(key);
          rules.push(`@font-face{font-family:"${name}";src:url("${url}");font-weight:${face.weight};font-style:${face.style};unicode-range:${sym.unicodeRange};font-display:block}`);
        }
      }
    }
  }
  // Form controls do not inherit font-family by default and would draw in the system UI font. :where() keeps this at zero
  // specificity, so a preview that styles its own buttons still wins.
  rules.push(':where(button,input,select,textarea){font-family:inherit}');
  return rules.join('');
}

export function readTokens(themeDir) {
  const file = path.join(themeDir, 'src', 'tokens.css');
  if (!fs.existsSync(file)) return new Map();
  const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const base = new Map();
  const dark = new Map();
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].split(';').pop().trim();
    let target = null;
    if (/dark/i.test(selector)) target = dark;
    else if (/(^|,)\s*:root\b/.test(selector) || /^@theme\b/.test(selector)) target = base;
    if (!target) continue;
    for (const d of m[2].matchAll(/--([A-Za-z0-9_-]+)\s*:\s*([^;]+);?/g)) target.set(d[1], d[2].trim());
  }
  for (const [k, v] of dark) base.set(k, v);
  return base;
}

// A flat :root block (dark overrides applied) for injecting into a preview page.
export function tokenStyle(themeDir) {
  const tokens = readTokens(themeDir);
  if (tokens.size === 0) return '';
  return ':root{' + [...tokens].map(([k, v]) => `--${k}:${v};`).join('') + '}';
}

const HEX = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g;

function normalizeHex(h) {
  h = h.toLowerCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return h;
}

// token name -> opaque "rrggbb", for every token Chromium resolves to a color.
async function resolveColors(themeDir) {
  const style = tokenStyle(themeDir);
  const out = new Map();
  if (!style) return out;
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(`<style>${style}</style><div id=p style="color:rgb(1,2,3)"><i id=e></i></div>`);
    const names = [...readTokens(themeDir).keys()];
    // getComputedStyle keeps oklch()/color() as written, so paint each one to a canvas pixel and read back sRGB.
    const resolved = await page.evaluate((list) => {
      const e = document.getElementById('e');
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      return list.map((n) => {
        e.style.color = `var(--${n})`;
        const computed = getComputedStyle(e).color;
        if (computed === 'rgb(1, 2, 3)') return [n, null];
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = '#010203';
        ctx.fillStyle = computed;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return [n, a === 255 ? [r, g, b] : null];
      });
    }, names);
    for (const [n, rgb] of resolved) {
      if (rgb) out.set(n, rgb.map((x) => x.toString(16).padStart(2, '0')).join(''));
    }
  } finally {
    await browser.close();
  }
  return out;
}

function previewFiles(themeDir) {
  const art = path.join(themeDir, 'art');
  if (!fs.existsSync(art)) return [];
  return fs.readdirSync(art).filter((f) => /^preview-.*\.html$/.test(f)).map((f) => path.join(art, f));
}

// Hex literals that are real CSS colors: not attribute values (fill="#...", href="#...") and not url(#id).
function* colorLiterals(html) {
  for (const m of html.matchAll(HEX)) {
    const before = html.slice(Math.max(0, m.index - 3), m.index);
    if (/=["']?$/.test(before) || /\($/.test(before)) continue;
    yield m;
  }
}

async function main() {
  const [cmd, themeArg] = process.argv.slice(2);
  if (!['check', 'link'].includes(cmd) || !themeArg) {
    console.error('usage: preview-tokens.mjs <check|link> <ThemeDir>');
    process.exit(1);
  }
  const themeDir = path.resolve(themeArg);
  const files = previewFiles(themeDir);
  if (files.length === 0) { console.log('no previews'); return; }
  const colors = await resolveColors(themeDir);
  if (colors.size === 0) { console.log('no resolvable color tokens in src/tokens.css'); return; }

  // hex -> first token (declaration order) that resolves to it.
  const byHex = new Map();
  for (const [name, hex] of colors) if (!byHex.has(hex)) byHex.set(hex, name);

  for (const file of files) {
    const rel = path.basename(file);
    const html = fs.readFileSync(file, 'utf8');
    if (cmd === 'link') {
      let n = 0;
      const next = html.replace(HEX, (lit, _g, offset) => {
        const before = html.slice(Math.max(0, offset - 3), offset);
        if (/=["']?$/.test(before) || /\($/.test(before)) return lit;
        const name = byHex.get(normalizeHex(lit.slice(1)));
        if (!name || lit.length === 9) return lit;
        // A preview alias such as "--accent: #fff" must not become "--accent: var(--accent)".
        if (new RegExp(`--${name}\\s*:\\s*$`).test(html.slice(Math.max(0, offset - name.length - 12), offset))) return lit;
        n++;
        return `var(--${name})`;
      });
      if (next !== html) fs.writeFileSync(file, next);
      console.log(`${rel}: linked ${n} colors`);
      continue;
    }
    const seen = new Map();
    for (const m of colorLiterals(html)) {
      if (m[1].length === 8) continue;
      const hex = normalizeHex(m[1]);
      seen.set(hex, (seen.get(hex) || 0) + 1);
    }
    const stray = [...seen].filter(([hex]) => !byHex.has(hex)).sort((a, b) => b[1] - a[1]);
    const linked = (html.match(/var\(--[A-Za-z0-9_-]+/g) || []).length;
    const total = [...seen.values()].reduce((a, b) => a + b, 0);
    console.log(`${rel}: ${linked} var(--token) uses, ${total} hex literals (${seen.size - stray.length}/${seen.size} distinct are tokens)`);
    if (stray.length) console.log(`  not in tokens.css: ${stray.slice(0, 8).map(([h, c]) => `#${h}${c > 1 ? `×${c}` : ''}`).join(' ')}${stray.length > 8 ? ' …' : ''}`);
    // Fonts: every name in a font-family stack should be bundled (scripts/data/fonts.json), or the render depends on the machine.
    const reg = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'fonts.json'), 'utf8'));
    const bundled = new Set([...Object.keys(reg.families), ...Object.keys(reg.aliases)].map((n) => n.toLowerCase()));
    const generic = new Set(['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'inherit', 'initial']);
    const unknown = new Set();
    for (const m of html.replace(/&quot;/g, "'").matchAll(/font-family\s*:\s*((?:"[^"]*"|'[^']*'|[^;}"'])+)/g)) {
      if (/var\(/.test(m[1])) continue;
      for (const n of m[1].split(',')) {
        const name = n.trim().replace(/^["']|["']$/g, '');
        if (name && !generic.has(name.toLowerCase()) && !bundled.has(name.toLowerCase())) unknown.add(name);
      }
    }
    if (unknown.size) console.log(`  fonts not bundled (rendered with an installed font): ${[...unknown].join(', ')}`);
    if (/system-ui|-apple-system/.test(html)) console.log('  system-ui in a font stack: renders with whatever the machine has; use the theme\'s font tokens');
    if (seen.has('6366f1') && !byHex.has('6366f1')) console.log('  scaffold default accent #6366f1 is still in this preview');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
