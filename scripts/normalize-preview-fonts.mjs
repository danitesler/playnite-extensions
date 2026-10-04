// One-off / repeatable cleanup of font stacks in theme previews (art/preview-*.html).
//   node scripts/normalize-preview-fonts.mjs [ThemeDir...]   (default: every theme)
// Drops names the theme never uses and that resolve to an installed font (system-ui, Inter, Roboto, ...), and makes sure
// every font-family declaration names at least one bundled family (scripts/data/fonts.json), so renders are the same on
// any machine. Declarations that use var(--token) are left alone.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const reg = JSON.parse(fs.readFileSync(path.join(here, 'data', 'fonts.json'), 'utf8'));
const known = new Set([...Object.keys(reg.families), ...Object.keys(reg.aliases)].map((n) => n.toLowerCase()));
const DROP = new Set(['system-ui', '-apple-system', 'blinkmacsystemfont', 'inter', 'roboto', 'roboto condensed', 'geist', 'helvetica neue', 'helvetica', 'dejavu sans condensed', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'sf pro text', 'sf mono']);
const GENERIC = new Set(['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy']);

const bare = (n) => n.trim().replace(/^["']|["']$/g, '');
const split = (v) => v.split(',').map((x) => x.trim()).filter(Boolean);

function fix(value) {
  if (/var\(|&quot;|!important/.test(value)) return value;
  const names = split(value);
  const kept = names.filter((n) => !DROP.has(bare(n).toLowerCase()));
  if (!kept.some((n) => known.has(bare(n).toLowerCase()))) {
    const generic = kept.find((n) => GENERIC.has(bare(n).toLowerCase()));
    const lead = generic === 'serif' ? '"Georgia"' : generic === 'monospace' ? '"Consolas"' : '"Segoe UI"';
    kept.unshift(lead);
  }
  // generics only as the last resort
  const named = kept.filter((n) => !GENERIC.has(bare(n).toLowerCase()));
  const gen = kept.filter((n) => GENERIC.has(bare(n).toLowerCase()));
  return [...named, ...gen.slice(0, 1)].join(', ');
}

const dirs = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync('src/themes').map((d) => path.join('src/themes', d));
let total = 0;
for (const dir of dirs) {
  const art = path.join(dir, 'art');
  if (!fs.existsSync(art)) continue;
  for (const f of fs.readdirSync(art).filter((x) => /^preview-.*\.html$/.test(x))) {
    const file = path.join(art, f);
    const html = fs.readFileSync(file, 'utf8');
    let n = 0;
    const rewrite = (re) => (seg) => seg.replace(re, (m, pre, val) => {
      const out = fix(val.trim());
      if (out === val.trim()) return m;
      n++;
      return pre + out;
    });
    // <style> blocks may quote family names with "..."; inline style="..." attributes use '...' and end at the next ".
    const inStyle = rewrite(/(font-family\s*:\s*)((?:"[^"]*"|'[^']*'|[^;}"'])+)/g);
    const inline = rewrite(/(font-family\s*:\s*)([^;}"]+)/g);
    const next = html.split(/(<style[\s\S]*?<\/style>)/).map((seg) => (seg.startsWith('<style') ? inStyle(seg) : inline(seg))).join('');
    if (next !== html) { fs.writeFileSync(file, next); total += n; console.log(`${file}: ${n} declarations`); }
  }
}
console.log(`${total} declarations changed`);
